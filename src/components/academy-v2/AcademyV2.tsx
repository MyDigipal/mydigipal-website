import { useEffect, useState } from 'react';
import {
  AVIS_REPLI,
  ENDPOINT,
  leconsGratuit,
  leconsProgramme,
  temoignagesPublics,
  type Jour30Data,
  type Locale,
} from '../academy/data';
import { captureAdClickIds, useLienApp } from '../academy/track';
// ⚠️ Les sections viennent de la page EXISTANTE, elles ne sont pas réécrites.
// Le câblage MCP animé, le récit avec ses cartes et son rail, les logos
// clients, le sélecteur de langue et le vrai logo vivent là-dedans, et une
// version « simplifiée » écrite à côté les perd tous (erreur du 06/09/2026).
// Cette page ne fait que CHANGER L'ORDRE et ajouter deux sections.
import Barre from '../academy/Barre';
import Hero from '../academy/Hero';
import Visite from '../academy/Visite';
import Mention from '../academy/Mention';
import LeCompte from '../academy/LeCompte';
import Outils from '../academy/Outils';
import Mcp from '../academy/Mcp';
import Diplome from '../academy/Diplome';
import Retournement from '../academy/Retournement';
import Maison from '../academy/Maison';
import AppelFlottant from '../academy/AppelFlottant';
import { copyV2 } from './copy-v2';
import { MODULES } from './modules';
import Programme from './Programme';
import Tarifs from './Tarifs';

/**
 * La page de vente, seconde formule.
 *
 * ⚠️ Elle NE REMPLACE PAS `/{lang}/academy`, qui reste en ligne et reçoit les
 * campagnes. Paul, 06/09/2026 : « tu ne remplaces pas la page existante, tu
 * builds une nouvelle page qui soit à l'effigie de cette nouvelle formule ».
 *
 * ⚠️ Et surtout : « tu reprends la page existante, tu fais des améliorations
 * dans la STRUCTURE ». Une première tentative avait réécrit chaque section en
 * version simplifiée. Elle a perdu le câblage MCP animé, les cartes du récit,
 * le rail de progression, les logos clients, le sélecteur de langue et le logo
 * lui-même. Ne pas recommencer : ici on importe les sections existantes et on
 * change leur ORDRE.
 *
 * Ce qui est réellement neuf, et pourquoi : la page mesurée le 06/09 faisait
 * 21 235 px, dont 37 % pour le récit et 3,8 % pour décrire la formation. Google
 * dit la même chose de son côté (`post_click_quality_score` BELOW_AVERAGE sur
 * les vingt mots-clés notés). Donc deux ajouts, et deux seulement :
 *   1. une section « Le programme », qui décrit les vingt-trois modules des deux
 *      parcours, avec « Mettre en œuvre » qui porte enfin les agents, les
 *      serveurs MCP et les chaînes ;
 *   2. une grille de tarifs à deux formules et un nombre de licences, sans la
 *      session ni l'audit flash.
 */
export default function AcademyV2({ locale, initial }: { locale: Locale; initial: Jour30Data }) {
  const [data, setData] = useState(initial);
  const c = copyV2(locale);
  const app = useLienApp('https://academy.mydigipal.com/checkout');

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

  const avis = data.avis ?? AVIS_REPLI;
  const fin = data.etats[data.etats.length - 1];
  const programme = data.offres.find((o) => o.id === 'programme');
  const construire = data.offres.find((o) => o.id === 'construire');
  const nbAuto = MODULES.filter((m) => m.palier === 'pro').length;

  return (
    <div data-theme="nuit" className="j30 overflow-x-clip bg-salle text-corps-nuit">
      <Barre
        locale={locale}
        chemin="academy-v2"
        ancreCta="tarifs"
        reperes={[
          { id: 'programme', libelle: c.barre.programme },
          { id: 'visite', libelle: c.barre.pratique },
          { id: 'compte', libelle: c.barre.trajet },
          { id: 'tarifs', libelle: c.barre.tarifs },
        ]}
      />

      <Hero locale={locale} data={data} />

      {/* La section qui manquait, et la raison d'être de cette page. */}
      <Programme
        locale={locale}
        modules={data.faits.modules}
        heures={data.faits.heures}
        leconsGratuit={leconsGratuit(data)}
        minutesGratuit={data.faits.minutesGratuit ?? 0}
      />

      {/* La pratique : le tableau de bord qu'on visite au survol. Il existait
          déjà, et il vaut mieux que les trois cartes que j'avais écrites. */}
      <Visite locale={locale} data={data} />

      <Outils locale={locale} />

      {/* Le câblage MCP animé, tel quel. */}
      <Mcp locale={locale} />

      <Mention locale={locale} />

      <LeCompte
        locale={locale}
        avis={avis}
        etats={data.etats}
        faits={{
          lessons: data.faits.lessons,
          prompts: data.faits.prompts,
          trophees: data.faits.trophees,
          secrets: data.faits.secrets,
          relectures: data.faits.relectures,
        }}
        jeu={data.jeu}
        frise
      />

      <Diplome
        locale={locale}
        lessons={data.faits.lessons}
        modules={data.faits.modules}
        exercices={data.faits.exercices}
        relus={data.faits.relectures}
        heures={data.faits.heures}
        mention={data.jeu.mention}
      />

      <Retournement
        locale={locale}
        fin={fin}
        rang={data.jeu.rangs[fin.rank]}
        trophees={data.faits.trophees}
        leconsGratuites={leconsGratuit(data)}
      />

      {/* Qui enseigne : les logos clients et les verbatims. */}
      <Maison locale={locale} temoignages={temoignagesPublics(data.temoignages)} avis={avis} />

      <Tarifs
        locale={locale}
        prixProgrammeMinor={programme?.ttc_minor ?? 0}
        prixAvanceMinor={(programme?.ttc_minor ?? 0) + (construire?.ttc_minor ?? 0)}
        hausseMinor={data.hausse?.ttc_minor ?? 0}
        paliersEquipe={data.equipe?.paliers ?? []}
        devisAPartirDe={data.equipe?.devisAPartirDe ?? 25}
        leconsProgramme={leconsProgramme(data)}
        heuresProgramme={data.faits.heuresProgramme ?? data.faits.heures}
        leconsTotal={data.faits.lessons}
        heuresTotal={data.faits.heures}
        exercices={data.faits.exercices}
        relectures={data.faits.relectures}
        leconsGratuit={leconsGratuit(data)}
        modulesAuto={nbAuto}
        lienApp={app}
      />

      <AppelFlottant locale={locale} leconsGratuites={leconsGratuit(data)} />
    </div>
  );
}
