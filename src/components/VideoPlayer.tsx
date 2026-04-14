import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Play, Pause, Film, Loader2, Images, RefreshCw, Download, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ExportFrameDialog } from './ExportFrameDialog';

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
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [fileSize, setFileSize] = useState<string>('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
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

  const goToPreviousFrame = () => {
    if (videoRef.current) {
      const fps = 30;
      const frameDuration = 1 / fps;
      const newTime = Math.max(0, videoRef.current.currentTime - frameDuration);
      videoRef.current.currentTime = newTime;
    }
  };

  const goToNextFrame = () => {
    if (videoRef.current) {
      const fps = 30;
      const frameDuration = 1 / fps;
      const newTime = Math.min(duration, videoRef.current.currentTime + frameDuration);
      videoRef.current.currentTime = newTime;
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
      <div className="w-full flex flex-col items-center mt-6">
        <div
          ref={containerRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative group flex items-center justify-center rounded-3xl border-2 border-dashed
            transition-all duration-500 cursor-pointer mx-auto premium-card-elevated overflow-hidden
            ${isDragging
              ? 'border-zinc-400/50 scale-[1.02]'
              : 'border-zinc-700/50 hover:border-zinc-500/30 hover:scale-[1.01]'
            }
          `}
          style={{ width: '100%', maxWidth: '720px', aspectRatio: '16/9' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="relative text-center p-8 z-10">
            <div className="relative inline-flex mb-6">
              {/* Outer glow - warm amber */}
              <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative p-5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-amber-500/30 shadow-medium group-hover:scale-110 transition-transform duration-500">
                <Upload className="w-12 h-12 text-amber-300 group-hover:text-amber-200 transition-colors duration-300" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-zinc-100 mb-2">
              {t('videoPlayer.dragDrop') as string}
            </h3>
            <p className="text-zinc-400 mb-6 text-base">{t('videoPlayer.orClick') as string}</p>
            
            <div className="flex items-center justify-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-xl border border-amber-500/20 inline-flex">
              <Film className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-100/80 font-medium">{t('videoPlayer.formats') as string}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full mt-6">
      <div
        className="relative rounded-3xl overflow-hidden mx-auto group premium-card-elevated"
        style={{ width: '100%', maxWidth: '720px', aspectRatio: '16/9' }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {isExtracting && (
          <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50">
            {/* Decorative glow behind spinner - warm */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/8" />
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 rounded-full blur-xl animate-glow-pulse" />
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin relative" />
            </div>
            <p className="text-lg font-semibold text-amber-100 mb-3 mt-4">{t('videoPlayer.extracting') as string}</p>
            <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-0 bg-zinc-800" />
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 transition-all duration-300 relative"
                style={{ width: `${extractionProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-amber-300/70 mt-3 font-mono">{extractionProgress}%</p>
          </div>
        )}

        {videoSize.width > 0 && (
          <div className="absolute top-4 right-4 premium-card rounded-lg shadow-medium border-amber-500/20">
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-amber-100">
                  {videoSize.width} × {videoSize.height}
                </p>
              </div>
              {fileSize && (
                <p className="text-xs text-amber-300/60 mt-1 font-mono">{fileSize}</p>
              )}
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReupload();
            }}
            disabled={isExtracting}
            className="premium-card rounded-lg flex items-center gap-2 px-3 py-2 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-medium hover:shadow-strong border-amber-500/20"
            title={t('videoPlayer.reset') as string}
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-100/80 font-medium">{t('videoPlayer.reset') as string}</span>
          </button>
        </div>

        {!isPlaying && !isExtracting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 rounded-full blur-xl" />
              <div className="relative p-5 bg-zinc-900/90 rounded-full backdrop-blur-xl border border-amber-500/30 cursor-pointer shadow-strong hover:scale-110 transition-transform duration-300" onClick={togglePlay}>
                <Play className="w-10 h-10 text-amber-100 ml-1" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-[720px] premium-card rounded-2xl p-4 sm:p-6 shadow-medium">
        <div className="mb-4 sm:mb-6">
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
              className="w-full h-2 sm:h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer hover:h-2.5 sm:hover:h-2 transition-all"
              style={{
                background: `linear-gradient(to right, linear-gradient(90deg, #a1a1aa, #71717a) 0%, linear-gradient(90deg, #a1a1aa, #71717a) ${(currentTime / (duration || 1)) * 100}%, #27272A ${(currentTime / (duration || 1)) * 100}%, #27272A 100%)`
              }}
            />
          </div>
          <div className="flex justify-between mt-2 sm:mt-3 text-xs sm:text-sm font-mono">
            <span className="text-slate-300 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-500">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsExportDialogOpen(true)}
            disabled={isExtracting}
            className="flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-11 px-3 sm:px-5 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-amber-100/90 transition-all duration-300 disabled:opacity-50 cursor-pointer border border-amber-500/20 shadow-soft hover:shadow-medium"
            title={t('videoPlayer.exportCurrentFrame') as string}
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">{t('videoPlayer.exportCurrentFrame') as string}</span>
            <span className="text-xs font-semibold sm:hidden">{t('videoPlayer.export') as string}</span>
          </button>

          <button
            onClick={goToPreviousFrame}
            disabled={isExtracting}
            className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-amber-100/90 transition-all duration-300 disabled:opacity-50 cursor-pointer border border-amber-500/20 shadow-soft hover:shadow-medium"
            title={t('videoPlayer.previousFrame') as string}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isExtracting}
            className="relative flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-11 px-6 sm:px-10 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-white transition-all duration-200 disabled:opacity-50 min-w-[100px] sm:min-w-[130px] cursor-pointer shadow-lg shadow-amber-500/20"
            title={t('videoPlayer.spaceToPlay') as string}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-bold">{t('videoPlayer.pause') as string}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                <span className="text-xs sm:text-sm font-bold">{t('videoPlayer.play') as string}</span>
              </>
            )}
          </button>

          <button
            onClick={goToNextFrame}
            disabled={isExtracting}
            className="flex items-center justify-center h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-amber-100/90 transition-all duration-300 disabled:opacity-50 cursor-pointer border border-amber-500/20 shadow-soft hover:shadow-medium"
            title={t('videoPlayer.nextFrame') as string}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </button>

          <button
            onClick={onExtractAll}
            disabled={isExtracting}
            className="relative flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-11 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:via-orange-400 hover:to-amber-400 text-white transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02]"
            title={t('videoPlayer.extractAll') as string}
          >
            <Images className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-bold">{t('videoPlayer.extract') as string}</span>
          </button>
        </div>
      </div>

      <ExportFrameDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        videoRef={videoRef}
        currentTime={currentTime}
      />
    </div>
  );
}
