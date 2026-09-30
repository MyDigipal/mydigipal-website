# Notes du labo, famille « Rythme et son » (lot 2)

Trois essais écrits le 29/09/2026, sans bibliothèque et sans ouvrir de navigateur :
`courbes-signature.html` (16:9, 6 s), `bumper-son.html` (16:9, 6 s, avec son) et
`vertical-teaser.html` (9:16, 8 s). Tous respectent le contrat du moteur (`window.STAGE`,
`window.DUREE`, `window.render(t)` pur, `window.PRET` sur `document.fonts.ready` après un
`fonts.load` explicite de chaque graisse, `../lecteur.js` en dernier). Vérifiés hors navigateur
par `scratchpad/verif-lot2.js` : `node --check` sur chaque script, contrat et interdits relus,
181 ou 241 images rendues dans un DOM factice sans aucune valeur invalide, six instants rendus
dans l'ordre puis mélangés avec des états identiques, boucle vide ou identique aux deux bouts,
grille de la cue sheet, zone sûre du vertical. Ce qui reste à juger à l'écran : les largeurs
réelles des mots en Bricolage et en Unbounded (estimées à 0,62 em par caractère), la sonorité
de la piste synthétique, et le rendu du flou de l'ombre sur les trois cartes.

## La cue sheet, telle qu'elle est écrite dans le bumper

Un objet `CUE` unique, en tête du script, que `render(t)` et le moteur audio lisent tous les deux.
Rien d'autre ne porte un temps.

```js
const CUE = {
  bpm: 120, temps: 12,                       // une noire = 0,5 s = 15 images ; 12 temps = 6 s
  evenements: [
    { temps: 0,  id: 'pulse',    sons: [{ type: 'kick' }, { type: 'impact' }] },
    { temps: 1,  id: 'curseur',  sons: [{ type: 'clap' }] },
    { temps: 2,  id: 'ligne1',   sons: [{ type: 'kick' }, { type: 'souffle', avance: 0.9 }] },
    { temps: 3,  id: 'serre',    sons: [{ type: 'clap' }, { type: 'clic' }] },
    { temps: 4,  id: 'monte',    sons: [{ type: 'kick' }, { type: 'souffle', avance: 0.3, court: true }] },
    { temps: 5,  id: 'ligne2',   sons: [{ type: 'clap' }, { type: 'tintement' }] },
    { temps: 6,  id: 'legende',  sons: [{ type: 'kick' }] },
    { temps: 7,  id: 'clin',     sons: [{ type: 'clap' }] },
    { temps: 8,  id: 'souligne', sons: [{ type: 'kick' }, { type: 'souffle', avance: 0.3, court: true }] },
    { temps: 9,  id: 'tenue',    sons: [{ type: 'clap' }] },
    { temps: 10, id: 'tenue2',   sons: [{ type: 'kick' }] },
    { temps: 11, id: 'sortie',   sons: [{ type: 'clap' }] },
    { temps: 12, id: 'boucle',   sons: [{ type: 'souffle', avance: 0.45 }] }   // le temps 0 de la boucle suivante
  ],
  motifs: {                                  // les motifs continus, lus par le seul moteur audio
    charley: { de: 2, a: 12, pas: 0.5 },     // croches fermées, accent sur les contretemps
    basse:  [ { temps: 0, note: 'A1', d: 0.9 }, ... ],     // Am (temps 0 à 3), F (4 à 7), C puis G (8 à 11)
    nappe:  [ { temps: 0, a: 4, notes: ['A3', 'C4', 'E4'] }, ... ]
  }
};
```

- **L'image lit `E[id] = temps * 60 / bpm`.** Chaque geste de `render(t)` part d'un `E.xxx`, jamais
  d'un nombre écrit à la main. Déplacer un événement d'un temps déplace l'image et le son ensemble.
- **La pulsation lit la liste des kicks** (`KICKS`, filtrée depuis `CUE`). Le bloc bleu respire sur
  chaque grosse caisse sans qu'on ait recopié les temps.
- **`avance` fait partir un son AVANT son temps** pour que son pic tombe dessus : le souffle de
  0,9 s qui accompagne « MyDigipal » commence à 0,1 s et culmine à 1,0 s, sur l'image où la première
  lettre est posée. Une coupe posée au départ du souffle paraît en retard.
- **Le temps 12 existe** : c'est le temps 0 de la boucle suivante, et il porte le souffle de reprise
  (départ à 5,55 s, pic à 6,0 = 0). Dans le rendu hors ligne d'une seule boucle, il monte vers la fin
  du fichier ; sur deux boucles, il tombe sur la reprise.
- **Ce qu'on a vérifié** : 13 événements sur des temps entiers, 52 sons dont le pic est sur la grille
  des doubles-croches, kick sur 1 et 3 et clap sur 2 et 4, tous les départs dans [0, 6[.

## Le calage : comment le son suit l'image

- **Le point de vérité est le t que `render` reçoit.** `window.render = t => { rendre(t); hud(t);
  suivre(t); }` : `rendre` pose `#stage` et ne dépend que de t ; `hud` allume le point de tempo hors
  scène ; `suivre` transmet t au moteur audio, qui ne fait rien tant que personne n'a cliqué « Son ».
  Le rendu vidéo image par image ne clique jamais, donc il ne crée jamais d'AudioContext.
- **Une origine, pas une horloge.** `origine = ctx.currentTime - t` au moment du calage ; l'instant
  audio d'un son est `origine + tour * D + ev.t`. On planifie 0,3 s d'avance, depuis `suivre` (à
  chaque image) et depuis un `setInterval` de 50 ms qui prend le relais quand l'onglet est caché.
- **Recalage par reconstruction.** Si l'écart entre le t reçu et le t que l'audio prédit dépasse
  60 ms (un déplacement du curseur), on jette la chaîne de sortie et on en construit une neuve :
  tout ce qui sonnait s'arrête net, la partition repart de t, et les notes longues déjà commencées
  (nappe, basse) reprennent en cours de route avec leur durée restante. Le lot 1 laissait sonner les
  notes déjà planifiées, ce qui doublait les sons pendant 0,3 s après un saut.
- **Pause détectée sans message.** Trois images de suite avec le même t, c'est le lecteur en pause :
  le volume descend à zéro en 15 ms. Au premier t différent, on recale et on remonte.
- **La grille tombe sur des images entières.** 120 BPM à 30 i/s : une noire fait 15 images, une
  croche 7,5 (donc les croches du charley tombent une image sur deux à mi-image, ce qui est sans
  effet pour le son mais interdit d'y poser une coupe : les coupes sont sur les noires).

## La synthèse : ce qui sonne, avec quels réglages

Tout est Web Audio, sans fichier. Le bruit blanc et la réponse impulsionnelle de la réverbération
sortent d'un générateur à graine fixe (mulberry32), donc deux rendus donnent le même signal.

| Son | Recette | Niveau, départ réverb |
|---|---|---|
| Grosse caisse | sinus 150 vers 44 Hz en 110 ms, enveloppe 3 ms puis 340 ms ; plus 8 ms de bruit passe-haut 2,5 kHz (la batte) | 1,0 ; sec |
| Clap | trois bouffées de bruit passe-bande 1,4 kHz à 0, 11 et 22 ms, la troisième avec une queue de 160 ms | 0,5 ; 0,35 |
| Charley | bruit passe-haut 8 kHz, 45 ms | 0,09, accent 0,16 ; sec |
| Basse | dent de scie plus sinus à l'unisson, passe-bas 800 vers 130 Hz sur la note, résonance 4 | 0,42 ; sec |
| Nappe | trois notes, deux dents de scie par note désaccordées de plus ou moins 7 cents, passe-bas 420 vers 1 500 Hz sur la durée de l'accord, attaque 250 ms | 0,055 ; 0,55 |
| Souffle | bruit passe-bande 260 vers 3 800 Hz, résonance 1,1, volume en cloche dont le pic est à 92 % de la durée | 0,38 (court 0,22) ; 0,2 |
| Clic | 8 ms de bruit passe-haut 3,2 kHz plus un sinus 2,4 kHz de 20 ms | 0,4 ; sec |
| Tintement | sinus 880 et 1 318,5 Hz (quinte), le second 30 ms après, attaque 12 ms, queue 0,9 s | 0,16 et 0,11 ; 0,6 |
| Impact | bruit passe-bas 2 600 vers 160 Hz en 300 ms, 420 ms | 0,55 ; 0,5 |

Chaîne de sortie : bus, compresseur (seuil -12 dB, ratio 5, attaque 3 ms, relâche 120 ms), gain 0,9.
Réverbération par convolution sur une réponse synthétique de 1,6 s (bruit stéréo qui décroît en
exp(-3,2 t), attaque adoucie), retour à 0,35. Harmonie : Am (temps 0 à 3), F (4 à 7), C (8 à 11) avec
la basse qui passe par G sur les deux derniers temps pour ramener vers Am à la reprise.

**Le rendu hors ligne** : `exporterWav(tours)` construit la même chaîne dans un
`OfflineAudioContext(2, 48000 x 6 x tours, 48000)`, y pose la même partition `tours` fois, rend
plus vite que le temps réel, puis écrit un WAV PCM 16 bits avec tramage triangulaire d'un LSB (lui
aussi à graine fixe : deux exports sont identiques à l'octet près). Bouton « WAV » dans le HUD, ou
`window.Son.exporterWav(2)` dans la console pour la version bouclée. Montage :
`ffmpeg -i bumper.mp4 -i bumper-son-120bpm-6s.wav -c:v copy -c:a aac -b:a 192k -shortest bumper-final.mp4`,
puis `loudnorm` en deux passes vers -16 LUFS comme la chaîne d'`audio_narration.py`. Pour un
bumper qui ne boucle pas, arrêter le rendu image à 5,5 s garde le bloc « MyDigipal / AI Academy »
posé en dernière image ; le rendre entier garde la sortie qui referme.

## Les courbes : ce que les trois personnalités font, en chiffres

Une seule chorégraphie (`CHOREO` : carte à 0,40 s, texte à 1,25, souligné à 2,10, sorties à 4,40,
4,55 et 4,50) et trois objets `PERSONNALITES` qui ne portent que des fonctions de temps en
secondes : `entree(s)`, `sortie(s)`, `retard`, `suivi(s)`.

| | A · nette | B · élastique | C · souple |
|---|---|---|---|
| Entrée | `outExpo` sur 0,55 s | ressort ζ 0,55, ω 14 (posé à 2 % en 0,52 s) | `outQuint` sur 1,15 s |
| Dépassement mesuré | 0 | 27,8 px sur 220, soit 12,6 % (théorie : exp(-ζπ/√(1-ζ²)) = 12,6 %) | 0, puis 9,9 px de glissement entre 0,85 et 1,75 s (le suivi) |
| Sortie | `inCubic` 0,40 s | renversement du ressort sur 0,55 s : recul de 34,6 px puis départ en 0,15 s | `inQuint` 0,80 s |
| Retard des secondaires | 1 image | 2 images | 4 images |
| Texte du masque | même courbe | ressort ζ 0,78, ω 16 : 2 % de dépassement, invisible mais le profil de vitesse est celui d'un ressort | même courbe |

- **Le renversement du temps donne l'anticipation gratuitement.** `renverse(f, d)(s) = (f(d) -
  f(d - s)) / f(d)` rejoue l'entrée à l'envers et normalise pour partir de 0 exactement : un
  ressort renversé recule (34 px) avant de filer. La normalisation est indispensable : sans elle la
  carte sautait de 3 px au premier instant de la sortie.
- **Le retard des secondaires se calcule comme une différence de positions**, pas comme un décalage
  de temps posé à la main : `yInterieur = yCarte(s - retard) - yCarte(s)`. L'intérieur suit la carte
  avec le même mouvement, en retard, y compris à la sortie. Le petit trait est deux fois plus en
  retard que le reste : c'est le détail qui arrive en dernier.
- **Le suivi de C est additif** : `- 220 * sin(π · seg(s, 0,85, 1,75)) * 0,045`. La carte continue de
  10 px après la pose et revient. C'est ce qui fait « luxueux » : rien ne s'arrête net.
- **Le souligné ne recule pas** (`max(0, sortie)`) : un trait qui se rétracte puis repart lit comme
  un défaut, alors que la carte qui recule lit comme une intention.
- Le tracé sous chaque colonne est la courbe `entree + suivi` sur 1,6 fois la durée d'entrée, en
  SVG statique : c'est l'icône de la personnalité, à reprendre telle quelle dans la charte.

## Le vertical : la grille et la zone sûre

- **Seize temps à 120 BPM.** Accroche sur 0, 1, 2 (un mot par temps), règle sur 3 ; plans sur 4, 7,
  10 (une mesure et demie chacun) ; appel à l'action sur 13 ; volet noir sur 16 = 0.
- **Le volet finit sur le temps, il ne commence pas dessus** : `seg(t, entre - 0,25, entre)` en
  `inOutQuart`. Un volet de 0,25 s est court par rapport aux 0,5 à 0,8 s de la recherche, mais des
  plans de 1,5 s ne supportent pas plus.
- **Le claquement d'un mot** : échelle 1,55 vers 1 et chasse 78 vers 100 (axe `wdth` de Bricolage) en
  `outExpo` 0,32 s, opacité en deux images. Le mot arrive gros et étroit, se pose large : deux axes
  pour un seul geste, ce qui le distingue d'un simple zoom.
- **Les détails sur les subdivisions** : lettres CRAFT sur les doubles-croches (`rotateX` -90 vers 0
  en `outBack(1,5)` 0,24 s), stations du fil sur les croches (`inOutSine` d'une station à l'autre,
  le point marque un arrêt à chaque nœud), réponse de la carte sur le temps 9 avec un sursaut de
  14 px de la carte.
- **Zone sûre** : tout le texte est à x = 120 et ne dépasse pas x = 960 d'après des largeurs estimées
  à 0,62 em par caractère (0,56 pour « automatisations. » en chasse 85) ; tout est entre y = 560 et
  y = 1216, loin des 260 et 1660. `window.GEOM` porte ces boîtes pour le test ; la mesure réelle
  se fait à l'écran, et c'est la première chose à regarder.
- **La boucle** : à t = 0 l'accroche est noire sans mot, à t = 8 le volet noir couvre tout. Même
  image, la reprise est invisible.

## Transformer chaque essai en bloc réutilisable

### `cueSheet` (le moteur, pas un bloc)

- **Entrées** : `bpm`, `temps`, `evenements[]` (`temps`, `id`, `sons[]` avec `type`, `avance`,
  paramètres), `motifs` (charley, basse, nappe ou n'importe quel motif à grille).
- **Sorties** : `E` (identifiant vers secondes), `KICKS` et toute liste filtrée par type de son,
  `partition()` (liste plate triée, pour le direct et le fichier), `exporterWav(tours)`.
- **À isoler** : `partition()`, `jouerDans()`, `chaine()`, les instruments `INSTR`, le suiveur
  (`suivre`, `recaler`, `planifier`), `versWav()`. Les blocs déclarent leurs sons en temps locaux et
  `scene.js` les décale : un bloc « masque » émet `{ t: fin, type: 'souffle', avance: duree }`.

### `logoSting` (le bumper sans sa musique)

- **Entrées** : `lignes` (deux textes, police, tailles, couleurs), `bloc` (couleur, taille du carré,
  épaisseur du curseur et du souligné), `legende` et `adresse`, et les identifiants d'événements à
  lire dans la cue sheet (`pulse`, `curseur`, `ligne1`, `serre`, `monte`, `ligne2`, `legende`,
  `souligne`, `sortie`).
- **Sorties** : `geometrie(t)` du bloc (pour qu'un autre bloc s'y accroche) et la boîte du lockup.
- **À isoler** : `mesurer()` (largeurs des lettres, une fois), `curseur1/2()`, `geometrie()` avec
  `lerpG`, `pulsation()`, `balayage()`.

### `personnalite` (la courbe signature, à mettre dans `moteur/temps.js`)

- **Entrées** : la personnalité choisie par Paul, sous la forme d'un objet `{ entree, sortie,
  entreeTexte, sortieTexte, retard, suivi }` en secondes.
- **À isoler** : `ressort(x, z, w)`, `renverse(f, d)`, `outExpo`, `inCubic`, `outQuint`, `inQuint`,
  et la règle « position du secondaire = différence de deux positions du principal ». Un bloc
  appelle `P.entree(t - t0)` et ne connaît jamais le nom de la courbe.

### `teaserVertical`

- **Entrées** : `bpm`, `plans[]` (`temps d'arrivée`, couleur de fond, couleur d'encre, contenu),
  `accroche` (mots et temps), `cta` (deux mots, adresse), zone sûre.
- **Sorties** : `GEOM` (toutes les boîtes, pour le calque de contrôle de `build_vertical.py`).
- **À isoler** : `slam()`, le volet `clip-path: inset()` fini sur le temps, la frappe déterministe
  (`floor(longueur * seg)`), le point qui passe de station en station.

## Ce que je ferais différemment si Paul retient un de ces essais

- Courbes : mesurer les trois sur une capture réelle (une carte du tableau de bord) plutôt que sur une
  carte abstraite, et ajouter la quatrième colonne « expo un peu plus longue qui glisse », celle que
  la recherche suggère comme signature maison, pour comparer à A.
- Bumper : une vraie musique libre de droits alignée sur la même cue sheet (mode « musique
  d'abord ») à côté de la piste synthétique, pour trancher entre les deux voies de la recherche ;
  et le vrai logo en dernière image, posé pixel pour pixel après le lockup textuel.
- Vertical : une version avec une capture réelle dans la carte du plan 2, et les mêmes huit
  secondes en 1:1 pour le carrousel, avec la même cue sheet.
