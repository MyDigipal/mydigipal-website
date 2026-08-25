import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * La mention : une bande, une phrase. Elle n'est pas décorative, c'est la
 * condition de sincérité du concept. Le compte est reconstitué et la personne
 * est composée, et la page le dit avant de montrer quoi que ce soit.
 */
export default function Mention({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).mention;
  return (
    <section className="border-y border-filet-nuit bg-profond">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-baseline gap-x-8 gap-y-4 px-4 py-[26px] sm:px-6">
        <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or">{c.kicker}</p>
        <p className="m-0 max-w-[76ch] text-[15px] leading-[1.6] text-corps-nuit">{c.texte}</p>
      </div>
    </section>
  );
}
