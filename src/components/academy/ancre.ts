import type { MouseEvent } from 'react';
import { reducedMotion } from './motion';

/**
 * Amener une section en haut de l'écran, et l'y laisser.
 *
 * ⚠️ Le défilement natif d'une ancre vise une position calculée AU MOMENT DU
 * CLIC. Sur cette page, qui fait plus de quinze mille pixels, les îlots en
 * `client:visible` s'hydratent et les images se chargent PENDANT l'animation :
 * la cible a bougé avant qu'on l'atteigne. Mesuré le 13/09/2026 sur la page en
 * ligne, à 390 px, depuis la visite : un clic sur « Commencer » finissait
 * 157 px trop court, le mot « Pricing » à 347 px du haut de l'écran, c'est-à-
 * dire au milieu. Paul : « il ne scrolle pas... il faut qu'il arrive bien en
 * haut de l'écran ».
 *
 * On corrige donc APRÈS coup : on laisse l'animation se faire, on attend que le
 * défilement se soit arrêté, et on rattrape l'écart qui reste. Tant que la
 * position continue de bouger, on ne touche à rien, sinon on couperait
 * l'animation en cours.
 */
export function allerA(id: string, marge = 0): void {
  const el = document.getElementById(id);
  if (!el) return;

  /** L'écart restant entre le haut de la section et l'endroit où on la veut. */
  const ecart = () => {
    const cible = document.getElementById(id);
    return cible ? cible.getBoundingClientRect().top - marge : 0;
  };

  const doux: ScrollBehavior = reducedMotion() ? 'instant' : 'smooth';
  window.scrollBy({ top: ecart(), behavior: doux });

  // Le rattrapage. `stable` compte les trames pendant lesquelles le défilement
  // n'a pas bougé : deux d'affilée, et l'animation est finie.
  //
  // ⚠️ Le budget se compte en TEMPS, pas en trames. Une première version
  // s'arrêtait au bout de 150 trames : l'animation douce sur douze mille pixels
  // en consommait déjà la quasi-totalité, si bien que le rattrapage n'avait
  // jamais lieu et que la section s'arrêtait 117 px trop bas. Et une correction
  // remet forcément `stable` à zéro à la trame suivante, puisqu'elle déplace le
  // défilement : il faut donc de la marge pour en enchaîner plusieurs.
  const debut = performance.now();
  let precedent = -1;
  let stable = 0;
  let corrections = 0;
  const veiller = () => {
    const y = Math.round(window.scrollY);
    stable = y === precedent ? stable + 1 : 0;
    precedent = y;
    if (stable >= 2) {
      const reste = ecart();
      if (Math.abs(reste) < 2) return; // arrivé
      if (corrections >= 6) return; // on n'insiste pas indéfiniment
      corrections += 1;
      window.scrollBy({ top: reste, behavior: 'instant' });
    }
    if (performance.now() - debut < 3500) requestAnimationFrame(veiller);
  };
  requestAnimationFrame(veiller);
}

/**
 * Le gestionnaire de clic d'un lien d'ancre interne.
 *
 * Le lien reste un vrai lien : on ne prend la main que sur le clic gauche nu,
 * pour que l'ouverture dans un onglet et le clic du milieu continuent de
 * marcher. L'adresse est mise à jour sans empiler une entrée d'historique,
 * et la barre du haut est prévenue pour que le sélecteur de langue emmène au
 * bon endroit.
 */
export function surAncre(id: string, marge = 0) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!document.getElementById(id)) return;
    e.preventDefault();
    allerA(id, marge);
    if (window.location.hash !== `#${id}`) {
      window.history.replaceState(null, '', `#${id}`);
      window.dispatchEvent(new Event('hashchange'));
    }
  };
}
