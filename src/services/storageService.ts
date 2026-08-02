import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, TaskCompletionRecord } from '../types/goal';
import { UserProfile, AppSettings } from '../types/user';
import { StreakData } from '../types/progress';
import { getTodayDateString } from '../utils/dateUtils';

const KEYS = {
  USER_PROFILE: '@619_user_profile',
  GOALS: '@619_goals',
  TASK_COMPLETIONS: '@619_task_completions',
  STREAK_DATA: '@619_streak_data',
  APP_SETTINGS: '@619_app_settings',
};

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
  // Profile
  static async getUserProfile(): Promise<UserProfile | null> {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  // Goals
  static async getGoals(): Promise<Goal[]> {
    const data = await AsyncStorage.getItem(KEYS.GOALS);
    return data ? JSON.parse(data) : [];
  }

  static async saveGoals(goals: Goal[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
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
    const data = await AsyncStorage.getItem(KEYS.TASK_COMPLETIONS);
    const list: TaskCompletionRecord[] = data ? JSON.parse(data) : [];
    if (date) {
      return list.filter((item) => item.date === date);
    }
    return list;
  }

  static async toggleTaskCompletion(goalId: string, date: string = getTodayDateString()): Promise<TaskCompletionRecord[]> {
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

    await AsyncStorage.setItem(KEYS.TASK_COMPLETIONS, JSON.stringify(all));
    return all;
  }

  // Streak
  static async getStreakData(): Promise<StreakData> {
    const data = await AsyncStorage.getItem(KEYS.STREAK_DATA);
    return data ? JSON.parse(data) : DEFAULT_STREAK;
  }

  static async saveStreakData(streak: StreakData): Promise<void> {
    await AsyncStorage.setItem(KEYS.STREAK_DATA, JSON.stringify(streak));
  }

  // Settings
  static async getSettings(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
  }

  // Backup & Restore
  static async exportAllData(): Promise<string> {
    const profile = await this.getUserProfile();
    const goals = await this.getGoals();
    const completions = await this.getCompletions();
    const streak = await this.getStreakData();
    const settings = await this.getSettings();

    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      goals,
      completions,
      streak,
      settings,
    });
  }

  static async importAllData(jsonStr: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) await this.saveUserProfile(data.profile);
      if (data.goals) await this.saveGoals(data.goals);
      if (data.completions) await AsyncStorage.setItem(KEYS.TASK_COMPLETIONS, JSON.stringify(data.completions));
      if (data.streak) await this.saveStreakData(data.streak);
      if (data.settings) await this.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }

  static async clearAllData(): Promise<void> {
    await AsyncStorage.clear();
  }
}
