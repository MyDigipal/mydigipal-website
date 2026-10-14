// AI Training pricing based on actual rates
// Prices are in EUR (converted from GBP)

export interface AITrainingConfig {
  id: string;
  name: string;
  nameFr: string;
  icon: string;
  description: string;
  descriptionFr: string;
  color: string;
  colorClass: string;
}

export const aiTrainingConfig: AITrainingConfig = {
  id: 'ai-training',
  name: 'AI Training',
  nameFr: 'Formation IA',
  icon: '🎓',
  description: 'In-person or remote AI training for your teams',
  descriptionFr: 'Formation IA pour vos équipes, en présentiel ou à distance',
  color: '#10b981',
  colorClass: 'emerald'
};

// Les prix viennent de LA grille des formations (`lib/formation/grille.ts`, 14/10/2026) : la page
// AI Training, son simulateur, ce calculateur et l'accueil lisent les mêmes chiffres. Ici, en
// euros et à distance ; le présentiel ajoute son écart par séance (`surcoutPresentiel`) et le
// déplacement. La remise « dès 5 séances » est celle de la grille (-15 %).
import { GRILLE } from '@/lib/formation/grille';
const REMISE_5 = GRILLE.remises.find((r) => r.des === 5)?.taux ?? 0;
const D = GRILLE.durees;
export const aiTrainingPricing = {
  single: {
    fullDay: { price: D.jour.distance.EUR, duration: '1 day', name: 'Full day', nameFr: 'Journée complète' },
    halfDay: { price: D['3h'].distance.EUR, duration: '3h', name: '3-hour session', nameFr: 'Séance de 3 h' },
  },
  bulk: {
    fullDay: { price: Math.round(D.jour.distance.EUR * (1 - REMISE_5)), duration: '1 day', name: 'Full day', nameFr: 'Journée complète' },
    halfDay: { price: Math.round(D['3h'].distance.EUR * (1 - REMISE_5)), duration: '3h', name: '3-hour session', nameFr: 'Séance de 3 h' },
  },
  /** L'écart du présentiel, par séance. */
  surcoutPresentiel: {
    halfDay: D['3h'].site.EUR - D['3h'].distance.EUR,
    fullDay: D.jour.site.EUR - D.jour.distance.EUR,
  },
  // Le déplacement depuis Londres : Paris par défaut (le cas le plus courant), le reste au devis.
  travelCost: {
    min: GRILLE.deplacement.zones.londres.EUR,
    max: GRILLE.deplacement.zones.europe.EUR,
    default: GRILLE.deplacement.zones.paris.EUR,
    description: 'Travel from London, depending on the destination and on a hotel night',
    descriptionFr: 'Déplacement depuis Londres, selon la destination et une nuit d’hôtel',
  },
};

// Half-day features
export const halfDayFeatures = {
  en: [
    'Pre-training needs assessment to analyse team AI maturity',
    'Understand key AI concepts & tools',
    'Master the CRAFT framework',
    'Advanced prompting tips & fail-safes',
    'Pre-session content review to ensure maximum relevance',
    'Personalisation of use cases based on your audience',
    'Learn essential prompting techniques',
    'Hands-on individual exercises to practice prompting',
    'Ethical & geopolitical aspects of AI',
    'Participant feedback collection to measure impact'
  ],
  fr: [
    'Évaluation pré-formation pour analyser la maturité IA de l\'équipe',
    'Comprendre les concepts et outils IA clés',
    'Maîtriser le framework CRAFT',
    'Astuces de prompting avancées & garde-fous',
    'Revue du contenu pré-session pour une pertinence maximale',
    'Personnalisation des cas d\'usage selon votre audience',
    'Apprendre les techniques essentielles de prompting',
    'Exercices pratiques individuels pour s\'entraîner',
    'Aspects éthiques & géopolitiques de l\'IA',
    'Collecte de feedback pour mesurer l\'impact'
  ]
};

// Full-day features (everything in half-day plus...)
export const fullDayAdditionalFeatures = {
  en: [
    'Further audit of your current AI use',
    'Identification of AI use case requirements',
    'In-depth exploration of advanced prompting strategies',
    'Group project: build internal AI workflows tailored to your business',
    'Practical automation exercises to scale productivity',
    'Collective review session to co-create your AI roadmap'
  ],
  fr: [
    'Audit approfondi de votre utilisation actuelle de l\'IA',
    'Identification des besoins en cas d\'usage IA',
    'Exploration approfondie des stratégies de prompting avancées',
    'Projet de groupe : créer des workflows IA internes adaptés à votre business',
    'Exercices pratiques d\'automatisation pour augmenter la productivité',
    'Session de revue collective pour co-créer votre roadmap IA'
  ]
};

// Helper function to calculate training price
export function calculateTrainingPrice(
  format: 'half-day' | 'full-day',
  sessions: '1' | '5+',
  inPerson: boolean,
  travelCost: number = aiTrainingPricing.travelCost.default
): number {
  const pricingTier = sessions === '1' ? aiTrainingPricing.single : aiTrainingPricing.bulk;
  const basePrice = format === 'full-day' ? pricingTier.fullDay.price : pricingTier.halfDay.price;

  // For bulk, multiply by 5 (minimum commitment)
  const multiplier = sessions === '5+' ? 5 : 1;
  const totalBase = basePrice * multiplier;

  // Add travel cost if in-person
  const travel = inPerson ? travelCost : 0;

  return totalBase + travel;
}
