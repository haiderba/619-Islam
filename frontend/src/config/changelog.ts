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

export const CURRENT_APP_VERSION = '1.7.4';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v1.7.4",
  features: [
    {
      icon: 'Play',
      title: 'Grand Mosque Video Splash Screen',
      description: 'Startup animation centered in the illuminated mosque archway with audio playback, sound controls, and fast skip.',
      badge: 'Visual'
    },
    {
      icon: 'Smartphone',
      title: 'Universal Multi-Device Responsiveness',
      description: 'Adaptive 12-column layouts and responsive multi-column cards across Mobile, Tablets, Laptops & Desktop monitors.',
      badge: 'Major'
    },
    {
      icon: 'Zap',
      title: 'Smart Pull-to-Refresh & Session Resume',
      description: 'Pulling down to refresh or switching apps now opens instantly with zero splash delay and remembers where you left off.',
      badge: 'New'
    },
    {
      icon: 'BookOpen',
      title: 'Pashto & Regional Quran Translations',
      description: 'Official Pashto (Zakaria Abulsalam), Sindhi, Dr. Israr Ahmad (Bayan-ul-Quran), and Roman Urdu translations available.',
      badge: 'New'
    },
    {
      icon: 'RefreshCw',
      title: 'In-App Update Checker & Reinstall Tool',
      description: 'Check live server updates in real-time, receive mobile push alerts, and easily troubleshoot or reset cache from Settings.',
      badge: 'New'
    }
  ]
};
