/**
 * Le conseiller IA du calculateur (direction A, choisie par Paul le 05/11/2026).
 *
 * La page Calculateur s'ouvre sur une conversation : le visiteur dit ce qu'il vend et ce qu'il
 * veut obtenir, l'IA pose deux ou trois questions, puis compose le devis en choisissant les
 * services et en répondant aux questions du calculateur. **Les montants sont calculés ici, par
 * le moteur (`devis()`), jamais par le modèle** : l'application refuse toute réponse qui en
 * contient un. Le visiteur ajuste en parlant (« plus petit », « pourquoi LinkedIn ? »).
 *
 * Serveur : `POST academy.mydigipal.com/api/academy/public/question/composer` (dépôt
 * mydigipal-academy, `calculateur-ia.ts`), qui lit `/calculateur-catalogue.json` du site.
 * IA indisponible (budget, panne, interrupteur) : on le dit, et le calculateur classique prend
 * le relais. « Recevoir ce devis » passe le plan au calculateur classique, sur sa page de
 * résultat, avec l'audit prérempli par ce que le visiteur a dit.
 *
 * Maquette validée : https://claude.ai/artifact/2steZLd6kxCNzGazuEJqGB
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Currency } from '../calculator/types';
import { track } from '../calculator/tracking';
import { affiche, channelsOf, decodePlan, devis, domainName, encodePlan, inOrder, perLabel, t, type Answers, type Lang, type QuoteState } from './engine';

const ADRESSE = 'https://academy.mydigipal.com/api/academy/public/question/composer';

interface Tour {
  auteur: 'visiteur' | 'ia';
  texte: string;
}

interface ReponseServeur {
  message: string;
  choix: string[];
  plan: { domains: string[]; answers: Answers; duration: number } | null;
  raisons: Record<string, string>;
  resume: { clients: string; fonctionne: string; priorite: string };
  humain: boolean;
}

export interface RemiseConseiller {
  st: QuoteState;
  currency: Currency;
  audit: { clients: string; works: string; priority: string };
}

interface Props {
  lang: Lang;
  currency: Currency;
  /** Le visiteur préfère choisir lui-même, ou l'IA n'est pas disponible. */
  onClassique: () => void;
  /** « Recevoir ce devis » ou « Modifier à la main » : le calculateur classique reprend le devis. */
  onRemettre: (r: RemiseConseiller) => void;
}

const L = (lang: Lang, fr: string, en: string) => (lang === 'fr' ? fr : en);

const DEPARTS: Record<Lang, string[]> = {
  fr: ['Plus de demandes de contact B2B', 'Je suis concessionnaire', 'Former mes équipes à l’IA', 'Plus de ventes en ligne', 'Des visuels publicitaires'],
  en: ['More B2B leads', 'I run car dealerships', 'Train my team on AI', 'More online sales', 'Ad creatives'],
};

const ACCUEIL: Record<Lang, string> = {
  fr: 'Bonjour. Dites-moi ce que vous vendez et ce que vous voulez obtenir. Je compose le devis avec vous ; les prix viennent de nos grilles, jamais de moi.',
  en: 'Hello. Tell me what you sell and what you want to achieve. I build the quote with you; the prices come from our rate cards, never from me.',
};

const Etincelle = ({ taille = 16 }: { taille?: number }) => (
  <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
  </svg>
);
const Fleche = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const RESEAUX: Record<string, string> = { linkedin: 'LinkedIn', meta: 'Meta', tiktok: 'TikTok', reddit: 'Reddit' };

/** Le nom d'un service dans la conversation : ce que le visiteur comprend, pas le nom de l'offre. */
function nomService(d: QuoteState['domains'][number], st: QuoteState, lang: Lang): string {
  if (d === 'paid-social') {
    const r = channelsOf(st.answers).map((c) => RESEAUX[c] ?? c);
    if (r.length) {
      const liste = r.length > 1 ? `${r.slice(0, -1).join(', ')} ${L(lang, 'et', 'and')} ${r[r.length - 1]}` : r[0];
      return L(lang, `Publicité ${liste}`, `${liste} ads`);
    }
  }
  if (d === 'tracking-reporting') return L(lang, 'Mesure des résultats', 'Results tracking');
  return domainName(d, lang);
}

/** Le plan du serveur, repassé par le décodeur du calculateur : seules les clés connues restent. */
function versEtat(p: NonNullable<ReponseServeur['plan']>): QuoteState | null {
  const brut = { domains: inOrder(p.domains as QuoteState['domains']), answers: p.answers, discuss: {}, duration: p.duration } as QuoteState;
  return brut.domains.length ? decodePlan(encodePlan(brut)) : null;
}

export default function Conseiller({ lang, currency, onClassique, onRemettre }: Props) {
  const [tours, setTours] = useState<Tour[]>([{ auteur: 'ia', texte: ACCUEIL[lang] }]);
  const [choix, setChoix] = useState<string[]>(DEPARTS[lang]);
  const [st, setSt] = useState<QuoteState | null>(null);
  const [precedent, setPrecedent] = useState<QuoteState | null>(null);
  const [raisons, setRaisons] = useState<Record<string, string>>({});
  const [resume, setResume] = useState({ clients: '', fonctionne: '', priorite: '' });
  const [attente, setAttente] = useState(false);
  const [indispo, setIndispo] = useState(false);
  const [humain, setHumain] = useState(false);
  const [saisie, setSaisie] = useState('');
  const fin = useRef<HTMLDivElement>(null);
  const premier = useRef(true);

  const q = useMemo(() => (st ? devis(st, currency) : null), [st, currency]);
  const qAvant = useMemo(() => (precedent ? devis(precedent, currency) : null), [precedent, currency]);
  const fmt = (v: number) => affiche(v, currency, lang);
  const retires = precedent && st ? precedent.domains.filter((d) => !st.domains.includes(d)) : [];
  const ecart = q && qAvant ? q.monthly - qAvant.monthly : 0;

  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    fin.current?.scrollIntoView({ block: 'nearest' });
  }, [tours, attente]);

  const devisAffiche = () =>
    q && st
      ? {
          devise: currency,
          mensuel: q.monthly,
          unique: q.oneOff,
          media: q.media,
          duree: st.duration,
          lignes: q.domains.flatMap((d) => d.lines.map((l) => ({ service: d.domain, libelle: t(l.label, lang), montant: l.amount, par: l.per }))),
        }
      : null;

  const envoyer = async (texte: string) => {
    const propre = texte.trim().slice(0, 400);
    if (!propre || attente) return;
    const suite: Tour[] = [...tours, { auteur: 'visiteur', texte: propre }];
    setTours(suite);
    setSaisie('');
    setChoix([]);
    setAttente(true);
    track('calculator_advisor_message', { advisor_turn: suite.filter((x) => x.auteur === 'visiteur').length });
    try {
      const r = await fetch(ADRESSE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, tours: suite, devis: devisAffiche() }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as ReponseServeur;
      if (j.plan) {
        const nouvel = versEtat(j.plan);
        if (nouvel) {
          setPrecedent(st);
          setSt(nouvel);
          setRaisons(j.raisons || {});
          track('calculator_advisor_plan', { advisor_services: nouvel.domains.join(','), calculator_total: devis(nouvel, currency).totalFees, currency });
        }
      }
      if (j.resume) setResume((a) => ({ clients: j.resume.clients || a.clients, fonctionne: j.resume.fonctionne || a.fonctionne, priorite: j.resume.priorite || a.priorite }));
      setHumain(!!j.humain);
      setTours((x) => [...x, { auteur: 'ia', texte: j.message || L(lang, 'Voici le devis, à côté.', 'Here is the quote, alongside.') }]);
      setChoix(Array.isArray(j.choix) ? j.choix.slice(0, 4) : []);
    } catch {
      setIndispo(true);
      setTours((x) => [
        ...x,
        { auteur: 'ia', texte: L(lang, 'Je ne suis pas disponible pour le moment. Choisissez vos services : le calculateur fait le reste.', 'I am not available right now. Pick your services: the calculator does the rest.') },
      ]);
    } finally {
      setAttente(false);
    }
  };

  const remettre = () => {
    if (!st) return;
    onRemettre({ st, currency, audit: { clients: resume.clients, works: resume.fonctionne, priority: resume.priorite } });
  };

  const remettreService = (d: QuoteState['domains'][number]) => {
    if (!st || !precedent) return;
    const answers: Answers = { ...st.answers };
    for (const [k, v] of Object.entries(precedent.answers)) if (!(k in answers)) answers[k] = v;
    setPrecedent(st);
    setSt({ ...st, domains: inOrder([...st.domains, d]), answers });
  };

  const ecrireAPaul = () => window.dispatchEvent(new CustomEvent('mdp-assistant:open', { detail: { mode: 'normal' } }));

  const bulleIa = 'rounded-[4px_18px_18px_18px] border border-slate-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-encre';
  const puce = 'min-h-[44px] rounded-full border border-[#c9dcef] bg-white px-4 text-[14px] font-medium text-encre transition-colors hover:border-marque hover:bg-marque-doux disabled:opacity-50';

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-start" data-sans-cta-flottant>
      {/* La conversation */}
      <section aria-label={L(lang, 'La conversation', 'The conversation')} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-marque text-white"><Etincelle /></span>
          <span className="text-[13px] font-semibold text-[#3a4a5c]">
            {L(lang, 'Assistant MyDigipal', 'MyDigipal assistant')} <span className="font-normal">{L(lang, '· une IA, relue par l’équipe', '· an AI, checked by the team')}</span>
          </span>
        </div>

        <div className="flex flex-col gap-3" aria-live="polite">
          {tours.map((x, n) =>
            x.auteur === 'visiteur' ? (
              <div key={n} className="max-w-[85%] self-end whitespace-pre-line rounded-[18px_18px_4px_18px] bg-marque px-4 py-3 text-[15px] leading-relaxed text-white">{x.texte}</div>
            ) : (
              <div key={n} className={`max-w-[92%] self-start whitespace-pre-line ${bulleIa}`}>{x.texte}</div>
            )
          )}
          {attente && (
            <div className="flex items-center gap-2 self-start text-[14px] text-[#3a4a5c]">
              <span className="inline-flex gap-1" aria-hidden="true">
                <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-marque" />
                <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-marque-clair [animation-delay:150ms]" />
                <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-[#c9dcef] [animation-delay:300ms]" />
              </span>
              {st ? L(lang, 'Je mets le devis à jour…', 'Updating the quote…') : L(lang, 'Je réfléchis…', 'Thinking…')}
            </div>
          )}
          <div ref={fin} />
        </div>

        {!attente && !indispo && choix.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {choix.map((c) => (
              <button key={c} type="button" className={puce} onClick={() => void envoyer(c)}>{c}</button>
            ))}
          </div>
        )}

        {humain && (
          <button type="button" onClick={ecrireAPaul} className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-encre px-5 text-[14px] font-semibold text-white">
            {L(lang, 'Écrire à Paul', 'Message Paul')} <Fleche />
          </button>
        )}

        {indispo ? (
          <button type="button" onClick={onClassique} className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-marque px-6 text-[15px] font-semibold text-white">
            {L(lang, 'Choisir mes services', 'Pick my services')} <Fleche />
          </button>
        ) : (
          <form
            className="mt-5 flex items-end gap-2 rounded-[22px] border-[1.5px] border-marque bg-white py-1.5 pl-4 pr-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              void envoyer(saisie);
            }}
          >
            <label htmlFor="conseiller-saisie" className="sr-only">{L(lang, 'Votre message', 'Your message')}</label>
            <textarea
              id="conseiller-saisie"
              rows={2}
              maxLength={400}
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void envoyer(saisie);
                }
              }}
              placeholder={st
                ? L(lang, 'Ex. : et si on commence plus petit ?', 'E.g. what if we start smaller?')
                : L(lang, 'Ex. : on vend un logiciel aux PME, on veut plus de démos', 'E.g. we sell software to SMEs and want more demos')}
              className="min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-[15px] leading-snug text-encre outline-none placeholder:text-slate-400"
            />
            <button type="submit" disabled={attente || !saisie.trim()} aria-label={L(lang, 'Envoyer', 'Send')} className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-marque text-white disabled:opacity-40">
              <Fleche />
            </button>
          </form>
        )}

        {!indispo && (
          <button type="button" onClick={onClassique} className="mt-3 min-h-[44px] text-[14px] font-medium text-marque underline-offset-4 hover:underline">
            {L(lang, 'Je préfère choisir les services moi-même', 'I’d rather pick the services myself')}
          </button>
        )}
      </section>

      {/* Le devis, calculé par le moteur */}
      <aside aria-label={L(lang, 'Le devis', 'The quote')} className="min-w-0 lg:sticky lg:top-[88px]">
        {!q || !st ? (
          <div className="hidden rounded-3xl border border-dashed border-[#c9dcef] bg-white/60 p-6 text-[15px] leading-relaxed text-[#3a4a5c] lg:block">
            <p className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-encre">{L(lang, 'Votre devis se compose ici', 'Your quote builds here')}</p>
            <p className="mt-2">{L(lang, 'Après deux ou trois questions, les services et leurs prix s’affichent ici. Chaque montant vient du calculateur.', 'After two or three questions, the services and their prices appear here. Every amount comes from the calculator.')}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="bg-encre px-5 py-5 text-white">
              <p className="text-[13px] text-[#b9c7da]">{L(lang, 'Nos honoraires, par mois', 'Our fees, per month')}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-[44px] font-extrabold leading-none tracking-[-0.03em]">{fmt(q.monthly)}</span>
                {ecart !== 0 && (
                  <span className={`text-[14px] font-semibold ${ecart < 0 ? 'text-green-300' : 'text-marque-clair'}`}>
                    {ecart < 0 ? L(lang, `${fmt(-ecart)} de moins par mois`, `${fmt(-ecart)} less per month`) : L(lang, `${fmt(ecart)} de plus par mois`, `${fmt(ecart)} more per month`)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[13px] text-[#b9c7da]">
                {q.oneOff > 0 && <>{L(lang, `+ ${fmt(q.oneOff)} de mise en place, une fois · `, `+ ${fmt(q.oneOff)} one-off setup · `)}</>}
                {L(lang, `engagement de ${st.duration} mois`, `${st.duration}-month term`)}
              </p>
            </div>

            <ul className="divide-y divide-[#edf1f6]">
              {q.domains.map((d) => {
                const mensuel = d.monthly;
                const unique = d.oneOff;
                return (
                  <li key={d.domain} className="px-5 py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[16px] font-semibold text-encre">{nomService(d.domain, st, lang)}</span>
                      <span className="whitespace-nowrap text-[16px] font-semibold text-encre">
                        {mensuel > 0 ? <>{fmt(mensuel)}<span className="text-[13px] font-normal text-[#3a4a5c]">{perLabel('month', lang)}</span></> : unique > 0 ? <>{fmt(unique)}<span className="text-[13px] font-normal text-[#3a4a5c]">{perLabel('once', lang)}</span></> : L(lang, 'sur devis', 'on quote')}
                      </span>
                    </div>
                    {mensuel > 0 && unique > 0 && <p className="mt-1 text-[13px] text-[#3a4a5c]">{L(lang, `+ ${fmt(unique)} une fois`, `+ ${fmt(unique)} one-off`)}</p>}
                    {raisons[d.domain] && <p className="mt-1.5 text-[14px] leading-relaxed text-[#334155]">{raisons[d.domain]}</p>}
                    {d.media > 0 && <p className="mt-1 text-[13px] text-[#3a4a5c]">{L(lang, `Publicité conseillée : ${fmt(d.media)}/mois, versée aux plateformes`, `Suggested ad spend: ${fmt(d.media)}/mo, paid to the platforms`)}</p>}
                  </li>
                );
              })}
              {retires.map((d) => (
                <li key={`r-${d}`} className="flex items-center justify-between gap-3 px-5 py-3 text-slate-500">
                  <span className="line-through">{precedent ? nomService(d, precedent, lang) : domainName(d, lang)}</span>
                  <button type="button" onClick={() => remettreService(d)} className="min-h-[36px] rounded-full border border-[#c9dcef] px-3 text-[13px] font-medium text-marque">
                    {L(lang, 'Remettre', 'Add back')}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex justify-between gap-3 bg-brume-clair px-5 py-3 text-[14px]">
              <span className="text-[#334155]">{L(lang, `Sur ${st.duration} mois, honoraires et mise en place`, `Over ${st.duration} months, fees and setup`)}</span>
              <span className="font-semibold text-encre">{fmt(q.totalFees)}</span>
            </div>

            <div className="flex flex-col gap-2 p-5">
              <button type="button" onClick={remettre} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-marque px-6 text-[15px] font-semibold text-white hover:bg-marque-fonce">
                {L(lang, 'Recevoir ce devis', 'Get this quote')} <Fleche />
              </button>
              <button type="button" onClick={remettre} className="min-h-[44px] text-[14px] font-medium text-marque underline-offset-4 hover:underline">
                {L(lang, 'Modifier à la main dans le calculateur', 'Edit it by hand in the calculator')}
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Au téléphone, le total et le bouton restent à portée pendant la conversation. */}
      {q && st && (
        <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 pb-4 pt-3 lg:hidden">
          <div className="flex flex-col">
            <span className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-encre">
              {fmt(q.monthly)}<span className="text-[13px] font-normal text-[#3a4a5c]">{perLabel('month', lang)}</span>
            </span>
            {q.media > 0 && <span className="text-[12px] text-[#3a4a5c]">{L(lang, `+ ${fmt(q.media)}/mois de publicité`, `+ ${fmt(q.media)}/mo in ad spend`)}</span>}
          </div>
          <button type="button" onClick={remettre} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-marque px-5 text-[15px] font-semibold text-white">
            {L(lang, 'Recevoir ce devis', 'Get this quote')} <Fleche />
          </button>
        </div>
      )}
    </div>
  );
}
