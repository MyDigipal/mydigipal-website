/* ============================================================================
   MyDigipal - refonte, direction B « Grille » : les trois scènes (29/09/2026)

   Chaque scène est une fonction PURE du temps : `rendu(t)` pose l'état exact de
   l'instant t, sans mémoire. Elle n'écrit que des propriétés personnalisées
   (`--p`, `--b`, `--d`...) dont le repli, dans la feuille de style, est l'état
   final. Sans script, ou avec `?fige=1`, le schéma est donc complet, et le même
   `rendu` sert la mise en page en colonnes (ordinateur) et en pile (téléphone) :
   c'est la feuille de style qui décide si un trait se trace en largeur ou en
   hauteur.

   Origine des gestes : essais `grille-suisse` (grille qui se déploie, barre qui
   passe, bloc qui s'arrête sur les lignes), `morph-formes` (un objet qui change
   d'état) et `tableau-chiffres` (volets) de la motion-lib.
   ========================================================================== */
(function () {
  'use strict';
  var M = window.MDP;
  if (!M) return;
  var seg = M.seg, mix = M.mix, clamp = M.clamp, C = M.courbes;

  var tous = function (racine, selecteur) { return [].slice.call(racine.querySelectorAll(selecteur)); };
  var n = function (v, d) { return v.toFixed(d == null ? 4 : d); };

  /* N'écrit dans le style que ce qui a changé : une tenue ne coûte rien. */
  function poser(el, nom, valeur) {
    var c = el.__mdp || (el.__mdp = {});
    if (c[nom] === valeur) return;
    c[nom] = valeur;
    el.style.setProperty(nom, valeur);
  }

  /* Une scène plus haute que l'écran ne peut pas être visible à 35 % : le seuil
     s'adapte pour que la lecture parte quand le premier écran de la scène est là. */
  function seuilPour(el, voulu) {
    var h = el.getBoundingClientRect().height || 1;
    return Math.max(0.05, Math.min(voulu, 0.6 * window.innerHeight / h));
  }

  /* Contournement d'un défaut du socle : au changement de langue, `page.js` repose chaque
     scène par `aller()`, ce qui la marque comme déjà jouée. Une scène encore sous l'écran
     resterait vide à jamais. On la remet en attente de son entrée dans l'écran. */
  function veiller(el, scene, seuil) {
    if (!scene || !('IntersectionObserver' in window)) return;
    var io = null;
    window.addEventListener('mdp:langue', function () {
      if (el.dataset.scene !== 'attente') return;
      setTimeout(function () {
        if (M.mouvementReduit()) { scene.finir(); return; }
        if (io) io.disconnect();
        io = new IntersectionObserver(function (es) {
          if (!es[0].isIntersecting) return;
          io.disconnect(); io = null;
          scene.jouer(0);
        }, { threshold: seuil });
        io.observe(el);
        el.dataset.scene = 'attente';
      }, 0);
    });
  }

  /* La barre qui passe (essai grille-suisse) : 0,32 s pour couvrir, 0,32 s pour
     découvrir. Le texte apparaît d'un coup, sous la barre, quand elle couvre tout. */
  function barre(el, t, t0) {
    var p1 = C.inOutQuart(seg(t, t0, t0 + 0.32));
    var p2 = C.inOutQuart(seg(t, t0 + 0.32, t0 + 0.64));
    poser(el, '--b', n(p2 > 0 ? 101 * p2 : -101 * (1 - p1), 2) + '%');
    poser(el, '--o', p1 >= 0.999 ? '1' : '0');
  }

  /* ==========================================================================
     Scène 1 : Performance Max, en schéma suisse
     0,00  la grille se déploie, colonne par colonne
     0,60  le bloc bleu glisse dans sa voie et s'arrête sur ses lignes
     1,35  temps 1 : six entrées, six traits vers le bloc        tenue jusqu'à 4,40
     4,40  temps 2 : six traits, six réseaux qui s'allument       tenue jusqu'à 7,40
     7,40  temps 3 : la ligne de retour, trois jetons, deux garde-fous
     11,00 la phrase de conclusion monte de son masque            posée à 12,03
     ======================================================================== */
  function scenePmax() {
    var el = document.getElementById('scene-pmax');
    if (!el) return;
    var section = el.closest('section') || el;
    var colonnes = tous(section, '.trame i');
    var bloc = el.querySelector('.bloc');
    var entrees = tous(el, '.entree');
    var reseaux = tous(el, '.reseau');
    var retour = el.querySelector('.retour');
    var jetons = tous(el, '.jeton');
    var gardes = tous(el, '.garde');
    var conclusion = el.querySelector('.conclusion');

    var TENUE = 12.2;
    var T = { bloc: 0.6, t1: 1.35, t2: 4.4, t3: 7.4, fin: 11.0 };

    function rendu(t) {
      colonnes.forEach(function (c, i) {
        poser(c, '--p', n(C.entree(seg(t, i * 0.045, 0.5 + i * 0.045))));
      });
      poser(bloc, '--q', n(1 - C.inOutQuart(seg(t, T.bloc, T.bloc + 0.65))));

      /* Temps 1 : chaque entrée se révèle, puis son trait part vers le bloc. */
      entrees.forEach(function (e, i) {
        var t0 = T.t1 + i * 0.12;
        barre(e, t, t0);
        poser(e, '--p', n(C.entree(seg(t, t0 + 0.4, t0 + 0.85))));
        poser(e, '--f', n(seg(t, t0 + 0.7, t0 + 0.82), 3));
      });

      /* Temps 2 : le trait sort du bloc, l'écran du réseau s'allume, son nom se pose. */
      reseaux.forEach(function (r, i) {
        var t0 = T.t2 + i * 0.18;
        poser(r, '--t', n(C.entree(seg(t, t0, t0 + 0.35))));
        poser(r, '--p', n(C.inOutQuart(seg(t, t0 + 0.18, t0 + 0.54))));
        poser(r, '--o', n(seg(t, t0 + 0.4, t0 + 0.52), 3));
      });

      /* Temps 3 : la ligne descend des réseaux, revient vers le bloc, y remonte. */
      poser(retour, '--a', n(C.entree(seg(t, T.t3, T.t3 + 0.3))));
      poser(retour, '--p', n(C.inOutQuart(seg(t, T.t3 + 0.15, T.t3 + 0.85))));
      poser(retour, '--f', n(seg(t, T.t3 + 0.8, T.t3 + 0.92), 3));
      poser(bloc, '--m', n(C.entree(seg(t, T.t3 + 0.8, T.t3 + 1.1))));
      poser(bloc, '--f', n(seg(t, T.t3 + 1.0, T.t3 + 1.12), 3));

      /* Un jeton à la fois : il part du bout de la ligne et s'arrête à sa place. */
      jetons.forEach(function (j, k) {
        var t0 = T.t3 + 1.05 + k * 0.28;
        poser(j, '--d', n(1 - C.inOutCubic(seg(t, t0, t0 + 0.65))));
        poser(j, '--v', n(seg(t, t0, t0 + 0.08), 3));
        poser(j, '--o', n(seg(t, t0 + 0.5, t0 + 0.65), 3));
      });

      /* Les garde-fous : révélés par la barre ; leur trait part vers le bloc et bute sur un arrêt. */
      gardes.forEach(function (g, j) {
        var t0 = T.t3 + 2.3 + j * 0.15;
        barre(g, t, t0);
        poser(g, '--p', n(C.entree(seg(t, t0 + 0.5, t0 + 0.85))));
        poser(g, '--s', n(C.depasse(1.6)(seg(t, t0 + 0.72, t0 + 0.95))));
      });

      poser(conclusion, '--y0', n(125 * (1 - C.entree(seg(t, T.fin, T.fin + 0.9))), 2) + '%');
      poser(conclusion, '--y1', n(125 * (1 - C.entree(seg(t, T.fin + 0.13, T.fin + 1.03))), 2) + '%');

      /* La feuille de style éteint les titres des temps qui ne jouent pas, en cours de lecture seulement. */
      el.dataset.phase = t < T.t1 ? 'ouverture' : (t >= TENUE - 0.01 ? 'fin' : 'cours');
    }

    var seuil = seuilPour(el, 0.5);
    veiller(el, M.scene(el, { tenue: TENUE, rendu: rendu, seuil: seuil }), seuil);
  }

  /* ==========================================================================
     Scène 2 : la méthode, par morphing
     Une tuile voyage sur un rail à quatre quais et change de forme :
     loupe, structure, réglages, courbe qui monte.
     0,00  le rail se trace, les quatre marques se posent, la tuile arrive
     2,50  voyage vers le quai 2       tenue de 3,75 à 5,30
     5,30  voyage vers le quai 3       tenue de 6,55 à 8,10
     8,10  voyage vers le quai 4       posée à 9,35
     ======================================================================== */
  function sceneMethode() {
    var el = document.getElementById('scene-methode');
    if (!el) return;
    var tuile = el.querySelector('.tuile');
    var forme = el.querySelector('.tuile__forme');
    var trou = el.querySelector('.tuile__trou');
    var reglages = el.querySelector('.tuile__reglages');
    var quais = tous(el, '.quai');
    var places = tous(el, '.quai__place');
    if (!tuile || !forme || quais.length !== 4) return;

    /* ----- géométrie : quatre contours fermés, ramenés au même nombre de points ----- */
    var N = 240;
    var pt = function (x, y) { return { x: x, y: y }; };
    var dist = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
    function arc(pts, cx, cy, r, a0, a1, pas) {
      for (var k = 0; k <= pas; k++) { var a = mix(a0, a1, k / pas); pts.push(pt(cx + r * Math.cos(a), cy + r * Math.sin(a))); }
    }
    /* Même sens de parcours pour tous les contours. */
    function orienter(pts) {
      var s = 0;
      for (var i = 0; i < pts.length; i++) { var q = pts[(i + 1) % pts.length]; s += pts[i].x * q.y - q.x * pts[i].y; }
      return s < 0 ? pts.slice().reverse() : pts;
    }
    /* N points à égale distance le long du contour. */
    function reechantillonner(pts, nb) {
      var L = [0], tot = 0, i, k;
      for (i = 0; i < pts.length; i++) { tot += dist(pts[i], pts[(i + 1) % pts.length]); L.push(tot); }
      var out = [], j = 0;
      for (k = 0; k < nb; k++) {
        var s = tot * k / nb;
        while (j < pts.length - 1 && L[j + 1] < s) j++;
        var a = pts[j], b = pts[(j + 1) % pts.length], u = (s - L[j]) / ((L[j + 1] - L[j]) || 1);
        out.push(pt(mix(a.x, b.x, u), mix(a.y, b.y, u)));
      }
      return out;
    }
    /* Le point de départ de B tombe en face de celui de A : le morphing ne se vrille pas. */
    function aligner(A, B) {
      var best = 0, bestD = Infinity;
      for (var k = 0; k < N; k++) {
        var d = 0;
        for (var i = 0; i < N; i += 3) { var b = B[(i + k) % N]; d += (A[i].x - b.x) * (A[i].x - b.x) + (A[i].y - b.y) * (A[i].y - b.y); }
        if (d < bestD) { bestD = d; best = k; }
      }
      return B.map(function (_, i) { return B[(i + best) % N]; });
    }
    function chemin(pts) {
      var s = '';
      for (var i = 0; i < pts.length; i++) s += (i ? 'L' : 'M') + (+pts[i].x.toFixed(2)) + ' ' + (+pts[i].y.toFixed(2));
      return s + 'Z';
    }
    function melange(A, B, p) {
      var s = '';
      for (var i = 0; i < N; i++) s += (i ? 'L' : 'M') + mix(A[i].x, B[i].x, p).toFixed(1) + ' ' + mix(A[i].y, B[i].y, p).toFixed(1);
      return s + 'Z';
    }

    /* L'audit : une loupe. Le verre est un disque à part (un trou ne se morphe pas). */
    function loupe() {
      var cx = -16, cy = -16, R = 60, w = 13, L = 58, q = Math.PI / 4, d = Math.asin(w / R), pts = [];
      arc(pts, cx, cy, R, q + d, q - d + 2 * Math.PI, 72);
      var u = Math.SQRT1_2, ex = cx + (R + L) * u, ey = cy + (R + L) * u;
      pts.push(pt(ex + w * u, ey - w * u), pt(ex - w * u, ey + w * u));
      return pts;
    }
    /* La stratégie : une structure, une campagne et ses deux groupes. */
    function structure() {
      return [[-30, -80], [30, -80], [30, -36], [7, -36], [7, -8], [62, -8], [62, 34], [85, 34], [85, 78], [25, 78], [25, 34], [48, 34],
        [48, 6], [-48, 6], [-48, 34], [-25, 34], [-25, 78], [-85, 78], [-85, 34], [-62, 34], [-62, -8], [-7, -8], [-7, -36], [-30, -36]]
        .map(function (c) { return pt(c[0], c[1]); });
    }
    /* L'optimisation : un curseur de réglage. Ses deux voisins sont un groupe à part. */
    function curseur() {
      var cx = 36, r = 22, h = 6, a = Math.asin(h / r), pts = [pt(-88, -h)];
      arc(pts, cx, 0, r, Math.PI + a, 2 * Math.PI - a, 24);
      pts.push(pt(88, -h), pt(88, h));
      arc(pts, cx, 0, r, a, Math.PI - a, 24);
      pts.push(pt(-88, h));
      return pts;
    }
    /* Le reporting : une courbe qui monte. Ce sont les points du tracé écrit dans le HTML. */
    function courbe() {
      return [[40, -56], [90, -56], [90, -6], [70, -6], [70, -20.44], [10, 39.56], [-24, 5.56], [-76.22, 57.78], [-91.78, 42.22],
        [-24, -25.56], [10, 8.44], [54.44, -36], [40, -36]].map(function (c) { return pt(c[0], c[1]); });
    }

    var BRUT = [loupe(), structure(), curseur(), courbe()];
    var F = [];
    BRUT.forEach(function (b, k) {
      var r = reechantillonner(orienter(b), N);
      F.push(k ? aligner(F[k - 1], r) : r);
    });
    /* Aux tenues, le tracé exact (angles vifs) remplace le tracé échantillonné. Le dernier est celui du HTML. */
    var EXACT = [chemin(BRUT[0]), chemin(BRUT[1]), chemin(BRUT[2]), forme.getAttribute('d')];

    /* ----- les positions des quais, mesurées une fois par mise en page ----- */
    var X = [0, 0, 0, 0], Y = [0, 0, 0, 0], mesureA = -1e9;
    function mesurer() {
      var r0 = el.getBoundingClientRect();
      places.forEach(function (p, k) {
        var r = p.getBoundingClientRect();
        X[k] = r.left - r0.left; Y[k] = r.top - r0.top;
      });
      mesureA = performance.now();
    }

    var TENUE = 10;
    var VOYAGE = [2.5, 5.3, 8.1], DUREE = 1.2;
    var rebond = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI * 3) * Math.pow(1 - p, 2); };
    function station(t) {
      var s = 0;
      for (var k = 0; k < 3; k++) s += C.inOutQuart(seg(t, VOYAGE[k], VOYAGE[k] + DUREE));
      return s;
    }

    function rendu(t) {
      /* Filet de sécurité : un observateur de taille ne répond pas dans un onglet en
         arrière-plan. La mesure se refait donc au plus deux fois par seconde, jamais par image. */
      if (performance.now() - mesureA > 500) mesurer();

      /* Le rail, puis les marques. Une marque se remplit quand la tuile a atteint son quai. */
      var pr = C.entree(seg(t, 0, 0.85));
      quais.forEach(function (q, k) {
        poser(q, '--p', n(clamp(pr * 3 - k, 0, 1)));
        poser(q, '--s', n(C.depasse(1.4)(seg(t, 0.3 + k * 0.1, 0.62 + k * 0.1))));
        var arrivee = k ? VOYAGE[k - 1] + DUREE - 0.15 : 0.9;
        poser(q, '--v', n(seg(t, arrivee, arrivee + 0.2), 3));
      });

      /* La tuile : sa place sur le rail, son étirement selon la vitesse, son tassement à l'arrivée. */
      var s = station(t), k = Math.min(2, Math.floor(s)), u = s - k;
      var vitesse = (station(t + 0.016) - station(t - 0.016)) / 0.032;
      var etire = Math.min(0.07, Math.abs(vitesse) * 0.02);
      var base = C.depasse(1.2)(seg(t, 0.4, 0.95));
      var reb = 0;
      for (var j = 0; j < 3; j++) reb += 0.035 * rebond(seg(t, VOYAGE[j] + DUREE - 0.05, VOYAGE[j] + DUREE + 0.55));
      var long = Math.max(0, base * (1 + etire - reb)), large = Math.max(0, base * (1 / (1 + etire) + reb));
      var couche = Math.abs(X[3] - X[0]) >= Math.abs(Y[3] - Y[0]);
      poser(tuile, '--tx', n(mix(X[k], X[k + 1], u), 2) + 'px');
      poser(tuile, '--ty', n(mix(Y[k], Y[k + 1], u), 2) + 'px');
      poser(tuile, '--sx', n(couche ? long : large));
      poser(tuile, '--sy', n(couche ? large : long));

      /* La forme : loupe, structure, réglages, courbe. */
      var m = [0, 1, 2].map(function (i) { return C.inOutCubic(seg(t, VOYAGE[i] + 0.05, VOYAGE[i] + DUREE + 0.05)); });
      var d;
      if (m[2] >= 1) d = EXACT[3];
      else if (m[2] > 0) d = melange(F[2], F[3], m[2]);
      else if (m[1] >= 1) d = EXACT[2];
      else if (m[1] > 0) d = melange(F[1], F[2], m[1]);
      else if (m[0] >= 1) d = EXACT[1];
      else if (m[0] > 0) d = melange(F[0], F[1], m[0]);
      else d = EXACT[0];
      if (forme.__d !== d) { forme.setAttribute('d', d); forme.__d = d; }

      var verre = C.entree(seg(t, 0.6, 0.95)) * (1 - seg(m[0], 0, 0.25));
      var tv = 'translate(-16 -16) scale(' + n(verre) + ') translate(16 16)';
      if (trou.__t !== tv) { trou.setAttribute('transform', tv); trou.__t = tv; }
      var voisins = C.entree(seg(m[1], 0.75, 1)) * (1 - seg(m[2], 0, 0.25));
      var tr = 'scale(' + n(voisins) + ' 1)';
      if (reglages.__t !== tr) { reglages.setAttribute('transform', tr); reglages.__t = tr; }
    }

    mesurer();
    var seuil = seuilPour(el, 0.45);
    var scene = M.scene(el, { tenue: TENUE, rendu: rendu, seuil: seuil });
    veiller(el, scene, seuil);

    /* La mise en page change (largeur, langue, police chargée) : on remesure, puis on
       repose l'instant courant sans toucher à l'état de la scène. */
    function recaler() { mesurer(); if (scene && !scene.enLecture) rendu(scene.t); }
    if ('ResizeObserver' in window) new ResizeObserver(recaler).observe(el);
    window.addEventListener('mdp:langue', mesurer);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(recaler);
  }

  /* ==========================================================================
     Scène 3 : la preuve, en tableau à palettes
     Seuls le chiffre et son unité sont en volets. Le HTML porte les caractères
     finaux ; un volet traverse quatre caractères au plus avant de s'y poser.
     Trois lignes : 0,20 s, 0,90 s, 1,60 s. Tout est posé à 2,2 s.
     ======================================================================== */
  function scenePreuve() {
    var el = document.getElementById('scene-preuve');
    if (!el) return;
    var ALPHA = { signe: ' -+', chiffre: ' 0123456789', unite: ' %' };
    var LIGNES = [0.2, 0.9, 1.6], PAS = 0.045, BASCULE = 0.1;

    function suite(cible, alpha, k) {
      var idx = alpha.indexOf(cible);
      if (idx < 0) return [' ', cible];
      var s = [' '];
      for (var i = Math.max(1, idx - k + 1); i <= idx; i++) s.push(alpha[i]);
      return s;
    }
    /* Irrégularité déterministe : chaque volet a son petit retard, comme sur un vrai tableau. */
    function gigue(ligne, col) { return (((col * 7919 + ligne * 104729 + 17) % 97) / 97) * 0.03; }

    var cellules = [];
    tous(el, '.depart').forEach(function (ligne, l) {
      tous(ligne, '.volet').forEach(function (v, c) {
        var cible = v.getAttribute('data-cible') || ' ';
        var alpha = /[0-9]/.test(cible) ? ALPHA.chiffre : (cible === '%' ? ALPHA.unite : ALPHA.signe);
        cellules.push({
          hautFixe: v.querySelector('.volet__moitie--haut b'),
          basFixe: v.querySelector('.volet__moitie--bas b'),
          voileBas: v.querySelector('.volet__moitie--bas .volet__voile'),
          aile: v.querySelector('.volet__aile'),
          avant: v.querySelector('.volet__face--avant b'),
          voileAvant: v.querySelector('.volet__face--avant .volet__voile'),
          arriere: v.querySelector('.volet__face--arriere b'),
          voileArriere: v.querySelector('.volet__face--arriere .volet__voile'),
          suite: suite(cible, alpha, 4),
          t0: (LIGNES[l] == null ? LIGNES[LIGNES.length - 1] : LIGNES[l]) + c * PAS + gigue(l, c),
          cur: null, nxt: null
        });
      });
    });
    if (!cellules.length) return;

    /* L'état d'un volet ne touche pas à la page : il se teste hors navigateur. */
    function etat(c, t) {
      if (t < c.t0) return { cur: ' ', nxt: ' ', p: 0 };
      var k = (t - c.t0) / BASCULE, i = Math.floor(k), fin = c.suite.length - 1;
      if (i >= fin) return { cur: c.suite[fin], nxt: c.suite[fin], p: 0 };
      return { cur: c.suite[i], nxt: c.suite[i + 1], p: k - i };
    }
    function appliquer(c, e) {
      if (c.cur !== e.cur) { c.basFixe.textContent = e.cur; c.avant.textContent = e.cur; c.cur = e.cur; }
      if (c.nxt !== e.nxt) { c.hautFixe.textContent = e.nxt; c.arriere.textContent = e.nxt; c.nxt = e.nxt; }
      var r = C.chute(e.p);
      c.aile.style.transform = r ? 'rotateX(' + (-180 * r).toFixed(2) + 'deg)' : '';
      c.voileAvant.style.opacity = (0.2 * r).toFixed(3);
      c.voileArriere.style.opacity = (0.2 * (1 - r) * (e.p > 0 ? 1 : 0)).toFixed(3);
      c.voileBas.style.opacity = (0.14 * Math.sin(r * Math.PI)).toFixed(3);
    }

    var seuil = seuilPour(el, 0.4);
    veiller(el, M.scene(el, {
      tenue: 2.6,
      seuil: seuil,
      rendu: function (t) { for (var i = 0; i < cellules.length; i++) appliquer(cellules[i], etat(cellules[i], t)); }
    }), seuil);
  }

  scenePmax();
  sceneMethode();
  scenePreuve();
})();
