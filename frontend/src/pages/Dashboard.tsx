import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../hooks/useGoals';
import { useStreak } from '../hooks/useStreak';
import { getTodayDateString } from '../utils/dateUtils';
import { Target, CheckCircle2, Circle, Flame, Clock, Book, BookOpen, Compass, Activity, Users, MapPin, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNamaz } from '../hooks/useNamaz';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import DailyAyahCard from '../components/dashboard/DailyAyahCard';
import { getDesiDate } from '../utils/desiDateUtils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { goals, completions, toggleTask, loading } = useGoals();
  const { streakData } = useStreak();
  const { hijriDate, locationName } = useNamaz();
  const { isOnline } = useNetworkStatus();
  const navigate = useNavigate();
  
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
    <div className="p-6 pb-28 max-w-lg mx-auto">
      {/* Header with Location & Date */}
      <header className="mb-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-text tracking-tight">
              Hey, {user?.name || user?.username} 👋
            </h1>
          </div>
          <img src="/logo.png" alt="619 Islam" className="w-11 h-11 object-contain drop-shadow-md hover:scale-105 transition-transform" />
        </div>

        {/* 🌟 Master Multi-Date & Location Banner */}
        <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-sm space-y-2 mt-3">
          {/* Top Row: Gregorian Normal Date & Location */}
          <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-text">
              <Calendar size={14} className="text-primary shrink-0" />
              <span>{gregorianFormatted}</span>
            </div>

            <div className="flex items-center gap-1 font-medium text-subtext bg-surface px-2.5 py-0.5 rounded-full border border-border text-[11px] max-w-[170px] truncate">
              <MapPin size={11} className="text-primary shrink-0" />
              <span className="truncate">{locationName}</span>
            </div>
          </div>

          {/* Bottom Row: Dual Islamic Hijri & Desi Solar Calendars */}
          <div className="grid grid-cols-2 gap-2">
            {/* Islamic Hijri */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 flex items-center gap-2">
              <span className="text-base shrink-0">🌙</span>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase text-emerald-400/80 block leading-tight tracking-wider">Islamic Hijri</span>
                <span className="text-xs font-bold text-emerald-300 truncate block">
                  {hijriDate ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} ${hijriDate.designation.abbreviated}` : 'Loading...'}
                </span>
              </div>
            </div>

            {/* Desi Calendar */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex items-center gap-2">
              <span className="text-base shrink-0">🌾</span>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase text-amber-400/80 block leading-tight tracking-wider">Desi Solar</span>
                <span className="text-xs font-bold text-amber-300 truncate block">
                  {desiDate.day} {desiDate.monthEn} ({desiDate.monthUr})
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-primary to-primary-dark p-4 rounded-2xl shadow-lg shadow-primary/20 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <Target size={18} className="text-white/80" />
            <span className="font-medium text-white/90 text-xs">Today's Progress</span>
          </div>
          <div className="text-2xl font-black">{progressPercentage}%</div>
          <div className="text-white/80 text-[11px] mt-0.5">
            {todayCompletions.length} of {goals.length} completed
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Flame size={18} className="text-accentGold" />
            <span className="font-medium text-subtext text-xs">Current Streak</span>
          </div>
          <div className="text-2xl font-black text-text">
            {streakData.currentStreak} <span className="text-sm font-normal text-muted">days</span>
          </div>
          <div className="text-muted text-[11px] mt-0.5">
            Best: {streakData.longestStreak} days
          </div>
        </div>
      </div>

      {/* 🌟 Daily Quran Ayah Card (3 Verses, Audio, Status PNG Generator) */}
      <DailyAyahCard />

      {/* Islamic Features - Quick Access Grid (Same Size, Clean Icons) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Explore Features</h2>
          <span className="text-xs text-muted">Quick Access</span>
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
