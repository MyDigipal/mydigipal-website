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
      `${programme} leçons dans le programme, ${complement} de plus avec le complément Construire.`,
    cta: 'Ouvrir mon compte',
    cta2: 'Essayer le premier module, gratuit',
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
    nav: ['Parcours', 'Outils', 'Mon espace'],
    bandeau: { kicker: 'Mon espace', titre: 'Bonjour Clara', ligne: 'Formule complète, tout le parcours ouvert.' },
    cartes: {
      kicker: 'Votre parcours',
      reprendre: 'Reprendre',
      continuer: 'Continuer',
      p1: {
        titre: 'The AI Academy',
        ligne: 'De zéro à autonome avec l’IA générative : la méthode CRAFT, les outils, les cas de votre métier.',
        avancement: (f: number, n: number) => `${f} leçons sur ${n}`,
      },
      p2: {
        titre: 'Cas d’usage avancés et MCP',
        ligne: 'Agents, automatisations, serveurs MCP et dix-sept cas réels.',
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
    },
    assistant: {
      question: 'Quelle différence entre un agent et une automatisation ?',
      reponse:
        'Une automatisation suit un chemin écrit d’avance : mêmes étapes, même ordre. Un agent reçoit un but et choisit ses étapes, en appelant des outils si besoin. Pour un reporting hebdomadaire, une automatisation suffit.',
      source: 'Source : les leçons du niveau 3 sur les agents',
    },
    spots: (f: { lessons: number; modules: number; prompts: number; trophees: number; relectures: number; lessonsConstruire: number; lessonsProgramme?: number; lessonsComplement?: number }) => ({
      parcours1: {
        kicker: 'Le programme',
        titre: 'Tout le parcours, du premier prompt aux automatisations.',
        texte: `${f.lessonsProgramme ?? f.lessons} leçons en ${f.modules} modules, trois niveaux. Chaque leçon écrite : un plan, un exemple, un prompt à copier, et un « À vous » à rendre.`,
      },
      parcours2: {
        kicker: 'Le complément Construire',
        titre: 'Agents, automatisations, serveurs MCP.',
        texte: `${f.lessonsComplement ?? f.lessonsConstruire} leçons de plus et dix-sept cas réels de l’agence. C’est le niveau 3, celui où l’on branche les outils les uns aux autres.`,
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
        texte: `Un quiz par module, noté côté serveur. Les exercices sont relus par Paul avec le complément Construire, ${f.relectures} relectures incluses.`,
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
    titre: 'Trente jours, trois niveaux, un compte qui se remplit.',
    etapes: [
      { jours: 'Jours 1 à 10', nom: 'Écrire une demande', texte: 'La méthode CRAFT, leçon par leçon, et le premier exercice relu par un humain.' },
      { jours: 'Jours 11 à 20', nom: 'Se servir des outils', texte: 'L’assistant, la bibliothèque, les images, les fichiers : quoi confier, et à quoi.' },
      { jours: 'Jours 21 à 30', nom: 'Faire faire', texte: 'Agents, automatisations, un serveur MCP en état de marche, et l’attestation.' },
    ],
    texte:
      'Ce qui suit est reconstitué à partir de l’espace apprenant réel : les écrans sont ceux du produit, les règles de points sont celles du code. Clara, elle, est composée : elle a pris le programme, le complément Construire et l’assistant.',
  },

  compte: {
    niveaux: [
      { kicker: 'Niveau 1', nom: 'Écrire une demande', titre: 'Dix jours pour arrêter de perdre trois heures.' },
      { kicker: 'Niveau 2', nom: 'Se servir des outils', titre: 'Elle ne demande plus. Elle sait quoi confier, et à quoi.' },
      { kicker: 'Niveau 3', nom: 'Faire faire', titre: 'Elle branche les outils les uns aux autres.' },
    ],
    jour: (n: number) => `Jour ${n}`,
    j1: {
      phrase: 'Elle ouvre le module. Paul est en face caméra, sans slide.',
      badge: 'Module 1',
      attente: 'Vidéo d’ouverture du module 1',
      note: 'Une vidéo d’ouverture par module. Elle dit à quoi sert le module et ce qu’on saura faire en sortant.',
    },
    j2: {
      phrase: 'Elle lit la fiche. Elle copie le prompt. Il marche.',
      kicker: 'Module 2, leçon 5',
      titre: 'Une action, un verbe',
      corps:
        'Trois demandes empilées dans une phrase donnent trois réponses moyennes. Une seule action, chiffrée quand c’est possible, donne un livrable qu’on peut envoyer.',
      promptLabel: 'Le prompt',
      prompt:
        'Contexte : je suis chargée de compte chez un prestataire multi-sites.\nAction : classe chaque réclamation dans un seul motif, puis compte par motif et par site.\nFormat : un tableau croisé, motifs en lignes, sites en colonnes, avec les totaux.',
      copier: 'Copier',
      copie: 'Copié',
      pied: (n: number) => `${n} leçons écrites : plan, exemple, prompt`,
      terminee: (pts: number) => `Terminée, +${pts}`,
    },
    j3: {
      phrase: 'Elle rend un exercice. Un humain va le lire.',
      kicker: 'Dépôt d’exercice',
      quota: (q: number) => `${q} relectures incluses, ${q} restantes`,
      fichiers: ['reclamations-clients-T1.csv', 'delais-dossiers.csv'],
      fournis: 'fournis avec l’exercice',
      tache: { label: 'La tâche', value: 'Trier 180 réclamations clients par motif' },
      prompt: { label: 'Votre prompt', value: 'Contexte : je suis chargée de compte chez un prestataire multi-sites…' },
      obtenu: { label: 'Ce que vous avez obtenu', value: 'Un tableau croisé motifs et sites, avec les totaux' },
      attente: 'En attente de relecture',
      pts: (n: number) => `+${n} points`,
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
      phrase: 'Le retour arrive. Il est écrit à la main.',
      auteur: 'Paul, formateur',
      meta: 'relu le jour 9, exercice du module 2',
      texte:
        'Votre contexte est bon, votre format est vague. « Un tableau » peut vouloir dire six choses. Écrivez les colonnes que vous voulez, dans l’ordre où vous les voulez, et vous n’aurez plus à retoucher la sortie à la main.',
      trophee: (nom: string, metal: string, pts: number) => `Trophée « ${nom} » · ${metal}, +${pts}`,
    },
    preuve: {
      question: 'Qui relit ?',
      texte:
        'Paul André, qui enseigne cette méthode en salle depuis trois ans, chez Kering, La Poste ou E.Leclerc. Les exercices déposés arrivent chez lui, pas dans une file automatique.',
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
        `${total} trophées, dont ${secrets} secrets : leur nom n’apparaît qu’une fois obtenus. Le meilleur métal dessine le cadre de l’avatar, à droite.`,
    },
    j17: {
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
    j19: {
      phrase: 'On lui demande le visuel en trois formats. Pour hier.',
      tirez: 'Tirez la poignée',
      fourni: 'Fourni',
      recadre: 'Recadré, détouré',
      comparer: 'Comparer les deux visuels',
      altAvant: 'Le visuel fourni, au format carré',
      altApres: 'Le même visuel recadré et détouré automatiquement',
      note: 'Quatre formats, un fond retiré, une déclinaison verticale. Vingt minutes, pas une demi-journée de retouche.',
    },
    j22: {
      phrase: 'Trente minutes en visio. Préparées : il a lu ses exercices avant.',
      direct: 'En direct',
      vous: 'vous',
      alt: 'Session de formation MyDigipal',
      note: 'Elle repart avec un document écrit après l’appel, pas avec des notes.',
    },
    j26: {
      phrase: 'Elle construit son premier serveur MCP. Et là, il faut s’arrêter deux minutes.',
      badge: 'Serveur MCP, en ligne',
      outils: (n: number) => `${n} outils connectés`,
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
    ouvrir: 'Ouvrir mon compte',
    enseigne: 'Qui enseigne',
    gratuit: 'Commencer par le module gratuit',
    jour30: (rang: string) => `Jour 30 · ${rang}`,
    points: 'points',
    cap: (trophees: number, total: number) => `Trente jours actifs · ${trophees} trophées sur ${total}`,
    vous: 'Vous',
    jour0: 'Jour 0',
    capVide: 'Le premier carré s’allume à la première leçon terminée.',
  },

  barre: {
    marque: 'AI Academy',
    aria: 'Repères de la page',
    reperes: { n1: 'Niveau 1', n2: 'Niveau 2', n3: 'Niveau 3', avis: 'Avis', tarifs: 'Tarifs' },
    jour: (n: number) => `Jour ${n} / 30`,
    cta: 'Ouvrir mon compte',
  },
  maison: {
    titre: 'Une méthode née en salle, chez Kering, La Poste ou Pierre Fabre.',
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
    texte: 'Trois écrans du produit : le tableau de bord, une leçon avec son prompt, et l’atelier où la demande se construit.',
    url: 'academy.mydigipal.com/app',
    captures: {
      dashboard: 'Le tableau de bord de l’espace apprenant',
      lecon: 'Une leçon, avec son prompt',
      atelier: 'L’atelier, champ par champ',
    },
    aVenir: 'Capture à venir',
  },

  configurateur: {
    titre: 'Tarifs',
    sousTitre: 'Le programme, et ce que vous y ajoutez.',
    programmeLigne: (lecons: number) =>
      `${lecons} leçons, trois niveaux, l’atelier, la bibliothèque, les trophées, l’attestation. Accès complet.`,
    construireLigne: (lecons: number) => `${lecons} leçons de plus. Le niveau 3 en entier, celui du serveur MCP.`,
    assistantTitre: 'L’assistant IA',
    assistantLigne: 'Il connaît vos leçons et répond sur vos cas. Abonnement mensuel, sans engagement.',
    sans: 'Sans',
    parMois: '€ par mois',
    assistantSans: 'Le programme fonctionne sans. On l’ajoute quand les questions arrivent.',
    assistantAvec: (q: string) => `${q} questions par mois, sans engagement.`,
    places: 'Combien de places',
    placesLabel: (n: number, max: number) => (n >= max ? `${max} et plus` : `${n} place${n > 1 ? 's' : ''}`),
    remise: (pct: number) => `Remise équipe de ${pct} %, appliquée à tout le panier.`,
    remiseInfo: (paliers: Array<{ seats: number; pct: number }>) =>
      `La remise démarre à ${paliers[0].seats} places : ${paliers.map((p) => `${p.pct} % à ${p.seats}`).join(', ')}.`,
    total: 'Votre total',
    ttc: '€ TTC',
    deviseLabel: 'Devise affichée',
    unique: 'une fois, accès complet',
    uniquePlaces: (n: number) => `une fois, pour ${n} places`,
    mensuel: 'par mois, assistant',
    sansAbo: 'pas d’abonnement',
    placesRecap: (n: number) => `× ${n} places`,
    remiseLigne: 'Remise équipe',
    ouvrir: 'Ouvrir mon compte',
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
    hausse: (prix: string, date: string) => `Le programme passe à ${prix} € le ${date}.`,
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
      `${programme} lessons in the programme, ${complement} more with the Build add-on.`,
    cta: 'Open my account',
    cta2: 'Try the first module free',
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
    nav: ['Course', 'Tools', 'My space'],
    bandeau: { kicker: 'My space', titre: 'Hello Clara', ligne: 'Complete plan, the whole course open.' },
    cartes: {
      kicker: 'Your course',
      reprendre: 'Resume',
      continuer: 'Continue',
      p1: {
        titre: 'The AI Academy',
        ligne: 'From zero to autonomous with generative AI: the CRAFT method, the tools, the cases of your own job.',
        avancement: (f: number, n: number) => `${f} of ${n} lessons`,
      },
      p2: {
        titre: 'Advanced Use Cases and MCP',
        ligne: 'Agents, automations, MCP servers and seventeen real cases.',
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
    },
    assistant: {
      question: 'What is the difference between an agent and an automation?',
      reponse:
        'An automation follows a path written in advance: same steps, same order. An agent is given a goal and chooses its steps, calling tools when needed. For a weekly report, an automation is enough.',
      source: 'Source: the level 3 lessons on agents',
    },
    spots: (f: { lessons: number; modules: number; prompts: number; trophees: number; relectures: number; lessonsConstruire: number; lessonsProgramme?: number; lessonsComplement?: number }) => ({
      parcours1: {
        kicker: 'The programme',
        titre: 'The whole course, from the first prompt to automations.',
        texte: `${f.lessonsProgramme ?? f.lessons} lessons across ${f.modules} modules, three levels. Every lesson written: an outline, an example, a prompt to copy, and a task to hand in.`,
      },
      parcours2: {
        kicker: 'The Build add-on',
        titre: 'Agents, automations, MCP servers.',
        texte: `${f.lessonsComplement ?? f.lessonsConstruire} more lessons and seventeen real cases from the agency. This is level 3, where you wire the tools to one another.`,
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
        texte: `One quiz per module, graded server-side. Exercises are reviewed by Paul with the Build add-on, ${f.relectures} reviews included.`,
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
    titre: 'Thirty days, three levels, an account that fills up.',
    etapes: [
      { jours: 'Days 1 to 10', nom: 'Writing a request', texte: 'The CRAFT method, lesson by lesson, and the first exercise reviewed by a human.' },
      { jours: 'Days 11 to 20', nom: 'Using the tools', texte: 'The assistant, the library, images, files: what to hand over, and to what.' },
      { jours: 'Days 21 to 30', nom: 'Having it done', texte: 'Agents, automations, a working MCP server, and the certificate.' },
    ],
    texte:
      'What follows is reconstructed from the real learner space: the screens are the product’s, the point rules are the code’s. Clara is made up: she took the programme, the Build add-on and the assistant.',
  },

  compte: {
    niveaux: [
      { kicker: 'Level 1', nom: 'Writing a request', titre: 'Ten days to stop losing three hours.' },
      { kicker: 'Level 2', nom: 'Using the tools', titre: 'She no longer asks. She knows what to hand over, and to what.' },
      { kicker: 'Level 3', nom: 'Having it done', titre: 'She wires the tools to one another.' },
    ],
    jour: (n: number) => `Day ${n}`,
    j1: {
      phrase: 'She opens the module. Paul is on camera, no slides.',
      badge: 'Module 1',
      attente: 'Opening video of module 1',
      note: 'One opening video per module. It says what the module is for and what you will be able to do at the end.',
    },
    j2: {
      phrase: 'She reads the lesson. She copies the prompt. It works.',
      kicker: 'Module 2, lesson 5',
      titre: 'One action, one verb',
      corps:
        'Three requests stacked in one sentence give three average answers. A single action, with a number when possible, gives a deliverable you can send.',
      promptLabel: 'The prompt',
      prompt:
        'Context: I am an account manager at a multi-site service provider.\nAction: classify each complaint under a single reason, then count by reason and by site.\nFormat: a cross table, reasons as rows, sites as columns, with totals.',
      copier: 'Copy',
      copie: 'Copied',
      pied: (n: number) => `${n} written lessons: outline, example, prompt`,
      terminee: (pts: number) => `Completed, +${pts}`,
    },
    j3: {
      phrase: 'She hands in an exercise. A human is going to read it.',
      kicker: 'Exercise submission',
      quota: (q: number) => `${q} reviews included, ${q} left`,
      fichiers: ['customer-complaints-Q1.csv', 'case-lead-times.csv'],
      fournis: 'provided with the exercise',
      tache: { label: 'The task', value: 'Sort 180 customer complaints by reason' },
      prompt: { label: 'Your prompt', value: 'Context: I am an account manager at a multi-site service provider…' },
      obtenu: { label: 'What you got', value: 'A cross table of reasons and sites, with totals' },
      attente: 'Awaiting review',
      pts: (n: number) => `+${n} points`,
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
      phrase: 'The feedback arrives. It is written by hand.',
      auteur: 'Paul, trainer',
      meta: 'reviewed on day 9, module 2 exercise',
      texte:
        'Your context is good, your format is vague. “A table” can mean six things. Write the columns you want, in the order you want them, and you will never have to fix the output by hand again.',
      trophee: (nom: string, metal: string, pts: number) => `Trophy “${nom}” · ${metal}, +${pts}`,
    },
    preuve: {
      question: 'Who reviews?',
      texte:
        'Paul André, who has taught this method in the room for three years, at Kering, La Poste and E.Leclerc. Submitted exercises land with him, not in an automated queue.',
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
        `${total} trophies, ${secrets} of them secret: their name only appears once earned. The best metal frames the avatar, on the right.`,
    },
    j17: {
      phrase: 'She stops writing her prompts from scratch. Then she adds one.',
      tous: (n: number) => `All · ${n}`,
      onglets: ['Module 2', 'Module 3', 'Module 4'],
      lignes: ['Sort complaints by reason and by site', 'Rewrite an ad in three testable variants'],
      lesien: { texte: 'Anonymised minutes, fixed format', tag: 'hers' },
      copier: 'Copy',
    },
    j19: {
      phrase: 'She is asked for the visual in three formats. For yesterday.',
      tirez: 'Drag the handle',
      fourni: 'Provided',
      recadre: 'Cropped, cut out',
      comparer: 'Compare the two visuals',
      altAvant: 'The visual as provided, square format',
      altApres: 'The same visual, cropped and cut out automatically',
      note: 'Four formats, one background removed, one vertical version. Twenty minutes, not half a day of retouching.',
    },
    j22: {
      phrase: 'Thirty minutes on a call. Prepared: he read her exercises beforehand.',
      direct: 'Live',
      vous: 'you',
      alt: 'MyDigipal training session',
      note: 'She leaves with a written document after the call, not with notes.',
    },
    j26: {
      phrase: 'She builds her first MCP server. And here, we need to stop for two minutes.',
      badge: 'MCP server, online',
      outils: (n: number) => `${n} tools connected`,
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
    ouvrir: 'Open my account',
    enseigne: 'Who teaches',
    gratuit: 'Start with the free module',
    jour30: (rang: string) => `Day 30 · ${rang}`,
    points: 'points',
    cap: (trophees: number, total: number) => `Thirty active days · ${trophees} trophies out of ${total}`,
    vous: 'You',
    jour0: 'Day 0',
    capVide: 'The first square lights up with the first completed lesson.',
  },

  barre: {
    marque: 'AI Academy',
    aria: 'Page landmarks',
    reperes: { n1: 'Level 1', n2: 'Level 2', n3: 'Level 3', avis: 'Reviews', tarifs: 'Pricing' },
    jour: (n: number) => `Day ${n} / 30`,
    cta: 'Open my account',
  },
  maison: {
    titre: 'A method born in the room, at Kering, La Poste and Pierre Fabre.',
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
    texte: 'Three screens of the product: the dashboard, a lesson with its prompt, and the workshop where the request gets built.',
    url: 'academy.mydigipal.com/app',
    captures: {
      dashboard: 'The learner space dashboard',
      lecon: 'A lesson, with its prompt',
      atelier: 'The workshop, field by field',
    },
    aVenir: 'Screenshot to come',
  },

  configurateur: {
    titre: 'Pricing',
    sousTitre: 'The programme, and what you add to it.',
    programmeLigne: (lecons: number) =>
      `${lecons} lessons, three levels, the workshop, the library, the trophies, the certificate. Full access.`,
    construireLigne: (lecons: number) => `${lecons} more lessons. Level 3 in full, the one with the MCP server.`,
    assistantTitre: 'The AI assistant',
    assistantLigne: 'It knows your lessons and answers on your own cases. Monthly subscription, no commitment.',
    sans: 'None',
    parMois: '€ per month',
    assistantSans: 'The programme works without it. Add it when the questions come.',
    assistantAvec: (q: string) => `${q} questions per month, no commitment.`,
    places: 'How many seats',
    placesLabel: (n: number, max: number) => (n >= max ? `${max} and more` : `${n} seat${n > 1 ? 's' : ''}`),
    remise: (pct: number) => `Team discount of ${pct}%, applied to the whole basket.`,
    remiseInfo: (paliers: Array<{ seats: number; pct: number }>) =>
      `The discount starts at ${paliers[0].seats} seats: ${paliers.map((p) => `${p.pct}% at ${p.seats}`).join(', ')}.`,
    total: 'Your total',
    ttc: '€ incl. VAT',
    deviseLabel: 'Displayed currency',
    unique: 'once, full access',
    uniquePlaces: (n: number) => `once, for ${n} seats`,
    mensuel: 'per month, assistant',
    sansAbo: 'no subscription',
    placesRecap: (n: number) => `× ${n} seats`,
    remiseLigne: 'Team discount',
    ouvrir: 'Open my account',
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
    hausse: (prix: string, date: string) => `The programme goes up to €${prix} on ${date}.`,
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

