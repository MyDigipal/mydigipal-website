import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const site = 'https://mydigipal.com';
const languages = ['en', 'fr'];

interface ImageInfo {
  loc: string;
  caption?: string;
  title?: string;
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: { lang: string; href: string }[];
  images?: ImageInfo[];
}

export const GET: APIRoute = async () => {
  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Helper to add bilingual pages
  const addBilingualPage = (
    path: string,
    priority: number,
    changefreq: SitemapUrl['changefreq'] = 'weekly',
    images?: ImageInfo[]
  ) => {
    for (const lang of languages) {
      const fullPath = `/${lang}${path}`;
      urls.push({
        loc: `${site}${fullPath}`,
        lastmod: today,
        changefreq,
        priority,
        alternates: [
          // x-default for search engines (points to English version)
          { lang: 'x-default', href: `${site}/en${path}` },
          // All language versions
          ...languages.map((l) => ({
            lang: l,
            href: `${site}/${l}${path}`,
          })),
        ],
        images: lang === 'en' ? images : undefined, // Only add images once (on EN version)
      });
    }
  };

  // ==================
  // STATIC PAGES
  // ==================

  // Homepage (highest priority)
  addBilingualPage('', 1.0, 'daily');

  // Contact
  addBilingualPage('/contact', 0.8, 'monthly');

  // Calculator
  addBilingualPage('/calculator', 0.9, 'monthly');

  // Blog index
  addBilingualPage('/blog', 0.9, 'daily');

  // Case studies index
  addBilingualPage('/case-studies', 0.8, 'weekly');

  // Services index
  addBilingualPage('/services', 0.9, 'weekly');

  // AI Services hub
  addBilingualPage('/ai', 0.9, 'weekly');

  // Automotive hub
  addBilingualPage('/automotive', 0.9, 'weekly');

  // Legal pages
  addBilingualPage('/privacy-policy', 0.3, 'yearly');
  addBilingualPage('/terms-of-service', 0.3, 'yearly');

  // ==================
  // SERVICES (from content collection)
  // ==================
  try {
    const services = await getCollection('services', ({ id }) => id.startsWith('en/'));
    for (const service of services) {
      const slug = service.slug.replace('en/', '');
      const images: ImageInfo[] = [];

      if (service.data.hero?.image) {
        const imgUrl = service.data.hero.image.startsWith('http')
          ? service.data.hero.image
          : `${site}${service.data.hero.image}`;
        images.push({
          loc: imgUrl,
          caption: service.data.title,
          title: service.data.title
        });
      }

      addBilingualPage(`/services/${slug}`, 0.8, 'monthly', images.length > 0 ? images : undefined);
    }
  } catch (e) {
    // Services collection might not exist
  }

  // ==================
  // BLOG POSTS (from content collection)
  // ==================
  try {
    const posts = await getCollection('blog', ({ id }) => id.startsWith('en/'));
    for (const post of posts) {
      const slug = post.slug.replace('en/', '');
      const images: ImageInfo[] = [];

      if (post.data.image) {
        const imgUrl = post.data.image.startsWith('http')
          ? post.data.image
          : `${site}${post.data.image}`;
        images.push({
          loc: imgUrl,
          caption: post.data.title,
          title: post.data.title
        });
      }

      addBilingualPage(`/blog/${slug}`, 0.7, 'monthly', images.length > 0 ? images : undefined);
    }
  } catch (e) {
    // Blog collection might not exist
  }

  // ==================
  // CASE STUDIES (from content collection)
  // ==================
  try {
    const caseStudies = await getCollection('case-studies', ({ id }) => id.startsWith('en/'));
    for (const study of caseStudies) {
      const slug = study.slug.replace('en/', '');
      const images: ImageInfo[] = [];

      if (study.data.image) {
        const imgUrl = study.data.image.startsWith('http')
          ? study.data.image
          : `${site}${study.data.image}`;
        images.push({
          loc: imgUrl,
          caption: `${study.data.client} - ${study.data.title}`,
          title: study.data.client
        });
      }

      if (study.data.logo) {
        const logoUrl = study.data.logo.startsWith('http')
          ? study.data.logo
          : `${site}${study.data.logo}`;
        images.push({
          loc: logoUrl,
          caption: `${study.data.client} logo`,
          title: `${study.data.client} logo`
        });
      }

      addBilingualPage(`/case-studies/${slug}`, 0.7, 'monthly', images.length > 0 ? images : undefined);
    }
  } catch (e) {
    // Case studies collection might not exist
  }

  // ==================
  // AUTOMOTIVE PAGES (from content collection)
  // ==================
  try {
    const automotive = await getCollection('automotive', ({ id }) => id.startsWith('en/'));
    for (const page of automotive) {
      const slug = page.slug.replace('en/', '');
      addBilingualPage(`/automotive/${slug}`, 0.8, 'monthly');
    }
  } catch (e) {
    // Automotive collection might not exist
  }

  // ==================
  // GENERATE XML
  // ==================
  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority?.toFixed(1)}</priority>${
      url.alternates
        ? url.alternates
            .map(
              (alt) => `
    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`
            )
            .join('')
        : ''
    }${
      url.images
        ? url.images
            .map(
              (img) => `
    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>${img.caption ? `
      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''}${img.title ? `
      <image:title>${escapeXml(img.title)}</image:title>` : ''}
    </image:image>`
            )
            .join('')
        : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
