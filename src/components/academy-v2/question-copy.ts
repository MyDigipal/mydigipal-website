// ============================================================
// Le panneau « Une question ? » : ses textes et sa FAQ
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

import { SYMBOLE, leconsComplement, leconsGratuit, leconsProgramme, prixDe, type Devise, type Jour30Data, type Locale } from '../academy/data';
import { formatPrice } from '../academy/offres';

export interface QuestionFaq {
  id: string;
  q: string;
  a: string;
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
  accueil: 'Bonjour. Voici les questions qu’on me pose le plus. S’il manque la vôtre, écrivez-moi.',
  poser: 'Poser ma question',
  differente: 'Ma question est un peu différente',
  autres: 'Voir les autres questions',
  labelQuestion: 'Votre question',
  exempleQuestion: 'Par exemple : la formation couvre-t-elle Copilot dans Excel ?',
  labelEmail: 'Votre e-mail, pour la réponse',
  exempleEmail: 'vous@entreprise.com',
  envoyer: 'Envoyer à Paul',
  note: 'Paul répond lui-même, par e-mail. Votre adresse ne sert qu’à cette réponse.',
  retour: 'Revenir aux questions',
  envoyeTitre: 'C’est envoyé.',
  envoyeTexte: (email: string) => `Paul vous répond à ${email}. Vous pouvez continuer à lire la page en attendant.`,
  erreurQuestion: 'Écrivez votre question en quelques mots.',
  erreurEmail: 'Cette adresse e-mail ne semble pas complète.',
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
  accueil: 'Hello. Here are the questions I get most often. If yours is not here, write to me.',
  poser: 'Ask my question',
  differente: 'My question is a bit different',
  autres: 'See the other questions',
  labelQuestion: 'Your question',
  exempleQuestion: 'For example: does the course cover Copilot in Excel?',
  labelEmail: 'Your email, for the reply',
  exempleEmail: 'you@company.com',
  envoyer: 'Send to Paul',
  note: 'Paul answers himself, by email. Your address is only used for this reply.',
  retour: 'Back to the questions',
  envoyeTitre: 'Sent.',
  envoyeTexte: (email: string) => `Paul will reply to ${email}. Feel free to keep reading the page in the meantime.`,
  erreurQuestion: 'Write your question in a few words.',
  erreurEmail: 'This email address looks incomplete.',
  erreurEnvoi: 'Sending failed. Please try again in a moment.',
};

export function questionCopy(locale: Locale): Copie {
  return locale === 'en' ? EN : FR;
}

/**
 * Les questions, dans l'ordre des hésitations : ce qu'il y a dedans, laquelle
 * prendre, le temps, l'essai, la garantie, la facture, le financement (ou la
 * langue en anglais, le CPF ne voulant rien dire hors de France), les équipes.
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
  const paliers = d.equipe?.paliers ?? [];
  const pct = (x: number) => `${Math.round(x * 100)}${fr ? ' %' : '%'}`;
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
      id: 'langues',
      q: 'Which languages is it in?',
      a: 'Every lesson exists in English and in French. You switch in one click and keep your progress, so colleagues abroad follow exactly the same path.',
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
