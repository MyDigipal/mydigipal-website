/**
 * Les quatorze portraits de la page d'accueil, recadrés sur le visage.
 *
 * Pourquoi : les photos de `public/images/team/` viennent de partout (tour
 * Eiffel, maillot de foot, scène violette, canal de Venise), avec des visages
 * qui occupent de 19 % à 77 % de la hauteur. Côte à côte dans la mosaïque du
 * hero, l'œil lit le désordre avant les gens. On recadre donc chaque photo au
 * même format (4:5) avec la tête à la même hauteur et à la même taille, et on
 * sort des AVIF de 320 x 400 (le double de leur taille à l'écran).
 *
 * Les repères sont relevés à la main sur la photo carrée d'origine, en
 * fraction de sa hauteur : `haut` = sommet du crâne, `menton`, `x` = milieu
 * du visage. Une nouvelle photo : ajouter sa ligne, relancer
 * `node scripts/visages-accueil.mjs`, regarder la planche produite.
 *
 * Ce recadrage ne remplace pas la série homogène (même lumière, même fond)
 * que le document de refonte recommande ; il la rend moins urgente.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SOURCE = 'public/images/team';
const SORTIE = 'public/images/team/visages';
const LARGEUR = 320;
const HAUTEUR = 400;
// La tête (du crâne au menton) occupe cette part de la hauteur du cadre,
// et son sommet commence à cette distance du haut.
const PART_TETE = 0.5;
const MARGE_HAUT = 0.13;

export const REPERES = {
  'paul-andre': { fichier: 'Team_Paul_Andre.webp', haut: 0.05, menton: 0.72, x: 0.5 },
  'alexandre-echement': { fichier: 'Team_Alexandre_Echement.avif', haut: 0.22, menton: 0.62, x: 0.48 },
  'jordan-langlois': { fichier: 'Team_Jordan_Langlois.avif', haut: 0.12, menton: 0.44, x: 0.52 },
  'alizee-varloud': { fichier: 'Team_Alizee_Varloud.avif', haut: 0.09, menton: 0.4, x: 0.5 },
  'juliette-joire': { fichier: 'Team_Juliette_Joire.avif', haut: 0.1, menton: 0.52, x: 0.53 },
  'sophie-roe': { fichier: 'Team_Sophie_Roe.avif', haut: 0.14, menton: 0.5, x: 0.48 },
  'callum-dunbar': { fichier: 'Team_Callum_Dunbar.avif', haut: 0.13, menton: 0.35, x: 0.48 },
  'heather-mann': { fichier: 'Team_Heather_Mann.avif', haut: 0.19, menton: 0.52, x: 0.5 },
  'victoria-doherty': { fichier: 'Team_Victoria_Doherty.avif', haut: 0.12, menton: 0.62, x: 0.62 },
  'amna-khan': { fichier: 'Team_Amna_Khan.avif', haut: 0.13, menton: 0.47, x: 0.5 },
  'diksha-mishra': { fichier: 'Team_Diksha_Mishra.avif', haut: 0.03, menton: 0.58, x: 0.48 },
  'chirag-solanki': { fichier: 'Team_Chirag_Solanki.avif', haut: 0.04, menton: 0.6, x: 0.47 },
  'shuai-yang': { fichier: 'Team_Shuai_Yang.avif', haut: 0.1, menton: 0.47, x: 0.55 },
  'bruce-eidsvik': { fichier: 'Team_Bruce_Eidsvik.avif', haut: -0.05, menton: 0.72, x: 0.4 },
};

const borne = (v, min, max) => Math.min(max, Math.max(min, v));

async function recadrer(slug, { fichier, haut, menton, x }) {
  const image = sharp(`${SOURCE}/${fichier}`);
  const { width: W, height: H } = await image.metadata();
  // Hauteur du cadre voulue, en fraction de la hauteur de la photo. Une photo
  // déjà serrée (Bruce, Paul) ne peut pas s'élargir : on prend ce qu'il y a.
  let h = (menton - haut) / PART_TETE;
  let w = (h * H * (LARGEUR / HAUTEUR)) / W;
  if (h > 1 || w > 1) {
    const reduction = Math.max(h, w);
    h /= reduction;
    w /= reduction;
  }
  const haut0 = borne(haut - MARGE_HAUT * h, 0, 1 - h);
  const gauche0 = borne(x - w / 2, 0, 1 - w);
  const zone = {
    left: Math.round(gauche0 * W),
    top: Math.round(haut0 * H),
    width: Math.min(W, Math.round(w * W)),
    height: Math.min(H, Math.round(h * H)),
  };
  await image
    .extract(zone)
    .resize(LARGEUR, HAUTEUR, { fit: 'cover' })
    .avif({ quality: 58, effort: 6 })
    .toFile(`${SORTIE}/${slug}.avif`);
  return zone;
}

mkdirSync(SORTIE, { recursive: true });
for (const [slug, reperes] of Object.entries(REPERES)) {
  const zone = await recadrer(slug, reperes);
  console.log(slug.padEnd(20), JSON.stringify(zone));
}
