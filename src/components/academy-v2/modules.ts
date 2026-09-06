// ============================================================
// Le programme, tel qu'il est en base
// ============================================================
//
// Relevé en production le 06/09/2026 par
// `GET /api/academy/admin/content?what=courses` puis `?what=module&id=` depuis
// une session admin. Les titres, l'ordre, les paliers et les durées viennent de
// là, JAMAIS des sources de `MyDigipal Admin/AI training/contenu/`, qui sont
// périmées : elles annonçaient M16 en payant alors qu'il est offert, et
// plaçaient M17 et M18 au mauvais endroit.
//
// ⚠️ Deux parcours se vendent, et la page doit montrer les deux. « La méthode »
// (290 €) et « Les automatisations » (+190 €). L'étape « Mettre en œuvre »
// rassemble la fin du premier et la totalité du second : c'est là que vivent les
// agents, les serveurs MCP et les chaînes, donc c'est l'étape qui porte la
// promesse la plus forte. Une version antérieure de cette page n'y mettait que
// deux modules et n'y parlait pas du MCP (retour de Paul, 06/09).
//
// Module PUR : aucun accès réseau, importé par des composants client.

import type { Glyphe } from './Glyphe';

export type Palier = 'free' | 'essentials' | 'pro';
export type EtapeId = 'debuter' | 'maitriser' | 'agir';

export interface Module {
  id: string;
  titre: { fr: string; en: string };
  /** Ce que le module contient, pour le panneau. */
  texte: { fr: string; en: string };
  glyphe: Glyphe;
  teinte: string;
  etape: EtapeId;
  palier: Palier;
  minutes: number;
  /** Un seul des quatre modules outils est retenu par l'apprenant. */
  auChoix?: boolean;
  /** Vient du parcours « Les automatisations » et non de « La méthode ». */
  parcoursAvance?: boolean;
  /** Nom du fichier de démonstration dans /academy/demos/, quand il y en a une. */
  demo?: string;
}

export const MODULES: Module[] = [
  // ---------------------------------------------------------------- débuter
  {
    id: 'M0',
    titre: { fr: 'Bienvenue et diagnostic', en: 'Welcome and diagnostic' },
    texte: {
      fr: "Où vous en êtes, ce que vous voulez gagner, et comment le parcours se lit. Le diagnostic de départ, auquel on revient à la fin pour mesurer l'écart.",
      en: 'Where you stand, what you want to gain, and how the path reads. The opening diagnostic, which you come back to at the end to measure the gap.',
    },
    glyphe: 'door', teinte: '#1d6b4f', etape: 'debuter', palier: 'free', minutes: 38,
  },
  {
    id: 'M1',
    titre: { fr: "Comprendre l'IA générative", en: 'Understanding generative AI' },
    texte: {
      fr: 'Ce que la machine fait quand elle répond. Le vocabulaire, les limites, et pourquoi elle se trompe avec assurance.',
      en: 'What the machine actually does when it answers. The vocabulary, the limits, and why it gets things wrong with confidence.',
    },
    glyphe: 'brain', teinte: '#2f5d8a', etape: 'debuter', palier: 'essentials', minutes: 65,
  },
  {
    id: 'M2',
    // Paul, 06/09 : « la méthode CRAFT » ne dit rien à qui arrive sur la page.
    // Le nom du module en base ne change pas, seul le libellé de vente change.
    titre: { fr: 'La méthode de prompting', en: 'The prompting method' },
    texte: {
      fr: "Les cinq pièces d'une demande qui marche : contexte, rôle, action, format, ton. Le module le plus long du parcours, avec l'atelier où on l'écrit.",
      en: 'The five parts of a request that works: context, role, action, format, tone. The longest module of the path, with the workshop where you write it.',
    },
    glyphe: 'craft', teinte: '#a8862f', etape: 'debuter', palier: 'essentials', minutes: 97,
    demo: 'atelier',
  },
  {
    id: 'M4A',
    titre: { fr: 'Microsoft Copilot', en: 'Microsoft Copilot' },
    texte: {
      fr: 'Copilot dans Word, Excel, Outlook et Teams. Les écrans, ce qu’il voit de vos fichiers, et ce qu’il ne sait pas faire.',
      en: 'Copilot inside Word, Excel, Outlook and Teams. The screens, what it sees of your files, and what it cannot do.',
    },
    glyphe: 'tool_office', teinte: '#3a4a6b', etape: 'debuter', palier: 'essentials',
    minutes: 49, auChoix: true,
  },
  {
    id: 'M4B',
    titre: { fr: 'Google Gemini', en: 'Google Gemini' },
    texte: {
      fr: 'Gemini dans Docs, Sheets et Gmail, le carnet de recherche, et les Gems que vous configurez une fois.',
      en: 'Gemini inside Docs, Sheets and Gmail, the research notebook, and the Gems you set up once.',
    },
    glyphe: 'tool_suite', teinte: '#1f6d72', etape: 'debuter', palier: 'essentials',
    minutes: 45, auChoix: true,
  },
  {
    id: 'M4C',
    titre: { fr: 'Claude', en: 'Claude' },
    texte: {
      fr: 'Les projets, les fichiers longs, les connecteurs, et les tâches planifiées qui tournent sans vous. Le plus fourni des quatre.',
      en: 'Projects, long files, connectors, and scheduled tasks that run without you. The most substantial of the four.',
    },
    glyphe: 'tool_doc', teinte: '#8a4b2a', etape: 'debuter', palier: 'essentials',
    minutes: 75, auChoix: true,
  },
  {
    id: 'M4D',
    titre: { fr: 'ChatGPT', en: 'ChatGPT' },
    texte: {
      fr: 'Les conversations, les GPT sur mesure, les fichiers joints, et la recherche. L’outil le plus répandu, pris au sérieux.',
      en: 'Conversations, custom GPTs, attached files, and search. The most widespread tool, taken seriously.',
    },
    glyphe: 'tool_chat', teinte: '#2b6b5e', etape: 'debuter', palier: 'essentials',
    minutes: 40, auChoix: true,
  },

  // -------------------------------------------------------------- maîtriser
  {
    id: 'M3',
    titre: { fr: 'Prompting avancé', en: 'Advanced prompting' },
    texte: {
      fr: 'Faire produire un plan avant le texte, découper une tâche longue, reprendre une réponse qui rate.',
      en: 'Get a plan before the text, break down a long task, recover an answer that missed.',
    },
    glyphe: 'layers', teinte: '#5b4a7a', etape: 'maitriser', palier: 'essentials', minutes: 57,
  },
  {
    id: 'M9',
    titre: { fr: 'Juger une réponse', en: 'Judging an answer' },
    texte: {
      fr: 'Reconnaître ce qui est faux, vérifier une source, et savoir quand une réponse ne se corrige pas.',
      en: 'Spot what is wrong, check a source, and know when an answer cannot be salvaged.',
    },
    glyphe: 'scale', teinte: '#2f5d8a', etape: 'maitriser', palier: 'essentials', minutes: 36,
  },
  {
    id: 'M10',
    titre: { fr: "Vos données et le cadre d'usage", en: 'Your data and the rules of use' },
    texte: {
      fr: "Ce qui ne sort pas de l'entreprise, ce qu'on peut coller dans une conversation, et la règle qu'on écrit pour l'équipe.",
      en: 'What never leaves the company, what you can paste into a conversation, and the rule you write for the team.',
    },
    glyphe: 'shield', teinte: '#1d6b4f', etape: 'maitriser', palier: 'essentials', minutes: 36,
  },
  {
    id: 'M16',
    titre: { fr: 'Écrire, traduire, résumer', en: 'Writing, translating, summarising' },
    texte: {
      fr: 'Le plan avant le document long, le résumé qui sert à décider, la réécriture qui garde le sens. Offert avec le premier module.',
      en: 'The outline before the long document, the summary that helps decide, the rewrite that keeps the meaning. Free with the first module.',
    },
    glyphe: 'pen', teinte: '#2b6b5e', etape: 'maitriser', palier: 'free', minutes: 37,
  },
  {
    id: 'M5',
    titre: { fr: 'Au-delà du texte : image, vidéo, audio', en: 'Beyond text: image, video, audio' },
    texte: {
      fr: "Ce qu'on produit soi-même, ce qu'on confie encore à un professionnel, et le visuel décliné en trois formats.",
      en: 'What you produce yourself, what still goes to a professional, and one visual in three formats.',
    },
    glyphe: 'image', teinte: '#8a3550', etape: 'maitriser', palier: 'pro', minutes: 53,
  },
  {
    id: 'M6',
    titre: { fr: "Cas d'usage métier", en: 'Business use cases' },
    texte: {
      fr: 'Les cas de votre poste, montés pas à pas, avec le prompt et le résultat obtenu.',
      en: 'The cases of your own job, built step by step, with the prompt and the result.',
    },
    glyphe: 'briefcase', teinte: '#7a5b1e', etape: 'maitriser', palier: 'pro', minutes: 56,
    demo: 'cas',
  },
  {
    id: 'M11',
    titre: { fr: 'Les chiffres et les tableurs', en: 'Figures and spreadsheets' },
    texte: {
      fr: "Faire lire un tableau, produire une formule, vérifier un calcul qu'on ne referait pas à la main.",
      en: 'Have a table read, produce a formula, check a calculation you would not redo by hand.',
    },
    glyphe: 'grid', teinte: '#1f6d72', etape: 'maitriser', palier: 'pro', minutes: 56,
  },
  {
    id: 'M12',
    titre: { fr: 'Réunions, comptes rendus et messages', en: 'Meetings, minutes and messages' },
    texte: {
      fr: 'Du transcript au compte rendu, du compte rendu aux tâches, et les messages qui suivent.',
      en: 'From transcript to minutes, from minutes to tasks, and the messages that follow.',
    },
    glyphe: 'report', teinte: '#5b4a7a', etape: 'maitriser', palier: 'pro', minutes: 54,
  },
  {
    id: 'M17',
    titre: { fr: 'Recherche et veille sérieuses', en: 'Serious research and monitoring' },
    texte: {
      fr: "Chercher sans se faire raconter d'histoires, recouper deux sources, monter une veille qui tient dans la durée.",
      en: 'Search without being told stories, cross-check two sources, set up monitoring that lasts.',
    },
    glyphe: 'radar', teinte: '#3a4a6b', etape: 'maitriser', palier: 'essentials', minutes: 25,
  },
  {
    id: 'M19',
    titre: { fr: 'Présenter et convaincre', en: 'Presenting and convincing' },
    texte: {
      fr: "L'argumentaire, la présentation, et la note d'une page qui porte la décision.",
      en: 'The argument, the deck, and the one-page note that carries the decision.',
    },
    glyphe: 'podium', teinte: '#a8862f', etape: 'maitriser', palier: 'pro', minutes: 25,
  },

  // ---------------------------------------------------------- mettre en œuvre
  {
    id: 'M7',
    titre: { fr: 'Agents et automatisations', en: 'Agents and automations' },
    texte: {
      fr: "Ce qu'est un agent, ce qu'on lui délègue, où on l'arrête. Puis un premier flux monté deux fois : en tâche planifiée, puis dans n8n.",
      en: 'What an agent is, what you delegate to it, where you stop it. Then a first flow built twice: as a scheduled task, then in n8n.',
    },
    glyphe: 'robot', teinte: '#6b5344', etape: 'agir', palier: 'pro', minutes: 49,
    parcoursAvance: true,
  },
  {
    id: 'M20',
    titre: { fr: 'Monter sa base MCP', en: 'Building your MCP base' },
    texte: {
      fr: "Les trois façons d'avoir sa prise : les connecteurs, n8n, ou une passerelle maison. Le montage pas à pas, les clés, les comptes, et le test en trois temps.",
      en: 'The three ways to get your socket: connectors, n8n, or your own gateway. The build step by step, the keys, the accounts, and the three-stage test.',
    },
    glyphe: 'plug', teinte: '#1f6d72', etape: 'agir', palier: 'pro', minutes: 43,
    parcoursAvance: true, demo: 'avance',
  },
  {
    id: 'M14',
    titre: { fr: "Cas d'usage avancés", en: 'Advanced use cases' },
    texte: {
      fr: 'Dix-neuf chaînes complètes, du rendez-vous à la proposition, de la facture à la relance. Chacune avec son montage et son point d’arrêt humain.',
      en: 'Nineteen complete chains, from the call to the proposal, from the invoice to the follow-up. Each with its build and its human stop.',
    },
    glyphe: 'chain', teinte: '#7a5b1e', etape: 'agir', palier: 'pro', minutes: 84,
    parcoursAvance: true,
  },
  {
    id: 'M15',
    titre: { fr: 'Le socle : faire durer', en: 'The foundation: making it last' },
    texte: {
      fr: 'Les comptes de machine, le coffre à secrets, le dépôt qui garde vos versions. Ce qui fait qu’une automatisation tient encore dans six mois.',
      en: 'Machine accounts, the secrets vault, the repository that keeps your versions. What makes an automation still work in six months.',
    },
    glyphe: 'foundation', teinte: '#3f5a34', etape: 'agir', palier: 'pro', minutes: 64,
    parcoursAvance: true,
  },
  {
    id: 'M18',
    titre: { fr: "Manager une équipe qui utilise l'IA", en: 'Managing a team that uses AI' },
    texte: {
      fr: "La règle d'équipe, ce qu'on autorise, ce qu'on relit, et comment on suit sans surveiller.",
      en: 'The team rule, what you allow, what you review, and how to follow without watching over shoulders.',
    },
    glyphe: 'team', teinte: '#8a3550', etape: 'agir', palier: 'pro', minutes: 32,
  },
  {
    id: 'M8',
    titre: { fr: "Passer à l'action", en: 'Putting it to work' },
    texte: {
      fr: 'Choisir les trois usages qui comptent pour vous, les installer dans la semaine, et mesurer ce qu’ils rendent.',
      en: 'Pick the three uses that matter to you, install them within the week, and measure what they give back.',
    },
    glyphe: 'flag', teinte: '#3f5a34', etape: 'agir', palier: 'essentials', minutes: 32,
  },
];

export interface Etape {
  id: EtapeId;
  titre: { fr: string; en: string };
  jours: { fr: string; en: string };
  chapeau: { fr: string; en: string };
}

export const ETAPES: Etape[] = [
  {
    id: 'debuter',
    titre: { fr: 'Débuter', en: 'Getting started' },
    jours: { fr: 'Jours 1 à 9', en: 'Days 1 to 9' },
    chapeau: {
      fr: "Comprendre ce qu'on manipule, apprendre la méthode, et ouvrir l'outil que vous avez déjà.",
      en: 'Understand what you are handling, learn the method, and open the tool you already have.',
    },
  },
  {
    id: 'maitriser',
    titre: { fr: 'Maîtriser', en: 'Getting good' },
    jours: { fr: 'Jours 10 à 20', en: 'Days 10 to 20' },
    chapeau: {
      fr: 'Aller plus loin dans la demande, juger ce qui sort, protéger ses données, et faire son vrai travail avec.',
      en: 'Go further in the request, judge what comes out, protect your data, and do your real work with it.',
    },
  },
  {
    id: 'agir',
    titre: { fr: 'Mettre en œuvre', en: 'Putting it to work' },
    jours: { fr: 'Jours 21 à 30', en: 'Days 21 to 30' },
    chapeau: {
      fr: "Brancher l'IA sur vos outils avec un serveur MCP, monter des chaînes qui tournent sans vous, et cadrer l'équipe qui s'en sert.",
      en: 'Plug AI into your tools with an MCP server, build chains that run without you, and frame the team that uses them.',
    },
  },
];

/** Un seul module outil est retenu : la durée moyenne des quatre fait foi. */
export const MINUTES_OUTIL = Math.round(
  MODULES.filter((m) => m.auChoix).reduce((s, m) => s + m.minutes, 0) /
    MODULES.filter((m) => m.auChoix).length,
);

export function modulesDe(etape: EtapeId): Module[] {
  return MODULES.filter((m) => m.etape === etape);
}

/**
 * Minutes d'une étape. Les quatre modules outils comptent pour un seul, celui
 * que l'apprenant garde : les additionner ferait annoncer une durée que
 * personne ne suit.
 */
export function minutesDe(etape: EtapeId): number {
  const mods = modulesDe(etape);
  const fixes = mods.filter((m) => !m.auChoix).reduce((s, m) => s + m.minutes, 0);
  return fixes + (mods.some((m) => m.auChoix) ? MINUTES_OUTIL : 0);
}
