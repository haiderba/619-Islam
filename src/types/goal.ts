export type GoalCategory = 'Islamic' | 'Health' | 'Learning' | 'Career' | 'Fitness' | 'Custom';

export type RepeatType = 'Daily' | 'Weekly' | 'Custom';

export type NotificationMode = 'Silent' | 'Sound' | 'Vibration';

export type ReminderFrequency = '15m' | '30m' | '1h' | 'FixedTimes' | 'Custom';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  description?: string;
  targetDays?: number; // Total days target (e.g. 40 days challenge)
  repeatType: RepeatType;
  selectedDays?: number[]; // [0=Sun, 1=Mon, ..., 6=Sat] for weekly
  reminderFrequency: ReminderFrequency;
  reminderIntervalMinutes?: number;
  reminderStartTime?: string; // HH:mm format (e.g. "05:00")
  reminderEndTime?: string; // HH:mm format (e.g. "22:00")
  notificationMode: NotificationMode;
  notes?: string;
  iconName?: string;
  createdAt: string; // ISO date string
  archived?: boolean;
}

export interface TaskCompletionRecord {
  goalId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO time
}
