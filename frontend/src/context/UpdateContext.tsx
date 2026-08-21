import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { CURRENT_APP_VERSION } from '../config/changelog';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  serverVersion?: string;
  currentVersion: string;
  requiresReinstall?: boolean;
}

interface UpdateContextType {
  updateAvailable: boolean;
  applyingUpdate: boolean;
  isCheckingUpdates: boolean;
  serverVersion: string | null;
  requiresReinstall: boolean;
  applyUpdate: () => Promise<void>;
  reinstallApp: () => Promise<void>;
  dismissUpdate: () => void;
  checkForUpdates: (manual?: boolean) => Promise<UpdateCheckResult>;
  showWhatsNew: boolean;
  setShowWhatsNew: (show: boolean) => void;
  currentVersion: string;
  notificationPermission: NotificationPermission | 'unsupported';
  requestNotificationPermission: () => Promise<boolean>;
}

// Semver comparator: Returns true ONLY if serverVer is strictly greater than currentVer
export function isNewerVersion(serverVer?: string | null, currentVer?: string | null): boolean {
  if (!serverVer || !currentVer) return false;
  if (serverVer === currentVer) return false;

  const sParts = serverVer.split('.').map(n => parseInt(n, 10) || 0);
  const cParts = currentVer.split('.').map(n => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(sParts.length, cParts.length); i++) {
    const s = sParts[i] ?? 0;
    const c = cParts[i] ?? 0;
    if (s > c) return true;
    if (s < c) return false;
  }

  return false;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [applyingUpdate, setApplyingUpdate] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [manualUpdateAvailable, setManualUpdateAvailable] = useState(false);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [requiresReinstall, setRequiresReinstall] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check notification permission support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Immediate check on register + rapid check every 15 seconds
        r.update();
        setInterval(() => {
          r.update();
        }, 15 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  // Dismiss any lingering update notifications from the mobile notification center
  const dismissPendingUpdateNotifications = async () => {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'getNotifications' in reg) {
          const notifications = await reg.getNotifications({ tag: '619-app-update' });
          notifications.forEach(n => n.close());
        }
      }
    } catch (e) {
      console.warn('Failed to dismiss pending notifications', e);
    }
  };

  // Send a rich native mobile push notification when a new update arrives
  const sendUpdateNotification = async (newVersion: string) => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const lastNotified = localStorage.getItem('619_last_notified_update');
      if (lastNotified === newVersion) return; // Prevent duplicate notifications for same version

      const title = `✨ 619 Islam Update Available (v${newVersion})`;
      const options: any = {
        body: 'A fresh update is ready! Tap to update and experience the latest features.',
        icon: '/logo.png',
        badge: '/favicon.png',
        tag: '619-app-update',
        renotify: true,
        data: { 
          url: '/',
          version: newVersion,
          timestamp: Date.now()
        }
      };

      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, options);
          localStorage.setItem('619_last_notified_update', newVersion);
          return;
        }
      }

      new Notification(title, options);
      localStorage.setItem('619_last_notified_update', newVersion);
    } catch (e) {
      console.warn('Failed to dispatch update notification', e);
    }
  };

  // Active Live Version Check function
  const checkLiveVersion = async (): Promise<UpdateCheckResult> => {
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
        const ver = data.version;
        const needsReinstall = !!data.requiresReinstall;

        // ONLY trigger update if server version is strictly newer than current running app version
        if (ver && isNewerVersion(ver, CURRENT_APP_VERSION)) {
          // If the user already tapped update or dismissed for this version in this session, do not prompt repeatedly
          const dismissed = sessionStorage.getItem('dismissed_update_version');
          const applied = localStorage.getItem('applied_update_version');
          
          if (dismissed === ver || applied === ver) {
            setManualUpdateAvailable(false);
            return {
              hasUpdate: false,
              serverVersion: ver,
              currentVersion: CURRENT_APP_VERSION,
              requiresReinstall: false
            };
          }

          setServerVersion(ver);
          setManualUpdateAvailable(true);
          setRequiresReinstall(needsReinstall);

          // Dispatch background push notification if permission is allowed
          sendUpdateNotification(ver);

          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => reg?.update());
          }

          return {
            hasUpdate: true,
            serverVersion: ver,
            currentVersion: CURRENT_APP_VERSION,
            requiresReinstall: needsReinstall
          };
        } else {
          // App is up to date: clean up any stale notification in the notification tray
          setManualUpdateAvailable(false);
          dismissPendingUpdateNotifications();
        }
      }
    } catch (e) {
      // Offline / network failure
    }

    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      requiresReinstall: false
    };
  };

  // Poll for updates on load (500ms), on focus, on reconnect, and every 15s
  useEffect(() => {
    const timeout = setTimeout(() => {
      checkLiveVersion();
    }, 500);

    const interval = setInterval(() => {
      checkLiveVersion();
    }, 15 * 1000);

    const handleVisibility = () => {
      checkLiveVersion();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    window.addEventListener('online', handleVisibility);
    window.addEventListener('pageshow', handleVisibility);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('online', handleVisibility);
      window.removeEventListener('pageshow', handleVisibility);
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
      dismissPendingUpdateNotifications();
    }
  }, []);

  const applyUpdate = async () => {
    setApplyingUpdate(true);
    setManualUpdateAvailable(false);
    await dismissPendingUpdateNotifications();

    const targetVer = serverVersion || CURRENT_APP_VERSION;
    sessionStorage.setItem('dismissed_update_version', targetVer);
    localStorage.setItem('applied_update_version', targetVer);
    localStorage.setItem('show_whats_new_after_update', 'true');
    localStorage.setItem('last_seen_app_version', targetVer);

    try {
      // 1. Force waiting service worker to activate immediately
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
      
      // 2. Clear caches
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

      // 3. Hard cache-busting replace for iOS Safari & PWAs
      const cleanPath = window.location.pathname;
      window.location.replace(`${cleanPath}?_v=${Date.now()}`);
    } catch (err) {
      window.location.replace(`${window.location.pathname}?_v=${Date.now()}`);
    }
  };

  // Clean Reinstall / Purge Stale Caches
  const reinstallApp = async () => {
    setApplyingUpdate(true);
    await dismissPendingUpdateNotifications();

    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }

      // 2. Delete all caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(k => caches.delete(k)));
      }

      // 3. Clear version markers
      localStorage.removeItem('applied_update_version');
      sessionStorage.removeItem('dismissed_update_version');
      localStorage.setItem('show_whats_new_after_update', 'true');

      // 4. Force hard reload with timestamp
      window.location.href = '/?_clean_reinstall=' + Date.now();
    } catch (err) {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setManualUpdateAvailable(false);
    sessionStorage.setItem('dismissed_update_version', serverVersion || CURRENT_APP_VERSION);
    localStorage.setItem('applied_update_version', serverVersion || CURRENT_APP_VERSION);
    dismissPendingUpdateNotifications();
  };

  const checkForUpdates = async (_manual: boolean = false): Promise<UpdateCheckResult> => {
    setIsCheckingUpdates(true);
    try {
      const result = await checkLiveVersion();
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) await reg.update();
        } catch (e) {}
      }
      return result;
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Push notifications are not supported on this browser/platform.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (e) {
      console.warn(e);
      return false;
    }
  };

  return (
    <UpdateContext.Provider
      value={{
        updateAvailable: manualUpdateAvailable,
        applyingUpdate,
        isCheckingUpdates,
        serverVersion,
        requiresReinstall,
        applyUpdate,
        reinstallApp,
        dismissUpdate,
        checkForUpdates,
        showWhatsNew,
        setShowWhatsNew,
        currentVersion: CURRENT_APP_VERSION,
        notificationPermission,
        requestNotificationPermission,
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
};

export const useAppUpdate = () => {
  const context = useContext(UpdateContext);
  if (!context) {
    return {
      updateAvailable: false,
      applyingUpdate: false,
      isCheckingUpdates: false,
      serverVersion: null,
      requiresReinstall: false,
      applyUpdate: async () => {},
      reinstallApp: async () => {},
      dismissUpdate: () => {},
      checkForUpdates: async (): Promise<UpdateCheckResult> => ({ hasUpdate: false, currentVersion: CURRENT_APP_VERSION, serverVersion: undefined, requiresReinstall: false }),
      showWhatsNew: false,
      setShowWhatsNew: () => {},
      currentVersion: CURRENT_APP_VERSION,
      notificationPermission: 'default' as const,
      requestNotificationPermission: async () => false,
    };
  }
  return context;
};

