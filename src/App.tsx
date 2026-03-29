import { useState, useRef, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { Gallery, type Frame } from './components/Gallery';
import { SelectionBar } from './components/SelectionBar';
import { EnvironmentCheck } from './components/EnvironmentCheck';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

function App() {
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

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
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

    loadFFmpeg();
  }, []);

  // Extract all frames from video
  const extractAllFrames = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !videoFile) return;

    setIsExtracting(true);
    setExtractionProgress(0);

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

    for (let i = 0; i <= totalFrames; i++) {
      const time = i / fps;
      video.currentTime = time;

      // Wait for seek to complete
      await new Promise<void>((resolve) => {
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
        id: `${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        dataUrl,
        timestamp: time * 1000,
        videoName,
      };

      extractedFrames.push(frame);
      setExtractionProgress(Math.round((i / totalFrames) * 100));
    }

    setFrames(extractedFrames);
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

  // Selection handlers
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
    };
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden flex flex-col">
      {/* 环境检查遮罩层 */}
      <EnvironmentCheck />

      {/* PWA 安装提示 */}
      <PWAInstallPrompt />

      <Header ffmpegLoaded={ffmpegLoaded} />

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-6 pb-24">
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

export default App;
