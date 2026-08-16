import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import { Trash2, Plus, Users, ShieldAlert, Library, MessageSquare, Lightbulb, Sparkles, Bug, BookOpen, ThumbsUp } from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { BookSummary } from '../types/books';
import { feedbackService, UserFeedback } from '../services/feedbackService';

interface GlobalHabit {
  id: string;
  title: string;
  category: string;
  description: string;
  target_days: number;
  icon_name: string;
  member_count: number;
}

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
  const [adminTab, setAdminTab] = useState<'books' | 'habits' | 'feedbacks'>('feedbacks');
  const [habits, setHabits] = useState<GlobalHabit[]>([]);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Form State for Habits
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sunnah');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, [adminTab, feedbackStatusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (adminTab === 'habits') {
        const res = await api.get('/global-habits');
        setHabits(res.data);
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

  const handleDeleteHabit = async (id: string) => {
    if (!window.confirm("Are you sure? This will delete the habit for all users globally!")) return;
    try {
      await api.delete(`/global-habits/${id}`);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      console.error("Failed to delete habit", err);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = crypto.randomUUID();
      const payload = {
        id,
        title,
        category,
        description,
        target_days: 30,
        icon_name: "Star",
        is_active: true
      };
      
      const res = await api.post('/global-habits', payload);
      setHabits([...habits, res.data]);
      setShowAddForm(false);
      setTitle('');
      setDescription('');
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
    <div className="p-4 sm:p-6 pb-28 max-w-3xl mx-auto">
      <header className="mb-4 pt-2 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-danger flex items-center gap-2">
            <ShieldAlert size={26} />
            Admin Panel
          </h1>
          <p className="text-subtext mt-0.5 text-xs">Manage Feedbacks, Library & Global Ummah Habits.</p>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="grid grid-cols-3 gap-1.5 mb-5 p-1 bg-surface border border-border rounded-2xl">
        <button
          onClick={() => setAdminTab('feedbacks')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'feedbacks'
              ? 'bg-amber-600 text-white shadow-md'
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
              ? 'bg-primary text-white shadow-md'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Library size={14} />
          <span>Books ({books.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('habits')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'habits'
              ? 'bg-danger text-white shadow-md'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Users size={14} />
          <span>Habits ({habits.length})</span>
        </button>
      </div>

      {/* ── 1. USER FEEDBACKS & FEATURE REQUESTS ── */}
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
                    {/* Header */}
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

                    {/* Message Body */}
                    <p className="text-xs text-subtext leading-relaxed bg-surface/70 p-3.5 rounded-2xl border border-border/60">
                      {fb.message}
                    </p>

                    {/* Footer / Controls */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted flex-wrap gap-2">
                      <div>
                        <span>By: <strong className="text-text font-bold">{fb.user_name || 'Anonymous'}</strong></span>
                        {fb.user_email && <span className="ml-1 opacity-75">({fb.user_email})</span>}
                        <span className="mx-1.5">•</span>
                        <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Status Selector */}
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

      {/* ── 2. BOOKS CATALOG ── */}
      {adminTab === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
              Catalog Master List
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {books.map((b) => (
                <div key={b.id} className="bg-card border border-border p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
                  <img
                    src={b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                    alt={b.title}
                    className="w-12 h-16 object-cover rounded-xl shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-text truncate">{b.title}</h3>
                    <p className="text-[11px] text-subtext truncate mt-0.5">
                      {b.author?.name || 'Classical Scholar'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
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

      {/* ── 3. UMMAH HABITS ── */}
      {adminTab === 'habits' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
              Active Ummah Habits
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-danger text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Plus size={14} />
              <span>New Habit</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateHabit} className="bg-card border border-danger/30 p-4 rounded-2xl shadow-md space-y-3 animate-in fade-in">
              <h3 className="text-xs font-bold text-danger">Create Global Habit</h3>
              <input
                type="text"
                required
                placeholder="Habit Title (e.g. Daily Ayatul Kursi)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs"
              >
                <option value="Namaz">Namaz</option>
                <option value="Quran">Quran</option>
                <option value="Sunnah">Sunnah</option>
                <option value="Charity">Charity</option>
                <option value="Dhikr">Dhikr</option>
              </select>
              <textarea
                placeholder="Description & Virtue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs"
                rows={2}
              />
              <button
                type="submit"
                className="w-full py-2 bg-danger text-white rounded-xl text-xs font-bold"
              >
                Publish for All Users
              </button>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-danger/20 border-t-danger rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((h) => (
                <div key={h.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-text">{h.title}</h3>
                    <span className="text-[10px] text-muted">{h.category} • {h.member_count || 0} joined</span>
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(h.id)}
                    className="p-2 text-muted hover:text-danger rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
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
