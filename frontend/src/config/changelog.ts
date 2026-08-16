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

export const CURRENT_APP_VERSION = '1.6.9';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v1.6.9",
  features: [
    {
      icon: 'Library',
      title: 'Islamic Digital Library & Books',
      description: 'Explore classical Islamic texts, hadith anthologies, and jurisprudence with multi-tradition filtering (Sunni, Shia, Hanafi, General).',
      badge: 'Major'
    },
    {
      icon: 'BookOpen',
      title: 'Integrated Multi-Language Reader',
      description: 'Read in authentic Arabic (RTL), Urdu, and English with custom text size, Sepia / Dark / Light themes, and Table of Contents.',
      badge: 'New'
    },
    {
      icon: 'Bookmark',
      title: 'My Library & Offline Downloads',
      description: 'Save favorites, track your reading progress %, add bookmarks with notes, and download permitted books for 100% offline reading.',
      badge: 'New'
    },
    {
      icon: 'Calendar',
      title: 'Unified Multi-Date Header',
      description: 'Gregorian, Islamic Hijri, and traditional Desi solar calendars beautifully consolidated on Dashboard and Prayer Times.',
      badge: 'Improved'
    }
  ]
};
