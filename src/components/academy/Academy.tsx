import { useEffect, useState } from 'react';
import { ENDPOINT, AVIS_REPLI, leconsGratuit, type Jour30Data, type Locale, temoignagesPublics } from './data';
import { captureAdClickIds } from './track';
import Barre from './Barre';
import Hero from './Hero';
import Visite from './Visite';
import Mention from './Mention';
import LeCompte from './LeCompte';
import Outils from './Outils';
import Mcp from './Mcp';
import Diplome from './Diplome';
import Retournement from './Retournement';
import Maison from './Maison';
import Produit from './Produit';
import ConfigurateurNuit from './ConfigurateurNuit';
import AppelFlottant from './AppelFlottant';

/**
 * La page « AI Academy » : trente jours dans un compte, puis le vôtre.
 *
 * Îlot React unique, rendu au build avec les données lues dans l'app, puis
 * rafraîchi dans le navigateur avec le même JSON : un prix qui change dans
 * l'app (la hausse du 1er octobre, par exemple) est juste à l'écran sans
 * reconstruire le site. La page vit dans la SALLE DE NUIT du produit
 * (`data-theme="nuit"`), sous le menu du site : un visiteur qui passe de
 * cette page à l'application ne change pas de teinte. Pas de pied de page
 * propre : celui du site suit, et un second en doublon faisait sale (Paul,
 * 25/08). Les liens vers l'app (conditions, espace apprenant) vivent sous le
 * configurateur, là où on en a besoin avant de payer.
 *
 * Concept, spécification et système visuel : mydigipal-academy,
 * `design/handoff-jour-30/` (paquet de passation de Claude Design du
 * 25/08/2026) et la section 17 de son CLAUDE.md.
 */
export default function Academy({ locale, initial }: { locale: Locale; initial: Jour30Data }) {
  const [data, setData] = useState(initial);
  // La preuve chiffrée vient de l'app ; le repli ne sert qu'à un instantané
  // ancien ou à une app injoignable.
  const preuve = data.avis ?? AVIS_REPLI;

  useEffect(() => {
    captureAdClickIds();
    const ctrl = new AbortController();
    fetch(`${ENDPOINT}?lang=${locale}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Jour30Data | null) => {
        if (d && d.lang === locale && Array.isArray(d.etats) && d.etats.length) setData(d);
      })
      .catch(() => {
        /* l'instantané du build reste affiché */
      });
    return () => ctrl.abort();
  }, [locale]);

  const fin = data.etats[data.etats.length - 1];

  return (
    <div data-theme="nuit" className="j30 overflow-x-clip bg-salle text-corps-nuit">
      <Barre locale={locale} />
      <Hero locale={locale} data={data} />
      <Visite locale={locale} data={data} />
      <Mention locale={locale} />
      <LeCompte
        locale={locale}
        avis={preuve}
        etats={data.etats}
        faits={{
          lessons: data.faits.lessons,
          prompts: data.faits.prompts,
          trophees: data.faits.trophees,
          secrets: data.faits.secrets,
          relectures: data.faits.relectures,
        }}
        jeu={data.jeu}
      />
      <Outils locale={locale} />
      <Mcp locale={locale} />
      <Diplome
        locale={locale}
        lessons={data.faits.lessons}
        modules={data.faits.modules}
        exercices={data.faits.exercices}
        relus={data.faits.relectures}
        heures={data.faits.heures}
        mention={data.jeu.mention}
      />
      <Retournement locale={locale} fin={fin} rang={data.jeu.rangs[fin.rank]} trophees={data.faits.trophees} leconsGratuites={leconsGratuit(data)} />
      <Maison locale={locale} temoignages={temoignagesPublics(data.temoignages)} avis={preuve} />
      <Produit locale={locale} />
      <ConfigurateurNuit locale={locale} data={data} />
      <AppelFlottant locale={locale} leconsGratuites={leconsGratuit(data)} />
    </div>
  );
}
