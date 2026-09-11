// ============================================================
// Les pages outils de l'AI Academy - les types partagés
// ============================================================
//
// Une page par outil et par langue : `/{lang}/academy/{outil}`. Ce sont des
// pages de VENTE de la formation, centrées sur un outil (décision de Paul du
// 11/09/2026) : on y apprend l'intelligence artificielle avec l'outil que la
// personne cherche, avec son vocabulaire et ses écrans. Ce ne sont ni des
// tutoriels gratuits, ni un second tunnel d'achat.
//
// Pourquoi elles existent : dans le compte Google Ads 377-338-1446, le
// `post_click_quality_score` était BELOW_AVERAGE sur 39 mots-clés sur 39,
// parce que les quatre groupes d'annonces outils pointaient tous sur la page
// de vente générale, où chaque outil est nommé quatre ou cinq fois dans une
// page de 237 Ko. Google demandait jusqu'à 8,00 £ la première page sur
// « formation microsoft copilot ».
//
// ⚠️ AUCUN CHIFFRE ne s'écrit dans ces fichiers : les prix, le nombre de
// leçons, les heures et la note viennent de l'application
// (`/api/academy/public/jour30`), lus au build puis relus dans le navigateur.
// Les textes qui ont besoin d'un nombre le reçoivent en argument.
//
// Module PUR : aucun accès réseau, importé par des composants client.

export type Locale = 'fr' | 'en';
export type OutilId = 'claude' | 'copilot' | 'chatgpt' | 'gemini';

/** Un repère posé sur la capture, en pourcentage de ses dimensions. */
export interface Point {
  /** Position horizontale, en pourcentage de la largeur de l'image. */
  x: number;
  /** Position verticale, en pourcentage de la hauteur de l'image. */
  y: number;
  titre: string;
  texte: string;
  /** Ce que la formation en fait. Toujours rattaché à une leçon réelle. */
  lecon: string;
}

export interface Ecran {
  id: string;
  /** Le libellé de l'onglet, et la phrase qui le décrit. */
  onglet: string;
  ongletTexte: string;
  /** Capture réelle de l'outil, servie depuis /academy/outils/<outil>/. */
  image: string;
  alt: string;
  /** Ce que le panneau dit tant qu'aucun repère n'est désigné. */
  repos: { titre: string; texte: string; lecon: string };
  points: Point[];
}

export interface Resultat {
  titre: string;
  texte: string;
}

export interface Question {
  q: string;
  /** Un paragraphe par entrée. */
  r: string[];
}

export interface CopyOutil {
  /** Les quatre reperes de la barre du haut. Courts : ils tiennent sur une ligne. */
  barre: { outil: string; lecons: string; programme: string; tarifs: string; cta: string };
  meta: {
    /** 37 à 47 caractères : BaseLayout ajoute « | MyDigipal », soit 13. */
    titre: string;
    /** 145 à 160 caractères. Le build échoue en dehors. */
    description: string;
  };
  hero: {
    kicker: string;
    /** L'unique H1 de la page. */
    titre: string;
    /** Le mot mis en valeur dans le H1, rendu en serif doré. */
    accent: string;
    sous: string;
    cta: (prix: string) => string;
    cta2: (lecons: number) => string;
    capture: string;
    note: (retours: number) => string;
    lecons: (dansOutil: number) => string;
    heures: string;
  };
  console: {
    kicker: string;
    titre: string;
    chapeau: string;
    indice: (n: number) => string;
    ecrans: Ecran[];
  };
  resultats: { kicker: string; titre: string; chapeau: string; items: Resultat[] };
  demo: {
    kicker: string;
    titre: string;
    chapeau: string;
    avantTete: string;
    avantPrompt: string;
    avantReponse: string;
    apresTete: string;
    apresPrompt: string;
    apresReponse: string;
    artefactTitre: string;
    artefactTexte: string;
    vous: string;
  };
  lecons: { kicker: string; titre: (n: number) => string; chapeau: string };
  franchise: {
    kicker: string;
    titre: string;
    chapeau: string;
    forcesTitre: string;
    forces: string[];
    limitesTitre: string;
    limites: string[];
    autresTitre: string;
    autresTexte: string;
    /** Le libellé du lien vers une autre page outil. */
    versOutil: (nom: string) => string;
    /** Affiché quand aucune autre page outil n'est encore publiée. */
    versProgramme: string;
  };
  programme: {
    kicker: string;
    titre: string;
    chapeau: string;
    auChoix: string;
    ici: string;
  };
  tarifs: {
    kicker: string;
    titre: string;
    texte: string;
    apres: string;
    formule: string;
    cta: string;
    lignes: (f: { lecons: number; heures: string; lecture: number; exercices: number; jours: number }) => string[];
    synchro: string;
  };
  faq: { kicker: string; titre: string; items: Question[] };
}

export interface Outil {
  id: OutilId;
  /** Le segment d'URL, identique dans les deux langues. */
  slug: string;
  /** Le nom commercial, pour les renvois entre pages. */
  nom: string;
  /** La clé du module dans `src/data/academy/lecons-outils.json`. */
  cleLecons: OutilId;
  /** Une page non publiée n'est ni générée, ni mise au sitemap, ni liée. */
  publie: boolean;
  /** La phrase qui la décrit depuis une autre page outil. */
  renvoi: Record<Locale, string>;
  copy: (locale: Locale) => CopyOutil;
}
