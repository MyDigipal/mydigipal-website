// ============================================================
// L'assistant du site : ses textes, en français et en anglais
// ============================================================
//
// Décision de Paul du 22/09/2026 : un assistant SANS modèle (« on veut un truc
// bateau »). Tout ce qu'il dit est écrit ici, et tout ce qui sort du script
// (une question libre) part à Paul, qui entre dans la conversation depuis
// Google Chat. Les questions sont celles du mode « Aidez-moi à choisir » du
// calculateur : un seul assistant sur le site, pas deux.
//
// Ce que Paul lit dans Google Chat reste en français quelle que soit la langue
// du visiteur : les libellés envoyés au serveur viennent toujours de `fr`.

import type { Lang } from '../calculator-v6/engine';

export const PHOTO = '/images/team/Team_Paul_Andre.webp';
export const BOOKING_URL = 'https://calendar.app.google/ofYHfRHbFoMpVxf79';

/** Le calculateur qui reçoit un plan par l'ancre `#plan=`. */
export const cheminCalculateur = (lang: Lang) => `/${lang}/calculator`;

export type Champ = 'industry' | 'goals' | 'monthlyBudget';

/** Les trois questions, dans l'ordre. Mêmes intitulés que le calculateur. */
export const QUESTIONS: Record<Champ, { fr: string; en: string }> = {
  industry: { fr: 'Votre secteur ?', en: 'Your industry?' },
  goals: { fr: 'Votre objectif principal ?', en: 'Your main goal?' },
  monthlyBudget: { fr: 'Votre budget mensuel, média compris ?', en: 'Your monthly budget, media included?' },
};

const FR = {
  nom: 'MyDigipal',
  sousTitre: 'Paul peut vous rejoindre à tout moment',
  ouvrir: 'Ouvrir la conversation avec MyDigipal',
  fermer: 'Fermer',
  invite: 'Une question ? Je vous aide à choisir.',
  paulARepondu: 'Paul vous a répondu',
  assistant: 'Assistant',
  paul: 'Paul',
  vous: 'Vous',
  accueil: 'Bonjour. Je vous aide à choisir en trois questions, avec un plan chiffré à la fin. Ou posez directement votre question à Paul.',
  // Ce que l'assistant dit selon la page (23/09/2026). Paul : « le choix de base sur la page
  // d'accueil est quand même assez basique, on pourrait vachement personnaliser. »
  accueilHome: 'Bonjour. Dites-moi ce que vous cherchez : je vous réponds tout de suite, et je peux chiffrer un plan en deux questions.',
  accueilPage: (titre: string, phrase?: string) => `Vous regardez ${titre}.${phrase ? ` ${phrase.replace(/[.\s]+$/, '')}.` : ''} Qu’est-ce que je vous dis en premier ?`,
  accueilCas: (client: string, resultat?: string) => `Vous regardez ce que nous avons fait pour ${client}${resultat ? ` : ${resultat}` : ''}.`,
  accueilArticle: (titre: string) => `Vous lisez « ${titre} ». Je peux vous dire ce que ça donnerait chez vous.`,
  accueilAuto: 'Vous êtes sur nos offres automobile. Je pars donc de l’automobile pour la suite.',
  accueilContact: 'Une question avant d’écrire ? Paul la lit en direct.',
  butLeads: 'Plus de demandes entrantes',
  butVentes: 'Vendre plus en ligne',
  butVisible: 'Être visible sur Google et dans les IA',
  butFormer: 'Former mon équipe à l’IA',
  combien: 'Combien ça coûte ?',
  comprend: 'Ce que ça comprend',
  resultats: 'Ce que ça a donné',
  chiffrer: 'Chiffrer mon cas',
  pareil: 'Faire pareil chez nous',
  lireCas: 'Lire l’étude de cas',
  voirService: (titre: string) => `Voir ${titre}`,
  prixGestion: (fee: string, seuil: string, pct: number) => `La gestion démarre à ${fee}/mois jusqu’à ${seuil} de budget publicitaire par mois, puis ${pct}\u00a0% du budget. Le budget publicitaire, lui, est payé directement aux plateformes : il ne nous revient pas.`,
  prixMensuel: (montant: string) => `L’accompagnement démarre à ${montant}/mois.`,
  prixUneFois: (montant: string) => `La mise en place démarre à ${montant}, une seule fois.`,
  prixInconnu: 'Le prix dépend de ce que vous choisissez. Deux questions, et je vous donne un chiffre.',
  prixSuite: 'Pour un chiffre sur votre cas, deux questions suffisent.',
  casChiffre: (client: string, resultat: string) => `Chez ${client} : ${resultat}.`,
  accueilService: (service: string) => `Vous regardez ${service}. En trois questions, je vous propose un plan chiffré. On y va ?`,
  accueilDevis: 'Une question sur ce devis ? Écrivez-la ici, Paul la lit en direct.',
  guideIntro: 'Trois questions, et je vous propose un plan chiffré.',
  go: 'Oui, allons-y',
  aide: 'M’aider à choisir',
  poser: 'Poser une question',
  calculateur: 'Ouvrir le calculateur',
  libre: 'Écrivez-la ci-dessous, Paul la lit en direct.',
  suggestions: ['Peut-on commencer plus petit ?', 'Comment se passe le démarrage ?', 'Qu’est-ce qui est compris dans le prix ?'],
  propIntro: 'Voici ce que je vous propose. Tout reste modifiable dans le calculateur.',
  honoraires: 'Nos honoraires',
  miseEnPlace: 'Mise en place',
  media: 'Budget média',
  parMois: '/mois',
  uneFois: ' une fois',
  aDefinir: 'À définir ensemble',
  voirDevis: 'Voir le devis détaillé',
  parlerPaul: 'En parler avec Paul',
  reserver: 'Réserver un appel de 30 min',
  reserverCourt: 'Réserver 30 min',
  recommencer: 'Recommencer',
  placeholder: 'Écrire à Paul…',
  envoyer: 'Envoyer',
  apresMessage: 'C’est parti chez Paul. Il vous répond ici même. Si vous devez partir, écrivez votre e-mail : sa réponse vous suivra.',
  emailMerci: 'Merci. Si vous n’êtes plus là quand Paul répond, sa réponse partira à cette adresse.',
  erreur: 'Le message n’est pas parti. Réessayez dans un instant.',
  paulRejoint: 'Paul a rejoint la conversation',
  devisTitre: 'Une question sur ce devis ?',
  devisTexte: 'Paul peut le regarder avec vous, ici, en direct.',
  devisPoser: 'Poser ma question',
  budgets: (m: (v: number) => string): Record<string, string> => ({
    'budget-1500': `Moins de ${m(2000)}`,
    'budget-3500': `${m(2000)} à ${m(5000)}`,
    'budget-7500': `${m(5000)} à ${m(10000)}`,
    'budget-15000': `Plus de ${m(10000)}`,
  }),
};

type Copy = typeof FR;

const EN: Copy = {
  nom: 'MyDigipal',
  sousTitre: 'Paul can join you at any time',
  ouvrir: 'Open the chat with MyDigipal',
  fermer: 'Close',
  invite: 'A question? I can help you choose.',
  paulARepondu: 'Paul has replied',
  assistant: 'Assistant',
  paul: 'Paul',
  vous: 'You',
  accueil: 'Hello. I can help you choose in three questions, with a costed plan at the end. Or ask Paul your question directly.',
  accueilHome: 'Hello. Tell me what you are looking for: I answer right away, and I can price a plan in two questions.',
  accueilPage: (titre: string, phrase?: string) => `You are looking at ${titre}.${phrase ? ` ${phrase.replace(/[.\s]+$/, '')}.` : ''} What should I start with?`,
  accueilCas: (client: string, resultat?: string) => `You are looking at what we did for ${client}${resultat ? `: ${resultat}` : ''}.`,
  accueilArticle: (titre: string) => `You are reading “${titre}”. I can tell you what it would give at your place.`,
  accueilAuto: 'You are on our automotive offers, so I will start from automotive.',
  accueilContact: 'A question before you write? Paul reads it live.',
  butLeads: 'More inbound requests',
  butVentes: 'Sell more online',
  butVisible: 'Be visible on Google and in AI answers',
  butFormer: 'Train my team on AI',
  combien: 'How much does it cost?',
  comprend: 'What it includes',
  resultats: 'What it delivered',
  chiffrer: 'Price my case',
  pareil: 'Do the same for us',
  lireCas: 'Read the case study',
  voirService: (titre: string) => `See ${titre}`,
  prixGestion: (fee: string, seuil: string, pct: number) => `Management starts at ${fee}/mo up to ${seuil} of monthly ad budget, then ${pct}% of the budget. The ad budget itself goes straight to the platforms: we never take it.`,
  prixMensuel: (montant: string) => `It starts at ${montant}/mo.`,
  prixUneFois: (montant: string) => `Set-up starts at ${montant}, one-off.`,
  prixInconnu: 'The price depends on what you pick. Two questions, and I give you a figure.',
  prixSuite: 'For a figure on your case, two questions are enough.',
  casChiffre: (client: string, resultat: string) => `At ${client}: ${resultat}.`,
  accueilService: (service: string) => `You are looking at ${service}. Three questions, and I suggest a costed plan. Shall we?`,
  accueilDevis: 'A question about this quote? Write it here, Paul reads it live.',
  guideIntro: 'Three questions, and I suggest a costed plan.',
  go: 'Yes, let’s go',
  aide: 'Help me choose',
  poser: 'Ask a question',
  calculateur: 'Open the calculator',
  libre: 'Write it below, Paul reads it live.',
  suggestions: ['Can we start smaller?', 'How does the start work?', 'What is included in the price?'],
  propIntro: 'Here is what I suggest. Everything can still be changed in the calculator.',
  honoraires: 'Our fees',
  miseEnPlace: 'Set-up',
  media: 'Media budget',
  parMois: '/mo',
  uneFois: ' one-off',
  aDefinir: 'To define together',
  voirDevis: 'See the detailed quote',
  parlerPaul: 'Talk it through with Paul',
  reserver: 'Book a 30-min call',
  reserverCourt: 'Book 30 min',
  recommencer: 'Start again',
  placeholder: 'Write to Paul…',
  envoyer: 'Send',
  apresMessage: 'Sent to Paul. He replies right here. If you need to leave, type your email and his answer will follow you.',
  emailMerci: 'Thank you. If you are gone when Paul replies, his answer will go to this address.',
  erreur: 'The message did not go through. Please try again in a moment.',
  paulRejoint: 'Paul joined the conversation',
  devisTitre: 'A question about this quote?',
  devisTexte: 'Paul can go through it with you, here, live.',
  devisPoser: 'Ask my question',
  budgets: (m: (v: number) => string): Record<string, string> => ({
    'budget-1500': `Under ${m(2000)}`,
    'budget-3500': `${m(2000)} to ${m(5000)}`,
    'budget-7500': `${m(5000)} to ${m(10000)}`,
    'budget-15000': `Over ${m(10000)}`,
  }),
};

export const copie = (lang: Lang): Copy => (lang === 'en' ? EN : FR);
