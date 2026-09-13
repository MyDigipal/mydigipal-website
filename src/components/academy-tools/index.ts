// ============================================================
// Les pages outils - le catalogue
// ============================================================
//
// Une seule page Astro les rend toutes (`[lang]/academy/[tool].astro`). Un
// outil dont `publie` vaut faux n'est NI généré, NI mis au sitemap, NI lié
// depuis les autres pages : c'est ce qui permet de sortir Claude d'abord et de
// répliquer ensuite, sans que les renvois pointent vers des 404 entre-temps
// (et sans faire échouer `scripts/check-seo.mjs`, qui casse le build sur une
// URL du sitemap sans page générée).

import { chatgpt } from './chatgpt';
import { claude } from './claude';
import { copilot } from './copilot';
import { gemini } from './gemini';
import type { Locale, Outil, OutilId } from './types';

// L'ordre commande celui des renvois d'une page à l'autre : Claude d'abord, il
// porte le plus gros volume ; Copilot ensuite, c'est là que le clic coûte le
// plus cher ; ChatGPT, puis Gemini, qui n'a que 98 impressions sur treize jours.
export const OUTILS: Outil[] = [claude, copilot, chatgpt, gemini];

export const OUTILS_PUBLIES = OUTILS.filter((o) => o.publie);

export function outilParSlug(slug: string): Outil | undefined {
  return OUTILS_PUBLIES.find((o) => o.slug === slug);
}

/** Les autres pages outils déjà en ligne, pour le maillage entre elles. */
export function autresOutils(id: OutilId): Outil[] {
  return OUTILS_PUBLIES.filter((o) => o.id !== id);
}

/** Le chemin d'une page outil dans une langue. */
export function lienOutil(outil: Outil, locale: Locale): string {
  return `/${locale}/academy/${outil.slug}`;
}

export type { Ecran, CopyOutil, Locale, Outil, OutilId, Point, Question, Resultat } from './types';
