import type { ServiceItem } from '../types';

export const googleAdsServices: ServiceItem[] = [
  {
    id: 'ads-audit',
    title: 'A. Audit Google Ads',
    description: 'Analyse complète de vos campagnes existantes pour identifier les optimisations et opportunités.',
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
        price: 300,
        features: ['Analyse de la structure', 'Audit des mots-clés', 'Recommandations générales'],
        recommended: 'Comptes < 2000€/mois'
      },
      {
        name: 'Avancé',
        price: 500,
        features: ['Analyse complète', 'Étude concurrentielle', 'Audit des conversions', 'Plan d\'action priorisé'],
        recommended: 'Comptes > 2000€/mois',
        popular: true
      }
    ]
  },
  {
    id: 'ads-setup',
    title: 'B. Setup de Campagnes',
    description: 'Création et configuration de vos campagnes Google Ads avec une structure optimisée dès le départ.',
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
        price: 400,
        features: ['1-2 campagnes Search', 'Recherche mots-clés', '3 groupes d\'annonces', 'Suivi conversions basique'],
        recommended: 'Démarrage simple'
      },
      {
        name: 'Avancé',
        price: 700,
        features: ['3-5 campagnes Search', 'Recherche approfondie', 'Extensions complètes', 'Remarketing basique'],
        recommended: 'Stratégie complète',
        popular: true
      },
      {
        name: 'Premium',
        price: 1200,
        features: ['Campagnes Search + Display', 'YouTube Ads', 'Remarketing avancé', 'Audiences personnalisées', 'A/B testing'],
        recommended: 'Présence multi-canal'
      }
    ]
  },
  {
    id: 'ads-management',
    title: 'C. Gestion Mensuelle',
    description: 'Optimisation continue de vos campagnes pour maximiser votre ROI publicitaire.',
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
        price: 0,
        features: ['Optimisations hebdomadaires', 'Ajustement des enchères', 'Rapport mensuel'],
        recommended: 'Budgets < 3000€/mois',
        budgetBased: true
      },
      {
        name: 'Avancé',
        price: 200,
        features: ['Optimisations bi-hebdomadaires', 'Tests A/B continus', 'Rapport détaillé', '1 call/mois'],
        recommended: 'Budgets 3000-10000€/mois',
        popular: true,
        budgetBased: true
      },
      {
        name: 'Premium',
        price: 400,
        features: ['Optimisations continues', 'Stratégies avancées', 'Reporting personnalisé', '2 calls/mois', 'Support prioritaire'],
        recommended: 'Budgets > 10000€/mois',
        budgetBased: true
      }
    ]
  },
  {
    id: 'ads-reporting',
    title: 'D. Reporting & Analytics',
    description: 'Dashboards personnalisés et analyses approfondies pour piloter vos investissements.',
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
        price: 150,
        features: ['Dashboard Looker Studio', 'Métriques clés Google Ads', 'Mise à jour automatique'],
        recommended: 'Suivi basique'
      },
      {
        name: 'Avancé',
        price: 300,
        features: ['Dashboard multi-sources', 'Analytics + Ads intégrés', 'Segments personnalisés', 'Alertes email'],
        recommended: 'Vision complète',
        popular: true
      },
      {
        name: 'Premium',
        price: 500,
        features: ['Dashboard sur-mesure', 'Intégration CRM', 'Attribution avancée', 'Formation équipe', 'Modifications illimitées'],
        recommended: 'Data-driven'
      }
    ]
  }
];
