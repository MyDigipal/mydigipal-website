/**
 * L'adresse d'où partent les e-mails de confirmation des formulaires du site (devis du
 * calculateur, contact, audit gratuit), annoncée sur les trois écrans de confirmation
 * (Paul, 08/10/2026) pour que le visiteur la retrouve dans ses indésirables et la marque
 * comme sûre.
 *
 * ⚠️ Elle doit rester celle que le visiteur reçoit vraiment. L'app Academy envoie par le SMTP
 * de marketing@mydigipal.com avec l'expéditeur paul@mydigipal.com ; Gmail ne le garde que si
 * paul@ est une adresse « Send mail as » vérifiée du compte marketing@ (sinon le visiteur voit
 * marketing@). Vérifié le 08/10/2026 : l'alias n'existait pas encore.
 */
export const EXPEDITEUR_CONFIRMATIONS = 'paul@mydigipal.com';

type Formulaire = 'audit' | 'devis' | 'contact';

/**
 * Le texte de l'avertissement, en texte brut, adapté au formulaire. Paul, 21/10/2026 : « il faut
 * leur dire de vérifier dans leurs spams tout de suite, parce que parfois on peut être passé
 * dans les spams. Quel que soit le formulaire. » Donc tout de suite, pas « dans quelques minutes ».
 */
export function avertissementConfirmation(lang: 'fr' | 'en', formulaire: Formulaire): string {
  const a = EXPEDITEUR_CONFIRMATIONS;
  if (lang === 'fr') {
    const debut = formulaire === 'devis' ? `Votre devis vient de partir de ${a}.` : `Un email de confirmation vient de partir de ${a}.`;
    const fin = formulaire === 'audit' ? 'votre audit' : 'notre réponse';
    return `${debut} Regardez tout de suite dans vos courriers indésirables : il arrive parfois là. S’il y est, marquez-le comme sûr, c’est de cette adresse que viendra ${fin}.`;
  }
  const debut = formulaire === 'devis' ? `Your quote has just been sent from ${a}.` : `A confirmation email has just been sent from ${a}.`;
  const fin = formulaire === 'audit' ? 'your audit' : 'our reply';
  return `${debut} Check your spam folder right away: it sometimes lands there. If it does, mark it as safe, that is the address ${fin} will come from.`;
}
