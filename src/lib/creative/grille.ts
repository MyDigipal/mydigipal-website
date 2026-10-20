/**
 * LA grille de prix de la production créative (page Creative design, son simulateur, et le
 * calculateur). Aucun prix de créa ne s'écrit ailleurs.
 *
 * Décisions de Paul du 20/10/2026 (pilotage : docs/creative-design/pilotage.html) :
 * - la grille de référence est celle du document « Creative pricing and request » du Hub
 *   Exaforce, en dollars ;
 * - les euros et les livres en sont adaptés en montants RONDS, fixés par devise et jamais
 *   convertis au taux du jour ;
 * - un jeu de bannières est un message dans toutes les tailles d'un canal : c'est ce qu'on
 *   facture, jamais une taille seule ;
 * - le prix par jeu baisse avec le nombre de jeux de la même demande, et les vidéos suivent
 *   les mêmes paliers ;
 * - les landing pages ne sont PAS sur cette page (une page à part viendra).
 *
 * Les paliers sont écrits en toutes lettres, sans formule : dans le document Exaforce, le
 * tableau (160 $) et le simulateur (170 $) divergeaient sur un palier parce que l'un lisait
 * une table et l'autre arrondissait un pourcentage.
 */
import type { Devise } from '../formation/grille.ts';

export type { Devise };
export type Canal = 'li' | 'pm' | 'both';
export type Video = 'v20' | 'v30';

type ParDevise = Record<Devise, number>;
/** Un palier : à partir de `des` éléments dans la même demande, le prix unitaire. */
type Palier = { des: number; prix: ParDevise };

export const GRILLE_CREA = {
  jeux: {
    li: [
      { des: 1, prix: { USD: 120, EUR: 110, GBP: 90 } },
      { des: 3, prix: { USD: 100, EUR: 90, GBP: 80 } },
      { des: 6, prix: { USD: 90, EUR: 80, GBP: 70 } },
      { des: 11, prix: { USD: 80, EUR: 70, GBP: 60 } },
    ],
    pm: [
      { des: 1, prix: { USD: 150, EUR: 140, GBP: 120 } },
      { des: 3, prix: { USD: 130, EUR: 120, GBP: 100 } },
      { des: 6, prix: { USD: 110, EUR: 100, GBP: 90 } },
      { des: 11, prix: { USD: 100, EUR: 90, GBP: 80 } },
    ],
    both: [
      { des: 1, prix: { USD: 220, EUR: 200, GBP: 170 } },
      { des: 3, prix: { USD: 190, EUR: 170, GBP: 150 } },
      { des: 6, prix: { USD: 160, EUR: 150, GBP: 130 } },
      { des: 11, prix: { USD: 140, EUR: 130, GBP: 110 } },
    ],
  } satisfies Record<Canal, Palier[]>,

  videos: {
    v20: [
      { des: 1, prix: { USD: 300, EUR: 280, GBP: 240 } },
      { des: 3, prix: { USD: 260, EUR: 240, GBP: 200 } },
      { des: 6, prix: { USD: 230, EUR: 210, GBP: 180 } },
      { des: 11, prix: { USD: 200, EUR: 180, GBP: 160 } },
    ],
    v30: [
      { des: 1, prix: { USD: 350, EUR: 320, GBP: 280 } },
      { des: 3, prix: { USD: 300, EUR: 270, GBP: 240 } },
      { des: 6, prix: { USD: 260, EUR: 240, GBP: 210 } },
      { des: 11, prix: { USD: 230, EUR: 210, GBP: 180 } },
    ],
  } satisfies Record<Video, Palier[]>,

  /** Prix fixes, sans palier. */
  documentAd: { USD: 300, EUR: 280, GBP: 240 } satisfies ParDevise,
  storyboard: { USD: 150, EUR: 140, GBP: 120 } satisfies ParDevise,

  /** Un jeu dans une langue de plus : +30 % de son prix, arrondi à la dizaine. */
  langue: 0.3,
  /** Tours de retours compris sur chaque jeu et chaque vidéo. */
  tours: 4,
} as const;

/** Les bornes des paliers, pour les libellés (« 1 à 2 », « 3 à 5 »...). */
export const PALIERS = [
  { des: 1, a: 2 },
  { des: 3, a: 5 },
  { des: 6, a: 10 },
  { des: 11, a: null },
] as const;

/** Le prix unitaire pour `n` éléments dans la même demande. */
export function prixPalier(paliers: readonly Palier[], n: number, devise: Devise): number {
  let p = paliers[0].prix[devise];
  for (const pal of paliers) if (n >= pal.des) p = pal.prix[devise];
  return p;
}
