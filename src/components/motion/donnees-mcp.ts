/**
 * Le serveur MCP expliqué par la carte de verre (`CarteVerre.astro`), sur AI Training
 * (`MCPBuildSection`) et AI Solutions (`MCPCustomBuildSection`). Un seul contenu pour les
 * deux pages : la notion est la même, seul ce qu'on vend autour change.
 *
 * Aucun chiffre : ni nombre d'outils, ni résultat. Les outils nommés sont des exemples de
 * ce qu'un serveur MCP peut appeler, pas une liste de clients.
 */
import type { Language } from '@/i18n/config';

type Element = { libelle: string; icone: string };
type Temps = { titre: string; texte: string };

export interface CarteMcp {
  nom: string;
  entrees: Element[];
  sorties: Element[];
  retours: Element[];
  gardes: string[];
  temps: [Temps, Temps, Temps];
  conclusion: [string, string];
}

export function carteMcp(lang: Language): CarteMcp {
  if (lang === 'fr') {
    return {
      nom: 'Votre serveur MCP',
      entrees: [
        { libelle: 'Votre question', icone: 'message-circle' },
        { libelle: 'Votre compte', icone: 'user' },
        { libelle: 'Vos droits', icone: 'lock' },
      ],
      sorties: [
        { libelle: 'CRM', icone: 'users' },
        { libelle: 'Google Ads', icone: 'target' },
        { libelle: 'GA4', icone: 'bar-chart' },
        { libelle: 'BigQuery', icone: 'database' },
        { libelle: 'Gmail', icone: 'mail' },
        { libelle: 'Notion', icone: 'file-text' },
      ],
      retours: [
        { libelle: 'Réponse sourcée', icone: 'check-circle' },
        { libelle: 'Document créé', icone: 'file-text' },
      ],
      gardes: ['Écriture sans validation', 'Données sensibles'],
      temps: [
        {
          titre: 'Ce que vous lui demandez',
          texte: 'Une question en français, dans Claude ou ChatGPT. Le serveur reçoit la demande avec votre compte, et sait quels outils vous avez le droit d’appeler.',
        },
        {
          titre: 'Ce qu’il va chercher',
          texte: 'Il choisit l’outil et l’interroge à votre place : le CRM, les campagnes, les statistiques, la messagerie. Plus de copier-coller d’un onglet à l’autre.',
        },
        {
          titre: 'Ce qu’il vous rend',
          texte: 'La réponse revient dans la conversation, avec sa source. Ce que vous n’avez pas autorisé reste fermé : rien ne s’écrit sans validation, rien de sensible ne sort.',
        },
      ],
      conclusion: ['Vous posez la question.', 'Le serveur va chercher la réponse dans vos outils.'],
    };
  }
  return {
    nom: 'Your MCP server',
    entrees: [
      { libelle: 'Your question', icone: 'message-circle' },
      { libelle: 'Your account', icone: 'user' },
      { libelle: 'Your permissions', icone: 'lock' },
    ],
    sorties: [
      { libelle: 'CRM', icone: 'users' },
      { libelle: 'Google Ads', icone: 'target' },
      { libelle: 'GA4', icone: 'bar-chart' },
      { libelle: 'BigQuery', icone: 'database' },
      { libelle: 'Gmail', icone: 'mail' },
      { libelle: 'Notion', icone: 'file-text' },
    ],
    retours: [
      { libelle: 'Sourced answer', icone: 'check-circle' },
      { libelle: 'Document created', icone: 'file-text' },
    ],
    gardes: ['Writes without approval', 'Sensitive data'],
    temps: [
      {
        titre: 'What you ask it',
        texte: 'A question in plain English, in Claude or ChatGPT. The server receives it with your account, and knows which tools you are allowed to call.',
      },
      {
        titre: 'What it fetches',
        texte: 'It picks the tool and queries it for you: the CRM, the campaigns, the analytics, the inbox. No more copy-pasting from one tab to another.',
      },
      {
        titre: 'What it gives back',
        texte: 'The answer comes back into the conversation, with its source. What you have not allowed stays closed: nothing is written without approval, nothing sensitive leaves.',
      },
    ],
    conclusion: ['You ask the question.', 'The server fetches the answer from your tools.'],
  };
}
