import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Chrome, Globe, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { checkEnvironment, getBrowserInfo, getSolutionUrl, type EnvCheckResult } from '../utils/envCheck';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';

export function EnvironmentCheck() {
  const { currentLanguage } = useLanguage();
  const [envCheck, setEnvCheck] = useState<EnvCheckResult | null>(null);
  const [browserInfo, setBrowserInfo] = useState({ name: '', version: '', os: '' });
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const t = (key: string) => {
    const langData = (translations as any)[currentLanguage]?.envCheck || (translations as any)['en']?.envCheck || {};
    return langData[key] || (translations as any)['en']?.envCheck?.[key] || key;
  };

  useEffect(() => {
    const check = checkEnvironment();
    setEnvCheck(check);
    setBrowserInfo(getBrowserInfo());
  }, []);

  if (!envCheck) return null;

  // 环境支持，不显示遮罩
  if (envCheck.isSupported) {
    // 如果有警告，显示一个小提示
    if (envCheck.warnings.length > 0 && isVisible) {
      const hasSharedArrayBufferWarning = envCheck.warnings.includes('SharedArrayBuffer');
      const hasWebWorkerWarning = envCheck.warnings.includes('Web Worker');
      
      return (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-200 flex-1">
                <p className="font-medium mb-1">{t('performanceTip')}</p>
                {hasSharedArrayBufferWarning && (
                  <p>{t('sharedArrayBufferWarning')}</p>
                )}
                {hasWebWorkerWarning && (
                  <p>{t('webWorkerWarning')}</p>
                )}
                {!hasSharedArrayBufferWarning && !hasWebWorkerWarning && (
                  <p>{t('crossOriginWarning')}</p>
                )}
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors flex-shrink-0"
                title="关闭提示"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600/20 to-orange-600/20 border-b border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('browserNotSupported')}</h2>
              <p className="text-sm text-slate-400">{t('browserNotSupportedDesc')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Browser Info */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">{t('currentBrowser')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <Chrome className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <p className="text-white font-medium">{browserInfo.name} {browserInfo.version}</p>
                <p className="text-xs text-slate-400">{browserInfo.os}</p>
              </div>
            </div>
          </div>

          {/* Missing Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              {t('missingFeatures')}
            </h3>
            <div className="space-y-2">
              {envCheck.missingFeatures.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                >
                  <span className="text-sm text-rose-200">{feature}</span>
                  <a
                    href={getSolutionUrl(feature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-rose-400 hover:text-rose-300 underline"
                  >
                    {t('learnMore')}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {t('recommendedSolutions')}
            </h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">1.</span>
                <span>{t('solution1')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">2.</span>
                <span>{t('solution2')}</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">3.</span>
                <span>{t('solution3')}</span>
              </p>
            </div>
          </div>

          {/* Technical Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-left text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showDetails ? t('hideDetails') : t('showDetails')}{t('technicalDetails')}
          </button>

          {showDetails && (
            <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-slate-400 overflow-x-auto">
              <p>User Agent: {navigator.userAgent}</p>
              <p>crossOriginIsolated: {window.crossOriginIsolated?.toString()}</p>
              <p>SharedArrayBuffer: {typeof SharedArrayBuffer}</p>
              <p>Worker: {typeof Worker}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 p-4 bg-slate-900/50">
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              {t('refreshRetry')}
            </button>
            <a
              href="https://www.google.cn/chrome/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl transition-all text-sm font-medium"
            >
              <Chrome className="w-4 h-4" />
              {t('downloadChrome')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
