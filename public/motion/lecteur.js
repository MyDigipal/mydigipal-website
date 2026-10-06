/* Lecteur commun des essais du labo motion.
 *
 * Contrat d'un essai (le même que le moteur de rendu vidéo) :
 *   window.STAGE = { w, h }        taille de scène en pixels
 *   window.DUREE = secondes         durée d'une boucle
 *   window.render(t)                pose l'état EXACT de la page à l'instant t (pur, sans rAF)
 *
 * Ce fichier ne sert qu'à l'aperçu : il joue render(t) en boucle, met la scène à l'échelle de
 * la fenêtre, et obéit à la galerie par postMessage ({cmd:'play'|'pause'|'seek', t}).
 * Le rendu vidéo, lui, n'utilise jamais ce fichier : render.js appelle render(t) image par image.
 */
(function () {
  const stage = document.getElementById('stage');
  const S = window.STAGE || { w: 1920, h: 1080 };
  const D = window.DUREE || 8;
  let t = 0, joue = true, dernier = null;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.style.cssText += ';margin:0;height:100%;overflow:hidden;background:#000';
  document.body.style.cssText += ';margin:0;height:100%;overflow:hidden;display:grid;place-items:center';
  stage.style.width = S.w + 'px';
  stage.style.height = S.h + 'px';
  // Position fixe au centre : indépendante de la mise en page que chaque essai pose sur body.
  stage.style.position = 'fixed';
  stage.style.left = '50%';
  stage.style.top = '50%';
  stage.style.margin = '0';
  stage.style.transformOrigin = 'center center';

  function echelle() {
    const k = Math.min(innerWidth / S.w, innerHeight / S.h);
    stage.style.transform = 'translate(-50%, -50%) scale(' + k + ')';
  }
  addEventListener('resize', echelle);
  echelle();

  function dessiner() {
    try { window.render(t); } catch (e) { console.error(e); }
    parent.postMessage({ essai: true, t, duree: D, joue }, '*');
  }
  function tick(now) {
    if (joue && dernier !== null) t = (t + (now - dernier) / 1000) % D;
    dernier = now;
    dessiner();
    requestAnimationFrame(tick);
  }
  addEventListener('message', (e) => {
    const m = e.data || {};
    if (m.cmd === 'play') joue = true;
    if (m.cmd === 'pause') joue = false;
    if (m.cmd === 'seek') { t = Math.max(0, Math.min(D - 0.001, +m.t || 0)); dessiner(); }
  });
  function demarrer() {
    if (reduit) { joue = false; t = D * 0.5; }
    requestAnimationFrame(tick);
  }
  (window.PRET || Promise.resolve()).then(demarrer, demarrer);
})();
