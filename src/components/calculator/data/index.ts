import type { DomainConfig, ServiceDomain } from '../types';
import { seoServices } from './seo-services';
import { googleAdsServices } from './google-ads-services';
import { paidSocialServices } from './paid-social-services';
import { emailingServices } from './emailing-services';
import { aiTrainingConfig, aiTrainingPricing, halfDayFeatures, fullDayAdditionalFeatures } from './ai-training-services';
import { aiSolutionsConfig, aiSolutionsQuestions, aiSolutionsUseCases } from './ai-solutions-questions';
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
    description: 'Custom AI solutions (quote-based)',
    descriptionFr: 'Solutions IA sur-mesure (sur devis)',
    color: '#8b5cf6',
    colorClass: 'violet',
    services: [] // Special handling - quote-based
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
    { months: 6, discount: 3, label: '6 mois (-3%)', labelEn: '6 months (-3%)' },
    { months: 12, discount: 5, label: '12 mois (-5%)', labelEn: '12 months (-5%)' }
  ]
} as const;

// Tiered management fee configuration
// Based on: < 2500€ = 500€ flat, 2500€-10000€ = 20%, > 10000€ = custom quote
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
      maxBudget: 10000,
      type: 'percentage' as const,
      value: 20,
      description: 'Ajustement proportionnel aux efforts nécessaires : plus de campagnes, plus de données à analyser, plus d\'optimisations',
      descriptionEn: 'Proportional to required effort: more campaigns, more data to analyze, more optimizations'
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
  aiSolutionsUseCases
};

// Re-export Tracking & Reporting configs
export {
  trackingReportingConfig,
  trackingAuditOption,
  trackingServices,
  trackingPopupContent,
  servicesThatNeedTracking
};

// Helper: Calculate management fee using tiered structure
export function calculateManagementFee(domain: 'google-ads' | 'paid-social', budget: number): { fee: number; type: 'flat' | 'percentage' | 'custom'; isCustomQuote: boolean } {
  const config = domainConfigs[domain];
  if (!config.hasTieredManagementFee) return { fee: 0, type: 'flat', isCustomQuote: false };

  // Find the appropriate tier
  for (const tier of MANAGEMENT_FEE_CONFIG.tiers) {
    if (budget < tier.maxBudget) {
      if (tier.type === 'flat') {
        return { fee: tier.value, type: 'flat', isCustomQuote: false };
      } else if (tier.type === 'percentage') {
        return { fee: budget * (tier.value / 100), type: 'percentage', isCustomQuote: false };
      } else {
        // Custom quote - return 0 but flag it
        return { fee: 0, type: 'custom', isCustomQuote: true };
      }
    }
  }
  return { fee: 0, type: 'custom', isCustomQuote: true };
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
