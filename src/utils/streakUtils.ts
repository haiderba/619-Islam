import { StreakData } from '../types/progress';
import { getTodayDateString } from './dateUtils';

export function calculateUpdatedStreak(
  currentStreakData: StreakData,
  isCompletedToday: boolean
): StreakData {
  const today = getTodayDateString();

  if (currentStreakData.lastActiveDate === today) {
    // Already active today
    return currentStreakData;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let newStreak = currentStreakData.currentStreak;

  if (currentStreakData.lastActiveDate === yesterdayStr) {
    // Maintained streak from yesterday
    newStreak += 1;
  } else {
    // Streak broken or first day
    newStreak = 1;
  }

  const longestStreak = Math.max(currentStreakData.longestStreak, newStreak);

  return {
    currentStreak: newStreak,
    longestStreak,
    lastActiveDate: today,
  };
}
