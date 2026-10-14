/**
 * Les mots des participants, pour la page AI Training (14/10/2026).
 *
 * Source : l'export des 497 retours de formation (`mydigipal-academy/atelier/retours/`),
 * `ligne` = l'index de la ligne dans l'export, pour retrouver chaque citation. Chaque texte est
 * cité MOT POUR MOT dans sa langue d'origine (`langue`) ; l'autre langue est une traduction.
 * Seules l'orthographe évidente et la ponctuation ont été touchées, jamais un mot.
 *
 * Le choix : des notes de 9 ou 10, des retours qui parlent de la SÉANCE (l'animation, la
 * pratique, ce qu'on en fait le lendemain), la finance en tête parce que c'est le service de
 * notre premier lecteur. L'auteur s'écrit prénom + initiale ; prénom seul quand l'export ne
 * donne pas le nom. Jamais On Train, jamais Chanel ; Kering reste sur cette page (Paul).
 */

export interface AvisFormation {
  societe: string;
  logo: string;
  session: { fr: string; en: string };
  texte: { fr: string; en: string };
  langue: 'fr' | 'en';
  auteur: string;
  note: number;
  ligne: number;
}

const L = '/images/Training Logo/';

/** La citation mise en avant, puis les autres. */
export const AVIS: AvisFormation[] = [
  {
    societe: 'Kering', logo: `${L}Kering.svg`, ligne: 139, note: 10, langue: 'en', auteur: 'Charlene K.',
    session: { fr: 'Gen AI for Finance, États-Unis', en: 'Gen AI for Finance, US' },
    texte: {
      en: "The trainer's energy was great, and it really showed his passion for the topic. It was a very useful course. I can't wait to implement what I've learned on the job.",
      fr: "L'énergie du formateur était formidable, on voyait vraiment sa passion pour le sujet. Une formation très utile. J'ai hâte d'appliquer ce que j'ai appris dans mon travail.",
    },
  },
  {
    societe: 'Pierre Fabre', logo: `${L}Pierre fabre.avif`, ligne: 43, note: 10, langue: 'fr', auteur: 'Jonas I.',
    session: { fr: 'IA pour les directions métier', en: 'AI for business leaders' },
    texte: {
      fr: "L'équilibre entre théorie et pratique était parfait. L'expérience de Paul au quotidien est parfaite pour redescendre des cas pratiques concrets pour notre utilisation au quotidien. 20/20 !",
      en: "The balance between theory and practice was perfect. Paul's day-to-day experience is perfect for bringing things down to concrete cases for our daily use. 20/20!",
    },
  },
  {
    societe: 'Kering', logo: `${L}Kering.svg`, ligne: 318, note: 10, langue: 'en', auteur: 'Lucie L.',
    session: { fr: 'Gen AI for Finance, Amériques', en: 'Gen AI for Finance, Americas' },
    texte: {
      en: 'Very good training, 3 hours that seemed less, very interactive, a lot of interesting concepts shared, very happy to attend this training.',
      fr: "Très bonne formation, trois heures qui ont paru plus courtes, très interactive, beaucoup de notions intéressantes, très contente d'y avoir participé.",
    },
  },
  {
    societe: 'GL Events', logo: `${L}GL events.png`, ligne: 224, note: 10, langue: 'fr', auteur: 'Souhire E.',
    session: { fr: 'Webinaire IA et management', en: 'AI and management webinar' },
    texte: {
      fr: "J'ai adoré cette formation. Tant sur le fond que la forme. C'est une formation dont je sors immédiatement avec des pratiques concrètes, utilisables dans mon métier et que je souhaite partager avec mon équipe.",
      en: 'I loved this training, the substance as much as the form. I come out of it straight away with concrete practices I can use in my job, and that I want to share with my team.',
    },
  },
  {
    societe: 'Datawords', logo: `${L}Datawords.png`, ligne: 345, note: 9, langue: 'en', auteur: 'Grigori K.',
    session: { fr: 'Atelier IA, à distance', en: 'AI workshop, remote' },
    texte: {
      en: 'The training is very smooth, even remotely. I appreciate the interactive aspect and the fact that Paul adapts to all levels within the group.',
      fr: "La formation se déroule très bien, même à distance. J'apprécie le côté interactif, et le fait que Paul s'adapte à tous les niveaux du groupe.",
    },
  },
  {
    societe: 'Kering', logo: `${L}Kering.svg`, ligne: 305, note: 10, langue: 'en', auteur: 'Noemi G.',
    session: { fr: 'Gen AI for Finance, Europe', en: 'Gen AI for Finance, EMEA' },
    texte: {
      en: 'It was very interesting and gave us reassurance that it is safe and worth it to use Microsoft Copilot.',
      fr: "C'était très intéressant, et rassurant : Microsoft Copilot est sûr, et il vaut la peine de s'en servir.",
    },
  },
  {
    societe: 'GL Events', logo: `${L}GL events.png`, ligne: 192, note: 10, langue: 'fr', auteur: 'Bérengère B.',
    session: { fr: 'Webinaire IA et management', en: 'AI and management webinar' },
    texte: {
      fr: "J'utilise tous les jours Copilot, bêtement je ne pensais pas apprendre autant d'astuces lors de ce webinar, heureusement que je l'ai suivi ! Formateur très pédagogue, adapté, à l'écoute, 1000 mercis et félicitations.",
      en: "I use Copilot every day, and I naively didn't expect to learn so many tips in this webinar. Good thing I attended! A very good teacher, tailored, attentive. A thousand thanks, and congratulations.",
    },
  },
  {
    societe: 'Datawords', logo: `${L}Datawords.png`, ligne: 182, note: 9, langue: 'fr', auteur: 'Marie',
    session: { fr: 'Atelier IA, e-réputation et SEO', en: 'AI workshop, e-reputation and SEO' },
    texte: {
      fr: "Agréablement surprise par le contenu de la formation, avec des conseils pratiques et des exemples appliqués à nos cas d'usage. Le formateur s'est également adapté à nos retours et à nos questions pour orienter la formation.",
      en: 'Pleasantly surprised by the content, with practical advice and examples applied to our own use cases. The trainer also adapted to our feedback and questions to steer the session.',
    },
  },
  {
    societe: 'Kering', logo: `${L}Kering.svg`, ligne: 312, note: 10, langue: 'en', auteur: 'Makiko K.',
    session: { fr: 'Gen AI for Finance, Asie-Pacifique', en: 'Gen AI for Finance, APAC' },
    texte: {
      en: 'Finely curated, practical, and immediately applicable.',
      fr: 'Soigneusement préparée, pratique, et applicable tout de suite.',
    },
  },
  {
    societe: 'La Redoute', logo: `${L}La Redoute.svg`, ligne: 494, note: 10, langue: 'en', auteur: 'Dylan G.',
    session: { fr: 'Acculturation IA, Bradford', en: 'AI onboarding, Bradford' },
    texte: {
      en: 'I was a complete beginner but will now be able to confidently apply what I have learned.',
      fr: "J'étais complètement débutant, et je vais maintenant pouvoir appliquer ce que j'ai appris en toute confiance.",
    },
  },
];

/**
 * Ce que les participants disent qu'ils feront dès le lendemain : la colonne « Compétences
 * activables au quotidien » de l'export, en version courte. Le sens est le leur.
 */
export const TACHES: { texte: { fr: string; en: string }; ou: string; ligne: number }[] = [
  { ligne: 308, ou: 'Kering, Finance', texte: { fr: 'Réduire le temps passé à retraiter des données Excel', en: 'Cut the time spent crunching Excel data' } },
  { ligne: 310, ou: 'Kering, Finance', texte: { fr: 'Rédiger le rapport narratif à partir des données existantes', en: 'Draft the narrative report from the existing data' } },
  { ligne: 286, ou: 'Balenciaga, Finance', texte: { fr: 'Rédiger un e-mail officiel pour une analyse financière', en: 'Draft an official email for a finance analysis' } },
  { ligne: 323, ou: 'La Poste', texte: { fr: 'Analyser les réponses des prestataires, rédiger des mails complexes', en: 'Analyse supplier responses, write complex emails' } },
  { ligne: 326, ou: 'La Poste', texte: { fr: "Préparer un cahier des charges et chercher des prestataires avant un appel d'offres", en: 'Prepare specifications and research suppliers before a tender' } },
  { ligne: 488, ou: 'La Redoute, Bradford', texte: { fr: 'Produire des présentations, résumer des données, répondre aux demandes répétitives', en: 'Produce presentations, summarise data, answer repetitive requests' } },
  { ligne: 491, ou: 'La Redoute, Bradford', texte: { fr: 'Utiliser Copilot directement dans Excel et dans Teams', en: 'Use Copilot directly in Excel and Teams' } },
  { ligne: 347, ou: 'Datawords', texte: { fr: 'Créer un assistant pour mes demandes de tous les jours', en: 'Build an assistant for my everyday requests' } },
  { ligne: 350, ou: 'Datawords', texte: { fr: 'Automatiser nos processus internes avec des prompts avancés', en: 'Automate our internal processes with advanced prompts' } },
];
