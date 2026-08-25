// La silhouette du renard et les constantes d'affichage du rail. Copie de
// mydigipal-academy/src/lib/academy/jour30-story.ts (partie présentation :
// les POINTS, eux, viennent de l'app par le JSON, jamais d'ici).
import type { Metal } from './data';

export const METAL_HEX: Record<Metal, string> = {
  bronze: '#b07d42',
  argent: '#c0c6d2',
  or: '#c8a951',
  platine: '#e8ecf4',
};

/** Les cases du calendrier de trente jours. */
export const JOURS_CALENDRIER = 30;

/**
 * Les quatre silhouettes du renard : dix sommets chacune, dans le même ordre,
 * ce qui rend l'interpolation possible. Oreilles, museau, ventre, queue.
 */
export const RENARD: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[30, 20], [39, 32], [50, 28], [61, 32], [70, 20], [78, 50], [60, 72], [50, 80], [40, 72], [22, 50]],
  [[26, 12], [37, 29], [50, 22], [63, 29], [74, 12], [83, 48], [61, 76], [50, 86], [39, 76], [17, 48]],
  [[21, 5], [34, 26], [50, 17], [66, 26], [79, 5], [89, 45], [62, 80], [50, 94], [38, 80], [11, 45]],
  [[16, 0], [32, 25], [50, 13], [68, 25], [84, 0], [95, 43], [64, 84], [50, 99], [36, 84], [5, 43]],
];

/** Les points d'un polygone SVG pour une valeur continue entre 0 et 3. */
export function renardPoints(t: number): string {
  const c = Math.max(0, Math.min(2.999, t));
  const i = Math.floor(c);
  const f = c - i;
  const a = RENARD[i];
  const b = RENARD[i + 1] || RENARD[i];
  return a
    .map((pt, k) => `${(pt[0] + (b[k][0] - pt[0]) * f).toFixed(1)},${(pt[1] + (b[k][1] - pt[1]) * f).toFixed(1)}`)
    .join(' ');
}

