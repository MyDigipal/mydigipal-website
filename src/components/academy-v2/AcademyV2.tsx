import { useEffect, useState } from 'react';
import {
  AVIS_REPLI,
  ENDPOINT,
  SYMBOLE,
  prixDe,
  type Devise,
  leconsGratuit,
  leconsProgramme,
  temoignagesPublics,
  type Jour30Data,
  type Locale,
} from '../academy/data';
import { formatPrice } from '../academy/offres';
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
import Mcp from '../academy/Mcp';
import Diplome from '../academy/Diplome';
import Retournement from '../academy/Retournement';
import Maison from '../academy/Maison';
import AppelFlottant from '../academy/AppelFlottant';
import { copyV2 } from './copy-v2';
import { ETAPES, MODULES, modulesDe } from './modules';
import Profil from './Profil';
import Questionnaire from './Questionnaire';
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
  // La devise du visiteur. L'euro par défaut : c'est la monnaie du prix
  // annoncé partout ailleurs, et un prix qui change entre la page et la caisse
  // est ce qui se remarque le plus mal.
  const [devise, setDevise] = useState<Devise>('EUR');
  const c = copyV2(locale);
  const gratuit = useLienApp(
    `https://academy.mydigipal.com${locale === 'fr' ? '/fr' : ''}/start`,
  );

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
  // Les domaines de l'attestation : une colonne par étape, et les modules
  // nommés. Les quatre modules outils comptent pour une seule ligne, puisque
  // l'apprenant n'en suit qu'un.
  const domaines = ETAPES.map((e) => ({
    titre: e.titre[locale],
    modules: modulesDe(e.id)
      .filter((m) => !m.auChoix || m.id === 'M4C')
      .map((m) => (m.auChoix ? (locale === 'fr' ? 'Le parcours de votre outil' : 'Your tool’s path') : m.titre[locale])),
  }));

  return (
    <div data-theme="nuit" className="j30 overflow-x-clip bg-salle text-corps-nuit">
      <Barre
        locale={locale}
        chemin="academy"
        ancreCta="tarifs"
        devise={devise}
        surDevise={setDevise}
        reperes={[
          { id: 'programme', libelle: c.barre.programme },
          { id: 'visite', libelle: c.barre.academie },
          { id: 'compte', libelle: c.barre.trajet },
          { id: 'tarifs', libelle: c.barre.tarifs },
        ]}
      />

      {/* ⚠️ Le bouton du hero pointait sur #pricing, ancre absente de cette
          page : il ne menait nulle part. Même défaut que le retournement et
          l'appel flottant (relevé le 07/09). */}
      <Hero
        locale={locale}
        data={data}
        ancreTarifs="tarifs"
        cta2={c.tarifs.gratuitCourt(leconsGratuit(data))}
        prixAffiche={`${formatPrice(prixDe(programme ?? { ttc_minor: 0 }, devise), locale)} ${SYMBOLE[devise]}`}
      />

      {/* La section qui manquait, et la raison d'être de cette page. */}
      <Programme
        locale={locale}
        modules={data.faits.modules}
        heures={data.faits.heures}
        leconsGratuit={leconsGratuit(data)}
        minutesGratuit={data.faits.minutesGratuit ?? 0}
      />

      {/* Le questionnaire de profil, juste après le programme : il montre les
          vingt modules en les triant, donc il faut les avoir vus une fois pour
          que le tri veuille dire quelque chose. Et il mène au tunnel, ce qui
          n'a de sens qu'une fois la formation décrite. */}
      <Questionnaire locale={locale} lienBase={`https://academy.mydigipal.com${locale === 'fr' ? '/fr' : ''}`} />

      {/* L'espace apprenant, qu'on visite au survol. C'est la cible de l'entrée
          « L'Académie » du menu : ce qu'on ouvre après avoir acheté.

          ⚠️ La section des quatre parcours outils (`Outils`) était ici et a été
          retirée le 07/09 (Paul : « on n'a pas besoin d'une section entière
          pour parler des différents outils »). Le composant reste dans
          `academy/` : la première page de vente s'en sert toujours, et les
          quatre parcours sont de toute façon nommés dans Le programme. */}
      <Visite locale={locale} data={data} titre={c.preuves.visiteTitre} />

      {/* Le câblage MCP animé, tel quel. */}
      <Mcp locale={locale} titre={c.mcp.titre} texte={c.mcp.texte} />

      {/* Le ruban sans sa grande photo : elle descend à la frontière de la
          quinzaine 2, pour qu'il y ait une image par quinzaine. */}
      <Mention locale={locale} sansPhoto titre={c.trajet.ruban} />

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
        photoQuinzaine2="/academy/visuels/apprenante-cartes_paysage.jpg"
        titreQuinzaine2={c.trajet.quinzaine2}
      />

      {/* L'attestation à gauche, le compte de Clara à droite (Paul, 07/09).
          La carte n'apparaît que si l'app a servi `parcours` : sur un
          instantané de secours antérieur, l'attestation reprend sa forme
          d'origine plutôt que de montrer une colonne vide. */}
      <Diplome
        locale={locale}
        lessons={data.faits.lessons}
        modules={data.faits.modules}
        exercices={data.faits.exercices}
        relus={data.faits.relectures}
        heures={data.faits.heures}
        mention={data.jeu.mention}
        domaines={domaines}
        domainesTitre={c.preuves.domainesTitre}
        aside={
          data.parcours && fin ? (
            <Profil
              locale={locale}
              parcours={data.parcours}
              fin={fin}
              jeu={data.jeu}
              copy={c.preuves.profil}
              totalTrophees={data.faits.trophees}
            />
          ) : undefined
        }
      />

      <Retournement
        locale={locale}
        fin={fin}
        rang={data.jeu.rangs[fin.rank]}
        trophees={data.faits.trophees}
        leconsGratuites={leconsGratuit(data)}
        ancreTarifs="tarifs"
        libelleGratuit={c.tarifs.gratuitCourt(leconsGratuit(data))}
      />

      {/* Qui enseigne : les logos clients et les verbatims. */}
      <Maison locale={locale} temoignages={temoignagesPublics(data.temoignages)} avis={avis} />

      <Tarifs
        locale={locale}
        devise={devise}
        prixProgrammeMinor={programme ? prixDe(programme, devise) : 0}
        prixAvanceMinor={
          (programme ? prixDe(programme, devise) : 0) + (construire ? prixDe(construire, devise) : 0)
        }
        hausseMinor={data.hausse ? prixDe(data.hausse, devise) : 0}
        paliersEquipe={data.equipe?.paliers ?? []}
        leconsProgramme={leconsProgramme(data)}
        heuresProgramme={data.faits.heuresProgramme ?? data.faits.heures}
        leconsTotal={data.faits.lessons}
        heuresTotal={data.faits.heures}
        exercices={data.faits.exercices}
        relectures={data.faits.relectures}
        leconsGratuit={leconsGratuit(data)}
        modulesAuto={nbAuto}
        lienGratuit={gratuit}
      />

      <AppelFlottant
        locale={locale}
        leconsGratuites={leconsGratuit(data)}
        ancreTarifs="tarifs"
        libelleGratuit={c.tarifs.gratuitCourt(leconsGratuit(data))}
      />
    </div>
  );
}
