import type { ServiceItem } from '../types';

// REFONTE : 5 sous-services → 3 packages simplifiés
// Avant : Audit, Corrections Techniques, Stratégie SEO, Contenu IA, Suivi & Collaboration
// Après : Starter, Growth, Premium (packages tout-en-un)
// Chaque package inclut un audit initial one-off + un accompagnement mensuel

export const seoServices: ServiceItem[] = [
  {
    id: 'seo-audit',
    title: 'A. Audit SEO Initial',
    titleEn: 'A. Initial SEO Audit',
    description: 'Analyse complète de votre site, marché et concurrents. Le point de départ indispensable.',
    descriptionEn: 'Complete analysis of your site, market and competitors. The essential starting point.',
    icon: '🔍',
    isOneOff: true,
    detailedInfo: {
      title: 'Audit SEO - C\'est quoi exactement ?',
      content: {
        intro: 'Un diagnostic complet de votre présence en ligne et de vos opportunités de croissance organique.',
        sections: [
          {
            title: 'Ce que nous analysons',
            items: [
              'Performance technique (Core Web Vitals, vitesse, mobile)',
              'Architecture du site et structure des URLs',
              'Métadonnées (titres, descriptions, H1-H6)',
              'Maillage interne et navigation',
              'Indexation, sitemap.xml, robots.txt',
              'Erreurs 404, redirections, liens cassés',
              'Étude de vos concurrents directs',
              'Recherche de mots-clés à fort potentiel'
            ]
          },
          {
            title: 'Version Premium - En plus',
            items: [
              'Analyse approfondie de 100+ mots-clés',
              'Audit de backlinks et profil de liens',
              'Roadmap d\'actions priorisée sur 6 mois',
              'Benchmark concurrentiel détaillé'
            ]
          }
        ],
        conclusion: 'Livrable : Rapport d\'audit complet avec recommandations actionnables et plan d\'action.'
      }
    },
    detailedInfoEn: {
      title: 'SEO Audit - What exactly is it?',
      content: {
        intro: 'A complete diagnostic of your online presence and your organic growth opportunities.',
        sections: [
          {
            title: 'What we analyze',
            items: [
              'Technical performance (Core Web Vitals, speed, mobile)',
              'Site architecture and URL structure',
              'Metadata (titles, descriptions, H1-H6)',
              'Internal linking and navigation',
              'Indexing, sitemap.xml, robots.txt',
              '404 errors, redirects, broken links',
              'Analysis of your direct competitors',
              'High-potential keyword research'
            ]
          },
          {
            title: 'Premium version - Additional',
            items: [
              'In-depth analysis of 100+ keywords',
              'Backlink audit and link profile review',
              '6-month prioritized action roadmap',
              'Detailed competitive benchmark'
            ]
          }
        ],
        conclusion: 'Deliverable: Complete audit report with actionable recommendations and action plan.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 400,
        features: [
          'Audit technique complet',
          '20-30 mots-clés analysés',
          'Liste des erreurs détectées',
          'Recommandations générales'
        ],
        featuresEn: [
          'Complete technical audit',
          '20-30 keywords analyzed',
          'List of detected errors',
          'General recommendations'
        ],
        recommended: 'Sites récents ou petits budgets',
        recommendedEn: 'New sites or small budgets'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 700,
        features: [
          'Audit technique + concurrentiel',
          '50+ mots-clés analysés',
          'Corrections techniques incluses',
          'Plan d\'action priorisé sur 3 mois'
        ],
        featuresEn: [
          'Technical + competitive audit',
          '50+ keywords analyzed',
          'Technical fixes included',
          'Prioritized 3-month action plan'
        ],
        recommended: 'Vision stratégique complète',
        recommendedEn: 'Complete strategic view',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1200,
        features: [
          'Audit exhaustif technique + sémantique',
          '100+ mots-clés + analyse backlinks',
          'Corrections techniques implémentées',
          'Roadmap 6 mois + benchmark concurrentiel',
          'Présentation et workshop stratégique'
        ],
        featuresEn: [
          'Exhaustive technical + semantic audit',
          '100+ keywords + backlink analysis',
          'Technical fixes implemented',
          '6-month roadmap + competitive benchmark',
          'Presentation and strategic workshop'
        ],
        recommended: 'Sites ambitieux, marchés compétitifs',
        recommendedEn: 'Ambitious sites, competitive markets'
      }
    ]
  },
  {
    id: 'seo-monthly',
    title: 'B. Accompagnement SEO Mensuel',
    titleEn: 'B. Monthly SEO Management',
    description: 'Stratégie continue, création de contenu optimisé et suivi des performances pour une croissance organique durable.',
    descriptionEn: 'Ongoing strategy, optimized content creation and performance tracking for sustainable organic growth.',
    icon: '📈',
    hasAddon: true,
    detailedInfo: {
      title: 'Accompagnement SEO Mensuel - C\'est quoi exactement ?',
      content: {
        intro: 'Un accompagnement complet pour faire croître votre trafic organique mois après mois.',
        sections: [
          {
            title: 'Stratégie et pilotage',
            items: [
              'Recherche continue de mots-clés et opportunités',
              'Suivi des positions et performances',
              'Optimisation des pages existantes',
              'Amélioration du maillage interne',
              'Veille concurrentielle'
            ]
          },
          {
            title: 'Création de contenu IA optimisé',
            items: [
              'Articles SEO produits avec notre système IA propriétaire',
              'Structuration optimale (H1, H2, FAQ, Schema)',
              'Rédaction IA personnalisée à votre ton de marque',
              'Relecture et validation humaine',
              'Optimisation LLMO (ChatGPT, Perplexity, Gemini)'
            ]
          },
          {
            title: 'Suivi et collaboration',
            items: [
              'Reporting régulier avec KPIs clés',
              'Meetings pour discuter des résultats et priorités',
              'Support email pour vos questions SEO'
            ]
          }
        ],
        conclusion: 'Résultat moyen : +68% de trafic organique après 6 mois de publication régulière.'
      }
    },
    detailedInfoEn: {
      title: 'Monthly SEO Management - What exactly is it?',
      content: {
        intro: 'Complete management to grow your organic traffic month after month.',
        sections: [
          {
            title: 'Strategy and steering',
            items: [
              'Ongoing keyword and opportunity research',
              'Position and performance tracking',
              'Optimization of existing pages',
              'Internal linking improvements',
              'Competitive monitoring'
            ]
          },
          {
            title: 'AI-optimized content creation',
            items: [
              'SEO articles produced with our proprietary AI system',
              'Optimal structure (H1, H2, FAQ, Schema)',
              'AI writing personalized to your brand voice',
              'Human proofreading and validation',
              'LLMO optimization (ChatGPT, Perplexity, Gemini)'
            ]
          },
          {
            title: 'Tracking and collaboration',
            items: [
              'Regular reporting with key KPIs',
              'Meetings to discuss results and priorities',
              'Email support for your SEO questions'
            ]
          }
        ],
        conclusion: 'Average result: +68% organic traffic after 6 months of regular publishing.'
      }
    },
    levels: [
      {
        name: 'Starter',
        nameEn: 'Starter',
        price: 500,
        features: [
          '2 articles SEO/mois',
          'Recherche de mots-clés mensuelle',
          '5-10 pages suivies',
          'Corrections techniques continues',
          'Reporting email mensuel'
        ],
        featuresEn: [
          '2 SEO articles/month',
          'Monthly keyword research',
          '5-10 pages tracked',
          'Continuous technical fixes',
          'Monthly email reporting'
        ],
        recommended: 'Démarrage ou budget maîtrisé',
        recommendedEn: 'Getting started or controlled budget'
      },
      {
        name: 'Growth',
        nameEn: 'Growth',
        price: 1000,
        features: [
          '4 articles SEO/mois',
          'Stratégie mots-clés bi-mensuelle',
          '15-25 pages suivies',
          'Optimisation pages existantes',
          'Analyse concurrence trimestrielle',
          'Meeting bi-mensuel + reporting'
        ],
        featuresEn: [
          '4 SEO articles/month',
          'Bi-monthly keyword strategy',
          '15-25 pages tracked',
          'Existing page optimization',
          'Quarterly competitor analysis',
          'Bi-monthly meeting + reporting'
        ],
        recommended: 'Croissance régulière',
        recommendedEn: 'Regular growth',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1800,
        features: [
          '8 articles SEO/mois',
          'Veille mots-clés continue',
          '40+ pages suivies',
          'Netlinking ciblé (5-10 backlinks/mois)',
          'Analyse concurrence mensuelle',
          'Meeting mensuel + support réactif',
          'Accompagnement stratégique dédié'
        ],
        featuresEn: [
          '8 SEO articles/month',
          'Continuous keyword monitoring',
          '40+ pages tracked',
          'Targeted link building (5-10 backlinks/month)',
          'Monthly competitor analysis',
          'Monthly meeting + responsive support',
          'Dedicated strategic guidance'
        ],
        recommended: 'Dominer votre secteur',
        recommendedEn: 'Dominate your industry'
      }
    ]
  }
];
