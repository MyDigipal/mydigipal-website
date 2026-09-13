// ============================================================
// La page outil « ChatGPT » - le contenu, en français et en anglais
// ============================================================
//
// Le compte achète, en français : formation chatgpt, meilleures formations
// chatgpt, cours chatgpt, formation ia chatgpt, formation chatgpt en ligne,
// formation chatgpt rédaction, formation prompt chatgpt, formation chatgpt
// débutant, bien utiliser chatgpt, apprendre chatgpt. En anglais : chatgpt
// prompt course, chatgpt training, chatgpt course online, chatgpt course for
// beginners, learn chatgpt, chatgpt course, chatgpt training course, chatgpt
// courses, chatgpt training program, introduction to chatgpt course, chatgpt
// online course.
//
// ⚠️ « bien utiliser chatgpt » porte à elle seule 318 impressions sur treize
// jours, et « comment se servir de chatgpt » 52. Ce sont des requêtes d'usage,
// pas d'achat : la page doit répondre à la question avant de vendre.
//
// ⚠️ Aucun nombre ici. Les leçons, les heures, les prix et la note arrivent en
// argument, lus dans l'application.

import type { Ecran, CopyOutil, Locale, Outil } from './types';
import { livrablesDe } from './livrables';

const IMG = '/academy/outils/chatgpt';

/* ---------------------------------------------------------------- écrans FR */

function ecransFr(): Ecran[] {
  return [
    {
      id: 'gpt',
      onglet: 'Les GPT sur mesure',
      ongletTexte: "Un assistant réglé une fois, que toute l'équipe utilise ensuite.",
      image: `${IMG}/gpt-editeur-configurer.png`,
      alt: "L'éditeur de GPT de ChatGPT : nom, description, instructions, base de connaissances",
      repos: {
        titre: 'Un assistant que vous réglez une fois',
        texte:
          "Un GPT est une conversation préconfigurée : vos instructions, vos documents de référence, votre ton. Vous le partagez, et l'équipe cesse de réécrire le même prompt dix fois par semaine.",
        lecon: 'Leçon 3 : construire son assistant, et ce qu’il ne fera pas.',
      },
      points: [
        {
          x: 31,
          y: 11,
          titre: 'Créer, ou configurer',
          texte:
            "Deux façons de monter un GPT : le décrire en conversation, ou remplir les champs soi-même. La leçon montre pourquoi la seconde donne un résultat qu'on peut corriger.",
          lecon: "Leçon 3 : l'assistant personnalisé, monté devant vous.",
        },
        {
          x: 25,
          y: 58,
          titre: 'Les instructions',
          texte:
            "Ce que le GPT fait, comment il se comporte, et ce qu'il doit éviter. C'est ici que la méthode de prompting se dépose une fois pour toutes, au lieu d'être retapée à chaque conversation.",
          lecon: 'Module « La méthode de prompting » : les cinq pièces, appliquées.',
        },
        {
          x: 10,
          y: 90,
          titre: 'La base de connaissances',
          texte:
            "Vos fichiers, chargés dans le GPT. La leçon dit franchement ce que cela implique : les conversations peuvent en révéler le contenu, donc on choisit ce qu'on y met.",
          lecon: "Module « Vos données et le cadre d'usage ».",
        },
        {
          x: 72,
          y: 12,
          titre: "L'aperçu",
          texte:
            'On essaie le GPT pendant qu’on le règle, dans le panneau de droite. Le va-et-vient entre les instructions et le résultat est le vrai travail.',
          lecon: 'Leçon 3 : régler, essayer, corriger.',
        },
      ],
    },
    {
      id: 'recherche',
      onglet: 'La recherche et ses sources',
      ongletTexte: 'Chercher sur le web sans se faire raconter des histoires.',
      image: `${IMG}/recherche-web-sources.png`,
      alt: 'ChatGPT en recherche web : temps de réflexion, sources citées et tableau de résultats',
      repos: {
        titre: 'Chercher, et vérifier',
        texte:
          "ChatGPT va lire le web et cite ce qu'il a lu. La formation apprend à ouvrir ces sources plutôt qu'à les croire, et à repérer la réponse qui a l'air sûre d'elle sans l'être.",
        lecon: 'Module « Juger une réponse » : reconnaître ce qui est faux.',
      },
      points: [
        {
          x: 38,
          y: 94,
          titre: 'Le mode recherche',
          texte:
            "Il s'active explicitement. Sans lui, l'outil répond de mémoire, et sa mémoire s'arrête à une date. C'est la première cause de réponse fausse chez les gens qui l'utilisent depuis six mois.",
          lecon: 'Leçon 6 : la recherche sur le web.',
        },
        {
          x: 35,
          y: 25,
          titre: 'Le temps de réflexion',
          texte:
            "Quarante-et-une secondes ici. Une réponse instantanée à une question complexe est un signal : l'outil n'est pas allé chercher, il a récité.",
          lecon: 'Module « Juger une réponse ».',
        },
        {
          x: 52,
          y: 39,
          titre: 'La source citée',
          texte:
            "La pastille porte le document d'origine. La leçon apprend à l'ouvrir systématiquement sur les sujets qui engagent, et à voir quand elle ne dit pas ce que la réponse prétend.",
          lecon: 'Module « Recherche et veille sérieuses ».',
        },
        {
          x: 51,
          y: 63,
          titre: 'Le tableau qui sort',
          texte:
            'Des échéances mises en tableau, exploitables telles quelles. On demande le format dans la demande, sinon on reçoit trois paragraphes à retravailler.',
          lecon: 'Module « La méthode de prompting » : le format fait partie de la demande.',
        },
      ],
    },
    {
      id: 'memoire',
      onglet: 'Les instructions permanentes',
      ongletTexte: 'Le ton, la mémoire, et ce qu’il faut couper.',
      image: `${IMG}/personnalisation.png`,
      alt: 'Les réglages de personnalisation de ChatGPT : style, ton, mémoire et instructions permanentes',
      repos: {
        titre: 'Régler une fois, pour toutes les conversations',
        texte:
          "Le style des réponses, le ton, les listes à puces, les emojis, la mémoire. Ces réglages expliquent pourquoi deux personnes obtiennent des réponses différentes avec le même prompt.",
        lecon: 'Leçon 4 : les instructions permanentes et la mémoire.',
      },
      points: [
        {
          x: 37,
          y: 40,
          titre: 'Personnalisation',
          texte:
            "L'onglet que presque personne n'ouvre. C'est pourtant lui qui décide du ton par défaut de toutes vos réponses.",
          lecon: 'Leçon 4 : où ça se règle, et ce que ça change.',
        },
        {
          x: 63,
          y: 27,
          titre: 'Le style des réponses',
          texte:
            "« Efficace » plutôt que bavard, et le réglage des titres, des listes et des emojis. La moitié des reproches faits à l'outil se corrigent ici en trente secondes.",
          lecon: 'Leçon 4 : le ton, réglé une fois.',
        },
        {
          x: 66,
          y: 74,
          titre: 'Les réponses rapides',
          texte:
            "Un raccourci qui répond sans votre mémoire ni vos réglages. Pratique, sauf le jour où vous comptiez justement dessus : la leçon dit quand le couper.",
          lecon: 'Leçon 4 : ce qu’il vaut mieux désactiver.',
        },
        {
          x: 48,
          y: 93,
          titre: 'Les instructions personnalisées',
          texte:
            'Qui vous êtes, ce que vous faites, comment vous voulez qu’on vous réponde. Trois lignes bien écrites ici valent mieux que dix prompts rallongés.',
          lecon: 'Module « La méthode de prompting » : le contexte, posé une fois.',
        },
      ],
    },
  ];
}

/* ---------------------------------------------------------------- écrans EN */

function ecransEn(): Ecran[] {
  const fr = ecransFr();
  const textes: Array<{
    onglet: string;
    ongletTexte: string;
    alt: string;
    repos: { titre: string; texte: string; lecon: string };
    points: Array<{ titre: string; texte: string; lecon: string }>;
  }> = [
    {
      onglet: 'Custom GPTs',
      ongletTexte: 'An assistant set up once, then used by the whole team.',
      alt: 'The ChatGPT builder: name, description, instructions, knowledge base',
      repos: {
        titre: 'An assistant you set up once',
        texte:
          'A GPT is a pre-configured conversation: your instructions, your reference documents, your tone. You share it, and the team stops rewriting the same prompt ten times a week.',
        lecon: 'Lesson 3: building your assistant, and what it will not do.',
      },
      points: [
        {
          titre: 'Create, or configure',
          texte:
            'Two ways to build a GPT: describe it in conversation, or fill the fields yourself. The lesson shows why the second gives you something you can actually correct.',
          lecon: 'Lesson 3: the custom assistant, built in front of you.',
        },
        {
          titre: 'Instructions',
          texte:
            'What the GPT does, how it behaves, what it must avoid. This is where the prompting method settles once, instead of being retyped in every conversation.',
          lecon: 'Prompting module: the five parts, applied.',
        },
        {
          titre: 'The knowledge base',
          texte:
            'Your files, loaded into the GPT. The lesson is blunt about what that means: conversations can reveal their contents, so you choose what goes in.',
          lecon: 'Module on data and rules of use.',
        },
        {
          titre: 'The preview',
          texte:
            'You try the GPT while you set it up, in the right-hand panel. The back and forth between instructions and result is the actual work.',
          lecon: 'Lesson 3: set it, try it, fix it.',
        },
      ],
    },
    {
      onglet: 'Search and its sources',
      ongletTexte: 'Searching the web without being told stories.',
      alt: 'ChatGPT searching the web: thinking time, cited sources and a results table',
      repos: {
        titre: 'Search, then check',
        texte:
          'ChatGPT reads the web and cites what it read. The course teaches you to open those sources rather than trust them, and to spot the answer that sounds certain without being right.',
        lecon: 'Module on judging an answer: spotting what is wrong.',
      },
      points: [
        {
          titre: 'Search mode',
          texte:
            'It has to be switched on. Without it the tool answers from memory, and its memory stops at a date. That is the leading cause of wrong answers among six-month users.',
          lecon: 'Lesson 6: searching the web.',
        },
        {
          titre: 'Thinking time',
          texte:
            'Forty-one seconds here. An instant answer to a complex question is a signal: the tool did not go and look, it recited.',
          lecon: 'Module on judging an answer.',
        },
        {
          titre: 'The cited source',
          texte:
            'The chip carries the original document. The lesson teaches you to open it every time the subject commits you, and to see when it does not say what the answer claims.',
          lecon: 'Module on serious research and monitoring.',
        },
        {
          titre: 'The table that comes out',
          texte:
            'Deadlines laid out as a table, usable as they are. You ask for the format in the request, otherwise you get three paragraphs to rework.',
          lecon: 'Prompting module: the format is part of the request.',
        },
      ],
    },
    {
      onglet: 'Permanent instructions',
      ongletTexte: 'Tone, memory, and what to switch off.',
      alt: 'ChatGPT personalisation settings: style, tone, memory and custom instructions',
      repos: {
        titre: 'Set it once, for every conversation',
        texte:
          'Response style, tone, bullet lists, emoji, memory. These settings explain why two people get different answers from the same prompt.',
        lecon: 'Lesson 4: permanent instructions and memory.',
      },
      points: [
        {
          titre: 'Personalisation',
          texte:
            'The tab almost nobody opens. It is the one that decides the default tone of every answer you get.',
          lecon: 'Lesson 4: where it is set, and what it changes.',
        },
        {
          titre: 'Response style',
          texte:
            'Efficient rather than chatty, plus the settings for headings, lists and emoji. Half the complaints about the tool are fixed here in thirty seconds.',
          lecon: 'Lesson 4: tone, set once.',
        },
        {
          titre: 'Quick answers',
          texte:
            'A shortcut that answers without your memory or your settings. Handy, except on the day you were counting on them: the lesson says when to turn it off.',
          lecon: 'Lesson 4: what is better switched off.',
        },
        {
          titre: 'Custom instructions',
          texte:
            'Who you are, what you do, how you want to be answered. Three well-written lines here beat ten padded prompts.',
          lecon: 'Prompting module: context, written once.',
        },
      ],
    },
  ];
  return fr.map((e, i) => ({
    ...e,
    onglet: textes[i].onglet,
    ongletTexte: textes[i].ongletTexte,
    alt: textes[i].alt,
    repos: textes[i].repos,
    points: e.points.map((p, j) => ({ ...p, ...textes[i].points[j] })),
  }));
}

/* ------------------------------------------------------------------ copy FR */

const FR: CopyOutil = {
  barre: {
    outil: 'ChatGPT',
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
    titre: 'Formation ChatGPT en ligne : le programme',
    description:
      "Formation ChatGPT en ligne : la méthode de prompting, les GPT sur mesure, la recherche et ses sources, puis les automatisations. Pour bien utiliser ChatGPT.",
  },
  hero: {
    kicker: 'Formation ChatGPT - OpenAI',
    titre: 'Formation ChatGPT : bien utiliser l’outil que vous ',
    accent: 'avez déjà',
    sous:
      "La méthode de prompting d'abord, le parcours ChatGPT ensuite, puis les automatisations. Cours en ligne, à votre rythme, en français.",
    cta: (prix) => `Commencer, ${prix}`,
    cta2: (lecons) => `${lecons} leçons offertes`,
    capture: 'chatgpt.com - un GPT en préparation',
    note: (retours) => `sur ${retours} retours`,
    lecons: (dansOutil) => `leçons, dont ${dansOutil} sur ChatGPT`,
    heures: "de lecture et d'exercices",
  },
  console: {
    kicker: 'Ce que vous apprenez à piloter',
    titre: 'ChatGPT, écran par écran',
    chapeau:
      "Trois endroits que six mois d'usage ne font pas découvrir, et qui séparent la conversation du travail sérieux.",
    indice: (n) => `${n} repères sur cet écran`,
    ecrans: ecransFr(),
  },
  livrables: {
    kicker: 'Des vrais documents',
    titre: 'Ce qui sort de la formation',
    chapeau:
      "Cinq documents produits pendant une session, devant la salle, à partir de la matière d'une entreprise. Ouvrez-les : c'est le genre de choses que vous rendrez.",
    ouvrir: 'Ouvrir le document',
    items: livrablesDe('chatgpt'),
  },
  demo: {
    kicker: 'La méthode, appliquée à ChatGPT',
    titre: 'La même demande, écrite deux fois',
    chapeau:
      "Ce que la formation change tient dans cet écart. Cinq pièces à poser dans la demande : le contexte, le rôle, l'action, le format, le ton.",
    avantTete: 'Ce que la plupart des gens écrivent',
    avantPrompt: 'Écris-moi un mail pour relancer un client.',
    avantReponse:
      "Objet : Suivi de notre proposition. Bonjour, j'espère que vous allez bien. Je me permets de revenir vers vous concernant notre proposition envoyée récemment. N'hésitez pas à me faire part de vos retours. Dans l'attente de votre réponse, je reste à votre disposition.",
    apresTete: 'La même, une fois la méthode apprise',
    apresPrompt:
      "Tu es responsable commercial dans une PME d'agencement. Un client a reçu un devis de 48 000 euros il y a douze jours, il avait promis une réponse sous une semaine, et nous avons déjà échangé trois fois par téléphone.\n\nÉcris la relance. Format : six lignes maximum, un objet, une question précise à la fin. Rappelle un élément de nos échanges plutôt qu'une formule.\n\nTon direct et cordial. Pas de « j'espère que vous allez bien », pas de « n'hésitez pas ».",
    apresReponse:
      "Objet : le délai de pose de janvier, toujours tenable\n\nBonjour Marc, vous m'aviez dit vouloir livrer avant la reprise de janvier. Le créneau de pose que je vous réservais tient jusqu'à vendredi. Faut-il que je le maintienne, ou préférez-vous décaler à février ?",
    artefactTitre: 'Ce qui a changé',
    artefactTexte:
      "Le contexte a remplacé la politesse. Le mail parle du délai de pose, pas de la proposition, et il pose une question à laquelle on répond par oui ou par non.",
    vous: 'Vous',
  },
  lecons: {
    kicker: 'Le parcours ChatGPT',
    titre: (n) => `Les ${n} leçons du module`,
    chapeau:
      'Elles arrivent après la méthode de prompting, et avant les automatisations. Vous choisissez un outil, et le parcours ne garde que celui-là.',
  },
  franchise: {
    kicker: 'Honnêtement',
    titre: 'Ce que ChatGPT fait mieux, et là où il coince',
    chapeau: "Une formation qui ne dit que du bien de son outil ne sert à rien le jour où l'outil coince.",
    forcesTitre: 'Là où il est devant',
    forces: [
      "Le plus répandu : vos interlocuteurs l'ont, vos prestataires l'ont, les exemples circulent.",
      'Les GPT sur mesure, partageables à toute une équipe sans écrire une ligne de code.',
      "La génération d'images dans la conversation, que Claude ne fait pas.",
      'La recherche web, rapide et sourcée, quand on pense à la déclencher.',
    ],
    limitesTitre: 'Là où il coince',
    limites: [
      "La mémoire surprend : il se souvient de ce qu'on croyait oublié, et oublie ce qu'on croyait acquis.",
      "La version gratuite n'ouvre presque rien de ce dont on parle ici.",
      "Les réglages par défaut donnent des réponses bavardes, et presque personne ne les change.",
      "Il se branche moins loin sur vos données que Claude ou que Copilot dans Microsoft 365.",
    ],
    autresTitre: "Ce n'est peut-être pas votre outil",
    autresTexte:
      'Le parcours se choisit au quatrième module, et il se change. Si vous travaillez déjà toute la journée dans une autre suite, commencez par là.',
    versOutil: (nom) => `La formation ${nom}`,
    versProgramme: 'Voir le programme complet',
  },
  programme: {
    kicker: 'Le programme complet',
    titre: 'ChatGPT est une étape, pas la formation entière',
    chapeau:
      "Ce que vous achetez est une formation à l'intelligence artificielle au travail. ChatGPT en est la porte d'entrée la plus courante.",
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
      `Le parcours ChatGPT, ${f.lecture} leçons`,
      `${f.exercices} exercices relus`,
      `${f.jours} jours d'accès`,
    ],
    synchro: "montants lus dans l'application",
  },
  faq: {
    kicker: 'Questions',
    titre: "Ce qu'on nous demande sur la formation ChatGPT",
    items: [
      {
        q: 'La version gratuite de ChatGPT suffit-elle pour suivre la formation ?',
        r: [
          "Pour les premières leçons, oui. Les GPT sur mesure, la recherche approfondie et l'analyse de fichiers demandent un abonnement chez OpenAI, que nous ne vendons pas et qui ne passe pas par nous. La formation dit à quel moment ça devient nécessaire, et ce qu'on peut faire sans.",
        ],
      },
      {
        q: "J'utilise ChatGPT depuis un an. Qu'est-ce que j'y apprendrai ?",
        r: [
          "C'est le profil le plus fréquent dans nos sessions, et celui qui progresse le plus. Ce qui change n'est pas l'outil, c'est la façon de demander : les cinq pièces d'une demande, la reprise d'une réponse qui rate, le jugement de ce qui sort. Les réglages permanents, les GPT et la recherche sourcée font le reste.",
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
        q: 'Est-ce quil y a une attestation ?',
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
    outil: 'ChatGPT',
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
    titre: 'ChatGPT course online: the full programme',
    description:
      'ChatGPT training online: the prompting method, custom GPTs, web search with its sources, then automations. For beginners and six-month users alike.',
  },
  hero: {
    kicker: 'ChatGPT training - OpenAI',
    titre: 'ChatGPT course: get real work out of the tool you ',
    accent: 'already have',
    sous:
      'The prompting method first, then the ChatGPT path, then the automations that run without you. Online, at your own pace.',
    cta: (prix) => `Start now, ${prix}`,
    cta2: (lecons) => `${lecons} free lessons`,
    capture: 'chatgpt.com - a GPT being built',
    note: (retours) => `from ${retours} reviews`,
    lecons: (dansOutil) => `lessons, ${dansOutil} of them on ChatGPT`,
    heures: 'of reading and exercises',
  },
  console: {
    kicker: 'What you learn to drive',
    titre: 'ChatGPT, screen by screen',
    chapeau:
      'Three places six months of use will not show you, and they are what separates chatting from serious work.',
    indice: (n) => `${n} markers on this screen`,
    ecrans: ecransEn(),
  },
  resultats: {
    kicker: 'On the way out',
    titre: 'What you will be able to do with ChatGPT',
    chapeau: 'Not knowledge about AI. Things you hand to someone.',
    items: [
      {
        titre: 'A follow-up that gets answered',
        texte: 'Context instead of politeness, one clear question, six lines. The lesson rewrites yours.',
      },
      {
        titre: 'A GPT your team shares',
        texte: 'Your instructions and your reference files, set once, used by everyone after that.',
      },
      {
        titre: 'A sourced answer you can defend',
        texte: 'Web search switched on, sources opened, and the claim that did not survive checking.',
      },
      {
        titre: 'A long file, read properly',
        texte: 'A contract or a report attached, questioned rather than summarised into vagueness.',
      },
      {
        titre: 'An assistant with your tone',
        texte: 'Permanent instructions that stop every answer arriving chatty and padded with headings.',
      },
      {
        titre: 'The right tool at the right moment',
        texte:
          'A way of choosing between ChatGPT, Claude, Copilot and Gemini that does not expire at the next release.',
      },
    ],
  },
  demo: {
    kicker: 'The method, applied to ChatGPT',
    titre: 'The same request, written twice',
    chapeau:
      'What the course changes sits in this gap. Five parts to put into a request: context, role, action, format, tone.',
    avantTete: 'What most people type',
    avantPrompt: 'Write me an email to follow up with a client.',
    avantReponse:
      'Subject: Following up on our proposal. Hello, I hope this email finds you well. I am reaching out regarding the proposal we sent recently. Please do not hesitate to share your feedback. Looking forward to hearing from you.',
    apresTete: 'The same one, once the method is learned',
    apresPrompt:
      'You are the sales lead in a small joinery firm. A client received a 48,000 euro quote twelve days ago, promised an answer within a week, and we have already spoken three times by phone.\n\nWrite the follow-up. Format: six lines maximum, a subject line, one precise question at the end. Refer to something from our conversations rather than a stock phrase.\n\nDirect and warm. No "I hope this finds you well", no "do not hesitate".',
    apresReponse:
      'Subject: the January fitting slot, still workable\n\nHello Marc, you told me you wanted this delivered before the January restart. The fitting slot I was holding for you stands until Friday. Should I keep it, or would you rather move to February?',
    artefactTitre: 'What changed',
    artefactTexte:
      'Context replaced politeness. The email talks about the fitting slot, not the proposal, and it asks a question you answer with yes or no.',
    vous: 'You',
  },
  lecons: {
    kicker: 'The ChatGPT path',
    titre: (n) => `The ${n} lessons of the module`,
    chapeau:
      'They come after the prompting method and before the automations. You choose one tool, and the path keeps only that one.',
  },
  franchise: {
    kicker: 'Honestly',
    titre: 'What ChatGPT does better, and where it struggles',
    chapeau: 'A course that only praises its tool is worthless on the day the tool lets you down.',
    forcesTitre: 'Where it leads',
    forces: [
      'The most widespread: your contacts have it, your suppliers have it, the examples circulate.',
      'Custom GPTs, shareable across a team without writing a line of code.',
      'Image generation inside the conversation, which Claude does not do.',
      'Web search, fast and sourced, when you remember to switch it on.',
    ],
    limitesTitre: 'Where it struggles',
    limites: [
      'Memory surprises people: it remembers what you thought was gone, and forgets what you thought was set.',
      'The free tier opens almost none of what this page is about.',
      'Default settings produce chatty answers, and almost nobody changes them.',
      'It reaches less far into your own data than Claude, or than Copilot inside Microsoft 365.',
    ],
    autresTitre: 'It may not be your tool',
    autresTexte:
      'The path is chosen at the fourth module, and it can be changed. If you already spend the day inside another suite, start there.',
    versOutil: (nom) => `The ${nom} course`,
    versProgramme: 'See the full programme',
  },
  programme: {
    kicker: 'The full programme',
    titre: 'ChatGPT is one stage, not the whole course',
    chapeau:
      'What you buy is a course on using artificial intelligence at work. ChatGPT is its most common way in.',
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
      `The ChatGPT path, ${f.lecture} lessons`,
      `${f.exercices} exercises reviewed`,
      `${f.jours} days of access`,
    ],
    synchro: 'amounts read from the application',
  },
  faq: {
    kicker: 'Questions',
    titre: 'What people ask us about the ChatGPT course',
    items: [
      {
        q: 'Is the free version of ChatGPT enough to follow the course?',
        r: [
          'For the first lessons, yes. Custom GPTs, deep research and file analysis need a paid plan with OpenAI, which we do not sell and which does not go through us. The course says when that becomes necessary, and what you can do without it.',
        ],
      },
      {
        q: 'I have used ChatGPT for a year. What is left to learn?',
        r: [
          'That is the most common profile in our sessions, and the one that gains the most. What changes is not the tool, it is how you ask: the five parts of a request, recovering an answer that missed, judging what comes out. Permanent settings, custom GPTs and sourced search do the rest.',
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

export const chatgpt: Outil = {
  id: 'chatgpt',
  slug: 'chatgpt',
  nom: 'ChatGPT',
  cleLecons: 'chatgpt',
  publie: true,
  renvoi: {
    fr: 'Le plus répandu : les GPT sur mesure, les fichiers, la recherche.',
    en: 'The most widespread: custom GPTs, files, and search.',
  },
  copy: (locale: Locale) => (locale === 'fr' ? FR : EN),
};
