import type { ServiceItem } from '../types';

export const paidSocialServices: ServiceItem[] = [
  {
    id: 'social-audit',
    title: 'A. Audit Social Ads',
    description: 'Analyse de vos campagnes Meta, LinkedIn ou TikTok existantes pour identifier les optimisations.',
    icon: '🔍',
    isOneOff: true,
    detailedInfo: {
      title: 'Audit Social Ads - C\'est quoi exactement ?',
      content: {
        intro: 'Un diagnostic complet de vos campagnes publicitaires sur les réseaux sociaux.',
        sections: [
          {
            title: 'Ce que nous analysons',
            items: [
              'Structure des campagnes et ensembles de publicités',
              'Qualité des audiences et ciblage',
              'Performance des créatives (CTR, engagement)',
              'Paramètres d\'enchères et optimisation',
              'Pixel et tracking des conversions',
              'Fréquence et fatigue publicitaire'
            ]
          },
          {
            title: 'Plateformes couvertes',
            items: [
              'Meta (Facebook & Instagram)',
              'LinkedIn Ads',
              'TikTok Ads',
              'Twitter/X Ads'
            ]
          }
        ],
        conclusion: 'Livrable : Rapport d\'audit avec recommandations par plateforme.'
      }
    },
    levels: [
      {
        name: 'Basic',
        price: 300,
        features: ['Audit 1 plateforme', 'Analyse des performances', 'Recommandations générales'],
        recommended: 'Une seule plateforme'
      },
      {
        name: 'Avancé',
        price: 500,
        features: ['Audit multi-plateformes', 'Analyse des audiences', 'Benchmark concurrentiel', 'Plan d\'action priorisé'],
        recommended: 'Présence multi-canal',
        popular: true
      }
    ]
  },
  {
    id: 'social-setup',
    title: 'B. Setup de Campagnes',
    description: 'Configuration complète de vos campagnes publicitaires sur les réseaux sociaux.',
    icon: '⚙️',
    isOneOff: true,
    detailedInfo: {
      title: 'Setup de Campagnes - C\'est quoi exactement ?',
      content: {
        intro: 'Mise en place professionnelle de vos campagnes social ads avec une structure optimisée.',
        sections: [
          {
            title: 'Ce que nous configurons',
            items: [
              'Structure de compte et campagnes',
              'Création des audiences (lookalike, retargeting)',
              'Configuration du pixel/tracking',
              'Paramétrage des objectifs de campagne',
              'Setup des catalogues produits (si e-commerce)'
            ]
          },
          {
            title: 'Version Premium - En plus',
            items: [
              'Setup multi-plateformes',
              'Audiences personnalisées avancées',
              'Tests A/B structurés',
              'Intégration CRM'
            ]
          }
        ],
        conclusion: 'Livrable : Comptes configurés et prêts à diffuser.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        price: 400,
        features: ['1 plateforme', '2-3 campagnes', 'Audiences de base', 'Pixel configuré'],
        recommended: 'Démarrage sur les socials'
      },
      {
        name: 'Avancé',
        price: 700,
        features: ['2 plateformes', '4-6 campagnes', 'Audiences avancées', 'Retargeting'],
        recommended: 'Stratégie complète',
        popular: true
      },
      {
        name: 'Premium',
        price: 1200,
        features: ['3+ plateformes', 'Campagnes illimitées', 'Audiences sur-mesure', 'Dynamic Ads', 'Tests A/B'],
        recommended: 'Présence maximale'
      }
    ]
  },
  {
    id: 'social-management',
    title: 'C. Gestion Mensuelle',
    description: 'Optimisation continue de vos campagnes pour maximiser votre retour sur investissement.',
    icon: '📈',
    hasBudgetFee: true,
    detailedInfo: {
      title: 'Gestion Mensuelle - C\'est quoi exactement ?',
      content: {
        intro: 'Un accompagnement mensuel pour optimiser vos campagnes sociales et maximiser le ROI.',
        sections: [
          {
            title: 'Ce que nous faisons chaque mois',
            items: [
              'Optimisation des enchères et budgets',
              'Refresh des créatives',
              'Gestion des audiences (exclusions, lookalikes)',
              'Tests A/B continus',
              'Analyse des performances par placement',
              'Veille sur les nouvelles fonctionnalités'
            ]
          },
          {
            title: 'Reporting inclus',
            items: [
              'Dashboard temps réel',
              'Rapport mensuel par plateforme',
              'Analyse des tendances',
              'Recommandations créatives'
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
        features: ['Optimisations hebdomadaires', 'Gestion des budgets', 'Rapport mensuel'],
        recommended: 'Budgets < 3000€/mois',
        budgetBased: true
      },
      {
        name: 'Avancé',
        price: 200,
        features: ['Optimisations bi-hebdomadaires', 'Tests créatives', 'Rapport détaillé', '1 call/mois'],
        recommended: 'Budgets 3000-10000€/mois',
        popular: true,
        budgetBased: true
      },
      {
        name: 'Premium',
        price: 400,
        features: ['Optimisations continues', 'Stratégie créative', 'Reporting personnalisé', '2 calls/mois', 'Support prioritaire'],
        recommended: 'Budgets > 10000€/mois',
        budgetBased: true
      }
    ]
  },
  {
    id: 'social-creatives',
    title: 'D. Création de Visuels',
    description: 'Production de visuels et vidéos publicitaires optimisés pour les réseaux sociaux.',
    icon: '🎨',
    detailedInfo: {
      title: 'Création de Visuels - C\'est quoi exactement ?',
      content: {
        intro: 'Des créatives performantes sont essentielles pour vos campagnes social ads.',
        sections: [
          {
            title: 'Ce que nous produisons',
            items: [
              'Visuels statiques (carrousels, singles)',
              'Vidéos courtes (Reels, Stories)',
              'Animations simples',
              'Déclinaisons par format/plateforme'
            ]
          },
          {
            title: 'Version Premium - En plus',
            items: [
              'UGC-style videos',
              'Motion design avancé',
              'Direction artistique complète',
              'Shooting photo/vidéo'
            ]
          }
        ],
        conclusion: 'Nous adaptons les formats aux meilleures pratiques de chaque plateforme.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        price: 300,
        features: ['5 visuels statiques', 'Formats adaptés', 'Révisions incluses'],
        recommended: 'Besoins ponctuels'
      },
      {
        name: 'Avancé',
        price: 600,
        features: ['10 visuels + 2 vidéos', 'Déclinaisons formats', 'Direction artistique'],
        recommended: 'Campagnes régulières',
        popular: true
      },
      {
        name: 'Premium',
        price: 1200,
        features: ['20 visuels + 5 vidéos', 'UGC-style', 'Motion design', 'Refresh mensuel'],
        recommended: 'Volume important'
      }
    ]
  }
];
