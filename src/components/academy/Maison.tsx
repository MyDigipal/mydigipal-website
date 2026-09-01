import { useState } from 'react';
import { jour30Copy } from './copy';
import type { Jour30Data, Locale, Avis } from './data';

/**
 * Qui enseigne : la bande photographique, les chiffres, les métiers en filets,
 * puis les preuves. C'est LA FEUILLE de la page : le seul bloc clair, comme la
 * feuille de lecture posée dans la salle de nuit de l'app. Demande de Paul du
 * 25/08/2026 : « pas tout noir sur noir », et les logos en couleur, « ils sont
 * hyper connus ».
 *
 * Le 27/08/2026, sur le retour d'Alexandre retenu par Paul : la phrase
 * d'ouverture ne parle plus de l'agence ni de facturation (la page vend
 * l'Academy, rien d'autre), et les avis sont repliés à neuf, un bouton ouvre
 * les autres. Vingt-quatre cartes d'affilée juste avant le tarif donnaient un
 * air de fin de page, et des visiteurs partaient avant d'arriver aux prix.
 *
 * Les logotypes viennent du site (`/images/Training Logo/`), dans leurs
 * couleurs. Trois fichiers (YSL, Balenciaga, E.Leclerc) sont livrés sur fond
 * blanc : la fusion `multiply` rend ce blanc transparent sur n'importe quel
 * fond clair, sans détourage. Les hauteurs visent le GLYPHE, pas le fichier :
 * un glyphe peut n'occuper qu'un cinquième de la hauteur de son fichier quand
 * un autre en remplit les deux tiers, d'où des valeurs très différentes pour
 * une même surface optique (`h` dans le défilé, `c` dans les cartes).
 *
 * ⚠️ Kering et Chanel sont RETIRÉS depuis le 01/09/2026 (décision de Paul après
 * le call OnTrain), et avec eux Gucci, Yves Saint Laurent et Balenciaga : ces
 * trois marques appartiennent au groupe Kering, donc les garder n'aurait
 * protégé de rien. Ne pas les remettre.
 */
const LOGOS: Array<{ src: string; alt: string; h: number; c: number }> = [
  { src: '/images/Training Logo/Moet_Hennessy_Logo.png', alt: 'Moët Hennessy', h: 17, c: 15 },
  { src: '/images/Training Logo/La poste.png', alt: 'La Poste', h: 38, c: 34 },
  { src: '/images/Training Logo/Leclerc.png', alt: 'E.Leclerc', h: 26, c: 22 },
  { src: '/images/Training Logo/La Redoute.svg', alt: 'La Redoute', h: 32, c: 28 },
  { src: '/images/Training Logo/Pierre fabre.avif', alt: 'Pierre Fabre', h: 28, c: 24 },
  { src: '/images/Training Logo/Pernod Ricard.avif', alt: 'Pernod Ricard', h: 32, c: 28 },
  { src: '/images/Training Logo/Kaufman broad.avif', alt: 'Kaufman & Broad', h: 24, c: 20 },
  { src: '/images/Training Logo/GL events.png', alt: 'GL Events', h: 40, c: 36 },
  { src: '/images/Training Logo/Datawords.png', alt: 'Datawords', h: 24, c: 20 },
  { src: '/images/Training Logo/CBTW.png', alt: 'CBTW', h: 34, c: 30 },
];

/** Le nombre d'avis montrés avant le bouton : trois rangées de trois dès lg. */
const AVIS_VISIBLES = 9;

/**
 * Les verbatims sont ceux des clients, mot pour mot, choisis dans l'export des
 * 497 retours (`lib/academy/temoignages.ts` dans l'app, servi par le JSON) :
 * ceux qui parlent du contenu et de ce qu'on en fait le lendemain, pas de la
 * salle. L'ordre d'affichage alterne les sociétés (un tour de table, puis un
 * deuxième) : servis dans l'ordre du fichier, six Kering ouvraient la grille
 * et la preuve paraissait venir d'un seul client.
 */
function alterner<T extends { societe: string }>(liste: T[]): T[] {
  const files = new Map<string, T[]>();
  for (const t of liste) files.set(t.societe, [...(files.get(t.societe) || []), t]);
  const out: T[] = [];
  let reste = true;
  while (reste) {
    reste = false;
    for (const file of files.values()) {
      const t = file.shift();
      if (t) {
        out.push(t);
        reste = true;
      }
    }
  }
  return out;
}

/** Le logo d'un verbatim, résolu dans la même table par le nom de la société. */
function logoDe(societe: string) {
  return LOGOS.find((l) => l.alt === societe) || null;
}

function Logos({ copie }: { copie?: boolean }) {
  return (
    <div className="flex items-center gap-14 pr-14" aria-hidden={copie ? 'true' : undefined}>
      {LOGOS.map((l) => (
        <img key={l.src} src={l.src} alt={copie ? '' : l.alt} loading="lazy" className="w-auto flex-none" style={{ height: l.h, mixBlendMode: 'multiply' }} />
      ))}
    </div>
  );
}

export default function Maison({ locale, temoignages, avis: preuve }: { locale: Locale; temoignages: Jour30Data['temoignages']; avis: Avis }) {
  const c = jour30Copy(locale).maison;
  const [grande, ...petites] = c.photos;
  const [tous, setTous] = useState(false);
  const avis = alterner(temoignages);
  const caches = Math.max(0, avis.length - AVIS_VISIBLES);
  const visibles = tous ? avis : avis.slice(0, AVIS_VISIBLES);

  return (
    <section id="maison" className="scroll-mt-16 bg-craie pt-[84px] text-mine">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-11 min-[900px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-2.5">
            <figure className="relative col-span-2 m-0 overflow-hidden rounded-carte border border-lin">
              <img src={grande.src} alt={grande.alt} loading="lazy" width={grande.w} height={grande.h} className="block aspect-video h-auto w-full object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-encre/85 px-4 pb-3 pt-[34px] font-ac-mono text-[10px] uppercase tracking-[0.14em] text-ivoire/90">
                {grande.legende}
              </figcaption>
            </figure>
            {petites.map((p) => (
              <figure key={p.src} className="relative m-0 overflow-hidden rounded-carte border border-lin">
                <img src={p.src} alt={p.alt} loading="lazy" width={p.w} height={p.h} className="block aspect-[4/3] h-auto w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-encre/85 px-3.5 pb-2.5 pt-[30px] font-ac-mono text-[10px] uppercase tracking-[0.14em] text-ivoire/90">
                  {p.legende}
                </figcaption>
              </figure>
            ))}
          </div>
          <div>
            <h2 className="m-0 max-w-[20ch] text-balance text-[clamp(26px,3.6vw,38px)] font-medium leading-[1.15] tracking-[-0.02em] text-encre">{c.titre}</h2>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.7] text-mine">{c.texte}</p>
            <div className="mt-[30px] flex flex-wrap gap-x-10 gap-y-[22px]">
              {c.chiffres(preuve).map((k) => (
                <span key={k.libelle}>
                  <b className="block font-ac-mono text-[30px] font-bold leading-none text-or-texte">{k.valeur}</b>
                  <span className="text-[13.5px] text-brume">{k.libelle}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-lin">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-3">
            {c.metiers.map((m, i) => (
              <div
                key={m.titre}
                className={`py-[26px] md:py-8 ${
                  i === 0 ? 'md:border-r md:border-lin md:pr-7' : i === 1 ? 'border-t border-lin md:border-r md:border-t-0 md:px-7' : 'border-t border-lin md:border-t-0 md:pl-7'
                }`}
              >
                <h3 className="m-0 text-[19px] font-medium text-encre">{m.titre}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-brume">{m.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-lin bg-papier pb-11 pt-[38px]">
        <p className="mx-auto mb-[22px] max-w-[1180px] px-4 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-brume sm:px-6">{c.logosTitre}</p>
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

        <div id="avis" className="mx-auto mb-5 mt-12 flex max-w-[1180px] scroll-mt-20 flex-wrap items-baseline gap-x-6 gap-y-1 px-4 sm:px-6">
          <h3 className="m-0 text-[clamp(22px,2.8vw,28px)] font-medium leading-[1.2] tracking-[-0.02em] text-encre">{c.avisTitre}</h3>
          <p className="m-0 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-brume">{c.avisLigne(preuve)}</p>
        </div>
        <div className="j30-avis flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 [scroll-padding-inline:16px] md:mx-auto md:grid md:max-w-[1180px] md:grid-cols-2 md:items-start md:overflow-visible lg:grid-cols-3">
          {visibles.map((t) => {
            const logo = logoDe(t.societe);
            return (
              <figure
                key={t.auteur + t.societe}
                className="m-0 flex w-[min(390px,84vw)] flex-none snap-start flex-col gap-3.5 rounded-carte border border-lin bg-craie px-6 py-[22px] md:w-auto"
              >
                {logo ? (
                  <img src={logo.src} alt={t.societe} loading="lazy" className="w-auto max-w-[150px] self-start object-contain object-left" style={{ height: logo.c, mixBlendMode: 'multiply' }} />
                ) : (
                  <span className="font-ac-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brume">{t.societe}</span>
                )}
                <blockquote className="m-0 flex-1 text-[16px] leading-[1.5] text-encre">{locale === 'fr' ? `« ${t.texte} »` : `“${t.texte}”`}</blockquote>
                <figcaption className="flex items-end justify-between gap-3 border-t border-lin pt-3">
                  <span className="min-w-0">
                    <span className="block text-[13.5px] text-encre">{t.auteur}</span>
                    <span className="mt-[3px] block font-ac-mono text-[10.5px] uppercase tracking-[0.1em] text-brume">{t.societe}</span>
                  </span>
                  {typeof t.note === 'number' ? <span className="flex-none font-ac-mono text-[12px] text-or-grave">{t.note}/10</span> : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
        {caches > 0 ? (
          <div className="mx-auto mt-6 hidden max-w-[1180px] px-4 sm:px-6 md:block">
            <button
              type="button"
              onClick={() => setTous((v) => !v)}
              aria-expanded={tous}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-bouton border border-lin bg-craie px-5 py-2.5 text-[14.5px] font-medium text-encre transition duration-150 hover:border-or-texte"
            >
              {tous ? c.avisMoins : c.avisPlus(caches)}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
