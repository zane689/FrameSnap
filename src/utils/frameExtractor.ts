import type { ExtractConfig, FrameResult, WorkerMessage } from '../workers/ffmpeg.worker';

export type ExtractMode = 'fixed' | 'average' | 'scene';

export interface ExtractOptions {
  mode: ExtractMode;
  videoFile: File;
  // 固定频率模式
  fps?: number;
  // 总数平分模式
  totalFrames?: number;
  // 场景检测模式
  sceneThreshold?: number;
}

export interface ExtractProgress {
  progress: number;
  current: number;
  total: number;
}

// 使用 Canvas 的轻量级抽帧（无需 FFmpeg）
export class CanvasFrameExtractor {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 Canvas 上下文');
    this.ctx = ctx;
  }

  async loadVideo(file: File): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;
      
      video.onloadedmetadata = () => {
        this.video = video;
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
        resolve(video);
      };
      
      video.onerror = reject;
    });
  }

  async extractFrame(timestamp: number): Promise<string> {
    if (!this.video) throw new Error('视频未加载');

    return new Promise((resolve, _reject) => {
      const onSeeked = () => {
        this.video!.removeEventListener('seeked', onSeeked);
        
        this.ctx.drawImage(this.video!, 0, 0);
        const dataUrl = this.canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      };

      this.video!.addEventListener('seeked', onSeeked);
      this.video!.currentTime = timestamp / 1000;
    });
  }

  getDuration(): number {
    return this.video?.duration || 0;
  }

  cleanup() {
    if (this.video) {
      URL.revokeObjectURL(this.video.src);
      this.video = null;
    }
  }
}

// FFmpeg Worker 管理器
export class FFmpegWorkerManager {
  private worker: Worker | null = null;
  private isInitialized = false;
  private messageHandlers: Map<string, (message: WorkerMessage) => void> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // 动态创建 Worker
    const workerUrl = new URL('../workers/ffmpeg.worker.ts', import.meta.url);
    this.worker = new Worker(workerUrl, { type: 'module' });

    this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { type } = e.data;
      const handler = this.messageHandlers.get(type);
      if (handler) {
        handler(e.data);
      }
    };

    // 初始化 FFmpeg
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('FFmpeg 初始化超时'));
      }, 30000);

      this.messageHandlers.set('init', (msg) => {
        clearTimeout(timeout);
        if (msg.payload?.success) {
          this.isInitialized = true;
          resolve();
        } else {
          reject(new Error(msg.payload?.message || '初始化失败'));
        }
      });

      this.messageHandlers.set('error', (msg) => {
        clearTimeout(timeout);
        reject(new Error(msg.payload?.message || 'Worker 错误'));
      });

      this.worker!.postMessage({ type: 'init' });
    });
  }

  async extractFrames(
    options: ExtractOptions,
    onProgress?: (progress: ExtractProgress) => void
  ): Promise<FrameResult[]> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('Worker 未初始化');
    }

    return new Promise((resolve, reject) => {
      const frames: FrameResult[] = [];

      this.messageHandlers.set('progress', (msg) => {
        if (onProgress && msg.payload) {
          onProgress(msg.payload as ExtractProgress);
        }
      });

      this.messageHandlers.set('complete', (msg) => {
        resolve(msg.payload?.frames || frames);
      });

      this.messageHandlers.set('error', (msg) => {
        reject(new Error(msg.payload?.message || '抽帧失败'));
      });

      this.messageHandlers.set('cancel', () => {
        reject(new Error('抽帧已取消'));
      });

      const config: ExtractConfig = {
        mode: options.mode,
        videoFile: options.videoFile,
        fps: options.fps,
        totalFrames: options.totalFrames,
        sceneThreshold: options.sceneThreshold,
        segmentSize: 30, // 默认每段30帧
        maxConcurrency: 2 // 最大并发数
      };

      this.worker!.postMessage({ type: 'extract', payload: config });
    });
  }

  cancel() {
    if (this.worker) {
      this.worker.postMessage({ type: 'cancel' });
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// 智能抽帧策略选择器
export function selectExtractStrategy(file: File): ExtractMode {
  const size = file.size;
  // const duration = 0; // 实际应该从视频元数据获取

  // 小文件 (< 50MB): 使用 Canvas 快速抽帧
  if (size < 50 * 1024 * 1024) {
    return 'average';
  }

  // 中等文件 (50MB - 500MB): 固定频率抽帧
  if (size < 500 * 1024 * 1024) {
    return 'fixed';
  }

  // 大文件 (> 500MB): 场景检测抽帧
  return 'scene';
}

// 计算推荐的抽帧参数
export function calculateExtractParams(
  mode: ExtractMode,
  duration: number,
  fileSize: number
): Partial<ExtractOptions> {
  switch (mode) {
    case 'fixed':
      // 根据文件大小调整 FPS
      const fps = fileSize > 500 * 1024 * 1024 ? 0.5 : 1;
      return { fps };

    case 'average':
      // 根据时长调整总帧数
      let totalFrames = 10;
      if (duration > 300) totalFrames = 20; // 5分钟以上
      if (duration > 600) totalFrames = 30; // 10分钟以上
      return { totalFrames };

    case 'scene':
      // 场景检测阈值
      return { sceneThreshold: 0.3 };

    default:
      return {};
  }
}
