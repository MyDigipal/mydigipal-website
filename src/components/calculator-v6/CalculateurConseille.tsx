/**
 * La page Calculateur depuis le 05/11/2026 : le conseiller IA d'abord, le calculateur classique
 * ensuite (direction A, choisie par Paul).
 *
 * Le calculateur classique est monté dès l'arrivée, caché tant que la conversation est à
 * l'écran : c'est lui qui reçoit le devis composé (événement `mdp-assistant:plan`), affiche la
 * page de résultat et envoie le devis, avec la même mesure qu'avant (`calculator_form_submit`,
 * origine `conseiller`).
 *
 * Un visiteur qui arrive avec une intention se voit servir directement le calculateur : un
 * devis dans l'adresse (`#plan=`, lien d'un mail), des services demandés (`?service=`), un panier
 * déjà composé sur une autre page, ou `#ajouter`.
 */
import { useEffect, useRef, useState } from 'react';
import type { Currency } from '../calculator/types';
import CalculatorV6 from './CalculatorV6';
import Conseiller, { type RemiseConseiller } from './Conseiller';
import { encodePlan, type Lang } from './engine';
import { lirePanier } from '@/lib/devis/panier';

interface Props {
  lang: Lang;
}

export default function CalculateurConseille({ lang }: Props) {
  const [vue, setVue] = useState<'conseiller' | 'classique' | null>(null);
  const haut = useRef<HTMLDivElement>(null);
  const currency: Currency = lang === 'en' ? 'USD' : 'EUR';

  useEffect(() => {
    const avecIntention =
      /[#&]plan=|^#ajouter/.test(window.location.hash) ||
      !!new URLSearchParams(window.location.search).get('service') ||
      !!lirePanier()?.st.domains.length;
    setVue(avecIntention ? 'classique' : 'conseiller');
  }, []);

  const versClassique = () => {
    setVue('classique');
    requestAnimationFrame(() => haut.current?.scrollIntoView({ block: 'start' }));
  };

  const remettre = (r: RemiseConseiller) => {
    setVue('classique');
    // Le calculateur est déjà monté : il reçoit le plan, son origine et l'audit prérempli.
    window.dispatchEvent(
      new CustomEvent('mdp-assistant:plan', {
        detail: {
          plan: encodePlan(r.st, r.currency),
          origine: { id: 'conseiller', libelle: lang === 'fr' ? 'le conseiller du calculateur' : 'the calculator advisor' },
          audit: r.audit,
        },
      })
    );
    requestAnimationFrame(() => haut.current?.scrollIntoView({ block: 'start' }));
  };

  return (
    <div ref={haut} className="scroll-mt-24">
      {vue === 'conseiller' && <Conseiller lang={lang} currency={currency} onClassique={versClassique} onRemettre={remettre} />}
      {/* Caché, pas démonté : il doit pouvoir recevoir le devis composé. */}
      <div hidden={vue !== 'classique'}>
        <CalculatorV6 lang={lang} />
      </div>
    </div>
  );
}
