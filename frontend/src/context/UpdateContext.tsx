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

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Immediate check on register + periodic check every 2 minutes
        r.update();
        setInterval(() => {
          r.update();
        }, 2 * 60 * 1000);
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
        const serverBuildTime = Number(data.buildTime) || 0;

        const lastKnownBuild = Number(localStorage.getItem('619_app_build_time')) || 0;

        // If server version is greater or build time is newer
        if (serverVersion !== CURRENT_APP_VERSION || (lastKnownBuild > 0 && serverBuildTime > lastKnownBuild)) {
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

  // Poll for updates on load, focus, and every 45s
  useEffect(() => {
    // Record current build time on initial load
    fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.buildTime && !localStorage.getItem('619_app_build_time')) {
          localStorage.setItem('619_app_build_time', String(data.buildTime));
        }
      })
      .catch(() => {});

    // Check after 2 seconds
    const timeout = setTimeout(() => {
      checkLiveVersion();
    }, 2000);

    // Periodic check every 45 seconds
    const interval = setInterval(() => {
      checkLiveVersion();
    }, 45 * 1000);

    // Check on visibility/focus
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
    try {
      localStorage.setItem('show_whats_new_after_update', 'true');
      localStorage.setItem('last_seen_app_version', CURRENT_APP_VERSION);
      
      // Update build timestamp to latest
      try {
        const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.buildTime) {
            localStorage.setItem('619_app_build_time', String(data.buildTime));
          }
        }
      } catch (e) {}

      // Trigger Workbox skipWaiting
      if (needRefresh) {
        await updateServiceWorker(true);
      } else {
        // Clear caches and reload
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
        }
        window.location.reload();
      }
    } catch (err) {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setNeedRefresh(false);
    setManualUpdateAvailable(false);
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
    return isNew || needRefresh;
  };

  const isUpdateReady = needRefresh || manualUpdateAvailable;

  return (
    <UpdateContext.Provider
      value={{
        updateAvailable: isUpdateReady,
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
