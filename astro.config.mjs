import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://mydigipal.com',

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    mdx(),
    // Custom sitemap at /sitemap.xml (see src/pages/sitemap.xml.ts)
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  // Build output for static hosting (Render)
  output: 'static',

  // Trailing slash for cleaner URLs
  trailingSlash: 'never',

  // Markdown configuration
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },

  // View Transitions
  prefetch: true,

  // Redirects from old Webflow URLs to new Astro structure
  redirects: {
    // Home
    '/': '/en',

    // Services (EN)
    '/paid-social': '/en/services/paid-social',
    '/paid-search': '/en/services/google-ads',
    '/seo': '/en/services/seo',
    '/email-marketing': '/en/services/emailing',
    '/ai-training': '/en/services/ai-training',
    '/content-creation': '/en/services/paid-social',
    '/display': '/en/services/google-ads',
    '/content-syndication': '/en',
    '/tools-and-solutions': '/en/services/ai-solutions',

    // Services (FR)
    '/fr/paid-social': '/fr/services/paid-social',
    '/fr/paid-search': '/fr/services/google-ads',
    '/fr/seo': '/fr/services/seo',
    '/fr/email-marketing': '/fr/services/emailing',
    '/fr/ai-training': '/fr/services/ai-training',
    '/fr/content-creation': '/fr/services/paid-social',
    '/fr/display': '/fr/services/google-ads',
    '/fr/content-syndication': '/fr',
    '/fr/tools-and-solutions': '/fr/services/ai-solutions',

    // B2B / ABM Pages
    '/abm': '/en/services/b2b-abm',
    '/campaign-management': '/en/services/b2b-abm',
    '/marketing-automation': '/en/services/b2b-abm',
    '/marketing-strategy': '/en/services/b2b-abm',
    '/abm-training': '/en/services/b2b-abm',
    '/fr/abm': '/fr/services/b2b-abm',
    '/fr/campaign-management': '/fr/services/b2b-abm',
    '/fr/marketing-automation': '/fr/services/b2b-abm',
    '/fr/marketing-strategy': '/fr/services/b2b-abm',
    '/fr/abm-training': '/fr/services/b2b-abm',

    // Automotive
    '/automotive/google-ads': '/en/automotive/google-ads',
    '/automotive/paid-social': '/en/automotive/paid-social',
    '/automotive/facebook-dynamic-ads': '/en/automotive/facebook-dynamic-ads',

    // Blog
    '/blogs': '/en/blog',
    '/fr/blogs': '/fr/blog',
    '/blog/abm-deck': '/en/blog/abm-deck',
    '/blog/beware-of-scammers': '/en/blog/beware-of-scammers',
    '/blog/facebook-dynamic-ads-for-automotive-dealers': '/en/blog/facebook-dynamic-ads-automotive',
    '/blog/google-consent-mode-v2': '/en/blog/google-consent-mode-v2',
    '/blog/how-people-really-use-chatgpt': '/en/blog/how-to-rank-on-chatgpt',
    '/blog/how-to-rank-on-chatgpt': '/en/blog/how-to-rank-on-chatgpt',
    '/blog/how-to-train-teams-on-ai': '/en/blog/how-to-train-teams-on-ai',
    '/blog/intent-data-in-b2b-marketing': '/en/blog/intent-data-b2b-marketing',
    '/blog/marketing-automation-tools': '/en/blog/marketing-automation-tools',
    '/blog/mydigipal-cx-ninjas-guide-to-partner-marketing': '/en/blog/partner-marketing-guide',
    '/blog/mydigipal-podcast-1-whats-wrong-with-your-abm': '/en/blog/podcast-abm',
    '/blog/open-source-ai-agents': '/en/blog/open-source-ai-agents',
    '/blog/revolutionizing-b2b-marketing-with-abm': '/en/blog/revolutionizing-b2b-with-abm',
    '/blog/successful-linkedin-strategy': '/en/blog/successful-linkedin-strategy',
    // French blog old URLs -> redirect to new French slugs
    '/fr/blog/facebook-dynamic-ads-for-automotive-dealers': '/fr/blog/facebook-dynamic-ads-automotive',
    '/fr/blog/how-people-really-use-chatgpt': '/fr/blog/how-to-rank-on-chatgpt',
    '/fr/blog/intent-data-in-b2b-marketing': '/fr/blog/intent-data-b2b-marketing',
    '/fr/blog/mydigipal-cx-ninjas-guide-to-partner-marketing': '/fr/blog/partner-marketing-guide',
    '/fr/blog/mydigipal-podcast-1-whats-wrong-with-your-abm': '/fr/blog/podcast-abm',
    '/fr/blog/revolutionizing-b2b-marketing-with-abm': '/fr/blog/revolutionizing-b2b-with-abm',

    // Case Studies
    '/case-studies': '/en/case-studies',
    '/case-study/abm-from-scratch-to-the-cloud': '/en/case-studies/quantum-metrics',
    '/case-study/dmd': '/en/case-studies/dmd-group',
    '/case-study/genesys-revamping-abm': '/en/case-studies/genesys',
    '/case-study/gwi-paid-media-success': '/en/case-studies/gwi',
    '/case-study/symbl-digital-marketing-introduction': '/en/case-studies/symbl-ai',
    '/case-study/theobald': '/en/case-studies/theobald-group',
    '/case-study/vulcain-group-increased-digital-strategy': '/en/case-studies/vulcain-group',
    '/fr/case-study/abm-from-scratch-to-the-cloud': '/fr/case-studies/quantum-metrics',
    '/fr/case-study/dmd': '/fr/case-studies/dmd-group',
    '/fr/case-study/genesys-revamping-abm': '/fr/case-studies/genesys',
    '/fr/case-study/gwi-paid-media-success': '/fr/case-studies/gwi',
    '/fr/case-study/symbl-digital-marketing-introduction': '/fr/case-studies/symbl-ai',
    '/fr/case-study/theobald': '/fr/case-studies/theobald-group',
    '/fr/case-study/vulcain-group-increased-digital-strategy': '/fr/case-studies/vulcain-group',

    // Other Pages
    '/contact-us': '/en/contact',
    '/fr/contact-us': '/fr/contact',
    '/our-team': '/en',
    '/fr/our-team': '/fr',
  },
});
