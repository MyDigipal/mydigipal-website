// ============================================================
// MyDigipal Academy - Le mouvement de la page « Jour 30 »
// ============================================================
//
// Module PUR, importé par des composants client. Aucune bibliothèque
// d'animation : le dépôt n'en a pas, et le prototype de Claude Design a
// appris à ses dépens que l'AFFICHAGE ne doit jamais dépendre d'une
// bibliothèque (design/handoff-jour-30/README.md, « deux pièges déjà payés »).
// Ce que GSAP faisait ici tient en quatre fonctions.
//
// Règle qui commande tout le fichier : une animation se compte en DURÉE
// CIBLE, jamais en pixels ou en caractères par image. Un `setInterval` dont
// le rappel déclenche un rendu ne tient pas son rythme : les ticks
// s'accumulent, et le devis du configurateur mettait onze secondes à
// s'écrire pour 620 ms annoncées (CLAUDE.md, section 15).

export type Ease = (t: number) => number;

/** Les courbes, nommées comme dans le prototype pour que la spéc se relise. */
export const ease: Record<
  'linear' | 'power1InOut' | 'power2Out' | 'power2InOut' | 'power3Out' | 'power4In',
  Ease
> = {
  linear: (t) => t,
  power1InOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  power2Out: (t) => 1 - Math.pow(1 - t, 3),
  power2InOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  power3Out: (t) => 1 - Math.pow(1 - t, 4),
  power4In: (t) => t * t * t * t * t,
};

/** Le rappel qui arrête un mouvement en cours. */
export type Arret = () => void;

/**
 * Interpole une valeur de `from` à `to` en `ms` millisecondes, sur
 * `requestAnimationFrame`. La durée est tenue quelle que soit la machine :
 * une image perdue saute des valeurs, elle n'allonge pas le geste.
 */
export function tween(opts: {
  from: number;
  to: number;
  ms: number;
  ease?: Ease;
  onUpdate: (v: number) => void;
  onDone?: () => void;
}): Arret {
  const fn = opts.ease || ease.power2Out;
  let raf = 0;
  let t0 = 0;
  const step = (now: number) => {
    if (!t0) t0 = now;
    const p = Math.min(1, (now - t0) / Math.max(1, opts.ms));
    opts.onUpdate(opts.from + (opts.to - opts.from) * fn(p));
    if (p < 1) raf = requestAnimationFrame(step);
    else opts.onDone?.();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

/**
 * La machine à écrire : le texte complet est posé en `ms` millisecondes,
 * caractère par caractère, linéairement. `set` n'est appelé que quand le
 * nombre de caractères change, donc au plus une fois par caractère, jamais
 * une fois par image.
 */
export function typeText(full: string, ms: number, set: (s: string) => void, done?: () => void): Arret {
  let shown = -1;
  return tween({
    from: 0,
    to: full.length,
    ms,
    ease: ease.linear,
    onUpdate: (v) => {
      const n = Math.round(v);
      if (n !== shown) {
        shown = n;
        set(full.slice(0, n));
      }
    },
    onDone: done,
  });
}

/** Un délai annulable, pour enchaîner les temps d'une séquence. */
export function after(ms: number, fn: () => void): Arret {
  const id = setTimeout(fn, ms);
  return () => clearTimeout(id);
}

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Vrai quand le doigt est le seul moyen de désigner quelque chose.
 *
 * On interroge `hover`, jamais la largeur : une fenêtre étroite sur un
 * ordinateur garde sa souris, et une tablette large ne l'a pas. Ce qui change
 * n'est pas la place disponible, c'est le geste possible — donc c'est le geste
 * qu'il faut mesurer.
 *
 * ⚠️ Toujours l'appeler dans un effet, jamais au rendu : le serveur ne connaît
 * pas le pointeur, et répondre autre chose que le rendu du serveur au premier
 * passage casse l'hydratation.
 */
export function pointeurGrossier(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
}

/**
 * La sonde d'horloge. AVANT de cacher quoi que ce soit, on vérifie que deux
 * images successives arrivent et que le temps avance réellement. Sinon (onglet
 * en veille, contexte de rendu figé, capture d'écran), on bascule en mode sans
 * mouvement, où chaque élément est déjà à son état final.
 *
 * ⚠️ Elle rend un arrêt, et il faut s'en servir dans tout effet dont les
 * dépendances peuvent changer (29/08/2026). La sonde répond deux images plus
 * tard : entre-temps l'effet a pu être démonté, et son rappel arme alors une
 * animation que plus aucun nettoyage ne viendra arrêter, avec les valeurs
 * périmées de sa fermeture. C'est ainsi que la visite du produit continuait de
 * tourner toute seule sur un téléphone alors que le code venait justement de
 * l'y interdire.
 */
export function probeClock(cb: (alive: boolean) => void): Arret {
  if (reducedMotion() || typeof requestAnimationFrame !== 'function') {
    cb(false);
    return () => {};
  }
  const t0 = performance.now();
  let settled = false;
  const finish = (ok: boolean) => {
    if (settled) return;
    settled = true;
    cb(ok);
  };
  const guard = setTimeout(() => finish(false), 400);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      clearTimeout(guard);
      // rAF peut tirer sans que le temps avance : on lit l'horloge, pas le compteur.
      finish(performance.now() - t0 > 0.5);
    })
  );
  // Marquer la sonde résolue suffit : `finish` ne rappellera plus.
  return () => {
    settled = true;
    clearTimeout(guard);
  };
}

/**
 * Le rappel unique d'une entrée à l'écran. `marge` est la marge basse de
 * l'observateur : `-20%` signifie « quand le haut de l'élément passe sous les
 * 80 % de la fenêtre », l'équivalent du `start: 'top 80%'` du prototype.
 */
export function onEnter(el: Element, fn: () => void, marge = '-20%'): Arret {
  if (!('IntersectionObserver' in window)) {
    fn();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { rootMargin: `0px 0px ${marge} 0px` }
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Cache un élément (classe `pre`) SEULEMENT s'il est encore sous la ligne de
 * déclenchement, puis le révèle (classe `in`) quand il l'atteint. C'est
 * l'équivalent de `immediateRender: false` : ce qu'on a déjà sous les yeux
 * n'est jamais caché, et une horloge arrêtée ne vide rien.
 */
export function revealOnEnter(el: HTMLElement, pre: string, on: string, ligne = 0.8): Arret {
  const r = el.getBoundingClientRect();
  if (r.top < window.innerHeight * ligne) return () => {};
  el.classList.add(pre);
  return onEnter(
    el,
    () => {
      el.classList.add(on);
      el.classList.remove(pre);
    },
    `-${Math.round((1 - ligne) * 100)}%`
  );
}

/**
 * Le garde-fou : toutes les deux secondes, tout élément PRÉSENT À L'ÉCRAN
 * encore porteur d'une classe `pre` reçoit son état final. Un élément visible
 * mais transparent est un élément dont l'animation ne s'est pas exécutée.
 */
export function rescueLoop(paires: Array<[pre: string, on: string]>): Arret {
  const id = setInterval(() => {
    for (const [pre, on] of paires) {
      document.querySelectorAll<HTMLElement>(`.${pre}`).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        el.classList.add(on);
        el.classList.remove(pre);
      });
    }
  }, 2000);
  return () => clearInterval(id);
}

/** Un nombre écrit à la française, avec une espace simple pour les milliers. */
export function nombre(n: number): string {
  return Math.round(n)
    .toLocaleString('fr-FR')
    .replace(/[  ]/g, ' ');
}
