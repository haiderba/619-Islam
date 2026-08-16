import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, FastForward } from 'lucide-react';

interface SplashScreenProps {
  message?: string;
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ message, onComplete }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser blocked unmuted autoplay, fallback to muted autoplay
        console.log('Autoplay with sound prevented by browser policy; starting muted.');
        video.muted = true;
        setIsMuted(true);
        video.play().catch(e => console.warn('Video play failed', e));
      });
    }
  }, []);

  const handleVideoEnded = () => {
    setHasEnded(true);
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 350);
    }
  };

  const handleSkip = () => {
    setHasEnded(true);
    if (onComplete) {
      onComplete();
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div 
      onClick={toggleSound}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#062426] overflow-hidden select-none transition-opacity duration-500 ${
        hasEnded ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 🕌 Majestic Glowing Mosque Atmospheric Background */}
      <img
        src="/splash-mosque-bg.jpg"
        alt="619 Islam Mosque Background"
        className="absolute inset-0 w-full h-full object-cover object-center animate-in fade-in duration-700"
      />

      {/* Atmospheric Dark Tint & Golden Ambient Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Floating Action Controls: Sound & Skip */}
      <div className="relative z-20 w-full p-4 pt-6 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={toggleSound}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 text-xs font-bold shadow-xl active:scale-95 transition-all"
        >
          {isMuted ? (
            <>
              <VolumeX size={14} className="text-amber-400" />
              <span>Tap for Sound</span>
            </>
          ) : (
            <>
              <Volume2 size={14} className="text-emerald-400" />
              <span>Sound On</span>
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-amber-300 border border-amber-500/35 text-xs font-black shadow-xl hover:bg-black/85 active:scale-95 transition-all"
        >
          <span>Skip</span>
          <FastForward size={13} />
        </button>
      </div>

      {/* 🌟 Center: Logo Video with Original Natural Dimensions & Radiant Golden Glow */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-4">
        {/* Outer Glow Halo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-emerald-500/30 to-amber-500/30 rounded-3xl blur-xl opacity-75 animate-pulse pointer-events-none" />

          {/* Video Container in Original Logo Proportions */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/40 bg-black/60 backdrop-blur-md ring-2 ring-amber-400/20">
            <video
              ref={videoRef}
              src="/splash-video.mp4"
              playsInline
              autoPlay
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title underneath the glowing logo video */}
        <div className="text-center mt-5 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black font-arabic text-amber-300 tracking-wide drop-shadow-md">
            ٦١٩ إِسْلَام
          </h1>
          <p className="text-xs text-white/80 font-medium tracking-wider drop-shadow">
            Daily Islamic Habit & Quran Companion
          </p>
        </div>
      </div>

      {/* Bottom Loading / Subtitle Indicator */}
      <div className="relative z-20 pb-10 flex flex-col items-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
        {message && (
          <p className="text-amber-200/90 text-[10px] font-bold tracking-widest uppercase drop-shadow-md">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
