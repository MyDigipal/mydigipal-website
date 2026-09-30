# Reprendre la refonte du design : direction A « Encre » retenue (30/09/2026)

À coller dans une nouvelle session Claude Code (cloud ou locale) ouverte sur le dépôt `mydigipal-website`, **branche `refonte-design`**.

---

Tu reprends la refonte du design de mydigipal.com. Paul a choisi la **direction A « Encre »**.

**À lire d'abord, dans cet ordre :**
1. `CLAUDE.md` du dépôt, section « Chantier en cours : la refonte du design ».
2. `docs/refonte-design/pilotage.html` : audit, décisions, questions ouvertes, pages et avancement.
3. `labo/refonte-site/direction-a.html`, `.css`, `.js` et la fiche `direction-a.md` : la maquette retenue.
4. `docs/refonte-design/motion/AVIS-PAUL.md` (ses goûts en mouvement) et `docs/refonte-design/motion/ADAPTATION-WEB.md` (les essais du labo motion lus ligne à ligne, avec leur adaptation au web).
5. `docs/refonte-design/motion/essais/` : le code des douze essais favoris du labo motion (écrits pour la vidéo, `render(t)` en 1920 x 1080) et leurs notes. On les ADAPTE au web selon `ADAPTATION-WEB.md` (état final par défaut, mise en page refaite à 390 px), on ne les colle jamais tels quels.

**Quelle animation pour quelle notion** : tableau « Les pages et leur avancement » du pilotage. En résumé : carte de verre (un objet, ce qui entre et ce qui sort : Performance Max, un serveur MCP, un flux de stock), isométrie (ce qui circule : une automatisation, le suivi côté serveur, le routage d'un lead), morphing sur rail (un process en trois à cinq états), tableau à palettes (trois chiffres d'un client), caméra qui tient (une interface : l'Academy, un tableau de bord), grille de mots (la méthode CRAFT), particules (faire apparaître un logo). Interdits de Paul : zoom continu, flou sur ce qu'on lit, texte qui bouge pour rien, effet sans histoire, polices qui s'enchaînent.

**Toi, la session qui exécute, tu rends compte** à la fin de chaque étape : ce qui est fait, les commits, ce qui est vérifié et comment, ce qui ne l'est pas. Paul fera relire ton travail par une autre session avant toute mise en ligne.

**Travailler sur la branche `refonte-design`** (`git fetch`, puis `git merge origin/main` si elle est en retard). Commits fichier par fichier, poussés sur cette branche. Rien sur `main` sans l'accord de Paul. Si tu n'as pas de navigateur pour vérifier à l'écran, dis-le et donne à Paul les adresses à regarder.

**Ce que Paul a aimé en particulier :** la carte de verre de Performance Max (le texte à gauche, la carte qui se remplit). Les essais du labo motion (isométrie, morphing, tableau à palettes, caméra qui tient, particules) servent à expliquer les autres notions, repeints dans la palette Encre.

**Budget serré** : pas d'agents en parallèle, un groupe de pages par session, coût annoncé avant chaque groupe, mesurer par script plutôt que capturer.

## Étape 1 : le système global (une session, corrige tout le site d'un coup)
- Jetons de la direction A dans `src/styles/global.css` : `--encre #0B1B2B`, `--encre-2 #102A43`, `--brume #F3F6FA`, `--marque-clair #7DB8EE`, textes sur sombre `#F4F7FA` / `#A9B8C8`.
- Classes de fond de section : `.section-encre` (avec lueur fixe et coins hauts arrondis de 32 px quand elle monte sur la précédente), `.section-brume`, `.section-blanc`. Règle : jamais deux sections sombres collées, 35 à 45 % de surface sombre par page.
- Les composants partagés à reprendre une fois : `HeroService`, `FinalCTA`, `ServiceFAQ`, `TestimonialSpotlight`, `CaseStudyCarousel`, `TrustedBy`, `PageHero`. Retirer les pilules de rubrique au-dessus de chaque titre (une pour trois sections au plus).
- Déployer ce socle seul, vérifier sur `mydigipal-website.onrender.com` au bureau et à 390 px, montrer à Paul.

## Étape 2 : les composants animés (une session)
Porter de `direction-a.js` vers des composants Astro autonomes, sur `src/lib/motion/` (déjà écrit) :
- `CarteVerre.astro` (entrées, sorties, retours, trois textes, en props) ;
- `RailMorphing.astro` (stations : titre, texte, forme) ;
- plus tard `SceneIso.astro` (usine de la direction C, repeinte) et `TableauPalettes.astro` (direction B).
Règles du socle : état final par défaut, `rendu(t)` pur, repères cliquables, `?fige=1`. Sur téléphone, garder le dessin collé sous l'en-tête pendant la lecture (solution de la direction C).

## Étape 3 : les pages, un groupe par session
Ordre de Paul : IA (`/ai`, AI Training, AI Solutions, AI Content), services, automobile, le reste, l'accueil en dernier. Pour chaque page : sections sombres qui ponctuent, retrait des pastilles 01/02/03 et des cartes égales, chiffres sans source retirés (seuls ceux des études de cas restent), tirets longs corrigés, une animation qui explique la notion de la page (tableau « Les pages » du pilotage). Toujours FR et EN ensemble. Vérifier sur Render à 390 px avant de passer au groupe suivant.

## Étape 4 : l'accueil
Garder la vidéo Academy, replier « Paul shows you around » et la liste des fonctionnalités (ouverture au clic), puis avis, puis services.

## À régler en passant
- Correctif des éléments flottants prêt sur la branche `flottants-sans-recouvrement` (`5b0e768`) : à fusionner avec l'accord de Paul.
- Tenir `pilotage.html` à jour via `generer-pilotage.py`, et la mémoire du projet.
