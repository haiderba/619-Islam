import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  X, 
  Download, 
  Check, 
  Trash2, 
  Loader2, 
  Search, 
  Radio, 
  CloudOff
} from 'lucide-react';
import { audioOfflineStorageService, OfflineStorageStats } from '../../services/audioOfflineStorageService';

interface OfflineAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioUpdated?: () => void;
}

const TOP_TRAVEL_SURAHS = [
  { id: 67, name: 'Al-Mulk', arabic: 'الملك', desc: 'Grave Protection' },
  { id: 55, name: 'Ar-Rahman', arabic: 'الرحمن', desc: 'Divine Peace & Mercy' },
  { id: 36, name: 'Yaseen', arabic: 'يس', desc: 'Heart of Quran' },
  { id: 56, name: 'Al-Waqi\'ah', arabic: 'الواقعة', desc: 'Protection from Poverty' },
  { id: 18, name: 'Al-Kahf', arabic: 'الكهف', desc: 'Light & Serenity' },
  { id: 19, name: 'Maryam', arabic: 'مريم', desc: 'Hope & Comfort' },
  { id: 76, name: 'Al-Insan', arabic: 'الإنسان', desc: 'Paradise Descriptions' },
  { id: 112, name: 'Al-Ikhlas & Mu\'awwidhatayn', arabic: 'الإخلاص', desc: 'Protection Shield' },
];

const AVAILABLE_QARIS = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', serverKey: 'ar.alafasy' },
  { id: 'abdulbasit', name: 'Abdul Basit (Murattal)', serverKey: 'ar.abdulbasitmurattal' },
  { id: 'minshawi', name: 'Muhammad Siddiq Al-Minshawi', serverKey: 'ar.minshawi' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', serverKey: 'ar.saadalghamdi' },
  { id: 'dosari', name: 'Yasser Al-Dosari', serverKey: 'ar.dussary' },
];

export const OfflineAudioModal: React.FC<OfflineAudioModalProps> = ({ isOpen, onClose, onAudioUpdated }) => {
  const [selectedQari, setSelectedQari] = useState(AVAILABLE_QARIS[0]);
  const [stats, setStats] = useState<OfflineStorageStats>({ totalSurahs: 0, totalSizeBytes: 0, downloadedKeys: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingMap, setDownloadingMap] = useState<Record<number, number>>({});
  const [isDownloadingFlightPack, setIsDownloadingFlightPack] = useState(false);
  const [flightPackProgress, setFlightPackProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, selectedQari]);

  const loadStats = async () => {
    const s = await audioOfflineStorageService.getStorageStats();
    setStats(s);
  };

  if (!isOpen) return null;

  const isDownloaded = (surahNum: number) => {
    const key = audioOfflineStorageService.getAudioKey(surahNum, selectedQari.serverKey);
    return stats.downloadedKeys.includes(key);
  };

  const handleDownloadSingle = async (surahNum: number, surahName: string) => {
    setDownloadingMap(prev => ({ ...prev, [surahNum]: 10 }));
    
    await audioOfflineStorageService.downloadSurahAudio(
      surahNum,
      surahName,
      selectedQari.serverKey,
      selectedQari.name,
      (percent) => {
        setDownloadingMap(prev => ({ ...prev, [surahNum]: percent }));
      }
    );

    setDownloadingMap(prev => {
      const next = { ...prev };
      delete next[surahNum];
      return next;
    });

    await loadStats();
    if (onAudioUpdated) onAudioUpdated();
  };

  const handleDeleteSingle = async (surahNum: number) => {
    await audioOfflineStorageService.deleteSurahAudio(surahNum, selectedQari.serverKey);
    await loadStats();
    if (onAudioUpdated) onAudioUpdated();
  };

  const handleDownloadFlightPack = async () => {
    setIsDownloadingFlightPack(true);
    setFlightPackProgress(0);

    const total = TOP_TRAVEL_SURAHS.length;
    for (let i = 0; i < total; i++) {
      const s = TOP_TRAVEL_SURAHS[i];
      const key = audioOfflineStorageService.getAudioKey(s.id, selectedQari.serverKey);
      if (!stats.downloadedKeys.includes(key)) {
        await audioOfflineStorageService.downloadSurahAudio(
          s.id,
          s.name,
          selectedQari.serverKey,
          selectedQari.name
        );
      }
      setFlightPackProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsDownloadingFlightPack(false);
    await loadStats();
    if (onAudioUpdated) onAudioUpdated();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all offline audio files from this device?')) {
      await audioOfflineStorageService.clearAllOfflineAudio();
      await loadStats();
      if (onAudioUpdated) onAudioUpdated();
    }
  };

  const formatMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const filteredSurahs = TOP_TRAVEL_SURAHS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-teal-700 to-emerald-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-white/15 backdrop-blur-sm">
              <Plane className="w-5 h-5 text-sky-200" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Offline Audio Downloader</h2>
              <p className="text-white/80 text-xs font-medium">Save Quran audio for airplanes, travel & zero data</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">

          {/* ✈️ 1-Tap Flight Travel Pack Banner */}
          <div className="bg-gradient-to-br from-sky-500/10 via-card to-emerald-500/10 border border-sky-500/30 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✈️</span>
                <div>
                  <h3 className="text-sm font-black text-text">1-Tap Flight Pack</h3>
                  <p className="text-[11px] text-subtext">8 Essential peaceful Surahs for airplanes & flights</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                Recommended
              </span>
            </div>

            {isDownloadingFlightPack ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-bold text-sky-400">
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    <span>Downloading Flight Bundle...</span>
                  </span>
                  <span>{flightPackProgress}%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${flightPackProgress}%` }} />
                </div>
              </div>
            ) : (
              <button
                onClick={handleDownloadFlightPack}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-black text-xs font-black shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} className="stroke-[2.5]" />
                <span>Download Complete Flight Pack (~35 MB)</span>
              </button>
            )}
          </div>

          {/* 🎙️ Qari Selector & Storage Meter */}
          <div className="bg-surface/70 border border-border/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1.5">
                <Radio size={14} className="text-primary" />
                <span>Reciter (Qari) Voice</span>
              </span>
              <span className="text-[10px] font-bold text-subtext">
                {stats.totalSurahs} Saved ({formatMB(stats.totalSizeBytes)} MB)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {AVAILABLE_QARIS.map(q => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQari(q)}
                  className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                    selectedQari.id === q.id
                      ? 'bg-primary/15 text-primary border-primary/40 shadow-sm'
                      : 'bg-card text-subtext border-border'
                  }`}
                >
                  <span className="truncate block">{q.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 📖 Surah List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black text-text">Essential Travel Surahs</h4>
              {stats.totalSurahs > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-bold text-danger hover:underline flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  <span>Purge Audio Storage</span>
                </button>
              )}
            </div>

            {/* Quick Filter */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext" />
              <input
                type="text"
                placeholder="Search travel Surahs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border/80 rounded-xl text-xs text-text placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              {filteredSurahs.map(surah => {
                const downloaded = isDownloaded(surah.id);
                const isDownloading = downloadingMap[surah.id] !== undefined;
                const progress = downloadingMap[surah.id] || 0;

                return (
                  <div 
                    key={surah.id}
                    className="p-3 bg-card border border-border/80 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-surface text-primary font-bold text-xs flex items-center justify-center border border-border shrink-0">
                        {surah.id}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-text truncate">Surah {surah.name}</h5>
                          <span className="text-[10px] font-arabic text-amber-500 font-bold shrink-0">({surah.arabic})</span>
                        </div>
                        <span className="text-[10px] text-subtext truncate block">{surah.desc}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isDownloading ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[11px] font-bold">
                          <Loader2 size={12} className="animate-spin" />
                          <span>{progress}%</span>
                        </div>
                      ) : downloaded ? (
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black flex items-center gap-1">
                            <Check size={12} />
                            <span>Saved Offline</span>
                          </span>
                          <button
                            onClick={() => handleDeleteSingle(surah.id)}
                            className="p-1 text-muted hover:text-danger transition-colors rounded-lg"
                            title="Delete from device"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownloadSingle(surah.id, surah.name)}
                          className="p-2 rounded-xl bg-surface hover:bg-primary/15 hover:text-primary border border-border text-subtext text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                          title="Save for offline travel"
                        >
                          <Download size={13} />
                          <span className="text-[10px]">Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-surface/50 border-t border-border flex justify-between items-center">
          <span className="text-[10px] text-subtext flex items-center gap-1">
            <CloudOff size={12} className="text-primary" />
            <span>Plays anywhere with zero Wi-Fi</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
