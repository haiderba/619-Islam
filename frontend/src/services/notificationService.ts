import { adhanService } from './adhanService';

export interface NotificationSettings {
  enabled: boolean;
  namaz: {
    enabled: boolean;
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    prePrayerAlert: boolean; // 15 min before
    playAdhanAudio: boolean;
  };
  dailyAyah: {
    enabled: boolean;
    time: string; // "07:30"
  };
  quranReminder: {
    enabled: boolean;
    time: string; // "20:00"
  };
  surahKahfFriday: {
    enabled: boolean;
    time: string; // "09:00"
  };
  surahMulkNight: {
    enabled: boolean;
    time: string; // "21:30"
  };
  morningAzkar: {
    enabled: boolean;
    time: string; // "06:45"
  };
  eveningAzkar: {
    enabled: boolean;
    time: string; // "17:30"
  };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  namaz: {
    enabled: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    prePrayerAlert: false,
    playAdhanAudio: true,
  },
  dailyAyah: {
    enabled: true,
    time: '07:30',
  },
  quranReminder: {
    enabled: true,
    time: '20:00',
  },
  surahKahfFriday: {
    enabled: true,
    time: '09:00',
  },
  surahMulkNight: {
    enabled: true,
    time: '21:30',
  },
  morningAzkar: {
    enabled: true,
    time: '06:45',
  },
  eveningAzkar: {
    enabled: true,
    time: '17:30',
  },
};

const SETTINGS_KEY = '619_islamic_notification_settings';
const LAST_SENT_LOG_KEY = '619_notifications_sent_log';

export const notificationService = {
  getSettings(): NotificationSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed to parse notification settings', e);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  },

  saveSettings(settings: NotificationSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (e) {
      return false;
    }
  },

  getPermissionState(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  async sendNotification(title: string, options: {
    body: string;
    tag?: string;
    url?: string;
    icon?: string;
    badge?: string;
    requireInteraction?: boolean;
    silent?: boolean;
  }): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    const tag = options.tag || '619-islamic-reminder';
    const notificationOptions: any = {
      body: options.body,
      icon: options.icon || '/pwa-192x192.png',
      badge: options.badge || '/apple-touch-icon.png',
      tag,
      renotify: true,
      requireInteraction: !!options.requireInteraction,
      silent: !!options.silent,
      data: {
        url: options.url || '/',
        timestamp: Date.now(),
      },
    };

    try {
      // 1. Try sending through Service Worker for native mobile background delivery
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, notificationOptions);
          return true;
        }
      }

      // 2. Fallback to standard Notification API
      new Notification(title, notificationOptions);
      return true;
    } catch (e) {
      console.warn('Failed to dispatch notification', e);
      return false;
    }
  },

  // Helper to test notifications immediately
  async sendTestNotification(type: 'namaz' | 'dailyAyah' | 'quran' | 'kahf' | 'mulk' | 'azkar'): Promise<boolean> {
    const permGranted = await this.requestPermission();
    if (!permGranted) return false;

    switch (type) {
      case 'namaz':
        adhanService.playAdhan('Dhuhr', 'الظهر');
        return this.sendNotification('🕌 Adhan: Dhuhr Prayer Time (الظهر)', {
          body: 'حي على الصلاة • Time to pause Dunya, perform Wudu, and stand before Allah 🤍',
          url: '/namaz',
          tag: 'namaz-dhuhr-test',
        });
      case 'dailyAyah':
        return this.sendNotification('✨ Verse of the Day', {
          body: '📖 "Indeed, with hardship will be ease." (Surah Ash-Sharh: 6)',
          url: '/quran',
          tag: 'daily-ayah-test',
        });
      case 'quran':
        return this.sendNotification('📖 Daily Quran Reading Reminder', {
          body: 'Keep your streak alive! Spend 10 blessed minutes reciting the Noble Quran today.',
          url: '/quran',
          tag: 'quran-reminder-test',
        });
      case 'kahf':
        return this.sendNotification('🕌 Blessed Friday: Surah Al-Kahf', {
          body: 'Prophet ﷺ said: "Whoever reads Surah Al-Kahf on Friday, light will shine for him between the two Fridays."',
          url: '/quran/18',
          tag: 'kahf-friday-test',
        });
      case 'mulk':
        return this.sendNotification('🛡️ Nightly Shield: Surah Al-Mulk', {
          body: 'Recite Surah Al-Mulk before sleeping — the intercessor and savior from the punishment of the grave.',
          url: '/quran/67',
          tag: 'mulk-night-test',
        });
      case 'azkar':
        return this.sendNotification('🤲 Morning Azkar & Remembrance', {
          body: 'Begin your day with the Fortress of the Muslim (Hisn-ul-Muslim) Duas for barakah and divine protection.',
          url: '/duas',
          tag: 'morning-azkar-test',
        });
      default:
        return false;
    }
  },

  // Check and dispatch scheduled notifications based on current time & prayer times
  checkAndDispatchScheduled(prayerTimes: Record<string, string> | null): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const settings = this.getSettings();
    if (!settings.enabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
    const todayKey = now.toISOString().slice(0, 10);
    const dayOfWeek = now.getDay(); // 5 = Friday

    // Sent log tracking for today
    let sentLog: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(LAST_SENT_LOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === todayKey) {
          sentLog = parsed.sent || {};
        }
      }
    } catch (e) {}

    const markSent = (key: string) => {
      sentLog[key] = true;
      localStorage.setItem(LAST_SENT_LOG_KEY, JSON.stringify({ date: todayKey, sent: sentLog }));
    };

    // 1. Namaz Prayer Time Alerts
    if (settings.namaz.enabled && prayerTimes) {
      const prayers = [
        { key: 'Fajr', name: 'Fajr', enabled: settings.namaz.fajr, arabic: 'الفجر' },
        { key: 'Dhuhr', name: 'Dhuhr', enabled: settings.namaz.dhuhr, arabic: 'الظهر' },
        { key: 'Asr', name: 'Asr', enabled: settings.namaz.asr, arabic: 'العصر' },
        { key: 'Maghrib', name: 'Maghrib', enabled: settings.namaz.maghrib, arabic: 'المغرب' },
        { key: 'Isha', name: 'Isha', enabled: settings.namaz.isha, arabic: 'العشاء' },
      ];

      prayers.forEach(p => {
        if (!p.enabled || !prayerTimes[p.key]) return;

        // Prayer time format e.g. "05:12" or "13:20" (clean extra timezone strings)
        const timeMatch = prayerTimes[p.key].match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return;

        const pHours = parseInt(timeMatch[1], 10);
        const pMinutes = parseInt(timeMatch[2], 10);
        const pTimeStr = `${String(pHours).padStart(2, '0')}:${String(pMinutes).padStart(2, '0')}`;

        // Exact Prayer Time Alert
        const exactLogKey = `namaz_${p.name}_${todayKey}`;
        if (!sentLog[exactLogKey] && currentTimeStr === pTimeStr) {
          this.sendNotification(`🕌 Adhan: ${p.name} Prayer (${p.arabic})`, {
            body: `It is now time for ${p.name} prayer. Come to prayer, come to success! حي على الصلاة`,
            url: '/namaz',
            tag: `namaz-${p.name.toLowerCase()}`,
            requireInteraction: true,
          });

          // Play Adhan Sound & Voice Notification on prayer time
          if (settings.namaz.playAdhanAudio !== false) {
            adhanService.playAdhan(p.name, p.arabic);
          }

          markSent(exactLogKey);
        }

        // 15-Minute Pre-Prayer Reminder (if enabled)
        if (settings.namaz.prePrayerAlert) {
          const preMinutesTotal = pHours * 60 + pMinutes - 15;
          if (preMinutesTotal >= 0) {
            const preH = Math.floor(preMinutesTotal / 60);
            const preM = preMinutesTotal % 60;
            const preTimeStr = `${String(preH).padStart(2, '0')}:${String(preM).padStart(2, '0')}`;
            const preLogKey = `namaz_pre_${p.name}_${todayKey}`;

            if (!sentLog[preLogKey] && currentTimeStr === preTimeStr) {
              this.sendNotification(`⏳ 15 Mins to ${p.name} Prayer`, {
                body: `Prepare your heart, perform Wudu, and get ready for ${p.name} prayer in 15 minutes.`,
                url: '/namaz',
                tag: `pre-namaz-${p.name.toLowerCase()}`,
              });
              markSent(preLogKey);
            }
          }
        }
      });
    }

    // 2. Daily Ayah Reminder
    if (settings.dailyAyah.enabled) {
      const ayahLogKey = `daily_ayah_${todayKey}`;
      if (!sentLog[ayahLogKey] && currentTimeStr === settings.dailyAyah.time) {
        this.sendNotification('✨ Verse of the Day', {
          body: 'Open 619 Islam for your daily Quranic spiritual reflection and guidance.',
          url: '/quran',
          tag: 'daily-verse',
        });
        markSent(ayahLogKey);
      }
    }

    // 3. Daily Quran Reading Reminder
    if (settings.quranReminder.enabled) {
      const quranLogKey = `quran_reminder_${todayKey}`;
      if (!sentLog[quranLogKey] && currentTimeStr === settings.quranReminder.time) {
        this.sendNotification('📖 Daily Quran Reading Reminder', {
          body: 'Take 10 blessed minutes to recite the words of Allah tonight and boost your habit streak!',
          url: '/quran',
          tag: 'daily-quran-goal',
        });
        markSent(quranLogKey);
      }
    }

    // 4. Friday Special: Surah Al-Kahf Reminder (Every Friday)
    if (settings.surahKahfFriday.enabled && dayOfWeek === 5) {
      const kahfLogKey = `surah_kahf_${todayKey}`;
      if (!sentLog[kahfLogKey] && currentTimeStr === settings.surahKahfFriday.time) {
        this.sendNotification('🕌 Jumu\'ah Mubarak: Surah Al-Kahf', {
          body: 'Don\'t forget to recite Surah Al-Kahf today for continuous light until the next Friday!',
          url: '/quran/18',
          tag: 'friday-kahf',
          requireInteraction: true,
        });
        markSent(kahfLogKey);
      }
    }

    // 5. Nightly Surah Al-Mulk Reminder
    if (settings.surahMulkNight.enabled) {
      const mulkLogKey = `surah_mulk_${todayKey}`;
      if (!sentLog[mulkLogKey] && currentTimeStr === settings.surahMulkNight.time) {
        this.sendNotification('🛡️ Nightly Shield: Surah Al-Mulk', {
          body: 'Before you sleep, recite Surah Al-Mulk for protection in the grave. Tap to read now.',
          url: '/quran/67',
          tag: 'nightly-mulk',
        });
        markSent(mulkLogKey);
      }
    }

    // 6. Morning Azkar Reminder
    if (settings.morningAzkar.enabled) {
      const morningLogKey = `morning_azkar_${todayKey}`;
      if (!sentLog[morningLogKey] && currentTimeStr === settings.morningAzkar.time) {
        this.sendNotification('☀️ Morning Remembrance & Duas', {
          body: 'Fortify your morning with Sunnah Azkar and protection supplications.',
          url: '/duas',
          tag: 'morning-azkar',
        });
        markSent(morningLogKey);
      }
    }

    // 7. Evening Azkar Reminder
    if (settings.eveningAzkar.enabled) {
      const eveningLogKey = `evening_azkar_${todayKey}`;
      if (!sentLog[eveningLogKey] && currentTimeStr === settings.eveningAzkar.time) {
        this.sendNotification('🌅 Evening Remembrance & Duas', {
          body: 'Recite your evening protective Azkar and end your day in the gratitude of Allah.',
          url: '/duas',
          tag: 'evening-azkar',
        });
        markSent(eveningLogKey);
      }
    }

    // 8. Community Habits & Spiritual Challenges Reminders
    try {
      const habitsRaw = localStorage.getItem('619_community_habits_store');
      const userProgressRaw = localStorage.getItem('619_user_habits_progress');
      if (habitsRaw && userProgressRaw) {
        const habits = JSON.parse(habitsRaw);
        const progressMap = JSON.parse(userProgressRaw);
        
        habits.forEach((habit: any) => {
          if (progressMap[habit.id] && habit.reminderTime) {
            const isDone = progressMap[habit.id]?.completedDates?.includes(todayKey);
            const habitLogKey = `community_habit_${habit.id}_${todayKey}`;

            if (!isDone && !sentLog[habitLogKey] && currentTimeStr === habit.reminderTime) {
              this.sendNotification(`✨ Ummah Challenge: ${habit.title}`, {
                body: habit.description || 'Time to complete your joined community challenge and keep your streak alive!',
                url: '/habits',
                tag: `habit-${habit.id}`,
              });
              markSent(habitLogKey);
            }
          }
        });
      }
    } catch (e) {}
  }
};

