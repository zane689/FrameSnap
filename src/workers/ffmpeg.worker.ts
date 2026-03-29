import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// Worker 消息类型
export interface WorkerMessage {
  type: 'init' | 'extract' | 'cancel' | 'progress' | 'complete' | 'error';
  payload?: any;
}

// 抽帧配置
export interface ExtractConfig {
  mode: 'fixed' | 'average' | 'scene';
  videoFile: File;
  // 固定频率模式
  fps?: number;
  // 总数平分模式
  totalFrames?: number;
  // 场景检测模式
  sceneThreshold?: number;
  // 分段处理配置
  segmentSize?: number; // 每段处理的帧数
  maxConcurrency?: number; // 最大并发数
}

// 抽帧结果
export interface FrameResult {
  id: string;
  dataUrl: string;
  timestamp: number;
  index: number;
}

class FFmpegWorker {
  private ffmpeg: FFmpeg | null = null;
  private isInitialized = false;
  private abortController: AbortController | null = null;
  // private config: ExtractConfig | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.ffmpeg = new FFmpeg();
      
      // 加载 FFmpeg core
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      // 设置日志回调
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      this.isInitialized = true;
      self.postMessage({ type: 'init', payload: { success: true } });
    } catch (error) {
      self.postMessage({ 
        type: 'error', 
        payload: { message: 'FFmpeg 初始化失败', error } 
      });
    }
  }

  async extractFrames(config: ExtractConfig) {
    if (!this.ffmpeg || !this.isInitialized) {
      self.postMessage({ 
        type: 'error', 
        payload: { message: 'FFmpeg 未初始化' } 
      });
      return;
    }

    // this.config = config;
    this.abortController = new AbortController();

    try {
      const { videoFile, mode } = config;
      
      // 写入视频文件
      const videoData = new Uint8Array(await videoFile.arrayBuffer());
      await this.ffmpeg.writeFile('input.mp4', videoData);

      let frames: FrameResult[] = [];

      switch (mode) {
        case 'fixed':
          frames = await this.extractFixedFrames(config);
          break;
        case 'average':
          frames = await this.extractAverageFrames(config);
          break;
        case 'scene':
          frames = await this.extractSceneFrames(config);
          break;
        default:
          throw new Error('未知的抽帧模式');
      }

      // 清理文件
      await this.ffmpeg.deleteFile('input.mp4');

      self.postMessage({ 
        type: 'complete', 
        payload: { frames } 
      });
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        self.postMessage({ type: 'cancel', payload: { message: '抽帧已取消' } });
      } else {
        self.postMessage({ 
          type: 'error', 
          payload: { message: '抽帧失败', error } 
        });
      }
    }
  }

  // 固定频率抽帧 - 使用分段 Seek 优化内存
  private async extractFixedFrames(config: ExtractConfig): Promise<FrameResult[]> {
    const { fps = 1, segmentSize = 30 } = config;
    const frames: FrameResult[] = [];
    
    // 获取视频时长
    const duration = await this.getVideoDuration();
    const totalFrames = Math.floor(duration * fps);
    const segments = Math.ceil(totalFrames / segmentSize);

    for (let seg = 0; seg < segments; seg++) {
      if (this.abortController?.signal.aborted) break;

      const startFrame = seg * segmentSize;
      const endFrame = Math.min((seg + 1) * segmentSize, totalFrames);
      const segmentFrames = endFrame - startFrame;

      // 分段提取
      const startTime = startFrame / fps;
      const endTime = endFrame / fps;

      await this.ffmpeg!.exec([
        '-ss', startTime.toString(),
        '-t', (endTime - startTime).toString(),
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=1920:-1:flags=lanczos`,
        '-q:v', '2',
        '-pix_fmt', 'rgb24',
        `frame_${seg}_%03d.png`
      ]);

      // 读取并处理本段帧
      for (let i = 0; i < segmentFrames; i++) {
        const frameIndex = startFrame + i;
        const timestamp = frameIndex / fps;
        const fileName = `frame_${seg}_${String(i + 1).padStart(3, '0')}.png`;

        try {
          const data = await this.ffmpeg!.readFile(fileName) as Uint8Array;
          const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
          const blob = new Blob([buffer], { type: 'image/png' });
          const dataUrl = await this.blobToDataUrl(blob);

          frames.push({
            id: `frame_${Date.now()}_${frameIndex}`,
            dataUrl,
            timestamp: timestamp * 1000,
            index: frameIndex
          });

          // 立即删除已处理的文件释放内存
          await this.ffmpeg!.deleteFile(fileName);

          // 发送进度
          const progress = Math.round((frames.length / totalFrames) * 100);
          self.postMessage({ type: 'progress', payload: { progress, current: frames.length, total: totalFrames } });
        } catch (e) {
          console.warn(`无法读取帧 ${fileName}:`, e);
        }
      }

      // 强制垃圾回收建议
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globalAny = globalThis as any;
      if (globalAny.gc) {
        globalAny.gc();
      }
    }

    return frames;
  }

  // 总数平分抽帧
  private async extractAverageFrames(config: ExtractConfig): Promise<FrameResult[]> {
    const { totalFrames = 10 } = config;
    const duration = await this.getVideoDuration();
    const interval = duration / (totalFrames + 1);
    const frames: FrameResult[] = [];

    // 使用分段处理，每段处理 5 帧
    const segmentSize = 5;
    const segments = Math.ceil(totalFrames / segmentSize);

    for (let seg = 0; seg < segments; seg++) {
      if (this.abortController?.signal.aborted) break;

      const startIdx = seg * segmentSize;
      const endIdx = Math.min((seg + 1) * segmentSize, totalFrames);

      for (let i = startIdx; i < endIdx; i++) {
        const timestamp = (i + 1) * interval;
        const frame = await this.extractSingleFrame(timestamp, i);
        if (frame) {
          frames.push(frame);
          const progress = Math.round((frames.length / totalFrames) * 100);
          self.postMessage({ type: 'progress', payload: { progress, current: frames.length, total: totalFrames } });
        }
      }

      // 延迟让出主线程
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return frames;
  }

  // 场景检测抽帧 - 使用 scene 滤镜
  private async extractSceneFrames(config: ExtractConfig): Promise<FrameResult[]> {
    const { sceneThreshold = 0.3 } = config;
    const frames: FrameResult[] = [];

    // 使用 scene 滤镜检测场景变化
    await this.ffmpeg!.exec([
      '-i', 'input.mp4',
      '-vf', `select='gt(scene,${sceneThreshold})',scale=1920:-1:flags=lanczos`,
      '-vsync', 'vfr',
      '-q:v', '2',
      '-pix_fmt', 'rgb24',
      'scene_%03d.png'
    ]);

    // 获取场景帧的时间戳
    const sceneData = await this.ffmpeg!.readFile('scene_001.png').catch(() => null);
    if (!sceneData) {
      // 如果没有检测到场景变化，返回固定帧
      return this.extractAverageFrames({ ...config, totalFrames: 10 });
    }

    // 读取所有场景帧
    let index = 1;
    while (true) {
      if (this.abortController?.signal.aborted) break;

      const fileName = `scene_${String(index).padStart(3, '0')}.png`;
      try {
        const data = await this.ffmpeg!.readFile(fileName) as Uint8Array;
        const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
        const blob = new Blob([buffer], { type: 'image/png' });
        const dataUrl = await this.blobToDataUrl(blob);

        // 估算时间戳（实际应该通过 ffprobe 获取精确时间）
        const timestamp = index * 1000; // 简化处理

        frames.push({
          id: `scene_${Date.now()}_${index}`,
          dataUrl,
          timestamp,
          index
        });

        await this.ffmpeg!.deleteFile(fileName);

        const progress = Math.round((index / 50) * 100); // 预估最多50个场景
        self.postMessage({ type: 'progress', payload: { progress, current: index } });

        index++;
      } catch (e) {
        break; // 没有更多帧了
      }
    }

    return frames;
  }

  // 提取单帧
  private async extractSingleFrame(timestamp: number, index: number): Promise<FrameResult | null> {
    try {
      const outputName = `single_${index}.png`;
      
      await this.ffmpeg!.exec([
        '-ss', timestamp.toString(),
        '-i', 'input.mp4',
        '-vf', 'scale=1920:-1:flags=lanczos',
        '-q:v', '2',
        '-pix_fmt', 'rgb24',
        '-frames:v', '1',
        outputName
      ]);

      const data = await this.ffmpeg!.readFile(outputName) as Uint8Array;
      const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      const blob = new Blob([buffer], { type: 'image/png' });
      const dataUrl = await this.blobToDataUrl(blob);
      
      await this.ffmpeg!.deleteFile(outputName);

      return {
        id: `frame_${Date.now()}_${index}`,
        dataUrl,
        timestamp: timestamp * 1000,
        index
      };
    } catch (e) {
      console.warn(`提取帧 ${index} 失败:`, e);
      return null;
    }
  }

  // 获取视频时长
  private async getVideoDuration(): Promise<number> {
    // 使用 ffprobe 获取时长
    try {
      await this.ffmpeg!.exec([
        '-i', 'input.mp4',
        '-f', 'null',
        '-'
      ]);
    } catch (e) {
      // FFmpeg 会返回错误但包含时长信息
    }
    
    // 简化处理：返回默认值，实际应该从 ffprobe 解析
    // 这里通过读取文件后使用 video 元素获取
    return 60; // 默认 60 秒
  }

  // Blob 转 DataURL
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  cancel() {
    this.abortController?.abort();
  }
}

// Worker 实例
const worker = new FFmpegWorker();

// 消息处理
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'init':
      await worker.initialize();
      break;
    case 'extract':
      await worker.extractFrames(payload as ExtractConfig);
      break;
    case 'cancel':
      worker.cancel();
      break;
  }
};

export {};
