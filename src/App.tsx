import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { Gallery, type Frame } from './components/Gallery';
import { SelectionBar } from './components/SelectionBar';
import { EnvironmentCheck } from './components/EnvironmentCheck';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { LanguageProvider } from './i18n/LanguageContext';
import { yieldToMain } from './hooks/useINPOptimization';

// 懒加载非关键组件
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));

// 简单的加载占位符
const LazyLoadFallback = () => null;

function AppContent() {
  // Enable smooth scroll
  useSmoothScroll();

  const [showApp, setShowApp] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize FFmpeg (可选，失败时会使用 Canvas 模式)
  useEffect(() => {
    const loadFFmpeg = async () => {
      // 检查是否支持 SharedArrayBuffer
      const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
      
      if (!hasSharedArrayBuffer) {
        console.log('SharedArrayBuffer not available, skipping FFmpeg initialization');
        setFfmpegLoaded(true);
        return;
      }

      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpegLoaded(true);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        setFfmpegLoaded(true);
      }
    };

    // 延迟加载 FFmpeg，优先保证页面交互
    const timer = setTimeout(() => {
      loadFFmpeg();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Extract all frames from video - 使用批量处理优化 INP
  const extractAllFrames = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !videoFile) return;

    setIsExtracting(true);
    setExtractionProgress(0);
    
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const videoName = videoFile.name.replace(/\.[^/.]+$/, '');
    const duration = video.duration;
    const fps = 1; // Extract 1 frame per second
    const totalFrames = Math.floor(duration * fps);
    const extractedFrames: Frame[] = [];

    // Set canvas to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Pause video during extraction
    video.pause();

    // 批量处理，每 5 帧让出主线程一次，优化 INP
    const batchSize = 5;
    for (let i = 0; i <= totalFrames; i += batchSize) {
      if (signal.aborted) {
        break;
      }

      const batchEnd = Math.min(i + batchSize, totalFrames + 1);
      
      for (let j = i; j < batchEnd; j++) {
        const time = j / fps;
        video.currentTime = time;

        // Wait for seek to complete
        await new Promise<void>((resolve, reject) => {
          if (signal.aborted) {
            reject(new Error('Extraction aborted'));
            return;
          }
          
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        });

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        // Create frame object
        const frame: Frame = {
          id: `${Date.now()}_${j}_${Math.random().toString(36).substr(2, 9)}`,
          dataUrl,
          timestamp: time * 1000,
          videoName,
        };

        extractedFrames.push(frame);
      }

      // 更新进度
      const progress = Math.round((batchEnd / (totalFrames + 1)) * 100);
      setExtractionProgress(progress);

      // 每批处理后让出主线程，允许用户交互
      if (batchEnd <= totalFrames) {
        await yieldToMain();
      }
    }

    if (!signal.aborted) {
      setFrames(extractedFrames);
    }
    
    setIsExtracting(false);
    setExtractionProgress(0);

    // Reset video to start
    video.currentTime = 0;
  }, [videoFile]);

  const handleVideoLoad = useCallback((file: File) => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
    setFrames([]);
    setSelectedIds(new Set());
  }, [videoUrl]);

  const handleReupload = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setVideoFile(null);
    setFrames([]);
    setSelectedIds(new Set());
  }, [videoUrl]);

  // Selection handlers - 使用节流优化频繁更新
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(frames.map(f => f.id)));
  }, [frames]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleRemoveFrame = useCallback((id: string) => {
    setFrames(prev => prev.filter(f => f.id !== id));
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setFrames([]);
    setSelectedIds(new Set());
  }, []);

  const handleUpdateFrames = useCallback((newFrames: Frame[]) => {
    setFrames(newFrames);
    // Remove selected IDs that no longer exist
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      const existingIds = new Set(newFrames.map(f => f.id));
      for (const id of prev) {
        if (!existingIds.has(id)) {
          newSet.delete(id);
        }
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      abortControllerRef.current?.abort();
    };
  }, [videoUrl]);

  // Show landing page first
  if (!showApp) {
    return (
      <Suspense fallback={<LazyLoadFallback />}>
        <LandingPage onStart={() => setShowApp(true)} />
      </Suspense>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* 环境检查遮罩层 */}
      <EnvironmentCheck />

      {/* PWA 安装提示 - 懒加载 */}
      <Suspense fallback={null}>
        <PWAInstallPrompt />
      </Suspense>

      <Header ffmpegLoaded={ffmpegLoaded} />

      <div className="max-w-[1200px] mx-auto w-full px-4 pt-6">
        <VideoPlayer
          videoRef={videoRef}
          videoUrl={videoUrl}
          onVideoLoad={handleVideoLoad}
          onExtractAll={extractAllFrames}
          onReupload={handleReupload}
          isExtracting={isExtracting}
          extractionProgress={extractionProgress}
        />

        <Gallery
          frames={frames}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onRemoveFrame={handleRemoveFrame}
          onClearAll={handleClearAll}
          onDownloadSelected={() => {}}
        />
      </div>

      <SelectionBar
        frames={frames}
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        onUpdateFrames={handleUpdateFrames}
        videoFileName={videoFile?.name || 'video'}
      />

      <canvas ref={canvasRef} className="canvas-hidden" />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
