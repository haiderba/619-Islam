import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Sparkles, RefreshCw } from 'lucide-react';

const PWAUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Periodic check for SW updates every 15 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 15 * 60 * 1000);
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

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top-4 duration-300">
      <div className="bg-primary/95 text-white backdrop-blur-xl border border-white/20 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold leading-tight">Update Available!</h4>
            <p className="text-[11px] text-white/80 truncate">New features & improvements are ready.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setNeedRefresh(false)}
            className="px-2.5 py-1.5 text-xs text-white/80 hover:text-white font-medium transition-colors"
          >
            Later
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-lg hover:bg-amber-300 active:scale-95 transition-all"
          >
            <RefreshCw size={13} className="shrink-0" />
            <span>Update</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
