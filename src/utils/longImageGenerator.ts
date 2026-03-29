import type { Frame } from '../components/Gallery';

export interface LongImageOptions {
  gap?: number;
  backgroundColor?: string;
  watermarkColor?: string;
  watermarkFontSize?: number;
  watermarkPadding?: number;
  targetWidth?: number;
}

export interface LongImageResult {
  dataUrl: string;
  width: number;
  height: number;
  fileName: string;
}

/**
 * 生成电影感长图
 * 将选中的帧纵向拼接成一张长图，带有黑色背景和水印
 */
export async function generateCinematicLongImage(
  frames: Frame[],
  videoFileName: string,
  options: LongImageOptions = {}
): Promise<LongImageResult> {
  const {
    gap = 4,
    backgroundColor = '#000000',
    watermarkColor = 'rgba(255, 255, 255, 0.6)',
    watermarkFontSize = 14,
    watermarkPadding = 20,
    targetWidth = 800,
  } = options;

  if (frames.length === 0) {
    throw new Error('No frames selected');
  }

  if (frames.length < 3 || frames.length > 9) {
    throw new Error('Please select 3-9 frames');
  }

  // 加载所有图片
  const images = await Promise.all(
    frames.map(frame => loadImage(frame.dataUrl))
  );

  // 计算目标尺寸 - 统一宽度
  const firstImage = images[0];
  const aspectRatio = firstImage.width / firstImage.height;
  const finalWidth = Math.min(targetWidth, firstImage.width);
  const finalHeight = Math.round(finalWidth / aspectRatio);

  // 计算总高度
  const totalImagesHeight = images.length * finalHeight;
  const totalGapHeight = (images.length - 1) * gap;
  const watermarkHeight = watermarkPadding * 2 + watermarkFontSize + 8;
  const totalHeight = totalImagesHeight + totalGapHeight + watermarkHeight;

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = finalWidth;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // 填充黑色背景
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, finalWidth, totalHeight);

  // 绘制每张图片
  let currentY = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    // 计算裁剪区域以保持统一比例
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.width;
    let sourceHeight = img.height;

    // 如果图片比例与目标不同，进行居中裁剪
    const imgAspectRatio = img.width / img.height;
    const targetAspectRatio = finalWidth / finalHeight;

    if (imgAspectRatio > targetAspectRatio) {
      // 图片更宽，裁剪左右
      sourceWidth = img.height * targetAspectRatio;
      sourceX = (img.width - sourceWidth) / 2;
    } else if (imgAspectRatio < targetAspectRatio) {
      // 图片更高，裁剪上下
      sourceHeight = img.width / targetAspectRatio;
      sourceY = (img.height - sourceHeight) / 2;
    }

    // 绘制图片
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, currentY, finalWidth, finalHeight
    );

    currentY += finalHeight + gap;
  }

  // 绘制水印区域背景（渐变）
  const gradient = ctx.createLinearGradient(0, totalHeight - watermarkHeight, 0, totalHeight);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, totalHeight - watermarkHeight, finalWidth, watermarkHeight);

  // 绘制水印文字
  ctx.fillStyle = watermarkColor;
  ctx.font = `${watermarkFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 格式化时间戳
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 视频文件名（去除扩展名）
  const cleanFileName = videoFileName.replace(/\.[^/.]+$/, '');

  // 绘制主水印文字
  const watermarkText = `${cleanFileName}`;
  ctx.fillText(watermarkText, finalWidth / 2, totalHeight - watermarkHeight / 2 - 6);

  // 绘制时间戳（小字）
  ctx.font = `${Math.max(10, watermarkFontSize - 4)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(timestamp, finalWidth / 2, totalHeight - watermarkHeight / 2 + 12);

  // 生成数据 URL
  const dataUrl = canvas.toDataURL('image/png', 0.95);

  // 生成文件名
  const fileName = `${cleanFileName}_cinematic_${frames.length}frames_${Date.now()}.png`;

  return {
    dataUrl,
    width: finalWidth,
    height: totalHeight,
    fileName,
  };
}

/**
 * 加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
 * 生成电影感长图并自动下载
 */
export async function generateAndDownloadLongImage(
  frames: Frame[],
  videoFileName: string,
  options?: LongImageOptions
): Promise<void> {
  const result = await generateCinematicLongImage(frames, videoFileName, options);
  downloadLongImage(result);
}
