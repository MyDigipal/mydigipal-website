# Notes de la famille « Lumière et profondeur » (lot 2)

Trois essais, écrits le 29/09/2026 sans ouvrir de navigateur. Ce qui est garanti : la syntaxe de
chaque script (`node --check`), la validité des shaders en GLSL ES 1.00 (`glslangValidator`, avec
l'en-tête que Three ajoute à un `ShaderMaterial`), l'existence de toute l'API Three r128 appelée
(build UMD chargé dans Node), la géométrie du cyclorama et la projection de la dalle sur toute la
boucle (dans le cadre, à droite de la colonne de texte), la largeur de chaque ligne de titre mesurée
avec les fontes que Google sert (`opentype.js`), et le comportement de `ETAT(t)` exécuté dans Node :
même résultat quel que soit l'ordre des appels, aucun NaN, bouclage aux deux bouts. Ce qui reste à
voir à l'écran : le dosage du bloom et de l'halation (réglé à l'aveugle, volontairement bas), la
lisibilité de l'encre sur les zones corail du dégradé, et le coût des filtres de flou sur un portable.

## Le contrat, et ce que ces essais y ajoutent

- **`window.ETAT(t)` est une fonction pure posée dans un premier `<script>` sans DOM.** Elle rend
  l'état complet (lumières, caméra, positions, opacités, flous, uniforms, texte). Le second script
  ne fait que l'appliquer. C'est ce qui permet de tester le déterminisme et le bouclage dans Node
  (`scratchpad/verifier-lot2.js` la charge dans une VM avec `window = {}`), et c'est le moule du
  contrat de bloc de RECHERCHE.md (11.2) : `etat` pur, `appliquer` qui touche la page.
- `window.DUR` en plus de `window.DUREE`, et un `#prechargeur` dans chaque essai, comme au lot 1
  (même sans Canvas : un plan encore caché n'a pas forcément demandé sa police).

## Lumière de studio (`lumiere-studio`)

- **Le bloom est maison, dans `render(t)`, sans `examples/`** : la scène est rendue en linéaire dans
  une cible HDR (`HalfFloatType` si WebGL2 et `EXT_color_buffer_float`, sinon `UnsignedByteType` avec
  le même seuil), puis seuil doux à genou, flou gaussien séparable à neuf échantillons à la demi-
  résolution (deux passes), recopie au quart et deux passes de plus, et une passe finale qui fait
  l'addition, l'ACES, le sRGB et le tramage. Le renderer est donc en `LinearEncoding` et
  `NoToneMapping` : si on remet `sRGBEncoding` sur le renderer, l'image passe deux fois en gamma.
- **L'halation est le flou LARGE teinté chaud** (`vec3(1.0, 0.48, 0.26)`), le halo proche reste
  neutre. C'est l'effet pellicule de la section 5.12, sans le grain.
- **Le balayage spéculaire vient de deux choses** : une `PointLight` qui traverse devant la dalle
  (le clearcoat à rugosité 0,04 dessine un point qui court), et le **pivot de la dalle**, qui fait
  courir les reflets du studio PMREM (grande fenêtre chaude, bande froide) sur sa face. Le PMREM
  n'est cuit qu'une fois ; c'est l'objet qui tourne, pas la lumière.
- **La gravure est du verre dépoli** : un plan au cœur de la dalle, `MeshStandardMaterial` à
  rugosité 1 avec le texte en `map` et `emissiveMap`. Dépoli = diffus, donc la source qui passe
  l'allume physiquement ; l'`emissiveIntensity` ajoute une braise qui reste après le passage. La
  dalle est en `FrontSide` : sa face arrière, sinon, se dessinerait par-dessus la gravure.
- **Le cyclorama** : sol, mur, et un quart de `CylinderGeometry` tourné sur z pour la courbe, en
  `DoubleSide` parce qu'on le voit du dedans. Vérifié dans Node : la courbe va de (y 0, z -3,6) à
  (y 2,4, z -6).
- **Les caustiques sont un `ShaderMaterial` additif au sol**, trois ondes qui interfèrent, toutes
  en `sin(k * ph * TAU)` avec k entier, dont on ne garde que les crêtes (`v^6` écrit en produits,
  jamais `pow` sur une base qui peut être négative). Leur intensité suit la source qui balaie.
- **Le noir aux deux bouts ferme la boucle** : toutes les intensités sont multipliées par `allume`,
  nul à t = 0 et t = 8. Le pivot, l'orbite et la respiration sont des sinus de `2 pi t / D`.
- **Ordre de rendu forcé** : gravure `renderOrder 1`, dalle `renderOrder 2`, les deux transparents.
  Sans cela Three trie par distance et la dalle, centrée au même point, peut passer dessous.

## Caméra en profondeur (`camera-profondeur`)

- **Pas de `preserve-3d`** : un `filter: blur()` sur un enfant aplatit son contexte 3D, donc
  flou de profondeur et vraie perspective CSS ne se marient pas. La caméra est un sténopé calculé
  en JS (`s = F / (z - cz)`, F = 1 500) et chaque plan reçoit `translate` + `scale` en 2D.
- **Le flou est un cercle de confusion** : `coc = 16 * |s - sF|` en pixels d'écran, plafonné à 44,
  puis divisé par `s` avant d'entrer dans `blur()`, parce que le filtre s'applique dans l'espace
  local, avant l'échelle. Oubli classique : le flou d'un plan proche serait multiplié par 7.
- **Le pivot** : `x = W/2 + px * s + cx * (sF - s)`. Le plan au point ne bouge pas, ce qui est
  devant glisse d'un côté, ce qui est derrière de l'autre. Mesuré à la station A : bokeh proche
  -12 px, titre 0 px, plan de fin +29 px.
- **La mise au point anticipe la caméra** (part 0,15 s avant, arrive 0,10 s avant) : c'est le
  pointeur qui « sait » où on va, et l'œil suit.
- **Un plan qui passe la caméra** s'éteint entre 500 et 200 px de distance puis se cache. Échelle
  maximale d'un plan visible : 6,9 (à opacité nulle). Avant ce garde-fou, le bokeh proche montait
  à l'échelle 25, soit 13 000 px de large.
- **La boucle se ferme par un voile noir** (0,8 s à l'ouverture, 0,6 s à la fermeture) : une
  caméra qui avance ne peut pas revenir sans qu'on le voie. La chute monte à 7,35 et ressort par le
  haut pendant que le voile tombe.
- Les chiffres écrits dans les cartes sont fictifs (« douze demandes, trois urgentes ») et ne sont
  ni un prix ni un nombre de leçons.

## Dégradé maillé (`degrade-maille`)

- **Palette « verger »** : crème solaire, abricot, corail, menthe, rose thé, bleu canard. Aucun
  violet, aucun bleu-violet. L'encre `#1e1418` (noir tirant vers le vin) porte le titre.
- **Le maillage** : six nappes gaussiennes sur des orbites fermées, mélangées à travers un domaine
  déformé deux fois par du bruit de valeur lisse (3 octaves). Tout ce qui dépend du temps passe par
  `cos` et `sin` de `k * ph + c` avec k entier (vérifié par lecture du shader dans le script de
  vérification) : la boucle se referme exactement.
- **La bande de lumière** traverse une fois par boucle (`-1,3 + 2,6 ph`) avec une intensité en
  `sin^2(pi ph)`, nulle aux deux bouts : le saut de position n'est jamais visible.
- **Tramage de Bayer 4x4 fixe**, comme au lot 1. Aucun bruit par pixel et par image.
- **Le verre est en `backdrop-filter`**, pas dans le shader comme le panneau du lot 1 : trois
  petits panneaux coûtent moins qu'un dépoli à six échantillons sur toute l'image, et le verre se
  voit parce que le fond bouge derrière. Lumière rasante par `inset 0 1px 0` blanc en haut, jamais
  un liseré coloré sur un côté.
- Fraunces à `opsz 144` pour le titre (taille optique d'affiche), `opsz 40` dans la carte.

## Vérifier sans navigateur, la recette du lot 2

`scratchpad/verifier-lot2.js` : node --check de chaque script, glslangValidator sur chaque tableau
`VERT_*` / `FRAG_*` (en-tête Three ajouté quand le shader n'a pas de `precision`), contrat et
interdits par lecture, fiche JSON, exécution de `ETAT(t)` dans Node (60 instants en trois ordres
différents, 301 instants sans NaN, bouclage propre à chaque essai), API Three, projection de la
dalle. `scratchpad/fontes/mesurer.js` : télécharge les TTF que Google sert et mesure chaque ligne
de titre avec `opentype.js` ; c'est ce qui a fait passer la gravure de 168 à 150 px (984 px sur un
canvas de 1 024) et remonter les titres là où il restait de la marge.
