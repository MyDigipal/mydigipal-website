/**
 * Les formes du morphing sur rail (`RailMorphing.astro`), portées de la maquette
 * Encre (`labo/refonte-site/direction-a.js`, bloc GEO) et de l'essai `morph-formes`.
 *
 * Module PUR : il ne connaît que Math. Le même code sert au build (le tracé de l'état
 * final et ceux des petites traces laissées aux stations sont écrits dans le HTML) et
 * dans le navigateur (le passage d'une forme à l'autre). Chaque contour a N points à
 * égale distance, dans le même sens, et le départ de chaque forme est aligné sur celui
 * de la précédente : le passage ne se tord pas.
 *
 * Les formes sont dessinées dans un carré de -100 à 100 ; un trou (le verre de la
 * loupe, l'œil du curseur) ne se morphe pas, c'est un disque à part.
 */

export const N = 240;

export type Point = { x: number; y: number };
export type Trou = { x: number; y: number; r: number };
export type NomForme = 'loupe' | 'structure' | 'curseur' | 'courbe' | 'cible' | 'bulle';

const pt = (x: number, y: number): Point => ({ x, y });
const sub = (a: Point, b: Point) => pt(a.x - b.x, a.y - b.y);
const add = (a: Point, b: Point) => pt(a.x + b.x, a.y + b.y);
const mul = (a: Point, k: number) => pt(a.x * k, a.y * k);
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const norm = (a: Point) => {
  const l = Math.hypot(a.x, a.y) || 1;
  return pt(a.x / l, a.y / l);
};
const borne = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const melanger = (a: number, b: number, p: number) => a + (b - a) * p;

/** Remplace chaque sommet par un congé de rayon r (nombre ou tableau). */
function arrondir(pts: Point[], rayons: number | number[], n: number): Point[] {
  const out: Point[] = [];
  const m = pts.length;
  for (let i = 0; i < m; i++) {
    const p0 = pts[(i - 1 + m) % m];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % m];
    const v1 = norm(sub(p0, p1));
    const v2 = norm(sub(p2, p1));
    const ang = Math.acos(borne(v1.x * v2.x + v1.y * v2.y, -1, 1));
    const r = typeof rayons === 'number' ? rayons : rayons[i];
    if (ang < 0.02 || ang > Math.PI - 0.02 || !(r > 0)) {
      out.push(p1);
      continue;
    }
    const tanH = Math.tan(ang / 2);
    const rr = Math.min(r, (dist(p0, p1) / 2) * tanH, (dist(p2, p1) / 2) * tanH);
    const d = rr / tanH;
    const a = add(p1, mul(v1, d));
    const b = add(p1, mul(v2, d));
    const c = add(p1, mul(norm(add(v1, v2)), rr / Math.sin(ang / 2)));
    const a0 = Math.atan2(a.y - c.y, a.x - c.x);
    const a1 = Math.atan2(b.y - c.y, b.x - c.x);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    for (let k = 0; k <= n; k++) {
      const aa = a0 + (da * k) / n;
      out.push(pt(c.x + rr * Math.cos(aa), c.y + rr * Math.sin(aa)));
    }
  }
  return out;
}

/** Même sens de parcours pour tous les contours. */
function orienter(pts: Point[]): Point[] {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const q = pts[(i + 1) % pts.length];
    s += pts[i].x * q.y - q.x * pts[i].y;
  }
  return s < 0 ? pts.slice().reverse() : pts;
}

/** N points à égale distance le long du contour fermé. */
function reechantillonner(pts: Point[], n: number): Point[] {
  const L = [0];
  let tot = 0;
  for (let i = 0; i < pts.length; i++) {
    tot += dist(pts[i], pts[(i + 1) % pts.length]);
    L.push(tot);
  }
  const out: Point[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (tot * k) / n;
    while (j < pts.length - 1 && L[j + 1] < s) j++;
    const a = pts[j];
    const b = pts[(j + 1) % pts.length];
    const u = (s - L[j]) / (L[j + 1] - L[j] || 1);
    out.push(pt(melanger(a.x, b.x, u), melanger(a.y, b.y, u)));
  }
  return out;
}

/** Le point de départ de B tombe en face de celui de A (moindres carrés). */
function aligner(A: Point[], B: Point[]): Point[] {
  let best = 0;
  let bestD = Infinity;
  for (let k = 0; k < N; k++) {
    let d = 0;
    for (let i = 0; i < N; i += 3) {
      const b = B[(i + k) % N];
      d += (A[i].x - b.x) ** 2 + (A[i].y - b.y) ** 2;
    }
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return B.map((_, i) => B[(i + best) % N]);
}

const contour = (pts: Point[], rayons: number | number[]) => reechantillonner(orienter(arrondir(pts, rayons, 8)), N);

/* ------------------------------------------------------------------ les formes */

/** L'audit : une loupe. Le verre est un trou. */
function loupe(): Point[] {
  const cx = -10, cy = -10, R = 38, w = 9, long = 40, a = Math.PI / 4, da = Math.asin(w / R);
  const pts: Point[] = [];
  const rayons: number[] = [];
  const n = 60;
  for (let k = 0; k <= n; k++) {
    const ang = a + da + ((2 * Math.PI - 2 * da) * k) / n;
    pts.push(pt(cx + R * Math.cos(ang), cy + R * Math.sin(ang)));
    rayons.push(0);
  }
  const d = pt(Math.cos(a), Math.sin(a));
  const nrm = pt(-d.y, d.x);
  const bout = pt(cx + d.x * (R + long), cy + d.y * (R + long));
  pts.push(sub(bout, mul(nrm, w)));
  rayons.push(8);
  pts.push(add(bout, mul(nrm, w)));
  rayons.push(8);
  return contour(pts, rayons);
}

/** La stratégie : une structure, un bloc qui en commande deux. */
function structure(): Point[] {
  const pts = [
    pt(-21, -52), pt(21, -52), pt(21, -24), pt(5, -24), pt(5, -6), pt(43, -6), pt(43, 18), pt(57, 18), pt(57, 48),
    pt(19, 48), pt(19, 18), pt(33, 18), pt(33, 4), pt(-33, 4), pt(-33, 18), pt(-19, 18), pt(-19, 48), pt(-57, 48),
    pt(-57, 18), pt(-43, 18), pt(-43, -6), pt(-5, -6), pt(-5, -24), pt(-21, -24),
  ];
  const r = [7, 7, 7, 2, 2, 5, 2, 7, 7, 7, 7, 2, 2, 2, 2, 7, 7, 7, 7, 2, 5, 2, 2, 7];
  return contour(pts, r);
}

/** L'optimisation : un curseur de réglage sur sa glissière. L'œil est un trou. */
function curseur(): Point[] {
  const h = 6, x0 = -58, x1 = 58, kx = 18, R = 23;
  const pts: Point[] = [];
  const rayons: number[] = [];
  const dx = Math.sqrt(R * R - h * h), a0 = Math.asin(h / R), n = 28;
  pts.push(pt(x0, -h)); rayons.push(h);
  pts.push(pt(kx - dx, -h)); rayons.push(3);
  for (let k = 1; k < n; k++) {
    const ang = Math.PI + a0 + ((Math.PI - 2 * a0) * k) / n;
    pts.push(pt(kx + R * Math.cos(ang), R * Math.sin(ang))); rayons.push(0);
  }
  pts.push(pt(kx + dx, -h)); rayons.push(3);
  pts.push(pt(x1, -h)); rayons.push(h);
  pts.push(pt(x1, h)); rayons.push(h);
  pts.push(pt(kx + dx, h)); rayons.push(3);
  for (let k = 1; k < n; k++) {
    const ang = a0 + ((Math.PI - 2 * a0) * k) / n;
    pts.push(pt(kx + R * Math.cos(ang), R * Math.sin(ang))); rayons.push(0);
  }
  pts.push(pt(kx - dx, h)); rayons.push(3);
  pts.push(pt(x0, h)); rayons.push(h);
  return contour(pts, rayons);
}

/** Le reporting : une courbe qui monte, terminée par sa flèche. */
function courbe(): Point[] {
  const P = [pt(-58, 36), pt(-22, -2), pt(2, 18), pt(40, -22)];
  const h = 8, aile = 21, pointe = 26;
  const d: Point[] = [];
  const n: Point[] = [];
  for (let i = 0; i < P.length - 1; i++) {
    d.push(norm(sub(P[i + 1], P[i])));
    n.push(pt(-d[i].y, d[i].x));
  }
  const onglet = (k: number) => mul(add(n[k - 1], n[k]), h / (1 + n[k - 1].x * n[k].x + n[k - 1].y * n[k].y));
  const m1 = onglet(1), m2 = onglet(2), dn = d[2], nn = n[2], bout = P[3];
  const pts = [
    sub(P[0], mul(n[0], h)), sub(P[1], m1), sub(P[2], m2), sub(bout, mul(nn, h)), sub(bout, mul(nn, aile)),
    add(bout, mul(dn, pointe)),
    add(bout, mul(nn, aile)), add(bout, mul(nn, h)), add(P[2], m2), add(P[1], m1), add(P[0], mul(n[0], h)),
  ];
  return contour(pts, [8, 7, 7, 2, 5, 5, 5, 2, 7, 7, 8]);
}

/** Viser : une cible, l'anneau extérieur plein et le centre en trou. */
function cible(): Point[] {
  const pts: Point[] = [];
  const n = 72;
  for (let k = 0; k < n; k++) {
    const a = (2 * Math.PI * k) / n;
    pts.push(pt(46 * Math.cos(a), 46 * Math.sin(a)));
  }
  return contour(pts, 0);
}

/** Échanger : une bulle de conversation, avec sa pointe. */
function bulle(): Point[] {
  const pts = [pt(-50, -38), pt(50, -38), pt(50, 22), pt(-6, 22), pt(-30, 46), pt(-26, 22), pt(-50, 22)];
  return contour(pts, [14, 14, 14, 3, 3, 3, 14]);
}

const DESSINS: Record<NomForme, () => Point[]> = { loupe, structure, curseur, courbe, cible, bulle };

export const TROUS: Record<NomForme, Trou | null> = {
  loupe: { x: -10, y: -10, r: 25 },
  structure: null,
  curseur: { x: 18, y: 0, r: 9 },
  courbe: null,
  cible: { x: 0, y: 0, r: 20 },
  bulle: null,
};

/** Les contours d'une suite de formes, chacun aligné sur le précédent. */
export function suiteDeFormes(noms: NomForme[]): Point[][] {
  const F: Point[][] = [];
  noms.forEach((nom, i) => {
    const brut = DESSINS[nom]();
    F.push(i === 0 ? brut : aligner(F[i - 1], brut));
  });
  return F;
}

/** Le tracé entre A et B à la progression p, avec une ondulation qui n'existe qu'au milieu du passage. */
export function melange(A: Point[], B: Point[], p: number, amp = 0): string {
  const w = Math.sin(p * Math.PI);
  let s = '';
  for (let i = 0; i < N; i++) {
    let x = melanger(A[i].x, B[i].x, p);
    let y = melanger(A[i].y, B[i].y, p);
    if (amp > 0 && w > 0) {
      const ang = Math.atan2(y, x);
      const r = Math.hypot(x, y) + amp * w * Math.sin(ang * 3 + p * 6.2832);
      x = r * Math.cos(ang);
      y = r * Math.sin(ang);
    }
    s += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return s + 'Z';
}

/** Le tracé fixe d'une forme. */
export const chemin = (F: Point[]): string => melange(F, F, 0, 0);
