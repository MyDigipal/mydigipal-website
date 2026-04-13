import type { ServiceItem } from '../types';

// REFONTE : Structure par canaux + Feed/Catalogue
// Avant : Audit + Setup + Visuels (même pour tous les canaux)
// Après : L'utilisateur sélectionne ses canaux (Meta, LinkedIn, TikTok)
//         + options transversales (visuels, feed/catalogue, audit)
// Le Calculator.tsx gère le flow "Je sais quels canaux" vs "Aidez-moi à choisir"

// Services one-off (audit, setup) - prix dynamique selon nb canaux sélectionnés au-dessus
export const paidSocialServices: ServiceItem[] = [
  {
    id: 'social-audit',
    title: 'A. Audit Campagnes Sociales',
    titleEn: 'A. Social Campaigns Audit',
    description: 'Diagnostic complet de vos campagnes existantes sur les canaux sélectionnés.',
    descriptionEn: 'Complete diagnostic of your existing campaigns on selected channels.',
    icon: '🔍',
    isOneOff: true,
    dynamicPricing: { pricePerChannel: 350, minChannels: 1 },
    detailedInfo: {
      title: "Audit Social Ads - C'est quoi exactement ?",
      content: {
        intro: 'Un diagnostic complet de vos campagnes publicitaires sur les canaux que vous avez sélectionnés ci-dessus.',
        sections: [
          {
            title: 'Ce que nous analysons par canal',
            items: [
              'Structure des campagnes et ensembles de publicités',
              "Qualité des audiences et ciblage",
              'Performance des créatives (CTR, engagement, ROAS)',
              "Paramètres d'enchères et optimisation",
              'Pixel/CAPI et tracking des conversions',
              'Fréquence et fatigue publicitaire',
              'Benchmark concurrentiel'
            ]
          }
        ],
        conclusion: "Livrable : Rapport d'audit avec recommandations par plateforme et plan d'action priorisé."
      }
    },
    levels: [
      {
        name: 'Audit complet',
        nameEn: 'Full audit',
        price: 350,
        priceNote: 'par canal sélectionné',
        priceNoteEn: 'per selected channel',
        features: [
          'Audit de chaque canal sélectionné',
          'Analyse des performances actuelles',
          'Benchmark concurrentiel',
          'Recommandations actionnables',
          "Plan d'action priorisé"
        ],
        featuresEn: [
          'Audit of each selected channel',
          'Current performance analysis',
          'Competitive benchmark',
          'Actionable recommendations',
          'Prioritized action plan'
        ],
        recommended: 'Si tu as déjà des campagnes en place',
        recommendedEn: 'If you already have running campaigns'
      }
    ]
  },
  {
    id: 'social-setup',
    title: 'B. Setup de Campagnes',
    titleEn: 'B. Campaign Setup',
    description: 'Création et configuration de vos campagnes sur les canaux sélectionnés, avec structure optimisée.',
    descriptionEn: 'Creation and configuration of your campaigns on selected channels, with optimized structure.',
    icon: '⚙️',
    isOneOff: true,
    dynamicPricing: { pricePerChannel: 450, minChannels: 1 },
    detailedInfo: {
      title: "Setup de Campagnes - C'est quoi exactement ?",
      content: {
        intro: 'Mise en place professionnelle de vos campagnes social ads avec une structure optimisée dès le départ, sur chacun des canaux sélectionnés.',
        sections: [
          {
            title: 'Ce que nous configurons par canal',
            items: [
              'Structure de compte et campagnes optimale',
              'Création des audiences (lookalike, retargeting, intérêts)',
              'Configuration pixel/CAPI + Consent Mode v2',
              "Paramétrage des objectifs et enchères",
              'Premières créatives (textes + visuels de lancement)',
              'Tests A/B structurés dès le départ'
            ]
          }
        ],
        conclusion: 'Livrable : Comptes configurés et campagnes prêtes à être activées sur tous les canaux choisis.'
      }
    },
    levels: [
      {
        name: 'Setup initial',
        nameEn: 'Initial setup',
        price: 450,
        priceNote: 'par canal sélectionné',
        priceNoteEn: 'per selected channel',
        features: [
          'Structure de compte et campagnes par canal',
          'Audiences (lookalike, retargeting, intérêts)',
          'Pixel/CAPI + Consent Mode v2',
          'Premières créatives de lancement',
          'Tests A/B structurés dès le départ'
        ],
        featuresEn: [
          'Account and campaign structure per channel',
          'Audiences (lookalike, retargeting, interests)',
          'Pixel/CAPI + Consent Mode v2',
          'Initial launch creatives',
          'Structured A/B tests from day one'
        ],
        recommended: 'Lancement initial des campagnes',
        recommendedEn: 'Initial campaign launch'
      }
    ]
  },
  {
    id: 'social-creatives',
    title: 'C. Création de Visuels',
    titleEn: 'C. Visual Creation',
    description: 'Production de visuels et vidéos publicitaires optimisés pour chaque plateforme sociale.',
    descriptionEn: 'Production of visuals and ad videos optimized for each social platform.',
    icon: '🎨',
    detailedInfo: {
      title: 'Création de Visuels - C\'est quoi exactement ?',
      content: {
        intro: 'Des créatives performantes sont essentielles - la créative représente 50-70% de la performance d\'une campagne.',
        sections: [
          {
            title: 'Ce que nous produisons',
            items: [
              'Visuels statiques (carrousels, singles, stories)',
              'Vidéos courtes (Reels, TikTok, Stories)',
              'Animations et motion design',
              'Déclinaisons par format et plateforme',
              'UGC-style content'
            ]
          },
          {
            title: 'Notre approche',
            items: [
              'Brief créatif aligné sur vos objectifs',
              'Adaptation aux best practices de chaque plateforme',
              'Tests créatifs continus (winner/challenger)',
              'Refresh régulier pour éviter la fatigue publicitaire'
            ]
          }
        ],
        conclusion: 'Des créatives qui convertissent, pas juste qui font joli.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 400,
        features: [
          '5 visuels statiques/mois',
          'Formats adaptés par plateforme',
          '1 round de révisions',
          'Livraison fichiers sources'
        ],
        featuresEn: [
          '5 static visuals/month',
          'Platform-adapted formats',
          '1 round of revisions',
          'Source files delivery'
        ],
        recommended: 'Besoins ponctuels',
        recommendedEn: 'Occasional needs'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 800,
        features: [
          '10 visuels + 2 vidéos/mois',
          'Direction artistique',
          'Déclinaisons multi-formats',
          'Tests créatifs A/B',
          '2 rounds de révisions'
        ],
        featuresEn: [
          '10 visuals + 2 videos/month',
          'Art direction',
          'Multi-format variations',
          'A/B creative tests',
          '2 rounds of revisions'
        ],
        recommended: 'Campagnes régulières',
        recommendedEn: 'Regular campaigns',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1500,
        features: [
          '20 visuels + 5 vidéos/mois',
          'UGC-style + motion design',
          'Direction artistique complète',
          'Refresh mensuel automatique',
          'Révisions illimitées'
        ],
        featuresEn: [
          '20 visuals + 5 videos/month',
          'UGC-style + motion design',
          'Complete art direction',
          'Automatic monthly refresh',
          'Unlimited revisions'
        ],
        recommended: 'Volume important, tests continus',
        recommendedEn: 'High volume, continuous testing'
      }
    ]
  },
  {
    id: 'social-feed-catalogue',
    title: 'D. Catalogue & Feed Management',
    titleEn: 'D. Catalogue & Feed Management',
    description: 'Création et gestion de catalogues produits pour Meta, Google Shopping et autres plateformes.',
    descriptionEn: 'Product catalogue creation and management for Meta, Google Shopping and other platforms.',
    icon: '📦',
    detailedInfo: {
      title: 'Catalogue & Feed Management - C\'est quoi exactement ?',
      content: {
        intro: 'Vos produits ou véhicules automatiquement synchronisés et optimisés sur toutes les plateformes publicitaires.',
        sections: [
          {
            title: 'Ce que nous configurons',
            items: [
              'Import et transformation du flux de données source',
              'Mapping des champs vers le format requis (Meta, Google)',
              'Synchronisation automatique quotidienne',
              'Optimisation des titres et descriptions pour la performance',
              'Gestion des images et médias',
              'Monitoring et alertes en cas d\'erreur'
            ]
          },
          {
            title: 'Plateformes supportées',
            items: [
              'Meta Catalogue (Facebook Dynamic Ads, Instagram Shopping)',
              'Google Merchant Center (Google Shopping, Performance Max)',
              'Leboncoin (flux automobile)',
              'TikTok Catalog',
              'Autres sur demande'
            ]
          }
        ],
        conclusion: 'Indispensable pour le e-commerce et les concessionnaires automobiles.'
      }
    },
    levels: [
      {
        name: '1 plateforme',
        nameEn: '1 platform',
        price: 500,
        isOneOff: true,
        features: [
          'Setup flux pour 1 plateforme',
          'Transformation et mapping des données',
          'Synchronisation quotidienne automatique',
          'Tests et validation',
          'Maintenance : +100€/mois'
        ],
        featuresEn: [
          'Feed setup for 1 platform',
          'Data transformation and mapping',
          'Daily automatic synchronization',
          'Testing and validation',
          'Maintenance: +€100/month'
        ],
        recommended: 'Un seul canal (Meta ou Google)',
        recommendedEn: 'Single channel (Meta or Google)'
      },
      {
        name: '2 plateformes',
        nameEn: '2 platforms',
        price: 800,
        isOneOff: true,
        features: [
          'Setup flux pour 2 plateformes',
          'Optimisation des titres/descriptions',
          'Synchronisation multi-canal',
          'Monitoring + alertes',
          'Maintenance : +150€/mois'
        ],
        featuresEn: [
          'Feed setup for 2 platforms',
          'Title/description optimization',
          'Multi-channel synchronization',
          'Monitoring + alerts',
          'Maintenance: +€150/month'
        ],
        recommended: 'Meta + Google Shopping',
        recommendedEn: 'Meta + Google Shopping',
        popular: true
      },
      {
        name: '3+ plateformes',
        nameEn: '3+ platforms',
        price: 1200,
        isOneOff: true,
        features: [
          'Setup flux pour 3+ plateformes',
          'Optimisation avancée par canal',
          'Règles de filtrage et segmentation',
          'Dashboard de monitoring',
          'Maintenance : +200€/mois',
          'Support prioritaire'
        ],
        featuresEn: [
          'Feed setup for 3+ platforms',
          'Advanced per-channel optimization',
          'Filtering rules and segmentation',
          'Monitoring dashboard',
          'Maintenance: +€200/month',
          'Priority support'
        ],
        recommended: 'E-commerce ou automobile multi-canal',
        recommendedEn: 'Multi-channel e-commerce or automotive'
      }
    ]
  }
];

// Social channels configuration for channel selection UI
export interface SocialChannel {
  id: string;
  name: string;
  nameFr: string;
  icon: string;
  description: string;
  descriptionFr: string;
  minBudget: number;
  recommendedBudget: number;
}

export const socialChannels: SocialChannel[] = [
  {
    id: 'meta',
    name: 'Meta (Facebook & Instagram)',
    nameFr: 'Meta (Facebook & Instagram)',
    icon: '📱',
    description: 'Dynamic Ads, Lead Gen, Retargeting, Shopping',
    descriptionFr: 'Dynamic Ads, Lead Gen, Retargeting, Shopping',
    minBudget: 500,
    recommendedBudget: 2000
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    nameFr: 'LinkedIn Ads',
    icon: '💼',
    description: 'B2B targeting, Sponsored Content, InMail, Lead Gen',
    descriptionFr: 'Ciblage B2B, Sponsored Content, InMail, Lead Gen',
    minBudget: 500,
    recommendedBudget: 2000
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    nameFr: 'TikTok Ads',
    icon: '🎵',
    description: 'In-Feed, TopView, Spark Ads, Shopping',
    descriptionFr: 'In-Feed, TopView, Spark Ads, Shopping',
    minBudget: 500,
    recommendedBudget: 1500
  },
  {
    id: 'google-display',
    name: 'Google Display & YouTube',
    nameFr: 'Google Display & YouTube',
    icon: '🎬',
    description: 'Display, YouTube, Discovery, Remarketing',
    descriptionFr: 'Display, YouTube, Discovery, Remarketing',
    minBudget: 500,
    recommendedBudget: 2000
  }
];
