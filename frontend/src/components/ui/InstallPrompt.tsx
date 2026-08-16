import React, { useState, useEffect } from 'react';
import { Download, BellRing, WifiOff, X, Sparkles, Share, PlusSquare, Smartphone } from 'lucide-react';

// Global singleton for the PWA beforeinstallprompt event
let globalDeferredPrompt: any = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    listeners.forEach((l) => l());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    listeners.forEach((l) => l());
  });
}

export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    checkStandalone();

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const updateState = () => {
      checkStandalone();
      setCanInstall(!!globalDeferredPrompt || ios);
    };

    updateState();
    listeners.add(updateState);
    return () => {
      listeners.delete(updateState);
    };
  }, []);

  const triggerInstall = async (onShowIOSGuide?: () => void) => {
    if (globalDeferredPrompt) {
      globalDeferredPrompt.prompt();
      const { outcome } = await globalDeferredPrompt.userChoice;
      if (outcome === 'accepted') {
        globalDeferredPrompt = null;
      }
    } else if (isIOS) {
      if (onShowIOSGuide) {
        onShowIOSGuide();
      }
    }
  };

  return { canInstall, isStandalone, isIOS, triggerInstall };
};

export const TopInstallButton: React.FC = () => {
  const { isStandalone, isIOS, triggerInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isStandalone) {
    return null; // Already running as installed app
  }

  const handleClick = () => {
    if (globalDeferredPrompt) {
      triggerInstall();
    } else {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all hover:scale-105"
        title="Install 619 Islam App on your device"
      >
        <Smartphone size={13} className="shrink-0" />
        <span className="text-[11px]">Install App</span>
      </button>

      {/* iOS / Manual Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card dark:bg-[#062426] border border-border dark:border-amber-500/40 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <Sparkles size={14} />
                <span>Install 619 Islam</span>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full bg-surface text-subtext hover:text-text"
              >
                <X size={16} />
              </button>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 p-2 flex items-center justify-center mx-auto border border-amber-500/30">
              <img src="/logo.png" alt="619 Islam" className="w-12 h-12 object-contain" />
            </div>

            <h3 className="text-base font-black text-text">
              Add to Home Screen
            </h3>
            <p className="text-xs text-subtext leading-relaxed">
              Install 619 Islam for fast 1-tap launch, offline Quran reading, and timely Namaz notifications.
            </p>

            <div className="space-y-2.5 text-left bg-surface/70 dark:bg-black/40 p-3.5 rounded-2xl border border-border text-xs">
              {isIOS ? (
                <>
                  <div className="flex items-center gap-2 text-text font-bold">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">1</span>
                    <span className="flex items-center gap-1">Tap the <strong>Share</strong> button <Share size={13} className="inline text-amber-400" /> in Safari</span>
                  </div>
                  <div className="flex items-center gap-2 text-text font-bold">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">2</span>
                    <span className="flex items-center gap-1">Scroll down & tap <strong>Add to Home Screen</strong> <PlusSquare size={13} className="inline text-amber-400" /></span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-text font-bold">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">1</span>
                    <span>Tap your browser's menu (<strong>⋮</strong> or <strong>Share</strong>)</span>
                  </div>
                  <div className="flex items-center gap-2 text-text font-bold">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">2</span>
                    <span>Select <strong>Install App</strong> or <strong>Add to Home Screen</strong></span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs active:scale-95 transition-all shadow-md shadow-amber-500/20"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const InstallPrompt: React.FC = () => {
  const { isStandalone, triggerInstall } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (isStandalone) return;

    const hasDismissed = sessionStorage.getItem('619_dismissed_install_prompt');
    if (!hasDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  const handleInstallClick = () => {
    if (globalDeferredPrompt) {
      triggerInstall();
      setShowPrompt(false);
    } else {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('619_dismissed_install_prompt', 'true');
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card dark:bg-[#062426] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border border-border dark:border-amber-500/30 space-y-4 text-center">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 bg-surface rounded-full text-muted hover:text-text transition-colors"
          title="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-20 h-20 bg-amber-500/15 rounded-3xl flex items-center justify-center mb-3 border border-amber-500/30">
            <img src="/logo.png" alt="619 Islam" className="w-14 h-14 object-contain drop-shadow" />
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={12} />
            <span>PWA Experience</span>
          </div>

          <h2 className="text-xl font-black text-text mt-0.5 mb-1">Install 619 Islam</h2>
          <p className="text-subtext text-xs mb-4 leading-relaxed">
            Install on your home screen for quick daily prayer alerts and full offline Quran access.
          </p>

          <div className="space-y-2.5 w-full text-left mb-6">
            <div className="flex items-center gap-3 bg-surface/70 dark:bg-black/40 p-3 rounded-2xl border border-border">
              <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400"><BellRing size={18} /></div>
              <div>
                <p className="font-black text-text text-xs">Push Notifications</p>
                <p className="text-[11px] text-muted">Get timely Namaz azan alerts directly.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-surface/70 dark:bg-black/40 p-3 rounded-2xl border border-border">
              <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400"><WifiOff size={18} /></div>
              <div>
                <p className="font-black text-text text-xs">100% Offline Ready</p>
                <p className="text-[11px] text-muted">Read Surahs and recite Tasbeeh anywhere.</p>
              </div>
            </div>
          </div>

          {!showIOSGuide ? (
            <div className="w-full space-y-2">
              <button 
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-xs"
              >
                <Download size={16} />
                <span>Install App Now</span>
              </button>

              <button
                onClick={handleDismiss}
                className="text-xs font-bold text-subtext hover:text-text py-1"
              >
                Maybe Later
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3 bg-surface/70 dark:bg-black/40 p-3.5 rounded-2xl border border-border text-xs text-left">
              <p className="font-black text-text">To install on iOS Safari:</p>
              <div className="space-y-1.5 text-subtext">
                <p>1. Tap the <strong>Share</strong> button <Share size={12} className="inline text-amber-400" /> at bottom</p>
                <p>2. Scroll down & tap <strong>Add to Home Screen</strong> <PlusSquare size={12} className="inline text-amber-400" /></p>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full mt-2 py-2 rounded-xl bg-amber-500 text-black font-black text-xs"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
