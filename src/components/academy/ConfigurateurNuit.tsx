import { useEffect, useMemo, useRef, useState } from 'react';
import { SYMBOLE, enDevise, prixDe, type Devise, leconsProgramme, leconsGratuit } from './data';
import { jour30Copy } from './copy';
import type { Jour30Data, Locale } from './data';
import { formatPrice, nombreLocal, teamDiscount } from './offres';
import { paramGarde, trackSelectItem, useLienApp } from './track';
import FormEquipe from './FormEquipe';

/**
 * Les add-ons, et eux seuls (01/09/2026). `construire` en est sorti : il ne se
 * coche plus, il fait partie de la formule avancée. C'est tout l'objet du
 * changement demandé après le call OnTrain — on n'achetait pas la même chose au
 * même endroit.
 */
const OPTIONS = ['session', 'audit'] as const;

/**
 * Le configurateur, version nuit : un outil, pas des cartes de prix. Lignes à
 * filets, on coche, le total bouge à droite dans un panneau collant. Sous
 * 900 px, le total vit dans une barre fixée en bas de l'écran, visible
 * seulement pendant que cette section est à l'écran.
 *
 * Les montants viennent de l'app (`data.offres`), jamais d'ici. La
 * composition part au tunnel de l'app DANS L'URL, avec des identifiants
 * d'article et jamais un prix, plus les identifiants de clic publicitaire
 * pour que la conversion garde son attribution en changeant de domaine. Le
 * montant qui fait foi est recalculé par l'app, côté serveur.
 */
export default function ConfigurateurNuit({ locale, data }: { locale: Locale; data: Jour30Data }) {
  const copie = jour30Copy(locale);
  // Le lien gratuit garde l'identifiant de clic, comme celui du tunnel juste
  // au-dessus : les deux sorties de cette page mènent au même achat.
  const gratuit = useLienApp(`${data.urls.base}${locale === 'fr' ? '/fr' : ''}/start`);
  const c = copie.configurateur;
  const nombre = (n: number) => nombreLocal(n, locale);
  const offre = (id: string) => data.offres.find((o) => o.id === id);
  const programme = offre('programme')!;
  const assistants = data.offres.filter((o) => o.kind === 'subscription');
  const paliers = data.equipe.paliers;
  const devisAPartirDe = data.equipe.devisAPartirDe;

  const [extras, setExtras] = useState<Set<string>>(new Set());
  /**
   * Le programme est-il dans le panier ?
   *
   * Demande de Paul du 31/08/2026, précisée le même soir : les deux programmes
   * sont **distincts**. On n'achète pas un socle et son extension, on achète
   * des modules. Quelqu'un peut donc ne prendre que Construire, et il n'aura
   * accès qu'à Construire — le parcours vendu lui reste fermé, faute
   * d'inscription.
   *
   * D'où une case, et non un préalable : le programme est en tête parce qu'il
   * est le plus vendu, pas parce qu'il faut le prendre.
   */
  const [avecProgramme, setAvecProgramme] = useState(true);
  /**
   * ⚠️ L'assistant n'est plus un choix : il est compris dans les deux formules
   * (250 questions avec la méthode, 500 avec l'avancée). L'état reste à null et
   * ne change plus, ce qui laisse le calcul du total et le lien du tunnel
   * exactement comme ils étaient — la ligne mensuelle vaut simplement zéro.
   */
  const [assistant] = useState<string | null>(null);

  /** La formule choisie. `avancee` ajoute les automatisations à la méthode. */
  const [avancee, setAvancee] = useState(false);
  const [places, setPlaces] = useState(1);
  /**
   * La devise consultée. Demande de Paul du 27/08/2026 : un petit bouton pour
   * passer de l'euro à la livre ou au dollar.
   *
   * ⚠️ Elle ne décide de rien. Au paiement, c'est le PAYS de facturation qui
   * commande la devise, ici comme sur le serveur : 340 dollars valent 292 euros,
   * donc un choix libre laisserait chacun prendre la moins chère. Ce sélecteur
   * ne sert qu'à consulter les prix dans sa monnaie, et il présélectionne
   * ensuite un pays cohérent dans le tunnel.
   */
  const [devise, setDevise] = useState<Devise>('EUR');

  // Le choix survit à la navigation : quelqu'un qui a mis des livres ne veut pas
  // le refaire à chaque page. Enveloppé parce que le stockage peut être refusé.
  useEffect(() => {
    try {
      const v = window.localStorage.getItem('academy.devise');
      if (v === 'EUR' || v === 'GBP' || v === 'USD') setDevise(v);
    } catch {
      /* stockage indisponible : on reste en euros */
    }
  }, []);

  function choisirDevise(d: Devise) {
    setDevise(d);
    try {
      window.localStorage.setItem('academy.devise', d);
    } catch {
      /* sans mémoire, le choix vaut pour cette page */
    }
  }

  const sym = SYMBOLE[devise];
  // Le serveur dit quelles devises il sait facturer ; sans lui (page servie
  // depuis un ancien instantané), on n'en propose qu'une plutôt que d'afficher
  // un prix qu'on ne saurait pas encaisser.
  const DEVISES_AFFICHEES: Devise[] = data.devises?.length ? data.devises : ['EUR'];
  const prixOffre = (o: { ttc_minor: number; prix?: Partial<Record<Devise, number>> } | undefined) =>
    o ? prixDe(o, devise) : 0;
  const [visible, setVisible] = useState(false);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => setVisible(es.some((e) => e.isIntersecting)), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const remise = teamDiscount(places, paliers);
  const devisSeul = places >= devisAPartirDe;

  /**
   * Le code promo arrivé avec le visiteur, et ce qu'il donne sur CE panier.
   *
   * ⚠️ Sans ça, un membre du Club Protéine lisait 480 € sur la page de vente et
   * découvrait 240 € au tunnel : le prix change en cours de route, et surtout
   * l'argument des 50 % disparaît au moment où il décide (31/08/2026).
   *
   * Le calcul vient de l'application, pas d'ici : elle seule sait sur quels
   * articles le code porte. Deux calculs pour un seul montant finissent
   * toujours par diverger — c'est le défaut corrigé deux jours plus tôt sur la
   * TVA.
   */
  const [code, setCode] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ total: number; remise: number } | null>(null);
  useEffect(() => setCode(paramGarde('coupon')), []);

  const totaux = useMemo(() => {
    let base = avecProgramme ? prixOffre(programme) : 0;
    for (const id of extras) base += prixOffre(offre(id));
    const mensuelBase = assistant ? prixOffre(offre(assistant)) : 0;
    return {
      base,
      unique: Math.round(base * places * (1 - remise)),
      mensuel: Math.round(mensuelBase * places * (1 - remise)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras, assistant, places, remise, programme, data.offres, devise, avecProgramme]);

  const recap = useMemo(() => {
    const lignes: Array<{ nom: string; prix: string }> = avecProgramme
      ? [{ nom: programme.name, prix: `${formatPrice(prixOffre(programme), locale)} ${sym}` }]
      : [];
    for (const id of OPTIONS) {
      if (!extras.has(id)) continue;
      const o = offre(id)!;
      lignes.push({ nom: o.name, prix: `${formatPrice(prixOffre(o), locale)} ${sym}` });
    }
    if (places > 1) lignes.push({ nom: c.placesRecap(places), prix: `${formatPrice(totaux.base * places, locale)} ${sym}` });
    return lignes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras, places, totaux.base, programme, c, locale, data.offres, devise, sym, avecProgramme]);

  /**
   * L'adresse du tunnel, avant enrichissement.
   *
   * ⚠️ Elle ne passe PLUS par `withAdClickIds` pendant le rendu (corrigé le
   * 31/08/2026). C'était une course perdue d'avance : `captureAdClickIds()` ne
   * tourne que dans un effet, donc au premier rendu la session est encore vide,
   * et ce `useMemo` ne se recalculait jamais ensuite puisque ses dépendances
   * n'avaient pas bougé. Résultat mesuré : un membre du Club Protéine qui
   * suivait le lien de la slide et cliquait « Commencer » tout de suite arrivait
   * au tunnel SANS son code, et lisait 290 € au lieu de 145. Il fallait
   * naviguer une seconde fois pour que ça marche — ce que personne ne fait.
   *
   * `useLienApp` est le mécanisme qui marchait déjà pour les liens vers
   * `/start` : il capte puis lit dans un effet, et garde l'adresse en state,
   * donc elle se recalcule après.
   *
   * ⚠️ Elle vise TOUJOURS le tunnel, même quand on est au-delà du seuil de
   * devis : le hook ne peut pas être appelé conditionnellement, et coller des
   * paramètres sur l'ancre `#equipe` en ferait une URL absolue. Le choix se
   * fait après, à l'usage.
   */
  const lienBrut = useMemo(() => {
    const items = [...(avecProgramme ? ['programme'] : []), ...OPTIONS.filter((id) => extras.has(id))];
    if (assistant) items.push(assistant);
    const q = new URLSearchParams({ items: items.join(','), lang: locale });
    if (places > 1) q.set('seats', String(places));
    // La devise consultée voyage jusqu'au tunnel pour qu'il présélectionne un
    // pays cohérent : sans elle, quelqu'un qui a lu des dollars retomberait sur
    // des euros à la caisse, c'est-à-dire le prix qui change en cours de route.
    if (devise !== 'EUR') q.set('devise', devise);
    return `${data.urls.checkout}?${q.toString()}`;
  }, [extras, assistant, places, locale, data.urls.checkout, devise, avecProgramme]);

  const lienEnrichi = useLienApp(lienBrut);
  const lien = devisSeul ? '#equipe' : lienEnrichi;

  /**
   * Choisir une formule. Une seule des deux à la fois : c'est un choix, pas une
   * addition, et c'est ce qui fait passer de six décisions à deux.
   */
  function choisirFormule(av: boolean) {
    setAvancee(av);
    setExtras((prev) => {
      const n = new Set(prev);
      if (av) {
        n.add('construire');
        // ⚠️ La session est COMPRISE dans l'avancée (Paul, 01/09) : la laisser
        // cochée en add-on la ferait payer deux fois, et l'afficher à 99 € à
        // côté d'une formule qui l'inclut donnerait le sentiment d'un piège.
        n.delete('session');
      } else {
        n.delete('construire');
      }
      return n;
    });
  }

  function basculer(id: string) {
    setExtras((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else {
        n.add(id);
        const o = offre(id);
        if (o) trackSelectItem({ tier: o.id, tierName: o.name, value: prixDe(o, devise) / 100, currency: devise });
      }
      return n;
    });
  }

  // Le prix annoncé pour le 1er octobre suit la devise consultée : annoncer une
  // hausse en euros à quelqu'un qui lit des dollars ferait deux prix différents
  // pour la même date.
  const prixHausse = data.hausse.prix?.[devise] ?? data.hausse.ttc_minor;

  const hausse = (() => {
    const d = new Date(`${data.hausse.date}T00:00:00Z`);
    const jour = d.getUTCDate();
    const mois = d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { month: 'long', timeZone: 'UTC' });
    return enDevise(c.hausse(formatPrice(prixHausse, locale), c.dateHausse(jour, mois)), devise);
  })();
  // À moins de seize jours de la hausse, la ligne devient franche et datée
  // (Paul, 25/08/2026) : c'est vrai, c'est daté, ça décide. Elle disparaît
  // toute seule le jour de la hausse, quand le prix du JSON a changé.
  const hausseProche = (() => {
    const d = new Date(`${data.hausse.date}T00:00:00Z`);
    const jours = (d.getTime() - Date.now()) / 86400000;
    if (jours <= 0 || jours > 16) return null;
    const veille = new Date(d.getTime() - 86400000);
    const veilleTexte = c.dateHausse(veille.getUTCDate(), veille.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { month: 'long', timeZone: 'UTC' }));
    return enDevise(c.hausseProche(formatPrice(prixOffre(programme), locale), veilleTexte, formatPrice(prixHausse, locale)), devise);
  })();

  // La vérification, à chaque changement de panier. Annulable : quelqu'un qui
  // coche trois cases d'affilée ne doit pas voir clignoter trois réponses.
  useEffect(() => {
    if (!code || devisSeul) {
      setPromo(null);
      return;
    }
    const items = [...(avecProgramme ? ['programme'] : []), ...OPTIONS.filter((id) => extras.has(id))];
    if (!items.length) {
      setPromo(null);
      return;
    }
    const ctrl = new AbortController();
    const q = new URLSearchParams({
      code,
      total: String(totaux.unique),
      devise,
      items: items.join(','),
      seats: String(places),
    });
    fetch(`${data.urls.base}/api/academy/public/coupon?${q.toString()}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.valid && d.discount_minor > 0) setPromo({ total: d.total_minor, remise: d.discount_minor });
        else setPromo(null);
      })
      .catch(() => {
        /* code injoignable : on montre le prix plein, le tunnel fera foi */
      });
    return () => ctrl.abort();
  }, [code, devisSeul, avecProgramme, extras, totaux.unique, devise, places, data.urls.base]);

  const paliersPct = paliers.map((t) => ({ seats: t.seats, pct: Math.round(t.discount * 100) }));
  const ligne = 'flex w-full flex-wrap items-baseline gap-x-5 gap-y-3 border-b border-filet-nuit py-5 text-left';
  const prix = 'font-ac-mono text-[17px] font-bold';
  const cta = 'block whitespace-nowrap rounded-bouton bg-or px-5 py-3.5 text-center text-[15.5px] font-semibold text-salle transition duration-150 hover:bg-or-vif';

  const Total = ({ compact = false }: { compact?: boolean }) =>
    devisSeul ? (
      <>
        {!compact && <p className="m-0 text-[20px] leading-[1.4] text-ivoire">{c.devisTexte(devisAPartirDe)}</p>}
        {compact ? (
          <a href={lien} className={`${cta} px-4 py-2.5 text-[14px]`}>
            {c.devis}
          </a>
        ) : (
          <FormEquipe locale={locale} seats={places} base={data.urls.base} c={c.equipe} />
        )}
      </>
    ) : compact ? (
      <>
        <span className="min-w-0 flex-1">
          <span className="block font-ac-mono text-[22px] font-bold leading-none tabular-nums text-or">
            {promo && <s className="mr-1.5 text-[14px] font-normal text-brume-nuit">{formatPrice(totaux.unique, locale)}</s>}
            {formatPrice(promo ? promo.total : totaux.unique, locale)}{' '}
            <span className="text-[11px] text-brume-nuit">{enDevise(c.ttc, devise)}</span>
          </span>
          <span className="mt-1 block truncate font-ac-mono text-[10.5px] text-brume-nuit">
            {totaux.mensuel ? `+ ${formatPrice(totaux.mensuel, locale)} ${enDevise(c.parMois, devise)}` : places > 1 ? c.uniquePlaces(places) : c.unique}
          </span>
        </span>
        <a href={lien} className={`${cta} px-4 py-2.5 text-[14px]`}>
          {c.ouvrir}
        </a>
      </>
    ) : (
      <>
        <div className="flex items-baseline gap-2">
          {promo && (
            <s className="font-ac-mono text-[20px] font-normal leading-none tabular-nums text-brume-nuit">
              {formatPrice(totaux.unique, locale)}
            </s>
          )}
          <span className="font-ac-mono text-[38px] font-bold leading-none tabular-nums text-or">
            {formatPrice(promo ? promo.total : totaux.unique, locale)}
          </span>
          <span className="font-ac-mono text-[12px] text-brume-nuit">{enDevise(c.ttc, devise)}</span>
        </div>
        {/* Le code et ce qu'il porte, dit en toutes lettres : une remise dont on
            ne sait pas d'où elle vient inquiète autant qu'elle réjouit. */}
        {promo && code && (
          <p className="m-0 mt-2 font-ac-mono text-[11.5px] font-bold text-or">
            {c.remiseCode(code.toUpperCase(), Math.round((promo.remise / (totaux.unique || 1)) * 100))}
          </p>
        )}
        <p className="m-0 mt-2 font-ac-mono text-[11.5px] text-brume-nuit">{places > 1 ? c.uniquePlaces(places) : c.unique}</p>
        <div className="mt-[18px] flex flex-wrap items-baseline gap-2.5 border-t border-filet-nuit pt-4">
          <span className={`font-ac-mono text-[22px] font-bold leading-[1.2] tabular-nums ${totaux.mensuel ? 'text-ivoire' : 'text-brume-nuit'}`}>
            {totaux.mensuel ? `${formatPrice(totaux.mensuel, locale)} ${sym}` : `0 ${sym}`}
          </span>
          <span className="font-ac-mono text-[11.5px] leading-[1.4] text-brume-nuit">{totaux.mensuel ? c.mensuel : c.sansAbo}</span>
        </div>
        <div className="mt-5 grid gap-[9px] border-t border-filet-nuit pt-4">
          {recap.map((r) => (
            <div key={r.nom} className="flex items-baseline justify-between gap-3.5 text-[13.5px] leading-[1.4] text-corps-nuit">
              <span>{r.nom}</span>
              <span className="whitespace-nowrap font-ac-mono text-brume-nuit">{r.prix}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-3.5 text-[13.5px] leading-[1.4] text-or" style={{ opacity: remise ? 1 : 0.25 }}>
            <span>{c.remiseLigne}</span>
            <span className="whitespace-nowrap font-ac-mono">{remise ? `-${Math.round(remise * 100)} %` : '0 %'}</span>
          </div>
        </div>
        <a href={lien} className={`${cta} mt-6`}>
          {c.ouvrir}
        </a>
        {/* La porte d'entree gratuite, la ou le prix vient d'etre lu : c'est le
            seul endroit ou quelqu'un qui hesite la cherche (Paul, 29/08/2026). */}
        <a
          href={gratuit}
          className="mt-3 block text-center text-[13px] leading-[1.5] text-brume-nuit underline decoration-filet-nuit underline-offset-4 transition hover:text-ivoire"
        >
          {c.gratuitLigne(leconsGratuit(data))}
        </a>
        {hausseProche ? (
          <p className="m-0 mt-3 text-center text-[14px] font-medium leading-[1.5] text-or">{hausseProche}</p>
        ) : (
          <p className="m-0 mt-3 text-center text-[12.5px] leading-[1.5] text-brume-nuit">{hausse}</p>
        )}
      </>
    );

  return (
    <section ref={section} id="pricing" className="scroll-mt-20 border-t border-filet-nuit px-4 pb-28 pt-[84px] sm:px-6 lg:pb-[84px]">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="m-0 max-w-[20ch] text-balance text-[clamp(26px,3.8vw,42px)] font-medium leading-[1.12] tracking-[-0.025em] text-ivoire">
          {c.titre}
        </h2>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <p className="m-0 max-w-[52ch] text-[17px] leading-[1.6] text-corps-nuit">{c.sousTitre}</p>

          {/*
            Le sélecteur de devise. Trois codes, pas de menu déroulant : le choix
            tient sur une ligne et se lit sans être ouvert.

            Il ne change que l'affichage. La devise facturée est celle du pays
            de facturation, décidée au tunnel puis revérifiée sur le serveur.
          */}
          <div role="group" aria-label={c.deviseLabel} className="flex flex-none overflow-hidden rounded-bouton border border-filet-nuit">
            {DEVISES_AFFICHEES.map((d) => {
              const actif = d === devise;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => choisirDevise(d)}
                  aria-pressed={actif}
                  className={`min-h-11 cursor-pointer border-0 px-3.5 font-ac-mono text-[12.5px] font-semibold tabular-nums transition duration-150 ${
                    actif ? 'bg-or text-salle' : 'bg-transparent text-brume-nuit hover:text-ivoire'
                  }`}
                >
                  {SYMBOLE[d]} {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-11 grid grid-cols-[minmax(0,1fr)] items-start gap-9 min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            {/*
              LES DEUX FORMULES (01/09/2026, après le call OnTrain).

              Avant : six cases à cocher, dont la méthode, les automatisations,
              deux services et cinq boutons d'assistant, toutes au même niveau.
              On n'y voyait plus ce qu'on achetait et ce qu'on ajoutait.

              Maintenant : un choix entre deux formules, et les add-ons dans leur
              propre bloc, après. Deux décisions au lieu de six.
            */}
            <p className="m-0 mb-3 font-ac-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brume-nuit">{c.formuleRub}</p>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5 min-[720px]:grid-cols-2">
              {[false, true].map((av) => {
                const on = avancee === av;
                const prixTtc = av
                  ? prixOffre(programme) + prixOffre(offre('construire'))
                  : prixOffre(programme);
                const questions = av ? 500 : 250;
                return (
                  <button
                    key={String(av)}
                    type="button"
                    onClick={() => choisirFormule(av)}
                    aria-pressed={on}
                    className={`flex cursor-pointer flex-col rounded-carte border bg-transparent p-5 text-left transition-[border-color,background] duration-150 ${
                      on ? 'border-or/55 bg-or/[0.07]' : 'border-filet-nuit hover:border-brume-nuit'
                    }`}
                  >
                    <span className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[12px] font-bold text-salle ${
                          on ? 'border-or bg-or' : 'border-filet-nuit bg-transparent'
                        }`}
                      >
                        {on ? '✓' : ''}
                      </span>
                      <span className={`text-[18px] leading-tight ${on ? 'text-ivoire' : 'text-corps-nuit'}`}>
                        {av ? c.avanceeNom : programme.name}
                      </span>
                    </span>
                    <span className="mt-3 flex items-baseline gap-2">
                      <span className={`font-ac-mono text-[30px] font-bold tabular-nums leading-none ${on ? 'text-or' : 'text-brume-nuit'}`}>
                        {formatPrice(prixTtc, locale)}
                      </span>
                      <span className="font-ac-mono text-[12px] text-brume-nuit">
                        {sym} {c.parMoisCourt}
                      </span>
                    </span>
                    {/*
                      La checklist, demandee par Paul le 01/09 : « il faut
                      vraiment qu'on voie bien ce qu'ils vont avoir, en mode
                      productiviste ». Une ligne de resume ne disait pas ce qu'on
                      achete ; six lignes cochees le disent.
                    */}
                    <span className="mt-4 block border-t border-filet-nuit pt-3.5">
                      {(av
                        ? c.contenuAvancee({
                            lecons: data.faits.lessonsConstruire,
                            relectures: data.faits.relectures,
                          })
                        : c.contenuMethode({
                            lecons: leconsProgramme(data),
                            prompts: data.faits.prompts,
                            trophees: data.faits.trophees,
                          })
                      ).map((l) => (
                        <span key={l} className="mt-2 flex items-start gap-2.5 first:mt-0">
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke={on ? '#c8a951' : '#7d879b'}
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="mt-[3px] flex-none"
                          >
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <span className={`text-[13.5px] leading-[1.5] ${on ? 'text-corps-nuit' : 'text-brume-nuit'}`}>{l}</span>
                        </span>
                      ))}
                    </span>
                    <span className="mt-3.5 block border-t border-filet-nuit pt-3 text-[13.5px] leading-[1.5] text-assistant">
                      {c.assistantInclus(nombre(questions))}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* LES ADD-ONS, dans leur propre bloc, après le choix. */}
            <div className="mt-9 border-t border-filet-nuit pt-7">
              <p className="m-0 font-ac-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brume-nuit">{c.addonsRub}</p>
              <p className="m-0 mt-1.5 text-[14px] leading-[1.55] text-brume-nuit">{c.addonsLigne}</p>
            </div>

            {OPTIONS.map((id) => {
              const o = offre(id);
              if (!o) return null;
              const on = extras.has(id);
              // La session est comprise dans l'avancée : on la montre, éteinte,
              // plutôt que de la faire disparaître — sinon on croit l'avoir
              // perdue en changeant de formule.
              const comprise = id === 'session' && avancee;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => !comprise && basculer(id)}
                  aria-pressed={on}
                  aria-disabled={comprise}
                  className={`${ligne} border-0 border-b bg-transparent ${comprise ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                >
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-[5px] border text-[13px] font-bold text-salle ${
                      on ? 'border-or bg-or' : 'border-filet-nuit bg-transparent'
                    }`}
                  >
                    {on ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-[1_1_220px]">
                    <span className={`block text-[17px] ${on ? 'text-ivoire' : 'text-corps-nuit'}`}>{o.name}</span>
                    <span className="mt-1 block text-[14px] leading-[1.55] text-brume-nuit">{o.tagline}</span>
                  </span>
                  <span className={`${prix} ${comprise ? 'text-assistant' : on ? 'text-or' : 'text-brume-nuit'}`}>
                    {comprise ? c.dejaComprise : `+${formatPrice(prixOffre(o), locale)} ${sym}`}
                  </span>
                </button>
              );
            })}

            <div className="py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2.5">
                <label htmlFor="j30-places" className="text-[17px] text-ivoire">
                  {c.places}
                </label>
                <span className="font-ac-mono text-[15px] text-or">{c.placesLabel(places, devisAPartirDe)}</span>
              </div>
              <input
                id="j30-places"
                type="range"
                min={1}
                max={devisAPartirDe}
                step={1}
                value={places}
                onChange={(e) => setPlaces(Number(e.target.value))}
                className="mt-4 w-full"
              />
              <p className="m-0 mt-2.5 font-ac-mono text-[11.5px] text-brume-nuit">{remise ? c.remise(Math.round(remise * 100)) : c.remiseInfo(paliersPct)}</p>

              {/* L'image n'apparaît qu'à partir de la deuxième place : elle ne
                  décore pas la ligne, elle accompagne un choix qu'on vient de
                  faire. Quelqu'un qui achète pour lui n'a rien à faire d'une
                  photo d'équipe. */}
              {places > 1 && (
                <figure className="m-0 mt-5 overflow-hidden rounded-carte border border-filet-nuit bg-encre">
                  <img
                    src="/academy/visuels/equipe-trois_carre.jpg"
                    alt={c.equipeAlt}
                    width={1000}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                    className="block h-full w-full object-cover"
                    style={{ aspectRatio: '16 / 9', objectPosition: '50% 42%' }}
                  />
                </figure>
              )}
            </div>
          </div>

          <aside className="hidden rounded-carte border border-or/[0.28] bg-salle-2 p-[26px] min-[900px]:sticky min-[900px]:top-24 min-[900px]:block">
            <p className="m-0 mb-[18px] font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-brume-nuit">{c.total}</p>
            <Total />
          </aside>
        </div>

        {/* Les liens vers l'application, à la place d'un second pied de page :
            conditions de vente, confidentialité, mentions, espace apprenant. */}
        <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-filet-nuit pt-6 text-[13px]">
          {copie.pied.liens.map((l) => (
            <a key={l.cle} href={data.urls[l.cle as keyof typeof data.urls]} className="text-brume-nuit transition duration-150 hover:text-ivoire">
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-or/[0.28] bg-salle/95 px-4 py-3 backdrop-blur transition-transform duration-300 min-[900px]:hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        aria-hidden={!visible}
      >
        <Total compact />
      </div>
    </section>
  );
}
