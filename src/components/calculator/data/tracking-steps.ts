// Étapes du parcours de tracking MyDigipal
// Source : propale Control AI, section Tracking
// Utilisé par TrackingJourney.tsx

export interface TrackingStep {
  id: string;
  nameFr: string;
  nameEn: string;
  type: 'one-off' | 'ongoing';
  color: 'indigo' | 'blue' | 'cyan' | 'emerald';
  icon: string;
  // Tagline / introduction (1 phrase)
  taglineFr: string;
  taglineEn: string;
  // Livrables
  deliverablesFr: string[];
  deliverablesEn: string[];
  // Si plusieurs options possibles (ex : Option A / Option B)
  optionsFr?: { label: string; description: string }[];
  optionsEn?: { label: string; description: string }[];
}

export const trackingSteps: TrackingStep[] = [
  {
    id: 'access',
    nameFr: 'Accès aux comptes',
    nameEn: 'Account Access',
    type: 'one-off',
    color: 'indigo',
    icon: '🔑',
    taglineFr: "Avant toute intervention, on a besoin d'accéder aux plateformes pour comprendre l'état actuel.",
    taglineEn: "Before any intervention, we need access to platforms to understand the current state.",
    deliverablesFr: [
      "Google Tag Manager (GTM) : container existant ou création",
      "Google Analytics 4 (GA4) : propriété actuelle",
      "Comptes publicitaires : Google Ads, Meta, LinkedIn, TikTok, Reddit, X",
      "Search Console, Bing Webmaster Tools",
      "Accès en lecture aux CRM et outils analytics existants"
    ],
    deliverablesEn: [
      "Google Tag Manager (GTM): existing container or creation",
      "Google Analytics 4 (GA4): current property",
      "Ad accounts: Google Ads, Meta, LinkedIn, TikTok, Reddit, X",
      "Search Console, Bing Webmaster Tools",
      "Read access to existing CRM and analytics tools"
    ]
  },
  {
    id: 'audit',
    nameFr: 'Audit global',
    nameEn: 'Full Audit',
    type: 'one-off',
    color: 'blue',
    icon: '🔍',
    taglineFr: "Inventaire complet de ton infrastructure digitale : tracking, tags, conformité RGPD, performances actuelles.",
    taglineEn: "Complete inventory of your digital infrastructure: tracking, tags, GDPR compliance, current performance.",
    deliverablesFr: [
      "Inventaire de tous les tags et pixels installés",
      "Vérification conformité RGPD / UK GDPR (bannière cookies, consent)",
      "Audit des événements de conversion et data layer",
      "Analyse des comptes publicitaires existants",
      "Identification des données manquantes et gaps de tracking",
      "Rapport d'audit avec priorités d'action"
    ],
    deliverablesEn: [
      "Inventory of all installed tags and pixels",
      "GDPR / UK GDPR compliance check (cookie banner, consent)",
      "Conversion events and data layer audit",
      "Existing ad account analysis",
      "Missing data and tracking gap identification",
      "Audit report with action priorities"
    ]
  },
  {
    id: 'implementation',
    nameFr: 'Implémentation technique',
    nameEn: 'Technical Implementation',
    type: 'one-off',
    color: 'cyan',
    icon: '⚙️',
    taglineFr: "Deux options possibles. Dans les deux cas, tu te retrouves avec une infrastructure de tracking complète et conforme.",
    taglineEn: "Two options available. In both cases, you end up with complete and compliant tracking infrastructure.",
    deliverablesFr: [
      "Bannière cookies RGPD / UK GDPR avec blocage conditionnel",
      "Pixels de conversion : Meta, Google, TikTok, Reddit, LinkedIn, X",
      "Google Analytics 4 avec événements custom",
      "Server-Side Tracking (GTM Server-Side) pour données plus précises",
      "Data layer structuré et événements de conversion"
    ],
    deliverablesEn: [
      "GDPR / UK GDPR cookie banner with conditional blocking",
      "Conversion pixels: Meta, Google, TikTok, Reddit, LinkedIn, X",
      "Google Analytics 4 with custom events",
      "Server-Side Tracking (GTM Server-Side) for more accurate data",
      "Structured data layer and conversion events"
    ],
    optionsFr: [
      {
        label: "Option A : Documentation technique",
        description: "On te livre un guide step-by-step que ton équipe tech peut implémenter en autonomie."
      },
      {
        label: "Option B : On s'en charge",
        description: "Notre équipe technique prend l'implémentation complète en main, de A à Z."
      }
    ],
    optionsEn: [
      {
        label: "Option A: Technical documentation",
        description: "We deliver a step-by-step guide that your tech team can implement independently."
      },
      {
        label: "Option B: We handle it",
        description: "Our technical team takes the full implementation in hand, from A to Z."
      }
    ]
  },
  {
    id: 'dashboard',
    nameFr: 'Reporting & Dashboard',
    nameEn: 'Reporting & Dashboard',
    type: 'ongoing',
    color: 'emerald',
    icon: '📊',
    taglineFr: "Un dashboard temps réel custom, pas un template Looker. Toutes tes données cross-canal centralisées via BigQuery.",
    taglineEn: "A custom real-time dashboard, not a Looker template. All your cross-channel data centralized via BigQuery.",
    deliverablesFr: [
      "Dashboard de performance temps réel (custom, pas un template)",
      "Centralisation des données via BigQuery (sécurisé, illimité)",
      "KPIs par canal : spend, impressions, clics, actions, CPA",
      "Accès partagé : toute ton équipe peut consulter 24/7",
      "Export CSV/PDF pour présentations internes",
      "Alertes automatiques si un KPI dévie de plus de 20%"
    ],
    deliverablesEn: [
      "Real-time performance dashboard (custom, not a template)",
      "Data centralization via BigQuery (secure, unlimited)",
      "KPIs per channel: spend, impressions, clicks, actions, CPA",
      "Shared access: your whole team can consult 24/7",
      "CSV/PDF export for internal presentations",
      "Automatic alerts if a KPI deviates more than 20%"
    ]
  }
];
