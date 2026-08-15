import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { api } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { getTodayDateString } from '@/utils/dateUtils';

export function useNotificationObserver() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const { actionIdentifier, notification } = response;
      const data = notification.request.content.data;

      if (actionIdentifier === 'mark_done' && data.type === 'prayer') {
        const prayerName = data.prayerName;
        await handleMarkAsDone(prayerName);
      } else if (actionIdentifier === 'snooze') {
        // Handle snooze logic - schedule another notification in 10 minutes
        await Notifications.scheduleNotificationAsync({
          content: {
            ...notification.request.content,
            title: `⏰ Reminder: ${notification.request.content.title}`,
          },
          trigger: { seconds: 10 * 60 },
        });
      }
    });

    return () => subscription.remove();
  }, [session]);

  const handleMarkAsDone = async (prayerName: string) => {
    if (!session?.user) return;

    try {
      const today = getTodayDateString();

      // 1. Find a goal that matches this prayer
      const { data: goals } = await api.get('/goals');
      const goal = goals?.find((g: any) => g.title.toLowerCase().includes(prayerName.toLowerCase()));

      if (!goal) {
        console.log('No matching goal found for prayer:', prayerName);
        return;
      }

      // 2. Mark as completed
      await api.post('/progress/toggle', { goal_id: goal.id, date: today });
      console.log(`Successfully marked ${prayerName} as done via notification.`);
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };
}
