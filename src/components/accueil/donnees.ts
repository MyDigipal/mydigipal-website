/**
 * La page d'accueil : tout ce qu'elle affiche et qui n'est pas du texte.
 *
 * Règle de la refonte (24/09/2026) : aucun chiffre écrit à la main.
 * - les résultats clients viennent de la collection `case-studies` ;
 * - les prix de l'agence viennent de `prixDeDepart()` dans le moteur du
 *   calculateur, qui les lit dans `components/calculator/data/` ;
 * - les prix, la note et les verbatims de l'Academy viennent de son API
 *   publique, lue au build, avec l'instantané de `src/data/academy/` en secours,
 *   puis relus dans le navigateur (script de `Portes.astro`).
 * Ce fichier ne contient que des libellés, des choix d'ordre et des chemins.
 */
import { getCollection } from 'astro:content';
import {
  DOMAIN_ORDER,
  domainName,
  money,
  prixDeDepart,
  type Lang,
} from '@/components/calculator-v6/engine';
import type { ServiceDomain } from '@/components/calculator/types';
import {
  AVIS_REPLI,
  ENDPOINT,
  noteLocale,
  prixDe,
  temoignagesPublics,
  type Jour30Data,
} from '@/components/academy/data';
import { formatPrice } from '@/components/academy/offres';
import secoursFr from '@/data/academy/jour30-fr.json';
import secoursEn from '@/data/academy/jour30-en.json';
import logosJson from '@/data/accueil/logos.json';

export type { Lang };
export type Txt = { fr: string; en: string };

/** Espace insécable avant un signe (« 500 € », « 20 % ») : sans elle, le signe part seul à la ligne. */
export const NBSP = '\u00a0';

const echapper = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Pour les très grands titres : le point et la virgule qui suivent une lettre
 * passent dans un `<span class="p">` que la feuille de style rapproche.
 * Plus Jakarta Sans donne à sa ponctuation une approche large ; avec un
 * interlettrage serré (-0,04 em) le point paraissait décollé du mot
 * (« grand . »). Renvoie du HTML échappé, pour `set:html`.
 */
export const serrer = (texte: string) =>
  echapper(texte).replace(/([^\s\u00a0])([.,])/g, '$1<span class="p">$2</span>');

/* ------------------------------------------------------------------ l'équipe */

/**
 * Les quatorze, dans l'ordre de l'ancienne section « Qui sommes-nous ».
 *
 * Bruce Eidsvik est aussi Chief Growth Officer de Servion, un client : Paul
 * le garde parmi les quatorze (24/09/2026). S'il sort un jour de l'équipe,
 * supprimer sa ligne suffit, le nombre écrit dans le hero se recalcule.
 */
export const EQUIPE: Array<{ slug: string; nom: string; role: Txt }> = [
  { slug: 'paul-andre', nom: 'Paul André', role: { fr: 'Fondateur', en: 'Founder' } },
  { slug: 'alexandre-echement', nom: 'Alexandre Echement', role: { fr: 'Performance Lead', en: 'Performance Lead' } },
  { slug: 'jordan-langlois', nom: 'Jordan Langlois', role: { fr: 'Digital Strategist', en: 'Digital Strategist' } },
  { slug: 'alizee-varloud', nom: 'Alizée Varloud', role: { fr: 'Project Manager', en: 'Project Manager' } },
  { slug: 'juliette-joire', nom: 'Juliette Joire', role: { fr: 'Content Specialist', en: 'Content Specialist' } },
  { slug: 'sophie-roe', nom: 'Sophie Roe', role: { fr: 'SEO Specialist', en: 'SEO Specialist' } },
  { slug: 'callum-dunbar', nom: 'Callum Dunbar', role: { fr: 'PPC Specialist', en: 'PPC Specialist' } },
  { slug: 'heather-mann', nom: 'Heather Mann', role: { fr: 'Social Media', en: 'Social Media' } },
  { slug: 'victoria-doherty', nom: 'Victoria Doherty', role: { fr: 'Account Manager', en: 'Account Manager' } },
  { slug: 'amna-khan', nom: 'Amna Khan', role: { fr: 'Digital Marketer', en: 'Digital Marketer' } },
  { slug: 'diksha-mishra', nom: 'Diksha Mishra', role: { fr: 'Marketing Analyst', en: 'Marketing Analyst' } },
  { slug: 'chirag-solanki', nom: 'Chirag Solanki', role: { fr: 'Tech Lead', en: 'Tech Lead' } },
  { slug: 'shuai-yang', nom: 'Shuai Yang', role: { fr: 'Developer', en: 'Developer' } },
  { slug: 'bruce-eidsvik', nom: 'Bruce Eidsvik', role: { fr: 'Consultant', en: 'Consultant' } },
];

/** Portrait recadré par `scripts/visages-accueil.mjs` (320 x 400). */
export const portrait = (slug: string) => `/images/team/visages/${slug}.avif`;

const EN_LETTRES: Record<number, Txt> = {
  10: { fr: 'Dix', en: 'Ten' },
  11: { fr: 'Onze', en: 'Eleven' },
  12: { fr: 'Douze', en: 'Twelve' },
  13: { fr: 'Treize', en: 'Thirteen' },
  14: { fr: 'Quatorze', en: 'Fourteen' },
  15: { fr: 'Quinze', en: 'Fifteen' },
  16: { fr: 'Seize', en: 'Sixteen' },
  17: { fr: 'Dix-sept', en: 'Seventeen' },
  18: { fr: 'Dix-huit', en: 'Eighteen' },
  19: { fr: 'Dix-neuf', en: 'Nineteen' },
  20: { fr: 'Vingt', en: 'Twenty' },
};
/** « Quatorze » : un nombre en tête de phrase s'écrit en lettres. */
export const enLettres = (n: number, lang: Lang) => EN_LETTRES[n]?.[lang] ?? String(n);

/* ------------------------------------------------------------------ les logos */

type Logo = {
  nom: string;
  src: string;
  largeur: number;
  hauteur: number;
  fondBlanc: boolean;
  echelle: number;
};
export const LOGOS = logosJson as Record<string, Logo>;

/**
 * La hauteur d'affichage d'un logo : tous reçoivent la même SURFACE, pas la
 * même hauteur, puis `echelle` corrige ce que la surface ne voit pas.
 * `surface` est en pixels carrés à l'écran.
 */
export function hauteurLogo(slug: string, surface = 2600, min = 18, max = 46): number {
  const l = LOGOS[slug];
  if (!l) return min;
  const h = Math.sqrt(surface / (l.largeur / l.hauteur)) * l.echelle;
  return Math.round(Math.min(max, Math.max(min, h)));
}

/** Le bandeau sous le hero : les formations d'abord, puis les clients de l'agence. */
export const BANDEAU = [
  'la-poste',
  'leclerc',
  'pierre-fabre',
  'moet-hennessy',
  'yves-saint-laurent',
  'la-redoute',
  'balenciaga',
  'pernod-ricard',
  'gucci',
  'kaufman-broad',
  'gl-events',
  'grands-moulins',
  'datawords',
  'cbtw',
  'ford',
  'edenred',
  'opentext',
  'bymycar',
  'genesys',
  'gwi',
  'motork',
];

/* ------------------------------------------------------------- les résultats */

/**
 * Les sept études de cas, dans l'ordre de la page, et le résultat qu'on met
 * en avant pour chacune.
 *
 * Le CHIFFRE vient de la fiche (`kpis[indice].value`) ; ici ne vivent que le
 * libellé (celui de la fiche est en Title Case anglais, « Réservations
 * Réunions » en français) et le secteur. `verif` est le libellé anglais
 * attendu dans la fiche : si quelqu'un réordonne les KPI d'une fiche, le build
 * s'arrête au lieu d'afficher le mauvais chiffre sous le bon libellé.
 */
const CAS: Array<{ slug: string; logo: string; indice: number; verif: string; libelle: Txt; secteur: Txt }> = [
  { slug: 'theobald-group', logo: 'theobald', indice: 2, verif: 'cost per conversion', libelle: { fr: 'coût par conversion', en: 'cost per conversion' }, secteur: { fr: 'Automobile, 31 concessions', en: 'Automotive, 31 dealerships' } },
  { slug: 'dmd-group', logo: 'dmd', indice: 0, verif: 'conversions', libelle: { fr: 'conversions', en: 'conversions' }, secteur: { fr: 'Automobile, groupe multimarque', en: 'Automotive, multi-brand group' } },
  { slug: 'vulcain-group', logo: 'vulcain', indice: 0, verif: 'lead volume', libelle: { fr: 'volume de leads', en: 'lead volume' }, secteur: { fr: 'Automobile', en: 'Automotive' } },
  { slug: 'genesys', logo: 'genesys', indice: 1, verif: 'meeting bookings', libelle: { fr: 'rendez-vous réservés', en: 'meetings booked' }, secteur: { fr: 'B2B, expérience client', en: 'B2B, customer experience' } },
  { slug: 'symbl-ai', logo: 'symbl', indice: 1, verif: 'demo requests', libelle: { fr: 'demandes de démo', en: 'demo requests' }, secteur: { fr: 'B2B, IA conversationnelle', en: 'B2B, conversation intelligence' } },
  { slug: 'gwi', logo: 'gwi', indice: 1, verif: 'pipeline influenced', libelle: { fr: 'pipeline influencé', en: 'pipeline influenced' }, secteur: { fr: 'B2B, études d’audience', en: 'B2B, audience research' } },
  { slug: 'quantum-metrics', logo: 'quantum', indice: 1, verif: 'cost per lead', libelle: { fr: 'coût par lead', en: 'cost per lead' }, secteur: { fr: 'B2B, analytics', en: 'B2B, analytics' } },
];

export type Resultat = {
  slug: string;
  client: string;
  logo: string;
  secteur: string;
  canaux: string;
  lien: string;
  libelle: string;
  /** Pour le compteur : le signe devant, la valeur absolue, les décimales, l'unité derrière. */
  signe: string;
  valeur: number;
  decimales: number;
  unite: string;
  /** Le chiffre tel qu'il s'écrit une fois compté. */
  texte: string;
};

function lireValeur(brut: string, lang: Lang) {
  const m = /^([+-]?)(\d+(?:[.,]\d+)?)\s*(%|x)?$/i.exec(brut.trim());
  if (!m) throw new Error(`Accueil : chiffre illisible dans une étude de cas : « ${brut} »`);
  const valeur = parseFloat(m[2].replace(',', '.'));
  const decimales = m[2].includes('.') || m[2].includes(',') ? 1 : 0;
  // Le signe « x » des fiches devient le signe de multiplication ; le
  // pourcentage prend son espace insécable en français.
  const unite = m[3] === '%' ? (lang === 'fr' ? `${NBSP}%` : '%') : m[3] ? '×' : '';
  const nombre = valeur.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
  return { signe: m[1], valeur, decimales, unite, texte: `${m[1]}${nombre}${unite}` };
}

export async function lireResultats(lang: Lang): Promise<Resultat[]> {
  const fiches = await getCollection('case-studies');
  const trouver = (l: string, slug: string) => fiches.find((f) => f.id === `${l}/${slug}`);
  return CAS.map((cas) => {
    const fiche = trouver(lang, cas.slug);
    const ficheEn = trouver('en', cas.slug);
    if (!fiche || !ficheEn) throw new Error(`Accueil : étude de cas introuvable : ${lang}/${cas.slug}`);
    const kpiEn = ficheEn.data.kpis[cas.indice];
    if (!kpiEn || kpiEn.label.toLowerCase() !== cas.verif) {
      throw new Error(
        `Accueil : le KPI ${cas.indice} de ${cas.slug} devait être « ${cas.verif} », la fiche dit « ${kpiEn?.label} ».`,
      );
    }
    const kpi = fiche.data.kpis[cas.indice];
    return {
      slug: cas.slug,
      client: fiche.data.client,
      logo: cas.logo,
      secteur: cas.secteur[lang],
      canaux: fiche.data.services.slice(0, 3).join(', '),
      lien: `/${lang}/case-studies/${cas.slug}`,
      libelle: cas.libelle[lang],
      ...lireValeur(kpi.value, lang),
    };
  });
}

/* ----------------------------------------------------------------- les prix */

/** « 500 € » avec l'espace insécable, dans la mise en forme du calculateur. */
export const montant = (eur: number, lang: Lang) => money(eur, 'EUR', lang).replace(/\s€/, `${NBSP}€`);

export type LignePrix = { principal: string; detail?: string };

/**
 * Ce qu'on écrit à côté d'un service, depuis `prixDeDepart()` seulement.
 * Aucune addition : un total calculé ici serait un second calcul du devis,
 * exactement ce que le moteur v6 a supprimé (CLAUDE.md, section 3).
 */
export function lignePrix(d: ServiceDomain, lang: Lang): LignePrix {
  const p = prixDeDepart(d);
  const fr = lang === 'fr';
  if (p.fee && p.feeMax && p.pct) {
    return {
      principal: fr ? `gestion dès ${montant(p.fee, lang)} par mois` : `management from ${montant(p.fee, lang)} a month`,
      detail: fr
        ? `jusqu’à ${montant(p.feeMax, lang)} de budget média par mois, puis ${p.pct}${NBSP}%`
        : `up to ${montant(p.feeMax, lang)} of monthly ad spend, then ${p.pct}%`,
    };
  }
  if (p.monthly) {
    return {
      principal: fr ? `dès ${montant(p.monthly, lang)} par mois` : `from ${montant(p.monthly, lang)} a month`,
      // Les automatisations se construisent avant de se suivre : taire la
      // mise en place laisserait croire que tout tient dans le mensuel.
      detail:
        d === 'ai-solutions' && p.once
          ? fr
            ? `mise en place dès ${montant(p.once, lang)}`
            : `set-up from ${montant(p.once, lang)}`
          : undefined,
    };
  }
  if (p.once) {
    if (d === 'ai-training') {
      return { principal: fr ? `${montant(p.once, lang)} la demi-journée` : `${montant(p.once, lang)} per half day` };
    }
    return { principal: fr ? `dès ${montant(p.once, lang)}` : `from ${montant(p.once, lang)}` };
  }
  return { principal: fr ? 'selon vos outils' : 'depends on your stack' };
}

/** Les huit domaines du calculateur, dans son ordre, pour les puces de la porte. */
export const DOMAINES = DOMAIN_ORDER.map((d) => ({ id: d, nom: (lang: Lang) => domainName(d, lang) }));

/* -------------------------------------------------------------- l'Academy */

/** Même lecture que `pages/[lang]/academy.astro` : l'API, sinon l'instantané. */
export async function lireAcademy(lang: Lang): Promise<Jour30Data> {
  try {
    const r = await fetch(`${ENDPOINT}?lang=${lang}`, { signal: AbortSignal.timeout(10000) });
    if (r.ok) {
      const d = (await r.json()) as Jour30Data;
      if (d?.etats?.length && d.lang === lang) return d;
    }
  } catch {
    /* instantané */
  }
  return (lang === 'fr' ? secoursFr : secoursEn) as unknown as Jour30Data;
}

export function faitsAcademy(d: Jour30Data, lang: Lang) {
  const programme = d.offres.find((o) => o.id === 'programme');
  const minor = programme ? prixDe(programme, 'EUR') : undefined;
  const avis = d.avis ?? AVIS_REPLI;
  return {
    prix: minor ? `${formatPrice(minor, lang)}${NBSP}€` : null,
    modules: d.faits.modules,
    heures: d.faits.heures,
    note: noteLocale(avis.note, lang),
    noteValeur: avis.note,
    retours: avis.nombre,
  };
}

/**
 * Les verbatims de la section des avis : un par société, le plus court (une
 * citation de page d'accueil tient en trois lignes), mot pour mot.
 * Les sociétés sans logo détouré sont écartées : leur nom écrit en lettres à
 * côté de vrais logos ferait un faux logo.
 */
// Pierre Fabre d'abord : le verbatim affiché d'emblée ne doit pas contenir de
// « œ » (celui de La Poste en a un), sinon le navigateur télécharge un second
// fichier de Plus Jakarta Sans (latin-ext, 21 Ko) dès l'arrivée sur la page.
const LOGO_DE_SOCIETE: Record<string, string> = {
  'Pierre Fabre': 'pierre-fabre',
  'La Poste': 'la-poste',
  'Moët Hennessy': 'moet-hennessy',
  'La Redoute': 'la-redoute',
  'GL Events': 'gl-events',
  Balenciaga: 'balenciaga',
  'Kaufman & Broad': 'kaufman-broad',
  Datawords: 'datawords',
  CBTW: 'cbtw',
};
export function verbatims(d: Jour30Data) {
  const parSociete = new Map<string, { texte: string; auteur: string; societe: string; logo: string }>();
  for (const t of temoignagesPublics(d.temoignages)) {
    const logo = LOGO_DE_SOCIETE[t.societe];
    if (!logo || !LOGOS[logo]) continue;
    const deja = parSociete.get(t.societe);
    if (!deja || t.texte.length < deja.texte.length) {
      parSociete.set(t.societe, { texte: t.texte, auteur: t.auteur, societe: t.societe, logo });
    }
  }
  // L'ordre du tableau LOGO_DE_SOCIETE, pas celui de l'API.
  return Object.keys(LOGO_DE_SOCIETE)
    .map((s) => parSociete.get(s))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
}
