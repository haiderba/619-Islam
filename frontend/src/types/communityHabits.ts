export type HabitCategory = 'quran' | 'dhikr' | 'namaz' | 'sunnah' | 'charity' | 'fasting' | 'character';

export type HabitDuration = 'daily' | '7_days' | '21_days' | '30_days' | '40_days';

export interface CommunityHabit {
  id: string;
  title: string;
  arabicTitle?: string;
  urduTitle?: string;
  category: HabitCategory;
  description: string;
  virtue?: string; // Hadith or Quranic reference/virtue
  targetDays: number; // 0 for daily ongoing, or 7, 21, 30, 40
  durationLabel: string; // e.g. "Daily Habit", "7-Day Challenge", "30-Day Ramadan Prep"
  reminderTime?: string; // "HH:MM" 24h format, e.g. "21:30", "05:30"
  iconName: string; // "Moon", "Flame", "BookOpen", "Heart", "Sparkles", "Sun", "Smile"
  colorTheme: 'emerald' | 'amber' | 'indigo' | 'rose' | 'teal' | 'purple' | 'cyan';
  isPinned?: boolean;
  memberCount: number;
  todayCompletedCount: number;
  totalAllTimeCompletions: number;
  createdAt: string;
  joined?: boolean;
}

export interface UserHabitRecord {
  habitId: string;
  joinedAt: string;
  completedDates: string[]; // ['YYYY-MM-DD', ...]
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface UserHabitsSummary {
  totalJoined: number;
  completedTodayCount: number;
  pendingTodayCount: number;
  overallCompletionRate: number; // 0 - 100
  bestStreak: number;
  totalDeedsCompleted: number;
}
