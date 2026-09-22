// ============================================================
// Calculateur MyDigipal : les deux mails d'une demande de devis
// ============================================================
// Refonte du 22/09/2026, avec la v6 du calculateur (mydigipal.com/{lang}/calculator).
// Ce nœud fabrique TOUT : le mail au prospect, le mail à Paul, leurs sujets, et les
// champs du Google Sheet. Les nœuds Gmail ne font qu'envoyer `prospectHtml` et `paulHtml`.
//
// - Le prospect voit les montants de l'écran, dans SA devise (`display`, fourni par le
//   site avec la règle d'arrondi). Une ancienne demande sans `display` (la v5, gardée en
//   noindex) retombe sur les montants en euros.
// - Paul voit tout en euros (`pricing`, `departmentBreakdown`), plus les réponses de
//   l'audit, la provenance de la visite et le lien qui rouvre le devis.
// - Plus de pièce jointe HTML : le mail est lui-même le devis, et « Revoir mon devis »
//   le rouvre dans le calculateur.
// - Règles de Paul : accents partout, aucun emoji, aucun liseré coloré sur le côté d'un
//   encadré, montants arrondis (aucune décimale à partir de 10 €).

const data = $input.first().json.body || {};
const contact = data.contact || {};
const P = data.pricing || {};
const meta = data.metadata || {};
const lang = meta.lang === 'en' || data.language === 'en' ? 'en' : 'fr';
const fr = lang === 'fr';
const tr = (a, b) => (fr ? a : b);
const duration = Number(data.duration) || 4;
const discountPct = Number(P.discountPercentage) || 0;
const audit = data.auditRequest || {};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sansEspaces = (s) => String(s || '').replace(/[\s  ]/g, '').toLowerCase();
const nl2br = (s) => esc(s).replace(/\r?\n/g, '<br>');
const prenom = (String(contact.name || '').trim().split(/\s+/)[0]) || '';

// Montant en euros, règle d'arrondi MyDigipal : aucune décimale à partir de 10, une entre 1 et 10, deux sous 1.
const eur = (v) => {
  const n = Number(v) || 0;
  const d = n >= 10 || Number.isInteger(n) ? 0 : n >= 1 ? 1 : 2;
  return n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/[  ]/g, ' ') + ' €';
};

// --- Les montants en euros, service par service (Paul, et repli pour le prospect) ----------
const breakdown = data.departmentBreakdown || [];
const parMoisFr = '/mois';
const eurDomains = (l) => breakdown.map((d) => ({
  name: d.name,
  discuss: !!d.isNotSure,
  lines: d.isNotSure ? [] : [
    ...(d.services || []).map((s) => ({ label: s.name, level: s.level || '', amount: eur(s.price) + (s.isOneOff ? (l === 'fr' ? ' une fois' : ' one-off') : (l === 'fr' ? parMoisFr : '/mo')), kind: 'service' })),
    ...(d.managementFee ? [{ label: l === 'fr' ? 'Honoraires de gestion' : 'Management fee', level: '', amount: eur(d.managementFee) + (l === 'fr' ? parMoisFr : '/mo'), kind: 'fee' }] : []),
    ...(d.mediaBudget ? [{ label: l === 'fr' ? 'Budget média' : 'Media budget', level: '', amount: eur(d.mediaBudget) + (l === 'fr' ? parMoisFr : '/mo'), kind: 'media' }] : []),
  ],
}));
const beforeDiscountEur = (Number(P.monthlyTotal) || 0) + (Number(P.managementFeesTotal) || 0);
const monthlyEur = Number(P.monthlyAfterDiscount) || 0;

const D = data.display || {
  currency: 'EUR',
  monthly: eur(monthlyEur),
  beforeDiscount: eur(beforeDiscountEur),
  discount: P.discount ? eur(P.discount) : '',
  oneOff: P.oneOffTotal ? eur(P.oneOffTotal) : '',
  media: P.adBudgetTotal ? eur(P.adBudgetTotal) : '',
  totalFees: eur(P.grandTotalWithoutBudget || 0),
  perMonth: tr('/mois', '/mo'),
  domains: eurDomains(lang),
};
const toutADiscuter = monthlyEur <= 0 && !(Number(P.oneOffTotal) > 0);

// --- Briques communes -------------------------------------------------------------------
const C = { bg: '#f3f5f8', card: '#ffffff', ink: '#0f1b29', text: '#394859', muted: '#5f7084', line: '#dae1ea', soft: '#eef4fb', brand: '#1D71B8', grey: '#f3f5f8' };
const FONT = "Arial, Helvetica, sans-serif";
const LOGO = 'https://mydigipal.com/images/Logos/MyDigipal%20Logo_Full%20Main.png';
const BOOKING = 'https://calendar.app.google/ofYHfRHbFoMpVxf79';
const planUrl = meta.planUrl || `https://mydigipal.com/${lang}/calculator`;

const p = (html, style = '') => `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.text};${style}">${html}</p>`;
const h2 = (txt) => `<h2 style="margin:0 0 12px;font-family:${FONT};font-size:18px;line-height:1.3;color:${C.ink};font-weight:bold;">${txt}</h2>`;
const bouton = (href, txt, plein = true) =>
  `<a href="${esc(href)}" style="display:inline-block;font-family:${FONT};font-size:15px;font-weight:bold;text-decoration:none;border-radius:10px;padding:13px 22px;${plein ? `background:${C.brand};color:#ffffff;` : `background:${C.grey};color:${C.ink};`}">${txt}</a>`;
const espace = (px) => `<tr><td style="height:${px}px;line-height:${px}px;font-size:0;">&nbsp;</td></tr>`;
const ligne = (gauche, droite, opts = {}) => `<tr>
  <td style="padding:${opts.pad || '9px'} 0;border-top:${opts.first ? '0' : `1px solid ${C.line}`};font-family:${FONT};font-size:14px;line-height:1.45;color:${opts.strong ? C.ink : C.text};${opts.strong ? 'font-weight:bold;' : ''}">${gauche}</td>
  <td align="right" style="padding:${opts.pad || '9px'} 0 ${opts.pad || '9px'} 12px;border-top:${opts.first ? '0' : `1px solid ${C.line}`};font-family:${FONT};font-size:14px;line-height:1.45;color:${C.ink};white-space:nowrap;${opts.strong ? 'font-weight:bold;' : ''}">${droite}</td>
</tr>`;

const enveloppe = (titre, preheader, corps, pied) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(titre)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.card};border-radius:16px;">
<tr><td style="padding:28px 32px 6px;"><img src="${LOGO}" alt="MyDigipal" width="140" style="display:block;width:140px;height:auto;border:0;"></td></tr>
<tr><td style="padding:14px 32px 30px;">${corps}</td></tr>
</table>
${pied ? `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;"><tr><td style="padding:18px 32px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};text-align:center;">${pied}</td></tr></table>` : ''}
</td></tr></table>
</body></html>`;

// Le détail, service par service (sert aux deux mails, dans la devise voulue).
const detail = (domaines, l) => domaines.map((d) => {
  const titre = `<tr><td colspan="2" style="padding:18px 0 6px;font-family:${FONT};font-size:15px;font-weight:bold;color:${C.ink};">${esc(d.name)}</td></tr>`;
  if (d.discuss || !d.lines.length) {
    return titre + ligne(`<span style="color:${C.muted};">${l === 'fr' ? 'À définir ensemble' : 'To define together'}</span>`, '', { first: true, pad: '4px' });
  }
  return titre + d.lines.map((x, i) => ligne(
    // Le libellé porte souvent déjà le niveau (« Audit SEO, Essentiel ») : on ne le répète pas.
    `${esc(x.label)}${x.level && !sansEspaces(x.label).includes(sansEspaces(x.level)) ? ` <span style="color:${C.muted};">· ${esc(x.level)}</span>` : ''}`,
    esc(x.amount),
    { first: i === 0 }
  )).join('');
}).join('');

// --- Le mail au prospect --------------------------------------------------------------------
// [libellé pour le prospect, libellé pour Paul, réponse]
const auditChamps = [
  [tr('Vos clients, et comment ils vous trouvent', 'Your customers, and how they find you'), 'Ses clients, et comment ils le trouvent', audit.clients],
  [tr('Ce qui marche, ce qui coince', 'What works, what gets stuck'), 'Ce qui marche, ce qui coince', audit.whatWorks],
  [tr('Votre priorité à trois mois', 'Your three-month priority'), 'Sa priorité à trois mois', audit.priority],
].filter(([, , v]) => String(v || '').trim());
const aAudit = !!String(audit.website || '').trim() || auditChamps.length > 0;
const site = String(audit.website || '').trim();
const siteLien = site ? `<a href="${esc(/^https?:\/\//i.test(site) ? site : 'https://' + site)}" style="color:${C.brand};text-decoration:none;">${esc(site.replace(/^https?:\/\//i, '').replace(/\/$/, ''))}</a>` : '';

const resume = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border-radius:14px;">
<tr><td style="padding:22px 24px;">
  <p style="margin:0;font-family:${FONT};font-size:13px;color:${C.muted};">${tr('Nos honoraires, par mois', 'Our fees, per month')}</p>
  <p style="margin:4px 0 0;font-family:${FONT};font-size:34px;line-height:1.1;font-weight:bold;color:${C.ink};">${toutADiscuter ? tr('À définir ensemble', 'To define together') : esc(D.monthly)}</p>
  <p style="margin:6px 0 0;font-family:${FONT};font-size:13px;color:${C.muted};">${discountPct ? tr(`Remise de ${discountPct} % déduite, engagement de ${duration} mois`, `${discountPct}% discount applied, ${duration}-month commitment`) : tr(`Engagement de ${duration} mois`, `${duration}-month commitment`)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
    ${D.oneOff ? ligne(tr('Mise en place', 'Set-up'), `${esc(D.oneOff)}${tr(' une fois', ' one-off')}`) : ''}
    ${D.media ? ligne(`${tr('Budget média', 'Media budget')}<br><span style="font-size:12px;color:${C.muted};">${tr('Payé directement aux plateformes', 'Paid directly to the platforms')}</span>`, `${esc(D.media)}${esc(D.perMonth)}`) : ''}
    ${toutADiscuter ? '' : ligne(tr(`Total sur ${duration} mois, mise en place comprise`, `Total over ${duration} months, set-up included`), esc(D.totalFees), { strong: true })}
  </table>
</td></tr></table>`;

const blocAudit = aAudit
  ? h2(tr('Votre audit', 'Your audit'))
    + p(site
      ? tr(`On étudie ${siteLien} de l’extérieur, avec vos réponses : vos recherches, vos concurrents, votre tracking. L’audit arrive avec notre appel.`,
        `We look at ${siteLien} from the outside, with your answers: your searches, your competitors, your tracking. The audit comes with our call.`)
      : tr('On part de vos réponses pour préparer un audit adapté à votre entreprise. Il arrive avec notre appel.', 'We start from your answers to prepare an audit tailored to your business. It comes with our call.'))
    + auditChamps.map(([q, , v]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:${C.grey};border-radius:10px;"><tr><td style="padding:12px 14px;">
      <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;color:${C.muted};">${esc(q)}</p>
      <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.55;color:${C.ink};">${nl2br(v)}</p>
    </td></tr></table>`).join('')
  : h2(tr('Un audit, en plus du devis', 'An audit, on top of the quote'))
    + p(tr('Ce devis repose sur nos grilles de prix. Répondez à ce mail avec l’adresse de votre site : on l’étudie de l’extérieur et on vous envoie un audit adapté.',
      'This quote is based on our price grid. Reply to this email with your website address: we look at it from the outside and send you a tailored audit.'));

const etapes = [
  [tr(`On étudie ${esc(contact.company || 'votre entreprise')}`, `We study ${esc(contact.company || 'your business')}`), tr('Votre site, vos recherches, vos concurrents : l’audit part de là.', 'Your website, your searches, your competitors: the audit starts there.')],
  [tr('On vous rappelle sous 24 à 48 h', 'We call you within 24 to 48 hours'), tr('Pour affiner le devis avec vous, sans engagement.', 'To refine the quote with you, no commitment.')],
  [tr('On ajuste ensemble', 'We adjust it together'), tr('Le devis bouge avec vos réponses : rien n’est figé.', 'The quote moves with your answers: nothing is set in stone.')],
];
const blocEtapes = h2(tr('La suite', 'What happens next'))
  + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${etapes.map(([t, s], i) => `<tr>
    <td width="36" valign="top" style="padding:0 0 14px;"><div style="width:26px;height:26px;border-radius:13px;background:${C.ink};color:#ffffff;font-family:${FONT};font-size:13px;font-weight:bold;line-height:26px;text-align:center;">${i + 1}</div></td>
    <td valign="top" style="padding:2px 0 14px;font-family:${FONT};"><span style="display:block;font-size:15px;font-weight:bold;color:${C.ink};">${t}</span><span style="display:block;font-size:14px;line-height:1.5;color:${C.text};">${s}</span></td>
  </tr>`).join('')}</table>`;

// La vraie signature Gmail de Paul (lue le 22/09/2026 dans ses paramètres Gmail), à l'identique.
const SIGNATURE = '<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:rgb(33,31,84);line-height:1.4"><tbody><tr><td style="padding-right:15px;border-right:2px solid rgb(11,108,217);vertical-align:middle"><img src="https://raw.githubusercontent.com/MyDigipal/mydigipal-website/main/public/images/Logos/MyDigipal%20Logo_Full%20Main.png" alt="MyDigipal" width="130" style="display:block"></td><td style="padding-left:15px;vertical-align:middle"><strong style="font-size:15px">Paul ANDRE</strong><br><span style="color:rgb(102,102,102)">CEO</span><br><span style="font-size:13px"><a href="tel:+447966507951" style="color:rgb(33,31,84)" target="_blank">+44 7966 5079 51</a><br><a href="mailto:paul@mydigipal.com" style="color:rgb(11,108,217)" target="_blank">paul@mydigipal.com</a><br><a href="https://mydigipal.com/en" style="color:rgb(11,108,217)" target="_blank">mydigipal.com</a>  •  <a href="https://calendar.app.google/ofYHfRHbFoMpVxf79" style="color:rgb(11,108,217)" target="_blank">Book a Meeting</a></span></td></tr></tbody></table>';

const corpsProspect = `
<h1 style="margin:0 0 12px;font-family:${FONT};font-size:24px;line-height:1.25;color:${C.ink};font-weight:bold;">${prenom ? tr(`Votre devis, ${esc(prenom)}`, `Your quote, ${esc(prenom)}`) : tr('Votre devis', 'Your quote')}</h1>
${p(tr(`Merci d’avoir composé votre plan sur notre calculateur${contact.company ? ` pour ${esc(contact.company)}` : ''}. Le voici au propre, avec ce qui se passe maintenant.`,
  `Thank you for building your plan on our calculator${contact.company ? ` for ${esc(contact.company)}` : ''}. Here it is, with what happens next.`))}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(4)}</table>
${resume}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:18px 0 4px;">${bouton(planUrl, tr('Revoir ou modifier mon devis', 'Review or edit my quote'))}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(22)}</table>
${h2(tr('Le détail, service par service', 'Service by service'))}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:-8px;">${detail(D.domains, lang)}</table>
<p style="margin:12px 0 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${C.muted};">${tr('Ces montants sont une estimation sur nos grilles de prix. Le devis final dépend de votre projet.', 'These amounts are an estimate based on our price grid. The final quote depends on your project.')}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(28)}</table>
${blocAudit}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(18)}</table>
${blocEtapes}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:4px 0 26px;">${bouton(BOOKING, tr('Réserver un appel de 30 min', 'Book a 30-min call'), false)}</td></tr></table>
${p(tr('Une question ? Répondez simplement à ce mail, il arrive directement dans ma boîte.', 'Any question? Just reply to this email, it lands straight in my inbox.'))}
${p(tr('À très vite,', 'Speak soon,'), 'margin-bottom:18px;')}
${SIGNATURE}`;

const piedProspect = tr(
  'Vous recevez ce mail parce que vous avez demandé un devis sur <a href="https://mydigipal.com/fr" style="color:#5f7084;">mydigipal.com</a>.',
  'You are receiving this email because you requested a quote on <a href="https://mydigipal.com/en" style="color:#5f7084;">mydigipal.com</a>.'
);

const prospectSubject = toutADiscuter
  ? tr('Votre devis MyDigipal', 'Your MyDigipal quote')
  : tr(`Votre devis MyDigipal : ${D.monthly}${D.perMonth}`, `Your MyDigipal quote: ${D.monthly}${D.perMonth}`).replace(/ /g, ' ');
const prospectHtml = enveloppe(prospectSubject, tr('Votre devis, le détail par service et la suite.', 'Your quote, service by service, and what happens next.'), corpsProspect, piedProspect);

// --- Le mail à Paul (toujours en français, montants en euros) ----------------------------------
const prov = meta.provenance || {};
const provLignes = [
  prov.utm_source || prov.utm_medium ? `Source : ${esc([prov.utm_source, prov.utm_medium].filter(Boolean).join(' / '))}` : '',
  prov.utm_campaign ? `Campagne : ${esc(prov.utm_campaign)}` : '',
  prov.utm_term ? `Mot-clé : ${esc(prov.utm_term)}` : '',
  prov.gclid ? 'Clic Google Ads (gclid présent)' : '',
  prov.fbclid ? 'Clic Meta (fbclid présent)' : '',
  prov.referrer ? `Site d’origine : ${esc(prov.referrer)}` : '',
  prov.landing ? `Page d’entrée : ${esc(prov.landing)}` : '',
].filter(Boolean);

const quand = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const source = meta.source === 'marketing-calculator-v6' ? 'calculateur v6' : 'ancien calculateur (v5)';
const infos = [quand, lang.toUpperCase(), data.currency && data.currency !== 'EUR' ? `affiché en ${data.currency}` : '', meta.usedGuidedMode ? 'parcours « Aidez-moi à choisir »' : '', source].filter(Boolean).join(' · ');

const aDiscuter = breakdown.filter((d) => d.isNotSure).map((d) => d.name);
const iaSurMesure = data.aiSolutions && typeof data.aiSolutions === 'object' ? Object.entries(data.aiSolutions).filter(([, v]) => String(v || '').trim()) : [];
const message = String(contact.message || '').trim();

const carteContact = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.grey};border-radius:12px;"><tr><td style="padding:6px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${ligne('Nom', esc(contact.name || '-'), { first: true })}
${ligne('E-mail', `<a href="mailto:${esc(contact.email)}" style="color:${C.brand};text-decoration:none;">${esc(contact.email || '-')}</a>`)}
${ligne('Entreprise', esc(contact.company || '-'))}
${site ? ligne('Site', siteLien) : ''}
${contact.phone ? ligne('Téléphone', esc(contact.phone)) : ''}
</table></td></tr></table>`;

const blocReponsesPaul = auditChamps.length
  ? h2('Ses réponses pour l’audit') + auditChamps.map(([, q, v]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;background:${C.soft};border-radius:10px;"><tr><td style="padding:12px 14px;">
      <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;color:${C.muted};">${esc(q)}</p>
      <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.55;color:${C.ink};">${nl2br(v)}</p>
    </td></tr></table>`).join('')
  : message && !data.auditRequest
    ? h2('Son message') + p(nl2br(message))
    : p('<span style="color:#5f7084;">Aucune réponse aux questions de l’audit.</span>');

const montantsPaul = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${ligne('Honoraires par mois', toutADiscuter ? 'à discuter' : `${eur(monthlyEur)}${discountPct ? ` <span style="color:${C.muted};font-weight:normal;">(${eur(beforeDiscountEur)} avant remise)</span>` : ''}`, { first: true, strong: true })}
${Number(P.oneOffTotal) ? ligne('Mise en place', `${eur(P.oneOffTotal)} une fois`) : ''}
${Number(P.adBudgetTotal) ? ligne('Budget média', `${eur(P.adBudgetTotal)}/mois`) : ''}
${ligne('Engagement', `${duration} mois${discountPct ? `, remise de ${discountPct} %` : ''}`)}
${toutADiscuter ? '' : ligne(`Total sur ${duration} mois, mise en place comprise`, eur(P.grandTotalWithoutBudget || 0), { strong: true })}
</table>`;

const corpsPaul = `
<h1 style="margin:0 0 6px;font-family:${FONT};font-size:22px;line-height:1.3;color:${C.ink};font-weight:bold;">Nouveau lead du calculateur</h1>
<p style="margin:0 0 18px;font-family:${FONT};font-size:13px;color:${C.muted};">${esc(infos)}</p>
${carteContact}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:16px 0 4px;">
  ${bouton(`mailto:${contact.email || ''}?subject=${encodeURIComponent(fr ? 'Re: Votre devis MyDigipal' : 'Re: Your MyDigipal quote')}`, prenom ? `Répondre à ${esc(prenom)}` : 'Répondre')}
  &nbsp; ${bouton(planUrl, 'Ouvrir son devis', false)}
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(20)}</table>
${blocReponsesPaul}
${provLignes.length ? h2('D’où il arrive') + p(provLignes.join('<br>')) : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(10)}</table>
${h2('Le devis, en euros')}
${montantsPaul}
${aDiscuter.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;background:#fbf0d8;border-radius:10px;"><tr><td style="padding:12px 14px;font-family:${FONT};font-size:14px;color:#6b4600;"><strong>À discuter avec lui :</strong> ${esc(aDiscuter.join(', '))}</td></tr></table>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(12)}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${detail(eurDomains('fr'), 'fr')}</table>
${iaSurMesure.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${espace(18)}</table>${h2('Solution IA sur mesure : ses réponses')}${p(iaSurMesure.map(([k, v]) => `<strong>${esc(k)}</strong> : ${nl2br(v)}`).join('<br>'))}` : ''}
`;

const paulSubject = `Lead calculateur : ${contact.name || 'sans nom'}, ${contact.company || 'sans entreprise'} (${toutADiscuter ? 'à discuter' : eur(monthlyEur) + '/mois'})`.replace(/ /g, ' ');
const paulHtml = enveloppe(paulSubject, `${contact.company || ''} : ${toutADiscuter ? 'à discuter' : eur(monthlyEur) + '/mois'}`, corpsPaul, '');

// --- Sortie : les deux mails, et les champs du Google Sheet « Inbound Calculator » -----------
const notSure = aDiscuter.join(', ') || Object.keys(data.notSureAbout || {}).filter((k) => data.notSureAbout[k]).join(', ');
return {
  json: {
    ...data,
    reportType: data.report_type || 'quote',
    prospectSubject,
    prospectHtml,
    paulSubject,
    paulHtml,
    timestamp: quand,
    langFlag: lang.toUpperCase(),
    monthlyAfterDiscount: toutADiscuter ? '0' : eur(monthlyEur),
    grandTotal: toutADiscuter ? tr('À discuter', 'To discuss') : eur(P.grandTotalWithoutBudget || 0),
    grandTotalNum: Number(P.grandTotalWithoutBudget) || 0,
    subjectAmount: toutADiscuter ? 'à discuter' : eur(monthlyEur) + '/mois',
    hasNotSure: !!notSure,
    notSureList: notSure,
    sheetTimestamp: new Date().toISOString(),
    sheetDomains: (data.selectedDomains || []).join(', '),
    sheetNotSure: notSure,
    sheetBreakdownJson: JSON.stringify(breakdown),
    sheetMessage: message,
    sheetReportType: data.report_type || 'quote',
  },
};
