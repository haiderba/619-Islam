import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import { Users, Plus, Check, Star } from 'lucide-react';

interface GlobalHabit {
  id: string;
  title: string;
  category: string;
  description: string;
  target_days: number;
  icon_name: string;
  member_count: number;
  joined: boolean;
}

const Habits: React.FC = () => {
  const [habits, setHabits] = useState<GlobalHabit[]>([]);
  const [loading, setLoading] = useState(true);

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

  const toggleJoin = async (habitId: string, currentlyJoined: boolean) => {
    try {
      // Optimistic update
      setHabits(habits.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            joined: !currentlyJoined,
            member_count: h.member_count + (currentlyJoined ? -1 : 1)
          };
        }
        return h;
      }));

      if (currentlyJoined) {
        await api.post(`/global-habits/${habitId}/leave`);
      } else {
        await api.post(`/global-habits/${habitId}/join`);
      }
    } catch (err) {
      console.error("Failed to toggle join status", err);
      // Revert on failure
      loadHabits();
    }
  };

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto">
      <header className="mb-6 pt-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">The Ummah</h1>
          <p className="text-subtext text-sm">Join community challenges and build habits together.</p>
        </div>
        
        {/* Admin Link (In a real app, conditionally rendered for admin users) */}
        <button 
          onClick={() => window.location.href = '/admin'}
          className="text-xs bg-danger/10 text-danger px-3 py-1.5 rounded-full font-bold hover:bg-danger/20 transition-colors"
        >
          Admin Panel
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Star size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-lg">{habit.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-surface rounded-md text-subtext font-medium border border-border">
                        {habit.category}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Users size={12} />
                        {habit.member_count} members
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-subtext mb-5 leading-relaxed">
                {habit.description}
              </p>
              
              <button 
                onClick={() => toggleJoin(habit.id, habit.joined)}
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  habit.joined 
                    ? 'bg-surface border border-border text-text hover:bg-border' 
                    : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                }`}
              >
                {habit.joined ? (
                  <>
                    <Check size={18} className="text-success" />
                    <span>Joined Challenge</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Join Challenge</span>
                  </>
                )}
              </button>
            </div>
          ))}

          {habits.length === 0 && (
            <div className="text-center py-12 bg-surface rounded-2xl border border-dashed border-border">
              <Users size={40} className="mx-auto text-muted mb-3" />
              <p className="text-subtext font-medium">No community challenges available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Habits;
