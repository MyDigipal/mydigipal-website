/**
 * Les photos de la page d'accueil, allégées.
 *
 * - La formation chez La Poste (section des avis) : Paul face à la salle, et
 *   toute la salle dans le cadre. Paul a demandé celle-ci le 24/09/2026 à la
 *   place de la photo de E.Leclerc, recadrée en portrait, « dégueulasse ».
 *   On la montre EN PAYSAGE, à son format, sans recadrage CSS : le fichier
 *   est coupé ici en 16:9, en retirant le haut du plafond et le bas de la
 *   moquette, jamais une personne. Deux largeurs pour le `srcset`.
 * - Le logo de l'Academy sur fond de nuit (section Academy) : le PNG de
 *   1 113 px s'affiche à 44 px de haut, on sort un WebP à deux fois cette taille.
 *
 * Relancer : `node scripts/photos-accueil.mjs`.
 */
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';

const SORTIE = 'public/images/accueil';
mkdirSync(SORTIE, { recursive: true });

const ko = (f) => `${(statSync(f).size / 1024).toFixed(0)} Ko`;

// La salle : 1 440 × 1 080 à l'origine. Le haut de l'écran est à 180 px,
// les pieds des chaises du premier rang à 960 px.
const SALLE = 'public/images/Traning pictures/AI Training La poste 1.jpg';
const CADRE = { left: 0, top: 150, width: 1440, height: 810 };
for (const largeur of [1440, 800]) {
  const cible = `${SORTIE}/formation-la-poste-${largeur}.avif`;
  await sharp(SALLE)
    .extract(CADRE)
    .resize({ width: largeur })
    .avif({ quality: largeur > 1000 ? 50 : 52, effort: 6 })
    .toFile(cible);
  console.log('la poste'.padEnd(12), ko(SALLE), '->', cible, ko(cible));
}

const LOGO = 'public/academy/brand/academy-logo-dark.png';
const logo = `${SORTIE}/academy-logo-nuit.webp`;
await sharp(LOGO).resize({ height: 88 }).webp({ quality: 90, alphaQuality: 100 }).toFile(logo);
console.log('logo'.padEnd(12), ko(LOGO), '->', logo, ko(logo));
