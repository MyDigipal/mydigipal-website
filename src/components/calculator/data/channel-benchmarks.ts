// Benchmarks de performance par canal publicitaire
// Source : propale Control AI + moyennes marché MyDigipal
// Prix de référence en EUR (conversion GBP -> EUR avec taux 1.17)
// Utilisé par : PerformanceEstimation.tsx, ChannelCard.tsx, tooltips

export interface ChannelBenchmark {
  id: string;
  // CPM : coût pour 1000 impressions (en EUR)
  cpmMin: number;
  cpmMax: number;
  cpmMid: number;
  // CPC : coût par clic (en EUR)
  cpcMin: number;
  cpcMax: number;
  cpcMid: number;
  // CTR : taux de clic moyen en %
  ctr: number;
  // Multiplicateur de taux de conversion (vs baseline 12%)
  conversionMultiplier: number;
  // Multiplicateur de fréquence pour calculer le reach unique (impressions / freq)
  frequencyMultiplier: number;
  // Coût par action typique (en EUR)
  cpaMin: number;
  cpaMax: number;
}

export const channelBenchmarks: Record<string, ChannelBenchmark> = {
  meta: {
    id: 'meta',
    cpmMin: 4.1, cpmMax: 13.8, cpmMid: 7,
    cpcMin: 0.3, cpcMax: 0.47, cpcMid: 0.36,
    ctr: 1.2,
    conversionMultiplier: 1.3,
    frequencyMultiplier: 3.5,
    cpaMin: 1.8, cpaMax: 3
  },
  'google-ads': {
    id: 'google-ads',
    cpmMin: 17.6, cpmMax: 46.8, cpmMid: 29.3,
    cpcMin: 0.94, cpcMax: 4.1, cpcMid: 1.76,
    ctr: 5.74,
    conversionMultiplier: 2.5,
    frequencyMultiplier: 2,
    cpaMin: 3.5, cpaMax: 8.2
  },
  linkedin: {
    id: 'linkedin',
    cpmMin: 5.7, cpmMax: 44.5, cpmMid: 31.2,
    cpcMin: 2.1, cpcMax: 7.5, cpcMid: 5.2,
    ctr: 0.6,
    conversionMultiplier: 1.67,
    frequencyMultiplier: 3,
    cpaMin: 7, cpaMax: 14
  },
  tiktok: {
    id: 'tiktok',
    cpmMin: 0.9, cpmMax: 7.4, cpmMid: 2.7,
    cpcMin: 0.09, cpcMax: 0.53, cpcMid: 0.23,
    ctr: 2.5,
    conversionMultiplier: 0.6,
    frequencyMultiplier: 4,
    cpaMin: 0.6, cpaMax: 1.8
  },
  youtube: {
    id: 'youtube',
    cpmMin: 3.7, cpmMax: 14, cpmMid: 6.4,
    cpcMin: 0.23, cpcMax: 0.82, cpcMid: 0.47,
    ctr: 0.8,
    conversionMultiplier: 0.75,
    frequencyMultiplier: 4,
    cpaMin: 3.5, cpaMax: 7
  },
  reddit: {
    id: 'reddit',
    cpmMin: 2.3, cpmMax: 7, cpmMid: 4.1,
    cpcMin: 0.18, cpcMax: 0.82, cpcMid: 0.41,
    ctr: 0.5,
    conversionMultiplier: 1.2,
    frequencyMultiplier: 3,
    cpaMin: 1.8, cpaMax: 4.1
  },
  x: {
    id: 'x',
    cpmMin: 3.5, cpmMax: 14, cpmMid: 7.6,
    cpcMin: 0.23, cpcMax: 1.4, cpcMid: 0.58,
    ctr: 0.8,
    conversionMultiplier: 0.8,
    frequencyMultiplier: 3.5,
    cpaMin: 2.5, cpaMax: 6
  },
  display: {
    id: 'display',
    cpmMin: 1.2, cpmMax: 4.1, cpmMid: 2.6,
    cpcMin: 0.35, cpcMax: 1.05, cpcMid: 0.58,
    ctr: 0.4,
    conversionMultiplier: 1.4,
    frequencyMultiplier: 5,
    cpaMin: 2.3, cpaMax: 4.7
  },
  'google-display': {
    id: 'google-display',
    cpmMin: 1.2, cpmMax: 4.1, cpmMid: 2.6,
    cpcMin: 0.35, cpcMax: 1.05, cpcMid: 0.58,
    ctr: 0.4,
    conversionMultiplier: 1.4,
    frequencyMultiplier: 5,
    cpaMin: 2.3, cpaMax: 4.7
  }
};

// Baseline de taux de conversion (ajustable dans l'UI)
export const BASELINE_CONVERSION_RATE = 0.12; // 12%

// Gain d'efficacité quand le budget augmente (non-linéaire)
// Plus le budget est élevé, plus le CPA diminue (économies d'échelle)
export const BUDGET_EFFICIENCY_GAIN = 0.2; // ~20% d'amélioration sur gros budgets

// Helper : estimer les métriques mensuelles pour un budget donné sur un canal
export function estimateChannelMetrics(channelId: string, budgetEUR: number) {
  const benchmark = channelBenchmarks[channelId];
  if (!benchmark) return null;

  // Impressions = budget / CPM * 1000
  const impressionsMin = Math.round((budgetEUR / benchmark.cpmMax) * 1000);
  const impressionsMax = Math.round((budgetEUR / benchmark.cpmMin) * 1000);

  // Clics = impressions * CTR
  const clicksMin = Math.round(impressionsMin * (benchmark.ctr / 100));
  const clicksMax = Math.round(impressionsMax * (benchmark.ctr / 100));

  // Actions = clics * conversion rate (baseline * multiplier)
  const effectiveConversion = BASELINE_CONVERSION_RATE * benchmark.conversionMultiplier;
  const actionsMin = Math.round(clicksMin * effectiveConversion);
  const actionsMax = Math.round(clicksMax * effectiveConversion);

  // Reach unique = impressions / frequency
  const reachMin = Math.round(impressionsMin / benchmark.frequencyMultiplier);
  const reachMax = Math.round(impressionsMax / benchmark.frequencyMultiplier);

  // CPA effectif = budget / actions
  const cpaMin = actionsMax > 0 ? Math.round((budgetEUR / actionsMax) * 100) / 100 : 0;
  const cpaMax = actionsMin > 0 ? Math.round((budgetEUR / actionsMin) * 100) / 100 : 0;

  return {
    impressionsMin,
    impressionsMax,
    clicksMin,
    clicksMax,
    actionsMin,
    actionsMax,
    reachMin,
    reachMax,
    cpaMin,
    cpaMax
  };
}
