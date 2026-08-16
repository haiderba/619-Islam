import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useQuran, 
  SurahDetail, 
  QARI_OPTIONS, 
  TAFSIR_OPTIONS, 
  AVAILABLE_TRANSLATIONS,
  ChapterInfo, 
  TafsirData 
} from '../hooks/useQuran';
import { 
  ArrowLeft, Play, Pause, CheckCircle2, SkipBack, SkipForward,
  Volume2, ChevronUp, Info, BookText, X, Sparkles, Mic, Check, Gauge, Languages, BookOpen
} from 'lucide-react';

const SPEED_OPTIONS = [
  { value: 0.75, label: '0.75x', desc: 'Slow' },
  { value: 1.0, label: '1.0x', desc: 'Normal' },
  { value: 1.25, label: '1.25x', desc: 'Quick' },
  { value: 1.5, label: '1.5x', desc: 'Fast' },
  { value: 2.0, label: '2.0x', desc: 'Max' },
];

const cleanArabic = (text: string): string => {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
};

const SurahReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSurahDetail, getChapterInfo, getTafsir, selectedQari, setSelectedQari, markSurahRead } = useQuran();
  
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readMode, setReadMode] = useState<'translation' | 'wordByWord' | 'reading'>('translation');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showQariMenu, setShowQariMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);

  // Translation Preferences
  const [primaryTrans, setPrimaryTrans] = useState(() => {
    return localStorage.getItem('quran_primary_translation') || '85';
  });
  const [secondaryTrans, setSecondaryTrans] = useState(() => {
    return localStorage.getItem('quran_secondary_translation') || 'none';
  });

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    return Number(localStorage.getItem('quran_playback_speed')) || 1.0;
  });
  const playbackSpeedRef = useRef<number>(playbackSpeed);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.defaultPlaybackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

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
      loadSurah(parseInt(id), readMode === 'wordByWord', primaryTrans, secondaryTrans);
    }
  }, [id, readMode, primaryTrans, secondaryTrans]);

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

  const loadSurah = async (
    surahNumber: number, 
    includeWords: boolean, 
    pTrans: string = primaryTrans, 
    sTrans: string = secondaryTrans
  ) => {
    setLoading(true);
    const detail = await getSurahDetail(surahNumber, includeWords, pTrans, sTrans);
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
  // Universal Bulletproof Audio URL Resolver for all 11 Qaris
  const getAyahAudioUrl = (surahNum: number, ayahNum: number, qariId: string) => {
    const s3 = String(surahNum).padStart(3, '0');
    const a3 = String(ayahNum).padStart(3, '0');
    const qariMap: Record<string, string> = {
      '7': 'Alafasy_128kbps',
      '2': 'Abdul_Basit_Murattal_192kbps',
      '1': 'Abdul_Basit_Mujawwad_128kbps',
      '6': 'Husary_128kbps',
      '9': 'Minshawy_Murattal_128kbps',
      '8': 'Minshawy_Mujawwad_192kbps',
      '3': 'Abdurrahmaan_As-Sudais_192kbps',
      '4': 'Abu_Bakr_Ash-Shaatree_128kbps',
      '12': 'MaherAlMuaiqly128kbps',
      '5': 'Ghamadi_40kbps',
      '11': 'Yasser_Ad-Dussary_128kbps',
    };
    const folder = qariMap[qariId] || 'Alafasy_128kbps';
    return `https://everyayah.com/data/${folder}/${s3}${a3}.mp3`;
  };

  const togglePlay = (ayahNumber: number, explicitUrl?: string, overrideQari?: string) => {
    if (!surah) return;

    const qariToUse = overrideQari || selectedQari;

    // Toggle pause if currently playing the exact same ayah
    if (playingAyah === ayahNumber && !overrideQari && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayingAyah(null);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      return;
    }

    const targetUrl = explicitUrl && explicitUrl.startsWith('http')
      ? explicitUrl
      : getAyahAudioUrl(surah.number, ayahNumber, qariToUse);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const newAudio = new Audio(targetUrl);
    newAudio.defaultPlaybackRate = playbackSpeedRef.current;
    newAudio.playbackRate = playbackSpeedRef.current;
    
    // Ensure playbackRate persists on mobile Safari / Chrome during playback start
    newAudio.onloadedmetadata = () => {
      newAudio.playbackRate = playbackSpeedRef.current;
    };
    newAudio.onplay = () => {
      newAudio.playbackRate = playbackSpeedRef.current;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };
    newAudio.onpause = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    audioRef.current = newAudio;
    setPlayingAyah(ayahNumber);
    setMushafSelectedAyah(ayahNumber);

    // 🌟 Set up Lock-Screen MediaSession Controls (Background Playback)
    if ('mediaSession' in navigator && surah) {
      const qariObj = QARI_OPTIONS.find(q => q.id === qariToUse);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Surah ${surah.englishName} (${surah.name}) — Verse ${ayahNumber}`,
        artist: qariObj?.name || 'Quran Recitation',
        album: '619 Islam — The Holy Quran',
        artwork: [
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = 'playing';

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
          navigator.mediaSession.playbackState = 'playing';
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          navigator.mediaSession.playbackState = 'paused';
        }
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrev();
      });
    }

    newAudio.onended = () => {
      const nextAyah = surah.ayahs.find(a => a.numberInSurah === ayahNumber + 1);
      if (nextAyah) {
        togglePlay(nextAyah.numberInSurah, undefined, qariToUse);
      } else {
        setPlayingAyah(null);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'none';
        }
      }
    };

    newAudio.onerror = () => {
      // Fallback to EveryAyah Alafasy if primary fails
      const fallbackUrl = `https://everyayah.com/data/Alafasy_128kbps/${String(surah.number).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
      if (targetUrl !== fallbackUrl) {
        const fallbackAudio = new Audio(fallbackUrl);
        fallbackAudio.defaultPlaybackRate = playbackSpeedRef.current;
        fallbackAudio.playbackRate = playbackSpeedRef.current;
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

  // Instant 1-Click Qari Selector (switches voice immediately without requiring 2 clicks)
  const handleSelectQari = (qariId: string) => {
    setSelectedQari(qariId);
    setShowQariMenu(false);
    localStorage.setItem('selected_qari_id', qariId);

    // If already playing or paused on an Ayah, start playing that Ayah with new Qari immediately on 1st click
    const targetAyah = playingAyah || 1;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Play immediately with new voice
    setTimeout(() => {
      togglePlay(targetAyah, undefined, qariId);
    }, 10);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    localStorage.setItem('quran_playback_speed', String(speed));
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.defaultPlaybackRate = speed;
    }
    setShowSpeedMenu(false);
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
  const primaryTransObj = AVAILABLE_TRANSLATIONS.find(t => String(t.id) === String(primaryTrans)) || AVAILABLE_TRANSLATIONS[0];
  const secondaryTransObj = AVAILABLE_TRANSLATIONS.find(t => String(t.id) === String(secondaryTrans));
  const isPrimaryRtl = primaryTransObj?.isRtl ?? false;
  const isSecondaryRtl = secondaryTransObj?.isRtl ?? false;

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button 
                onClick={() => navigate('/quran')}
                className="p-2 hover:bg-surface rounded-2xl text-subtext hover:text-text transition-colors active:scale-95 shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-base sm:text-lg text-text truncate">
                    {surah.englishName}
                  </h1>
                  <span className="text-xs font-arabic text-amber-500 font-bold shrink-0">
                    ({surah.name})
                  </span>
                </div>
                <p className="text-[11px] text-subtext truncate">
                  {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language Selector Pill */}
              <button
                onClick={() => setShowTransModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-black shadow-sm active:scale-95 transition-all"
                title="Change Primary & Secondary Quran Translations"
              >
                <Languages size={14} className="shrink-0" />
                <span className="text-[11px] uppercase tracking-wide">
                  {primaryTransObj.lang.split('-')[0].toUpperCase()}
                  {secondaryTransObj ? ` + ${secondaryTransObj.lang.split('-')[0].toUpperCase()}` : ''}
                </span>
              </button>

              {/* Info Button */}
              <button
                onClick={handleOpenInfo}
                className="p-2 rounded-xl bg-surface hover:bg-border text-subtext hover:text-text active:scale-95 transition-colors"
                title="Historical Context & Background"
              >
                <Info size={16} />
              </button>
            </div>
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
                const cleanText = cleanArabic(ayah.text);

                return (
                  <span 
                    key={ayah.number} 
                    id={`ayah-${ayah.numberInSurah}`}
                    onClick={() => setMushafSelectedAyah(isSelected ? null : ayah.numberInSurah)}
                    className={`inline-block mx-0.5 px-1.5 py-0.5 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                      isPlaying 
                        ? 'bg-amber-500/25 text-amber-300 ring-2 ring-amber-500 shadow-md font-bold' 
                        : isSelected
                        ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                        : 'text-text hover:bg-surface hover:text-primary active:scale-95'
                    }`}
                  >
                    <span>{cleanText}</span>
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePlay(ayah.numberInSurah, ayah.audio)}
                      className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                        isPlaying ? 'bg-primary text-white shadow-md' : 'bg-surface hover:bg-border text-text'
                      }`}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                </div>

                {/* Word by Word Interactive Grid */}
                <div className="flex flex-wrap gap-2.5 justify-end mb-4" dir="rtl">
                  {ayah.words && ayah.words.length > 0 ? (
                    ayah.words.map((word) => {
                      const isWordPlaying = playingWordId === word.id;
                      return (
                        <div
                          key={word.id}
                          onClick={() => handlePlayWordAudio(word.id, word.audioUrl)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 ${
                            isWordPlaying
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500 shadow-md scale-105'
                              : 'bg-surface/80 border-border/70 hover:border-primary/40 hover:bg-surface'
                          }`}
                        >
                          <span className="font-arabic text-2xl mb-1 text-text">
                            {cleanArabic(word.textUthmani)}
                          </span>
                          <span className="text-[11px] font-sans text-subtext text-center dir-ltr max-w-[80px] truncate">
                            {cleanArabic(word.translation)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-right text-2xl font-arabic leading-[2.6] text-text">
                      {cleanArabic(ayah.text)}
                    </p>
                  )}
                </div>

                {/* 🌟 Dual Translations: Primary (High-Contrast & Prominent) + Secondary (Subtle) */}
                <div className="pt-3.5 border-t border-border/70 space-y-3">
                  {/* 1. Primary Translation (Prominent & High Contrast) */}
                  {ayah.translation && (
                    <div className="bg-surface/40 dark:bg-black/20 p-3.5 rounded-2xl border border-border/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                          <span>📖</span>
                          <span>{primaryTransObj.name}</span>
                        </span>
                      </div>
                      <p className={`leading-relaxed ${
                        isPrimaryRtl 
                          ? 'font-urdu text-right text-xl sm:text-2xl font-bold text-emerald-400 dark:text-emerald-300 leading-[2.3]' 
                          : 'text-sm sm:text-base font-bold text-text dark:text-zinc-100 leading-relaxed'
                      }`} dir={isPrimaryRtl ? 'rtl' : 'ltr'}>
                        {ayah.translation}
                      </p>
                    </div>
                  )}

                  {/* 2. Secondary Translation (Subtle Contextual Block) */}
                  {ayah.secondaryTranslation && (
                    <div className="bg-surface/60 dark:bg-surface/40 p-3 rounded-2xl border border-border/50 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-subtext" dir="ltr">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        <span>{secondaryTransObj?.name || 'Secondary Translation'}</span>
                      </div>
                      <p className={`leading-relaxed ${
                        isSecondaryRtl 
                          ? 'font-urdu text-right text-lg text-emerald-300/80 font-medium leading-[2.1]' 
                          : 'text-xs sm:text-sm text-subtext leading-relaxed font-normal'
                      }`} dir={isSecondaryRtl ? 'rtl' : 'ltr'}>
                        {ayah.secondaryTranslation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* 3. VERSE BY VERSE TRANSLATION MODE */
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

                {/* Clean Arabic Verse */}
                <p className="text-right text-2xl sm:text-3xl font-arabic leading-[2.6] text-text mb-4" dir="rtl">
                  {cleanArabic(ayah.text)}
                </p>

                {/* 🌟 Dual Translations: Primary (High-Contrast & Prominent) + Secondary (Subtle) */}
                <div className="pt-3.5 border-t border-border/70 space-y-3">
                  {/* 1. Primary Translation (Prominent & High Contrast) */}
                  {ayah.translation && (
                    <div className="bg-surface/40 dark:bg-black/20 p-3.5 rounded-2xl border border-border/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                          <span>📖</span>
                          <span>{primaryTransObj.name}</span>
                        </span>
                      </div>
                      <p className={`leading-relaxed ${
                        isPrimaryRtl 
                          ? 'font-urdu text-right text-xl sm:text-2xl font-bold text-emerald-400 dark:text-emerald-300 leading-[2.3]' 
                          : 'text-sm sm:text-base font-bold text-text dark:text-zinc-100 leading-relaxed'
                      }`} dir={isPrimaryRtl ? 'rtl' : 'ltr'}>
                        {ayah.translation}
                      </p>
                    </div>
                  )}

                  {/* 2. Secondary Translation (Subtle Contextual Block) */}
                  {ayah.secondaryTranslation && (
                    <div className="bg-surface/60 dark:bg-surface/40 p-3 rounded-2xl border border-border/50 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-subtext" dir="ltr">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        <span>{secondaryTransObj?.name || 'Secondary Translation'}</span>
                      </div>
                      <p className={`leading-relaxed ${
                        isSecondaryRtl 
                          ? 'font-urdu text-right text-lg text-emerald-300/80 font-medium leading-[2.1]' 
                          : 'text-xs sm:text-sm text-subtext leading-relaxed font-normal'
                      }`} dir={isSecondaryRtl ? 'rtl' : 'ltr'}>
                        {ayah.secondaryTranslation}
                      </p>
                    </div>
                  )}
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

      {/* ── 🎵 STREAMLINED FLOATING BOTTOM AUDIO & MODE PLAYER ── */}
      <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto bg-card/95 backdrop-blur-2xl border border-border/90 rounded-3xl shadow-2xl p-3 animate-in slide-in-from-bottom-4">
        
        {/* Reading Mode Picker Sheet */}
        {showModeMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-3 bg-card border border-border rounded-3xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 z-50">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                <BookOpen size={16} className="text-primary" />
                <span>Choose Reading Mode</span>
              </h3>
              <button onClick={() => setShowModeMenu(false)} className="p-1.5 bg-surface rounded-full text-subtext hover:text-text">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setReadMode('translation'); setShowModeMenu(false); }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  readMode === 'translation'
                    ? 'bg-primary text-white border-primary shadow-md font-bold'
                    : 'bg-surface border-border text-text hover:border-primary/40'
                }`}
              >
                <span className="text-lg">📖</span>
                <span className="text-xs font-bold">Verses</span>
                <span className="text-[9px] opacity-75">Verse & Meaning</span>
              </button>

              <button
                onClick={() => { setReadMode('wordByWord'); setShowModeMenu(false); }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  readMode === 'wordByWord'
                    ? 'bg-primary text-white border-primary shadow-md font-bold'
                    : 'bg-surface border-border text-text hover:border-primary/40'
                }`}
              >
                <span className="text-lg">🔤</span>
                <span className="text-xs font-bold">Words</span>
                <span className="text-[9px] opacity-75">Word by Word</span>
              </button>

              <button
                onClick={() => { setReadMode('reading'); setShowModeMenu(false); }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  readMode === 'reading'
                    ? 'bg-primary text-white border-primary shadow-md font-bold'
                    : 'bg-surface border-border text-text hover:border-primary/40'
                }`}
              >
                <span className="text-lg">📜</span>
                <span className="text-xs font-bold">Mushaf</span>
                <span className="text-[9px] opacity-75">Continuous Flow</span>
              </button>
            </div>
          </div>
        )}

        {/* Reciter Voice Picker Sheet */}
        {showQariMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-3 bg-card border border-border rounded-3xl shadow-2xl p-5 max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom-4 z-50">
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
                  onClick={() => handleSelectQari(qari.id)}
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

        {/* Speed Controls Picker Sheet */}
        {showSpeedMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-3 bg-card border border-border rounded-3xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 z-50">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                <Gauge size={16} className="text-primary" />
                <span>Playback Speed</span>
              </h3>
              <button onClick={() => setShowSpeedMenu(false)} className="p-1.5 bg-surface rounded-full text-subtext hover:text-text">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {SPEED_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSpeedChange(opt.value)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    playbackSpeed === opt.value
                      ? 'bg-primary text-white border-primary shadow-md font-bold'
                      : 'bg-surface border-border text-text hover:border-primary/40'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[9px] opacity-80 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── RESPONSIVE 2-TIER PLAYER CONTROLS (FITS 100% ON SHORT/NARROW SCREENS) ── */}
        <div className="space-y-2">
          
          {/* Row 1: Mode, Reciter, Speed & Ayah Counter */}
          <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-border/50">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* 1. Mode Dropdown Pill */}
              <button 
                onClick={() => {
                  setShowModeMenu(!showModeMenu);
                  setShowQariMenu(false);
                  setShowSpeedMenu(false);
                }}
                className="flex items-center gap-1 py-1 px-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl text-[11px] font-bold text-primary border border-primary/25 transition-colors shrink-0 active:scale-95"
                title="Switch Reading Mode"
              >
                <span>{readMode === 'translation' ? '📖 Verses' : readMode === 'wordByWord' ? '🔤 Words' : '📜 Mushaf'}</span>
                <ChevronUp size={11} className={`transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* 2. Reciter Selector Pill */}
              <button 
                onClick={() => {
                  setShowQariMenu(!showQariMenu);
                  setShowModeMenu(false);
                  setShowSpeedMenu(false);
                }}
                className="flex items-center gap-1 py-1 px-2 bg-surface hover:bg-border/60 rounded-xl text-[11px] font-bold text-text border border-border/60 transition-colors max-w-[120px] sm:max-w-[140px] truncate shrink-0 active:scale-95"
                title="Select Reciter Voice"
              >
                <Volume2 size={12} className="text-primary shrink-0" />
                <span className="truncate">{currentQariName.split(' ')[0]}</span>
                <ChevronUp size={11} className={`text-muted shrink-0 transition-transform ${showQariMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Right: Speed & Ayah Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowModeMenu(false);
                  setShowQariMenu(false);
                }}
                className={`py-1 px-1.5 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-0.5 shrink-0 active:scale-95 ${
                  playbackSpeed !== 1.0
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-surface border-border text-subtext hover:text-text'
                }`}
                title="Audio Playback Speed"
              >
                <Gauge size={11} />
                <span>{playbackSpeed}x</span>
              </button>

              <span className="text-[10px] sm:text-[11px] font-black text-text bg-surface px-2 py-0.5 rounded-lg border border-border/50">
                Ayah {playingAyah || 1}<span className="text-subtext font-normal text-[9px]">/{surah.numberOfAyahs}</span>
              </span>
            </div>
          </div>

          {/* Row 2: Surah & Reciter Details + Big Touch Controls */}
          <div className="flex items-center justify-between px-1">
            <div className="min-w-0 pr-2">
              <h4 className="text-xs font-black text-text truncate">
                {surah.englishName} • <span className="font-arabic text-amber-500">{surah.name}</span>
              </h4>
              <p className="text-[10px] text-subtext truncate">
                {currentQariName}
              </p>
            </div>

            {/* Play/Pause & Skip Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={playPrev}
                className="p-1.5 sm:p-2 rounded-xl bg-surface hover:bg-border text-subtext hover:text-text active:scale-90 transition-all"
                title="Previous Ayah"
              >
                <SkipBack size={15} />
              </button>

              <button 
                onClick={() => {
                  if (playingAyah !== null) {
                    togglePlay(playingAyah);
                  } else if (surah.ayahs.length > 0) {
                    togglePlay(surah.ayahs[0].numberInSurah, surah.ayahs[0].audio);
                  }
                }}
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-90 transition-all"
              >
                {playingAyah !== null ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
              </button>

              <button 
                onClick={playNext}
                className="p-1.5 sm:p-2 rounded-xl bg-surface hover:bg-border text-subtext hover:text-text active:scale-90 transition-all"
                title="Next Ayah"
              >
                <SkipForward size={15} />
              </button>
            </div>
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

      {/* 🌐 Dual Translation Selector Modal */}
      {showTransModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-card border border-border/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-text flex items-center gap-2">
                <Languages size={18} className="text-amber-400" />
                <span>Translation Languages</span>
              </h3>
              <button 
                onClick={() => setShowTransModal(false)} 
                className="p-1.5 rounded-full hover:bg-surface text-subtext hover:text-text transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-text mb-1 uppercase tracking-wider text-[10px]">
                  Primary Language (Prominent)
                </label>
                <select
                  value={primaryTrans}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrimaryTrans(val);
                    localStorage.setItem('quran_primary_translation', val);
                  }}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl text-text font-medium outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {AVAILABLE_TRANSLATIONS.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted mt-1">Main high-contrast translation shown on each verse.</p>
              </div>

              <div>
                <label className="block font-bold text-text mb-1 uppercase tracking-wider text-[10px]">
                  Secondary Language (Optional Dual View)
                </label>
                <select
                  value={secondaryTrans}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSecondaryTrans(val);
                    localStorage.setItem('quran_secondary_translation', val);
                  }}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl text-text font-medium outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="none">None (Single Translation Only)</option>
                  {AVAILABLE_TRANSLATIONS.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted mt-1">Shows a second language (e.g. English + Urdu or Urdu + Pashto) side-by-side.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowTransModal(false);
                if (id) loadSurah(parseInt(id), readMode === 'wordByWord', primaryTrans, secondaryTrans);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black rounded-2xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Apply Translation Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahReader;
