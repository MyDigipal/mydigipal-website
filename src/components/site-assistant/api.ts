// ============================================================
// L'assistant du site : ses échanges avec l'application Academy
// ============================================================
//
// Les conversations du site vivent au même endroit que celles du panneau
// « Une question ? » de l'Academy (fils `academy_visitor_threads`, surface
// « site ») : c'est ce qui permet à Paul de répondre depuis Google Chat avec
// @MyDigipal, sans rien construire de nouveau pour le retour.
//
//   POST /fil { action: 'ouvrir', surface: 'site', ia: true, ... }   ouvre le fil, sans prévenir Paul
//   POST /fil { action: 'reponse', ... }                   une réponse à l'assistant ; la première prévient Paul
//   POST /question { question, fil_id, jeton, ia: true, ... }   un message écrit ; l'assistant IA y répond
//   GET  /fil?id=&jeton=                                   les messages, dont ceux de Paul, et l'état de l'IA
//
// ⚠️ `ia: true` (29/09/2026) : ce panneau sait afficher les réponses de l'assistant
// IA. L'application ne fait répondre le modèle qu'aux panneaux qui l'annoncent,
// pour qu'une page encore servie par le cache de Cloudflare garde l'ancien
// chemin, où seul Paul répond.

import type { Lang } from '../calculator-v6/engine';

const BASE = 'https://academy.mydigipal.com/api/academy/public/question';

export interface Fil {
  id: string;
  jeton: string;
}

export interface MessageFil {
  auteur: 'visiteur' | 'paul' | 'ia' | 'auto';
  texte: string;
  at: string;
}

/** Ce que l'application dit de l'assistant IA dans la conversation. */
export interface EtatIa {
  ia_active: boolean;
  relais: boolean;
  messages_restants: number;
  attend_adresse: boolean;
  a_adresse: boolean;
  fin: 'limite' | 'adresse' | 'hors_sujet' | null;
}

export interface Contexte {
  language: Lang;
  page: string;
  devise: string;
  secondes: number;
  provenance: Record<string, string>;
}

/** Même plafond que l'application (`VENTE_IA.caracteres`). */
export const MAX_CARACTERES = 400;

async function poster(chemin: string, corps: Record<string, unknown>): Promise<Response | null> {
  try {
    return await fetch(`${BASE}${chemin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    });
  } catch {
    return null;
  }
}

export async function ouvrirFil(ctx: Contexte): Promise<Fil | null> {
  const res = await poster('/fil', { action: 'ouvrir', surface: 'site', ia: true, ...ctx.provenance, ...ctx, provenance: undefined });
  if (!res?.ok) return null;
  const j = (await res.json().catch(() => null)) as Partial<Fil> | null;
  return j?.id && j.jeton ? { id: j.id, jeton: j.jeton } : null;
}

export async function envoyerReponse(
  fil: Fil,
  etape: { question: string; reponse: string; estimation?: string; secondes?: number }
): Promise<boolean> {
  const res = await poster('/fil', { action: 'reponse', id: fil.id, jeton: fil.jeton, ...etape });
  return !!res?.ok;
}

export interface RetourMessage {
  ok: boolean;
  status: number;
  /** Toute la conversation telle que l'application l'a enregistrée. */
  messages?: MessageFil[];
  etat?: EtatIa;
  /** Pour la mesure : l'IA a répondu, a passé la main (repli), ou c'est Paul. */
  ia_mode?: 'ia' | 'repli' | 'paul';
}

export async function envoyerMessage(
  fil: Fil,
  ctx: Contexte,
  m: { question: string; email?: string; devis?: string; website: string }
): Promise<RetourMessage> {
  const res = await poster('', {
    ...ctx.provenance,
    question: m.question,
    email: m.email,
    language: ctx.language,
    surface: 'site',
    page: ctx.page,
    devise: ctx.devise,
    panier: m.devis,
    secondes: ctx.secondes,
    fil_id: fil.id,
    jeton: fil.jeton,
    website: m.website,
    ia: true,
  });
  if (!res) return { ok: false, status: 0 };
  const j = (await res.json().catch(() => ({}))) as Omit<RetourMessage, 'ok' | 'status'>;
  return { ok: res.ok, status: res.status, messages: j.messages, etat: j.etat, ia_mode: j.ia_mode };
}

export async function lireFil(
  fil: Fil,
  vu = false
): Promise<{ messages: MessageFil[]; etat?: EtatIa; ecrit?: boolean; non_lus?: number } | null> {
  try {
    const res = await fetch(`${BASE}/fil?id=${encodeURIComponent(fil.id)}&jeton=${encodeURIComponent(fil.jeton)}${vu ? '&vu=1' : ''}`);
    if (!res.ok) return null;
    const j = (await res.json()) as { messages?: MessageFil[]; etat?: EtatIa; ecrit?: boolean; non_lus?: number };
    return { messages: Array.isArray(j.messages) ? j.messages : [], etat: j.etat, ecrit: j.ecrit, non_lus: j.non_lus };
  } catch {
    return null;
  }
}
