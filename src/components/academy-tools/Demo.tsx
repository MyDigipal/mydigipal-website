import { useEffect, useRef, useState } from 'react';
import { onEnter, reducedMotion, typeText } from '../academy/motion';
import type { CopyOutil } from './types';

/**
 * La même demande, écrite deux fois.
 *
 * À gauche ce que les gens tapent, à droite ce que la méthode produit, avec le
 * livrable qui en sort. C'est la seule démonstration de la page, et elle se
 * joue ENTIÈREMENT ICI : décision de Paul du 11/09/2026, aucun bouton n'ouvre
 * l'outil. « C'est une page de vente, donc on n'a pas envie de commencer à
 * faire des exercices directement. »
 *
 * La frappe est mesurée sur l'horloge (`typeText` passe par `tween`, donc par
 * requestAnimationFrame) et non sur un intervalle : un onglet qui perd le
 * focus ralentit les minuteurs, et la démonstration se jouait alors au ralenti
 * sans que rien ne le signale.
 *
 * ÉTAT DE REPOS = ÉTAT VISIBLE : sous `prefers-reduced-motion`, et si
 * l'observateur n'existe pas, le prompt et la réponse sont là d'emblée.
 */
export default function Demo({ copy }: { copy: CopyOutil['demo'] }) {
  const [ecrit, setEcrit] = useState('');
  const [fini, setFini] = useState(false);
  const bloc = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bloc.current;
    if (!el) return;
    if (reducedMotion()) {
      setEcrit(copy.apresPrompt);
      setFini(true);
      return;
    }
    let stopFrappe: (() => void) | undefined;
    let stopFin: number | undefined;
    const stopEntree = onEnter(el, () => {
      stopFrappe = typeText(copy.apresPrompt, 3200, setEcrit, () => {
        stopFin = window.setTimeout(() => setFini(true), 400);
      });
    });
    return () => {
      stopEntree();
      stopFrappe?.();
      if (stopFin) window.clearTimeout(stopFin);
    };
  }, [copy.apresPrompt]);

  return (
    <div ref={bloc} className="grid gap-[18px] lg:grid-cols-2">
      <article className="flex flex-col overflow-hidden rounded-carte border border-filet-nuit bg-[#0a0f1c]">
        <header className="border-b border-filet-nuit bg-[#111a2e] px-4 py-2.5 font-ac-mono text-[11px] uppercase tracking-[0.12em] text-brume-nuit">
          {copy.avantTete}
        </header>
        <div className="px-5 py-4.5 font-ac-mono text-[13.5px] leading-[1.7] lg:min-h-[420px]">
          <p className="mb-4 whitespace-pre-wrap text-terminal-texte">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-or-texte">
              {copy.vous}
            </span>
            {copy.avantPrompt}
          </p>
          <p className="m-0 whitespace-pre-wrap border-t border-dashed border-filet-nuit pt-3.5 text-brume-nuit">
            {copy.avantReponse}
          </p>
        </div>
      </article>

      <article className="flex flex-col overflow-hidden rounded-carte border border-filet-nuit bg-[#0a0f1c]">
        <header className="border-b border-filet-nuit bg-[#111a2e] px-4 py-2.5 font-ac-mono text-[11px] uppercase tracking-[0.12em] text-or-vif">
          {copy.apresTete}
        </header>
        <div className="px-5 py-4.5 font-ac-mono text-[13.5px] leading-[1.7] lg:min-h-[420px]">
          <p className="mb-4 whitespace-pre-wrap text-terminal-texte">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-or-texte">
              {copy.vous}
            </span>
            {ecrit}
            {!fini && <span className="prompt-card__caret" aria-hidden="true" />}
          </p>
          {fini && (
            <div>
              <p className="m-0 whitespace-pre-wrap border-t border-dashed border-filet-nuit pt-3.5 text-corps-nuit">
                {copy.apresReponse}
              </p>
              <div className="mt-3.5 rounded-[10px] border border-or/35 bg-or/[0.06] px-3.5 py-3">
                <p className="m-0 mb-1 font-ac-grotesk text-sm font-semibold text-ivoire">
                  {copy.artefactTitre}
                </p>
                <p className="m-0 font-ac-grotesk text-[13px] text-brume-nuit">{copy.artefactTexte}</p>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
