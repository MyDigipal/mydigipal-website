import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * Le produit, tel qu'il est : une grande fenêtre et quatre petites. Après une
 * page de fragments recréés depuis le code, on montre les vrais écrans.
 *
 * Depuis le 29/08/2026 ce ne sont plus des captures mais des ENREGISTREMENTS,
 * pris par Paul dans le produit le matin même. Une capture montre un état, une
 * vidéo montre que ça marche, et c'est la seule chose qu'un visiteur cherche à
 * savoir à cet endroit de la page.
 *
 * Les cinq boucles sont muettes, sans contrôles, jouées en boucle : elles se
 * comportent comme des captures qui bougent. Une vidéo qui parle sans qu'on
 * l'ait demandé fait fermer l'onglet ; le son est réservé à la vidéo de
 * présentation, qu'on lance d'un clic.
 *
 * Traitement ffmpeg : coupées à dix secondes sur le geste, recadrées en 16:10
 * depuis le haut (les cinq sources avaient chacune sa taille), ramenées à
 * 1280 px, H.264 CRF 30 plus une version VP9. Les sources faisaient 55 Mo, les
 * cinq boucles en font moins de deux, ce qui est la différence entre une page
 * qui s'ouvre et une page qu'on quitte.
 *
 * `poster` porte la première image : sans lui l'emplacement reste noir pendant
 * le chargement, et sur un mobile en économie de données la vidéo ne démarre
 * jamais, donc l'image est tout ce qui reste.
 */
const DEMOS = ['quiz', 'assistant', 'programme', 'prompts', 'avance'] as const;
type DemoKey = (typeof DEMOS)[number];

function Demo({ nom, titre }: { nom: DemoKey; titre: string }) {
  const base = `/academy/demos/${nom}`;
  return (
    <video
      className="block h-full w-full object-cover object-top"
      poster={`${base}.jpg`}
      width={1280}
      height={800}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-label={titre}
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}

export default function Produit({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).produit;
  const petites: Array<{ nom: DemoKey; label: string }> = [
    { nom: 'assistant', label: c.captures.assistant },
    { nom: 'programme', label: c.captures.programme },
    { nom: 'prompts', label: c.captures.prompts },
    { nom: 'avance', label: c.captures.avance },
  ];
  return (
    <section className="border-t border-filet-nuit px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <h2 className="m-0 max-w-[24ch] text-[clamp(24px,3.4vw,36px)] font-medium leading-[1.15] tracking-[-0.02em] text-ivoire">
            {c.titre}
          </h2>
          <p className="m-0 max-w-[40ch] text-[15px] leading-[1.6] text-brume-nuit">{c.texte}</p>
        </div>

        <div className="mt-[34px] overflow-hidden rounded-[16px] border border-filet-nuit bg-encre shadow-[0_40px_80px_-50px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 border-b border-filet-nuit px-4 py-3">
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="ml-3 font-ac-mono text-[11px] text-brume-nuit">{c.url}/quiz</span>
          </div>
          <div className="relative aspect-[16/10]">
            <Demo nom="quiz" titre={c.captures.quiz} />
          </div>
          <p className="m-0 border-t border-filet-nuit px-4 py-[11px] font-ac-mono text-[11px] text-brume-nuit">
            {c.captures.quiz}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {petites.map((f) => (
            <div key={f.nom} className="overflow-hidden rounded-carte border border-filet-nuit bg-encre">
              <p className="m-0 border-b border-filet-nuit px-4 py-[11px] font-ac-mono text-[11px] text-brume-nuit">{f.label}</p>
              <div className="relative aspect-[16/10]">
                <Demo nom={f.nom} titre={f.label} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
