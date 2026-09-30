# Digest technique de la motion-lib, pour l'adaptation au web

Lecture faite le 29/09/2026, en lecture seule, de `projects/_shared/motion-lib/` : `AVIS-PAUL.md`,
les six `labo/essais/NOTES-*.md`, `labo/essais/manifest.json`, `labo/lecteur.js`, le code complet et
la fiche `.json` des douze essais favoris, un survol des sept essais refusés, et la section 4 de
`RECHERCHE.md`.

Comment lire ce document :

- **Un numéro de ligne cité renvoie au fichier `labo/essais/<essai>.html`**, sauf mention contraire.
- **Les temps sont en secondes depuis le début de la boucle de l'essai.**
- **Les chiffres marqués « calculé »** sortent de trois petits scripts posés dans le scratchpad de
  la session (`courbes.js`, `mesures.js`, `poids.py`). Ils rejouent les formules du code en Node,
  sans navigateur. Les poids sont mesurés par téléchargement des fichiers le 29/09/2026
  (sous-ensemble `latin` des polices, format woff2).
- **« Hors fichiers »** signale une affirmation qui vient de ma connaissance générale et non de la
  bibliothèque. Elle est à vérifier avant de coder dessus.
- Aucun rendu vidéo, aucun navigateur, aucun serveur n'a été lancé. Rien de ce qui suit n'a été
  jugé à l'écran.

---

## A. La courbe signature

### A.1 Ce que dit le code

Fichier `courbes-signature.html`. Les fonctions de base (lignes 47 à 53) :

```js
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const mix = (a, b, p) => a + (b - a) * p;
const outExpo = p => p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
const inCubic = p => p * p * p;
const outQuint = p => 1 - Math.pow(1 - p, 5);
const inQuint = p => p * p * p * p * p;
```

La personnalité A, telle qu'elle est écrite (lignes 81 à 85), avec `F = 1 / 30` (ligne 65) :

```js
{ id: 'A', nom: 'nette', detail: 'expo 0,55 s · sortie cubique 0,40 s',
  dEntree: 0.55, retard: 1 * F,
  entree: s => outExpo(clamp(s / 0.55, 0, 1)),
  sortie: s => inCubic(clamp(s / 0.40, 0, 1)),
  suivi: () => 0 },
```

| Paramètre | Valeur | Source |
|---|---|---|
| Entrée | `1 - 2^(-10 p)`, avec `p = s / 0,55` | lignes 50 et 83 |
| Durée d'entrée | 0,55 s | ligne 83 |
| Sortie | `p³`, avec `p = s / 0,40` | lignes 51 et 84 |
| Durée de sortie | 0,40 s, soit 0,73 fois l'entrée | ligne 84 |
| Retard des éléments secondaires | 1 image à 30 i/s, soit 33 ms | lignes 65 et 82 |
| Suivi après la pose | aucun | ligne 85 |
| Dépassement | 0 | `NOTES-rythme.md`, tableau des trois personnalités |
| Course d'entrée de la carte | 220 px (`COURSE`) | ligne 73 |
| Course de sortie | 240 px (`FUITE`) | ligne 74 |

Le profil de l'entrée, calculé : 50 % de la course à 55 ms, 75 % à 110 ms, 87,5 % à 165 ms, 96,9 % à
275 ms, 99,2 % à 385 ms. À 60 Hz, la première image affichée (16,7 ms) a déjà fait 19 % du trajet.
C'est ce qui fait « rapide et franche ». La formule s'arrête à 0,999 et le code force 1 à `p = 1` :
le saut final vaut 0,1 % de la course, soit 0,2 px sur 220 px.

### A.2 Comment la courbe est appliquée au geste (lignes 159 à 206)

La chorégraphie commune (`CHOREO`, lignes 68 à 72) : carte à 0,40 s, ligne de texte à 1,25 s,
souligné à 2,10 s, sorties à 4,40 s (carte), 4,50 s (souligné) et 4,55 s (texte).

| Élément | Ce qui est animé | Détail |
|---|---|---|
| Carte | `translateY`, `scale`, `opacity` | y de 220 px vers 0 ; échelle de 0,94 vers 1 ; opacité pleine dès que la progression atteint 0,35, soit 34 ms (calculé) |
| Intérieur de la carte | `translateY`, `opacity` | même courbe, 33 ms plus tard ; la position est la différence entre la carte en retard et la carte maintenant (ligne 176) |
| Petit trait | `translateY`, `scaleX` | 66 ms de retard, « le détail qui arrive en dernier » |
| Ombre | `translateY`, `scale`, `opacity` | 66 ms de retard, 30 px plus bas, échelle 0,9 vers 1, opacité 0,85 ; le flou de 30 px est fixe (ligne 21) |
| Ligne sous masque | `translateY` en pourcentage | de 125 % vers 0, sortie vers -130 % (ligne 193) |
| Souligné | `scaleX` | se trace depuis la gauche, se retire par la droite, ne recule jamais (lignes 197 à 205) |

Tout ce geste n'anime que `transform` et `opacity`. Parmi les douze favoris, seuls cet essai et
`tableau-chiffres` s'en tiennent à ces deux propriétés.

### A.3 L'équivalent CSS

| Usage | Valeur CSS | Fidélité (calculé) |
|---|---|---|
| Entrée, forme courte | `cubic-bezier(0.16, 1, 0.3, 1)` | écart maximal 1,20 % à 24 ms, soit 2,6 px sur 220 px |
| Entrée, meilleur `cubic-bezier` trouvé | `cubic-bezier(0.15, 1, 0.32, 1)` | écart maximal 0,32 %, soit 0,7 px sur 220 px |
| Entrée, forme fidèle | `linear()` à 14 points, ci-dessous | écart maximal 0,48 % |
| Sortie | `cubic-bezier(0.333, 0, 0.667, 0)` | exacte : `p³` est une courbe de Bézier cubique de points (1/3 ; 0) et (2/3 ; 0). Écart mesuré 0,02 %, dû à l'arrondi |
| Sortie, valeur usuelle | `cubic-bezier(0.32, 0, 0.67, 0)` | écart maximal 0,28 % |

La forme fidèle de l'entrée :

```css
linear(0, 0.1692 2.7%, 0.317 5.5%, 0.4462 8.5%, 0.5579 11.8%, 0.6531 15.3%, 0.7339 19.1%,
  0.8011 23.3%, 0.8557 27.9%, 0.8962 32.7%, 0.9282 38%, 0.9711 51.1%, 0.9915 68.7%, 1)
```

Une version à 11 points tient dans 1 % d'écart :
`linear(0, 0.1692 2.7%, 0.317 5.5%, 0.4462 8.5%, 0.5579 11.8%, 0.6531 15.3%, 0.7339 19.1%, 0.8557 27.9%, 0.9282 38%, 0.9711 51.1%, 1)`.

Les jetons que je recommande de poser dans `src/styles/global.css` :

```css
:root {
  --mdp-entree: cubic-bezier(0.15, 1, 0.32, 1);        /* outExpo, écart 0,32 % */
  --mdp-sortie: cubic-bezier(0.333, 0, 0.667, 0);      /* inCubic, exacte */
  --mdp-d-entree: 550ms;
  --mdp-d-sortie: 400ms;
  --mdp-d-ligne: 900ms;                                /* ligne de titre sous masque, voir A.4 */
  --mdp-retard: 33ms;                                  /* éléments secondaires */
}
@supports (transition-timing-function: linear(0, 1)) {
  :root { --mdp-entree: linear(0, 0.1692 2.7%, 0.317 5.5%, 0.4462 8.5%, 0.5579 11.8%, 0.6531 15.3%,
    0.7339 19.1%, 0.8011 23.3%, 0.8557 27.9%, 0.8962 32.7%, 0.9282 38%, 0.9711 51.1%, 0.9915 68.7%, 1); }
}
```

Hors fichiers : `linear()` est pris en charge par Chrome 113, Firefox 112 et Safari 17.2 d'après mes
connaissances. À vérifier. Le `cubic-bezier` de repli suffit à l'œil, l'écart reste sous le pixel.

En JavaScript (pilotage par le défilement, Web Animations API), les deux fonctions se reprennent
telles quelles : `outExpo` et `inCubic` font une ligne chacune.

### A.4 La même courbe, d'autres durées dans les essais favoris

Le 0,55 s vaut pour un objet. Pour une ligne de titre qui monte de son masque, les essais gardent
`outExpo` mais allongent la durée :

| Essai | Entrée de ligne | Sortie de ligne | Décalage entre lignes | Source |
|---|---|---|---|---|
| `carte-3d` | `outExpo`, 0,90 à 1,00 s | `inQuart`, 0,50 s | 0,12 s à l'entrée, 0,08 s à la sortie | lignes 94 à 106 |
| `degrade-maille` | `outExpo`, 0,90 à 1,05 s | `inQuart`, 0,50 s | 0,14 à 0,15 s | lignes 119 à 123 et 162 à 165 |
| `particules-texte` | `outExpo`, 0,90 s | `inQuart`, 0,50 s | une seule ligne | lignes 64 à 69 |
| `vertical-teaser` | `outExpo`, 0,32 s (mot qui claque) | aucune | 0,07 s entre deux lignes d'un titre | lignes 129 à 134 |

Trois favoris animent leurs titres avec un dépassement, ce qui contredit la courbe A et la règle 4.3
de `RECHERCHE.md` (« jamais au texte courant ») : `isometrique` (`outBack(1.3)`, ligne 345),
`morph-formes` (`outBack(1.3)` et `outBack(1.4)`, lignes 240 et 243), `tableau-chiffres`
(`outBack(1.3)`, ligne 157). Sur le site, ces titres passent en courbe A.

### A.5 Les courbes B et C, pour mémoire

- **B, élastique** (lignes 86 à 92) : `ressort(s, 0.55, 14)` pour la carte, `ressort(s, 0.78, 16)`
  pour le texte, retard de 2 images, sortie par renversement du temps sur 0,55 s (carte) et 0,45 s
  (texte). Dépassement 12,6 %, pic à 0,27 s.
- **C, souple** (lignes 93 à 98) : `outQuint` sur 1,15 s, sortie `inQuint` sur 0,80 s, retard de
  4 images, suivi de 9,9 px entre 0,85 et 1,75 s. En CSS : `cubic-bezier(0.22, 1, 0.36, 1)` et
  `cubic-bezier(0.64, 0, 0.78, 0)`, écart 1,13 % (calculé).

### A.6 Le ressort analytique et ses paramètres

La fonction (lignes 56 à 60), identique dans `carte-3d.html` (lignes 87 à 92) et
`degrade-maille.html` (lignes 113 à 118) :

```js
const ressort = (x, z, w) => {
  if (x <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x));
};
/* sortie par renversement du temps (ligne 64) */
const renverse = (f, d) => s => s <= 0 ? 0 : s >= d ? 1 : (f(d) - f(d - s)) / f(d);
```

| Où | Usage | ζ | ω (rad/s) | Dépassement | Pic | Posé à 2 % |
|---|---|---|---|---|---|---|
| `courbes-signature` ligne 88 | carte B | 0,55 | 14 | 12,6 % | 0,27 s | 0,42 s mesuré sur la courbe ; 0,52 s dans les notes (enveloppe) |
| `courbes-signature` ligne 89 | texte B | 0,78 | 16 | 2,0 % | 0,31 s | 0,23 s |
| `carte-3d` ligne 398 | position de la carte | 0,85 | 3,8 | 0,6 % | 1,57 s | 1,10 s |
| `carte-3d` ligne 399 | rotation de la carte | 0,60 | 3,4 | 9,5 % | 1,16 s | 1,75 s |
| `degrade-maille` ligne 131 | panneaux de verre | 0,62 | 11 | 8,4 % | 0,36 s | 0,54 s |

Dépassement, pic et pose sont calculés. Attention : `demo-interface.html` (ligne 159) et
`transition-rythme.html` (ligne 85) nomment aussi `ressort` une fonction qui n'en est pas un. C'est
un `easeOutBack` de constante 1,35 et 1,4, soit 6,6 % et 7,1 % de dépassement (calculé).

Le ressort B en CSS, sur une fenêtre de 0,85 s (écart 0,63 %, calculé) :

```css
linear(0, 0.0082 1.1%, 0.0324 2.3%, 0.0738 3.5%, 0.1327 4.9%, 0.2636 7.3%, 0.6847 14.3%, 0.8003 16.5%,
  0.8937 18.6%, 0.9704 20.7%, 1.0309 22.8%, 1.0759 25%, 1.1063 27.3%, 1.1252 30.5%, 1.1211 34.2%,
  1.0179 49.4%, 0.9872 58.4%, 0.9844 65%, 0.9997 84.3%, 1)
```

Les dépassements des `outBack(s)` utilisés dans les essais (calculé) : 1,3 donne 6,2 % ; 1,5 donne
8,0 % ; 1,6 donne 9,0 % ; 1,7 donne 10,0 % ; 2,0 donne 13,2 % ; 2,2 donne 15,4 %.

---

## B. Une fiche par essai favori

### B.0 Ce qui vaut pour les douze

**Le contrat commun.** Chaque essai pose `window.STAGE`, `window.DUREE`, `window.render(t)` et
`window.PRET`, puis charge `../lecteur.js`. `render(t)` est pur : il pose l'état exact de la page à
l'instant `t`, sans `requestAnimationFrame`, sans `Math.random`, sans état accumulé.

**Deux façons de porter un essai sur le site.** Je recommande de choisir au cas par cas :

1. **Traduire en CSS.** Pour les gestes simples (une carte qui entre, une ligne sous masque, une
   barre qui passe, des poses de papier), le geste devient une transition ou des images clés CSS
   avec les jetons de A.3, et le JavaScript ne fait que poser une classe à l'entrée dans l'écran.
   Aucun calcul par image, tout se joue sur le compositeur.
2. **Garder `render(t)`.** Pour ce qui se calcule (isométrie, morphing, particules, séquence des
   volets), on garde la fonction pure et on lui fournit `t` : soit une horloge lancée par
   `IntersectionObserver`, soit la progression du défilement. La boucle `requestAnimationFrame` ne
   tourne que pendant que le bloc est à l'écran et s'arrête à l'instant de tenue.

**L'instant de tenue.** Chaque essai se vide avant la fin pour fermer sa boucle. L'état final à
afficher sur le web n'est donc jamais `t = DUREE`. Le tableau donne, pour chaque essai, la fenêtre
où tout est posé et rien n'est encore sorti (calculé depuis les partitions) :

| Essai | Durée | Tout est posé à | Les sorties commencent à | Instant à figer |
|---|---|---|---|---|
| `demo-interface` | 8 s | 6,35 s | 7,5 s | 7,5 s (plan large revenu, opacité pleine) |
| `carte-3d` | 8 s | 6,00 s (fin de la frappe) | 6,00 s | 6,0 s exactement ; l'état final doit être composé, pas échantillonné |
| `isometrique` | 9 s | 7,95 s | 8,1 s | 8,0 s |
| `morph-formes` | 8 s | 6,5 s | 7,05 s | 6,8 s |
| `tableau-chiffres` | 9 s | 6,27 s | 7,6 s | 7,0 s |
| `particules-texte` | 8 s | 4,65 s | 5,4 s | 5,3 s |
| `courbes-signature` | 6 s | 2,65 s | 4,4 s | 4,0 s |
| `grille-suisse` | 8 s | 5,0 s | 6,3 s | 6,0 s |
| `collage` | 8 s | 5,25 s | 6,3 s | 6,0 s |
| `degrade-maille` | 8 s | 4,2 s | 6,6 s | 6,0 s |
| `vertical-teaser` | 8 s | par plan | volet suivant | fin de chaque plan |
| `transition-rythme` | 8 s | par plan | masque suivant | sans objet |

**Les outils de temps communs**, à réunir dans un seul module (`src/lib/motion/temps.ts` par
exemple). Les versions ci-dessous sont celles de la majorité des essais :

```ts
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);  // début, FIN
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const outExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
export const inCubic = (p: number) => p * p * p;
export const inQuart = (p: number) => p * p * p * p;
export const outQuart = (p: number) => 1 - Math.pow(1 - p, 4);
export const inOutQuart = (p: number) => (p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2);
export const inOutCubic = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const inOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
export const cine = (p: number) => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2); // quintique
export const bosse = (p: number) => (p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p));
export const outBack = (s: number) => (p: number) => 1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2;
```

---

### B.1 `demo-interface` : la caméra qui tient

**Ce que l'animation montre.** Une fausse application de 1 600 x 900 px (tri d'e-mails par un agent,
entreprise fictive « Atelier Martin ») posée en perspective. La caméra est une liste de clés
(`CAM`, lignes 166 à 177) : deux clés identiques font une tenue, deux clés différentes un glissé.

| Temps | Caméra | Ce qui se passe |
|---|---|---|
| 0 à 1,1 | plan large (cible 800 ; 450, zoom 1, inclinaison 8° et -9°) | l'application entre : opacité en 0,45 s, échelle 0,9 vers 1 en 0,8 s ; à 0,95 s la liste fait de la place (0,3 s, 84 px) ; à 1,1 s le courriel tombe (0,55 s) |
| 1,1 à 1,95 | glisse vers la boîte (600 ; 240, zoom 1,5, 3° et -3°) | la souris apparaît (1,2 à 1,5) |
| 1,95 à 3,5 | tient | la souris va sur le courriel (1,55 à 2,35), clic à 2,45 (onde de 0,6 s, ligne teintée) |
| 3,5 à 4,25 | glisse vers l'agent (1 300 ; 330, zoom 1,55) | l'agent passe en analyse à 3,65, la barre se remplit de 3,7 à 4,35 |
| 4,25 à 5,55 | tient | résultat à 4,4 (0,5 s), trois lignes décalées de 0,12 s, bouton à 4,85, clic à 5,2, bouton vert « Tâche créée » à 5,35 |
| 5,55 à 6,3 | glisse vers les tâches (800 ; 700, zoom 1,45) | la liste fait de la place à 5,3, la tâche arrive à 5,4, la coche se trace à 5,8, l'étiquette « Auto » saute à 6,0 |
| 6,3 à 6,85 | tient | |
| 6,85 à 7,6 | revient au plan large | fondu de sortie de 7,5 à 8,0 |

**Technique.** DOM et CSS seulement, aucune bibliothèque. `perspective: 2600px` sur la scène
(ligne 22), `translate`, `scale`, `rotateX` et `rotateY` sur `#app` avec `transform-origin` posé sur
la cible (lignes 236 à 238). Mise au point par `filter: blur() brightness()` sur chaque panneau
(ligne 243). Coche en `stroke-dashoffset` (ligne 289). Propriétés hors compositeur : `filter`
(ligne 243), `width` de la barre (ligne 264), `background` (lignes 253 et 278).

**Dépendances.** Google Fonts, `display=swap` (ligne 9) : Manrope 400 à 800 (un fichier variable,
24,8 Ko) et IBM Plex Mono 400 et 500 (14,7 et 14,9 Ko). Total 54 Ko. HTML de 21 Ko.

**Palette** (lignes 15 à 18 et 21). Fond `#15171c` avec un halo `#2b2f39`, encre `#171a20`,
interface `#ffffff` et `#f3f4f7`, filets `#e4e6ec`, texte sourd `#7a8090`, accent `#ff5533`, vert
`#1f9d68`. Pastilles : `#1e6d68`, `#4a5bd8`, `#b8742f`, `#8a8f9c`. Fonds d'étiquette `#fff0ec` et
`#e9f7f0`. Polices : Manrope, IBM Plex Mono.

**Fonctions réutilisables.**

```js
// lignes 198 à 205 : une piste de clés, interpolée avec la courbe e
function piste(cles, t, champ, e) {
  if (t <= cles[0].t) return cles[0][champ];
  for (let k = 0; k < cles.length - 1; k++) {
    const a = cles[k], b = cles[k + 1];
    if (t < b.t) { const f = e(c01((t - a.t) / (b.t - a.t))); return a[champ] + (b[champ] - a[champ]) * f; }
  }
  return cles[cles.length - 1][champ];
}
// lignes 206 à 214 : la netteté d'un panneau, 0 ou 1, interpolée avec la même courbe que la caméra
function nettete(pan, t) {
  const v = function (cible) { return (cible === 'tout' || cible === pan) ? 1 : 0; };
  if (t <= FOYER[0][0]) return v(FOYER[0][1]);
  for (let k = 0; k < FOYER.length - 1; k++) {
    const a = FOYER[k], b = FOYER[k + 1];
    if (t < b[0]) { const f = cine(c01((t - a[0]) / (b[0] - a[0]))); return v(a[1]) + (v(b[1]) - v(a[1])) * f; }
  }
  return v(FOYER[FOYER.length - 1][1]);
}
// ligne 162 : la pression d'un clic, 60 ms d'enfoncement puis 160 ms de relâchement
const pression = function (t, tc) { const u = t - tc; if (u < 0 || u > 0.22) return 0; return u < 0.06 ? u / 0.06 : 1 - (u - 0.06) / 0.16; };
// lignes 236 à 238 : la caméra, écrite en coordonnées de l'application
E.app.style.transformOrigin = tx + 'px ' + ty + 'px';
E.app.style.transform = 'translate(' + (800 - tx) + 'px,' + (450 - ty) + 'px) scale(' + s + ') rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
```

`piste(cles, t, champ, e)` rend la valeur d'un champ à l'instant t. `nettete(pan, t)` rend 1 si le
panneau est au point. `pression(t, tc)` rend 0 à 1 autour de l'instant du clic. Ici `seg` a une
autre signature que partout ailleurs : `seg(t, t0, duree, courbe)` (ligne 160).

**Verbatim de Paul.** « ça, j'adore ». Usage : « pour montrer l'académie et les différentes
sections, il faut absolument qu'on utilise ça ».

**Adaptation web recommandée.**

- **Déclenchement.** À l'entrée dans l'écran, lecture unique d'environ 7,5 s, puis arrêt sur le plan
  large. En complément, trois repères cliquables (un par tenue) qui envoient `t` au début de la
  tenue voulue : le visiteur sait où l'on va et reprend la main. Une variante pilotée par le
  défilement est possible dès `lg` : section collante, la progression fait avancer `t`, et les
  tenues deviennent des plages de défilement où rien ne bouge.
- **À garder.** La liste de clés avec tenues, la courbe quintique `cine` pour les glissés, la caméra
  qui se redresse en approchant (8° au large, 2 à 3° en gros plan), l'anticipation (la liste fait
  de la place avant que l'élément tombe), la pression du clic et son onde, la mise au point qui
  suit la courbe de la caméra.
- **À retirer ou remplacer.** Le flou animé : remplacer par un voile sombre par panneau, animé en
  `opacity` seule ; garder un flou fixe de 3 px au plus, dès `lg` seulement. La barre en `width`
  devient un `scaleX`. La respiration permanente de la caméra (ligne 233) et le fondu de sortie
  disparaissent.
- **Invariant à ne jamais casser.** Le flou ne touche que ce qui n'est pas en jeu. Le panneau lu et
  son titre restent nets : c'est ce qui sépare cet essai de `camera-profondeur`, refusé.
- **État final sans animation.** L'application à plat ou à peine inclinée, les trois panneaux nets,
  le courriel étiqueté « Trié · Devis », le résultat de l'agent affiché, le bouton vert, la
  nouvelle tâche cochée. Pas de curseur.
- **Sans JavaScript.** L'application est déjà du vrai HTML (lignes 92 à 143). Il suffit que le CSS
  par défaut soit l'état final, et que l'état de départ ne s'applique qu'une fois le script actif.
- **Coût.** Faible une fois le flou retiré : une seule transformation 3D sur un conteneur, plus une
  vingtaine d'opacités. `render(t)` pose une soixantaine de styles par image, acceptable pour une
  lecture de 8 s.
- **Risque à 390 px.** Élevé. Une scène de 1 600 px ramenée à 358 px donne une échelle de 0,22 : le
  texte de 18 px tombe à 4 px, et à 6 px au zoom 1,5. Sous `lg`, abandonner la caméra : les trois
  panneaux s'empilent en cartes de pleine largeur, et chacune joue sa propre action à son entrée
  dans l'écran.

**Convient pour.** La visite de l'Academy et de ses sections (le souhait de Paul ; `Visite.tsx`
refait déjà le tableau de bord en HTML), une automatisation n8n vue dans son interface
(déclencheur, agent, action), la visite du Hub ou d'un rapport, le suivi côté serveur montré comme
un écran de contrôle, le parcours d'un lead dans le CRM.

---

### B.2 `carte-3d` : la carte de verre

**Ce que l'animation montre.**

| Temps | Ce qui se passe |
|---|---|
| 0,2 | la carte part hors champ, en bas à droite (`P0`), très tournée (`R0`), et vient se poser à gauche du centre (`P1`) |
| 0,2 à 1,3 | la position se pose presque sans dépassement (ζ 0,85, ω 3,8) |
| 0,2 à 1,95 | la rotation dépasse de 9,5 % puis revient (ζ 0,60, ω 3,4) : le pivot continue après la pose, c'est l'inertie |
| 1,0 à 2,6 | un halo cuivré monte derrière la carte |
| 2,0 à 4,3 | une source ponctuelle traverse le champ et dessine un reflet qui glisse sur le verre |
| 2,2 à 3,0 | le flottement s'installe (période 3,6 s, amplitude très faible) |
| 2,3 à 3,95 | le texte monte de ses masques, à droite : surtitre à 2,30, trois lignes de titre à 2,45, 2,57 et 2,69, sous-titre à 3,05 |
| 2,6 à 6,0 | le prompt se tape dans l'écran de la carte, 136 caractères à 40 par seconde (calculé) |
| 6,0 à 6,8 | les lignes ressortent par le haut (0,5 s, décalage 0,08 s) |
| 6,2 à 7,5 | la carte repart vers le haut (`inExpo`), l'ombre s'efface |

**Technique.** Three.js r128 en script global (ligne 59). `WebGLRenderer` avec `antialias: true`,
`preserveDrawingBuffer: true`, `powerPreference: 'high-performance'` (lignes 116 à 119),
`setPixelRatio(1)` et taille fixe 1 920 x 1 080 (lignes 121 et 122), ACES (lignes 123 à 125). Dalle
en `ExtrudeGeometry` biseautée (lignes 182 à 186), `MeshPhysicalMaterial` à `transmission: 0.95` et
`clearcoat: 1` (lignes 188 à 191). Environnement cuit une fois en PMREM depuis quatre panneaux
dessinés en Canvas 2D (lignes 157 à 164). Écran de leçon dessiné en Canvas 2D de 1 024 x 645 et
passé en `CanvasTexture` (lignes 200 à 208 et 281 à 391). Ombre en sprite, halo additif, brouillard.
Le texte de droite est du DOM sous masque `overflow: hidden` (lignes 17 à 34).

**Dépendances.**

| Nom | Version | URL | Poids mesuré |
|---|---|---|---|
| three.js | r128 | `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` | 603 Ko bruts, 149 Ko en gzip |
| Fraunces (opsz, wght 500 et 600) | Google Fonts | `fonts.googleapis.com/css2` (ligne 9) | 67,3 Ko |
| Inter 400, 500, 600 | Google Fonts | idem | 48,3 Ko |
| JetBrains Mono 500 | Google Fonts | idem | 21,8 Ko |

Total des polices : 137 Ko. HTML de 18 Ko.

**Palette.** Scène : fond `#17110e`, sol `#1c1411`, mur `#1a1210`, corps de carte `#1f1714`, verre
`#dfe9e6`, lumières `#fff0dc`, `#e39a6a` et `#ffd9b4`. Texte : ivoire `#f7efe4`, surtitre cuivre
`#e39a6a`. Écran de la leçon : craie `#f7f5f0`, blanc, filets `#e8e3d8`, encre `#0f1a2e`, gris
`#6b685f`, `#8a8577`, `#3a3a38`, or `#C8A951`. Polices : Fraunces, Inter, JetBrains Mono.

**Fonctions réutilisables.**

```js
// lignes 94 à 99 : une ligne qui monte de son masque puis ressort par le haut
function poseLigne(node, t, tIn, dIn, tOut, dOut) {
  var e = outExpo(seg(t, tIn, tIn + dIn));
  var s = inQuart(seg(t, tOut, tOut + dOut));
  var y = (1 - e) * 130 - s * 130;
  node.style.transform = 'translate3d(0,' + y.toFixed(3) + '%,0)';
}
// lignes 260 à 269 : retour à la ligne d'un texte dessiné en canvas
function decouper(texte, maxW) {
  var mots = texte.split(' '), out = [], cur = '';
  for (var i = 0; i < mots.length; i++) {
    var essai = cur ? cur + ' ' + mots[i] : mots[i];
    if (ctx.measureText(essai).width > maxW && cur) { out.push(cur); cur = mots[i]; }
    else { cur = essai; }
  }
  if (cur) out.push(cur);
  return out;
}
// lignes 109 à 113 : le repli quand Three ou WebGL manque, le texte seul
function repli() {
  canvas.style.display = 'none';
  window.render = function (t) { poseTexte(Math.max(0, Math.min(D, +t || 0))); };
}
```

Autres : `ressort(x, zeta, omega)` (lignes 87 à 92), `texDegrade(w, h, stops, radial)` qui fabrique
une texture de dégradé sans image (lignes 135 à 148), `formeArrondie(w, h, r)` (lignes 168 à 181),
`dessinerEcran(nChars, curseur)` qui ne redessine que si sa clé change (lignes 281 à 284),
`poseCarte(t)` (lignes 396 à 415).

**Verbatim de Paul.** « vraiment une super animation ». Usage : une phrase à gauche et à droite de
l'écran qui apparaît pendant que la carte vit.

**Adaptation web recommandée.** Deux niveaux, le premier par défaut.

- **Niveau 1, en CSS 3D, sans WebGL.** La carte est un vrai élément HTML : son écran est du DOM,
  donc lisible, traduisible en anglais, accessible. Deux enveloppes imbriquées : l'extérieure porte
  la position, l'intérieure la rotation, chacune avec sa courbe `linear()` tirée de son ressort
  (A.6). Deux courbes différentes, c'est ce qui donne l'inertie du pivot. Le verre se fait avec un
  rayon, un liseré clair en `inset`, et un reflet en pseudo-élément qui traverse en `translateX`
  pour « la lumière qui glisse ». Coût presque nul, tient à 390 px.
- **Niveau 2, en Three.js, en amélioration progressive.** Sous la ligne de flottaison seulement,
  dans un îlot `client:visible` avec import dynamique, ratio de pixels plafonné, rendu à la
  demande (la boucle s'arrête quand la carte est posée et quand le bloc sort de l'écran),
  `preserveDrawingBuffer: false`. Une image fixe de la carte sert d'affiche en attendant.
- **Le souhait de Paul change la mise en page.** Dans l'essai, le texte n'est qu'à droite
  (`left: 1180px`, ligne 18). Sur le site : trois colonnes dès `lg` (phrase, carte, phrase), et un
  empilement sous `lg`.
- **À garder.** L'entrée à deux ressorts, le reflet qui passe avant que le texte ne monte, les
  lignes sous masque décalées de 0,12 s, le flottement très léger, le prompt qui se tape.
- **À retirer.** La sortie, le sol, le mur et le brouillard (le fond de la page suffit), la boucle.
- **État final sans animation.** La carte au repos (rotation de 2,9° sur x et -10,3° sur y, valeurs
  de `R1` converties), le prompt entier, les deux phrases visibles.
- **Le prompt tapé.** Le texte complet est dans le HTML. La frappe est un effet visuel par-dessus
  (masque ou un `span` par caractère), avec le texte réel exposé aux lecteurs d'écran.
- **Coût.** Niveau 1 : négligeable. Niveau 2 : 149 Ko de script compressé, un contexte WebGL, un
  matériau physique avec environnement, à réserver aux écrans larges.
- **Risque à 390 px.** Moyen. L'écran de la leçon, conçu pour 1 024 px, devient illisible à
  358 px : le simplifier sous `md` (le titre et le bloc de prompt seulement).

**Convient pour.** Un serveur MCP montré comme un objet (la « prise »), une leçon de l'Academy, la
carte d'une campagne Performance Max avec ses éléments, une proposition ou un devis, la fiche d'un
prompt écrit selon CRAFT.

---

### B.3 `isometrique` : l'usine isométrique

**Ce que l'animation montre.** Une automatisation en isométrie : un e-mail entre dans une usine,
l'agent trie, trois tâches sortent et se rangent sur un tableau. Rythme à 120 BPM.

| Temps | Ce qui se passe |
|---|---|
| 0 à 0,8 | la plaque monte du bas (`outExpo`), sa grille fine apparaît |
| 0,45 à 1,3 | première ligne du titre : « Un e-mail entre, » |
| 0,5 à 1,9 | les blocs montent en cascade tous les 0,25 s (0,45 s chacun, `outBack(1.3)`) : tapis A, usine, tapis B, tableau, puis l'agent sur le toit |
| 0,7 à 2,0 | quatre étiquettes couchées au sol |
| 1,75 à 2,62 | l'enveloppe surgit, tombe sur le tapis (0,35 s) et rebondit (0,32 s) |
| 2,3 à 4,09 | le tapis la porte à 2,4 unités par seconde ; elle entre dans la fente de 3,55 à 4,09 (calculé) |
| 3,7 à 4,9 | une barre de lumière balaie la façade, la tête de l'agent fait un tour, trois pistons pompent |
| 4,75, 5,25, 5,75 | trois tâches sortent sur le tapis B, sur les temps |
| 4,75 à 5,6 | seconde ligne du titre : « des tâches sortent. » |
| 6,08, 6,58, 7,08 | chaque tâche saute en arc (0,42 s), se dresse, passe à l'or (0,25 s), reçoit sa coche ; la dernière est finie à 7,95 (calculé) |
| 8,1 à 9,0 | étiquettes et titres sortent, la scène s'enfonce |

**Technique.** Toute la géométrie est calculée en JavaScript et écrite en SVG. La chaîne SVG
entière est reconstruite et injectée par `innerHTML` à chaque image (ligne 334), `<defs>` compris.
Projection (ligne 85), solides à huit sommets (lignes 101 à 110), faces visibles et éclairées
(lignes 113 à 122), ombres portées par enveloppe convexe (lignes 124 à 146), groupes d'ombres
découpés par `clipPath` (lignes 148 à 152). Deux `filter: drop-shadow` (lignes 303 et 321). Les
étiquettes sont des `span` du DOM couchés au sol par une `matrix()` CSS (ligne 340). Aucune
bibliothèque.

**Dépendances.** Google Fonts, `display=block` (ligne 9) : Bricolage Grotesque variable (axes opsz,
wdth, wght), 131,5 Ko ; JetBrains Mono 500, 21,8 Ko. Total 153 Ko. HTML de 21 Ko.

**Palette** (lignes 15 et 73 à 74). Fond `#0a1626`, plaque `#1a2f4f`, blocs `#3b5f99`, tapis
`#101d32`, rails `#263e66`, flux `#7fc4dd`, résultat or `#c8a951`, ivoire `#f4f1ea`, ombres
`#03091a` à 50 %, fente `#060d1a`. Polices : Bricolage Grotesque, JetBrains Mono.

**Fonctions réutilisables.** Une petite bibliothèque d'isométrie sans dépendance.

```js
var U = 72, OX = 960, OY = 580, C = Math.cos(Math.PI / 6), S = 0.5;            // ligne 56
var L = (function () { var v = [-0.6, 0.2, 0.75], n = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return [v[0] / n, v[1] / n, v[2] / n]; })();                                   // ligne 79
function lum(n) { var d = n[0]*L[0] + n[1]*L[1] + n[2]*L[2];
  return 0.46 + 0.54 * Math.pow(clamp((d + 0.2) / 0.965, 0, 1), 0.8); }          // ligne 80
function proj(p) { return [OX + (p[0] - p[1]) * C * U, OY + (p[0] + p[1]) * S * U - (p[2] + DZ) * U]; } // ligne 85
function tourner(p, rx, rz) {                                                    // lignes 96 à 100
  var cr = Math.cos(rx), sr = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
  var y1 = p[1] * cr - p[2] * sr, z1 = p[1] * sr + p[2] * cr;
  return [p[0] * cz - y1 * sz, p[0] * sz + y1 * cz, z1];
}
function solide(c, d, rx, rz) {                                                  // lignes 101 à 110
  rx = rx || 0; rz = rz || 0;
  var V = [], N = [], i;
  for (i = 0; i < 8; i++) {
    var q = tourner([(i & 1 ? d[0] : -d[0]) / 2, (i & 2 ? d[1] : -d[1]) / 2, (i & 4 ? d[2] : -d[2]) / 2], rx, rz);
    V.push([c[0] + q[0], c[1] + q[1], c[2] + q[2]]);
  }
  for (i = 0; i < 6; i++) N.push(tourner(NORM[i], rx, rz));
  return { V: V, N: N, c: c, rx: rx, rz: rz };
}
function visible(n) { return n[0] + n[1] + n[2] > 1e-6; }                        // ligne 113
function coque(P) {                                                              // lignes 124 à 132
  P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
  var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
  var bas = [], haut = [], i;
  for (i = 0; i < P.length; i++) { while (bas.length >= 2 && cr(bas[bas.length - 2], bas[bas.length - 1], P[i]) <= 0) bas.pop(); bas.push(P[i]); }
  for (i = P.length - 1; i >= 0; i--) { while (haut.length >= 2 && cr(haut[haut.length - 2], haut[haut.length - 1], P[i]) <= 0) haut.pop(); haut.push(P[i]); }
  bas.pop(); haut.pop();
  return bas.concat(haut);
}
```

| Fonction | Signature | Rôle |
|---|---|---|
| `proj` | `(p: [x, y, z]) => [sx, sy]` | projection isométrique vraie |
| `solide` | `(centre, dimensions, rx?, rz?) => { V, N, c, rx, rz }` | une boîte, ses 8 sommets et ses 6 normales |
| `faces` | `(sol, couleur, attrs?) => string` | les polygones SVG des faces visibles, éclairés (lignes 115 à 122) |
| `lum` | `(normale) => number` | 1 sur le dessus, 0,73 à gauche, 0,46 à droite |
| `ombre` | `(V, plan, val) => string` | ombre portée nette sur le sol ou sur une paroi (lignes 135 à 146) |
| `groupeOmbres` | `(polys, clipP, id) => string` | une seule opacité pour le groupe, découpé au plan qui reçoit (lignes 148 à 152) |
| `coque` | `(points) => points` | enveloppe convexe, chaîne monotone |
| `local` | `(sol, p) => [x, y, z]` | un point du repère du solide vers la scène (ligne 111) |

Les valeurs de `FACES` et `NORM` sont aux lignes 94 et 95. L'ordre des couches est une liste écrite
à la main, de l'arrière vers l'avant, jamais un tri (`NOTES-styles.md`).

**Verbatim de Paul.** « J'adore ». Usage : « ce genre d'animation, quand on veut illustrer quelque
chose en particulier ».

**Adaptation web recommandée.**

- **Déclenchement.** À l'entrée dans l'écran, piloté par le temps et non par le défilement : ce que
  Paul aime est la cadence mécanique, et un défilement irrégulier la casserait. Lecture unique de
  8 s, arrêt sur l'état final.
- **Le rendu côté serveur est possible.** `render` fabrique une chaîne. Les fonctions sont pures et
  tournent dans Node (les notes le confirment : vérification dans un DOM factice). Un composant
  Astro peut donc produire au build le SVG de l'état final, lisible sans JavaScript. À l'entrée
  dans l'écran, le même code reprend la main côté client pour la séquence.
- **`innerHTML` par image : à mesurer avant de décider.** Reconstruire et analyser tout le SVG
  60 fois par seconde coûte en analyse, en mise en page et en peinture. Deux sorties : dessiner
  les mêmes polygones dans un Canvas 2D (une seule couche, le SVG statique restant dessous pour le
  sans JavaScript), ou garder des éléments SVG persistants dont on ne change que l'attribut
  `points`. Le Canvas 2D est le choix le plus sûr sur mobile.
- **À garder.** La cascade des blocs, la chute et le rebond de l'enveloppe, la découpe dans
  l'espace qui fait entrer l'objet, le saut en arc des tâches, le passage à l'or, les ombres
  nettes.
- **À retirer.** La scène qui s'enfonce à la fin, les bandes du tapis et la tête qui tournent sans
  fin une fois la séquence jouée, les deux `drop-shadow` (ou les garder fixes), les identifiants
  globaux de `clipPath` (`sol`, `paroi`, `tapisA`, `tapisB`, `toit`), à suffixer par instance.
- **État final sans animation.** Tous les blocs montés, les trois tâches en or avec leur coche sur
  le tableau, les deux lignes du titre, les étiquettes visibles.
- **Coût.** Moyen. La géométrie est légère (une centaine de polygones), le coût vient du mode
  d'écriture dans la page.
- **Risque à 390 px.** Élevé. La scène occupe 1 252 x 838 px (`NOTES-styles.md`). Ramenée à 358 px,
  l'échelle est de 0,29 : les étiquettes de 19 px tombent à 5 px. Sous `md`, sortir les étiquettes
  du dessin et les écrire en HTML sous la scène, et poser le titre au-dessus. La scène elle-même
  reste lisible, ses formes sont grosses.

**Convient pour.** Une automatisation n8n (déclencheur, agent, tâches), le suivi de conversions
côté serveur (le site, le serveur de balises, puis Meta, GA4 et Google Ads), le routage d'un lead
depuis un formulaire Meta jusqu'au CRM d'un concessionnaire, un pipeline de données vers un
tableau de bord, le tunnel d'un concessionnaire automobile.

---

### B.4 `morph-formes` : morphing de formes

**Ce que l'animation montre.** Une seule forme voyage sur un rail à trois stations et change
d'état : bulle (Prompt), engrenage (Automatisation), coche (Résultat).

| Temps | Ce qui se passe |
|---|---|
| 0,15 à 0,8 | le nœud (disque de rayon 215 px et sa forme) apparaît à la première station |
| 0,2 à 1,05 | le rail se trace depuis la gauche ; de 0,85 à 1,65 les trois marques apparaissent |
| 0,5 à 1,25 | le titre monte ; l'étiquette « Prompt » à 0,95 |
| 1,6 à 2,9 | voyage vers la deuxième station (`inOutQuart`, 1,3 s pour 560 px), étirement selon la vitesse |
| 1,7 à 3,0 | la bulle devient engrenage (`inOutCubic`), le disque passe du bleu à l'orange |
| 2,9 à 3,6 | rebond à l'arrivée (amplitude 0,13) ; étiquette « Automatisation » à 3,15 |
| 4,25 à 5,55 | voyage vers la troisième station ; de 4,35 à 5,65 l'engrenage devient coche, le disque passe au vert |
| 5,55 à 6,25 | rebond ; étiquette « Résultat » à 5,75 ; la coche gonfle de 11 % de 5,9 à 6,5 |
| 1,6 à 5,75 | la forme fait un tour complet et retombe droite |
| 7,05 à 8,0 | sorties, le fond revient à sa couleur de départ |

**Technique.** SVG en ligne. L'attribut `d` du tracé est réécrit à chaque image avec 360 points
(lignes 159 à 170 et 231). Transformations par attribut `transform` SVG. Ombre au sol par un filtre
`feGaussianBlur` de 22 (ligne 26). La couleur de fond de toute la scène est animée (ligne 204).
Aucune bibliothèque.

**Dépendances.** Google Fonts, `display=block` : Bricolage Grotesque variable, 131,5 Ko. HTML de
14 Ko.

**Palette** (lignes 12 et 68 à 69). Encre `#161a22`, crème `#fbf8f1`. Fonds : `#e8ecf3`, `#f5efe3`,
`#e6f1ea`. Disque : bleu `#2b4be3`, orange `#ef6a2c`, vert `#1c9c66`. Police : Bricolage Grotesque.

**Fonctions réutilisables.** La bibliothèque de morphing, sans dépendance.

```js
// lignes 104 à 108 : même sens de parcours pour tous les contours
function orienter(pts) {
  var s = 0;
  for (var i = 0; i < pts.length; i++) { var q = pts[(i + 1) % pts.length]; s += pts[i].x * q.y - q.x * pts[i].y; }
  return s < 0 ? pts.slice().reverse() : pts;
}
// lignes 110 à 121 : N points à égale distance le long du contour fermé
function reechantillonner(pts, n) {
  var L = [0], tot = 0;
  for (var i = 0; i < pts.length; i++) { tot += dist(pts[i], pts[(i + 1) % pts.length]); L.push(tot); }
  var out = [], j = 0;
  for (var k = 0; k < n; k++) {
    var s = tot * k / n;
    while (j < pts.length - 1 && L[j + 1] < s) j++;
    var a = pts[j], b = pts[(j + 1) % pts.length], u = (s - L[j]) / ((L[j + 1] - L[j]) || 1);
    out.push(pt(mix(a.x, b.x, u), mix(a.y, b.y, u)));
  }
  return out;
}
// lignes 123 à 131 : le point de départ de B tombe en face de celui de A (moindres carrés)
function aligner(A, B) {
  var best = 0, bestD = Infinity;
  for (var k = 0; k < N; k++) {
    var d = 0;
    for (var i = 0; i < N; i += 3) { var b = B[(i + k) % N]; d += (A[i].x - b.x) * (A[i].x - b.x) + (A[i].y - b.y) * (A[i].y - b.y); }
    if (d < bestD) { bestD = d; best = k; }
  }
  return B.map(function (_, i) { return B[(i + best) % N]; });
}
// lignes 159 à 170 : interpolation point à point, avec une ondulation qui n'existe qu'au milieu
function melange(A, B, p, amp) {
  var w = Math.sin(p * Math.PI), s = '';
  for (var i = 0; i < N; i++) {
    var x = mix(A[i].x, B[i].x, p), y = mix(A[i].y, B[i].y, p);
    if (amp > 0 && w > 0) {
      var ang = Math.atan2(y, x), r = Math.hypot(x, y) + amp * w * Math.sin(ang * 3 + p * 6.2832);
      x = r * Math.cos(ang); y = r * Math.sin(ang);
    }
    s += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return s + 'Z';
}
// ligne 63 : rebond amorti, nul aux deux bouts
var rebond = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI * 3) * Math.pow(1 - p, 2); };
// lignes 219 à 223 : étirement selon la vitesse, à volume constant
var v = (positionX(t + 0.016) - positionX(t - 0.016)) / 0.032;
var etire = Math.min(0.32, Math.abs(v) / 5500);
var sx = base * (1 + etire - reb), sy = base * (1 / (1 + etire) + reb);
```

Aussi : `arrondir(pts, rayons, n)` qui pose un congé par sommet (lignes 82 à 102), `contour(pts,
rayons)` qui enchaîne les trois étapes (ligne 132), et les trois générateurs `bulle()`,
`engrenage(dents, rIn, rOut)`, `coche()` (lignes 134 à 155). Un trou ne se morphe pas : celui de
l'engrenage est un disque à part (ligne 237).

**Verbatim de Paul.** « top ». Usage : montrer des process, une évolution.

**Adaptation web recommandée.**

- **Déclenchement.** C'est le meilleur candidat au pilotage par le défilement : la progression va
  de 1,6 à 5,65 s, et le visiteur fait avancer l'objet lui-même. Version simple : lecture au temps
  à l'entrée dans l'écran (6,5 s), avec les trois étiquettes cliquables qui envoient `t` sur la
  tenue de leur station.
- **À garder.** Un seul objet qui change d'état, l'étirement selon la vitesse, le rebond à
  l'arrivée, le trou de l'engrenage traité à part, le rail qui se trace.
- **À retirer ou remplacer.** La couleur de fond de toute la section (elle repeint la section
  entière à chaque image et déborderait sur la page) : ne teinter que le disque. L'ombre en filtre
  SVG devient une ellipse en dégradé radial, animée en `transform`. Les étiquettes en `outBack`
  passent en courbe A. La sortie disparaît.
- **Les contours se calculent une fois.** Au build, ou au premier affichage : `aligner` fait deux
  fois 43 200 calculs de distance, c'est instantané.
- **État final et sans JavaScript.** Le rail, les trois stations et leurs trois étiquettes toujours
  visibles, avec une petite icône fixe à chaque station, et le grand disque vert à la coche sur la
  dernière. Les étiquettes ne sont jamais masquées : leur accent seul s'anime.
- **Coût.** Faible à moyen : une chaîne de 360 points réécrite par image, sur une zone de 430 px.
  Descendre à 180 points sur mobile si nécessaire.
- **Risque à 390 px.** Moyen. Le rail horizontal de 1 120 px ne tient pas : sous `md`, le rail
  devient une colonne, l'objet descend, les étiquettes se posent à droite de chaque station.
  `NOTES-typo.md` prévoit cette variante verticale.

**Convient pour.** Tout process en trois états : un audit SEO (exploration, diagnostic,
corrections), l'Account-Based Marketing (compte ciblé, engagement, opportunité), une campagne
Performance Max (signaux, enchères, conversion), le tunnel d'un concessionnaire (recherche, essai,
vente). Pour CRAFT il faudrait cinq stations.

---

### B.5 `tableau-chiffres` : le tableau à palettes

**Ce que l'animation montre.** Trois lignes, chacune avec deux gros volets (le chiffre et son
unité) et vingt-deux petits (le texte), soit 72 cellules (calculé).

| Temps | Ce qui se passe |
|---|---|
| 0,25 à 0,9 | la légende monte : « Une semaine type, après la formation » |
| 0,5 | ligne 1, « 3h gagnées par semaine », entièrement posée à 2,13 (calculé) |
| 2,5 | ligne 2, « 12 tâches automatisées », posée à 4,18 |
| 4,5 | ligne 3, « 7j pour un premier agent », posée à 6,27 |
| 6,27 à 7,6 | tenue |
| 7,6 | vague de retour à vide, puis sortie de la légende de 8,25 à 8,65 |

Le rythme tient en trois couches (`T`, lignes 77 et 78) : 0,085 s par bascule (0,11 s pour les
gros volets), 0,045 s de décalage par colonne, et une gigue de 0 à 0,03 s par volet tirée d'un
hachage de sa position.

**Technique.** DOM et CSS 3D, aucune bibliothèque. Chaque cellule porte sa `perspective: 1100px`
(ligne 19). Deux moitiés fixes et un volet qui tourne en `rotateX`, avec `preserve-3d` et
`backface-visibility: hidden` (lignes 32 à 34). Trois ombres animées en `opacity`. Le caractère
change par `textContent` quand il le faut (lignes 145 et 146). Seules `transform` et `opacity` sont
animées.

**Dépendances.** Google Fonts, `display=block` : Barlow Semi Condensed 500, 600 et 700, trois
fichiers statiques de 22,4, 23,0 et 23,2 Ko. Total 69 Ko. HTML de 9 Ko, le plus léger des douze.

**Palette** (ligne 12). Vert `#0f3b30` (fond), ivoire `#f3ede0` (volets), encre `#151412`, corail
`#ff6a4d` (volet de l'unité). Police : Barlow Semi Condensed.

**Fonctions réutilisables.**

```js
var chute = function (p) { return Math.pow(p, 1.75); };                         // ligne 63
function suiteEntree(cible, alpha, k) {                                          // lignes 81 à 86
  var idx = alpha.indexOf(cible); if (idx < 0) idx = 0;
  var s = [' '];
  for (var i = Math.max(1, idx - k + 1); i <= idx; i++) s.push(alpha[i]);
  return s;
}
function gigue(ligne, col) { return (((col * 7919 + ligne * 104729 + 17) % 97) / 97) * 0.03; } // ligne 93
function etat(c, t) {                                                            // lignes 135 à 143
  var suite, k;
  if (t >= c.tx) { suite = c.seqX; k = (t - c.tx) / c.duree; }
  else if (t >= c.t0) { suite = c.seqE; k = (t - c.t0) / c.duree; }
  else return { cur: ' ', nxt: ' ', p: 0 };
  var i = Math.floor(k);
  if (i >= suite.length - 1) return { cur: suite[suite.length - 1], nxt: suite[suite.length - 1], p: 0 };
  return { cur: suite[i], nxt: suite[i + 1], p: k - i };
}
function poser(c, e) {                                                           // lignes 144 à 152
  if (c.cur !== e.cur) { c.basFixe.textContent = e.cur; c.avant.textContent = e.cur; c.cur = e.cur; }
  if (c.nxt !== e.nxt) { c.hautFixe.textContent = e.nxt; c.arriere.textContent = e.nxt; c.nxt = e.nxt; }
  var r = chute(e.p);
  c.volet.style.transform = 'rotateX(' + (-180 * r).toFixed(2) + 'deg)';
  c.ombreAvant.style.opacity = (0.55 * r).toFixed(3);
  c.ombreArriere.style.opacity = (0.55 * (1 - r)).toFixed(3);
  c.ombreBas.style.opacity = (0.35 * Math.sin(r * Math.PI)).toFixed(3);
}
```

`suiteEntree` donne les caractères qu'un volet traverse (au plus `k` bascules). `etat` ne touche
pas au DOM, ce qui permet de tester le rythme hors navigateur. `suiteSortie` est aux lignes 87
à 91.

**Verbatim de Paul.** « vraiment bien ». Usage : mettre en avant un point précis, idéal pour trois
éléments.

**Adaptation web recommandée.**

- **Déclenchement.** À l'entrée dans l'écran, au temps. Resserrer l'écart entre les lignes : 2 s
  dans l'essai, 0,6 à 0,8 s sur le site, pour que les trois lignes soient posées en moins de 3,5 s.
- **À garder.** La chute en `p^1,75` sans rebond, les trois couches de rythme, la gigue
  déterministe, le volet corail de l'unité.
- **À retirer.** La vague de retour à vide, la légende en `outBack`.
- **État final et sans JavaScript.** Les trois lignes affichées. Le HTML servi porte déjà les
  caractères finaux dans chaque cellule ; le script ne vide les volets que si le bloc est encore
  sous l'écran.
- **Accessibilité.** Soixante-douze cellules d'une lettre sont illisibles pour un lecteur d'écran :
  la phrase entière va dans un élément lu, les cellules passent en `aria-hidden`.
- **Coût.** Faible. Environ 860 nœuds et jusqu'à 72 volets promus en couche au pic. À surveiller
  sur un téléphone d'entrée de gamme.
- **Risque à 390 px.** Élevé pour le tableau complet : 22 volets de texte sur 358 px font 16 px par
  volet. Sous `md`, ne garder en volets que le chiffre et son unité (deux ou trois cellules par
  ligne) et écrire la phrase en texte normal à côté, révélée en courbe A.
- **Les chiffres de l'essai sont fictifs** (« 3h », « 12 », « 7j », lignes 66 à 70). Sur le site,
  seuls des chiffres réels et sourcés peuvent prendre cette place.

**Convient pour.** Trois chiffres d'une étude de cas, trois résultats d'un audit SEO, un avant et
un après, les trois prix de départ d'une offre.

---

### B.6 `particules-texte` : particules en lettres

**Ce que l'animation montre.**

| Temps | Ce qui se passe |
|---|---|
| 0 à 0,9 | les particules tournent en tourbillon elliptique (rayon 150 à 790 px, 1 ou 2 tours par boucle) |
| 0,9 à 3,5 | assemblage : chaque particule part entre 0,9 et 2,4 s selon sa graine et met 1,1 s à rejoindre sa place dans « AI Academy » |
| 3,3 à 5,1 | une lumière balaie les lettres de gauche à droite |
| 3,75 à 4,65 | la légende monte : « La formation IA de MyDigipal » |
| 5,4 à 7,8 | dispersion en balayage de gauche à droite ; la légende sort de 5,55 à 6,05 |

**Technique.** WebGL 1 écrit à la main, aucune bibliothèque. Un seul tampon de points
(`gl.POINTS`), chaque position calculée dans le vertex shader à partir de `t` seul (lignes 106
à 155). Deux passes additives, un halo large puis un cœur net (lignes 270 à 288). Le fond est un
second shader sur un triangle plein écran. Les cibles viennent du texte dessiné dans un Canvas 2D
hors écran de 1 920 x 1 080, lu par `getImageData` et échantillonné sur une grille de pas 2,3 px
(lignes 218 à 247). Contexte créé avec `preserveDrawingBuffer: true`, `antialias: false`,
`powerPreference: 'high-performance'` (lignes 72 à 75).

Nombre de particules : non trouvé dans le code, il dépend du rendu de la police. La fiche dit
« quelques dizaines de milliers ». Mon estimation, d'après le pas de grille et la surface du mot :
15 000 à 25 000.

**Dépendances.** Google Fonts, `display=swap` : Sora 500 et 800, un fichier variable de 25,3 Ko.
HTML de 12 Ko.

**Palette.** Fond en dégradé radial `#0b1c18`, `#06120f`, `#030908` (ligne 14). Particules : menthe
`#80f5c7`, citron `#ccff7a`, blanc du cœur `#fffcf0` (valeurs du shader converties, lignes 168
à 170). Légende `rgba(190, 255, 225, .85)`. Police : Sora.

**Fonctions réutilisables.**

```js
// lignes 56 à 63 : générateur à graine fixe
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// lignes 214 et 215 : la taille maximale d'un point dépend du pilote, le halo s'y plie
var plage = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
var haloK = Math.min(3.4, plage[1] / 7.6);
```

Le cœur du vertex shader (lignes 120 à 142) : `position = mix(libre(t), cible, e) + perp * bombe`,
où `e = w1 * (1 - w2)` est le poids d'assemblage et `bombe = sin(PI * e)` courbe la trajectoire.
Aussi : `init()` qui transforme le texte en nuage de cibles (lignes 218 à 247), `programme(vs, fs,
attribs)` (lignes 186 à 194), `repli()` (lignes 76 à 79).

**Verbatim de Paul.** « vraiment cool ». Usage : un fond qui fait apparaître un logo ou un élément.

**Adaptation web recommandée.**

- **Déclenchement.** À l'entrée dans l'écran, au temps, lecture unique de 5 s environ. La boucle
  s'arrête une fois le mot assemblé et balayé.
- **Pour un logo.** Dessiner le SVG ou le PNG du logo dans le canvas hors écran à la place du
  texte. L'image doit venir du même domaine, sinon `getImageData` est refusé.
- **À garder.** L'assemblage échelonné par graine, les trajectoires courbes, la lumière qui balaie,
  les deux passes.
- **À retirer.** La dispersion et le tourbillon permanent : sur le web, le logo reste.
- **État final, sans JavaScript, mouvement réduit.** Le vrai logo, ou le vrai mot, est dans le DOM
  sous le canvas. Le canvas est un décor en `aria-hidden`. En fin d'assemblage, le logo net peut
  monter en fondu par-dessus les particules, ce qui donne un état final propre.
- **Tout est codé pour 1 920 x 1 080.** `u_res` (ligne 281), le centre `vec2(960.0, 540.0)`
  (ligne 127), la normalisation `(a_cible.x - 200.0) / 1520.0` (ligne 132), les bornes de la grille
  (lignes 235 et 236). Il faut passer ces valeurs en uniformes et recalculer les cibles à la taille
  réelle du canvas.
- **Coût.** Moyen. Un seul appel de dessin par passe, mais le halo additif recouvre beaucoup de
  pixels. Plafonner le ratio de pixels à 1,5, réduire à 6 000 à 8 000 particules sur mobile.
- **Emplacement.** Sous la ligne de flottaison, chargé à l'approche.
- **Risque à 390 px.** Moyen. « AI Academy » sur 358 px donne des lettres de 50 px de haut : le mot
  reste lisible, mais la densité doit baisser. Un logo compact passe mieux qu'un mot long.

**Convient pour.** Le fond d'une section qui révèle le logo de MyDigipal ou celui d'un client en
tête d'étude de cas, et l'idée « des données éparses deviennent une lecture » sur les pages de
suivi et de reporting.

---

### B.7 `courbes-signature` : les trois courbes

**Ce que l'animation montre.** Le même geste joué trois fois côte à côte, dans trois colonnes de
640 px : carte à 0,40 s, ligne de texte à 1,25 s, souligné à 2,10 s, tenue, sorties à 4,40, 4,50
et 4,55 s. Sous chaque colonne, le tracé de sa courbe.

**Technique.** DOM, `transform` et `opacity` seulement. Un tracé SVG statique par colonne
(`glyphe`, lignes 113 à 131). Aucune bibliothèque.

**Dépendances.** Google Fonts, `display=block` : Schibsted Grotesk variable 400 à 900 (46,8 Ko),
JetBrains Mono 400 et 500 (31,4 Ko). Total 78 Ko. HTML de 12 Ko.

**Palette** (ligne 13). Galet `#e6e3dc`, trait `#cfcbc2`, graphite `#1e2024`, ivoire `#f4f2ec`,
terre cuite `#d9663a`, sourd `#7a7e86`, brume `#a2a6ad`. Polices : Schibsted Grotesk, JetBrains
Mono.

**Fonctions réutilisables.** Celles de la section A, plus la règle du retard par différence de
positions (lignes 175 à 177) :

```js
const yC = s => COURSE * (1 - P.entree(s)) - COURSE * P.suivi(s);
const sr = s - P.retard, sxr = sx - P.retard, er = P.entree(sr), qr = P.sortie(sxr);
const yi = (yC(sr) - FUITE * qr) - (yC(s) - FUITE * q);   // position relative de l'intérieur
```

`glyphe(P)` dessine la courbe d'entrée sur 1,6 fois sa durée : c'est l'icône de la personnalité.

**Verbatim de Paul.** « j'adore surtout la A ». La courbe nette (expo) est la courbe signature
MyDigipal.

**Adaptation web recommandée.** Cet essai est un banc de comparaison, il ne se publie pas tel quel.
Il sert de socle : tous les autres composants reprennent sa courbe, et le geste de la colonne A
devient l'apparition standard du site.

- **Traduction en CSS.** Une classe posée par `IntersectionObserver`, quatre transitions décalées
  de 33 ms : le conteneur, son contenu, le petit détail, l'ombre.
- **Course.** 220 px conviennent à un objet de 300 px dans une vidéo. Pour une apparition courante
  sur le site, je recommande 24 à 48 px, avec la même courbe et la même durée. C'est une
  recommandation, pas une donnée des fichiers.
- **Opacité.** Dans l'essai, elle est pleine en 34 ms. Un fondu long sur une courbe expo ne se voit
  pas : garder l'opacité courte (40 à 80 ms) et laisser le déplacement faire le geste.
- **État final.** Tout est en place.
- **Coût.** Nul. **Risque à 390 px.** Aucun.
- **État du site aujourd'hui.** `src/styles/global.css` pose `--ease-smooth: cubic-bezier(0.4, 0,
  0.2, 1)` (ligne 69) et s'en sert sur 0,6 s pour l'apparition (lignes 478 et 479).
  `src/styles/academy.css` utilise cinq autres courbes. La courbe A n'est nulle part.

**Convient pour.** Toutes les apparitions du site : cartes, titres sous masque, soulignés.

---

### B.8 `grille-suisse` : la grille suisse

**Ce que l'animation montre.** Une grille de douze colonnes et six rangs qui se déploie, puis
organise les cinq mots de la méthode CRAFT.

| Temps | Ce qui se passe |
|---|---|
| 0 à 1,0 | la grille se déploie colonne par colonne (`scaleY` depuis le haut, `outExpo` 0,5 s, décalage 0,045 s) |
| 0,9 à 1,6 | la légende « La méthode CRAFT », la marque, puis les lettres `[C][R][A][F][T]` |
| 1,25 à 1,95 | le bloc or glisse depuis la droite le long de la grille |
| 1,5 | « Contexte. », révélé par une barre d'encre qui passe (0,32 s pour couvrir, 0,32 s pour découvrir) |
| 2,0 | « Rôle. », dans le bloc or |
| 2,5 | « Action. » |
| 3,0 | « Format. » et le grand « 5 » en or (barre verticale) |
| 3,25 à 3,95 | la barre d'encre du dernier rang glisse depuis la gauche |
| 4,0 | « Ton. », en craie sur l'encre ; la grille s'estompe à 42 % de 4,0 à 5,0 |
| 4,25 à 4,95 | la phrase « Cinq mots. Une réponse qui tient. », puis la cellule renarde |
| 6,3 à 7,95 | sorties (0,25 s par phase), blocs, puis grille |

Chaque lettre s'allume en or avec son mot (0,25 s) et gonfle de 16 % sur 0,3 s.

**Technique.** Cellules du DOM en position absolue, construites en JavaScript. Grille en SVG
(douze groupes de `rect`, échelle par attribut `transform`). Barres en `scaleX` et `scaleY`, blocs
en `translateX` et `translateY`. Couleur des lettres interpolée par `style.color` (ligne 174).
Taille de chaque mot mesurée une fois par `offsetWidth` à 100 px puis règle de trois (lignes 120
à 131). Aucune bibliothèque.

**Dépendances.** Google Fonts, `display=block` : Archivo variable (axes wdth et wght), 90,1 Ko ;
JetBrains Mono 500, 21,8 Ko. Total 112 Ko. HTML de 11 Ko.

**Palette** (lignes 15, 66 et 97). Craie `#f7f5f0`, encre `#0f1a2e`, or `#c8a951`, renard
`#d9542b`, cellules de grille `rgba(15, 26, 46, .055)`. Polices : Archivo, JetBrains Mono.

**Fonctions réutilisables.**

```js
var M = 96, GUT = 24, CW = 122, RH = 128, PX = CW + GUT, PY = RH + GUT;          // ligne 50
function cx(i) { return M + i * PX; }      // abscisse de la colonne i
function cy(j) { return M + j * PY; }      // ordonnée du rang j
function lw(n) { return n * PX - GUT; }    // largeur de n colonnes
function lh(n) { return n * PY - GUT; }    // hauteur de n rangs
// lignes 135 à 150 : la barre qui passe, en deux phases à l'entrée comme à la sortie
function mot(w, t, t0, tx, vertical) {
  var dIn = 0.32, dOut = 0.25;
  var p1 = inOutQuart(seg(t, t0, t0 + dIn)), p2 = inOutQuart(seg(t, t0 + dIn, t0 + 2 * dIn));
  var q1 = inOutQuart(seg(t, tx, tx + dOut)), q2 = inOutQuart(seg(t, tx + dOut, tx + 2 * dOut));
  var debut, k;
  if (t < tx) { if (p2 > 0) { debut = false; k = 1 - p2; } else { debut = true; k = p1; } }
  else { if (q2 > 0) { debut = true; k = 1 - q2; } else { debut = false; k = q1; } }
  if (vertical) {
    w.barre.style.transformOrigin = '50% ' + (debut ? '0%' : '100%');
    w.barre.style.transform = 'scaleY(' + k.toFixed(4) + ')';
  } else {
    w.barre.style.transformOrigin = (debut ? '0%' : '100%') + ' 50%';
    w.barre.style.transform = 'scaleX(' + k.toFixed(4) + ')';
  }
  w.mot.style.opacity = (p1 >= 0.999 && q1 < 0.999) ? '1' : '0';
}
```

`mesurer()` (lignes 120 à 131) ajuste chaque mot à la largeur de ses colonnes, avec une borne par
la hauteur des rangs. Sans mise en page disponible, elle retombe sur une estimation de 0,58 em par
caractère, en silence (ligne 126).

**Verbatim de Paul.** « Joli, ça se garde ».

**Adaptation web recommandée.**

- **La grille devient une vraie grille CSS.** `grid-template-columns: repeat(12, 1fr)`, et les
  mots sont de vrais titres placés par `grid-column`.
- **La barre qui passe est le geste à extraire.** Version sans changement d'origine : la barre est
  un pseudo-élément dans une cellule en `overflow: clip`, elle va de `translateX(-101%)` à 0 puis
  à `translateX(101%)`, et le mot passe à `opacity: 1` au milieu, d'un coup. Deux fois 0,32 s,
  `transform` seul.
- **Déclenchement.** À l'entrée dans l'écran, au temps. Resserrer le rythme : un mot toutes les
  0,25 s au lieu de 0,5 s, pour tenir en moins de 3 s.
- **À garder.** La grille qui se déploie colonne par colonne, les blocs qui s'arrêtent sur les
  lignes de la grille, la barre, la lettre qui s'allume avec son mot.
- **À retirer.** Les sorties, l'estompage de la grille.
- **État final et sans JavaScript.** Tous les mots visibles. L'état masqué ne s'applique que si le
  script est actif et le bloc sous l'écran.
- **L'ajustement des mots à la largeur.** À refaire à chaque changement de taille et après le
  chargement de la police (`ResizeObserver`, `document.fonts.ready`). Une mesure faite sur un
  élément masqué rend 0 et déclenche l'estimation sans prévenir.
- **Attention au monospace en capitales.** La légende de l'essai est en JetBrains Mono, capitales
  espacées, 20 px (ligne 21). Paul refuse ce traitement pour un titre sur la page Academy (mémoire
  du projet, `retours-design-paul-academy.md`). Le garder pour les seules lettres `[C]`.
- **Coût.** Nul. **Risque à 390 px.** Faible : passer de douze à quatre colonnes, un mot par rang
  en pleine largeur, le grand chiffre à côté du dernier mot.

**Convient pour.** La méthode CRAFT (c'est l'essai), toute méthode nommée en quatre à six mots,
les principes de l'agence, une grille d'offre.

---

### B.9 `collage` : le collage éditorial

**Ce que l'animation montre.** Des papiers découpés sur fond craie, animés en poses à douze images
par seconde.

| Temps | Ce qui se passe |
|---|---|
| 0,25 | un rond or apparaît en six poses (0,5 s) |
| 0,5 à 1,0 | la photo glisse depuis la gauche (760 px, rotation de -12° vers 0) ; deux rubans à 1,0 et 1,08 |
| 1,5 à 3,0 | six mots tamponnés, quatre poses chacun (0,33 s) : « Posez la question. Toute la question. » |
| 3,5 et 3,75 | deux bandes montent : « MyDigipal · AI Academy » et « à garder sous la main » |
| 4,5 à 5,25 | un cercle au stylo se trace autour de « Toute », d'un geste continu |
| 5,25 à 6,3 | tenue |
| 6,3 à 7,8 | le trait s'efface, les mots se soulèvent en trois poses, les bandes tombent, la photo et le rond sortent |

**Technique.** DOM. Bords découpés par `clip-path: polygon()` calculés une fois depuis une graine
fixe (lignes 76 à 90). Chaque pièce en `translate`, `rotate`, `scale`. L'ombre est un frère de la
pièce, même découpe, avec `filter: blur()` animé de 2,5 à 9,5 px (ligne 242). Le trait de stylo est
un tracé SVG en `stroke-dashoffset`. La fibre du papier est un `feTurbulence` sur toute la scène,
en `mix-blend-mode: multiply` à 10 % (lignes 24 et 31 à 37). Temps quantifié par `q12`. Aucune
bibliothèque.

**Dépendances.** Google Fonts, `display=block` (ligne 9) :

| Police | Poids mesuré |
|---|---|
| Fraunces variable, romain (axes opsz, wght, SOFT, WONK) | 121,0 Ko |
| Fraunces variable, italique | 149,7 Ko |
| Archivo variable | 90,1 Ko |
| JetBrains Mono 500 | 21,8 Ko |

Total 383 Ko : le plus lourd des douze, plus du double du suivant. HTML de 17 Ko.

**Palette.** Craie `#f3efe6`, encre `#0f1a2e`, or `#c8a951`, kraft `#e6d8bb`, blanc, renard
`#d9542b` (le stylo), ruban adhésif en dégradé de `rgba(252, 246, 226, .86)` à `rgba(232, 220,
186, .78)`. Polices : Fraunces sous quatre réglages d'axes, Archivo, JetBrains Mono.

**Fonctions réutilisables.**

```js
function q12(t) { return Math.floor(t * 12 + 1e-6) / 12; }                       // ligne 71
// lignes 76 à 85 : un bord découpé aux ciseaux, sept segments par côté
function decoupe(w, h, rnd, amp) {
  var n = 7, P = [];
  function bord(x0, y0, x1, y1, nx, ny) {
    for (var i = 0; i < n; i++) { var u = i / n, j = i ? (rnd() - 0.5) * 2 * amp : 0; P.push([mix(x0, x1, u) + nx * j, mix(y0, y1, u) + ny * j]); }
  }
  bord(0, 0, w, 0, 0, 1); bord(w, 0, w, h, 1, 0); bord(w, h, 0, h, 0, 1); bord(0, h, 0, 0, 1, 0);
  var s = '';
  for (var k = 0; k < P.length; k++) s += (k ? ',' : '') + P[k][0].toFixed(1) + 'px ' + P[k][1].toFixed(1) + 'px';
  return 'polygon(' + s + ')';
}
// lignes 202 à 205 : les tables de poses et leur lecture
var POSES_TAMPON = [{ s: 1.22, y: -34, r: 5, h: 1 }, { s: 1.06, y: -8, r: 1.5, h: 0.4 }, { s: 0.985, y: 2, r: -0.5, h: 0.1 }, { s: 1, y: 0, r: 0, h: 0 }];
var POSES_LEVE = [{ s: 1.04, y: -10, r: 1, h: 0.3 }, { s: 1.14, y: -50, r: 4, h: 0.8 }, null];
function pose(tq, t0, table) { var k = Math.floor((tq - t0) * 12 + 1e-6); if (k < 0) return undefined; return table[Math.min(k, table.length - 1)]; }
// lignes 240 à 243 : l'ombre dit la hauteur du papier (h de 0, posé, à 1, en l'air)
o.ombre.style.transform = 'translate(' + (4 + 16 * h) + 'px,' + (7 + 22 * h) + 'px)';
o.ombre.style.filter = 'blur(' + (2.5 + 7 * h) + 'px)';
o.ombre.style.opacity = (0.26 - 0.1 * h);
```

Aussi : `graine(s)` (ligne 73, un mulberry32), `decoupeRond(r, rnd, amp)` (lignes 86 à 90),
`etatPiece(o, t)` qui rend l'état d'une pièce selon son mode, `tampon`, `pop`, `glisse` ou `monte`
(lignes 207 à 229).

**Verbatim de Paul.** « j'aime bien, ça fait un peu à l'ancienne ».

**Un conflit avec une règle de Paul.** La phrase est écrite en six mots dans six réglages de
police, sur trois familles (lignes 136 à 143). La règle 5 de `AVIS-PAUL.md` dit : une seule famille
de polices par pièce. Sur le site, garder une seule famille et faire varier la graisse, l'italique,
la taille et la couleur du papier.

**Adaptation web recommandée.**

- **Déclenchement.** À l'entrée dans l'écran, au temps.
- **Presque tout passe en CSS.** Les découpes se calculent au build et s'écrivent en `clip-path`
  dans le HTML. Les poses deviennent des images clés en `steps(1)` : quatre poses à 12 i/s font
  333 ms.
- **À garder.** Les bords découpés à graine fixe, l'ombre qui se resserre quand la pièce se pose,
  le tampon en quatre poses, le ruban, le cercle au stylo.
- **À remplacer.** Le flou animé de l'ombre : deux ombres préfloutées, une serrée et une large,
  qu'on croise en `opacity` et `translate`. La fibre en `feTurbulence` : une petite image de bruit
  en mosaïque, ou rien sous `md`.
- **À retirer.** Les sorties.
- **État final et sans JavaScript.** Toutes les pièces à leur place, le cercle tracé. Le CSS par
  défaut est la pose de repos.
- **La photo.** De vrais portraits découpés avec la même fonction (la note de l'essai le prévoit).
- **Coût.** Faible une fois le flou et la turbulence remplacés.
- **Risque à 390 px.** Moyen. Les positions absolues dans une scène de 1 920 px doivent devenir
  une composition fluide : la photo en haut, les mots en ligne qui passe à la ligne, chacun sur
  son papier, sans mesure en JavaScript.

**Convient pour.** Les pages éditoriales : l'équipe, une méthode racontée comme un carnet, des
verbatims clients posés en papiers découpés, la couverture d'une étude de cas, le blog.

---

### B.10 `degrade-maille` : le dégradé maillé

**Ce que l'animation montre.**

| Temps | Ce qui se passe |
|---|---|
| en continu | un dégradé maillé coule lentement ; une bande de lumière en diagonale traverse une fois par boucle, au plus fort à 4 s |
| 0,55 à 2,1 | à gauche, le texte monte de ses masques : surtitre à 0,55, deux lignes de titre à 0,70 et 0,84, sous-titre à 1,20 |
| 1,30, 1,60, 1,90 | à droite, trois panneaux de verre dépoli montent en ressort depuis 70 px plus bas, puis flottent (9 px, période 4 s) |
| 2,2 à 3,57 | dans le deuxième panneau, un prompt de 41 caractères se tape à 30 par seconde (calculé) |
| 2,6 à 4,2 | dans le premier, la jauge passe de 42 à 68 % |
| 6,60 à 7,39 | les panneaux retombent (0,55 s chacun) ; le texte sort de 6,80 à 7,54 |

**Technique.** WebGL 1 écrit à la main : un shader de fragment sur un triangle plein écran
(lignes 225 à 328), avec cinq appels à un bruit à trois octaves et six nappes gaussiennes par
pixel, puis un tramage de Bayer fixe. Texte en DOM sous masque. Trois panneaux en
`backdrop-filter: blur(24px) saturate(1.45)` (ligne 44) posés sur un fond qui change à chaque
image. Propriétés hors compositeur : `width` de la jauge (ligne 202), `box-shadow` du point
(ligne 206), `textContent`. Un dégradé CSS fixe sert de repli si WebGL manque (ligne 15). L'état est
une fonction pure, `window.ETAT(t)`, séparée de son application (lignes 102 à 170).

**Dépendances.** Google Fonts, `display=swap` : Fraunces romain 500 et 600 (67,3 Ko), Fraunces
italique 500 (42,4 Ko), Inter (48,3 Ko), JetBrains Mono 500 (21,8 Ko). Total 180 Ko. HTML de 18 Ko.

**Palette « verger »** (valeurs du shader converties, lignes 285 à 290). Crème solaire `#fff3d6`,
abricot `#ffb65c`, corail `#ff6a5c`, menthe `#7fe0c8`, rose thé `#fbc7cd`, bleu canard `#258b96`.
Encre `#1e1418`. Verre `rgba(255, 252, 246, .26)`. Point de l'agent `#1e7f8c`. Dégradé de repli :
`#fff1d6`, `#ffb65c`, `#ff6a5c`, `#7fe0c8`. Aucun violet. Polices : Fraunces, Inter, JetBrains Mono.

**Fonctions réutilisables.**

```js
// lignes 130 à 142 : un panneau de verre, de son entrée en ressort à sa retombée
function panneau(p, t) {
  var e = ressort(t - p.tIn, 0.62, 11);
  var sortie = inCubic(seg(t, p.tOut, p.tOut + 0.55));
  var visible = t > p.tIn && sortie < 1;
  var flotte = 9 * Math.sin(TAU * (t / 4.0) + p.phase);
  return {
    visible: visible,
    x: p.x, y: p.y + 70 * (1 - e) + flotte + 90 * sortie,
    rot: p.rot * Math.sin(TAU * (t / 6.0) + p.phase) - 3 * sortie,
    op: Math.min(1, e * 1.4) * (1 - sortie),
    s: 0.94 + 0.06 * Math.min(1, e)
  };
}
```

Le moule à retenir est la séparation entre `ETAT(t)`, qui ne connaît pas le DOM, et `poseDom(e)`
(lignes 190 à 207), qui applique. En GLSL : `bayer4` (lignes 264 à 271), `fbm`, `vnoise`, `hash21`.

**Verbatim de Paul.** « c'est pas mal ». Usage : les animations sur la droite avec le fond.

**Adaptation web recommandée.** Ce que Paul retient, ce sont les trois petites cartes qui vivent à
droite, devant un fond qui bouge.

- **Déclenchement.** Le texte et les panneaux à l'entrée dans l'écran. Le fond peut tourner en
  continu s'il est bon marché.
- **Le fond, en deux versions.** Par défaut et sur mobile : quatre à six taches de dégradé radial
  floutées, animées en `transform`, ou le dégradé fixe. En amélioration dès `lg` : le shader, rendu
  dans un canvas au quart de la taille affichée puis étiré (les notes valident la demi-résolution :
  « un dégradé lissé ne perd rien »), à 30 images par seconde, en pause hors écran et onglet
  masqué.
- **Au-dessus de la ligne de flottaison.** Version CSS seulement, ou le shader lancé après le
  premier affichage avec le dégradé fixe comme affiche.
- **Les panneaux.** `backdrop-filter` sur un fond animé oblige à reflouter à chaque image : le
  garder dès `lg`, et passer sous `lg` à un panneau presque opaque (`rgba(255, 252, 246, .72)`)
  sans filtre. Le flottement reste, en `transform`.
- **À garder.** L'entrée en ressort (ζ 0,62, ω 11), le décalage de 0,3 s entre panneaux, le
  flottement déphasé, la lumière rasante en `inset 0 1px 0` blanc, jamais un liseré coloré.
- **À remplacer.** La jauge en `scaleX`, l'onde du point en pseudo-élément (`scale` et `opacity`).
- **À retirer.** La retombée des panneaux, la sortie du texte.
- **État final et sans JavaScript.** Le titre visible, les trois panneaux posés, la jauge à 68 %,
  le prompt entier, le dégradé fixe.
- **Lisibilité.** La lisibilité de l'encre sur les zones corail reste à juger à l'écran
  (`NOTES-lumiere.md`). Vérifier le contraste, ou poser le texte sur la zone crème.
- **Coût.** Élevé tel quel, faible dans la version CSS.
- **Risque à 390 px.** Moyen. Les panneaux font 460, 640 et 330 px de large. Le deuxième est en
  `white-space: nowrap` (ligne 61) et déborde à 390 px. Sous `md`, empiler les panneaux sous le
  titre et laisser le prompt passer à la ligne.

**Convient pour.** Le haut d'une page IA avec trois preuves du produit en petites cartes ;
l'Account-Based Marketing (un compte, un signal, une action) ; une campagne Performance Max (trois
éléments créatifs qui flottent) ; un serveur MCP (trois outils branchés).

---

### B.11 `vertical-teaser` : le teaser vertical

**Ce que l'animation montre.** Format 1 080 x 1 920, seize temps à 120 BPM (un temps vaut 0,5 s).

| Temps | Plan | Ce qui se passe |
|---|---|---|
| 0, 0,5, 1,0 | accroche, fond noir | « Faites », « travailler », « l'IA. » claquent un par un (0,32 s) ; la règle se trace à 1,5 |
| 2,0 | la méthode, fond craie | le volet monte de 1,75 à 2,0 et finit sur le temps ; « Une méthode. » ; les lettres `[C][R][A][F][T]` basculent de 2,25 à 2,99 |
| 3,5 | les outils, fond cobalt | « Vos outils. » ; une carte monte à 3,57 ; un prompt de 60 caractères se tape de 3,65 à 4,40 ; la réponse tombe à 4,5 avec un sursaut de 14 px |
| 5,0 | les automatisations, fond forêt | « Vos automatisations. » ; un fil se trace ; un point passe de station en station ; les trois étapes s'allument à 5,25, 5,75 et 6,25 |
| 6,5 | appel à l'action, fond terre | « Commencez gratuitement » ; l'adresse est balayée à 7,0 |
| 7,75 à 8,0 | | un volet noir referme la boucle |

**Technique.** DOM, aucune bibliothèque. Volets et balayages en `clip-path: inset()` (lignes 141
et 190). Mots en `scale`, avec l'axe `wdth` de la police animé par `font-variation-settings` à
chaque image (ligne 133), ce qui relance la mise en page du texte. Lettres en `rotateX` sous
`perspective: 900px`. Frappe par `textContent`.

**Dépendances.** Google Fonts, `display=block` : Bricolage Grotesque variable (131,5 Ko),
JetBrains Mono 400 et 600 (31,4 Ko). Total 163 Ko. HTML de 12 Ko.

**Palette** (ligne 15). Noir `#101010`, craie `#f2eee6`, cobalt `#1e40d8`, forêt `#0f4d3a`, terre
`#e3552b`, menthe `#bfeedd`. Cinq fonds pleins, aucun dégradé. Polices : Bricolage Grotesque,
JetBrains Mono.

**Fonctions réutilisables.**

```js
const BPM = 120, B = 60 / BPM, beat = n => n * B;                                // ligne 88
// lignes 129 à 134 : un mot qui claque, trop grand et trop étroit, posé en expo
function slam(e, t, t0) {
  const p = outExpo(seg(t, t0, t0 + 0.32));
  e.style.transform = 'scale(' + mix(1.55, 1, p).toFixed(4) + ')';
  e.style.opacity = seg(t, t0, t0 + 0.04).toFixed(3);
  e.style.fontVariationSettings = "'opsz' 96, 'wdth' " + mix(78, 100, p).toFixed(1) + ", 'wght' 800";
}
// lignes 139 à 142 : un volet qui FINIT sur le temps
const k = inOutQuart(seg(t, PLANS[i].entre - VOLET, PLANS[i].entre));
EL[PLANS[i].id].style.clipPath = 'inset(' + (100 * (1 - k)).toFixed(3) + '% 0 0 0)';
// ligne 166 : une frappe déterministe
const n = Math.floor(PROMPT.length * seg(t, beat(7) + 0.15, beat(7) + 0.9));
```

`window.GEOM` (lignes 102 à 109) décrit les boîtes de texte pour vérifier la zone sûre.

**Verbatim de Paul.** « punchy ». Usage : vertical, mais aussi d'autres formats.

**Adaptation web recommandée.**

- **La structure est déjà celle d'une page mobile.** Une accroche, trois preuves, un appel à
  l'action. Chaque plan devient une section de la hauteur de l'écran à fond plein, en
  `position: sticky`, que la suivante recouvre en montant : le volet est le défilement lui-même.
  Aucun script pour l'enchaînement, et la page se lit sans animation.
- **Déclenchement du contenu.** À l'entrée de chaque section : le titre claque, puis le détail
  joue (lettres qui basculent, prompt qui se tape, point qui parcourt le fil).
- **À garder.** Le claquement en `scale` de 1,55 vers 1 sur 0,32 s, origine à gauche ; les étapes
  qui passent de 35 % à 100 % d'opacité au passage du point ; le sursaut de la carte à la réponse.
- **À retirer.** L'animation de l'axe `wdth` (elle relance la mise en page à chaque image, et il
  reste à vérifier que les polices du site ont cet axe), le volet noir de fin, la cadence imposée.
- **Garde-fou.** Le claquement est à la limite de ce que Paul a refusé dans `titre-cinetique`. Le
  réserver à l'accroche, et laisser les autres titres monter en courbe A.
- **État final et sans JavaScript.** Tous les mots posés, les étapes allumées, le prompt et sa
  réponse affichés.
- **Coût.** Faible. **Risque à 390 px.** Faible, c'est son format natif. Un mot à l'échelle 1,55
  déborde pendant les premières images : la section doit être en `overflow: clip`.

**Convient pour.** La page d'arrivée mobile d'une publicité Reels ou Shorts pour l'Academy,
l'introduction mobile d'une page de service, le tunnel d'un concessionnaire en trois étapes, la
méthode CRAFT lettre par lettre.

---

### B.12 `transition-rythme` : quatre plans au tempo

**Ce que l'animation montre.** Quatre plans de 2 s, une mesure chacun à 120 BPM. Chaque transition
se termine sur le temps fort (`TRANS`, ligne 148).

| Temps | Plan | Contenu | Transition de sortie |
|---|---|---|---|
| 0 à 2 | A, jaune | « Une idée. », « Un geste. », « Un rythme. » claquent à 0, 0,5 et 1,0 | iris, de 1,55 à 2,0 |
| 2 à 4 | B, noir | une forme rouge : le rond devient carré arrondi, tourne de 45°, un anneau pulse | bandes en escalier, de 3,6 à 4,0 |
| 4 à 6 | C, craie | « 2 », « 0 », « 2 », « 6 », un chiffre par temps | balayage diagonal à lame, de 5,6 à 6,0 |
| 6 à 8 | D, bleu | « MyDigipal » lettre par lettre (toutes les 0,125 s), puis l'adresse | tuiles, de 7,5 à 8,0 |

Un léger coup de caméra de 1,2 % tombe sur chaque temps (ligne 223). La piste sonore en Web Audio
est facultative et ne concerne pas le web.

**Technique.** DOM, aucune bibliothèque. Masques en `clip-path` : `circle()`, `polygon()`, et
`url(#tuiles)` qui renvoie à un `clipPath` SVG de quarante rectangles (lignes 99 à 114).
`display` basculé par plan. `border-radius` animé (ligne 169).

**Dépendances.** Google Fonts, `display=swap` : Syne 700 et 800 (34,6 Ko), Archivo 400 à 600
(34,9 Ko). Total 70 Ko. HTML de 24 Ko, dont 10 Ko pour le son (lignes 228 à 391).

**Palette** (lignes 18 à 21 et 27). Jaune `#e8ef5a`, noir `#111`, craie `#f3efe6`, bleu `#2244ff`,
rouge orangé `#ff4d2e`. Polices : Syne pour les quatre plans, Archivo pour l'adresse seulement.

**Fonctions réutilisables.** Les quatre masques ont la même signature, `(sortant, entrant, u)`,
avec `u` de 0 à 1.

```js
function iris(sortant, entrant, u) {                                             // lignes 117 à 120
  entrant.style.clipPath = 'circle(' + (1130 * cine(u)).toFixed(1) + 'px at 960px 540px)';
  sortant.style.transform = 'scale(' + (1 + 0.08 * eio(u)).toFixed(4) + ')';
}
function bandes(sortant, entrant, u) {                                           // lignes 121 à 131
  const n = 7, h = 1080 / n, pts = ['0px 0px'];
  for (let i = 0; i < n; i++) {
    const x = (1920 * eoq(c01((u - i * 0.07) / 0.58))).toFixed(1);
    pts.push(x + 'px ' + (i * h).toFixed(1) + 'px', x + 'px ' + ((i + 1) * h).toFixed(1) + 'px');
  }
  pts.push('0px 1080px');
  entrant.style.clipPath = 'polygon(' + pts.join(',') + ')';
  sortant.style.transform = 'translateX(' + (-120 * eio(u)).toFixed(1) + 'px)';
}
function diagonale(sortant, entrant, u) {                                        // lignes 132 à 138
  const v = cine(u), X = -560 + 2880 * v, Xt = X + 320, Xb = X - 320, L = 150;
  entrant.style.clipPath = 'polygon(0px 0px,' + Xt.toFixed(1) + 'px 0px,' + Xb.toFixed(1) + 'px 1080px,0px 1080px)';
  E.lame.style.display = 'block';
  E.lame.style.clipPath = 'polygon(' + Xt.toFixed(1) + 'px 0px,' + (Xt + L).toFixed(1) + 'px 0px,' + (Xb + L).toFixed(1) + 'px 1080px,' + Xb.toFixed(1) + 'px 1080px)';
  sortant.style.transform = 'translateX(' + (60 * v).toFixed(1) + 'px)';
}
```

`tuiles` est aux lignes 139 à 146. `pulse(x)` (ligne 88) donne l'impulsion sur chaque temps.

**Verbatim de Paul.** « il y a du tempo ». Usage : les sujets rythmés. Réserve : les polices qui
s'enchaînent lui déplaisent.

Ce que le code dit sur cette réserve : le fichier ne charge que deux familles (ligne 9), et les
quatre plans sont tous en Syne (ligne 15). Archivo ne sert qu'à l'adresse et aux commandes hors
scène (lignes 32 et 34). La raison précise de l'impression de Paul n'est pas dans les fichiers.
La règle écrite, elle, est claire : une seule famille par pièce.

**Adaptation web recommandée.** Ne prendre que les masques.

- **Usage.** Une transition entre deux panneaux déclenchée par le visiteur : onglets, avant et
  après, étapes. Le panneau entrant est révélé par un masque en 400 à 500 ms.
- **Un seul masque pour tout le site.** Je recommande les bandes en escalier ou la diagonale à
  lame. L'iris et les tuiles sont plus démonstratifs.
- **À garder.** Le principe « la transition finit quand le contenu est prêt », la lame qui donne
  une épaisseur au balayage, le léger recul du panneau sortant.
- **À retirer.** Le coup de caméra sur chaque temps et la pulsation des mots (mouvement
  décoratif), le son, l'enchaînement automatique.
- **Coordonnées.** Toutes en pixels pour 1 920 x 1 080 (`circle(1130px at 960px 540px)`, polygones
  en `px`) : à passer en pourcentages.
- **Le `clipPath` SVG.** Il doit rester dans le DOM en 0 x 0, jamais en `display: none`
  (`NOTES-camera.md`), avec un identifiant unique par instance.
- **État final et sans JavaScript.** Tous les panneaux sont dans le HTML. Sans script, ils
  s'affichent l'un sous l'autre.
- **Coût.** Faible pour une transition ponctuelle : `clip-path` se peint, il ne se compose pas,
  mais 0,4 s sur un panneau ne pose pas de problème. **Risque à 390 px.** Faible.

**Convient pour.** La section avant et après des solutions IA (`AIBeforeAfter.astro` existe déjà),
le passage d'un service à l'autre, les étapes du calculateur, un carrousel d'études de cas.

---

## C. Les leçons des essais refusés

| Essai | Ce qui a déplu (verbatim) | Ce que fait le code | La règle pour le web |
|---|---|---|---|
| `zoom-continu` | « ça fout la gerbe, on sait pas où ça va se terminer, ça fait flipper » | zoom exponentiel pur à travers neuf plans emboîtés, l'image double toutes les 1,1 s, flou par plan (ligne 265) | Pas de zoom continu, pas de traversée d'échelles, pas de défilement détourné en plongée. Un mouvement de caméra a une destination visible et une tenue. Zoom de 1,5 au plus, comme dans `demo-interface`. |
| `titre-cinetique` | « un peu bêta, ça fait les vieilles présentations de slides, ce texte bouge pour rien » | police variable Anybody, chasse et graisse animées lettre par lettre, avec dépassement (ligne 22) | Un titre apparaît une fois, en ligne sous masque et en courbe A, puis ne bouge plus. Pas d'animation lettre par lettre, pas d'axe de police animé pour décorer. Un texte ne bouge que s'il porte un sens : un prompt qui se tape, un chiffre qui bascule. |
| `camera-profondeur` | « de l'idée, mais mal foutu » ; au zoom, écran flouté, titre invisible | `filter: blur()` par plan selon un cercle de confusion (ligne 310), mise au point qui part avant la caméra | Ne jamais flouter ni masquer ce qu'on lit. Le flou ne touche que ce qui n'est pas en jeu, 3 px au plus. Pas de profondeur de champ sur le web. |
| `lumiere-studio` | « de l'idée, mais pas ouf » | Three.js r128 (ligne 118), halo et halation maison en plusieurs passes HDR | Le post-traitement lourd ne se voit pas à la hauteur de ce qu'il coûte. Ne pas le payer sur le web. |
| `liquide` | « un peu simplet, il se passe pas grand-chose, fade » | métaboules en shader de fragment (ligne 131) | Un effet seul ne suffit pas. Chaque animation raconte un process : une entrée, une transformation, un résultat. |
| `fond-shader` | « un peu fade, mais pourquoi pas » | dégradé maillé en WebGL (ligne 96), titre centré | Un fond animé reste un décor. Il ne porte jamais une section à lui seul et doit rester bon marché. Ce qui compte est ce qui vit devant. |
| `bumper-son` | « pas folichon », « le bleu, c'est pas ce qu'il nous faut », « saccadé », la barre du curseur ne suit pas l'écriture | bleu `#1d3cff` (ligne 14) ; le curseur avance par sauts d'une largeur de lettre (`ecrites`, `curseur1`, lignes 131 à 142) pendant que les lettres montent en continu ; le bloc est animé en `left`, `top`, `width`, `height` | Dans une frappe, le curseur est un élément en ligne placé juste après le dernier caractère, comme dans `degrade-maille` (ligne 87) et `vertical-teaser` (ligne 60). Ne jamais animer `left`, `top`, `width` ni `height`. Pas ce bleu : le bleu de marque noté dans la mémoire du projet est `#1D71B8`. |

---

## D. Les règles des NOTES qui s'appliquent au web

Écarté : le son et la cue sheet, l'export WAV, l'encodage, `preserveDrawingBuffer`, l'alias
`window.DUR`, le préchargeur pour la capture, la fermeture de boucle.

**Durées**

- Entrée d'un objet : 0,4 à 0,6 s. Courbe A : 0,55 s.
- Ligne de titre sous masque : 0,9 à 1,05 s dans les essais favoris.
- Sortie : 0,7 fois l'entrée. Courbe A : 0,40 s.
- Micro-mouvement (coche, clic, étiquette) : 0,2 à 0,35 s.
- Clic : 60 ms d'enfoncement, 160 ms de relâchement, onde de 0,6 s.
- Glissé de caméra : 0,75 à 0,85 s dans `demo-interface`.
- Déplacement d'une station à l'autre : 1,3 s pour 560 px.
- Transition entre deux panneaux : 0,40 à 0,50 s.
- Tenue de lecture dans une séquence automatique : 3 s par idée, plus 0,3 s par mot.

**Décalages**

- Éléments secondaires d'un objet (contenu, ombre) : 33 ms avec la courbe A, et le double pour le
  plus petit détail.
- Lignes d'un titre : 0,12 à 0,15 s.
- Lignes d'une liste qu'on doit lire : 0,12 s dans `demo-interface`, 0,2 à 0,3 s selon
  `RECHERCHE.md`.
- Colonnes d'une grille, volets d'un tableau : 0,045 s.
- Blocs d'une scène : 0,25 s.
- Partir de ce qui déclenche (le clic, le centre) quand il n'y a pas d'ordre de lecture.

**Hiérarchie des mouvements**

- Un mouvement principal par écran. Les autres restent sous le tiers de son amplitude.
- L'anticipation précède : la liste fait de la place (0,3 s) avant que l'élément tombe (0,55 s).
  Les deux en même temps font « jouet ».
- Le dépassement est réservé aux objets (cartes, boutons, étiquettes). Jamais au texte courant.
- Jamais de linéaire, sauf pour une barre de progression.
- Une révélation se termine quand on doit lire, elle ne commence pas à ce moment. Sur le web :
  déclencher assez tôt pour que l'élément soit posé quand il arrive en zone de lecture.
- 0,3 à 0,5 s sans rien qui bouge avant une révélation importante.
- La mise au point suit la même courbe que la caméra, sinon l'œil sent deux mouvements.
- Une caméra se redresse en approchant : 8° au large, 2 à 3° en gros plan.

**Lisibilité**

- Masque d'une ligne : 0,2 em de marge en haut et en bas, ligne cachée à `translateY(120 %)` au
  moins. À 100 %, le haut du glyphe affleure.
- La barre qui passe vaut mieux qu'un fondu : 0,32 s pour couvrir, 0,32 s pour découvrir.
- Interlettrage en `margin-right` sur chaque lettre sauf la dernière quand le texte est centré :
  `letter-spacing` ajoute un espace après la dernière lettre.
- Deux vues du même objet ne se floutent pas l'une l'autre.
- L'ombre d'un papier dit sa hauteur : décalage, flou et opacité suivent un seul paramètre.
- Un groupe d'ombres porte une seule opacité, sinon les recouvrements noircissent.
- Un tramage contre les bandes d'un dégradé est fixe dans le temps. Un bruit qui change à chaque
  image crépite, et Paul le refuse.

**Architecture**

- L'état est une fonction pure de `t`, séparée de son application à la page. C'est ce qui permet de
  piloter par le temps ou par le défilement, et de tester hors navigateur.
- Le hasard a une graine fixe (`mulberry32`), jamais `Math.random`. Bénéfice propre au web : le
  rendu au build et le rendu dans le navigateur sont identiques.
- Le contenu de tous les panneaux est posé à chaque image, même ceux qui sont cachés.
- L'ordre des couches d'une scène s'écrit à la main, il ne se trie pas.
- Une mesure de texte se fait après le chargement de la police, une fois, et jamais à chaque
  image.

---

## E. Pièges techniques repérés dans le code

### E.1 Ce qui casse le contrat du site

| # | Piège | Où | Conséquence | Remède |
|---|---|---|---|---|
| 1 | **L'état par défaut du CSS est l'état caché.** `transform: translateY(125%)`, `opacity: 0`, `visibility: hidden`, `display: none`, `clip-path: inset(100% 0 0 0)` | `isometrique` l. 19 et 22 ; `morph-formes` l. 19 ; `carte-3d` l. 22 ; `courbes-signature` l. 21, 22, 28 ; `degrade-maille` l. 25 et 46 ; `collage` l. 17 ; `transition-rythme` l. 17 ; `vertical-teaser` l. 19 et 27 ; `grille-suisse` l. 18 | sans JavaScript, la page est vide | le CSS par défaut est l'état final ; l'état de départ ne s'applique que sous une classe posée par le script, et hors mouvement réduit |
| 2 | **`t = DUREE` est une scène vide.** Chaque essai se vide pour fermer sa boucle | les douze | une progression de défilement menée jusqu'à `DUREE` finit sur rien | borner `t` à l'instant de tenue (tableau de B.0) |
| 3 | **Le mouvement réduit du lecteur n'est pas un état final.** Il met en pause à `t = DUREE x 0,5` | `lecteur.js` l. 54 | à mi-boucle, plusieurs essais sont en plein milieu d'une action | un état final explicite par composant |
| 4 | **Les textes tapés sont absents du HTML.** Les `span` sont vides et remplis par `textContent` | `degrade-maille` l. 87 et 204 ; `vertical-teaser` l. 60 et 167 | rien sans JavaScript, rien pour l'indexation | le texte entier dans le HTML, la frappe en effet visuel |
| 5 | **Tout le texte est en français, en dur, dans le HTML ou le JavaScript.** Celui de `carte-3d` est dessiné dans un canvas | `carte-3d` l. 258, 259, 303, 387 ; tous les autres | le site est en français et en anglais ; un texte en canvas n'est ni lu ni traduit | le texte en propriété du composant, et en DOM |
| 6 | **Les chiffres et les noms sont fictifs.** « 3h », « 12 », « 7j », « Atelier Martin », « Camille Roux » | `tableau-chiffres` l. 66 à 70 ; `demo-interface` l. 93 à 138 | un chiffre inventé publié comme un résultat | des données réelles et sourcées |

### E.2 La taille fixe

| # | Piège | Où | Remède |
|---|---|---|---|
| 7 | **Scène de 1 920 x 1 080 (ou 1 080 x 1 920) en pixels**, ramenée à la fenêtre par un `scale` | `lecteur.js` l. 30 à 35 ; `#stage` de chaque essai | à 390 px, l'échelle est de 0,2 et le texte illisible : il faut refaire la mise en page, pas réduire |
| 8 | **Constantes de taille dans les shaders et les uniformes** | `particules-texte` l. 127, 132, 235, 236, 281 ; `degrade-maille` l. 357 et 361 | les passer en uniformes, recalculer au changement de taille |
| 9 | **Canvas et rendu WebGL à taille fixe, ratio de pixels forcé à 1** | `carte-3d` l. 41, 121, 122 ; `particules-texte` l. 31 et 252 ; `degrade-maille` l. 73 | taille du conteneur multipliée par un ratio plafonné, `ResizeObserver` |
| 10 | **Masques en pixels** | `transition-rythme` l. 118 à 136 | pourcentages |
| 11 | **Largeurs fixes et `white-space: nowrap`** | `degrade-maille` l. 61 (640 px) ; `demo-interface` l. 41 à 43 | largeurs fluides, retour à la ligne autorisé |
| 12 | **Mesure de texte faite une seule fois, avec repli silencieux sur une estimation** | `grille-suisse` l. 120 à 131 ; `collage` l. 167 à 181 | remesurer au changement de taille et après `document.fonts.ready` ; un élément masqué rend 0 |

### E.3 Les performances

| # | Piège | Où | Remède |
|---|---|---|---|
| 13 | **`preserveDrawingBuffer: true`** : utile à la capture vidéo, coûteux sur le web | `carte-3d` l. 117 ; `particules-texte` l. 73 ; `degrade-maille` l. 211 | `false` |
| 14 | **`powerPreference: 'high-performance'`** : réveille la carte graphique dédiée | mêmes lignes | valeur par défaut |
| 15 | **three.js r128 en script global, synchrone, depuis un CDN** : 603 Ko bruts, 149 Ko compressés | `carte-3d` l. 59 | paquet npm, import dynamique dans un îlot `client:visible` ; hors fichiers : r128 est ancien et ses réglages de couleur (`outputEncoding`, `encoding`, l. 123 et 146) ont été renommés depuis, à vérifier avant de porter |
| 16 | **Tout le SVG réinjecté par `innerHTML` à chaque image** | `isometrique` l. 334 | Canvas 2D, ou éléments persistants |
| 17 | **`filter: blur()` animé** | `demo-interface` l. 243 ; `collage` l. 242 | voile en `opacity`, ombres préfloutées croisées |
| 18 | **`backdrop-filter` sur un fond animé** | `degrade-maille` l. 44 | dès `lg` seulement |
| 19 | **`feTurbulence` plein cadre en `mix-blend-mode`** | `collage` l. 24 et 31 à 37 | image de bruit en mosaïque |
| 20 | **Propriétés hors compositeur animées par image** : `width`, `background`, `box-shadow`, `border-radius`, `clip-path`, `font-variation-settings`, `color`, et les attributs SVG `d` et `points` | `demo-interface` l. 253, 264, 278 ; `morph-formes` l. 204 et 231 ; `degrade-maille` l. 202 et 206 ; `transition-rythme` l. 169 ; `vertical-teaser` l. 133 et 141 ; `grille-suisse` l. 174 | `scaleX`, fondu entre deux calques, pseudo-élément ; accepter le reste sur de petites surfaces |
| 21 | **Boucle `requestAnimationFrame` permanente, et un `postMessage` par image** | `lecteur.js` l. 39 et 41 à 46 | ne pas reprendre le lecteur ; boucle active seulement à l'écran et jusqu'à l'instant de tenue |
| 22 | **Soixante-douze cellules en perspective** | `tableau-chiffres` l. 19 | chiffres seuls sous `md` |

### E.4 Les polices

| # | Piège | Où | Remède |
|---|---|---|---|
| 23 | **Polices chargées depuis `fonts.googleapis.com`** | ligne 9 des douze essais | polices hébergées par le site (`@fontsource`), comme il le fait déjà |
| 24 | **`display=block` sur sept essais, `display=swap` sur cinq** (calculé) | `courbes-signature`, `isometrique`, `morph-formes`, `tableau-chiffres`, `grille-suisse`, `collage`, `vertical-teaser` | `swap`, et une mesure refaite après chargement |
| 25 | **Onze familles différentes sur douze essais** (calculé) : Archivo, Barlow Semi Condensed, Bricolage Grotesque, Fraunces, IBM Plex Mono, Inter, JetBrains Mono, Manrope, Schibsted Grotesk, Sora, Syne | | les composants prennent la famille de la page ; une seule famille par pièce (règle 5 de Paul) |
| 26 | **Un canvas dessiné avant que sa police soit prête prend une police de repli, sans erreur** | `carte-3d` l. 64 à 68 ; `particules-texte` l. 248 à 250 | `document.fonts.load()` explicite avant le premier dessin |
| 27 | **`ctx.letterSpacing` n'existe pas partout** : le code le teste et s'en passe | `carte-3d` l. 279 | texte en DOM |
| 28 | **Variables lourdes** : Fraunces complet 121 et 150 Ko, Bricolage Grotesque 131,5 Ko, Archivo 90 Ko | `collage`, `isometrique`, `morph-formes`, `vertical-teaser`, `grille-suisse` | ne charger que les axes utilisés |

### E.5 Le code

| # | Piège | Où | Remède |
|---|---|---|---|
| 29 | **Deux signatures pour `seg`** : `(t, debut, fin)` dans dix essais, `(t, debut, duree, courbe)` dans deux | `demo-interface` l. 160 ; `transition-rythme` l. 86 | une seule signature dans le module commun |
| 30 | **Deux sens pour `ressort`** : le ressort analytique à trois arguments, et un `easeOutBack` à un argument | `demo-interface` l. 159 ; `transition-rythme` l. 85 | renommer le second |
| 31 | **Identifiants globaux et variables sur `window`** : `#stage`, `#app`, `#gl`, `#t1`, `window.render`, `window.ETAT`, `window.__mesurer`, `window.GEOM` | les douze | un essai par page est supposé ; portée locale et références par instance |
| 32 | **Identifiants de `clipPath` fixes** | `isometrique` l. 150, 272, 280, 292, 319, 329 ; `transition-rythme` l. 64 | suffixe par instance |
| 33 | **Chemin relatif `../lecteur.js`** | dernière balise `script` de chaque essai | n'existe pas sur le site |
| 34 | **Constantes réglées pour 30 images par seconde** : `F = 1 / 30`, opacité « en deux images » | `courbes-signature` l. 65 ; `vertical-teaser` l. 132 | les garder en millisecondes |
| 35 | **Aucune gestion de la perte de contexte WebGL ni de sa libération** | `carte-3d`, `particules-texte`, `degrade-maille` | hors fichiers : les navigateurs limitent le nombre de contextes actifs ; un seul composant WebGL par page, libéré à `astro:before-swap` |

### E.6 Deux pièges propres au site, à croiser avec le `CLAUDE.md` du projet

- **Une fonction passée en propriété d'un îlot Astro casse l'hydratation.** Un `render(t)` ne se
  passe donc pas en propriété : le bloc est importé dans l'îlot, qui ne reçoit que des données.
- **Les initialisations passent par `astro:page-load`** (`src/lib/scroll.ts`). Une boucle ou un
  contexte WebGL lancé par un composant doit aussi s'arrêter au changement de page.

### E.7 Pilotage par le défilement

Hors fichiers, à vérifier : les animations CSS pilotées par le défilement (`animation-timeline`)
ne sont pas prises en charge par tous les navigateurs d'après mes connaissances. Le site n'en
utilise aucune aujourd'hui (aucune occurrence dans `src/`). Le chemin portable est une progression
calculée en JavaScript et passée à `render(t)`.
