/**
 * Tracking du funnel calculateur (dataLayer -> GTM -> GA4).
 *
 * Pourquoi ce fichier : avant, le seul event emis etait `calculator_form_submit`,
 * a la toute fin. On savait combien de gens finissaient, jamais ou les autres
 * decrochaient. Ici on instrumente chaque palier du funnel, y compris le detail
 * des services ET des niveaux (microservices) selectionnes.
 *
 * Convention de nommage : `calculator_<objet>_<action>`, snake_case, pour que les
 * events se regroupent naturellement dans les rapports GA4.
 */

type Payload = Record<string, string | number | boolean | null | undefined>;

/** Etapes du funnel, dans l'ordre. L'index sert a calculer la profondeur atteinte. */
export const FUNNEL_STEPS = [
  'landed',        // arrivee sur la page
  'domains',       // conserve pour l'historique : ecran de selection separe, supprime en aout 2026
  'guided',        // mode conversationnel
  'configure',     // ecran unique selection + configuration
  'lead_form',     // ouverture de la modale de capture
  'submitted'      // formulaire envoye
] as const;

export type FunnelStep = typeof FUNNEL_STEPS[number];

/** Profondeur maximale atteinte pendant la session (pour l'event d'abandon). */
let maxDepth = 0;
let lastStep: FunnelStep = 'landed';

function push(event: string, payload: Payload = {}): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: unknown[] };
  // On cree le dataLayer s'il n'existe pas encore : sans ca, un event emis avant
  // le chargement de GTM etait purement et simplement perdu.
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...payload });
}

/** Event generique du calculateur. */
export function track(event: string, payload: Payload = {}): void {
  push(event, payload);
}

/**
 * Marque le passage a une etape du funnel. Idempotent par etape : on ne re-emet
 * pas si l'utilisateur revient en arriere, sinon les taux de passage sont fausses.
 */
const seenSteps = new Set<FunnelStep>();
export function trackStep(step: FunnelStep, payload: Payload = {}): void {
  const depth = FUNNEL_STEPS.indexOf(step);
  if (depth > maxDepth) maxDepth = depth;
  lastStep = step;
  if (seenSteps.has(step)) return;
  seenSteps.add(step);
  push('calculator_step', { calculator_step: step, calculator_step_index: depth, ...payload });
}

/** Selection / deselection d'un domaine (SEO, Google Ads, ...). */
export function trackDomain(domainId: string, selected: boolean, totalSelected: number): void {
  push('calculator_domain_toggle', {
    calculator_domain: domainId,
    calculator_action: selected ? 'select' : 'deselect',
    calculator_domains_count: totalSelected
  });
}

/**
 * Selection / deselection d'un service et de son niveau (le "microservice" :
 * Essentiel / Avance / Premium). C'est la granularite qui manquait pour savoir
 * quelles offres attirent et lesquelles font fuir.
 */
export function trackService(params: {
  domainId: string;
  serviceId: string;
  levelName: string;
  levelIndex: number;
  price: number;
  selected: boolean;
}): void {
  push('calculator_service_toggle', {
    calculator_domain: params.domainId,
    calculator_service: params.serviceId,
    calculator_level: params.levelName,
    calculator_level_index: params.levelIndex,
    calculator_service_price: params.price,
    calculator_action: params.selected ? 'select' : 'deselect'
  });
}

/** Selection d'un canal social (Meta, LinkedIn, TikTok, Google Display). */
export function trackChannel(channelId: string, selected: boolean, totalSelected: number): void {
  push('calculator_channel_toggle', {
    calculator_channel: channelId,
    calculator_action: selected ? 'select' : 'deselect',
    calculator_channels_count: totalSelected
  });
}

/** Deplacement d'un slider de budget media (une fois pose, pas a chaque pixel). */
export function trackBudget(domainId: string, value: number, currency: string): void {
  push('calculator_budget_set', {
    calculator_domain: domainId,
    calculator_budget: value,
    currency
  });
}

/**
 * Abandon : emis au moment ou l'onglet passe en arriere-plan ou se ferme, avec
 * l'etape la plus profonde atteinte. C'est cet event qui permet de construire le
 * taux de sortie par etape sans dependre du sequencage des page_view.
 */
export function trackAbandon(context: Payload = {}): void {
  push('calculator_abandon', {
    calculator_last_step: lastStep,
    calculator_max_step: FUNNEL_STEPS[maxDepth],
    calculator_max_step_index: maxDepth,
    ...context
  });
}

/** Reinitialise l'etat (utile seulement pour les tests). */
export function resetTracking(): void {
  maxDepth = 0;
  lastStep = 'landed';
  seenSteps.clear();
}
