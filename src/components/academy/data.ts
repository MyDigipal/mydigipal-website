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

export interface Offre {
  id: string;
  kind: 'course' | 'upgrade' | 'subscription' | 'service';
  name: string;
  tagline: string;
  ttc_minor: number;
  monthly_questions: number | null;
  requires_course: boolean;
}

export interface Jour30Data {
  lang: Locale;
  generated_at: string;
  faits: {
    lessons: number;
    modules: number;
    minutes: number;
    prompts: number;
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
  hausse: { date: string; ttc_minor: number };
  equipe: { paliers: Array<{ seats: number; discount: number }>; devisAPartirDe: number };
  temoignages: Array<{ logo?: string; societe: string; session: string; texte: string; auteur: string; note?: number }>;
  urls: { base: string; checkout: string; login: string; terms: string; privacy: string; legal: string };
}

export const ENDPOINT = 'https://academy.mydigipal.com/api/academy/public/jour30';

/** Les images de l'app copiées dans le site vivent sous /academy. */
export const ASSETS = '/academy';
