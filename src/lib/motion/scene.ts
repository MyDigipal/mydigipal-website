/**
 * Une scène : une animation qui explique, jouée une fois.
 *
 * Le contrat (docs/refonte-design/pilotage.html, « Le socle de mouvement ») :
 *   1. L'état par défaut de la page est l'état FINAL. Sans JavaScript, sous mouvement
 *      réduit ou avec `?fige=1`, rien n'est caché et rien ne bouge.
 *   2. `rendu(t, el)` est une fonction PURE du temps : elle pose l'état exact de
 *      l'instant t, sans mémoire et sans hasard. `rendu(tenue)` redonne l'état final.
 *   3. La scène joue une fois à l'entrée dans l'écran, puis s'arrête sur son instant de
 *      tenue. Aucune boucle permanente, aucun écouteur de défilement.
 *   4. Le visiteur garde la main : `<button data-aller="3.5" data-tenir="5.2">` rejoue le
 *      passage qui mène à un repère et s'y arrête, `data-rejouer` rejoue tout.
 *
 * ⚠️ Une fonction ne se passe pas en propriété à un îlot Astro (les propriétés traversent
 * une sérialisation). Le composant importe donc sa scène, et ne reçoit que des données.
 *
 * Vérifier une scène : `element.__scene.aller(3.2)` pose l'instant 3,2 s. Dans une fenêtre
 * en arrière-plan, `requestAnimationFrame` ne tourne presque pas : on ne juge pas une scène
 * en la regardant jouer, on la pose et on capture.
 */

import { clamp, mouvementReduit } from './temps';

export interface OptionsScene {
  /** L'instant (s) où tout est posé : c'est l'état final affiché. */
  tenue: number;
  /** Pose l'état exact de l'instant t. */
  rendu: (t: number, el: HTMLElement) => void;
  /** `temps` (défaut) joue à l'entrée dans l'écran ; `defilement` suit la traversée du bloc. */
  mode?: 'temps' | 'defilement';
  /** Part du bloc visible qui déclenche la lecture (défaut 0,35). */
  seuil?: number;
}

export interface Scene {
  aller: (t: number) => void;
  jouer: (depuis?: number) => void;
  finir: () => void;
  arreter: () => void;
  readonly tenue: number;
  readonly t: number;
  readonly enLecture: boolean;
  readonly el: HTMLElement;
}

type ElementScene = HTMLElement & { __scene?: Scene };

const scenes = new Set<Scene>();

export function scene(element: HTMLElement, options: OptionsScene): Scene {
  const el = element as ElementScene;
  if (el.__scene) return el.__scene;

  const { tenue, rendu, mode = 'temps', seuil = 0.35 } = options;
  let t = tenue;
  let enLecture = false;
  let depart = 0;
  let trame = 0;
  let jouee = false;
  let visible = false;
  let observateur: IntersectionObserver | null = null;

  const reperes = Array.from(el.querySelectorAll<HTMLElement>('[data-aller]'));

  const marquer = (x: number) => {
    for (const b of reperes) {
      const a = parseFloat(b.dataset.aller || '0');
      const z = b.dataset.jusqua ? parseFloat(b.dataset.jusqua) : a;
      let actif = b.dataset.jusqua ? x >= a - 0.01 && x < z : false;
      if (x >= tenue - 0.01 && b.dataset.dernier != null) actif = true;
      b.setAttribute('aria-pressed', actif ? 'true' : 'false');
    }
  };
  const poser = (x: number) => {
    t = clamp(x, 0, tenue);
    rendu(t, el);
    el.dataset.sceneT = t.toFixed(2);
  };
  const arreter = () => {
    enLecture = false;
    if (trame) cancelAnimationFrame(trame);
    trame = 0;
  };
  const aller = (x: number) => {
    arreter();
    jouee = true;
    poser(x);
    el.dataset.scene = 'tenue';
    marquer(t);
  };
  const finir = () => {
    arreter();
    poser(tenue);
    el.dataset.scene = 'posee';
    marquer(tenue);
  };
  const lire = (debut: number, fin: number, aLaFin: () => void) => {
    arreter();
    depart = performance.now() - debut * 1000;
    enLecture = true;
    jouee = true;
    el.dataset.scene = 'lecture';
    const pas = (maintenant: number) => {
      if (!enLecture) return;
      const x = (maintenant - depart) / 1000;
      if (x >= fin) {
        aLaFin();
        return;
      }
      poser(x);
      marquer(x);
      trame = requestAnimationFrame(pas);
    };
    poser(debut);
    trame = requestAnimationFrame(pas);
  };
  const jouer = (depuis = 0) => {
    if (mouvementReduit()) {
      finir();
      return;
    }
    lire(depuis, tenue, finir);
  };

  for (const b of reperes) {
    b.addEventListener('click', () => {
      const debut = parseFloat(b.dataset.aller || '0');
      const cible = b.dataset.tenir ? parseFloat(b.dataset.tenir) : debut;
      if (mouvementReduit()) {
        aller(cible);
        return;
      }
      // On rejoue le passage qui mène au repère, puis on s'y arrête : le visiteur voit
      // d'où vient l'état, il ne saute pas dedans.
      lire(debut, cible, () => aller(cible));
    });
  }
  for (const b of Array.from(el.querySelectorAll<HTMLElement>('[data-rejouer]'))) {
    b.addEventListener('click', () => jouer(0));
  }

  const api: Scene = {
    aller,
    jouer,
    finir,
    arreter: () => {
      arreter();
      observateur?.disconnect();
      scenes.delete(api);
    },
    tenue,
    el,
    get t() {
      return t;
    },
    get enLecture() {
      return enLecture;
    },
  };
  el.__scene = api;
  scenes.add(api);

  // L'état final d'abord : c'est ce que voit un visiteur sans animation.
  finir();
  if (mouvementReduit() || typeof IntersectionObserver === 'undefined') return api;

  if (mode === 'defilement') {
    const suivre = () => {
      if (!visible) {
        trame = 0;
        return;
      }
      const r = el.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.82 - r.top) / (r.height * 0.9), 0, 1);
      poser(p * tenue);
      marquer(t);
      trame = requestAnimationFrame(suivre);
    };
    observateur = new IntersectionObserver(
      (es) => {
        visible = es[0].isIntersecting;
        if (visible && !trame) trame = requestAnimationFrame(suivre);
      },
      { threshold: 0 }
    );
    observateur.observe(el);
    return api;
  }

  // On ne remet la scène à zéro que si elle est encore sous l'écran : un bloc déjà
  // visible au chargement reste dans son état final.
  const r0 = el.getBoundingClientRect();
  const dejaVue = r0.top < window.innerHeight * (1 - seuil) && r0.bottom > 0;
  if (dejaVue) return api;

  poser(0);
  el.dataset.scene = 'attente';
  marquer(0);
  observateur = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (e.isIntersecting && !jouee) {
          jouer(0);
          observateur?.unobserve(el);
        }
      }
    },
    { threshold: seuil }
  );
  observateur.observe(el);
  return api;
}

/** Arrête toutes les scènes de la page (changement de page, démontage d'un îlot). */
export function arreterLesScenes(): void {
  for (const s of Array.from(scenes)) s.arreter();
}
