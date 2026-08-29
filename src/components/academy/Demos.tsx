import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from './data';

/**
 * Les enregistrements du produit : la source unique, et la visionneuse.
 *
 * Huit écrans filmés par Paul dans l'application. Ils servent à deux endroits
 * de la page, et c'est pour cela qu'ils vivent dans leur propre fichier : la
 * galerie du bas les montre tous, et la visite du haut ouvre celui de la zone
 * qu'on survole. Deux listes séparées auraient divergé au premier ajout.
 *
 * Les boucles sont muettes, sans contrôles, jouées en boucle : elles se
 * comportent comme des captures qui bougent. La visionneuse, elle, donne les
 * contrôles : c'est le moment où quelqu'un a demandé à regarder.
 *
 * Traitement (ffmpeg, à refaire à l'identique pour tout nouvel écran) : couper
 * dix secondes SUR LE GESTE, recadrer en 16:10 depuis le haut, ramener à
 * 1280 px, H.264 CRF 30 plus une version VP9, extraire l'affiche. Les sources
 * vivent dans `Confidential/MyDigipal/Academy/Captures produit/`.
 */
export const DEMOS = [
  'quiz',
  'assistant',
  'profil',
  'atelier',
  'programme',
  'avance',
  'cas',
  'prompts',
] as const;

export type DemoKey = (typeof DEMOS)[number];

/** Ce que chaque écran montre, dans les deux langues. */
export const LIBELLES: Record<DemoKey, { fr: string; en: string }> = {
  quiz: {
    fr: 'Un quiz de fin de module, et l’explication qui suit chaque réponse',
    en: 'An end-of-module quiz, and the explanation after every answer',
  },
  assistant: {
    fr: 'L’assistant, qui répond à partir de vos propres leçons',
    en: 'The assistant, answering from your own lessons',
  },
  profil: {
    fr: 'Votre profil : les points, la série, les vingt-trois trophées',
    en: 'Your profile: points, streak, and the twenty-three trophies',
  },
  atelier: {
    fr: 'L’atelier CRAFT : le prompt s’écrit à mesure que vous remplissez',
    en: 'The CRAFT workshop: the prompt writes itself as you fill it in',
  },
  programme: {
    fr: 'Le programme, module par module',
    en: 'The programme, module by module',
  },
  avance: {
    fr: 'Les cas d’usage avancés, jusqu’aux serveurs MCP',
    en: 'The advanced use cases, all the way to MCP servers',
  },
  cas: {
    fr: 'La bibliothèque de cas, filtrée par métier',
    en: 'The case library, filtered by job',
  },
  prompts: {
    fr: 'La bibliothèque de prompts, prête à copier',
    en: 'The prompt library, ready to copy',
  },
};

export function libelleDemo(nom: DemoKey, locale: Locale): string {
  return LIBELLES[nom][locale === 'fr' ? 'fr' : 'en'];
}

/**
 * Les écrans dont il existe une version filmée en français, dans
 * `public/academy/demos/fr/`. Les autres sont servis en anglais.
 *
 * ⚠️ Une liste explicite, et pas une tentative de chargement : une balise
 * `<source>` ne se replie PAS sur un 404, elle ne se replie que sur un type
 * que le navigateur ne sait pas lire. Un fichier français manquant donnerait
 * donc un cadre noir, pas la version anglaise. On sait ce qu'on a enregistré,
 * on l'écrit ici.
 *
 * Ajouter une langue à un écran, c'est : trois fichiers (`.mp4`, `.webm`,
 * `.jpg`) plus la vignette `-v.jpg` dans `demos/fr/`, traités exactement comme
 * les anglais (la recette est dans la section 32 du CLAUDE.md de l'app), et une
 * entrée ici. Écran par écran : rien n'oblige à tout refaire d'un coup.
 */
export const DEMOS_FR = new Set<DemoKey>([]);

/** Le chemin d'un écran, dans la langue lue quand il y existe. */
export function cheminDemo(nom: DemoKey, locale: Locale): string {
  return locale === 'fr' && DEMOS_FR.has(nom) ? `/academy/demos/fr/${nom}` : `/academy/demos/${nom}`;
}

/**
 * Les captures fixes du hero, même principe. Elles montrent l'interface de
 * l'application, qui est bilingue : une capture anglaise sur la page française
 * n'est pas une traduction manquante, c'est une capture prise dans la mauvaise
 * langue. Elle se refait, elle ne se retouche pas.
 */
export const CAPTURES_FR = new Set<string>([]);

export function cheminCapture(nom: string, locale: Locale): string {
  return locale === 'fr' && CAPTURES_FR.has(nom)
    ? `/academy/captures/fr/${nom}.jpg`
    : `/academy/captures/${nom}.jpg`;
}

/**
 * Une boucle. `preload="none"` et `autoplay` se contredisent (Chrome respecte
 * le premier et ne démarre jamais), donc la lecture se demande à l'entrée dans
 * l'écran et se met en pause à la sortie : la page reste légère et rien ne
 * tourne dans le vide.
 */
export function Boucle({
  nom,
  titre,
  locale,
  className = '',
}: {
  nom: DemoKey;
  titre: string;
  locale: Locale;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const base = cheminDemo(nom, locale);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.load();
      void el.play().catch(() => undefined);
      return;
    }
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting) {
            if (el.readyState === 0) el.load();
            void el.play().catch(() => undefined);
          } else if (!el.paused) {
            el.pause();
          }
        }
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={`block h-full w-full object-cover object-top ${className}`}
      poster={`${base}.jpg`}
      width={1280}
      height={800}
      muted
      loop
      playsInline
      preload="none"
      aria-label={titre}
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}

/**
 * La visionneuse. Elle ne vit que pendant qu'on regarde : pas de composant
 * monté en permanence, pas de fond noir qui attend son heure.
 *
 * Échap ferme, un clic à côté ferme, et le défilement de la page est bloqué
 * pendant l'ouverture : sinon on referme et on se retrouve trois écrans plus
 * bas sans savoir pourquoi.
 */
export function Visionneuse({
  nom,
  titre,
  locale,
  onClose,
}: {
  nom: DemoKey;
  titre: string;
  locale: Locale;
  onClose: () => void;
}) {
  const base = cheminDemo(nom, locale);
  useEffect(() => {
    const auTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const avant = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', auTouche);
    return () => {
      window.removeEventListener('keydown', auTouche);
      document.body.style.overflow = avant;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titre}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-salle/94 p-4 backdrop-blur-sm sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1180px] overflow-hidden rounded-[16px] border border-filet-nuit bg-encre shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center gap-3 border-b border-filet-nuit px-4 py-3">
          <span className="min-w-0 flex-1 truncate font-ac-mono text-[11px] text-brume-nuit">{titre}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-11 min-w-11 cursor-pointer rounded-bouton border border-filet-nuit px-3 font-ac-mono text-[12px] text-corps-nuit transition duration-150 hover:border-or hover:text-ivoire"
          >
            ESC
          </button>
        </div>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          className="block aspect-[16/10] h-auto w-full bg-encre"
          poster={`${base}.jpg`}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={`${base}.webm`} type="video/webm" />
          <source src={`${base}.mp4`} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

/** Ce que la page fournit à qui veut ouvrir une vidéo : un état, deux gestes. */
export function useVisionneuse() {
  const [ouvert, setOuvert] = useState<DemoKey | null>(null);
  const fermer = useCallback(() => setOuvert(null), []);
  return { ouvert, ouvrir: setOuvert, fermer };
}

/**
 * L'affiche d'un écran filmé : l'image, un bouton de lecture, et ce qu'on va
 * voir. Elle sert dans le panneau de la visite (Paul, 29/08/2026 : « ce que je
 * préférais, c'est qu'il y ait un petit thumbnail de la vidéo qui apparaisse,
 * avec un bouton Play »).
 *
 * Une image et non une boucle : le panneau change d'écran à chaque survol, et
 * pendant la visite automatique il en traverse huit. Huit vidéos qui se
 * chargent pour être vues deux secondes, ce serait trois mégaoctets pour rien.
 * L'image dédiée en fait vingt-cinq kilooctets, et la vidéo se charge quand
 * quelqu'un demande à la regarder.
 */
export function Affiche({
  nom,
  titre,
  legende,
  locale,
  onOuvrir,
}: {
  nom: DemoKey;
  titre: string;
  legende: string;
  locale: Locale;
  onOuvrir: (n: DemoKey) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOuvrir(nom)}
      aria-label={`${legende} : ${titre}`}
      className="group mt-4 block w-full cursor-pointer overflow-hidden rounded-carte border border-filet-nuit bg-encre text-left transition duration-150 hover:border-or"
    >
      <span className="relative block aspect-[16/10]">
        <img
          src={`${cheminDemo(nom, locale)}-v.jpg`}
          alt=""
          width={600}
          height={375}
          className="block h-full w-full object-cover object-top"
        />
        {/* Le voile fait ressortir le bouton sur une capture claire, et se
            lève au survol : l'écran se dévoile avant même le clic. */}
        <span className="absolute inset-0 bg-salle/40 transition duration-200 group-hover:bg-salle/10" />
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-or text-salle shadow-[0_12px_30px_-12px_rgba(0,0,0,0.9)] transition duration-200 group-hover:scale-110">
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <path d="M8 5.4v13.2L19 12z" fill="currentColor" />
          </svg>
        </span>
      </span>
      <span className="block border-t border-filet-nuit px-3.5 py-2.5 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-brume-nuit transition duration-150 group-hover:text-or">
        {legende}
      </span>
    </button>
  );
}
