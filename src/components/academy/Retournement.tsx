import { useEffect, useRef } from 'react';
import { jour30Copy } from './copy';
import { nombreLocal } from './offres';
import { ease, onEnter, probeClock, reducedMotion, tween } from './motion';
import type { EtatJour, Locale } from './data';
import { JOURS_CALENDRIER, METAL_HEX, renardPoints } from './silhouette';
import { useLienApp } from './track';
import Renard from './Renard';

/**
 * Le retournement : le second et dernier moment d'audace de la page. Quand la
 * section entre dans l'écran, la carte de Clara se vide sous les yeux et
 * devient celle du visiteur. Les trente cases s'éteignent à rebours, le renard
 * revient à son premier état, le nom devient « Vous ».
 *
 * La carte est AUTONOME : elle porte l'état final de Clara et le ramène à
 * zéro. Elle fonctionne donc à toutes les largeurs, y compris quand le rail de
 * la section précédente est passé au-dessus du contenu.
 */
export default function Retournement({
  locale,
  fin,
  rang,
  trophees,
  leconsGratuites,
}: {
  locale: Locale;
  fin: EtatJour;
  /** Le libellé du rang final, depuis app-copy. */
  rang: string;
  trophees: number;
  /** Ce que l'inscription gratuite ouvre, pour le second bouton. */
  leconsGratuites: number;
}) {
  const t = jour30Copy(locale);
  const c = t.retournement;
  const nombre = (n: number) => nombreLocal(n, locale);
  // ⚠️ Le lien vers le module gratuit passe par `useLienApp` : sans lui,
  // quelqu'un qui arrive d'une annonce et ouvre l'accès gratuit change de
  // domaine en perdant son identifiant de clic, et l'achat qui suit une
  // semaine plus tard n'est plus attribuable à cette annonce.
  const gratuit = useLienApp(`https://academy.mydigipal.com${locale === 'fr' ? '/fr' : ''}/start`);
  const section = useRef<HTMLElement>(null);
  const pts = useRef<HTMLSpanElement>(null);
  const fox = useRef<SVGPolygonElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const who = useRef<HTMLParagraphElement>(null);
  const when = useRef<HTMLParagraphElement>(null);
  const cap = useRef<HTMLParagraphElement>(null);
  const cells = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let arrets: Array<() => void> = [];

    const vide = () => {
      if (who.current) who.current.textContent = c.vous;
      if (when.current) {
        when.current.textContent = c.jour0;
        when.current.style.color = 'var(--v-mute)';
      }
      if (pts.current) {
        pts.current.textContent = '0';
        pts.current.style.color = 'var(--v-mute)';
      }
      if (fox.current) {
        fox.current.setAttribute('points', renardPoints(0));
        fox.current.setAttribute('fill', '#3a4560');
      }
      if (ring.current) ring.current.style.borderColor = 'var(--v-filet-salle)';
      if (cap.current) cap.current.textContent = c.capVide;
      cells.current.forEach((s) => {
        if (s) {
          s.style.background = 'var(--v-salle-3)';
          s.style.opacity = '1';
        }
      });
    };

    probeClock((alive) => {
      if (!alive || reducedMotion()) {
        // Sans mouvement, la carte est déjà celle du visiteur : le texte dit
        // « le vôtre est vide », et c'est ce qu'on montre.
        vide();
        return;
      }
      arrets.push(
        onEnter(
          el,
          () => {
            const o = { v: fin.points, f: fin.renard };
            arrets.push(
              tween({
                from: 0,
                to: 1,
                ms: 1600,
                ease: ease.power2InOut,
                onUpdate: (p) => {
                  if (pts.current) pts.current.textContent = nombre(o.v * (1 - p));
                  if (fox.current) fox.current.setAttribute('points', renardPoints(o.f * (1 - p)));
                },
                onDone: () => {
                  vide();
                  const first = cells.current[0];
                  if (first) {
                    first.style.transition = 'none';
                    first.style.background = 'var(--color-or)';
                    setTimeout(() => {
                      first.style.transition = 'background 1100ms cubic-bezier(0.25,0.46,0.45,0.94)';
                      first.style.background = 'var(--v-salle-3)';
                    }, 350);
                  }
                },
              })
            );
            if (ring.current) {
              ring.current.style.transition = 'border-color 1200ms ease';
              ring.current.style.borderColor = 'var(--v-filet-salle)';
            }
            cells.current.forEach((s, i) => {
              if (!s) return;
              s.style.transition = `background 450ms ease ${(JOURS_CALENDRIER - i) * 22}ms, opacity 450ms ease ${(JOURS_CALENDRIER - i) * 22}ms`;
              s.style.background = 'var(--v-salle-3)';
              s.style.opacity = '1';
            });
          },
          '-40%'
        )
      );
    });
    return () => {
      arrets.forEach((a) => a());
      arrets = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={section} id="retournement" className="flex min-h-[80vh] scroll-mt-24 items-center border-t border-filet-nuit px-4 py-20 sm:px-6">
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-14 min-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>
          <p className="m-0 mb-3.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-renard">{c.kicker}</p>
          <h2 className="m-0 max-w-[18ch] text-balance text-[clamp(28px,4.6vw,50px)] font-medium leading-[1.1] tracking-[-0.025em] text-ivoire">
            {c.titre}
          </h2>
          <p className="mt-[22px] max-w-[46ch] text-[17px] leading-[1.65] text-corps-nuit">{c.texte}</p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a
              href="#pricing"
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-bouton bg-or px-[26px] py-3.5 text-[15.5px] font-semibold text-salle transition duration-150 hover:bg-or-vif"
            >
              {c.ouvrir}
            </a>
            <a
              href={gratuit}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-bouton border border-filet-nuit px-[26px] py-3.5 text-[15.5px] font-medium text-corps-nuit transition duration-150 hover:border-brume-nuit hover:text-ivoire"
            >
              {c.gratuit(leconsGratuites)}
            </a>
          </div>
        </div>

        <div className="rounded-carte border border-filet-nuit bg-salle-2 p-6">
          <div className="flex items-center gap-[13px]">
            <span
              ref={ring}
              className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full border-2 bg-salle"
              style={{ borderColor: fin.metal ? METAL_HEX[fin.metal] : 'var(--v-filet-salle)' }}
            >
              <Renard ref={fox} t={fin.renard} />
            </span>
            <div>
              <p ref={who} className="m-0 text-[14.5px] text-ivoire">
                {t.compte.rail.nom}
              </p>
              <p ref={when} className="m-0 mt-0.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.12em] text-or">
                {c.jour30(rang)}
              </p>
            </div>
          </div>
          <div className="mt-[18px] flex items-baseline gap-2">
            <span ref={pts} className="font-ac-mono text-[30px] font-bold tabular-nums text-ivoire">
              {nombre(fin.points)}
            </span>
            <span className="font-ac-mono text-[11px] uppercase tracking-[0.14em] text-brume-nuit">{c.points}</span>
          </div>
          <div className="mt-[18px] grid grid-cols-10 gap-[3px]">
            {Array.from({ length: JOURS_CALENDRIER }, (_, i) => (
              <span
                key={i}
                ref={(n) => {
                  cells.current[i] = n;
                }}
                className="block aspect-square rounded-[2.5px] bg-or"
                style={{ opacity: i % 4 === 0 ? 1 : i % 3 === 0 ? 0.75 : 0.5 }}
              />
            ))}
          </div>
          <p ref={cap} className="m-0 mt-3.5 font-ac-mono text-[11px] text-brume-nuit">
            {c.cap(fin.trophees, trophees)}
          </p>
        </div>
      </div>
    </section>
  );
}
