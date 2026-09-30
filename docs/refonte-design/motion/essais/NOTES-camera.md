# Notes de la famille « Caméra et rythme »

Trois essais, un fichier chacun, tous sur le contrat du moteur de rendu (`STAGE`, `DUREE`,
`render(t)` pur, `PRET`, puis `../lecteur.js`). Aucune bibliothèque : tout est calculé à la main
dans `render(t)`, ce qui garantit qu'une image se rend à n'importe quel instant, dans n'importe
quel ordre. Vérification faite sans navigateur : `node --check` sur chaque script inline, puis
`render(t)` rejoué sur 481 images avec un DOM factice (script `verif-essais.js` du scratchpad),
avec un test de déterminisme (deux appels au même t donnent le même DOM) et de bouclage.

## Ce que j'ai appris

### Le zoom continu (`zoom-continu.html`)

- **Le zoom est exponentiel, pas linéaire.** Un zoom linéaire ralentit à mesure qu'on grossit.
  On travaille en log : `ell = K * t`, et le grossissement du plan au foyer vaut `exp(ell)`.
  `K = ln(Z total) / DUREE`, avec Z = produit des ratios des portails d'un cycle (ici environ 154,
  donc l'image double toutes les 1,1 s). Le temps passé dans chaque plan est proportionnel au
  log de son ratio : un curseur petit dans une grande ligne prend plus de temps qu'un écran
  large dans un bureau. C'est ce qui donne le « mouvement perçu constant ».
- **Les plans sont plats, pas imbriqués dans le DOM.** Chaque plan est un frère de 1920 x 1080
  avec sa transformation en coordonnées écran recalculée à chaque image. Emboîter les DOM aurait
  cumulé des échelles de 1/20 000, et un `filter` sur un parent aurait flouté tous les enfants.
- **Le portail glisse, le zoom ne ralentit jamais.** Le centre visé passe du centre de l'image au
  centre du portail avec un smoothstep sur la position ÉCRAN du portail (`g = 1 - (1 - e(f)) / z`),
  pendant que le zoom reste exponentiel. Sans cette séparation, un portail décentré donne une
  caméra qui dérive puis rattrape.
- **Le flou de champ se pose en pixels locaux.** Un `blur(4px)` sur un plan réduit 10 fois fait
  0,4 px à l'écran. Il faut diviser par l'échelle écran du plan, et plafonner (40 px locaux),
  sinon un plan minuscule reçoit un flou de 900 px pour rien.
- **Deux plans du même objet physique ne se floutent pas l'un l'autre.** La carte et la ligne
  sont le même texte : un flou entre elles se lit comme un bug, pas comme de la profondeur. Le
  flou ne sert qu'aux vrais changements de monde (bureau vers écran, curseur vers bureau).
- **La couture entre deux plans tombe dans un blanc.** La carte s'arrête sur « sur un ton »
  (espace comprise, mesurée hors scène parce que la scène est mise à l'échelle par le lecteur),
  la ligne commence sur « juste » à x = 0. Une couture au milieu d'un mot aurait montré un
  crénage d'un pixel au moment où les deux plans sont à la même échelle.
- **Le bouclage se prouve, il ne se devine pas.** Avec 9 plans (deux cycles plus un bureau), la
  transformation du plan 4 à t = D est exactement `translate(0,0) scale(1)`, celle du plan 0 à
  t = 0. Le clignotement du curseur a une demi-période de 0,5 s ; D en est un multiple, sinon le
  curseur serait allumé à t = 0 et éteint à t = D.
- **Un plan qui couvre toute l'image, bords nets, cache ce qui est derrière** : on ne dessine
  plus les plans quittés, ce qui évite de rasteriser un élément de 268 000 px de large.

### La démo d'interface (`demo-interface.html`)

- **La caméra est une liste de clés, et une tenue est deux clés identiques.** Le lecteur ne voit
  que « glisse » ou « tient ». Le glissé utilise une courbe quintique (`cine`), longue à
  s'arrêter, ce qui fait « studio » ; une cubique paraît molle, une linéaire paraît mécanique.
- **`transform-origin` posé sur la cible, puis `translate(centre - cible)`.** C'est ce qui permet
  d'écrire une caméra en coordonnées de l'application (« regarde le point (600, 240) au zoom
  1,5 ») sans jamais résoudre de matrice. La rotation 3D se fait autour du même point, donc la
  perspective reste cohérente pendant un glissé.
- **La caméra se redresse quand elle s'approche** (rotateX 8 degrés au large, 2 à 3 degrés en
  gros plan). Une inclinaison forte en gros plan fait une image floue d'un côté.
- **La mise au point suit la même courbe que la caméra.** `nettete(panneau, t)` interpole 0 ou 1
  entre les mêmes clés ; le flou et l'assombrissement en découlent. Si le flou avait sa propre
  courbe, l'œil sentirait deux mouvements.
- **Anticipation avant ressort.** La liste fait de la place (0,3 s) AVANT que le courriel tombe
  (0,55 s en easeOutBack adouci, c1 = 1,35). L'inverse, ou les deux en même temps, fait « jouet ».
- **La souris vit dans le plan de l'application**, donc elle suit la caméra toute seule, et le
  clic est une pression (enfoncement 60 ms, relâchement 160 ms) plus une onde de 0,6 s.
- **La boucle se referme par le vide** : l'application arrive en ressort à t = 0 et s'éteint en
  fondu avant t = D. Une scène « pleine » aux deux bouts aurait obligé à annuler l'action.

### Les transitions au tempo (`transition-rythme.html`)

- **Une transition se TERMINE sur le temps fort, elle ne commence pas dessus.** Le masque monte
  pendant les 0,4 à 0,5 s qui précèdent, et l'élément suivant claque sur le temps. C'est ce qui
  donne l'impression que la coupe « tombe » en rythme. Le souffle sonore monte pendant le masque
  et l'impact tombe sur le temps, exactement à la même place.
- **Les bandes tiennent dans un seul polygone en escalier** : `(0,0) (x0,0) (x0,h) (x1,h) (x1,2h)
  … (0,H)`. Sept bandes, un seul `clip-path`, sans dupliquer le plan.
- **Le balayage diagonal a une lame** : un second calque uni, découpé un peu en avant du front,
  donne une épaisseur au balayage. Sans lame, c'est un simple essuyage.
- **Les tuiles passent par un `<clipPath>` SVG référencé en `clip-path: url(#tuiles)`.** Quarante
  rectangles, chacun avec son `transform` posé par render(t), retard proportionnel à la distance
  au centre. Le SVG doit rester dans le DOM en 0 x 0, jamais en `display:none`.
- **Le contenu de tous les plans est posé à chaque image, même cachés.** Sinon un plan caché
  garde les styles de la dernière image où il était visible, et le DOM n'est plus une fonction
  de t (le test de déterminisme l'a attrapé).
- **Le son écoute t, jamais l'inverse.** `render(t)` note t dans une variable ; le planificateur
  audio travaille en temps de motif absolu `P = tempsAudio + phase`, avec un pointeur monotone
  (tour, index). Au clic, la phase se cale sur le t courant ; un saut de plus de 60 ms (seek)
  recale ; trois images de suite au même t (pause) font taire le planificateur. Le rendu visuel
  ne dépend en rien de l'audio.
- **Le bruit blanc a une graine fixe** (mulberry32) : la piste hors ligne est reproductible au
  bit près, ce qui permet de la régénérer sans surprise pour un montage.

## Générer la même piste hors ligne, pour le montage

Les instruments prennent `(contexte, destination, ...)` en paramètres : le même code sert au
direct et au rendu. Le bouton « Exporter le WAV (8 s) » fait ceci, aussi disponible en console
avec `exporterWav()` :

```js
const sr = 48000, off = new OfflineAudioContext(2, sr * DUREE, sr);
const s = chaine(off), br = tamponBruit(off);       // compresseur + gain, bruit à graine fixe
EVENEMENTS.forEach((ev) => jouer(off, s.entree, br, ev, ev.q));   // q = instant dans la boucle
off.startRendering().then((buffer) => telecharger(versWav(buffer)));
```

Puis, une fois la vidéo rendue image par image : `ffmpeg -i video.mp4 -i piste.wav -c:v copy
-c:a aac -shortest sortie.mp4`. Pour une vidéo de plusieurs boucles, concaténer le WAV autant de
fois que nécessaire (`-stream_loop`) : la boucle est exacte à l'échantillon près puisque D est un
multiple entier de la mesure.

## Comment chaque essai devient un bloc réutilisable

- **Zoom continu** : un bloc `plongee(plans, duree)` où `plans` est une liste de
  `{ gabarit, portail: {x, y, w, h}, flouAvant, flouArriere }`. Le portail doit être en 16:9 ;
  tout le reste (K, positions cumulées, flou, culling, bouclage) est déjà générique. Pour une
  vidéo réelle : remplacer les gabarits par les vraies captures (écran de l'espace apprenant, carte
  de leçon) et garder le bureau vectoriel en ouverture et en fermeture.
- **Démo d'interface** : un bloc `camera(cles)` (tenues et glissés), `foyer(cles)` (quel panneau
  reste net), `souris(cles, clics)` et une bibliothèque de micro-mouvements (`arrivee`,
  `pression`, `onde`, `coche`). La fausse application se remplace par n'importe quel DOM posé dans
  `#app` en 1600 x 900 : les panneaux sont désignés par leur id.
- **Transitions au tempo** : un bloc `montage(plans, bpm, transitions)` où chaque plan a une durée
  en mesures et un `contenu(tau)`, et où chaque transition est une fonction `(sortant, entrant,
  u)`. Les quatre masques sont déjà écrits ; en ajouter un, c'est écrire une fonction de trois
  lignes. Le motif audio se décrit par événements `{q, type}` : changer le tempo ou la durée ne
  demande que de régénérer `motif()`.

## Ce qui reste à juger à l'écran

Aucune de ces pages n'a été ouverte dans un navigateur depuis cette session (interdit ici). Les
métriques de texte (largeur de « sur un ton » et de « juste » en Instrument Serif) sont mesurées
au chargement, donc la couture du zoom se placera juste ; en revanche la lisibilité des tailles
choisies, la douceur réelle des flous et le mélange sonore se jugent en regardant et en écoutant.
