import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Play, Pause, Film, Loader2, Images, RefreshCw, RotateCcw, Zap, Clock, Monitor } from 'lucide-react';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoUrl: string | null;
  onVideoLoad: (file: File) => void;
  onExtractAll: () => void;
  onReupload: () => void;
  isExtracting: boolean;
  extractionProgress: number;
}

export function VideoPlayer({
  videoRef,
  videoUrl,
  onVideoLoad,
  onExtractAll,
  onReupload,
  isExtracting,
  extractionProgress
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [fileSize, setFileSize] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Format file size
      const size = file.size;
      if (size < 1024 * 1024) {
        setFileSize(`${(size / 1024).toFixed(1)} KB`);
      } else {
        setFileSize(`${(size / (1024 * 1024)).toFixed(1)} MB`);
      }
      onVideoLoad(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      const size = file.size;
      if (size < 1024 * 1024) {
        setFileSize(`${(size / 1024).toFixed(1)} KB`);
      } else {
        setFileSize(`${(size / (1024 * 1024)).toFixed(1)} MB`);
      }
      onVideoLoad(file);
    }
  }, [onVideoLoad]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setVideoSize({ width: video.videoWidth, height: video.videoHeight });
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef, videoUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoUrl || isExtracting) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoUrl, isPlaying, isExtracting]);

  if (!videoUrl) {
    return (
      <div className="w-full flex flex-col items-center">
        {/* Upload Zone */}
        <div
          ref={containerRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative group flex items-center justify-center rounded-3xl border-2 border-dashed
            transition-all duration-500 cursor-pointer mx-auto overflow-hidden
            ${isDragging
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/20'
              : 'border-slate-700/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 hover:border-indigo-500/50 hover:bg-indigo-500/5'
            }
          `}
          style={{ width: '100%', maxWidth: '720px', aspectRatio: '16/9' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Animated border glow */}
          <div className={`
            absolute inset-0 rounded-3xl transition-opacity duration-500
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
          `}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 blur-xl opacity-30" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="relative text-center p-8 z-10">
            {/* Upload Icon with animation */}
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-500 animate-pulse-slow" />
              <div className="relative p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50 backdrop-blur-sm group-hover:border-indigo-500/30 group-hover:scale-110 transition-all duration-500">
                <Upload className="w-12 h-12 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-200 mb-3 group-hover:text-white transition-colors">
              拖拽视频到此处
            </h3>
            <p className="text-slate-400 mb-6 text-base">或点击选择视频文件</p>
            
            {/* Supported formats */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50">
                <Film className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">MP4, MOV, AVI, WebM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-[720px] w-full">
          {[
            { icon: Zap, title: '快速提取', desc: 'Canvas 模式秒级响应' },
            { icon: Clock, title: '精准定位', desc: '毫秒级时间戳控制' },
            { icon: Monitor, title: '高清输出', desc: '保留原始视频画质' },
          ].map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-800/30 hover:border-slate-700/50 transition-all duration-300"
            >
              <div className="p-3 rounded-xl bg-indigo-500/10 mb-3 group-hover:bg-indigo-500/20 transition-colors">
                <feature.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300 mb-1">{feature.title}</h4>
              <p className="text-xs text-slate-500 text-center">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Video Container */}
      <div
        className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl shadow-black/50 mx-auto group"
        style={{ width: '100%', maxWidth: '720px', aspectRatio: '16/9' }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Extraction Progress Overlay */}
        {isExtracting && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center z-50">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse" />
              <Loader2 className="relative w-16 h-16 text-indigo-400 animate-spin mb-6" />
            </div>
            <p className="text-xl font-bold text-white mb-4">正在提取视频帧...</p>
            <div className="w-72 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
            <p className="text-lg font-semibold text-indigo-400 mt-3">{extractionProgress}%</p>
            <p className="text-sm text-slate-500 mt-2">请稍候，正在处理中</p>
          </div>
        )}

        {/* Video Info Overlay */}
        {videoSize.width > 0 && (
          <div className="absolute top-4 right-4 px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-300">
                {videoSize.width} × {videoSize.height}
              </p>
            </div>
            {fileSize && (
              <p className="text-xs text-slate-500 mt-1 text-right">{fileSize}</p>
            )}
          </div>
        )}

        {/* Reupload Button */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={onReupload}
            disabled={isExtracting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-950/80 backdrop-blur-md hover:bg-slate-900 rounded-xl border border-slate-700/50 transition-all duration-300 disabled:opacity-50 shadow-lg hover:scale-105"
            title="重新上传视频"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
            <span className="text-sm font-medium text-slate-300">更换视频</span>
          </button>
        </div>

        {/* Play/Pause Overlay (shown when paused) */}
        {!isPlaying && !isExtracting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-4 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-700/50 hover:scale-110 transition-transform cursor-pointer" onClick={togglePlay}>
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="w-full max-w-[720px] bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-5 shadow-xl">
        {/* Progress Bar */}
        <div className="mb-5">
          <div className="relative group">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.001}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = parseFloat(e.target.value);
                }
              }}
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(currentTime / (duration || 1)) * 100}%, #1e293b ${(currentTime / (duration || 1)) * 100}%, #1e293b 100%)`
              }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm font-mono">
            <span className="text-indigo-400 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-500">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Reset Button */}
          <button
            onClick={onReupload}
            disabled={isExtracting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
            title="重置"
          >
            <RotateCcw className="w-5 h-5 text-slate-300" />
            <span className="text-sm font-semibold text-slate-300">重置</span>
          </button>

          <div className="w-px h-10 bg-slate-700/50" />

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isExtracting}
            className="relative group flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 disabled:opacity-50 min-w-[140px] overflow-hidden"
            title="播放/暂停 (Space)"
          >
            {/* Button glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 text-white" />
                <span className="text-base font-bold text-white">暂停</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 text-white ml-0.5" />
                <span className="text-base font-bold text-white">播放</span>
              </>
            )}
          </button>

          <div className="w-px h-10 bg-slate-700/50" />

          {/* Extract All Frames Button */}
          <button
            onClick={onExtractAll}
            disabled={isExtracting}
            className="relative group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 overflow-hidden"
            title="一键提取全部帧"
          >
            {/* Button glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            <Images className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white">提取全部帧</span>
          </button>
        </div>
      </div>
    </div>
  );
}
