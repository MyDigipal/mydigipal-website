import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { nommeMarqueInterdite } from '@/components/academy/data';

/**
 * Ce que l'assistant IA du site sait de l'agence (29/09/2026).
 *
 * Paul : « il faut lui donner la connaissance de l'agence, adapter sa réponse à la page et à
 * où se trouve le visiteur ». L'application Academy, qui fait répondre le modèle, lit ce fichier
 * (gardé dix minutes en mémoire) et en tire le contexte de l'assistant et la liste des chiffres
 * qu'il a le droit d'écrire.
 *
 * Généré à chaque build depuis les MÊMES collections que les pages, comme `assistant-pages.json`
 * et `llms.txt` : un service réécrit ou une étude de cas publiée demain est connu de l'assistant
 * le jour de sa mise en ligne. Aucun chiffre n'est écrit ici, ils viennent tous du contenu.
 *
 * ⚠️ AUCUN PRIX D'AGENCE dans ce fichier : les tarifs vivent dans le moteur du calculateur, et
 * l'assistant renvoie vers le calculateur ou vers Paul pour tout ce qui touche au prix.
 *
 * ⚠️ Les marques interdites (`MARQUES_INTERDITES` de `academy/data.ts`) sont écartées partout :
 * une étude de cas, un avis ou un logo qui les nomme n'arrive pas jusqu'à l'assistant.
 */

type Langue = 'fr' | 'en';
const LANGUES: Langue[] = ['fr', 'en'];

const court = (t: string | undefined, max: number): string | undefined => {
  const s = (t || '').replace(/\s+/g, ' ').trim();
  if (!s) return undefined;
  return s.length <= max ? s : `${s.slice(0, max).replace(/\s+\S*$/, '')}…`;
};

export const GET: APIRoute = async () => {
  const services = await getCollection('services');
  const cas = await getCollection('case-studies');
  const auto = await getCollection('automotive');

  const sortie: Record<Langue, unknown> = { fr: null, en: null };
  for (const lang of LANGUES) {
    const dela = (id: string) => id.startsWith(`${lang}/`);
    const slug = (id: string) => id.split('/')[1];

    const casListe = cas
      .filter((c) => dela(c.id))
      .filter((c) => !nommeMarqueInterdite(`${c.data.client} ${c.data.title} ${c.data.logo || ''}`))
      .map((c) => ({
        chemin: `/${lang}/case-studies/${slug(c.id)}`,
        client: c.data.client,
        titre: c.data.title,
        secteur: c.data.category,
        services: c.data.services,
        resume: court(c.data.description, 300),
        defi: court(c.data.challenge, 400),
        solution: court(c.data.solution, 500),
        resultats: c.data.kpis.map((k) => ({ valeur: k.value, libelle: k.label })),
      }));

    const serviceListe = services
      .filter((s) => dela(s.id))
      .sort((a, b) => a.data.order - b.data.order)
      .map((s) => {
        const temoin = s.data.testimonial && !nommeMarqueInterdite(`${s.data.testimonial.company} ${s.data.testimonial.companyLogo || ''}`)
          ? { societe: s.data.testimonial.company, citation: court(s.data.testimonial.quote, 300) }
          : undefined;
        return {
          chemin: `/${lang}/services/${slug(s.id)}`,
          titre: s.data.title,
          accroche: s.data.shortDescription || s.data.hero?.subheadline,
          description: court(s.data.description, 300),
          prestations: (s.data.features ?? []).map((f) => ({ titre: f.title, detail: court(f.description, 200) })),
          etapes: (s.data.process ?? []).map((p) => p.title),
          chiffres: (s.data.metrics ?? []).map((m) => ({ valeur: m.value, libelle: m.label })),
          calculateur: s.data.calculatorServiceId || undefined,
          avis: temoin,
        };
      });

    const secteurs = auto
      .filter((a) => dela(a.id))
      .sort((a, b) => a.data.order - b.data.order)
      .map((a) => ({
        chemin: `/${lang}/automotive/${slug(a.id)}`,
        titre: a.data.title,
        description: court(a.data.shortDescription || a.data.description, 300),
        pourquoi: a.data.whySection ? court(a.data.whySection.description, 400) : undefined,
        prestations: (a.data.services?.items ?? a.data.useCases ?? []).map((x) => x.title),
        chiffres: (a.data.metrics ?? []).map((m) => ({ valeur: m.value, libelle: m.label })),
        faq: (a.data.faq ?? []).slice(0, 6).map((f) => ({ q: f.question, r: court(f.answer, 350) })),
        calculateur: a.data.calculatorServiceId || undefined,
      }));

    sortie[lang] = {
      pages: {
        accueil: `/${lang}`,
        services: `/${lang}/services`,
        cas: `/${lang}/case-studies`,
        automobile: `/${lang}/automotive`,
        blog: `/${lang}/blog`,
        ia: `/${lang}/ai`,
        calculateur: `/${lang}/calculator`,
        contact: `/${lang}/contact`,
        academy: `/${lang}/academy`,
      },
      services: serviceListe,
      cas: casListe,
      secteurs,
    };
  }

  return new Response(JSON.stringify({ genere: new Date().toISOString().slice(0, 10), ...sortie }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
