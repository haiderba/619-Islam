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

export const CURRENT_APP_VERSION = '2.5.6';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v2.5.6",
  features: [
    {
      icon: 'Volume2',
      title: 'Voice Adhan Notification & Aloud Prayer Call',
      description: 'Prayer time notifications now speak aloud ("Allahu Akbar, it is now time for Maghrib prayer. Come to prayer") and play full authentic Adhan audio.',
      badge: 'Voice'
    },
    {
      icon: 'Radio',
      title: 'Resilient Multi-CDN Adhan Audio Engine',
      description: 'Removed strict CORS restrictions and added automated fallback mirrors ensuring Adhan audio plays reliably across all browsers and devices.',
      badge: 'Audio'
    },
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
    }
  ]
};
