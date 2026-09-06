import { useEffect, useState } from 'react';
import {
  AVIS_REPLI,
  ENDPOINT,
  leconsGratuit,
  leconsProgramme,
  noteLocale,
  temoignagesPublics,
  type Jour30Data,
  type Locale,
} from '../academy/data';
import { formatPrice } from '../academy/offres';
import { captureAdClickIds, useLienApp } from '../academy/track';
import { copyV2 } from './copy-v2';
import { MODULES } from './modules';
import { momentsDe } from './moments';
import Programme from './Programme';
import Pratique from './Pratique';
import Trajet from './Trajet';
import Tarifs from './Tarifs';
import { Boucle } from './Video';

/**
 * La page de vente, seconde formule.
 *
 * ⚠️ Elle NE REMPLACE PAS `/{lang}/academy`, qui continue de tourner et de
 * recevoir les campagnes. Paul, 06/09/2026 : « tu ne remplaces pas la page
 * existante, tu builds une nouvelle page qui soit à l'effigie de cette nouvelle
 * formule ». La bascule se décidera après comparaison.
 *
 * Ce qui change, et pourquoi : la page mesurée le 06/09 faisait 21 235 px, dont
 * 37 % pour le récit des trente jours et 3,8 % pour décrire la formation. Google
 * fait le même constat de son côté, avec un `post_click_quality_score`
 * BELOW_AVERAGE sur les vingt mots-clés notés. Ici le programme passe devant, le
 * récit devient une démonstration facultative en trois phases, et chaque promesse
 * de la grille de prix montre l'écran qui va avec.
 *
 * Comme la page existante, tout ce qui est chiffré vient du JSON de l'app, lu au
 * build puis rafraîchi dans le navigateur.
 */

const PRISES = [
  { fr: 'Gmail', en: 'Gmail', faitFr: 'lit vos messages, prépare les réponses', faitEn: 'reads your mail, drafts the replies', droitFr: 'lecture + brouillon', droitEn: 'read + draft' },
  { fr: 'Agenda', en: 'Calendar', faitFr: 'lit vos disponibilités, pose les rendez-vous', faitEn: 'reads your availability, books the meetings', droitFr: 'lecture + écriture', droitEn: 'read + write' },
  { fr: 'Tableur', en: 'Spreadsheet', faitFr: 'lit vos feuilles, écrit les colonnes calculées', faitEn: 'reads your sheets, writes the computed columns', droitFr: 'lecture + écriture', droitEn: 'read + write' },
  { fr: 'CRM', en: 'CRM', faitFr: 'lit les fiches, met à jour les étapes', faitEn: 'reads the records, updates the stages', droitFr: 'lecture + écriture', droitEn: 'read + write' },
  { fr: 'Publicité', en: 'Advertising', faitFr: 'lit les dépenses et les résultats', faitEn: 'reads spend and results', droitFr: 'lecture seule', droitEn: 'read only' },
  { fr: 'Documents', en: 'Documents', faitFr: 'lit vos documents, en crée de nouveaux', faitEn: 'reads your documents, creates new ones', droitFr: 'lecture + création', droitEn: 'read + create' },
  { fr: 'Slack ou Teams', en: 'Slack or Teams', faitFr: 'lit les fils, poste les récapitulatifs', faitEn: 'reads the threads, posts the recaps', droitFr: 'lecture + publication', droitEn: 'read + post' },
  { fr: 'Analytics', en: 'Analytics', faitFr: 'lit le trafic et les conversions', faitEn: 'reads traffic and conversions', droitFr: 'lecture seule', droitEn: 'read only' },
  { fr: 'Visio', en: 'Video calls', faitFr: 'lit les transcriptions de réunion', faitEn: 'reads meeting transcripts', droitFr: 'lecture seule', droitEn: 'read only' },
  { fr: 'Comptabilité', en: 'Accounting', faitFr: 'lit les factures, prépare les relances', faitEn: 'reads invoices, drafts the reminders', droitFr: 'lecture + brouillon', droitEn: 'read + draft' },
  { fr: 'Fichiers', en: 'Files', faitFr: 'range, renomme, retrouve', faitEn: 'files, renames, finds', droitFr: 'lecture + écriture', droitEn: 'read + write' },
  { fr: 'Entrepôt', en: 'Data warehouse', faitFr: 'interroge vos données', faitEn: 'queries your data', droitFr: 'lecture seule', droitEn: 'read only' },
  { fr: 'Support', en: 'Support', faitFr: 'lit les tickets, propose les réponses', faitEn: 'reads tickets, suggests the answers', droitFr: 'lecture + brouillon', droitEn: 'read + draft' },
  { fr: 'Site web', en: 'Website', faitFr: 'publie les pages validées', faitEn: 'publishes approved pages', droitFr: 'publication', droitEn: 'publish only' },
];

function Barre({ locale, faits }: { locale: Locale; faits: { lecons: number; modules: number; heures: string; exercices: number; prix: string } }) {
  const c = copyV2(locale).barre;
  const [ex, setEx] = useState<string | null>(null);
  const app = useLienApp('https://academy.mydigipal.com/checkout');

  const entrees = [
    { href: '#programme', texte: c.programme, ex: c.exProgramme(faits.lecons, faits.modules, faits.heures) },
    { href: '#pratique', texte: c.pratique, ex: c.exPratique(faits.exercices) },
    { href: '#trajet', texte: c.trajet, ex: c.exTrajet },
    { href: '#tarifs', texte: c.tarifs, ex: c.exTarifs(faits.prix) },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-filet-nuit bg-[rgba(13,20,36,.92)] backdrop-blur-[10px]"
      onMouseLeave={() => setEx(null)}
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-4 py-3.5 sm:px-6">
        <span className="text-[16px] font-bold text-ivoire">
          mydigipal.{' '}
          <em className="font-ac-mono text-[10.5px] font-medium not-italic tracking-[.14em] text-brume-nuit">
            AI ACADEMY
          </em>
        </span>
        <nav className="flex flex-wrap gap-1.5">
          {entrees.map((e) => (
            <a
              key={e.href}
              href={e.href}
              onMouseEnter={() => setEx(e.ex)}
              onFocus={() => setEx(e.ex)}
              className="rounded-full border border-filet-nuit px-3.5 py-2 font-ac-mono text-[11px] uppercase tracking-[.11em] text-corps-nuit transition duration-150 hover:border-or hover:bg-or hover:text-salle focus-visible:border-or focus-visible:bg-or focus-visible:text-salle focus-visible:outline-none"
            >
              {e.texte}
            </a>
          ))}
        </nav>
        <a
          href={app}
          className="ml-auto whitespace-nowrap rounded-bouton bg-or px-5 py-2.5 text-[14px] font-semibold text-salle transition hover:bg-or-vif"
        >
          {c.cta}
        </a>
      </div>
      <div
        className="overflow-hidden bg-salle-3 transition-[height] duration-200"
        style={{ height: ex ? 50 : 0, borderTop: ex ? '1px solid var(--color-filet-nuit)' : '1px solid transparent' }}
      >
        <div className="mx-auto max-w-[1180px] px-4 py-3.5 text-[14px] text-corps-nuit sm:px-6">
          {ex}
        </div>
      </div>
    </header>
  );
}

function Mcp({ locale }: { locale: Locale }) {
  const c = copyV2(locale).mcp;
  const fr = locale === 'fr';
  const [actif, setActif] = useState<(typeof PRISES)[number] | null>(null);

  return (
    <section className="border-t border-lin bg-craie px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or-grave">
          {c.kicker}
        </div>
        <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-encre">
          {c.titre}
        </h2>
        <p className="mt-4 max-w-[66ch] text-[16px] leading-[1.65] text-brume">{c.chapeau}</p>

        <div className="mt-10 text-center">
          <div className="flex flex-wrap justify-center gap-2.5">
            {['Claude', 'ChatGPT', 'Gemini'].map((n) => (
              <span key={n} className="rounded-[11px] border border-lin bg-papier px-5 py-2.5 text-[14.5px] font-semibold text-encre">
                {n}
              </span>
            ))}
          </div>
          <p className="my-4 font-ac-mono text-[12.5px] text-brume">{c.liaison}</p>

          <div className="mx-auto mb-5 max-w-[460px] rounded-carte border border-renard bg-papier p-5">
            <span className="mb-2.5 block font-ac-mono text-[10px] uppercase tracking-[.14em] text-renard">
              {c.serveur}
            </span>
            <b className="block min-h-[1.3em] text-[17px] font-semibold leading-[1.3] text-encre">
              {actif ? `${fr ? actif.fr : actif.en} : ${fr ? actif.faitFr : actif.faitEn}` : c.attente}
            </b>
            <span className="mt-2 block font-ac-mono text-[12.5px] text-brume">
              {actif ? `${fr ? actif.droitFr : actif.droitEn} — ${c.rienDautre}` : c.attenteDroit}
            </span>
          </div>

          <div className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-2">
            {PRISES.map((p) => (
              <button
                key={p.en}
                type="button"
                onMouseEnter={() => setActif(p)}
                onFocus={() => setActif(p)}
                onClick={() => setActif(p)}
                className={`min-h-11 cursor-pointer rounded-[10px] border bg-papier px-4 text-[14px] text-encre transition duration-150 ${
                  actif === p ? 'border-renard bg-[rgba(217,116,63,.07)]' : 'border-lin hover:border-renard'
                }`}
              >
                {fr ? p.fr : p.en}
              </button>
            ))}
          </div>
          <p className="mt-4 font-ac-mono text-[11px] uppercase tracking-[.12em] text-brume">
            {c.aide}
          </p>
        </div>
      </div>
    </section>
  );
}

function Preuves({
  locale,
  note,
  retours,
  temoignages,
}: {
  locale: Locale;
  note: string;
  retours: number;
  temoignages: Jour30Data['temoignages'];
}) {
  const c = copyV2(locale).preuves;
  const choisis = temoignagesPublics(temoignages).slice(0, 6);

  return (
    <section className="border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or">{c.kicker}</div>
        <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-ivoire">
          {c.titre}
        </h2>
        <p className="mt-4 max-w-[70ch] text-[16px] leading-[1.65] text-brume-nuit">
          {c.chapeau(note, retours)}
        </p>

        <div className="mt-9 grid grid-cols-[minmax(0,1fr)] gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {choisis.map((t, i) => (
            <blockquote
              key={i}
              className="m-0 rounded-carte border border-filet-nuit bg-salle-2 p-6 text-[14.5px] leading-[1.65] text-corps-nuit"
            >
              <span className="mb-3 block font-ac-mono text-[13px] font-semibold text-or">
                {typeof t.note === 'number' ? `${noteLocale(t.note, locale)}/10` : ''}
              </span>
              {t.texte}
              <cite className="mt-3 block font-ac-mono text-[12px] not-italic text-brume-nuit">
                {[t.auteur, t.societe].filter(Boolean).join(' · ')}
              </cite>
            </blockquote>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3.5 md:grid-cols-3">
          {['session-la-poste', 'session-leclerc', 'session-abm'].map((f) => (
            <img
              key={f}
              src={`/academy/references/${f}.jpg`}
              alt=""
              loading="lazy"
              className="aspect-[3/2] w-full rounded-carte border border-filet-nuit object-cover"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

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
  const programme = data.offres.find((o) => o.id === 'programme');
  const construire = data.offres.find((o) => o.id === 'construire');
  // ⚠️ `formatPrice` ne rend QUE le nombre : le symbole vit dans le texte, que
  // `enDevise` substitue ensuite selon le pays. Sans lui, le titre de la
  // section affichait « 290 pour 30 jours ».
  const euro = (minor: number) => `${formatPrice(minor, locale)} €`;
  const prix = programme ? euro(programme.ttc_minor) : '';
  const hausse = data.hausse ? euro(data.hausse.ttc_minor) : '';
  const moments = momentsDe(data, locale);
  const nbAuto = MODULES.filter((m) => m.palier === 'pro').length;

  return (
    <div data-theme="nuit" className="j30 overflow-x-clip bg-salle text-corps-nuit">
      <Barre
        locale={locale}
        faits={{
          lecons: data.faits.lessons,
          modules: data.faits.modules,
          heures: data.faits.heures,
          exercices: data.faits.exercices,
          prix,
        }}
      />

      <section className="px-4 pb-16 pt-20 sm:px-6 lg:pb-24 lg:pt-28">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or">
              {c.hero.kicker}
            </div>
            <h1 className="mt-3 max-w-[17ch] text-balance text-[clamp(32px,4.6vw,54px)] font-medium leading-[1.06] tracking-[-0.025em] text-ivoire">
              {c.hero.titre}
            </h1>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-[1.65] text-corps-nuit">
              {c.hero.sous(data.faits.lessons, data.faits.heures)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={app}
                className="inline-flex min-h-11 items-center rounded-bouton bg-or px-6 text-[15px] font-semibold text-salle transition hover:bg-or-vif"
              >
                {c.hero.cta(prix)}
              </a>
              <a
                href="#programme"
                className="inline-flex min-h-11 items-center rounded-bouton border border-filet-nuit px-6 text-[15px] font-medium text-ivoire transition hover:border-or hover:text-or"
              >
                {c.hero.cta2(leconsGratuit(data))}
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-filet-nuit pt-6">
              {[
                { b: String(data.faits.lessons), s: c.hero.faitLecons },
                { b: String(data.faits.prompts), s: c.hero.faitPrompts },
                { b: String(data.faits.exercices), s: c.hero.faitExercices },
                { b: `${noteLocale(avis.note, locale)}/10`, s: c.hero.faitNote(avis.nombre) },
              ].map((f) => (
                <div key={f.s}>
                  <b className="block text-[26px] font-semibold leading-none text-ivoire">{f.b}</b>
                  <span className="text-[12.5px] text-brume-nuit">{f.s}</span>
                </div>
              ))}
            </div>
          </div>
          <Boucle nom="programme" className="aspect-[16/10] rounded-carte border border-filet-nuit" />
        </div>
      </section>

      <Programme
        locale={locale}
        modules={data.faits.modules}
        heures={data.faits.heures}
        leconsGratuit={leconsGratuit(data)}
        minutesGratuit={data.faits.minutesGratuit ?? 0}
      />

      <Pratique locale={locale} exercices={data.faits.exercices} />

      <Mcp locale={locale} />

      <Trajet locale={locale} moments={moments} />

      <Preuves
        locale={locale}
        note={noteLocale(avis.note, locale)}
        retours={avis.nombre}
        temoignages={data.temoignages}
      />

      <Tarifs
        locale={locale}
        prixProgrammeMinor={programme?.ttc_minor ?? 0}
        prixAvanceMinor={(programme?.ttc_minor ?? 0) + (construire?.ttc_minor ?? 0)}
        hausse={hausse}
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
    </div>
  );
}
