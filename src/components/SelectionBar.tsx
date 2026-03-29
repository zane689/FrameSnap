import { useState } from 'react';
import { Package, X, CheckSquare, Square, Film, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import type { Frame } from './Gallery';
import { generateAndDownloadLongImage } from '../utils/longImageGenerator';

interface SelectionBarProps {
  frames: Frame[];
  selectedIds: Set<string>;
  onClearSelection: () => void;
  onUpdateFrames: (frames: Frame[]) => void;
  videoFileName?: string;
}

export function SelectionBar({
  frames,
  selectedIds,
  onClearSelection,
  onUpdateFrames,
  videoFileName = 'video'
}: SelectionBarProps) {
  const selectedCount = selectedIds.size;
  const [generatingLongImage, setGeneratingLongImage] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleDownloadSelected = async () => {
    if (selectedCount === 0) return;

    const selectedFrames = frames.filter(f => selectedIds.has(f.id));
    
    try {
      const zip = new JSZip();
      const folder = zip.folder('selected_frames');

      selectedFrames.forEach((frame, index) => {
        const base64Data = frame.dataUrl.split(',')[1];
        const fileName = `${String(index + 1).padStart(3, '0')}_${frame.videoName}_frame_${frame.timestamp.toFixed(0)}ms.png`;
        folder?.file(fileName, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `selected_frames_${selectedCount}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to create zip:', error);
    }
  };

  const handleDeleteSelected = () => {
    const remainingFrames = frames.filter(f => !selectedIds.has(f.id));
    onUpdateFrames(remainingFrames);
    onClearSelection();
  };

  const handleGenerateLongImage = async () => {
    if (selectedCount < 3 || selectedCount > 9) {
      alert('请选择 3-9 张图片来生成电影感长图');
      return;
    }

    setGeneratingLongImage(true);
    try {
      const selectedFrames = frames.filter(f => selectedIds.has(f.id));
      await generateAndDownloadLongImage(selectedFrames, videoFileName, {
        gap: 4,
        targetWidth: 800,
      });
    } catch (error) {
      console.error('Failed to generate long image:', error);
      alert('生成长图失败，请重试');
    } finally {
      setGeneratingLongImage(false);
    }
  };

  const canGenerateLongImage = selectedCount >= 3 && selectedCount <= 9;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl shadow-black/50">
        {/* Selection Count */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-200">
              已选 <span className="text-blue-400 font-bold">{selectedCount}</span> 项
            </span>
          </div>
          {/* Mobile clear button */}
          <button
            onClick={onClearSelection}
            className="sm:hidden flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-all"
          >
            <Square className="w-3 h-3" />
            清空
          </button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-slate-700" />

        {/* Actions */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* 生成电影感长图按钮 */}
          <button
            onClick={handleGenerateLongImage}
            disabled={generatingLongImage || !canGenerateLongImage}
            title={canGenerateLongImage ? '生成电影感长图' : '请选择 3-9 张图片'}
            className={`
              flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-xl transition-all
              ${canGenerateLongImage
                ? 'text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-orange-500/25'
                : 'text-slate-500 bg-slate-800 cursor-not-allowed'
              }
              disabled:opacity-70
            `}
          >
            {generatingLongImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Film className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{generatingLongImage ? '生成中...' : '电影长图'}</span>
            <span className="sm:hidden">长图</span>
          </button>

          <button
            onClick={handleDownloadSelected}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">打包下载</span>
            <span className="sm:hidden">下载</span>
          </button>

          <button
            onClick={handleDeleteSelected}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">删除选中</span>
            <span className="sm:hidden">删除</span>
          </button>

          <button
            onClick={onClearSelection}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
          >
            <Square className="w-4 h-4" />
            清空
          </button>
        </div>
      </div>
    </div>
  );
}
