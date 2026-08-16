import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  Download, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { BookDetail as IBookDetail } from '../types/books';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<IBookDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      const data = await booksApi.getBookDetail(Number(id));
      setBook(data);

      // Check if downloaded
      try {
        const offlineData = localStorage.getItem(`619_offline_book_${id}`);
        if (offlineData) setIsDownloaded(true);
      } catch (e) {}

      setLoading(false);
    };

    fetchDetail();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!book) return;
    const newStatus = await booksApi.toggleFavorite(book.id);
    setBook({ ...book, is_favorite: newStatus });
  };

  const handleDownloadOffline = async () => {
    if (!book || downloading) return;
    setDownloading(true);

    try {
      // Pre-fetch all chapters of this book
      const chaptersData = [];
      for (const chap of book.chapters) {
        const c = await booksApi.getChapter(book.id, chap.chapter_number);
        if (c) chaptersData.push(c);
      }

      localStorage.setItem(`619_offline_book_${book.id}`, JSON.stringify({
        book,
        chapters: chaptersData,
        downloaded_at: new Date().toISOString()
      }));

      setIsDownloaded(true);
    } catch (e) {
      console.error('Failed to download book for offline reading', e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto space-y-4">
        <div className="h-6 w-24 bg-card animate-pulse rounded-xl" />
        <div className="h-64 bg-card animate-pulse rounded-3xl" />
        <div className="h-32 bg-card animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-16 space-y-4">
        <h2 className="text-base font-bold text-text">Book Not Found</h2>
        <button
          onClick={() => navigate('/books')}
          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
        >
          Return to Library
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-28 max-w-lg mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/books')}
          className="p-2 rounded-xl bg-card border border-border text-subtext hover:text-text"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition-colors ${
              book.is_favorite 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                : 'bg-card border-border text-subtext hover:text-rose-400'
            }`}
          >
            <Heart size={18} fill={book.is_favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Book Hero Card */}
      <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <img
            src={book.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
            alt={book.title}
            className="w-28 h-40 object-cover rounded-2xl shadow-lg shrink-0"
          />

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap gap-1">
              {book.tradition && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {book.tradition.name}
                </span>
              )}
              {book.category && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-surface text-subtext border border-border">
                  {book.category.name}
                </span>
              )}
            </div>

            <h1 className="text-base font-black text-text leading-snug">
              {book.title}
            </h1>

            {book.title_ar && (
              <p className="text-sm font-bold text-emerald-400 font-arabic" dir="rtl">
                {book.title_ar}
              </p>
            )}

            <p className="text-xs text-subtext font-semibold">
              {book.author?.name || 'Classical Scholar'}
            </p>

            {book.author?.death_year_hijri && (
              <p className="text-[11px] text-subtext/80">
                d. {book.author.death_year_hijri}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
          <button
            onClick={() => navigate(`/books/${book.id}/read?chapter=${book.last_chapter || 1}`)}
            className="w-full py-3 bg-primary text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <BookOpen size={16} />
            <span>{book.progress_percent > 0 ? `Continue (${book.progress_percent}%)` : 'Read Online'}</span>
          </button>

          <button
            onClick={handleDownloadOffline}
            disabled={downloading || isDownloaded}
            className={`w-full py-3 font-bold text-xs rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              isDownloaded
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-surface border-border text-text hover:bg-card'
            }`}
          >
            {downloading ? (
              <span>Downloading...</span>
            ) : isDownloaded ? (
              <>
                <Check size={16} />
                <span>Offline Ready</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Save Offline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Description / Synopsis */}
      <section className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
        <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
          About This Work
        </h2>
        <p className="text-xs text-text/90 leading-relaxed font-medium">
          {book.description || 'A timeless classical text of Islamic knowledge, jurisprudence, and moral guidance.'}
        </p>

        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-3 text-[11px] text-subtext">
          <span className="flex items-center gap-1">
            <Globe size={13} className="text-primary" />
            <span>{book.language}</span>
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Public Domain / Open</span>
          </span>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase text-subtext tracking-wider">
            Table of Contents ({book.chapters.length})
          </h2>
        </div>

        <div className="space-y-2">
          {book.chapters.map((chap) => (
            <div
              key={chap.id}
              onClick={() => navigate(`/books/${book.id}/read?chapter=${chap.chapter_number}`)}
              className="bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-surface border border-border flex items-center justify-center text-xs font-extrabold text-primary shrink-0">
                  {chap.chapter_number}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                    {chap.title}
                  </h3>
                  {chap.title_ar && (
                    <p className="text-[11px] text-emerald-400 font-arabic truncate mt-0.5" dir="rtl">
                      {chap.title_ar}
                    </p>
                  )}
                </div>
              </div>

              <ChevronRight size={16} className="text-subtext group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BookDetail;
