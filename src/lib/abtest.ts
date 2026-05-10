/**
 * abtest.ts - Helper léger A/B test localStorage-sticky.
 *
 * Usage côté composant (client-side script <script>) :
 *   import { getVariant } from '@/lib/abtest';
 *   const variant = getVariant('hero-cta-text');  // 'A' | 'B', stable per visitor
 *   document.querySelector('[data-variant=A]').hidden = variant !== 'A';
 *   document.querySelector('[data-variant=B]').hidden = variant !== 'B';
 *
 * Persistance : localStorage clé `abtest_<testId>` (sticky par device/browser).
 * Tracking GTM auto via event `ab_test_assignment`.
 *
 * Pas de SSR : à utiliser uniquement dans des scripts client (<script>) ou
 * components React mountés côté client.
 */

export type Variant = 'A' | 'B';

export function getVariant(testId: string): Variant {
  if (typeof window === 'undefined') return 'A';

  const key = `abtest_${testId}`;
  let assigned = window.localStorage.getItem(key);

  if (assigned !== 'A' && assigned !== 'B') {
    assigned = Math.random() < 0.5 ? 'A' : 'B';
    try {
      window.localStorage.setItem(key, assigned);
    } catch {
      // Storage may be full or disabled - we still return the random pick for this session
    }

    // Track assignment in GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'ab_test_assignment',
        ab_test_id: testId,
        ab_test_variant: assigned,
      });
    }
  }

  return assigned as Variant;
}

/**
 * Apply variant visibility on the page using `[data-variant="A"]` and `[data-variant="B"]` attrs.
 * Hides elements that don't match the assigned variant.
 */
export function applyVariant(testId: string, root: HTMLElement | Document = document): Variant {
  const variant = getVariant(testId);
  root.querySelectorAll<HTMLElement>(`[data-variant]`).forEach((el) => {
    const v = el.getAttribute('data-variant');
    if (v === 'A' || v === 'B') {
      el.hidden = v !== variant;
    }
  });
  return variant;
}

declare global {
  interface Window {
    dataLayer?: any[];
  }
}
