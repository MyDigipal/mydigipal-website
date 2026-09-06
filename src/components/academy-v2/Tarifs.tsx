import { useEffect, useMemo, useState } from 'react';
import { pointeurGrossier } from '../academy/motion';
import { formatPrice, teamDiscount } from '../academy/offres';
import { copyV2, type Locale } from './copy-v2';
import { Boucle, estDemo, type Demo } from './Video';

/**
 * Les tarifs : deux formules, un nombre de licences, rien d'autre.
 *
 * ⚠️ La session avec Paul et l'audit flash ont été RETIRÉS de la page le
 * 06/09/2026 (Paul : « on l'enlève complètement... c'est juste soit il choisit
 * la méthode à 290 €, soit la méthode avancée à 480 € »). Ils continuent
 * d'exister dans le catalogue de l'application et se vendent ailleurs ; ils ne
 * doivent plus paraître ici. Ne pas les remettre « pour information ».
 *
 * ⚠️ La méthode avancée est un TOUT à 480 €, pas un complément de 190 € à
 * cocher. C'est la somme de `programme` et `construire`, calculée depuis les
 * montants de l'application : ni 480 ni 290 ne sont écrits ici.
 *
 * ⚠️ « Pour 30 jours », pas « par mois » : la vente est un achat ponctuel de
 * trente jours d'accès, et « par mois » laisse croire à un abonnement
 * reconductible.
 *
 * L'assistant est compris dans les deux, avec un plafond exprimé en questions
 * plutôt qu'en euros : environ 250 pour la méthode, 500 pour l'avancée.
 */

interface Ligne {
  texte: string;
  detail: string;
  demo?: Demo;
}

const PLACES = [1, 2, 3, 5, 10, 20];

export default function Tarifs({
  locale,
  prixProgrammeMinor,
  prixAvanceMinor,
  hausseMinor,
  paliersEquipe,
  devisAPartirDe,
  leconsProgramme,
  heuresProgramme,
  leconsTotal,
  heuresTotal,
  exercices,
  relectures,
  leconsGratuit,
  modulesAuto,
  lienApp,
}: {
  locale: Locale;
  prixProgrammeMinor: number;
  prixAvanceMinor: number;
  hausseMinor: number;
  paliersEquipe: Array<{ seats: number; discount: number }>;
  devisAPartirDe: number;
  leconsProgramme: number;
  heuresProgramme: string;
  leconsTotal: number;
  heuresTotal: string;
  exercices: number;
  relectures: number;
  leconsGratuit: number;
  modulesAuto: number;
  lienApp: string;
}) {
  const c = copyV2(locale).tarifs;
  const [survol, setSurvol] = useState<Ligne | null>(null);
  const [tactile, setTactile] = useState(false);
  const [places, setPlaces] = useState(1);
  useEffect(() => setTactile(pointeurGrossier()), []);
  const fr = locale === 'fr';

  const remise = useMemo(() => teamDiscount(places, paliersEquipe), [places, paliersEquipe]);
  const total = (minor: number) => Math.round(minor * places * (1 - remise));
  const euro = (minor: number) => `${formatPrice(minor, locale)} €`;
  const devis = places >= devisAPartirDe;

  const methode: Ligne[] = [
    {
      texte: fr
        ? `${leconsProgramme} leçons, ${heuresProgramme} de formation`
        : `${leconsProgramme} lessons, ${heuresProgramme} of training`,
      detail: fr
        ? 'La méthode de prompting, le parcours de votre outil, juger une réponse, protéger ses données, écrire, chercher, et passer à l’action.'
        : 'The prompting method, the path for your tool, judging an answer, protecting your data, writing, searching, and putting it to work.',
      demo: 'programme',
    },
    {
      texte: fr ? 'Le parcours de l’outil que vous choisissez' : 'The full path for the tool you choose',
      detail: fr
        ? 'Copilot, Gemini, Claude ou ChatGPT. Vous en choisissez un, et le parcours écarte les trois autres : vous n’apprenez pas une interface que vous n’ouvrirez jamais.'
        : 'Copilot, Gemini, Claude or ChatGPT. You pick one and the path drops the other three: you do not learn an interface you will never open.',
    },
    {
      texte: fr
        ? 'L’atelier, les quiz, le « À vous » de chaque leçon'
        : 'The workshop, the quizzes, the “Your turn” of every lesson',
      detail: fr
        ? 'L’atelier assemble votre demande champ par champ et garde vos brouillons. Chaque leçon se termine par un exercice court, et ce que vous écrivez reste dans votre compte.'
        : 'The workshop assembles your request field by field and keeps your drafts. Every lesson ends with a short exercise, and what you write stays in your account.',
      demo: 'atelier',
    },
    {
      texte: fr
        ? `${exercices} exercices, dont ${relectures} relus et annotés`
        : `${exercices} exercises, ${relectures} of them reviewed and annotated`,
      detail: fr
        ? 'Les exercices portent sur vos propres dossiers, pas sur un cas d’école. Vous en déposez autant que vous voulez ; trois vous reviennent annotés.'
        : 'Exercises run on your own files, not on a textbook case. You hand in as many as you like; three come back annotated.',
    },
    {
      texte: fr ? 'L’assistant IA, environ 250 questions' : 'The AI assistant, about 250 questions',
      detail: fr
        ? 'Il ne répond qu’à partir des leçons auxquelles vous avez accès, et cite celle dont il tire sa réponse : il ne peut ni inventer, ni divulguer un contenu que vous n’avez pas.'
        : 'It answers only from the lessons you have access to, and cites the one it draws from: it can neither invent nor leak content you have not bought.',
      demo: 'assistant',
    },
  ];

  const avancee: Ligne[] = [
    {
      texte: fr
        ? `Tout ce qui précède, et ${leconsTotal} leçons en tout`
        : `Everything above, and ${leconsTotal} lessons in total`,
      detail: fr
        ? `Le parcours complet, ${heuresTotal} de formation, sans module fermé.`
        : `The complete path, ${heuresTotal} of training, with no locked module.`,
      demo: 'programme',
    },
    {
      texte: fr
        ? `${modulesAuto} modules de plus, dont le parcours des automatisations`
        : `${modulesAuto} more modules, including the automations path`,
      detail: fr
        ? 'Image, vidéo et audio, les cas de votre métier, les chiffres et les tableurs, les réunions, présenter et convaincre, manager une équipe.'
        : 'Image, video and audio, the cases of your job, figures and spreadsheets, meetings, presenting, and managing a team.',
      demo: 'cas',
    },
    {
      texte: fr ? 'Les agents et les serveurs MCP' : 'Agents and MCP servers',
      detail: fr
        ? 'Ce qu’est un agent et où on l’arrête, les trois façons de monter sa prise MCP (connecteurs, n8n, passerelle maison), le montage pas à pas, les clés et les comptes.'
        : 'What an agent is and where you stop it, the three ways to build your MCP socket (connectors, n8n, your own gateway), the build step by step, the keys and the accounts.',
      demo: 'avance',
    },
    {
      texte: fr ? 'Dix-neuf chaînes complètes, montées pas à pas' : 'Nineteen complete chains, built step by step',
      detail: fr
        ? 'Du rendez-vous à la proposition, de la facture à la relance, du transcript aux tâches. Chacune avec son point d’arrêt humain, celui qui vous rend la main avant l’envoi.'
        : 'From the call to the proposal, from the invoice to the follow-up, from the transcript to the tasks. Each with its human stop, the one that hands you back control before anything is sent.',
      demo: 'cas',
    },
    {
      texte: fr ? 'L’assistant IA, environ 500 questions' : 'The AI assistant, about 500 questions',
      detail: fr
        ? 'Le même assistant, avec le double de questions et la relecture de vos « À vous » : ce qui est bien, ce qui manque au regard de la méthode, et une phrase reformulée.'
        : 'The same assistant, with twice the questions and a review of your “Your turn” entries: what works, what is missing against the method, and one sentence rewritten.',
      demo: 'assistant',
    },
  ];

  const rendreLigne = (l: Ligne, or: boolean) => (
    <li
      key={l.texte}
      onMouseEnter={() => setSurvol(l)}
      onFocus={() => setSurvol(l)}
      onClick={() => setSurvol(l)}
      tabIndex={0}
      className={`relative cursor-default py-2 pl-6 text-[14.5px] leading-[1.55] transition before:absolute before:left-0 before:top-[15px] before:h-0.5 before:w-2.5 ${
        or ? 'before:bg-or' : 'before:bg-avance'
      } ${survol === l ? 'text-ivoire' : 'text-corps-nuit'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-or`}
    >
      {l.texte}
    </li>
  );

  const carte = (
    titre: string,
    sous: string,
    minor: number,
    lignes: Ligne[],
    or: boolean,
  ) => (
    <div className={`rounded-carte border bg-salle-2 p-7 ${or ? 'border-or' : 'border-avance'}`}>
      <span
        className={`font-ac-mono text-[10.5px] uppercase tracking-[.12em] ${or ? 'text-or' : 'text-avance'}`}
      >
        {titre}
      </span>
      <h3 className="mb-1 mt-1 text-[20px] font-medium text-ivoire">{sous}</h3>
      <div className="mt-3.5 text-[38px] font-semibold tabular-nums leading-none text-ivoire">
        {euro(total(minor))}
      </div>
      <div className={`mb-1 mt-1.5 font-ac-mono text-[12.5px] ${or ? 'text-or' : 'text-avance'}`}>
        {c.duree}
        {places > 1 ? ` · ${c.places(places)}` : ''}
      </div>
      {places > 1 && (
        <div className="mb-3 font-ac-mono text-[12px] text-brume-nuit">
          {euro(minor)} {c.parPlace}
          {remise > 0 ? ` · −${Math.round(remise * 100)} %` : ''}
        </div>
      )}
      <ul className="m-0 mb-5 mt-3 list-none p-0">{lignes.map((l) => rendreLigne(l, or))}</ul>
      <a
        href={lienApp}
        className={`inline-flex min-h-11 items-center rounded-bouton px-6 text-[15px] font-semibold transition ${
          or
            ? 'bg-or text-salle hover:bg-or-vif'
            : 'border border-filet-nuit font-medium text-ivoire hover:border-avance hover:text-avance'
        }`}
      >
        {c.commencer}
      </a>
    </div>
  );

  return (
    <section id="tarifs" className="scroll-mt-20 border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or">{c.kicker}</div>
        <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-ivoire">
          {c.titre(euro(prixProgrammeMinor))}
        </h2>
        <p className="mt-4 max-w-[62ch] text-[16px] leading-[1.65] text-brume-nuit">
          {c.chapeau(euro(hausseMinor))}
        </p>

        {/* Les licences. Une par défaut : la page vend d'abord à une personne,
            et le choix d'équipe ne doit pas se présenter comme une case à
            remplir avant de voir un prix. */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="font-ac-mono text-[11px] uppercase tracking-[.12em] text-brume-nuit">
            {c.licences}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PLACES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPlaces(n)}
                className={`min-h-11 min-w-11 rounded-bouton border px-3 font-ac-mono text-[13px] tabular-nums transition ${
                  places === n
                    ? 'border-or bg-or text-salle'
                    : 'border-filet-nuit text-corps-nuit hover:border-or hover:text-or'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {remise > 0 && !devis && (
            <span className="font-ac-mono text-[12px] text-sauge">
              −{Math.round(remise * 100)} % {c.remiseEquipe}
            </span>
          )}
        </div>

        {devis ? (
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.6] text-brume-nuit">
            {c.devis(devisAPartirDe)}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1fr_1fr_320px]">
          {carte(c.methode, c.methodeSous, prixProgrammeMinor, methode, true)}
          {carte(c.auto, c.autoSous, prixAvanceMinor, avancee, false)}

          {/* Le cadre qui se remplit au survol d'une ligne, avec l'écran qui va
              avec. Masqué sous lg : au doigt il n'y a pas de survol, et le
              toucher d'une ligne le remplirait sous le pouce, hors de vue. */}
          <aside className="sticky top-24 hidden self-start rounded-carte border border-filet-nuit bg-salle-3 p-5 lg:block">
            {!survol ? (
              <p className="m-0 font-ac-mono text-[12px] uppercase leading-[1.7] tracking-[.1em] text-brume-nuit">
                {tactile ? c.survolTactile : c.survol}
              </p>
            ) : (
              <div>
                {estDemo(survol.demo) && (
                  <Boucle
                    nom={survol.demo}
                    className="mb-3.5 aspect-[16/10] rounded-[11px] border border-filet-nuit"
                    vignette
                  />
                )}
                <h4 className="mb-2 text-[15px] font-medium leading-[1.3] text-ivoire">
                  {survol.texte}
                </h4>
                <p className="m-0 text-[13.5px] leading-[1.6] text-brume-nuit">{survol.detail}</p>
              </div>
            )}
          </aside>
        </div>

        <p className="mt-6 text-[14px] leading-[1.6] text-brume-nuit">{c.rappel(leconsGratuit)}</p>
      </div>
    </section>
  );
}
