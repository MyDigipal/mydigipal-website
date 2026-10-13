// Les étapes écrites à côté des scènes carrées du labo (13/10/2026), dans les deux langues.
// Une scène réduite au tiers sur un téléphone se regarde, elle ne se lit pas : ce texte dit
// ce qu'elle montre. Aucun chiffre ici ; les chiffres d'une scène sont ceux des études de cas.

import type { Language } from '@/i18n/config';

export type NomScene = 'recherche-concession' | 'audience-meta' | 'vitrines-google' | 'signal-concession';
type Etape = { titre: string; texte: string };
type Txt = { titre: string; etapes: Etape[] };

const SCENES: Record<NomScene, Record<Language, Txt>> = {
  'recherche-concession': {
    fr: {
      titre: 'Un acheteur cherche, la bonne campagne répond',
      etapes: [
        { titre: 'L’acheteur cherche', texte: 'Un modèle, « occasion », le nom de sa ville : il sait déjà ce qu’il veut.' },
        { titre: 'La bonne campagne répond', texte: 'Occasion, neuf par marque, portes ouvertes : chaque intention a sa campagne, son annonce et sa page.' },
        { titre: 'Le budget ne fuit pas', texte: 'Les recherches qui ne vendent pas de voiture, comme « emploi », sont exclues : aucun budget dépensé dessus.' },
      ],
    },
    en: {
      titre: 'A car buyer searches, the right campaign answers',
      etapes: [
        { titre: 'The buyer searches', texte: 'A model, “used”, the name of their town: they already know what they want.' },
        { titre: 'The right campaign answers', texte: 'Used cars, new cars by brand, open days: each intent has its own campaign, ad and page.' },
        { titre: 'No budget leaks away', texte: 'Searches that never sell a car, like “jobs”, are excluded: no budget is spent on them.' },
      ],
    },
  },
  'audience-meta': {
    fr: {
      titre: 'Les acheteurs autour de vous, le contact en dix secondes',
      etapes: [
        { titre: 'On vise autour de vous', texte: 'La zone de la concession, les personnes intéressées par vos modèles, et celles déjà venues sur votre site.' },
        { titre: 'L’annonce parle d’une voiture', texte: 'Une offre précise, une date, un essai : jamais un simple « contactez-nous ».' },
        { titre: 'Le contact en dix secondes', texte: 'Nom et téléphone déjà remplis : il touche « S’inscrire » sans quitter Facebook ou Instagram.' },
        { titre: 'Chez le bon vendeur', texte: 'Le contact part tout de suite vers la bonne concession, jusqu’à l’essai réservé.' },
      ],
    },
    en: {
      titre: 'Buyers near your dealership, a lead in ten seconds',
      etapes: [
        { titre: 'We target around you', texte: 'The dealership’s area, people interested in your models, and those who already visited your website.' },
        { titre: 'The ad is about a car', texte: 'A clear offer, a date, a test drive: never just a vague “contact us”.' },
        { titre: 'A lead in ten seconds', texte: 'Name and phone already filled in: they tap “Sign up” without leaving Facebook or Instagram.' },
        { titre: 'To the right salesperson', texte: 'The lead goes straight to the right dealership, all the way to a booked test drive.' },
      ],
    },
  },
  'vitrines-google': {
    fr: {
      titre: 'Votre stock, sur cinq vitrines Google',
      etapes: [
        { titre: 'Votre stock devient un flux', texte: 'Modèle, prix, photos et concession, mis à jour chaque jour à partir de votre site.' },
        { titre: 'Un seul jeu d’annonces', texte: 'Les titres, les visuels et la vidéo d’une voiture, avec les signaux de vos meilleurs acheteurs.' },
        { titre: 'Cinq vitrines Google', texte: 'Search, YouTube, Display, Gmail et Discover : la voiture apparaît là où l’acheteur se trouve.' },
      ],
    },
    en: {
      titre: 'Your stock, on five Google surfaces',
      etapes: [
        { titre: 'Your stock becomes a feed', texte: 'Model, price, photos and dealership, updated every day from your website.' },
        { titre: 'One set of assets', texte: 'A car’s headlines, visuals and video, with signals from your best buyers.' },
        { titre: 'Five Google surfaces', texte: 'Search, YouTube, Display, Gmail and Discover: the car shows up wherever the buyer is.' },
      ],
    },
  },
  'signal-concession': {
    fr: {
      titre: 'Une demande d’essai, le même signal partout',
      etapes: [
        { titre: 'Chaque contact a un nom', texte: 'Demande d’essai, devis, reprise, appel de plus d’une minute : un nom par action, le même partout.' },
        { titre: 'Envoyé aux quatre', texte: 'GA4, Google Ads, Meta et votre CRM reçoivent le même signal, au même moment.' },
        { titre: 'Les campagnes apprennent', texte: 'Google et Meta enchérissent sur de vraies demandes, et vous lisez les mêmes chiffres partout.' },
      ],
    },
    en: {
      titre: 'One test drive request, one signal everywhere',
      etapes: [
        { titre: 'Every lead has a name', texte: 'Test drive request, quote, trade-in, call over one minute: one name per action, the same everywhere.' },
        { titre: 'Sent to all four', texte: 'GA4, Google Ads, Meta and your CRM receive the same signal at the same time.' },
        { titre: 'Campaigns learn', texte: 'Google and Meta bid on real requests, and you read the same numbers everywhere.' },
      ],
    },
  },
};

export const texteScene = (nom: NomScene, lang: Language): Txt => SCENES[nom][lang];
