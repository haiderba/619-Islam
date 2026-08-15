import type { UserProfile, AppSettings } from '../types/user';
import type { StreakData } from '../types/progress';
import type { UserProfileData } from '../types/auth';

// Helper function to get today's date in YYYY-MM-DD format based on local time
export const getTodayDateString = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

const KEYS = {
  USER_PROFILE: '@619_user_profile',
  AUTH_USER: '@619_auth_user',
  GOALS: '@619_goals',
  TASK_COMPLETIONS: '@619_task_completions',
  STREAK_DATA: '@619_streak_data',
  APP_SETTINGS: '@619_app_settings',
  CUSTOM_TASBEEHS: '@619_custom_tasbeehs',
};

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {}
}

async function safeRemoveItem(key: string): Promise<void> {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {}
}

async function safeClear(): Promise<void> {
  try {
    window.localStorage.clear();
  } catch (e) {}
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'Dark',
  language: 'English',
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  reminderInterval: 30,
  locationMode: 'auto',
  manualLocation: null,
  timezone: 'auto',
  timeFormat: '12hr',
};

export const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
};

export class StorageService {
  // Auth Session Persistence
  static async saveAuthSession(user: UserProfileData): Promise<void> {
    await safeSetItem(KEYS.AUTH_USER, JSON.stringify(user));
  }

  static async getAuthSession(): Promise<UserProfileData | null> {
    const data = await safeGetItem(KEYS.AUTH_USER);
    return data ? JSON.parse(data) : null;
  }

  static async clearAuthSession(): Promise<void> {
    await safeRemoveItem(KEYS.AUTH_USER);
  }

  // Profile
  static async getUserProfile(): Promise<UserProfile | null> {
    const data = await safeGetItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    await safeSetItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  // Settings
  static async getSettings(): Promise<AppSettings> {
    const data = await safeGetItem(KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    await safeSetItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
  }

  static async clearAllData(): Promise<void> {
    await safeClear();
  }
}
