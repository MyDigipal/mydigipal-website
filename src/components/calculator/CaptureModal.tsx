/** @jsxImportSource react */
import { useState, useEffect, useRef } from 'react';
import type { Currency, PricingSummary, ContactInfo } from './types';
import { CURRENCY_CONFIGS, convertPrice, formatPrice } from './data';

interface DomainLine {
  id: string;
  name: string;
  icon: string;
  monthly: number;
  oneOff: number;
  isNotSure?: boolean;
}

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  lang: 'en' | 'fr';
  currency: Currency;
  pricing: PricingSummary & {
    totalMonthlyWithoutBudget: number;
    hasCustomQuote: boolean;
    adBudgetTotal: number;
  };
  duration: number;
  domainLines: DomainLine[];
  hasActualSelections: boolean;
  isSubmitting: boolean;
  submitted: boolean;
  contact: ContactInfo;
  setContact: (updater: (prev: ContactInfo) => ContactInfo) => void;
  callPreference: boolean;
  setCallPreference: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const fp = (n: number, lang: 'en' | 'fr', currency: Currency) =>
  formatPrice(convertPrice(n, currency), currency, lang);

export default function CaptureModal({
  open,
  onClose,
  lang,
  currency,
  pricing,
  duration,
  domainLines,
  hasActualSelections,
  isSubmitting,
  submitted,
  contact,
  setContact,
  callPreference,
  setCallPreference,
  onSubmit,
}: CaptureModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // ESC to close + focus trap entry + body scroll lock
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    // Auto-focus first empty field
    setTimeout(() => {
      if (!contact.name && firstFieldRef.current) {
        firstFieldRef.current.focus();
      }
    }, 100);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, isSubmitting, onClose, contact.name]);

  if (!open) return null;

  // V5.6 : amortize one-off over duration, no /mo suffix
  const safeDuration = Math.max(1, duration);
  const amortizedMonthlyTotal = pricing.totalMonthlyWithoutBudget + (pricing.oneOffTotal / safeDuration);
  const monthlyDisplay = pricing.hasCustomQuote
    ? lang === 'fr' ? 'Sur devis' : 'Custom'
    : fp(Math.round(amortizedMonthlyTotal), lang, currency);
  const lineMonthly = (d: DomainLine) => d.monthly + (d.oneOff / safeDuration);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        // Click backdrop = close (only if not on form / submitting)
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitted ? (
          /* === SUCCESS STATE === */
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              {lang === 'fr' ? 'Merci ! On revient vers vous.' : 'Thanks! We will get back to you.'}
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {lang === 'fr'
                ? "Votre plan personnalisé arrive dans votre boîte mail. Vérifiez vos spams si vous ne le voyez pas."
                : "Your tailored plan is on its way. Check your spam folder if you don't see it."}
            </p>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 max-w-md mx-auto text-left">
              <p className="text-sm text-amber-900 font-semibold mb-1">
                {lang === 'fr' ? '⚠️ Vérifiez vos spams MAINTENANT' : '⚠️ Check your spam folder NOW'}
              </p>
              <p className="text-xs text-amber-800">
                {lang === 'fr'
                  ? "Si notre email est en spam, marquez-le 'pas spam' et ajoutez paul@mydigipal.com à vos contacts. Sinon les prochains messages partiront aussi en spam."
                  : "If our email is in spam, mark it 'not spam' and add paul@mydigipal.com to your contacts. Otherwise next messages will land there too."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              {lang === 'fr' ? 'Continuer à explorer' : 'Continue exploring'}
            </button>
          </div>
        ) : (
          /* === FORM STATE === */
          <div className="grid md:grid-cols-2 gap-0">
            {/* LEFT: plan recap */}
            <div className="hidden md:flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-l-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-blue-200">
                  {lang === 'fr' ? 'Ce que vous allez recevoir' : 'What you will receive'}
                </h3>
              </div>
              <p className="text-slate-300 text-sm mb-5">
                {lang === 'fr'
                  ? 'Récapitulatif complet, rapport personnalisé et benchmark de performance par email.'
                  : 'Complete recap, tailored report, and performance benchmark by email.'}
              </p>

              {domainLines.length > 0 && (
                <ul className="space-y-2 mb-5 pb-5 border-b border-slate-700">
                  {domainLines.slice(0, 6).map(d => {
                    const amortized = lineMonthly(d);
                    return (
                      <li key={d.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-200">
                          <span>{d.icon}</span>
                          <span>{d.name}</span>
                        </span>
                        {d.isNotSure ? (
                          <span className="text-amber-300 text-xs">{lang === 'fr' ? 'à discuter' : 'to discuss'}</span>
                        ) : amortized > 0 ? (
                          <span className="text-white font-semibold text-xs">{fp(Math.round(amortized), lang, currency)}</span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {hasActualSelections && !pricing.hasCustomQuote && (
                <div className="mb-4">
                  <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">{lang === 'fr' ? 'Management mensuel' : 'Monthly management'}</div>
                  <div className="text-3xl font-bold">{monthlyDisplay}</div>
                  {pricing.oneOffTotal > 0 && (
                    <div className="text-[11px] text-blue-200/80 italic mt-1">
                      {lang === 'fr'
                        ? `Inclut ${fp(Math.round(pricing.oneOffTotal), lang, currency)} de frais initiaux répartis sur ${safeDuration} mois`
                        : `Includes ${fp(Math.round(pricing.oneOffTotal), lang, currency)} one-time fees spread over ${safeDuration} months`}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2"><span>✓</span><span>{lang === 'fr' ? 'Sans engagement' : 'No commitment'}</span></div>
                <div className="flex items-center gap-2"><span>✓</span><span>{lang === 'fr' ? 'Réponse sous 24h' : 'Reply within 24h'}</span></div>
                <div className="flex items-center gap-2"><span>✓</span><span>{lang === 'fr' ? 'Audit offert' : 'Free audit included'}</span></div>
              </div>
            </div>

            {/* RIGHT: form */}
            <div className="p-6 sm:p-8">
              <h2 id="capture-modal-title" className="text-2xl font-bold text-slate-900 mb-2">
                {lang === 'fr' ? 'Recevez votre plan' : 'Get your plan'}
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                {lang === 'fr'
                  ? 'On vous envoie le récap dans 2 minutes.'
                  : "We will send your recap in 2 minutes."}
              </p>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cm-name" className="block text-sm font-semibold text-slate-700 mb-1">
                    {lang === 'fr' ? 'Nom' : 'Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="cm-name"
                    type="text"
                    placeholder={lang === 'fr' ? 'Jean Dupont' : 'John Doe'}
                    value={contact.name}
                    onChange={(e) => setContact(prev => ({ ...prev, name: e.target.value }))}
                    required
                    autoComplete="name"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="cm-email" className="block text-sm font-semibold text-slate-700 mb-1">
                    {lang === 'fr' ? 'Email pro' : 'Work email'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="cm-email"
                    type="email"
                    placeholder={lang === 'fr' ? 'jean@entreprise.com' : 'john@company.com'}
                    value={contact.email}
                    onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="cm-company" className="block text-sm font-medium text-slate-600 mb-1">
                    {lang === 'fr' ? 'Entreprise' : 'Company'} <span className="text-slate-400 italic text-xs">({lang === 'fr' ? 'facultatif' : 'optional'})</span>
                  </label>
                  <input
                    id="cm-company"
                    type="text"
                    placeholder={lang === 'fr' ? 'Nom de la société' : 'Company name'}
                    value={contact.company}
                    onChange={(e) => setContact(prev => ({ ...prev, company: e.target.value }))}
                    autoComplete="organization"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {/* Call preference checkbox */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={callPreference}
                      onChange={(e) => setCallPreference(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-300"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {lang === 'fr' ? "Vous préférez qu'on vous appelle ?" : 'Prefer a call back?'}
                    </span>
                  </label>
                  {callPreference && (
                    <div className="mt-3 ml-6">
                      <label htmlFor="cm-phone" className="block text-xs font-medium text-slate-600 mb-1">
                        {lang === 'fr' ? 'Téléphone' : 'Phone'}
                      </label>
                      <input
                        id="cm-phone"
                        type="tel"
                        placeholder={lang === 'fr' ? '+33 6 12 34 56 78' : '+1 555 123 4567'}
                        value={contact.phone || ''}
                        onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
                        autoComplete="tel"
                        className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {lang === 'fr' ? 'On vous rappelle sous 24h ouvrées.' : 'We call you back within 24 business hours.'}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !contact.name || !contact.email || (callPreference && !contact.phone)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
                        <path d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" fill="currentColor" />
                      </svg>
                      <span>{lang === 'fr' ? 'Envoi...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22 6 12 13 2 6" />
                      </svg>
                      <span>{lang === 'fr' ? 'Recevoir mon plan' : 'Get my plan'}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center leading-snug">
                  {lang === 'fr'
                    ? 'En envoyant, vous acceptez notre politique de confidentialité. Pas de spam, jamais.'
                    : 'By sending, you accept our privacy policy. No spam, ever.'}
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
