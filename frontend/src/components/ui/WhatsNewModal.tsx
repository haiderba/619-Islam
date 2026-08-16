import React from 'react';
import { LATEST_RELEASE } from '../../config/changelog';
import { 
  Sparkles, X, Check, KeyRound, Volume2, 
  DownloadCloud, Zap, ShieldCheck, Library, BookOpen, Bookmark, Calendar, Sun,
  Smartphone, RefreshCw, Play, Bell
} from 'lucide-react';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Play: <Play size={20} className="text-amber-400 fill-amber-400/30" />,
  Smartphone: <Smartphone size={20} className="text-emerald-400" />,
  RefreshCw: <RefreshCw size={20} className="text-amber-400" />,
  Bell: <Bell size={20} className="text-sky-400" />,
  KeyRound: <KeyRound size={20} className="text-amber-400" />,
  Volume2: <Volume2 size={20} className="text-primary" />,
  DownloadCloud: <DownloadCloud size={20} className="text-sky-400" />,
  Sparkles: <Sparkles size={20} className="text-emerald-400" />,
  Zap: <Zap size={20} className="text-amber-400" />,
  ShieldCheck: <ShieldCheck size={20} className="text-primary" />,
  Library: <Library size={20} className="text-amber-400" />,
  BookOpen: <BookOpen size={20} className="text-emerald-400" />,
  Bookmark: <Bookmark size={20} className="text-emerald-400" />,
  Calendar: <Calendar size={20} className="text-sky-400" />,
  Sun: <Sun size={20} className="text-amber-400" />,
};

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-surface hover:bg-border text-subtext hover:text-text transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-text tracking-tight">{LATEST_RELEASE.headline}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                v{LATEST_RELEASE.version}
              </span>
            </div>
            <p className="text-xs text-subtext mt-0.5">Here is what we've improved for your spiritual journey.</p>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3.5 my-5 max-h-[55vh] overflow-y-auto pr-1">
          {LATEST_RELEASE.features.map((feature, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-2xl bg-surface/70 border border-border/70 flex items-start gap-3.5 hover:border-primary/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-background/80 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {ICON_MAP[feature.icon] || <Sparkles size={18} className="text-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-text">{feature.title}</h4>
                  {feature.badge && (
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                      feature.badge === 'New' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-subtext leading-relaxed mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
        >
          <Check size={18} />
          <span>Explore New Features</span>
        </button>

      </div>
    </div>
  );
};

export default WhatsNewModal;
