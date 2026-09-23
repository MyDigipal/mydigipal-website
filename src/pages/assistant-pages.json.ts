import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * La carte des pages, pour l'assistant du site (23/09/2026).
 *
 * Paul, 22/09 au soir : « sur la page d'accueil, le choix de base est quand même assez basique.
 * On pourrait vachement faire de la personnalisation en fonction de la page. » L'assistant lit ce
 * fichier à l'ouverture de son panneau : il sait alors quel service, quelle étude de cas ou quel
 * article la personne a sous les yeux, et propose des choix qui en découlent.
 *
 * Généré à chaque build depuis les collections, comme `llms.txt` et `sitemap.xml` : rien à tenir
 * à jour à la main, un article publié demain est connu le jour de sa mise en ligne.
 *
 * Champs, courts parce que le fichier part dans le navigateur :
 *   k  type de page : service | case | blog | auto | home | contact | services | cases | blogs
 *   t  titre lisible          d  une phrase de description
 *   s  le service du calculateur qui correspond (id de domaine), quand il y en a un
 *   i  le secteur, quand la page le dit : automotive | b2b-tech
 *   c  une page à proposer ensuite (étude de cas du service, service de l'article)
 *   r  le résultat en une ligne (études de cas)      cl le client (études de cas)
 */

// Les catégories d'articles et les services du calculateur ne portent pas les mêmes noms.
const SERVICE_PAR_CATEGORIE: Record<string, string | undefined> = {
  seo: 'seo',
  'paid-ads': 'google-ads',
  ai: 'ai-solutions',
  'marketing-ops': 'tracking-reporting',
  abm: 'paid-social',
  strategy: undefined,
  'company-news': undefined,
};

// Les pages services qui ne correspondent à aucun domaine du calculateur (l'ABM).
const SERVICE_PAR_SLUG: Record<string, string | undefined> = {
  'b2b-abm': undefined,
};

/** Les études de cas listent leurs services en clair (« LinkedIn Ads », « ABM ») : on les ramène aux domaines du calculateur. */
function domaineDuLibelle(libelle: string): string | undefined {
  const l = libelle.toLowerCase();
  if (l.includes('seo') || l.includes('référencement')) return 'seo';
  if (l.includes('google ads') || l.includes('sea') || l.includes('search ads')) return 'google-ads';
  if (l.includes('linkedin') || l.includes('facebook') || l.includes('meta') || l.includes('display') || l.includes('waze') || l.includes('social') || l.includes('abm')) return 'paid-social';
  if (l.includes('email') || l.includes('mailing')) return 'emailing';
  if (l.includes('tracking') || l.includes('analytics') || l.includes('data') || l.includes('mesure')) return 'tracking-reporting';
  if (l.includes(' ia') || l.startsWith('ia') || l.includes(' ai') || l.startsWith('ai')) return 'ai-solutions';
  return undefined;
}

type Fiche = { k: string; t: string; d?: string; s?: string; i?: string; c?: string; r?: string; cl?: string };

export const GET: APIRoute = async () => {
  const carte: Record<string, Fiche> = {};
  const langues = ['fr', 'en'] as const;

  const services = await getCollection('services');
  const cas = await getCollection('case-studies');
  const articles = await getCollection('blog', (a: { data: { draft?: boolean } }) => !a.data.draft);
  const auto = await getCollection('automotive');

  // Les études de cas d'abord : les services y renvoient.
  const casParService: Record<string, string> = {};
  for (const c of cas) {
    const [lang, slug] = c.id.split('/');
    if (!langues.includes(lang as (typeof langues)[number])) continue;
    const chemin = `/${lang}/case-studies/${slug}`;
    const kpi = c.data.kpis?.[0];
    carte[chemin] = {
      k: 'case',
      t: c.data.title,
      d: c.data.description,
      s: (c.data.services ?? []).map(domaineDuLibelle).find(Boolean),
      i: c.data.category,
      r: kpi ? `${kpi.value} ${kpi.label.toLowerCase()}` : undefined,
      cl: c.data.client,
    };
    for (const libelle of c.data.services ?? []) {
      const d = domaineDuLibelle(libelle);
      if (d && !casParService[`${lang}:${d}`]) casParService[`${lang}:${d}`] = chemin;
    }
  }

  for (const s of services) {
    const [lang, slug] = s.id.split('/');
    if (!langues.includes(lang as (typeof langues)[number])) continue;
    const domaine = slug in SERVICE_PAR_SLUG ? SERVICE_PAR_SLUG[slug] : (s.data.calculatorServiceId || slug);
    carte[`/${lang}/services/${slug}`] = {
      k: 'service',
      t: s.data.title,
      d: s.data.shortDescription || s.data.hero?.subheadline || s.data.description,
      s: domaine,
      c: (domaine && casParService[`${lang}:${domaine}`]) || undefined,
    };
  }

  for (const a of articles) {
    const [lang, slug] = a.id.split('/');
    if (!langues.includes(lang as (typeof langues)[number])) continue;
    const domaine = SERVICE_PAR_CATEGORIE[a.data.category];
    carte[`/${lang}/blog/${slug}`] = {
      k: 'blog',
      t: a.data.title,
      s: domaine,
      i: a.data.industry === 'general' ? undefined : a.data.industry,
      c: domaine ? `/${lang}/services/${domaine}` : undefined,
    };
  }

  for (const a of auto) {
    const [lang, slug] = a.id.split('/');
    if (!langues.includes(lang as (typeof langues)[number])) continue;
    carte[`/${lang}/automotive/${slug}`] = {
      k: 'auto',
      t: a.data.title,
      d: a.data.shortDescription || a.data.description,
      s: a.data.calculatorServiceId || undefined,
      i: 'automotive',
    };
  }

  for (const lang of langues) {
    carte[`/${lang}`] = { k: 'home', t: lang === 'fr' ? 'MyDigipal' : 'MyDigipal' };
    carte[`/${lang}/services`] = { k: 'services', t: lang === 'fr' ? 'Nos services' : 'Our services' };
    carte[`/${lang}/case-studies`] = { k: 'cases', t: lang === 'fr' ? 'Études de cas' : 'Case studies' };
    carte[`/${lang}/blog`] = { k: 'blogs', t: 'Blog' };
    carte[`/${lang}/automotive`] = { k: 'auto', t: lang === 'fr' ? 'Automobile' : 'Automotive', i: 'automotive' };
    carte[`/${lang}/contact`] = { k: 'contact', t: 'Contact' };
    carte[`/${lang}/ai`] = { k: 'ia', t: lang === 'fr' ? 'Intelligence artificielle' : 'Artificial intelligence', s: 'ai-solutions' };
  }

  return new Response(JSON.stringify(carte), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
