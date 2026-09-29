# Direction A, « Encre »

Maquette de la page de service Google Ads, 29 et 30/09/2026.
Fichiers : `direction-a.html`, `direction-a.css`, `direction-a.js`, `direction-a.md`.
Adresse : `http://localhost:4173/labo/refonte-site/direction-a.html` (`?langue=en`, `?fige=1`).

## 1. Le parti pris

La page claire du site d'aujourd'hui, ponctuée par des scènes d'encre où l'on explique quelque chose.
C'est la direction de la continuité : mêmes polices, même bleu, même en-tête que le site en ligne,
avec de la profondeur (panneaux posés sur des plaques, carte en volume), une lumière fixe et un
résultat qui s'écrit toujours en blanc sur l'encre.

## 2. La palette

| Jeton | Valeur | Usage |
|---|---|---|
| `--blanc` | `#FFFFFF` | fond du hero, des logos, de la méthode, des questions |
| `--brume` | `#F3F6FA` | fond des formats et de l'appel final, plaque derrière le panneau du hero |
| `--filet` | `#E2E8F0` | filets sur clair, rail de la méthode |
| `--encre` | `#0B1B2B` | fond des scènes, du panneau du hero, du pied de page ; texte sur clair |
| `--encre-2` | `#102A43` | réservé aux surfaces posées sur l'encre (déclaré, la carte utilise `#0F2740`) |
| `--abysse` | `#071421` | réservé au plus profond (déclaré, non utilisé dans cette page) |
| `--marque` | `#1D71B8` | seul accent : boutons, liens, voyageur de la méthode, panneau de l'appel final |
| `--marque-fonce` | `#155A93` | survol des boutons, texte du bouton blanc |
| `--marque-clair` | `#7DB8EE` | l'accent sur fond sombre : icônes, faisceau, liens |
| `--marque-doux` | `#EAF3FB` | pastilles des stations, icônes du format Performance Max sur téléphone |
| `--texte` / `--texte-2` | `#0B1B2B` / `#4B5B6B` | texte et texte secondaire sur clair |
| `--texte-sombre` / `--texte-sombre-2` | `#F4F7FA` / `#A9B8C8` | texte et texte secondaire sur sombre |
| `--filet-sombre` | `rgb(255 255 255 / 0.10)` | filets sur sombre |
| `--verre`, `--verre-bord` | blanc à 6 % et 14 % | pilules des réseaux, liseré de verre sur tout le pourtour |

Un seul accent, aucune seconde couleur. Les lueurs sont des dégradés radiaux du bleu du logo, fixes.

Contrastes calculés : texte sur blanc 17,4 ; texte secondaire sur blanc 7,0 et sur brume 6,4 ; bleu
sur blanc 5,1 et sur brume 4,7 ; blanc sur bleu 5,1 ; texte clair sur encre 16,2 ; texte secondaire
sur encre 8,6 et sur la carte 7,5 ; bleu clair sur encre 8,3. Point le plus faible : le blanc sur le
coin le plus clair du panneau bleu de l'appel final, 3,9, où il n'y a que le grand titre.

**Part de surface sombre, mesurée sur les sections pleine largeur** (deux scènes d'encre et pied de
page, rapportées à la hauteur de la page hors en-tête) :

| Largeur | Français | Anglais |
|---|---|---|
| 1440 | 42,0 % | 42,6 % |
| 390 | 44,9 % | 45,0 % |

En comptant aussi les panneaux sombres ou de pleine couleur posés sur des sections claires (panneau
du hero, format Performance Max sur ordinateur, panneau bleu de l'appel final), au prorata de leur
surface : 52,3 % et 53,2 % à 1440, 51,9 % et 52,3 % à 390. Plus longue suite claire sans section
sombre : 1 963 px à 1440, 3 043 px à 390 (le site actuel : 4 892 px).

## 3. Les polices

Celles du site, hébergées par lui (`../../public/fonts/`), en `font-display: swap`, préchargées.

| Famille | Usage | Graisses | Fichier | Poids |
|---|---|---|---|---|
| Plus Jakarta Sans (variable) | titres, chiffres, conclusion | 700 et 800 | `jakarta-latin.woff2` | 27 Ko |
| Inter (variable) | texte, boutons, étiquettes | 400, 500, 600 | `inter-latin.woff2` | 47 Ko |

Aucun monospace. Approche des titres : -0,03 em (-0,035 em pour le H1, -0,045 à -0,05 em pour les chiffres).

| Niveau | 390 px | 1440 px |
|---|---|---|
| H1 | 39 px | 62 px |
| H2 de section | 31 px | 50 px |
| Chiffre de tête du hero | 75 px | 108 px |
| Chiffre d'une ligne de preuve | 77 px | 116 px |
| Conclusion de la scène | 27 px | 46 px |
| Nom d'un format principal, secondaire | 30 px, 22 px | 40 px, 24 px |
| Titre d'un temps, d'une station | 26 px, 22 px | 26 px, 24 px |
| Verbatim | 22 px | 32 px |
| Chapeau | 17 px | 19 px |
| Texte courant | 16 px | 16 à 17 px |
| Plus petit texte | 16 px | 12 px (code de langue), 14 px (en-tête), 15 px (puces) |

## 4. Le rythme

| # | Section | Fond | Hauteur à 1440 | Hauteur à 390 |
|---|---|---|---|---|
| 1 | Hero | blanc, panneau d'encre à droite | 632 | 952 |
| 2 | Logos | blanc, entre deux filets | 240 | 388 |
| 3 | Performance Max, scène principale | **encre**, coins supérieurs de 32 px | 1 280 | 1 963 |
| 4 | Formats | brume | 1 141 | 1 943 |
| 5 | Méthode, seconde scène | blanc | 854 | 1 133 |
| 6 | Preuve | **encre**, coins supérieurs de 32 px | 1 178 | 1 496 |
| 7 | Questions | blanc | 736 | 771 |
| 8 | Appel final | brume, panneau de **bleu plein** | 601 | 472 |
| 9 | Pied de page | **encre** | 542 | 1 098 |

Jamais deux sections sombres collées. Appel final : j'ai tranché pour le bleu plein, en panneau posé
sur la brume, pour que le bleu du logo apparaisse une fois en surface et que l'appel ne touche pas
l'encre du pied de page.

## 5. Les animations

### 5.1 Scène principale, `#scene-pmax` : la carte de verre

- **Ce qu'elle explique** : on donne des éléments à la campagne, Google décide où elle se montre,
  nous lui apprenons quelles conversions comptent et ce qu'elle ne doit pas acheter.
- **Essai d'origine** : `carte-3d` et `carte-verre-recit` (la phrase à gauche, puis à droite).
- **Technique** : CSS 3D, niveau 1 du digest. Aucun WebGL, aucune bibliothèque. Deux enveloppes
  (`.carte-pose` pour la position, `.carte` pour la rotation) pilotées par deux ressorts analytiques
  (0,85 et 3,8 pour la position, 0,60 et 3,4 pour la rotation). Épaisseur par une seconde plaque à
  22 px derrière la première, puces à 14 px devant. Reflet en élément rogné qui traverse en
  `translate`. Faisceau en SVG tracé par `stroke-dashoffset`. Tout le reste en `transform` et
  `opacity`. Tous les textes sont dans le HTML, dans les deux langues.
- **Durée** : 14 s, `MDP.scene(el, { tenue: 14 })`.

| Temps | Ce qui se passe | Instants |
|---|---|---|
| Entrée | la carte arrive du bas à droite, vide, avec ses neuf places en pointillés ; un reflet la traverse | 0,1 à 2,0 |
| 1, « Ce qu'on lui donne » | la phrase monte à gauche, les six éléments arrivent de la gauche et se rangent | 1,1 à 3,55 |
| Tenue | | 3,55 à 5,1 (1,55 s) |
| 2, « Ce que Google décide » | la carte pivote vers les réseaux, la phrase monte à droite, six traits se tracent, six réseaux se posent | 5,1 à 8,1 |
| Tenue | | 8,1 à 9,6 (1,5 s) |
| 3, « Ce qu'on lui apprend » | la carte revient, la phrase monte, trois conversions reviennent des réseaux, deux passages se ferment | 9,6 à 12,55 |
| Pose finale | la phrase de conclusion monte de son masque | 12,95 à 14 |

- **Repères** : trois boutons (0 à 4,6 ; 5,1 à 9,1 ; 9,6 à 14) et « Rejouer ».
- **État final** : les trois temps et leurs textes, six éléments, six réseaux, trois conversions,
  deux garde-fous, la conclusion. À la tenue la scène retire tous ses styles en ligne : l'état
  final est celui de la feuille de style, identique sans script (vérifié, 0 style restant).
- **À 390 px** : la scène est refaite. Première phrase au-dessus, carte en pleine largeur avec ses
  puces à leur largeur, trois tiges, réseaux en deux rangées de trois, garde-fous, puis les deux
  autres phrases et la conclusion. Le pivot du temps 2 se fait vers le bas, les conversions
  remontent du bas. Texte à 16 px partout.

### 5.2 Seconde scène, `#scene-methode` : un seul objet qui change de forme

- **Ce qu'elle explique** : la méthode est une seule et même mission qui change de nature à
  chaque étape, de l'audit au reporting.
- **Essai d'origine** : `morph-formes`.
- **Technique** : SVG en ligne, attribut `d` réécrit sur 240 points, contours alignés par moindres
  carrés. Formes : loupe, structure, curseur de réglage, courbe qui monte. Étirement selon la
  vitesse (0,20 au plus), rebond de 0,11 à l'arrivée. Les trous (verre de la loupe, œil du
  curseur) sont un disque à part. L'objet laisse sa forme à chaque station qu'il quitte.
- **Durée** : 9 s. Voyages à 1,8, 4,2 et 6,6 s (1,2 s chacun), arrêts de 1,2 s.
- **Repères** : les quatre titres sont des boutons, plus « Rejouer ». Aucune pastille numérotée,
  la liste est un `<ol>` sans numéro affiché.
- **État final** : les quatre titres et leurs textes, trois petites formes laissées aux stations,
  l'objet sur la quatrième avec sa courbe. Le tracé final est écrit en dur dans le HTML.
- **Accent** : les textes sont toujours visibles. Avant le passage de l'objet, le titre est à
  0,60 d'opacité (contraste 4,6) et le texte à 0,85 (4,8).
- **À 390 px** : le rail passe en colonne, l'objet descend, les textes sont à droite.

### 5.3 Les chiffres, `#scene-resultats` et `#scene-preuve`

Ils montent une fois vers leur valeur, 1,2 s chacun, décalés de 0,14 et 0,18 s. Le HTML porte la
valeur finale, rendue telle quelle à la tenue. Le hero joue au chargement.

### 5.4 Les apparitions courantes

`[data-entree]` et courbe A du socle sur 16 blocs. Les titres de section montent de leur masque
(`.ligne`). Le H1 et le texte du hero ne sont pas animés. Rien d'autre ne bouge.

## 6. Les composants que la direction apporterait au site

| Composant | Paramètres |
|---|---|
| `SceneEncre` | titre, chapeau, contenu ; fond d'encre, lueur fixe, coins supérieurs de 32 px |
| `CarteVerre` | nom, éléments, retours, poses par temps ; les places en pointillés |
| `Faisceau` | sorties, impasses |
| `Reperes` | liste de `{ libellé, aller, tenir, jusqua }`, bouton « Rejouer » |
| `RailMorph` | stations `{ titre, texte, forme }` ; horizontal dès 1024 px, vertical en dessous |
| `PanneauResultats` | un résultat de tête et deux seconds `{ valeur, libellé, client }` |
| `LignePreuve` | logo, client, chiffre, libellé, second chiffre, lien |
| `ChiffreQuiMonte` | valeur, signe, décalage |
| `GrilleFormats` | deux formats principaux, deux seconds, étiquettes |
| `PanneauAppel` | titre, texte, deux boutons |
| `Pastille` | logo sur fond clair, pour les logos à fond blanc posés sur l'encre |

## 7. Les contrôles

Banc : deux cadres côte à côte, 390 x 844 et 1440 x 844, pilotés par `contentDocument`. L'onglet
était en arrière-plan : les scènes ont été posées à un instant puis capturées.

| Contrôle | 390 FR | 390 EN | 1440 FR | 1440 EN |
|---|---|---|---|---|
| `scrollWidth - clientWidth` | 0 | 0 | 0 | 0 |
| Hauteur de la page | 10 224 | 9 700 | 7 211 | 7 120 |
| Boutons sur deux lignes | 0 | 0 | 0 | 0 |
| Textes rognés | 0 | 0 | 0 | 0 |
| Deux boutons du hero côte à côte | oui, 344 px | oui, 307 px | oui, 414 px | oui, 377 px |
| Deux boutons de l'appel côte à côte | oui | oui | oui | oui |
| Textes sous 16 px | 0 | 0 | sans objet | sans objet |
| Cibles sous 44 px | 0 | 0 | 0 | 0 |
| Recouvrements d'éléments fixes, bandeau affiché | 0 | 0 | 0 | 0 |
| Recouvrements, bandeau fermé | 0 | 0 | 0 | 0 |
| Recouvrements, panneau ouvert (avec et sans bandeau) | 0 | 0 | 0 | 0 |
| Tiret cadratin (U+2014) ou demi-cadratin (U+2013) dans `body.textContent` | aucun | aucun | aucun | aucun |
| Nombres de la page | 2, 3, 31, 35, 50, 112, 145, 170, 225, 2026 | idem | idem | idem |
| `h1` | 1 | 1 | 1 | 1 |
| Images sans `width` ou `height`, images cassées | 0, 0 | 0, 0 | 0, 0 | 0, 0 |

Les nombres : 2 vient de « B2B », 3 de « 3 minutes », 2026 du pied de page. Tous sont dans
`CONTENU.md`.

`?fige=1` (390 FR et 1440 EN) : pas de classe `mv`, quatre scènes à l'état `posee` sur leur
instant de tenue, 0 style en ligne, 16 apparitions sur 16 faites, chiffres finaux, huit traits du
faisceau tracés, aucun bloc de contenu sous 0,99 d'opacité hors les logos (0,78, voulu).

Page sans aucun script (cadre en `srcdoc`, balises `script` retirées) : 0 débordement, 0 élément
invisible, scène complète aux deux largeurs.

Balayage : chaque scène posée de 0 à sa tenue par pas de 0,05 s, aux deux largeurs, sans erreur,
et 0 style en ligne au retour à la tenue.

Lecture des repères, avec une horloge de remplacement (l'onglet caché ne sert pas
`requestAnimationFrame`) : repère 2, de 5,1 à une tenue sur 9,1 ; repère 3, de 9,6 à 14 ;
station 2, de 1,8 à une tenue sur 3,9 ; « Rejouer », de 0 à 9 puis état `posee`. Le bouton
allumé suit le temps en cours.

Largeurs intermédiaires : 1024 px vue à l'écran (plateau en trois colonnes) ; 1100, 1200, 1280 et
1360 px mesurées sans capture (0 débordement, 0 bouton sur deux lignes, 0 texte rogné).

Question ouverte : le `summary` reste à la même hauteur d'écran avant et après (300 px, 300 px).

Instants vérifiés à l'écran, aux deux largeurs. Scène principale : 0 ; 0,5 ; 0,6 ; 1,0 ; 1,3 ;
2,6 ; 4,6 ; 5,5 ; 5,75 ; 7,2 ; 7,3 ; 9,1 ; 11,2 ; 12,15 ; 12,4 ; 13,2 ; 14. Méthode : 0 ; 0,45 ;
2,4 ; 3,15 ; 5,0 ; 7,3 ; 9, plus une planche de douze instants de l'objet seul.

### Ce qui a été corrigé après l'avoir vu

1. La plaque claire du hero passait devant le panneau d'encre : elle est devenue une ombre portée sans flou.
2. La carte tournait le dos aux réseaux au temps 2 : signes du pivot inversés.
3. Le bas de la carte restait vide aux temps 1 et 2 : les neuf places en pointillés.
4. Les traits des garde-fous étaient visibles dès le temps 1 sur téléphone : ils sont animés.
5. La barre des garde-fous ressemblait à un liseré posé à gauche d'un texte : remplacée par le signe interdit.
6. Les impasses du faisceau s'arrêtaient 26 px avant leur signe.
7. À 1440, le chiffre de la preuve recouvrait son libellé : grille commune aux trois lignes.
8. À 390, « Signaux d'audience » touchait le bord de sa puce : puces à leur largeur.
9. Les titres des stations étaient décalés de 7 px : un bouton centre son contenu en hauteur.
10. Les textes atténués de la méthode tombaient à 2,8 de contraste : 0,85 d'opacité au lieu de 0,60.
11. À 1024, la machine recouvrait les deux phrases : colonne centrale à sa largeur.
12. L'objet de la méthode se posait à 9 px de sa station : la mesure datait d'avant la police.
13. Le téléphone passait 57 % de surface sombre, panneaux compris : format Performance Max clair sous 1024 px.
14. Cibles de 40 px (en-tête) et 36 px (pied de page) portées à 44 px.

### Ce qui n'a PAS pu être vérifié

- **Le mouvement lui-même.** L'onglet était caché : aucune scène n'a été vue en train de jouer.
  Fluidité, cadence et justesse des durées à l'œil ne sont pas jugées.
- **Le déclenchement réel à l'entrée dans l'écran.** `IntersectionObserver` ne se déclenche pas
  dans un onglet caché. Vérifié avec un observateur de remplacement, pas avec le vrai.
- Un vrai téléphone, Safari, Firefox. Tout a été vu dans Chrome, dans un cadre de 390 px.
- La netteté du texte de la carte sur un écran de densité 1, la carte étant tournée de 5°.
- `prefers-reduced-motion` par le réglage du système : il emprunte le chemin de `?fige=1`.
- Lecteur d'écran, navigation au clavier de bout en bout, Lighthouse.
- Le menu du téléphone n'a été vu ouvert qu'en anglais, à 390 px.

## 8. Les limites connues et les questions pour Paul

**Défaut du socle, relevé puis corrigé dans le socle pendant le travail.** Au changement de
langue, `page.js` appelait `aller(t)` sur chaque scène, ce qui la marquait comme déjà jouée : une
scène pas encore vue restait vide à son instant zéro et ne jouait plus à son entrée. Le socle a
reçu `reposer()` le 30/09/2026 à 00 h 15 (je n'y ai pas touché). `direction-a.js` utilise
`reposer()` quand elle existe, et garde sa fonction `veiller` en filet de sécurité. Revérifié avec
le socle corrigé : après un changement de langue les scènes restent en `attente`, et jouent une
seule fois à leur entrée.

**Limites.**

1. **Sur téléphone, la scène principale fait 1 546 px, presque deux écrans.** Elle joue au temps :
   les temps 2 et 3 peuvent se jouer sous l'écran si le visiteur lit la première phrase sans
   défiler. L'état final reste complet et les repères rejouent chaque temps.
2. Le volume de la carte est discret : une plaque à 22 px et 5° de rotation au repos.
3. Entre deux formes, l'objet de la méthode passe par une tache sans nom pendant une demi-seconde.
   Ses quatre formes sont dessinées par le code, elles ne viennent pas de la famille d'icônes.
4. Le format Performance Max est un panneau d'encre sur ordinateur et un panneau clair sur
   téléphone : le système n'est pas le même aux deux largeurs.
5. Le verbatim tient en trois lignes à 1440, mais en six (français) et cinq (anglais) à 390, à 22 px.
6. En-tête : le bouton « Calculer mon budget » est en pilule et les cibles font 44 px, contre un
   rayon de 8 px et 40 px sur le site. Les menus déroulants ne sont pas reproduits.
7. `subgrid`, `text-wrap: balance` et `overflow: clip` demandent des navigateurs récents. Un
   repli existe pour `overflow: clip`, pas pour `subgrid`.
8. Le pied de page fait 1 098 px à 390, à cause des cibles de 44 px.

**Questions.**

1. La part sombre se compte-t-elle sur les sections (42 à 45 %) ou panneaux compris (52 à 53 %) ?
   Dans le second cas, le premier à éclaircir est le format Performance Max sur ordinateur.
2. Sur téléphone, préfères-tu la scène au temps, comme ici, ou découpée en trois scènes courtes
   qui jouent chacune à leur entrée ?
3. La carte doit-elle pencher davantage au repos, au prix d'un texte un peu moins net ?
4. Les chiffres du hero qui montent au chargement : on garde, ou le hero reste immobile comme sur
   le site actuel ?
