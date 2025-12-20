export const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    hreflang: 'en',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    hreflang: 'fr',
  },
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'en';

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Language;
  return defaultLang;
}

export function useTranslatedPath(lang: Language) {
  return function translatePath(path: string, l: Language = lang) {
    const pathWithoutLang = path.replace(/^\/(en|fr)/, '');
    return `/${l}${pathWithoutLang}`;
  };
}

export function getAlternateLinks(currentPath: string) {
  const pathWithoutLang = currentPath.replace(/^\/(en|fr)/, '');
  return Object.keys(languages).map((lang) => ({
    lang,
    href: `/${lang}${pathWithoutLang}`,
  }));
}
