import { useEffect, useState } from 'react';
import { pointeurGrossier } from '../academy/motion';
import Glyphe from './Glyphe';
import { ETAPES, MODULES, minutesDe, modulesDe, nombreSuivi, type Module } from './modules';
import { copyV2, type Locale } from './copy-v2';
import { Boucle, estDemo, Visionneuse, type Demo } from './Video';

/**
 * Le programme : ce que la page ne disait pas.
 *
 * La page de vente mesurée le 06/09/2026 faisait 21 235 px, dont 37 % pour le
 * récit des trente jours et 3,8 % pour décrire la formation. C'est le même
 * diagnostic que celui de Google Ads, où le `post_click_quality_score` est
 * BELOW_AVERAGE sur les vingt mots-clés notés : la page raconte une histoire
 * là où on cherche un programme.
 *
 * Sur FOND CLAIR, volontairement. Les teintes de module viennent de
 * `module-style.ts` dans l'application, où elles sont calculées pour du papier
 * crème ; sur la salle de nuit, un sauge à #1d6b4f est illisible. La section
 * MCP de la page actuelle fait déjà cette respiration claire.
 *
 * Le panneau de droite reprend le motif de « What's inside the course », qui
 * fonctionne déjà en haut de la page existante : au survol on remplit, au clic
 * on fige.
 */

function duree(minutes: number, locale: Locale) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return locale === 'fr' ? `${h} h ${String(m).padStart(2, '0')}` : `${h}h ${String(m).padStart(2, '0')}`;
}

export default function Programme({
  locale,
  modules,
  heures,
  leconsGratuit,
  minutesGratuit,
}: {
  locale: Locale;
  modules: number;
  heures: string;
  leconsGratuit: number;
  minutesGratuit: number;
}) {
  const c = copyV2(locale).programme;
  const [actif, setActif] = useState<Module | null>(null);
  const [fige, setFige] = useState<string | null>(null);
  const [grand, setGrand] = useState<Demo | null>(null);
  /**
   * L'étape dépliée, sous lg uniquement (Paul, 07/09 : « on devrait mettre
   * Getting started, Getting good et Putting it to work en dépliable ; si la
   * personne clique dessus ça déplie, sinon ne pas le faire »).
   *
   * ⚠️ Fermé au premier rendu, des deux côtés : la largeur ne se connaît pas
   * au rendu serveur, et un état initial qui en dépendrait donnerait une
   * hydratation qui ne colle pas. C'est le CSS qui rouvre tout dès lg.
   * Une seule à la fois, comme le repli des modules dans l'application.
   */
  const [deplie, setDeplie] = useState<string | null>(null);
  // ⚠️ Dans un effet, jamais au rendu : le serveur n'a pas de pointeur, et
  // un rendu qui en suppose un donne une hydratation qui ne colle pas.
  const [tactile, setTactile] = useState(false);
  useEffect(() => setTactile(pointeurGrossier()), []);
  const nbAuto = MODULES.filter((m) => m.palier === 'pro').length;

  const montre = (m: Module) => {
    if (!fige) setActif(m);
  };
  const cliquer = (m: Module) => {
    if (fige === m.id) {
      setFige(null);
    } else {
      setFige(m.id);
      setActif(m);
    }
  };

  const teintePalier: Record<Module['palier'], string> = {
    free: 'text-renard-texte bg-[rgba(217,116,63,.12)]',
    essentials: 'text-sauge bg-[rgba(46,125,91,.10)]',
    pro: 'text-avance-texte bg-[rgba(76,118,133,.13)]',
  };

  return (
    <section id="programme" className="scroll-mt-20 bg-craie px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or-grave">
          {c.kicker}
        </div>
        <h2 className="mt-3 max-w-[20ch] text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-encre">
          {c.titre}
        </h2>
        <p className="mt-4 max-w-[64ch] text-[17.5px] leading-[1.65] text-brume">
          {c.chapeau(modules, heures)}
        </p>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <div>
            {ETAPES.map((e) => {
              const mods = modulesDe(e.id);
              const ouverte = deplie === e.id;
              return (
                <div key={e.id} className="mb-9 last:mb-0">
                  {/* L'en-tête est un bouton sous lg, et rien du tout au-dessus :
                      `lg:pointer-events-none` le rend inerte plutôt que de rendre
                      deux balises différentes selon la largeur, ce que le rendu
                      serveur ne saurait pas trancher. */}
                  <button
                    type="button"
                    onClick={() => setDeplie(ouverte ? null : e.id)}
                    aria-expanded={ouverte}
                    aria-controls={`etape-${e.id}`}
                    className="-mx-1 flex w-full cursor-pointer items-baseline gap-3 rounded-[8px] border-0 bg-transparent px-1 py-1 text-left lg:pointer-events-none lg:m-0 lg:cursor-default lg:p-0"
                  >
                    <h3 className="m-0 font-ac-mono text-[13px] font-semibold uppercase tracking-[.14em] text-encre">
                      {e.titre[locale]}
                    </h3>
                    <span className="font-ac-mono text-[12px] text-brume">{e.jours[locale]}</span>
                    <span
                      className={`ml-auto self-center text-brume transition-transform duration-200 lg:hidden ${ouverte ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <p className="mb-2 mt-1 max-w-[62ch] text-[15.5px] leading-[1.6] text-brume">
                    {e.chapeau[locale]}
                  </p>
                  {/* Le compte et la durée restent visibles quand l'étape est
                      repliée : c'est ce qui garde la section informative même
                      fermée, et cette section n'existe que pour dire ce que la
                      formation contient. */}
                  <p className="mb-4 font-ac-mono text-[12.5px] text-brume lg:hidden">
                    {nombreSuivi(e.id)} modules · {duree(minutesDe(e.id), locale)}
                  </p>
                  <div
                    id={`etape-${e.id}`}
                    className={`grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 lg:grid ${ouverte ? 'grid' : 'hidden'}`}
                  >
                    {mods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onMouseEnter={() => montre(m)}
                        onFocus={() => montre(m)}
                        onClick={() => cliquer(m)}
                        style={{ ['--teinte' as string]: m.teinte }}
                        className={`flex min-h-[136px] cursor-pointer flex-col items-start gap-2.5 rounded-carte border bg-papier p-3.5 text-left transition duration-150 hover:-translate-y-[3px] hover:shadow-[0_8px_22px_rgba(15,26,46,.11)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          fige === m.id || actif?.id === m.id
                            ? 'border-[var(--teinte)] shadow-[0_8px_22px_rgba(15,26,46,.11)]'
                            : 'border-lin'
                        }`}
                      >
                        <span
                          className="grid h-9 w-9 place-items-center rounded-[11px]"
                          style={{
                            color: m.teinte,
                            background: `color-mix(in srgb, ${m.teinte} 12%, transparent)`,
                          }}
                        >
                          <Glyphe nom={m.glyphe} taille={20} />
                        </span>
                        <span className="text-[15px] font-medium leading-[1.35] text-encre">
                          {m.titre[locale]}
                        </span>
                        <span className="mt-auto flex flex-wrap items-center gap-2">
                          <span className="font-ac-mono text-[12px] text-brume">
                            {duree(m.minutes, locale)}
                          </span>
                          {m.palier !== 'essentials' && (
                            <span
                              className={`inline-block rounded-full px-2 py-1 font-ac-mono text-[10.5px] uppercase tracking-[.09em] ${teintePalier[m.palier]}`}
                            >
                              {c.paliers[m.palier]}
                            </span>
                          )}
                          {m.auChoix && (
                            <span className="font-ac-mono text-[10.5px] uppercase tracking-[.09em] text-brume">
                              {c.auChoix}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2.5 hidden font-ac-mono text-[12.5px] text-brume lg:block">
                    {nombreSuivi(e.id)} modules · {duree(minutesDe(e.id), locale)}
                  </p>
                </div>
              );
            })}
          </div>

          <aside
            className={`rounded-carte border border-lin bg-papier p-5 lg:sticky lg:top-24 lg:self-start lg:block ${
              actif ? "fixed inset-x-3 bottom-3 z-50 max-h-[72vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,.45)] lg:static lg:inset-auto lg:max-h-none lg:shadow-none" : "hidden lg:block"
            }`}
          >
            {actif && (
              <button
                type="button"
                onClick={() => {
                  setActif(null);
                  setFige(null);
                }}
                aria-label={c.fermer}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-lin text-brume lg:hidden"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
            {!actif ? (
              <div className="text-[14px] leading-[1.6] text-brume">
                <span className="mb-3 block text-lin">
                  <Glyphe nom="grid" taille={26} />
                </span>
                {tactile ? c.videTactile : c.vide}
              </div>
            ) : (
              <div>
                <span
                  className="mb-3.5 grid h-11 w-11 place-items-center rounded-xl"
                  style={{
                    color: actif.teinte,
                    background: `color-mix(in srgb, ${actif.teinte} 12%, transparent)`,
                  }}
                >
                  <Glyphe nom={actif.glyphe} taille={24} />
                </span>
                <span
                  className={`inline-block rounded-full px-2 py-1 font-ac-mono text-[10px] uppercase tracking-[.1em] ${teintePalier[actif.palier]}`}
                >
                  {c.paliersLong[actif.palier]}
                </span>
                <h4 className="mb-2 mt-2.5 text-[18px] font-medium leading-[1.25] text-encre">
                  {actif.titre[locale]}
                </h4>
                <p className="mb-3 text-[15px] leading-[1.6] text-[#41505f]">
                  {actif.texte[locale]}
                </p>
                <p className="mb-3.5 font-ac-mono text-[12px] text-brume">
                  {duree(actif.minutes, locale)} {c.deLecons}
                </p>
                {estDemo(actif.demo) && (
                  <button
                    type="button"
                    onClick={() => setGrand(actif.demo as Demo)}
                    className="block w-full cursor-pointer overflow-hidden rounded-[11px] border border-lin p-0 transition hover:border-brume"
                  >
                    <Boucle nom={actif.demo as Demo} className="aspect-[16/10]" vignette />
                    <span className="block bg-craie py-2 font-ac-mono text-[11px] uppercase tracking-[.1em] text-brume">
                      {c.voirEcran}
                    </span>
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>

        <p className="mt-7 max-w-[70ch] text-[16px] leading-[1.65] text-brume">
          {c.pied(leconsGratuit, minutesGratuit, nbAuto)}
        </p>
      </div>

      <Visionneuse
        nom={grand}
        titre={actif?.titre[locale] ?? ''}
        fermer={() => setGrand(null)}
        libelleFermer={copyV2(locale).pratique.fermer}
      />
    </section>
  );
}
