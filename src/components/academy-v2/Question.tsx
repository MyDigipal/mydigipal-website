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
 *     question, et elle part à Paul ;
 *   - aucun chiffre n'est écrit à la main (voir `question-copy.ts`).
 *
 * LA CONVERSATION EN DIRECT (même jour, « le niveau 1 et le niveau 2 ») :
 * ouvrir le panneau ouvre un fil dans l'application et prévient Paul dans
 * Google Chat. Le panneau interroge ce fil ; si Paul répond depuis
 * `academy.mydigipal.com/admin/questions`, sa réponse s'affiche ici, et une
 * pastille dorée le signale quand le panneau est fermé. Si la personne est
 * partie, la réponse part par courriel, côté application.
 *
 * ⚠️ Sous `lg`, le coin bas droit est déjà pris par « Commencer »
 * (`AppelFlottant`, `bottom-4`, 48 px). La pastille se pose au-dessus, jamais
 * par-dessus : deux boutons empilés sous le pouce se lisent, deux boutons
 * superposés se ratent.
 */

const PHOTO = '/images/team/Team_Paul_Andre.webp';
const ENDPOINT = 'https://academy.mydigipal.com/api/academy/public/question';
const CLE_BULLE = 'academy_question_bulle';
const CLE_FIL = 'academy_question_fil';
/** Au-delà, le panneau n'interroge plus le fil : la réponse part par courriel. */
const DUREE_ECOUTE_MS = 30 * 60_000;

type Vue = 'liste' | 'reponse' | 'form' | 'envoye' | 'fil';
interface MessageFil {
  auteur: 'visiteur' | 'paul';
  texte: string;
  at: string;
}
interface Fil {
  id: string;
  jeton: string;
}

const emailValide = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

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
  const [fil, setFil] = useState<Fil | null>(null);
  const [messages, setMessages] = useState<MessageFil[]>([]);
  /** Paul a répondu pendant que le panneau était fermé. */
  const [nouveau, setNouveau] = useState(false);
  const [bulleReponse, setBulleReponse] = useState(false);
  const pastille = useRef<HTMLButtonElement>(null);
  const fermerBtn = useRef<HTMLButtonElement>(null);
  const arrivee = useRef(0);
  const ouvertRef = useRef(false);
  /** Le nombre de messages de Paul déjà montrés, pour ne signaler que les nouveaux. */
  const paulVus = useRef(0);
  /** La hauteur du bandeau cookies tant qu'il est à l'écran, zéro ensuite. */
  const [bandeau, setBandeau] = useState(0);

  // L'apparition : la grille de tarifs à l'écran, ou une minute sur la page.
  // Un fil déjà ouvert dans cette visite fait revenir la pastille tout de suite,
  // puisqu'une réponse de Paul peut l'attendre.
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
    try {
      const brut = sessionStorage.getItem(CLE_FIL);
      if (brut) {
        const f = JSON.parse(brut) as Fil;
        if (f?.id && f?.jeton) {
          setFil(f);
          montrer();
        }
      }
    } catch {
      /* stockage indisponible : on repart sans fil */
    }
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

  useEffect(() => {
    ouvertRef.current = ouvert;
  }, [ouvert]);

  // L'écoute du fil. Panneau ouvert : toutes les 5 s, et il passe sur la
  // conversation dès que Paul répond. Fermé : toutes les 20 s, et la pastille
  // prend un point doré. Onglet caché : on n'interroge pas, donc Paul ne voit
  // plus la personne présente et sa réponse part aussi par courriel.
  useEffect(() => {
    if (!fil) return;
    let actif = true;
    let minuterie = 0;
    const tour = async () => {
      if (Date.now() - arrivee.current > DUREE_ECOUTE_MS) return;
      if (document.visibilityState === 'hidden') {
        if (actif) minuterie = window.setTimeout(tour, 5000);
        return;
      }
      try {
        const r = await fetch(`${ENDPOINT}/fil?id=${encodeURIComponent(fil.id)}&jeton=${encodeURIComponent(fil.jeton)}`);
        if (r.status === 404) {
          try {
            sessionStorage.removeItem(CLE_FIL);
          } catch {
            /* rien à retirer */
          }
          if (actif) setFil(null);
          return;
        }
        if (r.ok && actif) {
          const d = (await r.json()) as { messages?: MessageFil[] };
          const liste = d.messages || [];
          setMessages(liste);
          const nPaul = liste.filter((m) => m.auteur === 'paul').length;
          if (nPaul > paulVus.current) {
            if (ouvertRef.current) {
              paulVus.current = nPaul;
              setVue('fil');
            } else {
              setNouveau(true);
              setBulleReponse(true);
            }
          }
        }
      } catch {
        /* réseau : le tour suivant réessaie */
      }
      if (actif) minuterie = window.setTimeout(tour, ouvertRef.current ? 5000 : 20_000);
    };
    void tour();
    return () => {
      actif = false;
      window.clearTimeout(minuterie);
    };
  }, [fil]);

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

  const contexte = () => {
    const q = new URLSearchParams(window.location.search);
    return {
      surface: 'page',
      language: locale,
      page: window.location.pathname,
      devise,
      secondes: Math.round((Date.now() - arrivee.current) / 1000),
      gclid: paramGarde('gclid') || undefined,
      fbclid: paramGarde('fbclid') || undefined,
      utm_source: q.get('utm_source') || undefined,
      utm_medium: q.get('utm_medium') || undefined,
      utm_campaign: q.get('utm_campaign') || undefined,
    };
  };

  // Le fil s'ouvre une seule fois par visite : c'est cette ouverture qui
  // prévient Paul dans Google Chat.
  const assurerFil = async (): Promise<Fil | null> => {
    if (fil) return fil;
    try {
      const r = await fetch(`${ENDPOINT}/fil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ouvrir', ...contexte() }),
      });
      if (!r.ok) return null;
      const d = (await r.json()) as Partial<Fil>;
      if (!d.id || !d.jeton) return null;
      const f = { id: d.id, jeton: d.jeton };
      setFil(f);
      try {
        sessionStorage.setItem(CLE_FIL, JSON.stringify(f));
      } catch {
        /* le fil vaudra pour cette page seulement */
      }
      return f;
    } catch {
      return null;
    }
  };

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

  const ouvrir = (source: 'pastille' | 'bulle' | 'reponse') => {
    paulVus.current = messages.filter((m) => m.auteur === 'paul').length;
    setOuvert(true);
    setBulle(false);
    setBulleReponse(false);
    setNouveau(false);
    setVue(messages.length ? 'fil' : 'liste');
    setErreur('');
    trackQuestion('open', { question_source: source });
    void assurerFil();
  };

  const lire = (id: string) => {
    setFaqId(id);
    setVue('reponse');
    setLues((l) => (l.includes(id) ? l : [...l, id]));
    trackQuestion('faq', { faq_id: id });
    const libelle = faq.find((f) => f.id === id)?.q;
    void assurerFil().then((f) => {
      if (!f || !libelle) return;
      fetch(`${ENDPOINT}/fil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'faq', id: f.id, jeton: f.jeton, question: libelle }),
      }).catch(() => undefined);
    });
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    if (question.trim().length < 5) return setErreur(c.erreurQuestion);
    if (!emailValide(email)) return setErreur(c.erreurEmail);
    setErreur('');
    setEnvoi(true);
    try {
      const f = await assurerFil();
      const texte = question.trim();
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contexte(),
          email: email.trim(),
          question: texte,
          faq: lues.map((id) => faq.find((x) => x.id === id)?.q || id),
          fil_id: f?.id,
          jeton: f?.jeton,
          website: piege,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setMessages((m) => [...m, { auteur: 'visiteur', texte, at: new Date().toISOString() }]);
      setQuestion('');
      setVue((v) => (v === 'fil' ? 'fil' : 'envoye'));
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
  const bouton =
    'min-h-11 w-full rounded-bouton bg-or text-[15px] font-semibold text-salle transition hover:bg-or-vif disabled:opacity-60';
  // Le piège à robots : invisible pour un humain, rempli par un robot.
  const piegeChamp = (
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
  );
  const texteBulle = bulleReponse ? c.paulARepondu : c.bulle;

  return (
    <>
      {!ouvert && (
        <div
          className="fixed bottom-[5.5rem] right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
          style={bandeau ? { bottom: `${bandeau + 16}px` } : undefined}
        >
          {(bulle || bulleReponse) && (
            // Sur téléphone, la tête seule au-dessus de « Commencer », sans bulle
            // (Paul, 15/09/2026) : deux blocs de texte sous le pouce mangeaient la page.
            // Une réponse de Paul s'y signale par le point doré de la pastille.
            <div
              role="status"
              className="relative max-w-[16rem] rounded-carte rounded-br-[4px] bg-craie py-3 pl-3.5 pr-9 text-encre shadow-[0_12px_32px_-10px_rgba(4,8,18,.65)] max-lg:hidden"
            >
              <button
                type="button"
                onClick={() => ouvrir(bulleReponse ? 'reponse' : 'bulle')}
                className="text-left text-[15px] leading-[1.4]"
              >
                {nb(texteBulle)}
                <span className="mt-1 block text-[13px] text-brume">{bulleReponse ? c.voirConversation : c.signe}</span>
              </button>
              <button
                type="button"
                aria-label={c.masquer}
                onClick={() => {
                  setBulle(false);
                  setBulleReponse(false);
                }}
                className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full text-[18px] leading-none text-brume transition hover:text-encre"
              >
                ×
              </button>
            </div>
          )}
          <button
            ref={pastille}
            type="button"
            onClick={() => ouvrir(nouveau ? 'reponse' : 'pastille')}
            aria-label={nouveau ? c.paulARepondu : c.pastilleAria}
            className="relative h-14 w-14 rounded-full border-2 border-or bg-salle-2 shadow-[0_10px_30px_-8px_rgba(4,8,18,.75)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <img src={PHOTO} alt="" width={56} height={56} className="h-full w-full rounded-full object-cover" />
            {nouveau && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-salle bg-or"
              />
            )}
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
                {messages.length > 0 && (
                  <button type="button" onClick={() => setVue('fil')} className={lien}>
                    {c.voirConversation}
                  </button>
                )}
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
                <button type="button" onClick={() => setVue('form')} className={bouton}>
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
              {piegeChamp}
              {erreur && <p className="m-0 text-[13.5px] text-[#f0a39a]">{erreur}</p>}
              <button type="submit" disabled={envoi} aria-busy={envoi} className={bouton}>
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
              <p className="m-0 text-[15px] leading-[1.55] text-corps-nuit">{nb(c.envoyeTexte(email.trim()))}</p>
              {messages.length > 0 && (
                <button type="button" onClick={() => setVue('fil')} className={lien}>
                  {c.voirConversation}
                </button>
              )}
              <button type="button" onClick={() => setVue('liste')} className={lien}>
                {c.retour}
              </button>
            </div>
          )}

          {vue === 'fil' && (
            <>
              <div className="flex flex-col gap-2.5 overflow-y-auto p-4" aria-live="polite">
                {messages.map((m, i) =>
                  m.auteur === 'paul' ? (
                    <p
                      key={`${m.at}-${i}`}
                      className="m-0 max-w-[92%] self-start whitespace-pre-line rounded-carte rounded-tl-[4px] bg-salle-3 px-3.5 py-3 text-[15px] leading-[1.55] text-ivoire"
                    >
                      <span className="mb-1 block text-[12.5px] font-semibold text-or">{c.signe}</span>
                      {m.texte}
                    </p>
                  ) : (
                    <p
                      key={`${m.at}-${i}`}
                      className="m-0 max-w-[85%] self-end whitespace-pre-line rounded-carte rounded-tr-[4px] bg-or px-3.5 py-2.5 text-[15px] leading-[1.4] text-salle"
                    >
                      {m.texte}
                    </p>
                  ),
                )}
                <button type="button" onClick={() => setVue('liste')} className={lien}>
                  {c.autres}
                </button>
              </div>
              <form onSubmit={envoyer} className="flex flex-col gap-2 border-t border-filet-nuit p-3" noValidate>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={c.repondre}
                  aria-label={c.repondre}
                  rows={2}
                  maxLength={2000}
                  className={`${champ} resize-none`}
                />
                {!emailValide(email) && (
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={c.labelEmail}
                    aria-label={c.labelEmail}
                    className={champ}
                  />
                )}
                {piegeChamp}
                {erreur && <p className="m-0 text-[13.5px] text-[#f0a39a]">{erreur}</p>}
                <button type="submit" disabled={envoi} aria-busy={envoi} className={bouton}>
                  {c.envoyer}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
