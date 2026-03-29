import { useState } from 'react';
import { Download, Trash2, Image, Package, X, Grid3X3, List, Check } from 'lucide-react';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === frames.length && frames.length > 0;

  const downloadFrame = (frame: Frame) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = `${frame.videoName}_frame_${frame.timestamp.toFixed(0)}ms.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      link.download = `frames_${frames[0]?.videoName || 'export'}_${Date.now()}.zip`;
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
    return null;
  }

  return (
    <div className="mt-6 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-800 overflow-hidden">
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-slate-800/50 gap-3">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium text-slate-300">
            已提取 {frames.length} 帧
          </span>
          <div className="flex items-center gap-1 ml-2 bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="网格视图"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadAllAsZip}
            disabled={downloading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-lg transition-all disabled:opacity-50"
          >
            <Package className="w-3.5 h-3.5" />
            {downloading ? '打包中...' : '下载全部'}
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">清空</span>
          </button>
        </div>
      </div>

      {/* Thumbnails - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-4 max-h-[400px] overflow-y-auto">
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
                    relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? 'border-blue-500 shadow-lg shadow-blue-500/25'
                      : hoveredId === frame.id
                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/25 scale-105'
                        : 'border-slate-700'
                    }
                  `}
                  onClick={() => onToggleSelect(frame.id)}
                >
                  <img
                    src={frame.dataUrl}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Checkbox */}
                  <div
                    className={`
                      absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                      ${isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-black/60 border-white/50 group-hover:border-white'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(frame.id);
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Frame Number */}
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-mono">
                    {index + 1}
                  </div>

                  {/* Overlay on hover - show actions (desktop only) */}
                  {hoveredId === frame.id && !isSelected && (
                    <div className="hidden md:flex absolute inset-0 bg-slate-900/60 items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFrame(frame);
                        }}
                        className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 transition-colors"
                        title="下载"
                      >
                        <Download className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFrame(frame.id);
                        }}
                        className="p-1 rounded bg-rose-600 hover:bg-rose-500 transition-colors"
                        title="删除"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}

                  {/* Mobile action buttons */}
                  <div className="flex md:hidden absolute bottom-1 right-1 gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFrame(frame);
                      }}
                      className="p-1.5 rounded bg-indigo-600/90 hover:bg-indigo-500 transition-colors"
                      title="下载"
                    >
                      <Download className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFrame(frame.id);
                      }}
                      className="p-1.5 rounded bg-rose-600/90 hover:bg-rose-500 transition-colors"
                      title="删除"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>

                {/* Timestamp label */}
                <div className="mt-1 text-center">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(frame.timestamp / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 sticky top-0">
              <tr>
                <th className="px-2 py-2 text-center">
                  <button
                    onClick={isAllSelected ? onClearSelection : onSelectAll}
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center transition-all mx-auto
                      ${isAllSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500 hover:border-white'}
                    `}
                  >
                    {isAllSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">序号</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">预览</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">时间戳</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {frames.map((frame, index) => {
                const isSelected = selectedIds.has(frame.id);
                return (
                  <tr
                    key={frame.id}
                    className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${isSelected ? 'bg-blue-500/10' : ''}`}
                    onClick={() => onToggleSelect(frame.id)}
                  >
                    <td className="px-2 py-2 text-center">
                      <div
                        className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-all mx-auto
                          ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500 hover:border-white'}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(frame.id);
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-400 font-mono">{String(index + 1).padStart(3, '0')}</td>
                    <td className="px-4 py-2">
                      <img
                        src={frame.dataUrl}
                        alt={`Frame ${index + 1}`}
                        className={`w-16 h-9 object-cover rounded border-2 ${isSelected ? 'border-blue-500' : 'border-slate-700'}`}
                      />
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-mono">
                      {(frame.timestamp / 1000).toFixed(3)}s
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFrame(frame);
                          }}
                          className="p-1.5 rounded bg-slate-800 hover:bg-indigo-600 transition-colors"
                          title="下载"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFrame(frame.id);
                          }}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-600 transition-colors"
                          title="删除"
                        >
                          <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
