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
      redirectToDefaultLocale: false, // Let _redirects handle the / -> /en redirect
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

  // Redirects are handled by public/_redirects file for proper 301s
  // Do NOT use Astro redirects in static mode (creates meta refresh pages)
});
