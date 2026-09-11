import { useCallback, useEffect, useRef, useState } from 'react';
import { pointeurGrossier, reducedMotion } from '../academy/motion';
import type { Ecran, Point } from './types';

/**
 * La console de l'outil : ses vrais écrans, et ce que la formation en fait.
 *
 * C'est la section qui empêche les quatre pages outils d'être quatre fois la
 * même page : les écrans de Claude, de Copilot, de ChatGPT et de Gemini n'ont
 * rien en commun. Elle reprend le principe de la visite de l'espace apprenant
 * (`academy/Visite.tsx`) : on désigne un élément, un panneau le décrit, et le
 * reste de l'écran s'efface un peu.
 *
 * Deux différences avec la visite, voulues :
 *   - l'écran n'est pas refait en HTML, c'est une CAPTURE RÉELLE de l'outil.
 *     Une page qui prétend connaître Copilot et qui dessine un faux Word ne
 *     tient pas dix secondes devant quelqu'un qui l'utilise ;
 *   - pas de visite automatique. La page de vente en a déjà une, et deux
 *     démonstrations qui se jouent seules sur la même page se disputent le
 *     regard.
 *
 * ÉTAT DE REPOS = ÉTAT VISIBLE : sans JavaScript, sans souris et sans
 * mouvement, l'écran s'affiche entier et le panneau porte le propos de la
 * section. Les repères ne cachent rien d'essentiel.
 */
export default function Console({
  ecrans,
  indices,
}: {
  ecrans: Ecran[];
  /**
   * Un libellé par écran, déjà composé.
   *
   * ⚠️ PAS une fonction. Les propriétés d'un îlot Astro traversent une
   * sérialisation JSON : passer `(n) => string` compile, passe le build, et
   * casse l'hydratation en production avec « m is not a function ». Vu le
   * 11/09/2026 sur cette même console.
   */
  indices: string[];
}) {
  const [iEcran, setIEcran] = useState(0);
  const [actif, setActif] = useState<number | null>(null);
  const [tactile, setTactile] = useState(false);
  const [calme, setCalme] = useState(false);
  const zone = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTactile(pointeurGrossier());
    setCalme(reducedMotion());
  }, []);

  const ecran = ecrans[iEcran];
  const point: Point | null = actif === null ? null : ecran.points[actif];
  const fiche = point ?? ecran.repos;

  const choisir = useCallback((i: number) => {
    setIEcran(i);
    setActif(null);
  }, []);

  return (
    <div>
      {/* Les capacités, en onglets. Sur téléphone elles s'empilent : trois
          libellés côte à côte sur 390 px donneraient trois mots coupés. */}
      <div className="grid gap-2.5 sm:grid-cols-3" role="tablist" aria-label={ecran.onglet}>
        {ecrans.map((e, i) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            aria-selected={i === iEcran}
            onClick={() => choisir(i)}
            onMouseEnter={() => !tactile && choisir(i)}
            className={[
              'min-h-11 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200',
              i === iEcran
                ? 'border-or bg-or/10'
                : 'border-filet-nuit hover:border-brume-nuit',
            ].join(' ')}
          >
            <b className={['block font-semibold', i === iEcran ? 'text-or-vif' : 'text-ivoire'].join(' ')}>
              {e.onglet}
            </b>
            <span className="mt-0.5 block text-[13.5px] leading-snug text-brume-nuit">{e.ongletTexte}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div
          ref={zone}
          className="relative overflow-hidden rounded-carte border border-filet-nuit bg-[#0a0f1c] leading-[0]"
        >
          <img
            src={ecran.image}
            alt={ecran.alt}
            width={1160}
            height={880}
            loading="lazy"
            decoding="async"
            className={[
              'block h-auto w-full transition-opacity duration-300',
              point ? 'opacity-55' : 'opacity-100',
            ].join(' ')}
          />
          {ecran.points.map((p, i) => (
            <button
              key={p.titre}
              type="button"
              aria-label={p.titre}
              aria-pressed={actif === i}
              onMouseEnter={() => !tactile && setActif(i)}
              onFocus={() => setActif(i)}
              onClick={() => setActif(actif === i ? null : i)}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              className={[
                'absolute -ml-[13px] -mt-[13px] hidden h-[26px] w-[26px] items-center justify-center lg:flex',
                'rounded-full border p-0 transition-all duration-200',
                actif === i
                  ? 'scale-125 border-or bg-or/35'
                  : 'border-or/55 bg-or/15 hover:scale-125 hover:bg-or/35',
              ].join(' ')}
            >
              <span className="block h-[7px] w-[7px] rounded-full bg-or" />
              {!calme && i === 0 && actif === null && (
                <span className="pointer-events-none absolute -inset-2 rounded-full border border-or/45 motion-safe:animate-[halo_2.6s_ease-out_infinite]" />
              )}
            </button>
          ))}
        </div>

        {/* La fiche RESTE : elle ne change qu'au survol d'un autre repère.
            Une fiche qui se vide dès que la souris quitte la zone oblige à
            désigner et lire en même temps (leçon de la visite, 29/08/2026). */}
        <aside className="self-start rounded-carte border border-filet-nuit bg-salle-2 px-5 py-4.5">
          <p className="mb-2 font-ac-mono text-[10.5px] uppercase tracking-[0.16em] text-or-texte">
            {ecran.onglet}
          </p>
          <h3 className="mb-2 text-base font-semibold text-ivoire">{fiche.titre}</h3>
          <p className="mb-2.5 text-[14.5px] text-corps-nuit">{fiche.texte}</p>
          <p className="m-0 border-t border-filet-nuit pt-2.5 text-[13px] text-brume-nuit">{fiche.lecon}</p>
        </aside>
      </div>

      {/* Sur téléphone, les repères deviennent une liste. La capture y fait
          340 px de large : une pastille de 26 px désignerait un détail que
          personne ne peut lire. Le texte, lui, se lit, et il s'indexe. */}
      <ul className="mt-4 grid list-none gap-2.5 p-0 lg:hidden">
        {ecran.points.map((p) => (
          <li key={p.titre} className="rounded-xl border border-filet-nuit bg-salle-2 px-4 py-3.5">
            <b className="block text-[15px] font-semibold text-ivoire">{p.titre}</b>
            <span className="mt-1 block text-[14px] text-corps-nuit">{p.texte}</span>
            <span className="mt-2 block text-[12.5px] text-brume-nuit">{p.lecon}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3.5 hidden text-right font-ac-mono text-[11.5px] text-brume-nuit lg:block">
        {indices[iEcran]}
      </p>
    </div>
  );
}
