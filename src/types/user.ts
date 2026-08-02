export type AppLanguage = 'English' | 'Urdu';

export type AppTheme = 'Dark' | 'Light' | 'System';

export type UserGoalFocus = 'My Deen' | 'My Health' | 'My Knowledge' | 'My Career' | 'My Habits' | 'Custom';

export interface UserProfile {
  name: string;
  language: AppLanguage;
  focusAreas: UserGoalFocus[];
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: AppTheme;
  language: AppLanguage;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  reminderInterval: number; // in minutes
}
