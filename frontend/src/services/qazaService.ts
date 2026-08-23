import { QazaData, QazaPrayerKey, QazaLogEntry } from '../types/qaza';
import { api } from '../config/api';

const QAZA_STORAGE_KEY = '619_qaza_namaz_data';
const QAZA_LOGS_KEY = '619_qaza_namaz_logs';

export const DEFAULT_QAZA_DATA: QazaData = {
  totalTarget: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  },
  completed: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  },
  dailyGoal: 5,
  lastUpdated: new Date().toISOString(),
  startDate: new Date().toISOString(),
};

export const qazaService = {
  getData(): QazaData {
    try {
      const raw = localStorage.getItem(QAZA_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_QAZA_DATA, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed to load Qaza data', e);
    }
    return DEFAULT_QAZA_DATA;
  },

  saveData(data: QazaData): void {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(QAZA_STORAGE_KEY, JSON.stringify(data));

    // Async sync to server if available
    try {
      api.post('/user/qaza-progress', data).catch(() => {});
    } catch (e) {}
  },

  getLogs(): QazaLogEntry[] {
    try {
      const raw = localStorage.getItem(QAZA_LOGS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}
    return [];
  },

  addLog(prayer: QazaPrayerKey | 'full_day', count: number = 1): void {
    const logs = this.getLogs();
    const entry: QazaLogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      prayer,
      count,
      timestamp: Date.now(),
    };
    logs.unshift(entry);
    // Keep max 100 history entries
    localStorage.setItem(QAZA_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  },

  incrementPrayer(prayer: QazaPrayerKey, amount: number = 1): QazaData {
    const data = this.getData();
    const current = data.completed[prayer] || 0;
    const target = data.totalTarget[prayer] || 0;
    
    // Increment completed (cap at total target if set)
    const newCompleted = Math.max(0, current + amount);
    data.completed[prayer] = newCompleted;

    // If target is less than completed, adjust target
    if (target > 0 && newCompleted > target) {
      data.totalTarget[prayer] = newCompleted;
    }

    this.saveData(data);
    this.addLog(prayer, amount);
    return data;
  },

  incrementFullDay(amount: number = 1): QazaData {
    const data = this.getData();
    const prayers: QazaPrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'];

    prayers.forEach(p => {
      data.completed[p] = Math.max(0, (data.completed[p] || 0) + amount);
      if (data.totalTarget[p] > 0 && data.completed[p] > data.totalTarget[p]) {
        data.totalTarget[p] = data.completed[p];
      }
    });

    this.saveData(data);
    this.addLog('full_day', amount);
    return data;
  },

  calculateMissedPrayers(
    years: number,
    months: number = 0,
    days: number = 0,
    includeWitr: boolean = true
  ): QazaData {
    const totalDays = Math.round(years * 365.25 + months * 30.4 + days);
    const data = this.getData();

    data.totalTarget = {
      fajr: totalDays,
      dhuhr: totalDays,
      asr: totalDays,
      maghrib: totalDays,
      isha: totalDays,
      witr: includeWitr ? totalDays : 0,
    };

    data.startDate = new Date().toISOString();
    this.saveData(data);
    return data;
  },

  getTodayLogs(): QazaLogEntry[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.getLogs().filter(l => l.date === today);
  },

  getTodayCompletedCount(): number {
    return this.getTodayLogs().reduce((acc, log) => {
      if (log.prayer === 'full_day') {
        return acc + (log.count * 6);
      }
      return acc + log.count;
    }, 0);
  },

  setDailyGoal(goal: number): QazaData {
    const data = this.getData();
    data.dailyGoal = Math.max(1, goal);
    this.saveData(data);
    return data;
  },

  deleteLog(id: string): { data: QazaData; logs: QazaLogEntry[] } {
    const logs = this.getLogs();
    const targetLog = logs.find(l => l.id === id);
    const data = this.getData();

    if (targetLog) {
      if (targetLog.prayer === 'full_day') {
        const prayers: QazaPrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'];
        prayers.forEach(p => {
          data.completed[p] = Math.max(0, (data.completed[p] || 0) - targetLog.count);
        });
      } else {
        data.completed[targetLog.prayer] = Math.max(0, (data.completed[targetLog.prayer] || 0) - targetLog.count);
      }
      this.saveData(data);
    }

    const updatedLogs = logs.filter(l => l.id !== id);
    localStorage.setItem(QAZA_LOGS_KEY, JSON.stringify(updatedLogs));
    return { data, logs: updatedLogs };
  },

  resetAll(): void {
    localStorage.removeItem(QAZA_STORAGE_KEY);
    localStorage.removeItem(QAZA_LOGS_KEY);
  },

  resetData(mode: 'all' | 'completed' | 'targets'): QazaData {
    const current = this.getData();
    if (mode === 'all') {
      localStorage.removeItem(QAZA_STORAGE_KEY);
      localStorage.removeItem(QAZA_LOGS_KEY);
      return DEFAULT_QAZA_DATA;
    } else if (mode === 'completed') {
      current.completed = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
      localStorage.removeItem(QAZA_LOGS_KEY);
      this.saveData(current);
      return current;
    } else if (mode === 'targets') {
      current.totalTarget = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
      this.saveData(current);
      return current;
    }
    return current;
  }
};
