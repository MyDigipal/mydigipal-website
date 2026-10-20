/**
 * Le lien entre un simulateur de page (formation, créa) et le devis unique (20/10/2026).
 *
 * Le simulateur garde son interface et son moteur ; il écrit ses réglages dans le panier (au
 * format du calculateur, réponses `tr-*` ou `cr-*`), reprend ceux d'une visite précédente, et
 * montre les autres services du devis. Son envoi est celui du calculateur (`envoyerDevis`).
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Currency, ServiceDomain } from '@/components/calculator/types';
import { emptyState, type Answers, type QuoteState } from '@/components/calculator-v6/engine';
import { avecServices, ecouterPanier, ecrirePanier, lirePanier, type Panier } from './panier';

export function usePanierSimulateur(domaine: ServiceDomain, actif: boolean) {
  const moi = useId();
  const panier = useRef<Panier | null>(null);
  const [autres, setAutres] = useState<QuoteState | null>(null);

  const garder = useCallback((p: Panier | null) => {
    panier.current = p;
    const reste = p ? p.st.domains.filter((d) => d !== domaine) : [];
    setAutres(p && reste.length ? { ...p.st, domains: reste } : null);
  }, [domaine]);

  useEffect(() => {
    if (!actif) return;
    garder(lirePanier());
    return ecouterPanier(moi, garder);
  }, [actif, moi, garder]);

  /** Le devis complet avec les réglages du simulateur : ce qui part à l'envoi. */
  const complet = useCallback((reponses: Answers): QuoteState => {
    const base = panier.current?.st ?? emptyState();
    const st = avecServices(base, [domaine]);
    return { ...st, answers: { ...st.answers, ...reponses } };
  }, [domaine]);

  /** Écrit les réglages du simulateur dans le devis (au premier geste, puis à chaque changement). */
  const synchroniser = useCallback((reponses: Answers, devise: Currency) => {
    const st = complet(reponses);
    panier.current = { st, devise };
    ecrirePanier(st, devise, moi);
  }, [complet, moi]);

  /** Les réglages d'une visite précédente, s'il y en a pour ce service. */
  const reprise = useCallback((): Panier | null => {
    const p = lirePanier();
    return p && p.st.domains.includes(domaine) ? p : null;
  }, [domaine]);

  return { autres, complet, synchroniser, reprise };
}
