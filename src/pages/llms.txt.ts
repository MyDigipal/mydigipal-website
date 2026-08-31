import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * llms.txt genere au build, comme sitemap.xml.
 *
 * Il etait un fichier statique dans public/, donc il datait du jour ou quelqu'un
 * y avait pense pour la derniere fois : le 7 janvier 2026, sans l'AI Academy ni
 * rien de ce qui a ete publie depuis. Tout ce qui vient des collections de
 * contenu (services, etudes de cas, articles) est desormais lu a chaque build.
 *
 * Ce qui ne se deduit d'aucune collection - la presentation, l'equipe, les
 * coordonnees - reste ecrit a la main ci-dessous, et ne perime pas au rythme des
 * publications.
 */

const site = 'https://mydigipal.com';

const PRESENTATION = `# MyDigipal

> Agence de marketing digital augmentee par l'IA, pour le B2B et l'automobile.
> AI-powered digital marketing agency for B2B and automotive brands.

MyDigipal accompagne des marques B2B tech et des groupes automobiles sur
l'acquisition payante, le SEO, l'emailing, l'ABM, la mesure, et l'adoption de
l'IA par les equipes marketing. Le site est bilingue : chaque page existe en
anglais sous /en et en francais sous /fr.`;

const REPERES = `## Reperes

- Bureaux a Paris, France
- Interventions en anglais et en francais
- Site bilingue : /en et /fr, memes contenus`;

const CONTACT = `## Contact

- Site : ${site}
- Formulaire : ${site}/en/contact et ${site}/fr/contact
- Email : hello@mydigipal.com
- LinkedIn : https://linkedin.com/company/mydigipal`;

/** Coupe une description a la premiere phrase, pour garder une ligne lisible. */
function resume(texte: string, max = 160): string {
  const propre = texte.replace(/\s+/g, ' ').trim();
  if (propre.length <= max) return propre;
  const coupe = propre.slice(0, max);
  const point = coupe.lastIndexOf('. ');
  return (point > 60 ? coupe.slice(0, point + 1) : coupe.trimEnd() + '...');
}

export const GET: APIRoute = async () => {
  const blocs: string[] = [PRESENTATION];

  // --- Services : une ligne par page de service, depuis la collection EN ---
  try {
    const services = await getCollection('services', ({ id }) => id.startsWith('en/'));
    if (services.length) {
      const lignes = services
        .map((s) => {
          const slug = s.id.replace('en/', '');
          return `- [${s.data.title}](${site}/en/services/${slug}) : ${resume(s.data.description)}`;
        })
        .sort();
      blocs.push(`## Services\n\n${lignes.join('\n')}`);
    }
  } catch {
    // collection absente : on n'ecrit pas la section plutot que d'ecrire du vide
  }

  // --- AI Academy : page de vente de la formation en ligne ---
  blocs.push(`## AI Academy

Formation IA en ligne, trente jours, pour les equipes marketing.

- [AI Academy](${site}/en/academy) : la formation en ligne, en anglais.
- [AI Academy](${site}/fr/academy) : la formation en ligne, en francais.
- L'application vit sur https://academy.mydigipal.com`);

  // --- Etudes de cas ---
  try {
    const cas = await getCollection('case-studies', ({ id }) => id.startsWith('en/'));
    if (cas.length) {
      const lignes = cas
        .map((c) => {
          const slug = c.id.replace('en/', '');
          return `- [${c.data.client} - ${c.data.title}](${site}/en/case-studies/${slug})`;
        })
        .sort();
      blocs.push(`## Etudes de cas\n\n${lignes.join('\n')}`);
    }
  } catch {
    /* idem */
  }

  // --- Articles recents, hors brouillons ---
  try {
    const articles = (await getCollection('blog', ({ id, data }) => id.startsWith('en/') && !data.draft))
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .slice(0, 20);
    if (articles.length) {
      const lignes = articles.map((a) => {
        const slug = a.id.replace('en/', '');
        const jour = a.data.date.toISOString().split('T')[0];
        return `- [${a.data.title}](${site}/en/blog/${slug}) (${jour}) : ${resume(a.data.description)}`;
      });
      blocs.push(
        `## Articles recents\n\nLes vingt derniers, sur ${site}/en/blog et ${site}/fr/blog.\n\n${lignes.join('\n')}`
      );
    }
  } catch {
    /* idem */
  }

  // --- Outils publics ---
  blocs.push(`## Outils

- [Calculateur de budget marketing](${site}/en/calculator) : configure un budget
  par domaine (SEO, Google Ads, paid social, emailing, IA, mesure) et renvoie une
  estimation chiffree. Version francaise sur ${site}/fr/calculator.`);

  blocs.push(REPERES, CONTACT);

  const genere = new Date().toISOString().split('T')[0];
  const corps = `${blocs.join('\n\n')}\n\n---\n\nGenere automatiquement au build. Derniere generation : ${genere}.\n`;

  return new Response(corps, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
