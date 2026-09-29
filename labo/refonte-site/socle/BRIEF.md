# Brief commun des maquettes de la refonte du site (29/09/2026)

Trois directions de design sont construites en parallèle, sur la MÊME page type (la page de
service Google Ads) et le MÊME contenu. Paul Andre, fondateur de MyDigipal, les comparera sur son
ordinateur et surtout **sur son téléphone, à 390 px de large**, puis en choisira une. Ce qu'il
choisit sera décliné sur tout le site : la maquette doit donc être un vrai système (palette,
polices, rythme des sections, animations), pas une page décorée.

## 1. Ce que Paul reproche au site actuel

- Tout est devenu blanc sur blanc, avec au mieux un léger fond bleu.
- Les sections sombres qui ponctuaient la page et cassaient le rythme ont disparu.
- Les pages se ressemblent et se lisent comme une suite de blocs.

Mesuré le 29/09/2026 sur la page Google Ads en ligne : 13 % de surface sombre, 4 892 px
d'affilée sans aucune section sombre, 11 pastilles numérotées, quatre puis six cartes égales,
une pilule de rubrique au-dessus de chaque titre, des chiffres sans source (« 8.5B », « 65% »,
« 200% »), et aucune animation qui explique quoi que ce soit.

## 2. Ce qu'il veut

- **Du rythme** : des sections sombres qui ponctuent, des contrastes, des changements de fond,
  une hiérarchie nette. Sortir du blanc sur blanc sans tomber dans le tout sombre. Viser 35 à
  45 % de surface sombre ou pleine couleur, jamais deux sections sombres collées sans raison.
- **Des animations qui expliquent**, jamais qui décorent. Une idée forte par animation.
- L'identité MyDigipal gardée (bleu du logo `#1D71B8`, vrai logo), avec du caractère.
- **Une qualité de studio.** Chaque image arrêtée de la page doit être belle.

## 3. Ses goûts en mouvement (lire `AVIS-PAUL.md` et le digest avant de coder)

- `C:\Users\paula\AppData\Roaming\Claude\.claude\projects\_shared\motion-lib\AVIS-PAUL.md`
- Le digest technique des essais, avec le code utile et l'adaptation web recommandée :
  `C:\Users\paula\AppData\Local\Temp\claude\C--Users-paula-AppData-Roaming-Claude--claude-projects-MyDigipal-Website\c057e6a0-1989-4b0d-89bc-85cccd96b790\scratchpad\digest-motion.md`
- Les essais eux-mêmes : `...\_shared\motion-lib\labo\essais\*.html` (écrits pour la vidéo).

Il adore : l'interface filmée par une caméra qui tient la pose puis glisse ; la carte de verre
qui vit avec une phrase à gauche et une à droite ; l'isométrie pour illustrer un process ; le
morphing de formes pour une évolution ; le tableau à palettes pour trois points ; les particules
qui font apparaître un logo ; la grille suisse ; le collage « à l'ancienne ».

Il refuse : le zoom continu (« on ne sait pas où ça va ») ; tout flou ou masque sur ce qu'on
lit ; un effet seul, sans histoire ; un texte qui bouge pour rien (« vieilles slides ») ; des
polices différentes qui s'enchaînent.

**Courbe signature : la A, nette.** Entrée `outExpo` sur 0,55 s, sortie `inCubic` sur 0,40 s,
éléments secondaires 33 ms plus tard. Elle est dans le socle (`--mdp-entree`, `--mdp-sortie`,
`MDP.courbes.entree`, `MDP.courbes.sortie`). Le dépassement (`MDP.courbes.depasse`, `MDP.ressort`)
est réservé aux OBJETS (carte, étiquette, jeton), jamais à un texte.

## 4. Interdits de design (une seule infraction fait refuser la maquette)

1. Aucun liseré coloré sur le côté ou en haut d'un encadré.
2. Aucune pastille numérotée 01 / 02 / 03, aucun « Étape 1 ».
3. Pas de trois (ou quatre, ou six) cartes égales par réflexe.
4. Aucun dégradé violet-bleu, aucun halo néon, aucun texte en dégradé.
5. Aucun emoji. Icônes en SVG, d'une seule famille, trait de 1,5 ou 2.
6. Aucun logo redessiné : les vrais fichiers seulement. Jamais Kering ni Chanel.
7. Aucun grain qui crépite, aucun bruit animé.
8. Aucun texte qui défile ligne après ligne au même endroit (pas de mots qui se remplacent).
9. Aucun titre en monospace, en capitales espacées. Le monospace ne sert qu'aux durées et aux
   comptes. Pas de pilule de rubrique au-dessus de chaque titre : une rubrique pour trois
   sections au plus.
10. Jamais deux boutons empilés : côte à côte, y compris à 390 px.
11. L'écran ne bouge pas quand on clique : un contenu qui s'ouvre ne déplace pas ce qu'on lit.
12. Aucun contenu caché derrière un dépliage, sauf la foire aux questions.
13. Aucun tiret cadratin ni demi-cadratin, nulle part. Aucun tiret utilisé comme conjonction.
14. Aucun chiffre qui ne soit pas dans `CONTENU.md`.
15. Aucune fausse capture d'écran d'un produit qui existe. Un schéma est un schéma.
16. Pas d'indication de défilement (« Scroll »), pas de curseur personnalisé.

## 5. Le contrat technique

Fichiers à produire, dans `C:\dev\sv\labo\refonte-site\` :

- `direction-<lettre>.html` : la page, à partir de `socle/GABARIT.html` ;
- `direction-<lettre>.css` : palette, polices, mise en page, en propriétés personnalisées
  (`--fond`, `--encre`...) déclarées une fois dans `:root` ;
- `direction-<lettre>.js` : les scènes de la direction ;
- `direction-<lettre>.md` : la fiche de la direction (voir section 7).

Ne modifie AUCUN fichier hors de `labo/refonte-site/direction-<lettre>.*`. Le dossier `socle/`
est partagé par trois agents : lecture seule. Si le socle a un défaut, contourne-le dans tes
fichiers et signale-le dans ta fiche.

Règles :

- HTML, CSS et JavaScript écrits à la main. Aucune bibliothèque, aucun cadre, aucun CDN de script.
  Les polices viennent de Google Fonts en maquette (`display=swap`) ; Inter et Plus Jakarta Sans
  peuvent aussi venir de `../../public/fonts/`.
- **L'état par défaut de la page est l'état final.** Sans JavaScript et avec
  `direction-<lettre>.html?fige=1`, tout le contenu est visible, lisible, en place. L'état de
  départ d'une animation ne s'applique que sous `html.mv` (apparitions) ou par `rendu(0)` (scènes).
- **Une scène = `MDP.scene(element, { tenue, rendu })`** où `rendu(t, el)` est une fonction PURE
  du temps : elle pose l'état exact de l'instant `t`, sans mémoire, sans `Math.random` (utiliser
  `MDP.graine`). `rendu(tenue)` doit redonner exactement l'état final du HTML.
- Une scène joue UNE fois à l'entrée dans l'écran, puis s'arrête. Aucune boucle permanente, aucun
  `requestAnimationFrame` qui tourne après la pose, aucun écouteur de défilement
  (`window.addEventListener('scroll')` est interdit).
- La scène principale porte **trois repères cliquables** (`<button data-aller="..."
  data-tenir="..." data-jusqua="...">`), un par temps de l'explication, et un bouton
  `data-rejouer`. Le visiteur sait toujours où il en est et où ça va.
- Seules `transform` et `opacity` sont animées, sauf sur de petites surfaces (un tracé SVG, un
  attribut `d`, un canevas). Jamais `width`, `height`, `top`, `left`, `filter: blur()`.
- Tous les textes de l'animation sont du VRAI texte dans le HTML, dans les deux langues. Rien
  d'écrit dans un canevas, rien d'injecté par le script.
- Accessibilité : un seul `h1`, des `h2` par section, contraste AA (4,5 pour le texte), cibles
  de 44 px au moins, focus visible, `aria-hidden` sur ce qui n'est que décor.
- Performance : images avec `width`, `height`, `loading="lazy"` (sauf au-dessus de la ligne de
  flottaison), `decoding="async"`. Rien de lourd au-dessus de la ligne de flottaison.
- Les deux appels flottants, le panneau et le bandeau viennent du gabarit, copiés tels quels.
  Donne à `--entete` (dans `:root`) la hauteur de ton en-tête.
- À 390 px : aucune barre de défilement horizontale, texte de 16 px au moins, les scènes sont
  REFAITES pour cette largeur (on ne réduit pas un dessin de 1 200 px à 0,3 : on change la mise
  en page, on sort les étiquettes du dessin, on passe un rail horizontal en colonne).

## 6. Vérifier à l'écran, vraiment

Un serveur local tourne déjà : `http://localhost:4173/labo/refonte-site/direction-<lettre>.html`
(racine : `C:\dev\sv`). L'extension Claude-in-Chrome refuse `file://` mais accepte cette adresse.

1. Charge les outils du navigateur en UN appel :
   `ToolSearch` avec `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__browser_batch,mcp__claude-in-chrome__tabs_close_mcp`.
2. `tabs_context_mcp`, puis **crée TON onglet** (`tabs_create_mcp`) et n'utilise que lui.
   D'autres agents travaillent dans le même navigateur : ne touche à aucun autre onglet.
   N'utilise jamais Playwright.
3. **La fenêtre de Chrome est en arrière-plan** : `requestAnimationFrame` n'y tourne presque pas,
   les transitions avancent mal, `IntersectionObserver` ne se déclenche pas toujours. Donc on ne
   vérifie pas une scène en la regardant jouer : on la POSE à un instant et on capture.
   `document.querySelector('#scene-pmax').__scene.aller(3.2)` puis capture d'écran. Vérifie au
   moins six instants par scène, dont `0`, chaque tenue, et `tenue`.
   Pour les apparitions : `document.querySelectorAll('[data-entree]').forEach(e =>
   e.classList.add('est-entre'))` et une feuille `*{transition:none!important}` avant la capture.
4. **Le banc bureau et téléphone** : ouvre n'importe quelle page de `localhost:4173`, vide le
   `body`, et pose deux cadres côte à côte, l'un de 390 x 844 (`?langue=en`), l'autre de
   1440 x 844 (`?langue=fr`), tous deux sur ta maquette. Les requêtes de média répondent à la
   largeur du cadre. Tu mesures et tu pilotes par `cadre.contentDocument` et
   `cadre.contentWindow`. C'est ainsi qu'on voit la page à 390 px (la fenêtre de Chrome ne
   descend pas sous 500 px).
5. Contrôles à faire et à consigner dans la fiche, à 390 et à 1440, en français ET en anglais :
   - `document.documentElement.scrollWidth - clientWidth` vaut 0 ;
   - aucun texte coupé, aucun bouton sur deux lignes, les deux boutons du hero côte à côte ;
   - les éléments en `position: fixed` ne se recouvrent pas (en-tête, bouton du calculateur,
     visage, bandeau cookies, panneau ouvert), bandeau affiché puis fermé ;
   - `?fige=1` : page complète, aucune zone vide ;
   - `document.body.textContent` ne contient ni `\u2014` ni `\u2013` ;
   - les nombres de la page sont tous dans `CONTENU.md`.
6. Une capture peut échouer par dépassement de délai quand le navigateur est chargé : réessaie une
   fois, avec `scale: 0.5`. Ne prends pas de capture inutile.
7. Juge ton travail comme un directeur artistique : si une section ressemble à ce qu'un
   générateur de pages produit par défaut (titre centré, trois cartes, icône dans un carré),
   refais-la.

## 7. La fiche de la direction (`direction-<lettre>.md`)

En français, courte, factuelle :

1. Le parti pris en deux phrases.
2. La palette (nom du jeton, valeur, usage) et la part de surface sombre mesurée.
3. Les polices (famille, graisses, poids des fichiers si connu) et l'échelle typographique.
4. Le rythme : la suite des sections avec leur fond.
5. Les animations : pour chacune, ce qu'elle explique en une phrase, l'essai dont elle vient, sa
   technique, sa durée, ses tenues, son état final, ce qui change à 390 px.
6. Les composants réutilisables que la direction apporterait au site (nom, paramètres).
7. Les contrôles faits, avec leurs résultats chiffrés, et ce qui n'a PAS pu être vérifié.
8. Les limites connues et les questions pour Paul.

## 8. Écriture

Français correct avec tous ses accents, casse de phrase dans les titres, espace insécable avant
`?`, `:`, `;`, `!`, `%`. Anglais britannique soigné. Pas de tournures creuses (« révolutionner »,
« booster », « sans effort », « nouvelle génération »). Les commentaires du code sont en français
et disent le pourquoi.
