/**
 * La demande d'audit gratuit (Paul, 08/10/2026) : les textes du bouton, du formulaire et
 * de la page `/{lang}/automotive/audit`, en un seul endroit.
 *
 * Le formulaire poste sur `https://academy.mydigipal.com/api/site/audit` (dépôt
 * mydigipal-academy) : contact dans le CRM (source `audit-request`), courriel au visiteur
 * et à Paul, bulle « Website Chat », Lead Meta côté serveur. Les codes de budget sont
 * ceux de `TRANCHES_BUDGET` dans `src/lib/site/audit-mails.ts` de ce dépôt-là : changer
 * une tranche, c'est changer les deux fichiers.
 */
import type { Language } from '@/i18n/config';

export const ENDPOINT_AUDIT = 'https://academy.mydigipal.com/api/site/audit';

/** L'adresse de la page, identique dans les deux langues (comme `/contact` et `/calculator`). */
export const pageAudit = (lang: Language) => `/${lang}/automotive/audit`;

export const TRANCHES: { code: string; fr: string; en: string }[] = [
  { code: 'moins-1k', fr: 'Moins de 1 000 €', en: 'Under €1,000' },
  { code: '1k-2k', fr: '1 000 à 2 000 €', en: '€1,000 to €2,000' },
  { code: '2k-4k', fr: '2 000 à 4 000 €', en: '€2,000 to €4,000' },
  { code: '4k-7k', fr: '4 000 à 7 000 €', en: '€4,000 to €7,000' },
  { code: 'plus-7k', fr: 'Plus de 7 000 €', en: 'Over €7,000' },
];

const FR = {
  bouton: 'Demandez votre audit gratuit',
  boutonCourt: 'Audit gratuit',
  sousBouton: 'Votre publicité, votre SEO et nos recommandations, sous 24 h.',
  form: {
    titre: 'Demandez votre audit gratuit',
    chapo: 'Une étude de votre publicité sur l’année, du référencement de votre site, et les actions qu’on vous recommande. Gratuit, envoyé sous 24 h.',
    groupe: 'Groupe ou concession',
    groupeAide: 'Par exemple le nom de votre groupe, ou de votre concession et sa ville.',
    email: 'E-mail où recevoir l’audit',
    facultatif: 'facultatif',
    budget: 'Budget marketing digital mensuel, tout compris',
    budgetAide: 'Publicité, agence et outils. Il nous aide à proposer des actions à votre échelle.',
    budgetVide: 'Je préfère ne pas le dire',
    message: 'Ce que vous voulez nous dire, ou qu’on approfondisse',
    messagePlaceholder: 'Une marque, un site, une campagne qui vous pose question...',
    envoyer: 'Recevoir mon audit',
    envoi: 'Envoi en cours',
    rgpd: 'Ces informations servent uniquement à préparer et vous envoyer votre audit.',
    rgpdLien: 'Politique de confidentialité',
    erreurs: {
      groupe: 'Indiquez le nom de votre groupe ou de votre concession.',
      email: 'Cette adresse ne semble pas valide.',
      envoi: 'L’envoi n’a pas abouti. Réessayez, ou écrivez à paul@mydigipal.com.',
      trop: 'Trop de demandes depuis cette connexion. Réessayez dans quelques minutes.',
    },
    merciTitre: 'On vous envoie votre audit sous 24 h',
    /** `{email}` est remplacé dans le navigateur par l'adresse saisie. */
    merciTexte: 'Il arrivera à {email}.',
    fermer: 'Fermer',
  },
};

const EN: typeof FR = {
  bouton: 'Get your free audit',
  boutonCourt: 'Free audit',
  sousBouton: 'Your advertising, your SEO and our recommendations, within 24 hours.',
  form: {
    titre: 'Get your free audit',
    chapo: 'A study of your advertising over the year, of your website’s SEO, and the actions we recommend. Free, sent within 24 hours.',
    groupe: 'Dealer group or dealership',
    groupeAide: 'For example your group’s name, or your dealership and its town.',
    email: 'Email to receive the audit',
    facultatif: 'optional',
    budget: 'Monthly digital marketing budget, all in',
    budgetAide: 'Advertising, agency and tools. It helps us suggest actions at your scale.',
    budgetVide: 'I would rather not say',
    message: 'Anything you want to tell us, or want us to look into',
    messagePlaceholder: 'A brand, a website, a campaign you have questions about...',
    envoyer: 'Get my audit',
    envoi: 'Sending',
    rgpd: 'This information is only used to prepare and send your audit.',
    rgpdLien: 'Privacy policy',
    erreurs: {
      groupe: 'Enter the name of your dealer group or dealership.',
      email: 'This email address does not look valid.',
      envoi: 'Sending failed. Try again, or write to paul@mydigipal.com.',
      trop: 'Too many requests from this connection. Try again in a few minutes.',
    },
    merciTitre: 'Your audit arrives within 24 hours',
    merciTexte: 'It will go to {email}.',
    fermer: 'Close',
  },
};

export const textesAudit = (lang: Language) => (lang === 'fr' ? FR : EN);
