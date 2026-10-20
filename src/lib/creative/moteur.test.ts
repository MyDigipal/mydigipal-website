/**
 * Les cas nommés du simulateur créatif, totaux calculés à la main sur la grille du 20/10/2026.
 * Lancer : npm run test:creative (Node 24 lit le TypeScript sans compilation).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chiffrer, etatDefaut, versAdresse, depuisAdresse, type EtatCrea } from './moteur.ts';
import { GRILLE_CREA, prixPalier } from './grille.ts';

const vide: EtatCrea = { jeux: 0, canal: 'li', videos: 0, duree: 'v20', langues: 0, docs: 0, storyboards: 0, devise: 'USD' };
const c = (e: Partial<EtatCrea>) => chiffrer({ ...vide, ...e }, 'en');

test('Test one message : 1 jeu LinkedIn, 120 $', () => {
  assert.equal(c({ jeux: 1 }).total, 120);
});

test('Three messages on LinkedIn : 3 x 100 $ = 300 $', () => {
  const r = c({ jeux: 3 });
  assert.equal(r.total, 300);
  assert.equal(r.economie, 60);
});

test('Three messages on LinkedIn and Google : 3 x 190 $ = 570 $', () => {
  assert.equal(c({ jeux: 3, canal: 'both' }).total, 570);
});

test('Three messages and a video : 300 $ + 300 $ = 600 $', () => {
  assert.equal(c({ jeux: 3, videos: 1 }).total, 600);
});

test('Two months of fresh ads : 12 x 80 + 300 + 300 = 1 560 $', () => {
  assert.equal(c({ jeux: 12, videos: 1, docs: 1 }).total, 1560);
});

test('A video series : 3 x 260 $ = 780 $', () => {
  assert.equal(c({ videos: 3 }).total, 780);
});

test('Le palier 6 à 10 LinkedIn et Google vaut 160 $ (le tableau, pas l’arrondi du simulateur Exaforce)', () => {
  assert.equal(prixPalier(GRILLE_CREA.jeux.both, 6, 'USD'), 160);
  assert.equal(prixPalier(GRILLE_CREA.jeux.both, 10, 'USD'), 160);
});

test('Une langue en plus sur 3 jeux LinkedIn : +30 % de 300 $ = 90 $', () => {
  const r = c({ jeux: 3, langues: 1 });
  assert.equal(r.total, 390);
});

test('En euros : 3 jeux LinkedIn et une vidéo de 15 à 20 s = 3 x 90 + 280 = 550 €', () => {
  assert.equal(chiffrer({ ...vide, jeux: 3, videos: 1, devise: 'EUR' }, 'fr').total, 550);
});

test('En livres : 11 jeux Google = 11 x 80 = 880 £', () => {
  assert.equal(chiffrer({ ...vide, jeux: 11, canal: 'pm', devise: 'GBP' }, 'en').total, 880);
});

test('Tous les montants de la grille sont ronds (multiples de 10)', () => {
  const tous = [
    ...Object.values(GRILLE_CREA.jeux).flat(), ...Object.values(GRILLE_CREA.videos).flat(),
  ].flatMap((p) => Object.values(p.prix)).concat(Object.values(GRILLE_CREA.documentAd), Object.values(GRILLE_CREA.storyboard));
  tous.forEach((v) => assert.equal(v % 10, 0, `${v} n’est pas rond`));
});

test('L’adresse rouvre le même chiffrage', () => {
  const e: EtatCrea = { jeux: 7, canal: 'pm', videos: 2, duree: 'v30', langues: 1, docs: 1, storyboards: 2, devise: 'GBP' };
  assert.deepEqual(depuisAdresse('#' + versAdresse(e), etatDefaut('fr')), e);
  assert.equal(depuisAdresse('#chiffrage&n=3', etatDefaut('fr')), null);
});
