/**
 * Les cas nommés du simulateur de formation, totaux calculés à la main.
 * Lancer : npm run test:formation (Node 24 lit le TypeScript sans compilation).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chiffrer, montant, etatDefaut, versAdresse, depuisAdresse, recommandation, type Etat } from './moteur.ts';
import { ACADEMY_REPLI } from './grille.ts';

const base: Etat = { ...etatDefaut('fr') };
const c = (e: Partial<Etat>) => chiffrer({ ...base, ...e }, ACADEMY_REPLI, 'fr');
const proche = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.01, `${a} ≠ ${b}`);

test('1 personne, une séance de 3 h à distance : 1 200 €', () => {
  const r = c({ n: 1 });
  assert.equal(r.seances, 1);
  proche(r.total, 1200);
  proche(r.parPersonne, 1200);
});

test('12 personnes, une séance de 3 h : 100 € par personne', () => {
  const r = c({ n: 12 });
  assert.equal(r.seances, 1);
  proche(r.total, 1200);
  proche(r.parPersonne, 100);
});

test('38 personnes en groupes : 3 séances de 13, 13 et 12, -10 %', () => {
  const r = c({ n: 38 });
  assert.deepEqual(r.groupes, [13, 13, 12]);
  // 3 x 1 200 = 3 600, remise de 10 % : 3 240
  proche(r.total, 3240);
  proche(r.parPersonne, 3240 / 38);
});

test('38 personnes en 4 groupes choisis : 10, 10, 9, 9', () => {
  const r = c({ n: 38, groupes: 4 });
  assert.deepEqual(r.groupes, [10, 10, 9, 9]);
  proche(r.total, 4320); // 4 x 1 200 = 4 800, -10 %
});

test('30 personnes tous ensemble : grand groupe +15 %', () => {
  proche(c({ n: 30, groupes: 'pleniere' }).total, 1380);
});

test('150 personnes en plénière : format webinaire +50 %', () => {
  const r = c({ n: 150, groupes: 'pleniere' });
  proche(r.total, 1800);
  proche(r.parPersonne, 12);
});

test('20 personnes en présentiel à Paris, avec hôtel et Academy', () => {
  const r = c({ n: 20, mode: 'site', zone: 'paris', hotel: true, academy: true });
  // 2 séances de 10 : 2 x 1 400 = 2 800, -5 % = 2 660
  // une journée sur place : 1 aller-retour 350 + 1 nuit 180 = 530
  // Academy : 290 TTC / 1,2 = 241,67 HT, -30 % = 169,17, x 20 = 3 383,33
  proche(r.total, 2660 + 530 + (290 / 1.2) * 0.7 * 20);
  assert.equal(r.lignes.map((l) => l.cle).join(','), 'seances,remise,deplacement,academy');
});

test('38 personnes, journées à Londres, en livres : déplacement compris', () => {
  const r = c({ n: 38, duree: 'jour', mode: 'site', zone: 'londres', devise: 'GBP' });
  proche(r.total, 5805); // 3 x 2 150 = 6 450, -10 %
  proche(r.lignes.find((l) => l.cle === 'deplacement')!.montant!, 0);
});

test('Hors d’Europe : le déplacement est sur devis et hors du total', () => {
  const r = c({ n: 12, mode: 'site', zone: 'monde' });
  assert.equal(r.surDevis, true);
  proche(r.total, 1400);
});

test('Recommandation : en plénière à 38, on propose les groupes', () => {
  assert.match(recommandation({ ...base, n: 38, groupes: 'pleniere' }, ACADEMY_REPLI, 'fr'), /3 groupes/);
});

test('Montants : la règle des arrondis et les deux écritures', () => {
  assert.equal(montant(1548.29, 'fr', 'EUR'), '1 548 €');
  assert.equal(montant(4.6, 'fr', 'EUR'), '4,6 €');
  assert.equal(montant(7, 'fr', 'EUR'), '7 €');
  assert.equal(montant(0.365, 'fr', 'EUR'), '0,36 €');
  assert.equal(montant(1200, 'en', 'USD'), '$1,200');
  assert.equal(montant(-120, 'en', 'GBP'), '-£120');
});

test('Adresse : un lien partagé redonne le même état', () => {
  const e: Etat = { n: 38, duree: 'jour', mode: 'site', zone: 'europe', hotel: true, groupes: 4, academy: true, devise: 'GBP' };
  assert.deepEqual(depuisAdresse('#' + versAdresse(e), etatDefaut('en')), e);
  assert.equal(depuisAdresse('#simulateur', etatDefaut('fr')), null);
});
