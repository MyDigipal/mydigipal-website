import { useEffect, useMemo, useRef, useState } from 'react';
import { jour30Copy } from './copy';
import type { Jour30Data, Locale } from './data';
import { formatPrice, nombreLocal, teamDiscount } from './offres';
import { trackSelectItem, withAdClickIds } from './track';
import FormEquipe from './FormEquipe';

const OPTIONS = ['construire', 'session', 'audit'] as const;

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
  const c = copie.configurateur;
  const nombre = (n: number) => nombreLocal(n, locale);
  const offre = (id: string) => data.offres.find((o) => o.id === id);
  const programme = offre('programme')!;
  const assistants = data.offres.filter((o) => o.kind === 'subscription');
  const paliers = data.equipe.paliers;
  const devisAPartirDe = data.equipe.devisAPartirDe;

  const [extras, setExtras] = useState<Set<string>>(new Set());
  const [assistant, setAssistant] = useState<string | null>(null);
  const [places, setPlaces] = useState(1);
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

  const totaux = useMemo(() => {
    let base = programme.ttc_minor;
    for (const id of extras) base += offre(id)?.ttc_minor || 0;
    const mensuelBase = assistant ? offre(assistant)?.ttc_minor || 0 : 0;
    return {
      base,
      unique: Math.round(base * places * (1 - remise)),
      mensuel: Math.round(mensuelBase * places * (1 - remise)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras, assistant, places, remise, programme, data.offres]);

  const recap = useMemo(() => {
    const lignes: Array<{ nom: string; prix: string }> = [{ nom: programme.name, prix: `${formatPrice(programme.ttc_minor, locale)} €` }];
    for (const id of OPTIONS) {
      if (!extras.has(id)) continue;
      const o = offre(id)!;
      lignes.push({ nom: o.name, prix: `${formatPrice(o.ttc_minor, locale)} €` });
    }
    if (places > 1) lignes.push({ nom: c.placesRecap(places), prix: `${formatPrice(totaux.base * places, locale)} €` });
    return lignes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras, places, totaux.base, programme, c, locale, data.offres]);

  const lien = useMemo(() => {
    if (devisSeul) return '#equipe';
    const items = ['programme', ...OPTIONS.filter((id) => extras.has(id))];
    if (assistant) items.push(assistant);
    const q = new URLSearchParams({ items: items.join(','), lang: locale });
    if (places > 1) q.set('seats', String(places));
    return withAdClickIds(`${data.urls.checkout}?${q.toString()}`);
  }, [extras, assistant, places, devisSeul, c.devis, locale, data.urls.checkout]);

  function basculer(id: string) {
    setExtras((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else {
        n.add(id);
        const o = offre(id);
        if (o) trackSelectItem({ tier: o.id, tierName: o.name, value: o.ttc_minor / 100, currency: 'EUR' });
      }
      return n;
    });
  }

  const hausse = (() => {
    const d = new Date(`${data.hausse.date}T00:00:00Z`);
    const jour = d.getUTCDate();
    const mois = d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { month: 'long', timeZone: 'UTC' });
    return c.hausse(formatPrice(data.hausse.ttc_minor, locale), c.dateHausse(jour, mois));
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
    return c.hausseProche(formatPrice(programme.ttc_minor, locale), veilleTexte, formatPrice(data.hausse.ttc_minor, locale));
  })();

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
            {formatPrice(totaux.unique, locale)} <span className="text-[11px] text-brume-nuit">{c.ttc}</span>
          </span>
          <span className="mt-1 block truncate font-ac-mono text-[10.5px] text-brume-nuit">
            {totaux.mensuel ? `+ ${formatPrice(totaux.mensuel, locale)} ${c.parMois}` : places > 1 ? c.uniquePlaces(places) : c.unique}
          </span>
        </span>
        <a href={lien} className={`${cta} px-4 py-2.5 text-[14px]`}>
          {c.ouvrir}
        </a>
      </>
    ) : (
      <>
        <div className="flex items-baseline gap-2">
          <span className="font-ac-mono text-[38px] font-bold leading-none tabular-nums text-or">{formatPrice(totaux.unique, locale)}</span>
          <span className="font-ac-mono text-[12px] text-brume-nuit">{c.ttc}</span>
        </div>
        <p className="m-0 mt-2 font-ac-mono text-[11.5px] text-brume-nuit">{places > 1 ? c.uniquePlaces(places) : c.unique}</p>
        <div className="mt-[18px] flex flex-wrap items-baseline gap-2.5 border-t border-filet-nuit pt-4">
          <span className={`font-ac-mono text-[22px] font-bold leading-[1.2] tabular-nums ${totaux.mensuel ? 'text-ivoire' : 'text-brume-nuit'}`}>
            {totaux.mensuel ? `${formatPrice(totaux.mensuel, locale)} €` : '0 €'}
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
        <p className="mt-3 max-w-[52ch] text-[17px] leading-[1.6] text-corps-nuit">{c.sousTitre}</p>

        <div className="mt-11 grid grid-cols-[minmax(0,1fr)] items-start gap-9 min-[900px]:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className={`${ligne} border-t`}>
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-[5px] bg-or text-[13px] font-bold text-salle">✓</span>
              <span className="min-w-0 flex-[1_1_220px]">
                <span className="block text-[17px] text-ivoire">{programme.name}</span>
                <span className="mt-1 block text-[14px] leading-[1.55] text-brume-nuit">{c.programmeLigne(data.faits.lessons)}</span>
              </span>
              <span className={`${prix} text-or`}>{formatPrice(programme.ttc_minor, locale)} €</span>
            </div>

            {OPTIONS.map((id) => {
              const o = offre(id);
              if (!o) return null;
              const on = extras.has(id);
              return (
                <button key={id} type="button" onClick={() => basculer(id)} aria-pressed={on} className={`${ligne} cursor-pointer border-0 border-b bg-transparent`}>
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-[5px] border text-[13px] font-bold text-salle ${
                      on ? 'border-or bg-or' : 'border-filet-nuit bg-transparent'
                    }`}
                  >
                    {on ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-[1_1_220px]">
                    <span className={`block text-[17px] ${on ? 'text-ivoire' : 'text-corps-nuit'}`}>{o.name}</span>
                    <span className="mt-1 block text-[14px] leading-[1.55] text-brume-nuit">
                      {id === 'construire' ? c.construireLigne(data.faits.lessonsConstruire) : o.tagline}
                    </span>
                  </span>
                  <span className={`${prix} ${on ? 'text-or' : 'text-brume-nuit'}`}>+{formatPrice(o.ttc_minor, locale)} €</span>
                </button>
              );
            })}

            <div className="border-b border-filet-nuit py-6">
              <p className="m-0 mb-1 text-[17px] text-ivoire">{c.assistantTitre}</p>
              <p className="m-0 mb-4 max-w-[56ch] text-[14px] leading-[1.55] text-brume-nuit">{c.assistantLigne}</p>
              <div className="flex flex-wrap gap-2">
                {[null, ...assistants.map((t) => t.id)].map((id) => {
                  const on = assistant === id;
                  const o = id ? offre(id) : null;
                  return (
                    <button
                      key={id || 'sans'}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setAssistant(id)}
                      className={`cursor-pointer rounded-full border px-4 py-[9px] text-[13.5px] transition-[background,border-color] duration-150 ${
                        on ? 'border-or/50 bg-or/[0.14] text-ivoire' : 'border-filet-nuit bg-transparent text-brume-nuit hover:border-brume-nuit'
                      }`}
                    >
                      {o ? `${formatPrice(o.ttc_minor, locale)} €` : c.sans}
                    </button>
                  );
                })}
              </div>
              <p className="m-0 mt-3 font-ac-mono text-[11.5px] text-brume-nuit">
                {assistant ? c.assistantAvec(nombre(offre(assistant)?.monthly_questions || 0)) : c.assistantSans}
              </p>
            </div>

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
