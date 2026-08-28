export type HabitCategory = 'namaz' | 'quran' | 'dhikr' | 'sunnah' | 'charity' | 'fasting' | 'character';

export type HabitDuration = 'daily' | '7_days' | '21_days' | '30_days' | '40_days';

export interface NamazPrayerStatus {
  fajr?: boolean;
  dhuhr?: boolean;
  asr?: boolean;
  maghrib?: boolean;
  isha?: boolean;
  witr?: boolean;
  isJamaah?: { [prayerKey: string]: boolean };
}

export interface QuranHabitConfig {
  mode: 'fixed_ayah' | 'progressive_khatam';
  surahNumber?: number;
  surahName?: string;
  ayahStart?: number;
  ayahEnd?: number;
  arabicText?: string;
  translationUrdu?: string;
  translationEn?: string;
  targetPacePerDay?: string; // e.g. "1 Ruku", "1 Page", "1 Juz"
}

export interface DhikrHabitConfig {
  targetCount: number;
  phraseArabic: string;
  phraseUrdu: string;
  phraseTransliteration?: string;
  virtue?: string;
}

export interface FastingHabitConfig {
  fastType: 'monday_thursday' | 'ayyam_al_beed' | 'ashura' | 'arafah' | 'custom';
  nextFastingDate?: string;
}

export interface CommunityHabit {
  id: string;
  title: string;
  arabicTitle?: string;
  urduTitle?: string;
  category: HabitCategory;
  description: string;
  virtue?: string;
  targetDays: number; // 0 for daily ongoing, 7, 21, 30, 40
  durationLabel: string;
  reminderTime?: string; // "HH:MM"
  iconName: string;
  colorTheme: 'emerald' | 'amber' | 'indigo' | 'rose' | 'teal' | 'purple' | 'cyan';
  isPinned?: boolean;
  memberCount: number;
  todayCompletedCount: number;
  totalAllTimeCompletions: number;
  createdAt: string;
  joined?: boolean;

  // Dynamic Category Configs
  namazConfig?: {
    trackAll5: boolean;
    includeWitr: boolean;
  };
  quranConfig?: QuranHabitConfig;
  dhikrConfig?: DhikrHabitConfig;
  fastingConfig?: FastingHabitConfig;
}

export interface UserHabitRecord {
  habitId: string;
  joinedAt: string;
  completedDates: string[]; // ['YYYY-MM-DD', ...]
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;

  // Dynamic progress states
  namazHistory?: { [dateStr: string]: NamazPrayerStatus };
  quranProgress?: {
    currentSurah: number;
    currentAyah: number;
    totalAyahsRead: number;
    lastReadDate?: string;
  };
  dhikrProgress?: { [dateStr: string]: number };
  fastingHistory?: { [dateStr: string]: boolean };
}

export interface UserHabitsSummary {
  totalJoined: number;
  completedTodayCount: number;
  pendingTodayCount: number;
  overallCompletionRate: number; // 0 - 100
  bestStreak: number;
  totalDeedsCompleted: number;
  levelTitle: string;
  levelNumber: number;
  levelProgressPercent: number;
}
