// ============================================================
// La page outil « Google Gemini » - le contenu, en français et en anglais
// ============================================================
//
// Le compte achète peu de vocabulaire ici : cours gemini, formation google
// gemini, formation gemini, apprendre gemini, formation gemini en ligne d'un
// côté ; google gemini training, gemini course de l'autre. Quatre-vingt-dix-huit
// impressions sur treize jours, contre 775 pour Claude.
//
// ⚠️ Décision du 11/09/2026 : cette page est volontairement PLUS COURTE que les
// trois autres, et entièrement sur Gemini, Google Workspace, Docs, Sheets et
// Gmail. Compenser le peu de vocabulaire par des généralités sur l'IA
// produirait du texte partagé avec les trois autres pages, donc exactement le
// contenu dupliqué qu'on cherche à éviter.
//
// ⚠️ Aucun nombre ici. Les leçons, les heures, les prix et la note arrivent en
// argument, lus dans l'application.

import type { Ecran, CopyOutil, Locale, Outil } from './types';
import { livrablesDe } from './livrables';

const IMG = '/academy/outils/gemini';

/* ---------------------------------------------------------------- écrans FR */

function ecransFr(): Ecran[] {
  return [
    {
      id: 'workspace',
      onglet: 'Dans Docs, Sheets et Gmail',
      ongletTexte: 'Le panneau qui vit dans vos documents, pas à côté.',
      image: `${IMG}/docs-panneau.png`,
      alt: 'Le panneau Gemini ouvert dans Google Docs, avec ses suggestions et une demande en cours',
      repos: {
        titre: 'Là où vous travaillez déjà',
        texte:
          "Gemini s'ouvre dans le document, pas dans un autre onglet. Il voit ce que vous écrivez, et vous pouvez lui donner vos autres fichiers Drive comme référence sans rien téléverser.",
        lecon: 'Leçons 2 à 6 : Docs, Sheets, Slides, Gmail et Drive, une par une.',
      },
      points: [
        {
          x: 84,
          y: 4,
          titre: 'Le panneau',
          texte:
            "Il s'ouvre à droite et reste avec le document. Chaque application de Workspace a le sien, et ils ne font pas tout à fait la même chose : c'est l'objet des cinq leçons.",
          lecon: 'Leçon 1 : où vit Gemini, et les quatre portes que presque personne n’utilise.',
        },
        {
          x: 89,
          y: 33,
          titre: 'Référencer un fichier',
          texte:
            "L'arobase appelle vos documents Drive dans la demande. C'est ce qui remplace le copier-coller, et ce qui fait la différence entre une réponse générique et une réponse sur vos données.",
          lecon: 'Leçon 6 : Gemini dans Google Drive.',
        },
        {
          x: 87,
          y: 67,
          titre: 'Les suggestions',
          texte:
            "Pratiques pour démarrer, insuffisantes pour travailler. La formation apprend à écrire la demande plutôt qu'à cliquer sur celle qu'on vous propose.",
          lecon: 'Module « La méthode de prompting ».',
        },
        {
          x: 89,
          y: 81,
          titre: 'La demande',
          texte:
            'Un vrai brief : le rôle, la tâche, le format attendu. Les cinq pièces de la méthode se posent ici comme ailleurs.',
          lecon: 'Leçon 2 : Gemini dans Google Docs.',
        },
      ],
    },
    {
      id: 'recherche',
      onglet: 'La recherche approfondie',
      ongletTexte: 'Un plan de recherche, puis un rapport sourcé.',
      image: `${IMG}/deep-research-plan.png`,
      alt: 'La recherche approfondie de Gemini : le plan de recherche affiché avant le lancement',
      repos: {
        titre: 'Il annonce son plan avant de chercher',
        texte:
          "C'est ce que Gemini fait de mieux, et ce que presque personne n'utilise : un plan de recherche affiché, corrigeable, puis un rapport avec ses sources. Quelques minutes de travail de machine pour une veille sérieuse.",
        lecon: 'Leçon 7 : la recherche approfondie, le mode agentique.',
      },
      points: [
        {
          x: 40,
          y: 81,
          titre: 'Le mode approfondi',
          texte:
            "Il s'active explicitement, et il change tout : sans lui vous obtenez une réponse de conversation, avec lui un rapport construit.",
          lecon: 'Leçon 7 : quand le déclencher, et quand il est inutile.',
        },
        {
          x: 47,
          y: 33,
          titre: 'Le plan, avant la recherche',
          texte:
            "Il propose sa méthode et attend votre accord. C'est le moment où l'on corrige la question, et c'est celui que tout le monde saute.",
          lecon: 'Module « Recherche et veille sérieuses ».',
        },
        {
          x: 38,
          y: 41,
          titre: 'Les étapes numérotées',
          texte:
            'Chercher, identifier, déterminer, mesurer. Lire ce plan vous dit déjà si la réponse répondra à votre question, avant de la lire.',
          lecon: 'Module « Juger une réponse ».',
        },
        {
          x: 42,
          y: 87,
          titre: 'Les sources',
          texte:
            "On peut lui imposer où chercher, et lui joindre des fichiers. Une veille sur votre marché ne se fait pas sur le web ouvert seulement.",
          lecon: 'Leçon 7 : cadrer la recherche.',
        },
      ],
    },
    {
      id: 'notebook',
      onglet: 'Le carnet de recherche',
      ongletTexte: 'Vingt documents déposés, et ce qu’on en tire.',
      image: `${IMG}/notebooklm-carnet.png`,
      alt: 'Un carnet NotebookLM : ses sources à gauche, la conversation au centre, les formats de sortie à droite',
      repos: {
        titre: 'Un dossier, interrogeable',
        texte:
          "On y dépose ses sources, et tout ce qui sort en découle : une synthèse, une carte mentale, un jeu de diapositives, un résumé audio. Chaque réponse renvoie au passage exact du document.",
        lecon: 'Leçon 8 : NotebookLM et les Gems.',
      },
      points: [
        {
          x: 13,
          y: 14,
          titre: 'Les sources',
          texte:
            "Vos PDF, vos pages web, vos notes. Le carnet ne répond QUE sur elles, et c'est précisément ce qui le rend sûr : il ne complète pas avec ce qu'il croit savoir.",
          lecon: 'Leçon 8 : monter un carnet sur un vrai dossier.',
        },
        {
          x: 79,
          y: 15,
          titre: 'Les formats de sortie',
          texte:
            "Résumé audio, diapositives, carte mentale, questionnaire, infographie. On choisit ce qu'on veut produire, à partir des mêmes sources.",
          lecon: 'Leçon 8 : ce qui se produit à partir d’un carnet.',
        },
        {
          x: 48,
          y: 47,
          titre: 'La synthèse',
          texte:
            'Elle cite les passages dont elle vient. La formation apprend à les ouvrir, parce que la citation n’est pas la preuve.',
          lecon: 'Module « Juger une réponse ».',
        },
        {
          x: 35,
          y: 63,
          titre: 'Garder la réponse',
          texte:
            'Une réponse utile devient une note du carnet, donc une source pour la suite. C’est comme ça qu’un dossier se construit sur plusieurs semaines.',
          lecon: 'Module « Recherche et veille sérieuses ».',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------- écrans EN */

function ecransEn(): Ecran[] {
  const fr = ecransFr();
  const t = [
    {
      onglet: 'In Docs, Sheets and Gmail',
      ongletTexte: 'The panel that lives inside your documents, not beside them.',
      alt: 'The Gemini panel open in Google Docs, with its suggestions and a request in progress',
      repos: {
        titre: 'Where you already work',
        texte:
          'Gemini opens inside the document, not in another tab. It sees what you are writing, and you can point it at your other Drive files without uploading anything.',
        lecon: 'Lessons 2 to 6: Docs, Sheets, Slides, Gmail and Drive, one by one.',
      },
      points: [
        {
          titre: 'The panel',
          texte:
            'It opens on the right and stays with the document. Each Workspace app has its own, and they do not quite do the same things: that is what the five lessons are about.',
          lecon: 'Lesson 1: where Gemini lives, and the four doors almost nobody uses.',
        },
        {
          titre: 'Referencing a file',
          texte:
            'The at sign pulls your Drive documents into the request. It replaces copy and paste, and it is the difference between a generic answer and one about your data.',
          lecon: 'Lesson 6: Gemini in Google Drive.',
        },
        {
          titre: 'The suggestions',
          texte:
            'Useful to start, not enough to work. The course teaches you to write the request rather than click the one you are offered.',
          lecon: 'The prompting module.',
        },
        {
          titre: 'The request',
          texte: 'A real brief: the role, the task, the expected format. The five parts apply here as anywhere.',
          lecon: 'Lesson 2: Gemini in Google Docs.',
        },
      ],
    },
    {
      onglet: 'Deep research',
      ongletTexte: 'A research plan first, then a sourced report.',
      alt: 'Gemini deep research: the research plan shown before the run starts',
      repos: {
        titre: 'It shows its plan before searching',
        texte:
          'This is what Gemini does best, and what almost nobody uses: a research plan you can correct, then a report with its sources. A few minutes of machine work for serious monitoring.',
        lecon: 'Lesson 7: deep research, the agentic mode.',
      },
      points: [
        {
          titre: 'Deep research mode',
          texte:
            'You switch it on deliberately, and it changes everything: without it you get a chat answer, with it you get a built report.',
          lecon: 'Lesson 7: when to trigger it, and when it is pointless.',
        },
        {
          titre: 'The plan, before the search',
          texte:
            'It proposes its method and waits for you. This is the moment to fix the question, and the one everyone skips.',
          lecon: 'Module on serious research and monitoring.',
        },
        {
          titre: 'The numbered steps',
          texte:
            'Search, identify, determine, measure. Reading the plan already tells you whether the answer will answer your question.',
          lecon: 'Module on judging an answer.',
        },
        {
          titre: 'Sources',
          texte:
            'You can tell it where to look and attach your own files. Monitoring your market does not happen on the open web alone.',
          lecon: 'Lesson 7: framing the search.',
        },
      ],
    },
    {
      onglet: 'The research notebook',
      ongletTexte: 'Twenty documents in, and what comes out of them.',
      alt: 'A NotebookLM notebook: sources on the left, chat in the middle, output formats on the right',
      repos: {
        titre: 'A file you can question',
        texte:
          'You drop your sources in, and everything that comes out derives from them: a synthesis, a mind map, a slide deck, an audio overview. Every answer points back to the exact passage.',
        lecon: 'Lesson 8: NotebookLM and Gems.',
      },
      points: [
        {
          titre: 'Sources',
          texte:
            'Your PDFs, your web pages, your notes. The notebook answers ONLY from them, and that is exactly what makes it safe: it does not fill the gaps with what it thinks it knows.',
          lecon: 'Lesson 8: building a notebook on a real file.',
        },
        {
          titre: 'Output formats',
          texte:
            'Audio overview, slides, mind map, quiz, infographic. You choose what to produce, from the same sources.',
          lecon: 'Lesson 8: what a notebook can produce.',
        },
        {
          titre: 'The synthesis',
          texte:
            'It cites the passages it came from. The course teaches you to open them, because a citation is not a proof.',
          lecon: 'Module on judging an answer.',
        },
        {
          titre: 'Keeping an answer',
          texte:
            'A useful answer becomes a note in the notebook, so a source for what follows. That is how a file grows over weeks.',
          lecon: 'Module on serious research and monitoring.',
        },
      ],
    },
  ];
  return fr.map((e, i) => ({
    ...e,
    onglet: t[i].onglet,
    ongletTexte: t[i].ongletTexte,
    alt: t[i].alt,
    repos: t[i].repos,
    points: e.points.map((p, j) => ({ ...p, ...t[i].points[j] })),
  }));
}

/* ------------------------------------------------------------------ copy FR */

const FR: CopyOutil = {
  barre: {
    outil: 'Gemini',
    lecons: 'Le parcours',
    programme: 'Le programme',
    tarifs: 'Les tarifs',
    cta: 'Commencer',
    marque: 'AI Academy',
    aria: 'Repères de la page',
    langue: 'EN',
    langueAria: 'Read this page in English',
    menuOuvrir: 'Ouvrir le menu',
    menuSections: 'Sections',
    menuLangue: 'Langue',
    menuDevise: 'Devise',
  },
  meta: {
    titre: 'Formation Google Gemini en ligne : le programme',
    description:
      "Formation Gemini en ligne : la méthode de prompting, Gemini dans Docs, Sheets et Gmail, la recherche approfondie et NotebookLM, puis les automatisations.",
  },
  hero: {
    kicker: 'Formation Gemini - Google Workspace',
    titre: 'Formation Google Gemini : apprendre l’IA dans ',
    accent: 'Workspace',
    sous:
      "La méthode de prompting d'abord, le parcours Gemini ensuite, puis les automatisations. Cours en ligne, à votre rythme, en français.",
    cta: (prix) => `Commencer, ${prix}`,
    cta2: (lecons) => `${lecons} leçons offertes`,
    capture: 'docs.google.com - le panneau Gemini',
    note: (retours) => `sur ${retours} retours`,
    lecons: (dansOutil) => `leçons, dont ${dansOutil} sur Gemini`,
    heures: "de lecture et d'exercices",
  },
  console: {
    kicker: 'Ce que vous apprenez à piloter',
    titre: 'Gemini, écran par écran',
    chapeau:
      "Trois portes de Google Workspace, dont deux que presque personne n'ouvre alors qu'elles sont comprises dans la licence.",
    indice: (n) => `${n} repères sur cet écran`,
    ecrans: ecransFr(),
  },
  livrables: {
    kicker: 'Des vrais documents',
    titre: 'Ce qui sort de la formation',
    chapeau:
      "Quatre documents produits pendant une session, devant la salle, à partir de la matière d'une entreprise. Ouvrez-les : c'est le genre de choses que vous rendrez.",
    ouvrir: 'Ouvrir le document',
    items: livrablesDe('gemini'),
  },
  demo: {
    kicker: 'La méthode, appliquée à Gemini',
    titre: 'La même demande, écrite deux fois',
    chapeau:
      "Ce que la formation change tient dans cet écart. Cinq pièces à poser dans la demande : le contexte, le rôle, l'action, le format, le ton.",
    avantTete: 'Ce que la plupart des gens écrivent',
    avantPrompt: 'Fais-moi un résumé de ce tableau.',
    avantReponse:
      "Ce tableau présente les données de ventes par région et par trimestre. On observe des variations selon les zones géographiques, avec des performances contrastées. Certaines régions affichent une progression tandis que d'autres connaissent un recul.",
    apresTete: 'La même, une fois la méthode apprise',
    apresPrompt:
      "Tu es contrôleur de gestion. Cette feuille contient les ventes par région et par trimestre, sur deux ans.\n\nSors les trois régions dont la tendance s'est inversée entre les deux années, avec l'écart chiffré et le trimestre de bascule. Format : un tableau de trois lignes, puis deux phrases sur ce que ça implique pour le budget.\n\nSi une région a des données manquantes, dis-le au lieu de l'écarter en silence.",
    apresReponse:
      "Trois régions se sont inversées. Le Sud-Ouest bascule au T3 de la première année, avec un écart de 14 points. Les deux autres basculent au T1 suivant. La région Est a deux trimestres sans données : je la signale plutôt que de la compter.", // chiffre-libre : données de l'exercice
    artefactTitre: 'Ce qui a changé',
    artefactTexte:
      "La demande dit quoi chercher, sous quelle forme, et quoi faire d'une donnée manquante. Le résumé est devenu une réponse.",
    vous: 'Vous',
  },
  lecons: {
    kicker: 'Le parcours Gemini',
    titre: (n) => `Les ${n} leçons du module`,
    chapeau:
      'Elles arrivent après la méthode de prompting, et avant les automatisations. Vous choisissez un outil, et le parcours ne garde que celui-là.',
  },
  franchise: {
    kicker: 'Honnêtement',
    titre: 'Ce que Gemini fait mieux, et là où il coince',
    chapeau: "Une formation qui ne dit que du bien de son outil ne sert à rien le jour où l'outil coince.",
    forcesTitre: 'Là où il est devant',
    forces: [
      "Il est dans Docs, Sheets, Slides, Gmail et Drive, donc là où le travail se fait déjà.",
      "La recherche approfondie annonce son plan avant de chercher : aucun autre ne le fait aussi clairement.",
      'NotebookLM répond uniquement sur vos sources, et cite le passage exact.',
      "Les Gems se configurent une fois et restent disponibles dans toute la suite.",
    ],
    limitesTitre: 'Là où il coince',
    limites: [
      "La qualité dépend de ce qu'il trouve dans votre Drive : un Drive en désordre donne des réponses en désordre.",
      "Les panneaux de Docs, Sheets et Gmail ne font pas la même chose, et rien ne le dit à l'écran.",
      "Sans licence Workspace, l'essentiel de ce dont on parle ici n'est pas accessible.",
      "Il n'accepte pas qu'on lui passe une demande par un lien, contrairement aux trois autres.",
    ],
    autresTitre: "Ce n'est peut-être pas votre outil",
    autresTexte:
      'Le parcours se choisit au quatrième module, et il se change. Si votre entreprise vit dans Microsoft 365, commencez par Copilot.',
    versOutil: (nom) => `La formation ${nom}`,
    versProgramme: 'Voir le programme complet',
  },
  programme: {
    kicker: 'Le programme complet',
    titre: 'Gemini est une étape, pas la formation entière',
    chapeau:
      "Ce que vous achetez est une formation à l'intelligence artificielle au travail. Gemini en est la porte d'entrée si vous vivez dans Google Workspace.",
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
      `Le parcours Gemini, ${f.lecture} leçons`,
      `${f.exercices} exercices relus`,
      `${f.jours} jours d'accès`,
    ],
    synchro: "montants lus dans l'application",
  },
  faq: {
    kicker: 'Questions',
    titre: "Ce qu'on nous demande sur la formation Gemini",
    items: [
      {
        q: 'Faut-il une licence Google Workspace pour suivre la formation ?',
        r: [
          "Pour les leçons sur Docs, Sheets, Slides, Gmail et Drive, oui : ce sont des fonctions de la suite professionnelle. La recherche approfondie et NotebookLM s'utilisent avec un compte Google ordinaire. La formation dit à chaque leçon ce qui est nécessaire, et nous ne vendons aucune licence Google.",
        ],
      },
      {
        q: "Mon entreprise est sur Microsoft. Est-ce que Gemini a du sens ?",
        r: [
          "Rarement pour le travail quotidien : l'intérêt de Gemini est justement d'être dans vos documents, et vos documents sont ailleurs. En revanche, NotebookLM et la recherche approfondie se prennent séparément et n'ont pas d'équivalent chez Microsoft. Si le reste de votre journée se passe dans Microsoft 365, prenez plutôt le parcours Copilot.",
        ],
      },
      {
        q: 'Combien de temps faut-il y consacrer ?',
        r: [
          "Comptez {heures} de lecture et d'exercices sur le parcours, étalées comme vous le souhaitez pendant votre accès. La plupart des apprenants font une leçon par jour, le matin, sur une trentaine de jours.", // chiffre-libre : {heures} est remplacé par la durée de La méthode lue dans l'API ; la trentaine de jours est un rythme, pas la durée d'accès
        ],
      },
      {
        q: 'La formation est-elle en ligne ou en présentiel ?',
        r: [
          "En ligne, à votre rythme, avec des exercices relus par un humain. Si vous cherchez une session animée en salle ou à distance pour votre équipe, c'est une autre offre et nous la faisons aussi.",
        ],
      },
      {
        q: 'Est-ce qu’il y a une attestation ?',
        r: [
          "Oui, une attestation nominative à la fin du parcours, qui liste les domaines couverts et le volume réellement suivi. Elle ne remplace pas un diplôme et nous ne prétendons pas le contraire.",
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ copy EN */

const EN: CopyOutil = {
  barre: {
    outil: 'Gemini',
    lecons: 'The path',
    programme: 'The programme',
    tarifs: 'Pricing',
    cta: 'Start',
    marque: 'AI Academy',
    aria: 'Page markers',
    langue: 'FR',
    langueAria: 'Lire cette page en français',
    menuOuvrir: 'Open the menu',
    menuSections: 'Sections',
    menuLangue: 'Language',
    menuDevise: 'Currency',
  },
  meta: {
    titre: 'Google Gemini training: the full programme',
    description:
      'Gemini course online: the prompting method, Gemini inside Docs, Sheets and Gmail, deep research and NotebookLM, then automations. At your own pace.',
  },
  hero: {
    kicker: 'Gemini training - Google Workspace',
    titre: 'Google Gemini training: learning AI inside ',
    accent: 'Workspace',
    sous:
      'The prompting method first, then the Gemini path, then the automations that run without you. Online, at your own pace.',
    cta: (prix) => `Start now, ${prix}`,
    cta2: (lecons) => `${lecons} free lessons`,
    capture: 'docs.google.com - the Gemini panel',
    note: (retours) => `from ${retours} reviews`,
    lecons: (dansOutil) => `lessons, ${dansOutil} of them on Gemini`,
    heures: 'of reading and exercises',
  },
  console: {
    kicker: 'What you learn to drive',
    titre: 'Gemini, screen by screen',
    chapeau:
      'Three doors into Google Workspace, two of which almost nobody opens even though the licence already pays for them.',
    indice: (n) => `${n} markers on this screen`,
    ecrans: ecransEn(),
  },
  livrables: {
    kicker: 'Real documents',
    titre: 'What comes out of the course',
    chapeau:
      'Four documents produced during a session, in front of the room, from one company’s own material. Open them: this is the kind of thing you will be handing over.',
    ouvrir: 'Open the document',
    items: livrablesDe('gemini', 'en'),
  },
  resultats: {
    kicker: 'On the way out',
    titre: 'What you will be able to do with Gemini',
    chapeau: 'Not knowledge about AI. Things you hand to someone.',
    items: [
      {
        titre: 'A spreadsheet that answers back',
        texte: 'Two years of sales questioned in the sheet itself, with the gaps flagged rather than dropped.',
      },
      {
        titre: 'A sourced research report',
        texte: 'A plan you corrected before it ran, then a report you can hand to a board.',
      },
      {
        titre: 'A notebook on your own file',
        texte: 'Twenty documents in, and answers that point back to the exact passage they came from.',
      },
      {
        titre: 'A first draft inside the document',
        texte: 'No copy and paste: the panel writes where the document lives, with your Drive files as reference.',
      },
      {
        titre: 'An inbox that stops piling up',
        texte: 'Gemini in Gmail, used on the threads that matter rather than on all of them.',
      },
      {
        titre: 'The right tool at the right moment',
        texte:
          'A way of choosing between Gemini, Claude, ChatGPT and Copilot that does not expire at the next release.',
      },
    ],
  },
  demo: {
    kicker: 'The method, applied to Gemini',
    titre: 'The same request, written twice',
    chapeau:
      'What the course changes sits in this gap. Five parts to put into a request: context, role, action, format, tone.',
    avantTete: 'What most people type',
    avantPrompt: 'Summarise this table for me.',
    avantReponse:
      'This table shows sales data by region and by quarter. Performance varies across geographies, with contrasting results. Some regions are growing while others are declining.',
    apresTete: 'The same one, once the method is learned',
    apresPrompt:
      'You are a financial controller. This sheet holds sales by region and by quarter, over two years.\n\nPull out the three regions whose trend reversed between the two years, with the gap in figures and the quarter it turned. Format: a three-row table, then two sentences on what it means for the budget.\n\nIf a region has missing data, say so instead of quietly dropping it.',
    apresReponse:
      'Three regions reversed. The South West turns in Q3 of the first year, a fourteen-point gap. The other two turn the following Q1. The East region has two quarters with no data: I flag it rather than count it.',
    artefactTitre: 'What changed',
    artefactTexte:
      'The request says what to look for, in what shape, and what to do with a gap. The summary became an answer.',
    vous: 'You',
  },
  lecons: {
    kicker: 'The Gemini path',
    titre: (n) => `The ${n} lessons of the module`,
    chapeau:
      'They come after the prompting method and before the automations. You choose one tool, and the path keeps only that one.',
  },
  franchise: {
    kicker: 'Honestly',
    titre: 'What Gemini does better, and where it struggles',
    chapeau: 'A course that only praises its tool is worthless on the day the tool lets you down.',
    forcesTitre: 'Where it leads',
    forces: [
      'It sits inside Docs, Sheets, Slides, Gmail and Drive, where the work already happens.',
      'Deep research shows its plan before it searches. No other tool does that as clearly.',
      'NotebookLM answers only from your sources, and cites the exact passage.',
      'Gems are set up once and stay available across the suite.',
    ],
    limitesTitre: 'Where it struggles',
    limites: [
      'Quality depends on what it finds in your Drive: a messy Drive gives messy answers.',
      'The Docs, Sheets and Gmail panels do not do the same things, and nothing on screen says so.',
      'Without a Workspace licence, most of what this page covers is out of reach.',
      'It will not take a request passed through a link, unlike the other three.',
    ],
    autresTitre: 'It may not be your tool',
    autresTexte:
      'The path is chosen at the fourth module, and it can be changed. If your company runs on Microsoft 365, start with Copilot.',
    versOutil: (nom) => `The ${nom} course`,
    versProgramme: 'See the full programme',
  },
  programme: {
    kicker: 'The full programme',
    titre: 'Gemini is one stage, not the whole course',
    chapeau:
      'What you buy is a course on using artificial intelligence at work. Gemini is its way in if you live inside Google Workspace.',
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
      `The Gemini path, ${f.lecture} lessons`,
      `${f.exercices} exercises reviewed`,
      `${f.jours} days of access`,
    ],
    synchro: 'amounts read from the application',
  },
  faq: {
    kicker: 'Questions',
    titre: 'What people ask us about the Gemini course',
    items: [
      {
        q: 'Do I need a Google Workspace licence to follow the course?',
        r: [
          'For the lessons on Docs, Sheets, Slides, Gmail and Drive, yes: those are business suite features. Deep research and NotebookLM work with an ordinary Google account. The course says what each lesson needs, and we sell no Google licences.',
        ],
      },
      {
        q: 'My company runs on Microsoft. Does Gemini still make sense?',
        r: [
          'Rarely for daily work: the point of Gemini is being inside your documents, and your documents are elsewhere. NotebookLM and deep research, on the other hand, stand on their own and have no Microsoft equivalent. If the rest of your day happens in Microsoft 365, take the Copilot path instead.',
        ],
      },
      {
        q: 'How much time does it take?',
        r: [
          'Around {heures} of reading and exercises across the path, spread however you like over your access period. Most learners do one lesson a morning, over about thirty days.', // chiffre-libre : {heures} est remplacé par la durée de La méthode lue dans l'API ; les trente jours sont un rythme, pas la durée d'accès
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

export const gemini: Outil = {
  id: 'gemini',
  slug: 'gemini',
  nom: 'Gemini',
  cleLecons: 'gemini',
  publie: true,
  renvoi: {
    fr: 'Dans Docs, Sheets et Gmail, plus la recherche approfondie.',
    en: 'Inside Docs, Sheets and Gmail, plus deep research.',
  },
  copy: (locale: Locale) => (locale === 'fr' ? FR : EN),
};
