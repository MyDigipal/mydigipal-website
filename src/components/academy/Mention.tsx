import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * Le ruban des trente jours : avant le récit, comment il va se dérouler.
 * Trois niveaux sur une ligne d'or à trois arrêts, dix jours chacun, puis la
 * mention qui est la condition de sincérité du concept : le compte est
 * reconstitué et la personne est composée, et la page le dit avant de montrer
 * quoi que ce soit.
 *
 * Demande de Paul du 25/08/2026 : « un petit ruban pour expliquer comment ça
 * va se passer ».
 */
export default function Mention({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).mention;
  return (
    <section className="border-y border-filet-nuit bg-profond px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or">{c.kicker}</p>
          <h2 className="m-0 text-[clamp(22px,3vw,30px)] font-medium leading-[1.2] tracking-[-0.02em] text-ivoire">{c.titre}</h2>
        </div>

        {/* Le ruban : une ligne, trois arrêts. Sur mobile, la ligne devient
            verticale et les arrêts s'empilent. */}
        <ol className="relative m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-3 md:gap-8">
          <span
            className="pointer-events-none absolute left-[7px] top-2 h-[calc(100%-16px)] w-px md:left-0 md:top-[7px] md:h-px md:w-full"
            style={{ background: 'linear-gradient(90deg, #c8a951, rgba(200,169,81,.25))' }}
            aria-hidden="true"
          />
          {c.etapes.map((e) => (
            <li key={e.jours} className="relative pl-7 md:pl-0 md:pt-7">
              <span className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-or bg-profond md:left-0 md:top-0" aria-hidden="true" />
              <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.16em] text-or">{e.jours}</p>
              <p className="m-0 mt-1.5 text-[17px] font-medium leading-[1.3] text-ivoire">{e.nom}</p>
              <p className="m-0 mt-1.5 max-w-[34ch] text-[14px] leading-[1.6] text-brume-nuit">{e.texte}</p>
            </li>
          ))}
        </ol>

        <p className="m-0 mt-8 max-w-[80ch] border-t border-filet-nuit pt-5 text-[13.5px] leading-[1.6] text-brume-nuit">{c.texte}</p>
      </div>
    </section>
  );
}
