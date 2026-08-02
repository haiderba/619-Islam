import { GoalCategory, RepeatType, NotificationMode, ReminderFrequency } from '../types/goal';

export interface GoalTemplate {
  id: string;
  title: string;
  category: GoalCategory;
  description: string;
  iconName: string;
  repeatType: RepeatType;
  reminderFrequency: ReminderFrequency;
  notificationMode: NotificationMode;
}

export const ISLAMIC_TEMPLATES: GoalTemplate[] = [
  {
    id: 'fajr-prayer',
    title: 'Fajr Prayer',
    category: 'Islamic',
    description: 'Pray Fajr on time daily. "Prayer is better than sleep."',
    iconName: 'sun',
    repeatType: 'Daily',
    reminderFrequency: 'FixedTimes',
    notificationMode: 'Sound',
  },
  {
    id: 'five-daily-prayers',
    title: '5 Daily Prayers',
    category: 'Islamic',
    description: 'Maintain all five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha).',
    iconName: 'check-square',
    repeatType: 'Daily',
    reminderFrequency: 'FixedTimes',
    notificationMode: 'Sound',
  },
  {
    id: 'morning-adhkar',
    title: 'Morning Adhkar',
    category: 'Islamic',
    description: 'Recite morning remembrance for protection and barakah.',
    iconName: 'sunrise',
    repeatType: 'Daily',
    reminderFrequency: '30m',
    notificationMode: 'Sound',
  },
  {
    id: 'evening-adhkar',
    title: 'Evening Adhkar',
    category: 'Islamic',
    description: 'Recite evening remembrance before sunset.',
    iconName: 'sunset',
    repeatType: 'Daily',
    reminderFrequency: '30m',
    notificationMode: 'Sound',
  },
  {
    id: 'quran-reading',
    title: 'Daily Quran Reading',
    category: 'Islamic',
    description: 'Read at least 1-2 pages of the Holy Quran daily.',
    iconName: 'book-open',
    repeatType: 'Daily',
    reminderFrequency: '1h',
    notificationMode: 'Sound',
  },
  {
    id: 'tahajjud',
    title: 'Tahajjud Prayer',
    category: 'Islamic',
    description: 'Wake up for night prayer before Fajr.',
    iconName: 'moon',
    repeatType: 'Daily',
    reminderFrequency: 'FixedTimes',
    notificationMode: 'Sound',
  },
  {
    id: 'friday-surah-kahf',
    title: 'Friday Surah Al-Kahf',
    category: 'Islamic',
    description: 'Recite Surah Al-Kahf every Friday.',
    iconName: 'book',
    repeatType: 'Weekly',
    reminderFrequency: '1h',
    notificationMode: 'Sound',
  },
];

export const GENERAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'workout',
    title: 'Daily Workout',
    category: 'Fitness',
    description: 'Physical exercise, gym, or home workout session.',
    iconName: 'activity',
    repeatType: 'Daily',
    reminderFrequency: '1h',
    notificationMode: 'Vibration',
  },
  {
    id: 'reading',
    title: 'Read a Book',
    category: 'Learning',
    description: 'Read 15-30 minutes of educational or self-improvement books.',
    iconName: 'book-open',
    repeatType: 'Daily',
    reminderFrequency: '1h',
    notificationMode: 'Sound',
  },
  {
    id: 'water-intake',
    title: 'Drink 3L Water',
    category: 'Health',
    description: 'Stay hydrated throughout the day.',
    iconName: 'droplet',
    repeatType: 'Daily',
    reminderFrequency: '15m',
    notificationMode: 'Silent',
  },
  {
    id: 'coding-study',
    title: 'Coding & Skill Study',
    category: 'Career',
    description: 'Dedicate 1 hour to coding or professional skill development.',
    iconName: 'code',
    repeatType: 'Daily',
    reminderFrequency: '1h',
    notificationMode: 'Sound',
  },
  {
    id: 'sleep-hygiene',
    title: 'Sleep Before 11 PM',
    category: 'Health',
    description: 'Ensure 7-8 hours of quality rest by going to bed early.',
    iconName: 'clock',
    repeatType: 'Daily',
    reminderFrequency: '30m',
    notificationMode: 'Sound',
  },
];
