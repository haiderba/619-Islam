import React, { useState } from 'react';
import { Droplets } from 'lucide-react';

interface VirtualJannahGardenProps {
  totalDeeds: number;
}

export const VirtualJannahGarden: React.FC<VirtualJannahGardenProps> = ({ totalDeeds }) => {
  const [isWatering, setIsWatering] = useState(false);
  const [blessedMessage, setBlessedMessage] = useState<string | null>(null);

  const treeLevel = Math.min(10, Math.max(1, Math.floor(totalDeeds / 10) + 1));
  const leavesCount = Math.min(24, treeLevel * 3);

  const handleWaterTree = () => {
    setIsWatering(true);
    if (navigator.vibrate) navigator.vibrate(30);

    const blessings = [
      'SubhanAllah! 🌴 A palm tree is planted for you in Jannah.',
      'Alhamdulillah! 🌿 May your good deeds shade you on the Day of Judgment.',
      'Allahu Akbar! ✨ Every prayer waters the tree of Iman.',
    ];
    setBlessedMessage(blessings[Math.floor(Math.random() * blessings.length)]);

    setTimeout(() => {
      setIsWatering(false);
    }, 1500);

    setTimeout(() => {
      setBlessedMessage(null);
    }, 4000);
  };

  return (
    <div className="bg-gradient-to-br from-[#062428] via-[#093539] to-[#041a1c] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              🌱 Virtual Jannah Garden
            </span>
            <span className="text-xs text-white/60 font-mono">Stage {treeLevel} Blossom</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            The Ummah Tree of Good Deeds
          </h3>
          <p className="text-xs text-emerald-100/80 max-w-md">
            Every prayer fulfilled, ayah recited, and dhikr uttered by believers blossoms this tree with leaves and golden fruits.
          </p>
        </div>

        <button
          onClick={handleWaterTree}
          disabled={isWatering}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-2xl text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Droplets size={14} className={isWatering ? 'animate-bounce text-blue-900' : ''} />
          <span>{isWatering ? 'Watering Tree...' : 'Water with Dhikr'}</span>
        </button>
      </div>

      {/* Interactive Visual Tree Canvas */}
      <div className="relative py-4 flex flex-col items-center justify-center bg-black/30 rounded-2xl border border-white/10 overflow-hidden">
        {/* Animated Watering Drop */}
        {isWatering && (
          <div className="absolute top-2 animate-bounce text-2xl z-20">
            💧
          </div>
        )}

        {/* Tree SVG */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {/* Trunk */}
            <path d="M46,85 Q50,55 48,45 Q52,55 54,85 Z" fill="#8B5A2B" />
            <path d="M48,55 Q35,45 28,40" stroke="#8B5A2B" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M52,50 Q65,42 72,38" stroke="#8B5A2B" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Foliage Circles */}
            <circle cx="50" cy="30" r="22" fill="#10B981" opacity="0.85" className="animate-pulse" style={{ animationDuration: '3s' }} />
            <circle cx="36" cy="38" r="16" fill="#059669" opacity="0.9" />
            <circle cx="64" cy="36" r="16" fill="#34D399" opacity="0.9" />
            <circle cx="50" cy="22" r="14" fill="#6EE7B7" opacity="0.85" />

            {/* Golden Fruits (Blossoms) */}
            {Array.from({ length: Math.min(8, treeLevel) }).map((_, i) => {
              const angles = [0, 45, 90, 135, 180, 225, 270, 315];
              const angle = angles[i] * (Math.PI / 180);
              const cx = 50 + 14 * Math.cos(angle);
              const cy = 30 + 14 * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="#F59E0B"
                  stroke="#FEF3C7"
                  strokeWidth="1"
                  className="animate-ping"
                  style={{ animationDuration: `${2 + i * 0.3}s` }}
                />
              );
            })}
          </svg>
        </div>

        <div className="text-center space-y-0.5 pt-1">
          <span className="text-[11px] font-bold text-emerald-300">
            🌿 {leavesCount} Radiant Leaves & {Math.min(8, treeLevel)} Golden Fruits of Sadaqah Jariyah
          </span>
          {blessedMessage && (
            <p className="text-xs font-bold text-amber-300 animate-in fade-in">
              {blessedMessage}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
