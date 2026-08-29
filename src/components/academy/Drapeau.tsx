import type { Locale } from './data';

/**
 * Les deux drapeaux du sélecteur de langue, dessinés en SVG.
 *
 * Pas d'emoji : sous Windows, les drapeaux emoji ne sont pas rendus du tout
 * (le système n'embarque pas les paires régionales), et un visiteur y verrait
 * deux lettres grises à la place. Pas d'image non plus : deux requêtes pour
 * dix-huit pixels de large.
 *
 * ⚠️ Un drapeau désigne un pays, pas une langue — le français se lit aussi en
 * Belgique et l'anglais ailleurs qu'au Royaume-Uni. C'est un abus assumé
 * (demande de Paul du 29/08/2026) : le code de langue est écrit à côté, et
 * c'est lui qui porte le sens.
 */
export default function Drapeau({ locale, className = '' }: { locale: Locale; className?: string }) {
  const commun = `block h-[13px] w-[19px] flex-none rounded-[2px] ${className}`;

  if (locale === 'fr') {
    return (
      <svg viewBox="0 0 3 2" className={commun} aria-hidden="true" focusable="false">
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    );
  }

  // Union Jack. Les deux détourages portent un identifiant préfixé : deux SVG
  // qui partageraient un `id` dans la même page se voleraient leur masque.
  return (
    <svg viewBox="0 0 60 30" className={commun} aria-hidden="true" focusable="false">
      <clipPath id="j30-uk-cadre">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="j30-uk-diag">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#j30-uk-cadre)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#j30-uk-diag)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
