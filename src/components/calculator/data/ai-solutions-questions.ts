// AI Solutions - Restructured with concrete packages + custom quote option
// REFONTE : Formulaire vague → 4 packages concrets + option sur-mesure

import type { ServiceItem } from '../types';

export interface AIQuestion {
  id: string;
  label: string;
  labelFr: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  placeholderFr?: string;
  options?: { value: string; label: string; labelFr: string }[];
  required?: boolean;
}

export const aiSolutionsConfig = {
  id: 'ai-solutions',
  name: 'AI Solutions',
  nameFr: 'Solutions IA',
  icon: '🤖',
  description: 'Custom AI agents, chatbots and automation workflows for your business',
  descriptionFr: 'Agents IA, chatbots et workflows d\'automatisation sur-mesure pour votre business',
  color: '#8b5cf6',
  colorClass: 'violet',
  // Now has both packages AND a custom quote option
  isQuoteBased: false,
  hasPackages: true,
  quoteMessage: 'Need something more specific? Fill out the form below for a custom quote.',
  quoteMessageFr: 'Besoin de quelque chose de plus spécifique ? Remplissez le formulaire ci-dessous pour un devis sur-mesure.'
};

// NEW: Concrete service packages for AI Solutions
export const aiSolutionsServices: ServiceItem[] = [
  {
    id: 'ai-chatbot',
    title: 'A. Chatbot IA',
    titleEn: 'A. AI Chatbot',
    description: 'Agent conversationnel intelligent formé sur votre documentation pour répondre aux clients 24/7.',
    descriptionEn: 'Intelligent conversational agent trained on your documentation to serve customers 24/7.',
    icon: '💬',
    isOneOff: true,
    detailedInfo: {
      title: 'Chatbot IA - C\'est quoi exactement ?',
      content: {
        intro: 'Un assistant IA personnalisé qui répond aux questions de vos clients et prospects en s\'appuyant sur votre base de connaissances.',
        sections: [
          {
            title: 'Ce que nous développons',
            items: [
              'Chatbot formé sur votre documentation (FAQ, guides, produits)',
              'Intégration sur votre site web (widget personnalisé)',
              'Compréhension du contexte et des intentions',
              'Escalade vers un humain quand nécessaire',
              'Multi-langue (FR/EN et autres sur demande)'
            ]
          },
          {
            title: 'Technologies utilisées',
            items: [
              'Claude / GPT avec RAG (Retrieval Augmented Generation)',
              'Base de connaissances vectorielle',
              'N8N ou Make pour les intégrations',
              'API custom si nécessaire'
            ]
          }
        ],
        conclusion: 'Livrable : Chatbot déployé, documenté et testé. Formation de votre équipe incluse.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 2000,
        features: [
          'Chatbot FAQ sur votre site',
          'Formé sur 20-50 pages de documentation',
          'Widget personnalisé à vos couleurs',
          'Support 1 mois inclus'
        ],
        featuresEn: [
          'FAQ chatbot on your site',
          'Trained on 20-50 documentation pages',
          'Custom-branded widget',
          '1 month support included'
        ],
        recommended: 'FAQ et support client basique',
        recommendedEn: 'Basic FAQ and customer support'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 4000,
        features: [
          'Chatbot intelligent multi-sources',
          'Intégration CRM (leads capturés)',
          'Logique conditionnelle avancée',
          'Escalade humaine configurée',
          'Analytics des conversations',
          'Support 2 mois inclus'
        ],
        featuresEn: [
          'Multi-source intelligent chatbot',
          'CRM integration (leads captured)',
          'Advanced conditional logic',
          'Human escalation configured',
          'Conversation analytics',
          '2 months support included'
        ],
        recommended: 'Support client et génération de leads',
        recommendedEn: 'Customer support and lead generation',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 8000,
        priceNote: 'À partir de',
        priceNoteEn: 'Starting from',
        features: [
          'Agent IA conversationnel avancé',
          'Multi-canal (site, WhatsApp, Messenger)',
          'Intégrations API tierces',
          'Personnalité et ton de marque',
          'Multilingue',
          'Support 3 mois + maintenance'
        ],
        featuresEn: [
          'Advanced conversational AI agent',
          'Multi-channel (site, WhatsApp, Messenger)',
          'Third-party API integrations',
          'Brand voice and personality',
          'Multilingual',
          '3 months support + maintenance'
        ],
        recommended: 'Agent IA complet, multi-canal',
        recommendedEn: 'Complete AI agent, multi-channel'
      }
    ]
  },
  {
    id: 'ai-workflow',
    title: 'B. Workflow Automation',
    titleEn: 'B. Workflow Automation',
    description: 'Automatisation de vos processus métier répétitifs avec des workflows IA intelligents.',
    descriptionEn: 'Automation of your repetitive business processes with intelligent AI workflows.',
    icon: '⚡',
    isOneOff: true,
    detailedInfo: {
      title: 'Workflow Automation - C\'est quoi exactement ?',
      content: {
        intro: 'On identifie et automatise les tâches répétitives qui vous font perdre du temps, avec des workflows IA connectés à vos outils.',
        sections: [
          {
            title: 'Exemples d\'automatisations',
            items: [
              'Traitement automatique des leads entrants',
              'Enrichissement de données CRM',
              'Génération de rapports automatiques',
              'Synchronisation entre outils (CRM, email, facturation)',
              'Alertes et notifications intelligentes',
              'Extraction et classement de documents'
            ]
          },
          {
            title: 'Technologies utilisées',
            items: [
              'N8N (self-hosted, sécurisé)',
              'Make / Zapier',
              'API directes quand nécessaire',
              'Claude / GPT pour l\'intelligence'
            ]
          }
        ],
        conclusion: 'ROI typique : 10-20h/mois économisées par workflow automatisé.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 1500,
        features: [
          '1-2 workflows simples',
          'Connexion de 2-3 outils',
          'Documentation technique',
          'Formation utilisation'
        ],
        featuresEn: [
          '1-2 simple workflows',
          '2-3 tool connections',
          'Technical documentation',
          'Usage training'
        ],
        recommended: 'Automatiser une tâche précise',
        recommendedEn: 'Automate a specific task'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 3500,
        features: [
          '3-5 workflows interconnectés',
          'Logique IA intégrée (classification, extraction)',
          'Intégrations multi-outils',
          'Monitoring et alertes',
          'Support 1 mois'
        ],
        featuresEn: [
          '3-5 interconnected workflows',
          'Integrated AI logic (classification, extraction)',
          'Multi-tool integrations',
          'Monitoring and alerts',
          '1 month support'
        ],
        recommended: 'Automatiser plusieurs processus',
        recommendedEn: 'Automate multiple processes',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 7000,
        priceNote: 'À partir de',
        priceNoteEn: 'Starting from',
        features: [
          'Système d\'automatisation complet',
          'Workflows complexes avec IA avancée',
          'API custom + webhooks',
          'Dashboard de monitoring',
          'Support 2 mois + maintenance',
          'Documentation complète'
        ],
        featuresEn: [
          'Complete automation system',
          'Complex workflows with advanced AI',
          'Custom API + webhooks',
          'Monitoring dashboard',
          '2 months support + maintenance',
          'Complete documentation'
        ],
        recommended: 'Transformation digitale complète',
        recommendedEn: 'Complete digital transformation'
      }
    ]
  },
  {
    id: 'ai-maintenance',
    title: 'C. Maintenance & Support IA',
    titleEn: 'C. AI Maintenance & Support',
    description: 'Support continu, mises à jour et évolutions de vos solutions IA existantes.',
    descriptionEn: 'Ongoing support, updates and evolution of your existing AI solutions.',
    icon: '🔧',
    detailedInfo: {
      title: 'Maintenance IA - C\'est quoi exactement ?',
      content: {
        intro: 'Vos solutions IA nécessitent un suivi pour rester performantes et évoluer avec vos besoins.',
        sections: [
          {
            title: 'Ce qui est inclus',
            items: [
              'Monitoring des performances',
              'Mise à jour des modèles et bases de connaissances',
              'Corrections de bugs et optimisations',
              'Ajout de nouvelles fonctionnalités mineures',
              'Support technique par email',
              'Reporting mensuel d\'utilisation'
            ]
          }
        ],
        conclusion: 'Gardez vos solutions IA à jour et performantes.'
      }
    },
    levels: [
      {
        name: 'Essentiel',
        nameEn: 'Essential',
        price: 200,
        features: [
          'Monitoring basique',
          'Mises à jour trimestrielles',
          'Support email (48h)',
          'Corrections de bugs'
        ],
        featuresEn: [
          'Basic monitoring',
          'Quarterly updates',
          'Email support (48h)',
          'Bug fixes'
        ],
        recommended: 'Solutions simples, peu d\'évolutions',
        recommendedEn: 'Simple solutions, few changes'
      },
      {
        name: 'Avancé',
        nameEn: 'Advanced',
        price: 400,
        features: [
          'Monitoring continu',
          'Mises à jour mensuelles',
          'Support email réactif (24h)',
          'Évolutions mineures incluses',
          'Call mensuel'
        ],
        featuresEn: [
          'Continuous monitoring',
          'Monthly updates',
          'Responsive email support (24h)',
          'Minor evolutions included',
          'Monthly call'
        ],
        recommended: 'Solutions en production active',
        recommendedEn: 'Active production solutions',
        popular: true
      },
      {
        name: 'Premium',
        nameEn: 'Premium',
        price: 700,
        features: [
          'Monitoring temps réel + alertes',
          'Mises à jour bi-hebdomadaires',
          'Support prioritaire (4h)',
          'Évolutions et nouvelles features',
          'Call bi-mensuel + reporting',
          'SLA garanti'
        ],
        featuresEn: [
          'Real-time monitoring + alerts',
          'Bi-weekly updates',
          'Priority support (4h)',
          'Evolutions and new features',
          'Bi-monthly call + reporting',
          'Guaranteed SLA'
        ],
        recommended: 'Solutions critiques, évolutions fréquentes',
        recommendedEn: 'Critical solutions, frequent evolutions'
      }
    ]
  }
];

// Keep questions for custom quote option (shown when user picks "Custom AI Agent")
export const aiSolutionsQuestions: AIQuestion[] = [
  {
    id: 'project_type',
    label: 'What type of AI project are you considering?',
    labelFr: 'Quel type de projet IA envisagez-vous ?',
    type: 'select',
    required: true,
    options: [
      { value: 'agent', label: 'Custom AI Agent (multi-tool, complex)', labelFr: 'Agent IA sur-mesure (multi-outils, complexe)' },
      { value: 'data', label: 'Data Analysis / Business Intelligence', labelFr: 'Analyse de données / Business Intelligence' },
      { value: 'content', label: 'Content Generation System', labelFr: 'Système de génération de contenu' },
      { value: 'integration', label: 'AI API Integration', labelFr: 'Intégration d\'API IA' },
      { value: 'not_sure', label: 'Not sure yet - need guidance', labelFr: 'Pas encore sûr - besoin de conseils' }
    ]
  },
  {
    id: 'problem',
    label: 'What problem are you trying to solve?',
    labelFr: 'Quel problème cherchez-vous à résoudre ?',
    type: 'textarea',
    placeholder: 'Describe the business challenge or opportunity...',
    placeholderFr: 'Décrivez le défi business ou l\'opportunité...',
    required: true
  },
  {
    id: 'current_tools',
    label: 'What tools/platforms do you currently use?',
    labelFr: 'Quels outils/plateformes utilisez-vous actuellement ?',
    type: 'textarea',
    placeholder: 'e.g., Salesforce, HubSpot, Google Workspace, Slack...',
    placeholderFr: 'ex: Salesforce, HubSpot, Google Workspace, Slack...',
    required: false
  },
  {
    id: 'timeline',
    label: 'What is your ideal timeline?',
    labelFr: 'Quel est votre calendrier idéal ?',
    type: 'select',
    required: true,
    options: [
      { value: 'asap', label: 'As soon as possible', labelFr: 'Dès que possible' },
      { value: '1-3months', label: '1-3 months', labelFr: '1-3 mois' },
      { value: '3-6months', label: '3-6 months', labelFr: '3-6 mois' },
      { value: 'exploring', label: 'Just exploring options', labelFr: 'Je fais le tour des options' }
    ]
  },
  {
    id: 'budget_range',
    label: 'What is your approximate budget range?',
    labelFr: 'Quelle est votre fourchette de budget approximative ?',
    type: 'select',
    required: false,
    options: [
      { value: 'under5k', label: 'Under €5,000', labelFr: 'Moins de 5 000€' },
      { value: '5k-15k', label: '€5,000 - €15,000', labelFr: '5 000€ - 15 000€' },
      { value: '15k-50k', label: '€15,000 - €50,000', labelFr: '15 000€ - 50 000€' },
      { value: '50k+', label: '€50,000+', labelFr: '50 000€+' },
      { value: 'not_sure', label: 'Not sure yet', labelFr: 'Pas encore défini' }
    ]
  }
];

// Use cases for display
export const aiSolutionsUseCases = {
  en: [
    { icon: '💬', title: 'AI Chatbot', description: 'Deploy an AI assistant trained on your docs to handle queries 24/7.' },
    { icon: '⚡', title: 'Workflow Automation', description: 'Automate repetitive tasks with AI-powered workflows using N8N or Make.' },
    { icon: '🧠', title: 'Custom AI Agent', description: 'Build a complex AI agent tailored to your specific business needs.' },
    { icon: '🔧', title: 'AI Maintenance', description: 'Keep your AI solutions running smoothly with ongoing support.' }
  ],
  fr: [
    { icon: '💬', title: 'Chatbot IA', description: 'Déployez un assistant IA formé sur votre documentation pour répondre 24/7.' },
    { icon: '⚡', title: 'Automatisation', description: 'Automatisez les tâches répétitives avec des workflows IA via N8N ou Make.' },
    { icon: '🧠', title: 'Agent IA Sur-mesure', description: 'Développez un agent IA complexe adapté à vos besoins spécifiques.' },
    { icon: '🔧', title: 'Maintenance IA', description: 'Gardez vos solutions IA performantes avec un support continu.' }
  ]
};
