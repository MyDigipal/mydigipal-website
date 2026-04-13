/** @jsxImportSource react */
import { useState, useEffect } from 'react';
import { channelDescriptions } from './data/channel-descriptions';
import { channelBenchmarks, estimateChannelMetrics } from './data/channel-benchmarks';
import type { SocialChannel } from './data/paid-social-services';
import type { Currency } from './types';
import { formatPrice } from './data';

interface ChannelCardProps {
  channel: SocialChannel;
  isSelected: boolean;
  isRecommended?: boolean;
  onToggle: () => void;
  lang?: 'en' | 'fr';
  currency: Currency;
  // Budget attribué à ce canal (pour l'estimation dans la modale)
  allocatedBudget?: number;
}

export default function ChannelCard({
  channel,
  isSelected,
  isRecommended,
  onToggle,
  lang = 'fr',
  currency,
  allocatedBudget
}: ChannelCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const description = channelDescriptions[channel.id];
  const benchmark = channelBenchmarks[channel.id];

  // ESC closes modal
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  // Fallback si le canal n'a pas de description / benchmark (safe)
  const hasRichData = !!description && !!benchmark;

  const fp = (v: number) => formatPrice(v, currency);

  return (
    <>
      <div className="relative group">
        <button
          type="button"
          onClick={onToggle}
          onMouseEnter={() => hasRichData && setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            isSelected
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-slate-200 bg-white hover:border-slate-300'
          } ${isRecommended && !isSelected ? 'ring-2 ring-offset-2 ring-amber-300' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-2xl flex-shrink-0">{channel.icon}</span>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">
                  {lang === 'fr' ? channel.nameFr : channel.name}
                </div>
                {hasRichData && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {lang === 'fr' ? description.audienceFr : description.audienceEn}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
                }`}
                aria-hidden="true"
              >
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          {hasRichData && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {lang === 'fr' ? description.strengthFr : description.strengthEn}
              </span>
              <span className="text-[10px] text-slate-500">
                CPC ~{fp(benchmark.cpcMid)}
              </span>
            </div>
          )}

          {isRecommended && (
            <div className="absolute -top-2 left-3 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {lang === 'fr' ? 'Recommandé' : 'Recommended'}
            </div>
          )}
        </button>

        {/* Learn more link */}
        {hasRichData && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowModal(true);
            }}
            className="absolute bottom-2 right-2 text-[10px] text-purple-600 hover:text-purple-800 underline font-medium z-10"
          >
            {lang === 'fr' ? 'En savoir +' : 'Learn more'}
          </button>
        )}

        {/* Hover popover (desktop only) */}
        {showPopover && hasRichData && (
          <div className="hidden md:block absolute z-40 top-full left-0 right-0 mt-2 p-4 bg-slate-900 text-white text-xs rounded-xl shadow-2xl pointer-events-none animate-[fadeIn_0.15s_ease-out]">
            <div className="mb-2">
              <span className="font-bold text-purple-300">
                {lang === 'fr' ? 'Force' : 'Strength'} :
              </span>{' '}
              <span>{lang === 'fr' ? description.strengthFr : description.strengthEn}</span>
            </div>
            <div className="mb-2 leading-relaxed text-slate-200">
              {lang === 'fr' ? description.advantageFr : description.advantageEn}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
              <div>
                <div className="text-slate-400 text-[10px]">CPM</div>
                <div className="font-bold">{fp(benchmark.cpmMin)}-{fp(benchmark.cpmMax)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">CPC</div>
                <div className="font-bold">{fp(benchmark.cpcMin)}-{fp(benchmark.cpcMax)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">CTR</div>
                <div className="font-bold">{benchmark.ctr}%</div>
              </div>
            </div>
            <div className="absolute -top-2 left-8 border-8 border-transparent border-b-slate-900" />
          </div>
        )}
      </div>

      {/* Modale détaillée */}
      {showModal && hasRichData && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-6 flex items-start justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{channel.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold">
                    {lang === 'fr' ? channel.nameFr : channel.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    {lang === 'fr' ? description.strengthFr : description.strengthEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white flex-shrink-0"
                aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Audience */}
              <div>
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">
                  {lang === 'fr' ? 'Audience type' : 'Audience type'}
                </div>
                <p className="text-slate-700">
                  {lang === 'fr' ? description.audienceFr : description.audienceEn}
                </p>
              </div>

              {/* Benchmarks */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                  {lang === 'fr' ? 'Benchmarks moyens' : 'Average benchmarks'}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">CPM</div>
                    <div className="font-bold text-slate-900 text-sm">{fp(benchmark.cpmMin)} - {fp(benchmark.cpmMax)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">CPC</div>
                    <div className="font-bold text-slate-900 text-sm">{fp(benchmark.cpcMin)} - {fp(benchmark.cpcMax)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">CTR</div>
                    <div className="font-bold text-slate-900 text-sm">{benchmark.ctr}%</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">CPA</div>
                    <div className="font-bold text-slate-900 text-sm">{fp(benchmark.cpaMin)} - {fp(benchmark.cpaMax)}</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3 italic">
                  {lang === 'fr'
                    ? "Moyennes du marché. Ta performance réelle dépend de ton secteur, audience et créatifs."
                    : 'Market averages. Actual performance depends on your sector, audience and creatives.'}
                </p>
              </div>

              {/* Advantage */}
              <div className="flex gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xl flex-shrink-0">✅</span>
                <div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                    {lang === 'fr' ? 'Ce qui rend ce canal unique' : 'What makes this channel unique'}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {lang === 'fr' ? description.advantageFr : description.advantageEn}
                  </p>
                </div>
              </div>

              {/* Caveat */}
              <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                    {lang === 'fr' ? "Point d'attention" : 'Attention point'}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {lang === 'fr' ? description.caveatFr : description.caveatEn}
                  </p>
                </div>
              </div>

              {/* Ideal Usage */}
              <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xl flex-shrink-0">🎯</span>
                <div>
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">
                    {lang === 'fr' ? 'Usage idéal' : 'Ideal usage'}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {lang === 'fr' ? description.idealUsageFr : description.idealUsageEn}
                  </p>
                </div>
              </div>

              {/* Ad Formats */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  {lang === 'fr' ? 'Formats publicitaires phares' : 'Key ad formats'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(lang === 'fr' ? description.adFormatsFr : description.adFormatsEn).map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Estimation si budget alloué */}
              {allocatedBudget && allocatedBudget > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
                  <div className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3">
                    {lang === 'fr' ? `Sur ${fp(allocatedBudget)}/mois alloués à ce canal` : `With ${fp(allocatedBudget)}/mo allocated to this channel`}
                  </div>
                  {(() => {
                    const est = estimateChannelMetrics(channel.id, allocatedBudget);
                    if (!est) return null;
                    return (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-[11px] text-slate-500">{lang === 'fr' ? 'Impressions/mois' : 'Impressions/mo'}</div>
                          <div className="font-bold text-slate-900">{est.impressionsMin.toLocaleString()} - {est.impressionsMax.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">{lang === 'fr' ? 'Clics/mois' : 'Clicks/mo'}</div>
                          <div className="font-bold text-slate-900">{est.clicksMin.toLocaleString()} - {est.clicksMax.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">{lang === 'fr' ? 'Actions/mois' : 'Actions/mo'}</div>
                          <div className="font-bold text-slate-900">{est.actionsMin} - {est.actionsMax}</div>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-[11px] text-purple-600 mt-3 italic">
                    {lang === 'fr'
                      ? '💡 Reçois les calculs personnalisés complets par email (section Performances estimées ci-dessous).'
                      : '💡 Get the full personalized calculations via email (Performance Estimation section below).'}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    onToggle();
                    setShowModal(false);
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                  }`}
                >
                  {isSelected
                    ? (lang === 'fr' ? 'Retirer ce canal' : 'Remove this channel')
                    : (lang === 'fr' ? 'Ajouter ce canal' : 'Add this channel')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  {lang === 'fr' ? 'Fermer' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
