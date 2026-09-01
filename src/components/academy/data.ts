// ============================================================
// AI Academy - ce que la page sait de l'application
// ============================================================
//
// La page de vente vit ici, sur mydigipal.com ; l'application vit sur
// academy.mydigipal.com. Elle ne recopie AUCUN chiffre : tout ce qui est
// ci-dessous vient de `GET https://academy.mydigipal.com/api/academy/public/jour30`,
// lu au build (avec un instantané de secours dans `src/data/academy/`) puis
// rafraîchi dans le navigateur. Le jour où un prix, une grille de points ou
// un nombre de leçons change dans l'app, la page change avec.
//
// Le type est la copie exacte de la réponse ; si l'app change sa forme, c'est
// ici qu'on le voit.

export type Locale = 'fr' | 'en';
export type RankKey = 'decouverte' | 'pratique' | 'methode' | 'maitrise' | 'referent';
export type Metal = 'bronze' | 'argent' | 'or' | 'platine';

export interface EtatJour {
  jour: number;
  points: number;
  rank: RankKey;
  progress: number;
  manque: number | null;
  nextRank: RankKey | null;
  serie: number;
  jokers: number;
  metal: Metal | null;
  renard: number;
  trophees: number;
}

export type Devise = 'EUR' | 'GBP' | 'USD';

export interface Offre {
  id: string;
  kind: 'course' | 'upgrade' | 'subscription' | 'service';
  name: string;
  tagline: string;
  /** Le prix en euros. Conservé tel quel : c'est le repli quand `prix` manque. */
  ttc_minor: number;
  /**
   * Le même prix dans les trois devises, servi par l'app depuis le 27/08/2026.
   *
   * Optionnel à dessein : l'instantané de secours de `src/data/academy/` ne le
   * portera qu'après le prochain build, et une page de vente qui casserait
   * parce qu'un champ manque serait un remède pire que le mal.
   */
  prix?: Partial<Record<Devise, number>>;
  monthly_questions: number | null;
  requires_course: boolean;
}

export const SYMBOLE: Record<Devise, string> = { EUR: '€', GBP: '£', USD: '$' };

/**
 * Le prix d'une offre dans la devise choisie, en centimes.
 *
 * Les prix ne se convertissent JAMAIS ici : chaque marché a sa grille, posée
 * dans le catalogue de l'app, et le dollar y est volontairement plus cher
 * puisqu'aucune TVA n'en est reversée. Cette fonction ne fait que choisir.
 */
export function prixDe(o: { ttc_minor: number; prix?: Partial<Record<Devise, number>> }, devise: Devise): number {
  return o.prix?.[devise] ?? o.ttc_minor;
}

export interface Avis {
  note: number;
  nombre: number;
}

export interface Jour30Data {
  lang: Locale;
  generated_at: string;
  faits: {
    /** Le volume du parcours vendu, tous paliers confondus. */
    lessons: number;
    modules: number;
    minutes: number;
    prompts: number;
    /**
     * Ce que le programme seul ouvre, et ce que le complément ajoute.
     *
     * ⚠️ Annoncer `lessons` à un acheteur du programme serait faux : sept
     * modules du parcours sont réservés au complément. Servis par l'app depuis
     * le 28/08/2026, donc optionnels tant que l'instantané de secours date
     * d'avant.
     */
    lessonsProgramme?: number;
    lessonsComplement?: number;
    /** Ce que l'inscription gratuite ouvre (deux modules depuis le 29/08/2026). */
    lessonsGratuit?: number;
    minutesGratuit?: number;
    heuresProgramme?: string;
    heuresComplement?: string;
    lessonsConstruire: number;
    heures: string;
    exercices: number;
    relectures: number;
    trophees: number;
    secrets: number;
  };
  etats: EtatJour[];
  jeu: {
    rangs: Record<RankKey, string>;
    metaux: Record<Metal, string>;
    trophees: Record<string, string>;
    mention: string;
    points: { lesson: number; submission: number; quiz: number; quiz_perfect_first: number };
    metalPoints: Record<Metal, number>;
    modulesADebloquer: Array<{ module_id: string; unlock_points: number }>;
  };
  craft: Record<string, string>;
  offres: Offre[];
  hausse: { date: string; ttc_minor: number; prix?: Partial<Record<Devise, number>> };
  /** Les devises proposées par l'app. Absente sur un instantané ancien. */
  devises?: Devise[];
  /**
   * La note publique et le nombre de retours, servis par l'app.
   *
   * Ils étaient écrits en dur six fois dans `copy.ts` : la note arbitrée par
   * Paul vit dans `temoignages.ts` côté app, et le site la lit comme il lit les
   * prix. Optionnelle : un instantané d'avant le 28/08/2026 ne la porte pas.
   */
  avis?: Avis;
  equipe: { paliers: Array<{ seats: number; discount: number }>; devisAPartirDe: number };
  temoignages: Array<{ logo?: string; societe: string; session: string; texte: string; auteur: string; note?: number }>;
  urls: { base: string; checkout: string; login: string; terms: string; privacy: string; legal: string };
}

export const ENDPOINT = 'https://academy.mydigipal.com/api/academy/public/jour30';

/** Les images de l'app copiées dans le site vivent sous /academy. */
export const ASSETS = '/academy';

/**
 * Remplace l'euro des libellés par le symbole de la devise consultée.
 *
 * Les textes de `copy.ts` portent le « € » en dur parce qu'ils datent d'avant
 * le multi-devises. Plutôt que de tripler chaque phrase, on substitue le seul
 * caractère qui change : ce n'est pas une traduction, c'est un symbole.
 */
export function enDevise(texte: string, devise: Devise): string {
  return devise === 'EUR' ? texte : texte.split('€').join(SYMBOLE[devise]);
}

/**
 * Les marques dont aucun verbatim, aucun logo et aucun nom ne doit paraître.
 *
 * Décision de Paul du 01/09/2026, après son call avec OnTrain : Kering et
 * Chanel sortent de la page de vente. Les trois autres sont des maisons du
 * GROUPE Kering, donc les garder n'aurait protégé de rien.
 *
 * ⚠️ Ce filtre est une CEINTURE, pas la source. La source est `temoignages.ts`
 * dans l'app, et c'est là qu'ils ont été retirés. Mais la page se construit en
 * lisant l'API en direct : sans ce filtre, l'ordre des deux déploiements
 * décidait de ce qui s'affichait, et un verbatim remis un jour dans l'app
 * reviendrait tout seul sur la page de vente.
 */
const MARQUES_INTERDITES = ['kering', 'chanel', 'gucci', 'saint laurent', 'balenciaga'];

/** Écarter les verbatims des marques interdites, quelle que soit leur source. */
export function temoignagesPublics<T extends { societe?: string; logo?: string }>(liste: T[]): T[] {
  return (liste || []).filter((t) => {
    const ou = `${t.societe || ''} ${t.logo || ''}`.toLowerCase();
    return !MARQUES_INTERDITES.some((m) => ou.includes(m));
  });
}

/**
 * Le repli de la preuve chiffrée, si l'instantané est ancien ou l'app injoignable.
 * La vérité vit dans l'app (`temoignages.ts`) : ne pas la corriger ici. chiffre-libre
 */
export const AVIS_REPLI: Avis = { note: 9.4, nombre: 497 };

/** La note telle qu'elle s'écrit dans la langue lue : 9,4 en français, 9.4 en anglais. */
export function noteLocale(note: number, locale: Locale): string {
  return note.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: 1 });
}

/**
 * Le nombre de leçons du PROGRAMME, celui qu'on annonce à qui paie 290 €.
 *
 * ⚠️ `faits.lessons` est le volume du parcours entier, complément inclus :
 * l'annoncer dans une offre serait faux. Le repli sert aux instantanés d'avant
 * le 28/08/2026, qui ne portent pas encore la ventilation.
 */
export function leconsProgramme(d: Jour30Data): number {
  return d.faits.lessonsProgramme ?? d.faits.lessons;
}

/** Ce que le complément ouvre en plus : les modules réservés et le parcours avancé. */
export function leconsComplement(d: Jour30Data): number {
  return d.faits.lessonsComplement ?? d.faits.lessonsConstruire;
}

/**
 * Les leçons offertes par l'inscription gratuite.
 *
 * Le repli vaut les deux modules ouverts le 29/08/2026 ; la vérité vient de
 * l'app, comme le reste. chiffre-libre
 */
export function leconsGratuit(d: Jour30Data): number {
  return d.faits.lessonsGratuit ?? 15;
}
