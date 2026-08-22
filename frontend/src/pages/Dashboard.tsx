import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import { useStreak } from '../hooks/useStreak';
import { getTodayDateString } from '../utils/dateUtils';
import { 
  Target, 
  Clock, 
  Book, 
  BookOpen, 
  MapPin, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Moon, 
  Heart,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNamaz } from '../hooks/useNamaz';
import DailyAyahCard from '../components/dashboard/DailyAyahCard';
import IslamicEventsModal from '../components/dashboard/IslamicEventsModal';
import MoonSightingModal from '../components/dashboard/MoonSightingModal';
import { CreditsModal } from '../components/ui/CreditsModal';
import { getDesiDate } from '../utils/desiDateUtils';
import { getUpcomingIslamicEvent } from '../utils/islamicEvents';
import { getMoonPhase } from '../utils/lunarEngine';
import { TopInstallButton } from '../components/ui/InstallPrompt';

const PRAYERS_LIST = [
  { key: 'Fajr', name: 'Fajr', arabic: 'الفجر' },
  { key: 'Dhuhr', name: 'Dhuhr', arabic: 'الظهر' },
  { key: 'Asr', name: 'Asr', arabic: 'العصر' },
  { key: 'Maghrib', name: 'Maghrib', arabic: 'المغرب' },
  { key: 'Isha', name: 'Isha', arabic: 'العشاء' },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { goals, completions, toggleTask, loading } = useGoals();
  const { streakData } = useStreak();
  const { timings, hijriDate, locationName } = useNamaz();
  const navigate = useNavigate();

  const [showEventsModal, setShowEventsModal] = useState<boolean>(false);
  const [showMoonModal, setShowMoonModal] = useState<boolean>(false);
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(false);
  
  const desiDate = getDesiDate();
  const today = getTodayDateString();
  const gregorianFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());
  
  const todayCompletions = completions.filter(c => c.date === today && c.completed);

  const isCompleted = (goalId: string) => {
    return completions.some(c => c.goalId === goalId && c.date === today && c.completed);
  };

  const progressPercentage = goals.length > 0 
    ? Math.round((todayCompletions.length / goals.length) * 100) 
    : 0;

  // Real-time Moon Phase & Observatory Data
  const todayMoon = getMoonPhase(new Date());
  const moonEmojis: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘'
  };
  const moonEmoji = moonEmojis[todayMoon.phaseName] || '🌙';

  // Compute Current Hijri Month & Day
  const currentHijriMonthNum = (hijriDate?.month as any)?.number || 3;
  const currentHijriDayNum = parseInt(hijriDate?.day || '3', 10);
  const upcomingIslamicEvent = getUpcomingIslamicEvent(currentHijriMonthNum, currentHijriDayNum);

  // Compute Next Prayer
  const getNextPrayerInfo = () => {
    if (!timings) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const prayer of PRAYERS_LIST) {
      const timeStr = timings[prayer.key as keyof typeof timings];
      if (!timeStr) continue;
      
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        return { name: prayer.name, arabic: prayer.arabic, time: timeStr };
      }
    }
    return { name: 'Fajr', arabic: 'الفجر', time: timings.Fajr };
  };

  const nextPrayer = getNextPrayerInfo();

  // 8 Clean Quick Features (4x2 Modern Balanced Grid)
  const QUICK_TOOLS = [
    {
      id: 'namaz',
      title: 'Namaz',
      to: '/namaz',
      icon: <Clock size={20} className="text-amber-400" />,
    },
    {
      id: 'quran',
      title: 'Quran',
      to: '/quran',
      icon: <Book size={20} className="text-amber-400" />,
    },
    {
      id: 'sleep-station',
      title: 'Sleep Sanctuary',
      to: '/sleep-station',
      icon: <Moon size={20} className="text-cyan-400" />,
    },
    {
      id: 'tasbeeh',
      title: 'Tasbeeh',
      to: '/tasbeeh',
      icon: <span className="text-lg">📿</span>,
    },
    {
      id: 'duas',
      title: 'Duas & Azkar',
      to: '/duas',
      icon: <BookOpen size={20} className="text-amber-400" />,
    },
    {
      id: 'qaza',
      title: 'Qaza Tracker',
      to: '/qaza',
      icon: <Target size={20} className="text-emerald-400" />,
    },
    {
      id: 'books',
      title: 'Library',
      to: '/books',
      icon: <BookMarked size={20} className="text-indigo-400" />,
    },
    {
      id: 'features',
      title: 'All Tools',
      to: '/features',
      icon: <Sparkles size={20} className="text-amber-400" />,
    },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-5 pb-32 max-w-4xl mx-auto">
      
      {/* ── 1. Top Header Greeting ── */}
      <header className="pt-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight truncate">
            Assalamu Alaikum, {user?.name?.split(' ')[0] || user?.username} 👋
          </h1>
          <p className="text-xs text-subtext font-medium mt-0.5">
            May your day be filled with barakah & peace.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <TopInstallButton />
          <button
            onClick={() => setShowCreditsModal(true)}
            className="p-2 rounded-2xl bg-surface border border-border text-subtext hover:text-amber-400 transition-colors active:scale-95 shadow-sm"
            title="App Credits & Dua"
          >
            <Heart size={18} className="hover:fill-amber-400/20" />
          </button>
        </div>
      </header>

      {/* ── 2. Master Spiritual Header Card (Clean, Uncluttered & Premium) ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/35 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-teal-950/20 relative overflow-hidden space-y-3.5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Line: Hijri Date & Fast Access Badges */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div 
            onClick={() => setShowEventsModal(true)}
            className="min-w-0 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                {hijriDate ? `${hijriDate.day} ${hijriDate.month.en}` : 'Loading date...'}
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {hijriDate?.year || '1448'} AH
              </span>
            </div>
            
            <p className="text-[11px] text-white/70 font-medium mt-0.5">
              {gregorianFormatted} • {desiDate.day} {desiDate.monthEn} <span className="font-urdu text-[10px] text-emerald-300">({desiDate.monthUr})</span>
            </p>
          </div>

          {/* Quick Buttons: Moon & Calendar Events */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowMoonModal(true)}
              className="px-2.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-500/30 text-xs font-bold flex items-center gap-1 text-amber-300 active:scale-95 transition-all backdrop-blur-md"
              title="Moon Sighting & Phase"
            >
              <span>{moonEmoji}</span>
              <span className="text-[10px] font-black">{todayMoon.illumination}%</span>
            </button>

            <button
              onClick={() => setShowEventsModal(true)}
              className="px-2.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center gap-1 text-white/90 active:scale-95 transition-all backdrop-blur-md"
              title="Islamic Events"
            >
              <span>🗓️</span>
              <span className="text-[10px]">Events</span>
            </button>
          </div>
        </div>

        {/* Bottom Banner: Next Prayer & Location */}
        <div className="bg-black/35 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 relative z-10">
          <div 
            onClick={() => navigate('/namaz')}
            className="flex items-center gap-2 min-w-0 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Clock size={15} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-white/60 block leading-tight">Next Prayer</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 group-hover:underline">
                  {nextPrayer ? `${nextPrayer.name} at ${nextPrayer.time}` : 'Loading prayers...'}
                </span>
                {nextPrayer && (
                  <span className="text-[10px] font-arabic text-amber-400/90 font-bold">
                    ({nextPrayer.arabic})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-white/75 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 shrink-0">
            <MapPin size={11} className="text-amber-400 shrink-0" />
            <span className="truncate max-w-[120px]">{locationName}</span>
          </div>
        </div>

        {/* Upcoming Islamic Event Notice */}
        {upcomingIslamicEvent && (
          <div
            onClick={() => setShowEventsModal(true)}
            className="pt-1 flex items-center justify-between text-xs cursor-pointer group relative z-10 text-white/80"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles size={12} className="text-amber-400 shrink-0 animate-pulse" />
              <span className="text-[11px] truncate">
                <strong className="text-amber-400">{upcomingIslamicEvent.label}:</strong> {upcomingIslamicEvent.event.title}
              </span>
            </div>
            <ChevronRight size={13} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}

      </div>

      {/* ── 3. Clean Quick Access Hub (4x2 Minimalist Balanced Grid) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-text uppercase tracking-wider">Quick Access</h3>
          <button 
            onClick={() => navigate('/features')}
            className="text-[11px] font-bold text-amber-500 hover:underline"
          >
            View All Tools ➔
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {QUICK_TOOLS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.to)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/80 hover:border-amber-500/40 shadow-sm active:scale-95 transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-2xl bg-surface border border-border/60 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform shadow-inner">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-text truncate w-full group-hover:text-amber-500 transition-colors">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Today's 3 Quranic Pearls (7:00 AM Morning Cycle) ── */}
      <DailyAyahCard />

      {/* ── 5. Today's Spiritual Routine & Habit Tracker ── */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Target size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-text">Today's Habits</h3>
              <p className="text-[10px] text-subtext">{todayCompletions.length} of {goals.length} completed today</p>
            </div>
          </div>

          {/* Streak Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-black">
            <Flame size={14} className="fill-amber-500" />
            <span>{streakData.currentStreak}d Streak</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Habit Items */}
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-border border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : goals.length === 0 ? (
          <p className="text-xs text-subtext text-center py-2">No habits configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {goals.map(goal => {
              const completed = isCompleted(goal.id);
              
              return (
                <div 
                  key={goal.id}
                  onClick={() => toggleTask(goal.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.98] ${
                    completed 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-text' 
                      : 'bg-surface/50 border-border/70 text-text hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {completed ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-muted shrink-0" />
                    )}
                    <span className={`text-xs font-bold truncate ${completed ? 'line-through text-subtext' : 'text-text'}`}>
                      {goal.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <IslamicEventsModal 
        isOpen={showEventsModal} 
        onClose={() => setShowEventsModal(false)} 
      />
      <MoonSightingModal 
        isOpen={showMoonModal} 
        onClose={() => setShowMoonModal(false)} 
      />
      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />

    </div>
  );
};

export default Dashboard;
