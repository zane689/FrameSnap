import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations } from './translations';
import type { Language } from './translations';

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

// Get initial language from localStorage or browser
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('vidtill-language') as Language;
    if (saved && translations[saved]) {
      return saved;
    }
    
    // Detect browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
      if (browserLang.includes('TW') || browserLang.includes('HK')) {
        return 'zh-TW';
      }
      return 'zh-CN';
    }
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('en')) return 'en';
  }
  return 'zh-CN';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('vidtill-language', lang);
    document.documentElement.lang = lang;
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
