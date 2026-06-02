import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Service page schema
const servicesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDescription: z.string().optional(),
    icon: z.string().optional(),
    color: z.enum(['seo', 'ads', 'social', 'abm', 'training', 'emailing', 'ai', 'tracking', 'content', 'primary']).default('primary'),
    order: z.number().default(0),

    hero: z.object({
      badge: z.string().optional(),
      headline: z.string(),
      subheadline: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    metrics: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),

    features: z.array(z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string(),
    })).optional(),

    process: z.array(z.object({
      step: z.number(),
      title: z.string(),
      description: z.string(),
    })).optional(),

    caseStudy: z.string().optional(),

    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
      company: z.string(),
      image: z.string().optional(),
      companyLogo: z.string().optional(),
    }).optional(),

    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    calculatorServiceId: z.string().optional(),
  }),
});

const caseStudiesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    category: z.enum(['automotive', 'b2b-tech']),
    description: z.string(),
    image: z.string(),
    logo: z.string().optional(),
    date: z.date(),
    featured: z.boolean().default(false),

    services: z.array(z.string()),

    kpis: z.array(z.object({
      value: z.string(),
      label: z.string(),
      icon: z.string().optional(),
    })),

    challenge: z.string(),
    solution: z.string(),

    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
      image: z.string().optional(),
    }).optional(),

    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
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

    // Optional hero video (Remotion-generated intro). When present, an
    // autoplaying muted loop video is shown at the top of the article.
    // Articles without it keep their previous behavior unchanged.
    video: z.string().optional(),
    videoPoster: z.string().optional(),

    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
  }),
});

const trainingCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/training' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string(),
    format: z.enum(['remote', 'onsite', 'hybrid']),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    price: z.string().optional(),

    learningOutcomes: z.array(z.string()),
    audience: z.array(z.string()),

    modules: z.array(z.object({
      title: z.string(),
      topics: z.array(z.string()),
    })).optional(),

    trainer: z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      image: z.string(),
    }).optional(),

    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),

    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

const automotiveCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/automotive' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDescription: z.string().optional(),
    color: z.enum(['automotive', 'ads', 'social', 'primary']).default('automotive'),
    order: z.number().default(0),

    hero: z.object({
      badge: z.string().optional(),
      headline: z.string(),
      subheadline: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    metrics: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),

    benchmarks: z.array(z.object({
      logo: z.string(),
      logoAlt: z.string(),
      value: z.string(),
      label: z.string(),
      comparison: z.string().optional(),
    })).optional(),

    useCases: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      image: z.string().optional(),
      features: z.array(z.string()).optional(),
    })).optional(),

    team: z.array(z.object({
      name: z.string(),
      role: z.string(),
      image: z.string(),
      responsibilities: z.array(z.object({
        category: z.string(),
        items: z.array(z.string()),
      })),
    })).optional(),

    clients: z.array(z.object({
      name: z.string(),
      logo: z.string(),
    })).optional(),

    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),

    caseStudy: z.string().optional(),

    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    calculatorServiceId: z.string().optional(),

    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
      company: z.string(),
      image: z.string().optional(),
      companyLogo: z.string().optional(),
    }).optional(),

    whySection: z.object({
      title: z.string(),
      description: z.string(),
      benefits: z.array(z.object({
        icon: z.string(),
        title: z.string(),
        description: z.string(),
      })),
    }).optional(),

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

const jobsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/jobs' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    lang: z.enum(['en', 'fr']).default('en'),
    status: z.enum(['open', 'closed', 'draft']).default('open'),
    format: z.string(),
    location: z.string(),
    hours: z.string().optional(),
    duration: z.string().optional(),
    start_date: z.string().optional(),
    posted_date: z.date().optional(),
    hide_client: z.boolean().default(false),
    pitch: z.string(),
    apply_email: z.string().default('heather@mydigipal.com'),

    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),

    questions_optional: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(['text', 'url', 'textarea']),
      placeholder: z.string().optional(),
      help: z.string().optional(),
    })).default([]),

    scoring_prompt: z.string().optional(),
  }),
});

export const collections = {
  services: servicesCollection,
  'case-studies': caseStudiesCollection,
  blog: blogCollection,
  training: trainingCollection,
  pages: pagesCollection,
  automotive: automotiveCollection,
  jobs: jobsCollection,
};
