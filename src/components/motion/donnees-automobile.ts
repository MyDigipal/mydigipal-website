/**
 * Les scènes des pages automobile (groupe 3 de la refonte, 30/09/2026) :
 *
 * - `railParcours` : le tunnel d'un concessionnaire, de la recherche à l'essai, sur le rail
 *   (`RailMorphing.astro`), page `/automotive` ;
 * - `carteCompte` : le compte Google Ads d'une concession, une campagne par marque et un
 *   groupe par modèle, sur la carte de verre (`CarteVerre.astro`), page Google Ads ;
 * - `railFormulaire` : du formulaire Meta au CRM, puis retour à Meta, sur le rail, page
 *   Paid Social ;
 * - `carteStock` : le stock qui devient l'annonce, sur la carte de verre, page Dynamic Ads.
 *
 * Aucun chiffre. Les plateformes nommées sont des exemples de diffusion.
 */
import type { Language } from '@/i18n/config';
import type { NomForme } from '@/lib/motion/formes';
import type { CarteMcp } from './donnees-mcp';

type Station = { titre: string; texte: string; forme: NomForme };

export function railParcours(lang: Language): Station[] {
  if (lang === 'fr') {
    return [
      { titre: 'Il cherche', forme: 'loupe', texte: 'Il tape un modèle, « SUV hybride occasion », ou le nom de sa ville. Google Ads vous place en haut de la page, sur le modèle qu’il cherche.' },
      { titre: 'Il compare', forme: 'structure', texte: 'Il ouvre trois concessions dans trois onglets. Votre page modèle, votre prix et vos avis décident s’il reste chez vous.' },
      { titre: 'Il revient', forme: 'curseur', texte: 'Il part sans rien laisser, comme la plupart. Les Dynamic Ads lui remontrent la voiture qu’il a regardée, sur Facebook, Instagram et Google.' },
      { titre: 'Il demande', forme: 'bulle', texte: 'Un formulaire Meta, un appel, une demande d’essai. Le contact arrive dans votre CRM, avec l’annonce qui l’a amené.' },
      { titre: 'Il vient essayer', forme: 'cible', texte: 'Votre vendeur le rappelle avec le bon véhicule en tête. Le rendez-vous d’essai se compte comme un résultat, pas seulement le clic.' },
    ];
  }
  return [
    { titre: 'They search', forme: 'loupe', texte: 'They type a model, “used hybrid SUV”, or the name of their town. Google Ads puts you at the top of the page, on the model they want.' },
    { titre: 'They compare', forme: 'structure', texte: 'They open three dealerships in three tabs. Your model page, your price and your reviews decide whether they stay with you.' },
    { titre: 'They come back', forme: 'curseur', texte: 'They leave without a trace, like most people. Dynamic Ads show them the car they looked at again, on Facebook, Instagram and Google.' },
    { titre: 'They ask', forme: 'bulle', texte: 'A Meta form, a call, a test drive request. The contact lands in your CRM, with the ad that brought them in.' },
    { titre: 'They test drive', forme: 'cible', texte: 'Your salesperson calls back with the right vehicle in mind. The test drive counts as a result, not just the click.' },
  ];
}

export function railFormulaire(lang: Language): Station[] {
  if (lang === 'fr') {
    return [
      { titre: 'L’annonce', forme: 'curseur', texte: 'Un carrousel de vos véhicules, une vidéo d’essai, une offre de reprise, dans le fil Facebook ou Instagram des gens qui habitent autour de la concession.' },
      { titre: 'Le formulaire', forme: 'bulle', texte: 'Il s’ouvre dans l’application, déjà rempli avec le nom et le téléphone. Deux questions sur le modèle et le délai, et c’est envoyé.' },
      { titre: 'Le CRM', forme: 'structure', texte: 'Le contact arrive dans votre CRM en quelques minutes, avec le modèle demandé et l’annonce d’origine. Plus de fichier à télécharger le lundi.' },
      { titre: 'Le rappel', forme: 'cible', texte: 'Le vendeur de la bonne concession est prévenu et rappelle tant que l’intérêt est chaud.' },
      { titre: 'Le retour à Meta', forme: 'courbe', texte: 'Les contacts devenus rendez-vous ou ventes remontent à Meta, qui apprend à trouver des acheteurs, et plus seulement des formulaires remplis.' },
    ];
  }
  return [
    { titre: 'The ad', forme: 'curseur', texte: 'A carousel of your vehicles, a test drive video, a trade-in offer, in the Facebook or Instagram feed of people who live around the dealership.' },
    { titre: 'The form', forme: 'bulle', texte: 'It opens inside the app, already filled in with name and phone. Two questions on the model and the timing, and it is sent.' },
    { titre: 'The CRM', forme: 'structure', texte: 'The contact reaches your CRM within minutes, with the model requested and the ad it came from. No more file to download on Monday.' },
    { titre: 'The call back', forme: 'cible', texte: 'The salesperson at the right dealership is alerted and calls back while the interest is still warm.' },
    { titre: 'Back to Meta', forme: 'courbe', texte: 'Contacts that became appointments or sales go back to Meta, which learns to find buyers, not just filled-in forms.' },
  ];
}

export function carteCompte(lang: Language): CarteMcp {
  if (lang === 'fr') {
    return {
      nom: 'Votre compte Google Ads',
      entrees: [
        { libelle: 'Votre stock', icone: 'database' },
        { libelle: 'Vos marques et modèles', icone: 'layers' },
        { libelle: 'Votre zone', icone: 'map-pin' },
      ],
      sorties: [
        { libelle: 'Search', icone: 'search' },
        { libelle: 'Annonces de véhicules', icone: 'car' },
        { libelle: 'Performance Max', icone: 'zap' },
        { libelle: 'YouTube', icone: 'youtube' },
        { libelle: 'Display', icone: 'globe' },
        { libelle: 'Google Maps', icone: 'compass' },
      ],
      retours: [
        { libelle: 'Demandes d’essai', icone: 'calendar' },
        { libelle: 'Appels', icone: 'phone' },
      ],
      gardes: ['Modèles déjà vendus', 'Hors de votre zone'],
      temps: [
        {
          titre: 'Ce qu’on lui donne',
          texte: 'Votre stock, vos marques, vos modèles et la zone où vous vendez. Chaque marque a sa campagne, chaque modèle son groupe d’annonces : le budget va là où vous voulez vendre.',
        },
        {
          titre: 'Où il vous montre',
          texte: 'Sur la recherche quand un acheteur tape le modèle, dans les annonces de véhicules avec photo et prix, puis sur YouTube, le Display et Maps pour ceux qui habitent près de chez vous.',
        },
        {
          titre: 'Ce qui revient',
          texte: 'Chaque formulaire, appel ou demande d’essai revient rattaché au modèle qui l’a amené. Un modèle vendu sort des annonces, et la diffusion s’arrête aux limites de votre zone.',
        },
      ],
      conclusion: ['Une campagne par marque, un groupe par modèle.', 'Le budget suit le stock que vous voulez vendre.'],
    };
  }
  return {
    nom: 'Your Google Ads account',
    entrees: [
      { libelle: 'Your stock', icone: 'database' },
      { libelle: 'Your brands and models', icone: 'layers' },
      { libelle: 'Your area', icone: 'map-pin' },
    ],
    sorties: [
      { libelle: 'Search', icone: 'search' },
      { libelle: 'Vehicle ads', icone: 'car' },
      { libelle: 'Performance Max', icone: 'zap' },
      { libelle: 'YouTube', icone: 'youtube' },
      { libelle: 'Display', icone: 'globe' },
      { libelle: 'Google Maps', icone: 'compass' },
    ],
    retours: [
      { libelle: 'Test drive requests', icone: 'calendar' },
      { libelle: 'Calls', icone: 'phone' },
    ],
    gardes: ['Models already sold', 'Outside your area'],
    temps: [
      {
        titre: 'What it is given',
        texte: 'Your stock, your brands, your models and the area where you sell. Each brand has its campaign, each model its ad group: the budget goes where you want to sell.',
      },
      {
        titre: 'Where it shows you',
        texte: 'On search when a buyer types the model, in vehicle ads with photo and price, then on YouTube, Display and Maps for people who live nearby.',
      },
      {
        titre: 'What comes back',
        texte: 'Every form, call or test drive request comes back tied to the model that brought it. A sold model leaves the ads, and delivery stops at the edge of your area.',
      },
    ],
    conclusion: ['One campaign per brand, one group per model.', 'The budget follows the stock you want to sell.'],
  };
}

export function carteStock(lang: Language): CarteMcp {
  if (lang === 'fr') {
    return {
      nom: 'Votre flux de stock',
      entrees: [
        { libelle: 'Vos véhicules en stock', icone: 'car' },
        { libelle: 'Leurs photos et prix', icone: 'image' },
        { libelle: 'Ce que l’acheteur a vu', icone: 'eye' },
      ],
      sorties: [
        { libelle: 'Facebook', icone: 'facebook' },
        { libelle: 'Instagram', icone: 'instagram' },
        { libelle: 'Google Display', icone: 'globe' },
        { libelle: 'YouTube', icone: 'youtube' },
        { libelle: 'Gmail', icone: 'mail' },
        { libelle: 'Discover', icone: 'compass' },
      ],
      retours: [
        { libelle: 'Leads par véhicule', icone: 'check-circle' },
        { libelle: 'Demandes d’essai', icone: 'calendar' },
      ],
      gardes: ['Véhicules vendus', 'Prix périmés'],
      temps: [
        {
          titre: 'Ce que le flux reçoit',
          texte: 'Votre stock, relié à votre logiciel ou à un Google Sheets : chaque véhicule avec ses photos, son prix et son kilométrage, mis à jour chaque jour ou chaque heure.',
        },
        {
          titre: 'Ce qu’il devient',
          texte: 'Chaque véhicule devient une annonce. L’acheteur qui a regardé un SUV revoit ce SUV, ou ceux qui lui ressemblent, sur Facebook, Instagram et Google.',
        },
        {
          titre: 'Ce qui revient, ce qui sort',
          texte: 'Les leads reviennent rattachés au véhicule qui les a amenés. Une voiture vendue quitte les annonces au passage suivant du flux : personne ne clique sur un véhicule parti.',
        },
      ],
      conclusion: ['Votre stock change.', 'Vos annonces changent avec lui.'],
    };
  }
  return {
    nom: 'Your stock feed',
    entrees: [
      { libelle: 'Your vehicles in stock', icone: 'car' },
      { libelle: 'Their photos and prices', icone: 'image' },
      { libelle: 'What the buyer viewed', icone: 'eye' },
    ],
    sorties: [
      { libelle: 'Facebook', icone: 'facebook' },
      { libelle: 'Instagram', icone: 'instagram' },
      { libelle: 'Google Display', icone: 'globe' },
      { libelle: 'YouTube', icone: 'youtube' },
      { libelle: 'Gmail', icone: 'mail' },
      { libelle: 'Discover', icone: 'compass' },
    ],
    retours: [
      { libelle: 'Leads per vehicle', icone: 'check-circle' },
      { libelle: 'Test drive requests', icone: 'calendar' },
    ],
    gardes: ['Vehicles sold', 'Outdated prices'],
    temps: [
      {
        titre: 'What the feed receives',
        texte: 'Your stock, connected to your software or a Google Sheet: every vehicle with its photos, price and mileage, updated daily or hourly.',
      },
      {
        titre: 'What it becomes',
        texte: 'Every vehicle becomes an ad. The buyer who looked at an SUV sees that SUV again, or similar ones, on Facebook, Instagram and Google.',
      },
      {
        titre: 'What comes back, what leaves',
        texte: 'Leads come back tied to the vehicle that brought them. A sold car leaves the ads at the next feed update: nobody clicks on a vehicle that is gone.',
      },
    ],
    conclusion: ['Your stock changes.', 'Your ads change with it.'],
  };
}
