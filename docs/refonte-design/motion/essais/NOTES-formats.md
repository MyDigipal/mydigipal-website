# Notes du labo, famille « Formats et habillage » (lot 3)

Quatre essais écrits le 29/09/2026, sans bibliothèque et sans ouvrir de navigateur :
`sous-titres-dynamiques.html` (9:16, 10 s), `habillage-face-camera.html` (16:9, 12 s),
`carrousel-linkedin.html` (4:5, 12 s) et `logo-systeme.html` (16:9, 10 s). Tous respectent le
contrat du moteur (`window.STAGE`, `window.DUREE`, `window.render(t)` pur, `window.PRET` sur
`document.fonts.ready` après un `fonts.load` explicite de chaque graisse, `../lecteur.js` en
dernier). Une seule famille de polices par pièce, comme Paul l'a demandé après `transition-rythme` :
Bricolage Grotesque pour les sous-titres, Instrument Sans pour l'habillage, Fraunces pour le
carrousel, Sora pour le logo (la police de `particules-texte`, qu'il adore). La personne est une
silhouette tête-épaules en aplat, clairement un substitut : les vrais films la remplacent au montage.

Vérifiés hors navigateur par `scratchpad/verif-lot3.js` : `node --check` sur chaque script, les deux
shaders du logo passés à `glslangValidator` (profil ES 1.00), le contrat et les interdits relus par
expression régulière (aucun `requestAnimationFrame`, `Math.random`, `Date`, minuterie, animation
CSS, dégradé, liseré, tiret long, emoji, prix ni nombre de leçons ; une seule famille de polices ;
externes limités à Google Fonts), puis 601 ou 721 images rendues dans un DOM factice sans NaN, même
DOM pour un même t quel que soit l'ordre des appels, et boucle refermée. Deux outils neufs dans cette
sonde : un DOM factice **qui lit vraiment le HTML** (le logo lit `childNodes`, le carrousel des
identifiants générés, et tout `getElementById` sur un identifiant absent est signalé), et la
**mesure des largeurs avec les fichiers de police** (`fontes/telecharger-lot3.js` télécharge
l'instance statique que Google sert pour chaque graisse, `opentype.js` mesure, 5 % de marge parce
que l'instance statique est à l'opsz et à la chasse par défaut). Ce qui reste à juger à l'écran :
les largeurs réelles aux axes variables (opsz 144 de Fraunces, wdth de Bricolage), l'alignement au
pixel entre le mot en particules (canvas) et le vrai texte (DOM) du logo, le rendu des silhouettes,
et si la croissance des mots-clés du style B aide ou crie.

## Les sous-titres : une transcription, trois styles

- **Le tableau `MOTS` est la seule source de temps de parole** : `{ mot, debut, fin, style, groupe,
  cle }` pour dix-sept mots, comme le rendrait un outil de transcription à horodatage par mot. Les
  groupes (`GROUPES`) portent leur entrée et leur sortie ; les étiquettes de style ne servent qu'au
  labo. Pour brancher une vraie voix : remplacer le tableau, rien d'autre.
- **A, le mot dans un bloc** : bloc craie, mot dit sur une pastille or, texte en encre sur la
  pastille. La pastille passe au mot suivant par un fondu de trois images qui commence **au début du
  mot suivant** (`fin = suivant.debut`), jamais à la fin du mot courant : c'est ce qui évite le trou
  entre deux mots. Vérifié : 0 image à deux mots forts, 0 image sans pastille sur tout le groupe.
  Le bloc entre en montant (expo 0,40 s) et sort en descendant (cubique 0,16 s) quand le groupe
  suivant le remplace : c'est le seul « texte remplacé au même endroit » de la pièce, et il est
  accepté pour des sous-titres parce que chaque groupe entre proprement.
- **B, les mots-clés grossissent** : chaque mot arrive quand il est dit (opacité en trois images,
  échelle 1,18 vers 1 en expo 0,30 s) ; un mot-clé arrive à 1,45 et en chasse 80, se pose à 1 et
  100 en 0,42 s, en or et à 112 px contre 80. Deux axes pour un seul geste, comme le claquement du
  teaser vertical. Les mots occupent leur place dès le début (opacité 0), donc rien ne se recale
  quand un mot apparaît. Zone sûre vérifiée **à l'arrivée** (mot-clé à 1,3 : 853 px pour 900), pas
  seulement posé.
- **C, l'éditorial** : deux lignes, aucun bloc, ombre portée douce ; un mot passe de 55 à 100 %
  quand il est dit et y reste, donc la ligne s'éclaire de gauche à droite. C'est le seul style qui ne
  bouge pas pendant la parole : à comparer aux deux autres sur téléphone, muet.
- **Zone sûre** : tout entre x 90 et 990 (largeurs mesurées : 306 à 853 px) et entre y 300 et
  1444 (limite 260 à 1660). Les sous-titres sont posés sur le torse de la silhouette, là où le
  contraste est le meilleur ; si le vrai film cadre plus haut, remonter `#railA/B/C` ensemble.

## L'habillage : quatre gestes, une partition

- **`T` est la partition** : chaque geste part d'un `T.xxx`, aucun nombre n'est écrit dans
  `render`. La sonde vérifie l'ordre (bandeau, rangement, interface, annotation, effet, sortie,
  retour) et que le bandeau est rentré avant que la fenêtre se range.
- **Le bandeau** : le trait or se tire (expo 0,50 s), le nom monte de dessous par un
  `clip-path: inset()` plus 30 px de translation, le rôle descend de dessus trois images après. Pas
  de liseré vertical, pas de plaque : un trait horizontal et deux masques. **La sortie ramène chaque
  transformation exactement là où l'entrée la prend** (30 px, -14 px), sinon les deux bouts de la
  boucle diffèrent alors que rien n'est visible : c'est la sonde d'état visible qui l'a attrapé.
- **L'image dans l'image tient en une transformation** : `translate(1320k, 700k) scale(1 -> 0,2708)`
  avec l'origine en haut à gauche, coins qui s'arrondissent (80 px avant échelle, 22 px après),
  ombre dont l'opacité suit k. Aller et retour sont deux **arrivées**, donc tous deux en expo 0,65 s ;
  l'interface arrive deux images après la personne et s'en va avant elle.
- **L'annotation se lit dans l'ordre de la cause** : l'anneau se pose sur l'élément (échelle 1,6
  vers 1), le trait se tire de la bulle vers l'anneau, la bulle arrive en dernier. La longueur du
  trait est calculée depuis ses coordonnées (`Math.hypot`), jamais mesurée dans la page. Et **ce
  qu'on montre a un effet** : 1,35 s après la bulle, la pastille « En retard » devient « Relancée »
  dans l'interface. Sans cet effet, la bulle est une décoration.
- L'interface ne contient aucun montant : des clients, des échéances, des états. L'anneau vise le
  centre exact de la bascule (1052, 381), qui se déduit de la position de `#ui` et de `#bascule` :
  déplacer l'un oblige à déplacer l'autre, c'est le point à surveiller si la maquette change.

## Le carrousel : une glisse d'un bloc, sur un temps modulaire

- **Les deux cartes glissent ensemble** : `sortant.x = off`, `entrant.x = 900 + off`, un seul
  `off`. Anticipation de 34 px vers la droite pendant 0,14 s (quatre images), puis expo 0,55 s : à
  3,25 s les deux cartes sont à -861 et +39, écart 900 exactement. La carte qui a fini de sortir
  est cachée comme celle qui attend (x à -900 comme à +900), sinon quatre cartes « visibles ».
- **Le temps est modulaire** : `u = ((t + 0,14) mod 3) - 0,14`, `entrant = floor((t + 0,14) / 3)
  mod 4`, et le contenu de chaque carte vit à son temps local `((t - 3j) mod 12)`. À t = 0 la
  carte 4 est posée et la carte 1 attend à 900 ; à t = 12 exactement la même chose, sans coupe :
  la reprise est un glissement ordinaire.
- **Chaque scène explique la tâche** en 1,5 s après le titre : anneau, coche tracée (longueurs
  calculées) et pastille qui change ; transcription qui se replie (`scale(x 1)` par ligne, 2 images
  de décalage) pendant que trois décisions se cochent ; six messages qui passent d'une pile à deux
  colonnes (positions interpolées, 2 images de décalage dans l'ordre de lecture) ; quatre barres qui
  montent (3 images de décalage) et un repère sur la plus haute.
- **La progression est la seule courbe linéaire** de la pièce (une barre de progression, admise par
  la recherche). Les traits s'effacent sur les 0,4 dernières secondes et reviennent sur les 0,3
  premières, donc même état aux deux bouts.
- Titres à 80 px et non 84 : à 84, « Résumer la réunion » faisait 799 px pour 772. Et « hebdo,
  chiffres inclus. » (890 px) est devenu « hebdo du lundi. ». La mesure a tranché avant l'écran.

## Le logo : quatre versions, une grammaire

- **La grammaire** : le mot se forme de gauche à droite en courbe A, un trait or le confirme, il
  tient. Complète : les particules s'assemblent avec `depart = 0,7 + 0,9 xn` (xn = position dans le
  mot), la lumière balaie, le vrai texte se pose (2,65 s) et les particules s'effacent (3,0 s),
  trait à 3,15. Courte : neuf lettres montent de leur masque, 0,045 s l'une après l'autre, trait à
  4,55. Micro : le point se pose (6,05) puis le mot part du point vers la droite (6,20). Fixe : le
  repos, trait déjà tiré. La sonde vérifie que chaque version forme, confirme et tient avant sa
  coupe.
- **Le vrai texte se pose sur les particules** : même police, même corps (Sora 800, 220 px), même
  centre (960, 500), `textBaseline: middle` d'un côté et `line-height` égal au corps de l'autre.
  Le fondu croisé absorbe un écart d'un ou deux pixels ; au-delà il se verra, c'est la première
  chose à regarder à l'écran.
- **Noir aux deux bouts** : `#noir` s'ouvre en 0,35 s au départ et se referme en 0,30 s à la fin,
  donc le montage en boucle est propre malgré les trois coupes franches entre versions.
- Le WebGL est en `premultipliedAlpha` sur un canvas transparent posé sur le fond encre, avec un
  repli DOM si le contexte manque (le vrai texte apparaît seul).

## Ce que j'ai appris

- **`(-2e-16).toFixed(2)` donne « -0.00 »** : un sinus de période DUREE ou un `off` qui tend vers
  zéro écrivent une valeur différente aux deux bouts de la boucle sans qu'on le voie. Arrondir avant
  (`Math.round(v * 100) / 100`) ramène à -0, que `toFixed` écrit « 0.00 ».
- **Les deux bouts se comparent sur l'état visible, pas sur le DOM.** Un bloc à opacité 0 peut
  porter une transformation différente à t = 0 et à t = D. La sonde `photoVisible` remplace tout
  sous-arbre invisible (opacité 0, `visibility: hidden`) par un marqueur ; mais un `clip-path` à
  100 % n'est pas reconnu comme invisible, d'où la règle « la sortie ramène là où l'entrée prend ».
- **Dans un contexte `vm`, un `const` de haut niveau n'est pas une propriété de `window`.** Les
  essais exposent `window.LABO = { ... }` pour la sonde ; c'est inoffensif dans le navigateur.
- **`querySelector` n'existe pas dans un DOM factice** : le contenu des cartes porte des
  identifiants (`q0`, `t0a`, `t0b`, `b0`). Plus robuste aussi dans le vrai navigateur.
- **Google sert des instances statiques par graisse à un client sans fontes variables** :
  `family=Fraunces:wght@600` avec un `User-Agent: curl` donne un TTF SemiBold mesurable par
  `opentype.js`. Dix fichiers de 45 à 80 Ko, dans `scratchpad/fontes/`.
- **Un double antislash dans une commande Bash arrive simple**, même dans un heredoc quoté : la
  retouche d'une expression régulière est passée par l'outil Edit, comme la règle le dit.

## Transformer chaque essai en bloc réutilisable

- **`sousTitres`** : entrées `transcription[]` (mot, début, fin, groupe, clé), `style` (A, B ou C),
  `zone` (x, y, largeur), jetons de couleur ; sortie `GEOM` des groupes. À isoler : `presence()`,
  la règle de la pastille (`fin = suivant.debut`), le calcul de largeur par mot pour la zone sûre.
- **`bandeauNom`** : entrées `nom`, `role`, position, temps d'entrée et de sortie ; le trait, les
  deux masques et la règle « sortie = entrée à l'envers, même amplitude ».
- **`imageDansImage`** : entrées le coin et l'échelle d'arrivée, la durée ; sortie `k(t)` et la
  boîte à l'instant t, pour qu'un autre bloc (l'interface, la bulle) s'y accroche.
- **`annotation`** : entrées la cible (cx, cy, r), la position de la bulle, le texte ; longueur du
  trait calculée ; ordre anneau, trait, bulle ; sortie inverse. Et un `effet` optionnel : ce que
  la cible fait après.
- **`carrousel`** : entrées `cartes[]` (moment, titre en lignes, corps, scène), `par` (secondes par
  carte), `recul`, `glisse` ; sorties `etatPile(t)` et `local(t, j)`. Les scènes sont des blocs à
  part, appelés avec le temps local.
- **`logoSysteme`** : entrées `version` (complète, courte, micro, fixe), corps, place ; le nuage de
  cibles échantillonné sur le mot ; sortie la boîte du lockup. Le vrai fichier de logo, quand il
  existera, se pose en dernière image à la place du texte, exactement comme le texte se pose sur les
  particules ici.

## Ce que je ferais différemment si Paul retient un de ces essais

- Sous-titres : brancher une vraie transcription (Whisper à horodatage par mot) d'une prise de
  Paul, et comparer les trois styles sur la même phrase dite à son débit réel (185 mots par minute),
  bien plus vif que les 120 de l'exemple.
- Habillage : remplacer la silhouette par un vrai film et la maquette d'interface par une capture
  réelle de l'espace, et faire pointer la bulle sur un élément qui a un vrai effet (la caméra qui
  tient de `demo-interface` peut prendre la place de l'image fixe).
- Carrousel : rendre aussi les quatre cartes en images fixes (dernière image de chaque fenêtre)
  pour un carrousel PDF LinkedIn, avec le même code ; et vérifier les spécifications de la régie le
  jour de la campagne.
- Logo : poser le vrai fichier de logo en dernière image, et mesurer l'écart canvas-DOM à l'écran
  avant d'en faire un bloc.
