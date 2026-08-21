import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Volume2, 
  VolumeX, 
  X, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight
} from 'lucide-react';
import { adhanService, DUA_AFTER_ADHAN } from '../../services/adhanService';

export const AdhanPrayerModal: React.FC = () => {
  const navigate = useNavigate();
  const [adhanState, setAdhanState] = useState(adhanService.getState());
  const [showDua, setShowDua] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsub = adhanService.subscribe((state) => {
      setAdhanState(state);
      if (state.isPlaying) {
        setIsVisible(true);
      }
    });

    const handleAdhanEvent = () => {
      setIsVisible(true);
    };

    window.addEventListener('619_adhan_alert', handleAdhanEvent);

    return () => {
      unsub();
      window.removeEventListener('619_adhan_alert', handleAdhanEvent);
    };
  }, []);

  if (!isVisible && !adhanState.isPlaying) return null;

  const handleClose = () => {
    adhanService.stopAdhan();
    setIsVisible(false);
  };

  const handleGoToNamaz = () => {
    handleClose();
    navigate('/namaz');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#0b1d28] via-[#09222c] to-[#041217] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors z-20"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-5 text-center relative z-10">
          
          {/* Animated Mosque & Audio Wave Badge */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/20 via-amber-400/30 to-teal-500/20 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
              <span className="text-4xl animate-bounce" style={{ animationDuration: '2s' }}>🕌</span>
              {adhanState.isPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-amber-400/60 animate-ping" style={{ animationDuration: '2.5s' }} />
              )}
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
              {adhanState.isPlaying ? '🔊 Adhan is Playing' : '🕌 Prayer Call'}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              {adhanState.prayerName || 'Salah'} Prayer Time
            </h2>
            <span className="text-xl font-arabic text-amber-400 font-bold block mt-0.5">
              {adhanState.arabicName ? `حي على الصلاة (${adhanState.arabicName})` : 'حي على الصلاة'}
            </span>
            <p className="text-xs text-cyan-200/80 font-medium mt-1">
              {adhanState.styleName || 'Makkah Al-Mukarramah Adhan'}
            </p>
          </div>

          {/* Adhan Controls */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {adhanState.isPlaying ? (
              <button
                onClick={() => adhanService.stopAdhan()}
                className="px-5 py-2.5 rounded-2xl bg-danger/20 hover:bg-danger/30 text-red-300 border border-danger/40 text-xs font-black transition-all active:scale-95 flex items-center gap-2"
              >
                <VolumeX size={16} />
                <span>Stop Adhan Sound</span>
              </button>
            ) : (
              <button
                onClick={() => adhanService.playAdhan(adhanState.prayerName, adhanState.arabicName)}
                className="px-5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black transition-all active:scale-95 flex items-center gap-2"
              >
                <Volume2 size={16} />
                <span>Replay Adhan</span>
              </button>
            )}

            <button
              onClick={handleGoToNamaz}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Namaz Times</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 🤲 Dua After Adhan Accordion */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-left space-y-2">
            <button
              onClick={() => setShowDua(!showDua)}
              className="w-full flex items-center justify-between text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} />
                <span>Sunnah: Dua After Adhan</span>
              </div>
              {showDua ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDua && (
              <div className="pt-2 space-y-2.5 text-xs animate-in fade-in duration-200">
                <p className="font-arabic text-sm text-right leading-loose text-amber-200">
                  {DUA_AFTER_ADHAN.arabic}
                </p>
                <p className="text-[11px] text-cyan-200/90 italic">
                  "{DUA_AFTER_ADHAN.transliteration}"
                </p>
                <p className="text-[11px] text-white/80">
                  {DUA_AFTER_ADHAN.translation}
                </p>
                <span className="text-[9px] font-bold text-white/50 block text-right">
                  — {DUA_AFTER_ADHAN.hadithRef}
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
