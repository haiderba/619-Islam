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

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodic check for SW updates every 10 minutes
        setInterval(() => {
          r.update();
        }, 10 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  // Check for updates on visibility change (reopening the app)
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
      await updateServiceWorker(true);
    } catch (err) {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  const checkForUpdates = async (): Promise<boolean> => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
        }
      } catch (e) {
        console.error(e);
      }
    }
    return needRefresh;
  };

  return (
    <UpdateContext.Provider
      value={{
        updateAvailable: needRefresh,
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
