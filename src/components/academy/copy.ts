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

import type { Locale } from './data';

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
    cta: 'Ouvrir mon compte',
    cta2: 'Suivre les trente jours',
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

  mention: {
    kicker: 'Compte de démonstration',
    texte:
      'Ce qui suit est un parcours reconstitué à partir de l’espace apprenant réel. Les écrans sont ceux du produit, les règles de points sont celles du code. La personne, elle, est composée : elle a pris le programme, le complément Construire et l’assistant.',
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
      chiffres: [
        { valeur: '2 500+', libelle: 'professionnels formés' },
        { valeur: '9,4/10', libelle: 'sur 497 retours écrits' },
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
      nom: 'Camille R.',
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
    titre: 'Un MCP, c’est une prise.',
    chapeau:
      'Le modèle sait écrire. Il ne sait rien de vos outils, et il n’a le droit d’y toucher à rien. Le serveur MCP est ce qui se branche entre les deux, et il déclare exactement ce qui est permis.',
    /** Nommés en texte, jamais en logotypes : on ne reproduit pas les marques d’autrui. */
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
    outils: [
      {
        id: 'gmail',
        label: 'Gmail',
        tag: 'lecture + brouillon',
        titre: 'Envoi de courriels',
        corps:
          'Le serveur a le droit de lire un dossier et de préparer un brouillon. Il n’a pas le droit d’envoyer. La relance est prête quand elle ouvre sa boîte, elle relit, elle clique.',
        avant: 'Elle copiait la réponse du modèle, la recollait dans Gmail, corrigeait le ton.',
        apres: 'Elle écrit une phrase. Le brouillon existe, au bon format, dans le bon fil.',
      },
      {
        id: 'ads',
        label: 'Publicité',
        tag: 'lecture seule',
        titre: 'Prospection et annonces',
        corps:
          'Il lit les performances des campagnes, repère les annonces qui décrochent et propose trois variantes testables. Il ne dépense rien : la mise en ligne reste un geste humain.',
        avant: 'Un export tous les lundis, une heure de lecture, une intuition.',
        apres: 'Trois variantes argumentées sur la table le lundi matin, elle en garde une.',
      },
      {
        id: 'sheets',
        label: 'Tableur',
        tag: 'lecture + écriture',
        titre: 'Données et tableaux',
        corps:
          'Il ouvre l’export brut, nettoie les colonnes, calcule les totaux et écrit le résultat dans un nouvel onglet. L’original n’est jamais modifié.',
        avant: 'Quarante minutes de recherche-remplace et une formule qui casse.',
        apres: 'Un onglet propre, daté, avec la liste de ce qui a été corrigé.',
      },
      {
        id: 'crm',
        label: 'CRM',
        tag: 'écriture encadrée',
        titre: 'Fiches clients',
        corps:
          'Le compte rendu d’appel atterrit dans la bonne fiche, anonymisé quand le dossier l’exige. Les champs qu’il peut écrire sont déclarés un par un dans la configuration.',
        avant: 'Des notes dans un carnet, reportées le vendredi, ou jamais.',
        apres: 'La fiche est à jour avant qu’elle ait raccroché.',
      },
    ],
    avant: 'Avant',
    apres: 'Après',
    pied: 'Ce n’est pas du développement. C’est une configuration qui se lit, et c’est le sujet du dernier tiers du programme, avec les agents et les automatisations.',
  },

  diplome: {
    kicker: 'Jour 30',
    titre: 'Elle l’imprime et la pose sur le bureau de son directeur.',
    surtitre: 'Attestation d’usage professionnel de l’intelligence artificielle',
    decernee: 'décernée à',
    nom: 'Camille Rouvière',
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
    titre: 'Ce compte n’existe pas. Le vôtre est vide.',
    texte:
      'Trente jours plus tard, il ressemblera à celui-là. Ce n’est pas une promesse de résultat : c’est ce que fait le produit quand on s’en sert.',
    ouvrir: 'Ouvrir mon compte',
    enseigne: 'Qui enseigne',
    jour30: (rang: string) => `Jour 30 · ${rang}`,
    points: 'points',
    cap: (trophees: number, total: number) => `Trente jours actifs · ${trophees} trophées sur ${total}`,
    vous: 'Vous',
    jour0: 'Jour 0',
    capVide: 'Le premier carré s’allume à la première leçon terminée.',
  },

  maison: {
    titre: 'MyDigipal est une agence. Ces outils, on les facture avant de les enseigner.',
    texte:
      'La méthode ne vient pas d’une veille. Elle vient du travail quotidien de l’agence, puis elle a été corrigée session après session devant de vraies salles, jusqu’à ce qu’elle tienne.',
    photos: [
      { src: '/references/session-la-poste-2.jpg', alt: 'Session de formation IA chez La Poste', legende: 'La Poste', w: 1400, h: 787 },
      { src: '/references/session-leclerc.jpg', alt: 'Session de formation IA chez E.Leclerc', legende: 'E.Leclerc', w: 1200, h: 900 },
      { src: '/references/session-abm.jpg', alt: 'Atelier en petit groupe', legende: 'Atelier en petit groupe', w: 1200, h: 900 },
    ],
    chiffres: [
      { valeur: '2 500+', libelle: 'professionnels formés' },
      { valeur: '9,4/10', libelle: 'sur 497 retours écrits' },
      { valeur: '11', libelle: 'grands groupes accompagnés' },
    ],
    metiers: [
      { titre: 'Marketing de performance', texte: 'Campagnes d’acquisition pilotées à la donnée, sur tous les canaux payants.' },
      { titre: 'Data et mesure', texte: 'Tracking, tableaux de bord et chaînes de traitement, de la collecte à la décision.' },
      { titre: 'Automatisation et IA', texte: 'Assistants, agents et automatisations opérés en production, pas en démonstration.' },
    ],
    logosTitre: 'Nous formons leurs équipes',
    avisTitre: '497 retours écrits, une moyenne de 9,4 sur 10',
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
    titre: 'Le programme, et ce que vous y ajoutez.',
    programmeLigne: (lecons: number) =>
      `${lecons} leçons, trois niveaux, l’atelier, la bibliothèque, les trophées, l’attestation. Accès permanent.`,
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
    unique: 'une fois, accès permanent',
    uniquePlaces: (n: number) => `une fois, pour ${n} places`,
    mensuel: 'par mois, assistant',
    sansAbo: 'pas d’abonnement',
    placesRecap: (n: number) => `× ${n} places`,
    remiseLigne: 'Remise équipe',
    ouvrir: 'Ouvrir mon compte',
    devisTexte: (max: number) => `Au-delà de ${max} places, on ne calcule plus : on en parle.`,
    devis: 'Demander un devis',
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
    cta: 'Open my account',
    cta2: 'Follow the thirty days',
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

  mention: {
    kicker: 'Demonstration account',
    texte:
      'What follows is a journey reconstructed from the real learner space. The screens are the product’s, the point rules are the code’s. The person is made up: she took the programme, the Build add-on and the assistant.',
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
      chiffres: [
        { valeur: '2,500+', libelle: 'professionals trained' },
        { valeur: '9.4/10', libelle: 'across 497 written reviews' },
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
      nom: 'Camille R.',
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
    outils: [
      {
        id: 'gmail',
        label: 'Gmail',
        tag: 'read + draft',
        titre: 'Sending emails',
        corps:
          'The server is allowed to read a folder and prepare a draft. It is not allowed to send. The follow-up is ready when she opens her inbox, she rereads, she clicks.',
        avant: 'She copied the model’s answer, pasted it into Gmail, fixed the tone.',
        apres: 'She writes one sentence. The draft exists, in the right format, in the right thread.',
      },
      {
        id: 'ads',
        label: 'Advertising',
        tag: 'read only',
        titre: 'Prospecting and ads',
        corps:
          'It reads campaign performance, spots the ads that are slipping and proposes three testable variants. It spends nothing: going live remains a human gesture.',
        avant: 'An export every Monday, an hour of reading, a hunch.',
        apres: 'Three argued variants on the table on Monday morning, she keeps one.',
      },
      {
        id: 'sheets',
        label: 'Spreadsheet',
        tag: 'read + write',
        titre: 'Data and tables',
        corps:
          'It opens the raw export, cleans the columns, computes the totals and writes the result in a new tab. The original is never modified.',
        avant: 'Forty minutes of find-and-replace and a formula that breaks.',
        apres: 'A clean, dated tab, with the list of what was corrected.',
      },
      {
        id: 'crm',
        label: 'CRM',
        tag: 'scoped write',
        titre: 'Client records',
        corps:
          'The call summary lands in the right record, anonymised when the file requires it. The fields it may write are declared one by one in the configuration.',
        avant: 'Notes in a notebook, transferred on Friday, or never.',
        apres: 'The record is up to date before she has hung up.',
      },
    ],
    avant: 'Before',
    apres: 'After',
    pied: 'This is not development. It is a configuration you can read, and it is the subject of the last third of the programme, along with agents and automations.',
  },

  diplome: {
    kicker: 'Day 30',
    titre: 'She prints it and puts it on her director’s desk.',
    surtitre: 'Certificate of professional use of artificial intelligence',
    decernee: 'awarded to',
    nom: 'Camille Rouvière',
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
    titre: 'This account does not exist. Yours is empty.',
    texte:
      'Thirty days from now, it will look like this one. That is not a promise of results: it is what the product does when you use it.',
    ouvrir: 'Open my account',
    enseigne: 'Who teaches',
    jour30: (rang: string) => `Day 30 · ${rang}`,
    points: 'points',
    cap: (trophees: number, total: number) => `Thirty active days · ${trophees} trophies out of ${total}`,
    vous: 'You',
    jour0: 'Day 0',
    capVide: 'The first square lights up with the first completed lesson.',
  },

  maison: {
    titre: 'MyDigipal is an agency. We bill these tools before we teach them.',
    texte:
      'The method does not come from reading the news. It comes from the agency’s daily work, then it was corrected session after session in front of real rooms, until it held.',
    photos: [
      { src: '/references/session-la-poste-2.jpg', alt: 'AI training session at La Poste', legende: 'La Poste', w: 1400, h: 787 },
      { src: '/references/session-leclerc.jpg', alt: 'AI training session at E.Leclerc', legende: 'E.Leclerc', w: 1200, h: 900 },
      { src: '/references/session-abm.jpg', alt: 'Small-group workshop', legende: 'Small-group workshop', w: 1200, h: 900 },
    ],
    chiffres: [
      { valeur: '2,500+', libelle: 'professionals trained' },
      { valeur: '9.4/10', libelle: 'across 497 written reviews' },
      { valeur: '11', libelle: 'large groups supported' },
    ],
    metiers: [
      { titre: 'Performance marketing', texte: 'Data-driven acquisition campaigns, across every paid channel.' },
      { titre: 'Data and measurement', texte: 'Tracking, dashboards and processing pipelines, from collection to decision.' },
      { titre: 'Automation and AI', texte: 'Assistants, agents and automations run in production, not in demos.' },
    ],
    logosTitre: 'We train their teams',
    avisTitre: '497 written reviews, averaging 9.4 out of 10',
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
    titre: 'The programme, and what you add to it.',
    programmeLigne: (lecons: number) =>
      `${lecons} lessons, three levels, the workshop, the library, the trophies, the certificate. Permanent access.`,
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
    unique: 'once, permanent access',
    uniquePlaces: (n: number) => `once, for ${n} seats`,
    mensuel: 'per month, assistant',
    sansAbo: 'no subscription',
    placesRecap: (n: number) => `× ${n} seats`,
    remiseLigne: 'Team discount',
    ouvrir: 'Open my account',
    devisTexte: (max: number) => `Beyond ${max} seats, we stop calculating: we talk.`,
    devis: 'Request a quote',
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

