import { MODULES, type Module } from './modules';
import type { Locale } from '../academy/data';

/**
 * Le questionnaire de profil : quatre questions, six profils, et la grille des
 * modules qui se trie.
 *
 * Idée de Paul du 07/09/2026. Elle règle un vrai défaut de cette page : elle
 * consacrait 3,8 % de sa hauteur à décrire la formation, ce que Google lui
 * reproche aussi (`post_click_quality_score` BELOW_AVERAGE sur les vingt
 * mots-clés notés). Un questionnaire fait DÉCOUVRIR les modules au lieu de les
 * lister, et il mène au tunnel avec la composition déjà choisie.
 *
 * ⚠️ Module PUR : il ne connaît ni React ni le DOM. Les textes vivent ici avec
 * la logique parce qu'ils en sont indissociables - un profil sans sa phrase
 * n'est rien - mais aucun chiffre n'y est écrit à la main : les titres, les
 * paliers et les durées viennent de `modules.ts`.
 */

export type ProfilId = 'debut' | 'auto' | 'plume' | 'chiffre' | 'bati' | 'manage';

export interface Option {
  t: { fr: string; en: string };
  /** Ce que cette réponse ajoute à chaque profil. */
  p: Partial<Record<ProfilId, number>>;
  /** Présent sur la question des outils. `null` = « je ne sais pas », exclusif. */
  outil?: string | null;
}

export interface Question {
  q: { fr: string; en: string };
  multi: boolean;
  opts: Option[];
}

/**
 * ⚠️ Des POIDS, pas un arbre de décision. Un arbre à quatre niveaux demanderait
 * de décrire seize chemins à la main, et la première question ajoutée le
 * casserait. Avec des poids, une question de plus est une ligne de plus.
 *
 * ⚠️ La première question est à choix unique : on ne peut pas être à la fois
 * débutant et utilisateur quotidien. Les trois autres acceptent plusieurs
 * réponses (Paul, 08/09) - un métier est rarement d'une seule sorte.
 */
export const QUESTIONS: Question[] = [
  {
    q: { fr: "Aujourd’hui, avec l’IA, vous en êtes où ?", en: 'Where are you with AI today?' },
    multi: false,
    opts: [
      { t: { fr: "Je n’ai jamais vraiment essayé", en: 'I have never really tried' }, p: { debut: 3 } },
      { t: { fr: "J’essaie de temps en temps, sans méthode", en: 'I try now and then, with no method' }, p: { auto: 2, plume: 1 } },
      { t: { fr: "Je m’en sers tous les jours", en: 'I use it every day' }, p: { chiffre: 1, bati: 2, manage: 1 } },
    ],
  },
  {
    q: { fr: 'Quels outils avez-vous sous la main ?', en: 'Which tools do you have at hand?' },
    multi: true,
    opts: [
      { t: { fr: 'ChatGPT', en: 'ChatGPT' }, p: {}, outil: 'ChatGPT' },
      { t: { fr: 'Claude', en: 'Claude' }, p: { bati: 1 }, outil: 'Claude' },
      { t: { fr: 'Copilot, dans Microsoft 365', en: 'Copilot, in Microsoft 365' }, p: { chiffre: 1 }, outil: 'Copilot' },
      { t: { fr: 'Gemini, dans Google Workspace', en: 'Gemini, in Google Workspace' }, p: {}, outil: 'Gemini' },
      { t: { fr: 'Je ne sais pas encore', en: 'I do not know yet' }, p: { debut: 1 }, outil: null },
    ],
  },
  {
    q: { fr: 'Votre travail, c’est surtout…', en: 'Your work is mostly…' },
    multi: true,
    opts: [
      { t: { fr: 'Écrire : documents, messages, contenus', en: 'Writing: documents, messages, content' }, p: { plume: 3 } },
      { t: { fr: 'Des chiffres, des tableaux, du reporting', en: 'Numbers, spreadsheets, reporting' }, p: { chiffre: 3 } },
      { t: { fr: 'Des réunions, des clients, du suivi', en: 'Meetings, clients, follow-up' }, p: { plume: 1, bati: 1 } },
      { t: { fr: 'Faire tourner des processus, des outils', en: 'Running processes and tools' }, p: { bati: 3 } },
      { t: { fr: 'Encadrer une équipe', en: 'Leading a team' }, p: { manage: 3 } },
    ],
  },
  {
    q: { fr: 'Dans un mois, vous aimeriez quoi ?', en: 'A month from now, what would you like?' },
    multi: true,
    opts: [
      { t: { fr: 'Écrire vite et bien, sans y passer la soirée', en: 'To write fast and well, without losing the evening' }, p: { plume: 2, debut: 1 } },
      { t: { fr: 'Arrêter de refaire les mêmes tâches à la main', en: 'To stop redoing the same tasks by hand' }, p: { chiffre: 2, bati: 1 } },
      { t: { fr: 'Que des choses tournent sans moi', en: 'To have things run without me' }, p: { bati: 3 } },
      { t: { fr: 'Que mon équipe s’y mette pour de bon', en: 'To get my team on board for good' }, p: { manage: 3 } },
    ],
  },
];

export interface Profil {
  nom: { fr: string; en: string };
  sous: { fr: string; en: string };
  /** Par où l'on commence : quatre à six modules, en couleur et numérotés. */
  coeur: string[];
  /** Le peu qui ne concerne pas ce profil. Tout le reste est retenu. */
  ecarte: string[];
  pourquoi: { fr: string; en: string };
}

/**
 * ⚠️ Deux listes, et leur écart est tout le sujet. Paul, 08/09 : « je veux au
 * moins 70 % qui soient sélectionnés, pour donner envie aux gens d’acheter les
 * deux modules ». Donc `ecarte` est court, et tout ce qui n’y figure pas reste
 * visible : la sélection tient entre 75 et 90 % selon le profil.
 *
 * ⚠️ Sans le niveau intermédiaire il n’y a que deux mauvaises options : allumer
 * cinq modules, et laisser croire que le reste ne sert à rien ; ou tout
 * allumer, et montrer un test qui ne trie rien. Le troisième niveau garde les
 * deux, l’envie et la crédibilité.
 *
 * ⚠️ Cinq profils sur six mènent à la formule avancée, parce que leur cœur
 * contient au moins un module `pro`. Seul le grand débutant reste sur la
 * méthode : lui vendre les automatisations le jour où il n’a jamais ouvert
 * l’outil serait invendable, et se retournerait au remboursement. C’est aussi
 * ce qui rend les cinq autres recommandations crédibles - le test peut dire non.
 */
export const PROFILS: Record<ProfilId, Profil> = {
  debut: {
    nom: { fr: 'Le premier pas', en: 'The first step' },
    sous: {
      fr: 'Vous n’avez pas encore d’habitude à défaire. C’est le meilleur moment pour prendre la bonne, parce que la méthode s’installe avant les réflexes.',
      en: 'You have no habits to undo yet. That is the best moment to build the right ones, because method settles before reflexes do.',
    },
    coeur: ['M0', 'M1', 'M2', 'M4', 'M9'],
    ecarte: ['M20', 'M14', 'M15', 'M18', 'M7'],
    pourquoi: {
      fr: 'Vous commencez par les bases et le parcours de votre outil. Les automatisations viendront quand vous aurez pris le pli : elles n’ont pas de sens le premier jour.',
      en: 'You start with the basics and the path for your tool. Automations come once the habit is there: they make no sense on day one.',
    },
  },
  auto: {
    nom: { fr: 'L’autodidacte', en: 'The self-taught' },
    sous: {
      fr: 'Vous obtenez déjà des choses, mais au hasard : parfois excellent, souvent moyen, et vous ne savez pas dire pourquoi. C’est exactement ce que la méthode répare.',
      en: 'You already get results, but at random: sometimes excellent, often average, and you cannot say why. That is exactly what the method fixes.',
    },
    coeur: ['M2', 'M3', 'M9', 'M6', 'M14'],
    ecarte: ['M0', 'M18', 'M5'],
    pourquoi: {
      fr: 'La méthode règle la régularité de vos résultats, et les cas déjà montés des automatisations vous évitent de réinventer ce que d’autres ont déjà câblé.',
      en: 'The method makes your results consistent, and the ready-built cases in the automations save you from rewiring what others already have.',
    },
  },
  plume: {
    nom: { fr: 'La plume', en: 'The writer' },
    sous: {
      fr: 'Vous écrivez toute la journée, et c’est là que le temps part. Résumer pour décider, réécrire sans trahir, poser un plan avant un document long.',
      en: 'You write all day, and that is where the time goes. Summarising to decide, rewriting without betraying, outlining before a long document.',
    },
    coeur: ['M16', 'M2', 'M12', 'M19', 'M17'],
    ecarte: ['M0', 'M11', 'M20'],
    pourquoi: {
      fr: 'L’écrit tient dans la méthode, mais les comptes rendus de réunion et les présentations sont dans les automatisations : c’est là que le gros de vos heures se joue.',
      en: 'Writing sits in the method, but meeting notes and presentations are in the automations, and that is where most of your hours go.',
    },
  },
  chiffre: {
    nom: { fr: 'Le chiffreur', en: 'The number cruncher' },
    sous: {
      fr: 'Des tableaux, des exports, des rapprochements. C’est le domaine où l’IA fait gagner le plus de temps, et celui où une réponse fausse coûte le plus cher.',
      en: 'Spreadsheets, exports, reconciliations. It is where AI saves the most time, and where a wrong answer costs the most.',
    },
    coeur: ['M11', 'M2', 'M9', 'M14', 'M7'],
    ecarte: ['M0', 'M5', 'M19'],
    pourquoi: {
      fr: 'Les chiffres et les tableurs sont dans les automatisations, avec les chaînes qui vont chercher la donnée toutes seules. La méthode seule vous laisserait sans le module qui vous concerne le plus.',
      en: 'Numbers and spreadsheets are in the automations, together with the chains that fetch the data on their own. The method alone would leave out the module you need most.',
    },
  },
  bati: {
    nom: { fr: 'Le bâtisseur', en: 'The builder' },
    sous: {
      fr: 'Vous ne voulez pas d’un assistant à qui il faut tout redemander. Vous voulez que la chaîne tourne le lundi matin sans vous, avec un point d’arrêt là où il faut.',
      en: 'You do not want an assistant you must brief again every time. You want the chain to run on Monday morning without you, with a stop where it matters.',
    },
    coeur: ['M7', 'M20', 'M14', 'M15', 'M2'],
    ecarte: ['M0', 'M16'],
    pourquoi: {
      fr: 'Les agents, les serveurs MCP et les chaînes complètes sont le cœur des automatisations. La méthode seule vous laisserait à la porte.',
      en: 'Agents, MCP servers and the complete chains are the heart of the automations. The method alone would leave you at the door.',
    },
  },
  manage: {
    nom: { fr: 'Le meneur', en: 'The leader' },
    sous: {
      fr: 'Votre problème n’est pas d’apprendre : c’est que dix personnes s’y mettent, avec les mêmes règles, sans que vous relisiez tout.',
      en: 'Your problem is not learning: it is getting ten people going, under the same rules, without you proofreading everything.',
    },
    coeur: ['M18', 'M2', 'M10', 'M8', 'M6'],
    ecarte: ['M0', 'M5'],
    pourquoi: {
      fr: 'Encadrer une équipe, monter les cas d’un poste et poser les garde-fous sont dans les automatisations. C’est ce qui fait la différence entre dix personnes qui essaient et dix personnes qui produisent.',
      en: 'Leading a team, building the cases of a role and setting the guardrails are in the automations. That is the difference between ten people trying and ten people delivering.',
    },
  },
};

/**
 * Les modules tels qu'on les SUIT, donc les quatre parcours outils réunis en
 * un seul : personne n'en suit quatre. C'est la même règle que `nombreSuivi`,
 * qui fait dire « 16 modules » à la page.
 */
export const MODULES_SUIVIS: Module[] = (() => {
  const out: Module[] = [];
  let outilPose = false;
  for (const m of MODULES) {
    if (m.auChoix) {
      if (outilPose) continue;
      outilPose = true;
      out.push({
        ...m,
        id: 'M4',
        titre: { fr: 'Le parcours de votre outil', en: 'The path for your tool' },
        minutes: Math.round(
          MODULES.filter((x) => x.auChoix).reduce((s, x) => s + x.minutes, 0) /
            MODULES.filter((x) => x.auChoix).length
        ),
      });
      continue;
    }
    out.push(m);
  }
  return out;
})();

export interface Resultat {
  profil: ProfilId;
  coeur: string[];
  ecarte: Set<string>;
  /** Combien de modules restent concernés, sur le total suivi. */
  retenus: number;
  total: number;
  minutesCoeur: number;
  /** Vrai si le cœur contient un module des automatisations. */
  avance: boolean;
}

/** Le profil qui l'emporte, et ce que la grille doit montrer. */
export function resoudre(scores: Record<ProfilId, number>): Resultat {
  // ⚠️ À égalité, c'est l'ordre de PROFILS qui tranche, et il va du plus
  // prudent au plus engageant : on ne pousse pas vers la formule la plus chère
  // quand rien ne le justifie.
  const clefs = Object.keys(PROFILS) as ProfilId[];
  const profil = clefs.reduce((a, b) => (scores[b] > scores[a] ? b : a), clefs[0]);
  const p = PROFILS[profil];
  const ecarte = new Set(p.ecarte);
  const minutesCoeur = p.coeur.reduce(
    (s, id) => s + (MODULES_SUIVIS.find((m) => m.id === id)?.minutes ?? 0),
    0
  );
  return {
    profil,
    coeur: p.coeur,
    ecarte,
    retenus: MODULES_SUIVIS.length - ecarte.size,
    total: MODULES_SUIVIS.length,
    minutesCoeur,
    avance: p.coeur.some((id) => MODULES_SUIVIS.find((m) => m.id === id)?.palier === 'pro'),
  };
}

export function dureeCourte(minutes: number, locale: Locale): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return locale === 'fr' ? `${h} h ${String(m).padStart(2, '0')}` : `${h}h ${String(m).padStart(2, '0')}`;
}
