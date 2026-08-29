import { jour30Copy } from './copy';
import type { Locale } from './data';
import { Boucle, Visionneuse, libelleDemo, useVisionneuse, type DemoKey } from './Demos';

/**
 * La galerie du produit : huit écrans filmés dans l'application, à des tailles
 * différentes, et chacun s'ouvre en grand.
 *
 * Pourquoi des tailles différentes (Paul, 29/08/2026 : « faut mieux les
 * disposer, là ça monte vraiment chacun des éléments ») : une pile de cadres
 * identiques se lit comme une liste, et on la parcourt sans rien regarder. Un
 * rythme irrégulier donne un ordre de lecture, et l'ordre dit ce qui compte :
 * le quiz d'abord, parce que c'est l'écran qui montre le mieux qu'il y a un
 * vrai produit derrière.
 *
 * Toutes gardent le même rapport 16:10 : ce sont des captures d'un même écran,
 * les déformer pour remplir une grille les rendrait fausses. Ce qui varie,
 * c'est la LARGEUR, et la hauteur suit.
 */

/** Une rangée : les écrans qu'elle porte, et la part de largeur de chacun. */
const RANGEES: Array<Array<{ nom: DemoKey; part: string }>> = [
  [
    { nom: 'quiz', part: 'lg:col-span-8' },
    { nom: 'assistant', part: 'lg:col-span-4' },
  ],
  [
    { nom: 'profil', part: 'lg:col-span-4' },
    { nom: 'atelier', part: 'lg:col-span-4' },
    { nom: 'prompts', part: 'lg:col-span-4' },
  ],
  [
    { nom: 'programme', part: 'lg:col-span-7' },
    { nom: 'avance', part: 'lg:col-span-5' },
  ],
  [{ nom: 'cas', part: 'lg:col-span-12' }],
];

function Vignette({
  nom,
  locale,
  part,
  onOuvrir,
}: {
  nom: DemoKey;
  locale: Locale;
  part: string;
  onOuvrir: (n: DemoKey) => void;
}) {
  const titre = libelleDemo(nom, locale);
  return (
    <button
      type="button"
      onClick={() => onOuvrir(nom)}
      className={`group block w-full cursor-pointer overflow-hidden rounded-carte border border-filet-nuit bg-encre text-left transition duration-150 hover:border-or-decor ${part}`}
    >
      <div className="relative aspect-[16/10]">
        <Boucle nom={nom} titre={titre} locale={locale} />
        {/* La loupe ne s'affiche qu'au survol sur les pointeurs fins : au doigt,
            elle masquerait une partie de l'écran filmé en permanence. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 hidden rounded-bouton bg-salle/85 px-2.5 py-1.5 font-ac-mono text-[10.5px] uppercase tracking-[0.12em] text-ivoire opacity-0 transition duration-150 group-hover:opacity-100 lg:block"
        >
          +
        </span>
      </div>
      <p className="m-0 border-t border-filet-nuit px-4 py-[11px] font-ac-mono text-[11px] leading-[1.45] text-brume-nuit transition duration-150 group-hover:text-corps-nuit">
        {titre}
      </p>
    </button>
  );
}

/**
 * ⚠️ Masquée sous lg (Paul, 29/08/2026 : « si certains trucs sont trop
 * compliqués ou trop misleading sur mobile, enlevons-les »). Ce sont des
 * captures d'une interface d'ORDINATEUR : à 350 px de large on ne lit aucun de
 * leurs libellés, et on montre en plus un écran qui n'est pas celui qu'un
 * visiteur au téléphone ouvrira. `display:none` empêche aussi l'entrée dans
 * l'écran, donc aucune des huit vidéos n'est chargée : la page mobile est plus
 * légère de trois écrans de défilement et de tout ce qu'ils pesaient.
 */
export default function Produit({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).produit;
  const { ouvert, ouvrir, fermer } = useVisionneuse();
  return (
    <section className="hidden border-t border-filet-nuit px-4 py-20 sm:px-6 lg:block">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <h2 className="m-0 max-w-[24ch] text-[clamp(24px,3.4vw,36px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">
            {c.titre}
          </h2>
          <p className="m-0 max-w-[40ch] text-[15px] leading-[1.6] text-brume-nuit">{c.texte}</p>
        </div>

        {/* `items-start` : sans lui, une vignette étroite s'étire à la hauteur de
            sa voisine large et garde son cadre 16:10 au milieu, donc du vide
            au-dessus et en dessous. */}
        <div className="mt-[34px] space-y-4">
          {RANGEES.map((rangee, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-12">
              {rangee.map((v) => (
                <Vignette key={v.nom} nom={v.nom} locale={locale} part={v.part} onOuvrir={ouvrir} />
              ))}
            </div>
          ))}
        </div>

        <p className="m-0 mt-5 font-ac-mono text-[11px] text-brume-nuit">{c.agrandir}</p>
      </div>

      {ouvert && <Visionneuse nom={ouvert} titre={libelleDemo(ouvert, locale)} locale={locale} onClose={fermer} />}
    </section>
  );
}
