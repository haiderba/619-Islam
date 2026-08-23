import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import WhatsNewModal from './WhatsNewModal';
import { useAppUpdate } from '../../context/UpdateContext';

const PWAUpdatePrompt: React.FC = () => {
  const {
    updateAvailable,
    applyingUpdate,
    applyUpdate,
    dismissUpdate,
    showWhatsNew,
    setShowWhatsNew,
    currentVersion,
    serverVersion,
  } = useAppUpdate();

  return (
    <>
      {/* 🌟 On-Screen Update Modal when a new version is detected */}
      {updateAvailable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-primary/40 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
            
            <button
              onClick={dismissUpdate}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface hover:bg-border text-subtext hover:text-text transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Sparkles size={32} className="text-amber-400 animate-pulse" />
            </div>

            <h3 className="text-lg font-black text-text tracking-tight mb-1.5">
              New Update Available!
            </h3>
            
            <p className="text-xs text-subtext leading-relaxed mb-6">
              A new version of <strong>619 Islam</strong> (v{serverVersion || currentVersion}) is ready with new features and enhancements.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={applyUpdate}
                disabled={applyingUpdate}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm disabled:opacity-75"
              >
                <RefreshCw size={16} className={applyingUpdate ? "animate-spin" : ""} />
                <span>{applyingUpdate ? 'Updating App...' : 'Update App'}</span>
              </button>

              <button
                onClick={dismissUpdate}
                className="w-full py-2.5 text-xs text-subtext hover:text-text font-semibold transition-colors"
              >
                Remind Me Later
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📖 "What's New" Guide Modal (shown automatically after updating) */}
      <WhatsNewModal 
        isOpen={showWhatsNew} 
        onClose={() => setShowWhatsNew(false)} 
      />
    </>
  );
};

export default PWAUpdatePrompt;
