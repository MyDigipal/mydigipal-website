import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * Le ruban des trente jours : avant le récit, comment il va se dérouler.
 *
 * DEUX QUINZAINES depuis le 01/09/2026, et non plus trois niveaux de dix jours
 * (décision de Paul après le call OnTrain) : la méthode d'abord, les
 * automatisations ensuite, parce que c'est ainsi que les deux programmes se
 * vendent. Un découpage en trois ne correspondait à rien qu'on puisse acheter.
 *
 * ⚠️ Le code couleur commence ICI, et c'est sa raison d'être : l'or est La
 * méthode, le bleu sont Les automatisations. Le récit reprend les deux couleurs
 * jour par jour, et la grille de prix les reprend ligne par ligne. Quelqu'un qui
 * arrive aux tarifs a donc déjà appris ce que chaque couleur désigne, sans
 * qu'aucune phrase ne l'explique. Changer une de ces trois surfaces sans les
 * deux autres casse la chaîne.
 *
 * Puis la mention qui est la condition de sincérité du concept : le compte est
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

        {/* Le ruban : une ligne, deux arrêts. Sur mobile, la ligne devient
            verticale et les arrêts s'empilent.

            ⚠️ La ligne change de couleur EN SON MILIEU, sur les deux axes :
            c'est elle qui apprend le code couleur avant qu'on ait lu la
            légende. Deux dégradés en une seule image de fond, chacun sur sa
            moitié, plutôt qu'un dégradé de l'or vers le bleu : un dégradé
            continu ferait croire à un passage progressif entre les deux
            programmes, alors qu'on en achète un, ou les deux. */}
        <ol className="relative m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-2 md:gap-10">
          {/* Deux éléments et non un seul : un dégradé vertical appliqué a une
              ligne de 1 px de haut n'affiche plus qu'une couleur, celle du
              milieu. L'axe du dégradé doit donc suivre l'axe de la ligne, ce
              qu'une bascule de classes ne sait pas faire. */}
          <span
            className="pointer-events-none absolute left-[7px] top-2 h-[calc(100%-16px)] w-px md:hidden"
            style={{ background: 'linear-gradient(180deg, #c8a951 0 50%, #7fc4dd 50% 100%)' }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute left-0 top-[7px] hidden h-px w-full md:block"
            style={{ background: 'linear-gradient(90deg, #c8a951 0 50%, #7fc4dd 50% 100%)' }}
            aria-hidden="true"
          />
          {c.etapes.map((e) => {
            const bleu = e.ton === 'avance';
            return (
              <li key={e.jours} className="relative pl-7 md:pl-0 md:pt-7">
                <span
                  className={`absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 bg-profond md:left-0 md:top-0 ${
                    bleu ? 'border-avance' : 'border-or'
                  }`}
                  aria-hidden="true"
                />
                <p
                  className={`m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.16em] ${
                    bleu ? 'text-avance' : 'text-or'
                  }`}
                >
                  {e.jours}
                </p>
                <p className="m-0 mt-1.5 text-[17px] font-medium leading-[1.3] text-ivoire">{e.nom}</p>
                <p className="m-0 mt-1.5 max-w-[38ch] text-[14px] leading-[1.6] text-brume-nuit">{e.texte}</p>
              </li>
            );
          })}
        </ol>

        {/* La légende du code couleur, juste sous le ruban : deux couleurs
            posées sans être nommées se lisent comme une décoration. */}
        <p className="m-0 mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13.5px] leading-[1.6] text-brume-nuit">
          <span className="inline-block h-[3px] w-6 flex-none rounded-full bg-or" aria-hidden="true" />
          <span className="inline-block h-[3px] w-6 flex-none rounded-full bg-avance" aria-hidden="true" />
          {c.legende}
        </p>

        {/* Une seule image ici, et à cet endroit précis : on vient d'annoncer
            trente jours, la phrase suivante avoue que le compte est reconstitué.
            L'image tient entre les deux, là où le visiteur se demande à quoi ça
            ressemble pour de vrai. */}
        <figure className="m-0 mt-9 overflow-hidden rounded-carte border border-filet-nuit bg-encre">
          <img
            src="/academy/visuels/apprenante-cartes_paysage.jpg"
            alt={c.bandeAlt}
            width={1600}
            height={837}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover"
          />
        </figure>

        <p className="m-0 mt-8 max-w-[80ch] border-t border-filet-nuit pt-5 text-[13.5px] leading-[1.6] text-brume-nuit">{c.texte}</p>
      </div>
    </section>
  );
}
