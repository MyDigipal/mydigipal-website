/* ============================================================================
   MyDigipal - comportement commun des maquettes de la refonte (29/09/2026)
   La langue, les apparitions, les deux appels flottants, le bandeau cookies de
   démonstration et le panneau de l'assistant (factice : il ne parle à personne).
   À charger APRÈS socle/motion.js, en fin de <body>.

   Dans le <head> de chaque maquette, AVANT les feuilles de style :
     <script>
       (function (d) {
         var q = new URLSearchParams(location.search).get('langue'), m = null;
         try { m = localStorage.getItem('mdp-maquette-langue'); } catch (e) {}
         d.dataset.langue = q === 'en' || q === 'fr' ? q : (m === 'en' ? 'en' : 'fr');
         d.lang = d.dataset.langue;
         if (!/[?&]fige=1/.test(location.search) && !matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('mv');
       })(document.documentElement);
     </script>
   ========================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;

  /* ---------- la langue ---------- */
  function poserLangue(l) {
    html.dataset.langue = l;
    html.lang = l;
    try { localStorage.setItem('mdp-maquette-langue', l); } catch (e) { /* stockage indisponible */ }
    /* Une scène dessinée en canvas ou mesurée en pixels se recale sur la nouvelle langue. */
    window.dispatchEvent(new CustomEvent('mdp:langue', { detail: l }));
    if (window.MDP) window.MDP.scenes.forEach(function (s) { if (!s.enLecture) s.aller(s.t); });
  }
  [].slice.call(document.querySelectorAll('[data-bascule-langue]')).forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      poserLangue(html.dataset.langue === 'fr' ? 'en' : 'fr');
    });
  });

  /* ---------- les apparitions ---------- */
  if (window.MDP) window.MDP.entrees(document);

  /* ---------- le bandeau cookies de démonstration ----------
     Il dit au reste de la page la place qu'il prend (`--bandeau`), pour que les
     appels flottants et le panneau montent au-dessus de lui. */
  var bandeau = document.querySelector('[data-bandeau]');
  function mesurerBandeau() {
    var h = 0;
    if (bandeau && !bandeau.hidden) h = Math.round(bandeau.getBoundingClientRect().height);
    html.style.setProperty('--bandeau', h + 'px');
  }
  if (bandeau) {
    [].slice.call(bandeau.querySelectorAll('[data-bandeau-fermer]')).forEach(function (b) {
      b.addEventListener('click', function () { bandeau.hidden = true; mesurerBandeau(); });
    });
    if ('ResizeObserver' in window) new ResizeObserver(mesurerBandeau).observe(bandeau);
    mesurerBandeau();
  }

  /* ---------- « Calculer mon budget » : après 400 px de défilement ----------
     Un repère posé à 400 px du haut de la page, observé : pas d'écouteur de défilement. */
  var calc = document.querySelector('[data-flottant-calculateur]');
  if (calc && 'IntersectionObserver' in window) {
    var repere = document.createElement('div');
    repere.setAttribute('aria-hidden', 'true');
    repere.style.cssText = 'position:absolute;top:400px;left:0;width:1px;height:1px;pointer-events:none';
    document.body.appendChild(repere);
    new IntersectionObserver(function (es) {
      var passe = !es[0].isIntersecting && es[0].boundingClientRect.top < 0;
      calc.classList.toggle('est-visible', passe);
    }, { threshold: 0 }).observe(repere);
  } else if (calc) {
    calc.classList.add('est-visible');
  }

  /* ---------- le panneau de l'assistant (factice) ----------
     Ouvert, il fait disparaître le bouton du calculateur, comme sur le site
     depuis le 29/09/2026 (`html[data-assistant-ouvert='on']`). */
  var visage = document.querySelector('[data-assistant-ouvrir]');
  var panneau = document.querySelector('[data-assistant-panneau]');
  function ouvrirPanneau(o) {
    if (!panneau) return;
    panneau.hidden = !o;
    if (o) html.dataset.assistantOuvert = 'on'; else delete html.dataset.assistantOuvert;
    if (visage) visage.setAttribute('aria-expanded', o ? 'true' : 'false');
  }
  if (visage) visage.addEventListener('click', function () { ouvrirPanneau(panneau ? panneau.hidden : false); });
  if (panneau) {
    [].slice.call(panneau.querySelectorAll('[data-assistant-fermer]')).forEach(function (b) {
      b.addEventListener('click', function () { ouvrirPanneau(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panneau.hidden) ouvrirPanneau(false); });
  }

  /* ---------- le menu sous 1024 px ---------- */
  var menuBouton = document.querySelector('[data-menu-ouvrir]');
  var menu = document.querySelector('[data-menu]');
  if (menuBouton && menu) {
    menuBouton.addEventListener('click', function () {
      var o = menu.hidden;
      menu.hidden = !o;
      menuBouton.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  }
})();
