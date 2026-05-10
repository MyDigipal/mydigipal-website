import type { ServiceItem } from '../types';

// Refonte CRO mai 2026: Drop 'ads-audit' et 'ads-setup' (one-off complexes - trop de friction).
// Le service Google Ads se résume au pilotage continu + budget média. Mention simple "Frais
// de setup possibles selon contexte" est gérée au niveau de l'UI Calculator.
export const googleAdsServices: ServiceItem[] = [];
