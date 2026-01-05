import type { ServiceItem } from '../types';

export const googleAdsServices: ServiceItem[] = [
  {
    id: 'ads-audit',
    title: 'A. Audit Google Ads',
    titleEn: 'A. Google Ads Audit',
    description: 'Analyse complète de vos campagnes existantes pour identifier les optimisations et opportunités.',
    descriptionEn: 'Complete analysis of your existing campaigns to identify optimizations and opportunities.',
    icon: '🔍',
    isOneOff: true,
    detailedInfo: {
      title: 'Audit Google Ads - C\'est quoi exactement ?',
      content: {
        intro: 'Un diagnostic complet de votre compte Google Ads pour identifier les fuites de budget et les opportunités manquées.',
        sections: [
          {
            title: 'Ce que nous analysons',
            items: [
              'Structure du compte (campagnes, groupes d\'annonces)',
              'Qualité des mots-clés et Quality Score',
              'Performance des annonces (CTR, taux de conversion)',
              'Paramètres d\'enchères et stratégies',
              'Extensions d\'annonces configurées',
              'Audiences et ciblage géographique',
              'Suivi des conversions et attribution'
            ]
          },
          {
            title: 'Version Avancée - En plus',
            items: [
              'Analyse concurrentielle via Auction Insights',
              'Étude des termes de recherche sur 6 mois',
              'Recommandations budgétaires optimales',
              'Roadmap d\'optimisation priorisée'
            ]
          }
        ],
        conclusion: 'Livrable : Rapport d\'audit avec quick wins et plan d\'action sur 3 mois.'
      }
    },
    levels: [
      {
        name: 'Basic',
        nameEn: 'Basic',
        price: 300,
        features: ['Analyse de la structure', 'Audit des mots-clés', 'Recommandations générales'],
        featuresEn: ['Structure analysis', 'Keyword audit', 'General recommendations'],
        recommended: 'Comptes < 2000€/mois',
        recommendedEn: 'Accounts < €2000/mo'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 500,
        features: ['Analyse complète', 'Étude concurrentielle', 'Audit des conversions', 'Plan d\'action priorisé'],
        featuresEn: ['Complete analysis', 'Competitive study', 'Conversion audit', 'Prioritized action plan'],
        recommended: 'Comptes > 2000€/mois',
        recommendedEn: 'Accounts > €2000/mo',
        popular: true
      }
    ]
  },
  {
    id: 'ads-setup',
    title: 'B. Setup de Campagnes',
    titleEn: 'B. Campaign Setup',
    description: 'Création et configuration de vos campagnes Google Ads avec une structure optimisée dès le départ.',
    descriptionEn: 'Creation and configuration of your Google Ads campaigns with an optimized structure from the start.',
    icon: '⚙️',
    isOneOff: true,
    detailedInfo: {
      title: 'Setup de Campagnes - C\'est quoi exactement ?',
      content: {
        intro: 'La création from scratch d\'un compte Google Ads bien structuré, ou la restructuration d\'un compte existant.',
        sections: [
          {
            title: 'Ce que nous configurons',
            items: [
              'Structure de compte optimale',
              'Recherche et sélection des mots-clés',
              'Rédaction des annonces (RSA, extensions)',
              'Configuration du ciblage',
              'Paramétrage des enchères et budgets',
              'Configuration du suivi des conversions'
            ]
          },
          {
            title: 'Version Premium - En plus',
            items: [
              'Setup campagnes Display/YouTube',
              'Configuration du remarketing',
              'Audiences personnalisées et similaires',
              'Tests A/B dès le lancement'
            ]
          }
        ],
        conclusion: 'Livrable : Compte prêt à être activé avec documentation complète.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 400,
        features: ['1-2 campagnes Search', 'Recherche mots-clés', '3 groupes d\'annonces', 'Suivi conversions basique'],
        featuresEn: ['1-2 Search campaigns', 'Keyword research', '3 ad groups', 'Basic conversion tracking'],
        recommended: 'Démarrage simple',
        recommendedEn: 'Simple start'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 700,
        features: ['3-5 campagnes Search', 'Recherche approfondie', 'Extensions complètes', 'Remarketing basique'],
        featuresEn: ['3-5 Search campaigns', 'In-depth research', 'Complete extensions', 'Basic remarketing'],
        recommended: 'Stratégie complète',
        recommendedEn: 'Complete strategy',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1200,
        features: ['Campagnes Search + Display', 'YouTube Ads', 'Remarketing avancé', 'Audiences personnalisées', 'A/B testing'],
        featuresEn: ['Search + Display campaigns', 'YouTube Ads', 'Advanced remarketing', 'Custom audiences', 'A/B testing'],
        recommended: 'Présence multi-canal',
        recommendedEn: 'Multi-channel presence'
      }
    ]
  }
];
