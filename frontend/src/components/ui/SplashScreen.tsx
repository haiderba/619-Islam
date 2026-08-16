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
      }, 400);
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
      {/* Background Video Player */}
      <video
        ref={videoRef}
        src="/splash-video.mp4"
        playsInline
        autoPlay
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Subtle Dark Vignette for contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Top Floating Controls: Sound Toggle & Skip */}
      <div className="relative z-20 w-full p-4 pt-6 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={toggleSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-bold shadow-lg active:scale-95 transition-all"
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
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 text-xs font-black shadow-lg hover:bg-black/80 active:scale-95 transition-all"
        >
          <span>Skip</span>
          <FastForward size={13} />
        </button>
      </div>

      {/* Bottom Loading / Subtitle Indicator */}
      <div className="relative z-20 pb-10 flex flex-col items-center gap-2">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
        {message && (
          <p className="text-amber-200/90 text-[11px] font-bold tracking-wider uppercase drop-shadow-md">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
