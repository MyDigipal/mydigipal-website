import type { ServiceItem } from '../types';

export const emailingServices: ServiceItem[] = [
  {
    id: 'email-setup',
    title: 'A. Email Software Setup',
    description: 'Configuration de votre plateforme email (Mailchimp, Klaviyo, HubSpot, Brevo...) pour que votre équipe soit autonome.',
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
        price: 400,
        features: ['Configuration plateforme', 'DNS & délivrabilité', '2 templates de base', 'Documentation'],
        recommended: 'Démarrage simple'
      },
      {
        name: 'Avancé',
        price: 800,
        features: ['Configuration complète', '5 templates personnalisés', 'Formulaires avancés', '3 automations', 'Formation 2h'],
        recommended: 'Setup complet',
        popular: true
      },
      {
        name: 'Premium',
        price: 1500,
        features: ['Setup sur-mesure', 'Templates illimités', 'Automations avancées', 'Intégrations tierces', 'Formation 4h + support 1 mois'],
        recommended: 'Besoins complexes'
      }
    ]
  },
  {
    id: 'email-crm',
    title: 'B. Intégration CRM & Base de données',
    description: 'Connectez votre système email avec votre CRM et vos sources de données pour une synchronisation parfaite.',
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
        price: 300,
        features: ['1 intégration simple', 'Sync contacts de base', 'Documentation'],
        recommended: 'Une seule source de données'
      },
      {
        name: 'Avancé',
        price: 600,
        features: ['2-3 intégrations', 'Sync bi-directionnelle', 'Mapping de champs personnalisé', 'Tests & validation'],
        recommended: 'Plusieurs outils',
        popular: true
      },
      {
        name: 'Premium',
        price: 1200,
        features: ['Intégrations illimitées', 'Workflows avancés (Zapier/Make)', 'API custom si nécessaire', 'Support 1 mois'],
        recommended: 'Écosystème complexe'
      }
    ]
  },
  {
    id: 'email-segmentation',
    title: 'C. Segmentation & Audiences',
    description: 'Création de segments précis basés sur le comportement, la démographie et l\'engagement.',
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
        price: 200,
        features: ['5 segments de base', 'Critères simples', 'Documentation'],
        recommended: 'Segmentation basique'
      },
      {
        name: 'Avancé',
        price: 400,
        features: ['10-15 segments', 'Critères avancés', 'Segments dynamiques', 'Stratégie personnalisée'],
        recommended: 'Personnalisation poussée',
        popular: true
      },
      {
        name: 'Premium',
        price: 700,
        features: ['Segments illimités', 'Scoring comportemental', 'Segments prédictifs', 'Accompagnement continu'],
        recommended: 'Data-driven marketing'
      }
    ]
  },
  {
    id: 'email-contacts',
    title: 'D. Acquisition de Contacts',
    description: 'Achat de contacts RGPD-compliant basé sur des critères précis (fonction, taille entreprise, secteur...).',
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
        price: 500,
        features: ['500 contacts vérifiés', 'Critères de base', 'Format CSV/Excel', 'Remplacement bounces'],
        recommended: 'Test ou petite campagne'
      },
      {
        name: '2000 contacts',
        price: 1500,
        features: ['2000 contacts vérifiés', 'Critères avancés', 'Données enrichies', 'Import direct'],
        recommended: 'Campagne moyenne',
        popular: true
      },
      {
        name: '5000+ contacts',
        price: 3000,
        priceNote: 'À partir de',
        features: ['5000+ contacts', 'Critères sur-mesure', 'Données premium', 'Segmentation incluse', 'Accompagnement'],
        recommended: 'Volume important'
      }
    ]
  },
  {
    id: 'email-content',
    title: 'E. Création de Contenu',
    description: 'Rédaction et design d\'emails qui captent l\'attention et génèrent des actions.',
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
        price: 150,
        priceNote: 'Par email',
        features: ['1 email copy + design', 'Révisions incluses', 'Format responsive', 'Livraison HTML'],
        recommended: 'Besoins ponctuels'
      },
      {
        name: 'Pack 5',
        price: 600,
        features: ['5 emails', 'Cohérence éditoriale', 'A/B testing recommandé', 'Support intégration'],
        recommended: 'Séquence courte',
        popular: true
      },
      {
        name: 'Pack 10',
        price: 1000,
        features: ['10 emails', 'Stratégie de séquence', 'Templates réutilisables', 'Optimisation continue'],
        recommended: 'Funnel complet'
      }
    ]
  },
  {
    id: 'email-campaigns',
    title: 'F. Gestion de Campagnes',
    description: 'Exécution complète de vos campagnes email avec A/B testing et optimisation continue.',
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
        price: 200,
        priceNote: 'Par campagne',
        features: ['1 campagne', 'Setup & envoi', 'Rapport de performance', 'Recommandations'],
        recommended: 'Campagnes occasionnelles'
      },
      {
        name: 'Mensuel',
        price: 500,
        features: ['4 campagnes/mois', 'Calendrier éditorial', 'A/B testing', 'Reporting mensuel'],
        recommended: 'Rythme régulier',
        popular: true
      },
      {
        name: 'Premium',
        price: 1000,
        features: ['Campagnes illimitées', 'Stratégie complète', 'Optimisation avancée', 'Call mensuel', 'Support prioritaire'],
        recommended: 'Volume important'
      }
    ]
  },
  {
    id: 'email-analytics',
    title: 'G. Analytics & Reporting',
    description: 'Rapports de performance détaillés avec insights actionnables pour optimiser votre stratégie.',
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
        price: 100,
        features: ['Rapport mensuel', 'KPIs clés', 'Comparaison M-1'],
        recommended: 'Suivi basique'
      },
      {
        name: 'Avancé',
        price: 250,
        features: ['Dashboard Looker Studio', 'Rapports hebdomadaires', 'Analyse par segment', 'Recommandations'],
        recommended: 'Vision complète',
        popular: true
      },
      {
        name: 'Premium',
        price: 500,
        features: ['Dashboard sur-mesure', 'Attribution avancée', 'Intégration revenus', 'Call mensuel', 'Alertes automatiques'],
        recommended: 'Data-driven'
      }
    ]
  }
];
