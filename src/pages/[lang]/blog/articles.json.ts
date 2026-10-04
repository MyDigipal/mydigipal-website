/**
 * L'index de recherche du blog (30/09/2026) : tous les articles publiés d'une langue, en
 * JSON, lu par la recherche et les filtres de l'index paginé au premier usage. Hors sitemap.
 */
import type { APIRoute } from 'astro';
import { languages } from '@/i18n/config';
import { articlesPublies } from '@/lib/blog-pages';
import { vignetteFixe } from '@/lib/vignettes-blog';

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}

const CATEGORIES: Record<string, Record<string, string>> = {
  fr: { abm: 'ABM', ai: 'IA', 'paid-ads': 'Publicité', seo: 'SEO', 'marketing-ops': 'Marketing Ops', strategy: 'Stratégie', 'company-news': 'Actualités' },
  en: { abm: 'ABM', ai: 'AI', 'paid-ads': 'Paid Ads', seo: 'SEO', 'marketing-ops': 'Marketing Ops', strategy: 'Strategy', 'company-news': 'News' },
};

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as string;
  const posts = await articlesPublies(lang);
  const articles = posts.map((p) => ({
    t: p.data.title,
    d: p.data.description,
    c: p.data.category,
    i: p.data.industry ?? '',
    u: `/${lang}/blog/${p.id.replace(/^(en|fr)\//, '')}`,
    img: p.data.image && !p.data.image.includes('/images/blog/') ? vignetteFixe(p.data.image, 800) : '',
    cat: CATEGORIES[lang]?.[p.data.category] ?? p.data.category,
    date: p.data.date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    iso: p.data.date.toISOString(),
  }));
  return new Response(JSON.stringify(articles), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
