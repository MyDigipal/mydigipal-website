/**
 * Lire un chiffre d'étude de cas (collection `case-studies`), pour les pages qui en
 * affichent hors de l'étude elle-même : le hero d'une page de service, une ligne de
 * preuve. Seuls ces chiffres-là ont une source sur le site (refonte, 30/09/2026).
 *
 * `verif` : le libellé anglais attendu (en minuscules). Si l'ordre des KPI d'une fiche
 * change, le build s'arrête au lieu d'afficher le mauvais chiffre sous le bon libellé,
 * comme `accueil/donnees.ts`.
 */
import { getCollection } from 'astro:content';

export type Langue = 'en' | 'fr';

/** « +112% » devient « +112 % » en français (espace insécable). */
export const chiffreLocal = (valeur: string, lang: Langue) =>
  lang === 'fr' ? valeur.replace(/(\d)\s?%/g, '$1 %') : valeur;

export async function kpiDe(lang: Langue, slug: string, indice: number, verif?: string) {
  const fiches = await getCollection('case-studies');
  const fiche = fiches.find((f) => f.id === `${lang}/${slug}`);
  const ficheEn = fiches.find((f) => f.id === `en/${slug}`);
  if (!fiche || !ficheEn) throw new Error(`Étude de cas introuvable : ${lang}/${slug}`);
  const kpiEn = ficheEn.data.kpis[indice];
  if (verif && kpiEn?.label.toLowerCase() !== verif) {
    throw new Error(`Le KPI ${indice} de ${slug} devait être « ${verif} », la fiche dit « ${kpiEn?.label} ».`);
  }
  const kpi = fiche.data.kpis[indice];
  if (!kpi) throw new Error(`${slug} n'a pas de KPI n° ${indice}`);
  return {
    value: chiffreLocal(kpi.value, lang),
    label: kpi.label,
    client: fiche.data.client,
  };
}

/** Le verbatim d'une étude de cas, tel qu'il est écrit dans la fiche. */
export async function verbatimDe(lang: Langue, slug: string) {
  const fiches = await getCollection('case-studies');
  const fiche = fiches.find((f) => f.id === `${lang}/${slug}`);
  if (!fiche?.data.testimonial) throw new Error(`Pas de verbatim pour ${lang}/${slug}`);
  return { ...fiche.data.testimonial, client: fiche.data.client };
}
