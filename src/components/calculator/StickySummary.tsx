/** @jsxImportSource react */
import { useState, useEffect } from 'react';
import type { Currency, PricingSummary } from './types';
import { CURRENCY_CONFIGS, convertPrice, formatPrice } from './data';

interface DomainLine {
  id: string;
  name: string;
  icon: string;
  monthly: number;
  oneOff: number;
  isNotSure?: boolean;
}

interface StickySummaryProps {
  lang: 'en' | 'fr';
  currency: Currency;
  setCurrency: (c: Currency) => void;
  pricing: PricingSummary & {
    totalMonthlyWithoutBudget: number;
    hasCustomQuote: boolean;
    adBudgetTotal: number;
  };
  domainLines: DomainLine[];
  hasSelections: boolean;
  hasActualSelections: boolean;
  hasNotSureSelections: boolean;
  onRequestPlan: () => void;
}

const fp = (n: number, lang: 'en' | 'fr', currency: Currency) =>
  formatPrice(convertPrice(n, currency), currency, lang);

export default function StickySummary({
  lang,
  currency,
  setCurrency,
  pricing,
  domainLines,
  hasSelections,
  hasActualSelections,
  hasNotSureSelections,
  onRequestPlan,
}: StickySummaryProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Auto-collapse mobile drawer when no selection
  useEffect(() => {
    if (!hasSelections) setMobileExpanded(false);
  }, [hasSelections]);

  if (!hasSelections) return null;

  const monthlyDisplay = pricing.hasCustomQuote
    ? lang === 'fr' ? 'Sur devis' : 'Custom'
    : fp(Math.round(pricing.totalMonthlyWithoutBudget), lang, currency);

  const ctaLabel = hasActualSelections
    ? lang === 'fr' ? 'Recevoir ce plan par email' : 'Get this plan by email'
    : lang === 'fr' ? 'Discutons-en' : "Let's discuss";

  const titleText = lang === 'fr' ? 'Mon plan personnalisé' : 'My tailored plan';

  return (
    <>
      {/* === DESKTOP: sticky card aligned to grid column right === */}
      <aside
        className="hidden lg:flex z-40 flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl p-5"
        style={{
          position: 'sticky',
          top: '120px',
          alignSelf: 'start',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto',
        }}
        aria-label={titleText}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{titleText}</h3>
        </div>

        {/* Domain lines */}
        {domainLines.length > 0 && (
          <ul className="space-y-2 pt-2 border-t border-slate-100">
            {domainLines.map(d => (
              <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5 text-slate-700 truncate">
                  <span className="text-base">{d.icon}</span>
                  <span className="truncate">{d.name}</span>
                </span>
                {d.isNotSure ? (
                  <span className="text-amber-600 text-xs font-medium whitespace-nowrap">
                    {lang === 'fr' ? 'à discuter' : 'to discuss'}
                  </span>
                ) : d.monthly > 0 ? (
                  <span className="text-slate-900 font-semibold text-xs whitespace-nowrap">
                    {fp(Math.round(d.monthly), lang, currency)}<span className="text-slate-400 font-normal">/mo</span>
                  </span>
                ) : d.oneOff > 0 ? (
                  <span className="text-emerald-600 font-semibold text-xs whitespace-nowrap">
                    {fp(Math.round(d.oneOff), lang, currency)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {/* Totals */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'Mensuel' : 'Monthly'}</span>
            <span className={`font-bold leading-none ${pricing.hasCustomQuote ? 'text-amber-600 text-base' : 'text-slate-900 text-2xl'}`}>
              {monthlyDisplay}
            </span>
          </div>
          {pricing.oneOffTotal > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'One-off' : 'One-time'}</span>
              <span className="text-emerald-600 font-bold">{fp(Math.round(pricing.oneOffTotal), lang, currency)}</span>
            </div>
          )}
          {pricing.adBudgetTotal > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-amber-700 uppercase tracking-wide">{lang === 'fr' ? 'Budget pub' : 'Ad budget'}</span>
              <span className="text-amber-700 font-semibold text-sm">{fp(Math.round(pricing.adBudgetTotal), lang, currency)}<span className="text-amber-500 text-xs">/mo</span></span>
            </div>
          )}
        </div>

        {/* Currency switcher mini */}
        <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['EUR', 'USD', 'GBP'] as Currency[]).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              aria-label={c}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${
                currency === c
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {CURRENCY_CONFIGS[c].symbol} {c}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onRequestPlan}
          className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22 6 12 13 2 6" />
          </svg>
          {ctaLabel}
        </button>
        <p className="text-[11px] text-slate-500 text-center leading-snug">
          {lang === 'fr' ? 'Sans engagement · Réponse sous 24h' : 'No commitment · Reply within 24h'}
        </p>
      </aside>

      {/* === MOBILE: bottom bar (collapsed) + expandable drawer === */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Expandable drawer */}
        {mobileExpanded && (
          <div className="bg-white border-t border-slate-200 shadow-2xl rounded-t-2xl px-4 pt-4 pb-2 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{titleText}</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileExpanded(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {domainLines.length > 0 && (
              <ul className="space-y-2 pb-3 border-b border-slate-100">
                {domainLines.map(d => (
                  <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5 text-slate-700 truncate">
                      <span className="text-base">{d.icon}</span>
                      <span className="truncate">{d.name}</span>
                    </span>
                    {d.isNotSure ? (
                      <span className="text-amber-600 text-xs font-medium whitespace-nowrap">
                        {lang === 'fr' ? 'à discuter' : 'to discuss'}
                      </span>
                    ) : d.monthly > 0 ? (
                      <span className="text-slate-900 font-semibold text-xs whitespace-nowrap">
                        {fp(Math.round(d.monthly), lang, currency)}<span className="text-slate-400 font-normal">/mo</span>
                      </span>
                    ) : d.oneOff > 0 ? (
                      <span className="text-emerald-600 font-semibold text-xs whitespace-nowrap">
                        {fp(Math.round(d.oneOff), lang, currency)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {pricing.oneOffTotal > 0 && (
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xs text-slate-500 uppercase tracking-wide">{lang === 'fr' ? 'One-off' : 'One-time'}</span>
                <span className="text-emerald-600 font-bold">{fp(Math.round(pricing.oneOffTotal), lang, currency)}</span>
              </div>
            )}
            {pricing.adBudgetTotal > 0 && (
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-amber-700 uppercase tracking-wide">{lang === 'fr' ? 'Budget pub' : 'Ad budget'}</span>
                <span className="text-amber-700 font-semibold text-sm">{fp(Math.round(pricing.adBudgetTotal), lang, currency)}<span className="text-amber-500 text-xs">/mo</span></span>
              </div>
            )}
            <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-lg p-0.5 mt-3">
              {(['EUR', 'USD', 'GBP'] as Currency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  aria-label={c}
                  className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    currency === c
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {CURRENCY_CONFIGS[c].symbol} {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Always-visible compact bar */}
        <div className="bg-white border-t border-slate-200 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.15)] px-3 py-2 flex items-center justify-between gap-2"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="flex-shrink-0 flex flex-col items-start"
            aria-label={mobileExpanded ? (lang === 'fr' ? 'Réduire' : 'Collapse') : (lang === 'fr' ? 'Détails' : 'Details')}
          >
            <span className="text-[9px] text-slate-500 uppercase tracking-wide leading-none">{lang === 'fr' ? 'Mensuel' : 'Monthly'}</span>
            <span className={`font-bold leading-tight ${pricing.hasCustomQuote ? 'text-amber-600 text-sm' : 'text-slate-900 text-lg'}`}>
              {monthlyDisplay}
            </span>
          </button>
          <button
            type="button"
            onClick={onRequestPlan}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22 6 12 13 2 6" />
            </svg>
            <span>{lang === 'fr' ? 'Recevoir par email' : 'Get by email'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
