/**
 * 环境检查工具
 * 检查浏览器是否支持 SharedArrayBuffer 等必要特性
 */

export interface EnvCheckResult {
  isSupported: boolean;
  missingFeatures: string[];
  warnings: string[];
}

/**
 * 检查 SharedArrayBuffer 支持
 */
function checkSharedArrayBuffer(): boolean {
  try {
    if (typeof SharedArrayBuffer === 'undefined') {
      return false;
    }
    // 尝试创建一个 SharedArrayBuffer 实例
    new SharedArrayBuffer(1);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检查 Web Worker 支持
 */
function checkWebWorker(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * 检查 Canvas 支持
 */
function checkCanvas(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('2d') || canvas.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

/**
 * 检查 FFmpeg 所需的跨域隔离
 */
function checkCrossOriginIsolation(): boolean {
  try {
    // 检查是否处于跨域隔离环境
    return window.crossOriginIsolated === true;
  } catch (e) {
    return false;
  }
}

/**
 * 检查 File API 支持
 */
function checkFileAPI(): boolean {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
}

/**
 * 检查 Promise 支持
 */
function checkPromise(): boolean {
  return typeof Promise !== 'undefined';
}

/**
 * 执行完整环境检查
 */
export function checkEnvironment(): EnvCheckResult {
  const missingFeatures: string[] = [];
  const warnings: string[] = [];

  // 必要特性检查
  if (!checkSharedArrayBuffer()) {
    missingFeatures.push('SharedArrayBuffer');
  }

  if (!checkWebWorker()) {
    missingFeatures.push('Web Worker');
  }

  if (!checkCanvas()) {
    missingFeatures.push('Canvas');
  }

  if (!checkFileAPI()) {
    missingFeatures.push('File API');
  }

  if (!checkPromise()) {
    missingFeatures.push('Promise');
  }

  // 警告检查（非致命但影响体验）
  if (!checkCrossOriginIsolation()) {
    warnings.push('crossOriginIsolation');
  }

  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures,
    warnings,
  };
}

/**
 * 获取浏览器信息
 */
export function getBrowserInfo(): {
  name: string;
  version: string;
  os: string;
} {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';

  // 检测浏览器
  if (ua.indexOf('Chrome') > -1) {
    name = 'Chrome';
    version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    name = 'Safari';
    version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edge') > -1) {
    name = 'Edge';
    version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  }

  // 检测操作系统
  if (ua.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (ua.indexOf('Mac') > -1) {
    os = 'macOS';
  } else if (ua.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (ua.indexOf('Android') > -1) {
    os = 'Android';
  } else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    os = 'iOS';
  }

  return { name, version, os };
}

/**
 * 获取解决方案链接
 */
export function getSolutionUrl(feature: string): string {
  const solutions: Record<string, string> = {
    SharedArrayBuffer: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer',
    'Web Worker': 'https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API',
    Canvas: 'https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API',
    'File API': 'https://developer.mozilla.org/zh-CN/docs/Web/API/File_API',
  };
  return solutions[feature] || '#';
}
