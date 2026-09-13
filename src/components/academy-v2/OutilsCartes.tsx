import type { Locale } from './copy-v2';
import { copyV2 } from './copy-v2';

export interface CarteOutil {
  id: string;
  nom: string;
  /** Le chemin de la page outil, déjà dans la bonne langue. */
  lien: string;
  phrase: string;
}

/**
 * Les quatre outils, et la porte vers leur page.
 *
 * Placée juste APRÈS le programme, et c'est le seul endroit qui marche : la
 * section précédente se termine sur « vous choisissez un outil, et le parcours
 * ne garde que celui-là ». La question « lequel ? » se pose exactement là, et
 * le questionnaire qui suit aide à y répondre. Plus haut, on parlerait d'outils
 * avant d'avoir dit ce qu'est la formation ; plus bas, après le récit, le
 * lecteur a déjà arbitré.
 *
 * ⚠️ Une section entière sur les outils avait été RETIRÉE le 07/09/2026 (Paul :
 * « on n'a pas besoin d'une section entière pour parler des différents
 * outils »), et `academy/Outils.tsx` en garde la trace. Celle-ci n'est pas la
 * même chose : quatre lignes et un lien, parce qu'il existe désormais une vraie
 * page par outil à ouvrir. C'est un aiguillage, pas un chapitre.
 *
 * ⚠️ Les outils arrivent en PROPRIÉTÉ, depuis la page Astro. Importer le
 * catalogue `academy-tools` ici embarquerait dans l'îlot les textes complets des
 * huit pages outils, soit plusieurs dizaines de kilooctets de contenu qui ne
 * s'affichent jamais.
 */
export default function OutilsCartes({ locale, outils }: { locale: Locale; outils: CarteOutil[] }) {
  if (!outils.length) return null;
  const c = copyV2(locale).outils;

  return (
    <section id="outils" className="scroll-mt-20 border-t border-filet-nuit px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or">{c.kicker}</p>
        <h2 className="m-0 mt-3 max-w-[30ch] text-[clamp(24px,3.2vw,34px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">
          {c.titre}
        </h2>
        <p className="m-0 mt-4 max-w-[70ch] text-[15.5px] leading-[1.7] text-brume-nuit">{c.chapeau}</p>

        {/* `grid-cols-[minmax(0,1fr)]` en base : sans elle, la colonne implicite
            `auto` s'élargit à la min-content et fait déborder un nom long. */}
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {outils.map((o) => (
            <a
              key={o.id}
              href={o.lien}
              className="group flex flex-col rounded-carte border border-filet-nuit bg-salle-2 px-5 py-5 no-underline transition duration-200 hover:-translate-y-0.5 hover:border-or"
            >
              <b className="text-[17px] font-semibold text-ivoire">{o.nom}</b>
              <span className="mt-2 flex-1 text-[14px] leading-[1.55] text-brume-nuit">{o.phrase}</span>
              <span className="mt-4 font-ac-mono text-[12px] uppercase tracking-[0.1em] text-or-texte transition-colors group-hover:text-or-vif">
                {c.lien} -&gt;
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
