import type { ServiceItem } from '../types';

// REFONTE : 7 sous-services → 3 packages simplifiés
// Avant : Setup, CRM, Segmentation, Contacts, Contenu, Campagnes, Analytics
// Après : Setup & Configuration, Campaign Management, Full Service

export const emailingServices: ServiceItem[] = [
  {
    id: 'email-setup-package',
    title: 'A. Setup & Configuration',
    titleEn: 'A. Setup & Configuration',
    description: 'Configuration complète de votre plateforme email : outil, DNS, CRM, segmentation et formation de votre équipe.',
    descriptionEn: 'Complete email platform setup: tool, DNS, CRM, segmentation and team training.',
    icon: '⚙️',
    isOneOff: true,
    detailedInfo: {
      title: 'Setup & Configuration - C\'est quoi exactement ?',
      content: {
        intro: 'Mise en place complète de votre infrastructure email pour être opérationnel rapidement.',
        sections: [
          {
            title: 'Ce qui est inclus',
            items: [
              'Choix et configuration de la plateforme (Mailchimp, Klaviyo, HubSpot, Brevo...)',
              'Paramétrage DNS complet (SPF, DKIM, DMARC) pour une délivrabilité optimale',
              'Intégration CRM et synchronisation bidirectionnelle des données',
              'Création de segments d\'audience (comportementaux, démographiques, engagement)',
              'Templates email personnalisés à votre charte graphique',
              'Formulaires d\'inscription et pop-ups',
              'Configuration des automations de base (welcome, abandon panier...)',
              'Formation de votre équipe (1-2h)'
            ]
          },
          {
            title: 'Plateformes supportées',
            items: [
              'Mailchimp, Klaviyo, HubSpot, Brevo (Sendinblue)',
              'ActiveCampaign, Lemlist, Instantly',
              'Intégrations : Salesforce, Pipedrive, Google Sheets, Shopify...'
            ]
          }
        ],
        conclusion: 'Livrable : Plateforme configurée, intégrée et documentée. Votre équipe est autonome.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 500,
        features: [
          'Configuration plateforme + DNS',
          '1 intégration CRM simple',
          '3 templates de base',
          '5 segments d\'audience',
          'Documentation'
        ],
        featuresEn: [
          'Platform configuration + DNS',
          '1 simple CRM integration',
          '3 basic templates',
          '5 audience segments',
          'Documentation'
        ],
        recommended: 'Démarrage simple, une seule source de données',
        recommendedEn: 'Simple start, single data source'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 1000,
        features: [
          'Configuration complète + DNS avancé',
          '2-3 intégrations CRM bidirectionnelles',
          '5 templates personnalisés',
          '10-15 segments dynamiques',
          '3 automations configurées',
          'Formation 2h + support 2 semaines'
        ],
        featuresEn: [
          'Complete configuration + advanced DNS',
          '2-3 bidirectional CRM integrations',
          '5 custom templates',
          '10-15 dynamic segments',
          '3 configured automations',
          '2h training + 2 weeks support'
        ],
        recommended: 'Setup complet pour croissance rapide',
        recommendedEn: 'Complete setup for rapid growth',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 2000,
        features: [
          'Setup sur-mesure intégral',
          'Intégrations illimitées (API custom si nécessaire)',
          'Templates illimités + design system email',
          'Segments avancés + scoring comportemental',
          'Automations avancées (nurturing, lifecycle)',
          'Formation 4h + support 1 mois'
        ],
        featuresEn: [
          'Full custom setup',
          'Unlimited integrations (custom API if needed)',
          'Unlimited templates + email design system',
          'Advanced segments + behavioral scoring',
          'Advanced automations (nurturing, lifecycle)',
          '4h training + 1 month support'
        ],
        recommended: 'Écosystème complexe, besoins avancés',
        recommendedEn: 'Complex ecosystem, advanced needs'
      }
    ]
  },
  {
    id: 'email-management-package',
    title: 'B. Gestion de Campagnes',
    titleEn: 'B. Campaign Management',
    description: 'Gestion complète de vos campagnes email : création de contenu, envoi, A/B testing, analytics et optimisation continue.',
    descriptionEn: 'Complete email campaign management: content creation, sending, A/B testing, analytics and continuous optimization.',
    icon: '📧',
    detailedInfo: {
      title: 'Gestion de Campagnes - C\'est quoi exactement ?',
      content: {
        intro: 'On prend en charge toute l\'exécution de vos campagnes email pour que vous vous concentriez sur votre business.',
        sections: [
          {
            title: 'Ce qui est inclus',
            items: [
              'Calendrier éditorial mensuel',
              'Rédaction du copywriting (objet, contenu, CTA)',
              'Design responsive des emails',
              'Programmation et envoi des campagnes',
              'A/B testing systématique (objets, contenus, heures)',
              'Monitoring de la délivrabilité',
              'Gestion des désabonnements et de la liste',
              'Reporting mensuel avec recommandations'
            ]
          },
          {
            title: 'Types d\'emails gérés',
            items: [
              'Newsletters régulières',
              'Emails de vente et promotions',
              'Séquences de nurturing automatisées',
              'Emails transactionnels',
              'Campagnes événementielles'
            ]
          }
        ],
        conclusion: 'Résultat : +760% de revenus en moyenne grâce à une segmentation pertinente.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 500,
        features: [
          '4 campagnes/mois',
          'Copywriting + design',
          'A/B testing basique',
          'Reporting mensuel',
          'Support email'
        ],
        featuresEn: [
          '4 campaigns/month',
          'Copywriting + design',
          'Basic A/B testing',
          'Monthly reporting',
          'Email support'
        ],
        recommended: 'Rythme régulier, budget maîtrisé',
        recommendedEn: 'Regular pace, controlled budget'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 800,
        features: [
          '8 campagnes/mois',
          'Copywriting + design premium',
          'A/B testing avancé',
          'Séquences automatisées',
          'Dashboard Looker Studio',
          'Call bi-mensuel'
        ],
        featuresEn: [
          '8 campaigns/month',
          'Premium copywriting + design',
          'Advanced A/B testing',
          'Automated sequences',
          'Looker Studio dashboard',
          'Bi-monthly call'
        ],
        recommended: 'Croissance et engagement',
        recommendedEn: 'Growth and engagement',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 1500,
        features: [
          'Campagnes illimitées',
          'Stratégie complète + calendrier',
          'Optimisation avancée + attribution',
          'Séquences lifecycle complètes',
          'Dashboard sur-mesure',
          'Call mensuel + support prioritaire'
        ],
        featuresEn: [
          'Unlimited campaigns',
          'Complete strategy + calendar',
          'Advanced optimization + attribution',
          'Complete lifecycle sequences',
          'Custom dashboard',
          'Monthly call + priority support'
        ],
        recommended: 'Volume important, stratégie data-driven',
        recommendedEn: 'High volume, data-driven strategy'
      }
    ]
  },
  {
    id: 'email-contacts-package',
    title: 'C. Acquisition de Contacts',
    titleEn: 'C. Contact Acquisition',
    description: 'Enrichissement de votre base avec des contacts qualifiés et RGPD-compliant, ciblés selon vos critères.',
    descriptionEn: 'Database enrichment with qualified, GDPR-compliant contacts targeted by your criteria.',
    icon: '📇',
    isOneOff: true,
    detailedInfo: {
      title: 'Acquisition de Contacts - C\'est quoi exactement ?',
      content: {
        intro: 'Des contacts vérifiés et qualifiés pour alimenter vos campagnes email et outreach.',
        sections: [
          {
            title: 'Critères de ciblage disponibles',
            items: [
              'Fonction / Titre du poste (CEO, CMO, CTO...)',
              'Taille de l\'entreprise (PME, ETI, grands comptes)',
              'Secteur d\'activité et sous-secteur',
              'Localisation géographique',
              'Technologies utilisées (technographics)',
              'Signaux d\'intention d\'achat'
            ]
          },
          {
            title: 'Ce que nous garantissons',
            items: [
              'Contacts opt-in RGPD-compliant',
              'Emails vérifiés (bounce rate < 5%)',
              'Données enrichies (LinkedIn, company data)',
              'Remplacement des bounces',
              'Format CSV/Excel ou import direct'
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
        features: [
          '500 contacts vérifiés',
          'Critères de base (fonction, secteur)',
          'Format CSV/Excel',
          'Remplacement bounces'
        ],
        featuresEn: [
          '500 verified contacts',
          'Basic criteria (role, industry)',
          'CSV/Excel format',
          'Bounce replacement'
        ],
        recommended: 'Test ou petite campagne',
        recommendedEn: 'Test or small campaign'
      },
      {
        name: '2000 contacts',
        nameEn: '2000 contacts',
        price: 1500,
        features: [
          '2000 contacts vérifiés',
          'Critères avancés (techno, taille)',
          'Données enrichies (LinkedIn)',
          'Import direct dans votre outil'
        ],
        featuresEn: [
          '2000 verified contacts',
          'Advanced criteria (tech, size)',
          'Enriched data (LinkedIn)',
          'Direct import into your tool'
        ],
        recommended: 'Campagne de prospection',
        recommendedEn: 'Prospecting campaign',
        popular: true
      },
      {
        name: '5000+ contacts',
        nameEn: '5000+ contacts',
        price: 3000,
        priceNote: 'À partir de',
        priceNoteEn: 'Starting from',
        features: [
          '5000+ contacts sur-mesure',
          'Critères personnalisés',
          'Données premium + signaux d\'intention',
          'Segmentation incluse',
          'Accompagnement stratégique'
        ],
        featuresEn: [
          '5000+ custom contacts',
          'Custom criteria',
          'Premium data + intent signals',
          'Segmentation included',
          'Strategic guidance'
        ],
        recommended: 'Volume important, outreach à grande échelle',
        recommendedEn: 'High volume, large-scale outreach'
      }
    ]
  }
];
