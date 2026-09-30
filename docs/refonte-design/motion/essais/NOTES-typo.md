# Notes du labo, famille « Typographie et 2D »

Trois essais, écrits le 29/09/2026, sans bibliothèque : `titre-cinetique.html`, `morph-formes.html`,
`tableau-chiffres.html`. Tous respectent le contrat du moteur (`window.STAGE`, `window.DUREE`,
`window.render(t)` pur, `window.PRET` pour les polices, `../lecteur.js` en dernier). Vérifiés hors
navigateur : `node --check` sur chaque script, puis exécution dans un DOM factice image par image
(aucun NaN, même état pour un même t quel que soit l'ordre des appels, état vide à t = 0 et à t = DUREE).
Scripts de contrôle dans le scratchpad de la session : `verif-essais.js` et `sonde-essais.js`. Ce qui
reste à juger à l'écran : la lisibilité réelle des polices, les largeurs de ligne et le rendu 3D des volets.

## Ce que j'ai appris

- **Une fonction d'easing par intention, jamais « ease » générique.** Le dépassement se règle avec
  `outBack(s)` : s = 1,3 donne 6 % de dépassement (une lettre qui se pose), s = 1,7 en donne 10 % (un
  objet qui arrive), s = 2,2 en donne 15 % (une chasse ou une échelle qui « claque »). L'anticipation
  se règle avec `inBack(s)` : s = 1,2 recule de 5 % avant de partir, c'est assez pour l'œil, au-delà ça
  fait cartoon.
- **Le rebond ne doit jamais commencer ni finir avec un saut.** `rebond(p) = sin(3πp)·(1-p)²` vaut 0
  aux deux bouts et s'amortit tout seul ; il se compose donc avec n'importe quelle autre échelle. Le
  premier lobe est négatif sur x et positif sur y : la forme s'écrase d'abord contre son arrêt, puis
  se redresse. Une amplitude de 0,13 suffit.
- **L'étirement selon la vitesse se calcule, il ne se pose pas à la main.** Une différence finie sur
  `positionX(t ± 0,016)` donne la vitesse sans aucun état ; `sx = 1 + min(0,32, |v| / 5500)` et
  `sy = 1 / sx` conservent le volume. Vitesse de pointe mesurée sur l'essai : 1 660 px/s.
- **Un `inOutQuart` pour un déplacement, un `inOutCubic` pour une transformation de forme.** Le quart
  donne un départ franc et un arrêt net (le rail), le cubique laisse voir les états intermédiaires
  du morphing. Un `inOutExpo` pour une recomposition de mise en page : rapide au milieu, l'œil ne
  voit que les deux états stables.
- **La chute d'un volet, c'est `p^1,75`.** Plus doux que `inCubic`, plus mécanique que `inQuad`.
  Pas de rebond à l'arrivée : l'arrêt net, c'est ce qui fait « claquer ». Le rythme vient de trois
  couches : 0,085 s par bascule (0,11 s pour les gros volets), 0,045 s de décalage par colonne, et
  une gigue déterministe de 0 à 0,03 s par volet calculée par un hachage de sa position (jamais
  `Math.random`). Sans la gigue, le tableau paraît synthétique.
- **Le morphing propre tient en trois règles** : même sens de parcours pour tous les contours (aire
  signée normalisée), même nombre de points à égale distance le long du contour (ré-échantillonnage
  par longueur d'arc), et un décalage du point de départ choisi par moindres carrés (`aligner`). Les
  congés (`arrondir`) se calculent sur le polygone brut avant l'échantillonnage, avec un rayon par
  sommet, sinon la queue de la bulle devient une patate. Un trou ne se morphe pas : le trou de
  l'engrenage est un disque à part, dans la couleur du fond, qui grandit avec `outBack(1,5)` sur la
  seconde moitié de la transformation.
- **La révélation par masque doit prévoir le dépassement dans le padding du masque.** Padding haut de
  0,2 em pour un dépassement de 6 %, padding bas de 0,2 em pour les descendantes. Une lettre cachée
  se pose à `translateY(120 %)`, pas 100 : avec l'interlignage à 1, le haut du glyphe affleure sinon.
- **Une police variable s'anime par `font-variation-settings` lettre par lettre**, et il faut vérifier
  que les valeurs posées restent dans les axes déclarés (ici 52 à 140 pour 50..150). La chasse qui
  dépasse de 15 % puis revient fait « respirer » l'arrivée bien plus que l'échelle. Entrée large et
  fine qui se resserre en s'épaississant pour la première phrase, entrée étroite qui s'ouvre pour
  la seconde : deux gestes, deux intentions, sans changer d'outil.
- **Le suivi d'interlettrage se pose en `margin-right` sur chaque lettre sauf la dernière**, pas en
  `letter-spacing` : Chrome ajoute l'espace après la dernière lettre et le centrage se décale.
- **Bouclage : il suffit que tout ce qui est visible soit identique à t = 0 et t = DUREE.** Les
  lettres sous le masque, un disque à l'échelle 0 ou un rail à `dashoffset` hors trait peuvent
  garder des valeurs internes différentes. En revanche une couleur de fond doit revenir à sa valeur de
  départ pendant la sortie, sinon la boucle saute.

## Réglages qui marchent, à reprendre tels quels

| Geste | Réglage |
|---|---|
| Lettre qui monte du masque | `y = 120 → 0 %` avec `outBack(1,3)`, 0,9 à 1,05 s, décalage 0,04 à 0,055 s par lettre |
| Chasse qui se pose | `outBack(2,2)` de la chasse de départ vers 100 |
| Graisse qui arrive | `outExpo` de 200 vers 800 |
| Lettre qui sort | `y = 0 → 135 %` avec `inBack(1,2)`, 0,45 à 0,5 s, décalage 0,012 à 0,03 s |
| Mot qui prend l'accent | échelle 1 → 1,16 `outBack(2,0)`, origine en bas à gauche, couleur en `outQuint`, 0,6 s |
| Recomposition de bloc | échelle et couleur en `inOutExpo`, 0,7 s |
| Aplat qui monte | `scaleY` origine en bas, `inOutQuart`, 0,5 s ; sortie par le haut avec origine en haut |
| Rail qui se trace | `stroke-dashoffset = L·(1-p)`, `outExpo`, 0,85 s ; retrait par la gauche avec `- L·q` |
| Déplacement de station | `inOutQuart`, 1,3 s pour 560 px |
| Morphing de contour | `inOutCubic`, 1,3 s, ondulation radiale de 9 px en `sin(πp)` |
| Arrivée d'objet | `rebond(p)` sur 0,7 s, amplitude 0,13 |
| Rotation qui retombe droite | angle = 360 · `inOutSine` sur toute la fenêtre voyage + station |
| Bascule d'un volet | `rotateX(-180° · p^1,75)`, 0,085 s (0,11 s en gros), ombre `0,55·r` devant, `0,35·sin(πr)` sur le bas |

## Transformer chaque essai en bloc réutilisable

### `TitreCinetique`

- **Entrées** : `lignes` (tableau de phrases, chacune avec ses lignes et un mot d'accent facultatif),
  `police` (famille, axes disponibles et bornes), `palette` (fond, encre, accent), `boite` (x, y,
  taille, alignement gauche ou centre), `gestes` par phrase (`large-vers-normal` ou
  `etroit-vers-normal`), `t0`, `tenue`, et un drapeau `recomposer` (la phrase précédente se range en
  petit en haut à gauche au lieu de sortir).
- **Sorties** : `fin` (instant où la dernière lettre est sortie, pour enchaîner), `boite` occupée
  (pour poser autre chose à côté), et la liste des lettres (pour un motion blur directionnel si on
  veut aller plus loin).
- **À isoler** : `eclater()` (découpe en lettres, gère les spans imbriqués), `etatEntree()`,
  `etatSortie()`, `groupe()` et la fonction `apres` qui permet toute modification après la pose.

### `FormeQuiVoyage`

- **Entrées** : `formes` (liste de contours : générateurs ou chemins SVG à ré-échantillonner),
  `stations` (x, étiquette, couleur de disque, couleur de fond), `rayonDisque`, `vitesseEtirement`,
  `rebond` (amplitude et durée), `trou` (rayon par station, 0 pour aucun), `titre` facultatif.
- **Sorties** : `positionX(t)` et la couleur courante (pour qu'un autre bloc suive la forme, par
  exemple une étiquette qui l'accompagne), `fin`.
- **À isoler** : `arrondir()`, `orienter()`, `reechantillonner()`, `aligner()`, `melange()`. Ces
  cinq fonctions forment une petite bibliothèque de morphing sans dépendance, à mettre dans
  `_motion-lib/` en fichier à part quand un second essai en aura besoin. Pour lire un vrai chemin
  SVG (`d`), remplacer `arrondir` par `getPointAtLength` sur un `<path>` hors écran : c'est
  déterministe aussi.

### `TableauPalettes`

- **Entrées** : `lignes` (gros caractères et texte), `alphabets` (un par type de cellule, l'ordre
  des caractères fait le nombre de bascules), `maxBascules`, `geometrie` (tailles des cellules,
  colonnes de texte, pas), `palette` (fond, volet, encre, volet d'unité), `rythme` (durée de
  bascule, pas par colonne, gigue), `depart` par ligne, `sortie` (instant et pas de la vague).
- **Sorties** : `finEntree` par ligne (pour caler une voix ou un autre bloc sur le moment où une
  ligne devient lisible), `finSortie`.
- **À isoler** : `suiteEntree()`, `suiteSortie()`, `gigue()`, `etat()` et `poser()`. `etat()` ne
  touche pas au DOM : c'est ce qui permet de tester le rythme en Node avant d'ouvrir un navigateur,
  comme l'a fait `sonde-essais.js`.

## Ce que je ferais différemment si Paul retient un de ces essais

- Titre cinétique : essayer aussi Roboto Flex (chasse de 25 à 151, plus violente) et Bricolage
  Grotesque (plus de caractère, chasse limitée à 75..100). Ajouter le flou de mouvement directionnel
  de la v3 sur les lettres pendant leur montée.
- Morphing : un quatrième contour (un document, une enveloppe) pour raconter un cas précis, et une
  version verticale où le rail devient une colonne.
- Tableau : une prise de son de vrais volets pour le montage ; à l'image, le rythme est déjà là.
