import { useState, useEffect } from 'react';
import { X, Sparkles, Grid3X3, Palette, Type, Image as ImageIcon, Download, Scissors } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Portal } from './Portal';
import type { Frame } from './Gallery';

interface LongImageConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: LongImageConfig) => void;
  frames: Frame[];
  videoFileName: string;
}

export interface LongImageConfig {
  // 预设模板
  preset: 'custom' | 'moments' | 'xiaohongshu' | 'storyboard';
  // 布局
  layout: 'vertical' | 'horizontal' | 'grid';
  columns: number;
  // 样式
  gap: number;
  padding: number;
  backgroundColor: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  // 水印
  showWatermark: boolean;
  watermarkText: string;
  watermarkPosition: 'bottom' | 'top' | 'center';
  watermarkColor: string;
  watermarkFontSize: number;
  // 导出
  quality: number;
  maxFileSize: number; // MB
  splitIntoChunks: boolean;
  chunkHeight: number; // px
}

const PRESETS = {
  custom: {
    name: 'custom',
    layout: 'vertical' as const,
    columns: 1,
    gap: 4,
    padding: 0,
    backgroundColor: '#000000',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#ffffff',
  },
  moments: {
    name: 'moments',
    layout: 'vertical' as const,
    columns: 1,
    gap: 2,
    padding: 0,
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 0,
    borderColor: '#ffffff',
  },
  xiaohongshu: {
    name: 'xiaohongshu',
    layout: 'vertical' as const,
    columns: 1,
    gap: 4,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#e5e5e5',
  },
  storyboard: {
    name: 'storyboard',
    layout: 'grid' as const,
    columns: 2,
    gap: 8,
    padding: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
};

export function LongImageConfigDialog({ 
  isOpen, 
  onClose, 
  onGenerate, 
  frames,
  videoFileName 
}: LongImageConfigDialogProps) {
  const { t } = useLanguage();
  const [config, setConfig] = useState<LongImageConfig>({
    preset: 'custom',
    layout: 'vertical',
    columns: 1,
    gap: 4,
    padding: 0,
    backgroundColor: '#000000',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#ffffff',
    showWatermark: true,
    watermarkText: videoFileName.replace(/\.[^/.]+$/, ''),
    watermarkPosition: 'bottom',
    watermarkColor: 'rgba(255, 255, 255, 0.6)',
    watermarkFontSize: 14,
    quality: 0.95,
    maxFileSize: 10,
    splitIntoChunks: false,
    chunkHeight: 8000,
  });

  const [activeTab, setActiveTab] = useState<'preset' | 'layout' | 'style' | 'watermark' | 'export'>('preset');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(prev => ({
        ...prev,
        watermarkText: videoFileName.replace(/\.[^/.]+$/, ''),
      }));
    }
  }, [isOpen, videoFileName]);

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setConfig(prev => ({
      ...prev,
      preset: presetKey,
      layout: preset.layout,
      columns: preset.columns,
      gap: preset.gap,
      padding: preset.padding,
      backgroundColor: preset.backgroundColor,
      borderRadius: preset.borderRadius,
      borderWidth: preset.borderWidth,
      borderColor: preset.borderColor,
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(config);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'preset', icon: Sparkles, label: t('longImage.preset') },
    { id: 'layout', icon: Grid3X3, label: t('longImage.layout') },
    { id: 'style', icon: Palette, label: t('longImage.style') },
    { id: 'watermark', icon: Type, label: t('longImage.watermark') },
    { id: 'export', icon: Download, label: t('longImage.export') },
  ];

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              {t('longImage.title')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Preset Tab */}
            {activeTab === 'preset' && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">{t('longImage.presetDesc')}</p>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        config.preset === key
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="font-semibold text-white mb-1">
                        {t(`longImage.presets.${key}`)}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {t(`longImage.presets.${key}Desc`)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    {t('longImage.layout')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['vertical', 'horizontal', 'grid'] as const).map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setConfig(prev => ({ ...prev, layout }))}
                        className={`p-3 rounded-lg border transition-all ${
                          config.layout === layout
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {t(`longImage.layouts.${layout}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {config.layout === 'grid' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      {t('longImage.columns')}: {config.columns}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="4"
                      value={config.columns}
                      onChange={(e) => setConfig(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('longImage.gap')}: {config.gap}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={config.gap}
                    onChange={(e) => setConfig(prev => ({ ...prev, gap: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Style Tab */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('longImage.padding')}: {config.padding}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={config.padding}
                    onChange={(e) => setConfig(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('longImage.backgroundColor')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {['#000000', '#ffffff', '#1a1a1a', '#f5f5f5', '#ff6b6b', '#4ecdc4', '#45b7d1'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setConfig(prev => ({ ...prev, backgroundColor: color }))}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          config.backgroundColor === color ? 'border-amber-500 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('longImage.borderRadius')}: {config.borderRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={config.borderRadius}
                    onChange={(e) => setConfig(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('longImage.borderWidth')}: {config.borderWidth}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={config.borderWidth}
                    onChange={(e) => setConfig(prev => ({ ...prev, borderWidth: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {config.borderWidth > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      {t('longImage.borderColor')}
                    </label>
                    <input
                      type="color"
                      value={config.borderColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, borderColor: e.target.value }))}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Watermark Tab */}
            {activeTab === 'watermark' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showWatermark"
                    checked={config.showWatermark}
                    onChange={(e) => setConfig(prev => ({ ...prev, showWatermark: e.target.checked }))}
                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="showWatermark" className="text-sm font-medium text-zinc-300">
                    {t('longImage.showWatermark')}
                  </label>
                </div>

                {config.showWatermark && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        {t('longImage.watermarkText')}
                      </label>
                      <input
                        type="text"
                        value={config.watermarkText}
                        onChange={(e) => setConfig(prev => ({ ...prev, watermarkText: e.target.value }))}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        placeholder={t('longImage.watermarkPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        {t('longImage.watermarkPosition')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['top', 'center', 'bottom'] as const).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setConfig(prev => ({ ...prev, watermarkPosition: pos }))}
                            className={`p-2 rounded-lg border text-sm transition-all ${
                              config.watermarkPosition === pos
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                            }`}
                          >
                            {t(`longImage.positions.${pos}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        {t('longImage.watermarkFontSize')}: {config.watermarkFontSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="32"
                        value={config.watermarkFontSize}
                        onChange={(e) => setConfig(prev => ({ ...prev, watermarkFontSize: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        {t('longImage.watermarkColor')}
                      </label>
                      <input
                        type="color"
                        value={config.watermarkColor.replace('rgba(', '').replace(')', '').split(',').slice(0, 3).map((v, i) => {
                          const num = parseInt(v.trim());
                          return i === 3 ? '' : num.toString(16).padStart(2, '0');
                        }).join('')}
                        onChange={(e) => {
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          setConfig(prev => ({ ...prev, watermarkColor: `rgba(${r}, ${g}, ${b}, 0.6)` }));
                        }}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('longImage.quality')}: {(config.quality * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={config.quality}
                    onChange={(e) => setConfig(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('longImage.maxFileSize')}: {config.maxFileSize}MB
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={config.maxFileSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="splitIntoChunks"
                    checked={config.splitIntoChunks}
                    onChange={(e) => setConfig(prev => ({ ...prev, splitIntoChunks: e.target.checked }))}
                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="splitIntoChunks" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    {t('longImage.splitIntoChunks')}
                  </label>
                </div>

                {config.splitIntoChunks && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      {t('longImage.chunkHeight')}: {config.chunkHeight}px
                    </label>
                    <input
                      type="range"
                      min="2000"
                      max="10000"
                      step="500"
                      value={config.chunkHeight}
                      onChange={(e) => setConfig(prev => ({ ...prev, chunkHeight: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      {t('longImage.chunkHeightDesc')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
            <div className="text-sm text-zinc-500">
              {t('longImage.selectedFrames')}: {frames.length}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {t('longImage.cancel')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || frames.length < 3 || frames.length > 9}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {t('longImage.generate')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
