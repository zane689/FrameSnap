import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, type Language } from './LanguageContext';

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = availableLanguages.find(l => l.code === currentLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-amber-500/30 transition-all duration-200 text-zinc-300 hover:text-amber-400"
        aria-label="切换语言"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">{currentLang?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-zinc-700/50 shadow-2xl overflow-hidden z-50 animate-fly-in">
          <div className="py-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-200
                  ${currentLanguage === lang.code 
                    ? 'bg-amber-500/10 text-amber-400' 
                    : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-amber-400'
                  }
                `}
              >
                <span>{lang.name}</span>
                {currentLanguage === lang.code && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
