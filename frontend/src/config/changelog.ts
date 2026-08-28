export interface ChangelogItem {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export interface AppRelease {
  version: string;
  releaseDate: string;
  headline: string;
  features: ChangelogItem[];
}

export const CURRENT_APP_VERSION = '2.5.5';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v2.5.5",
  features: [
    {
      icon: 'Flame',
      title: 'Dynamic Namaz 5-Prayer Card with Real-Time Adhan Time-Lock',
      description: 'Check off Fajr, Dhuhr, Asr, Maghrib, and Isha individually. Future prayers are locked until their Adhan time arrives based on live prayer timetables.',
      badge: 'Flagship'
    },
    {
      icon: 'Calendar',
      title: 'Namaz History & Missed Prayer Audit Calendar',
      description: 'Audit any past date to see which prayers were performed vs missed, with 1-tap make-up logging syncing directly with Qaza Tracker.',
      badge: 'New'
    },
    {
      icon: 'BookOpen',
      title: 'Progressive Quran Reading & Khatam Bookmark',
      description: 'Dynamically computes your next assigned Ayahs with Arabic calligraphy, Urdu/English translation, audio recitation, and Global Ummah 30-Juz distribution radar.',
      badge: 'Major'
    },
    {
      icon: 'Sparkles',
      title: 'In-Card Interactive Micro-Tasbeeh Counter',
      description: 'Tap the circular Tasbeeh ring directly inside the challenge card with haptic vibrations, +10 quick boost, and instant completion celebrations.',
      badge: 'New'
    },
    {
      icon: 'ShieldAlert',
      title: 'Contextual Admin Studio for Challenge Creators',
      description: 'Admin portal dynamically adjusts forms for Namaz rules, Quran Surah/Ayah pickers, Dhikr target counts, and Sunnah Fasting schedules.',
      badge: 'Admin'
    }
  ]
};
