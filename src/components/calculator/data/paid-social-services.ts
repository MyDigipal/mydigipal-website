import type { ServiceItem } from '../types';

export const paidSocialServices: ServiceItem[] = [
  {
    id: 'social-audit',
    title: 'A. Audit Social Ads',
    titleEn: 'A. Social Ads Audit',
    description: 'Analyse de vos campagnes Meta, LinkedIn ou TikTok existantes pour identifier les optimisations.',
    descriptionEn: 'Analysis of your existing Meta, LinkedIn or TikTok campaigns to identify optimizations.',
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
        nameEn: 'Basic',
        price: 300,
        features: ['Audit 1 plateforme', 'Analyse des performances', 'Recommandations générales'],
        featuresEn: ['1 platform audit', 'Performance analysis', 'General recommendations'],
        recommended: 'Une seule plateforme',
        recommendedEn: 'Single platform'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 500,
        features: ['Audit multi-plateformes', 'Analyse des audiences', 'Benchmark concurrentiel', 'Plan d\'action priorisé'],
        featuresEn: ['Multi-platform audit', 'Audience analysis', 'Competitive benchmark', 'Prioritized action plan'],
        recommended: 'Présence multi-canal',
        recommendedEn: 'Multi-channel presence',
        popular: true
      }
    ]
  },
  {
    id: 'social-setup',
    title: 'B. Setup de Campagnes',
    titleEn: 'B. Campaign Setup',
    description: 'Configuration complète de vos campagnes publicitaires sur les réseaux sociaux.',
    descriptionEn: 'Complete setup of your social media advertising campaigns.',
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
        nameEn: 'Essential',
        price: 400,
        features: ['1 plateforme', '2-3 campagnes', 'Audiences de base', 'Pixel configuré'],
        featuresEn: ['1 platform', '2-3 campaigns', 'Basic audiences', 'Pixel configured'],
        recommended: 'Démarrage sur les socials',
        recommendedEn: 'Getting started on social'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 700,
        features: ['2 plateformes', '4-6 campagnes', 'Audiences avancées', 'Retargeting'],
        featuresEn: ['2 platforms', '4-6 campaigns', 'Advanced audiences', 'Retargeting'],
        recommended: 'Stratégie complète',
        recommendedEn: 'Complete strategy',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1200,
        features: ['3+ plateformes', 'Campagnes illimitées', 'Audiences sur-mesure', 'Dynamic Ads', 'Tests A/B'],
        featuresEn: ['3+ platforms', 'Unlimited campaigns', 'Custom audiences', 'Dynamic Ads', 'A/B tests'],
        recommended: 'Présence maximale',
        recommendedEn: 'Maximum presence'
      }
    ]
  },
  {
    id: 'social-creatives',
    title: 'C. Création de Visuels',
    titleEn: 'C. Visual Creation',
    description: 'Production de visuels et vidéos publicitaires optimisés pour les réseaux sociaux.',
    descriptionEn: 'Production of visuals and ad videos optimized for social media.',
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
        nameEn: 'Essential',
        price: 300,
        features: ['5 visuels statiques', 'Formats adaptés', 'Révisions incluses'],
        featuresEn: ['5 static visuals', 'Adapted formats', 'Revisions included'],
        recommended: 'Besoins ponctuels',
        recommendedEn: 'Occasional needs'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 600,
        features: ['10 visuels + 2 vidéos', 'Déclinaisons formats', 'Direction artistique'],
        featuresEn: ['10 visuals + 2 videos', 'Format variations', 'Art direction'],
        recommended: 'Campagnes régulières',
        recommendedEn: 'Regular campaigns',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1200,
        features: ['20 visuels + 5 vidéos', 'UGC-style', 'Motion design', 'Refresh mensuel'],
        featuresEn: ['20 visuals + 5 videos', 'UGC-style', 'Motion design', 'Monthly refresh'],
        recommended: 'Volume important',
        recommendedEn: 'High volume'
      }
    ]
  }
];
