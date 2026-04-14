import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { Gallery, type Frame } from './components/Gallery';
import { SelectionBar } from './components/SelectionBar';
import { EnvironmentCheck } from './components/EnvironmentCheck';
import { ExtractionWizard, type ExtractConfig } from './components/ExtractionWizard';
import { DownloadConfigDialog, type ImageFormat } from './components/DownloadConfigDialog';
import { LongImageConfigDialog, type LongImageConfig } from './components/LongImageConfigDialog';
import { generateCinematicLongImage } from './utils/longImageGenerator';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { LanguageProvider } from './i18n/LanguageContext';
import { yieldToMain } from './hooks/useINPOptimization';

// 懒加载非关键组件
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const BlogPage = lazy(() => import('./components/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogArticle = lazy(() => import('./components/BlogArticle').then(m => ({ default: m.BlogArticle })));

// 简单的加载占位符
const LazyLoadFallback = () => null;

type PageType = 'landing' | 'app' | 'blog' | 'article';

function AppContent() {
  // Enable smooth scroll
  useSmoothScroll();

  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [currentArticleSlug, setCurrentArticleSlug] = useState<string>('');
  const [showApp, setShowApp] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showLongImageDialog, setShowLongImageDialog] = useState(false);
  const [longImageFrames, setLongImageFrames] = useState<Frame[]>([]);

  // 视频信息
  const [videoInfo, setVideoInfo] = useState({
    duration: 0,
    fps: 30,
    totalFrames: 0,
    width: 0,
    height: 0
  });

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

  // 处理视频加载，获取视频信息
  const handleVideoLoad = useCallback((file: File) => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoFile(file);
    setFrames([]);
    setSelectedIds(new Set());

    // 创建临时视频元素获取信息
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      const duration = tempVideo.duration;
      // 估算 FPS（实际 FPS 需要更复杂的检测）
      const estimatedFps = 30;
      const totalFrames = Math.floor(duration * estimatedFps);
      
      setVideoInfo({
        duration,
        fps: estimatedFps,
        totalFrames,
        width: tempVideo.videoWidth,
        height: tempVideo.videoHeight
      });
    };
    tempVideo.src = url;
  }, [videoUrl]);

  // 增强的提取函数
  const handleExtract = useCallback(async (config: ExtractConfig) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !videoFile) return;

    setIsExtracting(true);
    setExtractionProgress(0);
    setShowWizard(false);
    
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const videoName = videoFile.name.replace(/\.[^/.]+$/, '');
    
    // Set canvas to video dimensions
    canvas.width = video.videoWidth || videoInfo.width;
    canvas.height = video.videoHeight || videoInfo.height;

    // Pause video during extraction
    video.pause();

    // 根据配置生成时间戳列表
    const timestamps: number[] = [];
    
    switch (config.mode) {
      case 'timeInterval': {
        // 按时间间隔提取
        const interval = config.timeIntervalSeconds;
        for (let t = 0; t < videoInfo.duration; t += interval) {
          timestamps.push(t * 1000);
        }
        break;
      }
      
      case 'frameInterval': {
        // 按帧间隔提取
        const frameInterval = config.frameInterval;
        const frameTime = 1000 / videoInfo.fps;
        for (let i = 0; i < videoInfo.totalFrames; i += frameInterval) {
          timestamps.push(i * frameTime);
        }
        break;
      }
      
      case 'fixedFps': {
        // 固定 FPS 提取
        const interval = 1000 / config.targetFps;
        for (let t = 0; t < videoInfo.duration * 1000; t += interval) {
          timestamps.push(t);
        }
        break;
      }
      
      case 'keyframe': {
        // 关键帧提取 - 模拟关键帧位置（实际实现需要 FFmpeg）
        // 关键帧通常每 2-10 秒一个，这里用 5 秒估算
        const keyframeInterval = 5000; // 5 秒
        for (let t = 0; t < videoInfo.duration * 1000; t += keyframeInterval) {
          timestamps.push(t);
        }
        break;
      }
      
      case 'timeRange': {
        // 指定时间段提取
        const { startTime, endTime, timeIntervalSeconds } = config;
        const interval = timeIntervalSeconds * 1000;
        for (let t = startTime; t <= endTime && t <= videoInfo.duration * 1000; t += interval) {
          timestamps.push(t);
        }
        break;
      }
      
      case 'precise': {
        // 精准跳帧
        if (config.preciseTimestamps.length > 0) {
          timestamps.push(...config.preciseTimestamps);
        } else if (config.preciseFrameNumbers.length > 0) {
          const frameTime = 1000 / videoInfo.fps;
          timestamps.push(...config.preciseFrameNumbers.map(f => f * frameTime));
        }
        timestamps.sort((a, b) => a - b);
        break;
      }
    }

    const extractedFrames: Frame[] = [];
    const total = timestamps.length;

    // 批量处理，每 5 帧让出主线程一次，优化 INP
    const batchSize = 5;
    for (let i = 0; i < timestamps.length; i += batchSize) {
      if (signal.aborted) break;

      const batchEnd = Math.min(i + batchSize, timestamps.length);
      
      for (let j = i; j < batchEnd; j++) {
        const timeMs = timestamps[j];
        const timeSec = timeMs / 1000;
        video.currentTime = timeSec;

        await new Promise<void>((resolve, reject) => {
          if (signal.aborted) { reject(new Error('Extraction aborted')); return; }
          const onSeeked = () => { video.removeEventListener('seeked', onSeeked); resolve(); };
          video.addEventListener('seeked', onSeeked);
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        extractedFrames.push({
          id: `${Date.now()}_${j}_${Math.random().toString(36).substr(2, 9)}`,
          dataUrl,
          timestamp: timeMs,
          videoName,
        });
      }

      const progress = Math.round((batchEnd / total) * 100);
      setExtractionProgress(progress);

      if (batchEnd < timestamps.length) await yieldToMain();
    }

    if (!signal.aborted) setFrames(extractedFrames);
    
    setIsExtracting(false);
    setExtractionProgress(0);
    video.currentTime = 0;
  }, [videoFile, videoInfo]);

  const handleReupload = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoFile(null);
    setFrames([]);
    setSelectedIds(new Set());
    setVideoInfo({ duration: 0, fps: 30, totalFrames: 0, width: 0, height: 0 });
  }, [videoUrl]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => setSelectedIds(new Set(frames.map(f => f.id))), [frames]);
  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const handleRemoveFrame = useCallback((id: string) => {
    setFrames(prev => prev.filter(f => f.id !== id));
    setSelectedIds(prev => { const newSet = new Set(prev); newSet.delete(id); return newSet; });
  }, []);
  const handleClearAll = useCallback(() => { setFrames([]); setSelectedIds(new Set()); }, []);
  const handleUpdateFrames = useCallback((newFrames: Frame[]) => {
    setFrames(newFrames);
    setSelectedIds(prev => { const newSet = new Set(prev); const existingIds = new Set(newFrames.map(f => f.id)); for (const id of prev) if (!existingIds.has(id)) newSet.delete(id); return newSet; });
  }, []);

  // 处理选择栏下载按钮点击
  const handleSelectionBarDownload = useCallback(() => {
    setShowDownloadDialog(true);
  }, []);

  // 处理长图生成按钮点击
  const handleLongImageClick = useCallback(() => {
    const selectedFrames = frames.filter(f => selectedIds.has(f.id));
    if (selectedFrames.length < 3 || selectedFrames.length > 9) return;
    setLongImageFrames(selectedFrames);
    setShowLongImageDialog(true);
  }, [frames, selectedIds]);

  // 处理长图生成
  const handleGenerateLongImage = useCallback(async (config: LongImageConfig) => {
    if (longImageFrames.length === 0) return;

    try {
      const result = await generateCinematicLongImage(
        longImageFrames,
        videoFile?.name || 'video',
        config
      );

      // 下载生成的图片
      result.images.forEach((image) => {
        const link = document.createElement('a');
        link.href = image.dataUrl;
        link.download = image.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // 显示成功提示
      if (result.images.length > 1) {
        alert(`Generated ${result.images.length} image parts, total size: ${result.totalSize.toFixed(2)}MB`);
      }
    } catch (error) {
      console.error('Failed to generate long image:', error);
      alert('Failed to generate long image, please try again');
    }
  }, [longImageFrames, videoFile]);

  // 处理选择项下载
  const handleDownloadSelectedWithConfig = useCallback(async (fileName: string, format: ImageFormat, quality: number) => {
    const selectedFrames = frames.filter(f => selectedIds.has(f.id));
    if (selectedFrames.length === 0) return;

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder('selected_frames');

      for (let i = 0; i < selectedFrames.length; i++) {
        const frame = selectedFrames[i];
        const img = new window.Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.src = frame.dataUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
          const dataUrl = canvas.toDataURL(mimeType, quality);
          const base64Data = dataUrl.split(',')[1];
          const finalFileName = `${String(i + 1).padStart(3, '0')}_${fileName}.${format}`;
          folder?.file(finalFileName, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${fileName}_${selectedFrames.length}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to create zip:', error);
    }
  }, [frames, selectedIds]);

  useEffect(() => {
    return () => { if (videoUrl) URL.revokeObjectURL(videoUrl); abortControllerRef.current?.abort(); };
  }, [videoUrl]);

  // Handle navigation between pages
  const handleNavigate = useCallback((page: string, articleSlug?: string) => {
    setCurrentPage(page as PageType);
    if (articleSlug) {
      setCurrentArticleSlug(articleSlug);
    }
    window.scrollTo(0, 0);
  }, []);

  // Handle start from landing page
  const handleStart = useCallback(() => {
    setShowApp(true);
    setCurrentPage('app');
  }, []);

  // Render different pages based on currentPage state
  if (currentPage === 'blog') {
    return (
      <Suspense fallback={<LazyLoadFallback />}>
        <BlogPage onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (currentPage === 'article') {
    return (
      <Suspense fallback={<LazyLoadFallback />}>
        <BlogArticle slug={currentArticleSlug} onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  if (!showApp) {
    return (
      <Suspense fallback={<LazyLoadFallback />}>
        <LandingPage onStart={handleStart} onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <EnvironmentCheck />
      <Suspense fallback={null}><PWAInstallPrompt /></Suspense>
      <Header ffmpegLoaded={ffmpegLoaded} onNavigate={handleNavigate} currentPage={currentPage} />

      <div className="max-w-[1200px] mx-auto w-full px-4 pt-6">
        <VideoPlayer
          videoRef={videoRef}
          videoUrl={videoUrl}
          onVideoLoad={handleVideoLoad}
          onExtractAll={() => setShowWizard(true)}
          onReupload={handleReupload}
          isExtracting={isExtracting}
          extractionProgress={extractionProgress}
        />

        <Gallery frames={frames} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} onSelectAll={handleSelectAll} onClearSelection={handleClearSelection} onRemoveFrame={handleRemoveFrame} onClearAll={handleClearAll} onDownloadSelected={() => {}} />
      </div>

      <SelectionBar frames={frames} selectedIds={selectedIds} onClearSelection={handleClearSelection} onUpdateFrames={handleUpdateFrames} onDownloadSelected={handleSelectionBarDownload} onLongImageClick={handleLongImageClick} />

      {showWizard && (
        <ExtractionWizard
          videoDuration={videoInfo.duration}
          videoFps={videoInfo.fps}
          totalFrames={videoInfo.totalFrames}
          onExtract={handleExtract}
          isExtracting={isExtracting}
          extractionProgress={extractionProgress}
          onClose={() => setShowWizard(false)}
        />
      )}

      <DownloadConfigDialog
        isOpen={showDownloadDialog}
        onClose={() => setShowDownloadDialog(false)}
        onDownload={handleDownloadSelectedWithConfig}
        defaultFileName={`selected_frames_${selectedIds.size}`}
        isBatch={true}
        frameCount={selectedIds.size}
      />

      <LongImageConfigDialog
        isOpen={showLongImageDialog}
        onClose={() => setShowLongImageDialog(false)}
        onGenerate={handleGenerateLongImage}
        frames={longImageFrames}
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