import { useEffect, useRef, useState } from 'react';
import { noteLocale, type Avis, type Locale } from '../academy/data';

/**
 * La preuve, juste sous le hero (25/09/2026, repris de la nouvelle page
 * d'accueil, `accueil/Bandeau.astro` et `accueil/Avis.astro`).
 *
 * Avant, la page parlait d'elle-même pendant dix mille pixels avant de
 * montrer un seul logo client ou la note : l'accueil a montré qu'une bande de
 * logos sous le hero et un grand chiffre qui compte suffisent à répondre à
 * « qui sont-ils ? » dès le premier défilement.
 *
 * - La note et le nombre de retours viennent de l'app (`avis`), la phrase est
 *   celle de la section Maison (`avisLigne`), le libellé des logos aussi
 *   (`logosTitre`). Rien n'est réécrit ici.
 * - Les logos sont ceux de l'accueil (`src/data/accueil/logos.json`,
 *   détourés, à SURFACE égale par `hauteurLogo()`), passés par la page Astro.
 *   Ramenés au blanc pour la salle de nuit : `brightness(0) invert(1)` pour les
 *   fichiers transparents, `invert` + `screen` pour ceux livrés sur fond blanc,
 *   sinon ils feraient des rectangles blancs.
 * - Immobiles : la page a déjà son défilé de logos (Maison), et une page qui
 *   en a deux n'en a aucun.
 * - Le chiffre part de zéro quand la bande entre à l'écran, une fois, et
 *   s'affiche directement sous prefers-reduced-motion.
 */
export type LogoPreuve = { src: string; nom: string; largeur: number; hauteur: number; h: number; fondBlanc: boolean };

export default function Preuves({
  locale,
  avis,
  logos,
  titreLogos,
  ligne,
}: {
  locale: Locale;
  avis: Avis;
  logos: LogoPreuve[];
  titreLogos: string;
  ligne: string;
}) {
  const hote = useRef<HTMLDivElement | null>(null);
  const [valeur, setValeur] = useState(avis.note);

  useEffect(() => {
    const el = hote.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let trame = 0;
    let fait = false;
    const o = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || fait) return;
        fait = true;
        o.disconnect();
        const debut = performance.now();
        const cible = avis.note;
        const pas = (t: number) => {
          const k = Math.min(1, (t - debut) / 1400);
          const ease = 1 - Math.pow(1 - k, 3);
          setValeur(Math.round(cible * ease * 10) / 10);
          if (k < 1) trame = requestAnimationFrame(pas);
        };
        setValeur(0);
        trame = requestAnimationFrame(pas);
      },
      { threshold: 0.4 },
    );
    o.observe(el);
    return () => {
      o.disconnect();
      cancelAnimationFrame(trame);
    };
  }, [avis.note]);

  return (
    <section aria-label={titreLogos} className="border-t border-filet-nuit px-4 py-10 sm:px-6 lg:py-12">
      <div
        ref={hote}
        className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12"
      >
        <div className="v2-reveal flex items-end gap-4">
          <p className="m-0 whitespace-nowrap font-ac-grotesk text-[clamp(52px,6vw,76px)] font-semibold leading-[0.9] tracking-[-0.05em] text-ivoire [font-variant-numeric:tabular-nums]">
            <span aria-hidden="true">{noteLocale(valeur, locale)}</span>
            <span className="sr-only">{noteLocale(avis.note, locale)}</span>
            <span className="ml-1 text-[0.36em] font-medium tracking-[-0.02em] text-brume-nuit">/10</span>
          </p>
          <p className="m-0 max-w-[22ch] pb-1 text-[14.5px] leading-[1.45] text-corps-nuit">{ligne}</p>
        </div>

        <div className="v2-reveal" style={{ ['--i' as string]: 1 }}>
          <p className="m-0 mb-4 text-[13.5px] text-brume-nuit">{titreLogos}</p>
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-7 gap-y-5 p-0 sm:gap-x-10">
            {/* Au téléphone, huit logos : au-delà, la bande prenait un écran. */}
            {logos.map((l, i) => (
              <li key={l.src} className={`flex-none ${i >= 8 ? 'max-sm:hidden' : ''}`}>
                <img
                  src={l.src}
                  alt={l.nom}
                  width={l.largeur}
                  height={l.hauteur}
                  loading="lazy"
                  decoding="async"
                  className={`v2-logo block w-auto ${l.fondBlanc ? 'v2-logo-fond' : ''}`}
                  style={{ height: Math.round(l.h * 0.82) }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
