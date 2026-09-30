/**
 * Le tracking côté serveur, avec le consentement, expliqué par la carte de verre
 * (`CarteVerre.astro`), sur la page Tracking & Reporting : le site n'envoie qu'un flux à
 * VOTRE serveur, qui le transmet à chaque plateforme selon le consentement du visiteur.
 *
 * Aucun chiffre. Les plateformes nommées sont des exemples.
 */
import type { Language } from '@/i18n/config';
import type { CarteMcp } from './donnees-mcp';

export function carteServeur(lang: Language): CarteMcp {
  if (lang === 'fr') {
    return {
      nom: 'Votre conteneur serveur',
      entrees: [
        { libelle: 'Le visiteur', icone: 'user' },
        { libelle: 'Son consentement', icone: 'shield' },
        { libelle: 'Vos événements', icone: 'code' },
      ],
      sorties: [
        { libelle: 'GA4', icone: 'bar-chart' },
        { libelle: 'Google Ads', icone: 'target' },
        { libelle: 'Meta', icone: 'users' },
        { libelle: 'LinkedIn', icone: 'linkedin' },
        { libelle: 'TikTok', icone: 'play' },
        { libelle: 'CRM', icone: 'database' },
      ],
      retours: [
        { libelle: 'Conversions attribuées', icone: 'check-circle' },
        { libelle: 'Audiences', icone: 'users' },
      ],
      gardes: ['Refus de consentement', 'Données personnelles en clair'],
      temps: [
        {
          titre: 'Ce que le site envoie',
          texte: 'Un seul flux d’événements, vers votre propre serveur, au lieu de dix balises dans le navigateur. Les bloqueurs et les limites des navigateurs le perturbent beaucoup moins.',
        },
        {
          titre: 'Ce que le serveur transmet',
          texte: 'Chaque plateforme reçoit l’événement qui la concerne, selon ce que le visiteur a accepté : GA4, Google Ads, Meta, LinkedIn, TikTok, votre CRM.',
        },
        {
          titre: 'Ce qui revient, ce qui reste fermé',
          texte: 'Les conversions reviennent attribuées aux bonnes campagnes. Sans consentement, rien ne part avec un identifiant ; aucune donnée personnelle ne sort en clair.',
        },
      ],
      conclusion: ['Le site parle à votre serveur.', 'Votre serveur parle aux plateformes, selon le consentement.'],
    };
  }
  return {
    nom: 'Your server container',
    entrees: [
      { libelle: 'The visitor', icone: 'user' },
      { libelle: 'Their consent', icone: 'shield' },
      { libelle: 'Your events', icone: 'code' },
    ],
    sorties: [
      { libelle: 'GA4', icone: 'bar-chart' },
      { libelle: 'Google Ads', icone: 'target' },
      { libelle: 'Meta', icone: 'users' },
      { libelle: 'LinkedIn', icone: 'linkedin' },
      { libelle: 'TikTok', icone: 'play' },
      { libelle: 'CRM', icone: 'database' },
    ],
    retours: [
      { libelle: 'Attributed conversions', icone: 'check-circle' },
      { libelle: 'Audiences', icone: 'users' },
    ],
    gardes: ['Consent refused', 'Personal data in clear'],
    temps: [
      {
        titre: 'What the site sends',
        texte: 'A single stream of events, to your own server, instead of ten tags in the browser. Blockers and browser limits disrupt it far less.',
      },
      {
        titre: 'What the server forwards',
        texte: 'Each platform receives the event it needs, according to what the visitor accepted: GA4, Google Ads, Meta, LinkedIn, TikTok, your CRM.',
      },
      {
        titre: 'What comes back, what stays closed',
        texte: 'Conversions come back attributed to the right campaigns. Without consent, nothing leaves with an identifier; no personal data goes out in clear.',
      },
    ],
    conclusion: ['The site talks to your server.', 'Your server talks to the platforms, according to consent.'],
  };
}
