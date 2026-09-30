/**
 * L'automation cross-canal expliquée par la carte de verre (`CarteVerre.astro`), sur la
 * page Emailing : ce qu'une séquence reçoit (le prospect, son comportement, le CRM), ce
 * qu'elle déclenche d'un canal à l'autre, ce qui revient, et qui n'est jamais contacté.
 *
 * Aucun chiffre. Les canaux nommés sont des exemples de ce qu'une séquence peut déclencher.
 */
import type { Language } from '@/i18n/config';
import type { CarteMcp } from './donnees-mcp';

export function carteSequence(lang: Language): CarteMcp {
  if (lang === 'fr') {
    return {
      nom: 'Votre séquence',
      entrees: [
        { libelle: 'Le prospect', icone: 'user' },
        { libelle: 'Son comportement', icone: 'trending-up' },
        { libelle: 'Le CRM', icone: 'database' },
      ],
      sorties: [
        { libelle: 'E-mail', icone: 'mail' },
        { libelle: 'Relance', icone: 'refresh-cw' },
        { libelle: 'Google Ads', icone: 'target' },
        { libelle: 'Meta', icone: 'users' },
        { libelle: 'LinkedIn', icone: 'linkedin' },
        { libelle: 'Alerte commerciale', icone: 'send' },
      ],
      retours: [
        { libelle: 'Ouverture, clic', icone: 'check-circle' },
        { libelle: 'Rendez-vous', icone: 'calendar' },
      ],
      gardes: ['Désinscrits', 'Contacts sans consentement'],
      temps: [
        {
          titre: 'Ce qu’elle reçoit',
          texte: 'Le profil du prospect, ce qu’il a ouvert ou cliqué, ce que dit le CRM. La séquence sait où il en est avant d’écrire.',
        },
        {
          titre: 'Ce qu’elle déclenche',
          texte: 'Le bon message au bon moment, puis la suite sur un autre canal : une relance, une annonce Google ou Meta, un signal à l’équipe commerciale.',
        },
        {
          titre: 'Ce qui revient',
          texte: 'Chaque ouverture, clic ou rendez-vous revient dans le CRM et ajuste la suite. Un désinscrit ou un contact sans consentement n’est plus jamais sollicité.',
        },
      ],
      conclusion: ['Le prospect montre un signal.', 'La séquence répond sur le bon canal.'],
    };
  }
  return {
    nom: 'Your sequence',
    entrees: [
      { libelle: 'The prospect', icone: 'user' },
      { libelle: 'Their behaviour', icone: 'trending-up' },
      { libelle: 'The CRM', icone: 'database' },
    ],
    sorties: [
      { libelle: 'Email', icone: 'mail' },
      { libelle: 'Follow-up', icone: 'refresh-cw' },
      { libelle: 'Google Ads', icone: 'target' },
      { libelle: 'Meta', icone: 'users' },
      { libelle: 'LinkedIn', icone: 'linkedin' },
      { libelle: 'Sales alert', icone: 'send' },
    ],
    retours: [
      { libelle: 'Open, click', icone: 'check-circle' },
      { libelle: 'Meeting', icone: 'calendar' },
    ],
    gardes: ['Unsubscribed', 'Contacts without consent'],
    temps: [
      {
        titre: 'What it receives',
        texte: 'The prospect’s profile, what they opened or clicked, what the CRM says. The sequence knows where they stand before it writes.',
      },
      {
        titre: 'What it triggers',
        texte: 'The right message at the right time, then the next step on another channel: a follow-up, a Google or Meta ad, a signal to the sales team.',
      },
      {
        titre: 'What comes back',
        texte: 'Every open, click or meeting goes back to the CRM and adjusts what comes next. An unsubscribed or non-consenting contact is never contacted again.',
      },
    ],
    conclusion: ['The prospect shows a signal.', 'The sequence answers on the right channel.'],
  };
}
