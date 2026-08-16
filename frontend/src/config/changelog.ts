export interface ChangelogItem {
  icon: string; // Lucide icon name or emoji
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
  headline: "What's New in 619 Islam",
  features: [
    {
      icon: 'KeyRound',
      title: '5-Minute Password Reset',
      description: 'Quickly recover and reset your account password with branded 5-minute security verification emails.',
      badge: 'New'
    },
    {
      icon: 'Volume2',
      title: 'Continuous Mushaf & Audio Player',
      description: 'Tap any verse in Mushaf mode to highlight and play. Redesigned floating player bar with 7 master reciters.',
      badge: 'Improved'
    },
    {
      icon: 'DownloadCloud',
      title: 'Single Voice Quran Downloader',
      description: 'Download the entire Holy Quran with your selected reciter for 100% offline recitation and study.',
      badge: 'New'
    },
    {
      icon: 'Sparkles',
      title: 'Automatic In-App Updates',
      description: 'Get the latest features and bug fixes instantly with 1-click in-app update notifications.',
      badge: 'Enhanced'
    }
  ]
};
