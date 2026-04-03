import { useState, useCallback, useRef, useEffect } from 'react';
import { Image, Grid3X3, List, Trash2, Check, Download, X, Square, CheckSquare, Layers, Maximize2, Package, Minimize2 } from 'lucide-react';
import JSZip from 'jszip';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewFrame, setPreviewFrame] = useState<Frame | null>(null);

  const downloadFrame = useCallback((frame: Frame) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = `${frame.videoName}_frame_${frame.timestamp.toFixed(0)}ms.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

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
        <h3 className="text-2xl font-bold text-amber-100 mb-3">暂无提取的帧</h3>
        <p className="text-amber-200/60 text-lg">上传视频并点击<span className="text-amber-300 font-semibold"> "提取全部帧" </span>开始</p>
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
                已提取 <span className="text-amber-300 font-bold text-lg">{frames.length}</span> 帧
              </span>
              <p className="text-xs text-amber-200/50">点击缩略图选择，支持多选</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 ml-4 p-1 bg-zinc-800/70 rounded-xl border border-amber-500/20">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-medium' : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10'}`}
                title="网格视图"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-medium' : 'text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10'}`}
                title="列表视图"
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
                  <span className="text-sm font-semibold">取消全选</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold">全选</span>
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
                {downloading ? '打包中...' : '下载全部'}
              </span>
            </button>

            <button
              onClick={onClearAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-all duration-200 hover:scale-105 cursor-pointer border border-rose-500/20"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-semibold hidden sm:inline">清空</span>
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
                    alt={`Frame ${index + 1}`}
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
                      title="下载"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frame.id);
                      }}
                      className="p-1.5 rounded bg-zinc-800/90 hover:bg-red-600/90 text-zinc-400 hover:text-white transition-all duration-200"
                      title="删除"
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
                  <img src={frame.dataUrl} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-100">帧 #{index + 1}</p>
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
                    title="全屏预览"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFrame(frame);
                    }}
                    className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-300/70 hover:text-amber-200 transition-all duration-200 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFrame(frame.id);
                    }}
                    className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal - Full Screen */}
      {previewFrame && (
        <FullScreenPreview
          frame={previewFrame}
          onClose={() => setPreviewFrame(null)}
          onDownload={downloadFrame}
        />
      )}
    </div>
  );
}

// Full Screen Preview Component
interface FullScreenPreviewProps {
  frame: Frame;
  onClose: () => void;
  onDownload: (frame: Frame) => void;
}

function FullScreenPreview({ frame, onClose, onDownload }: FullScreenPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Wait for DOM to be ready before entering fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Enter fullscreen when ready
  useEffect(() => {
    if (!isReady) return;

    const container = containerRef.current;
    if (!container) return;

    const enterFullscreen = async () => {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        }
      } catch (err) {
        console.log('Fullscreen not supported');
      }
    };

    // Delay fullscreen to avoid animation conflict
    requestAnimationFrame(() => {
      enterFullscreen();
    });
  }, [isReady]);

  // Listen for fullscreen change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFullscreenChange = () => {
      const isFs = document.fullscreenElement === container;
      setIsFullscreen(isFs);
      if (!isFs && isReady) {
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onClose, isReady]);

  // Exit fullscreen on unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (err) {
      console.log('Fullscreen toggle failed');
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="relative w-screen h-screen flex items-center justify-center overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top controls */}
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg hover:bg-zinc-800 transition-all duration-200 cursor-pointer border border-zinc-700/50"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-zinc-300" />
            ) : (
              <Maximize2 className="w-4 h-4 text-zinc-300" />
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg hover:bg-zinc-800 transition-all duration-200 cursor-pointer border border-zinc-700/50"
          >
            <X className="w-4 h-4 text-zinc-300" />
          </button>
        </div>

        {/* Full screen image - centered */}
        <div className="flex items-center justify-center w-full h-full p-4">
          <img
            src={frame.dataUrl}
            alt="Preview"
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            style={{
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 120px)'
            }}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-zinc-700/50">
          <span className="text-sm text-zinc-300 font-mono">
            {(frame.timestamp / 1000).toFixed(2)}s
          </span>
          <div className="w-px h-4 bg-zinc-700" />
          <button
            onClick={() => onDownload(frame)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">下载</span>
          </button>
        </div>
      </div>
    </div>
  );
}
