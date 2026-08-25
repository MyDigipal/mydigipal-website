import { jour30Copy } from './copy';
import type { Jour30Data, Locale } from './data';
import { formatPrice } from './offres';

/**
 * Le hero : ce qu'on vend, en une phrase, et le produit tel qu'il est.
 *
 * Direction A retenue par Paul le 25/08/2026 : texte à gauche (titre, une
 * phrase avec les chiffres de l'app, deux boutons), la vraie capture du
 * tableau de bord à droite. Pas de photo de salle : la page AI Training vend
 * la formation en présentiel, celle-ci vend l'en-ligne, et les deux ne doivent
 * pas se ressembler. Pas de terminal qui réécrit un prompt : il ne réagissait
 * pas à ce qu'on tapait, et une démonstration qui ment vaut moins que rien.
 *
 * Le chiffre de leçons et le prix viennent du JSON de l'app, jamais d'ici.
 */
export default function Hero({ locale, data }: { locale: Locale; data: Jour30Data }) {
  const c = jour30Copy(locale).hero;
  const programme = data.offres.find((o) => o.id === 'programme');
  const prix = programme ? formatPrice(programme.ttc_minor, locale) : '';
  const cta = 'inline-flex min-h-11 items-center whitespace-nowrap rounded-bouton px-[26px] py-3.5 text-[15.5px] font-semibold transition duration-150';

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:pb-24 lg:pt-40">
      {/* Le site a son header fixe (72 px) et son logo : la section passe
          dessous avec son dégradé, sans bande vide ni second logo. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 50% at 72% 30%, rgba(200,169,81,.10) 0%, transparent 70%)' }}
      />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <h1 className="m-0 max-w-[17ch] text-balance text-[clamp(32px,4.6vw,56px)] font-medium leading-[1.06] tracking-[-0.025em] text-ivoire">
            {c.titre}
          </h1>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.65] text-corps-nuit">{c.sous(data.faits.lessons, prix)}</p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a href="#composer" className={`${cta} bg-or text-salle hover:bg-or-vif`}>
              {c.cta}
            </a>
            <a href="#compte" className={`${cta} border border-filet-nuit text-corps-nuit hover:border-brume-nuit hover:text-ivoire`}>
              {c.cta2}
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-[16px] border border-filet-nuit bg-encre shadow-[0_40px_80px_-50px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 border-b border-filet-nuit px-4 py-3">
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="ml-3 font-ac-mono text-[11px] text-brume-nuit">{c.url}</span>
          </div>
          <div className="relative aspect-[16/10]">
            <img
              src="/academy/captures/tableau-de-bord.jpg"
              alt={c.alt}
              width={1204}
              height={753}
              fetchPriority="high"
              className="block h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
