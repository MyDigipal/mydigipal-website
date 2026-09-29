# Direction C, « Atelier »

Maquette de la page Google Ads, refonte du site MyDigipal, 29 et 30/09/2026.
Fichiers : `direction-c.html`, `direction-c.css`, `direction-c.js`, cette fiche.
Adresse : `http://localhost:4173/labo/refonte-site/direction-c.html` (`?langue=en`, `?fige=1`).

## 1. Le parti pris

L'isométrie explique, le papier réchauffe. La page est l'établi d'un atelier : un papier chaud,
des feuilles posées avec de vraies ombres nettes, et au milieu une maquette en volume qui montre
comment marche une campagne Performance Max.

## 2. La palette

| Jeton | Valeur | Usage |
|---|---|---|
| `--craie` | `#F6F4EF` | le papier, fond des sections claires et de l'en-tête |
| `--feuille` | `#FFFFFF` | les feuilles posées, la section Méthode |
| `--filet` | `#E1DDD3` | filets, bords d'étiquettes, rail de la méthode |
| `--encre` | `#14202E` | texte sur clair (14,98 sur la craie) |
| `--encre-2` | `#55606E` | texte secondaire sur clair (5,82 sur la craie, 6,39 sur blanc) |
| `--nuit` | `#0A1626` | plateau de la scène, section Preuve, pied de page |
| `--plaque` | `#1A2F4F` | la plaque de la maquette |
| `--bloc` | `#3B5F99` | les volumes de la maquette |
| `--flux` | `#7FC4DD` | ce qui circule : annonces, bandes des tapis, liens sur la nuit (9,38) |
| `--ivoire` | `#F4F1EA` | texte sur la nuit (16,11), caisses de la maquette |
| `--ivoire-2` | `#A9B5C4` | texte secondaire sur la nuit (8,73) |
| `--marque` | `#1D71B8` | boutons, appel final (blanc dessus : 5,11) |
| `--marque-fonce` | `#155A93` | survol, rubrique, titre du repère actif (6,55 sur la craie) |
| `--signal` | `#FF6A4D` | le résultat, et lui seul : jetons, témoins, marque de conversion, chiffres de la preuve (6,42 sur la nuit), disque de la dernière station |
| `--signal-texte` | `#C63D1F` | le même sens, en texte sur papier clair (5,14 sur blanc, 4,67 sur la craie) |

Le corail ne colore aucun bouton, aucun décor, aucun titre.

Part de surface sombre ou pleine couleur, mesurée (hauteur des bandes sur la hauteur de la page,
pied de page compris) : **41,9 % à 1440 px en français, 42,5 % en anglais, 44,6 % à 390 px en
anglais, 44,1 % en français**. À 768 px : 43,7 %. À 1024 px : 42,6 %.

## 3. Les polices

| Famille | Rôle | Graisses | Poids du fichier |
|---|---|---|---|
| Bricolage Grotesque variable (axes `opsz` et `wght`) | titres, chiffres, noms | 700 et 800 | 76,9 Ko (sous-ensemble latin, woff2, mesuré le 30/09/2026) |
| Inter variable | texte, boutons, étiquettes | 400 à 700 | 48,3 Ko (`public/fonts/inter-latin.woff2`) |

Deux familles, aucun monospace. Aucun axe de police n'est animé. Bricolage vient de Google Fonts
en maquette (`display=swap`) : à héberger en production.

Échelle, à 1440 px puis à 390 px :

| Niveau | 1440 | 390 |
|---|---|---|
| Titre de page (h1) | 72 px | 38 px |
| Titre de section (h2) | 56 px | 32 px |
| Chiffre de la preuve | 136 px | 66 px |
| Conclusion de la scène | 51 px | 26 px |
| Titre de repère, de station, de question (h3) | 24 px | 20 px |
| Texte | 17 px | 17 px |
| Texte secondaire, étiquettes, boutons | 16 px | 16 px |
| Navigation de l'en-tête | 14 px | absente (menu à 17 px) |

Le titre de page est calé sur sa plus longue ligne (9,12 em en français) : elle ne se coupe
jamais, ni à 390 ni à 1440.

## 4. Le rythme

| # | Section | Fond |
|---|---|---|
| 1 | Hero : texte à gauche, collage de trois études de cas à droite | craie |
| 2 | Logos, entre deux filets | craie |
| 3a | Performance Max : titre et chapeau | craie |
| 3b | Performance Max : la scène, sur un plateau d'un bord à l'autre | **nuit** |
| 3c | Performance Max : la conclusion | craie |
| 4 | Formats : quatre feuilles de tailles inégales | craie |
| 5 | Méthode : la seconde scène | feuille blanche |
| 6 | Preuve : trois lignes de registre, le verbatim sur une feuille | **nuit** |
| 7 | Questions | craie |
| 8 | Appel final | **bleu plein** |
| 9 | Pied de page | **nuit** |

Écart avec la consigne : la section Performance Max n'est pas sombre d'un bloc. Toute en nuit, la
page montait à 51,3 % de surface sombre. Le titre se lit donc sur le papier, la scène se joue sur
un plateau de nuit (796 px de haut à 1440), la conclusion retombe sur le papier.

Formes : rayon de 14 px pour les feuilles, 8 px pour les petits éléments intérieurs, pilule pour
les boutons et les étiquettes. Une ombre est nette et décalée, et suit le seul paramètre `--h`
(décalage, flou, opacité). Trois feuilles sont inclinées (0,6, 0,7 et 1 degré), les pièces du
collage de 1 à 2,5 degrés.

## 5. Les animations

### 5.1 La scène principale : l'usine isométrique (`#scene-pmax`)

- **Ce qu'elle explique.** Google choisit où montrer l'annonce, nous choisissons ce qu'il
  apprend : ce qu'on donne entre par le toit, ce que Google décide sort sur six écrans, ce qu'on
  lui apprend revient par un tapis.
- **Essai d'origine.** `isometrique` (bibliothèque `proj`, `solide`, `faces`, `lum`, `ombre`,
  `coque`), plus la caméra qui tient la pose de `demo-interface` sur téléphone.
- **Technique.** Canevas 2D, ratio de pixels plafonné à 2, `ResizeObserver`. Environ 180
  polygones par image, aucun filtre, aucun `innerHTML`. L'ordre des couches est écrit à la main.
  Entrer dans la machine se fait par découpe dans l'espace (`couper`), pas par masque. Le dessin
  ne contient aucun texte. `MDP.scene(el, { tenue: 14, rendu })`, `rendu(t)` pur.
- **Le plan.** Un chevron : le quai d'entrée en haut à gauche, la machine à droite, le mur des six
  écrans et les deux tapis en bas à gauche. Ce plan tient dans un carré, ce qui permet de garder
  les repères à côté du dessin sur ordinateur et de cadrer deux zones sur téléphone.
- **Durée.** 14 s, jouée une fois à l'entrée dans l'écran (seuil de 30 %).

| Instants | Ce qui se passe |
|---|---|
| 0 à 1,6 | la plaque monte, sa grille apparaît, les blocs montent en cascade |
| 1,6 à 2,73 | temps 1 : six caisses se posent sur le quai, leurs étiquettes arrivent |
| 2,73 à 4,25 | **tenue de lecture (1,52 s)** |
| 4,25 à 5,58 | le quai emporte les caisses, elles basculent une à une dans la trappe |
| 5,7 à 6,2 | temps 2 : la barre de lumière balaie la façade |
| 6,1 à 8,91 | six annonces sortent, roulent, sautent en arc jusqu'à leur écran et s'allument |
| 8,91 à 10,45 | **tenue de lecture (1,54 s)** |
| 10,45 à 12,4 | temps 3 : trois jetons corail sortent de trois écrans, reviennent par le tapis de retour, entrent dans la machine ; un témoin s'allume à chaque entrée |
| 12,5 à 13,0 | les deux barrières ferment la sortie |
| 13,0 à 13,82 | de nouvelles caisses se posent sur le quai : la matière continue d'arriver |
| 13,15 à 13,98 | la conclusion monte de son masque, ligne après ligne |
| 14 | pose finale |

- **Repères.** Trois boutons, un par temps (`data-aller` 1,6 / 5,7 / 10,45, `data-tenir` 4,2 /
  10,4 / 14) et un bouton `data-rejouer`.
- **État final.** Six caisses sur le quai, six annonces allumées sur le mur, trois marques de
  conversion sur les écrans, trois témoins corail sur la façade, les deux barrières fermées, la
  conclusion. C'est aussi ce que montre le SVG statique écrit dans le HTML (176 polygones),
  visible sans JavaScript et caché dès que le canevas tourne.
- **Étiquettes.** Dix-huit, en HTML, dans les deux langues. Dès que le dessin fait 680 px de
  large, elles sont couchées dans le plan de la face qui les porte (flanc du quai, mur des écrans,
  flanc de la machine, sol), à 14,4 px pour un dessin de 742 px. En dessous, elles sortent du
  dessin et s'écrivent en listes sous chaque temps.
- **À 390 px.** Le dessin reste collé sous l'en-tête pendant qu'on lit les trois temps. La caméra
  tient la pose sur l'entrée (1,6 à 5,6 s), glisse vers la sortie (6,25 à 12,95 s), puis revient
  au plan d'ensemble : trois glissés de 0,6 à 0,7 s, grandissement de 1,5 au plus. Les étiquettes
  sont en listes à 16 px, les réseaux avec une icône générique.

### 5.2 La seconde scène : la méthode par morphing (`#scene-methode`)

- **Ce qu'elle explique.** La méthode est un seul travail qui change d'état, pas quatre blocs.
- **Essai d'origine.** `morph-formes` (`arrondir`, `orienter`, `reechantillonner`, `aligner`,
  `melange`, rebond, étirement selon la vitesse).
- **Technique.** Un tracé SVG de 240 points dont seul l'attribut `d` change, sur un disque de
  124 px (64 px sous 1024 px). Déplacement et étirement en `transform`. Les quatre contours sont
  calculés une fois. Le corail gagne le disque depuis son centre : deux aplats, jamais un mélange
  des deux teintes. Seul le disque se teinte.
- **Durée.** 9 s. Voyages de 1,1 s à 1,5, 4,1 et 6,7 s, rebond de 0,65 s, puis 1,5 s de tenue à
  chaque station.
- **Formes.** Loupe, structure, curseur de réglage, courbe qui monte.
- **État final.** Le disque corail à la quatrième station, les trois autres stations avec leur
  petite forme fixe, les quatre titres et leurs textes. Aucune pastille numérotée.
- **Repères.** Les quatre titres sont des boutons.
- **À 390 px.** Le rail est vertical, le disque descend, l'étirement suit le sens du voyage.

### 5.3 Le reste

- Apparitions courantes par `[data-entree]`, titres sous masque (`.ligne`), courbe A du socle.
- Le collage du hero : six pièces se posent en quatre poses, à douze images par seconde, une
  fois. L'ombre de chaque pièce se resserre quand elle se pose. CSS seul (`steps`), `transform` et
  `opacity`.
- Rien d'autre ne bouge. Aucun écouteur de défilement, aucune boucle.

## 6. Les composants que la direction apporterait au site

| Composant | Paramètres |
|---|---|
| `Feuille` | hauteur `--h` (1 à 4), inclinaison, fond (blanc, nuit) |
| `Collage` | pièces (image ou étiquette), position, inclinaison, ordre de pose |
| `EtiquetteResultat` | valeur, libellé, client |
| `PlateauDeNuit` | contenu ; bande d'un bord à l'autre dans une section claire |
| `SceneIsometrique` | plan (solides, tapis, objets), partition, cadrages, étiquettes et leur plan |
| `Repere` | titre, instant de départ, instant de tenue |
| `RailMorphing` | stations (titre, texte, contour), partition, couleur de résultat |
| `Registre` | lignes (chiffre, libellé, second chiffre, logo, lien) |
| `VignetteIsometrique` | dessin fixe produit par le moteur (`svgRecherche`, `svgDetail`) |
| `Plis` | liste d'étiquettes en pilule |

## 7. Les contrôles

Faits sur le banc (deux cadres côte à côte, 390 x 844 et 1440 x 844), fenêtre en arrière-plan,
scènes posées par `__scene.aller(t)`.

| Contrôle | 390 en | 390 fr | 1440 fr | 1440 en | `?fige=1` (390 et 1440, fr et en) |
|---|---|---|---|---|---|
| `scrollWidth - clientWidth` | 0 | 0 | 0 | 0 | 0 dans les quatre cas |
| Texte hors de l'écran | 0 | 0 | 0 | 0 | 0 |
| Texte rogné (boutons, étiquettes, liens) | 0 | 0 | 0 | 0 | 0 |
| Boutons sur deux lignes | 0 | 0 | 0 | 0 | 0 |
| Deux boutons côte à côte (hero et appel final) | oui, 308 px | oui, 345 px sur 358 | oui | oui | oui |
| `h1` | 1 | 1 | 1 | 1 | 1 |
| Tirets longs (texte et attributs) | 0 | 0 | 0 | 0 | 0 |
| Nombres absents de `CONTENU.md` | 0 | 0 | 0 | 0 | 0 |
| `[data-entree]` et pièces du collage restés cachés | 0 | 0 | 0 | 0 | 0 |
| Images sans `width` ni `height` | 0 | 0 | 0 | 0 | 0 |
| Recouvrements d'éléments fixes, bandeau affiché | 0 | 0 | 0 | 0 | 0 |
| idem, bandeau affiché et panneau ouvert | 0 | 0 | 0 | 0 | 0 |
| idem, bandeau fermé | 0 | 0 | 0 | 0 | 0 |
| idem, bandeau fermé et panneau ouvert | 0 | 0 | 0 | 0 | 0 |
| Scènes sous `?fige=1` | | | | | posées à 14 s et 9 s, canevas peint |

Nombres présents dans la page : 112, 145, 170, 225, 35, 50, 31, 3, 2026 et le 2 de B2B.

Autres largeurs : 768 et 1024 px (français et anglais à 1024), débordement 0, boutons côte à
côte, en-tête sur une ligne à 1024 px, cibles de 44 px.

Sans JavaScript (cadre en `sandbox`) : page complète, SVG final visible, étiquettes en listes,
disque de la méthode à sa dernière station.

Logique de lecture, vérifiée en remplaçant `requestAnimationFrame` par une minuterie : lecture de
0 à 14 s puis état `posee` ; repère 2 joué de 5,7 à 10,4 s puis `tenue` ; station 3 jouée de 4,1
à 6,6 s ; bouton `Rejouer` ; changement de langue avant l'entrée dans l'écran, les scènes restent
en attente.

Instants vus à l'écran :

- `#scene-pmax`, 1440 : 0, 0,45, 0,6, 0,95, 1,3, 1,95, 2,2, 3,0, 5,1, 5,35, 5,95, 6,28, 7,2,
  7,45, 8,25, 10,4, 11,25, 11,45, 12,64, 12,75, 13,22, 14.
- `#scene-pmax`, 390 : 0,6, 1,3, 3,0, 4,2, 5,0, 5,95, 7,45, 10,4, 11,25, 13,22, 14.
- `#scene-methode`, 1440 et 390 : 0, 0,55, 1,4, 2,1, 2,75, 4,0, 4,7, 6,6, 7,35, 9.

Corrigé après les avoir vus :

1. Le nom de la machine et « Signaux d'audience » se touchaient à l'écran : le nom est passé
   sur le flanc droit de la machine.
2. Trois caisses s'entassaient dans la trappe : une seule bascule à la fois.
3. La barrière passait sur l'étiquette « Discover » : elle a reculé.
4. Le dessin dépassait la hauteur de l'écran à 1440 : sa largeur se règle aussi sur la hauteur.
5. Le disque de la méthode passait par un mauve sale entre le bleu et le corail : aplat qui gagne.
6. Les feuilles inclinées perdaient leur inclinaison à l'apparition (`transform` écrasé par le
   socle) : propriété `rotate`.
7. L'ombre des feuilles ne se voyait pas sur la nuit : plus noire que le fond.
8. Le titre du hero passait sur quatre lignes : taille calée sur la plus longue ligne.
9. Le collage du téléphone : chaque étiquette est posée à côté de sa photo.
10. Pastilles de logo qui débordaient, espace avant `%` trop large en grand corps.

**Ce qui n'a pas pu être vérifié :**

- La lecture à 60 images par seconde et sa fluidité : la fenêtre de Chrome était en arrière-plan.
- Le déclenchement réel par `IntersectionObserver` au défilement.
- Un vrai téléphone : le banc est un cadre de 390 px dans Chrome sur ordinateur. Safari et Firefox
  n'ont pas été ouverts.
- Le collage en mouvement : une seule image intermédiaire vue, à 0,7 s.
- La navigation au clavier de bout en bout et un lecteur d'écran.

## 8. Limites connues et questions pour Paul

Limites :

- **Le bandeau cookies du socle** est à 14 px et ses boutons font 36 px de haut, sous les seuils de
  16 px et 44 px. Il vient du gabarit, il n'a pas été touché.
- **Le masque `.ligne` du socle** rogne le bas des jambages de Bricolage Grotesque. Contourné dans
  `direction-c.css` (marge intérieure de 0,2 em au lieu de 0,12).
- **Le verbatim** tient en trois lignes à partir de 1100 px. À 390 px il en fait cinq, à 17 px :
  174 caractères ne tiennent pas en trois lignes à 16 px.
- **Pendant un saut**, une annonce passe brièvement derrière l'étiquette de l'écran voisin : les
  étiquettes sont du HTML posé par-dessus le canevas.
- **Pas d'ombre portée pour les objets en vol** (annonce ou jeton pendant son arc).
- **Le SVG final, les vignettes et les formes sont recopiés dans le HTML.** Après un changement du
  dessin, il faut les régénérer (`MDPAtelier.svgFinal()`, `svgDetail()`, `svgRecherche()`,
  `formes`) et les recoller entre leurs repères. En production, ce serait fait au build.
- **Le HTML pèse 104 Ko**, dont 32 Ko pour le SVG final.
- **Entre 1100 et 1210 px de large**, le dessin fait moins de 680 px : les étiquettes sont en
  listes dans la colonne de gauche.
- **Icônes** : tracés de la famille Lucide, trait de 2, écrits en ligne.

Questions :

1. Le titre de la section Performance Max sur le papier et la scène seule sur la nuit : est-ce le
   bon compromis, ou préfères-tu toute la section en nuit, quitte à dépasser 45 % ?
2. Sur téléphone, la caméra qui cadre l'entrée puis la sortie : à garder, ou un plan d'ensemble
   fixe, plus petit ?
3. Les nouvelles caisses qui arrivent à la fin : elles donnent un état final complet, mais
   ajoutent un geste. À garder ?
4. Les étiquettes couchées en isométrie à 14 px : assez lisibles pour toi, ou faut-il les sortir
   du dessin sur ordinateur aussi ?
