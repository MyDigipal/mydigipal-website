# Notes du labo, famille « Styles graphiques » (lot 2)

Quatre essais, écrits le 29/09/2026 sans ouvrir de navigateur : `isometrique.html`, `grille-suisse.html`,
`collage.html`, `liquide.html`. Tous respectent le contrat du moteur (`window.STAGE`, `window.DUREE` et son
alias `window.DUR`, `window.render(t)` pur, `window.PRET` pour les polices avec un `#prechargeur` pour ce
que le moteur vidéo attend par `document.fonts.ready`, `../lecteur.js` en dernier). Aucune bibliothèque :
tout est écrit à la main, y compris les métaboules en GLSL.

Vérifiés hors navigateur par `scratchpad/verif-lot2.js` : `node --check` sur chaque script, le fragment
GLSL passé à `glslangValidator` (profil ES 1.00), le contrat et les interdits relus par expression régulière
(aucun `requestAnimationFrame`, `Math.random`, `Date`, minuterie, animation CSS, tiret long, emoji, prix,
nombre de leçons ; externes limités à Google Fonts), puis 480 à 540 images rendues dans un DOM factice
sans NaN, même DOM pour un même t quel que soit l'ordre des appels, et boucle refermée (rien de visible à
t = 0 ni à t = DUREE). `sonde-iso.js` mesure l'étendue de la scène isométrique (x 312 à 1 564, y 137 à
975, rien sous le titre) et l'ordre réel des couches dans la chaîne SVG.

Ce qui reste à juger à l'écran : les tailles de police réellement mesurées (la grille et le collage
s'ajustent à la police chargée), le rendu du reflet sur la goutte, la lisibilité de l'oeil bleu de
l'agent et le poids visuel de la fibre du papier.

## Ce que j'ai appris

- **Une isométrie vraie tient en une ligne** : `sx = (x - y) cos 30°`, `sy = (x + y) sin 30° - z`, et la
  caméra regarde depuis (1, 1, 1). Une face est visible si `nx + ny + nz > 0`. Ça marche aussi pour un
  cube qui tourne, donc l'agent à tête tournante n'a rien coûté de plus qu'une boîte fixe.
- **Une ombre portée nette se calcule, elle ne se dessine pas.** Chaque sommet est projeté le long de la
  lumière sur le plan qui reçoit l'ombre (le sol, le toit, la paroi du tableau), et l'ombre est
  l'enveloppe convexe des projections (chaîne monotone, une vingtaine de lignes). Le même code sert aux
  trois plans, il suffit de dire lequel. Un groupe d'ombres porte UNE opacité pour tout le groupe, sinon
  deux ombres qui se recouvrent font une tache plus noire ; et il est découpé au polygone du plan qui le
  reçoit, sinon l'ombre d'un piston déborde sur la façade.
- **L'ordre des couches se décide à la main, par construction, jamais par un tri générique.** Un tri par
  `xmin + ymin` mettait une tâche sortie de l'usine par-dessus l'usine ; un tri par `xmax + ymax` cachait
  l'enveloppe derrière la façade qu'elle traverse. La règle qui tient : une liste écrite dans l'ordre
  arrière vers avant, et deux cas particuliers nommés (le rail avant d'un tapis se dessine APRÈS ce qui
  roule dessus ; une tâche qui saute vers la colonne de droite se dessine après ce rail). Sonder la
  position des couleurs dans la chaîne SVG (`indexOf`) suffit à prouver l'ordre sans navigateur.
- **Faire « entrer » un objet dans un bâtiment, c'est le découper dans l'espace, pas à l'écran.** La
  partie de l'enveloppe qui a passé la façade (y < 2,2) n'est simplement pas construite ; le rabat est
  coupé au même plan par un paramètre de segment. Aucun masque SVG, et ça reste vrai quel que soit
  l'angle.
- **Les bandes d'un tapis bouclent si `vitesse x DUREE` est un multiple du pas.** Avec 2,4 unités par
  seconde sur 9 s, un pas de 0,45 tombe juste (48 bandes). Un pas de 0,5 aurait laissé un décalage de
  0,1 au raccord, invisible ici parce que le tapis n'est pas visible aux deux bouts, mais faux.
- **Une grille suisse en mouvement, c'est des mots à la largeur exacte de leurs colonnes.** La mesure
  se fait une fois, après le chargement de la police (`offsetWidth` à 100 px, puis règle de trois),
  avec une borne par la hauteur des rangs pour le grand chiffre. `offsetWidth` ignore les
  transformations, contrairement à `getBoundingClientRect`, donc l'échelle du lecteur ne fausse rien.
  Dans un DOM sans mise en page, une estimation à 0,58 em par caractère prend le relais.
- **La barre qui passe vaut mieux qu'un fondu.** Deux phases : la barre couvre la cellule (origine à
  gauche, `scaleX` de 0 à 1), le mot devient opaque sous elle, la barre se retire (origine à droite,
  `scaleX` de 1 à 0). À la sortie, l'inverse, plus court (0,25 s contre 0,32 s). La barre déborde de 4 %
  en haut et en bas pour couvrir les capitales qui affleurent le haut de la boîte de ligne.
- **Le volume animé à 12 images par seconde, c'est un temps quantifié, pas un rendu saccadé.** `tq =
  floor(12 t) / 12`, et les pièces en « stop motion » lisent tq quand les autres lisent t. Le tampon
  d'un papier tient en quatre poses (1,22 puis 1,06 puis 0,985 puis 1), le soulèvement en trois. Piège
  vu à la vérification : quand t vient de dépasser l'instant de sortie mais que tq est encore en deçà,
  la pose est indéfinie ; il faut que ce cas rende la pose de repos, pas un `undefined`.
- **L'ombre d'un papier dit sa hauteur.** Un seul paramètre `h` (0 posé, 1 en l'air) règle le décalage
  (4 à 20 px), le flou (2,5 à 9,5 px) et l'opacité (0,26 à 0,16) de l'ombre. C'est ce qui fait « claquer »
  la pose, plus que le mouvement de la pièce elle-même.
- **Les bords découpés sont tirés d'une graine fixe par pièce** (mulberry32) : sept segments par côté,
  décalés de 2 à 5 px. Comme `clip-path` ne peint rien hors de la boîte, la gigue vers l'extérieur se
  perd et seule la gigue vers l'intérieur se voit : le bord paraît légèrement rongé, ce qui est l'effet
  voulu. La fibre du papier est un `feTurbulence` à graine fixe posé UNE fois sur toute la scène en
  multiplication à 10 % : identique à chaque image, donc aucun crépitement.
- **Une métaboule propre, c'est un smooth-min et un gradient.** Le champ `d` est l'union lissée des
  distances aux disques ; le bord est `1 - smoothstep(-1,1, d)`, donc anticrénelé au pixel. Le relief
  vient du gradient de `d` (différences finies à 1,5 px) multiplié par une pente qui s'annule au centre
  et se raidit au bord (`sqrt(1 - (1 - prof)²)`) : ça bombe comme une goutte, sans normale 3D. Le rayon
  de fusion `k = 90 px` fait des cous qui rompent quand l'écart entre deux gouttes de 105 px dépasse à
  peu près 90 px, soit aux trois quarts de la division.
- **Un disque à rayon nul est une boule éteinte** : le shader saute les rayons sous 0,5 px, et la
  chorégraphie n'a que quatre boules à piloter dans toutes les phases (chute avec traîne, écrasement
  avec deux boules latérales brèves, division, respiration, fusion, chute finale). L'état est une
  fonction de t découpée en phases, continue aux frontières (vérifié : aucun saut de position d'une
  image à l'autre).

## Réglages qui marchent, à reprendre tels quels

| Geste | Réglage |
|---|---|
| Lumière isométrique | vecteur vers la lumière (-0,6 ; 0,2 ; 0,75) normalisé ; luminance `0,46 + 0,54 · clamp((n·L + 0,2) / 0,965)^0,8` : dessus 1, face gauche 0,73, face droite 0,46 |
| Bloc qui monte du sol | hauteur `h · outBack(1,3)` sur 0,45 s, en cascade de 0,25 s par station |
| Chute d'un objet sur un tapis | `inQuad` sur 0,35 s, puis `0,28 · |sin(2πp)| · (1 - p)²` sur 0,32 s pour le rebond |
| Saut d'une tâche vers sa case | `inOutCubic` sur 0,42 s, arc `+0,55 · sin(πp)`, rotation de 0 à -90° autour de x, puis 0,25 s vers l'or |
| Tête qui tourne | un tour lent par boucle plus un tour entier en `inOutCubic` pendant le tri : la somme reste entière, la boucle se referme |
| Grille qui se déploie | `scaleY` depuis le haut, `outExpo` 0,5 s, 0,045 s de décalage par colonne ; retrait en `inQuart` 0,45 s |
| Bloc qui glisse sur la grille | `inOutQuart` 0,7 s, depuis hors champ jusqu'à la ligne de colonne exacte |
| Barre de révélation | couvre 0,32 s puis découvre 0,32 s en `inOutQuart` ; sortie 0,25 s par phase |
| Lettre qui s'allume | couleur vers l'or en `outQuart` 0,25 s, `scale` 1 vers 1,16 vers 1 en bosse sur 0,3 s |
| Tampon d'un papier (12 i/s) | poses (échelle, y, rotation, hauteur) : (1,22 ; -34 ; +5° ; 1), (1,06 ; -8 ; +1,5° ; 0,4), (0,985 ; +2 ; -0,5° ; 0,1), (1 ; 0 ; 0 ; 0) |
| Soulèvement (12 i/s) | (1,04 ; -10 ; +1° ; 0,3), (1,14 ; -50 ; +4° ; 0,8), disparu |
| Ombre de papier | décalage (4 + 16h, 7 + 22h) px, flou 2,5 + 7h px, opacité 0,26 - 0,10h |
| Trait de stylo | ellipse tremblée de 72 points qui se recouvre sur 0,35 rad, `stroke-dashoffset` en `inOutSine` sur 0,75 s |
| Chute de la goutte | y en `inQuad` sur 0,95 s, traîne 55 + 140p au-dessus, rayon 70 vers 38 |
| Écrasement à l'impact | deux boules latérales `(±70e, +18)` de rayon `96e` avec `e = bosse` sur 0,4 s ; rayon principal `150 (1 + 0,08 rebond)` |
| Onde d'impact | rayon 150 vers 720 en `outQuart` sur 0,92 s, opacité 0,34 vers 0, jamais par-dessus la goutte |
| Division | trois boules du centre vers leurs cibles en `inOutCubic` 1,3 s, la grande s'efface en `smoothstep` sur 0,85 s |
| Fusion | retour en `inOutCubic` 1,35 s, la grande gonfle en `outQuart` (185 px) sur 0,75 s, couleur vers l'or en `smoothstep` 0,85 s, rebond `1 + 0,07 rebond` |

## Transformer chaque essai en bloc réutilisable

### `sceneIsometrique`

- **Entrées** : `stations[]` (boîtes : position, dimensions, couleur, instant de montée), `tapis[]` (de, à,
  vitesse, pas), `objets[]` (trajectoires paramétrées par t : sur tapis, chute, saut), `lumiere` (vecteur),
  `palette`, `unite` et origine, `etiquettes[]` (ancre au sol, texte, instant).
- **Sorties** : positions écran des ancres (`proj`), pour poser du texte HTML ou brancher un autre bloc.
- **À isoler** : `proj`, `solide`, `faces`, `ombre`, `coque`, `groupeOmbres`, `tourner`. C'est une petite
  bibliothèque d'isométrie sans dépendance, à mettre dans `_motion-lib/moteur/iso.js`. L'ordre des couches
  doit rester une liste explicite fournie par l'appelant, pas un tri automatique.

### `grilleSuisse`

- **Entrées** : `grille` (marge, gouttière, colonnes, rangs), `mots[]` (colonne, rang, empan, texte,
  couleur, poids, sens de la barre, instants d'entrée et de sortie), `blocs[]` (colonne, rang, empan,
  couleur, côté d'arrivée, instants), `lettres[]` (texte, instant d'allumage), `legendes[]`.
- **Sorties** : la taille de police retenue pour chaque mot (pour aligner un autre bloc dessus).
- **À isoler** : `cx`, `cy`, `lw`, `lh`, `mesurer`, `mot` (la barre en deux phases). La mesure doit rester
  une fonction idempotente appelée au premier `render`, jamais à chaque image.

### `collage`

- **Entrées** : `pieces[]` (largeur, hauteur, centre, rotation, couleur, contenu HTML, rubans, mode d'entrée
  et de sortie, instants, graine, amplitude de découpe), `cadence` (12 par défaut), `stylo` (chemin,
  couleur, instants) facultatif, `fibre` (opacité, graine).
- **Sorties** : `finEntree` par pièce.
- **À isoler** : `graine`, `decoupe`, `decoupeRond`, `q12`, `pose`, les tables de poses. La photo dessinée
  est un contenu comme un autre : le bloc ne sait rien d'elle.

### `transitionLiquide`

- **Entrées** : `phases[]` (une fonction d'état par phase, découpée en t), `couleurs` (départ, arrivée),
  `k` (rayon de fusion), `lumiere`, `etiquettes[]` (texte, boule suivie, instants), `onde` (oui ou non).
- **Sorties** : `etat(t)` (les quatre boules, la couleur, les étiquettes), pour qu'un autre bloc suive une
  goutte ou vienne s'y fondre.
- **À isoler** : le fragment shader tel quel (il ne connaît que quatre boules et une couleur), `etat` en
  module pur testable dans Node, `poserLabels`. À utiliser avec parcimonie : une transition par vidéo.

## Ce que je ferais différemment si Paul retient un de ces essais

- Isométrie : un vrai son mécanique (chaque piston, chaque tâche qui claque) calé sur les temps ; une
  variante « plan » vue de dessus qui bascule en isométrie par une rotation de caméra continue ; les
  bandes du tapis en biais et une petite lumière qui parcourt un câble entre l'usine et le tableau.
- Grille suisse : une version verticale (9:16) où les colonnes deviennent des rangs ; un second écran où
  la même grille reçoit une capture de l'application dans un empan de six colonnes.
- Collage : de vraies photos détourées (celles du tournage de Paul) à la place de la photo dessinée, avec
  la même découpe et la même ombre ; un léger « boil » de contour à 12 i/s, à montrer à part parce qu'il
  frôle ce que Paul refuse.
- Liquide : une lumière d'environnement (reflet d'une fenêtre) plutôt que deux points, et un bord
  réfractant le papier ; une version où la goutte finale devient le bouton « Commencer ».
