// Publication programmée des articles du blog.
//
// Lit src/data/blog/calendrier-publication.json et passe en `draft: false`, dans les deux langues,
// chaque article dont la date de publication (heure de Londres) est arrivée. Ne touche à rien
// d'autre : un article absent du calendrier reste comme il est.
//
// Lancé chaque matin par .github/workflows/publier-articles.yml, qui pousse le commit ; Render
// reconstruit le site sur ce push. À la main : `node scripts/publier-articles-programmes.mjs`
// (ajouter `--date AAAA-MM-JJ` pour simuler un autre jour, `--essai` pour ne rien écrire).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const racine = process.cwd();
const calendrier = JSON.parse(
  readFileSync(join(racine, 'src/data/blog/calendrier-publication.json'), 'utf8'),
);

const args = process.argv.slice(2);
const essai = args.includes('--essai');
const iDate = args.indexOf('--date');
// Date du jour à Londres, au format AAAA-MM-JJ (en-CA écrit déjà dans cet ordre).
const aujourdhui =
  iDate >= 0
    ? args[iDate + 1]
    : new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

const publies = [];
const erreurs = [];

for (const { slug, publier_le: le } of calendrier.articles) {
  if (le > aujourdhui) continue;
  for (const lang of ['en', 'fr']) {
    const fichier = join(racine, 'src/content/blog', lang, `${slug}.mdx`);
    if (!existsSync(fichier)) {
      erreurs.push(`${lang}/${slug}.mdx introuvable`);
      continue;
    }
    const texte = readFileSync(fichier, 'utf8');
    // Le frontmatter seul : entre le premier et le deuxième `---`.
    const fin = texte.indexOf('\n---', 3);
    const entete = texte.slice(0, fin);
    if (!/^draft:\s*true\s*$/m.test(entete)) continue;
    // Garde-fou : jamais d'article en ligne sans sa vidéo, sa vignette et son image d'attente.
    const manquants = ['image', 'video', 'videoPoster']
      .map((champ) => (entete.match(new RegExp(`^${champ}:\\s*"([^"]+)"`, 'm')) || [])[1])
      .filter((chemin) => chemin && !existsSync(join(racine, 'public', chemin)));
    if (manquants.length) {
      erreurs.push(`${lang}/${slug} : fichier absent, publication refusée (${manquants.join(', ')})`);
      continue;
    }
    const nouvel = entete.replace(/^draft:\s*true\s*$/m, 'draft: false');
    if (!essai) writeFileSync(fichier, nouvel + texte.slice(fin), 'utf8');
    publies.push(`${lang}/${slug} (prévu le ${le})`);
  }
}

console.log(`Jour de référence (Londres) : ${aujourdhui}`);
console.log(publies.length ? `Publiés :\n  ${publies.join('\n  ')}` : 'Rien à publier aujourd’hui.');
if (erreurs.length) {
  console.error(`Erreurs :\n  ${erreurs.join('\n  ')}`);
  process.exit(1);
}
