/**
 * Le chiffrage d'une demande créative : des fonctions pures, lues par le simulateur de la page
 * Creative design et par ses tests (`npm run test:creative`). Les prix viennent de `grille.ts`.
 */
import { GRILLE_CREA, prixPalier, type Canal, type Devise, type Video } from './grille.ts';
import { montant, type Lang } from '../formation/moteur.ts';

export { montant };
export type { Lang };

export interface EtatCrea {
  /** Nombre de jeux de bannières (un par message). */
  jeux: number;
  canal: Canal;
  videos: number;
  duree: Video;
  /** Langues en plus de la première, pour chaque jeu. */
  langues: number;
  docs: number;
  storyboards: number;
  devise: Devise;
}

export interface LigneCrea { cle: string; libelle: string; detail: string; montant: number }
export interface ResultatCrea { lignes: LigneCrea[]; total: number; economie: number; prixJeu: number; prixVideo: number }

const T = (lang: Lang, fr: string, en: string) => (lang === 'fr' ? fr : en);
const r10 = (x: number) => Math.round(x / 10) * 10;
const borne = (x: number, max: number) => Math.max(0, Math.min(max, Math.round(Number(x) || 0)));

export const MAX = { jeux: 40, videos: 20, langues: 3, docs: 10, storyboards: 10 } as const;

export function etatDefaut(lang: Lang): EtatCrea {
  return { jeux: 3, canal: 'li', videos: 1, duree: 'v20', langues: 0, docs: 0, storyboards: 0, devise: lang === 'fr' ? 'EUR' : 'USD' };
}

export function contenuJeu(canal: Canal, lang: Lang): string {
  if (canal === 'li') return T(lang, '3 images : carré, paysage, vertical', '3 images: square, landscape, vertical');
  if (canal === 'pm') return T(lang, '3 images, vos logos et les tailles Display', '3 images, your logos and the Display sizes');
  return T(lang, 'Tous les formats LinkedIn et Google', 'Every LinkedIn and Google format');
}

export function nomCanal(canal: Canal, lang: Lang): string {
  if (canal === 'li') return 'LinkedIn';
  if (canal === 'pm') return 'Google';
  return T(lang, 'LinkedIn et Google', 'LinkedIn and Google');
}

export function chiffrer(e: EtatCrea, lang: Lang): ResultatCrea {
  const d = e.devise;
  const M = (v: number) => montant(v, lang, d);
  const lignes: LigneCrea[] = [];
  let economie = 0;

  const prixJeu = prixPalier(GRILLE_CREA.jeux[e.canal], e.jeux, d);
  const baseJeu = GRILLE_CREA.jeux[e.canal][0].prix[d];
  if (e.jeux > 0) {
    lignes.push({
      cle: 'jeux',
      libelle: T(lang, `${e.jeux} jeu${e.jeux > 1 ? 'x' : ''} de bannières ${nomCanal(e.canal, lang)}`, `${e.jeux} ${nomCanal(e.canal, lang)} banner set${e.jeux > 1 ? 's' : ''}`),
      detail: `${e.jeux} x ${M(prixJeu)}${prixJeu < baseJeu ? T(lang, ', prix de volume', ', volume price') : ''} · ${contenuJeu(e.canal, lang)}`,
      montant: e.jeux * prixJeu,
    });
    economie += e.jeux * (baseJeu - prixJeu);
    if (e.langues > 0) {
      const sup = r10(e.jeux * prixJeu * GRILLE_CREA.langue) * e.langues;
      lignes.push({
        cle: 'langues',
        libelle: T(lang, `${e.langues} langue${e.langues > 1 ? 's' : ''} en plus`, `${e.langues} extra language${e.langues > 1 ? 's' : ''}`),
        detail: T(lang, 'Mêmes visuels, texte traduit et relu, +30 %', 'Same visuals, text translated and checked, +30%'),
        montant: sup,
      });
    }
  }

  const prixVideo = prixPalier(GRILLE_CREA.videos[e.duree], e.videos, d);
  const baseVideo = GRILLE_CREA.videos[e.duree][0].prix[d];
  if (e.videos > 0) {
    const duree = e.duree === 'v20' ? T(lang, '15 à 20 s', '15 to 20 s') : T(lang, '20 à 30 s', '20 to 30 s');
    lignes.push({
      cle: 'videos',
      libelle: T(lang, `${e.videos} vidéo${e.videos > 1 ? 's' : ''} de ${duree}`, `${e.videos} video${e.videos > 1 ? 's' : ''}, ${duree}`),
      detail: `${e.videos} x ${M(prixVideo)}${prixVideo < baseVideo ? T(lang, ', prix de volume', ', volume price') : ''} · ${T(lang, 'script et motion design, en 16:9, 1:1 et 9:16', 'script and motion design, in 16:9, 1:1 and 9:16')}`,
      montant: e.videos * prixVideo,
    });
    economie += e.videos * (baseVideo - prixVideo);
  }

  if (e.docs > 0) {
    lignes.push({
      cle: 'docs',
      libelle: T(lang, `${e.docs} document ad${e.docs > 1 ? 's' : ''}`, `${e.docs} document ad${e.docs > 1 ? 's' : ''}`),
      detail: T(lang, '5 à 8 pages, 1080 x 1080, PDF', '5 to 8 pages, 1080 x 1080, PDF'),
      montant: e.docs * GRILLE_CREA.documentAd[d],
    });
  }
  if (e.storyboards > 0) {
    lignes.push({
      cle: 'storyboards',
      libelle: T(lang, `${e.storyboards} storyboard${e.storyboards > 1 ? 's' : ''} seul${e.storyboards > 1 ? 's' : ''}`, `${e.storyboards} storyboard${e.storyboards > 1 ? 's' : ''} only`),
      detail: T(lang, 'Scènes, script et textes à l’écran, pour votre équipe', 'Scenes, script and on-screen text, for your team'),
      montant: e.storyboards * GRILLE_CREA.storyboard[d],
    });
  }

  return { lignes, total: lignes.reduce((s, l) => s + l.montant, 0), economie, prixJeu, prixVideo };
}

/* L'état dans l'adresse, lisible : un lien partagé rouvre exactement le même chiffrage. */
export function versAdresse(e: EtatCrea): string {
  const p = new URLSearchParams({ j: String(e.jeux), k: e.canal, v: String(e.videos), d: e.duree, l: String(e.langues), doc: String(e.docs), sb: String(e.storyboards), c: e.devise });
  return `devis&${p.toString()}`;
}

export function depuisAdresse(hash: string, defaut: EtatCrea): EtatCrea | null {
  const h = hash.replace(/^#/, '');
  if (!h.startsWith('devis')) return null;
  const p = new URLSearchParams(h.slice('devis'.length).replace(/^&/, ''));
  const k = p.get('k'), d = p.get('d'), c = p.get('c');
  return {
    jeux: p.has('j') ? borne(Number(p.get('j')), MAX.jeux) : defaut.jeux,
    canal: k === 'li' || k === 'pm' || k === 'both' ? k : defaut.canal,
    videos: p.has('v') ? borne(Number(p.get('v')), MAX.videos) : defaut.videos,
    duree: d === 'v20' || d === 'v30' ? d : defaut.duree,
    langues: p.has('l') ? borne(Number(p.get('l')), MAX.langues) : defaut.langues,
    docs: p.has('doc') ? borne(Number(p.get('doc')), MAX.docs) : defaut.docs,
    storyboards: p.has('sb') ? borne(Number(p.get('sb')), MAX.storyboards) : defaut.storyboards,
    devise: c === 'EUR' || c === 'GBP' || c === 'USD' ? c : defaut.devise,
  };
}
