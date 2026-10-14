/**
 * Le moteur du simulateur de la formation IA : des fonctions PURES, sans interface. La page,
 * le simulateur et l'envoi du devis lisent tous `chiffrer()`, comme le calculateur lit
 * `devis()` dans `calculator-v6/engine.ts`. Tests : `npm run test:formation`.
 */
import { GRILLE, SYMBOLE, DEVISES, type Devise, type Duree, type Mode, type Zone, type PrixAcademy } from './grille.ts';

export type Lang = 'fr' | 'en';
export type Groupes = 'auto' | 'pleniere' | number;

export interface Etat {
  n: number;
  duree: Duree;
  mode: Mode;
  zone: Zone;
  hotel: boolean;
  groupes: Groupes;
  academy: boolean;
  devise: Devise;
}

export interface Ligne {
  cle: 'seances' | 'majoration' | 'remise' | 'deplacement' | 'academy';
  libelle: string;
  detail: string;
  /** null : sur devis (un déplacement hors d'Europe). */
  montant: number | null;
}

export interface Chiffrage {
  n: number;
  seances: number;
  groupes: number[];
  prixSeance: number;
  lignes: Ligne[];
  total: number;
  parPersonne: number;
  surDevis: boolean;
  academyUnitaire: number;
  devise: Devise;
}

const T = (lang: Lang, fr: string, en: string) => (lang === 'fr' ? fr : en);

export const ZONES: Record<Zone, { fr: string; en: string }> = {
  londres: { fr: 'Londres', en: 'London' },
  uk: { fr: 'Royaume-Uni, hors Londres', en: 'UK, outside London' },
  paris: { fr: 'Paris', en: 'Paris' },
  france: { fr: 'France et pays voisins', en: 'France and neighbouring countries' },
  europe: { fr: 'Reste de l’Europe', en: 'Rest of Europe' },
  monde: { fr: 'Hors d’Europe', en: 'Outside Europe' },
};

/** La devise par défaut : euros en français, dollars en anglais (livres au Royaume-Uni, côté navigateur). */
export function etatDefaut(lang: Lang): Etat {
  return { n: 12, duree: '3h', mode: 'distance', zone: lang === 'fr' ? 'paris' : 'londres', hotel: false, groupes: 'auto', academy: false, devise: lang === 'fr' ? 'EUR' : 'USD' };
}

/** n personnes en k groupes aussi égaux que possible, les plus grands d'abord. */
export function decoupe(n: number, k: number): number[] {
  const base = Math.floor(n / k);
  const reste = n % k;
  return Array.from({ length: k }, (_, i) => base + (i < reste ? 1 : 0));
}

const palier = <P extends { des: number; taux: number }>(table: readonly P[], x: number): P | undefined => table.find((p) => x >= p.des);

/** Le prix d'entreprise de l'Academy, hors taxes, par personne. */
export function academyHT(prix: PrixAcademy, devise: Devise, n: number, avecFormation: boolean): number {
  const a = GRILLE.academy;
  const ht = prix[devise] / (1 + a.tva[devise]);
  const equipe = palier(a.paliers, n)?.taux ?? 0;
  return ht * (1 - (avecFormation ? Math.max(a.avecFormation, equipe) : equipe));
}

/** Le nombre de séances : proposé (groupes de 15 au plus), tous ensemble, ou choisi. */
function nombreDeSeances(e: Etat, n: number): number {
  if (e.groupes === 'pleniere') return 1;
  if (typeof e.groupes === 'number') return Math.max(1, Math.min(n, Math.round(e.groupes)));
  return Math.ceil(n / GRILLE.groupeIdeal[1]);
}

export function chiffrer(e: Etat, prixAcademy: PrixAcademy, lang: Lang = 'fr'): Chiffrage {
  const dv = e.devise;
  const m = (v: number) => montant(v, lang, dv);
  const n = Math.max(1, Math.round(e.n));
  const seances = nombreDeSeances(e, n);
  const groupes = decoupe(n, seances);
  const prixSeance = GRILLE.durees[e.duree][e.mode][dv];
  const lignes: Ligne[] = [];
  const mot = (k: number, un: [string, string], plusieurs: [string, string]) => (k > 1 ? T(lang, ...plusieurs) : T(lang, ...un));

  const brut = seances * prixSeance;
  const quoi = e.duree === '3h' ? 'de 3 h' : 'à la journée';
  const ou = e.mode === 'site' ? T(lang, 'en présentiel', 'on-site') : T(lang, 'à distance', 'remote');
  lignes.push({
    cle: 'seances',
    libelle: lang === 'fr'
      ? `${seances} ${seances > 1 ? 'séances' : 'séance'} ${quoi} ${ou}`
      : `${seances} ${ou} ${seances > 1 ? 'sessions' : 'session'}${e.duree === '3h' ? ' of 3 hours' : ', full day'}`,
    detail:
      seances > 1
        ? T(lang, `${seances} x ${m(prixSeance)}, groupes de ${resume(groupes)}`, `${seances} x ${m(prixSeance)}, groups of ${resume(groupes, 'en')}`)
        : `${n} ${mot(n, ['personne', 'person'], ['personnes', 'people'])}`,
    montant: brut,
  });

  // La majoration porte sur chaque séance selon sa propre taille.
  let majo = 0;
  let cleMajo: 'webinaire' | 'grand-groupe' | null = null;
  for (const t of groupes) {
    const p = palier(GRILLE.majorations, t);
    if (p) { majo += prixSeance * p.taux; cleMajo = cleMajo === 'webinaire' ? cleMajo : p.cle; }
  }
  if (majo && cleMajo) {
    const p = GRILLE.majorations.find((x) => x.cle === cleMajo)!;
    const pct = Math.round(p.taux * 100);
    lignes.push({
      cle: 'majoration',
      libelle: cleMajo === 'webinaire' ? T(lang, `Format webinaire (+${pct} %)`, `Webinar format (+${pct}%)`) : T(lang, `Grand groupe (+${pct} %)`, `Large group (+${pct}%)`),
      detail: cleMajo === 'webinaire'
        ? T(lang, 'au-delà de 50 personnes, la séance devient un webinaire', 'beyond 50 people, the session becomes a webinar')
        : T(lang, 'de 21 à 50 personnes dans une séance', '21 to 50 people in one session'),
      montant: majo,
    });
  }

  const tauxRemise = palier(GRILLE.remises, seances)?.taux ?? 0;
  if (tauxRemise) {
    const pct = Math.round(tauxRemise * 100);
    lignes.push({
      cle: 'remise',
      libelle: T(lang, `Remise de volume (-${pct} %)`, `Volume discount (-${pct}%)`),
      detail: T(lang, `${seances} séances`, `${seances} sessions`),
      montant: -(brut + majo) * tauxRemise,
    });
  }

  let deplacement = 0;
  let surDevis = false;
  if (e.mode === 'site') {
    const trajet = GRILLE.deplacement.zones[e.zone];
    const jours = Math.ceil(seances / GRILLE.deplacement.seancesParJour[e.duree]);
    const nomZone = ZONES[e.zone][lang];
    if (trajet == null) {
      surDevis = true;
      lignes.push({ cle: 'deplacement', libelle: T(lang, 'Déplacement', 'Travel'), detail: T(lang, `${nomZone} : chiffré à la demande`, `${nomZone}: quoted on request`), montant: null });
    } else {
      const trajets = e.hotel ? 1 : jours;
      const nuits = e.hotel ? jours : 0;
      deplacement = trajets * trajet[dv] + nuits * GRILLE.deplacement.hotel[dv];
      const morceaux = [
        `${jours} ${mot(jours, ['jour sur place', 'day on site'], ['jours sur place', 'days on site'])}`,
        trajet[dv] ? `${trajets} ${mot(trajets, ['aller-retour', 'return trip'], ['allers-retours', 'return trips'])}` : '',
        nuits ? `${nuits} ${mot(nuits, ["nuit d'hôtel", 'hotel night'], ["nuits d'hôtel", 'hotel nights'])}` : '',
      ].filter(Boolean);
      lignes.push({
        cle: 'deplacement',
        libelle: deplacement === 0 ? T(lang, `Déplacement, ${nomZone} : compris`, `Travel, ${nomZone}: included`) : T(lang, `Déplacement, ${nomZone}`, `Travel, ${nomZone}`),
        detail: morceaux.join(', '),
        montant: deplacement,
      });
    }
  }

  let academy = 0;
  let academyUnitaire = 0;
  if (e.academy) {
    academyUnitaire = academyHT(prixAcademy, dv, n, true);
    academy = academyUnitaire * n;
    const pct = Math.round(GRILLE.academy.avecFormation * 100);
    lignes.push({
      cle: 'academy',
      libelle: T(lang, `MyDigipal AI Academy, ${n} accès`, `MyDigipal AI Academy, ${n} ${n > 1 ? 'seats' : 'seat'}`),
      detail: T(lang, `${m(academyUnitaire)} HT par personne, -${pct} % avec la formation`, `${m(academyUnitaire)} excl. VAT per person, -${pct}% with the training`),
      montant: academy,
    });
  }

  const total = brut + majo + (tauxRemise ? -(brut + majo) * tauxRemise : 0) + deplacement + academy;
  return { n, seances, groupes, prixSeance, lignes, total, parPersonne: total / n, surDevis, academyUnitaire, devise: dv };
}

function resume(gr: number[], lang: Lang = 'fr'): string {
  const a = gr[0];
  const b = gr[gr.length - 1];
  return a === b ? `${a}` : lang === 'fr' ? `${b} à ${a}` : `${b} to ${a}`;
}

/** Une phrase quand elle aide à décider, sinon rien. Les comparaisons portent sur les séances seules. */
export function recommandation(e: Etat, prixAcademy: PrixAcademy, lang: Lang = 'fr'): string {
  const sansAcad = { ...e, academy: false };
  const r = chiffrer(sansAcad, prixAcademy, lang);
  const m = (v: number) => montant(v, lang, e.devise);
  if (e.groupes === 'pleniere' && r.n > 50) {
    return e.academy
      ? ''
      : T(lang, `Pour que chacun continue après le webinaire, l'Academy revient à ${m(academyHT(prixAcademy, e.devise, r.n, true))} HT par personne.`, `So everyone keeps going after the webinar, the Academy comes to ${m(academyHT(prixAcademy, e.devise, r.n, true))} per person, excl. VAT.`);
  }
  if (e.groupes === 'pleniere' && r.n > GRILLE.groupeIdeal[1]) {
    const alt = chiffrer({ ...sansAcad, groupes: 'auto' }, prixAcademy, lang);
    return T(lang, `En ${alt.seances} groupes de ${resume(alt.groupes)}, chacun travaille sur ses propres fichiers : ${m(alt.total)} au lieu de ${m(r.total)}.`, `In ${alt.seances} groups of ${resume(alt.groupes, 'en')}, everyone works on their own files: ${m(alt.total)} instead of ${m(r.total)}.`);
  }
  if (e.groupes !== 'pleniere' && r.seances >= 3) {
    const alt = chiffrer({ ...sansAcad, groupes: 'pleniere' }, prixAcademy, lang);
    return T(lang, `Une seule séance pour les ${r.n} coûterait ${m(alt.total)}, mais personne n'y serait suivi individuellement.`, `A single session for all ${r.n} would cost ${m(alt.total)}, but nobody would get individual attention.`);
  }
  if (r.n <= 3 && !e.academy) {
    const u = m(academyHT(prixAcademy, e.devise, r.n, false));
    return T(lang, `Pour ${r.n === 1 ? 'une personne' : r.n + ' personnes'}, l'Academy seule revient à ${u} HT par personne.`, `For ${r.n === 1 ? 'one person' : r.n + ' people'}, the Academy alone comes to ${u} per person, excl. VAT.`);
  }
  return '';
}

/**
 * Règle maison : 10 et plus sans décimale, de 1 à 10 une décimale, sous 1 deux, et jamais de
 * décimale ajoutée à un entier. En français le symbole suit, séparé par une espace fine
 * insécable (« 1 200 € ») ; en anglais il précède (« €1,200 »).
 */
export function montant(v: number | null, lang: Lang, devise: Devise): string {
  if (v == null) return T(lang, 'sur devis', 'on request');
  const a = Math.abs(v);
  const dec = a >= 10 ? 0 : a >= 1 ? 1 : 2;
  const r = Number(v.toFixed(dec));
  const decAff = dec && r % 1 === 0 ? 0 : dec;
  const s = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: decAff, maximumFractionDigits: decAff }).format(Math.abs(r));
  const signe = r < 0 ? '-' : '';
  return lang === 'fr' ? `${signe}${s} ${SYMBOLE[devise]}` : `${signe}${SYMBOLE[devise]}${s}`;
}

/* L'état dans l'adresse, lisible : un lien partagé rouvre exactement le même chiffrage, et une
   proposition commerciale peut ouvrir la page pré-réglée sur le cas d'un client. */
export function versAdresse(e: Etat): string {
  const p = new URLSearchParams({ n: String(e.n), d: e.duree, m: e.mode, g: String(e.groupes), a: e.academy ? '1' : '0', c: e.devise });
  if (e.mode === 'site') { p.set('z', e.zone); p.set('h', e.hotel ? '1' : '0'); }
  return 'chiffrage&' + p.toString();
}

export function depuisAdresse(hash: string, defaut: Etat): Etat | null {
  const brut = (hash || '').replace(/^#/, '');
  if (!brut.startsWith('chiffrage')) return null;
  const p = new URLSearchParams(brut.replace(/^chiffrage&?/, ''));
  const g = p.get('g') || '';
  const z = p.get('z') as Zone | null;
  const c = p.get('c') as Devise | null;
  return {
    n: Math.max(1, Math.min(2000, parseInt(p.get('n') || '', 10) || defaut.n)),
    duree: p.get('d') === 'jour' ? 'jour' : '3h',
    mode: p.get('m') === 'site' ? 'site' : 'distance',
    zone: z && z in ZONES ? z : defaut.zone,
    hotel: p.get('h') === '1',
    groupes: g === 'pleniere' ? 'pleniere' : /^\d+$/.test(g) ? parseInt(g, 10) : 'auto',
    academy: p.get('a') === '1',
    devise: c && DEVISES.includes(c) ? c : defaut.devise,
  };
}
