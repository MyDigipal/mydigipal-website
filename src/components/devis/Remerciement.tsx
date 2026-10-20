/**
 * Ce que voit le visiteur une fois son devis envoyé depuis un simulateur de page (21/10/2026).
 * Paul : remercier, et lui dire de regarder TOUT DE SUITE dans ses spams, quel que soit le
 * formulaire. Le texte des spams est le même partout (`lib/expediteur-confirmations.ts`).
 */
import { avertissementConfirmation } from '@/lib/expediteur-confirmations';

export default function Remerciement({ lang, prenom, suite }: { lang: 'fr' | 'en'; prenom: string; suite: string }) {
  const p = prenom.trim().split(/\s+/)[0];
  return (
    <div className="tf-merci" role="status">
      <p className="tf-merci-titre">{lang === 'fr' ? `Merci${p ? ` ${p}` : ''} !` : `Thank you${p ? `, ${p}` : ''}!`}</p>
      <p>{suite}</p>
      <p className="tf-merci-spam">{avertissementConfirmation(lang, 'devis')}</p>
    </div>
  );
}
