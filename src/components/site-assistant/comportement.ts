// ============================================================
// Ce que le visiteur fait sur la page, et le bon moment pour lui poser une question
// ============================================================
//
// Paul, 03/11/2026 : l'assistant doit « apprendre du comportement qu'il a eu sur le
// site » et poser LUI-MÊME la première question, « qu'il ne l'interrompe vraiment
// pas, mais qu'il le questionne ». Maquette validée : `labo/chat-ia-proactif.html`
// du dépôt de l'Academy.
//
// ⚠️ VIE PRIVÉE : rien ne sort de la page tant que le visiteur ne demande rien. Le
// relevé vit dans la mémoire de l'onglet, disparaît avec lui, et ne part vers
// l'application qu'avec la demande de question d'ouverture ou un message écrit :
// des identifiants de section, des libellés de FAQ, des nombres, jamais un texte
// tapé ni une donnée personnelle. L'application refiltre tout (`lireComportement`).
//
// ⚠️ `setTimeout` et jamais `requestAnimationFrame` : un onglet en arrière-plan ne
// joue pas rAF, et le moment ne viendrait jamais.

/** Même forme que `Comportement` de l'application (`vente-ia-garde.ts`). */
export interface Comportement {
  secondes?: number;
  defilement?: number;
  sections?: string[];
  tarifs_vus?: boolean;
  video_vue?: boolean;
  faq_ouvertes?: string[];
  programme_regarde?: string;
  devise_changee?: boolean;
  tunnel_ouvert?: boolean;
  calcul_etape?: string;
  hesitations?: number;
}

export type Surface = 'academy' | 'site' | 'calcul';

const ID = /^[a-z0-9][a-z0-9_-]{0,39}$/;
/** Les sections qui montrent les prix : `offre` (les trois cartes de la page de vente) et `tarifs` (le détail). */
const PRIX = /^(offre|tarifs?|pricing|prix)$/;
const propre = (t: string, max = 80) => t.replace(/\s+/g, ' ').replace(/[<>{}[\]]/g, '').trim().slice(0, max);

export interface Suivi {
  lire(): Comportement;
  /** Le moment est-il venu de poser la question ? */
  pret(surface: Surface): boolean;
  arreter(): void;
}

export function suivreComportement(debut: number): Suivi {
  const sections = new Set<string>();
  const faq: string[] = [];
  let defilement = 0;
  let programme: string | undefined;
  let devise = false;
  let video = false;
  let hesitations = 0;
  /** Le dernier geste qui dit quelque chose (FAQ, programme, tarifs…), pour laisser le temps de lire. */
  let dernierGeste = 0;
  let gestes = 0;
  const tunnel = (() => {
    try {
      return /^https:\/\/academy\.mydigipal\.com\/checkout/.test(document.referrer);
    } catch {
      return false;
    }
  })();
  const geste = () => {
    dernierGeste = Date.now();
    gestes += 1;
  };

  // Les sections regardées : à l'écran pendant deux secondes et demie, soit à 40 % de leur hauteur,
  // soit sur la moitié de l'écran pour une section plus haute que lui (les tarifs de la page de vente
  // ne sont JAMAIS visibles à 40 % sur un téléphone : vu au test du 03/11/2026).
  const minuteurs = new Map<Element, number>();
  const io =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          (entrees) => {
            for (const e of entrees) {
              const id = (e.target.id || (e.target as HTMLElement).dataset.section || '').toLowerCase();
              if (!ID.test(id) || id.includes('hero')) continue;
              const visible = e.isIntersecting && e.intersectionRect.height >= Math.min(0.4 * e.boundingClientRect.height, 0.5 * window.innerHeight);
              if (visible) {
                if (minuteurs.has(e.target)) continue;
                minuteurs.set(
                  e.target,
                  window.setTimeout(() => {
                    if (!sections.has(id)) {
                      sections.add(id);
                      if (PRIX.test(id)) geste();
                    }
                  }, 2500)
                );
              } else {
                window.clearTimeout(minuteurs.get(e.target));
                minuteurs.delete(e.target);
              }
            }
          },
          { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1] }
        );
  // Les îlots de la page se montent après le script : les sections sont relues à chaque seconde.
  const observees = new WeakSet<Element>();
  const observer = () =>
    document.querySelectorAll('section[id], [data-section]').forEach((el) => {
      if (!observees.has(el)) {
        observees.add(el);
        io?.observe(el);
      }
    });
  observer();

  const surDefilement = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) defilement = Math.max(defilement, Math.min(100, Math.round((window.scrollY / h) * 100)));
  };

  // Les FAQ en `<details>` (pages de services) : l'événement `toggle` ne remonte pas, on l'écoute en capture.
  const surToggle = (e: Event) => {
    const d = e.target as HTMLDetailsElement;
    if (d.tagName !== 'DETAILS' || !d.open) return;
    const q = propre(d.querySelector('summary')?.textContent || '');
    if (q && !faq.includes(q) && faq.length < 6) {
      faq.push(q);
      geste();
    }
  };

  // Les clics qui disent quelque chose : une question de FAQ en bouton, une étape du programme,
  // une case du calculateur décochée. L'état se lit APRÈS le clic, quand le composant a réagi.
  const surClic = (e: MouseEvent) => {
    const cible = (e.target as Element | null)?.closest?.('button, [role="checkbox"]') as HTMLElement | null;
    if (!cible) return;
    window.setTimeout(() => {
      const controle = cible.getAttribute('aria-controls') || '';
      if (controle.startsWith('programme-') && cible.getAttribute('aria-expanded') === 'true') {
        // Les étapes du programme : « Mettre en œuvre » (agir) est le cœur des Automatisations.
        programme = controle === 'programme-agir' ? 'construire' : 'programme';
        geste();
        return;
      }
      if (cible.getAttribute('aria-expanded') === 'true' && cible.closest('[id*="faq"], .faq, [data-faq]')) {
        const q = propre(cible.textContent || '');
        if (q && !faq.includes(q) && faq.length < 6) {
          faq.push(q);
          geste();
        }
        return;
      }
      if (cible.getAttribute('role') === 'checkbox' && cible.getAttribute('aria-checked') === 'false') {
        hesitations += 1;
        geste();
      }
    }, 0);
  };
  const surDevise = () => {
    devise = true;
    geste();
  };
  // `play` ne remonte pas non plus. Les vidéos muettes en boucle de la page ne comptent pas.
  const surLecture = (e: Event) => {
    const v = e.target as HTMLVideoElement;
    if (v.tagName === 'VIDEO' && !v.muted) {
      video = true;
      geste();
    }
  };

  window.addEventListener('scroll', surDefilement, { passive: true });
  document.addEventListener('toggle', surToggle, true);
  document.addEventListener('click', surClic, true);
  document.addEventListener('play', surLecture, true);
  window.addEventListener('mdp-devise', surDevise);

  const lire = (): Comportement => {
    const etape = document.querySelector('main h2')?.textContent;
    const c: Comportement = {
      secondes: Math.round((Date.now() - debut) / 1000),
      defilement,
      sections: [...sections].slice(0, 15),
      tarifs_vus: [...sections].some((x) => PRIX.test(x)) || undefined,
      video_vue: video || undefined,
      faq_ouvertes: faq.length ? [...faq] : undefined,
      programme_regarde: programme,
      devise_changee: devise || undefined,
      tunnel_ouvert: tunnel || undefined,
      hesitations: hesitations || undefined,
      calcul_etape: hesitations && etape ? propre(etape) : undefined,
    };
    return Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length))) as Comportement;
  };

  /**
   * Le bon moment : jamais avant vingt secondes, jamais en haut de page, jamais pendant
   * qu'on tape ou qu'on regarde une vidéo avec le son ; puis quelques secondes après un geste
   * qui dit quelque chose (le temps de lire), ou au bout d'une minute pour celui qui lit
   * sans rien toucher.
   */
  const pret = (surface: Surface): boolean => {
    observer();
    const s = (Date.now() - debut) / 1000;
    if (s < 20) return false;
    const actif = document.activeElement;
    if (actif && /^(INPUT|TEXTAREA|SELECT)$/.test(actif.tagName)) return false;
    if ([...document.querySelectorAll('video')].some((v) => !v.paused && !v.muted)) return false;
    const calme = Date.now() - dernierGeste;
    if (surface === 'calcul') return (hesitations >= 2 && calme > 3000) || s >= 45;
    if (defilement < 15) return false;
    if (tunnel && s >= 25) return true;
    if (gestes > 0 && calme > (surface === 'academy' ? 6000 : 5000)) return true;
    if (surface === 'site' && sections.size >= 2 && s >= 30) return true;
    if (surface === 'academy' && sections.size >= 3 && s >= 35) return true;
    return s >= (surface === 'academy' ? 60 : 50);
  };

  return {
    lire,
    pret,
    arreter() {
      io?.disconnect();
      minuteurs.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('scroll', surDefilement);
      document.removeEventListener('toggle', surToggle, true);
      document.removeEventListener('click', surClic, true);
      document.removeEventListener('play', surLecture, true);
      window.removeEventListener('mdp-devise', surDevise);
    },
  };
}
