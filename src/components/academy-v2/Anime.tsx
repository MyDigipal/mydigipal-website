import { useEffect, useRef, useState } from 'react';
import type { Locale } from './copy-v2';

/**
 * Une animation du labo motion, rendue en vidéo (06/10/2026).
 *
 * Les essais du labo (`projects/_shared/motion-lib/labo/essais/`) sont des pages
 * qui se dessinent image par image ; ils sont rendus en MP4 par
 * `creatives/Videos/motion-academy/render-essai.js` (dépôt de l'Academy), en
 * français et en anglais (`rendus/page-vente/build_en.py`), puis réduits pour le
 * web dans `public/academy/motion/<nom>-<langue>.mp4`, avec leur affiche `.jpg`.
 * Une vidéo plutôt que l'essai vivant : la visite et la carte de verre font
 * tourner du WebGL et du SVG recalculé à chaque image, trop lourd pour un
 * téléphone moyen.
 *
 * Muette, en boucle, sans contrôles : elle montre, elle ne parle pas (le son est
 * réservé aux films de Paul, qui attendent un clic). Chargée seulement quand elle
 * approche de l'écran, mise en pause quand elle en sort. Sous
 * `prefers-reduced-motion`, l'affiche seule.
 */
export type NomAnime = 'visite' | 'recit' | 'agents';

export default function Anime({
  nom,
  locale,
  alt,
  className = '',
}: {
  nom: NomAnime;
  locale: Locale;
  /** Ce que montre l'animation, pour un lecteur d'écran. */
  alt: string;
  className?: string;
}) {
  const hote = useRef<HTMLDivElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [monte, setMonte] = useState(false);
  const [reduit, setReduit] = useState(false);
  const base = `/academy/motion/${nom}-${locale}`;

  useEffect(() => {
    setReduit(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = hote.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setMonte(true);
      return;
    }
    const o = new IntersectionObserver(
      (entrees) => {
        const dedans = entrees.some((e) => e.isIntersecting);
        if (dedans) setMonte(true);
        const v = video.current;
        if (!v) return;
        if (dedans) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: '200px' },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <div
      ref={hote}
      role="img"
      aria-label={alt}
      className={`relative aspect-video overflow-hidden rounded-[14px] border border-filet-nuit bg-salle shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)] ${className}`}
    >
      {monte && !reduit ? (
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-cover"
          src={`${base}.mp4`}
          poster={`${base}.jpg`}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
        />
      ) : (
        <img src={`${base}.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
}
