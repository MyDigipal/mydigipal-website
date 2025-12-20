import { languages, defaultLang, type Language } from './config';
import en from './en.json';
import fr from './fr.json';

const translations = { en, fr } as const;

type TranslationKey = string;

export function t(lang: Language, key: TranslationKey): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to default language
      value = translations[defaultLang];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = (value as Record<string, unknown>)[fallbackKey];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function useTranslations(lang: Language) {
  return (key: TranslationKey) => t(lang, key);
}

export function getStaticPathsForLanguages() {
  return Object.keys(languages).map((lang) => ({
    params: { lang },
  }));
}
