import { useState, useEffect, useCallback } from 'react';
import { StorageService, DEFAULT_STREAK } from '../services/storageService';
import { StreakData } from '../types/progress';

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStreak = useCallback(async () => {
    setLoading(true);
    const data = await StorageService.getStreakData();
    setStreakData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streakData,
    loading,
    refreshStreak: fetchStreak,
  };
}
