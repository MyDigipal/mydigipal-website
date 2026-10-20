/**
 * Les formats, l'Academy et le simulateur de la page AI Training (direction A, deuxième
 * version, validée par Paul le 14/10/2026). Un seul état pour toute la section : la devise
 * choisie en haut change aussi le ticket du simulateur, et l'état part dans l'adresse
 * (`#chiffrage&...`) pour qu'un lien partagé rouvre exactement le même chiffrage.
 *
 * Tout montant vient de `lib/formation` (grille et moteur) ; les prix publics de l'Academy
 * arrivent en propriété, lus dans son API au build. Rendu au serveur, donc lisible sans
 * script ; le mouvement (journées qui se dessinent, pastilles des groupes) ne s’ajoute
 * qu'au navigateur, et jamais sous mouvement réduit ou `?fige=1`.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { GRILLE, DEVISES, SYMBOLE, type Devise, type Duree, type Mode, type PrixAcademy, type Zone } from '@/lib/formation/grille';
import { academyHT, chiffrer, depuisAdresse, etatDefaut, montant, recommandation, versAdresse, type Etat, type Lang } from '@/lib/formation/moteur';
import { etatFormation, fixerPrixAcademy, reponsesFormation, type QuoteState } from '@/components/calculator-v6/engine';
import { fixerOrigineMesure } from '@/components/calculator/tracking';
import { usePanierSimulateur } from '@/lib/devis/usePanierSimulateur';
import { envoyerDevis } from '@/lib/devis/envoi';
import AutresServices from '@/components/devis/AutresServices';
import Remerciement from '@/components/devis/Remerciement';
import { COPY } from './copy';
import './tarifs.css';

interface Props {
  lang: Lang;
  /** Trois îlots partagent le même état (devise, format, effectif) par un événement de fenêtre :
   *  les formats en haut de page, l'Academy plus bas, le simulateur plus bas encore. */
  partie: 'formats' | 'academy' | 'simulateur';
  academyTtc: PrixAcademy;
  academyFaits: { lecons: number; heures: string; note: string; retours: number };
  academyHref: string;
  contactHref: string;
  video: { src: string; poster: string };
}

// Le devis part par `lib/devis/envoi.ts`, comme tous les devis du site (20/10/2026) : il
// rejoint le devis que le visiteur compose ailleurs (calculateur, extraits des pages).
const ZONES: Zone[] = ['londres', 'uk', 'paris', 'france', 'europe', 'monde'];

function pousser(event: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}
const tranche = (n: number) => (n <= 1 ? '1' : n <= 15 ? '2-15' : n <= 50 ? '16-50' : n <= 150 ? '51-150' : '150+');

const Icone = {
  distance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
  ),
  site: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
  ),
  bas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
  ),
  coche: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  ),
  lien: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
  ),
  fermer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
};

/** Le sélecteur de devise, posé à côté de chaque prix. */
function Devises({ valeur, surChoix, sombre }: { valeur: Devise; surChoix: (d: Devise) => void; sombre?: boolean }) {
  return (
    <span className={`tf-devises${sombre ? ' tf-devises-sombre' : ''}`} role="group" aria-label="Devise">
      {DEVISES.map((d) => (
        <button key={d} type="button" aria-pressed={valeur === d} onClick={() => surChoix(d)}>
          {SYMBOLE[d]} {d}
        </button>
      ))}
    </span>
  );
}

const EVENEMENT = 'mdp-formation:etat';

export default function TarifsFormation({ lang, partie, academyTtc, academyFaits, academyHref, contactHref, video }: Props) {
  const t = COPY[lang];
  const [etat, setEtat] = useState<Etat>(() => etatDefaut(lang));
  const [touche, setTouche] = useState(false);
  const [bouge, setBouge] = useState(false);
  const [joues, setJoues] = useState<Record<string, boolean>>({});
  const [partage, setPartage] = useState('');
  const [formulaire, setFormulaire] = useState(false);
  const etatRef = useRef<Etat>(etat);
  etatRef.current = etat;
  const [son, setSon] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const joursRef = useRef<Record<string, HTMLDivElement | null>>({});

  const r = useMemo(() => chiffrer(etat, academyTtc, lang), [etat, academyTtc, lang]);
  // Le devis unique : seul l'îlot du simulateur le lit et l'écrit.
  const panier = usePanierSimulateur('ai-training', partie === 'simulateur');
  const reco = useMemo(() => recommandation(etat, academyTtc, lang), [etat, academyTtc, lang]);
  const M = (v: number | null) => montant(v, lang, etat.devise);

  // Au navigateur : l'état d'un lien partagé, la devise du visiteur, le droit au mouvement.
  useEffect(() => {
    fixerPrixAcademy(academyTtc);
    if (partie === 'simulateur') fixerOrigineMesure('formation');
    const depuis = depuisAdresse(window.location.hash, etatDefaut(lang));
    // Sans lien partagé, le devis d'une visite précédente (ou composé sur le calculateur).
    const repris = depuis || partie !== 'simulateur' ? null : panier.reprise();
    if (depuis) setEtat(depuis);
    else if (repris) {
      const e = etatFormation(repris.st.answers, repris.devise);
      setEtat(e);
      window.dispatchEvent(new CustomEvent(EVENEMENT, { detail: { etat: e, de: partie } }));
    } else if (lang === 'en') {
      // Les livres aux visiteurs anglophones qui sont au Royaume-Uni (décision de Paul du 14/10/2026).
      try {
        if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/London') setEtat((e) => ({ ...e, devise: 'GBP' }));
      } catch { /* fuseau inconnu : dollars */ }
    }
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]fige=1/.test(window.location.search);
    if (reduit) return;
    setBouge(true);
    // Les journées dessinées : celles déjà à l'écran restent posées, les autres se dessinent à l'arrivée.
    const obs = new IntersectionObserver((entrees) => {
      entrees.forEach((en) => {
        if (!en.isIntersecting) return;
        const cle = (en.target as HTMLElement).dataset.cle!;
        setJoues((j) => ({ ...j, [cle]: true }));
        obs.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    const deja: Record<string, boolean> = {};
    Object.entries(joursRef.current).forEach(([cle, el]) => {
      if (!el) return;
      const b = el.getBoundingClientRect();
      if (b.top < window.innerHeight && b.bottom > 0) deja[cle] = true;
      else obs.observe(el);
    });
    setJoues(deja);
    return () => obs.disconnect();
  }, [lang]);

  // Les trois îlots se tiennent au courant : un changement dans l'un se reporte dans les autres.
  useEffect(() => {
    const ecoute = (e: Event) => {
      const d = (e as CustomEvent<{ etat: Etat; de: string }>).detail;
      if (!d || d.de === partie) return;
      setEtat(d.etat);
      if (partie === 'simulateur') setTouche(true);
    };
    window.addEventListener(EVENEMENT, ecoute);
    return () => window.removeEventListener(EVENEMENT, ecoute);
  }, [partie]);

  // L'adresse suit le chiffrage dès que le visiteur a touché à quelque chose (le simulateur seul l'écrit).
  useEffect(() => {
    if (!touche || partie !== 'simulateur') return;
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${versAdresse(etat)}`);
    panier.synchroniser(reponsesFormation(etat), etat.devise);
  }, [etat, touche, partie]); // eslint-disable-line react-hooks/exhaustive-deps

  // La mesure des réglages, une fois le geste terminé (pas à chaque cran du curseur).
  useEffect(() => {
    if (!touche || partie !== 'simulateur') return;
    const id = window.setTimeout(() => pousser('training_simulator_change', {
      training_duration: etat.duree, training_mode: etat.mode, training_headcount_band: tranche(etat.n),
      training_groups: etat.groupes === 'pleniere' ? 'together' : etat.groupes === 'auto' ? 'auto' : 'custom',
      training_academy: etat.academy, currency: etat.devise,
    }), 900);
    return () => window.clearTimeout(id);
  }, [etat, touche, partie]);

  const changer = (p: Partial<Etat>) => {
    const nouvel = { ...etatRef.current, ...p };
    setTouche(true);
    setEtat(nouvel);
    window.dispatchEvent(new CustomEvent(EVENEMENT, { detail: { etat: nouvel, de: partie } }));
  };
  const allerAuSimulateur = () => document.getElementById('simulateur')?.scrollIntoView({ behavior: bouge ? 'smooth' : 'auto', block: 'start' });

  const choisirFormat = (duree: Duree, mode: Mode) => {
    changer({ duree, mode });
    pousser('training_format_select', { training_duration: duree, training_mode: mode });
    allerAuSimulateur();
  };

  const lienPartage = () => `${window.location.origin}${window.location.pathname}#${versAdresse(etat)}`;
  const partager = async () => {
    const url = lienPartage();
    pousser('training_quote_share', { training_headcount_band: tranche(etat.n), currency: etat.devise });
    try { await navigator.clipboard.writeText(url); setPartage(t.sim.partageOk); } catch { setPartage(url); }
  };

  const ref = GRILLE.groupeReference;
  const pos = (h: number) => ((h - 8) / 10) * 100;
  const blocs: Record<Duree, [number, number][]> = { '3h': [[9, 12], [14, 17]], jour: [[9, 12.5], [13.5, 17]] };
  const sans = academyHT(academyTtc, etat.devise, 1, false);
  const avec = academyHT(academyTtc, etat.devise, 1, true);

  const aide = etat.groupes === 'pleniere'
    ? (r.n > 50 ? t.sim.aideWebinaire : r.n > 20 ? t.sim.aideGrand : t.sim.aideTous)
    : r.seances === 1 ? t.sim.aideUn : t.sim.aidePlusieurs(r.n, r.seances);

  return (
    <>
      {partie === 'formats' && (
      <section className="section-encre section-monte tf-formats" id="formats">
        <div className="container-custom">
          <header className="tf-entete">
            <div className="tf-entete-texte">
              <h2 className="titre-moyen">{t.titre}</h2>
              <p className="chapo">{t.chapo}</p>
            </div>
            <div className="tf-entete-devise"><span>{t.devisePrix}</span><Devises valeur={etat.devise} surChoix={(d) => changer({ devise: d })} sombre /></div>
          </header>

          <div className="tf-gamme">
            {(['3h', 'jour'] as Duree[]).map((d) => {
              const f = t.formats[d];
              return (
                <article key={d} className={`tf-format${d === '3h' ? ' tf-format-vedette' : ''}`}>
                  <div><p className="tf-format-sur">{f.sur}</p><h3 className="tf-format-nom">{f.nom}</h3></div>
                  <p className="tf-format-texte">{f.texte}</p>
                  <div className={`tf-jour${bouge && !joues[d] ? ' tf-attend' : ''}`} data-cle={d} ref={(el) => { joursRef.current[d] = el; }} aria-hidden="true">
                    <div className="tf-jour-axe">
                      {blocs[d].map(([a, b], i) => (
                        <div key={i} className={`tf-jour-bloc${i ? ' tf-second' : ''}`} style={{ left: `${pos(a)}%`, width: `${pos(b) - pos(a)}%` }}><span>{f.blocs[i]}</span></div>
                      ))}
                    </div>
                    <div className="tf-jour-heures">{t.heures.map((h) => <span key={h}>{h}</span>)}</div>
                    <p className="tf-jour-legende">{f.legende}</p>
                  </div>
                  <div className="tf-prix">
                    {(['distance', 'site'] as Mode[]).map((m) => (
                      <button key={m} type="button" className="tf-prix-col" onClick={() => choisirFormat(d, m)}>
                        <span className="tf-prix-mode">{Icone[m]}{m === 'site' ? t.site : t.distance}</span>
                        <span className="tf-prix-pp"><span className="chiffre">{M(GRILLE.durees[d][m][etat.devise] / ref)}</span><small>{t.parPersonne}</small></span>
                        <span className="tf-prix-seance"><b>{M(GRILLE.durees[d][m][etat.devise])}</b> <span>{f.unite}, {t.pour(ref)}{m === 'site' ? t.plusDeplacement : ''}</span></span>
                        <span className="tf-prix-lien">{t.chiffrer} {Icone.bas}</span>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

        </div>
      </section>
      )}

      {partie === 'academy' && (
      <section className="section-blanc tf-academy-section" id="academy">
        <div className="container-custom">
          <div className="tf-academy">
            <div className="tf-video">
              <video ref={videoRef} src={video.src} poster={video.poster} muted={!son} loop playsInline autoPlay preload="metadata" />
              <button type="button" className="tf-son" onClick={() => { const v = videoRef.current; setSon(!son); if (v) { v.muted = son; if (!son) { v.currentTime = 0; v.play().catch(() => {}); } } }}>
                {son ? t.academy.couper : t.academy.ecouter}
              </button>
            </div>
            <div>
              <p className="tf-academy-sur">{t.academy.sur}</p>
              <h2 className="tf-academy-titre">{t.academy.titre}</h2>
              <p>{t.academy.texte}</p>
              <div className="tf-offre">
                <div className="tf-offre-prix"><span className="chiffre">{M(avec)}</span><s>{M(sans)}</s><small>{t.academy.ht}</small><Devises valeur={etat.devise} surChoix={(d) => changer({ devise: d })} sombre /></div>
                <span className="tf-offre-texte">{t.academy.offre}</span>
              </div>
              <div className="tf-faits">
                <div><span className="chiffre">{academyFaits.lecons}</span><span>{t.academy.lecons}</span></div>
                <div><span className="chiffre">{academyFaits.heures}</span><span>{t.academy.contenu}</span></div>
                <div><span className="chiffre">{academyFaits.note}/10</span><span>{academyFaits.retours} {t.academy.avis}</span></div>
              </div>
              <div className="tf-academy-actions">
                <button type="button" className="pilule pilule-blanche" onClick={() => { changer({ academy: true }); allerAuSimulateur(); }}>{t.academy.ajouter}</button>
                <a className="tf-lien-clair" href={academyHref}>{t.academy.voir}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {partie === 'simulateur' && (
      <section className="section-brume tf-simulateur" id="simulateur" data-sans-cta-flottant="">
        <div className="container-custom">
          <header className="tf-sim-tete">
            <h2 className="titre-moyen text-encre">{t.sim.titre}</h2>
            <p className="chapo">{t.sim.chapo}</p>
          </header>

          <div className="tf-sim-grille">
            <div className="tf-reglages">
              <div className="tf-reglage">
                <label className="tf-reglage-titre" htmlFor="tf-effectif">{t.sim.effectif}</label>
                <div className="tf-effectif">
                  <input type="range" id="tf-effectif" min={1} max={200} value={Math.min(200, etat.n)} onChange={(e) => changer({ n: Number(e.target.value), groupes: 'auto' })} />
                  <input type="number" className="tf-saisie" min={1} max={2000} inputMode="numeric" aria-label={t.sim.effectifAria} value={etat.n}
                    onChange={(e) => { const v = parseInt(e.target.value, 10); if (v > 0) changer({ n: Math.min(2000, v), groupes: 'auto' }); }} />
                </div>
              </div>
              <div className="tf-deux">
                <div className="tf-reglage">
                  <span className="tf-reglage-titre">{t.sim.duree}</span>
                  <div className="tf-segment">{(['3h', 'jour'] as Duree[]).map((d) => <button key={d} type="button" aria-pressed={etat.duree === d} onClick={() => changer({ duree: d })}>{t.sim.dureeOptions[d]}</button>)}</div>
                </div>
                <div className="tf-reglage">
                  <span className="tf-reglage-titre">{t.sim.mode}</span>
                  <div className="tf-segment">{(['distance', 'site'] as Mode[]).map((m) => <button key={m} type="button" aria-pressed={etat.mode === m} onClick={() => changer({ mode: m })}>{m === 'site' ? t.site : t.distance}</button>)}</div>
                </div>
              </div>
              {etat.mode === 'site' && (
                <div className="tf-lieu">
                  <select className="tf-choix" aria-label={t.sim.ou} value={etat.zone} onChange={(e) => changer({ zone: e.target.value as Zone })}>
                    {ZONES.map((z) => <option key={z} value={z}>{t.sim.zones[z]}</option>)}
                  </select>
                  <label className="tf-bascule"><input type="checkbox" checked={etat.hotel} onChange={(e) => changer({ hotel: e.target.checked })} /> {t.sim.hotel}</label>
                </div>
              )}
              <div className="tf-reglage">
                <span className="tf-reglage-titre">{t.sim.groupes}</span>
                <div className="tf-segment">
                  <button type="button" aria-pressed={etat.groupes !== 'pleniere'} onClick={() => changer({ groupes: 'auto' })}>{t.sim.groupesAuto}</button>
                  <button type="button" aria-pressed={etat.groupes === 'pleniere'} onClick={() => changer({ groupes: 'pleniere' })}>{t.sim.groupesTous}</button>
                </div>
                <div className="tf-groupes" aria-hidden="true">
                  {r.groupes.slice(0, 8).map((g, i) => (
                    <div className="tf-groupe" key={`${r.groupes.length}-${i}`}>
                      <div className="tf-points">{Array.from({ length: Math.min(g, 40) }, (_, k) => <i key={k} style={bouge ? { animationDelay: `${Math.min((i * 15 + k) * 6, 500)}ms` } : undefined} className={bouge ? 'tf-vient' : ''} />)}</div>
                      <small>{r.groupes.length > 1 ? `${t.sim.groupe(i + 1)}, ` : ''}{g} {t.sim.pers}</small>
                    </div>
                  ))}
                  {r.groupes.length > 8 && <div className="tf-groupe"><small>{t.sim.autres(r.groupes.length - 8)}</small></div>}
                </div>
                <p className="tf-aide">{aide}</p>
              </div>
              <label className="tf-bascule tf-academy-choix">
                <input type="checkbox" checked={etat.academy} onChange={(e) => changer({ academy: e.target.checked })} />
                <span><strong>{t.sim.academy}</strong> {t.sim.academySuite}<small>{t.sim.academyPrix(M(avec), M(sans))}</small></span>
              </label>
            </div>

            <aside className="tf-ticket" aria-live="polite">
              <div className="tf-ticket-haut"><span>{t.sim.horsTaxes}</span><Devises valeur={etat.devise} surChoix={(d) => changer({ devise: d })} sombre /></div>
              <div className="tf-ticket-pp"><span className="chiffre">{M(r.parPersonne)}</span><span>{t.sim.ppLegende(r.n)}</span></div>
              <dl className="tf-lignes">
                {r.lignes.map((l) => (
                  <div key={l.cle}><dt>{l.libelle}</dt><dd>{M(l.montant)}</dd><span className="tf-detail">{l.detail}</span></div>
                ))}
              </dl>
              <div className="tf-total"><span>{t.sim.total}</span><span className="chiffre">{M(r.total)}{r.surDevis ? t.sim.plusDeplacement : ''}</span></div>
              <p className="tf-mention">{t.sim.mention}</p>
              {reco && <p className="tf-reco">{reco}</p>}
              <AutresServices lang={lang} autres={panier.autres} devise={etat.devise} avantDePartir={() => panier.synchroniser(reponsesFormation(etat), etat.devise)} />
              <div className="pilules">
                <button type="button" className="pilule pilule-pleine" onClick={() => { setFormulaire(true); pousser('training_quote_open', { currency: etat.devise }); }}>{t.sim.recevoir}</button>
                <button type="button" className="pilule pilule-claire" onClick={partager}>{Icone.lien}<span className="tf-long">{t.sim.partager}</span><span className="tf-court">{t.sim.partagerCourt}</span></button>
              </div>
              <p className="tf-partage" role="status">{partage}</p>
              <a className="tf-contact" href={contactHref}>{t.sim.contact}</a>
            </aside>
          </div>
        </div>
      </section>

      )}

      {formulaire && <Formulaire lang={lang} etat={etat} devis={() => panier.complet(reponsesFormation(etat))} surFermer={() => setFormulaire(false)} />}
    </>
  );
}

/** Recevoir le chiffrage : le devis complet du visiteur (formation comprise) part comme tous les devis du site. */
function Formulaire({ lang, etat, devis, surFermer }: { lang: Lang; etat: Etat; devis: () => QuoteState; surFermer: () => void }) {
  const t = COPY[lang].form;
  const [champs, setChamps] = useState({ nom: '', email: '', societe: '', message: '', piege: '' });
  const [etape, setEtape] = useState<'saisie' | 'envoi' | 'ok' | 'erreur'>('saisie');
  const [erreur, setErreur] = useState('');
  const ouvertA = useRef(Date.now());
  const premier = useRef<HTMLInputElement>(null);

  useEffect(() => {
    premier.current?.focus();
    const echap = (e: KeyboardEvent) => { if (e.key === 'Escape') surFermer(); };
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [surFermer]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    if (champs.piege.trim() || Date.now() - ouvertA.current < 2500) return;
    if (!champs.nom.trim() || !champs.societe.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email.trim())) { setErreur(t.erreurChamps); return; }
    setEtape('envoi');
    try {
      await envoyerDevis({
        st: devis(), devise: etat.devise, lang, formulaire: 'training_simulator',
        origine: { id: 'formation', libelle: lang === 'fr' ? 'la page AI Training' : 'the AI Training page' },
        contact: { name: champs.nom, email: champs.email, company: champs.societe, message: champs.message }
      });
      setEtape('ok');
    } catch {
      setEtape('erreur');
      setErreur(t.erreur);
    }
  };

  const champ = (cle: 'nom' | 'email' | 'societe', type: string, auto: string) => (
    <label className="tf-champ">
      <span>{t[cle]}</span>
      <input ref={cle === 'nom' ? premier : undefined} type={type} autoComplete={auto} required value={champs[cle]} onChange={(e) => setChamps({ ...champs, [cle]: e.target.value })} />
    </label>
  );

  return (
    <div className="tf-voile" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) surFermer(); }}>
      <div className="tf-fenetre" role="dialog" aria-modal="true" aria-labelledby="tf-form-titre">
        <button type="button" className="tf-fermer" aria-label={t.fermer} onClick={surFermer}>{Icone.fermer}</button>
        {etape !== 'ok' && <h3 id="tf-form-titre">{t.titre}</h3>}
        {etape === 'ok' ? (
          <Remerciement lang={lang} prenom={champs.nom} suite={t.ok} />
        ) : (
          <form onSubmit={envoyer} noValidate>
            <p className="tf-form-texte">{t.texte}</p>
            {champ('nom', 'text', 'name')}
            {champ('email', 'email', 'email')}
            {champ('societe', 'text', 'organization')}
            <label className="tf-champ"><span>{t.message}</span><textarea rows={3} value={champs.message} onChange={(e) => setChamps({ ...champs, message: e.target.value })} /></label>
            <input className="tf-piege" tabIndex={-1} autoComplete="off" aria-hidden="true" value={champs.piege} onChange={(e) => setChamps({ ...champs, piege: e.target.value })} />
            {erreur && <p className="tf-erreur" role="alert">{erreur}</p>}
            <button type="submit" className="pilule pilule-pleine" disabled={etape === 'envoi'}>{etape === 'envoi' ? t.envoi : t.envoyer}</button>
          </form>
        )}
      </div>
    </div>
  );
}
