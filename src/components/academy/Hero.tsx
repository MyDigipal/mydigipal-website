import { jour30Copy } from './copy';
import type { Jour30Data, Locale } from './data';
import { leconsProgramme, leconsComplement, leconsGratuit } from './data';
import { formatPrice } from './offres';
import { useLienApp } from './track';
import { cheminCapture } from './Demos';

/**
 * Le hero : ce qu'on vend, en une phrase, et le produit tel qu'il est.
 *
 * Direction A retenue par Paul le 25/08/2026 : texte à gauche (titre, une
 * phrase avec les chiffres de l'app, deux boutons), la vraie capture du
 * tableau de bord à droite. Pas de photo de salle : la page AI Training vend
 * la formation en présentiel, celle-ci vend l'en-ligne, et les deux ne doivent
 * pas se ressembler. Pas de terminal qui réécrit un prompt : il ne réagissait
 * pas à ce qu'on tapait, et une démonstration qui ment vaut moins que rien.
 *
 * Le chiffre de leçons et le prix viennent du JSON de l'app, jamais d'ici.
 */
export default function Hero({
  locale,
  data,
  ancreTarifs = 'pricing',
  cta2,
  prixAffiche,
}: {
  locale: Locale;
  data: Jour30Data;
  /** L'ancre de la grille de prix : `tarifs` sur la seconde page de vente. */
  ancreTarifs?: string;
  /** Libellé du second bouton, pour y annoncer la durée de l'accès gratuit. */
  cta2?: string;
  /**
   * Le prix déjà formaté avec son symbole, quand la page laisse choisir la
   * devise. Sans lui, le hero affiche l'euro comme avant.
   */
  prixAffiche?: string;
}) {
  const c = jour30Copy(locale).hero;
  const programme = data.offres.find((o) => o.id === 'programme');
  // ⚠️ Le symbole est DANS la valeur : la copie ne l'ajoute plus, sinon une
  // devise choisie donnerait « 250 £ € ».
  const prix = prixAffiche ?? (programme ? `${formatPrice(programme.ttc_minor, locale)} €` : '');
  // ⚠️ Deux colonnes au téléphone, et des boutons compacts (Paul, 13/09/2026 :
  // « sur mobile ça doit être deux petits boutons pour ne pas que ça prenne trop
  // de place de la page »). `whitespace-nowrap` ne revient qu'à partir de sm :
  // en dessous, un libellé long se replie plutôt que d'élargir le bouton.
  const cta =
    'inline-flex min-h-11 items-center justify-center rounded-bouton px-3 py-3 text-center text-[14px] font-semibold leading-tight transition duration-150 sm:whitespace-nowrap sm:px-[26px] sm:py-3.5 sm:text-[15.5px]';
  // ⚠️ Le lien vers le module gratuit passe par `useLienApp` : sans lui,
  // quelqu'un qui arrive d'une annonce et ouvre l'accès gratuit change de
  // domaine en perdant son identifiant de clic, et l'achat qui suit une
  // semaine plus tard n'est plus attribuable à cette annonce.
  const gratuit = useLienApp(`https://academy.mydigipal.com${locale === 'fr' ? '/fr' : ''}/start`);

  return (
    <section id="academy-hero" className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:pb-24 lg:pt-40">
      {/* Le site a son header fixe (72 px) et son logo : la section passe
          dessous avec son dégradé, sans bande vide ni second logo. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 50% at 72% 30%, rgba(200,169,81,.10) 0%, transparent 70%)' }}
      />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <h1 className="m-0 max-w-[17ch] text-balance text-[clamp(32px,4.6vw,56px)] font-medium leading-[1.06] tracking-[-0.025em] text-ivoire">
            {c.titre}
          </h1>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.65] text-corps-nuit">
            {/* ⚠️ Le gros chiffre est la SOMME de ce qu'on peut ouvrir, pas
                `faits.lessons`. Mesuré le 08/09 : la page annonçait « 122
                leçons » puis, deux lignes plus bas, « 78 dans la méthode, 101
                de plus » - or 78 + 101 font 179. Les deux nombres sont justes
                mais ne comptent pas la même chose : 122 est le parcours vendu
                seul, tandis que les 101 des automatisations incluent le
                parcours avancé. Un visiteur ne peut pas le deviner, et une
                addition qui ne tombe pas juste sur le premier écran fait
                douter de tout le reste. */}
            {c.sous(leconsProgramme(data) + leconsComplement(data), prix)}
          </p>
          {/* Ce que le prix affiché ouvre vraiment : sept modules du parcours
              relèvent du complément, et la promesse au-dessus porte le volume
              entier. Dire les deux au même endroit est la seule façon que le
              chiffre reste vrai. */}
          <p className="mt-2 max-w-[48ch] font-ac-mono text-[12px] leading-[1.5] text-brume-nuit">
            {c.repartition(leconsProgramme(data), leconsComplement(data))}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3.5">
            <a href={`#${ancreTarifs}`} className={`${cta} bg-or text-salle hover:bg-or-vif`}>
              {c.cta}
            </a>
            <a
              href={gratuit}
              className={`${cta} border border-filet-nuit text-corps-nuit hover:border-brume-nuit hover:text-ivoire`}
            >
              {cta2 ?? c.cta2(leconsGratuit(data))}
            </a>
          </div>
        </div>

        {/* ⚠️ Rien de tout ceci au téléphone (Paul, 13/09/2026 : « la photo de
            l'académie dans le hero, je trouve qu'elle n'a pas sa place ici »).
            Elle avait d'abord été réduite, puis cadrée en 4:5 le 01/09 pour
            rester lisible ; elle sort maintenant, et le premier écran tient en
            un titre, une phrase et deux boutons. */}
        <div className="hidden overflow-hidden rounded-[16px] border border-filet-nuit bg-encre shadow-[0_40px_80px_-50px_rgba(0,0,0,0.9)] sm:block">
          <div className="flex items-center gap-2 border-b border-filet-nuit px-4 py-3">
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="ml-3 font-ac-mono text-[11px] text-brume-nuit">{c.url}</span>
          </div>
          <div className="relative aspect-[16/10]">
            <img
              src={cheminCapture('tableau-de-bord', locale)}
              alt={c.alt}
              width={1204}
              height={753}
              fetchPriority="high"
              className="block h-full w-full object-cover object-left-top sm:object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
