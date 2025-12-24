import type { ServiceItem } from '../types';

export const seoServices: ServiceItem[] = [
  {
    id: 'seo-audit',
    title: 'A. Audit SEO',
    titleEn: 'A. SEO Audit',
    description: 'Analyse complète de votre site, votre marché et vos concurrents pour identifier les opportunités.',
    descriptionEn: 'Complete analysis of your site, market and competitors to identify opportunities.',
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
        nameEn: 'Basic',
        price: 300,
        features: ['Audit technique complet', '15-20 mots-clés analysés', 'Recommandations générales'],
        featuresEn: ['Complete technical audit', '15-20 keywords analyzed', 'General recommendations'],
        recommended: 'Sites récents ou petits budgets',
        recommendedEn: 'New sites or small budgets'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 400,
        features: ['Audit approfondi', 'Étude des concurrents', '40+ mots-clés analysés', 'Plan d\'action technique priorisé'],
        featuresEn: ['In-depth audit', 'Competitor study', '40+ keywords analyzed', 'Prioritized technical action plan'],
        recommended: 'Pour une vision stratégique complète',
        recommendedEn: 'For a complete strategic view',
        popular: true
      }
    ]
  },
  {
    id: 'seo-corrections',
    title: 'B. Corrections Techniques',
    titleEn: 'B. Technical Fixes',
    description: 'Identification et correction des freins techniques qui empêchent votre bon référencement.',
    descriptionEn: 'Identification and correction of technical issues hindering your SEO performance.',
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
        nameEn: 'Essential',
        price: 100,
        features: ['Liste des erreurs détectées', 'Export brut des problèmes'],
        featuresEn: ['List of detected errors', 'Raw issues export'],
        recommended: 'Vous avez un webmaster en interne',
        recommendedEn: 'You have an in-house webmaster'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 250,
        features: ['Détection des erreurs', 'Explications détaillées', 'Recommandations actionnables'],
        featuresEn: ['Error detection', 'Detailed explanations', 'Actionable recommendations'],
        recommended: 'Comprendre et prioriser',
        recommendedEn: 'Understand and prioritize',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 500,
        priceNote: '400-600€*',
        priceNoteEn: '€400-600*',
        features: ['Détection complète', 'Implémentation par MyDigipal', 'Suivi des corrections'],
        featuresEn: ['Complete detection', 'Implementation by MyDigipal', 'Fix tracking'],
        recommended: 'On s\'en occupe pour vous',
        recommendedEn: 'We handle it for you'
      }
    ]
  },
  {
    id: 'seo-strategy',
    title: 'C. Stratégie SEO Central',
    titleEn: 'C. Core SEO Strategy',
    description: 'Pilotage stratégique continu : identification des opportunités, optimisation des pages et veille concurrentielle.',
    descriptionEn: 'Ongoing strategic management: opportunity identification, page optimization and competitive monitoring.',
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
        nameEn: 'Essential',
        price: 200,
        features: ['5-10 pages suivies', 'Recherche mots-clés mensuelle', 'Recommandations d\'optimisation'],
        featuresEn: ['5-10 pages tracked', 'Monthly keyword research', 'Optimization recommendations'],
        recommended: 'Petits sites ou démarrage',
        recommendedEn: 'Small sites or getting started'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 400,
        features: ['15-25 pages suivies', 'Recherche bi-mensuelle', 'Analyse concurrence trimestrielle', 'Plan d\'action priorisé'],
        featuresEn: ['15-25 pages tracked', 'Bi-monthly research', 'Quarterly competitor analysis', 'Prioritized action plan'],
        recommended: 'Sites en croissance',
        recommendedEn: 'Growing sites',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 600,
        features: ['40+ pages suivies', 'Veille mots-clés continue', 'Analyse concurrence mensuelle', 'Accompagnement dédié'],
        featuresEn: ['40+ pages tracked', 'Continuous keyword monitoring', 'Monthly competitor analysis', 'Dedicated support'],
        recommended: 'Sites ambitieux',
        recommendedEn: 'Ambitious sites'
      }
    ]
  },
  {
    id: 'seo-content',
    title: 'D. Contenu IA Optimisé',
    titleEn: 'D. AI-Optimized Content',
    description: 'Articles SEO optimisés produits avec notre système IA pour publier régulièrement du contenu de qualité.',
    descriptionEn: 'SEO-optimized articles produced with our AI system to regularly publish quality content.',
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
        nameEn: '2 articles',
        price: 350,
        features: ['2 articles/mois', 'Optimisés SEO', 'Livrés en document'],
        featuresEn: ['2 articles/month', 'SEO optimized', 'Delivered as document'],
        recommended: 'Démarrage ou budget limité',
        recommendedEn: 'Getting started or limited budget'
      },
      {
        name: '4 articles',
        nameEn: '4 articles',
        price: 600,
        features: ['4 articles/mois', 'Optimisés SEO', 'Recherche mots-clés incluse'],
        featuresEn: ['4 articles/month', 'SEO optimized', 'Keyword research included'],
        recommended: 'Croissance régulière',
        recommendedEn: 'Regular growth',
        popular: true
      },
      {
        name: '8 articles',
        nameEn: '8 articles',
        price: 750,
        features: ['8 articles/mois', 'Optimisés SEO', 'Stratégie éditoriale complète'],
        featuresEn: ['8 articles/month', 'SEO optimized', 'Complete editorial strategy'],
        recommended: 'Dominer votre secteur',
        recommendedEn: 'Dominate your industry'
      }
    ]
  },
  {
    id: 'seo-followup',
    title: 'E. Suivi & Collaboration',
    titleEn: 'E. Follow-up & Collaboration',
    description: 'Accompagnement adapté à vos besoins, du simple reporting au suivi rapproché avec réunions.',
    descriptionEn: 'Support tailored to your needs, from simple reporting to close follow-up with meetings.',
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
        nameEn: 'Essential',
        price: 100,
        features: ['Reporting email mensuel', 'Métriques clés'],
        featuresEn: ['Monthly email reporting', 'Key metrics'],
        recommended: 'Autonome, peu de questions',
        recommendedEn: 'Autonomous, few questions'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 200,
        features: ['1 meeting tous les 2 mois', 'Récap + brief mensuel', 'Support email'],
        featuresEn: ['1 meeting every 2 months', 'Monthly recap + brief', 'Email support'],
        recommended: 'Échanges réguliers',
        recommendedEn: 'Regular exchanges',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 300,
        features: ['1 meeting/mois', 'Disponibilité email réactive', 'Accompagnement stratégique'],
        featuresEn: ['1 meeting/month', 'Responsive email availability', 'Strategic support'],
        recommended: 'Collaboration intensive',
        recommendedEn: 'Intensive collaboration'
      }
    ]
  }
];
