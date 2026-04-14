import type { Frame } from '../components/Gallery';
import type { LongImageConfig } from '../components/LongImageConfigDialog';

export interface LongImageResult {
  dataUrl: string;
  width: number;
  height: number;
  fileName: string;
}

export interface LongImageBatchResult {
  images: LongImageResult[];
  totalSize: number;
}

/**
 * 加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 压缩图片到指定大小
 */
async function compressImage(
  canvas: HTMLCanvasElement,
  maxFileSizeMB: number,
  initialQuality: number
): Promise<string> {
  let quality = initialQuality;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  
  // 估算文件大小 (base64 约为原大小的 4/3)
  let fileSizeMB = (dataUrl.length * 3 / 4) / 1024 / 1024;
  
  // 如果超过限制，逐步降低质量
  while (fileSizeMB > maxFileSizeMB && quality > 0.3) {
    quality -= 0.05;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    fileSizeMB = (dataUrl.length * 3 / 4) / 1024 / 1024;
  }
  
  return dataUrl;
}

/**
 * 生成单张长图
 */
async function generateSingleLongImage(
  frames: Frame[],
  videoFileName: string,
  config: LongImageConfig,
  startIndex: number = 0,
  endIndex: number = frames.length - 1
): Promise<LongImageResult> {
  const selectedFrames = frames.slice(startIndex, endIndex + 1);
  
  if (selectedFrames.length === 0) {
    throw new Error('No frames selected');
  }

  // 加载所有图片
  const images = await Promise.all(
    selectedFrames.map(frame => loadImage(frame.dataUrl))
  );

  // 计算布局
  const { layout, columns, gap, padding, borderRadius, borderWidth } = config;
  
  // 获取第一张图片的宽高比
  const firstImage = images[0];
  const aspectRatio = firstImage.width / firstImage.height;
  
  // 计算目标尺寸
  let targetWidth: number;
  let itemWidth: number;
  let itemHeight: number;
  let totalWidth: number;
  let totalHeight: number;
  let rows: number;

  if (layout === 'vertical') {
    // 纵向布局
    targetWidth = Math.min(800, firstImage.width);
    itemWidth = targetWidth - padding * 2;
    itemHeight = itemWidth / aspectRatio;
    totalWidth = targetWidth;
    totalHeight = images.length * itemHeight + (images.length - 1) * gap + padding * 2;
    rows = images.length;
  } else if (layout === 'horizontal') {
    // 横向布局
    targetWidth = Math.min(400, firstImage.width);
    itemWidth = targetWidth - padding * 2;
    itemHeight = itemWidth / aspectRatio;
    totalWidth = images.length * itemWidth + (images.length - 1) * gap + padding * 2;
    totalHeight = itemHeight + padding * 2;
    rows = 1;
  } else {
    // 网格布局
    targetWidth = Math.min(1200, firstImage.width * columns);
    itemWidth = (targetWidth - padding * 2 - (columns - 1) * gap) / columns;
    itemHeight = itemWidth / aspectRatio;
    rows = Math.ceil(images.length / columns);
    totalWidth = targetWidth;
    totalHeight = rows * itemHeight + (rows - 1) * gap + padding * 2;
  }

  // 添加水印高度
  let watermarkHeight = 0;
  if (config.showWatermark) {
    watermarkHeight = config.watermarkFontSize * 3 + padding;
  }
  totalHeight += watermarkHeight;

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // 填充背景
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // 绘制每张图片
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    let x: number;
    let y: number;

    if (layout === 'vertical') {
      x = padding;
      y = padding + i * (itemHeight + gap);
    } else if (layout === 'horizontal') {
      x = padding + i * (itemWidth + gap);
      y = padding;
    } else {
      const row = Math.floor(i / columns);
      const col = i % columns;
      x = padding + col * (itemWidth + gap);
      y = padding + row * (itemHeight + gap);
    }

    // 绘制圆角矩形裁剪区域
    if (borderRadius > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, itemWidth, itemHeight, borderRadius);
      ctx.clip();
    }

    // 绘制图片
    ctx.drawImage(img, x, y, itemWidth, itemHeight);

    if (borderRadius > 0) {
      ctx.restore();
    }

    // 绘制边框
    if (borderWidth > 0) {
      ctx.strokeStyle = config.borderColor;
      ctx.lineWidth = borderWidth;
      if (borderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, itemWidth, itemHeight, borderRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, itemWidth, itemHeight);
      }
    }
  }

  // 绘制水印
  if (config.showWatermark && config.watermarkText) {
    const watermarkY = totalHeight - watermarkHeight / 2;
    
    // 水印背景渐变
    const gradient = ctx.createLinearGradient(0, totalHeight - watermarkHeight, 0, totalHeight);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, totalHeight - watermarkHeight, totalWidth, watermarkHeight);

    // 水印文字
    ctx.fillStyle = config.watermarkColor;
    ctx.font = `${config.watermarkFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.watermarkText, totalWidth / 2, watermarkY);
  }

  // 生成数据 URL
  const dataUrl = await compressImage(canvas, config.maxFileSize, config.quality);

  // 生成文件名
  const cleanFileName = videoFileName.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();
  const fileName = `${cleanFileName}_long_${selectedFrames.length}frames_${timestamp}.jpg`;

  return {
    dataUrl,
    width: totalWidth,
    height: totalHeight,
    fileName,
  };
}

/**
 * 生成电影感长图（支持分段）
 */
export async function generateCinematicLongImage(
  frames: Frame[],
  videoFileName: string,
  config: LongImageConfig
): Promise<LongImageBatchResult> {
  if (frames.length < 3 || frames.length > 9) {
    throw new Error('Please select 3-9 frames');
  }

  const results: LongImageResult[] = [];

  if (config.splitIntoChunks) {
    // 分段生成
    let currentIndex = 0;
    let chunkIndex = 0;

    while (currentIndex < frames.length) {
      // 估算每张图片的高度
      const estimatedItemHeight = 800; // 估算值
      const itemsPerChunk = Math.max(2, Math.floor(config.chunkHeight / estimatedItemHeight));
      const endIndex = Math.min(currentIndex + itemsPerChunk - 1, frames.length - 1);

      const result = await generateSingleLongImage(
        frames,
        videoFileName,
        config,
        currentIndex,
        endIndex
      );

      // 修改文件名添加分段标识
      const baseFileName = result.fileName.replace('.jpg', '');
      result.fileName = `${baseFileName}_part${chunkIndex + 1}.jpg`;

      results.push(result);

      currentIndex = endIndex + 1;
      chunkIndex++;
    }
  } else {
    // 生成单张
    const result = await generateSingleLongImage(frames, videoFileName, config);
    results.push(result);
  }

  // 计算总大小
  const totalSize = results.reduce((sum, r) => sum + (r.dataUrl.length * 3 / 4), 0) / 1024 / 1024;

  return {
    images: results,
    totalSize,
  };
}

/**
 * 下载长图
 */
export function downloadLongImage(result: LongImageResult): void {
  const link = document.createElement('a');
  link.href = result.dataUrl;
  link.download = result.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 批量下载长图
 */
export function downloadLongImages(results: LongImageBatchResult): void {
  results.images.forEach((image, index) => {
    setTimeout(() => {
      downloadLongImage(image);
    }, index * 500); // 延迟下载避免浏览器阻塞
  });
}

/**
 * 生成电影感长图并自动下载
 */
export async function generateAndDownloadLongImage(
  frames: Frame[],
  videoFileName: string,
  config: LongImageConfig
): Promise<void> {
  const results = await generateCinematicLongImage(frames, videoFileName, config);
  downloadLongImages(results);
}
