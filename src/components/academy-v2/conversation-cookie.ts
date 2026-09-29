// ============================================================
// La conversation « Une question ? » suit le visiteur (29/09/2026)
// ============================================================
//
// Paul : « si la personne clique sur Check out et qu'elle avait déjà une
// conversation, faut que la conversation la suive sur la page de paiement… voire
// même si elle ferme le site et qu'elle revient ».
//
// Un cookie PROPRE au domaine `.mydigipal.com`, lu par la page de vente
// (mydigipal.com) comme par le tunnel (academy.mydigipal.com) : c'est lui qui fait
// passer la conversation d'un sous-domaine à l'autre, sans rien mettre dans
// l'adresse du lien. 30 jours, SameSite=Lax, Secure.
//
// Il porte l'identifiant de la conversation et son jeton, rien d'autre : ni
// adresse e-mail, ni texte. Le jeton seul ouvre la conversation, et le serveur
// n'en garde que l'empreinte.
//
// ⚠️ CONSENTEMENT : c'est un cookie fonctionnel, posé seulement quand le visiteur
// ÉCRIT un message, c'est-à-dire pour un service qu'il demande expressément. Il
// relève de la catégorie « Essentiels » du bandeau du site, comme le cookie de
// consentement lui-même, et ne sert à aucune mesure.
//
// ⚠️ Même fichier, même nom de cookie des deux côtés :
// `mydigipal-academy/src/lib/academy/conversation-cookie.ts` et
// `mydigipal-website/src/components/academy-v2/conversation-cookie.ts`. Changer
// l'un sans l'autre coupe la conversation entre la page de vente et le tunnel.

export const COOKIE_CONVERSATION = 'mdp_conversation';
const TRENTE_JOURS = 30 * 24 * 3600;

export interface ConversationGardee {
  id: string;
  jeton: string;
}

const domaine = () => (location.hostname.endsWith('mydigipal.com') ? '; domain=.mydigipal.com' : '');
const securise = () => (location.protocol === 'https:' ? '; Secure' : '');

export function lireConversation(): ConversationGardee | null {
  try {
    const brut = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${COOKIE_CONVERSATION}=`))
      ?.slice(COOKIE_CONVERSATION.length + 1);
    if (!brut) return null;
    const [id, jeton] = decodeURIComponent(brut).split('.');
    return /^[A-Za-z0-9]{10,40}$/.test(id || '') && /^[a-f0-9]{16,128}$/.test(jeton || '') ? { id, jeton } : null;
  } catch {
    return null;
  }
}

export function garderConversation(c: ConversationGardee): void {
  try {
    document.cookie = `${COOKIE_CONVERSATION}=${encodeURIComponent(`${c.id}.${c.jeton}`)}; Max-Age=${TRENTE_JOURS}; path=/${domaine()}; SameSite=Lax${securise()}`;
  } catch {
    /* cookies refusés : la conversation vaudra pour cet onglet seulement */
  }
}

export function oublierConversation(): void {
  try {
    document.cookie = `${COOKIE_CONVERSATION}=; Max-Age=0; path=/${domaine()}; SameSite=Lax${securise()}`;
  } catch {
    /* rien à retirer */
  }
}
