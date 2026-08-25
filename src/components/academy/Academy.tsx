import { useEffect, useState } from 'react';
import { ENDPOINT, type Jour30Data, type Locale } from './data';
import { captureAdClickIds } from './track';
import Ouverture from './Ouverture';
import Mention from './Mention';
import LeCompte from './LeCompte';
import Mcp from './Mcp';
import Diplome from './Diplome';
import Retournement from './Retournement';
import Maison from './Maison';
import Produit from './Produit';
import ConfigurateurNuit from './ConfigurateurNuit';
import Pied from './Pied';

/**
 * La page « AI Academy » : trente jours dans un compte, puis le vôtre.
 *
 * Îlot React unique, rendu au build avec les données lues dans l'app, puis
 * rafraîchi dans le navigateur avec le même JSON : un prix qui change dans
 * l'app (la hausse du 1er octobre, par exemple) est juste à l'écran sans
 * reconstruire le site. La page vit dans la SALLE DE NUIT du produit
 * (`data-theme="nuit"`), sous le menu du site : un visiteur qui passe de
 * cette page à l'application ne change pas de teinte.
 *
 * Concept, spécification et système visuel : mydigipal-academy,
 * `design/handoff-jour-30/` (paquet de passation de Claude Design du
 * 25/08/2026) et la section 17 de son CLAUDE.md.
 */
export default function Academy({ locale, initial }: { locale: Locale; initial: Jour30Data }) {
  const [data, setData] = useState(initial);

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
    <div data-theme="nuit" className="j30 overflow-x-clip bg-salle pt-18 text-corps-nuit">
      <Ouverture locale={locale} />
      <Mention locale={locale} />
      <LeCompte
        locale={locale}
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
      <Retournement locale={locale} fin={fin} rang={data.jeu.rangs[fin.rank]} trophees={data.faits.trophees} />
      <Maison locale={locale} temoignages={data.temoignages} />
      <Produit locale={locale} />
      <ConfigurateurNuit locale={locale} data={data} />
      <Pied locale={locale} urls={data.urls} />
    </div>
  );
}
