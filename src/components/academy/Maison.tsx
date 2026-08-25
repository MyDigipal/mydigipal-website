import { jour30Copy } from './copy';
import type { Jour30Data, Locale } from './data';

/**
 * Les logotypes du défilé. Le FILTRE EST UNE DONNÉE DE CHAQUE LOGO, pas une
 * valeur en dur dans le gabarit : `brightness(0) invert(1)` ne ramène au blanc
 * que des pixels opaques, et sur un fichier livré sur fond plein il repeint le
 * fond avec le logo, ce qui donne un rectangle blanc. Les trois logos
 * concernés (Yves Saint Laurent, Balenciaga, E.Leclerc) sont détourés en
 * glyphe blanc sur transparence, suffixe `-ko`, et s'affichent sans filtre.
 * Un logo ajouté déclare s'il doit être inversé, et le piège ne peut plus se
 * reproduire.
 *
 * Les hauteurs sont propres à chaque logo : c'est la surface optique qui
 * compte, pas la mesure. La Redoute est un monogramme carré, il est à 28 px.
 */
const LOGOS: Array<{ src: string; alt: string; h: number; inv: boolean }> = [
  { src: '/academy/references/kering.svg', alt: 'Kering', h: 24, inv: true },
  { src: '/academy/references/chanel.png', alt: 'Chanel', h: 26, inv: true },
  { src: '/academy/references/gucci.png', alt: 'Gucci', h: 30, inv: true },
  { src: '/academy/references/ysl-ko.png', alt: 'Yves Saint Laurent', h: 30, inv: false },
  { src: '/academy/references/balenciaga-ko.png', alt: 'Balenciaga', h: 14, inv: false },
  { src: '/academy/references/moet-hennessy.png', alt: 'Moët Hennessy', h: 16, inv: true },
  { src: '/academy/references/la-poste.png', alt: 'La Poste', h: 36, inv: true },
  { src: '/academy/references/leclerc-ko.png', alt: 'E.Leclerc', h: 26, inv: false },
  { src: '/academy/references/la-redoute.svg', alt: 'La Redoute', h: 28, inv: true },
  { src: '/academy/references/pierre-fabre.png', alt: 'Pierre Fabre', h: 24, inv: true },
  { src: '/academy/references/pernod-ricard.png', alt: 'Pernod Ricard', h: 26, inv: true },
];

/** Le logo d'un verbatim, résolu dans la même table pour hériter du bon filtre. */
function logoDe(src: string) {
  const ko = src.replace(/\.png$/, '-ko.png');
  return LOGOS.find((l) => l.src === src || l.src === ko) || { src, alt: '', h: 24, inv: true };
}

const INV = 'brightness(0) invert(1)';

function Logos({ copie }: { copie?: boolean }) {
  return (
    <div className="flex items-center gap-14 pr-14" aria-hidden={copie ? 'true' : undefined}>
      {LOGOS.map((l) => (
        <img
          key={l.src}
          src={l.src}
          alt={copie ? '' : l.alt}
          loading="lazy"
          className="w-auto flex-none opacity-[0.62]"
          style={{ height: l.h, filter: l.inv ? INV : 'none' }}
        />
      ))}
    </div>
  );
}

/**
 * Qui enseigne : la bande photographique, les chiffres, les métiers en filets,
 * puis les preuves. Un seul défilé sur la page (les logotypes) ; les verbatims
 * se lisent au doigt, en défilement horizontal aimanté, pas en boucle.
 */
export default function Maison({ locale, temoignages }: { locale: Locale; temoignages: Jour30Data['temoignages'] }) {
  const c = jour30Copy(locale).maison;
  const [grande, ...petites] = c.photos;
  return (
    <section id="maison" className="border-t border-filet-nuit pt-[84px]">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-11 min-[900px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-2.5">
            <figure className="relative col-span-2 m-0 overflow-hidden rounded-carte border border-filet-nuit">
              <img
                src={grande.src}
                alt={grande.alt}
                loading="lazy"
                width={grande.w}
                height={grande.h}
                className="block aspect-video h-auto w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-salle/90 px-4 pb-3 pt-[34px] font-ac-mono text-[10px] uppercase tracking-[0.14em] text-ivoire/85">
                {grande.legende}
              </figcaption>
            </figure>
            {petites.map((p) => (
              <figure key={p.src} className="relative m-0 overflow-hidden rounded-carte border border-filet-nuit">
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  width={p.w}
                  height={p.h}
                  className="block aspect-[4/3] h-auto w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-salle/90 px-3.5 pb-2.5 pt-[30px] font-ac-mono text-[10px] uppercase tracking-[0.14em] text-ivoire/85">
                  {p.legende}
                </figcaption>
              </figure>
            ))}
          </div>
          <div>
            <h2 className="m-0 max-w-[20ch] text-balance text-[clamp(26px,3.6vw,38px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">
              {c.titre}
            </h2>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.7] text-corps-nuit">{c.texte}</p>
            <div className="mt-[30px] flex flex-wrap gap-x-10 gap-y-[22px]">
              {c.chiffres.map((k) => (
                <span key={k.libelle}>
                  <b className="block font-ac-mono text-[30px] font-bold leading-none text-or">{k.valeur}</b>
                  <span className="text-[13.5px] text-brume-nuit">{k.libelle}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-filet-nuit">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-3">
            {c.metiers.map((m, i) => (
              <div
                key={m.titre}
                className={`py-[26px] md:py-8 ${
                  i === 0
                    ? 'md:border-r md:border-filet-nuit md:pr-7'
                    : i === 1
                      ? 'border-t border-filet-nuit md:border-r md:border-t-0 md:px-7'
                      : 'border-t border-filet-nuit md:border-t-0 md:pl-7'
                }`}
              >
                <h3 className="m-0 text-[19px] font-medium text-ivoire">{m.titre}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-brume-nuit">{m.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-filet-nuit bg-profond pb-11 pt-[38px]">
        <p className="mx-auto mb-[22px] max-w-[1180px] px-4 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-brume-nuit sm:px-6">
          {c.logosTitre}
        </p>
        <div
          className="j30-defile relative"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          }}
        >
          <div className="j30-piste items-center">
            <Logos />
            <div className="j30-copie">
              <Logos copie />
            </div>
          </div>
        </div>

        <p className="mx-auto mb-5 mt-10 max-w-[1180px] px-4 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-brume-nuit sm:px-6">
          {c.avisTitre}
        </p>
        <div className="j30-avis flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 [scroll-padding-inline:16px]">
          {temoignages.map((t) => {
            const logo = logoDe('/academy' + t.logo);
            return (
              <figure
                key={t.auteur + t.societe}
                className="m-0 flex w-[min(390px,84vw)] flex-none snap-start flex-col gap-3.5 rounded-carte border border-filet-nuit bg-salle-2 px-6 py-[22px]"
              >
                <img
                  src={logo.src}
                  alt={t.societe}
                  loading="lazy"
                  className="w-auto max-w-[130px] self-start object-contain object-left opacity-75"
                  style={{ height: logo.h, filter: logo.inv ? INV : 'none' }}
                />
                <blockquote className="m-0 flex-1 text-[16px] leading-[1.5] text-ivoire">{locale === 'fr' ? `« ${t.texte} »` : `“${t.texte}”`}</blockquote>
                <figcaption className="border-t border-filet-nuit pt-3">
                  <span className="block text-[13.5px] text-corps-nuit">{t.auteur}</span>
                  <span className="mt-[3px] block font-ac-mono text-[10.5px] uppercase tracking-[0.1em] text-brume-nuit">
                    {t.societe} · {t.session}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
