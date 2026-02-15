// Calculator Types

export type ServiceDomain = 'seo' | 'google-ads' | 'paid-social' | 'ai-training' | 'emailing' | 'ai-solutions' | 'ai-content' | 'tracking-reporting';

// Currency support
export type Currency = 'EUR' | 'USD' | 'GBP';

export interface CurrencyConfig {
  symbol: string;
  code: Currency;
  rate: number; // Conversion rate from EUR
  label: string;
}

export interface ServiceLevel {
  name: string;
  nameEn?: string;
  price: number;
  priceNote?: string;
  priceNoteEn?: string;
  features: string[];
  featuresEn?: string[];
  recommended?: string;
  recommendedEn?: string;
  popular?: boolean;
  // For budget-based pricing (Ads)
  budgetBased?: boolean;
  // For one-off services
  isOneOff?: boolean;
}

export interface DetailedInfo {
  title: string;
  content: {
    intro: string;
    sections: {
      title: string;
      items: string[];
    }[];
    conclusion?: string;
  };
}

export interface ServiceItem {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  icon: string;
  levels: ServiceLevel[];
  isOneOff?: boolean;
  hasAddon?: boolean;
  hasBudgetFee?: boolean;
  detailedInfo?: DetailedInfo;
  roiInfo?: DetailedInfo;
}

export interface DomainConfig {
  id: ServiceDomain;
  name: string;
  nameFr: string;
  icon: string;
  description: string;
  descriptionFr: string;
  color: string;
  colorClass: string;
  services: ServiceItem[];
  // For domains with budget slider
  hasBudgetSlider?: boolean;
  // For domains with tiered management fee (< 2500€ = 500€, 2500-10000€ = 20%, > 10000€ = custom)
  hasTieredManagementFee?: boolean;
}

// AI Training specific types
export interface AITrainingSelection {
  format: 'half-day' | 'full-day';
  sessions: '1' | '5+';
  inPerson: boolean;
  travelCost: number;
}

// AI Solutions specific types (questions for custom quote)
export interface AISolutionsAnswers {
  projectType: string;
  currentTools: string;
  timeline: string;
  budget: string;
  additionalInfo: string;
}

// Selection state
export interface ServiceSelection {
  serviceId: string;
  levelIndex: number | null;
  disabled: boolean;
}

export interface DomainSelections {
  [serviceId: string]: ServiceSelection;
}

export interface CalculatorState {
  selectedDomains: ServiceDomain[];
  selections: {
    [domain: string]: DomainSelections;
  };
  adBudgets: {
    'google-ads': number;
    'paid-social': number;
  };
  aiTraining: AITrainingSelection;
  aiSolutions: AISolutionsAnswers;
  cmsAddon: boolean;
  setupSelections: {
    tracking: boolean;
    dashboard: boolean;
  };
  duration: 4 | 6 | 12;
}

export interface ContactInfo {
  name: string;
  email: string;
  company: string;
  phone?: string;
}

export interface PricingSummary {
  monthlyTotal: number;
  oneOffTotal: number;
  adBudgetTotal: number;
  managementFeesTotal: number;
  setupTotal: number;
  discount: number;
  discountPercentage: number;
  grandTotal: number;
  effectiveMonthlyPrice: number;
}

// Guided Mode types
export interface GuidedAnswers {
  industry: string;
  goals: string[];
  monthlyBudget: number;
  currentEfforts: string[];
  freeTextContext: string;
}

export interface GuidedRecommendation {
  selectedDomains: ServiceDomain[];
  selections: Record<string, number | null>;
  adBudgets: { 'google-ads': number; 'paid-social': number };
  reasoning: string[];
  estimatedMonthly: number;
  trackingPreselections?: Record<string, boolean>;
  trackingAudit?: boolean;
  recommendedChannels?: string[];
}

export interface GuidedMessage {
  id: string;
  sender: 'bot' | 'user';
  content: string;
  type: 'text' | 'options' | 'multi-options' | 'slider' | 'textarea' | 'recommendation';
  options?: { id: string; label: string; icon?: string }[];
  maxSelections?: number;
  sliderConfig?: { min: number; max: number; step: number };
  recommendation?: GuidedRecommendation;
}

// Translations
export interface Translations {
  // Domain selection
  selectDomains: string;
  selectDomainsDesc: string;
  continue: string;
  // Service configuration
  configureServices: string;
  selectLevel: string;
  noThanks: string;
  popular: string;
  oneOff: string;
  perMonth: string;
  // Budget
  adBudget: string;
  managementFee: string;
  // Summary
  summary: string;
  monthly: string;
  oneOffServices: string;
  discount: string;
  total: string;
  effectiveMonthly: string;
  // Duration
  duration: string;
  months: string;
  // Form
  receiveQuote: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  send: string;
  sending: string;
  success: string;
  successMessage: string;
  // AI Training
  aiTrainingFormat: string;
  halfDay: string;
  fullDay: string;
  sessions: string;
  inPerson: string;
  travelCost: string;
  // AI Solutions
  aiSolutionsTitle: string;
  aiSolutionsDesc: string;
  projectType: string;
  currentTools: string;
  timeline: string;
  budgetRange: string;
  additionalInfo: string;
}
