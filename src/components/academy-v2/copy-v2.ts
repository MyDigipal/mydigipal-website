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
      'Le programme de la formation IA MyDigipal, module par module : la méthode de prompting, le parcours de votre outil, les automatisations. Deux modules offerts.',
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
    exTrajet: 'Trente jours dans un compte, jour après jour, jusqu’à l’attestation.',
    exTarifs: (prix: string) =>
      `${prix} pour 30 jours, l’assistant compris. Les automatisations en complément, et soixante jours d’accès.`,
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
    // ⚠️ « Trente jours, deux quinzaines, un compte qui se remplit » parlait en
    // jargon interne : « quinzaine » est notre découpage, pas le sien, et « un
    // compte qui se remplit » ne dit pas ce qu'on y gagne (Paul, 07/09).
    ruban: 'Trente jours, vus de l’intérieur d’un compte.',
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
    titre: 'Quatre questions, et le parcours se met dans votre ordre.',
    chapeau:
      'Tout le monde reçoit les mêmes leçons. Ce qui change, c’est par quoi on commence, et ce qu’on peut garder pour plus tard.',
    numero: (n: number, total: number) => `Question ${n} sur ${total}`,
    plusieurs: 'Plusieurs réponses possibles',
    continuer: 'Continuer',
    revenir: 'Revenir',
    votreProfil: 'Votre profil',
    parLa: 'Vous commencez par',
    formule: 'La formule qui vous va',
    duree: (jours = 30) => `pour ${jours} jours`,
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
    kicker: 'Les tarifs',
    titre: (prix: string) => `À partir de ${prix}`,
    chapeau: (hausse: string) =>
      `L’assistant IA est compris dans les deux formules. Au 1er octobre, le prix passe à ${hausse}.`,
    duree: (jours = 30) => `pour ${jours} jours`,
    methode: 'La méthode',
    methodeSous: 'Le parcours complet',
    auto: 'La méthode avancée',
    autoSous: 'Avec les automatisations',
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
    rappel: () =>
      'L’assistant IA est compris dans les deux formules. Les prix sont en euros, toutes taxes comprises.',
    gratuitTag: 'Essayer d’abord',
    gratuitTitre: (lecons: number) => `${lecons} leçons offertes, pendant 48 heures`,
    gratuitTexte:
      'Deux modules entiers, sans carte bancaire : la prise en main, puis écrire, traduire et résumer. Quarante-huit heures pour juger sur pièce avant de payer.',
    gratuitCta: 'Ouvrir l’accès gratuit',
    // ⚠️ La durée se dit PARTOUT où l'accès gratuit est proposé : le hero,
    // le retournement, le bouton flottant et la grille. Trois de ces quatre
    // endroits l'annonçaient sans durée (relevé le 07/09).
    gratuitCourt: (lecons: number) => `${lecons} leçons, 48 h d’essai`,

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
    codePortee: { deux: 'sur les deux formules', methode: 'sur la méthode', avancee: 'sur la méthode avancée' },
    economie: (montant: string, places: number) =>
      places > 1 ? `Vous économisez ${montant} au total` : `Vous économisez ${montant}`,
  },
};

const EN: typeof FR = {
  meta: {
    titre: 'Online AI training course: the full programme',
    description:
      'The MyDigipal AI course programme, module by module: the prompting method, the path for your own tool, automations and MCP servers. Two free modules.',
  },
  barre: {
    programme: 'The programme',
    academie: 'The Academy',
    trajet: 'The path',
    tarifs: 'Pricing',
    cta: 'Get started',
    exProgramme: (lecons, modules, heures) =>
      `${lecons} lessons, ${modules} modules, ${heures}. What you learn, and what each module makes you produce.`,
    exTrajet: 'Thirty days inside an account, day by day, up to the certificate.',
    exTarifs: (prix) => `${prix} for 30 days, assistant included. Automations as an add-on, with sixty days of access.`,
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
    ruban: 'Thirty days, seen from inside an account.',
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
    titre: 'Four questions, and the course falls into your order.',
    chapeau:
      'Everyone gets the same lessons. What changes is where you start, and what can wait.',
    numero: (n, total) => `Question ${n} of ${total}`,
    plusieurs: 'Several answers possible',
    continuer: 'Continue',
    revenir: 'Back',
    votreProfil: 'Your profile',
    parLa: 'You start with',
    formule: 'The plan that fits',
    duree: (jours = 30) => `for ${jours} days`,
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
    kicker: 'Pricing',
    titre: (prix) => `From ${prix}`,
    chapeau: (hausse) =>
      `The AI assistant is included in both. On 1 October, the price rises to ${hausse}.`,
    duree: (jours = 30) => `for ${jours} days`,
    methode: 'The method',
    methodeSous: 'The full path',
    auto: 'The advanced method',
    autoSous: 'With automations',
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
    rappel: () =>
      'The AI assistant is included in both. Prices are in euros, all taxes included.',
    gratuitTag: 'Try first',
    gratuitTitre: (lecons) => `${lecons} free lessons, for 48 hours`,
    gratuitTexte:
      'Two full modules, no card needed: getting started, then writing, translating and summarising. Forty-eight hours to judge for yourself before paying.',
    gratuitCta: 'Open free access',
    gratuitCourt: (lecons) => `${lecons} lessons, 48h trial`,

    codePastille: (pct) => `−${pct}%`,
    codeNom: (code) => `code ${code}`,
    codeBandeau: (pct, portee, fin) =>
      `Your code is active: ${pct}% ${portee}${fin ? `, until ${fin}` : ''}. It applies on its own at checkout.`,
    codePortee: { deux: 'on both plans', methode: 'on the method', avancee: 'on the advanced method' },
    economie: (montant, places) => (places > 1 ? `You save ${montant} in total` : `You save ${montant}`),
  },
};

export function copyV2(locale: Locale) {
  return locale === 'fr' ? FR : EN;
}
