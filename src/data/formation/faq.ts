/**
 * La FAQ de la page AI Training, réécrite le 14/10/2026 sur la grille unique. Les montants
 * viennent de `lib/formation/grille.ts` : une FAQ ne peut plus contredire la page.
 * Euros sur la page française, dollars sur l'anglaise (le sélecteur de devise est plus haut).
 */
import { GRILLE, type Devise } from '@/lib/formation/grille';
import { montant, type Lang } from '@/lib/formation/moteur';

export function faqFormation(lang: Lang) {
  const dv: Devise = lang === 'fr' ? 'EUR' : 'USD';
  const m = (v: number) => montant(v, lang, dv);
  const d = GRILLE.durees;
  const pp = m(d['3h'].distance[dv] / GRILLE.groupeReference);
  const avecFormation = Math.round(GRILLE.academy.avecFormation * 100);

  if (lang === 'fr') {
    return {
      title: 'Questions fréquentes',
      subtitle: 'Ce qu’un responsable demande avant de lancer la formation de son équipe.',
      faqs: [
        { question: 'Combien coûte une séance ?', answer: `Une séance de 3 h coûte ${m(d['3h'].distance[dv])} à distance et ${m(d['3h'].site[dv])} en présentiel, hors taxes ; une journée, ${m(d.jour.distance[dv])} et ${m(d.jour.site[dv])}. Le prix est celui de la séance, quel que soit l’effectif jusqu’à 20 personnes : pour un groupe de 12 à distance, cela fait ${pp} par personne. Plus vous prenez de séances, moins chacune coûte : -5 % pour deux, -10 % de trois à quatre, -15 % de cinq à sept, -20 % dès huit.` },
        { question: 'Séance de 3 h ou journée complète : que choisir ?', answer: 'Nous recommandons la séance de 3 h : assez courte pour garder toute l’attention, assez longue pour que chacun travaille sur ses propres fichiers. Pour une équipe nombreuse, plusieurs séances de 3 h valent mieux qu’une longue journée, et deux groupes peuvent passer le même jour. La journée convient aux séminaires et aux comités qui veulent aller au fond d’un sujet.' },
        { question: 'Combien de personnes par séance ?', answer: 'De 10 à 15, c’est l’idéal pour un atelier : chacun pose ses questions et travaille sur ses cas. De 21 à 50 personnes dans une même séance, une majoration de 15 % s’applique. Au-delà de 50, la séance devient un webinaire, avec des démonstrations et des questions, et une majoration de 50 %. Le simulateur propose le découpage en groupes, et vous pouvez le changer.' },
        { question: 'À distance ou dans nos locaux ?', answer: 'Les deux, avec le même contenu. En présentiel, le déplacement depuis Londres s’ajoute selon la destination et la nécessité d’une nuit d’hôtel ; deux séances de 3 h le même jour partagent le même déplacement. À Londres, il est compris.' },
        { question: 'Qu’est-ce qui est compris dans le prix ?', answer: 'Avant la séance : un call de diagnostic, un formulaire envoyé à chaque participant, plusieurs calls de brief et des briefs écrits, un programme bâti sur vos cas, et l’accès au contenu en avance. Pendant : la séance, animée par un praticien, et un support interactif remis à chacun. Après : l’enregistrement des séquences, la transcription écrite et des recommandations d’outils adaptées à votre contexte.' },
        { question: 'Quels outils allons-nous utiliser ?', answer: 'Ceux de vos équipes : Microsoft Copilot, ChatGPT, Claude ou Gemini. La formation part de votre environnement réel, pas d’une démonstration générique, et vous aide aussi à choisir le bon outil pour chaque tâche.' },
        { question: 'Nos données sont-elles protégées pendant la formation ?', answer: 'C’est un module à part entière, et nous le considérons comme indispensable : quelles données ne jamais coller dans un assistant, quels réglages activer, quelles options européennes existent. Les participants en sortent en sachant utiliser l’IA sans exposer un fichier client ou un contrat.' },
        { question: 'Et après la séance, comment chacun continue ?', answer: `Avec la MyDigipal AI Academy, la formation en ligne : le parcours de son outil, des exercices relus, à son rythme. Dès que vous réservez une formation, chacun de vos salariés y a accès à -${avecFormation} %, et vos entreprises partenaires aussi.` },
      ],
    };
  }
  return {
    title: 'Frequently asked questions',
    subtitle: 'What a manager asks before launching their team’s training.',
    faqs: [
      { question: 'How much does a session cost?', answer: `A 3-hour session costs ${m(d['3h'].distance[dv])} remote and ${m(d['3h'].site[dv])} on-site, excluding VAT; a full day, ${m(d.jour.distance[dv])} and ${m(d.jour.site[dv])}. The price is per session, whatever the headcount up to 20 people: for a remote group of 12, that is ${pp} per person. The more sessions you book, the less each one costs: 5% off for two, 10% for three to four, 15% for five to seven, 20% from eight.` },
      { question: '3-hour session or full day: which one?', answer: 'We recommend the 3-hour session: short enough to keep everyone’s full attention, long enough for each person to work on their own files. For a large team, several 3-hour sessions beat one long day, and two groups can go through on the same day. The full day suits offsites and leadership teams who want to go deep on one topic.' },
      { question: 'How many people per session?', answer: '10 to 15 is ideal for a workshop: everyone asks their questions and works on their own cases. With 21 to 50 people in one session, a 15% surcharge applies. Beyond 50, the session becomes a webinar, with demonstrations and questions, and a 50% surcharge. The simulator suggests how to split the groups, and you can change it.' },
      { question: 'Remote or at our offices?', answer: 'Both, with the same content. On-site, travel from London is added depending on the destination and whether a hotel night is needed; two 3-hour sessions on the same day share one trip. In London, it is included.' },
      { question: 'What is included in the price?', answer: 'Before the session: a diagnostic call, a questionnaire sent to every participant, several briefing calls and written briefs, a programme built on your cases, and access to the content ahead of time. During: the session, led by a practitioner, and interactive material for everyone. After: the recording of the sequences, the written transcript and tool recommendations fitted to your context.' },
      { question: 'Which tools will we use?', answer: 'Your teams’ own: Microsoft Copilot, ChatGPT, Claude or Gemini. The training starts from your real environment, not a generic demo, and also helps you pick the right tool for each task.' },
      { question: 'Is our data protected during the training?', answer: 'It is a module in its own right, and we consider it essential: which data never to paste into an assistant, which settings to switch on, which European options exist. Participants leave knowing how to use AI without exposing a client file or a contract.' },
      { question: 'After the session, how does everyone keep going?', answer: `With the MyDigipal AI Academy, the online course: the track for their tool, reviewed exercises, at their own pace. As soon as you book a training, every one of your employees gets ${avecFormation}% off, and so do your partner companies.` },
    ],
  };
}
