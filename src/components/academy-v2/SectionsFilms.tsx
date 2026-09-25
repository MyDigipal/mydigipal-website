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
  fond,
  inverse = false,
}: {
  film: FilmData;
  lire: string;
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
          <Film film={film} libelleLire={lire} fond={fond} sansLegende onDuree={setTemps} />
        </div>
      </div>
    </section>
  );
}

/** La conférence : deux films, le premier en grand, le second décalé. */
export function FilmsSalle({ salle, lire }: { salle: NonNullable<FilmsCopy['salle']>; lire: string }) {
  const [premier, ...autres] = salle.films;
  return (
    <section className="border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="v2-reveal max-w-[60ch]">
          <h2 className="m-0 text-ivoire">{salle.titre}</h2>
          <p className="mt-5 text-[16.5px] leading-[1.65] text-corps-nuit">{salle.chapeau}</p>
        </div>
        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 lg:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
          {premier ? (
            <div className="v2-reveal">
              <Film film={premier} libelleLire={lire} grand />
            </div>
          ) : null}
          {autres.map((f, i) => (
            <div key={f.id} className="v2-reveal lg:mt-40" style={{ ['--i' as string]: i + 1 }}>
              <Film film={f} libelleLire={lire} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
