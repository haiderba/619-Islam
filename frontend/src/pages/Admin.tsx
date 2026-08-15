import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import { Trash2, Plus, Users, ShieldAlert } from 'lucide-react';

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
  const [habits, setHabits] = useState<GlobalHabit[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sunnah');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/global-habits');
      setHabits(res.data);
    } catch (err) {
      console.error("Failed to load habits", err);
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
      <header className="mb-6 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-danger flex items-center gap-2">
            <ShieldAlert size={28} />
            Admin Area
          </h1>
          <p className="text-subtext mt-1 text-sm">Manage global Ummah habits.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-3 bg-danger/10 text-danger rounded-full hover:bg-danger/20 transition-colors"
        >
          <Plus size={24} />
        </button>
      </header>

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
        <div className="space-y-4">
          <h2 className="font-bold text-text mb-2">Active Global Habits</h2>
          {habits.map((habit) => (
            <div key={habit.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text">{habit.title}</h3>
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
                <Trash2 size={20} />
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
    </div>
  );
};

export default Admin;
