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

export type Lang = 'fr' | 'en';
export type Txt = { fr: string; en: string };
export const t = (x: Txt | undefined, lang: Lang): string => (x ? x[lang] : '');

export const DOMAIN_ORDER = Object.keys(domainConfigs) as ServiceDomain[];

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

export type QuestionKind = 'level' | 'budget' | 'channels' | 'choice' | 'multi' | 'volume' | 'form';
export interface Option { value: string | number; label: Txt; desc?: Txt; price?: number; oneOff?: boolean; info?: string; /** Prix unitaire le plus bas (contacts). */ unitFrom?: number }
export interface Question {
  id: string;
  domain: ServiceDomain;
  kind: QuestionKind;
  title: Txt;
  help?: Txt;
  service?: string;
  /** Question posée seulement si la condition est vraie (ex. le volume de contacts). */
  when?: (a: Answers) => boolean;
}

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
  'ai-maintenance': { fr: 'Un suivi une fois en place ?', en: 'Ongoing maintenance?' }
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
  'ai-maintenance': { fr: 'Maintenance IA', en: 'AI maintenance' }
};

export const DOMAIN_SHORT: Record<ServiceDomain, Txt> = {
  'seo': { fr: 'SEO', en: 'SEO' },
  'google-ads': { fr: 'Google Ads', en: 'Google Ads' },
  'paid-social': { fr: 'Paid Social', en: 'Paid Social' },
  'ai-training': { fr: 'Formation IA', en: 'AI Training' },
  'emailing': { fr: 'Emailing', en: 'Email' },
  'ai-solutions': { fr: 'Solutions IA', en: 'AI Solutions' },
  'ai-content': { fr: 'Contenu IA', en: 'AI Content' },
  'tracking-reporting': { fr: 'Tracking', en: 'Tracking' }
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
    return [
      { id: 'tr-format', domain, kind: 'choice', title: { fr: 'Quel format ?', en: 'Which format?' } },
      { id: 'tr-sessions', domain, kind: 'choice', title: { fr: 'Combien de sessions ?', en: 'How many sessions?' },
        help: { fr: 'Tarif dégressif à partir de 5 sessions.', en: 'Lower rate from 5 sessions.' } },
      { id: 'tr-mode', domain, kind: 'choice', title: { fr: 'Où ?', en: 'Where?' } }
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
  if (q.id === 'tr-format') {
    return [
      { value: 'half', label: { fr: 'Demi-journée', en: 'Half day' }, desc: { fr: '3 heures', en: '3 hours' }, price: aiTrainingPricing.single.halfDay.price, oneOff: true, info: 'train:half' },
      { value: 'full', label: { fr: 'Journée complète', en: 'Full day' }, desc: { fr: '6 h 30', en: '6.5 hours' }, price: aiTrainingPricing.single.fullDay.price, oneOff: true, info: 'train:full' }
    ];
  }
  if (q.id === 'tr-sessions') {
    const unit = (n: number) => {
      const tier = n >= 5 ? aiTrainingPricing.bulk : aiTrainingPricing.single;
      return answers['tr-format'] === 'full' ? tier.fullDay.price : tier.halfDay.price;
    };
    return [1, 5, 10].map((n) => ({
      value: n, label: { fr: `${n} session${n > 1 ? 's' : ''}`, en: `${n} session${n > 1 ? 's' : ''}` },
      price: answers['tr-format'] ? unit(n) * n : undefined, oneOff: true, info: 'train:sessions'
    }));
  }
  if (q.id === 'tr-mode') {
    return [
      { value: 'remote', label: { fr: 'À distance', en: 'Remote' }, desc: { fr: 'En visio', en: 'Video call' }, info: 'train:remote' },
      { value: 'onsite', label: { fr: 'Dans vos locaux', en: 'At your office' }, desc: { fr: 'Frais de déplacement', en: 'Travel costs' }, price: TRAVEL_COST, oneOff: true, info: 'train:onsite' }
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
export interface Line { label: Txt; amount: number; per: Per; info?: string; service?: string; level?: Txt; kind: 'fee' | 'media' | 'service' }
export interface DomainQuote { domain: ServiceDomain; discuss: boolean; lines: Line[]; monthly: number; oneOff: number; fee: number; media: number; empty: boolean }
export interface Quote {
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

/** Le seul calcul de prix. Montants en EUR ; la conversion de devise se fait à l'affichage. */
export function devis(st: QuoteState): Quote {
  const a = st.answers;
  const out: DomainQuote[] = [];
  let servicesMonthly = 0, feesMonthly = 0, oneOff = 0, media = 0;

  for (const d of st.domains) {
    if (st.discuss[d]) { out.push({ domain: d, discuss: true, lines: [], monthly: 0, oneOff: 0, fee: 0, media: 0, empty: true }); continue; }
    const lines: Line[] = [];
    let fee = 0, med = 0;
    if (d === 'google-ads' || d === 'paid-social') {
      const budget = budgetOf(a, d === 'google-ads' ? 'ga-budget' : 'ps-budget');
      const n = d === 'paid-social' ? Math.max(channelsOf(a).length, 1) : 1;
      fee = calculateManagementFee(d, budget, n).fee;
      med = budget;
      lines.push({ kind: 'fee', label: n > 1 ? { fr: `Gestion des campagnes, ${n} réseaux`, en: `Campaign management, ${n} networks` } : { fr: 'Gestion des campagnes', en: 'Campaign management' }, amount: fee, per: 'month', info: 'fee' });
      lines.push({ kind: 'media', label: { fr: 'Budget média (non inclus)', en: 'Media budget (not included)' }, amount: budget, per: 'media', info: 'media' });
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
        amount: level.price, per: once ? 'once' : 'month', info: `lvl:${q.service}:${v}` });
    }
    if (d === 'ai-training' && a['tr-format'] && typeof a['tr-sessions'] === 'number' && a['tr-mode']) {
      const n = a['tr-sessions'] as number;
      const tier = n >= 5 ? aiTrainingPricing.bulk : aiTrainingPricing.single;
      const unit = a['tr-format'] === 'full' ? tier.fullDay.price : tier.halfDay.price;
      const full = a['tr-format'] === 'full';
      lines.push({ kind: 'service', service: 'ai-training', label: { fr: `${full ? 'Journée complète' : 'Demi-journée'} x ${n}`, en: `${full ? 'Full day' : 'Half day'} x ${n}` },
        level: { fr: `${full ? 'Journée complète' : 'Demi-journée'} x ${n} session(s)${a['tr-mode'] === 'onsite' ? ' (présentiel)' : ''}`, en: `${full ? 'Full day' : 'Half day'} x ${n} session(s)${a['tr-mode'] === 'onsite' ? ' (in-person)' : ''}` },
        amount: unit * n, per: 'once', info: `train:${a['tr-format']}` });
      if (a['tr-mode'] === 'onsite') lines.push({ kind: 'service', service: 'travel', label: { fr: 'Déplacement', en: 'Travel' }, amount: TRAVEL_COST, per: 'once', info: 'train:onsite' });
    }
    if (d === 'seo' && a['seo-cms'] === 'yes' && typeof a['seo-monthly'] === 'number') {
      lines.push({ kind: 'service', service: 'cms', label: { fr: 'Publication automatique dans votre CMS', en: 'Automatic CMS publishing' }, level: { fr: 'Option', en: 'Add-on' },
        amount: CMS_ADDON_PRICE, per: 'month', info: 'cms' });
    }
    if (d === 'emailing' && typeof a['em-contacts'] === 'string' && a['em-contacts'] !== 'none') {
      const type = a['em-contacts'] as ContactType;
      const volume = typeof a['em-volume'] === 'number' ? (a['em-volume'] as number) : DEFAULT_CONTACT_VOLUME;
      const lbl = CONTACT_PRICING_CONFIG.labels[type];
      lines.push({ kind: 'service', service: 'contacts', label: { fr: `${stripEmoji(lbl.fr)}, ${volume.toLocaleString('fr-FR')} contacts`, en: `${stripEmoji(lbl.en)}, ${volume.toLocaleString('en-GB')} contacts` },
        level: { fr: `${stripEmoji(lbl.fr)}, ${volume} contacts`, en: `${stripEmoji(lbl.en)}, ${volume} contacts` },
        amount: getContactTotalPrice(type, volume), per: 'once', info: `cnt:${type}` });
    }
    if (d === 'ai-solutions' && a['ai-custom'] === 'yes') {
      lines.push({ kind: 'service', service: 'ai-custom', label: { fr: 'Projet IA sur mesure', en: 'Custom AI project' }, level: { fr: 'Sur devis', en: 'Custom quote' },
        amount: 0, per: 'quote', info: 'aicustom' });
    }
    if (d === 'tracking-reporting') {
      const all = [trackingAuditOption, ...trackingServices];
      for (const id of (Array.isArray(a['trk-items']) ? (a['trk-items'] as string[]) : [])) {
        const s = all.find((x) => x.id === id);
        if (s) lines.push({ kind: 'service', service: s.id, label: { fr: s.titleFr.replace(/^[A-Z]\.\s*/, ''), en: s.title.replace(/^[A-Z]\.\s*/, '') }, amount: s.price, per: 'once', info: `trk:${s.id}` });
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
  return { domains: out, servicesMonthly, feesMonthly, beforeDiscount, discountPct, discount, monthly, oneOff, media, totalFees: monthly * st.duration + oneOff };
}

/** Parcours B : l'ordre des écrans. */
export function sequence(st: QuoteState): string[] {
  const s = ['pick'];
  for (const d of st.domains) if (!st.discuss[d]) for (const q of visibleQuestions(d, st.answers)) s.push(q.id);
  s.push('duration', 'recap');
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

export function encodePlan(st: QuoteState): string {
  return versB64(JSON.stringify({ d: st.domains, a: st.answers, u: st.duration }));
}

export function decodePlan(code: string): QuoteState | null {
  try {
    const o = JSON.parse(depuisB64(code)) as { d?: unknown; a?: Record<string, unknown>; u?: unknown };
    const domains = inOrder((Array.isArray(o.d) ? o.d : []).filter((x): x is ServiceDomain => DOMAIN_ORDER.includes(x as ServiceDomain)));
    if (!domains.length) return null;
    const answers: Answers = {};
    for (const [k, v] of Object.entries(o.a ?? {})) if (QUESTION_INDEX[k]) answers[k] = v as Answers[string];
    const duration = DURATION_CONFIG.options.some((x) => x.months === o.u) ? (o.u as number) : 4;
    return { domains, answers, discuss: {}, duration };
  } catch {
    return null;
  }
}

// --- affichage des montants ----------------------------------------------------------

/** Règle d'arrondi MyDigipal : aucune décimale à partir de 10, une entre 1 et 10, deux sous 1. */
export function money(eur: number, currency: Currency, lang: Lang): string {
  const v = currency === 'EUR' ? eur : convertPrice(eur, currency);
  const digits = v >= 10 || Number.isInteger(v) ? 0 : v >= 1 ? 1 : 2;
  const n = v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const sym = CURRENCY_CONFIGS[currency].symbol;
  return lang === 'fr' ? `${n} ${sym}` : `${sym}${n}`;
}
export const perLabel = (per: Per, lang: Lang) => (per === 'quote' ? '' : per === 'once' ? (lang === 'fr' ? ' une fois' : ' one-off') : lang === 'fr' ? '/mois' : '/mo');

// --- l'envoi : même format qu'avant, le workflow n8n n'a pas à changer -------------------

export interface Contact { name: string; email: string; company: string; phone?: string; message?: string }

export function buildPayload(st: QuoteState, contact: Contact, lang: Lang, currency: Currency) {
  const q = devis(st);
  const selections: Record<string, number> = {};
  for (const [k, v] of Object.entries(st.answers)) if (QUESTION_INDEX[k]?.kind === 'level' && typeof v === 'number') selections[k] = v;
  const contactType = typeof st.answers['em-contacts'] === 'string' && st.answers['em-contacts'] !== 'none' && st.domains.includes('emailing') ? (st.answers['em-contacts'] as ContactType) : null;
  if (contactType) selections['email-contacts-package'] = 0;
  const aiCustom = st.domains.includes('ai-solutions') && st.answers['ai-custom'] === 'yes'
    ? ((st.answers['ai-custom-form'] as Record<string, string> | undefined) ?? {}) : null;
  const trk = Array.isArray(st.answers['trk-items']) ? (st.answers['trk-items'] as string[]) : [];
  const departmentBreakdown = q.domains.map((dq) => {
    const isTracking = dq.domain === 'tracking-reporting';
    return {
      id: isTracking ? 'tracking' : dq.domain,
      name: domainName(dq.domain, lang),
      icon: domainConfigs[dq.domain].icon,
      isNotSure: dq.discuss,
      services: dq.lines.filter((l) => l.kind === 'service').map((l) => ({
        name: l.service === 'ai-training' ? domainName('ai-training', lang)
          : l.service === 'contacts' ? (lang === 'fr' ? 'Acquisition de contacts' : 'Contact acquisition')
          : l.service === 'cms' ? (lang === 'fr' ? 'Publication CMS automatique' : 'Auto CMS Publishing')
          : l.service === 'ai-custom' ? (lang === 'fr' ? 'Solution IA sur-mesure (devis)' : 'Custom AI Solution (quote)')
          : l.service && SERVICE_SHORT[l.service] ? t(SERVICE_SHORT[l.service], lang) : t(l.label, lang),
        level: l.level ? t(l.level, lang) : '',
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
  return {
    report_type: 'quote',
    contact,
    callPreference: false,
    selectedDomains: st.domains,
    notSureAbout: Object.fromEntries(Object.entries(st.discuss).filter(([, v]) => v)),
    selections,
    adBudgets: has('google-ads') || has('paid-social') ? { 'google-ads': budgetOf(st.answers, 'ga-budget'), 'paid-social': budgetOf(st.answers, 'ps-budget') } : null,
    selectedSocialChannels: has('paid-social') ? channelsOf(st.answers) : null,
    aiTraining: has('ai-training') ? { format: st.answers['tr-format'] === 'full' ? 'full-day' : 'half-day', sessions: st.answers['tr-sessions'], inPerson: st.answers['tr-mode'] === 'onsite' } : null,
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
      hasCustomQuote: false
    },
    duration: st.duration,
    trackingSelections: Object.fromEntries(trk.filter((id) => id !== 'tracking-audit').map((id) => [id, true])),
    trackingAudit: trk.includes('tracking-audit'),
    trackingNotSure: !!st.discuss['tracking-reporting'],
    departmentBreakdown,
    currency,
    metadata: { timestamp: new Date().toISOString(), source: 'marketing-calculator-v6', usedGuidedMode: false, callPreference: false, lang }
  };
}
