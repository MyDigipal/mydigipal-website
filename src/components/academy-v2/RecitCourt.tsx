import { useRef, useState, type ReactNode } from 'react';
import { allerA } from '../academy/ancre';

/**
 * Le récit de Clara en un écran (06/10/2026).
 *
 * ⚠️ CE QU'IL REMPLACE. Le ruban, les quinze jours de la frise et « Fin de la
 * démonstration » pesaient 2 830 px sur bureau et 4 469 px sur téléphone, plus
 * l'attestation et sa carte de profil (1 193 et 2 098 px). Paul, 06/10 : « le
 * récit de Clara, il est beaucoup trop long ». Direction A du labo
 * `page-vente-courte.html`.
 *
 * Ce qui reste à l'écran : trois moments, un par étape du programme, la carte
 * de son compte au jour 30 (`Profil`, celle qui était à côté de l'attestation),
 * et l'appel. La frise complète n'est pas supprimée : elle se monte au clic, et
 * `LeCompte` arme lui-même ses apparitions au montage.
 *
 * Tout le texte vient d'ailleurs : les phrases des moments sont celles de la
 * frise (`jour30Copy().compte.jNN.phrase`), l'appel celui de `Retournement`.
 */
export default function RecitCourt({
  kicker,
  titre,
  chapeau,
  moments,
  anime,
  profil,
  appel,
  ouvrir,
  gratuit,
  lienGratuit,
  voirTout,
  replier,
  frise,
}: {
  kicker: string;
  titre: string;
  chapeau: string;
  moments: Array<{ jour: string; etape: string; phrase: string }>;
  /**
   * L'animation « La carte raconte » (06/10/2026, direction B) : la leçon, la
   * consigne, le journal de l'agent. Quand elle est là, elle prend la place des
   * trois moments, qui disaient la même progression en texte.
   */
  anime?: ReactNode;
  /** La carte du compte de Clara au jour 30, déjà rendue. */
  profil: ReactNode;
  appel: string;
  ouvrir: string;
  gratuit: string;
  lienGratuit: string;
  voirTout: string;
  replier: string;
  /** La frise des trente jours, montée seulement quand on la demande. */
  frise: ReactNode;
}) {
  const [ouverte, setOuverte] = useState(false);
  const bouton = useRef<HTMLButtonElement>(null);

  return (
    <section id="recit" className="scroll-mt-20 border-t border-filet-nuit">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:py-20">
        <p className="m-0 mb-3 font-ac-mono text-[11px] font-bold uppercase tracking-[0.2em] text-or">{kicker}</p>
        <h2 className="m-0 text-ivoire">{titre}</h2>
        <p className="m-0 mt-3 max-w-[60ch] text-[16.5px] leading-[1.6] text-brume-nuit">{chapeau}</p>

        <div className="mt-9 grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
          {anime ?? (
          <ol className="m-0 grid list-none gap-3 p-0">
            {moments.map((m) => (
              <li
                key={m.jour}
                className="grid grid-cols-[64px_minmax(0,1fr)] gap-3.5 rounded-carte border border-filet-nuit bg-salle-2 px-[18px] py-4"
              >
                <span className="pt-[3px] font-ac-mono text-[11px] font-bold uppercase tracking-[0.1em] text-or">{m.jour}</span>
                <div>
                  <p className="m-0 mb-1 font-ac-mono text-[11px] uppercase tracking-[0.08em] text-brume-nuit">{m.etape}</p>
                  <p className="m-0 text-[16.5px] leading-[1.45] text-ivoire">{m.phrase}</p>
                </div>
              </li>
            ))}
          </ol>
          )}
          {profil}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-filet-nuit pt-7">
          <p className="m-0 min-w-[16rem] flex-1 text-[19px] font-medium leading-[1.35] text-ivoire">{appel}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="#tarifs"
              onClick={(e) => {
                e.preventDefault();
                allerA('tarifs');
              }}
              className="inline-flex min-h-11 items-center rounded-bouton bg-or px-6 text-[15px] font-semibold text-salle transition hover:bg-or-vif active:translate-y-px"
            >
              {ouvrir}
            </a>
            <a href={lienGratuit} className="text-[14.5px] text-ivoire underline decoration-filet-nuit underline-offset-4 hover:decoration-ivoire">
              {gratuit}
            </a>
          </div>
        </div>

        <button
          ref={bouton}
          type="button"
          aria-expanded={ouverte}
          onClick={() => {
            setOuverte((o) => !o);
            // En refermant, on revient au bouton : sinon la page remonte de
            // plusieurs écrans d'un coup et le visiteur ne sait plus où il est.
            if (ouverte) setTimeout(() => bouton.current?.scrollIntoView({ block: 'center' }), 0);
          }}
          className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[15px] font-medium text-ivoire"
        >
          {ouverte ? replier : voirTout}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`transition-transform duration-300 ${ouverte ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      {ouverte ? frise : null}
    </section>
  );
}
