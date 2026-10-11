# Anciens skills retirés le 10/10/2026 : MyDigipal Website

Recopiés mot pour mot au moment de leur retrait de `~/.claude/skills` (refonte des skills v2.2, chantier Claude Startups). C'est de l'historique : les règles en vigueur sont dans le `CLAUDE.md` du dépôt et dans les skills `mydigipal-equipe` et `mydigipal-paul`. Une contradiction se tranche en faveur du `CLAUDE.md`. Les dates et chemins sont ceux de l'époque.


Rien n'est perdu : la partie méthode de ces skills est dans la v2.2 ; ce qui reste ici est le savoir propre au dépôt, à trier en versant les blocs ci-dessus.

### Ancien skill `tailwind-4-astro-6-migration` (~/.claude/skills, retiré le 10/10/2026)

~~~~markdown
# Tailwind 4 + Astro 6 - Pièges de migration

Découvert lors de la migration MyDigipal Website (mai 2026, Astro 5.18 → 6.2.2 + Tailwind 3 → 4.2.4).

## `@apply <custom-class>` ne marche plus

En Tailwind 4, `@apply` ne supporte que les utility classes natives. Une classe custom du même `@layer components` ne peut plus être référencée via `@apply`.

**Mauvais (Tailwind 3, casse en T4)** :
```css
.btn { @apply inline-flex items-center px-6 py-3 ...; }
.btn-primary { @apply btn bg-primary-500 ...; }  /* Cannot apply unknown utility class `btn` */
```

**Bon (T4-compatible)** : inliner les utilities, dupliquer le base style.
```css
.btn-primary { @apply inline-flex items-center px-6 py-3 ... bg-primary-500 ...; }
```

S'applique aussi aux classes `.badge`, `.input`, `.card`, etc. dont on faisait des variants via `@apply`.

## `<style>` Astro scopé : `@reference` obligatoire pour `@apply`

En Tailwind 4, les blocs `<style>` scopés (Astro, CSS modules, Vue SFC) doivent commencer par `@reference "<path-vers-global.css>"` pour avoir accès aux utility classes via `@apply`.

```astro
<style>
  @reference "../../../styles/global.css";

  .my-class { @apply bg-slate-100 text-slate-600; }  /* OK */
</style>
```

Sans `@reference` : erreur `Cannot apply unknown utility class. Are you using CSS modules or similar and missing @reference?`.

## Astro 6 Content Layer API

### `src/content/config.ts` → `src/content.config.ts`
Le fichier doit être au top-level de `src/`, pas dans `src/content/`. Sinon `LegacyContentConfigError`.

### Loader obligatoire pour chaque collection
```ts
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({ ... }),
});
```

Le `type: 'content'` legacy n'est plus supporté.

### `entry.slug` → `entry.id`
Find/replace global dans pages, sitemap, RSS :
```bash
sed -i 's/post\.slug/post.id/g; s/study\.slug/study.id/g; ...' src/**/*.{astro,ts}
```

### `entry.render()` → `render(entry)`
```ts
import { getCollection, render } from 'astro:content';
const { Content } = await render(post);  // au lieu de post.render()
```

## @astrojs/tailwind v5 incompatible avec Astro 6

Le package `@astrojs/tailwind` est **deprecated** en Tailwind 4. Le path moderne :

```js
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Drop l'integration `tailwind()`, install `@tailwindcss/vite`. Pour le CSS :
```css
/* Avant */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Après */
@import "tailwindcss";
```

### Migration tokens custom (legacy `tailwind.config.mjs` → `@theme`)
Deux options :

**1. Garder le legacy fichier (rapide)** :
```css
@import "tailwindcss";
@config "../../tailwind.config.mjs";
```

**2. Migrer vers `@theme` natif (moderne)** :
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@theme {
  --font-display: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  --color-primary-500: #3B82F6;
  --color-service-seo: #10B981;
  --spacing-18: 4.5rem;
  --shadow-soft: 0 2px 8px -2px rgb(0 0 0 / 0.05);
  --text-display: 4.5rem;
  --text-display--line-height: 1;
  --text-display--letter-spacing: -0.02em;
  --animate-aurora: aurora 60s linear infinite;
}
@keyframes aurora { from { ... } to { ... } }
```

## CSS scoped global ne doit JAMAIS définir `display` sur un élément avec utility responsive

**Anti-pattern** (a cassé le menu mobile MyDigipal) :
```css
[data-nav-pill] {
  display: inline-flex;  /* override le `hidden lg:flex` Tailwind sur mobile */
  position: relative;
  isolation: isolate;
}
```

```html
<div class="hidden lg:flex" data-nav-pill>...</div>
```

Résultat : pill nav apparaît sur mobile (où `hidden` devrait gagner).

**Bon** : laisser Tailwind gérer la visibilité par breakpoint, le CSS global ne style que position/marker context.
```css
[data-nav-pill] {
  position: relative;
  isolation: isolate;
}
```

## Pattern multi-valued animation pour cumuler reveal + idle animation

Le shorthand `animation:` écrase tout. Pour cumuler une animation one-shot (reveal at load) avec une animation infinite (float idle) sur le même élément :

```css
.hero-card {
  animation-name: hero-reveal, heroFloat;
  animation-duration: 0.7s, 7s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1), ease-in-out;
  animation-delay: var(--delay, 0ms), calc(var(--delay, 0ms) + 800ms);
  animation-fill-mode: forwards, none;
  animation-iteration-count: 1, infinite;
}
```

Ne JAMAIS utiliser le shorthand `animation: hero-reveal ...; animation: heroFloat ...;` - le second override le premier.

## Pattern `(hover: none), (max-width: 768px)` pour fallback mobile

Composants avec states cachés derrière `:hover` (stat révélée, reveal link) sont invisibles sur touch devices. Pattern fallback :

```css
.svc-stat { opacity: 0; transition: opacity 0.35s; }
.svc-cell:hover .svc-stat { opacity: 0.18; }

@media (hover: none), (max-width: 768px) {
  .svc-stat { opacity: 0.22; }  /* visible en permanence sur mobile/touch */
}
```

`(hover: none)` catch les écrans tactiles, `(max-width: 768px)` catch les viewports mobiles.

## Container queries (Tailwind 4 / native CSS)

Plus moderne que `@media` viewport-based :

```css
.svc-grid-wrap {
  container-type: inline-size;
  container-name: svc-grid;
}
.svc-grid-v2 { grid-template-columns: 1fr; }

@container svc-grid (min-width: 600px) {
  .svc-grid-v2 { grid-template-columns: repeat(2, 1fr); }
}
@container svc-grid (min-width: 1024px) {
  .svc-grid-v2 { grid-template-columns: repeat(4, 1fr); }
}
```

Avantage : la grille s'adapte au container width (sidebar 600px peut afficher la grille en 2 col), pas au viewport.

## Gradient oklch avec fallback

```css
.hero-gradient-text {
  background: linear-gradient(in oklch 135deg, oklch(58% 0.21 280) 0%, oklch(58% 0.27 305) 50%, oklch(72% 0.15 200) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Safari < 16.4 fallback */
@supports not (background: linear-gradient(in oklch, red, blue)) {
  .hero-gradient-text {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
  }
}
```

oklch interpolation = transitions de couleur perceptuellement plus douces, gradients plus pro.

## Astro `<Image>` et `public/`

`<Image>` Astro **n'optimise PAS** les assets du dossier `public/` (servis tels quels). Pour des optim WebP/AVIF + breakpoints automatiques, les images doivent être dans `src/assets/` + importées.

Pour les images dans `public/` (cas MyDigipal), optim possible via attrs HTML standards :
```html
<img
  src={post.data.image}
  alt={post.data.title}
  loading="eager"
  fetchpriority="high"
  decoding="async"
  width="1200"
  height="630"
/>
```

## Cas de référence
- MyDigipal Website (mai 2026) : commits `a2236f4` (migration Astro 6 + Tailwind 4), `58e739f` (quick wins post-upgrade @theme + container queries + oklch + 3D transforms), `dcde178` (hotfix menu mobile cassé par CSS scoped global).
~~~~
