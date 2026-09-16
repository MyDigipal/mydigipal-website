// ============================================================
// Le panneau « Une question ? » : ses textes, ses catégories et sa FAQ
// ============================================================
//
// Direction A, « Paul répond », retenue par Paul le 15/09/2026 dans
// `mydigipal-academy/labo/question-page-vente.html`.
//
// ⚠️ Aucun fait chiffré n'est écrit ici, comme dans `copy-v2.ts` : les prix, les
// leçons, les heures, la durée d'accès, la garantie, l'essai et les paliers
// d'équipe viennent du JSON de l'application et de la devise affichée. Une
// réponse de FAQ qui recopierait « 290 € » ou « 48 heures » serait fausse le
// jour où la grille bouge, et personne ne penserait à la relire.
//
// 16/09/2026, Paul : « on pourrait mettre des catégories de questions ». Les
// questions sont donc rangées en familles (`categoriesVente`), et le panneau
// ouvre sur ces familles plutôt que sur une liste de huit questions.

import { SYMBOLE, leconsComplement, leconsGratuit, leconsProgramme, prixDe, type Devise, type Jour30Data, type Locale } from '../academy/data';
import { formatPrice } from '../academy/offres';

export interface QuestionFaq {
  id: string;
  q: string;
  a: string;
}

export interface QuestionCategorie {
  id: string;
  titre: string;
  /** Les questions de la famille, dans l'ordre d'affichage. */
  questions: QuestionFaq[];
}

const FR = {
  bulle: 'Une question avant de choisir ? Je vous réponds moi-même.',
  signe: 'Paul',
  pastilleAria: 'Poser une question à Paul',
  masquer: 'Masquer',
  nom: 'Paul André',
  role: 'Fondateur de MyDigipal, répond lui-même',
  fermer: 'Fermer',
  dialogAria: 'Questions à Paul',
  accueil: 'Bonjour. Votre question est à propos de quoi ? Sinon, écrivez-la-moi directement en bas.',
  categoriesTitre: 'Votre question est à propos de quoi ?',
  poser: 'Poser ma question',
  ecrirePlaceholder: 'Écrivez votre question à Paul...',
  differente: 'Ma question est un peu différente',
  autres: 'Voir les autres questions',
  retourCategories: 'Revenir aux catégories',
  labelQuestion: 'Votre question',
  exempleQuestion: 'Par exemple : la formation couvre-t-elle Copilot dans Excel ?',
  labelEmail: 'Votre e-mail, pour la réponse',
  exempleEmail: 'vous@entreprise.com',
  envoyer: 'Envoyer à Paul',
  note: 'Paul répond lui-même. Votre adresse ne sert qu’à cette réponse.',
  retour: 'Revenir aux questions',
  envoyeTitre: 'C’est envoyé.',
  // La conversation en direct (15/09/2026) : si Paul est là, sa réponse s'affiche
  // dans le panneau ; sinon elle part à l'adresse saisie.
  envoyeTexte: (email: string) =>
    `Si Paul est disponible, sa réponse s’affiche ici dans quelques minutes. Sinon, il vous répond à ${email}.`,
  paulARepondu: 'Paul vous a répondu.',
  voirConversation: 'Voir la conversation',
  repondre: 'Votre message',
  // L'adresse ne se demande plus dans un champ (Paul, 16/09/2026) : Paul la
  // demande dans la conversation, et la personne répond comme à un message.
  demandeAdresse:
    'C’est parti chez moi. Si je ne suis pas disponible tout de suite, écrivez-moi votre adresse e-mail ici et je vous réponds dessus.',
  adresseNotee: (email: string) => `C’est noté : si je réponds après votre départ, ce sera à ${email}.`,
  envoyeTexteSansAdresse: 'Si Paul est disponible, sa réponse s’affiche ici dans quelques minutes.',
  barreMobile: 'Une question ? Écrivez-moi.',
  erreurQuestion: 'Écrivez votre question en quelques mots.',
  erreurEmail: 'Cette adresse e-mail ne semble pas complète.',
  erreurAdresseRequise: 'Écrivez votre adresse e-mail pour que Paul puisse vous répondre.',
  erreurEnvoi: 'L’envoi n’a pas abouti. Réessayez dans un instant.',
};

type Copie = typeof FR;

const EN: Copie = {
  bulle: 'A question before you choose? I answer personally.',
  signe: 'Paul',
  pastilleAria: 'Ask Paul a question',
  masquer: 'Hide',
  nom: 'Paul André',
  role: 'Founder of MyDigipal, answers himself',
  fermer: 'Close',
  dialogAria: 'Questions for Paul',
  accueil: 'Hello. What is your question about? If none of these fit, write to me below.',
  categoriesTitre: 'What is your question about?',
  poser: 'Ask my question',
  ecrirePlaceholder: 'Write your question to Paul...',
  differente: 'My question is a bit different',
  autres: 'See the other questions',
  retourCategories: 'Back to the topics',
  labelQuestion: 'Your question',
  exempleQuestion: 'For example: does the course cover Copilot in Excel?',
  labelEmail: 'Your email, for the reply',
  exempleEmail: 'you@company.com',
  envoyer: 'Send to Paul',
  note: 'Paul answers himself. Your address is only used for this reply.',
  retour: 'Back to the questions',
  envoyeTitre: 'Sent.',
  envoyeTexte: (email: string) =>
    `If Paul is available, his reply appears here within a few minutes. Otherwise he will reply to ${email}.`,
  paulARepondu: 'Paul has replied.',
  voirConversation: 'See the conversation',
  repondre: 'Your message',
  demandeAdresse:
    'That reached me. If I am not available right now, write your email address here and I will reply to it.',
  adresseNotee: (email: string) => `Noted: if I answer after you leave, it goes to ${email}.`,
  envoyeTexteSansAdresse: 'If Paul is available, his reply appears here within a few minutes.',
  barreMobile: 'A question? Write to me.',
  erreurQuestion: 'Write your question in a few words.',
  erreurEmail: 'This email address looks incomplete.',
  erreurAdresseRequise: 'Write your email address so Paul can reply.',
  erreurEnvoi: 'Sending failed. Please try again in a moment.',
};

export function questionCopy(locale: Locale): Copie {
  return locale === 'en' ? EN : FR;
}

/**
 * Les questions, dans l'ordre des hésitations : ce qu'il y a dedans, laquelle
 * prendre, le temps, l'assistant, les langues, l'essai, la garantie, la facture,
 * le financement (le CPF ne voulant rien dire hors de France), les équipes.
 *
 * Une réponse dont la donnée manque (un instantané de build ancien) retire la
 * phrase concernée plutôt que d'écrire un nombre de repli.
 */
export function faqVente(locale: Locale, d: Jour30Data, devise: Devise, modulesAuto: number): QuestionFaq[] {
  const fr = locale === 'fr';
  const prix = (minor: number) => `${formatPrice(minor, locale)} ${SYMBOLE[devise]}`;
  const programme = d.offres.find((o) => o.id === 'programme');
  const construire = d.offres.find((o) => o.id === 'construire');
  const pMethode = programme ? prixDe(programme, devise) : 0;
  const pAuto = construire ? prixDe(construire, devise) : 0;
  const pLot = d.lot?.prix?.[devise] ?? pMethode + pAuto;
  const pPlein = d.lot?.plein?.[devise] ?? pMethode + pAuto;
  const hMethode = d.faits.heuresProgramme ?? d.faits.heures;
  const hAuto = d.faits.heuresComplement;
  const jours = d.acces_jours;
  const g = d.garantie;
  const assistant = d.assistant_questions;
  const paliers = d.equipe?.paliers ?? [];
  const pct = (x: number) => `${Math.round(x * 100)}${fr ? ' %' : '%'}`;
  const listePaliers = paliers
    .map((p, i) =>
      fr
        ? i === 0
          ? `de ${pct(p.discount)} dès ${p.seats} licences`
          : `de ${pct(p.discount)} à ${p.seats}`
        : i === 0
          ? `by ${pct(p.discount)} from ${p.seats} licences`
          : `by ${pct(p.discount)} at ${p.seats}`,
    )
    .join(', ');
  const maxPlaces = paliers.length ? Math.max(...paliers.map((p) => p.seats)) : 0;

  if (fr) {
    return [
      {
        id: 'contenu',
        q: 'Qu’y a-t-il dans la formation ?',
        a: `Deux programmes. La méthode : ${leconsProgramme(d)} leçons, ${hMethode} de formation, pour maîtriser votre outil (ChatGPT, Claude, Gemini ou Copilot), avec un atelier, des quiz et ${d.faits.exercices} exercices sur vos propres dossiers. Les automatisations : ${leconsComplement(d)} leçons en ${modulesAuto} modules pour confier des tâches entières à l’IA, avec les agents, les serveurs MCP et des chaînes complètes montées pas à pas.`,
      },
      {
        id: 'formule',
        q: 'Quelle formule choisir ?',
        a: `La méthode (${prix(pMethode)}) si vous voulez tirer le meilleur de votre outil au quotidien. Les automatisations (${prix(pAuto)}) si vous pratiquez déjà l’IA toutes les semaines et voulez qu’elle travaille à votre place. Les deux se complètent : ${prix(pLot)} au lieu de ${prix(pPlein)}.`,
      },
      {
        id: 'temps',
        q: 'Combien de temps faut-il y consacrer ?',
        a: [
          hAuto
            ? `La méthode représente ${hMethode} de leçons, Les automatisations ${hAuto}, à suivre à votre rythme.`
            : `La méthode représente ${hMethode} de leçons, à suivre à votre rythme.`,
          jours ? `L’accès dure ${jours} jours quelle que soit la formule.` : '',
        ]
          .filter(Boolean)
          .join(' '),
      },
      {
        id: 'assistant',
        q: 'L’assistant IA est-il inclus ?',
        a: assistant
          ? `Oui. Il répond dans la plateforme à partir de vos propres leçons, jamais d’ailleurs : ${assistant.methode} questions par mois avec La méthode, ${assistant.automatisations} avec les deux programmes.`
          : 'Oui. Il répond dans la plateforme à partir de vos propres leçons, jamais d’ailleurs.',
      },
      {
        id: 'langues',
        q: 'En quelle langue est la formation ?',
        a: 'Chaque leçon existe en français et en anglais. On passe de l’une à l’autre en un clic, sans perdre sa progression : un collègue à l’étranger suit exactement le même parcours.',
      },
      {
        id: 'essai',
        q: 'Puis-je essayer avant de payer ?',
        a: `Oui. L’accès gratuit ouvre ${leconsGratuit(d)} leçons${d.essai_heures ? ` pendant ${d.essai_heures} heures` : ''}, sans carte bancaire.`,
      },
      {
        id: 'garantie',
        q: 'Et si la formation ne me convient pas ?',
        a: g
          ? `Pendant les ${g.heures} heures qui suivent l’achat, vous pouvez demander un remboursement intégral, tant que moins de ${g.seuil_pct} % du parcours a été consulté.`
          : 'Une garantie de remboursement est prévue à l’article 6 des conditions de vente.',
      },
      {
        id: 'facture',
        q: 'Puis-je avoir une facture pour mon entreprise ?',
        a: 'Oui. Indiquez votre société au paiement : la facture, déjà acquittée, est jointe au courriel d’accès. Pour une entreprise de l’Union européenne, un numéro de TVA valide, vérifié au paiement, retire la TVA.',
      },
      {
        id: 'cpf',
        q: 'Est-ce finançable par le CPF ?',
        a: 'Non. La formation n’ouvre pas de droit au CPF ni à un financement par un OPCO. La facture peut en revanche être établie au nom de votre société.',
      },
      {
        id: 'equipe',
        q: 'Et pour une équipe ?',
        a: listePaliers
          ? `Le prix par licence baisse ${listePaliers}. Au-delà de ${maxPlaces} licences, Paul vous fait une proposition.`
          : 'Le prix par licence baisse avec le nombre de licences, et Paul fait une proposition aux équipes plus grandes.',
      },
    ];
  }

  return [
    {
      id: 'contenu',
      q: 'What is in the course?',
      a: `Two programmes. The method: ${leconsProgramme(d)} lessons, ${hMethode} of training, to master your tool (ChatGPT, Claude, Gemini or Copilot), with a workshop, quizzes and ${d.faits.exercices} exercises on your own files. Automations: ${leconsComplement(d)} lessons in ${modulesAuto} modules to hand whole tasks over to AI, with agents, MCP servers and complete chains built step by step.`,
    },
    {
      id: 'formule',
      q: 'Which plan should I choose?',
      a: `The method (${prix(pMethode)}) if you want to get the most out of your tool every day. Automations (${prix(pAuto)}) if you already use AI every week and want it to do the work for you. The two go together: ${prix(pLot)} instead of ${prix(pPlein)}.`,
    },
    {
      id: 'temps',
      q: 'How much time does it take?',
      a: [
        hAuto
          ? `The method is ${hMethode} of lessons and Automations ${hAuto}, at your own pace.`
          : `The method is ${hMethode} of lessons, at your own pace.`,
        jours ? `Access runs for ${jours} days whichever plan you take.` : '',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      id: 'assistant',
      q: 'Is the AI assistant included?',
      a: assistant
        ? `Yes. It answers inside the platform, from your own lessons and nothing else: ${assistant.methode} questions a month with The method, ${assistant.automatisations} with both programmes.`
        : 'Yes. It answers inside the platform, from your own lessons and nothing else.',
    },
    {
      id: 'langues',
      q: 'Which languages is it in?',
      a: 'Every lesson exists in English and in French. You switch in one click and keep your progress, so colleagues abroad follow exactly the same path.',
    },
    {
      id: 'essai',
      q: 'Can I try it before paying?',
      a: `Yes. Free access opens ${leconsGratuit(d)} lessons${d.essai_heures ? ` for ${d.essai_heures} hours` : ''}, with no card needed.`,
    },
    {
      id: 'garantie',
      q: 'What if the course is not right for me?',
      a: g
        ? `For ${g.heures} hours after purchase you can ask for a full refund, as long as less than ${g.seuil_pct}% of the course has been opened.`
        : 'A refund guarantee is set out in article 6 of the terms of sale.',
    },
    {
      id: 'facture',
      q: 'Can I get an invoice for my company?',
      a: 'Yes. Enter your company at checkout: the invoice, already marked as paid, is attached to your access email. For a business in the European Union, a valid VAT number, checked at payment, removes the VAT.',
    },
    {
      id: 'equipe',
      q: 'What about a team?',
      a: listePaliers
        ? `The price per licence goes down ${listePaliers}. Beyond ${maxPlaces} licences, Paul puts together a proposal.`
        : 'The price per licence goes down with the number of licences, and Paul puts together a proposal for larger teams.',
    },
  ];
}

/** Les familles de questions, dans l'ordre où l'on hésite. */
const FAMILLES: { id: string; fr: string; en: string; ids: string[] }[] = [
  { id: 'programme', fr: 'Ce qu’il y a dans la formation', en: 'What is in the course', ids: ['contenu', 'temps'] },
  { id: 'plateforme', fr: 'La plateforme et l’assistant IA', en: 'The platform and the AI assistant', ids: ['assistant', 'langues'] },
  { id: 'prix', fr: 'Le prix, la facture, les équipes', en: 'Price, invoice, teams', ids: ['formule', 'facture', 'cpf', 'equipe'] },
  { id: 'avant', fr: 'Essayer, l’accès et la garantie', en: 'Trying it, access and guarantee', ids: ['essai', 'garantie'] },
];

/**
 * Les questions rangées par famille (Paul, 16/09/2026). Une famille dont aucune
 * question n'existe dans la langue affichée disparaît, et toute question oubliée
 * dans `FAMILLES` est rattachée à la dernière : rien ne se perd en silence.
 */
export function categoriesVente(locale: Locale, faq: QuestionFaq[]): QuestionCategorie[] {
  const parId = new Map(faq.map((q) => [q.id, q]));
  const rangees = new Set<string>();
  const familles = FAMILLES.map((f) => {
    const questions = f.ids
      .map((id) => {
        const q = parId.get(id);
        if (q) rangees.add(id);
        return q;
      })
      .filter((q): q is QuestionFaq => !!q);
    return { id: f.id, titre: locale === 'en' ? f.en : f.fr, questions };
  }).filter((f) => f.questions.length > 0);

  const oubliees = faq.filter((q) => !rangees.has(q.id));
  if (oubliees.length && familles.length) familles[familles.length - 1].questions.push(...oubliees);
  return familles;
}
