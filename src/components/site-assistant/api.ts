// ============================================================
// L'assistant du site : ses échanges avec l'application Academy
// ============================================================
//
// Les conversations du site vivent au même endroit que celles du panneau
// « Une question ? » de l'Academy (fils `academy_visitor_threads`, surface
// « site ») : c'est ce qui permet à Paul de répondre depuis Google Chat avec
// @MyDigipal, sans rien construire de nouveau pour le retour.
//
//   POST /fil { action: 'ouvrir', surface: 'site', ... }   ouvre le fil, sans prévenir Paul
//   POST /fil { action: 'reponse', ... }                   une réponse à l'assistant ; la première prévient Paul
//   POST /question { question, fil_id, jeton, ... }        un message libre, à Paul
//   GET  /fil?id=&jeton=                                   les messages, dont ceux de Paul

import type { Lang } from '../calculator-v6/engine';

const BASE = 'https://academy.mydigipal.com/api/academy/public/question';

export interface Fil {
  id: string;
  jeton: string;
}

export interface MessageFil {
  auteur: 'visiteur' | 'paul';
  texte: string;
  at: string;
}

export interface Contexte {
  language: Lang;
  page: string;
  devise: string;
  secondes: number;
  provenance: Record<string, string>;
}

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
  const res = await poster('/fil', { action: 'ouvrir', surface: 'site', ...ctx.provenance, ...ctx, provenance: undefined });
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

export async function envoyerMessage(
  fil: Fil,
  ctx: Contexte,
  m: { question: string; email?: string; devis?: string; website: string }
): Promise<boolean> {
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
  });
  return !!res?.ok;
}

export async function lireMessages(fil: Fil): Promise<MessageFil[] | null> {
  try {
    const res = await fetch(`${BASE}/fil?id=${encodeURIComponent(fil.id)}&jeton=${encodeURIComponent(fil.jeton)}`);
    if (!res.ok) return null;
    const j = (await res.json()) as { messages?: MessageFil[] };
    return Array.isArray(j.messages) ? j.messages : [];
  } catch {
    return null;
  }
}
