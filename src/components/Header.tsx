import { Camera, Activity, Sparkles } from 'lucide-react';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  ffmpegLoaded: boolean;
}

export function Header({ ffmpegLoaded }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="w-full sticky top-0 z-50">
      <div className="w-full">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-amber-500/10 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Outer glow ring - amber */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30 rounded-xl blur-sm opacity-60 animate-glow-pulse" />
                <div className="relative p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/40 shadow-soft">
                  <Camera className="w-6 h-6 text-amber-400" />
                  {/* Subtle sparkle */}
                  <div className="absolute -top-1 -right-1 text-amber-300 animate-pulse">
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Vid</span>
                    <span className="text-zinc-500">till</span>
                  </h1>
                </div>
                <p className="text-xs text-zinc-500 font-medium tracking-wider">{t('app.status.ready') as string}</p>
              </div>
            </div>

            {/* Right Section: Language Switcher + Status */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Status Badge */}
              <div className={`
                relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500
                ${ffmpegLoaded 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 text-emerald-200' 
                  : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-200'
                }
              `}>
                <Activity className={`w-4 h-4 transition-all duration-300 ${
                  ffmpegLoaded ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                }`} />
                <span className="text-xs font-semibold">
                  {ffmpegLoaded ? (t('app.status.ready') as string) : (t('app.status.loading') as string)}
                </span>
                <div className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-300
                  ${ffmpegLoaded 
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' 
                    : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  }
                `} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
