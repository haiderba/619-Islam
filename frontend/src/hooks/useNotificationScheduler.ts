import { useEffect } from 'react';
import { useNamaz } from './useNamaz';
import { notificationService } from '../services/notificationService';

export function useNotificationScheduler() {
  const { timings } = useNamaz();

  useEffect(() => {
    // Check immediately on load
    notificationService.checkAndDispatchScheduled(timings as any);

    // Run scheduler check every 30 seconds
    const interval = setInterval(() => {
      notificationService.checkAndDispatchScheduled(timings as any);
    }, 30 * 1000);

    // Also check on tab focus or screen unlock
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        notificationService.checkAndDispatchScheduled(timings as any);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [timings]);
}
