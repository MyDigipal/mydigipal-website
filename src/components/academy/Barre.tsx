import { useEffect, useRef, useState } from 'react';
import { jour30Copy } from './copy';
import type { Locale } from './data';
import Drapeau from './Drapeau';

/**
 * La barre de la page Academy, à la place du menu du site.
 *
 * Retour d'Alexandre du 27/08/2026, retenu par Paul : une page de conversion
 * à un seul objectif n'a pas besoin des sept sorties du menu (Services, AI,
 * Automotive, Case Studies, Blog, Client Login, Contact), et la frise à points
 * du récit promettait une navigation qu'elle ne tenait pas. Donc une barre
 * fine, collée en haut : le logo, cinq repères cliquables (Niveau 1, 2, 3,
 * Avis, Tarifs), une ligne de progression de lecture, « Jour n / 30 » quand
 * on est dans le récit, et le bouton d'achat. Sur mobile : logo, ligne de
 * progression, jour, bouton. Les repères restent accessibles au doigt en
 * défilement horizontal.
 *
 * Tout se pilote à la position, hors de React (écouteur passif, une image par
 * trame), comme le rail du récit : rien n'est mis en cache, la page peut
 * changer de hauteur (replis, images) sans casser la lecture.
 */
const REPERES: Array<{ id: string; cle: 'n1' | 'n2' | 'n3' | 'avis' | 'tarifs' }> = [
  { id: 'niveau-1', cle: 'n1' },
  { id: 'niveau-2', cle: 'n2' },
  { id: 'niveau-3', cle: 'n3' },
  { id: 'maison', cle: 'avis' },
  { id: 'pricing', cle: 'tarifs' },
];

export default function Barre({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).barre;
  const fill = useRef<HTMLSpanElement>(null);
  const jourRef = useRef<HTMLSpanElement>(null);
  const [actif, setActif] = useState<string | null>(null);

  // Le sélecteur de langue emmène à l'endroit où l'on se trouve, pas en haut de
  // la page traduite : quelqu'un qui bascule depuis les tarifs veut les tarifs.
  // Le hash est relu à chaque changement plutôt que capté au clic, pour que le
  // lien reste un vrai lien (clic du milieu, ouverture dans un onglet).
  const autre: Locale = locale === 'fr' ? 'en' : 'fr';
  const [ancre, setAncre] = useState('');
  useEffect(() => {
    const maj = () => setAncre(window.location.hash || '');
    maj();
    window.addEventListener('hashchange', maj);
    return () => window.removeEventListener('hashchange', maj);
  }, []);

  useEffect(() => {
    let raf = 0;
    const jours = () => Array.from(document.querySelectorAll<HTMLElement>('[data-jour]'));
    const cibles = () => REPERES.map((r) => document.getElementById(r.id));

    const mesure = () => {
      raf = 0;
      const doc = document.documentElement;
      const fin = document.getElementById('pricing');
      const finTop = fin ? fin.getBoundingClientRect().top + window.scrollY : doc.scrollHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, window.scrollY / Math.max(1, finTop - 80)));
      if (fill.current) fill.current.style.transform = `scaleX(${p})`;

      // Le jour en cours : le dernier repère de jour passé sous la barre, et
      // rien une fois le récit fini (dès que « qui enseigne » est passé).
      let jour = 0;
      const maison = document.getElementById('maison');
      const recitFini = !!maison && maison.getBoundingClientRect().top <= 120;
      if (!recitFini) {
        for (const el of jours()) {
          if (el.getBoundingClientRect().top <= 120) jour = Number(el.dataset.jour) || jour;
          else break;
        }
      }
      if (jourRef.current) {
        jourRef.current.textContent = jour > 0 ? c.jour(jour) : '';
        jourRef.current.style.opacity = jour > 0 ? '1' : '0';
      }

      // Le repère actif : le dernier dont le haut est passé.
      let courant: string | null = null;
      cibles().forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= 140) courant = REPERES[i].id;
      });
      setActif((prev) => (prev === courant ? prev : courant));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(mesure);
    };
    mesure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [c]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-filet-nuit bg-salle/92 backdrop-blur" data-theme="nuit">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <a href={`/${locale}`} className="flex flex-none items-center gap-2.5" aria-label="MyDigipal">
          <img src="/images/Logos/03_Full white.png" alt="" width={140} height={40} className="h-7 w-auto" loading="eager" />
          <span className="hidden font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-brume-nuit sm:inline">{c.marque}</span>
        </a>

        <nav className="j30-barre-reperes -mx-1 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 md:flex" aria-label={c.aria}>
          {REPERES.map((r) => {
            const on = actif === r.id;
            return (
              <a
                key={r.id}
                href={`#${r.id}`}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.12em] transition duration-150 ${
                  on ? 'border-or bg-or text-salle' : 'border-filet-nuit text-corps-nuit hover:border-brume-nuit hover:text-ivoire'
                }`}
              >
                {c.reperes[r.cle]}
              </a>
            );
          })}
        </nav>

        <span ref={jourRef} className="ml-auto flex-none font-ac-mono text-[11px] font-bold uppercase tracking-[0.14em] text-or transition-opacity duration-300" style={{ opacity: 0 }} />

        <a
          href={`/${autre}/academy${ancre}`}
          hrefLang={autre}
          aria-label={c.langueAria}
          title={c.langueAria}
          className="flex min-h-10 flex-none items-center gap-2 rounded-bouton border border-filet-nuit px-2.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.1em] text-corps-nuit transition duration-150 hover:border-brume-nuit hover:text-ivoire"
        >
          <Drapeau locale={autre} />
          {c.langue}
        </a>

        {/* Sous lg, l'appel vit en bas à droite (`AppelFlottant`), là où arrive
            le pouce. Ici il était de toute façon tronqué dès que « Jour n / 30 »
            s'affichait à côté : sur un écran de 390 px, les deux ne tiennent pas. */}
        <a
          href="#pricing"
          className="hidden min-h-10 flex-none items-center whitespace-nowrap rounded-bouton bg-or px-4 py-2 text-[14px] font-semibold text-salle transition duration-150 hover:bg-or-vif lg:inline-flex"
        >
          {c.cta}
        </a>
      </div>
      <span className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-filet-nuit" aria-hidden="true">
        <span
          ref={fill}
          className="block h-full w-full origin-left bg-gradient-to-r from-or to-or-vif"
          style={{ transform: 'scaleX(0)' }}
        />
      </span>
    </header>
  );
}
