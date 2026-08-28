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

export const CURRENT_APP_VERSION = '2.5.0';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v2.5.0",
  features: [
    {
      icon: 'Users',
      title: 'Ummah Community Habit Hub & Challenges',
      description: 'Join collective spiritual challenges like Surah Al-Mulk, Morning Adhkar, Tahajjud, and Daily Istighfar. Track your daily good deeds alongside thousands of believers worldwide.',
      badge: 'Major'
    },
    {
      icon: 'Flame',
      title: 'Daily Check-Ins, Streaks & Motivation',
      description: '1-tap daily check-in with live Completed vs Pending counters, streak milestones, and live peer completion activity.',
      badge: 'New'
    },
    {
      icon: 'Bell',
      title: 'Automated Daily Habit Push Notifications',
      description: 'Receive personalized daily notifications at your habit reminder times to never break your spiritual consistency.',
      badge: 'New'
    },
    {
      icon: 'ShieldAlert',
      title: 'Admin Portal Challenge Publisher',
      description: 'Admins can now publish, customize, and feature community challenges with Hadith references, reminder times, and target durations.',
      badge: 'Admin'
    }
  ]
};
