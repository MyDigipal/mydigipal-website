/** @jsxImportSource react */
import { useState } from 'react';
import { processPhases, teamMembers, type ProcessPhase } from './data/process-phases';

interface HowWeWorkProps {
  lang?: 'en' | 'fr';
}

const colorMap: Record<ProcessPhase['color'], { bg: string; bgLight: string; text: string; border: string; ring: string; gradient: string }> = {
  indigo: {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    ring: 'ring-indigo-400',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    ring: 'ring-blue-400',
    gradient: 'from-blue-500 to-blue-600'
  },
  cyan: {
    bg: 'bg-cyan-500',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    ring: 'ring-cyan-400',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-400',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  amber: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'ring-amber-400',
    gradient: 'from-amber-500 to-amber-600'
  }
};

const teamColorMap: Record<string, { bg: string; text: string }> = {
  indigo: { bg: 'bg-indigo-500', text: 'text-white' },
  blue: { bg: 'bg-blue-500', text: 'text-white' },
  cyan: { bg: 'bg-cyan-500', text: 'text-white' },
  emerald: { bg: 'bg-emerald-500', text: 'text-white' },
  amber: { bg: 'bg-amber-500', text: 'text-white' },
  violet: { bg: 'bg-violet-500', text: 'text-white' },
  pink: { bg: 'bg-pink-500', text: 'text-white' }
};

export default function HowWeWork({ lang = 'fr' }: HowWeWorkProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm">
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
          {lang === 'fr' ? 'Notre méthode' : 'Our method'}
        </span>
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 font-display">
          {lang === 'fr' ? 'Comment on travaille ensemble' : 'How we work together'}
        </h3>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {lang === 'fr'
            ? "Un process clair en 5 phases, de la découverte à l'optimisation continue. Pas de zones d'ombre, pas de surprises."
            : 'A clear 5-phase process, from discovery to ongoing optimization. No grey zones, no surprises.'}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector line (desktop + mobile) */}
        <div className="absolute left-6 md:left-8 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-300 via-cyan-300 to-amber-300" aria-hidden="true" />

        <div className="space-y-4">
          {processPhases.map((phase, idx) => {
            const isExpanded = expandedId === phase.id;
            const colors = colorMap[phase.color];
            return (
              <div key={phase.id} className="relative pl-16 md:pl-20">
                {/* Phase dot */}
                <div className={`absolute left-3 md:left-5 top-3 w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} shadow-lg ring-4 ring-white flex items-center justify-center text-white text-xs font-bold`}>
                  {idx + 1}
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : phase.id)}
                  className={`w-full text-left group transition-all ${isExpanded ? colors.bgLight + ' ' + colors.border + ' border-2' : 'bg-white border border-slate-200 hover:border-slate-300'} rounded-xl p-5`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="text-2xl">{phase.icon}</span>
                        <h4 className={`text-lg font-bold ${isExpanded ? colors.text : 'text-slate-900'}`}>
                          {lang === 'fr' ? phase.nameFr : phase.nameEn}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bgLight} ${colors.text} font-semibold`}>
                          {lang === 'fr' ? phase.durationFr : phase.durationEn}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.border} ${colors.text}`}>
                          {phase.type === 'one-off'
                            ? (lang === 'fr' ? 'Unique' : 'One-off')
                            : (lang === 'fr' ? 'Récurrent' : 'Recurring')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {lang === 'fr' ? phase.whyFr : phase.whyEn}
                      </p>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-200 space-y-4">
                      <div>
                        <p className={`text-xs font-bold ${colors.text} uppercase tracking-wide mb-2`}>
                          {lang === 'fr' ? 'Livrables de cette phase' : 'Phase deliverables'}
                        </p>
                        <ul className="space-y-2">
                          {(lang === 'fr' ? phase.deliverablesFr : phase.deliverablesEn).map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className={`flex-shrink-0 w-5 h-5 rounded-full ${colors.bg} text-white flex items-center justify-center mt-0.5`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {(phase.noteFr || phase.noteEn) && (
                        <div className={`p-3 rounded-lg ${colors.bgLight} border ${colors.border}`}>
                          <p className={`text-sm ${colors.text} italic`}>
                            💡 {lang === 'fr' ? phase.noteFr : phase.noteEn}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="text-center mb-6">
          <h4 className="text-xl font-bold text-slate-900 mb-2">
            {lang === 'fr' ? 'Votre équipe dédiée' : 'Your dedicated team'}
          </h4>
          <p className="text-sm text-slate-600">
            {lang === 'fr'
              ? 'Une équipe que tu connais par leurs prénoms, pas un ticket support.'
              : "A team you know by first names, not a support ticket."}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teamMembers.map(m => {
            const c = teamColorMap[m.color];
            return (
              <div key={m.id} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 hover:border-slate-300 transition-colors">
                <div className={`w-14 h-14 rounded-full ${c.bg} ${c.text} flex items-center justify-center text-lg font-bold mx-auto mb-3 shadow-md`}>
                  {m.initials}
                </div>
                <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                <div className="text-xs text-slate-500 mt-1">{lang === 'fr' ? m.roleFr : m.roleEn}</div>
                <div className="text-xs text-slate-600 mt-2 leading-tight">
                  {lang === 'fr' ? m.cadenceFr : m.cadenceEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
