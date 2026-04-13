// Phases de collaboration MyDigipal
// Source : propale Control AI, section "Comment on travaille ensemble"
// Utilisé par HowWeWork.tsx (timeline interactive)

export interface ProcessPhase {
  id: string;
  // Label français
  nameFr: string;
  // Label anglais
  nameEn: string;
  // Durée / rythme
  durationFr: string;
  durationEn: string;
  // Type : one-off ou recurring
  type: 'one-off' | 'recurring';
  // Couleur d'accent (Tailwind color class)
  color: 'indigo' | 'blue' | 'cyan' | 'emerald' | 'amber';
  // Icône SVG ou emoji
  icon: string;
  // Raison d'être de la phase (1 phrase)
  whyFr: string;
  whyEn: string;
  // Livrables de la phase
  deliverablesFr: string[];
  deliverablesEn: string[];
  // Note spéciale (proximité équipe, rythme)
  noteFr?: string;
  noteEn?: string;
}

export const processPhases: ProcessPhase[] = [
  {
    id: 'onboarding',
    nameFr: 'Onboarding & Découverte',
    nameEn: 'Onboarding & Discovery',
    durationFr: 'Semaine 1-2',
    durationEn: 'Week 1-2',
    type: 'one-off',
    color: 'indigo',
    icon: '🤝',
    whyFr: "La phase d'immersion. On apprend tout sur votre marque, votre mission, vos audiences, vos contenus existants.",
    whyEn: "The immersion phase. We learn everything about your brand, mission, audiences, and existing content.",
    deliverablesFr: [
      "Kick-off call : objectifs, budget, KPIs cibles, pack choisi",
      "Collecte des accès : Google Ads, Meta, LinkedIn, TikTok, Reddit, GA4, GTM, Search Console",
      "Audit du tracking existant et revue RGPD/cookies",
      "Installation des pixels et événements de conversion",
      "Setup du dashboard de reporting temps réel",
      "Brief éditorial : ton de voix, sujets sensibles, guidelines"
    ],
    deliverablesEn: [
      "Kick-off call: objectives, budget, target KPIs, chosen pack",
      "Access collection: Google Ads, Meta, LinkedIn, TikTok, Reddit, GA4, GTM, Search Console",
      "Existing tracking audit and GDPR/cookie review",
      "Pixel and conversion event installation",
      "Real-time reporting dashboard setup",
      "Editorial brief: tone of voice, sensitive topics, guidelines"
    ],
    noteFr: "En présentiel quand c'est possible. On vient dans vos bureaux pour cette phase.",
    noteEn: "In person when possible. We come to your offices for this phase."
  },
  {
    id: 'strategy',
    nameFr: 'Stratégie & Construction',
    nameEn: 'Strategy & Build',
    durationFr: 'Semaine 2-3',
    durationEn: 'Week 2-3',
    type: 'one-off',
    color: 'blue',
    icon: '🧠',
    whyFr: "On passe derrière les rideaux. A partir de tout ce qu'on a appris, on construit la stratégie, les campagnes, les audiences et les créatives.",
    whyEn: "We go behind the curtain. Based on what we've learned, we build the strategy, campaigns, audiences and creatives.",
    deliverablesFr: [
      "Étude concurrentielle : qui fait quoi en paid dans votre secteur",
      "Définition des audiences cibles par canal et objectif",
      "Stratégie de contenu : messages, angles, formats",
      "Calendrier de campagnes",
      "Structuration des comptes publicitaires (campagnes, ad sets, audiences)",
      "Création des ads : textes, visuels, clips vidéo"
    ],
    deliverablesEn: [
      "Competitive study: who does what in paid in your sector",
      "Target audience definition per channel and objective",
      "Content strategy: messages, angles, formats",
      "Campaign calendar",
      "Ad account structuring (campaigns, ad sets, audiences)",
      "Ad creation: copy, visuals, video clips"
    ]
  },
  {
    id: 'feedback',
    nameFr: 'Présentation & Feedback',
    nameEn: 'Presentation & Feedback',
    durationFr: 'Semaine 3-4',
    durationEn: 'Week 3-4',
    type: 'one-off',
    color: 'cyan',
    icon: '💬',
    whyFr: "On revient vers vous avec tout ce qu'on a construit. C'est le moment critique : rien ne part en ligne sans votre validation.",
    whyEn: "We come back to you with everything we've built. This is the critical moment: nothing goes live without your sign-off.",
    deliverablesFr: [
      "Présentation complète de la stratégie et des campagnes",
      "Revue du messaging : est-ce que ça sonne juste ? Aligné avec votre vision ?",
      "Validation créative dans le Hub (Approve / Reject / Needs Changes)",
      "Ajustements selon feedback : on itère jusqu'à ce que ce soit parfait",
      "Lancement simultané de TOUS les canaux le même jour",
      "Monitoring intensif 48h + premier rapport de lancement"
    ],
    deliverablesEn: [
      "Full strategy and campaign presentation",
      "Messaging review: does it ring true? Aligned with your vision?",
      "Creative validation in the Hub (Approve / Reject / Needs Changes)",
      "Adjustments based on feedback: iterate until perfect",
      "Simultaneous launch of ALL channels on the same day",
      "Intensive 48h monitoring + first launch report"
    ]
  },
  {
    id: 'daily',
    nameFr: 'Collaboration au quotidien',
    nameEn: 'Day-to-day collaboration',
    durationFr: 'Chaque semaine',
    durationEn: 'Every week',
    type: 'recurring',
    color: 'emerald',
    icon: '⚡',
    whyFr: "Les campagnes tournent, les données arrivent. On pilote au quotidien et on se synchronise chaque semaine pour décider ensemble des prochaines actions.",
    whyEn: "Campaigns are running, data is flowing. We manage daily and sync every week to decide next actions together.",
    deliverablesFr: [
      "Ajustements quotidiens : enchères, budget, ciblage, A/B tests",
      "Scaling des campagnes gagnantes, exclusions, réallocation",
      "Monitoring 7j/7 sur X, Reddit, LinkedIn, TikTok avec réaction temps réel",
      "Veille concurrentielle et adaptation multi-format du contenu",
      "Dashboard temps réel (BigQuery) accessible 24/7, alertes si KPI dévie de 20%",
      "Call hebdomadaire de 30-45 min : recap, vos updates, décisions, next steps"
    ],
    deliverablesEn: [
      "Daily adjustments: bids, budget, targeting, A/B tests",
      "Scaling winning campaigns, exclusions, reallocation",
      "7-day monitoring on X, Reddit, LinkedIn, TikTok with real-time response",
      "Competitive monitoring and multi-format content adaptation",
      "Real-time dashboard (BigQuery) with 24/7 access, alerts if KPI deviates >20%",
      "Weekly 30-45 min call: recap, your updates, decisions, next steps"
    ],
    noteFr: "Votre Account Lead est dispo au quotidien sur Slack ou WhatsApp. Pas de ticket support, réponse dans l'heure.",
    noteEn: "Your Account Lead is available daily on Slack or WhatsApp. No support tickets, response within the hour."
  },
  {
    id: 'monthly',
    nameFr: 'Reviews mensuelles',
    nameEn: 'Monthly reviews',
    durationFr: 'Chaque mois',
    durationEn: 'Every month',
    type: 'recurring',
    color: 'amber',
    icon: '📊',
    whyFr: "Au-delà des meetings hebdomadaires, on prend du recul chaque mois pour voir le tableau d'ensemble et prendre les décisions stratégiques de plus haut niveau.",
    whyEn: "Beyond weekly meetings, we step back every month to see the big picture and make higher-level strategic decisions.",
    deliverablesFr: [
      "Rapport mensuel complet : performance par canal, audience, créative",
      "Analyse des tendances : ce qui accélère, ce qui ralentit",
      "Recommandations de réallocation budget pour le mois suivant",
      "Décisions : scaler les canaux gagnants, remplacer les sous-performants",
      "Discussion upgrade/downgrade de pack si les résultats le justifient",
      "Plan de réplication sur nouveaux marchés si positif à 3 mois"
    ],
    deliverablesEn: [
      "Full monthly report: performance by channel, audience, creative",
      "Trend analysis: what's accelerating, what's slowing down",
      "Budget reallocation recommendations for next month",
      "Decisions: scale winning channels, replace underperformers",
      "Pack upgrade/downgrade discussion if results justify it",
      "Replication plan for new markets if positive at 3 months"
    ]
  }
];

// Équipe dédiée
export interface TeamMember {
  id: string;
  name: string;
  roleFr: string;
  roleEn: string;
  cadenceFr: string;
  cadenceEn: string;
  // Initiales pour avatar si pas de photo
  initials: string;
  // Couleur d'accent
  color: 'indigo' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'violet' | 'pink';
}

export const teamMembers: TeamMember[] = [
  {
    id: 'paul',
    name: 'Paul Andre',
    roleFr: 'CEO & Directeur Stratégique',
    roleEn: 'CEO & Strategic Director',
    cadenceFr: 'Supervision stratégique, review mensuelle, escalade',
    cadenceEn: 'Strategic oversight, monthly review, escalation',
    initials: 'PA',
    color: 'indigo'
  },
  {
    id: 'account-lead',
    name: 'Account Lead',
    roleFr: 'Lead de compte',
    roleEn: 'Account Lead',
    cadenceFr: 'Point de contact au quotidien (Slack/WhatsApp, réponse dans l\'heure)',
    cadenceEn: 'Daily point of contact (Slack/WhatsApp, response within the hour)',
    initials: 'AL',
    color: 'emerald'
  },
  {
    id: 'campaign-manager',
    name: 'Campaign Manager',
    roleFr: 'Manager de campagnes',
    roleEn: 'Campaign Manager',
    cadenceFr: 'Pilotage opérationnel quotidien, A/B tests, optimisation',
    cadenceEn: 'Daily operational management, A/B tests, optimization',
    initials: 'CM',
    color: 'blue'
  },
  {
    id: 'content',
    name: 'Social Media & Content',
    roleFr: 'Social Media & Contenu',
    roleEn: 'Social Media & Content',
    cadenceFr: 'Community management 7j/7, création de contenu',
    cadenceEn: 'Community management 7 days a week, content creation',
    initials: 'SC',
    color: 'pink'
  }
];
