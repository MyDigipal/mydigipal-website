import { jour30Copy } from './copy';
import type { Locale } from './data';

/**
 * Le produit, tel qu'il est : une grande fenêtre et deux petites. Après une
 * page de fragments recréés depuis le code, on montre les vrais écrans.
 *
 * Les trois captures sont de vraies captures de academy.mydigipal.com, prises
 * le 25/08/2026 (compte de Paul, langue anglaise), recadrées en 16:10 dans
 * `public/captures/`. Jamais un faux écran fait en div : c'est nommément
 * interdit par le système de la page. À reprendre en français et depuis un
 * compte apprenant quand il y en aura un de propre.
 */
const CAPTURES = {
  dashboard: '/academy/captures/tableau-de-bord.jpg',
  lecon: '/academy/captures/lecon.jpg',
  atelier: '/academy/captures/atelier.jpg',
} as const;

function Capture({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} loading="lazy" width={1600} height={1000} className="block h-full w-full object-cover object-top" />;
}

export default function Produit({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).produit;
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
            <span className="ml-3 font-ac-mono text-[11px] text-brume-nuit">{c.url}/craft</span>
          </div>
          <div className="relative aspect-[16/10]">
            <Capture src={CAPTURES.atelier} alt={c.captures.atelier} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {[
            { label: c.captures.lecon, src: CAPTURES.lecon },
            { label: c.captures.dashboard, src: CAPTURES.dashboard },
          ].map((f) => (
            <div key={f.src} className="overflow-hidden rounded-carte border border-filet-nuit bg-encre">
              <p className="m-0 border-b border-filet-nuit px-4 py-[11px] font-ac-mono text-[11px] text-brume-nuit">{f.label}</p>
              <div className="relative aspect-[16/10]">
                <Capture src={f.src} alt={f.label} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
