import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import type { Language } from '@/i18n/config';

const site = 'https://mydigipal.com';

const feedMeta = {
  en: {
    title: 'MyDigipal Blog - Digital Marketing Insights',
    description: 'Expert insights on B2B marketing, AI, ABM, paid advertising, and SEO from the MyDigipal team.',
    language: 'en-us',
  },
  fr: {
    title: 'Blog MyDigipal - Actualités Marketing Digital',
    description: 'Conseils d\'experts en marketing B2B, IA, ABM, publicité payante et SEO par l\'équipe MyDigipal.',
    language: 'fr-fr',
  },
};

export const getStaticPaths: GetStaticPaths = () => {
  return [
    { params: { lang: 'en' } },
    { params: { lang: 'fr' } },
  ];
};

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Language;
  const meta = feedMeta[lang];

  // Get all blog posts for this language, excluding drafts
  const allPosts = await getCollection('blog', ({ id, data }) => {
    return id.startsWith(`${lang}/`) && !data.draft;
  });

  // Sort by date descending
  const posts = allPosts.sort((a, b) =>
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  // Build RSS items
  const items = posts.map((post) => {
    const slug = post.slug.replace(`${lang}/`, '');
    const url = `${site}/${lang}/blog/${slug}`;
    const pubDate = new Date(post.data.date).toUTCString();

    return `    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.data.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>hello@mydigipal.com (${post.data.author})</author>
      <category>${post.data.category}</category>
      ${post.data.image ? `<enclosure url="${site}${post.data.image}" type="image/png" />` : ''}
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
>
  <channel>
    <title>${meta.title}</title>
    <description>${meta.description}</description>
    <link>${site}/${lang}/blog</link>
    <atom:link href="${site}/${lang}/rss.xml" rel="self" type="application/rss+xml" />
    <language>${meta.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <image>
      <url>${site}/images/Logos/Logo_Main_Horizontal.png</url>
      <title>${meta.title}</title>
      <link>${site}/${lang}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
