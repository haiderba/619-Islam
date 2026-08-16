import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import { useStreak } from '../hooks/useStreak';
import { getTodayDateString } from '../utils/dateUtils';
import { Target, Clock, Book, BookOpen, Compass, Activity, Users, MapPin, ChevronRight, Calendar, Flame, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNamaz } from '../hooks/useNamaz';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import DailyAyahCard from '../components/dashboard/DailyAyahCard';
import IslamicEventsModal from '../components/dashboard/IslamicEventsModal';
import MoonSightingModal from '../components/dashboard/MoonSightingModal';
import { getDesiDate } from '../utils/desiDateUtils';
import { getUpcomingIslamicEvent, ISLAMIC_MONTHS } from '../utils/islamicEvents';
import { getMoonPhase } from '../utils/lunarEngine';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { goals, completions, toggleTask, loading } = useGoals();
  const { streakData } = useStreak();
  const { hijriDate, locationName } = useNamaz();
  const { isOnline } = useNetworkStatus();
  const navigate = useNavigate();

  const [showEventsModal, setShowEventsModal] = useState<boolean>(false);
  const [showMoonModal, setShowMoonModal] = useState<boolean>(false);
  
  const desiDate = getDesiDate();
  const today = getTodayDateString();
  const gregorianFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());
  
  const todayCompletions = completions.filter(c => c.date === today && c.completed);

  const isCompleted = (goalId: string) => {
    return completions.some(c => c.goalId === goalId && c.date === today && c.completed);
  };
  
  const activeGoals = goals.filter(g => !g.archived);
  const completedCount = activeGoals.filter(g => isCompleted(g.id)).length;
  const progressPercentage = activeGoals.length > 0 
    ? Math.round((completedCount / activeGoals.length) * 100) 
    : 0;

  // Compute Hijri Month Number & Upcoming Event
  const monthNameLower = (hijriDate?.month?.en || '').toLowerCase().trim();
  const matchedMonth = ISLAMIC_MONTHS.find(m => monthNameLower.includes(m.nameEn.toLowerCase().slice(0, 4)));
  const currentHijriMonthNum = matchedMonth ? matchedMonth.number : 3; // Default Rabi' al-Awwal = 3
  const currentHijriDayNum = parseInt(hijriDate?.day || '3') || 3;
  const upcomingIslamicEvent = getUpcomingIslamicEvent(currentHijriMonthNum, currentHijriDayNum);

  // Compute Live Moon Phase
  const todayMoon = getMoonPhase(new Date());
  const moonEmoji = todayMoon.phase < 0.03 || todayMoon.phase > 0.97 ? '🌑' :
    todayMoon.phase < 0.22 ? '🌒' :
    todayMoon.phase < 0.28 ? '🌓' :
    todayMoon.phase < 0.47 ? '🌔' :
    todayMoon.phase < 0.53 ? '🌕' :
    todayMoon.phase < 0.72 ? '🌖' :
    todayMoon.phase < 0.78 ? '🌗' : '🌘';

  const QUICK_FEATURES = [
    {
      id: 'namaz',
      title: 'Namaz',
      subtitle: 'Prayer Times',
      to: '/namaz',
      icon: <Clock size={24} className="text-primary" />,
      bg: 'bg-primary/10 hover:border-primary/30',
      iconBg: 'bg-primary/15',
      requiresOnline: false,
    },
    {
      id: 'quran',
      title: 'Quran',
      subtitle: 'The Holy Book',
      to: '/quran',
      icon: <Book size={24} className="text-emerald-500" />,
      bg: 'bg-emerald-500/10 hover:border-emerald-500/30',
      iconBg: 'bg-emerald-500/15',
      requiresOnline: false,
    },
    {
      id: 'duas',
      title: 'Duas',
      subtitle: 'Daily Azkar',
      to: '/duas',
      icon: <BookOpen size={24} className="text-blue-500" />,
      bg: 'bg-blue-500/10 hover:border-blue-500/30',
      iconBg: 'bg-blue-500/15',
      requiresOnline: false,
    },
    {
      id: 'qibla',
      title: 'Qibla',
      subtitle: 'Kaaba Compass',
      to: '/qibla',
      icon: <Compass size={24} className="text-amber-500" />,
      bg: 'bg-amber-500/10 hover:border-amber-500/30',
      iconBg: 'bg-amber-500/15',
      requiresOnline: false,
    },
    {
      id: 'tasbeeh',
      title: 'Tasbeeh',
      subtitle: 'Digital Counter',
      to: '/tasbeeh',
      icon: <Activity size={24} className="text-purple-500" />,
      bg: 'bg-purple-500/10 hover:border-purple-500/30',
      iconBg: 'bg-purple-500/15',
      requiresOnline: false,
    },
    {
      id: 'ummah',
      title: 'Ummah',
      subtitle: 'Global Habits',
      to: '/habits',
      icon: <Users size={24} className="text-rose-500" />,
      bg: 'bg-rose-500/10 hover:border-rose-500/30',
      iconBg: 'bg-rose-500/15',
      requiresOnline: true,
    },
  ];

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto">
      {/* Header with Location & Date */}
      <header className="mb-4 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">
              Hey, {user?.name || user?.username} 👋
            </h1>
          </div>
          <img src="/logo.png" alt="619 Islam" className="w-10 h-10 object-contain drop-shadow-md hover:scale-105 transition-transform" />
        </div>

        {/* 🌟 Master Multi-Date & Location Banner (Spacious, Zero-Clipping, Premium Hierarchy) */}
        <div className="bg-card border border-border/80 rounded-3xl p-4 shadow-sm space-y-3 mt-3">
          {/* Top Row: Gregorian Date & Location */}
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-text">
              <Calendar size={14} className="text-primary shrink-0" />
              <span>{gregorianFormatted}</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-subtext bg-surface px-2.5 py-1 rounded-full border border-border text-[11px]">
              <MapPin size={11} className="text-primary shrink-0" />
              <span className="truncate max-w-[150px]">{locationName}</span>
            </div>
          </div>

          {/* Middle Section: Frosted Glass Islamic Hijri Date, Desi Solar & Interactive Launchers */}
          <div className="bg-surface/70 dark:bg-surface/40 backdrop-blur-xl border border-border/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
            {/* Left: Full Unclipped Islamic Date & Desi Date */}
            <div 
              onClick={() => setShowEventsModal(true)}
              className="min-w-0 flex-1 cursor-pointer group"
              title="Click to view 12-Month Islamic Events Calendar"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">Islamic Hijri</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {hijriDate?.year || '1448'} {hijriDate?.designation?.abbreviated || 'AH'}
                </span>
              </div>

              {/* Full Hijri Date Title */}
              <h2 className="text-sm sm:text-base font-black text-text group-hover:text-primary transition-colors mt-0.5 leading-snug">
                {hijriDate ? `${hijriDate.day} ${hijriDate.month.en}` : 'Loading date...'}
              </h2>

              {/* Desi Solar Calendar Inline Sub-Pill */}
              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-1">
                <span>🌾</span>
                <span>{desiDate.day} {desiDate.monthEn}</span>
                <span className="font-urdu text-[10px] text-amber-600 dark:text-amber-300">({desiDate.monthUr})</span>
              </div>
            </div>

            {/* Right: Interactive Moon Sighting & Calendar Quick Launchers */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* 🌙 Moon Sighting Observatory Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoonModal(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-card hover:bg-surface border border-border/80 text-xs font-bold flex flex-col items-center justify-center text-text shadow-sm active:scale-95 transition-all"
                title="Open Moon Sighting & Astronomy Observatory"
              >
                <div className="flex items-center gap-1">
                  <span className="text-base leading-none">{moonEmoji}</span>
                  <span className="text-[10px] font-black text-text">{todayMoon.illumination}%</span>
                </div>
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-primary mt-0.5">Moon</span>
              </button>

              {/* 🗓️ 12-Month Events Calendar Button */}
              <button
                onClick={() => setShowEventsModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-card hover:bg-surface border border-border/80 text-xs font-bold flex flex-col items-center justify-center text-text shadow-sm active:scale-95 transition-all"
                title="View All Islamic Month Events"
              >
                <span className="text-sm leading-none">🗓️</span>
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted mt-0.5">Events</span>
              </button>
            </div>
          </div>

          {/* 🌟 Upcoming Islamic Event Pill Banner */}
          {upcomingIslamicEvent && (
            <div
              onClick={() => setShowEventsModal(true)}
              className="pt-2 border-t border-border/50 flex items-center justify-between text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
                <span className="text-[11px] text-subtext truncate">
                  <strong className="text-amber-400 font-bold">{upcomingIslamicEvent.label}:</strong> {upcomingIslamicEvent.event.title}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-bold text-primary shrink-0 pl-2 group-hover:underline">
                <span>View All</span>
                <ChevronRight size={12} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── ⚡ COMPACT STATS ROW (Today's Progress & Streak) ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Compact Today's Progress */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-3.5 py-2.5 rounded-2xl shadow-md shadow-primary/20 text-white flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-medium text-white/90">
              <Target size={13} className="shrink-0 text-white/80" />
              <span className="truncate">Progress</span>
            </div>
            <div className="text-[10px] text-white/75 font-medium">
              {todayCompletions.length} of {goals.length} done
            </div>
          </div>
          <div className="text-lg font-black shrink-0 pl-1">{progressPercentage}%</div>
        </div>

        {/* Compact Current Streak */}
        <div className="bg-card border border-border px-3.5 py-2.5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-medium text-subtext">
              <Flame size={13} className="text-amber-500 shrink-0" />
              <span className="truncate">Streak</span>
            </div>
            <div className="text-[10px] text-muted font-medium">
              Best: {streakData.longestStreak} days
            </div>
          </div>
          <div className="text-lg font-black text-text shrink-0 pl-1">
            {streakData.currentStreak}<span className="text-[10px] font-normal text-muted ml-0.5">d</span>
          </div>
        </div>
      </div>

      {/* 🌟 Daily Quran Ayah Banner (Compact Pill & Immersive Modal) */}
      <DailyAyahCard />

      {/* 🗓️ Islamic Events Calendar Modal Popup */}
      <IslamicEventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        currentMonthNumber={currentHijriMonthNum}
        currentDayNumber={currentHijriDayNum}
        hijriYear={hijriDate?.year || 1448}
      />

      {/* 🌙 Moon Sighting & Astronomy Observatory Modal Popup */}
      <MoonSightingModal
        isOpen={showMoonModal}
        onClose={() => setShowMoonModal(false)}
        initialHijriDay={currentHijriDayNum}
        initialHijriMonth={matchedMonth ? matchedMonth.nameEn : "Rabi' al-Awwal"}
        initialHijriYear={hijriDate?.year || 1448}
      />

      {/* Islamic Features - Quick Access Grid (Same Size, Clean Icons) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-text">Explore Features</h2>
          <span className="text-[11px] text-muted">Quick Access</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_FEATURES.map((feat) => {
            const isDisabled = !isOnline && feat.requiresOnline;
            return (
              <div
                key={feat.id}
                onClick={() => !isDisabled && navigate(feat.to)}
                className={`bg-card border p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 shadow-sm aspect-square relative overflow-hidden ${
                  isDisabled
                    ? 'opacity-40 grayscale border-dashed border-border cursor-not-allowed select-none'
                    : 'border-border hover:border-primary/40 hover:scale-[1.02] active:scale-95 cursor-pointer group'
                }`}
              >
                {isDisabled && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-bold text-amber-400 uppercase tracking-tighter">
                    Offline
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-200 ${isDisabled ? 'bg-surface' : `group-hover:scale-110 ${feat.iconBg}`}`}>
                  {feat.icon}
                </div>
                <p className="font-bold text-xs text-text leading-tight group-hover:text-primary transition-colors">
                  {feat.title}
                </p>
                <p className="text-[10px] text-subtext leading-tight mt-0.5 truncate w-full">
                  {feat.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Habits Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Today's Habits</h2>
          <span className="text-xs text-subtext">{todayCompletions.length}/{goals.length} Done</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-3 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-2xl border border-dashed border-border">
            <Target size={32} className="mx-auto text-muted mb-2" />
            <p className="text-xs text-subtext font-medium">No habits configured yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {goals.map(goal => {
              const completed = isCompleted(goal.id);
              
              return (
                <div 
                  key={goal.id}
                  onClick={() => toggleTask(goal.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    completed 
                      ? 'bg-success/5 border-success/20' 
                      : 'bg-card border-border hover:border-primary/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {completed ? (
                      <CheckCircle2 size={20} className="text-success" />
                    ) : (
                      <Circle size={20} className="text-muted" />
                    )}
                    <span className={`text-sm font-medium ${completed ? 'text-subtext line-through' : 'text-text'}`}>
                      {goal.title}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-muted opacity-40" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
