// Les versions allégées des images d'articles, produites par `scripts/vignettes-blog.mjs`
// (AVIF et WebP en 480, 800 et 1 200 px). Une image absente du manifeste, par exemple
// un article tout juste ajouté avant le passage du script, retombe sur le fichier d'origine.
import manifeste from '../data/blog/vignettes.json';

type Entree = { base: string; largeur: number; hauteur: number; largeurs: number[] };
const VIGNETTES = manifeste as Record<string, Entree>;

export type Vignette = {
  src: string;
  avif?: string;
  webp?: string;
  largeur: number;
  hauteur: number;
};

const srcset = (e: Entree, format: 'avif' | 'webp') =>
  e.largeurs.map((l) => `/images/blog-opt/${e.base}-${l}.${format} ${l}w`).join(', ');

export function vignette(chemin: string): Vignette {
  const e = VIGNETTES[chemin];
  if (!e) return { src: chemin, largeur: 1200, hauteur: 630 };
  const plusGrande = e.largeurs.at(-1)!;
  return {
    src: `/images/blog-opt/${e.base}-${plusGrande}.webp`,
    avif: srcset(e, 'avif'),
    webp: srcset(e, 'webp'),
    largeur: e.largeur,
    hauteur: e.hauteur,
  };
}

// Une seule image de taille fixe, pour les endroits qui ne prennent pas de srcset
// (affiche d'une vidéo, grille reconstruite en JavaScript).
export function vignetteFixe(chemin: string, largeurVoulue: number): string {
  const e = VIGNETTES[chemin];
  if (!e) return chemin;
  const l = e.largeurs.find((x) => x >= largeurVoulue) ?? e.largeurs.at(-1)!;
  return `/images/blog-opt/${e.base}-${l}.webp`;
}
