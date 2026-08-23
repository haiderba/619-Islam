import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DUAS_DATABASE, 
  DUA_CATEGORIES, 
  DuaItem 
} from '../utils/duasData';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2, 
  Copy, 
  Check, 
  Bookmark, 
  X, 
  RotateCcw, 
  Info
} from 'lucide-react';

export const Duas: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Repetition counters for interactive tap-counting
  const [counters, setCounters] = useState<Record<string, number>>({});

  // Bookmarked / Saved Dua IDs in local storage
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('619_bookmarked_duas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('619_bookmarked_duas', JSON.stringify(savedIds));
  }, [savedIds]);

  const toggleBookmark = (id: string) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const incrementCount = (id: string, max: number) => {
    setCounters(prev => ({
      ...prev,
      [id]: Math.min(max, (prev[id] || 0) + 1)
    }));
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const resetCount = (id: string) => {
    setCounters(prev => ({
      ...prev,
      [id]: 0
    }));
  };

  const handleCopyDua = (dua: DuaItem) => {
    const text = `🤲 ${dua.title}\n\n${dua.arabic}\n\n"${dua.english}"\n\n${dua.urdu}\n\n• Reference: ${dua.reference}\n• via 619 Islam (Hisnul Muslim)`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Duas
  const filteredDuas = DUAS_DATABASE.filter(dua => {
    if (selectedCategory === 'favorites') {
      if (!savedIds.includes(dua.id)) return false;
    } else if (selectedCategory !== 'all') {
      if (dua.category !== selectedCategory) return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    return (
      dua.title.toLowerCase().includes(query) ||
      dua.english.toLowerCase().includes(query) ||
      dua.arabic.includes(query) ||
      dua.urdu.includes(query) ||
      dua.transliteration.toLowerCase().includes(query) ||
      dua.reference.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-6xl mx-auto w-full">
      {/* ── Top Header Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          Hisnul Muslim • حِصْنُ الْمُسْلِمِ
        </span>
      </div>

      {/* ── Hero Master Banner ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={13} className="text-amber-400" />
            <span>Daily Supplications & Azkar</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-arabic">
            حِصْنُ الْمُسْلِمِ مِن أَذْكَارِ الْكِتَابِ وَالسُّنَّةِ
          </h1>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            Fortress of the Muslim: Authentic morning, evening, sleep, travel, and Quranic Rabbana supplications.
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search by keyword (e.g. sleep, rain, anxiety, parents)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-amber-500/60 shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Category Filter Chips ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
        {DUA_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all' 
            ? DUAS_DATABASE.length 
            : cat.id === 'favorites' 
              ? savedIds.length 
              : DUAS_DATABASE.filter(d => d.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-card border border-border text-subtext hover:text-text'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-surface text-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Duas List ── */}
      {filteredDuas.length === 0 ? (
        <div className="py-12 text-center bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-6 space-y-2">
          <BookOpen size={28} className="text-muted mx-auto" />
          <h3 className="text-sm font-bold text-text">
            {selectedCategory === 'favorites' ? 'No Saved Duas Yet' : 'No Duas Found'}
          </h3>
          <p className="text-xs text-subtext">
            {selectedCategory === 'favorites' 
              ? 'Tap the bookmark star icon on any Dua to save it here for quick daily access.' 
              : 'Try changing your search terms or select another category.'}
          </p>
        </div>
      ) : (
        /* ── Duas Cards List ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDuas.map((dua) => {
            const currentCount = counters[dua.id] || 0;
            const isCompleted = currentCount >= dua.repeat;
            const isSaved = savedIds.includes(dua.id);

            return (
              <div
                key={dua.id}
                className={`bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border rounded-3xl p-5 shadow-sm space-y-3.5 transition-all ${
                  isCompleted 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-border/80 dark:border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                {/* Header: Title, Category & Bookmark Button */}
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-0.5">
                      {dua.categoryTitle}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-text leading-snug">
                      {dua.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleBookmark(dua.id)}
                      className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                        isSaved
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-surface hover:bg-card border-border text-muted hover:text-amber-400'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save to Favorites'}
                    >
                      <Bookmark size={14} className={isSaved ? 'fill-amber-400' : ''} />
                    </button>

                    <button
                      onClick={() => handleCopyDua(dua)}
                      className="p-1.5 rounded-xl bg-surface hover:bg-card border border-border text-subtext hover:text-text active:scale-95 transition-all"
                      title="Copy / Share Dua"
                    >
                      {copiedId === dua.id ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Calligraphy */}
                <p className="text-xl sm:text-2xl font-black font-arabic text-amber-400 text-right leading-loose py-1" dir="rtl">
                  {dua.arabic}
                </p>

                {/* Transliteration */}
                <p className="text-xs sm:text-sm font-medium text-amber-300/90 italic leading-relaxed">
                  {dua.transliteration}
                </p>

                {/* English Translation */}
                <p className="text-xs sm:text-sm text-text font-medium leading-relaxed">
                  "{dua.english}"
                </p>

                {/* Urdu Translation */}
                <p className="text-sm sm:text-base font-urdu text-right text-emerald-600 dark:text-emerald-300 font-medium leading-[2.2]" dir="rtl">
                  {dua.urdu}
                </p>

                {/* Virtue Box if available */}
                {dua.virtue && (
                  <div className="bg-surface/70 dark:bg-black/30 border border-border/80 rounded-2xl p-3 text-[11px] text-subtext leading-relaxed flex items-start gap-2">
                    <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text block mb-0.5">Spiritual Virtue:</strong>
                      {dua.virtue}
                    </div>
                  </div>
                )}

                {/* Bottom Bar: Source & Interactive Counter */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider truncate max-w-[150px]">
                    {dua.reference}
                  </span>

                  <div className="flex items-center gap-2">
                    {dua.repeat > 1 && (
                      <button
                        onClick={() => resetCount(dua.id)}
                        className="p-2 rounded-xl bg-surface hover:bg-card border border-border text-subtext hover:text-text active:scale-95 transition-all"
                        title="Reset Counter"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => incrementCount(dua.id, dua.repeat)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>{dua.repeat > 1 ? `Completed (${currentCount}/${dua.repeat}x)` : 'Recited'}</span>
                        </>
                      ) : (
                        <>
                          <span>{dua.repeat > 1 ? `Count (${currentCount}/${dua.repeat}x)` : 'Mark Read'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Duas;
