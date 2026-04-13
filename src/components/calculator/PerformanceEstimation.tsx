/** @jsxImportSource react */
import { useState, useMemo } from 'react';
import { channelBenchmarks, estimateChannelMetrics, BASELINE_CONVERSION_RATE } from './data/channel-benchmarks';
import { channelDescriptions } from './data/channel-descriptions';
import { formatPrice } from './data';
import type { Currency } from './types';

interface PerformanceEstimationProps {
  lang?: 'en' | 'fr';
  currency: Currency;
  // Budgets par domaine (EUR)
  adBudgets: { 'google-ads': number; 'paid-social': number };
  // Pour la requête de rapport complet
  googleAdsActive: boolean;
  paidSocialActive: boolean;
  selectedSocialChannels: string[];
  // Callback quand l'utilisateur soumet le formulaire de rapport complet
  onRequestFullReport: (payload: { name: string; email: string; company: string }) => Promise<void>;
}

export default function PerformanceEstimation({
  lang = 'fr',
  currency,
  adBudgets,
  googleAdsActive,
  paidSocialActive,
  selectedSocialChannels,
  onRequestFullReport
}: PerformanceEstimationProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [conversionRate, setConversionRate] = useState(BASELINE_CONVERSION_RATE * 100);
  const [form, setForm] = useState({ name: '', email: '', company: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fp = (v: number) => formatPrice(v, currency);

  // Budget total réparti sur les canaux actifs
  const activeChannels = useMemo(() => {
    const chans: { id: string; budget: number; label: string; icon: string }[] = [];
    if (googleAdsActive && adBudgets['google-ads'] > 0) {
      chans.push({
        id: 'google-ads',
        budget: adBudgets['google-ads'],
        label: 'Google Search',
        icon: '🔍'
      });
    }
    if (paidSocialActive && adBudgets['paid-social'] > 0 && selectedSocialChannels.length > 0) {
      const perChannel = adBudgets['paid-social'] / selectedSocialChannels.length;
      selectedSocialChannels.forEach(chId => {
        const desc = channelDescriptions[chId];
        chans.push({
          id: chId,
          budget: perChannel,
          label: desc?.name || chId,
          icon: desc?.icon || '📱'
        });
      });
    }
    return chans;
  }, [googleAdsActive, paidSocialActive, adBudgets, selectedSocialChannels]);

  const hasActiveBudget = activeChannels.length > 0;

  // Aggregate metrics
  const aggregatedMetrics = useMemo(() => {
    if (!hasActiveBudget) return null;
    const multiplier = (conversionRate / 100) / BASELINE_CONVERSION_RATE;
    let totalImpressionsMin = 0, totalImpressionsMax = 0;
    let totalClicksMin = 0, totalClicksMax = 0;
    let totalActionsMin = 0, totalActionsMax = 0;
    let totalReachMin = 0, totalReachMax = 0;
    let totalBudget = 0;
    activeChannels.forEach(ch => {
      const est = estimateChannelMetrics(ch.id, ch.budget);
      if (!est) return;
      totalImpressionsMin += est.impressionsMin;
      totalImpressionsMax += est.impressionsMax;
      totalClicksMin += est.clicksMin;
      totalClicksMax += est.clicksMax;
      totalActionsMin += Math.round(est.actionsMin * multiplier);
      totalActionsMax += Math.round(est.actionsMax * multiplier);
      totalReachMin += est.reachMin;
      totalReachMax += est.reachMax;
      totalBudget += ch.budget;
    });
    // Dédoublonnage partiel du reach cross-channel (estimation : 25% d'overlap)
    const overlapFactor = activeChannels.length > 1 ? 0.75 : 1;
    const cpaMin = totalActionsMax > 0 ? Math.round((totalBudget / totalActionsMax) * 100) / 100 : 0;
    const cpaMax = totalActionsMin > 0 ? Math.round((totalBudget / totalActionsMin) * 100) / 100 : 0;
    return {
      totalImpressionsMin, totalImpressionsMax,
      totalClicksMin, totalClicksMax,
      totalActionsMin, totalActionsMax,
      totalReachMin: Math.round(totalReachMin * overlapFactor),
      totalReachMax: Math.round(totalReachMax * overlapFactor),
      totalBudget,
      cpaMin, cpaMax
    };
  }, [activeChannels, conversionRate, hasActiveBudget]);

  if (!hasActiveBudget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) return;
    setSubmitting(true);
    setError('');
    try {
      await onRequestFullReport(form);
      setUnlocked(true);
    } catch (err) {
      setError(lang === 'fr' ? 'Une erreur est survenue. Réessaie.' : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm">
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3 uppercase tracking-wide">
          {lang === 'fr' ? 'Simulation' : 'Simulation'}
        </span>
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 font-display">
          {lang === 'fr' ? 'Performances estimées' : 'Estimated performance'}
        </h3>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {lang === 'fr'
            ? "Ce qu'on peut attendre de ton budget sur chaque canal, basé sur les moyennes marché."
            : 'What to expect from your budget on each channel, based on market averages.'}
        </p>
      </div>

      {/* Niveau 1 : Benchmarks génériques par canal (toujours visible) */}
      <div className="mb-8">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
          {lang === 'fr' ? 'Benchmarks par canal (moyennes marché)' : 'Per-channel benchmarks (market averages)'}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeChannels.map(ch => {
            const bench = channelBenchmarks[ch.id];
            if (!bench) return null;
            return (
              <div key={ch.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{ch.icon}</span>
                  <div className="font-semibold text-slate-900 text-sm">{ch.label}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-slate-500">CPM</div>
                    <div className="font-bold text-slate-900">{fp(bench.cpmMin)}-{fp(bench.cpmMax)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">CPC</div>
                    <div className="font-bold text-slate-900">{fp(bench.cpcMin)}-{fp(bench.cpcMax)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">CTR</div>
                    <div className="font-bold text-slate-900">{bench.ctr}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">CPA cible</div>
                    <div className="font-bold text-slate-900">{fp(bench.cpaMin)}-{fp(bench.cpaMax)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Niveau 2 : Résultats personnalisés (floutés ou révélés) */}
      <div className="relative">
        <div className={`transition-all duration-500 ${!unlocked ? 'blur-md pointer-events-none select-none opacity-60' : ''}`}>
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">
                  {lang === 'fr' ? 'Projection sur ton budget' : 'Projection on your budget'}
                </div>
                <div className="text-slate-900 font-bold text-lg">
                  {fp(aggregatedMetrics?.totalBudget || 0)}{lang === 'fr' ? '/mois' : '/mo'}
                  <span className="text-sm text-slate-500 font-normal ml-2">
                    {lang === 'fr' ? `sur ${activeChannels.length} canaux` : `across ${activeChannels.length} channels`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">
                  {lang === 'fr' ? 'Taux de conversion :' : 'Conversion rate:'}
                </label>
                <input
                  type="range"
                  min="6"
                  max="20"
                  step="1"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-24 accent-blue-600"
                  disabled={!unlocked}
                />
                <span className="text-sm font-bold text-blue-700 w-10">{conversionRate}%</span>
              </div>
            </div>

            {aggregatedMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard
                  label={lang === 'fr' ? 'Impressions/mois' : 'Impressions/mo'}
                  min={aggregatedMetrics.totalImpressionsMin.toLocaleString()}
                  max={aggregatedMetrics.totalImpressionsMax.toLocaleString()}
                  icon="👁️"
                />
                <MetricCard
                  label={lang === 'fr' ? 'Reach unique' : 'Unique reach'}
                  min={aggregatedMetrics.totalReachMin.toLocaleString()}
                  max={aggregatedMetrics.totalReachMax.toLocaleString()}
                  icon="🎯"
                />
                <MetricCard
                  label={lang === 'fr' ? 'Clics/mois' : 'Clicks/mo'}
                  min={aggregatedMetrics.totalClicksMin.toLocaleString()}
                  max={aggregatedMetrics.totalClicksMax.toLocaleString()}
                  icon="👆"
                />
                <MetricCard
                  label={lang === 'fr' ? 'Actions/mois' : 'Actions/mo'}
                  min={aggregatedMetrics.totalActionsMin.toLocaleString()}
                  max={aggregatedMetrics.totalActionsMax.toLocaleString()}
                  icon="✅"
                  highlight
                />
              </div>
            )}

            {aggregatedMetrics && (
              <div className="mt-4 p-4 bg-white/70 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-xs text-slate-500 font-semibold">
                      {lang === 'fr' ? 'CPA effectif estimé (cost per action)' : 'Estimated CPA (cost per action)'}
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {fp(aggregatedMetrics.cpaMin)} - {fp(aggregatedMetrics.cpaMax)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 max-w-xs italic text-right">
                    {lang === 'fr'
                      ? "Le CPA diminue naturellement avec l'optimisation au fil des mois (~20% de gain typique)."
                      : 'CPA naturally decreases with optimization over months (~20% typical gain).'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay de gating email (si locked) */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-blue-200">
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">
                  {lang === 'fr' ? 'Rapport complet par email' : 'Full report by email'}
                </h4>
                <p className="text-sm text-slate-600">
                  {lang === 'fr'
                    ? "Reçois l'estimation détaillée appliquée à ton budget, canal par canal, avec les benchmarks CPA et reach unique."
                    : 'Get the detailed estimation applied to your budget, channel by channel, with CPA benchmarks and unique reach.'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder={lang === 'fr' ? 'Ton prénom' : 'Your first name'}
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                />
                <input
                  type="email"
                  placeholder={lang === 'fr' ? 'Email pro' : 'Work email'}
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  placeholder={lang === 'fr' ? 'Entreprise' : 'Company'}
                  value={form.company}
                  onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting
                    ? (lang === 'fr' ? 'Envoi...' : 'Sending...')
                    : (lang === 'fr' ? 'Recevoir mon rapport complet' : 'Get my full report')}
                </button>
                <p className="text-[11px] text-slate-500 text-center">
                  {lang === 'fr'
                    ? "Aucun spam. On t'envoie ton rapport puis un simple follow-up pour discuter si tu le souhaites."
                    : "No spam. We send your report then a simple follow-up if you want to discuss."}
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {unlocked && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-sm text-emerald-700 font-semibold">
            ✅ {lang === 'fr' ? 'Rapport complet envoyé à ton email.' : 'Full report sent to your email.'}
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, min, max, icon, highlight }: { label: string; min: string; max: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-white/80 border border-slate-200'}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${highlight ? 'text-white/80' : 'text-slate-500'}`}>
        {icon} {label}
      </div>
      <div className={`font-bold ${highlight ? 'text-white text-base' : 'text-slate-900 text-sm'}`}>
        {min}
      </div>
      <div className={`text-[10px] ${highlight ? 'text-white/70' : 'text-slate-400'}`}>
        {max}
      </div>
    </div>
  );
}
