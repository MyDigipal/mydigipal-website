import { useState } from 'react';
import { copyV2, type Locale } from './copy-v2';
import { Boucle, Visionneuse, type Demo } from './Video';

/**
 * La pratique : trois écrans qui bougent, pas trois paragraphes.
 *
 * Première version rejetée par Paul le 06/09 : « il faut des trucs interactifs,
 * pas de l'atelier de prompting, des exercices et des quiz » écrits en toutes
 * lettres. La section montre donc les écrans où l'on travaille, en boucle, et
 * un clic les ouvre en grand.
 *
 * Les boucles ne se chargent qu'à l'approche de l'écran (voir `Boucle`) : trois
 * vidéos en haut de page coûteraient trois connexions avant même qu'on ait lu
 * le titre.
 */
export default function Pratique({ locale, exercices }: { locale: Locale; exercices: number }) {
  const c = copyV2(locale).pratique;
  const [grand, setGrand] = useState<Demo | null>(null);
  const [titre, setTitre] = useState('');

  const ouvrir = (cle: string, t: string) => {
    setGrand(cle as Demo);
    setTitre(t);
  };

  return (
    <section id="pratique" className="scroll-mt-20 border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="font-ac-mono text-[11px] uppercase tracking-[.16em] text-or">{c.kicker}</div>
        <h2 className="mt-3 max-w-[18ch] text-[clamp(26px,3.2vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-ivoire">
          {c.titre}
        </h2>
        <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.65] text-brume-nuit">{c.chapeau}</p>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
          {c.cartes.map((k) => (
            <button
              key={k.cle}
              type="button"
              onClick={() => ouvrir(k.cle, k.titre)}
              className="group cursor-pointer overflow-hidden rounded-carte border border-filet-nuit bg-salle-2 p-0 text-left transition duration-200 hover:border-or focus-visible:outline focus-visible:outline-2 focus-visible:outline-or"
            >
              <div className="relative">
                <Boucle nom={k.cle as Demo} className="aspect-[16/10]" vignette />
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(13,20,36,.72),transparent_55%)]" />
                <span className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 font-ac-mono text-[11px] uppercase tracking-[.12em] text-ivoire opacity-0 transition group-hover:opacity-100">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {c.lire}
                </span>
              </div>
              <div className="p-5">
                <span className="mb-2.5 block font-ac-mono text-[12px] font-semibold uppercase tracking-[.12em] text-or">
                  {k.num}
                </span>
                <h3 className="mb-2 text-[17px] font-medium leading-[1.25] text-ivoire">{k.titre}</h3>
                <p className="m-0 text-[14.5px] leading-[1.6] text-brume-nuit">
                  {k.cle === 'atelier' ? k.texte : k.texte}
                </p>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 font-ac-mono text-[12px] text-brume-nuit">
          {copyV2(locale).barre.exPratique(exercices)}
        </p>
      </div>

      <Visionneuse
        nom={grand}
        titre={titre}
        fermer={() => setGrand(null)}
        libelleFermer={c.fermer}
      />
    </section>
  );
}
