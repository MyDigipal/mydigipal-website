/**
 * Le panier du devis (20/10/2026). Demande de Paul : « le calculateur, c'est le truc global,
 * mais chaque page peut avoir un extrait de ce calculateur, et que tout soit centralisé ».
 *
 * Un seul devis par visiteur, quelle que soit la page où il le compose : l'extrait d'une page
 * de service, le simulateur de la formation ou de la créa, le calculateur. Il vit dans le
 * navigateur (`localStorage`), au format du calculateur (`QuoteState`), et chaque îlot qui le
 * modifie prévient les autres par l'événement `mdp-panier`. Rien ne part au serveur avant
 * l'envoi du devis.
 *
 * Attention : `localStorage` peut manquer (navigation privée, stockage bloqué) : tout est entouré de
 * try/catch et le devis fonctionne alors page par page, sans mémoire.
 */
import type { Currency, ServiceDomain } from '@/components/calculator/types';
import { DOMAIN_ORDER, DURATION_CONFIG_MOIS, inOrder, ANSWER_KEYS, type QuoteState } from '@/components/calculator-v6/engine';

const CLE = 'mdp_devis_v1';
const EVENEMENT = 'mdp-panier';
/** Un devis oublié depuis plus de 30 jours repart de zéro. */
const DUREE_VIE = 30 * 24 * 3600 * 1000;

export interface Panier {
  st: QuoteState;
  devise: Currency;
}
interface Stocke { v: 1; st: QuoteState; devise: Currency; maj: number }

/** Garde ce qui est connu du calculateur : un stockage trafiqué ou ancien ne casse rien. */
function nettoyer(st: Partial<QuoteState> | undefined): QuoteState {
  const domains = inOrder((Array.isArray(st?.domains) ? st!.domains : []).filter((d): d is ServiceDomain => (DOMAIN_ORDER as string[]).includes(d)));
  const answers: QuoteState['answers'] = {};
  for (const [k, v] of Object.entries(st?.answers ?? {})) if (ANSWER_KEYS.has(k)) answers[k] = v;
  const discuss = Object.fromEntries(Object.entries(st?.discuss ?? {}).filter(([d, v]) => v && domains.includes(d as ServiceDomain)));
  const duration = DURATION_CONFIG_MOIS.includes(st?.duration as number) ? (st!.duration as number) : 4;
  return { domains, answers, discuss, duration };
}

export function lirePanier(): Panier | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const o = JSON.parse(brut) as Stocke;
    if (o?.v !== 1 || Date.now() - (o.maj || 0) > DUREE_VIE) return null;
    const st = nettoyer(o.st);
    const devise = o.devise === 'GBP' || o.devise === 'USD' ? o.devise : 'EUR';
    return { st, devise };
  } catch {
    return null;
  }
}

/**
 * Enregistre le devis et prévient les autres îlots de la page. `de` identifie l'îlot qui écrit,
 * pour qu'il ignore son propre écho.
 */
export function ecrirePanier(st: QuoteState, devise: Currency, de: string): void {
  const propre = nettoyer(st);
  try {
    window.localStorage.setItem(CLE, JSON.stringify({ v: 1, st: propre, devise, maj: Date.now() } satisfies Stocke));
  } catch { /* pas de stockage : le devis reste valable sur cette page */ }
  window.dispatchEvent(new CustomEvent(EVENEMENT, { detail: { panier: { st: propre, devise } satisfies Panier, de } }));
}

export function viderPanier(de: string): void {
  try { window.localStorage.removeItem(CLE); } catch { /* rien à vider */ }
  window.dispatchEvent(new CustomEvent(EVENEMENT, { detail: { panier: null, de } }));
}

/** Écoute les changements faits par les AUTRES îlots. Renvoie la fonction qui arrête l'écoute. */
export function ecouterPanier(moi: string, rappel: (p: Panier | null) => void): () => void {
  const ecoute = (e: Event) => {
    const d = (e as CustomEvent<{ panier: Panier | null; de: string }>).detail;
    if (!d || d.de === moi) return;
    rappel(d.panier);
  };
  window.addEventListener(EVENEMENT, ecoute);
  return () => window.removeEventListener(EVENEMENT, ecoute);
}

/** Ajoute des services au devis, sans toucher aux réponses déjà données. */
export function avecServices(st: QuoteState, domaines: ServiceDomain[], reglages: QuoteState['answers'] = {}): QuoteState {
  const answers = { ...st.answers };
  for (const [k, v] of Object.entries(reglages)) if (answers[k] === undefined) answers[k] = v;
  const discuss = { ...st.discuss };
  for (const d of domaines) delete discuss[d];
  return { ...st, domains: inOrder([...new Set([...st.domains, ...domaines])]), answers, discuss };
}
