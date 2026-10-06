import Anime from './Anime';
import Film, { type FilmData } from './Film';
import type { Locale } from './copy-v2';

/**
 * Les sections qui MONTRENT au lieu de raconter (06/10/2026, direction B du labo
 * `page-vente-courte.html`, Paul : « fais un maximum de mise à jour »).
 *
 * - La visite : l'animation « Visite de l'Academy » (la caméra qui tient sur
 *   l'espace apprenant) remplace la visite survolée (`Visite`, 1 107 px sur
 *   bureau, 2 160 sur téléphone).
 * - Les agents : l'animation « E-mail, devis, facture » remplace le schéma des
 *   prises MCP (`Mcp`, 1 255 et 1 904 px). Ses libellés sortent du plateau par
 *   des traits, sur le dessin de Paul du 06/10.
 * - La galerie : les films parlants de Paul, côte à côte au lieu de trois
 *   grands blocs l'un sous l'autre (Paul : « la limite, c'est de faire une
 *   espèce de petite galerie »).
 *
 * Trois mises en page différentes, pour ne pas répéter la même : l'écran en
 * pleine largeur sous son titre, l'écran à gauche et le texte à droite, la
 * grille de vignettes.
 */

export function VisiteAnimee({ locale, titre, texte, alt }: { locale: Locale; titre: string; texte: string; alt: string }) {
  return (
    <section id="visite" className="scroll-mt-20 border-t border-filet-nuit px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="v2-reveal m-0 max-w-[22ch] text-ivoire">{titre}</h2>
        <p className="v2-reveal m-0 mt-3 max-w-[60ch] text-[16.5px] leading-[1.6] text-brume-nuit">{texte}</p>
        <div className="v2-reveal mt-8" style={{ ['--i' as string]: 1 }}>
          <Anime nom="visite" locale={locale} alt={alt} />
        </div>
      </div>
    </section>
  );
}

export function AgentsAnimes({ locale, titre, texte, alt }: { locale: Locale; titre: string; texte: string; alt: string }) {
  return (
    <section className="border-t border-filet-nuit px-4 py-16 sm:px-6 lg:py-24">
      {/* Au téléphone : le titre, puis l'écran. Dès lg : l'écran à gauche sur
          huit colonnes, le texte à droite sur quatre. */}
      <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-7 lg:grid-cols-12 lg:gap-10">
        <div className="v2-reveal lg:order-2 lg:col-span-4">
          <h2 className="m-0 text-ivoire">{titre}</h2>
          <p className="m-0 mt-4 text-[16px] leading-[1.65] text-corps-nuit">{texte}</p>
        </div>
        <div className="v2-reveal lg:order-1 lg:col-span-8" style={{ ['--i' as string]: 1 }}>
          <Anime nom="agents" locale={locale} alt={alt} />
        </div>
      </div>
    </section>
  );
}

export function FilmsGalerie({
  titre,
  chapeau,
  films,
  lire,
  voir,
}: {
  titre: string;
  chapeau: string;
  films: FilmData[];
  lire: string;
  voir: string;
}) {
  if (!films.length) return null;
  return (
    <section className="border-t border-filet-nuit px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="v2-reveal m-0 text-ivoire">{titre}</h2>
        <p className="v2-reveal m-0 mt-3 max-w-[60ch] text-[16.5px] leading-[1.6] text-brume-nuit">{chapeau}</p>
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {films.map((f, i) => (
            <div key={f.id} className="v2-reveal" style={{ ['--i' as string]: i + 1 }}>
              <Film film={f} libelleLire={lire} voir={voir} fond="nuit" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
