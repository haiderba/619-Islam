import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Headphones
} from 'lucide-react';
import { ambientAudioService, AMBIENT_TRACKS } from '../../services/ambientAudioService';

export const AmbientAudioBar: React.FC = () => {
  const [ambientState, setAmbientState] = useState(ambientAudioService.getState());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const unsub = ambientAudioService.subscribe((state) => {
      setAmbientState(state);
    });
    return unsub;
  }, []);

  const handleTogglePlay = (trackId: string) => {
    ambientAudioService.playTrack(trackId, 15);
  };

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '15m';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-teal-500/30 rounded-2xl p-3.5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Headphones size={15} />
          </div>
          <div>
            <h4 className="text-xs font-black text-text flex items-center gap-1.5">
              <span>Haram & Masjid Focus Soundscapes</span>
              {ambientState.isPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </h4>
            <p className="text-[10px] text-subtext">Peaceful ambient sounds for Quran recitation & Dhikr.</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-bold text-teal-400 hover:underline"
        >
          {isExpanded ? 'Hide Tracks' : 'Select Soundscape'}
        </button>
      </div>

      {/* Track Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {AMBIENT_TRACKS.map((track) => {
          const isCurrentActive = ambientState.activeTrackId === track.id && ambientState.isPlaying;

          return (
            <button
              key={track.id}
              onClick={() => handleTogglePlay(track.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all active:scale-95 ${
                isCurrentActive
                  ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 shadow-sm'
                  : 'bg-surface border-border text-text hover:border-teal-500/30'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-base shrink-0">{track.icon}</span>
                <div className="truncate">
                  <strong className="text-xs font-bold block truncate">{track.name}</strong>
                  <span className="text-[9px] text-muted block font-arabic truncate">{track.arabicName}</span>
                </div>
              </div>

              <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center text-xs shrink-0 ml-1">
                {isCurrentActive ? <Pause size={12} /> : <Play size={12} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls & Timer Bar */}
      {ambientState.isPlaying && (
        <div className="flex items-center justify-between bg-surface/80 p-2 rounded-xl border border-border text-xs text-subtext pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-teal-400">Timer:</span>
            <span className="text-xs font-mono font-black text-text">
              {formatTimer(ambientState.remainingSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => ambientAudioService.setTimer(5)}
              className="px-2 py-0.5 rounded bg-card border border-border text-[10px] font-bold hover:text-text"
            >
              5m
            </button>
            <button
              onClick={() => ambientAudioService.setTimer(15)}
              className="px-2 py-0.5 rounded bg-card border border-border text-[10px] font-bold hover:text-text"
            >
              15m
            </button>
            <button
              onClick={() => ambientAudioService.setTimer(30)}
              className="px-2 py-0.5 rounded bg-card border border-border text-[10px] font-bold hover:text-text"
            >
              30m
            </button>
            <button
              onClick={() => ambientAudioService.pause()}
              className="px-2.5 py-0.5 rounded bg-danger/10 text-danger text-[10px] font-bold"
            >
              Stop
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
