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

export const CURRENT_APP_VERSION = '2.7.0';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'August 2026',
  headline: "What's New in Update v2.7.0",
  features: [
    {
      icon: 'KeyRound',
      title: '6-Digit Password Reset Code (OTP)',
      description: 'Password reset now sends a 6-digit verification code with in-place reset forms on web and mobile, in addition to direct reset links.',
      badge: 'Major'
    },
    {
      icon: 'ShieldCheck',
      title: 'Bulletproof Email & Username Registration Security',
      description: 'Enforced unique email and username verification guards preventing multi-username signup abuse and race conditions.',
      badge: 'Security'
    },
    {
      icon: 'Mail',
      title: 'In-Place Email OTP Verification on Sign In',
      description: 'Unverified accounts now trigger an immediate in-place 6-digit OTP verification prompt with 1-tap resend.',
      badge: 'Auth'
    },
    {
      icon: 'Headphones',
      title: 'Ambient Haram & Masjid Focus Soundscapes',
      description: 'Immerse in peaceful ambient audio while reciting Quran or Dhikr (Madinah Munawwarah birds, Makkah rain on Ka\'bah marble, Al-Aqsa garden breeze).',
      badge: 'Audio'
    },
    {
      icon: 'Sparkles',
      title: 'Daily Micro-Sunnah of the Day (< 60 Seconds)',
      description: 'Revive 30 authentic daily micro-Sunnahs with Hadith references and 1-tap "I Revived This Sunnah Today 👑" tracking.',
      badge: 'New'
    },
    {
      icon: 'Droplets',
      title: 'Virtual Jannah Ummah Tree of Good Deeds',
      description: 'Watch an animated SVG tree blossom with radiant leaves and golden fruits as the global Ummah fulfills prayers, dhikr, and Quran verses together.',
      badge: 'Visual'
    },
    {
      icon: 'Moon',
      title: 'Sacred Seasons & Khatam 30-Day Bootcamp',
      description: 'Calculate exact Quran pacing (4 pages/prayer = 1 Juz/day = Khatam in 30 days) and GPS-accurate Last Third of Night (Tahajjud) prime prayer window.',
      badge: 'New'
    }
  ]
};
