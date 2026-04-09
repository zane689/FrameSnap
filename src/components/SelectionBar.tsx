import { useState } from 'react';
import { CheckSquare, Square, Loader2, Sparkles, Trash2, Download } from 'lucide-react';
import JSZip from 'jszip';
import type { Frame } from './Gallery';
import { generateAndDownloadLongImage } from '../utils/longImageGenerator';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();
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
      alert(t('selectionBar.select3To9') as string);
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
      alert('Failed to generate long image, please try again');
    } finally {
      setGeneratingLongImage(false);
    }
  };

  const canGenerateLongImage = selectedCount >= 3 && selectedCount <= 9;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-3xl">
      <div className="relative premium-card rounded-3xl shadow-strong overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/5 via-zinc-500/5 to-zinc-500/5 pointer-events-none" />
        
        {/* Selection Count */}
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 px-5 sm:px-6 py-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-500 to-zinc-600 rounded-2xl blur-lg opacity-30" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-600 border border-zinc-400/30 flex items-center justify-center shadow-soft">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-100 whitespace-nowrap">
                  {(t('selectionBar.selected') as string)} <span className="text-zinc-400 font-bold text-xl">{selectedCount}</span> {(t('selectionBar.items') as string)}
                </span>
                <p className="text-xs text-zinc-500 whitespace-nowrap">{selectedCount === frames.length ? (t('selectionBar.allSelected') as string) : `${t('selectionBar.total') as string} ${frames.length} ${t('gallery.frames') as string}`}</p>
              </div>
            </div>
            
            {/* Mobile clear button */}
            <button
              onClick={onClearSelection}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-600 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <Square className="w-3.5 h-3.5" />
              {(t('selectionBar.clear') as string)}
            </button>
          </div>

          <div className="hidden sm:block w-px h-12 bg-zinc-700" />

          {/* Actions */}
          <div className="relative grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2 flex-1">
            {/* 生成电影感长图按钮 */}
            <button
              onClick={handleGenerateLongImage}
              disabled={generatingLongImage || !canGenerateLongImage}
              title={canGenerateLongImage ? (t('selectionBar.movieLongImage') as string) : (t('selectionBar.select3To9') as string)}
              className={`
                relative group flex items-center justify-center gap-1 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-semibold rounded-lg transition-all duration-200 overflow-hidden cursor-pointer whitespace-nowrap
                ${canGenerateLongImage
                  ? 'bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-300 text-zinc-900 hover:from-zinc-200 hover:via-zinc-300 hover:to-zinc-400 shadow-soft hover:shadow-medium hover:scale-105'
                  : 'text-zinc-500 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                }
                disabled:opacity-60
              `}
            >
              {canGenerateLongImage && (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-400 via-zinc-400 to-zinc-400 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
              )}
              {generatingLongImage ? (
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin flex-shrink-0" />
              ) : (
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              )}
              <span className="truncate">{generatingLongImage ? (t('selectionBar.generating') as string) : (t('selectionBar.movieLongImage') as string)}</span>
            </button>

            {/* 下载按钮 */}
            <button
              onClick={handleDownloadSelected}
              className="relative group flex items-center justify-center gap-1 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-semibold text-zinc-900 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-200 hover:from-zinc-200 hover:to-zinc-300 transition-all duration-200 shadow-soft hover:shadow-medium hover:scale-105 overflow-hidden cursor-pointer whitespace-nowrap"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-400 via-zinc-400 to-zinc-400 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
              <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{(t('selectionBar.downloadSelected') as string)}</span>
            </button>

            {/* 删除按钮 */}
            <button
              onClick={handleDeleteSelected}
              className="relative group flex items-center justify-center gap-1 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-semibold text-zinc-400 hover:text-zinc-300 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{(t('selectionBar.deleteSelected') as string)}</span>
            </button>

            {/* 清空按钮 */}
            <button
              onClick={onClearSelection}
              className="relative group flex items-center justify-center gap-1 px-2 sm:px-3 py-2 text-[10px] sm:text-xs font-semibold text-zinc-400 hover:text-zinc-300 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{(t('selectionBar.clearSelection') as string)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
