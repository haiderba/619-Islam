import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Users, ShieldAlert, Library, MessageSquare, Lightbulb, Sparkles, Bug, BookOpen, ThumbsUp, Clock } from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { BookSummary } from '../types/books';
import { feedbackService, UserFeedback } from '../services/feedbackService';
import { communityHabitService } from '../services/communityHabitService';
import { CommunityHabit, HabitCategory } from '../types/communityHabits';

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  feature_request: { label: 'Feature Request', icon: Lightbulb, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  improvement: { label: 'Improvement', icon: Sparkles, color: 'text-primary bg-primary/15 border-primary/30' },
  translation_correction: { label: 'Translation / Quran', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  bug_report: { label: 'Bug Report', icon: Bug, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
  compliment: { label: 'Dua / Compliment', icon: ThumbsUp, color: 'text-teal-400 bg-teal-500/15 border-teal-500/30' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  under_review: { label: 'Under Review', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  planned: { label: 'Planned', color: 'bg-primary/15 text-primary border-primary/30' },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

const Admin: React.FC = () => {
  const [adminTab, setAdminTab] = useState<'books' | 'habits' | 'feedbacks'>('habits');
  const [habits, setHabits] = useState<CommunityHabit[]>([]);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Form State for Habits
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [urduTitle, setUrduTitle] = useState('');
  const [arabicTitle, setArabicTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('quran');
  const [description, setDescription] = useState('');
  const [virtue, setVirtue] = useState('');
  const [targetDays, setTargetDays] = useState<number>(0);
  const [reminderTime, setReminderTime] = useState<string>('21:30');
  const [colorTheme, setColorTheme] = useState<'emerald' | 'amber' | 'indigo' | 'rose' | 'teal' | 'purple' | 'cyan'>('indigo');
  const [iconName, setIconName] = useState<string>('Moon');
  const [isPinned, setIsPinned] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [adminTab, feedbackStatusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (adminTab === 'habits') {
        const habitsList = communityHabitService.getHabits();
        setHabits(habitsList);
      } else if (adminTab === 'books') {
        const booksList = await booksApi.getBooks({ tradition: 'all', category: 'all' });
        setBooks(booksList);
      } else if (adminTab === 'feedbacks') {
        const list = await feedbackService.getFeedbacks(feedbackStatusFilter);
        setFeedbacks(list);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = (id: string) => {
    if (!window.confirm("Are you sure? This will delete the habit for all users!")) return;
    communityHabitService.deleteHabit(id);
    setHabits(communityHabitService.getHabits());
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const durationLabel = targetDays === 0 
        ? 'Daily Ongoing Habit' 
        : `${targetDays}-Day Challenge`;

      communityHabitService.createHabit({
        title,
        urduTitle: urduTitle || undefined,
        arabicTitle: arabicTitle || undefined,
        category,
        description,
        virtue: virtue || undefined,
        targetDays,
        durationLabel,
        reminderTime,
        iconName,
        colorTheme,
        isPinned,
      });

      setHabits(communityHabitService.getHabits());
      setShowAddForm(false);
      setTitle('');
      setUrduTitle('');
      setArabicTitle('');
      setDescription('');
      setVirtue('');
    } catch (err) {
      console.error("Failed to create habit", err);
    }
  };

  const handleStatusChange = async (feedbackId: string, newStatus: 'new' | 'under_review' | 'planned' | 'resolved') => {
    await feedbackService.updateFeedbackStatus(feedbackId, newStatus);
    setFeedbacks(feedbacks.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f));
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!window.confirm("Delete this user feedback?")) return;
    await feedbackService.deleteFeedback(feedbackId);
    setFeedbacks(feedbacks.filter(f => f.id !== feedbackId));
  };

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-4xl mx-auto space-y-5 animate-in fade-in">
      <header className="pt-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-danger flex items-center gap-2">
            <ShieldAlert size={26} />
            <span>Admin Portal</span>
          </h1>
          <p className="text-subtext mt-0.5 text-xs">Manage Community Challenges, Feedback, and Digital Library.</p>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface border border-border rounded-2xl">
        <button
          onClick={() => setAdminTab('habits')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'habits'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Users size={14} />
          <span>Habit Hub ({habits.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('feedbacks')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'feedbacks'
              ? 'bg-primary text-white shadow-md'
              : 'text-subtext hover:text-text'
          }`}
        >
          <MessageSquare size={14} />
          <span>Feedbacks ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('books')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'books'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Library size={14} />
          <span>Books ({books.length})</span>
        </button>
      </div>

      {/* ── 1. COMMUNITY HABIT HUB MANAGEMENT ── */}
      {adminTab === 'habits' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
                Ummah Community Challenges & Habits
              </h2>
              <p className="text-[11px] text-muted">Published challenges are visible to all users to join and track.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/25 active:scale-95 transition-all"
            >
              <Plus size={15} />
              <span>{showAddForm ? 'Cancel' : 'Post New Challenge'}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateHabit} className="bg-card border border-amber-500/30 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-black text-amber-500 flex items-center gap-2">
                  <Sparkles size={16} />
                  <span>Publish New Ummah Challenge</span>
                </h3>
                <span className="text-[11px] text-muted">Visible to all app users</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Title (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surah Al-Mulk Before Sleep"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HabitCategory)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-bold outline-none focus:border-amber-500"
                  >
                    <option value="quran">📖 Quran Recitation</option>
                    <option value="dhikr">📿 Dhikr & Remembrance</option>
                    <option value="namaz">🕌 Namaz & Tahajjud</option>
                    <option value="sunnah">✨ Daily Sunnah</option>
                    <option value="charity">🤲 Sadaqah & Charity</option>
                    <option value="fasting">🌙 Sunnah Fasting</option>
                    <option value="character">💚 Good Character & Akhlaq</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Urdu Title (Optional)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="سونے سے پہلے سورۃ الملک کی تلاوت"
                    value={urduTitle}
                    onChange={(e) => setUrduTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-urdu outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Arabic Title (Optional)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="سورة الملك قبل النوم"
                    value={arabicTitle}
                    onChange={(e) => setArabicTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-arabic outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Target Duration</label>
                  <select
                    value={targetDays}
                    onChange={(e) => setTargetDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-bold outline-none focus:border-amber-500"
                  >
                    <option value={0}>♾️ Daily Ongoing Habit</option>
                    <option value={7}>🔥 7-Day Sprint Challenge</option>
                    <option value={21}>🌟 21-Day Habit Formation</option>
                    <option value={30}>🌙 30-Day Spiritual Bootcamp</option>
                    <option value={40}>💎 40-Day Transformation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Daily Reminder Time (24h)</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Color Theme</label>
                  <select
                    value={colorTheme}
                    onChange={(e) => setColorTheme(e.target.value as any)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-bold outline-none focus:border-amber-500"
                  >
                    <option value="indigo">Indigo / Night</option>
                    <option value="emerald">Emerald / Quran</option>
                    <option value="amber">Amber / Sunrise</option>
                    <option value="purple">Purple / Tahajjud</option>
                    <option value="teal">Teal / Salawat</option>
                    <option value="rose">Rose / Charity</option>
                    <option value="cyan">Cyan / Wisdom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-subtext uppercase">Icon</label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs font-bold outline-none focus:border-amber-500"
                  >
                    <option value="Moon">🌙 Moon / Night</option>
                    <option value="Sun">☀️ Sun / Morning</option>
                    <option value="Sparkles">✨ Sparkles / Sunnah</option>
                    <option value="BookOpen">📖 Book / Quran</option>
                    <option value="Flame">🔥 Flame / Challenge</option>
                    <option value="Heart">🤲 Heart / Charity</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-subtext uppercase">Action Description *</label>
                <textarea
                  required
                  placeholder="Explain what the user needs to do daily..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs outline-none focus:border-amber-500 leading-relaxed"
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-subtext uppercase">Spiritual Virtue / Hadith Reference (Optional)</label>
                <textarea
                  placeholder="e.g. Prophet (ﷺ) said: Surah Al-Mulk rescues from the punishment of the grave (Tirmidhi 2890)"
                  value={virtue}
                  onChange={(e) => setVirtue(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs outline-none focus:border-amber-500 leading-relaxed"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-text cursor-pointer">
                  Pin this Challenge to the top of Community Hub
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-2xl text-xs font-black shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
              >
                Publish Challenge to All Believers
              </button>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map((h) => (
                <div key={h.id} className="bg-card border border-border p-4 rounded-3xl shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {h.category === 'quran' ? '📖' : h.category === 'dhikr' ? '📿' : h.category === 'namaz' ? '🕌' : h.category === 'sunnah' ? '✨' : '💚'}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-text">{h.title}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface text-subtext border border-border">
                              {h.category}
                            </span>
                            <span className="text-[10px] text-muted flex items-center gap-1">
                              <Clock size={10} />
                              {h.reminderTime || 'No reminder'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteHabit(h.id)}
                        className="p-1.5 text-muted hover:text-danger rounded-xl hover:bg-danger/10 transition-colors"
                        title="Delete Habit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-xs text-subtext line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted">
                    <span>👥 <strong>{h.memberCount.toLocaleString()}</strong> joined</span>
                    <span>✅ <strong>{h.todayCompletedCount.toLocaleString()}</strong> today</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 2. USER FEEDBACKS & FEATURE REQUESTS ── */}
      {adminTab === 'feedbacks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
              User Feature Requests & Feedback
            </h2>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border text-[11px] font-bold">
              {['all', 'new', 'under_review', 'planned', 'resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFeedbackStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    feedbackStatusFilter === st
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-subtext hover:text-text'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-3xl p-6">
              <MessageSquare size={32} className="mx-auto text-muted mb-2 opacity-50" />
              <p className="text-subtext text-xs">No feedbacks found in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => {
                const catInfo = CATEGORY_MAP[fb.category] || CATEGORY_MAP.feature_request;
                const statusInfo = STATUS_MAP[fb.status] || STATUS_MAP.new;
                const Icon = catInfo.icon;

                return (
                  <div key={fb.id} className="bg-card border border-border p-4 sm:p-5 rounded-3xl shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${catInfo.color}`}>
                            <Icon size={11} />
                            <span>{catInfo.label}</span>
                          </span>

                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-text mt-1">{fb.subject}</h3>
                      </div>

                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors"
                        title="Delete Feedback"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-xs text-subtext leading-relaxed bg-surface/70 p-3.5 rounded-2xl border border-border/60">
                      {fb.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted flex-wrap gap-2">
                      <div>
                        <span>By: <strong className="text-text font-bold">{fb.user_name || 'Anonymous'}</strong></span>
                        {fb.user_email && <span className="ml-1 opacity-75">({fb.user_email})</span>}
                        <span className="mx-1.5">•</span>
                        <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase">Status:</span>
                        <select
                          value={fb.status}
                          onChange={(e) => handleStatusChange(fb.id, e.target.value as any)}
                          className="bg-surface border border-border rounded-xl px-2 py-1 text-[11px] font-bold text-text outline-none"
                        >
                          <option value="new">New</option>
                          <option value="under_review">Under Review</option>
                          <option value="planned">Planned</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. DIGITAL BOOKS LIBRARY ── */}
      {adminTab === 'books' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
              Curated Islamic Library Catalog ({books.length} Books)
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {books.map((b) => (
                <div key={b.id} className="bg-card border border-border p-4 rounded-3xl shadow-sm flex items-start gap-3">
                  <div className="w-12 h-16 rounded-xl bg-surface flex items-center justify-center text-text font-black border border-border shrink-0">
                    <BookOpen size={20} className="text-teal-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text leading-tight">{b.title}</h4>
                    <p className="text-[11px] text-subtext font-medium">
                      {typeof b.author === 'object' && b.author ? b.author.name : (typeof b.author === 'string' ? b.author : 'Islamic Scholar')}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {b.tradition?.name || 'General'}
                      </span>
                      <span className="text-[9px] text-muted">
                        {b.total_chapters} Chapters
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
