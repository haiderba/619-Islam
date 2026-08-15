import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import { RotateCcw, Plus, Activity, Hand } from 'lucide-react';

interface TasbeehItem {
  id: string;
  title: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  target_count: number;
  current_count: number;
}

const Tasbeeh: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<TasbeehItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<TasbeehItem | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(33);

  useEffect(() => {
    loadTasbeeh();
  }, [user]);

  const loadTasbeeh = async () => {
    try {
      const res = await api.get('/tasbeeh');
      setItems(res.data);
      if (res.data.length > 0 && !activeItem) {
        setActiveItem(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load tasbeeh", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      const id = crypto.randomUUID();
      const payload = {
        id,
        title: newTitle,
        target_count: newTarget,
        current_count: 0,
        is_custom: true
      };
      const res = await api.post('/tasbeeh', payload);
      setItems([...items, res.data]);
      setActiveItem(res.data);
      setShowAddForm(false);
      setNewTitle('');
    } catch (err) {
      console.error("Failed to create tasbeeh", err);
    }
  };

  const handleTap = async () => {
    if (!activeItem) return;

    // Haptic feedback if supported by browser
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    const updatedItem = { 
      ...activeItem, 
      current_count: activeItem.current_count + 1 
    };
    setActiveItem(updatedItem);
    
    // Update local state list
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));

    // Persist to backend (debouncing would be better here in production, but fine for MVP)
    try {
      await api.put(`/tasbeeh/${activeItem.id}?current_count=${updatedItem.current_count}`);
    } catch (err) {
      console.error("Failed to save count", err);
    }
  };

  const handleReset = async () => {
    if (!activeItem) return;
    const updatedItem = { ...activeItem, current_count: 0 };
    setActiveItem(updatedItem);
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    try {
      await api.put(`/tasbeeh/${activeItem.id}?current_count=0`);
    } catch (err) {
      console.error("Failed to reset count", err);
    }
  };

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto">
      <header className="mb-6 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">Tasbeeh</h1>
          <p className="text-subtext mt-1 text-sm">Digital Dhikr Counter</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
        >
          <Plus size={24} />
        </button>
      </header>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-6 space-y-4">
          <h3 className="font-semibold text-text">New Dhikr</h3>
          <input
            type="text"
            placeholder="e.g. Subhanallah"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
            required
          />
          <input
            type="number"
            placeholder="Target Count"
            value={newTarget}
            onChange={e => setNewTarget(parseInt(e.target.value) || 33)}
            className="w-full px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
            min="1"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-medium">Add</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-surface border border-border text-subtext py-2 rounded-xl font-medium">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : activeItem ? (
        <div className="flex flex-col items-center">
          
          {/* Item Selector */}
          <select 
            className="mb-8 bg-card border border-border text-text rounded-xl px-4 py-2 font-medium w-full shadow-sm appearance-none text-center"
            value={activeItem.id}
            onChange={(e) => {
              const item = items.find(i => i.id === e.target.value);
              if (item) setActiveItem(item);
            }}
          >
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>

          {/* Counter Display */}
          <div className="relative mb-12">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-border"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - (activeItem.current_count / activeItem.target_count))}
                className="text-primary transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold text-text">{activeItem.current_count}</span>
              <span className="text-subtext font-medium mt-1">/ {activeItem.target_count}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button 
              onClick={handleReset}
              className="p-4 rounded-full bg-card border border-border text-muted hover:text-danger hover:border-danger/30 transition-all shadow-sm"
            >
              <RotateCcw size={24} />
            </button>
            
            <button 
              onClick={handleTap}
              className="w-24 h-24 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-xl shadow-primary/30 transition-all transform active:scale-95"
            >
              <Hand size={40} />
            </button>

            <div className="w-[58px]"></div> {/* Spacer to center the main button */}
          </div>
          
          {activeItem.arabic && (
             <p className="mt-12 text-2xl font-arabic text-text text-center" dir="rtl">{activeItem.arabic}</p>
          )}
          {activeItem.translation && (
             <p className="mt-4 text-sm text-subtext text-center italic">"{activeItem.translation}"</p>
          )}

        </div>
      ) : (
        <div className="text-center py-10 bg-surface rounded-2xl border border-dashed border-border">
          <Activity size={40} className="mx-auto text-muted mb-3" />
          <p className="text-subtext font-medium">No Tasbeeh added yet.<br/>Click + to add your first one!</p>
        </div>
      )}
    </div>
  );
};

export default Tasbeeh;
