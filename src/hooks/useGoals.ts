import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { NotificationEngine } from '../services/notificationEngine';
import { Goal, TaskCompletionRecord } from '../types/goal';
import { getTodayDateString } from '../utils/dateUtils';
import { calculateUpdatedStreak } from '../utils/streakUtils';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<TaskCompletionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGoalsAndCompletions = useCallback(async () => {
    setLoading(true);
    const today = getTodayDateString();
    const gList = await StorageService.getGoals();
    const cList = await StorageService.getCompletions(today);
    setGoals(gList);
    setCompletions(cList);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoalsAndCompletions();
  }, [fetchGoalsAndCompletions]);

  const addGoal = async (newGoal: Goal) => {
    const updated = await StorageService.addGoal(newGoal);
    setGoals(updated);

    // Schedule reminders
    if (newGoal.reminderFrequency) {
      await NotificationEngine.scheduleGoalReminder(newGoal);
    }

    return updated;
  };

  const deleteGoal = async (goalId: string) => {
    const updated = await StorageService.deleteGoal(goalId);
    setGoals(updated);
    await NotificationEngine.cancelGoalReminders(goalId);
    return updated;
  };

  const toggleTask = async (goalId: string) => {
    const today = getTodayDateString();
    const updatedCompletions = await StorageService.toggleTaskCompletion(goalId, today);
    const todayCompletions = updatedCompletions.filter((c) => c.date === today);
    setCompletions(todayCompletions);

    // Update streak data
    const currentStreakData = await StorageService.getStreakData();
    const updatedStreak = calculateUpdatedStreak(currentStreakData, true);
    await StorageService.saveStreakData(updatedStreak);
  };

  return {
    goals,
    completions,
    loading,
    addGoal,
    deleteGoal,
    toggleTask,
    refreshGoals: fetchGoalsAndCompletions,
  };
}
