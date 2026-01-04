import { defineCollection, z } from 'astro:content';

// Service page schema
const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDescription: z.string().optional(),
    icon: z.string().optional(),
    color: z.enum(['seo', 'ads', 'social', 'abm', 'training', 'emailing', 'ai', 'tracking', 'primary']).default('primary'),
    order: z.number().default(0),

    // Hero section
    hero: z.object({
      badge: z.string().optional(),
      headline: z.string(),
      subheadline: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    // Metrics/stats
    metrics: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),

    // Features list
    features: z.array(z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string(),
    })).optional(),

    // Process steps
    process: z.array(z.object({
      step: z.number(),
      title: z.string(),
      description: z.string(),
    })).optional(),

    // Related case study
    caseStudy: z.string().optional(),

    // Testimonial
    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
      company: z.string(),
      image: z.string().optional(),
      companyLogo: z.string().optional(),
    }).optional(),

    // SEO
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    // Calculator service ID
    calculatorServiceId: z.string().optional(),
  }),
});

// Case studies schema
const caseStudiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    category: z.enum(['automotive', 'b2b-tech']),
    description: z.string(),
    image: z.string(),
    logo: z.string().optional(),
    date: z.date(),
    featured: z.boolean().default(false),

    // Services used
    services: z.array(z.string()),

    // Key Performance Indicators - main stats to highlight
    kpis: z.array(z.object({
      value: z.string(),
      label: z.string(),
      icon: z.string().optional(),
    })),

    // Challenge faced
    challenge: z.string(),

    // Solution provided
    solution: z.string(),

    // Testimonial
    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
      image: z.string().optional(),
    }).optional(),

    // SEO
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

// Blog posts schema
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    date: z.date(),
    updatedDate: z.date().optional(),
    image: z.string(),
    category: z.enum(['abm', 'ai', 'paid-ads', 'seo', 'marketing-ops', 'strategy', 'company-news']),
    industry: z.enum(['automotive', 'b2b-tech', 'general']).default('general'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),

    // SEO
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

// Training pages schema
const trainingCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    format: z.enum(['remote', 'onsite', 'hybrid']),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    price: z.string().optional(),

    // What you'll learn
    learningOutcomes: z.array(z.string()),

    // Target audience
    audience: z.array(z.string()),

    // Curriculum/modules
    modules: z.array(z.object({
      title: z.string(),
      topics: z.array(z.string()),
    })).optional(),

    // Trainer info
    trainer: z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      image: z.string(),
    }).optional(),

    // SEO
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

// Pages schema (for static pages like About, Contact, etc.)
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),

    // SEO
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

// Automotive pages schema
const automotiveCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDescription: z.string().optional(),
    color: z.enum(['automotive', 'ads', 'social', 'primary']).default('automotive'),
    order: z.number().default(0),

    // Hero section
    hero: z.object({
      badge: z.string().optional(),
      headline: z.string(),
      subheadline: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    // Metrics/stats
    metrics: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),

    // Benchmarks
    benchmarks: z.array(z.object({
      logo: z.string(),
      logoAlt: z.string(),
      value: z.string(),
      label: z.string(),
      comparison: z.string().optional(),
    })).optional(),

    // Use cases (New Cars, Used Cars, Events)
    useCases: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      image: z.string().optional(),
      features: z.array(z.string()).optional(),
    })).optional(),

    // Team members
    team: z.array(z.object({
      name: z.string(),
      role: z.string(),
      image: z.string(),
      responsibilities: z.array(z.object({
        category: z.string(),
        items: z.array(z.string()),
      })),
    })).optional(),

    // Client logos
    clients: z.array(z.object({
      name: z.string(),
      logo: z.string(),
    })).optional(),

    // FAQ
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),

    // Related case study
    caseStudy: z.string().optional(),

    // SEO
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    // Calculator service ID
    calculatorServiceId: z.string().optional(),

    // Testimonial
    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
      company: z.string(),
      image: z.string().optional(),
      companyLogo: z.string().optional(),
    }).optional(),

    // Why Section
    whySection: z.object({
      title: z.string(),
      description: z.string(),
      benefits: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      })),
    }).optional(),

    // Services/Features
    services: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      items: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      })),
    }).optional(),
  }),
});

export const collections = {
  services: servicesCollection,
  'case-studies': caseStudiesCollection,
  blog: blogCollection,
  training: trainingCollection,
  pages: pagesCollection,
  automotive: automotiveCollection,
};
