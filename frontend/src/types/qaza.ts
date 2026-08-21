export type QazaPrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'witr';

export interface QazaPrayerCounts {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  witr: number;
}

export interface QazaData {
  totalTarget: QazaPrayerCounts;
  completed: QazaPrayerCounts;
  dailyGoal: number; // prayers per day target (e.g. 5)
  lastUpdated: string;
  startDate?: string;
  notes?: string;
}

export interface QazaLogEntry {
  id: string;
  date: string;
  prayer: QazaPrayerKey | 'full_day';
  count: number;
  timestamp: number;
}
