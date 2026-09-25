// ============================================================
// Les textes de la page de vente v2
// ============================================================
//
// ⚠️ Aucun fait chiffré n'est écrit ici. Les leçons, les minutes, les prix, la
// note et le nombre de retours viennent du JSON de l'application
// (`/api/academy/public/jour30`) et sont passés en argument. C'est la règle du
// 28/08/2026 : un fait chiffré, une source. `npm run check:chiffres` échoue si
// un nombre est écrit à la main dans une copie.

import type { FilmsCopy } from './SectionsFilms';

export type Locale = 'fr' | 'en';

const FR = {
  meta: {
    titre: 'Formation IA en ligne : le programme complet',
    // ⚠️ Les outils sont nommés : la description est lue par Google, et les
    // campagnes achètent « formation chatgpt », « formation copilot »,
    // « formation gemini » et « formation claude ia ». Voir le hero.
    description:
      'Formation IA en ligne : la méthode de prompting, le parcours de votre outil (ChatGPT, Claude, Copilot, Gemini) et les automatisations. Essai gratuit.',
  },
  barre: {
    programme: 'Le programme',
    // ⚠️ Cette entrée a changé DEUX fois le 07/09. Elle disait « La pratique »,
    // qui ne disait pas ce qu'on trouve derrière ; elle a nommé « Les outils »,
    // et la section des quatre parcours outils a été retirée dans la foulée
    // (Paul : « on n'a pas besoin d'une section entière pour parler des
    // différents outils »). Elle mène désormais à la visite de l'espace
    // apprenant, qui est ce qu'on achète.
    academie: 'L’Académie',
    trajet: 'Le trajet',
    tarifs: 'Les tarifs',
    cta: 'Commencer',
    exProgramme: (lecons: number, modules: number, heures: string) =>
      `${lecons} leçons, ${modules} modules, ${heures}. Ce que vous apprenez, et ce que chaque module vous fait produire.`,
    exTrajet: 'Trente jours dans un compte, jour après jour, jusqu’à l’attestation.', // chiffre-libre : les trente jours du récit
    exTarifs: (prix: string, jours: number) =>
      `À partir de ${prix} pour ${jours} jours, l’assistant compris. La méthode, les automatisations, ou les deux.`,
  },
  hero: {
    kicker: 'Formation IA en ligne',
    titre: 'Apprendre à travailler avec l’IA, en trente jours.', // chiffre-libre : les trente jours du récit, pas la durée d'accès
    sous: (lecons: number, heures: string) =>
      `${lecons} leçons, ${heures} de formation. La méthode d’abord, votre outil ensuite, puis les automatisations qui tournent sans vous. Née de trois ans d’ateliers chez La Poste, Pierre Fabre et La Redoute.`,
    cta: (prix: string) => `Commencer, ${prix}`,
    cta2: (lecons: number) => `${lecons} leçons offertes`,
    faitLecons: 'leçons',
    faitPrompts: 'prompts prêts',
    faitExercices: 'exercices',
    faitNote: (retours: number) => `sur ${retours} retours`,
  },
  programme: {
    kicker: 'Le programme',
    // ⚠️ Le titre disait « Ce que vous apprenez, module par module » : il
    // décrivait la section au lieu de dire ce qu'on y gagne, et il redisait le
    // libellé juste au-dessus. Il annonce maintenant la progression, qui est
    // l'argument des trois étapes.
    titre: 'Ce que vous apprenez, et dans quel ordre',
    // ⚠️ La durée était nue (« 16 modules, 12 h 28 »), donc personne ne savait
    // ce qu'elle comptait (Paul, 07/09 : « c'est quoi, c'est de l'audio, de la
    // vidéo ? »). C'est la somme du temps de lecture et de travail estimé des
    // leçons, ni de l'audio ni de la vidéo : on le dit. Ne pas y ajouter
    // l'écoute, la narration n'existe en français que sur les leçons offertes.
    chapeau: (modules: number, heures: string) =>
      `Trois étapes, ${modules} modules, ${heures} de lecture et d’exercices, en français comme en anglais. Vous choisissez un outil, et le parcours ne garde que celui-là.`,
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
      `L’accès gratuit ouvre ${lecons} leçons et ${minutes} minutes, sans carte bancaire. ${modulesAuto} modules s’ouvrent avec Les automatisations.`,
  },
  outils: {
    kicker: 'Le parcours de votre outil',
    titre: 'Quatre outils, quatre parcours écrits séparément.',
    chapeau:
      "Vous en suivez un seul, celui que vous avez déjà sous la main, et vous en ouvrez un autre le jour où votre entreprise change d'avis. Chaque page dit ce que l'outil fait, ce qu'il ne fait pas, et ce que la formation en tire.",
    lien: 'Voir le parcours',
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
    titre: 'Trente jours dans un compte', // chiffre-libre : les trente jours du récit, pas la durée d'accès
    // ⚠️ « Trente jours, deux quinzaines, un compte qui se remplit » parlait en
    // jargon interne : « quinzaine » est notre découpage, pas le sien, et « un
    // compte qui se remplit » ne dit pas ce qu'on y gagne (Paul, 07/09).
    ruban: 'Trente jours, vus de l’intérieur d’un compte.', // chiffre-libre : les trente jours du récit, pas la durée d'accès
    // ⚠️ « Elle arrête de faire. Elle fait faire. » : la formule était sèche et
    // ne disait ni le moyen ni le moment. Celle-ci dit les deux.
    quinzaine2: 'Elle branche ses outils. Le lundi matin, le travail est déjà fait.',
    chapeau:
      'Clara Martin est une apprenante composée. Son compte se remplit selon le barème réel du produit. Ouvrez une phase pour voir ce qu’elle fait, jour après jour.',
    pointsAuBout: 'points au bout',
    moments: (n: number) => `${n} moments`,
    jour: (n: number) => `Jour ${n}`,
  },
  mcp: {
    kicker: 'Les automatisations',
    // Paul, 07/09 : « change le titre en The end goal. C'est le résultat
    // final : que vous ayez des agents qui bossent sur tous les fronts. »
    titre: 'Le but final : des agents qui travaillent sur tous les fronts',
    texte:
      'Au bout du parcours, vos outils sont branchés et vos chaînes tournent sans vous. Un serveur MCP est la prise : il donne à l’assistant l’accès à un outil, et seulement ce que vous autorisez.',
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
    domainesTitre: 'Domaines couverts',
    // ⚠️ Cette section montre le tableau de bord ; son titre d'origine,
    // « Ce qu'il y a dans la formation », redisait celui du programme juste
    // au-dessus (relevé le 07/09).
    visiteTitre: 'L’espace que vous ouvrez chaque matin.',
    tousLesAvis: 'Tous les retours',
    // La carte de profil, à côté de l'attestation. Aucun nombre ici : ils
    // arrivent tous de l'app, par `parcours` et par le dernier état du récit.
    profil: {
      kicker: 'Son compte au jour 30',
      nom: 'Clara Martin',
      points: 'points',
      serie: (n: number) => `${n} jours d’affilée`,
      trophees: (obtenus: number, total: number) => `${obtenus} trophées sur ${total}`,
      faits: {
        depots: 'exercices déposés',
        quiz: 'quiz réussis',
        relectures: 'exercices relus et annotés',
        session: 'session de quinze minutes, gagnée aux points',
      },
      pied: 'Les points viennent de ce qu’on fait, pas de ce qu’on lit.',
    },
  },
  diagnostic: {
    kicker: 'Par où commencer',
    /**
     * ⚠️ Le titre disait « le parcours se met dans votre ordre », et son anglais
     * « the course falls into your order » ne voulait rien dire (Paul, 13/09).
     * Il annonce maintenant ce que la section fait : quatre questions, et les
     * modules qui vous concernent.
     */
    titre: 'Quatre questions pour savoir par quels modules commencer.',
    chapeau:
      'Tout le monde reçoit les mêmes leçons. Ce qui change, c’est par quoi on commence, et ce qu’on peut garder pour plus tard.',
    numero: (n: number, total: number) => `Question ${n} sur ${total}`,
    plusieurs: 'Plusieurs réponses possibles',
    continuer: 'Continuer',
    revenir: 'Revenir',
    votreProfil: 'Votre profil',
    parLa: 'Vous commencez par',
    formule: 'La formule qui vous va',
    duree: (jours = 60) => `pour ${jours} jours`,
    avecCode: (c: string) => `avec le code ${c}`,
    offreMethode: 'La méthode',
    offreAvancee: 'La méthode avancée',
    cta: 'Commencer par là',
    refaire: 'Refaire le test',
    outilUn: (o: string) => `Votre parcours outil sera celui de ${o}.`,
    outilPlusieurs: (l: string[]) =>
      `Vous avez ${l.slice(0, -1).join(', ')} et ${l[l.length - 1]} : le parcours en ouvre un, vous choisirez lequel en arrivant.`,
    compteDepart: (total: number) => `Les ${total} modules des deux programmes`,
    compteFini: (retenus: number, total: number, coeur: number, duree: string) =>
      `${retenus} modules sur ${total} vous concernent · vous commencez par ${coeur}, soit ${duree}`,
    paliers: { free: 'offert', essentials: 'méthode', pro: 'automatisations' },
    legendeMethode: 'La méthode',
    legendeAuto: 'Les automatisations',
  },
  tarifs: {
    kicker: 'Ce que ça coûte',
    /**
     * ⚠️ Le titre ANNONÇAIT « À partir de 190 € » (Paul, 13/09 : « c'est nul »).
     * Le montant était celui du moins cher des deux programmes, donc il vendait
     * la page au prix du complément, que personne n'achète seul en arrivant.
     * Le titre nomme la section, les prix sont juste en dessous.
     */
    titre: 'Les tarifs',
    /**
     * ⚠️ Le chapeau ANNONÇAIT LA HAUSSE DU 1er OCTOBRE (« le prix passe à
     * 450 € »). Elle est abandonnée depuis le 11/09/2026 : avec trois portes
     * d'achat, La méthode seule à 450 € aurait coûté presque le prix du lot.
     * Ce qui la remplace est vrai en permanence et n'a pas besoin d'être tenu
     * à jour : ce qui est compris, et la durée d'accès.
     */
    // La garantie s'ajoute le 15/09/2026 : elle n'était dite nulle part sur la
    // page, alors qu'elle répond à la dernière hésitation avant la carte.
    chapeau: (jours: number, garantie: { heures: number; seuilPct: number }) =>
      `L’assistant IA est compris dans les trois, et l’accès dure ${jours} jours quelle que soit la formule. Vous avez ${garantie.heures} heures pour demander un remboursement intégral, tant que moins de ${garantie.seuilPct}\u00a0% du parcours a été consulté.`,
    duree: (jours = 60) => `pour ${jours} jours`,
    methode: 'La méthode',
    /**
     * ⚠️ Les deux sous-titres se lisent EN MIROIR, et c'est leur seul travail :
     * dire d'un coup d'œil ce que chaque carré contient de plus que l'autre.
     *
     * Celui-ci disait « Le parcours complet » (Paul, 09/09 : « il n'est pas
     * complet, vu qu'il manque les automatisations »). Un carré qui se dit
     * complet à côté d'un carré qui ajoute cent une leçons se contredit tout
     * seul, et fait douter du reste de la grille.
     */
    methodeSous: 'La méthode et votre outil',
    /**
     * ⚠️ « La méthode avancée » A DISPARU comme nom de formule (Paul,
     * 11/09/2026). Les deux noms publics sont La méthode et Les
     * automatisations, et le troisième achat n'est pas un troisième produit :
     * c'est les deux premiers ensemble. « Avancée » annonçait un niveau là
     * où la bande dit une addition, et le mot entrait en concurrence avec
     * « Les automatisations » dans la même grille.
     */
    auto: 'Les automatisations',
    autoSous: 'Les agents, les chaînes et le MCP',
    lot: 'Les deux',
    lotSous: 'La méthode + Les automatisations',
    lotAuLieuDe: (plein: string) => `au lieu de ${plein}`,
    lotEconomie: (montant: string) => `Vous économisez ${montant}`,
    lotCta: 'Prendre les deux',
    commencer: 'Commencer',
    licences: 'Licences',
    places: (n: number) => `${n} licences`,
    parPlace: 'par licence',
    total: (montant: string, places: number) => `${montant} au total pour ${places} licences`,
    remiseEquipe: (seuil: number) => `remise à partir de ${seuil} licences`,
    plusDeLicences: 'Plus de dix licences',
    devisTitre: 'On préfère en discuter avec vous.',
    devisTexte:
      'Au-delà de dix licences, le prix se construit avec vous : les accès, le rythme, l’accompagnement de l’équipe. Dites-nous ce que vous cherchez, Paul vous répond sous un jour ouvré.',
    survol: 'Survolez une ligne pour voir l’écran',
    survolTactile: 'Touchez une ligne pour voir l’écran',
    // ⚠️ Disait « en euros » quelle que soit la devise affichée (15/09/2026).
    // En dollars aucune TVA n'est facturée : le tunnel le dit dans ces termes.
    rappel: (devise: 'EUR' | 'GBP' | 'USD') =>
      devise === 'USD'
        ? 'L’assistant IA est compris dans les trois. Les prix sont en dollars américains, et le montant affiché est le montant payé.'
        : `L’assistant IA est compris dans les trois. Les prix sont en ${devise === 'GBP' ? 'livres sterling' : 'euros'}, toutes taxes comprises.`,
    /**
     * La bande de réassurance, sous les cartes (21/09/2026).
     *
     * Vingt-quatre tunnels ouverts depuis le 15/09, deux arrivées jusqu'à la page
     * de paiement, zéro achat : ce qui manque n'est pas l'envie, c'est ce qu'on sait
     * au moment de sortir sa carte. Le remboursement était dit dans le chapeau, en
     * paragraphe ; la facture et le moyen de paiement n'étaient dits nulle part.
     *
     * ⚠️ Les heures et le seuil viennent de l'application, jamais écrits ici.
     */
    rassure: (garantie: { heures: number; seuilPct: number }) => [
      {
        titre: `${garantie.heures} heures pour changer d’avis`,
        detail: `Remboursement intégral tant que moins de ${garantie.seuilPct} % du parcours a été consulté.`,
      },
      {
        titre: 'Facture au nom de votre société',
        detail: 'Émise automatiquement après le paiement, TVA comprise.',
      },
      {
        titre: 'Paiement par carte',
        detail: 'Page sécurisée par Revolut. Votre accès s’ouvre dans la minute.',
      },
    ],
    rassureAutre: 'Besoin d’un virement, d’un bon de commande ou d’une facture avant paiement ?',
    rassureAutreLien: 'Écrivez-moi',
    /**
     * Les conditions générales de vente de l'application (24/09/2026). Elles
     * portent la garantie de l'article 6 ; les CGU de l'agence ne disent rien
     * d'un achat de formation. Liées sous la grille et dans le pied de page.
     */
    cgv: 'Conditions générales de vente',
    cgvLien: 'https://academy.mydigipal.com/fr/terms',
    cgvAvant: 'L’achat est régi par nos',

    gratuitTag: 'Essayer d’abord',
    // ⚠️ La durée de l'essai vient de l'app (`essai_heures`, 25/09/2026). Elle
    // était écrite trois fois ici, en chiffres et en toutes lettres.
    gratuitTitre: (lecons: number, heures: number) => `${lecons} leçons offertes, pendant ${heures} heures`,
    gratuitTexte: (heures: number) =>
      `Des modules entiers, sans carte bancaire : la prise en main, puis écrire, traduire et résumer. ${heures} heures pour juger sur pièce avant de payer.`,
    gratuitCta: 'Ouvrir l’accès gratuit',
    // ⚠️ La durée se dit PARTOUT où l'accès gratuit est proposé : le hero,
    // le retournement, le bouton flottant et la grille. Trois de ces quatre
    // endroits l'annonçaient sans durée (relevé le 07/09).
    gratuitCourt: (lecons: number, heures: number) => `${lecons} leçons, ${heures} h d’essai`,

    /**
     * Le code promo (07/09/2026, option B retenue par Paul dans le labo
     * `labo/tarifs-code-promo.html`).
     *
     * ⚠️ Le pourcentage, les montants et la date de fin viennent tous de
     * l'application : rien de tout cela ne s'écrit ici. Une remise recopiée à
     * la main survit à la fin du code et promet un prix qui n'existe plus.
     */
    codePastille: (pct: number) => `−${pct} %`,
    codeNom: (code: string) => `code ${code}`,
    codeBandeau: (pct: number, portee: string, fin: string | null) =>
      `Votre code est actif : ${pct} % ${portee}${fin ? `, jusqu’au ${fin}` : ''}. Il s’applique tout seul au paiement.`,
    codePortee: {
      deux: 'sur toutes les formules',
      methode: 'sur La méthode',
      avancee: 'sur Les automatisations',
      lot: 'sur les deux programmes ensemble',
    },
    economie: (montant: string, places: number) =>
      places > 1 ? `Vous économisez ${montant} au total` : `Vous économisez ${montant}`,
  },
  // Les films parlants (25/09/2026). En français, deux extraits de la
  // conférence donnée pour SeLoger (Paul accepte que le nom s'entende) : les
  // données montrées sont fictives. Aucun nombre dans les légendes.
  films: {
    lire: 'Lire la vidéo',
    voir: 'Voir',
    // Le film du hero est une conférence, pas l'app : l'adresse de l'app
    // au-dessus aurait été fausse (Paul, 25/09/2026).
    urlCadre: 'Extrait d’une formation en entreprise',
    // Dans le cadre du hero, à la place de la capture (25/09/2026).
    hero: {
      id: 'conference-reclamation-fr',
      titre: 'Répondre à une réclamation, devant les équipes de SeLoger',
      legende:
        'L’IA promet un geste commercial qu’on n’a pas le droit de faire, on la recadre, puis elle tire le tableau de bord de toutes les réclamations.',
    },
    salle: {
      titre: 'La méthode, devant une vraie salle.',
      chapeau:
        'Un extrait d’une conférence donnée pour les équipes de SeLoger. Les données sont fictives, les réflexes sont ceux de la formation.',
      films: [
        {
          id: 'conference-rendez-vous-fr',
          titre: 'Préparer un rendez-vous à enjeu',
          legende:
            'Le prompt CRAFT, un rapport trop long qu’on recadre, puis l’IA qui joue la cliente agacée pour s’entraîner.',
        },
      ],
    },
  } as FilmsCopy,
};

const EN: typeof FR = {
  meta: {
    titre: 'Online AI training course: the full programme',
    description:
      'Online AI course, module by module: the prompting method, the path for your own tool (ChatGPT, Claude, Copilot, Gemini), automations. Free access to start.',
  },
  barre: {
    programme: 'The programme',
    academie: 'The Academy',
    trajet: 'The path',
    tarifs: 'Pricing',
    cta: 'Get started',
    exProgramme: (lecons, modules, heures) =>
      `${lecons} lessons, ${modules} modules, ${heures}. What you learn, and what each module makes you produce.`,
    exTrajet: 'Thirty days inside an account, day by day, up to the certificate.', // chiffre-libre : les trente jours du récit
    exTarifs: (prix, jours) => `From ${prix} for ${jours} days, assistant included. The method, the automations, or both.`,
  },
  hero: {
    kicker: 'Online AI course',
    titre: 'Learn to work with AI, in thirty days.', // chiffre-libre : les trente jours du récit, pas la durée d'accès
    sous: (lecons, heures) =>
      `${lecons} lessons, ${heures} of training. The method first, then your tool, then the automations that run without you. Born from three years of workshops at La Poste, Pierre Fabre and La Redoute.`,
    cta: (prix) => `Get started, ${prix}`,
    cta2: (lecons) => `${lecons} free lessons`,
    faitLecons: 'lessons',
    faitPrompts: 'ready prompts',
    faitExercices: 'exercises',
    faitNote: (retours) => `across ${retours} reviews`,
  },
  programme: {
    kicker: 'The programme',
    titre: 'What you learn, and in what order',
    chapeau: (modules, heures) =>
      `Three stages, ${modules} modules, ${heures} of reading and exercises, in English and in French. You pick one tool, and the path keeps only that one.`,
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
      `Free access opens ${lecons} lessons and ${minutes} minutes, no card needed. ${modulesAuto} modules open with Automations.`,
  },
  outils: {
    kicker: 'Your tool’s path',
    titre: 'Four tools, four paths, written separately.',
    chapeau:
      'You follow one, the one already in your hands, and you open another the day your company changes its mind. Each page says what the tool does, what it does not, and what the course gets out of it.',
    lien: 'See the path',
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
    titre: 'Thirty days inside an account', // chiffre-libre : les trente jours du récit, pas la durée d'accès
    ruban: 'Thirty days, seen from inside an account.', // chiffre-libre : les trente jours du récit, pas la durée d'accès
    quinzaine2: 'She plugs in her tools. On Monday morning, the work is already done.',
    chapeau:
      'Clara Martin is a composite learner. Her account fills up on the product’s real scale. Open a stage to see what she does, day by day.',
    pointsAuBout: 'points by the end',
    moments: (n) => `${n} moments`,
    jour: (n) => `Day ${n}`,
  },
  mcp: {
    kicker: 'Automations',
    titre: 'The end goal: agents working on every front',
    texte:
      'By the end of the path your tools are plugged in and your chains run without you. An MCP server is the socket: it gives the assistant access to one tool, and only what you allow.',
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
    titre: 'A method shaped in the training room',
    chapeau: (note, retours) =>
      `Three years of small-group workshops at La Poste, Pierre Fabre, La Redoute, E.Leclerc and GL Events. The public score is ${note} out of 10, across ${retours} reviews.`,
    casTitre: 'Three sessions, three outcomes',
    domainesTitre: 'Fields covered',
    visiteTitre: 'The space you open every morning.',
    tousLesAvis: 'All reviews',
    profil: {
      kicker: 'Her account on day 30',
      nom: 'Clara Martin',
      points: 'points',
      serie: (n) => `${n} days in a row`,
      trophees: (obtenus, total) => `${obtenus} trophies out of ${total}`,
      faits: {
        depots: 'exercises submitted',
        quiz: 'quizzes passed',
        relectures: 'exercises reviewed and annotated',
        session: 'fifteen-minute session, earned on points',
      },
      pied: 'Points come from what you do, not from what you read.',
    },
  },
  diagnostic: {
    kicker: 'Where to start',
    titre: 'Four questions, and you know which modules are yours.',
    chapeau:
      'Everyone gets the same lessons. What changes is where you start, and what can wait.',
    numero: (n, total) => `Question ${n} of ${total}`,
    plusieurs: 'Several answers possible',
    continuer: 'Continue',
    revenir: 'Back',
    votreProfil: 'Your profile',
    parLa: 'You start with',
    formule: 'The plan that fits',
    duree: (jours = 60) => `for ${jours} days`,
    avecCode: (c) => `with code ${c}`,
    offreMethode: 'The method',
    offreAvancee: 'The advanced method',
    cta: 'Start there',
    refaire: 'Take it again',
    outilUn: (o) => `Your tool path will be the ${o} one.`,
    outilPlusieurs: (l) =>
      `You have ${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}: the course opens one of them, and you pick which on arrival.`,
    compteDepart: (total) => `The ${total} modules of both programmes`,
    compteFini: (retenus, total, coeur, duree) =>
      `${retenus} of ${total} modules concern you · you start with ${coeur}, that is ${duree}`,
    paliers: { free: 'free', essentials: 'method', pro: 'automations' },
    legendeMethode: 'The method',
    legendeAuto: 'The automations',
  },
  tarifs: {
    kicker: 'What it costs',
    titre: 'Pricing',
    chapeau: (jours, garantie) =>
      `The AI assistant is included in all three, and access runs for ${jours} days whichever you take. You have ${garantie.heures} hours to ask for a full refund, as long as less than ${garantie.seuilPct}% of the course has been opened.`,
    duree: (jours = 60) => `for ${jours} days`,
    methode: 'The method',
    methodeSous: 'The method and your tool',
    auto: 'Automations',
    autoSous: 'Agents, chains and MCP',
    lot: 'Both',
    lotSous: 'The method + Automations',
    lotAuLieuDe: (plein) => `instead of ${plein}`,
    lotEconomie: (montant) => `You save ${montant}`,
    lotCta: 'Take both',
    commencer: 'Get started',
    licences: 'Licences',
    places: (n) => `${n} licences`,
    parPlace: 'per licence',
    total: (montant, places) => `${montant} in total for ${places} licences`,
    remiseEquipe: (seuil) => `discount from ${seuil} licences`,
    plusDeLicences: 'More than ten licences',
    devisTitre: 'We would rather talk it through with you.',
    devisTexte:
      'Beyond ten licences the price is built with you: the seats, the pace, the support your team needs. Tell us what you are looking for, Paul answers within one working day.',
    survol: 'Hover a line to see the screen',
    survolTactile: 'Touch a line to see the screen',
    rappel: (devise) =>
      devise === 'USD'
        ? 'The AI assistant is included in all three. Prices are in US dollars, and the amount shown is the amount you pay.'
        : `The AI assistant is included in all three. Prices are in ${devise === 'GBP' ? 'pounds sterling' : 'euros'}, all taxes included.`,
    rassure: (garantie) => [
      {
        titre: `${garantie.heures} hours to change your mind`,
        detail: `Full refund as long as less than ${garantie.seuilPct}% of the course has been opened.`,
      },
      {
        titre: 'Invoice in your company name',
        detail: 'Issued automatically after payment, VAT included.',
      },
      {
        titre: 'Pay by card',
        detail: 'Secure page by Revolut. Your access opens within the minute.',
      },
    ],
    rassureAutre: 'Need a bank transfer, a purchase order, or an invoice before you pay?',
    rassureAutreLien: 'Write to me',
    cgv: 'Terms of sale',
    cgvLien: 'https://academy.mydigipal.com/terms',
    cgvAvant: 'Your purchase is governed by our',

    gratuitTag: 'Try first',
    gratuitTitre: (lecons, heures) => `${lecons} free lessons, for ${heures} hours`,
    gratuitTexte: (heures) =>
      `Full modules, no card needed: getting started, then writing, translating and summarising. ${heures} hours to judge for yourself before paying.`,
    gratuitCta: 'Open free access',
    gratuitCourt: (lecons, heures) => `${lecons} lessons, ${heures}h trial`,

    codePastille: (pct) => `−${pct}%`,
    codeNom: (code) => `code ${code}`,
    codeBandeau: (pct, portee, fin) =>
      `Your code is active: ${pct}% ${portee}${fin ? `, until ${fin}` : ''}. It applies on its own at checkout.`,
    codePortee: {
      deux: 'on every plan',
      methode: 'on The method',
      avancee: 'on Automations',
      lot: 'on both programmes together',
    },
    economie: (montant, places) => (places > 1 ? `You save ${montant} in total` : `You save ${montant}`),
  },
  // The talking films (25/09/2026): Paul walking through the product, in English.
  films: {
    lire: 'Play the video',
    voir: 'Watch',
    // In the hero frame, instead of the dashboard capture (25/09/2026).
    hero: {
      id: 'tour-espace-en',
      titre: 'A tour of the learner space',
      legende: 'Paul walks through the space you open after buying: the course, the tools, the use cases and your progress.',
    },
    produit: {
      id: 'interieur-lecon-en',
      titre: 'Inside a lesson',
      legende:
        'Paul opens a lesson: the audio, the content blocks, the exercises, saving a prompt to your library, and the trophies.',
    },
    mcp: {
      id: 'automatisations-mcp-en',
      titre: 'Automations and MCP, on a real setup',
      legende:
        'The Automations path, then the MCP server Paul runs his own agency on, with every tool it plugs into.',
    },
  },
};

export function copyV2(locale: Locale) {
  return locale === 'fr' ? FR : EN;
}
