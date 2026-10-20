/**
 * L'envoi du devis, le même partout (20/10/2026) : le calculateur, l'extrait d'une page de
 * service, le simulateur de la formation et celui de la créa passent tous par ici.
 *
 * - UNE route : `POST academy.mydigipal.com/api/site/devis` (CRM, deux mails, bulle Chat, Lead
 *   Meta côté serveur), au format du calculateur, avec l'origine du devis.
 * - UN événement de conversion : `calculator_form_submit`. Les cinq balises du conteneur GTM qui
 *   l'écoutent (GA4, Meta, Reddit, LinkedIn, ChatGPT Ads) comptent donc tous les devis, d'où
 *   qu'ils viennent ; `calculator_origin` dit lequel. Avant, les devis de la formation et de la
 *   créa ne remontaient nulle part.
 * - `?envoi=test` dans l'adresse : rien ne part, le contenu de l'envoi va dans la console.
 */
import type { Currency } from '@/components/calculator/types';
import { buildPayload, devis, type Contact, type Lang, type Origine, type QuoteState } from '@/components/calculator-v6/engine';
import { track, trackStep } from '@/components/calculator/tracking';
import { metaIds, provenance } from '@/components/academy/track';

const ROUTE = 'https://academy.mydigipal.com/api/site/devis';

export interface Audit { website: string; clients: string; works: string; priority: string }

export interface DemandeEnvoi {
  st: QuoteState;
  devise: Currency;
  lang: Lang;
  contact: Contact;
  origine: Origine;
  /** Le nom du formulaire dans GA4 : `calculator`, `service_quote`, `training_simulator`... */
  formulaire: string;
  audit?: Audit;
  /** Le budget annoncé dans « Aidez-moi à choisir », s'il a servi. */
  budgetGuide?: number | null;
  /** Page de test du calculateur : n'envoie rien. */
  essai?: boolean;
}

export const envoiDEssai = () => typeof window !== 'undefined' && /[?&]envoi=test/.test(window.location.search);

export async function envoyerDevis(d: DemandeEnvoi): Promise<{ ok: boolean; essai?: boolean }> {
  const { st, devise, lang, contact, origine, audit } = d;
  const auditLignes = audit
    ? ([
        [lang === 'fr' ? 'Site' : 'Website', audit.website],
        [lang === 'fr' ? 'Clients' : 'Customers', audit.clients],
        [lang === 'fr' ? 'Ce qui marche, ce qui coince' : 'What works, what gets stuck', audit.works],
        [lang === 'fr' ? 'Priorité à trois mois' : 'Three-month priority', audit.priority]
      ] as const).filter(([, v]) => v.trim()).map(([k, v]) => `${k} : ${v.trim()}`)
    : [];
  const base = buildPayload(
    st,
    { name: contact.name.trim(), email: contact.email.trim(), company: contact.company.trim(), message: audit ? auditLignes.join('\n') : (contact.message ?? '').trim() },
    lang,
    devise,
    { ...origine, page: typeof window !== 'undefined' ? window.location.pathname : origine.page }
  );
  const payload = {
    ...base,
    ...(audit ? { auditRequest: { website: audit.website.trim(), clients: audit.clients.trim(), whatWorks: audit.works.trim(), priority: audit.priority.trim() } } : {}),
    guidedRecommendation: d.budgetGuide ? { selectedDomains: st.domains, estimatedMonthly: d.budgetGuide } : null,
    metadata: { ...base.metadata, usedGuidedMode: !!d.budgetGuide, provenance: provenance() },
    // fbp, fbc et consentement pour l'envoi serveur Meta de l'app (28/09/2026).
    meta_ids: metaIds()
  };
  if (d.essai || envoiDEssai()) {
    // eslint-disable-next-line no-console
    console.info('[devis, mode test] envoi non effectué', payload);
    return { ok: true, essai: true };
  }
  const res = await fetch(ROUTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Les identifiants hachés renvoyés par l'app (28/09/2026) : la balise GA4 les transmet en
  // données fournies par l'utilisateur. Rien en clair.
  const reponse = (await res.json().catch(() => ({}))) as { user_data?: Record<string, string>; event_id?: string };
  const q = devis(st, devise);
  trackStep('submitted');
  track('calculator_form_submit', {
    form_name: d.formulaire,
    form_location: window.location.pathname,
    calculator_origin: origine.id,
    // La valeur dans la devise envoyée avec elle (avant le 20/10/2026, des euros étiquetés dans
    // la devise de l'écran).
    calculator_total: Math.round(q.totalFees),
    currency: devise,
    used_guided_mode: !!d.budgetGuide,
    selected_domains: st.domains.join(','),
    ...(reponse?.user_data ? { user_data: reponse.user_data } : {}),
    // L'identifiant partagé avec l'envoi serveur Meta : la balise le passe en eventID.
    ...(reponse?.event_id ? { event_id: reponse.event_id } : {})
  });
  return { ok: true };
}
