import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { jour30Copy, type Jour30Copy } from './copy';
import { nombreLocal } from './offres';
import type { EtatJour, Jour30Data, Locale, Metal, RankKey, Avis } from './data';
import { JOURS_CALENDRIER, METAL_HEX, renardPoints } from './silhouette';
import {
  after,
  ease,
  onEnter,
  probeClock,
  reducedMotion,
  rescueLoop,
  revealOnEnter,
  tween,
  typeText,
  type Arret,
} from './motion';

export interface FaitsCompte {
  lessons: number;
  prompts: number;
  trophees: number;
  secrets: number;
  relectures: number;
}

interface Props {
  /** La note publique et le nombre de retours, servis par l'app. */
  avis: Avis;
  locale: Locale;
  etats: EtatJour[];
  faits: FaitsCompte;
  jeu: Jour30Data['jeu'];
}

const RUBRIQUE = 'font-ac-mono text-[11px] font-bold uppercase tracking-[0.18em]';
const PANNEAU = 'rounded-carte border border-filet-nuit bg-salle-2';

/**
 * Le compte, jour par jour. Chrome d'application : la colonne de gauche est le
 * temps, le rail de droite est le jeu, collant pendant tout le défilement.
 * Chaque jour montré est une surface DIFFÉRENTE du produit, recréée depuis le
 * code : jamais un faux écran dessiné en div, jamais deux fois la même forme.
 *
 * Le rail se pilote à la POSITION, pas à l'événement : un écouteur de
 * défilement passif, limité à une image par trame, lit les positions réelles à
 * chaque appel. Rien n'est mis en cache : les images en chargement paresseux
 * allongent le document après coup, et un cache posé avant elles décalait le
 * rail d'un jour entier. Le rail est écrit directement dans le DOM, hors de
 * React : il change à chaque image de défilement, un rendu par jour serait du
 * gaspillage.
 */
export default function LeCompte({ locale, etats, faits, jeu, avis }: Props) {
  const { rangs, metaux, trophees: tropheeNoms, points: POINTS, metalPoints: METAL_POINTS, modulesADebloquer: MODULES_A_DEBLOQUER } = jeu;
  const t = jour30Copy(locale);
  const c = t.compte;
  const nombre = useCallback((n: number) => nombreLocal(n, locale), [locale]);
  const col = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  // Le rail est doublé : la colonne de droite dès lg, une barre collante en
  // haut de la colonne en dessous. Les deux jeux d'éléments reçoivent les
  // mêmes écritures. Sur le site, le header (72 px, `h-18`) reste fixe en
  // haut : les deux se calent SOUS lui (`top-24`, `top-18`), sinon il les
  // recouvre (vu par Paul le 25/08 sur /en/academy).
  const pts = useRef<HTMLElement[]>([]);
  const rank = useRef<HTMLElement[]>([]);
  const bar = useRef<HTMLElement[]>([]);
  const next = useRef<HTMLElement[]>([]);
  const streak = useRef<HTMLElement[]>([]);
  const jokers = useRef<HTMLElement[]>([]);
  const ring = useRef<HTMLElement[]>([]);
  const fox = useRef<SVGPolygonElement[]>([]);
  const cells = useRef<HTMLElement[]>([]);
  const unlockRows = useRef<HTMLElement[]>([]);
  const unlockVals = useRef<HTMLElement[]>([]);
  const collect =
    <T extends Element>(list: React.MutableRefObject<T[]>) =>
    (n: T | null) => {
      if (n && !list.current.includes(n)) list.current.push(n);
    };

  const aside = useRef<HTMLElement>(null);
  const barre = useRef<HTMLDivElement>(null);
  const shownPts = useRef(0);
  const lastIdx = useRef<number | undefined>(undefined);
  const tweenStop = useRef<Arret | null>(null);
  const reduce = useRef(false);

  const apply = useCallback(
    (st: EtatJour, animate: boolean) => {
      const texte = (els: HTMLElement[], t: string) => els.forEach((e) => (e.textContent = t));
      if (animate && !reduce.current) {
        tweenStop.current?.();
        tweenStop.current = tween({
          from: shownPts.current,
          to: st.points,
          ms: 700,
          ease: ease.power2Out,
          onUpdate: (v) => texte(pts.current, nombre(v)),
        });
      } else texte(pts.current, nombre(st.points));
      shownPts.current = st.points;

      texte(rank.current, rangs[st.rank]);
      bar.current.forEach((b) => (b.style.width = `${Math.round(st.progress * 100)}%`));
      texte(next.current, st.manque !== null && st.nextRank ? c.rail.avant(nombre(st.manque), rangs[st.nextRank]) : c.rail.dernier);
      texte(streak.current, String(st.serie));
      texte(
        jokers.current,
        st.jokers > 0 ? c.rail.jokers(st.jokers) : st.serie ? c.rail.aucunJoker : c.rail.aucuneSerie
      );
      ring.current.forEach((r) => (r.style.borderColor = st.metal ? METAL_HEX[st.metal] : 'var(--v-filet-salle)'));
      fox.current.forEach((f) => f.setAttribute('points', renardPoints(st.renard)));
      cells.current.forEach((cell, i) => {
        const on = i < st.serie;
        cell.style.background = on ? 'var(--color-or)' : 'var(--v-salle-3)';
        cell.style.opacity = on ? (i % 4 === 0 ? '1' : i % 3 === 0 ? '.75' : '.5') : '1';
      });
      MODULES_A_DEBLOQUER.forEach((m, i) => {
        const ok = st.points >= m.unlock_points;
        const row = unlockRows.current[i];
        const val = unlockVals.current[i];
        if (row) row.style.color = ok ? 'var(--v-fort)' : 'var(--v-mute)';
        if (val) {
          val.textContent = ok ? c.rail.debloque : c.rail.pts(nombre(m.unlock_points));
          val.style.color = ok ? 'var(--color-or)' : 'inherit';
        }
      });
    },
    [c, rangs, nombre, MODULES_A_DEBLOQUER]
  );

  const sync = useCallback(() => {
    const column = col.current;
    if (!column) return;
    const days = Array.from(column.querySelectorAll<HTMLElement>('.j30-day'));
    if (!days.length) return;
    const vh = window.innerHeight;
    const line = vh * 0.72;
    let idx = 0;
    for (let i = 0; i < days.length; i += 1) if (days[i].getBoundingClientRect().top < line) idx = i;
    if (idx !== lastIdx.current) {
      const animate = lastIdx.current !== undefined && Math.abs(idx - lastIdx.current) === 1;
      lastIdx.current = idx;
      apply(etats[Math.min(idx, etats.length - 1)], animate);
    }
    // Le trait d'or du rail suit le défilement : de « haut de colonne à 60 % »
    // à « bas de colonne à 70 % », comme le scrub du prototype.
    if (rail.current) {
      const r = column.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / Math.max(1, r.height - vh * 0.1)));
      rail.current.style.height = `${p * 100}%`;
    }
  }, [apply, etats]);

  /**
   * La traversée : à chaque frontière de niveau, le renard part du bord gauche
   * et longe le filet jusqu'au bord droit, en 1 400 ms, en se transformant de
   * la forme qu'il avait au dernier jour du niveau à celle du premier jour du
   * suivant. Le filet s'allume d'or derrière lui, comme le trait du rail. C'est
   * ce qui se passe ENTRE deux sections, et c'est ce que Paul demandait : un
   * renard qui accompagne le parcours, pas une image collée. Une seule fois.
   */
  const traverser = useCallback((el: HTMLElement, immediat = false) => {
    if (el.dataset.traverse) return;
    el.dataset.traverse = '1';
    const renard = el.querySelector<HTMLElement>('.j30-renard');
    const poly = el.querySelector<SVGPolygonElement>('.j30-renard polygon');
    const trace = el.querySelector<HTMLElement>('.j30-trace');
    const de = Number(el.dataset.de || 0);
    const a = Number(el.dataset.a || de);
    const poser = (p: number) => {
      const largeur = Math.max(0, el.clientWidth - 44);
      if (renard) renard.style.transform = `translateX(${(p * largeur).toFixed(1)}px)`;
      if (poly) poly.setAttribute('points', renardPoints(de + (a - de) * p));
      if (trace) trace.style.width = `${(p * 100).toFixed(2)}%`;
    };
    if (immediat) {
      poser(1);
      return;
    }
    tween({ from: 0, to: 1, ms: 1400, ease: ease.power2InOut, onUpdate: poser });
  }, []);

  useEffect(() => {
    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        sync();
      });
    };
    const onResize = () => {
      lastIdx.current = undefined;
      sync();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    sync();

    // La barre collante ne sert qu'une fois les cartes du rail sorties de
    // l'écran : juste sous elles, elle répéterait ce qu'on vient de lire.
    let ioBarre: IntersectionObserver | null = null;
    if (aside.current && barre.current && 'IntersectionObserver' in window) {
      ioBarre = new IntersectionObserver(
        (es) => {
          const visible = es.some((e) => e.isIntersecting);
          if (barre.current) {
            barre.current.style.opacity = visible ? '0' : '1';
            barre.current.style.pointerEvents = visible ? 'none' : '';
          }
        },
        { threshold: 0 }
      );
      ioBarre.observe(aside.current);
    }

    let arrets: Arret[] = [];
    probeClock((alive) => {
      reduce.current = !alive || reducedMotion();
      if (!col.current) return;
      const column = col.current;
      if (reduce.current) {
        // Sans mouvement, le renard a déjà traversé : il attend au bout de la ligne.
        column.querySelectorAll<HTMLElement>('.j30-frontier').forEach((el) => traverser(el, true));
        return;
      }
      column.querySelectorAll<HTMLElement>('.j30-day').forEach((el) => arrets.push(revealOnEnter(el, 'j30-pre-day', 'j30-in-day', 0.8)));
      column.querySelectorAll<HTMLElement>('.j30-frontier h2').forEach((el) => arrets.push(revealOnEnter(el, 'j30-pre-titre', 'j30-in-titre', 0.82)));
      column.querySelectorAll<HTMLElement>('.j30-chute').forEach((el) => arrets.push(revealOnEnter(el, 'j30-pre-chute', 'j30-in-chute', 0.82)));
      column.querySelectorAll<HTMLElement>('.j30-frontier').forEach((el) => arrets.push(onEnter(el, () => traverser(el), '-25%')));
      arrets.push(
        rescueLoop([
          ['j30-pre-day', 'j30-in-day'],
          ['j30-pre-titre', 'j30-in-titre'],
          ['j30-pre-chute', 'j30-in-chute'],
        ])
      );
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ioBarre?.disconnect();
      tweenStop.current?.();
      arrets.forEach((a) => a());
      arrets = [];
    };
  }, [sync, traverser]);

  const premier = etats[0];
  const [n1, n2, n3] = c.niveaux;
  const trophee = (key: string, metal: Metal) => ({
    nom: tropheeNoms[key] || key,
    metal: metaux[metal].toLowerCase(),
    pts: METAL_POINTS[metal],
  });

  return (
    <section id="compte" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div ref={col} className="relative pb-10 pt-4 lg:pt-[72px]">
          {/* La barre collante, sous lg seulement : avatar, points, série. */}
          <div
            ref={barre}
            className="sticky top-18 z-20 -mx-4 mb-6 flex items-center gap-3 border-b border-filet-nuit bg-salle/95 px-4 py-2.5 backdrop-blur transition-opacity duration-300 sm:-mx-6 sm:px-6 lg:hidden"
            style={{ opacity: 0, pointerEvents: 'none' }}
          >
            <span ref={collect(ring)} className="flex h-9 w-9 flex-none items-center justify-center rounded-full border-2 border-filet-nuit bg-salle">
              <svg viewBox="0 0 100 100" width="20" height="20" aria-hidden="true">
                <polygon ref={collect(fox)} points={renardPoints(premier.renard)} fill="#d9743f" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-ivoire">{c.rail.nom}</span>
              <span ref={collect(rank)} className="block font-ac-mono text-[10px] font-bold uppercase tracking-[0.12em] text-or">
                {rangs[premier.rank]}
              </span>
            </span>
            <span className="text-right">
              <span ref={collect(pts)} className="block font-ac-mono text-[18px] font-bold tabular-nums leading-none text-ivoire">
                {nombre(premier.points)}
              </span>
              <span className="block font-ac-mono text-[10px] uppercase tracking-[0.14em] text-brume-nuit">{c.rail.points}</span>
            </span>
          </div>

          <div className="absolute bottom-0 left-0 top-0 hidden w-px bg-filet-nuit lg:block" aria-hidden="true" />
          <div
            ref={rail}
            className="absolute left-0 top-0 hidden w-px lg:block"
            style={{ height: '0%', background: 'linear-gradient(180deg,#c8a951,rgba(200,169,81,.25))' }}
            aria-hidden="true"
          />

          <p id="niveau-1" className="m-0 mb-2 scroll-mt-24 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brume-nuit lg:ml-7">
            {n1.kicker} · {n1.nom}
          </p>
          {/* Clara est nommée soixante fois dans ce récit et on ne la voyait
              jamais. Un seul portrait, ici, à l'ouverture du premier niveau :
              le personnage s'installe et les trente jours qui suivent ont un
              visage. Pas d'autre portrait plus bas — il en faudrait un par
              niveau, et le récit deviendrait un album.

              ⚠️ Le ruban juste au-dessus dit que Clara est composée. Ce visage
              est généré : il illustre un personnage annoncé comme tel, il ne
              témoigne pas. Ne jamais lui accoler une citation. */}
          <div className="mb-11 grid grid-cols-[minmax(0,1fr)] items-center gap-6 lg:ml-7 lg:grid-cols-[minmax(0,1fr)_200px]">
            <h2 className="m-0 max-w-[20ch] text-[clamp(24px,3.4vw,34px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">
              {n1.titre}
            </h2>
            {/* Deux cadrages plutôt qu'un masquage : au téléphone, un portrait
                4:5 coûterait deux cent cinquante pixels de hauteur sur une page
                qui en fait déjà vingt et un mille, et Clara resterait sans
                visage là où on vend le plus. Le 16:9 tient en cent quatre-vingts
                pixels, et `objectPosition` garde le regard dans le cadre. */}
            <figure className="m-0 aspect-[16/9] overflow-hidden rounded-carte border border-filet-nuit bg-encre lg:aspect-[4/5]">
              <img
                src="/academy/visuels/apprenante-regard_4-5.jpg"
                alt={c.claraAlt}
                width={900}
                height={1124}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
                style={{ objectPosition: '50% 32%' }}
              />
            </figure>
          </div>

          <Jour n={1} label={c.jour(1)} phrase={c.j1.phrase} note={c.j1.note}>
            {/* La scène de la rencontre, à la place du lecteur vide qui attendait
                la vidéo d'accueil (Paul, 30/08/2026). Pas de bouton de lecture
                par-dessus : il ne lancerait rien, et l'image en porte déjà un,
                sur la carte « Welcome video » qu'elle montre.

                ⚠️ Le visage à gauche est généré, ce n'est pas celui de Paul
                André. La page le nomme plus bas, avec de vraies photos de
                sessions : ces deux endroits ne montrent pas le même homme. */}
            <figure className="m-0 max-w-[620px] overflow-hidden rounded-carte border border-filet-nuit bg-encre shadow-[0_22px_48px_-30px_rgba(0,0,0,0.9)]">
              <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#c8a951,#dcbc66)' }} />
              <div className="relative aspect-video">
                <img
                  src="/academy/visuels/rencontre_jour1.jpg"
                  alt={c.j1.alt}
                  width={1400}
                  height={788}
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full object-cover"
                />
              </div>
              <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-filet-nuit px-4 py-2.5">
                <span className="font-ac-mono text-[10.5px] uppercase tracking-[0.16em] text-or">{c.j1.badge}</span>
                <span className="font-ac-mono text-[10.5px] tracking-[0.06em] text-brume-nuit">{c.j1.attente}</span>
              </figcaption>
            </figure>
          </Jour>

          <Jour n={2} label={c.jour(2)} phrase={c.j2.phrase}>
            <AnimationCraft lessons={faits.lessons} c={c.j2} locale={locale} pointsLecon={POINTS.lesson} />
          </Jour>

          <Jour n={3} label={c.jour(3)} phrase={c.j3.phrase} note={c.j3.note}>
            <div className={`${PANNEAU} max-w-[600px] px-6 py-[22px]`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2.5">
                <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brume-nuit">{c.j3.kicker}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.j3.fichiers.map((f) => (
                  <span key={f} className="flex items-center gap-2 rounded-[8px] border border-filet-nuit bg-salle px-3 py-[7px] font-ac-mono text-[11.5px] text-corps-nuit">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#c8a951" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <path d="M14 3v5h5" />
                    </svg>
                    {f}
                  </span>
                ))}
                <span className="self-center font-ac-mono text-[11px] text-brume-nuit">{c.j3.fournis}</span>
              </div>
              <div className="mt-4 grid gap-2.5">
                {[c.j3.tache, c.j3.prompt, c.j3.obtenu].map((r, i) => (
                  <div key={r.label} className={i < 2 ? 'border-b border-filet-nuit pb-[9px]' : ''}>
                    <span className="mb-[5px] block font-ac-mono text-[10.5px] uppercase tracking-[0.14em] text-brume-nuit">{r.label}</span>
                    <span className={i === 1 ? 'font-ac-mono text-[12.5px] leading-[1.6] text-corps-nuit' : `text-[14px] ${i === 0 ? 'text-ivoire' : 'text-corps-nuit'}`}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-[18px] flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-or/30 bg-or/[0.12] px-[13px] py-[5px] font-ac-mono text-[11px] font-bold uppercase tracking-[0.06em] text-or">
                  {c.j3.attente}
                </span>
                <span className="font-ac-mono text-[12px] text-brume-nuit">{c.j3.pts(POINTS.submission)}</span>
              </div>
            </div>
          </Jour>

          <Jour n={6} label={c.jour(6)} phrase={c.j6.phrase} note={c.j6.note}>
            <div className={`${PANNEAU} flex max-w-[560px] flex-wrap items-center gap-[18px] !rounded-full py-3 pl-3.5 pr-[22px]`}>
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-or/45 bg-or/[0.12] text-or">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <div className="min-w-[180px] flex-[1_1_220px]">
                <p className="m-0 mb-[7px] text-[13.5px] text-ivoire">{c.j6.titre}</p>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-or" />
                  ))}
                  <span className="ml-2 font-ac-mono text-[11px] text-brume-nuit">{c.j6.score(5, 5)}</span>
                </div>
              </div>
              <span className="font-ac-mono text-[11px] font-bold uppercase tracking-[0.06em] text-or">{c.j6.sansFaute}</span>
            </div>
            <p className="m-0 mt-3 font-ac-mono text-[12px] text-brume-nuit">{c.j6.pts(POINTS.quiz, POINTS.quiz_perfect_first)}</p>
          </Jour>

          <Jour n={9} label={c.jour(9)} phrase={c.j9.phrase} note={c.j9.note} dernier>
            <ChoixOutil c={c.j9} />
          </Jour>

          {/* L'interruption de preuve, en négatif dans la colonne : le retour de
              Paul appelle la question « qui est ce Paul ». Pas de bandeau de
              logos ici. */}
          <div className="relative -mx-4 mb-14 border-y border-filet-nuit bg-profond px-4 py-7 sm:-mx-6 sm:px-6 lg:-ml-6 lg:mr-0 lg:w-[calc(100%+48px)] lg:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <p className="m-0 text-[17px] font-medium text-ivoire">{c.preuve.question}</p>
                <p className="m-0 mt-2 max-w-[56ch] text-[14.5px] leading-[1.65] text-corps-nuit">{c.preuve.texte}</p>
              </div>
              <div className="flex gap-8">
                {c.preuve.chiffres(avis).map((k) => (
                  <span key={k.libelle}>
                    <b className="block font-ac-mono text-[26px] font-bold leading-none text-or">{k.valeur}</b>
                    <span className="text-[12.5px] text-brume-nuit">{k.libelle}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Frontiere id="niveau-2" kicker={n2.kicker} nom={n2.nom} titre={n2.titre} de={etats[4].renard} a={etats[5].renard} />

          <Jour n={11} label={c.jour(11)} phrase={c.j11.phrase} note={c.j11.note}>
            <div className="grid max-w-[640px] gap-3">
              <div className="max-w-[80%] justify-self-end rounded-[14px_14px_4px_14px] bg-salle-3 px-[18px] py-3.5">
                <p className="m-0 text-[14.5px] leading-[1.6] text-ivoire">{c.j11.question}</p>
              </div>
              <div className="max-w-[88%] rounded-[14px_14px_14px_4px] border border-filet-nuit bg-salle-2 px-[18px] py-4">
                <p className="m-0 text-[14.5px] leading-[1.7] text-corps-nuit">{c.j11.reponse}</p>
                <p className="m-0 mt-3 font-ac-mono text-[11px] text-brume-nuit">{c.j11.source}</p>
              </div>
            </div>
          </Jour>

          <Jour n={14} label={c.jour(14)} phrase={c.j14.phrase} note={c.j14.note(faits.trophees, faits.secrets)}>
            {(() => {
              const t = trophee('le-marathon', 'argent');
              return (
                <div className="j30-chute inline-flex max-w-full items-center gap-4 rounded-carte border border-or/35 bg-salle-2 px-[22px] py-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-argent font-ac-mono text-[11px] font-bold text-argent">
                    Ag
                  </span>
                  <div>
                    <p className="m-0 text-[16px] text-ivoire">{t.nom}</p>
                    <p className="m-0 mt-[3px] font-ac-mono text-[11px] text-brume-nuit">{c.j14.meta(t.metal, t.pts)}</p>
                  </div>
                </div>
              );
            })()}
          </Jour>

          <Jour n={17} label={c.jour(17)} phrase={c.j17.phrase}>
            <div className={`${PANNEAU} max-w-[640px] overflow-hidden`}>
              <div className="flex flex-wrap gap-2 border-b border-filet-nuit px-[18px] py-3.5">
                <span className="rounded-full bg-salle-3 px-[13px] py-[5px] text-[12.5px] text-ivoire">{c.j17.tous(faits.prompts)}</span>
                {c.j17.onglets.map((o) => (
                  <span key={o} className="rounded-full border border-filet-nuit px-[13px] py-[5px] text-[12.5px] text-brume-nuit">
                    {o}
                  </span>
                ))}
              </div>
              {c.j17.lignes.map((l) => (
                <div key={l} className="flex justify-between gap-4 border-b border-filet-nuit px-[18px] py-[13px]">
                  <span className="text-[14px] text-corps-nuit">{l}</span>
                  <span className="font-ac-mono text-[11px] text-brume-nuit">{c.j17.copier}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4 bg-or/[0.07] px-[18px] py-[13px]">
                <span className="text-[14px] text-ivoire">
                  {c.j17.lesien.texte}
                  <span className="ml-2 font-ac-mono text-[10.5px] uppercase tracking-[0.08em] text-or">{c.j17.lesien.tag}</span>
                </span>
                <span className="font-ac-mono text-[11px] text-or">{c.j17.copier}</span>
              </div>
            </div>
          </Jour>

          <Jour n={19} label={c.jour(19)} phrase={c.j19.phrase} note={c.j19.note} dernier>
            <Comparateur c={c.j19} />
          </Jour>

          <Frontiere id="niveau-3" kicker={n3.kicker} nom={n3.nom} titre={n3.titre} de={etats[8].renard} a={etats[9].renard} />

          <Jour n={22} label={c.jour(22)} phrase={c.j22.phrase} note={c.j22.note}>
            <div className="relative max-w-[560px] overflow-hidden rounded-carte border border-filet-nuit bg-encre">
              <img
                src="/academy/references/session-la-poste.jpg"
                alt={c.j22.alt}
                loading="lazy"
                width={1400}
                height={933}
                className="block h-auto w-full object-cover"
                style={{ aspectRatio: '1400/933', filter: 'saturate(.8) brightness(.85)' }}
              />
              <span className="absolute left-3.5 top-3 flex items-center gap-[7px] rounded-full bg-salle/80 px-3 py-[5px] font-ac-mono text-[10.5px] uppercase tracking-[0.1em] text-ivoire">
                <span className="h-[7px] w-[7px] rounded-full bg-renard" />
                {c.j22.direct}
              </span>
              <span className="absolute bottom-3.5 right-3.5 flex h-16 w-24 items-center justify-center rounded-[8px] border border-white/20 bg-salle-3 font-ac-mono text-[11px] text-brume-nuit">
                {c.j22.vous}
              </span>
            </div>
          </Jour>

          <Jour n={26} label={c.jour(26)} phrase={c.j26.phrase} dernier>
            <div className="inline-flex items-center gap-3.5 rounded-carte border border-dashed border-renard/50 px-[22px] py-4">
              <span className="font-ac-mono text-[11px] font-bold uppercase tracking-[0.14em] text-renard">{c.j26.badge}</span>
              <span className="font-ac-mono text-[11px] text-brume-nuit">{c.j26.outils(t.mcp.outils.length)}</span>
            </div>
          </Jour>
        </div>
        {/* Sous lg, le rail passe AU-DESSUS du contenu : « reprendre » est ce
            qu'on vient chercher. Il n'est pas collant à cette taille (trois
            cartes mangeraient l'écran) ; c'est la barre du haut de colonne
            qui l'est. Il vient APRÈS la colonne dans le DOM : à ordre égal,
            c'est l'ordre du DOM qui place dans la grille, et un `order-first`
            sans borne l'envoyait dans la colonne de gauche à 1 280 px. */}
        <aside ref={aside} className="grid grid-cols-[minmax(0,1fr)] gap-4 pt-4 max-lg:order-first sm:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] lg:sticky lg:top-24 lg:grid-cols-1 lg:pt-0">
          <RailIdentite refs={{ collect, pts, rank, bar, next, ring, fox }} premier={premier} rangs={rangs} c={c.rail} nombre={nombre} />
          <section className={`${PANNEAU} px-5 py-[18px]`}>
            <div className="flex items-baseline justify-between">
              <span className="flex items-center gap-[9px] text-[13.5px] text-corps-nuit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#c8a951" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="8" width="5" height="8" rx="1.5" />
                  <rect x="9.5" y="8" width="5" height="8" rx="1.5" />
                  <rect x="16" y="8" width="5" height="8" rx="1.5" fill="#c8a951" />
                </svg>
                {c.rail.serie}
              </span>
              <span ref={collect(streak)} className="font-ac-mono text-[15px] font-semibold tabular-nums text-ivoire">
                {premier.serie}
              </span>
            </div>
            <div className="mt-3.5 grid grid-cols-10 gap-[3px]">
              {Array.from({ length: JOURS_CALENDRIER }, (_, i) => (
                <span
                  key={i}
                  ref={collect(cells)}
                  className="block aspect-square rounded-[2.5px] bg-salle-3 transition-[background,opacity] duration-300"
                />
              ))}
            </div>
            <p ref={collect(jokers)} className="m-0 mt-3 font-ac-mono text-[10.5px] text-brume-nuit">
              {c.rail.aucuneSerie}
            </p>
          </section>
          {/* ⚠️ La liste est VIDE en production depuis le 28/08/2026 : le
              parcours vendu n'ouvre plus M14 ni M15 aux points, ils sont
              passés aux Automatisations. La carte restait affichée avec
              son seul titre, un cadre vide sur la page de vente. Elle ne se
              rend que si elle a quelque chose à dire. */}
          {MODULES_A_DEBLOQUER.length > 0 && (
          <section className={`${PANNEAU} px-5 py-[18px]`}>
            <p className="m-0 mb-3 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-brume-nuit">{c.rail.aDebloquer}</p>
            {MODULES_A_DEBLOQUER.map((m, i) => (
              <div
                key={m.module_id}
                ref={collect(unlockRows)}
                className={`flex justify-between gap-2.5 py-1.5 text-[13px] text-brume-nuit ${i < MODULES_A_DEBLOQUER.length - 1 ? 'border-b border-filet-nuit' : ''}`}
              >
                <span>{m.module_id}</span>
                <span ref={collect(unlockVals)} className="font-ac-mono text-[11px]">
                  {c.rail.pts(nombre(m.unlock_points))}
                </span>
              </div>
            ))}
          </section>
          )}
        </aside>
      </div>
    </section>
  );
}

/** La carte d'identité du rail : avatar cerclé du métal, nom, rang, points, barre. */
function RailIdentite({
  refs,
  premier,
  rangs,
  c,
  nombre,
}: {
  refs: {
    collect: <T extends Element>(list: React.MutableRefObject<T[]>) => (n: T | null) => void;
    pts: React.MutableRefObject<HTMLElement[]>;
    rank: React.MutableRefObject<HTMLElement[]>;
    bar: React.MutableRefObject<HTMLElement[]>;
    next: React.MutableRefObject<HTMLElement[]>;
    ring: React.MutableRefObject<HTMLElement[]>;
    fox: React.MutableRefObject<SVGPolygonElement[]>;
  };
  premier: EtatJour;
  rangs: Record<RankKey, string>;
  c: Jour30Copy['compte']['rail'];
  nombre: (n: number) => string;
}) {
  const { collect } = refs;
  return (
    <section className={`${PANNEAU} p-5`}>
      <div className="flex items-center gap-[13px]">
        <span ref={collect(refs.ring)} className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full border-2 border-filet-nuit bg-salle">
          <svg viewBox="0 0 100 100" width="30" height="30" aria-hidden="true">
            <polygon ref={collect(refs.fox)} points={renardPoints(premier.renard)} fill="#d9743f" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="m-0 text-[14.5px] text-ivoire">{c.nom}</p>
          <p ref={collect(refs.rank)} className="m-0 mt-0.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.12em] text-or">
            {rangs[premier.rank]}
          </p>
        </div>
      </div>
      <div className="mt-[18px] flex items-baseline gap-2">
        <span ref={collect(refs.pts)} className="font-ac-mono text-[30px] font-bold tabular-nums text-ivoire">
          {nombre(premier.points)}
        </span>
        <span className="font-ac-mono text-[11px] uppercase tracking-[0.14em] text-brume-nuit">{c.points}</span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-[2px] bg-filet-nuit">
        <span
          ref={collect(refs.bar)}
          className="block h-full bg-or transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${Math.round(premier.progress * 100)}%` }}
        />
      </div>
      <p ref={collect(refs.next)} className="m-0 mt-2 font-ac-mono text-[11px] text-brume-nuit">
        {premier.manque !== null && premier.nextRank ? c.avant(nombre(premier.manque), rangs[premier.nextRank]) : c.dernier}
      </p>
    </section>
  );
}

function Jour({
  n,
  label,
  phrase,
  note,
  dernier,
  children,
}: {
  /** Le numéro du jour, lu par la barre du haut pour afficher « Jour n / 30 ». */
  n: number;
  label: string;
  phrase: string;
  note?: string;
  /** Dernier jour avant une frontière ou la fin : marge réduite. */
  dernier?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={`j30-day relative scroll-mt-24 lg:pl-7 ${dernier ? 'mb-5' : 'mb-14'}`} data-jour={n}>
      <span className="absolute -left-1 top-1.5 hidden h-[9px] w-[9px] rounded-full bg-or lg:block" />
      <p className={`${RUBRIQUE} m-0 mb-1 text-or`}>{label}</p>
      <p className="m-0 mb-[18px] max-w-[44ch] text-[19px] leading-[1.45] text-ivoire">{phrase}</p>
      {children}
      {note ? <p className="m-0 mt-3.5 max-w-[50ch] text-[14.5px] leading-[1.6] text-brume-nuit">{note}</p> : null}
    </article>
  );
}

/**
 * Une frontière de niveau : le filet, le libellé en orange (la seule place de
 * l'orange hors du renard), le titre, et le renard qui la traverse à l'entrée
 * (voir `traverser` plus haut). Au repos il attend au bord gauche, à cheval sur
 * le filet, dans le même cercle que l'avatar du rail : c'est le même animal.
 */
function Frontiere({ id, kicker, nom, titre, de, a }: { id: string; kicker: string; nom: string; titre: string; de: number; a: number }) {
  return (
    <div id={id} className="j30-frontier relative mb-[52px] scroll-mt-24 border-t border-filet-nuit pb-[34px] pt-[34px] lg:pl-7" data-de={de} data-a={a}>
      <span
        className="j30-trace pointer-events-none absolute -top-px left-0 h-px w-0"
        style={{ background: 'linear-gradient(90deg, rgba(200,169,81,.35), #c8a951)' }}
        aria-hidden="true"
      />
      <span
        className="j30-renard absolute -top-px left-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-filet-nuit bg-salle"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" width="24" height="24">
          <polygon points={renardPoints(de)} fill="#d9743f" />
        </svg>
      </span>
      <p className="m-0 mb-1.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-renard">
        {kicker} · {nom}
      </p>
      <h2 className="m-0 max-w-[22ch] text-[clamp(24px,3.4vw,34px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">{titre}</h2>
    </div>
  );
}


/**
 * Le jour 2 : la méthode CRAFT qui s'écrit sous les yeux.
 *
 * Demande de Paul du 29/08/2026 : « la première étape, c'est que Clara ouvre la
 * formation sur comment écrire un prompt CRAFT, et là on met une animation ».
 * C'est la promesse centrale du produit, et jusqu'ici le niveau 1 la montrait
 * sous la forme d'une fiche de leçon déjà écrite — le résultat, pas la méthode.
 *
 * Les cinq champs se remplissent l'un après l'autre, puis la demande complète
 * s'assemble en dessous : on voit que le prompt n'est pas un talent, c'est un
 * formulaire. Sous `prefers-reduced-motion`, tout est là d'emblée.
 */
function AnimationCraft({
  lessons,
  c,
  locale,
  pointsLecon,
}: {
  lessons: number;
  c: Jour30Copy['compte']['j2'];
  locale: Locale;
  pointsLecon: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [ecrits, setEcrits] = useState<string[]>(() => c.champs.map(() => ''));
  const [assemble, setAssemble] = useState(false);
  const [copie, setCopie] = useState(false);
  const arrets = useRef<Arret[]>([]);

  // Le séparateur suit la langue : le français met une espace avant le
  // deux-points, l'anglais non.
  const prompt = c.champs.map((ch) => `${ch.nom}${locale === 'fr' ? ' :' : ':'} ${ch.valeur}`).join('\n');

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (reducedMotion()) {
      setEcrits(c.champs.map((ch) => ch.valeur));
      setAssemble(true);
      return;
    }
    const stop = onEnter(el, () => {
      c.champs.forEach((ch, i) => {
        arrets.current.push(
          after(i * 460, () => {
            arrets.current.push(
              typeText(ch.valeur, 380, (v) =>
                setEcrits((prev) => {
                  const n = [...prev];
                  n[i] = v;
                  return n;
                })
              )
            );
          })
        );
      });
      arrets.current.push(after(c.champs.length * 460 + 420, () => setAssemble(true)));
    });
    return () => {
      stop();
      arrets.current.forEach((a) => a());
      arrets.current = [];
    };
  }, [c, locale]);

  return (
    <div
      ref={box}
      className="max-w-[660px] rounded-[20px] border border-white/[0.06] bg-craie px-[30px] py-7 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.85)]"
    >
      <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or-grave">{c.kicker}</p>
      <h3 className="m-0 mt-2 font-ac-serif text-[26px] font-semibold leading-[1.2] text-encre">{c.titre}</h3>

      <dl className="m-0 mt-5 grid gap-2.5">
        {c.champs.map((ch, i) => (
          <div key={ch.lettre} className="grid grid-cols-[26px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[26px_88px_minmax(0,1fr)]">
            <dt
              className={`flex h-[26px] w-[26px] items-center justify-center rounded-[7px] font-ac-mono text-[12px] font-bold transition-colors duration-300 ${
                ecrits[i] ? 'bg-or text-encre' : 'bg-lin text-brume'
              }`}
            >
              {ch.lettre}
            </dt>
            <dd className="m-0 hidden self-center font-ac-mono text-[11px] uppercase tracking-[0.12em] text-brume sm:block">
              {ch.nom}
            </dd>
            <dd className="m-0 min-h-[1.5em] self-center text-[14px] leading-[1.55] text-mine">
              {ecrits[i]}
              {!!ecrits[i] && ecrits[i].length < ch.valeur.length && (
                <span className="prompt-card__caret ml-0.5 !h-3 !w-1.5" aria-hidden="true" />
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className={`transition-opacity duration-500 ${assemble ? 'opacity-100' : 'opacity-0'}`}>
        <p className="m-0 mb-2 mt-[22px] font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or-grave">{c.assemble}</p>
        <div className="relative rounded-[12px] bg-encre px-[18px] py-4">
          <p className="m-0 whitespace-pre-wrap pr-[88px] font-ac-mono text-[12.5px] leading-[1.7] text-terminal-texte">{prompt}</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(prompt).catch(() => {});
              setCopie(true);
              setTimeout(() => setCopie(false), 1800);
            }}
            className="absolute right-3 top-3 min-h-11 cursor-pointer rounded-[8px] border border-or/35 bg-or/[0.14] px-3.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.08em] text-or transition duration-150 hover:bg-or/[0.24]"
          >
            {copie ? c.copie : c.copier}
          </button>
        </div>
      </div>

      <div className="mt-[18px] flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-lin pt-3.5">
        <span className="font-ac-mono text-[11px] text-brume">{c.pied(lessons)}</span>
        <span className="rounded-full bg-sauge-soft px-2.5 py-[3px] font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-sauge">
          {c.terminee(pointsLecon)}
        </span>
      </div>
    </div>
  );
}

/**
 * Le jour 9 : le module des outils est un CHOIX, et le récit le montre.
 *
 * Demande de Paul du 29/08/2026 : « on voit Claude, Gemini, Copilot, et on voit
 * qu'ils se barrent tous parce que c'est Claude qu'elle a choisie ». Les trois
 * autres ne disparaissent pas tout à fait : ils s'effacent, comme le projecteur
 * de la visite plus haut. Les retirer laisserait trois trous, et surtout on ne
 * verrait plus qu'il y avait un choix — c'est justement l'argument.
 */
function ChoixOutil({ c }: { c: Jour30Copy['compte']['j9'] }) {
  const box = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const arrets = useRef<Arret[]>([]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (reducedMotion()) {
      setPhase(2);
      return;
    }
    const stop = onEnter(el, () => {
      arrets.current.push(after(900, () => setPhase(1)));
      arrets.current.push(after(1700, () => setPhase(2)));
    });
    return () => {
      stop();
      arrets.current.forEach((a) => a());
      arrets.current = [];
    };
  }, [c]);

  return (
    <div ref={box} className="max-w-[620px]">
      <div className="flex flex-wrap gap-2.5">
        {c.outils.map((o) => {
          const sien = o === c.choisi;
          const efface = phase > 0 && !sien;
          return (
            <span
              key={o}
              className={`inline-flex items-center gap-2 rounded-bouton border px-3.5 py-2 text-[13.5px] transition-[opacity,border-color,color,transform] duration-500 ${
                efface ? 'translate-y-1 border-filet-nuit text-brume-nuit opacity-25' : 'border-filet-nuit text-corps-nuit opacity-100'
              } ${phase > 0 && sien ? '!border-or bg-or/[0.12] !text-ivoire' : ''}`}
            >
              {o}
              {phase > 0 && sien && (
                <span className="font-ac-mono text-[10px] font-bold uppercase tracking-[0.12em] text-or">{c.choisiLabel}</span>
              )}
            </span>
          );
        })}
      </div>

      <div className={`mt-5 transition-opacity duration-500 ${phase > 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="rounded-carte border border-filet-nuit bg-salle-2 px-[26px] py-[22px]">
          <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.18em] text-or">{c.titre}</p>
          <ul className="m-0 mt-3.5 grid list-none gap-2.5 p-0">
            {c.sujets.map((s) => (
              <li key={s} className="flex gap-2.5 text-[14.5px] leading-[1.55] text-corps-nuit">
                <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-or" aria-hidden="true" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Le jour 19 : le comparateur à poignée, monté sur les deux fichiers réels de
 * l'exercice du module. Une seule source de vérité (le pourcentage), écrite
 * dans le clip-path et dans la poignée ; le curseur natif reste branché
 * dessus, donc la comparaison se fait aussi au clavier.
 */
function Comparateur({ c }: { c: Jour30Copy['compte']['j19'] }) {
  const box = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const drag = useRef(false);

  const set = useCallback((pct: number) => {
    const p = Math.max(0, Math.min(100, pct));
    if (top.current) top.current.style.clipPath = `inset(0 0 0 ${p}%)`;
    if (line.current) line.current.style.left = `${p}%`;
    if (range.current && Number(range.current.value) !== Math.round(p)) range.current.value = String(Math.round(p));
  }, []);

  const fromEvent = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      const b = box.current;
      if (!b) return;
      const r = b.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    },
    [set]
  );

  // ⚠️ Le relachement se perd sans capture de pointeur : si le doigt ou la
  // souris sort du cadre, de la fenetre ou passe sur une image, le `pointerup`
  // part ailleurs et `drag` reste vrai. La poignee suivait alors le curseur
  // sans qu'on appuie, ce qui donne l'impression d'un composant casse (Paul,
  // 29/08/2026). `setPointerCapture` amarre les trois evenements a la boite.
  useEffect(() => {
    const b = box.current;
    if (!b) return;
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      fromEvent(e);
      if (e.cancelable) e.preventDefault();
    };
    const stop = () => {
      drag.current = false;
    };
    b.addEventListener('pointermove', move, { passive: false });
    b.addEventListener('pointerup', stop);
    b.addEventListener('pointercancel', stop);
    b.addEventListener('lostpointercapture', stop);
    window.addEventListener('blur', stop);
    return () => {
      b.removeEventListener('pointermove', move);
      b.removeEventListener('pointerup', stop);
      b.removeEventListener('pointercancel', stop);
      b.removeEventListener('lostpointercapture', stop);
      window.removeEventListener('blur', stop);
    };
  }, [fromEvent]);

  const etiquette = 'pointer-events-none absolute bottom-3 rounded-[6px] bg-salle/80 px-[9px] py-1 font-ac-mono text-[10px] uppercase tracking-[0.12em]';

  return (
    <>
      <p className="m-0 mb-[18px] font-ac-mono text-[11.5px] text-brume-nuit">{c.tirez}</p>
      <div
        ref={box}
        className="relative max-w-[560px] touch-pan-y select-none overflow-hidden rounded-carte border border-filet-nuit bg-salle"
        onPointerDown={(e) => {
          drag.current = true;
          // La boite garde le pointeur jusqu'au relachement, ou qu'il aille.
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* un navigateur qui refuse la capture garde l'ancien comportement */
          }
          fromEvent(e);
        }}
      >
        <img src="/academy/exercices/visuel-carre.jpg" alt={c.altAvant} loading="lazy" width={1080} height={1080} className="block aspect-square h-auto w-full object-cover" />
        <div ref={top} className="absolute inset-0" style={{ clipPath: 'inset(0 0 0 50%)' }}>
          <img src="/academy/exercices/visuel-carre-retouche-auto.jpg" alt={c.altApres} loading="lazy" width={1080} height={1080} className="block h-full w-full object-cover" />
        </div>
        <div ref={line} className="pointer-events-none absolute bottom-0 top-0 w-px bg-or" style={{ left: '50%' }}>
          <span className="absolute left-1/2 top-1/2 flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-or bg-salle text-or">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l-4 6 4 6" />
              <path d="M15 6l4 6-4 6" />
            </svg>
          </span>
        </div>
        <span className={`${etiquette} left-3 text-corps-nuit`}>{c.fourni}</span>
        <span className={`${etiquette} right-3 text-or`}>{c.recadre}</span>
      </div>
      <label htmlFor="j30-ba-range" className="mt-3 block font-ac-mono text-[11px] text-brume-nuit">
        {c.comparer}
      </label>
      <input
        id="j30-ba-range"
        ref={range}
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        onInput={(e) => set(Number((e.target as HTMLInputElement).value))}
        className="mt-1.5 w-full max-w-[560px]"
      />
    </>
  );
}
