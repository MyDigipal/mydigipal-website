/**
 * Le comportement des formulaires de demande d'audit (08/10/2026) et du bouton qui ouvre
 * la fenêtre. Chargé une fois par page, idempotent : un formulaire déjà branché porte
 * `data-pret`.
 *
 * À l'envoi réussi, deux mesures partent dans le dataLayer :
 * - `audit_request` (GTM : balise GA4 « Audit Request » et balise Meta « Lead (Audit
 *   gratuit) », avec l'`event_id` que la route a aussi envoyé à Meta côté serveur, pour la
 *   déduplication) ;
 * - `user_data`, les identifiants HACHÉS renvoyés par la route, jamais l'adresse en clair.
 * À l'ouverture de la fenêtre, `audit_form_open` dit d'où vient le clic.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const pousser = (e: Record<string, unknown>) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(e);
};

function lireCookie(nom: string): string | undefined {
  const m = document.cookie.match(new RegExp('(?:^|; )' + nom + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** fbp, fbc et consentement publicitaire : la requête part vers academy, sans nos cookies. */
function metaIds() {
  let consent = false;
  const academy = lireCookie('academy_consent');
  if (academy) consent = academy === 'granted';
  else {
    try {
      consent = JSON.parse(lireCookie('mydigipal_consent') || '{}').marketing === true;
    } catch {
      consent = false;
    }
  }
  return { fbp: lireCookie('_fbp'), fbc: lireCookie('_fbc'), consent };
}

function provenance(): Record<string, unknown> {
  try {
    return JSON.parse(sessionStorage.getItem('academy_provenance') || '{}');
  } catch {
    return {};
  }
}

function brancher(form: HTMLFormElement) {
  if (form.dataset.pret) return;
  form.dataset.pret = '1';

  const bloc = form.closest<HTMLElement>('[data-audit-bloc]');
  const merci = bloc?.querySelector<HTMLElement>('[data-audit-merci]');
  const bouton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const libelle = bouton?.querySelector<HTMLElement>('[data-libelle]');
  const erreurEnvoi = form.querySelector<HTMLElement>('[data-erreur-envoi]');
  const d = form.dataset;
  let debut = 0;

  form.addEventListener('focusin', () => {
    if (!debut) debut = Date.now();
  });

  const montrerErreur = (champ: string, texte: string) => {
    const input = form.elements.namedItem(champ) as HTMLInputElement | null;
    const p = form.querySelector<HTMLElement>(`[data-erreur-de="${champ}"]`);
    if (input) input.setAttribute('aria-invalid', texte ? 'true' : 'false');
    if (p) {
      p.textContent = texte;
      p.hidden = !texte;
    }
  };

  form.addEventListener('input', (e) => {
    const cible = e.target as HTMLInputElement;
    if (cible.getAttribute('aria-invalid') === 'true') montrerErreur(cible.name, '');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (bouton?.getAttribute('aria-busy') === 'true') return;

    const f = new FormData(form);
    const groupe = String(f.get('groupe') || '').trim();
    const email = String(f.get('email') || '').trim();
    let premier: HTMLElement | null = null;
    if (groupe.length < 2) {
      montrerErreur('groupe', d.erreurGroupe || '');
      premier = form.elements.namedItem('groupe') as HTMLElement;
    } else montrerErreur('groupe', '');
    if (!EMAIL.test(email)) {
      montrerErreur('email', d.erreurEmail || '');
      premier = premier || (form.elements.namedItem('email') as HTMLElement);
    } else montrerErreur('email', '');
    if (premier) {
      premier.focus();
      return;
    }

    if (erreurEnvoi) erreurEnvoi.hidden = true;
    bouton?.setAttribute('aria-busy', 'true');
    if (libelle) libelle.textContent = d.texteEnvoi || '';

    const budget = String(f.get('budget') || '');
    const corps = {
      groupe,
      email,
      budget,
      message: String(f.get('message') || '').trim(),
      website_url: String(f.get('website_url') || ''),
      duree_saisie_ms: debut ? Date.now() - debut : -1,
      emplacement: d.emplacement,
      source: window.location.href,
      language: d.lang,
      provenance: provenance(),
      meta_ids: metaIds(),
    };

    try {
      const rep = await fetch(d.endpoint || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corps),
      });
      if (!rep.ok) throw Object.assign(new Error('envoi'), { status: rep.status });
      const json = (await rep.json().catch(() => ({}))) as { user_data?: unknown; event_id?: string };

      pousser({
        event: 'audit_request',
        form_name: 'audit',
        form_location: window.location.pathname,
        audit_budget: budget || 'non-precise',
        audit_placement: d.emplacement,
        ...(json.user_data ? { user_data: json.user_data } : {}),
        ...(json.event_id ? { event_id: json.event_id } : {}),
      });

      if (merci) {
        const p = merci.querySelector<HTMLElement>('[data-merci-texte]');
        if (p) p.textContent = (p.dataset.merciTexte || '').replace('{email}', email);
        form.hidden = true;
        merci.hidden = false;
        merci.focus();
      }
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (erreurEnvoi) {
        erreurEnvoi.textContent = (status === 429 ? d.erreurTrop : d.erreurEnvoi) || '';
        erreurEnvoi.hidden = false;
      }
    } finally {
      bouton?.removeAttribute('aria-busy');
      if (libelle) libelle.textContent = d.texteEnvoyer || '';
    }
  });
}

function ouvrir(modale: HTMLDialogElement) {
  if (modale.open) return;
  modale.showModal();
  document.documentElement.classList.add('audit-ouvert');
  (modale.querySelector('input[name="groupe"]') as HTMLInputElement | null)?.focus();
}

/**
 * Le bouton ouvre la fenêtre si la page en a une ; sinon le lien mène à la page de l'audit.
 * Une page arrivée avec l'ancre `#audit` (lien d'annonce, de courriel) ouvre la fenêtre
 * d'elle-même.
 */
function brancherBoutons() {
  const modale = document.querySelector<HTMLDialogElement>('dialog[data-audit-modale]');
  document.querySelectorAll<HTMLAnchorElement>('[data-audit-ouvrir]').forEach((a) => {
    if (a.dataset.pret) return;
    a.dataset.pret = '1';
    a.addEventListener('click', (e) => {
      pousser({ event: 'audit_form_open', audit_placement: a.dataset.auditOuvrir || 'bouton', form_location: window.location.pathname });
      if (!modale || typeof modale.showModal !== 'function') return;
      e.preventDefault();
      // Une demande déjà envoyée dans cette page : on rouvre sur le formulaire vierge.
      const bloc = modale.querySelector<HTMLElement>('[data-audit-bloc]');
      const form = bloc?.querySelector<HTMLFormElement>('form');
      const merci = bloc?.querySelector<HTMLElement>('[data-audit-merci]');
      if (form && merci && !merci.hidden) {
        form.reset();
        form.hidden = false;
        merci.hidden = true;
      }
      ouvrir(modale);
    });
  });

  if (modale && !modale.dataset.pret) {
    modale.dataset.pret = '1';
    modale.addEventListener('close', () => document.documentElement.classList.remove('audit-ouvert'));
    // Un clic sur le voile (hors de la carte) ferme la fenêtre.
    modale.addEventListener('click', (e) => {
      if (e.target === modale) modale.close();
    });
    modale.querySelectorAll<HTMLElement>('[data-audit-fermer]').forEach((b) => b.addEventListener('click', () => modale.close()));
    if (window.location.hash === '#audit' && typeof modale.showModal === 'function') {
      pousser({ event: 'audit_form_open', audit_placement: 'ancre', form_location: window.location.pathname });
      ouvrir(modale);
    }
  }
}

export function initFormulairesAudit() {
  document.querySelectorAll<HTMLFormElement>('form[data-audit-form]').forEach(brancher);
  brancherBoutons();
}
