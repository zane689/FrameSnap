import { Camera, Activity, Sparkles, FileText } from 'lucide-react';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  ffmpegLoaded: boolean;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export function Header({ ffmpegLoaded, onNavigate, currentPage = 'app' }: HeaderProps) {
  const { t } = useLanguage();

  const handleBlogClick = () => {
    if (onNavigate) {
      onNavigate('blog');
    }
  };

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('app');
    }
  };

  return (
    <header className="w-full sticky top-0 z-50">
      <div className="w-full">
        <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-amber-500/10 px-3 sm:px-6 py-3 sm:py-4">
          <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
            {/* Logo Section */}
            <div 
              className="flex items-center gap-2 sm:gap-4 cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="relative">
                {/* Outer glow ring - amber */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30 rounded-xl blur-sm opacity-60 animate-glow-pulse" />
                <div className="relative p-2 sm:p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/40 shadow-soft">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  {/* Subtle sparkle */}
                  <div className="absolute -top-1 -right-1 text-amber-300 animate-pulse">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Vid</span>
                    <span className="text-zinc-500">till</span>
                  </h1>
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-wider hidden sm:block">{t('app.status.ready') as string}</p>
              </div>
            </div>

            {/* Right Section: Blog + Language Switcher + Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Blog Link */}
              <button
                onClick={handleBlogClick}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'blog'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Blog</span>
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Status Badge */}
              <div className={`
                relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-500
                ${ffmpegLoaded
                  ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-200'
                }
              `}>
                <Activity className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
                  ffmpegLoaded ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                }`} />
                <span className="text-[10px] sm:text-xs font-semibold hidden sm:inline">
                  {ffmpegLoaded ? (t('app.status.ready') as string) : (t('app.status.loading') as string)}
                </span>
                <div className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-300 flex-shrink-0
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
