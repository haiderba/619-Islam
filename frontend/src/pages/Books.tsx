import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Heart, 
  Bookmark, 
  ChevronRight, 
  Clock, 
  Check, 
  X, 
  Library,
  ArrowRight
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showTraditionModal, setShowTraditionModal] = useState<boolean>(false);

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

      // Fetch books
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
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedTradition, selectedCategory, searchQuery]);

  const handleSelectTradition = async (slug: string) => {
    setSelectedTradition(slug);
    setShowTraditionModal(false);
    await booksApi.updateUserPreferences({ preferred_tradition_slug: slug });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation();
    const newStatus = await booksApi.toggleFavorite(bookId);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, is_favorite: newStatus } : b));
  };

  const activeTraditionName = traditions.find(t => t.slug === selectedTradition)?.name || 'All Traditions';

  return (
    <div className="p-6 pb-28 max-w-lg mx-auto space-y-6">
      {/* Top Header */}
      <header className="pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Library size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-text tracking-tight">Islamic Library</h1>
              <p className="text-xs text-subtext font-medium">Authoritative Classics & Digital Readers</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/library')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-text hover:bg-surface transition-colors shadow-sm"
          >
            <Bookmark size={13} className="text-primary" />
            <span>My Library</span>
          </button>
        </div>

        {/* 🌟 Active Tradition Selector Strip */}
        <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">🏛️</span>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase text-primary block leading-tight tracking-wider">
                Tradition Filter
              </span>
              <span className="text-xs font-bold text-text truncate block">
                Showing: <span className="text-primary font-black">{activeTraditionName}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowTraditionModal(true)}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Change
          </button>
        </div>
      </header>

      {/* 🔎 Search Bar */}
      <div className="relative">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books, authors, or topics..."
          className="w-full pl-10 pr-9 py-2.5 bg-card border border-border rounded-xl text-text text-xs placeholder:text-subtext focus:outline-none focus:border-primary transition-colors shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 📖 Continue Reading Widget (if exists) */}
      {userLibrary && userLibrary.continue_reading.length > 0 && !searchQuery && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              <span>Continue Reading</span>
            </h2>
            <button 
              onClick={() => navigate('/library')} 
              className="text-[11px] font-bold text-primary hover:underline flex items-center"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          {userLibrary.continue_reading.slice(0, 1).map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/books/${book.id}/read?chapter=${book.last_chapter}`)}
              className="bg-card border border-primary/30 hover:border-primary/60 rounded-2xl p-3 shadow-sm flex items-center gap-3 cursor-pointer transition-all group overflow-hidden"
            >
              {/* Fixed Dimension Thumbnail */}
              <div className="w-16 h-20 rounded-xl overflow-hidden shadow-md shrink-0 bg-surface border border-border">
                <img
                  src={book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                    Chapter {book.last_chapter}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                    {book.progress_percent}%
                  </span>
                </div>

                <h3 className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="text-[11px] text-subtext truncate">
                  {typeof book.author === 'string' ? book.author : book.author?.name || 'Classical Scholar'}
                </p>

                {/* Progress bar */}
                <div className="pt-1">
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(book.progress_percent, 5)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={15} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 🏷️ Categories Horizontal Scroll */}
      <section className="space-y-2">
        <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">Categories</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
              selectedCategory === 'all'
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'bg-card text-text border-border hover:bg-surface'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-card text-text border-border hover:bg-surface'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 📚 Books Catalog Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
            {selectedCategory !== 'all' 
              ? `${categories.find(c => c.slug === selectedCategory)?.name || 'Books'}` 
              : 'Available Books'} ({books.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-card animate-pulse rounded-2xl border border-border" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12 px-4 bg-card border border-border rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">No books found</h3>
              <p className="text-xs text-subtext mt-1">
                Try switching traditions, selecting another category, or adjusting your search query.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedTradition('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Show All Traditions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                className="bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm flex items-start gap-3.5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group overflow-hidden"
              >
                {/* Book Cover with Fixed Aspect Ratio */}
                <div className="relative shrink-0 w-20 h-28 rounded-xl overflow-hidden shadow-md bg-surface border border-border">
                  <img
                    src={book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {book.featured && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-text leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <button
                      onClick={(e) => handleToggleFavorite(e, book.id)}
                      className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                        book.is_favorite 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                          : 'bg-surface border-border text-subtext hover:text-rose-400'
                      }`}
                    >
                      <Heart size={14} fill={book.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {book.title_ar && (
                    <p className="text-xs font-bold text-emerald-400 font-arabic truncate" dir="rtl">
                      {book.title_ar}
                    </p>
                  )}

                  <p className="text-[11px] text-subtext font-medium truncate">
                    {book.author?.name || 'Classical Scholar'}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    {book.tradition && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {book.tradition.name}
                      </span>
                    )}
                    {book.category && (
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-surface text-subtext border border-border">
                        {book.category.name}
                      </span>
                    )}
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {book.total_chapters} {book.total_chapters === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🏛️ Tradition Selector Modal */}
      {showTraditionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <h3 className="text-lg font-black text-text">Choose Tradition</h3>
              </div>
              <button 
                onClick={() => setShowTraditionModal(false)}
                className="p-1 rounded-xl text-subtext hover:text-text bg-surface"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-subtext leading-relaxed">
              Select your preferred school of thought. This customizes your default library view while allowing you to explore all traditions at any time.
            </p>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {traditions.map((t) => {
                const isSelected = selectedTradition === t.slug;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTradition(t.slug)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 font-bold'
                        : 'bg-surface border-border text-text hover:border-primary/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{t.name}</div>
                      {t.name_ur && (
                        <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-subtext'}`}>
                          {t.name_ur} • {t.name_ar}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check size={16} className="shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
