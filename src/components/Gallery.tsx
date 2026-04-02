import { useState, useCallback } from 'react';
import { Image, Grid3X3, List, Trash2, Check, Download, X, Square, CheckSquare, Layers, Maximize2, Package } from 'lucide-react';
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
      <div className="w-full max-w-[1200px] mx-auto mt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-800/50 p-12">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative text-center">
            <div className="inline-flex mb-6">
              <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <Layers className="w-10 h-10 text-slate-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">暂无提取的帧</h3>
            <p className="text-slate-500">上传视频并点击"提取全部帧"开始</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-8 animate-fly-in">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl mb-4 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full" />
            <div className="relative p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
              <Image className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200">
              已提取 <span className="text-indigo-400 font-bold text-lg">{frames.length}</span> 帧
            </span>
            <p className="text-xs text-slate-500">点击缩略图选择，支持多选</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 ml-2 bg-slate-800/80 rounded-xl p-1 border border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="网格视图"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-300 hover:scale-105"
          >
            {selectedIds.size === frames.length ? (
              <>
                <Square className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">取消全选</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-300">全选</span>
              </>
            )}
          </button>

          <div className="w-px h-8 bg-slate-700/50" />

          <button
            onClick={downloadAllAsZip}
            disabled={downloading}
            className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity" />
            <Package className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">
              {downloading ? '打包中...' : '下载全部'}
            </span>
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all duration-300 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">清空</span>
          </button>
        </div>
      </div>

      {/* Thumbnails - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 max-h-[500px] overflow-y-auto">
          {frames.map((frame, index) => {
            const isSelected = selectedIds.has(frame.id);
            return (
              <div
                key={frame.id}
                className="relative group animate-fly-in"
                style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
                onMouseEnter={() => setHoveredId(frame.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={`
                    relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer
                    ${isSelected
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.02]'
                      : hoveredId === frame.id
                        ? 'border-indigo-400/50 shadow-xl shadow-indigo-500/20 scale-[1.03]'
                        : 'border-slate-700/50 hover:border-slate-600'
                    }
                  `}
                  onClick={() => onToggleSelect(frame.id)}
                >
                  {/* Selection glow */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-indigo-500/10 z-10 pointer-events-none" />
                  )}

                  <img
                    src={frame.dataUrl}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Checkbox */}
                  <div
                    className={`
                      absolute top-2 left-2 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 z-20
                      ${isSelected
                        ? 'bg-indigo-500 border-indigo-500 shadow-lg'
                        : 'bg-black/60 border-white/50 group-hover:border-white group-hover:bg-black/80'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(frame.id);
                    }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  {/* Frame Number */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-[10px] text-white font-mono font-semibold z-20">
                    #{index + 1}
                  </div>

                  {/* Preview button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFrame(frame);
                    }}
                    className="absolute bottom-2 right-2 p-1.5 bg-slate-900/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-500 z-20"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </button>

                  {/* Desktop hover actions */}
                  <div className="hidden md:flex absolute inset-0 bg-slate-900/70 backdrop-blur-sm items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFrame(frame);
                      }}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 hover:scale-110 shadow-lg"
                      title="下载"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frame.id);
                      }}
                      className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 transition-all duration-300 hover:scale-110 shadow-lg"
                      title="删除"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Mobile action buttons */}
                  <div className="flex md:hidden absolute bottom-2 left-2 gap-1.5 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFrame(frame);
                      }}
                      className="p-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 transition-all shadow-lg"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frame.id);
                      }}
                      className="p-2 rounded-lg bg-rose-600/90 hover:bg-rose-500 transition-all shadow-lg"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Timestamp label */}
                <div className="mt-2 text-center">
                  <span className="text-[11px] text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded-lg">
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
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden max-h-[500px] overflow-y-auto">
          {frames.map((frame, index) => {
            const isSelected = selectedIds.has(frame.id);
            return (
              <div
                key={frame.id}
                className={`
                  flex items-center gap-4 p-4 border-b border-slate-800/50 last:border-b-0 transition-all duration-300 cursor-pointer
                  ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-slate-800/30'}
                `}
                onClick={() => onToggleSelect(frame.id)}
              >
                {/* Checkbox */}
                <div
                  className={`
                    w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                    ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 hover:border-slate-400'}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(frame.id);
                  }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Thumbnail */}
                <div className="w-24 h-14 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                  <img src={frame.dataUrl} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-300">帧 #{index + 1}</p>
                  <p className="text-xs text-slate-500 font-mono">{(frame.timestamp / 1000).toFixed(2)}s</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFrame(frame);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition-all"
                  >
                    <Download className="w-4 h-4 text-slate-400 hover:text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFrame(frame.id);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-white" />
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
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setPreviewFrame(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewFrame(null)}
              className="absolute -top-12 right-0 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img 
              src={previewFrame.dataUrl} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-2xl border border-slate-700 shadow-2xl"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700">
              <span className="text-sm text-slate-300 font-mono">
                {(previewFrame.timestamp / 1000).toFixed(2)}s
              </span>
              <div className="w-px h-4 bg-slate-700" />
              <button
                onClick={() => downloadFrame(previewFrame)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
              >
                <Download className="w-4 h-4 text-white" />
                <span className="text-sm text-white">下载</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
