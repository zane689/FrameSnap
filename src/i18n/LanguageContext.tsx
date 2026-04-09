import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { translations } from './translations';
import type { Language } from './translations';
import { updateSEO } from '../utils/seo';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | object;
  availableLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages = [
  { code: 'zh-CN' as Language, name: '中文简体' },
  { code: 'zh-TW' as Language, name: '中文繁體' },
  { code: 'en' as Language, name: 'English' },
  { code: 'ja' as Language, name: '日本語' },
  { code: 'ko' as Language, name: '한국어' },
];

// Map of language codes to our supported languages
const languageCodeMap: Record<string, Language> = {
  'zh': 'zh-CN', 'zh-CN': 'zh-CN', 'zh-SG': 'zh-CN', 'zh-MY': 'zh-CN',
  'zh-TW': 'zh-TW', 'zh-HK': 'zh-TW', 'zh-MO': 'zh-TW',
  'ja': 'ja', 'ja-JP': 'ja',
  'ko': 'ko', 'ko-KR': 'ko', 'ko-KP': 'ko',
  'en': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-CA': 'en', 'en-AU': 'en',
  'en-NZ': 'en', 'en-IE': 'en', 'en-ZA': 'en', 'en-IN': 'en',
};

// Get initial language from localStorage or browser
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const saved = localStorage.getItem('vidtill-language') as Language;
    if (saved && translations[saved]) {
      return saved;
    }

    // Try to get language from browser
    const browserLang = navigator.language;

    // First check exact language code match
    if (languageCodeMap[browserLang]) {
      return languageCodeMap[browserLang];
    }

    // Check base language code (e.g., 'en-US' -> 'en')
    const baseLang = browserLang.split('-')[0];
    if (languageCodeMap[baseLang]) {
      return languageCodeMap[baseLang];
    }

    // Try to infer from timezone for Chinese variants
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes('Taipei') || timezone.includes('Hong_Kong') || timezone.includes('Macau')) {
        return 'zh-TW';
      }
      if (timezone.includes('Shanghai') || timezone.includes('Beijing') || timezone.includes('Singapore')) {
        return 'zh-CN';
      }
      if (timezone.includes('Tokyo')) {
        return 'ja';
      }
      if (timezone.includes('Seoul')) {
        return 'ko';
      }
    } catch {
      // Ignore timezone errors
    }

    // Default to English for all other languages
    return 'en';
  }
  return 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('vidtill-language', lang);
    document.documentElement.lang = lang;
    
    // Update SEO meta tags
    const seoConfig = translations[lang].seo;
    if (seoConfig) {
      updateSEO(lang, seoConfig);
    }
  }, []);

  // Update SEO on initial load
  useEffect(() => {
    const seoConfig = translations[currentLanguage].seo;
    if (seoConfig) {
      updateSEO(currentLanguage, seoConfig);
    }
  }, []);

  const t = useCallback(
    (key: string): string | object => {
      const keys = key.split('.');
      let value: unknown = translations[currentLanguage];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Fallback to zh-CN if key not found
          let fallback: unknown = translations['zh-CN'];
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = (fallback as Record<string, unknown>)[fk];
            } else {
              return key;
            }
          }
          return fallback as string;
        }
      }
      
      return value as string | object;
    },
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Language };
