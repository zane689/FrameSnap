import { useCallback, useEffect, useRef, useState } from 'react';
import type { FrameResult } from '../workers/ffmpeg.worker';
import type { ExtractMode, ExtractOptions, ExtractProgress } from '../utils/frameExtractor';
import { FFmpegWorkerManager, CanvasFrameExtractor } from '../utils/frameExtractor';

interface UseFFmpegWorkerOptions {
  onProgress?: (progress: ExtractProgress) => void;
  onComplete?: (frames: FrameResult[]) => void;
  onError?: (error: Error) => void;
}

interface UseFFmpegWorkerReturn {
  isInitializing: boolean;
  isExtracting: boolean;
  progress: ExtractProgress | null;
  frames: FrameResult[];
  extractFrames: (options: ExtractOptions) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useFFmpegWorker(options: UseFFmpegWorkerOptions = {}): UseFFmpegWorkerReturn {
  const { onProgress, onComplete, onError } = options;
  
  const workerRef = useRef<FFmpegWorkerManager | null>(null);
  const canvasExtractorRef = useRef<CanvasFrameExtractor | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<ExtractProgress | null>(null);
  const [frames, setFrames] = useState<FrameResult[]>([]);

  // 初始化 Worker
  useEffect(() => {
    const initWorker = async () => {
      setIsInitializing(true);
      try {
        workerRef.current = new FFmpegWorkerManager();
        await workerRef.current.initialize();
      } catch (error) {
        console.warn('FFmpeg Worker 初始化失败，将使用 Canvas 模式:', error);
        // Worker 初始化失败时，使用 Canvas 模式
        canvasExtractorRef.current = new CanvasFrameExtractor();
      } finally {
        setIsInitializing(false);
      }
    };

    initWorker();

    return () => {
      workerRef.current?.terminate();
      canvasExtractorRef.current?.cleanup();
    };
  }, []);

  // 使用 Canvas 抽帧（轻量级，适合小文件）
  const extractWithCanvas = useCallback(async (options: ExtractOptions): Promise<FrameResult[]> => {
    const extractor = canvasExtractorRef.current || new CanvasFrameExtractor();
    canvasExtractorRef.current = extractor;

    try {
      await extractor.loadVideo(options.videoFile);
      const duration = extractor.getDuration();
      const results: FrameResult[] = [];

      let timestamps: number[] = [];

      switch (options.mode) {
        case 'fixed':
          const fps = options.fps || 1;
          const totalFrames = Math.floor(duration * fps);
          timestamps = Array.from({ length: totalFrames }, (_, i) => (i / fps) * 1000);
          break;

        case 'average':
          const count = options.totalFrames || 10;
          const interval = (duration * 1000) / (count + 1);
          timestamps = Array.from({ length: count }, (_, i) => (i + 1) * interval);
          break;

        case 'scene':
          // Canvas 模式不支持场景检测，回退到 average 模式
          const fallbackCount = options.totalFrames || 10;
          const fallbackInterval = (duration * 1000) / (fallbackCount + 1);
          timestamps = Array.from({ length: fallbackCount }, (_, i) => (i + 1) * fallbackInterval);
          break;
      }

      // 分段处理，避免内存溢出
      const segmentSize = 10;
      for (let i = 0; i < timestamps.length; i += segmentSize) {
        const segment = timestamps.slice(i, i + segmentSize);
        
        for (let j = 0; j < segment.length; j++) {
          const timestamp = segment[j];
          const dataUrl = await extractor.extractFrame(timestamp);
          
          results.push({
            id: `canvas_${Date.now()}_${i + j}`,
            dataUrl,
            timestamp,
            index: i + j
          });

          const currentProgress = Math.round(((i + j + 1) / timestamps.length) * 100);
          const progressData = { 
            progress: currentProgress, 
            current: i + j + 1, 
            total: timestamps.length 
          };
          setProgress(progressData);
          onProgress?.(progressData);
        }

        // 让出主线程
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      return results;
    } finally {
      extractor.cleanup();
    }
  }, [onProgress]);

  // 使用 Worker 抽帧（支持所有模式，适合大文件）
  const extractWithWorker = useCallback(async (options: ExtractOptions): Promise<FrameResult[]> => {
    if (!workerRef.current) {
      throw new Error('Worker 未初始化');
    }

    return workerRef.current.extractFrames(options, (progress) => {
      setProgress(progress);
      onProgress?.(progress);
    });
  }, [onProgress]);

  // 主抽帧函数
  const extractFrames = useCallback(async (options: ExtractOptions) => {
    setIsExtracting(true);
    setProgress(null);
    setFrames([]);

    try {
      let results: FrameResult[] = [];

      // 根据文件大小选择抽帧方式
      const fileSize = options.videoFile.size;
      const useCanvas = fileSize < 50 * 1024 * 1024 && options.mode !== 'scene';

      if (useCanvas) {
        // 小文件使用 Canvas 模式
        results = await extractWithCanvas(options);
      } else if (workerRef.current) {
        // 大文件使用 Worker 模式
        results = await extractWithWorker(options);
      } else {
        // Worker 不可用，降级到 Canvas
        results = await extractWithCanvas(options);
      }

      setFrames(results);
      onComplete?.(results);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    } finally {
      setIsExtracting(false);
    }
  }, [extractWithCanvas, extractWithWorker, onComplete, onError]);

  // 取消抽帧
  const cancel = useCallback(() => {
    workerRef.current?.cancel();
    setIsExtracting(false);
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setFrames([]);
    setProgress(null);
    setIsExtracting(false);
  }, []);

  return {
    isInitializing,
    isExtracting,
    progress,
    frames,
    extractFrames,
    cancel,
    reset
  };
}
