import { useEffect, useState } from 'react';
import { formatPrice } from '../academy/offres';
import { SYMBOLE, type Devise } from '../academy/data';
import { allerA } from '../academy/ancre';
import { paramGarde, trackSelectItem, useLienApp } from '../academy/track';
import { copyV2, type Locale } from './copy-v2';

/**
 * L'offre, juste après le programme (06/10/2026).
 *
 * ⚠️ POURQUOI ELLE EXISTE. Du 16/09 au 05/10, 82 % des visites de la page
 * venaient d'un téléphone, pour 28 s d'attention en moyenne, et les tarifs
 * n'arrivaient qu'au 22e écran du téléphone (15e sur bureau). Presque personne
 * ne voyait un prix. Cette bande les pose au 3e écran ; la grille complète
 * (`Tarifs`, licences, code promo, réassurance) reste en bas pour qui veut le
 * détail. Direction A du labo `page-vente-courte.html`, choisie par Paul.
 *
 * ⚠️ Rien n'est calculé ici : les trois prix et le prix plein barré arrivent de
 * l'application, exactement ceux que reçoit `Tarifs`. Une licence, sans remise
 * d'équipe : le nombre de licences se choisit dans la grille complète.
 *
 * ⚠️ Un code promo voyage déjà dans les liens (`useLienApp`) et le tunnel
 * l'applique. Le montant remisé, lui, n'est calculé que par l'application, et
 * la grille du bas l'affiche ; ici on le dit en une ligne plutôt que de refaire
 * l'appel trois fois de plus.
 */
export default function OffreCourte({
  locale,
  devise,
  prixProgrammeMinor,
  prixAutoMinor,
  prixLotMinor,
  pleinLotMinor,
  accesJours,
  leconsProgramme,
  leconsComplement,
  leconsGratuit,
  essaiHeures,
  lienGratuit,
  garantie,
}: {
  locale: Locale;
  devise: Devise;
  prixProgrammeMinor: number;
  prixAutoMinor: number;
  prixLotMinor: number;
  pleinLotMinor: number;
  accesJours: number;
  leconsProgramme: number;
  leconsComplement: number;
  leconsGratuit: number;
  essaiHeures: number;
  lienGratuit: string;
  garantie: { heures: number; seuilPct: number };
}) {
  const v = copyV2(locale);
  const c = v.offre;
  const t = v.tarifs;
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => setCode(paramGarde('coupon')), []);

  const base = 'https://academy.mydigipal.com/checkout';
  const q = `&seats=1&lang=${locale}&devise=${devise}`;
  const lienMethode = useLienApp(`${base}?items=programme${q}`);
  const lienAuto = useLienApp(`${base}?items=construire${q}`);
  const lienLot = useLienApp(`${base}?items=programme,construire${q}`);
  const montant = (minor: number) => `${formatPrice(minor, locale)} ${SYMBOLE[devise]}`;

  // Le même `select_item` que la grille du bas, avec le même nom d'article :
  // GTM y accroche ViewContent chez Meta et Reddit.
  const choisir = (id: string, nom: string, minor: number) =>
    trackSelectItem({ tier: id, tierName: nom, value: minor / 100, currency: devise });

  const portes: Array<{
    id: string;
    nom: string;
    sous: string;
    lecons: string;
    minor: number;
    plein?: number;
    lien: string;
    ton: 'or' | 'avance' | 'lot';
  }> = [
    { id: 'programme', nom: t.methode, sous: t.methodeSous, lecons: c.lecons(leconsProgramme), minor: prixProgrammeMinor, lien: lienMethode, ton: 'or' },
    { id: 'construire', nom: t.auto, sous: t.autoSous, lecons: c.lecons(leconsComplement), minor: prixAutoMinor, lien: lienAuto, ton: 'avance' },
    {
      id: 'programme,construire',
      nom: t.lot,
      sous: c.leconsLot(leconsProgramme + leconsComplement),
      lecons: '',
      minor: prixLotMinor,
      plein: pleinLotMinor > prixLotMinor ? pleinLotMinor : undefined,
      lien: lienLot,
      ton: 'lot',
    },
  ];

  return (
    <section id="offre" className="scroll-mt-20 border-t border-filet-nuit px-4 py-16 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="m-0 text-ivoire">{c.titre}</h2>
        <p className="m-0 mt-3 max-w-[62ch] text-[16.5px] leading-[1.6] text-brume-nuit">{c.chapeau(accesJours)}</p>

        {/* Sur bureau, trois colonnes dont la dernière, le lot, un peu plus
            large. Sous lg, une porte par ligne, le prix à droite du nom :
            les trois tiennent dans un écran et demi de téléphone. */}
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)]">
          {portes.map((p) => (
            <div
              key={p.id}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 rounded-carte border p-5 lg:grid-cols-[minmax(0,1fr)] lg:content-start ${
                p.ton === 'lot' ? 'border-or bg-[linear-gradient(180deg,rgba(200,169,81,.10),rgba(200,169,81,.02))]' : 'border-filet-nuit bg-salle-2'
              }`}
            >
              <div className="min-w-0">
                <span
                  className={`font-ac-mono text-[10.5px] uppercase tracking-[.12em] ${p.ton === 'avance' ? 'text-avance' : 'text-or'}`}
                >
                  {p.nom}
                </span>
                <p className="m-0 mt-1 text-[15.5px] leading-[1.4] text-ivoire">{p.sous}</p>
              </div>
              <div className="row-span-2 text-right lg:row-span-1 lg:mt-3 lg:text-left">
                <span className="block text-[28px] font-semibold tabular-nums leading-none text-ivoire lg:inline lg:text-[36px]">
                  {montant(p.minor)}
                </span>
                {p.plein ? (
                  <span className="mt-1 block font-ac-mono text-[13px] tabular-nums text-brume-nuit line-through lg:ml-2.5 lg:inline">
                    {montant(p.plein)}
                  </span>
                ) : null}
              </div>
              <p className="m-0 font-ac-mono text-[12px] text-brume-nuit">
                {p.lecons ? `${p.lecons}, ` : ''}
                {t.duree(accesJours)}
              </p>
              <a
                href={p.lien}
                onClick={() => choisir(p.id, p.nom, p.minor)}
                className={`col-span-2 mt-3 inline-flex min-h-11 items-center justify-center rounded-bouton px-6 text-[15px] font-semibold transition active:translate-y-px lg:col-span-1 ${
                  p.ton === 'lot'
                    ? 'bg-or text-salle hover:bg-or-vif'
                    : 'border border-filet-nuit text-ivoire hover:border-brume-nuit'
                }`}
              >
                {t.commencer}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14.5px] leading-[1.5] text-brume-nuit">
          <a href={lienGratuit} className="text-ivoire underline decoration-filet-nuit underline-offset-4 hover:decoration-ivoire">
            {c.gratuit(leconsGratuit, essaiHeures)}
          </a>
          <span>{c.garantie(garantie)}</span>
          <a
            href="#tarifs"
            onClick={(e) => {
              e.preventDefault();
              allerA('tarifs');
            }}
            className="text-ivoire underline decoration-filet-nuit underline-offset-4 hover:decoration-ivoire"
          >
            {c.detail}
          </a>
        </div>
        {code ? <p className="m-0 mt-3 font-ac-mono text-[12.5px] text-or">{c.code(code)}</p> : null}
      </div>
    </section>
  );
}
