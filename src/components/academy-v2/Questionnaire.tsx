import { useEffect, useMemo, useRef, useState } from 'react';
import { SYMBOLE, type Devise, type Locale } from '../academy/data';
import { formatPrice } from '../academy/offres';
import { paramGarde, useLienApp } from '../academy/track';
import { copyV2 } from './copy-v2';
import Glyphe from './Glyphe';
import {
  MODULES_SUIVIS,
  PROFILS,
  QUESTIONS,
  dureeCourte,
  resoudre,
  type ProfilId,
} from './diagnostic';

/**
 * Le questionnaire de profil, sur la page de vente.
 *
 * Quatre questions, la grille des modules qui se trie en trois niveaux, et un
 * bouton qui part au tunnel avec la composition déjà faite. Conçu et validé
 * dans `labo/quiz-profil.html` avant d'être porté ici, comme le veut la règle
 * du 01/09 : une maquette autonome ne prouve pas qu'un effet tient dans une
 * page qui a déjà onze blocs.
 *
 * ⚠️ Les cartes ne se DÉPLACENT jamais, seules l'opacité et la couleur
 * changent. Faire voyager vingt cartes donnerait un remue-ménage où le regard
 * perd celles qu'il suivait, et sur un téléphone ce serait illisible.
 *
 * Toute la logique et les textes sont dans `diagnostic.ts`, qui est pur.
 *
 * ⚠️ Le composant ne s'appelle PAS `Diagnostic.tsx`, et c'est délibéré : le
 * système de fichiers de Windows ignore la casse, donc `import from
 * './Diagnostic'` résolvait vers `diagnostic.ts` et le build cassait sur un
 * « "default" is not exported ». Deux fichiers du même dossier ne peuvent pas
 * porter le même nom à la casse près.
 */
export default function Questionnaire({
  locale,
  devise,
  prixMethodeMinor,
  prixAvanceeMinor,
}: {
  locale: Locale;
  devise: Devise;
  /** Les mêmes montants que la grille de tarifs, dans la devise affichée. */
  prixMethodeMinor: number;
  prixAvanceeMinor: number;
}) {
  const c = copyV2(locale).diagnostic;

  /**
   * ⚠️ Deux erreurs corrigées ici le 08/09, après un 404 en production.
   *
   * 1. Le tunnel n'existe qu'à `/checkout`, JAMAIS `/fr/checkout` : sa langue
   *    passe par `?lang=`. C'est écrit dans la section 15 du CLAUDE.md de
   *    l'app, et j'y suis quand même tombé.
   * 2. Le lien doit passer par `useLienApp`, qui recolle les identifiants de
   *    clic publicitaire et le code promo captés à l'arrivée. Sans lui, un
   *    visiteur venu d'une annonce perd son `gclid` en route, et un membre du
   *    Club Protéine arrive au tunnel sans sa remise.
   *
   * ⚠️ Les deux liens se calculent inconditionnellement : `useLienApp` est un
   * hook, il ne s'appelle pas dans une branche.
   */
  /**
   * ⚠️ Les prix viennent de l'application, dans la devise choisie en haut de
   * page. Ils étaient écrits en dur dans la copie (« 290 € », « 480 € ») :
   * quelqu'un qui basculait la barre en livres lisait 250 £ dans la grille de
   * tarifs et 290 € ici, sur le même écran. Deux prix pour un seul produit,
   * c'est ce qui fait refermer un onglet.
   */
  const montant = (minor: number) => `${formatPrice(minor, locale)} ${SYMBOLE[devise]}`;

  /**
   * ⚠️ LE CODE PROMO. Sans ça, quelqu'un du Club Protéine lisait « 336 € »
   * dans la grille de tarifs et « 480 € » ici, sur la même page (constaté le
   * 08/09, la veille de sa séance). Deux prix pour un seul panier, et celui du
   * questionnaire est le plus visible puisqu'il vient d'être calculé pour lui.
   *
   * ⚠️ Le montant remisé vient de l'APPLICATION, jamais d'un calcul refait ici :
   * un code ne porte pas forcément sur tout le panier, et deux calculs pour un
   * seul prix finissent toujours par diverger. Même requête que la grille.
   */
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => setCode(paramGarde('coupon')), []);
  const [remise, setRemise] = useState<{ methode: number | null; avancee: number | null } | null>(null);

  useEffect(() => {
    if (!code) {
      setRemise(null);
      return;
    }
    const ctrl = new AbortController();
    const demande = (items: string, minor: number) =>
      fetch(
        `https://academy.mydigipal.com/api/academy/public/coupon?${new URLSearchParams({
          code,
          total: String(minor),
          devise,
          items,
          seats: '1',
        }).toString()}`,
        { signal: ctrl.signal },
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (d?.valid && d.discount_minor > 0 ? (d.total_minor as number) : null))
        .catch(() => null);
    Promise.all([
      demande('programme', prixMethodeMinor),
      demande('programme,construire', prixAvanceeMinor),
    ]).then(([m, a]) => setRemise(m || a ? { methode: m, avancee: a } : null));
    return () => ctrl.abort();
  }, [code, devise, prixMethodeMinor, prixAvanceeMinor]);

  const base = 'https://academy.mydigipal.com/checkout';
  const lienMethode = useLienApp(`${base}?items=programme&lang=${locale}`);
  const lienAvancee = useLienApp(`${base}?items=programme,construire&lang=${locale}`);
  const [etape, setEtape] = useState(0);
  const [reponses, setReponses] = useState<number[][]>([]);
  const [pris, setPris] = useState<Set<number>>(new Set());
  const [fini, setFini] = useState(false);
  const grilleRef = useRef<HTMLDivElement>(null);

  // Les scores se RECALCULENT depuis les réponses, ils ne s'accumulent pas dans
  // un état à part. Sinon « Revenir » doit défaire à la main ce que la réponse
  // avait posé, et le premier ajout de question introduit un décalage muet.
  const scores = useMemo(() => {
    const s: Record<ProfilId, number> = { debut: 0, auto: 0, plume: 0, chiffre: 0, bati: 0, manage: 0 };
    reponses.forEach((ks, i) => {
      (ks || []).forEach((k) => {
        const o = QUESTIONS[i]?.opts[k];
        if (!o) return;
        for (const [p, v] of Object.entries(o.p)) s[p as ProfilId] += v as number;
      });
    });
    return s;
  }, [reponses]);

  const outils = useMemo(() => {
    const out: string[] = [];
    reponses.forEach((ks, i) => {
      (ks || []).forEach((k) => {
        const o = QUESTIONS[i]?.opts[k];
        if (o && o.outil) out.push(o.outil);
      });
    });
    return out;
  }, [reponses]);

  const res = useMemo(() => resoudre(scores), [scores]);

  /**
   * ⚠️ Sous lg, la grille passe SOUS le panneau : sans ce défilement, on répond
   * à la dernière question et le tri des modules se joue hors de l'écran, alors
   * que c'est tout l'intérêt du questionnaire. Au-dessus de lg, les deux
   * colonnes sont côte à côte et on ne bouge rien.
   *
   * ⚠️ Dans un effet, et non dans le gestionnaire de clic : mesuré le 08/09, le
   * panneau de résultat est plus haut que la question qu'il remplace, donc au
   * moment du clic la grille n'est pas encore à sa position finale et on
   * défilait 1 100 px trop court. Deux images d'attente pour que la mise en
   * page soit posée.
   */
  useEffect(() => {
    if (!fini) return;
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;
    const doux = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // ⚠️ Un délai, PAS requestAnimationFrame. Mesuré le 08/09 : dans un
    // navigateur piloté, et dans un onglet en arrière-plan, rAF ne se déclenche
    // simplement pas, et le défilement n'avait jamais lieu. Un setTimeout part
    // dans tous les cas, et 120 ms suffisent pour que la mise en page du
    // panneau de résultat soit posée.
    const id = window.setTimeout(() => {
      const el = grilleRef.current;
      if (!el) return;
        // ⚠️ Pas de scrollIntoView : la page enveloppe tout dans un
        // `overflow-x-clip`, qui crée un contexte de défilement et fait que
        // l'appel ne remonte jamais jusqu'au document. Mesuré le 08/09, il ne
        // déplaçait rien. On calcule la position et on défile la fenêtre.
      const y = window.scrollY + el.getBoundingClientRect().top - 76;
      window.scrollTo({ top: y, behavior: doux ? 'auto' : 'smooth' });
    }, 120);
    return () => window.clearTimeout(id);
  }, [fini]);
  const q = QUESTIONS[etape];

  function basculer(k: number) {
    if (!q.multi) {
      valider([k]);
      return;
    }
    // ⚠️ « Je ne sais pas encore » est exclusif : le cocher avec trois outils
    // n'aurait aucun sens, et l'inverse non plus.
    const exclusif = q.opts[k].outil === null;
    setPris((avant) => {
      const s = new Set(avant);
      if (exclusif) return s.has(k) ? new Set<number>() : new Set([k]);
      q.opts.forEach((o, i) => {
        if (o.outil === null) s.delete(i);
      });
      if (s.has(k)) s.delete(k);
      else s.add(k);
      return s;
    });
  }

  function valider(ks: number[]) {
    const suite = [...reponses];
    suite[etape] = ks;
    setReponses(suite);
    setPris(new Set());
    if (etape + 1 < QUESTIONS.length) {
      setEtape(etape + 1);
      return;
    }
    setFini(true);
  }

  function reculer() {
    const suite = [...reponses];
    const cible = etape - 1;
    setPris(new Set(suite[cible] || []));
    suite[cible] = [];
    setReponses(suite);
    setEtape(cible);
  }

  function recommencer() {
    setReponses([]);
    setPris(new Set());
    setEtape(0);
    setFini(false);
  }

  const p = PROFILS[res.profil];
  const lettres = 'ABCDE';

  const phraseOutils =
    outils.length === 0 ? '' : outils.length === 1 ? c.outilUn(outils[0]) : c.outilPlusieurs(outils);

  return (
    <section id="diagnostic" className="scroll-mt-20 border-t border-filet-nuit px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <p className="m-0 mb-3 font-ac-mono text-[11px] font-bold uppercase tracking-[.2em] text-or">
          {c.kicker}
        </p>
        <h2 className="m-0 mb-3.5 max-w-[22ch] text-[clamp(26px,3.4vw,38px)] font-medium leading-[1.12] tracking-[-0.02em] text-ivoire">
          {c.titre}
        </h2>
        <p className="m-0 mb-9 max-w-[60ch] text-[17px] leading-[1.6] text-brume-nuit">{c.chapeau}</p>

        {/* ⚠️ `grid-cols-[minmax(0,1fr)]` en base, sinon la colonne implicite
            `auto` s'élargit à la min-content et déborde sous lg. */}
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-11">
          <div>
            {!fini ? (
              <div
                key={etape}
                className="relative overflow-hidden rounded-carte border border-filet-nuit bg-salle-2 p-6 motion-safe:animate-[dgEntre_.42s_cubic-bezier(.22,1,.36,1)_both]"
              >
                <span
                  className="absolute left-0 top-0 h-0.5 bg-or transition-[width] duration-500"
                  style={{ width: `${(etape / QUESTIONS.length) * 100}%` }}
                />
                <p className="m-0 mb-2.5 font-ac-mono text-[11px] uppercase tracking-[.16em] text-brume-nuit">
                  {c.numero(etape + 1, QUESTIONS.length)}
                </p>
                <p className="m-0 mb-3 text-[21px] font-medium leading-[1.3] text-ivoire">{q.q[locale]}</p>
                {q.multi && (
                  <p className="m-0 mb-3.5 font-ac-mono text-[10.5px] uppercase tracking-[.1em] text-brume-nuit">
                    {c.plusieurs}
                  </p>
                )}

                <div className="flex flex-col gap-2.5">
                  {q.opts.map((o, k) => {
                    const coche = pris.has(k);
                    return (
                      <button
                        key={o.t.en}
                        type="button"
                        aria-pressed={q.multi ? coche : undefined}
                        onClick={() => basculer(k)}
                        className={`flex min-h-11 w-full cursor-pointer items-center gap-3.5 rounded-[11px] border px-4 py-3 text-left text-[15px] leading-[1.4] transition active:scale-[.99] ${
                          coche
                            ? 'border-or bg-or/10 text-ivoire'
                            : 'border-filet-nuit bg-transparent text-corps-nuit hover:border-or hover:bg-or/[.06]'
                        }`}
                      >
                        <span
                          className={`grid h-[26px] w-[26px] flex-none place-items-center rounded-[7px] border font-ac-mono text-[11px] transition ${
                            coche ? 'border-or bg-or text-salle' : 'border-filet-nuit text-brume-nuit'
                          }`}
                        >
                          {lettres[k]}
                        </span>
                        <span>{o.t[locale]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4.5 flex flex-wrap items-center gap-3.5">
                  {q.multi && (
                    <button
                      type="button"
                      disabled={pris.size === 0}
                      onClick={() => valider([...pris])}
                      className="min-h-11 cursor-pointer rounded-[10px] border-0 bg-or px-6 py-3 font-medium text-salle transition hover:bg-or-vif disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {c.continuer}
                    </button>
                  )}
                  {etape > 0 && (
                    <button
                      type="button"
                      onClick={reculer}
                      className="min-h-11 cursor-pointer border-0 bg-transparent px-0 font-ac-mono text-[12px] uppercase tracking-[.1em] text-brume-nuit hover:text-or"
                    >
                      {c.revenir}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-carte border border-or bg-salle-2 p-7 motion-safe:animate-[dgEntre_.5s_cubic-bezier(.22,1,.36,1)_both]">
                <p className="m-0 mb-2.5 font-ac-mono text-[11px] uppercase tracking-[.16em] text-brume-nuit">
                  {c.votreProfil}
                </p>
                <p className="m-0 text-[27px] font-semibold leading-[1.15] tracking-[-0.01em] text-ivoire">
                  {p.nom[locale]}
                </p>
                <p className="m-0 mt-2.5 text-[15.5px] leading-[1.6] text-corps-nuit">
                  {p.sous[locale]}
                  {phraseOutils ? ` ${phraseOutils}` : ''}
                </p>

                {/* ⚠️ Les modules du cœur, nommés, sous lg SEULEMENT. Au-dessus
                    de lg la grille est juste à côté et les répéter serait une
                    redite ; en dessous elle passe sous le panneau, donc sans
                    cette liste on lit son profil sans jamais savoir ce qu'on
                    va ouvrir. Le défilement automatique vers la grille existe,
                    mais on ne fait pas reposer l'information dessus. */}
                <ol className="m-0 mt-5 list-none border-t border-filet-nuit p-0 pt-4 lg:hidden">
                  <li className="mb-2 font-ac-mono text-[10.5px] uppercase tracking-[.16em] text-brume-nuit">
                    {c.parLa}
                  </li>
                  {res.coeur.map((id, i) => {
                    const m = MODULES_SUIVIS.find((x) => x.id === id);
                    if (!m) return null;
                    const pro = m.palier === 'pro';
                    return (
                      <li key={id} className="flex items-baseline gap-2.5 border-b border-filet-nuit py-2 last:border-b-0">
                        <span className={`font-ac-mono text-[11px] ${pro ? 'text-avance' : 'text-or'}`}>{i + 1}</span>
                        <span className="text-[14px] leading-[1.4] text-corps-nuit">{m.titre[locale]}</span>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-5.5 border-t border-filet-nuit pt-5">
                  <p className="m-0 mb-2 font-ac-mono text-[10.5px] uppercase tracking-[.16em] text-brume-nuit">
                    {c.formule}
                  </p>
                  <p className="m-0 text-[19px] font-medium text-ivoire">
                    {res.avance ? c.offreAvancee : c.offreMethode}
                  </p>
                  {(() => {
                    const plein = res.avance ? prixAvanceeMinor : prixMethodeMinor;
                    const remise2 = res.avance ? remise?.avancee : remise?.methode;
                    return (
                      <p className="m-0 mt-1.5 flex flex-wrap items-baseline gap-2.5 text-[31px] font-medium tracking-[-0.02em] text-or">
                        {montant(remise2 ?? plein)}
                        {remise2 != null && (
                          <span className="text-[17px] font-normal text-brume-nuit line-through">
                            {montant(plein)}
                          </span>
                        )}
                        <small className="text-[14px] font-normal tracking-normal text-brume-nuit">
                          {c.duree}
                          {remise2 != null && code ? ` · ${c.avecCode(code)}` : ''}
                        </small>
                      </p>
                    );
                  })()}
                  <p className="m-0 mt-3.5 text-[14.5px] leading-[1.6] text-brume-nuit">
                    {p.pourquoi[locale]}
                  </p>

                  <a
                    href={res.avance ? lienAvancee : lienMethode}
                    className={`mt-5 inline-flex min-h-12 items-center justify-center rounded-[11px] px-7 py-3.5 text-[15.5px] font-semibold text-salle transition ${
                      res.avance ? 'bg-avance hover:brightness-110' : 'bg-or hover:bg-or-vif'
                    }`}
                  >
                    {c.cta}
                  </a>
                  <button
                    type="button"
                    onClick={recommencer}
                    className="mt-3.5 block min-h-11 cursor-pointer border-0 bg-transparent px-0 font-ac-mono text-[12px] uppercase tracking-[.1em] text-brume-nuit hover:text-or"
                  >
                    {c.refaire}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div ref={grilleRef} className="scroll-mt-24">
            <p className="m-0 mb-3 font-ac-mono text-[12px] text-brume-nuit">
              {fini
                ? c.compteFini(res.retenus, res.total, res.coeur.length, dureeCourte(res.minutesCoeur, locale))
                : c.compteDepart(MODULES_SUIVIS.length)}
            </p>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2.5">
              {MODULES_SUIVIS.map((m, i) => {
                const rang = fini ? res.coeur.indexOf(m.id) : -1;
                const vif = rang >= 0;
                const eteint = fini && res.ecarte.has(m.id);
                const pro = m.palier === 'pro';
                return (
                  <div
                    key={m.id}
                    style={{ transitionDelay: `${i * 22}ms` }}
                    className={`relative flex min-h-[78px] flex-col gap-1.5 rounded-[11px] border p-3 transition-[opacity,transform,border-color,background-color] duration-500 ${
                      vif
                        ? pro
                          ? 'border-avance bg-avance/[.08] opacity-100'
                          : 'border-or bg-or/[.07] opacity-100'
                        : eteint
                          ? 'scale-[.94] border-filet-nuit bg-salle-2 opacity-10'
                          : fini
                            ? 'border-filet-nuit bg-salle-3 opacity-90'
                            : 'border-filet-nuit bg-salle-2 opacity-[.34]'
                    }`}
                  >
                    {vif && (
                      <span
                        className={`absolute right-2.5 top-2 font-ac-mono text-[9.5px] ${pro ? 'text-avance' : 'text-or'}`}
                      >
                        {rang + 1}
                      </span>
                    )}
                    <span className={pro && vif ? 'text-avance' : vif ? 'text-or' : 'text-brume-nuit'}>
                      <Glyphe nom={m.glyphe} taille={15} />
                    </span>
                    <span
                      className={`pr-3.5 text-[12.5px] leading-[1.28] ${vif ? 'text-ivoire' : 'text-corps-nuit'}`}
                    >
                      {m.titre[locale]}
                    </span>
                    <span
                      className={`mt-auto font-ac-mono text-[9.5px] uppercase tracking-[.08em] ${
                        vif ? (pro ? 'text-avance' : 'text-or') : 'text-brume-nuit'
                      }`}
                    >
                      {m.palier === 'pro' ? c.paliers.pro : m.palier === 'free' ? c.paliers.free : c.paliers.essentials}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3.5 flex flex-wrap gap-4.5 font-ac-mono text-[11px] tracking-[.06em] text-brume-nuit">
              <span className="inline-flex items-center gap-2">
                <i className="block h-2.5 w-2.5 rounded-[3px] bg-or" /> {c.legendeMethode}
              </span>
              <span className="inline-flex items-center gap-2">
                <i className="block h-2.5 w-2.5 rounded-[3px] bg-avance" /> {c.legendeAuto}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
