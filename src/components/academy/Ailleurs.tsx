import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * Le bandeau vers les autres façons de travailler avec MyDigipal : la
 * formation en salle ou à distance (page AI Training) et les agents et
 * automatisations construits pour le client (page AI Solutions).
 *
 * Il ferme le bloc clair de la page (« la feuille » : qui enseigne, les
 * logos, les verbatims). Demande de Paul du 25/08/2026 : signaler les
 * sessions en direct sans en parler, et « d'une autre couleur, pas tout noir
 * sur noir ».
 */
export default function Ailleurs({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).ailleurs;
  return (
    <section className="border-t border-lin bg-[#efeae0] px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
        <p className="m-0 max-w-[30ch] text-balance text-[clamp(20px,2.4vw,26px)] font-medium leading-[1.25] tracking-[-0.015em] text-encre">{c.titre}</p>
        <div className="grid gap-3">
          {c.lignes.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group flex items-center justify-between gap-6 rounded-carte border border-lin bg-papier px-5 py-3.5 text-[15px] text-mine shadow-[0_1px_2px_rgba(15,26,46,0.04)] transition duration-150 hover:border-or-texte hover:text-encre"
            >
              <span>{l.label}</span>
              <span className="font-ac-mono text-or-texte transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
