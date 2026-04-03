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
  X
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleStart = () => {
    onStart();
    setMobileMenuOpen(false);
  };

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
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 bg-clip-text text-transparent">Frame</span>
                <span className="text-zinc-500">Snap</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-4 lg:gap-6">
              <button
                onClick={scrollToFeatures}
                className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
              >
                功能
              </button>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <button
                onClick={handleStart}
                className="px-4 lg:px-6 py-2 lg:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm lg:text-base font-bold rounded-lg lg:rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/30"
              >
                开始使用
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
                功能
              </button>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <button
                onClick={handleStart}
                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                开始使用
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
              <span className="text-xs sm:text-sm font-bold text-amber-200">免费使用，无需注册</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent drop-shadow-2xl">
                专业视频取帧
              </span>
              <br />
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-zinc-400 font-medium">
                一键提取，本地处理
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl lg:text-2xl text-zinc-300 max-w-2xl lg:max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0">
              FrameSnap 是一款专业的在线视频帧提取工具。支持批量提取视频帧、
              生成电影感长图，<span className="text-amber-400 font-semibold">所有处理均在浏览器本地完成</span>，保护您的隐私安全。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-12 sm:mb-20">
              <button
                onClick={handleStart}
                className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 shadow-2xl shadow-orange-500/40"
              >
                <Play className="w-5 sm:w-6 h-5 sm:h-6" />
                立即开始
                <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={scrollToFeatures}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-zinc-800/80 backdrop-blur-xl text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl border border-zinc-600 hover:bg-zinc-700/80 hover:border-amber-500/50 transition-all duration-300 shadow-xl"
              >
                了解更多
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl sm:max-w-3xl mx-auto">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-xl sm:rounded-2xl border border-emerald-400/40 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">100%</div>
                <div className="text-xs sm:text-base text-zinc-400 font-medium">本地处理</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 bg-gradient-to-br from-amber-500/30 to-orange-600/30 rounded-xl sm:rounded-2xl border border-amber-400/40 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">0</div>
                <div className="text-xs sm:text-base text-zinc-400 font-medium">文件上传</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 bg-gradient-to-br from-rose-500/30 to-pink-600/30 rounded-xl sm:rounded-2xl border border-rose-400/40 group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2">免费</div>
                <div className="text-xs sm:text-base text-zinc-400 font-medium">永久使用</div>
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
              <span className="text-xs sm:text-sm font-bold text-amber-300">核心功能</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              强大的视频处理能力
            </h2>
            <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto px-2 sm:px-0">
              专业的视频帧提取功能，满足您的各种需求
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature Cards */}
            {[
              { icon: Film, title: '批量帧提取', desc: '一键提取视频中的所有帧，支持自定义提取间隔，高效处理长视频。', color: 'amber' },
              { icon: Layers, title: '电影感长图', desc: '将视频帧拼接成电影感长图，支持自定义布局、间距和背景色。', color: 'orange' },
              { icon: Shield, title: '隐私保护', desc: '基于 FFmpeg WebAssembly 技术，所有处理在浏览器本地完成。', color: 'emerald' },
              { icon: Zap, title: '极速处理', desc: '利用 Web Worker 多线程技术，充分发挥设备性能。', color: 'yellow' },
              { icon: Download, title: '批量下载', desc: '支持单帧下载和批量打包下载，自动按时间戳命名。', color: 'rose' },
              { icon: CheckCircle2, title: '格式支持', desc: '支持 MP4、MOV、AVI、WebM 等主流视频格式。', color: 'cyan' },
            ].map((feature, index) => (
              <div key={index} className="group relative p-6 sm:p-8 bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-zinc-700 hover:border-amber-500/50 transition-all duration-500 hover:scale-[1.02] overflow-hidden shadow-2xl shadow-black/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-amber-500/30">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-white group-hover:text-amber-300 transition-colors">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">{feature.desc}</p>
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
              <span className="text-xs sm:text-sm font-bold text-orange-300">使用步骤</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              简单三步，轻松提取
            </h2>
            <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto px-2 sm:px-0">
              无需复杂设置，即刻开始使用
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12">
            {[
              { icon: Video, title: '上传视频', desc: '拖拽或点击选择视频文件，支持多种格式，文件不会上传到服务器', color: 'amber', num: 1 },
              { icon: Scissors, title: '提取帧', desc: '点击"提取全部帧"按钮，系统自动处理视频，实时显示进度', color: 'orange', num: 2 },
              { icon: Download, title: '下载使用', desc: '预览提取的帧，选择需要的图片下载，支持批量打包下载', color: 'rose', num: 3 },
            ].map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-xl sm:shadow-2xl shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <div className="absolute top-0 right-1/3 sm:-top-2 sm:right-1/4 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-lg shadow-lg">{step.num}</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-4 text-white">{step.title}</h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed px-2 sm:px-0">{step.desc}</p>
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
            <span className="text-xs sm:text-sm font-bold text-amber-300">立即开始</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-white via-amber-100 to-orange-100 bg-clip-text text-transparent">
            准备好开始了吗？
          </h2>
          <p className="text-base sm:text-xl text-zinc-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            立即体验 FrameSnap，免费提取您的视频帧。无需注册，打开即用。
          </p>
          <button
            onClick={handleStart}
            className="group w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold text-lg sm:text-xl rounded-xl sm:rounded-2xl hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 sm:gap-4 mx-auto shadow-2xl shadow-orange-500/40"
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7" />
            免费开始使用
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-6 sm:mt-8 text-sm sm:text-base text-zinc-500">
            支持 Chrome、Firefox、Safari、Edge 等现代浏览器
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
                <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Frame</span>
                <span className="text-zinc-500">Snap</span>
              </span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <a href="#" className="text-sm sm:text-base text-zinc-400 hover:text-amber-400 transition-colors">关于</a>
              <a href="#" className="text-sm sm:text-base text-zinc-400 hover:text-amber-400 transition-colors">隐私</a>
              <a href="#" className="text-sm sm:text-base text-zinc-400 hover:text-amber-400 transition-colors">反馈</a>
            </div>
            <p className="text-sm sm:text-base text-zinc-500 text-center">
              © 2024 FrameSnap. 基于 FFmpeg 构建，本地处理保护隐私。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
