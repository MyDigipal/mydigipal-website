# Direction B, « Grille »

Maquette de la page Google Ads, refonte du site MyDigipal, 29/09/2026.
Fichiers : `direction-b.html` (732 lignes), `direction-b.css` (578), `direction-b.js` (410).
Adresse : `http://localhost:4173/labo/refonte-site/direction-b.html` (`?langue=en`, `?fige=1`).

## 1. Le parti pris

Le style suisse : la grille de douze colonnes se voit, la typographie porte tout, et les aplats
ponctuent la page comme des couleurs d'affiche. Aucune ombre, aucun dégradé, aucun verre : du
blanc, un noir profond, le bleu du logo employé en pleins, et des filets d'un pixel.

Lecture de la commande : page de service d'agence pour des décideurs marketing (B2B, automobile),
langage typographique suisse, CSS natif et scènes en fonction pure du temps. Variance 7,
mouvement 6, densité 4.

## 2. La palette

| Jeton | Valeur | Usage |
|---|---|---|
| `--papier` | `#FFFFFF` | fond des sections claires, en-tête |
| `--gris` | `#F1F2F4` | fond froid (questions) |
| `--filet` | `#D9DCE1` | filets secondaires (menu) |
| `--noir` | `#0C1116` | texte, filets forts, sections sombres, tuiles du tableau |
| `--marque` | `#1D71B8` | bleu du logo : section pleine, bloc de la campagne, bouton principal, volet de l'unité |
| `--marque-fonce` | `#155A93` | survol du bouton principal |
| `--secondaire` | `#4A525C` sur clair, `#A7AEB7` sur noir, blanc à 93 % sur bleu | texte courant secondaire |
| `--trame` | noir à 5,5 % sur clair, blanc à 4,5 % sur noir, blanc à 7 % sur bleu | les colonnes visibles |

Chaque section pose ses encres (`--fond`, `--encre`, `--secondaire`, `--regle`, `--trame`) : un
composant ne connaît que ces cinq noms et se pose sur n'importe quel fond. Un seul accent, le bleu.

Surface sombre ou pleine couleur mesurée (sections noires et bleue, pied compris) :
43,2 % à 1440 en français, 44,4 % en anglais ; 45,6 % à 390 dans les deux langues.
Plus longue suite claire à 1440 : 1 333 px (les formats).

## 3. Les polices

Une seule famille : **Archivo** variable, axes `wdth` (62 à 125) et `wght` (100 à 900), depuis
Google Fonts en maquette (`display=swap`). Poids relevé par le digest : 90,1 Ko en woff2, sous-ensemble
latin. À héberger par le site en production. Les axes ne sont jamais animés.

| Rôle | Réglage | 1440 px | 390 px |
|---|---|---|---|
| Titre 1 (H1, appel final) | 800, largeur 116, approche -0,02em, interligne 1 | 79 px | 38 px |
| Titre 2 (H2) | 800, largeur 116, interligne 1,04 | 56 px | 30 px |
| Titre d'un grand format | 800, largeur 116 | 60 px | 32 px |
| Titre 3 (temps, quais) | 800, largeur 110 | 22 à 24 px | 20 à 21 px |
| Chapeau | 400, largeur 100, interligne 1,45 | 21 px | 18 px |
| Texte | 400, interligne 1,55 | 17 px | 17 px (16 px dans les scènes) |
| Chiffres | 700, chiffres tabulaires | 48 px (hero), 72 px (volets) | 36 px, 54 px |
| Libellés | 600, casse de phrase | 13 px | 16 px |

Aucun monospace, aucune capitale espacée. Une seule rubrique au-dessus d'un titre sur toute la page
(« Google Ads », dans le hero).

## 4. Le rythme

| # | Section | Fond | Hauteur à 1440 (FR) |
|---|---|---|---|
| 1 | Hero : H1 sur neuf colonnes, registre des trois résultats sur les colonnes 10 à 12 | papier, trame visible | 637 px |
| 2 | Logos : une rangée, un logo par colonne, entre deux filets | papier | 149 px |
| 3 | Performance Max : la scène principale | **noir**, trame visible | 1 405 px |
| 4 | Formats : un sommaire de quatre rangées, deux hauteurs | papier | 1 333 px |
| 5 | Méthode : la seconde scène | **bleu plein**, trame visible | 806 px |
| 6 | Preuve : le tableau à palettes, puis le verbatim | papier | 1 244 px |
| 7 | Questions fréquentes | gris | 827 px |
| 8 | Appel final, puis pied de page séparé par un filet | **noir**, trame visible | 540 + 489 px |

Formes : angles droits partout, 2 px sur les boutons, aucun arrondi ailleurs. Seul le visage de
l'assistant est rond (il vient du socle, avec son ombre).

## 5. Les animations

Toutes les scènes n'écrivent que des propriétés personnalisées (`--p`, `--b`, `--d`...) dont le
repli, dans la feuille de style, est l'état final. Le même `rendu(t)` sert l'ordinateur et le
téléphone : c'est la feuille de style qui décide si un trait se trace en largeur ou en hauteur.

### 5.1 `#scene-pmax` : Performance Max en schéma suisse

- **Ce qu'elle explique** : Google choisit où montrer l'annonce, nous choisissons ce qu'il apprend.
- **Essai d'origine** : `grille-suisse` (grille qui se déploie, barre qui passe, bloc qui s'arrête
  sur les lignes).
- **Technique** : DOM et CSS, `transform` et `opacity` seulement. Grille CSS de douze colonnes,
  neuf rangs fixes de 64 px, sous-grilles pour les listes.
- **Durée** : 12,2 s. **Repères** : trois boutons (un par temps) et « Rejouer ».

| Instant | Ce qui se passe |
|---|---|
| 0,00 à 1,00 | les douze colonnes se déploient, une à une (0,5 s chacune, 45 ms d'écart) |
| 0,60 à 1,25 | le bloc bleu glisse dans sa voie depuis le bord droit et s'arrête sur ses colonnes |
| 1,35 à 2,80 | temps 1 : six entrées révélées par la barre (0,32 s + 0,32 s), six traits vers le bloc |
| 2,80 à 4,40 | tenue de lecture (1,60 s) |
| 4,40 à 5,84 | temps 2 : six traits sortent du bloc, six écrans s'allument l'un après l'autre |
| 5,84 à 7,40 | tenue de lecture (1,56 s) |
| 7,40 à 8,52 | temps 3 : la ligne descend des réseaux, revient de droite à gauche, remonte dans le bloc |
| 8,45 à 9,66 | trois jetons glissent sur la ligne, un à la fois, jusqu'à leur arrêt |
| 9,70 à 10,80 | deux garde-fous : leur trait part vers le bloc et bute sur un arrêt |
| 11,00 à 12,03 | la phrase de conclusion monte de son masque, en deux lignes |

- **État final** : tout le schéma, les trois textes et la conclusion. Aucun repère allumé.
- **À 390 px** : le schéma est refait en trois chapitres empilés, chacun sous son texte. Entrées en
  grille de deux colonnes, deux traits fléchés vers le bas ; bloc bleu en pleine largeur ; réseaux
  en grille de deux colonnes ; ligne de retour verticale, fléchée vers le haut, avec ses trois
  jetons ; garde-fous en pleine largeur. Rien n'est réduit à l'échelle.

### 5.2 `#scene-methode` : la méthode en quatre temps

- **Ce qu'elle explique** : un seul compte traverse quatre états, de l'audit au reporting.
- **Essai d'origine** : `morph-formes`. **Technique** : SVG en ligne, attribut `d` réécrit pendant
  les voyages (240 points), tuile déplacée en `transform`. Quatre contours : loupe, structure,
  curseur de réglage, courbe qui monte.
- **Durée** : 10 s. Voyages à 2,5, 5,3 et 8,1 s (1,2 s chacun) ; tenues de 1,55 s à chaque quai.
- **État final** : la tuile noire au quatrième quai avec la courbe, les quatre marques pleines, le
  titre du quai souligné. Les quatre titres et textes sont toujours visibles.
- **À 390 px** : le rail passe en colonne à gauche, la tuile descend (64 px au lieu de 112).

### 5.3 `#scene-preuve` : le tableau à palettes

- **Ce qu'elle explique** : trois résultats de clients, posés comme sur un tableau de départs.
- **Essai d'origine** : `tableau-chiffres`. **Technique** : volets en `rotateX`, chute en
  `MDP.courbes.chute`, sans rebond. Cinq cellules par ligne (signe, trois chiffres, unité).
- **Durée** : 2,6 s, tout est posé à 2,2 s. Lignes à 0,20, 0,90 et 1,60 s.
- **Accessibilité** : les volets sont en `aria-hidden`, le chiffre est doublé en texte lu.
- **À 390 px** : mêmes cinq volets (50 x 68 px), le texte passe dessous.

### 5.4 Les apparitions courantes

`[data-entree]` et `.ligne` du socle, courbe A. Trame des sections : colonnes en `scaleY`, 0,5 s,
45 ms d'écart. Sous 768 px, un titre redevient un seul paragraphe équilibré et monte d'un bloc de
son masque (des lignes imposées se recoupaient mal).

## 6. Les composants que la direction apporterait au site

| Composant | Paramètres |
|---|---|
| `Grille` | colonnes (4, 8, 12), marge, gouttière |
| `Trame` | fond de la section, déploiement à l'entrée ou piloté par une scène |
| `Section` | fond : papier, gris, noir, bleu (pose les cinq encres) |
| `TitreMasque` | niveau, lignes par langue |
| `Registre` | lignes : valeur, libellé, client (hero) |
| `RangLogos` | logos, hauteur optique par logo |
| `BarrePassante` | texte, instant de départ (geste de révélation) |
| `SchemaFlux` | entrées, bloc, sorties, retours, garde-fous, conclusion, trois temps |
| `Sommaire` | rangées : nom, texte, mots ; niveau grand ou courant |
| `RailMorphing` | quais : titre, texte, contour |
| `TableauPalettes` | lignes : client, logo, signe, chiffres, unité, libellé, second chiffre, lien |
| `Verbatim` | citation, auteur |
| `Questions` | paires question et réponse |
| `Bouton` | plein, trait, court ; `Paire` pour deux boutons côte à côte |

## 7. Les contrôles

Banc : deux cadres sur `localhost:4173`, 390 x 844 et 1440 x 844, scènes posées par
`__scene.aller(t)`, apparitions forcées, transitions coupées.

| Contrôle | 390 FR | 390 EN | 1440 FR | 1440 EN |
|---|---|---|---|---|
| `scrollWidth - clientWidth`, bandeau affiché puis fermé | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Éléments hors écran, textes qui débordent de leur boîte | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Boutons sur deux lignes | 0 | 0 | 0 | 0 |
| Deux boutons côte à côte (hero, appel final) | oui | oui | oui | oui |
| Chevauchement des éléments fixes, quatre états | 0 | 0 | 0 | 0 |
| Tirets cadratins et demi-cadratins | 0 | 0 | 0 | 0 |
| Nombres hors `CONTENU.md` | 0 | 0 | 0 | 0 |
| `h1` | 1 | 1 | 1 | 1 |
| Cibles sous 44 px | 0 | 0 | 0 | 0 |
| Textes sous 16 px | 0 | 0 | libellés à 13 et 14 px | idem |
| Contraste le plus bas | 4,66 | 4,66 | 4,66 | 4,66 |

- Quatre états des éléments fixes : bandeau affiché, bandeau affiché et panneau ouvert, bandeau
  fermé, bandeau fermé et panneau ouvert.
- Nombres présents : 112, 35, 225, 50, 145, 170, 31, 3, 2026, et le 2 de « B2B ».
- Autres largeurs, en français et en anglais : 360, 768, 1024, 1280, 1920. Débordement 0, aucun
  bouton sur deux lignes, en-tête sur une ligne sans chevauchement.
- `?fige=1`, quatre cas : les trois scènes sont posées (12,20, 10,00, 2,60), aucun contenu
  invisible, débordement 0.
- `rendu(tenue)` comparé à l'état sans script : 0 écart de position ou d'opacité sur 141 à 255
  éléments par scène, aux deux largeurs. Tracé SVG et caractères des volets identiques au HTML.
- Pureté : chaque scène posée au même instant après trois passés différents rend le même état
  (13 instants testés).
- Instants vus à l'écran. Performance Max à 1440 : 0, 0,95, 1,95, 4,3, 5,0, 7,3, 8,9, 10,35, 11,25,
  12,2 ; à 390 : 0,9, 2,0, 4,3, 5,0, 12,2. Méthode à 1440 : 0,55, 2,4, 3,1, 5,2, 8,0, 8,75, 10 ;
  à 390 : 0,6, 3,1, 6,0, 8,75, 10. Preuve à 1440 : 0, 0,47, 1,78, 2,6 ; à 390 : 0,47, 1,1, 2,2, 2,6.
- Aucune erreur dans la console. Balises équilibrées, aucun identifiant en double.

**Ce qui n'a pas pu être vérifié**

- La lecture en temps réel : la fenêtre de Chrome était en arrière-plan, les scènes ont été jugées
  image par image, jamais en mouvement. La fluidité reste à juger à l'œil.
- Le déclenchement à l'entrée dans l'écran et l'apparition du bouton flottant après 400 px.
- Un vrai téléphone, Safari, Firefox. La page emploie `subgrid`, `overflow: clip`, les unités
  `cqw` et `text-wrap: balance`.
- Le réglage système « moins de mouvement » (seul `?fige=1` a été testé), le clavier, un lecteur
  d'écran, Lighthouse, les états de survol.

## 8. Les limites connues et les questions pour Paul

**Limites**

1. À 390 px, la surface sombre est à 45,6 %, un demi-point au-dessus de la cible.
2. Le verbatim tient sur trois lignes à 1440, sur six à 390.
3. Sur le bleu, le texte courant est à 4,66 de contraste : conforme, sans marge.
4. À 390 px, le schéma est découpé en trois chapitres. Les liaisons entre chapitres sont des
   flèches, pas des traits continus, et la ligne de retour ne touche pas le bloc.
5. À 390 px, la scène fait 1 557 px de haut : elle part quand le premier chapitre est à l'écran,
   les deux suivants peuvent jouer sous l'écran. Chaque repère rejoue son chapitre.
6. « Deux rangées barrées d'un trait » est rendu par un trait qui bute sur un arrêt, et non par un
   trait qui raye le texte : la première version rayait les mots et les rendait pénibles à lire.
7. Pendant un voyage (1,2 s), la forme intermédiaire est une tache sans nom.
8. Sept logos sur douze sont livrés sur fond blanc (un sur fond rose) : ils ne tiennent que sur le
   papier. Ils sont passés en niveaux de gris par un filtre.
9. Les sous-menus de l'en-tête s'ouvrent au survol et au clavier, sans gestion du toucher.

**Défaut du socle, contourné dans `direction-b.js`**

Au changement de langue, `page.js` repose chaque scène par `aller()`, ce qui la marque comme déjà
jouée : une scène encore sous l'écran resterait vide. La fonction `veiller()` la remet en attente.

**Questions**

1. La trame à 5,5 % sur le papier : assez présente, ou trop ?
2. Le H1 est à 79 px à 1440 (trois lignes en français). Le brief de direction visait 92 px, soit
   quatre lignes et un hero plus haut que l'écran d'un portable. On monte ?
3. Les garde-fous en traits arrêtés : lisible, ou préférez-vous le texte rayé ?
4. La charnière des volets coupe les chiffres d'un filet : on la garde ?
