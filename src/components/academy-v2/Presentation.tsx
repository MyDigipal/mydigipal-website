import { useEffect, useRef, useState } from 'react';

/**
 * La vidéo de présentation de l'Academy, en tête du hero (27/09/2026).
 *
 * Paul : « cette vidéo, elle est beaucoup plus puissante, donc elle devrait
 * apparaître tout en haut dans le hero banner ». Elle remplace le film parlant
 * qui occupait le cadre depuis le 25/09 ; celui-ci est descendu dans la page.
 *
 * À l'inverse des films de `Film.tsx`, elle n'a PAS de son : elle peut donc
 * partir seule, muette et en boucle, dès qu'elle entre à l'écran. Elle se met
 * en pause hors de l'écran, garde un bouton pause (une animation de plus de
 * cinq secondes doit pouvoir s'arrêter), et ne démarre jamais seule sous
 * prefers-reduced-motion : l'affiche et le bouton, c'est tout.
 *
 * Source : `mydigipal-academy/creatives/Videos/motion-academy/` (HTML rendu
 * image par image). La version du site est réencodée en 1 280 px (2,4 Mo) :
 * le cadre du hero n'en affiche pas davantage, et elle part au chargement.
 */
export type PresentationData = {
  /** Le nom du fichier dans `public/academy/videos/`, sans extension. */
  id: string;
  titre: string;
};

export default function Presentation({
  video: data,
  pause,
  lire,
}: {
  video: PresentationData;
  pause: string;
  lire: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [joue, setJoue] = useState(false);
  // L'arrêt demandé par le visiteur prime sur l'entrée à l'écran.
  const arretee = useRef(false);
  const src = `/academy/videos/${data.id}`;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const calme = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (calme) arretee.current = true;
    const onPlay = () => setJoue(true);
    const onPause = () => setJoue(false);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    let obs: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !arretee.current) v.play().catch(() => {});
        else if (!e.isIntersecting && !v.paused) v.pause();
      }, { threshold: 0.35 });
      obs.observe(v);
    } else if (!calme) {
      v.play().catch(() => {});
    }
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      obs?.disconnect();
    };
  }, []);

  const basculer = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      arretee.current = false;
      v.play().catch(() => {});
      const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
      w.dataLayer?.push({ event: 'academy_video_play', video_id: data.id });
    } else {
      arretee.current = true;
      v.pause();
    }
  };

  return (
    <figure className="relative m-0">
      <video
        ref={ref}
        className="block aspect-video h-auto w-full bg-salle object-cover"
        poster={`${src}.webp`}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-label={data.titre}
        // Dans le cadre du hero, la vidéo fait 600 px : un clic l'ouvre en grand.
        onClick={() => ref.current?.requestFullscreen?.().catch(() => {})}
        style={{ cursor: 'zoom-in' }}
      >
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={basculer}
        aria-label={joue ? pause : lire}
        className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-filet-nuit bg-salle/80 text-ivoire backdrop-blur transition-colors duration-150 hover:border-or hover:text-or focus-visible:outline-2 focus-visible:outline-or"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="currentColor">
          {joue ? (
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          ) : (
            <path d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5z" />
          )}
        </svg>
      </button>
    </figure>
  );
}
