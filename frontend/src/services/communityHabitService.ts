import { 
  CommunityHabit, 
  UserHabitRecord, 
  UserHabitsSummary, 
  NamazPrayerStatus 
} from '../types/communityHabits';
import { api } from '../config/api';

const COMMUNITY_HABITS_STORAGE_KEY = '619_community_habits_store';
const USER_HABITS_PROGRESS_KEY = '619_user_habits_progress';

export const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerKey = typeof PRAYER_KEYS[number];

export const INITIAL_CURATED_HABITS: CommunityHabit[] = [
  {
    id: 'habit_namaz_5daily',
    title: 'The 5 Daily Prayers (On-Time & Jama\'ah)',
    arabicTitle: 'إقامة الصلوات الخمس في أوقاتها',
    urduTitle: 'پانچ وقت نماز کی پابندی و باجماعت ادائیگی',
    category: 'namaz',
    description: 'Track and fulfill your 5 obligatory daily prayers on time. Mark prayers as they arrive and record congregation (Jama\'ah) rewards.',
    virtue: 'Prophet Muhammad (ﷺ) said: "The first thing for which a person will be brought to account on the Day of Judgment is prayer." (Sunan at-Tirmidhi 413)',
    targetDays: 0,
    durationLabel: 'Daily Obligatory Habit',
    reminderTime: '05:00',
    iconName: 'Flame',
    colorTheme: 'amber',
    isPinned: true,
    memberCount: 4890,
    todayCompletedCount: 3420,
    totalAllTimeCompletions: 128400,
    createdAt: new Date().toISOString(),
    namazConfig: {
      trackAll5: true,
      includeWitr: true,
    }
  },
  {
    id: 'habit_quran_khatam_journey',
    title: 'Daily Quran Journey (Sequential Bookmark)',
    arabicTitle: 'ختمة القرآن الكريم اليومية',
    urduTitle: 'روزانہ تلاوتِ قرآن مع ترجمہ و فہم',
    category: 'quran',
    description: 'A continuous personal Quran reading journey. Read your next assigned Ayahs daily with Urdu/English translation and audio recitation.',
    virtue: '"A Book We have sent down to you, full of blessings, that they may ponder over its verses, and that men of understanding may remember." (Surah Sad 38:29)',
    targetDays: 0,
    durationLabel: 'Continuous Khatam Journey',
    reminderTime: '07:30',
    iconName: 'BookOpen',
    colorTheme: 'cyan',
    isPinned: true,
    memberCount: 3950,
    todayCompletedCount: 2680,
    totalAllTimeCompletions: 94500,
    createdAt: new Date().toISOString(),
    quranConfig: {
      mode: 'progressive_khatam',
      targetPacePerDay: '1 Ruku / 1 Page Daily',
    }
  },
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
    memberCount: 3120,
    todayCompletedCount: 1980,
    totalAllTimeCompletions: 56700,
    createdAt: new Date().toISOString(),
    quranConfig: {
      mode: 'fixed_ayah',
      surahNumber: 67,
      surahName: 'Al-Mulk',
      ayahStart: 1,
      ayahEnd: 30,
    }
  },
  {
    id: 'habit_daily_istighfar',
    title: '100x Daily Istighfar (Astaghfirullah)',
    arabicTitle: 'الاستغفار ١٠٠ مرة يومياً',
    urduTitle: 'روزانہ 100 مرتبہ استغفار',
    category: 'dhikr',
    description: 'Tap the in-card Tasbeeh ring to recite Astaghfirullah 100 times throughout the day for forgiveness and peace of mind.',
    virtue: 'The Messenger of Allah (ﷺ) said: "By Allah, I seek the forgiveness of Allah and turn to Him in repentance more than seventy times a day." (Sahih al-Bukhari 6307)',
    targetDays: 30,
    durationLabel: '30-Day Challenge',
    reminderTime: '14:00',
    iconName: 'Sparkles',
    colorTheme: 'emerald',
    isPinned: true,
    memberCount: 2780,
    todayCompletedCount: 1840,
    totalAllTimeCompletions: 48900,
    createdAt: new Date().toISOString(),
    dhikrConfig: {
      targetCount: 100,
      phraseArabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
      phraseUrdu: 'میں اللہ سے اپنے گناہوں کی معافی مانگتا ہوں اور اسی کی طرف توبہ کرتا ہوں',
      phraseTransliteration: 'Astaghfirullah wa Atubu Ilayh',
    }
  },
  {
    id: 'habit_morning_adhkar',
    title: 'Morning & Evening Adhkar (Protection Shield)',
    arabicTitle: 'أذكار الصباح والمساء',
    urduTitle: 'صبح و شام کے مسنون اذکار',
    category: 'dhikr',
    description: 'Recite SubhanAllah wa Bihamdihi and protective authentic Azkar in the morning after Fajr and evening after Asr.',
    virtue: '"O you who have believed, remember Allah with much remembrance and glorify Him morning and afternoon." (Surah Al-Ahzab 33:41-42)',
    targetDays: 0,
    durationLabel: 'Daily Sunnah Habit',
    reminderTime: '05:30',
    iconName: 'Sun',
    colorTheme: 'amber',
    memberCount: 3410,
    todayCompletedCount: 2450,
    totalAllTimeCompletions: 78200,
    createdAt: new Date().toISOString(),
    dhikrConfig: {
      targetCount: 33,
      phraseArabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
      phraseUrdu: 'پاک ہے اللہ اپنی تمام تعریفوں کے ساتھ، پاک ہے اللہ جو بڑی عظمت والا ہے',
      phraseTransliteration: 'SubhanAllahi wa bihamdihi, SubhanAllahil Azeem',
    }
  },
  {
    id: 'habit_sunnah_fasting',
    title: 'Monday & Thursday Sunnah Fasting',
    arabicTitle: 'صيام الإثنين والخميس',
    urduTitle: 'پیر اور جمعرات کا مسنون روزہ',
    category: 'fasting',
    description: 'Revive the Sunnah of fasting on Mondays and Thursdays. Track your Sehri and Iftar intentions easily.',
    virtue: 'Prophet Muhammad (ﷺ) said: "Deeds are shown (to Allah) on Mondays and Thursdays, and I love that my deeds be shown while I am fasting." (Jami` at-Tirmidhi 747)',
    targetDays: 0,
    durationLabel: 'Weekly Sunnah Fast',
    reminderTime: '04:30',
    iconName: 'Moon',
    colorTheme: 'purple',
    memberCount: 1650,
    todayCompletedCount: 720,
    totalAllTimeCompletions: 21300,
    createdAt: new Date().toISOString(),
    fastingConfig: {
      fastType: 'monday_thursday'
    }
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
    memberCount: 2900,
    todayCompletedCount: 1540,
    totalAllTimeCompletions: 43200,
    createdAt: new Date().toISOString(),
    dhikrConfig: {
      targetCount: 500,
      phraseArabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
      phraseUrdu: 'اے اللہ! رحمتیں نازل فرما حضرت محمد ﷺ پر اور ان کی آل پر',
      phraseTransliteration: 'Allahumma Salli Ala Muhammadin Wa Ala Aali Muhammad',
    }
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

  deleteHabit(id: string): void {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.saveHabits(habits);

    const progress = this.getUserProgressMap();
    if (progress[id]) {
      delete progress[id];
      localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(progress));
    }

    try {
      api.delete(`/global-habits/${id}`).catch(() => {});
    } catch (e) {}
  },

  // ── 2. USER PROGRESS & JOINING ──
  getUserProgressMap(): Record<string, UserHabitRecord> {
    try {
      const raw = localStorage.getItem(USER_HABITS_PROGRESS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}

    // Default join initial starter habits
    const today = this.getDateString(new Date());
    const yesterday = this.getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const defaultMap: Record<string, UserHabitRecord> = {
      'habit_namaz_5daily': {
        habitId: 'habit_namaz_5daily',
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedDates: [yesterday],
        currentStreak: 1,
        longestStreak: 4,
        namazHistory: {
          [yesterday]: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
          [today]: { fajr: true, dhuhr: true }
        }
      },
      'habit_quran_khatam_journey': {
        habitId: 'habit_quran_khatam_journey',
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedDates: [yesterday],
        currentStreak: 2,
        longestStreak: 5,
        quranProgress: {
          currentSurah: 2, // Al-Baqarah
          currentAyah: 142,
          totalAyahsRead: 148,
          lastReadDate: yesterday,
        }
      },
      'habit_daily_istighfar': {
        habitId: 'habit_daily_istighfar',
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedDates: [yesterday],
        currentStreak: 3,
        longestStreak: 3,
        dhikrProgress: {
          [today]: 45
        }
      }
    };

    localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(defaultMap));
    return defaultMap;
  },

  saveUserProgressMap(map: Record<string, UserHabitRecord>): void {
    localStorage.setItem(USER_HABITS_PROGRESS_KEY, JSON.stringify(map));
  },

  toggleJoin(habitId: string): boolean {
    const progress = this.getUserProgressMap();
    const isCurrentlyJoined = !!progress[habitId];

    if (isCurrentlyJoined) {
      delete progress[habitId];
      this.saveUserProgressMap(progress);
      
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
        namazHistory: {},
        quranProgress: {
          currentSurah: 1,
          currentAyah: 1,
          totalAyahsRead: 0,
        },
        dhikrProgress: {},
      };
      this.saveUserProgressMap(progress);

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

  // ── 3. NAMAZ 5-PRAYER DYNAMIC ENGINE & TIME-LOCK 🔒 ──

  // Returns approximate/calculated prayer times for time locking
  getPrayerTimesForToday(): Record<PrayerKey, string> {
    try {
      const rawTimes = localStorage.getItem('619_prayer_times_today');
      if (rawTimes) {
        const parsed = JSON.parse(rawTimes);
        return {
          fajr: parsed.fajr || '05:15',
          dhuhr: parsed.dhuhr || '12:45',
          asr: parsed.asr || '16:30',
          maghrib: parsed.maghrib || '18:45',
          isha: parsed.isha || '20:15',
        };
      }
    } catch (e) {}

    // Safe standard defaults
    return {
      fajr: '05:15',
      dhuhr: '12:45',
      asr: '16:30',
      maghrib: '18:45',
      isha: '20:15',
    };
  },

  isPrayerUnlocked(prayer: PrayerKey, targetDateStr: string): { unlocked: boolean; unlocksAt: string } {
    const today = this.getDateString(new Date());
    const times = this.getPrayerTimesForToday();
    const prayerTime = times[prayer] || '12:00';

    // Past dates are always unlocked for history viewing / logging
    if (targetDateStr < today) {
      return { unlocked: true, unlocksAt: prayerTime };
    }

    // Future dates are locked
    if (targetDateStr > today) {
      return { unlocked: false, unlocksAt: `${prayerTime} (${targetDateStr})` };
    }

    // Today: Compare current time with prayer Adhan time
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [pHours, pMins] = prayerTime.split(':').map(n => parseInt(n, 10));
    const prayerMinutes = (pHours || 0) * 60 + (pMins || 0);

    const unlocked = currentMinutes >= prayerMinutes;
    return { unlocked, unlocksAt: prayerTime };
  },

  getNamazStatusForDate(habitId: string, dateStr: string): NamazPrayerStatus {
    const progress = this.getUserProgressMap();
    const rec = progress[habitId];
    return rec?.namazHistory?.[dateStr] || {};
  },

  togglePrayerForDate(
    habitId: string, 
    dateStr: string, 
    prayer: PrayerKey, 
    isJamaah: boolean = false
  ): { status: NamazPrayerStatus; allCompleted: boolean } {
    const progress = this.getUserProgressMap();
    let rec = progress[habitId];
    if (!rec) {
      rec = {
        habitId,
        joinedAt: new Date().toISOString(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
        namazHistory: {},
      };
    }

    if (!rec.namazHistory) rec.namazHistory = {};
    const dateRecord = rec.namazHistory[dateStr] || {};
    const isCurrentlyPrayed = !!dateRecord[prayer];

    dateRecord[prayer] = !isCurrentlyPrayed;
    if (!dateRecord.isJamaah) dateRecord.isJamaah = {};
    dateRecord.isJamaah[prayer] = isJamaah;

    rec.namazHistory[dateStr] = dateRecord;

    // Check if all 5 prayers are completed for this date
    const all5Done = PRAYER_KEYS.every(p => !!dateRecord[p]);
    if (all5Done) {
      if (!rec.completedDates.includes(dateStr)) {
        rec.completedDates.push(dateStr);
        rec.currentStreak += 1;
        rec.longestStreak = Math.max(rec.longestStreak, rec.currentStreak);
      }
    } else {
      rec.completedDates = rec.completedDates.filter(d => d !== dateStr);
    }

    progress[habitId] = rec;
    this.saveUserProgressMap(progress);

    return { status: dateRecord, allCompleted: all5Done };
  },

  // ── 4. PROGRESSIVE QURAN READING ENGINE ──
  getQuranPosition(habitId: string) {
    const progress = this.getUserProgressMap();
    const rec = progress[habitId];
    const qProg = rec?.quranProgress || {
      currentSurah: 2,
      currentAyah: 142,
      totalAyahsRead: 148,
    };

    // Surah Metadata helper
    const surahNames = [
      '', 'Al-Fatihah', 'Al-Baqarah', 'Ali \'Imran', 'An-Nisa', 'Al-Ma\'idah', 'Al-An\'am', 
      'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus', 'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim'
    ];

    const currentSurahName = surahNames[qProg.currentSurah] || `Surah ${qProg.currentSurah}`;
    const juzNumber = Math.min(30, Math.ceil(qProg.currentSurah / 3.8));

    return {
      ...qProg,
      surahName: currentSurahName,
      juzNumber,
    };
  },

  advanceQuranAyahs(habitId: string, ayahsCount: number = 5): void {
    const progress = this.getUserProgressMap();
    const today = this.getDateString(new Date());
    let rec = progress[habitId];
    if (!rec) return;

    if (!rec.quranProgress) {
      rec.quranProgress = { currentSurah: 1, currentAyah: 1, totalAyahsRead: 0 };
    }

    rec.quranProgress.currentAyah += ayahsCount;
    rec.quranProgress.totalAyahsRead += ayahsCount;
    rec.quranProgress.lastReadDate = today;

    // Check if Ayah exceeds standard surah length (simple wrap to next surah)
    if (rec.quranProgress.currentAyah > 150) {
      rec.quranProgress.currentSurah = Math.min(114, rec.quranProgress.currentSurah + 1);
      rec.quranProgress.currentAyah = 1;
    }

    if (!rec.completedDates.includes(today)) {
      rec.completedDates.push(today);
      rec.currentStreak += 1;
      rec.longestStreak = Math.max(rec.longestStreak, rec.currentStreak);
    }

    progress[habitId] = rec;
    this.saveUserProgressMap(progress);
  },

  // ── 5. IN-CARD DHIKR MICRO-TASBEEH ENGINE ──
  getDhikrCountForDate(habitId: string, dateStr: string): number {
    const progress = this.getUserProgressMap();
    return progress[habitId]?.dhikrProgress?.[dateStr] || 0;
  },

  incrementDhikr(habitId: string, step: number = 1, targetGoal: number = 100): { currentCount: number; isGoalReached: boolean } {
    const progress = this.getUserProgressMap();
    const today = this.getDateString(new Date());

    let rec = progress[habitId];
    if (!rec) {
      rec = {
        habitId,
        joinedAt: new Date().toISOString(),
        completedDates: [],
        currentStreak: 0,
        longestStreak: 0,
        dhikrProgress: {},
      };
    }

    if (!rec.dhikrProgress) rec.dhikrProgress = {};
    const current = (rec.dhikrProgress[today] || 0) + step;
    rec.dhikrProgress[today] = current;

    const isGoalReached = current >= targetGoal;
    if (isGoalReached && !rec.completedDates.includes(today)) {
      rec.completedDates.push(today);
      rec.currentStreak += 1;
      rec.longestStreak = Math.max(rec.longestStreak, rec.currentStreak);
    }

    progress[habitId] = rec;
    this.saveUserProgressMap(progress);

    return { currentCount: current, isGoalReached };
  },

  resetDhikr(habitId: string): void {
    const progress = this.getUserProgressMap();
    const today = this.getDateString(new Date());
    if (progress[habitId]?.dhikrProgress) {
      progress[habitId].dhikrProgress![today] = 0;
      progress[habitId].completedDates = progress[habitId].completedDates.filter(d => d !== today);
      this.saveUserProgressMap(progress);
    }
  },

  // ── 6. GENERAL CHECK-IN & STATS SUMMARY ──
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

      const hadYesterday = record.completedDates.includes(yesterday);
      if (hadYesterday || record.currentStreak === 0) {
        record.currentStreak += 1;
      } else {
        record.currentStreak = 1;
      }

      record.longestStreak = Math.max(record.longestStreak, record.currentStreak);
    }

    progress[habitId] = record;
    this.saveUserProgressMap(progress);

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
      this.saveUserProgressMap(progress);
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

    // Dynamic Level & Istiqamah Tier Calculation
    let levelTitle = 'Seeker of Light (مبتدئ)';
    let levelNumber = 1;
    let levelProgressPercent = Math.min(100, Math.round((totalDeeds / 10) * 100));

    if (totalDeeds >= 50) {
      levelTitle = 'Istiqamah Champion (صاحب الاستقامة)';
      levelNumber = 4;
      levelProgressPercent = 100;
    } else if (totalDeeds >= 25) {
      levelTitle = 'Guardian of Sunnah (حافظ السنة)';
      levelNumber = 3;
      levelProgressPercent = Math.round(((totalDeeds - 25) / 25) * 100);
    } else if (totalDeeds >= 10) {
      levelTitle = 'Consistent Believer (مؤمن مواظب)';
      levelNumber = 2;
      levelProgressPercent = Math.round(((totalDeeds - 10) / 15) * 100);
    }

    return {
      totalJoined: joinedHabits.length,
      completedTodayCount: completedToday,
      pendingTodayCount: pendingToday,
      overallCompletionRate: rate,
      bestStreak: maxStreak,
      totalDeedsCompleted: totalDeeds,
      levelTitle,
      levelNumber,
      levelProgressPercent,
    };
  },

  getDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
};
