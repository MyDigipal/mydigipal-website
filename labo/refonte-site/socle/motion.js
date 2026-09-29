/* ============================================================================
   MyDigipal - socle de mouvement pour le web (maquettes de la refonte, 29/09/2026)
   ============================================================================

   Origine : les essais de `_shared/motion-lib/labo/essais/`, écrits pour la vidéo
   (une fonction pure `render(t)` rendue image par image). Ce fichier garde le
   principe (l'état d'une scène est une fonction pure du temps) et change tout le
   reste pour le web :

   1. L'état par défaut de la page est l'état FINAL. Sans JavaScript, ou sous
      `prefers-reduced-motion`, rien n'est caché et rien ne bouge.
   2. Une scène ne joue que lorsqu'elle entre dans l'écran, une seule fois, puis
      s'arrête sur son instant de tenue. Aucune boucle permanente.
   3. Le visiteur garde la main : des repères cliquables envoient la scène à un
      instant précis, un bouton la rejoue.
   4. Courbe signature MyDigipal : la A, nette. Entrée `outExpo` sur 0,55 s,
      sortie `inCubic` sur 0,40 s, éléments secondaires 33 ms plus tard.

   Script classique (pas un module) : les maquettes s'ouvrent aussi en file://.
   En production, ce fichier deviendra `src/lib/motion/` en TypeScript.

   API :
     MDP.scene(element, { tenue, rendu, mode, seuil })   crée une scène
     MDP.entrees(racine)                                 apparitions [data-entree]
     MDP.courbes, MDP.seg, MDP.mix, MDP.piste...         outils de temps
   Vérification sans animation (onglet en arrière-plan, test) :
     element.__scene.aller(t)   pose l'état exact de l'instant t
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- outils de temps (une seule signature pour chacun) ---------- */
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  /** Progression de 0 à 1 entre l'instant `debut` et l'instant `fin`. */
  var seg = function (t, debut, fin) { return clamp((t - debut) / (fin - debut), 0, 1); };
  var mix = function (a, b, p) { return a + (b - a) * p; };

  var courbes = {
    /* La courbe A : arrive vite, se pose net. */
    entree: function (p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); },
    /* Sa sortie : part doucement, disparaît vite. */
    sortie: function (p) { return p * p * p; },
    outQuart: function (p) { return 1 - Math.pow(1 - p, 4); },
    inQuart: function (p) { return p * p * p * p; },
    inOutCubic: function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    inOutQuart: function (p) { return p < 0.5 ? 8 * Math.pow(p, 4) : 1 - Math.pow(-2 * p + 2, 4) / 2; },
    /* Glissé de caméra : quintique, accélère puis freine longuement. */
    camera: function (p) { return p < 0.5 ? 16 * Math.pow(p, 5) : 1 - Math.pow(-2 * p + 2, 5) / 2; },
    /* Monte puis redescend : 0 aux deux bouts, 1 au milieu. */
    bosse: function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); },
    /* Dépassement, réservé aux OBJETS (carte, étiquette). Jamais à un texte. */
    depasse: function (s) {
      return function (p) { return 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2); };
    },
    /* Chute d'un volet de tableau à palettes, sans rebond. */
    chute: function (p) { return Math.pow(p, 1.75); }
  };

  /** Ressort analytique de 0 vers 1 : z amortissement (0 à 1), w pulsation (rad/s). */
  var ressort = function (x, z, w) {
    if (x <= 0) return 0;
    var wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
  };

  /** Générateur à graine fixe : le même dessin à chaque chargement. */
  var graine = function (a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  /**
   * Une piste de clés : [{t: 0, x: 0}, {t: 1.2, x: 40}, {t: 2, x: 40}].
   * Deux clés identiques font une TENUE, deux clés différentes un glissé.
   */
  var piste = function (cles, t, champ, courbe) {
    var e = courbe || courbes.camera;
    if (t <= cles[0].t) return cles[0][champ];
    for (var k = 0; k < cles.length - 1; k++) {
      var a = cles[k], b = cles[k + 1];
      if (t < b.t) return mix(a[champ], b[champ], e(clamp((t - a.t) / (b.t - a.t), 0, 1)));
    }
    return cles[cles.length - 1][champ];
  };

  /* `?fige=1` dans l'adresse : la page se montre dans son état final, sans aucun
     mouvement. C'est ce que voit un visiteur sans JavaScript ou qui a demandé moins
     de mouvement, et c'est le contrôle à faire avant de livrer une scène. */
  var fige = /[?&]fige=1/.test(window.location ? window.location.search : '');
  var mouvementReduit = function () {
    return fige || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  /* ---------- la scène ---------- */
  var scenes = [];

  /**
   * @param {HTMLElement} el      le bloc qui porte la scène
   * @param {object} o
   *   tenue   {number}   instant (s) où tout est posé : c'est l'état final affiché
   *   rendu   {function} rendu(t, el) : pose l'état EXACT de l'instant t, sans mémoire
   *   mode    {string}   'temps' (défaut, joue à l'entrée dans l'écran) ou 'defilement'
   *   seuil   {number}   part du bloc visible qui déclenche la lecture (défaut 0.35)
   */
  function scene(el, o) {
    if (!el || el.__scene) return el && el.__scene;
    var tenue = o.tenue, rendu = o.rendu, mode = o.mode || 'temps';
    var seuil = o.seuil == null ? 0.35 : o.seuil;
    var t = tenue, enLecture = false, depart = 0, trame = 0, jouee = false, visible = false;

    function poser(x) { t = clamp(x, 0, tenue); rendu(t, el); el.dataset.sceneT = t.toFixed(2); }
    function arreter() { enLecture = false; if (trame) cancelAnimationFrame(trame); trame = 0; }
    function finir() { arreter(); poser(tenue); el.dataset.scene = 'posee'; marquer(tenue); }
    function boucle(maintenant) {
      if (!enLecture) return;
      var x = (maintenant - depart) / 1000;
      if (x >= tenue) { finir(); return; }
      poser(x); marquer(x);
      trame = requestAnimationFrame(boucle);
    }
    function jouer(depuis) {
      if (mouvementReduit()) { finir(); return; }
      arreter();
      var d = depuis || 0;
      depart = performance.now() - d * 1000;
      enLecture = true; jouee = true; el.dataset.scene = 'lecture';
      poser(d);
      trame = requestAnimationFrame(boucle);
    }
    function aller(x) { arreter(); jouee = true; poser(x); el.dataset.scene = 'tenue'; marquer(x); }

    /* Repères : <button data-aller="3.5"> envoie la scène à l'instant 3,5 s et la tient.
       Avec data-jusqua="5.2", le repère reste allumé tant que t est dans la plage. */
    var reperes = [].slice.call(el.querySelectorAll('[data-aller]'));
    function marquer(x) {
      reperes.forEach(function (b) {
        var a = parseFloat(b.dataset.aller), z = b.dataset.jusqua ? parseFloat(b.dataset.jusqua) : a;
        var actif = x >= a - 0.01 && (b.dataset.jusqua ? x < z : false);
        if (x >= tenue - 0.01 && b.dataset.dernier != null) actif = true;
        b.setAttribute('aria-pressed', actif ? 'true' : 'false');
      });
    }
    reperes.forEach(function (b) {
      b.addEventListener('click', function () {
        var cible = b.dataset.tenir ? parseFloat(b.dataset.tenir) : parseFloat(b.dataset.aller);
        if (mouvementReduit()) { aller(cible); return; }
        /* On rejoue le passage qui mène au repère, puis on s'y arrête : le visiteur
           voit d'où vient l'état, il ne saute pas dedans. */
        var debut = parseFloat(b.dataset.aller);
        arreter(); depart = performance.now() - debut * 1000; enLecture = true; jouee = true;
        el.dataset.scene = 'lecture';
        var fin = cible;
        (function pas(maintenant) {
          if (!enLecture) return;
          var x = (maintenant - depart) / 1000;
          if (x >= fin) { aller(fin); return; }
          poser(x); marquer(x);
          trame = requestAnimationFrame(pas);
        })(performance.now());
      });
    });
    [].slice.call(el.querySelectorAll('[data-rejouer]')).forEach(function (b) {
      b.addEventListener('click', function () { jouer(0); });
    });

    /* État final d'abord : c'est ce que voit un visiteur sans animation. */
    poser(tenue);
    el.dataset.scene = 'posee';
    marquer(tenue);

    var api = { aller: aller, jouer: jouer, finir: finir, tenue: tenue, el: el,
      get t() { return t; }, get enLecture() { return enLecture; } };
    el.__scene = api;
    scenes.push(api);
    if (mouvementReduit() || !('IntersectionObserver' in window)) return api;

    if (mode === 'defilement') {
      /* t suit la traversée du bloc dans l'écran. La boucle ne tourne que lorsque
         le bloc est visible ; aucun écouteur de défilement. */
      var suivre = function () {
        if (!visible) { trame = 0; return; }
        var r = el.getBoundingClientRect(), h = window.innerHeight;
        var p = clamp((h * 0.82 - r.top) / (r.height * 0.9), 0, 1);
        poser(p * tenue); marquer(t);
        trame = requestAnimationFrame(suivre);
      };
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !trame) trame = requestAnimationFrame(suivre);
      }, { threshold: 0 }).observe(el);
      return api;
    }

    /* Mode temps : on ne remet la scène à zéro que si elle est encore sous l'écran.
       Un bloc déjà visible au chargement reste dans son état final. */
    var r0 = el.getBoundingClientRect();
    var dejaVu = r0.top < window.innerHeight * (1 - seuil) && r0.bottom > 0;
    if (!dejaVu) { poser(0); el.dataset.scene = 'attente'; marquer(0); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !jouee) { jouer(0); io.unobserve(el); }
      });
    }, { threshold: seuil });
    if (!dejaVu) io.observe(el);
    return api;
  }

  /* ---------- les apparitions courantes : [data-entree] ----------
     Le CSS par défaut affiche tout. L'état de départ ne vaut que sous
     `html.mv` (posé par le script en tête de page, hors mouvement réduit). */
  function entrees(racine) {
    var els = [].slice.call((racine || document).querySelectorAll('[data-entree]:not(.est-entre)'));
    if (!els.length) return;
    if (mouvementReduit() || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('est-entre'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('est-entre');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  window.MDP = {
    clamp: clamp, seg: seg, mix: mix, courbes: courbes, ressort: ressort, graine: graine,
    piste: piste, mouvementReduit: mouvementReduit, scene: scene, entrees: entrees, scenes: scenes
  };
})();
