import type { ServiceItem } from '../types';

// REFONTE : 7 sous-services → 3 packages simplifiés
// Avant : Setup, CRM, Segmentation, Contacts, Contenu, Campagnes, Analytics
// Après : Setup & Configuration, Campaign Management, Full Service

export const emailingServices: ServiceItem[] = [
  {
    id: 'email-management-package',
    title: 'A. Gestion de Campagnes',
    titleEn: 'A. Campaign Management',
    setupNote: { fr: 'Frais de setup possibles selon contexte (DNS, plateforme, CRM) - on en discute en kick-off.', en: 'Setup fees may apply depending on context (DNS, platform, CRM) - we discuss at kick-off.' },
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
    detailedInfoEn: {
      title: 'Campaign Management - What exactly is it?',
      content: {
        intro: 'We handle the full execution of your email campaigns so you can focus on your business.',
        sections: [
          {
            title: 'What\'s included',
            items: [
              'Monthly editorial calendar',
              'Copywriting (subject, content, CTA)',
              'Responsive email design',
              'Campaign scheduling and sending',
              'Systematic A/B testing (subjects, content, timing)',
              'Deliverability monitoring',
              'Unsubscribe and list management',
              'Monthly reporting with recommendations'
            ]
          },
          {
            title: 'Types of emails managed',
            items: [
              'Regular newsletters',
              'Sales emails and promotions',
              'Automated nurturing sequences',
              'Transactional emails',
              'Event-based campaigns'
            ]
          }
        ],
        conclusion: 'Result: +760% revenue on average through relevant segmentation.'
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
    title: 'B. Acquisition de Contacts',
    titleEn: 'B. Contact Acquisition',
    description: "Enrichissement de votre base avec des contacts qualifiés et RGPD-compliant : email seul, email enrichi par IA ou numéro de téléphone.",
    descriptionEn: 'Database enrichment with qualified, GDPR-compliant contacts: email only, AI-enriched email, or phone number.',
    icon: '📇',
    isOneOff: true,
    detailedInfo: {
      title: "Acquisition de Contacts - C'est quoi exactement ?",
      content: {
        intro: 'Des contacts vérifiés et qualifiés pour alimenter tes campagnes email, outreach LinkedIn ou campagnes téléphoniques. Prix unitaire dégressif selon le volume.',
        sections: [
          {
            title: 'Types de contacts disponibles',
            items: [
              "📧 Email : adresse professionnelle vérifiée (bounce rate < 5%)",
              "🤖 Email + IA : email + enrichissement IA (personnalisation automatique du message)",
              "📞 Téléphone : numéro direct vérifié (pour campagnes cold call / SMS)"
            ]
          },
          {
            title: 'Critères de ciblage disponibles',
            items: [
              'Fonction / Titre du poste (CEO, CMO, CTO...)',
              "Taille de l'entreprise (PME, ETI, grands comptes)",
              "Secteur d'activité et sous-secteur",
              'Localisation géographique',
              'Technologies utilisées (technographics)',
              "Signaux d'intention d'achat"
            ]
          },
          {
            title: 'Ce que nous garantissons',
            items: [
              'Contacts opt-in RGPD-compliant',
              'Données vérifiées (bounce rate < 5%)',
              'Données enrichies (LinkedIn, company data)',
              'Remplacement des bounces',
              'Format CSV/Excel ou import direct'
            ]
          }
        ],
        conclusion: 'Prix dégressif : tarif unitaire plus avantageux à partir de 500 contacts puis de 2500 contacts.'
      }
    },
    detailedInfoEn: {
      title: 'Contact Acquisition - What exactly is it?',
      content: {
        intro: 'Verified, qualified contacts to fuel your email campaigns, LinkedIn outreach or phone campaigns. Volume-based discount on the unit price.',
        sections: [
          {
            title: 'Available contact types',
            items: [
              '📧 Email: verified professional address (bounce rate < 5%)',
              '🤖 Email + AI: email + AI enrichment (automatic message personalization)',
              '📞 Phone: verified direct number (for cold call / SMS campaigns)'
            ]
          },
          {
            title: 'Available targeting criteria',
            items: [
              'Job function / Title (CEO, CMO, CTO...)',
              'Company size (SMB, mid-market, enterprise)',
              'Industry and sub-industry',
              'Geographic location',
              'Technographics (tech stack)',
              'Buying intent signals'
            ]
          },
          {
            title: 'What we guarantee',
            items: [
              'GDPR-compliant opt-in contacts',
              'Verified data (bounce rate < 5%)',
              'Enriched data (LinkedIn, company data)',
              'Bounce replacement',
              'CSV/Excel format or direct import'
            ]
          }
        ],
        conclusion: 'Volume discount: better unit price from 500 contacts and again from 2,500 contacts.'
      }
    },
    // Single placeholder level - real pricing computed dynamically via CONTACT_PRICING_CONFIG
    levels: [
      {
        name: 'Configurer',
        nameEn: 'Configure',
        price: 0,
        priceNote: 'selon type + volume',
        priceNoteEn: 'based on type + volume',
        features: [
          '📧 Email seul : dès 0.06€/contact',
          '🤖 Email + IA personnalisée : dès 0.03€/contact',
          '📞 Téléphone direct : dès 0.51€/contact',
          'Tarif dégressif à partir de 500 et 2500 contacts',
          'Remplacement bounces inclus'
        ],
        featuresEn: [
          '📧 Email only: from €0.06/contact',
          '🤖 Email + AI personalization: from €0.03/contact',
          '📞 Direct phone: from €0.51/contact',
          'Volume discount at 500 and 2500 contacts',
          'Bounce replacement included'
        ]
      }
    ]
  }
];

// Pricing grid for Contact Acquisition service
// 3 tiers basés sur le volume, avec prix unitaire dégressif
export type ContactType = 'email' | 'email-ai' | 'phone';

export const CONTACT_PRICING_CONFIG = {
  tiers: [
    { maxVolume: 500, label: '< 500 contacts', labelEn: '< 500 contacts' },
    { maxVolume: 2500, label: '500 - 2500 contacts', labelEn: '500 - 2500 contacts' },
    { maxVolume: Infinity, label: '> 2500 contacts', labelEn: '> 2500 contacts' }
  ],
  prices: {
    email:      [0.10, 0.08, 0.06],
    'email-ai': [0.05, 0.04, 0.03],
    phone:      [0.80, 0.64, 0.51]
  } as Record<ContactType, number[]>,
  labels: {
    email:      { fr: '📧 Email seul',                en: '📧 Email only' },
    'email-ai': { fr: '🤖 Email + IA personnalisée',  en: '🤖 Email + AI personalization' },
    phone:      { fr: '📞 Téléphone direct',          en: '📞 Direct phone' }
  } as Record<ContactType, { fr: string; en: string }>,
  descriptions: {
    email:      { fr: 'Adresse email professionnelle vérifiée (bounce < 5%)', en: 'Verified professional email address (bounce < 5%)' },
    'email-ai': { fr: 'Email + enrichissement IA pour personnaliser chaque message (tonalité, accroche, contexte)', en: 'Email + AI enrichment to personalize each message (tone, hook, context)' },
    phone:      { fr: 'Numéro direct vérifié pour cold call ou SMS', en: 'Verified direct phone number for cold call or SMS' }
  } as Record<ContactType, { fr: string; en: string }>
} as const;

// Helper : retourne le prix unitaire selon volume + type
export function getContactUnitPrice(type: ContactType, volume: number): number {
  const tierIdx = CONTACT_PRICING_CONFIG.tiers.findIndex(t => volume < t.maxVolume);
  const idx = tierIdx === -1 ? CONTACT_PRICING_CONFIG.tiers.length - 1 : tierIdx;
  return CONTACT_PRICING_CONFIG.prices[type][idx];
}

// Helper : prix total selon type + volume
export function getContactTotalPrice(type: ContactType, volume: number): number {
  if (!volume || volume <= 0) return 0;
  return Math.round(getContactUnitPrice(type, volume) * volume);
}
