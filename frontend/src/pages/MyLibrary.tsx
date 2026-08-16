import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Heart, 
  Bookmark as BookmarkIcon, 
  Download, 
  Trash2, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { UserLibraryData } from '../types/books';

type LibraryTab = 'continue' | 'favorites' | 'bookmarks' | 'offline';

const MyLibrary: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<LibraryTab>('continue');
  const [libraryData, setLibraryData] = useState<UserLibraryData | null>(null);
  const [offlineBooks, setOfflineBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadLibrary = async () => {
      setLoading(true);
      const data = await booksApi.getUserLibrary();
      setLibraryData(data);

      // Load offline saved books from localStorage
      const offlineList: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('619_offline_book_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.book) offlineList.push(item);
          } catch (e) {}
        }
      }
      setOfflineBooks(offlineList);
      setLoading(false);
    };

    loadLibrary();
  }, []);

  const handleDeleteBookmark = async (bookmarkId: number) => {
    await booksApi.deleteBookmark(bookmarkId);
    setLibraryData(prev => prev ? {
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== bookmarkId)
    } : null);
  };

  const handleDeleteOffline = (bookId: number) => {
    localStorage.removeItem(`619_offline_book_${bookId}`);
    setOfflineBooks(prev => prev.filter(item => item.book.id !== bookId));
  };

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-6xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/books')}
            className="p-2 rounded-xl bg-card border border-border text-subtext hover:text-text"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text tracking-tight">My Library</h1>
            <p className="text-xs text-subtext font-medium">Your Reading Journey & Saved Works</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface border border-border rounded-2xl">
        <button
          onClick={() => setActiveTab('continue')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            activeTab === 'continue'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Clock size={15} />
          <span className="text-[10px]">History</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            activeTab === 'favorites'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Heart size={15} />
          <span className="text-[10px]">Favorites</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            activeTab === 'bookmarks'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-subtext hover:text-text'
          }`}
        >
          <BookmarkIcon size={15} />
          <span className="text-[10px]">Bookmarks</span>
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
            activeTab === 'offline'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-subtext hover:text-text'
          }`}
        >
          <Download size={15} />
          <span className="text-[10px]">Offline</span>
        </button>
      </div>

      {/* Content Body */}
      {loading ? (
        <div className="space-y-3 py-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-card animate-pulse rounded-2xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* TAB 1: Continue Reading */}
          {activeTab === 'continue' && (
            libraryData?.continue_reading.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-3xl space-y-3 p-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-sm font-bold text-text">No active reading sessions</h3>
                <p className="text-xs text-subtext">
                  Start reading any classical work from the Islamic Library and your progress will appear here.
                </p>
                <button
                  onClick={() => navigate('/books')}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20"
                >
                  Browse Library
                </button>
              </div>
            ) : (
              libraryData?.continue_reading.map(b => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/books/${b.id}/read?chapter=${b.last_chapter || 1}`)}
                  className="bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-primary/40 transition-all group"
                >
                  <img
                    src={b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                    alt={b.title}
                    className="w-14 h-20 object-cover rounded-xl shadow-md shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-primary uppercase">
                      Chapter {b.last_chapter || 1}
                    </span>
                    <h3 className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-[11px] text-subtext truncate mt-0.5">
                      {typeof b.author === 'string' ? b.author : b.author?.name || 'Classical Scholar'}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.max(b.progress_percent, 5)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-text">{b.progress_percent}%</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface border border-border text-subtext group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 2: Favorites */}
          {activeTab === 'favorites' && (
            libraryData?.favorites.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-3xl space-y-3 p-5">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart size={24} />
                </div>
                <h3 className="text-sm font-bold text-text">No favorites yet</h3>
                <p className="text-xs text-subtext">
                  Tap the heart icon on any book to add it to your personal favorites.
                </p>
                <button
                  onClick={() => navigate('/books')}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20"
                >
                  Explore Books
                </button>
              </div>
            ) : (
              libraryData?.favorites.map(b => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/books/${b.id}`)}
                  className="bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5 cursor-pointer hover:border-primary/40 transition-all group"
                >
                  <img
                    src={b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                    alt={b.title}
                    className="w-14 h-20 object-cover rounded-xl shadow-md shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-[11px] text-subtext truncate mt-0.5">
                      {typeof b.author === 'string' ? b.author : b.author?.name || 'Classical Scholar'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-subtext group-hover:text-primary" />
                </div>
              ))
            )
          )}

          {/* TAB 3: Bookmarks */}
          {activeTab === 'bookmarks' && (
            libraryData?.bookmarks.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-3xl space-y-3 p-5">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <BookmarkIcon size={24} />
                </div>
                <h3 className="text-sm font-bold text-text">No bookmarks saved</h3>
                <p className="text-xs text-subtext">
                  Bookmark meaningful chapters and reflections while reading.
                </p>
              </div>
            ) : (
              libraryData?.bookmarks.map(bm => (
                <div
                  key={bm.id}
                  className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      onClick={() => navigate(`/books/${bm.book_id}/read?chapter=${bm.chapter_number}`)}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <span className="text-[10px] font-extrabold uppercase text-primary">
                        {bm.book_title} • Chapter {bm.chapter_number}
                      </span>
                      <h3 className="text-xs font-bold text-text truncate mt-0.5">
                        {bm.title}
                      </h3>
                      {bm.note && (
                        <p className="text-xs text-subtext mt-1 italic bg-surface p-2 rounded-xl border border-border">
                          "{bm.note}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteBookmark(bm.id)}
                      className="p-1.5 rounded-lg text-subtext hover:text-rose-500 transition-colors"
                      title="Delete Bookmark"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 4: Offline Downloads */}
          {activeTab === 'offline' && (
            offlineBooks.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-3xl space-y-3 p-5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Download size={24} />
                </div>
                <h3 className="text-sm font-bold text-text">No offline books downloaded</h3>
                <p className="text-xs text-subtext">
                  Save permitted books to read completely offline without an internet connection.
                </p>
                <button
                  onClick={() => navigate('/books')}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20"
                >
                  Browse Books to Download
                </button>
              </div>
            ) : (
              offlineBooks.map(item => (
                <div
                  key={item.book.id}
                  className="bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5"
                >
                  <img
                    src={item.book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                    alt={item.book.title}
                    className="w-14 h-20 object-cover rounded-xl shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <span>✓</span> Available Offline
                    </span>
                    <h3 className="text-xs font-bold text-text truncate">
                      {item.book.title}
                    </h3>
                    <p className="text-[11px] text-subtext truncate mt-0.5">
                      {item.chapters?.length || 0} chapters cached
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => navigate(`/books/${item.book.id}/read?chapter=1`)}
                        className="px-3 py-1 bg-primary text-white text-[11px] font-bold rounded-lg shadow-sm"
                      >
                        Read Offline
                      </button>
                      <button
                        onClick={() => handleDeleteOffline(item.book.id)}
                        className="p-1 rounded-lg text-subtext hover:text-rose-500"
                        title="Remove Download"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
