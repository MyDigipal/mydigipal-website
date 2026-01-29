import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const site = 'https://mydigipal.com';

interface ImageEntry {
  pageUrl: string;
  images: {
    loc: string;
    caption?: string;
    title?: string;
  }[];
}

export const GET: APIRoute = async () => {
  const entries: ImageEntry[] = [];

  // Case Studies - thumbnail and logo images
  try {
    const caseStudies = await getCollection('case-studies', ({ id }) => id.startsWith('en/'));
    for (const study of caseStudies) {
      const slug = study.slug.replace('en/', '');
      const images: ImageEntry['images'] = [];

      if (study.data.image) {
        images.push({
          loc: study.data.image.startsWith('http') ? study.data.image : `${site}${study.data.image}`,
          caption: `${study.data.client} - ${study.data.title}`,
          title: study.data.client
        });
      }

      if (study.data.logo) {
        images.push({
          loc: study.data.logo.startsWith('http') ? study.data.logo : `${site}${study.data.logo}`,
          caption: `${study.data.client} logo`,
          title: `${study.data.client} logo`
        });
      }

      if (images.length > 0) {
        entries.push({
          pageUrl: `${site}/en/case-studies/${slug}`,
          images
        });
      }
    }
  } catch (e) {
    // Collection might not exist
  }

  // Blog Posts - featured images
  try {
    const posts = await getCollection('blog', ({ id }) => id.startsWith('en/'));
    for (const post of posts) {
      const slug = post.slug.replace('en/', '');
      const images: ImageEntry['images'] = [];

      if (post.data.image) {
        images.push({
          loc: post.data.image.startsWith('http') ? post.data.image : `${site}${post.data.image}`,
          caption: post.data.title,
          title: post.data.title
        });
      }

      if (images.length > 0) {
        entries.push({
          pageUrl: `${site}/en/blog/${slug}`,
          images
        });
      }
    }
  } catch (e) {
    // Collection might not exist
  }

  // Services - if they have images
  try {
    const services = await getCollection('services', ({ id }) => id.startsWith('en/'));
    for (const service of services) {
      const slug = service.slug.replace('en/', '');
      const images: ImageEntry['images'] = [];

      if (service.data.hero?.image) {
        images.push({
          loc: service.data.hero.image.startsWith('http') ? service.data.hero.image : `${site}${service.data.hero.image}`,
          caption: service.data.title,
          title: service.data.title
        });
      }

      if (images.length > 0) {
        entries.push({
          pageUrl: `${site}/en/services/${slug}`,
          images
        });
      }
    }
  } catch (e) {
    // Collection might not exist
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.pageUrl)}</loc>
${entry.images
  .map(
    (img) => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
${img.caption ? `      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
${img.title ? `      <image:title>${escapeXml(img.title)}</image:title>` : ''}
    </image:image>`
  )
  .join('\n')}
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
