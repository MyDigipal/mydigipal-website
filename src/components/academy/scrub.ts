// MyDigipal AI Academy - le scrub : quand la position du scroll EST l'animation
//
// Direction validée par Paul le 31/08/2026 après trois essais comparés
// (`labo/craft-scrub.html`, `labo/mcp-trace.html`, `labo/cadran-parcours.html`).
// Ce que les reveals existants font est binaire : un bloc entre à l'écran,
// l'animation se joue en 600 ms, puis c'est fini. Ici il n'y a pas de durée :
// l'état est la position, donc quelqu'un qui remonte voit l'animation revenir en
// arrière, et quelqu'un qui lit lentement n'arrive jamais après la fin.
//
// ⚠️ L'état de repos reste l'état visible. Rien ici ne cache quoi que ce soit
// avant d'avoir vérifié que le mouvement est possible : c'est la règle de la
// page (voir les classes `j30-pre-*` de `academy.css`) et le scrub ne la change
// pas. Sans JavaScript, sous `prefers-reduced-motion`, ou si l'horloge ne tourne
// pas, tout se lit en entier.

import type { EtatJour, RankKey, Metal } from './data';

export type Arret = () => void;

/**
 * Le chargement d'anime.js, une seule fois, à la demande.
 *
 * Le module pèse 40 Ko gzip pour le bundle entier : on ne le met pas dans le
 * chemin critique d'une page de vente. `import()` le sort donc du paquet
 * principal, et l'appelant garde son état de repos jusqu'à ce qu'il arrive.
 */
let moteur: Promise<typeof import('animejs')> | null = null;
export function chargerMoteur(): Promise<typeof import('animejs')> {
  if (!moteur) moteur = import('animejs');
  return moteur;
}

/** Mélange linéaire, borné. */
export function melange(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Deux journées mélangées, pour que les points montent en continu au lieu de
 * sauter d'un palier à l'autre.
 *
 * ⚠️ Seules les grandeurs CONTINUES s'interpolent. Un rang, un métal, un
 * nombre de jokers ou une série sont des faits : une série de 6,4 jours n'existe
 * pas, et l'afficher ferait douter de tous les autres chiffres de la page. Ils
 * prennent donc la valeur du jour atteint, pas une moyenne.
 */
export function melangerEtat(a: EtatJour, b: EtatJour | undefined, t: number): EtatJour {
  if (!b) return a;
  return {
    ...a,
    points: Math.round(melange(a.points, b.points, t)),
    progress: melange(a.progress, b.progress, t),
    renard: melange(a.renard, b.renard, t),
    trophees: Math.round(melange(a.trophees, b.trophees, t)),
    // Les valeurs discrètes basculent à mi-chemin, là où le regard a déjà
    // changé de bloc.
    rank: (t >= 0.5 ? b.rank : a.rank) as RankKey,
    nextRank: (t >= 0.5 ? b.nextRank : a.nextRank) as RankKey | null,
    manque: t >= 0.5 ? b.manque : a.manque,
    serie: t >= 0.5 ? b.serie : a.serie,
    jokers: t >= 0.5 ? b.jokers : a.jokers,
    metal: (t >= 0.5 ? b.metal : a.metal) as Metal | null,
  };
}

/**
 * La position continue dans une liste de blocs, en fonction du scroll.
 *
 * Rend un flottant : `2.4` veut dire « le troisième bloc, à 40 % du chemin vers
 * le quatrième ». La ligne de référence est la même que celle du pilotage
 * existant (72 % de la hauteur de fenêtre), pour que le mode scrub et le mode
 * actuel désignent le même bloc au même moment.
 */
export function positionContinue(blocs: HTMLElement[], ligne = 0.72): number {
  if (!blocs.length) return 0;
  const y = window.innerHeight * ligne;
  let i = 0;
  for (let k = 0; k < blocs.length; k += 1) if (blocs[k].getBoundingClientRect().top < y) i = k;
  const haut = blocs[i].getBoundingClientRect().top;
  const suivant = blocs[i + 1];
  if (!suivant) return i;
  const ecart = suivant.getBoundingClientRect().top - haut;
  if (ecart <= 0) return i;
  return i + Math.max(0, Math.min(1, (y - haut) / ecart));
}

/**
 * L'apparition d'un bloc, en fonction de sa distance à la ligne de lecture.
 *
 * Rend 0 quand le bloc est encore sous la ligne d'entrée, 1 quand il l'a
 * franchie. Entre les deux, la valeur sert d'opacité et de déplacement : c'est
 * ce qui remplace le tout-ou-rien de `revealOnEnter`.
 */
export function apparition(el: HTMLElement, entree = 0.92, fin = 0.62): number {
  const vh = window.innerHeight;
  const haut = el.getBoundingClientRect().top;
  const a = vh * entree;
  const b = vh * fin;
  if (haut >= a) return 0;
  if (haut <= b) return 1;
  return (a - haut) / (a - b);
}

/**
 * La progression LOCALE dans une fenêtre de la course globale.
 *
 * `fenetre(0.5, 0.4, 0.8)` rend 0.25 : à mi-course, on est au quart de la
 * fenêtre qui va de 40 % à 80 %. C'est ce qui remplace les `delay` et les
 * `duration` d'une animation à durée fixe : chaque élément reçoit sa part de la
 * course au lieu de sa part du temps.
 */
export function fenetre(p: number, debut: number, fin: number): number {
  if (fin <= debut) return p >= fin ? 1 : 0;
  return Math.max(0, Math.min(1, (p - debut) / (fin - debut)));
}

/**
 * Le « bam » de certification : ce qui se passe quand le parcours atteint 100 %.
 *
 * Demande de Paul du 31/08/2026. Trois gestes en même temps, tous sur
 * `transform` et `opacity` : l'anneau se trace, le sceau grossit d'un coup avec
 * un rebond, et l'éclat part vers l'extérieur. Une seule fois par visite : un
 * accomplissement qui rejoue à chaque passage n'est plus un accomplissement.
 */
export async function bam(hote: HTMLElement): Promise<void> {
  const anneau = hote.querySelector<SVGCircleElement>('.j30-bam-anneau');
  const sceau = hote.querySelector<HTMLElement>('.j30-bam-sceau');
  const eclat = hote.querySelector<HTMLElement>('.j30-bam-eclat');
  const texte = hote.querySelector<HTMLElement>('.j30-bam-texte');
  const avant = hote.querySelector<HTMLElement>('.j30-bam-avant');

  const { animate, svg, createSpring } = await chargerMoteur();

  hote.dataset.bam = '1';

  if (anneau) {
    // Les pointillés de l'état « à obtenir » cèdent la place au tracé plein.
    anneau.removeAttribute('stroke-dasharray');
    anneau.setAttribute('stroke', '#c8a951');
    anneau.setAttribute('stroke-width', '1.6');
    const [trace] = svg.createDrawable(anneau);
    trace.draw = '0 0';
    animate(trace, { draw: '0 1', duration: 720, ease: 'inOut(2)' });
  }
  if (sceau) {
    animate(sceau, {
      scale: [{ to: 0.6, duration: 0 }, { to: 1, duration: 620 }],
      opacity: [{ to: 0, duration: 0 }, { to: 1, duration: 220 }],
      ease: createSpring({ stiffness: 120, damping: 11 }),
    });
  }
  if (eclat) {
    animate(eclat, {
      scale: [{ to: 0.5, duration: 0 }, { to: 2.1, duration: 900 }],
      opacity: [{ to: 0.55, duration: 0 }, { to: 0, duration: 900 }],
      ease: 'out(3)',
    });
  }
  if (avant) {
    animate(avant, { opacity: [{ to: 1, duration: 0 }, { to: 0, duration: 300 }], ease: 'out(2)' });
  }
  if (texte) {
    animate(texte, {
      opacity: [{ to: 0, duration: 0 }, { to: 1, duration: 460 }],
      y: [{ to: 8, duration: 0 }, { to: 0, duration: 460 }],
      ease: 'out(2)',
      delay: 260,
    });
  }
}
