import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Goal } from '../types/goal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationEngine {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  static async scheduleGoalReminder(goal: Goal): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      await this.cancelGoalReminders(goal.id);

      let trigger: any = null;

      if (goal.reminderFrequency === '15m') {
        trigger = { seconds: 15 * 60, repeats: true };
      } else if (goal.reminderFrequency === '30m') {
        trigger = { seconds: 30 * 60, repeats: true };
      } else if (goal.reminderFrequency === '1h') {
        trigger = { seconds: 60 * 60, repeats: true };
      } else if (goal.reminderStartTime) {
        const [hourStr, minuteStr] = goal.reminderStartTime.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        if (!isNaN(hour) && !isNaN(minute)) {
          trigger = {
            hour,
            minute,
            repeats: true,
          };
        }
      }

      if (!trigger) return null;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `619 Reminder: ${goal.title}`,
          body: goal.description || 'Time to complete your daily goal!',
          sound: goal.notificationMode === 'Sound',
          data: { goalId: goal.id },
        },
        trigger,
      });

      return identifier;
    } catch (e) {
      console.warn('Failed to schedule notification:', e);
      return null;
    }
  }

  static async cancelGoalReminders(goalId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduled) {
        if (notification.content.data?.goalId === goalId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (e) {
      console.warn('Error cancelling notification:', e);
    }
  }

  static async cancelAll(): Promise<void> {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
