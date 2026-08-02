import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Goal, TaskCompletionRecord } from '../types/goal';
import { UserProfile, AppSettings } from '../types/user';
import { StreakData } from '../types/progress';
import { TasbeehItem } from '../types/tasbeeh';
import { UserProfileData } from '../types/auth';
import { getTodayDateString } from '../utils/dateUtils';

const KEYS = {
  USER_PROFILE: '@619_user_profile',
  AUTH_USER: '@619_auth_user',
  GOALS: '@619_goals',
  TASK_COMPLETIONS: '@619_task_completions',
  STREAK_DATA: '@619_streak_data',
  APP_SETTINGS: '@619_app_settings',
  CUSTOM_TASBEEHS: '@619_custom_tasbeehs',
};

const inMemoryStore: Record<string, string> = {};

async function safeGetItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
    const val = await AsyncStorage.getItem(key);
    return val;
  } catch (e) {
    return inMemoryStore[key] || null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  inMemoryStore[key] = value;
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // In-memory store updated
  }
}

async function safeRemoveItem(key: string): Promise<void> {
  delete inMemoryStore[key];
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    await AsyncStorage.removeItem(key);
  } catch (e) {}
}

async function safeClear(): Promise<void> {
  Object.keys(inMemoryStore).forEach((k) => delete inMemoryStore[k]);
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    await AsyncStorage.clear();
  } catch (e) {
    // Ignore clear error
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'Dark',
  language: 'English',
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  reminderInterval: 30,
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

  // Goals
  static async getGoals(): Promise<Goal[]> {
    const data = await safeGetItem(KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  }

  static async saveGoals(goals: Goal[]): Promise<void> {
    await safeSetItem(KEYS.GOALS, JSON.stringify(goals));
  }

  static async addGoal(goal: Goal): Promise<Goal[]> {
    const goals = await this.getGoals();
    const updated = [goal, ...goals];
    await this.saveGoals(updated);
    return updated;
  }

  static async deleteGoal(goalId: string): Promise<Goal[]> {
    const goals = await this.getGoals();
    const updated = goals.filter((g) => g.id !== goalId);
    await this.saveGoals(updated);
    return updated;
  }

  // Task Completions
  static async getCompletions(date?: string): Promise<TaskCompletionRecord[]> {
    const data = await safeGetItem(KEYS.TASK_COMPLETIONS);
    const list: TaskCompletionRecord[] = data ? JSON.parse(data) : [];
    if (date) {
      return list.filter((item) => item.date === date);
    }
    return list;
  }

  static async toggleTaskCompletion(
    goalId: string,
    date: string = getTodayDateString()
  ): Promise<TaskCompletionRecord[]> {
    const all = await this.getCompletions();
    const existingIndex = all.findIndex((c) => c.goalId === goalId && c.date === date);

    if (existingIndex >= 0) {
      all[existingIndex].completed = !all[existingIndex].completed;
      if (all[existingIndex].completed) {
        all[existingIndex].completedAt = new Date().toISOString();
      }
    } else {
      all.push({
        goalId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }

    await safeSetItem(KEYS.TASK_COMPLETIONS, JSON.stringify(all));
    return all;
  }

  // Custom Tasbeehs
  static async getCustomTasbeehs(): Promise<TasbeehItem[]> {
    const data = await safeGetItem(KEYS.CUSTOM_TASBEEHS);
    return data ? JSON.parse(data) : [];
  }

  static async addCustomTasbeeh(tasbeeh: TasbeehItem): Promise<TasbeehItem[]> {
    const list = await this.getCustomTasbeehs();
    const updated = [tasbeeh, ...list];
    await safeSetItem(KEYS.CUSTOM_TASBEEHS, JSON.stringify(updated));
    return updated;
  }

  static async deleteCustomTasbeeh(id: string): Promise<TasbeehItem[]> {
    const list = await this.getCustomTasbeehs();
    const updated = list.filter((t) => t.id !== id);
    await safeSetItem(KEYS.CUSTOM_TASBEEHS, JSON.stringify(updated));
    return updated;
  }

  // Streak
  static async getStreakData(): Promise<StreakData> {
    const data = await safeGetItem(KEYS.STREAK_DATA);
    return data ? JSON.parse(data) : DEFAULT_STREAK;
  }

  static async saveStreakData(streak: StreakData): Promise<void> {
    await safeSetItem(KEYS.STREAK_DATA, JSON.stringify(streak));
  }

  // Settings
  static async getSettings(): Promise<AppSettings> {
    const data = await safeGetItem(KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    await safeSetItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
  }

  // Backup & Restore
  static async exportAllData(): Promise<string> {
    const profile = await this.getUserProfile();
    const goals = await this.getGoals();
    const completions = await this.getCompletions();
    const streak = await this.getStreakData();
    const settings = await this.getSettings();
    const tasbeehs = await this.getCustomTasbeehs();

    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      goals,
      completions,
      streak,
      settings,
      tasbeehs,
    });
  }

  static async importAllData(jsonStr: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) await this.saveUserProfile(data.profile);
      if (data.goals) await this.saveGoals(data.goals);
      if (data.completions) await safeSetItem(KEYS.TASK_COMPLETIONS, JSON.stringify(data.completions));
      if (data.streak) await this.saveStreakData(data.streak);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.tasbeehs) await safeSetItem(KEYS.CUSTOM_TASBEEHS, JSON.stringify(data.tasbeehs));
      return true;
    } catch {
      return false;
    }
  }

  static async clearAllData(): Promise<void> {
    await safeClear();
  }
}
