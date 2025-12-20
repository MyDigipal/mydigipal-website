import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mydigipal.com',

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          fr: 'fr',
        },
      },
    }),
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

  // Redirects
  redirects: {
    '/': '/en',
  },
});
