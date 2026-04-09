import { useState, useCallback, useRef, useEffect } from 'react';
import { Image, Grid3X3, List, Trash2, Check, Download, X, Square, CheckSquare, Layers, Maximize2, Package, Fullscreen } from 'lucide-react';
import JSZip from 'jszip';
import { useLanguage } from '../i18n/LanguageContext';

export interface Frame {
  id: string;
  dataUrl: string;
  timestamp: number;
  videoName: string;
}

interface GalleryProps {
  frames: Frame[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRemoveFrame: (id: string) => void;
  onClearAll: () => void;
  onDownloadSelected?: () => void;
}

export function Gallery({
  frames,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onRemoveFrame,
  onClearAll,
  onDownloadSelected: _onDownloadSelected
}: GalleryProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewFrame, setPreviewFrame] = useState<Frame | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const downloadFrame = useCallback((frame: Frame) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = `${frame.videoName}_frame_${frame.timestamp.toFixed(0)}ms.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Fullscreen functions
  const enterFullscreen = useCallback(async () => {
    if (previewContainerRef.current) {
      try {
        if (previewContainerRef.current.requestFullscreen) {
          await previewContainerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
      }
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto enter fullscreen when preview opens
  useEffect(() => {
    if (previewFrame) {
      // Small delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [previewFrame, enterFullscreen]);

  const downloadAllAsZip = async () => {
    if (frames.length === 0) return;

    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('frames');

      frames.forEach((frame, index) => {
        const base64Data = frame.dataUrl.split(',')[1];
        const fileName = `${String(index + 1).padStart(3, '0')}_${frame.videoName}_frame_${frame.timestamp.toFixed(0)}ms.png`;
        folder?.file(fileName, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `frames_${frames.length}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to create zip:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (frames.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto text-center py-12 mt-6">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 rounded-3xl blur-2xl opacity-50 animate-glow-pulse" />
          <div className="relative p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl border border-amber-500/30 shadow-medium">
            <Layers className="w-12 h-12 text-amber-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-amber-100 mb-3">{(t('gallery.noFrames') as string)}</h3>
        <p className="text-amber-200/60 text-lg" dangerouslySetInnerHTML={{ 
          __html: (t('gallery.uploadHint') as string).replace(
            '"提取全部帧"', 
            '<span class="text-amber-300 font-semibold">"提取全部帧"</span>'
          ) 
        }} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fly-in mt-8 mb-12 relative z-10">
      {/* Gallery Header */}
      <div className="premium-card rounded-2xl shadow-medium px-6 py-5 mb-6 border-amber-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 rounded-xl blur-sm opacity-50" />
              <div className="relative p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-medium">
                <Image className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-sm font-bold text-amber-100">
                {(t('gallery.extracted') as string)} <span className="text-amber-300 font-bold text-lg">{frames.length}</span> {(t('gallery.frames') as string)}
              </span>
              <p className="text-xs text-amber-200/50">{(t('gallery.selectTip') as string)}</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 ml-4 p-1 bg-zinc-800/70 rounded-xl border border-amber-500/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-medium' : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10'}`}
                title={t('gallery.gridView') as string}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-medium' : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10'}`}
                title={t('gallery.listView') as string}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Select All / Clear Selection */}
            <button
              onClick={selectedIds.size === frames.length ? onClearSelection : onSelectAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-amber-100/90 transition-all duration-200 hover:scale-105 cursor-pointer border border-amber-500/20 shadow-soft hover:shadow-medium"
            >
              {selectedIds.size === frames.length ? (
                <>
                  <Square className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold">{(t('gallery.deselectAll') as string)}</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold">{(t('gallery.selectAll') as string)}</span>
                </>
              )}
            </button>

            <div className="w-px h-8 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />

            <button
              onClick={downloadAllAsZip}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 cursor-pointer hover:scale-[1.02]"
            >
              <Package className="w-4 h-4" />
              <span className="text-sm font-bold">
                {downloading ? (t('gallery.packing') as string) : (t('gallery.downloadAll') as string)}
              </span>
            </button>

            <button
              onClick={onClearAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-all duration-200 hover:scale-105 cursor-pointer border border-rose-500/20"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-semibold hidden sm:inline">{(t('gallery.clear') as string)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {frames.map((frame, index) => {
            const isSelected = selectedIds.has(frame.id);
            return (
              <div
                key={frame.id}
                className="relative group animate-fly-in"
                style={{ animationDelay: `${Math.min(index * 25, 400)}ms` }}
                onMouseEnter={() => setHoveredId(frame.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={`
                    relative aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-soft
                    ${isSelected
                      ? 'border-amber-400 shadow-medium ring-2 ring-amber-400/30 scale-[1.02]'
                      : hoveredId === frame.id
                        ? 'border-amber-400/50 shadow-medium scale-[1.03]'
                        : 'border-transparent hover:border-amber-500/30'
                    }
                  `}
                  onClick={() => onToggleSelect(frame.id)}
                >
                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/15 z-10 pointer-events-none" />
                  )}

                  <img
                    src={frame.dataUrl}
                    alt={`${t('gallery.frame')} ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Checkbox - smaller */}
                  <div
                    className={`
                      absolute top-1.5 left-1.5 w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 z-20 backdrop-blur-sm
                      ${isSelected
                        ? 'bg-amber-500 border-amber-400'
                        : 'bg-zinc-900/60 border-amber-500/40 group-hover:border-amber-400/60 group-hover:bg-zinc-800/60'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(frame.id);
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Frame Number - smaller */}
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-zinc-900/70 backdrop-blur-sm rounded text-[9px] text-amber-200/80 font-mono z-20">
                    #{index + 1}
                  </div>

                  {/* Preview button - smaller */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFrame(frame);
                    }}
                    className="absolute bottom-1.5 right-1.5 p-1.5 bg-zinc-900/70 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-500/20 text-amber-300/70 hover:text-amber-200 z-20"
                    title={t('gallery.preview') as string}
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>

                  {/* Desktop hover actions - smaller */}
                  <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent items-end justify-center gap-1.5 pb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFrame(frame);
                      }}
                      className="p-1.5 rounded bg-zinc-800/90 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-200"
                      title={t('gallery.download') as string}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frame.id);
                      }}
                      className="p-1.5 rounded bg-zinc-800/90 hover:bg-red-600/90 text-zinc-400 hover:text-white transition-all duration-200"
                      title={t('gallery.delete') as string}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Mobile action buttons - smaller */}
                  <div className="flex md:hidden absolute bottom-1.5 left-1.5 gap-1 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFrame(frame);
                      }}
                      className="p-1.5 rounded bg-zinc-800/80 text-zinc-400 hover:text-white transition-all duration-200"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frame.id);
                      }}
                      className="p-1.5 rounded bg-zinc-800/80 text-zinc-400 hover:text-red-400 transition-all duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Timestamp label */}
                <div className="mt-2 text-center">
                  <span className="text-[11px] text-amber-200/80 font-mono bg-zinc-800/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {(frame.timestamp / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="premium-card rounded-2xl shadow-soft overflow-hidden border-amber-500/10">
          {frames.map((frame, index) => {
            const isSelected = selectedIds.has(frame.id);
            return (
              <div
                key={frame.id}
                className={`
                  flex items-center gap-4 p-4 border-b border-zinc-800 last:border-b-0 transition-all duration-200 cursor-pointer hover:bg-zinc-800/80
                  ${isSelected ? 'bg-amber-500/5' : ''}
                `}
                onClick={() => onToggleSelect(frame.id)}
              >
                {/* Checkbox */}
                <div
                  className={`
                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                    ${isSelected ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-400' : 'border-amber-500/30 hover:border-amber-400'}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(frame.id);
                  }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Thumbnail */}
                <div className="w-24 h-14 rounded-xl overflow-hidden border border-amber-500/20 flex-shrink-0 shadow-soft">
                  <img src={frame.dataUrl} alt={`${t('gallery.frame')} ${index + 1}`} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-100">{(t('gallery.frame') as string)} #{index + 1}</p>
                  <p className="text-xs text-amber-300/50 font-mono">{(frame.timestamp / 1000).toFixed(2)}s</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Preview button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFrame(frame);
                    }}
                    className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-300/70 hover:text-amber-200 transition-all duration-200 cursor-pointer"
                    title={t('gallery.preview') as string}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFrame(frame);
                    }}
                    className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-300/70 hover:text-amber-200 transition-all duration-200 cursor-pointer"
                    title={t('gallery.download') as string}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFrame(frame.id);
                    }}
                    className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                    title={t('gallery.delete') as string}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewFrame && (
        <div
          ref={previewContainerRef}
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
          onClick={() => {
            exitFullscreen();
            setPreviewFrame(null);
          }}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Image container - True fullscreen */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewFrame.dataUrl}
                alt="Preview"
                className="w-full h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Top bar controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {/* Fullscreen toggle button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-3 bg-zinc-900/80 hover:bg-zinc-700 rounded-full text-white transition-all duration-200 hover:scale-110 shadow-lg"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Fullscreen className="w-5 h-5" /> : <Fullscreen className="w-5 h-5" />}
              </button>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exitFullscreen();
                  setPreviewFrame(null);
                }}
                className="p-3 bg-zinc-900/80 hover:bg-red-600 rounded-full text-white transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Frame info */}
            <div className="absolute top-4 left-4 px-4 py-2 bg-zinc-900/80 rounded-lg text-white/80 text-sm font-mono">
              {(previewFrame.timestamp / 1000).toFixed(2)}s
            </div>

            {/* Bottom action bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadFrame(previewFrame);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-orange-500/30 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                {t('gallery.download') as string}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
