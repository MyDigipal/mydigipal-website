/**
 * Le socle de mouvement du site. Point d'entrée unique :
 *
 *   import { scene, courbes, seg, mix } from '@/lib/motion';
 *
 * Les apparitions courantes ([data-reveal], .animate-on-scroll) restent dans
 * `lib/scroll.ts` et `global.css` : elles n'ont pas besoin de ce module.
 */
export * from './temps';
export * from './scene';
