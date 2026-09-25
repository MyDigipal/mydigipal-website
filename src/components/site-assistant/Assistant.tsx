// ============================================================
// L'assistant du site mydigipal.com (22/09/2026)
// ============================================================
//
// Décisions de Paul du 22/09/2026 :
// - « l'option B, en clair » : un assistant qui aide à décider, avec des
//   questions posées toutes seules, et Paul qui voit tout dans Google Chat et
//   intervient quand il veut ;
// - SANS modèle : « on veut un truc bateau ». Le script est dans `copy.ts`, les
//   prix sortent du moteur du calculateur (`guidedProposal`, `devis`), et une
//   question libre part à Paul ;
// - Paul est prévenu à la PREMIÈRE RÉPONSE, pas à l'ouverture ;
// - « Aidez-moi à choisir » du calculateur ouvre cet assistant ;
// - sur ordinateur, une petite phrase discrète près de son visage ; sur la page
//   de résultat du calculateur, « clairement, un truc plus gros ».
//
// ⚠️ Le site recharge chaque page : la conversation est gardée dans
// sessionStorage et reprend telle quelle sur la page suivante.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  QUESTION_INDEX, decodePlan, devis, domainName, encodePlan, guidedProposal, money, optionsFor, prixDeDepart, t,
  visibleQuestions, type Lang, type Question, type QuoteState,
} from '../calculator-v6/engine';
import { info } from '../calculator-v6/content';
import { guidedQuestions } from '../calculator/guided-data';
import type { Currency, ServiceDomain } from '../calculator/types';
import { provenance } from '../academy/track';
import { envoyerMessage, envoyerReponse, lireMessages, ouvrirFil, type Contexte, type Fil } from './api';
import { ficheDe, type Fiche } from './pages';
import { PHOTO, QUESTIONS, cheminCalculateur, cheminContact, copie, type Champ } from './copy';

type Etape = 'accueil' | 'menu' | 'service' | Champ | 'fin' | 'libre';
/** Un choix proposé dans le panneau : soit une action, soit un lien vers une page. */
type Choix = { id: string; label: string; href?: string };
type Item =
  | { k: 'bot'; texte: string }
  | { k: 'moi'; texte: string }
  | { k: 'paul'; texte: string; at: string }
  | { k: 'evt'; texte: string }
  | { k: 'plan'; plan: string; budget: number };

interface Sauve {
  items: Item[];
  etape: Etape;
  g: Partial<Record<Champ, string>>;
  fil?: Fil;
  /** Le fil Google Chat existe : une réponse ou un message est parti. */
  prevenu: boolean;
  paulVus: number;
  messages: number;
  /** Les choix du menu déjà utilisés : on ne les repropose pas. */
  faits?: string[];
  /** La page où la conversation en est : en changer relance le menu de la nouvelle page. */
  page?: string;
  /** La question du calculateur posée pour le service de la page (étape « service »). */
  sq?: string;
  /** Quand le premier message est parti chez Paul, pour la relance de cinq minutes. */
  ecritA?: number;
  /** La relance « Paul n'est pas là » a déjà été dite. */
  relance?: boolean;
  /** Une adresse a déjà été donnée : on ne la redemande pas. */
  adresse?: boolean;
}

const CLE = 'mdp_assistant_v1';
const CLE_INVITE = 'mdp_assistant_invite';
const CLE_DEVIS = 'mdp_assistant_devis_vu';
const EMAIL = /[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/i;
const ORDRE: Champ[] = ['industry', 'goals', 'monthlyBudget'];
/** Les budgets publicitaires proposés dans le panneau : la moitié des paliers du calculateur suffit. */
const BUDGETS = [1000, 2000, 3000, 5000, 10000];

/** Service de la page : /{lang}/services/{slug}. Le slug est l'identifiant du domaine, sauf l'ABM. */
const SERVICES: ServiceDomain[] = ['seo', 'google-ads', 'paid-social', 'emailing', 'ai-training', 'ai-solutions', 'ai-content', 'tracking-reporting'];
function serviceDeLaPage(chemin: string): ServiceDomain | undefined {
  const m = /^\/(?:fr|en)\/services\/([^/?#]+)/.exec(chemin);
  return m && (SERVICES as string[]).includes(m[1]) ? (m[1] as ServiceDomain) : undefined;
}

const lire = <T,>(cle: string, defaut: T): T => {
  try {
    const v = sessionStorage.getItem(cle);
    return v ? (JSON.parse(v) as T) : defaut;
  } catch {
    return defaut;
  }
};
const ecrire = (cle: string, v: unknown) => {
  try {
    sessionStorage.setItem(cle, JSON.stringify(v));
  } catch {
    /* stockage indisponible : la conversation ne survivra pas à la page, rien de plus */
  }
};
const pousser = (event: string, params: Record<string, unknown> = {}) => {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
};

const VIDE: Sauve = { items: [], etape: 'accueil', g: {}, prevenu: false, paulVus: 0, messages: 0, faits: [] };

export interface AssistantProps {
  lang: Lang;
  /** Page où un bandeau collant occupe le bas de l'écran sur mobile (le calculateur). */
  surelever: boolean;
}

export default function Assistant({ lang, surelever }: AssistantProps) {
  const c = copie(lang);
  const currency: Currency = lang === 'en' ? 'USD' : 'EUR';
  const m = useCallback((v: number) => money(v, currency, lang), [currency, lang]);
  const debut = useRef(Date.now());
  const chemin = typeof window !== 'undefined' ? window.location.pathname : '/';
  const service = useMemo(() => serviceDeLaPage(chemin), [chemin]);
  const surCalculateur = /^\/(?:fr|en)\/calculator\/?$/.test(chemin);

  // Ce que l'assistant sait de la page ouverte (carte générée au build, `/assistant-pages.json`).
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [suite, setSuite] = useState<Fiche | null>(null);
  const ficheRef = useRef<Fiche | null>(null);
  ficheRef.current = fiche;
  const suiteRef = useRef<Fiche | null>(null);
  suiteRef.current = suite;
  useEffect(() => {
    let vivant = true;
    void ficheDe(chemin).then(async (f) => {
      if (!vivant) return;
      setFiche(f);
      if (f?.c) {
        const g = await ficheDe(f.c);
        if (vivant) setSuite(g);
      }
    });
    return () => { vivant = false; };
  }, [chemin]);
  /** Le service du calculateur qui correspond à la page, s'il y en a un. */
  const domaine = (fiche?.s as ServiceDomain | undefined) ?? service;
  const domaineRef = useRef<ServiceDomain | undefined>(undefined);
  domaineRef.current = domaine;
  /** Le secteur que la page trahit : une page automobile n'a pas besoin de poser la question. */
  const secteurDeLaPage = fiche?.i === 'automotive' ? 'automotive' : fiche?.i === 'b2b-tech' ? 'b2b-saas' : undefined;
  const secteurRef = useRef<string | undefined>(undefined);
  secteurRef.current = secteurDeLaPage;
  /** Le service mis en avant dans la proposition (celui de la page, ou celui d'un choix du menu). */
  const focusRef = useRef<ServiceDomain | undefined>(undefined);

  const [s, setS] = useState<Sauve>(() => lire(CLE, VIDE));
  const sRef = useRef(s);
  sRef.current = s;
  const maj = useCallback((f: (x: Sauve) => Sauve) => {
    setS((x) => {
      const n = f(x);
      ecrire(CLE, n);
      return n;
    });
  }, []);

  const [ouvert, setOuvert] = useState(false);
  const [invite, setInvite] = useState(false);
  const [grand, setGrand] = useState(false);
  const [nonLu, setNonLu] = useState(false);
  const [texte, setTexte] = useState('');
  const [piege, setPiege] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(false);
  const [devisCourant, setDevisCourant] = useState<string | null>(null);
  const ouvertRef = useRef(false);
  ouvertRef.current = ouvert;
  const fondRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLTextAreaElement>(null);

  const ctx = (): Contexte => ({
    language: lang,
    page: chemin,
    devise: currency,
    secondes: Math.round((Date.now() - debut.current) / 1000),
    provenance: provenance(),
  });

  const assurerFil = async (): Promise<Fil | null> => {
    if (sRef.current.fil) return sRef.current.fil;
    const fil = await ouvrirFil(ctx());
    if (fil) maj((x) => ({ ...x, fil }));
    return fil;
  };

  // Ce que l'assistant dit en s'ouvrant, selon la page (Paul, 22/09 : « le choix de base sur la
  // page d'accueil est quand même assez basique »).
  const accueilTexte = () => {
    const f = ficheRef.current;
    if (!f) return service ? c.accueilService(domainName(service, lang)) : c.accueil;
    if (f.k === 'case') return c.accueilCas(f.cl || f.t, f.r);
    if (f.k === 'blog') return c.accueilArticle(f.t);
    if (f.k === 'auto') return c.accueilAuto;
    if (f.k === 'contact') return c.accueilContact;
    if (f.k === 'service' || f.k === 'ia') return c.accueilPage(domaineRef.current ? domainName(domaineRef.current, lang) : f.t, f.d);
    return c.accueilHome;
  };

  /** La question d'une ligne posée au-dessus du visage, selon la page (Paul, 23/09/2026). */
  const inviteTexte = () => {
    const f = ficheRef.current;
    const d = domaineRef.current;
    if (surCalculateur) return c.inviteCalcul;
    if (!f) return d ? c.inviteService(domainName(d, lang)) : c.invite;
    if (f.k === 'case') return c.inviteCas(f.cl || f.t);
    if (f.k === 'blog') return c.inviteArticle;
    if (f.k === 'auto') return c.inviteAuto;
    if (f.k === 'contact') return c.inviteContact;
    if (f.k === 'service' || f.k === 'ia') return c.inviteService(d ? domainName(d, lang) : f.t);
    return c.inviteHome;
  };

  // --- ouverture --------------------------------------------------------------------------
  const ouvrir = useCallback((mode: 'normal' | 'guide' | 'devis' = 'normal') => {
    setInvite(false);
    setGrand(false);
    setNonLu(false);
    setOuvert(true);
    pousser('site_assistant_open', { assistant_mode: mode, assistant_page: window.location.pathname });
    maj((x) => {
      const items = [...x.items];
      if (mode === 'guide') {
        items.push({ k: 'bot', texte: c.guideIntro }, { k: 'bot', texte: QUESTIONS.industry[lang] });
        return { ...x, items, etape: 'industry', g: {} };
      }
      if (mode === 'devis') {
        items.push({ k: 'bot', texte: c.accueilDevis });
        return { ...x, items, etape: 'libre' };
      }
      if (items.length) {
        // Conversation déjà ouverte : on ne recommence pas, mais si la personne a changé de page,
        // l'assistant repart de cette page-là plutôt que de rester sur la précédente.
        if (x.page === chemin) return x;
        items.push({ k: 'bot', texte: accueilTexte() });
        return { ...x, items, etape: 'menu', faits: [], page: chemin };
      }
      items.push({ k: 'bot', texte: accueilTexte() });
      return { ...x, items, etape: 'menu', page: chemin };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, lang, maj, service]);

  // Le calculateur : « Aidez-moi à choisir » ouvre l'assistant, la page de résultat lui passe le devis.
  useEffect(() => {
    const w = window as unknown as { __mdpAssistant?: boolean; __mdpDevis?: string | null };
    w.__mdpAssistant = true;
    if (w.__mdpDevis) setDevisCourant(w.__mdpDevis);
    const surOuvrir = (e: Event) => ouvrir((e as CustomEvent<{ mode?: 'guide' | 'devis' }>).detail?.mode ?? 'normal');
    const surDevis = (e: Event) => setDevisCourant((e as CustomEvent<{ resume: string | null }>).detail?.resume ?? null);
    window.addEventListener('mdp-assistant:open', surOuvrir);
    window.addEventListener('mdp-assistant:devis', surDevis);
    return () => {
      w.__mdpAssistant = false;
      window.removeEventListener('mdp-assistant:open', surOuvrir);
      window.removeEventListener('mdp-assistant:devis', surDevis);
    };
  }, [ouvrir]);

  // La question de la page, au bout de dix secondes, tant qu'aucune conversation n'a commencé
  // et tant que la personne ne l'a pas fermée pendant sa visite. Sur téléphone comme sur ordinateur.
  useEffect(() => {
    if (lire(CLE_INVITE, false) || sRef.current.items.length) return;
    const t = window.setTimeout(() => { if (!ouvertRef.current && !lire(CLE_INVITE, false)) setInvite(true); }, 10000);
    return () => window.clearTimeout(t);
  }, []);

  // Sur la page de résultat : l'invitation en grand, une fois par visite.
  useEffect(() => {
    if (!devisCourant || lire(CLE_DEVIS, false)) return;
    const t = window.setTimeout(() => {
      if (ouvertRef.current) return;
      setInvite(false);
      setGrand(true);
      ecrire(CLE_DEVIS, true);
    }, 2500);
    return () => window.clearTimeout(t);
  }, [devisCourant]);

  // --- les réponses de Paul ---------------------------------------------------------------
  // Interrogées dès que Paul a été prévenu : toutes les 5 s fenêtre ouverte, 20 s fermée,
  // jamais quand l'onglet est caché, et plus du tout après 30 minutes sans rien.
  useEffect(() => {
    if (!s.fil || !s.prevenu) return;
    let arret = false;
    let minuteur = 0;
    const tour = async () => {
      if (arret) return;
      if (Date.now() - debut.current > 30 * 60_000 && !ouvertRef.current) return;
      if (document.visibilityState === 'visible') {
        const liste = await lireMessages(sRef.current.fil as Fil);
        const dePaul = (liste ?? []).filter((x) => x.auteur === 'paul');
        if (dePaul.length > sRef.current.paulVus) {
          const nouveaux = dePaul.slice(sRef.current.paulVus);
          maj((x) => ({
            ...x,
            paulVus: dePaul.length,
            items: [
              ...x.items,
              ...(x.paulVus === 0 ? [{ k: 'evt', texte: c.paulRejoint } as Item] : []),
              ...nouveaux.map((n) => ({ k: 'paul', texte: n.texte, at: n.at }) as Item),
            ],
          }));
          if (!ouvertRef.current) setNonLu(true);
        }
      }
      minuteur = window.setTimeout(tour, ouvertRef.current ? 5000 : 20000);
    };
    minuteur = window.setTimeout(tour, 1500);
    return () => { arret = true; window.clearTimeout(minuteur); };
  }, [s.fil, s.prevenu, c.paulRejoint, maj]);

  // Cinq minutes sans réponse de Paul : on le dit, et on prend l'adresse pour lui répondre
  // par courriel (sa demande du 23/09/2026). Le compte part de l'envoi du premier message et
  // survit au changement de page, puisqu'il est gardé avec la conversation.
  useEffect(() => {
    if (!s.ecritA || s.relance || s.adresse || s.paulVus > 0) return;
    const reste = Math.max(0, s.ecritA + 5 * 60_000 - Date.now());
    const t = window.setTimeout(() => {
      if (sRef.current.paulVus > 0 || sRef.current.relance || sRef.current.adresse) return;
      maj((x) => ({ ...x, relance: true, etape: 'libre', items: [...x.items, { k: 'bot', texte: `${c.absent}\n\n${c.absentPlus}` }] }));
      pousser('site_assistant_absent');
    }, reste);
    return () => window.clearTimeout(t);
  }, [s.ecritA, s.relance, s.adresse, s.paulVus, c.absent, c.absentPlus, maj]);

  // Le fil défile jusqu'au dernier message.
  useEffect(() => {
    if (ouvert) fondRef.current?.scrollIntoView({ block: 'end' });
  }, [ouvert, s.items.length, s.etape]);

  useEffect(() => {
    if (!ouvert) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [ouvert]);

  // --- le parcours ------------------------------------------------------------------------
  const libelle = (champ: Champ, id: string, l: Lang) => {
    if (champ === 'monthlyBudget') return copie(l).budgets(l === 'fr' ? (v) => money(v, 'EUR', 'fr') : m)[id] ?? id;
    const o = guidedQuestions.find((q) => q.id === champ)?.options?.find((x) => x.id === id);
    return o ? o.label[l] : id;
  };

  const resumeDevis = (st: QuoteState) => {
    const q = devis(st);
    const e = (v: number) => money(v, 'EUR', 'fr');
    return [
      `${e(q.monthly)}/mois`,
      q.oneOff ? `${e(q.oneOff)} de mise en place` : '',
      q.media ? `${e(q.media)} de média par mois` : '',
    ].filter(Boolean).join(' + ');
  };

  /** La proposition, une fois les trois réponses connues (certaines viennent de la page). */
  const proposer = async (g: Partial<Record<Champ, string>>) => {
    const p = guidedProposal(g.industry as string, g.goals as string, g.monthlyBudget as string, focusRef.current ?? domaineRef.current);
    const plan = encodePlan(p.state);
    maj((x) => ({ ...x, g, etape: 'fin', items: [...x.items, { k: 'bot', texte: c.propIntro }, { k: 'plan', plan, budget: p.budget }] }));
    pousser('site_assistant_proposal', { assistant_domains: p.state.domains.join(','), assistant_monthly: devis(p.state).monthly });
    const fil = await assurerFil();
    if (!fil) return;
    await envoyerReponse(fil, {
      question: 'Proposition',
      reponse: p.state.domains.map((d) => domainName(d, 'fr')).join(', '),
      estimation: resumeDevis(p.state),
    });
    maj((x) => ({ ...x, prevenu: true }));
  };

  /**
   * Sur une page service, chiffrer ne demande pas trois questions de cadrage : l'assistant pose LA
   * question du calculateur pour ce service (le budget publicitaire, le niveau d'accompagnement)
   * et rend le prix. C'est le calculateur qui parle, avec la page comme point de départ.
   */
  const chiffrerService = (d: ServiceDomain) => {
    const questions = visibleQuestions(d, {});
    // Le budget publicitaire d'abord ; sinon la première offre récurrente (l'accompagnement
    // mensuel parle mieux qu'un audit de démarrage) ; sinon la première question tout court.
    const q = questions.find((x) => x.kind === 'budget')
      ?? questions.find((x) => (x.kind === 'level' || x.kind === 'choice') && optionsFor(x, {}).some((o) => o.price && !o.oneOff))
      ?? questions[0];
    if (!q || (q.kind !== 'budget' && q.kind !== 'level' && q.kind !== 'choice')) { demarrer({}); return; }
    maj((x) => ({ ...x, etape: 'service', sq: q.id, items: [...x.items, { k: 'bot', texte: t(q.title, lang) }] }));
  };

  const optionsService = (q: Question): Choix[] => {
    if (q.kind === 'budget') return BUDGETS.map((v) => ({ id: String(v), label: m(v) }));
    return optionsFor(q, {}).map((o) => ({
      id: String(o.value),
      label: `${t(o.label, lang)}${o.price ? ` · ${m(o.price)}${o.oneOff ? '' : c.parMois}` : ''}`,
    }));
  };

  const repondreService = async (q: Question, x: Choix) => {
    const valeur = q.kind === 'budget' ? Number(x.id) : /^-?\d+$/.test(x.id) ? Number(x.id) : x.id;
    const etat: QuoteState = { domains: [q.domain], answers: { [q.id]: valeur }, discuss: {}, duration: 4 };
    const plan = encodePlan(etat);
    maj((y) => ({
      ...y,
      etape: 'fin',
      items: [...y.items, { k: 'moi', texte: x.label }, { k: 'bot', texte: c.propIntro }, { k: 'plan', plan, budget: devis(etat).monthly }],
    }));
    pousser('site_assistant_proposal', { assistant_domains: q.domain, assistant_monthly: devis(etat).monthly });
    const fil = await assurerFil();
    if (!fil) return;
    await envoyerReponse(fil, { question: `${domainName(q.domain, 'fr')} : ${t(q.title, 'fr')}`, reponse: x.label, estimation: resumeDevis(etat), secondes: ctx().secondes });
    maj((y) => ({ ...y, prevenu: true }));
  };

  /** Démarre les questions en gardant ce que la page ou le choix du menu ont déjà appris. */
  const demarrer = (pre: { goals?: string; industry?: string; focus?: ServiceDomain }) => {
    focusRef.current = pre.focus ?? domaineRef.current;
    const g: Partial<Record<Champ, string>> = {};
    if (pre.goals) g.goals = pre.goals;
    const secteur = pre.industry ?? secteurRef.current;
    if (secteur) g.industry = secteur;
    const suivant = ORDRE.find((ch) => !g[ch]);
    if (!suivant) { void proposer(g); return; }
    maj((x) => ({ ...x, g, etape: suivant, items: [...x.items, { k: 'bot', texte: QUESTIONS[suivant][lang] }] }));
  };

  const repondre = async (champ: Champ, id: string) => {
    const g = { ...sRef.current.g, [champ]: id };
    const suivant = ORDRE.find((ch) => !g[ch]);
    pousser('site_assistant_answer', { assistant_step: champ, assistant_value: id });
    maj((x) => ({
      ...x,
      g,
      etape: suivant ?? x.etape,
      items: [...x.items, { k: 'moi', texte: libelle(champ, id, lang) }, ...(suivant ? [{ k: 'bot', texte: QUESTIONS[suivant][lang] } as Item] : [])],
    }));
    const fil = await assurerFil();
    if (fil) {
      await envoyerReponse(fil, { question: QUESTIONS[champ].fr, reponse: libelle(champ, id, 'fr'), secondes: ctx().secondes });
      maj((x) => ({ ...x, prevenu: true }));
    }
    if (!suivant) await proposer(g);
  };

  // --- les réponses écrites du menu -------------------------------------------------------------
  const direEtNoter = async (texte: string, question: string, reponse: string) => {
    maj((x) => ({ ...x, etape: 'menu', items: [...x.items, { k: 'bot', texte }] }));
    const fil = await assurerFil();
    if (!fil) return;
    await envoyerReponse(fil, { question, reponse, secondes: ctx().secondes });
    maj((x) => ({ ...x, prevenu: true }));
  };

  const direPrix = async (avecSuite = true) => {
    const d = domaineRef.current;
    if (!d) { versLibre(); return; }
    const px = prixDeDepart(d);
    const lignes: string[] = [];
    if (px.fee && px.feeMax && px.pct) lignes.push(c.prixGestion(m(px.fee), m(px.feeMax), px.pct));
    if (px.monthly) lignes.push(c.prixMensuel(m(px.monthly)));
    if (px.once) lignes.push(c.prixUneFois(m(px.once)));
    if (!lignes.length) lignes.push(c.prixInconnu);
    if (avecSuite) lignes.push(c.prixSuite);
    await direEtNoter(lignes.join('\n\n'), 'A demandé les prix', domainName(d, 'fr'));
  };

  const direInclus = async () => {
    const d = domaineRef.current;
    const data = d ? info(`dom:${d}`, lang, currency) : null;
    if (!d || !data) { versLibre(); return; }
    const texte = [data.text, ...(data.list ?? []).slice(0, 5).map((x) => `• ${x}`)].filter(Boolean).join('\n');
    await direEtNoter(texte, 'A regardé ce qui est compris', domainName(d, 'fr'));
  };

  const direCas = async () => {
    const f = ficheRef.current;
    const cas = suiteRef.current;
    if (!f?.c) { versLibre(); return; }
    const texte = cas?.cl && cas.r ? c.casChiffre(cas.cl, cas.r) : (cas?.d ?? cas?.t ?? '');
    await direEtNoter(texte, 'A demandé un résultat client', cas?.cl || f.c);
  };

  const ouvrirDevis = async (plan: string, budget: number) => {
    pousser('site_assistant_plan_open');
    const fil = sRef.current.fil;
    if (fil) void envoyerReponse(fil, { question: 'Devis détaillé', reponse: 'ouvert dans le calculateur' });
    if (surCalculateur) {
      window.dispatchEvent(new CustomEvent('mdp-assistant:plan', { detail: { plan, budget } }));
      if (!window.matchMedia('(min-width: 1024px)').matches) setOuvert(false);
      return;
    }
    window.location.href = `${cheminCalculateur(lang)}#plan=${plan}&b=${budget}`;
  };

  const versLibre = (texteBot = c.libre) => {
    maj((x) => ({ ...x, etape: 'libre', items: [...x.items, { k: 'bot', texte: texteBot }] }));
    window.setTimeout(() => champRef.current?.focus(), 50);
  };

  const recommencer = () => {
    maj((x) => ({ ...x, g: {}, etape: 'industry', items: [...x.items, { k: 'bot', texte: QUESTIONS.industry[lang] }] }));
  };

  const envoyer = async (brut: string) => {
    const question = brut.trim();
    if (!question || envoi) return;
    setErreur(false);
    setEnvoi(true);
    const email = EMAIL.exec(question)?.[0];
    const premier = sRef.current.messages === 0;
    maj((x) => ({ ...x, items: [...x.items, { k: 'moi', texte: question }] }));
    setTexte('');
    const fil = await assurerFil();
    const plan = [...sRef.current.items].reverse().find((i) => i.k === 'plan') as Extract<Item, { k: 'plan' }> | undefined;
    const st = plan ? decodePlan(plan.plan) : null;
    const ok = !!fil && (await envoyerMessage(fil, ctx(), { question, email, devis: devisCourant ?? (st ? resumeDevis(st) : undefined), website: piege }));
    setEnvoi(false);
    if (!ok) {
      setErreur(true);
      return;
    }
    if (premier) pousser('site_assistant_message', { assistant_page: window.location.pathname });
    maj((x) => ({
      ...x,
      prevenu: true,
      messages: x.messages + 1,
      ecritA: x.ecritA ?? Date.now(),
      adresse: x.adresse || !!email,
      // Une question en cours reste posée : écrire à Paul n'annule pas le parcours.
      etape: x.etape === 'menu' || x.etape === 'accueil' ? 'libre' : x.etape,
      items: [
        ...x.items,
        ...(premier && !email ? [{ k: 'bot', texte: c.apresMessage } as Item] : []),
        ...(email ? [{ k: 'bot', texte: `${c.emailRecu}\n\n${c.emailSpam}` } as Item] : []),
      ],
    }));
  };

  // --- rendu ------------------------------------------------------------------------------
  // Des fonctions de rendu, pas des composants : déclarés ici, ils seraient recréés à chaque rendu.
  const photo = (taille: number) => (
    <img src={PHOTO} alt="" width={taille} height={taille} className="shrink-0 rounded-full object-cover" style={{ width: taille, height: taille }} />
  );

  const carte = (plan: string, budget: number) => {
    const st = decodePlan(plan);
    if (!st) return null;
    const q = devis(st);
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5">
        <ul className="space-y-1.5 text-[13.5px]">
          {q.domains.map((dq) => (
            <li key={dq.domain} className="flex justify-between gap-3">
              <span className="text-slate-700">{domainName(dq.domain, lang)}</span>
              <span className="whitespace-nowrap font-semibold tabular-nums text-slate-900">
                {dq.empty || dq.discuss ? c.aDefinir : dq.monthly > 0 ? `${m(dq.monthly)}${c.parMois}` : dq.oneOff > 0 ? `${m(dq.oneOff)}${c.uneFois}` : c.aDefinir}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-[13.5px]">
          <p className="flex justify-between gap-3"><span className="font-semibold text-slate-900">{c.honoraires}</span><span className="font-display text-base font-extrabold tabular-nums text-slate-900">{m(q.monthly)}{c.parMois}</span></p>
          {q.oneOff > 0 && <p className="flex justify-between gap-3 text-slate-600"><span>{c.miseEnPlace}</span><span className="tabular-nums">{m(q.oneOff)}{c.uneFois}</span></p>}
          {q.media > 0 && <p className="flex justify-between gap-3 text-slate-600"><span>{c.media}</span><span className="tabular-nums">{m(q.media)}{c.parMois}</span></p>}
        </div>
        <div className="mt-3 grid gap-2">
          <button type="button" onClick={() => ouvrirDevis(plan, budget)} className="h-10 rounded-full bg-marque text-[14px] font-semibold text-white transition-colors hover:bg-marque-fonce">{c.voirDevis}</button>
          <button type="button" onClick={() => versLibre()} className="h-10 rounded-xl bg-slate-100 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-slate-200">{c.parlerPaul}</button>
        </div>
      </div>
    );
  };

  /** Les choix proposés, selon ce que la page raconte. */
  const menu = (): Choix[] => {
    const f = ficheRef.current;
    const d = domaine;
    const liste: Choix[] = [];
    if (!f || f.k === 'home' || f.k === 'services' || f.k === 'cases' || f.k === 'blogs') {
      liste.push({ id: 'but:leads', label: c.butLeads }, { id: 'but:sales', label: c.butVentes }, { id: 'but:seo', label: c.butVisible }, { id: 'but:ai-training', label: c.butFormer });
    } else if (f.k === 'case') {
      if (d) liste.push({ id: 'plan', label: c.pareil }, { id: 'inclus', label: c.ceQuonFait(domainName(d, lang)) });
      else liste.push({ id: 'plan', label: c.aide });
    } else if (f.k === 'blog') {
      if (d) liste.push({ id: 'inclus', label: c.ceQuonFait(domainName(d, lang)) }, { id: 'plan', label: c.votrePrix });
      else liste.push({ id: 'plan', label: c.aide });
    } else if (f.k === 'contact') {
      liste.push({ id: 'plan', label: c.aide });
    } else {
      if (d) liste.push({ id: 'inclus', label: c.ceQuonFait(domainName(d, lang)) });
      if (f.c) liste.push({ id: 'cas', label: c.chezUnClient });
      liste.push({ id: 'plan', label: d ? c.votrePrix : c.votrePlan });
    }
    liste.push({ id: 'paul', label: c.poser });
    const faits = sRef.current.faits ?? [];
    return liste.filter((x) => !faits.includes(x.id));
  };

  /** Les pages à proposer en plus : l'étude de cas du service, le service de l'article, le calculateur. */
  const recommandations = (): Choix[] => {
    const f = ficheRef.current;
    const d = domaineRef.current;
    const liens: Choix[] = [];
    if (f?.c) {
      const cible = suiteRef.current;
      liens.push({
        id: 'lien-page',
        label: cible?.k === 'case' ? c.lireCas : c.voirService(d ? domainName(d, lang) : (cible?.t ?? '')),
        href: f.c,
      });
    }
    if (!surCalculateur) liens.push({ id: 'lien-calc', label: c.calculateur, href: `${cheminCalculateur(lang)}${d ? `?service=${d}` : ''}` });
    return liens;
  };

  const agir = async (x: Choix) => {
    maj((y) => ({ ...y, items: [...y.items, { k: 'moi', texte: x.label }], faits: [...(y.faits ?? []), x.id] }));
    if (x.id === 'paul') { versLibre(); return; }
    if (x.id === 'plan') {
      const d = domaineRef.current;
      if (!d) { demarrer({}); return; }
      // La grille d'abord, la question ensuite : la personne a une réponse avant de répondre.
      await direPrix(false);
      chiffrerService(d);
      return;
    }
    if (x.id.startsWith('but:')) {
      const but = x.id.slice(4);
      demarrer(but === 'seo' ? { goals: 'leads', focus: 'seo' } : but === 'ai-training' ? { goals: 'ai-training', focus: 'ai-training' } : { goals: but });
      return;
    }
    if (x.id === 'prix') { await direPrix(); return; }
    if (x.id === 'inclus') { await direInclus(); return; }
    if (x.id === 'cas') { await direCas(); return; }
  };

  const puce = 'rounded-full border border-slate-300 bg-white px-3.5 py-2 text-left text-[14px] font-medium text-slate-900 transition-colors hover:border-marque hover:bg-marque-doux';
  const puceForte = 'rounded-full border border-marque bg-marque px-3.5 py-2 text-left text-[14px] font-semibold text-white transition-colors hover:bg-marque-fonce';
  const choix = () => {
    const e = s.etape;
    if (e === 'menu' || e === 'accueil' || e === 'fin') {
      const liste = e === 'fin' ? [] : menu();
      const liens = recommandations();
      return (
        <div className="flex flex-col gap-3">
          {liste.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {liste.map((x, i) => <button key={x.id} type="button" className={i === 0 ? puceForte : puce} onClick={() => void agir(x)}>{x.label}</button>)}
            </div>
          )}
          {e === 'fin' && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13.5px]">
              <a href={cheminContact(lang)} className="font-semibold text-marque underline underline-offset-2">{c.contacter}</a>
              <button type="button" onClick={recommencer} className="font-semibold text-slate-600 underline underline-offset-2">{c.recommencer}</button>
            </div>
          )}
          {liens.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-400">{c.voirAussi}</span>
              {liens.map((x) => <a key={x.id} href={x.href} className={puce} onClick={() => pousser('site_assistant_lien', { assistant_lien: x.href })}>{x.label}</a>)}
            </div>
          )}
        </div>
      );
    }
    if (e === 'service' && s.sq && QUESTION_INDEX[s.sq]) {
      const q = QUESTION_INDEX[s.sq];
      return (
        <div className="flex flex-wrap gap-2">
          {optionsService(q).map((x) => <button key={x.id} type="button" className={puce} onClick={() => void repondreService(q, x)}>{x.label}</button>)}
        </div>
      );
    }
    if (e === 'industry' || e === 'goals' || e === 'monthlyBudget') {
      const ids = e === 'monthlyBudget' ? ['budget-1500', 'budget-3500', 'budget-7500', 'budget-15000'] : (guidedQuestions.find((q) => q.id === e)?.options ?? []).map((o) => o.id);
      return (
        <div className="flex flex-wrap gap-2">
          {ids.map((id) => <button key={id} type="button" className={puce} onClick={() => repondre(e, id)}>{libelle(e, id, lang)}</button>)}
        </div>
      );
    }
    if (e === 'libre' && devisCourant && s.messages === 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {c.suggestions.map((x) => <button key={x} type="button" className={puce} onClick={() => envoyer(x)}>{x}</button>)}
          <a href={cheminContact(lang)} className={puce}>{c.contacter}</a>
        </div>
      );
    }
    return null;
  };

  const bas = surelever ? 'bottom-[8.5rem] lg:bottom-6' : 'bottom-4 sm:bottom-6';

  return (
    <>
      {/* Fermé : le visage de Paul, et selon la page une phrase discrète ou l'invitation en grand. */}
      {!ouvert && (
        // En colonne : la phrase ou l'invitation AU-DESSUS du visage, pour ne jamais couvrir le
        // bouton « Calculer mon budget » posé à sa gauche (les deux appels à l'action du site).
        <div className={`fixed right-4 z-[45] flex flex-col items-end gap-2 sm:right-6 ${bas}`}>
          {grand && devisCourant ? (
            <div className="w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl max-sm:fixed max-sm:inset-x-4 max-sm:bottom-4 max-sm:w-auto">
              <div className="flex items-start gap-3">
                {photo(48)}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[17px] font-bold leading-snug text-slate-900">{c.devisTitre}</p>
                  <p className="mt-1 text-[14px] text-slate-600">{c.devisTexte}</p>
                </div>
                <button type="button" aria-label={c.fermer} onClick={() => setGrand(false)} className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="mt-3.5 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => ouvrir('devis')} className="h-10 rounded-full bg-marque text-[14px] font-semibold text-white hover:bg-marque-fonce">{c.devisPoser}</button>
                <a href={cheminContact(lang)} className="grid h-10 place-items-center rounded-full bg-slate-100 text-[14px] font-semibold text-slate-900 hover:bg-slate-200">{c.contacter}</a>
              </div>
            </div>
          ) : (invite || nonLu) ? (
            <div className="flex items-center gap-1 rounded-2xl rounded-br-md border border-slate-200 bg-white py-2 pl-3.5 pr-1.5 shadow-lg">
              <button type="button" onClick={() => ouvrir(devisCourant ? 'devis' : 'normal')} className="max-w-[calc(100vw-7.5rem)] text-left text-[14px] font-semibold leading-snug text-slate-900 sm:max-w-[17rem]">{nonLu ? c.paulARepondu : inviteTexte()}</button>
              {!nonLu && (
                <button type="button" aria-label={c.fermer} onClick={() => { setInvite(false); ecrire(CLE_INVITE, true); }} className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              )}
            </div>
          ) : null}
          {!(grand && devisCourant) && (
            <button type="button" aria-label={c.ouvrir} onClick={() => ouvrir(devisCourant && !s.items.length ? 'devis' : 'normal')}
              className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white p-0.5 shadow-[0_8px_24px_rgba(15,27,41,0.22)] ring-2 ring-white transition-transform hover:scale-105 max-sm:h-[52px] max-sm:w-[52px]">
              {photo(52)}
              {nonLu && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-marque ring-2 ring-white" />}
            </button>
          )}
        </div>
      )}

      {/* Ouvert : une fenêtre en bas à droite sur ordinateur, un panneau qui monte sur téléphone. */}
      {ouvert && (
        <>
          <div className="fixed inset-0 z-[45] bg-slate-900/30 sm:hidden" onClick={() => setOuvert(false)} aria-hidden="true" />
          <section role="dialog" aria-label={c.nom}
            className="fixed inset-x-0 bottom-0 z-[46] flex h-[85dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(600px,calc(100dvh-3rem))] sm:w-[380px] sm:rounded-3xl sm:border sm:border-slate-200">
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3">
              {photo(38)}
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold leading-tight text-slate-900">{c.nom}</p>
                <p className="flex items-center gap-1.5 text-[12.5px] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-green-600" />{c.sousTitre}</p>
              </div>
              {/* La langue suit la page ; ce lien ouvre la même page dans l'autre langue. Le
                  code de la langue plutôt qu'un drapeau, comme l'en-tête du site (25/09/2026). */}
              <a href={`/${lang === 'fr' ? 'en' : 'fr'}${chemin.replace(/^\/(fr|en)/, '')}`} aria-label={c.changerLangue} title={c.changerLangue}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-[12px] font-semibold tracking-wide text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                onClick={() => pousser('site_assistant_langue', { assistant_langue: lang === 'fr' ? 'en' : 'fr' })}>
                {lang === 'fr' ? 'EN' : 'FR'}
              </a>
              <button type="button" aria-label={c.fermer} onClick={() => setOuvert(false)} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
                <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="flex flex-col gap-2.5">
                {s.items.map((it, n) => {
                  const avant = s.items[n - 1];
                  if (it.k === 'evt') return <p key={n} className="self-center rounded-full bg-slate-100 px-3 py-1 text-[12px] text-slate-500">{it.texte}</p>;
                  if (it.k === 'plan') return <div key={n}>{carte(it.plan, it.budget)}</div>;
                  const nouveauLocuteur = !avant || avant.k !== it.k;
                  const nom = it.k === 'moi' ? c.vous : it.k === 'paul' ? c.paul : c.assistant;
                  return (
                    <div key={n} className={`flex flex-col ${it.k === 'moi' ? 'items-end' : 'items-start'}`}>
                      {nouveauLocuteur && <p className="mb-1 px-1 text-[11.5px] font-semibold text-slate-500">{nom}</p>}
                      <p className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-snug ${
                        it.k === 'moi' ? 'rounded-br-md bg-marque text-white' : it.k === 'paul' ? 'rounded-bl-md bg-slate-900 text-white' : 'rounded-bl-md bg-slate-100 text-slate-900'
                      }`}>{it.texte}</p>
                    </div>
                  );
                })}
                <div className="mt-1">{choix()}</div>
                <div ref={fondRef} />
              </div>
            </div>

            <form className="shrink-0 border-t border-slate-100 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3" onSubmit={(e) => { e.preventDefault(); void envoyer(texte); }}>
              {erreur && <p className="mb-2 px-1 text-[13px] text-red-700" role="alert">{c.erreur}</p>}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={piege} onChange={(e) => setPiege(e.target.value)} name="website_url" />
              <div className="flex items-end gap-2">
                <textarea ref={champRef} rows={1} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder={c.placeholder} aria-label={c.placeholder}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void envoyer(texte); } }}
                  className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-marque focus:outline-none focus:ring-1 focus:ring-marque" />
                <button type="submit" aria-label={c.envoyer} disabled={!texte.trim() || envoi}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-marque text-white transition-colors hover:bg-marque-fonce disabled:opacity-40">
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </>
  );
}
