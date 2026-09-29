/* ============================================================================
   MyDigipal - refonte du site, direction C « Atelier » (29/09/2026)
   Les deux scènes de la page Google Ads.

   1. #scene-pmax    l'usine isométrique de Performance Max (essai `isometrique`)
   2. #scene-methode la méthode en quatre temps, par morphing (essai `morph-formes`)

   Ce qui change par rapport aux essais, écrits pour la vidéo :
   - le dessin isométrique part dans un canevas 2D (une seule couche, ratio de
     pixels plafonné à 2) au lieu d'un SVG réinjecté par innerHTML à chaque image ;
   - le dessin ne contient aucun texte : les étiquettes sont du HTML, couché dans
     le plan de la face qui les porte dès que la scène est assez grande, et sorti
     en listes sous la scène quand elle ne l'est pas (téléphone) ;
   - l'état de chaque scène est une fonction pure du temps, bornée à l'instant de
     tenue : rien ne sort, rien ne boucle ;
   - sur téléphone, une caméra tient la pose sur la zone dont on parle puis
     glisse vers la suivante, et revient au plan d'ensemble pour la pose finale.

   Le même code dessine l'état final en SVG (`MDPAtelier.svgFinal()`), recopié
   dans le HTML : c'est ce que voit un visiteur sans JavaScript.
   ========================================================================== */
(function () {
  'use strict';
  var W = window, MDP = W.MDP;
  if (!MDP) return;

  var clamp = MDP.clamp, seg = MDP.seg, mix = MDP.mix, K = MDP.courbes;
  var entree = K.entree, bosse = K.bosse, inOutCubic = K.inOutCubic, inOutQuart = K.inOutQuart;
  /* Le dépassement est réservé aux objets (blocs, caisses, jetons, barrières). */
  var monte = K.depasse(1.3), surgit = K.depasse(1.6);
  var inQuad = function (p) { return p * p; };
  var TAU = Math.PI * 2;
  function mod(a, n) { return ((a % n) + n) % n; }

  /* ==========================================================================
     1. L'ISOMÉTRIE
     Projection isométrique vraie : x vers la droite et le bas, y vers la gauche
     et le bas, z vers le haut. La caméra regarde depuis (1, 1, 1).
     ======================================================================== */
  var CO = Math.cos(Math.PI / 6), SI = 0.5;
  /* La vue : origine à l'écran, taille d'une unité en pixels, enfoncement de la scène. */
  var vue = { ox: 0, oy: 0, u: 1, dz: 0 };
  function proj(p) {
    return [vue.ox + (p[0] - p[1]) * CO * vue.u, vue.oy + ((p[0] + p[1]) * SI - p[2] - vue.dz) * vue.u];
  }

  /* Les couleurs de la maquette (jetons de la direction, en composantes). */
  var PLAQUE = [26, 47, 79], BLOC = [59, 95, 153], TAPIS = [16, 29, 50], RAIL = [38, 62, 102],
      FLUX = [127, 196, 221], IVOIRE = [244, 241, 234], SIGNAL = [255, 106, 77], CREUX = [6, 13, 26];
  function rgb(c, k) {
    k = k == null ? 1 : k;
    return 'rgb(' + Math.round(clamp(c[0] * k, 0, 255)) + ',' + Math.round(clamp(c[1] * k, 0, 255)) + ',' + Math.round(clamp(c[2] * k, 0, 255)) + ')';
  }
  function melC(a, b, p) { return [mix(a[0], b[0], p), mix(a[1], b[1], p), mix(a[2], b[2], p)]; }

  /* La lumière vient de la gauche et du haut : le dessus est le plus clair, la face
     tournée vers +y vaut 0,73, la face tournée vers +x 0,46. Le vecteur pointe VERS
     la lumière ; les ombres portées partent donc vers +x. */
  var LUM = (function () { var v = [-0.6, 0.2, 0.75], n = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / n, v[1] / n, v[2] / n]; })();
  function lum(n) { var d = n[0] * LUM[0] + n[1] * LUM[1] + n[2] * LUM[2]; return 0.46 + 0.54 * Math.pow(clamp((d + 0.2) / 0.965, 0, 1), 0.8); }

  /* Un solide est une boîte : centre, dimensions, rotations autour de x, y puis z.
     Sommets indexés par bits (x, y, z). */
  var FACES = [[1, 3, 7, 5], [0, 4, 6, 2], [2, 6, 7, 3], [0, 1, 5, 4], [4, 5, 7, 6], [0, 2, 3, 1]];
  var NORM = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  var DROIT = [0, 0, 0];
  function tourner(p, r) {
    var x = p[0], y = p[1], z = p[2], c, s, a, b;
    if (r[0]) { c = Math.cos(r[0]); s = Math.sin(r[0]); a = y * c - z * s; b = y * s + z * c; y = a; z = b; }
    if (r[1]) { c = Math.cos(r[1]); s = Math.sin(r[1]); a = x * c + z * s; b = -x * s + z * c; x = a; z = b; }
    if (r[2]) { c = Math.cos(r[2]); s = Math.sin(r[2]); a = x * c - y * s; b = x * s + y * c; x = a; y = b; }
    return [x, y, z];
  }
  function solide(c, d, r) {
    r = r || DROIT;
    var V = [], N = [], i;
    for (i = 0; i < 8; i++) {
      var q = tourner([(i & 1 ? d[0] : -d[0]) / 2, (i & 2 ? d[1] : -d[1]) / 2, (i & 4 ? d[2] : -d[2]) / 2], r);
      V.push([c[0] + q[0], c[1] + q[1], c[2] + q[2]]);
    }
    for (i = 0; i < 6; i++) N.push(tourner(NORM[i], r));
    return { V: V, N: N, c: c, r: r };
  }
  function boite(x0, x1, y0, y1, z0, z1) { return solide([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [x1 - x0, y1 - y0, z1 - z0]); }
  function local(sol, p) { var q = tourner(p, sol.r); return [sol.c[0] + q[0], sol.c[1] + q[1], sol.c[2] + q[2]]; }
  function visible(n) { return n[0] + n[1] + n[2] > 1e-6; }
  function facePts(sol, f) { return [sol.V[FACES[f][0]], sol.V[FACES[f][1]], sol.V[FACES[f][2]], sol.V[FACES[f][3]]]; }

  /* Rectangles posés sur un plan : le sol (z), une façade tournée vers +y, un mur tourné vers +x. */
  function auSol(x0, x1, y0, y1, z) { return [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]]; }
  function enFacade(x0, x1, z0, z1, y) { return [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]; }
  function auMur(y0, y1, z0, z1, x) { return [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]; }

  /* Faire entrer un objet dans la machine, c'est le découper dans l'espace, pas à
     l'écran : on ne garde du polygone que la part située du bon côté du plan. */
  function couper(P, axe, val, sens) {
    var R = [], n = P.length;
    for (var i = 0; i < n; i++) {
      var a = P[i], b = P[(i + 1) % n], da = sens * (a[axe] - val), db = sens * (b[axe] - val);
      if (da >= 0) R.push(a);
      if ((da > 0 && db < 0) || (da < 0 && db > 0)) { var u = da / (da - db); R.push([mix(a[0], b[0], u), mix(a[1], b[1], u), mix(a[2], b[2], u)]); }
    }
    return R;
  }
  /* Les faces visibles d'un solide, éclairées. `eclat` (0 à 1) tire la face vers sa
     couleur pleine : un écran allumé ou un jeton ne dépendent pas de la lumière. */
  function faces(g, sol, base, coupe, eclat) {
    for (var f = 0; f < 6; f++) {
      if (!visible(sol.N[f])) continue;
      var P = facePts(sol, f);
      if (coupe) { P = couper(P, coupe[0], coupe[1], coupe[2]); if (P.length < 3) continue; }
      var l = lum(sol.N[f]);
      g.plein(P, rgb(base, eclat ? mix(l, 1, eclat) : l));
    }
  }
  /* Un jeton : un prisme à quatorze pans, d'axe z dans son repère. */
  function jetonSommets(c, r, h, rot) {
    var P = [];
    for (var i = 0; i < 28; i++) {
      var a = TAU * (i % 14) / 14, q = tourner([r * Math.cos(a), r * Math.sin(a), i < 14 ? h / 2 : -h / 2], rot);
      P.push([c[0] + q[0], c[1] + q[1], c[2] + q[2]]);
    }
    return P;
  }
  function jetonSolide(g, c, r, h, rot, base, coupe) {
    var n = 14, P = jetonSommets(c, r, h, rot), haut = P.slice(0, n), bas = P.slice(n), i, a;
    function poser(P, l) {
      if (coupe) { P = couper(P, coupe[0], coupe[1], coupe[2]); if (P.length < 3) return; }
      g.plein(P, rgb(base, 0.5 + 0.5 * l));
    }
    for (i = 0; i < n; i++) {
      a = TAU * (i + 0.5) / n;
      var nn = tourner([Math.cos(a), Math.sin(a), 0], rot);
      if (visible(nn)) poser([bas[i], bas[(i + 1) % n], haut[(i + 1) % n], haut[i]], lum(nn));
    }
    var nh = tourner([0, 0, 1], rot);
    if (visible(nh)) poser(haut, 1);
    else poser(bas, 1);
  }

  /* Enveloppe convexe (chaîne monotone). */
  function coque(P) {
    P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
    var bas = [], haut = [], i;
    for (i = 0; i < P.length; i++) { while (bas.length >= 2 && cr(bas[bas.length - 2], bas[bas.length - 1], P[i]) <= 0) bas.pop(); bas.push(P[i]); }
    for (i = P.length - 1; i >= 0; i--) { while (haut.length >= 2 && cr(haut[haut.length - 2], haut[haut.length - 1], P[i]) <= 0) haut.pop(); haut.push(P[i]); }
    bas.pop(); haut.pop();
    return bas.concat(haut);
  }
  /* Ombre portée NETTE d'un solide sur le plan horizontal z = val : chaque sommet
     est projeté le long de la lumière, l'ombre est l'enveloppe des projections. */
  function ombre(V, val) {
    var P = [], i, h;
    for (i = 0; i < V.length; i++) {
      h = V[i][2] - val;
      if (h < -1e-6) continue;
      P.push([V[i][0] - LUM[0] / LUM[2] * h, V[i][1] - LUM[1] / LUM[2] * h]);
    }
    if (P.length < 3) return null;
    var H = coque(P), R = [];
    for (i = 0; i < H.length; i++) R.push([H[i][0], H[i][1], val + 0.001]);
    return R;
  }

  /* ---------- deux pinceaux pour un même dessin : le canevas, et le SVG final ---------- */
  function pinceauToile(ctx) {
    var voile = 1;
    function chemin(P) {
      for (var i = 0; i < P.length; i++) { var q = proj(P[i]); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
      ctx.closePath();
    }
    return {
      voile: function (x) { voile = x; },
      /* Un joint de la couleur de la face ferme le filet de fond qui passerait entre deux faces. */
      plein: function (P, couleur, alpha) {
        ctx.globalAlpha = voile * (alpha == null ? 1 : alpha);
        ctx.fillStyle = couleur;
        ctx.beginPath(); chemin(P); ctx.fill();
        if (alpha == null) { ctx.strokeStyle = couleur; ctx.lineWidth = 0.8; ctx.lineJoin = 'round'; ctx.stroke(); }
      },
      trait: function (P, couleur, epais, alpha, part) {
        ctx.globalAlpha = voile * (alpha == null ? 1 : alpha);
        ctx.strokeStyle = couleur; ctx.lineWidth = Math.max(0.75, epais * vue.u); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        var Q = P.map(proj), L = 0, i;
        if (part != null && part < 1) {
          for (i = 1; i < Q.length; i++) L += Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]);
          ctx.setLineDash([L, L]); ctx.lineDashOffset = L * (1 - part);
        }
        ctx.beginPath();
        for (i = 0; i < Q.length; i++) { if (i) ctx.lineTo(Q[i][0], Q[i][1]); else ctx.moveTo(Q[i][0], Q[i][1]); }
        ctx.stroke();
        ctx.setLineDash([]);
      },
      filet: function (a, b, couleur, alpha) {
        ctx.globalAlpha = voile * alpha; ctx.strokeStyle = couleur; ctx.lineWidth = 1; ctx.lineCap = 'butt';
        var A = proj(a), B = proj(b);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      },
      /* Un groupe d'ombres porte UNE opacité et se découpe au plan qui le reçoit :
         pas de tache plus noire aux recouvrements, pas de débord sur une façade. */
      ombres: function (polys, decoupe, alpha) {
        polys = polys.filter(Boolean);
        if (!polys.length) return;
        ctx.save();
        ctx.beginPath(); chemin(decoupe); ctx.clip();
        ctx.globalAlpha = voile * (alpha == null ? 0.5 : alpha);
        ctx.fillStyle = 'rgb(3,9,26)';
        ctx.beginPath();
        for (var i = 0; i < polys.length; i++) chemin(polys[i]);
        ctx.fill();
        ctx.restore();
      }
    };
  }
  function pinceauSvg(prefixe) {
    var s = [], defs = [], n = 0;
    function f(v) { return (Math.round(v * 10) / 10).toString(); }
    function pts(P) { return P.map(function (p) { var q = proj(p); return f(q[0]) + ',' + f(q[1]); }).join(' '); }
    function d(P) { return 'M' + P.map(function (p) { var q = proj(p); return f(q[0]) + ' ' + f(q[1]); }).join('L') + 'Z'; }
    return {
      voile: function () {},
      plein: function (P, couleur, alpha) {
        s.push('<polygon points="' + pts(P) + '" fill="' + couleur + '"' +
          (alpha == null ? ' stroke="' + couleur + '" stroke-width="0.8" stroke-linejoin="round"' : ' opacity="' + alpha + '"') + '/>');
      },
      trait: function (P, couleur, epais, alpha) {
        s.push('<polyline points="' + pts(P) + '" fill="none" stroke="' + couleur + '" stroke-width="' + f(Math.max(0.75, epais * vue.u)) +
          '" stroke-linecap="round" stroke-linejoin="round"' + (alpha == null ? '' : ' opacity="' + alpha + '"') + '/>');
      },
      filet: function (a, b, couleur, alpha) {
        var A = proj(a), B = proj(b);
        s.push('<line x1="' + f(A[0]) + '" y1="' + f(A[1]) + '" x2="' + f(B[0]) + '" y2="' + f(B[1]) + '" stroke="' + couleur + '" stroke-width="1" opacity="' + alpha + '"/>');
      },
      ombres: function (polys, decoupe, alpha) {
        polys = polys.filter(Boolean);
        if (!polys.length) return;
        var id = prefixe + (n++);
        defs.push('<clipPath id="' + id + '"><polygon points="' + pts(decoupe) + '"/></clipPath>');
        s.push('<g clip-path="url(#' + id + ')"><path d="' + polys.map(d).join('') + '" fill="#03091a" opacity="' + (alpha == null ? 0.5 : alpha) + '"/></g>');
      },
      sortie: function (id) { return '<defs>' + defs.join('') + '</defs><g' + (id ? ' id="' + id + '"' : '') + '>' + s.join('') + '</g>'; }
    };
  }

  /* ==========================================================================
     2. LE PLAN DE L'ATELIER (unités de la maquette)
     Le flux fait un chevron : les caisses arrivent par le quai (en haut à
     gauche), tombent dans la machine par la trappe du toit, les annonces
     sortent par la façade et rejoignent le mur des six écrans (en bas à
     gauche), les jetons reviennent par le tapis de retour.
     ======================================================================== */
  var HM = 2.4;                                          /* hauteur de la machine ET du quai : la caisse glisse de l'un à l'autre */
  var MX0 = -1.7, MX1 = 1.7, MY0 = -1.5, MY1 = 1.5;      /* la machine */
  var QX0 = -6.7, QY0 = -0.62, QY1 = 0.62;               /* le quai d'entrée, jusqu'à la machine */
  var TRX = -0.85;                                       /* le centre de la trappe */
  var HB = 0.45;                                         /* hauteur d'un tapis au sol */
  var SX0 = -0.6, SX1 = 0.6, SY1 = 6.4;                  /* le tapis de sortie */
  var RX0 = 0.9, RX1 = 1.6, RY1 = 6.4, RXC = 1.25;       /* le tapis de retour */
  var WX0 = -2.05, WX1 = -1.75, WY0 = 2.6, WY1 = 6.53, HW = 2.7;   /* le mur des écrans */
  var CY = [5.835, 4.565, 3.295];                        /* colonnes, de gauche à droite à l'écran */
  var CZ = [2.15, 0.85];                                 /* rangs : haut, bas */
  var CW = 1.15, CH = 0.8;
  var GY = 7.2, GX = 2.25, GL = 2.12;                    /* les deux barrières */
  var FX0 = -7.3, FX1 = 3.2, FY0 = -2.0, FY1 = 1.9, FY2 = 8.2, PX0 = -2.6, EP = 0.28;   /* la plaque, en équerre */
  var PAS = 0.45;
  var VQ = 5, VS = 6, VR = 6;                            /* vitesses des trois tapis, en unités par seconde */
  var CX0 = -6.2, CPAS = 0.8, CSX = 0.66, CSY = 0.74, CSZ = 0.54;   /* les caisses */
  var AX = 0.62, AY = 0.9, AZ = 0.1, Y_DEPART = 1.0, DSAUT = 0.38;  /* les annonces */
  var JR = 0.3, JH = 0.14, DARC = 0.42;                  /* les jetons */
  var JCASE = [2, 4, 0];                                 /* l'écran d'où part chaque jeton : le plus proche d'abord */

  /* ---------- la partition (secondes) ---------- */
  var T = {
    plaque: 0.8, montee: 0.45,
    quai: 0.35, machine: 0.5, mur: 0.65, sortie: 0.8, retour: 0.95, barrieres: 1.05, toit: 0.95,
    caisses: 1.6, pasCaisse: 0.09,        /* temps 1 : six caisses se posent, puis on lit */
    train: 4.25,                          /* le quai les emporte dans la trappe */
    balayage: [5.7, 6.2],                 /* temps 2 : la machine travaille */
    annonces: 6.1, pasAnnonce: 0.36,      /* six annonces sortent et se rangent, puis on lit */
    jetons: 10.45, pasJeton: 0.28,        /* temps 3 : trois jetons reviennent */
    barriere: 12.5,                       /* deux barrières ferment la sortie */
    relance: 13.0, pasRelance: 0.06,      /* la matière continue d'arriver */
    conclusion: 13.15,
    fin: 14
  };
  var BORD = TRX - 0.3;                                  /* là où la caisse bascule dans la trappe */
  var DIST_TRAIN = BORD + 0.6 - CX0;
  var A_FIN = T.annonces + 5 * T.pasAnnonce + (CY[2] - Y_DEPART) / VS;   /* dernier saut */

  /* Distance parcourue par un tapis qui démarre à t0, accélère sur r secondes,
     roule à v, freine sur r secondes et s'arrête après `dist`. */
  function course(t, t0, dist, v, r) {
    var D = dist / v + r, x = clamp(t - t0, 0, D);
    if (x < r) return v * x * x / (2 * r);
    if (x > D - r) { var y = D - x; return dist - v * y * y / (2 * r); }
    return v * (x - r / 2);
  }
  function hausse(t, t0) { return monte(seg(t, t0, t0 + T.montee)); }

  /* Une caisse : elle surgit au-dessus du quai, tombe, rebondit. Celles du premier
     lot sont ensuite emportées vers la trappe, où elles s'enfoncent. */
  function caisse(i, t, lot) {
    var s = lot ? T.relance + i * T.pasRelance : T.caisses + i * T.pasCaisse;
    if (t < s) return null;
    var chute = lot ? 0.2 : 0.28, reb = lot ? 0.22 : 0.3;
    var k = surgit(seg(t, s, s + 0.18));
    var z = HM + 0.9 * (1 - inQuad(seg(t, s + 0.1, s + 0.1 + chute)));
    var pb = seg(t, s + 0.1 + chute, s + 0.1 + chute + reb);
    z += 0.24 * Math.abs(Math.sin(TAU * pb)) * Math.pow(1 - pb, 2);
    var x = CX0 + i * CPAS, coupe = null;
    if (!lot) {
      x += course(t, T.train, DIST_TRAIN, VQ, 0.2);
      /* passé le bord de la trappe, elle bascule dedans : une seule caisse tombe à la fois */
      if (x > BORD) {
        z -= 1.0 * inQuad(clamp((x - BORD) / 0.6, 0, 1)); x = Math.min(x, TRX + 0.1); coupe = [2, HM, 1];
        if (z + CSZ <= HM + 0.01) return null;
      }
    }
    return { sol: solide([x, 0, z + k * CSZ / 2], [CSX * k, CSY * k, CSZ * k]), coupe: coupe, pose: s + 0.1 + chute };
  }
  function dessinerCaisse(g, c) {
    faces(g, c.sol, IVOIRE, c.coupe);
    /* le ruban de la caisse, sur le dessus, quand il dépasse encore du toit */
    if (!c.coupe) g.trait([local(c.sol, [-CSX * 0.5, 0, CSZ * 0.5 + 0.002]), local(c.sol, [CSX * 0.5, 0, CSZ * 0.5 + 0.002])], 'rgb(10,22,38)', 0.035, 0.28);
  }

  /* Une annonce : elle sort par la façade, roule sur le tapis, saute en arc jusqu'à
     son écran, s'y dresse et s'allume. k de 0 à 5, dans l'ordre de lecture. */
  function annonce(k, t) {
    var e = T.annonces + k * T.pasAnnonce;
    if (t < e) return null;
    var yk = CY[k % 3], zk = CZ[k < 3 ? 0 : 1];
    var th = e + (yk - Y_DEPART) / VS;
    var p = seg(t, th, th + DSAUT), q = inOutCubic(p), c, r = 0, coupe = null;
    if (p <= 0) {
      var y = Y_DEPART + VS * (t - e);
      c = [0, y, HB + AZ / 2 + 0.002];
      if (y - AY / 2 < MY1) coupe = [1, MY1, 1];
    } else {
      c = [mix(0, WX1 + AZ / 2 + 0.005, q), yk, mix(HB + AZ / 2, zk, q) + 0.6 * bosse(p)];
      r = q * Math.PI / 2;
    }
    var pose = 1 + 0.06 * bosse(seg(t, th + DSAUT, th + DSAUT + 0.22));
    return { sol: solide(c, [AX * pose, AY * pose, AZ], [0, r, 0]), c: c, coupe: coupe, surTapis: p <= 0, posee: q >= 1,
      allume: seg(t, th + DSAUT, th + DSAUT + 0.25), pose: th + DSAUT };
  }
  function dessinerAnnonce(g, a) {
    faces(g, a.sol, FLUX, a.coupe, a.allume);
    if (a.coupe) return;
    var z = AZ / 2 + 0.002, encre = 'rgb(10,22,38)';
    g.plein([local(a.sol, [-0.2, 0.08, z]), local(a.sol, [0.2, 0.08, z]), local(a.sol, [0.2, 0.36, z]), local(a.sol, [-0.2, 0.36, z])], encre, 0.34);
    g.trait([local(a.sol, [-0.13, -0.02, z]), local(a.sol, [-0.13, -0.36, z])], encre, 0.04, 0.5);
    g.trait([local(a.sol, [0.07, -0.02, z]), local(a.sol, [0.07, -0.24, z])], encre, 0.04, 0.5);
  }

  /* Un jeton : il sort d'un écran, saute par-dessus le tapis de sortie, se pose sur
     le tapis de retour et rentre dans la machine. C'est la boucle d'apprentissage. */
  function jeton(j, t) {
    var s = T.jetons + j * T.pasJeton;
    var k = JCASE[j], yk = CY[k % 3], zk = CZ[k < 3 ? 0 : 1];
    var ta = s + 0.2 + DARC;                       /* il touche le tapis */
    var te = ta + 0.05 + (yk - MY1) / VR;          /* son centre passe la façade */
    var o = { pose: ta, entre: te };
    if (t < s) return o;
    var e = surgit(seg(t, s, s + 0.2));
    var p = seg(t, s + 0.2, ta), q = inOutCubic(p);
    var y = yk - VR * Math.max(0, t - ta - 0.05);
    if (y + JR <= MY1) return o;
    o.c = [mix(WX1 + JH / 2 + AZ + 0.02, RXC, q), y, mix(zk, HB + JH / 2 + 0.002, q) + 0.9 * bosse(p)];
    o.rot = [0, (1 - q) * Math.PI / 2, 0];
    o.r = JR * e; o.h = JH * e;
    o.vol = p > 0 && p < 1;
    o.coupe = y - JR < MY1 ? [1, MY1, 1] : null;
    return o;
  }

  /* Une barrière : son poteau, et son bras en cinq tronçons qui s'abat vers le milieu. */
  function fermeture(t, cote) {
    var t0 = T.barriere + (cote > 0 ? 0.13 : 0);
    return K.depasse(1.15)(seg(t, t0, t0 + 0.38));
  }
  function bras(cote, t, k) {
    var f = fermeture(t, cote), ang = (1 - f) * 76 * Math.PI / 180;
    var dir = -cote, px = cote * GX, pz = 0.78 * k, L = GL * k, n = 5, R = [];
    for (var j = 0; j < n; j++) {
      var d = (j + 0.5) * L / n;
      R.push({ sol: solide([px + dir * Math.cos(ang) * d, GY, pz + Math.sin(ang) * d], [L / n, 0.13, 0.13], [0, dir > 0 ? -ang : Math.PI + ang, 0]), clair: j % 2 === 1 });
    }
    return R;
  }

  /* ---------- le dessin, de l'arrière vers l'avant ----------
     L'ordre des couches est écrit à la main, il ne se trie pas. Deux règles :
     le rail avant d'un tapis se dessine APRÈS ce qui roule dessus ; ce qui est
     posé sur le mur se dessine avant le tapis qui passe devant. */
  function dessiner(g, t) {
    var i, k, om;
    vue.dz = -2.5 * (1 - entree(seg(t, 0, T.plaque)));
    g.voile(seg(t, 0, 0.3));

    var kQ = hausse(t, T.quai), kM = hausse(t, T.machine), kW = hausse(t, T.mur), kS = hausse(t, T.sortie),
        kR = hausse(t, T.retour), kB = hausse(t, T.barrieres), kT = surgit(seg(t, T.toit, T.toit + 0.4));
    var hQ = HM * kQ, hM = HM * kM, hW = HW * kW, hS = HB * kS, hR = HB * kR;

    /* les solides fixes */
    var quai = boite(QX0, MX0, QY0, QY1, 0, hQ), machine = boite(MX0, MX1, MY0, MY1, 0, hM),
        tete = boite(0.35, 1.45, -1.2, 0.2, hM, hM + 0.75 * kT), mur = boite(WX0, WX1, WY0, WY1, 0, hW),
        tapisS = boite(SX0, SX1, MY1, SY1, 0, hS), tapisR = boite(RX0, RX1, MY1, RY1, 0, hR);
    var poteaux = [boite(-GX - 0.12, -GX + 0.12, GY - 0.12, GY + 0.12, 0, 0.95 * kB), boite(GX - 0.12, GX + 0.12, GY - 0.12, GY + 0.12, 0, 0.95 * kB)];
    var brasG = bras(-1, t, kB), brasD = bras(1, t, kB);

    /* la plaque, en équerre, et sa grille fine */
    var sol = [[FX0, FY0, 0], [FX1, FY0, 0], [FX1, FY2, 0], [PX0, FY2, 0], [PX0, FY1, 0], [FX0, FY1, 0]];
    g.plein([[FX1, FY0, -EP], [FX1, FY2, -EP], [FX1, FY2, 0], [FX1, FY0, 0]], rgb(PLAQUE, lum(NORM[0])));
    g.plein([[PX0, FY2, -EP], [FX1, FY2, -EP], [FX1, FY2, 0], [PX0, FY2, 0]], rgb(PLAQUE, lum(NORM[2])));
    g.plein([[FX0, FY1, -EP], [PX0, FY1, -EP], [PX0, FY1, 0], [FX0, FY1, 0]], rgb(PLAQUE, lum(NORM[2])));
    g.plein(sol, rgb(PLAQUE, 1));
    var grille = 0.11 * seg(t, 0.15, 0.75);
    if (grille > 0.001) {
      for (i = Math.ceil(FX0); i <= Math.floor(FX1); i++) g.filet([i, FY0, 0], [i, i < PX0 ? FY1 : FY2, 0], rgb(FLUX), grille);
      for (i = Math.ceil(FY0); i <= Math.floor(FY2); i++) g.filet([i <= FY1 ? FX0 : PX0, i, 0], [FX1, i, 0], rgb(FLUX), grille);
    }

    /* les ombres au sol */
    om = [];
    if (hQ > 0.01) om.push(ombre(quai.V, 0));
    if (hM > 0.01) om.push(ombre(machine.V, 0));
    if (hW > 0.01) om.push(ombre(mur.V, 0));
    if (hS > 0.01) om.push(ombre(tapisS.V, 0));
    if (hR > 0.01) om.push(ombre(tapisR.V, 0));
    if (kB > 0.01) {
      om.push(ombre(poteaux[0].V, 0), ombre(poteaux[1].V, 0));
      for (i = 0; i < 5; i++) om.push(ombre(brasG[i].sol.V, 0), ombre(brasD[i].sol.V, 0));
    }
    g.ombres(om, sol);

    /* le quai d'entrée : son corps, le tapis sur son dessus, le rail arrière */
    var caisses = [];
    for (i = 0; i < 6; i++) { var c0 = caisse(i, t, 0), c1 = caisse(i, t, 1); if (c0) caisses.push(c0); if (c1) caisses.push(c1); }
    if (hQ > 0.01) {
      faces(g, quai, BLOC);
      g.plein(auSol(QX0 + 0.1, MX0, -0.5, 0.5, hQ + 0.002), rgb(TAPIS), 1);
      var phQ = course(t, T.train, DIST_TRAIN, VQ, 0.2), lenQ = MX0 - QX0 - 0.1, nQ = Math.round(lenQ / PAS);
      for (k = 0; k < nQ; k++) {
        var xa = QX0 + 0.1 + mod(k * PAS + phQ, lenQ), xb = Math.min(MX0, xa + 0.1);
        if (xb - xa > 0.005) g.plein(auSol(xa, xb, -0.42, 0.42, hQ + 0.003), rgb(FLUX), 0.26);
      }
      faces(g, boite(QX0, MX0, QY0, -0.5, hQ, hQ + 0.1), RAIL);
    }

    /* la machine : son corps, le toit (la piste, la trappe), la façade */
    if (hM > 0.01) {
      faces(g, machine, BLOC);
      g.plein(auSol(MX0, TRX - 0.5, -0.5, 0.5, hM + 0.002), rgb(TAPIS), 1);
      g.plein(auSol(TRX - 0.5, TRX + 0.5, -0.5, 0.5, hM + 0.002), rgb(CREUX), 1);
      /* la sortie des annonces, le retour des jetons, les trois témoins */
      if (hM > HB + 0.5) {
        g.plein(enFacade(-0.66, 0.66, HB, HB + 0.44, MY1 + 0.002), rgb(CREUX), 1);
        g.plein(enFacade(RX0 - 0.03, RX1 + 0.03, HB, HB + 0.4, MY1 + 0.002), rgb(CREUX), 1);
      }
      if (hM > 1.4) {
        for (i = 0; i < 3; i++) {
          var al = seg(t, jeton(i, -1).entre, jeton(i, -1).entre + 0.18);
          g.plein(enFacade(0.93 + i * 0.24, 1.09 + i * 0.24, 1.02, 1.18, MY1 + 0.002), rgb(melC(CREUX, SIGNAL, al)), 1);
        }
      }
      /* la barre de lumière qui balaie la façade pendant que la machine travaille */
      var scan = bosse(seg(t, T.balayage[0], T.balayage[1]));
      var zb = 2.12 - 1.35 * scan, zt = Math.min(zb + 0.1, hM);
      if (zt > zb + 0.02) g.plein(enFacade(-1.4, 1.4, zb, zt, MY1 + 0.003), rgb(FLUX), mix(0.3, 0.95, scan));
    }
    /* les ombres sur le quai et sur le toit : les caisses, la tête */
    om = [];
    for (i = 0; i < caisses.length; i++) if (!caisses[i].coupe) om.push(ombre(caisses[i].sol.V, HM));
    if (hQ > HM - 0.05) g.ombres(om, auSol(QX0, MX0, QY0, QY1, HM));
    if (kT > 0.01) om.push(ombre(tete.V, hM));
    if (hM > 0.01) g.ombres(om, auSol(MX0, MX1, MY0, MY1, hM));
    if (kT > 0.01) {
      faces(g, tete, BLOC);
      g.plein(enFacade(0.55, 1.25, hM + 0.28 * kT, hM + 0.5 * kT, 0.2 + 0.002), rgb(FLUX), 0.9);
    }
    /* les caisses, les plus lointaines d'abord, puis le rail avant du quai */
    caisses.sort(function (a, b) { return a.sol.c[0] - b.sol.c[0]; });
    for (i = 0; i < caisses.length; i++) dessinerCaisse(g, caisses[i]);
    if (hQ > 0.01) faces(g, boite(QX0, MX0, 0.5, QY1, hQ, hQ + 0.1), RAIL);

    /* le mur des six écrans, puis ce qui y est posé */
    var annonces = [], jetons = [];
    for (k = 0; k < 6; k++) { var a = annonce(k, t); if (a) annonces.push(a); }
    for (k = 0; k < 3; k++) { var j = jeton(k, t); if (j.c) jetons.push(j); }
    if (hW > 0.01) {
      faces(g, mur, BLOC);
      if (hW > HW - 0.2) for (k = 0; k < 6; k++) {
        var cy = CY[k % 3], cz = CZ[k < 3 ? 0 : 1];
        g.plein(auMur(cy - CW / 2, cy + CW / 2, cz - CH / 2, cz + CH / 2, WX1 + 0.002), 'rgb(4,10,22)', 0.5);
      }
      for (k = 0; k < annonces.length; k++) if (annonces[k].posee) dessinerAnnonce(g, annonces[k]);
      /* l'écran qui a produit une conversion en garde la marque, en corail */
      for (k = 0; k < 3; k++) {
        var mk = seg(t, T.jetons + k * T.pasJeton + 0.12, T.jetons + k * T.pasJeton + 0.3);
        if (mk <= 0) continue;
        var my = CY[JCASE[k] % 3], mz = CZ[JCASE[k] < 3 ? 0 : 1];
        g.plein(auMur(my - 0.4, my - 0.2, mz + 0.07, mz + 0.26, WX1 + AZ + 0.012), rgb(SIGNAL), mk);
      }
    }

    /* le tapis de sortie : corps, rail arrière, bandes, ombres, annonces, rail avant */
    if (hS > 0.005) {
      faces(g, tapisS, TAPIS);
      faces(g, boite(SX0, SX0 + 0.12, MY1, SY1, 0, hS + 0.1), RAIL);
      bandes(g, SX0, SX1, MY1, SY1, hS, course(t, T.annonces - 0.25, VS * (A_FIN - T.annonces + 0.35), VS, 0.2), 1);
      om = [hW > 0.01 ? ombre(mur.V, hS) : null];
      for (k = 0; k < annonces.length; k++) if (annonces[k].surTapis && !annonces[k].coupe) om.push(ombre(annonces[k].sol.V, hS));
      g.ombres(om, auSol(SX0 + 0.12, SX1 - 0.12, MY1, SY1, hS));
      var roulent = annonces.filter(function (x) { return x.surTapis; }).sort(function (x, y) { return x.c[1] - y.c[1]; });
      for (k = 0; k < roulent.length; k++) dessinerAnnonce(g, roulent[k]);
      for (k = 0; k < annonces.length; k++) if (!annonces[k].surTapis && !annonces[k].posee) dessinerAnnonce(g, annonces[k]);
      faces(g, boite(SX1 - 0.12, SX1, MY1, SY1, 0, hS + 0.1), RAIL);
    }

    /* le tapis de retour : corps, rail arrière, bandes, jetons, rail avant */
    if (hR > 0.005) {
      faces(g, tapisR, TAPIS);
      faces(g, boite(RX0, RX0 + 0.12, MY1, RY1, 0, hR + 0.1), RAIL);
      bandes(g, RX0, RX1, MY1, RY1, hR, course(t, jeton(0, -1).pose - 0.15, VR * (jeton(2, -1).entre - jeton(0, -1).pose + 0.35), VR, 0.2), -1);
    }
    jetons.sort(function (x, y) { return x.c[1] - y.c[1]; });
    om = [];
    for (k = 0; k < jetons.length; k++) if (!jetons[k].coupe) om.push(ombre(jetonSommets(jetons[k].c, jetons[k].r, jetons[k].h, jetons[k].rot), hR));
    if (hR > 0.005) g.ombres(om, auSol(RX0 + 0.12, RX1 - 0.12, MY1, RY1, hR));
    for (k = 0; k < jetons.length; k++) jetonSolide(g, jetons[k].c, jetons[k].r, jetons[k].h, jetons[k].rot, SIGNAL, jetons[k].coupe);
    if (hR > 0.005) faces(g, boite(RX1 - 0.12, RX1, MY1, RY1, 0, hR + 0.1), RAIL);

    /* les deux barrières : à gauche le poteau puis le bras, à droite le bras puis le poteau */
    if (kB > 0.01) {
      faces(g, poteaux[0], RAIL);
      for (i = 0; i < 5; i++) faces(g, brasG[i].sol, brasG[i].clair ? FLUX : IVOIRE);
      for (i = 4; i >= 0; i--) faces(g, brasD[i].sol, brasD[i].clair ? FLUX : IVOIRE);
      faces(g, poteaux[1], RAIL);
    }
  }
  /* Les bandes d'un tapis posé le long de y. Elles ne défilent que pendant qu'il porte quelque chose. */
  function bandes(g, x0, x1, y0, y1, h, phase, sens) {
    g.plein(auSol(x0 + 0.12, x1 - 0.12, y0, y1, h + 0.002), rgb(TAPIS), 1);
    var len = y1 - y0, n = Math.round(len / PAS);
    for (var k = 0; k < n; k++) {
      var d = mod(k * PAS + phase, len), ya = sens > 0 ? y0 + d : y1 - d - 0.1, yb = Math.min(y1, ya + 0.1);
      ya = Math.max(y0, ya);
      if (yb - ya > 0.005) g.plein(auSol(x0 + 0.16, x1 - 0.16, ya, yb, h + 0.003), rgb(FLUX), 0.26);
    }
  }

  /* ---------- les cadrages, en unités d'écran (largeur, centre) ----------
     L'ensemble montre tout l'atelier. Les deux autres servent sur téléphone :
     la caméra tient la pose sur la zone dont on parle, puis glisse. */
  var CADRES = {
    ensemble: { cx: -2.42, cy: -0.69, l: 14.2, h: 13.7 },
    entree: { cx: -2.0, cy: -2.9, l: 9.5, h: 9.17 },
    sortie: { cx: -4.4, cy: 1.55, l: 10, h: 9.65 }
  };
  function cadrer(largeur, hauteur, c) {
    vue.u = Math.min(largeur / c.l, hauteur / c.h);
    vue.ox = largeur / 2 - c.cx * vue.u;
    vue.oy = hauteur / 2 - c.cy * vue.u;
  }
  var CAMERA = (function () {
    var E = CADRES.ensemble, A = CADRES.entree, B = CADRES.sortie;
    function cle(t, c) { return { t: t, cx: c.cx, cy: c.cy, l: c.l, h: c.h }; }
    return [cle(0, E), cle(1.0, E), cle(1.6, A), cle(5.6, A), cle(6.25, B), cle(12.95, B), cle(13.65, E), cle(T.fin, E)];
  })();
  function camera(t) {
    return { cx: MDP.piste(CAMERA, t, 'cx'), cy: MDP.piste(CAMERA, t, 'cy'), l: MDP.piste(CAMERA, t, 'l'), h: MDP.piste(CAMERA, t, 'h') };
  }

  /* ---------- les étiquettes : du HTML, couché dans le plan de la face qui le porte ----------
     Quatre plans : une façade tournée vers +y, un mur tourné vers +x, le sol lu
     dans le sens de +x, le sol lu dans le sens de -y. */
  var PLANS = {
    facade: [CO, SI, 0, 1, [1, 0, 0]],
    mur: [CO, -SI, 0, 1, [0, -1, 0]],
    solX: [CO, SI, -CO, SI, [1, 0, 0]],
    solY: [CO, -SI, CO, SI, [0, -1, 0]]
  };
  var ETIQUETTES = (function () {
    var E = {}, i;
    /* le nom de la machine, sur son flanc droit : la façade garde ses ouvertures dégagées */
    E.machine = { plan: 'mur', p: [MX1, 0, 1.3], centre: true, t0: 1.15 };
    /* les six entrées, peintes sur le flanc du quai, sur deux colonnes */
    for (i = 0; i < 6; i++) E['e' + i] = { plan: 'facade', p: [i % 2 ? -4.38 : -6.45, QY1, 1.98 - 0.56 * Math.floor(i / 2)], t0: T.caisses + i * T.pasCaisse + 0.38 };
    /* les six réseaux, chacun sous son écran */
    for (i = 0; i < 6; i++) E['r' + i] = { plan: 'mur', p: [WX1, CY[i % 3], CZ[i < 3 ? 0 : 1] - CH / 2 - 0.24], centre: true, t0: T.annonces + i * T.pasAnnonce + (CY[i % 3] - Y_DEPART) / VS + DSAUT };
    /* les trois retours, en liste sur le sol, le long du tapis de retour */
    for (i = 0; i < 3; i++) E['j' + i] = { plan: 'solY', p: [1.98 + 0.5 * i, 6.35, 0], t0: jeton(i, -1).pose };
    /* les deux garde-fous, devant leur barrière */
    E.b0 = { plan: 'solX', p: [-1.15, 7.72, 0], centre: true, t0: T.barriere + 0.38 };
    E.b1 = { plan: 'solX', p: [1.75, 7.72, 0], centre: true, t0: T.barriere + 0.51 };
    return E;
  })();

  /* ---------- l'état final en SVG, pour le HTML sans JavaScript ---------- */
  function svgFinal() {
    var c = CADRES.ensemble, u = 100;
    vue.u = u; vue.ox = c.l * u / 2 - c.cx * u; vue.oy = c.h * u / 2 - c.cy * u;
    var g = pinceauSvg('atelier-');
    dessiner(g, T.fin);
    return '<svg class="pmax__fixe" viewBox="0 0 ' + Math.round(c.l * u) + ' ' + Math.round(c.h * u) + '" aria-hidden="true" focusable="false">' + g.sortie('atelier-dessin') + '</svg>';
  }
  /* Les deux vignettes de la section Formats, fixes, recopiées dans le HTML.
     Performance Max : un détail de l'atelier, repris du dessin final par <use>.
     Search : une pile de résultats, la première feuille est la vôtre. */
  function svgDetail() {
    return '<svg viewBox="650 250 600 780" preserveAspectRatio="xMidYMid slice" focusable="false"><use href="#atelier-dessin"/></svg>';
  }
  function svgRecherche() {
    vue.u = 100; vue.ox = 430; vue.oy = 395; vue.dz = 0;
    var g = pinceauSvg('recherche-'), DX = 3.3, DY = 2.1, E = 0.16, Z = [0.02, 0.62, 1.22, 2.05];
    var PAPIER = ['#FFFFFF', '#E7E3D9', '#D3CEC1'], MARQUE = ['#1D71B8', '#155A93', '#0F4674'];
    function sommets(z) { return boite(-DX / 2, DX / 2, -DY / 2, DY / 2, z, z + E).V; }
    g.ombres(Z.map(function (z) { return ombre(sommets(z), 0); }), auSol(-3.2, 3.6, -2.6, 2.6, 0), 0.13);
    Z.forEach(function (z, k) {
      var haut = k === Z.length - 1, c = haut ? MARQUE : PAPIER, h = z + E + 0.002, encre = haut ? '#FFFFFF' : '#14202E';
      if (k) g.ombres([ombre(sommets(z), Z[k - 1] + E)], auSol(-DX / 2, DX / 2, -DY / 2, DY / 2, Z[k - 1] + E), 0.16);
      g.plein(auMur(-DY / 2, DY / 2, z, z + E, DX / 2), c[2]);
      g.plein(enFacade(-DX / 2, DX / 2, z, z + E, DY / 2), c[1]);
      g.plein(auSol(-DX / 2, DX / 2, -DY / 2, DY / 2, z + E), c[0]);
      /* une vignette et deux lignes : lues de gauche à droite à l'écran, donc le long de -y */
      g.plein(auSol(-0.55, 0.45, 0.35, 0.8, h), haut ? '#7FC4DD' : encre, haut ? 1 : 0.16);
      g.trait([[-0.35, 0.1, h], [-0.35, -0.8, h]], encre, 0.07, haut ? 0.95 : 0.3);
      g.trait([[0.15, 0.1, h], [0.15, -0.45, h]], encre, 0.07, haut ? 0.6 : 0.18);
    });
    return '<svg viewBox="100 110 680 470" focusable="false">' + g.sortie() + '</svg>';
  }
  /* L'étendue du dessin, en unités d'écran : sert à régler les cadrages. */
  function etendue(t) {
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    function voir(P) { P.forEach(function (p) { var q = proj(p); b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); }); }
    vue.u = 1; vue.ox = 0; vue.oy = 0;
    dessiner({ voile: function () {}, plein: voir, trait: voir, filet: function (a, c) { voir([a, c]); }, ombres: function () {} }, t);
    return b;
  }

  /* ==========================================================================
     3. LE MORPHING : quatre contours fermés, ré-échantillonnés au même nombre
     de points, alignés deux à deux, puis mélangés point à point.
     ======================================================================== */
  var N = 240;
  function pt(x, y) { return { x: x, y: y }; }
  function sub(a, b) { return pt(a.x - b.x, a.y - b.y); }
  function add(a, b) { return pt(a.x + b.x, a.y + b.y); }
  function mul(a, k) { return pt(a.x * k, a.y * k); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function unite(a) { var l = Math.hypot(a.x, a.y) || 1; return pt(a.x / l, a.y / l); }

  /* Remplace chaque sommet par un congé de rayon r (nombre ou tableau). */
  function arrondir(pts, rayons, n) {
    var out = [], m = pts.length;
    for (var i = 0; i < m; i++) {
      var p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m];
      var v1 = unite(sub(p0, p1)), v2 = unite(sub(p2, p1));
      var ang = Math.acos(clamp(v1.x * v2.x + v1.y * v2.y, -1, 1));
      var r = typeof rayons === 'number' ? rayons : rayons[i];
      if (ang < 0.02 || ang > Math.PI - 0.02 || !(r > 0)) { out.push(p1); continue; }
      var tanH = Math.tan(ang / 2);
      var rr = Math.min(r, dist(p0, p1) / 2 * tanH, dist(p2, p1) / 2 * tanH);
      var d = rr / tanH;
      var a = add(p1, mul(v1, d)), b = add(p1, mul(v2, d));
      var c = add(p1, mul(unite(add(v1, v2)), rr / Math.sin(ang / 2)));
      var a0 = Math.atan2(a.y - c.y, a.x - c.x), a1 = Math.atan2(b.y - c.y, b.x - c.x), da = a1 - a0;
      while (da > Math.PI) da -= TAU;
      while (da < -Math.PI) da += TAU;
      for (var k = 0; k <= n; k++) { var aa = a0 + da * k / n; out.push(pt(c.x + rr * Math.cos(aa), c.y + rr * Math.sin(aa))); }
    }
    return out;
  }
  function orienter(pts) {
    var s = 0;
    for (var i = 0; i < pts.length; i++) { var q = pts[(i + 1) % pts.length]; s += pts[i].x * q.y - q.x * pts[i].y; }
    return s < 0 ? pts.slice().reverse() : pts;
  }
  function reechantillonner(pts, n) {
    var L = [0], tot = 0, i;
    for (i = 0; i < pts.length; i++) { tot += dist(pts[i], pts[(i + 1) % pts.length]); L.push(tot); }
    var out = [], j = 0;
    for (var k = 0; k < n; k++) {
      var s = tot * k / n;
      while (j < pts.length - 1 && L[j + 1] < s) j++;
      var a = pts[j], b = pts[(j + 1) % pts.length], u = (s - L[j]) / ((L[j + 1] - L[j]) || 1);
      out.push(pt(mix(a.x, b.x, u), mix(a.y, b.y, u)));
    }
    return out;
  }
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

  /* Les quatre formes, dans un repère centré, disque de rayon 100. */
  function loupe() {
    var cx = -12, cy = -12, R = 47, d = Math.asin(10 / R), a0 = Math.PI / 4 + d, a1 = Math.PI / 4 - d + TAU, pts = [], ray = [], i;
    for (i = 0; i <= 56; i++) { var a = mix(a0, a1, i / 56); pts.push(pt(cx + R * Math.cos(a), cy + R * Math.sin(a))); ray.push(0); }
    var dir = pt(Math.SQRT1_2, Math.SQRT1_2), per = pt(-Math.SQRT1_2, Math.SQRT1_2), bout = add(pt(cx, cy), mul(dir, R + 44));
    pts.push(sub(bout, mul(per, 10)), add(bout, mul(per, 10)));
    ray.push(9, 9);
    return contour(pts, ray);
  }
  function structure() {
    var P = [[-24, -58], [24, -58], [24, -30], [4, -30], [4, -10], [46, -10], [46, 14], [64, 14], [64, 44], [20, 44], [20, 14], [38, 14], [38, -2],
      [-38, -2], [-38, 14], [-20, 14], [-20, 44], [-64, 44], [-64, 14], [-46, 14], [-46, -10], [-4, -10], [-4, -30], [-24, -30]];
    return contour(P.map(function (p) { return pt(p[0], p[1]); }), 4);
  }
  function curseur() {
    var kx = 22, R = 27, e = 7.5, b = Math.asin(e / R), pts = [], i, a;
    pts.push(pt(-58, -e));
    for (i = 0; i <= 28; i++) { a = mix(Math.PI + b, TAU - b, i / 28); pts.push(pt(kx + R * Math.cos(a), R * Math.sin(a))); }
    for (i = 0; i <= 10; i++) { a = mix(-Math.PI / 2, Math.PI / 2, i / 10); pts.push(pt(58 + e * Math.cos(a), e * Math.sin(a))); }
    for (i = 0; i <= 28; i++) { a = mix(b, Math.PI - b, i / 28); pts.push(pt(kx + R * Math.cos(a), R * Math.sin(a))); }
    pts.push(pt(-58, e));
    for (i = 1; i < 10; i++) { a = mix(Math.PI / 2, Math.PI * 1.5, i / 10); pts.push(pt(-58 + e * Math.cos(a), e * Math.sin(a))); }
    return contour(pts, 0);
  }
  function courbe() {
    var L = [pt(-62, 38), pt(-24, -2), pt(6, 26), pt(40, -10)], e = 8.5, g = [], d = [], i;
    for (i = 0; i < L.length; i++) {
      var a = i ? unite(sub(L[i], L[i - 1])) : null, b = i < L.length - 1 ? unite(sub(L[i + 1], L[i])) : null;
      var na = a ? pt(-a.y, a.x) : null, nb = b ? pt(-b.y, b.x) : null, m;
      if (na && nb) { m = mul(add(na, nb), e / (1 + na.x * nb.x + na.y * nb.y)); }
      else m = mul(na || nb, e);
      g.push(sub(L[i], m)); d.push(add(L[i], m));
    }
    /* la pointe de flèche, au bout du dernier segment */
    var dir = unite(sub(L[3], L[2])), per = pt(-dir.y, dir.x);
    var pts = [g[0], g[1], g[2], g[3], sub(L[3], mul(per, 22)), add(L[3], mul(dir, 26)), add(L[3], mul(per, 22)), d[3], d[2], d[1], d[0]];
    return contour(pts, [6, 5, 5, 0, 5, 5, 5, 0, 5, 5, 6]);
  }
  var F = (function () {
    var a = loupe(), b = aligner(a, structure()), c = aligner(b, curseur()), d = aligner(c, courbe());
    return [a, b, c, d];
  })();
  /* Interpolation point à point, avec une ondulation qui n'existe qu'au milieu du passage. */
  function melange(A, B, p, amp) {
    var w = Math.sin(p * Math.PI), s = '';
    for (var i = 0; i < N; i++) {
      var x = mix(A[i].x, B[i].x, p), y = mix(A[i].y, B[i].y, p);
      if (amp > 0 && w > 0) {
        var ang = Math.atan2(y, x), r = Math.hypot(x, y) + amp * w * Math.sin(ang * 3 + p * TAU);
        x = r * Math.cos(ang); y = r * Math.sin(ang);
      }
      s += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return s + 'Z';
  }
  var rebond = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI * 3) * Math.pow(1 - p, 2); };

  /* La partition de la méthode : un voyage de 1,1 s, puis 1,5 s de lecture à chaque station. */
  var M = { noeud: [0.15, 0.75], voyages: [1.5, 4.1, 6.7], duree: 1.1, fin: 9 };
  function etatMethode(t) {
    var v = M.voyages, i, pos = 0, m = [0, 0, 0], reb = 0;
    for (i = 0; i < 3; i++) {
      pos += inOutQuart(seg(t, v[i], v[i] + M.duree));
      m[i] = inOutCubic(seg(t, v[i] + 0.08, v[i] + M.duree + 0.08));
      reb += rebond(seg(t, v[i] + M.duree, v[i] + M.duree + 0.65));
    }
    var k = m[2] > 0 ? 2 : (m[1] > 0 ? 1 : 0);
    var trou1 = 30 * (1 - seg(m[0], 0, 0.4));                                   /* la lentille de la loupe */
    var trou2 = 11 * K.depasse(1.5)(seg(m[1], 0.6, 1)) * (1 - seg(m[2], 0, 0.4));   /* le bouton du curseur */
    var eclat = seg(t, 8.0, 8.6);
    return {
      pos: pos, d: melange(F[k], F[k + 1], m[k], 5), k: k,
      /* le corail gagne le disque depuis son centre : deux aplats, jamais un mélange des deux teintes */
      resultat: 100 * K.inOutCubic(seg(m[2], 0.45, 0.95)),
      trou1: trou1, trou2: trou2, reb: 0.13 * reb,
      base: Math.max(0, K.depasse(1.7)(seg(t, M.noeud[0], M.noeud[1]))),
      gonfle: 1 + 0.1 * Math.sin(eclat * Math.PI) * (1 - eclat) * 2
    };
  }

  /* Ce que le HTML reçoit tout fait : l'état final de l'atelier, les deux vignettes, les quatre
     formes de la méthode. À régénérer depuis la console après tout changement du dessin, puis à
     recopier entre les repères du HTML (<!--SVG-PMAX-->, <!--VIGNETTE-...-->, <!--FORME-n-->). */
  W.MDPAtelier = { svgFinal: svgFinal, svgDetail: svgDetail, svgRecherche: svgRecherche, formes: F,
    formeFinale: function () { return etatMethode(M.fin).d; }, etendue: etendue, T: T, M: M, CADRES: CADRES };
  /* Hors navigateur (contrôle dans Node), on s'arrête ici. */
  if (typeof document === 'undefined') return;

  /* ==========================================================================
     4. LA SCÈNE PERFORMANCE MAX DANS LA PAGE
     ======================================================================== */
  (function () {
    var el = document.getElementById('scene-pmax');
    if (!el) return;
    var cadre = el.querySelector('.pmax__cadre'), toile = el.querySelector('.pmax__toile');
    var ctx = toile && toile.getContext ? toile.getContext('2d') : null;
    if (!cadre || !ctx) return;
    var g = pinceauToile(ctx);
    var etiquettes = [].slice.call(el.querySelectorAll('[data-etiquette]')).map(function (e) {
      return { el: e, d: ETIQUETTES[e.getAttribute('data-etiquette')] };
    }).filter(function (e) { return e.d; });
    var lignes = [].slice.call(el.querySelectorAll('.pmax__conclusion .ligne > span'));
    var largeur = 0, hauteur = 0, ratio = 1, dansLeDessin = false, decalage = [0, 0], dernier = T.fin;

    function mesurer() {
      /* les étiquettes se placent par rapport au plateau, qui est leur bloc de référence */
      var r = cadre.getBoundingClientRect(), s = (el.querySelector('.pmax__plateau') || el).getBoundingClientRect();
      largeur = Math.round(r.width); hauteur = Math.round(r.height);
      if (!largeur || !hauteur) return false;
      ratio = Math.min(2, W.devicePixelRatio || 1);
      toile.width = Math.round(largeur * ratio); toile.height = Math.round(hauteur * ratio);
      decalage = [r.left - s.left, r.top - s.top];
      /* Les étiquettes entrent dans le dessin quand il est assez grand pour les lire. */
      var avant = dansLeDessin;
      dansLeDessin = largeur >= 680;
      el.setAttribute('data-etiquettes', dansLeDessin ? 'dessin' : 'liste');
      el.style.setProperty('--u', (largeur / CADRES.ensemble.l).toFixed(2));
      if (avant && !dansLeDessin) etiquettes.forEach(function (e) { e.el.style.transform = ''; e.el.style.opacity = ''; });
      return true;
    }
    function rendu(t) {
      dernier = t;
      if (!largeur && !mesurer()) return;
      /* le dessin */
      cadrer(largeur, hauteur, dansLeDessin || largeur >= 560 ? CADRES.ensemble : camera(t));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, largeur, hauteur);
      dessiner(g, t);
      /* les étiquettes : elles glissent le long de leur ligne de texte et se posent */
      if (dansLeDessin) {
        for (var i = 0; i < etiquettes.length; i++) {
          var e = etiquettes[i], d = e.d, pl = PLANS[d.plan], p = entree(seg(t, d.t0, d.t0 + 0.55)), r = 0.35 * (1 - p);
          var q = proj([d.p[0] - pl[4][0] * r, d.p[1] - pl[4][1] * r, d.p[2]]);
          e.el.style.transform = 'matrix(' + pl[0].toFixed(4) + ',' + pl[1] + ',' + pl[2].toFixed(4) + ',' + pl[3] + ',' +
            (decalage[0] + q[0]).toFixed(1) + ',' + (decalage[1] + q[1]).toFixed(1) + ') translate(' + (d.centre ? '-50%' : '0') + ',-50%)';
          e.el.style.opacity = seg(t, d.t0, d.t0 + 0.12).toFixed(3);
        }
      }
      /* la phrase de conclusion monte de son masque, une ligne après l'autre */
      for (var l = 0; l < lignes.length; l++) {
        var pc = entree(seg(t, T.conclusion + l * 0.13, T.conclusion + l * 0.13 + 0.7));
        lignes[l].style.transform = pc >= 1 ? '' : 'translate3d(0,' + (125 * (1 - pc)).toFixed(2) + '%,0)';
      }
    }
    mesurer();
    el.setAttribute('data-toile', 'on');
    MDP.scene(el, { tenue: T.fin, rendu: rendu, seuil: 0.3 });
    /* Le dessin se recale sur sa nouvelle taille, sans toucher à l'état de la scène. */
    if ('ResizeObserver' in W) new ResizeObserver(function () { if (mesurer()) rendu(dernier); }).observe(cadre);
  })();

  /* ==========================================================================
     5. LA SCÈNE DE LA MÉTHODE DANS LA PAGE
     Le grand disque habite la dernière station (c'est l'état final, et ce que
     montre la page sans JavaScript). Le script le déplace vers les autres.
     ======================================================================== */
  (function () {
    var el = document.getElementById('scene-methode');
    if (!el) return;
    var mobile = el.querySelector('.methode__mobile'), stations = [].slice.call(el.querySelectorAll('.station'));
    var marques = [].slice.call(el.querySelectorAll('.station__marque'));
    if (!mobile || stations.length !== 4) return;
    var resultat = mobile.querySelector('.forme__resultat'), trace = mobile.querySelector('.forme__trace'),
        trou1 = mobile.querySelector('.forme__trou--loupe'), trou2 = mobile.querySelector('.forme__trou--curseur'),
        corps = mobile.querySelector('.methode__corps'), ombreEl = mobile.querySelector('.methode__ombre');
    var lieux = [], dernier = M.fin;

    function mesurer() {
      var z = marques[3].getBoundingClientRect();
      lieux = marques.map(function (m) { var r = m.getBoundingClientRect(); return [r.left + r.width / 2 - (z.left + z.width / 2), r.top + r.height / 2 - (z.top + z.height / 2)]; });
    }
    function lieu(pos) {
      var i = Math.min(2, Math.floor(pos)), u = pos - i;
      return [mix(lieux[i][0], lieux[i + 1][0], u), mix(lieux[i][1], lieux[i + 1][1], u)];
    }
    function rendu(t) {
      dernier = t;
      if (!lieux.length) mesurer();
      var e = etatMethode(t), p = lieu(e.pos);
      /* l'étirement suit la vitesse, à volume constant, dans le sens du voyage */
      var a = lieu(etatMethode(t - 0.016).pos), b = lieu(etatMethode(t + 0.016).pos);
      var vx = (b[0] - a[0]) / 0.032, vy = (b[1] - a[1]) / 0.032, v = Math.hypot(vx, vy);
      var etire = Math.min(0.3, v / 3600), horizontal = Math.abs(vx) >= Math.abs(vy);
      var sl = e.base * (1 + etire - e.reb), st = e.base * (1 / (1 + etire) + e.reb);
      mobile.style.transform = 'translate3d(' + p[0].toFixed(2) + 'px,' + p[1].toFixed(2) + 'px,0)';
      var ech = horizontal ? 'scale(' + sl.toFixed(4) + ',' + st.toFixed(4) + ')' : 'scale(' + st.toFixed(4) + ',' + sl.toFixed(4) + ')';
      corps.style.transform = ech;
      ombreEl.style.transform = 'translate3d(6px,9px,0) ' + ech;
      resultat.setAttribute('r', e.resultat.toFixed(2));
      trou1.setAttribute('r', e.trou1.toFixed(2)); trou2.setAttribute('r', Math.max(0, e.trou2).toFixed(2));
      trace.setAttribute('d', e.d);
      trace.setAttribute('transform', 'scale(' + e.gonfle.toFixed(4) + ')');
      /* le rail se trace de station en station, chaque repère se pose à son tour */
      for (var i = 0; i < 4; i++) {
        stations[i].style.setProperty('--trait', entree(seg(t, 0.2 + i * 0.18, 0.95 + i * 0.18)).toFixed(4));
        stations[i].style.setProperty('--pose', Math.max(0, surgit(seg(t, 0.35 + i * 0.18, 0.75 + i * 0.18))).toFixed(4));
      }
    }
    mesurer();
    MDP.scene(el, { tenue: M.fin, rendu: rendu, seuil: 0.3 });
    if ('ResizeObserver' in W) new ResizeObserver(function () { mesurer(); rendu(dernier); }).observe(el);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { mesurer(); rendu(dernier); });
  })();
})();
