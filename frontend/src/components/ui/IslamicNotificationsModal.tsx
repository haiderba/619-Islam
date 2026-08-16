import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Moon, 
  Sun, 
  AlertCircle,
  Play
} from 'lucide-react';
import { notificationService, NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '../../services/notificationService';

interface IslamicNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IslamicNotificationsModal: React.FC<IslamicNotificationsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSentType, setTestSentType] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(notificationService.getSettings());
      setPermission(notificationService.getPermissionState());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (updater: (prev: NotificationSettings) => NotificationSettings) => {
    setSettings(prev => {
      const next = updater(prev);
      notificationService.saveSettings(next);
      return next;
    });
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  const handleTest = async (type: 'namaz' | 'dailyAyah' | 'quran' | 'kahf' | 'mulk' | 'azkar') => {
    setTestSentType(type);
    await notificationService.sendTestNotification(type);
    setTimeout(() => {
      setTestSentType(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-amber-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-white/15 backdrop-blur-sm">
              <Bell className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Islamic Notifications</h2>
              <p className="text-white/80 text-xs font-medium">Namaz Adhan, Daily Verses, Quran & Azkar Reminders</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* 🔔 Permission Banner */}
          {permission !== 'granted' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300 font-medium leading-tight">
                  Enable device permissions to receive Adhan & prayer notifications.
                </p>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-all"
              >
                Enable
              </button>
            </div>
          )}

          {/* 1. 🕌 Namaz Prayer Time Notifications */}
          <div className="bg-surface/70 border border-border/80 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🕌</span>
                <div>
                  <h3 className="text-xs font-bold text-text">Namaz Adhan Reminders</h3>
                  <p className="text-[10px] text-subtext">Alert at exact prayer times for each Salah</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.namaz.enabled}
                  onChange={(e) => handleToggle(p => ({
                    ...p,
                    namaz: { ...p.namaz, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {settings.namaz.enabled && (
              <div className="space-y-2.5 pt-2 border-t border-border/50">
                <div className="grid grid-cols-5 gap-1.5">
                  {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(pr => (
                    <button
                      key={pr}
                      onClick={() => handleToggle(p => ({
                        ...p,
                        namaz: { ...p.namaz, [pr]: !p.namaz[pr] }
                      }))}
                      className={`p-2 rounded-xl text-center border capitalize text-xs font-bold transition-all ${
                        settings.namaz[pr]
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-card text-subtext border-border'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>

                {/* 15 Mins Before Reminder */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-subtext flex items-center gap-1.5">
                    <Clock size={13} className="text-primary" />
                    <span>15-Minute Pre-Prayer Alert (Wudu Time)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.namaz.prePrayerAlert}
                    onChange={(e) => handleToggle(p => ({
                      ...p,
                      namaz: { ...p.namaz, prePrayerAlert: e.target.checked }
                    }))}
                    className="accent-primary w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. ✨ Verse of the Day */}
          <div className="bg-surface/70 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <div>
                <h3 className="text-xs font-bold text-text">Verse of the Day</h3>
                <p className="text-[10px] text-subtext">Morning Quranic inspiration & wisdom</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.dailyAyah.time}
                onChange={(e) => handleToggle(p => ({
                  ...p,
                  dailyAyah: { ...p.dailyAyah, time: e.target.value }
                }))}
                className="bg-card border border-border rounded-xl px-2 py-1 text-[11px] font-bold text-text outline-none"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailyAyah.enabled}
                  onChange={(e) => handleToggle(p => ({
                    ...p,
                    dailyAyah: { ...p.dailyAyah, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* 3. 📖 Daily Quran Reading Goal */}
          <div className="bg-surface/70 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📖</span>
              <div>
                <h3 className="text-xs font-bold text-text">Daily Quran Habit Reminder</h3>
                <p className="text-[10px] text-subtext">Evening reminder to maintain your streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.quranReminder.time}
                onChange={(e) => handleToggle(p => ({
                  ...p,
                  quranReminder: { ...p.quranReminder, time: e.target.value }
                }))}
                className="bg-card border border-border rounded-xl px-2 py-1 text-[11px] font-bold text-text outline-none"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.quranReminder.enabled}
                  onChange={(e) => handleToggle(p => ({
                    ...p,
                    quranReminder: { ...p.quranReminder, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* 4. 🕌 Friday: Surah Al-Kahf */}
          <div className="bg-surface/70 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📜</span>
              <div>
                <h3 className="text-xs font-bold text-text">Friday Surah Al-Kahf</h3>
                <p className="text-[10px] text-subtext">Sunnah reminder on Friday morning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.surahKahfFriday.time}
                onChange={(e) => handleToggle(p => ({
                  ...p,
                  surahKahfFriday: { ...p.surahKahfFriday, time: e.target.value }
                }))}
                className="bg-card border border-border rounded-xl px-2 py-1 text-[11px] font-bold text-text outline-none"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.surahKahfFriday.enabled}
                  onChange={(e) => handleToggle(p => ({
                    ...p,
                    surahKahfFriday: { ...p.surahKahfFriday, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* 5. 🛡️ Nightly Surah Al-Mulk */}
          <div className="bg-surface/70 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <div>
                <h3 className="text-xs font-bold text-text">Nightly Surah Al-Mulk</h3>
                <p className="text-[10px] text-subtext">Protection in the grave before sleep</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={settings.surahMulkNight.time}
                onChange={(e) => handleToggle(p => ({
                  ...p,
                  surahMulkNight: { ...p.surahMulkNight, time: e.target.value }
                }))}
                className="bg-card border border-border rounded-xl px-2 py-1 text-[11px] font-bold text-text outline-none"
              />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.surahMulkNight.enabled}
                  onChange={(e) => handleToggle(p => ({
                    ...p,
                    surahMulkNight: { ...p.surahMulkNight, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* 6. 🤲 Morning & Evening Azkar */}
          <div className="bg-surface/70 border border-border/80 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🤲</span>
                <div>
                  <h3 className="text-xs font-bold text-text">Morning & Evening Azkar</h3>
                  <p className="text-[10px] text-subtext">Sunnah fortress of remembrance</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50">
              <div className="flex items-center justify-between bg-card p-2.5 rounded-xl border border-border">
                <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <Sun size={13} className="text-amber-400" /> Morning (06:45)
                </span>
                <input
                  type="checkbox"
                  checked={settings.morningAzkar.enabled}
                  onChange={(e) => handleToggle(p => ({
                    ...p,
                    morningAzkar: { ...p.morningAzkar, enabled: e.target.checked }
                  }))}
                  className="accent-primary w-4 h-4 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-card p-2.5 rounded-xl border border-border">
                <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                  <Moon size={13} className="text-indigo-400" /> Evening (17:30)
                </span>
                <input
                  type="checkbox"
                  checked={settings.eveningAzkar.enabled}
                  onChange={(e) => handleToggle(p => ({
                    ...p,
                    eveningAzkar: { ...p.eveningAzkar, enabled: e.target.checked }
                  }))}
                  className="accent-primary w-4 h-4 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 🧪 Test Notification Suite */}
          <div className="pt-2">
            <h4 className="text-[11px] font-bold text-subtext uppercase tracking-wider mb-2">
              🧪 Test Live Notifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleTest('namaz')}
                className="p-2 rounded-xl bg-surface hover:bg-border border border-border text-[11px] font-bold text-text flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Play size={11} className="text-emerald-400" />
                <span>Test Adhan Alert</span>
              </button>

              <button
                onClick={() => handleTest('dailyAyah')}
                className="p-2 rounded-xl bg-surface hover:bg-border border border-border text-[11px] font-bold text-text flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <Sparkles size={11} className="text-amber-400" />
                <span>Test Daily Verse</span>
              </button>

              <button
                onClick={() => handleTest('kahf')}
                className="p-2 rounded-xl bg-surface hover:bg-border border border-border text-[11px] font-bold text-text flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <BookOpen size={11} className="text-primary" />
                <span>Test Surah Kahf</span>
              </button>
            </div>
            {testSentType && (
              <p className="text-[11px] text-emerald-400 font-bold text-center mt-2 animate-in fade-in">
                ✓ Test notification sent! Check your notification tray.
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-surface/50 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
