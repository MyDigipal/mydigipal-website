# Notes de la famille « 3D et shaders »

Trois essais, écrits le 29/09/2026 sans pouvoir ouvrir de navigateur. Ce qui est garanti : la
syntaxe de chaque script (`node --check`), la validité des shaders en GLSL ES 1.00
(`glslangValidator`, profil WebGL1), l'existence de toute l'API Three r128 appelée (le build UMD
se charge dans Node), et la géométrie de la chorégraphie de la carte (projection calculée en Node :
hors champ à t = 0 et t = 8, posée sur 212 à 1122 px). Ce qui reste à voir à l'écran : le rendu réel
des reflets du verre en r128, le coût du dépoli sur une carte graphique de portable, la taille des
titres dans leur panneau.

## Le contrat, et deux détails qui ne sont pas dans le contrat

- **`window.DUR` en plus de `window.DUREE`.** Le `render.js` du moteur vidéo lit `window.DUR`
  (voir `motion-academy/render.js`), le labo lit `window.DUREE`. Chaque essai pose les deux, même
  valeur, pour être rendu tel quel par les deux.
- **`document.fonts.ready` n'attend que les polices déjà demandées par le DOM.** Le moteur vidéo
  attend `fonts.ready`, pas `window.PRET`. Une police qui ne sert qu'à dessiner dans un Canvas 2D
  (l'écran de la carte, le tracé du mot « AI Academy ») n'est jamais demandée par le DOM, donc
  jamais attendue, et le canvas se dessine avec une police de repli. Chaque essai porte un
  `#prechargeur` hors écran qui référence chaque police et chaque graisse dessinée. `PRET` fait en
  plus un `document.fonts.load()` explicite, mais c'est le préchargeur qui protège le rendu vidéo.

## Pièges WebGL en rendu image par image

- **`preserveDrawingBuffer: true`** sur chaque contexte, y compris celui que Three crée. Sans lui,
  la capture qui suit `render(t)` peut lire un tampon déjà vidé.
- **Une boucle qui se referme, c'est de l'arithmétique.** Tout ce qui bouge en permanence est une
  fonction de `sin` et `cos` de `2 pi t / DUREE` avec des multiples entiers : orbites des lumières
  du fond, respiration du fond des particules, et surtout le tourbillon, dont le nombre de tours
  par boucle est `1.0 + floor(graine * 2.0)`, donc entier. Un coefficient continu sur la vitesse
  angulaire (« chaque particule à sa vitesse ») casse la boucle sans qu'on le voie à l'œil avant le
  montage.
- **Ce qui n'est pas périodique doit être nul aux deux bouts.** Les poids d'assemblage, le
  flottement de la carte, la respiration des particules en place sont multipliés par une fenêtre
  qui vaut 0 à t = 0 et à t = DUREE. La carte, elle, est simplement hors champ aux deux bouts.
- **Aucun état accumulé.** Pas d'intégration de vitesse, pas de `dernier t`. Les particules sont
  des trajectoires fermées : `position(t) = mix(libre(t), cible, e(t)) + courbure(e)`. Le ressort
  amorti de la carte est la réponse indicielle d'un second ordre en forme fermée (`ressort(x,
  zeta, omega)`), pas une simulation.
- **Un tableau d'attributs activé sans tampon lié fait échouer le `drawArrays`** (INVALID_OPERATION),
  même si le programme courant ne s'en sert pas. Quand deux programmes n'ont pas le même nombre
  d'attributs, désactiver explicitement le second avant de dessiner le fond
  (`disableVertexAttribArray(1)`), et fixer les emplacements avec `bindAttribLocation` avant le
  `linkProgram`.
- **`pow(x, y)` est indéfini en GLSL ES pour x négatif.** Un `pow((p.x - u_sweep) * 2.2, 2.0)` se
  comporte différemment d'une carte graphique à l'autre. Écrire `gx * gx`.
- **`gl_PointSize` a un plafond qui dépend du pilote** (`ALIASED_POINT_SIZE_RANGE`, souvent 64,
  parfois moins). La passe de halo lit la plage et s'y plie (`haloK`).
- **Le tramage contre les bandes doit être fixe dans le temps.** Une trame de Bayer 4x4 à 1/255,
  identique à chaque image, casse les bandes des dégradés sans le crépitement que Paul refuse. Un
  bruit tiré par pixel et par image aurait exactement le défaut interdit.
- **`precision highp float`** derrière `#ifdef GL_FRAGMENT_PRECISION_HIGH`, avec repli mediump.
  La validation ES 1.00 exige une précision déclarée dans le fragment.
- **Un `if` sur `sd < 0.02`** évite de payer les six échantillons du dépoli sur toute l'image :
  seul le panneau les calcule. Si un portable peine malgré tout, le fond peut se rendre dans un
  canvas de 960 x 540 étiré en CSS à 1920 x 1080 : un dégradé lissé ne perd rien à la demi-résolution
  et le coût est divisé par quatre. Le liseré de la tranche, lui, resterait net s'il passait dans un
  second canvas ou dans le DOM.

## Three r128, ce qu'il sait faire et ce qu'il ne sait pas

- **`transmission` en r128 n'est pas une vraie réfraction.** C'est l'ancienne approximation :
  l'alpha du fragment devient `1 - transmission + luminance(spéculaire)`, donc le verre est
  transparent là où il ne reflète rien et opaque dans ses reflets. `thickness`, `ior`,
  `attenuationColor` n'existent pas (vérifié dans le build : zéro occurrence). Il faut
  `transparent: true`, sinon l'alpha est ignoré. Pour une vraie réfraction, passer à r15x et son
  `transmissionRenderTarget`, avec un coût d'un rendu supplémentaire par image.
- **L'environnement est cuit une fois** : `PMREMGenerator.fromScene(envScene, 0.035)` sur une
  scène de trois panneaux émissifs (fenêtre crème, bande cuivrée, point chaud) dessinés en Canvas
  2D. Déterministe, sans image externe, et c'est ce qui fait « verre » : les reflets courent sur
  les biseaux quand la carte pivote.
- **Le brouillard touche aussi `MeshBasicMaterial`.** Le halo additif derrière la carte, à
  z = -4,4, était éteint par le `Fog` de la scène jusqu'à `fog: false` sur son matériau. Même
  réglage pour l'ombre.
- **L'ombre est un sprite, pas une shadow map.** Un dégradé radial posé au sol, dont l'échelle et
  l'opacité suivent la hauteur de la carte. Douce, sans acné, sans réglage de caméra d'ombre, et
  strictement déterministe. Une shadow map d'une dalle de verre donnerait une ombre opaque.
- **Un `PointLight` qui traverse le champ** (intensité `2,6 sin(pi s)`, nulle aux deux bouts)
  suffit pour « la lumière qui glisse » : le clearcoat à rugosité 0,06 dessine un reflet net qui
  parcourt la dalle, et le sol en `MeshStandardMaterial` reçoit la même flaque.
- La texture de l'écran ne se redessine que quand son état change (caractères tapés, phase du
  curseur), avec `needsUpdate` à ce moment-là. L'état est une fonction de t, donc l'ordre des
  images n'a pas d'importance.

## Le déterminisme, jusqu'où il va

Sur une même machine, chaque `render(t)` donne la même image, quel que soit l'ordre des appels.
D'une machine à l'autre, deux choses peuvent différer légèrement : le rendu des polices (le tracé
de « AI Academy » qui sert de cible aux particules dépend du lissage du système, donc le nuage de
cibles varie de quelques points) et l'arithmétique flottante des cartes graphiques dans le hachage
du bruit. Pour un nuage de cibles identique partout, échantillonner le contour vectoriel de la
police (opentype.js) plutôt qu'un raster.

## Comment chaque essai devient un bloc paramétrable

Le moule commun : un bloc expose `PRET` (promesse), `DUREE`, et `render(tLocal)` ; il dessine dans
sa propre couche (un canvas ou un groupe DOM dans `#stage`) ; la page assemble les blocs en leur
passant `t - tDebut`. Rien d'autre à partager.

**Fond shader** (`creerFondAube(options)`) : `palette` (quatre couleurs de nuit, quatre d'aube,
couleur du fond), `courbeAube` (par défaut `pow(0.5 - 0.5 cos, 0.7)`, ou une constante pour un fond
qui reste en plein jour), `soleil` (abscisse, hauteur de départ et d'arrivée), `panneau` (demi-
largeur, demi-hauteur, rayon, instants d'ouverture et de fermeture, ou `null` pour un fond nu),
`balayage` (instants du reflet qui glisse), `lignes` (le titre, ses instants d'entrée et de sortie).
Les uniforms sont déjà découplés du temps : `u_ph`, `u_aube`, `u_verre`, `u_sweep` se calculent
en JS, donc n'importe quelle courbe d'animation peut les piloter.

**Carte 3D** (`creerCarteVerre(options)`) : `ratio` et `taille` de la dalle, `rayon`,
`dessinerEcran(ctx, tLocal)` fourni par l'appelant (n'importe quel écran : leçon, tableau de bord,
quiz), `poses` (entrée, tenue, sortie : position et rotation), `ressort` (zeta et omega de la
position et de la rotation), `lumiere` (instants et trajet de la source qui glisse), `studio` (les
panneaux de l'environnement, la couleur du fond, le halo). La texture, le matériau et le studio se
construisent une fois ; seule la chorégraphie change d'une vidéo à l'autre.

**Particules en lettres** (`creerParticulesTexte(options)`) : `texte`, `police`, `graine`, `pas`
de la grille (densité, donc nombre de particules), `plan` (instants de départ et de fin, étalement
par graine, sens du balayage de dispersion), `palette` (deux teintes et le blanc du cœur),
`halo` (facteur et opacité de la passe large), `flux` (rayons, aplatissement de l'ellipse, nombre
de tours). Le vertex shader reçoit tout par uniforms sauf ce qui est par particule.

## Vérifier sans navigateur, la recette

`scratchpad/verifier-essais.js` : extrait chaque script inline et le passe à `node --check` ;
extrait chaque tableau de shader, le préfixe de `#version 100` et le passe à `glslangValidator` ;
relit le contrat (STAGE, DUREE, render, preserveDrawingBuffer) et les interdits (rAF, Math.random,
Date, minuteries, animations CSS, tirets longs, domaines externes) ; charge `three.min.js` en Node
pour construire les géométries et vérifier les propriétés des matériaux. `projection-carte.js`
projette la boîte de la carte à plusieurs instants pour prouver le hors champ.

Le paquet npm `glslang-validator-prebuilt` échoue à l'installation sous Node 24 (son script
`build.js` ne trouve plus ses dépendances) : télécharger directement
`glslang-master-windows-x64-Release.zip` depuis les releases `master-tot` de KhronosGroup/glslang
et décompresser ; `glslangValidator.exe` valide un fichier `.frag` ou `.vert` seul.
