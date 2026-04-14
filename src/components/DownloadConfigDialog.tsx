import { useState, useRef, useEffect } from 'react';
import { Download, X, Image as ImageIcon, FileType, Package } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Portal } from './Portal';

interface DownloadConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileName: string, format: ImageFormat, quality: number) => void;
  defaultFileName: string;
  isBatch?: boolean;
  frameCount?: number;
}

export type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'webp';

export function DownloadConfigDialog({ 
  isOpen, 
  onClose, 
  onDownload, 
  defaultFileName,
  isBatch = false,
  frameCount = 1
}: DownloadConfigDialogProps) {
  const { t } = useLanguage();
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFileName(defaultFileName);
    }
  }, [isOpen, defaultFileName]);

  const handleDownload = () => {
    onDownload(fileName, format, quality);
    onClose();
  };

  if (!isOpen) return null;

  const formats: { value: ImageFormat; label: string }[] = [
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPEG' },
    { value: 'webp', label: 'WebP' },
  ];

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isBatch ? <Package className="w-5 h-5 text-amber-400" /> : <ImageIcon className="w-5 h-5 text-amber-400" />}
            {isBatch ? t('downloadConfig.batchTitle') : t('downloadConfig.singleTitle')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isBatch && frameCount > 1 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-200">
                {t('downloadConfig.batchInfo').replace('{count}', String(frameCount))}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {isBatch ? t('downloadConfig.batchFileName') : t('downloadConfig.fileName')}
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              placeholder={isBatch ? t('downloadConfig.batchFileNamePlaceholder') : t('downloadConfig.fileNamePlaceholder')}
            />
            {isBatch && (
              <p className="text-xs text-zinc-500 mt-1">
                {t('downloadConfig.batchSuffix')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <FileType className="w-4 h-4 text-zinc-500" />
              {t('downloadConfig.format')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {formats.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === f.value
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {(format === 'jpg' || format === 'jpeg' || format === 'webp') && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                {t('downloadConfig.quality')}: {(quality * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <div className="p-3 bg-zinc-800/50 rounded-lg">
            <p className="text-xs text-zinc-500">
              {t('downloadConfig.preview')}: <span className="text-zinc-300 font-mono">
                {isBatch ? `${fileName}_001.${format}` : `${fileName}.${format}`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            {t('downloadConfig.cancel')}
          </button>
          <button
            onClick={handleDownload}
            disabled={!fileName.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Download className="w-4 h-4" />
            {t('downloadConfig.download')}
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </Portal>
  );
}
