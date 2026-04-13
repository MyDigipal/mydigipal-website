import type { DomainConfig, ServiceDomain, CurrencyConfig, Currency } from '../types';
import { seoServices } from './seo-services';
import { googleAdsServices } from './google-ads-services';
import { paidSocialServices, socialChannels } from './paid-social-services';
import { emailingServices } from './emailing-services';
import { aiTrainingConfig, aiTrainingPricing, halfDayFeatures, fullDayAdditionalFeatures } from './ai-training-services';
import { aiSolutionsConfig, aiSolutionsQuestions, aiSolutionsUseCases, aiSolutionsServices } from './ai-solutions-questions';
import { aiContentServices } from './ai-content-services';
import {
  trackingReportingConfig,
  trackingAuditOption,
  trackingServices,
  trackingPopupContent,
  servicesThatNeedTracking
} from './tracking-reporting-services';

// Domain configurations
export const domainConfigs: Record<ServiceDomain, DomainConfig> = {
  'seo': {
    id: 'seo',
    name: 'SEO',
    nameFr: 'SEO',
    icon: '🔍',
    description: 'Search engine optimization and organic visibility',
    descriptionFr: 'Référencement naturel et visibilité organique',
    color: '#4f46e5',
    colorClass: 'indigo',
    services: seoServices
  },
  'google-ads': {
    id: 'google-ads',
    name: 'Google Ads',
    nameFr: 'Google Ads',
    icon: '📊',
    description: 'Advertising on Google network (Search, Display, YouTube)',
    descriptionFr: 'Publicité sur le réseau Google (Search, Display, YouTube)',
    color: '#2563eb',
    colorClass: 'blue',
    services: googleAdsServices,
    hasBudgetSlider: true,
    hasTieredManagementFee: true
  },
  'paid-social': {
    id: 'paid-social',
    name: 'Paid Social',
    nameFr: 'Paid Social',
    icon: '📱',
    description: 'Social media advertising (Meta, LinkedIn, TikTok)',
    descriptionFr: 'Publicité sur les réseaux sociaux (Meta, LinkedIn, TikTok)',
    color: '#7c3aed',
    colorClass: 'purple',
    services: paidSocialServices,
    hasBudgetSlider: true,
    hasTieredManagementFee: true
  },
  'ai-training': {
    id: 'ai-training',
    name: 'AI Training',
    nameFr: 'Formation IA',
    icon: '🎓',
    description: 'In-person or remote AI training for your teams',
    descriptionFr: 'Formation IA pour vos équipes, en présentiel ou à distance',
    color: '#10b981',
    colorClass: 'emerald',
    services: [] // Special handling - not service-based
  },
  'emailing': {
    id: 'emailing',
    name: 'Email Marketing',
    nameFr: 'Email Marketing',
    icon: '📧',
    description: 'AI-powered email campaigns that convert',
    descriptionFr: 'Campagnes email alimentées par l\'IA qui convertissent',
    color: '#f59e0b',
    colorClass: 'amber',
    services: emailingServices
  },
  'ai-solutions': {
    id: 'ai-solutions',
    name: 'AI Solutions',
    nameFr: 'Solutions IA',
    icon: '🤖',
    description: 'AI chatbots, workflow automation and custom solutions',
    descriptionFr: 'Chatbots IA, automatisation de workflows et solutions sur-mesure',
    color: '#8b5cf6',
    colorClass: 'violet',
    services: aiSolutionsServices
  },
  'ai-content': {
    id: 'ai-content',
    name: 'AI Content',
    nameFr: 'Contenu IA',
    icon: '✍️',
    description: 'AI-powered SEO blog articles, social content and landing pages',
    descriptionFr: 'Articles de blog SEO, contenu social et landing pages propulsés par l\'IA',
    color: '#ec4899',
    colorClass: 'pink',
    services: aiContentServices
  },
  'tracking-reporting': {
    id: 'tracking-reporting',
    name: 'Tracking & Reporting',
    nameFr: 'Tracking & Reporting',
    icon: '📊',
    description: 'Measure, analyze, and optimize your marketing performance',
    descriptionFr: 'Mesurez, analysez et optimisez vos performances marketing',
    color: '#06b6d4',
    colorClass: 'cyan',
    services: [] // Special handling - shown as separate section
  }
};

// Budget slider configuration
export const BUDGET_CONFIG = {
  min: 500,
  max: 50000,
  step: 500,
  default: 2000
} as const;

// Duration options with discounts
export const DURATION_CONFIG = {
  options: [
    { months: 4, discount: 0, label: '4 mois', labelEn: '4 months' },
    { months: 6, discount: 5, label: '6 mois (-5%)', labelEn: '6 months (-5%)' },
    { months: 12, discount: 10, label: '12 mois (-10%)', labelEn: '12 months (-10%)' }
  ]
} as const;

// Channel complexity multiplier for Paid Social management fee
// Non-linéaire avec rendements décroissants : le 2e canal coûte cher (setup de zéro),
// les canaux suivants ajoutent progressivement moins d'effort (certains process se mutualisent).
export const CHANNEL_MULTIPLIER_CONFIG = {
  1: 1.0,
  2: 1.7,
  3: 2.2,
  4: 2.6,
  5: 2.9,
  6: 3.1,
  // 7+ caps at 3.3
  default: 3.3
} as const;

export function getChannelMultiplier(nbChannels: number): number {
  if (nbChannels <= 1) return CHANNEL_MULTIPLIER_CONFIG[1];
  if (nbChannels === 2) return CHANNEL_MULTIPLIER_CONFIG[2];
  if (nbChannels === 3) return CHANNEL_MULTIPLIER_CONFIG[3];
  if (nbChannels === 4) return CHANNEL_MULTIPLIER_CONFIG[4];
  if (nbChannels === 5) return CHANNEL_MULTIPLIER_CONFIG[5];
  if (nbChannels === 6) return CHANNEL_MULTIPLIER_CONFIG[6];
  return CHANNEL_MULTIPLIER_CONFIG.default;
}

// Tiered management fee configuration
// Based on: < 2500€ = 500€ flat, 2500€-7500€ = 20%, 7500€-12500€ = 15%, > 12500€ = custom quote
export const MANAGEMENT_FEE_CONFIG = {
  tiers: [
    {
      maxBudget: 2500,
      type: 'flat' as const,
      value: 500,
      description: 'Minimum pour couvrir le vital : optimisation, suivi des campagnes, ajustements, reporting',
      descriptionEn: 'Minimum to cover essentials: optimization, campaign tracking, adjustments, reporting'
    },
    {
      maxBudget: 7500,
      type: 'percentage' as const,
      value: 20,
      description: 'Ajustement proportionnel aux efforts nécessaires : plus de campagnes, plus de données à analyser, plus d\'optimisations',
      descriptionEn: 'Proportional to required effort: more campaigns, more data to analyze, more optimizations'
    },
    {
      maxBudget: 12500,
      type: 'percentage' as const,
      value: 15,
      description: 'Tarif dégressif pour budgets moyens : économies d\'échelle sur la gestion et l\'optimisation',
      descriptionEn: 'Degressive rate for medium budgets: economies of scale on management and optimization'
    },
    {
      maxBudget: Infinity,
      type: 'custom' as const,
      value: 0,
      description: 'Étude approfondie du volume de travail : nombre de marques, de campagnes, véhicules à promouvoir, canaux activés',
      descriptionEn: 'In-depth study of workload: number of brands, campaigns, vehicles to promote, activated channels'
    }
  ]
} as const;

// Re-export AI Training specific configs
export {
  aiTrainingConfig,
  aiTrainingPricing,
  halfDayFeatures,
  fullDayAdditionalFeatures
};

// Re-export AI Solutions specific configs
export {
  aiSolutionsConfig,
  aiSolutionsQuestions,
  aiSolutionsUseCases,
  aiSolutionsServices
};

// Re-export AI Content services
export { aiContentServices };

// Re-export Paid Social channels
export { socialChannels };

// Re-export Tracking & Reporting configs
export {
  trackingReportingConfig,
  trackingAuditOption,
  trackingServices,
  trackingPopupContent,
  servicesThatNeedTracking
};

// Helper: Calculate management fee using tiered structure
// nbChannels: number of selected channels (only for paid-social, applies multiplier)
export function calculateManagementFee(
  domain: 'google-ads' | 'paid-social',
  budget: number,
  nbChannels: number = 1
): { fee: number; type: 'flat' | 'percentage' | 'custom'; isCustomQuote: boolean; channelMultiplier?: number } {
  const config = domainConfigs[domain];
  if (!config.hasTieredManagementFee) return { fee: 0, type: 'flat', isCustomQuote: false };

  // Apply channel multiplier only for paid-social
  const multiplier = domain === 'paid-social' ? getChannelMultiplier(nbChannels) : 1;

  // Find the appropriate tier
  for (const tier of MANAGEMENT_FEE_CONFIG.tiers) {
    if (budget < tier.maxBudget) {
      if (tier.type === 'flat') {
        return { fee: tier.value * multiplier, type: 'flat', isCustomQuote: false, channelMultiplier: multiplier };
      } else if (tier.type === 'percentage') {
        return { fee: budget * (tier.value / 100) * multiplier, type: 'percentage', isCustomQuote: false, channelMultiplier: multiplier };
      } else {
        return { fee: 0, type: 'custom', isCustomQuote: true, channelMultiplier: multiplier };
      }
    }
  }
  return { fee: 0, type: 'custom', isCustomQuote: true, channelMultiplier: multiplier };
}

// Helper: Get management fee description for display
export function getManagementFeeDescription(budget: number, lang: 'en' | 'fr'): string {
  for (const tier of MANAGEMENT_FEE_CONFIG.tiers) {
    if (budget < tier.maxBudget) {
      return lang === 'fr' ? tier.description : tier.descriptionEn;
    }
  }
  return '';
}

// Helper: Get all domains for selection
export function getSelectableDomains(): DomainConfig[] {
  return Object.values(domainConfigs);
}

// Helper: Get domain by ID
export function getDomainById(id: ServiceDomain): DomainConfig | undefined {
  return domainConfigs[id];
}

// Currency configurations
export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  EUR: { symbol: '€', code: 'EUR', rate: 1, label: 'EUR (€)' },
  USD: { symbol: '$', code: 'USD', rate: 1.08, label: 'USD ($)' },
  GBP: { symbol: '£', code: 'GBP', rate: 0.86, label: 'GBP (£)' }
};

// Helper: Round to "clean" price points for non-EUR currencies
// Under 100: round to nearest 10 (e.g. $50, £40)
// 100-999: round to nearest 50 (e.g. $450, £350)
// 1000+: round to nearest 100 (e.g. $1100, £1300)
function roundToCleanPrice(value: number): number {
  if (value < 100) {
    return Math.round(value / 10) * 10;
  }
  if (value < 1000) {
    return Math.round(value / 50) * 50;
  }
  return Math.round(value / 100) * 100;
}

// Helper: Convert price from EUR to target currency
export function convertPrice(priceEUR: number, currency: Currency): number {
  if (currency === 'EUR') return priceEUR;
  const raw = priceEUR * CURRENCY_CONFIGS[currency].rate;
  return roundToCleanPrice(raw);
}

// Helper: Format price with currency symbol
export function formatPrice(priceEUR: number, currency: Currency): string {
  const converted = convertPrice(priceEUR, currency);
  const config = CURRENCY_CONFIGS[currency];
  if (currency === 'EUR') {
    return `${converted.toLocaleString()}€`;
  }
  return `${config.symbol}${converted.toLocaleString()}`;
}
