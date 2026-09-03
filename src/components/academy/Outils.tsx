import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * Les quatre outils, nommés et détaillés.
 *
 * Motif, mesuré le 03/09/2026 : les quatre groupes d'annonces Search
 * (ChatGPT, Claude, Copilot, Gemini) envoient tous vers cette page, où
 * « Claude » apparaissait DEUX fois, « Copilot » et « Gemini » UNE fois, sur
 * 22 700 pixels. Quelqu'un qui cherche « formation copilot » n'y trouvait donc
 * pas sa réponse, et Google notait l'expérience de page « inférieure à la
 * moyenne » sur les vingt mots-clés notés, sans une seule exception.
 *
 * Paul a écarté l'autre option, quatre pages dédiées par outil (« je préfère
 * qu'on ajoute des informations liées aux outils au sein de la page »). Cette
 * section est donc la réponse, et elle est volontairement COURTE : la page fait
 * déjà onze blocs, et le récit des trente jours reste le cœur.
 *
 * Placée après le récit et avant le MCP : on vient de voir Clara choisir son
 * outil au jour 9, la question « lequel, et qu'est-ce qu'on y apprend » est
 * exactement celle qu'on se pose à ce moment-là.
 *
 * ⚠️ Aucun chiffre ici, volontairement : le nombre de leçons par module vient
 * du catalogue et se périme, or ce texte est écrit à la main. La règle « un
 * fait chiffré, une source » interdit de l'inscrire en dur. Si on veut le
 * montrer un jour, il faut le faire descendre par l'API comme le reste.
 */
export default function Outils({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).outils;
  return (
    <section className="border-t border-filet-nuit bg-salle px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1180px]">
        <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or">{c.kicker}</p>
        <h2 className="m-0 mt-3 max-w-[24ch] text-[clamp(24px,3.4vw,34px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">
          {c.titre}
        </h2>
        <p className="m-0 mt-4 max-w-[70ch] text-[15px] leading-[1.7] text-brume-nuit">{c.chapeau}</p>

        {/* Quatre cartes, une par outil. `grid-cols-[minmax(0,1fr)]` en base :
            sans elle, une colonne implicite `auto` laisse déborder un mot long
            sur les petits écrans. */}
        <ul className="m-0 mt-10 grid list-none grid-cols-[minmax(0,1fr)] gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {c.cartes.map((o) => (
            <li
              key={o.nom}
              className="flex flex-col rounded-carte border border-filet-nuit bg-profond p-5 transition-colors hover:border-or/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="m-0 text-[19px] font-medium leading-[1.2] text-ivoire">{o.nom}</h3>
                <span className="font-ac-mono text-[10.5px] uppercase tracking-[0.14em] text-brume-nuit">{o.editeur}</span>
              </div>
              <p className="m-0 mt-2.5 text-[13.5px] leading-[1.6] text-brume-nuit">{o.phrase}</p>
              <ul className="m-0 mt-4 grid list-none gap-2.5 border-t border-filet-nuit p-0 pt-4">
                {o.points.map((pt) => (
                  <li key={pt} className="relative pl-4 text-[13.5px] leading-[1.55] text-corps-nuit">
                    <span
                      className="absolute left-0 top-[9px] h-[3px] w-[7px] rounded-full bg-or"
                      aria-hidden="true"
                    />
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <p className="m-0 mt-7 text-[13px] leading-[1.6] text-brume-nuit">{c.note}</p>
      </div>
    </section>
  );
}
