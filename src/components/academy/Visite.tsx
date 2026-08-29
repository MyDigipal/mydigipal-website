import { useCallback, useEffect, useRef, useState } from 'react';
import { Affiche, Visionneuse, libelleDemo, useVisionneuse, type DemoKey } from './Demos';
import { jour30Copy } from './copy';
import type { Jour30Data, Locale } from './data';
import { nombreLocal } from './offres';
import { after, pointeurGrossier, probeClock, reducedMotion, typeText, type Arret } from './motion';
import { renardPoints } from './silhouette';

/**
 * La visite : l'espace apprenant reconstitué, et ce que chaque chose fait.
 *
 * Demande de Paul du 25/08/2026 : sous le hero, avant le récit des trente
 * jours, « une explication : qu'est-ce que vous allez avoir, qu'est-ce qui
 * est dans ce training, qu'est-ce qui le différencie ». Et que ce soit
 * interactif : on survole un élément de l'interface, il se décrit.
 *
 * Le parti pris, appris des fiches awesome-design-md (Linear, Raycast,
 * Stripe) : la page marketing, c'est le produit. Le tableau de bord est
 * REFAIT ici en HTML, fidèle à l'app dans sa salle de nuit, pas une capture
 * ni un faux écran : les mêmes surfaces, les mêmes libellés, les mêmes
 * chiffres (ceux du JSON de l'app).
 *
 * L'interaction : un panneau, à droite sur grand écran, sous le menu sur
 * mobile. Au repos il porte le pitch (ce qui distingue la formation). Au
 * survol ou à la touche d'un élément, il se décrit ; l'élément survolé prend
 * un filet d'or et le reste de l'écran s'assombrit un peu, comme un
 * projecteur. Sans survol, la visite se joue seule, un élément toutes les
 * quatre secondes, jusqu'au premier geste du visiteur. Pas de fenêtre qui
 * s'ouvre par-dessus : un panneau à position fixe se lit, une bulle qui
 * saute d'un point à l'autre se subit.
 *
 * ⚠️ La fiche RESTE (Paul, 29/08/2026) : elle ne change qu'au survol d'un
 * autre élément. Le panneau porte une affiche cliquable, donc la souris doit
 * pouvoir quitter la zone décrite pour venir la chercher. Tant que sortir de
 * l'écran remettait le pitch, l'affiche disparaissait au moment précis où on
 * allait la toucher.
 *
 * Deux moments jouent quelque chose : l'assistant (une question, une réponse
 * qui s'écrit, sa source) et les points (le compteur qui monte).
 */
type SpotId =
  | 'reprendre'
  | 'parcours1'
  | 'parcours2'
  | 'atelier'
  | 'prompts'
  | 'cas'
  | 'notes'
  | 'exercices'
  | 'assistant'
  | 'points'
  | 'profil';

const TOUR: SpotId[] = ['parcours1', 'parcours2', 'reprendre', 'atelier', 'prompts', 'assistant', 'exercices', 'points', 'cas', 'notes', 'profil'];

/**
 * L'écran filmé qui correspond à chaque zone (Paul, 29/08/2026 : « faut mapper
 * les endroits avec les vidéos que j'ai prises »).
 *
 * Le tableau de bord de cette section est REFAIT en HTML, fidèle mais recréé :
 * il montre la disposition, pas le produit qui tourne. L'enregistrement, lui,
 * montre le produit qui tourne. Les deux se complètent, et le lien entre eux
 * est ici, en un seul endroit, pour qu'un écran filmé de plus n'oblige pas à
 * fouiller le composant.
 *
 * `notes` n'a pas d'enregistrement : le carnet ne se démontre pas en dix
 * secondes, et une vidéo faible dessert plus qu'une absence.
 */
const VIDEO_DU_SPOT: Partial<Record<SpotId, DemoKey>> = {
  parcours1: 'programme',
  parcours2: 'avance',
  reprendre: 'programme',
  atelier: 'atelier',
  prompts: 'prompts',
  cas: 'cas',
  exercices: 'quiz',
  assistant: 'assistant',
  points: 'profil',
  profil: 'profil',
};

export default function Visite({ locale, data }: { locale: Locale; data: Jour30Data }) {
  const t = jour30Copy(locale);
  const c = t.visite;
  const [actif, setActif] = useState<SpotId | null>(null);
  const { ouvert, ouvrir, fermer } = useVisionneuse();
  const [touche, setTouche] = useState(false);
  // Au doigt, tout change : le verbe de la consigne, la visite qui se joue
  // seule, et le fait que la réponse ne soit pas à côté mais plus haut.
  const [tactile, setTactile] = useState(false);
  const panneau = useRef<HTMLElement>(null);
  const [reponse, setReponse] = useState('');
  const [pointsAffiches, setPointsAffiches] = useState(0);
  const arrets = useRef<Arret[]>([]);
  const reduce = useRef(false);

  // L'état montré : le jour 9 du récit (Méthode, série de neuf jours), pour
  // que les chiffres du faux tableau de bord soient ceux de la vraie grille.
  const etat = data.etats[Math.min(4, data.etats.length - 1)];
  const nombre = (n: number) => nombreLocal(n, locale);
  const lecons = data.faits.lessons;
  const faites = Math.round(lecons * 0.62);

  useEffect(() => setTactile(pointeurGrossier()), []);

  const stop = useCallback(() => {
    arrets.current.forEach((a) => a());
    arrets.current = [];
  }, []);

  // La visite automatique, jusqu'au premier geste — et jamais au doigt.
  //
  // ⚠️ Sur un téléphone, le panneau est AU-DESSUS de l'écran et sa hauteur
  // dépend de la fiche : elle passe de 130 px (« Vos notes ») à 358 px
  // (l'assistant, qui joue une conversation). Une fiche qui tourne toute seule
  // fait donc glisser le tableau de bord de deux cents pixels toutes les
  // quatre secondes, sous le doigt de quelqu'un qui vise une ligne. Et elle
  // décrit une zone qu'on ne voit pas en même temps qu'elle, donc elle
  // n'apprend rien. Au doigt, la page attend qu'on lui demande.
  useEffect(() => {
    let tour: Arret = () => {};
    const arretSonde = probeClock((alive) => {
      reduce.current = !alive || reducedMotion();
      if (reduce.current || touche || tactile) return;
      let i = 0;
      const suivant = () => {
        setActif(TOUR[i % TOUR.length]);
        i += 1;
        tour = after(4000, suivant);
      };
      tour = after(1500, suivant);
    });
    return () => {
      arretSonde();
      tour();
    };
  }, [touche, tactile]);

  // Les deux moments joués : la réponse de l'assistant, le compteur de points.
  useEffect(() => {
    stop();
    if (actif === 'assistant') {
      setReponse('');
      if (reduce.current) {
        setReponse(c.assistant.reponse);
      } else {
        arrets.current.push(after(500, () => arrets.current.push(typeText(c.assistant.reponse, 1800, setReponse))));
      }
    }
    if (actif === 'points') {
      if (reduce.current) setPointsAffiches(etat.points);
      else {
        const t0 = performance.now();
        let raf = 0;
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / 900);
          setPointsAffiches(Math.round(etat.points * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        arrets.current.push(() => cancelAnimationFrame(raf));
      }
    }
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actif]);

  const choisir = (id: SpotId) => {
    setTouche(true);
    setActif(id);
    // Au doigt seulement : la réponse est plus haut dans la page, et un
    // visiteur qui touche une ligne sans rien voir bouger croit que rien ne
    // s'est passé. La zone touchée garde son filet d'or, on la retrouve en
    // redescendant.
    if (tactile) panneau.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Un élément de l'interface qui sait se décrire. */
  const spot = (id: SpotId, extra = '') => ({
    'data-spot': id,
    tabIndex: 0,
    role: 'button' as const,
    'aria-pressed': actif === id,
    onMouseEnter: () => choisir(id),
    onFocus: () => choisir(id),
    onClick: () => choisir(id),
    className: `${extra} cursor-pointer rounded-carte outline-none transition-[opacity,box-shadow,transform] duration-300 ${
      actif === null ? '' : actif === id ? 'shadow-[0_0_0_1.5px_#c8a951,0_18px_40px_-24px_rgba(200,169,81,0.6)]' : 'opacity-[0.55]'
    }`,
  });

  const spots = c.spots(data.faits);
  const fiche = actif ? spots[actif] : null;
  const rubrique = 'font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.16em]';
  const carte = 'rounded-carte border border-filet-nuit bg-salle-2';

  return (
    <section id="visite" className="border-t border-filet-nuit px-4 pb-20 pt-[84px] sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="m-0 max-w-[22ch] text-balance text-[clamp(26px,3.8vw,42px)] font-medium leading-[1.12] tracking-[-0.025em] text-ivoire">
          {c.titre}
        </h2>
        <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.65] text-corps-nuit">{tactile ? c.sousTactile : c.sous}</p>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          {/* L'espace apprenant, refait. */}
          <div
            className="overflow-hidden rounded-[16px] border border-filet-nuit bg-salle shadow-[0_40px_80px_-50px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-4 border-b border-filet-nuit px-4 py-3 sm:px-6">
              <span className="font-ac-grotesk text-[13px] font-semibold tracking-[-0.01em] text-ivoire">
                mydigipal<span className="text-or">.</span>
                <span className="ml-1.5 font-ac-mono text-[8.5px] font-bold uppercase tracking-[0.2em] text-brume-nuit">academy</span>
              </span>
              <nav className="ml-auto hidden gap-5 font-ac-grotesk text-[12.5px] text-corps-nuit sm:flex" aria-hidden="true">
                {c.nav.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </nav>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-or bg-salle-2">
                <svg viewBox="0 0 100 100" width="14" height="14" aria-hidden="true">
                  <polygon points={renardPoints(etat.renard)} fill="#d9743f" />
                </svg>
              </span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 p-4 sm:p-6 min-[900px]:grid-cols-[minmax(0,1fr)_250px]">
              <div className="grid gap-4">
                <div>
                  <p className={`${rubrique} m-0 text-or`}>{c.bandeau.kicker}</p>
                  <p className="m-0 mt-1 font-ac-serif text-[24px] leading-[1.15] text-ivoire">{c.bandeau.titre}</p>
                  <p className="m-0 mt-1 text-[12.5px] text-brume-nuit">{c.bandeau.ligne}</p>
                </div>

                <div {...spot('parcours1', `${carte} p-4`)}>
                  <p className={`${rubrique} m-0 text-brume-nuit`}>{c.cartes.kicker}</p>
                  <p className="m-0 mt-1.5 font-ac-serif text-[18px] leading-[1.2] text-ivoire">{c.cartes.p1.titre}</p>
                  <p className="m-0 mt-1 text-[12.5px] text-brume-nuit">{c.cartes.p1.ligne}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-1 flex-1 overflow-hidden rounded-[2px] bg-filet-nuit">
                      <span className="block h-full bg-or" style={{ width: '62%' }} />
                    </span>
                    <span className="font-ac-mono text-[11px] text-corps-nuit">62 %</span>
                  </div>
                  <p className="m-0 mt-1.5 font-ac-mono text-[10.5px] text-brume-nuit">{c.cartes.p1.avancement(faites, lecons)}</p>
                  <span className="mt-3 inline-flex rounded-bouton bg-or px-3.5 py-1.5 text-[12px] font-semibold text-salle">{c.cartes.reprendre}</span>
                </div>

                <div {...spot('parcours2', `${carte} p-4`)}>
                  <p className={`${rubrique} m-0 text-brume-nuit`}>{c.cartes.kicker}</p>
                  <p className="m-0 mt-1.5 font-ac-serif text-[18px] leading-[1.2] text-ivoire">{c.cartes.p2.titre}</p>
                  <p className="m-0 mt-1 text-[12.5px] text-brume-nuit">{c.cartes.p2.ligne}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-1 flex-1 overflow-hidden rounded-[2px] bg-filet-nuit">
                      <span className="block h-full bg-or" style={{ width: '12%' }} />
                    </span>
                    <span className="font-ac-mono text-[11px] text-corps-nuit">12 %</span>
                  </div>
                  <p className="m-0 mt-1.5 font-ac-mono text-[10.5px] text-brume-nuit">{c.cartes.p2.avancement(6, data.faits.lessonsConstruire)}</p>
                  <span className="mt-3 inline-flex rounded-bouton border border-filet-nuit px-3.5 py-1.5 text-[12px] font-semibold text-corps-nuit">{c.cartes.continuer}</span>
                </div>
              </div>

              <div className="grid content-start gap-4">
                <div {...spot('reprendre', `${carte} border-or/25 p-4`)}>
                  <p className="m-0 font-ac-serif text-[15px] text-ivoire">{c.rail.reprendreTitre}</p>
                  <p className={`${rubrique} m-0 mt-2 text-or`}>{c.cartes.p1.titre}</p>
                  <p className="m-0 mt-1 text-[12.5px] leading-snug text-corps-nuit">{c.rail.lecon}</p>
                  <p className="m-0 mt-0.5 font-ac-mono text-[10.5px] text-brume-nuit">{c.rail.reste}</p>
                  <span className="mt-3 flex w-full items-center justify-center rounded-bouton bg-or px-3 py-1.5 text-[12px] font-semibold text-salle">{c.rail.continuer}</span>
                </div>

                <div className={`${carte} py-3`}>
                  <p className="m-0 px-4 font-ac-serif text-[15px] text-ivoire">{c.rail.accesTitre}</p>
                  <div className="mt-1.5 grid">
                    {(
                      [
                        ['atelier', c.rail.acces.atelier],
                        ['prompts', c.rail.acces.prompts],
                        ['cas', c.rail.acces.cas],
                        ['notes', c.rail.acces.notes],
                        ['exercices', c.rail.acces.exercices],
                        ['assistant', c.rail.acces.assistant],
                        ['profil', c.rail.acces.profil],
                      ] as Array<[SpotId, string]>
                    ).map(([id, label]) => (
                      <div key={id} {...spot(id, 'flex items-center gap-2.5 !rounded-none px-4 py-[7px] text-[12.5px] text-corps-nuit max-lg:min-h-11')}>
                        <span className="h-1.5 w-1.5 rounded-full bg-or/70" aria-hidden="true" />
                        <span className="flex-1">{label}</span>
                        <span className="font-ac-mono text-[10px] text-brume-nuit" aria-hidden="true">
                          ›
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div {...spot('points', `${carte} p-4`)}>
                  <p className="m-0 font-ac-serif text-[15px] text-ivoire">{c.rail.activiteTitre}</p>
                  <dl className="m-0 mt-2.5 grid gap-2 text-[12.5px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-brume-nuit">{t.compte.rail.points}</dt>
                      <dd className="m-0 font-ac-mono text-ivoire">
                        {nombre(etat.points)} <span className="text-[10px] text-or">{data.jeu.rangs[etat.rank]}</span>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-brume-nuit">{t.compte.rail.serie}</dt>
                      <dd className="m-0 font-ac-mono text-ivoire">{etat.serie}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-brume-nuit">{c.rail.lecons}</dt>
                      <dd className="m-0 font-ac-mono text-ivoire">
                        {faites} / {lecons}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          {/* Le panneau : sous le menu sur mobile, à droite sur grand écran. Il
              vient APRÈS l'écran dans le DOM : à ordre égal c'est l'ordre du DOM qui
              place dans la grille, et un `order-first` sans borne l'envoyait dans la
              colonne de gauche à 1 280 px (le même piège que le rail, la veille). */}
          {/* Venir dans le panneau arrête la visite automatique sans toucher à la
              fiche : sinon elle changeait sous le curseur au moment où on tendait
              la main vers le bouton de lecture. */}
          <aside
            ref={panneau}
            className="sticky top-18 z-20 scroll-mt-[76px] max-lg:order-first lg:top-24"
            aria-live="polite"
            onMouseEnter={() => setTouche(true)}
          >
            <div className={`${carte} border-or/[0.28] p-5 lg:p-6`}>
              <div key={actif || 'pitch'} className="j30-panneau">
                {fiche ? (
                  <>
                    <p className={`${rubrique} m-0 text-or`}>{fiche.kicker}</p>
                    <p className="m-0 mt-2 text-[18px] font-medium leading-[1.3] text-ivoire">{fiche.titre}</p>
                    <p className="m-0 mt-3 text-[14.5px] leading-[1.65] text-corps-nuit">{fiche.texte}</p>
                    {actif === 'assistant' && (
                      <div className="mt-4 grid gap-2">
                        <div className="max-w-[92%] justify-self-end rounded-[12px_12px_4px_12px] bg-salle-3 px-3.5 py-2.5 text-[13px] leading-[1.5] text-ivoire">
                          {c.assistant.question}
                        </div>
                        <div className="max-w-[96%] rounded-[12px_12px_12px_4px] border border-filet-nuit bg-salle px-3.5 py-2.5">
                          <p className="m-0 min-h-[3.2em] text-[13px] leading-[1.55] text-corps-nuit">
                            {reponse}
                            {!reduce.current && reponse.length < c.assistant.reponse.length && (
                              <span className="prompt-card__caret ml-0.5 !h-3 !w-1.5" aria-hidden="true" />
                            )}
                          </p>
                          <p className="m-0 mt-2 font-ac-mono text-[10.5px] text-brume-nuit">{c.assistant.source}</p>
                        </div>
                      </div>
                    )}
                    {actif === 'points' && (
                      <p className="m-0 mt-4 font-ac-mono text-[34px] font-bold leading-none tabular-nums text-or">
                        {nombre(pointsAffiches)} <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-brume-nuit">{t.compte.rail.points}</span>
                      </p>
                    )}
                    {/* L'affiche vient en dernier : ce qui se joue (la réponse
                        de l'assistant, le compteur qui monte) reste collé au
                        texte qui l'annonce. Un clic ouvre la vidéo en grand.

                        ⚠️ Rien sous lg : ce sont des captures d'une interface
                        d'ORDINATEUR, illisibles à 350 px de large, et les
                        agrandir sur un téléphone ne les rend pas plus lisibles.
                        Même raison que la galerie du bas de page. */}
                    {actif && VIDEO_DU_SPOT[actif] && (
                      <div className="max-lg:hidden">
                        <Affiche
                          nom={VIDEO_DU_SPOT[actif]!}
                          titre={libelleDemo(VIDEO_DU_SPOT[actif]!, locale)}
                          legende={c.voirLecran}
                          onOuvrir={ouvrir}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className={`${rubrique} m-0 text-or`}>{c.pitch.kicker}</p>
                    <p className="m-0 mt-2 text-[18px] font-medium leading-[1.3] text-ivoire">{c.pitch.titre}</p>
                    <ul className="m-0 mt-3 grid list-none gap-2 p-0">
                      {c.pitch.points.map((p) => (
                        <li key={p} className="flex gap-2.5 text-[14.5px] leading-[1.55] text-corps-nuit">
                          <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-or" aria-hidden="true" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="m-0 mt-4 font-ac-mono text-[11px] text-brume-nuit">{tactile ? c.pitch.indiceTactile : c.pitch.indice}</p>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {ouvert && <Visionneuse nom={ouvert} titre={libelleDemo(ouvert, locale)} onClose={fermer} />}
    </section>
  
  );
}
