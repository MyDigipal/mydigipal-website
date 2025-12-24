import type { ServiceItem } from '../types';

export const emailingServices: ServiceItem[] = [
  {
    id: 'email-setup',
    title: 'A. Email Software Setup',
    titleEn: 'A. Email Software Setup',
    description: 'Configuration de votre plateforme email (Mailchimp, Klaviyo, HubSpot, Brevo...) pour que votre équipe soit autonome.',
    descriptionEn: 'Configuration of your email platform (Mailchimp, Klaviyo, HubSpot, Brevo...) so your team can be autonomous.',
    icon: '⚙️',
    isOneOff: true,
    detailedInfo: {
      title: 'Email Software Setup - C\'est quoi exactement ?',
      content: {
        intro: 'Mise en place et configuration de votre plateforme d\'email marketing pour vous rendre autonome.',
        sections: [
          {
            title: 'Ce que nous configurons',
            items: [
              'Création et configuration du compte',
              'Paramétrage DNS (SPF, DKIM, DMARC)',
              'Templates de base personnalisés',
              'Formulaires d\'inscription',
              'Configuration des automations de base',
              'Formation de votre équipe'
            ]
          },
          {
            title: 'Plateformes supportées',
            items: [
              'Mailchimp',
              'Klaviyo',
              'HubSpot',
              'Brevo (Sendinblue)',
              'ActiveCampaign',
              'Autres sur demande'
            ]
          }
        ],
        conclusion: 'Livrable : Plateforme configurée + documentation + formation.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 400,
        features: ['Configuration plateforme', 'DNS & délivrabilité', '2 templates de base', 'Documentation'],
        featuresEn: ['Platform configuration', 'DNS & deliverability', '2 basic templates', 'Documentation'],
        recommended: 'Démarrage simple',
        recommendedEn: 'Simple start'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 800,
        features: ['Configuration complète', '5 templates personnalisés', 'Formulaires avancés', '3 automations', 'Formation 2h'],
        featuresEn: ['Complete configuration', '5 custom templates', 'Advanced forms', '3 automations', '2h training'],
        recommended: 'Setup complet',
        recommendedEn: 'Complete setup',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1500,
        features: ['Setup sur-mesure', 'Templates illimités', 'Automations avancées', 'Intégrations tierces', 'Formation 4h + support 1 mois'],
        featuresEn: ['Custom setup', 'Unlimited templates', 'Advanced automations', 'Third-party integrations', '4h training + 1 month support'],
        recommended: 'Besoins complexes',
        recommendedEn: 'Complex needs'
      }
    ]
  },
  {
    id: 'email-crm',
    title: 'B. Intégration CRM & Base de données',
    titleEn: 'B. CRM & Database Integration',
    description: 'Connectez votre système email avec votre CRM et vos sources de données pour une synchronisation parfaite.',
    descriptionEn: 'Connect your email system with your CRM and data sources for perfect synchronization.',
    icon: '🔗',
    isOneOff: true,
    detailedInfo: {
      title: 'Intégration CRM - C\'est quoi exactement ?',
      content: {
        intro: 'Synchronisation de vos outils pour que vos données circulent automatiquement.',
        sections: [
          {
            title: 'Ce que nous connectons',
            items: [
              'CRM (Salesforce, HubSpot, Pipedrive...)',
              'Bases de données clients',
              'E-commerce (Shopify, WooCommerce...)',
              'Outils de support (Zendesk, Intercom...)',
              'Google Sheets / Airtable'
            ]
          },
          {
            title: 'Bénéfices',
            items: [
              'Données toujours à jour',
              'Segmentation automatique',
              'Triggers basés sur les actions CRM',
              'Reporting unifié'
            ]
          }
        ],
        conclusion: 'Livrable : Intégrations fonctionnelles + documentation technique.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 300,
        features: ['1 intégration simple', 'Sync contacts de base', 'Documentation'],
        featuresEn: ['1 simple integration', 'Basic contact sync', 'Documentation'],
        recommended: 'Une seule source de données',
        recommendedEn: 'Single data source'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 600,
        features: ['2-3 intégrations', 'Sync bi-directionnelle', 'Mapping de champs personnalisé', 'Tests & validation'],
        featuresEn: ['2-3 integrations', 'Bi-directional sync', 'Custom field mapping', 'Tests & validation'],
        recommended: 'Plusieurs outils',
        recommendedEn: 'Multiple tools',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1200,
        features: ['Intégrations illimitées', 'Workflows avancés (Zapier/Make)', 'API custom si nécessaire', 'Support 1 mois'],
        featuresEn: ['Unlimited integrations', 'Advanced workflows (Zapier/Make)', 'Custom API if needed', '1 month support'],
        recommended: 'Écosystème complexe',
        recommendedEn: 'Complex ecosystem'
      }
    ]
  },
  {
    id: 'email-segmentation',
    title: 'C. Segmentation & Audiences',
    titleEn: 'C. Segmentation & Audiences',
    description: 'Création de segments précis basés sur le comportement, la démographie et l\'engagement.',
    descriptionEn: 'Creation of precise segments based on behavior, demographics and engagement.',
    icon: '👥',
    detailedInfo: {
      title: 'Segmentation - C\'est quoi exactement ?',
      content: {
        intro: 'Des segments intelligents pour envoyer le bon message à la bonne personne.',
        sections: [
          {
            title: 'Types de segments',
            items: [
              'Comportementaux (clics, ouvertures, achats)',
              'Démographiques (âge, localisation, secteur)',
              'Engagement (actifs, dormants, VIP)',
              'Cycle de vie (prospects, clients, churned)',
              'Personnalisés selon vos critères'
            ]
          },
          {
            title: 'Ce que nous livrons',
            items: [
              'Stratégie de segmentation',
              'Création des segments dans votre outil',
              'Documentation des critères',
              'Recommandations de contenu par segment'
            ]
          }
        ],
        conclusion: 'Une segmentation pertinente = +760% de revenus en moyenne.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 200,
        features: ['5 segments de base', 'Critères simples', 'Documentation'],
        featuresEn: ['5 basic segments', 'Simple criteria', 'Documentation'],
        recommended: 'Segmentation basique',
        recommendedEn: 'Basic segmentation'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 400,
        features: ['10-15 segments', 'Critères avancés', 'Segments dynamiques', 'Stratégie personnalisée'],
        featuresEn: ['10-15 segments', 'Advanced criteria', 'Dynamic segments', 'Custom strategy'],
        recommended: 'Personnalisation poussée',
        recommendedEn: 'Advanced personalization',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 700,
        features: ['Segments illimités', 'Scoring comportemental', 'Segments prédictifs', 'Accompagnement continu'],
        featuresEn: ['Unlimited segments', 'Behavioral scoring', 'Predictive segments', 'Ongoing support'],
        recommended: 'Data-driven marketing',
        recommendedEn: 'Data-driven marketing'
      }
    ]
  },
  {
    id: 'email-contacts',
    title: 'D. Acquisition de Contacts',
    titleEn: 'D. Contact Acquisition',
    description: 'Achat de contacts RGPD-compliant basé sur des critères précis (fonction, taille entreprise, secteur...).',
    descriptionEn: 'GDPR-compliant contact acquisition based on precise criteria (role, company size, industry...).',
    icon: '📇',
    isOneOff: true,
    detailedInfo: {
      title: 'Acquisition de Contacts - C\'est quoi exactement ?',
      content: {
        intro: 'Enrichissement de votre base avec des contacts qualifiés et RGPD-compliant.',
        sections: [
          {
            title: 'Critères de ciblage',
            items: [
              'Fonction / Titre du poste',
              'Taille de l\'entreprise',
              'Secteur d\'activité',
              'Localisation géographique',
              'Technologies utilisées',
              'Signaux d\'intention'
            ]
          },
          {
            title: 'Ce que nous garantissons',
            items: [
              'Contacts opt-in RGPD',
              'Vérification des emails',
              'Données enrichies (LinkedIn, etc.)',
              'Remplacement des bounces'
            ]
          }
        ],
        conclusion: 'Prix indicatif - ajusté selon les critères et le volume.'
      }
    },
    levels: [
      {
        name: '500 contacts',
        nameEn: '500 contacts',
        price: 500,
        features: ['500 contacts vérifiés', 'Critères de base', 'Format CSV/Excel', 'Remplacement bounces'],
        featuresEn: ['500 verified contacts', 'Basic criteria', 'CSV/Excel format', 'Bounce replacement'],
        recommended: 'Test ou petite campagne',
        recommendedEn: 'Test or small campaign'
      },
      {
        name: '2000 contacts',
        nameEn: '2000 contacts',
        price: 1500,
        features: ['2000 contacts vérifiés', 'Critères avancés', 'Données enrichies', 'Import direct'],
        featuresEn: ['2000 verified contacts', 'Advanced criteria', 'Enriched data', 'Direct import'],
        recommended: 'Campagne moyenne',
        recommendedEn: 'Medium campaign',
        popular: true
      },
      {
        name: '5000+ contacts',
        nameEn: '5000+ contacts',
        price: 3000,
        priceNote: 'À partir de',
        priceNoteEn: 'Starting from',
        features: ['5000+ contacts', 'Critères sur-mesure', 'Données premium', 'Segmentation incluse', 'Accompagnement'],
        featuresEn: ['5000+ contacts', 'Custom criteria', 'Premium data', 'Segmentation included', 'Support'],
        recommended: 'Volume important',
        recommendedEn: 'High volume'
      }
    ]
  },
  {
    id: 'email-content',
    title: 'E. Création de Contenu',
    titleEn: 'E. Content Creation',
    description: 'Rédaction et design d\'emails qui captent l\'attention et génèrent des actions.',
    descriptionEn: 'Writing and designing emails that capture attention and drive action.',
    icon: '✍️',
    detailedInfo: {
      title: 'Création de Contenu - C\'est quoi exactement ?',
      content: {
        intro: 'Des emails qui convertissent grâce à un copywriting expert et un design professionnel.',
        sections: [
          {
            title: 'Ce que nous créons',
            items: [
              'Copywriting persuasif',
              'Design responsive',
              'Templates personnalisés',
              'Séquences automatisées',
              'Tests A/B'
            ]
          },
          {
            title: 'Types d\'emails',
            items: [
              'Newsletters',
              'Emails de vente',
              'Séquences de nurturing',
              'Emails transactionnels',
              'Campagnes promotionnelles'
            ]
          }
        ],
        conclusion: 'Un bon email = bon copywriting + design adapté mobile.'
      }
    },
    levels: [
      {
        name: 'À la carte',
        nameEn: 'À la carte',
        price: 150,
        priceNote: 'Par email',
        priceNoteEn: 'Per email',
        features: ['1 email copy + design', 'Révisions incluses', 'Format responsive', 'Livraison HTML'],
        featuresEn: ['1 email copy + design', 'Revisions included', 'Responsive format', 'HTML delivery'],
        recommended: 'Besoins ponctuels',
        recommendedEn: 'Occasional needs'
      },
      {
        name: 'Pack 5',
        nameEn: 'Pack 5',
        price: 600,
        features: ['5 emails', 'Cohérence éditoriale', 'A/B testing recommandé', 'Support intégration'],
        featuresEn: ['5 emails', 'Editorial consistency', 'A/B testing recommended', 'Integration support'],
        recommended: 'Séquence courte',
        recommendedEn: 'Short sequence',
        popular: true
      },
      {
        name: 'Pack 10',
        nameEn: 'Pack 10',
        price: 1000,
        features: ['10 emails', 'Stratégie de séquence', 'Templates réutilisables', 'Optimisation continue'],
        featuresEn: ['10 emails', 'Sequence strategy', 'Reusable templates', 'Continuous optimization'],
        recommended: 'Funnel complet',
        recommendedEn: 'Complete funnel'
      }
    ]
  },
  {
    id: 'email-campaigns',
    title: 'F. Gestion de Campagnes',
    titleEn: 'F. Campaign Management',
    description: 'Exécution complète de vos campagnes email avec A/B testing et optimisation continue.',
    descriptionEn: 'Complete execution of your email campaigns with A/B testing and continuous optimization.',
    icon: '📧',
    detailedInfo: {
      title: 'Gestion de Campagnes - C\'est quoi exactement ?',
      content: {
        intro: 'Nous prenons en charge la gestion complète de vos campagnes email.',
        sections: [
          {
            title: 'Ce que nous gérons',
            items: [
              'Planification du calendrier',
              'Programmation des envois',
              'A/B testing systématique',
              'Monitoring de la délivrabilité',
              'Gestion des désabonnements'
            ]
          },
          {
            title: 'Optimisation continue',
            items: [
              'Analyse des taux d\'ouverture',
              'Optimisation des objets',
              'Test des heures d\'envoi',
              'Amélioration des CTA'
            ]
          }
        ],
        conclusion: 'Focus sur les résultats, pas sur l\'opérationnel.'
      }
    },
    levels: [
      {
        name: 'Ponctuel',
        nameEn: 'One-time',
        price: 200,
        priceNote: 'Par campagne',
        priceNoteEn: 'Per campaign',
        features: ['1 campagne', 'Setup & envoi', 'Rapport de performance', 'Recommandations'],
        featuresEn: ['1 campaign', 'Setup & send', 'Performance report', 'Recommendations'],
        recommended: 'Campagnes occasionnelles',
        recommendedEn: 'Occasional campaigns'
      },
      {
        name: 'Mensuel',
        nameEn: 'Monthly',
        price: 500,
        features: ['4 campagnes/mois', 'Calendrier éditorial', 'A/B testing', 'Reporting mensuel'],
        featuresEn: ['4 campaigns/month', 'Editorial calendar', 'A/B testing', 'Monthly reporting'],
        recommended: 'Rythme régulier',
        recommendedEn: 'Regular pace',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1000,
        features: ['Campagnes illimitées', 'Stratégie complète', 'Optimisation avancée', 'Call mensuel', 'Support prioritaire'],
        featuresEn: ['Unlimited campaigns', 'Complete strategy', 'Advanced optimization', 'Monthly call', 'Priority support'],
        recommended: 'Volume important',
        recommendedEn: 'High volume'
      }
    ]
  },
  {
    id: 'email-analytics',
    title: 'G. Analytics & Reporting',
    titleEn: 'G. Analytics & Reporting',
    description: 'Rapports de performance détaillés avec insights actionnables pour optimiser votre stratégie.',
    descriptionEn: 'Detailed performance reports with actionable insights to optimize your strategy.',
    icon: '📊',
    detailedInfo: {
      title: 'Analytics & Reporting - C\'est quoi exactement ?',
      content: {
        intro: 'Des données claires pour prendre les bonnes décisions.',
        sections: [
          {
            title: 'Métriques suivies',
            items: [
              'Taux d\'ouverture et de clic',
              'Taux de conversion',
              'Revenus attribués',
              'Délivrabilité',
              'Croissance de la liste',
              'Engagement par segment'
            ]
          },
          {
            title: 'Ce que vous recevez',
            items: [
              'Dashboard personnalisé',
              'Rapports commentés',
              'Benchmarks sectoriels',
              'Recommandations d\'optimisation'
            ]
          }
        ],
        conclusion: 'Les données au service de la performance.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 100,
        features: ['Rapport mensuel', 'KPIs clés', 'Comparaison M-1'],
        featuresEn: ['Monthly report', 'Key KPIs', 'M-1 comparison'],
        recommended: 'Suivi basique',
        recommendedEn: 'Basic tracking'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 250,
        features: ['Dashboard Looker Studio', 'Rapports hebdomadaires', 'Analyse par segment', 'Recommandations'],
        featuresEn: ['Looker Studio dashboard', 'Weekly reports', 'Segment analysis', 'Recommendations'],
        recommended: 'Vision complète',
        recommendedEn: 'Complete overview',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 500,
        features: ['Dashboard sur-mesure', 'Attribution avancée', 'Intégration revenus', 'Call mensuel', 'Alertes automatiques'],
        featuresEn: ['Custom dashboard', 'Advanced attribution', 'Revenue integration', 'Monthly call', 'Automated alerts'],
        recommended: 'Data-driven',
        recommendedEn: 'Data-driven'
      }
    ]
  }
];
