export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface DailyProgressSummary {
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}
