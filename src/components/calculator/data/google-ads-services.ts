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
  },
  {
    id: 'ads-management',
    title: 'C. Gestion Mensuelle',
    titleEn: 'C. Monthly Management',
    description: 'Optimisation continue de vos campagnes pour maximiser votre ROI publicitaire.',
    descriptionEn: 'Continuous optimization of your campaigns to maximize your advertising ROI.',
    icon: '📈',
    hasBudgetFee: true,
    detailedInfo: {
      title: 'Gestion Mensuelle - C\'est quoi exactement ?',
      content: {
        intro: 'Un accompagnement mensuel pour optimiser vos campagnes et maximiser chaque euro investi.',
        sections: [
          {
            title: 'Ce que nous faisons chaque mois',
            items: [
              'Ajustement des enchères selon les performances',
              'Ajout/exclusion de mots-clés',
              'Tests et optimisation des annonces',
              'Gestion des audiences et remarketing',
              'Optimisation du budget entre campagnes',
              'Veille concurrentielle'
            ]
          },
          {
            title: 'Reporting inclus',
            items: [
              'Dashboard temps réel',
              'Rapport mensuel commenté',
              'Analyse des tendances',
              'Recommandations d\'évolution'
            ]
          }
        ],
        conclusion: 'Note : Frais de gestion = 15% de votre budget publicitaire (minimum 300€/mois).'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 0,
        features: ['Optimisations hebdomadaires', 'Ajustement des enchères', 'Rapport mensuel'],
        featuresEn: ['Weekly optimizations', 'Bid adjustments', 'Monthly report'],
        recommended: 'Budgets < 3000€/mois',
        recommendedEn: 'Budgets < €3000/mo',
        budgetBased: true
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 200,
        features: ['Optimisations bi-hebdomadaires', 'Tests A/B continus', 'Rapport détaillé', '1 call/mois'],
        featuresEn: ['Bi-weekly optimizations', 'Continuous A/B tests', 'Detailed report', '1 call/month'],
        recommended: 'Budgets 3000-10000€/mois',
        recommendedEn: 'Budgets €3000-10000/mo',
        popular: true,
        budgetBased: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 400,
        features: ['Optimisations continues', 'Stratégies avancées', 'Reporting personnalisé', '2 calls/mois', 'Support prioritaire'],
        featuresEn: ['Continuous optimizations', 'Advanced strategies', 'Custom reporting', '2 calls/month', 'Priority support'],
        recommended: 'Budgets > 10000€/mois',
        recommendedEn: 'Budgets > €10000/mo',
        budgetBased: true
      }
    ]
  },
  {
    id: 'ads-reporting',
    title: 'D. Reporting & Analytics',
    titleEn: 'D. Reporting & Analytics',
    description: 'Dashboards personnalisés et analyses approfondies pour piloter vos investissements.',
    descriptionEn: 'Custom dashboards and in-depth analytics to drive your investments.',
    icon: '📊',
    detailedInfo: {
      title: 'Reporting & Analytics - C\'est quoi exactement ?',
      content: {
        intro: 'Des outils de reporting sur-mesure pour suivre vos KPIs et prendre des décisions éclairées.',
        sections: [
          {
            title: 'Ce que nous mettons en place',
            items: [
              'Dashboard Looker Studio personnalisé',
              'Intégration Google Ads, Analytics, CRM',
              'Visualisations claires et actionnables',
              'Alertes automatiques sur les anomalies'
            ]
          },
          {
            title: 'Analyses incluses',
            items: [
              'Attribution multi-touch',
              'Analyse du parcours client',
              'Segmentation des audiences',
              'Comparaisons période vs période'
            ]
          }
        ],
        conclusion: 'Prenez des décisions basées sur la data, pas sur l\'intuition.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 150,
        features: ['Dashboard Looker Studio', 'Métriques clés Google Ads', 'Mise à jour automatique'],
        featuresEn: ['Looker Studio dashboard', 'Key Google Ads metrics', 'Auto-update'],
        recommended: 'Suivi basique',
        recommendedEn: 'Basic tracking'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 300,
        features: ['Dashboard multi-sources', 'Analytics + Ads intégrés', 'Segments personnalisés', 'Alertes email'],
        featuresEn: ['Multi-source dashboard', 'Analytics + Ads integrated', 'Custom segments', 'Email alerts'],
        recommended: 'Vision complète',
        recommendedEn: 'Complete overview',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 500,
        features: ['Dashboard sur-mesure', 'Intégration CRM', 'Attribution avancée', 'Formation équipe', 'Modifications illimitées'],
        featuresEn: ['Custom dashboard', 'CRM integration', 'Advanced attribution', 'Team training', 'Unlimited modifications'],
        recommended: 'Data-driven',
        recommendedEn: 'Data-driven'
      }
    ]
  }
];
