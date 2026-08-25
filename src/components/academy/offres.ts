// Les quelques calculs du configurateur, à l'affichage seulement. Le montant
// qui fait foi est recalculé par l'app, côté serveur, avec la TVA du pays.
import type { Locale } from './data';

export function formatPrice(minor: number, locale: Locale): string {
  return (minor / 100)
    .toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    .replace(/[  ]/g, ' ');
}

export function nombreLocal(n: number, locale: Locale): string {
  return Math.round(n)
    .toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB')
    .replace(/[  ]/g, ' ');
}

/** La remise d'équipe pour un nombre de places, d'après les paliers de l'app. */
export function teamDiscount(seats: number, paliers: Array<{ seats: number; discount: number }>): number {
  let d = 0;
  for (const t of paliers) if (seats >= t.seats) d = t.discount;
  return d;
}
