import { jour30Copy } from './copy';
import type { Jour30Data, Locale } from './data';

/**
 * Le pied de la page Academy : le logotype, et les liens vers l'application
 * (conditions de vente, confidentialité, mentions, espace apprenant). Ils
 * sont absolus, résolus depuis `data.urls` : l'app vit sur un autre domaine.
 * Le pied de page du site, lui, suit juste après.
 */
export default function Pied({ locale, urls }: { locale: Locale; urls: Jour30Data['urls'] }) {
  const c = jour30Copy(locale).pied;
  return (
    <footer className="border-t border-filet-nuit px-4 py-[34px] sm:px-6">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-7 gap-y-4">
        <img src="/academy/brand/academy-logo-dark.png" alt={c.logoAlt} width={1113} height={457} className="h-[34px] w-auto" />
        <nav className="flex flex-wrap gap-x-[22px] gap-y-2 text-[13.5px]">
          {c.liens.map((l) => (
            <a key={l.cle} href={urls[l.cle as keyof typeof urls]} className="text-or transition duration-150 hover:text-or-vif">
              {l.label}
            </a>
          ))}
          <a href={c.autreLangue.href} hrefLang={locale === 'fr' ? 'en' : 'fr'} className="text-brume-nuit transition duration-150 hover:text-ivoire">
            {c.autreLangue.label}
          </a>
        </nav>
      </div>
    </footer>
  );
}
