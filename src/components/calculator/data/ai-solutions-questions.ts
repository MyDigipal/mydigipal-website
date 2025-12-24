// AI Solutions - No pricing, just questions for custom quote

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
  description: 'Custom AI solutions tailored to your business needs',
  descriptionFr: 'Solutions IA sur-mesure adaptées à vos besoins business',
  color: '#8b5cf6',
  colorClass: 'violet',
  // This is a quote-based service, no fixed pricing
  isQuoteBased: true,
  quoteMessage: 'AI Solutions projects are custom-priced based on your specific needs. Fill out the form below and we\'ll get back to you with a personalized quote.',
  quoteMessageFr: 'Les projets AI Solutions sont tarifés sur-mesure selon vos besoins spécifiques. Remplissez le formulaire ci-dessous et nous vous recontacterons avec un devis personnalisé.'
};

export const aiSolutionsQuestions: AIQuestion[] = [
  {
    id: 'project_type',
    label: 'What type of AI project are you considering?',
    labelFr: 'Quel type de projet IA envisagez-vous ?',
    type: 'select',
    required: true,
    options: [
      {
        value: 'automation',
        label: 'Process Automation (workflows, data processing)',
        labelFr: 'Automatisation de processus (workflows, traitement de données)'
      },
      {
        value: 'chatbot',
        label: 'Chatbot / Virtual Assistant',
        labelFr: 'Chatbot / Assistant virtuel'
      },
      {
        value: 'content',
        label: 'Content Generation (text, images, video)',
        labelFr: 'Génération de contenu (texte, images, vidéo)'
      },
      {
        value: 'analytics',
        label: 'Data Analysis / Insights',
        labelFr: 'Analyse de données / Insights'
      },
      {
        value: 'integration',
        label: 'AI API Integration into existing tools',
        labelFr: 'Intégration d\'API IA dans vos outils existants'
      },
      {
        value: 'custom',
        label: 'Custom AI Solution',
        labelFr: 'Solution IA sur-mesure'
      },
      {
        value: 'not_sure',
        label: 'Not sure yet - need guidance',
        labelFr: 'Pas encore sûr - besoin de conseils'
      }
    ]
  },
  {
    id: 'current_tools',
    label: 'What tools/platforms do you currently use?',
    labelFr: 'Quels outils/plateformes utilisez-vous actuellement ?',
    type: 'textarea',
    placeholder: 'e.g., Salesforce, HubSpot, Google Workspace, Slack, custom CRM...',
    placeholderFr: 'ex: Salesforce, HubSpot, Google Workspace, Slack, CRM maison...',
    required: false
  },
  {
    id: 'problem',
    label: 'What problem are you trying to solve?',
    labelFr: 'Quel problème cherchez-vous à résoudre ?',
    type: 'textarea',
    placeholder: 'Describe the business challenge or opportunity you want to address with AI...',
    placeholderFr: 'Décrivez le défi business ou l\'opportunité que vous souhaitez adresser avec l\'IA...',
    required: true
  },
  {
    id: 'timeline',
    label: 'What is your ideal timeline?',
    labelFr: 'Quel est votre calendrier idéal ?',
    type: 'select',
    required: true,
    options: [
      {
        value: 'asap',
        label: 'As soon as possible',
        labelFr: 'Dès que possible'
      },
      {
        value: '1-3months',
        label: '1-3 months',
        labelFr: '1-3 mois'
      },
      {
        value: '3-6months',
        label: '3-6 months',
        labelFr: '3-6 mois'
      },
      {
        value: '6months+',
        label: '6+ months',
        labelFr: '6+ mois'
      },
      {
        value: 'exploring',
        label: 'Just exploring options',
        labelFr: 'Je fais le tour des options'
      }
    ]
  },
  {
    id: 'budget_range',
    label: 'What is your approximate budget range?',
    labelFr: 'Quelle est votre fourchette de budget approximative ?',
    type: 'select',
    required: false,
    options: [
      {
        value: 'under5k',
        label: 'Under €5,000',
        labelFr: 'Moins de 5 000€'
      },
      {
        value: '5k-15k',
        label: '€5,000 - €15,000',
        labelFr: '5 000€ - 15 000€'
      },
      {
        value: '15k-50k',
        label: '€15,000 - €50,000',
        labelFr: '15 000€ - 50 000€'
      },
      {
        value: '50k+',
        label: '€50,000+',
        labelFr: '50 000€+'
      },
      {
        value: 'not_sure',
        label: 'Not sure yet',
        labelFr: 'Pas encore défini'
      }
    ]
  },
  {
    id: 'additional_info',
    label: 'Anything else you\'d like to share?',
    labelFr: 'Autre chose que vous aimeriez partager ?',
    type: 'textarea',
    placeholder: 'Any additional context, specific requirements, or questions...',
    placeholderFr: 'Contexte additionnel, exigences spécifiques, ou questions...',
    required: false
  }
];

// Example use cases to show on the form
export const aiSolutionsUseCases = {
  en: [
    {
      icon: '⚡',
      title: 'Workflow Automation',
      description: 'Automate repetitive tasks with AI-powered workflows using N8N, Make, or custom solutions.'
    },
    {
      icon: '💬',
      title: 'Intelligent Chatbots',
      description: 'Deploy AI assistants trained on your documentation to handle customer queries 24/7.'
    },
    {
      icon: '📝',
      title: 'Content at Scale',
      description: 'Generate blog posts, product descriptions, or social content with your brand voice.'
    },
    {
      icon: '🔍',
      title: 'Data Intelligence',
      description: 'Extract insights from your data with AI-powered analysis and visualization.'
    }
  ],
  fr: [
    {
      icon: '⚡',
      title: 'Automatisation de Workflows',
      description: 'Automatisez les tâches répétitives avec des workflows IA via N8N, Make ou solutions sur-mesure.'
    },
    {
      icon: '💬',
      title: 'Chatbots Intelligents',
      description: 'Déployez des assistants IA formés sur votre documentation pour répondre aux clients 24/7.'
    },
    {
      icon: '📝',
      title: 'Contenu à l\'Échelle',
      description: 'Générez articles de blog, descriptions produits ou contenu social avec votre ton de marque.'
    },
    {
      icon: '🔍',
      title: 'Intelligence Data',
      description: 'Extrayez des insights de vos données avec analyse et visualisation alimentées par l\'IA.'
    }
  ]
};
