/** @jsxImportSource react */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { ServiceDomain, GuidedAnswers, GuidedRecommendation } from './types';
import { guidedQuestions, generateRecommendation, getBudgetLabel, guidedDomainActions, buildEvolutionPath, getBenchmarks, industryInsights } from './guided-data';
import { domainConfigs, formatPrice } from './data';
import type { Currency } from './types';

interface GuidedModeProps {
  lang: 'en' | 'fr';
  currency: Currency;
  onComplete: (recommendation: GuidedRecommendation) => void;
  onSkip: () => void;
  t: Record<string, string>;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  content: string;
  isTyping?: boolean;
}

// Bot avatar component
const BotAvatar = () => (
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <circle cx="9" cy="14" r="1.5" fill="white" />
      <circle cx="15" cy="14" r="1.5" fill="white" />
    </svg>
  </div>
);

// Typing indicator
const TypingIndicator = () => (
  <div className="flex items-start gap-3">
    <BotAvatar />
    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// Use shared domain actions from guided-data
const domainActions = guidedDomainActions;

export default function GuidedMode({ lang, currency, onComplete, onSkip, t }: GuidedModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<GuidedAnswers>({
    industry: '',
    goals: [],
    monthlyBudget: 2000,
    currentEfforts: [],
    freeTextContext: ''
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [recommendation, setRecommendation] = useState<GuidedRecommendation | null>(null);
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(2000);
  const [textValue, setTextValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recCardRef = useRef<HTMLDivElement>(null);

  // Non-linear budget scale: small steps at the start, larger at the end
  // 500-3000 by 500, 3000-7000 by 1000, 7000-20000 by 2000 (but we don't need sliderConfig anymore)
  const budgetSteps = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 15000, 20000];
  const [sliderIndex, setSliderIndex] = useState(3); // default = 2000€

  const scrollToBottom = useCallback(() => {
    // Only scroll DOWN, never up - prevents the jarring jump
    setTimeout(() => {
      if (!chatEndRef.current) return;
      const rect = chatEndRef.current.getBoundingClientRect();
      // Only scroll if the bottom element is below the viewport
      if (rect.top > window.innerHeight - 100) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);
  }, []);

  // Add bot message with typing delay
  const addBotMessage = useCallback((content: string) => {
    setIsTyping(true);
    setShowOptions(false);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content
      }]);
      setTimeout(() => setShowOptions(true), 200);
      scrollToBottom();
    }, 600);
  }, [scrollToBottom]);

  // Add user message
  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      sender: 'user',
      content
    }]);
    scrollToBottom();
  }, [scrollToBottom]);

  // GTM dataLayer helper
  const pushDataLayer = useCallback((event: string, data?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event, ...data });
    }
  }, []);

  // Initialize first question
  useEffect(() => {
    const q = guidedQuestions[0];
    const greeting = lang === 'fr'
      ? 'Bonjour ! Je vais vous aider à trouver les services adaptés à vos besoins. 👋'
      : 'Hi! I\'ll help you find the right services for your needs. 👋';

    setMessages([{
      id: 'greeting',
      sender: 'bot',
      content: greeting
    }]);

    pushDataLayer('guided_mode_start', { language: lang });

    setTimeout(() => {
      addBotMessage(q.question[lang] + (q.subtitle ? `\n${q.subtitle[lang]}` : ''));
    }, 800);
  }, [lang, addBotMessage, pushDataLayer]);

  // Process answer and advance to next question
  const processAnswer = useCallback((answerText: string, answerValue: string | string[] | number) => {
    addUserMessage(answerText);
    setShowOptions(false);
    setMultiSelections([]);

    const q = guidedQuestions[currentStep];
    const updatedAnswers = { ...answers };

    if (q.id === 'industry') {
      updatedAnswers.industry = answerValue as string;
    } else if (q.id === 'goals') {
      updatedAnswers.goals = answerValue as string[];
    } else if (q.id === 'monthlyBudget') {
      updatedAnswers.monthlyBudget = answerValue as number;
    } else if (q.id === 'currentEfforts') {
      updatedAnswers.currentEfforts = answerValue as string[];
    } else if (q.id === 'freeTextContext') {
      updatedAnswers.freeTextContext = answerValue as string;
    }

    setAnswers(updatedAnswers);

    // GTM: track each question answer
    pushDataLayer('guided_question_answered', {
      question_id: q.id,
      question_step: currentStep + 1,
      answer_value: typeof answerValue === 'object' ? (answerValue as string[]).join(',') : String(answerValue)
    });

    const nextStep = currentStep + 1;
    if (nextStep < guidedQuestions.length) {
      setCurrentStep(nextStep);
      const nextQ = guidedQuestions[nextStep];
      if (nextQ.type === 'slider') {
        // Default to index 3 (2000€) on the non-linear scale
        setSliderIndex(3);
      }
      setTimeout(() => {
        addBotMessage(nextQ.question[lang] + (nextQ.subtitle ? `\n${nextQ.subtitle[lang]}` : ''));
      }, 400);
    } else {
      // Generate recommendation
      setTimeout(() => {
        const botMsg = lang === 'fr'
          ? 'Merci ! Je prépare votre recommandation personnalisée...'
          : 'Thanks! Let me prepare your personalized recommendation...';
        addBotMessage(botMsg);
        setTimeout(() => {
          const rec = generateRecommendation(updatedAnswers);
          setRecommendation(rec);
          pushDataLayer('guided_recommendation_shown', {
            recommended_domains: rec.selectedDomains.join(','),
            estimated_monthly: rec.estimatedMonthly,
            domains_count: rec.selectedDomains.length
          });
          scrollToBottom();
        }, 1000);
      }, 400);
    }
  }, [currentStep, answers, lang, addBotMessage, addUserMessage, scrollToBottom, pushDataLayer]);

  // Handle single selection
  const handleSingleSelect = useCallback((optionId: string, label: string) => {
    processAnswer(label, optionId);
  }, [processAnswer]);

  // Handle multi selection confirm
  const handleMultiConfirm = useCallback(() => {
    const q = guidedQuestions[currentStep];
    if (!q.options || multiSelections.length === 0) return;
    const labels = multiSelections.map(id => {
      const opt = q.options?.find(o => o.id === id);
      return opt ? opt.label[lang] : id;
    });
    processAnswer(labels.join(', '), multiSelections);
  }, [currentStep, multiSelections, lang, processAnswer]);

  // Handle slider confirm - uses non-linear budget scale
  const handleSliderConfirm = useCallback(() => {
    const actualBudget = budgetSteps[sliderIndex] ?? 2000;
    processAnswer(formatPrice(actualBudget, currency), actualBudget);
  }, [sliderIndex, budgetSteps, currency, processAnswer]);

  // Handle textarea confirm
  const handleTextConfirm = useCallback(() => {
    const value = textValue.trim();
    if (value) {
      processAnswer(value, value);
    } else {
      processAnswer(lang === 'fr' ? '(Passé)' : '(Skipped)', '');
    }
    setTextValue('');
  }, [textValue, lang, processAnswer]);

  // Toggle multi-selection
  const toggleMultiOption = useCallback((optionId: string, maxSelections: number) => {
    setMultiSelections(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      }
      // Special case: "nothing" clears other selections
      if (optionId === 'nothing') return ['nothing'];
      const filtered = prev.filter(id => id !== 'nothing');
      if (filtered.length >= maxSelections) return filtered;
      return [...filtered, optionId];
    });
  }, []);

  // Format reasoning for display
  const formatReasoning = useCallback((reasons: string[]): string[] => {
    return reasons.map(r => {
      if (r.startsWith('industry:')) {
        const parts = r.replace('industry:', '').split(':');
        const indParts = parts[0].split('|');
        const ind = lang === 'fr' ? indParts[1] : indParts[0];
        const domainParts = parts[1]?.split(',') || [];
        const domains = domainParts.map(dp => {
          const [en, fr] = dp.split('|');
          return lang === 'fr' ? fr : en;
        }).join(', ');
        return (t.guidedReasonIndustry || '')
          .replace('{industry}', ind)
          .replace('{domains}', domains);
      }
      if (r.startsWith('goals:')) {
        const goalTexts = r.replace('goals:', '').split(',').map(gp => {
          const [en, fr] = gp.split('|');
          return lang === 'fr' ? fr : en;
        }).join(', ');
        return (t.guidedReasonGoals || '').replace('{goals}', goalTexts);
      }
      if (r === 'tracking') {
        return t.guidedReasonTracking || '';
      }
      if (r === 'tracking:ads-no-tracking') {
        return t.guidedReasonTrackingAdsNoTracking || t.guidedReasonTracking || '';
      }
      if (r === 'tracking:foundation') {
        return t.guidedReasonTrackingFoundation || t.guidedReasonTracking || '';
      }
      if (r === 'channel-insight:google-ads') {
        return t.guidedInsightGoogleAds || '';
      }
      if (r === 'channel-insight:paid-social') {
        return t.guidedInsightPaidSocial || '';
      }
      if (r === 'channel-insight:seo') {
        return t.guidedInsightSeo || '';
      }
      if (r === 'channel-insight:emailing') {
        return t.guidedInsightEmailing || '';
      }
      if (r === 'budget:starter') {
        return t.guidedReasonBudgetStarter || '';
      }
      if (r === 'budget:premium') {
        return t.guidedReasonBudgetPremium || '';
      }
      return '';
    }).filter(Boolean);
  }, [lang, t]);

  // PDF download - generates a clean HTML document and triggers browser print-to-PDF
  const handleDownloadPDF = useCallback(() => {
    if (!recommendation) return;

    const recDomains = recommendation.selectedDomains.map(d => {
      const domain = domainConfigs[d];
      const actions = domainActions[d];
      const name = lang === 'fr' ? domain.nameFr : domain.name;
      const items = (lang === 'fr' ? actions.fr : actions.en)
        .map(a => `<li style="margin-bottom:4px;color:#475569;">${a}</li>`).join('');
      const benchmark = getBenchmarks(answers.industry, d);
      const benchmarkHtml = benchmark ? `
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;gap:16px;flex-wrap:wrap;">
          ${benchmark.metrics.map(m => `<span style="font-size:11px;color:#64748b;"><span style="color:#94a3b8;">${lang === 'fr' ? m.label.fr : m.label.en}:</span> ${m.value}</span>`).join('')}
        </div>` : '';
      return `
        <div style="margin-bottom:20px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <h3 style="margin:0 0 8px;font-size:15px;color:#1e293b;">${domain.icon} ${name}</h3>
          <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.6;">${items}</ul>
          ${benchmarkHtml}
        </div>`;
    }).join('');

    const reasons = formatReasoning(recommendation.reasoning)
      .map(r => `<li style="margin-bottom:6px;color:#475569;">${r}</li>`).join('');

    // Industry insights for PDF
    const insight = industryInsights[answers.industry];
    const insightHtml = insight ? `
      <div style="margin:24px 0;padding:16px;background:#ecfdf5;border-radius:12px;border:1px solid #a7f3d0;">
        <h3 style="margin:0 0 12px;font-size:14px;color:#065f46;">${lang === 'fr' ? insight.headline.fr : insight.headline.en}</h3>
        <div style="display:flex;gap:20px;justify-content:center;margin-bottom:8px;">
          ${insight.stats.map(s => `<div style="text-align:center;"><p style="margin:0;font-size:18px;font-weight:bold;color:#059669;">${s.value}</p><p style="margin:2px 0 0;font-size:11px;color:#6b7280;">${lang === 'fr' ? s.label.fr : s.label.en}</p></div>`).join('')}
        </div>
        <p style="margin:0;font-size:10px;color:#9ca3af;text-align:center;">${lang === 'fr' ? insight.source.fr : insight.source.en}</p>
      </div>` : '';

    // Evolution path for PDF
    const levelIndex = recommendation.selections[recommendation.selectedDomains[0]] ?? 0;
    const phases = buildEvolutionPath(recommendation.selectedDomains, levelIndex, answers.industry);
    const evolutionHtml = `
      <div style="margin:24px 0;">
        <h2 style="font-size:16px;color:#1e293b;margin-bottom:12px;">${lang === 'fr' ? 'Chemin de croissance' : 'Growth path'}</h2>
        ${phases.map((phase, i) => `
          <div style="display:flex;gap:12px;margin-bottom:12px;">
            <div style="width:24px;height:24px;border-radius:50%;background:${i === 0 ? '#3b82f6' : i === 1 ? '#93c5fd' : '#dbeafe'};color:${i < 2 ? 'white' : '#3b82f6'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;flex-shrink:0;">${i + 1}</div>
            <div>
              <p style="margin:0;font-size:13px;font-weight:600;color:#1e293b;">${lang === 'fr' ? phase.label.fr : phase.label.en} <span style="font-size:11px;color:#94a3b8;font-weight:normal;">${lang === 'fr' ? phase.timeline.fr : phase.timeline.en}</span></p>
              <p style="margin:2px 0 0;font-size:12px;color:#64748b;">${phase.domains.map(d => domainConfigs[d].icon).join(' ')} - ${lang === 'fr' ? phase.levelLabel.fr : phase.levelLabel.en}</p>
            </div>
          </div>`).join('')}
      </div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>MyDigipal - ${lang === 'fr' ? 'Recommandation Marketing' : 'Marketing Recommendation'}</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:700px;margin:0 auto;padding:40px 30px;color:#1e293b;}
        @media print{body{padding:20px;}}
      </style></head><body>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;">
        <div>
          <h1 style="margin:0;font-size:22px;color:#1e293b;">MyDigipal</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">${lang === 'fr' ? 'Recommandation marketing personnalisée' : 'Personalized marketing recommendation'}</p>
        </div>
      </div>
      <h2 style="font-size:18px;color:#1e293b;margin-bottom:16px;">${lang === 'fr' ? 'Services recommandés' : 'Recommended services'}</h2>
      ${recDomains}
      <div style="margin:24px 0;padding:16px;background:linear-gradient(135deg,#1e293b,#1e3a5f);border-radius:12px;color:white;">
        <p style="margin:0 0 4px;font-size:13px;opacity:0.8;">${t.guidedEstimate}</p>
        <p style="margin:0;font-size:28px;font-weight:bold;">${formatPrice(recommendation.estimatedMonthly, currency)}<span style="font-size:14px;opacity:0.7;"> /${lang === 'fr' ? 'mois' : 'mo'}</span></p>
        <p style="margin:4px 0 0;font-size:12px;opacity:0.6;">${recommendation.selectedDomains.length} ${t.guidedServicesIncluded}</p>
      </div>
      <h2 style="font-size:16px;color:#1e293b;margin-bottom:10px;">${lang === 'fr' ? 'Pourquoi cette combinaison' : 'Why this combination'}</h2>
      <ul style="padding-left:20px;font-size:13px;line-height:1.7;">${reasons}</ul>
      ${insightHtml}
      ${evolutionHtml}
      <div style="margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;">${lang === 'fr' ? 'Cette recommandation est un point de départ. Contactez-nous pour affiner votre stratégie.' : 'This recommendation is a starting point. Contact us to refine your strategy.'}</p>
        <p style="font-size:12px;color:#94a3b8;">mydigipal.com - paul@mydigipal.com</p>
      </div>
      </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  }, [recommendation, lang, currency, t, formatReasoning]);

  const currentQuestion = currentStep < guidedQuestions.length ? guidedQuestions[currentStep] : null;

  return (
    <div className="max-w-2xl mx-auto" ref={containerRef}>
      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {guidedQuestions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i < currentStep ? 'bg-blue-500' :
              i === currentStep && !recommendation ? 'bg-blue-400 animate-pulse' :
              recommendation ? 'bg-blue-500' :
              'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Chat area */}
      <div className="space-y-4 mb-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'items-start gap-3'} animate-fade-in`}
          >
            {msg.sender === 'bot' && <BotAvatar />}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-md shadow-sm'
            }`}>
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? `text-sm ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-500'} mt-1` : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isTyping && <TypingIndicator />}

        {/* Options area */}
        {showOptions && !recommendation && currentQuestion && (
          <div className="sm:ml-12 animate-fade-in">
            {/* Single choice */}
            {currentQuestion.type === 'single' && currentQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleSingleSelect(opt.id, `${opt.icon} ${opt.label[lang]}`)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-left text-sm font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-[0.97]"
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span>{opt.label[lang]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Multi choice */}
            {currentQuestion.type === 'multi' && currentQuestion.options && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {currentQuestion.options.map(opt => {
                    const isSelected = multiSelections.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleMultiOption(opt.id, currentQuestion.maxSelections || 3)}
                        className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl text-left text-sm font-medium transition-all active:scale-[0.97] ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="flex-1">{opt.label[lang]}</span>
                        {isSelected && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                {multiSelections.length > 0 && (
                  <button
                    onClick={handleMultiConfirm}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors active:scale-[0.98]"
                  >
                    {t.guidedContinue} ({multiSelections.length})
                  </button>
                )}
              </div>
            )}

            {/* Slider - non-linear budget scale */}
            {currentQuestion.type === 'slider' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    {formatPrice(budgetSteps[sliderIndex] ?? 2000, currency)}
                  </span>
                  <span className="text-slate-500 text-sm ml-1">{lang === 'fr' ? '/mois' : '/mo'}</span>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {getBudgetLabel(budgetSteps[sliderIndex] ?? 2000, lang)}
                  </p>
                </div>
                <input
                  type="range"
                  min={0}
                  max={budgetSteps.length - 1}
                  step={1}
                  value={sliderIndex}
                  onChange={(e) => setSliderIndex(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>{formatPrice(budgetSteps[0], currency)}</span>
                  <span>{formatPrice(budgetSteps[budgetSteps.length - 1], currency)}</span>
                </div>
                <button
                  onClick={handleSliderConfirm}
                  className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors active:scale-[0.98]"
                >
                  {t.guidedContinue}
                </button>
              </div>
            )}

            {/* Textarea */}
            {currentQuestion.type === 'textarea' && (
              <div>
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={lang === 'fr' ? 'Décrivez votre situation, vos défis...' : 'Describe your situation, challenges...'}
                  className="w-full h-24 px-4 py-3 border-2 border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleTextConfirm}
                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors active:scale-[0.98]"
                  >
                    {textValue.trim() ? t.guidedContinue : t.guidedSkipQuestion}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendation card */}
        {recommendation && (
          <div className="animate-fade-in mt-6" ref={recCardRef}>
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl overflow-hidden text-white shadow-xl">
              {/* Header */}
              <div className="p-4 sm:p-6 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-bold">{t.guidedMyRecommendation}</h3>
                </div>
                <p className="text-sm text-blue-300">{t.guidedBased}</p>
              </div>

              {/* Domain breakdown - what we'd do in each */}
              <div className="px-4 sm:px-6 space-y-3 mb-5">
                {recommendation.selectedDomains.map(d => {
                  const domain = domainConfigs[d];
                  const actions = domainActions[d];
                  const benchmark = getBenchmarks(answers.industry, d);
                  return (
                    <div key={d} className="bg-white/[0.07] rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-lg">{domain.icon}</span>
                        <h4 className="font-semibold text-sm">{lang === 'fr' ? domain.nameFr : domain.name}</h4>
                      </div>
                      <ul className="space-y-1">
                        {(lang === 'fr' ? actions.fr : actions.en).map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-blue-200">
                            <span className="text-blue-400 mt-0.5 flex-shrink-0">-</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Benchmarks per channel */}
                      {benchmark && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-1">
                          {benchmark.metrics.map((m, i) => (
                            <span key={i} className="text-[10px] text-blue-300/80">
                              <span className="text-blue-400/60">{lang === 'fr' ? m.label.fr : m.label.en}:</span> {m.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Why this combination */}
              <div className="px-4 sm:px-6 mb-5">
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                  {lang === 'fr' ? 'Pourquoi cette combinaison' : 'Why this combination'}
                </h4>
                <ul className="space-y-1.5 text-sm text-blue-100">
                  {formatReasoning(recommendation.reasoning).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">→</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Industry insights */}
              {(() => {
                const insight = industryInsights[answers.industry];
                if (!insight) return null;
                return (
                  <div className="mx-4 sm:mx-6 bg-emerald-500/15 backdrop-blur-sm rounded-xl p-4 mb-5 border border-emerald-400/30">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                      {lang === 'fr' ? insight.headline.fr : insight.headline.en}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                      {insight.stats.map((s, i) => (
                        <div key={i} className="text-center">
                          <p className="text-lg font-bold text-emerald-300">{s.value}</p>
                          <p className="text-[10px] text-emerald-200/70">{lang === 'fr' ? s.label.fr : s.label.en}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-emerald-300/50 text-center">
                      {t.guidedInsightsSource}: {lang === 'fr' ? insight.source.fr : insight.source.en}
                    </p>
                  </div>
                );
              })()}

              {/* Evolution path */}
              {(() => {
                const levelIndex = recommendation.selections[recommendation.selectedDomains[0]] ?? 0;
                const phases = buildEvolutionPath(recommendation.selectedDomains, levelIndex, answers.industry);
                return (
                  <div className="px-4 sm:px-6 mb-5">
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                      {t.guidedEvolutionTitle}
                    </h4>
                    <div className="relative">
                      {phases.map((phase, i) => (
                        <div key={i} className="flex gap-3 mb-3 last:mb-0">
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              i === 0 ? 'bg-blue-500 text-white' :
                              i === 1 ? 'bg-blue-400/60 text-white' :
                              'bg-blue-300/40 text-blue-200'
                            }`}>
                              {i + 1}
                            </div>
                            {i < phases.length - 1 && (
                              <div className="w-0.5 h-full min-h-[16px] bg-white/10 my-1" />
                            )}
                          </div>
                          {/* Phase content */}
                          <div className="flex-1 pb-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-white">
                                {lang === 'fr' ? phase.label.fr : phase.label.en}
                              </span>
                              <span className="text-[10px] text-blue-300/70 bg-white/5 px-1.5 py-0.5 rounded">
                                {lang === 'fr' ? phase.timeline.fr : phase.timeline.en}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {phase.domains.map(d => (
                                <span key={d} className="text-xs" title={lang === 'fr' ? domainConfigs[d].nameFr : domainConfigs[d].name}>
                                  {domainConfigs[d].icon}
                                </span>
                              ))}
                              <span className="text-[10px] text-blue-300/60 ml-1">
                                {lang === 'fr' ? phase.levelLabel.fr : phase.levelLabel.en}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Estimated monthly */}
              <div className="mx-4 sm:mx-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
                <p className="text-sm text-blue-300 mb-1">{t.guidedEstimate}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatPrice(recommendation.estimatedMonthly, currency)}
                  </span>
                  <span className="text-blue-300 text-sm">/{lang === 'fr' ? 'mois' : 'mo'}</span>
                </div>
                <p className="text-xs text-blue-300/70 mt-1">
                  {recommendation.selectedDomains.length} {t.guidedServicesIncluded}
                </p>
              </div>

              {/* CTAs */}
              <div className="px-4 sm:px-6 pb-6 flex flex-col gap-3">
                <button
                  onClick={() => {
                    pushDataLayer('guided_recommendation_accepted', {
                      recommended_domains: recommendation.selectedDomains.join(','),
                      estimated_monthly: recommendation.estimatedMonthly
                    });
                    onComplete(recommendation);
                  }}
                  className="w-full py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors active:scale-[0.98] text-center"
                >
                  {t.guidedCustomize}
                </button>
                <button
                  onClick={() => {
                    pushDataLayer('guided_pdf_download');
                    handleDownloadPDF();
                  }}
                  className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors active:scale-[0.98] border border-white/20 text-center flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {lang === 'fr' ? 'Télécharger en PDF' : 'Download as PDF'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
