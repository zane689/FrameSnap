import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Play, Pause, Film, Loader2, Images, RefreshCw, RotateCcw } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoLoad(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
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
      <div
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex items-center justify-center rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer mx-auto
          ${isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
            : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
          }
        `}
        style={{ width: '100%', maxWidth: '640px', aspectRatio: '16/9' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-center p-8">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse-slow" />
            <div className="relative p-6 bg-slate-800 rounded-full border border-slate-700">
              <Upload className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            拖拽视频到此处
          </h3>
          <p className="text-slate-400 mb-4">或点击选择视频文件</p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Film className="w-4 h-4" />
            <span>支持 MP4, MOV, AVI, WebM 等格式</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Video Container - 16:9 aspect ratio */}
      <div
        className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 mx-auto"
        style={{ width: '100%', maxWidth: '640px', aspectRatio: '16/9' }}
      >
        {/* Video with object-fit to handle different aspect ratios */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />

        {/* Extraction Progress Overlay */}
        {isExtracting && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-40">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
            <p className="text-lg font-semibold text-white mb-2">正在提取视频帧...</p>
            <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-2">{extractionProgress}%</p>
          </div>
        )}

        {/* Video Info Overlay */}
        {videoSize.width > 0 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">
              原始尺寸: {videoSize.width} × {videoSize.height}
            </p>
          </div>
        )}

        {/* Reupload Button - Top Left */}
        <div className="absolute top-4 left-4">
          <button
            onClick={onReupload}
            disabled={isExtracting}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            title="重新上传视频"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
            <span className="text-xs text-slate-300">重新上传</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="w-full max-w-[640px] bg-slate-900/95 backdrop-blur rounded-xl border border-slate-800 p-4">
        {/* Progress Bar */}
        <div className="mb-4">
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
            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
          />
          <div className="flex justify-between mt-2 text-xs text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Reset Button */}
          <button
            onClick={onReupload}
            disabled={isExtracting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
            title="重置"
          >
            <RotateCcw className="w-5 h-5 text-slate-300" />
            <span className="text-sm font-medium text-slate-300">重置</span>
          </button>

          <div className="w-px h-8 bg-slate-700 mx-2" />

          {/* Play/Pause Button - Wider */}
          <button
            onClick={togglePlay}
            disabled={isExtracting}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 min-w-[120px]"
            title="播放/暂停 (Space)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 text-white" />
                <span className="text-sm font-semibold text-white">暂停</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 text-white ml-0.5" />
                <span className="text-sm font-semibold text-white">播放</span>
              </>
            )}
          </button>

          <div className="w-px h-8 bg-slate-700 mx-2" />

          {/* Extract All Frames Button */}
          <button
            onClick={onExtractAll}
            disabled={isExtracting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
            title="一键提取全部帧"
          >
            <Images className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">提取全部帧</span>
          </button>
        </div>


      </div>
    </div>
  );
}
