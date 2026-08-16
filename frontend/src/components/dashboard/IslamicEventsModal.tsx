import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Moon
} from 'lucide-react';
import { ISLAMIC_MONTHS, ISLAMIC_EVENTS, IslamicEvent } from '../../utils/islamicEvents';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentMonthNumber?: number;
  currentDayNumber?: number;
  hijriYear?: string | number;
}

const IslamicEventsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentMonthNumber = 3, // Default to Rabi' al-Awwal
  currentDayNumber = 3,
  hijriYear = 1448
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNumber);

  if (!isOpen) return null;

  const currentMonthData = ISLAMIC_MONTHS.find(m => m.number === selectedMonth) || ISLAMIC_MONTHS[0];
  const eventsForMonth = ISLAMIC_EVENTS.filter(e => e.month === selectedMonth).sort((a, b) => a.day - b.day);

  const handlePrevMonth = () => {
    setSelectedMonth(prev => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => (prev === 12 ? 1 : prev + 1));
  };

  const getCategoryBadge = (category: IslamicEvent['category']) => {
    switch (category) {
      case 'eid':
        return {
          label: 'Blessed Celebration / Eid',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300'
        };
      case 'fast':
        return {
          label: 'Recommended Fast / Vigil',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        };
      case 'wiladat':
        return {
          label: 'Wiladat / Auspicious Birth',
          bg: 'bg-sky-500/15 border-sky-500/30 text-sky-300'
        };
      case 'shahadat':
        return {
          label: 'Shahadat / Commemoration',
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        };
      case 'milestone':
      default:
        return {
          label: 'Historic Islamic Milestone',
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 max-w-md w-full relative text-white flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors z-20"
          aria-label="Close Islamic Calendar"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="relative z-10 flex items-center gap-3 pb-3.5 border-b border-white/10 shrink-0 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner shrink-0">
            <Moon size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Islamic Events Calendar
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {hijriYear} AH
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white">
              {currentMonthData.nameEn} • <span className="font-arabic font-bold text-amber-200">{currentMonthData.nameAr}</span>
            </h2>
          </div>
        </div>

        {/* ── 🗓️ MONTH SELECTOR BAR (Arrows + Horizontal Month Chips) ── */}
        <div className="relative z-10 py-3 space-y-2 shrink-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <span className="text-xs font-black text-amber-300 tracking-wider uppercase">
              Month {selectedMonth} of 12
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 12 Months Horizontal Scroll Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ISLAMIC_MONTHS.map((m) => {
              const isSelected = m.number === selectedMonth;
              const isCurrent = m.number === currentMonthNumber;
              return (
                <button
                  key={m.number}
                  onClick={() => setSelectedMonth(m.number)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-black'
                      : isCurrent
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-black/30 text-white/70 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{m.nameEn}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 📜 MONTHLY EVENTS TIMELINE VIEW ── */}
        <div className="relative z-10 flex-1 overflow-y-auto min-h-0 py-3 pr-1 space-y-3 scrollbar-none">
          {eventsForMonth.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 text-white/50 flex items-center justify-center mx-auto">
                <CalendarIcon size={20} />
              </div>
              <p className="text-xs font-bold text-white/80">No major public holidays in this month</p>
              <p className="text-[11px] text-white/50">
                Observance of daily prayers, sunnah fasts on Mondays & Thursdays, and Ayyam al-Beed (13th, 14th, 15th).
              </p>
            </div>
          ) : (
            eventsForMonth.map((ev, index) => {
              const badge = getCategoryBadge(ev.category);
              const isToday = selectedMonth === currentMonthNumber && ev.day === currentDayNumber;
              const isUpcoming = selectedMonth === currentMonthNumber && ev.day > currentDayNumber;
              const daysDiff = ev.day - currentDayNumber;

              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isToday
                      ? 'bg-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Today Glow Ribbon */}
                  {isToday && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-bl-xl uppercase tracking-wider">
                      Today
                    </div>
                  )}

                  <div className="flex gap-3 items-start">
                    {/* Day Pill */}
                    <div className={`w-12 h-14 shrink-0 rounded-2xl flex flex-col items-center justify-center border text-center shadow-inner ${
                      isToday
                        ? 'bg-amber-500 text-black border-amber-400 font-black'
                        : 'bg-gradient-to-b from-[#0b3c3f] to-[#041c1d] border-amber-500/30 text-amber-300'
                    }`}>
                      <span className="text-[9px] uppercase font-bold tracking-wider leading-none">DAY</span>
                      <span className="text-lg font-black leading-tight">{ev.day}</span>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>

                        {isUpcoming && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">
                            {daysDiff === 1 ? 'Tomorrow' : `in ${daysDiff} days`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-white leading-snug">
                        {ev.title}
                      </h3>

                      {ev.titleAr && (
                        <p className="font-arabic text-xs font-bold text-amber-200" dir="rtl">
                          {ev.titleAr}
                        </p>
                      )}

                      {ev.titleUr && (
                        <p className="font-urdu text-[11px] text-emerald-300" dir="rtl">
                          {ev.titleUr}
                        </p>
                      )}

                      <p className="text-[11px] text-white/70 leading-relaxed pt-0.5">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="relative z-10 pt-3 border-t border-white/10 shrink-0 flex items-center justify-between text-[10px] text-white/60">
          <span>🌙 13th, 14th & 15th: Sunnah Ayyam al-Beed Fasts</span>
          <span className="font-bold text-amber-400">All 12 Months Available</span>
        </div>
      </div>
    </div>
  );
};

export default IslamicEventsModal;
