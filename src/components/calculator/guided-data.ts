import type { ServiceDomain, GuidedAnswers, GuidedRecommendation } from './types';

// ---- Question definitions ----
// Insights: Based on ControlAI proposal structure - we need industry, goals, budget,
// current efforts, and context to build a proper multi-channel recommendation.

export interface GuidedQuestion {
  id: keyof GuidedAnswers;
  type: 'single' | 'multi' | 'slider' | 'textarea';
  question: { en: string; fr: string };
  subtitle?: { en: string; fr: string };
  options?: { id: string; label: { en: string; fr: string }; icon: string }[];
  maxSelections?: number;
  sliderConfig?: { min: number; max: number; step: number };
  optional?: boolean;
}

export const guidedQuestions: GuidedQuestion[] = [
  {
    id: 'industry',
    type: 'single',
    question: {
      en: 'What industry are you in?',
      fr: 'Quel est votre secteur d\'activité ?'
    },
    subtitle: {
      en: 'This helps us tailor our channel recommendations',
      fr: 'Cela nous aide à adapter nos recommandations de canaux'
    },
    options: [
      { id: 'b2b-saas', label: { en: 'B2B / SaaS', fr: 'B2B / SaaS' }, icon: '💼' },
      { id: 'ecommerce', label: { en: 'E-commerce', fr: 'E-commerce' }, icon: '🛒' },
      { id: 'automotive', label: { en: 'Automotive', fr: 'Automobile' }, icon: '🚗' },
      { id: 'local', label: { en: 'Local business', fr: 'Commerce local' }, icon: '🏪' },
      { id: 'startup', label: { en: 'Startup', fr: 'Startup' }, icon: '🚀' },
      { id: 'other', label: { en: 'Other', fr: 'Autre' }, icon: '🏢' }
    ]
  },
  {
    id: 'goals',
    type: 'multi',
    question: {
      en: 'What are your marketing goals?',
      fr: 'Quels sont vos objectifs marketing ?'
    },
    subtitle: {
      en: 'Select up to 3 priorities',
      fr: 'Sélectionnez jusqu\'à 3 priorités'
    },
    maxSelections: 3,
    options: [
      { id: 'traffic', label: { en: 'More traffic', fr: 'Plus de trafic' }, icon: '📈' },
      { id: 'leads', label: { en: 'Generate leads', fr: 'Générer des leads' }, icon: '🎯' },
      { id: 'awareness', label: { en: 'Brand awareness', fr: 'Notoriété de marque' }, icon: '📣' },
      { id: 'sales', label: { en: 'Increase sales', fr: 'Augmenter les ventes' }, icon: '💰' },
      { id: 'retention', label: { en: 'Customer retention', fr: 'Fidélisation client' }, icon: '🤝' },
      { id: 'automation', label: { en: 'Automate tasks', fr: 'Automatiser les tâches' }, icon: '⚙️' },
      { id: 'ai-training', label: { en: 'Train team on AI', fr: 'Former l\'équipe à l\'IA' }, icon: '🎓' }
    ]
  },
  {
    id: 'monthlyBudget',
    type: 'slider',
    question: {
      en: 'What\'s your estimated monthly budget?',
      fr: 'Quel est votre budget mensuel estimé ?'
    },
    subtitle: {
      en: 'Including services and ad spend',
      fr: 'Services et budget publicitaire inclus'
    },
    sliderConfig: { min: 500, max: 10000, step: 500 }
  },
  {
    id: 'currentEfforts',
    type: 'multi',
    question: {
      en: 'What marketing are you currently doing?',
      fr: 'Que faites-vous actuellement en marketing ?'
    },
    subtitle: {
      en: 'Select all that apply',
      fr: 'Sélectionnez tout ce qui s\'applique'
    },
    maxSelections: 6,
    options: [
      { id: 'nothing', label: { en: 'Nothing yet', fr: 'Rien pour l\'instant' }, icon: '🆕' },
      { id: 'some-seo', label: { en: 'Some SEO', fr: 'Un peu de SEO' }, icon: '🔍' },
      { id: 'running-ads', label: { en: 'Running ads', fr: 'Ads en cours' }, icon: '📊' },
      { id: 'email-setup', label: { en: 'Email in place', fr: 'Email en place' }, icon: '📧' },
      { id: 'tracking-ok', label: { en: 'Tracking set up', fr: 'Tracking configuré' }, icon: '📡' },
      { id: 'other-agency', label: { en: 'Other agency', fr: 'Autre agence' }, icon: '🔄' }
    ]
  },
  {
    id: 'freeTextContext',
    type: 'textarea',
    question: {
      en: 'Anything else we should know?',
      fr: 'Quelque chose d\'autre à nous dire ?'
    },
    subtitle: {
      en: 'Optional - share any context that could help',
      fr: 'Optionnel - partagez tout contexte utile'
    },
    optional: true
  }
];

// ---- Industry → domain relevance scores (0-1) ----
// Refined from ControlAI proposal insights:
// - Each channel serves a specific purpose (intent capture, awareness, remarketing, etc.)
// - B2B needs LinkedIn (paid-social) + Google Ads for intent + SEO for organic
// - E-commerce needs Meta (paid-social) + Google Ads (Shopping) + Email (retention)
// - Automotive needs Google Ads (local intent) + paid-social + AI solutions (chatbots, inventory)
// - Tracking is foundational for ALL paid channels - you can't optimize what you can't measure

const industryScores: Record<string, Partial<Record<ServiceDomain, number>>> = {
  'b2b-saas': {
    'seo': 0.9,              // Long-form content + organic pipeline
    'google-ads': 0.85,      // Search intent capture for high-value keywords
    'paid-social': 0.75,     // LinkedIn for decision-makers, Meta for remarketing
    'emailing': 0.7,         // Lead nurturing sequences
    'ai-content': 0.8,       // Scale blog/thought leadership content
    'ai-solutions': 0.5,     // Chatbots for qualification
    'ai-training': 0.3,      // Nice-to-have
    'tracking-reporting': 0.9 // Essential - long sales cycles need attribution
  },
  'ecommerce': {
    'seo': 0.8,              // Category pages, product SEO
    'google-ads': 0.95,      // Shopping + Search - highest ROAS channel
    'paid-social': 0.9,      // Meta for prospecting + remarketing, best CPM
    'emailing': 0.85,        // Cart abandonment, lifecycle, retention
    'ai-content': 0.6,       // Product descriptions, blog
    'ai-solutions': 0.4,     // Chatbot for customer service
    'ai-training': 0.15,     // Rarely needed
    'tracking-reporting': 0.95 // Critical - need pixel tracking across all channels
  },
  'automotive': {
    'seo': 0.7,              // Local SEO + inventory pages
    'google-ads': 0.9,       // High intent "buy car" searches
    'paid-social': 0.75,     // Meta for awareness, inventory ads
    'emailing': 0.5,         // Follow-up sequences
    'ai-content': 0.5,       // Blog content
    'ai-solutions': 0.65,    // Chatbots for lead qualification, inventory AI
    'ai-training': 0.4,      // Team AI adoption
    'tracking-reporting': 0.85 // Multi-touchpoint attribution needed
  },
  'local': {
    'seo': 0.95,             // Local SEO is #1 priority - Google Business, maps
    'google-ads': 0.75,      // Local search ads
    'paid-social': 0.6,      // Meta for local awareness
    'emailing': 0.4,         // Basic newsletter
    'ai-content': 0.35,      // Limited content needs
    'ai-solutions': 0.2,     // Rarely needed
    'ai-training': 0.1,      // Rarely needed
    'tracking-reporting': 0.65 // Basic tracking sufficient
  },
  'startup': {
    'seo': 0.7,              // Build organic presence early
    'google-ads': 0.7,       // Test market with paid search
    'paid-social': 0.85,     // Meta + LinkedIn for rapid awareness and testing
    'emailing': 0.55,        // Early lead capture
    'ai-content': 0.75,      // Scale content with limited team
    'ai-solutions': 0.6,     // Automation for small teams
    'ai-training': 0.45,     // AI-first mindset
    'tracking-reporting': 0.8 // Need data to iterate fast
  },
  'other': {
    'seo': 0.7,
    'google-ads': 0.65,
    'paid-social': 0.6,
    'emailing': 0.5,
    'ai-content': 0.5,
    'ai-solutions': 0.4,
    'ai-training': 0.3,
    'tracking-reporting': 0.7
  }
};

// ---- Goal → domain boost ----
// From ControlAI proposal: each goal maps to specific channels and their role in the funnel
// Awareness → top of funnel (Paid Social, YouTube/Display, AI Content)
// Leads → mid funnel (Google Ads intent, LinkedIn, Email nurturing, Tracking for attribution)
// Sales → bottom funnel (Google Ads, remarketing via Meta, Email sequences)
// Traffic → organic (SEO, AI Content) + paid (Google Ads, Paid Social)

const goalBoosts: Record<string, Partial<Record<ServiceDomain, number>>> = {
  'traffic': {
    'seo': 0.4,              // Organic traffic compounds over time
    'google-ads': 0.3,       // Immediate paid traffic
    'ai-content': 0.35,      // Content fuels SEO + social sharing
    'paid-social': 0.2,      // Social traffic
    'tracking-reporting': 0.15 // Measure traffic sources
  },
  'leads': {
    'google-ads': 0.4,       // Capture high-intent searches
    'paid-social': 0.35,     // LinkedIn for B2B leads, Meta for forms
    'emailing': 0.35,        // Nurture leads to conversion
    'tracking-reporting': 0.3, // Attribution across touchpoints
    'seo': 0.15              // Organic lead generation
  },
  'awareness': {
    'paid-social': 0.5,      // Meta/LinkedIn/TikTok - best reach per €
    'ai-content': 0.35,      // Content marketing for thought leadership
    'seo': 0.25,             // Organic visibility builds authority
    'google-ads': 0.15,      // Display + YouTube ads for reach
    'tracking-reporting': 0.15 // Measure brand lift
  },
  'sales': {
    'google-ads': 0.45,      // Highest conversion intent
    'paid-social': 0.35,     // Remarketing + Meta conversion campaigns
    'emailing': 0.35,        // Sales sequences, cart recovery
    'tracking-reporting': 0.3, // ROAS tracking essential
    'seo': 0.1               // Organic conversions
  },
  'retention': {
    'emailing': 0.5,         // Lifecycle emails, newsletters, loyalty
    'ai-solutions': 0.35,    // Chatbots, automation for customer support
    'ai-content': 0.2,       // Ongoing content for engagement
    'paid-social': 0.15      // Remarketing to existing customers
  },
  'automation': {
    'ai-solutions': 0.5,     // Workflow automation, chatbots, AI agents
    'emailing': 0.35,        // Automated email sequences
    'ai-training': 0.25,     // Train team to leverage AI tools
    'ai-content': 0.2        // Automate content production
  },
  'ai-training': {
    'ai-training': 0.8,      // Direct match
    'ai-solutions': 0.3,     // Complementary - apply what you learn
    'ai-content': 0.2        // AI-powered content after training
  }
};

// ---- Budget → level index mapping ----
// Aligned with ControlAI pack structure:
// Essentials ≈ €2,000-4,000/mo → Starter packages (index 0)
// Growth ≈ €4,000-8,000/mo → Growth packages (index 1)
// Impact ≈ €8,000+/mo → Premium packages (index 2)

function budgetToLevelIndex(budget: number): number {
  if (budget <= 2500) return 0;  // Starter/Essential
  if (budget <= 6000) return 1;  // Growth/Advanced
  return 2;                       // Premium/Impact
}

// ---- Ad budget allocation from total budget ----
// From ControlAI proposal: media budget was roughly 45-55% of total spend
// Split depends on industry: B2B → more Google Ads, E-commerce → balanced, etc.

const industryAdSplit: Record<string, { google: number; social: number }> = {
  'b2b-saas':   { google: 0.6, social: 0.4 },   // Google for intent, LinkedIn for targeting
  'ecommerce':  { google: 0.5, social: 0.5 },   // Balanced - Shopping + Meta
  'automotive':  { google: 0.65, social: 0.35 }, // High intent local search
  'local':       { google: 0.7, social: 0.3 },   // Local search dominant
  'startup':     { google: 0.4, social: 0.6 },   // Social for awareness + testing
  'other':       { google: 0.5, social: 0.5 }    // Balanced default
};

function allocateAdBudget(
  totalBudget: number,
  domains: ServiceDomain[],
  industry: string
): { 'google-ads': number; 'paid-social': number } {
  const hasAds = domains.includes('google-ads');
  const hasSocial = domains.includes('paid-social');
  if (!hasAds && !hasSocial) return { 'google-ads': 500, 'paid-social': 500 };

  // Reserve ~45% of total budget for ad spend (rest goes to management + services)
  const adPool = Math.round(totalBudget * 0.45 / 500) * 500;
  const capped = Math.max(500, Math.min(adPool, 15000));

  const split = industryAdSplit[industry] || industryAdSplit['other'];

  if (hasAds && hasSocial) {
    const googleBudget = Math.max(500, Math.round(capped * split.google / 500) * 500);
    const socialBudget = Math.max(500, Math.round(capped * split.social / 500) * 500);
    return { 'google-ads': googleBudget, 'paid-social': socialBudget };
  }
  if (hasAds) return { 'google-ads': capped, 'paid-social': 500 };
  return { 'google-ads': 500, 'paid-social': capped };
}

// ---- Main recommendation engine ----

export function generateRecommendation(answers: GuidedAnswers): GuidedRecommendation {
  const allDomains: ServiceDomain[] = [
    'seo', 'google-ads', 'paid-social', 'emailing',
    'ai-content', 'ai-solutions', 'ai-training', 'tracking-reporting'
  ];

  // 1. Compute scores: base (industry) + boosts (goals)
  const scores: Record<string, number> = {};
  for (const d of allDomains) {
    const base = industryScores[answers.industry]?.[d] ?? 0.5;
    let boost = 0;
    for (const g of answers.goals) {
      boost += goalBoosts[g]?.[d] ?? 0;
    }
    scores[d] = base + boost;
  }

  // 2. Adjust for current efforts
  // Insight from ControlAI: tracking infrastructure (cookies, GTM, pixels, dashboard)
  // is foundational for ALL paid channels. Without it, you can't measure ROI.
  const efforts = answers.currentEfforts;

  if (efforts.includes('nothing')) {
    // Starting from zero: prioritize foundations
    // SEO + Tracking are the base, then build paid on top
    scores['tracking-reporting'] = Math.max(scores['tracking-reporting'] ?? 0, 0.85);
    scores['seo'] = Math.max(scores['seo'] ?? 0, 0.75);
  }

  if (efforts.includes('tracking-ok')) {
    // Already have tracking - lower its priority but don't remove
    scores['tracking-reporting'] = Math.max(0.3, (scores['tracking-reporting'] ?? 0) - 0.4);
  } else if (!efforts.includes('nothing')) {
    // Doing marketing without tracking = red flag, strongly recommend it
    // From ControlAI: "Without proper tracking, you can't measure ROI or optimize campaigns"
    scores['tracking-reporting'] = Math.max(scores['tracking-reporting'] ?? 0, 0.8);
  }

  if (efforts.includes('running-ads')) {
    // Already running ads: recommend audit + optimization rather than setup
    // Still valuable - we can optimize their existing campaigns
    scores['google-ads'] = Math.min((scores['google-ads'] ?? 0) + 0.1, 1.5);
    scores['paid-social'] = Math.min((scores['paid-social'] ?? 0) + 0.1, 1.5);
  }

  if (efforts.includes('some-seo')) {
    // Some SEO in place: still recommend but for growth/optimization
    scores['seo'] = Math.min((scores['seo'] ?? 0) + 0.05, 1.5);
  }

  if (efforts.includes('email-setup')) {
    // Email already in place: lower priority unless retention is a goal
    if (!answers.goals.includes('retention')) {
      scores['emailing'] = Math.max(0.3, (scores['emailing'] ?? 0) - 0.2);
    }
  }

  if (efforts.includes('other-agency')) {
    // Coming from another agency: they need audit + better optimization
    // Boost tracking (likely not set up properly) and content
    scores['tracking-reporting'] = Math.max(scores['tracking-reporting'] ?? 0, 0.75);
    scores['ai-content'] = Math.min((scores['ai-content'] ?? 0) + 0.1, 1.5);
  }

  // 3. Filter by threshold and apply budget constraints
  const threshold = 0.6;
  let selectedDomains = allDomains
    .filter(d => (scores[d] ?? 0) > threshold)
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));

  // Budget constraint: follow ControlAI evolution path principle
  // Start small with fewer channels, master them, then expand
  // Essentials = 3-4 channels, Growth = 4-5, Impact = 6+
  if (answers.monthlyBudget <= 1500) {
    // Tight budget: focus on 2-3 highest-impact channels
    selectedDomains = selectedDomains.slice(0, 3);
  } else if (answers.monthlyBudget <= 3000) {
    // Moderate: 3-4 channels
    selectedDomains = selectedDomains.slice(0, 4);
  } else if (answers.monthlyBudget <= 5000) {
    // Growth: 4-5 channels
    selectedDomains = selectedDomains.slice(0, 5);
  }
  // 5000+: no cap, full Impact-level recommendation

  // Ensure at least 2 domains
  if (selectedDomains.length < 2) {
    const sorted = [...allDomains].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
    selectedDomains = sorted.slice(0, 2);
  }

  // 4. Assign service levels based on budget
  const levelIndex = budgetToLevelIndex(answers.monthlyBudget);
  const selections: Record<string, number | null> = {};
  for (const d of selectedDomains) {
    // AI Training and Tracking have special UIs, no level index needed
    if (d !== 'ai-training' && d !== 'tracking-reporting') {
      selections[d] = levelIndex;
    }
  }

  // 5. Allocate ad budgets with industry-aware split
  const adBudgets = allocateAdBudget(answers.monthlyBudget, selectedDomains, answers.industry);

  // 6. Estimate monthly cost (user's stated budget is the target)
  const estimatedMonthly = answers.monthlyBudget;

  // 7. Build reasoning with channel-specific value props
  const reasoning = buildReasoning(answers, selectedDomains, scores);

  // 8. Pre-select tracking services when tracking-reporting is recommended
  let trackingPreselections: Record<string, boolean> | undefined;
  let trackingAuditFlag: boolean | undefined;
  if (selectedDomains.includes('tracking-reporting')) {
    trackingPreselections = {};
    if (efforts.includes('tracking-ok')) {
      // Already have tracking: recommend audit to check setup quality
      trackingAuditFlag = true;
    } else if (efforts.includes('running-ads')) {
      // Running ads without tracking: need GA4 + conversion + cookies
      trackingPreselections['ga4-setup'] = true;
      trackingPreselections['conversion-tracking'] = true;
      trackingPreselections['cookie-consent'] = true;
      trackingAuditFlag = true;
    } else if (efforts.includes('nothing')) {
      // Starting from zero: full tracking setup
      trackingPreselections['ga4-setup'] = true;
      trackingPreselections['conversion-tracking'] = true;
      trackingPreselections['cookie-consent'] = true;
      trackingPreselections['reporting-dashboard'] = true;
    } else {
      // Default: GA4 + conversion tracking + cookies (foundation)
      trackingPreselections['ga4-setup'] = true;
      trackingPreselections['conversion-tracking'] = true;
      trackingPreselections['cookie-consent'] = true;
    }
  }

  // 9. Recommend social channels based on industry
  const recommendedChannels = selectedDomains.includes('paid-social')
    ? (industryChannels[answers.industry] || industryChannels['other'])
    : undefined;

  return {
    selectedDomains,
    selections,
    adBudgets,
    reasoning,
    estimatedMonthly,
    trackingPreselections,
    trackingAudit: trackingAuditFlag,
    recommendedChannels
  };
}

// ---- Reasoning builder ----
// Generates structured reason strings that GuidedMode.tsx parses for display.
// Format: "type:data" - the component handles bilingual rendering.

function buildReasoning(
  answers: GuidedAnswers,
  selectedDomains: ServiceDomain[],
  scores: Record<string, number>
): string[] {
  const reasons: string[] = [];

  const domainNames: Record<ServiceDomain, { en: string; fr: string }> = {
    'seo': { en: 'SEO', fr: 'SEO' },
    'google-ads': { en: 'Google Ads', fr: 'Google Ads' },
    'paid-social': { en: 'Paid Social', fr: 'Paid Social' },
    'emailing': { en: 'Email Marketing', fr: 'Email Marketing' },
    'ai-content': { en: 'AI Content', fr: 'Contenu IA' },
    'ai-solutions': { en: 'AI Solutions', fr: 'Solutions IA' },
    'ai-training': { en: 'AI Training', fr: 'Formation IA' },
    'tracking-reporting': { en: 'Tracking & Reporting', fr: 'Tracking & Reporting' }
  };

  const industryLabels: Record<string, { en: string; fr: string }> = {
    'b2b-saas': { en: 'B2B/SaaS', fr: 'B2B/SaaS' },
    'ecommerce': { en: 'E-commerce', fr: 'E-commerce' },
    'automotive': { en: 'Automotive', fr: 'Automobile' },
    'local': { en: 'Local business', fr: 'Commerce local' },
    'startup': { en: 'Startup', fr: 'Startup' },
    'other': { en: 'your industry', fr: 'votre secteur' }
  };

  const goalLabels: Record<string, { en: string; fr: string }> = {
    'traffic': { en: 'traffic growth', fr: 'croissance du trafic' },
    'leads': { en: 'lead generation', fr: 'génération de leads' },
    'awareness': { en: 'brand awareness', fr: 'notoriété de marque' },
    'sales': { en: 'sales increase', fr: 'augmentation des ventes' },
    'retention': { en: 'customer retention', fr: 'fidélisation client' },
    'automation': { en: 'task automation', fr: 'automatisation' },
    'ai-training': { en: 'AI training', fr: 'formation IA' }
  };

  // 1. Industry-based core channels (top 3 by score)
  const topDomains = [...selectedDomains]
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
    .slice(0, 3);

  const indLabel = industryLabels[answers.industry] || industryLabels['other'];
  const topNames = topDomains.map(d => `${domainNames[d].en}|${domainNames[d].fr}`);
  reasons.push(`industry:${indLabel.en}|${indLabel.fr}:${topNames.join(',')}`);

  // 2. Goal alignment
  if (answers.goals.length > 0) {
    const goalTexts = answers.goals.slice(0, 2).map(g => {
      const gl = goalLabels[g] || { en: g, fr: g };
      return `${gl.en}|${gl.fr}`;
    });
    reasons.push(`goals:${goalTexts.join(',')}`);
  }

  // 3. Channel-specific value props (from ControlAI insights)
  // Add one specific insight for a key recommended channel
  if (selectedDomains.includes('google-ads') && (answers.goals.includes('leads') || answers.goals.includes('sales'))) {
    reasons.push('channel-insight:google-ads');
  } else if (selectedDomains.includes('paid-social') && answers.goals.includes('awareness')) {
    reasons.push('channel-insight:paid-social');
  } else if (selectedDomains.includes('seo') && answers.goals.includes('traffic')) {
    reasons.push('channel-insight:seo');
  } else if (selectedDomains.includes('emailing') && answers.goals.includes('retention')) {
    reasons.push('channel-insight:emailing');
  }

  // 4. Tracking recommendation with context
  if (selectedDomains.includes('tracking-reporting')) {
    if (answers.currentEfforts.includes('running-ads') && !answers.currentEfforts.includes('tracking-ok')) {
      reasons.push('tracking:ads-no-tracking');
    } else if (answers.currentEfforts.includes('nothing')) {
      reasons.push('tracking:foundation');
    } else {
      reasons.push('tracking');
    }
  }

  // 5. Budget tier insight
  if (answers.monthlyBudget <= 2000) {
    reasons.push('budget:starter');
  } else if (answers.monthlyBudget > 5000) {
    reasons.push('budget:premium');
  }

  return reasons;
}

// ---- Industry → recommended social channels ----
// Based on ControlAI proposal: channel selection depends on where the audience is
// B2B → LinkedIn + Meta (remarketing), E-commerce → Meta + TikTok, etc.

export const industryChannels: Record<string, string[]> = {
  'b2b-saas': ['linkedin', 'meta'],
  'ecommerce': ['meta', 'tiktok'],
  'automotive': ['meta', 'google-display'],
  'local': ['meta'],
  'startup': ['meta', 'linkedin', 'tiktok'],
  'other': ['meta', 'linkedin']
};

// ---- Evolution path (Foundation → Growth → Acceleration) ----
// Based on ControlAI proposal: start with fewer channels, master them, then expand
// 3 phases with bilingual labels and timelines

export interface EvolutionPhase {
  label: { en: string; fr: string };
  timeline: { en: string; fr: string };
  domains: ServiceDomain[];
  levelLabel: { en: string; fr: string };
}

export function buildEvolutionPath(
  selectedDomains: ServiceDomain[],
  levelIndex: number,
  _industry: string
): EvolutionPhase[] {
  const levelLabels = [
    { en: 'Starter', fr: 'Starter' },
    { en: 'Growth', fr: 'Croissance' },
    { en: 'Premium', fr: 'Premium' }
  ];

  // Phase 1: top 2-3 domains at current level
  const phase1Domains = selectedDomains.slice(0, Math.min(3, selectedDomains.length));
  // Phase 2: all domains, upgrade one level
  const phase2Level = Math.min(levelIndex + 1, 2);
  // Phase 3: all domains at Premium
  return [
    {
      label: { en: 'Foundation', fr: 'Fondation' },
      timeline: { en: 'Months 1-3', fr: 'Mois 1-3' },
      domains: phase1Domains,
      levelLabel: levelLabels[levelIndex] || levelLabels[0]
    },
    {
      label: { en: 'Growth', fr: 'Croissance' },
      timeline: { en: 'Months 4-6', fr: 'Mois 4-6' },
      domains: [...selectedDomains],
      levelLabel: levelLabels[phase2Level] || levelLabels[1]
    },
    {
      label: { en: 'Acceleration', fr: 'Accélération' },
      timeline: { en: 'Months 7+', fr: 'Mois 7+' },
      domains: [...selectedDomains],
      levelLabel: levelLabels[2]
    }
  ];
}

// ---- Channel benchmarks by industry ----
// Data from ControlAI proposal + industry averages
// 3 metrics per domain per industry

export interface ChannelBenchmark {
  metrics: { label: { en: string; fr: string }; value: string }[];
}

const channelBenchmarks: Record<string, Record<string, ChannelBenchmark>> = {
  'b2b-saas': {
    'seo': { metrics: [
      { label: { en: 'Avg. CPC (organic equiv.)', fr: 'CPC moyen (équiv. organique)' }, value: '€3-8' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '2-5%' },
      { label: { en: 'Time to results', fr: 'Délai résultats' }, value: '3-6 mo' }
    ]},
    'google-ads': { metrics: [
      { label: { en: 'Avg. CPC', fr: 'CPC moyen' }, value: '€2-5' },
      { label: { en: 'ROAS', fr: 'ROAS' }, value: '3-6x' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '2-5%' }
    ]},
    'paid-social': { metrics: [
      { label: { en: 'CPM (LinkedIn)', fr: 'CPM (LinkedIn)' }, value: '€25-45' },
      { label: { en: 'Cost per lead', fr: 'Coût par lead' }, value: '€30-80' },
      { label: { en: 'CTR', fr: 'CTR' }, value: '0.4-0.9%' }
    ]},
    'emailing': { metrics: [
      { label: { en: 'Open rate', fr: 'Taux d\'ouverture' }, value: '20-30%' },
      { label: { en: 'Click rate', fr: 'Taux de clic' }, value: '2-5%' },
      { label: { en: 'Revenue share', fr: 'Part du CA' }, value: '15-25%' }
    ]},
    'ai-content': { metrics: [
      { label: { en: 'Content/month', fr: 'Contenus/mois' }, value: '8-20' },
      { label: { en: 'Cost reduction', fr: 'Réduction coût' }, value: '40-60%' },
      { label: { en: 'Time saved', fr: 'Temps gagné' }, value: '50-70%' }
    ]}
  },
  'ecommerce': {
    'seo': { metrics: [
      { label: { en: 'Organic traffic share', fr: 'Part trafic organique' }, value: '30-50%' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '1-3%' },
      { label: { en: 'Time to results', fr: 'Délai résultats' }, value: '3-6 mo' }
    ]},
    'google-ads': { metrics: [
      { label: { en: 'ROAS (Shopping)', fr: 'ROAS (Shopping)' }, value: '4-10x' },
      { label: { en: 'Avg. CPC', fr: 'CPC moyen' }, value: '€0.5-2' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '2-4%' }
    ]},
    'paid-social': { metrics: [
      { label: { en: 'CPM (Meta)', fr: 'CPM (Meta)' }, value: '€5-15' },
      { label: { en: 'ROAS', fr: 'ROAS' }, value: '3-8x' },
      { label: { en: 'Cart recovery', fr: 'Récup. paniers' }, value: '8-15%' }
    ]},
    'emailing': { metrics: [
      { label: { en: 'Revenue share', fr: 'Part du CA' }, value: '15-30%' },
      { label: { en: 'Cart recovery', fr: 'Récup. paniers' }, value: '8-15%' },
      { label: { en: 'LTV increase', fr: 'Augmentation LTV' }, value: '+20-40%' }
    ]},
    'ai-content': { metrics: [
      { label: { en: 'Product descs/month', fr: 'Fiches produit/mois' }, value: '50-200' },
      { label: { en: 'Cost reduction', fr: 'Réduction coût' }, value: '50-70%' },
      { label: { en: 'SEO boost', fr: 'Boost SEO' }, value: '+30-60%' }
    ]}
  },
  'automotive': {
    'seo': { metrics: [
      { label: { en: 'Local pack visibility', fr: 'Visibilité locale' }, value: '+40-80%' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '1-3%' },
      { label: { en: 'Time to results', fr: 'Délai résultats' }, value: '3-6 mo' }
    ]},
    'google-ads': { metrics: [
      { label: { en: 'Avg. CPC', fr: 'CPC moyen' }, value: '€1-4' },
      { label: { en: 'Cost per lead', fr: 'Coût par lead' }, value: '€15-40' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '3-6%' }
    ]},
    'paid-social': { metrics: [
      { label: { en: 'CPM (Meta)', fr: 'CPM (Meta)' }, value: '€6-15' },
      { label: { en: 'Cost per lead', fr: 'Coût par lead' }, value: '€10-30' },
      { label: { en: 'CTR', fr: 'CTR' }, value: '0.8-1.5%' }
    ]},
    'emailing': { metrics: [
      { label: { en: 'Open rate', fr: 'Taux d\'ouverture' }, value: '25-35%' },
      { label: { en: 'Click rate', fr: 'Taux de clic' }, value: '3-6%' },
      { label: { en: 'Follow-up conv.', fr: 'Conv. relance' }, value: '5-12%' }
    ]},
    'ai-content': { metrics: [
      { label: { en: 'Content/month', fr: 'Contenus/mois' }, value: '10-30' },
      { label: { en: 'Cost reduction', fr: 'Réduction coût' }, value: '40-60%' },
      { label: { en: 'Time saved', fr: 'Temps gagné' }, value: '50-70%' }
    ]}
  },
  'local': {
    'seo': { metrics: [
      { label: { en: 'Google Maps visibility', fr: 'Visibilité Maps' }, value: '+50-100%' },
      { label: { en: 'Local pack ranking', fr: 'Classement local' }, value: 'Top 3' },
      { label: { en: 'Review growth', fr: 'Croissance avis' }, value: '+30-60%' }
    ]},
    'google-ads': { metrics: [
      { label: { en: 'Avg. CPC', fr: 'CPC moyen' }, value: '€1-3' },
      { label: { en: 'Cost per lead', fr: 'Coût par lead' }, value: '€8-25' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '4-8%' }
    ]},
    'paid-social': { metrics: [
      { label: { en: 'CPM (Meta)', fr: 'CPM (Meta)' }, value: '€4-10' },
      { label: { en: 'Local reach', fr: 'Portée locale' }, value: '70-90%' },
      { label: { en: 'Store visits', fr: 'Visites magasin' }, value: '+20-40%' }
    ]},
    'emailing': { metrics: [
      { label: { en: 'Open rate', fr: 'Taux d\'ouverture' }, value: '30-45%' },
      { label: { en: 'Repeat visits', fr: 'Visites récurrentes' }, value: '+15-30%' },
      { label: { en: 'Revenue share', fr: 'Part du CA' }, value: '10-20%' }
    ]},
    'ai-content': { metrics: [
      { label: { en: 'Content/month', fr: 'Contenus/mois' }, value: '4-10' },
      { label: { en: 'Local SEO boost', fr: 'Boost SEO local' }, value: '+20-40%' },
      { label: { en: 'Time saved', fr: 'Temps gagné' }, value: '40-60%' }
    ]}
  },
  'startup': {
    'seo': { metrics: [
      { label: { en: 'Organic growth', fr: 'Croissance organique' }, value: '+60-150%' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '1-4%' },
      { label: { en: 'Time to results', fr: 'Délai résultats' }, value: '3-6 mo' }
    ]},
    'google-ads': { metrics: [
      { label: { en: 'Avg. CPC', fr: 'CPC moyen' }, value: '€1-5' },
      { label: { en: 'Cost per signup', fr: 'Coût par signup' }, value: '€10-50' },
      { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '2-5%' }
    ]},
    'paid-social': { metrics: [
      { label: { en: 'CPM (Meta)', fr: 'CPM (Meta)' }, value: '€5-12' },
      { label: { en: 'Cost per install', fr: 'Coût par install' }, value: '€1-5' },
      { label: { en: 'Viral coefficient', fr: 'Coefficient viral' }, value: '0.3-0.8' }
    ]},
    'emailing': { metrics: [
      { label: { en: 'Activation rate', fr: 'Taux d\'activation' }, value: '+15-30%' },
      { label: { en: 'Churn reduction', fr: 'Réduction churn' }, value: '-10-25%' },
      { label: { en: 'Revenue share', fr: 'Part du CA' }, value: '10-25%' }
    ]},
    'ai-content': { metrics: [
      { label: { en: 'Content/month', fr: 'Contenus/mois' }, value: '10-25' },
      { label: { en: 'Cost reduction', fr: 'Réduction coût' }, value: '50-70%' },
      { label: { en: 'Time to market', fr: 'Time to market' }, value: '-40-60%' }
    ]}
  }
};

const defaultBenchmarks: Record<string, ChannelBenchmark> = {
  'seo': { metrics: [
    { label: { en: 'Organic traffic growth', fr: 'Croissance trafic organique' }, value: '+40-100%' },
    { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '1-4%' },
    { label: { en: 'Time to results', fr: 'Délai résultats' }, value: '3-6 mo' }
  ]},
  'google-ads': { metrics: [
    { label: { en: 'Avg. CPC', fr: 'CPC moyen' }, value: '€1-5' },
    { label: { en: 'ROAS', fr: 'ROAS' }, value: '3-6x' },
    { label: { en: 'Conv. rate', fr: 'Taux de conv.' }, value: '2-5%' }
  ]},
  'paid-social': { metrics: [
    { label: { en: 'CPM', fr: 'CPM' }, value: '€5-25' },
    { label: { en: 'CTR', fr: 'CTR' }, value: '0.5-1.5%' },
    { label: { en: 'Cost per lead', fr: 'Coût par lead' }, value: '€10-50' }
  ]},
  'emailing': { metrics: [
    { label: { en: 'Open rate', fr: 'Taux d\'ouverture' }, value: '20-35%' },
    { label: { en: 'Click rate', fr: 'Taux de clic' }, value: '2-5%' },
    { label: { en: 'Revenue share', fr: 'Part du CA' }, value: '10-25%' }
  ]},
  'ai-content': { metrics: [
    { label: { en: 'Content/month', fr: 'Contenus/mois' }, value: '8-20' },
    { label: { en: 'Cost reduction', fr: 'Réduction coût' }, value: '40-60%' },
    { label: { en: 'Time saved', fr: 'Temps gagné' }, value: '50-70%' }
  ]}
};

export function getBenchmarks(industry: string, domain: string): ChannelBenchmark | null {
  return channelBenchmarks[industry]?.[domain] || defaultBenchmarks[domain] || null;
}

// ---- Industry insights (typical results) ----
// Credibility data from ControlAI proposal + industry averages

export interface IndustryInsight {
  headline: { en: string; fr: string };
  stats: { label: { en: string; fr: string }; value: string }[];
  source: { en: string; fr: string };
}

export const industryInsights: Record<string, IndustryInsight> = {
  'b2b-saas': {
    headline: { en: 'Typical B2B/SaaS results with multi-channel strategy', fr: 'Résultats typiques B2B/SaaS avec stratégie multicanal' },
    stats: [
      { label: { en: 'Cost per lead reduction', fr: 'Réduction coût par lead' }, value: '-30 to -50%' },
      { label: { en: 'Organic traffic growth', fr: 'Croissance trafic organique' }, value: '+60 to +120%' },
      { label: { en: 'Sales pipeline increase', fr: 'Augmentation du pipeline' }, value: '+40 to +80%' }
    ],
    source: { en: 'Based on 6-12 month B2B engagements', fr: 'Basé sur des missions B2B de 6-12 mois' }
  },
  'ecommerce': {
    headline: { en: 'Typical E-commerce results with multi-channel strategy', fr: 'Résultats typiques E-commerce avec stratégie multicanal' },
    stats: [
      { label: { en: 'ROAS improvement', fr: 'Amélioration du ROAS' }, value: '+50 to +150%' },
      { label: { en: 'Cart recovery rate', fr: 'Taux de récup. paniers' }, value: '8-15%' },
      { label: { en: 'Email revenue share', fr: 'Part du CA par email' }, value: '15-30%' }
    ],
    source: { en: 'Based on 6-12 month e-commerce engagements', fr: 'Basé sur des missions e-commerce de 6-12 mois' }
  },
  'automotive': {
    headline: { en: 'Typical Automotive results with digital strategy', fr: 'Résultats typiques Automobile avec stratégie digitale' },
    stats: [
      { label: { en: 'Cost per lead reduction', fr: 'Réduction coût par lead' }, value: '-25 to -45%' },
      { label: { en: 'Showroom visit increase', fr: 'Augmentation visites showroom' }, value: '+30 to +60%' },
      { label: { en: 'Online lead growth', fr: 'Croissance leads en ligne' }, value: '+40 to +90%' }
    ],
    source: { en: 'Based on automotive dealership campaigns', fr: 'Basé sur des campagnes concessionnaires' }
  },
  'local': {
    headline: { en: 'Typical local business results with digital strategy', fr: 'Résultats typiques commerce local avec stratégie digitale' },
    stats: [
      { label: { en: 'Google Maps visibility', fr: 'Visibilité Google Maps' }, value: '+50 to +100%' },
      { label: { en: 'Store visit increase', fr: 'Augmentation visites magasin' }, value: '+20 to +40%' },
      { label: { en: 'Review growth', fr: 'Croissance des avis' }, value: '+30 to +60%' }
    ],
    source: { en: 'Based on local business campaigns', fr: 'Basé sur des campagnes commerce local' }
  },
  'startup': {
    headline: { en: 'Typical Startup results with growth strategy', fr: 'Résultats typiques Startup avec stratégie de croissance' },
    stats: [
      { label: { en: 'User acquisition cost', fr: 'Coût d\'acquisition' }, value: '-30 to -50%' },
      { label: { en: 'Monthly growth rate', fr: 'Taux de croissance mensuel' }, value: '+15 to +30%' },
      { label: { en: 'Time to market', fr: 'Time to market' }, value: '-40 to -60%' }
    ],
    source: { en: 'Based on startup growth campaigns', fr: 'Basé sur des campagnes de croissance startup' }
  },
  'other': {
    headline: { en: 'Typical results with multi-channel strategy', fr: 'Résultats typiques avec stratégie multicanal' },
    stats: [
      { label: { en: 'Lead generation increase', fr: 'Augmentation génération leads' }, value: '+30 to +70%' },
      { label: { en: 'Brand visibility', fr: 'Visibilité de marque' }, value: '+40 to +80%' },
      { label: { en: 'Cost efficiency', fr: 'Efficacité des coûts' }, value: '+20 to +40%' }
    ],
    source: { en: 'Based on multi-industry averages', fr: 'Basé sur des moyennes multi-sectorielles' }
  }
};

// ---- High-level actions per domain ----
// Used in recommendation card (GuidedMode) and in summary/webhook (Calculator)

export const guidedDomainActions: Record<string, { en: string[]; fr: string[] }> = {
  'seo': {
    en: ['Technical SEO audit and optimization', 'Keyword strategy and content roadmap', 'On-page optimization and internal linking', 'Monthly performance reporting and adjustments'],
    fr: ['Audit SEO technique et optimisation', 'Stratégie de mots-clés et feuille de route contenu', 'Optimisation on-page et maillage interne', 'Reporting mensuel de performance et ajustements']
  },
  'google-ads': {
    en: ['Campaign structure and keyword research', 'Ad copywriting and A/B testing', 'Bid strategy optimization and budget management', 'Conversion tracking setup and ROAS reporting'],
    fr: ['Structure de campagnes et recherche de mots-clés', 'Rédaction d\'annonces et A/B testing', 'Optimisation des enchères et gestion du budget', 'Tracking des conversions et reporting ROAS']
  },
  'paid-social': {
    en: ['Audience targeting across Meta, LinkedIn, TikTok', 'Creative strategy and ad production', 'Remarketing and lookalike audiences', 'Campaign optimization and budget allocation'],
    fr: ['Ciblage d\'audiences sur Meta, LinkedIn, TikTok', 'Stratégie créative et production d\'annonces', 'Remarketing et audiences similaires', 'Optimisation des campagnes et allocation du budget']
  },
  'emailing': {
    en: ['Email automation sequences (welcome, nurture, upsell)', 'Newsletter design and content strategy', 'List segmentation and personalization', 'A/B testing and deliverability optimization'],
    fr: ['Séquences d\'emails automatisées (bienvenue, nurturing, upsell)', 'Design de newsletter et stratégie de contenu', 'Segmentation de liste et personnalisation', 'A/B testing et optimisation de la délivrabilité']
  },
  'ai-content': {
    en: ['AI-powered blog articles trained on your brand voice', 'Social media content calendar and production', 'Landing page copy and conversion optimization', 'Content performance analysis and iteration'],
    fr: ['Articles de blog IA formés sur votre voix de marque', 'Calendrier de contenu social et production', 'Copywriting de landing pages et optimisation de conversion', 'Analyse de performance du contenu et itération']
  },
  'ai-solutions': {
    en: ['Custom AI chatbot for lead qualification or support', 'Workflow automation (CRM, emails, reporting)', 'AI-powered data analysis and insights', 'Integration with your existing tools'],
    fr: ['Chatbot IA sur-mesure pour qualification ou support', 'Automatisation de workflows (CRM, emails, reporting)', 'Analyse de données et insights propulsés par l\'IA', 'Intégration avec vos outils existants']
  },
  'ai-training': {
    en: ['Hands-on AI workshops for your team', 'Prompt engineering and tool mastery', 'Custom use cases for your industry', 'Follow-up resources and support'],
    fr: ['Ateliers IA pratiques pour votre équipe', 'Maîtrise du prompt engineering et des outils', 'Cas d\'usage personnalisés pour votre secteur', 'Ressources de suivi et support']
  },
  'tracking-reporting': {
    en: ['Google Tag Manager and GA4 setup', 'Conversion pixels across all ad platforms', 'Cookie consent banner (GDPR compliant)', 'Centralized reporting dashboard'],
    fr: ['Configuration Google Tag Manager et GA4', 'Pixels de conversion sur toutes les plateformes', 'Bannière de consentement cookies (conforme RGPD)', 'Dashboard de reporting centralisé']
  }
};

// ---- Budget label helpers ----
// Aligned with ControlAI pack naming: Essentials → Growth → Impact

export function getBudgetLabel(value: number, lang: 'en' | 'fr'): string {
  if (value <= 1000) return lang === 'fr' ? 'Démarrage' : 'Getting started';
  if (value <= 2500) return lang === 'fr' ? 'Essentiel' : 'Essentials';
  if (value <= 5000) return lang === 'fr' ? 'Croissance' : 'Growth';
  if (value <= 10000) return lang === 'fr' ? 'Accélération' : 'Acceleration';
  return lang === 'fr' ? 'Impact' : 'Impact';
}
