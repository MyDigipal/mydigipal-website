# Notes du labo, famille « Explorations » (lot 3)

Cinq essais écrits le 29/09/2026 sans ouvrir de navigateur, chacun dans une direction qui n'existait
pas encore au labo : `trait-continu.html` (dessin au trait unique), `avant-apres.html` (écran partagé
à volet), `donnees-vivantes.html` (tableau de bord qui raconte), `risographie.html` (affiche imprimée
en trois encres), `renard-guide.html` (personnage animé). Tous respectent le contrat du moteur
(`window.STAGE`, `window.DUREE` et son alias `window.DUR`, `window.render(t)` pur, `window.PRET` avec
un `#prechargeur`, `../lecteur.js` en dernier). Aucune bibliothèque : tout est écrit à la main, y
compris le cycle de marche et les trames. Une seule famille de polices par pièce (Fraunces, Manrope,
IBM Plex Sans, Archivo, Fraunces).

Vérifiés hors navigateur par `scratchpad/verif-explorations.js` (nom distinct de `verif-lot3.js`, qui
appartient aux séquences du même lot et l'a écrasé une fois) : `node --check` sur chaque script, le
contrat et les interdits relus par expression régulière (aucun `requestAnimationFrame`, `Math.random`,
`Date`, minuterie, animation CSS, mesure dépendant du rendu, tiret long, emoji, prix, nombre de leçons,
liseré à gauche, look nuit ; externes limités à Google Fonts ; une seule famille par page), puis 480 à
600 images rendues dans un DOM factice sans NaN, même DOM pour un même t quel que soit l'ordre des
appels, boucle refermée sur ce qui est visible (rien à t = 0 ni à t = DUREE), et des sondes propres :
continuité de la plume, des cartes et du renard d'une image à l'autre, clac du calage riso à l'instant
prévu, barres et courbes comptées, pourcentages relus dans le DOM. Les largeurs de texte ont été
mesurées avec les fontes que Google sert (`fontes/mesurer-lot3.js`, opentype.js) : c'est ce qui a
donné la taille du titre riso (112 px, la fonte servie pour Archivo étendue 800 est une instance
statique, donc la mesure est exacte) et la largeur de la bulle du trait continu (370 px).

Ce qui reste à juger à l'écran : la lisibilité de la coche terre cuite sur papier, le poids visuel
de la pile de cartes, le vert du bleu-sur-jaune en multiplication, les proportions du renard (la tête
et les oreilles sont posées au jugé), et si les compteurs des tuiles du tableau de bord gênent.

## Ce que j'ai appris

- **Un trait continu, c'est une polyligne et deux nombres.** Le chemin est construit une fois par
  `pt`, `arc` (échantillonné au pas de 5 px) et `quad` (40 points) ; les longueurs cumulées sont sommées
  en JavaScript, et l'avancée est `stroke-dasharray="visible reste" stroke-dashoffset="-début"`. Un
  dashoffset négatif fait commencer la partie visible à une longueur donnée, ce qui permet d'effacer
  **par la queue** (le début avance vers la fin) sans toucher au tracé. Aucun `getTotalLength` : la
  longueur d'une polyligne est celle de ses segments, et le navigateur la calcule pareil.
- **Une seule ligne pour deux couleurs : deux polylignes sur le même chemin.** L'encre porte les points
  jusqu'au début de la coche, l'accent porte la suite ; chacune a son dash, et la coupure tombe sur
  un point commun. La plume (un cercle) suit la position à la longueur `b` par recherche binaire dans
  les longueurs cumulées, et change de couleur en passant ce point.
- **Un dash de longueur nulle avec `stroke-linecap: round` dessine un point.** Il faut cacher la
  polyligne (`opacity 0`) tant que la partie visible fait moins d'un pixel, sinon un point d'encre
  apparaît au départ du trait avant même qu'il commence.
- **Pour qu'une ligne « entre » dans un cercle, on y arrive par la tangente.** Après la coche, une
  courbe quadratique dont la tangente d'arrivée est celle du cercle en ce point (angle -60°, contrôle
  à 40 px en arrière le long de la tangente), puis le tour complet. Le premier essai visait le sommet
  du cercle et ressortait de 10 px avant d'y entrer : une bosse visible. Vérifier que la courbe
  reste dans le disque se fait à la main sur le point milieu.
- **Un écran partagé, c'est deux scènes complètes et un `clip-path`.** Les deux couches dessinent la
  même journée sur la même ligne des heures ; la couche « avec » est découpée par
  `inset(0 0 0 Xpx)` et le volet est dessiné à X. Faire glisser X révèle la même matinée dans l'autre
  état : c'est la révélation qui raconte, pas le curseur. Les étiquettes « Sans agent » et « Avec un
  agent » sont accrochées au volet, pas aux couches, sinon elles se coupent.
- **Une pointe de vitesse se calcule avant de choisir la courbe.** Un aller en `inOutCubic` a une
  pointe à 3 fois la vitesse moyenne ; en `inOutSine`, 1,57 fois. Une carte qui vole 930 px en
  0,78 s en cubique passait 120 px par image à 30 i/s : une téléportation. La sonde « aucun
  déplacement de plus de 45 px par image à 60 i/s » l'a vue avant l'écran. La durée du vol suit la
  distance (`0,55 + 0,35 · d / 1000`), donc la carte du fond ne fonce pas plus que celle de devant.
- **Des onglets qui se multiplient, c'est une largeur continue.** Le nombre d'onglets `n` est
  fractionnaire (`2 + 2 · Σ seg(t, ti, ti + 0,3)`), chaque onglet a une présence `q_k = seg(n, k, k+1)`,
  sa largeur est `w · q_k` avec `w = (1560 - 6 (⌈n⌉ - 1)) / n` : les neufs poussent pendant que les
  autres se serrent, la somme des largeurs reste dans la barre, et rien ne saute.
- **Un compteur qui vient d'une table ne ment jamais.** Le bilan « 2 h 40 » est la somme des minutes
  écrites sur les cartes, les tuiles du tableau de bord sont des sommes cumulées jusqu'au jour
  fractionnaire, les pourcentages du diagnostic (+60 %, -56 %, +34 %) sont calculés depuis les
  séries et écrits dans le DOM à la construction. Changer une donnée change le texte. C'est la règle
  « un fait chiffré, une source », appliquée à des chiffres d'exemple.
- **Une courbe qui se construit, c'est une polyligne coupée à un jour fractionnaire.** Les points
  jusqu'à `⌊d⌋`, puis un point interpolé entre `⌊d⌋` et `⌊d⌋ + 1` ; un disque blanc cerclé marque la
  tête. Les barres montent chacune en `outQuart(seg(d, i-1, i))`. Aucun dash : la géométrie suit t.
- **La risographie tient en trois règles** : encres en `mix-blend-mode: multiply`, décalage de
  repérage **fixe** par couche (le rose +4/-3, le jaune -3/+3), et trames de points calculées **une
  fois** (grille hexagonale inclinée de 15°, rayon fonction de la position). Le bleu sur jaune donne un
  vert, le rose sur bleu un violet, sans rien peindre. La fibre du papier est un `feTurbulence` à
  graine fixe, appliqué une fois : identique à chaque image, donc aucun crépitement. La sonde
  vérifie que la chaîne SVG de la trame bleue est la même à 2 s et à 5 s.
- **Le calage d'une couche, c'est un dépassement de 9 px et un saut.** La couche arrive en
  `outExpo`, s'arrête 9 px trop loin dans son sens d'arrivée, et 70 ms plus tard passe à sa place en
  une image. C'est le clac de la presse. La direction d'arrivée est déduite du vecteur « d'où elle
  vient », donc la même fonction sert au bleu (par la gauche), au rose (par la droite), au jaune
  (par le haut) et aux trois lignes du titre.
- **Le cycle de marche se calcule depuis la distance, jamais depuis le temps.** `φ = 2π · distance /
  120 px` : les pattes font une foulée tous les 120 px quelle que soit la vitesse, donc elles ne
  glissent pas, et le trot de sortie (plus rapide) accélère les pattes tout seul. Paires diagonales
  (avant gauche avec arrière droite), amplitude 26°, bob du corps `3 · (1 - cos 2φ) / 2`, queue à
  `8 · sin(φ + π/2)`.
- **Le saut est une parabole dont on dérive la tangente.** `y = sol - 4 H q (1 - q)` avec `H = 120`,
  la vitesse `(dx, dy/dq)` donne l'angle du corps (`0,55 · atan2`). Ce qui manquait au premier
  passage : entre l'atterrissage et la marche suivante, la position retombait sur la fin de la marche
  précédente (le renard revenait 230 px en arrière pendant 0,2 s). Les segments se relisent
  maintenant dans l'ordre du temps, chacun pose l'état à partir de son début et le suivant le
  remplace ; un saut fini laisse le renard là où il est tombé. La sonde « aucun saut de plus de 25 px
  entre deux images » l'a attrapé.
- **Une rotation aussi doit être continue.** Le museau qui se levait au décollage en `outQuart` sur
  0,1 s faisait 19° dès la première image ; en `inOutSine` sur 0,12 s, 7° au plus. Une sonde sur
  l'écart de rotation entre images vaut celle sur la position.
- **Anticipation, étirement, écrasement, ressort : quatre nombres.** Accroupi `sx 1,10 / sy 0,84` en
  `inQuad` sur 0,25 s avec un recul de 10 px ; étirement au décollage `sx 0,90 / sy 1,14` en bosse
  sur 0,24 s ; écrasement à l'arrivée `sx 1,16 / sy 0,82` puis retour par le ressort analytique
  (ζ 0,5, ω 16) ; pattes tendues en l'air (avant -34°, arrière +34°) en `outQuart` sur 0,12 s. Tout à
  l'origine des pieds, donc l'écrasement ne décolle pas du sol.
- **Le premier et le dernier palier sortent du cadre.** Sinon le renard entre en marchant dans le
  vide avant la première ligne, et s'arrête au bord du dernier au lieu de continuer.

## Réglages qui marchent, à reprendre tels quels

| Geste | Réglage |
|---|---|
| Trait qui se dessine | longueur par objet, `inOutSine` sur chaque tronçon (le bout ralentit à chaque fin d'objet), 5 300 px en 5,8 s |
| Trait qui s'efface | début `a = L · inOutCubic` sur 1,1 s, bout fixé à L ; mot retiré quand `a` dépasse le début de son objet (+320 px de marge) |
| Plume | cercle r 6,5 au bout du trait, `seg(0,25 ; 0,4)` à l'entrée, sortie sur 0,3 s ; couleur de l'accent dès que `b` passe la coche |
| Lavis du cercle | disque de l'accent à 13 % qui grandit en `outExpo` 0,6 s une fois le tour fermé |
| Volet avant/après | `inset(0 0 0 Xpx)`, X de 960 à 480 en `inOutCubic` 1,2 s ; ligne 3 px, poignée r 28, chevrons |
| Journée | 9 h à 18 h en 5 s linéaire ; aiguilles `h/12 · 360 - 90` et `(h·60 mod 60)/60 · 360 - 90` |
| Carte qui apparaît | `outQuart` 0,3 s, monte de 16 px |
| Carte vers la pile | `inOutSine`, durée `0,55 + 0,35 · d/1000`, arc `-70 · bosse`, décalage de pile `(7 i, -9 i)`, rotation propre ±2,5 à 4° |
| Carte absorbée | y de 380 à 552 en `inCubic` 0,5 s, `scale(0,75 ; 0,30)`, opacité coupée sur les 30 derniers % ; impulsion du rail `rx 40 + 50 · bosse` sur 0,45 s ; paquet en `inOutCubic` 0,45 s |
| Onglets | largeur continue (voir plus haut), titre gris de 6 px, `min(90, w - 40)` |
| Barre de tableau de bord | `outQuart(seg(d, i-1, i))`, largeur 20 sur un pas de 34,7 |
| Relecture par l'IA | faisceau de 52 px en dégradé, du jour 1 au jour 20 en 0,5 s linéaire |
| Anneaux de détection | deux anneaux r 8 vers 42 en `outQuart` 0,8 s, décalés de 0,35 s, opacité 0,8 vers 0 |
| Bouton pressé | `scale(1 - 0,06 · bosse)` sur 0,2 s, classe `ok` à mi-course, coche en dash sur 0,3 s |
| Couche riso | arrivée `outExpo` 0,6 à 0,7 s, dépassement 9 px, calage 70 ms après, retrait `inCubic` 0,35 à 0,45 s à 1,6 fois la distance |
| Trame de boule | pas 13 px, grille hexagonale à 15°, rayon `1,4 + 5,4 · clamp(0,5 + 0,42 (x + y) + 0,25 d²)` |
| Trame de sol | pas 13 px à -15°, rayon `1,2 + 5,2 · v²` (v de haut en bas) |
| Trame de halo | pas 12 px, rayon `5,6 (1 - d)² + 0,8` |
| Marche | `φ = 2π · dist / 120`, pattes ±26°, bob 3 px, freinage linéaire sur les 20 derniers % |
| Regard | tête -22° et oreilles ×1,12 en `outExpo` 0,25 s, retour en `inQuad` 0,25 s à l'anticipation |
| Clin d'oeil | `ry = 3,4 · (1 - bosse)` sur 0,14 s |
| Saut | parabole H 120, 0,5 s, corps à `0,55 · atan2` en `inOutSine` 0,12 s au départ, retour à 0 en `inOutSine` 0,16 s à l'arrivée |
| Ombre au sol | `rx 50 · sx · (1 - 0,45 h)`, opacité `0,18 (1 - 0,7 h)`, h = hauteur / 150 |

## Transformer chaque essai en bloc réutilisable

### `traitContinu`

- **Entrées** : `chemin` (liste d'ordres `pt`, `arc`, `quad`, `marque`), `tronçons[]` (repère, instant de
  fin), `accent` (repère où la couleur change), `mots[]` (élément, instant d'entrée, repère qui le
  retire), `effacement` (début, fin), `plume` (oui ou non).
- **Sorties** : `pos(longueur)` pour poser autre chose au bout du trait.
- **À isoler** : `pt`, `arc`, `quad`, les longueurs cumulées, `pos` (recherche binaire), `dash`. Le
  dessin lui-même est une liste d'ordres : un autre sujet, c'est une autre liste.

### `ecranPartage`

- **Entrées** : deux fonctions de couche `avant(t)` et `apres(t)` qui dessinent la même scène, `volet`
  (clés de position), `etiquettes` (gauche, droite), `dessus(t)` pour ce qui est commun.
- **Sorties** : X du volet, pour y accrocher autre chose.
- **À isoler** : le `clip-path`, le volet et ses étiquettes. Le contenu des couches ne le regarde pas.

### `grapheVivant`

- **Entrées** : `series[]` (valeurs, couleur, barres ou courbe), `jour(t)`, `cadre` (marges, échelle),
  `evenements[]` (bande, anneaux, trait, avec leurs instants), `tuiles[]` (fonction de somme).
- **Sorties** : `xJ`, `yV` pour poser des panneaux au bon endroit.
- **À isoler** : `courbe` (polyligne coupée au jour fractionnaire), `cumul`, `nombre` (milliers en
  espace fine), les axes. Les panneaux de texte restent du HTML autour.

### `presseRiso`

- **Entrées** : `couches[]` (élément, repérage, d'où, instants d'arrivée et de retrait), `depassement`
  (9 px), `delaiCalage` (70 ms), `trames[]` (forme, pas, angle, fonction de rayon, couleur).
- **Sorties** : rien, c'est une fin de chaîne.
- **À isoler** : `trameDisque`, `trameRect` (à générer une fois), la fonction de passage sous la presse.

### `personnage` (le renard)

- **Entrées** : `partition` (marches, sauts, regards, clins, arrêts avec battements de queue),
  `paliers[]`, `stride`, les quatre nombres de squash.
- **Sorties** : `etat(t)` (position, hauteur, échelle, angles), pour que la caméra ou une étiquette le
  suive.
- **À isoler** : `position` (relecture ordonnée des segments), `etat`, `renard` (le dessin), `patte`,
  `oreille`. Un autre personnage remplace `renard` seul.

## Ce que je ferais différemment si Paul retient un de ces essais

- Trait continu : un vrai son de plume (frottement dont le volume suit la vitesse du bout) et un
  léger tremblé de main (bruit à graine fixe le long du chemin, calculé une fois) ; une version où le
  trait dessine l'interface de l'Academy à la place des pictogrammes.
- Avant / après : les vraies captures de l'Academy dans la couche « avec » (le rail devient l'agent
  de la formation), et le volet piloté par la voix (« et maintenant, la même journée »).
- Données vivantes : les données d'un vrai compte client anonymisé, le faisceau remplacé par une
  fenêtre de lecture qui laisse une trace, et le résultat final posé comme une carte à part.
- Risographie : une déclinaison verticale (9:16) qui est le format naturel de l'affiche, et une
  quatrième encre (le noir) réservée au titre pour tester le contraste.
- Renard : le faire monter sur les vrais rangs du rail de la page de vente, avec la silhouette de
  face aux arrêts (celle de `renardPoints`), et un cycle d'assis pour la fin.
