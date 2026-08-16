import React, { useState, useEffect, useRef } from 'react';
import { ALLAH_NAMES, NameOfAllah } from '../utils/namesOfAllahData';
import { 
  Play, 
  Pause, 
  Search, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'grid' | 'flashcard';
type CategoryFilter = 'all' | 'mercy' | 'majesty' | 'forgiveness' | 'creator' | 'protection';

export const NamesOfAllah: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Audio State
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Flashcard Memorization State
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memorizedIds, setMemorizedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('619_memorized_names');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Detailed Modal State
  const [activeModalName, setActiveModalName] = useState<NameOfAllah | null>(null);

  // Filtered List
  const filteredNames = ALLAH_NAMES.filter(name => {
    const matchesSearch = 
      name.arabic.includes(searchQuery.trim()) ||
      name.transliteration.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      name.meaningEn.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      name.meaningUr.includes(searchQuery.trim());

    const matchesCategory = selectedCategory === 'all' || name.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle Play Individual Name Audio
  const playNameAudio = (name: NameOfAllah, index?: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(name.audioUrl);
    audioRef.current = audio;
    
    if (index !== undefined) {
      setCurrentPlayingIndex(index);
    } else {
      const idx = ALLAH_NAMES.findIndex(n => n.id === name.id);
      setCurrentPlayingIndex(idx >= 0 ? idx : null);
    }

    audio.onended = () => {
      if (isPlayingAll) {
        // Move to next name
        const nextIdx = ((index ?? 0) + 1) % ALLAH_NAMES.length;
        playNameAudio(ALLAH_NAMES[nextIdx], nextIdx);
        
        // Scroll item into view
        const el = document.getElementById(`name-card-${ALLAH_NAMES[nextIdx].id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setCurrentPlayingIndex(null);
      }
    };

    audio.onerror = () => {
      if (isPlayingAll) {
        const nextIdx = ((index ?? 0) + 1) % ALLAH_NAMES.length;
        playNameAudio(ALLAH_NAMES[nextIdx], nextIdx);
      } else {
        setCurrentPlayingIndex(null);
      }
    };

    audio.play().catch(err => {
      console.warn('Audio playback error', err);
      setCurrentPlayingIndex(null);
      setIsPlayingAll(false);
    });
  };

  // Toggle Continuous Playlist Mode
  const togglePlayAll = () => {
    if (isPlayingAll) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAll(false);
      setCurrentPlayingIndex(null);
    } else {
      setIsPlayingAll(true);
      const startIdx = currentPlayingIndex ?? 0;
      playNameAudio(ALLAH_NAMES[startIdx], startIdx);
    }
  };

  // Toggle Memorization Check
  const toggleMemorized = (id: number) => {
    setMemorizedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('619_memorized_names', JSON.stringify(next));
      return next;
    });
  };

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const progressPercent = Math.round((memorizedIds.length / 99) * 100);

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto">
      {/* ── Top Navigation Header ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1 bg-surface p-1 rounded-full border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-subtext hover:text-text'
            }`}
          >
            Browse (99)
          </button>
          <button
            onClick={() => {
              setViewMode('flashcard');
              setIsFlipped(false);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
              viewMode === 'flashcard'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-subtext hover:text-text'
            }`}
          >
            Memorize 🧠
          </button>
        </div>
      </div>

      {/* ── Hero Master Header Card ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
              <Sparkles size={13} className="text-amber-400" />
              <span>Asmā' Allāh al-Ḥusnā</span>
            </div>
            <h1 className="text-2xl font-black font-arabic text-amber-300 mt-1">
              أَسْمَاءُ اللَّهِ الْحُسْنَىٰ
            </h1>
            <p className="text-xs text-white/80 mt-1 font-medium max-w-[280px]">
              "To Allah belong the most beautiful names, so call on Him by them." (7:180)
            </p>
          </div>

          {/* Memorization Progress Ring */}
          <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-2.5 text-center shrink-0 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase text-amber-400 block">Memorized</span>
            <div className="text-lg font-black text-white">{memorizedIds.length}<span className="text-xs font-normal text-white/70">/99</span></div>
            <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden mt-1 mx-auto">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Master Play All Audio Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayAll}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              {isPlayingAll ? (
                <>
                  <Pause size={14} className="fill-black" />
                  <span>Pause Recitation</span>
                </>
              ) : (
                <>
                  <Play size={14} className="fill-black" />
                  <span>Play All 99 Names</span>
                </>
              )}
            </button>
          </div>

          {currentPlayingIndex !== null && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold animate-pulse">
              <Volume2 size={14} />
              <span>#{ALLAH_NAMES[currentPlayingIndex].id} {ALLAH_NAMES[currentPlayingIndex].transliteration}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── MODE 1: FLASHCARD MEMORIZATION MODE ── */}
      {viewMode === 'flashcard' ? (
        <div className="space-y-4">
          {/* Card View */}
          {ALLAH_NAMES[currentCardIdx] && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border-2 border-amber-500/30 rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:border-amber-500/60 transition-all relative group"
            >
              <span className="absolute top-4 left-4 text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                #{ALLAH_NAMES[currentCardIdx].id} of 99
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playNameAudio(ALLAH_NAMES[currentCardIdx]);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-surface border border-border text-amber-500 hover:scale-110 active:scale-95 transition-transform"
                title="Pronounce Name"
              >
                <Volume2 size={18} />
              </button>

              {!isFlipped ? (
                <div className="space-y-3">
                  <h2 className="text-4xl sm:text-5xl font-black font-arabic text-amber-400 leading-relaxed py-2">
                    {ALLAH_NAMES[currentCardIdx].arabic}
                  </h2>
                  <h3 className="text-xl font-black text-text">
                    {ALLAH_NAMES[currentCardIdx].transliteration}
                  </h3>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">
                    👉 Tap card to reveal meaning & Urdu
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in zoom-in-95">
                  <h3 className="text-2xl font-black text-amber-500">
                    "{ALLAH_NAMES[currentCardIdx].meaningEn}"
                  </h3>
                  <p className="text-xl font-urdu font-bold text-emerald-400">
                    {ALLAH_NAMES[currentCardIdx].meaningUr}
                  </p>
                  <p className="text-xs text-subtext max-w-sm pt-2 leading-relaxed">
                    {ALLAH_NAMES[currentCardIdx].explanation}
                  </p>
                  <p className="text-[11px] text-muted font-bold">
                    Tap to flip back
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Flashcard Controls & Mark Memorized */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setCurrentCardIdx(prev => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIdx === 0}
              className="flex-1 py-3 rounded-2xl bg-card border border-border text-text font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface active:scale-95 transition-all"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={() => toggleMemorized(ALLAH_NAMES[currentCardIdx].id)}
              className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all ${
                memorizedIds.includes(ALLAH_NAMES[currentCardIdx].id)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-500'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>{memorizedIds.includes(ALLAH_NAMES[currentCardIdx].id) ? 'Memorized ✓' : 'Mark Learned'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentCardIdx(prev => Math.min(ALLAH_NAMES.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIdx === ALLAH_NAMES.length - 1}
              className="flex-1 py-3 rounded-2xl bg-card border border-border text-text font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface active:scale-95 transition-all"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* ── MODE 2: BROWSE ALL 99 NAMES GRID ── */
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by Arabic, English, or Urdu meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-amber-500/60 shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All 99' },
              { id: 'mercy', label: '🤲 Mercy' },
              { id: 'majesty', label: '👑 Majesty' },
              { id: 'forgiveness', label: '🤍 Forgiveness' },
              { id: 'creator', label: '🌱 Creator' },
              { id: 'protection', label: '🛡️ Protection' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-card border border-border text-subtext hover:text-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 99 Names Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredNames.map((name, index) => {
              const isCurrentlyPlaying = currentPlayingIndex !== null && ALLAH_NAMES[currentPlayingIndex]?.id === name.id;
              const isMemorized = memorizedIds.includes(name.id);

              return (
                <div
                  key={name.id}
                  id={`name-card-${name.id}`}
                  onClick={() => setActiveModalName(name)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer group ${
                    isCurrentlyPlaying
                      ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border-border/80 dark:border-amber-500/20 hover:border-amber-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Number & Transliteration */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-black flex items-center justify-center shrink-0">
                          {name.id}
                        </span>
                        <h3 className="text-xs font-black text-text truncate group-hover:text-amber-500 transition-colors">
                          {name.transliteration}
                        </h3>
                        {isMemorized && (
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-subtext font-medium mt-1 truncate">
                        {name.meaningEn}
                      </p>
                      <p className="text-[11px] font-urdu font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {name.meaningUr}
                      </p>
                    </div>

                    {/* Right: Arabic Calligraphy & Audio Button */}
                    <div className="flex flex-col items-end shrink-0 pl-1">
                      <span className="text-lg font-black font-arabic text-amber-400 leading-tight">
                        {name.arabic}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playNameAudio(name, index);
                        }}
                        className={`p-1.5 rounded-xl border text-xs mt-1.5 transition-all ${
                          isCurrentlyPlaying
                            ? 'bg-amber-500 text-black border-amber-500 animate-bounce'
                            : 'bg-surface hover:bg-card border-border text-subtext hover:text-amber-500'
                        }`}
                        title="Listen Audio"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL (Deep Explanation & Memorization) ── */}
      {activeModalName && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-card dark:bg-[#062426] border border-border dark:border-amber-500/40 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Divine Name #{activeModalName.id}
              </span>
              <button onClick={() => setActiveModalName(null)} className="p-1 rounded-full bg-surface text-subtext hover:text-text">
                <X size={16} />
              </button>
            </div>

            <div className="py-2">
              <h2 className="text-4xl font-black font-arabic text-amber-400 leading-relaxed">
                {activeModalName.arabic}
              </h2>
              <h3 className="text-xl font-black text-text mt-1">
                {activeModalName.transliteration}
              </h3>
              <p className="text-sm font-bold text-amber-500 mt-0.5">
                "{activeModalName.meaningEn}"
              </p>
              <p className="text-base font-urdu font-bold text-emerald-400 mt-1">
                {activeModalName.meaningUr}
              </p>
            </div>

            <div className="bg-surface/70 dark:bg-black/30 border border-border/80 dark:border-white/10 rounded-2xl p-3.5 text-xs text-subtext text-left leading-relaxed">
              <strong className="text-text block mb-1">Spiritual Meaning & Benefit:</strong>
              {activeModalName.explanation}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => playNameAudio(activeModalName)}
                className="py-2.5 rounded-2xl bg-amber-500 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Volume2 size={16} />
                <span>Listen Audio</span>
              </button>

              <button
                onClick={() => toggleMemorized(activeModalName.id)}
                className={`py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border active:scale-95 transition-all ${
                  memorizedIds.includes(activeModalName.id)
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-card border-border text-text hover:bg-surface'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{memorizedIds.includes(activeModalName.id) ? 'Memorized ✓' : 'Mark Learned'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
