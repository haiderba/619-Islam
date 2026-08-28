import React, { useState } from 'react';
import { 
  Moon
} from 'lucide-react';

export const RamadanBootcampCard: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'30_days' | '15_days' | '60_days'>('30_days');

  const plans = {
    '15_days': {
      title: '15-Day Fast-Track Khatam',
      badge: 'Intense Pace 🔥',
      pagesPerPrayer: 8,
      pagesPerDay: 40,
      juzPerDay: 2,
      description: 'Read 8 pages after each of the 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha). Complete the entire Quran in 15 days!',
    },
    '30_days': {
      title: '30-Day Ramadan Standard Khatam',
      badge: 'Recommended 🌟',
      pagesPerPrayer: 4,
      pagesPerDay: 20,
      juzPerDay: 1,
      description: 'Read 4 pages (2 sheets) after each of the 5 daily prayers. That equals exactly 20 pages (1 full Juz) every day = 1 complete Khatam in 30 days!',
    },
    '60_days': {
      title: '60-Day Gentle Khatam',
      badge: 'Gentle Pace 🌿',
      pagesPerPrayer: 2,
      pagesPerDay: 10,
      juzPerDay: 0.5,
      description: 'Read 2 pages after each obligatory prayer. Steady, manageable consistency for busy schedules.',
    },
  };

  const current = plans[selectedPlan];

  return (
    <div className="bg-gradient-to-br from-[#0c182a] via-[#0e213d] to-[#081220] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
      {/* Crescent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              🌙 Sacred Seasons & Khatam Bootcamp
            </span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">
            Quran Khatam Pacing Calculator
          </h3>
          <p className="text-xs text-cyan-100/80 max-w-md">
            Achieve a complete recitation of the Holy Quran with mathematically proven prophetic pacing after every prayer.
          </p>
        </div>
      </div>

      {/* Plan Selection Chips */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10">
        {(['30_days', '15_days', '60_days'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedPlan(key)}
            className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
              selectedPlan === key
                ? 'bg-cyan-500 text-black font-black shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {key === '30_days' ? '30 Days (1 Juz)' : key === '15_days' ? '15 Days (2 Juz)' : '60 Days'}
          </button>
        ))}
      </div>

      {/* Breakdown Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
          <strong className="block text-2xl font-black text-amber-400 font-mono">
            {current.pagesPerPrayer} Pages
          </strong>
          <span className="text-[10px] uppercase font-bold text-white/70">After Each Prayer</span>
        </div>

        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
          <strong className="block text-2xl font-black text-cyan-400 font-mono">
            {current.pagesPerDay} Pages
          </strong>
          <span className="text-[10px] uppercase font-bold text-white/70">Daily Total</span>
        </div>

        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center space-y-1">
          <strong className="block text-2xl font-black text-emerald-400 font-mono">
            {current.juzPerDay} Juz
          </strong>
          <span className="text-[10px] uppercase font-bold text-white/70">Daily Progress</span>
        </div>
      </div>

      <p className="text-xs text-white/80 leading-relaxed bg-black/30 p-3 rounded-2xl border border-white/10">
        💡 {current.description}
      </p>

      {/* Tahajjud Last Third of Night Quick Info */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-cyan-200">
        <div className="flex items-center gap-1.5">
          <Moon size={14} className="text-amber-400" />
          <span>Last Third of Night (Tahajjud): <strong>02:30 AM – 05:00 AM</strong></span>
        </div>
        <span className="text-[10px] font-bold text-amber-300">Prime Hour of Dua 🤲</span>
      </div>

    </div>
  );
};
