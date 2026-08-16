import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import WhatsNewModal from './WhatsNewModal';
import { CURRENT_APP_VERSION } from '../../config/changelog';

const PWAUpdatePrompt: React.FC = () => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Periodic check for SW updates every 10 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 10 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  // Check for updates when app is reopened / focused
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  // Check if we just updated and should show the "What's New" guide
  useEffect(() => {
    const shouldShowGuide = localStorage.getItem('show_whats_new_after_update');
    const lastSeenVersion = localStorage.getItem('last_seen_app_version');

    if (shouldShowGuide === 'true' || (lastSeenVersion && lastSeenVersion !== CURRENT_APP_VERSION)) {
      setShowWhatsNew(true);
      localStorage.removeItem('show_whats_new_after_update');
      localStorage.setItem('last_seen_app_version', CURRENT_APP_VERSION);
    }
  }, []);

  const handleApplyUpdate = async () => {
    try {
      // Mark flag so that after page reload, the What's New modal automatically pops up
      localStorage.setItem('show_whats_new_after_update', 'true');
      localStorage.setItem('last_seen_app_version', CURRENT_APP_VERSION);
      
      // Flush service worker and reload
      await updateServiceWorker(true);
    } catch (err) {
      window.location.reload();
    }
  };

  return (
    <>
      {/* 🌟 Prominent "New Update Available" Popup Modal */}
      {needRefresh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-primary/40 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setNeedRefresh(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface hover:bg-border text-subtext hover:text-text transition-colors"
            >
              <X size={16} />
            </button>

            {/* Sparkle Icon */}
            <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Sparkles size={32} className="text-amber-400 animate-pulse" />
            </div>

            <h3 className="text-lg font-black text-text tracking-tight mb-1.5">
              New Update Available!
            </h3>
            
            <p className="text-xs text-subtext leading-relaxed mb-6">
              A new version of <strong>619 Islam</strong> (v{CURRENT_APP_VERSION}) is ready with new features and performance enhancements.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleApplyUpdate}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
              >
                <RefreshCw size={16} className="animate-spin-slow" />
                <span>Update App Now</span>
              </button>

              <button
                onClick={() => setNeedRefresh(false)}
                className="w-full py-2.5 text-xs text-subtext hover:text-text font-semibold transition-colors"
              >
                Remind Me Later
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📖 "What's New" Guide Modal (shown immediately after update refresh) */}
      <WhatsNewModal 
        isOpen={showWhatsNew} 
        onClose={() => setShowWhatsNew(false)} 
      />
    </>
  );
};

export default PWAUpdatePrompt;
