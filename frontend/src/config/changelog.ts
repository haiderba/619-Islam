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

export const CURRENT_APP_VERSION = '2.8.0';

export const LATEST_RELEASE: AppRelease = {
  version: CURRENT_APP_VERSION,
  releaseDate: 'September 2026',
  headline: "What's New in Update v2.8.0",
  features: [
    {
      icon: 'Sparkles',
      title: 'Dynamic Island & Notch Safe-Area Optimization',
      description: 'Full responsive layout support for iPhone 15 Pro Max, iPads, and Android devices. Headers, status bar clocks, and navigation bars now fit with pixel-perfect clearance.',
      badge: 'Design'
    },
    {
      icon: 'ShieldCheck',
      title: 'Responsive Grid & Quran Tab Fitting',
      description: 'Refined Quick Access 8-grid and Quran browse tabs to eliminate all text truncation across all phone screen sizes.',
      badge: 'UI/UX'
    },
    {
      icon: 'Mail',
      title: 'Smart Email Typo Auto-Correction',
      description: 'Automatic domain typo correction (.con to .com) and immediate verification feedback on password reset and registration.',
      badge: 'Security'
    },
    {
      icon: 'RefreshCw',
      title: 'Instant 1-Tap Update & Cache Sync',
      description: 'Streamlined background update delivery and cache refresh for seamless PWA and mobile performance.',
      badge: 'Core'
    }
  ]
};
