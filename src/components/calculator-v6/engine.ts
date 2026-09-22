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
  CURRENCY_CONFIGS
} from '../calculator/data';
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

/** Services hors parcours pour l'instant (acquisition de contacts : prix par type x volume). */
const EXCLUDED_SERVICES = new Set(['email-contacts-package']);

export type QuestionKind = 'level' | 'budget' | 'channels' | 'choice' | 'multi';
export interface Option { value: string | number; label: Txt; desc?: Txt; price?: number; oneOff?: boolean; info?: string }
export interface Question {
  id: string;
  domain: ServiceDomain;
  kind: QuestionKind;
  title: Txt;
  help?: Txt;
  service?: string;
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

export type Answers = Record<string, string | number | null | string[] | undefined>;
export interface QuoteState {
  domains: ServiceDomain[];
  answers: Answers;
  discuss: Partial<Record<ServiceDomain, boolean>>;
  duration: number;
}
export const emptyState = (): QuoteState => ({ domains: [], answers: {}, discuss: {}, duration: 4 });

export type Per = 'month' | 'once' | 'media';
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
    out.push({ domain: d, discuss: false, lines, monthly, oneOff: once, fee, media: med, empty: monthly + once === 0 });
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
  for (const d of st.domains) if (!st.discuss[d]) for (const q of questionsFor(d)) s.push(q.id);
  s.push('duration', 'recap');
  return s;
}

export const inOrder = (list: ServiceDomain[]) => DOMAIN_ORDER.filter((d) => list.includes(d));

// --- affichage des montants ----------------------------------------------------------

/** Règle d'arrondi MyDigipal : aucune décimale à partir de 10, une entre 1 et 10, deux sous 1. */
export function money(eur: number, currency: Currency, lang: Lang): string {
  const v = currency === 'EUR' ? eur : convertPrice(eur, currency);
  const digits = v >= 10 || Number.isInteger(v) ? 0 : v >= 1 ? 1 : 2;
  const n = v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const sym = CURRENCY_CONFIGS[currency].symbol;
  return lang === 'fr' ? `${n} ${sym}` : `${sym}${n}`;
}
export const perLabel = (per: Per, lang: Lang) => (per === 'once' ? (lang === 'fr' ? ' une fois' : ' one-off') : lang === 'fr' ? '/mois' : '/mo');

// --- l'envoi : même format qu'avant, le workflow n8n n'a pas à changer -------------------

export interface Contact { name: string; email: string; company: string; phone?: string; message?: string }

export function buildPayload(st: QuoteState, contact: Contact, lang: Lang, currency: Currency) {
  const q = devis(st);
  const selections: Record<string, number> = {};
  for (const [k, v] of Object.entries(st.answers)) if (QUESTION_INDEX[k]?.kind === 'level' && typeof v === 'number') selections[k] = v;
  const trk = Array.isArray(st.answers['trk-items']) ? (st.answers['trk-items'] as string[]) : [];
  const departmentBreakdown = q.domains.map((dq) => {
    const isTracking = dq.domain === 'tracking-reporting';
    return {
      id: isTracking ? 'tracking' : dq.domain,
      name: domainName(dq.domain, lang),
      icon: domainConfigs[dq.domain].icon,
      isNotSure: dq.discuss,
      services: dq.lines.filter((l) => l.kind === 'service').map((l) => ({
        name: l.service === 'ai-training' ? domainName('ai-training', lang) : l.service && SERVICE_SHORT[l.service] ? t(SERVICE_SHORT[l.service], lang) : t(l.label, lang),
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
