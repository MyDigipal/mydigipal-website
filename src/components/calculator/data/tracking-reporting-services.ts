// Tracking & Reporting Services
// This section is shown proactively when user selects Google Ads, Paid Social, Emailing, or SEO

export interface TrackingService {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  detailedInfo: string;
  detailedInfoFr: string;
  whyImportant: string;
  whyImportantFr: string;
  price: number;
  priceNote?: string;
  icon: string;
}

export const trackingReportingConfig = {
  id: 'tracking-reporting',
  name: 'Tracking & Reporting',
  nameFr: 'Tracking & Reporting',
  icon: '📊',
  color: '#06b6d4',
  colorClass: 'cyan',
  description: 'Measure, analyze, and optimize your marketing performance',
  descriptionFr: 'Mesurez, analysez et optimisez vos performances marketing'
};

// Audit option at the top
export const trackingAuditOption = {
  id: 'tracking-audit',
  title: 'A. Tracking Audit',
  titleFr: 'A. Audit Tracking',
  description: 'Complete analysis of your current tracking setup',
  descriptionFr: 'Analyse complète de votre setup tracking actuel',
  detailedInfo: 'Complete audit of your tracking setup including GA4, GTM, conversion tracking, cookie consent, and data flow verification. We identify what\'s missing and what needs improvement.',
  detailedInfoFr: 'Audit complet de votre setup tracking incluant GA4, GTM, tracking des conversions, consentement cookies, et vérification du flux de données. On identifie ce qui manque et ce qui doit être amélioré.',
  whyImportant: 'Without proper tracking, you\'re flying blind. An audit reveals hidden issues that could be costing you money.',
  whyImportantFr: 'Sans tracking correct, vous naviguez à l\'aveugle. Un audit révèle des problèmes cachés qui peuvent vous coûter cher.',
  price: 300,
  icon: '🔍'
};

export const trackingServices: TrackingService[] = [
  {
    id: 'ga4-setup',
    title: 'GA4 Installation / Revision',
    titleFr: 'Installation / Révision GA4',
    description: 'Set up or optimize your Google Analytics 4',
    descriptionFr: 'Mise en place ou optimisation de Google Analytics 4',
    detailedInfo: 'Complete GA4 setup including property configuration, data streams, enhanced measurement, custom events, and e-commerce tracking if applicable.',
    detailedInfoFr: 'Setup GA4 complet incluant configuration de la propriété, data streams, mesure améliorée, événements personnalisés, et tracking e-commerce si applicable.',
    whyImportant: 'GA4 is the foundation of your marketing measurement. Without it, you can\'t understand user behavior or attribute conversions.',
    whyImportantFr: 'GA4 est la fondation de votre mesure marketing. Sans lui, impossible de comprendre le comportement utilisateur ou d\'attribuer les conversions.',
    price: 400,
    icon: '📈'
  },
  {
    id: 'conversion-tracking',
    title: 'Conversion Points Setup',
    titleFr: 'Mise en place des Points de Conversion',
    description: 'Track form submissions, purchases, calls, and key actions',
    descriptionFr: 'Trackez soumissions de formulaires, achats, appels et actions clés',
    detailedInfo: 'Configuration of all conversion tracking: form submissions, purchases, phone calls, downloads, video views, scroll depth, and custom goals aligned with your KPIs.',
    detailedInfoFr: 'Configuration de tout le tracking des conversions : soumissions de formulaires, achats, appels téléphoniques, téléchargements, vues vidéo, profondeur de scroll, et objectifs personnalisés alignés sur vos KPIs.',
    whyImportant: 'If you don\'t track conversions, you can\'t optimize your campaigns. You\'re wasting ad budget on guesswork.',
    whyImportantFr: 'Si vous ne trackez pas les conversions, vous ne pouvez pas optimiser vos campagnes. Vous gaspillez votre budget pub à l\'aveugle.',
    price: 350,
    icon: '🎯'
  },
  {
    id: 'cookie-consent',
    title: 'Cookie Banner + Consent Tracking',
    titleFr: 'Cookie Banner + Tracking du Consentement',
    description: 'GDPR-compliant cookie management with Google Consent Mode v2',
    descriptionFr: 'Gestion des cookies conforme RGPD avec Google Consent Mode v2',
    detailedInfo: 'Implementation of a GDPR/CCPA compliant cookie banner with Google Consent Mode v2 integration. Ensures your tracking respects user choices while maximizing data collection.',
    detailedInfoFr: 'Implémentation d\'une bannière cookies conforme RGPD/CCPA avec intégration Google Consent Mode v2. Assure que votre tracking respecte les choix utilisateurs tout en maximisant la collecte de données.',
    whyImportant: 'Without proper consent management, you risk legal issues AND lose up to 30% of your conversion data. Consent Mode v2 is now mandatory for Google Ads.',
    whyImportantFr: 'Sans gestion du consentement correcte, vous risquez des problèmes légaux ET perdez jusqu\'à 30% de vos données de conversion. Consent Mode v2 est maintenant obligatoire pour Google Ads.',
    price: 300,
    icon: '🍪'
  },
  {
    id: 'crm-integration',
    title: 'CRM Integration',
    titleFr: 'Intégration CRM',
    description: 'Connect your analytics with your CRM for full-funnel visibility',
    descriptionFr: 'Connectez vos analytics avec votre CRM pour une visibilité full-funnel',
    detailedInfo: 'Integration between your marketing tools and CRM (HubSpot, Salesforce, Pipedrive...). Track leads from first touch to closed deal. Enable offline conversion import.',
    detailedInfoFr: 'Intégration entre vos outils marketing et CRM (HubSpot, Salesforce, Pipedrive...). Suivez les leads du premier contact à la vente conclue. Activez l\'import des conversions offline.',
    whyImportant: 'Marketing ends at the lead. Without CRM integration, you don\'t know which campaigns drive revenue, not just leads.',
    whyImportantFr: 'Le marketing s\'arrête au lead. Sans intégration CRM, vous ne savez pas quelles campagnes génèrent du revenu, pas juste des leads.',
    price: 500,
    priceNote: 'Varies by CRM',
    icon: '🔗'
  },
  {
    id: 'reporting-dashboard',
    title: 'Multi-Channel Reporting Dashboard',
    titleFr: 'Dashboard Reporting Multicanal',
    description: 'Custom dashboard combining all your marketing data',
    descriptionFr: 'Dashboard personnalisé regroupant toutes vos données marketing',
    detailedInfo: 'Custom dashboard built in Looker Studio, Power BI, or Tableau. Combines data from GA4, Google Ads, Meta Ads, LinkedIn, CRM, and more. Automated refresh, custom KPIs, and executive summary.',
    detailedInfoFr: 'Dashboard sur-mesure construit dans Looker Studio, Power BI ou Tableau. Combine les données de GA4, Google Ads, Meta Ads, LinkedIn, CRM, et plus. Rafraîchissement automatique, KPIs personnalisés, et résumé exécutif.',
    whyImportant: 'Scattered data = bad decisions. A unified dashboard shows the full picture and saves hours of manual reporting.',
    whyImportantFr: 'Données éparpillées = mauvaises décisions. Un dashboard unifié montre le tableau complet et économise des heures de reporting manuel.',
    price: 600,
    icon: '📊'
  }
];

// Popup content when user selects ads/marketing services without tracking
export const trackingPopupContent = {
  title: 'Don\'t forget your tracking!',
  titleFr: 'N\'oubliez pas votre tracking !',
  message: 'You\'ve selected marketing services but no tracking setup. Without proper tracking, you won\'t be able to measure your ROI or optimize your campaigns effectively.',
  messageFr: 'Vous avez sélectionné des services marketing mais pas de tracking. Sans tracking correct, vous ne pourrez pas mesurer votre ROI ni optimiser vos campagnes efficacement.',
  benefits: [
    'Know exactly which campaigns drive conversions',
    'Stop wasting budget on underperforming ads',
    'Make data-driven decisions, not guesses',
    'Prove marketing ROI to stakeholders'
  ],
  benefitsFr: [
    'Savoir exactement quelles campagnes génèrent des conversions',
    'Arrêter de gaspiller du budget sur des pubs sous-performantes',
    'Prendre des décisions basées sur la data, pas des suppositions',
    'Prouver le ROI marketing aux décideurs'
  ],
  ctaAdd: 'Add tracking to my quote',
  ctaAddFr: 'Ajouter le tracking à mon devis',
  ctaSkip: 'Continue without tracking',
  ctaSkipFr: 'Continuer sans tracking'
};

// Services that should trigger tracking suggestion
export const servicesThatNeedTracking = ['seo', 'google-ads', 'paid-social', 'emailing'];
