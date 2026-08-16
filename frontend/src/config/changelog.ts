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

export const CURRENT_APP_VERSION = '1.8.2';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v1.8.2",
  features: [
    {
      icon: 'BookOpen',
      title: 'Dual Quran Translations (Primary & Secondary)',
      description: 'Display two languages simultaneously (e.g. English + Urdu or Urdu + Pashto). Primary language remains prominent and high-contrast, while secondary is displayed subtly.',
      badge: 'Major'
    },
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
      badge: 'New'
    },
    {
      icon: 'Zap',
      title: 'Smart Pull-to-Refresh & Session Resume',
      description: 'Pulling down to refresh or switching apps now opens instantly with zero splash delay and remembers where you left off.',
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
