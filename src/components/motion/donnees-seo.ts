/**
 * Le LLMO expliqué par la carte de verre (`CarteVerre.astro`), sur la page SEO : ce qu'un
 * assistant IA lit avant de répondre, ce qu'il cite, et ce qu'il laisse de côté. C'est la
 * notion difficile de la page : on n'optimise plus seulement pour un classement, mais pour
 * être la source qu'une réponse nomme.
 *
 * Aucun chiffre. Les sources nommées sont des exemples de ce qu'un assistant peut lire.
 */
import type { Language } from '@/i18n/config';
import type { CarteMcp } from './donnees-mcp';

export function carteLlmo(lang: Language): CarteMcp {
  if (lang === 'fr') {
    return {
      nom: 'L’assistant IA',
      entrees: [
        { libelle: 'La question', icone: 'message-circle' },
        { libelle: 'Le contexte', icone: 'user' },
        { libelle: 'Le web', icone: 'globe' },
      ],
      sorties: [
        { libelle: 'Votre site', icone: 'globe' },
        { libelle: 'Données structurées', icone: 'code' },
        { libelle: 'Encyclopédies', icone: 'book-open' },
        { libelle: 'Annuaires', icone: 'layers' },
        { libelle: 'Presse', icone: 'file-text' },
        { libelle: 'Avis', icone: 'star' },
      ],
      retours: [
        { libelle: 'Réponse citée', icone: 'check-circle' },
        { libelle: 'Votre marque nommée', icone: 'award' },
      ],
      gardes: ['Contenu non extractible', 'Pages sans structure'],
      temps: [
        {
          titre: 'La question arrive',
          texte: 'Un acheteur demande à ChatGPT ou à Perplexity quel prestataire choisir. L’assistant part chercher des sources qu’il peut lire et citer.',
        },
        {
          titre: 'Ce qu’il va lire',
          texte: 'Il parcourt les pages, les données structurées, les annuaires et les encyclopédies. Ce qui est clair, factuel et balisé se laisse extraire.',
        },
        {
          titre: 'Ce qu’il cite',
          texte: 'La réponse nomme les sources qui répondaient le mieux. Un contenu sans structure ni définition claire reste de côté : c’est ce que corrige le LLMO.',
        },
      ],
      conclusion: ['L’acheteur pose la question.', 'Le LLMO fait en sorte que la réponse vous cite.'],
    };
  }
  return {
    nom: 'The AI assistant',
    entrees: [
      { libelle: 'The question', icone: 'message-circle' },
      { libelle: 'The context', icone: 'user' },
      { libelle: 'The web', icone: 'globe' },
    ],
    sorties: [
      { libelle: 'Your site', icone: 'globe' },
      { libelle: 'Structured data', icone: 'code' },
      { libelle: 'Encyclopedias', icone: 'book-open' },
      { libelle: 'Directories', icone: 'layers' },
      { libelle: 'Press', icone: 'file-text' },
      { libelle: 'Reviews', icone: 'star' },
    ],
    retours: [
      { libelle: 'Cited answer', icone: 'check-circle' },
      { libelle: 'Your brand named', icone: 'award' },
    ],
    gardes: ['Unextractable content', 'Pages without structure'],
    temps: [
      {
        titre: 'The question comes in',
        texte: 'A buyer asks ChatGPT or Perplexity which provider to choose. The assistant goes looking for sources it can read and cite.',
      },
      {
        titre: 'What it reads',
        texte: 'It goes through pages, structured data, directories and encyclopedias. What is clear, factual and marked up can be extracted.',
      },
      {
        titre: 'What it cites',
        texte: 'The answer names the sources that answered best. Content with no structure or clear definitions is left aside: that is what LLMO fixes.',
      },
    ],
    conclusion: ['The buyer asks the question.', 'LLMO makes sure the answer cites you.'],
  };
}
