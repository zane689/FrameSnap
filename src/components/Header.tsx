import { Camera, Activity, Sparkles } from 'lucide-react';

interface HeaderProps {
  ffmpegLoaded: boolean;
}

export function Header({ ffmpegLoaded }: HeaderProps) {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse-slow" />
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-xl" />
            {/* Icon container */}
            <div className="relative p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/50 backdrop-blur-sm group-hover:border-indigo-500/50 transition-all duration-300 group-hover:scale-105">
              <Camera className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                FrameSnap
              </h1>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500 font-medium tracking-wide">专业视频取帧工具</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Status glow */}
            <div className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
              ffmpegLoaded ? 'bg-emerald-500/30' : 'bg-amber-500/30'
            }`} />
            <div className={`
              relative flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm
              transition-all duration-300 hover:scale-105
              ${ffmpegLoaded 
                ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
              }
            `}>
              <Activity className={`w-4 h-4 transition-all duration-300 ${
                ffmpegLoaded ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
              }`} />
              <span className={`text-xs font-semibold transition-colors ${
                ffmpegLoaded ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {ffmpegLoaded ? '系统就绪' : '初始化中...'}
              </span>
              {/* Status dot */}
              <div className={`
                w-1.5 h-1.5 rounded-full transition-all duration-300
                ${ffmpegLoaded ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}
              `} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
