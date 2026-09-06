// ============================================================
// Les textes de la page de vente v2
// ============================================================
//
// ⚠️ Aucun fait chiffré n'est écrit ici. Les leçons, les minutes, les prix, la
// note et le nombre de retours viennent du JSON de l'application
// (`/api/academy/public/jour30`) et sont passés en argument. C'est la règle du
// 28/08/2026 : un fait chiffré, une source. `npm run check:chiffres` échoue si
// un nombre est écrit à la main dans une copie.

export type Locale = 'fr' | 'en';

const FR = {
  meta: {
    titre: 'Formation IA en ligne : le programme complet',
    description:
      'Le programme de la formation IA MyDigipal, module par module : la méthode de prompting, votre outil, les automatisations et les serveurs MCP. Deux modules offerts.',
  },
  barre: {
    programme: 'Le programme',
    pratique: 'La pratique',
    trajet: 'Le trajet',
    tarifs: 'Les tarifs',
    cta: 'Commencer',
    exProgramme: (lecons: number, modules: number, heures: string) =>
      `${lecons} leçons, ${modules} modules, ${heures}. Ce que vous apprenez, et ce que chaque module vous fait produire.`,
    exPratique: (exercices: number) =>
      `L'atelier, ${exercices} exercices sur vos dossiers, les quiz. On écrit, on rend, on se fait corriger.`,
    exTrajet: 'Trente jours dans un compte, jour après jour, jusqu’à l’attestation.',
    exTarifs: (prix: string) =>
      `${prix} pour 30 jours, l'assistant compris. Les automatisations en complément.`,
  },
  hero: {
    kicker: 'Formation IA en ligne',
    titre: 'Apprendre à travailler avec l’IA, en trente jours.',
    sous: (lecons: number, heures: string) =>
      `${lecons} leçons, ${heures} de formation. La méthode d’abord, votre outil ensuite, puis les automatisations qui tournent sans vous. Née de trois ans d’ateliers chez La Poste, Pierre Fabre et La Redoute.`,
    cta: (prix: string) => `Commencer — ${prix}`,
    cta2: (lecons: number) => `${lecons} leçons offertes`,
    faitLecons: 'leçons',
    faitPrompts: 'prompts prêts',
    faitExercices: 'exercices',
    faitNote: (retours: number) => `sur ${retours} retours`,
  },
  programme: {
    kicker: 'Le programme',
    titre: 'Ce que vous apprenez, module par module',
    chapeau: (modules: number, heures: string) =>
      `Trois étapes, ${modules} modules, ${heures}. Vous choisissez un outil et le parcours ne garde que celui-là.`,
    auChoix: 'un au choix',
    vide: 'Survolez un module pour voir ce qu’il contient. Cliquez pour le garder à l’écran.',
    videTactile: 'Touchez un module pour voir ce qu’il contient.',
    deLecons: 'de leçons',
    voirEcran: 'Voir l’écran',
    fermer: 'Fermer',
    paliers: {
      free: 'Offert',
      essentials: 'Compris',
      pro: 'Automatisations',
    },
    paliersLong: {
      free: 'Offert, sans carte bancaire',
      essentials: 'Compris dans La méthode',
      pro: 'Avec Les automatisations',
    },
    pied: (lecons: number, minutes: number, modulesAuto: number) =>
      `Deux modules sont offerts, soit ${lecons} leçons et ${minutes} minutes, sans carte bancaire. ${modulesAuto} modules s’ouvrent avec Les automatisations.`,
  },
  pratique: {
    kicker: 'La pratique',
    titre: 'On n’apprend pas l’IA en lisant',
    chapeau:
      'Chaque leçon se termine par un « À vous ». Voici les trois écrans où l’on travaille vraiment. Cliquez sur l’un d’eux pour le voir en grand.',
    cartes: [
      {
        cle: 'atelier',
        num: '01',
        titre: 'Vous écrivez vos demandes',
        texte:
          'Les cinq champs de la méthode, et le prompt s’assemble sous vos yeux. On part d’un exemple complet, jamais d’une page blanche.',
      },
      {
        cle: 'quiz',
        num: '02',
        titre: 'Vous vérifiez ce qui est resté',
        texte:
          'Un quiz par module, corrigé côté serveur, avec le renvoi vers la leçon quand vous vous trompez.',
      },
      {
        cle: 'cas',
        num: '03',
        titre: 'Vous partez d’un cas réel',
        texte:
          'Une bibliothèque de cas montés pas à pas, avec le prompt, la chaîne d’outils et le résultat obtenu.',
      },
    ],
    lire: 'Voir en grand',
    fermer: 'Fermer',
  },
  trajet: {
    kicker: 'La démonstration',
    titre: 'Trente jours dans un compte',
    chapeau:
      'Clara Martin est une apprenante composée. Son compte se remplit selon le barème réel du produit. Ouvrez une phase pour voir ce qu’elle fait, jour après jour.',
    pointsAuBout: 'points au bout',
    moments: (n: number) => `${n} moments`,
    jour: (n: number) => `Jour ${n}`,
  },
  mcp: {
    kicker: 'Les automatisations',
    titre: 'Brancher l’IA sur vos outils',
    chapeau:
      'Un serveur MCP est une prise : il donne à l’assistant l’accès à un outil, et seulement ce que vous autorisez. Touchez un outil pour voir ce qu’il obtient exactement.',
    serveur: 'Votre serveur MCP',
    attente: 'Choisissez un outil ci-dessous',
    attenteDroit: 'il ne verra que ce que vous autorisez',
    rienDautre: 'rien d’autre',
    liaison: 'Celui que vous utilisez déjà. Le serveur ne change pas.',
    aide: 'Touchez un outil',
  },
  preuves: {
    kicker: 'Qui enseigne',
    titre: 'Une méthode née dans la salle',
    chapeau: (note: string, retours: number) =>
      `Trois ans d’ateliers en petit groupe chez La Poste, Pierre Fabre, La Redoute, E.Leclerc et GL Events. La note publique est de ${note} sur 10, sur ${retours} retours.`,
    casTitre: 'Trois formations, trois résultats',
    tousLesAvis: 'Tous les retours',
  },
  tarifs: {
    kicker: 'Les tarifs',
    titre: (prix: string) => `${prix} pour 30 jours`,
    chapeau: (hausse: string) =>
      `L’assistant IA est compris dans les deux formules. Au 1er octobre, le prix passe à ${hausse}.`,
    duree: 'pour 30 jours',
    methode: 'La méthode',
    methodeSous: 'Le parcours complet',
    auto: 'La méthode avancée',
    autoSous: 'Avec les automatisations',
    commencer: 'Commencer',
    licences: 'Licences',
    places: (n: number) => `${n} licences`,
    parPlace: 'par licence',
    remiseEquipe: 'à partir de trois licences',
    devis: (n: number) =>
      `À partir de ${n} licences, on établit un devis : écrivez-nous et nous revenons sous deux jours ouvrés.`,
    survol: 'Survolez une ligne pour voir l’écran',
    survolTactile: 'Touchez une ligne pour voir l’écran',
    rappel: (lecons: number) =>
      `Les ${lecons} leçons offertes s’ouvrent sans carte bancaire, et l’assistant IA est compris dans les deux formules.`,
  },
};

const EN: typeof FR = {
  meta: {
    titre: 'Online AI course: the full programme',
    description:
      'The MyDigipal AI course programme, module by module: the prompting method, your tool, automations and MCP servers. Two modules free.',
  },
  barre: {
    programme: 'The programme',
    pratique: 'Practice',
    trajet: 'The path',
    tarifs: 'Pricing',
    cta: 'Get started',
    exProgramme: (lecons, modules, heures) =>
      `${lecons} lessons, ${modules} modules, ${heures}. What you learn, and what each module makes you produce.`,
    exPratique: (exercices) =>
      `The workshop, ${exercices} exercises on your own files, the quizzes. You write, you hand in, you get corrected.`,
    exTrajet: 'Thirty days inside an account, day by day, up to the certificate.',
    exTarifs: (prix) => `${prix} for 30 days, assistant included. Automations as an add-on.`,
  },
  hero: {
    kicker: 'Online AI course',
    titre: 'Learn to work with AI, in thirty days.',
    sous: (lecons, heures) =>
      `${lecons} lessons, ${heures} of training. The method first, then your tool, then the automations that run without you. Born from three years of workshops at La Poste, Pierre Fabre and La Redoute.`,
    cta: (prix) => `Get started — ${prix}`,
    cta2: (lecons) => `${lecons} free lessons`,
    faitLecons: 'lessons',
    faitPrompts: 'ready prompts',
    faitExercices: 'exercises',
    faitNote: (retours) => `across ${retours} reviews`,
  },
  programme: {
    kicker: 'The programme',
    titre: 'What you learn, module by module',
    chapeau: (modules, heures) =>
      `Three stages, ${modules} modules, ${heures}. You pick one tool and the path keeps only that one.`,
    auChoix: 'one of four',
    vide: 'Hover a module to see what it holds. Click to keep it on screen.',
    videTactile: 'Touch a module to see what it holds.',
    deLecons: 'of lessons',
    voirEcran: 'See the screen',
    fermer: 'Close',
    paliers: { free: 'Free', essentials: 'Included', pro: 'Automations' },
    paliersLong: {
      free: 'Free, no card needed',
      essentials: 'Included in The method',
      pro: 'With Automations',
    },
    pied: (lecons, minutes, modulesAuto) =>
      `Two modules are free, that is ${lecons} lessons and ${minutes} minutes, no card needed. ${modulesAuto} modules open with Automations.`,
  },
  pratique: {
    kicker: 'Practice',
    titre: 'You do not learn AI by reading',
    chapeau:
      'Every lesson ends with a “Your turn”. Here are the three screens where the real work happens. Click one to see it full size.',
    cartes: [
      {
        cle: 'atelier',
        num: '01',
        titre: 'You write your own requests',
        texte:
          'The five fields of the method, and the prompt assembles in front of you. You start from a complete example, never a blank page.',
      },
      {
        cle: 'quiz',
        num: '02',
        titre: 'You check what stuck',
        texte:
          'One quiz per module, marked server-side, with a link back to the lesson when you get it wrong.',
      },
      {
        cle: 'cas',
        num: '03',
        titre: 'You start from a real case',
        texte:
          'A library of cases built step by step, with the prompt, the chain of tools and the result.',
      },
    ],
    lire: 'See full size',
    fermer: 'Close',
  },
  trajet: {
    kicker: 'The demonstration',
    titre: 'Thirty days inside an account',
    chapeau:
      'Clara Martin is a composite learner. Her account fills up on the product’s real scale. Open a stage to see what she does, day by day.',
    pointsAuBout: 'points by the end',
    moments: (n) => `${n} moments`,
    jour: (n) => `Day ${n}`,
  },
  mcp: {
    kicker: 'Automations',
    titre: 'Plug AI into your tools',
    chapeau:
      'An MCP server is a socket: it gives the assistant access to one tool, and only what you allow. Touch a tool to see exactly what it gets.',
    serveur: 'Your MCP server',
    attente: 'Pick a tool below',
    attenteDroit: 'it will only see what you allow',
    rienDautre: 'nothing else',
    liaison: 'The one you already use. The server does not change.',
    aide: 'Touch a tool',
  },
  preuves: {
    kicker: 'Who teaches',
    titre: 'A method born in the room',
    chapeau: (note, retours) =>
      `Three years of small-group workshops at La Poste, Pierre Fabre, La Redoute, E.Leclerc and GL Events. The public score is ${note} out of 10, across ${retours} reviews.`,
    casTitre: 'Three sessions, three outcomes',
    tousLesAvis: 'All reviews',
  },
  tarifs: {
    kicker: 'Pricing',
    titre: (prix) => `${prix} for 30 days`,
    chapeau: (hausse) =>
      `The AI assistant is included in both. On 1 October, the price rises to ${hausse}.`,
    duree: 'for 30 days',
    methode: 'The method',
    methodeSous: 'The full path',
    auto: 'The advanced method',
    autoSous: 'With automations',
    commencer: 'Get started',
    licences: 'Licences',
    places: (n) => `${n} licences`,
    parPlace: 'per licence',
    remiseEquipe: 'from three licences',
    devis: (n) =>
      `From ${n} licences we prepare a quote: write to us and we come back within two working days.`,
    survol: 'Hover a line to see the screen',
    survolTactile: 'Touch a line to see the screen',
    rappel: (lecons) =>
      `The ${lecons} free lessons open without a card, and the AI assistant is included in both.`,
  },
};

export function copyV2(locale: Locale) {
  return locale === 'fr' ? FR : EN;
}
