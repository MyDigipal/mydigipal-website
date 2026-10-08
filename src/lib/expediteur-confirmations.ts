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

/** Le texte de l'avertissement, en texte brut, adapté au formulaire. */
export function avertissementConfirmation(lang: 'fr' | 'en', formulaire: Formulaire): string {
  const a = EXPEDITEUR_CONFIRMATIONS;
  if (lang === 'fr') {
    const debut = formulaire === 'devis' ? `Votre devis vient de partir de ${a}.` : `Un email de confirmation vient de partir de ${a}.`;
    const fin = formulaire === 'audit' ? 'votre audit' : 'notre réponse';
    return `${debut} Si vous ne le voyez pas d’ici quelques minutes, regardez dans vos courriers indésirables et marquez-le comme sûr : c’est de cette adresse que vous recevrez ${fin}.`;
  }
  const debut = formulaire === 'devis' ? `Your quote has just been sent from ${a}.` : `A confirmation email has just been sent from ${a}.`;
  const fin = formulaire === 'audit' ? 'your audit' : 'our reply';
  return `${debut} If you don’t see it within a few minutes, check your spam folder and mark it as safe: that is the address ${fin} will come from.`;
}
