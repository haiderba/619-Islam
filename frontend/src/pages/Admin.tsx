import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import { Trash2, Plus, Users, ShieldAlert, Library } from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { BookSummary } from '../types/books';

interface GlobalHabit {
  id: string;
  title: string;
  category: string;
  description: string;
  target_days: number;
  icon_name: string;
  member_count: number;
}

const Admin: React.FC = () => {
  const [adminTab, setAdminTab] = useState<'habits' | 'books'>('books');
  const [habits, setHabits] = useState<GlobalHabit[]>([]);
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sunnah');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadData();
  }, [adminTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (adminTab === 'habits') {
        const res = await api.get('/global-habits');
        setHabits(res.data);
      } else {
        const booksList = await booksApi.getBooks({ tradition: 'all', category: 'all' });
        setBooks(booksList);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This will delete the habit for all users globally!")) return;
    
    try {
      await api.delete(`/global-habits/${id}`);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      console.error("Failed to delete habit", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
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

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto">
      <header className="mb-4 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-danger flex items-center gap-2">
            <ShieldAlert size={26} />
            Admin Panel
          </h1>
          <p className="text-subtext mt-0.5 text-xs">Manage Islamic Library & Global Ummah Habits.</p>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-surface border border-border rounded-2xl">
        <button
          onClick={() => setAdminTab('books')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'books'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Library size={15} />
          <span>Books Catalog ({books.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('habits')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'habits'
              ? 'bg-danger text-white shadow-md shadow-danger/20'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Users size={15} />
          <span>Ummah Habits ({habits.length})</span>
        </button>
      </div>

      {adminTab === 'books' ? (
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
                      {b.tradition && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {b.tradition.name}
                        </span>
                      )}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface text-subtext border border-border">
                        {b.total_chapters} Chapters
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">Active Global Habits</h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 bg-danger/10 text-danger rounded-xl hover:bg-danger/20 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={16} />
              <span>Add Habit</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreate} className="bg-card p-5 rounded-2xl border border-danger/30 shadow-sm mb-6 space-y-4">
              <h3 className="font-semibold text-danger">Publish New Global Habit</h3>
              
              <input
                type="text"
                placeholder="Habit Title (e.g. Fasting Mondays)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-danger outline-none"
                required
              />
              
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-danger outline-none"
              >
                <option value="Sunnah">Sunnah</option>
                <option value="Charity">Charity</option>
                <option value="Community">Community</option>
                <option value="Self-Improvement">Self-Improvement</option>
              </select>

              <textarea
                placeholder="Description to motivate the Ummah..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-danger outline-none h-24 resize-none"
                required
              />

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-danger text-white py-2 rounded-xl font-medium shadow-md shadow-danger/20">Publish to Ummah</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-surface border border-border text-subtext py-2 rounded-xl font-medium">Cancel</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-danger/20 border-t-danger rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div key={habit.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-text text-sm">{habit.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-surface rounded-md text-subtext border border-border">
                        {habit.category}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Users size={12} />
                        {habit.member_count} enrolled
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                    title="Delete Global Habit"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {habits.length === 0 && (
                <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border">
                  <p className="text-subtext font-medium">No global habits exist.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
