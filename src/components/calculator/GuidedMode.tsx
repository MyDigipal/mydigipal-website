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

// High-level actions per domain - shown in recommendation card
const domainActions: Record<string, { en: string[]; fr: string[] }> = {
  'seo': {
    en: ['Technical SEO audit and optimization', 'Keyword strategy and content roadmap', 'On-page optimization and internal linking', 'Monthly performance reporting and adjustments'],
    fr: ['Audit SEO technique et optimisation', 'Stratégie de mots-clés et feuille de route contenu', 'Optimisation on-page et maillage interne', 'Reporting mensuel de performance et ajustements']
  },
  'google-ads': {
    en: ['Campaign structure and keyword research', 'Ad copywriting and A/B testing', 'Bid strategy optimization and budget management', 'Conversion tracking setup and ROAS reporting'],
    fr: ['Structure de campagnes et recherche de mots-clés', 'Rédaction d\'annonces et A/B testing', 'Optimisation des enchères et gestion du budget', 'Tracking des conversions et reporting ROAS']
  },
  'paid-social': {
    en: ['Audience targeting across Meta, LinkedIn, TikTok', 'Creative strategy and ad production', 'Remarketing and lookalike audiences', 'Campaign optimization and budget allocation'],
    fr: ['Ciblage d\'audiences sur Meta, LinkedIn, TikTok', 'Stratégie créative et production d\'annonces', 'Remarketing et audiences similaires', 'Optimisation des campagnes et allocation du budget']
  },
  'emailing': {
    en: ['Email automation sequences (welcome, nurture, upsell)', 'Newsletter design and content strategy', 'List segmentation and personalization', 'A/B testing and deliverability optimization'],
    fr: ['Séquences d\'emails automatisées (bienvenue, nurturing, upsell)', 'Design de newsletter et stratégie de contenu', 'Segmentation de liste et personnalisation', 'A/B testing et optimisation de la délivrabilité']
  },
  'ai-content': {
    en: ['AI-powered blog articles trained on your brand voice', 'Social media content calendar and production', 'Landing page copy and conversion optimization', 'Content performance analysis and iteration'],
    fr: ['Articles de blog IA formés sur votre voix de marque', 'Calendrier de contenu social et production', 'Copywriting de landing pages et optimisation de conversion', 'Analyse de performance du contenu et itération']
  },
  'ai-solutions': {
    en: ['Custom AI chatbot for lead qualification or support', 'Workflow automation (CRM, emails, reporting)', 'AI-powered data analysis and insights', 'Integration with your existing tools'],
    fr: ['Chatbot IA sur-mesure pour qualification ou support', 'Automatisation de workflows (CRM, emails, reporting)', 'Analyse de données et insights propulsés par l\'IA', 'Intégration avec vos outils existants']
  },
  'ai-training': {
    en: ['Hands-on AI workshops for your team', 'Prompt engineering and tool mastery', 'Custom use cases for your industry', 'Follow-up resources and support'],
    fr: ['Ateliers IA pratiques pour votre équipe', 'Maîtrise du prompt engineering et des outils', 'Cas d\'usage personnalisés pour votre secteur', 'Ressources de suivi et support']
  },
  'tracking-reporting': {
    en: ['Google Tag Manager and GA4 setup', 'Conversion pixels across all ad platforms', 'Cookie consent banner (GDPR compliant)', 'Centralized reporting dashboard'],
    fr: ['Configuration Google Tag Manager et GA4', 'Pixels de conversion sur toutes les plateformes', 'Bannière de consentement cookies (conforme RGPD)', 'Dashboard de reporting centralisé']
  }
};

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
      return `
        <div style="margin-bottom:20px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <h3 style="margin:0 0 8px;font-size:15px;color:#1e293b;">${domain.icon} ${name}</h3>
          <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.6;">${items}</ul>
        </div>`;
    }).join('');

    const reasons = formatReasoning(recommendation.reasoning)
      .map(r => `<li style="margin-bottom:6px;color:#475569;">${r}</li>`).join('');

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
              <div className="p-6 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-bold">{t.guidedMyRecommendation}</h3>
                </div>
                <p className="text-sm text-blue-300">{t.guidedBased}</p>
              </div>

              {/* Domain breakdown - what we'd do in each */}
              <div className="px-6 space-y-3 mb-5">
                {recommendation.selectedDomains.map(d => {
                  const domain = domainConfigs[d];
                  const actions = domainActions[d];
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
                    </div>
                  );
                })}
              </div>

              {/* Why this combination */}
              <div className="px-6 mb-5">
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

              {/* Estimated monthly */}
              <div className="mx-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-5 border border-white/10">
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
              <div className="px-6 pb-6 flex flex-col gap-3">
                <button
                  onClick={() => onComplete(recommendation)}
                  className="w-full py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors active:scale-[0.98] text-center"
                >
                  {t.guidedCustomize}
                </button>
                <button
                  onClick={handleDownloadPDF}
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
