import { Camera, Activity } from 'lucide-react';

interface HeaderProps {
  ffmpegLoaded: boolean;
}

export function Header({ ffmpegLoaded }: HeaderProps) {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg blur opacity-50" />
            <div className="relative p-2 bg-slate-800 rounded-lg border border-slate-700">
              <Camera className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              FrameSnap
            </h1>
            <p className="text-xs text-slate-400">专业视频取帧工具</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
          <Activity className={`w-4 h-4 ${ffmpegLoaded ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
          <span className={`text-xs font-medium ${ffmpegLoaded ? 'text-emerald-400' : 'text-amber-400'}`}>
            {ffmpegLoaded ? 'FFmpeg 就绪' : '加载中...'}
          </span>
        </div>
      </div>
    </header>
  );
}
