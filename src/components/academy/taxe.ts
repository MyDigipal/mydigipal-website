// La base des prix de l'Academy : hors taxes ou toutes taxes comprises.
//
// Jusqu'au 12/11/2026 les prix servis par l'application étaient toutes taxes
// comprises, et la page écrivait « TVA comprise ». Depuis, le prix rond est HORS
// TAXES et la TVA du pays de l'acheteur s'ajoute au paiement : l'API le dit par
// `prix_base: 'ht'`, donne le pays de référence de chaque devise et son taux
// (`tva`), et le prix toutes taxes de chaque offre (`prix_ttc`).
//
// ⚠️ Tout part de `prix_base`, lu dans la réponse. Absent (une application pas
// encore déployée, un instantané ancien), la page reste exactement comme avant.
// C'est ce qui permet de mettre le site en ligne AVANT l'application sans qu'il
// affiche rien de faux, et de ne jamais écrire « HT » sur un prix toutes taxes.
//
// La loi française demande qu'un particulier lise le prix toutes taxes : sous
// chaque prix hors taxes, la page écrit donc le rappel (« soit 238,80 € TTC en
// France »). Le pays est celui de référence de la devise, la page ne connaît pas
// celui de l'acheteur ; le total exact s'affiche au tunnel, où le pays se choisit.

import { SYMBOLE, type Devise, type Jour30Data, type Locale } from './data';

export interface Taxe {
  /** Les prix de l'API sont hors taxes. */
  ht: boolean;
  /** « HT », « excl. VAT », ou rien (dollar, ou prix toutes taxes comprises). */
  suffixe: string;
  /** « soit 238,80 € TTC en France », ou `null` quand il n'y a rien à rappeler. */
  rappel: (htMinor: number) => string | null;
  /** Le toutes taxes d'un hors taxes, au pays de référence. Égal au hors taxes sinon. */
  ttc: (htMinor: number) => number;
}

const PAYS: Record<string, Record<Locale, string>> = {
  FR: { fr: 'en France', en: 'in France' },
  GB: { fr: 'au Royaume-Uni', en: 'in the UK' },
};

/** Un montant exact : deux décimales dès qu'il y a des centimes, aucune sinon. */
export function montantExact(minor: number, devise: Devise, locale: Locale): string {
  const entier = minor % 100 === 0;
  const nombre = (minor / 100)
    .toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
      minimumFractionDigits: entier ? 0 : 2,
      maximumFractionDigits: entier ? 0 : 2,
    })
    .replace(/[  ]/g, ' ');
  return locale === 'fr' ? `${nombre} ${SYMBOLE[devise]}` : `${SYMBOLE[devise]}${nombre}`;
}

/**
 * La TVA d'un hors taxes, en centimes entiers, au centime le plus proche (le
 * demi-centime montant). La même règle que l'application (`prix-ht.ts`) : le
 * taux passe en dix-millièmes pour qu'aucun flottant n'entre dans le montant.
 */
function tvaMinor(htMinor: number, taux: number): number {
  const dixMilliemes = Math.round(taux * 10000);
  return dixMilliemes > 0 ? Math.floor((Math.round(htMinor) * dixMilliemes + 5000) / 10000) : 0;
}

export function taxeDe(
  d: Pick<Jour30Data, 'prix_base' | 'tva'> | null | undefined,
  devise: Devise,
  locale: Locale
): Taxe {
  const ht = d?.prix_base === 'ht';
  const repere = ht ? d?.tva?.[devise] ?? null : null;
  if (!repere) return { ht, suffixe: '', rappel: () => null, ttc: (m) => m };
  const ttc = (m: number) => m + tvaMinor(m, repere.taux);
  const ou = PAYS[repere.pays]?.[locale] ?? '';
  return {
    ht,
    suffixe: locale === 'fr' ? 'HT' : 'excl. VAT',
    ttc,
    rappel: (m) =>
      locale === 'fr'
        ? `soit ${montantExact(ttc(m), devise, locale)} TTC ${ou}`.trim()
        : `${montantExact(ttc(m), devise, locale)} incl. VAT ${ou}`.trim(),
  };
}

/** « 199 € HT » : le texte d'un prix, avec sa mention quand il y en a une. */
export const avecSuffixe = (texte: string, taxe: Taxe): string => (taxe.suffixe ? `${texte} ${taxe.suffixe}` : texte);

/** Une taxe neutre, pour un composant rendu sans les données de l'API. */
export const SANS_TAXE: Taxe = { ht: false, suffixe: '', rappel: () => null, ttc: (m) => m };
