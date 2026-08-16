import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import { useStreak } from '../hooks/useStreak';
import { getTodayDateString } from '../utils/dateUtils';
import { Target, Clock, Book, BookOpen, Users, MapPin, ChevronRight, Calendar, Flame, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNamaz } from '../hooks/useNamaz';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import DailyAyahCard from '../components/dashboard/DailyAyahCard';
import IslamicEventsModal from '../components/dashboard/IslamicEventsModal';
import MoonSightingModal from '../components/dashboard/MoonSightingModal';
import { getDesiDate } from '../utils/desiDateUtils';
import { getUpcomingIslamicEvent, ISLAMIC_MONTHS } from '../utils/islamicEvents';
import { getMoonPhase } from '../utils/lunarEngine';
import { TopInstallButton } from '../components/ui/InstallPrompt';

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
  const matchedMonth = ISLAMIC_MONTHS.find(m => m.number === currentHijriMonthNum);

  // Compute Upcoming Event
  const upcomingIslamicEvent = getUpcomingIslamicEvent(currentHijriMonthNum, currentHijriDayNum);

  const QUICK_FEATURES = [
    {
      id: 'namaz',
      title: 'Namaz',
      subtitle: 'Prayer Times',
      to: '/namaz',
      icon: <Clock size={22} className="text-amber-400" />,
      requiresOnline: false,
    },
    {
      id: 'quran',
      title: 'Quran',
      subtitle: 'The Holy Book',
      to: '/quran',
      icon: <Book size={22} className="text-amber-400" />,
      requiresOnline: false,
    },
    {
      id: 'duas',
      title: 'Duas',
      subtitle: 'Daily Azkar',
      to: '/duas',
      icon: <BookOpen size={22} className="text-amber-400" />,
      requiresOnline: false,
    },
    {
      id: 'tasbeeh',
      title: 'Tasbeeh',
      subtitle: 'Digital Counter',
      to: '/tasbeeh',
      icon: <span className="text-xl">📿</span>,
      requiresOnline: false,
    },
    {
      id: 'habits',
      title: 'Ummah',
      subtitle: 'Global Habits',
      to: '/habits',
      icon: <Users size={22} className="text-amber-400" />,
      requiresOnline: true,
    },
    {
      id: 'features',
      title: 'View All',
      subtitle: 'All Features ➔',
      to: '/features',
      icon: <Sparkles size={22} className="text-amber-400" />,
      requiresOnline: false,
    },
  ];

  return (
    <div className="w-full space-y-5">
      {/* ── Top Header Greeting ── */}
      <header className="pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight">
              Hey, {user?.name || user?.username} 👋
            </h1>
            <p className="text-xs sm:text-sm text-subtext font-medium mt-0.5">
              Welcome back to your Islamic companion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TopInstallButton />
            <img src="/logo.png" alt="619 Islam" className="w-10 h-10 object-contain drop-shadow-md hover:scale-105 transition-transform" />
          </div>
        </div>
      </header>

      {/* ── 🖥️ RESPONSIVE 2-COLUMN GRID FOR TABLETS & DESKTOPS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* ── LEFT COLUMN (Main Devotional & Prayer Feeds) ── */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* 🌟 Master Multi-Date & Location Banner */}
          <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-teal-950/30 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Row: Gregorian Date & Location */}
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5 relative z-10">
              <div className="flex items-center gap-1.5 font-bold text-white/90">
                <Calendar size={14} className="text-amber-400 shrink-0" />
                <span>{gregorianFormatted}</span>
              </div>

              <div className="flex items-center gap-1.5 font-medium text-white/90 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 text-[11px] backdrop-blur-md">
                <MapPin size={11} className="text-amber-400 shrink-0" />
                <span className="truncate max-w-[180px]">{locationName}</span>
              </div>
            </div>

            {/* Middle Section: Hijri, Desi Date & Observatory Launchers */}
            <div className="bg-black/30 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-inner relative z-10">
              <div 
                onClick={() => setShowEventsModal(true)}
                className="min-w-0 flex-1 cursor-pointer group"
                title="Click to view 12-Month Islamic Events Calendar"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Islamic Hijri</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {hijriDate?.year || '1448'} {hijriDate?.designation?.abbreviated || 'AH'}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors mt-0.5 leading-snug">
                  {hijriDate ? `${hijriDate.day} ${hijriDate.month.en}` : 'Loading date...'}
                </h2>

                <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-bold mt-1">
                  <span>🌾</span>
                  <span>{desiDate.day} {desiDate.monthEn}</span>
                  <span className="font-urdu text-[10px] text-emerald-300">({desiDate.monthUr})</span>
                </div>
              </div>

              {/* Right: Moon & Events Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoonModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-500/30 text-xs font-bold flex flex-col items-center justify-center text-amber-300 shadow-sm active:scale-95 transition-all backdrop-blur-md"
                  title="Open Moon Sighting & Astronomy Observatory"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-base leading-none">{moonEmoji}</span>
                    <span className="text-[10px] font-black text-white">{todayMoon.illumination}%</span>
                  </div>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-amber-400 mt-0.5">Moon</span>
                </button>

                <button
                  onClick={() => setShowEventsModal(true)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex flex-col items-center justify-center text-white/80 hover:text-white shadow-sm active:scale-95 transition-all backdrop-blur-md"
                  title="View All Islamic Month Events"
                >
                  <span className="text-sm leading-none">🗓️</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-white/70 mt-0.5">Events</span>
                </button>
              </div>
            </div>

            {/* Upcoming Event Banner */}
            {upcomingIslamicEvent && (
              <div
                onClick={() => setShowEventsModal(true)}
                className="pt-2 border-t border-white/10 flex items-center justify-between text-xs cursor-pointer group relative z-10"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles size={13} className="text-amber-400 shrink-0 animate-pulse" />
                  <span className="text-[11px] text-white/80 truncate">
                    <strong className="text-amber-400 font-bold">{upcomingIslamicEvent.label}:</strong> {upcomingIslamicEvent.event.title}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 shrink-0 pl-2 group-hover:underline">
                  <span>View All</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            )}
          </div>

          {/* 🌟 Daily Quran Ayah Banner */}
          <DailyAyahCard />

          {/* Today's Habits Section */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-text">Today's Habits</h2>
              <span className="text-xs font-bold text-amber-500">{todayCompletions.length}/{goals.length} Done</span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-border border-t-amber-500 rounded-full animate-spin"></div>
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8 bg-surface/50 rounded-2xl border border-dashed border-border">
                <Target size={30} className="mx-auto text-muted mb-2" />
                <p className="text-xs text-subtext font-medium">No habits configured yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {goals.map(goal => {
                  const completed = isCompleted(goal.id);
                  
                  return (
                    <div 
                      key={goal.id}
                      onClick={() => toggleTask(goal.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        completed 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-card border-border/80 hover:border-amber-500/30 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {completed ? (
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Circle size={18} className="text-muted shrink-0" />
                        )}
                        <span className={`text-xs sm:text-sm font-medium ${completed ? 'text-subtext line-through' : 'text-text'}`}>
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

        {/* ── RIGHT COLUMN (Stats, Quick Features & Tools) ── */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">
          {/* Progress & Streak Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Today's Progress */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 rounded-2xl shadow-md shadow-amber-500/20 text-black flex items-center justify-between font-bold">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[11px] font-black text-black/90">
                  <Target size={13} className="shrink-0 text-black/80" />
                  <span className="truncate">Progress</span>
                </div>
                <div className="text-[10px] text-black/75 font-bold mt-0.5">
                  {todayCompletions.length} of {goals.length} done
                </div>
              </div>
              <div className="text-xl font-black shrink-0 pl-1">{progressPercentage}%</div>
            </div>

            {/* Current Streak */}
            <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/30 px-4 py-3 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[11px] font-medium text-subtext">
                  <Flame size={13} className="text-amber-500 shrink-0" />
                  <span className="truncate">Streak</span>
                </div>
                <div className="text-[10px] text-muted font-medium mt-0.5">
                  Best: {streakData.longestStreak} days
                </div>
              </div>
              <div className="text-xl font-black text-text shrink-0 pl-1">
                {streakData.currentStreak}<span className="text-[10px] font-normal text-muted ml-0.5">d</span>
              </div>
            </div>
          </div>

          {/* Explore Features Grid */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-text">Explore Features</h2>
              <button 
                onClick={() => navigate('/features')}
                className="text-[11px] font-bold text-amber-500 hover:underline"
              >
                View All (6 Tools) ➔
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_FEATURES.map((feat) => {
                const isFeatDisabled = feat.requiresOnline && !isOnline;
                
                return (
                  <button
                    key={feat.id}
                    onClick={() => !isFeatDisabled && navigate(feat.to)}
                    disabled={isFeatDisabled}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all relative ${
                      isFeatDisabled 
                        ? 'opacity-40 bg-surface/50 border-border cursor-not-allowed'
                        : 'bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border-border/80 dark:border-amber-500/20 hover:border-amber-500/40 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center mb-1.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 shadow-inner">
                      {feat.icon}
                    </div>
                    <p className="font-bold text-xs text-text leading-tight group-hover:text-amber-500 transition-colors">
                      {feat.title}
                    </p>
                    <p className="text-[10px] text-subtext leading-tight mt-0.5 truncate w-full">
                      {feat.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

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
    </div>
  );
};

export default Dashboard;
