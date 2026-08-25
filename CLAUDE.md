# MyDigipal Website - Site Astro + Calculateur React

## 1. Vue d'ensemble

| Clé | Valeur |
|-----|--------|
| Stack | Astro 6.2.2 + Tailwind 4.2.4 + React islands |
| Calculateur | `/en/calculator` et `/fr/calculator` (React island) |
| Webhook | `https://n8n.mydigipal.com/webhook/calculateur-marketing` |
| Build | `npm run build` (~14s, 200 pages) |
| Hosting | **Render** (auto-deploy GitHub via `render.yaml`) - Cloudflare = DNS proxy/CDN devant uniquement |
| Déploiement | `git push origin main` → Render webhook → build → publish (~2-3 min) |

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

### Vérifier avant de conclure
`node scripts/audit-metas.py` lit le `dist/` et sort les titres hors 50-60, les
descriptions hors 145-160, les doublons EN/FR et les H1 manquants. Le lancer après
build plutôt que se fier aux sources : c'est le HTML généré que Google voit.

### Redirections
Elles ne se configurent PAS dans `render.yaml` : le service Render n'est rattaché à
aucun Blueprint (son buildCommand réel diffère de celui du fichier). Elles se
saisissent dans le dashboard Render, onglet Redirects and Rewrites.

## 3. Architecture du calculateur (v5)

### Fichiers principaux
- **Composant** : `src/components/calculator/Calculator.tsx` (~2200 lignes)
- **Data** : 8 fichiers dans `data/` (seo, google-ads, paid-social, emailing, ai-training, ai-solutions, ai-content, tracking-reporting)
- **Config centrale** : `data/index.ts` - domainConfigs, BUDGET_CONFIG, DURATION_CONFIG, MANAGEMENT_FEE_CONFIG, CURRENCY_CONFIGS
- **Types** : `types.ts` - ServiceDomain (8 domaines incluant 'ai-content'), Currency ('EUR' | 'USD' | 'GBP')
- **Traductions** : `translations.ts` - clés EN/FR, fonction `t()`
- **Docs** : `docs/calculator/CALCULATOR-AUDIT.md`

### Écran unique depuis le 04/08/2026
Il n'y a plus d'étape intermédiaire ni de bouton "Continuer". La grille de domaines
(`domainPicker`) et la configuration partagent le même écran : cocher un domaine
déplie sa section juste en dessous. `step` ne vaut plus que `'guided' | 'configure'
| 'summary'` et démarre sur `'configure'`.

**Piège** : les sections portent une ancre `data-domain-section={domainId}` et un
`scrollMarginTop` de 112 px. C'est ce qui fait défiler l'écran vers la section qui
s'ouvre. Sans l'ancre, la section s'ouvre hors écran et le clic paraît sans effet.

### Patterns importants
- Prix affichés via `fp()` (formatPrice) pour support multi-devises
- **`formatPrice(priceEUR, currency)` convertit DÉJÀ depuis l'EUR.** Ne jamais lui
  passer `convertPrice(...)` : c'était le bug de double conversion (+9% USD, -12% GBP)
  corrigé le 04/08/2026 dans StickySummary et CaptureModal
- `pricing.grandTotal` = total hors budget média. C'est la valeur de conversion
  envoyée au webhook, à GA4 et au pixel Meta
- AI Solutions a des packages concrets + formulaire custom (showAiCustomForm)
- Paid Social a `socialChannels` export pour la sélection de canaux

### Tracking du funnel
`tracking.ts` pousse les events dans le dataLayer : `calculator_step`,
`_domain_toggle`, `_service_toggle` (avec niveau et prix), `_channel_toggle`,
`_budget_set`, `_abandon`. Côté GTM, container `GTM-P4TSQ9Q`, version 75 publiée le
04/08/2026 avec 15 variables, 6 triggers et 6 tags. Property GA4 du site =
**281550532**, pas 523618980 qui est le Client Portal.

## 4. Mode guide conversationnel (v1)

### Fichiers
- `GuidedMode.tsx` (chat UI), `guided-data.ts` (questions + scoring)
- Intégration : step `'guided'`, accessible depuis le bouton "Aidez-moi à choisir"
  de la sticky card

### Logique
- 5 questions : industrie, objectifs (multi), budget (slider), efforts actuels (multi), contexte libre
- Scoring : pertinence industrie (0-1) + boost objectifs (+0.2 à +0.5) - seuil inclusion > 0.6
- Contrainte budget : max 3 domaines si <=1500 EUR, max 5 si <=3000 EUR
- Mapping budget vers niveaux : <=1500 EUR = Starter, 1500-4000 EUR = Growth, >4000 EUR = Premium

### Référence business : Propale ControlAI
- 7+1 canaux : Meta, Reddit, Google, LinkedIn, YouTube, TikTok, Display, Community Management
- 3 packs : Essentials (£4-5.3K/mois), Growth (£9.6-12.8K/mois), Impact (£15.5-20.1K/mois)
- Évolution : Mois 1-2 Essentials, Mois 3-4 Growth, Mois 5-6 Impact

## 5. Points techniques importants

### Bugs corrigés (à retenir)
- `handleGuidedComplete` : les clés de sélection doivent être `service.id` seul, PAS `${domainId}-${service.id}`
- `budgetActivated` : activer pour tout domaine ads recommandé (pas seulement si budget > 500)

### Pages services - switch par slug
- Toutes les pages `/services/*` sont générées par `src/pages/[lang]/services/[slug].astro`
- Le contenu est un switch géant `isXxxService` par slug, qui rend les bons composants de `src/components/sections/`
- Les MDX dans `src/content/services/{lang}/` ne portent que la copy du hero (title, badge, headline, metrics, testimonial, seo)
- Les sections riches (WhyXxx, XxxProcess, etc.) sont des composants .astro autonomes

### Convention de réutilisation entre pages services
- Même idée visuelle sur 2 pages services + copy légèrement différente → prop `variant` sur un composant partagé (voir `MarketingStackGrid.astro` avec `variant: 'training' | 'solutions'`)
- Positioning fondamentalement différent (formation vs delivery) → composants dédiés pour éviter un mega-switch (voir `MCPBuildSection` sur AI Training vs `MCPCustomBuildSection` sur AI Solutions)

### Chiffres MCP Gateway exposés publiquement - à synchroniser
- `244` tools / `21` plateformes / `18+` clients affichés sur `/services/ai-training` ET `/services/ai-solutions` dans `MarketingStackGrid.astro` (tableau `proofs`)
- Si le MCP Gateway évolue (ajout module, perte/gain client), resync ces 3 nombres dans ce fichier - c'est le seul endroit où ils sont en dur côté site

### CTAs avec query param `?topic=` pour tracking futur
- Les CTAs MCP vers `/contact` passent un `?topic=` : `mcp`, `mcp-build`, `mcp-package`, `parcours-technique`
- Pas encore exploité par le formulaire, prévu pour segmenter les leads entrants par intention

## 6. Améliorations futures (mode guide)
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

## 7. Refonte design V2 (mai 2026 - handoff Claude Design)

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
  toutes lettres (GL Events, Datawords, CBTW). La
  section configurateur s'appelle **Tarifs / Pricing**, ancre `#pricing` (l'ancien `#composer`
  n'existe plus). **Le bouton qui suit le visiteur est celui de l'en-tête du site** : `Header.astro`
  accepte `ctaHref` et `ctaLabel`, et `academy.astro` y met « Ouvrir mon compte » vers `#pricing`,
  visible à toutes les tailles. Pas de rail flottant de boutons vers chaque section : c'est le
  sommaire animé que Paul a rejeté quatre fois le 24/08, et sur mobile il n'y a pas la place.
- **La page canonique est celle-ci.** `/jour-30` dans l'app est un atelier qui peut diverger.

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

