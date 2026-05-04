# Handoff: MyDigipal Site v2 — design uplift

## Overview

A set of **7 design improvements** for the existing MyDigipal marketing site
(repo: `MyDigipal/mydigipal-website`, Astro 5 + Tailwind + minor React islands).

The current site is clean but reads as flat: static service grid, fixed stats,
calculator buried on its own page, blocky industry cards, simple nav, no social
proof on the home, polite CTA. This package proposes targeted upgrades that
bring motion, interactivity and depth — without rewriting the stack.

## About the design files

The bundled HTML file (`site_v2_improvements.html`) is a **design reference**, not production code. It demonstrates the intended look and behavior of each improvement using vanilla HTML/CSS/JS so reviewers can interact with all 7 patterns in one document.

The task for Claude Code is to **port each pattern into the existing Astro + Tailwind codebase** using the project's established conventions (`src/components/sections/*.astro`, `src/components/ui/*.astro`, the Tailwind tokens in `tailwind.config.mjs`, and the colour CSS variables in `src/styles/global.css`). The production refs in `production-refs/` are starting points — **adapt them**, don't copy verbatim.

## Fidelity

**High-fidelity.** Final colours, type, spacing, easing curves and animation
durations are all defined and match the site's existing design tokens (Inter +
Plus Jakarta Sans, Tailwind blue/slate primary palette, service accent colours).
Recreate pixel-for-pixel.

## The 7 improvements

Each section below documents one improvement: what it replaces, the layout, the
exact behaviour, and which file in the repo to touch.

---

### #1 — Magnetic services grid

Replaces the current 6-card services grid (currently rendered in
`src/pages/[lang]/index.astro` around the `<ServicesPreview>` block).

**Layout**

- 3-col × 2-row CSS grid, single 1px slate-200 background bleeding between cells
  (`gap: 1px; background: #E2E8F0`).
- Each cell is a `.svc-cell` — white `#fff`, padding `32px 28px`, min-height
  200px, `cursor: pointer`, `overflow: hidden`.

**Content order inside each cell**

1. Eyebrow `01 / SEO` — `font-mono`, 11px, slate-500.
2. `<h3>` — Plus Jakarta Sans 700, 20px, tracking `-0.01em`, slate-900.
3. `<p>` — Inter 400, 13px, slate-600, max-width 28ch, line-height 1.5.
4. Reveal link — bottom 24px, left 28px. Service-coloured. Hidden by default
   (`opacity:0; transform: translateY(8px)`), reveals on hover
   (`opacity:1; translateY(0)`). 350ms cubic-bezier(.4 0 .2 1).
5. Ghost stat (top-right 28px) — Plus Jakarta 800, 28px, service-coloured,
   default `opacity:0; transform: scale(.8)`. On hover → `opacity:.18; scale(1)`.

**The magnetic effect**

A `::before` pseudo on `.svc-cell` is a radial gradient that follows the
pointer:

```css
.svc-cell::before {
  content:"";
  position:absolute;
  inset:0;
  background: radial-gradient(circle at var(--mx,50%) var(--my,50%),
              var(--svc-tint,#ecfdf5) 0%, transparent 60%);
  opacity:0;
  transition: opacity .35s cubic-bezier(.4,0,.2,1);
  pointer-events:none;
}
.svc-cell:hover::before { opacity:1; }
```

JS sets `--mx` and `--my` from the pointer position. Each cell defines its
own `--svc-tint` (light) and `--svc-color` (mid) custom properties, mapped
to the 9 service hues already in `tailwind.config.mjs`:

| Service        | tint     | color    |
| -------------- | -------- | -------- |
| SEO            | #ecfdf5  | #10B981  |
| Google Ads     | #fffbeb  | #F59E0B  |
| Paid Social    | #f5f3ff  | #8B5CF6  |
| B2B / ABM      | #fdf2f8  | #EC4899  |
| Tracking       | #f0fdfa  | #14B8A6  |
| AI             | #ecfeff  | #06B6D4  |

**Repo target**

- Create `src/components/sections/ServicesGridV2.astro` and replace the
  current services grid include in `src/pages/[lang]/index.astro`.
- The pointer JS lives in a `<script>` block at the end of the component
  (Astro inlines it once per page).
- Production reference: `production-refs/ServicesGridV2.astro`.

---

### #2 — Hero stats with count-up + sparklines

Replaces the static "50+ / +247% / 8+ / 12+" row in the homepage hero.

**Layout**

- 4 tiles in a single grid row (`repeat(4, 1fr); gap: 16px`).
- Tile: padding `24px 20px`, radius `16px`, glassy on dark
  (`background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px)`).
- Hover: `translateY(-2px)`, lighter background, lighter border. 300ms.

**Tile contents**

- Top row (flex, space-between): label (font-mono 11px, white/0.5,
  uppercase, letter-spacing .05em) + pill ("+14% YoY", "last 12mo", etc.)
  Pill is `background: rgba(16,185,129,.15); color:#34d399; font-mono 10px;
  padding 2px 8px; radius 9999px`.
- Number: Plus Jakarta 800, 44px, tracking `-0.02em`, line-height 1, gradient
  text from `#a5b4fc` → `#67e8f9` (-webkit-background-clip:text).
- Description: 12px, white/0.6, line-height 1.4.
- Sparkline: absolute-positioned SVG, 100% × 32px, bottom 0. Path strokes
  the gradient `<linearGradient id="g">`. The path has `stroke-dasharray: 200;
  stroke-dashoffset: 200; animation: drawSpark 2.4s cubic-bezier(.4 0 .2 1)
  forwards`.

**Count-up logic**

```js
const countUp = (el) => {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1400;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-target]').forEach(countUp);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('[data-counter-section]').forEach(p => io.observe(p));
```

Mark the section with `data-counter-section`, mark each number with
`data-target="247"`, optional `data-prefix="+"` and `data-suffix="%"`.

**Repo target**

- New `src/components/sections/StatsRail.astro`. Replace the current
  static stat row in the home hero.
- Production reference: `production-refs/StatsRail.astro`.

---

### #3 — Inline calculator preview

Currently the calculator lives at `/calculator`. We add a **lightweight
live preview** to the homepage (the full calculator stays as the deep tool).

**Layout**

- Section background: `linear-gradient(135deg, #4f46e5, #6d28d9)` (existing
  calc gradient).
- 2-column grid `1.1fr 1fr`, min-height 380px. Stacks under 760px.
- Left = `.calc-controls` (padding 36px 32px). Right = `.calc-preview`
  (background `rgba(0,0,0,0.2)`, left border `rgba(255,255,255,0.08)`,
  padding 32px).

**Controls (left)**

- H3 "Build your budget" — Plus Jakarta 800, 24px, tracking -0.01em.
- Lead 13px, white/0.85.
- Service chips: rounded-pill `.calc-chip`, 6px 12px padding, white/0.1
  background, white/0.2 border, 13px medium. `.on` state: white background,
  indigo-600 text (#4f46e5), white border.
- Sliders: thin (4px) white/0.2 track, 18px white thumb with white/0.15
  ring, accent-color white.

**Preview (right)**

- Label "Estimated retainer · monthly" — 11px font-mono uppercase, white/0.6.
- Total: Plus Jakarta 800, 48px, tracking -0.02em, line-height 1.
  When changed → add `.bump` class for 250ms (`transform: scale(1.05);
  transition: all .3s`).
- Progress bar (4px tall, white/0.1 track, gradient fill #a5b4fc → #67e8f9,
  width transitions 350ms).
- Breakdown: rows (flex, space-between, 8px 0, dashed border-bottom). Disabled
  services use `.muted` class (opacity .4, line-through).
- Footer line — 11px font-mono white/0.5: "incl. weekly optimisation · monthly reporting · dedicated strategist".

**Math**

```js
function calc() {
  const budget = +budgetSlider.value;     // £2k–£40k step 500
  const term   = +termSlider.value;       // 1–12 mo
  let total = 0;
  chips.forEach(c => {
    const mult = parseFloat(c.dataset.mult);   // SEO 1.4, Ads 1.6, etc
    const v    = Math.round(budget * mult * 0.4);
    if (c.classList.contains('on')) total += v;
    // also build the breakdown rows
  });
  total = Math.round(total * (1 + (term-1) * 0.02));   // +2% per extra month
}
```

**Repo target**

- `src/components/sections/CalculatorInlinePreview.astro` (new).
- The full calculator React island under `src/components/calculator/` stays
  as-is on the dedicated page. This inline version is intentionally
  vanilla JS — no React island needed.
- Production reference: `production-refs/CalculatorInlinePreview.astro`.

---

### #4 — Layered industry cards

Replaces the two flat-gradient B2B and Automotive cards.

**Anatomy**

`.ind-card` is a 24px-radius container, height 300px, base
`linear-gradient(135deg, #0f172a, #1e1b4b)`. Inside it stacks 5 layers,
back-to-front:

1. `.layer.bg` — radial gradients (indigo + cyan at differing positions).
   On parent hover: `transform: scale(1.08)` (800ms cubic-bezier(.4 0 .2 1)).
2. `.layer.grid-l` — the existing `/images/patterns/grid.svg` at 120px tile,
   opacity .06.
3. `.lines` — absolute-positioned `<svg>` with 3 `<path>` curves drawn at
   stroke `rgba(255,255,255,0.18)`, 1px wide, `stroke-dasharray:600;
   stroke-dashoffset:600; transition: stroke-dashoffset 1.4s` — they draw
   themselves on hover.
4. `.floating` — a 200px column of three `.float-item` chips, each a glass
   pill with `backdrop-filter: blur(12px)` and `animation: bob 4s ease-in-out
   infinite` with staggered `animation-delay: 0, -1.5s, -3s`.
5. `.body` — z-index 2, the actual heading and CTA.

**Body content**

- Tag pill (uppercase 12px font-mono, white/0.15 bg, blur 8px).
- Title — Plus Jakarta 700, 32px, tracking -0.01em.
- Sub — 14px, white/0.75, max-width 36ch.
- CTA arrow — translates `+6px` on hover (300ms).

**Float-item example (B2B)**

```html
<div class="float-item"><span class="dot"></span>+62% pipeline · BYmyCAR</div>
<div class="float-item"><span class="dot blue"></span>1,200 accounts targeted</div>
<div class="float-item"><span class="dot amber"></span>30% faster close</div>
```

**Repo target**

- Refactor the existing industry-cards block in `src/pages/[lang]/index.astro`
  into `src/components/sections/IndustryCard.astro` and pass props for
  `gradient`, `tag`, `title`, `sub`, `floats[]`.
- Production reference: `production-refs/IndustryCard.astro`.

---

### #5 — Pill nav with sliding marker + scroll progress

Replaces the current header nav active-state (currently just a colour change
in `src/components/layout/Header.astro`).

**Pill marker**

- Container `.nav-mock`: white/0.7 bg + blur(12px), 16px radius, 8px padding,
  inline-flex, soft shadow.
- Each link: 10px 18px padding, 14px medium, slate-600. Active = slate-900.
- The marker (`.nav-marker`) is an absolute white tile (1px shadow + 1px
  border ring) that animates `left` and `width` to match the active link
  (350ms cubic-bezier(.4 0 .2 1)). Z-index 1; links sit z-2 so the marker
  glides under the active label.

```js
function moveMarker(btn) {
  const r  = btn.getBoundingClientRect();
  const pr = navPill.getBoundingClientRect();
  marker.style.left  = (r.left - pr.left) + 'px';
  marker.style.width = r.width + 'px';
}
```

Call on click + on initial render (`requestAnimationFrame(() => moveMarker(active))`).

**Scroll progress bar**

A single `<i>` inside a `<div class="scroll-bar">` at the top of the page.
Width = `(scrollY / (scrollHeight - innerHeight)) * 100%`. Listen to
`scroll` with `{ passive: true }`. The fill uses the indigo→cyan brand
gradient (`linear-gradient(90deg, #6366f1, #06b6d4)`).

**Reveal-on-scroll util**

```js
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-revealed');
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealIO.observe(el));
```

CSS:
```css
[data-reveal] { opacity: 0; transform: translateY(16px); transition: opacity .6s, transform .6s; transition-timing-function: cubic-bezier(.4,0,.2,1); }
[data-reveal].is-revealed { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}
```

**Repo target**

- Edit `src/components/layout/Header.astro` to wrap the desktop nav with
  the marker.
- New util `src/lib/scroll.ts` exporting `initScrollProgress()` and
  `initRevealOnScroll()`. Call both from the global layout.
- Production reference: `production-refs/Header.astro` + `production-refs/scroll.ts`.

---

### #6 — Testimonial marquee

Replaces "no social proof on the home" with an infinite horizontal marquee
between Services and the Calculator.

**Layout**

- Full-bleed strip on `--color-slate-50` background, padding 32px 0.
- `.marquee` wrapper: `overflow:hidden`, mask
  `linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)` so
  edges fade.
- `.marquee-track` is `display:flex; gap:16px; width:max-content;
  animation: marq 30s linear infinite`. On hover →
  `animation-play-state: paused`.
- Render the quote array twice in the track so the loop is seamless.
- `@media (prefers-reduced-motion: reduce) { .marquee-track { animation: none; } }`.

```css
@keyframes marq { to { transform: translateX(-50%); } }
```

**Quote card**

- 320px fixed width, white bg, 16px radius, 1px slate-200 border, padding
  20px, `box-shadow: 0 1px 2px rgba(0,0,0,.03)`.
- Stars row — 5 amber `★`, font-size 14px.
- Body — Plus Jakarta 500, 14px, tracking -0.01em, line-height 1.55, slate-900.
- Author row — 32px gradient avatar (initials, indigo→cyan, white text),
  name (semibold 12px, slate-900) + role (12px, slate-500).

**Repo target**

- New content collection `src/content/testimonials/` with markdown frontmatter
  for `name`, `role`, `quote`, `rating`. Render via
  `src/components/sections/TestimonialMarquee.astro`.
- Production reference: `production-refs/TestimonialMarquee.astro`.

---

### #7 — Magnetic CTA button with shine

Replaces the standard CTA on `FinalCTA.astro`.

**Anatomy**

- Wrapper `.magnetic-wrap` is 40px padded — that padding is the "gravity well"
  the cursor enters before the button starts following.
- `.magnetic-btn` is a pill (radius 9999px), `#0f172a` bg, white text, 600
  weight, 16px, padding 18px 36px, transitions `transform .25s,
  box-shadow .25s` cubic-bezier(.4 0 .2 1).
- A `::before` overlay creates the shine: `linear-gradient(120deg, transparent
  30%, rgba(255,255,255,0.2), transparent 70%)`, `transform: translateX(-100%)`
  by default, on hover slides to `translateX(100%)` over 600ms.
- The arrow icon (16px, stroke-2 currentColor) translates `+4px` on hover.

**Magnetic JS**

```js
magWrap.addEventListener('pointermove', e => {
  const r = magWrap.getBoundingClientRect();
  const x = (e.clientX - r.left - r.width/2) * 0.3;
  const y = (e.clientY - r.top  - r.height/2) * 0.3;
  magBtn.style.transform = `translate(${x}px, ${y}px)`;
});
magWrap.addEventListener('pointerleave', () => {
  magBtn.style.transform = '';
});
```

The 0.3 multiplier is the magnetism strength — tune between 0.2 (subtle)
and 0.5 (very pull-y).

**Accessibility**

- The button must remain a real `<button>` or `<a>`.
- Don't disable keyboard focus styles. Add `:focus-visible { outline: 2px
  solid #fff; outline-offset: 4px; }`.
- Wrap the JS in
  `if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { ... }`.

**Repo target**

- New `src/components/ui/MagneticButton.astro`. Use it inside
  `FinalCTA.astro` and any other primary CTA.
- Production reference: `production-refs/MagneticButton.astro`.

---

## Design tokens (already in the repo)

These are already defined in `tailwind.config.mjs` and
`src/styles/global.css` — no need to add new tokens. Below for reference:

```
Primary blues
  primary-500   #3B82F6
  primary-600   #2563EB
  primary-700   #1d4ed8

Slates (text + surfaces)
  slate-50  #F8FAFC      slate-500 #64748B
  slate-100 #f1f5f9      slate-600 #475569
  slate-200 #E2E8F0      slate-700 #334155
  slate-300 #cbd5e1      slate-800 #1e293b
  slate-400 #94a3b8      slate-900 #0F172A

Service hues
  seo       #10B981 (emerald)
  ads       #F59E0B (amber)
  social    #8B5CF6 (violet)
  abm       #EC4899 (pink)
  emailing  #F43F5E (rose)
  training  #06B6D4 (cyan)
  ai        #6366F1 (indigo)
  tracking  #14B8A6 (teal)
  automotive #0EA5E9 (sky)

Gradients
  hero      linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)
  primary   linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)
  calc      linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)
  abm       linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)
  auto      linear-gradient(135deg, #334155 0%, #0f172a 100%)

Easing & duration
  ease-smooth  cubic-bezier(0.4, 0, 0.2, 1)
  ease-out     cubic-bezier(0.16, 1, 0.3, 1)
  dur-fast     200ms
  dur          250ms
  dur-slow     350ms

Shadows
  subtle  0 1px 2px 0 rgb(0 0 0 / 0.03)
  soft    0 2px 8px -2px rgb(0 0 0 / 0.05),
          0 4px 16px -4px rgb(0 0 0 / 0.1)
  medium  0 4px 12px -2px rgb(0 0 0 / 0.08),
          0 8px 24px -4px rgb(0 0 0 / 0.12)
  strong  0 8px 24px -4px rgb(0 0 0 / 0.12),
          0 16px 48px -8px rgb(0 0 0 / 0.15)

Type
  body     'Inter', system-ui, sans-serif
  display  'Plus Jakarta Sans', 'Inter', sans-serif
  mono     ui-monospace, SFMono-Regular, 'SF Mono', Menlo
```

## Accessibility checklist (apply to all 7)

- [ ] Every animation respects `prefers-reduced-motion: reduce`.
- [ ] All interactive elements are real `<button>` or `<a>` (no clickable divs).
- [ ] Focus styles never removed — only restyled.
- [ ] Marquee pauses on hover **and** on focus-within.
- [ ] Count-up announces the final number (don't fire it on
      `prefers-reduced-motion` — just render the target value statically).
- [ ] Magnetic and parallax effects use `pointer` events (not `mouse`)
      so they degrade cleanly on touch.
- [ ] Colour-on-colour contrast for the dark stats panel is at least 4.5:1
      for body, 3:1 for large.

## Performance checklist

- [ ] No new JS dependencies — everything is vanilla.
- [ ] All `<script>` blocks are inline-Astro (one per component, no module
      imports needed) to avoid extra network requests.
- [ ] `IntersectionObserver` is used for any "fire when visible" effect —
      don't run rAF loops globally.
- [ ] Sparkline SVGs are inline (no fetch).
- [ ] Marquee uses CSS animation only, no JS frame loop.
- [ ] Test LCP — the hero stats numbers must not block first paint
      (start at their final value and animate **down** then up; or render
      the target text and replace via JS post-mount).

## Files in this bundle

```
design_handoff_site_v2/
├── README.md                                  ← you are here
├── site_v2_improvements.html                  ← interactive design ref (open this in browser first)
├── reference/
│   └── colors_and_type.css                    ← CSS variables + type, copy-pastable into the repo
└── production-refs/                           ← ready-to-adapt Astro components
    ├── ServicesGridV2.astro
    ├── StatsRail.astro
    ├── CalculatorInlinePreview.astro
    ├── IndustryCard.astro
    ├── Header.astro
    ├── scroll.ts
    ├── TestimonialMarquee.astro
    └── MagneticButton.astro
```

## How to use this handoff with Claude Code

1. Drop this folder into the repo root (or anywhere — it's reference only).
2. In Claude Code, open the repo and run:

   > Read `design_handoff_site_v2/README.md` and
   > `design_handoff_site_v2/site_v2_improvements.html`. Implement
   > improvement #1 (Magnetic services grid) following the production
   > reference in `production-refs/ServicesGridV2.astro`. Match the
   > existing patterns in `src/components/sections/`.

3. Tackle the 7 improvements one at a time. Each is independent — pick
   the order by impact.

## Suggested implementation order

| Order | Improvement                  | Why                              |
| ----- | ---------------------------- | -------------------------------- |
| 1     | #5 Pill nav + scroll utils   | Foundation reused by every page  |
| 2     | #1 Magnetic services grid    | Highest-visibility upgrade       |
| 3     | #7 Magnetic CTA              | Tiny diff, big polish            |
| 4     | #2 Stats with count-up       | Adds credibility above the fold  |
| 5     | #4 Layered industry cards    | Richer storytelling              |
| 6     | #3 Inline calculator         | Net-new conversion surface       |
| 7     | #6 Testimonial marquee       | Needs content collection setup   |
