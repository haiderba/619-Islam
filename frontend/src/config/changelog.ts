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

export const CURRENT_APP_VERSION = '1.3.0';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v1.3.0",
  features: [
    {
      icon: 'Sun',
      title: 'Desi Solar Calendar (Sawan, Bhadon)',
      description: 'Track traditional Punjabi/Bikrami Desi months and dates directly on your Dashboard and Prayer Times screens.',
      badge: 'New'
    },
    {
      icon: 'KeyRound',
      title: '5-Minute Password Reset',
      description: 'Quickly recover and reset your password with branded 5-minute security verification emails sent directly to your inbox.',
      badge: 'New'
    },
    {
      icon: 'Volume2',
      title: 'Continuous Mushaf & Audio Player',
      description: 'Tap any verse in Mushaf mode to highlight and listen with 7 master reciters on the new floating player bar.',
      badge: 'Improved'
    },
    {
      icon: 'Sparkles',
      title: 'Instant In-App Updates',
      description: 'Seamless 1-click update experience without ever having to delete or reinstall the app.',
      badge: 'Enhanced'
    }
  ]
};
