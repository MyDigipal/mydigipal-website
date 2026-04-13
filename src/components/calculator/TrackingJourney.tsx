/** @jsxImportSource react */
import { useState } from 'react';
import { trackingSteps, type TrackingStep } from './data/tracking-steps';

interface TrackingJourneyProps {
  lang?: 'en' | 'fr';
}

const colorMap: Record<TrackingStep['color'], { bg: string; bgLight: string; text: string; border: string; gradient: string }> = {
  indigo: { bg: 'bg-indigo-500', bgLight: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
  blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
  cyan: { bg: 'bg-cyan-500', bgLight: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
  emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' }
};

export default function TrackingJourney({ lang = 'fr' }: TrackingJourneyProps) {
  const [activeStep, setActiveStep] = useState<string>(trackingSteps[0].id);
  const currentStep = trackingSteps.find(s => s.id === activeStep) || trackingSteps[0];
  const currentColors = colorMap[currentStep.color];

  return (
    <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm">
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
          {lang === 'fr' ? 'Tracking & Data' : 'Tracking & Data'}
        </span>
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 font-display">
          {lang === 'fr' ? 'Ton tracking en 4 étapes' : 'Your tracking in 4 steps'}
        </h3>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {lang === 'fr'
            ? "Rien n'est activé pour voir. Chaque pixel, chaque événement, chaque dashboard a une raison d'être."
            : 'Nothing is activated just to see. Every pixel, event and dashboard has a reason to be.'}
        </p>
      </div>

      {/* Step navigator (horizontal on desktop, clickable tabs) */}
      <div className="hidden md:grid md:grid-cols-4 gap-3 mb-8">
        {trackingSteps.map((step, idx) => {
          const isActive = step.id === activeStep;
          const colors = colorMap[step.color];
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`relative text-left p-4 rounded-xl transition-all ${
                isActive
                  ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg scale-105`
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-7 h-7 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white border border-slate-300 text-slate-700'} flex items-center justify-center text-xs font-bold`}>
                  {idx + 1}
                </span>
                <span className="text-xl">{step.icon}</span>
              </div>
              <div className="font-bold text-sm leading-tight">
                {lang === 'fr' ? step.nameFr : step.nameEn}
              </div>
              <div className={`text-xs mt-2 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                {step.type === 'one-off'
                  ? (lang === 'fr' ? 'Unique' : 'One-off')
                  : (lang === 'fr' ? 'Continu' : 'Ongoing')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile : step pills horizontaux */}
      <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2">
        {trackingSteps.map((step, idx) => {
          const isActive = step.id === activeStep;
          const colors = colorMap[step.color];
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? `bg-gradient-to-br ${colors.gradient} text-white shadow`
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <span className="mr-1">{idx + 1}.</span>
              {step.icon} {lang === 'fr' ? step.nameFr : step.nameEn}
            </button>
          );
        })}
      </div>

      {/* Active step detail */}
      <div className={`${currentColors.bgLight} ${currentColors.border} border rounded-xl p-6 md:p-8`}>
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-3xl">{currentStep.icon}</span>
            <h4 className={`text-2xl font-bold ${currentColors.text}`}>
              {lang === 'fr' ? currentStep.nameFr : currentStep.nameEn}
            </h4>
          </div>
          <p className="text-slate-700 text-base leading-relaxed">
            {lang === 'fr' ? currentStep.taglineFr : currentStep.taglineEn}
          </p>
        </div>

        <div className="mt-6">
          <p className={`text-xs font-bold ${currentColors.text} uppercase tracking-wide mb-3`}>
            {lang === 'fr' ? 'Livrables concrets' : 'Concrete deliverables'}
          </p>
          <ul className="grid md:grid-cols-2 gap-2">
            {(lang === 'fr' ? currentStep.deliverablesFr : currentStep.deliverablesEn).map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-white/60 p-3 rounded-lg">
                <span className={`flex-shrink-0 w-5 h-5 rounded-full ${currentColors.bg} text-white flex items-center justify-center mt-0.5`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {currentStep.optionsFr && currentStep.optionsEn && (
          <div className="mt-6 pt-6 border-t border-white/60">
            <p className={`text-xs font-bold ${currentColors.text} uppercase tracking-wide mb-3`}>
              {lang === 'fr' ? 'Deux options au choix' : 'Two options'}
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {(lang === 'fr' ? currentStep.optionsFr : currentStep.optionsEn).map((opt, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm mb-1">{opt.label}</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{opt.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
