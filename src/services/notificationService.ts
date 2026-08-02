import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { calculatePrayerTimes, PrayerTime } from '@/utils/prayerTimesUtils';

// Configure notification behavior for Expo SDK 57
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  // Request Notification Permissions
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '619 Discipline & Prayer Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }

    return true;
  }

  // Schedule Prayer Time Alerts (5 minutes before each prayer)
  static async schedulePrayerReminders(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Clear previous prayer notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const times: PrayerTime[] = calculatePrayerTimes();
    const now = new Date();

    for (const p of times) {
      if (p.name === 'Sunrise') continue; // Skip Sunrise

      const [hoursStr, minutesStr] = p.time.split(':');
      const prayerDate = new Date();
      prayerDate.setHours(parseInt(hoursStr, 10), parseInt(minutesStr, 10), 0, 0);

      // 5 minutes before prayer
      const alertDate = new Date(prayerDate.getTime() - 5 * 60 * 1000);

      if (alertDate > now) {
        const secondsUntilAlert = Math.floor((alertDate.getTime() - now.getTime()) / 1000);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🕌 ${p.name} Prayer in 5 Minutes`,
            body: `Prepare for ${p.name} prayer. Time: ${p.time}. "Success belongs to the believers."`,
            sound: true,
            data: { type: 'prayer', prayerName: p.name },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.max(1, secondsUntilAlert),
          },
        });
      }
    }
  }

  // Schedule Daily Habit Reminder Notification
  static async scheduleDailyHabitReminder(hour: number = 20, minute: number = 0): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 619 Daily Discipline Check-in',
        body: "Don't break your streak! Check off your daily goals and Habit Hub tasks.",
        sound: true,
        data: { type: 'goal_checkin' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });
  }

  // Cancel all scheduled notifications
  static async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
