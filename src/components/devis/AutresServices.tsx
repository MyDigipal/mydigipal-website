/**
 * Dans le ticket d'un simulateur de page (formation, créa) : les autres services du devis du
 * visiteur, et le lien pour en ajouter (20/10/2026). Tout part dans le même devis.
 */
import type { Currency } from '@/components/calculator/types';
import { affiche, devis, domainName, type Lang, type QuoteState } from '@/components/calculator-v6/engine';

interface Props {
  lang: Lang;
  autres: QuoteState | null;
  devise: Currency;
  /** Avant d'aller au calculateur, le simulateur écrit ses réglages dans le devis. */
  avantDePartir: () => void;
}

export default function AutresServices({ lang, autres, devise, avantDePartir }: Props) {
  const fr = lang === 'fr';
  const q = autres ? devis(autres, devise) : null;
  const f = (v: number) => affiche(v, devise, lang);
  const montants = q
    ? [q.monthly > 0 ? `${f(q.monthly)}${fr ? '/mois' : '/mo'}` : '', q.oneOff > 0 ? `${f(q.oneOff)}${fr ? ' une fois' : ' one-off'}` : ''].filter(Boolean).join(' + ')
    : '';
  return (
    <div className="tf-autres">
      {q && q.domains.length > 0 && (
        <p>
          <span>{fr ? 'Aussi dans votre devis : ' : 'Also in your quote: '}<strong>{q.domains.map((d) => domainName(d.domain, lang)).join(', ')}</strong></span>
          {montants && <span className="tf-autres-montant">{montants}</span>}
        </p>
      )}
      <a href={`/${lang}/calculator${q && q.domains.length ? '' : '#ajouter'}`} onClick={avantDePartir}>
        {q && q.domains.length ? (fr ? 'Voir le devis complet' : 'See the full quote') : (fr ? '+ Ajouter un autre service' : '+ Add another service')}
      </a>
    </div>
  );
}
