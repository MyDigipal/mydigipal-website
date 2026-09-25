import { useEffect, useRef, useState } from 'react';

/**
 * Un film PARLANT de la page de vente : Paul qui montre le produit ou la
 * méthode, avec le son (25/09/2026).
 *
 * À ne pas confondre avec les boucles muettes de `Video.tsx`, qui tournent
 * seules : un film qui parle ne part JAMAIS tout seul. Il attend un clic, et
 * le clic vaut accord pour le son.
 *
 * - `preload="metadata"` : la durée et la première image, pas le film. La
 *   durée affichée vient du fichier lui-même, jamais d'un nombre écrit ici.
 * - L'affiche est une image WebP tirée du film par ffmpeg (même nom, `.webp`).
 * - Un seul film parle à la fois : lancer l'un met les autres en pause.
 * - Un film sorti de l'écran se met en pause : un son qui continue pendant
 *   qu'on lit les tarifs donne l'impression d'une page qui fuit.
 * - Le traitement vient de la section Academy de la nouvelle page d'accueil
 *   (`accueil/Academie.astro`) : écran à 14 px, filet clair, ombre longue et
 *   une lueur derrière, ici dans l'or de l'Academy et non le bleu du site.
 */
export type FilmData = {
  /** Le nom du fichier dans `public/academy/videos/`, sans extension. */
  id: string;
  titre: string;
  /** Une ligne, sans prix ni nombre de leçons (ils bougent, le film non). */
  legende: string;
};

const EVT = 'academy-film-lecture';

/** « 3 min » : la durée arrondie à la minute, pour le libellé de la touche. */
function minutes(s: number) {
  if (!Number.isFinite(s) || s <= 0) return '';
  return `${Math.max(1, Math.round(s / 60))} min`;
}

function duree(s: number) {
  if (!Number.isFinite(s) || s <= 0) return '';
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function Film({
  film,
  libelleLire,
  fond = 'nuit',
  grand = false,
  sansLegende = false,
  onDuree,
  voir,
  cadre = false,
}: {
  film: FilmData;
  libelleLire: string;
  /** La salle de nuit, ou la feuille claire (après la section MCP). */
  fond?: 'nuit' | 'feuille';
  /** Le titre du film en plus grand, quand il porte seul sa section. */
  grand?: boolean;
  /** La légende est posée à côté par la section (film seul en deux colonnes). */
  sansLegende?: boolean;
  /** La durée lue dans le fichier, pour une légende posée ailleurs. */
  onDuree?: (texte: string) => void;
  /** Le verbe court de la touche (« Voir », « Watch ») : suivi de la durée. */
  voir?: string;
  /** Dans le cadre de navigateur du hero : ni coins, ni filet, ni lueur. */
  cadre?: boolean;
}) {
  const video = useRef<HTMLVideoElement | null>(null);
  const [lance, setLance] = useState(false);
  const [temps, setTemps] = useState('');
  const [mins, setMins] = useState('');
  const src = `/academy/videos/${film.id}`;
  const nuit = fond === 'nuit';

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const surMeta = () => {
      const t = duree(v.duration);
      setTemps(t);
      setMins(minutes(v.duration));
      onDuree?.(t);
    };
    if (v.readyState >= 1) surMeta();
    v.addEventListener('loadedmetadata', surMeta);
    const autre = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== film.id) v.pause();
    };
    window.addEventListener(EVT, autre);
    let obs: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      obs = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting && !v.paused) v.pause();
      });
      obs.observe(v);
    }
    return () => {
      v.removeEventListener('loadedmetadata', surMeta);
      window.removeEventListener(EVT, autre);
      obs?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film.id]);

  const lire = () => {
    const v = video.current;
    if (!v) return;
    setLance(true);
    v.controls = true;
    window.dispatchEvent(new CustomEvent(EVT, { detail: film.id }));
    v.play().catch(() => {
      /* lecture refusée : les contrôles restent à disposition */
    });
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer?.push({ event: 'academy_video_play', video_id: film.id });
  };

  return (
    <figure className="m-0">
      <div className={`film-ecran ${nuit ? 'film-nuit' : 'film-feuille'} ${cadre ? 'film-cadre' : ''}`}>
        <video
          ref={video}
          className="block aspect-video h-auto w-full bg-encre object-cover"
          poster={`${src}.webp`}
          preload="metadata"
          playsInline
          controls={lance}
          onPlay={() => {
            setLance(true);
            window.dispatchEvent(new CustomEvent(EVT, { detail: film.id }));
          }}
        >
          <source src={`${src}.mp4`} type="video/mp4" />
        </video>
        {!lance ? (
          <button type="button" onClick={lire} className="film-lire" aria-label={`${libelleLire} : ${film.titre}`}>
            <span className="film-rond">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                {/* Le tracé de l'icône « play » du site (`ui/Icon.astro`). */}
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>
            {/* Le libellé à côté de la touche, et la durée lue dans le
                fichier (« Voir · 3 min ») : Paul ne voyait pas où se lançaient
                les films (25/09/2026). */}
            <span className="film-libelle">
              {voir ?? libelleLire}
              {mins ? <span className="film-duree">{mins}</span> : null}
            </span>
          </button>
        ) : null}
      </div>
      {sansLegende ? null : (
      <figcaption className="mt-4 max-w-[62ch]">
        <span
          className={`flex flex-wrap items-baseline gap-x-3 font-semibold tracking-[-0.01em] ${
            grand ? 'text-[19px]' : 'text-[16.5px]'
          } ${nuit ? 'text-ivoire' : 'text-encre'}`}
        >
          {film.titre}
          {temps ? (
            <span className={`font-ac-mono text-[12px] font-normal ${nuit ? 'text-brume-nuit' : 'text-brume'}`}>{temps}</span>
          ) : null}
        </span>
        <span className={`mt-1 block text-[15px] leading-[1.55] ${nuit ? 'text-corps-nuit' : 'text-mine'}`}>{film.legende}</span>
      </figcaption>
      )}
    </figure>
  );
}
