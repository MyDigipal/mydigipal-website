import type { EtatJour, Jour30Data, Locale, Metal } from '../academy/data';

/**
 * Le compte de l'apprenante au jour 30, à côté de son attestation.
 *
 * Demande de Paul du 07/09/2026 : « à droite, un petit récap de son profil,
 * avec les points et les trophées, montrer qu'elle a eu une session avec Paul,
 * qu'elle a fait des exercices ». L'attestation dit ce qu'elle a obtenu ; cette
 * carte dit ce qu'elle a FAIT, et c'est la moitié qui donne envie de jouer.
 *
 * ⚠️ Aucun nombre n'est écrit ici. Tout vient de l'app : les gestes de
 * `parcours` (sommés depuis le récit), l'état du dernier jour pour les points,
 * le rang, la série et le métal, et `jeu` pour les libellés. Un ajustement du
 * récit se voit donc ici sans qu'on y touche, et `npm run check:chiffres`
 * refuserait de toute façon un chiffre en dur.
 *
 * ⚠️ La session de quinze minutes n'est pas un argument commercial glissé dans
 * la page : c'est `callsEarned` appliqué à ses points réels, plafonné au quota
 * de son palier. Si la règle change dans le produit, la ligne change ici.
 */

/**
 * ⚠️ Pas de calendrier d'activité ici, alors que c'est l'élément signature du
 * profil dans l'espace apprenant. Essayé le 07/09 : le rail du récit, trois
 * cents pixels plus haut sur la même page, montre déjà cette grille de carrés
 * avec ses jokers. Deux fois le même motif à cette distance se lit comme une
 * redite, et le vide qu'il comblait sous la carte est le moindre mal.
 */

const TEINTE: Record<Metal, string> = {
  bronze: 'var(--color-bronze)',
  argent: 'var(--color-argent)',
  or: 'var(--color-or)',
  platine: 'var(--color-platine)',
};

function Etoile({ taille = 11 }: { taille?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={taille} height={taille} fill="currentColor" aria-hidden="true">
      <path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.3l6-.8z" />
    </svg>
  );
}

export default function Profil({
  locale,
  parcours,
  fin,
  jeu,
  copy,
  totalTrophees,
}: {
  locale: Locale;
  parcours: NonNullable<Jour30Data['parcours']>;
  fin: EtatJour;
  jeu: Jour30Data['jeu'];
  copy: {
    kicker: string;
    nom: string;
    points: string;
    serie: (n: number) => string;
    trophees: (obtenus: number, total: number) => string;
    faits: { depots: string; quiz: string; relectures: string; session: string };
    pied: string;
  };
  totalTrophees: number;
}) {
  const metal = fin.metal ?? 'or';
  const nb = (n: number) => n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB');
  // Les six premiers obtenus, dans l'ordre où elle les a gagnés : c'est le
  // début du parcours, donc ceux qu'un visiteur peut se projeter en train
  // d'obtenir. Le reste est compté, pas listé.
  const montres = parcours.trophees.slice(0, 6);

  const lignes: Array<{ valeur: number; libelle: string }> = [
    { valeur: parcours.depots, libelle: copy.faits.depots },
    { valeur: parcours.quiz, libelle: copy.faits.quiz },
    { valeur: parcours.relectures, libelle: copy.faits.relectures },
  ];
  if (parcours.sessions > 0) lignes.push({ valeur: parcours.sessions, libelle: copy.faits.session });

  return (
    <aside className="rounded-carte border border-filet-nuit bg-profond p-5 text-left">
      <p className="m-0 font-ac-mono text-[10px] font-bold uppercase tracking-[0.2em] text-or">
        {copy.kicker}
      </p>

      {/* Le médaillon : les initiales dans le cadre du meilleur métal, comme
          l'avatar de l'espace apprenant, dont le cadre suit le même métal. */}
      <div className="mt-4 flex items-center gap-3">
        <span
          className="grid h-12 w-12 flex-none place-items-center rounded-full border-2 font-ac-mono text-[15px] font-bold text-ivoire"
          style={{ borderColor: TEINTE[metal], background: 'rgba(255,255,255,.04)' }}
        >
          CM
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate text-[15px] font-medium leading-tight text-ivoire">{copy.nom}</p>
          <p className="m-0 mt-1 font-ac-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: TEINTE[metal] }}>
            {jeu.rangs[fin.rank]} · {jeu.metaux[metal]}
          </p>
        </div>
      </div>

      {/* Les points, en grand : c'est le chiffre qui se compare d'un compte à
          l'autre, et le seul que la barre du récit montre en permanence. */}
      <div className="mt-5 border-t border-filet-nuit pt-4">
        <p className="m-0 font-ac-grotesk text-[34px] font-medium leading-none tracking-[-0.02em] text-or">
          {nb(fin.points)}
        </p>
        <p className="m-0 mt-1.5 font-ac-mono text-[11px] uppercase tracking-[0.14em] text-brume-nuit">
          {copy.points} · {copy.serie(fin.serie)}
        </p>
      </div>

      <div className="mt-4 border-t border-filet-nuit pt-4">
        <p className="m-0 mb-2.5 font-ac-mono text-[11px] uppercase tracking-[0.14em] text-brume-nuit">
          {copy.trophees(parcours.trophees.length, totalTrophees)}
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {montres.map((t) => (
            <li
              key={t.key}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] leading-none text-corps-nuit"
              style={{ borderColor: 'var(--color-filet-nuit)' }}
            >
              <span style={{ color: t.metal ? TEINTE[t.metal] : 'var(--color-or)' }}>
                <Etoile />
              </span>
              {t.nom}
            </li>
          ))}
        </ul>
      </div>

      <ul className="m-0 mt-4 list-none border-t border-filet-nuit p-0 pt-2">
        {lignes.map((l) => (
          <li key={l.libelle} className="flex items-baseline gap-2.5 border-b border-filet-nuit py-2.5 last:border-b-0">
            <span className="font-ac-mono text-[15px] font-bold leading-none text-ivoire">{l.valeur}</span>
            <span className="text-[13.5px] leading-tight text-corps-nuit">{l.libelle}</span>
          </li>
        ))}
      </ul>

      <p className="m-0 mt-3.5 text-[12.5px] leading-[1.5] text-brume-nuit">{copy.pied}</p>
    </aside>
  );
}
