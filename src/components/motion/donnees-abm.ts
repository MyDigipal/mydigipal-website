/**
 * L'Account-Based Marketing expliqué par la carte de verre (`CarteVerre.astro`), sur la
 * page B2B : on part d'une liste de comptes, chaque canal parle aux mêmes décideurs, et
 * c'est l'engagement du COMPTE qui revient, pas un volume de clics.
 *
 * Aucun chiffre. Les canaux nommés sont des exemples.
 */
import type { Language } from '@/i18n/config';
import type { CarteMcp } from './donnees-mcp';

export function carteAbm(lang: Language): CarteMcp {
  if (lang === 'fr') {
    return {
      nom: 'Votre programme ABM',
      entrees: [
        { libelle: 'Vos comptes cibles', icone: 'target' },
        { libelle: 'Leurs décideurs', icone: 'users' },
        { libelle: 'Leurs signaux', icone: 'trending-up' },
      ],
      sorties: [
        { libelle: 'LinkedIn Ads', icone: 'linkedin' },
        { libelle: 'Google Ads', icone: 'search' },
        { libelle: 'E-mail', icone: 'mail' },
        { libelle: 'Contenu', icone: 'file-text' },
        { libelle: 'Display', icone: 'image' },
        { libelle: 'Commercial', icone: 'briefcase' },
      ],
      retours: [
        { libelle: 'Comptes engagés', icone: 'check-circle' },
        { libelle: 'Rendez-vous', icone: 'calendar' },
      ],
      gardes: ['Comptes hors cible', 'Budget dispersé'],
      temps: [
        {
          titre: 'Ce qu’on vise',
          texte: 'Une liste de comptes choisie avec vos commerciaux, et dans chaque compte les personnes qui décident. On ne cherche pas du volume, on cherche ces entreprises-là.',
        },
        {
          titre: 'Ce qu’on déclenche',
          texte: 'Le même message, adapté à chaque décideur, sur LinkedIn, Google, l’e-mail et le contenu. Les canaux se relaient au lieu de se concurrencer.',
        },
        {
          titre: 'Ce qui revient',
          texte: 'L’engagement se lit par compte : qui a vu, qui a répondu, qui est prêt à parler. Vos commerciaux savent qui appeler, et aucun euro ne part hors de la liste.',
        },
      ],
      conclusion: ['Vous choisissez les comptes.', 'Chaque canal parle aux mêmes décideurs.'],
    };
  }
  return {
    nom: 'Your ABM programme',
    entrees: [
      { libelle: 'Your target accounts', icone: 'target' },
      { libelle: 'Their decision makers', icone: 'users' },
      { libelle: 'Their signals', icone: 'trending-up' },
    ],
    sorties: [
      { libelle: 'LinkedIn Ads', icone: 'linkedin' },
      { libelle: 'Google Ads', icone: 'search' },
      { libelle: 'Email', icone: 'mail' },
      { libelle: 'Content', icone: 'file-text' },
      { libelle: 'Display', icone: 'image' },
      { libelle: 'Sales', icone: 'briefcase' },
    ],
    retours: [
      { libelle: 'Engaged accounts', icone: 'check-circle' },
      { libelle: 'Meetings', icone: 'calendar' },
    ],
    gardes: ['Off-target accounts', 'Scattered budget'],
    temps: [
      {
        titre: 'What we aim at',
        texte: 'A list of accounts chosen with your sales team, and in each account the people who decide. We are not after volume, we are after these companies.',
      },
      {
        titre: 'What we trigger',
        texte: 'The same message, adapted to each decision maker, on LinkedIn, Google, email and content. The channels hand over to each other instead of competing.',
      },
      {
        titre: 'What comes back',
        texte: 'Engagement is read by account: who saw, who replied, who is ready to talk. Your sales team knows who to call, and no budget leaves the list.',
      },
    ],
    conclusion: ['You choose the accounts.', 'Every channel talks to the same decision makers.'],
  };
}
