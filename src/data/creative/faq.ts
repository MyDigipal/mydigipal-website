/**
 * La FAQ de la page Creative design (20/10/2026). Les montants viennent de
 * `lib/creative/grille.ts` : une FAQ ne peut pas contredire la grille. Euros sur la page
 * française, dollars sur l'anglaise (le sélecteur de devise est plus haut). Aucun délai chiffré :
 * la page promet la vitesse sans la dater.
 */
import { GRILLE_CREA, type Devise } from '@/lib/creative/grille';
import { montant, type Lang } from '@/lib/creative/moteur';

export function faqCreative(lang: Lang) {
  const dv: Devise = lang === 'fr' ? 'EUR' : 'USD';
  const m = (v: number) => montant(v, lang, dv);
  const li = GRILLE_CREA.jeux.li;

  if (lang === 'fr') {
    return {
      title: 'Questions fréquentes',
      subtitle: 'Ce qu’on nous demande avant une première commande.',
      faqs: [
        { question: 'Combien coûte un jeu de bannières ?', answer: `Un jeu LinkedIn coûte ${m(li[0].prix[dv])} hors taxes, un jeu Google ${m(GRILLE_CREA.jeux.pm[0].prix[dv])}, les deux ensemble ${m(GRILLE_CREA.jeux.both[0].prix[dv])}. Dès trois jeux dans la même demande, le prix de chaque jeu baisse : ${m(li[1].prix[dv])} le jeu LinkedIn de 3 à 5 jeux, jusqu’à ${m(li[3].prix[dv])} à partir de 11. Toutes les tailles du canal sont comprises.` },
        { question: 'En combien de temps recevons-nous une première version ?', answer: 'Vite : nos outils d’IA produisent la première version, nos créatifs la relisent et la corrigent, puis elle arrive dans votre Hub. Pour une vidéo, comptez en plus le temps de valider le storyboard. Si vous avez une date de lancement, dites-la-nous dans la demande : nous nous calons dessus.' },
        { question: 'Combien de tours de retours sont compris ?', answer: 'Quatre, sur chaque jeu de bannières et sur chaque vidéo. Un tour est une révision complète : le plus simple est de rassembler les remarques de votre équipe dans le même tour, directement sur l’image dans le Hub. Au-delà de quatre, on en parle, au cas par cas.' },
        { question: 'Quels outils d’IA utilisez-vous ?', answer: 'Les meilleurs du moment, selon la tâche : Claude pour écrire et décliner les messages, Nano Banana pour créer et retoucher les images, Higgsfield pour animer les vidéos. Ils travaillent à partir de votre charte et de vos visuels. Ce sont nos créatifs qui choisissent, corrigent et relisent chaque fichier : rien ne vous est envoyé sans être passé entre leurs mains.' },
        { question: 'Partez-vous de notre charte et de nos visuels ?', answer: 'Oui. Vous nous transmettez votre charte, vos logos, vos photos et vos exemples de campagnes ; tout ce que nous produisons s’y tient. S’il manque une image, nous la créons dans votre style, et vous la validez comme le reste.' },
        { question: 'Et dans plusieurs langues ?', answer: 'Chaque jeu dans une langue de plus coûte 30 % de son prix : mêmes visuels, texte traduit et relu. Pratique pour une campagne qui tourne dans plusieurs pays.' },
        { question: 'Les frais média sont-ils compris ?', answer: 'Non. Ces prix couvrent la création. Les budgets publicitaires se paient à part, directement aux plateformes ou par nous si nous pilotons vos campagnes.' },
        { question: 'Qui met les créas en ligne, et où sont les fichiers ?', answer: 'Si nous pilotons vos campagnes, notre équipe les publie sur chaque canal dès votre validation. Dans tous les cas, chaque fichier est rangé dans votre dossier Drive, dans tous ses formats.' },
        { question: 'Faites-vous aussi les landing pages ?', answer: 'Oui, et elles auront bientôt leur propre page. En attendant, écrivez-nous : nous chiffrons la page avec ses textes, son formulaire et son suivi.' },
      ],
    };
  }
  return {
    title: 'Frequently asked questions',
    subtitle: 'What people ask us before a first order.',
    faqs: [
      { question: 'How much does a banner set cost?', answer: `A LinkedIn set costs ${m(li[0].prix[dv])} excluding VAT, a Google set ${m(GRILLE_CREA.jeux.pm[0].prix[dv])}, both together ${m(GRILLE_CREA.jeux.both[0].prix[dv])}. From three sets in the same request, each set costs less: ${m(li[1].prix[dv])} per LinkedIn set from 3 to 5 sets, down to ${m(li[3].prix[dv])} from 11. Every size of the channel is included.` },
      { question: 'How quickly do we get a first version?', answer: 'Fast: our AI tools produce the first version, our creatives check and fix it, and it lands in your Hub. For a video, add the time to approve the storyboard. If you have a launch date, put it in the request: we plan around it.' },
      { question: 'How many rounds of feedback are included?', answer: 'Four, on every banner set and every video. A round is a full revision: the simplest is to gather your team’s comments into the same round, right on the image in the Hub. Beyond four, we talk about it, case by case.' },
      { question: 'Which AI tools do you use?', answer: 'The best available, depending on the task: Claude to write and adapt the copy, Nano Banana to create and retouch the images, Higgsfield to animate the videos. They work from your brand guidelines and your visuals. Our creatives choose, fix and check every file: nothing reaches you without going through their hands.' },
      { question: 'Do you start from our brand and our visuals?', answer: 'Yes. You send us your guidelines, logos, photos and past campaigns; everything we produce sticks to them. If an image is missing, we create it in your style, and you approve it like the rest.' },
      { question: 'What about other languages?', answer: 'Each set in one more language costs 30% of its price: same visuals, text translated and checked. Handy for a campaign running in several countries.' },
      { question: 'Is media spend included?', answer: 'No. These prices cover the creative work. Ad budgets are paid separately, to the platforms directly or through us if we run your campaigns.' },
      { question: 'Who puts the ads live, and where are the files?', answer: 'If we run your campaigns, our team publishes them on each channel as soon as you approve. Either way, every file is stored in your Drive folder, in all its formats.' },
      { question: 'Do you also build landing pages?', answer: 'Yes, and they will soon have their own page. In the meantime, write to us: we price the page with its copy, its form and its tracking.' },
    ],
  };
}
