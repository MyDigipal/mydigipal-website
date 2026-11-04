import type { ServiceItem } from '../types';

// NOUVEAU DOMAINE : AI Content Creation
// Basé sur la page /en/services/ai-content
// Création de contenu IA à l'échelle : blog, landing pages, social, case studies

export const aiContentServices: ServiceItem[] = [
  {
    id: 'ai-content-blog',
    title: 'A. Articles de Blog SEO',
    titleEn: 'A. SEO Blog Articles',
    description: 'Des guides de 1 400 à 1 900 mots avec leur vidéo, écrits avec nos outils d\'IA et vérifiés par l\'équipe, de la recherche des sujets à la publication.',
    descriptionEn: '1,400 to 1,900-word guides with their own video, written with our AI tools and checked by the team, from topic research to publishing.',
    icon: '📝',
    hasAddon: true,
    // Aligné le 04/11/2026 sur la page AI Content (le circuit du mois de notre offre blog).
    detailedInfo: {
      title: 'Les articles de blog, c\'est quoi exactement ?',
      content: {
        intro: 'Le circuit complet du mois : vous intervenez deux fois, pour choisir les sujets et pour relire.',
        sections: [
          {
            title: 'Le circuit du mois',
            items: [
              'Les sujets : Ahrefs, la Search Console, l\'actualité et les réponses des IA, puis votre choix dans le Hub',
              'La préparation : les premiers résultats de Google et un dossier de faits sourcés',
              'La rédaction : un guide de 1 400 à 1 900 mots, avec tableau, FAQ et sources',
              'Notre relecture, puis la vôtre dans le Hub ; chaque remarque devient une règle',
              'La publication, puis le suivi des positions'
            ]
          },
          {
            title: 'Chaque article inclut',
            items: [
              'Le titre et la description pour Google, au caractère près',
              'Les données structurées (article et FAQ)',
              '6 à 8 liens vers vos pages, tous testés',
              'Une vidéo de 30 à 40 secondes et une vignette'
            ]
          }
        ],
        conclusion: 'Nos outils d\'IA vont vite, notre équipe vérifie chaque fait et chaque lien.'
      }
    },
    detailedInfoEn: {
      title: 'Blog articles: what exactly is it?',
      content: {
        intro: 'The full monthly loop: you step in twice, to pick the topics and to review.',
        sections: [
          {
            title: 'Your month, end to end',
            items: [
              'Topics: Ahrefs, Search Console, the news and AI answers, then your pick in the Hub',
              'Research: the top Google results and a file of sourced facts',
              'Writing: a 1,400 to 1,900-word guide, with a table, an FAQ and sources',
              'Our review, then yours in the Hub; every note becomes a rule',
              'Publishing, then rank tracking'
            ]
          },
          {
            title: 'Each article includes',
            items: [
              'Title and description for Google, to the character',
              'Structured data (article and FAQ)',
              '6 to 8 links to your pages, all tested',
              'A 30 to 40-second video and a thumbnail'
            ]
          }
        ],
        conclusion: 'Our AI tools move fast, our team checks every fact and every link.'
      }
    },
    // Prix fixés par Paul le 04/11/2026 : 500, 800 et 1 000 € (4, 8 et 16 articles par mois).
    levels: [
      {
        name: '4 articles',
        nameEn: '4 articles',
        price: 500,
        features: [
          '4 articles/mois (1 400 à 1 900 mots par article)',
          'Une vidéo et une vignette par article',
          'Sujets, SEO et relecture dans le Hub',
          'Publication et suivi des positions'
        ],
        featuresEn: [
          '4 articles/month (1,400 to 1,900 words each)',
          'A video and a thumbnail per article',
          'Topics, SEO and review in the Hub',
          'Publishing and rank tracking'
        ],
        recommended: 'Démarrage ou complément SEO',
        recommendedEn: 'Getting started or SEO complement'
      },
      {
        name: '8 articles',
        nameEn: '8 articles',
        price: 800,
        features: [
          '8 articles/mois (1 400 à 1 900 mots par article)',
          'Stratégie éditoriale mensuelle',
          'Recherche mots-clés Ahrefs incluse',
          'Publication CMS optionnelle (+100€)'
        ],
        featuresEn: [
          '8 articles/month (1,400 to 1,900 words each)',
          'Monthly editorial strategy',
          'Ahrefs keyword research included',
          'Optional CMS publishing (+€100)'
        ],
        recommended: 'Croissance organique régulière',
        recommendedEn: 'Regular organic growth',
        popular: true
      },
      {
        name: '16 articles',
        nameEn: '16 articles',
        price: 1000,
        features: [
          '16 articles/mois (1 400 à 1 900 mots par article)',
          'Stratégie éditoriale complète',
          'Calendrier de publication',
          'Publication CMS incluse',
          'Reporting performance mensuel'
        ],
        featuresEn: [
          '16 articles/month (1,400 to 1,900 words each)',
          'Complete editorial strategy',
          'Publication calendar',
          'CMS publishing included',
          'Monthly performance reporting'
        ],
        recommended: 'Dominer les résultats de recherche',
        recommendedEn: 'Dominate search results'
      }
    ]
  },
  {
    id: 'ai-content-social',
    title: 'B. Contenu Social & Landing Pages',
    titleEn: 'B. Social Content & Landing Pages',
    description: 'Posts LinkedIn, contenus sociaux, landing pages et case studies produits avec votre ton de marque.',
    descriptionEn: 'LinkedIn posts, social content, landing pages and case studies produced with your brand voice.',
    icon: '📱',
    detailedInfo: {
      title: 'Contenu Social & Landing Pages - C\'est quoi exactement ?',
      content: {
        intro: 'Du contenu varié pour tous vos canaux, avec la même qualité et cohérence de marque.',
        sections: [
          {
            title: 'Types de contenu disponibles',
            items: [
              'Posts LinkedIn (thought leadership, engagement)',
              'Posts Instagram/Facebook (carrousels, stories)',
              'Landing pages haute conversion (headlines, bénéfices, CTA)',
              'Case studies (problème-solution-résultats)',
              'Descriptions produits SEO-friendly',
              'Séquences email de nurturing'
            ]
          },
          {
            title: 'Formats de livraison',
            items: [
              'Google Docs / Word / Notion / Plain text',
              'Publication directe CMS (WordPress, Webflow, Shopify)',
              'Scheduling social (LinkedIn, Twitter/X)',
              'Exports Canva-ready pour les visuels'
            ]
          }
        ],
        conclusion: '50+ clients servis dont Genesys, Quantum Metrics, OpenText, Edenred.'
      }
    },
    detailedInfoEn: {
      title: 'Social Content & Landing Pages - What exactly is it?',
      content: {
        intro: 'Varied content for every channel, with the same quality and brand consistency.',
        sections: [
          {
            title: 'Content types available',
            items: [
              'LinkedIn posts (thought leadership, engagement)',
              'Instagram/Facebook posts (carousels, stories)',
              'High-conversion landing pages (headlines, benefits, CTA)',
              'Case studies (problem-solution-results)',
              'SEO-friendly product descriptions',
              'Email nurturing sequences'
            ]
          },
          {
            title: 'Delivery formats',
            items: [
              'Google Docs / Word / Notion / Plain text',
              'Direct CMS publishing (WordPress, Webflow, Shopify)',
              'Social scheduling (LinkedIn, Twitter/X)',
              'Canva-ready exports for visuals'
            ]
          }
        ],
        conclusion: '50+ clients served including Genesys, Quantum Metrics, OpenText, Edenred.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 400,
        features: [
          '20 posts sociaux/mois',
          'Adapté par plateforme',
          'Calendrier éditorial',
          'Livraison document'
        ],
        featuresEn: [
          '20 social posts/month',
          'Platform-adapted',
          'Editorial calendar',
          'Document delivery'
        ],
        recommended: 'Présence sociale régulière',
        recommendedEn: 'Regular social presence'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 800,
        features: [
          '30 posts sociaux + 2 landing pages',
          'Ou : 20 posts + 1 case study + 1 landing page',
          'Stratégie de contenu mensuelle',
          'Publication directe optionnelle'
        ],
        featuresEn: [
          '30 social posts + 2 landing pages',
          'Or: 20 posts + 1 case study + 1 landing page',
          'Monthly content strategy',
          'Optional direct publishing'
        ],
        recommended: 'Contenu multi-format',
        recommendedEn: 'Multi-format content',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1500,
        features: [
          'Contenu illimité (blog + social + landing + email)',
          'Stratégie éditoriale complète',
          'Publication tous canaux',
          'Reporting performance',
          'Call mensuel stratégique'
        ],
        featuresEn: [
          'Unlimited content (blog + social + landing + email)',
          'Complete editorial strategy',
          'All-channel publishing',
          'Performance reporting',
          'Monthly strategy call'
        ],
        recommended: 'Content machine complète',
        recommendedEn: 'Complete content machine'
      }
    ]
  }
];
