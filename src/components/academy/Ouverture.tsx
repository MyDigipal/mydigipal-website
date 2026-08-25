import { useCallback, useEffect, useRef, useState } from 'react';
import { jour30Copy } from './copy';
import type { Locale } from './data';
import { after, probeClock, reducedMotion, typeText, type Arret } from './motion';

type Phase = 'idle' | 'writing' | 'flat' | 'craft' | 'ask';

/**
 * L'ouverture : la même demande, écrite deux fois. La démonstration se JOUE
 * seule, 600 ms après le montage : la demande vague s'écrit, la réponse plate
 * s'écrit, la demande se rature, les cinq champs CRAFT se révèlent un par un,
 * la réponse riche s'écrit. On ne demande rien au visiteur avant de lui avoir
 * montré quelque chose.
 *
 * La réponse plate ne dépend pas de ce qui est tapé : ce qu'on montre est le
 * symptôme d'une demande sans contexte, pas une exécution réelle. Aucun appel
 * réseau, et la page le dit quand le visiteur écrit la sienne.
 *
 * Chaque machine à écrire est pilotée par une durée cible sur rAF (voir
 * jour30-motion.ts), jamais par un nombre de caractères par image.
 */
export default function Ouverture({ locale }: { locale: Locale }) {
  const c = jour30Copy(locale).ouverture;
  const [phase, setPhase] = useState<Phase>('idle');
  const [demande, setDemande] = useState('');
  const [shown, setShown] = useState(c.vague);
  const [plate, setPlate] = useState('');
  const [riche, setRiche] = useState('');
  const [reveal, setReveal] = useState(0);
  const [rature, setRature] = useState(false);
  const [reponse, setReponse] = useState(false);
  const [outils, setOutils] = useState(false);

  const arrets = useRef<Arret[]>([]);
  const reduce = useRef(false);
  const dernier = useRef(c.vague);

  const stop = useCallback(() => {
    arrets.current.forEach((a) => a());
    arrets.current = [];
  }, []);
  const garder = (a: Arret) => arrets.current.push(a);

  const play = useCallback(
    (txt: string) => {
      stop();
      dernier.current = txt;
      setPlate('');
      setRiche('');
      setReveal(0);
      setRature(false);
      setReponse(false);
      setOutils(false);

      if (reduce.current) {
        // Sans mouvement, tout est posé d'un coup, à l'état final.
        setShown(txt);
        setPlate(c.plate);
        setRature(true);
        setReveal(5);
        setReponse(true);
        setRiche(c.riche);
        setOutils(true);
        setPhase('craft');
        return;
      }

      setShown('');
      setPhase('writing');
      const step = (i: number) => {
        if (i > 5) {
          setReponse(true);
          garder(typeText(c.riche, 1300, setRiche, () => setOutils(true)));
          return;
        }
        setReveal(i);
        garder(after(300, () => step(i + 1)));
      };
      garder(
        typeText(txt, 1100, setShown, () => {
          garder(
            after(500, () => {
              setPhase('flat');
              garder(
                typeText(c.plate, 1500, setPlate, () => {
                  garder(
                    after(1100, () => {
                      setRature(true);
                      garder(
                        after(700, () => {
                          setPhase('craft');
                          step(0);
                        })
                      );
                    })
                  );
                })
              );
            })
          );
        })
      );
    },
    [c, stop]
  );

  useEffect(() => {
    // On ne cache RIEN avant d'avoir la preuve que l'horloge d'animation
    // avance : sinon, mode sans mouvement, où la page est déjà complète.
    let lance: Arret = () => {};
    probeClock((alive) => {
      reduce.current = !alive || reducedMotion();
      lance = after(600, () => play(c.vague));
    });
    return () => {
      lance();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDemand = phase === 'writing' || phase === 'flat' || phase === 'craft' || phase === 'idle';
  const champs = [
    { label: c.champs.contexte, value: shown },
    c.champs.role,
    c.champs.action,
    c.champs.format,
    c.champs.ton,
  ];
  const etat =
    phase === 'craft' ? c.etat.craft : phase === 'flat' ? c.etat.flat : phase === 'ask' ? c.etat.ask : c.etat.demo;

  const mono = 'font-ac-mono';
  const rubrique = `${mono} text-[11px] uppercase tracking-[0.14em]`;
  const bouton = `${mono} cursor-pointer rounded-[8px] border bg-transparent px-3.5 py-[7px] text-[11px] uppercase tracking-[0.08em] transition duration-150`;

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-center px-4 pb-16 pt-20 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 45% at 50% 0%, rgba(200,169,81,.10) 0%, transparent 70%)' }}
      />
      <img
        src="/academy/brand/academy-logo-dark.png"
        alt="MyDigipal Academy"
        width={1113}
        height={457}
        className="absolute left-4 top-5 h-7 w-auto sm:left-6 sm:top-6"
      />
      <div className="relative mx-auto w-full max-w-[880px]">
        <h1 className="m-0 max-w-[15ch] text-balance text-[clamp(30px,5.2vw,58px)] font-medium leading-[1.08] tracking-[-0.025em] text-ivoire">
          {c.titre}
        </h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-brume-nuit">{c.sous}</p>

        <div className="mt-[34px] overflow-hidden rounded-carte border border-or/[0.18] bg-encre shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-[11px]">
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span className="h-[9px] w-[9px] rounded-full bg-white/[0.14]" />
            <span
              className={`${mono} ml-auto text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
                phase === 'craft' ? 'text-or' : 'text-brume-nuit'
              }`}
            >
              {etat}
            </span>
          </div>

          <div className="min-h-[300px] px-5 pb-[22px] pt-5">
            {phase === 'ask' && (
              <>
                <label htmlFor="j30-demande" className={`${rubrique} mb-2.5 block text-brume-nuit`}>
                  {c.votreDemande}
                </label>
                <textarea
                  id="j30-demande"
                  rows={3}
                  value={demande}
                  onChange={(e) => setDemande(e.target.value)}
                  placeholder={c.placeholder}
                  className={`${mono} w-full resize-y rounded-bouton border border-filet-nuit bg-salle px-4 py-3.5 text-[13.5px] leading-[1.7] text-ivoire placeholder:text-brume-nuit/70`}
                />
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    onClick={() => play(demande.trim() || c.vague)}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-bouton border-0 bg-or px-[22px] py-3 text-[15px] font-semibold text-salle transition duration-150 hover:bg-or-vif"
                  >
                    {c.lancer}
                  </button>
                  <span className="max-w-[52ch] text-[13px] leading-[1.5] text-brume-nuit">{c.sansAppel}</span>
                </div>
              </>
            )}

            {showDemand && (
              <>
                <p className={`${rubrique} m-0 mb-2.5 text-brume-nuit`}>{c.laDemande}</p>
                <p
                  className={`${mono} m-0 whitespace-pre-wrap text-[13.5px] leading-[1.7] ${
                    rature ? 'text-brume-nuit line-through' : 'text-ivoire'
                  }`}
                  style={{ textDecorationColor: 'rgba(217,116,63,.75)', textDecorationThickness: '1.5px' }}
                >
                  {shown}
                  <span
                    className="prompt-card__caret inline-block"
                    style={{ opacity: phase === 'writing' ? 1 : 0 }}
                    aria-hidden="true"
                  />
                </p>
              </>
            )}

            {phase === 'flat' && (
              <div className="mt-4 border-t border-dashed border-white/[0.12] pt-4">
                <p className={`${rubrique} m-0 mb-2.5 text-brume-nuit`}>{c.ceQueCaDonne}</p>
                <p className={`${mono} m-0 whitespace-pre-wrap text-[13.5px] leading-[1.75] text-[rgba(150,160,178,0.85)]`}>
                  {plate}
                </p>
              </div>
            )}

            {phase === 'craft' && (
              <div className="mt-4 border-t border-dashed border-white/[0.12] pt-4">
                <p className={`${rubrique} m-0 mb-3 text-or`}>{c.reecrite}</p>
                {champs.map((f, i) => (
                  <div
                    key={f.label}
                    className="grid grid-cols-[78px_1fr] gap-3.5 border-b border-white/[0.06] py-2 transition-opacity duration-[260ms]"
                    style={{ opacity: i < reveal ? 1 : 0.12 }}
                  >
                    <span className={`${mono} text-[11px] font-bold uppercase tracking-[0.12em] text-or`}>{f.label}</span>
                    <span className={`${mono} text-[12.5px] leading-[1.65] text-terminal-texte`}>{f.value}</span>
                  </div>
                ))}
                <div className="mt-4 transition-opacity duration-[400ms]" style={{ opacity: reponse ? 1 : 0 }}>
                  <p className={`${rubrique} m-0 mb-2.5 text-brume-nuit`}>{c.maintenant}</p>
                  <p className={`${mono} m-0 whitespace-pre-wrap text-[13px] leading-[1.75] text-assistant`}>{riche}</p>
                </div>
              </div>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5 border-t border-white/[0.07] px-5 py-3 transition-opacity duration-[400ms]"
            style={{ opacity: outils || phase === 'ask' ? 1 : 0.35 }}
          >
            <button
              type="button"
              onClick={() => play(dernier.current)}
              className={`${bouton} border-filet-nuit text-brume-nuit hover:border-brume-nuit hover:text-ivoire`}
            >
              {c.revoir}
            </button>
            <button
              type="button"
              onClick={() => {
                stop();
                setOutils(false);
                setPhase('ask');
              }}
              className={`${bouton} border-or/40 text-or hover:border-or-vif hover:text-or-vif`}
            >
              {c.essayer}
            </button>
            <span className="text-[13px] text-brume-nuit">{c.note}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
