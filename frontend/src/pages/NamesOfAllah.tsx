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
  X,
  Gauge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'grid' | 'flashcard';
type CategoryFilter = 'all' | 'mercy' | 'majesty' | 'forgiveness' | 'creator' | 'protection';

// Exact continuous audio timing parameters
const INTRO_OFFSET = 17.0;
const DURATION_PER_NAME = 1.894; // (205s - 17s) / 99 names

export const NamesOfAllah: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Pagination State (10 Names per Page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Audio State
  const [isPlayingContinuous, setIsPlayingContinuous] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(215.5);
  
  const continuousAudioRef = useRef<HTMLAudioElement | null>(null);
  const individualAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Reset pagination on search / category filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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

  // Pagination Calculations
  const totalPages = Math.ceil(filteredNames.length / ITEMS_PER_PAGE) || 1;
  const paginatedNames = filteredNames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Initialize Continuous Audio
  useEffect(() => {
    const audio = new Audio('/audio/asma_ul_husna.mp3');
    continuousAudioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration) {
        setAudioTotalDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setAudioCurrentTime(time);

      if (time >= INTRO_OFFSET && time <= 206.0) {
        const nameIdx = Math.min(98, Math.max(0, Math.floor((time - INTRO_OFFSET) / DURATION_PER_NAME)));
        setCurrentPlayingIndex(nameIdx);

        // Auto switch pagination page to keep the playing card visible
        const targetPage = Math.floor(nameIdx / ITEMS_PER_PAGE) + 1;
        setCurrentPage(targetPage);

        // Smooth scroll active element into view
        const activeCard = document.getElementById(`name-card-${ALLAH_NAMES[nameIdx].id}`);
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else if (time < INTRO_OFFSET) {
        setCurrentPlayingIndex(null);
      }
    };

    const handleEnded = () => {
      setIsPlayingContinuous(false);
      setCurrentPlayingIndex(null);
      setAudioCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      continuousAudioRef.current = null;
    };
  }, []);

  // Play / Pause Master Continuous Recitation
  const toggleContinuousPlay = () => {
    if (!continuousAudioRef.current) return;

    if (isPlayingContinuous) {
      continuousAudioRef.current.pause();
      setIsPlayingContinuous(false);
    } else {
      if (individualAudioRef.current) {
        individualAudioRef.current.pause();
      }
      continuousAudioRef.current.playbackRate = playbackSpeed;
      continuousAudioRef.current.play()
        .then(() => setIsPlayingContinuous(true))
        .catch(err => {
          console.warn('Audio playback error', err);
          setIsPlayingContinuous(false);
        });
    }
  };

  // Jump Continuous Player to a Specific Name
  const jumpToNameInContinuous = (index: number) => {
    if (!continuousAudioRef.current) return;

    const targetTime = Math.max(0, INTRO_OFFSET + (index * DURATION_PER_NAME));
    continuousAudioRef.current.currentTime = targetTime;
    continuousAudioRef.current.playbackRate = playbackSpeed;
    
    if (!isPlayingContinuous) {
      continuousAudioRef.current.play()
        .then(() => setIsPlayingContinuous(true))
        .catch(err => console.warn(err));
    }
    setCurrentPlayingIndex(index);
  };

  // Change Playback Speed
  const cyclePlaybackSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (continuousAudioRef.current) {
      continuousAudioRef.current.playbackRate = nextSpeed;
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

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.round((memorizedIds.length / 99) * 100);
  const activePlayingName = currentPlayingIndex !== null ? ALLAH_NAMES[currentPlayingIndex] : null;

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
            <p className="text-xs text-white/80 mt-1 font-medium max-w-[260px]">
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

        {/* 🌟 Currently Reciting Name Highlight Banner */}
        {activePlayingName && (
          <div className="mt-4 p-3 bg-black/40 border border-amber-500/40 rounded-2xl flex items-center justify-between backdrop-blur-md animate-in fade-in-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                  {activePlayingName.id}
                </span>
                <h2 className="text-sm font-black text-amber-300">
                  {activePlayingName.transliteration}
                </h2>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5 font-medium">
                {activePlayingName.meaningEn} • <span className="font-urdu text-amber-300 font-semibold">{activePlayingName.meaningUr}</span>
              </p>
            </div>

            <span className="text-2xl font-black font-arabic text-amber-400 pl-2">
              {activePlayingName.arabic}
            </span>
          </div>
        )}

        {/* 🎙️ Master Melodic Continuous Player Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleContinuousPlay}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                {isPlayingContinuous ? (
                  <>
                    <Pause size={14} className="fill-black" />
                    <span>Pause Flow</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-black" />
                    <span>Play Melodic Flow (99 Names)</span>
                  </>
                )}
              </button>

              <button
                onClick={cyclePlaybackSpeed}
                className="px-2.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-amber-500/30 text-amber-300 text-xs font-black active:scale-95 transition-all flex items-center gap-1"
                title="Change Speed"
              >
                <Gauge size={13} />
                <span>{playbackSpeed}x</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-amber-300 font-bold">
              {formatSeconds(audioCurrentTime)} / {formatSeconds(audioTotalDuration)}
            </div>
          </div>

          {/* Audio Progress Scrubber */}
          <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${(audioCurrentTime / (audioTotalDuration || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {viewMode === 'flashcard' ? (
        /* ── MODE 1: MEMORIZATION FLASHCARD MODE ── */
        <div className="space-y-4">
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-6 text-center shadow-lg relative min-h-[300px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-subtext font-bold">
              <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                Card {currentCardIdx + 1} of 99
              </span>
              <button
                onClick={() => toggleMemorized(ALLAH_NAMES[currentCardIdx].id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  memorizedIds.includes(ALLAH_NAMES[currentCardIdx].id)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-surface border border-border text-subtext hover:text-text'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>{memorizedIds.includes(ALLAH_NAMES[currentCardIdx].id) ? 'Memorized' : 'Mark Learned'}</span>
              </button>
            </div>

            {/* Flashcard Body */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)} 
              className="my-6 cursor-pointer select-none space-y-4 transition-all transform active:scale-95"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-500 font-black text-sm flex items-center justify-center mx-auto border border-amber-500/30">
                #{ALLAH_NAMES[currentCardIdx].id}
              </div>

              {!isFlipped ? (
                <div className="space-y-2">
                  <h2 className="text-4xl sm:text-5xl font-black font-arabic text-amber-400 py-2">
                    {ALLAH_NAMES[currentCardIdx].arabic}
                  </h2>
                  <p className="text-sm font-bold text-subtext">
                    (Tap to reveal meaning & transliteration)
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in-50">
                  <h2 className="text-2xl font-black text-text">
                    {ALLAH_NAMES[currentCardIdx].transliteration}
                  </h2>
                  <p className="text-base font-bold text-amber-500">
                    "{ALLAH_NAMES[currentCardIdx].meaningEn}"
                  </p>
                  <p className="text-lg font-urdu text-emerald-600 dark:text-emerald-400 font-bold">
                    {ALLAH_NAMES[currentCardIdx].meaningUr}
                  </p>
                  <p className="text-xs text-subtext max-w-xs mx-auto leading-relaxed pt-2">
                    {ALLAH_NAMES[currentCardIdx].explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Audio Button */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => jumpToNameInContinuous(currentCardIdx)}
                className="px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Volume2 size={15} />
                <span>Hear Pronunciation</span>
              </button>
            </div>
          </div>

          {/* Flashcard Navigation */}
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

          {/* 99 Names Grid List (10 per Page) with Real-Time Synchronized Highlighting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {paginatedNames.map((name) => {
              const trueIndex = ALLAH_NAMES.findIndex(n => n.id === name.id);
              const isCurrentlyPlaying = currentPlayingIndex === trueIndex;
              const isMemorized = memorizedIds.includes(name.id);

              return (
                <div
                  key={name.id}
                  id={`name-card-${name.id}`}
                  onClick={() => setActiveModalName(name)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer group ${
                    isCurrentlyPlaying
                      ? 'bg-amber-500/20 border-amber-500 shadow-lg ring-2 ring-amber-500 scale-[1.02]'
                      : 'bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border-border/80 dark:border-amber-500/20 hover:border-amber-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Left: Number & Transliteration */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                          isCurrentlyPlaying 
                            ? 'bg-amber-500 text-black' 
                            : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          {name.id}
                        </span>
                        <h3 className={`text-xs font-black truncate transition-colors ${
                          isCurrentlyPlaying 
                            ? 'text-amber-400' 
                            : 'text-text group-hover:text-amber-500'
                        }`}>
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
                          jumpToNameInContinuous(trueIndex);
                        }}
                        className={`p-1.5 rounded-xl border text-xs mt-1.5 transition-all ${
                          isCurrentlyPlaying
                            ? 'bg-amber-500 text-black border-amber-500 animate-pulse'
                            : 'bg-surface hover:bg-card border-border text-subtext hover:text-amber-500'
                        }`}
                        title="Jump & Listen from this Name"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 📄 PREMIUM MOBILE-FIRST PAGINATION ── */}
          {totalPages > 1 && (
            <div className="mt-4 bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
              {/* Status Row: Single Line Info */}
              <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2.5">
                <span className="text-subtext font-medium text-[11px]">
                  Showing <strong className="text-text font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredNames.length)}</strong> of <strong className="text-text font-bold">{filteredNames.length}</strong> Divine Names
                </span>
                
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              {/* Navigation Action Buttons Row */}
              <div className="flex items-center justify-between gap-1.5">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-2xl bg-surface hover:bg-card border border-border text-text font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <ChevronLeft size={15} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Windowed Page Number Pills */}
                <div className="flex items-center justify-center gap-1 flex-1 overflow-x-auto py-0.5">
                  {(() => {
                    const pages: (number | string)[] = [];
                    if (totalPages <= 6) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      if (currentPage <= 3) {
                        pages.push(1, 2, 3, 4, '...', totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                      }
                    }

                    return pages.map((page, idx) => {
                      if (page === '...') {
                        return (
                          <span key={`dots-${idx}`} className="w-6 text-center text-xs font-bold text-muted select-none">
                            •••
                          </span>
                        );
                      }

                      const isCurrent = currentPage === page;
                      return (
                        <button
                          key={`page-${page}`}
                          onClick={() => {
                            setCurrentPage(Number(page));
                            window.scrollTo({ top: 150, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-105'
                              : 'bg-surface/80 hover:bg-card border border-border text-subtext hover:text-text'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-2xl bg-surface hover:bg-card border border-border text-text font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
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

            <div className="space-y-2">
              <h2 className="text-4xl font-black font-arabic text-amber-400">
                {activeModalName.arabic}
              </h2>
              <h3 className="text-lg font-black text-text">
                {activeModalName.transliteration}
              </h3>
              <p className="text-sm font-bold text-amber-500">
                "{activeModalName.meaningEn}"
              </p>
              <p className="text-base font-urdu text-emerald-600 dark:text-emerald-400 font-bold">
                {activeModalName.meaningUr}
              </p>
            </div>

            <div className="p-3.5 bg-surface/70 dark:bg-black/40 rounded-2xl border border-border text-left">
              <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-wider mb-1">
                Spiritual Explanation & Benefit
              </h4>
              <p className="text-xs text-subtext leading-relaxed">
                {activeModalName.explanation}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => {
                  const idx = ALLAH_NAMES.findIndex(n => n.id === activeModalName.id);
                  jumpToNameInContinuous(idx);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-surface hover:bg-card border border-border text-xs font-bold text-text flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Volume2 size={15} />
                <span>Listen Audio</span>
              </button>

              <button
                onClick={() => toggleMemorized(activeModalName.id)}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                  memorizedIds.includes(activeModalName.id)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-black'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>{memorizedIds.includes(activeModalName.id) ? 'Memorized' : 'Mark Learned'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
