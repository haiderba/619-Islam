import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { CURRENT_APP_VERSION } from '../config/changelog';

interface UpdateContextType {
  updateAvailable: boolean;
  applyingUpdate: boolean;
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  checkForUpdates: () => Promise<boolean>;
  showWhatsNew: boolean;
  setShowWhatsNew: (show: boolean) => void;
  currentVersion: string;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [applyingUpdate, setApplyingUpdate] = useState(false);
  const [manualUpdateAvailable, setManualUpdateAvailable] = useState(false);

  useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Immediate check on register + periodic check every 5 minutes
        r.update();
        setInterval(() => {
          r.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  // Active Live Version Check function
  const checkLiveVersion = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const serverVersion = data.version;
        const dismissedVersion = sessionStorage.getItem('dismissed_update_version');
        const appliedVersion = localStorage.getItem('applied_update_version');

        // Only trigger update prompt if server has a newer version AND user hasn't already dismissed/applied it in this session
        if (serverVersion && serverVersion !== CURRENT_APP_VERSION && serverVersion !== dismissedVersion && serverVersion !== appliedVersion) {
          console.log(`[UpdateContext] New version detected: ${serverVersion} (current: ${CURRENT_APP_VERSION})`);
          setManualUpdateAvailable(true);
          
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => reg?.update());
          }
          return true;
        }
      }
    } catch (e) {
      // Network offline or failed
    }
    return false;
  };

  // Poll for updates on load, focus, and every 60s
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkLiveVersion();
    }, 3000);

    const interval = setInterval(() => {
      checkLiveVersion();
    }, 60 * 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkLiveVersion();
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg) reg.update();
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  // Show "What's New" guide right after an update reload
  useEffect(() => {
    const shouldShowGuide = localStorage.getItem('show_whats_new_after_update');
    const lastSeenVersion = localStorage.getItem('last_seen_app_version');

    if (shouldShowGuide === 'true' || (lastSeenVersion && lastSeenVersion !== CURRENT_APP_VERSION)) {
      setShowWhatsNew(true);
      localStorage.removeItem('show_whats_new_after_update');
      localStorage.setItem('last_seen_app_version', CURRENT_APP_VERSION);
    }
  }, []);

  const applyUpdate = async () => {
    setApplyingUpdate(true);
    setManualUpdateAvailable(false);
    try {
      localStorage.setItem('show_whats_new_after_update', 'true');
      localStorage.setItem('last_seen_app_version', CURRENT_APP_VERSION);
      localStorage.setItem('applied_update_version', CURRENT_APP_VERSION);
      sessionStorage.setItem('dismissed_update_version', CURRENT_APP_VERSION);
      
      // Clear caches and reload
      if ('caches' in window) {
        try {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
        } catch (e) {}
      }

      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            await reg.update();
          }
        } catch (e) {}
      }

      window.location.reload();
    } catch (err) {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setManualUpdateAvailable(false);
    sessionStorage.setItem('dismissed_update_version', CURRENT_APP_VERSION);
    localStorage.setItem('applied_update_version', CURRENT_APP_VERSION);
  };

  const checkForUpdates = async (): Promise<boolean> => {
    const isNew = await checkLiveVersion();
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) await reg.update();
      } catch (e) {
        console.error(e);
      }
    }
    return isNew;
  };

  return (
    <UpdateContext.Provider
      value={{
        updateAvailable: manualUpdateAvailable,
        applyingUpdate,
        applyUpdate,
        dismissUpdate,
        checkForUpdates,
        showWhatsNew,
        setShowWhatsNew,
        currentVersion: CURRENT_APP_VERSION,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useAppUpdate = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    throw new Error('useAppUpdate must be used within an UpdateProvider');
  }
  return context;
};
