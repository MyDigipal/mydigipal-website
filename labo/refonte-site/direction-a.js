/* ============================================================================
   MyDigipal - maquette de la refonte, direction A « Encre » (29/09/2026)
   Les scènes de la direction. À charger après socle/motion.js et socle/page.js.

   Trois choses ici :
   1. la scène principale, #scene-pmax : la carte de verre, une phrase à gauche
      et une à droite (essai `carte-3d`, en CSS 3D, sans WebGL) ;
   2. la seconde scène, #scene-methode : un seul objet voyage sur un rail et
      change de forme (essai `morph-formes`) ;
   3. les chiffres du hero et de la preuve, qui montent une fois vers leur valeur.

   Règle commune : à l'instant de tenue, chaque scène RETIRE ses styles en ligne.
   L'état final est donc celui de la feuille de style, le même que sans script.
   ========================================================================== */
(function () {
  'use strict';
  var M = window.MDP;
  if (!M) return;

  var seg = M.seg, mix = M.mix, clamp = M.clamp, C = M.courbes, ressort = M.ressort;
  var large = window.matchMedia('(min-width: 1024px)');
  var inOutSine = function (p) { return -(Math.cos(Math.PI * p) - 1) / 2; };
  /* Rebond amorti : nul aux deux bouts, il ne fait sauter ni l'arrivée ni la fin. */
  var rebond = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI * 3) * Math.pow(1 - p, 2); };

  function tous(racine, selecteur) { return [].slice.call(racine.querySelectorAll(selecteur)); }
  function px(v) { return v.toFixed(2) + 'px'; }

  /* Le seuil de déclenchement se règle sur la hauteur du bloc : sur téléphone la
     scène principale fait deux écrans, 35 % du bloc ne seraient jamais visibles
     d'un coup. On demande une part d'écran, pas une part de bloc. */
  function seuilPour(el, partEcran) {
    var h = el.getBoundingClientRect().height || 1;
    return clamp((window.innerHeight * partEcran) / h, 0.12, 0.6);
  }

  /* Redessiner l'instant courant sans marquer la scène comme jouée. Le socle a reçu
     `reposer()` le 30/09/2026 ; `aller(t)` reste le repli pour une version plus ancienne. */
  function reposer(scene) {
    if (scene.reposer) scene.reposer(); else scene.aller(scene.t);
  }

  /* Filet de sécurité. Dans la première version du socle, un changement de langue
     appelait `aller(t)` sur chaque scène, ce qui la marquait comme déjà jouée : une
     scène pas encore vue restait à son instant zéro, vide, et ne jouait plus à son
     entrée dans l'écran. Le socle est corrigé ; cette veille reste, elle lance la scène
     à sa première entrée si personne ne l'a fait. */
  function veiller(scene, el, seuil) {
    if (!scene || M.mouvementReduit() || !('IntersectionObserver' in window)) return;
    if (el.dataset.scene !== 'attente') return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(el);
        var etat = el.dataset.scene;
        if (etat === 'attente' || (etat === 'tenue' && scene.t === 0)) scene.jouer(0);
      });
    }, { threshold: seuil });
    io.observe(el);
  }

  /* Une ligne qui monte de son masque (courbe A, durée d'une ligne de titre). */
  function poserLigne(noeud, t, debut, duree) {
    var e = C.entree(seg(t, debut, debut + duree));
    noeud.style.transform = 'translate3d(0,' + ((1 - e) * 125).toFixed(2) + '%,0)';
  }
  /* Un paragraphe qui prend place : le déplacement fait le geste, l'opacité est courte. */
  function poserBloc(noeud, t, debut) {
    var e = C.entree(seg(t, debut, debut + 0.55));
    noeud.style.transform = 'translate3d(0,' + px((1 - e) * 22) + ',0)';
    noeud.style.opacity = seg(t, debut, debut + 0.14).toFixed(3);
  }
  function vider(noeuds) {
    noeuds.forEach(function (n) {
      if (!n) return;
      n.style.transform = '';
      n.style.opacity = '';
      n.style.strokeDashoffset = '';
      n.style.removeProperty('--place');
    });
  }

  /* ==========================================================================
     1. La scène principale : comment marche une campagne Performance Max
     ========================================================================== */
  function scenePmax() {
    var el = document.getElementById('scene-pmax');
    if (!el) return;
    var un = function (s) { return el.querySelector(s); };

    var champ = un('.champ'), pose = un('.carte-pose'), carte = un('.carte');
    var ombre = un('.carte-ombre'), reflet = un('.carte__reflet');
    var elements = tous(el, '.carte__elements .puce');
    var retours = tous(el, '.carte__retours .puce');
    var places = tous(el, '.carte__elements > li, .carte__retours > li');
    var traits = tous(el, '.faisceau__trait'), impasses = tous(el, '.faisceau__impasse');
    var tiges = tous(el, '.tige');
    var reseaux = tous(el, '.reseaux > li');
    var bouts = tous(el, '.garde__trait'), barres = tous(el, '.garde__signe'), noms = tous(el, '.garde__nom');
    var titres = [1, 2, 3].map(function (n) { return un('.temps--' + n + ' .ligne > span'); });
    var textes = [1, 2, 3].map(function (n) { return tous(el, '.temps--' + n + ' .temps__texte'); });
    var fin = [un('.conclusion__1'), un('.conclusion__2')];

    var touches = [champ, pose, carte, ombre, reflet].concat(elements, retours, traits, impasses, tiges,
      reseaux, bouts, barres, noms, places, titres, textes[0], textes[1], textes[2], fin);

    /* ---------- la partition (secondes) ----------
       Une chose bouge à la fois, et chaque temps se termine par une tenue de
       lecture d'au moins 1,5 s avant que la carte ne pivote. */
    var TENUE = 14;
    var P = {
      entree: 0.1,
      t1: { titre: 1.1, texte: 1.4, elements: 1.8, pas: 0.24 },          /* posé à 3,55 ; tenue jusqu'à 5,1 */
      pivot1: [5.1, 5.9],
      t2: { titre: 5.7, texte: 6.0, traits: 6.4, pas: 0.2 },              /* posé à 8,1 ; tenue jusqu'à 9,6 */
      pivot2: [9.6, 10.4],
      t3: { titre: 10.0, texte: 10.3, retours: 10.6, pasR: 0.28, gardes: 11.8, pasG: 0.25 },
      fin: [12.95, 13.08],
      reflets: [[0.8, 2.0, 1], [5.2, 6.3, -1], [9.7, 10.8, 1]]
    };

    function rendu(t) {
      /* L'état final est celui de la feuille de style. */
      if (t >= TENUE - 0.001) { vider(touches); return; }
      var L = large.matches;

      /* ----- la carte : deux ressorts, la position se pose, le pivot continue ----- */
      var u = t - P.entree;
      var ep = ressort(u, 0.85, 3.8), er = ressort(u, 0.60, 3.4);
      var p1 = C.inOutCubic(seg(t, P.pivot1[0], P.pivot1[1]));
      var p2 = C.inOutCubic(seg(t, P.pivot2[0], P.pivot2[1]));
      var D0 = L ? [150, 190] : [56, 130];
      var R0 = L ? [20, -54, 7] : [16, -40, 5];
      var RA = L ? [3, -9] : [2, -6];      /* ouverte vers ce qui arrive, par la gauche */
      var RB = L ? [2, 10] : [-5, 4];      /* tournée vers les réseaux : à droite, ou dessous sur téléphone */
      var RC = L ? [2.5, 5] : [2, 3];      /* le repos : les valeurs de la feuille de style */
      var rx = mix(R0[0], RA[0], er), ry = mix(R0[1], RA[1], er), rz = mix(R0[2], 0, er);
      rx = mix(rx, RB[0], p1); ry = mix(ry, RB[1], p1);
      rx = mix(rx, RC[0], p2); ry = mix(ry, RC[1], p2);
      /* Un pivot s'accompagne d'un léger recul : la carte ne tourne pas sur place. */
      var recul = -40 * (C.bosse(p1) + C.bosse(p2));
      champ.style.opacity = seg(t, P.entree, P.entree + 0.22).toFixed(3);
      pose.style.transform = 'translate3d(' + px(D0[0] * (1 - ep)) + ',' + px(D0[1] * (1 - ep)) + ',' + px(recul) + ')';
      carte.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg) rotateZ(' + rz.toFixed(3) + 'deg)';
      var eo = clamp(ep, 0, 1);
      ombre.style.opacity = eo.toFixed(3);
      ombre.style.transform = 'translate3d(' + px(D0[0] * 0.5 * (1 - ep)) + ',0,0) scale(' + mix(0.62, 1, eo).toFixed(4) + ',1)';

      /* ----- le reflet traverse le verre, une fois par temps ----- */
      var rf = 0, rxp = -160;
      P.reflets.forEach(function (r) {
        var s = seg(t, r[0], r[1]);
        if (s > 0 && s < 1) { rf = C.bosse(s); rxp = r[2] > 0 ? mix(-160, 230, inOutSine(s)) : mix(230, -160, inOutSine(s)); }
      });
      reflet.style.opacity = rf.toFixed(3);
      reflet.style.transform = 'translate3d(' + rxp.toFixed(2) + '%,0,0) skewX(-18deg)';

      /* ----- temps 1 : la phrase à gauche, les six éléments se rangent dans la carte ----- */
      poserLigne(titres[0], t, P.t1.titre, 0.9);
      textes[0].forEach(function (n) { poserBloc(n, t, P.t1.texte); });
      var course = L ? 300 : 230;
      elements.forEach(function (n, i) {
        var a = P.t1.elements + P.t1.pas * i;
        var p = C.entree(seg(t, a, a + 0.55));
        n.style.transform = 'translate3d(' + px(-(1 - p) * course) + ',0,14px)';
        n.style.opacity = seg(t, a, a + 0.1).toFixed(3);
        /* Sa place l'attend dans la carte, et s'efface quand il s'y range. */
        places[i].style.setProperty('--place', (1 - seg(t, a + 0.12, a + 0.4)).toFixed(3));
      });

      /* ----- temps 2 : la phrase à droite, le faisceau se trace, les réseaux se posent ----- */
      poserLigne(titres[1], t, P.t2.titre, 0.9);
      textes[1].forEach(function (n) { poserBloc(n, t, P.t2.texte); });
      reseaux.forEach(function (n, i) {
        var a = P.t2.traits + P.t2.pas * i;
        var trace = C.inOutCubic(seg(t, a, a + 0.45));
        if (traits[i]) {
          traits[i].style.strokeDashoffset = (1 - trace).toFixed(4);
          traits[i].style.opacity = trace > 0 ? '1' : '0';
        }
        /* Sur téléphone, trois tiges pour la première rangée ; la seconde se pose à leur suite. */
        if (tiges[i]) tiges[i].style.transform = 'scale(1,' + trace.toFixed(4) + ')';
        var q = C.depasse(1.4)(seg(t, a + 0.28, a + 0.68));
        n.style.transform = 'scale(' + mix(0.82, 1, q).toFixed(4) + ')';
        n.style.opacity = seg(t, a + 0.28, a + 0.4).toFixed(3);
      });

      /* ----- temps 3 : les conversions reviennent, les garde-fous ferment un passage ----- */
      poserLigne(titres[2], t, P.t3.titre, 0.9);
      textes[2].forEach(function (n) { poserBloc(n, t, P.t3.texte); });
      retours.forEach(function (n, j) {
        var a = P.t3.retours + P.t3.pasR * j;
        var p = C.entree(seg(t, a, a + 0.55));
        /* Elles reviennent d'où sont les réseaux : de la droite sur ordinateur, du bas sur téléphone. */
        n.style.transform = L
          ? 'translate3d(' + px((1 - p) * 380) + ',0,14px)'
          : 'translate3d(0,' + px((1 - p) * 210) + ',14px)';
        n.style.opacity = seg(t, a, a + 0.1).toFixed(3);
        places[elements.length + j].style.setProperty('--place', (1 - seg(t, a + 0.12, a + 0.4)).toFixed(3));
      });
      barres.forEach(function (n, k) {
        var a = P.t3.gardes + P.t3.pasG * k;
        var trace = C.inOutCubic(seg(t, a, a + 0.3));
        if (impasses[k]) {
          impasses[k].style.strokeDashoffset = (1 - trace).toFixed(4);
          impasses[k].style.opacity = trace > 0 ? '1' : '0';
        }
        if (bouts[k]) bouts[k].style.transform = 'scale(' + trace.toFixed(4) + ',1)';
        var ferme = C.depasse(1.6)(seg(t, a + 0.2, a + 0.5));
        n.style.transform = 'scale(' + Math.max(0, ferme).toFixed(4) + ')';
        n.style.opacity = seg(t, a + 0.2, a + 0.3).toFixed(3);
        var e = C.entree(seg(t, a + 0.3, a + 0.85));
        noms[k].style.transform = 'translate3d(' + px(-(1 - e) * 12) + ',0,0)';
        noms[k].style.opacity = seg(t, a + 0.3, a + 0.44).toFixed(3);
      });

      /* ----- la pose finale : la phrase de conclusion ----- */
      poserLigne(fin[0], t, P.fin[0], 0.9);
      poserLigne(fin[1], t, P.fin[1], 0.9);
    }

    /* Sur téléphone la carte est sous la première phrase : on attend qu'elle soit
       entrée dans l'écran pour lancer la scène. */
    var seuil = seuilPour(el, large.matches ? 0.45 : 0.6);
    var scene = M.scene(el, { tenue: TENUE, rendu: rendu, seuil: seuil });
    veiller(scene, el, seuil);
    /* Au passage d'une mise en page à l'autre, la pose se recalcule. */
    var rafraichir = function () {
      if (scene && !scene.enLecture) reposer(scene);
    };
    if (large.addEventListener) large.addEventListener('change', rafraichir);
    return scene;
  }

  /* ==========================================================================
     2. La seconde scène : de l'audit au reporting, un objet qui change de forme
     ========================================================================== */

  /* GEO:DEBUT
     La géométrie des quatre formes. Bloc autonome (il ne connaît que Math) : le
     même code sert ici au morphing et, hors navigateur, à écrire dans le HTML
     le tracé de l'état final et ceux des petites traces laissées aux stations. */
  var GEO = (function () {
    var N = 240;
    var pt = function (x, y) { return { x: x, y: y }; };
    var sub = function (a, b) { return pt(a.x - b.x, a.y - b.y); };
    var add = function (a, b) { return pt(a.x + b.x, a.y + b.y); };
    var mul = function (a, k) { return pt(a.x * k, a.y * k); };
    var dist = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
    var norm = function (a) { var l = Math.hypot(a.x, a.y) || 1; return pt(a.x / l, a.y / l); };
    var borne = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
    var melanger = function (a, b, p) { return a + (b - a) * p; };

    /* Remplace chaque sommet par un congé de rayon r (nombre ou tableau). */
    function arrondir(pts, rayons, n) {
      var out = [], m = pts.length;
      for (var i = 0; i < m; i++) {
        var p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m];
        var v1 = norm(sub(p0, p1)), v2 = norm(sub(p2, p1));
        var ang = Math.acos(borne(v1.x * v2.x + v1.y * v2.y, -1, 1));
        var r = typeof rayons === 'number' ? rayons : rayons[i];
        if (ang < 0.02 || ang > Math.PI - 0.02 || !(r > 0)) { out.push(p1); continue; }
        var tanH = Math.tan(ang / 2);
        var rr = Math.min(r, dist(p0, p1) / 2 * tanH, dist(p2, p1) / 2 * tanH);
        var d = rr / tanH;
        var a = add(p1, mul(v1, d)), b = add(p1, mul(v2, d));
        var c = add(p1, mul(norm(add(v1, v2)), rr / Math.sin(ang / 2)));
        var a0 = Math.atan2(a.y - c.y, a.x - c.x), a1 = Math.atan2(b.y - c.y, b.x - c.x);
        var da = a1 - a0;
        while (da > Math.PI) da -= 2 * Math.PI;
        while (da < -Math.PI) da += 2 * Math.PI;
        for (var k = 0; k <= n; k++) { var aa = a0 + da * k / n; out.push(pt(c.x + rr * Math.cos(aa), c.y + rr * Math.sin(aa))); }
      }
      return out;
    }
    /* Même sens de parcours pour tous les contours. */
    function orienter(pts) {
      var s = 0;
      for (var i = 0; i < pts.length; i++) { var q = pts[(i + 1) % pts.length]; s += pts[i].x * q.y - q.x * pts[i].y; }
      return s < 0 ? pts.slice().reverse() : pts;
    }
    /* N points à égale distance le long du contour fermé. */
    function reechantillonner(pts, n) {
      var L = [0], tot = 0, i;
      for (i = 0; i < pts.length; i++) { tot += dist(pts[i], pts[(i + 1) % pts.length]); L.push(tot); }
      var out = [], j = 0;
      for (var k = 0; k < n; k++) {
        var s = tot * k / n;
        while (j < pts.length - 1 && L[j + 1] < s) j++;
        var a = pts[j], b = pts[(j + 1) % pts.length], u = (s - L[j]) / ((L[j + 1] - L[j]) || 1);
        out.push(pt(melanger(a.x, b.x, u), melanger(a.y, b.y, u)));
      }
      return out;
    }
    /* Le point de départ de B tombe en face de celui de A (moindres carrés). */
    function aligner(A, B) {
      var best = 0, bestD = Infinity;
      for (var k = 0; k < N; k++) {
        var d = 0;
        for (var i = 0; i < N; i += 3) { var b = B[(i + k) % N]; d += (A[i].x - b.x) * (A[i].x - b.x) + (A[i].y - b.y) * (A[i].y - b.y); }
        if (d < bestD) { bestD = d; best = k; }
      }
      return B.map(function (_, i) { return B[(i + best) % N]; });
    }
    function contour(pts, rayons) { return reechantillonner(orienter(arrondir(pts, rayons, 8)), N); }

    /* L'audit : une loupe. Le verre est un disque à part (un trou ne se morphe pas). */
    function loupe() {
      var cx = -10, cy = -10, R = 38, w = 9, long = 40, a = Math.PI / 4, da = Math.asin(w / R);
      var pts = [], rayons = [], n = 60;
      for (var k = 0; k <= n; k++) {
        var ang = (a + da) + (2 * Math.PI - 2 * da) * k / n;
        pts.push(pt(cx + R * Math.cos(ang), cy + R * Math.sin(ang))); rayons.push(0);
      }
      var d = pt(Math.cos(a), Math.sin(a)), nrm = pt(-d.y, d.x);
      var bout = pt(cx + d.x * (R + long), cy + d.y * (R + long));
      pts.push(sub(bout, mul(nrm, w))); rayons.push(8);
      pts.push(add(bout, mul(nrm, w))); rayons.push(8);
      return contour(pts, rayons);
    }
    /* La stratégie : une structure, un bloc qui en commande deux. */
    function structure() {
      var pts = [
        pt(-21, -52), pt(21, -52), pt(21, -24), pt(5, -24), pt(5, -6), pt(43, -6), pt(43, 18), pt(57, 18), pt(57, 48),
        pt(19, 48), pt(19, 18), pt(33, 18), pt(33, 4), pt(-33, 4), pt(-33, 18), pt(-19, 18), pt(-19, 48), pt(-57, 48),
        pt(-57, 18), pt(-43, 18), pt(-43, -6), pt(-5, -6), pt(-5, -24), pt(-21, -24)
      ];
      var r = [7, 7, 7, 2, 2, 5, 2, 7, 7, 7, 7, 2, 2, 2, 2, 7, 7, 7, 7, 2, 5, 2, 2, 7];
      return contour(pts, r);
    }
    /* L'optimisation : un curseur de réglage sur sa glissière. */
    function curseur() {
      var h = 6, x0 = -58, x1 = 58, kx = 18, R = 23, pts = [], rayons = [];
      var dx = Math.sqrt(R * R - h * h), a0 = Math.asin(h / R), n = 28, k, ang;
      pts.push(pt(x0, -h)); rayons.push(h);
      pts.push(pt(kx - dx, -h)); rayons.push(3);
      for (k = 1; k < n; k++) { ang = Math.PI + a0 + (Math.PI - 2 * a0) * k / n; pts.push(pt(kx + R * Math.cos(ang), R * Math.sin(ang))); rayons.push(0); }
      pts.push(pt(kx + dx, -h)); rayons.push(3);
      pts.push(pt(x1, -h)); rayons.push(h);
      pts.push(pt(x1, h)); rayons.push(h);
      pts.push(pt(kx + dx, h)); rayons.push(3);
      for (k = 1; k < n; k++) { ang = a0 + (Math.PI - 2 * a0) * k / n; pts.push(pt(kx + R * Math.cos(ang), R * Math.sin(ang))); rayons.push(0); }
      pts.push(pt(kx - dx, h)); rayons.push(3);
      pts.push(pt(x0, h)); rayons.push(h);
      return contour(pts, rayons);
    }
    /* Le reporting : une courbe qui monte, terminée par sa flèche. */
    function courbe() {
      var P = [pt(-58, 36), pt(-22, -2), pt(2, 18), pt(40, -22)], h = 8, aile = 21, pointe = 26;
      var d = [], n = [], i;
      for (i = 0; i < P.length - 1; i++) { d.push(norm(sub(P[i + 1], P[i]))); n.push(pt(-d[i].y, d[i].x)); }
      var onglet = function (k) { return mul(add(n[k - 1], n[k]), h / (1 + n[k - 1].x * n[k].x + n[k - 1].y * n[k].y)); };
      var m1 = onglet(1), m2 = onglet(2), dn = d[2], nn = n[2], bout = P[3];
      var pts = [
        sub(P[0], mul(n[0], h)), sub(P[1], m1), sub(P[2], m2), sub(bout, mul(nn, h)), sub(bout, mul(nn, aile)),
        add(bout, mul(dn, pointe)),
        add(bout, mul(nn, aile)), add(bout, mul(nn, h)), add(P[2], m2), add(P[1], m1), add(P[0], mul(n[0], h))
      ];
      return contour(pts, [8, 7, 7, 2, 5, 5, 5, 2, 7, 7, 8]);
    }

    var F = [loupe()];
    F.push(aligner(F[0], structure()));
    F.push(aligner(F[1], curseur()));
    F.push(aligner(F[2], courbe()));

    /* Interpolation point à point, avec une ondulation qui n'existe qu'au milieu du passage. */
    function melange(A, B, p, amp) {
      var w = Math.sin(p * Math.PI), s = '';
      for (var i = 0; i < N; i++) {
        var x = melanger(A[i].x, B[i].x, p), y = melanger(A[i].y, B[i].y, p);
        if (amp > 0 && w > 0) {
          var ang = Math.atan2(y, x), r = Math.hypot(x, y) + amp * w * Math.sin(ang * 3 + p * 6.2832);
          x = r * Math.cos(ang); y = r * Math.sin(ang);
        }
        s += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      return s + 'Z';
    }

    return {
      formes: F,
      melange: melange,
      chemin: function (k) { return melange(F[k], F[k], 0, 0); },
      /* Les trous : le verre de la loupe, l'œil du curseur. */
      trous: [{ x: -10, y: -10, r: 25 }, null, { x: 18, y: 0, r: 9 }, null]
    };
  })();
  /* GEO:FIN */

  function sceneMethode() {
    var el = document.getElementById('scene-methode');
    if (!el) return;
    var ancres = tous(el, '.station__ancre');
    var avances = tous(el, '.station__avance');
    var traces = tous(el, '.station__trace');
    var noms = tous(el, '.station__nom');
    var textes = tous(el, '.station').map(function (s) { return tous(s, '.station__texte'); });
    var voyageur = el.querySelector('.voyageur'), corps = el.querySelector('.voyageur__corps');
    var ombre = el.querySelector('.voyageur__ombre');
    var forme = el.querySelector('.voyageur__forme'), trou = el.querySelector('.voyageur__trou');
    if (!voyageur || ancres.length !== 4) return;

    var formeFinale = forme.getAttribute('d');
    var touches = [voyageur, corps, ombre].concat(avances, traces, noms, textes[0], textes[1], textes[2], textes[3]);

    /* ---------- la partition (secondes) ---------- */
    var TENUE = 9;
    var NAIT = [0.15, 0.8];
    var VOYAGE = [[1.8, 3.0], [4.2, 5.4], [6.6, 7.8]];
    var MORPH = [[1.9, 3.1], [4.3, 5.5], [6.7, 7.9]];
    var REBOND = [[3.0, 3.7], [5.4, 6.1], [7.8, 8.5]];
    var ARRIVE = [0.35, 2.85, 5.25, 7.65];

    /* La place des quatre stations. Elle se mesure au départ de chaque lecture et à
       chaque changement de mise en page (largeur, langue, police chargée), jamais à
       chaque image : une mesure prise avant l'arrivée de la police posait l'objet à
       neuf pixels de sa station. */
    var geo = null, dernier = Infinity;
    function mesurer() {
      var r0 = el.getBoundingClientRect();
      geo = ancres.map(function (a) {
        var r = a.getBoundingClientRect();
        return { x: r.left + r.width / 2 - r0.left, y: r.top + r.height / 2 - r0.top };
      });
    }
    function place(t) {
      var x = geo[0].x, y = geo[0].y;
      for (var k = 0; k < 3; k++) {
        var p = C.inOutQuart(seg(t, VOYAGE[k][0], VOYAGE[k][1]));
        x += (geo[k + 1].x - geo[k].x) * p;
        y += (geo[k + 1].y - geo[k].y) * p;
      }
      return { x: x, y: y };
    }

    function rendu(t) {
      if (t >= TENUE - 0.001) {
        vider(touches);
        forme.setAttribute('d', formeFinale);
        trou.setAttribute('r', '0');
        dernier = t;
        return;
      }
      if (!geo || t < dernier) mesurer();
      dernier = t;
      var L = large.matches;

      /* ----- le voyageur : sa place, son étirement selon la vitesse, son rebond ----- */
      var ici = place(t), avant = place(t - 0.016), apres = place(t + 0.016);
      var v = Math.hypot(apres.x - avant.x, apres.y - avant.y) / 0.032;
      var etire = Math.min(0.2, v / 5200);
      var base = Math.max(0, C.depasse(1.7)(seg(t, NAIT[0], NAIT[1])));
      var reb = 0;
      REBOND.forEach(function (r) { reb += rebond(seg(t, r[0], r[1])); });
      reb *= 0.11;
      var lon = base * (1 + etire - reb), tra = base * (1 / (1 + etire) + reb);
      voyageur.style.transform = 'translate3d(' + px(ici.x - geo[3].x) + ',' + px(ici.y - geo[3].y) + ',0)';
      corps.style.transform = L
        ? 'scale(' + lon.toFixed(4) + ',' + tra.toFixed(4) + ')'
        : 'scale(' + tra.toFixed(4) + ',' + lon.toFixed(4) + ')';
      ombre.style.opacity = clamp(base, 0, 1).toFixed(3);
      ombre.style.transform = 'scale(' + (L ? lon : tra).toFixed(4) + ',1)';

      /* ----- la forme : loupe, structure, curseur, courbe ----- */
      var m = MORPH.map(function (f) { return C.inOutCubic(seg(t, f[0], f[1])); });
      var k = m[2] > 0 ? 2 : (m[1] > 0 ? 1 : 0);
      forme.setAttribute('d', GEO.melange(GEO.formes[k], GEO.formes[k + 1], m[k], 2.4));
      var r, cx, cy;
      if (m[1] > 0) {
        cx = GEO.trous[2].x; cy = GEO.trous[2].y;
        r = GEO.trous[2].r * Math.max(0, C.depasse(1.5)(seg(m[1], 0.6, 1))) * (1 - seg(m[2], 0, 0.4));
      } else {
        cx = GEO.trous[0].x; cy = GEO.trous[0].y;
        r = GEO.trous[0].r * (1 - C.inOutCubic(seg(m[0], 0, 0.4)));
      }
      trou.setAttribute('cx', cx); trou.setAttribute('cy', cy); trou.setAttribute('r', r.toFixed(2));

      /* ----- le rail se remplit derrière lui ----- */
      avances.forEach(function (n, i) {
        var p = C.inOutQuart(seg(t, VOYAGE[i][0], VOYAGE[i][1]));
        n.style.transform = L ? 'scale(' + p.toFixed(4) + ',1)' : 'scale(1,' + p.toFixed(4) + ')';
      });

      /* ----- il laisse sa forme à chaque station qu'il quitte ----- */
      traces.forEach(function (n, i) {
        var a = VOYAGE[i] ? VOYAGE[i][0] + 0.3 : TENUE;
        n.style.transform = 'scale(' + Math.max(0, C.depasse(1.6)(seg(t, a, a + 0.4))).toFixed(4) + ')';
        n.style.opacity = seg(t, a, a + 0.1).toFixed(3);
      });

      /* ----- les textes sont toujours là : seul leur accent s'anime ----- */
      /* Même atténués ils restent lisibles : 4,5 de contraste au moins. */
      noms.forEach(function (n, i) {
        var e = C.entree(seg(t, ARRIVE[i], ARRIVE[i] + 0.55));
        n.style.opacity = mix(0.6, 1, e).toFixed(3);
        textes[i].forEach(function (p) { p.style.opacity = mix(0.85, 1, e).toFixed(3); });
      });
    }

    var seuil = seuilPour(el, 0.4);
    var scene = M.scene(el, { tenue: TENUE, rendu: rendu, seuil: seuil });
    veiller(scene, el, seuil);
    /* Une autre langue, une autre largeur, la police qui arrive : les stations ont bougé,
       on remesure et on redessine l'instant courant. */
    var perime = function () { geo = null; };
    var rafraichir = function () {
      perime();
      if (scene && !scene.enLecture) reposer(scene);
    };
    window.addEventListener('mdp:langue', perime);
    window.addEventListener('resize', rafraichir);
    if ('ResizeObserver' in window) new ResizeObserver(rafraichir).observe(el);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rafraichir);
    return scene;
  }

  /* ==========================================================================
     3. Les chiffres montent une fois vers leur valeur
     Le HTML porte la valeur finale ; elle est rendue telle quelle à la tenue.
     ========================================================================== */
  function sceneChiffres(el, decalage, seuil) {
    if (!el) return null;
    var comptes = tous(el, '.compte');
    if (!comptes.length) return null;
    var finaux = comptes.map(function (n) { return n.textContent; });
    var DUREE = 1.2;
    var TENUE = DUREE + decalage * (comptes.length - 1) + 0.05;
    var scene = M.scene(el, {
      tenue: TENUE, seuil: seuil,
      rendu: function (t) {
        comptes.forEach(function (n, i) {
          var texte = finaux[i];
          if (t < TENUE - 0.001) {
            var p = C.outQuart(seg(t, i * decalage, i * decalage + DUREE));
            var v = Math.round(parseFloat(n.dataset.compte) * p);
            texte = v === 0 ? '0' : (n.dataset.signe || '') + v;
          }
          if (n.textContent !== texte) n.textContent = texte;
        });
      }
    });
    veiller(scene, el, seuil);
    return scene;
  }

  scenePmax();
  sceneMethode();
  var hero = document.getElementById('scene-resultats');
  var sceneHero = sceneChiffres(hero, 0.14, 0.4);
  /* Le hero est déjà à l'écran au chargement : le socle le laisserait dans son état
     final. Ses trois chiffres montent une fois, le texte autour ne bouge pas. */
  if (sceneHero && hero.dataset.scene === 'posee' && !M.mouvementReduit()) sceneHero.jouer(0);
  sceneChiffres(document.getElementById('scene-preuve'), 0.18, 0.3);
})();
