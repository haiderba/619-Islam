import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HADITH_DATABASE, 
  HADITH_COLLECTIONS, 
  HADITH_TOPICS, 
  HadithItem 
} from '../utils/hadithData';
import { 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ShieldCheck
} from 'lucide-react';

export const HadithExplorer: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');

  // Pagination (5 Hadiths per Page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCollection, selectedTopic]);

  // Filtered Hadiths
  const filteredHadiths = HADITH_DATABASE.filter(h => {
    const matchesCollection = selectedCollection === 'all' || h.collection === selectedCollection;
    const matchesTopic = selectedTopic === 'all' || h.topic === selectedTopic;
    const matchesSearch = 
      h.english.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      h.arabic.includes(searchQuery.trim()) ||
      h.urdu.includes(searchQuery.trim()) ||
      h.narrator.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      h.chapter.toLowerCase().includes(searchQuery.toLowerCase().trim());

    return matchesCollection && matchesTopic && matchesSearch;
  });

  const totalPages = Math.ceil(filteredHadiths.length / ITEMS_PER_PAGE) || 1;
  const paginatedHadiths = filteredHadiths.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopyHadith = (h: HadithItem) => {
    const text = `📜 Hadith - ${h.collection} #${h.hadithNumber}\nNarrated by: ${h.narrator}\n\n"${h.english}"\n\n${h.arabic}\n\n• Grade: ${h.grade} • via 619 Islam`;
    navigator.clipboard.writeText(text);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-5xl mx-auto w-full">
      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          Kutub al-Sittah
        </span>
      </div>

      {/* ── Hero Master Banner ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={13} className="text-amber-400" />
            <span>Prophetic Wisdom • Ḥadīth</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 font-arabic">
            أَحَادِيثُ النَّبِيِّ ﷺ
          </h1>
          <p className="text-xs text-white/80 mt-1 max-w-sm leading-relaxed">
            Explore authentic sayings and teachings of Prophet Muhammad ﷺ verified by classical Hadith scholars.
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search by topic, keyword, or narrator..."
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

      {/* ── Collection Horizontal Selector ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 scrollbar-none text-xs">
        {HADITH_COLLECTIONS.map(col => (
          <button
            key={col.id}
            onClick={() => setSelectedCollection(col.id)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedCollection === col.id
                ? 'bg-amber-500 text-black shadow-sm'
                : 'bg-card border border-border text-subtext hover:text-text'
            }`}
          >
            {col.name}
          </button>
        ))}
      </div>

      {/* ── Topic Filter Chips ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
        {HADITH_TOPICS.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              selectedTopic === t.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-surface border border-border text-muted hover:text-subtext'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Hadith List ── */}
      <div className="space-y-3.5">
        {paginatedHadiths.map((h) => (
          <div
            key={h.id}
            className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3"
          >
            {/* Header: Book & Grade */}
            <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {h.collection} #{h.hadithNumber}
                </span>
                <span className="text-[11px] font-bold text-subtext truncate max-w-[170px]">
                  {h.chapter}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck size={11} />
                <span>{h.grade}</span>
              </div>
            </div>

            {/* Narrator */}
            <div className="text-[11px] font-bold text-muted">
              Narrated by <strong className="text-text">{h.narrator}</strong>:
            </div>

            {/* Arabic Text */}
            <p className="text-lg sm:text-xl font-black font-arabic text-amber-400 text-right leading-loose py-1" dir="rtl">
              {h.arabic}
            </p>

            {/* English Translation */}
            <p className="text-xs sm:text-sm text-text font-medium leading-relaxed italic">
              "{h.english}"
            </p>

            {/* Urdu Translation */}
            <p className="text-sm sm:text-base font-urdu text-right text-emerald-600 dark:text-emerald-300 font-medium leading-[2.2]" dir="rtl">
              {h.urdu}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-end gap-2">
              <button
                onClick={() => handleCopyHadith(h)}
                className="px-3 py-1.5 rounded-xl bg-surface hover:bg-card border border-border text-[11px] font-bold text-subtext hover:text-text flex items-center gap-1 active:scale-95 transition-all"
              >
                {copiedId === h.id ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── 📄 PAGINATION CONTROLS ── */}
      {totalPages > 1 && (
        <div className="mt-4 bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2.5">
            <span className="text-subtext font-medium text-[11px]">
              Showing <strong className="text-text font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredHadiths.length)}</strong> of <strong className="text-text font-bold">{filteredHadiths.length}</strong> Hadiths
            </span>
            
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-2xl bg-surface hover:bg-card border border-border text-text font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-1"
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={`w-7 h-7 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                    currentPage === page
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-surface border border-border text-subtext hover:text-text'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-2xl bg-surface hover:bg-card border border-border text-text font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
