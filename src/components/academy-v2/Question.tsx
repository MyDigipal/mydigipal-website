import { useEffect, useMemo, useRef, useState } from 'react';
import type { Devise, Jour30Data, Locale } from '../academy/data';
import { paramGarde, trackQuestion } from '../academy/track';
import { faqVente, questionCopy } from './question-copy';

/**
 * « Une question ? », le panneau où Paul répond (15/09/2026).
 *
 * Paul : « un petit encart où les personnes peuvent faire un chat, et moi, je
 * reçois le message directement dans mon Gmail ». Direction A du labo, retenue
 * le même jour : sa photo en pastille, une bulle à la première personne, les
 * réponses comme des messages. Mesuré avant de le construire : 98,5 % des
 * visiteurs de la page repartaient sans ouvrir le tunnel, sans rien laisser.
 *
 * Trois règles, et elles tiennent le composant :
 *   - il n'apparaît qu'une fois la grille de tarifs à l'écran, ou au bout d'une
 *     minute sur la page ; la bulle ne se montre qu'une fois par visite, et le
 *     panneau ne s'ouvre JAMAIS tout seul ;
 *   - la FAQ est écrite, aucun modèle ne répond : ce qui part est une vraie
 *     question, et elle part à Paul, qui répond par courriel ;
 *   - aucun chiffre n'est écrit à la main (voir `question-copy.ts`).
 *
 * ⚠️ Sous `lg`, le coin bas droit est déjà pris par « Commencer »
 * (`AppelFlottant`, `bottom-4`, 48 px). La pastille se pose au-dessus, jamais
 * par-dessus : deux boutons empilés sous le pouce se lisent, deux boutons
 * superposés se ratent.
 */

const PHOTO = '/images/team/Team_Paul_Andre.webp';
const ENDPOINT = 'https://academy.mydigipal.com/api/academy/public/question';
const CLE_BULLE = 'academy_question_bulle';

type Vue = 'liste' | 'reponse' | 'form' | 'envoye';

export default function Question({
  locale,
  devise,
  data,
  modulesAuto,
  ancreTarifs = 'tarifs',
}: {
  locale: Locale;
  devise: Devise;
  data: Jour30Data;
  modulesAuto: number;
  ancreTarifs?: string;
}) {
  const c = questionCopy(locale);
  const faq = useMemo(() => faqVente(locale, data, devise, modulesAuto), [locale, data, devise, modulesAuto]);
  // L'espace avant ? ! : ; est insécable en français : sans lui, le signe passe
  // seul à la ligne dans une bulle étroite.
  const nb = (s: string) => (locale === 'fr' ? s.replace(/ ([?!:;%])/g, ' $1') : s);

  const [visible, setVisible] = useState(false);
  const [bulle, setBulle] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const [vue, setVue] = useState<Vue>('liste');
  const [faqId, setFaqId] = useState<string | null>(null);
  const [lues, setLues] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [piege, setPiege] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const pastille = useRef<HTMLButtonElement>(null);
  const fermerBtn = useRef<HTMLButtonElement>(null);
  const arrivee = useRef(0);
  /** La hauteur du bandeau cookies tant qu'il est à l'écran, zéro ensuite. */
  const [bandeau, setBandeau] = useState(0);

  // L'apparition : la grille de tarifs à l'écran, ou une minute sur la page.
  // ⚠️ `setTimeout` et non `requestAnimationFrame` : un onglet en arrière-plan
  // ne joue pas rAF, et la pastille ne viendrait jamais.
  useEffect(() => {
    arrivee.current = Date.now();
    let fait = false;
    const montrer = () => {
      if (fait) return;
      fait = true;
      setVisible(true);
    };
    const minuterie = window.setTimeout(montrer, 60_000);
    const cible = document.getElementById(ancreTarifs);
    let io: IntersectionObserver | null = null;
    if (cible && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entrees) => {
        if (entrees.some((e) => e.isIntersecting)) montrer();
      }, { rootMargin: '0px 0px -30% 0px' });
      io.observe(cible);
    }
    return () => {
      window.clearTimeout(minuterie);
      io?.disconnect();
    };
  }, [ancreTarifs]);

  // La bulle, une fois par visite, et elle se retire d'elle-même.
  useEffect(() => {
    if (!visible) return;
    let deja = false;
    try {
      deja = sessionStorage.getItem(CLE_BULLE) === '1';
      sessionStorage.setItem(CLE_BULLE, '1');
    } catch {
      /* stockage indisponible : la bulle se montre, c'est sans gravité */
    }
    if (deja) return;
    const a = window.setTimeout(() => setBulle(true), 800);
    const b = window.setTimeout(() => setBulle(false), 15_000);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [visible]);

  // ⚠️ Le bandeau cookies (`#cookie-consent-banner`, `fixed bottom-0 z-50`)
  // recouvrait la pastille et le bas du panneau tant que le visiteur n'avait pas
  // répondu : vu à la mesure le 15/09/2026, 110 px sur téléphone. La pastille se
  // pose donc au-dessus de lui, et revient à sa place dès qu'il se retire. Il se
  // retire par une classe, d'où l'observation de l'attribut.
  useEffect(() => {
    if (!visible) return;
    const b = document.getElementById('cookie-consent-banner');
    if (!b) return;
    const mesurer = () => {
      const r = b.getBoundingClientRect();
      setBandeau(r.height > 0 && r.top < window.innerHeight - 1 ? Math.round(window.innerHeight - r.top) : 0);
    };
    mesurer();
    const mo = new MutationObserver(() => window.setTimeout(mesurer, 350));
    mo.observe(b, { attributes: true, attributeFilter: ['class', 'style'] });
    window.addEventListener('resize', mesurer);
    return () => {
      mo.disconnect();
      window.removeEventListener('resize', mesurer);
    };
  }, [visible]);

  const fermer = () => {
    setOuvert(false);
    window.setTimeout(() => pastille.current?.focus(), 0);
  };

  // Échap ferme, et le focus entre dans le panneau à l'ouverture.
  useEffect(() => {
    if (!ouvert) return;
    fermerBtn.current?.focus();
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
    };
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [ouvert]);

  const ouvrir = (source: 'pastille' | 'bulle') => {
    setOuvert(true);
    setBulle(false);
    setVue('liste');
    setErreur('');
    trackQuestion('open', { question_source: source });
  };

  const lire = (id: string) => {
    setFaqId(id);
    setVue('reponse');
    setLues((l) => (l.includes(id) ? l : [...l, id]));
    trackQuestion('faq', { faq_id: id });
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    if (question.trim().length < 5) return setErreur(c.erreurQuestion);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErreur(c.erreurEmail);
    setErreur('');
    setEnvoi(true);
    try {
      const q = new URLSearchParams(window.location.search);
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          question: question.trim(),
          language: locale,
          surface: 'page',
          page: window.location.pathname,
          faq: lues.map((id) => faq.find((f) => f.id === id)?.q || id),
          devise,
          secondes: Math.round((Date.now() - arrivee.current) / 1000),
          gclid: paramGarde('gclid') || undefined,
          fbclid: paramGarde('fbclid') || undefined,
          utm_source: q.get('utm_source') || undefined,
          utm_medium: q.get('utm_medium') || undefined,
          utm_campaign: q.get('utm_campaign') || undefined,
          website: piege,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setVue('envoye');
      trackQuestion('sent', { faq_lues: lues.length });
    } catch {
      setErreur(c.erreurEnvoi);
    } finally {
      setEnvoi(false);
    }
  };

  if (!visible) return null;

  const choisie = faq.find((f) => f.id === faqId);
  const champ =
    'w-full rounded-bouton border border-filet-nuit bg-salle px-3 py-2.5 text-[15px] leading-[1.45] text-ivoire outline-none transition placeholder:text-brume-nuit focus:border-or';
  const lien = 'self-start py-1.5 text-left text-[14px] font-medium text-or underline-offset-4 hover:underline';

  return (
    <>
      {!ouvert && (
        <div
          className="fixed bottom-[5.5rem] right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
          style={bandeau ? { bottom: `${bandeau + 16}px` } : undefined}
        >
          {bulle && (
            <div
              role="status"
              className="relative max-w-[16rem] rounded-carte rounded-br-[4px] bg-craie py-3 pl-3.5 pr-9 text-encre shadow-[0_12px_32px_-10px_rgba(4,8,18,.65)]"
            >
              <button type="button" onClick={() => ouvrir('bulle')} className="text-left text-[15px] leading-[1.4]">
                {nb(c.bulle)}
                <span className="mt-1 block text-[13px] text-brume">{c.signe}</span>
              </button>
              <button
                type="button"
                aria-label={c.masquer}
                onClick={() => setBulle(false)}
                className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full text-[18px] leading-none text-brume transition hover:text-encre"
              >
                ×
              </button>
            </div>
          )}
          <button
            ref={pastille}
            type="button"
            onClick={() => ouvrir('pastille')}
            aria-label={c.pastilleAria}
            className="h-14 w-14 overflow-hidden rounded-full border-2 border-or bg-salle-2 shadow-[0_10px_30px_-8px_rgba(4,8,18,.75)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <img src={PHOTO} alt="" width={56} height={56} className="h-full w-full object-cover" />
          </button>
        </div>
      )}

      {ouvert && (
        <div
          role="dialog"
          aria-label={c.dialogAria}
          className="fixed inset-x-3 bottom-3 z-[60] flex max-h-[85dvh] flex-col overflow-hidden rounded-carte border border-filet-nuit bg-salle-2 text-corps-nuit shadow-[0_24px_60px_-12px_rgba(4,8,18,.8)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-h-[min(40rem,calc(100dvh-6rem))] sm:w-[24rem]"
        >
          <div className="flex items-center gap-3 border-b border-filet-nuit py-3 pl-4 pr-2">
            <img src={PHOTO} alt="" width={44} height={44} className="h-11 w-11 flex-none rounded-full border border-filet-nuit object-cover" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[16px] font-semibold leading-tight text-ivoire">{c.nom}</p>
              <p className="m-0 text-[13px] leading-snug text-brume-nuit">{c.role}</p>
            </div>
            <button
              ref={fermerBtn}
              type="button"
              onClick={fermer}
              aria-label={c.fermer}
              className="grid h-11 w-11 flex-none place-items-center rounded-full text-[22px] leading-none text-brume-nuit transition hover:text-ivoire focus-visible:outline focus-visible:outline-2 focus-visible:outline-or"
            >
              ×
            </button>
          </div>

          {vue === 'liste' && (
            <>
              <div className="flex flex-col gap-2.5 overflow-y-auto p-4">
                <p className="m-0 max-w-[92%] self-start rounded-carte rounded-tl-[4px] bg-salle-3 px-3.5 py-3 text-[15px] leading-[1.5] text-ivoire">
                  {nb(c.accueil)}
                </p>
                {faq.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => lire(f.id)}
                    className="w-full rounded-bouton border border-filet-nuit px-3.5 py-2.5 text-left text-[15px] leading-[1.35] text-ivoire transition hover:border-or hover:bg-salle-3 active:translate-y-px"
                  >
                    {nb(f.q)}
                  </button>
                ))}
              </div>
              <div className="border-t border-filet-nuit p-4">
                <button
                  type="button"
                  onClick={() => setVue('form')}
                  className="min-h-11 w-full rounded-bouton bg-or text-[15px] font-semibold text-salle transition hover:bg-or-vif"
                >
                  {c.poser}
                </button>
              </div>
            </>
          )}

          {vue === 'reponse' && choisie && (
            <div className="flex flex-col gap-3 overflow-y-auto p-4">
              <p className="m-0 max-w-[85%] self-end rounded-carte rounded-tr-[4px] bg-or px-3.5 py-2.5 text-[15px] leading-[1.4] text-salle">
                {nb(choisie.q)}
              </p>
              <p className="m-0 max-w-[92%] self-start rounded-carte rounded-tl-[4px] bg-salle-3 px-3.5 py-3 text-[15px] leading-[1.55] text-ivoire">
                {nb(choisie.a)}
              </p>
              <button type="button" onClick={() => setVue('form')} className={lien}>
                {c.differente}
              </button>
              <button type="button" onClick={() => setVue('liste')} className={lien}>
                {c.autres}
              </button>
            </div>
          )}

          {vue === 'form' && (
            <form onSubmit={envoyer} className="flex flex-col gap-3 overflow-y-auto p-4" noValidate>
              <label className="flex flex-col gap-1.5 text-[13px] text-corps-nuit">
                {c.labelQuestion}
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={nb(c.exempleQuestion)}
                  rows={4}
                  maxLength={2000}
                  className={`${champ} resize-y`}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-corps-nuit">
                {c.labelEmail}
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.exempleEmail}
                  className={champ}
                />
              </label>
              {/* Le piège à robots : invisible pour un humain, rempli par un robot. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={piege}
                onChange={(e) => setPiege(e.target.value)}
                className="absolute -left-[9999px] h-px w-px opacity-0"
              />
              {erreur && <p className="m-0 text-[13.5px] text-[#f0a39a]">{erreur}</p>}
              <button
                type="submit"
                disabled={envoi}
                aria-busy={envoi}
                className="min-h-11 w-full rounded-bouton bg-or text-[15px] font-semibold text-salle transition hover:bg-or-vif disabled:opacity-60"
              >
                {c.envoyer}
              </button>
              <p className="m-0 text-[12.5px] leading-[1.5] text-brume-nuit">{c.note}</p>
              <button type="button" onClick={() => setVue('liste')} className={lien}>
                {c.retour}
              </button>
            </form>
          )}

          {vue === 'envoye' && (
            <div className="flex flex-col gap-2 p-4">
              <p className="m-0 text-[17px] font-semibold text-ivoire">{c.envoyeTitre}</p>
              <p className="m-0 text-[15px] leading-[1.55] text-corps-nuit">{c.envoyeTexte(email.trim())}</p>
              <button type="button" onClick={() => setVue('liste')} className={lien}>
                {c.retour}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
