/** @jsxImportSource react */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { ServiceDomain, GuidedAnswers, GuidedRecommendation } from './types';
import { guidedQuestions, generateRecommendation, getBudgetLabel } from './guided-data';
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

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
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

    setTimeout(() => {
      addBotMessage(q.question[lang] + (q.subtitle ? `\n${q.subtitle[lang]}` : ''));
    }, 800);
  }, [lang, addBotMessage]);

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

    const nextStep = currentStep + 1;
    if (nextStep < guidedQuestions.length) {
      setCurrentStep(nextStep);
      const nextQ = guidedQuestions[nextStep];
      if (nextQ.type === 'slider') {
        setSliderValue(nextQ.sliderConfig?.min ? Math.round((nextQ.sliderConfig.max + nextQ.sliderConfig.min) / 2 / nextQ.sliderConfig.step) * nextQ.sliderConfig.step : 2000);
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
          scrollToBottom();
        }, 1000);
      }, 400);
    }
  }, [currentStep, answers, lang, addBotMessage, addUserMessage, scrollToBottom]);

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

  // Handle slider confirm
  const handleSliderConfirm = useCallback(() => {
    processAnswer(formatPrice(sliderValue, currency), sliderValue);
  }, [sliderValue, currency, processAnswer]);

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
          <div className="ml-12 animate-fade-in">
            {/* Single choice */}
            {currentQuestion.type === 'single' && currentQuestion.options && (
              <div className="grid grid-cols-2 gap-2">
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
                <div className="grid grid-cols-2 gap-2 mb-3">
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

            {/* Slider */}
            {currentQuestion.type === 'slider' && currentQuestion.sliderConfig && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    {formatPrice(sliderValue, currency)}
                  </span>
                  <span className="text-slate-500 text-sm ml-1">{lang === 'fr' ? '/mois' : '/mo'}</span>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {getBudgetLabel(sliderValue, lang)}
                  </p>
                </div>
                <input
                  type="range"
                  min={currentQuestion.sliderConfig.min}
                  max={currentQuestion.sliderConfig.max}
                  step={currentQuestion.sliderConfig.step}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>{formatPrice(currentQuestion.sliderConfig.min, currency)}</span>
                  <span>{formatPrice(currentQuestion.sliderConfig.max, currency)}</span>
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
          <div className="animate-fade-in mt-6">
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-bold">{t.guidedMyRecommendation}</h3>
              </div>

              <p className="text-sm text-blue-200 mb-4">{t.guidedBased}</p>

              {/* Domain pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {recommendation.selectedDomains.map(d => {
                  const domain = domainConfigs[d];
                  return (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20"
                    >
                      <span>{domain.icon}</span>
                      <span>{lang === 'fr' ? domain.nameFr : domain.name}</span>
                    </span>
                  );
                })}
              </div>

              {/* Reasoning */}
              <ul className="space-y-2 mb-5 text-sm text-blue-100">
                {formatReasoning(recommendation.reasoning).map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">→</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              {/* Estimated monthly */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
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
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onComplete(recommendation)}
                  className="flex-1 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors active:scale-[0.98] text-center"
                >
                  {t.guidedCustomize}
                </button>
                <button
                  onClick={onSkip}
                  className="flex-1 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors active:scale-[0.98] border border-white/20 text-center"
                >
                  {t.guidedChooseMyself}
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
