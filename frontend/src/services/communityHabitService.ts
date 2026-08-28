import { CommunityHabit, UserHabitRecord, UserHabitsSummary } from '../types/communityHabits';
import { api } from '../config/api';

const COMMUNITY_HABITS_STORAGE_KEY = '619_community_habits_store';
const USER_HABITS_PROGRESS_KEY = '619_user_habits_progress';

export const INITIAL_CURATED_HABITS: CommunityHabit[] = [
  {
    id: 'habit_surah_mulk',
    title: 'Surah Al-Mulk Before Sleep',
    arabicTitle: 'سورة الملك قبل النوم',
    urduTitle: 'سونے سے پہلے سورۃ الملک کی تلاوت',
    category: 'quran',
    description: 'Recite Surah Al-Mulk (Chapter 67) every night before sleeping for protection and intercession in the grave.',
    virtue: 'Prophet Muhammad (ﷺ) said: "Surah Al-Mulk is a protector; a rescuer, saving from the punishment of the grave." (Sunan at-Tirmidhi 2890)',
    targetDays: 0,
    durationLabel: 'Daily Sunnah Habit',
    reminderTime: '21:30',
    iconName: 'Moon',
    colorTheme: 'indigo',
    isPinned: true,
    memberCount: 2840,
    todayCompletedCount: 1690,
    totalAllTimeCompletions: 48920,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_morning_adhkar',
    title: 'Morning & Evening Adhkar',
    arabicTitle: 'أذكار الصباح والمساء',
    urduTitle: 'صبح و شام کے مسنون اذکار',
    category: 'dhikr',
    description: 'Recite authentic daily morning (after Fajr) and evening (after Asr) supplications for spiritual tranquility and divine protection.',
    virtue: '"O you who have believed, remember Allah with much remembrance and glorify Him morning and afternoon." (Surah Al-Ahzab 33:41-42)',
    targetDays: 0,
    durationLabel: 'Daily Habit',
    reminderTime: '05:30',
    iconName: 'Sun',
    colorTheme: 'amber',
    isPinned: true,
    memberCount: 3120,
    todayCompletedCount: 2210,
    totalAllTimeCompletions: 64100,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_daily_istighfar',
    title: '100x Daily Istighfar (Astaghfirullah)',
    arabicTitle: 'الاستغفار ١٠٠ مرة يومياً',
    urduTitle: 'روزانہ 100 مرتبہ استغفار',
    category: 'dhikr',
    description: 'Recite Astaghfirullah wa Atubu Ilayh 100 times throughout the day to purify the heart and open doors of sustenance (Rizq).',
    virtue: 'The Messenger of Allah (ﷺ) said: "By Allah, I seek the forgiveness of Allah and turn to Him in repentance more than seventy times a day." (Sahih al-Bukhari 6307)',
    targetDays: 30,
    durationLabel: '30-Day Challenge',
    reminderTime: '14:00',
    iconName: 'Sparkles',
    colorTheme: 'emerald',
    isPinned: true,
    memberCount: 1980,
    todayCompletedCount: 1340,
    totalAllTimeCompletions: 38200,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_tahajjud_7days',
    title: '7-Day Tahajjud & Night Prayer Challenge',
    arabicTitle: 'تحدي قيام الليل ٧ أيام',
    urduTitle: '7 دن کی نمازِ تہجد کا چیلنج',
    category: 'namaz',
    description: 'Wake up 15-20 minutes before Fajr Adhan to pray at least 2 Rakah of Tahajjud and pour your heart out in Dua.',
    virtue: '"And in some parts of the night offer the Tahajjud prayer as an additional prayer for yourself; it may be that your Lord will raise you to a praised station." (Surah Al-Isra 17:79)',
    targetDays: 7,
    durationLabel: '7-Day Challenge',
    reminderTime: '04:15',
    iconName: 'Flame',
    colorTheme: 'purple',
    memberCount: 1450,
    todayCompletedCount: 680,
    totalAllTimeCompletions: 19400,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_friday_salawat',
    title: 'Friday 500x Salawat (Durood Shareef)',
    arabicTitle: 'الإكثار من الصلاة على النبي ﷺ يوم الجمعة',
    urduTitle: 'جمعۃ المبارک کو درود شریف کا نذرانہ',
    category: 'sunnah',
    description: 'Send abundant blessings and peace upon our beloved Prophet Muhammad (ﷺ) on the blessed day of Jumu\'ah.',
    virtue: 'The Prophet (ﷺ) said: "Send abundant blessings upon me on Friday, for your blessings are presented to me." (Sunan Abi Dawud 1047)',
    targetDays: 0,
    durationLabel: 'Weekly Friday Habit',
    reminderTime: '09:00',
    iconName: 'Heart',
    colorTheme: 'teal',
    memberCount: 2200,
    todayCompletedCount: 1120,
    totalAllTimeCompletions: 31000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_daily_quran_ruku',
    title: 'Daily Quran: 1 Ruku / 1 Page with Meaning',
    arabicTitle: 'تلاوة ركوع يومي مع التدبر',
    urduTitle: 'روزانہ ایک رکوع قرآن مع ترجمہ و فہم',
    category: 'quran',
    description: 'Connect with the words of Allah daily by reading at least 1 Ruku with Urdu or English translation.',
    virtue: '"A Book We have sent down to you, full of blessings, that they may ponder over its verses, and that men of understanding may remember." (Surah Sad 38:29)',
    targetDays: 30,
    durationLabel: '30-Day Challenge',
    reminderTime: '07:30',
    iconName: 'BookOpen',
    colorTheme: 'cyan',
    memberCount: 2650,
    todayCompletedCount: 1840,
    totalAllTimeCompletions: 51200,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit_daily_sadaqah',
    title: 'Daily Micro-Sadaqah (Charity & Kindness)',
    arabicTitle: 'صدقة يومية ولو بكلمة طيبة',
    urduTitle: 'روزانہ صدقہ و نیکی کا عمل',
    category: 'charity',
    description: 'Give charity daily—whether through financial aid, helping someone, feeding an animal, or offering a warm smile.',
    virtue: 'The Prophet (ﷺ) said: "Charity does not decrease wealth, and a kind word is a charity." (Sahih Muslim 2588)',
    targetDays: 21,
    durationLabel: '21-Day Habit',
    reminderTime: '12:30',
    iconName: 'Heart',
    colorTheme: 'rose',
    memberCount: 1320,
    todayCompletedCount: 890,
    totalAllTimeCompletions: 22400,
    createdAt: new Date().toISOString(),
  }
];

export const communityHabitService = {
  // ── 1. HABITS REPOSITORY ──
  getHabits(): CommunityHabit[] {
    try {
      const raw = localStorage.getItem(COMMUNITY_HABITS_STORAGE_KEY);
      let habits: CommunityHabit[] = raw ? JSON.parse(raw) : INITIAL_CURATED_HABITS;

      // Merge user joined state
      const userProgress = this.getUserProgressMap();
      habits = habits.map(h => ({
        ...h,
        joined: !!userProgress[h.id],
      }));

      return habits;
    } catch (e) {
      console.warn('Failed to load community habits', e);
      return INITIAL_CURATED_HABITS;
    }
  },

  getHabitById(id: string): CommunityHabit | undefined {
    return this.getHabits().find(h => h.id === id);
  },

  saveHabits(habits: CommunityHabit[]): void {
    localStorage.setItem(COMMUNITY_HABITS_STORAGE_KEY, JSON.stringify(habits));
  },

  createHabit(habit: Omit<CommunityHabit, 'id' | 'memberCount' | 'todayCompletedCount' | 'totalAllTimeCompletions' | 'createdAt'>): CommunityHabit {
    const habits = this.getHabits();
    const newHabit: CommunityHabit = {
      ...habit,
      id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      memberCount: 1,
      todayCompletedCount: 0,
      totalAllTimeCompletions: 0,
      createdAt: new Date().toISOString(),
    };

    habits.unshift(newHabit);
    this.saveHabits(habits);

    // Sync to backend if available
    try {
      api.post('/global-habits', {
        id: newHabit.id,
        title: newHabit.title,
        category: newHabit.category,
        description: newHabit.description,
        target_days: newHabit.targetDays || 30,
        icon_name: newHabit.iconName,
        is_active: true
      }).catch(() => {});
    } catch (e) {}

    return newHabit;
  },

  updateHabit(id: string, updates: Partial<CommunityHabit>): CommunityHabit | null {
    const habits = this.getHabits();
    const idx = habits.findIndex(h => h.id === id);
    if (idx === -1) return null;

    habits[idx] = { ...habits[idx], ...updates };
    this.saveHabits(habits);
    return habits[idx];
  },

  deleteHabit(id: string): void {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.saveHabits(habits);

    // Remove from user progress if joined
    const progress = this.getUserProgressMap();
    if (progress[id]) {
      delete progress[id];
      localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(progress));
    }

    try {
      api.delete(`/global-habits/${id}`).catch(() => {});
    } catch (e) {}
  },

  // ── 2. USER PROGRESS & CHECK-IN ENGINE ──
  getUserProgressMap(): Record<string, UserHabitRecord> {
    try {
      const raw = localStorage.getItem(USER_HABITS_PROGRESS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}

    // Default join 2 starter habits for immediate engagement
    const defaultMap: Record<string, UserHabitRecord> = {
      'habit_surah_mulk': {
        habitId: 'habit_surah_mulk',
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedDates: [
          this.getDateString(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
          this.getDateString(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        ],
        currentStreak: 2,
        longestStreak: 2,
        lastCompletedDate: this.getDateString(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
      },
      'habit_morning_adhkar': {
        habitId: 'habit_morning_adhkar',
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedDates: [
          this.getDateString(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
          this.getDateString(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
          this.getDateString(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        ],
        currentStreak: 3,
        longestStreak: 3,
        lastCompletedDate: this.getDateString(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
      }
    };

    localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(defaultMap));
    return defaultMap;
  },

  toggleJoin(habitId: string): boolean {
    const progress = this.getUserProgressMap();
    const isCurrentlyJoined = !!progress[habitId];

    if (isCurrentlyJoined) {
      delete progress[habitId];
      localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(progress));
      
      // Decrement member count
      const habits = this.getHabits();
      const target = habits.find(h => h.id === habitId);
      if (target) {
        target.memberCount = Math.max(1, target.memberCount - 1);
        this.saveHabits(habits);
      }

      try {
        api.post(`/global-habits/${habitId}/leave`).catch(() => {});
      } catch (e) {}

      return false;
    } else {
      progress[habitId] = {
        habitId,
        joinedAt: new Date().toISOString(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
      };
      localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(progress));

      // Increment member count
      const habits = this.getHabits();
      const target = habits.find(h => h.id === habitId);
      if (target) {
        target.memberCount = target.memberCount + 1;
        this.saveHabits(habits);
      }

      try {
        api.post(`/global-habits/${habitId}/join`).catch(() => {});
      } catch (e) {}

      return true;
    }
  },

  markCompletedToday(habitId: string): UserHabitRecord {
    const progress = this.getUserProgressMap();
    const today = this.getDateString(new Date());
    const yesterday = this.getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

    let record = progress[habitId];
    if (!record) {
      record = {
        habitId,
        joinedAt: new Date().toISOString(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    if (!record.completedDates.includes(today)) {
      record.completedDates.push(today);
      record.lastCompletedDate = today;

      // Calculate streak
      const hadYesterday = record.completedDates.includes(yesterday);
      if (hadYesterday || record.currentStreak === 0) {
        record.currentStreak += 1;
      } else {
        record.currentStreak = 1;
      }

      record.longestStreak = Math.max(record.longestStreak, record.currentStreak);
    }

    progress[habitId] = record;
    localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(progress));

    // Increment today completed count for this habit
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.todayCompletedCount += 1;
      habit.totalAllTimeCompletions += 1;
      this.saveHabits(habits);
    }

    return record;
  },

  unmarkCompletedToday(habitId: string): UserHabitRecord {
    const progress = this.getUserProgressMap();
    const today = this.getDateString(new Date());

    let record = progress[habitId];
    if (record) {
      record.completedDates = record.completedDates.filter(d => d !== today);
      record.currentStreak = Math.max(0, record.currentStreak - 1);
      progress[habitId] = record;
      localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(progress));
    }

    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habit.todayCompletedCount = Math.max(0, habit.todayCompletedCount - 1);
      habit.totalAllTimeCompletions = Math.max(0, habit.totalAllTimeCompletions - 1);
      this.saveHabits(habits);
    }

    return record;
  },

  isCompletedToday(habitId: string): boolean {
    const progress = this.getUserProgressMap();
    const today = this.getDateString(new Date());
    return !!(progress[habitId]?.completedDates?.includes(today));
  },

  getUserHabitsSummary(): UserHabitsSummary {
    const progress = this.getUserProgressMap();
    const habits = this.getHabits();
    const joinedHabits = habits.filter(h => !!progress[h.id]);
    const today = this.getDateString(new Date());

    let completedToday = 0;
    let totalDeeds = 0;
    let maxStreak = 0;

    joinedHabits.forEach(h => {
      const rec = progress[h.id];
      if (rec) {
        if (rec.completedDates.includes(today)) {
          completedToday += 1;
        }
        totalDeeds += rec.completedDates.length;
        maxStreak = Math.max(maxStreak, rec.currentStreak);
      }
    });

    const pendingToday = Math.max(0, joinedHabits.length - completedToday);
    const rate = joinedHabits.length > 0 ? Math.round((completedToday / joinedHabits.length) * 100) : 0;

    return {
      totalJoined: joinedHabits.length,
      completedTodayCount: completedToday,
      pendingTodayCount: pendingToday,
      overallCompletionRate: rate,
      bestStreak: maxStreak,
      totalDeedsCompleted: totalDeeds,
    };
  },

  getDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
};
