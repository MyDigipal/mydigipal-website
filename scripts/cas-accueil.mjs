/**
 * Les visuels des études de cas, allégés pour la page d'accueil.
 *
 * La section des résultats montre le visuel de la campagne qu'on est en train
 * de lire, dans la colonne collée à gauche. Les fichiers d'origine
 * (`public/images/Case study thumbnail/`) font 1 600 px et jusqu'à 190 Ko :
 * pour un cadre de 390 px de large, on sort des AVIF de 720 px.
 *
 * Les chemins viennent des fiches elles-mêmes (champ `image:` des MDX
 * anglais) : une fiche qui change de visuel change ici au prochain passage.
 * Relancer : `node scripts/cas-accueil.mjs`.
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';

const FICHES = 'src/content/case-studies/en';
const SORTIE = 'public/images/accueil/cas';
mkdirSync(SORTIE, { recursive: true });

for (const fichier of readdirSync(FICHES).filter((f) => f.endsWith('.mdx'))) {
  const slug = fichier.replace(/\.mdx$/, '');
  const m = /^image:\s*["']?([^"'\n]+)["']?\s*$/m.exec(readFileSync(`${FICHES}/${fichier}`, 'utf8'));
  if (!m) continue;
  const source = `public${decodeURI(m[1])}`;
  const cible = `${SORTIE}/${slug}.avif`;
  await sharp(source)
    .resize({ width: 720, height: 450, fit: 'cover', withoutEnlargement: true })
    .avif({ quality: 48, effort: 6 })
    .toFile(cible);
  console.log(slug.padEnd(18), `${(statSync(source).size / 1024).toFixed(0)} Ko`, '->', `${(statSync(cible).size / 1024).toFixed(0)} Ko`);
}
