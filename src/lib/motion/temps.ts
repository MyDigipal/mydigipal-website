/**
 * Les outils de temps du socle de mouvement.
 *
 * Origine : les essais de `projects/_shared/motion-lib/` (vidéo), où l'état d'une
 * scène est une fonction pure du temps. Les mêmes fonctions servent au site et aux
 * vidéos : une animation réussie ici peut retourner dans la bibliothèque.
 *
 * Courbe signature MyDigipal, la A de Paul (29/09/2026) : une entrée qui arrive vite
 * et se pose net (`entree`, sur 0,55 s), une sortie qui part doucement et disparaît
 * vite (`sortie`, sur 0,40 s), les éléments secondaires 33 ms plus tard. En CSS :
 * `--mdp-entree` et `--mdp-sortie` dans `global.css`.
 */

export const DUREE_ENTREE = 0.55;
export const DUREE_SORTIE = 0.4;
export const DUREE_LIGNE = 0.9;
export const RETARD = 0.033;

export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

/** Progression de 0 à 1 entre l'instant `debut` et l'instant `fin`. */
export const seg = (t: number, debut: number, fin: number): number =>
  clamp((t - debut) / (fin - debut), 0, 1);

export const mix = (a: number, b: number, p: number): number => a + (b - a) * p;

export type Courbe = (p: number) => number;

export const courbes = {
  /** La courbe A : arrive vite, se pose net. */
  entree: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  /** Sa sortie : part doucement, disparaît vite. */
  sortie: (p: number) => p * p * p,
  outQuart: (p: number) => 1 - Math.pow(1 - p, 4),
  inQuart: (p: number) => p * p * p * p,
  inOutCubic: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  inOutQuart: (p: number) => (p < 0.5 ? 8 * Math.pow(p, 4) : 1 - Math.pow(-2 * p + 2, 4) / 2),
  /** Glissé de caméra : quintique, accélère puis freine longuement. */
  camera: (p: number) => (p < 0.5 ? 16 * Math.pow(p, 5) : 1 - Math.pow(-2 * p + 2, 5) / 2),
  /** Monte puis redescend : 0 aux deux bouts, 1 au milieu. */
  bosse: (p: number) => (p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p)),
  /** Chute d'un volet de tableau à palettes, sans rebond. */
  chute: (p: number) => Math.pow(p, 1.75),
} satisfies Record<string, Courbe>;

/** Dépassement, réservé aux OBJETS (carte, étiquette, jeton). Jamais à un texte. */
export const depasse =
  (s: number): Courbe =>
  (p) =>
    1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);

/** Ressort analytique de 0 vers 1 : `z` amortissement (0 à 1), `w` pulsation (rad/s). */
export const ressort = (x: number, z: number, w: number): number => {
  if (x <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
};

/** Générateur à graine fixe : le même dessin à chaque chargement, au build comme à l'écran. */
export const graine = (a: number): (() => number) => {
  let s = a;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Cle = { t: number } & Record<string, number>;

/**
 * Une piste de clés. Deux clés identiques font une TENUE, deux clés différentes un
 * glissé : c'est ainsi qu'une caméra « tient la pose puis glisse ».
 */
export const piste = (cles: Cle[], t: number, champ: string, courbe: Courbe = courbes.camera): number => {
  if (t <= cles[0].t) return cles[0][champ];
  for (let k = 0; k < cles.length - 1; k++) {
    const a = cles[k];
    const b = cles[k + 1];
    if (t < b.t) return mix(a[champ], b[champ], courbe(clamp((t - a.t) / (b.t - a.t), 0, 1)));
  }
  return cles[cles.length - 1][champ];
};

/** Vrai quand le visiteur a demandé moins de mouvement, ou que la page est figée (`?fige=1`). */
export const mouvementReduit = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (/[?&]fige=1/.test(window.location.search)) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
