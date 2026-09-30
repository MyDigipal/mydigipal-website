/**
 * Performance Max expliquée par la carte de verre, et la méthode Google Ads par le rail :
 * le contenu de la maquette Encre (`labo/refonte-site/direction-a.html`), en français et
 * en anglais. Servi à la page Google Ads (`GoogleAdsPmax`, `GoogleAdsProcess`) et à la
 * page de validation `/{lang}/test-encre`. Aucun chiffre.
 */
import type { Language } from '@/i18n/config';
import type { NomForme } from '@/lib/motion/formes';

type Element = { libelle: string; icone: string };
type Temps = { titre: string; texte: string };

export function cartePmax(lang: Language) {
  const fr = lang === 'fr';
  return {
    titre: fr ? 'Comment marche une campagne Performance Max' : 'How a Performance Max campaign works',
    chapo: fr
      ? 'Vous donnez à Google des éléments et un objectif. Son IA compose les annonces et choisit où les montrer. Notre travail se joue avant et après : ce qu’on lui donne, puis ce qu’on lui apprend.'
      : 'You give Google a set of assets and a goal. Its AI assembles the ads and decides where to show them. Our work happens before and after: what we feed it, then what we teach it.',
    nom: 'Performance Max',
    entrees: [
      { libelle: fr ? 'Titres' : 'Headlines', icone: 'type' },
      { libelle: 'Descriptions', icone: 'file-text' },
      { libelle: 'Images', icone: 'image' },
      { libelle: fr ? 'Vidéos' : 'Videos', icone: 'play' },
      { libelle: fr ? 'Flux produits' : 'Product feed', icone: 'database' },
      { libelle: fr ? 'Signaux d’audience' : 'Audience signals', icone: 'users' },
    ] as Element[],
    sorties: [
      { libelle: 'Search', icone: 'search' },
      { libelle: 'YouTube', icone: 'play' },
      { libelle: 'Display', icone: 'image' },
      { libelle: 'Discover', icone: 'compass' },
      { libelle: 'Gmail', icone: 'mail' },
      { libelle: 'Maps', icone: 'map-pin' },
    ] as Element[],
    retours: [
      { libelle: fr ? 'Lead qualifié' : 'Qualified lead', icone: 'user' },
      { libelle: fr ? 'Vente' : 'Sale', icone: 'check-circle' },
      { libelle: fr ? 'Essai en concession' : 'Test drive', icone: 'car' },
    ] as Element[],
    gardes: fr ? ['Exclusions de marque', 'Mots-clés exclus'] : ['Brand exclusions', 'Negative keywords'],
    temps: (fr
      ? [
          { titre: 'Ce qu’on lui donne', texte: 'Des titres, des descriptions, des images, des vidéos, votre flux de produits ou de véhicules, et des signaux d’audience. Plus la matière est juste, mieux la machine travaille.' },
          { titre: 'Ce que Google décide', texte: 'L’assemblage de chaque annonce, l’enchère et l’emplacement. La même campagne se montre sur six réseaux, selon la personne et le moment.' },
          { titre: 'Ce qu’on lui apprend', texte: 'Quelles conversions comptent vraiment : un lead qualifié, une vente, un essai en concession. Nous les faisons remonter depuis votre CRM, et nous excluons ce qui ne doit pas être acheté.' },
        ]
      : [
          { titre: 'What we feed it', texte: 'Headlines, descriptions, images, videos, your product or vehicle feed, and audience signals. The better the material, the better the machine works.' },
          { titre: 'What Google decides', texte: 'How each ad is assembled, the bid and the placement. The same campaign shows across six networks, depending on the person and the moment.' },
          { titre: 'What we teach it', texte: 'Which conversions really matter: a qualified lead, a sale, a test drive. We send them back from your CRM, and we exclude what should not be bought.' },
        ]) as [Temps, Temps, Temps],
    conclusion: (fr
      ? ['Google choisit où montrer l’annonce.', 'Nous choisissons ce qu’il apprend.']
      : ['Google chooses where the ad shows.', 'We choose what it learns.']) as [string, string],
  };
}

export function methodeGoogleAds(lang: Language) {
  const fr = lang === 'fr';
  return {
    titre: fr ? 'De l’audit au reporting, en quatre temps' : 'From audit to reporting, in four stages',
    stations: (fr
      ? [
          { titre: 'Audit et découverte', texte: 'Nous analysons vos campagnes actuelles et le paysage concurrentiel, et nous repérons les gains rapides.', forme: 'loupe' },
          { titre: 'Stratégie et mise en place', texte: 'Structure des campagnes, rédaction des annonces, suivi des conversions et paramétrage des audiences.', forme: 'structure' },
          { titre: 'Lancement et optimisation', texte: 'Suivi quotidien, tests A/B et ajustement des enchères, sur la base des performances réelles.', forme: 'curseur' },
          { titre: 'Montée en charge et reporting', texte: 'Nous augmentons ce qui fonctionne. Un rapport mensuel avec des indicateurs clairs et des recommandations.', forme: 'courbe' },
        ]
      : [
          { titre: 'Audit and discovery', texte: 'We analyse your current campaigns and the competitive landscape, and we identify the quick wins.', forme: 'loupe' },
          { titre: 'Strategy and setup', texte: 'Campaign structure, ad copy, conversion tracking and audience configuration.', forme: 'structure' },
          { titre: 'Launch and optimisation', texte: 'Daily monitoring, A/B testing and bid adjustments, based on real performance data.', forme: 'curseur' },
          { titre: 'Scale and reporting', texte: 'We scale what works. A monthly report with clear KPIs and recommendations.', forme: 'courbe' },
        ]) as { titre: string; texte: string; forme: NomForme }[],
  };
}
