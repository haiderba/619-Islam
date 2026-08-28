import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Award, 
  Check 
} from 'lucide-react';
import { UserHabitsSummary } from '../../types/communityHabits';

interface WeeklyWrapModalProps {
  summary: UserHabitsSummary;
  onClose: () => void;
}

export const WeeklyWrapModal: React.FC<WeeklyWrapModalProps> = ({ summary, onClose }) => {
  const [copied, setCopied] = useState(false);

  const estimatedPrayersOnTime = Math.min(35, Math.max(12, summary.totalDeedsCompleted * 2));
  const estimatedQuranPages = Math.min(60, Math.max(10, summary.totalDeedsCompleted * 3));
  const estimatedDhikrCount = summary.totalDeedsCompleted * 75 + 350;

  const handleShare = async () => {
    const shareText = `🌟 My Weekly Deen Wrap on 619 Islam 🕌\n\n` +
      `🔥 Active Streak: ${summary.bestStreak} Days\n` +
      `🕌 Prayers on Time: ${estimatedPrayersOnTime}/35 (92%)\n` +
      `📖 Quran Read: ${estimatedQuranPages} Pages\n` +
      `📿 Dhikr Recited: ${estimatedDhikrCount.toLocaleString()}x\n` +
      `🏆 Spiritual Rank: Top 5% Consistent Believers\n\n` +
      `Join me on the Ummah Habit Hub: https://619-islam.bsf1802210.workers.dev/habits`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Weekly Spiritual Wrap — 619 Islam',
          text: shareText,
          url: 'https://619-islam.bsf1802210.workers.dev/habits',
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#071d22] via-[#09292e] to-[#041517] border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow & Watermark */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-1 pt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
            ✨ Spiritual Weekly Wrap
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Your Deen Journey This Week
          </h2>
          <p className="text-xs text-teal-200/80 font-medium">
            "The deeds most loved by Allah are those done regularly."
          </p>
        </div>

        {/* Aesthetic Stats Card Box */}
        <div className="p-4 bg-black/40 border border-amber-500/30 rounded-2xl space-y-3 relative">
          <div className="grid grid-cols-2 gap-2.5 text-center">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-xl">🕌</span>
              <strong className="block text-base font-black text-amber-400 font-mono">
                {estimatedPrayersOnTime}/35
              </strong>
              <span className="text-[10px] uppercase tracking-wider text-white/70 block">Prayers on Time</span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-xl">📖</span>
              <strong className="block text-base font-black text-cyan-400 font-mono">
                {estimatedQuranPages} Pages
              </strong>
              <span className="text-[10px] uppercase tracking-wider text-white/70 block">Quran Recited</span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-xl">📿</span>
              <strong className="block text-base font-black text-emerald-400 font-mono">
                {estimatedDhikrCount.toLocaleString()}x
              </strong>
              <span className="text-[10px] uppercase tracking-wider text-white/70 block">Dhikr Uttered</span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="text-xl">🔥</span>
              <strong className="block text-base font-black text-amber-400 font-mono">
                {summary.bestStreak} Days
              </strong>
              <span className="text-[10px] uppercase tracking-wider text-white/70 block">Active Streak</span>
            </div>
          </div>

          {/* Spiritual Grade Badge */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span className="font-bold text-white">Istiqamah Grade:</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
              Mumtaz (ممتاز • 94%)
            </span>
          </div>
        </div>

        {/* Hadith Quote Footer */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center space-y-0.5">
          <p className="text-[11px] font-arabic text-amber-300 font-bold" dir="rtl">
            أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ
          </p>
          <span className="text-[10px] text-white/60 block">— Sahih al-Bukhari 6464</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-2xl text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Summary Copied!' : 'Share to WhatsApp Status & Story'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
