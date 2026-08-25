import { useState } from 'react';
import type { Locale } from './data';

/**
 * Le formulaire équipe, au-delà des places que le configurateur accepte de
 * calculer (25/08/2026). Il remplace le `mailto:` : la demande est gardée
 * dans l'app, poussée dans le CRM comme lead, et signalée à Paul par courriel.
 * Le champ `website` est un piège que seuls les robots remplissent.
 */
export interface EquipeCopy {
  titre: string;
  societe: string;
  nom: string;
  email: string;
  places: string;
  message: string;
  envoyer: string;
  envoi: string;
  merci: string;
  erreur: string;
}

export default function FormEquipe({ locale, seats, base, c }: { locale: Locale; seats: number; base: string; c: EquipeCopy }) {
  const [societe, setSociete] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [places, setPlaces] = useState(String(seats));
  const [message, setMessage] = useState('');
  const [piege, setPiege] = useState('');
  const [etat, setEtat] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setEtat('sending');
    try {
      const res = await fetch(`${base}/api/academy/public/team-request`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          company: societe,
          name: nom,
          email,
          seats: Number(places) || seats,
          message,
          language: locale,
          page: typeof location !== 'undefined' ? location.href : undefined,
          website: piege,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setEtat('done');
    } catch {
      setEtat('error');
    }
  }

  const champ = 'w-full rounded-bouton border border-filet-nuit bg-salle px-3.5 py-2.5 text-[14.5px] text-ivoire outline-none placeholder:text-brume-nuit focus:border-or';
  const label = 'mb-1 block font-ac-mono text-[10.5px] uppercase tracking-[0.12em] text-brume-nuit';

  if (etat === 'done') {
    return <p className="m-0 mt-4 text-[15px] leading-[1.6] text-ivoire">{c.merci}</p>;
  }

  return (
    <form id="equipe" onSubmit={envoyer} className="mt-4 grid gap-3 scroll-mt-24">
      <p className="m-0 font-ac-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-or">{c.titre}</p>
      <div>
        <label htmlFor="eq-societe" className={label}>{c.societe}</label>
        <input id="eq-societe" required minLength={2} value={societe} onChange={(e) => setSociete(e.target.value)} className={champ} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="eq-nom" className={label}>{c.nom}</label>
          <input id="eq-nom" required minLength={2} value={nom} onChange={(e) => setNom(e.target.value)} className={champ} />
        </div>
        <div>
          <label htmlFor="eq-places" className={label}>{c.places}</label>
          <input id="eq-places" type="number" min={1} max={10000} required value={places} onChange={(e) => setPlaces(e.target.value)} className={champ} />
        </div>
      </div>
      <div>
        <label htmlFor="eq-email" className={label}>{c.email}</label>
        <input id="eq-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={champ} />
      </div>
      <div>
        <label htmlFor="eq-message" className={label}>{c.message}</label>
        <textarea id="eq-message" rows={3} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className={champ} />
      </div>
      <div className="absolute left-[-9999px] top-0" aria-hidden="true">
        <label>
          website <input tabIndex={-1} autoComplete="off" value={piege} onChange={(e) => setPiege(e.target.value)} />
        </label>
      </div>
      <button
        type="submit"
        disabled={etat === 'sending'}
        className="mt-1 block w-full rounded-bouton bg-or px-5 py-3.5 text-center text-[15.5px] font-semibold text-salle transition duration-150 hover:bg-or-vif disabled:opacity-60"
      >
        {etat === 'sending' ? c.envoi : c.envoyer}
      </button>
      {etat === 'error' && <p className="m-0 text-[13px] text-renard">{c.erreur}</p>}
    </form>
  );
}
