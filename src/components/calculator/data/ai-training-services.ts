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

// Pricing structure
export const aiTrainingPricing = {
  // Single session pricing
  single: {
    fullDay: {
      price: 2800, // £2400 converted
      duration: '6.5h',
      name: 'Full Day',
      nameFr: 'Journée complète'
    },
    halfDay: {
      price: 1500, // £1300 converted
      duration: '3h',
      name: 'Half Day',
      nameFr: 'Demi-journée'
    }
  },
  // 5+ sessions pricing (bulk discount)
  bulk: {
    fullDay: {
      price: 2200, // £1900 converted
      duration: '6.5h',
      name: 'Full Day',
      nameFr: 'Journée complète'
    },
    halfDay: {
      price: 1150, // £1000 converted
      duration: '3h',
      name: 'Half Day',
      nameFr: 'Demi-journée'
    }
  },
  // In-person travel cost estimate
  travelCost: {
    default: 300, // Default travel estimate
    description: 'Estimated travel cost (adjusted based on location)',
    descriptionFr: 'Frais de déplacement estimés (ajustés selon la localisation)'
  }
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
