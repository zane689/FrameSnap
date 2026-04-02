import { useState } from 'react';
import { CheckSquare, Square, Loader2, Sparkles, Trash2, Download } from 'lucide-react';
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
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-xl">
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />
        
        {/* Selection Count */}
        <div className="relative flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-xl" />
              <div className="relative w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-300">
                已选 <span className="text-indigo-400 font-bold text-xl">{selectedCount}</span> 项
              </span>
              <p className="text-xs text-slate-500">{selectedCount === frames.length ? '已全选' : `共 ${frames.length} 帧`}</p>
            </div>
          </div>
          
          {/* Mobile clear button */}
          <button
            onClick={onClearSelection}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
          >
            <Square className="w-3.5 h-3.5" />
            清空
          </button>
        </div>

        <div className="hidden sm:block w-px h-12 bg-slate-700/50" />

        {/* Actions */}
        <div className="relative grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* 生成电影感长图按钮 */}
          <button
            onClick={handleGenerateLongImage}
            disabled={generatingLongImage || !canGenerateLongImage}
            title={canGenerateLongImage ? '生成电影感长图' : '请选择 3-9 张图片'}
            className={`
              relative group flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 overflow-hidden
              ${canGenerateLongImage
                ? 'text-white bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105'
                : 'text-slate-500 bg-slate-800/80 border border-slate-700 cursor-not-allowed'
              }
              disabled:opacity-60
            `}
          >
            {canGenerateLongImage && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            )}
            {generatingLongImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{generatingLongImage ? '生成中...' : '电影长图'}</span>
            <span className="sm:hidden">长图</span>
          </button>

          {/* 打包下载按钮 */}
          <button
            onClick={handleDownloadSelected}
            className="relative group flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">打包下载</span>
            <span className="sm:hidden">下载</span>
          </button>

          {/* 删除选中按钮 */}
          <button
            onClick={handleDeleteSelected}
            className="relative group flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-rose-300 hover:text-rose-200 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all duration-300 hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">删除选中</span>
            <span className="sm:hidden">删除</span>
          </button>

          {/* 清空选择按钮 (桌面端) */}
          <button
            onClick={onClearSelection}
            className="hidden sm:flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:scale-105"
          >
            <Square className="w-4 h-4" />
            清空
          </button>
        </div>
      </div>
    </div>
  );
}
