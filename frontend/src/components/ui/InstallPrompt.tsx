import React, { useState, useEffect } from 'react';
import { Download, BellRing, WifiOff, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for the standard PWA install prompt event (Android/Desktop)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standalone) {
        setShowPrompt(true);
      }
    });

    // If it's iOS and not standalone, show the prompt manually after a delay
    if (ios && !standalone) {
      const timer = setTimeout(() => {
        const hasDismissed = localStorage.getItem('dismissedInstallPrompt');
        // The user wants it to be prominent and show every time they visit if they haven't installed it,
        // but it's good UX to allow them to dismiss it for the session. We'll show it every load if not installed.
        if (!hasDismissed) {
          setShowPrompt(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Chrome / Edge
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // For iOS, they just need to tap the share button
      alert("To install: Tap the Share button at the bottom of Safari, then scroll down and tap 'Add to Home Screen'.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Optional: Save to localStorage so it doesn't annoy them constantly in the same session
    sessionStorage.setItem('dismissedInstallPrompt', 'true');
  };

  // If installed or not showing, render nothing
  if (!showPrompt || isStandalone || sessionStorage.getItem('dismissedInstallPrompt')) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border border-primary/20">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 bg-surface rounded-full text-muted hover:text-text transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
            <img src="/favicon.svg" alt="Islamic Hub" className="w-12 h-12" />
          </div>
          
          <h2 className="text-2xl font-bold text-text mb-2">Install Islamic Hub</h2>
          <p className="text-subtext text-sm mb-6">
            Get the full app experience directly on your home screen.
          </p>

          <div className="space-y-4 w-full text-left mb-8">
            <div className="flex items-center gap-4 bg-surface p-3 rounded-2xl">
              <div className="bg-primary/20 p-2 rounded-xl text-primary"><BellRing size={20} /></div>
              <div>
                <p className="font-bold text-text text-sm">Push Notifications</p>
                <p className="text-xs text-muted">Get timely Namaz alerts (iOS requires install).</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-surface p-3 rounded-2xl">
              <div className="bg-success/20 p-2 rounded-xl text-success"><WifiOff size={20} /></div>
              <div>
                <p className="font-bold text-text text-sm">Offline Quran</p>
                <p className="text-xs text-muted">Read without internet access.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleInstallClick}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
          >
            <Download size={20} />
            Install App Now
          </button>
          
          {isIOS && (
            <p className="text-xs text-muted mt-4">
              Tap <span className="inline-block p-1 bg-surface rounded">Share</span> then <span className="inline-block p-1 bg-surface rounded">Add to Home Screen</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
