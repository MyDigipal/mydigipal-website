import type { ServiceItem } from '../types';

export const seoServices: ServiceItem[] = [
  {
    id: 'seo-audit',
    title: 'A. Audit SEO',
    description: 'Analyse complète de votre site, votre marché et vos concurrents pour identifier les opportunités.',
    icon: '🔍',
    isOneOff: true,
    detailedInfo: {
      title: 'Audit SEO - C\'est quoi exactement ?',
      content: {
        intro: 'Notre audit SEO comprend une analyse technique complète de votre site et une étude des mots-clés de votre secteur.',
        sections: [
          {
            title: 'Ce que nous analysons',
            items: [
              'Vitesse de chargement (Core Web Vitals)',
              'Structure des URLs et architecture du site',
              'Métadonnées (titres, descriptions, balises H1-H6)',
              'Maillage interne entre les pages',
              'Compatibilité mobile et responsive design',
              'Erreurs 404, redirections, liens cassés',
              'Indexation et fichier sitemap.xml'
            ]
          },
          {
            title: 'Version Avancée - En plus',
            items: [
              'Étude approfondie de vos concurrents',
              'Analyse d\'un plus grand volume de mots-clés',
              'Plan d\'action priorisé des corrections techniques',
              'Roadmap des actions à mener sur les prochains mois'
            ]
          }
        ],
        conclusion: 'Livrable : Rapport d\'audit complet avec recommandations actionnables.'
      }
    },
    levels: [
      {
        name: 'Basic',
        price: 300,
        features: ['Audit technique complet', '15-20 mots-clés analysés', 'Recommandations générales'],
        recommended: 'Sites récents ou petits budgets'
      },
      {
        name: 'Avancé',
        price: 400,
        features: ['Audit approfondi', 'Étude des concurrents', '40+ mots-clés analysés', 'Plan d\'action technique priorisé'],
        recommended: 'Pour une vision stratégique complète',
        popular: true
      }
    ]
  },
  {
    id: 'seo-corrections',
    title: 'B. Corrections Techniques',
    description: 'Identification et correction des freins techniques qui empêchent votre bon référencement.',
    icon: '🔧',
    detailedInfo: {
      title: 'Corrections Techniques - C\'est quoi exactement ?',
      content: {
        intro: 'Un site techniquement sain est la fondation d\'un bon référencement. Nous utilisons des outils professionnels (Ahrefs, Screaming Frog) pour détecter tous les problèmes.',
        sections: [
          {
            title: 'Types d\'erreurs détectées',
            items: [
              'Erreurs 404 et liens cassés',
              'Problèmes de redirections (chaînes, boucles)',
              'Contenu dupliqué',
              'Problèmes de canonicals',
              'Erreurs de balisage Schema.org',
              'Problèmes d\'indexation (noindex accidentels)',
              'Vitesse de chargement lente'
            ]
          }
        ],
        conclusion: 'Livrable : Rapport technique avec priorisation High/Medium/Low.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        price: 100,
        features: ['Liste des erreurs détectées', 'Export brut des problèmes'],
        recommended: 'Vous avez un webmaster en interne'
      },
      {
        name: 'Avancé',
        price: 250,
        features: ['Détection des erreurs', 'Explications détaillées', 'Recommandations actionnables'],
        recommended: 'Comprendre et prioriser',
        popular: true
      },
      {
        name: 'Premium',
        price: 500,
        priceNote: '400-600€*',
        features: ['Détection complète', 'Implémentation par MyDigipal', 'Suivi des corrections'],
        recommended: 'On s\'en occupe pour vous'
      }
    ]
  },
  {
    id: 'seo-strategy',
    title: 'C. Stratégie SEO Central',
    description: 'Pilotage stratégique continu : identification des opportunités, optimisation des pages et veille concurrentielle.',
    icon: '🎯',
    detailedInfo: {
      title: 'Stratégie SEO Central - C\'est quoi exactement ?',
      content: {
        intro: 'Un accompagnement stratégique continu pour piloter votre SEO de manière proactive.',
        sections: [
          {
            title: 'Recherche de mots-clés en continu',
            items: [
              'Identification des nouvelles opportunités',
              'Suivi des positions et performances',
              'Analyse des volumes de recherche',
              'Détection des quick wins'
            ]
          },
          {
            title: 'Optimisation des pages existantes',
            items: [
              'Audit régulier des pages centrales',
              'Recommandations de contenu',
              'Optimisation des balises et structure',
              'Amélioration du maillage interne'
            ]
          }
        ],
        conclusion: 'Un pilotage stratégique qui vous donne une longueur d\'avance.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        price: 200,
        features: ['5-10 pages suivies', 'Recherche mots-clés mensuelle', 'Recommandations d\'optimisation'],
        recommended: 'Petits sites ou démarrage'
      },
      {
        name: 'Avancé',
        price: 400,
        features: ['15-25 pages suivies', 'Recherche bi-mensuelle', 'Analyse concurrence trimestrielle', 'Plan d\'action priorisé'],
        recommended: 'Sites en croissance',
        popular: true
      },
      {
        name: 'Premium',
        price: 600,
        features: ['40+ pages suivies', 'Veille mots-clés continue', 'Analyse concurrence mensuelle', 'Accompagnement dédié'],
        recommended: 'Sites ambitieux'
      }
    ]
  },
  {
    id: 'seo-content',
    title: 'D. Contenu IA Optimisé',
    description: 'Articles SEO optimisés produits avec notre système IA pour publier régulièrement du contenu de qualité.',
    icon: '✍️',
    hasAddon: true,
    detailedInfo: {
      title: 'Contenu IA Optimisé - C\'est quoi exactement ?',
      content: {
        intro: 'La régularité est cruciale : 2 articles/semaine = +68% de trafic organique après 6 mois.',
        sections: [
          {
            title: 'Notre process de création',
            items: [
              'Identification des thématiques via Ahrefs',
              'Analyse des volumes et difficulté',
              'Structuration optimale (H1, H2, FAQ)',
              'Rédaction IA personnalisée à votre ton',
              'Relecture et validation humaine'
            ]
          },
          {
            title: 'Option Publication CMS (+100€/mois)',
            items: [
              'Push automatique dans WordPress/Webflow',
              'Articles en brouillon ou publiés directement',
              'Gain de temps considérable'
            ]
          }
        ],
        conclusion: 'Technologies : API Ahrefs, Claude Sonnet 4 / GPT-5, N8N automation'
      }
    },
    levels: [
      {
        name: '2 articles',
        price: 350,
        features: ['2 articles/mois', 'Optimisés SEO', 'Livrés en document'],
        recommended: 'Démarrage ou budget limité'
      },
      {
        name: '4 articles',
        price: 600,
        features: ['4 articles/mois', 'Optimisés SEO', 'Recherche mots-clés incluse'],
        recommended: 'Croissance régulière',
        popular: true
      },
      {
        name: '8 articles',
        price: 750,
        features: ['8 articles/mois', 'Optimisés SEO', 'Stratégie éditoriale complète'],
        recommended: 'Dominer votre secteur'
      }
    ]
  },
  {
    id: 'seo-followup',
    title: 'E. Suivi & Collaboration',
    description: 'Accompagnement adapté à vos besoins, du simple reporting au suivi rapproché avec réunions.',
    icon: '🤝',
    detailedInfo: {
      title: 'Suivi & Collaboration - C\'est quoi exactement ?',
      content: {
        intro: 'Un accompagnement SEO efficace nécessite un suivi régulier et une communication claire.',
        sections: [
          {
            title: 'Ce que comprend le reporting',
            items: [
              'Évolution du trafic organique',
              'Positions des mots-clés cibles',
              'Nouveaux backlinks acquis',
              'Erreurs techniques détectées',
              'Actions réalisées et recommandations'
            ]
          },
          {
            title: 'Format des meetings',
            items: [
              'Présentation des résultats',
              'Discussion des priorités',
              'Questions/réponses',
              'Définition des prochaines actions'
            ]
          }
        ],
        conclusion: 'Transparence totale sur les actions et résultats.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        price: 100,
        features: ['Reporting email mensuel', 'Métriques clés'],
        recommended: 'Autonome, peu de questions'
      },
      {
        name: 'Avancé',
        price: 200,
        features: ['1 meeting tous les 2 mois', 'Récap + brief mensuel', 'Support email'],
        recommended: 'Échanges réguliers',
        popular: true
      },
      {
        name: 'Premium',
        price: 300,
        features: ['1 meeting/mois', 'Disponibilité email réactive', 'Accompagnement stratégique'],
        recommended: 'Collaboration intensive'
      }
    ]
  }
];
