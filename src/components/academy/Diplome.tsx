import { Fragment, useEffect, useRef } from 'react';
import { jour30Copy } from './copy';
import type { Locale } from './data';
import { onEnter, probeClock, reducedMotion, rescueLoop } from './motion';

/**
 * Le jour 30 : l'attestation, au format paysage, seule à l'écran. Le seul
 * moment de la page où l'on ne montre qu'une chose.
 *
 * Elle se pose à l'arrivée (légère bascule), puis le sceau est frappé (500 ms
 * en accélération, c'est l'accélération qui fait la frappe), puis la mention
 * se grave. Une seule fois. Tout est en CSS (classes j30-*-diplome de
 * globals.css) : le script ne fait que poser l'état caché au bon moment,
 * c'est-à-dire seulement si la feuille est encore sous la ligne de
 * déclenchement quand la page se charge.
 *
 * Tout le texte est du vrai texte, y compris sur la feuille : aucune image
 * de texte. Et pas de numéro de vérification inventé : l'attestation du
 * produit n'en porte pas encore.
 */
export default function Diplome({
  locale,
  lessons,
  modules,
  exercices,
  relus,
  heures,
  mention,
  domaines,
  domainesTitre,
  aside,
}: {
  locale: Locale;
  lessons: number;
  modules: number;
  exercices: number;
  relus: number;
  /** Déjà formaté : « 10 h 33 ». */
  heures: string;
  /** La mention, mot pour mot celle du produit (app-copy). */
  mention: string;
  /**
   * Les domaines couverts, une entrée par étape du parcours. Passés par la
   * seconde page de vente ; sans eux, l'attestation reste celle d'origine.
   */
  domaines?: Array<{ titre: string; modules: string[] }>;
  domainesTitre?: string;
  /**
   * La carte de profil, posée À DROITE du document (Paul, 07/09/2026).
   *
   * ⚠️ Elle change aussi la TAILLE de l'attestation : mesurée ce jour-là, la
   * feuille faisait 977 x 1225, soit un ratio de 0,80 - un format PORTRAIT,
   * alors que l'en-tête de ce fichier annonce « au format paysage ». Ce sont
   * les domaines couverts, ajoutés le matin même, qui l'avaient fait basculer
   * sans que personne ne la remesure. Avec cette prop, les marges et les
   * échelles se resserrent d'un cran pour la ramener au paysage.
   */
  aside?: React.ReactNode;
}) {
  const c = jour30Copy(locale).diplome;
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let arrets: Array<() => void> = [];
    probeClock((alive) => {
      if (!alive || reducedMotion()) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.72) return;
      el.classList.add('j30-pre-diplome');
      arrets.push(
        onEnter(
          el,
          () => {
            el.classList.add('j30-in-diplome');
            el.classList.remove('j30-pre-diplome');
          },
          '-28%'
        )
      );
      arrets.push(rescueLoop([['j30-pre-diplome', 'j30-in-diplome']]));
    });
    return () => {
      arrets.forEach((a) => a());
      arrets = [];
    };
  }, []);

  const filet = 'block h-px w-[clamp(28px,6vw,64px)] bg-or/60';

  // `data-jour={30}` sur la section : la barre du haut lit les repères de jour
  // dans le DOM pour afficher « Jour n / 30 ». Sans celui-ci elle restait à
  // « Jour 28 » pendant tout le diplôme, qui titre lui-même « Jour 30 » (vu au
  // téléphone le 01/09/2026).
  return (
    <section className="relative overflow-hidden border-t border-filet-nuit px-4 pb-[100px] pt-[92px] text-center sm:px-6" data-jour={30}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(52% 42% at 50% 62%, rgba(200,169,81,.09) 0%, transparent 72%)' }}
      />
      <p className="relative m-0 mb-4 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or">{c.kicker}</p>
      <h2 className="relative m-0 mx-auto max-w-[20ch] text-balance text-[clamp(26px,3.8vw,40px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">
        {c.titre}
      </h2>

      <div
        ref={wrap}
        className={
          aside
            ? 'relative mx-auto mt-[42px] grid max-w-[1080px] grid-cols-[minmax(0,1fr)] items-start gap-6 text-left lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-7'
            : 'relative mx-auto mt-[46px] max-w-[820px]'
        }
      >
        <div
          className={`j30-feuille relative rounded-[6px] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.85),inset_0_2px_0_rgba(255,255,255,0.4)] ${aside ? 'p-2.5 text-center' : 'p-3.5'}`}
          style={{ background: 'linear-gradient(160deg,#faf8f3 0%,#f4f1e8 100%)' }}
        >
          <div className="rounded-[3px] border-[1.5px] border-or p-1">
            <div className={`rounded-[2px] border-[0.5px] border-or/55 ${aside ? 'px-[clamp(18px,2.6vw,34px)] py-[clamp(20px,2.8vw,30px)]' : 'px-[clamp(22px,4vw,56px)] py-[clamp(26px,4.4vw,48px)]'}`}>
              <div className="flex items-center justify-center gap-3.5">
                <span className={filet} />
                <img src="/academy/brand/academy-logo.png" alt={c.logoAlt} width={1113} height={457} className={aside ? 'h-[24px] w-auto' : 'h-[30px] w-auto'} />
                <span className={filet} />
              </div>

              <p className={`font-ac-mono font-bold uppercase tracking-[0.34em] text-or-grave ${aside ? 'mt-[18px] text-[clamp(8.5px,0.85vw,9.5px)]' : 'mt-[26px] text-[clamp(9.5px,1.2vw,11px)]'}`}>
                {c.surtitre}
              </p>

              <p className={`font-ac-serif italic leading-[1.6] text-[#5a6472] ${aside ? 'mt-4 text-[12.5px]' : 'mt-6 text-[14px]'}`}>{c.decernee}</p>
              <p className={`mt-1.5 font-ac-serif font-semibold leading-[1.05] tracking-[-0.015em] text-encre ${aside ? 'text-[clamp(26px,3.4vw,40px)]' : 'text-[clamp(32px,6vw,54px)]'}`}>
                {c.nom}
              </p>

              <div className={`mx-auto h-px w-16 bg-or/70 ${aside ? 'my-[18px]' : 'my-[26px]'}`} />

              <p className={`mx-auto leading-[1.7] text-mine ${aside ? 'max-w-[46ch] text-[clamp(12.5px,1.15vw,13.5px)]' : 'max-w-[52ch] text-[clamp(14px,1.6vw,15.5px)]'}`}>
                {c.corps(lessons, modules, exercices, relus)}
              </p>

              {/* Les domaines couverts. « Je trouve que c'est un peu léger
                  comme certification » (Paul, 07/09) : une attestation qui ne
                  dit pas CE QU'ON A ÉTUDIÉ ne vaut pas grand-chose sur un
                  bureau de direction. Trois colonnes, une par étape du
                  parcours, dans la même sobriété que le reste. */}
              {domaines && domaines.length > 0 ? (
                <div className={`mx-auto max-w-[62ch] border-t border-[#e2dccc] ${aside ? 'mt-[20px] pt-[18px]' : 'mt-[30px] pt-[26px]'}`}>
                  <p className="m-0 mb-4 font-ac-mono text-[clamp(8.5px,1.1vw,10px)] font-bold uppercase tracking-[0.28em] text-or-grave">
                    {domainesTitre}
                  </p>
                  {/* ⚠️ Deux mises en forme, et c'est une question de hauteur.
                      Mesuré le 07/09 : en trois colonnes de listes à puces, ce
                      bloc pesait 368 px sur les 887 de la feuille, soit 41 %,
                      parce que des colonnes de 230 px coupent chaque titre de
                      module en deux lignes. À côté de la carte de profil, les
                      modules coulent donc en une ligne par étape, titre à
                      gauche : c'est aussi la forme qu'un vrai diplôme donne à
                      ses domaines. Sans la carte, la page garde ses colonnes. */}
                  {aside ? (
                    <div className="grid grid-cols-[minmax(0,1fr)] gap-y-3 text-left sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-x-5 sm:gap-y-2.5">
                      {domaines.map((d) => (
                        <Fragment key={d.titre}>
                          <p className="m-0 font-ac-mono text-[9px] font-bold uppercase leading-[1.5] tracking-[0.14em] text-[#8a6d24]">
                            {d.titre}
                          </p>
                          <p className="m-0 text-[11.5px] leading-[1.55] text-mine">
                            {d.modules.join(' · ')}
                          </p>
                        </Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-5 text-left sm:grid-cols-3">
                      {domaines.map((d) => (
                        <div key={d.titre}>
                          <p className="m-0 font-ac-mono text-[clamp(8.5px,1.05vw,9.5px)] font-bold uppercase tracking-[0.16em] text-[#8a6d24]">
                            {d.titre}
                          </p>
                          <ul className="m-0 mt-2 list-none p-0">
                            {d.modules.map((m) => (
                              <li
                                key={m}
                                className="relative py-[3px] pl-3 text-[clamp(11px,1.3vw,12.5px)] leading-[1.45] text-mine before:absolute before:left-0 before:top-[10px] before:h-[3px] before:w-[3px] before:rounded-full before:bg-or"
                              >
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className={`j30-mention inline-flex items-center gap-2.5 rounded-full border border-or bg-[#f6ecd3] ${aside ? 'mt-[18px] px-4 py-1.5' : 'mt-[26px] px-5 py-2'}`}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#8a6d24" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.3l6-.8z" />
                </svg>
                <span className="font-ac-mono text-[clamp(9.5px,1.2vw,11px)] font-bold uppercase tracking-[0.18em] text-or-grave">
                  {mention}
                </span>
              </div>

              <div className={`grid grid-cols-[minmax(0,1fr)] items-end justify-items-center gap-6 sm:grid-cols-[1fr_auto_1fr] sm:justify-items-stretch sm:gap-5 ${aside ? 'mt-[clamp(20px,2.4vw,28px)]' : 'mt-[clamp(30px,4vw,44px)]'}`}>
                <div className="text-center sm:text-left">
                  <p className="m-0 font-ac-serif text-[22px] italic leading-none text-encre">{c.signature}</p>
                  <div className="mx-auto my-2 h-px w-40 bg-[#d8d2c4] sm:mx-0 sm:w-auto" />
                  <p className="m-0 font-ac-mono text-[10px] uppercase tracking-[0.14em] text-brume">{c.role}</p>
                </div>

                <div
                  className="j30-sceau relative order-last flex h-[clamp(64px,9vw,86px)] w-[clamp(64px,9vw,86px)] items-center justify-center rounded-full border-2 border-or shadow-[0_6px_14px_-8px_rgba(138,109,36,0.7)] sm:order-none"
                  style={{ background: 'radial-gradient(circle at 34% 30%, #f6ecd3, #e6d5a8)' }}
                >
                  <span className="absolute inset-[5px] rounded-full border border-dashed border-or-grave/55" />
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="#8a6d24" aria-hidden="true">
                    <path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.3l6-.8z" />
                  </svg>
                </div>

                <div className="text-center sm:text-right">
                  <p className="m-0 font-ac-mono text-[11px] leading-[1.5] text-mine">{c.heures(heures)}</p>
                  <div className="mx-auto my-2 h-px w-40 bg-[#d8d2c4] sm:mx-0 sm:w-auto" />
                  <p className="m-0 font-ac-mono text-[10px] uppercase tracking-[0.14em] text-brume">{c.delivree}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {aside}
      </div>

      <p className="relative mx-auto mt-7 max-w-[52ch] text-[15px] leading-[1.65] text-brume-nuit">{c.note}</p>
    </section>
  );
}
