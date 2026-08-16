import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, X, Check, Award, Code2, Lightbulb } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  const [hasPrayed, setHasPrayed] = useState(false);
  const [prayersCount, setPrayersCount] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prayed = localStorage.getItem('619_prayed_for_creators') === 'true';
      const count = parseInt(localStorage.getItem('619_prayers_count') || '0', 10);
      setHasPrayed(prayed);
      setPrayersCount(count > 0 ? count : 1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrayed = () => {
    const nextCount = prayersCount + 1;
    setHasPrayed(true);
    setPrayersCount(nextCount);
    setShowCelebration(true);
    localStorage.setItem('619_prayed_for_creators', 'true');
    localStorage.setItem('619_prayers_count', nextCount.toString());

    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon Glow */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-2xl bg-white/15 backdrop-blur-sm">
              <Heart className="w-5 h-5 text-rose-300 fill-rose-300 animate-pulse" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Credits & Dua Request</h2>
              <p className="text-white/80 text-xs font-medium">In Dedication & Sincere Duas for the Ummah</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Creator Profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mind & Idea */}
            <div className="bg-surface/80 border border-border/70 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-0.5">
                    Mind & Idea of App
                  </span>
                  <h3 className="font-extrabold text-sm text-text truncate">Mr. Syed Wajahat Ali</h3>
                  <p className="text-[11px] text-subtext mt-0.5 leading-snug">
                    Vision, Concept & Guidance
                  </p>
                </div>
              </div>
            </div>

            {/* Development */}
            <div className="bg-surface/80 border border-border/70 p-4 rounded-2xl relative overflow-hidden group hover:border-primary/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0">
                  <Code2 size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-0.5">
                    Lead Development
                  </span>
                  <h3 className="font-extrabold text-sm text-text truncate">Mr. Usman Haider</h3>
                  <p className="text-[11px] text-subtext mt-0.5 leading-snug">
                    Architecture & Engineering
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sincere Dua Request Note */}
          <div className="bg-primary/5 border border-primary/25 p-4 sm:p-5 rounded-2xl space-y-2.5 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Sparkles size={13} />
              <span>A Humble Request for Dua</span>
            </span>

            <p className="text-xs sm:text-sm text-text leading-relaxed font-medium">
              We humbly request your heartfelt Duas for both of us, our parents, and our families — for 
              <strong className="text-primary font-bold"> robust health</strong>, 
              <strong className="text-primary font-bold"> blessed long life</strong>, 
              <strong className="text-primary font-bold"> abundance in Halal Rizq (sustenance)</strong>, and 
              <strong className="text-primary font-bold"> forgiveness & peace in Dunya and Akhirah</strong>.
            </p>

            <div className="p-3 bg-surface/80 rounded-xl border border-border/60">
              <p className="font-arabic text-lg sm:text-xl text-amber-400 font-bold leading-loose text-center" dir="rtl">
                رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
              </p>
              <p className="font-arabic text-base sm:text-lg text-emerald-400 font-semibold leading-relaxed text-center mt-1" dir="rtl">
                اللَّهُمَّ بَارِكْ لَهُمْ فِي أَعْمَارِهِمْ وَأَرْزَاقِهِمْ وَعَافِيَتِهِمْ
              </p>
            </div>

            <p className="text-[11px] text-subtext italic">
              "May Allah accept 619 Islam as a continuous Sadaqah Jariyah for the Ummah. Ameen."
            </p>
          </div>

          {/* Interactive Prayed Button & Reciprocal Dua */}
          <div className="pt-2 space-y-3">
            {showCelebration && (
              <div className="p-3 bg-emerald-500 text-white rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95 duration-200 shadow-lg shadow-emerald-500/25">
                <Sparkles size={16} />
                <span>✨ Alhamdulillah! Your sincere Dua has been registered.</span>
              </div>
            )}

            {!hasPrayed ? (
              <button
                onClick={handlePrayed}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <Heart size={18} className="fill-white" />
                <span>🤲 I Prayed for You (Ameen)</span>
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handlePrayed}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/25 active:scale-95 transition-all"
                >
                  <Check size={16} />
                  <span>🤲 Prayed Again ({prayersCount} Duas Sent)</span>
                </button>

                {/* Reciprocal Dua for the User */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-1.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 font-black text-xs uppercase tracking-wider">
                    <Award size={14} />
                    <span>جَزَاكَ ٱللَّٰهُ خَيْرًا (JazakAllahu Khairan!)</span>
                  </div>
                  <p className="text-xs text-text font-medium leading-relaxed">
                    May Allah <strong className="text-emerald-400 font-bold">bless you abundantly</strong>, accept all your prayers, grant immense barakah in your health, family, and Rizq, and reward you with Jannat-ul-Firdaus! 🤍 Ameen.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Close */}
        <div className="p-4 bg-surface/50 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-subtext hover:text-text hover:bg-surface transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
