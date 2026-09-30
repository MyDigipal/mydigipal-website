# Notes du labo, famille « Séquences » (lot 3)

Quatre séquences écrites le 29/09/2026 sans ouvrir de navigateur, à partir des essais que Paul a
retenus (la caméra qui tient, la carte de verre, l'isométrie, le morphing, les particules en
lettres) et de ses règles (AVIS-PAUL.md) : le mouvement explique, courbe A nette, jamais de flou
sur ce qu'on lit, une seule famille de polices par pièce, pas le bleu du bumper. Toutes respectent
le contrat du moteur (`window.STAGE`, `window.DUREE` et son alias `window.DUR`, `window.render(t)`
pur, `window.PRET` avec un `#prechargeur` pour ce qui se dessine en Canvas, `../lecteur.js` en
dernier). `visite-academy.html` (16 s), `carte-verre-recit.html` (12 s, Three r128),
`process-iso.html` (14 s), `bumper-v2.html` (6 s, son).

Vérifiées hors navigateur par `scratchpad/verif-lot3.js` : `node --check` sur chaque script,
contrat et interdits relus (aucun `requestAnimationFrame`, `Math.random`, `Date`, minuterie dans la
partie image, animation CSS, tiret long, emoji, prix, nombre de leçons, liseré coloré sur un
encadré ; externes limités à Google Fonts et cdnjs avec version exacte), puis 361 à 961 images
rendues dans un DOM factice sans valeur invalide, même image pour un même t quel que soit l'ordre
des appels, boucle refermée, et des sondes propres à chaque essai (voir plus bas). Le DOM factice
porte un contexte Canvas 2D qui journalise ses appels (c'est ce qui permet de lire ce que la carte
et le bumper dessinent), et Three r128 est chargé pour de vrai dans Node, avec `WebGLRenderer` et
`PMREMGenerator` remplacés par des coquilles : la scène, la caméra et le groupe de la carte sont
réels, donc la projection de la carte se mesure. Aucun shader écrit à la main dans ce lot, donc
pas de passage par `glslangValidator`.

Ce qui reste à juger à l'écran : la lisibilité de l'application recréée aux zooms 1,35 et 1,5, le
poids visuel du voile (0,52) contre le flou de `demo-interface`, le rendu des trois écrans sur le
verre, la densité des particules du bumper (le DOM factice ne rend pas les glyphes, donc il n'en
échantillonne aucune ; à l'écran, plusieurs milliers), et la piste synthétique.

## Ce que j'ai appris

### Passer de l'effet à la séquence

- **Une séquence, c'est une partition en tête de script, et rien d'autre ne porte un temps.**
  Caméra (`CAM`), foyer (`FOYER`), souris (`SOURIS`), clics (`CLICS`), vues (`VUES`), légendes
  (`LEGENDES`) dans la visite ; actes, pivots, fondus, frappe et lignes du journal dans la carte ;
  trajets, morphings, vol dans le process ; la cue sheet dans le bumper. Déplacer un événement,
  c'est changer un nombre à un seul endroit, et tout ce qui en dépend suit.
- **La légende se pose à côté de la zone en calculant, pas en la plaçant.** La caméra de la visite
  écrit `transform-origin` sur la cible et `translate(centre - cible)` ; la même arithmétique
  (`ecran(x, y) = [960 + (x - tx) s, 540 + (y - ty) s]`) donne le bord écran de la zone, et la
  légende se pose 28 px à sa droite, bornée à la scène. Le vérificateur le prouve pour les six
  légendes : dans la scène, hors du rectangle écran de leur zone, opacité pleine au milieu de la
  tenue. Pour que cette arithmétique soit exacte, **l'inclinaison 3D n'existe qu'au plan large**
  (5 et -6 degrés) et s'annule dès que la caméra s'approche : de près, l'image est plate.
- **Le voile remplace le flou.** Quatre rectangles (haut, bas, gauche, droite) autour d'un trou
  interpolé entre les zones avec la courbe de la caméra (`cine`, quintique). Ce qui est net reste
  net ; ce qui n'est pas en jeu est seulement assombri. Le trou est exact sur la zone pendant une
  tenue (vérifié : 1252, 84, 1560 sur le rail à 5,5 s) et le voile est transparent au plan large.
- **Une vue de contenu arrive en expo et part en cubique, et toutes les vues sont posées à chaque
  image**, visibilité comprise. Une seule vue est visible pendant chaque tenue (vérifié à 3, 8,
  10,5 et 12,7 s). L'onglet actif de l'en-tête suit la vue, comme dans l'application.
- **Le clic qui change de page se fait dans le rail, pas dans l'en-tête**, parce qu'au zoom 1,35
  centré sur la feuille l'en-tête sort du cadre alors que la partie gauche du rail y reste. La
  caméra ne remonte donc jamais pour un clic.
- **Pas de nombre de leçons, même dans une interface recréée.** La ligne « Leçons terminées » du
  vrai rail est remplacée par « Temps de formation », les tuiles disent « En cours · 38 min » et
  non « 6 leçons » : le vérificateur cherche un chiffre collé à « leçon » et refuse la page.

### La carte qui raconte

- **Trois poses de repos, deux pivots, et un recul en profondeur pendant le pivot** (`pz -= 0,25
  bosse(p)`) : la carte respire au lieu de tourner sur place. Les rotations de repos alternent de
  signe (-0,20, +0,26, -0,15 mesurés), donc les reflets du studio courent dans un sens puis dans
  l'autre, et la source qui glisse change de sens à chaque acte.
- **Le fondu entre deux écrans se dessine dans un tampon**, jamais en mélangeant deux dessins
  partiels sur le même canvas : l'écran suivant est dessiné entier hors écran puis posé avec
  `globalAlpha`. La clé de cache (acte, fondu arrondi, caractères tapés, curseur, lignes du
  journal, coche) fait que l'écran ne se redessine que quand son état change : 87 à 133 appels
  canvas par image, zéro quand rien ne bouge sur l'écran.
- **Les phrases arrivent quand la carte s'est posée et repartent avant qu'elle pivote** : entrée
  0,25 s après la pose, sortie qui se termine 0,05 s avant le pivot. Gauche, droite, gauche. Le
  texte d'une colonne est changé pendant qu'elle est cachée, jamais pendant qu'elle est visible.
- **« Une seule famille par pièce » se lit ainsi** : les phrases de la séquence sont en Fraunces
  seule (kicker en capitales espacées, titre, sous-titre). Les polices de l'application (Inter,
  JetBrains Mono) n'apparaissent que sur l'écran de la carte, parce que c'est le produit qu'on
  filme, pas la typographie de la pièce. Même règle pour la visite, qui recrée l'application.

### Le process en isométrie

- **Un objet plat dans le plan du tapis est une matrice SVG.** La projection isométrique est
  affine en (x, y) à z fixé, donc un contour 2D posé dans `<g transform="matrix(CU, SU, -CU, SU,
  e, f)">` se couche sur le tapis sans recalculer un seul point. Pendant le vol, le plan se
  redresse : la colonne y de la matrice devient `(-cos a · CU, cos a · SU + sin a · U)`, et la
  feuille se dresse face au panneau. Le texte (« DEVIS », « FACTURE ») et le tampon vivent dans le
  même groupe, donc ils se couchent et se dressent avec elle.
- **Le tapis n'avance que quand la feuille avance** : la phase des bandes est la distance parcourue
  par la feuille (`xFeuille(t) - X0`), pas le temps. Il s'arrête sous l'agent, sous la presse, et
  repart avec elle (vérifié). Le trajet total (7,6 unités) est un multiple du pas (0,4), donc les
  bandes boucleraient même sans le fondu.
- **Le morphing sous la station, pas entre les stations.** L'enveloppe devient le devis pendant
  que la barre de lecture la balaie (4,55 à 5,4 s), le devis devient la facture pendant que la
  presse remonte (7,5 à 8,3 s). Un morphing pendant un déplacement lirait comme un défaut ; sous
  une machine, il lit comme un traitement. Ondulation radiale réduite à 0,03 unité (9 px sur le
  morph-formes, trop pour un objet de 1 unité).
- **Trois contours qui se répondent** : rectangle couché (1,5 x 1,0), portrait à coin plié (1,05 x
  1,4, coin de 0,24), portrait à bord dentelé (huit dents de 0,07). Le rabat de l'enveloppe, la
  bande de couleur, les lignes et le nom sont des détails à opacité par état, posés par-dessus le
  contour : le morphing ne transporte que la silhouette.
- **L'ordre des couches reste une liste écrite** : plaque, ombres au sol, panneau et barres, tapis
  et rail arrière, poteaux arrière des portiques, la feuille sur le tapis, rail avant, poteaux
  avant et ponts, tête de l'agent et barre de lecture, piston, puis la feuille en vol par-dessus
  tout. Le panneau à y = -2,6 est derrière le bout du tapis en profondeur, mais ne le recouvre pas à
  l'écran (vérifié par les positions : feuille à 1019 px sous la presse, panneau vers 1350 px).
- **Le titre tombe en trois temps du récit** : « De l'e-mail » à l'ouverture, « à la facture, »
  quand la presse a frappé (7,6 s), « sans vous. » quand la barre d'or monte (11,3 s). Chaque ligne
  sur son masque, jamais l'une remplaçant l'autre.

### Le bumper, corrigé point par point

- **Le curseur suit la lettre parce que c'est la même abscisse.** Le mot n'est pas révélé lettre
  par lettre (c'est ce qui faisait le pas quantifié et le curseur en retard) mais par un masque
  dont le bord avance continûment : `revele() = W1 · inOutCubic(seg(t, 1,0, 2,5))`, W1 mesuré par
  `measureText` une fois les polices chargées. Le curseur est à `bord + 8`. Écart mesuré sur 86
  images : 0,0000 px.
- **Aucune courbe expo sur un déplacement.** L'expo part si vite qu'à 60 images par seconde son
  premier pas vaut 23 % de la course : sur 940 px, c'est un saut de 213 px, et l'œil le lit comme
  une saccade (mesuré, puis corrigé). Les déplacements sont en sinus ou en cubique symétrique ; le
  plus grand pas de toute la pièce est de 53 px par image, sur le retour du point au centre à la
  sortie, continu.
- **L'idée** : le curseur repasse le mot en arrière (balayage en sinus sur deux temps), et chaque
  point du mot part quand le curseur passe son abscisse. L'heure de départ est l'inverse exact du
  balayage : `td = T6 + (T8 - T6) · acos(2u - 1) / π`, avec u la position relative dans le mot.
  Les points rejoignent en arc leur place dans « AI Academy » (les deux nuages sont triés de
  gauche à droite et appariés par rang), puis le curseur repasse le second mot de gauche à droite
  et le révèle plein sous lui : un point est fixé quand le bord révélé l'a dépassé de 40 px. Un
  seul objet, trois gestes : écrire, défaire, fixer.
- **Le point est là aux deux bouts, au centre, à la même taille** (vérifié : x 949, 22 x 22). Le
  kick du temps 0 le fait respirer ; il n'y a pas de naissance, donc pas de saut à la reprise.
- **Trois couleurs, aucun bleu** : nuit `#0a0e17` (celle de la page de vente), ivoire, or. Le
  bloc bleu de la première version est remplacé par l'or, qui est déjà l'accent de tout le reste.
- La cue sheet garde treize événements sur des temps entiers, 51 sons dans la boucle, le moteur
  audio et l'export WAV de `bumper-son` tels quels (les minuteries qu'il contient servent le
  planificateur audio, jamais l'image : le vérificateur les exclut comme au lot 2).

## Réglages qui marchent, à reprendre tels quels

| Geste | Réglage |
|---|---|
| Tenue de caméra sur une zone | 1,3 à 2 s ; glissé quintique de 0,7 s ; zoom 1,35 sur la feuille, 1,5 sur le rail |
| Voile du projecteur | `rgba(6,10,20,.52)`, quatre rectangles, trou interpolé en quintique avec la caméra |
| Légende | 272 px, papier, ombre `0 22px 48px -20px`, 28 px à droite du bord écran de la zone, entrée expo 0,55 s, sortie cubique 0,3 s |
| Survol d'une tuile | `translateY(-3px)`, ombre qui s'étend, bordure or à mi-course |
| Clic | pression 60 ms puis 160 ms, onde de 0,55 s, curseur à 0,82 |
| Frappe dans l'interface | 46 caractères par seconde, curseur plein pendant la frappe, clignement 0,8 s ensuite |
| Panneau qui glisse | `translateX(470 → 0)` en expo sur 0,5 s |
| Pivot de la carte | `inOutCubic` 0,95 s, recul `0,25 · bosse`, bosse de rotation ±0,05 rad |
| Phrase d'une colonne | entrée expo 0,9 s décalée de 0,12 s par ligne, sortie quart 0,45 s, kicker 0,8 s |
| Fondu d'écran | `inOutCubic` 0,5 s dans un tampon, au milieu du pivot |
| Journal ligne par ligne | une ligne toutes les 0,25 s, coche tracée en expo 0,35 s |
| Feuille qui tombe sur le tapis | `inQuad` 0,35 s puis `0,26 · |sin 2πp| · (1 - p)²` |
| Trajet sur le tapis | `inOutSine`, 1,5 à 1,8 s par station, bandes à la phase de la feuille |
| Morphing sous une station | `inOutCubic` 0,8 à 0,85 s, ondulation 0,03 unité |
| Presse | descente `inQuad` 0,27 s, remontée `outQuart` 0,48 s, écrasement `1 + 0,05 bosse` |
| Envol | `inOutCubic` 0,8 s, arc `0,95 · bosse`, dressage 0 → 90°, échelle 1 → 0,5, extinction sur les 18 derniers % |
| Barre qui monte | `outBack(1,2)` 0,85 s, lueur qui grandit avec elle |
| Écriture d'un mot | masque `inOutCubic` sur trois temps, curseur à `bord + 8` |
| Balayage arrière | `inOutSine` sur deux temps, sélection or à 16 % qui s'efface sur le dernier demi-temps |
| Vol d'une particule | `inOutCubic` 0,45 à 0,75 s, bombée `sin(πe) · (r - 0,5) · 0,9`, levée 36 à 90 px |
| Point aux deux bouts | 22 px au centre, pulsation 9 % sur chaque kick |

## Transformer chaque séquence en bloc réutilisable

### `visiteInterface`

- **Entrées** : le DOM de l'application posé dans `#app` (1600 x 900), `zones` (nom, rectangle en
  coordonnées de l'application), `cam[]` (t, zone ou point, zoom), `souris[]`, `clics[]`, `vues[]`
  (id, entrée, sortie), `legendes[]` (zone, côté, instants, kicker, texte), `voile` (opacité).
- **Sorties** : `ecran(x, y)` (application vers scène), le rectangle écran de chaque zone à
  l'instant t, pour poser autre chose à côté.
- **À isoler** : `piste`, `trou`, `ecran`, la pose des quatre rectangles du voile, la pose des
  légendes bornée à la scène, `typer`. La caméra et le voile ne connaissent pas le contenu.

### `carteRecit`

- **Entrées** : `actes[]` (colonne, instants, kicker, lignes, sous-titre, écran à dessiner
  `dessiner(ctx, etat)`), `poses[]` (rotation de repos par acte), `pivots[]`, `fondus[]`,
  `glisses[]` (instants et sens de la source), `sortie`.
- **Sorties** : `etatEcran(t)` (pour tester la frappe sans navigateur), la position projetée de la
  carte.
- **À isoler** : `poseCarte` avec ses trois repos et ses deux pivots, `dessinerEcran` avec son
  tampon de fondu et sa clé de cache, `poseTexte` à deux colonnes. Le studio, le verre et l'ombre
  sont ceux de `carte-3d`, inchangés.

### `processIso`

- **Entrées** : `stations[]` (x, type : portique, presse, panneau, instant de montée), `trajets[]`
  (instants, de, à), `formes[]` (contours et détails par état), `morphs[]` (instants, sous quelle
  station), `vol` (instants, cible), `indicateur` (barres et celle qui monte), `etiquettes[]`,
  `titre[]` (lignes et instants).
- **Sorties** : `xFeuille(t)`, la matrice de la feuille (pour y poser un autre contenu).
- **À isoler** : `matriceFeuille` (plan couché puis dressé), `xFeuille` et la phase du tapis, la
  petite bibliothèque de morphing (`arrondir`, `orienter`, `reechantillonner`, `aligner`,
  `melange`) déjà partagée avec `morph-formes`, et l'isométrie de `isometrique` (`proj`, `solide`,
  `faces`, `ombre`, `coque`, `groupeOmbres`).

### `bumperCurseur`

- **Entrées** : `nom1`, `nom2`, `police`, `taille`, `legende`, `adresse`, la cue sheet (identifiants
  `point`, `curseur`, `ecrit`, `pose`, `balaye`, `forme`, `legende`, `tenue`, `sortie`), `particules`
  (pas de la grille, graine, durée de vol).
- **Sorties** : `curseur(t)` (position et forme, pour qu'un autre bloc s'y accroche), `M`
  (largeurs mesurées).
- **À isoler** : `mesurer`, `echantillonner` et l'appariement par rang, `revele`, `balaye`,
  `departDe`, `curseur`. Le moteur audio est celui de `cueSheet` (NOTES-rythme.md).

## Ce que je ferais différemment si Paul retient une de ces séquences

- Visite : remplacer l'application recréée par le vrai DOM exporté de l'espace apprenant (les
  composants sont les mêmes), et laisser une voix dire les légendes plutôt que de les afficher.
- Carte : un quatrième acte où la carte se retourne et montre son dos (le tableau de bord de
  l'agent), et une vraie musique dont les pivots tombent sur les temps.
- Process : un son mécanique par station (la barre de lecture, la presse, le tampon, la barre qui
  monte) calé sur la partition, et une seconde enveloppe qui entre pendant que la première
  s'envole, pour dire que ça tourne.
- Bumper : le vrai logo posé pixel pour pixel sur « MyDigipal » avant que les particules le
  défassent, et une version où le second mot est celui de la campagne du moment.
