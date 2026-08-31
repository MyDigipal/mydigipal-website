#!/usr/bin/env node
/**
 * Controle SEO du dossier dist, lance apres chaque build (local et Render).
 *
 * Il existe parce que trois fichiers derivaient sans que personne le voie :
 * le sitemap annoncait huit articles en brouillon qui repondaient 404, le
 * llms.txt datait de sept mois, et quatre bilans clients etaient servis
 * publiquement depuis public/images. Un audit trouve ces choses une fois par an ;
 * un build les trouve a chaque fois.
 *
 * Par defaut une faute casse le build, donc elle se corrige avant le commit.
 * Pour un deploiement urgent : SEO_CHECK=warn npm run build (les fautes
 * s'affichent, le build passe).
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const MODE = process.env.SEO_CHECK === 'warn' ? 'warn' : 'strict';

const TITRE = [50, 60];
const DESC = [145, 160];

const fautes = [];
const faute = (regle, detail) => fautes.push({ regle, detail });

/** Toutes les pages HTML du build. */
function pagesHtml(dir = DIST, acc = []) {
  for (const nom of readdirSync(dir)) {
    const p = join(dir, nom);
    if (statSync(p).isDirectory()) pagesHtml(p, acc);
    else if (nom.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const url = (fichier) =>
  '/' + relative(DIST, fichier).replace(/\\/g, '/').replace(/\/index\.html$/, '').replace(/^index\.html$/, '');

const pages = pagesHtml();
const connues = new Set(pages.map(url));

// --- 1. Le sitemap ne doit annoncer que des pages qui existent -------------
const sitemap = join(DIST, 'sitemap.xml');
if (!existsSync(sitemap)) {
  faute('sitemap', 'dist/sitemap.xml est absent');
} else {
  const xml = readFileSync(sitemap, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) faute('sitemap', 'aucune URL dans le sitemap');
  for (const loc of locs) {
    const chemin = loc.replace(/^https?:\/\/[^/]+/, '') || '/';
    if (!connues.has(chemin)) {
      faute('sitemap', `${chemin} est annonce au sitemap mais aucune page n'est generee (404 pour Google)`);
    }
  }
}

// --- 2. Aucun document client ne doit etre publie --------------------------
for (const p of pages) {
  const u = url(p);
  if (u.startsWith('/images/') || u.startsWith('/videos/')) {
    faute('document publie', `${u} est servi publiquement. Les documents clients vont dans docs/, hors du build.`);
  }
}

// --- 3. llms.txt present et non vide --------------------------------------
const llms = join(DIST, 'llms.txt');
if (!existsSync(llms)) faute('llms.txt', 'absent du build');
else {
  const t = readFileSync(llms, 'utf8');
  if (t.length < 400) faute('llms.txt', `trop court (${t.length} caracteres), la generation a probablement echoue`);
  if (!t.includes('## Services')) faute('llms.txt', 'la section Services est absente');
}

// --- 4. robots.txt present et coherent -------------------------------------
const robots = join(DIST, 'robots.txt');
if (!existsSync(robots)) faute('robots.txt', 'absent du build');
else {
  const t = readFileSync(robots, 'utf8');
  if (!/^Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/m.test(t)) {
    faute('robots.txt', "ne declare pas l'URL du sitemap");
  }
}

// --- 5. Titres et descriptions des pages indexables ------------------------
const ignorees = (u) => u.startsWith('/admin') || u === '/test' || u === '/404' || u.endsWith('/merci');

let indexables = 0;
const vus = { titres: new Map(), descs: new Map() };

for (const p of pages) {
  const u = url(p);
  if (ignorees(u)) continue;
  const html = readFileSync(p, 'utf8');
  if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) continue;
  indexables++;

  const mt = html.match(/<title>([\s\S]*?)<\/title>/);
  const md = html.match(/<meta name="description" content="([\s\S]*?)"/);
  const t = mt ? mt[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim() : '';
  const d = md ? md[1].replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim() : '';

  if (!t) faute('titre', `${u} : aucun titre`);
  else if (t.length < TITRE[0] || t.length > TITRE[1]) {
    faute('titre', `${u} : ${t.length} caracteres (attendu ${TITRE[0]}-${TITRE[1]}) - ${t}`);
  }

  if (!d) faute('description', `${u} : aucune description`);
  else if (d.length < DESC[0] || d.length > DESC[1]) {
    faute('description', `${u} : ${d.length} caracteres (attendu ${DESC[0]}-${DESC[1]})`);
  }

  if (t) vus.titres.set(t, [...(vus.titres.get(t) || []), u]);
  if (d) vus.descs.set(d, [...(vus.descs.get(d) || []), u]);

  if (!/<h1[\s>]/i.test(html)) faute('h1', `${u} : aucun H1`);
}

for (const [t, urls] of vus.titres) if (urls.length > 1) faute('doublon', `titre partage par ${urls.join(', ')} : ${t}`);
for (const [, urls] of vus.descs) if (urls.length > 1) faute('doublon', `description partagee par ${urls.join(', ')}`);

// --- Verdict ---------------------------------------------------------------
const total = pages.length;
if (!fautes.length) {
  console.log(`\x1b[32m[check-seo]\x1b[0m ${indexables} pages indexables sur ${total} : titres, descriptions, H1, sitemap, llms.txt et robots.txt conformes.`);
  process.exit(0);
}

const parRegle = fautes.reduce((acc, f) => ({ ...acc, [f.regle]: [...(acc[f.regle] || []), f.detail] }), {});
console.error(`\n\x1b[31m[check-seo] ${fautes.length} probleme(s) sur ${indexables} pages indexables\x1b[0m\n`);
for (const [regle, details] of Object.entries(parRegle)) {
  console.error(`  ${regle} (${details.length})`);
  for (const d of details.slice(0, 12)) console.error(`    - ${d}`);
  if (details.length > 12) console.error(`    ... et ${details.length - 12} autres`);
  console.error('');
}

if (MODE === 'warn') {
  console.error('SEO_CHECK=warn : le build passe malgre ces problemes.\n');
  process.exit(0);
}
console.error('Corriger avant de committer, ou SEO_CHECK=warn npm run build pour un deploiement urgent.\n');
process.exit(1);
