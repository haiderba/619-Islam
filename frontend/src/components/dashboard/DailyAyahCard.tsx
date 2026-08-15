import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Share2, Sparkles, BookOpen, Volume2, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadStatusCard, shareStatusCard, AyahData } from '../../utils/statusImageGenerator';
import axios from 'axios';

// 30 Curated daily sets of 3 spiritually uplifting Quranic verses (Hope, Patience, Remembrance, Mercy, Trust)
const CURATED_DAILY_VERSES: [number, number, string][] = [
  // Day Set 1
  [94, 5, "With hardship comes ease"],
  [2, 152, "Remember Me, I will remember you"],
  [39, 53, "Despair not of the mercy of Allah"],

  // Day Set 2
  [2, 286, "Allah does not burden a soul beyond that it can bear"],
  [65, 3, "And whoever relies upon Allah - He is sufficient"],
  [13, 28, "Verily in the remembrance of Allah do hearts find rest"],

  // Day Set 3
  [3, 139, "Do not weaken and do not grieve"],
  [2, 186, "Indeed I am near. I answer the caller"],
  [14, 7, "If you are grateful, I will surely increase you"],

  // Day Set 4
  [21, 87, "There is no deity except You; exalted are You"],
  [93, 3, "Your Lord has not forsaken you, nor is He displeased"],
  [8, 2, "The believers are those whose hearts tremble at the mention of Allah"],

  // Day Set 5
  [49, 13, "Indeed, the most noble of you in the sight of Allah is the most righteous"],
  [55, 60, "Is the reward for good anything but good?"],
  [2, 214, "Unquestionably, the help of Allah is near"],

  // Day Set 6
  [20, 114, "My Lord, increase me in knowledge"],
  [23, 118, "My Lord, forgive and have mercy, for You are the best of the merciful"],
  [3, 200, "O you who have believed, persevere and endure"],

  // Day Set 7
  [29, 69, "And those who strive for Us - We will surely guide them to Our ways"],
  [59, 18, "Let every soul consider what it has put forward for tomorrow"],
  [16, 97, "Whoever does righteousness, whether male or female, while he is a believer - We will surely cause him to live a good life"],
];

const DailyAyahCard: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  // Pick 3 verses deterministically based on today's date
  useEffect(() => {
    const loadDailyVerses = async () => {
      try {
        setLoading(true);
        const today = new Date();
        // Day of year calculation
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = (today.getTime() - start.getTime()) + ((start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const totalSets = Math.floor(CURATED_DAILY_VERSES.length / 3);
        const setIndex = (dayOfYear % totalSets) * 3;
        const todayTriad = CURATED_DAILY_VERSES.slice(setIndex, setIndex + 3);

        // Fetch details in parallel from AlQuran Cloud API
        const promises = todayTriad.map(async ([surah, ayah, theme]) => {
          try {
            const res = await axios.get(
              `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.asad,ar.alafasy`
            );
            const data = res.data.data;
            return {
              surahNumber: surah,
              ayahNumber: ayah,
              surahNameEnglish: data[0].surah.englishName,
              surahNameArabic: data[0].surah.name,
              arabicText: data[0].text,
              englishTranslation: data[1].text,
              audioUrl: data[2].audio,
              theme,
            } as AyahData;
          } catch (e) {
            console.error(`Failed to load ayah ${surah}:${ayah}`, e);
            return null;
          }
        });

        const results = (await Promise.all(promises)).filter(Boolean) as AyahData[];
        setAyahs(results);
      } catch (err) {
        console.error('Failed to load daily verses', err);
      } finally {
        setLoading(false);
      }
    };

    loadDailyVerses();
  }, []);

  // Stop audio when switching tabs
  const handleSelectTab = (idx: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setSelectedIdx(idx);
  };

  const handleToggleAudio = () => {
    const currentAyah = ayahs[selectedIdx];
    if (!currentAyah?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(currentAyah.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
    } else if (audioRef.current.src !== currentAyah.audioUrl) {
      audioRef.current.src = currentAyah.audioUrl;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleDownload = async () => {
    const currentAyah = ayahs[selectedIdx];
    if (!currentAyah) return;
    try {
      setIsDownloading(true);
      await downloadStatusCard(currentAyah);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const currentAyah = ayahs[selectedIdx];
    if (!currentAyah) return;
    try {
      setIsDownloading(true);
      await shareStatusCard(currentAyah);
    } catch (e) {
      console.error('Share failed', e);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border p-6 rounded-3xl mb-6 shadow-sm flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 size={24} className="text-primary animate-spin mb-2" />
        <p className="text-xs text-subtext">Loading today's Quranic verses...</p>
      </div>
    );
  }

  if (ayahs.length === 0) return null;

  const currentAyah = ayahs[selectedIdx] || ayahs[0];

  return (
    <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/30 p-5 sm:p-6 rounded-3xl shadow-xl shadow-teal-950/40 text-white mb-6 relative overflow-hidden group">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header with 619 Logo and Tabs */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="619 Islam" className="w-8 h-8 object-contain drop-shadow" />
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Ayah of the Day
              </span>
            </div>
            <p className="text-[10px] text-white/60">3 Daily Inspiring Verses</p>
          </div>
        </div>

        {/* 3 Ayah Switcher Tabs */}
        <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/10">
          {ayahs.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelectTab(i)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                selectedIdx === i
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              #{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Arabic Calligraphy Text */}
      <div className="relative z-10 my-4 text-center">
        <p className="font-arabic text-2xl sm:text-3xl leading-[2.2] text-amber-100 font-medium drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]">
          {currentAyah.arabicText}
        </p>
      </div>

      {/* English Translation */}
      <div className="relative z-10 my-3 text-center px-2">
        <p className="text-white/90 text-xs sm:text-sm font-normal italic leading-relaxed">
          "{currentAyah.englishTranslation}"
        </p>
      </div>

      {/* Surah Reference Badge & Audio Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-white/10">
        <div 
          onClick={() => navigate(`/quran/${currentAyah.surahNumber}`)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <BookOpen size={14} className="text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-amber-300 truncate">
            Surah {currentAyah.surahNameEnglish} • {currentAyah.surahNumber}:{currentAyah.ayahNumber}
          </span>
        </div>

        {/* Audio Player Button */}
        {currentAyah.audioUrl && (
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Playing' : 'Listen'}</span>
            <Volume2 size={13} className="opacity-70" />
          </button>
        )}
      </div>

      {/* Action Buttons: Status PNG Download & Share */}
      <div className="relative z-10 grid grid-cols-2 gap-2 mt-4">
        {/* Download Status Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          {downloadSuccess ? (
            <>
              <Check size={15} className="text-black" />
              <span>Saved PNG!</span>
            </>
          ) : isDownloading ? (
            <>
              <Loader2 size={15} className="animate-spin text-black" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download size={15} />
              <span>Download Status</span>
            </>
          )}
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 active:scale-95 transition-all"
        >
          <Share2 size={15} className="text-amber-400" />
          <span>Share Story</span>
        </button>
      </div>
    </div>
  );
};

export default DailyAyahCard;
