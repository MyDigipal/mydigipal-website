// ============================================================
// La page outil « Claude » - le contenu, en français et en anglais
// ============================================================
//
// L'anglais n'est pas une traduction du français : les deux marchés ne
// cherchent pas les mêmes mots. Le compte achète « formation claude anthropic »,
// « formation claude ia » et « cours claude ai » d'un côté, « claude ai course »,
// « claude ai training » et « learn claude ai » de l'autre. Le nom de l'éditeur,
// Anthropic, est acheté en français et doit donc figurer sur la page.
//
// ⚠️ Aucun nombre ici. Les leçons, les heures, les prix et la note arrivent en
// argument, lus dans l'application.

import type { Ecran, CopyOutil, Livrable, Locale, Outil } from './types';

const IMG = '/academy/outils/claude';

/* ---------------------------------------------------------------- écrans FR */

function ecransFr(): Ecran[] {
  return [
    {
      id: 'projets',
      onglet: 'Les projets',
      ongletTexte: "Le contexte que vous n'écrivez qu'une fois, et que Claude garde.",
      image: `${IMG}/projet-ouvert.png`,
      alt: 'Un projet Claude ouvert, avec ses instructions, sa mémoire, son contexte et ses tâches programmées',
      repos: {
        titre: 'Le contexte, écrit une fois',
        texte:
          "Un projet garde vos documents, vos instructions et ce que Claude a retenu de vous. Vous ne réexpliquez plus qui vous êtes ni ce que vous vendez à chaque conversation.",
        lecon: 'Leçon 2 : les projets Claude, contexte et mémoire.',
      },
      points: [
        {
          x: 66,
          y: 16,
          titre: 'Instructions',
          texte:
            "Le comportement que Claude garde d'une conversation à l'autre : votre ton, vos interdits, ce qu'il doit toujours demander avant de répondre.",
          lecon: 'Leçon 2 : on les écrit ensemble, sur votre vrai dossier.',
        },
        {
          x: 64,
          y: 30,
          titre: 'Mémoire',
          texte:
            "Ce qu'il a retenu de vous au fil des conversations. La leçon montre comment la lire, la corriger, et la couper quand elle n'a rien à faire là.",
          lecon: "Leçon 2 : la mémoire, et le jour où il vaut mieux la vider.",
        },
        {
          x: 78,
          y: 61,
          titre: 'Contexte',
          texte:
            "Vos PDF et vos documents de référence, déposés une fois pour toutes. C'est ce qui permet de travailler sur soixante pages sans les recoller à chaque question.",
          lecon: 'Leçon 4 : produire un document et une synthèse soignée.',
        },
        {
          x: 65,
          y: 79,
          titre: 'Programmé',
          texte:
            'Une tâche qui se répète, attachée au projet. Le bilan du vendredi part avec le contexte du dossier, pas à vide.',
          lecon: 'Leçon 1 : choisir la bonne porte selon le travail.',
        },
        {
          x: 17,
          y: 24,
          titre: 'Chat ou Cowork',
          texte:
            "Deux façons de travailler : la conversation, ou l'espace où Claude produit à côté de vous. La leçon dit laquelle prendre selon ce que vous rendez.",
          lecon: "Leçon 3 : les artefacts, ce que Claude produit à l'écran.",
        },
      ],
    },
    {
      id: 'connecteurs',
      onglet: 'Les connecteurs',
      ongletTexte: 'Drive, Gmail, Microsoft 365, Slack, Notion, branchés sur la conversation.',
      image: `${IMG}/repertoire-connecteurs.png`,
      alt: 'Le répertoire des connecteurs de Claude : Google Drive, Gmail, Microsoft 365, Slack, Notion, HubSpot',
      repos: {
        titre: 'Brancher Claude sur vos outils',
        texte:
          "Drive, Gmail, Microsoft 365, Slack, Notion, HubSpot. Claude va chercher l'information là où elle est, au lieu que vous la copiiez dans la conversation.",
        lecon: "Étape 3 : c'est la porte d'entrée des serveurs MCP et des automatisations.",
      },
      points: [
        {
          x: 46,
          y: 40,
          titre: 'Google Drive, déjà branché',
          texte:
            "Une fois autorisé, Claude cherche et lit vos fichiers sans que vous les téléversiez. La coche verte dit que la connexion est active.",
          lecon: "Leçon 1 : ce que chaque porte sait faire, et ce qu'elle voit.",
        },
        {
          x: 8,
          y: 66,
          titre: 'Microsoft 365',
          texte:
            "SharePoint, OneDrive, Outlook et Teams, accessibles depuis Claude. C'est ce qui permet de garder Claude même quand l'entreprise vit dans la suite Microsoft.",
          lecon: "Module « Vos données et le cadre d'usage » : avant de brancher quoi que ce soit.",
        },
        {
          x: 86,
          y: 30,
          titre: 'Le répertoire complet',
          texte:
            "Plus de deux mille connecteurs, et aucune raison d'en faire le tour. La formation apprend à juger si un connecteur mérite l'accès qu'il demande.",
          lecon: "Étape 3 : les serveurs MCP, et celui qu'on construit soi-même.",
        },
      ],
    },
    {
      id: 'taches',
      onglet: 'Les tâches planifiées',
      ongletTexte: 'Ce qui tourne sans vous, le matin ou le vendredi soir.',
      image: `${IMG}/taches-planifiees.png`,
      alt: 'Les tâches planifiées de Claude : briefing quotidien, triage de la boîte de réception, bilan hebdomadaire',
      repos: {
        titre: 'Ce qui tourne sans vous',
        texte:
          "Une tâche part à heure fixe, lit ce qu'il faut, et vous rend le résultat. C'est le premier pas vers les automatisations, et il ne demande aucun code.",
        lecon: 'Leçon 1 : quelle porte pour quel travail.',
      },
      points: [
        {
          x: 87,
          y: 3,
          titre: 'Nouvelle tâche',
          texte:
            "Deux façons de la créer : en la décrivant à Claude, ou en réglant vous-même la fréquence et le contenu. La leçon montre les deux et dit quand chacune sert.",
          lecon: 'Leçon 1 : où vit Claude, et lequel choisir.',
        },
        {
          x: 66,
          y: 79,
          titre: 'Bilan hebdomadaire',
          texte:
            'Tous les vendredis à seize heures, un résumé de la semaine écoulée. Le genre de tâche que personne ne fait à la main deux semaines de suite.',
          lecon: "Étape 3 : la même idée, appliquée à un vrai processus d'équipe.",
        },
        {
          x: 69,
          y: 64,
          titre: 'Triage de la boîte',
          texte:
            'Catégoriser ce qui arrive et préparer les réponses urgentes. À lire avec le module sur les données : ce que vous laissez lire compte autant que le résultat.',
          lecon: 'Module « Réunions, comptes rendus et messages ».',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------- écrans EN */

function ecransEn(): Ecran[] {
  return [
    {
      id: 'projets',
      onglet: 'Projects',
      ongletTexte: 'The context you write once, and Claude keeps.',
      image: `${IMG}/projet-ouvert.png`,
      alt: 'A Claude project open, showing instructions, memory, context and scheduled tasks',
      repos: {
        titre: 'Context, written once',
        texte:
          'A project holds your documents, your instructions and what Claude has learned about you. You stop explaining who you are and what you sell at the start of every conversation.',
        lecon: 'Lesson 2: Claude Projects, context and memory.',
      },
      points: [
        {
          x: 66,
          y: 16,
          titre: 'Instructions',
          texte:
            'The behaviour Claude keeps from one conversation to the next: your tone, your no-go areas, what it must always ask before answering.',
          lecon: 'Lesson 2: you write them during the lesson, on your own account.',
        },
        {
          x: 64,
          y: 30,
          titre: 'Memory',
          texte:
            'What it has retained about you over time. The lesson shows how to read it, correct it, and switch it off when it has no business being there.',
          lecon: 'Lesson 2: memory, and the day you are better off clearing it.',
        },
        {
          x: 78,
          y: 61,
          titre: 'Context',
          texte:
            'Your PDFs and reference documents, dropped in once. This is what lets you work across sixty pages without pasting them back into every question.',
          lecon: 'Lesson 4: producing a document and a polished synthesis.',
        },
        {
          x: 65,
          y: 79,
          titre: 'Scheduled',
          texte:
            'A recurring task attached to the project. The Friday summary runs with the file already in hand, not from nothing.',
          lecon: 'Lesson 1: choosing the right door for the job.',
        },
        {
          x: 17,
          y: 24,
          titre: 'Chat or Cowork',
          texte:
            'Two ways of working: the conversation, or the space where Claude builds next to you. The lesson says which to pick for what you have to deliver.',
          lecon: 'Lesson 3: artifacts, what Claude produces on screen.',
        },
      ],
    },
    {
      id: 'connecteurs',
      onglet: 'Connectors',
      ongletTexte: 'Drive, Gmail, Microsoft 365, Slack and Notion, wired into the conversation.',
      image: `${IMG}/repertoire-connecteurs.png`,
      alt: 'The Claude connector directory: Google Drive, Gmail, Microsoft 365, Slack, Notion, HubSpot',
      repos: {
        titre: 'Wiring Claude into your tools',
        texte:
          'Drive, Gmail, Microsoft 365, Slack, Notion, HubSpot. Claude goes and finds the information where it lives, instead of you copying it into the chat.',
        lecon: 'Stage 3: this is the way in to MCP servers and automations.',
      },
      points: [
        {
          x: 46,
          y: 40,
          titre: 'Google Drive, already connected',
          texte:
            'Once authorised, Claude searches and reads your files without you uploading anything. The green tick means the connection is live.',
          lecon: 'Lesson 1: what each door can do, and what it can see.',
        },
        {
          x: 8,
          y: 66,
          titre: 'Microsoft 365',
          texte:
            'SharePoint, OneDrive, Outlook and Teams, reachable from Claude. This is what lets you keep Claude even when the company runs on Microsoft.',
          lecon: 'Module on data and rules of use: before you connect anything at all.',
        },
        {
          x: 86,
          y: 30,
          titre: 'The full directory',
          texte:
            'More than two thousand connectors, and no reason to work through them. The course teaches you to judge whether a connector deserves the access it asks for.',
          lecon: 'Stage 3: MCP servers, including the one you build yourself.',
        },
      ],
    },
    {
      id: 'taches',
      onglet: 'Scheduled tasks',
      ongletTexte: 'What runs without you, in the morning or on Friday evening.',
      image: `${IMG}/taches-planifiees.png`,
      alt: 'Claude scheduled tasks: daily briefing, inbox triage, weekly summary',
      repos: {
        titre: 'What runs without you',
        texte:
          'A task fires at a set time, reads what it needs, and hands you the result. It is the first step towards automation, and it takes no code at all.',
        lecon: 'Lesson 1: which door for which job.',
      },
      points: [
        {
          x: 87,
          y: 3,
          titre: 'New task',
          texte:
            'Two ways to create one: describe it to Claude, or set the schedule and the brief yourself. The lesson shows both and says when each one earns its place.',
          lecon: 'Lesson 1: where Claude lives, and which one to choose.',
        },
        {
          x: 66,
          y: 79,
          titre: 'Weekly summary',
          texte:
            'Every Friday at four, a recap of the week just gone. Exactly the kind of task nobody does by hand two weeks running.',
          lecon: 'Stage 3: the same idea, applied to a real team process.',
        },
        {
          x: 69,
          y: 64,
          titre: 'Inbox triage',
          texte:
            'Sorting what came in and drafting the urgent replies. Read it alongside the data module: what you let it read matters as much as the output.',
          lecon: 'Module on meetings, minutes and messages.',
        },
      ],
    },
  ];
}

/* ------------------------------------------------------- livrables (FR) */

/**
 * Ce qui a réellement été produit pendant la formaférence du 9 septembre 2026,
 * autour d'une PME fictive, l'Atelier Rivière. Les fichiers sont importés par
 * `scripts/import-livrables-academy.py`, qui en retire le nom du client et
 * neutralise la mention d'outil : ces mêmes documents serviront sur les pages
 * Copilot, ChatGPT et Gemini, et écrire le nom d'un autre outil dessus serait
 * faux.
 *
 * Français seulement pour l'instant. Un anglophone à qui l'on ouvre une réponse
 * à appel d'offres en français s'arrête à la première ligne.
 */
const LIVRABLES_FR: Livrable[] = [
  {
    fichier: '02-synthese',
    titre: 'Une note de préparation',
    texte:
      "Un rapport sectoriel de quarante-deux pages en entrée, une note de rendez-vous en sortie, avec la source de chaque chiffre.",
    cout: '42 pages lues, une note en cinq minutes',
  },
  {
    fichier: '03-presentation',
    titre: 'Un comité de direction',
    texte:
      'Des notes en vrac deviennent huit diapositives et trois décisions à prendre. Un chiffre inventé au passage, repéré à la relecture.',
    cout: 'des notes en vrac, huit diapositives',
  },
  {
    fichier: '04-dashboard',
    titre: 'Un tableau de bord mensuel',
    texte:
      "L'export comptable et l'export des devis, croisés en cinq chiffres qui tiennent sur un écran. Aucune saisie à la main.",
    cout: 'deux exports bruts, quinze minutes',
  },
  {
    fichier: '06-site',
    titre: 'Un site vitrine',
    texte:
      "Une page complète depuis une seule demande, puis ajustée en trois phrases. Ce que l'outil sait faire, et là où il s'arrête.",
    cout: 'une demande, trois retouches',
  },
  {
    fichier: '07-appel-offres',
    titre: "Une réponse à appel d'offres",
    texte:
      "Une recherche sur le donneur d'ordre, une autre dans vos propres dossiers, et un dossier de réponse. Avec une certification affirmée à tort, corrigée.",
    cout: 'deux recherches, un dossier complet',
  },
];

/* ------------------------------------------------------------------ copy FR */

const FR: CopyOutil = {
  barre: { outil: 'Claude', lecons: 'Le parcours', programme: 'Le programme', tarifs: 'Les tarifs', cta: 'Commencer' },
  meta: {
    titre: 'Formation Claude IA en ligne : le programme',
    description:
      "Formation Claude en ligne : la méthode de prompting, les projets et les connecteurs d'Anthropic, puis les automatisations. Un parcours entier sur Claude.",
  },
  hero: {
    kicker: 'Formation Claude - Anthropic',
    titre: "Formation Claude : apprendre l'IA avec l'outil d'",
    accent: 'Anthropic',
    sous:
      "La méthode de prompting d'abord, le parcours Claude ensuite, puis les automatisations. Cours en ligne, à votre rythme, en français.",
    cta: (prix) => `Commencer, ${prix}`,
    cta2: (lecons) => `${lecons} leçons offertes`,
    capture: 'claude.ai - un projet ouvert',
    note: (retours) => `sur ${retours} retours`,
    lecons: (dansOutil) => `leçons, dont ${dansOutil} sur Claude`,
    heures: "de lecture et d'exercices",
  },
  console: {
    kicker: 'Ce que vous apprenez à piloter',
    titre: 'Claude, écran par écran',
    chapeau:
      "Trois choses que presque personne n'utilise, et qui font la différence entre une conversation et un outil de travail.",
    indice: (n) => `${n} repères sur cet écran`,
    ecrans: ecransFr(),
  },
  livrables: {
    kicker: 'Des vrais documents',
    titre: 'Ce qui sort de la formation',
    chapeau:
      "Cinq documents produits pendant une session, devant la salle, à partir de la matière d'une entreprise. Ouvrez-les : c'est le genre de choses que vous rendrez.",
    ouvrir: 'Ouvrir le document',
    items: LIVRABLES_FR,
    filmsTitre: 'Et ce qui tourne sans personne',
    filmsChapeau:
      "Deux séquences filmées à l'écran, telles qu'elles se sont passées. C'est ce que la troisième étape du parcours apprend à monter.",
    films: [
      {
        fichier: '08-agent',
        titre: 'Un agent qui qualifie à 22 h 47',
        texte:
          "Une demande arrive le soir. L'agent la lit, la qualifie, cherche le contexte, et le mail part à 22 h 49.",
        duree: '34 s',
      },
      {
        fichier: '09-automatisation',
        titre: 'Une prospection du lundi au mercredi',
        texte:
          'La chaîne part le lundi à huit heures, relance, et rend la réponse obtenue le mercredi.',
        duree: '38 s',
      },
    ],
  },
  resultats: {
    kicker: 'À la sortie',
    titre: 'Ce que vous saurez produire avec Claude',
    chapeau: "Pas des connaissances sur l'IA. Des choses que vous rendez à quelqu'un.",
    items: [
      {
        titre: 'Une synthèse de soixante pages',
        texte:
          "Trois rapports déposés dans un projet, une note d'une page qui dit ce qui a changé et ce qu'il faut décider.",
      },
      {
        titre: 'Un tableau de bord lisible',
        texte:
          "Un export brut en entrée, un tableau de bord à l'écran en sortie, que vous ajustez en parlant.",
      },
      {
        titre: 'Une présentation montée',
        texte:
          "Le brief, le plan, puis les diapositives. Vous gardez la main sur l'argument, pas sur la mise en forme.",
      },
      {
        titre: 'Un projet client qui se souvient',
        texte:
          'Ses documents, son ton, ses contraintes. Vous ouvrez, vous demandez, il sait déjà de quoi vous parlez.',
      },
      {
        titre: 'Une veille du vendredi',
        texte:
          'Une tâche planifiée qui lit, trie et vous rend un bilan pendant que vous faites autre chose.',
      },
      {
        titre: 'Le bon outil, au bon moment',
        texte:
          'Une méthode de choix entre Claude, ChatGPT, Copilot et Gemini, qui ne se périme pas à la prochaine sortie.',
      },
    ],
  },
  demo: {
    kicker: 'La méthode, appliquée à Claude',
    titre: 'La même demande, écrite deux fois',
    chapeau:
      "Ce que la formation change tient dans cet écart. Cinq pièces à poser dans la demande : le contexte, le rôle, l'action, le format, le ton.",
    avantTete: 'Ce que la plupart des gens écrivent',
    avantPrompt: 'Résume-moi ces documents.',
    avantReponse:
      "Voici un résumé des documents fournis. Le premier présente les résultats du trimestre, le deuxième détaille les actions menées, le troisième revient sur les objectifs annuels. Dans l'ensemble, la performance est contrastée et plusieurs leviers pourraient être activés.",
    apresTete: 'La même, une fois la méthode apprise',
    apresPrompt:
      "Tu es analyste dans une agence marketing. Dans ce projet, tu as les trois rapports trimestriels de notre client.\n\nCompare-les et sors les trois écarts qui changent la décision du comité. Format : une note d'une page, un tableau des écarts chiffrés, puis ce que tu recommandes.\n\nTon direct, pas de superlatifs. Si un chiffre manque, dis-le au lieu de l'estimer.",
    apresReponse:
      "Trois écarts changent la décision du comité. Le premier est chiffré et daté, les deux autres reposent sur une donnée manquante que je signale plutôt que de l'estimer.",
    artefactTitre: 'Note au comité - T1 à T3',
    artefactTexte:
      "Une page, un tableau des écarts, trois recommandations. Posée à côté de la conversation, prête à envoyer.",
    vous: 'Vous',
  },
  lecons: {
    kicker: 'Le parcours Claude',
    titre: (n) => `Les ${n} leçons du module`,
    chapeau:
      'Elles arrivent après la méthode de prompting, et avant les automatisations. Vous choisissez un outil, et le parcours ne garde que celui-là.',
  },
  franchise: {
    kicker: 'Honnêtement',
    titre: "Ce que Claude fait mieux, et là où il coince",
    chapeau: "Une formation qui ne dit que du bien de son outil ne sert à rien le jour où l'outil coince.",
    forcesTitre: 'Là où il est devant',
    forces: [
      'Les documents longs : soixante pages lues sans perdre le fil du début.',
      "Les artefacts : on repart avec un livrable, pas avec un bloc de texte à recopier.",
      "Les connecteurs et le MCP : c'est l'outil qui se branche le plus loin sur vos données.",
      'Le ton écrit : moins de superlatifs, moins de listes à puces involontaires.',
    ],
    limitesTitre: 'Là où il coince',
    limites: [
      "Il ne génère pas d'images. Pour un visuel, on passe ailleurs, et la formation le dit.",
      'Moins répandu en entreprise : votre service informatique connaît souvent mieux Copilot.',
      "La version gratuite s'arrête vite dès qu'on travaille sérieusement.",
      "Brancher un connecteur demande de comprendre ce qu'on autorise, et c'est une leçon en soi.",
    ],
    autresTitre: "Ce n'est peut-être pas votre outil",
    autresTexte:
      'Le parcours se choisit au quatrième module, et il se change. Si vous travaillez déjà toute la journée dans une autre suite, commencez par là.',
    versOutil: (nom) => `La formation ${nom}`,
    versProgramme: 'Voir le programme complet',
  },
  programme: {
    kicker: 'Le programme complet',
    titre: "Claude est une étape, pas la formation entière",
    chapeau:
      "Ce que vous achetez est une formation à l'intelligence artificielle au travail. Claude en est la porte d'entrée pratique.",
    auChoix: 'un au choix',
    ici: 'vous êtes ici',
  },
  tarifs: {
    kicker: 'Les tarifs',
    titre: "Une formation, deux mois d'accès",
    texte:
      "Le parcours complet, votre outil compris, l'assistant qui répond pendant que vous apprenez, et l'attestation à la fin. Rien n'est facturé au mois.",
    apres: 'Vous pourrez ajouter les automatisations plus tard, sans repayer ce que vous avez déjà.',
    formule: 'La méthode',
    cta: 'Commencer maintenant',
    lignes: (f) => [
      `${f.lecons} leçons, ${f.heures}`,
      `Le parcours Claude, ${f.lecture} leçons`,
      `${f.exercices} exercices relus`,
      `${f.jours} jours d'accès`,
    ],
    synchro: "montants lus dans l'application",
  },
  faq: {
    kicker: 'Questions',
    titre: 'Ce qu\'on nous demande sur la formation Claude',
    items: [
      {
        q: 'Faut-il un abonnement Claude payant pour suivre la formation ?',
        r: [
          "Non pour commencer. Les premières leçons se suivent avec la version gratuite d'Anthropic. Les projets, les connecteurs et les tâches planifiées demandent un abonnement chez Anthropic, que nous ne vendons pas et qui ne passe pas par nous. La formation dit exactement à quel moment ça devient nécessaire.",
        ],
      },
      {
        q: "Et si mon entreprise utilise Copilot, pas Claude ?",
        r: [
          "La méthode est la même pour les quatre outils, et c'est elle qui compte. Le parcours outil se change quand vous voulez : vous suivez celui de Copilot à la place, et rien d'autre ne bouge dans votre formation.",
        ],
      },
      {
        q: 'Combien de temps faut-il y consacrer ?',
        r: [
          "Comptez sept à huit heures de lecture et d'exercices sur le parcours, étalées comme vous le souhaitez pendant votre accès. La plupart des apprenants font une leçon par jour, le matin, sur une trentaine de jours.",
        ],
      },
      {
        q: 'La formation est-elle en ligne ou en présentiel ?',
        r: [
          "En ligne, à votre rythme, avec des exercices relus par un humain. Si vous cherchez une session animée en salle ou à distance pour votre équipe, c'est une autre offre et nous la faisons aussi.",
        ],
      },
      {
        q: 'Est-ce qu\'il y a une attestation ?',
        r: [
          "Oui, une attestation nominative à la fin du parcours, qui liste les domaines couverts et le volume réellement suivi. Elle ne remplace pas un diplôme et nous ne prétendons pas le contraire.",
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ copy EN */

const EN: CopyOutil = {
  barre: { outil: 'Claude', lecons: 'The path', programme: 'The programme', tarifs: 'Pricing', cta: 'Start' },
  meta: {
    titre: 'Claude AI training online: the programme',
    description:
      "Claude AI course online: the prompting method, Anthropic's projects, connectors and scheduled tasks, then automations. A full path, at your own pace.",
  },
  hero: {
    kicker: 'Claude AI training - Anthropic',
    titre: 'Claude AI training: learn AI with the tool from ',
    accent: 'Anthropic',
    sous:
      'The prompting method first, then the Claude path, then the automations that run without you. Online, at your own pace.',
    cta: (prix) => `Start now, ${prix}`,
    cta2: (lecons) => `${lecons} free lessons`,
    capture: 'claude.ai - a project, open',
    note: (retours) => `from ${retours} reviews`,
    lecons: (dansOutil) => `lessons, ${dansOutil} of them on Claude`,
    heures: 'of reading and exercises',
  },
  console: {
    kicker: 'What you learn to drive',
    titre: 'Claude, screen by screen',
    chapeau:
      'Three things almost nobody uses, and they are what separates a chat window from a working tool.',
    indice: (n) => `${n} markers on this screen`,
    ecrans: ecransEn(),
  },
  resultats: {
    kicker: 'On the way out',
    titre: 'What you will be able to produce with Claude',
    chapeau: 'Not knowledge about AI. Things you hand to someone.',
    items: [
      {
        titre: 'A synthesis of sixty pages',
        texte:
          'Three reports dropped into a project, one page back saying what changed and what has to be decided.',
      },
      {
        titre: 'A dashboard you can read',
        texte: 'A raw export in, a dashboard on screen out, adjusted by asking rather than by rebuilding.',
      },
      {
        titre: 'A deck, built',
        texte: 'The brief, the outline, then the slides. You keep hold of the argument, not the formatting.',
      },
      {
        titre: 'A client project that remembers',
        texte:
          'Their documents, their tone, their constraints. You open it, you ask, and it already knows what you are talking about.',
      },
      {
        titre: 'A Friday briefing',
        texte: 'A scheduled task that reads, sorts and hands you a summary while you do something else.',
      },
      {
        titre: 'The right tool at the right moment',
        texte:
          'A way of choosing between Claude, ChatGPT, Copilot and Gemini that does not expire at the next release.',
      },
    ],
  },
  demo: {
    kicker: 'The method, applied to Claude',
    titre: 'The same request, written twice',
    chapeau:
      'What the course changes sits in this gap. Five parts to put into a request: context, role, action, format, tone.',
    avantTete: 'What most people type',
    avantPrompt: 'Summarise these documents for me.',
    avantReponse:
      'Here is a summary of the documents provided. The first presents the quarterly results, the second details the actions taken, the third revisits the annual objectives. Overall performance is mixed and several levers could be activated.',
    apresTete: 'The same one, once the method is learned',
    apresPrompt:
      'You are an analyst in a marketing agency. This project holds our client’s three quarterly reports.\n\nCompare them and pull out the three gaps that change the board’s decision. Format: a one-page note, a table of the gaps with figures, then what you recommend.\n\nDirect tone, no superlatives. If a figure is missing, say so instead of estimating it.',
    apresReponse:
      'Three gaps change the board decision. The first is dated and quantified, the other two rest on a missing figure that I flag rather than estimate.',
    artefactTitre: 'Board note - Q1 to Q3',
    artefactTexte:
      'One page, a table of gaps, three recommendations. Placed beside the conversation, ready to send.',
    vous: 'You',
  },
  lecons: {
    kicker: 'The Claude path',
    titre: (n) => `The ${n} lessons of the module`,
    chapeau:
      'They come after the prompting method and before the automations. You choose one tool, and the path keeps only that one.',
  },
  franchise: {
    kicker: 'Honestly',
    titre: 'What Claude does better, and where it struggles',
    chapeau: 'A course that only praises its tool is worthless on the day the tool lets you down.',
    forcesTitre: 'Where it leads',
    forces: [
      'Long documents: sixty pages read without losing the thread of page one.',
      'Artifacts: you leave with a deliverable, not a block of text to paste elsewhere.',
      'Connectors and MCP: this is the tool that reaches furthest into your own data.',
      'The written tone: fewer superlatives, fewer bullet lists nobody asked for.',
    ],
    limitesTitre: 'Where it struggles',
    limites: [
      'It does not generate images. For a visual you go elsewhere, and the course says so.',
      'Less common in large companies: your IT team probably knows Copilot better.',
      'The free tier runs out quickly once you work seriously.',
      'Connecting a tool means understanding what you are authorising, which is a lesson in itself.',
    ],
    autresTitre: 'It may not be your tool',
    autresTexte:
      'The path is chosen at the fourth module, and it can be changed. If you already spend the day inside another suite, start there.',
    versOutil: (nom) => `The ${nom} course`,
    versProgramme: 'See the full programme',
  },
  programme: {
    kicker: 'The full programme',
    titre: 'Claude is one stage, not the whole course',
    chapeau:
      'What you buy is a course on using artificial intelligence at work. Claude is its practical way in.',
    auChoix: 'one of four',
    ici: 'you are here',
  },
  tarifs: {
    kicker: 'Pricing',
    titre: 'One course, two months of access',
    texte:
      'The full path, your tool included, the assistant that answers while you learn, and the certificate at the end. Nothing is billed monthly.',
    apres: 'You can add the automations later, without paying twice for what you already have.',
    formule: 'The method',
    cta: 'Start now',
    lignes: (f) => [
      `${f.lecons} lessons, ${f.heures}`,
      `The Claude path, ${f.lecture} lessons`,
      `${f.exercices} exercises reviewed`,
      `${f.jours} days of access`,
    ],
    synchro: 'amounts read from the application',
  },
  faq: {
    kicker: 'Questions',
    titre: 'What people ask us about the Claude course',
    items: [
      {
        q: 'Do I need a paid Claude subscription to follow the course?',
        r: [
          "Not to begin with. The first lessons work on Anthropic's free tier. Projects, connectors and scheduled tasks need a paid plan with Anthropic, which we do not sell and which does not go through us. The course says exactly when that becomes necessary.",
        ],
      },
      {
        q: 'What if my company runs on Copilot rather than Claude?',
        r: [
          'The method is the same across the four tools, and the method is what matters. The tool path can be swapped whenever you like: you follow the Copilot one instead, and nothing else in your course changes.',
        ],
      },
      {
        q: 'How much time does it take?',
        r: [
          'Around seven to eight hours of reading and exercises across the path, spread however you like over your access period. Most learners do one lesson a morning, over about thirty days.',
        ],
      },
      {
        q: 'Is this online or in a classroom?',
        r: [
          'Online, at your own pace, with exercises reviewed by a human. If you want a live session, in a room or remote, for a whole team, that is a different offer and we run those too.',
        ],
      },
      {
        q: 'Is there a certificate?',
        r: [
          'Yes, a named certificate at the end of the path, listing the areas covered and the volume actually completed. It is not a diploma and we do not pretend otherwise.',
        ],
      },
    ],
  },
};

export const claude: Outil = {
  id: 'claude',
  slug: 'claude',
  nom: 'Claude',
  cleLecons: 'claude',
  publie: true,
  renvoi: {
    fr: "Les projets, les connecteurs et ce qui tourne sans vous, chez Anthropic.",
    en: 'Projects, connectors and what runs without you, from Anthropic.',
  },
  copy: (locale: Locale) => (locale === 'fr' ? FR : EN),
};
