// ============================================================
// AI Academy - mesure, et le passage de relais vers l'application
// ============================================================
//
// Le conteneur GTM est le même sur mydigipal.com et academy.mydigipal.com :
// les événements poussés ici sont lus par la même configuration que ceux de
// l'app. Le tunnel de paiement, lui, vit dans l'app : les identifiants de
// clic publicitaire (gclid, fbclid) qui arrivent sur cette page doivent
// traverser le domaine, sinon la conversion renvoyée côté serveur au
// provisioning arrive sans attribution. On les garde en session et on les
// remet dans le lien du tunnel.
//
// ⚠️ Le module gratuit compte autant que le tunnel (29/08/2026) : quelqu'un
// qui arrive d'une annonce, ouvre l'accès gratuit puis achète une semaine
// plus tard doit rester attribuable à cette annonce. Les liens vers `/start`
// passent donc par `useLienApp`, pas par une adresse écrite en dur.

import { useEffect, useState } from 'react';

type DataLayerEvent = Record<string, unknown>;

function push(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { dataLayer?: DataLayerEvent[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(event);
}

export function trackSelectItem(item: { tier: string; tierName: string; value: number; currency: string }): void {
  push({ ecommerce: null });
  push({
    event: 'select_item',
    ecommerce: {
      currency: item.currency,
      value: item.value,
      items: [{ item_id: item.tier, item_name: item.tierName, item_category: 'academy', price: item.value, quantity: 1 }],
    },
  });
}

// `coupon` voyage avec les identifiants de clic depuis le 31/08/2026 : les
// membres du Club Protéine arrivent sur `mydigipal.com/fr/academy?coupon=…`
// plutôt que sur le tunnel, pour lire la page avant d'acheter, et le code doit
// se retrouver dans le tunnel sans qu'ils aient à le recopier. Le mécanisme est
// exactement celui d'un gclid : capté à l'arrivée, gardé en session, réinjecté
// dans les liens vers l'application.
const CLES = ['gclid', 'fbclid', 'gbraid', 'wbraid', 'coupon'] as const;
const STOCK = 'academy_ad_ids';

/** À l'arrivée : on range les identifiants de clic présents dans l'URL. */
export function captureAdClickIds(): void {
  if (typeof window === 'undefined') return;
  try {
    const q = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of CLES) {
      const v = q.get(k);
      if (v) found[k] = v;
    }
    if (Object.keys(found).length) sessionStorage.setItem(STOCK, JSON.stringify(found));
  } catch {
    /* stockage indisponible : on continue sans */
  }
}

/**
 * Un paramètre capté à l'arrivée, relu plus tard. Sert au code promo : la page
 * de vente doit pouvoir montrer le prix remisé, et pas seulement le passer au
 * tunnel.
 */
export function paramGarde(cle: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get(cle);
    if (q) return q;
    const raw = sessionStorage.getItem(STOCK);
    if (!raw) return null;
    return (JSON.parse(raw) as Record<string, string>)[cle] || null;
  } catch {
    return null;
  }
}

/** Au départ vers le tunnel : on les remet dans l'URL de l'app. */
export function withAdClickIds(url: string): string {
  if (typeof window === 'undefined') return url;
  try {
    const raw = sessionStorage.getItem(STOCK);
    if (!raw) return url;
    const found = JSON.parse(raw) as Record<string, string>;
    const u = new URL(url, window.location.origin);
    for (const [k, v] of Object.entries(found)) if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Un lien vers l'application, enrichi des identifiants de clic dès que le
 * navigateur a la main.
 *
 * L'adresse nue est rendue au build, puis complétée dans un effet : le premier
 * rendu du navigateur est identique à celui du serveur, donc l'hydratation
 * passe. Un `onClick` qui réécrirait `location.href` marcherait aussi, mais il
 * casserait le clic du milieu et l'ouverture dans un nouvel onglet.
 */
export function useLienApp(url: string): string {
  const [href, setHref] = useState(url);
  useEffect(() => {
    // ⚠️ La capture est refaite ici, et pas seulement dans l'effet de la page.
    // React exécute les effets des ENFANTS avant celui du parent : au moment
    // où ce lien se calcule, `captureAdClickIds` de la page n'a pas encore
    // tourné et la session est vide. Le premier essai rendait donc des liens
    // nus, alors que le gclid était bien dans l'adresse. La fonction est
    // idempotente, l'appeler deux fois ne coûte rien.
    captureAdClickIds();
    setHref(withAdClickIds(url));
  }, [url]);
  return href;
}
