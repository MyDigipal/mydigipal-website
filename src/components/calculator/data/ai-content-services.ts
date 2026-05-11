import type { ServiceItem } from '../types';

// NOUVEAU DOMAINE : AI Content Creation
// Basé sur la page /en/services/ai-content
// Création de contenu IA à l'échelle : blog, landing pages, social, case studies

export const aiContentServices: ServiceItem[] = [
  {
    id: 'ai-content-blog',
    title: 'A. Articles de Blog SEO',
    titleEn: 'A. SEO Blog Articles',
    description: 'Articles optimisés SEO de 1500-3000 mots, produits avec notre système IA et validés par un expert humain.',
    descriptionEn: 'SEO-optimized articles of 1500-3000 words, produced with our AI system and validated by a human expert.',
    icon: '📝',
    hasAddon: true,
    detailedInfo: {
      title: 'Articles SEO - C\'est quoi exactement ?',
      content: {
        intro: 'Du contenu de qualité produit à l\'échelle grâce à notre pipeline IA propriétaire, avec validation humaine systématique.',
        sections: [
          {
            title: 'Notre process en 4 étapes',
            items: [
              '1. Brand Voice Training : analyse de 10+ contenus existants pour capturer votre ton',
              '2. Stratégie data-driven : intégration Ahrefs + Search Console pour identifier les opportunités',
              '3. Génération IA : articles structurés (H1-H6, meta, FAQ, liens internes)',
              '4. Validation humaine : relecture, fact-checking, optimisation finale'
            ]
          },
          {
            title: 'Chaque article inclut',
            items: [
              'Meta title (max 60 caractères) + meta description (max 155)',
              'Structure H1 + 4-7 H2 optimisés',
              'Mot-clé principal + ~5 mots-clés secondaires',
              '8-12 liens internes',
              'Section FAQ pour les featured snippets',
              'Densité de mots-clés naturelle (1-2%)'
            ]
          }
        ],
        conclusion: 'Formé sur VOTRE voix de marque. Pas du ChatGPT générique.'
      }
    },
    detailedInfoEn: {
      title: 'SEO Articles - What exactly is it?',
      content: {
        intro: 'Quality content produced at scale through our proprietary AI pipeline, with systematic human validation.',
        sections: [
          {
            title: 'Our 4-step process',
            items: [
              '1. Brand Voice Training: analysis of 10+ existing pieces of content to capture your tone',
              '2. Data-driven strategy: Ahrefs + Search Console integration to identify opportunities',
              '3. AI generation: structured articles (H1-H6, meta, FAQ, internal links)',
              '4. Human validation: proofreading, fact-checking, final optimization'
            ]
          },
          {
            title: 'Each article includes',
            items: [
              'Meta title (max 60 characters) + meta description (max 155)',
              'H1 structure + 4-7 optimized H2',
              'Primary keyword + ~5 secondary keywords',
              '8-12 internal links',
              'FAQ section for featured snippets',
              'Natural keyword density (1-2%)'
            ]
          }
        ],
        conclusion: 'Trained on YOUR brand voice. Not generic ChatGPT.'
      }
    },
    levels: [
      {
        name: '4 articles',
        nameEn: '4 articles',
        price: 500,
        features: [
          '4 articles/mois (1500-2000 mots)',
          'Optimisés SEO + LLMO',
          'Brand voice training inclus',
          'Livrés en document (Google Docs, Word)'
        ],
        featuresEn: [
          '4 articles/month (1500-2000 words)',
          'SEO + LLMO optimized',
          'Brand voice training included',
          'Delivered as document (Google Docs, Word)'
        ],
        recommended: 'Démarrage ou complément SEO',
        recommendedEn: 'Getting started or SEO complement'
      },
      {
        name: '8 articles',
        nameEn: '8 articles',
        price: 900,
        features: [
          '8 articles/mois (1500-3000 mots)',
          'Stratégie éditoriale mensuelle',
          'Recherche mots-clés Ahrefs incluse',
          'Publication CMS optionnelle (+100€)'
        ],
        featuresEn: [
          '8 articles/month (1500-3000 words)',
          'Monthly editorial strategy',
          'Ahrefs keyword research included',
          'Optional CMS publishing (+€100)'
        ],
        recommended: 'Croissance organique régulière',
        recommendedEn: 'Regular organic growth',
        popular: true
      },
      {
        name: '16+ articles',
        nameEn: '16+ articles',
        price: 1600,
        features: [
          '16+ articles/mois',
          'Stratégie éditoriale complète',
          'Calendrier de publication',
          'Publication CMS incluse',
          'Reporting performance mensuel'
        ],
        featuresEn: [
          '16+ articles/month',
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
