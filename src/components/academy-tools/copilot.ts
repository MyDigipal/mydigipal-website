// ============================================================
// La page outil « Microsoft Copilot » - le contenu, FR et EN
// ============================================================
//
// C'est la page la plus chère du compte : Google demande jusqu'à 8,00 £ la
// première page sur « formation microsoft copilot », et 7,09 £ sur « microsoft
// copilot course », alors que le mot « Microsoft » n'apparaissait dans aucune
// de nos annonces. Le vocabulaire acheté, en français : formation microsoft
// copilot, formation microsoft 365 copilot, formation copilot, formation
// copilot en ligne, formation copilot 365, cours copilot, apprendre copilot,
// formation copilot word excel. En anglais : microsoft copilot course,
// microsoft 365 copilot training, microsoft copilot training course, ms copilot
// training, microsoft 365 copilot workshop, copilot training courses, copilot
// courses, microsoft copilot training, copilot training course, copilot course,
// copilot training, microsoft copilot workshop.
//
// ⚠️ Les deux écrans de la console sont des SCHÉMAS, pas des captures, et la
// page le dit. L'application n'a aucune capture de Copilot et Paul n'a pas la
// licence Microsoft 365 Copilot (13/09/2026) ; emprunter des visuels Microsoft
// sur le web pour une page commerciale n'était pas une bonne idée. Ils sont
// fabriqués par `scripts/schemas-copilot.py`.
//
// ⚠️ Aucun nombre ici. Les leçons, les heures, les prix et la note arrivent en
// argument, lus dans l'application.

import type { Ecran, CopyOutil, Locale, Outil } from './types';
import { livrablesDe } from './livrables';

const IMG = '/academy/outils/copilot';

/* ---------------------------------------------------------------- écrans FR */

function ecransFr(): Ecran[] {
  return [
    {
      id: 'portes',
      onglet: 'Les cinq portes',
      ongletTexte: 'Word, Excel, PowerPoint, Outlook, Teams : ce que chacune sait faire.',
      image: `${IMG}/portes.png`,
      alt: 'Les cinq applications Microsoft 365 où vit Copilot, et ce que chacune permet',
      repos: {
        titre: 'Un volet dans chaque application',
        texte:
          "Copilot n'est pas une conversation à côté du travail : c'est un volet dans Word, Excel, PowerPoint, Outlook et Teams, et ce qu'il sait faire change de l'une à l'autre. Le parcours consacre une leçon à chacune.",
        lecon: 'Leçon 1 : où vit Copilot, et ce que chaque porte sait faire.',
      },
      points: [
        {
          x: 25,
          y: 26,
          titre: 'Word',
          texte:
            "Un brouillon depuis des notes, un résumé en cinq points, une réécriture qui garde le sens. Le volet voit le document ouvert, donc on cesse de coller du texte dans une autre fenêtre.",
          lecon: 'Leçon 3 : Copilot dans Word.',
        },
        {
          x: 57,
          y: 26,
          titre: 'Excel',
          texte:
            "Une formule expliquée, une colonne calculée, une tendance repérée. À condition que les données soient en vraie table : c'est la première chose que la leçon fait vérifier.",
          lecon: 'Leçon 2 : Copilot dans Excel.',
        },
        {
          x: 58,
          y: 63,
          titre: 'Le chat Microsoft 365',
          texte:
            "La porte la plus puissante, et la moins connue : elle cherche dans vos fichiers, vos courriels et vos réunions à la fois. C'est elle qui justifie la licence.",
          lecon: 'Leçon 1 : la porte que presque personne n’ouvre.',
        },
        {
          x: 88,
          y: 63,
          titre: 'Teams',
          texte:
            'Le compte rendu, les décisions, les actions avec leur porteur, même quand on arrive en retard. Il faut que la réunion soit transcrite, et la leçon dit comment s’en assurer.',
          lecon: 'Leçon 6 : Copilot dans SharePoint et Teams.',
        },
      ],
    },
    {
      id: 'voit',
      onglet: 'Ce qu’il voit de vous',
      ongletTexte: 'Vos fichiers, vos courriels, vos réunions. Et tout ce qui lui échappe.',
      image: `${IMG}/ce-qu-il-voit.png`,
      alt: "Les sources que Copilot peut lire dans l'entreprise, et celles qui lui échappent",
      repos: {
        titre: 'Il ne répond bien que sur ce qu’il a le droit de lire',
        texte:
          "C'est la différence de fond avec les trois autres outils, et la source de la plupart des déceptions : Copilot cherche dans les données de l'entreprise, mais seulement celles auxquelles vous avez déjà accès, et seulement si elles sont indexées.",
        lecon: "Module « Vos données et le cadre d'usage ».",
      },
      points: [
        {
          x: 12,
          y: 28,
          titre: 'SharePoint et OneDrive',
          texte:
            "Les fichiers de vos équipes, dans la mesure où vous y avez déjà accès. Copilot n'ouvre aucune porte fermée : il ne fait que chercher plus vite dans celles qui le sont déjà pour vous.",
          lecon: 'Leçon 6 : Copilot dans SharePoint et Teams.',
        },
        {
          x: 7,
          y: 53,
          titre: 'Teams',
          texte:
            "Les conversations et les réunions transcrites. Une réunion sans transcription n'existe pas pour lui, et c'est la raison numéro un des « il n'a rien trouvé ».",
          lecon: 'Module « Réunions, comptes rendus et messages ».',
        },
        {
          x: 65,
          y: 43,
          titre: 'Ce qu’il ne voit pas',
          texte:
            "Le disque local, le service voisin, la réunion non transcrite, le CRM, et ce qui a été déposé il y a dix minutes. Cinq angles morts qui expliquent presque toutes les réponses décevantes.",
          lecon: 'Leçon 1 : ce que chaque porte voit, et ce qu’elle ignore.',
        },
        {
          x: 60,
          y: 84,
          titre: 'Ce que la formation en fait',
          texte:
            "Deux leçons portent là-dessus : ce qu'on peut lui donner à lire, et ce qu'on écrit dans la demande quand il ne trouve pas. Une entreprise mal rangée obtient des réponses vagues.",
          lecon: "Module « Vos données et le cadre d'usage ».",
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
      onglet: 'The five doors',
      ongletTexte: 'Word, Excel, PowerPoint, Outlook, Teams: what each one can do.',
      alt: 'The five Microsoft 365 applications where Copilot lives, and what each one allows',
      repos: {
        titre: 'A pane inside every application',
        texte:
          'Copilot is not a chat window beside your work: it is a pane inside Word, Excel, PowerPoint, Outlook and Teams, and what it can do changes from one to the next. The path gives each one a lesson.',
        lecon: 'Lesson 1: where Copilot lives, and what each door can actually do.',
      },
      points: [
        {
          titre: 'Word',
          texte:
            'A draft from notes, a five-point summary, a rewrite that keeps the meaning. The pane sees the open document, so you stop pasting text into another window.',
          lecon: 'Lesson 3: Copilot in Word.',
        },
        {
          titre: 'Excel',
          texte:
            'A formula explained, a column calculated, a trend spotted. Provided the data is a real table: that is the first thing the lesson has you check.',
          lecon: 'Lesson 2: Copilot in Excel.',
        },
        {
          titre: 'Microsoft 365 Chat',
          texte:
            'The most powerful door, and the least known: it searches your files, your email and your meetings at once. It is the one that justifies the licence.',
          lecon: 'Lesson 1: the door almost nobody opens.',
        },
        {
          titre: 'Teams',
          texte:
            'The recap, the decisions, the actions and their owners, even when you joined late. The meeting has to be transcribed, and the lesson shows how to make sure it is.',
          lecon: 'Lesson 6: Copilot in SharePoint and Teams.',
        },
      ],
    },
    {
      onglet: 'What it sees of you',
      ongletTexte: 'Your files, your email, your meetings. And everything it misses.',
      alt: 'The company sources Copilot can read, and the ones it cannot',
      repos: {
        titre: 'It only answers well on what it is allowed to read',
        texte:
          'This is the fundamental difference with the other three tools, and the source of most disappointment: Copilot searches company data, but only what you already have access to, and only if it is indexed.',
        lecon: 'Module on data and rules of use.',
      },
      points: [
        {
          titre: 'SharePoint and OneDrive',
          texte:
            'Your teams’ files, as far as you already have access. Copilot opens no closed door: it only searches faster through the ones already open to you.',
          lecon: 'Lesson 6: Copilot in SharePoint and Teams.',
        },
        {
          titre: 'Teams',
          texte:
            'Conversations and transcribed meetings. A meeting without a transcript does not exist for it, and that is the number one cause of "it found nothing".',
          lecon: 'Module on meetings, minutes and messages.',
        },
        {
          titre: 'What it does not see',
          texte:
            'The local drive, the next department, the untranscribed meeting, the CRM, and whatever was uploaded ten minutes ago. Five blind spots behind almost every disappointing answer.',
          lecon: 'Lesson 1: what each door sees, and what it ignores.',
        },
        {
          titre: 'What the course does with it',
          texte:
            'Two lessons cover this: what you can give it to read, and what you write in the request when it finds nothing. A badly organised company gets vague answers.',
          lecon: 'Module on data and rules of use.',
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
    outil: 'Copilot',
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
    titre: 'Formation Microsoft Copilot : le programme',
    description:
      "Formation Microsoft 365 Copilot en ligne : la méthode de prompting, Copilot dans Word, Excel, Outlook et Teams, puis les automatisations. À votre rythme.",
  },
  hero: {
    kicker: 'Formation Copilot - Microsoft 365',
    titre: 'Formation Microsoft Copilot : l’IA dans ',
    accent: 'vos fichiers',
    sous:
      "La méthode de prompting d'abord, le parcours Copilot ensuite, puis les automatisations. Cours en ligne, à votre rythme, en français.",
    cta: (prix) => `Commencer, ${prix}`,
    cta2: (lecons) => `${lecons} leçons offertes`,
    capture: 'Microsoft 365 - les cinq portes de Copilot',
    note: (retours) => `sur ${retours} retours`,
    lecons: (dansOutil) => `leçons, dont ${dansOutil} sur Copilot`,
    heures: "de lecture et d'exercices",
  },
  console: {
    kicker: 'Ce que vous apprenez à piloter',
    titre: 'Copilot, porte par porte',
    chapeau:
      "Deux schémas plutôt que deux captures : ce qui compte chez Copilot n'est pas l'apparence du volet, c'est ce que chaque application permet et ce qu'il a le droit de lire.",
    indice: (n) => `${n} repères sur ce schéma`,
    ecrans: ecransFr(),
  },
  livrables: {
    kicker: 'Des vrais documents',
    titre: 'Ce qui sort de la formation',
    chapeau:
      "Quatre documents produits pendant une session, devant la salle, à partir de la matière d'une entreprise. Ouvrez-les : c'est le genre de choses que vous rendrez.",
    ouvrir: 'Ouvrir le document',
    items: livrablesDe('copilot'),
  },
  demo: {
    kicker: 'La méthode, appliquée à Copilot',
    titre: 'La même demande, écrite deux fois',
    chapeau:
      "Ce que la formation change tient dans cet écart. Cinq pièces à poser dans la demande : le contexte, le rôle, l'action, le format, le ton.",
    avantTete: 'Ce que la plupart des gens écrivent',
    avantPrompt: 'Résume ce fil de discussion.',
    avantReponse:
      "Ce fil concerne un projet en cours. Plusieurs participants ont échangé sur les délais et les livrables. Des ajustements ont été évoqués et certaines décisions restent à confirmer. Il est suggéré de poursuivre les échanges pour clarifier les points ouverts.",
    apresTete: 'La même, une fois la méthode apprise',
    apresPrompt:
      "Tu es mon assistant sur ce dossier client. Ce fil Outlook compte trente-deux messages depuis six semaines, entre notre équipe, le client et son bureau d'études.\n\nSors les engagements que NOUS avons pris, avec leur date et la personne qui les a pris. Format : une liste, une ligne par engagement, la source entre parenthèses. Sépare ce qui est tenu de ce qui ne l'est pas.\n\nSi un engagement est ambigu, écris-le dans une section « à vérifier » plutôt que de trancher.",
    apresReponse:
      "Sept engagements de notre côté, dont cinq tenus. Deux restent ouverts : la note de calcul promise le 12 (par Julien) et le planning de pose révisé (par vous, le 27). Un troisième est ambigu et part en « à vérifier » : « on regarde ça cette semaine » n'engage rien de précis.",
    artefactTitre: 'Ce qui a changé',
    artefactTexte:
      "La demande dit quoi chercher, pour qui, dans quel format, et quoi faire de l'ambigu. Le résumé est devenu une liste d'actions avec des noms et des dates.",
    vous: 'Vous',
  },
  lecons: {
    kicker: 'Le parcours Copilot',
    titre: (n) => `Les ${n} leçons du module`,
    chapeau:
      'Elles arrivent après la méthode de prompting, et avant les automatisations. Vous choisissez un outil, et le parcours ne garde que celui-là.',
  },
  franchise: {
    kicker: 'Honnêtement',
    titre: 'Ce que Copilot fait mieux, et là où il coince',
    chapeau: "Une formation qui ne dit que du bien de son outil ne sert à rien le jour où l'outil coince.",
    forcesTitre: 'Là où il est devant',
    forces: [
      "Il travaille dans vos fichiers d'entreprise, là où les trois autres attendent qu'on leur donne le document.",
      'Le résumé de fil Outlook et le compte rendu Teams : deux gains immédiats, dès la première semaine.',
      "Il respecte vos droits d'accès existants, ce qui rassure une direction informatique.",
      'Il est déjà déployé chez vous, souvent sans que personne ne se soit demandé quoi en faire.',
    ],
    limitesTitre: 'Là où il coince',
    limites: [
      'Tout dépend de la licence : sans elle, la moitié de cette page ne vous concerne pas.',
      'Dans Excel, les gros classeurs et les données mal structurées le perdent vite.',
      "Il ne voit ni le disque local, ni les outils hors Microsoft, ni les réunions non transcrites.",
      "Il se branche moins loin que Claude sur des outils tiers, et ne produit pas d'artefact à l'écran.",
    ],
    autresTitre: "Ce n'est peut-être pas votre outil",
    autresTexte:
      'Le parcours se choisit au quatrième module, et il se change. Si votre entreprise vit dans Google Workspace, commencez par Gemini.',
    versOutil: (nom) => `La formation ${nom}`,
    versProgramme: 'Voir le programme complet',
  },
  programme: {
    kicker: 'Le programme complet',
    titre: 'Copilot est une étape, pas la formation entière',
    chapeau:
      "Ce que vous achetez est une formation à l'intelligence artificielle au travail. Copilot en est la porte d'entrée si votre entreprise vit dans Microsoft 365.",
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
      `Le parcours Copilot, ${f.lecture} leçons`,
      `${f.exercices} exercices relus`,
      `${f.jours} jours d'accès`,
    ],
    synchro: "montants lus dans l'application",
  },
  faq: {
    kicker: 'Questions',
    titre: "Ce qu'on nous demande sur la formation Copilot",
    items: [
      {
        q: 'Faut-il la licence Microsoft 365 Copilot pour suivre la formation ?',
        r: [
          "Pour les leçons sur Word, Excel, Outlook et Teams, oui : ce sont des fonctions de la licence. La méthode de prompting, le jugement des réponses et le cadre d'usage des données s'apprennent sans elle, et représentent la plus grande partie du parcours. Nous ne vendons aucune licence Microsoft et n'en touchons rien.",
        ],
      },
      {
        q: 'Mon entreprise a acheté Copilot et personne ne s’en sert. Est-ce le bon moment ?',
        r: [
          "C'est le cas le plus fréquent dans nos sessions. Une licence déployée sans formation produit trois usages : le résumé de réunion, le brouillon de mail, et l'abandon. Le parcours montre les cinq portes une par une, et surtout ce que chacune ne sait pas faire, ce qui évite d'en attendre l'impossible.",
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
    outil: 'Copilot',
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
    titre: 'Microsoft Copilot course: the programme',
    description:
      'Microsoft 365 Copilot training online: the prompting method, Copilot in Word, Excel, Outlook and Teams, then automations. At your own pace, reviewed work.',
  },
  hero: {
    kicker: 'Copilot training - Microsoft 365',
    titre: 'Microsoft Copilot training: AI inside ',
    accent: 'your own files',
    sous:
      'The prompting method first, then the Copilot path, then the automations that run without you. Online, at your own pace.',
    cta: (prix) => `Start now, ${prix}`,
    cta2: (lecons) => `${lecons} free lessons`,
    capture: 'Microsoft 365 - the five doors into Copilot',
    note: (retours) => `from ${retours} reviews`,
    lecons: (dansOutil) => `lessons, ${dansOutil} of them on Copilot`,
    heures: 'of reading and exercises',
  },
  console: {
    kicker: 'What you learn to drive',
    titre: 'Copilot, door by door',
    chapeau:
      'Two diagrams rather than two screenshots: what matters with Copilot is not how the pane looks, it is what each application allows and what it is allowed to read.',
    indice: (n) => `${n} markers on this diagram`,
    ecrans: ecransEn(),
  },
  livrables: {
    kicker: 'Real documents',
    titre: 'What comes out of the course',
    chapeau:
      'Four documents produced during a session, in front of the room, from one company’s own material. Open them: this is the kind of thing you will be handing over.',
    ouvrir: 'Open the document',
    items: livrablesDe('copilot', 'en'),
  },
  resultats: {
    kicker: 'On the way out',
    titre: 'What you will be able to do with Copilot',
    chapeau: 'Not knowledge about AI. Things you hand to someone.',
    items: [
      {
        titre: 'A thread turned into commitments',
        texte: 'Thirty-two messages in, a list of who promised what and by when out, with the open ones flagged.',
      },
      {
        titre: 'A meeting you did not attend',
        texte: 'The recap, the decisions and the actions with their owners, from the Teams transcript.',
      },
      {
        titre: 'A document drafted in Word',
        texte: 'From notes to a first draft in the document itself, then rewritten without losing the meaning.',
      },
      {
        titre: 'A spreadsheet that explains itself',
        texte: 'A formula in plain language, a calculated column, and the trend you had not spotted.',
      },
      {
        titre: 'A search across the company',
        texte: 'Microsoft 365 Chat used properly: files, email and meetings questioned at once.',
      },
      {
        titre: 'The right tool at the right moment',
        texte:
          'A way of choosing between Copilot, Claude, ChatGPT and Gemini that does not expire at the next release.',
      },
    ],
  },
  demo: {
    kicker: 'The method, applied to Copilot',
    titre: 'The same request, written twice',
    chapeau:
      'What the course changes sits in this gap. Five parts to put into a request: context, role, action, format, tone.',
    avantTete: 'What most people type',
    avantPrompt: 'Summarise this thread.',
    avantReponse:
      'This thread concerns an ongoing project. Several participants discussed timelines and deliverables. Adjustments were mentioned and some decisions remain to be confirmed. It is suggested that discussions continue to clarify the open points.',
    apresTete: 'The same one, once the method is learned',
    apresPrompt:
      'You are my assistant on this client file. This Outlook thread holds thirty-two messages over six weeks, between our team, the client and their design office.\n\nPull out the commitments WE made, with the date and the person who made them. Format: a list, one line per commitment, the source in brackets. Separate what was met from what was not.\n\nIf a commitment is ambiguous, put it in a "to check" section rather than deciding for me.',
    apresReponse:
      'Seven commitments on our side, five of them met. Two remain open: the calculation note promised on the 12th (by Julien) and the revised fitting schedule (by you, on the 27th). A third is ambiguous and goes to "to check": "we will look at it this week" commits to nothing precise.',
    artefactTitre: 'What changed',
    artefactTexte:
      'The request says what to look for, for whom, in what format, and what to do with ambiguity. The summary became a list of actions with names and dates.',
    vous: 'You',
  },
  lecons: {
    kicker: 'The Copilot path',
    titre: (n) => `The ${n} lessons of the module`,
    chapeau:
      'They come after the prompting method and before the automations. You choose one tool, and the path keeps only that one.',
  },
  franchise: {
    kicker: 'Honestly',
    titre: 'What Copilot does better, and where it struggles',
    chapeau: 'A course that only praises its tool is worthless on the day the tool lets you down.',
    forcesTitre: 'Where it leads',
    forces: [
      'It works inside your company files, where the other three wait to be handed the document.',
      'Outlook thread summaries and Teams recaps: two immediate wins, in the first week.',
      'It respects your existing access rights, which reassures an IT department.',
      'It is already deployed at your company, often without anyone asking what to do with it.',
    ],
    limitesTitre: 'Where it struggles',
    limites: [
      'Everything depends on the licence: without it, half this page does not concern you.',
      'In Excel, large workbooks and badly structured data lose it quickly.',
      'It sees neither the local drive, nor non-Microsoft tools, nor untranscribed meetings.',
      'It reaches less far than Claude into third-party tools, and produces no artifact on screen.',
    ],
    autresTitre: 'It may not be your tool',
    autresTexte:
      'The path is chosen at the fourth module, and it can be changed. If your company runs on Google Workspace, start with Gemini.',
    versOutil: (nom) => `The ${nom} course`,
    versProgramme: 'See the full programme',
  },
  programme: {
    kicker: 'The full programme',
    titre: 'Copilot is one stage, not the whole course',
    chapeau:
      'What you buy is a course on using artificial intelligence at work. Copilot is its way in if your company runs on Microsoft 365.',
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
      `The Copilot path, ${f.lecture} lessons`,
      `${f.exercices} exercises reviewed`,
      `${f.jours} days of access`,
    ],
    synchro: 'amounts read from the application',
  },
  faq: {
    kicker: 'Questions',
    titre: 'What people ask us about the Copilot course',
    items: [
      {
        q: 'Do I need the Microsoft 365 Copilot licence to follow the course?',
        r: [
          'For the lessons on Word, Excel, Outlook and Teams, yes: those are licence features. The prompting method, judging answers and the rules around your data are learned without it, and they are the larger part of the path. We sell no Microsoft licences and take nothing from them.',
        ],
      },
      {
        q: 'My company bought Copilot and nobody uses it. Is this the right moment?',
        r: [
          'That is the most common situation in our sessions. A licence rolled out without training produces three uses: the meeting recap, the email draft, and abandonment. The path covers the five doors one by one, and above all what each one cannot do, which stops people expecting the impossible.',
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

export const copilot: Outil = {
  id: 'copilot',
  slug: 'copilot',
  nom: 'Microsoft Copilot',
  cleLecons: 'copilot',
  publie: true,
  renvoi: {
    fr: "Dans Word, Excel, Outlook et Teams, sur vos fichiers d'entreprise.",
    en: 'Inside Word, Excel, Outlook and Teams, on your own company files.',
  },
  copy: (locale: Locale) => (locale === 'fr' ? FR : EN),
};
