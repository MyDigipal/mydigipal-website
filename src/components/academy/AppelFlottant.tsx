import { useEffect, useRef, useState } from 'react';
import { jour30Copy } from './copy';
import type { Locale } from './data';
import { useLienApp } from './track';

/**
 * Le bouton qui suit le visiteur, au doigt.
 *
 * Demande de Paul du 29/08/2026 : « sur mobile, il faudrait qu'il y ait un
 * petit call to action quand même, qui suive l'utilisateur en bas à droite ;
 * comme ça, si à tout moment ils veulent savoir comment ouvrir leur compte,
 * ils peuvent le faire. Et l'option de commencer sans paiement. »
 *
 * En bas à droite, et pas en haut : la page fait vingt écrans de long sur un
 * téléphone, et c'est le pouce qui décide. Le bouton de la barre du haut est
 * retiré sous `lg` en échange — deux « Ouvrir mon compte » simultanés à
 * l'écran, c'est une hésitation, pas une insistance — et cela règle au passage
 * son texte tronqué quand « Jour n / 30 » s'affiche à côté.
 *
 * Deux liens plutôt qu'un : l'accès gratuit est une réponse à une objection
 * (« je ne veux pas payer pour voir »), et une objection se traite là où elle
 * naît, pas au bout d'un menu qu'il faut penser à ouvrir.
 *
 * Il s'efface à deux endroits, et pour la même raison : ne jamais répéter au
 * doigt ce que l'écran propose déjà. Dans le hero, les deux mêmes boutons sont
 * en clair. Dans les tarifs, la barre de total est déjà collée en bas et il
 * lui passerait dessus.
 */
export default function AppelFlottant({ locale, leconsGratuites }: { locale: Locale; leconsGratuites: number }) {
  const c = jour30Copy(locale).flottant;
  const [visible, setVisible] = useState(false);
  const boite = useRef<HTMLDivElement>(null);
  const gratuit = useLienApp(`https://academy.mydigipal.com${locale === 'fr' ? '/fr' : ''}/start`);

  useEffect(() => {
    const zones = ['academy-hero', 'pricing'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!zones.length || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const couvertes = new Set<Element>();
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting) couvertes.add(e.target);
          else couvertes.delete(e.target);
        }
        setVisible(couvertes.size === 0);
      },
      // Une marge basse négative : les tarifs ne « couvrent » qu'une fois
      // vraiment entrés dans l'écran, sinon le bouton clignote au moment où
      // leur première bordure affleure.
      { rootMargin: '0px 0px -25% 0px' }
    );
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={boite}
      aria-label={c.aria}
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 transition-[opacity,transform] duration-300 lg:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {/* Le libellé gratuit reste en bas de casse, sans le mono espacé du
          reste de la page : en capitales, il était plus large que le bouton
          d'achat, et deux pastilles larges collées au bord mangent quatre
          lignes du texte qu'on est en train de lire. */}
      <a
        href={gratuit}
        className="inline-flex min-h-9 items-center rounded-bouton border border-or/45 bg-salle/95 px-3 text-[12.5px] font-medium text-or backdrop-blur"
      >
        {c.gratuit(leconsGratuites)}
      </a>
      <a
        href="#pricing"
        className="inline-flex min-h-12 items-center rounded-bouton bg-or px-4 text-[14.5px] font-semibold text-salle shadow-[0_14px_34px_-12px_rgba(0,0,0,0.85)]"
      >
        {c.cta}
      </a>
    </div>
  );
}
