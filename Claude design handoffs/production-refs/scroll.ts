/**
 * scroll.ts — global scroll utilities for the site v2 uplift.
 *
 * Drop in `src/lib/scroll.ts`. Two exports:
 *   - initScrollProgress(el): grow a bar as the page scrolls
 *   - initRevealOnScroll():    fade/slide elements with [data-reveal] in
 *
 * Both no-op under prefers-reduced-motion.
 */

const reduce = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initScrollProgress(fillEl: HTMLElement) {
  if (!fillEl || reduce) {
    if (fillEl) fillEl.style.width = '100%';
    return;
  }
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    fillEl.style.width = p.toFixed(2) + '%';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(update);
    ticking = true;
  }, { passive: true });
  update();
}

export function initRevealOnScroll() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!els.length) return;
  if (reduce) {
    els.forEach(el => el.classList.add('is-revealed'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  els.forEach(el => io.observe(el));
}

/* Add this to global.css (once):
[data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity .6s cubic-bezier(.4,0,.2,1), transform .6s cubic-bezier(.4,0,.2,1);
}
[data-reveal].is-revealed { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}
*/
