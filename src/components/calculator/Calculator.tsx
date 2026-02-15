/** @jsxImportSource react */
import { useState, useMemo, useCallback } from 'react';
import type { ServiceDomain, AITrainingSelection, AISolutionsAnswers, ContactInfo, Currency, GuidedRecommendation } from './types';
import GuidedMode from './GuidedMode';
import {
  domainConfigs,
  BUDGET_CONFIG,
  DURATION_CONFIG,
  MANAGEMENT_FEE_CONFIG,
  CURRENCY_CONFIGS,
  convertPrice,
  formatPrice,
  calculateManagementFee,
  getManagementFeeDescription,
  aiTrainingPricing,
  halfDayFeatures,
  fullDayAdditionalFeatures,
  aiSolutionsQuestions,
  aiSolutionsUseCases,
  aiSolutionsServices,
  socialChannels,
  trackingAuditOption,
  trackingServices,
  trackingPopupContent,
  servicesThatNeedTracking
} from './data';
import { translations } from './translations';

interface CalculatorProps {
  lang?: 'en' | 'fr';
  preselectedDomain?: ServiceDomain;
}

// Icons as simple SVG components
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
);

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12,19 5,12 12,5"></polyline>
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Color theme helper for departments
const getDomainColors = (colorClass: string) => {
  const colors: Record<string, { border: string; bg: string; bgLight: string; text: string; button: string; buttonHover: string }> = {
    indigo: { border: 'border-indigo-300', bg: 'bg-indigo-500', bgLight: 'bg-indigo-50', text: 'text-indigo-700', button: 'bg-indigo-100 text-indigo-700', buttonHover: 'hover:bg-indigo-200' },
    blue: { border: 'border-blue-300', bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', button: 'bg-blue-100 text-blue-700', buttonHover: 'hover:bg-blue-200' },
    purple: { border: 'border-purple-300', bg: 'bg-purple-500', bgLight: 'bg-purple-50', text: 'text-purple-700', button: 'bg-purple-100 text-purple-700', buttonHover: 'hover:bg-purple-200' },
    emerald: { border: 'border-emerald-300', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-700', button: 'bg-emerald-100 text-emerald-700', buttonHover: 'hover:bg-emerald-200' },
    amber: { border: 'border-amber-300', bg: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-700', button: 'bg-amber-100 text-amber-700', buttonHover: 'hover:bg-amber-200' },
    violet: { border: 'border-violet-300', bg: 'bg-violet-500', bgLight: 'bg-violet-50', text: 'text-violet-700', button: 'bg-violet-100 text-violet-700', buttonHover: 'hover:bg-violet-200' },
    cyan: { border: 'border-cyan-300', bg: 'bg-cyan-500', bgLight: 'bg-cyan-50', text: 'text-cyan-700', button: 'bg-cyan-100 text-cyan-700', buttonHover: 'hover:bg-cyan-200' },
    pink: { border: 'border-pink-300', bg: 'bg-pink-500', bgLight: 'bg-pink-50', text: 'text-pink-700', button: 'bg-pink-100 text-pink-700', buttonHover: 'hover:bg-pink-200' }
  };
  return colors[colorClass] || colors.blue;
};

// Tooltip component
const Tooltip = ({ content, whyImportant, lang }: { content: string; whyImportant?: string; lang: 'en' | 'fr' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
        className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <InfoIcon />
      </button>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900 text-white text-sm rounded-xl shadow-xl">
          <div className="mb-2">{content}</div>
          {whyImportant && (
            <div className="pt-2 border-t border-slate-700">
              <span className="text-blue-400 font-medium text-xs block mb-1">
                {lang === 'fr' ? 'Pourquoi c\'est important ?' : 'Why is this important?'}
              </span>
              <span className="text-slate-300">{whyImportant}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};

export default function Calculator({ lang = 'fr', preselectedDomain }: CalculatorProps) {
  const t = translations[lang];

  // State
  const [step, setStep] = useState<'domains' | 'guided' | 'configure' | 'summary'>('domains');
  const [selectedDomains, setSelectedDomains] = useState<ServiceDomain[]>(
    preselectedDomain ? [preselectedDomain] : []
  );
  const [selections, setSelections] = useState<Record<string, number | null>>({});
  const [disabledServices, setDisabledServices] = useState<Record<string, boolean>>({});
  const [adBudgets, setAdBudgets] = useState({
    'google-ads': BUDGET_CONFIG.min,
    'paid-social': BUDGET_CONFIG.min
  });
  // Track if user has activated budget slider (to not charge fees until they interact)
  const [budgetActivated, setBudgetActivated] = useState({
    'google-ads': false,
    'paid-social': false
  });
  const [duration, setDuration] = useState<4 | 6 | 12>(4);
  const [cmsAddon, setCmsAddon] = useState(false);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);

  // AI Training state - null format means nothing selected yet
  const [aiTraining, setAiTraining] = useState<AITrainingSelection>({
    format: null as unknown as 'half-day' | 'full-day',
    sessions: null as unknown as '1' | '5+',
    inPerson: false,
    travelCost: aiTrainingPricing.travelCost.default
  });
  // Track if AI Training has been configured
  const [aiTrainingActivated, setAiTrainingActivated] = useState(false);

  // AI Solutions state
  const [aiSolutions, setAiSolutions] = useState<AISolutionsAnswers>({
    projectType: '',
    currentTools: '',
    timeline: '',
    budget: '',
    additionalInfo: ''
  });
  const [showAiCustomForm, setShowAiCustomForm] = useState(false);

  // Currency state
  const [currency, setCurrency] = useState<Currency>('EUR');

  // Contact form
  const [contact, setContact] = useState<ContactInfo>({ name: '', email: '', company: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Anti-spam protection
  const [mathAnswer, setMathAnswer] = useState('');
  const [antiSpamError, setAntiSpamError] = useState('');
  const [formLoadTime] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState('');

  // Generate random math challenge
  const mathChallenge = useMemo(() => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    const isAdd = Math.random() > 0.5;
    return {
      num1: isAdd ? n1 : Math.max(n1, n2),
      num2: isAdd ? n2 : Math.min(n1, n2),
      operator: isAdd ? '+' : '-',
      answer: isAdd ? n1 + n2 : Math.abs(n1 - n2)
    };
  }, []);

  // Tracking state
  const [trackingSelections, setTrackingSelections] = useState<Record<string, boolean>>({});
  const [trackingAudit, setTrackingAudit] = useState(false);
  const [showTrackingPopup, setShowTrackingPopup] = useState(false);
  const [trackingPopupDismissed, setTrackingPopupDismissed] = useState(false);
  const [trackingNotSure, setTrackingNotSure] = useState(false);

  // Dismissed domains state (for "Not needed" button)
  const [dismissedDomains, setDismissedDomains] = useState<Record<string, boolean>>({});
  const [trackingDismissed, setTrackingDismissed] = useState(false);

  // "Not sure about X" state - when selected, grays out the section
  const [notSureAbout, setNotSureAbout] = useState<Record<string, boolean>>({});

  // AI Training session count (for 5+ sessions)
  const [sessionCount, setSessionCount] = useState(5);

  // Currency helpers
  const cp = useCallback((priceEUR: number) => convertPrice(priceEUR, currency), [currency]);
  const fp = useCallback((priceEUR: number) => formatPrice(priceEUR, currency), [currency]);
  const currencySymbol = CURRENCY_CONFIGS[currency].symbol;

  // Toggle domain selection
  const toggleDomain = useCallback((domain: ServiceDomain) => {
    setSelectedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  }, []);

  // Toggle domain dismissal (for "Not needed" button on section level)
  const toggleDomainDismissed = useCallback((domainId: string) => {
    setDismissedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  }, []);

  // Toggle "Not sure about X" - also resets selections for that domain
  const toggleNotSure = useCallback((domainId: string) => {
    setNotSureAbout(prev => {
      const newValue = !prev[domainId];
      // If toggling to "not sure", reset all selections for this domain's services
      if (newValue) {
        const domain = domainConfigs[domainId as ServiceDomain];
        if (domain) {
          setSelections(prevSelections => {
            const newSelections = { ...prevSelections };
            domain.services.forEach(service => {
              newSelections[service.id] = null;
            });
            return newSelections;
          });
          // Reset ad budget and budgetActivated for ads domains
          if (domain.hasBudgetSlider) {
            setAdBudgets(prevBudgets => ({
              ...prevBudgets,
              [domainId]: BUDGET_CONFIG.min
            }));
            setBudgetActivated(prev => ({
              ...prev,
              [domainId]: false
            }));
          }
        }
        // Reset AI Training if applicable
        if (domainId === 'ai-training') {
          setAiTrainingActivated(false);
          setAiTraining({
            format: null as unknown as 'half-day' | 'full-day',
            sessions: null as unknown as '1' | '5+',
            inPerson: false,
            travelCost: aiTrainingPricing.travelCost.default
          });
        }
      }
      return { ...prev, [domainId]: newValue };
    });
  }, []);

  // Toggle tracking "Not sure" - resets tracking selections
  const toggleTrackingNotSure = useCallback(() => {
    setTrackingNotSure(prev => {
      const newValue = !prev;
      if (newValue) {
        // Reset all tracking selections
        setTrackingSelections({});
        setTrackingAudit(false);
      }
      return newValue;
    });
  }, []);

  // Toggle service level
  const toggleServiceLevel = useCallback((serviceId: string, levelIndex: number) => {
    setSelections(prev => ({
      ...prev,
      [serviceId]: prev[serviceId] === levelIndex ? null : levelIndex
    }));
  }, []);

  // Disable service (no thanks)
  const toggleDisabled = useCallback((serviceId: string) => {
    setDisabledServices(prev => {
      const newDisabled = !prev[serviceId];
      if (newDisabled) {
        setSelections(sel => ({ ...sel, [serviceId]: null }));
      }
      return { ...prev, [serviceId]: newDisabled };
    });
  }, []);

  // Calculate pricing
  const pricing = useMemo(() => {
    let monthlyTotal = 0;
    let oneOffTotal = 0;
    let adBudgetTotal = 0;
    let managementFeesTotal = 0;
    let hasCustomQuote = false;

    // Calculate service prices
    selectedDomains.forEach(domain => {
      const config = domainConfigs[domain];

      // Skip dismissed domains or "not sure" domains
      if (dismissedDomains[domain] || notSureAbout[domain]) return;

      // Skip AI Training (special handling)
      if (domain === 'ai-training') return;

      // Add management fees for ads domains (tiered structure) - only if user has activated budget
      if (config.hasBudgetSlider && config.hasTieredManagementFee && budgetActivated[domain as 'google-ads' | 'paid-social']) {
        const budget = adBudgets[domain as 'google-ads' | 'paid-social'];
        adBudgetTotal += budget;
        const feeResult = calculateManagementFee(domain as 'google-ads' | 'paid-social', budget);
        managementFeesTotal += feeResult.fee;
        if (feeResult.isCustomQuote) hasCustomQuote = true;
      }

      // Add service prices
      config.services.forEach(service => {
        const selectedLevel = selections[service.id];
        if (selectedLevel !== null && selectedLevel !== undefined && !disabledServices[service.id]) {
          const level = service.levels[selectedLevel];
          if (level) {
            if (service.isOneOff) {
              oneOffTotal += level.price;
            } else {
              monthlyTotal += level.price;
            }
          }
        }
      });
    });

    // AI Training pricing (skip if dismissed, not sure, or not activated)
    if (selectedDomains.includes('ai-training') && !dismissedDomains['ai-training'] && !notSureAbout['ai-training'] && aiTrainingActivated && aiTraining.format && aiTraining.sessions) {
      const pricingTier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
      const basePrice = aiTraining.format === 'full-day' ? pricingTier.fullDay.price : pricingTier.halfDay.price;
      const sessionMultiplier = aiTraining.sessions === '5+' ? sessionCount : 1;
      // Fixed travel cost of 500€ when in-person
      const trainingTotal = basePrice * sessionMultiplier + (aiTraining.inPerson ? 500 : 0);
      oneOffTotal += trainingTotal;
    }

    // CMS addon
    if (cmsAddon && selections['seo-content'] !== null) {
      monthlyTotal += 100;
    }

    // Tracking services (one-off) - skip if dismissed or "not sure"
    let trackingTotal = 0;
    if (!trackingDismissed && !trackingNotSure) {
      if (trackingAudit) {
        trackingTotal += trackingAuditOption.price;
      }
      trackingServices.forEach(service => {
        if (trackingSelections[service.id]) {
          trackingTotal += service.price;
        }
      });
      oneOffTotal += trackingTotal;
    }

    // Duration discount (only on monthly services, not on management fees for >10k budgets)
    const durationConfig = DURATION_CONFIG.options.find(d => d.months === duration);
    const discountPercentage = durationConfig?.discount || 0;
    const monthlyBeforeDiscount = monthlyTotal + managementFeesTotal;
    const discount = monthlyBeforeDiscount * (discountPercentage / 100);

    // Calculate totals
    // Note: effectiveMonthly excludes media budget (adBudgetTotal) - media budget shown separately
    const monthlyAfterDiscount = monthlyBeforeDiscount - discount;
    const totalMonthlyWithoutBudget = monthlyAfterDiscount;
    const totalMonthlyWithBudget = monthlyAfterDiscount + adBudgetTotal;
    const grandTotalWithoutBudget = (monthlyAfterDiscount * duration) + oneOffTotal;
    const grandTotalWithBudget = grandTotalWithoutBudget + (adBudgetTotal * duration);

    return {
      monthlyTotal,
      oneOffTotal,
      adBudgetTotal,
      managementFeesTotal,
      trackingTotal,
      discount,
      discountPercentage,
      monthlyAfterDiscount,
      totalMonthlyWithoutBudget,
      totalMonthlyWithBudget,
      grandTotalWithoutBudget,
      grandTotalWithBudget,
      hasCustomQuote
    };
  }, [selectedDomains, selections, disabledServices, adBudgets, budgetActivated, aiTraining, aiTrainingActivated, cmsAddon, trackingSelections, trackingAudit, duration, dismissedDomains, trackingDismissed, trackingNotSure, notSureAbout, sessionCount]);

  // Check if user needs tracking (has marketing services selected or explicitly selected tracking)
  const needsTracking = useMemo(() => {
    return selectedDomains.some(d => servicesThatNeedTracking.includes(d)) || selectedDomains.includes('tracking-reporting');
  }, [selectedDomains]);

  // Check if user has selected any marketing channel with actual selections (not just "I'm not sure")
  const hasActualMarketingSelections = useMemo(() => {
    return selectedDomains.some(d =>
      servicesThatNeedTracking.includes(d) && !notSureAbout[d] && !dismissedDomains[d]
    );
  }, [selectedDomains, notSureAbout, dismissedDomains]);

  // Check if user has any tracking selected (respect dismissal)
  const hasTrackingSelected = useMemo(() => {
    if (trackingDismissed) return false;
    if (trackingNotSure) return true; // "Not sure" counts as a selection for popup purposes
    if (selectedDomains.includes('tracking-reporting')) return true; // User explicitly selected tracking from cards
    if (trackingAudit) return true;
    return Object.values(trackingSelections).some(v => v);
  }, [trackingAudit, trackingSelections, trackingDismissed, trackingNotSure, selectedDomains]);

  // Check if any domain has "not sure" selected (including tracking)
  const hasNotSureSelections = useMemo(() => {
    const hasNotSureDomains = selectedDomains.some(domainId => notSureAbout[domainId] && !dismissedDomains[domainId]);
    const hasNotSureTracking = trackingNotSure && !trackingDismissed && needsTracking;
    return hasNotSureDomains || hasNotSureTracking;
  }, [selectedDomains, notSureAbout, dismissedDomains, trackingNotSure, trackingDismissed, needsTracking]);

  // Check if any service is selected (excluding dismissed/notSure domains)
  const hasActualSelections = useMemo(() => {
    if (selectedDomains.includes('ai-training') && !dismissedDomains['ai-training'] && !notSureAbout['ai-training']) return true;
    // Check if any non-dismissed domain has selections
    const hasOtherSelections = Object.entries(selections).some(([serviceId, level]) => {
      if (level === null) return false;
      // Find which domain this service belongs to
      const domainId = Object.keys(domainConfigs).find(d =>
        domainConfigs[d as ServiceDomain].services.some(s => s.id === serviceId)
      );
      return domainId && !dismissedDomains[domainId] && !notSureAbout[domainId];
    });
    return hasOtherSelections;
  }, [selectedDomains, selections, dismissedDomains, notSureAbout]);

  // Combined check - show summary if either actual selections or "not sure" domains exist
  const hasSelections = hasActualSelections || hasNotSureSelections;

  // Core submission logic (extracted for reuse)
  const doSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Build detailed breakdown by department for email
    const departmentBreakdown: Array<{
      id: string;
      name: string;
      icon: string;
      isNotSure: boolean;
      services: Array<{
        name: string;
        level: string;
        price: number;
        isOneOff: boolean;
      }>;
      managementFee: number;
      mediaBudget: number;
      monthlySubtotal: number;
      oneOffSubtotal: number;
    }> = [];

    selectedDomains.forEach(domainId => {
      if (domainId === 'tracking-reporting') return; // Handle separately

      const domain = domainConfigs[domainId];
      if (!domain) return;

      const deptData = {
        id: domainId,
        name: lang === 'fr' ? domain.nameFr : domain.name,
        icon: domain.icon,
        isNotSure: notSureAbout[domainId] || false,
        services: [] as Array<{ name: string; level: string; price: number; isOneOff: boolean }>,
        managementFee: 0,
        mediaBudget: 0,
        monthlySubtotal: 0,
        oneOffSubtotal: 0
      };

      // Skip if dismissed
      if (dismissedDomains[domainId]) return;

      // If "not sure", add to breakdown but mark as isNotSure
      if (notSureAbout[domainId]) {
        departmentBreakdown.push(deptData);
        return;
      }

      // AI Training special handling
      if (domainId === 'ai-training' && aiTrainingActivated && aiTraining.format && aiTraining.sessions) {
        const tier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
        const base = aiTraining.format === 'full-day' ? tier.fullDay.price : tier.halfDay.price;
        const multiplier = aiTraining.sessions === '5+' ? sessionCount : 1;
        const trainingPrice = base * multiplier;

        deptData.services.push({
          name: lang === 'fr' ? 'Formation IA' : 'AI Training',
          level: `${aiTraining.format === 'full-day' ? (lang === 'fr' ? 'Journée complète' : 'Full day') : (lang === 'fr' ? 'Demi-journée' : 'Half day')} × ${multiplier} session(s)${aiTraining.inPerson ? (lang === 'fr' ? ' (présentiel)' : ' (in-person)') : ''}`,
          price: trainingPrice,
          isOneOff: true
        });

        if (aiTraining.inPerson) {
          deptData.services.push({
            name: lang === 'fr' ? 'Frais de déplacement' : 'Travel costs',
            level: '',
            price: 500,
            isOneOff: true
          });
          deptData.oneOffSubtotal = trainingPrice + 500;
        } else {
          deptData.oneOffSubtotal = trainingPrice;
        }

        departmentBreakdown.push(deptData);
        return;
      }

      // AI Solutions - now has packages, plus optional custom form
      if (domainId === 'ai-solutions' && showAiCustomForm) {
        // Add custom quote info if form is filled
        deptData.services.push({
          name: lang === 'fr' ? 'Solution IA sur-mesure (devis)' : 'Custom AI Solution (quote)',
          level: lang === 'fr' ? 'Sur devis' : 'Custom quote',
          price: 0,
          isOneOff: false
        });
      }

      // Standard services
      domain.services.forEach(service => {
        const selectedLevel = selections[service.id];
        if (selectedLevel !== null && selectedLevel !== undefined && !disabledServices[service.id]) {
          const level = service.levels[selectedLevel];
          if (level) {
            deptData.services.push({
              name: lang === 'fr' ? service.title : (service.titleEn || service.title),
              level: lang === 'fr' ? level.name : (level.nameEn || level.name),
              price: level.price,
              isOneOff: service.isOneOff || false
            });
            if (service.isOneOff) {
              deptData.oneOffSubtotal += level.price;
            } else {
              deptData.monthlySubtotal += level.price;
            }
          }
        }
      });

      // CMS addon for SEO
      if (domainId === 'seo' && cmsAddon && selections['seo-content'] !== null) {
        deptData.services.push({
          name: lang === 'fr' ? 'Publication CMS automatique' : 'Auto CMS Publishing',
          level: 'Add-on',
          price: 100,
          isOneOff: false
        });
        deptData.monthlySubtotal += 100;
      }

      // Management fee for ads
      if (domain.hasTieredManagementFee && domain.hasBudgetSlider && budgetActivated[domainId as 'google-ads' | 'paid-social']) {
        const budget = adBudgets[domainId as 'google-ads' | 'paid-social'];
        const feeResult = calculateManagementFee(domainId as 'google-ads' | 'paid-social', budget);
        deptData.managementFee = feeResult.fee;
        deptData.mediaBudget = budget;
        deptData.monthlySubtotal += feeResult.fee;
      }

      if (deptData.services.length > 0 || deptData.managementFee > 0) {
        departmentBreakdown.push(deptData);
      }
    });

    // Tracking breakdown
    const trackingBreakdownData = {
      id: 'tracking',
      name: 'Tracking & Reporting',
      icon: '📊',
      isNotSure: trackingNotSure,
      services: [] as Array<{ name: string; level: string; price: number; isOneOff: boolean }>,
      managementFee: 0,
      mediaBudget: 0,
      monthlySubtotal: 0,
      oneOffSubtotal: 0
    };

    if (!trackingDismissed && !trackingNotSure) {
      if (trackingAudit) {
        trackingBreakdownData.services.push({
          name: lang === 'fr' ? trackingAuditOption.titleFr : trackingAuditOption.title,
          level: '',
          price: trackingAuditOption.price,
          isOneOff: true
        });
        trackingBreakdownData.oneOffSubtotal += trackingAuditOption.price;
      }
      trackingServices.forEach(service => {
        if (trackingSelections[service.id]) {
          trackingBreakdownData.services.push({
            name: lang === 'fr' ? service.titleFr : service.title,
            level: '',
            price: service.price,
            isOneOff: true
          });
          trackingBreakdownData.oneOffSubtotal += service.price;
        }
      });
    }

    if (trackingBreakdownData.services.length > 0 || trackingNotSure) {
      departmentBreakdown.push(trackingBreakdownData);
    }

    const payload = {
      contact,
      selectedDomains,
      notSureAbout: Object.fromEntries(
        Object.entries(notSureAbout).filter(([_, v]) => v)
      ),
      selections: Object.fromEntries(
        Object.entries(selections).filter(([_, v]) => v !== null)
      ),
      adBudgets: selectedDomains.includes('google-ads') || selectedDomains.includes('paid-social') ? adBudgets : null,
      aiTraining: selectedDomains.includes('ai-training') ? aiTraining : null,
      aiSolutions: selectedDomains.includes('ai-solutions') ? aiSolutions : null,
      pricing,
      duration,
      trackingSelections: Object.fromEntries(
        Object.entries(trackingSelections).filter(([_, v]) => v)
      ),
      trackingAudit,
      trackingNotSure,
      cmsAddon,
      departmentBreakdown,
      currency,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'marketing-calculator-v5',
        lang
      }
    };

    try {
      // DEBUG: Log payload to console for debugging
      console.log('📤 Sending webhook payload:', JSON.stringify(payload, null, 2));
      console.log('📤 Webhook URL:', 'https://n8n.mydigipal.com/webhook/calculateur-marketing');

      const response = await fetch('https://n8n.mydigipal.com/webhook/calculateur-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      console.log('📥 Webhook response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read response');
        console.error('📥 Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅ Webhook success!');
      setSubmitted(true);

      // Track conversion in GTM
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          'event': 'calculator_form_submit',
          'form_name': 'calculator',
          'form_location': window.location.pathname,
          'calculator_total': pricing.grandTotal
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Show error but still mark as submitted to not block the user
      // The form data can be retrieved from console if needed
      console.log('Payload that failed:', payload);
      alert(lang === 'fr'
        ? 'Erreur de connexion au serveur. Votre demande a été enregistrée, nous vous recontacterons rapidement.'
        : 'Connection error. Your request has been recorded, we will contact you shortly.');
      setSubmitted(true); // Still show success to not frustrate user
    } finally {
      setIsSubmitting(false);
    }
  }, [contact, selectedDomains, selections, adBudgets, aiTraining, aiSolutions, pricing, duration, trackingSelections, trackingAudit, trackingNotSure, cmsAddon, lang, isSubmitting, notSureAbout, dismissedDomains, disabledServices, budgetActivated, aiTrainingActivated, sessionCount, trackingDismissed, showAiCustomForm, currency]);

  // Submit handler with popup check
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Anti-spam validation
    setAntiSpamError('');

    // Check honeypot
    if (honeypot.trim() !== '') {
      console.warn('AntiSpam: Honeypot triggered');
      return; // Silently fail for bots
    }

    // Check timing (minimum 3 seconds)
    const elapsed = (Date.now() - formLoadTime) / 1000;
    if (elapsed < 3) {
      setAntiSpamError(lang === 'fr'
        ? 'Veuillez prendre le temps de remplir le formulaire.'
        : 'Please take a moment to fill out the form.');
      return;
    }

    // Check math answer
    if (parseInt(mathAnswer, 10) !== mathChallenge.answer) {
      setAntiSpamError(lang === 'fr'
        ? 'Réponse incorrecte à la vérification de sécurité.'
        : 'Incorrect answer to security check.');
      return;
    }

    // Show tracking popup only if:
    // - User has actual marketing selections (not just "I'm not sure")
    // - User hasn't selected any tracking service
    // - User hasn't dismissed the popup
    if (hasActualMarketingSelections && !hasTrackingSelected && !trackingPopupDismissed) {
      setShowTrackingPopup(true);
      return;
    }

    await doSubmit();
  }, [isSubmitting, hasActualMarketingSelections, hasTrackingSelected, trackingPopupDismissed, doSubmit, honeypot, formLoadTime, mathAnswer, mathChallenge.answer, lang]);

  // Handle guided mode completion
  const handleGuidedComplete = useCallback((rec: GuidedRecommendation) => {
    setSelectedDomains(rec.selectedDomains);
    // Set selections: for each domain, set the first service to the recommended level
    const newSelections: Record<string, number | null> = {};
    rec.selectedDomains.forEach(domainId => {
      const domain = domainConfigs[domainId];
      if (domain.services.length > 0) {
        const levelIndex = rec.selections[domainId] ?? null;
        if (levelIndex !== null) {
          newSelections[`${domainId}-${domain.services[0].id}`] = levelIndex;
        }
      }
    });
    setSelections(newSelections);
    setAdBudgets(rec.adBudgets);
    if (rec.adBudgets['google-ads'] > 500) {
      setBudgetActivated(prev => ({ ...prev, 'google-ads': true }));
    }
    if (rec.adBudgets['paid-social'] > 500) {
      setBudgetActivated(prev => ({ ...prev, 'paid-social': true }));
    }
    setStep('configure');
  }, []);

  // Guided mode step
  if (step === 'guided') {
    return (
      <div className="min-h-[600px]">
        <GuidedMode
          lang={lang}
          currency={currency}
          onComplete={handleGuidedComplete}
          onSkip={() => setStep('domains')}
          t={t}
        />
      </div>
    );
  }

  // Domain selection step
  if (step === 'domains') {
    return (
      <div className="min-h-[600px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.selectDomains}</h2>
          <p className="text-lg text-slate-600">{t.selectDomainsDesc}</p>
        </div>

        {/* Mode choice - Guided vs Manual */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-10">
          <button
            onClick={() => setStep('guided')}
            className="flex-1 group relative px-6 py-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-600/25 transition-all active:scale-[0.98]"
          >
            <span className="text-2xl block mb-2">💡</span>
            <span className="font-bold block">{t.guidedHelpMe}</span>
            <span className="text-sm text-blue-200 block mt-1">{t.guidedSubtitle}</span>
          </button>
          <button
            onClick={() => {}}
            className="flex-1 group px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span className="text-2xl block mb-2">🎯</span>
            <span className="font-bold block">{t.guidedKnowWhat}</span>
            <span className="text-sm text-slate-500 block mt-1">{lang === 'fr' ? 'Sélectionnez directement ci-dessous' : 'Select directly below'}</span>
          </button>
        </div>

        {/* Currency selector on domain page */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <span className="text-sm text-slate-500 px-2">{t.currency}:</span>
            {(['EUR', 'USD', 'GBP'] as Currency[]).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  currency === c
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {CURRENCY_CONFIGS[c].symbol} {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Object.values(domainConfigs).map(domain => {
            const isSelected = selectedDomains.includes(domain.id);
            const colorClasses: Record<string, string> = {
              indigo: 'border-indigo-500 bg-indigo-50',
              blue: 'border-blue-500 bg-blue-50',
              purple: 'border-purple-500 bg-purple-50',
              emerald: 'border-emerald-500 bg-emerald-50',
              amber: 'border-amber-500 bg-amber-50',
              violet: 'border-violet-500 bg-violet-50',
              cyan: 'border-cyan-500 bg-cyan-50',
              pink: 'border-pink-500 bg-pink-50'
            };

            return (
              <button
                key={domain.id}
                onClick={() => toggleDomain(domain.id)}
                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${
                  isSelected
                    ? `${colorClasses[domain.colorClass]} border-2`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{domain.icon}</span>
                  {isSelected && (
                    <span className={`w-6 h-6 rounded-full bg-${domain.colorClass}-500 text-white flex items-center justify-center`}>
                      <CheckIcon />
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {lang === 'fr' ? domain.nameFr : domain.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {lang === 'fr' ? domain.descriptionFr : domain.description}
                </p>
                {domain.id === 'ai-solutions' && (
                  <span className="inline-block mt-3 px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                    {lang === 'fr' ? 'Packages + sur-mesure' : 'Packages + custom'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sticky bottom CTA bar - always visible when domains are selected */}
        {selectedDomains.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-4 px-4 animate-slide-up">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  {selectedDomains.slice(0, 4).map(d => (
                    <span key={d} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-sm">
                      {domainConfigs[d].icon}
                    </span>
                  ))}
                  {selectedDomains.length > 4 && (
                    <span className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                      +{selectedDomains.length - 4}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{selectedDomains.length}</span> {selectedDomains.length === 1 ? (lang === 'fr' ? 'service sélectionné' : 'service selected') : t.selected}
                </p>
              </div>
              <button
                onClick={() => setStep('configure')}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.98]"
              >
                {t.continue}
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Spacer to prevent content from being hidden behind sticky bar */}
        {selectedDomains.length > 0 && <div className="h-24" />}
      </div>
    );
  }

  // Configuration step
  return (
    <div className="min-h-[600px]">
      {/* Sticky top bar with totals */}
      {hasSelections && (
        <div className="sticky top-16 z-40 -mx-4 px-4 py-3 mb-6 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
            <div className="flex items-center gap-6">
              {/* Monthly */}
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'Mensuel' : 'Monthly'}</p>
                <p className="text-xl font-bold text-slate-900">
                  {pricing.hasCustomQuote ? (
                    <span className="text-amber-600 text-base">{lang === 'fr' ? 'Sur devis' : 'Custom'}</span>
                  ) : (
                    <>{fp(Math.round(pricing.totalMonthlyWithoutBudget))}</>
                  )}
                </p>
              </div>
              {/* One-off */}
              {pricing.oneOffTotal > 0 && (
                <div className="text-center border-l border-slate-200 pl-6">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'One-off' : 'One-time'}</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {fp(Math.round(pricing.oneOffTotal))}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Currency selector */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                {(['EUR', 'USD', 'GBP'] as Currency[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      currency === c
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {CURRENCY_CONFIGS[c].symbol} {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSummaryPopup(true)}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
              >
                {t.viewSummary}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back button header */}
      <div className="mb-8">
        <button
          onClick={() => setStep('domains')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft />
          {t.backToDomains}
        </button>
      </div>

      {/* Services configuration */}
      <div className="space-y-12">
        {selectedDomains.map(domainId => {
          const domain = domainConfigs[domainId];

          // Skip tracking-reporting as it's rendered separately below
          if (domainId === 'tracking-reporting') return null;

          // Special handling for AI Training
          if (domainId === 'ai-training') {
            const isDismissed = dismissedDomains[domainId];
            const isNotSure = notSureAbout[domainId];
            const colors = getDomainColors(domain.colorClass);
            return (
              <div
                key={domainId}
                className={`rounded-2xl border-2 ${colors.border} overflow-hidden transition-all duration-300 ${
                  isDismissed ? 'max-h-24 opacity-60 bg-white' : `max-h-[2000px] ${colors.bgLight}`
                }`}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{domain.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {lang === 'fr' ? domain.nameFr : domain.name}
                        </h2>
                        <p className="text-slate-600">{lang === 'fr' ? domain.descriptionFr : domain.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDomainDismissed(domainId)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isDismissed
                          ? `${colors.button} ${colors.buttonHover}`
                          : 'bg-white/80 text-slate-500 hover:bg-white'
                      }`}
                    >
                      {isDismissed ? t.restoreSection : t.dismissSection}
                    </button>
                  </div>

                  {!isDismissed && (
                    <>
                      {/* Not sure option */}
                      <button
                        onClick={() => toggleNotSure(domainId)}
                        className={`w-full p-4 mb-6 rounded-xl border-2 text-left transition-all ${
                          isNotSure
                            ? `${colors.border} ${colors.bgLight} border-solid`
                            : 'border-dashed border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🔍</span>
                          <div className="flex-1">
                            <span className="font-semibold text-slate-900">
                              {t.notSureAbout} {lang === 'fr' ? domain.nameFr : domain.name} - {t.letsChat}
                            </span>
                          </div>
                          {isNotSure && (
                            <span className={`w-6 h-6 rounded-full ${colors.bg} text-white flex items-center justify-center`}>
                              <CheckIcon />
                            </span>
                          )}
                        </div>
                      </button>

                      <div className={`transition-all duration-300 ${isNotSure ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Format selection */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">{t.aiTrainingFormat}</label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => { setAiTrainingActivated(true); setAiTraining(prev => ({ ...prev, format: 'half-day', sessions: prev.sessions || '1' })); }}
                                className={`p-4 rounded-xl border-2 text-left transition-all bg-white ${
                                  aiTraining.format === 'half-day'
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-semibold text-slate-900">{t.halfDay}</div>
                                <div className="text-sm text-slate-500">3 heures</div>
                              </button>
                              <button
                                onClick={() => { setAiTrainingActivated(true); setAiTraining(prev => ({ ...prev, format: 'full-day', sessions: prev.sessions || '1' })); }}
                                className={`p-4 rounded-xl border-2 text-left transition-all bg-white ${
                                  aiTraining.format === 'full-day'
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-semibold text-slate-900">{t.fullDay}</div>
                                <div className="text-sm text-slate-500">6.5 heures</div>
                                <span className={`inline-block mt-1 px-2 py-0.5 ${colors.button} text-xs font-medium rounded`}>
                                  {t.popular}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Sessions selection */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">{t.sessions}</label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => { setAiTrainingActivated(true); setAiTraining(prev => ({ ...prev, sessions: '1', format: prev.format || 'half-day' })); }}
                                className={`p-4 rounded-xl border-2 text-left transition-all bg-white ${
                                  aiTraining.sessions === '1'
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-semibold text-slate-900">{t.singleSession}</div>
                              </button>
                              <button
                                onClick={() => { setAiTrainingActivated(true); setAiTraining(prev => ({ ...prev, sessions: '5+', format: prev.format || 'half-day' })); }}
                                className={`p-4 rounded-xl border-2 text-left transition-all bg-white ${
                                  aiTraining.sessions === '5+'
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="font-semibold text-slate-900">{t.bulkSessions}</div>
                                <div className="text-xs text-emerald-600">-20% par session</div>
                              </button>
                            </div>

                            {/* Session count input when 5+ selected */}
                            {aiTraining.sessions === '5+' && (
                              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t.howManySessions}</label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={sessionCount}
                                    onChange={(e) => setSessionCount(Math.max(5, parseInt(e.target.value) || 5))}
                                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                  <span className="text-slate-600">{t.sessionsCount}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* In-person option */}
                        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={aiTraining.inPerson}
                              onChange={(e) => setAiTraining(prev => ({ ...prev, inPerson: e.target.checked }))}
                              className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <span className="font-medium text-slate-900">{t.inPerson}</span>
                              <p className="text-sm text-slate-500">{t.inPersonTravelNote}</p>
                              {aiTraining.inPerson && (
                                <p className="text-sm font-medium text-emerald-600 mt-1">{t.travelEstimate}</p>
                              )}
                            </div>
                          </label>
                        </div>

                        {/* Price display */}
                        <div className={`mt-6 p-6 ${colors.bgLight} rounded-xl border ${colors.border}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-700">
                              {aiTraining.format === 'full-day' ? t.fullDay : t.halfDay} × {aiTraining.sessions === '5+' ? sessionCount : '1'} session(s)
                              {aiTraining.inPerson && ` + ${lang === 'fr' ? 'frais de déplacement' : 'travel'}`}
                            </span>
                            <span className={`text-2xl font-bold ${colors.text}`}>
                              {(() => {
                                const tier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
                                const base = aiTraining.format === 'full-day' ? tier.fullDay.price : tier.halfDay.price;
                                const multiplier = aiTraining.sessions === '5+' ? sessionCount : 1;
                                const travel = aiTraining.inPerson ? 500 : 0;
                                return fp((base * multiplier) + travel);
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          }

          // Special handling for AI Solutions - now with packages + custom quote form
          if (domainId === 'ai-solutions') {
            const isDismissed = dismissedDomains[domainId];
            const isNotSure = notSureAbout[domainId];
            const colors = getDomainColors(domain.colorClass);
            return (
              <div
                key={domainId}
                className={`rounded-2xl border-2 ${colors.border} overflow-hidden transition-all duration-300 ${
                  isDismissed ? 'max-h-24 opacity-60 bg-white' : `max-h-[8000px] ${colors.bgLight}`
                }`}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{domain.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {lang === 'fr' ? domain.nameFr : domain.name}
                        </h2>
                        <p className="text-slate-600">{lang === 'fr' ? domain.descriptionFr : domain.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDomainDismissed(domainId)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isDismissed
                          ? `${colors.button} ${colors.buttonHover}`
                          : 'bg-white/80 text-slate-500 hover:bg-white'
                      }`}
                    >
                      {isDismissed ? t.restoreSection : t.dismissSection}
                    </button>
                  </div>

                  {!isDismissed && (
                    <>
                      {/* Not sure option */}
                      <button
                        onClick={() => toggleNotSure(domainId)}
                        className={`w-full p-4 mb-6 rounded-xl border-2 text-left transition-all ${
                          isNotSure
                            ? `${colors.border} ${colors.bgLight} border-solid`
                            : 'border-dashed border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🔍</span>
                          <div className="flex-1">
                            <span className="font-semibold text-slate-900">
                              {t.notSureAbout} {lang === 'fr' ? domain.nameFr : domain.name} - {t.letsChat}
                            </span>
                          </div>
                          {isNotSure && (
                            <span className={`w-6 h-6 rounded-full ${colors.bg} text-white flex items-center justify-center`}>
                              <CheckIcon />
                            </span>
                          )}
                        </div>
                      </button>

                      <div className={`transition-all duration-300 ${isNotSure ? 'opacity-40 pointer-events-none' : ''}`}>
                        {/* Service packages - reuse standard rendering */}
                        <div className="space-y-6">
                          {domain.services.map(service => {
                            const selectedLevel = selections[service.id];
                            return (
                              <div key={service.id} className="p-6 rounded-xl bg-white border border-slate-200">
                                <div className="flex items-start mb-4">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{service.icon}</span>
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <h3 className="font-bold text-slate-900">{lang === 'fr' ? service.title : (service.titleEn || service.title)}</h3>
                                        {service.detailedInfo && (
                                          <Tooltip content={service.detailedInfo.content.intro} whyImportant={service.detailedInfo.content.conclusion} lang={lang} />
                                        )}
                                      </div>
                                      <p className="text-sm text-slate-600">{lang === 'fr' ? service.description : (service.descriptionEn || service.description)}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {service.levels.map((level, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => toggleServiceLevel(service.id, idx)}
                                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                        selectedLevel === idx
                                          ? `${colors.border} ${colors.bgLight}`
                                          : 'border-slate-200 hover:border-slate-300 bg-white'
                                      }`}
                                    >
                                      {level.popular && (
                                        <span className={`absolute -top-2 right-2 px-2 py-0.5 ${colors.bg} text-white text-xs font-medium rounded`}>
                                          {t.popular}
                                        </span>
                                      )}
                                      <div className="flex items-baseline gap-1 mb-2">
                                        {level.priceNote && (
                                          <span className="text-xs text-slate-500">{lang === 'fr' ? level.priceNote : (level.priceNoteEn || level.priceNote)}</span>
                                        )}
                                        <span className="text-xl font-bold text-slate-900">{fp(level.price)}</span>
                                        {service.isOneOff || level.isOneOff ? (
                                          <span className="text-xs text-slate-500">{t.oneOff}</span>
                                        ) : (
                                          <span className="text-xs text-slate-500">{t.perMonth}</span>
                                        )}
                                      </div>
                                      <div className="font-medium text-slate-900 mb-2">{lang === 'fr' ? level.name : (level.nameEn || level.name)}</div>
                                      <ul className="space-y-1">
                                        {(lang === 'fr' ? level.features : (level.featuresEn || level.features)).slice(0, 3).map((feature, i) => (
                                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                            <span className={`${colors.text} mt-0.5`}>•</span>
                                            {feature}
                                          </li>
                                        ))}
                                      </ul>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Custom quote toggle */}
                        <div className="mt-8 p-6 bg-white rounded-xl border border-violet-200">
                          <button
                            onClick={() => setShowAiCustomForm(!showAiCustomForm)}
                            className="w-full flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🧠</span>
                              <div className="text-left">
                                <h4 className="font-semibold text-slate-900">{t.aiSolutionsCustom}</h4>
                                <p className="text-sm text-slate-500">{t.aiSolutionsCustomDesc}</p>
                              </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${colors.button} ${colors.buttonHover} transition-all`}>
                              {showAiCustomForm ? t.hideCustomForm : t.showCustomForm}
                            </span>
                          </button>

                          {showAiCustomForm && (
                            <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
                              {aiSolutionsQuestions.map(question => (
                                <div key={question.id}>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {lang === 'fr' ? question.labelFr : question.label}
                                    {question.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  {question.type === 'select' ? (
                                    <select
                                      value={aiSolutions[question.id as keyof AISolutionsAnswers]}
                                      onChange={(e) => setAiSolutions(prev => ({ ...prev, [question.id]: e.target.value }))}
                                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                      required={question.required}
                                    >
                                      <option value="">-- {lang === 'fr' ? 'Sélectionner' : 'Select'} --</option>
                                      {question.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                          {lang === 'fr' ? opt.labelFr : opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <textarea
                                      value={aiSolutions[question.id as keyof AISolutionsAnswers]}
                                      onChange={(e) => setAiSolutions(prev => ({ ...prev, [question.id]: e.target.value }))}
                                      placeholder={lang === 'fr' ? question.placeholderFr : question.placeholder}
                                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                                      rows={3}
                                      required={question.required}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          }

          // Standard service domain
          const isDismissed = dismissedDomains[domainId];
          const isNotSure = notSureAbout[domainId];
          const colors = getDomainColors(domain.colorClass);
          return (
            <div
              key={domainId}
              className={`rounded-2xl border-2 ${colors.border} overflow-hidden transition-all duration-300 ${
                isDismissed ? 'max-h-24 opacity-60 bg-white' : `max-h-[5000px] ${colors.bgLight}`
              }`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{domain.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {lang === 'fr' ? domain.nameFr : domain.name}
                      </h2>
                      <p className="text-slate-600">{lang === 'fr' ? domain.descriptionFr : domain.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDomainDismissed(domainId)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isDismissed
                        ? `${colors.button} ${colors.buttonHover}`
                        : 'bg-white/80 text-slate-500 hover:bg-white'
                    }`}
                  >
                    {isDismissed ? t.restoreSection : t.dismissSection}
                  </button>
                </div>

                {!isDismissed && (
                  <>
                    {/* Not sure option */}
                    <button
                      onClick={() => toggleNotSure(domainId)}
                      className={`w-full p-4 mb-6 rounded-xl border-2 text-left transition-all ${
                        isNotSure
                          ? `${colors.border} ${colors.bgLight} border-solid`
                          : 'border-dashed border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🔍</span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-900">
                            {t.notSureAbout} {lang === 'fr' ? domain.nameFr : domain.name} - {t.letsChat}
                          </span>
                        </div>
                        {isNotSure && (
                          <span className={`w-6 h-6 rounded-full ${colors.bg} text-white flex items-center justify-center`}>
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                    </button>

                    <div className={`transition-all duration-300 ${isNotSure ? 'opacity-40 pointer-events-none' : ''}`}>
                      {/* Budget slider for ads */}
                      {domain.hasBudgetSlider && (() => {
                        const budget = adBudgets[domainId as 'google-ads' | 'paid-social'];
                        const feeResult = calculateManagementFee(domainId as 'google-ads' | 'paid-social', budget);
                        const feeDescription = getManagementFeeDescription(budget, lang);
                        return (
                          <div className="mb-8 p-6 bg-white rounded-xl border border-slate-200">
                            <label className="block text-sm font-medium text-slate-700 mb-4">{t.adBudget}</label>
                            <input
                              type="range"
                              min={BUDGET_CONFIG.min}
                              max={BUDGET_CONFIG.max}
                              step={BUDGET_CONFIG.step}
                              value={budget}
                              onChange={(e) => {
                                setBudgetActivated(prev => ({ ...prev, [domainId]: true }));
                                setAdBudgets(prev => ({ ...prev, [domainId]: parseInt(e.target.value) }));
                              }}
                              className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer`}
                              style={{ accentColor: domain.color }}
                            />
                            <div className="flex justify-between mt-2">
                              <span className="text-sm text-slate-500">{fp(BUDGET_CONFIG.min)}</span>
                              <span className="text-xl font-bold text-slate-900">
                                {fp(budget)}{lang === 'fr' ? '/mois' : '/mo'}
                              </span>
                              <span className="text-sm text-slate-500">{fp(BUDGET_CONFIG.max)}</span>
                            </div>
                            {/* Tiered management fee display */}
                            <div className={`mt-4 p-4 ${colors.bgLight} rounded-lg border ${colors.border}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">{t.managementFee}</span>
                                <span className={`font-bold ${colors.text}`}>
                                  {feeResult.isCustomQuote ? (
                                    <span className="text-amber-600">{lang === 'fr' ? 'Sur devis' : 'Custom quote'}</span>
                                  ) : (
                                    <>{fp(Math.round(feeResult.fee))}{lang === 'fr' ? '/mois' : '/mo'}</>
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{feeDescription}</p>
                              {/* 4-tier indicators */}
                              <div className="mt-3 flex gap-1">
                                <div className={`flex-1 h-1.5 rounded-full ${budget < 2500 ? colors.bg : 'bg-slate-200'}`} title={lang === 'fr' ? '< 2500€: 500€/mois' : '< 2500€: 500€/mo'} />
                                <div className={`flex-1 h-1.5 rounded-full ${budget >= 2500 && budget < 7500 ? colors.bg : 'bg-slate-200'}`} title="2500€-7500€: 20%" />
                                <div className={`flex-1 h-1.5 rounded-full ${budget >= 7500 && budget < 12500 ? colors.bg : 'bg-slate-200'}`} title="7500€-12500€: 15%" />
                                <div className={`flex-1 h-1.5 rounded-full ${budget >= 12500 ? 'bg-amber-500' : 'bg-slate-200'}`} title={lang === 'fr' ? '> 12500€: Sur devis' : '> 12500€: Custom'} />
                              </div>
                              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                                <span>{fp(500)}</span>
                                <span>20%</span>
                                <span>15%</span>
                                <span>{lang === 'fr' ? 'Devis' : 'Quote'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Services */}
                      <div className="space-y-6">
                        {domain.services.map(service => {
                          const selectedLevel = selections[service.id];

                          return (
                            <div
                              key={service.id}
                              className="p-6 rounded-xl bg-white border border-slate-200"
                            >
                              <div className="flex items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{service.icon}</span>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <h3 className="font-bold text-slate-900">{lang === 'fr' ? service.title : (service.titleEn || service.title)}</h3>
                                      {service.detailedInfo && (
                                        <Tooltip
                                          content={service.detailedInfo.content.intro}
                                          whyImportant={service.detailedInfo.content.conclusion}
                                          lang={lang}
                                        />
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-600">{lang === 'fr' ? service.description : (service.descriptionEn || service.description)}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {service.levels.map((level, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => toggleServiceLevel(service.id, idx)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                      selectedLevel === idx
                                        ? `${colors.border} ${colors.bgLight}`
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                                  >
                                    {level.popular && (
                                      <span className={`absolute -top-2 right-2 px-2 py-0.5 ${colors.bg} text-white text-xs font-medium rounded`}>
                                        {t.popular}
                                      </span>
                                    )}
                                    <div className="flex items-baseline gap-1 mb-2">
                                      {level.priceNote && (
                                        <span className="text-xs text-slate-500">{lang === 'fr' ? level.priceNote : (level.priceNoteEn || level.priceNote)}</span>
                                      )}
                                      <span className="text-xl font-bold text-slate-900">{fp(level.price)}</span>
                                      {service.isOneOff || level.isOneOff ? (
                                        <span className="text-xs text-slate-500">{t.oneOff}</span>
                                      ) : (
                                        <span className="text-xs text-slate-500">{t.perMonth}</span>
                                      )}
                                    </div>
                                    <div className="font-medium text-slate-900 mb-2">{lang === 'fr' ? level.name : (level.nameEn || level.name)}</div>
                                    <ul className="space-y-1">
                                      {(lang === 'fr' ? level.features : (level.featuresEn || level.features)).slice(0, 3).map((feature, i) => (
                                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                          <span className={`${colors.text} mt-0.5`}>•</span>
                                          {feature}
                                        </li>
                                      ))}
                                    </ul>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Tracking & Reporting section - shown proactively when marketing services selected */}
        {needsTracking && (
          <div
            className={`bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 overflow-hidden transition-all duration-300 ${
              trackingDismissed ? 'max-h-24 opacity-60' : 'max-h-[2000px]'
            }`}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">📊</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900">{t.trackingTitle}</h2>
                      <span className="px-2 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                        {t.trackingRecommended}
                      </span>
                    </div>
                    <p className="text-slate-600">{t.trackingSubtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTrackingDismissed(!trackingDismissed)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    trackingDismissed
                      ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                      : 'bg-white/80 text-slate-500 hover:bg-white'
                  }`}
                >
                  {trackingDismissed ? t.restoreSection : t.dismissSection}
                </button>
              </div>

              {!trackingDismissed && (
                <>
                  {/* Not sure option - like other departments */}
                  <button
                    onClick={toggleTrackingNotSure}
                    className={`w-full p-4 mb-6 rounded-xl border-2 text-left transition-all ${
                      trackingNotSure
                        ? 'border-cyan-500 bg-cyan-100 border-solid'
                        : 'border-dashed border-slate-300 hover:border-cyan-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📊</span>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">
                          {t.notSureAbout} Tracking - {t.letsChat}
                        </span>
                        <p className="text-sm text-slate-500">
                          {lang === 'fr' ? "Vous n'êtes pas sûr de ce dont vous avez besoin ? Discutons-en !" : "Not sure what you need? Let's chat about it!"}
                        </p>
                      </div>
                      {trackingNotSure && (
                        <span className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                          <CheckIcon />
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Tracking services - grayed out if "not sure" is selected */}
                  <div className={`transition-all duration-300 ${trackingNotSure ? 'opacity-40 pointer-events-none' : ''}`}>
                    {/* Tracking Audit - first option */}
                    <button
                      onClick={() => setTrackingAudit(!trackingAudit)}
                      className={`w-full p-4 mb-4 rounded-xl border-2 text-left transition-all ${
                        trackingAudit
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🔍</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {lang === 'fr' ? trackingAuditOption.titleFr : trackingAuditOption.title}
                            </span>
                            <Tooltip
                              content={lang === 'fr' ? trackingAuditOption.detailedInfoFr : trackingAuditOption.detailedInfo}
                              whyImportant={lang === 'fr' ? trackingAuditOption.whyImportantFr : trackingAuditOption.whyImportant}
                              lang={lang}
                            />
                          </div>
                          <p className="text-sm text-slate-500">
                            {lang === 'fr' ? trackingAuditOption.descriptionFr : trackingAuditOption.description}
                          </p>
                        </div>
                        <span className="font-bold text-slate-900">{fp(trackingAuditOption.price)}</span>
                        {trackingAudit && (
                          <span className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="grid md:grid-cols-2 gap-4">
                      {trackingServices.map(service => (
                        <button
                          key={service.id}
                          onClick={() => setTrackingSelections(prev => ({ ...prev, [service.id]: !prev[service.id] }))}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            trackingSelections[service.id]
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{service.icon}</span>
                            <div className="flex items-center gap-1 flex-1">
                              <span className="font-semibold text-slate-900">
                                {lang === 'fr' ? service.titleFr : service.title}
                              </span>
                              <Tooltip
                                content={lang === 'fr' ? service.detailedInfoFr : service.detailedInfo}
                                whyImportant={lang === 'fr' ? service.whyImportantFr : service.whyImportant}
                                lang={lang}
                              />
                            </div>
                            <span className="font-bold text-slate-900">{fp(service.price)}</span>
                          </div>
                          <p className="text-sm text-slate-600">{lang === 'fr' ? service.descriptionFr : service.description}</p>
                          {service.priceNote && (
                            <p className="text-xs text-slate-400 mt-1">({service.priceNote})</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Duration selection - only show if there are actual selections (not just "to discuss" domains) */}
        {hasActualSelections && !selectedDomains.every(d => d === 'ai-solutions') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t.duration}</h3>
            <div className="grid grid-cols-3 gap-4">
              {DURATION_CONFIG.options.map(opt => (
                <button
                  key={opt.months}
                  onClick={() => setDuration(opt.months as 4 | 6 | 12)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    duration === opt.months
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xl font-bold text-slate-900">
                    {opt.months} {t.months}
                  </div>
                  {opt.discount > 0 && (
                    <div className="text-sm text-green-600 font-medium">-{opt.discount}%</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary and form */}
        {hasSelections && (
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-8">{t.summary}</h3>

            <div className="space-y-4 mb-8">
              {/* "To discuss" domains */}
              {hasNotSureSelections && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-amber-300">{t.toDiscuss}</span>
                    <span className="text-amber-300 font-semibold">{t.needsDiscussion}</span>
                  </div>
                  {selectedDomains.filter(d => notSureAbout[d] && !dismissedDomains[d]).map(domainId => {
                    const domain = domainConfigs[domainId];
                    return (
                      <div key={domainId} className="flex justify-between text-sm">
                        <span className="text-slate-400 ml-4">↳ {domain.icon} {lang === 'fr' ? domain.nameFr : domain.name}</span>
                        <span className="text-amber-400/70">💬</span>
                      </div>
                    );
                  })}
                  {/* Tracking "not sure" */}
                  {trackingNotSure && !trackingDismissed && needsTracking && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 ml-4">↳ 📊 {t.trackingTitle}</span>
                      <span className="text-amber-400/70">💬</span>
                    </div>
                  )}
                </div>
              )}

              {/* Monthly total (services + management fees merged) */}
              {(pricing.monthlyTotal > 0 || pricing.managementFeesTotal > 0) && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t.managementFee}</span>
                    <span className="font-semibold">
                      {pricing.hasCustomQuote ? (
                        <span className="text-amber-400">{lang === 'fr' ? 'Sur devis' : 'Custom quote'}</span>
                      ) : (
                        <>{fp(Math.round(pricing.monthlyTotal + pricing.managementFeesTotal))}{lang === 'fr' ? '/mois' : '/mo'}</>
                      )}
                    </span>
                  </div>
                  {/* Management fee breakdown by domain */}
                  {selectedDomains.filter(d => !dismissedDomains[d] && !notSureAbout[d] && d !== 'ai-training').map(domainId => {
                    const domain = domainConfigs[domainId];
                    let domainMonthly = 0;
                    domain.services.forEach(service => {
                      const selectedLevel = selections[service.id];
                      if (selectedLevel !== null && selectedLevel !== undefined && !disabledServices[service.id] && !service.isOneOff) {
                        const level = service.levels[selectedLevel];
                        if (level) domainMonthly += level.price;
                      }
                    });
                    // Add management fee for ads domains
                    if (domain.hasTieredManagementFee && domain.hasBudgetSlider) {
                      const budget = adBudgets[domainId as 'google-ads' | 'paid-social'];
                      const feeResult = calculateManagementFee(domainId as 'google-ads' | 'paid-social', budget);
                      domainMonthly += feeResult.fee;
                    }
                    // Add CMS addon if applicable
                    if (domainId === 'seo' && cmsAddon && selections['seo-content'] !== null) {
                      domainMonthly += 100;
                    }
                    if (domainMonthly === 0) return null;
                    return (
                      <div key={domainId} className="flex justify-between text-sm">
                        <span className="text-slate-400 ml-4">↳ {domain.icon} {lang === 'fr' ? domain.nameFr : domain.name}</span>
                        <span className="text-slate-300">{fp(Math.round(domainMonthly))}{lang === 'fr' ? '/mois' : '/mo'}</span>
                      </div>
                    );
                  })}
                </>
              )}
              {/* Duration discount */}
              {pricing.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>{t.discount} ({pricing.discountPercentage}%)</span>
                  <span>-{fp(Math.round(pricing.discount))}{lang === 'fr' ? '/mois' : '/mo'}</span>
                </div>
              )}
              {/* One-off services */}
              {pricing.oneOffTotal > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t.oneOffServices}</span>
                    <span className="font-semibold">{fp(pricing.oneOffTotal)}</span>
                  </div>
                  {/* One-off breakdown by domain */}
                  {selectedDomains.filter(d => !dismissedDomains[d] && !notSureAbout[d]).map(domainId => {
                    const domain = domainConfigs[domainId];
                    let domainOneOff = 0;

                    // AI Training special handling
                    if (domainId === 'ai-training') {
                      const tier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
                      const base = aiTraining.format === 'full-day' ? tier.fullDay.price : tier.halfDay.price;
                      const multiplier = aiTraining.sessions === '5+' ? sessionCount : 1;
                      domainOneOff = base * multiplier + (aiTraining.inPerson ? 500 : 0);
                    } else {
                      domain.services.forEach(service => {
                        const selectedLevel = selections[service.id];
                        if (selectedLevel !== null && selectedLevel !== undefined && !disabledServices[service.id] && service.isOneOff) {
                          const level = service.levels[selectedLevel];
                          if (level) domainOneOff += level.price;
                        }
                      });
                    }

                    if (domainOneOff === 0) return null;
                    return (
                      <div key={domainId} className="flex justify-between text-sm">
                        <span className="text-slate-400 ml-4">↳ {domain.icon} {lang === 'fr' ? domain.nameFr : domain.name}</span>
                        <span className="text-slate-300">{fp(Math.round(domainOneOff))}</span>
                      </div>
                    );
                  })}
                </>
              )}
              {/* Tracking services */}
              {pricing.trackingTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 ml-4">↳ {t.trackingTitle}</span>
                  <span className="text-slate-300">{fp(pricing.trackingTotal)}</span>
                </div>
              )}

              {/* Separator for media budget - only if there are actual selections */}
              {hasActualSelections && (
                <div className="border-t border-slate-700 pt-4">
                  {/* Media budget (shown separately) */}
                  {pricing.adBudgetTotal > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>{t.adBudgetTotal} <span className="text-xs text-slate-400">({lang === 'fr' ? 'non inclus dans les frais' : 'not included in fees'})</span></span>
                      <span className="font-semibold">{fp(pricing.adBudgetTotal)}{lang === 'fr' ? '/mois' : '/mo'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Totals - only if there are actual selections */}
              {hasActualSelections && (
                <div className="border-t border-slate-700 pt-4 mt-4">
                  {/* Total without budget */}
                  <div className="flex justify-between text-lg">
                    <span>{lang === 'fr' ? 'Total services' : 'Services total'} ({duration} {t.months})</span>
                    <span className="font-bold">{fp(Math.round(pricing.grandTotalWithoutBudget))}</span>
                  </div>
                  {/* Total with budget (if applicable) */}
                  {pricing.adBudgetTotal > 0 && (
                    <div className="flex justify-between mt-2 text-sm text-slate-400">
                      <span>{lang === 'fr' ? 'Avec budget média' : 'With media budget'}</span>
                      <span>{fp(Math.round(pricing.grandTotalWithBudget))}</span>
                    </div>
                  )}
                  {/* Effective monthly */}
                  <div className="flex justify-between mt-4">
                    <span className="text-slate-300">{t.effectiveMonthly} <span className="text-xs">({lang === 'fr' ? 'hors budget média' : 'excl. media budget'})</span></span>
                    <span className="text-2xl font-bold text-blue-400">
                      {fp(Math.round(pricing.grandTotalWithoutBudget / duration))}{lang === 'fr' ? '/mois' : '/mo'}
                    </span>
                  </div>
                </div>
              )}

              {/* Message when only "to discuss" domains - no actual pricing */}
              {!hasActualSelections && hasNotSureSelections && (
                <div className="border-t border-slate-700 pt-4 mt-4">
                  <div className="text-center py-4">
                    <p className="text-amber-300 text-lg font-semibold mb-2">
                      {lang === 'fr' ? '💬 Discutons de vos besoins' : '💬 Let\'s discuss your needs'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {lang === 'fr'
                        ? 'Remplissez le formulaire et nous vous recontacterons pour définir ensemble la meilleure solution.'
                        : 'Fill out the form and we\'ll contact you to define the best solution together.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="text-lg font-semibold">{t.receiveQuote}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t.name}
                    value={contact.name}
                    onChange={(e) => setContact(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder={t.email}
                    value={contact.email}
                    onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  placeholder={t.company}
                  value={contact.company}
                  onChange={(e) => setContact(prev => ({ ...prev, company: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />

                {/* Anti-spam: Math challenge */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    {lang === 'fr' ? 'Vérification de sécurité' : 'Security check'}:{' '}
                    <span className="font-mono bg-white/10 px-2 py-1 rounded text-blue-300">
                      {mathChallenge.num1} {mathChallenge.operator} {mathChallenge.num2} = ?
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder={lang === 'fr' ? 'Votre réponse' : 'Your answer'}
                    value={mathAnswer}
                    onChange={(e) => { setMathAnswer(e.target.value); setAntiSpamError(''); }}
                    required
                    className="w-32 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  {antiSpamError && (
                    <p className="mt-2 text-red-400 text-sm">{antiSpamError}</p>
                  )}
                </div>

                {/* Anti-spam: Honeypot (hidden) */}
                <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="website_url"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !contact.name || !contact.email || !contact.company || !mathAnswer}
                  className="w-full py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.sending : t.send}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h4 className="text-xl font-bold mb-2">{t.success}</h4>
                <p className="text-slate-300">{t.successMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tracking Reminder Popup */}
      {showTrackingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">📊</span>
                <h3 className="text-2xl font-bold text-slate-900">{t.trackingPopupTitle}</h3>
              </div>
              <button
                onClick={() => setShowTrackingPopup(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <p className="text-slate-600 mb-6">{t.trackingPopupMessage}</p>

            <ul className="space-y-3 mb-8">
              {(lang === 'fr' ? trackingPopupContent.benefitsFr : trackingPopupContent.benefits).map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0">
                    <CheckIcon />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowTrackingPopup(false);
                  // Scroll to tracking section
                  const trackingSection = document.querySelector('[class*="from-cyan-50"]');
                  if (trackingSection) {
                    trackingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                {t.trackingPopupAdd}
              </button>
              <button
                onClick={async () => {
                  setShowTrackingPopup(false);
                  setTrackingPopupDismissed(true);
                  // Submit the form directly
                  await doSubmit();
                }}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                {t.trackingPopupSkip}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Popup */}
      {showSummaryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">{t.summary}</h3>
              <button
                onClick={() => setShowSummaryPopup(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* "To discuss" domains section */}
              {hasNotSureSelections && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💬</span>
                    <h4 className="font-bold text-amber-800">{t.toDiscuss}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {selectedDomains.filter(d => notSureAbout[d] && !dismissedDomains[d]).map(domainId => {
                      const domain = domainConfigs[domainId];
                      return (
                        <div key={domainId} className="flex justify-between text-amber-700">
                          <span>{domain.icon} {lang === 'fr' ? domain.nameFr : domain.name}</span>
                          <span className="text-amber-500">{t.needsDiscussion}</span>
                        </div>
                      );
                    })}
                    {trackingNotSure && !trackingDismissed && needsTracking && (
                      <div className="flex justify-between text-amber-700">
                        <span>📊 {t.trackingTitle}</span>
                        <span className="text-amber-500">{t.needsDiscussion}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* By department breakdown */}
              {selectedDomains.map(domainId => {
                const domain = domainConfigs[domainId];
                const colors = getDomainColors(domain.colorClass);
                // Skip tracking-reporting (shown separately), dismissed domains, and "not sure" domains
                if (domainId === 'tracking-reporting') return null;
                if (dismissedDomains[domainId] || notSureAbout[domainId]) return null;

                // Calculate domain total
                let domainMonthly = 0;
                let domainOneOff = 0;

                domain.services.forEach(service => {
                  const selectedLevel = selections[service.id];
                  if (selectedLevel !== null && selectedLevel !== undefined && !disabledServices[service.id]) {
                    const level = service.levels[selectedLevel];
                    if (level) {
                      if (service.isOneOff) domainOneOff += level.price;
                      else domainMonthly += level.price;
                    }
                  }
                });

                // Add management fee for ads domains
                let domainManagementFee = 0;
                if (domain.hasTieredManagementFee && domain.hasBudgetSlider) {
                  const budget = adBudgets[domainId as 'google-ads' | 'paid-social'];
                  const feeResult = calculateManagementFee(domainId as 'google-ads' | 'paid-social', budget);
                  domainManagementFee = feeResult.fee;
                }

                // AI Training totals
                let aiTrainingOneOff = 0;
                if (domainId === 'ai-training') {
                  const tier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
                  const base = aiTraining.format === 'full-day' ? tier.fullDay.price : tier.halfDay.price;
                  const multiplier = aiTraining.sessions === '5+' ? sessionCount : 1;
                  aiTrainingOneOff = base * multiplier + (aiTraining.inPerson ? 500 : 0);
                }

                // Skip if no services selected
                if (domainMonthly === 0 && domainOneOff === 0 && domainManagementFee === 0 && domainId !== 'ai-training') return null;

                const totalMonthly = domainMonthly + domainManagementFee;
                const totalOneOff = domainOneOff + (domainId === 'ai-training' ? aiTrainingOneOff : 0);

                return (
                  <div key={domainId} className={`${colors.bgLight} rounded-xl p-4 border ${colors.border}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{domain.icon}</span>
                      <h4 className="font-bold text-slate-900">{lang === 'fr' ? domain.nameFr : domain.name}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      {domain.services.map(service => {
                        const selectedLevel = selections[service.id];
                        if (selectedLevel === null || selectedLevel === undefined || disabledServices[service.id]) return null;
                        const level = service.levels[selectedLevel];
                        if (!level) return null;
                        return (
                          <div key={service.id} className="flex justify-between text-slate-600">
                            <span>{lang === 'fr' ? service.title : (service.titleEn || service.title)} - {lang === 'fr' ? level.name : (level.nameEn || level.name)}</span>
                            <span>{fp(level.price)}{service.isOneOff ? '' : (lang === 'fr' ? '/mois' : '/mo')}</span>
                          </div>
                        );
                      })}
                      {domainManagementFee > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>{t.managementFee}</span>
                          <span>{fp(Math.round(domainManagementFee))}{lang === 'fr' ? '/mois' : '/mo'}</span>
                        </div>
                      )}
                      {domainId === 'ai-training' && selectedDomains.includes('ai-training') && (
                        <div className="flex justify-between text-slate-600">
                          <span>{aiTraining.format === 'full-day' ? t.fullDay : t.halfDay} × {aiTraining.sessions === '5+' ? sessionCount : '1'}</span>
                          <span>
                            {(() => {
                              const tier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
                              const base = aiTraining.format === 'full-day' ? tier.fullDay.price : tier.halfDay.price;
                              const multiplier = aiTraining.sessions === '5+' ? sessionCount : 1;
                              return fp(base * multiplier);
                            })()}
                          </span>
                        </div>
                      )}
                      {domainId === 'ai-training' && aiTraining.inPerson && (
                        <div className="flex justify-between text-slate-600">
                          <span>{t.travelCost}</span>
                          <span>{fp(500)}</span>
                        </div>
                      )}
                      {/* Department subtotal */}
                      <div className={`flex justify-between pt-2 mt-2 border-t border-slate-200 font-semibold ${colors.text}`}>
                        <span>{t.departmentTotal}</span>
                        <div className="text-right">
                          {totalMonthly > 0 && <div>{fp(Math.round(totalMonthly))}{lang === 'fr' ? '/mois' : '/mo'}</div>}
                          {totalOneOff > 0 && <div>{fp(Math.round(totalOneOff))} {lang === 'fr' ? 'unique' : 'one-off'}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Tracking services */}
              {(pricing.trackingTotal > 0) && (
                <div className="bg-cyan-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📊</span>
                    <h4 className="font-bold text-slate-900">{t.trackingTitle}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {trackingAudit && (
                      <div className="flex justify-between text-slate-600">
                        <span>{lang === 'fr' ? trackingAuditOption.titleFr : trackingAuditOption.title}</span>
                        <span>{fp(trackingAuditOption.price)}</span>
                      </div>
                    )}
                    {trackingServices.filter(s => trackingSelections[s.id]).map(service => (
                      <div key={service.id} className="flex justify-between text-slate-600">
                        <span>{lang === 'fr' ? service.titleFr : service.title}</span>
                        <span>{fp(service.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl p-6 text-white">
                <div className="space-y-3">
                  {pricing.monthlyTotal + pricing.managementFeesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">{lang === 'fr' ? 'Mensuel' : 'Monthly'}</span>
                      <span className="font-semibold">{fp(Math.round(pricing.monthlyAfterDiscount))}{lang === 'fr' ? '/mois' : '/mo'}</span>
                    </div>
                  )}
                  {pricing.oneOffTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">{lang === 'fr' ? 'One-off' : 'One-time'}</span>
                      <span className="font-semibold">{fp(pricing.oneOffTotal)}</span>
                    </div>
                  )}
                  {pricing.adBudgetTotal > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>{t.adBudgetTotal}</span>
                      <span className="font-semibold">{fp(pricing.adBudgetTotal)}{lang === 'fr' ? '/mois' : '/mo'}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <div className="flex justify-between text-xl">
                      <span>Total ({duration} {t.months})</span>
                      <span className="font-bold">{fp(Math.round(pricing.grandTotalWithoutBudget))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email report button */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowSummaryPopup(false);
                    // Scroll to contact form
                    const form = document.querySelector('form');
                    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {lang === 'fr' ? 'Recevoir ce récap par email' : 'Receive this summary by email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
