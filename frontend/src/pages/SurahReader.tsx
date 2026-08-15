import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuran, SurahDetail, QARI_OPTIONS, TAFSIR_OPTIONS, ChapterInfo, TafsirData } from '../hooks/useQuran';
import { 
  ArrowLeft, Play, Pause, CheckCircle2, SkipBack, SkipForward,
  Volume2, ChevronUp, Info, BookText, X, Sparkles, Mic, Check
} from 'lucide-react';

const SurahReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSurahDetail, getChapterInfo, getTafsir, selectedQari, setSelectedQari, markSurahRead } = useQuran();
  
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readMode, setReadMode] = useState<'translation' | 'wordByWord' | 'reading'>('translation');
  const [showQariMenu, setShowQariMenu] = useState(false);

  // Surah Info Modal State
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Tafsir Modal State
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<string | null>(null);
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(169); // Default Ibn Kathir
  const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);

  // Selected Ayah for Mushaf Mode Quick Actions
  const [mushafSelectedAyah, setMushafSelectedAyah] = useState<number | null>(null);

  // Word-by-Word Audio State
  const [playingWordId, setPlayingWordId] = useState<number | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);

  // Global Ayah Audio State
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) {
      loadSurah(parseInt(id), readMode === 'wordByWord');
    }
  }, [id, selectedQari, readMode]);

  useEffect(() => {
    if (surah) {
      localStorage.setItem('lastReadQuran', JSON.stringify({
        surahNumber: surah.number,
        surahName: surah.englishName,
        surahNameArabic: surah.name,
        ayahNumber: playingAyah || 1,
        date: new Date().toISOString()
      }));
    }
  }, [surah, playingAyah]);

  const loadSurah = async (surahNumber: number, includeWords: boolean) => {
    setLoading(true);
    const detail = await getSurahDetail(surahNumber, includeWords);
    setSurah(detail);
    setLoading(false);
  };

  const handleOpenInfo = async () => {
    if (!surah) return;
    setShowInfoModal(true);
    if (!chapterInfo || chapterInfo.chapterId !== surah.number) {
      setLoadingInfo(true);
      const info = await getChapterInfo(surah.number);
      setChapterInfo(info);
      setLoadingInfo(false);
    }
  };

  const handleOpenTafsir = async (verseKey: string, tafsirId: number = selectedTafsirId) => {
    setSelectedTafsirAyah(verseKey);
    setSelectedTafsirId(tafsirId);
    setLoadingTafsir(true);
    const data = await getTafsir(verseKey, tafsirId);
    setTafsirData(data);
    setLoadingTafsir(false);
  };

  const handlePlayWordAudio = (wordId: number, audioUrl?: string) => {
    if (!audioUrl) return;
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
    }
    const audio = new Audio(audioUrl);
    wordAudioRef.current = audio;
    setPlayingWordId(wordId);
    audio.onended = () => setPlayingWordId(null);
    audio.onerror = () => setPlayingWordId(null);
    audio.play().catch(() => setPlayingWordId(null));
  };

  // Universal Bulletproof Audio URL Resolver
  const getAyahAudioUrl = (surahNum: number, ayahNum: number, qariId: string, directUrl?: string) => {
    if (directUrl && directUrl.trim().length > 0) {
      if (directUrl.startsWith('http://') || directUrl.startsWith('https://')) return directUrl;
      return `https://verses.quran.com/${directUrl}`;
    }
    const s3 = String(surahNum).padStart(3, '0');
    const a3 = String(ayahNum).padStart(3, '0');
    const qariMap: Record<string, string> = {
      '7': 'Alafasy_128kbps',
      '2': 'Abdul_Basit_Murattal_192kbps',
      '3': 'Abdurrahmaan_As-Sudais_192kbps',
      '6': 'Husary_128kbps',
      '9': 'Minshawy_Murattal_128kbps',
      '4': 'Abu_Bakr_Ash-Shaatree_128kbps',
      '12': 'MaherAlMuaiqly128kbps',
    };
    const folder = qariMap[qariId] || 'Alafasy_128kbps';
    return `https://everyayah.com/data/${folder}/${s3}${a3}.mp3`;
  };

  const togglePlay = (ayahNumber: number, explicitUrl?: string) => {
    if (!surah) return;

    // Toggle pause if currently playing
    if (playingAyah === ayahNumber && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingAyah(null);
      return;
    }

    const targetUrl = getAyahAudioUrl(surah.number, ayahNumber, selectedQari, explicitUrl);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const newAudio = new Audio(targetUrl);
    audioRef.current = newAudio;
    setPlayingAyah(ayahNumber);
    setMushafSelectedAyah(ayahNumber);

    newAudio.onended = () => {
      const nextAyah = surah.ayahs.find(a => a.numberInSurah === ayahNumber + 1);
      if (nextAyah) {
        togglePlay(nextAyah.numberInSurah, nextAyah.audio);
      } else {
        setPlayingAyah(null);
      }
    };

    newAudio.onerror = () => {
      // Fallback to EveryAyah if primary fails
      const fallbackUrl = `https://everyayah.com/data/Alafasy_128kbps/${String(surah.number).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
      if (targetUrl !== fallbackUrl) {
        const fallbackAudio = new Audio(fallbackUrl);
        audioRef.current = fallbackAudio;
        fallbackAudio.onended = newAudio.onended;
        fallbackAudio.play().catch(() => setPlayingAyah(null));
      } else {
        setPlayingAyah(null);
      }
    };

    newAudio.play().catch((err) => {
      console.warn('Audio play was interrupted', err);
      setPlayingAyah(null);
    });

    // Scroll into view on mobile
    const el = document.getElementById(`ayah-${ayahNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const playNext = () => {
    if (!surah || surah.ayahs.length === 0) return;
    const current = playingAyah || 1;
    const nextAyah = surah.ayahs.find(a => a.numberInSurah === current + 1) || surah.ayahs[0];
    togglePlay(nextAyah.numberInSurah, nextAyah.audio);
  };

  const playPrev = () => {
    if (!surah || surah.ayahs.length === 0) return;
    const current = playingAyah || 1;
    const prevAyah = surah.ayahs.find(a => a.numberInSurah === current - 1) || surah.ayahs[surah.ayahs.length - 1];
    togglePlay(prevAyah.numberInSurah, prevAyah.audio);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (wordAudioRef.current) wordAudioRef.current.pause();
    };
  }, []);

  const handleComplete = async () => {
    if (surah) {
      await markSurahRead(surah.number);
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="p-6 text-center text-text">
        <p>Surah not found.</p>
        <button onClick={() => navigate('/quran')} className="mt-4 text-primary underline">
          Back to Quran
        </button>
      </div>
    );
  }

  const currentQariName = QARI_OPTIONS.find(q => q.id === selectedQari)?.name || 'Mishary Rashid Alafasy';

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/quran')}
              className="p-2 hover:bg-surface rounded-full text-subtext transition-colors active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-text">{surah.englishName}</h1>
                <button
                  onClick={handleOpenInfo}
                  className="p-1 rounded-full text-primary hover:bg-primary/10 transition-colors"
                  title="Historical Context & Background"
                >
                  <Info size={16} />
                </button>
              </div>
              <p className="text-[11px] text-subtext">{surah.englishNameTranslation} • {surah.numberOfAyahs} Verses</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-surface p-1 rounded-xl border border-border text-xs font-bold">
            <button
              onClick={() => setReadMode('translation')}
              className={`px-2.5 py-1 rounded-lg transition-all ${readMode === 'translation' ? 'bg-primary text-white shadow-sm' : 'text-subtext hover:text-text'}`}
            >
              Verses
            </button>
            <button
              onClick={() => setReadMode('wordByWord')}
              className={`px-2.5 py-1 rounded-lg transition-all ${readMode === 'wordByWord' ? 'bg-primary text-white shadow-sm' : 'text-subtext hover:text-text'}`}
            >
              Words
            </button>
            <button
              onClick={() => setReadMode('reading')}
              className={`px-2.5 py-1 rounded-lg transition-all ${readMode === 'reading' ? 'bg-primary text-white shadow-sm' : 'text-subtext hover:text-text'}`}
            >
              Mushaf
            </button>
          </div>
        </div>
      </header>

      {/* Bismillah */}
      {surah.number !== 9 && surah.number !== 1 && (
        <div className="text-center py-6 border-b border-border/60 bg-surface/30">
          <h2 className="text-3xl font-arabic text-amber-400 drop-shadow-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
        </div>
      )}

      {/* ── MAIN CONTENT MODES ── */}
      <div className={`p-4 ${readMode === 'reading' ? 'px-4 py-6 max-w-2xl mx-auto' : 'space-y-4 max-w-2xl mx-auto'}`}>
        
        {/* 1. MUSHAF CONTINUOUS READING MODE */}
        {readMode === 'reading' ? (
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
            <div className="text-justify leading-[3.6] text-2xl sm:text-3xl font-arabic" dir="rtl">
              {surah.ayahs.map((ayah) => {
                const isPlaying = playingAyah === ayah.numberInSurah;
                const isSelected = mushafSelectedAyah === ayah.numberInSurah;

                return (
                  <span 
                    key={ayah.number} 
                    id={`ayah-${ayah.numberInSurah}`}
                    onClick={() => {
                      setMushafSelectedAyah(ayah.numberInSurah);
                      togglePlay(ayah.numberInSurah, ayah.audio);
                    }}
                    className={`inline-block mx-0.5 px-1.5 py-0.5 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                      isPlaying 
                        ? 'bg-amber-500/25 text-amber-300 ring-2 ring-amber-500 shadow-md font-bold' 
                        : isSelected
                        ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                        : 'text-text hover:bg-surface hover:text-primary active:scale-95'
                    }`}
                  >
                    <span>{ayah.text}</span>
                    <span className="inline-flex items-center justify-center w-7 h-7 mx-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-sans font-bold align-middle">
                      {ayah.numberInSurah}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* Mushaf Interactive Action Sheet when an Ayah is selected */}
            {mushafSelectedAyah !== null && (
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between bg-surface p-3.5 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {mushafSelectedAyah}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-text">Ayah {mushafSelectedAyah}</h5>
                    <p className="text-[10px] text-subtext truncate max-w-[160px]">
                      {surah.ayahs.find(a => a.numberInSurah === mushafSelectedAyah)?.translation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const a = surah.ayahs.find(item => item.numberInSurah === mushafSelectedAyah);
                      if (a) handleOpenTafsir(a.verseKey);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-card border border-border text-xs font-bold text-text hover:text-primary transition-colors"
                  >
                    <BookText size={13} className="text-amber-500" />
                    <span>Tafsir</span>
                  </button>

                  <button
                    onClick={() => {
                      const a = surah.ayahs.find(item => item.numberInSurah === mushafSelectedAyah);
                      if (a) togglePlay(a.numberInSurah, a.audio);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 ${
                      playingAyah === mushafSelectedAyah ? 'bg-amber-600' : 'bg-primary'
                    }`}
                  >
                    {playingAyah === mushafSelectedAyah ? <Pause size={14} /> : <Play size={14} />}
                    <span>{playingAyah === mushafSelectedAyah ? 'Pause' : 'Play'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : readMode === 'wordByWord' ? (
          /* 2. WORD BY WORD LEARNING MODE */
          surah.ayahs.map((ayah) => {
            const isPlaying = playingAyah === ayah.numberInSurah;
            return (
              <div
                key={ayah.number}
                id={`ayah-${ayah.numberInSurah}`}
                className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
                  isPlaying ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/30' : 'bg-card border-border'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                      {ayah.numberInSurah}
                    </span>
                    <button
                      onClick={() => handleOpenTafsir(ayah.verseKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-border text-xs font-semibold text-subtext hover:text-text transition-colors"
                    >
                      <BookText size={13} className="text-amber-500" />
                      <span>Tafsir</span>
                    </button>
                  </div>

                  <button
                    onClick={() => togglePlay(ayah.numberInSurah, ayah.audio)}
                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                      isPlaying ? 'bg-primary text-white shadow-md' : 'bg-surface hover:bg-border text-text'
                    }`}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>

                {/* Word by Word Flow Chips */}
                <div className="flex flex-wrap gap-2.5 justify-end mb-4" dir="rtl">
                  {ayah.words && ayah.words.length > 0 ? (
                    ayah.words.map((w) => {
                      const isWordPlaying = playingWordId === w.id;
                      return (
                        <div
                          key={w.id}
                          onClick={() => handlePlayWordAudio(w.id, w.audioUrl)}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 ${
                            isWordPlaying
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 scale-105 shadow-md'
                              : 'bg-surface/60 hover:bg-surface border-border/70 hover:border-amber-500/40'
                          }`}
                        >
                          <span className="font-arabic text-2xl text-text leading-relaxed font-medium">
                            {w.textUthmani}
                          </span>
                          <span className="text-[11px] text-subtext font-sans mt-0.5" dir="ltr">
                            {w.translation}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div 
                      className="text-right text-3xl font-arabic leading-[2.2] text-text" 
                      dangerouslySetInnerHTML={{ __html: ayah.text }}
                    />
                  )}
                </div>

                {/* Verse Translation */}
                <div className="border-t border-border/40 pt-3">
                  <p className="text-sm text-text/90 italic leading-relaxed">
                    "{ayah.translation}"
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          /* 3. VERSES WITH TRANSLATION MODE */
          surah.ayahs.map((ayah) => {
            const isPlaying = playingAyah === ayah.numberInSurah;

            return (
              <div 
                key={ayah.number} 
                id={`ayah-${ayah.numberInSurah}`}
                className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
                  isPlaying ? 'bg-primary/5 border-primary/50 ring-1 ring-primary/30 scale-[1.005]' : 'bg-card border-border hover:border-primary/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex flex-col items-center gap-2 shrink-0 mt-1">
                    <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                      {ayah.numberInSurah}
                    </div>

                    <button 
                      onClick={() => togglePlay(ayah.numberInSurah, ayah.audio)}
                      className={`flex items-center justify-center w-9 h-9 rounded-2xl transition-all active:scale-90 ${
                        isPlaying ? 'bg-primary text-white shadow-md' : 'bg-surface text-text hover:bg-border'
                      }`}
                      title="Play Ayah Recitation"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>

                    <button 
                      onClick={() => handleOpenTafsir(ayah.verseKey)}
                      className="flex items-center justify-center w-9 h-9 rounded-2xl bg-surface hover:bg-amber-500/10 text-subtext hover:text-amber-500 transition-colors active:scale-90"
                      title="Read Tafsir"
                    >
                      <BookText size={16} />
                    </button>
                  </div>
                  
                  <div 
                    className="text-right text-3xl sm:text-4xl font-arabic leading-[2.2] flex-1 text-text" 
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: ayah.text }}
                  />
                </div>
                
                <div className="pl-11 border-t border-border/50 pt-3">
                  <p className="text-text text-sm sm:text-base leading-relaxed font-normal">
                    {ayah.translation}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completion Action */}
      <div className="px-4 py-8 mb-16 flex justify-center">
        <button 
          onClick={handleComplete}
          disabled={isCompleted}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base transition-all ${
            isCompleted 
              ? 'bg-success/20 text-success cursor-default' 
              : 'bg-primary text-white hover:bg-primary-dark shadow-xl shadow-primary/20 active:scale-95'
          }`}
        >
          <CheckCircle2 size={20} />
          {isCompleted ? 'Completed Today' : 'Mark as Read'}
        </button>
      </div>

      {/* ── 🎵 STREAMLINED FLOATING BOTTOM AUDIO PLAYER ── */}
      <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto bg-card/95 backdrop-blur-2xl border border-border/90 rounded-3xl shadow-2xl p-3 animate-in slide-in-from-bottom-4">
        
        {/* Reciter Voice Picker Sheet */}
        {showQariMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-3 bg-card border border-border rounded-3xl shadow-2xl p-5 max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                <Mic size={16} className="text-primary" />
                <span>Choose Reciter Voice</span>
              </h3>
              <button onClick={() => setShowQariMenu(false)} className="p-1.5 bg-surface rounded-full text-subtext hover:text-text">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5">
              {QARI_OPTIONS.map(qari => (
                <button 
                  key={qari.id}
                  onClick={() => {
                    setSelectedQari(qari.id);
                    setShowQariMenu(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all ${
                    selectedQari === qari.id 
                      ? 'bg-primary/10 border border-primary text-primary font-bold shadow-sm' 
                      : 'bg-surface hover:bg-border text-text'
                  }`}
                >
                  <span className="text-xs font-semibold">{qari.name}</span>
                  {selectedQari === qari.id && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Reciter Selector Pill */}
          <button 
            onClick={() => setShowQariMenu(!showQariMenu)}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-surface hover:bg-border/60 rounded-2xl text-[11px] font-bold text-text border border-border/60 transition-colors max-w-[135px] truncate"
          >
            <Volume2 size={14} className="text-primary shrink-0" />
            <span className="truncate">{currentQariName}</span>
            <ChevronUp size={12} className={`text-muted shrink-0 transition-transform ${showQariMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Controls & Active Ayah */}
          <div className="flex items-center gap-3">
            <button 
              onClick={playPrev}
              className="p-2 rounded-xl bg-surface hover:bg-border text-subtext hover:text-text active:scale-90 transition-all"
              title="Previous Ayah"
            >
              <SkipBack size={18} />
            </button>

            <button 
              onClick={() => {
                if (playingAyah !== null) {
                  togglePlay(playingAyah);
                } else if (surah.ayahs.length > 0) {
                  togglePlay(surah.ayahs[0].numberInSurah, surah.ayahs[0].audio);
                }
              }}
              className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-90 transition-all"
            >
              {playingAyah !== null ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            <button 
              onClick={playNext}
              className="p-2 rounded-xl bg-surface hover:bg-border text-subtext hover:text-text active:scale-90 transition-all"
              title="Next Ayah"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Ayah Indicator */}
          <div className="text-right pr-1">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Ayah</span>
            <span className="text-xs font-black text-text">
              {playingAyah || 1} / {surah.numberOfAyahs}
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 Surah Historical Background & Insights Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface hover:bg-border text-subtext"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-amber-500" size={20} />
              <h3 className="text-lg font-black text-text">Surah {surah.englishName} Insights</h3>
            </div>

            {loadingInfo ? (
              <div className="flex justify-center py-10">
                <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chapterInfo ? (
              <div className="space-y-4 text-sm text-text font-normal leading-relaxed">
                {chapterInfo.shortText && (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-text font-medium leading-relaxed">
                    {chapterInfo.shortText}
                  </div>
                )}

                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-text text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: chapterInfo.text }}
                />

                <p className="text-[11px] text-muted pt-2 border-t border-border">
                  Source: {chapterInfo.source}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">No historical insights available for this chapter.</p>
            )}
          </div>
        </div>
      )}

      {/* 📖 Tafsir Bottom Sheet Modal */}
      {selectedTafsirAyah && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <div>
                <h3 className="text-base font-black text-text">Tafsir — Ayah {selectedTafsirAyah}</h3>
                <p className="text-xs text-subtext mt-0.5">Exegesis & Explanation</p>
              </div>
              <button
                onClick={() => setSelectedTafsirAyah(null)}
                className="p-2 rounded-full bg-surface hover:bg-border text-subtext"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tafsir Source Selector */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
              {TAFSIR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOpenTafsir(selectedTafsirAyah, opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedTafsirId === opt.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-surface text-subtext hover:text-text'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>

            {loadingTafsir ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tafsirData ? (
              <div className="space-y-4">
                <div 
                  className={`prose prose-sm dark:prose-invert max-w-none text-text text-sm leading-loose ${
                    tafsirData.id === 16 || tafsirData.id === 171 ? 'font-arabic text-xl leading-[2.4] text-right' : tafsirData.id === 160 ? 'font-urdu text-base leading-relaxed text-right' : ''
                  }`}
                  dir={tafsirData.id === 16 || tafsirData.id === 171 || tafsirData.id === 160 ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={{ __html: tafsirData.text }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted py-6 text-center">Tafsir not found for this Ayah.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahReader;
