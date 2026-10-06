import { useEffect, useState } from 'react';
import { pointeurGrossier } from '../academy/motion';
import { trackProgrammeEtape } from '../academy/track';
import Glyphe from './Glyphe';
import { ETAPES, MODULES, type EtapeId, minutesDe, minutesDu, modulesDe, nombreSuivi, type Durees, type Module } from './modules';
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
  durees,
}: {
  locale: Locale;
  modules: number;
  heures: string;
  leconsGratuit: number;
  minutesGratuit: number;
  /** Les durées de chaque module, servies par l'app (25/09/2026). */
  durees?: Durees;
}) {
  /**
   * ⚠️ L'EN-TÊTE LIT L'API DEPUIS LE 15/09/2026, comme le hero et l'attestation.
   *
   * Le 08/09 il comptait `modules.ts`, parce que l'API ne portait alors que le
   * seul parcours vendu (« 16 modules, 12 h 28 ») face à des étapes qui en
   * additionnaient 20. Depuis le 09/09 l'API compte les deux programmes, module
   * Claude des automatisations compris, et la page affichait 20 ici et 21 plus
   * bas. Paul a tranché le 15/09 : « 21 partout ». Le module Claude est donc
   * aussi montré dans « Mettre en œuvre » (`M4C-auto`), et les étapes retombent
   * sur le même nombre de modules que cet en-tête.
   */

  const c = copyV2(locale).programme;
  const [actif, setActif] = useState<Module | null>(null);
  const [fige, setFige] = useState<string | null>(null);
  const [grand, setGrand] = useState<Demo | null>(null);
  // ⚠️ Dans un effet, jamais au rendu : le serveur n'a pas de pointeur, et
  // un rendu qui en suppose un donne une hydratation qui ne colle pas.
  const [tactile, setTactile] = useState(false);
  useEffect(() => setTactile(pointeurGrossier()), []);
  const nbAuto = MODULES.filter((m) => m.palier === 'pro').length;
  // Les étapes ouvertes. Toutes fermées au chargement ; plusieurs peuvent
  // être ouvertes à la fois, pour comparer deux étapes sans perdre la première.
  const [ouvertes, setOuvertes] = useState<EtapeId[]>([]);
  const basculer = (id: EtapeId) => {
    setOuvertes((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
    if (!ouvertes.includes(id)) trackProgrammeEtape(id);
  };

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
          {/* ⚠️ LES ÉTAPES SONT REPLIÉES depuis le 06/10/2026 (Paul : « on voit
              juste les trois sections, et quand les gens cliquent dessus, ça
              s'expand »). Les vingt-deux modules ouverts d'emblée (direction B
              du 13/09) faisaient 2 100 px sur bureau et 2 400 sur téléphone,
              et les tarifs n'arrivaient qu'au 22e écran du téléphone, pour
              26 s d'attention moyenne par visiteur.
              Fermée, une étape montre quand même ce qu'elle contient : la
              rangée des pictogrammes de ses modules. Les modules restent dans
              le HTML (Google lit le programme, le niveau de qualité de la page
              en dépend), seulement rendus inertes tant que l'étape est fermée. */}
          <div className="grid gap-3">
            {ETAPES.map((e) => {
              const mods = modulesDe(e.id);
              const ouverte = ouvertes.includes(e.id);
              const idListe = `programme-${e.id}`;
              const inerte = { inert: ouverte ? undefined : '' } as Record<string, string | undefined>;
              return (
                <div
                  key={e.id}
                  className={`rounded-[16px] border transition-colors duration-200 ${
                    ouverte ? 'border-lin bg-papier shadow-[0_10px_30px_rgba(15,26,46,.07)]' : 'border-lin bg-papier/60 hover:border-brume/50 hover:bg-papier'
                  }`}
                >
                  <h3 className="m-0 text-[length:inherit] font-normal">
                  <button
                    type="button"
                    onClick={() => basculer(e.id)}
                    aria-expanded={ouverte}
                    aria-controls={idListe}
                    className="group flex w-full cursor-pointer items-start gap-4 rounded-[16px] border-0 bg-transparent px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-5 sm:py-5"
                  >
                    <span className="min-w-0 flex-1">
                      {/* ⚠️ Le titre d'étape était en monospace, en capitales,
                          à 13 px (Paul, 13/09 : « ça fait très écrit tout petit
                          avec une police chelou en plus »). Il est rendu dans la
                          police de la page, à sa taille de sous-titre. Le
                          monospace ne sert plus QUE aux durées et aux comptes. */}
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-encre">
                          {e.titre[locale]}
                        </span>
                        <span className="text-[13.5px] text-brume">{e.jours[locale]}</span>
                        <span className="font-ac-mono text-[12px] text-brume sm:ml-auto">
                          {nombreSuivi(e.id)} modules · {duree(minutesDe(e.id, durees), locale)}
                        </span>
                      </span>
                      <span className="mt-1.5 block max-w-[62ch] text-[15.5px] leading-[1.6] text-brume">
                        {e.chapeau[locale]}
                      </span>
                      {/* L'aperçu de l'étape fermée : ses modules en
                          pictogrammes, dans leur teinte. Il s'efface quand la
                          liste s'ouvre, puisqu'elle les nomme. */}
                      <span
                        aria-hidden="true"
                        className={`flex flex-wrap items-center gap-1.5 overflow-hidden transition-all duration-300 ${
                          ouverte ? 'mt-0 max-h-0 opacity-0' : 'mt-3.5 max-h-24 opacity-100'
                        }`}
                      >
                        {mods.map((m) => (
                          <span
                            key={m.id}
                            className="grid h-[26px] w-[26px] place-items-center rounded-[8px]"
                            style={{ color: m.teinte, background: `color-mix(in srgb, ${m.teinte} 12%, transparent)` }}
                          >
                            <Glyphe nom={m.glyphe} taille={15} />
                          </span>
                        ))}
                        <span className="ml-1.5 text-[13.5px] font-medium text-encre underline decoration-lin underline-offset-4 group-hover:decoration-encre">
                          {c.voirModules}
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full border transition duration-300 ${
                        ouverte ? 'rotate-180 border-encre bg-encre text-papier' : 'border-lin text-encre group-hover:border-encre'
                      }`}
                      style={{ transitionTimingFunction: 'var(--ease-sortie)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  </h3>

                  {/* La hauteur s'anime de 0fr à 1fr : aucune hauteur écrite à
                      la main, la liste garde la sienne quelle que soit la
                      langue ou la largeur. */}
                  <div
                    id={idListe}
                    className="grid transition-[grid-template-rows] duration-500 motion-reduce:transition-none"
                    style={{ gridTemplateRows: ouverte ? '1fr' : '0fr', transitionTimingFunction: 'var(--ease-sortie)' }}
                    {...inerte}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="px-4 pb-3 sm:px-5">
                        {/* La consigne, au doigt seulement : sur grand écran le
                            panneau de droite la porte déjà. */}
                        <p className="m-0 mb-1 font-ac-mono text-[12px] leading-[1.5] text-or-grave lg:hidden">
                          {c.videTactile}
                        </p>
                        <ul className="m-0 list-none border-t border-lin p-0 pt-1">
                          {mods.map((m) => {
                            const on = fige === m.id || actif?.id === m.id;
                            return (
                              <li key={m.id} className="border-b border-lin last:border-b-0">
                                <button
                                  type="button"
                                  onMouseEnter={() => montre(m)}
                                  onFocus={() => montre(m)}
                                  onClick={() => cliquer(m)}
                                  aria-pressed={fige === m.id}
                                  className={`-mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-[10px] border-0 px-2 py-2.5 text-left transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                    on ? 'bg-craie' : 'bg-transparent hover:bg-craie'
                                  }`}
                                >
                                  <span
                                    className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px]"
                                    style={{
                                      color: m.teinte,
                                      background: `color-mix(in srgb, ${m.teinte} 12%, transparent)`,
                                    }}
                                  >
                                    <Glyphe nom={m.glyphe} taille={17} />
                                  </span>
                                  <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                    <span className="text-[15px] leading-[1.3] text-encre">
                                      {m.titre[locale]}
                                    </span>
                                    {m.auChoix && (
                                      <span className="text-[12.5px] text-brume">{c.auChoix}</span>
                                    )}
                                    {m.palier !== 'essentials' && (
                                      <span
                                        className={`inline-block rounded-full px-2 py-[2px] font-ac-mono text-[10px] uppercase tracking-[.08em] ${teintePalier[m.palier]}`}
                                      >
                                        {c.paliers[m.palier]}
                                      </span>
                                    )}
                                  </span>
                                  <span className="flex-none font-ac-mono text-[12px] text-brume">
                                    {duree(minutesDu(m, durees), locale)}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
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
                  {duree(minutesDu(actif, durees), locale)} {c.deLecons}
                </p>
                {estDemo(actif.demo) && (
                  <button
                    type="button"
                    onClick={() => setGrand(actif.demo as Demo)}
                    className="block w-full cursor-pointer overflow-hidden rounded-[11px] border border-lin p-0 transition hover:border-brume"
                  >
                    <Boucle nom={actif.demo as Demo} locale={locale} className="aspect-[16/10]" vignette />
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
        locale={locale}
        titre={actif?.titre[locale] ?? ''}
        fermer={() => setGrand(null)}
        libelleFermer={copyV2(locale).pratique.fermer}
      />
    </section>
  );
}
