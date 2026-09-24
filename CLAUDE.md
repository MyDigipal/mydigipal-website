# MyDigipal Website - Site Astro + Calculateur React

## 1. Vue d'ensemble

| Clé | Valeur |
|-----|--------|
| Stack | Astro 6.2.2 + Tailwind 4.2.4 + React islands |
| Calculateur | `/en/calculator` et `/fr/calculator` : la v6 depuis le 22/09/2026 (section 3) |
| Envoi du devis | `POST https://academy.mydigipal.com/api/site/devis` (CRM + les deux mails + Google Chat) |
| Build | `npm run build` (~14s, 200 pages) |
| Hosting | **Render** (auto-deploy GitHub via `render.yaml`) - Cloudflare = DNS proxy/CDN devant uniquement |
| Déploiement | `git push origin main` → Render webhook → build → publish (~2-3 min) |

### PIÈGE : supprimer un fichier ne le retire pas du site
Render publie de façon **incrémentale** et ne supprime pas les fichiers disparus
du build. Vérifié le 01/09/2026 : quatre HTML sortis de `public/`, commit poussé,
déploiement live, et ils répondaient toujours 200 **sur l'origine Render**, pas
seulement dans le cache Cloudflare.

Remède : redéployer en vidant le cache de build. `mcp__mcp-gateway__render_deploy`
avec `clearCache: "clear"` sur `srv-d53carkhg0os738p2q50` (404 en 90 secondes), ou
dans le dashboard **Manual Deploy** → **Clear build cache & deploy**. Le tool MCP
renvoie `Unexpected end of JSON input` alors qu'il a bien créé le déploiement : ne
pas relancer, vérifier avec `render_list_deploys` (il porte `trigger: "api"`).

### Tailwind 4 setup
- Theme tokens en CSS-natif via `@theme {}` dans `src/styles/global.css` (drop legacy `tailwind.config.mjs`)
- Vite plugin direct (`@tailwindcss/vite`), pas d'intégration `@astrojs/tailwind` (deprecated en T4)
- Pour les `<style>` Astro scopés qui utilisent `@apply` : ajouter `@reference "<path>/global.css"` au début du bloc
- Pour les classes custom : ne PAS faire `@apply <custom>` dans une autre classe (cassé en T4) - inliner les utilities

### Astro 6 Content Layer API
- `src/content.config.ts` (top-level), pas `src/content/config.ts`
- Chaque collection : `loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/X' })`
- Utiliser `entry.id` (pas `entry.slug`), `render(entry)` (pas `entry.render()`)

### Convention images blog
- Frontmatter `image:` toujours en path local : `image: '/images/Blog Thumbnails/<slug>.jpg'`
- **Jamais d'URLs absolues `raw.githubusercontent.com`** (passe à côté des optim + latence)
- Default extension : `.jpg` (quality 85, ratio 1200×630). PNG seulement pour logos avec vraie alpha.

### Convention CSS coexistence Tailwind
- Les sélecteurs CSS globaux (`[data-*]`, `.classes`) ne doivent PAS définir `display` sur des éléments qui utilisent une utility responsive Tailwind (ex: `hidden lg:flex`)
- Sinon ça écrase la utility et casse le responsive (cas réel : menu mobile cassé par `[data-nav-pill] { display: inline-flex }`)

## 2. SEO - Règles obligatoires

### Balises title
- La balise `<title>` est construite automatiquement : `{titre frontmatter} | MyDigipal` (13 caractères pour le suffixe)
- Le titre total doit faire entre **50 et 60 caractères** (donc `seo.title` entre 37 et 47 caractères)
- Ne JAMAIS inclure "| MyDigipal" dans le titre frontmatter (ajouté par BaseLayout.astro)
- Si le titre d'affichage doit être plus long, utiliser le champ `seo.title` pour le titre court SEO

### Meta descriptions
- **145-160 caractères**, inclure mots-clés principaux et appel à l'action
- Utiliser `seo.description` si la description d'affichage est trop longue

### Frontmatter blog - Champs SEO optionnels
```yaml
seo:
  title: "Titre court SEO 37-47 car."
  description: "Description 145-160 car."
  image: "/images/og-image.png"
```

### Liens internes
- Toujours pointer vers l'URL finale, jamais vers une URL qui redirige
- Pas de trailing slash (config Astro : `trailingSlash: 'never'`)
- Image blog : 1200x630px

### Case studies : le client est déjà préfixé
Le template `[slug].astro` construit le title avec `client - titre`. Ne PAS répéter
le nom du client dans `seo.title`, sinon Google affiche "Quantum Metrics - Quantum
Metrics: ...". Six fiches sur huit étaient dans ce cas avant le 04/08/2026. Le
template lit `seo.title` / `seo.description` en priorité, avec fallback sur le
champ `title` racine (qui sert au H1 et ne doit pas bouger).

### Le build refuse une faute SEO (depuis le 01/09/2026)
`scripts/check-seo.mjs` tourne à la fin de `npm run build` **et** de `build:tina`
(c'est ce dernier que Render exécute). Il lit le `dist/` et **casse le build** sur :
une URL du sitemap sans page générée, un document servi depuis `/images` ou
`/videos`, un llms.txt vide, un robots.txt sans sitemap déclaré, un titre hors
50-60, une description hors 145-160, un doublon de titre ou de description, une
page sans H1. Il ignore `/admin`, `/test`, `/404`, `*/merci` et tout ce qui porte
`noindex`.

Donc une méta hors norme se voit **avant le commit**, plus à l'audit suivant.
Déploiement urgent malgré une faute : `SEO_CHECK=warn npm run build`.
`node scripts/audit-metas.py` reste disponible pour une passe manuelle.

### llms.txt est généré, pas écrit
`src/pages/llms.txt.ts`, sur le modèle de `sitemap.xml.ts` : les services, les
études de cas et les 20 derniers articles viennent des collections à chaque build.
Il n'y a plus de `public/llms.txt` (deux fichiers pour une même route, c'est le
retour du problème). Ce qui ne se déduit d'aucune collection - présentation,
Academy, coordonnées - est écrit en dur dans ce fichier et se modifie là.
`robots.txt` reste statique dans `public/` : son contenu ne dépend pas du contenu.

### Aucun document client dans `public/`
Quatre bilans Google Ads clients y ont été servis publiquement jusqu'au 31/08/2026.
Ils vivent dans `docs/client-reports/`, hors du build. `check-seo.mjs` échoue si un
HTML réapparaît sous `/images` ou `/videos`.

### Le formulaire de contact aussi est sorti de n8n (23/09/2026)
`/{lang}/contact` poste sur `https://academy.mydigipal.com/api/site/contact` : le
contact entre dans `prospection.contacts` (source `contact-form`), les deux courriels
partent (gabarits refaits dans `mydigipal-academy/src/lib/site/contact-mails.ts`) et
la bulle « Website Chat » annonce le lead.
⚠️ `website` est un CHAMP VISIBLE de ce formulaire (« Site web »), jamais un piège
anti-robot : le traiter comme tel rejetterait en silence les leads qui le remplissent.
⚠️ La provenance de la visite est relevée par `BaseLayout.astro` sur TOUTES les pages
depuis cette date (clé `academy_provenance`) ; avant, elle ne l'était que sur les pages
Academy, donc le devis partait sans provenance depuis le reste du site.

### Redirections
Elles ne se configurent PAS dans `render.yaml` : le service Render n'est rattaché à
aucun Blueprint (son buildCommand réel diffère de celui du fichier). Elles se
saisissent dans le dashboard Render, onglet Redirects and Rewrites.

## 3. Le calculateur v6 (en ligne sur `/{lang}/calculator` depuis le 22/09/2026)

Pilotage : `docs/calculator/refonte-2026-09/calculateur-en-etapes.html` (artifact
MxYDYDkDtsgygVRL6wgNjT). Mémoire détaillée : `calculator_refonte_etapes_sept2026.md`.

- **Code** : `src/components/calculator-v6/` (`CalculatorV6.tsx`, `engine.ts`, `content.ts`,
  `videos.ts`). Il réutilise les grilles de prix de `components/calculator/data/`.
- **Un seul calcul** : `devis(état)` dans `engine.ts`. L'écran, la page de résultat, l'envoi
  au webhook et GA4 lisent tous ce résultat (fin du bug 1 750 € contre 1 400 €).
- **Parcours** : une question à la fois sur téléphone, guide à droite sur ordinateur, aucune
  avance automatique (le même bouton « Continuer » partout), page de résultat pleine largeur
  avec l'audit et le rendez-vous.
- **Entrées** : `?service=<domaine>` coche le service ; `#plan=<encodePlan>` (et `&b=<budget>`)
  ouvre directement un devis, c'est ce que font l'assistant du site et le bouton « Revoir mon
  devis » des mails.
- **Envoi** : même format qu'avant pour n8n, plus `display` (les montants déjà mis en forme
  dans la devise du visiteur), `auditRequest`, `metadata.planUrl` et `metadata.provenance`.
- **Mails et CRM** : depuis le 23/09/2026, l'envoi ne passe plus par n8n. La route
  `POST /api/site/devis` de l'application Academy (dépôt `mydigipal-academy`) écrit le
  devis dans `mydigipal.prospection.calculator_quotes`, crée le contact dans
  `prospection.contacts` (source `calculator`, visible dans sales.mydigipal.com), envoie
  le devis au prospect et le lead à Paul, puis annonce le lead dans l'espace Google Chat
  « Website Chat ». Les gabarits vivent dans `src/lib/site/devis-mails.ts` de ce dépôt-là.
  ⚠️ Les espaces INSÉCABLES comptent (montants, « 10 % ») : le portage a d'abord différé
  là-dessus, invisible à l'œil. `scripts/n8n-calculateur/` reste dans le site pour rejouer
  l'ancien workflow en cas de retour arrière, et son Google Sheet n'est plus alimenté.
- **Anciennes adresses** : l'ancien calculateur est supprimé (section 3 bis) ;
  `/{lang}/calculator-v6` renvoie vers `/calculator` en gardant l'ancre.
- **Assistant du site** (`src/components/site-assistant/`) : il connaît la page où il s'ouvre.
  `src/pages/assistant-pages.json.ts` génère au build une carte des pages (type, titre, service du
  calculateur, secteur, page à proposer ensuite, résultat client) ; `pages.ts` la lit une fois par
  visite. Selon la page : accueil et choix différents, prix d'entrée du service (`prixDeDepart`
  dans `engine.ts`), ce qui est compris (`content.ts`, clé `dom:<service>`), le résultat d'une
  étude de cas, et surtout **« Chiffrer mon cas » pose LA question du calculateur pour ce service**
  (budget publicitaire, niveau d'accompagnement) et rend le prix en une question. Le secteur d'une
  page automobile n'est plus demandé. Au bout de **dix secondes**, une question d'une ligne
  s'affiche au-dessus du visage, elle aussi tirée de la page (« Vous voulez un prix pour Google
  Ads ? », « Faire comme GWI chez vous ? ») ; un clic ouvre le panneau. La bulle avec la photo de Paul,
  sans modèle, reliée à Google Chat (espace « Website Chat ») par l'application Academy.
  Sur tout le site depuis le 22/09/2026, sauf `/academy*` et `/admin` (script de
  `BaseLayout.astro` ; `?assistant=0` l'éteint pour la visite). Règle de Paul : **deux appels à
  l'action flottants, pas un de plus**, « Calculer mon budget » (`StickyCalculatorCTA`, décalé à
  gauche de la bulle par `html[data-assistant='on']`) et son visage. Mémoire : `site_chat_sept2026.md`.

## 3 bis. Ce qui reste de la v5 (le reste est supprimé)

L'ancien calculateur a été supprimé le 23/09/2026 (commit `dcb146d`, 6 035 lignes) :
`Calculator.tsx`, `CaptureModal`, `ChannelCard`, `GuidedMode`, `HowWeWork`,
`PerformanceEstimation`, `StickySummary`, `TrackingJourney`, `translations.ts` et les
pages `/{lang}/calculator-v5`. Ces adresses répondent 404, vérifié en production.

**Ce qui vit encore dans `src/components/calculator/` et sert à la v6** :
- `data/` : les grilles de prix des huit domaines et `data/index.ts` (domainConfigs,
  BUDGET_CONFIG, DURATION_CONFIG, MANAGEMENT_FEE_CONFIG, CURRENCY_CONFIGS). **C'est
  toujours là qu'un prix se change.**
- `types.ts` (ServiceDomain, Currency), `tracking.ts` (les événements dataLayer),
  `guided-data.ts` (les questions et le scoring du mode guidé, lus par `guidedProposal`
  dans `calculator-v6/engine.ts`).

`/{lang}/calculator-v6` renvoie vers `/{lang}/calculator` en gardant le devis de l'ancre.

### Le mode guidé, version v6
Trois questions (secteur, objectif, budget mensuel) posées dans le calculateur lui-même,
puis `guidedProposal(industry, goal, budget, focus?)` compose l'état et le budget. Le
scoring vient de `guided-data.ts` : pertinence du secteur, bonus d'objectif, seuil
d'inclusion, et un plafond de domaines selon le budget. L'assistant du site appelle la
même fonction et envoie le résultat par `#plan=`.

## 4. Points techniques importants

### Pages services - switch par slug
- Toutes les pages `/services/*` sont générées par `src/pages/[lang]/services/[slug].astro`
- Le contenu est un switch géant `isXxxService` par slug, qui rend les bons composants de `src/components/sections/`
- Les MDX dans `src/content/services/{lang}/` ne portent que la copy du hero (title, badge, headline, metrics, testimonial, seo)
- Les sections riches (WhyXxx, XxxProcess, etc.) sont des composants .astro autonomes

### AI Solutions : la section avant/après (31/08/2026)
`AIBeforeAfter.astro` s'intercale entre `WhyAISolutions` et `AIUseCases` dans le
bloc `isAISolutionsService`. Quatre tâches concrètes en avant/après (demandes
entrantes, comptes rendus, relance des devis, reporting mensuel), avec le temps
hebdomadaire en ordre de grandeur et ce qui reste à un humain. Aucun chiffre de
résultat client, aucun nom de client, par construction.

Fond **blanc** : `WhyAISolutions` est en `bg-slate-950` (sombre) et non en blanc,
et `AIUseCases` en `bg-slate-50`. Le blanc est le seul fond qui tranche des deux.
Commit `e206566`.

### Convention de réutilisation entre pages services
- Même idée visuelle sur 2 pages services + copy légèrement différente → prop `variant` sur un composant partagé (voir `MarketingStackGrid.astro` avec `variant: 'training' | 'solutions'`)
- Positioning fondamentalement différent (formation vs delivery) → composants dédiés pour éviter un mega-switch (voir `MCPBuildSection` sur AI Training vs `MCPCustomBuildSection` sur AI Solutions)

### Chiffres MCP Gateway exposés publiquement - à synchroniser
- `244` tools / `21` plateformes / `18+` clients affichés sur `/services/ai-training` ET `/services/ai-solutions` dans `MarketingStackGrid.astro` (tableau `proofs`)
- Si le MCP Gateway évolue (ajout module, perte/gain client), resync ces 3 nombres dans ce fichier - c'est le seul endroit où ils sont en dur côté site

### CTAs avec query param `?topic=` pour tracking futur
- Les CTAs MCP vers `/contact` passent un `?topic=` : `mcp`, `mcp-build`, `mcp-package`, `parcours-technique`
- Pas encore exploité par le formulaire, prévu pour segmenter les leads entrants par intention

## 5. Améliorations futures (mode guidé)
1. Ajouter les canaux sociaux spécifiques (Reddit, TikTok, LinkedIn) dans les recommandations
2. Intégrer la notion de "chemin d'évolution" (starter vers growth vers impact)
3. Ajouter community management comme option
4. Enrichir le reasoning avec des benchmarks réels (CPM, CPC, CTR)
5. Ajouter des cas d'usage par industrie
6. Proposer Google Ad Grants pour les organisations éligibles

### À regarder à partir de fin août 2026
Le tracking du funnel a été posé le 04/08/2026. Comparer les données avant et après
cette date répondra à deux questions restées ouvertes :
- le retrait du bouton "Continuer" a-t-il fait monter le taux d'arrivée en configuration
- quels domaines et quels niveaux de service font décrocher (`calculator_service_toggle`
  porte le service, le niveau et le prix)

Deux constats de l'audit du 04/08/2026 qui restent entiers :
- **le calculateur ne reçoit aucun trafic organique** (absent du top 25 GSC sur 3 mois),
  tout son trafic vient du bouton du header
- **CTR anormalement bas sur des articles à forte impression** : `ai-agents-n8n-automation`
  faisait 71 112 impressions pour 8 clics, `claude-code-developer-productivity` 9 406 pour 2.
  En position moyenne 9, on attendrait 2-3 %. Gisement plus gros que le calculateur.

## 6. Refonte design V2 (mai 2026 - handoff Claude Design)

Plan de refonte : `~/.claude/plans/serene-drifting-riddle.md`. Source : `Claude design handoffs/` (7 patterns + production-refs).

### Fondation partagée
- `src/lib/scroll.ts` - exports `initRevealOnScroll`, `initCountUp`, `initScrollProgress`, `initMagneticPointer`, `initMagneticButton`, `initSlidingNavMarker`, `initAll`. Tous skip sous `prefers-reduced-motion` (rendu final statique).
- Wired dans `BaseLayout.astro` via `astro:page-load` listener pour survivre aux View Transitions.
- Classes utility ajoutées dans `global.css` : `[data-reveal]`, `[data-scroll-progress]`, `[data-nav-pill]/[data-nav-marker]/[data-nav-link]`, `[data-magnetic]`, `[data-magnetic-btn]/[data-magnetic-target]`.

### Composants V2 (livrés et en production)
`Header.astro` (pill nav + sliding marker), `ServicesGridV2.astro` (grille magnétique
4x2), `StatsRail.astro` (tiles + count-up + sparkline), `IndustryCardV2.astro`
(5 couches), `MagneticButton.astro` (shine sweep), `TestimonialMarquee.astro`
(bandeau infini CSS), et la barre de progression de scroll injectée dans
`BaseLayout.astro`.

Reste à faire : `CalculatorInlinePreview.astro`, mini-calculateur sur la homepage.
Son calcul devra être recoupé avec `data/index.ts` (BUDGET_CONFIG, MANAGEMENT_FEE_CONFIG).

### Workflow de validation
Nouveau composant visuel : d'abord dans `src/pages/test.astro` (noindex) pour
validation par Paul, cutover ensuite. Les composants V1 restent en place sur les
pages qui les utilisent encore (services/[slug], blog, contact).

### Cohérence avec le Hub auth (mydigipal-dashboard/)
Le Hub MyDigipal a son propre handoff Claude Design (KPI cards, charts ECharts, tables enrichies). Les deux ecosystèmes design sont distincts mais coordonnés via `~/.claude/projects/_shared/design-handoff-sync.md` :
- Site = Inter + Plus Jakarta Sans, palette indigo→violet→cyan créative
- Hub = Inter + Space Grotesk, palette brand-blue/dark + channel colors data
- Patterns transversaux : count-up easing (easeOutCubic 1400ms), reveal-on-scroll cubic-bezier, magnetic button portable
- Patterns site-only : magnetic services grid, testimonial marquee, layered industry cards, calc inline preview
- Patterns hub-only : KPI variants A/B/C, ECharts trend/funnel/heatmap/donut, benchmark bars, campaign tables filtered/sorted/paginated

## 7. La page d'accueil refaite (24/09/2026, direction A « Les visages »), EN APERÇU

⚠️ **Elle n'est pas encore l'accueil.** Elle vit sur `/fr/accueil-v2` et `/en/accueil-v2`
(`src/pages/[lang]/accueil-v2.astro`), en `noindex`, hors du sitemap et liée de nulle
part, pour que Paul la regarde sur le vrai site avant de trancher. `index.astro` est
toujours l'ancienne accueil. Pilotage : `docs/site-mise-en-avant/refonte-accueil-directions.html`.

La page assemble `src/components/accueil/` : `Visages` (hero), `Bandeau` (logos),
`Resultats` (sept études de cas), `Offre` (services et prix de départ), `Avis` (note et
verbatims de formation), `Articles`, `Portes` (calculateur, Academy, appel). Styles
communs dans `accueil.css`.

- **L'option `refonte`** (`PageLayout` → `BaseLayout`, `Header`, `Footer`,
  `StickyCalculatorCTA`) montre la nouvelle version du reste de la page : le bleu du
  logo au lieu du bleu Tailwind et du dégradé indigo, « EN » / « FR » au lieu du
  drapeau emoji, « Calculer mon budget » dans le pied de page, la barre de progression
  bleue (`[data-refonte]` sur `<html>`), `theme-color` blanc. Seul l'aperçu la demande :
  fusionner la PR ne change RIEN de visible sur les autres pages (Paul veut voir le bleu
  avant de décider).
- **La bascule, le jour venu** : `accueil-v2.astro` remplace `index.astro` (sans
  `noindex` ni `refonte`) ; les versions `refonte` deviennent les seules dans les trois
  composants, et l'option disparaît ; `[data-refonte]` devient la règle par défaut de la
  barre ; `@view-transition { navigation: auto }` s'ajoute dans `global.css` (il ne joue
  qu'entre deux pages qui le déclarent, donc tout le site d'un coup) ; supprimer
  `accueil-v2.astro` puis redéployer en vidant le cache de Render (le piège de la
  section 1), sinon l'aperçu reste servi. Et `HeroUseCases.astro`, `Timeline30Days.astro`
  deviennent orphelins.
- **Aucun chiffre écrit à la main** (`accueil/donnees.ts`) : les résultats viennent de la
  collection `case-studies` (le build s'arrête si l'ordre des KPI d'une fiche change),
  les prix de `prixDeDepart()` du moteur v6, jamais additionnés ; prix, note, modules,
  heures et verbatims de l'Academy de son API (instantané en secours), relus dans le
  navigateur par `data-fait` comme les pages outils.
- **Trois scripts d'images**, à relancer après tout changement de source :
  `scripts/visages-accueil.mjs` (les portraits recadrés sur le visage, repères relevés à
  la main), `scripts/logos-accueil.mjs` (logos détourés + `src/data/accueil/logos.json`,
  affichés à SURFACE égale), `scripts/cas-accueil.mjs` (visuels des études de cas allégés).
  ⚠️ Ni Kering ni Chanel dans les logos ni les verbatims (décision du 01/09/2026).
  Portraits à redemander (moins de 200 px de visage, flous sur écran Retina) : Juliette
  Joire, Callum Dunbar ; limites : Diksha Mishra, Amna Khan, Alizée Varloud ; cadrage :
  Bruce Eidsvik (scène, fond violet), Victoria Doherty (haut de la tête coupé). Bruce
  reste dans l'équipe (Paul, 24/09/2026).
- **Le socle de mouvement** est dans `global.css` et `lib/scroll.ts`, en attributs
  réutilisables partout : `[data-reveal]` (avec `--i` pour échelonner), `[data-target]`
  (compteur, `data-locale` pour 4,5 et non 4.5, `data-counter-section="zero"` pour partir
  de zéro), `[data-projecteur]`, `[data-titre] .ligne`, `[data-pose]` (piloté par le
  défilement là où le navigateur le sait). Tous opt-in : rien ne change pour les sections
  qui ne les portent pas.
- **Performance** : les portraits du hero sont en `loading="lazy"` et le paragraphe du
  hero monte sans fondu, exprès : en 4G lente, des portraits chargés d'emblée retardaient
  le premier rendu de 250 ms, et un élément parti d'opacité nulle n'est compté comme LCP
  qu'une fois visible.
- `?service=seo,google-ads` : le calculateur accepte désormais plusieurs services (porte
  du calculateur, puces à cocher). Rétrocompatible avec `?service=seo`.

## AI Academy : la page de vente de la formation en ligne (25/08/2026)

Décision de Paul du 25/08/2026 : **mydigipal.com vend, academy.mydigipal.com est l'application.**
La page vit sur `/fr/academy` et `/en/academy` (`src/pages/[lang]/academy.astro`), entrée
« AI Academy » dans le menu IA et le pied de page. Le tunnel de paiement reste dans l'app.

- **Un îlot React** `src/components/academy/Academy.tsx` (`client:load`), porté depuis
  `mydigipal-academy/src/components/jour30/`. Concept, spécification et système visuel :
  `mydigipal-academy/design/handoff-jour-30/` et la section 17 de son CLAUDE.md. Les composants
  sont une COPIE : une évolution se fait dans l'app d'abord, puis se reporte ici (le script de
  portage est dans la mémoire de session du 25/08, il ne remplace pas la relecture).
- **Aucun chiffre n'est écrit ici.** Prix, hausse du 1er octobre, leçons, minutes, grille de
  points, trente jours de Clara, verbatims et liens vers l'app viennent de
  `GET https://academy.mydigipal.com/api/academy/public/jour30?lang=` : lu au build (10 s de
  délai, puis l'instantané `src/data/academy/jour30-{fr,en}.json` prend le relais, le build ne
  tombe jamais), puis relu dans le navigateur par l'îlot. Rafraîchir les instantanés de temps en
  temps (`curl` de l'endpoint), ils ne servent qu'en secours.
- **Jetons** dans `src/styles/academy.css`, importé par `global.css` : la salle de nuit de l'app
  (`data-theme="nuit"`, `bg-salle`, `text-ivoire`, `text-brume-nuit`...), l'or, le renard. Polices
  préfixées `font-ac-*` (Space Grotesk, JetBrains Mono, Fraunces via `@fontsource-variable`,
  importées par la page seule) parce que le site a déjà un `--font-display`. ⚠️ Deux fichiers
  qui ne diffèrent que par la casse (`renard.ts` / `Renard.tsx`) cassent Rollup sur Windows :
  la silhouette est dans `silhouette.ts`.
- **Mesure** : même conteneur GTM que l'app. `src/components/academy/track.ts` pousse
  `select_item` et garde `gclid`/`fbclid`/`gbraid`/`wbraid` en session pour les remettre dans le
  lien du tunnel (`withAdClickIds`), sinon la conversion renvoyée côté serveur par l'app arrive
  sans attribution.
- Pas de `PageLayout` sur cette page : il ajoute le bouton collant du calculateur, qui
  flotterait par-dessus la barre de total du configurateur. `BaseLayout` + `Header` + `Footer`.
- Images de l'app copiées dans `public/academy/` (références, exercices, marque, captures).
- **Le haut de page a été refait le soir même** (direction A, choisie par Paul) : `Hero.tsx`,
  ce qu'on vend en une phrase avec les chiffres du JSON, la capture du tableau de bord à
  droite. Le terminal qui réécrivait un prompt (`Ouverture.tsx`, encore dans l'app) est sorti :
  il ne réagissait pas à la demande tapée et Paul l'a jugé « pourri ». Il reste dans l'app pour
  la page `/start` du module gratuit. **La page Academy vend l'en-ligne et ne parle pas des
  sessions en direct** (c'est la page AI Training) ; `Ailleurs.tsx` les signale en une bande.
- **La visite** (`Visite.tsx`, sous le hero) : le tableau de bord de l'app REFAIT en HTML dans sa
  salle de nuit (pas une capture), onze éléments survolables (`data-spot`), un panneau à droite
  (sous le menu sur mobile) qui porte le pitch au repos et la description de l'élément survolé,
  une visite automatique toutes les 4 s jusqu'au premier geste, la réponse de l'assistant qui
  s'écrit et le compteur de points qui monte. Chiffres du JSON, textes dans `copy.ts` (`visite`).
  ⚠️ Dans une grille à deux colonnes, un `order-first` sans borne (`max-lg:`) place l'élément
  dans la PREMIÈRE colonne à toutes les tailles : deux fois le même piège le 25/08.
- **Le lot du 25/08 au soir** (sept retours de Paul) : `Mention.tsx` est devenu le **ruban des
  trente jours** (trois niveaux de dix jours sur une ligne d'or, puis la mention) ; `Mcp.tsx`
  s'ouvre sur « Ce que vous saurez construire en sortant » avant « Un MCP, c'est une prise », avec
  **huit prises** (Gmail, Agenda, Tableur, CRM, Publicité, Documents, Slack ou Teams, Analytics)
  et plus aucun droit sous les bulles : le panneau joue le flux en trois temps (vous / le serveur /
  résultat) à chaque survol et dit les droits déclarés ; `Maison.tsx` + `Ailleurs.tsx` forment
  **la feuille**, seul bloc clair de la page (craie, papier, `#efeae0`), avec les **logos en
  couleur** pris dans `public/images/Training Logo/` : hauteurs réglées sur le GLYPHE et non sur
  le fichier (celui de Balenciaga n'occupe que 19 % de la hauteur du sien, Gucci 67 %) et
  `mix-blend-mode: multiply` pour les trois fichiers livrés sur fond blanc (YSL, Balenciaga,
  E.Leclerc), qui feraient un rectangle sur le crème. « Accès permanent » est devenu « accès
  complet » ; l'apprenante composée est **Clara Martin** (jamais Camille ; Sophie Lambert a été
  écarté parce qu'il ne passait pas en anglais).
- **Le second lot du 25/08 au soir** : la section MCP est passée sur **la feuille claire** aussi
  (la démonstration reste dans la nuit parce qu'elle montre les vrais écrans du produit ; le
  schéma se lit sur papier), fils `#d3ccbe` au repos et `#a8862f` actifs. Les verbatims sont
  **ceux des clients, mot pour mot, jamais réécrits** : la page vend l'en-ligne, donc `Maison.tsx`
  ne montre plus l'intitulé de la session sous l'auteur ; titre « Ils ont adoré le training ».
  Depuis le 25/08 au soir, le JSON sert **24 verbatims choisis dans l'export des 497 retours**
  (`mydigipal-academy/src/lib/academy/temoignages.ts`, avec la note), affichés en grille de
  trois colonnes dès md, en défilé au doigt en dessous ; une société sans logo s'écrit en
  toutes lettres. Les trois logos qui manquaient sont entrés le 25/08 au soir dans
  `public/images/Training Logo/` : GL Events (Wikimedia, lien donné par Paul), CBTW (temenos.com,
  lien donné par Paul), Datawords (datawords.com ; le mot est blanc dans leur fichier, repeint en
  encre pour la feuille claire). La
  section configurateur s'appelle **Tarifs / Pricing**, ancre `#pricing` (l'ancien `#composer`
  n'existe plus). **Le bouton qui suit le visiteur est celui de l'en-tête du site** : `Header.astro`
  accepte `ctaHref` et `ctaLabel`, et `academy.astro` y met « Ouvrir mon compte » vers `#pricing`,
  visible à toutes les tailles. Pas de rail flottant de boutons vers chaque section : c'est le
  sommaire animé que Paul a rejeté quatre fois le 24/08, et sur mobile il n'y a pas la place.
- **Au-delà de 25 places, un formulaire** (`FormEquipe.tsx`) à la place du `mailto:` : il poste sur
  `academy.mydigipal.com/api/academy/public/team-request` (lead CRM + courriel à Paul). **La ligne
  de la hausse** devient franche et dorée à moins de seize jours de la date du JSON
  (`hausseProche`), et disparaît d'elle-même le jour venu.
- **La page canonique est celle-ci.** `/jour-30` dans l'app est un atelier qui peut diverger.
- **Le lot du 27/08** (retours d'Alexandre, tranchés par Paul, commit `77166d8`) : la page **n'a plus
  le `Header` du site** ; elle porte sa propre barre, `Barre.tsx`, dans l'îlot (logo blanc, cinq
  repères cliquables Niveau 1 / 2 / 3 / Avis / Tarifs, ligne de progression jusqu'à `#pricing`,
  « Jour n / 30 » lu sur les `data-jour` des articles du récit et masqué après `#maison`, bouton
  d'achat ; repères cachés sous md). Ancres : `#niveau-1` (en-tête du premier niveau), `#niveau-2`
  et `#niveau-3` (les `Frontiere`, qui prennent un `id`), `#retournement`, `#maison`, `#avis`,
  `#pricing`. `Maison.tsx` replie les avis à neuf (`AVIS_VISIBLES`) avec un bouton `avisPlus` /
  `avisMoins`, et son titre ne parle plus d'agence ni de facturation (« Une méthode née en salle,
  chez Kering, La Poste ou Pierre Fabre »). `Ailleurs.tsx` n'est plus rendu sur la page (le fichier
  reste). Le second bouton du hero et du retournement mène au **module gratuit**
  `academy.mydigipal.com{/fr}/start`, rouvert dans l'app le même soir. Retournement :
  « Vous avez regardé le compte de Clara se remplir. Au tour du vôtre. » Écartés, avec Paul : le
  diplôme « validé OpenAI », un bloc promo en haut de page, les avis à la place de la capture du
  hero. ⚠️ La note du 25/08 « pas de rail flottant vers chaque section » visait un sommaire animé
  au milieu de la page ; la barre fine du haut est un autre objet, validée par Paul.

## La page de vente est passée en v2 (06-13/09/2026)

⚠️ **`/{lang}/academy` ne rend plus `Academy.tsx` mais `AcademyV2.tsx`**
(`src/components/academy-v2/`). L'ancienne page vit en `noindex` sur
`/{lang}/academy-v1` pour comparaison, et `/{lang}/academy-v2` n'est plus qu'une
redirection en `noindex`. Tout ce qui est écrit plus haut sur les sections du 25/08
reste vrai : **la v2 ne réécrit rien, elle importe les sections existantes de
`academy/` et change leur ORDRE**, plus trois ajouts (`Programme`, `OutilsCartes`,
`Questionnaire`) et une grille de tarifs à part (`Tarifs.tsx`, ancre `#tarifs` et
non `#pricing`).

Pourquoi : la page mesurée le 06/09 faisait 21 235 px, dont 37 % pour le récit des
trente jours et **3,8 % pour décrire la formation**. Google disait la même chose de
son côté avec ses scores de qualité.

- **Le programme (`academy-v2/Programme.tsx`) est la raison d'être de cette page.**
  Les vingt-trois modules des deux parcours sont **nommés d'emblée, un par ligne**
  (glyphe teinté, nom, durée à droite), et un clic ouvre la fiche du module : à
  droite en panneau collant dès lg, en carré flottant en dessous. C'est la
  direction B des trois maquettes du 13/09 (`docs/academy-programme/3-directions.html`).
  ⚠️ **Plus aucun dépliage** : le repli par étape, posé le 07/09, a été retiré le
  13/09 parce qu'il cachait ce qu'on vient vendre. Et **le monospace ne sert plus
  qu'aux durées et aux comptes** : les titres d'étape sont dans la police de la page.
- **Le contenu des modules est dans `academy-v2/modules.ts`**, relevé en production
  par l'API d'administration, jamais depuis `MyDigipal Admin/AI training/contenu/`
  qui est périmé. Les quatre parcours outils portent `auChoix` et comptent pour un
  seul module dans les totaux (`nombreSuivi`, `minutesDe`).
- **La grille : 290 € la méthode, 250 € les automatisations, 440 € les deux**
  (100 € d'économie sur 540, depuis le 13/09). Ces montants viennent de
  `data.lot.prix` servi par l'app ; la page ne les additionne plus, parce que
  l'addition afficherait 540 au-dessus d'un bouton qui mène à une caisse à 440.
- **Un seul appel flottant sous lg** (`AppelFlottant.tsx`) : « Commencer », et rien
  d'autre. La pastille de l'accès gratuit qui se posait au-dessus a été retirée le
  13/09 ; l'accès gratuit reste proposé dans le hero, le retournement et les tarifs.

### `ancre.ts` : un lien d'ancre ne suffit pas sur cette page

`src/components/academy/ancre.ts` (`allerA`, `surAncre`). Sur une page de plus de
quinze mille pixels, le défilement natif d'une ancre vise une position calculée **au
moment du clic** ; les îlots en `client:visible` s'hydratent pendant l'animation, donc
la cible a bougé avant qu'on l'atteigne. Mesuré en production le 13/09 à 390 px :
arrivée 157 px trop court, le mot « Pricing » au milieu de l'écran. `allerA` attend
que le défilement se soit arrêté puis rattrape l'écart, et tous les boutons qui mènent
aux tarifs (hero, barre, menu, retournement, appel flottant) passent par là.

⚠️ Deux pièges : le budget de rattrapage se compte **en temps, pas en trames** (une
animation douce sur douze mille pixels consomme 150 trames à elle seule), et
`behavior: 'auto'` reprend le `scroll-behavior: smooth` de la page, donc un rattrapage
doit être en `'instant'`.

### Un panneau qui sort du flux doit être compensé au défilement

Même mécanique, autre usage. Dans `Visite.tsx`, le panneau est dans le flux au repos
sous lg (`max-lg:order-first`) et passe en `fixed` au premier geste : sa hauteur
disparaissait du flux et tout ce qui est en dessous remontait de 240 à 360 px selon la
fiche. On mesure l'élément touché avant, on le remesure dans un `requestAnimationFrame`
(après le rendu de React, avant l'affichage) et on rend l'écart exact au défilement.
`Programme.tsx` n'a jamais eu le défaut parce que son panneau est `hidden` sous lg au
repos, donc déjà hors du flux.

## Les pages outils de l'Academy (11/09/2026)

`/{lang}/academy/{outil}` : une page de VENTE de la formation par outil, avec son
vocabulaire et ses écrans. **Les huit pages sont en ligne depuis le 13/09/2026**
(claude, copilot, chatgpt, gemini, en français et en anglais). Pilotage, brainstorm
et maquette : `docs/academy-tool-pages/`.

Pourquoi : `post_click_quality_score` BELOW_AVERAGE sur **39 mots-clés sur 39** dans
le compte 377-338-1446, parce que les quatre groupes d'annonces outils visaient tous
la page de vente générale. Google demandait jusqu'à 8,00 £ la première page sur
« formation microsoft copilot ».

- **Une seule route** : `src/pages/[lang]/academy/[tool].astro`, `getStaticPaths` sur
  les langues x les outils **publiés**. Un outil dont `publie` vaut faux n'est ni
  généré, ni mis au sitemap, ni lié : c'est ce qui permet de sortir les pages une par
  une sans renvois en 404 (et sans faire échouer `check-seo.mjs`).
- **Le contenu par outil** dans `src/components/academy-tools/<outil>.ts`, FR et EN
  côte à côte. L'anglais n'est pas une traduction : les deux marchés n'achètent pas
  les mêmes mots. Les mots-clés servis par chaque page sont listés dans le document
  de pilotage, section 05.
- **Deux îlots React seulement**, en `client:visible` : `Console.tsx` (les vraies
  captures de l'outil, repères au survol) et `Demo.tsx` (la même demande écrite deux
  fois). 78 Ko rendus contre 237 Ko pour la page de vente.
- ⚠️ **Une fonction passée en propriété d'un îlot Astro casse l'hydratation** :
  les propriétés traversent une sérialisation JSON. Ça compile, ça passe le build,
  et ça tombe en production avec « m is not a function ». Composer les libellés côté
  serveur (`indices: string[]`, pas `indice: (n) => string`).
- **Aucun montant dans le code.** Lus au build, puis RELUS dans le navigateur par le
  script du bas de page : un prix changé dans l'application apparaît sans
  redéploiement (exigence de Paul). Chaque valeur porte `data-fait` et son gabarit
  `data-gabarit`, où `{}` reçoit la valeur.
- **Les leçons viennent de l'application** depuis le 13/09/2026 : l'endpoint
  `/api/academy/public/jour30` sert `modulesOutils` (les leçons de chaque module
  outil, dans l'ordre, avec leur durée). `src/data/academy/lecons-outils.json` n'est
  plus qu'un secours, rafraîchi par `scripts/instantane-lecons-outils.py`.
  ⚠️ **Ne jamais reconstituer cette liste depuis `mydigipal-academy/atelier/contenu/`** :
  celle qui en venait annonçait 8 leçons et 49 min pour Claude, la production en sert
  **11 et 75 min**, et la page a affiché « Les 8 leçons » pendant deux jours.
- **Les livrables ouvrables** (`public/academy/livrables/`) viennent de la formaférence
  Claude du 09/09/2026 au Club d'affaires Protéine, construits autour d'une PME fictive
  (l'Atelier Rivière). `scripts/import-livrables-academy.py` les réimporte en retirant le
  nom du club et en neutralisant TOUTE mention d'outil (« produit avec l'IA »,
  « l'assistant a laissé passer un chiffre ») : les mêmes documents serviront sur les
  quatre pages, et y laisser le nom d'un outil qui ne les a pas produits serait faux.
  Ils portent `noindex`, sinon `check-seo` les juge comme des pages du site.
  `scripts/vignettes-livrables.py` refait les aperçus des deux langues, et les affiches
  des films sortent de ffmpeg à la troisième seconde. **Les cinq documents existent en
  anglais depuis le 13/09/2026** (`public/academy/livrables/en/`) :
  `scripts/livrables-textes.py` extrait les nœuds de texte, la traduction se fait
  dessus, le script les réinjecte, donc la mise en page ne se perd jamais.
  Matière encore disponible et non utilisée dans
  `Client Projects/Club Protéine/Formaference Claude/` : le film de présentation de 20 s,
  les sept cas d'usage du deck et les captures d'écran.
- **Pas de captures de Copilot, et il n'y en aura pas** : l'app n'en a aucune et Paul
  n'a pas la licence. Sa console porte donc DEUX SCHÉMAS, fabriqués par
  `scripts/schemas-copilot.py` et annoncés comme tels dans le chapeau : les cinq
  portes avec ce que chacune ne fait pas, puis ce que Copilot a le droit de lire et
  ses cinq angles morts. Emprunter des visuels Microsoft sur le web pour une page
  commerciale a été écarté (droits).
- **La barre est celle de la page de vente** (`BarreOutil.astro` + `Drapeau.astro`),
  sélecteur de devise et de langue compris, mais en Astro et non en React : la page
  ne charge React que pour la console et la démonstration. Les trois montants partent
  dans `data-prix` au build, donc le sélecteur répond au premier clic.
- **Gemini est volontairement plus courte** que les trois autres : cinq formulations
  achetées en français, deux en anglais. La remplir de généralités sur l'IA
  produirait du texte partagé avec les autres pages, donc du contenu dupliqué.
- **Les livrables sont partagés mais filtrés** (`livrablesDe()`) : ni Copilot ni
  Gemini ne montrent le site vitrine, aucun des deux ne rend une page web. Les deux
  films restent sur Claude.
- **Après mise en ligne** : URL finale **au niveau du mot-clé** dans Google Ads, ne
  jamais éditer les RSA (une annonce modifiée est remplacée et perd sa force et son
  historique). Mesure à trois semaines sur les mêmes 39 mots-clés.

### La page de vente renvoie vers les pages outils (13/09/2026)

`academy-v2/OutilsCartes.tsx`, **juste après le programme et avant le questionnaire**.
C'est le seul endroit qui marche : le programme se termine sur « vous choisissez un
outil, et le parcours ne garde que celui-là », donc la question « lequel ? » se pose
là, et le questionnaire qui suit aide à y répondre. Quatre cartes, une phrase, un
lien. ⚠️ Ce n'est pas le retour de la section retirée le 07/09 : c'est un aiguillage,
pas un chapitre. Les outils arrivent en propriété depuis `academy.astro` pour ne pas
embarquer le catalogue des huit pages dans l'îlot.

Chaque carte porte **la marque de son outil** depuis le 14/09
(`academy-tools/logos.ts`). ⚠️ **Fichier généré** par `scripts/marques-outils.py`
à partir des SVG gardés dans `scripts/sources-marques/logos/` : Claude, OpenAI et
Google Gemini viennent de simple-icons (CC0), Microsoft 365 Copilot de Wikimedia
Commons (version « one-color »). Ne pas retoucher les tracés à la main.
Elles sont **monochromes et rendues en `currentColor`** : les vraies marques de
Copilot et de Gemini portent un dégradé, et le système n'a qu'une couleur d'accent
sans aucun dégradé. Usage nominatif seulement, jamais à côté du logo MyDigipal
d'une manière qui suggérerait un partenariat.

## Chantier à venir : les pages IA (demande de Paul du 25/08/2026)

Paul veut vendre l'Academy en priorité, puis « refaire un petit peu » les autres pages IA.
- **`/[lang]/ai`** doit présenter quatre solutions : l'AI Academy (en ligne), la formation en
  présentiel ou à distance (AI Training), les solutions d'automatisation (AI Solutions), et la
  création de contenu IA (AI Content), dont Paul doute qu'elle reste une page à part (« c'est un
  peu des automatisations qu'on crée »). Fait le 25/08 : l'Academy est entrée en tête de la
  liste, le bouton principal du hero mène à `/academy`, le sous-titre de la formation dit
  « en présentiel ou à distance ». Le reste de la page est intact : hero violet à orbes,
  chiffres « 300 % / 50+ / 100+ » non sourcés, trois cartes à dégradés. C'est le look par
  défaut d'une IA (skill `design-taste-frontend`), à refondre, pas à retoucher.
- **`/services/ai-training`** (vend la salle et le distanciel), **`/services/ai-solutions`**,
  **`/services/ai-content`** : à revoir dans la foulée, avec la question de fusionner AI Content
  dans AI Solutions. Le style de l'Academy (salle de nuit, or, Space Grotesk) n'est pas celui du
  site ; décider avant de refondre si les pages IA adoptent une teinte commune.

