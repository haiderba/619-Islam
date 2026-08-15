import React from 'react';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#0d2b2c] overflow-hidden select-none">
      {/* Full Background Splash Image */}
      <img
        src="/splash.png"
        alt="619 Islam Splash Screen"
        className="absolute inset-0 w-full h-full object-cover object-center animate-in fade-in duration-500"
      />

      {/* Subtle overlay gradient to ensure loading indicator is always readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

      {/* Top spacer */}
      <div className="relative z-10 pt-12" />

      {/* Bottom Loading Indicator */}
      <div className="relative z-10 pb-16 flex flex-col items-center gap-3">
        {/* Glowing pulsating circle */}
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
        </div>

        {message && (
          <p className="text-amber-200/80 text-xs font-medium tracking-wider uppercase animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
