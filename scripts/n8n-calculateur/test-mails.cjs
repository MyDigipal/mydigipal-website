// Fait tourner le code du nœud n8n « Generate Email HTML » sur de vrais envois du calculateur,
// et écrit les deux mails de chaque cas en HTML pour les regarder.
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, 'generate-email.js'), 'utf8');
// Usage : node scripts/n8n-calculateur/test-mails.cjs <envois.json>
// <envois.json> : un tableau d'envois réels du calculateur (le corps posté au webhook), FR puis EN.
if (!process.argv[2]) { console.error('Donner le fichier des envois : node test-mails.cjs envois.json'); process.exit(1); }
const brut = fs.readFileSync(process.argv[2], 'utf8');
const payloads = JSON.parse(brut);

// Une demande de l'ancien calculateur : pas de `display`, pas d'audit, un message libre.
const v5 = JSON.parse(JSON.stringify(payloads[0]));
delete v5.display; delete v5.auditRequest; v5.metadata.source = 'marketing-calculator';
v5.contact.message = 'Bonjour, nous aimerions démarrer en janvier.';
const cas = { fr: payloads[0], en: payloads[1], v5 };

(async () => {
  for (const [nom, body] of Object.entries(cas)) {
    const run = new Function('$input', `return (async () => {${code}})()`);
    const out = await run({ first: () => ({ json: { body } }) });
    const j = out.json;
    const sortie = path.join(__dirname, 'apercus');
    fs.mkdirSync(sortie, { recursive: true });
    fs.writeFileSync(path.join(sortie, `${nom}-prospect.html`), j.prospectHtml);
    fs.writeFileSync(path.join(sortie, `${nom}-paul.html`), j.paulHtml);
    const interdit = /[–—]|[\u{1F300}-\u{1FAFF}]/u;
    console.log(nom, '|', j.prospectSubject, '|', j.paulSubject,
      '| tiret ou emoji :', interdit.test(j.prospectHtml + j.paulHtml + j.prospectSubject + j.paulSubject),
      '| undefined :', /undefined|NaN/.test(j.prospectHtml + j.paulHtml));
  }
})();
