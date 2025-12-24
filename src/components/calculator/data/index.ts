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
    managementFee: {
      percentage: 20,
      minimum: 300
    }
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
    managementFee: {
      percentage: 20,
      minimum: 300
    }
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

// Setup options (cross-domain)
export const SETUP_OPTIONS = [
  {
    id: 'tracking',
    name: 'Tracking & Analytics Setup',
    nameFr: 'Setup Tracking & Analytics',
    description: 'Google Analytics 4, Google Tag Manager, conversion tracking',
    descriptionFr: 'Google Analytics 4, Google Tag Manager, tracking des conversions',
    price: 400,
    icon: '📈'
  },
  {
    id: 'dashboard',
    name: 'Custom Dashboard',
    nameFr: 'Dashboard Personnalisé',
    description: 'Looker Studio dashboard combining all your marketing data',
    descriptionFr: 'Dashboard Looker Studio regroupant toutes vos données marketing',
    price: 500,
    icon: '📊'
  }
] as const;

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

// Helper: Calculate management fee
export function calculateManagementFee(domain: 'google-ads' | 'paid-social', budget: number): number {
  const config = domainConfigs[domain].managementFee;
  if (!config) return 0;
  const calculated = budget * (config.percentage / 100);
  return Math.max(calculated, config.minimum);
}

// Helper: Get all domains for selection
export function getSelectableDomains(): DomainConfig[] {
  return Object.values(domainConfigs);
}

// Helper: Get domain by ID
export function getDomainById(id: ServiceDomain): DomainConfig | undefined {
  return domainConfigs[id];
}
