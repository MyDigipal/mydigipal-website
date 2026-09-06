import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Les écrans filmés du produit, et la visionneuse qui les ouvre en grand.
 *
 * Les huit boucles de `public/academy/demos/` sont muettes, en boucle, avec une
 * affiche : une vidéo qui parle sans qu'on l'ait demandé fait fermer l'onglet.
 * Le son est réservé à la vidéo de présentation, qui n'est pas ici.
 *
 * ⚠️ `preload="none"` et la vidéo montée seulement quand la vignette entre dans
 * l'écran : la page en montre jusqu'à huit, et huit vidéos préchargées, ce sont
 * huit connexions pour un écran que la plupart des visiteurs ne regarderont pas.
 *
 * ⚠️ Il n'existe pas de version française des boucles (le dossier `demos/fr/`
 * est vide au 06/09/2026). La vignette porte donc l'interface anglaise sur la
 * page française. À reprendre depuis un compte réglé en français : une capture
 * prise dans la mauvaise langue est une capture à refaire, pas à traduire.
 */

export const DEMOS = [
  'assistant', 'atelier', 'avance', 'cas', 'profil', 'programme', 'prompts', 'quiz',
] as const;
export type Demo = (typeof DEMOS)[number];

export function estDemo(x: string | undefined): x is Demo {
  return !!x && (DEMOS as readonly string[]).includes(x);
}

/** Une boucle muette, chargée seulement quand elle approche de l'écran. */
export function Boucle({
  nom,
  className = '',
  vignette = false,
}: {
  nom: Demo;
  className?: string;
  vignette?: boolean;
}) {
  const hote = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const affiche = `/academy/demos/${nom}${vignette ? '-v' : ''}.jpg`;

  useEffect(() => {
    const el = hote.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const o = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setVisible(true);
          o.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    o.observe(el);
    return () => o.disconnect();
  }, [visible]);

  return (
    <div ref={hote} className={`relative overflow-hidden bg-salle-2 ${className}`}>
      {visible ? (
        <video
          className="block h-full w-full object-cover"
          poster={affiche}
          preload="none"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={`/academy/demos/${nom}.webm`} type="video/webm" />
          <source src={`/academy/demos/${nom}.mp4`} type="video/mp4" />
        </video>
      ) : (
        <img src={affiche} alt="" className="block h-full w-full object-cover" loading="lazy" />
      )}
    </div>
  );
}

/**
 * La visionneuse. Fermée par Échap, par le fond, ou par le bouton : trois
 * sorties, parce qu'une seule laisse toujours quelqu'un coincé.
 */
export function Visionneuse({
  nom,
  titre,
  fermer,
  libelleFermer,
}: {
  nom: Demo | null;
  titre: string;
  fermer: () => void;
  libelleFermer: string;
}) {
  const sortie = useRef<HTMLButtonElement | null>(null);

  const surTouche = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
    },
    [fermer],
  );

  useEffect(() => {
    if (!nom) return;
    document.addEventListener('keydown', surTouche);
    // Le défilement de la page derrière une visionneuse ouverte donne
    // l'impression que le clic a raté.
    const avant = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sortie.current?.focus();
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = avant;
    };
  }, [nom, surTouche]);

  if (!nom) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(6,10,20,.88)] p-4 backdrop-blur-sm"
      onClick={fermer}
      role="dialog"
      aria-modal="true"
      aria-label={titre}
    >
      <div
        className="w-full max-w-[1080px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="font-ac-mono text-[11px] uppercase tracking-[.14em] text-brume-nuit">
            {titre}
          </span>
          <button
            ref={sortie}
            type="button"
            onClick={fermer}
            className="min-h-11 rounded-bouton border border-filet-nuit px-4 text-[13px] text-corps-nuit transition hover:border-or hover:text-or"
          >
            {libelleFermer}
          </button>
        </div>
        <video
          className="block w-full rounded-carte border border-filet-nuit"
          poster={`/academy/demos/${nom}.jpg`}
          autoPlay
          muted
          loop
          playsInline
          controls
        >
          <source src={`/academy/demos/${nom}.webm`} type="video/webm" />
          <source src={`/academy/demos/${nom}.mp4`} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
