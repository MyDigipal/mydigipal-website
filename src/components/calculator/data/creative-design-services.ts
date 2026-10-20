import type { ServiceItem, ServiceLevel } from '../types';
import { chiffrer, type EtatCrea } from '../../../lib/creative/moteur';

// Creative design (20/10/2026) : trois forfaits mensuels, calculés depuis LA grille de la page
// Creative design (`lib/creative/grille.ts`, euros). Aucun prix n'est écrit ici : changer la
// grille change le calculateur. Le bloc « Création de Visuels » de Paid Social prend les mêmes
// forfaits (harmonisation demandée dans la tâche du 13/10/2026).

const vide: EtatCrea = { jeux: 0, canal: 'li', videos: 0, duree: 'v20', langues: 0, docs: 0, storyboards: 0, devise: 'EUR' };
const prix = (e: Partial<EtatCrea>) => chiffrer({ ...vide, ...e }, 'fr').total;

export const FORFAITS_CREA = {
  essentiel: { jeux: 4, videos: 0 },
  avance: { jeux: 6, videos: 1 },
  premium: { jeux: 12, videos: 3 },
} as const;

/** Les trois forfaits, communs au domaine Creative design et à Paid Social. */
export const niveauxCrea: ServiceLevel[] = [
  {
    name: 'Essentiel',
    nameEn: 'Essential',
    price: prix(FORFAITS_CREA.essentiel),
    features: [
      `${FORFAITS_CREA.essentiel.jeux} jeux de bannières par mois`,
      'Toutes les tailles du canal, sans supplément',
      'Produits avec l’IA, relus par nos créatifs',
      '4 tours de retours par jeu',
    ],
    featuresEn: [
      `${FORFAITS_CREA.essentiel.jeux} banner sets a month`,
      'Every size of the channel, at no extra cost',
      'Made with AI, checked by our creatives',
      '4 rounds of feedback per set',
    ],
    recommended: 'Tester plusieurs messages',
    recommendedEn: 'Testing several messages',
  },
  {
    name: 'Avancé',
    nameEn: 'Advanced',
    price: prix(FORFAITS_CREA.avance),
    features: [
      `${FORFAITS_CREA.avance.jeux} jeux de bannières et ${FORFAITS_CREA.avance.videos} vidéo de 15 à 20 s par mois`,
      'Vidéo livrée en 16:9, 1:1 et 9:16',
      'Prix de volume appliqué',
      '4 tours de retours par jeu et par vidéo',
    ],
    featuresEn: [
      `${FORFAITS_CREA.avance.jeux} banner sets and ${FORFAITS_CREA.avance.videos} 15 to 20-second video a month`,
      'Video delivered in 16:9, 1:1 and 9:16',
      'Volume price applied',
      '4 rounds of feedback per set and per video',
    ],
    recommended: 'Campagnes régulières',
    recommendedEn: 'Regular campaigns',
    popular: true,
  },
  {
    name: 'Premium',
    nameEn: 'Premium',
    price: prix(FORFAITS_CREA.premium),
    features: [
      `${FORFAITS_CREA.premium.jeux} jeux de bannières et ${FORFAITS_CREA.premium.videos} vidéos par mois`,
      'Un nouveau jeu toutes les semaines',
      'Meilleur prix de volume',
      '4 tours de retours par jeu et par vidéo',
    ],
    featuresEn: [
      `${FORFAITS_CREA.premium.jeux} banner sets and ${FORFAITS_CREA.premium.videos} videos a month`,
      'A fresh set every week',
      'Best volume price',
      '4 rounds of feedback per set and per video',
    ],
    recommended: 'Volume important, tests continus',
    recommendedEn: 'High volume, continuous testing',
  },
];

export const creativeDesignServices: ServiceItem[] = [
  {
    id: 'creative-packs',
    title: 'Production créative',
    titleEn: 'Creative production',
    description: 'Bannières LinkedIn, Google et Display, et vidéos de 15 à 30 s, produites avec l’IA et relues par nos créatifs.',
    descriptionEn: 'LinkedIn, Google and Display banners and 15 to 30-second videos, made with AI and checked by our creatives.',
    icon: 'palette',
    detailedInfo: {
      title: 'Creative design : c’est quoi exactement ?',
      content: {
        intro: 'Nous produisons vos publicités avec les meilleurs outils d’IA, dans votre charte, et chaque fichier est relu par un humain.',
        sections: [
          { title: 'Ce que nous produisons', items: ['Jeux de bannières LinkedIn (3 images)', 'Jeux de bannières Google : Performance Max et Display', 'Document ads LinkedIn', 'Vidéos de 15 à 30 s, en 16:9, 1:1 et 9:16'] },
          { title: 'Comment ça se passe', items: ['Vous commentez directement sur l’image, dans votre Hub', '4 tours de retours compris', 'Rien ne part en ligne sans votre accord', 'Chaque fichier rangé dans votre Drive'] },
        ],
        conclusion: 'Le détail des prix et un simulateur sont sur la page Creative design.',
      },
    },
    detailedInfoEn: {
      title: 'Creative design: what exactly is it?',
      content: {
        intro: 'We produce your ads with the best AI tools, on brand, and a human checks every file.',
        sections: [
          { title: 'What we produce', items: ['LinkedIn banner sets (3 images)', 'Google banner sets: Performance Max and Display', 'LinkedIn document ads', '15 to 30-second videos, in 16:9, 1:1 and 9:16'] },
          { title: 'How it works', items: ['You comment right on the image, in your Hub', '4 rounds of feedback included', 'Nothing goes live without your go-ahead', 'Every file stored in your Drive'] },
        ],
        conclusion: 'Full prices and a simulator are on the Creative design page.',
      },
    },
    levels: niveauxCrea,
  },
];
