import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Goal, TaskCompletionRecord } from '@/types/goal';
import { getTodayDateString } from '@/utils/dateUtils';
import { api } from '@/config/api';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<TaskCompletionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGoalsAndCompletions = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setCompletions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = getTodayDateString();

    try {
      // Fetch Goals
      const goalsRes = await api.get('/goals');
      const goalsData = goalsRes.data;

      // Fetch Completions
      const compRes = await api.get('/progress');
      const compData = compRes.data;

      setGoals(
        (goalsData || []).map((g: any) => ({
          id: g.id,
          title: g.title,
          category: g.category,
          createdAt: g.created_at,
          icon: 'target',
          repeatType: 'Daily',
          reminderFrequency: 'Custom',
          notificationMode: 'Silent'
        })) as Goal[]
      );

      setCompletions(
        (compData || []).filter((c: any) => c.date === today && c.completed).map((c: any) => ({
          goalId: c.goal_id,
          date: c.date,
          completed: true,
          completedAt: c.completed_at,
        }))
      );
    } catch (e) {
      console.error('Error fetching goals:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoalsAndCompletions();
  }, [fetchGoalsAndCompletions]);

  const addGoal = async (newGoal: Goal) => {
    if (!user) return [];

    try {
      const res = await api.post('/goals', {
        id: Math.random().toString(36).substring(7),
        title: newGoal.title,
        category: newGoal.category || 'Custom',
        repeat_type: 'Daily',
        reminder_frequency: 'Custom',
        notification_mode: 'Silent'
      });
      const data = res.data;

      const updatedGoals = [...goals, {
        id: data.id,
        title: data.title,
        category: data.category,
        createdAt: data.created_at,
        icon: 'target',
        repeatType: 'Daily',
        reminderFrequency: 'Custom',
        notificationMode: 'Silent'
      } as Goal];

      setGoals(updatedGoals);
      return updatedGoals;
    } catch (e) {
      console.error('Error adding goal:', e);
      return goals;
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return [];

    try {
      await api.delete(`/goals/${goalId}`);
      const updatedGoals = goals.filter((g) => g.id !== goalId);
      setGoals(updatedGoals);
      return updatedGoals;
    } catch (e) {
      console.error('Error deleting goal:', e);
      return goals;
    }
  };

  const toggleTask = async (goalId: string) => {
    if (!user) return;

    const today = getTodayDateString();
    const isCompleted = completions.some(c => c.goalId === goalId && c.date === today);

    try {
      const res = await api.post('/progress', {
        goal_id: goalId,
        date: today,
        completed: !isCompleted
      });

      if (res.data.completed) {
        setCompletions([...completions, {
          goalId: res.data.goal_id,
          date: res.data.date,
          completed: true,
          completedAt: res.data.completed_at
        }]);
      } else {
        setCompletions(completions.filter(c => c.goalId !== goalId));
      }
    } catch (e) {
      console.error('Error toggling task:', e);
    }
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
