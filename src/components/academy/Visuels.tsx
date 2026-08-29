import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * Les mises en scène du produit, en bande, au-dessus des écrans filmés.
 *
 * Huit images faites par Paul le 29/08/2026, sources et réserves dans
 * `mydigipal-academy/creatives/visuels/`. Elles ne remplacent pas les
 * enregistrements : ceux-ci montrent le produit qui tourne, celles-ci montrent
 * à quoi ressemble une matinée avec. Les deux se répondent, et c'est pour ça
 * qu'elles vivent dans la même section.
 *
 * ⚠️ **Elles restent visibles sur mobile**, contrairement à la galerie
 * d'enregistrements : ce sont des photographies, elles se lisent à toute
 * taille, alors qu'une capture d'interface d'ordinateur réduite à 350 px ne
 * dit plus rien. C'est ce qui redonne un contenu à cette section au téléphone.
 *
 * ⚠️ Les chiffres qu'on devine sur les écrans de ces images sont INVENTÉS (le
 * modèle a imaginé l'interface). Paul a tranché le 29/08 : à cette taille on ne
 * les lit pas. Ne jamais en agrandir une au point de les rendre lisibles, et ne
 * jamais accoler un nom ou une citation aux deux images qui montrent une
 * personne — ces visages sont générés, ils illustrent, ils ne témoignent pas.
 */
const BANDE: Array<{ nom: string; ratio: string; part: string; petit: string }> = [
  { nom: 'portable-cartes-neutres_paysage', ratio: 'aspect-[1734/907]', part: 'lg:col-span-8', petit: 'col-span-2' },
  { nom: 'apprenante-cartes_portrait', ratio: 'aspect-[1070/1470]', part: 'lg:col-span-4', petit: 'col-span-2' },
  { nom: 'cartes-flottantes_carre', ratio: 'aspect-square', part: 'lg:col-span-3', petit: 'col-span-1' },
  { nom: 'tablette-carnet_carre', ratio: 'aspect-square', part: 'lg:col-span-3', petit: 'col-span-1' },
  { nom: 'portable-cartes_carre', ratio: 'aspect-square', part: 'lg:col-span-3', petit: 'col-span-1' },
  { nom: 'portable-bureau_carre', ratio: 'aspect-square', part: 'lg:col-span-3', petit: 'col-span-1' },
  { nom: 'portable-bureau_paysage', ratio: 'aspect-[1734/907]', part: 'lg:col-span-7', petit: 'col-span-2' },
  { nom: 'cartes-neutres_carre', ratio: 'aspect-square', part: 'lg:col-span-5', petit: 'col-span-2' },
];

export default function Visuels({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).produit;
  return (
    // `items-start` : sans lui, un carré s'étire à la hauteur du paysage voisin.
    <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 lg:grid-cols-12">
      {BANDE.map((v) => (
        <figure
          key={v.nom}
          className={`m-0 overflow-hidden rounded-carte border border-filet-nuit bg-encre ${v.petit} ${v.part}`}
        >
          <div className={v.ratio}>
            <img
              src={`/academy/visuels/${v.nom}.jpg`}
              alt={c.visuelAlt}
              loading="lazy"
              decoding="async"
              className="block h-full w-full object-cover"
            />
          </div>
        </figure>
      ))}
    </div>
  );
}
