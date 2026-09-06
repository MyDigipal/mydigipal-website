// ============================================================
// Les seize moments du récit, et leur phase
// ============================================================
//
// Les textes sont repris de la page de vente en ligne (relevés le 06/09/2026).
// Les POINTS et le RANG ne sont pas écrits ici : ils viennent de `data.etats`,
// servi par l'application, et se lisent dans le même ordre que cette liste. Un
// barème recopié à la main finirait par contredire celui du produit.
//
// La répartition en trois phases suit les trois étapes du programme, et elle
// tombe juste : cinq moments pour Débuter, cinq pour Maîtriser, six pour Mettre
// en œuvre (le jour 30 compris, qui n'a pas de bloc dans la page actuelle mais
// porte l'attestation).

import type { EtapeId } from './modules';
import type { Jour30Data, Locale } from '../academy/data';
import type { Moment } from './Trajet';

const RECIT: Array<{ jour: number; phase: EtapeId; fr: string; en: string }> = [
  { jour: 1, phase: 'debuter',
    fr: 'Elle ouvre son compte. Paul l’accueille, en vidéo.',
    en: 'She opens her account. Paul welcomes her, on camera.' },
  { jour: 2, phase: 'debuter',
    fr: 'Elle apprend la méthode. Cinq champs, et la demande s’écrit toute seule.',
    en: 'She learns the method. Five fields, and the request writes itself.' },
  { jour: 3, phase: 'debuter',
    fr: 'Elle rend un exercice, sur ses propres données.',
    en: 'She hands in an exercise, on her own data.' },
  { jour: 6, phase: 'debuter',
    fr: 'Le quiz du module de prompting. Sans faute, du premier coup.',
    en: 'The prompting module quiz. Perfect score, first try.' },
  { jour: 9, phase: 'debuter',
    fr: 'Elle choisit son outil. Le parcours ne garde que celui-là.',
    en: 'She picks her tool. The path keeps only that one.' },

  { jour: 11, phase: 'maitriser',
    fr: 'Une question à 23 h. L’assistant répond, et cite la leçon.',
    en: 'A question at 11 pm. The assistant answers, and cites the lesson.' },
  { jour: 12, phase: 'maitriser',
    fr: 'Elle cesse d’écrire ses prompts de zéro. Puis elle en ajoute un.',
    en: 'She stops writing her prompts from scratch. Then she adds one.' },
  { jour: 14, phase: 'maitriser',
    fr: 'Cinq leçons dans la journée. Un trophée tombe qu’elle ne cherchait pas.',
    en: 'Five lessons in one day. A trophy drops that she was not looking for.' },
  { jour: 15, phase: 'maitriser',
    fr: 'On lui demande le visuel en trois formats. Pour hier.',
    en: 'She is asked for the visual in three formats. For yesterday.' },
  { jour: 18, phase: 'maitriser',
    fr: 'Elle branche son premier serveur. Il lit son agenda, et rien d’autre.',
    en: 'She plugs in her first server. It reads her calendar, and nothing else.' },

  { jour: 21, phase: 'agir',
    fr: 'Lundi, huit heures. Ses relances sont écrites. Elle les lit, elle envoie.',
    en: 'Monday, eight in the morning. Her follow-ups are written. She reads them, she sends.' },
  { jour: 22, phase: 'agir',
    fr: 'Trente minutes en visio. Préparé : il a lu ses exercices avant.',
    en: 'Thirty minutes on a call. Prepared: he read her exercises beforehand.' },
  { jour: 24, phase: 'agir',
    fr: 'Un agent surveille ses livraisons. Il agit dans son couloir, et demande le reste.',
    en: 'An agent watches her deliveries. It acts inside its lane, and asks for the rest.' },
  { jour: 26, phase: 'agir',
    fr: 'Elle monte son premier serveur MCP, et le branche sur son CRM.',
    en: 'She builds her first MCP server, and plugs it into her CRM.' },
  { jour: 28, phase: 'agir',
    fr: 'Elle compte. Pas une promesse : son relevé, sur sa semaine.',
    en: 'She counts. Not a promise: her own log, over her own week.' },
  { jour: 30, phase: 'agir',
    fr: 'L’attestation. Elle l’imprime et la pose sur le bureau de sa direction.',
    en: 'The certificate. She prints it and puts it on her director’s desk.' },
];

/**
 * Assemble les textes et le barème réel.
 *
 * ⚠️ `data.etats` peut être plus court que la liste si l'instantané de secours
 * date d'avant les deux quinzaines (onze états au lieu de seize) : on s'arrête
 * alors au plus court plutôt que d'afficher des points indéfinis.
 */
export function momentsDe(data: Jour30Data, locale: Locale): Moment[] {
  const n = Math.min(RECIT.length, data.etats.length);
  return RECIT.slice(0, n).map((r, i) => {
    const e = data.etats[i];
    return {
      jour: r.jour,
      texte: locale === 'fr' ? r.fr : r.en,
      phase: r.phase,
      points: e.points,
      rang: data.jeu.rangs[e.rank] ?? '',
    };
  });
}
