import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Sparkles, 
  Volume2, 
  CloudRain, 
  Wind, 
  Waves, 
  Clock, 
  VolumeX, 
  Radio, 
  Disc3, 
  Plane
} from 'lucide-react';
import { persistentAudioPlayer, AudioTrack } from '../services/persistentAudioPlayer';
import { ambientAudioService } from '../services/ambientAudioService';
import { OfflineAudioModal } from '../components/ui/OfflineAudioModal';

interface SleepSurah {
  id: number;
  name: string;
  arabicName: string;
  meaning: string;
  theme: string;
  ayahCount: number;
}

const SLEEP_SURAHS: SleepSurah[] = [
  { id: 67, name: 'Al-Mulk', arabicName: 'الملك', meaning: 'The Sovereignty', theme: 'Protection in the grave before sleeping', ayahCount: 30 },
  { id: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', meaning: 'The Beneficent', theme: 'Divine mercy, blessings & deep calmness', ayahCount: 78 },
  { id: 36, name: 'Yaseen', arabicName: 'يس', meaning: 'Heart of Quran', theme: 'Spiritual comfort & forgiveness', ayahCount: 83 },
  { id: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة', meaning: 'The Inevitable', theme: 'Peace, sustenance & protection from poverty', ayahCount: 96 },
  { id: 19, name: 'Maryam', arabicName: 'مريم', meaning: 'Mary', theme: 'Comfort, hope & miraculous mercy', ayahCount: 98 },
  { id: 18, name: 'Al-Kahf', arabicName: 'الكهف', meaning: 'The Cave', theme: 'Light between the two Fridays & serenity', ayahCount: 110 },
  { id: 76, name: 'Al-Insan', arabicName: 'الإنسان', meaning: 'Man', theme: 'Paradise descriptions & pure springs', ayahCount: 31 },
  { id: 94, name: 'Ash-Sharh', arabicName: 'الشرح', meaning: 'The Relief', theme: 'Easing distress & inner burden', ayahCount: 8 },
  { id: 112, name: 'Al-Ikhlas & Mu\'awwidhatayn', arabicName: 'الإخلاص والمعوذتين', meaning: 'The 3 Quls Loop', theme: 'Nightly protective shield & Fortress', ayahCount: 15 },
];

interface Qari {
  id: string;
  name: string;
  serverKey: string;
  getUrl: (surahNum: number) => string;
  fallbackUrl?: (surahNum: number) => string;
  bitrate: number;
}

const pad3 = (n: number) => String(n).padStart(3, '0');

const SLEEP_QARIS: Qari[] = [
  { 
    id: 'alafasy', 
    name: 'Mishary Rashid Alafasy', 
    serverKey: 'ar.alafasy',
    getUrl: (s) => `https://server8.mp3quran.net/afs/${pad3(s)}.mp3`,
    fallbackUrl: (s) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${s}.mp3`,
    bitrate: 128 
  },
  { 
    id: 'abdulbasit', 
    name: 'Abdul Basit (Murattal)', 
    serverKey: 'ar.abdulbasitmurattal',
    getUrl: (s) => `https://server7.mp3quran.net/basit/${pad3(s)}.mp3`,
    fallbackUrl: (s) => `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${s}.mp3`,
    bitrate: 192 
  },
  { 
    id: 'minshawi', 
    name: 'Muhammad Siddiq Al-Minshawi', 
    serverKey: 'ar.minshawi',
    getUrl: (s) => `https://server10.mp3quran.net/minsh/${pad3(s)}.mp3`,
    bitrate: 128 
  },
  { 
    id: 'ghamdi', 
    name: 'Saad Al-Ghamdi', 
    serverKey: 'ar.saadalghamdi',
    getUrl: (s) => `https://server7.mp3quran.net/s_gmd/${pad3(s)}.mp3`,
    bitrate: 128 
  },
  { 
    id: 'dosari', 
    name: 'Yasser Al-Dosari', 
    serverKey: 'ar.dussary',
    getUrl: (s) => `https://server11.mp3quran.net/yasser/${pad3(s)}.mp3`,
    bitrate: 128 
  },
];

export const QuranSleepStation: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSurah, setSelectedSurah] = useState<SleepSurah>(SLEEP_SURAHS[0]);
  const [selectedQari, setSelectedQari] = useState<Qari>(SLEEP_QARIS[0]);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'breeze' | 'river'>('rain');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.4);
  const [activeTimerMinutes, setActiveTimerMinutes] = useState<number | null>(30);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  
  // Player state
  const [playerState, setPlayerState] = useState(persistentAudioPlayer.getState());

  useEffect(() => {
    const unsub = persistentAudioPlayer.subscribe(setPlayerState);
    return () => unsub();
  }, []);

  // Ambient sound management
  useEffect(() => {
    if (playerState.isPlaying && ambientSound !== 'none') {
      ambientAudioService.startSound(ambientSound, ambientVolume);
    } else {
      ambientAudioService.stop();
    }
  }, [playerState.isPlaying, ambientSound, ambientVolume]);

  const handlePlaySurah = (surah: SleepSurah) => {
    setSelectedSurah(surah);
    const audioUrl = selectedQari.getUrl(surah.id);
    const fallbackUrl = selectedQari.fallbackUrl ? selectedQari.fallbackUrl(surah.id) : undefined;
    const track: AudioTrack = {
      id: `sleep-surah-${surah.id}-${selectedQari.id}`,
      title: `Surah ${surah.name} (${surah.arabicName})`,
      artist: selectedQari.name,
      album: 'Quran Sleep Sanctuary • 619 Islam',
      src: audioUrl,
      fallbackSrc: fallbackUrl,
      artwork: '/pwa-512x512.png',
      surahNumber: surah.id,
    };

    persistentAudioPlayer.playTrack(track, () => {
      // Auto play next surah on loop
      const nextIdx = (SLEEP_SURAHS.findIndex(s => s.id === surah.id) + 1) % SLEEP_SURAHS.length;
      handlePlaySurah(SLEEP_SURAHS[nextIdx]);
    }, selectedQari.serverKey);

    if (activeTimerMinutes && activeTimerMinutes > 0) {
      persistentAudioPlayer.setSleepTimer(activeTimerMinutes);
    }
  };

  const handleTogglePlay = () => {
    if (!playerState.currentTrack) {
      handlePlaySurah(selectedSurah);
    } else {
      persistentAudioPlayer.toggle();
    }
  };

  const handleSelectTimer = (minutes: number | null) => {
    setActiveTimerMinutes(minutes);
    persistentAudioPlayer.setSleepTimer(minutes);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const isCurrentSurahPlaying = (sId: number) => {
    return playerState.isPlaying && playerState.currentTrack?.surahNumber === sId;
  };

  return (
    <div className="p-4 sm:p-6 pb-36 max-w-4xl mx-auto w-full space-y-5">
      
      {/* ── Top Header ── */}
      <header className="pt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quran')}
            className="p-2 hover:bg-surface rounded-2xl text-subtext hover:text-text transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight flex items-center gap-2">
              <span>Quran Sleep Sanctuary</span>
              <span className="text-sm">🌙</span>
            </h1>
            <p className="text-xs sm:text-sm text-subtext font-medium mt-0.5">
              Soothing Quran recitations with calming soundscapes & sleep timer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOfflineModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-all"
            title="Download for Airplane & Offline Travel"
          >
            <Plane size={14} />
            <span className="hidden sm:inline">Airplane Downloads</span>
            <span className="sm:hidden">Offline</span>
          </button>
        </div>
      </header>

      {/* ── 🌌 MASTER CELESTIAL AUDIO HERO CARD ── */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#05161d] via-[#092c35] to-[#041417] border border-cyan-500/30">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Glowing Animated Disc / Artwork */}
          <div className="relative flex items-center justify-center">
            <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-cyan-400/40 p-1.5 bg-black/40 shadow-2xl shadow-cyan-500/20 flex items-center justify-center ${
              playerState.isPlaying ? 'animate-spin' : ''
            }`} style={{ animationDuration: '24s' }}>
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-900 via-teal-900 to-indigo-900 flex flex-col items-center justify-center p-3 text-center border border-white/15">
                <Disc3 size={36} className="text-cyan-300 mb-1 opacity-80" />
                <span className="text-xs font-bold text-cyan-200 font-arabic truncate max-w-[110px]">
                  {selectedSurah.arabicName}
                </span>
                <span className="text-[10px] text-white/70 font-semibold truncate max-w-[110px]">
                  {selectedSurah.name}
                </span>
              </div>
            </div>

            {/* Glowing Core */}
            <div className="absolute w-10 h-10 rounded-full bg-black/80 border border-cyan-400/60 flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Right: Track Information & Player Controls */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30 inline-block mb-1.5">
                {playerState.isPlaying ? '🎵 Now Playing in Background' : '🌙 Ready to Relax'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Surah {selectedSurah.name} <span className="font-arabic text-amber-400 text-lg sm:text-xl font-normal">({selectedSurah.arabicName})</span>
              </h2>
              <p className="text-xs text-cyan-200/80 font-medium mt-0.5">
                Recited by <strong>{selectedQari.name}</strong> • {selectedSurah.theme}
              </p>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={playerState.duration || 100}
                value={playerState.currentTime || 0}
                onChange={(e) => persistentAudioPlayer.seek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-bold text-cyan-200/60">
                <span>{formatTime(playerState.currentTime)}</span>
                <span>{formatTime(playerState.duration)}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <button
                onClick={handleTogglePlay}
                className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 text-black flex items-center justify-center shadow-xl shadow-cyan-400/30 active:scale-95 transition-transform hover:scale-105"
              >
                {playerState.isPlaying ? (
                  <Pause size={24} className="fill-black" />
                ) : (
                  <Play size={24} className="fill-black ml-0.5" />
                )}
              </button>

              {/* Sleep Timer Indicator Button */}
              <div className="bg-black/30 border border-white/10 rounded-2xl px-3.5 py-2 text-left">
                <span className="text-[9px] font-bold uppercase text-white/50 block">Sleep Timer</span>
                <span className="text-xs font-black text-cyan-300 flex items-center gap-1">
                  <Clock size={12} />
                  {playerState.sleepTimerRemaining !== null 
                    ? `${formatTime(playerState.sleepTimerRemaining)} remaining` 
                    : 'Off'}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── 🎛️ AMBIENT SOUNDSCAPES & SLEEP TIMER SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Natural Ambient Background Soundscape */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-text flex items-center gap-2">
              <CloudRain size={16} className="text-primary" />
              <span>Ambient Soundscape</span>
            </h3>
            <span className="text-[10px] font-bold text-subtext uppercase">Layered Mixer</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'none', label: 'Off', icon: <VolumeX size={15} /> },
              { id: 'rain', label: 'Madinah Rain', icon: <CloudRain size={15} /> },
              { id: 'breeze', label: 'Makkah Wind', icon: <Wind size={15} /> },
              { id: 'river', label: 'Stream', icon: <Waves size={15} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setAmbientSound(item.id as any)}
                className={`py-2.5 px-2 rounded-2xl text-center border text-[11px] font-bold flex flex-col items-center gap-1 transition-all active:scale-95 ${
                  ambientSound === item.id 
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-sm' 
                    : 'bg-surface text-subtext border-border'
                }`}
              >
                {item.icon}
                <span className="truncate w-full">{item.label}</span>
              </button>
            ))}
          </div>

          {ambientSound !== 'none' && (
            <div className="pt-2 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-subtext">
                <span>Ambient Volume</span>
                <span>{Math.round(ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}
        </div>

        {/* 2. Sleep Timer Settings */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-text flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <span>Sleep Timer (Smooth Fadeout)</span>
            </h3>
            <span className="text-[10px] font-bold text-subtext uppercase">Auto-Stop</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[15, 30, 45, 60, null].map((mins, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTimer(mins)}
                className={`py-2.5 rounded-2xl text-center border text-xs font-black transition-all active:scale-95 ${
                  activeTimerMinutes === mins 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-sm' 
                    : 'bg-surface text-subtext border-border'
                }`}
              >
                {mins ? `${mins}m` : 'Off'}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-subtext leading-tight pt-1">
            Audio smoothly fades out in the final 60 seconds so you drift to sleep peacefully.
          </p>
        </div>

      </div>

      {/* ── 🎙️ QARI SELECTION PILLS ── */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black text-text flex items-center gap-2">
            <Radio size={16} className="text-primary" />
            <span>Select Reciter (Qari)</span>
          </h3>
          <span className="text-[10px] font-bold text-primary">Crystal Audio CDN</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SLEEP_QARIS.map((qari) => (
            <button
              key={qari.id}
              onClick={() => {
                setSelectedQari(qari);
                if (playerState.isPlaying || playerState.currentTrack) {
                  // Switch voice immediately
                  const audioUrl = qari.getUrl(selectedSurah.id);
                  const fallbackUrl = qari.fallbackUrl ? qari.fallbackUrl(selectedSurah.id) : undefined;
                  persistentAudioPlayer.playTrack({
                    id: `sleep-surah-${selectedSurah.id}-${qari.id}`,
                    title: `Surah ${selectedSurah.name} (${selectedSurah.arabicName})`,
                    artist: qari.name,
                    album: 'Quran Sleep Sanctuary • 619 Islam',
                    src: audioUrl,
                    fallbackSrc: fallbackUrl,
                    artwork: '/pwa-512x512.png',
                    surahNumber: selectedSurah.id,
                  }, undefined, qari.serverKey);
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                selectedQari.id === qari.id 
                  ? 'bg-primary/15 border-primary/40 text-primary shadow-sm' 
                  : 'bg-surface border-border text-text hover:bg-card'
              }`}
            >
              <h5 className="text-xs font-bold truncate">{qari.name}</h5>
              <span className="text-[10px] text-subtext block mt-0.5">{qari.bitrate} kbps Audio</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 📖 CURATED BEDTIME SURAHS LIST ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-black text-text flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span>Peaceful Bedtime Surahs</span>
          </h3>
          <span className="text-xs text-subtext font-medium">{SLEEP_SURAHS.length} Surahs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SLEEP_SURAHS.map((surah) => {
            const isPlaying = isCurrentSurahPlaying(surah.id);
            const isSelected = selectedSurah.id === surah.id;

            return (
              <div
                key={surah.id}
                onClick={() => handlePlaySurah(surah)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between gap-3 shadow-sm ${
                  isPlaying 
                    ? 'bg-cyan-500/15 border-cyan-500/40 ring-1 ring-cyan-500' 
                    : isSelected 
                    ? 'bg-card border-primary/40' 
                    : 'bg-card border-border hover:border-primary/25'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isPlaying 
                      ? 'bg-cyan-400 text-black animate-pulse' 
                      : 'bg-surface text-primary border border-border'
                  }`}>
                    {isPlaying ? <Volume2 size={18} /> : surah.id}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-text truncate">
                        Surah {surah.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-subtext truncate mt-0.5">
                      {surah.theme}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-arabic text-amber-400 font-bold block">
                    {surah.arabicName}
                  </span>
                  <span className="text-[9px] text-muted font-semibold block">
                    {surah.ayahCount} Ayahs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✈️ Offline Airplane Audio Downloader Modal */}
      <OfflineAudioModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
      />

    </div>
  );
};

export default QuranSleepStation;
