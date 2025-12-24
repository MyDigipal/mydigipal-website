/** @jsxImportSource react */
import { useState, useMemo, useCallback } from 'react';
import type { ServiceDomain, AITrainingSelection, AISolutionsAnswers, ContactInfo } from './types';
import {
  domainConfigs,
  BUDGET_CONFIG,
  DURATION_CONFIG,
  SETUP_OPTIONS,
  calculateManagementFee,
  aiTrainingPricing,
  halfDayFeatures,
  fullDayAdditionalFeatures,
  aiSolutionsQuestions,
  aiSolutionsUseCases
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
  const [setupSelections, setSetupSelections] = useState<Record<string, boolean>>({});
  const [cmsAddon, setCmsAddon] = useState(false);

  // AI Training state
  const [aiTraining, setAiTraining] = useState<AITrainingSelection>({
    format: 'half-day',
    sessions: '1',
    inPerson: false,
    travelCost: 300
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
    let setupTotal = 0;

    // Calculate service prices
    selectedDomains.forEach(domain => {
      const config = domainConfigs[domain];

      // Skip AI Training and AI Solutions (special handling)
      if (domain === 'ai-training' || domain === 'ai-solutions') return;

      // Add management fees for ads domains
      if (config.hasBudgetSlider) {
        const budget = adBudgets[domain as 'google-ads' | 'paid-social'];
        adBudgetTotal += budget;
        managementFeesTotal += calculateManagementFee(domain as 'google-ads' | 'paid-social', budget);
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

    // Setup options
    SETUP_OPTIONS.forEach(opt => {
      if (setupSelections[opt.id]) {
        setupTotal += opt.price;
      }
    });

    // Duration discount
    const durationConfig = DURATION_CONFIG.options.find(d => d.months === duration);
    const discountPercentage = durationConfig?.discount || 0;
    const monthlyBeforeDiscount = monthlyTotal + managementFeesTotal;
    const discount = monthlyBeforeDiscount * (discountPercentage / 100);

    // Calculate totals
    const monthlyAfterDiscount = monthlyBeforeDiscount - discount;
    const totalMonthly = monthlyAfterDiscount + adBudgetTotal;
    const grandTotal = (monthlyAfterDiscount * duration) + oneOffTotal + setupTotal + (adBudgetTotal * duration);
    const effectiveMonthly = grandTotal / duration;

    return {
      monthlyTotal,
      oneOffTotal,
      adBudgetTotal,
      managementFeesTotal,
      setupTotal,
      discount,
      discountPercentage,
      monthlyAfterDiscount,
      totalMonthly,
      grandTotal,
      effectiveMonthly
    };
  }, [selectedDomains, selections, disabledServices, adBudgets, aiTraining, cmsAddon, setupSelections, duration]);

  // Check if any service is selected
  const hasSelections = useMemo(() => {
    if (selectedDomains.includes('ai-training')) return true;
    if (selectedDomains.includes('ai-solutions')) return true;
    return Object.values(selections).some(v => v !== null);
  }, [selectedDomains, selections]);

  // Submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

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
      setupSelections,
      cmsAddon,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'marketing-calculator-v3',
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
  }, [contact, selectedDomains, selections, adBudgets, aiTraining, aiSolutions, pricing, duration, setupSelections, cmsAddon, lang, isSubmitting]);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setStep('domains')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft />
          {t.backToDomains}
        </button>

        {hasSelections && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500">{t.estimatedMonthly}</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(pricing.effectiveMonthly).toLocaleString()}€<span className="text-sm font-normal text-slate-500">/mois</span>
              </p>
            </div>
            <button
              onClick={() => setStep('summary')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t.viewSummary}
            </button>
          </div>
        )}
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">{t.travelCost}</label>
                      <input
                        type="number"
                        value={aiTraining.travelCost}
                        onChange={(e) => setAiTraining(prev => ({ ...prev, travelCost: parseInt(e.target.value) || 0 }))}
                        className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        min="0"
                        step="50"
                      />
                      <span className="ml-2 text-slate-600">€</span>
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
              {domain.hasBudgetSlider && (
                <div className="mb-8 p-6 bg-slate-50 rounded-xl">
                  <label className="block text-sm font-medium text-slate-700 mb-4">{t.adBudget}</label>
                  <input
                    type="range"
                    min={BUDGET_CONFIG.min}
                    max={BUDGET_CONFIG.max}
                    step={BUDGET_CONFIG.step}
                    value={adBudgets[domainId as 'google-ads' | 'paid-social']}
                    onChange={(e) => setAdBudgets(prev => ({ ...prev, [domainId]: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-slate-500">{BUDGET_CONFIG.min}€</span>
                    <span className="text-xl font-bold text-slate-900">
                      {adBudgets[domainId as 'google-ads' | 'paid-social'].toLocaleString()}€/mois
                    </span>
                    <span className="text-sm text-slate-500">{BUDGET_CONFIG.max.toLocaleString()}€</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-600">{t.managementFee}</span>
                    <span className="font-medium text-slate-900">
                      {calculateManagementFee(domainId as 'google-ads' | 'paid-social', adBudgets[domainId as 'google-ads' | 'paid-social']).toLocaleString()}€/mois
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{t.managementFeeNote}</p>
                </div>
              )}

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
                            <h3 className="font-bold text-slate-900">{service.title}</h3>
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

        {/* Setup options */}
        {selectedDomains.length > 0 && !selectedDomains.every(d => d === 'ai-solutions') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t.additionalSetup}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {SETUP_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSetupSelections(prev => ({ ...prev, [opt.id]: !prev[opt.id] }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    setupSelections[opt.id]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{opt.icon}</span>
                    <span className="font-semibold text-slate-900">
                      {lang === 'fr' ? opt.nameFr : opt.name}
                    </span>
                    <span className="ml-auto font-bold text-slate-900">{opt.price}€</span>
                  </div>
                  <p className="text-sm text-slate-600">{lang === 'fr' ? opt.descriptionFr : opt.description}</p>
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
              {pricing.monthlyTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.monthlyServices}</span>
                  <span className="font-semibold">{pricing.monthlyTotal.toLocaleString()}€/mois</span>
                </div>
              )}
              {pricing.managementFeesTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.managementFees}</span>
                  <span className="font-semibold">{pricing.managementFeesTotal.toLocaleString()}€/mois</span>
                </div>
              )}
              {pricing.adBudgetTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.adBudgetTotal}</span>
                  <span className="font-semibold">{pricing.adBudgetTotal.toLocaleString()}€/mois</span>
                </div>
              )}
              {pricing.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>{t.discount} ({pricing.discountPercentage}%)</span>
                  <span>-{Math.round(pricing.discount).toLocaleString()}€/mois</span>
                </div>
              )}
              {pricing.oneOffTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.oneOffServices}</span>
                  <span className="font-semibold">{pricing.oneOffTotal.toLocaleString()}€</span>
                </div>
              )}
              {pricing.setupTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-300">{t.setupServices}</span>
                  <span className="font-semibold">{pricing.setupTotal.toLocaleString()}€</span>
                </div>
              )}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between text-lg">
                  <span>{t.total} ({duration} {t.months})</span>
                  <span className="font-bold">{Math.round(pricing.grandTotal).toLocaleString()}€</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-slate-300">{t.effectiveMonthly}</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {Math.round(pricing.effectiveMonthly).toLocaleString()}€/mois
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
    </div>
  );
}
