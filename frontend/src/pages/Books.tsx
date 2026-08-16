import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Heart, 
  Bookmark, 
  ChevronRight, 
  Clock, 
  X, 
  Library,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { BookSummary, Tradition, Category, UserLibraryData } from '../types/books';

const Books: React.FC = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState<BookSummary[]>([]);
  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userLibrary, setUserLibrary] = useState<UserLibraryData | null>(null);

  const [selectedTradition, setSelectedTradition] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completenessFilter, setCompletenessFilter] = useState<'all' | 'complete' | 'partial' | 'multi_volume'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial traditions, categories, and preferences
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [tradList, catList, pref, lib] = await Promise.all([
        booksApi.getTraditions(),
        booksApi.getCategories(),
        booksApi.getUserPreferences(),
        booksApi.getUserLibrary()
      ]);

      setTraditions(tradList);
      setCategories(catList);
      setUserLibrary(lib);

      const savedTrad = pref?.preferred_tradition_slug || localStorage.getItem('619_book_pref_tradition') || 'all';
      setSelectedTradition(savedTrad);

      const initialBooks = await booksApi.getBooks({
        tradition: savedTrad,
        category: 'all'
      });
      setBooks(initialBooks);
      setLoading(false);
    };

    init();
  }, []);

  // Handle Search & Filter changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await booksApi.getBooks({
        tradition: selectedTradition,
        category: selectedCategory,
        search: searchQuery
      });
      setBooks(res);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedTradition, selectedCategory, searchQuery]);

  const handleSelectTradition = async (slug: string) => {
    setSelectedTradition(slug);
    await booksApi.updateUserPreferences({ preferred_tradition_slug: slug });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation();
    const newStatus = await booksApi.toggleFavorite(bookId);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, is_favorite: newStatus } : b));
  };

  const filteredBooks = useMemo(() => {
    if (completenessFilter === 'all') return books;
    return books.filter(b => {
      const comp = b.completeness || (b.total_chapters > 5 ? 'complete' : 'partial');
      return comp === completenessFilter;
    });
  }, [books, completenessFilter]);

  const parseReferenceQuery = (query: string) => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return null;
    const match = trimmed.match(/^([a-z\s\-]+?)\s*(?:vol(?:ume)?\s*(\d+))?\s*(?:p(?:age)?|chap(?:ter)?|:)?\s*(\d+)?$/i);
    if (match && match[1]) {
      return {
        bookHint: match[1].trim(),
        volume: match[2] ? parseInt(match[2]) : undefined,
        chapterOrPage: match[3] ? parseInt(match[3]) : undefined
      };
    }
    return null;
  };

  const refParsed = parseReferenceQuery(searchQuery);

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto space-y-5">
      {/* ── 📱 HEADER & STICKY SEARCH BAR (Mobile-First) ── */}
      <header className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Library size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-text tracking-tight">Islamic Library</h1>
              <p className="text-[11px] text-subtext">Classical Books, Hadith & Fiqh</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/library')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-border/60 border border-border rounded-xl text-xs font-bold text-text transition-all active:scale-95"
          >
            <Bookmark size={13} className="text-amber-500" />
            <span>My Shelf</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext" />
          <input
            type="text"
            placeholder="Search books, authors or reference (e.g. Kafi 1:2)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border hover:border-primary/40 focus:border-primary rounded-2xl pl-10 pr-9 py-3 text-xs text-text placeholder-subtext transition-colors shadow-sm outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-subtext hover:text-text rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Reference Direct Jump Badge */}
        {refParsed && refParsed.chapterOrPage && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-400 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="shrink-0" />
              <span>Jump to <strong>{refParsed.bookHint}</strong> {refParsed.volume ? `Vol ${refParsed.volume} ` : ''}Chapter {refParsed.chapterOrPage}</span>
            </div>
            <span className="font-bold text-[10px] uppercase tracking-wider underline">Direct Reference</span>
          </div>
        )}
      </header>

      {/* ── 📖 CONTINUE READING (Horizontal Snap Carousel) ── */}
      {userLibrary && userLibrary.continue_reading.length > 0 && !searchQuery && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-text flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              <span>Continue Reading</span>
            </h3>
            <span className="text-[10px] text-muted font-bold">
              {userLibrary.continue_reading.length} Active
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {userLibrary.continue_reading.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/books/${b.id}/read?chapter=${b.last_chapter || 1}`)}
                className="w-[280px] shrink-0 snap-start bg-gradient-to-br from-card to-surface border border-border hover:border-primary/40 rounded-3xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-18 shrink-0 rounded-xl bg-gradient-to-br from-[#062426] to-[#041c1d] border border-amber-500/30 flex flex-col items-center justify-center text-amber-400 shadow-sm p-1.5 text-center">
                    <BookOpen size={18} className="mb-0.5" />
                    <span className="text-[8px] font-arabic font-bold truncate max-w-full text-amber-200">
                      {b.title_ar || b.title}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Chapter {b.last_chapter || 1}
                    </span>
                    <h4 className="text-xs font-black text-text truncate mt-1 group-hover:text-primary transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-[10px] text-subtext truncate">
                      {b.author?.name || 'Classical Scholar'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-subtext font-medium">Progress</span>
                    <span className="font-bold text-primary">{b.progress_percent || 0}%</span>
                  </div>
                  <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(b.progress_percent || 5, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 🏷️ MADHHAB / TRADITION FILTER CHIPS (Horizontal Scroll) ── */}
      <section className="space-y-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleSelectTradition('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              selectedTradition === 'all'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-card border border-border text-subtext hover:text-text'
            }`}
          >
            All Traditions
          </button>
          {traditions.map((t) => (
            <button
              key={t.slug}
              onClick={() => handleSelectTradition(t.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                selectedTradition === t.slug
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-card border border-border text-subtext hover:text-text'
              }`}
            >
              <span>{t.name}</span>
              {t.name_ar && <span className="text-[10px] font-arabic opacity-75">({t.name_ar})</span>}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Format & Completeness */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-muted font-bold flex items-center gap-1 pl-1">
              <SlidersHorizontal size={11} />
              <span>Format:</span>
            </span>
            {(['all', 'complete', 'partial', 'multi_volume'] as const).map((comp) => (
              <button
                key={comp}
                onClick={() => setCompletenessFilter(comp)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  completenessFilter === comp
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-subtext hover:text-text bg-surface'
                }`}
              >
                {comp === 'all' ? 'All' : comp === 'complete' ? 'Complete' : comp === 'partial' ? 'Selections' : 'Multi-Vol'}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                selectedCategory === 'all' ? 'bg-amber-500/20 text-amber-300' : 'text-muted'
              }`}
            >
              All Topics
            </button>
            {categories.slice(0, 3).map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                  selectedCategory === c.slug ? 'bg-amber-500/20 text-amber-300' : 'text-muted hover:text-subtext'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 📚 MAIN BOOK CATALOG CARDS (Mobile-First Generous Layout) ── */}
      <main className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted">
            {selectedTradition === 'all' ? 'Featured Classical Works' : `${traditions.find(t => t.slug === selectedTradition)?.name || 'Tradition'} Collection`}
          </h2>
          <span className="text-xs font-bold text-subtext">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card border border-border p-4 rounded-3xl animate-pulse h-32" />
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-card border border-border p-8 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-border text-muted flex items-center justify-center mx-auto">
              <BookOpen size={24} />
            </div>
            <h4 className="text-sm font-bold text-text">No Books Found</h4>
            <p className="text-xs text-subtext max-w-xs mx-auto">
              Try switching your tradition filter or search for a different title or author.
            </p>
            <button
              onClick={() => {
                setSelectedTradition('all');
                setSearchQuery('');
                setCompletenessFilter('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredBooks.map((b) => {
            const isComplete = b.completeness === 'complete' || b.total_chapters >= 10;
            const isMultiVol = b.completeness === 'multi_volume' || (b.total_volumes && b.total_volumes > 1);

            return (
              <div
                key={b.id}
                onClick={() => navigate(`/books/${b.id}`)}
                className="bg-card hover:bg-surface border border-border hover:border-primary/40 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 items-center group active:scale-[0.99]"
              >
                {/* Book Miniature Cover with Calligraphy Ribbon */}
                <div className="w-18 h-26 shrink-0 rounded-2xl bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 flex flex-col items-center justify-between p-2 text-center relative overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                  <div className="w-full flex justify-between items-center text-[9px] text-amber-400 font-bold opacity-80">
                    <span>{b.tradition?.slug?.slice(0, 3)?.toUpperCase() || 'ISL'}</span>
                    <span>📖</span>
                  </div>

                  <span className="font-arabic text-amber-200 text-xs font-bold leading-tight line-clamp-2 my-auto drop-shadow">
                    {b.title_ar || b.title}
                  </span>

                  <span className="text-[8px] font-sans text-amber-300 font-bold opacity-90 truncate max-w-full">
                    {b.language?.toUpperCase() || 'AR/EN'}
                  </span>
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    {/* Tradition Badge + Completeness Badge */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {b.tradition?.name || 'General'}
                      </span>
                      
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isComplete
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : isMultiVol
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {isComplete ? 'Complete' : isMultiVol ? `${b.total_volumes || 2} Vols` : 'Selections'}
                      </span>
                    </div>

                    {/* Favorite Heart */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, b.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        b.is_favorite ? 'text-rose-500 bg-rose-500/10' : 'text-muted hover:text-rose-400'
                      }`}
                    >
                      <Heart size={15} fill={b.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-text leading-tight group-hover:text-primary transition-colors line-clamp-1">
                      {b.title}
                    </h3>
                    <p className="text-xs text-subtext font-medium truncate mt-0.5">
                      {b.author?.name || 'Classical Islamic Scholar'}
                    </p>
                  </div>

                  {b.description && (
                    <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  )}

                  {/* Bottom Meta Row */}
                  <div className="flex items-center justify-between text-[10px] text-subtext pt-1 border-t border-border/50">
                    <span>{b.total_chapters} Chapters</span>
                    <div className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Explore</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Books;
