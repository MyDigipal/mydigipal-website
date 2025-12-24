/** @jsxImportSource react */
import { useState, useMemo, useCallback } from 'react';
import type { ServiceDomain, AITrainingSelection, AISolutionsAnswers, ContactInfo } from './types';
import {
  domainConfigs,
  BUDGET_CONFIG,
  DURATION_CONFIG,
  MANAGEMENT_FEE_CONFIG,
  calculateManagementFee,
  getManagementFeeDescription,
  aiTrainingPricing,
  halfDayFeatures,
  fullDayAdditionalFeatures,
  aiSolutionsQuestions,
  aiSolutionsUseCases,
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
  const [step, setStep] = useState<'domains' | 'configure' | 'summary'>('domains');
  const [selectedDomains, setSelectedDomains] = useState<ServiceDomain[]>(
    preselectedDomain ? [preselectedDomain] : []
  );
  const [selections, setSelections] = useState<Record<string, number | null>>({});
  const [disabledServices, setDisabledServices] = useState<Record<string, boolean>>({});
  const [adBudgets, setAdBudgets] = useState({
    'google-ads': BUDGET_CONFIG.default,
    'paid-social': BUDGET_CONFIG.default
  });
  const [duration, setDuration] = useState<4 | 6 | 12>(4);
  const [cmsAddon, setCmsAddon] = useState(false);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);

  // AI Training state
  const [aiTraining, setAiTraining] = useState<AITrainingSelection>({
    format: 'half-day',
    sessions: '1',
    inPerson: false,
    travelCost: aiTrainingPricing.travelCost.default
  });

  // AI Solutions state
  const [aiSolutions, setAiSolutions] = useState<AISolutionsAnswers>({
    projectType: '',
    currentTools: '',
    timeline: '',
    budget: '',
    additionalInfo: ''
  });

  // Contact form
  const [contact, setContact] = useState<ContactInfo>({ name: '', email: '', company: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Tracking state
  const [trackingSelections, setTrackingSelections] = useState<Record<string, boolean>>({});
  const [trackingAudit, setTrackingAudit] = useState(false);
  const [showTrackingPopup, setShowTrackingPopup] = useState(false);
  const [trackingPopupDismissed, setTrackingPopupDismissed] = useState(false);

  // Toggle domain selection
  const toggleDomain = useCallback((domain: ServiceDomain) => {
    setSelectedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
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

      // Skip AI Training and AI Solutions (special handling)
      if (domain === 'ai-training' || domain === 'ai-solutions') return;

      // Add management fees for ads domains (tiered structure)
      if (config.hasBudgetSlider && config.hasTieredManagementFee) {
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

    // AI Training pricing
    if (selectedDomains.includes('ai-training')) {
      const pricingTier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
      const basePrice = aiTraining.format === 'full-day' ? pricingTier.fullDay.price : pricingTier.halfDay.price;
      const sessionMultiplier = aiTraining.sessions === '5+' ? 5 : 1;
      const trainingTotal = basePrice * sessionMultiplier + (aiTraining.inPerson ? aiTraining.travelCost : 0);
      oneOffTotal += trainingTotal;
    }

    // CMS addon
    if (cmsAddon && selections['seo-content'] !== null) {
      monthlyTotal += 100;
    }

    // Tracking services (one-off)
    let trackingTotal = 0;
    if (trackingAudit) {
      trackingTotal += trackingAuditOption.price;
    }
    trackingServices.forEach(service => {
      if (trackingSelections[service.id]) {
        trackingTotal += service.price;
      }
    });
    oneOffTotal += trackingTotal;

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
  }, [selectedDomains, selections, disabledServices, adBudgets, aiTraining, cmsAddon, trackingSelections, trackingAudit, duration]);

  // Check if any service is selected
  const hasSelections = useMemo(() => {
    if (selectedDomains.includes('ai-training')) return true;
    if (selectedDomains.includes('ai-solutions')) return true;
    return Object.values(selections).some(v => v !== null);
  }, [selectedDomains, selections]);

  // Check if user needs tracking (has marketing services selected)
  const needsTracking = useMemo(() => {
    return selectedDomains.some(d => servicesThatNeedTracking.includes(d));
  }, [selectedDomains]);

  // Check if user has any tracking selected
  const hasTrackingSelected = useMemo(() => {
    if (trackingAudit) return true;
    return Object.values(trackingSelections).some(v => v);
  }, [trackingAudit, trackingSelections]);

  // Submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Show tracking popup if user needs tracking but hasn't selected any
    if (needsTracking && !hasTrackingSelected && !trackingPopupDismissed) {
      setShowTrackingPopup(true);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      contact,
      selectedDomains,
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
      cmsAddon,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'marketing-calculator-v4',
        lang
      }
    };

    try {
      await fetch('https://n8n.mydigipal.com/webhook/calculateur-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert(lang === 'fr' ? 'Erreur de connexion. Veuillez réessayer.' : 'Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [contact, selectedDomains, selections, adBudgets, aiTraining, aiSolutions, pricing, duration, trackingSelections, trackingAudit, cmsAddon, lang, isSubmitting, needsTracking, hasTrackingSelected, trackingPopupDismissed]);

  // Domain selection step
  if (step === 'domains') {
    return (
      <div className="min-h-[600px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.selectDomains}</h2>
          <p className="text-lg text-slate-600">{t.selectDomainsDesc}</p>
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
              violet: 'border-violet-500 bg-violet-50'
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
                    {t.customQuote}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedDomains.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">
              {selectedDomains.length} {t.selected}
            </p>
            <button
              onClick={() => setStep('configure')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t.continue}
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Configuration step
  return (
    <div className="min-h-[600px]">
      {/* Sticky Header with Totals */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 -mx-4 px-4 py-4 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep('domains')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft />
            {t.backToDomains}
          </button>

          {hasSelections && (
            <div className="flex items-center gap-6">
              {/* Monthly Total (without media budget) */}
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'Mensuel' : 'Monthly'}</p>
                <p className="text-xl font-bold text-blue-600">
                  {pricing.hasCustomQuote ? (
                    <span className="text-amber-600">{lang === 'fr' ? 'Sur devis' : 'Custom'}</span>
                  ) : (
                    <>{Math.round(pricing.totalMonthlyWithoutBudget).toLocaleString()}€<span className="text-sm font-normal text-slate-400">/mois</span></>
                  )}
                </p>
              </div>
              {/* One-off Total */}
              {pricing.oneOffTotal > 0 && (
                <div className="text-right border-l border-slate-200 pl-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'One-off' : 'One-time'}</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {Math.round(pricing.oneOffTotal).toLocaleString()}€
                  </p>
                </div>
              )}
              {/* View Summary Button */}
              <button
                onClick={() => setShowSummaryPopup(true)}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                {t.viewSummary}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Services configuration */}
      <div className="space-y-12">
        {selectedDomains.map(domainId => {
          const domain = domainConfigs[domainId];

          // Special handling for AI Training
          if (domainId === 'ai-training') {
            return (
              <div key={domainId} className="bg-white rounded-2xl border border-slate-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl">{domain.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {lang === 'fr' ? domain.nameFr : domain.name}
                    </h2>
                    <p className="text-slate-600">{lang === 'fr' ? domain.descriptionFr : domain.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Format selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">{t.aiTrainingFormat}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setAiTraining(prev => ({ ...prev, format: 'half-day' }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          aiTraining.format === 'half-day'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{t.halfDay}</div>
                        <div className="text-sm text-slate-500">3 heures</div>
                      </button>
                      <button
                        onClick={() => setAiTraining(prev => ({ ...prev, format: 'full-day' }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          aiTraining.format === 'full-day'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{t.fullDay}</div>
                        <div className="text-sm text-slate-500">6.5 heures</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
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
                        onClick={() => setAiTraining(prev => ({ ...prev, sessions: '1' }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          aiTraining.sessions === '1'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{t.singleSession}</div>
                      </button>
                      <button
                        onClick={() => setAiTraining(prev => ({ ...prev, sessions: '5+' }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          aiTraining.sessions === '5+'
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{t.bulkSessions}</div>
                        <div className="text-xs text-emerald-600">-20% par session</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* In-person option */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aiTraining.inPerson}
                      onChange={(e) => setAiTraining(prev => ({ ...prev, inPerson: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-medium text-slate-900">{t.inPerson}</span>
                      <p className="text-sm text-slate-500">{t.inPersonNote}</p>
                    </div>
                  </label>

                  {aiTraining.inPerson && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t.travelCost} <span className="text-slate-400 font-normal">({lang === 'fr' ? 'frais unique' : 'one-off fee'})</span>
                      </label>
                      <input
                        type="range"
                        min={aiTrainingPricing.travelCost.min}
                        max={aiTrainingPricing.travelCost.max}
                        step={50}
                        value={aiTraining.travelCost}
                        onChange={(e) => setAiTraining(prev => ({ ...prev, travelCost: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-slate-500">{aiTrainingPricing.travelCost.min}€ ({lang === 'fr' ? 'proche' : 'nearby'})</span>
                        <span className="font-bold text-emerald-700">{aiTraining.travelCost}€</span>
                        <span className="text-slate-500">{aiTrainingPricing.travelCost.max}€ ({lang === 'fr' ? 'hôtel requis' : 'hotel required'})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price display */}
                <div className="mt-6 p-6 bg-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">
                      {aiTraining.format === 'full-day' ? t.fullDay : t.halfDay} × {aiTraining.sessions === '5+' ? '5' : '1'} session(s)
                      {aiTraining.inPerson && ` + ${t.travelCost.toLowerCase()}`}
                    </span>
                    <span className="text-2xl font-bold text-emerald-700">
                      {(() => {
                        const tier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
                        const base = aiTraining.format === 'full-day' ? tier.fullDay.price : tier.halfDay.price;
                        const multiplier = aiTraining.sessions === '5+' ? 5 : 1;
                        const travel = aiTraining.inPerson ? aiTraining.travelCost : 0;
                        return ((base * multiplier) + travel).toLocaleString();
                      })()}€
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Special handling for AI Solutions
          if (domainId === 'ai-solutions') {
            return (
              <div key={domainId} className="bg-white rounded-2xl border border-slate-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-4xl">{domain.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {lang === 'fr' ? domain.nameFr : domain.name}
                    </h2>
                    <p className="text-slate-600">{t.aiSolutionsDesc}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {(lang === 'fr' ? aiSolutionsUseCases.fr : aiSolutionsUseCases.en).map((useCase, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-violet-50 rounded-xl">
                      <span className="text-2xl">{useCase.icon}</span>
                      <div>
                        <h4 className="font-semibold text-slate-900">{useCase.title}</h4>
                        <p className="text-sm text-slate-600">{useCase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
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
              </div>
            );
          }

          // Standard service domain
          return (
            <div key={domainId} className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">{domain.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {lang === 'fr' ? domain.nameFr : domain.name}
                  </h2>
                  <p className="text-slate-600">{lang === 'fr' ? domain.descriptionFr : domain.description}</p>
                </div>
              </div>

              {/* Budget slider for ads */}
              {domain.hasBudgetSlider && (() => {
                const budget = adBudgets[domainId as 'google-ads' | 'paid-social'];
                const feeResult = calculateManagementFee(domainId as 'google-ads' | 'paid-social', budget);
                const feeDescription = getManagementFeeDescription(budget, lang);
                return (
                  <div className="mb-8 p-6 bg-slate-50 rounded-xl">
                    <label className="block text-sm font-medium text-slate-700 mb-4">{t.adBudget}</label>
                    <input
                      type="range"
                      min={BUDGET_CONFIG.min}
                      max={BUDGET_CONFIG.max}
                      step={BUDGET_CONFIG.step}
                      value={budget}
                      onChange={(e) => setAdBudgets(prev => ({ ...prev, [domainId]: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-slate-500">{BUDGET_CONFIG.min}€</span>
                      <span className="text-xl font-bold text-slate-900">
                        {budget.toLocaleString()}€/mois
                      </span>
                      <span className="text-sm text-slate-500">{BUDGET_CONFIG.max.toLocaleString()}€</span>
                    </div>
                    {/* Tiered management fee display */}
                    <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{t.managementFee}</span>
                        <span className="font-bold text-slate-900">
                          {feeResult.isCustomQuote ? (
                            <span className="text-amber-600">{lang === 'fr' ? 'Sur devis' : 'Custom quote'}</span>
                          ) : (
                            <>{Math.round(feeResult.fee).toLocaleString()}€/mois</>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{feeDescription}</p>
                      {/* Tier indicators */}
                      <div className="mt-3 flex gap-1">
                        <div className={`flex-1 h-1.5 rounded-full ${budget < 2500 ? 'bg-blue-500' : 'bg-slate-200'}`} title="< 2500€: 500€/mois" />
                        <div className={`flex-1 h-1.5 rounded-full ${budget >= 2500 && budget < 10000 ? 'bg-blue-500' : 'bg-slate-200'}`} title="2500€-10000€: 20%" />
                        <div className={`flex-1 h-1.5 rounded-full ${budget >= 10000 ? 'bg-amber-500' : 'bg-slate-200'}`} title="> 10000€: Sur devis" />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                        <span>500€/mois</span>
                        <span>20%</span>
                        <span>{lang === 'fr' ? 'Sur devis' : 'Quote'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Services */}
              <div className="space-y-8">
                {domain.services.map(service => {
                  const isDisabled = disabledServices[service.id];
                  const selectedLevel = selections[service.id];

                  return (
                    <div
                      key={service.id}
                      className={`p-6 rounded-xl border ${isDisabled ? 'opacity-50 bg-slate-50' : 'bg-white'} border-slate-200`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{service.icon}</span>
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-bold text-slate-900">{service.title}</h3>
                              {service.detailedInfo && (
                                <Tooltip
                                  content={service.detailedInfo.content.intro}
                                  whyImportant={service.detailedInfo.content.conclusion}
                                  lang={lang}
                                />
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{service.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleDisabled(service.id)}
                          className={`text-sm px-3 py-1 rounded-full transition-colors ${
                            isDisabled
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {isDisabled ? '+ Activer' : t.noThanks}
                        </button>
                      </div>

                      {!isDisabled && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {service.levels.map((level, idx) => (
                            <button
                              key={idx}
                              onClick={() => toggleServiceLevel(service.id, idx)}
                              className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                                selectedLevel === idx
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {level.popular && (
                                <span className="absolute -top-2 right-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                                  {t.popular}
                                </span>
                              )}
                              <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-xl font-bold text-slate-900">{level.price}€</span>
                                {service.isOneOff ? (
                                  <span className="text-xs text-slate-500">{t.oneOff}</span>
                                ) : (
                                  <span className="text-xs text-slate-500">{t.perMonth}</span>
                                )}
                              </div>
                              <div className="font-medium text-slate-900 mb-2">{level.name}</div>
                              <ul className="space-y-1">
                                {level.features.slice(0, 3).map((feature, i) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Tracking & Reporting section - shown proactively when marketing services selected */}
        {needsTracking && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 p-8">
            <div className="flex items-center gap-4 mb-6">
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

            {/* Audit option at the top */}
            <button
              onClick={() => setTrackingAudit(!trackingAudit)}
              className={`w-full p-4 mb-6 rounded-xl border-2 text-left transition-all ${
                trackingAudit
                  ? 'border-cyan-500 bg-cyan-100'
                  : 'border-dashed border-cyan-300 hover:border-cyan-400 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{trackingAuditOption.icon}</span>
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
                <span className="font-bold text-cyan-700">{trackingAuditOption.price}€</span>
                {trackingAudit && (
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                    <CheckIcon />
                  </span>
                )}
              </div>
            </button>

            {/* Tracking services */}
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
                    <span className="font-bold text-slate-900">{service.price}€</span>
                  </div>
                  <p className="text-sm text-slate-600">{lang === 'fr' ? service.descriptionFr : service.description}</p>
                  {service.priceNote && (
                    <p className="text-xs text-slate-400 mt-1">({service.priceNote})</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duration selection */}
        {hasSelections && !selectedDomains.every(d => d === 'ai-solutions') && (
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
              {/* Monthly services */}
              {pricing.monthlyTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.monthlyServices}</span>
                  <span className="font-semibold">{pricing.monthlyTotal.toLocaleString()}€/mois</span>
                </div>
              )}
              {/* Management fees */}
              {pricing.managementFeesTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.managementFees}</span>
                  <span className="font-semibold">
                    {pricing.hasCustomQuote ? (
                      <span className="text-amber-400">{lang === 'fr' ? 'Sur devis' : 'Custom quote'}</span>
                    ) : (
                      <>{pricing.managementFeesTotal.toLocaleString()}€/mois</>
                    )}
                  </span>
                </div>
              )}
              {/* Duration discount */}
              {pricing.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>{t.discount} ({pricing.discountPercentage}%)</span>
                  <span>-{Math.round(pricing.discount).toLocaleString()}€/mois</span>
                </div>
              )}
              {/* One-off services */}
              {pricing.oneOffTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.oneOffServices}</span>
                  <span className="font-semibold">{pricing.oneOffTotal.toLocaleString()}€</span>
                </div>
              )}
              {/* Tracking services */}
              {pricing.trackingTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 ml-4">↳ {t.trackingTitle}</span>
                  <span className="text-slate-300">{pricing.trackingTotal.toLocaleString()}€</span>
                </div>
              )}

              {/* Separator for media budget */}
              <div className="border-t border-slate-700 pt-4">
                {/* Media budget (shown separately) */}
                {pricing.adBudgetTotal > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>{t.adBudgetTotal} <span className="text-xs text-slate-400">({lang === 'fr' ? 'non inclus dans les frais' : 'not included in fees'})</span></span>
                    <span className="font-semibold">{pricing.adBudgetTotal.toLocaleString()}€/mois</span>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-700 pt-4 mt-4">
                {/* Total without budget */}
                <div className="flex justify-between text-lg">
                  <span>{lang === 'fr' ? 'Total services' : 'Services total'} ({duration} {t.months})</span>
                  <span className="font-bold">{Math.round(pricing.grandTotalWithoutBudget).toLocaleString()}€</span>
                </div>
                {/* Total with budget (if applicable) */}
                {pricing.adBudgetTotal > 0 && (
                  <div className="flex justify-between mt-2 text-sm text-slate-400">
                    <span>{lang === 'fr' ? 'Avec budget média' : 'With media budget'}</span>
                    <span>{Math.round(pricing.grandTotalWithBudget).toLocaleString()}€</span>
                  </div>
                )}
                {/* Effective monthly */}
                <div className="flex justify-between mt-4">
                  <span className="text-slate-300">{t.effectiveMonthly} <span className="text-xs">({lang === 'fr' ? 'hors budget média' : 'excl. media budget'})</span></span>
                  <span className="text-2xl font-bold text-blue-400">
                    {Math.round(pricing.grandTotalWithoutBudget / duration).toLocaleString()}€/mois
                  </span>
                </div>
              </div>
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
                  <input
                    type="text"
                    placeholder={t.company}
                    value={contact.company}
                    onChange={(e) => setContact(prev => ({ ...prev, company: e.target.value }))}
                    required
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder={t.phone}
                    value={contact.phone}
                    onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
                    className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
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
                onClick={() => {
                  setShowTrackingPopup(false);
                  setTrackingPopupDismissed(true);
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
              {/* By department breakdown */}
              {selectedDomains.map(domainId => {
                const domain = domainConfigs[domainId];
                if (domainId === 'ai-solutions') return null; // Skip AI Solutions

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

                // Skip if no services selected
                if (domainMonthly === 0 && domainOneOff === 0 && domainManagementFee === 0 && domainId !== 'ai-training') return null;

                return (
                  <div key={domainId} className="bg-slate-50 rounded-xl p-4">
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
                            <span>{service.title} - {level.name}</span>
                            <span>{level.price}€{service.isOneOff ? '' : '/mois'}</span>
                          </div>
                        );
                      })}
                      {domainManagementFee > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>{t.managementFee}</span>
                          <span>{domainManagementFee}€/mois</span>
                        </div>
                      )}
                      {domainId === 'ai-training' && selectedDomains.includes('ai-training') && (
                        <div className="flex justify-between text-slate-600">
                          <span>{aiTraining.format === 'full-day' ? t.fullDay : t.halfDay} × {aiTraining.sessions === '5+' ? '5' : '1'}</span>
                          <span>
                            {(() => {
                              const tier = aiTraining.sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
                              const base = aiTraining.format === 'full-day' ? tier.fullDay.price : tier.halfDay.price;
                              const multiplier = aiTraining.sessions === '5+' ? 5 : 1;
                              return (base * multiplier).toLocaleString();
                            })()}€
                          </span>
                        </div>
                      )}
                      {domainId === 'ai-training' && aiTraining.inPerson && (
                        <div className="flex justify-between text-slate-600">
                          <span>{t.travelCost}</span>
                          <span>{aiTraining.travelCost}€</span>
                        </div>
                      )}
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
                        <span>{trackingAuditOption.price}€</span>
                      </div>
                    )}
                    {trackingServices.filter(s => trackingSelections[s.id]).map(service => (
                      <div key={service.id} className="flex justify-between text-slate-600">
                        <span>{lang === 'fr' ? service.titleFr : service.title}</span>
                        <span>{service.price}€</span>
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
                      <span className="font-semibold">{Math.round(pricing.monthlyAfterDiscount).toLocaleString()}€/mois</span>
                    </div>
                  )}
                  {pricing.oneOffTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">One-off</span>
                      <span className="font-semibold">{pricing.oneOffTotal.toLocaleString()}€</span>
                    </div>
                  )}
                  {pricing.adBudgetTotal > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>{t.adBudgetTotal}</span>
                      <span className="font-semibold">{pricing.adBudgetTotal.toLocaleString()}€/mois</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <div className="flex justify-between text-xl">
                      <span>Total ({duration} {t.months})</span>
                      <span className="font-bold">{Math.round(pricing.grandTotalWithoutBudget).toLocaleString()}€</span>
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
