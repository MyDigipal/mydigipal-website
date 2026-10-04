/**
 * Les images des articles de blog, allégées pour l'écran.
 *
 * Les vignettes de `public/images/Blog Thumbnails/` sortent en 1 200 px et
 * jusqu'à 225 Ko. Servies telles quelles, elles faisaient le LCP mobile des
 * articles (2,8 s au 75e centile dans la Search Console, octobre 2026) : un
 * téléphone affiche l'image dans un cadre de 358 px.
 *
 * Pour chaque image citée par un article (champs `image:` et `videoPoster:`),
 * on sort trois largeurs en AVIF et en WebP dans `public/images/blog-opt/`,
 * et le manifeste `src/data/blog/vignettes.json` (dimensions réelles, nom de
 * base) que lit `src/lib/vignettes-blog.ts`.
 *
 * Incrémental : une image déjà traitée n'est pas réencodée. Le script tourne
 * au début de chaque build, donc un nouvel article est traité même si on
 * oublie de le lancer à la main. Relancer : `node scripts/vignettes-blog.mjs`.
 */
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

const DOSSIERS = ['src/content/blog/en', 'src/content/blog/fr'];
const SORTIE = 'public/images/blog-opt';
const MANIFESTE = 'src/data/blog/vignettes.json';
const LARGEURS = [480, 800, 1200];

mkdirSync(SORTIE, { recursive: true });
mkdirSync('src/data/blog', { recursive: true });

const ancien = existsSync(MANIFESTE) ? JSON.parse(readFileSync(MANIFESTE, 'utf8')) : {};
const manifeste = {};

const chemins = new Set();
for (const dossier of DOSSIERS) {
  for (const fichier of readdirSync(dossier).filter((f) => /\.mdx?$/.test(f))) {
    const texte = readFileSync(`${dossier}/${fichier}`, 'utf8');
    const entete = texte.split(/^---\s*$/m)[1] ?? '';
    for (const m of entete.matchAll(/^(?:image|videoPoster):\s*(.+?)\s*$/gm)) {
      const valeur = m[1].replace(/^["']|["']$/g, '');
      if (valeur.startsWith('/') && !valeur.includes('/images/blog/')) chemins.add(valeur);
    }
  }
}

// Le nom de sortie dit d'où vient l'image et change avec son contenu : une
// vignette remplacée sous le même nom ne reste pas bloquée dans un cache.
const nomDe = (chemin, source) => {
  const lisible = decodeURI(chemin).split('/').pop().replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const empreinte = createHash('sha1').update(readFileSync(source)).digest('hex').slice(0, 8);
  return `${lisible}-${empreinte}`;
};

let traitees = 0;
let gardees = 0;
for (const chemin of [...chemins].sort()) {
  const source = `public${decodeURI(chemin)}`;
  if (!existsSync(source)) {
    console.warn(`[vignettes-blog] introuvable : ${source}`);
    continue;
  }
  const base = nomDe(chemin, source);
  const prec = ancien[chemin];
  const complet = (p) => p.largeurs.every((l) => ['avif', 'webp'].every((f) => existsSync(`${SORTIE}/${p.base}-${l}.${f}`)));
  if (prec && prec.base === base && complet(prec)) {
    manifeste[chemin] = prec;
    gardees += 1;
    continue;
  }
  const { width, height } = await sharp(source).metadata();
  // Jamais d'agrandissement : la plus grande largeur est celle du fichier si elle est plus petite.
  const plafond = Math.min(width, Math.max(...LARGEURS));
  const finales = [...new Set([...LARGEURS.filter((l) => l < plafond), plafond])];
  for (const l of finales) {
    const image = sharp(source).resize({ width: l, withoutEnlargement: true });
    await image.clone().avif({ quality: 50, effort: 4 }).toFile(`${SORTIE}/${base}-${l}.avif`);
    await image.clone().webp({ quality: 72 }).toFile(`${SORTIE}/${base}-${l}.webp`);
  }
  manifeste[chemin] = { base, largeur: width, hauteur: height, largeurs: finales };
  traitees += 1;
  const fin = finales.at(-1);
  console.log(
    `[vignettes-blog] ${base.padEnd(70)} ${(statSync(source).size / 1024).toFixed(0)} Ko -> ` +
    `${(statSync(`${SORTIE}/${base}-${finales[0]}.avif`).size / 1024).toFixed(0)} Ko (${finales[0]} px) / ` +
    `${(statSync(`${SORTIE}/${base}-${fin}.avif`).size / 1024).toFixed(0)} Ko (${fin} px)`,
  );
}

writeFileSync(MANIFESTE, JSON.stringify(manifeste, null, 2) + '\n', 'utf8');
console.log(`[vignettes-blog] ${traitees} image(s) traitée(s), ${gardees} déjà à jour.`);
