import { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  Film, 
  Shield, 
  Zap, 
  Download, 
  ChevronDown,
  Play,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  Heart,
  Users,
  Video,
  Scissors,
  Layers,
  Github,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { useLanguage, type Language } from '../i18n/LanguageContext';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { t, currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleStart = () => {
    onStart();
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const currentLang = availableLanguages.find(l => l.code === currentLanguage);

  // Feature items with translation keys and full Tailwind classes
  const featureItems = [
    { icon: Film, key: 'batchExtract', bgClass: 'bg-gradient-to-br from-amber-500 to-amber-600', shadowClass: 'shadow-amber-500/30' },
    { icon: Layers, key: 'movieStrip', bgClass: 'bg-gradient-to-br from-orange-500 to-orange-600', shadowClass: 'shadow-orange-500/30' },
    { icon: Shield, key: 'privacy', bgClass: 'bg-gradient-to-br from-emerald-500 to-emerald-600', shadowClass: 'shadow-emerald-500/30' },
    { icon: Zap, key: 'speed', bgClass: 'bg-gradient-to-br from-yellow-500 to-yellow-600', shadowClass: 'shadow-yellow-500/30' },
    { icon: Download, key: 'download', bgClass: 'bg-gradient-to-br from-rose-500 to-rose-600', shadowClass: 'shadow-rose-500/30' },
    { icon: CheckCircle2, key: 'format', bgClass: 'bg-gradient-to-br from-cyan-500 to-cyan-600', shadowClass: 'shadow-cyan-500/30' },
  ];

  // Step items with translation keys and full Tailwind classes
  const stepItems = [
    { icon: Video, key: 'upload', bgClass: 'bg-gradient-to-br from-amber-500 to-orange-600', shadowClass: 'shadow-amber-500/30', num: 1 },
    { icon: Scissors, key: 'extract', bgClass: 'bg-gradient-to-br from-orange-500 to-orange-600', shadowClass: 'shadow-orange-500/30', num: 2 },
    { icon: Download, key: 'download', bgClass: 'bg-gradient-to-br from-rose-500 to-rose-600', shadowClass: 'shadow-rose-500/30', num: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background - Desktop only */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        <div 
          className="absolute w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] rounded-full opacity-30 blur-[120px] lg:blur-[150px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)',
            left: `${mousePos.x * 0.05 - 100}px`,
            top: `${mousePos.y * 0.05 - 100}px`,
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full opacity-25 blur-[100px] lg:blur-[120px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)',
            right: `${-mousePos.x * 0.03 + 50}px`,
            bottom: `${-mousePos.y * 0.03 + 50}px`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative p-2 sm:p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg sm:rounded-xl border border-amber-400/40 group-hover:border-amber-300/60 transition-all duration-300 shadow-lg shadow-amber-500/20">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 bg-clip-text text-transparent">Vid</span>
                <span className="text-zinc-500">till</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-4 lg:gap-6">
              <button
                onClick={scrollToFeatures}
                className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
              >
                {t('nav.features') as string}
              </button>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                {t('nav.github') as string}
              </a>
              
              {/* Language Switcher */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-amber-500/30 transition-all duration-200 text-zinc-300 hover:text-amber-400"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{currentLang?.name}</span>
                </button>
                
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-zinc-900/95 backdrop-blur-xl rounded-xl border border-zinc-700/50 shadow-2xl overflow-hidden z-50 animate-fly-in">
                    <div className="py-1">
                      {availableLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code as Language)}
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
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleStart}
                className="px-4 lg:px-6 py-2 lg:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm lg:text-base font-bold rounded-lg lg:rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/30"
              >
                {t('nav.start') as string}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-zinc-800">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={scrollToFeatures}
                className="block w-full text-left px-4 py-3 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                {t('nav.features') as string}
              </button>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                {t('nav.github') as string}
              </a>
              
              {/* Mobile Language Options */}
              <div className="px-4 py-2">
                <p className="text-xs text-zinc-500 mb-2">{t('language') as string}</p>
                <div className="grid grid-cols-2 gap-2">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as Language)}
                      className={`
                        px-3 py-2 text-sm rounded-lg transition-all duration-200 text-left
                        ${currentLanguage === lang.code 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-amber-400'
                        }
                      `}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                {t('nav.start') as string}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[100svh] flex items-center justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden"
      >
        {/* Floating decorative elements - Hidden on small mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <div className="absolute top-[20%] left-[5%] w-16 lg:w-24 h-16 lg:h-24 border-2 border-amber-500/30 rounded-2xl lg:rounded-3xl rotate-12 animate-pulse" />
          <div className="absolute top-[15%] right-[10%] w-14 lg:w-20 h-14 lg:h-20 border-2 border-orange-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-[60%] left-[8%] w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl lg:rounded-2xl rotate-45" />
          <div className="absolute top-[70%] right-[5%] w-20 lg:w-28 h-20 lg:h-28 border-2 border-rose-500/20 rounded-2xl lg:rounded-3xl -rotate-12" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-full border border-amber-400/40 mb-6 sm:mb-8 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-amber-200">{t('hero.badge') as string}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent drop-shadow-2xl">
                {t('hero.title') as string}
              </span>
              <br />
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-zinc-400 font-medium">
                {t('hero.subtitle') as string}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl lg:text-2xl text-zinc-300 max-w-2xl lg:max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0">
              {t('hero.description') as string}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-12 sm:mb-20">
              <button
                onClick={handleStart}
                className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 shadow-2xl shadow-orange-500/40"
              >
                <Play className="w-5 sm:w-6 h-5 sm:h-6" />
                {t('hero.cta.start') as string}
                <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={scrollToFeatures}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-zinc-800/80 backdrop-blur-xl text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl border border-zinc-600 hover:bg-zinc-700/80 hover:border-amber-500/50 transition-all duration-300 shadow-xl"
              >
                {t('hero.cta.learnMore') as string}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl sm:max-w-3xl mx-auto">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-xl sm:rounded-2xl border border-emerald-400/40 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">100%</div>
                <div className="text-xs sm:text-base text-zinc-400 font-medium">{t('hero.stats.local') as string}</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-xl sm:rounded-2xl border border-amber-400/40 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">0</div>
                <div className="text-xs sm:text-base text-zinc-400 font-medium">{t('hero.stats.upload') as string}</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 bg-gradient-to-br from-rose-500/30 to-pink-600/30 rounded-xl sm:rounded-2xl border border-rose-400/40 group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">{t('hero.stats.free') as string}</div>
                <div className="text-xs sm:text-base text-zinc-400 font-medium">{t('hero.stats.free') as string}</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToFeatures}
            className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 hover:text-amber-400 transition-colors animate-bounce"
          >
            <ChevronDown className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/30 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-500/20 rounded-full border border-amber-400/40 mb-6 sm:mb-8 shadow-lg shadow-amber-500/10">
              <Star className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-amber-300">{t('features.title') as string}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              {t('features.subtitle') as string}
            </h2>
            <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto px-2 sm:px-0">
              {t('features.description') as string}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {featureItems.map((feature, index) => (
              <div key={index} className="group relative p-6 sm:p-8 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-zinc-700 hover:border-amber-500/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden shadow-2xl shadow-black/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.bgClass} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl ${feature.shadowClass}`}>
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white group-hover:text-amber-300 transition-colors">
                    {(t(`features.items.${feature.key}.title`) as string)}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    {(t(`features.items.${feature.key}.desc`) as string)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-orange-500/20 rounded-full border border-orange-400/40 mb-6 sm:mb-8 shadow-lg shadow-orange-500/10">
              <Users className="w-4 sm:w-5 h-4 sm:h-5 text-orange-400" />
              <span className="text-xs sm:text-sm font-bold text-orange-300">{t('steps.title') as string}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              {t('steps.subtitle') as string}
            </h2>
            <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto px-2 sm:px-0">
              {t('steps.description') as string}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12">
            {stepItems.map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${step.bgClass} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-xl sm:shadow-2xl ${step.shadowClass} group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <div className="absolute top-0 right-1/3 sm:-top-2 sm:right-1/4 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-lg shadow-lg">{step.num}</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-4 text-white">{(t(`steps.items.${step.key}.title`) as string)}</h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed px-2 sm:px-0">{(t(`steps.items.${step.key}.desc`) as string)}</p>
                {index < 2 && (
                  <div className="hidden sm:block absolute top-10 lg:top-12 left-[60%] lg:left-[65%] w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/30 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-400/40 mb-8 sm:mb-10 shadow-lg shadow-amber-500/10">
            <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-rose-400" />
            <span className="text-xs sm:text-sm font-bold text-amber-300">{t('cta.badge') as string}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
            {t('cta.title') as string}
          </h2>
          <p className="text-base sm:text-xl text-zinc-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            {t('cta.description') as string}
          </p>
          <button
            onClick={handleStart}
            className="group w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-lg sm:text-xl rounded-xl sm:rounded-2xl hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 sm:gap-4 mx-auto shadow-2xl shadow-orange-500/40"
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7" />
            {t('cta.button') as string}
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-6 sm:mt-8 text-sm sm:text-base text-zinc-500">
            {t('cta.browser') as string}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 lg:py-16 border-t border-zinc-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/40 shadow-lg shadow-amber-500/10">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <span className="text-xl sm:text-2xl font-bold">
                <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Vid</span>
                <span className="text-zinc-500">till</span>
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <a href="#" className="text-sm sm:text-base text-zinc-400 hover:text-amber-400 transition-colors">{t('footer.about') as string}</a>
              <a href="#" className="text-sm sm:text-base text-zinc-400 hover:text-amber-400 transition-colors">{t('footer.privacy') as string}</a>
              <a href="#" className="text-sm sm:text-base text-zinc-400 hover:text-amber-400 transition-colors">{t('footer.feedback') as string}</a>
            </div>
            <p className="text-sm sm:text-base text-zinc-500 text-center">
              © 2024 Vidtill. {t('footer.copyright') as string}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
