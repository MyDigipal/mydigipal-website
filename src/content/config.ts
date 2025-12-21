import { defineCollection, z } from 'astro:content';

// Service page schema
const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDescription: z.string().optional(),
    icon: z.string().optional(),
    color: z.enum(['seo', 'ads', 'social', 'abm', 'training', 'emailing', 'primary']).default('primary'),
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
    industry: z.string(),
    description: z.string(),
    image: z.string(),
    logo: z.string().optional(),
    date: z.date(),
    featured: z.boolean().default(false),

    // Services used
    services: z.array(z.string()),

    // Results
    results: z.array(z.object({
      metric: z.string(),
      value: z.string(),
      description: z.string().optional(),
    })),

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
    category: z.string(),
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

export const collections = {
  services: servicesCollection,
  'case-studies': caseStudiesCollection,
  blog: blogCollection,
  training: trainingCollection,
  pages: pagesCollection,
};
