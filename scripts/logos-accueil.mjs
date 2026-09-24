/**
 * Les logos de la page d'accueil : détourés, allégés, et mesurés.
 *
 * Les fichiers d'origine (`public/images/Training Logo/`, `Client logo/`)
 * vont jusqu'à 3 000 px de large et portent des marges très inégales : le mot
 * Balenciaga n'occupe qu'un cinquième de la hauteur de son fichier. Afficher
 * les originaux à 30 px de haut, c'est télécharger des mégaoctets pour des
 * logos qui n'ont pas la même taille à l'œil.
 *
 * Le script rogne les marges (blanches ou transparentes), ramène chaque logo
 * à 96 px de haut au plus, l'écrit en WebP dans `public/images/accueil/logos/`
 * et consigne ses proportions dans `src/data/accueil/logos.json`. La page
 * s'en sert pour donner à tous les logos la même SURFACE, pas la même
 * hauteur : un mot très large descend, un emblème carré monte.
 *
 * ⚠️ Kering et Chanel n'y figurent pas, et ne doivent pas y entrer : décision
 * de Paul du 01/09/2026 (voir MARQUES_INTERDITES dans components/academy/data.ts).
 *
 * Relancer après tout ajout : `node scripts/logos-accueil.mjs`.
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const SORTIE = 'public/images/accueil/logos';
const MANIFESTE = 'src/data/accueil/logos.json';
const HAUTEUR_MAX = 96;
const LARGEUR_MAX = 520;

// `echelle` corrige ce que la surface ne voit pas : un emblème avec beaucoup
// de vide intérieur (La Poste, Pierre Fabre) paraît plus petit que sa surface,
// un mot très gras (Balenciaga, GWI) paraît plus gros. Réglé à l'œil sur la
// planche, le 24/09/2026.
export const LOGOS = [
  // Formations (verbatims servis par l'Academy)
  { slug: 'la-poste', nom: 'La Poste', source: 'Training Logo/La poste.png', echelle: 1.2 },
  { slug: 'pierre-fabre', nom: 'Pierre Fabre', source: 'Training Logo/Pierre fabre.avif', echelle: 1.2 },
  { slug: 'moet-hennessy', nom: 'Moët Hennessy', source: 'Training Logo/Moet_Hennessy_Logo.png' },
  { slug: 'la-redoute', nom: 'La Redoute', source: 'Training Logo/La Redoute.svg' },
  { slug: 'gl-events', nom: 'GL Events', source: 'Training Logo/GL events.png', echelle: 0.9 },
  { slug: 'balenciaga', nom: 'Balenciaga', source: 'Training Logo/Balenciaga-logo.jpg', echelle: 0.85 },
  { slug: 'kaufman-broad', nom: 'Kaufman & Broad', source: 'Training Logo/Kaufman broad.avif' },
  { slug: 'datawords', nom: 'Datawords', source: 'Training Logo/Datawords.png', echelle: 0.85 },
  { slug: 'cbtw', nom: 'CBTW', source: 'Training Logo/CBTW.png' },
  // Formations, sans verbatim
  { slug: 'leclerc', nom: 'E.Leclerc', source: 'Training Logo/Leclerc.png' },
  { slug: 'yves-saint-laurent', nom: 'Yves Saint Laurent', source: 'Training Logo/Yves saint laurent.avif' },
  { slug: 'gucci', nom: 'Gucci', source: 'Training Logo/Gucci.avif' },
  { slug: 'pernod-ricard', nom: 'Pernod Ricard', source: 'Training Logo/Pernod Ricard.avif', echelle: 1.15 },
  { slug: 'grands-moulins', nom: 'Grands Moulins de Paris', source: 'Training Logo/Grand moulins de paris.avif' },
  // Clients de l'agence
  { slug: 'ford', nom: 'Ford', source: 'Client logo/ford.png' },
  { slug: 'edenred', nom: 'Edenred', source: 'Client logo/Edenred_Logo_(depuis_2017).png' },
  { slug: 'opentext', nom: 'OpenText', source: 'Client logo/opentext-logo.png', echelle: 0.9 },
  { slug: 'bymycar', nom: 'BYmyCAR', source: 'Client logo/BYmyCAR.png' },
  { slug: 'motork', nom: 'MotorK', source: 'Client logo/Motork.png' },
  // Clients des sept études de cas
  { slug: 'theobald', nom: 'Groupe Théobald', source: 'Client logo/theobald.png', echelle: 0.9 },
  { slug: 'dmd', nom: 'Groupe DMD', source: 'Client logo/DMD.png' },
  { slug: 'vulcain', nom: 'Groupe Vulcain', source: 'Client logo/Vulcain.png' },
  { slug: 'genesys', nom: 'Genesys', source: 'Client logo/genesys-vector-logo.png' },
  { slug: 'symbl', nom: 'Symbl.ai', source: 'Client logo/Symbl.ai.png' },
  { slug: 'gwi', nom: 'GWI', source: 'Client logo/GWI.webp', echelle: 0.85 },
  { slug: 'quantum', nom: 'Quantum Metric', source: 'Client logo/quantum.png', echelle: 0.9 },
];

mkdirSync(SORTIE, { recursive: true });
const manifeste = {};
for (const { slug, nom, source, echelle = 1 } of LOGOS) {
  const rogne = await sharp(`public/images/${source}`, { density: 300 })
    .trim({ threshold: 24 })
    .toBuffer();
  const { data, info } = await sharp(rogne)
    .resize({ height: HAUTEUR_MAX, width: LARGEUR_MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100 })
    .toBuffer({ resolveWithObject: true });
  writeFileSync(`${SORTIE}/${slug}.webp`, data);
  const meta = await sharp(`public/images/${source}`).metadata();
  manifeste[slug] = {
    nom,
    src: `/images/accueil/logos/${slug}.webp`,
    largeur: info.width,
    hauteur: info.height,
    // Un fichier sans transparence a un fond blanc : la page le fond dans le
    // papier (mix-blend-mode: multiply) au lieu d'afficher un rectangle.
    fondBlanc: !meta.hasAlpha,
    echelle,
  };
  console.log(slug.padEnd(20), `${info.width}x${info.height}`, `${(data.length / 1024).toFixed(1)} Ko`);
}
writeFileSync(MANIFESTE, JSON.stringify(manifeste, null, 2) + '\n');
