// ============================================================
// AI Academy - Les textes de la page de vente (copie synchronisée de
// mydigipal-academy/src/lib/academy/jour30-copy.ts, sans les chiffres)
// ============================================================
//
// Deux langues, une seule forme : `FR` fait le gabarit (son type est celui du
// dictionnaire), `EN` doit le remplir champ pour champ, sinon le compilateur
// refuse. L'anglais est servi sur `/jour-30`, le français sur `/fr/jour-30`,
// comme `/` et `/fr` pour la page de vente classique.
//
// Ce que ce fichier ne contient PAS, et c'est voulu : aucun chiffre du jeu
// (points, rangs, seuils), aucun prix, aucun nombre de leçons. Ils viennent de
// `game.ts`, `offers.ts`, du catalogue et de `jour30-story.ts`, et les
// composants les insèrent. Un texte qui porte un chiffre se périme ; un texte
// qui l'appelle, non.
//
// Règles d'écriture reprises du système (design/handoff-jour-30/DESIGN.md et
// skill design-taste-frontend) : aucun tiret long, au plus un point médian par
// ligne, pas de libellé de rubrique au-dessus de chaque section, pas de
// numéro de section, pas de « Métier 1 / Métier 2 ».

import type { Locale, Avis } from './data';
import { noteLocale } from './data';

// Les cinq lettres de la méthode, telles qu'elles sont enseignées. C'est du
// vocabulaire, pas un chiffre : il peut vivre ici.
const CRAFT = {
  fr: { context: 'Contexte', role: 'Rôle', action: 'Action', format: 'Format', tone: 'Ton' },
  en: { context: 'Context', role: 'Role', action: 'Action', format: 'Format', tone: 'Tone' },
} as const;
const craft = (key: keyof typeof CRAFT.fr, locale: Locale) => CRAFT[locale][key];

const FR = {
  meta: {
    title: 'Trente jours dans un compte MyDigipal Academy',
    description:
      'La formation IA des professionnels, montrée depuis l’intérieur : trente jours du parcours d’une apprenante, dans l’espace réel du produit, avec les règles de points du code.',
  },

  ouverture: {
    titre: 'La même demande, écrite deux fois.',
    sous: 'Vous connaissez la première. La seconde sort un livrable que vous pouvez envoyer sans le retoucher.',
    etat: {
      demo: 'Démonstration',
      flat: 'Sans méthode',
      craft: 'Réécrit avec CRAFT',
      ask: 'À vous',
    },
    laDemande: 'La demande',
    ceQueCaDonne: 'Ce que ça donne',
    reecrite: 'Réécrite, champ par champ',
    maintenant: 'Ce que ça donne maintenant',
    vague: 'Écris un mail pour relancer un client qui ne répond pas',
    plate:
      'Objet : Relance\n\nBonjour,\n\nJe me permets de revenir vers vous concernant notre échange. N’hésitez pas à me faire un retour dès que possible.\n\nDans l’attente, je reste à votre disposition.\n\nCordialement,',
    riche:
      'Objet : Votre proposition du 3, je reprends la main\n\nBonjour Marc,\n\nTrois semaines sans retour, et je préfère poser la question franchement : est-ce le budget, le calendrier, ou le périmètre ?\n\nSelon la réponse j’ai une option pour chacun, et aucune ne demande de repartir de zéro.\n\nJe vous appelle jeudi 11 h si je n’ai rien d’ici là.',
    /** Les quatre champs fixes ; le contexte est ce que le visiteur tape. */
    champs: {
      contexte: craft('context', 'fr'),
      role: { label: craft('role', 'fr'), value: 'Tu es un directeur commercial avec vingt ans de vente de missions de conseil.' },
      action: {
        label: craft('action', 'fr'),
        value: 'Propose une relance qui pose une seule question fermée et donne une porte de sortie.',
      },
      format: { label: craft('format', 'fr'), value: 'Un courriel de 120 mots maximum, avec un objet. Pas de formule toute faite.' },
      ton: {
        label: craft('tone', 'fr'),
        value: 'Direct et cordial. Interdit : citer un montant, promettre un délai, mentionner un concurrent.',
      },
    },
    revoir: 'Revoir',
    essayer: 'Avec ma demande',
    lancer: 'Réécrire ma demande',
    votreDemande: 'Votre demande à vous',
    placeholder: 'La tâche que vous confieriez à une IA aujourd’hui',
    sansAppel:
      'Aucun modèle n’est appelé ici. La réponse plate est le symptôme d’une demande sans contexte, pas une exécution réelle.',
    note: 'Cinq champs. C’est la deuxième leçon du programme.',
  },

  hero: {
    titre: 'La formation IA en ligne, tirée de trois ans à former des équipes.',
    sous: (lecons: number, prix: string) =>
      `${lecons} leçons à votre rythme, la méthode CRAFT, vos exercices relus par un humain, jusqu’aux agents et aux serveurs MCP. Dès ${prix} €.`,
    /**
     * La répartition, dite près du prix.
     *
     * Le gros chiffre est celui du parcours entier (arbitrage de Paul, 28/08) :
     * sans cette ligne, l'acheteur découvrirait le premier jour que sept
     * modules relèvent du complément.
     */
    repartition: (programme: number, complement: number) =>
      `${programme} leçons dans la méthode, ${complement} de plus si vous prenez aussi les automatisations.`,
    cta: 'Commencer',
    cta2: (n: number) => `Essayer ${n} leçons, gratuitement`,
    url: 'academy.mydigipal.com/app',
    alt: 'Le tableau de bord de l’espace apprenant',
  },

  ailleurs: {
    titre: 'Vous préférez une salle, ou un projet à nous confier ?',
    lignes: [
      { label: 'Former une équipe, en présentiel ou à distance', href: '/fr/services/ai-training' },
      { label: 'Faire construire vos agents et vos automatisations', href: '/fr/services/ai-solutions' },
    ],
  },

  visite: {
    titre: 'Ce qu’il y a dedans.',
    sous: 'L’espace apprenant, tel que vous l’ouvrirez. Survolez un élément : il vous dit à quoi il sert.',
    sousTactile: 'L’espace apprenant, tel que vous l’ouvrirez. Touchez un élément : il vous dit à quoi il sert.',
    voirLecran: 'Voir cet écran',
    nav: ['Parcours', 'Outils', 'Mon espace'],
    bandeau: { kicker: 'Mon espace', titre: 'Bonjour Clara', ligne: 'Les deux programmes, tout le parcours ouvert.' },
    cartes: {
      kicker: 'Votre parcours',
      reprendre: 'Reprendre',
      continuer: 'Continuer',
      p1: {
        titre: 'La méthode',
        ligne: 'De zéro à autonome avec l’IA générative : la méthode CRAFT, les outils, les cas de votre métier.',
        avancement: (f: number, n: number) => `${f} leçons sur ${n}`,
      },
      p2: {
        titre: 'Les automatisations',
        ligne: 'Agents, chaînes MCP, serveurs, et dix-sept cas réels.',
        avancement: (f: number, n: number) => `${f} leçons sur ${n}`,
      },
    },
    rail: {
      reprendreTitre: 'Reprendre là où vous étiez',
      lecon: 'Une action, un verbe',
      reste: '6 min restantes',
      continuer: 'Continuer la leçon',
      accesTitre: 'Accès rapides',
      acces: {
        atelier: 'Atelier CRAFT',
        prompts: 'Bibliothèque de prompts',
        cas: 'Cas d’usage',
        notes: 'Mes notes',
        exercices: 'Exercices et quiz',
        assistant: 'Assistant IA',
        profil: 'Mon profil',
      },
      activiteTitre: 'Votre activité',
      lecons: 'Leçons terminées',
    },
    pitch: {
      kicker: 'Ce qui le distingue',
      titre: 'Une formation qui part du travail, pas de la veille.',
      points: [
        'La méthode CRAFT, enseignée en salle depuis trois ans, écrite leçon par leçon.',
        'Des exercices sur vos propres cas, relus par un humain, pas par un script.',
        'La partie que personne n’enseigne : brancher les outils, les agents et les serveurs MCP.',
        'Un compte qui se remplit : points, série, trophées, attestation.',
      ],
      indice: 'Survolez un élément de l’écran pour le découvrir.',
      indiceTactile: 'Touchez un élément de l’écran pour le découvrir.',
    },
    assistant: {
      question: 'Quelle différence entre un agent et une automatisation ?',
      reponse:
        'Une automatisation suit un chemin écrit d’avance : mêmes étapes, même ordre. Un agent reçoit un but et choisit ses étapes, en appelant des outils si besoin. Pour un reporting hebdomadaire, une automatisation suffit.',
      source: 'Source : les leçons du niveau 3 sur les agents',
    },
    spots: (f: { lessons: number; modules: number; prompts: number; trophees: number; relectures: number; lessonsConstruire: number; lessonsProgramme?: number; lessonsComplement?: number }) => ({
      parcours1: {
        kicker: 'La méthode',
        titre: 'Tout le parcours, du premier prompt aux cas de votre métier.',
        texte: `${f.lessonsProgramme ?? f.lessons} leçons en ${f.modules} modules, trois niveaux. Chaque leçon écrite : un plan, un exemple, un prompt à copier, et un « À vous » à rendre.`,
      },
      parcours2: {
        kicker: 'Les automatisations',
        titre: 'Agents, automatisations, serveurs MCP.',
        texte: `${f.lessonsConstruire} leçons dans leur propre parcours et dix-sept cas réels de l’agence. C’est là qu’on branche les outils les uns aux autres.`,
      },
      reprendre: {
        kicker: 'Reprendre',
        titre: 'Là où vous vous êtes arrêté.',
        texte: 'La leçon en cours, le temps qu’il reste, un bouton. Le rail est là sur chaque écran : vous ne cherchez jamais où vous en étiez.',
      },
      atelier: {
        kicker: 'L’atelier CRAFT',
        titre: 'Cinq champs, et le prompt s’écrit sous vos yeux.',
        texte: 'Contexte, rôle, action, format, ton : vous remplissez, il s’assemble, vous le copiez dans votre outil. Le même atelier sert à auditer un prompt déjà écrit.',
      },
      prompts: {
        kicker: 'La bibliothèque',
        titre: `${f.prompts} prompts tirés des leçons.`,
        texte: 'Classés par module, copiables en un geste, ouverts directement dans Claude ou ChatGPT. Les vôtres s’y enregistrent aussi.',
      },
      cas: {
        kicker: 'Les cas d’usage',
        titre: 'Des situations de métier, pas des exemples de démonstration.',
        texte: 'Un compte rendu à anonymiser, une annonce à décliner, un export à nettoyer : la demande, la réponse, et ce qui a fait la différence.',
      },
      notes: {
        kicker: 'Vos notes',
        titre: 'Prises dans la leçon, retrouvées ensemble.',
        texte: 'Une note s’écrit sans quitter la page, et se retrouve dans un carnet, leçon par leçon.',
      },
      exercices: {
        kicker: 'Les exercices et les quiz',
        titre: 'Déposés depuis la leçon, relus par un humain.',
        texte: `Un quiz par module, noté côté serveur. Les exercices sont relus par Paul avec les automatisations, ${f.relectures} relectures incluses.`,
      },
      assistant: {
        kicker: 'L’assistant IA',
        titre: 'Il répond à partir de vos leçons, et cite la source.',
        texte: 'Une question à 23 h, une réponse tirée du programme, jamais inventée : il ne connaît que ce que vous avez.',
      },
      points: {
        kicker: 'Les points et la série',
        titre: 'On paie la pratique, pas la lecture.',
        texte: `Une leçon terminée, un exercice déposé, un quiz réussi : chacun rapporte. Cinq rangs, ${f.trophees} trophées dont quatre secrets, une série de jours avec un joker quand vous en ratez un.`,
      },
      profil: {
        kicker: 'Le profil',
        titre: 'Le calendrier, les trophées, l’attestation.',
        texte: 'Une année de petits carrés, un par jour actif ; les trophées obtenus ; et l’attestation à imprimer quand le parcours est terminé, avec mention.',
      },
    }),
  },

  mention: {
    kicker: 'Compte de démonstration',
    titre: 'Trente jours, deux quinzaines, un compte qui se remplit.',
    etapes: [
      {
        jours: 'Jours 1 à 15',
        nom: 'La méthode',
        texte: 'CRAFT leçon par leçon, le module de votre outil, la bibliothèque de prompts, les premiers exercices rendus.',
        ton: 'or' as const,
      },
      {
        jours: 'Jours 16 à 30',
        nom: 'Les automatisations',
        texte: 'Les serveurs MCP, les agents, les chaînes qui tournent toutes seules, et l’attestation.',
        ton: 'avance' as const,
      },
    ],
    legende: 'L’or, c’est La méthode. Le bleu, ce sont Les automatisations. Les deux couleurs se retrouvent plus bas, dans les tarifs.',
    texte:
      'Ce qui suit est reconstitué à partir de l’espace apprenant réel : les écrans sont ceux du produit, les règles de points sont celles du code. Clara, elle, est composée : elle a pris la méthode, les automatisations et l’assistant.',
    bandeAlt: 'Une apprenante devant son espace, entourée de ses cartes de progression',
  },

  compte: {
    quinzaines: [
      { kicker: 'Quinzaine 1', nom: 'La méthode', titre: 'Quinze jours pour se lancer dans l’intelligence artificielle.' },
      { kicker: 'Quinzaine 2', nom: 'Les automatisations', titre: 'Elle arrête de faire. Elle fait faire.' },
    ],
    jour: (n: number) => `Jour ${n}`,
    claraAlt: 'Clara, l’apprenante dont ce récit suit les trente jours',
    j1: {
      phrase: 'Elle ouvre son compte. Paul l’accueille, en face caméra.',
      badge: 'Bienvenue',
      attente: 'Le mot d’accueil',
      alt: 'Paul accueille Clara en visioconférence, au premier jour de son parcours',
      note: 'Un mot d’accueil au premier jour, puis une vidéo d’ouverture par module : à quoi il sert, et ce qu’on saura faire en sortant.',
    },
    j2: {
      phrase: 'Elle apprend la méthode. Cinq champs, et la demande s’écrit toute seule.',
      kicker: 'La méthode CRAFT',
      titre: 'Cinq champs, dans cet ordre',
      champs: [
        { lettre: 'C', nom: 'Contexte', valeur: 'je suis chargée de compte chez un prestataire multi-sites' },
        { lettre: 'R', nom: 'Rôle', valeur: 'tu es analyste : tu tries et tu comptes, tu ne commentes pas' },
        { lettre: 'A', nom: 'Action', valeur: 'classe chaque réclamation dans un seul motif' },
        { lettre: 'F', nom: 'Format', valeur: 'un tableau croisé, motifs en lignes, sites en colonnes, avec les totaux' },
        { lettre: 'T', nom: 'Ton', valeur: 'factuel, ni introduction ni conclusion' },
      ],
      assemble: 'La demande, assemblée',
      copier: 'Copier',
      copie: 'Copié',
      pied: (n: number) => `${n} leçons écrites : plan, exemple, prompt`,
      terminee: (pts: number) => `Terminée, +${pts}`,
    },
    j3: {
      phrase: 'Elle rend un exercice, sur ses propres données.',
      kicker: 'Dépôt d’exercice',
      fichiers: ['reclamations-clients-T1.csv', 'delais-dossiers.csv'],
      fournis: 'fournis avec l’exercice',
      tache: { label: 'La tâche', value: 'Trier 180 réclamations clients par motif' },
      prompt: { label: 'Votre prompt', value: 'Contexte : je suis chargée de compte chez un prestataire multi-sites…' },
      obtenu: { label: 'Ce que vous avez obtenu', value: 'Un tableau croisé motifs et sites, avec les totaux' },
      attente: 'Rendu',
      pts: (n: number) => `+${n} points`,
      note: 'Un exercice par module, avec ses fichiers de départ. On le rend depuis la leçon, et on garde ce qu’on a produit.',
    },
    j6: {
      phrase: 'Le quiz du module 2. Sans faute, au premier essai.',
      titre: 'Module 2, le quiz',
      score: (ok: number, total: number) => `${ok} sur ${total}`,
      sansFaute: 'Sans faute',
      pts: (quiz: number, bonus: number) => `+${quiz} pour le quiz, +${bonus} pour le sans-faute`,
      note: 'Un quiz par module, noté côté serveur. Le sans-faute au premier passage vaut le double : on paie la révision, pas le par cœur.',
    },
    j9: {
      phrase: 'Elle choisit son outil. Le parcours ne garde que celui-là.',
      outils: ['Microsoft Copilot', 'Google Gemini', 'Claude', 'ChatGPT'],
      choisi: 'Claude',
      choisiLabel: 'Son outil',
      titre: 'Le module de son outil s’ouvre',
      sujets: [
        'Les réglages qui changent vraiment les réponses',
        'Les projets et la mémoire : ce qu’il retient, ce qu’il oublie',
        'Les fichiers : ce qu’on peut lui donner, et sous quelle forme',
        'Ce qu’il ne sait pas faire, et par quoi le remplacer',
      ],
      note: 'Le module des outils se choisit. Les quatre existent, écrits séparément ; on suit celui de l’outil qu’on a, et on peut en ouvrir un autre le jour où l’entreprise change.',
    },
    preuve: {
      question: 'Qui enseigne ?',
      texte:
        'Paul André, qui enseigne cette méthode en salle depuis trois ans, chez La Poste, Pierre Fabre ou E.Leclerc. Chaque leçon est écrite à partir de ce qui a marché devant de vraies équipes.',
      chiffres: (avis: Avis) => [
        { valeur: '2 500+', libelle: 'professionnels formés' },
        { valeur: `${noteLocale(avis.note, 'fr')}/10`, libelle: `sur ${avis.nombre} retours écrits` },
      ],
    },
    j11: {
      phrase: 'Question à 23 h. L’assistant répond, et il cite la leçon.',
      question:
        'Mon client veut un compte rendu de réunion à partir d’un enregistrement. Qu’est-ce que je ne dois surtout pas lui confier ?',
      reponse:
        'Les noms des personnes et tout ce qui identifie un dossier client. Anonymisez avant, réinjectez après : c’est plus rapide que de faire valider un traitement. Le reste passe sans risque.',
      source: 'Source : la leçon du module 3 sur ce qu’on ne confie jamais',
      note: 'L’assistant ne répond qu’à partir des leçons auxquelles elle a accès. Il ne peut ni inventer, ni citer du contenu qu’elle n’a pas.',
    },
    j14: {
      phrase: 'Cinq leçons dans la journée. Quelque chose tombe qu’elle ne cherchait pas.',
      meta: (metal: string, pts: number) => `Trophée secret · ${metal}, +${pts}`,
      note: (total: number, secrets: number) =>
        `${total} trophées, dont ${secrets} secrets : leur nom n’apparaît qu’une fois obtenus. Le meilleur métal dessine le cadre de l’avatar.`,
    },
    j12: {
      phrase: 'Elle arrête d’écrire ses prompts de zéro. Puis elle en ajoute un.',
      tous: (n: number) => `Tous · ${n}`,
      onglets: ['Module 2', 'Module 3', 'Module 4'],
      lignes: [
        'Trier des réclamations par motif et par site',
        'Réécrire une annonce en trois variantes testables',
      ],
      lesien: { texte: 'Compte rendu anonymisé, format imposé', tag: 'le sien' },
      copier: 'Copier',
    },
    j15: {
      phrase: 'On lui demande le visuel en trois formats. Pour hier.',
      tirez: 'Faites glisser : à gauche la photo envoyée par le client, à droite le visuel prêt à publier.',
      fourni: 'La photo reçue',
      recadre: 'Détouré, habillé',
      comparer: 'Comparer les deux visuels',
      altAvant: 'La photo du vélo, telle que le client l’a envoyée',
      altApres: 'Le même vélo détouré, recadré et habillé aux couleurs de la marque',
      note: 'Quatre formats, un fond retiré, une déclinaison verticale. Vingt minutes, pas une demi-journée de retouche.',
    },
    j18: {
      phrase: 'Elle branche son premier serveur. Il lit son agenda, et rien d’autre.',
      kicker: 'Serveur connecté',
      serveur: 'Agenda Google',
      droits: [
        { texte: 'Lire les rendez-vous des sept prochains jours', ouvert: true },
        { texte: 'Lire les participants et les pièces jointes', ouvert: true },
        { texte: 'Créer ou déplacer un rendez-vous', ouvert: false },
        { texte: 'Écrire à un participant', ouvert: false },
      ],
      note: 'Un serveur MCP se branche prise par prise, et chaque prise se règle en lecture ou en écriture. Ouvrir l’écriture est une décision, pas un réglage par défaut.',
    },
    j21: {
      phrase: 'Lundi, huit heures. Ses relances sont écrites. Elle les relit, elle envoie.',
      kicker: 'Chaîne · Relances du lundi',
      sources: ['Facturier', 'Boîte mail', 'Agenda'],
      ia: 'Rédige',
      barriere: 'Elle relit',
      sorties: ['Quatre relances', 'Un cas à trancher'],
      note: 'La chaîne prépare, elle n’envoie rien. Le point d’arrêt est écrit dans la chaîne elle-même : rien ne part sans qu’elle ait cliqué.',
    },
    j22: {
      phrase: 'Trente minutes en visio. Préparées : il a lu ses exercices avant.',
      direct: 'En direct',
      vous: 'vous',
      alt: 'Session de formation MyDigipal',
      note: 'Elle repart avec un document écrit après l’appel, pas avec des notes.',
    },
    j24: {
      phrase: 'Un agent surveille ses livraisons. Il agit dans son couloir, il demande pour le reste.',
      kicker: 'Agent · Livraisons',
      lignes: [
        { h: '06:12', texte: 'Trois retards repérés. Clients prévenus.', accord: false },
        { h: '06:13', texte: 'Créneau reprogrammé pour deux d’entre eux.', accord: false },
        { h: '06:14', texte: 'Geste commercial sur le troisième.', accord: true },
      ],
      attend: 'En attente de votre accord',
      note: 'Le couloir de l’agent s’écrit avant de le lancer : ce qu’il fait seul, ce qu’il propose, et le montant au-delà duquel il s’arrête.',
    },
    j26: {
      phrase: 'Elle construit son premier serveur MCP. Et là, il faut s’arrêter deux minutes.',
      badge: 'Serveur MCP, en ligne',
      outils: (n: number) => `${n} outils connectés`,
    },
    j28: {
      phrase: 'Elle compte. Pas une promesse : son relevé, sur sa semaine.',
      kicker: 'Mon relevé de la semaine',
      colonnes: ['Avant', 'Après'],
      taches: [
        { nom: 'Relances clients du lundi', avant: '1 h 30', apres: '15 min' },
        { nom: 'Comptes rendus de réunion', avant: '2 h', apres: '20 min' },
        { nom: 'Visuels et déclinaisons', avant: '3 h', apres: '45 min' },
        { nom: 'Tri des réclamations', avant: '1 h', apres: '10 min' },
      ],
      total: 'Sur la semaine',
      totalAvant: '7 h 30',
      totalApres: '1 h 30',
      note: 'C’est l’exercice du dernier module : on mesure sur ses propres tâches avant de conclure quoi que ce soit. Ces heures sont celles de Clara, pas une moyenne.',
    },
    rail: {
      nom: 'Clara M.',
      points: 'points',
      avant: (n: string, rang: string) => `${n} points avant ${rang}`,
      dernier: 'Dernier rang atteint',
      serie: 'Série de jours',
      jokers: (n: number) => `${n} joker${n > 1 ? 's' : ''} en réserve`,
      aucunJoker: 'Aucun joker encore',
      aucuneSerie: 'Aucune série en cours',
      aDebloquer: 'À débloquer',
      debloque: 'Débloqué',
      pts: (n: string) => `${n} pts`,
    },
  },

  mcp: {
    intro: {
      titre: 'Ce que vous saurez construire en sortant.',
      texte:
        'Au bout du niveau 3, vous savez brancher un assistant sur vos outils : il lit, il prépare, il écrit, et rien ne part sans votre geste. Voilà comment ça marche, et ce que ça donne, outil par outil.',
    },
    titre: 'Un MCP, c’est une prise.',
    chapeau:
      'Le modèle sait écrire. Il ne sait rien de vos outils, et il n’a le droit d’y toucher à rien. Le serveur MCP est ce qui se branche entre les deux, et il déclare exactement ce qui est permis.',
    assistants: [
      { nom: 'Claude', editeur: 'Anthropic' },
      { nom: 'ChatGPT', editeur: 'OpenAI' },
      { nom: 'Kimi', editeur: 'Moonshot' },
    ],
    memeServeur: 'Celle que vous utilisez déjà. Le serveur est le même.',
    hub: {
      kicker: 'Votre serveur MCP',
      ligne: 'La prise, et la liste de ce qui est permis.',
      defaut: (n: number) => `${n} outils déclarés, aucune action sans votre accord`,
    },
    droits: 'Droits déclarés',
    qui: { vous: 'Vous', serveur: 'Le serveur', resultat: 'Résultat' },
    survolez: 'Survolez un outil',
    touchez: 'Touchez un outil',
    outils: [
      {
        id: 'gmail',
        label: 'Gmail',
        droits: 'lecture + brouillon',
        titre: 'Les relances',
        corps: 'Il lit le fil et prépare le brouillon. Il n’a pas le droit d’envoyer.',
        flux: [
          { qui: 'vous', texte: '« Prépare la relance de Marc sur la proposition du 3. »' },
          { qui: 'serveur', texte: 'Lit le fil, retrouve la proposition, rédige le brouillon dans votre ton.' },
          { qui: 'resultat', texte: 'Un brouillon dans Gmail, dans le bon fil. Vous relisez, vous envoyez.' },
        ],
      },
      {
        id: 'agenda',
        label: 'Agenda',
        droits: 'lecture + proposition',
        titre: 'Les rendez-vous',
        corps: 'Il lit les agendas et prépare l’invitation. C’est vous qui l’envoyez.',
        flux: [
          { qui: 'vous', texte: '« Trouve trente minutes avec Nadia la semaine prochaine. »' },
          { qui: 'serveur', texte: 'Lit les deux agendas, propose trois créneaux, prépare l’invitation.' },
          { qui: 'resultat', texte: 'Une invitation prête, à valider d’un clic.' },
        ],
      },
      {
        id: 'tableur',
        label: 'Tableur',
        droits: 'lecture + écriture',
        titre: 'Les exports à nettoyer',
        corps: 'Il ouvre l’export brut et écrit le résultat dans un nouvel onglet. L’original n’est jamais modifié.',
        flux: [
          { qui: 'vous', texte: '« Nettoie l’export de la semaine et sors les totaux par site. »' },
          { qui: 'serveur', texte: 'Ouvre l’export, corrige les formats, calcule, écrit un nouvel onglet.' },
          { qui: 'resultat', texte: 'Un onglet propre et daté, avec la liste de ce qui a été corrigé.' },
        ],
      },
      {
        id: 'crm',
        label: 'CRM',
        droits: 'écriture encadrée',
        titre: 'Les fiches clients',
        corps: 'Les champs qu’il peut écrire sont déclarés un par un. Le reste lui est fermé.',
        flux: [
          { qui: 'vous', texte: '« Note l’appel avec Dupont : relance en septembre, budget validé. »' },
          { qui: 'serveur', texte: 'Retrouve la fiche, écrit dans les deux champs autorisés, rien d’autre.' },
          { qui: 'resultat', texte: 'La fiche est à jour avant que vous ayez raccroché.' },
        ],
      },
      {
        id: 'pub',
        label: 'Publicité',
        droits: 'lecture seule',
        titre: 'Les campagnes',
        corps: 'Il lit les performances et propose. Il ne dépense rien : la mise en ligne reste un geste humain.',
        flux: [
          { qui: 'vous', texte: '« Quelles annonces décrochent depuis lundi ? »' },
          { qui: 'serveur', texte: 'Lit les performances, isole les annonces en baisse, propose trois variantes.' },
          { qui: 'resultat', texte: 'Trois variantes argumentées sur la table, aucune en ligne sans vous.' },
        ],
      },
      {
        id: 'documents',
        label: 'Documents',
        droits: 'lecture + création',
        titre: 'Les comptes rendus',
        corps: 'Il lit une transcription, retire ce qui identifie, rédige, et range le document au bon endroit.',
        flux: [
          { qui: 'vous', texte: '« Fais le compte rendu de la réunion d’hier, anonymisé. »' },
          { qui: 'serveur', texte: 'Lit la transcription, retire les noms, rédige en trois sections.' },
          { qui: 'resultat', texte: 'Un document dans le bon dossier, prêt à partager.' },
        ],
      },
      {
        id: 'chat',
        label: 'Slack ou Teams',
        droits: 'lecture + message préparé',
        titre: 'Les points d’équipe',
        corps: 'Il lit le fil et prépare le message. Il ne le poste pas.',
        flux: [
          { qui: 'vous', texte: '« Résume le fil du projet et prépare le message pour l’équipe. »' },
          { qui: 'serveur', texte: 'Lit le fil, retient les décisions, écrit le message.' },
          { qui: 'resultat', texte: 'Le message attend votre clic.' },
        ],
      },
      {
        id: 'analytics',
        label: 'Analytics',
        droits: 'lecture seule',
        titre: 'Les chiffres du site',
        corps: 'Il lit les données, compare, et écrit ce qui a changé. Sourcé, chiffré.',
        flux: [
          { qui: 'vous', texte: '« Qu’est-ce qui a changé sur le site cette semaine ? »' },
          { qui: 'serveur', texte: 'Lit les données, compare à la semaine d’avant, écrit trois constats.' },
          { qui: 'resultat', texte: 'Trois constats chiffrés, le lundi matin, avec leurs sources.' },
        ],
      },
      {
        id: 'visio',
        label: 'Visio',
        droits: 'lecture des transcriptions',
        titre: 'Le call qui devient une proposition',
        corps: 'Il lit la transcription de l’appel, en sort les besoins, et prépare le document. Vous relisez.',
        flux: [
          { qui: 'vous', texte: '« Prépare la proposition à partir du call d’hier avec Maison Verlaine. »' },
          { qui: 'serveur', texte: 'Lit la transcription, retrouve le budget et l’échéance annoncés, reprend votre trame.' },
          { qui: 'resultat', texte: 'Une proposition rédigée, avec les phrases du client citées à l’appui.' },
        ],
      },
      {
        id: 'compta',
        label: 'Comptabilité',
        droits: 'brouillon, jamais d’envoi',
        titre: 'Les factures et les dépenses',
        corps: 'Il écrit la facture en brouillon et classe les reçus. Rien ne part au client sans vous.',
        flux: [
          { qui: 'vous', texte: '« Facture à Atelier Nord les trois jours de janvier, comme d’habitude. »' },
          { qui: 'serveur', texte: 'Retrouve le client, reprend les lignes du mois d’avant, applique la TVA.' },
          { qui: 'resultat', texte: 'Une facture en brouillon, à relire et à envoyer d’un clic.' },
        ],
      },
      {
        id: 'fichiers',
        label: 'Fichiers',
        droits: 'lecture + rangement',
        titre: 'Le dossier qui se range',
        corps: 'Il lit ce que contiennent les fichiers, les nomme selon votre règle, et les classe. Il ne supprime rien.',
        flux: [
          { qui: 'vous', texte: '« Range ce qui traîne dans le dossier de janvier. »' },
          { qui: 'serveur', texte: 'Ouvre chaque fichier, reconnaît le type et le client, renomme et déplace.' },
          { qui: 'resultat', texte: 'Un dossier trié, et la liste de ce qui a bougé pour pouvoir revenir en arrière.' },
        ],
      },
      {
        id: 'entrepot',
        label: 'Entrepôt de données',
        droits: 'lecture seule',
        titre: 'Vos chiffres, demandés en une phrase',
        corps: 'La question posée en français devient une requête, et la réponse arrive avec la requête écrite.',
        flux: [
          { qui: 'vous', texte: '« Combien de devis signés en juin, par commercial ? »' },
          { qui: 'serveur', texte: 'Lit le fichier de définitions, écrit la requête, la lance en lecture seule.' },
          { qui: 'resultat', texte: 'Le tableau, et la requête sous les yeux pour la vérifier.' },
        ],
      },
      {
        id: 'support',
        label: 'Support',
        droits: 'brouillon + base de connaissances',
        titre: 'Les réponses au support',
        corps: 'Il cherche dans votre documentation, cite la source, et prépare la réponse. Un humain l’envoie.',
        flux: [
          { qui: 'vous', texte: '« Réponds au ticket 812 : le client ne retrouve pas sa facture. »' },
          { qui: 'serveur', texte: 'Retrouve la procédure dans la base, vérifie le compte, rédige la réponse.' },
          { qui: 'resultat', texte: 'Un brouillon avec le lien vers l’article utilisé, prêt à envoyer.' },
        ],
      },
      {
        id: 'site',
        label: 'Site web',
        droits: 'écriture en préproduction',
        titre: 'Le site qu’on met à jour en parlant',
        corps: 'Il modifie la page en préproduction et vous montre l’avant et l’après. La mise en ligne reste votre geste.',
        flux: [
          { qui: 'vous', texte: '« Change les horaires d’été sur la page contact et la page d’accueil. »' },
          { qui: 'serveur', texte: 'Retrouve les deux pages, applique la modification en préproduction.' },
          { qui: 'resultat', texte: 'Un aperçu à valider, puis une mise en ligne d’un clic.' },
        ],
      },
    ],
    pied: 'Ce n’est pas du développement. C’est une configuration qui se lit, et c’est le sujet du dernier tiers du programme, avec les agents et les automatisations.',
  },

  diplome: {
    kicker: 'Jour 30',
    titre: 'Elle l’imprime et la pose sur le bureau de son directeur.',
    surtitre: 'Attestation d’usage professionnel de l’intelligence artificielle',
    decernee: 'décernée à',
    nom: 'Clara Martin',
    corps: (lecons: number, modules: number, exercices: number, relus: number) =>
      `pour avoir mené le parcours complet : ${lecons} leçons en ${modules} modules, ${exercices} exercices rendus dont ${relus} relus et corrigés, et la construction d’un serveur MCP en état de marche.`,
    signature: 'Paul André',
    role: 'Formateur, MyDigipal',
    heures: (h: string) => `${h} de formation`,
    delivree: 'Délivrée le jour 30',
    note: 'L’attestation porte la mention quand le parcours est terminé en entier. Elle vaut ce que vaut ce qu’on sait faire avec.',
    logoAlt: 'MyDigipal Academy',
  },

  retournement: {
    kicker: 'Fin de la démonstration',
    titre: 'Vous avez regardé le compte de Clara se remplir. Au tour du vôtre.',
    texte:
      'Trente jours plus tard, il ressemblera à celui-là. Ce n’est pas une promesse de résultat : c’est ce que fait le produit quand on s’en sert.',
    ouvrir: 'Commencer',
    enseigne: 'Qui enseigne',
    gratuit: (n: number) => `Essayer les ${n} leçons gratuites`,
    jour30: (rang: string) => `Jour 30 · ${rang}`,
    points: 'points',
    cap: (trophees: number, total: number) => `Trente jours actifs · ${trophees} trophées sur ${total}`,
    vous: 'Vous',
    jour0: 'Jour 0',
    capVide: 'Le premier carré s’allume à la première leçon terminée.',
  },

  flottant: {
    aria: 'Ouvrir un compte',
    cta: 'Commencer',
    gratuit: (n: number) => `${n} leçons gratuites`,
  },
  barre: {
    marque: 'AI Academy',
    aria: 'Repères de la page',
    langue: 'EN',
    langueAria: 'Read this page in English',
    reperes: { n1: 'Niveau 1', n2: 'Niveau 2', n3: 'Niveau 3', avis: 'Avis', tarifs: 'Tarifs' },
    jour: (n: number) => `Jour ${n} / 30`,
    cta: 'Commencer',
  },
  maison: {
    titre: 'Une méthode née en salle, chez La Poste, Pierre Fabre ou La Redoute.',
    texte:
      'Paul André l’a enseignée pendant trois ans devant de vraies équipes, de la direction financière au service client, et l’a corrigée session après session jusqu’à ce qu’elle tienne. C’est cette version-là qui est en ligne.',
    photos: [
      { src: '/academy/references/session-la-poste-2.jpg', alt: 'Session de formation IA chez La Poste', legende: 'La Poste', w: 1400, h: 787 },
      { src: '/academy/references/session-leclerc.jpg', alt: 'Session de formation IA chez E.Leclerc', legende: 'E.Leclerc', w: 1200, h: 900 },
      { src: '/academy/references/session-abm.jpg', alt: 'Atelier en petit groupe', legende: 'Atelier en petit groupe', w: 1200, h: 900 },
    ],
    chiffres: (avis: Avis) => [
      { valeur: '2 500+', libelle: 'professionnels formés' },
      { valeur: `${noteLocale(avis.note, 'fr')}/10`, libelle: `sur ${avis.nombre} retours écrits` },
      { valeur: '11', libelle: 'grands groupes accompagnés' },
    ],
    metiers: [
      { titre: 'Marketing de performance', texte: 'Campagnes d’acquisition pilotées à la donnée, sur tous les canaux payants.' },
      { titre: 'Data et mesure', texte: 'Tracking, tableaux de bord et chaînes de traitement, de la collecte à la décision.' },
      { titre: 'Automatisation et IA', texte: 'Assistants, agents et automatisations opérés en production, pas en démonstration.' },
    ],
    logosTitre: 'Nous formons leurs équipes',
    avisTitre: 'Ils ont adoré le training',
    avisLigne: (avis: Avis) => `${avis.nombre} retours écrits, une moyenne de ${noteLocale(avis.note, 'fr')} sur 10`,
    avisPlus: (n: number) => `Voir les ${n} autres avis`,
    avisMoins: 'Replier',
  },

  produit: {
    titre: 'Voilà ce que vous ouvrez le matin.',
    texte: 'Huit écrans, filmés dans le produit. Cliquez sur l’un d’eux pour le regarder en grand.',
    url: 'academy.mydigipal.com/app',
    agrandir: 'Chaque écran s’ouvre en grand, et se referme avec la touche Échap.',
    aVenir: 'Capture à venir',
  },

  configurateur: {
    titre: 'Tarifs',
    sousTitre: 'Un mois d’accès. L’assistant IA est compris.',
    formuleRub: 'Ce que vous prenez',
    avanceeNom: 'La méthode avancée',
    avanceeLigne: (n: number) =>
      `La méthode, plus ${n} leçons d’agents, de chaînes MCP et de cas montés de bout en bout.`,
    assistantInclus: (q: string) => `L’assistant IA compris, environ ${q} questions par mois.`,
    /**
     * Ce que chaque formule contient, ligne par ligne.
     *
     * ⚠️ Chaque nombre vient des faits servis par l'API : les leçons, les
     * prompts, les trophées, les relectures. Aucun n'est écrit ici, sinon ils
     * divergeraient du produit à la première leçon ajoutée.
     */
    contenuMethode: (f: { lecons: number; prompts: number; trophees: number }) => [
      `${f.lecons} leçons écrites, en trois niveaux`,
      'L’atelier CRAFT : construire un prompt, et auditer les vôtres',
      `La bibliothèque de ${f.prompts} prompts, prêts à copier`,
      'Les quiz de fin de module et les exercices sur vos données',
      `Votre profil : points, rangs, série de jours, ${f.trophees} trophées`,
      'L’attestation d’usage professionnel de l’IA',
    ],
    contenuAvancee: (f: { lecons: number; relectures: number }) => [
      'Tout ce que contient la méthode',
      `${f.lecons} leçons de plus : agents, serveurs MCP, chaînes d’automatisation`,
      'Les cas d’usage avancés, montés de bout en bout',
      `${f.relectures} exercices relus, avec un retour écrit sur vos cas`,
      'Une session de trente minutes avec Paul, sur votre cas',
    ],
    parMoisCourt: 'par mois',
    legendeMethode: 'ce qui vient de la méthode',
    legendeAvance: 'ce qui vient des automatisations',
    addonsRub: 'En plus, quand vous voulez',
    addonsLigne: 'Ni l’un ni l’autre n’est nécessaire pour suivre le parcours.',
    dejaComprise: 'Comprise dans la formule',
    programmeLigne: (lecons: number) =>
      `${lecons} leçons, trois niveaux, l’atelier, la bibliothèque, les trophées, l’attestation.`,
    construireLigne: (lecons: number) => `${lecons} leçons dans leur propre parcours, jusqu’au serveur MCP en état de marche.`,
    assistantTitre: 'L’assistant IA',
    assistantLigne: 'Il connaît vos leçons et répond sur vos cas. Abonnement mensuel, sans engagement.',
    sans: 'Sans',
    parMois: '€ par mois',
    assistantSans: 'Les deux fonctionnent sans lui. On l’ajoute quand les questions arrivent.',
    assistantAvec: (q: string) => `environ ${q} questions par mois.`,
    places: 'Combien de places',
    placesLabel: (n: number, max: number) => (n >= max ? `${max} et plus` : `${n} place${n > 1 ? 's' : ''}`),
    remise: (pct: number) => `Remise équipe de ${pct} %, appliquée à tout le panier.`,
    equipeAlt: 'Trois collègues devant le même écran',
    remiseInfo: (paliers: Array<{ seats: number; pct: number }>) =>
      `La remise démarre à ${paliers[0].seats} places : ${paliers.map((p) => `${p.pct} % à ${p.seats}`).join(', ')}.`,
    total: 'Votre total',
    ttc: '€ TTC',
    deviseLabel: 'Devise affichée',
    dejaProgrammeAide: 'Décochez-le si vous ne voulez que l’autre : les deux programmes sont indépendants et s’achètent séparément.',
    dejaAcquis: 'Non retenu',
    panierVide: 'Choisissez au moins un programme.',
    remiseCode: (code: string, pct: number) => `Code ${code} : −${pct} % sur la méthode et les automatisations`,
    unique: 'pour un mois',
    uniquePlaces: (n: number) => `pour un mois, ${n} places`,
    mensuel: 'par mois, assistant',
    sansAbo: 'assistant compris, rien à résilier',
    placesRecap: (n: number) => `× ${n} places`,
    remiseLigne: 'Remise équipe',
    ouvrir: 'Commencer',
    gratuitLigne: (n: number) => `Ou commencez par les ${n} leçons gratuites`,
    devisTexte: (max: number) => `Au-delà de ${max} places, on ne calcule plus : on en parle.`,
    devis: 'Demander un devis',
    /** La hausse, quand elle est à moins de seize jours : une ligne franche près du bouton. */
    hausseProche: (prix: string, veille: string, apres: string) => `${prix} € jusqu’au ${veille}, ${apres} € ensuite.`,
    equipe: {
      titre: 'Votre demande',
      societe: 'Société',
      nom: 'Votre nom',
      email: 'Votre email professionnel',
      places: 'Nombre de places',
      message: 'Ce que vous cherchez (facultatif)',
      envoyer: 'Envoyer la demande',
      envoi: 'Envoi…',
      merci: 'Bien reçu. Paul vous répond sous un jour ouvré, avec une proposition chiffrée.',
      erreur: 'La demande n’est pas partie. Réessayez, ou écrivez à academy@mydigipal.com.',
    },
    hausse: (prix: string, date: string) => `La méthode passe à ${prix} € le ${date}.`,
    /** La date de la hausse, écrite en toutes lettres. */
    dateHausse: (jour: number, mois: string) => `${jour === 1 ? '1er' : jour} ${mois}`,
  },

  pied: {
    logoAlt: 'MyDigipal Academy',
    liens: [
      { cle: 'terms', label: 'Conditions' },
      { cle: 'privacy', label: 'Confidentialité' },
      { cle: 'legal', label: 'Mentions légales' },
      { cle: 'login', label: 'Espace apprenant' },
    ],
    autreLangue: { href: '/en/academy', label: 'English' },
  },
};

export type Jour30Copy = typeof FR;

const EN: Jour30Copy = {
  meta: {
    title: 'Thirty days inside a MyDigipal Academy account',
    description:
      'AI training for working professionals, shown from the inside: thirty days of one learner’s journey, in the real product, with the point rules of the code.',
  },

  ouverture: {
    titre: 'The same request, written twice.',
    sous: 'You know the first one. The second produces a deliverable you can send without touching it up.',
    etat: {
      demo: 'Demonstration',
      flat: 'No method',
      craft: 'Rewritten with CRAFT',
      ask: 'Your turn',
    },
    laDemande: 'The request',
    ceQueCaDonne: 'What it gives',
    reecrite: 'Rewritten, field by field',
    maintenant: 'What it gives now',
    vague: 'Write an email to chase a client who is not replying',
    plate:
      'Subject: Follow-up\n\nHello,\n\nI am writing to follow up on our previous exchange. Please do not hesitate to get back to me at your earliest convenience.\n\nI remain at your disposal.\n\nKind regards,',
    riche:
      'Subject: Your proposal from the 3rd, taking this back in hand\n\nHello Mark,\n\nThree weeks without an answer, and I would rather ask plainly: is it the budget, the timing, or the scope?\n\nI have an option for each, and none of them means starting over.\n\nI will call you Thursday at 11 if I have not heard from you by then.',
    champs: {
      contexte: craft('context', 'en'),
      role: { label: craft('role', 'en'), value: 'You are a sales director with twenty years of experience selling consulting work.' },
      action: {
        label: craft('action', 'en'),
        value: 'Propose a follow-up that asks a single closed question and offers a way out.',
      },
      format: { label: craft('format', 'en'), value: 'An email of 120 words at most, with a subject line. No stock phrases.' },
      ton: {
        label: craft('tone', 'en'),
        value: 'Direct and cordial. Forbidden: quoting an amount, promising a deadline, naming a competitor.',
      },
    },
    revoir: 'Replay',
    essayer: 'With my request',
    lancer: 'Rewrite my request',
    votreDemande: 'Your own request',
    placeholder: 'The task you would hand to an AI today',
    sansAppel:
      'No model is called here. The flat answer is the symptom of a request without context, not a real run.',
    note: 'Five fields. It is the second lesson of the programme.',
  },

  hero: {
    titre: 'The online AI course, built from three years of training teams.',
    sous: (lecons: number, prix: string) =>
      `${lecons} lessons at your own pace, the CRAFT method, your exercises reviewed by a human, all the way to agents and MCP servers. From €${prix}.`,
    repartition: (programme: number, complement: number) =>
      `${programme} lessons in the method, ${complement} more if you take Automations too.`,
    cta: 'Get started',
    cta2: (n: number) => `Try ${n} lessons, free`,
    url: 'academy.mydigipal.com/app',
    alt: 'The learner space dashboard',
  },

  ailleurs: {
    titre: 'Would you rather have a room, or hand us a project?',
    lignes: [
      { label: 'Train a team, on site or remote', href: '/en/services/ai-training' },
      { label: 'Have your agents and automations built', href: '/en/services/ai-solutions' },
    ],
  },

  visite: {
    titre: 'What is inside.',
    sous: 'The learner space, as you will open it. Hover an element: it tells you what it is for.',
    sousTactile: 'The learner space, as you will open it. Tap an element: it tells you what it is for.',
    voirLecran: 'Watch this screen',
    nav: ['Course', 'Tools', 'My space'],
    bandeau: { kicker: 'My space', titre: 'Hello Clara', ligne: 'Both programmes, the whole course open.' },
    cartes: {
      kicker: 'Your course',
      reprendre: 'Resume',
      continuer: 'Continue',
      p1: {
        titre: 'The method',
        ligne: 'From zero to autonomous with generative AI: the CRAFT method, the tools, the cases of your own job.',
        avancement: (f: number, n: number) => `${f} of ${n} lessons`,
      },
      p2: {
        titre: 'Automations',
        ligne: 'Agents, MCP chains, servers, and seventeen real cases.',
        avancement: (f: number, n: number) => `${f} of ${n} lessons`,
      },
    },
    rail: {
      reprendreTitre: 'Pick up where you left off',
      lecon: 'One action, one verb',
      reste: '6 min to go',
      continuer: 'Continue the lesson',
      accesTitre: 'Quick access',
      acces: {
        atelier: 'CRAFT workshop',
        prompts: 'Prompt library',
        cas: 'Use cases',
        notes: 'My notes',
        exercices: 'Exercises and quizzes',
        assistant: 'AI assistant',
        profil: 'My profile',
      },
      activiteTitre: 'Your activity',
      lecons: 'Lessons completed',
    },
    pitch: {
      kicker: 'What sets it apart',
      titre: 'A course that starts from the work, not from the news.',
      points: [
        'The CRAFT method, taught in the room for three years, written lesson by lesson.',
        'Exercises on your own cases, reviewed by a human, not by a script.',
        'The part nobody teaches: wiring the tools, agents and MCP servers.',
        'An account that fills up: points, streak, trophies, certificate.',
      ],
      indice: 'Hover an element of the screen to discover it.',
      indiceTactile: 'Tap an element of the screen to discover it.',
    },
    assistant: {
      question: 'What is the difference between an agent and an automation?',
      reponse:
        'An automation follows a path written in advance: same steps, same order. An agent is given a goal and chooses its steps, calling tools when needed. For a weekly report, an automation is enough.',
      source: 'Source: the level 3 lessons on agents',
    },
    spots: (f: { lessons: number; modules: number; prompts: number; trophees: number; relectures: number; lessonsConstruire: number; lessonsProgramme?: number; lessonsComplement?: number }) => ({
      parcours1: {
        kicker: 'The method',
        titre: 'The whole course, from the first prompt to the cases of your job.',
        texte: `${f.lessonsProgramme ?? f.lessons} lessons across ${f.modules} modules, three levels. Every lesson written: an outline, an example, a prompt to copy, and a task to hand in.`,
      },
      parcours2: {
        kicker: 'Automations',
        titre: 'Agents, automations, MCP servers.',
        texte: `${f.lessonsConstruire} lessons in their own course and seventeen real cases from the agency. This is where you wire the tools to one another.`,
      },
      reprendre: {
        kicker: 'Resume',
        titre: 'Right where you stopped.',
        texte: 'The current lesson, the time left, one button. The rail is on every screen: you never look for where you were.',
      },
      atelier: {
        kicker: 'The CRAFT workshop',
        titre: 'Five fields, and the prompt writes itself in front of you.',
        texte: 'Context, role, action, format, tone: you fill them in, it assembles, you copy it into your tool. The same workshop audits a prompt you already wrote.',
      },
      prompts: {
        kicker: 'The library',
        titre: `${f.prompts} prompts drawn from the lessons.`,
        texte: 'Sorted by module, copied in one gesture, opened directly in Claude or ChatGPT. Your own get saved there too.',
      },
      cas: {
        kicker: 'Use cases',
        titre: 'Real work situations, not demo examples.',
        texte: 'Minutes to anonymise, an ad to decline in variants, an export to clean: the request, the answer, and what made the difference.',
      },
      notes: {
        kicker: 'Your notes',
        titre: 'Taken in the lesson, found together.',
        texte: 'A note is written without leaving the page, and lives in a notebook, lesson by lesson.',
      },
      exercices: {
        kicker: 'Exercises and quizzes',
        titre: 'Submitted from the lesson, reviewed by a human.',
        texte: `One quiz per module, graded server-side. Exercises are reviewed by Paul with Automations, ${f.relectures} reviews included.`,
      },
      assistant: {
        kicker: 'The AI assistant',
        titre: 'It answers from your lessons, and cites the source.',
        texte: 'A question at 11 pm, an answer drawn from the programme, never invented: it only knows what you have.',
      },
      points: {
        kicker: 'Points and streak',
        titre: 'We reward practice, not reading.',
        texte: `A completed lesson, a submitted exercise, a passed quiz: each one pays. Five ranks, ${f.trophees} trophies including four secret ones, a day streak with a joker when you miss one.`,
      },
      profil: {
        kicker: 'The profile',
        titre: 'The calendar, the trophies, the certificate.',
        texte: 'A year of small squares, one per active day; the trophies earned; and the certificate to print when the course is complete, with distinction.',
      },
    }),
  },

  mention: {
    kicker: 'Demonstration account',
    titre: 'Thirty days, two fortnights, an account that fills up.',
    etapes: [
      {
        jours: 'Days 1 to 15',
        nom: 'The method',
        texte: 'CRAFT lesson by lesson, your tool’s module, the prompt library, and the first exercises handed in.',
        ton: 'or' as const,
      },
      {
        jours: 'Days 16 to 30',
        nom: 'Automations',
        texte: 'MCP servers, agents, the chains that run on their own, and the certificate.',
        ton: 'avance' as const,
      },
    ],
    legende: 'Gold is The method. Blue is Automations. Both colours come back further down, in the pricing.',
    texte:
      'What follows is reconstructed from the real learner space: the screens are the product’s, the point rules are the code’s. Clara is made up: she took the method, Automations and the assistant.',
    bandeAlt: 'A learner at her space, surrounded by her progress cards',
  },

  compte: {
    quinzaines: [
      { kicker: 'Fortnight 1', nom: 'The method', titre: 'Fifteen days to get started with artificial intelligence.' },
      { kicker: 'Fortnight 2', nom: 'Automations', titre: 'She stops doing. She has it done.' },
    ],
    jour: (n: number) => `Day ${n}`,
    claraAlt: 'Clara, the learner whose thirty days this story follows',
    j1: {
      phrase: 'She opens her account. Paul welcomes her, on camera.',
      badge: 'Welcome',
      attente: 'The welcome note',
      alt: 'Paul welcomes Clara over video, on the first day of her path',
      note: 'A welcome note on day one, then one opening video per module: what it is for, and what you will be able to do at the end.',
    },
    j2: {
      phrase: 'She learns the method. Five fields, and the request writes itself.',
      kicker: 'The CRAFT method',
      titre: 'Five fields, in this order',
      champs: [
        { lettre: 'C', nom: 'Context', valeur: 'I am an account manager at a multi-site service provider' },
        { lettre: 'R', nom: 'Role', valeur: 'you are an analyst: you sort and you count, you do not comment' },
        { lettre: 'A', nom: 'Action', valeur: 'classify each complaint under a single reason' },
        { lettre: 'F', nom: 'Format', valeur: 'a cross table, reasons as rows, sites as columns, with totals' },
        { lettre: 'T', nom: 'Tone', valeur: 'factual, no introduction and no conclusion' },
      ],
      assemble: 'The request, assembled',
      copier: 'Copy',
      copie: 'Copied',
      pied: (n: number) => `${n} written lessons: outline, example, prompt`,
      terminee: (pts: number) => `Completed, +${pts}`,
    },
    j3: {
      phrase: 'She hands in an exercise, on her own data.',
      kicker: 'Exercise submission',
      fichiers: ['customer-complaints-Q1.csv', 'case-lead-times.csv'],
      fournis: 'provided with the exercise',
      tache: { label: 'The task', value: 'Sort 180 customer complaints by reason' },
      prompt: { label: 'Your prompt', value: 'Context: I am an account manager at a multi-site service provider…' },
      obtenu: { label: 'What you got', value: 'A cross table of reasons and sites, with totals' },
      attente: 'Submitted',
      pts: (n: number) => `+${n} points`,
      note: 'One exercise per module, with its starting files. You submit it from the lesson, and you keep what you produced.',
    },
    j6: {
      phrase: 'The module 2 quiz. Perfect score, first try.',
      titre: 'Module 2, the quiz',
      score: (ok: number, total: number) => `${ok} out of ${total}`,
      sansFaute: 'Perfect score',
      pts: (quiz: number, bonus: number) => `+${quiz} for the quiz, +${bonus} for the perfect score`,
      note: 'One quiz per module, graded server-side. A perfect score on the first pass is worth double: we reward revision, not rote learning.',
    },
    j9: {
      phrase: 'She picks her tool. The path keeps only that one.',
      outils: ['Microsoft Copilot', 'Google Gemini', 'Claude', 'ChatGPT'],
      choisi: 'Claude',
      choisiLabel: 'Her tool',
      titre: 'Her tool’s module opens',
      sujets: [
        'The settings that actually change the answers',
        'Projects and memory: what it keeps, what it forgets',
        'Files: what you can hand it, and in what shape',
        'What it cannot do, and what to use instead',
      ],
      note: 'The tools module is a choice. All four exist, written separately; you follow the one for the tool you have, and you can open another the day your company changes.',
    },
    preuve: {
      question: 'Who teaches?',
      texte:
        'Paul André, who has taught this method in the room for three years, at La Poste, Pierre Fabre and E.Leclerc. Every lesson is written from what worked in front of real teams.',
      chiffres: (avis: Avis) => [
        { valeur: '2,500+', libelle: 'professionals trained' },
        { valeur: `${noteLocale(avis.note, 'en')}/10`, libelle: `across ${avis.nombre} written reviews` },
      ],
    },
    j11: {
      phrase: 'A question at 11 pm. The assistant answers, and cites the lesson.',
      question:
        'My client wants meeting minutes from a recording. What must I absolutely not hand over?',
      reponse:
        'People’s names and anything that identifies a client file. Anonymise before, reinject after: it is faster than getting a processing approved. The rest goes through safely.',
      source: 'Source: the module 3 lesson on what you never hand over',
      note: 'The assistant only answers from the lessons she has access to. It can neither invent, nor cite content she does not have.',
    },
    j14: {
      phrase: 'Five lessons in one day. Something drops that she was not looking for.',
      meta: (metal: string, pts: number) => `Secret trophy · ${metal}, +${pts}`,
      note: (total: number, secrets: number) =>
        `${total} trophies, ${secrets} of them secret: their name only appears once earned. The best metal frames the avatar.`,
    },
    j12: {
      phrase: 'She stops writing her prompts from scratch. Then she adds one.',
      tous: (n: number) => `All · ${n}`,
      onglets: ['Module 2', 'Module 3', 'Module 4'],
      lignes: ['Sort complaints by reason and by site', 'Rewrite an ad in three testable variants'],
      lesien: { texte: 'Anonymised minutes, fixed format', tag: 'hers' },
      copier: 'Copy',
    },
    j15: {
      phrase: 'She is asked for the visual in three formats. For yesterday.',
      tirez: 'Drag across: the photo the client sent on the left, the visual ready to publish on the right.',
      fourni: 'As received',
      recadre: 'Cut out, dressed',
      comparer: 'Compare the two visuals',
      altAvant: 'The bicycle photo, exactly as the client sent it',
      altApres: 'The same bicycle cut out, cropped and dressed in the brand colours',
      note: 'Four formats, one background removed, one vertical version. Twenty minutes, not half a day of retouching.',
    },
    j18: {
      phrase: 'She plugs in her first server. It reads her calendar, and nothing else.',
      kicker: 'Server connected',
      serveur: 'Google Calendar',
      droits: [
        { texte: 'Read the next seven days of meetings', ouvert: true },
        { texte: 'Read attendees and attachments', ouvert: true },
        { texte: 'Create or move a meeting', ouvert: false },
        { texte: 'Write to an attendee', ouvert: false },
      ],
      note: 'An MCP server is plugged in socket by socket, and each socket is set to read or to write. Opening write access is a decision, not a default.',
    },
    j21: {
      phrase: 'Monday, eight in the morning. Her follow-ups are written. She reads them, she sends.',
      kicker: 'Chain · Monday follow-ups',
      sources: ['Invoicing', 'Inbox', 'Calendar'],
      ia: 'Drafts',
      barriere: 'She reads',
      sorties: ['Four follow-ups', 'One call to make'],
      note: 'The chain prepares, it sends nothing. The stop is written into the chain itself: nothing goes out until she has clicked.',
    },
    j22: {
      phrase: 'Thirty minutes on a call. Prepared: he read her exercises beforehand.',
      direct: 'Live',
      vous: 'you',
      alt: 'MyDigipal training session',
      note: 'She leaves with a written document after the call, not with notes.',
    },
    j24: {
      phrase: 'An agent watches her deliveries. It acts inside its lane, and asks for the rest.',
      kicker: 'Agent · Deliveries',
      lignes: [
        { h: '06:12', texte: 'Three delays spotted. Customers notified.', accord: false },
        { h: '06:13', texte: 'New slot booked for two of them.', accord: false },
        { h: '06:14', texte: 'Goodwill gesture on the third.', accord: true },
      ],
      attend: 'Waiting for your approval',
      note: 'The agent’s lane is written before it is started: what it does alone, what it proposes, and the amount above which it stops.',
    },
    j26: {
      phrase: 'She builds her first MCP server. And here, we need to stop for two minutes.',
      badge: 'MCP server, online',
      outils: (n: number) => `${n} tools connected`,
    },
    j28: {
      phrase: 'She counts. Not a promise: her own log, over her own week.',
      kicker: 'My log for the week',
      colonnes: ['Before', 'After'],
      taches: [
        { nom: 'Monday customer follow-ups', avant: '1 h 30', apres: '15 min' },
        { nom: 'Meeting minutes', avant: '2 h', apres: '20 min' },
        { nom: 'Visuals and variants', avant: '3 h', apres: '45 min' },
        { nom: 'Sorting complaints', avant: '1 h', apres: '10 min' },
      ],
      total: 'Over the week',
      totalAvant: '7 h 30',
      totalApres: '1 h 30',
      note: 'This is the last module’s exercise: you measure on your own tasks before concluding anything. These hours are Clara’s, not an average.',
    },
    rail: {
      nom: 'Clara M.',
      points: 'points',
      avant: (n: string, rang: string) => `${n} points to ${rang}`,
      dernier: 'Top rank reached',
      serie: 'Day streak',
      jokers: (n: number) => `${n} joker${n > 1 ? 's' : ''} in reserve`,
      aucunJoker: 'No joker yet',
      aucuneSerie: 'No streak running',
      aDebloquer: 'To unlock',
      debloque: 'Unlocked',
      pts: (n: string) => `${n} pts`,
    },
  },

  mcp: {
    intro: {
      titre: 'What you will be able to build when you leave.',
      texte:
        'By the end of level 3, you know how to plug an assistant into your tools: it reads, it prepares, it writes, and nothing leaves without your gesture. Here is how it works, and what it gives, tool by tool.',
    },
    titre: 'An MCP is a socket.',
    chapeau:
      'The model knows how to write. It knows nothing about your tools, and it is not allowed to touch any of them. The MCP server is what plugs in between the two, and it declares exactly what is permitted.',
    assistants: [
      { nom: 'Claude', editeur: 'Anthropic' },
      { nom: 'ChatGPT', editeur: 'OpenAI' },
      { nom: 'Kimi', editeur: 'Moonshot' },
    ],
    memeServeur: 'The one you already use. The server is the same.',
    hub: {
      kicker: 'Your MCP server',
      ligne: 'The socket, and the list of what is permitted.',
      defaut: (n: number) => `${n} tools declared, no action without your consent`,
    },
    droits: 'Declared rights',
    qui: { vous: 'You', serveur: 'The server', resultat: 'Result' },
    survolez: 'Hover a tool',
    touchez: 'Tap a tool',
    outils: [
      {
        id: 'gmail',
        label: 'Gmail',
        droits: 'read + draft',
        titre: 'Follow-ups',
        corps: 'It reads the thread and prepares the draft. It is not allowed to send.',
        flux: [
          { qui: 'vous', texte: '“Prepare the follow-up to Mark on the proposal from the 3rd.”' },
          { qui: 'serveur', texte: 'Reads the thread, finds the proposal, writes the draft in your tone.' },
          { qui: 'resultat', texte: 'A draft in Gmail, in the right thread. You reread, you send.' },
        ],
      },
      {
        id: 'agenda',
        label: 'Calendar',
        droits: 'read + proposal',
        titre: 'Meetings',
        corps: 'It reads the calendars and prepares the invitation. You are the one who sends it.',
        flux: [
          { qui: 'vous', texte: '“Find thirty minutes with Nadia next week.”' },
          { qui: 'serveur', texte: 'Reads both calendars, proposes three slots, prepares the invitation.' },
          { qui: 'resultat', texte: 'An invitation ready, one click to confirm.' },
        ],
      },
      {
        id: 'tableur',
        label: 'Spreadsheet',
        droits: 'read + write',
        titre: 'Exports to clean',
        corps: 'It opens the raw export and writes the result in a new tab. The original is never modified.',
        flux: [
          { qui: 'vous', texte: '“Clean this week’s export and give me the totals by site.”' },
          { qui: 'serveur', texte: 'Opens the export, fixes the formats, computes, writes a new tab.' },
          { qui: 'resultat', texte: 'A clean, dated tab, with the list of what was corrected.' },
        ],
      },
      {
        id: 'crm',
        label: 'CRM',
        droits: 'scoped write',
        titre: 'Client records',
        corps: 'The fields it may write are declared one by one. The rest is closed to it.',
        flux: [
          { qui: 'vous', texte: '“Log the call with Dupont: follow up in September, budget approved.”' },
          { qui: 'serveur', texte: 'Finds the record, writes the two allowed fields, nothing else.' },
          { qui: 'resultat', texte: 'The record is up to date before you have hung up.' },
        ],
      },
      {
        id: 'pub',
        label: 'Advertising',
        droits: 'read only',
        titre: 'Campaigns',
        corps: 'It reads performance and proposes. It spends nothing: going live remains a human gesture.',
        flux: [
          { qui: 'vous', texte: '“Which ads have been slipping since Monday?”' },
          { qui: 'serveur', texte: 'Reads performance, isolates the ads going down, proposes three variants.' },
          { qui: 'resultat', texte: 'Three argued variants on the table, none live without you.' },
        ],
      },
      {
        id: 'documents',
        label: 'Documents',
        droits: 'read + create',
        titre: 'Meeting minutes',
        corps: 'It reads a transcript, removes what identifies people, writes, and files the document in the right place.',
        flux: [
          { qui: 'vous', texte: '“Write the minutes of yesterday’s meeting, anonymised.”' },
          { qui: 'serveur', texte: 'Reads the transcript, removes the names, writes in three sections.' },
          { qui: 'resultat', texte: 'A document in the right folder, ready to share.' },
        ],
      },
      {
        id: 'chat',
        label: 'Slack or Teams',
        droits: 'read + prepared message',
        titre: 'Team updates',
        corps: 'It reads the thread and prepares the message. It does not post it.',
        flux: [
          { qui: 'vous', texte: '“Summarise the project thread and prepare the message for the team.”' },
          { qui: 'serveur', texte: 'Reads the thread, keeps the decisions, writes the message.' },
          { qui: 'resultat', texte: 'The message waits for your click.' },
        ],
      },
      {
        id: 'analytics',
        label: 'Analytics',
        droits: 'read only',
        titre: 'Site numbers',
        corps: 'It reads the data, compares, and writes what changed. Sourced, with numbers.',
        flux: [
          { qui: 'vous', texte: '“What changed on the site this week?”' },
          { qui: 'serveur', texte: 'Reads the data, compares with the week before, writes three findings.' },
          { qui: 'resultat', texte: 'Three findings with numbers, on Monday morning, with their sources.' },
        ],
      },
      {
        id: 'visio',
        label: 'Video calls',
        droits: 'read transcripts',
        titre: 'The call that becomes a proposal',
        corps: 'It reads the call transcript, pulls out the needs, and drafts the document. You read it over.',
        flux: [
          { qui: 'vous', texte: '“Draft the proposal from yesterday’s call with Maison Verlaine.”' },
          { qui: 'serveur', texte: 'Reads the transcript, finds the budget and deadline they gave, uses your own template.' },
          { qui: 'resultat', texte: 'A written proposal, with the client’s own words quoted as evidence.' },
        ],
      },
      {
        id: 'compta',
        label: 'Accounting',
        droits: 'draft only, never sends',
        titre: 'Invoices and expenses',
        corps: 'It drafts the invoice and files the receipts. Nothing reaches the client without you.',
        flux: [
          { qui: 'vous', texte: '“Invoice Atelier Nord for the three days in January, as usual.”' },
          { qui: 'serveur', texte: 'Finds the client, reuses last month’s lines, applies the right VAT.' },
          { qui: 'resultat', texte: 'A draft invoice, to read over and send with one click.' },
        ],
      },
      {
        id: 'fichiers',
        label: 'Files',
        droits: 'read + file',
        titre: 'The folder that tidies itself',
        corps: 'It reads what the files contain, names them by your rule, and files them. It deletes nothing.',
        flux: [
          { qui: 'vous', texte: '“Tidy up what is lying around in the January folder.”' },
          { qui: 'serveur', texte: 'Opens each file, recognises the type and the client, renames and moves it.' },
          { qui: 'resultat', texte: 'A sorted folder, and the list of what moved so you can undo it.' },
        ],
      },
      {
        id: 'entrepot',
        label: 'Data warehouse',
        droits: 'read only',
        titre: 'Your numbers, asked in one sentence',
        corps: 'A question in plain English becomes a query, and the answer comes back with the query written out.',
        flux: [
          { qui: 'vous', texte: '“How many quotes were signed in June, by sales rep?”' },
          { qui: 'serveur', texte: 'Reads the definitions file, writes the query, runs it read-only.' },
          { qui: 'resultat', texte: 'The table, and the query in plain sight so you can check it.' },
        ],
      },
      {
        id: 'support',
        label: 'Support',
        droits: 'draft + knowledge base',
        titre: 'Support answers',
        corps: 'It searches your documentation, cites the source, and drafts the reply. A human sends it.',
        flux: [
          { qui: 'vous', texte: '“Answer ticket 812: the client cannot find their invoice.”' },
          { qui: 'serveur', texte: 'Finds the procedure in the base, checks the account, writes the reply.' },
          { qui: 'resultat', texte: 'A draft with a link to the article it used, ready to send.' },
        ],
      },
      {
        id: 'site',
        label: 'Website',
        droits: 'write to staging',
        titre: 'The site you update by talking',
        corps: 'It edits the page on staging and shows you the before and after. Going live stays your move.',
        flux: [
          { qui: 'vous', texte: '“Change the summer opening hours on the contact page and the home page.”' },
          { qui: 'serveur', texte: 'Finds both pages, applies the change on staging.' },
          { qui: 'resultat', texte: 'A preview to approve, then one click to publish.' },
        ],
      },
    ],
    pied: 'This is not development. It is a configuration you can read, and it is the subject of the last third of the programme, along with agents and automations.',
  },

  diplome: {
    kicker: 'Day 30',
    titre: 'She prints it and puts it on her director’s desk.',
    surtitre: 'Certificate of professional use of artificial intelligence',
    decernee: 'awarded to',
    nom: 'Clara Martin',
    corps: (lecons: number, modules: number, exercices: number, relus: number) =>
      `for completing the full course: ${lecons} lessons across ${modules} modules, ${exercices} exercises submitted of which ${relus} reviewed and corrected, and a working MCP server built.`,
    signature: 'Paul André',
    role: 'Trainer, MyDigipal',
    heures: (h: string) => `${h} of training`,
    delivree: 'Issued on day 30',
    note: 'The certificate carries the distinction when the course is completed in full. It is worth what you can do with it.',
    logoAlt: 'MyDigipal Academy',
  },

  retournement: {
    kicker: 'End of the demonstration',
    titre: 'You have been watching Clara’s account fill up. Time to start yours.',
    texte:
      'Thirty days from now, it will look like this one. That is not a promise of results: it is what the product does when you use it.',
    ouvrir: 'Get started',
    enseigne: 'Who teaches',
    gratuit: (n: number) => `Try the ${n} free lessons`,
    jour30: (rang: string) => `Day 30 · ${rang}`,
    points: 'points',
    cap: (trophees: number, total: number) => `Thirty active days · ${trophees} trophies out of ${total}`,
    vous: 'You',
    jour0: 'Day 0',
    capVide: 'The first square lights up with the first completed lesson.',
  },

  flottant: {
    aria: 'Open an account',
    cta: 'Get started',
    gratuit: (n: number) => `${n} free lessons`,
  },
  barre: {
    marque: 'AI Academy',
    aria: 'Page landmarks',
    langue: 'FR',
    langueAria: 'Lire cette page en français',
    reperes: { n1: 'Level 1', n2: 'Level 2', n3: 'Level 3', avis: 'Reviews', tarifs: 'Pricing' },
    jour: (n: number) => `Day ${n} / 30`,
    cta: 'Get started',
  },
  maison: {
    titre: 'A method born in the room, at La Poste, Pierre Fabre and La Redoute.',
    texte:
      'Paul André taught it for three years in front of real teams, from finance to customer service, and corrected it session after session until it held. That is the version now online.',
    photos: [
      { src: '/academy/references/session-la-poste-2.jpg', alt: 'AI training session at La Poste', legende: 'La Poste', w: 1400, h: 787 },
      { src: '/academy/references/session-leclerc.jpg', alt: 'AI training session at E.Leclerc', legende: 'E.Leclerc', w: 1200, h: 900 },
      { src: '/academy/references/session-abm.jpg', alt: 'Small-group workshop', legende: 'Small-group workshop', w: 1200, h: 900 },
    ],
    chiffres: (avis: Avis) => [
      { valeur: '2,500+', libelle: 'professionals trained' },
      { valeur: `${noteLocale(avis.note, 'en')}/10`, libelle: `across ${avis.nombre} written reviews` },
      { valeur: '11', libelle: 'large groups supported' },
    ],
    metiers: [
      { titre: 'Performance marketing', texte: 'Data-driven acquisition campaigns, across every paid channel.' },
      { titre: 'Data and measurement', texte: 'Tracking, dashboards and processing pipelines, from collection to decision.' },
      { titre: 'Automation and AI', texte: 'Assistants, agents and automations run in production, not in demos.' },
    ],
    logosTitre: 'We train their teams',
    avisTitre: 'They loved the training',
    avisLigne: (avis: Avis) => `${avis.nombre} written reviews, averaging ${noteLocale(avis.note, 'en')} out of 10`,
    avisPlus: (n: number) => `See the ${n} other reviews`,
    avisMoins: 'Show fewer',
  },

  produit: {
    titre: 'This is what you open in the morning.',
    texte: 'Eight screens, filmed inside the product. Click any of them to watch it full size.',
    url: 'academy.mydigipal.com/app',
    agrandir: 'Every screen opens full size, and closes with the Escape key.',
    aVenir: 'Screenshot to come',
  },

  configurateur: {
    titre: 'Pricing',
    sousTitre: 'One month of access. The AI assistant is included.',
    formuleRub: 'What you take',
    avanceeNom: 'The advanced method',
    avanceeLigne: (n: number) =>
      `The method, plus ${n} lessons on agents, MCP chains and cases wired end to end.`,
    assistantInclus: (q: string) => `The AI assistant included, about ${q} questions a month.`,
    contenuMethode: (f: { lecons: number; prompts: number; trophees: number }) => [
      `${f.lecons} written lessons, across three levels`,
      'The CRAFT workshop: build a prompt, and audit your own',
      `The library of ${f.prompts} prompts, ready to copy`,
      'End-of-module quizzes and exercises on your own data',
      `Your profile: points, ranks, day streak, ${f.trophees} trophies`,
      'The certificate of professional AI use',
    ],
    contenuAvancee: (f: { lecons: number; relectures: number }) => [
      'Everything the method contains',
      `${f.lecons} more lessons: agents, MCP servers, automation chains`,
      'The advanced use cases, wired end to end',
      `${f.relectures} exercises reviewed, with written feedback on your own cases`,
      'A thirty-minute session with Paul, on your case',
    ],
    parMoisCourt: 'per month',
    legendeMethode: 'from the method',
    legendeAvance: 'from Automations',
    addonsRub: 'Whenever you want, on top',
    addonsLigne: 'Neither one is needed to follow the course.',
    dejaComprise: 'Included in your plan',
    programmeLigne: (lecons: number) =>
      `${lecons} lessons, three levels, the workshop, the library, the trophies, the certificate.`,
    construireLigne: (lecons: number) => `${lecons} lessons in their own course, up to a working MCP server.`,
    assistantTitre: 'The AI assistant',
    assistantLigne: 'It knows your lessons and answers on your own cases. Monthly subscription, no commitment.',
    sans: 'None',
    parMois: '€ per month',
    assistantSans: 'Both work without it. Add it when the questions come.',
    assistantAvec: (q: string) => `about ${q} questions a month.`,
    places: 'How many seats',
    placesLabel: (n: number, max: number) => (n >= max ? `${max} and more` : `${n} seat${n > 1 ? 's' : ''}`),
    remise: (pct: number) => `Team discount of ${pct}%, applied to the whole basket.`,
    equipeAlt: 'Three colleagues in front of the same screen',
    remiseInfo: (paliers: Array<{ seats: number; pct: number }>) =>
      `The discount starts at ${paliers[0].seats} seats: ${paliers.map((p) => `${p.pct}% at ${p.seats}`).join(', ')}.`,
    total: 'Your total',
    ttc: '€ incl. VAT',
    deviseLabel: 'Displayed currency',
    dejaProgrammeAide: 'Untick it if you only want the other one: the two programmes are independent and sold separately.',
    dejaAcquis: 'Not included',
    panierVide: 'Pick at least one course.',
    remiseCode: (code: string, pct: number) => `Code ${code}: −${pct}% on the method and Automations`,
    unique: 'for one month',
    uniquePlaces: (n: number) => `for one month, ${n} seats`,
    mensuel: 'per month, assistant',
    sansAbo: 'assistant included, nothing to cancel',
    placesRecap: (n: number) => `× ${n} seats`,
    remiseLigne: 'Team discount',
    ouvrir: 'Get started',
    gratuitLigne: (n: number) => `Or start with the ${n} free lessons`,
    devisTexte: (max: number) => `Beyond ${max} seats, we stop calculating: we talk.`,
    devis: 'Request a quote',
    hausseProche: (prix: string, veille: string, apres: string) => `€${prix} until ${veille}, €${apres} afterwards.`,
    equipe: {
      titre: 'Your request',
      societe: 'Company',
      nom: 'Your name',
      email: 'Your work email',
      places: 'Number of seats',
      message: 'What you are looking for (optional)',
      envoyer: 'Send the request',
      envoi: 'Sending…',
      merci: 'Received. Paul replies within one working day, with a priced proposal.',
      erreur: 'The request did not go through. Try again, or write to academy@mydigipal.com.',
    },
    hausse: (prix: string, date: string) => `The method goes up to €${prix} on ${date}.`,
    dateHausse: (jour: number, mois: string) => `${jour} ${mois}`,
  },

  pied: {
    logoAlt: 'MyDigipal Academy',
    liens: [
      { cle: 'terms', label: 'Terms' },
      { cle: 'privacy', label: 'Privacy' },
      { cle: 'legal', label: 'Legal notice' },
      { cle: 'login', label: 'Learner space' },
    ],
    autreLangue: { href: '/fr/academy', label: 'Français' },
  },
};

export function jour30Copy(locale: Locale): Jour30Copy {
  return locale === 'fr' ? FR : EN;
}

