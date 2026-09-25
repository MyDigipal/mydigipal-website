import { useState } from 'react';
import Film, { type FilmData } from './Film';

/**
 * Les sections qui portent les films parlants (25/09/2026).
 *
 * Chaque film est posé là où il PROUVE quelque chose, et nulle part ailleurs :
 * - anglais : l'intérieur d'une leçon juste après la visite de l'espace (on
 *   vient de survoler le tableau de bord, le film montre ce qu'il y a
 *   derrière), puis Les automatisations et le MCP juste après le schéma des
 *   prises (le schéma explique, le film montre la vraie installation) ;
 * - français : deux extraits d'une conférence donnée pour SeLoger, juste
 *   avant « Une méthode née en salle » (Maison), dont ils sont la preuve.
 *
 * Deux compositions différentes, pour ne pas répéter la même mise en page :
 * un film seul en deux colonnes (texte étroit, écran large), et la paire de
 * la conférence, asymétrique, le second film décalé vers le bas.
 */
export type FilmsCopy = {
  lire: string;
  /** Le verbe de la touche de lecture, suivi de la durée (« Voir · 3 min »). */
  voir: string;
  /** Le film du hero, dans le cadre de navigateur, à la place de la capture. */
  hero?: FilmData;
  /** La barre d'adresse du cadre du hero, quand le film n'est pas l'app. */
  urlCadre?: string;
  /** Page anglaise : l'intérieur d'une leçon, après la visite. */
  produit?: FilmData;
  /** Page anglaise : Les automatisations et le MCP, après le schéma. */
  mcp?: FilmData;
  /** Page française : la conférence, avant Maison. */
  salle?: { titre: string; chapeau: string; films: FilmData[] };
};

/** Un film seul : le titre et la légende à gauche, l'écran à droite. */
export function FilmSeul({
  film,
  lire,
  voir,
  fond,
  inverse = false,
}: {
  film: FilmData;
  lire: string;
  voir: string;
  fond: 'nuit' | 'feuille';
  /** L'écran à gauche : la seconde occurrence ne copie pas la première. */
  inverse?: boolean;
}) {
  const nuit = fond === 'nuit';
  const [temps, setTemps] = useState('');
  return (
    <section
      className={`px-4 sm:px-6 ${
        nuit ? 'pb-20 lg:pb-28' : 'border-t border-lin bg-craie py-20 text-mine lg:py-24'
      }`}
    >
      {/* Au téléphone : le titre, puis l'écran (la légende d'abord dit ce
          qu'on va voir). Dès lg : quatre colonnes de texte, huit d'écran. */}
      <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-6 lg:grid-cols-12 lg:gap-10">
        <div className={`v2-reveal lg:col-span-4 ${inverse ? 'lg:order-2' : ''}`}>
          <h3 className={`m-0 text-[clamp(22px,2.4vw,28px)] font-semibold leading-[1.15] tracking-[-0.025em] ${nuit ? 'text-ivoire' : 'text-encre'}`}>
            {film.titre}
          </h3>
          <p className={`mt-3 max-w-[40ch] text-[15.5px] leading-[1.6] ${nuit ? 'text-corps-nuit' : 'text-mine'}`}>{film.legende}</p>
          {temps ? (
            <p className={`mt-3 font-ac-mono text-[12px] ${nuit ? 'text-brume-nuit' : 'text-brume'}`}>{temps}</p>
          ) : null}
        </div>
        <div className={`v2-reveal lg:col-span-8 ${inverse ? 'lg:order-1' : ''}`} style={{ ['--i' as string]: 1 }}>
          <Film film={film} libelleLire={lire} voir={voir} fond={fond} sansLegende onDuree={setTemps} />
        </div>
      </div>
    </section>
  );
}

/**
 * La conférence. Depuis que l'extrait sur la réclamation est monté dans le
 * hero (25/09/2026), il n'en reste qu'un : le texte à gauche, l'écran à droite.
 * S'il y en a deux, le second se pose sous le premier, décalé à droite.
 */
export function FilmsSalle({ salle, lire, voir }: { salle: NonNullable<FilmsCopy['salle']>; lire: string; voir: string }) {
  const [premier, ...autres] = salle.films;
  if (!premier) return null;
  return (
    <section className="border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="v2-reveal lg:col-span-4">
          <h2 className="m-0 text-ivoire">{salle.titre}</h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-corps-nuit">{salle.chapeau}</p>
        </div>
        <div className="v2-reveal lg:col-span-8" style={{ ['--i' as string]: 1 }}>
          <Film film={premier} libelleLire={lire} voir={voir} grand />
        </div>
        {autres.map((f, i) => (
          <div key={f.id} className="v2-reveal lg:col-span-7 lg:col-start-6" style={{ ['--i' as string]: i + 2 }}>
            <Film film={f} libelleLire={lire} voir={voir} />
          </div>
        ))}
      </div>
    </section>
  );
}
