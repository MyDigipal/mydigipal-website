/**
 * Les prix et le simulateur de la page Creative design (20/10/2026). Deux îlots partagent le
 * même état par un événement de fenêtre : la grille des prix (avec son sélecteur de devise) et
 * le simulateur plus bas. L'état part dans l'adresse (`#devis&...`), pour qu'un lien partagé
 * rouvre exactement le même chiffrage.
 *
 * Tout montant vient de `lib/creative` (grille et moteur) ; les styles sont ceux du simulateur
 * d'AI Training (`formation/tarifs.css`, préfixe `tf-`), plus quelques règles `tc-`.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { DEVISES, SYMBOLE } from '@/lib/formation/grille';
import { GRILLE_CREA, PALIERS, type Canal, type Devise, type Video } from '@/lib/creative/grille';
import { chiffrer, depuisAdresse, etatDefaut, MAX, montant, nomCanal, versAdresse, type EtatCrea, type Lang } from '@/lib/creative/moteur';
import { metaIds, provenance } from '@/components/academy/track';
import '../formation/tarifs.css';
import './tarifs-creative.css';

interface Props {
  lang: Lang;
  partie: 'prix' | 'simulateur';
  contactHref: string;
}

const WEBHOOK = 'https://academy.mydigipal.com/api/site/devis';
const EVENEMENT = 'mdp-creative:etat';

function pousser(event: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}
const tranche = (n: number) => (n <= 2 ? '1-2' : n <= 5 ? '3-5' : n <= 10 ? '6-10' : '11+');

const COPY = {
  fr: {
    devise: 'Prix affichés en',
    unite: 'Prix à l’unité',
    lignes: [
      ['Jeu de bannières LinkedIn', '3 images : carré, paysage, vertical'],
      ['Jeu de bannières Google', '3 images, vos logos et les tailles Display'],
      ['Jeu de bannières LinkedIn et Google', 'Tous les formats des deux canaux'],
      ['Document ad', '5 à 8 pages, 1080 x 1080, PDF'],
      ['Vidéo de 15 à 20 s', 'Script et motion design, en 16:9, 1:1 et 9:16'],
      ['Vidéo de 20 à 30 s', 'Script et motion design, en 16:9, 1:1 et 9:16'],
      ['Storyboard seul', 'Scènes, script et textes à l’écran'],
      ['Le même jeu dans une autre langue', 'Mêmes visuels, texte traduit et relu'],
    ],
    paliersTitre: 'Prix par jeu, selon le nombre de jeux de la même demande',
    jeux: 'Jeux',
    les2: 'Les deux',
    paliers: (a: number, b: number | null) => (b ? `${a} à ${b}` : `${a} et plus`),
    videosPaliers: 'Les vidéos suivent les mêmes paliers.',
    mention: 'Prix hors taxes. Les frais média ne sont jamais compris.',
    chiffrer: 'Chiffrer ma demande',
    sim: {
      titre: 'Chiffrez votre demande',
      chapo: 'Réglez ce dont vous avez besoin : le prix se calcule avec les paliers de volume, dans la devise de votre choix. Le lien se partage tel quel.',
      jeux: 'Combien de messages ?',
      jeuxAide: 'Un jeu de bannières par message.',
      canal: 'Sur quels canaux ?',
      videos: 'Combien de vidéos ?',
      duree: 'Durée des vidéos',
      dureeOptions: { v20: '15 à 20 s', v30: '20 à 30 s' },
      langues: 'Langues en plus',
      docs: 'Document ads',
      storyboards: 'Storyboards seuls',
      moins: 'Retirer un', plus: 'Ajouter un',
      horsTaxes: 'Hors taxes',
      total: 'Total',
      economie: (m: string) => `Dont ${m} économisés grâce aux paliers de volume.`,
      vide: 'Ajoutez un message ou une vidéo pour voir le prix.',
      tours: '4 tours de retours compris sur chaque jeu et chaque vidéo.',
      recevoir: 'Recevoir ce devis',
      partager: 'Copier le lien du devis',
      partagerCourt: 'Lien',
      partageOk: 'Lien copié : il rouvre ce chiffrage.',
      contact: 'Une question ? Écrivez-nous',
    },
    form: {
      titre: 'Recevoir ce devis', texte: 'Nous vous l’envoyons par e-mail, et nous revenons vers vous sous 24 h pour en parler.',
      nom: 'Nom', email: 'E-mail professionnel', societe: 'Entreprise', message: 'Ce que nous devons savoir (facultatif)',
      envoyer: 'Recevoir le devis', envoi: 'Envoi…', ok: 'C’est parti : le devis arrive dans votre boîte, et nous revenons vers vous sous 24 h.',
      erreurChamps: 'Merci d’indiquer votre nom, votre entreprise et un e-mail valide.', erreur: 'L’envoi n’a pas abouti. Réessayez, ou écrivez-nous depuis la page contact.', fermer: 'Fermer',
    },
  },
  en: {
    devise: 'Prices shown in',
    unite: 'Unit prices',
    lignes: [
      ['LinkedIn banner set', '3 images: square, landscape, vertical'],
      ['Google banner set', '3 images, your logos and the Display sizes'],
      ['LinkedIn and Google banner set', 'Every format of both channels'],
      ['Document ad', '5 to 8 pages, 1080 x 1080, PDF'],
      ['15 to 20-second video', 'Script and motion design, in 16:9, 1:1 and 9:16'],
      ['20 to 30-second video', 'Script and motion design, in 16:9, 1:1 and 9:16'],
      ['Storyboard only', 'Scenes, script and on-screen text'],
      ['Same set in another language', 'Same visuals, text translated and checked'],
    ],
    paliersTitre: 'Price per set, by number of sets in the same request',
    jeux: 'Sets',
    les2: 'Both',
    paliers: (a: number, b: number | null) => (b ? `${a} to ${b}` : `${a} and more`),
    videosPaliers: 'Videos follow the same steps.',
    mention: 'Prices exclude VAT. Media spend is never included.',
    chiffrer: 'Price my request',
    sim: {
      titre: 'Price your request',
      chapo: 'Set what you need: the price uses the volume steps, in the currency you choose. The link can be shared as it is.',
      jeux: 'How many messages?',
      jeuxAide: 'One banner set per message.',
      canal: 'On which channels?',
      videos: 'How many videos?',
      duree: 'Video length',
      dureeOptions: { v20: '15 to 20 s', v30: '20 to 30 s' },
      langues: 'Extra languages',
      docs: 'Document ads',
      storyboards: 'Storyboards only',
      moins: 'Remove one', plus: 'Add one',
      horsTaxes: 'Excluding VAT',
      total: 'Total',
      economie: (m: string) => `Including ${m} saved with the volume steps.`,
      vide: 'Add a message or a video to see the price.',
      tours: '4 rounds of feedback included on every set and every video.',
      recevoir: 'Get this quote',
      partager: 'Copy the quote link',
      partagerCourt: 'Link',
      partageOk: 'Link copied: it reopens this quote.',
      contact: 'A question? Write to us',
    },
    form: {
      titre: 'Get this quote', texte: 'We email it to you, and get back to you within 24 hours to talk it through.',
      nom: 'Name', email: 'Work email', societe: 'Company', message: 'What we should know (optional)',
      envoyer: 'Get the quote', envoi: 'Sending…', ok: 'Done: the quote is on its way to your inbox, and we will get back to you within 24 hours.',
      erreurChamps: 'Please give your name, your company and a valid email.', erreur: 'Sending failed. Try again, or write to us from the contact page.', fermer: 'Close',
    },
  },
} as const;

const Icone = {
  lien: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>),
  fermer: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>),
  bas: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>),
};

function Devises({ valeur, surChoix, sombre }: { valeur: Devise; surChoix: (d: Devise) => void; sombre?: boolean }) {
  return (
    <span className={`tf-devises${sombre ? ' tf-devises-sombre' : ''}`} role="group" aria-label="Devise">
      {DEVISES.map((d) => (
        <button key={d} type="button" aria-pressed={valeur === d} onClick={() => surChoix(d)}>{SYMBOLE[d]} {d}</button>
      ))}
    </span>
  );
}

function Compteur({ id, valeur, max, min = 0, surChange, moins, plus }: { id: string; valeur: number; max: number; min?: number; surChange: (n: number) => void; moins: string; plus: string }) {
  return (
    <div className="tc-compteur">
      <button type="button" aria-label={moins} disabled={valeur <= min} onClick={() => surChange(Math.max(min, valeur - 1))}>−</button>
      <input id={id} type="number" inputMode="numeric" min={min} max={max} value={valeur}
        onChange={(e) => { const v = parseInt(e.target.value, 10); if (!Number.isNaN(v)) surChange(Math.max(min, Math.min(max, v))); }} />
      <button type="button" aria-label={plus} disabled={valeur >= max} onClick={() => surChange(Math.min(max, valeur + 1))}>+</button>
    </div>
  );
}

export default function TarifsCreative({ lang, partie, contactHref }: Props) {
  const t = COPY[lang];
  const [etat, setEtat] = useState<EtatCrea>(() => etatDefaut(lang));
  const [touche, setTouche] = useState(false);
  const [partage, setPartage] = useState('');
  const [formulaire, setFormulaire] = useState(false);
  const etatRef = useRef(etat);
  etatRef.current = etat;
  const r = useMemo(() => chiffrer(etat, lang), [etat, lang]);
  const M = (v: number) => montant(v, lang, etat.devise);

  // Au navigateur : l'état d'un lien partagé, sinon les livres aux anglophones du Royaume-Uni.
  useEffect(() => {
    const depuis = depuisAdresse(window.location.hash, etatDefaut(lang));
    if (depuis) setEtat(depuis);
    else if (lang === 'en') {
      try { if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/London') setEtat((e) => ({ ...e, devise: 'GBP' })); } catch { /* dollars */ }
    }
  }, [lang]);

  useEffect(() => {
    const ecoute = (e: Event) => {
      const d = (e as CustomEvent<{ etat: EtatCrea; de: string }>).detail;
      if (!d || d.de === partie) return;
      setEtat(d.etat);
      if (partie === 'simulateur') setTouche(true);
    };
    window.addEventListener(EVENEMENT, ecoute);
    return () => window.removeEventListener(EVENEMENT, ecoute);
  }, [partie]);

  useEffect(() => {
    if (!touche || partie !== 'simulateur') return;
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${versAdresse(etat)}`);
  }, [etat, touche, partie]);

  useEffect(() => {
    if (!touche || partie !== 'simulateur') return;
    const id = window.setTimeout(() => pousser('creative_simulator_change', {
      creative_sets: tranche(etat.jeux), creative_channel: etat.canal, creative_videos: etat.videos, creative_languages: etat.langues, currency: etat.devise,
    }), 900);
    return () => window.clearTimeout(id);
  }, [etat, touche, partie]);

  const changer = (p: Partial<EtatCrea>) => {
    const nouvel = { ...etatRef.current, ...p };
    setTouche(true);
    setEtat(nouvel);
    window.dispatchEvent(new CustomEvent(EVENEMENT, { detail: { etat: nouvel, de: partie } }));
  };
  const lienPartage = () => `${window.location.origin}${window.location.pathname}#${versAdresse(etat)}`;
  const partager = async () => {
    pousser('creative_quote_share', { currency: etat.devise });
    const url = lienPartage();
    try { await navigator.clipboard.writeText(url); setPartage(t.sim.partageOk); } catch { setPartage(url); }
  };

  const d = etat.devise;
  const unitaires: number[] = [
    GRILLE_CREA.jeux.li[0].prix[d], GRILLE_CREA.jeux.pm[0].prix[d], GRILLE_CREA.jeux.both[0].prix[d],
    GRILLE_CREA.documentAd[d], GRILLE_CREA.videos.v20[0].prix[d], GRILLE_CREA.videos.v30[0].prix[d], GRILLE_CREA.storyboard[d],
  ];

  return (
    <>
      {partie === 'prix' && (
        <div className="tc-prix">
          <div className="tc-prix-haut"><span>{t.devise}</span><Devises valeur={d} surChoix={(x) => changer({ devise: x })} sombre /></div>
          <h3 className="tc-sous-titre">{t.unite}</h3>
          <dl className="tc-unite">
            {t.lignes.map(([nom, detail], i) => (
              <div key={nom}>
                <dt>{nom}<span>{detail}</span></dt>
                <dd className="chiffre">{i < unitaires.length ? M(unitaires[i]) : lang === 'fr' ? '+30 %' : '+30%'}</dd>
              </div>
            ))}
          </dl>
          <h3 className="tc-sous-titre">{t.paliersTitre}</h3>
          <div className="tc-table">
            <table>
              <thead><tr><th scope="col">{t.jeux}</th><th scope="col">LinkedIn</th><th scope="col">Google</th><th scope="col">{t.les2}</th></tr></thead>
              <tbody>
                {PALIERS.map((p, i) => (
                  <tr key={p.des}>
                    <th scope="row">{t.paliers(p.des, p.a)}</th>
                    {(['li', 'pm', 'both'] as Canal[]).map((c) => <td key={c} className="chiffre">{M(GRILLE_CREA.jeux[c][i].prix[d])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tc-note">{t.videosPaliers} {t.mention}</p>
          <button type="button" className="pilule pilule-blanche" onClick={() => document.getElementById('simulateur')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t.chiffrer} {Icone.bas}</button>
        </div>
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
                  <label className="tf-reglage-titre" htmlFor="tc-jeux">{t.sim.jeux}</label>
                  <Compteur id="tc-jeux" valeur={etat.jeux} max={MAX.jeux} surChange={(n) => changer({ jeux: n })} moins={t.sim.moins} plus={t.sim.plus} />
                  <p className="tf-aide">{t.sim.jeuxAide}</p>
                </div>
                <div className="tf-reglage">
                  <span className="tf-reglage-titre">{t.sim.canal}</span>
                  <div className="tf-segment">
                    {(['li', 'pm', 'both'] as Canal[]).map((c) => <button key={c} type="button" aria-pressed={etat.canal === c} onClick={() => changer({ canal: c })}>{nomCanal(c, lang)}</button>)}
                  </div>
                </div>
                <div className="tf-deux">
                  <div className="tf-reglage">
                    <label className="tf-reglage-titre" htmlFor="tc-videos">{t.sim.videos}</label>
                    <Compteur id="tc-videos" valeur={etat.videos} max={MAX.videos} surChange={(n) => changer({ videos: n })} moins={t.sim.moins} plus={t.sim.plus} />
                  </div>
                  <div className="tf-reglage">
                    <span className="tf-reglage-titre">{t.sim.duree}</span>
                    <div className="tf-segment">
                      {(['v20', 'v30'] as Video[]).map((v) => <button key={v} type="button" aria-pressed={etat.duree === v} onClick={() => changer({ duree: v })}>{t.sim.dureeOptions[v]}</button>)}
                    </div>
                  </div>
                </div>
                <div className="tc-trois">
                  <div className="tf-reglage">
                    <label className="tf-reglage-titre" htmlFor="tc-langues">{t.sim.langues}</label>
                    <Compteur id="tc-langues" valeur={etat.langues} max={MAX.langues} surChange={(n) => changer({ langues: n })} moins={t.sim.moins} plus={t.sim.plus} />
                  </div>
                  <div className="tf-reglage">
                    <label className="tf-reglage-titre" htmlFor="tc-docs">{t.sim.docs}</label>
                    <Compteur id="tc-docs" valeur={etat.docs} max={MAX.docs} surChange={(n) => changer({ docs: n })} moins={t.sim.moins} plus={t.sim.plus} />
                  </div>
                  <div className="tf-reglage">
                    <label className="tf-reglage-titre" htmlFor="tc-sb">{t.sim.storyboards}</label>
                    <Compteur id="tc-sb" valeur={etat.storyboards} max={MAX.storyboards} surChange={(n) => changer({ storyboards: n })} moins={t.sim.moins} plus={t.sim.plus} />
                  </div>
                </div>
              </div>

              <aside className="tf-ticket tc-ticket" aria-live="polite">
                <div className="tf-ticket-haut"><span>{t.sim.horsTaxes}</span><Devises valeur={d} surChoix={(x) => changer({ devise: x })} sombre /></div>
                <div className="tf-ticket-pp"><span className="chiffre">{M(r.total)}</span><span>{t.sim.total}</span></div>
                {r.lignes.length > 0 ? (
                  <dl className="tf-lignes">
                    {r.lignes.map((l) => (
                      <div key={l.cle}><dt>{l.libelle}</dt><dd>{M(l.montant)}</dd><span className="tf-detail">{l.detail}</span></div>
                    ))}
                  </dl>
                ) : <p className="tf-mention">{t.sim.vide}</p>}
                {r.economie > 0 && <p className="tf-reco">{t.sim.economie(M(r.economie))}</p>}
                <p className="tf-mention">{t.sim.tours} {t.mention}</p>
                <div className="pilules">
                  <button type="button" className="pilule pilule-pleine" disabled={r.total <= 0} onClick={() => { setFormulaire(true); pousser('creative_quote_open', { currency: d }); }}>{t.sim.recevoir}</button>
                  <button type="button" className="pilule pilule-claire" onClick={partager}>{Icone.lien}<span className="tf-long">{t.sim.partager}</span><span className="tf-court">{t.sim.partagerCourt}</span></button>
                </div>
                <p className="tf-partage" role="status">{partage}</p>
                <a className="tf-contact" href={contactHref}>{t.sim.contact}</a>
              </aside>
            </div>
          </div>
        </section>
      )}

      {formulaire && <Formulaire lang={lang} etat={etat} surFermer={() => setFormulaire(false)} lienPartage={lienPartage} />}
    </>
  );
}

/** Recevoir le chiffrage : poste sur la route des devis de l'application, branche « creative ». */
function Formulaire({ lang, etat, surFermer, lienPartage }: { lang: Lang; etat: EtatCrea; surFermer: () => void; lienPartage: () => string }) {
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
    const r = chiffrer(etat, lang);
    const enEuros = chiffrer({ ...etat, devise: 'EUR' }, 'fr');
    const M = (v: number) => montant(v, lang, etat.devise);
    const payload = {
      contact: { name: champs.nom.trim(), email: champs.email.trim(), company: champs.societe.trim(), message: champs.message.trim() },
      language: lang,
      currency: etat.devise,
      selectedDomains: ['creative-design'],
      metadata: { lang, source: 'creative-simulator', planUrl: lienPartage(), provenance: provenance() },
      meta_ids: metaIds(),
      creative: {
        etat,
        lignes: r.lignes.map((l) => ({ libelle: l.libelle, detail: l.detail, montant: M(l.montant) })),
        total: M(r.total),
        economie: r.economie > 0 ? M(r.economie) : '',
        totalEur: Math.round(enEuros.total),
      },
    };
    if (/[?&]envoi=test/.test(window.location.search)) {
      // eslint-disable-next-line no-console
      console.info('[simulateur créa, mode test] envoi non effectué', payload);
      setEtape('ok');
      return;
    }
    setEtape('envoi');
    try {
      const res = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors', body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reponse = await res.json().catch(() => ({}));
      setEtape('ok');
      pousser('creative_quote_submit', {
        form_name: 'creative_simulator', form_location: window.location.pathname, creative_total: Math.round(enEuros.total), currency: etat.devise,
        creative_sets: tranche(etat.jeux), creative_channel: etat.canal, creative_videos: etat.videos,
        ...(reponse?.user_data ? { user_data: reponse.user_data } : {}),
        ...(reponse?.event_id ? { event_id: reponse.event_id } : {}),
      });
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
      <div className="tf-fenetre" role="dialog" aria-modal="true" aria-labelledby="tc-form-titre">
        <button type="button" className="tf-fermer" aria-label={t.fermer} onClick={surFermer}>{Icone.fermer}</button>
        <h3 id="tc-form-titre">{t.titre}</h3>
        {etape === 'ok' ? (
          <p className="tf-ok" role="status">{t.ok}</p>
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
