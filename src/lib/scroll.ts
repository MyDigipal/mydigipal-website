/**
 * scroll.ts - Global scroll & interaction utilities for the v2 design uplift.
 *
 * Single import surface for all the patterns introduced by the Claude Design handoff:
 *   - initRevealOnScroll()      fade/slide elements with [data-reveal] in
 *   - initCountUp()             count-up numbers with [data-target] under [data-counter-section]
 *   - initScrollProgress()      grow a top-of-page bar as the user scrolls
 *   - initMagneticPointer()     radial gradient that follows the pointer ([data-magnetic])
 *   - initMagneticButton()      translate the button toward the pointer ([data-magnetic-btn])
 *   - initSlidingNavMarker()    sliding pill marker under the active nav link ([data-nav-pill])
 *   - initAll()                 convenience: run them all (used by BaseLayout)
 *
 * All inits no-op (or render the static end-state) under prefers-reduced-motion.
 *
 * Wired in BaseLayout via `astro:page-load` so they re-run after View Transitions.
 */

const isBrowser = typeof window !== 'undefined';
const prefersReducedMotion = () =>
  isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================ */
/* Reveal on scroll - [data-reveal]                             */
/* ============================================================ */

const revealObservers = new WeakMap<Element, IntersectionObserver>();

export function initRevealOnScroll(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)');
  if (!els.length) return;

  if (prefersReducedMotion()) {
    els.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          io.unobserve(e.target);
          revealObservers.delete(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  els.forEach((el) => {
    io.observe(el);
    revealObservers.set(el, io);
  });
}

/* ============================================================ */
/* Count-up - [data-counter-section] containing [data-target]   */
/* ============================================================ */

const countedSections = new WeakSet<Element>();

export function initCountUp(): void {
  const sections = document.querySelectorAll<HTMLElement>('[data-counter-section]');
  if (!sections.length) return;

  const reduce = prefersReducedMotion();

  const runCount = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.target || '0');
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);

    if (reduce) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        if (countedSections.has(e.target)) return;
        countedSections.add(e.target);
        e.target
          .querySelectorAll<HTMLElement>('[data-target]')
          .forEach(runCount);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => {
    if (!countedSections.has(s)) io.observe(s);
  });
}

/* ============================================================ */
/* Scroll progress bar - [data-scroll-progress] inner <i>       */
/* ============================================================ */

let progressBound = false;

export function initScrollProgress(): void {
  const fill = document.querySelector<HTMLElement>('[data-scroll-progress] > i');
  if (!fill) return;

  if (prefersReducedMotion()) {
    fill.style.width = '100%';
    return;
  }

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    fill.style.width = p.toFixed(2) + '%';
  };

  if (!progressBound) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      },
      { passive: true }
    );
    progressBound = true;
  }

  update();
}

/* ============================================================ */
/* Magnetic pointer - [data-magnetic]                           */
/*                                                              */
/* Sets --mx and --my CSS custom properties on the element so   */
/* a CSS radial-gradient can follow the cursor.                 */
/* ============================================================ */

const magneticBound = new WeakSet<Element>();

export function initMagneticPointer(): void {
  if (prefersReducedMotion()) return;

  const cells = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  cells.forEach((cell) => {
    if (magneticBound.has(cell)) return;
    magneticBound.add(cell);
    cell.addEventListener('pointermove', (e) => {
      const r = cell.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      cell.style.setProperty('--mx', mx.toFixed(2) + '%');
      cell.style.setProperty('--my', my.toFixed(2) + '%');
    });
  });
}

/* ============================================================ */
/* Magnetic button - [data-magnetic-btn]                        */
/*                                                              */
/* Wraps a clickable element. The wrapper detects pointermove   */
/* and translates the inner button toward the cursor.           */
/* ============================================================ */

const magneticBtnBound = new WeakSet<Element>();

export function initMagneticButton(): void {
  if (prefersReducedMotion()) return;

  const wraps = document.querySelectorAll<HTMLElement>('[data-magnetic-btn]');
  wraps.forEach((wrap) => {
    if (magneticBtnBound.has(wrap)) return;
    magneticBtnBound.add(wrap);

    const target = wrap.querySelector<HTMLElement>(
      '[data-magnetic-target]'
    ) || wrap.firstElementChild as HTMLElement | null;
    if (!target) return;

    const strength = parseFloat(wrap.dataset.strength || '0.3');

    wrap.addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      target.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    });

    wrap.addEventListener('pointerleave', () => {
      target.style.transform = '';
    });
  });
}

/* ============================================================ */
/* Sliding nav marker - [data-nav-pill] with [data-nav-marker]  */
/*                                                              */
/* The marker is positioned absolutely under the active link.   */
/* The active link is the one whose href matches the current    */
/* path prefix (already calculated by the Astro component).     */
/* ============================================================ */

export function initSlidingNavMarker(): void {
  const pills = document.querySelectorAll<HTMLElement>('[data-nav-pill]');
  pills.forEach((pill) => {
    const marker = pill.querySelector<HTMLElement>('[data-nav-marker]');
    if (!marker) return;

    const links = Array.from(
      pill.querySelectorAll<HTMLElement>('[data-nav-link]')
    );
    if (!links.length) return;

    const moveTo = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const pr = pill.getBoundingClientRect();
      marker.style.left = (r.left - pr.left).toFixed(2) + 'px';
      marker.style.width = r.width.toFixed(2) + 'px';
      marker.style.opacity = '1';
    };

    const initial =
      links.find((l) => l.getAttribute('aria-current') === 'page') ||
      links.find((l) => l.dataset.navActive === 'true');
    if (initial) {
      requestAnimationFrame(() => moveTo(initial));
    } else {
      marker.style.opacity = '0';
    }

    links.forEach((link) => {
      link.addEventListener('mouseenter', () => moveTo(link));
      link.addEventListener('focus', () => moveTo(link));
    });

    pill.addEventListener('mouseleave', () => {
      const active =
        links.find((l) => l.getAttribute('aria-current') === 'page') ||
        links.find((l) => l.dataset.navActive === 'true');
      if (active) moveTo(active);
      else marker.style.opacity = '0';
    });
  });
}

/* ============================================================ */
/* Convenience: run them all                                    */
/* ============================================================ */

export function initAll(): void {
  if (!isBrowser) return;
  initRevealOnScroll();
  initCountUp();
  initScrollProgress();
  initMagneticPointer();
  initMagneticButton();
  initSlidingNavMarker();
}
