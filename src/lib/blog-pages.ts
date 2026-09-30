/**
 * La pagination de l'index du blog (30/09/2026, demande de Paul) : douze articles par page,
 * en pages statiques `/{lang}/blog`, `/{lang}/blog/page/2`, etc. Un seul endroit pour la
 * taille de page, lu par les deux routes de l'index, le sitemap et l'index de recherche.
 */
import { getCollection } from 'astro:content';

export const ARTICLES_PAR_PAGE = 12;

/** Les articles publiés d'une langue, du plus récent au plus ancien. */
export async function articlesPublies(lang: string) {
  const tous = await getCollection('blog');
  return tous
    .filter((p) => p.id.startsWith(`${lang}/`) && !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** L'adresse d'une page de l'index : la première est `/blog`, jamais `/blog/page/1`. */
export const adressePage = (lang: string, page: number) => (page <= 1 ? `/${lang}/blog` : `/${lang}/blog/page/${page}`);
