import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  ChevronLeft, 
  Target, 
  Plus, 
  Minus, 
  Award, 
  BookMarked 
} from 'lucide-react';

interface KhatamPlan {
  targetDays: number;
  startDate: string;
  pagesRead: number;
  totalPages: number;
}

export const KhatamPlanner: React.FC = () => {
  const navigate = useNavigate();

  const [plan, setPlan] = useState<KhatamPlan>(() => {
    try {
      const saved = localStorage.getItem('619_khatam_plan');
      return saved ? JSON.parse(saved) : {
        targetDays: 30,
        startDate: new Date().toISOString().split('T')[0],
        pagesRead: 0,
        totalPages: 604 // Standard Mushaf pages
      };
    } catch {
      return {
        targetDays: 30,
        startDate: new Date().toISOString().split('T')[0],
        pagesRead: 0,
        totalPages: 604
      };
    }
  });

  const [activeTab, setActiveTab] = useState<'planner' | 'dua'>('planner');

  useEffect(() => {
    localStorage.setItem('619_khatam_plan', JSON.stringify(plan));
  }, [plan]);

  const dailyTargetPages = Math.ceil(plan.totalPages / plan.targetDays);
  const remainingPages = Math.max(0, plan.totalPages - plan.pagesRead);
  const percentComplete = Math.min(100, Math.round((plan.pagesRead / plan.totalPages) * 100));

  // Compute estimated completion date
  const startDate = new Date(plan.startDate);
  const completionDate = new Date(startDate);
  completionDate.setDate(startDate.getDate() + plan.targetDays);
  const formattedEndDate = completionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // Update read pages
  const addPages = (count: number) => {
    setPlan(prev => ({
      ...prev,
      pagesRead: Math.min(prev.totalPages, Math.max(0, prev.pagesRead + count))
    }));
  };

  const setTargetDays = (days: number) => {
    setPlan(prev => ({
      ...prev,
      targetDays: days,
      startDate: new Date().toISOString().split('T')[0]
    }));
  };

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-5xl mx-auto w-full">
      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1 bg-surface p-1 rounded-full border border-border text-xs font-bold">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'planner' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext'
            }`}
          >
            My Goal
          </button>
          <button
            onClick={() => setActiveTab('dua')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'dua' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext'
            }`}
          >
            Khatam Dua 🤲
          </button>
        </div>
      </div>

      {/* ── Hero Master Card ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={13} className="text-amber-400" />
            <span>Khatam-ul-Quran Planner</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-2xl font-black text-white">
                {percentComplete}% Completed
              </h1>
              <p className="text-xs text-white/80 mt-0.5">
                {plan.pagesRead} of {plan.totalPages} pages read • {remainingPages} remaining
              </p>
            </div>

            {/* Circular Progress Indicator */}
            <div className="w-14 h-14 rounded-full bg-black/40 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-sm shadow-inner backdrop-blur-md">
              {percentComplete}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" 
              style={{ width: `${percentComplete}%` }} 
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/70 font-medium mt-2">
            <span>Target: {dailyTargetPages} pages/day</span>
            <span>Est. Completion: <strong className="text-amber-300">{formattedEndDate}</strong></span>
          </div>
        </div>
      </div>

      {activeTab === 'planner' ? (
        <div className="space-y-4">
          {/* ── 1. Daily Progress Logger ── */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-xs font-black text-text uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={16} className="text-amber-400" />
                <span>Log Today's Reading</span>
              </h3>
              <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Page {plan.pagesRead} / 604
              </span>
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => addPages(-1)}
                className="p-2.5 rounded-2xl bg-surface hover:bg-card border border-border text-subtext hover:text-text active:scale-95 transition-all"
                title="Subtract 1 Page"
              >
                <Minus size={16} />
              </button>

              <div className="flex-1 grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => addPages(1)}
                  className="py-2.5 rounded-2xl bg-surface hover:bg-card border border-border text-xs font-black text-text active:scale-95 transition-all"
                >
                  +1 Page
                </button>
                <button
                  onClick={() => addPages(5)}
                  className="py-2.5 rounded-2xl bg-surface hover:bg-card border border-border text-xs font-black text-text active:scale-95 transition-all"
                >
                  +5 Pages
                </button>
                <button
                  onClick={() => addPages(20)}
                  className="py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs font-black text-amber-500 active:scale-95 transition-all"
                  title="1 Complete Juz (Para)"
                >
                  +1 Juz (20p)
                </button>
              </div>

              <button
                onClick={() => addPages(1)}
                className="p-2.5 rounded-2xl bg-amber-500 text-black active:scale-95 transition-all"
                title="Add 1 Page"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Jump to Quran Reader Button */}
            <button
              onClick={() => navigate('/quran')}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all mt-2"
            >
              <BookMarked size={16} />
              <span>Open Quran Reader ➔</span>
            </button>
          </div>

          {/* ── 2. Preset Goal Selector ── */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-text uppercase tracking-wider flex items-center gap-1.5 border-b border-border/60 pb-2">
              <Target size={16} className="text-amber-400" />
              <span>Choose Your Khatam Plan</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { days: 30, title: '30 Days (Ramadan)', sub: '20 pages (1 Juz) / day', badge: 'Popular 🔥' },
                { days: 60, title: '60 Days (2 Months)', sub: '10 pages / day' },
                { days: 90, title: '90 Days (3 Months)', sub: '7 pages / day' },
                { days: 365, title: '1 Year (Consistent)', sub: '2 pages / day' },
              ].map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => setTargetDays(preset.days)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    plan.targetDays === preset.days
                      ? 'bg-amber-500/15 border-amber-500 shadow-sm ring-2 ring-amber-500/30'
                      : 'bg-surface hover:bg-card border-border'
                  }`}
                >
                  {preset.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-500 text-black absolute top-2 right-2">
                      {preset.badge}
                    </span>
                  )}
                  <h4 className="text-xs font-black text-text">{preset.title}</h4>
                  <p className="text-[10px] text-subtext mt-0.5 font-medium">{preset.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Dua Khatam-ul-Quran Tab ── */
        <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-amber-500 tracking-wider">
            <Award size={16} />
            <span>Duʿā’ Khatam al-Qur’ān</span>
          </div>

          <p className="text-xl sm:text-2xl font-black font-arabic text-amber-400 leading-loose py-2">
            اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ
          </p>

          <p className="text-xs sm:text-sm text-text font-medium leading-relaxed italic bg-surface/70 dark:bg-black/30 border border-border/80 rounded-2xl p-4 text-left">
            "O Allah, have mercy on me through the Quran, and make it for me a guide, a light, a guidance, and a mercy. O Allah, remind me of what I have forgotten of it, teach me what I do not know of it, and grant me its recitation during the hours of the night and the edges of the day, and make it a proof for me, O Lord of the worlds."
          </p>
        </div>
      )}
    </div>
  );
};
