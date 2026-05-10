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

## 3. Architecture du calculateur (v5)

### Fichiers principaux
- **Composant** : `src/components/calculator/Calculator.tsx` (~2200 lignes)
- **Data** : 8 fichiers dans `data/` (seo, google-ads, paid-social, emailing, ai-training, ai-solutions, ai-content, tracking-reporting)
- **Config centrale** : `data/index.ts` - domainConfigs, BUDGET_CONFIG, DURATION_CONFIG, MANAGEMENT_FEE_CONFIG, CURRENCY_CONFIGS
- **Types** : `types.ts` - ServiceDomain (8 domaines incluant 'ai-content'), Currency ('EUR' | 'USD' | 'GBP')
- **Traductions** : `translations.ts` - clés EN/FR, fonction `t()`
- **Docs** : `docs/calculator/CALCULATOR-AUDIT.md`

### Patterns importants
- Prix affichés via `fp()` (formatPrice) pour support multi-devises
- Les prix restent en EUR dans le code, conversion côté affichage seulement
- AI Solutions a des packages concrets + formulaire custom (showAiCustomForm)
- Paid Social a `socialChannels` export pour la sélection de canaux

## 4. Mode guide conversationnel (v1)

### Fichiers
- `GuidedMode.tsx` (chat UI), `guided-data.ts` (questions + scoring)
- Intégration : step `'guided'` dans Calculator.tsx, avant la sélection manuelle

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

## 7. Refonte design V2 (mai 2026 - handoff Claude Design)

Plan de refonte : `~/.claude/plans/serene-drifting-riddle.md`. Source : `Claude design handoffs/` (7 patterns + production-refs).

### Fondation partagée
- `src/lib/scroll.ts` - exports `initRevealOnScroll`, `initCountUp`, `initScrollProgress`, `initMagneticPointer`, `initMagneticButton`, `initSlidingNavMarker`, `initAll`. Tous skip sous `prefers-reduced-motion` (rendu final statique).
- Wired dans `BaseLayout.astro` via `astro:page-load` listener pour survivre aux View Transitions.
- Classes utility ajoutées dans `global.css` : `[data-reveal]`, `[data-scroll-progress]`, `[data-nav-pill]/[data-nav-marker]/[data-nav-link]`, `[data-magnetic]`, `[data-magnetic-btn]/[data-magnetic-target]`.

### Composants V2 livrés
| Composant | Fichier | Pattern |
|---|---|---|
| `Header.astro` (patché) | `src/components/layout/Header.astro` | Pill nav avec sliding marker (data-nav-pill / -marker / -link / -active) |
| `ServicesGridV2.astro` | `src/components/sections/ServicesGridV2.astro` | Magnetic services grid 4x2 avec radial gradient pointer + ghost stat + reveal link |
| `StatsRail.astro` | `src/components/sections/StatsRail.astro` | 4 tiles glassy dark gradient + count-up + sparkline SVG (drawSpark animation) |
| `IndustryCardV2.astro` | `src/components/sections/IndustryCardV2.astro` | 5 layers : bg gradient + radial glow + grid pattern + lines SVG draw + floating chips bob |
| `MagneticButton.astro` | `src/components/ui/MagneticButton.astro` | CTA magnétique avec shine sweep ::before (variants dark/light/gradient) |
| Top scroll progress bar | injecté dans `BaseLayout.astro` (`<div data-scroll-progress><i></i></div>`) | Indigo→cyan gradient, position fixed top, suit le scroll |

### Composants V2 à venir
- `CalculatorInlinePreview.astro` - mini-calc vanilla JS sur la homepage (chips + 2 sliders + total bumped). Math à cross-checker avec `src/components/calculator/data/index.ts` (BUDGET_CONFIG, MANAGEMENT_FEE_CONFIG).
- `TestimonialMarquee.astro` - bandeau infini horizontal CSS-only, pause on hover/focus-within.

### Workflow V1/V2
- Tous les composants V2 sont d'abord intégrés dans `src/pages/test.astro` (page noindex) pour validation visuelle Paul avant cutover homepage.
- Cutover progressif dans `src/pages/[lang]/index.astro` une fois validé.
- Les composants V1 (sections inline dans `index.astro`, `MetricsCounter`, etc.) ne sont PAS supprimés - ils restent utilisés sur d'autres pages (services/[slug], blog, contact).

### Cohérence avec le Hub auth (mydigipal-dashboard/)
Le Hub MyDigipal a son propre handoff Claude Design (KPI cards, charts ECharts, tables enrichies). Les deux ecosystèmes design sont distincts mais coordonnés via `~/.claude/projects/_shared/design-handoff-sync.md` :
- Site = Inter + Plus Jakarta Sans, palette indigo→violet→cyan créative
- Hub = Inter + Space Grotesk, palette brand-blue/dark + channel colors data
- Patterns transversaux : count-up easing (easeOutCubic 1400ms), reveal-on-scroll cubic-bezier, magnetic button portable
- Patterns site-only : magnetic services grid, testimonial marquee, layered industry cards, calc inline preview
- Patterns hub-only : KPI variants A/B/C, ECharts trend/funnel/heatmap/donut, benchmark bars, campaign tables filtered/sorted/paginated
