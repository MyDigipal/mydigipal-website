/**
 * Les explications du calculateur v6 : panneau de droite sur ordinateur (au survol),
 * fiche « En savoir plus » sur téléphone.
 *
 * Aucun texte de fond n'est inventé ici : tout vient des fichiers de données du
 * calculateur (detailedInfo des services, contenu des niveaux, fiches des réseaux,
 * descriptions du tracking, grille des honoraires). Seules les phrases de liaison
 * sont écrites dans ce fichier.
 */
import {
  domainConfigs,
  DURATION_CONFIG,
  MANAGEMENT_FEE_CONFIG,
  trackingAuditOption,
  trackingServices,
  aiTrainingPricing,
  halfDayFeatures,
  fullDayAdditionalFeatures,
  socialChannels
} from '../calculator/data';
import { channelDescriptions } from '../calculator/data/channel-descriptions';
import type { Currency, ServiceDomain } from '../calculator/types';
import { CONTACT_PRICING_CONFIG } from '../calculator/data/emailing-services';
import { CMS_ADDON_PRICE, SERVICE_SHORT, TRAVEL_COST, domainName, domainDesc, money, perLabel, questionsFor, stripEmoji, t, type Lang } from './engine';

export interface Info { kick?: string; title: string; meta?: string; text?: string; list?: string[]; note?: string; video?: string }

const EMOJI = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu;
const clean = (s?: string) => (s ?? '').replace(EMOJI, '').replace(/\s+/g, ' ').trim();
const cleanAll = (l?: string[]) => (l ?? []).map(clean).filter(Boolean);

/** Le service principal d'un domaine, dont on montre le contenu au niveau du domaine. */
const MAIN: Partial<Record<ServiceDomain, string>> = {
  'seo': 'seo-monthly', 'emailing': 'email-management-package', 'ai-content': 'ai-content-blog', 'ai-solutions': 'ai-workflow'
};

function serviceOf(id: string) {
  for (const d of Object.values(domainConfigs)) {
    const s = d.services.find((x) => x.id === id);
    if (s) return { domain: d.id as ServiceDomain, service: s };
  }
  return null;
}
function detailed(id: string, lang: Lang) {
  const found = serviceOf(id);
  if (!found) return null;
  const di = lang === 'fr' ? found.service.detailedInfo : (found.service.detailedInfoEn ?? found.service.detailedInfo);
  const first = di?.content?.sections?.[0];
  return { domain: found.domain, intro: clean(di?.content?.intro), items: cleanAll(first?.items).slice(0, 6), concl: clean(di?.content?.conclusion) };
}

function feeLines(currency: Currency, lang: Lang): string[] {
  let prev = 0;
  return MANAGEMENT_FEE_CONFIG.googleAds.map((tier) => {
    const max = tier.maxBudget === Infinity ? null : tier.maxBudget;
    const range = max == null
      ? `${lang === 'fr' ? 'Au-delà de' : 'Above'} ${money(prev, currency, lang)}`
      : prev
        ? `${lang === 'fr' ? 'De' : 'From'} ${money(prev, currency, lang)} ${lang === 'fr' ? 'à' : 'to'} ${money(max, currency, lang)}`
        : `${lang === 'fr' ? 'Moins de' : 'Under'} ${money(max, currency, lang)}`;
    const value = tier.type === 'flat'
      ? `${lang === 'fr' ? 'forfait de' : 'flat'} ${money(tier.value, currency, lang)}${perLabel('month', lang)}`
      : lang === 'fr' ? `${tier.value} % du budget` : `${tier.value}% of spend`;
    prev = max ?? prev;
    return `${range} : ${value}`;
  });
}

const L = (lang: Lang, fr: string, en: string) => (lang === 'fr' ? fr : en);

export function info(key: string | null | undefined, lang: Lang, currency: Currency): Info | null {
  if (!key) return null;
  const [type, a, b] = key.split(':');

  if (type === 'intro') return {
    title: L(lang, 'Votre devis en quelques questions', 'Your quote in a few questions'),
    text: L(lang, 'Choisissez vos services, répondez à deux à quatre questions par service, et le prix se calcule au fil des réponses.', 'Pick your services, answer two to four questions for each, and the price builds up as you go.'),
    list: [L(lang, 'Aucun engagement à ce stade', 'No commitment at this stage'), L(lang, 'Survolez un service pour savoir ce qu’il comprend', 'Hover over a service to see what it includes'), L(lang, 'Un expert vous rappelle sous 24 à 48 h', 'An expert gets back to you within 24 to 48 hours')]
  };
  if (type === 'next') return {
    title: L(lang, 'Ce qui se passe ensuite', 'What happens next'),
    list: [L(lang, 'Vous recevez ce devis par email', 'You receive this quote by email'), L(lang, 'Un expert vous rappelle sous 24 à 48 h', 'An expert calls you back within 24 to 48 hours'), L(lang, 'On ajuste ensemble avant tout engagement', 'We fine-tune it together before any commitment')]
  };
  if (type === 'dom') {
    const d = a as ServiceDomain;
    const out: Info = { kick: L(lang, 'Le service', 'The service'), title: domainName(d, lang), text: clean(domainDesc(d, lang)), video: d, list: [] };
    const main = MAIN[d];
    if (main) out.list = detailed(main, lang)?.items.slice(0, 4);
    if (d === 'google-ads') out.list = [L(lang, 'Campagnes Search, Display et YouTube', 'Search, Display and YouTube campaigns'), L(lang, 'Optimisation, suivi, ajustements et reporting compris dans la gestion', 'Optimisation, tracking, adjustments and reporting included in management'), L(lang, 'Le budget média s’ajoute et n’est pas inclus', 'The media budget comes on top and is not included')];
    if (d === 'paid-social') out.list = [socialChannels.map((c) => (lang === 'fr' ? c.nameFr : c.name)).join(', '), L(lang, 'Création de visuels et catalogue produits en option', 'Visual creation and product catalogue as options'), L(lang, 'Le budget média s’ajoute et n’est pas inclus', 'The media budget comes on top and is not included')];
    if (d === 'ai-training') out.list = cleanAll(halfDayFeatures[lang]).slice(0, 4);
    if (d === 'tracking-reporting') { out.list = [trackingAuditOption, ...trackingServices].map((s) => clean((lang === 'fr' ? s.titleFr : s.title).replace(/^[A-Z]\.\s*/, ''))); }
    return out;
  }
  if (type === 'svc') {
    const di = detailed(a, lang);
    if (!di) return null;
    return { kick: domainName(di.domain, lang), title: t(SERVICE_SHORT[a], lang), text: di.intro, list: di.items, note: di.concl, video: di.domain };
  }
  if (type === 'lvl') {
    const found = serviceOf(a);
    const level = found?.service.levels[Number(b)];
    if (!found || !level) return null;
    const once = !!(level.isOneOff || found.service.isOneOff);
    const rec = lang === 'fr' ? level.recommended : (level.recommendedEn ?? level.recommended);
    return {
      kick: t(SERVICE_SHORT[a], lang),
      title: lang === 'fr' ? level.name : (level.nameEn || level.name),
      meta: `${money(level.price, currency, lang)}${perLabel(once ? 'once' : 'month', lang)}`,
      list: cleanAll(lang === 'fr' ? level.features : (level.featuresEn ?? level.features)),
      note: rec ? `${L(lang, 'Idéal pour : ', 'Best for: ')}${clean(rec)}` : undefined,
      video: found.domain
    };
  }
  if (type === 'ch') {
    const c = channelDescriptions[a];
    const ch = socialChannels.find((x) => x.id === a);
    if (!c || !ch) return null;
    return {
      kick: L(lang, 'Réseau', 'Network'), title: lang === 'fr' ? ch.nameFr : ch.name,
      text: clean(lang === 'fr' ? c.audienceFr : c.audienceEn),
      list: [
        `${L(lang, 'Force : ', 'Strength: ')}${clean(lang === 'fr' ? c.strengthFr : c.strengthEn)}`,
        `${L(lang, 'Idéal pour : ', 'Best for: ')}${clean(lang === 'fr' ? c.idealUsageFr : c.idealUsageEn)}`,
        `${L(lang, 'À savoir : ', 'Worth knowing: ')}${clean(lang === 'fr' ? c.caveatFr : c.caveatEn)}`
      ],
      video: 'paid-social'
    };
  }
  if (type === 'trk') {
    const s = [trackingAuditOption, ...trackingServices].find((x) => x.id === a);
    if (!s) return null;
    return {
      kick: 'Tracking & Reporting', title: clean((lang === 'fr' ? s.titleFr : s.title).replace(/^[A-Z]\.\s*/, '')),
      meta: `${money(s.price, currency, lang)}${perLabel('once', lang)}`, text: clean(lang === 'fr' ? s.descriptionFr : s.description), video: 'trk-first'
    };
  }
  if (type === 'fee') return {
    kick: L(lang, 'Comment on facture', 'How we charge'), title: L(lang, 'Honoraires de gestion', 'Management fee'),
    text: L(lang, 'Ce que nous facturons pour piloter vos campagnes. Ils dépendent de votre budget média :', 'What we charge to run your campaigns. It depends on your media budget:'),
    list: feeLines(currency, lang),
    note: L(lang, 'Sur Paid Social, ils sont multipliés selon le nombre de réseaux (x1,7 pour deux).', 'On Paid Social, it is multiplied by the number of networks (x1.7 for two).'),
    video: 'media'
  };
  if (type === 'media') return {
    kick: L(lang, 'Comment on facture', 'How we charge'), title: L(lang, 'Budget média', 'Media budget'),
    text: L(lang, 'Ce que vous dépensez en publicité sur Google ou sur les réseaux. Il s’ajoute à nos honoraires et n’est pas compris dans le devis.', 'What you spend on ads on Google or social networks. It comes on top of our fees and is not part of the quote.'),
    list: [L(lang, 'Nos honoraires de gestion en dépendent', 'Our management fee depends on it'), L(lang, 'Le curseur avance par paliers, plus fins sous 5 000', 'The slider moves in steps, finer below 5,000')],
    video: 'media'
  };
  if (type === 'duration') return {
    kick: L(lang, 'Comment on facture', 'How we charge'), title: L(lang, 'Durée d’engagement', 'Commitment period'),
    text: L(lang, 'Plus l’engagement est long, plus la remise sur les honoraires mensuels est forte.', 'The longer the commitment, the bigger the discount on monthly fees.'),
    list: DURATION_CONFIG.options.map((o) => `${o.months} ${L(lang, 'mois', 'months')} : ${o.discount ? `-${o.discount} %` : L(lang, 'sans remise', 'no discount')}`),
    video: 'duration'
  };
  if (type === 'g') {
    if (a === 'monthly') return { title: L(lang, 'Honoraires mensuels', 'Monthly fees'), text: L(lang, 'Ce que vous payez chaque mois à MyDigipal : les services et la gestion des campagnes, remise comprise. Le budget média n’y est pas.', 'What you pay MyDigipal each month: services and campaign management, discount included. The media budget is not part of it.') };
    if (a === 'once') return { title: L(lang, 'Mise en place', 'Set-up'), text: L(lang, 'Payée une seule fois, au démarrage : audits, installation du tracking, catalogue, chatbot, formation, contacts.', 'Paid once, at the start: audits, tracking set-up, catalogue, chatbot, training, contacts.') };
    if (a === 'total') return { title: L(lang, 'Nos honoraires sur la durée', 'Our fees over the period'), text: L(lang, 'Les honoraires mensuels multipliés par la durée d’engagement, plus la mise en place. Le budget média n’y est pas compris.', 'Monthly fees times the commitment period, plus set-up. The media budget is not included.') };
  }
  if (type === 'cms') return {
    kick: domainName('seo', lang), title: L(lang, 'Publication automatique dans votre CMS', 'Automatic CMS publishing'),
    meta: `${money(CMS_ADDON_PRICE, currency, lang)}${perLabel('month', lang)}`,
    text: L(lang, 'Votre CMS, c’est l’outil où vit votre site : WordPress, Webflow, Shopify. Avec cette option, les articles du mois y sont publiés pour vous, au lieu de vous être livrés à mettre en ligne.', 'Your CMS is the tool your website runs on: WordPress, Webflow, Shopify. With this option, each month’s articles are published there for you instead of being delivered for you to upload.'),
    video: 'seo'
  };
  if (type === 'contacts') {
    const di = detailed('email-contacts-package', lang);
    return { kick: domainName('emailing', lang), title: L(lang, 'Acquisition de contacts', 'Contact acquisition'), text: di?.intro, list: di?.items, note: di?.concl, video: 'emailing' };
  }
  if (type === 'cnt') {
    const ct = a as keyof typeof CONTACT_PRICING_CONFIG.prices;
    const prices = CONTACT_PRICING_CONFIG.prices[ct];
    if (!prices) return null;
    return {
      kick: L(lang, 'Acquisition de contacts', 'Contact acquisition'), title: stripEmoji(CONTACT_PRICING_CONFIG.labels[ct][lang]),
      text: CONTACT_PRICING_CONFIG.descriptions[ct][lang],
      list: CONTACT_PRICING_CONFIG.tiers.map((tier, k) => `${lang === 'fr' ? tier.label : tier.labelEn} : ${money(prices[k], currency, lang)} ${L(lang, 'le contact', 'per contact')}`),
      video: 'emailing'
    };
  }
  if (type === 'aicustom') return {
    kick: domainName('ai-solutions', lang), title: L(lang, 'Projet IA sur mesure', 'Custom AI project'),
    text: L(lang, 'Pour ce qui ne rentre pas dans un chatbot ou quelques workflows : agent IA multi-outils, analyse de données, système de génération de contenu, intégration d’API IA.', 'For what does not fit a chatbot or a few workflows: multi-tool AI agent, data analysis, content generation system, AI API integration.'),
    list: [L(lang, 'Vous décrivez le besoin en quelques lignes', 'You describe the need in a few lines'), L(lang, 'On revient vers vous avec un chiffrage', 'We come back to you with a price')],
    video: 'ai-solutions'
  };
  if (type === 'train') {
    const p = aiTrainingPricing;
    const kick = domainName('ai-training', lang);
    if (a === 'half') return { kick, title: L(lang, 'Demi-journée, 3 h', 'Half day, 3 hours'), meta: `${money(p.single.halfDay.price, currency, lang)}${L(lang, ' la session', ' per session')}`, list: cleanAll(halfDayFeatures[lang]).slice(0, 5), video: 'ai-training' };
    if (a === 'full') return { kick, title: L(lang, 'Journée complète, 6 h 30', 'Full day, 6.5 hours'), meta: `${money(p.single.fullDay.price, currency, lang)}${L(lang, ' la session', ' per session')}`, text: L(lang, 'Le contenu de la demi-journée, et en plus :', 'Everything in the half day, plus:'), list: cleanAll(fullDayAdditionalFeatures[lang]).slice(0, 5), video: 'ai-training' };
    if (a === 'sessions') return { kick, title: L(lang, 'Tarif dégressif', 'Volume pricing'), list: [
      `${L(lang, '1 session : ', '1 session: ')}${money(p.single.halfDay.price, currency, lang)} / ${money(p.single.fullDay.price, currency, lang)}`,
      `${L(lang, 'À partir de 5 sessions : ', 'From 5 sessions: ')}${money(p.bulk.halfDay.price, currency, lang)} / ${money(p.bulk.fullDay.price, currency, lang)}${L(lang, ' la session', ' per session')}`
    ], note: L(lang, 'Demi-journée / journée complète.', 'Half day / full day.') };
    if (a === 'remote') return { kick, title: L(lang, 'À distance', 'Remote'), text: L(lang, 'En visio, sans frais de déplacement.', 'By video call, no travel costs.') };
    if (a === 'onsite') return { kick, title: L(lang, 'Dans vos locaux', 'At your office'), text: `${L(lang, 'Frais de déplacement de ', 'Travel costs of ')}${money(TRAVEL_COST, currency, lang)}${L(lang, ' en plus.', ' on top.')}` };
  }
  return null;
}

/** L'explication montrée au repos pour un écran du parcours. */
export function restKey(step: string): string {
  if (step === 'pick') return 'intro';
  if (step === 'duration') return 'duration';
  if (step === 'recap') return 'next';
  if (step === 'ps-budget') return 'fee';
  if (step === 'ga-budget') return 'dom:google-ads';
  if (step === 'ps-channels') return 'dom:paid-social';
  if (step === 'trk-items') return 'dom:tracking-reporting';
  if (step.startsWith('tr-')) return 'dom:ai-training';
  if (step === 'seo-cms') return 'cms';
  if (step === 'em-contacts' || step === 'em-volume') return 'contacts';
  if (step === 'ai-custom' || step === 'ai-custom-form') return 'aicustom';
  if (step.startsWith('g-')) return 'intro';
  return `svc:${step}`;
}

/** Les liens « C'est quoi ? » sous une question. */
export function termsFor(step: string, lang: Lang): { key: string; label: string }[] {
  if (step === 'ga-budget' || step === 'ps-budget') return [
    { key: 'media', label: L(lang, 'C’est quoi, le budget média ?', 'What is the media budget?') },
    { key: 'fee', label: L(lang, 'Comment sont calculés les honoraires ?', 'How is the fee worked out?') }
  ];
  if (step === 'ps-channels') return [{ key: 'dom:paid-social', label: L(lang, 'Quel réseau choisir ?', 'Which network should I pick?') }];
  if (step === 'trk-items') return [{ key: 'dom:tracking-reporting', label: L(lang, 'Pourquoi le tracking d’abord ?', 'Why tracking first?') }];
  if (step.startsWith('tr-')) return [{ key: 'dom:ai-training', label: L(lang, 'Le contenu de la formation', 'What the training covers') }];
  if (step === 'duration') return [{ key: 'duration', label: L(lang, 'Pourquoi une remise ?', 'Why a discount?') }];
  if (step === 'seo-cms') return [{ key: 'cms', label: L(lang, 'C’est quoi, un CMS ?', 'What is a CMS?') }];
  if (step === 'em-contacts' || step === 'em-volume') return [{ key: 'contacts', label: L(lang, 'Comment ça marche ?', 'How does it work?') }];
  if (step === 'ai-custom') return [{ key: 'aicustom', label: L(lang, 'Quel genre de projet ?', 'What kind of project?') }];
  if (questionsFor('seo').concat(questionsFor('paid-social'), questionsFor('emailing'), questionsFor('ai-content'), questionsFor('ai-solutions')).some((q) => q.id === step)) {
    return [{ key: `svc:${step}`, label: L(lang, 'Ce que comprend ce service', 'What this service includes') }];
  }
  return [];
}
