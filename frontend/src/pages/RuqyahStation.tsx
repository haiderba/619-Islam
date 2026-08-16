import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RUQYAH_AUDIO_TRACKS, 
  RUQYAH_VERSES, 
  RuqyahAudioTrack 
} from '../utils/ruqyahData';
import { 
  ShieldCheck, 
  Play, 
  Pause, 
  Volume2, 
  ChevronLeft, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';

export const RuqyahStation: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'verses' | 'audio'>('verses');
  const [selectedTrack, setSelectedTrack] = useState<RuqyahAudioTrack>(RUQYAH_AUDIO_TRACKS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Verse counter states
  const [verseCounters, setVerseCounters] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });

  const toggleTrackAudio = (track: RuqyahAudioTrack) => {
    if (selectedTrack.id === track.id && isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setSelectedTrack(track);
    const newAudio = new Audio(track.audioUrl);
    audioRef.current = newAudio;

    newAudio.onended = () => setIsPlayingAudio(false);
    newAudio.onerror = () => setIsPlayingAudio(false);

    newAudio.play()
      .then(() => setIsPlayingAudio(true))
      .catch((e) => {
        console.warn('Ruqyah audio playback interrupted', e);
        setIsPlayingAudio(false);
      });
  };

  const incrementVerseCount = (id: number, maxCount: number) => {
    setVerseCounters(prev => ({
      ...prev,
      [id]: Math.min(maxCount, (prev[id] || 0) + 1)
    }));
  };

  const resetVerseCount = (id: number) => {
    setVerseCounters(prev => ({
      ...prev,
      [id]: 0
    }));
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto">
      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1 bg-surface p-1 rounded-full border border-border text-xs font-bold">
          <button
            onClick={() => setActiveTab('verses')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'verses' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext'
            }`}
          >
            Healing Verses 📖
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'audio' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext'
            }`}
          >
            Audio Streams 🎙️
          </button>
        </div>
      </div>

      {/* ── Hero Master Banner ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Spiritual Healing & Protection</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Al-Ruqyah Al-Sharʿiyyah
          </h1>
          <p className="text-xs text-white/80 mt-1 max-w-sm leading-relaxed">
            Quranic verses and prophetic supplications for spiritual healing, relief from anxiety, illness, and protection from the evil eye.
          </p>
        </div>
      </div>

      {activeTab === 'verses' ? (
        /* ── Verses & Self-Ruqyah List ── */
        <div className="space-y-4">
          {RUQYAH_VERSES.map((verse) => {
            const currentCount = verseCounters[verse.id] || 0;
            const isFinished = currentCount >= verse.repetitionCount;

            return (
              <div
                key={verse.id}
                className={`bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border rounded-3xl p-5 shadow-sm space-y-3 transition-all ${
                  isFinished 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-border/80 dark:border-amber-500/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <h3 className="text-xs font-black text-text">
                    {verse.title}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                      Target: {verse.repetitionCount}x
                    </span>
                  </div>
                </div>

                {/* Arabic Text */}
                <p className="text-lg sm:text-xl font-black font-arabic text-amber-400 text-right leading-loose py-1">
                  {verse.arabic}
                </p>

                {/* English Translation */}
                <p className="text-xs sm:text-sm text-text font-medium leading-relaxed italic">
                  "{verse.english}"
                </p>

                {/* Urdu Translation */}
                <p className="text-xs sm:text-sm font-urdu text-emerald-600 dark:text-emerald-300 font-semibold leading-relaxed">
                  {verse.urdu}
                </p>

                {/* Benefit Box */}
                <div className="bg-surface/70 dark:bg-black/30 border border-border/80 rounded-2xl p-3 text-[11px] text-subtext leading-relaxed">
                  <strong className="text-text block mb-0.5">Spiritual Benefit:</strong>
                  {verse.benefit}
                </div>

                {/* Tap to Count Bar */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => resetVerseCount(verse.id)}
                    className="p-2 rounded-xl bg-surface hover:bg-card border border-border text-subtext hover:text-text active:scale-95 transition-all"
                    title="Reset Count"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    onClick={() => incrementVerseCount(verse.id, verse.repetitionCount)}
                    className={`flex-1 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all ${
                      isFinished
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20'
                    }`}
                  >
                    {isFinished ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Completed ({currentCount}/{verse.repetitionCount}x)</span>
                      </>
                    ) : (
                      <>
                        <span>Tap to Count: {currentCount} / {verse.repetitionCount}x</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Audio Streams List ── */
        <div className="space-y-3">
          {RUQYAH_AUDIO_TRACKS.map((track) => {
            const isSelectedAndPlaying = selectedTrack.id === track.id && isPlayingAudio;

            return (
              <div
                key={track.id}
                className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTrackAudio(track)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-black font-bold shadow-md active:scale-95 transition-all ${
                      isSelectedAndPlaying
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20'
                    }`}
                  >
                    {isSelectedAndPlaying ? <Pause size={18} className="fill-white" /> : <Play size={18} className="fill-black" />}
                  </button>

                  <div>
                    <h3 className="text-sm font-black text-text">
                      {track.reciter}
                    </h3>
                    <p className="text-xs text-subtext mt-0.5 font-medium">
                      {track.duration}
                    </p>
                  </div>
                </div>

                {isSelectedAndPlaying && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 animate-pulse">
                    <Volume2 size={16} />
                    <span>Playing</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
