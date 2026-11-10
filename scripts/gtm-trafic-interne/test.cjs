// Essais de la variable GTM 287 « JS - Trafic interne (traffic_type) » (variable.js) et de la
// balise 289 « Interne - Témoin mdp_interne (pose et retrait) » (balise.html), conteneur
// GTM-P4TSQ9Q, en ligne depuis la version 110 (10/11/2026). Les deux fichiers sont la copie exacte
// de ce qui est dans GTM : toute modification se fait ici d'abord, se rejoue, puis se reporte.
// Lancer : node scripts/gtm-trafic-interne/test.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const srcVariable = fs.readFileSync(path.join(__dirname, 'variable.js'), 'utf8').trim();
const srcBalise = fs.readFileSync(path.join(__dirname, 'balise.html'), 'utf8')
  .replace('<script>', '').replace('</script>', '');

assert.ok(!srcVariable.includes(String.fromCharCode(92)), 'antislash dans la variable');
assert.ok(!srcBalise.includes(String.fromCharCode(92)), 'antislash dans la balise');

// Un navigateur minimal : une adresse, et un pot de témoins qui respecte max-age.
function navigateur(url, pot) {
  const u = new URL(url);
  const ecrits = [];
  const document = {
    get cookie() { return Object.keys(pot).map((k) => k + '=' + pot[k]).join('; '); },
    set cookie(v) {
      ecrits.push(v);
      const morceaux = v.split(';').map((s) => s.trim());
      const [nom, valeur] = morceaux[0].split('=');
      const age = morceaux.find((m) => m.toLowerCase().startsWith('max-age='));
      if (age && Number(age.split('=')[1]) <= 0) delete pot[nom]; else pot[nom] = valeur;
    },
  };
  const window = { location: { search: u.search, hostname: u.hostname, protocol: u.protocol } };
  return { window, document, ecrits };
}

function variable(url, pot) {
  const n = navigateur(url, pot || {});
  return new Function('window', 'document', 'return (' + srcVariable + ')();')(n.window, n.document);
}

function balise(url, pot) {
  const n = navigateur(url, pot);
  new Function('window', 'document', srcBalise)(n.window, n.document);
  return n.ecrits;
}

const S = 'https://www.mydigipal.com';
const cas = [
  ['visiteur ordinaire', S + '/fr/calculator', {}, undefined],
  ['visiteur venu de Google Ads', S + '/en/academy?gclid=abc&utm_source=google&utm_medium=cpc', {}, undefined],
  ['interne=1', S + '/fr?interne=1', {}, 'internal'],
  ['interne=1 en second paramètre', S + '/fr?a=b&interne=1', {}, 'internal'],
  ['utm_source=test-claude', S + '/fr/calculator?utm_source=test-claude&utm_medium=essai', {}, 'internal'],
  ['utm_source=test-local', 'http://localhost:4321/fr?utm_source=test-local', {}, 'internal'],
  ['envoi=test', S + '/fr/services/ai-training?envoi=test', {}, 'internal'],
  ['envoi=test2 ne compte pas', S + '/fr?envoi=test2', {}, undefined],
  ['utm_source=testimonial ne compte pas', S + '/fr?utm_source=testimonial', {}, undefined],
  ['utm_campaign=test-x ne compte pas', S + '/fr?utm_source=google&utm_campaign=test-x', {}, undefined],
  ['binterne=1 ne compte pas', S + '/fr?binterne=1', {}, undefined],
  ['interne=10 ne compte pas', S + '/fr?interne=10', {}, undefined],
  ['témoin présent', S + '/fr', { a: 'b', mdp_interne: '1', c: 'd' }, 'internal'],
  ['témoin seul', S + '/fr', { mdp_interne: '1' }, 'internal'],
  ['témoin en dernier', S + '/fr', { a: 'b', mdp_interne: '1' }, 'internal'],
  ['témoin au nom voisin', S + '/fr', { xmdp_interne: '1' }, undefined],
  ['témoin à une autre valeur', S + '/fr', { mdp_interne: '10' }, undefined],
  ['interne=0 gagne sur le témoin', S + '/fr?interne=0', { mdp_interne: '1' }, undefined],
];
for (const [nom, url, pot, attendu] of cas) {
  assert.strictEqual(variable(url, pot), attendu, 'variable : ' + nom);
}
console.log('variable :', cas.length, 'cas OK');

// La balise
assert.deepStrictEqual(balise(S + '/fr/calculator', {}), [], 'rien écrit pour un visiteur ordinaire');
assert.deepStrictEqual(balise(S + '/en/academy?gclid=abc&utm_source=google', {}), [], 'rien écrit pour une visite payante');
assert.deepStrictEqual(balise(S + '/fr?interne=1', {}),
  ['mdp_interne=1; max-age=34560000; path=/; SameSite=Lax; domain=.mydigipal.com; Secure']);
assert.deepStrictEqual(balise('https://academy.mydigipal.com/fr/start?utm_source=test-claude', {}),
  ['mdp_interne=1; max-age=34560000; path=/; SameSite=Lax; domain=.mydigipal.com; Secure']);
assert.deepStrictEqual(balise('https://mydigipal.com/fr?envoi=test', {}),
  ['mdp_interne=1; max-age=34560000; path=/; SameSite=Lax; domain=.mydigipal.com; Secure']);
assert.deepStrictEqual(balise('http://localhost:4321/fr?utm_source=test-local', {}),
  ['mdp_interne=1; max-age=34560000; path=/; SameSite=Lax']);
assert.deepStrictEqual(balise('https://notmydigipal.com/?interne=1', {}),
  ['mdp_interne=1; max-age=34560000; path=/; SameSite=Lax; Secure']);
assert.deepStrictEqual(balise(S + '/fr?interne=0', { mdp_interne: '1' }),
  ['mdp_interne=; max-age=0; path=/; SameSite=Lax; domain=.mydigipal.com; Secure']);
console.log('balise : 8 cas OK');

// Le parcours complet dans un même navigateur
const pot = {};
const pas = [
  [S + '/fr', undefined],
  [S + '/fr/calculator?utm_source=test-claude', 'internal'],
  [S + '/fr/services/seo', 'internal'],
  ['https://academy.mydigipal.com/fr/start', 'internal'],
  [S + '/fr?interne=0', undefined],
  [S + '/fr/contact', undefined],
];
for (const [url, attendu] of pas) {
  // La variable est lue quand la balise Google part, la balise du témoin passe sur la même page.
  assert.strictEqual(variable(url, pot), attendu, 'parcours : ' + url);
  balise(url, pot);
}
console.log('parcours : 6 pages OK, pot final', JSON.stringify(pot));
console.log('octets : variable', Buffer.byteLength(srcVariable), '| balise', Buffer.byteLength(srcBalise));
