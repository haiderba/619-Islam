import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Check, 
  Sparkles, 
  Flame, 
  Clock, 
  BookOpen, 
  Compass, 
  CheckCircle2, 
  RotateCcw, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Search, 
  Bell, 
  Star 
} from 'lucide-react';
import { communityHabitService } from '../services/communityHabitService';
import { CommunityHabit, HabitCategory, UserHabitsSummary } from '../types/communityHabits';
import { notificationService } from '../services/notificationService';

const CATEGORIES: { key: HabitCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All Challenges', icon: '🌟' },
  { key: 'quran', label: 'Quran', icon: '📖' },
  { key: 'dhikr', label: 'Dhikr', icon: '📿' },
  { key: 'namaz', label: 'Namaz', icon: '🕌' },
  { key: 'sunnah', label: 'Sunnah', icon: '✨' },
  { key: 'charity', label: 'Charity', icon: '🤲' },
  { key: 'fasting', label: 'Fasting', icon: '🌙' },
];

const THEME_COLORS: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
  indigo: { bg: 'from-indigo-900/60 to-slate-900/80', border: 'border-indigo-500/30', text: 'text-indigo-400', lightBg: 'bg-indigo-500/10' },
  emerald: { bg: 'from-emerald-900/60 to-teal-950/80', border: 'border-emerald-500/30', text: 'text-emerald-400', lightBg: 'bg-emerald-500/10' },
  amber: { bg: 'from-amber-900/60 to-orange-950/80', border: 'border-amber-500/30', text: 'text-amber-400', lightBg: 'bg-amber-500/10' },
  purple: { bg: 'from-purple-900/60 to-slate-950/80', border: 'border-purple-500/30', text: 'text-purple-400', lightBg: 'bg-purple-500/10' },
  teal: { bg: 'from-teal-900/60 to-emerald-950/80', border: 'border-teal-500/30', text: 'text-teal-400', lightBg: 'bg-teal-500/10' },
  rose: { bg: 'from-rose-900/60 to-slate-950/80', border: 'border-rose-500/30', text: 'text-rose-400', lightBg: 'bg-rose-500/10' },
  cyan: { bg: 'from-cyan-900/60 to-blue-950/80', border: 'border-cyan-500/30', text: 'text-cyan-400', lightBg: 'bg-cyan-500/10' },
};

export const Habits: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my_habits' | 'discover' | 'impact'>('my_habits');
  const [habits, setHabits] = useState<CommunityHabit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVirtueId, setExpandedVirtueId] = useState<string | null>(null);
  const [summary, setSummary] = useState<UserHabitsSummary>({
    totalJoined: 0,
    completedTodayCount: 0,
    pendingTodayCount: 0,
    overallCompletionRate: 0,
    bestStreak: 0,
    totalDeedsCompleted: 0,
  });

  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  useEffect(() => {
    loadData();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      setNotificationStatus('granted');
    }
  };

  const loadData = () => {
    const list = communityHabitService.getHabits();
    setHabits(list);
    setSummary(communityHabitService.getUserHabitsSummary());
  };

  const handleToggleJoin = (habitId: string) => {
    communityHabitService.toggleJoin(habitId);
    loadData();
  };

  const handleCheckIn = (habitId: string) => {
    communityHabitService.markCompletedToday(habitId);
    loadData();
  };

  const handleUndoCheckIn = (habitId: string) => {
    communityHabitService.unmarkCompletedToday(habitId);
    loadData();
  };

  const joinedHabits = habits.filter(h => h.joined);

  const filteredDiscoverHabits = habits.filter(h => {
    const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (h.urduTitle && h.urduTitle.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Calculate Community Total Completions
  const totalCommunityCompletions = habits.reduce((acc, h) => acc + (h.totalAllTimeCompletions || 0), 0) + summary.totalDeedsCompleted;
  const totalCommunityToday = habits.reduce((acc, h) => acc + (h.todayCompletedCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 pb-36 max-w-5xl mx-auto w-full space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* ── Top Header ── */}
      <header className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight">
              The Ummah Habit Hub
            </h1>
            <span className="text-sm font-arabic text-amber-500 font-bold hidden sm:inline">(مجتمع العبادة)</span>
          </div>
          <p className="text-xs sm:text-sm text-subtext font-medium mt-0.5">
            Join collective spiritual challenges, build lifelong Sunnah habits, and grow together.
          </p>
        </div>

        {/* Action Header Pills */}
        <div className="flex items-center gap-2 shrink-0">
          {notificationStatus !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-colors"
              title="Enable Daily Habit Notifications"
            >
              <Bell size={13} />
              <span>Enable Reminders</span>
            </button>
          )}

          <a
            href="/admin"
            className="text-[11px] bg-surface text-subtext hover:text-text px-3 py-1.5 rounded-xl font-bold border border-border hover:bg-border transition-colors flex items-center gap-1"
          >
            <ShieldCheck size={13} />
            <span>Admin Portal</span>
          </a>
        </div>
      </header>

      {/* ── Top 3 Navigation Tabs ── */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface border border-border rounded-2xl">
        <button
          onClick={() => setActiveTab('my_habits')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'my_habits'
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Sparkles size={15} />
          <span>My Habits ({joinedHabits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'discover'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Compass size={15} />
          <span>Discover ({habits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'impact'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-subtext hover:text-text'
          }`}
        >
          <TrendingUp size={15} />
          <span>Ummah Impact</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: MY DAILY HABITS & ACTION HUB ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'my_habits' && (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in">
          
          {/* Master Today Summary Hero Card */}
          <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-teal-950/30 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 inline-block">
                  Today's Daily Checklist
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  <span>{summary.completedTodayCount} of {summary.totalJoined} Completed</span>
                  {summary.pendingTodayCount === 0 && summary.totalJoined > 0 && (
                    <span className="text-xl">🎉</span>
                  )}
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  {summary.pendingTodayCount > 0 
                    ? `✨ ${summary.pendingTodayCount} more spiritual good deed${summary.pendingTodayCount > 1 ? 's' : ''} to complete today.`
                    : summary.totalJoined > 0 
                      ? 'Alhamdulillah! All daily challenges completed today!' 
                      : 'Join challenges below to start tracking your daily Sunnah habits.'}
                </p>
              </div>

              {/* Stats Pills */}
              <div className="flex items-center gap-2">
                <div className="bg-black/30 border border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-2">
                  <Flame size={20} className="text-amber-400 fill-amber-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-white/60">Best Streak</span>
                    <strong className="text-sm font-black text-white">{summary.bestStreak} Days</strong>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl px-3.5 py-2 flex items-center gap-2">
                  <Award size={20} className="text-emerald-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-white/60">Total Deeds</span>
                    <strong className="text-sm font-black text-emerald-400">{summary.totalDeedsCompleted}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Today Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold text-white/80">
                <span>Today's Consistency</span>
                <span className="text-amber-400 font-mono">{summary.overallCompletionRate}%</span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${summary.overallCompletionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* List of Active Habits */}
          {joinedHabits.length === 0 ? (
            <div className="text-center py-12 px-4 bg-card border border-dashed border-border rounded-3xl space-y-3">
              <Sparkles size={36} className="mx-auto text-amber-500 opacity-60" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text">No Challenges Joined Yet</h3>
                <p className="text-xs text-subtext max-w-md mx-auto">
                  Browse through community challenges like Surah Al-Mulk, Daily Istighfar, and Tahajjud to begin your daily journey.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('discover')}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/20 transition-all active:scale-95 inline-flex items-center gap-1.5"
              >
                <Compass size={15} />
                <span>Explore Community Challenges</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {joinedHabits.map((habit) => {
                const isCompleted = communityHabitService.isCompletedToday(habit.id);
                const progressMap = communityHabitService.getUserProgressMap();
                const record = progressMap[habit.id];
                const streak = record?.currentStreak || 0;
                const theme = THEME_COLORS[habit.colorTheme] || THEME_COLORS.indigo;
                const isVirtueExpanded = expandedVirtueId === habit.id;

                return (
                  <div 
                    key={habit.id}
                    className={`bg-card border ${isCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border'} rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 transition-all`}
                  >
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${theme.lightBg} border ${theme.border}`}>
                          {habit.category === 'quran' ? '📖' : habit.category === 'dhikr' ? '📿' : habit.category === 'namaz' ? '🕌' : habit.category === 'sunnah' ? '✨' : '💚'}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-black text-text leading-tight">{habit.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-subtext border border-border">
                              {habit.durationLabel}
                            </span>
                          </div>

                          {habit.urduTitle && (
                            <p className="text-xs font-urdu text-amber-500 font-bold leading-relaxed">
                              {habit.urduTitle}
                            </p>
                          )}

                          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted flex-wrap">
                            {habit.reminderTime && (
                              <span className="flex items-center gap-1 text-subtext font-medium">
                                <Clock size={12} className="text-amber-500" />
                                <span>Reminder: {habit.reminderTime}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-bold text-amber-400">
                              <Flame size={13} className="fill-amber-400" />
                              <span>{streak} Day Streak</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Completed Status Badge */}
                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <CheckCircle2 size={12} />
                          <span>Done Today</span>
                        </span>
                      )}
                    </div>

                    {/* Action Description */}
                    <p className="text-xs text-subtext leading-relaxed bg-surface/60 p-3 rounded-2xl border border-border/60">
                      {habit.description}
                    </p>

                    {/* Peer Motivation & Community Pulse */}
                    <div className="flex items-center justify-between text-[11px] text-muted pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-primary" />
                        <span>
                          <strong>{habit.memberCount.toLocaleString()}</strong> Believers joined • <strong>{habit.todayCompletedCount.toLocaleString()}</strong> completed today
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold">You've got this!</span>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                      {isCompleted ? (
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={16} />
                            <span>Completed Today (+1 Good Deed)</span>
                          </div>

                          <button
                            onClick={() => handleUndoCheckIn(habit.id)}
                            className="p-2.5 rounded-2xl bg-surface hover:bg-border text-subtext hover:text-rose-400 border border-border transition-colors active:scale-95"
                            title="Undo today's check-in"
                          >
                            <RotateCcw size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(habit.id)}
                          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check size={16} />
                          <span>Mark Completed for Today</span>
                        </button>
                      )}

                      {habit.virtue && (
                        <button
                          onClick={() => setExpandedVirtueId(isVirtueExpanded ? null : habit.id)}
                          className="p-2.5 rounded-2xl bg-surface hover:bg-border text-subtext hover:text-text border border-border transition-colors active:scale-95"
                          title="Read Spiritual Virtue & Hadith"
                        >
                          <BookOpen size={16} />
                        </button>
                      )}
                    </div>

                    {/* Spiritual Virtue Accordion */}
                    {isVirtueExpanded && habit.virtue && (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 leading-relaxed space-y-1 animate-in fade-in">
                        <strong className="font-bold flex items-center gap-1.5 text-amber-400">
                          <Star size={13} className="fill-amber-400" />
                          <span>Spiritual Virtue & Hadith:</span>
                        </strong>
                        <p className="italic">{habit.virtue}</p>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: DISCOVER COMMUNITY CHALLENGES ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'discover' && (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in">
          
          {/* Search & Category Filter */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext" />
              <input
                type="text"
                placeholder="Search challenges (e.g. Surah Mulk, Tahajjud, Istighfar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-2xl text-xs sm:text-sm text-text font-bold outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.key
                      ? 'bg-amber-500 text-black shadow-sm font-black'
                      : 'bg-card border border-border text-subtext hover:text-text'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredDiscoverHabits.map((habit) => {
              const isJoined = habit.joined;
              const theme = THEME_COLORS[habit.colorTheme] || THEME_COLORS.indigo;

              return (
                <div 
                  key={habit.id}
                  className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-amber-500/30 transition-colors"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${theme.lightBg} border ${theme.border}`}>
                          {habit.category === 'quran' ? '📖' : habit.category === 'dhikr' ? '📿' : habit.category === 'namaz' ? '🕌' : habit.category === 'sunnah' ? '✨' : '💚'}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-text leading-tight">{habit.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-subtext border border-border mt-1 inline-block">
                            {habit.durationLabel}
                          </span>
                        </div>
                      </div>

                      {habit.isPinned && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
                          Featured
                        </span>
                      )}
                    </div>

                    {habit.urduTitle && (
                      <p className="text-xs font-urdu text-amber-500 font-bold leading-relaxed">
                        {habit.urduTitle}
                      </p>
                    )}

                    <p className="text-xs text-subtext leading-relaxed">
                      {habit.description}
                    </p>

                    {habit.virtue && (
                      <div className="p-3 bg-surface/80 rounded-2xl border border-border/80 text-[11px] text-subtext italic leading-relaxed">
                        "{habit.virtue}"
                      </div>
                    )}
                  </div>

                  {/* Footer & Join Button */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-muted flex items-center gap-1.5">
                      <Users size={13} className="text-primary" />
                      <span><strong>{habit.memberCount.toLocaleString()}</strong> Believers</span>
                    </div>

                    <button
                      onClick={() => handleToggleJoin(habit.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                        isJoined
                          ? 'bg-surface border border-border text-subtext hover:border-rose-500/40 hover:text-rose-400'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>Joined Challenge</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Join Challenge</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: UMMAH IMPACT & MOTIVATION OVERVIEW ── */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'impact' && (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in">
          
          {/* Collective Ummah Counter */}
          <div className="bg-gradient-to-br from-[#041c1d] via-[#062e31] to-[#031516] border border-teal-500/40 rounded-3xl p-6 text-white text-center space-y-3 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30 inline-block">
              Collective Ummah Good Deeds
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight font-mono">
              {totalCommunityCompletions.toLocaleString()}+
            </h2>

            <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
              Every Surah recited, Dhikr uttered, and good deed completed brings light to the global Ummah.
            </p>

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-teal-200">
              <div>
                <strong className="block text-base font-black text-white font-mono">{totalCommunityToday.toLocaleString()}+</strong>
                <span className="text-[10px] uppercase opacity-75">Completed Today</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <strong className="block text-base font-black text-white font-mono">{habits.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}+</strong>
                <span className="text-[10px] uppercase opacity-75">Active Believers</span>
              </div>
            </div>
          </div>

          {/* Spiritual Hadith on Consistency Card */}
          <div className="bg-card border border-border p-5 sm:p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
              <Star size={14} className="fill-amber-500" />
              <span>Hadith on Consistency (الاستقامة)</span>
            </div>

            <p className="text-base sm:text-lg font-bold text-text leading-relaxed italic">
              "The most beloved of deeds to Allah are those that are most consistent, even if they are small."
            </p>

            <div className="flex items-center justify-between text-xs text-subtext pt-1 border-t border-border/60">
              <span className="font-arabic font-bold text-sm text-emerald-500">أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ</span>
              <span className="font-semibold">— Sahih al-Bukhari 6464</span>
            </div>
          </div>

          {/* Personal Consistency Milestone Badges */}
          <div className="bg-card border border-border p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-text flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <span>Your Consistency Milestones</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface p-4 rounded-2xl border border-border text-center space-y-1">
                <span className="text-2xl">🌱</span>
                <h4 className="text-xs font-bold text-text">Starter Seeker</h4>
                <p className="text-[10px] text-subtext">Join 3+ challenges</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
                  summary.totalJoined >= 3 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-surface text-muted'
                }`}>
                  {summary.totalJoined >= 3 ? 'Unlocked ✨' : `${summary.totalJoined}/3 Joined`}
                </span>
              </div>

              <div className="bg-surface p-4 rounded-2xl border border-border text-center space-y-1">
                <span className="text-2xl">🔥</span>
                <h4 className="text-xs font-bold text-text">Consistent Mumin</h4>
                <p className="text-[10px] text-subtext">Achieve 7-day streak</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
                  summary.bestStreak >= 7 ? 'bg-amber-500/15 text-amber-400' : 'bg-surface text-muted'
                }`}>
                  {summary.bestStreak >= 7 ? 'Unlocked 🏆' : `${summary.bestStreak}/7 Days`}
                </span>
              </div>

              <div className="bg-surface p-4 rounded-2xl border border-border text-center space-y-1">
                <span className="text-2xl">💎</span>
                <h4 className="text-xs font-bold text-text">Istiqamah Champion</h4>
                <p className="text-[10px] text-subtext">50+ total deeds</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
                  summary.totalDeedsCompleted >= 50 ? 'bg-teal-500/15 text-teal-400' : 'bg-surface text-muted'
                }`}>
                  {summary.totalDeedsCompleted >= 50 ? 'Unlocked 💎' : `${summary.totalDeedsCompleted}/50 Deeds`}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Habits;
