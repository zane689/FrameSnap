import { useState, useCallback, useMemo } from 'react';
import { 
  Clock, 
  Film, 
  Gauge, 
  KeyRound, 
  Scissors, 
  Target,
  Play,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type ExtractMode = 'timeInterval' | 'frameInterval' | 'fixedFps' | 'keyframe' | 'timeRange' | 'precise';

export interface ExtractConfig {
  mode: ExtractMode;
  timeIntervalSeconds: number;
  frameInterval: number;
  targetFps: number;
  keyframeOnly: boolean;
  startTime: number;
  endTime: number;
  preciseTimestamps: number[];
  preciseFrameNumbers: number[];
}

interface ExtractionWizardProps {
  videoDuration: number;
  videoFps: number;
  totalFrames: number;
  onExtract: (config: ExtractConfig) => void;
  isExtracting: boolean;
  extractionProgress: number;
  onClose: () => void;
}

const MODE_ICONS = {
  timeInterval: Clock,
  frameInterval: Film,
  fixedFps: Gauge,
  keyframe: KeyRound,
  timeRange: Scissors,
  precise: Target,
};

export function ExtractionWizard({ videoDuration, videoFps, totalFrames, onExtract, isExtracting, extractionProgress, onClose }: ExtractionWizardProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMode, setSelectedMode] = useState<ExtractMode | null>(null);
  const [config, setConfig] = useState<ExtractConfig>({
    mode: 'timeInterval', timeIntervalSeconds: 1, frameInterval: 30, targetFps: 1, keyframeOnly: true,
    startTime: 0, endTime: videoDuration * 1000, preciseTimestamps: [], preciseFrameNumbers: [],
  });
  const [preciseInput, setPreciseInput] = useState('');
  const [preciseMode, setPreciseMode] = useState<'time' | 'frame'>('time');

  const estimatedFrames = useMemo(() => {
    if (!selectedMode) return 0;
    switch (selectedMode) {
      case 'timeInterval': return Math.floor(videoDuration / config.timeIntervalSeconds);
      case 'frameInterval': return Math.floor(totalFrames / config.frameInterval);
      case 'fixedFps': return Math.floor(videoDuration * config.targetFps);
      case 'keyframe': return Math.floor(videoDuration / 5);
      case 'timeRange': return Math.floor(((config.endTime - config.startTime) / 1000) / config.timeIntervalSeconds);
      case 'precise': return preciseMode === 'time' ? config.preciseTimestamps.length : config.preciseFrameNumbers.length;
      default: return 0;
    }
  }, [selectedMode, config, videoDuration, totalFrames, preciseMode]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
  };

  const formatShortTime = (s: number) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m > 0 ? t('videoPlayer.timeFormat', { minutes: m, seconds: sec }) : `${sec}${t('videoPlayer.seconds')}`;
  };

  const handleModeSelect = (modeId: ExtractMode) => {
    setSelectedMode(modeId);
    setConfig(prev => ({ ...prev, mode: modeId }));
  };

  const handleExtract = () => {
    if (selectedMode) onExtract({ ...config, mode: selectedMode });
  };

  const handlePreciseInput = useCallback(() => {
    if (!preciseInput.trim()) return;
    const values = preciseInput.split(/[,，\s]+/).map(v => v.trim()).filter(Boolean);
    if (preciseMode === 'time') {
      const timestamps = values.map(v => {
        if (v.includes(':')) {
          const parts = v.split(':').map(Number);
          if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
          if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
        }
        return parseFloat(v) * 1000;
      }).filter(t => !isNaN(t) && t >= 0 && t <= videoDuration * 1000);
      setConfig(prev => ({ ...prev, preciseTimestamps: timestamps }));
    } else {
      const frameNumbers = values.map(v => parseInt(v, 10)).filter(n => !isNaN(n) && n >= 0 && n < totalFrames);
      setConfig(prev => ({ ...prev, preciseFrameNumbers: frameNumbers }));
    }
  }, [preciseInput, preciseMode, videoDuration, totalFrames]);

  const steps = [
    { n: 1, label: t('wizard.step1') },
    { n: 2, label: t('wizard.step2') },
    { n: 3, label: t('wizard.step3') },
  ];

  const modes: ExtractMode[] = ['timeInterval', 'frameInterval', 'fixedFps', 'keyframe', 'timeRange', 'precise'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-2xl max-h-[95vh] sm:max-h-none bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-white">{t('wizard.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-5 px-4 sm:px-6 flex-shrink-0">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 sm:gap-3">
              <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full ${step === s.n ? 'bg-amber-500 text-white' : step > s.n ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                {step > s.n ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <span className="text-xs sm:text-sm font-bold">{s.n}</span>}
                <span className="text-xs sm:text-sm hidden sm:inline">{s.label}</span>
              </div>
              {i < 2 && <div className={`w-4 sm:w-8 h-0.5 ${step > s.n ? 'bg-green-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
          {/* Step 1: Mode Selection */}
          {step === 1 && (
            <div>
              <p className="text-sm text-zinc-400 text-center mb-5">{t('wizard.selectMode')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {modes.map((modeId) => {
                  const Icon = MODE_ICONS[modeId];
                  const isSelected = selectedMode === modeId;
                  const modeKey = `wizard.modes.${modeId}` as const;
                  return (
                    <button key={modeId} onClick={() => handleModeSelect(modeId)} disabled={isExtracting}
                      className={`relative flex flex-col items-center text-center p-5 rounded-xl border-2 transition-all ${isSelected ? 'bg-amber-500/20 border-amber-500' : 'bg-zinc-800/50 border-zinc-700/30 hover:border-zinc-600 hover:bg-zinc-800'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${isSelected ? 'bg-amber-500/20' : 'bg-zinc-700/50'}`}>
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                      </div>
                      <p className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{t(`${modeKey}.label`)}</p>
                      <p className="text-xs text-zinc-500">{t(`${modeKey}.desc`)}</p>
                      {isSelected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && selectedMode && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  {(() => {
                    const Icon = MODE_ICONS[selectedMode];
                    return <Icon className="w-5 h-5 text-amber-400" />;
                  })()}
                </div>
                <div>
                  <p className="font-bold text-white">{t(`wizard.modes.${selectedMode}.label`)}</p>
                  <p className="text-sm text-zinc-400">{t(`wizard.modes.${selectedMode}.detail`)}</p>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50">
                {/* Time Interval */}
                {selectedMode === 'timeInterval' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">{t('wizard.config.timeInterval')}</label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="0.1" max="10" step="0.1" value={Math.min(config.timeIntervalSeconds, 10)}
                          onChange={(e) => setConfig(p => ({ ...p, timeIntervalSeconds: parseFloat(e.target.value) }))}
                          disabled={isExtracting} className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-3 py-2">
                          <input type="number" min="0.1" max="60" step="0.1" value={config.timeIntervalSeconds}
                            onChange={(e) => setConfig(p => ({ ...p, timeIntervalSeconds: parseFloat(e.target.value) || 1 }))}
                            disabled={isExtracting} className="w-14 bg-transparent text-white text-center font-mono text-sm" />
                          <span className="text-zinc-500 text-sm">{t('videoPlayer.seconds')}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">{t('wizard.config.estimatedResult', { count: estimatedFrames })}</p>
                  </div>
                )}

                {/* Frame Interval */}
                {selectedMode === 'frameInterval' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">{t('wizard.config.frameInterval')}</label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="1" max={Math.min(120, totalFrames)} step="1" value={config.frameInterval}
                          onChange={(e) => setConfig(p => ({ ...p, frameInterval: parseInt(e.target.value) }))}
                          disabled={isExtracting} className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-3 py-2">
                          <input type="number" min="1" max={totalFrames} value={config.frameInterval}
                            onChange={(e) => setConfig(p => ({ ...p, frameInterval: parseInt(e.target.value) || 1 }))}
                            disabled={isExtracting} className="w-14 bg-transparent text-white text-center font-mono text-sm" />
                          <span className="text-zinc-500 text-sm">{t('wizard.frames')}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">{t('wizard.config.totalFrames', { count: totalFrames })}，{t('wizard.config.estimatedResult', { count: estimatedFrames })}</p>
                  </div>
                )}

                {/* Fixed FPS */}
                {selectedMode === 'fixedFps' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">{t('wizard.config.targetFps')}</label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="0.5" max="30" step="0.5" value={config.targetFps}
                          onChange={(e) => setConfig(p => ({ ...p, targetFps: parseFloat(e.target.value) }))}
                          disabled={isExtracting} className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-3 py-2">
                          <input type="number" min="0.1" max="60" step="0.1" value={config.targetFps}
                            onChange={(e) => setConfig(p => ({ ...p, targetFps: parseFloat(e.target.value) || 1 }))}
                            disabled={isExtracting} className="w-14 bg-transparent text-white text-center font-mono text-sm" />
                          <span className="text-zinc-500 text-sm">fps</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">{t('wizard.config.originalFps', { fps: videoFps.toFixed(1) })}，{t('wizard.config.estimatedResult', { count: estimatedFrames })}</p>
                  </div>
                )}

                {/* Keyframe */}
                {selectedMode === 'keyframe' && (
                  <div className="space-y-3">
                    <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <KeyRound className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-200 mb-1">{t('wizard.config.keyframeTitle')}</p>
                          <p className="text-xs text-amber-300/70">{t('wizard.config.keyframeDesc')}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">{t('wizard.config.estimatedKeyframes', { count: estimatedFrames })}</p>
                  </div>
                )}

                {/* Time Range */}
                {selectedMode === 'timeRange' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">{t('wizard.config.startTime')}</label>
                        <input type="text" value={formatTime(config.startTime)} onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes(':')) {
                            const parts = val.split(':').map(Number);
                            let ms = parts.length === 3 ? (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000 : parts.length === 2 ? (parts[0] * 60 + parts[1]) * 1000 : 0;
                            setConfig(p => ({ ...p, startTime: Math.max(0, Math.min(ms, p.endTime - 1000)) }));
                          }
                        }} disabled={isExtracting} className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm text-center" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">{t('wizard.config.endTime')}</label>
                        <input type="text" value={formatTime(config.endTime)} onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes(':')) {
                            const parts = val.split(':').map(Number);
                            let ms = parts.length === 3 ? (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000 : parts.length === 2 ? (parts[0] * 60 + parts[1]) * 1000 : 0;
                            setConfig(p => ({ ...p, endTime: Math.max(p.startTime + 1000, Math.min(ms, videoDuration * 1000)) }));
                          }
                        }} disabled={isExtracting} className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm text-center" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t('wizard.config.extractInterval')}</label>
                      <div className="flex items-center gap-2">
                        <input type="range" min="0.1" max="5" step="0.1" value={config.timeIntervalSeconds}
                          onChange={(e) => setConfig(p => ({ ...p, timeIntervalSeconds: parseFloat(e.target.value) }))}
                          disabled={isExtracting} className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                        <span className="text-zinc-300 w-12 text-right text-sm">{config.timeIntervalSeconds}{t('videoPlayer.seconds')}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">{t('wizard.config.segmentDuration', { duration: formatShortTime((config.endTime - config.startTime) / 1000) })}，{t('wizard.config.estimatedResult', { count: estimatedFrames })}</p>
                  </div>
                )}

                {/* Precise */}
                {selectedMode === 'precise' && (
                  <div className="space-y-4">
                    <div className="flex gap-1 p-1 bg-zinc-800 rounded-lg w-fit">
                      <button onClick={() => setPreciseMode('time')} className={`px-4 py-2 rounded-md text-sm font-medium ${preciseMode === 'time' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400'}`}>{t('wizard.config.byTimestamp')}</button>
                      <button onClick={() => setPreciseMode('frame')} className={`px-4 py-2 rounded-md text-sm font-medium ${preciseMode === 'frame' ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400'}`}>{t('wizard.config.byFrameNumber')}</button>
                    </div>
                    <textarea value={preciseInput} onChange={(e) => setPreciseInput(e.target.value)} onBlur={handlePreciseInput}
                      placeholder={preciseMode === 'time' ? t('wizard.config.inputTimestamps') : t('wizard.config.inputFrameNumbers')}
                      disabled={isExtracting} className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm h-20 resize-none" />
                    <p className="text-xs text-zinc-500">{preciseMode === 'time' ? t('wizard.config.timestampFormat') : `${t('wizard.config.frameRange')}: 0 - ${totalFrames - 1}`}</p>
                    <p className="text-xs text-zinc-500">{preciseMode === 'time' ? config.preciseTimestamps.length : config.preciseFrameNumbers.length} {t('wizard.frames')} {t('gallery.selected')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('wizard.confirmTitle')}</h3>
                <p className="text-sm text-zinc-400">{t('wizard.confirmDesc')}</p>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">{t('wizard.selectMode')}</span>
                  <span className="text-sm font-medium text-white">{selectedMode ? t(`wizard.modes.${selectedMode}.label`) : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">{t('wizard.videoDuration')}</span>
                  <span className="text-sm text-white">{formatShortTime(videoDuration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">{t('wizard.estimatedFrames')}</span>
                  <span className="text-lg font-bold text-amber-400">{estimatedFrames} {t('wizard.frames')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{t('wizard.privacyNote')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-800 bg-zinc-900/50 flex-shrink-0">
          <button onClick={() => step > 1 && setStep(p => (p - 1) as 1 | 2 | 3)}
            disabled={step === 1} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" /> {t('wizard.back')}
          </button>

          {step < 3 ? (
            <button onClick={() => selectedMode && setStep(p => (p + 1) as 1 | 2 | 3)}
              disabled={step === 1 && !selectedMode}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm">
              {t('wizard.next')} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleExtract} disabled={isExtracting || estimatedFrames === 0}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-xs sm:text-sm">
              {isExtracting ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('wizard.startExtract')} {extractionProgress}%
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t('wizard.startExtract')}
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {isExtracting && (
          <div className="h-1 bg-zinc-800">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${extractionProgress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
