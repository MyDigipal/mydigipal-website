import { useEffect, useRef, useState } from 'react';
import { jour30Copy } from './copy';
import type { Locale } from './data';
import Drapeau from './Drapeau';
import { SYMBOLE, type Devise } from './data';

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
// ⚠️ Les identifiants suivent ceux de LeCompte : `quinzaine-1` et `quinzaine-2`
// depuis le 01/09/2026. Les trois « niveau-n » ont survécu ici un soir entier
// après le passage en deux quinzaines : trois repères pointaient vers des ancres
// absentes, sans aucune erreur. Changer un id de section, c'est changer ici.
const REPERES: Array<{ id: string; cle: 'q1' | 'q2' | 'avis' | 'tarifs' }> = [
  { id: 'quinzaine-1', cle: 'q1' },
  { id: 'quinzaine-2', cle: 'q2' },
  { id: 'maison', cle: 'avis' },
  { id: 'pricing', cle: 'tarifs' },
];

/**
 * ⚠️ Les trois props ci-dessous sont OPTIONNELLES et n'existent que pour la
 * seconde page de vente (`/{lang}/academy-v2`), qui a d'autres sections et
 * d'autres ancres. Sans elles, la barre se comporte exactement comme avant :
 * la page en ligne n'est pas concernée.
 */
export default function Barre({
  locale,
  reperes,
  chemin = 'academy',
  ancreCta = 'pricing',
  devise,
  surDevise,
}: {
  locale: Locale;
  reperes?: Array<{ id: string; libelle: string }>;
  chemin?: string;
  ancreCta?: string;
  /**
   * La devise affichée, et de quoi en changer. Posé à côté du drapeau : c'est
   * là qu'on cherche ce qui dépend du pays (Paul, 07/09/2026). Sans ces deux
   * props, aucun sélecteur ne s'affiche.
   */
  devise?: Devise;
  surDevise?: (d: Devise) => void;
}) {
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
    const ids = reperes ? reperes.map((r) => r.id) : REPERES.map((r) => r.id);
    const cibles = () => ids.map((id) => document.getElementById(id));

    const mesure = () => {
      raf = 0;
      const doc = document.documentElement;
      const fin = document.getElementById(ancreCta);
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
  }, [c, reperes, ancreCta]);

  /**
   * Le menu du téléphone (Paul, 08/09) : « plutôt que d'avoir le titre en haut
   * où t'es obligé de scroller vers la droite, il devrait juste avoir trois
   * barres de menu ».
   *
   * ⚠️ Ce que ça remplace : la nav était en `overflow-x-auto`, donc sous lg les
   * repères défilaient latéralement dans une bande de quelques centimètres, et
   * le sélecteur de devise disparaissait purement et simplement sous md. Une
   * barre qui cache la moitié de ses commandes et demande un geste horizontal
   * pour voir le reste ne se découvre pas.
   */
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', auClavier);
    return () => window.removeEventListener('keydown', auClavier);
  }, [menu]);

  const listeReperes = reperes ?? REPERES.map((r) => ({ id: r.id, libelle: c.reperes[r.cle] }));

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-filet-nuit bg-salle/92 backdrop-blur" data-theme="nuit">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <a href={`/${locale}`} className="flex flex-none items-center gap-2.5" aria-label="MyDigipal">
          <img src="/images/Logos/03_Full white.png" alt="" width={140} height={40} className="h-7 w-auto" loading="eager" />
          <span className="hidden font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-brume-nuit sm:inline">{c.marque}</span>
        </a>

        <nav className="j30-barre-reperes -mx-1 hidden min-w-0 flex-1 items-center gap-1 px-1 lg:flex" aria-label={c.aria}>
          {listeReperes.map((r) => {
            const on = actif === r.id;
            return (
              <a
                key={r.id}
                href={`#${r.id}`}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.12em] transition duration-150 ${
                  on ? 'border-or bg-or text-salle' : 'border-filet-nuit text-corps-nuit hover:border-brume-nuit hover:text-ivoire'
                }`}
              >
                {r.libelle}
              </a>
            );
          })}
        </nav>

        <span ref={jourRef} className="ml-auto hidden flex-none font-ac-mono text-[11px] font-bold uppercase tracking-[0.14em] text-or transition-opacity duration-300 md:block" style={{ opacity: 0 }} />

        {devise && surDevise ? (
          <div className="hidden flex-none items-center overflow-hidden rounded-bouton border border-filet-nuit lg:flex">
            {(['EUR', 'GBP', 'USD'] as Devise[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => surDevise(d)}
                aria-pressed={d === devise}
                aria-label={d}
                className={`min-h-10 cursor-pointer border-0 px-2.5 font-ac-mono text-[12px] font-bold transition duration-150 ${
                  d === devise ? 'bg-or text-salle' : 'bg-transparent text-corps-nuit hover:text-ivoire'
                }`}
              >
                {SYMBOLE[d]}
              </button>
            ))}
          </div>
        ) : null}

        <a
          href={`/${autre}/${chemin}${ancre}`}
          hrefLang={autre}
          aria-label={c.langueAria}
          title={c.langueAria}
          className="hidden min-h-10 flex-none items-center gap-2 rounded-bouton border border-filet-nuit px-2.5 font-ac-mono text-[11px] font-bold uppercase tracking-[0.1em] text-corps-nuit transition duration-150 hover:border-brume-nuit hover:text-ivoire lg:flex"
        >
          <Drapeau locale={autre} />
          <span className="hidden md:inline">{c.langue}</span>
        </a>

        {/* Le bouton du menu, sous lg seulement. */}
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-expanded={menu}
          aria-controls="barre-menu"
          aria-label={menu ? c.menuFermer : c.menuOuvrir}
          className="ml-auto grid h-11 w-11 flex-none cursor-pointer place-items-center rounded-bouton border border-filet-nuit bg-transparent text-corps-nuit transition hover:border-brume-nuit hover:text-ivoire lg:hidden"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>

        {/* Sous lg, l'appel vit en bas à droite (`AppelFlottant`), là où arrive
            le pouce. Ici il était de toute façon tronqué dès que « Jour n / 30 »
            s'affichait à côté : sur un écran de 390 px, les deux ne tiennent pas. */}
        <a
          href={`#${ancreCta}`}
          className="hidden min-h-10 flex-none items-center whitespace-nowrap rounded-bouton bg-or px-4 py-2 text-[14px] font-semibold text-salle transition duration-150 hover:bg-or-vif lg:inline-flex"
        >
          {c.cta}
        </a>
      </div>
      {/* Le panneau, sous la barre. Il porte TOUT ce que la barre ne montre plus
          sous lg : les sections, la langue, la devise, et l'appel à l'action.
          ⚠️ Il se ferme au choix d'une section, sinon il masquerait justement
          celle qu'on vient de demander. */}
      {menu ? (
        <div
          id="barre-menu"
          className="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-filet-nuit bg-salle px-4 pb-5 pt-4 shadow-[0_18px_40px_-18px_rgba(0,0,0,.8)] sm:px-6 lg:hidden"
        >
          <p className="m-0 mb-2.5 font-ac-mono text-[10.5px] font-bold uppercase tracking-[.16em] text-brume-nuit">
            {c.menuSections}
          </p>
          <nav className="flex flex-col gap-1.5" aria-label={c.aria}>
            {listeReperes.map((r) => (
              <a
                key={r.id}
                href={`#${r.id}`}
                onClick={() => setMenu(false)}
                className={`flex min-h-11 items-center rounded-[10px] border px-3.5 font-ac-mono text-[12px] font-bold uppercase tracking-[.12em] transition ${
                  actif === r.id
                    ? 'border-or bg-or text-salle'
                    : 'border-filet-nuit text-corps-nuit hover:border-brume-nuit hover:text-ivoire'
                }`}
              >
                {r.libelle}
              </a>
            ))}
          </nav>

          <a
            href={`#${ancreCta}`}
            onClick={() => setMenu(false)}
            className="mt-3.5 flex min-h-12 items-center justify-center rounded-bouton bg-or px-4 text-[15px] font-semibold text-salle transition hover:bg-or-vif"
          >
            {c.cta}
          </a>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-filet-nuit pt-4">
            <div>
              <p className="m-0 mb-2 font-ac-mono text-[10.5px] font-bold uppercase tracking-[.16em] text-brume-nuit">
                {c.menuLangue}
              </p>
              <a
                href={`/${autre}/${chemin}${ancre}`}
                hrefLang={autre}
                aria-label={c.langueAria}
                className="flex min-h-11 items-center gap-2.5 rounded-bouton border border-filet-nuit px-3.5 font-ac-mono text-[12px] font-bold uppercase tracking-[.1em] text-corps-nuit transition hover:border-brume-nuit hover:text-ivoire"
              >
                <Drapeau locale={autre} />
                {c.langue}
              </a>
            </div>

            {devise && surDevise ? (
              <div>
                <p className="m-0 mb-2 font-ac-mono text-[10.5px] font-bold uppercase tracking-[.16em] text-brume-nuit">
                  {c.menuDevise}
                </p>
                <div className="flex items-center overflow-hidden rounded-bouton border border-filet-nuit">
                  {(['EUR', 'GBP', 'USD'] as Devise[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => surDevise(d)}
                      aria-pressed={d === devise}
                      aria-label={d}
                      className={`min-h-11 w-12 cursor-pointer border-0 font-ac-mono text-[13px] font-bold transition ${
                        d === devise ? 'bg-or text-salle' : 'bg-transparent text-corps-nuit hover:text-ivoire'
                      }`}
                    >
                      {SYMBOLE[d]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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
