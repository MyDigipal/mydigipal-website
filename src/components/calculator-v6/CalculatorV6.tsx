/**
 * Calculateur v6 : un bloc, une question à la fois (parcours B, retenu par Paul le 22/09/2026).
 *
 * - Téléphone : la question occupe le bloc, la barre du total reste collée en bas.
 *   Chaque question a un lien « C'est quoi ? » qui ouvre une fiche avec la vidéo.
 * - Ordinateur (lg) : même parcours à gauche, et à droite le « guide » (direction D1) :
 *   au repos il présente le service en cours et sa vidéo, au survol d'une option, d'un
 *   réseau, du budget ou des honoraires il explique l'élément survolé.
 * - Récapitulatif : chaque terme un peu technique porte une bulle de définition (survol sur
 *   ordinateur, toucher sur téléphone), comme les « i » de l'ancien calculateur.
 * - « Aidez-moi à choisir » : trois questions, puis une proposition qui tient le budget annoncé.
 *
 * Pilotage et maquettes : docs/calculator/refonte-2026-09/calculateur-en-etapes.html
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Currency, ServiceDomain } from '../calculator/types';
import { CURRENCY_CONFIGS, DURATION_CONFIG } from '../calculator/data';
import type { ContactType } from '../calculator/data/emailing-services';
import { guidedQuestions } from '../calculator/guided-data';
import { track, trackBudget, trackChannel, trackDomain, trackService, trackStep, trackAbandon } from '../calculator/tracking';
import {
  AI_CUSTOM_FIELDS, BUDGET_STEPS, CONTACT_VOLUMES, DEFAULT_BUDGET, DEFAULT_CONTACT_VOLUME, DOMAIN_ORDER, QUESTION_INDEX,
  buildPayload, channelsOf, devis, domainDesc, domainName, emptyState, guidedProposal, inOrder, money, optionsFor, perLabel,
  questionsFor, sequence, t, unitContactPrice, visibleQuestions,
  type Contact, type DomainQuote, type Lang, type Question, type QuoteState
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

// --- petites icônes (tracés simples) ------------------------------------------------------
const IconBack = () => (<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconNext = () => (<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconCheck = () => (<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconPlay = ({ size = 20 }: { size?: number }) => (<svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>);
const IconClose = () => (<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>);

// --- vidéo : fichier réel, emplacement vide (test) ou rien (production) ----------------
function VideoSlotView({ id, lang, showEmpty }: { id?: string; lang: Lang; showEmpty: boolean }) {
  const v = id ? VIDEOS[id] : undefined;
  if (!v) return null;
  const src = v.src[lang];
  if (src) return <video className="aspect-video w-full rounded-2xl bg-slate-900" src={src} poster={v.poster?.[lang] ?? undefined} controls preload="none" playsInline />;
  if (!showEmpty) return null;
  return (
    <div className="relative flex aspect-video w-full flex-col justify-end rounded-2xl bg-slate-900 p-4 text-slate-100">
      <span className="absolute left-1/2 top-[42%] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15"><IconPlay /></span>
      <span className="block font-display text-[15px] font-bold">{t(v.title, lang)}</span>
      <span className="block text-xs text-slate-300">{L(lang, 'Vidéo à venir', 'Video coming soon')}, {v.seconds[lang]} s</span>
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
      {data.list && data.list.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">{data.list.map((li) => <li key={li}>{li}</li>)}</ul>}
      {data.note && <p className="text-[13px] text-slate-500">{data.note}</p>}
    </div>
  );
}

/**
 * Bulle de définition : un terme souligné en pointillés, et au survol (ou au toucher) un petit
 * carré avec la définition. Position fixe, pour ne pas être coupée par la zone qui défile.
 */
function Hint({ k, lang, currency, children, className = '', tone = 'light' }: { k?: string; lang: Lang; currency: Currency; children: React.ReactNode; className?: string; tone?: 'light' | 'dark' }) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number; above: boolean } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);
  const data = k ? info(k, lang, currency) : null;
  if (!data) return <span className={className}>{children}</span>;
  const open = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(300, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    const above = r.top > 260;
    setPos({ top: above ? r.top - 8 : r.bottom + 8, left, width, above });
  };
  return (
    <>
      <button ref={ref} type="button" aria-describedby={pos ? id : undefined}
        className={`cursor-help border-b border-dashed text-left transition-colors ${tone === 'dark' ? 'border-white/60 hover:border-white' : 'border-slate-400 hover:border-primary-600 hover:text-primary-700'} ${className}`}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') open(); }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') setPos(null); }}
        onBlur={() => setPos(null)}
        onClick={(e) => { e.stopPropagation(); if (pos) setPos(null); else open(); }}>
        {children}
      </button>
      {pos && (
        <span role="tooltip" id={id} style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, transform: pos.above ? 'translateY(-100%)' : undefined }}
          className="pointer-events-none z-[70] rounded-xl border border-slate-200 bg-white p-3.5 text-left text-slate-700 shadow-xl">
          <span className="block font-display text-sm font-bold text-slate-900">{data.title}</span>
          {data.meta && <span className="mt-0.5 block text-xs font-semibold text-slate-900">{data.meta}</span>}
          {data.text && <span className="mt-1 block text-[13px] font-normal leading-snug">{data.text}</span>}
          {data.list && data.list.length > 0 && (
            <span className="mt-1.5 block space-y-0.5 text-[12.5px] font-normal leading-snug text-slate-600">
              {data.list.slice(0, 3).map((li) => <span key={li} className="block pl-3 -indent-3">{'• '}{li}</span>)}
            </span>
          )}
        </span>
      )}
    </>
  );
}

/** Un montant qui monte jusqu'à sa valeur (easeOutCubic, comme les compteurs du site). Le texte
 * est écrit directement dans le DOM pendant l'animation, sans re-rendu React à chaque image. */
function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    prev.current = value;
    if (from === value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = format(value); return; }
    const duration = from === 0 ? 1300 : 450;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = format(from + (value - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, format]);
  return <span ref={ref}>{format(0)}</span>;
}

const BOOKING_URL = 'https://calendar.app.google/ofYHfRHbFoMpVxf79';

type Guided = { step: number; industry?: string; goals?: string; monthlyBudget?: string };
const GUIDED_TITLES: Record<string, { fr: string; en: string; subFr: string; subEn: string }> = {
  industry: { fr: 'Votre secteur ?', en: 'Your industry?', subFr: 'Le plus proche suffit, on adapte la proposition.', subEn: 'The closest one is fine, we tailor the proposal.' },
  goals: { fr: 'Votre objectif principal ?', en: 'Your main goal?', subFr: 'Un seul, on concentre la proposition dessus.', subEn: 'Just one, we focus the proposal on it.' },
  monthlyBudget: { fr: 'Votre budget mensuel, média compris ?', en: 'Your monthly budget, media included?', subFr: 'À la louche. Tout reste modifiable ensuite.', subEn: 'Roughly. Everything can be adjusted afterwards.' }
};

export default function CalculatorV6({ lang, showEmptyVideoSlots = false, dryRun = false }: Props) {
  const tracking = !dryRun;
  const [st, setSt] = useState<QuoteState>(emptyState);
  const [i, setI] = useState(0);
  const [draft, setDraft] = useState<ServiceDomain[]>([]);
  const [currency, setCurrency] = useState<Currency>(lang === 'en' ? 'USD' : 'EUR');
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [sheetKey, setSheetKey] = useState<string | null>(null);
  const [guided, setGuided] = useState<Guided | null>(null);
  const [proposalBudget, setProposalBudget] = useState<number | null>(null);
  const [resultStyle, setResultStyle] = useState<'a' | 'b'>('a');
  const [audit, setAudit] = useState({ website: '', clients: '', works: '', priority: '' });
  const pendingKey = useRef<number | null>(null);
  const inGuide = useRef(false);
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
  const cur = guided ? `g-${guided.step}` : seq[Math.min(i, seq.length - 1)];
  const quote = useMemo(() => devis(st), [st]);
  const fmt = useCallback((eur: number) => money(eur, currency, lang), [currency, lang]);
  // Composant stable (mémorisé) : sans ça, chaque rendu du bloc refermerait la bulle ouverte.
  const H = useMemo(() => function HintBound({ k, children, className, tone }: { k?: string; children: React.ReactNode; className?: string; tone?: 'light' | 'dark' }) {
    return <Hint k={k} lang={lang} currency={currency} className={className} tone={tone}>{children}</Hint>;
  }, [lang, currency]);

  // --- suivi du funnel (mêmes events qu'avant : la version 75 du conteneur GTM reste valable)
  useEffect(() => { if (tracking) trackStep('landed', { calculator_version: 'v6' }); }, [tracking]);
  useEffect(() => {
    if (!tracking || guided) return;
    if (cur === 'recap') trackStep('lead_form', { calculator_cta_source: proposalBudget ? 'v6_guided' : 'v6_recap', calculator_total: quote.totalFees, currency });
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
  }, [cur]);

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
    setProposalBudget(null);
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
  const setRaw = (id: string, value: number | Record<string, string>) => setSt((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
  const toggleMulti = (q: Question, value: string) => {
    setSt((s) => {
      const arr = Array.isArray(s.answers[q.id]) ? [...(s.answers[q.id] as string[])] : [];
      const k = arr.indexOf(value);
      if (k >= 0) arr.splice(k, 1); else arr.push(value);
      if (tracking && q.kind === 'channels') trackChannel(value, k < 0, arr.length);
      return { ...s, answers: { ...s.answers, [q.id]: arr }, discuss: { ...s.discuss, [q.domain]: false } };
    });
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
  const startGuided = () => {
    setGuided({ step: 0 });
    if (tracking) { track('calculator_mode_selected', { calculator_mode: 'guided' }); trackStep('guided'); }
  };
  const answerGuided = (field: 'industry' | 'goals' | 'monthlyBudget', value: string) => {
    const g = { ...(guided as Guided), [field]: value };
    setGuided(g);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      if (g.step < 2) { setGuided({ ...g, step: g.step + 1 }); return; }
      const p = guidedProposal(g.industry!, g.goals!, g.monthlyBudget!);
      setSt(p.state);
      setDraft(p.state.domains);
      setProposalBudget(p.budget);
      setGuided(null);
      setI(sequence(p.state).indexOf('recap'));
    }, AUTO_ADVANCE_MS);
  };
  const restart = () => {
    setSt(emptyState()); setDraft([]); setProposalBudget(null); setGuided(null); setStatus('idle'); go(0);
  };

  const submit = async () => {
    setFormError('');
    if (honeypot.trim()) return;
    if ((Date.now() - mountedAt.current) / 1000 < 3) return;
    if (!contact.name.trim() || !contact.company.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setFormError(L(lang, 'Indiquez votre nom, votre entreprise et une adresse email valide.', 'Please enter your name, your company and a valid email address.'));
      return;
    }
    const auditLines = ([
      [L(lang, 'Site', 'Website'), audit.website],
      [L(lang, 'Clients', 'Customers'), audit.clients],
      [L(lang, 'Ce qui marche, ce qui coince', 'What works, what gets stuck'), audit.works],
      [L(lang, 'Priorité à trois mois', 'Three-month priority'), audit.priority]
    ] as const).filter(([, v]) => v.trim()).map(([k, v]) => `${k} : ${v.trim()}`);
    const payload = {
      ...buildPayload(st, { name: contact.name.trim(), email: contact.email.trim(), company: contact.company.trim(), message: auditLines.join('\n') }, lang, currency),
      auditRequest: { website: audit.website.trim(), clients: audit.clients.trim(), whatWorks: audit.works.trim(), priority: audit.priority.trim() },
      guidedRecommendation: proposalBudget ? { selectedDomains: st.domains, estimatedMonthly: proposalBudget } : null
    };
    payload.metadata.usedGuidedMode = !!proposalBudget;
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
          used_guided_mode: !!proposalBudget, selected_domains: st.domains.join(','), currency
        });
      }
    } catch {
      // Plus de faux succès : avant, un échec affichait « demande enregistrée » et le lead était perdu.
      setStatus('error');
    }
  };

  // --- survol : le guide explique ce qui est sous la souris (ordinateur) ---------------------
  // Retour de Paul (22/09) : en allant vers la vidéo, la souris traversait d'autres options et le
  // guide changeait avant d'être atteint. Il attend donc 300 ms d'arrêt sur un élément avant de
  // changer, garde son contenu 900 ms après la sortie, et se fige tant que la souris est dedans.
  const clearGuideTimers = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (pendingKey.current) window.clearTimeout(pendingKey.current);
  };
  const onOver = (e: React.MouseEvent | React.FocusEvent) => {
    if (inGuide.current) return;
    const el = (e.target as HTMLElement).closest('[data-info]');
    if (!el) return;
    const key = el.getAttribute('data-info');
    clearGuideTimers();
    if (key === hoverKey) return;
    pendingKey.current = window.setTimeout(() => { if (!inGuide.current) setHoverKey(key); }, e.type === 'focus' ? 0 : 300);
  };
  const onOut = (e: React.MouseEvent | React.FocusEvent) => {
    const to = (e.relatedTarget as HTMLElement | null)?.closest?.('[data-info]');
    if (to) return;
    clearGuideTimers();
    hideTimer.current = window.setTimeout(() => { if (!inGuide.current) setHoverKey(null); }, 900);
  };
  const onGuideEnter = () => { inGuide.current = true; clearGuideTimers(); };
  const onGuideLeave = () => {
    inGuide.current = false;
    clearGuideTimers();
    hideTimer.current = window.setTimeout(() => setHoverKey(null), 900);
  };
  const guideKey = hoverKey && info(hoverKey, lang, currency) ? hoverKey : restKey(cur);

  // --- briques ------------------------------------------------------------------------------
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
  const inputClass = 'rounded-xl border border-slate-300 bg-white px-3 text-[15px] font-normal text-slate-900';
  const amountText = (amount: number, per: DomainQuote['lines'][number]['per']) => (per === 'quote' ? L(lang, 'Sur devis', 'On quote') : `${fmt(amount)}${perLabel(per, lang)}`);
  const domainSummary = (dq: DomainQuote) => {
    if (dq.discuss || dq.empty) return L(lang, 'À discuter', 'To discuss');
    const parts = [dq.monthly ? `${fmt(dq.monthly)}${perLabel('month', lang)}` : '', dq.oneOff ? `${fmt(dq.oneOff)}${perLabel('once', lang)}` : ''].filter(Boolean);
    return parts.length ? parts.join(' + ') : L(lang, 'Sur devis', 'On quote');
  };

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
          <input type="range" min={0} max={BUDGET_STEPS.length - 1} step={1} value={idx} aria-label={t(q.title, lang)} className="mt-4 w-full accent-primary-600"
            onChange={(e) => setRaw(q.id, BUDGET_STEPS[Number(e.target.value)])}
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
    if (q.kind === 'volume') {
      const type = st.answers['em-contacts'] as ContactType;
      const v = typeof a === 'number' ? a : DEFAULT_CONTACT_VOLUME;
      const idx = CONTACT_VOLUMES.reduce((best, s, k) => (Math.abs(s - v) < Math.abs(CONTACT_VOLUMES[best] - v) ? k : best), 0);
      const unit = unitContactPrice(type, v);
      return (
        <div className="rounded-2xl border border-slate-200 p-4" data-info={`cnt:${type}`}>
          <p className="font-display text-[26px] font-extrabold tabular-nums text-slate-900">{v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB')}<span className="ml-1.5 text-sm font-medium text-slate-500">{L(lang, 'contacts', 'contacts')}</span></p>
          <input type="range" min={0} max={CONTACT_VOLUMES.length - 1} step={1} value={idx} aria-label={t(q.title, lang)} className="mt-4 w-full accent-primary-600"
            onChange={(e) => setRaw(q.id, CONTACT_VOLUMES[Number(e.target.value)])} />
          <div className="mt-1 flex justify-between text-xs text-slate-500"><span>{CONTACT_VOLUMES[0]}</span><span>{CONTACT_VOLUMES[CONTACT_VOLUMES.length - 1].toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB')}</span></div>
          <p className="mt-3 border-t border-slate-200 pt-3 text-[13.5px] text-slate-600">
            {L(lang, 'Prix unitaire : ', 'Unit price: ')}<strong className="text-slate-900">{fmt(unit)}</strong>{L(lang, ', total : ', ', total: ')}<strong className="text-slate-900">{fmt(Math.round(unit * v))}</strong>{L(lang, ' une fois', ' one-off')}
          </p>
        </div>
      );
    }
    if (q.kind === 'form') {
      const val = (st.answers[q.id] as Record<string, string> | undefined) ?? {};
      return (
        <div className="grid gap-3">
          {AI_CUSTOM_FIELDS.map((f) => {
            const label = lang === 'fr' ? f.labelFr : f.label;
            const set = (v: string) => setRaw(q.id, { ...val, [f.id]: v });
            return (
              <label key={f.id} className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{label}
                {f.type === 'select' ? (
                  <select className={`${inputClass} h-11`} value={val[f.id] ?? ''} onChange={(e) => set(e.target.value)}>
                    <option value="">{L(lang, 'Choisir', 'Choose')}</option>
                    {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{lang === 'fr' ? o.labelFr : o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea rows={3} className={`${inputClass} py-2`} placeholder={(lang === 'fr' ? f.placeholderFr : f.placeholder) ?? ''} value={val[f.id] ?? ''} onChange={(e) => set(e.target.value)} />
                ) : (
                  <input className={`${inputClass} h-11`} placeholder={(lang === 'fr' ? f.placeholderFr : f.placeholder) ?? ''} value={val[f.id] ?? ''} onChange={(e) => set(e.target.value)} />
                )}
              </label>
            );
          })}
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
              <button key={String(o.value)} type="button" role="checkbox" aria-checked={on} data-info={o.info} onClick={() => toggleMulti(q, String(o.value))}
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
              {o.unitFrom != null
                ? <span className="shrink-0 text-right text-[12.5px] text-slate-500">{L(lang, 'dès', 'from')}<span className="block text-sm font-semibold tabular-nums text-slate-900">{fmt(o.unitFrom)}</span></span>
                : <Price amount={o.price} once={o.oneOff} />}
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

  const DurationSwitch = ({ dark = false }: { dark?: boolean }) => (
    <div className={`flex w-full rounded-xl p-1 ${dark ? 'bg-white/15' : 'bg-slate-100'}`} role="radiogroup" aria-label={L(lang, 'Durée d’engagement', 'Commitment')}>
      {DURATION_CONFIG.options.map((o) => {
        const on = st.duration === o.months;
        return (
          <button key={o.months} type="button" role="radio" aria-checked={on} onClick={() => setDuration(o.months, false)}
            className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold ${on ? (dark ? 'bg-white text-primary-700 shadow-sm' : 'bg-white text-slate-900 shadow-sm') : (dark ? 'text-white' : 'text-slate-600')}`}>
            {o.months} {L(lang, 'mois', 'months')}{o.discount ? <span className={`block text-[11.5px] ${on || !dark ? 'text-emerald-700' : 'text-emerald-200'}`}>-{o.discount}&nbsp;%</span> : null}
          </button>
        );
      })}
    </div>
  );

  // --- corps selon l'écran ----------------------------------------------------------------------
  let body: React.ReactNode;
  let actions: React.ReactNode = null;
  const primaryBtn = 'inline-flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-primary-600 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none lg:min-w-[170px]';
  const ghostBtn = 'inline-flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-100 px-5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-200 lg:flex-none';
  const kicker = (text: string) => <p className="mb-1.5 text-[13px] font-semibold text-primary-600">{text}</p>;
  const title = (text: string) => <h3 className="font-display text-2xl font-bold leading-tight text-slate-900 lg:text-[26px]">{text}</h3>;

  if (status === 'sent') {
    body = (
      <div className="py-6">
        <h3 className="font-display text-2xl font-bold text-slate-900">{L(lang, 'Merci, votre devis est en route', 'Thank you, your quote is on its way')}</h3>
        <p className="mt-2 max-w-prose text-slate-600">{L(lang, 'Vous le recevez par email dans quelques minutes. Un expert vous rappelle sous 24 à 48 h pour l’ajuster avec vous.', 'It will reach your inbox in a few minutes. An expert will get back to you within 24 to 48 hours to fine-tune it with you.')}</p>
        {dryRun && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{L(lang, 'Page de test : rien n’a été envoyé. Le contenu de l’envoi est dans la console du navigateur.', 'Test page: nothing was sent. The payload is in the browser console.')}</p>}
      </div>
    );
  } else if (guided) {
    const field = (['industry', 'goals', 'monthlyBudget'] as const)[guided.step];
    const gq = guidedQuestions.find((x) => x.id === field)!;
    const tt = GUIDED_TITLES[field];
    body = (
      <>
        {kicker(L(lang, `Aidez-moi à choisir, question ${guided.step + 1} sur 3`, `Help me choose, question ${guided.step + 1} of 3`))}
        {title(lang === 'fr' ? tt.fr : tt.en)}
        <p className="mb-4 mt-1.5 text-sm text-slate-500">{lang === 'fr' ? tt.subFr : tt.subEn}</p>
        <div className="grid gap-2 lg:grid-cols-2">
          {(gq.options ?? []).map((o) => {
            const checked = guided[field] === o.id;
            return (
              <button key={o.id} type="button" role="radio" aria-checked={checked} className={optionClass(checked)} onClick={() => answerGuided(field, o.id)}>
                <Mark checked={checked} /><span className="block text-[14.5px] font-semibold">{o.label[lang]}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (cur === 'pick') {
    body = (
      <>
        {kicker(L(lang, 'Votre devis en quelques questions', 'Your quote in a few questions'))}
        {title(L(lang, 'De quoi avez-vous besoin ?', 'What do you need?'))}
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
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={startGuided} className="text-[14px] font-semibold text-primary-600 underline underline-offset-2">{L(lang, 'Je ne sais pas encore, aidez-moi à choisir', 'Not sure yet? Help me choose')}</button>
          <span className="flex flex-wrap items-center gap-2 text-sm text-slate-500">{L(lang, 'Prix en', 'Prices in')} <CurrencySwitch /></span>
        </div>
      </>
    );
    actions = <button type="button" className={primaryBtn} disabled={!draft.length} onClick={startFromPick}>{L(lang, 'Continuer', 'Continue')}{draft.length ? ` (${draft.length})` : ''}<IconNext /></button>;
  } else if (cur === 'duration') {
    body = (
      <>
        {kicker(L(lang, 'Dernière question', 'Last question'))}
        {title(L(lang, 'Sur combien de mois ?', 'For how many months?'))}
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
    body = null;
  } else {
    const q = QUESTION_INDEX[cur];
    const list = visibleQuestions(q.domain, st.answers);
    const k = list.findIndex((x) => x.id === cur);
    const answered = st.answers[cur] !== undefined;
    const auto = q.kind === 'level' || q.kind === 'choice';
    body = (
      <>
        {kicker(`${domainName(q.domain, lang)}${list.length > 1 ? L(lang, `, question ${k + 1} sur ${list.length}`, `, question ${k + 1} of ${list.length}`) : ''}`)}
        {title(t(q.title, lang))}
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
  const pct = guided ? (guided.step / 3) * 100 : seq.length > 1 ? (i / (seq.length - 1)) * 100 : 0;
  const onBack = () => {
    if (guided) { if (guided.step === 0) setGuided(null); else setGuided({ ...guided, step: guided.step - 1 }); return; }
    go(i - 1);
  };


  // --- la page de résultat : on quitte le bloc qui défile (retour de Paul du 22/09) --------------
  const renderResults = () => {
    const nb = quote.domains.length;
    const linesOf = (per: 'month' | 'once' | 'media' | 'quote') => quote.domains.flatMap((dq) => (dq.discuss ? [] : dq.lines.filter((l) => l.per === per).map((l) => ({ d: dq.domain, l }))));
    const talkDomains = quote.domains.filter((dq) => dq.discuss || dq.empty);
    const firstName = contact.name.trim().split(/\s+/)[0];
    const rise = (k: number) => ({ className: 'motion-safe:animate-fade-in-up [animation-fill-mode:both]', style: { animationDelay: `${k * 120}ms` } });
    const inputCls = `${inputClass} h-11`;
    const questions: { key: keyof typeof audit; q: string; ph: string }[] = [
      { key: 'clients', q: L(lang, 'Qui sont vos clients, et comment vous trouvent-ils aujourd’hui ?', 'Who are your customers, and how do they find you today?'), ph: L(lang, 'Ex. : des PME industrielles, surtout par le bouche-à-oreille', 'E.g. industrial SMEs, mostly through word of mouth') },
      { key: 'works', q: L(lang, 'Qu’est-ce qui marche déjà, et qu’est-ce qui coince ?', 'What already works, and what gets stuck?'), ph: L(lang, 'Ex. : le salon annuel marche, le site ne génère aucun contact', 'E.g. the yearly trade show works, the website brings no leads') },
      { key: 'priority', q: L(lang, 'Votre priorité pour les trois prochains mois ?', 'Your priority for the next three months?'), ph: L(lang, 'Ex. : 20 rendez-vous qualifiés par mois', 'E.g. 20 qualified meetings a month') }
    ];

    const monthlyCard = (
      <div {...rise(1)} className={`rounded-3xl bg-primary-600 p-6 text-white sm:p-8 ${rise(1).className}`}>
        <p className="text-sm font-medium text-primary-100"><H k="g:monthly" tone="dark">{L(lang, 'Nos honoraires, par mois', 'Our fees, per month')}</H></p>
        <p className="mt-2 font-display text-5xl font-extrabold leading-none tabular-nums sm:text-6xl"><CountUp value={quote.monthly} format={fmt} /></p>
        <p className="mt-2 text-sm text-primary-100">{quote.discountPct ? L(lang, `Remise de ${quote.discountPct}\u00a0% déduite`, `${quote.discountPct}% discount applied`) : L(lang, 'Hors budget média', 'Media budget not included')}</p>
        <div className="mt-6"><DurationSwitch dark /></div>
      </div>
    );
    const tile = (k: number, hint: string, label: string, value: string, sub: string) => (
      <div {...rise(k)} className={`rounded-3xl border border-slate-200 bg-white p-5 ${rise(k).className}`}>
        <p className="text-sm font-medium text-slate-500"><H k={hint}>{label}</H></p>
        <p className="mt-1.5 font-display text-3xl font-extrabold tabular-nums text-slate-900">{value}</p>
        <p className="mt-0.5 text-[13px] text-slate-500">{sub}</p>
      </div>
    );
    const totalLine = (
      <p className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-slate-50 px-5 py-3.5 text-sm">
        <H k="g:total" className="font-semibold text-slate-900">{L(lang, `Nos honoraires sur ${st.duration} mois, mise en place comprise`, `Our fees over ${st.duration} months, set-up included`)}</H>
        <span className="font-display text-xl font-extrabold tabular-nums text-slate-900">{fmt(quote.totalFees)}</span>
      </p>
    );
    const serviceCards = (
      <div className="grid gap-3 md:grid-cols-2">
        {quote.domains.map((dq) => (
          <div key={dq.domain} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-base font-bold text-slate-900">{domainName(dq.domain, lang)}</p>
              <span className="text-right text-sm font-semibold tabular-nums text-slate-900">{domainSummary(dq)}</span>
            </div>
            {!(dq.discuss || dq.empty) && (
              <ul className="mt-2.5 space-y-1.5 text-[13.5px] text-slate-600">
                {dq.lines.map((l) => (
                  <li key={l.label.fr} className="flex justify-between gap-3"><H k={l.info}>{t(l.label, lang)}</H><span className="whitespace-nowrap tabular-nums">{amountText(l.amount, l.per)}</span></li>
                ))}
              </ul>
            )}
            <button type="button" className="mt-3 text-[13px] font-semibold text-primary-600 underline underline-offset-2" onClick={() => editDomain(dq.domain)}>
              {dq.discuss || dq.empty ? L(lang, 'Préciser', 'Set it up') : L(lang, 'Modifier', 'Edit')}
            </button>
          </div>
        ))}
      </div>
    );
    const phase = (title: string, amount: string, rows: { d: ServiceDomain; l: DomainQuote['lines'][number] }[], extra?: React.ReactNode) => (
      <li className="grid gap-3 border-t border-slate-200 py-5 first:border-t-0 first:pt-0 md:grid-cols-[220px_1fr]">
        <div>
          <p className="font-display text-lg font-bold text-slate-900">{title}</p>
          <p className="text-sm font-semibold tabular-nums text-primary-700">{amount}</p>
        </div>
        <ul className="space-y-2 text-[14px] text-slate-700">
          {rows.map(({ d, l }) => (
            <li key={d + l.label.fr} className="flex justify-between gap-4">
              <span><span className="block text-[12px] font-medium text-slate-500">{domainName(d, lang)}</span><H k={l.info}>{t(l.label, lang)}</H></span>
              <span className="whitespace-nowrap tabular-nums">{amountText(l.amount, l.per)}</span>
            </li>
          ))}
          {extra}
        </ul>
      </li>
    );
    const plan = (
      <ol>
        {linesOf('once').length > 0 && phase(L(lang, 'Au démarrage', 'To start'), `${fmt(quote.oneOff)}${perLabel('once', lang)}`, linesOf('once'))}
        {phase(L(lang, 'Chaque mois', 'Every month'), `${fmt(quote.monthly)}${perLabel('month', lang)}`, linesOf('month'))}
        {(linesOf('media').length > 0 || linesOf('quote').length > 0 || talkDomains.length > 0) && phase(
          L(lang, 'En parallèle', 'Alongside'),
          quote.media ? `${fmt(quote.media)}${perLabel('month', lang)} ${L(lang, 'de média', 'media')}` : L(lang, 'À voir ensemble', 'To discuss'),
          [...linesOf('media'), ...linesOf('quote')],
          talkDomains.map((dq) => (
            <li key={dq.domain} className="flex justify-between gap-4"><span><span className="block text-[12px] font-medium text-slate-500">{domainName(dq.domain, lang)}</span>{L(lang, 'À discuter ensemble', 'To discuss together')}</span></li>
          ))
        )}
      </ol>
    );

    const auditPanel = status === 'sent' ? (
      <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-10">
        <h3 className="font-display text-2xl font-bold sm:text-3xl">{L(lang, `Merci ${firstName}, c’est parti`, `Thank you ${firstName}, we’re on it`)}</h3>
        <p className="mt-3 max-w-2xl text-slate-300">{L(lang, `Le devis arrive dans votre boîte mail dans quelques minutes. On étudie ${contact.company.trim()} de près, et on revient vers vous sous 24 à 48 h.`, `The quote reaches your inbox in a few minutes. We take a close look at ${contact.company.trim()} and get back to you within 24 to 48 hours.`)}</p>
        <a href={BOOKING_URL} target="_blank" rel="noopener" className="mt-6 inline-flex h-11 items-center rounded-xl bg-white px-5 text-[15px] font-semibold text-slate-900">{L(lang, 'Réserver un appel de 30 min', 'Book a 30-min call')}</a>
        {dryRun && <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{L(lang, 'Page de test : rien n’a été envoyé. Le contenu de l’envoi est dans la console du navigateur.', 'Test page: nothing was sent. The payload is in the browser console.')}</p>}
      </div>
    ) : (
      <div className="rounded-3xl border border-primary-100 bg-primary-50/70 p-5 sm:p-8">
        <h3 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{L(lang, 'Un audit fait pour votre entreprise, en plus du devis', 'An audit built for your business, on top of the quote')}</h3>
        <p className="mt-2 max-w-2xl text-slate-600">{L(lang, 'Ce devis repose sur nos grilles de prix. Donnez-nous votre site et quelques réponses : on regarde votre entreprise de l’extérieur, vos recherches, vos concurrents, votre tracking, et on vous envoie un audit adapté.', 'This quote is based on our price grid. Share your website and a few answers: we look at your business from the outside, your searches, your competitors, your tracking, and send you a tailored audit.')}</p>
        <form className="mt-6 grid gap-4" onSubmit={(e) => { e.preventDefault(); submit(); }} noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Entreprise', 'Company')}
              <input className={inputCls} autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Site web', 'Website')} <span className="-mt-1 text-[12px] font-normal text-slate-500">{L(lang, 'Facultatif, mais c’est lui qu’on audite', 'Optional, but it is what we audit')}</span>
              <input className={inputCls} inputMode="url" autoComplete="url" value={audit.website} onChange={(e) => setAudit({ ...audit, website: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Nom', 'Name')}
              <input className={inputCls} autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
            </label>
            <label className="grid gap-1.5 text-[13px] font-semibold text-slate-700">{L(lang, 'Email professionnel', 'Work email')}
              <input type="email" className={inputCls} autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </label>
          </div>
          {questions.map((x) => (
            <label key={x.key} className="block rounded-2xl border border-slate-200 bg-white p-4 transition-colors focus-within:border-primary-600">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[15px] font-bold text-slate-900">{x.q}</span>
                <span className="shrink-0 text-xs text-slate-500">{L(lang, 'Facultatif', 'Optional')}</span>
              </span>
              <textarea rows={2} placeholder={x.ph} value={audit[x.key]} onChange={(e) => setAudit({ ...audit, [x.key]: e.target.value })}
                className="mt-2 w-full resize-y border-0 bg-transparent p-0 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0" />
            </label>
          ))}
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website_url" />
          {formError && <p className="text-sm font-medium text-red-700" role="alert">{formError}</p>}
          {status === 'error' && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {L(lang, 'L’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez-nous depuis la ', 'Sending failed. Please try again in a moment, or reach us through the ')}
              <a className="font-semibold underline" href={`/${lang}/contact`}>{L(lang, 'page contact', 'contact page')}</a>.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={status === 'sending'} className="inline-flex h-12 items-center justify-center rounded-xl bg-primary-600 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
              {status === 'sending' ? L(lang, 'Envoi...', 'Sending...') : L(lang, 'Recevoir mon devis et mon audit', 'Get my quote and my audit')}
            </button>
            <a href={BOOKING_URL} target="_blank" rel="noopener" className="inline-flex h-12 items-center rounded-xl bg-white px-5 text-[15px] font-semibold text-slate-900 ring-1 ring-slate-200 hover:ring-slate-300">{L(lang, 'Réserver un appel de 30 min', 'Book a 30-min call')}</a>
          </div>
          <p className="text-xs text-slate-500">{L(lang, 'Sans engagement. Vos réponses servent uniquement à préparer l’audit.', 'No commitment. Your answers are only used to prepare the audit.')}</p>
        </form>
      </div>
    );

    const steps = [
      [L(lang, 'Le devis arrive par email', 'The quote lands in your inbox'), L(lang, 'Dans quelques minutes, avec le détail service par service.', 'Within minutes, service by service.')],
      [L(lang, 'On étudie votre entreprise', 'We study your business'), L(lang, 'Votre site, vos recherches, vos concurrents : l’audit part de là.', 'Your website, your searches, your competitors: the audit starts there.')],
      [L(lang, 'On en parle ensemble', 'We talk it through'), L(lang, 'Un expert vous rappelle sous 24 à 48 h, sans engagement.', 'An expert calls you within 24 to 48 hours, no commitment.')]
    ];

    return (
      <div ref={rootRef} className="overflow-clip rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-7">
          <button type="button" onClick={() => go(i - 1)} disabled={status === 'sent'} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 disabled:opacity-30">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100"><IconBack /></span>{L(lang, 'Modifier mes réponses', 'Edit my answers')}
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {dryRun && (
              <div className="inline-flex rounded-xl bg-amber-50 p-1" role="radiogroup" aria-label={L(lang, 'Mise en page à comparer', 'Layout to compare')}>
                {([['a', L(lang, 'A. Le tableau', 'A. The board')], ['b', L(lang, 'B. Le plan', 'B. The plan')]] as const).map(([v, lab]) => (
                  <button key={v} type="button" role="radio" aria-checked={resultStyle === v} onClick={() => setResultStyle(v)}
                    className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${resultStyle === v ? 'bg-white text-slate-900 shadow-sm' : 'text-amber-800'}`}>{lab}</button>
                ))}
              </div>
            )}
            <CurrencySwitch />
          </div>
        </div>

        <div className="space-y-10 px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div {...rise(0)}>
            <p className="text-[13px] font-semibold text-primary-600">{proposalBudget ? L(lang, 'Notre proposition', 'Our proposal') : L(lang, 'C’est prêt', 'All set')}</p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {proposalBudget ? L(lang, `Pour environ ${fmt(proposalBudget)} par mois`, `For about ${fmt(proposalBudget)} a month`) : L(lang, 'Votre devis est prêt', 'Your quote is ready')}
            </h2>
            <p className="mt-2 text-slate-600">
              {L(lang, `${nb} service${nb > 1 ? 's' : ''}, engagement de ${st.duration} mois. Tout reste modifiable, et chaque terme souligné a sa définition.`, `${nb} service${nb > 1 ? 's' : ''}, ${st.duration}-month commitment. Everything can still change, and each underlined term has its definition.`)}
              {proposalBudget ? <> <button type="button" onClick={restart} className="font-semibold text-primary-600 underline underline-offset-2">{L(lang, 'Repartir de zéro', 'Start over')}</button></> : null}
            </p>
          </div>

          {resultStyle === 'a' ? (
            <>
              <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                {monthlyCard}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {tile(2, 'g:once', L(lang, 'Mise en place', 'Set-up'), fmt(quote.oneOff), L(lang, 'Une seule fois, au démarrage', 'Once, at the start'))}
                  {tile(3, 'media', L(lang, 'Budget média', 'Media budget'), `${fmt(quote.media)}${perLabel('month', lang)}`, L(lang, 'En plus, dépensé sur les plateformes', 'On top, spent on the platforms'))}
                </div>
              </section>
              <div {...rise(4)}>{totalLine}</div>
              <section {...rise(5)}>
                <h3 className="mb-4 font-display text-xl font-bold text-slate-900">{L(lang, 'Le détail, service par service', 'Service by service')}</h3>
                {serviceCards}
              </section>
            </>
          ) : (
            <>
              <section {...rise(1)} className={`rounded-3xl bg-primary-600 px-6 py-10 text-center text-white sm:px-10 ${rise(1).className}`}>
                <p className="text-sm font-medium text-primary-100"><H k="g:monthly" tone="dark">{L(lang, 'Nos honoraires, par mois', 'Our fees, per month')}</H></p>
                <p className="mt-3 font-display text-6xl font-extrabold leading-none tabular-nums sm:text-7xl"><CountUp value={quote.monthly} format={fmt} /></p>
                <p className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-primary-100">
                  <span>+ {fmt(quote.oneOff)} <H k="g:once" tone="dark">{L(lang, 'de mise en place', 'set-up')}</H></span>
                  <span><H k="media" tone="dark">{L(lang, 'budget média', 'media budget')}</H> {fmt(quote.media)}{perLabel('month', lang)}</span>
                </p>
                <div className="mx-auto mt-6 max-w-md"><DurationSwitch dark /></div>
              </section>
              <div {...rise(2)}>{totalLine}</div>
              <section {...rise(3)}>
                <h3 className="mb-5 font-display text-xl font-bold text-slate-900">{L(lang, 'Votre plan', 'Your plan')}</h3>
                {plan}
                <p className="mt-4 flex flex-wrap gap-2 text-[13px]">
                  <span className="text-slate-500">{L(lang, 'Modifier :', 'Edit:')}</span>
                  {quote.domains.map((dq) => <button key={dq.domain} type="button" onClick={() => editDomain(dq.domain)} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-200">{domainName(dq.domain, lang)}</button>)}
                </p>
              </section>
            </>
          )}

          <section {...rise(6)}>{auditPanel}</section>

          <section {...rise(7)}>
            <h3 className="mb-4 font-display text-xl font-bold text-slate-900">{L(lang, 'Ce qui se passe ensuite', 'What happens next')}</h3>
            <ol className="grid gap-4 md:grid-cols-3">
              {steps.map(([title, text], k) => (
                <li key={title} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">{k + 1}</span>
                  <span><span className="block font-semibold text-slate-900">{title}</span><span className="block text-sm text-slate-600">{text}</span></span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    );
  };

  if (!guided && cur === 'recap') return renderResults();

  return (
    <div ref={rootRef} className="overflow-clip rounded-3xl border border-slate-200 bg-white shadow-soft lg:grid lg:h-[680px] lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="flex flex-col lg:min-h-0" onMouseOver={onOver} onMouseOut={onOut} onFocus={onOver} onBlur={onOut}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-7">
          <button type="button" aria-label={L(lang, 'Retour', 'Back')} disabled={(!guided && i === 0) || status === 'sent'} onClick={onBack}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-900 disabled:opacity-30"><IconBack /></button>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-primary-600 transition-[width] duration-300" style={{ width: `${status === 'sent' ? 100 : pct}%` }} /></div>
          <span className="min-w-[38px] text-right text-[12.5px] tabular-nums text-slate-500">{guided ? `${guided.step + 1}/3` : `${Math.min(i + 1, seq.length)}/${seq.length}`}</span>
        </div>
        <div ref={bodyRef} className="min-h-[440px] px-4 py-6 sm:px-7 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">{body}</div>
        {status !== 'sent' && !guided && (
          <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-7 lg:static lg:flex-row-reverse lg:items-center lg:justify-between lg:py-4">
            {actions && <div className="flex gap-2">{actions}</div>}
            <div className="min-w-0" aria-live="polite">
              {st.domains.length && (quote.monthly > 0 || quote.oneOff > 0 || quote.media > 0 || talk > 0 || quote.domains.some((d) => d.lines.some((l) => l.per === 'quote'))) ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[13px] text-slate-500">{L(lang, 'Votre estimation', 'Your estimate')}{quote.discountPct ? <em className="ml-1 font-semibold not-italic text-emerald-700">-{quote.discountPct}&nbsp;%</em> : null}</span>
                    <strong className="font-display text-[23px] font-extrabold tabular-nums text-slate-900">{fmt(quote.monthly)}<span className="ml-0.5 text-[13px] font-medium text-slate-500">{L(lang, '/mois', '/mo')}</span></strong>
                  </div>
                  {(quote.oneOff > 0 || quote.media > 0 || talk > 0) && (
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-[12.5px] leading-snug text-slate-500">
                      {quote.oneOff > 0 && <span>+ {fmt(quote.oneOff)} <H k="g:once">{L(lang, 'de mise en place', 'set-up')}</H></span>}
                      {quote.media > 0 && <span><H k="media">{L(lang, 'budget média', 'media budget')}</H> {fmt(quote.media)}{L(lang, '/mois en plus', '/mo on top')}</span>}
                      {talk > 0 && <span>{L(lang, `${talk} à discuter`, `${talk} to discuss`)}</span>}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">{st.domains.length ? L(lang, 'Le prix s’affiche dès votre première réponse.', 'The price shows up with your first answer.') : L(lang, 'Choisissez un service pour voir le prix.', 'Pick a service to see the price.')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-slate-50 p-6 lg:flex" onMouseEnter={onGuideEnter} onMouseLeave={onGuideLeave}>
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
