import React, { useState, useMemo } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sliders 
} from 'lucide-react';
import { getMoonPhase, getNextSolarEclipse, getNextLunarEclipse } from '../../utils/lunarEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialHijriDay?: number;
  initialHijriMonth?: string;
  initialHijriYear?: string | number;
}

const MoonSightingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialHijriDay = 3,
  initialHijriMonth = "Rabi' al-Awwal",
  initialHijriYear = 1448
}) => {
  // Day offset from today for the interactive scroller (-15 to +15 days)
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'phases' | 'eclipses' | 'dua'>('phases');

  const simulatedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const moonInfo = useMemo(() => {
    return getMoonPhase(simulatedDate);
  }, [simulatedDate]);

  const simulatedHijriDay = useMemo(() => {
    let day = initialHijriDay + dayOffset;
    while (day < 1) day += 30;
    while (day > 30) day -= 30;
    return day;
  }, [initialHijriDay, dayOffset]);

  const nextSolar = getNextSolarEclipse();
  const nextLunar = getNextLunarEclipse();

  if (!isOpen) return null;

  const formattedSimulatedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(simulatedDate);

  // SVG Moon Graphic Generator based on phase
  const renderMoonSvg = (phase: number) => {
    // phase: 0 (New), 0.25 (First Q), 0.5 (Full), 0.75 (Last Q)
    const isWaxing = phase <= 0.5;
    const r = 52;
    const cx = 60;
    const cy = 60;

    return (
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
        {/* Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
        
        <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
          {/* Base Dark Moon Sphere */}
          <circle cx={cx} cy={cy} r={r} fill="#0d282a" stroke="#164345" strokeWidth="2" />
          
          {/* Moon Surface Craters */}
          <circle cx={cx - 18} cy={cy - 12} r="6" fill="#081819" opacity="0.4" />
          <circle cx={cx + 12} cy={cy + 18} r="8" fill="#081819" opacity="0.3" />
          <circle cx={cx + 2} cy={cy - 22} r="4" fill="#081819" opacity="0.3" />
          <circle cx={cx - 10} cy={cy + 22} r="5" fill="#081819" opacity="0.35" />

          {/* Illuminated Arc */}
          {phase > 0.02 && phase < 0.98 && (
            <path
              d={
                isWaxing
                  ? `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${Math.abs(Math.cos(phase * 2 * Math.PI) * r)} ${r} 0 0 ${phase > 0.25 ? 1 : 0} ${cx} ${cy - r}`
                  : `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} A ${Math.abs(Math.cos(phase * 2 * Math.PI) * r)} ${r} 0 0 ${phase > 0.75 ? 0 : 1} ${cx} ${cy - r}`
              }
              fill="#fef3c7"
              filter="drop-shadow(0px 0px 4px #fbbf24)"
            />
          )}

          {/* Full Moon Complete Disc */}
          {phase >= 0.48 && phase <= 0.52 && (
            <circle cx={cx} cy={cy} r={r} fill="#fef3c7" filter="drop-shadow(0px 0px 8px #fbbf24)" />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 max-w-md w-full relative text-white flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors z-20"
          aria-label="Close Moon Sighting Observatory"
        >
          <X size={18} />
        </button>

        {/* ── 🌙 MODAL HEADER ── */}
        <div className="relative z-10 flex items-center gap-3 pb-3.5 border-b border-white/10 shrink-0 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner shrink-0">
            <Moon size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Hilal & Moon Observatory
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Live Astronomy
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white">
              {simulatedHijriDay} {initialHijriMonth} {initialHijriYear} AH
            </h2>
          </div>
        </div>

        {/* ── 📱 NAVIGATION TABS ── */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 my-3 p-1 bg-black/30 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('phases')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'phases' ? 'bg-amber-500 text-black shadow-md font-black' : 'text-white/70 hover:text-white'
            }`}
          >
            🌙 Moon Phase
          </button>

          <button
            onClick={() => setActiveTab('eclipses')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'eclipses' ? 'bg-amber-500 text-black shadow-md font-black' : 'text-white/70 hover:text-white'
            }`}
          >
            ☀️ Solar Eclipses
          </button>

          <button
            onClick={() => setActiveTab('dua')}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dua' ? 'bg-amber-500 text-black shadow-md font-black' : 'text-white/70 hover:text-white'
            }`}
          >
            🤲 Sighting Dua
          </button>
        </div>

        {/* ── 📜 TAB 1: MOON PHASES & INTERACTIVE SCROLLER ── */}
        {activeTab === 'phases' && (
          <div className="relative z-10 flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 scrollbar-none">
            {/* Visual Moon Rendering */}
            <div className="bg-black/30 border border-white/10 rounded-3xl p-4 text-center relative overflow-hidden">
              {renderMoonSvg(moonInfo.phase)}

              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-base font-black text-white">
                    {moonInfo.phaseName}
                  </h3>
                  <span className="text-xs font-arabic font-bold text-amber-300">
                    {moonInfo.phaseNameAr}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 text-xs font-bold">
                  <span className="text-amber-400">{moonInfo.illumination}% Illuminated</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-400">Age: {moonInfo.ageDays} days</span>
                  <span className="text-white/40">•</span>
                  <span className="text-sky-300">{formattedSimulatedDate}</span>
                </div>
              </div>
            </div>

            {/* ── 🎛️ INTERACTIVE DATE SCROLLER / SLIDER ── */}
            <div className="bg-gradient-to-r from-[#062426] to-[#041c1d] border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Sliders size={14} />
                  <span>Interactive Date Scroller</span>
                </div>
                <span className="text-white/80">
                  {dayOffset === 0 ? 'Today (Live)' : dayOffset > 0 ? `+${dayOffset} Days Ahead` : `${dayOffset} Days Ago`}
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="-14"
                max="15"
                value={dayOffset}
                onChange={(e) => setDayOffset(parseInt(e.target.value))}
                className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <button
                  onClick={() => setDayOffset(prev => Math.max(prev - 1, -14))}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-0.5 active:scale-95 transition-all"
                >
                  <ChevronLeft size={14} />
                  <span>Prev Day</span>
                </button>

                {/* Reset to Today */}
                <button
                  onClick={() => setDayOffset(0)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                    dayOffset === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-500 text-black shadow-sm'
                  }`}
                >
                  Today
                </button>

                <button
                  onClick={() => setDayOffset(prev => Math.min(prev + 1, 15))}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-0.5 active:scale-95 transition-all"
                >
                  <span>Next Day</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Key Lunar Markers Fast-Jump Chips */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => setDayOffset(1 - initialHijriDay)}
                  className="py-1 px-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/5 text-[10px] font-bold text-emerald-300 text-center"
                >
                  🌙 Day 1 (Hilal)
                </button>
                <button
                  onClick={() => setDayOffset(14 - initialHijriDay)}
                  className="py-1 px-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/5 text-[10px] font-bold text-amber-300 text-center"
                >
                  🌕 Day 14 (Full Moon)
                </button>
                <button
                  onClick={() => setDayOffset(29 - initialHijriDay)}
                  className="py-1 px-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/5 text-[10px] font-bold text-purple-300 text-center"
                >
                  🌘 Day 29 (Sighting)
                </button>
              </div>
            </div>

            {/* Sighting Probability & Islamic Significance */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                  Hilal Sighting & Islamic Significance
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  moonInfo.hilalVisibility === 'Easily Visible' || moonInfo.hilalVisibility === 'Full / Bright'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : moonInfo.hilalVisibility === 'Difficult'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {moonInfo.hilalVisibility}
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                {moonInfo.islamicSignificance}
              </p>
            </div>
          </div>
        )}

        {/* ── ☀️ TAB 2: SOLAR & LUNAR ECLIPSES (Salat al-Kusuf) ── */}
        {activeTab === 'eclipses' && (
          <div className="relative z-10 flex-1 overflow-y-auto min-h-0 space-y-3 pr-1 scrollbar-none">
            {/* Next Solar Eclipse Card */}
            <div className="bg-black/30 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                  <Sun size={16} />
                  <span>Next Solar Eclipse (Kusuf)</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {nextSolar.eclipseType} Eclipse
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{nextSolar.name}</h4>
                <p className="font-arabic text-xs font-bold text-amber-200">{nextSolar.nameAr}</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">📅 {nextSolar.formattedDate}</p>
              </div>

              <div className="text-[11px] text-white/70 space-y-1">
                <p><strong>Visibility:</strong> {nextSolar.visibilityRegions}</p>
                <p className="pt-1 text-amber-200/90 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-amber-500/20">
                  <strong>🕌 Islamic Ruling (Salat al-Kusuf):</strong> {nextSolar.islamicRuling}
                </p>
              </div>
            </div>

            {/* Next Lunar Eclipse Card */}
            <div className="bg-black/30 border border-sky-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sky-400 font-black text-xs">
                  <Moon size={16} />
                  <span>Next Lunar Eclipse (Khusuf)</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {nextLunar.eclipseType} Eclipse
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{nextLunar.name}</h4>
                <p className="font-arabic text-xs font-bold text-sky-200">{nextLunar.nameAr}</p>
                <p className="text-xs font-bold text-sky-300 mt-0.5">📅 {nextLunar.formattedDate}</p>
              </div>

              <div className="text-[11px] text-white/70 space-y-1">
                <p><strong>Visibility:</strong> {nextLunar.visibilityRegions}</p>
                <p className="pt-1 text-sky-200/90 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-sky-500/20">
                  <strong>🕌 Islamic Ruling (Salat al-Khusuf):</strong> {nextLunar.islamicRuling}
                </p>
              </div>
            </div>

            {/* Salat al-Kusuf How-To Guide */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-xs space-y-1.5">
              <h5 className="font-black text-emerald-300 flex items-center gap-1">
                <BookOpen size={13} />
                <span>How to Pray Salat al-Kusuf (Eclipse Prayer)</span>
              </h5>
              <p className="text-white/80 leading-relaxed text-[11px]">
                It consists of 2 Rakahs with two extended Ruku in each Rakah (four Ruku in total). Recite Surah al-Fatiha followed by a long Surah (like Al-Baqarah), prolong the Ruku and Sujud in glorification, followed by earnest repentance and charity.
              </p>
            </div>
          </div>
        )}

        {/* ── 🤲 TAB 3: HILAL SIGHTING DUA ── */}
        {activeTab === 'dua' && (
          <div className="relative z-10 flex-1 overflow-y-auto min-h-0 space-y-3.5 pr-1 scrollbar-none text-center">
            <div className="bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/30 rounded-3xl p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles size={24} />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  Sunnah Sighting Supplication
                </span>
                <h3 className="text-sm font-black text-white">
                  Dua Upon Sighting the New Crescent (Hilal)
                </h3>
              </div>

              {/* Arabic Calligraphy */}
              <div className="bg-black/50 border border-amber-500/20 rounded-2xl p-4">
                <p className="font-arabic text-base sm:text-lg font-bold text-amber-200 leading-loose" dir="rtl">
                  اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالإِيمَانِ، وَالسَّلامَةِ وَالإِسْلامِ، رَبِّي وَرَبُّكَ اللَّهُ.
                </p>
              </div>

              {/* English Translation */}
              <p className="text-xs text-white/90 leading-relaxed font-medium italic">
                "O Allah, let this crescent appear above us with blessing and faith, safety and Islam. [O moon,] my Lord and your Lord is Allah."
              </p>

              {/* Urdu Translation */}
              <p className="font-urdu text-xs text-emerald-300" dir="rtl">
                "اے اللہ! اس چاند کو ہم پر برکت، ایمان، سلامتی اور اسلام کے ساتھ طلوع فرما۔ (اے چاند!) میرا اور تیرا رب اللہ ہے۔"
              </p>

              <span className="text-[10px] text-white/60 block pt-1">
                Source: Sunan al-Tirmidhi (3451), Sahih Hadith
              </span>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="relative z-10 pt-3 border-t border-white/10 shrink-0 flex items-center justify-between text-[10px] text-white/60">
          <span>🔭 Precision Synodic Lunar Model</span>
          <span className="font-bold text-amber-400">Salat al-Kusuf Guide Included</span>
        </div>
      </div>
    </div>
  );
};

export default MoonSightingModal;
