/**
 * LA grille de prix des formations IA en direct : une seule source pour la page AI Training,
 * son simulateur, et (à la bascule) le calculateur et l'accueil. Aucun prix de formation ne
 * s'écrit ailleurs.
 *
 * Décisions de Paul du 14/10/2026 (pilotage : docs/ai-training-refonte/index.html) :
 * - deux durées, une séance de 3 h ou une journée, à distance ou en présentiel ;
 * - les prix sont fixés dans chaque devise, jamais convertis au taux du jour ; ils viennent
 *   d'une étude des concurrents (milieu de marché, sous les offres comparables) ;
 * - 10 à 15 personnes, c'est l'idéal ; majoration de 21 à 50, puis un format webinaire ;
 * - les remises de volume de l'ancienne grille sont gardées ;
 * - les parcours techniques coûtent le double de l'ancienne grille ;
 * - l'Academy se vend hors taxes aux entreprises, à -30 % pour chaque salarié d'un client
 *   qui réserve une formation (et pour ses entreprises partenaires).
 *
 * Validé par Paul le 14/10/2026 au soir : le barème du déplacement par destination, +50 % pour
 * une séance de plus de 50 personnes (format webinaire), les -30 % de l'Academy avec TOUTE
 * formation (à distance comprise), et les livres par défaut aux anglophones du Royaume-Uni.
 */

export type Devise = 'EUR' | 'GBP' | 'USD';
export type Duree = '3h' | 'jour';
export type Mode = 'distance' | 'site';
export type Zone = 'londres' | 'uk' | 'paris' | 'france' | 'europe' | 'monde';

export const DEVISES: Devise[] = ['EUR', 'GBP', 'USD'];
export const SYMBOLE: Record<Devise, string> = { EUR: '€', GBP: '£', USD: '$' };

type ParDevise = Record<Devise, number>;

export const GRILLE = {
  durees: {
    '3h': { distance: { EUR: 1200, GBP: 990, USD: 1490 }, site: { EUR: 1400, GBP: 1190, USD: 1790 } },
    jour: { distance: { EUR: 2100, GBP: 1790, USD: 2690 }, site: { EUR: 2500, GBP: 2150, USD: 3190 } },
  } satisfies Record<Duree, Record<Mode, ParDevise>>,

  /** L'idéal pour un atelier : le découpage proposé vise des groupes de 15 au plus. */
  groupeIdeal: [10, 15] as const,
  /** Le groupe de référence du prix par personne affiché sur la page. */
  groupeReference: 12,

  /** Majoration d'une séance selon son effectif, du plus grand seuil au plus petit. */
  majorations: [
    { des: 51, taux: 0.5, cle: 'webinaire' },
    { des: 21, taux: 0.15, cle: 'grand-groupe' },
  ] as const,

  /** Remise selon le nombre de séances du programme, formats mélangés. */
  remises: [
    { des: 8, taux: 0.2 },
    { des: 5, taux: 0.15 },
    { des: 3, taux: 0.1 },
    { des: 2, taux: 0.05 },
  ] as const,

  /** Le déplacement depuis Londres : un aller-retour par destination, plus les nuits d'hôtel. */
  deplacement: {
    zones: {
      londres: { EUR: 0, GBP: 0, USD: 0 },
      uk: { EUR: 250, GBP: 220, USD: 290 },
      paris: { EUR: 350, GBP: 300, USD: 400 },
      france: { EUR: 550, GBP: 480, USD: 640 },
      europe: { EUR: 750, GBP: 650, USD: 870 },
      monde: null,
    } satisfies Record<Zone, ParDevise | null>,
    hotel: { EUR: 180, GBP: 160, USD: 210 } satisfies ParDevise,
    /** Deux séances de 3 h tiennent dans une journée sur place ; une journée, une seule. */
    seancesParJour: { '3h': 2, jour: 1 } satisfies Record<Duree, number>,
  },

  /** Les parcours techniques, sur devis, « à partir de » (le double de l'ancienne grille). */
  parcours: {
    automatisations: { EUR: 3000, GBP: 2600, USD: 3500 },
    mcp: { EUR: 7000, GBP: 6000, USD: 8100 },
    data: { EUR: 4400, GBP: 3800, USD: 5100 },
  } satisfies Record<string, ParDevise>,

  /**
   * L'Academy : ses prix publics viennent de l'API (TTC). La TVA à retirer pour un prix
   * d'entreprise : 20 % en euros et en livres, aucune en dollars.
   */
  academy: {
    tva: { EUR: 0.2, GBP: 0.2, USD: 0 } satisfies ParDevise,
    /** Remises d'équipe de l'API, quand l'Academy est achetée seule. */
    paliers: [
      { des: 10, taux: 0.25 },
      { des: 5, taux: 0.15 },
      { des: 3, taux: 0.1 },
    ] as const,
    /** Avec une formation réservée : remplace la remise d'équipe, toujours plus faible. */
    avecFormation: 0.3,
  },
} as const;

/** Les prix publics TTC de l'Academy (méthode), en unités majeures, lus dans l'API. */
export type PrixAcademy = ParDevise;
/** Le repli de l'instantané du 14/10/2026, si l'API ne répond pas au build. chiffre-libre */
export const ACADEMY_REPLI: PrixAcademy = { EUR: 290, GBP: 250, USD: 340 };
