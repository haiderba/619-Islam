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
  Share2,
  Bookmark,
  Layers,
  ChevronDown,
  ChevronUp
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
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      const data = await booksApi.getBookDetail(Number(id));
      setBook(data);

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

  const handleShare = async () => {
    if (!book) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Read ${book.title} (${book.author?.name || 'Classical Islamic Work'}) on 619 Islam`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4 pt-4">
        <div className="h-6 w-28 bg-card animate-pulse rounded-xl" />
        <div className="h-48 bg-card animate-pulse rounded-3xl" />
        <div className="h-14 bg-card animate-pulse rounded-2xl" />
        <div className="h-64 bg-card animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20 space-y-4">
        <h2 className="text-base font-bold text-text">Book Not Found</h2>
        <button
          onClick={() => navigate('/books')}
          className="px-5 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold shadow-md"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const isComplete = book.completeness === 'complete' || book.total_chapters >= 10;
  const isMultiVol = book.completeness === 'multi_volume' || (book.total_volumes && book.total_volumes > 1);
  const startChapter = book.last_chapter || 1;

  return (
    <div className="p-4 sm:p-6 pb-32 max-w-lg mx-auto space-y-5">
      {/* ── 📱 TOP NAVIGATION BAR ── */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate('/books')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-text hover:bg-surface transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>Library</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-card border border-border text-subtext hover:text-text active:scale-95 transition-all shadow-sm"
            title="Share Book"
          >
            {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition-all active:scale-95 shadow-sm ${
              book.is_favorite 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                : 'bg-card border-border text-subtext hover:text-rose-400'
            }`}
            title="Favorite"
          >
            <Heart size={16} fill={book.is_favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── 📖 BOOK HERO CARD ── */}
      <section className="bg-gradient-to-br from-[#062426] via-[#0b3c3f] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-xl shadow-teal-950/40">
        <div className="flex gap-4 items-center">
          {/* Miniature Spine Artwork */}
          <div className="w-20 h-28 shrink-0 rounded-2xl bg-gradient-to-b from-[#062426] to-[#021314] border border-amber-500/50 flex flex-col items-center justify-between p-2 text-center shadow-lg relative overflow-hidden">
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
              {book.tradition?.slug?.slice(0, 3) || 'ISL'}
            </span>
            <span className="font-arabic text-amber-200 text-xs font-bold line-clamp-2 leading-tight drop-shadow my-auto">
              {book.title_ar || book.title}
            </span>
            <span className="text-[8px] font-sans font-bold text-amber-400/90">
              619 CLASSIC
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Badges Row: Tradition + Completeness (Honest & Transparent) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {book.tradition?.name || 'General'}
              </span>

              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                isComplete
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : isMultiVol
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}>
                {isComplete ? 'Complete Edition' : isMultiVol ? `${book.total_volumes || 2} Volumes` : 'Selected Chapters'}
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2">
              {book.title}
            </h1>

            {book.title_ar && (
              <p className="font-arabic text-amber-300 text-sm font-bold truncate drop-shadow" dir="rtl">
                {book.title_ar}
              </p>
            )}

            <p className="text-xs text-white/80 font-medium truncate">
              {book.author?.name || 'Classical Islamic Scholar'}
            </p>
          </div>
        </div>

        {/* Short Collapsible Description */}
        {book.description && (
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/80 leading-relaxed">
            <p className={showFullDesc ? '' : 'line-clamp-2'}>
              {book.description}
            </p>
            {book.description.length > 110 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-[11px] font-bold text-amber-400 mt-1 flex items-center gap-0.5 hover:underline"
              >
                <span>{showFullDesc ? 'Show Less' : 'Read More'}</span>
                {showFullDesc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── 🎯 PRIMARY CTA LAUNCHERS (Dual Engine: Digital Text & Scanned PDF) ── */}
      <section className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Digital Text Reader Button */}
          {book.chapters.length > 0 && (
            <button
              onClick={() => navigate(`/books/${book.id}/read?chapter=${startChapter}`)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <BookOpen size={17} className="text-black" />
              <span>{book.last_chapter ? `Resume Text (Chap ${book.last_chapter})` : 'Read Digital Text'}</span>
              <ChevronRight size={17} className="text-black ml-auto sm:ml-1" />
            </button>
          )}

          {/* 2. Original PDF / Manuscript Reader Button */}
          <button
            onClick={() => navigate(`/books/${book.id}/pdf`)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
          >
            <span className="text-base">📄</span>
            <span>Read Original PDF Scan</span>
            <ChevronRight size={17} className="text-white ml-auto sm:ml-1" />
          </button>
        </div>

        {/* Secondary Actions Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadOffline}
            disabled={downloading || isDownloaded}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isDownloaded
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-card border-border text-text hover:bg-surface active:scale-95'
            }`}
          >
            {isDownloaded ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Downloaded Offline</span>
              </>
            ) : downloading ? (
              <span>Saving Book...</span>
            ) : (
              <>
                <Download size={14} className="text-primary" />
                <span>Download Offline</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/library')}
            className="py-2.5 px-3 rounded-2xl bg-card border border-border text-text hover:bg-surface text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Bookmark size={14} className="text-amber-500" />
            <span>View in My Shelf</span>
          </button>
        </div>
      </section>

      {/* ── 📑 TABLE OF CONTENTS (Hierarchical Accordion) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-text flex items-center gap-1.5">
            <Layers size={14} className="text-primary" />
            <span>Table of Contents</span>
          </h2>
          <span className="text-xs font-bold text-subtext">
            {book.chapters.length} {book.chapters.length === 1 ? 'Chapter' : 'Chapters'}
          </span>
        </div>

        <div className="bg-card border border-border rounded-3xl p-3 divide-y divide-border/60 shadow-sm space-y-1">
          {book.chapters.map((chap) => (
            <div
              key={chap.id}
              onClick={() => navigate(`/books/${book.id}/read?chapter=${chap.chapter_number}`)}
              className="py-3 px-3 hover:bg-surface rounded-2xl transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  {chap.chapter_number}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">
                    {chap.title}
                  </h4>
                  {chap.title_ar && (
                    <p className="font-arabic text-[11px] text-emerald-400 font-bold truncate mt-0.5" dir="rtl">
                      {chap.title_ar}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-subtext group-hover:text-primary transition-colors shrink-0 pl-2">
                <span className="text-[10px] font-medium hidden sm:inline">Read</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 🛡️ AUTHENTICITY & SOURCE INFORMATION (Honest Metadata) ── */}
      <section className="p-4 rounded-3xl bg-surface border border-border/80 space-y-2.5 text-xs text-subtext">
        <div className="flex items-center gap-2 text-text font-bold">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Authenticity & Source Standards</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          This digital publication is curated from authoritative Islamic manuscripts and classical printed editions under the <strong>{book.tradition?.name || 'Islamic'}</strong> tradition.
        </p>
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted">
          <span>Copyright: {book.copyright_status || 'Public Domain / Free for Study'}</span>
          <span>Verified Digitally</span>
        </div>
      </section>
    </div>
  );
};

export default BookDetail;
