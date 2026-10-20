/**
 * Calculateur v6 : le moteur, sans aucune interface.
 *
 * Pourquoi un moteur séparé : jusqu'en septembre 2026, le prix était calculé deux fois
 * (le useMemo de l'écran et le détail envoyé au mail). Les deux ont divergé sur le lead
 * ai-coustics du 22/09 : 1 750 EUR annoncés pour 1 400 EUR de lignes. Ici, `devis()` est
 * la seule source : l'écran, le récapitulatif, le webhook et le suivi GA4 lisent tous son
 * résultat.
 *
 * Les prix ne sont PAS écrits ici : ils viennent des fichiers `../calculator/data/*.ts`,
 * que Paul corrige via le tableau du document de pilotage
 * (docs/calculator/refonte-2026-09/calculateur-en-etapes.html).
 */
import {
  domainConfigs,
  DURATION_CONFIG,
  MANAGEMENT_FEE_CONFIG,
  calculateManagementFee,
  socialChannels,
  aiTrainingPricing,
  trackingAuditOption,
  trackingServices,
  convertPrice,
  CURRENCY_CONFIGS,
  aiSolutionsQuestions
} from '../calculator/data';
import { CONTACT_PRICING_CONFIG, getContactTotalPrice, getContactUnitPrice, type ContactType } from '../calculator/data/emailing-services';
import { generateRecommendation, budgetOptionToValue } from '../calculator/guided-data';
import type { Currency, ServiceDomain } from '../calculator/types';
// Le devis unique (20/10/2026, Paul : « le calculateur, c'est le truc global, mais chaque page
// peut avoir un extrait »). La formation et la créa ont leurs propres grilles, à prix FIXÉS par
// devise : le calculateur les chiffre avec leurs moteurs au lieu de garder une copie simplifiée.
import { GRILLE, ACADEMY_REPLI, type PrixAcademy, type Zone } from '../../lib/formation/grille';
import { academyHT, chiffrer as chiffrerFormation, ZONES as ZONES_FORMATION, type Etat as EtatFormation } from '../../lib/formation/moteur';
import { GRILLE_CREA, type Canal, type Video } from '../../lib/creative/grille';
import { chiffrer as chiffrerCrea, MAX as MAX_CREA, nomCanal, type EtatCrea } from '../../lib/creative/moteur';

export type Lang = 'fr' | 'en';
export type Txt = { fr: string; en: string };
export const t = (x: Txt | undefined, lang: Lang): string => (x ? x[lang] : '');

export const DOMAIN_ORDER = Object.keys(domainConfigs) as ServiceDomain[];
export const DURATION_CONFIG_MOIS: number[] = DURATION_CONFIG.options.map((o) => o.months);

/** Le curseur de budget avance par paliers : sur un curseur linéaire de 500 à 50 000,
 * tout ce qui se joue entre 500 et 5 000 tenait dans le premier dixième. */
export const BUDGET_STEPS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 40000, 50000];
export const DEFAULT_BUDGET = 2000;
export const TRAVEL_COST = aiTrainingPricing.travelCost.default;
/** Publication automatique dans le CMS : 100 EUR/mois, valeur de l'ancien calculateur (cmsAddon). */
export const CMS_ADDON_PRICE = 100;
export const CONTACT_VOLUMES = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000];
export const DEFAULT_CONTACT_VOLUME = 1000;
export const CONTACT_TYPES = Object.keys(CONTACT_PRICING_CONFIG.prices) as ContactType[];
export const AI_CUSTOM_FIELDS = aiSolutionsQuestions;

/** L'acquisition de contacts a ses propres questions (type puis volume), pas un niveau. */
const EXCLUDED_SERVICES = new Set(['email-contacts-package']);

export type QuestionKind = 'level' | 'budget' | 'channels' | 'choice' | 'multi' | 'volume' | 'form' | 'compteurs';
export interface Option {
  value: string | number; label: Txt; desc?: Txt; price?: number; oneOff?: boolean; info?: string; /** Prix unitaire le plus bas (contacts). */ unitFrom?: number;
  /** Un prix FIXÉ dans chaque devise (formation, créa) : affiché tel quel, jamais converti. */
  prixDevise?: Record<Currency, number>;
  /** Ce que couvre le prix affiché (« la séance », « par personne »), à la place de « une fois ». */
  unite?: Txt;
}
/** Un réglage d'un écran à compteurs : un nombre (avec - et +) ou un choix en segments. */
export interface Champ { id: string; kind: 'nombre' | 'segment'; label: Txt; min?: number; max?: number; options?: { value: string; label: Txt }[] }
export interface Question {
  id: string;
  domain: ServiceDomain;
  kind: QuestionKind;
  title: Txt;
  help?: Txt;
  service?: string;
  /** Question posée seulement si la condition est vraie (ex. le volume de contacts). */
  when?: (a: Answers) => boolean;
  /** Les réglages d'un écran à compteurs (`kind: 'compteurs'`). */
  fields?: Champ[];
}

// --- la formation et la créa, avec leurs propres moteurs -------------------------------------

/**
 * Les réponses par défaut de la formation et de la créa : ce sont celles des simulateurs des
 * pages AI Training et Creative design, si bien que le prix s'affiche dès que le service est
 * choisi, et qu'un écran à compteurs n'a rien d'obligatoire.
 */
export const DEFAUTS: Answers = {
  'tr-format': 'half', 'tr-n': 12, 'tr-mode': 'remote', 'tr-zone': 'paris', 'tr-academy': 'no',
  'cr-jeux': 3, 'cr-canal': 'li', 'cr-videos': 1, 'cr-duree': 'v20', 'cr-langues': 0, 'cr-docs': 0, 'cr-sb': 0, 'cr-rythme': 'once'
};
/** Une réponse, ou sa valeur par défaut. */
export const reponse = (a: Answers, id: string) => (a[id] !== undefined && a[id] !== null ? a[id] : DEFAUTS[id]);
const nombre = (a: Answers, id: string, max: number) => Math.max(0, Math.min(max, Math.round(Number(reponse(a, id)) || 0)));

/** Le prix public de l'Academy : l'instantané, ou le prix lu dans l'API par la page AI Training. */
let PRIX_ACADEMY: PrixAcademy = ACADEMY_REPLI;
export function fixerPrixAcademy(p: PrixAcademy) { PRIX_ACADEMY = p; }
export const prixAcademy = () => PRIX_ACADEMY;

export function etatFormation(a: Answers, devise: Currency): EtatFormation {
  const g = a['tr-groupes'];
  return {
    n: Math.max(1, nombre(a, 'tr-n', 2000)),
    duree: reponse(a, 'tr-format') === 'full' ? 'jour' : '3h',
    mode: reponse(a, 'tr-mode') === 'onsite' ? 'site' : 'distance',
    zone: (String(reponse(a, 'tr-zone')) in ZONES_FORMATION ? reponse(a, 'tr-zone') : 'paris') as Zone,
    hotel: a['tr-hotel'] === 'yes',
    groupes: g === 'pleniere' ? 'pleniere' : typeof g === 'number' ? g : 'auto',
    academy: reponse(a, 'tr-academy') === 'yes',
    devise
  };
}
/** Le chemin inverse : le simulateur de la page AI Training écrit ses réglages dans le devis. */
export function reponsesFormation(e: EtatFormation): Answers {
  return {
    'tr-n': e.n, 'tr-format': e.duree === 'jour' ? 'full' : 'half', 'tr-mode': e.mode === 'site' ? 'onsite' : 'remote', 'tr-zone': e.zone,
    'tr-hotel': e.hotel ? 'yes' : 'no', 'tr-groupes': e.groupes, 'tr-academy': e.academy ? 'yes' : 'no'
  };
}
export function etatCrea(a: Answers, devise: Currency): EtatCrea {
  const k = reponse(a, 'cr-canal');
  return {
    jeux: nombre(a, 'cr-jeux', MAX_CREA.jeux),
    canal: (k === 'pm' || k === 'both' ? k : 'li') as Canal,
    videos: nombre(a, 'cr-videos', MAX_CREA.videos),
    duree: (reponse(a, 'cr-duree') === 'v30' ? 'v30' : 'v20') as Video,
    langues: nombre(a, 'cr-langues', MAX_CREA.langues),
    docs: nombre(a, 'cr-docs', MAX_CREA.docs),
    storyboards: nombre(a, 'cr-sb', MAX_CREA.storyboards),
    devise
  };
}
export function reponsesCrea(e: EtatCrea): Answers {
  return { 'cr-jeux': e.jeux, 'cr-canal': e.canal, 'cr-videos': e.videos, 'cr-duree': e.duree, 'cr-langues': e.langues, 'cr-docs': e.docs, 'cr-sb': e.storyboards };
}
/** Une demande créative chiffrée une fois, ou chaque mois (le même volume, tous les mois). */
export const creaMensuelle = (a: Answers) => reponse(a, 'cr-rythme') === 'month';

const LEVEL_TITLES: Record<string, Txt> = {
  'seo-audit': { fr: 'Un audit SEO pour démarrer ?', en: 'Start with an SEO audit?' },
  'seo-monthly': { fr: 'Un accompagnement SEO chaque mois ?', en: 'Monthly SEO support?' },
  'social-creatives': { fr: 'Des visuels publicitaires chaque mois ?', en: 'Ad creatives every month?' },
  'social-feed-catalogue': { fr: 'Un catalogue produits à connecter ?', en: 'A product catalogue to connect?' },
  'email-management-package': { fr: 'Vos campagnes email gérées chaque mois ?', en: 'Monthly email campaign management?' },
  'ai-content-blog': { fr: 'Des articles de blog SEO chaque mois ?', en: 'SEO blog articles every month?' },
  'ai-content-social': { fr: 'Du contenu social et des landing pages ?', en: 'Social content and landing pages?' },
  'ai-chatbot': { fr: 'Un chatbot IA ?', en: 'An AI chatbot?' },
  'ai-workflow': { fr: 'Des tâches automatisées ?', en: 'Automated workflows?' },
  'ai-maintenance': { fr: 'Un suivi une fois en place ?', en: 'Ongoing maintenance?' },
  'creative-packs': { fr: 'Combien de créas chaque mois ?', en: 'How many ads every month?' }
};

/** Nom court d'un service, pour les lignes du devis. */
export const SERVICE_SHORT: Record<string, Txt> = {
  'seo-audit': { fr: 'Audit SEO', en: 'SEO audit' },
  'seo-monthly': { fr: 'SEO mensuel', en: 'Monthly SEO' },
  'social-creatives': { fr: 'Création de visuels', en: 'Visual creation' },
  'social-feed-catalogue': { fr: 'Catalogue produits', en: 'Product catalogue' },
  'email-management-package': { fr: 'Campagnes email', en: 'Email campaigns' },
  'ai-content-blog': { fr: 'Articles de blog', en: 'Blog articles' },
  'ai-content-social': { fr: 'Contenu social et landing pages', en: 'Social content and landing pages' },
  'ai-chatbot': { fr: 'Chatbot IA', en: 'AI chatbot' },
  'ai-workflow': { fr: 'Workflows automatisés', en: 'Automated workflows' },
  'ai-maintenance': { fr: 'Maintenance IA', en: 'AI maintenance' },
  'creative-packs': { fr: 'Production créative', en: 'Creative production' }
};

export const DOMAIN_SHORT: Record<ServiceDomain, Txt> = {
  'seo': { fr: 'SEO', en: 'SEO' },
  'google-ads': { fr: 'Google Ads', en: 'Google Ads' },
  'paid-social': { fr: 'Paid Social', en: 'Paid Social' },
  'ai-training': { fr: 'Formation IA', en: 'AI Training' },
  'emailing': { fr: 'Emailing', en: 'Email' },
  'ai-solutions': { fr: 'Solutions IA', en: 'AI Solutions' },
  'ai-content': { fr: 'Contenu IA', en: 'AI Content' },
  'tracking-reporting': { fr: 'Tracking', en: 'Tracking' },
  'creative-design': { fr: 'Creative design', en: 'Creative design' }
};

export const domainName = (d: ServiceDomain, lang: Lang) => (lang === 'fr' ? domainConfigs[d].nameFr : domainConfigs[d].name);
export const domainDesc = (d: ServiceDomain, lang: Lang) => (lang === 'fr' ? domainConfigs[d].descriptionFr : domainConfigs[d].description);

function levelQuestion(domain: ServiceDomain, service: string): Question {
  return { id: service, domain, kind: 'level', service, title: LEVEL_TITLES[service] ?? { fr: service, en: service } };
}

/** Les questions d'un service, dans l'ordre où le visiteur y répond. */
export function questionsFor(domain: ServiceDomain): Question[] {
  if (domain === 'google-ads') {
    return [{ id: 'ga-budget', domain, kind: 'budget', title: { fr: 'Quel budget média par mois sur Google ?', en: 'Monthly media budget on Google?' },
      help: { fr: 'Dépensé sur Google, en plus de nos honoraires. Il n’est pas inclus dans le devis.', en: 'Spent on Google, on top of our fees. It is not included in the quote.' } }];
  }
  if (domain === 'paid-social') {
    return [
      { id: 'ps-channels', domain, kind: 'channels', title: { fr: 'Sur quels réseaux ?', en: 'Which networks?' },
        help: { fr: 'Plusieurs réponses possibles. Nos frais de gestion augmentent avec chaque réseau ajouté.', en: 'Pick as many as you need. Our management fee grows with each extra network.' } },
      { id: 'ps-budget', domain, kind: 'budget', title: { fr: 'Quel budget média par mois sur ces réseaux ?', en: 'Monthly media budget across these networks?' },
        help: { fr: 'Dépensé sur les réseaux, en plus de nos honoraires. Il n’est pas inclus dans le devis.', en: 'Spent on the networks, on top of our fees. It is not included in the quote.' } },
      levelQuestion(domain, 'social-creatives'),
      levelQuestion(domain, 'social-feed-catalogue')
    ];
  }
  if (domain === 'ai-training') {
    // Les questions du simulateur de la page AI Training, dans l'ordre où elles décident du prix.
    return [
      { id: 'tr-format', domain, kind: 'choice', title: { fr: 'Quel format ?', en: 'Which format?' },
        help: { fr: 'Le prix d’une séance, pour un groupe jusqu’à 20 personnes.', en: 'The price of one session, for a group of up to 20 people.' } },
      { id: 'tr-n', domain, kind: 'compteurs', title: { fr: 'Combien de personnes à former ?', en: 'How many people to train?' },
        help: { fr: 'Des groupes de 15 au plus : au-delà, on vous propose plusieurs séances, avec une remise de volume.', en: 'Groups of 15 at most: beyond that, we suggest several sessions, with a volume discount.' },
        fields: [{ id: 'tr-n', kind: 'nombre', label: { fr: 'Personnes', en: 'People' }, min: 1, max: 2000 }] },
      { id: 'tr-mode', domain, kind: 'choice', title: { fr: 'À distance ou dans vos locaux ?', en: 'Remote or at your office?' } },
      { id: 'tr-zone', domain, kind: 'choice', title: { fr: 'Où se passe la formation ?', en: 'Where does the training take place?' },
        help: { fr: 'Nous partons de Londres : un aller-retour par destination.', en: 'We travel from London: one return trip per destination.' },
        when: (a) => reponse(a, 'tr-mode') === 'onsite' },
      { id: 'tr-academy', domain, kind: 'choice', title: { fr: 'L’AI Academy en plus, pour continuer en ligne ?', en: 'Add the AI Academy, to keep going online?' },
        help: { fr: 'La formation en ligne pour chaque participant, à -30 % avec une formation.', en: 'The online course for every participant, 30% off with a training.' } }
    ];
  }
  if (domain === 'creative-design') {
    // Les réglages du simulateur de la page Creative design, regroupés en trois écrans.
    const canal = (['li', 'pm', 'both'] as Canal[]).map((k) => ({ value: k, label: { fr: nomCanal(k, 'fr'), en: nomCanal(k, 'en') } }));
    return [
      { id: 'cr-jeux', domain, kind: 'compteurs', title: { fr: 'Combien de jeux de bannières ?', en: 'How many banner sets?' },
        help: { fr: 'Un jeu par message, dans toutes les tailles du canal. Le prix par jeu baisse avec le nombre.', en: 'One set per message, in every size of the channel. The price per set drops with the number.' },
        fields: [
          { id: 'cr-jeux', kind: 'nombre', label: { fr: 'Jeux de bannières', en: 'Banner sets' }, min: 0, max: MAX_CREA.jeux },
          { id: 'cr-canal', kind: 'segment', label: { fr: 'Canal', en: 'Channel' }, options: canal }
        ] },
      { id: 'cr-videos', domain, kind: 'compteurs', title: { fr: 'Des vidéos ?', en: 'Any videos?' },
        help: { fr: 'Script et motion design, livrées en 16:9, 1:1 et 9:16.', en: 'Script and motion design, delivered in 16:9, 1:1 and 9:16.' },
        fields: [
          { id: 'cr-videos', kind: 'nombre', label: { fr: 'Vidéos', en: 'Videos' }, min: 0, max: MAX_CREA.videos },
          { id: 'cr-duree', kind: 'segment', label: { fr: 'Durée', en: 'Length' }, options: [{ value: 'v20', label: { fr: '15 à 20 s', en: '15 to 20 s' } }, { value: 'v30', label: { fr: '20 à 30 s', en: '20 to 30 s' } }] }
        ] },
      { id: 'cr-extras', domain, kind: 'compteurs', title: { fr: 'D’autres langues, des document ads ?', en: 'Other languages, document ads?' },
        help: { fr: 'Facultatif. Une langue en plus coûte 30 % du prix de chaque jeu.', en: 'Optional. An extra language costs 30% of each set’s price.' },
        fields: [
          { id: 'cr-langues', kind: 'nombre', label: { fr: 'Langues en plus', en: 'Extra languages' }, min: 0, max: MAX_CREA.langues },
          { id: 'cr-docs', kind: 'nombre', label: { fr: 'Document ads', en: 'Document ads' }, min: 0, max: MAX_CREA.docs },
          { id: 'cr-sb', kind: 'nombre', label: { fr: 'Storyboards seuls', en: 'Storyboards only' }, min: 0, max: MAX_CREA.storyboards }
        ] },
      { id: 'cr-rythme', domain, kind: 'choice', title: { fr: 'Une seule fois, ou chaque mois ?', en: 'Just once, or every month?' },
        help: { fr: 'Chaque mois : le même volume de créas, renouvelé tous les mois.', en: 'Every month: the same volume of creatives, renewed every month.' } }
    ];
  }
  if (domain === 'seo') {
    return [
      levelQuestion(domain, 'seo-audit'),
      levelQuestion(domain, 'seo-monthly'),
      { id: 'seo-cms', domain, kind: 'choice', title: { fr: 'Publier les articles directement sur votre site ?', en: 'Publish the articles straight to your site?' },
        help: { fr: 'Les articles du mois sont mis en ligne dans votre CMS, sans copier-coller de votre côté.', en: 'Each month’s articles go live in your CMS, with no copy and paste on your side.' },
        when: (a) => typeof a['seo-monthly'] === 'number' }
    ];
  }
  if (domain === 'emailing') {
    return [
      levelQuestion(domain, 'email-management-package'),
      { id: 'em-contacts', domain, kind: 'choice', title: { fr: 'Des contacts à acquérir pour vos campagnes ?', en: 'Contacts to acquire for your campaigns?' },
        help: { fr: 'Contacts vérifiés, prix dégressif selon le volume. Frais uniques.', en: 'Verified contacts, lower unit price as volume grows. One-off fees.' } },
      { id: 'em-volume', domain, kind: 'volume', title: { fr: 'Combien de contacts ?', en: 'How many contacts?' },
        when: (a) => typeof a['em-contacts'] === 'string' && a['em-contacts'] !== 'none' }
    ];
  }
  if (domain === 'ai-solutions') {
    return [
      levelQuestion(domain, 'ai-chatbot'),
      levelQuestion(domain, 'ai-workflow'),
      levelQuestion(domain, 'ai-maintenance'),
      { id: 'ai-custom', domain, kind: 'choice', title: { fr: 'Un projet IA sur mesure ?', en: 'A custom AI project?' },
        help: { fr: 'Agent IA, analyse de données, intégration : on le chiffre avec vous.', en: 'AI agent, data analysis, integration: we price it with you.' } },
      { id: 'ai-custom-form', domain, kind: 'form', title: { fr: 'Parlez-nous de votre projet', en: 'Tell us about your project' },
        help: { fr: 'Quelques lignes suffisent, on revient vers vous avec un chiffrage.', en: 'A few lines are enough, we come back to you with a price.' },
        when: (a) => a['ai-custom'] === 'yes' }
    ];
  }
  if (domain === 'tracking-reporting') {
    return [{ id: 'trk-items', domain, kind: 'multi', title: { fr: 'Qu’est-ce qu’il faut mettre en place ?', en: 'What needs setting up?' },
      help: { fr: 'Plusieurs réponses possibles. Frais uniques.', en: 'Pick as many as you need. One-off fees.' } }];
  }
  return domainConfigs[domain].services
    .filter((s) => !EXCLUDED_SERVICES.has(s.id))
    .map((s) => levelQuestion(domain, s.id));
}

export const QUESTION_INDEX: Record<string, Question> = Object.fromEntries(
  DOMAIN_ORDER.flatMap((d) => questionsFor(d).map((q) => [q.id, q]))
);
/** Toutes les réponses qu'un devis peut porter : les questions, les réglages des écrans à
 *  compteurs, et deux réglages que seul le simulateur de la page AI Training expose. */
export const ANSWER_KEYS = new Set<string>([
  ...Object.keys(QUESTION_INDEX),
  ...Object.values(QUESTION_INDEX).flatMap((q) => (q.fields ?? []).map((f) => f.id)),
  'tr-hotel', 'tr-groupes'
]);

/** Options d'une question à choix. Les prix de la formation dépendent du format déjà choisi. */
export function optionsFor(q: Question, answers: Answers): Option[] {
  if (q.kind === 'level') {
    const service = domainConfigs[q.domain].services.find((s) => s.id === q.service)!;
    return service.levels.map((l, i) => ({
      value: i,
      label: { fr: l.name, en: l.nameEn || l.name },
      desc: { fr: l.features?.[0] ?? '', en: (l.featuresEn ?? l.features)?.[0] ?? '' },
      price: l.price,
      oneOff: !!(l.isOneOff || service.isOneOff),
      info: `lvl:${q.service}:${i}`
    }));
  }
  // La formation : les prix de la grille, fixés dans chaque devise.
  const laSeance: Txt = { fr: 'la séance', en: 'per session' };
  if (q.id === 'tr-format') {
    const mode = reponse(answers, 'tr-mode') === 'onsite' ? 'site' : 'distance';
    return [
      { value: 'half', label: { fr: 'Séance de 3 h', en: '3-hour session' }, desc: { fr: 'Notre format de prédilection', en: 'Our preferred format' }, prixDevise: GRILLE.durees['3h'][mode], unite: laSeance, info: 'train:half' },
      { value: 'full', label: { fr: 'Journée complète', en: 'Full day' }, desc: { fr: 'Pour aller au fond', en: 'To go deep' }, prixDevise: GRILLE.durees.jour[mode], unite: laSeance, info: 'train:full' }
    ];
  }
  if (q.id === 'tr-mode') {
    const d = reponse(answers, 'tr-format') === 'full' ? 'jour' : '3h';
    return [
      { value: 'remote', label: { fr: 'À distance', en: 'Remote' }, desc: { fr: 'En visio, sans déplacement', en: 'By video call, no travel' }, prixDevise: GRILLE.durees[d].distance, unite: laSeance, info: 'train:remote' },
      { value: 'onsite', label: { fr: 'Dans vos locaux', en: 'At your office' }, desc: { fr: 'Plus le déplacement, selon la destination', en: 'Plus travel, depending on the destination' }, prixDevise: GRILLE.durees[d].site, unite: laSeance, info: 'train:onsite' }
    ];
  }
  if (q.id === 'tr-zone') {
    return (Object.keys(ZONES_FORMATION) as Zone[]).map((z) => {
      const trajet = GRILLE.deplacement.zones[z];
      return {
        value: z, label: ZONES_FORMATION[z],
        desc: trajet == null ? { fr: 'Déplacement chiffré à la demande', en: 'Travel quoted on request' } : trajet.EUR === 0 ? { fr: 'Déplacement compris', en: 'Travel included' } : { fr: 'Un aller-retour', en: 'One return trip' },
        ...(trajet && trajet.EUR > 0 ? { prixDevise: trajet, unite: { fr: 'le trajet', en: 'per trip' } } : {}),
        info: 'train:zone'
      };
    });
  }
  if (q.id === 'tr-academy') {
    const n = Math.max(1, nombre(answers, 'tr-n', 2000));
    const unitaire = { EUR: academyHT(PRIX_ACADEMY, 'EUR', n, true), GBP: academyHT(PRIX_ACADEMY, 'GBP', n, true), USD: academyHT(PRIX_ACADEMY, 'USD', n, true) };
    return [
      { value: 'no', label: { fr: 'Non merci', en: 'No thanks' }, info: 'train:academy' },
      { value: 'yes', label: { fr: 'Oui, pour chaque participant', en: 'Yes, for every participant' }, desc: { fr: 'Accès complet à la formation en ligne, hors taxes', en: 'Full access to the online course, excl. VAT' }, prixDevise: unitaire, unite: { fr: 'par personne', en: 'per person' }, info: 'train:academy' }
    ];
  }
  if (q.id === 'cr-rythme') {
    return [
      { value: 'once', label: { fr: 'Une seule fois', en: 'Just once' }, desc: { fr: 'Une demande, livrée et terminée', en: 'One request, delivered and done' }, info: 'crea:rythme' },
      { value: 'month', label: { fr: 'Chaque mois', en: 'Every month' }, desc: { fr: 'Le même volume, renouvelé tous les mois', en: 'The same volume, renewed every month' }, info: 'crea:rythme' }
    ];
  }
  if (q.id === 'seo-cms') {
    return [
      { value: 'no', label: { fr: 'Non merci', en: 'No thanks' }, desc: { fr: 'Nous vous livrons les articles, vous les publiez', en: 'We deliver the articles, you publish them' }, info: 'cms' },
      { value: 'yes', label: { fr: 'Oui, publication automatique', en: 'Yes, automatic publishing' }, price: CMS_ADDON_PRICE, info: 'cms' }
    ];
  }
  if (q.id === 'em-contacts') {
    return [
      { value: 'none', label: { fr: 'Non merci', en: 'No thanks' }, desc: { fr: 'J’ai déjà ma base de contacts', en: 'I already have my contact list' } },
      ...CONTACT_TYPES.map((type) => {
        const lbl = CONTACT_PRICING_CONFIG.labels[type];
        const d = CONTACT_PRICING_CONFIG.descriptions[type];
        const from = CONTACT_PRICING_CONFIG.prices[type][CONTACT_PRICING_CONFIG.prices[type].length - 1];
        return { value: type, label: { fr: stripEmoji(lbl.fr), en: stripEmoji(lbl.en) }, desc: { fr: d.fr, en: d.en }, info: `cnt:${type}`, unitFrom: from };
      })
    ];
  }
  if (q.id === 'ai-custom') {
    return [
      { value: 'no', label: { fr: 'Non merci', en: 'No thanks' }, info: 'svc:ai-workflow' },
      { value: 'yes', label: { fr: 'Oui, je le décris', en: 'Yes, let me describe it' }, desc: { fr: 'Chiffré sur devis', en: 'Priced on quote' }, info: 'aicustom' }
    ];
  }
  if (q.kind === 'multi') {
    return [trackingAuditOption, ...trackingServices].map((s) => ({
      value: s.id, label: { fr: s.titleFr.replace(/^[A-Z]\.\s*/, ''), en: s.title.replace(/^[A-Z]\.\s*/, '') }, price: s.price, oneOff: true, info: `trk:${s.id}`
    }));
  }
  if (q.kind === 'channels') {
    return socialChannels.map((c) => ({ value: c.id, label: { fr: c.nameFr, en: c.name }, info: `ch:${c.id}` }));
  }
  return [];
}

// --- l'état et le calcul -----------------------------------------------------------

export const stripEmoji = (x: string) => x.replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu, '').trim();
export type Answers = Record<string, string | number | null | string[] | Record<string, string> | undefined>;
export interface QuoteState {
  domains: ServiceDomain[];
  answers: Answers;
  discuss: Partial<Record<ServiceDomain, boolean>>;
  duration: number;
}
export const emptyState = (): QuoteState => ({ domains: [], answers: {}, discuss: {}, duration: 4 });

export type Per = 'month' | 'once' | 'media' | 'quote';
export interface Line { label: Txt; amount: number; per: Per; info?: string; service?: string; level?: Txt; kind: 'fee' | 'media' | 'service'; /** Le détail du calcul (formation, créa). */ detail?: Txt }
export interface DomainQuote { domain: ServiceDomain; discuss: boolean; lines: Line[]; monthly: number; oneOff: number; fee: number; media: number; empty: boolean }
export interface Quote {
  /** La devise de TOUS les montants ci-dessous. */
  currency: Currency;
  domains: DomainQuote[];
  servicesMonthly: number;
  feesMonthly: number;
  beforeDiscount: number;
  discountPct: number;
  discount: number;
  monthly: number;
  oneOff: number;
  media: number;
  totalFees: number;
}

const budgetOf = (a: Answers, id: string) => (typeof a[id] === 'number' ? (a[id] as number) : DEFAULT_BUDGET);
export const channelsOf = (a: Answers) => (Array.isArray(a['ps-channels']) ? (a['ps-channels'] as string[]) : []);

/** Les lignes de la formation, telles que les chiffre le simulateur de la page AI Training. */
function lignesFormation(a: Answers, currency: Currency): Line[] {
  const fr = chiffrerFormation(etatFormation(a, currency), PRIX_ACADEMY, 'fr');
  const en = chiffrerFormation(etatFormation(a, currency), PRIX_ACADEMY, 'en');
  return fr.lignes.map((l, k) => ({
    kind: 'service', service: 'ai-training', info: `train:${l.cle}`,
    label: { fr: l.libelle, en: en.lignes[k].libelle }, detail: { fr: l.detail, en: en.lignes[k].detail },
    amount: l.montant ?? 0, per: l.montant == null ? 'quote' : 'once'
  }));
}
/** Les lignes de la créa, telles que les chiffre le simulateur de la page Creative design. */
function lignesCrea(a: Answers, currency: Currency): Line[] {
  const fr = chiffrerCrea(etatCrea(a, currency), 'fr');
  const en = chiffrerCrea(etatCrea(a, currency), 'en');
  const per: Per = creaMensuelle(a) ? 'month' : 'once';
  return fr.lignes.map((l, k) => ({
    kind: 'service', service: 'creative', info: `crea:${l.cle}`,
    label: { fr: l.libelle, en: en.lignes[k].libelle }, detail: { fr: l.detail, en: en.lignes[k].detail },
    amount: l.montant, per
  }));
}

/**
 * Le seul calcul de prix. Tous les montants sortent dans `currency` : les grilles en euros du
 * calculateur sont converties ligne par ligne (`convertPrice`, prix ronds), la formation et la
 * créa sont chiffrées directement dans la devise, à leurs prix fixés. Les totaux additionnent
 * les lignes affichées, donc l'écran, le mail et la mesure tombent toujours juste.
 */
export function devis(st: QuoteState, currency: Currency = 'EUR'): Quote {
  const a = st.answers;
  const cv = (eur: number) => convertPrice(eur, currency);
  const out: DomainQuote[] = [];
  let servicesMonthly = 0, feesMonthly = 0, oneOff = 0, media = 0;

  for (const d of st.domains) {
    if (st.discuss[d]) { out.push({ domain: d, discuss: true, lines: [], monthly: 0, oneOff: 0, fee: 0, media: 0, empty: true }); continue; }
    const lines: Line[] = [];
    let fee = 0, med = 0;
    if (d === 'google-ads' || d === 'paid-social') {
      const budget = budgetOf(a, d === 'google-ads' ? 'ga-budget' : 'ps-budget');
      const n = d === 'paid-social' ? Math.max(channelsOf(a).length, 1) : 1;
      fee = cv(calculateManagementFee(d, budget, n).fee);
      med = cv(budget);
      lines.push({ kind: 'fee', label: n > 1 ? { fr: `Gestion des campagnes, ${n} réseaux`, en: `Campaign management, ${n} networks` } : { fr: 'Gestion des campagnes', en: 'Campaign management' }, amount: fee, per: 'month', info: 'fee' });
      lines.push({ kind: 'media', label: { fr: 'Budget média (non inclus)', en: 'Media budget (not included)' }, amount: med, per: 'media', info: 'media' });
    }
    for (const q of questionsFor(d)) {
      if (q.kind !== 'level') continue;
      const v = a[q.id];
      if (typeof v !== 'number') continue;
      const service = domainConfigs[d].services.find((s) => s.id === q.service)!;
      const level = service.levels[v];
      if (!level) continue;
      const once = !!(level.isOneOff || service.isOneOff);
      lines.push({ kind: 'service', service: q.service, level: { fr: level.name, en: level.nameEn || level.name },
        label: { fr: `${SERVICE_SHORT[q.service!].fr}, ${level.name}`, en: `${SERVICE_SHORT[q.service!].en}, ${level.nameEn || level.name}` },
        amount: cv(level.price), per: once ? 'once' : 'month', info: `lvl:${q.service}:${v}` });
    }
    if (d === 'ai-training') lines.push(...lignesFormation(a, currency));
    if (d === 'creative-design') lines.push(...lignesCrea(a, currency));
    if (d === 'seo' && a['seo-cms'] === 'yes' && typeof a['seo-monthly'] === 'number') {
      lines.push({ kind: 'service', service: 'cms', label: { fr: 'Publication automatique dans votre CMS', en: 'Automatic CMS publishing' }, level: { fr: 'Option', en: 'Add-on' },
        amount: cv(CMS_ADDON_PRICE), per: 'month', info: 'cms' });
    }
    if (d === 'emailing' && typeof a['em-contacts'] === 'string' && a['em-contacts'] !== 'none') {
      const type = a['em-contacts'] as ContactType;
      const volume = typeof a['em-volume'] === 'number' ? (a['em-volume'] as number) : DEFAULT_CONTACT_VOLUME;
      const lbl = CONTACT_PRICING_CONFIG.labels[type];
      lines.push({ kind: 'service', service: 'contacts', label: { fr: `${stripEmoji(lbl.fr)}, ${volume.toLocaleString('fr-FR')} contacts`, en: `${stripEmoji(lbl.en)}, ${volume.toLocaleString('en-GB')} contacts` },
        level: { fr: `${stripEmoji(lbl.fr)}, ${volume} contacts`, en: `${stripEmoji(lbl.en)}, ${volume} contacts` },
        amount: cv(getContactTotalPrice(type, volume)), per: 'once', info: `cnt:${type}` });
    }
    if (d === 'ai-solutions' && a['ai-custom'] === 'yes') {
      lines.push({ kind: 'service', service: 'ai-custom', label: { fr: 'Projet IA sur mesure', en: 'Custom AI project' }, level: { fr: 'Sur devis', en: 'Custom quote' },
        amount: 0, per: 'quote', info: 'aicustom' });
    }
    if (d === 'tracking-reporting') {
      const all = [trackingAuditOption, ...trackingServices];
      for (const id of (Array.isArray(a['trk-items']) ? (a['trk-items'] as string[]) : [])) {
        const s = all.find((x) => x.id === id);
        if (s) lines.push({ kind: 'service', service: s.id, label: { fr: s.titleFr.replace(/^[A-Z]\.\s*/, ''), en: s.title.replace(/^[A-Z]\.\s*/, '') }, amount: cv(s.price), per: 'once', info: `trk:${s.id}` });
      }
    }
    const monthly = lines.filter((l) => l.per === 'month').reduce((s, l) => s + l.amount, 0);
    const once = lines.filter((l) => l.per === 'once').reduce((s, l) => s + l.amount, 0);
    servicesMonthly += monthly - fee;
    feesMonthly += fee;
    oneOff += once;
    media += med;
    out.push({ domain: d, discuss: false, lines, monthly, oneOff: once, fee, media: med, empty: lines.filter((l) => l.kind !== 'media').length === 0 });
  }

  const beforeDiscount = servicesMonthly + feesMonthly;
  const discountPct = DURATION_CONFIG.options.find((o) => o.months === st.duration)?.discount ?? 0;
  const discount = beforeDiscount * discountPct / 100;
  const monthly = beforeDiscount - discount;
  return { currency, domains: out, servicesMonthly, feesMonthly, beforeDiscount, discountPct, discount, monthly, oneOff, media, totalFees: monthly * st.duration + oneOff };
}

/**
 * L'ordre des écrans. Sur le calculateur : le choix des services, leurs questions, la durée
 * (seulement s'il y a des honoraires mensuels à engager), le devis. Sur une page de service
 * (`focus`, l'extrait du calculateur) : les questions du service de la page d'abord, puis
 * « Ajouter un service ? », les questions des services ajoutés, la durée, le devis.
 */
export function sequence(st: QuoteState, focus?: ServiceDomain[]): string[] {
  const actifs = st.domains.filter((d) => !st.discuss[d]);
  const s: string[] = [];
  if (focus?.length) {
    for (const d of inOrder(focus)) if (actifs.includes(d)) for (const q of visibleQuestions(d, st.answers)) s.push(q.id);
    s.push('ajout');
    for (const d of actifs) if (!focus.includes(d)) for (const q of visibleQuestions(d, st.answers)) s.push(q.id);
  } else {
    s.push('pick');
    for (const d of actifs) for (const q of visibleQuestions(d, st.answers)) s.push(q.id);
  }
  if (devis(st).beforeDiscount > 0) s.push('duration');
  s.push('recap');
  return s;
}

/** Les questions d'un service que le visiteur voit réellement, selon ses réponses. */
export const visibleQuestions = (d: ServiceDomain, a: Answers) => questionsFor(d).filter((q) => !q.when || q.when(a));

export const inOrder = (list: ServiceDomain[]) => DOMAIN_ORDER.filter((d) => list.includes(d));

export const unitContactPrice = (type: ContactType, volume: number) => getContactUnitPrice(type, volume);

// --- « Aidez-moi à choisir » : le moteur du mode guidé actuel, recalé sur le budget ------------

export const GUIDED_BUDGETS = Object.keys(budgetOptionToValue);
const MONTHLY_LEVELS = ['seo-monthly', 'social-creatives', 'email-management-package', 'ai-content-blog', 'ai-content-social', 'ai-maintenance'];
const nearestStep = (v: number) => BUDGET_STEPS.reduce((b, x) => (Math.abs(x - v) < Math.abs(b - v) ? x : b), BUDGET_STEPS[0]);

/**
 * Proposition à partir de trois réponses (secteur, objectif, budget), avec `generateRecommendation`
 * (guided-data.ts). Ce moteur choisit les services sans regarder leur prix : pour « B2B, leads,
 * 2 à 5 k€ » il proposait 5 450 EUR/mois média compris. On le recale : on baisse d'abord d'un cran
 * le service mensuel le plus cher, puis on retire le service le moins prioritaire, jusqu'à tenir
 * le budget annoncé à 10 % près. Les frais de mise en place optionnels (catalogue, chatbot,
 * workflows) ne sont pas proposés d'office : le visiteur les ajoute s'il le souhaite.
 *
 * `focus` : le service de la page où l'assistant du site a été ouvert (22/09/2026). Il passe en
 * tête de la proposition, au premier niveau s'il n'était pas recommandé, et n'est jamais retiré
 * pour tenir le budget : quelqu'un qui lit la page Google Ads doit voir Google Ads dans son plan.
 */
export function guidedProposal(industry: string, goal: string, budgetOption: string, focus?: ServiceDomain): { state: QuoteState; budget: number } {
  const budget = budgetOptionToValue[budgetOption] ?? 3500;
  const rec = generateRecommendation({ industry, goals: [goal], monthlyBudget: budget, currentEfforts: [], freeTextContext: '' });
  const priority = [...rec.selectedDomains];
  if (focus) priority.splice(0, priority.length, focus, ...priority.filter((d) => d !== focus));
  const answers: Answers = {};
  for (const d of priority) {
    const lvl = rec.selections[d] ?? (d === focus ? 0 : undefined);
    for (const q of questionsFor(d)) {
      if (q.kind !== 'level' || lvl == null) continue;
      const service = domainConfigs[d].services.find((x) => x.id === q.service)!;
      const once = !!(service.isOneOff || service.levels[0]?.isOneOff);
      answers[q.id] = once ? (q.service === 'seo-audit' ? 0 : null) : Math.min(lvl, service.levels.length - 1);
    }
  }
  if (priority.includes('google-ads')) answers['ga-budget'] = nearestStep(rec.adBudgets['google-ads'] ?? DEFAULT_BUDGET);
  if (priority.includes('paid-social')) { answers['ps-budget'] = nearestStep(rec.adBudgets['paid-social'] ?? DEFAULT_BUDGET); answers['ps-channels'] = rec.recommendedChannels ?? []; }
  if (priority.includes('tracking-reporting')) {
    answers['trk-items'] = [...(rec.trackingAudit ? ['tracking-audit'] : []), ...Object.entries(rec.trackingPreselections ?? {}).filter(([, v]) => v).map(([k]) => k)];
  }
  const st: QuoteState = { domains: inOrder(priority), answers, discuss: {}, duration: 4 };
  const over = () => { const q = devis(st); return q.monthly + q.media > budget * 1.1; };
  for (let guard = 0; guard < 40 && over(); guard++) {
    const cands = MONTHLY_LEVELS.filter((id) => st.domains.includes(QUESTION_INDEX[id].domain) && typeof st.answers[id] === 'number' && (st.answers[id] as number) > 0);
    if (cands.length) {
      const price = (id: string) => domainConfigs[QUESTION_INDEX[id].domain].services.find((x) => x.id === id)!.levels[st.answers[id] as number].price;
      const top = cands.sort((x, y) => price(y) - price(x))[0];
      st.answers[top] = (st.answers[top] as number) - 1;
      continue;
    }
    if (st.domains.length > 2) {
      const drop = [...priority].reverse().find((d) => st.domains.includes(d) && d !== focus);
      if (!drop) break;
      st.domains = st.domains.filter((d) => d !== drop);
      continue;
    }
    break;
  }
  return { state: st, budget };
}

/**
 * Le prix d'entrée d'un service, pour l'assistant du site (23/09/2026) : le premier niveau de
 * chaque offre du domaine, et pour la publicité les honoraires de gestion du premier palier.
 * Tout vient des grilles du calculateur : aucun prix n'est réécrit ailleurs.
 */
export function prixDeDepart(d: ServiceDomain): { monthly?: number; once?: number; fee?: number; feeMax?: number; pct?: number } {
  let monthly: number | undefined;
  let once: number | undefined;
  for (const s of domainConfigs[d].services ?? []) {
    const niveau = s.levels?.[0];
    const p = niveau?.price;
    if (typeof p !== 'number' || p <= 0) continue;
    if (s.isOneOff || niveau?.isOneOff) once = once === undefined ? p : Math.min(once, p);
    else monthly = monthly === undefined ? p : Math.min(monthly, p);
  }
  if (d === 'ai-training') once = GRILLE.durees['3h'].distance.EUR;
  // La créa se chiffre à la demande : son prix d'entrée est celui d'un jeu de bannières LinkedIn.
  if (d === 'creative-design') return { once: GRILLE_CREA.jeux.li[0].prix.EUR };
  if (d === 'google-ads' || d === 'paid-social') {
    const paliers = MANAGEMENT_FEE_CONFIG[d === 'google-ads' ? 'googleAds' : 'paidSocial'];
    return { monthly, once, fee: paliers[0].value, feeMax: paliers[0].maxBudget, pct: paliers[1].value };
  }
  return { monthly, once };
}

// --- un devis transmis par lien ------------------------------------------------------------
// L'assistant du site (22/09/2026) propose un plan sur n'importe quelle page ; « Voir le devis
// détaillé » ouvre le calculateur avec ce plan dans l'ancre (`#plan=...`). L'ancre ne part jamais
// au serveur, et un plan illisible ou trafiqué est simplement ignoré.

const versB64 = (texte: string) => {
  let bin = '';
  new TextEncoder().encode(texte).forEach((o) => { bin += String.fromCharCode(o); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const depuisB64 = (code: string) => {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export function encodePlan(st: QuoteState, currency?: Currency): string {
  return versB64(JSON.stringify({ d: st.domains, a: st.answers, u: st.duration, ...(currency ? { c: currency } : {}) }));
}

/** La devise enregistrée dans un plan (les liens « Revoir mon devis » des mails la portent). */
export function devisePlan(code: string): Currency | null {
  try {
    const c = (JSON.parse(depuisB64(code)) as { c?: unknown }).c;
    return c === 'EUR' || c === 'GBP' || c === 'USD' ? c : null;
  } catch {
    return null;
  }
}

export function decodePlan(code: string): QuoteState | null {
  try {
    const o = JSON.parse(depuisB64(code)) as { d?: unknown; a?: Record<string, unknown>; u?: unknown };
    const domains = inOrder((Array.isArray(o.d) ? o.d : []).filter((x): x is ServiceDomain => DOMAIN_ORDER.includes(x as ServiceDomain)));
    if (!domains.length) return null;
    const answers: Answers = {};
    for (const [k, v] of Object.entries(o.a ?? {})) if (ANSWER_KEYS.has(k)) answers[k] = v as Answers[string];
    const duration = DURATION_CONFIG.options.some((x) => x.months === o.u) ? (o.u as number) : 4;
    return { domains, answers, discuss: {}, duration };
  } catch {
    return null;
  }
}

// --- affichage des montants ----------------------------------------------------------

/**
 * Un montant DÉJÀ dans sa devise, à la règle d'arrondi MyDigipal : aucune décimale à partir de
 * 10, une entre 1 et 10, deux sous 1, et jamais de décimale ajoutée à un entier.
 */
export function affiche(v: number, currency: Currency, lang: Lang): string {
  const a = Math.abs(v);
  const digits = a >= 10 || Number.isInteger(v) ? 0 : a >= 1 ? 1 : 2;
  const n = v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const sym = CURRENCY_CONFIGS[currency].symbol;
  return lang === 'fr' ? `${n} ${sym}` : `${sym}${n}`;
}
/** Un prix des grilles du calculateur (en euros), converti dans la devise puis affiché. */
export function money(eur: number, currency: Currency, lang: Lang): string {
  return affiche(currency === 'EUR' ? eur : convertPrice(eur, currency), currency, lang);
}
export const perLabel = (per: Per, lang: Lang) => (per === 'quote' ? '' : per === 'once' ? (lang === 'fr' ? ' une fois' : ' one-off') : lang === 'fr' ? '/mois' : '/mo');

// --- l'envoi : un seul format pour tous les devis du site --------------------------------

export interface Contact { name: string; email: string; company: string; phone?: string; message?: string }

/**
 * D'où vient un devis (20/10/2026) : le calculateur, l'extrait d'une page de service, ou le
 * simulateur d'une page (formation, créa). Paul le lit dans son mail et dans la bulle Chat, GA4
 * le reçoit en `calculator_origin`.
 */
export interface Origine {
  /** `calculator`, `service:google-ads`, `automotive:dynamic-ads`, `formation`, `creative`... */
  id: string;
  /** Le nom de la page, en clair, pour le mail de Paul (« la page Dynamic Ads »). */
  libelle: string;
  page?: string;
}

export function buildPayload(st: QuoteState, contact: Contact, lang: Lang, currency: Currency, origine?: Origine) {
  // Paul lit ses devis en euros ; le prospect voit les montants de son écran, dans sa devise.
  const q = devis(st, 'EUR');
  const qd = devis(st, currency);
  const selections: Record<string, number> = {};
  for (const [k, v] of Object.entries(st.answers)) if (QUESTION_INDEX[k]?.kind === 'level' && typeof v === 'number') selections[k] = v;
  const contactType = typeof st.answers['em-contacts'] === 'string' && st.answers['em-contacts'] !== 'none' && st.domains.includes('emailing') ? (st.answers['em-contacts'] as ContactType) : null;
  if (contactType) selections['email-contacts-package'] = 0;
  const aiCustom = st.domains.includes('ai-solutions') && st.answers['ai-custom'] === 'yes'
    ? ((st.answers['ai-custom-form'] as Record<string, string> | undefined) ?? {}) : null;
  const trk = Array.isArray(st.answers['trk-items']) ? (st.answers['trk-items'] as string[]) : [];
  // Les lignes de la formation et de la créa portent leur propre libellé (« 2 séances de 3 h à
  // distance ») : le nom générique du service ne dirait rien.
  const nomLigne = (l: Line) => (l.service === 'ai-training' || l.service === 'creative') ? t(l.label, lang)
    : l.service === 'contacts' ? (lang === 'fr' ? 'Acquisition de contacts' : 'Contact acquisition')
    : l.service === 'cms' ? (lang === 'fr' ? 'Publication CMS automatique' : 'Auto CMS Publishing')
    : l.service === 'ai-custom' ? (lang === 'fr' ? 'Solution IA sur-mesure (devis)' : 'Custom AI Solution (quote)')
    : l.service && SERVICE_SHORT[l.service] ? t(SERVICE_SHORT[l.service], lang) : t(l.label, lang);
  const departmentBreakdown = q.domains.map((dq) => {
    const isTracking = dq.domain === 'tracking-reporting';
    return {
      id: isTracking ? 'tracking' : dq.domain,
      name: domainName(dq.domain, lang),
      icon: domainConfigs[dq.domain].icon,
      isNotSure: dq.discuss,
      services: dq.lines.filter((l) => l.kind === 'service').map((l) => ({
        name: nomLigne(l),
        level: l.level ? t(l.level, lang) : l.detail ? t(l.detail, lang) : '',
        price: l.amount,
        isOneOff: l.per === 'once'
      })),
      managementFee: dq.fee,
      mediaBudget: dq.media,
      monthlySubtotal: dq.monthly,
      oneOffSubtotal: dq.oneOff
    };
  });
  const has = (d: ServiceDomain) => st.domains.includes(d);
  const f = (v: number) => affiche(v, currency, lang);
  return {
    report_type: 'quote',
    contact,
    callPreference: false,
    selectedDomains: st.domains,
    notSureAbout: Object.fromEntries(Object.entries(st.discuss).filter(([, v]) => v)),
    selections,
    adBudgets: has('google-ads') || has('paid-social') ? { 'google-ads': budgetOf(st.answers, 'ga-budget'), 'paid-social': budgetOf(st.answers, 'ps-budget') } : null,
    selectedSocialChannels: has('paid-social') ? channelsOf(st.answers) : null,
    // Les réglages complets de la formation et de la créa, pour le CRM. Jamais sous les clés
    // `formation` ou `creative` : la route les lirait comme un envoi des anciens simulateurs.
    aiTraining: has('ai-training') ? etatFormation(st.answers, currency) : null,
    creativeRequest: has('creative-design') ? { ...etatCrea(st.answers, currency), rythme: creaMensuelle(st.answers) ? 'month' : 'once' } : null,
    aiSolutions: aiCustom,
    contactAcquisition: contactType ? { type: contactType, volume: typeof st.answers['em-volume'] === 'number' ? st.answers['em-volume'] : DEFAULT_CONTACT_VOLUME } : null,
    cmsAddon: has('seo') && st.answers['seo-cms'] === 'yes' && typeof st.answers['seo-monthly'] === 'number',
    pricing: {
      monthlyTotal: q.servicesMonthly,
      oneOffTotal: q.oneOff,
      adBudgetTotal: q.media,
      managementFeesTotal: q.feesMonthly,
      discount: q.discount,
      discountPercentage: q.discountPct,
      monthlyAfterDiscount: q.monthly,
      totalMonthlyWithoutBudget: q.monthly,
      totalMonthlyWithBudget: q.monthly + q.media,
      grandTotalWithoutBudget: q.totalFees,
      grandTotalWithBudget: q.totalFees + q.media * st.duration,
      grandTotal: q.totalFees,
      hasCustomQuote: q.domains.some((d) => d.lines.some((l) => l.per === 'quote'))
    },
    duration: st.duration,
    trackingSelections: Object.fromEntries(trk.filter((id) => id !== 'tracking-audit').map((id) => [id, true])),
    trackingAudit: trk.includes('tracking-audit'),
    trackingNotSure: !!st.discuss['tracking-reporting'],
    departmentBreakdown,
    currency,
    // Ce que le prospect a vu, déjà mis en forme dans SA devise et avec la règle d'arrondi
    // (22/09/2026) : le mail n'a plus à refaire les conversions, il montre les chiffres de l'écran.
    // Les montants en euros restent dans `pricing` et `departmentBreakdown`, pour Paul.
    display: {
      currency,
      monthly: f(qd.monthly),
      beforeDiscount: f(qd.beforeDiscount),
      discount: qd.discount ? f(qd.discount) : '',
      oneOff: qd.oneOff ? f(qd.oneOff) : '',
      media: qd.media ? f(qd.media) : '',
      totalFees: f(qd.totalFees),
      perMonth: perLabel('month', lang),
      domains: qd.domains.map((dq) => ({
        name: domainName(dq.domain, lang),
        discuss: dq.discuss || dq.empty,
        lines: dq.discuss ? [] : dq.lines.map((l) => ({
          label: t(l.label, lang),
          level: l.level ? t(l.level, lang) : '',
          detail: l.detail ? t(l.detail, lang) : '',
          amount: l.per === 'quote' ? (lang === 'fr' ? 'Sur devis' : 'On quote') : `${f(l.amount)}${perLabel(l.per, lang)}`,
          kind: l.kind
        }))
      }))
    },
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'marketing-calculator-v6',
      usedGuidedMode: false,
      callPreference: false,
      lang,
      origine: origine ?? { id: 'calculator', libelle: lang === 'fr' ? 'le calculateur' : 'the calculator' },
      // Le devis rouvert tel quel dans le calculateur : bouton « Revoir mon devis » du mail.
      planUrl: `https://mydigipal.com/${lang}/calculator#plan=${encodePlan(st, currency)}`,
      provenance: {} as Record<string, string>
    }
  };
}
