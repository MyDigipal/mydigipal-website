/**
 * Le devis unique (20/10/2026) : le calculateur chiffre la formation et la créa EXACTEMENT
 * comme les simulateurs de leurs pages, dans chaque devise, et un devis voyage sans perte
 * (lien partagé, envoi). `npm run test:devis` (le test est empaqueté par esbuild, parce que
 * le moteur importe ses données sans extension).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, decodePlan, devis, devisePlan, encodePlan, etatCrea, etatFormation, reponsesCrea, reponsesFormation, sequence, type QuoteState } from '../../components/calculator-v6/engine';
import { convertPrice } from '../../components/calculator/data';
import { chiffrer as chiffrerFormation } from '../formation/moteur';
import { ACADEMY_REPLI } from '../formation/grille';
import { chiffrer as chiffrerCrea } from '../creative/moteur';

const st = (p: Partial<QuoteState>): QuoteState => ({ domains: [], answers: {}, discuss: {}, duration: 4, ...p });
const DEVISES = ['EUR', 'GBP', 'USD'] as const;

test('la formation par défaut : le même total que le simulateur de la page, dans chaque devise', () => {
  for (const c of DEVISES) {
    const q = devis(st({ domains: ['ai-training'] }), c);
    const attendu = chiffrerFormation(etatFormation({}, c), ACADEMY_REPLI, 'fr').total;
    assert.equal(q.oneOff, attendu, c);
    assert.equal(q.monthly, 0);
  }
  // 12 personnes, 3 h, à distance : une séance, 1 200 EUR, 990 GBP, 1 490 USD.
  assert.equal(devis(st({ domains: ['ai-training'] }), 'GBP').oneOff, 990);
});

test('une formation réglée sur la page (40 personnes en présentiel à Paris, Academy) se chiffre pareil', () => {
  const e = { n: 40, duree: 'jour' as const, mode: 'site' as const, zone: 'paris' as const, hotel: true, groupes: 'auto' as const, academy: true, devise: 'EUR' as const };
  const a = reponsesFormation(e);
  for (const c of DEVISES) {
    const page = chiffrerFormation({ ...e, devise: c }, ACADEMY_REPLI, 'fr');
    const q = devis(st({ domains: ['ai-training'], answers: a }), c);
    assert.equal(q.oneOff, page.total, c);
    assert.equal(q.domains[0].lines.length, page.lignes.length);
  }
  assert.deepEqual(etatFormation(a, 'EUR'), e);
});

test('un déplacement hors d’Europe reste « sur devis »', () => {
  const q = devis(st({ domains: ['ai-training'], answers: { 'tr-mode': 'onsite', 'tr-zone': 'monde' } }), 'EUR');
  assert.ok(q.domains[0].lines.some((l) => l.per === 'quote'));
});

test('la créa : le même total que le simulateur de la page, une fois ou chaque mois', () => {
  const e = { jeux: 12, canal: 'both' as const, videos: 3, duree: 'v30' as const, langues: 1, docs: 2, storyboards: 1, devise: 'EUR' as const };
  for (const c of DEVISES) {
    const page = chiffrerCrea({ ...e, devise: c }, 'fr').total;
    const une = devis(st({ domains: ['creative-design'], answers: reponsesCrea(e) }), c);
    assert.equal(une.oneOff, page, c);
    assert.equal(une.monthly, 0);
    const mois = devis(st({ domains: ['creative-design'], answers: { ...reponsesCrea(e), 'cr-rythme': 'month' }, duration: 4 }), c);
    assert.equal(mois.beforeDiscount, page, c);
    assert.equal(mois.oneOff, 0);
  }
  assert.deepEqual(etatCrea(reponsesCrea(e), 'EUR'), e);
});

test('la créa par défaut : 3 jeux LinkedIn et 1 vidéo, 550 EUR', () => {
  assert.equal(devis(st({ domains: ['creative-design'] }), 'EUR').oneOff, 3 * 90 + 280);
});

test('les grilles en euros sont converties ligne par ligne, et le total additionne les lignes', () => {
  const s = st({ domains: ['google-ads', 'seo'], answers: { 'ga-budget': 3000, 'seo-monthly': 1, 'seo-audit': 0 } });
  const eur = devis(s, 'EUR');
  const gbp = devis(s, 'GBP');
  for (const [k, d] of gbp.domains.entries()) {
    for (const [j, l] of d.lines.entries()) assert.equal(l.amount, convertPrice(eur.domains[k].lines[j].amount, 'GBP'));
  }
  const somme = gbp.domains.flatMap((d) => d.lines).filter((l) => l.per === 'month').reduce((x, l) => x + l.amount, 0);
  assert.equal(gbp.beforeDiscount, somme);
  assert.equal(gbp.currency, 'GBP');
});

test('un devis mélangé : honoraires mensuels, formation et créa ponctuelles', () => {
  const s = st({ domains: ['google-ads', 'ai-training', 'creative-design'], answers: { 'ga-budget': 2000 }, duration: 6 });
  const q = devis(s, 'EUR');
  assert.ok(q.monthly > 0);
  assert.equal(q.oneOff, 1200 + 550);
  assert.equal(q.totalFees, q.monthly * 6 + q.oneOff);
});

test('un lien rouvre le même devis, réglages de la formation et de la créa et devise compris', () => {
  const s = st({ domains: ['ai-training', 'creative-design'], answers: { 'tr-n': 30, 'tr-groupes': 'pleniere', 'tr-hotel': 'yes', 'cr-jeux': 5, 'cr-canal': 'pm', 'cr-rythme': 'month' }, duration: 12 });
  const code = encodePlan(s, 'GBP');
  assert.deepEqual(decodePlan(code), s);
  assert.equal(devisePlan(code), 'GBP');
  assert.equal(devisePlan(encodePlan(s)), null);
});

test('l’extrait d’une page : le service de la page, « ajouter un service », la durée s’il y a du mensuel, le devis', () => {
  assert.deepEqual(sequence(st({ domains: ['google-ads'] }), ['google-ads']), ['ga-budget', 'ajout', 'duration', 'recap']);
  assert.deepEqual(sequence(st({ domains: ['creative-design'] }), ['creative-design']), ['cr-jeux', 'cr-videos', 'cr-extras', 'cr-rythme', 'ajout', 'recap']);
  assert.deepEqual(sequence(st({ domains: ['ai-training'], answers: { 'tr-mode': 'onsite' } }), ['ai-training']), ['tr-format', 'tr-n', 'tr-mode', 'tr-zone', 'tr-academy', 'ajout', 'recap']);
  // Un service ajouté se pose après « ajouter un service ».
  assert.deepEqual(sequence(st({ domains: ['seo', 'google-ads'] }), ['google-ads']).slice(0, 3), ['ga-budget', 'ajout', 'seo-audit']);
  // Le calculateur commence par le choix des services.
  assert.equal(sequence(st({}))[0], 'pick');
});

test('l’envoi : montants de l’écran pour le prospect, euros pour Paul, origine, aucune clé des anciens simulateurs', () => {
  const s = st({ domains: ['ai-training'], answers: { 'tr-n': 12 } });
  const p = buildPayload(s, { name: 'A', email: 'a@b.co', company: 'C' }, 'fr', 'GBP', { id: 'formation', libelle: 'la page AI Training' }) as Record<string, unknown> & ReturnType<typeof buildPayload>;
  assert.equal(p.display.oneOff, '990 £');
  assert.equal(p.pricing.oneOffTotal, 1200);
  assert.equal(p.metadata.origine.id, 'formation');
  assert.ok(!('formation' in p) && !('creative' in p));
  assert.equal(p.display.domains[0].lines[0].detail, '12 personnes');
  assert.match(p.metadata.planUrl, /^https:\/\/mydigipal\.com\/fr\/calculator#plan=/);
});
