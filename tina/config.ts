import { defineConfig } from 'tinacms';

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,

  // Get this from tina.io (optional for local mode)
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      // ================================
      // SERVICES COLLECTION
      // ================================
      {
        name: 'services_en',
        label: 'Services (EN)',
        path: 'src/content/services/en',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            required: true,
            isTitle: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'shortDescription',
            label: 'Short Description',
          },
          {
            type: 'string',
            name: 'icon',
            label: 'Icon',
            description: 'Icon name (e.g., search, bar-chart, zap)',
          },
          {
            type: 'string',
            name: 'color',
            label: 'Color Theme',
            options: ['seo', 'ads', 'social', 'abm', 'primary'],
          },
          {
            type: 'number',
            name: 'order',
            label: 'Display Order',
          },
          // Hero section
          {
            type: 'object',
            name: 'hero',
            label: 'Hero Section',
            fields: [
              { type: 'string', name: 'badge', label: 'Badge Text' },
              { type: 'string', name: 'headline', label: 'Headline', required: true },
              { type: 'string', name: 'subheadline', label: 'Subheadline' },
              { type: 'image', name: 'image', label: 'Hero Image' },
            ],
          },
          // Metrics
          {
            type: 'object',
            name: 'metrics',
            label: 'Metrics',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label || 'Metric' }),
            },
            fields: [
              { type: 'string', name: 'value', label: 'Value', required: true },
              { type: 'string', name: 'label', label: 'Label', required: true },
            ],
          },
          // Features
          {
            type: 'object',
            name: 'features',
            label: 'Features',
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || 'Feature' }),
            },
            fields: [
              { type: 'string', name: 'icon', label: 'Icon' },
              { type: 'string', name: 'title', label: 'Title', required: true },
              {
                type: 'string',
                name: 'description',
                label: 'Description',
                required: true,
                ui: { component: 'textarea' },
              },
            ],
          },
          // Process steps
          {
            type: 'object',
            name: 'process',
            label: 'Process Steps',
            list: true,
            ui: {
              itemProps: (item) => ({ label: `Step ${item?.step}: ${item?.title}` || 'Step' }),
            },
            fields: [
              { type: 'number', name: 'step', label: 'Step Number', required: true },
              { type: 'string', name: 'title', label: 'Title', required: true },
              {
                type: 'string',
                name: 'description',
                label: 'Description',
                required: true,
                ui: { component: 'textarea' },
              },
            ],
          },
          // Case study reference
          {
            type: 'string',
            name: 'caseStudy',
            label: 'Related Case Study (slug)',
          },
          // Testimonial
          {
            type: 'object',
            name: 'testimonial',
            label: 'Testimonial',
            fields: [
              {
                type: 'string',
                name: 'quote',
                label: 'Quote',
                required: true,
                ui: { component: 'textarea' },
              },
              { type: 'string', name: 'author', label: 'Author Name', required: true },
              { type: 'string', name: 'role', label: 'Role', required: true },
              { type: 'string', name: 'company', label: 'Company', required: true },
              { type: 'image', name: 'image', label: 'Author Image' },
            ],
          },
          // Calculator service ID
          {
            type: 'string',
            name: 'calculatorServiceId',
            label: 'Calculator Service ID',
          },
          // SEO
          {
            type: 'object',
            name: 'seo',
            label: 'SEO Settings',
            fields: [
              { type: 'string', name: 'title', label: 'SEO Title' },
              {
                type: 'string',
                name: 'description',
                label: 'SEO Description',
                ui: { component: 'textarea' },
              },
              { type: 'image', name: 'image', label: 'OG Image' },
            ],
          },
          // Body content
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body Content',
            isBody: true,
          },
        ],
      },
      {
        name: 'services_fr',
        label: 'Services (FR)',
        path: 'src/content/services/fr',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Titre',
            required: true,
            isTitle: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'shortDescription',
            label: 'Description courte',
          },
          {
            type: 'string',
            name: 'icon',
            label: 'Icone',
          },
          {
            type: 'string',
            name: 'color',
            label: 'Couleur',
            options: ['seo', 'ads', 'social', 'abm', 'primary'],
          },
          {
            type: 'number',
            name: 'order',
            label: 'Ordre',
          },
          {
            type: 'object',
            name: 'hero',
            label: 'Section Hero',
            fields: [
              { type: 'string', name: 'badge', label: 'Badge' },
              { type: 'string', name: 'headline', label: 'Titre principal', required: true },
              { type: 'string', name: 'subheadline', label: 'Sous-titre' },
              { type: 'image', name: 'image', label: 'Image' },
            ],
          },
          {
            type: 'object',
            name: 'metrics',
            label: 'Metriques',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label || 'Metrique' }) },
            fields: [
              { type: 'string', name: 'value', label: 'Valeur', required: true },
              { type: 'string', name: 'label', label: 'Label', required: true },
            ],
          },
          {
            type: 'object',
            name: 'features',
            label: 'Fonctionnalites',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'Feature' }) },
            fields: [
              { type: 'string', name: 'icon', label: 'Icone' },
              { type: 'string', name: 'title', label: 'Titre', required: true },
              { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'process',
            label: 'Etapes du processus',
            list: true,
            ui: { itemProps: (item) => ({ label: `Etape ${item?.step}: ${item?.title}` || 'Etape' }) },
            fields: [
              { type: 'number', name: 'step', label: 'Numero', required: true },
              { type: 'string', name: 'title', label: 'Titre', required: true },
              { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
            ],
          },
          { type: 'string', name: 'caseStudy', label: 'Case Study (slug)' },
          {
            type: 'object',
            name: 'testimonial',
            label: 'Temoignage',
            fields: [
              { type: 'string', name: 'quote', label: 'Citation', required: true, ui: { component: 'textarea' } },
              { type: 'string', name: 'author', label: 'Auteur', required: true },
              { type: 'string', name: 'role', label: 'Role', required: true },
              { type: 'string', name: 'company', label: 'Entreprise', required: true },
              { type: 'image', name: 'image', label: 'Photo' },
            ],
          },
          { type: 'string', name: 'calculatorServiceId', label: 'Calculator Service ID' },
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Titre SEO' },
              { type: 'string', name: 'description', label: 'Description SEO', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Image OG' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Contenu', isBody: true },
        ],
      },

      // ================================
      // BLOG COLLECTION
      // ================================
      {
        name: 'blog_en',
        label: 'Blog (EN)',
        path: 'src/content/blog/en',
        format: 'mdx',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
          { type: 'string', name: 'author', label: 'Author', required: true },
          { type: 'datetime', name: 'date', label: 'Date', required: true },
          { type: 'datetime', name: 'updatedDate', label: 'Updated Date' },
          { type: 'image', name: 'image', label: 'Featured Image', required: true },
          {
            type: 'string',
            name: 'category',
            label: 'Category',
            required: true,
            options: ['SEO', 'Google Ads', 'Social Media', 'ABM', 'AI', 'Marketing Strategy'],
          },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          { type: 'boolean', name: 'featured', label: 'Featured' },
          { type: 'boolean', name: 'draft', label: 'Draft' },
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'SEO Title' },
              { type: 'string', name: 'description', label: 'SEO Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'OG Image' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Content', isBody: true },
        ],
      },
      {
        name: 'blog_fr',
        label: 'Blog (FR)',
        path: 'src/content/blog/fr',
        format: 'mdx',
        fields: [
          { type: 'string', name: 'title', label: 'Titre', required: true, isTitle: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
          { type: 'string', name: 'author', label: 'Auteur', required: true },
          { type: 'datetime', name: 'date', label: 'Date', required: true },
          { type: 'datetime', name: 'updatedDate', label: 'Mise a jour' },
          { type: 'image', name: 'image', label: 'Image', required: true },
          {
            type: 'string',
            name: 'category',
            label: 'Categorie',
            required: true,
            options: ['SEO', 'Google Ads', 'Reseaux Sociaux', 'ABM', 'IA', 'Strategie Marketing'],
          },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          { type: 'boolean', name: 'featured', label: 'A la une' },
          { type: 'boolean', name: 'draft', label: 'Brouillon' },
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Titre SEO' },
              { type: 'string', name: 'description', label: 'Description SEO', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Image OG' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Contenu', isBody: true },
        ],
      },

      // ================================
      // CASE STUDIES COLLECTION
      // ================================
      {
        name: 'caseStudies_en',
        label: 'Case Studies (EN)',
        path: 'src/content/case-studies/en',
        format: 'mdx',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'client', label: 'Client Name', required: true },
          { type: 'string', name: 'industry', label: 'Industry', required: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
          { type: 'image', name: 'image', label: 'Cover Image', required: true },
          { type: 'image', name: 'logo', label: 'Client Logo' },
          { type: 'datetime', name: 'date', label: 'Date', required: true },
          { type: 'boolean', name: 'featured', label: 'Featured' },
          {
            type: 'string',
            name: 'services',
            label: 'Services Used',
            list: true,
            options: ['SEO', 'Google Ads', 'Paid Social', 'ABM', 'Content Creation', 'Marketing Automation'],
          },
          {
            type: 'object',
            name: 'results',
            label: 'Results',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.metric || 'Result' }) },
            fields: [
              { type: 'string', name: 'metric', label: 'Metric Name', required: true },
              { type: 'string', name: 'value', label: 'Value', required: true },
              { type: 'string', name: 'description', label: 'Description' },
            ],
          },
          {
            type: 'object',
            name: 'testimonial',
            label: 'Testimonial',
            fields: [
              { type: 'string', name: 'quote', label: 'Quote', required: true, ui: { component: 'textarea' } },
              { type: 'string', name: 'author', label: 'Author', required: true },
              { type: 'string', name: 'role', label: 'Role', required: true },
              { type: 'image', name: 'image', label: 'Photo' },
            ],
          },
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'SEO Title' },
              { type: 'string', name: 'description', label: 'SEO Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'OG Image' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Content', isBody: true },
        ],
      },
      {
        name: 'caseStudies_fr',
        label: 'Case Studies (FR)',
        path: 'src/content/case-studies/fr',
        format: 'mdx',
        fields: [
          { type: 'string', name: 'title', label: 'Titre', required: true, isTitle: true },
          { type: 'string', name: 'client', label: 'Nom du client', required: true },
          { type: 'string', name: 'industry', label: 'Secteur', required: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
          { type: 'image', name: 'image', label: 'Image', required: true },
          { type: 'image', name: 'logo', label: 'Logo client' },
          { type: 'datetime', name: 'date', label: 'Date', required: true },
          { type: 'boolean', name: 'featured', label: 'A la une' },
          {
            type: 'string',
            name: 'services',
            label: 'Services utilises',
            list: true,
            options: ['SEO', 'Google Ads', 'Paid Social', 'ABM', 'Creation de contenu', 'Marketing Automation'],
          },
          {
            type: 'object',
            name: 'results',
            label: 'Resultats',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.metric || 'Resultat' }) },
            fields: [
              { type: 'string', name: 'metric', label: 'Nom', required: true },
              { type: 'string', name: 'value', label: 'Valeur', required: true },
              { type: 'string', name: 'description', label: 'Description' },
            ],
          },
          {
            type: 'object',
            name: 'testimonial',
            label: 'Temoignage',
            fields: [
              { type: 'string', name: 'quote', label: 'Citation', required: true, ui: { component: 'textarea' } },
              { type: 'string', name: 'author', label: 'Auteur', required: true },
              { type: 'string', name: 'role', label: 'Role', required: true },
              { type: 'image', name: 'image', label: 'Photo' },
            ],
          },
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Titre SEO' },
              { type: 'string', name: 'description', label: 'Description SEO', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Image OG' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Contenu', isBody: true },
        ],
      },

      // ================================
      // TRAINING COLLECTION
      // ================================
      {
        name: 'training_en',
        label: 'Training (EN)',
        path: 'src/content/training/en',
        format: 'mdx',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
          { type: 'string', name: 'duration', label: 'Duration', required: true },
          {
            type: 'string',
            name: 'format',
            label: 'Format',
            required: true,
            options: ['remote', 'onsite', 'hybrid'],
          },
          {
            type: 'string',
            name: 'level',
            label: 'Level',
            required: true,
            options: ['beginner', 'intermediate', 'advanced'],
          },
          { type: 'string', name: 'price', label: 'Price' },
          { type: 'string', name: 'learningOutcomes', label: 'Learning Outcomes', list: true },
          { type: 'string', name: 'audience', label: 'Target Audience', list: true },
          {
            type: 'object',
            name: 'modules',
            label: 'Modules',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'Module' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'topics', label: 'Topics', list: true },
            ],
          },
          {
            type: 'object',
            name: 'trainer',
            label: 'Trainer',
            fields: [
              { type: 'string', name: 'name', label: 'Name', required: true },
              { type: 'string', name: 'role', label: 'Role', required: true },
              { type: 'string', name: 'bio', label: 'Bio', required: true, ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Photo', required: true },
            ],
          },
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'SEO Title' },
              { type: 'string', name: 'description', label: 'SEO Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'OG Image' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Content', isBody: true },
        ],
      },
      {
        name: 'training_fr',
        label: 'Formations (FR)',
        path: 'src/content/training/fr',
        format: 'mdx',
        fields: [
          { type: 'string', name: 'title', label: 'Titre', required: true, isTitle: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
          { type: 'string', name: 'duration', label: 'Duree', required: true },
          {
            type: 'string',
            name: 'format',
            label: 'Format',
            required: true,
            options: ['remote', 'onsite', 'hybrid'],
          },
          {
            type: 'string',
            name: 'level',
            label: 'Niveau',
            required: true,
            options: ['beginner', 'intermediate', 'advanced'],
          },
          { type: 'string', name: 'price', label: 'Prix' },
          { type: 'string', name: 'learningOutcomes', label: 'Objectifs', list: true },
          { type: 'string', name: 'audience', label: 'Public cible', list: true },
          {
            type: 'object',
            name: 'modules',
            label: 'Modules',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'Module' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Titre', required: true },
              { type: 'string', name: 'topics', label: 'Sujets', list: true },
            ],
          },
          {
            type: 'object',
            name: 'trainer',
            label: 'Formateur',
            fields: [
              { type: 'string', name: 'name', label: 'Nom', required: true },
              { type: 'string', name: 'role', label: 'Role', required: true },
              { type: 'string', name: 'bio', label: 'Bio', required: true, ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Photo', required: true },
            ],
          },
          {
            type: 'object',
            name: 'seo',
            label: 'SEO',
            fields: [
              { type: 'string', name: 'title', label: 'Titre SEO' },
              { type: 'string', name: 'description', label: 'Description SEO', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Image OG' },
            ],
          },
          { type: 'rich-text', name: 'body', label: 'Contenu', isBody: true },
        ],
      },
    ],
  },
});
