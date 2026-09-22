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
  accueilService: (service: string) => `Vous regardez ${service}. En trois questions, je vous propose un plan chiffré. On y va ?`,
  accueilDevis: 'Une question sur ce devis ? Écrivez-la ici, Paul la lit en direct.',
  guideIntro: 'Trois questions, et je vous propose un plan chiffré.',
  go: 'Oui, allons-y',
  aide: 'M’aider à choisir',
  poser: 'Poser une question',
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
  accueilService: (service: string) => `You are looking at ${service}. Three questions, and I suggest a costed plan. Shall we?`,
  accueilDevis: 'A question about this quote? Write it here, Paul reads it live.',
  guideIntro: 'Three questions, and I suggest a costed plan.',
  go: 'Yes, let’s go',
  aide: 'Help me choose',
  poser: 'Ask a question',
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
