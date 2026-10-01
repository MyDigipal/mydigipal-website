// @ts-nocheck
/**
 * Deux scènes des pages automobile (01/10/2026), reprises de l'audit flash Jallu-Berthier que
 * Paul a validé (« j'adore l'animation ») :
 *   creerFlux      la chaîne en isométrie : les voitures du stock deviennent des blocs de données,
 *                  Merchant Center en fait des annonces, un acheteur en choisit une et repart ;
 *   creerGraphique les conversions cumulées et le coût par conversion, mois par mois.
 * Chaque état est une fonction pure de t (`root.__render(t)` pose un instant, pour vérifier).
 * La lecture démarre à l'entrée dans l'écran, tient sur une image lisible, puis reprend tant que
 * le bloc reste à l'écran. Mouvement réduit ou `?fige=1` : image finale.
 * Source : `projects/_shared/motion-lib/` (essais process-iso et données vivantes).
 * Fichier généré depuis l'audit, puis tenu à la main ici.
 */
var TAU = Math.PI * 2;
var REDUIT = /[?&]fige=1/.test(window.location.search) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
function mix(a, b, p) { return a + (b - a) * p; }
function mod(a, n) { return ((a % n) + n) % n; }
function outExpo(p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }
function outQuart(p) { return 1 - Math.pow(1 - p, 4); }
function inQuad(p) { return p * p; }
function inOutCubic(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function inOutSine(p) { return -(Math.cos(Math.PI * p) - 1) / 2; }
function outBack(s) { return function (p) { return 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2); }; }
function bosse(p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); }
/* Prévient à chaque entrée et à chaque sortie de l'écran : les boucles ne tournent que sous les yeux du lecteur. */
function enVue(el, suivre) {
  if (!('IntersectionObserver' in window)) { suivre(true); return; }
  new IntersectionObserver(function (es) {
    es.forEach(function (e) { suivre(e.isIntersecting); });
  }, { threshold: 0, rootMargin: '0px 0px -20% 0px' }).observe(el);
}

/* ------------------------------------------------------------------ 1. la chaîne en isométrie */
var PLAQUE = [26, 47, 79], BLOC = [59, 95, 153], TAPIS = [16, 29, 50], RAIL = [38, 62, 102],
    BLEU = [127, 196, 221], OR = [200, 169, 81], IVOIRE = [244, 241, 234], VERT = [52, 168, 120], NUIT = [14, 24, 42];
function rgb(c, k) { return 'rgb(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ')'; }
var L = (function () { var v = [-0.6, 0.2, 0.75], n = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); return [v[0] / n, v[1] / n, v[2] / n]; })();
function lum(n) { var d = n[0] * L[0] + n[1] * L[1] + n[2] * L[2]; return 0.46 + 0.54 * Math.pow(clamp((d + 0.2) / 0.965, 0, 1), 0.8); }
/* Projection isométrique vraie : x vers la droite et le bas, y vers la gauche et le bas, z vers le haut. */
var U = 70, OX = 940, OY = 600, C = Math.cos(Math.PI / 6), S = 0.5;
function proj(p) { return [OX + (p[0] - p[1]) * C * U, OY + (p[0] + p[1]) * S * U - p[2] * U]; }
function fx(v) { return v.toFixed(1); }
function ptsList(P) { var s = ''; for (var i = 0; i < P.length; i++) { var q = proj(P[i]); s += (i ? ' ' : '') + fx(q[0]) + ',' + fx(q[1]); } return s; }
function quad(P, attrs) { return '<polygon points="' + ptsList(P) + '"' + (attrs ? ' ' + attrs : '') + '/>'; }
function ligne(a, b) { var A = proj(a), B = proj(b); return '<line x1="' + fx(A[0]) + '" y1="' + fx(A[1]) + '" x2="' + fx(B[0]) + '" y2="' + fx(B[1]) + '"/>'; }
var FACES = [[1, 3, 7, 5], [0, 4, 6, 2], [2, 6, 7, 3], [0, 1, 5, 4], [4, 5, 7, 6], [0, 2, 3, 1]];
var NORM = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
function tourner(p, rz) { var cz = Math.cos(rz), sz = Math.sin(rz); return [p[0] * cz - p[1] * sz, p[0] * sz + p[1] * cz, p[2]]; }
function solide(c, d, rz) {
  rz = rz || 0;
  var V = [], N = [], i;
  for (i = 0; i < 8; i++) { var q = tourner([(i & 1 ? d[0] : -d[0]) / 2, (i & 2 ? d[1] : -d[1]) / 2, (i & 4 ? d[2] : -d[2]) / 2], rz); V.push([c[0] + q[0], c[1] + q[1], c[2] + q[2]]); }
  for (i = 0; i < 6; i++) N.push(tourner(NORM[i], rz));
  return { V: V, N: N, c: c, rz: rz };
}
function local(sol, p) { var q = tourner(p, sol.rz); return [sol.c[0] + q[0], sol.c[1] + q[1], sol.c[2] + q[2]]; }
function visible(n) { return n[0] + n[1] + n[2] > 1e-6; }
function facePts(sol, f) { return [sol.V[FACES[f][0]], sol.V[FACES[f][1]], sol.V[FACES[f][2]], sol.V[FACES[f][3]]]; }
function faces(sol, base, attrs) {
  var s = '';
  for (var f = 0; f < 6; f++) { if (!visible(sol.N[f])) continue; s += quad(facePts(sol, f), 'fill="' + rgb(base, lum(sol.N[f])) + '"' + (attrs ? ' ' + attrs : '')); }
  return s;
}
function coque(P) {
  P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
  var bas = [], haut = [], i;
  for (i = 0; i < P.length; i++) { while (bas.length >= 2 && cr(bas[bas.length - 2], bas[bas.length - 1], P[i]) <= 0) bas.pop(); bas.push(P[i]); }
  for (i = P.length - 1; i >= 0; i--) { while (haut.length >= 2 && cr(haut[haut.length - 2], haut[haut.length - 1], P[i]) <= 0) haut.pop(); haut.push(P[i]); }
  bas.pop(); haut.pop();
  return bas.concat(haut);
}
function ombre(V, val) {
  var P = [], i, v, h;
  for (i = 0; i < V.length; i++) { v = V[i]; h = v[2] - val; if (h < -1e-6) continue; P.push(proj([v[0] - L[0] / L[2] * h, v[1] - L[1] / L[2] * h, val])); }
  if (P.length < 3) return '';
  var H = coque(P), s = '';
  for (i = 0; i < H.length; i++) s += (i ? ' ' : '') + fx(H[i][0]) + ',' + fx(H[i][1]);
  return '<polygon points="' + s + '"/>';
}
function anneau(c, r, n) { var P = []; for (var i = 0; i < n; i++) { var a = TAU * i / n; P.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), c[2]]); } return ptsList(P); }

/* La partition. Tout ce qui roule sur le tapis partage la même avance p(t). Un objet est une petite voiture avant
   le lecteur, des blocs de données entre le lecteur et le rideau, une annonce dressée après le rideau. */
var HA = 0.4, XA = -1.3, XP = 1.3, YR = -2.5, PAS = 0.4;
var XS = -3.6, ECART = 1.0, PMAX = 7.7, T0 = 2.2, T1 = 9.2, XCH = 3.1;
function avance(t) { return PMAX * inOutSine(seg(t, T0, T1)); }
function tDe(p) { return T0 + (T1 - T0) * Math.acos(1 - 2 * clamp(p / PMAX, 0, 1)) / Math.PI; }
var LABT = [1.9, tDe(2.2), tDe(4.6), tDe(5.6), 11.8];
var ANCRES = [[-4.4, 0.3, 1.25], [-1.3, 0, 3.05], [1.3, 0, 2.42], [3.1, 1.5, 0], [5.3, YR, 1.55]];
var LOGO = [1.3, 0, 3.3], VB = [450, 270, 1180, 640];
var DEBUT = 1.72, TENUE = 13.2, POLICE = "'Plus Jakarta Sans',Inter,sans-serif";
var CAISSES = [BLEU, IVOIRE, [233, 160, 120]], BLOCS = [BLEU, OR, BLEU];

export function creerFlux(root) {
  var svg = root.querySelector('.flow-svg'), etapes = root.querySelectorAll('.flow-steps li'), logos = root.querySelectorAll('.flow-logos span');
  if (!svg) { return; }
  var ID = root.id || 'flow', DEFS = '';
  var noms = (root.getAttribute('data-labels') || '').split('|');
  /* Les trois logos se posent au-dessus du portique de Merchant Center. Positions en pourcentage de la scène. */
  var ql = proj(LOGO);
  for (var li = 0; li < logos.length; li++) {
    logos[li].style.left = ((ql[0] + (li - 1) * 74 - VB[0]) / VB[2] * 100).toFixed(2) + '%';
    logos[li].style.top = ((ql[1] - VB[1]) / VB[3] * 100).toFixed(2) + '%';
  }

  function groupeOmbres(polys, clipP, id) {
    if (!polys) return '';
    DEFS += '<clipPath id="' + ID + '-' + id + '"><polygon points="' + ptsList(clipP) + '"/></clipPath>';
    return '<g clip-path="url(#' + ID + '-' + id + ')" fill="#03091a" opacity=".5">' + polys + '</g>';
  }
  function tapisCorps(x0, x1, y0, y1, h, phase) {
    var s = faces(solide([(x0 + x1) / 2, (y0 + y1) / 2, h / 2], [x1 - x0, y1 - y0, h]), TAPIS);
    s += faces(solide([(x0 + x1) / 2, y0 + 0.06, (h + 0.1) / 2], [x1 - x0, 0.12, h + 0.1]), RAIL);
    var len = x1 - x0, n = Math.round(len / PAS), b = '<g fill="rgba(127,196,221,.24)">';
    for (var k = 0; k < n; k++) {
      var xa = x0 + mod(k * PAS + phase, len), xb = Math.min(x1, xa + 0.1);
      if (xb - xa < 0.005) continue;
      b += quad([[xa, y0 + 0.14, h + 0.002], [xb, y0 + 0.14, h + 0.002], [xb, y1 - 0.14, h + 0.002], [xa, y1 - 0.14, h + 0.002]]);
    }
    return s + b + '</g>';
  }
  function portique(x) {
    var hP = 1.9;
    return {
      arriere: faces(solide([x, -1.0, hP / 2], [0.3, 0.3, hP]), RAIL),
      avant: faces(solide([x, 1.0, hP / 2], [0.3, 0.3, hP]), RAIL) + faces(solide([x, 0, hP - 0.15], [0.55, 2.3, 0.3]), BLOC),
      sommet: hP, V: solide([x, 0, hP / 2], [0.55, 2.3, hP]).V
    };
  }
  /* Une voiture : caisse, habitacle, quatre roues. Posée à la hauteur z, à l'échelle k, dans la teinte donnée.
     Les vitres s'allument quand l'acheteur est à bord. */
  function voiture(x, y, k, occupee, z, teinte) {
    if (k < 0.01) return '';
    z = z || 0; teinte = teinte || BLEU;
    var z0 = z + 0.13 * k, s = '', i, roues = [[0.46, -0.37], [-0.46, -0.37], [0.46, 0.37], [-0.46, 0.37]];
    for (i = 0; i < 2; i++) s += faces(solide([x + roues[i][0] * k, y + roues[i][1] * k, z + 0.15 * k], [0.3 * k, 0.1 * k, 0.3 * k]), NUIT);
    var caisse = solide([x, y, z0 + 0.17 * k], [1.5 * k, 0.72 * k, 0.34 * k]);
    s += faces(caisse, teinte);
    var hab = solide([x - 0.14 * k, y, z0 + 0.34 * k + 0.14 * k], [0.78 * k, 0.62 * k, 0.28 * k]);
    s += faces(hab, [Math.min(255, teinte[0] + 22), Math.min(255, teinte[1] + 14), Math.min(255, teinte[2] + 10)]);
    var vitre = occupee ? 'fill="#e3c877"' : 'fill="#0a1626" opacity=".7"';
    s += quad([local(hab, [0.392 * k, -0.25 * k, -0.09 * k]), local(hab, [0.392 * k, 0.25 * k, -0.09 * k]), local(hab, [0.392 * k, 0.25 * k, 0.1 * k]), local(hab, [0.392 * k, -0.25 * k, 0.1 * k])], vitre);
    s += quad([local(hab, [-0.3 * k, 0.312 * k, -0.09 * k]), local(hab, [0.3 * k, 0.312 * k, -0.09 * k]), local(hab, [0.3 * k, 0.312 * k, 0.1 * k]), local(hab, [-0.3 * k, 0.312 * k, 0.1 * k])], vitre);
    s += quad([local(caisse, [0.752 * k, 0.16 * k, 0.0]), local(caisse, [0.752 * k, 0.3 * k, 0.0]), local(caisse, [0.752 * k, 0.3 * k, 0.09 * k]), local(caisse, [0.752 * k, 0.16 * k, 0.09 * k])], 'fill="#e3c877"');
    for (i = 2; i < 4; i++) s += faces(solide([x + roues[i][0] * k, y + roues[i][1] * k, z + 0.15 * k], [0.3 * k, 0.1 * k, 0.3 * k]), NUIT);
    return s;
  }
  /* L'annonce, dressée : photo, voiture, prix, coche. dz la soulève, or l'entoure quand l'acheteur la choisit. */
  function annonce(x, y, zBase, k, or) {
    if (k < 0.01) return '';
    var b = zBase + 0.02, sol = solide([x, y, b + 0.625 * k], [0.1, 1.0 * k, 1.25 * k]), xf = x + 0.052;
    var P = function (yy, z) { return [xf, y + yy * k, b + z * k]; };
    var s = faces(sol, IVOIRE);
    s += quad([P(0.42, 0.56), P(-0.42, 0.56), P(-0.42, 1.15), P(0.42, 1.15)], 'fill="#7fc4dd"');
    s += quad([P(0.3, 0.66), P(0.22, 0.8), P(0.08, 0.9), P(-0.14, 0.9), P(-0.26, 0.78), P(-0.34, 0.74), P(-0.34, 0.66)], 'fill="#0a1626" opacity=".6"');
    s += quad([P(0.42, 0.34), P(0.02, 0.34), P(0.02, 0.46), P(0.42, 0.46)], 'fill="#c8a951"');
    s += quad([P(0.42, 0.18), P(-0.1, 0.18), P(-0.1, 0.22), P(0.42, 0.22)], 'fill="rgba(10,22,38,.4)"');
    s += quad([P(-0.2, 0.14), P(-0.42, 0.14), P(-0.42, 0.36), P(-0.2, 0.36)], 'fill="' + rgb(VERT, 1) + '"');
    if (or > 0.01) s += quad([P(0.5, 0), P(-0.5, 0), P(-0.5, 1.25), P(0.5, 1.25)], 'fill="none" stroke="#e3c877" stroke-linejoin="round" stroke-width="' + (4.5 * or).toFixed(2) + '"');
    return s;
  }
  function personne(x, y, z, k) {
    if (k < 0.01) return '';
    return faces(solide([x, y, z + 0.31 * k], [0.34 * k, 0.34 * k, 0.62 * k]), OR) + faces(solide([x, y, z + 0.62 * k + 0.15 * k], [0.26 * k, 0.26 * k, 0.26 * k]), IVOIRE);
  }

  var afficherNoms = true;
  function render(t) {
    t = clamp(+t || 0, 0, TENUE);
    DEFS = '';
    var s = '', i, j, d, hB = HA, p = avance(t);

    /* la plaque, sa grille, la route de sortie et sa rampe */
    var plaque = solide([0, -0.7, -0.14], [11.2, 5.6, 0.28]);
    s += faces(solide([6.9, YR, -0.14], [2.6, 1.3, 0.28]), PLAQUE);
    s += faces(plaque, PLAQUE);
    s += '<g stroke="rgba(127,196,221,.11)" stroke-width="1" fill="none">';
    for (i = -5; i <= 5; i++) s += ligne([i, -3.5, 0], [i, 2.1, 0]);
    for (i = -3; i <= 2; i++) s += ligne([-5.6, i, 0], [5.6, i, 0]);
    s += '</g>';
    s += quad([[2.2, YR - 0.55, 0.003], [8.2, YR - 0.55, 0.003], [8.2, YR + 0.55, 0.003], [2.2, YR + 0.55, 0.003]], 'fill="' + rgb(TAPIS, 1) + '"');
    s += '<g fill="rgba(244,241,234,.3)">';
    for (i = 0; i < 9; i++) { var xd = 2.5 + i * 0.66; s += quad([[xd, YR - 0.03, 0.004], [xd + 0.32, YR - 0.03, 0.004], [xd + 0.32, YR + 0.03, 0.004], [xd, YR + 0.03, 0.004]]); }
    s += '</g>';

    var tapis = solide([0, 0, hB / 2], [9.4, 1.5, hB]);
    var pA = portique(XA), pP = portique(XP);
    s += groupeOmbres(ombre(tapis.V, 0) + ombre(pA.V, 0) + ombre(pP.V, 0), facePts(plaque, 4), 'sol');

    /* l'acheteur, puis la voiture qu'il emmène, derrière le tapis */
    var choix = outBack(1.4)(seg(t, 9.95, 10.35));
    var pv = inOutCubic(seg(t, 10.5, 11.3));
    var kc = outBack(1.3)(seg(pv, 0.55, 1));
    var depart = inOutSine(seg(t, 11.9, 13.1));
    var xv = mix(XCH + 0.2, 6.75, depart);
    var kb = outBack(1.5)(seg(t, 9.3, 9.7));
    var saut = seg(t, 11.3, 11.75), bx = XCH + 0.15, by = -1.5;
    var pbx = mix(bx, XCH + 0.06, inOutCubic(saut)), pby = mix(by, YR, inOutCubic(saut));
    var pbz = 0.16 * bosse(seg(t, 9.95, 10.3)) + 0.7 * bosse(saut), pbk = kb * (1 - seg(saut, 0.7, 1));
    s += voiture(xv, YR, kc, saut >= 1, 0, BLEU);
    s += personne(pbx, pby, pbz, pbk);

    s += tapisCorps(-4.7, 4.7, -0.75, 0.75, hB, p);
    s += pA.arriere + pP.arriere;

    /* avant le rideau : les voitures du stock, puis leurs blocs de données */
    var lecture = 0, eclat = 0, apres = '';
    for (j = 2; j >= 0; j--) {
      var x = XS - j * ECART + p;
      var entree = j === 0 ? outBack(1.5)(seg(t, 1.75, 2.0)) : j === 1 ? outBack(1.5)(seg(t, 1.92, 2.17)) : seg(x, -5.0, -4.5);
      var kAuto = entree * (1 - seg(x, XA - 0.3, XA + 0.1));
      lecture = Math.max(lecture, bosse(seg(x, XA - 0.7, XA + 0.5)));
      if (kAuto > 0.01) s += voiture(x, 0, 0.62 * kAuto, false, hB, CAISSES[j]);
      for (d = -1; d <= 1; d++) {
        var xc = x + d * 0.3;
        var kq = outBack(1.6)(seg(xc, XA - 0.05, XA + 0.35)) * (1 - seg(xc, XP - 0.3, XP));
        eclat += bosse(seg(xc, XP - 0.4, XP + 0.1));
        if (kq < 0.02) continue;
        var cote = 0.26 * kq;
        s += faces(solide([xc, 0, hB + cote / 2 + 0.28 * bosse(seg(xc, XA - 0.05, XA + 0.55))], [cote, cote, cote]), BLOCS[d + 1]);
      }
      /* après le rideau : une annonce par voiture */
      var kf = outBack(1.4)(seg(x, XP + 0.15, XP + 0.6));
      var anneau1 = seg(x, XP + 0.15, XP + 1.1);
      if (anneau1 > 0 && anneau1 < 1) apres = '<polygon points="' + anneau([x, 0, hB + 0.01], 0.3 + 0.9 * outQuart(anneau1), 28) + '" fill="none" stroke="#7fc4dd" stroke-width="2.5" opacity="' + (0.75 * (1 - anneau1)).toFixed(3) + '"/>' + apres;
      if (j === 1) { if (pv <= 0) apres = annonce(x, 0, hB + 0.24 * choix, kf, choix) + apres; }
      else apres = annonce(x, 0, hB, kf, 0) + apres;
    }
    /* Merchant Center : le rideau de lumière, qui s'allume à chaque bloc avalé */
    s += quad([[XP, -0.72, hB], [XP, 0.72, hB], [XP, 0.72, 1.6], [XP, -0.72, 1.6]], 'fill="#7fc4dd" opacity="' + clamp(0.16 + 0.2 * eclat, 0, 0.8).toFixed(3) + '"');
    s += apres;
    s += faces(solide([0, 0.69, (hB + 0.1) / 2], [9.4, 0.12, hB + 0.1]), RAIL);

    /* le lecteur : tête tournante, oeil, barre de lecture quand une voiture passe dessous */
    s += pA.avant;
    var tete = solide([XA, 0, pA.sommet + 0.35], [0.62, 0.62, 0.62], TAU * t / 14);
    s += faces(tete, BLOC);
    if (visible(tete.N[0])) s += quad([local(tete, [0.311, -0.16, -0.16]), local(tete, [0.311, 0.16, -0.16]), local(tete, [0.311, 0.16, 0.16]), local(tete, [0.311, -0.16, 0.16])], 'fill="#7fc4dd" opacity="' + (0.55 + 0.45 * lecture).toFixed(3) + '"');
    if (lecture > 0.02) { var ys = 0.8 * Math.sin(TAU * t / 0.9); s += quad([[XA - 0.3, ys, hB + 0.5], [XA + 0.3, ys, hB + 0.5], [XA + 0.3, ys + 0.06, hB + 0.5], [XA - 0.3, ys + 0.06, hB + 0.5]], 'fill="#7fc4dd" opacity="' + (0.9 * lecture).toFixed(3) + '"'); }
    s += pP.avant;

    /* l'annonce choisie quitte le tapis, se pose sur la route et devient la voiture */
    if (pv > 0 && pv < 0.92) {
      var kv = 1 - seg(pv, 0.45, 0.9);
      s += annonce(mix(XCH, XCH + 0.2, pv), mix(0, YR, pv), 1.0 * bosse(pv) + mix(hB + 0.24, 0, pv), kv, 1);
    }

    /* les libellés : droits, à côté de leur station, nés quand l'objet y arrive (courbe nette) */
    for (i = 0; i < 5; i++) {
      var pa = outExpo(seg(t, LABT[i], LABT[i] + 0.55));
      if (etapes[i]) { etapes[i].classList.toggle('on', t >= LABT[i]); }
      if (!afficherNoms || pa <= 0.001 || !noms[i]) continue;
      var qa = proj(ANCRES[i]);
      s += '<text x="' + fx(qa[0]) + '" y="' + fx(qa[1] + 14 * (1 - pa)) + '" text-anchor="middle" font-family="' + POLICE + '" font-weight="800" font-size="22" letter-spacing="2.2" fill="' + (i === 4 ? '#e3c877' : '#9fd6ea') + '" stroke="#0a1626" stroke-width="7" stroke-linejoin="round" paint-order="stroke" opacity="' + pa.toFixed(3) + '">' + noms[i] + '</text>';
    }
    svg.innerHTML = '<defs>' + DEFS + '</defs>' + s;
    /* les logos des trois vitrines apparaissent quand les premiers blocs atteignent Merchant Center */
    for (i = 0; i < logos.length; i++) {
      var kl = outBack(1.6)(seg(p, 4.4 + 0.25 * i, 4.9 + 0.25 * i));
      logos[i].style.opacity = clamp(kl * 3, 0, 1).toFixed(2);
      logos[i].style.transform = 'scale(' + kl.toFixed(3) + ')';
    }
  }

  var raf = 0, t0 = 0, attente = 0, actif = false, PAUSE = 2800;
  function mesurer() { afficherNoms = svg.getBoundingClientRect().width >= 560; }
  function image(maintenant) {
    var t = DEBUT + (maintenant - t0) / 1000;
    if (t >= TENUE) { render(TENUE); root.classList.add('done'); attente = setTimeout(function () { if (actif) { jouer(); } }, PAUSE); return; }
    render(t);
    raf = requestAnimationFrame(image);
  }
  function arreter() { cancelAnimationFrame(raf); clearTimeout(attente); }
  function jouer() { arreter(); mesurer(); root.classList.remove('done'); t0 = performance.now(); raf = requestAnimationFrame(image); }
  root.classList.add('js');
  root.__render = function (t, avecNoms) { actif = false; arreter(); mesurer(); if (avecNoms) { afficherNoms = true; } render(t); };
  mesurer();
  if (REDUIT) { render(TENUE); root.classList.add('done'); }
  else { render(DEBUT); enVue(svg, function (vu) { actif = vu; if (vu) { jouer(); } else { arreter(); } }); }
  window.addEventListener('resize', function () { if (root.classList.contains('done')) { mesurer(); render(TENUE); } });
}

/* ------------------------------------------------------------------ 2. le graphique qui se construit */
function milliers(n, sep) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
export function creerGraphique(root) {
  var svg = root.querySelector('.viz-svg'), comptes = root.querySelectorAll('[data-compte]');
  if (!svg) { return; }
  var MOIS = (root.getAttribute('data-mois') || '').split('|'), ETIQ = (root.getAttribute('data-couts') || '').split('|'), SEP = root.getAttribute('data-sep') || ' ';
  var CONV = [819, 1638, 2683, 6675], COUT = [1.22, 0.97, 0.93, 0.80];
  var fr = function (n) { return milliers(n, SEP); };
  var X0p = 64, X1p = 730, YB = 300, HT = 250, MAXC = 7000, MAXE = 1.4, PASY = 2000, FIN = 4.4, PAR = 0.95;
  var cx = function (i) { return X0p + (X1p - X0p) * (i + 0.5) / 4; };
  var yc = function (v) { return YB - HT * v / MAXC; }, ye = function (v) { return YB - HT * v / MAXE; };
  function render(t) {
    t = clamp(t, 0, FIN);
    var s = '', i;
    for (i = 0; i <= 3; i++) {
      var y = yc(i * PASY);
      s += '<line x1="' + X0p + '" y1="' + y + '" x2="' + X1p + '" y2="' + y + '" stroke="#e2e8f0" stroke-width="1"/>';
      s += '<text x="' + (X0p - 10) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#94a3b8" font-family="Inter,sans-serif">' + fr(i * PASY) + '</text>';
    }
    var pts = [];
    for (i = 0; i < 4; i++) {
      var p = outExpo(seg(t, 0.25 + i * PAR, 0.25 + i * PAR + 0.75)), h = HT * CONV[i] / MAXC * p, x = cx(i);
      s += '<text x="' + x + '" y="' + (YB + 22) + '" text-anchor="middle" font-size="12" fill="#475569" font-family="Inter,sans-serif">' + MOIS[i] + '</text>';
      if (p <= 0) continue;
      s += '<rect x="' + (x - 46) + '" y="' + (YB - h).toFixed(1) + '" width="92" height="' + h.toFixed(1) + '" rx="5" fill="#6366f1"/>';
      var pl = seg(t, 0.25 + i * PAR + 0.45, 0.25 + i * PAR + 0.8);
      if (pl > 0) s += '<text x="' + x + '" y="' + (YB - h - 9).toFixed(1) + '" text-anchor="middle" font-size="14" font-weight="800" fill="#1e293b" font-family="' + POLICE + '" opacity="' + pl.toFixed(2) + '">' + fr(CONV[i]) + '</text>';
      pts.push([x, ye(COUT[i]), p, i]);
    }
    /* la courbe du coût par conversion avance d'un point à l'autre, avec le mois */
    var d = '';
    for (i = 0; i < pts.length; i++) {
      if (i === 0) { d += 'M' + pts[0][0] + ' ' + pts[0][1].toFixed(1); continue; }
      var a = pts[i - 1], b = pts[i];
      d += 'L' + mix(a[0], b[0], b[2]).toFixed(1) + ' ' + mix(a[1], b[1], b[2]).toFixed(1);
    }
    if (d) s += '<path d="' + d + '" fill="none" stroke="#ea580c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    for (i = 0; i < pts.length; i++) {
      var pp = pts[i]; if (pp[2] < 0.98 && i > 0) continue;
      s += '<circle cx="' + pp[0] + '" cy="' + pp[1].toFixed(1) + '" r="5" fill="#fff" stroke="#ea580c" stroke-width="3"/>';
      s += '<text x="' + pp[0] + '" y="' + (pp[1] - 13).toFixed(1) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="#c2410c" font-family="' + POLICE + '" stroke="#fff" stroke-width="4" paint-order="stroke" stroke-linejoin="round">' + ETIQ[pp[3]] + '</text>';
    }
    svg.innerHTML = s;
    var part = clamp(t / (0.25 + 3 * PAR + 0.75), 0, 1);
    comptes.forEach(function (el) { el.textContent = (el.getAttribute('data-prefixe') || '') + fr(+el.getAttribute('data-compte') * part) + (el.getAttribute('data-suffixe') || ''); });
  }
  var raf = 0, t0 = 0, attente = 0, actif = false, PAUSE = 4200;
  function image(maintenant) {
    var t = (maintenant - t0) / 1000;
    if (t >= FIN) { render(FIN); attente = setTimeout(function () { if (actif) { jouer(); } }, PAUSE); return; }
    render(t);
    raf = requestAnimationFrame(image);
  }
  function arreter() { cancelAnimationFrame(raf); clearTimeout(attente); }
  function jouer() { arreter(); t0 = performance.now(); raf = requestAnimationFrame(image); }
  root.classList.add('js');
  root.__render = function (t) { actif = false; arreter(); render(t); };
  if (REDUIT) { render(FIN); }
  else { render(0); enVue(svg, function (vu) { actif = vu; if (vu) { jouer(); } else { arreter(); } }); }
}
