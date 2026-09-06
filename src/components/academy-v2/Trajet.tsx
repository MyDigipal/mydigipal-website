import { useEffect, useRef, useState } from 'react';
import { copyV2, type Locale } from './copy-v2';
import { ETAPES, type EtapeId } from './modules';

/**
 * Le trajet de Clara, en trois phases dépliables.
 *
 * Demandé par Paul le 06/09/2026. Le premier essai était un simple
 * plier/déplier de la liste entière : « je trouve ça pas ouf ». Les trois
 * phases reprennent les trois étapes du programme juste au-dessus, donc le
 * visiteur retrouve le même découpage à deux endroits de la page.
 *
 * ⚠️ Une seule phase ouverte à la fois. Trois listes ouvertes redonnent la
 * colonne de 7 853 px qu'on vient précisément de replier.
 *
 * Le compteur de points monte à l'ouverture, sur le barème RÉEL du jeu (les
 * points viennent du JSON de l'application, pas d'ici) : ce n'est pas une
 * décoration, c'est la progression que l'acheteur va vivre.
 */

export interface Moment {
  jour: number;
  texte: string;
  phase: EtapeId;
  points: number;
  rang: string;
}

function espace(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function Compteur({ vers, actif }: { vers: number; actif: boolean }) {
  const [n, setN] = useState(vers);
  const trame = useRef<number>(0);

  useEffect(() => {
    if (!actif) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(vers);
      return;
    }
    const debut = performance.now();
    const duree = 620;
    const pas = (t: number) => {
      const p = Math.min(1, (t - debut) / duree);
      const adouci = 1 - Math.pow(1 - p, 3);
      setN(Math.round(vers * adouci));
      if (p < 1) trame.current = requestAnimationFrame(pas);
    };
    trame.current = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(trame.current);
  }, [actif, vers]);

  return <>{espace(n)}</>;
}

export default function Trajet({ locale, moments }: { locale: Locale; moments: Moment[] }) {
  const c = copyV2(locale).trajet;
  const [ouverte, setOuverte] = useState<EtapeId | null>(null);

  return (
    <section id="trajet" className="scroll-mt-20 border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or">{c.kicker}</div>
        <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-ivoire">
          {c.titre}
        </h2>
        <p className="mt-4 max-w-[66ch] text-[16px] leading-[1.65] text-brume-nuit">{c.chapeau}</p>

        <div className="mt-9 flex flex-col gap-3">
          {ETAPES.map((e, i) => {
            const mo = moments.filter((m) => m.phase === e.id);
            const fin = mo[mo.length - 1];
            const est = ouverte === e.id;
            if (!fin) return null;
            return (
              <div
                key={e.id}
                className={`overflow-hidden rounded-carte border transition duration-200 ${
                  est ? 'border-or bg-salle-3' : 'border-filet-nuit bg-salle-2'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={est}
                  onClick={() => setOuverte(est ? null : e.id)}
                  className="flex w-full cursor-pointer items-center gap-4 border-0 bg-transparent p-5 text-left sm:gap-5"
                >
                  <span
                    className={`grid h-11 w-11 flex-none place-items-center rounded-full border text-[16px] font-semibold transition duration-200 ${
                      est ? 'scale-105 border-or text-or' : 'border-filet-nuit text-brume-nuit'
                    } bg-salle`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[19px] font-medium leading-[1.2] text-ivoire">
                      {e.titre[locale]}
                    </span>
                    <span className="block font-ac-mono text-[12px] leading-[1.6] text-brume-nuit">
                      {e.jours[locale]} · {c.moments(mo.length)}
                    </span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <b className="block text-[19px] font-semibold tabular-nums text-or">
                      <Compteur vers={fin.points} actif={est} />
                    </b>
                    <i className="font-ac-mono text-[10.5px] uppercase not-italic tracking-[.1em] text-brume-nuit">
                      {c.pointsAuBout}
                    </i>
                  </span>
                  <svg
                    className={`flex-none transition duration-200 ${est ? 'rotate-180 text-or' : 'text-brume-nuit'}`}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: est ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="mb-1 max-w-[70ch] px-5 text-[14.5px] leading-[1.6] text-brume-nuit">
                      {e.chapeau[locale]}
                    </p>
                    <ol className="m-0 list-none p-0 pb-5">
                      {mo.map((m, k) => (
                        <li
                          key={m.jour}
                          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-filet-nuit px-5 py-3 sm:flex-nowrap"
                          style={{
                            opacity: est ? 1 : 0,
                            transform: est ? 'none' : 'translateY(8px)',
                            transition: `opacity .34s ease ${k * 0.06}s, transform .34s ease ${k * 0.06}s`,
                          }}
                        >
                          <span className="flex-none basis-[68px] font-ac-mono text-[11px] uppercase tracking-[.08em] text-or">
                            {c.jour(m.jour)}
                          </span>
                          <span className="flex-1 text-[15px] leading-[1.5] text-ivoire">
                            {m.texte}
                          </span>
                          <span className="flex-none whitespace-nowrap font-ac-mono text-[11.5px] text-brume-nuit sm:basis-[160px] sm:text-right">
                            <b className="font-medium text-corps-nuit">{espace(m.points)}</b> pts ·{' '}
                            {m.rang}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
