/**
 * Calculateur v6 : un bloc, une question à la fois (parcours B, retenu par Paul le 22/09/2026).
 *
 * - Téléphone : la question occupe le bloc, la barre du total reste collée en bas.
 *   Chaque question a un lien « C'est quoi ? » qui ouvre une fiche avec la vidéo.
 * - Ordinateur (lg) : même parcours à gauche, et à droite le « guide » (direction D1) :
 *   au repos il présente le service en cours et sa vidéo, au survol d'une option, d'un
 *   réseau, du budget ou des honoraires il explique l'élément survolé.
 *
 * Pilotage et maquettes : docs/calculator/refonte-2026-09/calculateur-en-etapes.html
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Currency, ServiceDomain } from '../calculator/types';
import { CURRENCY_CONFIGS, DURATION_CONFIG } from '../calculator/data';
import { track, trackBudget, trackChannel, trackDomain, trackService, trackStep, trackAbandon } from '../calculator/tracking';
import {
  BUDGET_STEPS, DEFAULT_BUDGET, DOMAIN_ORDER, QUESTION_INDEX, buildPayload, channelsOf, devis, domainDesc, domainName,
  emptyState, inOrder, money, optionsFor, perLabel, questionsFor, sequence, t,
  type Contact, type Lang, type Question, type QuoteState
} from './engine';
import { info, restKey, termsFor, type Info } from './content';
import { VIDEOS } from './videos';

const WEBHOOK = 'https://n8n.mydigipal.com/webhook/calculateur-marketing';
const AUTO_ADVANCE_MS = 280;

interface Props {
  lang: Lang;
  /** Page de test : affiche les emplacements vidéo encore vides. */
  showEmptyVideoSlots?: boolean;
  /** Page de test : n'envoie rien, montre le contenu de l'envoi dans la console. */
  dryRun?: boolean;
}

const L = (lang: Lang, fr: string, en: string) => (lang === 'fr' ? fr : en);

// --- petites icônes (tracés simples, pas de dessin) ------------------------------------
const IconBack = () => (<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconNext = () => (<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconPlay = ({ size = 20 }: { size?: number }) => (<svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>);
const IconClose = () => (<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>);

// --- vidéo : fichier réel, emplacement vide (test) ou rien (production) ----------------
function VideoSlotView({ id, lang, showEmpty, compact = false }: { id?: string; lang: Lang; showEmpty: boolean; compact?: boolean }) {
  const v = id ? VIDEOS[id] : undefined;
  if (!v) return null;
  const src = v.src[lang];
  if (src) {
    return <video className="w-full aspect-video rounded-2xl bg-slate-900" src={src} poster={v.poster?.[lang] ?? undefined} controls preload="none" playsInline />;
  }
  if (!showEmpty) return null;
  return (
    <div className={`relative flex ${compact ? 'items-center gap-3 p-3' : 'aspect-video flex-col justify-end p-4'} w-full rounded-2xl bg-slate-900 text-slate-100`}>
      <span className={`${compact ? '' : 'absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2'} grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15`}><IconPlay /></span>
      <span>
        <span className="block font-display text-[15px] font-bold">{t(v.title, lang)}</span>
        <span className="block text-xs text-slate-300">{L(lang, 'Vidéo à venir', 'Video coming soon')}, {v.seconds[lang]} s</span>
      </span>
    </div>
  );
}

function InfoView({ data, lang, showEmpty }: { data: Info | null; lang: Lang; showEmpty: boolean }) {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-3">
      <VideoSlotView id={data.video} lang={lang} showEmpty={showEmpty} />
      {data.kick && <p className="mt-1 text-[12.5px] font-semibold text-primary-600">{data.kick}</p>}
      <h4 className="font-display text-[19px] font-bold leading-snug text-slate-900">{data.title}</h4>
      {data.meta && <p className="text-sm font-semibold text-slate-900">{data.meta}</p>}
      {data.text && <p className="text-[14.5px] leading-relaxed text-slate-600">{data.text}</p>}
      {data.list && data.list.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">{data.list.map((li) => <li key={li}>{li}</li>)}</ul>
      )}
      {data.note && <p className="text-[13px] text-slate-500">{data.note}</p>}
    </div>
  );
}

export default function CalculatorV6({ lang, showEmptyVideoSlots = false, dryRun = false }: Props) {
  const tracking = !dryRun;
  const [st, setSt] = useState<QuoteState>(emptyState);
  const [i, setI] = useState(0);
  const [draft, setDraft] = useState<ServiceDomain[]>([]);
  const [currency, setCurrency] = useState<Currency>(lang === 'en' ? 'USD' : 'EUR');
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [sheetKey, setSheetKey] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact>({ name: '', email: '', company: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formError, setFormError] = useState('');
  const mountedAt = useRef(Date.now());
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const seq = useMemo(() => sequence(st), [st]);
  const cur = seq[Math.min(i, seq.length - 1)];
  const quote = useMemo(() => devis(st), [st]);
  const fmt = useCallback((eur: number) => money(eur, currency, lang), [currency, lang]);

  // --- suivi du funnel (mêmes events qu'avant : la version 75 du conteneur GTM reste valable)
  useEffect(() => { if (tracking) trackStep('landed', { calculator_version: 'v6' }); }, [tracking]);
  useEffect(() => {
    if (!tracking) return;
    if (cur === 'recap') trackStep('lead_form', { calculator_cta_source: 'v6_recap', calculator_total: quote.totalFees, currency });
    else if (cur !== 'pick') trackStep('configure');
  }, [cur, tracking]); // eslint-disable-line react-hooks/exhaustive-deps
  const snapshot = useRef({ domains: 0, total: 0 });
  snapshot.current = { domains: st.domains.length, total: quote.totalFees };
  useEffect(() => {
    if (!tracking) return;
    const onHide = () => { if (snapshot.current.domains) trackAbandon({ calculator_services_count: snapshot.current.domains, calculator_total: snapshot.current.total }); };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, [tracking]);

  // --- l'écran ne saute pas : au changement de question, on ne remonte que si le haut du bloc est sorti de l'écran
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 88, behavior: 'instant' as ScrollBehavior });
  }, [i]);

  useEffect(() => () => { if (advanceTimer.current) window.clearTimeout(advanceTimer.current); }, []);

  const go = useCallback((next: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setHoverKey(null);
    setI(next);
  }, []);

  // L'état le plus récent, lu par l'avance automatique (qui part 280 ms après le clic).
  const stRef = useRef(st);
  stRef.current = st;
  const scheduleNext = useCallback((fromStep: string) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      const sq = sequence(stRef.current);
      const k = sq.indexOf(fromStep);
      setI(k >= 0 ? Math.min(k + 1, sq.length - 1) : sq.length - 1);
      setHoverKey(null);
    }, AUTO_ADVANCE_MS);
  }, []);

  // --- actions ----------------------------------------------------------------------------
  const togglePick = (d: ServiceDomain) => {
    setDraft((prev) => {
      const on = prev.includes(d);
      const next = on ? prev.filter((x) => x !== d) : [...prev, d];
      if (tracking) trackDomain(d, !on, next.length);
      return next;
    });
  };
  const startFromPick = () => {
    const domains = inOrder(draft);
    setSt((s) => ({ ...s, domains, discuss: Object.fromEntries(Object.entries(s.discuss).filter(([d]) => domains.includes(d as ServiceDomain))) }));
    go(1);
  };
  const setAnswer = (q: Question, value: string | number | null) => {
    setSt((s) => ({ ...s, answers: { ...s.answers, [q.id]: value }, discuss: { ...s.discuss, [q.domain]: false } }));
    if (tracking && q.kind === 'level' && q.service) {
      const opt = optionsFor(q, st.answers).find((o) => o.value === value);
      trackService({ domainId: q.domain, serviceId: q.service, levelName: opt ? opt.label.fr : 'none', levelIndex: typeof value === 'number' ? value : -1, price: opt?.price ?? 0, selected: value !== null });
    }
    scheduleNext(q.id);
  };
  const toggleMulti = (q: Question, value: string) => {
    setSt((s) => {
      const arr = Array.isArray(s.answers[q.id]) ? [...(s.answers[q.id] as string[])] : [];
      const k = arr.indexOf(value);
      if (k >= 0) arr.splice(k, 1); else arr.push(value);
      if (tracking && q.kind === 'channels') trackChannel(value, k < 0, arr.length);
      return { ...s, answers: { ...s.answers, [q.id]: arr }, discuss: { ...s.discuss, [q.domain]: false } };
    });
  };
  const setBudget = (q: Question, stepIndex: number) => {
    setSt((s) => ({ ...s, answers: { ...s.answers, [q.id]: BUDGET_STEPS[stepIndex] } }));
  };
  const skipDomain = (d: ServiceDomain) => {
    const after = st.domains.slice(st.domains.indexOf(d) + 1).find((x) => !st.discuss[x]);
    const next: QuoteState = { ...st, discuss: { ...st.discuss, [d]: true } };
    setSt(next);
    const sq = sequence(next);
    go(after ? sq.indexOf(questionsFor(after)[0].id) : sq.indexOf('duration'));
  };
  const editDomain = (d: ServiceDomain) => {
    const next: QuoteState = { ...st, discuss: { ...st.discuss, [d]: false } };
    setSt(next);
    go(sequence(next).indexOf(questionsFor(d)[0].id));
  };
  const setDuration = (m: number, advance: boolean) => {
    setSt((s) => ({ ...s, duration: m }));
    if (advance) scheduleNext('duration');
  };

  const submit = async () => {
    setFormError('');
    if (honeypot.trim()) return;
    if ((Date.now() - mountedAt.current) / 1000 < 3) return;
    if (!contact.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setFormError(L(lang, 'Indiquez votre nom et une adresse email valide.', 'Please enter your name and a valid email address.'));
      return;
    }
    const payload = buildPayload(st, { ...contact, name: contact.name.trim(), email: contact.email.trim(), company: contact.company.trim() }, lang, currency);
    if (dryRun) {
      // eslint-disable-next-line no-console
      console.info('[calculateur v6, mode test] envoi non effectué', payload);
      setStatus('sent');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors', body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
      if (tracking) {
        trackStep('submitted');
        track('calculator_form_submit', {
          form_name: 'calculator', form_location: window.location.pathname, calculator_total: quote.totalFees,
          used_guided_mode: false, selected_domains: st.domains.join(','), currency
        });
      }
    } catch {
      // Plus de faux succès : avant, un échec affichait « demande enregistrée » et le lead était perdu.
      setStatus('error');
    }
  };

  // --- survol : le guide explique ce qui est sous la souris (ordinateur) ---------------------
  const onOver = (e: React.MouseEvent | React.FocusEvent) => {
    const el = (e.target as HTMLElement).closest('[data-info]');
    if (!el) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setHoverKey(el.getAttribute('data-info'));
  };
  const onOut = (e: React.MouseEvent | React.FocusEvent) => {
    const to = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-info]');
    if (to) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setHoverKey(null), 400);
  };
  const guideKey = hoverKey && info(hoverKey, lang, currency) ? hoverKey : restKey(cur);

  // --- rendu d'une question ------------------------------------------------------------------
  const optionClass = (checked: boolean) =>
    `flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${checked ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-slate-200 bg-white hover:border-slate-300'}`;
  const Mark = ({ checked, square = false }: { checked: boolean; square?: boolean }) => (
    <span className={`grid h-[18px] w-[18px] shrink-0 place-items-center border-[1.5px] ${square ? 'rounded-[5px]' : 'rounded-full'} ${checked ? (square ? 'border-primary-600 bg-primary-600 text-white' : 'border-primary-600') : 'border-slate-300'}`}>
      {checked && (square ? <IconCheck /> : <span className="h-2 w-2 rounded-full bg-primary-600" />)}
    </span>
  );
  const Price = ({ amount, once }: { amount?: number; once?: boolean }) => (amount == null ? null : (
    <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
      {fmt(amount)}<span className="block text-[11.5px] font-medium text-slate-500">{once ? L(lang, 'une fois', 'one-off') : L(lang, '/mois', '/mo')}</span>
    </span>
  ));

  const renderQuestion = (q: Question) => {
    const a = st.answers[q.id];
    if (q.kind === 'budget') {
      const b = typeof a === 'number' ? a : DEFAULT_BUDGET;
      const idx = BUDGET_STEPS.reduce((best, s, k) => (Math.abs(s - b) < Math.abs(BUDGET_STEPS[best] - b) ? k : best), 0);
      const dq = quote.domains.find((x) => x.domain === q.domain);
      const n = q.domain === 'paid-social' ? Math.max(channelsOf(st.answers).length, 1) : 1;
      return (
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-display text-[26px] font-extrabold tabular-nums text-slate-900" data-info="media">{fmt(b)}<span className="ml-1 text-sm font-medium text-slate-500">{L(lang, '/mois', '/mo')}</span></p>
          <input type="range" min={0} max={BUDGET_STEPS.length - 1} step={1} value={idx} aria-label={t(q.title, lang)}
            className="mt-4 w-full accent-primary-600"
            onChange={(e) => setBudget(q, Number(e.target.value))}
            onPointerUp={() => tracking && trackBudget(q.domain, BUDGET_STEPS[idx], currency)}
            onKeyUp={() => tracking && trackBudget(q.domain, BUDGET_STEPS[idx], currency)} />
          <div className="mt-1 flex justify-between text-xs text-slate-500"><span>{fmt(BUDGET_STEPS[0])}</span><span>{fmt(BUDGET_STEPS[BUDGET_STEPS.length - 1])}</span></div>
          <p className="mt-3 border-t border-slate-200 pt-3 text-[13.5px] text-slate-600" data-info="fee">
            {L(lang, 'Nos honoraires de gestion : ', 'Our management fee: ')}<strong className="text-slate-900">{fmt(dq?.fee ?? 0)}{L(lang, '/mois', '/mo')}</strong>
            {n > 1 && <span className="text-slate-500"> ({L(lang, `${n} réseaux`, `${n} networks`)})</span>}
          </p>
        </div>
      );
    }
    if (q.kind === 'channels') {
      const sel = channelsOf(st.answers);
      return (
        <div className="flex flex-wrap gap-2">
          {optionsFor(q, st.answers).map((o) => {
            const on = sel.includes(String(o.value));
            return (
              <button key={String(o.value)} type="button" role="checkbox" aria-checked={on} data-info={o.info}
                onClick={() => toggleMulti(q, String(o.value))}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${on ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                {on && <span className="text-primary-600"><IconCheck /></span>}{t(o.label, lang)}
              </button>
            );
          })}
        </div>
      );
    }
    const multi = q.kind === 'multi';
    const opts = optionsFor(q, st.answers);
    const selected = multi ? (Array.isArray(a) ? a : []) : a;
    return (
      <div className="grid gap-2 lg:grid-cols-2">
        {q.kind === 'level' && (
          <button type="button" role="radio" aria-checked={a === null} data-info={`svc:${q.service}`} className={optionClass(a === null)} onClick={() => setAnswer(q, null)}>
            <Mark checked={a === null} /><span className="min-w-0 flex-1"><span className="block text-[14.5px] font-semibold">{L(lang, 'Non merci', 'No thanks')}</span></span>
          </button>
        )}
        {opts.map((o) => {
          const checked = multi ? (selected as string[]).includes(String(o.value)) : selected === o.value;
          return (
            <button key={String(o.value)} type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={checked} data-info={o.info} className={optionClass(checked)}
              onClick={() => (multi ? toggleMulti(q, String(o.value)) : setAnswer(q, o.value))}>
              <Mark checked={checked} square={multi} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-semibold leading-snug">{t(o.label, lang)}</span>
                {o.desc && t(o.desc, lang) && <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">{t(o.desc, lang)}</span>}
              </span>
              <Price amount={o.price} once={o.oneOff} />
            </button>
          );
        })}
      </div>
    );
  };

  const Terms = ({ step }: { step: string }) => {
    const terms = termsFor(step, lang);
    const rk = restKey(step);
    const vid = info(rk, lang, currency)?.video;
    const hasVideo = vid && (VIDEOS[vid]?.src[lang] || showEmptyVideoSlots);
    if (!terms.length && !hasVideo) return null;
    return (
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {terms.map((x) => (
          <button key={x.key} type="button" data-info={x.key}
            onClick={() => { setHoverKey(x.key); if (window.matchMedia('(max-width: 1023px)').matches) setSheetKey(x.key); }}
            className="cursor-help border-b border-dashed border-current pb-px font-medium text-primary-600">{x.label}</button>
        ))}
        {hasVideo && (
          <button type="button" onClick={() => setSheetKey(rk)} className="inline-flex items-center gap-1.5 font-medium text-slate-700 lg:hidden">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-white"><IconPlay size={12} /></span>
            {L(lang, 'Voir la vidéo', 'Watch the video')}, {VIDEOS[vid!].seconds[lang]} s
          </button>
        )}
      </div>
    );
  };

  const CurrencySwitch = () => (
    <div className="inline-flex rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label={L(lang, 'Devise', 'Currency')}>
      {(Object.keys(CURRENCY_CONFIGS) as Currency[]).map((c) => (
        <button key={c} type="button" role="radio" aria-checked={currency === c} onClick={() => setCurrency(c)}
          className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${currency === c ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>{CURRENCY_CONFIGS[c].symbol} {c}</button>
      ))}
    </div>
  );

  const DurationSwitch = () => (
    <div className="flex w-full rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label={L(lang, 'Durée d’engagement', 'Commitment')}>
      {DURATION_CONFIG.options.map((o) => (
        <button key={o.months} type="button" role="radio" aria-checked={st.duration === o.months} onClick={() => setDuration(o.months, false)}
          className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold ${st.duration === o.months ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>
          {o.months} {L(lang, 'mois', 'months')}{o.discount ? <span className="block text-[11.5px] text-emerald-700">-{o.discount}&nbsp;%</span> : null}
        </button>
      ))}
    </div>
  );

  // --- corps selon l'écran ----------------------------------------------------------------------
  let body: React.ReactNode;
  let actions: React.ReactNode = null;
  const primaryBtn = 'inline-flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-primary-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none lg:min-w-[170px]';
  const ghostBtn = 'inline-flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-100 px-5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-200 lg:flex-none';

  if (status === 'sent') {
    body = (
      <div className="py-6">
        <h3 className="font-display text-2xl font-bold text-slate-900">{L(lang, 'Merci, votre devis est en route', 'Thank you, your quote is on its way')}</h3>
        <p className="mt-2 max-w-prose text-slate-600">{L(lang, 'Vous le recevez par email dans quelques minutes. Un expert vous rappelle sous 24 à 48 h pour l’ajuster avec vous.', 'It will reach your inbox in a few minutes. An expert will get back to you within 24 to 48 hours to fine-tune it with you.')}</p>
        {dryRun && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{L(lang, 'Page de test : rien n’a été envoyé. Le contenu de l’envoi est dans la console du navigateur.', 'Test page: nothing was sent. The payload is in the browser console.')}</p>}
      </div>
    );
  } else if (cur === 'pick') {
    body = (
      <>
        <p className="mb-1.5 text-[13px] font-semibold text-primary-600">{L(lang, 'Votre devis en quelques questions', 'Your quote in a few questions')}</p>
        <h3 className="font-display text-2xl font-bold text-slate-900 lg:text-[26px]">{L(lang, 'De quoi avez-vous besoin ?', 'What do you need?')}</h3>
        <p className="mb-4 mt-1.5 text-sm text-slate-500">{L(lang, 'Plusieurs réponses possibles.', 'Pick as many as you like.')}<span className="hidden lg:inline"> {L(lang, 'Survolez un service pour savoir ce qu’il comprend.', 'Hover over a service to see what it includes.')}</span></p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {DOMAIN_ORDER.map((d) => {
            const on = draft.includes(d);
            return (
              <button key={d} type="button" role="checkbox" aria-checked={on} data-info={`dom:${d}`} onClick={() => togglePick(d)}
                className={`relative rounded-xl border p-3 text-left transition-colors ${on ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <span className={`absolute right-2.5 top-2.5 grid h-[18px] w-[18px] place-items-center rounded-full border-[1.5px] ${on ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300'}`}>{on && <IconCheck />}</span>
                <span className="block pr-6 text-[14.5px] font-semibold leading-snug text-slate-900">{domainName(d, lang)}</span>
                <span className="mt-1 line-clamp-2 block text-[12.5px] leading-snug text-slate-500">{domainDesc(d, lang)}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">{L(lang, 'Prix affichés en', 'Prices shown in')} <CurrencySwitch /></div>
      </>
    );
    actions = <button type="button" className={primaryBtn} disabled={!draft.length} onClick={startFromPick}>{L(lang, 'Continuer', 'Continue')}{draft.length ? ` (${draft.length})` : ''}<IconNext /></button>;
  } else if (cur === 'duration') {
    body = (
      <>
        <p className="mb-1.5 text-[13px] font-semibold text-primary-600">{L(lang, 'Dernière question', 'Last question')}</p>
        <h3 className="font-display text-2xl font-bold text-slate-900 lg:text-[26px]">{L(lang, 'Sur combien de mois ?', 'For how many months?')}</h3>
        <p className="mb-3 mt-1.5 text-sm text-slate-500">{L(lang, 'Plus l’engagement est long, plus la remise est forte.', 'The longer the commitment, the bigger the discount.')}</p>
        <Terms step="duration" />
        <div className="grid gap-2 lg:grid-cols-2">
          {DURATION_CONFIG.options.map((o) => (
            <button key={o.months} type="button" role="radio" aria-checked={st.duration === o.months} data-info="duration" className={optionClass(st.duration === o.months)} onClick={() => setDuration(o.months, true)}>
              <Mark checked={st.duration === o.months} />
              <span className="min-w-0 flex-1"><span className="block text-[14.5px] font-semibold">{o.months} {L(lang, 'mois', 'months')}</span>
                <span className="mt-0.5 block text-[12.5px] text-slate-500">{o.discount ? L(lang, `Remise de ${o.discount} % sur les honoraires mensuels`, `${o.discount}% off monthly fees`) : L(lang, 'Sans remise', 'No discount')}</span></span>
            </button>
          ))}
        </div>
      </>
    );
  } else if (cur === 'recap') {
    body = (
      <>
        <h3 className="font-display text-2xl font-bold text-slate-900">{L(lang, 'Votre devis', 'Your quote')}</h3>
        <p className="mb-4 mt-1 text-sm text-slate-500">{L(lang, 'Tout reste modifiable. Un expert vous rappelle sous 24 à 48 h.', 'Everything can still change. An expert gets back to you within 24 to 48 hours.')}</p>
        <DurationSwitch />
        <div className="mt-5 divide-y divide-slate-200">
          {quote.domains.map((dq) => (
            <div key={dq.domain} className="flex justify-between gap-3 py-3 first:pt-0">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold text-slate-900">{domainName(dq.domain, lang)}</p>
                {dq.discuss || dq.empty ? (
                  <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[12.5px] font-semibold text-amber-800">{L(lang, 'À discuter ensemble', 'To discuss together')}</span>
                ) : (
                  <ul className="mt-1.5 space-y-0.5 text-[13px] text-slate-500">
                    {dq.lines.map((l) => (
                      <li key={l.label.fr} className="flex justify-between gap-3" data-info={l.info}><span>{t(l.label, lang)}</span><span className="whitespace-nowrap tabular-nums">{fmt(l.amount)}{perLabel(l.per, lang)}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" className="self-start text-[13.5px] font-semibold text-primary-600 underline underline-offset-2" onClick={() => editDomain(dq.domain)}>{L(lang, 'Modifier', 'Edit')}</button>
            </div>
          ))}
        </div>
        <dl className="mt-4 space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L(lang, 'Honoraires mensuels', 'Monthly fees')}</dt><dd className="font-semibold tabular-nums">{fmt(quote.beforeDiscount)}{perLabel('month', lang)}</dd></div>
          {quote.discount > 0 && <div className="flex justify-between gap-3"><dt className="text-slate-600">{L(lang, `Remise ${st.duration} mois`, `${st.duration}-month discount`)}</dt><dd className="font-semibold tabular-nums">-{fmt(quote.discount)}{perLabel('month', lang)}</dd></div>}
          {quote.oneOff > 0 && <div className="flex justify-between gap-3"><dt className="text-slate-600">{L(lang, 'Frais uniques', 'One-off fees')}</dt><dd className="font-semibold tabular-nums">{fmt(quote.oneOff)}</dd></div>}
          {quote.media > 0 && <div className="flex justify-between gap-3 text-slate-500" data-info="media"><dt>{L(lang, 'Budget média (non inclus)', 'Media budget (not included)')}</dt><dd className="tabular-nums">{fmt(quote.media)}{perLabel('month', lang)}</dd></div>}
          <div className="mt-2 flex justify-between gap-3 border-t border-slate-300 pt-2"><dt className="font-bold text-slate-900">{L(lang, `Nos honoraires sur ${st.duration} mois`, `Our fees over ${st.duration} months`)}</dt><dd className="font-display text-[17px] font-extrabold tabular-nums">{fmt(quote.totalFees)}</dd></div>
        </dl>
        <form className="mt-6 grid gap-3" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
          <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Nom', 'Name')}
            <input className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-[15px] font-normal text-slate-900" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Email professionnel', 'Work email')}
            <input type="email" className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-[15px] font-normal text-slate-900" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Entreprise', 'Company')}
            <input className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-[15px] font-normal text-slate-900" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Un mot sur votre projet (facultatif)', 'A word about your project (optional)')}
            <textarea rows={3} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-[15px] font-normal text-slate-900" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} />
          </label>
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
          {formError && <p className="text-sm font-medium text-red-700" role="alert">{formError}</p>}
          {status === 'error' && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {L(lang, 'L’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez-nous depuis la ', 'Sending failed. Please try again in a moment, or reach us through the ')}
              <a className="font-semibold underline" href={`/${lang}/contact`}>{L(lang, 'page contact', 'contact page')}</a>.
            </p>
          )}
        </form>
      </>
    );
    actions = <button type="button" className={primaryBtn} disabled={status === 'sending'} onClick={submit}>{status === 'sending' ? L(lang, 'Envoi...', 'Sending...') : L(lang, 'Recevoir mon devis', 'Get my quote')}</button>;
  } else {
    const q = QUESTION_INDEX[cur];
    const list = questionsFor(q.domain);
    const k = list.findIndex((x) => x.id === cur);
    const answered = st.answers[cur] !== undefined;
    const auto = q.kind === 'level' || q.kind === 'choice';
    body = (
      <>
        <p className="mb-1.5 text-[13px] font-semibold text-primary-600">{domainName(q.domain, lang)}{list.length > 1 ? L(lang, `, question ${k + 1} sur ${list.length}`, `, question ${k + 1} of ${list.length}`) : ''}</p>
        <h3 className="font-display text-2xl font-bold leading-tight text-slate-900 lg:text-[26px]">{t(q.title, lang)}</h3>
        {q.help && <p className="mt-1.5 text-sm text-slate-500">{t(q.help, lang)}</p>}
        <div className="mt-3"><Terms step={cur} /></div>
        {renderQuestion(q)}
        <button type="button" className="mt-6 text-[13.5px] font-semibold text-primary-600 underline underline-offset-2" onClick={() => skipDomain(q.domain)}>
          {L(lang, `Passer ${domainName(q.domain, 'fr')}, on en parle`, `Skip ${domainName(q.domain, 'en')}, let’s discuss it`)}
        </button>
      </>
    );
    if (!auto) actions = <button type="button" className={primaryBtn} onClick={() => go(i + 1)}>{L(lang, 'Continuer', 'Continue')}<IconNext /></button>;
    else if (answered) actions = <button type="button" className={ghostBtn} onClick={() => go(i + 1)}>{L(lang, 'Question suivante', 'Next question')}<IconNext /></button>;
  }

  const talk = quote.domains.filter((d) => d.discuss).length;
  const sub: string[] = [];
  if (quote.oneOff) sub.push(L(lang, `+ ${fmt(quote.oneOff)} de mise en place`, `+ ${fmt(quote.oneOff)} one-off`));
  if (quote.media) sub.push(L(lang, `budget média de ${fmt(quote.media)}/mois en plus`, `plus ${fmt(quote.media)}/mo media budget`));
  if (talk) sub.push(L(lang, `${talk} à discuter`, `${talk} to discuss`));
  const pct = seq.length > 1 ? (i / (seq.length - 1)) * 100 : 0;

  return (
    <div ref={rootRef} className="overflow-clip rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid lg:h-[680px] lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="flex flex-col lg:min-h-0" onMouseOver={onOver} onMouseOut={onOut} onFocus={onOver} onBlur={onOut}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-7">
          <button type="button" aria-label={L(lang, 'Retour', 'Back')} disabled={i === 0 || status === 'sent'} onClick={() => go(i - 1)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-900 disabled:opacity-30"><IconBack /></button>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-primary-600 transition-[width] duration-300" style={{ width: `${status === 'sent' ? 100 : pct}%` }} /></div>
          <span className="min-w-[38px] text-right text-[12.5px] tabular-nums text-slate-500">{Math.min(i + 1, seq.length)}/{seq.length}</span>
        </div>
        <div ref={bodyRef} className="min-h-[440px] px-4 py-6 sm:px-7 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">{body}</div>
        {status !== 'sent' && (
          <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-7 lg:static lg:flex-row-reverse lg:items-center lg:justify-between lg:py-4">
            {actions && <div className="flex gap-2">{actions}</div>}
            <div className="min-w-0" aria-live="polite">
              {st.domains.length ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[13px] text-slate-500">{L(lang, 'Votre estimation', 'Your estimate')}{quote.discountPct ? <em className="ml-1 not-italic font-semibold text-emerald-700">-{quote.discountPct}&nbsp;%</em> : null}</span>
                    <strong className="font-display text-[23px] font-extrabold tabular-nums text-slate-900">{fmt(quote.monthly)}<span className="ml-0.5 text-[13px] font-medium text-slate-500">{L(lang, '/mois', '/mo')}</span></strong>
                  </div>
                  {sub.length > 0 && <p className="mt-0.5 text-[12.5px] leading-snug text-slate-500">{sub.join(', ')}</p>}
                </>
              ) : (
                <p className="text-sm text-slate-500">{L(lang, 'Choisissez un service pour voir le prix.', 'Pick a service to see the price.')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-slate-50 p-6 lg:flex">
        <InfoView data={info(status === 'sent' ? 'next' : guideKey, lang, currency)} lang={lang} showEmpty={showEmptyVideoSlots} />
      </aside>

      {sheetKey && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={info(sheetKey, lang, currency)?.title}>
          <button type="button" aria-label={L(lang, 'Fermer', 'Close')} className="absolute inset-0 bg-slate-900/40" onClick={() => setSheetKey(null)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl">
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => setSheetKey(null)} aria-label={L(lang, 'Fermer', 'Close')} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100"><IconClose /></button>
            </div>
            <InfoView data={info(sheetKey, lang, currency)} lang={lang} showEmpty={showEmptyVideoSlots} />
          </div>
        </div>
      )}
    </div>
  );
}
