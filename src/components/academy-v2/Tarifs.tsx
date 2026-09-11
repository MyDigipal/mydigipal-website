import { useEffect, useMemo, useState } from 'react';
import { pointeurGrossier } from '../academy/motion';
import { formatPrice, teamDiscount } from '../academy/offres';
import { SYMBOLE, type Devise } from '../academy/data';
import { copyV2, type Locale } from './copy-v2';
import { useLienApp, paramGarde } from '../academy/track';
import FormEquipe from '../academy/FormEquipe';
import { jour30Copy } from '../academy/copy';
import { Boucle, estDemo, type Demo } from './Video';

/**
 * Les tarifs : trois portes, un nombre de licences, rien d'autre.
 *
 * ⚠️ TROIS PORTES DEPUIS LE 11/09/2026, et c'est le changement de fond. La page
 * ne vendait que La méthode (290 €) et « La méthode avancée » (480 €) : quelqu'un
 * qui pratique déjà tous les jours et ne veut que les automatisations n'avait pas
 * d'entrée. Le cas s'est présenté le 11/09 avec une membre du Club Protéine, et
 * c'est le public qui sort des formaférences. La méthode 290 €, Les
 * automatisations 250 €, les deux 480 € au lieu de 540 €.
 *
 * ⚠️ « La méthode avancée » N'EXISTE PLUS comme nom. Deux noms publics, La
 * méthode et Les automatisations, et une bande qui dit leur addition. Un
 * troisième nom aurait laissé croire à un troisième produit, alors qu'on vend
 * deux programmes et un appariement.
 *
 * ⚠️ La session avec Paul et l'audit flash ont été RETIRÉS de la page le
 * 06/09/2026 (Paul : « on l'enlève complètement »). Ils existent toujours au
 * catalogue et se vendent ailleurs ; ne pas les remettre « pour information ».
 *
 * ⚠️ « Pour 60 jours », pas « par mois » : la vente est un achat ponctuel de
 * soixante jours d'accès, et « par mois » laisse croire à un abonnement
 * reconductible. La durée est la MÊME pour les trois depuis le 11/09/2026
 * (Paul : « on va mettre 60 jours pour tout le monde »), et elle vient de l'app.
 *
 * L'assistant est compris dans les trois, avec un plafond exprimé en questions
 * plutôt qu'en euros : environ 250 par programme, 500 pour les deux.
 */

interface Ligne {
  texte: string;
  detail: string;
  demo?: Demo;
}

/** Ce que l'application répond sur un panier : le total remisé et l'économie. */
interface Remise {
  total: number;
  economie: number;
}

const PLACES = [1, 2, 3, 5, 10];

export default function Tarifs({
  locale,
  prixProgrammeMinor,
  prixAutoMinor,
  prixLotMinor,
  pleinLotMinor,
  accesJours,
  devise,
  paliersEquipe,
  leconsProgramme,
  heuresProgramme,
  leconsComplement,
  exercices,
  relectures,
  leconsGratuit,
  modulesAuto,
  lienGratuit,
}: {
  locale: Locale;
  prixProgrammeMinor: number;
  /** Les automatisations achetées SEULES. Nouveau prix du 11/09/2026. */
  prixAutoMinor: number;
  /** Les deux ensemble, servi par l'app : jamais une addition faite ici. */
  prixLotMinor: number;
  /** La somme des deux prix pleins, celle qu'on barre. */
  pleinLotMinor: number;
  /** Les jours d'accès vendus, identiques pour les trois. */
  accesJours: number;
  /** La devise choisie dans la barre. Le symbole se pose APRÈS le montant. */
  devise: Devise;
  paliersEquipe: Array<{ seats: number; discount: number }>;
  leconsProgramme: number;
  heuresProgramme: string;
  /** Ce que les automatisations ajoutent : la carte le dit, au lieu d'un total flou. */
  leconsComplement: number;
  exercices: number;
  relectures: number;
  leconsGratuit: number;
  modulesAuto: number;
  /** Le module gratuit, déjà enrichi des identifiants de clic. */
  lienGratuit: string;
}) {
  const c = copyV2(locale).tarifs;
  const [survol, setSurvol] = useState<Ligne | null>(null);
  const [tactile, setTactile] = useState(false);
  const [places, setPlaces] = useState(1);
  const [devis, setDevis] = useState(false);
  useEffect(() => setTactile(pointeurGrossier()), []);
  const fr = locale === 'fr';

  const remise = useMemo(() => teamDiscount(places, paliersEquipe), [places, paliersEquipe]);
  /** Le prix d'UNE licence, remise déduite. C'est lui qu'on met en grand. */
  const parLicence = (minor: number) => Math.round(minor * (1 - remise));
  // Le palier réellement franchi, pour que le libellé dise « à partir de 10 »
  // quand la remise est celle de dix places, et non toujours « de trois ».
  const seuilAtteint = useMemo(() => {
    const franchis = paliersEquipe.filter((p) => places >= p.seats);
    return franchis.length ? franchis[franchis.length - 1].seats : 0;
  }, [places, paliersEquipe]);
  // ⚠️ Le tunnel lit `items` et `seats` dans l'URL : sans eux, les boutons
  // mèneraient au même panier et le choix de l'acheteur serait perdu entre la
  // page et la caisse. Depuis le 11/09/2026 le tunnel laisse ensuite le
  // modifier, mais c'est bien ce lien qui pose le panier d'arrivée.
  const base = 'https://academy.mydigipal.com/checkout';
  const lienMethode = useLienApp(`${base}?items=programme&seats=${places}&lang=${locale}`);
  const lienAuto = useLienApp(`${base}?items=construire&seats=${places}&lang=${locale}`);
  const lienLot = useLienApp(`${base}?items=programme,construire&seats=${places}&lang=${locale}`);
  const total = (minor: number) => Math.round(minor * places * (1 - remise));
  const montant = (minor: number) => `${formatPrice(minor, locale)} ${SYMBOLE[devise]}`;

  /**
   * LE CODE PROMO (07/09/2026, option B retenue par Paul dans le labo).
   *
   * ⚠️ Ce que ça répare : le code voyageait bien jusqu'au tunnel, mais la page
   * annonçait le prix plein. Quelqu'un du Club Protéine lisait 290 € et ne
   * découvrait 203 € qu'à la caisse, c'est-à-dire au moment où il avait déjà
   * décidé de ne pas acheter.
   *
   * ⚠️ LE MONTANT REMISÉ VIENT DE L'APPLICATION, jamais d'un calcul refait ici.
   * Un code peut ne porter que sur une partie du panier, et depuis le 11/09/2026
   * il peut même REFUSER un panier : un code personnel limité aux automatisations
   * ne s'applique pas au lot. On interroge donc une fois par porte, et les trois
   * réponses peuvent différer.
   */
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => setCode(paramGarde('coupon')), []);
  const [promo, setPromo] = useState<{
    methode: Remise | null;
    auto: Remise | null;
    lot: Remise | null;
    fin: string | null;
    /**
     * Les jours d'accès que le code garantit, quand il en garantit.
     *
     * ⚠️ Vient de l'API, jamais écrit ici : une durée recopiée survivrait à un
     * changement du code et promettrait un accès qu'on ne donnerait plus.
     */
    jours: number | null;
  } | null>(null);

  useEffect(() => {
    if (!code || devis) {
      setPromo(null);
      return;
    }
    const ctrl = new AbortController();
    const demande = (
      items: string,
      minor: number
    ): Promise<[Remise | null, string | null, number | null]> => {
      const q = new URLSearchParams({
        code,
        total: String(total(minor)),
        devise,
        items,
        seats: String(places),
      });
      return fetch(`https://academy.mydigipal.com/api/academy/public/coupon?${q.toString()}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) =>
          d?.valid && d.discount_minor > 0
            ? ([
                { total: d.total_minor, economie: d.discount_minor },
                d.expires_at || null,
                d.access_days || null,
              ] as [Remise, string | null, number | null])
            : ([null, null, null] as [null, null, null]),
        );
    };
    Promise.all([
      demande('programme', prixProgrammeMinor),
      demande('construire', prixAutoMinor),
      demande('programme,construire', prixLotMinor),
    ])
      .then(([[m, finM, jM], [a, finA, jA], [l, finL, jL]]) =>
        setPromo(
          m || a || l
            ? { methode: m, auto: a, lot: l, fin: finM || finA || finL, jours: jM || jA || jL }
            : null,
        ),
      )
      .catch(() => {
        /* code injoignable : on montre le prix plein, le tunnel fera foi */
      });
    return () => ctrl.abort();
  }, [code, devis, places, devise, remise, prixProgrammeMinor, prixAutoMinor, prixLotMinor]);

  /** Le pourcentage annoncé, lu sur la remise réelle et jamais écrit à la main. */
  const pctPromo = useMemo(() => {
    const r = promo?.methode || promo?.auto || promo?.lot;
    if (!r) return 0;
    const plein = r.total + r.economie;
    return plein > 0 ? Math.round((r.economie / plein) * 100) : 0;
  }, [promo]);

  /**
   * Ce que le code couvre vraiment, déduit des trois réponses.
   *
   * ⚠️ Un code qui ne marche que sur une porte doit le dire, sinon quelqu'un
   * clique sur une autre et découvre le prix plein au moment de payer. C'est
   * devenu possible le 11/09/2026 avec les codes à portée stricte.
   */
  const porteePromo = useMemo(() => {
    const m = !!promo?.methode;
    const a = !!promo?.auto;
    const l = !!promo?.lot;
    if (m && a && l) return c.codePortee.deux;
    if (l && !m && !a) return c.codePortee.lot;
    if (m && !a) return c.codePortee.methode;
    if (a && !m) return c.codePortee.avancee;
    return c.codePortee.deux;
  }, [promo, c]);

  // La date de fin dans la langue lue. Absente si le code n'expire pas.
  const finPromo = useMemo(() => {
    if (!promo?.fin) return null;
    const d = new Date(promo.fin);
    return Number.isNaN(d.getTime())
      ? null
      : d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long' });
  }, [promo, locale]);

  /** La durée annoncée : celle de la formule, ou celle du code s'il donne plus. */
  const jours = Math.max(accesJours, promo?.jours ?? 0);

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
    // ⚠️ La formation est bilingue depuis toujours et la page ne le disait nulle
    // part (Paul, 07/09). Ça se dit ici parce que c'est un critère de décision,
    // pas une caractéristique.
    {
      texte: fr ? 'Tout le contenu en français et en anglais' : 'Every lesson in English and in French',
      detail: fr
        ? 'Les leçons sont écrites en français, et chacune existe en anglais. On bascule d’un clic, en gardant sa progression : vos collègues à l’étranger suivent exactement le même parcours.'
        : 'Every lesson exists in both languages. You switch in one click and keep your progress, so colleagues abroad follow exactly the same path.',
    },
  ];

  /**
   * ⚠️ Cette carte décrit LES AUTOMATISATIONS SEULES depuis le 11/09/2026.
   *
   * Elle disait « La méthode en entier, et 101 leçons de plus », parce qu'elle
   * vendait le lot. Maintenant qu'elle a son propre prix, elle doit dire ce que
   * 250 € ouvrent et rien d'autre : promettre La méthode dans la carte qui ne la
   * contient pas serait exactement la faute qu'on vient de corriger dans le
   * panneau du tunnel.
   *
   * Et elle dit pour QUI c'est, en dernière ligne. Un parcours qui suppose un
   * acquis doit le déclarer, sinon on vend les automatisations à un débutant qui
   * se retrouvera bloqué à la troisième leçon et demandera son remboursement.
   */
  const auto: Ligne[] = [
    {
      texte: fr
        ? `${leconsComplement} leçons, ${modulesAuto} modules`
        : `${leconsComplement} lessons, ${modulesAuto} modules`,
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
      texte: fr ? 'L’assistant IA, environ 250 questions' : 'The AI assistant, about 250 questions',
      detail: fr
        ? 'Il ne répond qu’à partir des leçons auxquelles vous avez accès, et cite celle dont il tire sa réponse : il ne peut ni inventer, ni divulguer un contenu que vous n’avez pas.'
        : 'It answers only from the lessons you have access to, and cites the one it draws from: it can neither invent nor leak content you have not bought.',
      demo: 'assistant',
    },
    {
      texte: fr
        ? 'Pour qui pratique déjà l’IA toutes les semaines'
        : 'For people who already use AI every week',
      detail: fr
        ? 'Ce parcours ne réapprend pas à écrire une bonne demande : il suppose que c’est acquis. Si vous débutez, prenez La méthode d’abord, ou les deux ensemble.'
        : 'This path does not teach you how to write a good request again: it assumes you know. If you are starting out, take The method first, or both together.',
    },
  ];

  const rendreLigne = (l: Ligne, or: boolean) => (
    <li
      key={l.texte}
      onMouseEnter={() => setSurvol(l)}
      onFocus={() => setSurvol(l)}
      onClick={() => setSurvol(l)}
      tabIndex={0}
      className={`relative cursor-default py-2 pl-6 text-[15.5px] leading-[1.55] transition before:absolute before:left-0 before:top-[15px] before:h-0.5 before:w-2.5 ${
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
    lien: string,
    // La remise du code sur CETTE porte, telle que l'application la calcule.
    rp: Remise | null = null,
  ) => (
    <div className={`rounded-carte border bg-salle-2 p-7 ${or ? 'border-or' : 'border-avance'}`}>
      <span
        className={`font-ac-mono text-[10.5px] uppercase tracking-[.12em] ${or ? 'text-or' : 'text-avance'}`}
      >
        {titre}
      </span>
      <h3 className="mb-1 mt-1 text-[20px] font-medium text-ivoire">{sous}</h3>
      <div className="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-[38px] font-semibold tabular-nums leading-none text-ivoire">
          {/* Le grand chiffre est le prix d'UNE licence, toutes remises
              déduites. Avec un code, il vient du total renvoyé par
              l'application, divisé par le nombre de licences. */}
          {montant(rp ? Math.round(rp.total / places) : parLicence(minor))}
        </span>
        {(remise > 0 || rp) && (
          <span className="font-ac-mono text-[15px] tabular-nums text-brume-nuit line-through">
            {montant(minor)}
          </span>
        )}
      </div>
      <div className={`mt-1.5 font-ac-mono text-[12.5px] ${or ? 'text-or' : 'text-avance'}`}>
        {c.duree(jours)}
        {places > 1 ? ` · ${c.parPlace}` : ''}
      </div>
      {places > 1 && (
        <div className="mb-3 mt-2 font-ac-mono text-[13px] text-corps-nuit">
          {/* ⚠️ Le total suit le code, comme le prix unitaire juste au-dessus.
              Sans cela, la carte affichait 172,55 € par licence et 1 232,50 €
              pour cinq : deux chiffres qui se contredisent sur la même carte. */}
          {c.total(montant(rp ? rp.total : total(minor)), places)}
        </div>
      )}
      <ul className="m-0 mb-5 mt-3 list-none p-0">{lignes.map((l) => rendreLigne(l, or))}</ul>
      <a
        href={lien}
        className={`inline-flex min-h-11 items-center rounded-bouton px-6 text-[15px] font-semibold transition ${
          or ? 'bg-or text-salle hover:bg-or-vif' : 'bg-avance text-salle hover:bg-[#a2dcef]'
        }`}
      >
        {c.commencer}
      </a>
      {/* Ce qu'on gagne, en clair. Un prix barré dit qu'il y a une remise ; ce
          chiffre-là dit combien, ce qui n'est pas la même information. */}
      {rp && (
        <div className="mt-3 font-ac-mono text-[12.5px] text-sauge-nuit">
          {c.economie(montant(rp.economie), places)}
        </div>
      )}
    </div>
  );

  return (
    <section id="tarifs" className="scroll-mt-20 border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or">{c.kicker}</div>
        <h2 className="mt-3 text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-ivoire">
          {c.titre(montant(Math.min(prixProgrammeMinor, prixAutoMinor)))}
        </h2>
        <p className="mt-4 max-w-[62ch] text-[17.5px] leading-[1.65] text-brume-nuit">
          {c.chapeau(jours)}
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
                onClick={() => {
                  setPlaces(n);
                  setDevis(false);
                }}
                className={`min-h-11 min-w-11 rounded-bouton border px-3 font-ac-mono text-[13px] tabular-nums transition ${
                  places === n
                    ? 'border-or bg-or text-salle'
                    : 'border-filet-nuit text-corps-nuit hover:border-or hover:text-or'
                }`}
              >
                {n}
              </button>
            ))}
            {/* Au-delà de dix licences, on ne vend pas en libre-service : le
                « + » ouvre la conversation plutôt qu'un onzième bouton. */}
            <button
              type="button"
              onClick={() => setDevis((v) => !v)}
              aria-expanded={devis}
              className={`min-h-11 min-w-11 rounded-bouton border px-3 font-ac-mono text-[15px] transition ${
                devis ? 'border-or bg-or text-salle' : 'border-filet-nuit text-corps-nuit hover:border-or hover:text-or'
              }`}
              title={c.plusDeLicences}
            >
              +
            </button>
          </div>
          {remise > 0 && !devis && (
            <span className="inline-flex items-center gap-2 rounded-full border border-sauge-nuit/45 bg-[rgba(95,188,143,.12)] px-3.5 py-1.5 font-ac-mono text-[13px] font-bold text-sauge-nuit">
              −{Math.round(remise * 100)} %
              <span className="font-normal text-corps-nuit">{c.remiseEquipe(seuilAtteint)}</span>
            </span>
          )}
          {/* La pastille du code prend la forme de celle de la remise d'équipe,
              en or plutôt qu'en vert : la page a déjà ce vocabulaire, elle n'en
              apprend pas un second. */}
          {promo && pctPromo > 0 && !devis && (
            <span className="inline-flex items-center gap-2 rounded-full border border-or/50 bg-[rgba(200,169,81,.12)] px-3.5 py-1.5 font-ac-mono text-[13px] font-bold text-or">
              {c.codePastille(pctPromo)}
              <span className="font-normal text-corps-nuit">{c.codeNom((code || '').toUpperCase())}</span>
            </span>
          )}
        </div>

        {devis ? (
          <div className="mt-5 rounded-carte border border-or/45 bg-salle-2 p-6">
            <p className="m-0 font-ac-mono text-[10.5px] uppercase tracking-[.12em] text-or">
              {c.plusDeLicences}
            </p>
            <p className="m-0 mb-1 mt-2 text-[18px] leading-[1.35] text-ivoire">{c.devisTitre}</p>
            <p className="m-0 mb-5 max-w-[62ch] text-[15px] leading-[1.6] text-brume-nuit">
              {c.devisTexte}
            </p>
            <FormEquipe
              locale={locale}
              seats={20}
              base="https://academy.mydigipal.com"
              c={jour30Copy(locale).configurateur.equipe}
            />
          </div>
        ) : null}

        {/* Le bandeau qui dit d'où vient la remise. Une réduction de trente pour
            cent dont on ignore l'origine inquiète autant qu'elle réjouit ; celle-ci
            se nomme, dit sa portée et sa date de fin, et rassure sur le fait qu'il
            n'y a rien à saisir. Il n'existe que si un code est actif. */}
        {promo && pctPromo > 0 && !devis && (
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-carte border border-or/[0.42] bg-[rgba(200,169,81,.09)] px-[18px] py-3.5">
            <span className="font-ac-mono text-[13px] font-bold text-or">{(code || '').toUpperCase()}</span>
            <span className="text-[14.5px] leading-[1.5] text-corps-nuit">
              {c.codeBandeau(pctPromo, porteePromo, finPromo)}
            </span>
          </div>
        )}

        {/* Les deux programmes, à égalité. Ni l'un ni l'autre n'est « le vrai »
            dont l'autre serait le complément : ce sont deux entrées, l'une par
            la méthode, l'autre par les automatisations. */}
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1fr_1fr_320px]">
          {carte(c.methode, c.methodeSous, prixProgrammeMinor, methode, true, lienMethode, promo?.methode ?? null)}
          {carte(c.auto, c.autoSous, prixAutoMinor, auto, false, lienAuto, promo?.auto ?? null)}

          {/* Le cadre qui se remplit au survol d'une ligne, avec l'écran qui va
              avec. Masqué sous lg : au doigt il n'y a pas de survol, et le
              toucher d'une ligne le remplirait sous le pouce, hors de vue. */}
          <aside className="hidden flex-col rounded-carte border border-filet-nuit bg-salle-3 p-5 lg:flex">
            {!survol ? (
              <p className="m-0 font-ac-mono text-[12px] uppercase leading-[1.7] tracking-[.1em] text-brume-nuit">
                {tactile ? c.survolTactile : c.survol}
              </p>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                {estDemo(survol.demo) && (
                  <Boucle
                    nom={survol.demo}
                    className="mb-4 min-h-[200px] flex-1 rounded-[11px] border border-filet-nuit"
                    vignette
                  />
                )}
                <h4 className="mb-2 text-[16px] font-medium leading-[1.3] text-ivoire">
                  {survol.texte}
                </h4>
                <p className="m-0 text-[14.5px] leading-[1.6] text-brume-nuit">{survol.detail}</p>
              </div>
            )}
          </aside>
        </div>

        {/*
          LA BANDE « LES DEUX » (11/09/2026, direction retenue par Paul).

          ⚠️ Une bande et non une troisième carte, parce que ce n'est pas un
          troisième produit : c'est l'addition des deux au-dessus. Une carte de
          même forme, posée à côté, aurait mis trois choses en concurrence là où
          il n'y a que deux objets et un appariement.

          Le dégradé va de l'or de La méthode au bleu des Automatisations : c'est
          déjà le filet qui court en haut du tunnel de paiement, donc la page
          n'apprend pas un vocabulaire de plus. La couleur dit « les deux
          ensemble » sans un mot, et c'est la seule chose qu'elle a à dire.
        */}
        <div className="relative mt-4 overflow-hidden rounded-carte border border-filet-nuit bg-salle-2">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg,#c8a951 0%,#dcbc66 38%,#7fc4dd 100%)' }}
          />
          <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:gap-x-8">
            <div className="min-w-0 flex-1">
              <span className="font-ac-mono text-[10.5px] uppercase tracking-[.12em] text-or">
                {c.lot}
              </span>
              <p className="m-0 mt-1 text-[17px] leading-[1.45] text-ivoire">{c.lotSous}</p>
              <p className="m-0 mt-1 text-[15px] leading-[1.55] text-brume-nuit">
                {fr
                  ? `${leconsProgramme + leconsComplement} leçons en tout, aucun module fermé.`
                  : `${leconsProgramme + leconsComplement} lessons in total, no locked module.`}
              </p>
            </div>

            <div className="flex flex-none flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-[32px] font-semibold tabular-nums leading-none text-ivoire">
                {montant(promo?.lot ? Math.round(promo.lot.total / places) : parLicence(prixLotMinor))}
              </span>
              {/* Le prix plein barré est la somme des deux achetés séparément.
                  Il doit rester vérifiable : les deux se vendent vraiment à ce
                  prix-là chacun de leur côté, juste au-dessus. */}
              <span className="font-ac-mono text-[14px] tabular-nums text-brume-nuit line-through">
                {montant(parLicence(pleinLotMinor))}
              </span>
            </div>

            <a
              href={lienLot}
              className="inline-flex min-h-11 flex-none items-center justify-center rounded-bouton bg-ivoire px-6 text-[15px] font-semibold text-salle transition hover:bg-white max-sm:w-full"
            >
              {c.lotCta}
            </a>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-filet-nuit px-6 py-3 font-ac-mono text-[12.5px]">
            <span className="text-sauge-nuit">
              {c.lotEconomie(
                montant(
                  promo?.lot
                    ? promo.lot.economie + (parLicence(pleinLotMinor) - parLicence(prixLotMinor)) * places
                    : parLicence(pleinLotMinor) - parLicence(prixLotMinor)
                )
              )}
            </span>
            <span className="text-brume-nuit">{c.duree(jours)}</span>
            <span className="text-brume-nuit">
              {fr ? 'L’assistant IA, environ 500 questions' : 'The AI assistant, about 500 questions'}
            </span>
            {places > 1 && (
              <span className="text-corps-nuit">
                {c.total(montant(promo?.lot ? promo.lot.total : total(prixLotMinor)), places)}
              </span>
            )}
          </div>
        </div>

        {/* La porte gratuite. Dans la teinte du renard, distincte de l'or de La
            méthode et du bleu des Automatisations, pour qu'on voie d'un coup
            d'œil que ce n'est pas une quatrième formule. */}
        <div className="mt-4 flex flex-col gap-4 rounded-carte border border-renard/45 bg-[rgba(217,116,63,.07)] px-6 py-6 sm:flex-row sm:items-center sm:gap-x-8">
          <div className="min-w-0 flex-1">
            <span className="font-ac-mono text-[10.5px] uppercase tracking-[.12em] text-renard">
              {c.gratuitTag}
            </span>
            <p className="m-0 mt-1 text-[17px] leading-[1.5] text-ivoire">
              {c.gratuitTitre(leconsGratuit)}
            </p>
            <p className="m-0 mt-1 text-[15px] leading-[1.55] text-brume-nuit">{c.gratuitTexte}</p>
          </div>
          <a
            href={lienGratuit}
            className="inline-flex min-h-11 flex-none items-center justify-center rounded-bouton border border-renard px-5 text-[15px] font-medium text-renard transition hover:bg-renard hover:text-salle max-sm:w-full"
          >
            {c.gratuitCta}
          </a>
        </div>

        <p className="mt-5 text-[14px] leading-[1.6] text-brume-nuit">{c.rappel()}</p>
      </div>
    </section>
  );
}
