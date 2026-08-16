import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  Hash,
  Share2,
  Sliders,
  Type,
  Layers
} from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { BookDetail, BookChapterDetail } from '../types/books';

type ReaderTheme = 'dark' | 'light' | 'sepia';
type LanguageView = 'all' | 'ar' | 'en' | 'ur';

const BookReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentChapterNum = Number(searchParams.get('chapter')) || 1;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [chapter, setChapter] = useState<BookChapterDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Chrome Visibility (Tap screen center to toggle)
  const [showToolbars, setShowToolbars] = useState<boolean>(true);

  // Bottom Sheets / Modals
  const [activeSheet, setActiveSheet] = useState<'toc' | 'goto' | 'theme' | 'bookmark' | null>(null);

  // Reader Preferences
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [langView, setLangView] = useState<LanguageView>('all');

  // Go to page / chapter state
  const [gotoInput, setGotoInput] = useState<string>('');

  // Bookmark state
  const [bookmarkNote, setBookmarkNote] = useState<string>('');
  const [bookmarkSaved, setBookmarkSaved] = useState<boolean>(false);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // Load preferences
  useEffect(() => {
    const loadPref = async () => {
      const pref = await booksApi.getUserPreferences();
      if (pref) {
        if (pref.reader_font_size) setFontSize(pref.reader_font_size);
        if (pref.reader_theme) setTheme(pref.reader_theme as ReaderTheme);
      }
    };
    loadPref();
  }, []);

  // Load Book & Chapter
  useEffect(() => {
    if (!id) return;

    const loadContent = async () => {
      setLoading(true);
      const bookData = await booksApi.getBookDetail(Number(id));
      setBook(bookData);

      const chapData = await booksApi.getChapter(Number(id), currentChapterNum);
      setChapter(chapData);
      setLoading(false);

      if (bookData) {
        const total = bookData.total_chapters || 1;
        const percent = Math.min(Math.round((currentChapterNum / total) * 100), 100);
        booksApi.updateProgress(bookData.id, currentChapterNum, percent);
      }
    };

    loadContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, currentChapterNum]);

  const handleNextChapter = () => {
    if (book && currentChapterNum < (book.total_chapters || 1)) {
      setSearchParams({ chapter: String(currentChapterNum + 1) });
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterNum > 1) {
      setSearchParams({ chapter: String(currentChapterNum - 1) });
    }
  };

  const handleGotoChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(gotoInput);
    if (book && !isNaN(num) && num >= 1 && num <= (book.total_chapters || 1)) {
      setSearchParams({ chapter: String(num) });
      setActiveSheet(null);
      setGotoInput('');
    }
  };

  const handleSaveBookmark = async () => {
    if (!book || !chapter) return;
    await booksApi.createBookmark({
      book_id: book.id,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      note: bookmarkNote
    });
    setBookmarkSaved(true);
    setTimeout(() => {
      setBookmarkSaved(false);
      setActiveSheet(null);
      setBookmarkNote('');
    }, 1200);
  };

  const handleCopyCitation = () => {
    if (!book || !chapter) return;
    const citation = `"${chapter.title}" — from ${book.title} (Vol 1, Chap ${chapter.chapter_number}), by ${book.author?.name || 'Classical Scholar'}. Accessed via 619 Islam.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  // Theme Styling Classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          container: 'bg-[#faf8f5] text-[#1c1917]',
          card: 'bg-white border-[#e7e5e4]',
          header: 'bg-[#faf8f5]/95 border-[#e7e5e4] text-[#1c1917]',
          toolbar: 'bg-[#faf8f5]/95 border-[#e7e5e4] text-[#1c1917]',
          arabic: 'text-[#1e3a2b]',
          subtext: 'text-[#78716c]',
          highlight: 'bg-amber-200 text-black'
        };
      case 'sepia':
        return {
          container: 'bg-[#f4ecd8] text-[#433422]',
          card: 'bg-[#ede3cc] border-[#d8cdb4]',
          header: 'bg-[#f4ecd8]/95 border-[#d8cdb4] text-[#433422]',
          toolbar: 'bg-[#f4ecd8]/95 border-[#d8cdb4] text-[#433422]',
          arabic: 'text-[#2b3a1e]',
          subtext: 'text-[#7d6b53]',
          highlight: 'bg-amber-300 text-black'
        };
      case 'dark':
      default:
        return {
          container: 'bg-[#081819] text-[#e6f4f1]',
          card: 'bg-[#0d282a] border-[#164345]',
          header: 'bg-[#081819]/95 border-[#164345] text-[#e6f4f1]',
          toolbar: 'bg-[#081819]/95 border-[#164345] text-[#e6f4f1]',
          arabic: 'text-amber-200',
          subtext: 'text-[#84a9a6]',
          highlight: 'bg-amber-500/30 text-amber-200'
        };
    }
  };

  const themeStyle = getThemeClasses();
  const isPartial = book?.completeness === 'partial';

  return (
    <div className={`min-h-screen ${themeStyle.container} transition-colors duration-200 relative pb-28 select-text`}>
      {/* ── 📱 MINIMAL TOP HEADER (Auto-hides or toggles) ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 backdrop-blur-md border-b ${themeStyle.header} transition-transform duration-300 ${
          showToolbars ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/books/${id}`)}
            className="p-1.5 rounded-xl hover:opacity-80 transition-opacity active:scale-95"
            aria-label="Back to Book Detail"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 min-w-0 text-center">
            <h2 className="text-xs font-black truncate">
              {book?.title || 'Islamic Reader'}
            </h2>
            <p className={`text-[10px] ${themeStyle.subtext} truncate font-bold`}>
              Vol 1 • Chapter {currentChapterNum} of {book?.total_chapters || 1}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Switch to Original PDF Scan Mode */}
            <button
              onClick={() => navigate(`/books/${id}/pdf`)}
              className="px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
              title="Read Original PDF Scan"
            >
              <span>📄</span>
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={() => setActiveSheet('theme')}
              className="p-1.5 rounded-xl hover:opacity-80 transition-opacity active:scale-95"
              aria-label="Theme & Typography Settings"
            >
              <Type size={18} />
            </button>
          </div>
        </div>

        {/* Partial Content Disclaimer Banner if applicable */}
        {isPartial && (
          <div className="mt-1 -mx-4 -mb-3 py-1 px-4 bg-amber-500/15 border-t border-amber-500/20 text-center text-[10px] font-bold text-amber-400">
            Selected Chapters • Authentic Traditional Extract
          </div>
        )}
      </header>

      {/* ── 📖 MAIN READING CANVAS (Tap Center to Toggle Toolbars) ── */}
      <main 
        onClick={() => setShowToolbars(prev => !prev)}
        className="max-w-2xl mx-auto px-5 pt-20 pb-16 space-y-6 cursor-pointer"
      >
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="h-8 w-48 bg-white/10 animate-pulse rounded-2xl mx-auto" />
            <div className="h-64 bg-white/5 animate-pulse rounded-3xl" />
            <div className="h-48 bg-white/5 animate-pulse rounded-3xl" />
          </div>
        ) : !chapter ? (
          <div className="text-center py-20 space-y-3">
            <h3 className="text-sm font-bold">Chapter not available</h3>
            <button
              onClick={() => navigate(`/books/${id}`)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
            >
              Back to Overview
            </button>
          </div>
        ) : (
          <article className="space-y-6">
            {/* Chapter Header */}
            <div className="text-center space-y-2 pb-4 border-b border-white/10">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${themeStyle.card} text-primary`}>
                Chapter {chapter.chapter_number}
              </span>
              <h1 className="text-lg sm:text-xl font-black leading-snug">
                {chapter.title}
              </h1>
              {chapter.title_ar && (
                <p className={`font-arabic text-base sm:text-lg font-bold ${themeStyle.arabic}`} dir="rtl">
                  {chapter.title_ar}
                </p>
              )}
            </div>

            {/* Content Display based on Language Filter */}
            <div className="space-y-6 leading-relaxed">
              {/* Arabic Content */}
              {(langView === 'all' || langView === 'ar') && chapter.content_ar && (
                <div 
                  className={`font-arabic text-right leading-[2.4] font-medium ${themeStyle.arabic} p-4 sm:p-6 rounded-3xl ${themeStyle.card} border shadow-sm select-text`}
                  style={{ fontSize: `${fontSize + 3}px` }}
                  dir="rtl"
                >
                  {chapter.content_ar}
                </div>
              )}

              {/* English Translation */}
              {(langView === 'all' || langView === 'en') && chapter.content_en && (
                <div 
                  className={`p-4 sm:p-6 rounded-3xl ${themeStyle.card} border shadow-sm leading-relaxed select-text font-serif`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <p className="whitespace-pre-line">{chapter.content_en}</p>
                </div>
              )}

              {/* Urdu Translation */}
              {(langView === 'all' || langView === 'ur') && chapter.content_ur && (
                <div 
                  className={`font-urdu text-right leading-[2.3] p-4 sm:p-6 rounded-3xl ${themeStyle.card} border shadow-sm select-text`}
                  style={{ fontSize: `${fontSize + 2}px` }}
                  dir="rtl"
                >
                  <p className="whitespace-pre-line">{chapter.content_ur}</p>
                </div>
              )}
            </div>

            {/* Chapter Navigation Stepper */}
            <div className="pt-6 flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterNum <= 1}
                className={`flex-1 py-3 px-3 rounded-2xl border ${themeStyle.card} text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none`}
              >
                <ChevronLeft size={16} />
                <span>Previous Chapter</span>
              </button>

              <button
                onClick={handleNextChapter}
                disabled={Boolean(book && currentChapterNum >= (book.total_chapters || 1))}
                className={`flex-1 py-3 px-3 rounded-2xl border ${themeStyle.card} text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-primary font-black`}
              >
                <span>Next Chapter</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </article>
        )}
      </main>

      {/* ── 📱 THUMB ZONE BOTTOM TOOLBAR (5 Essential Tools) ── */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 px-4 py-2.5 backdrop-blur-md border-t ${themeStyle.toolbar} transition-transform duration-300 ${
          showToolbars ? 'translate-y-0' : 'translate-y-full'
        } safe-area-pb`}
      >
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* 1. TOC */}
          <button
            onClick={() => setActiveSheet('toc')}
            className="flex flex-col items-center gap-1 p-1 text-xs font-bold hover:opacity-80 active:scale-95"
          >
            <Layers size={19} className="text-primary" />
            <span className="text-[10px]">Chapters</span>
          </button>

          {/* 2. Go to Page / Vol */}
          <button
            onClick={() => setActiveSheet('goto')}
            className="flex flex-col items-center gap-1 p-1 text-xs font-bold hover:opacity-80 active:scale-95"
          >
            <Hash size={19} className="text-amber-400" />
            <span className="text-[10px]">Go to</span>
          </button>

          {/* 3. Typography & Theme */}
          <button
            onClick={() => setActiveSheet('theme')}
            className="flex flex-col items-center gap-1 p-1 text-xs font-bold hover:opacity-80 active:scale-95"
          >
            <Sliders size={19} className="text-emerald-400" />
            <span className="text-[10px]">Theme</span>
          </button>

          {/* 4. Bookmark / Note */}
          <button
            onClick={() => setActiveSheet('bookmark')}
            className="flex flex-col items-center gap-1 p-1 text-xs font-bold hover:opacity-80 active:scale-95"
          >
            <Bookmark size={19} className="text-rose-400" />
            <span className="text-[10px]">Bookmark</span>
          </button>

          {/* 5. More / Citation */}
          <button
            onClick={handleCopyCitation}
            className="flex flex-col items-center gap-1 p-1 text-xs font-bold hover:opacity-80 active:scale-95"
          >
            {copiedCitation ? <Check size={19} className="text-emerald-400" /> : <Share2 size={19} className="text-sky-400" />}
            <span className="text-[10px]">{copiedCitation ? 'Copied' : 'Cite'}</span>
          </button>
        </div>
      </nav>

      {/* ── 📑 BOTTOM SHEET 1: TABLE OF CONTENTS ── */}
      {activeSheet === 'toc' && book && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className={`p-5 rounded-t-3xl border-t ${themeStyle.card} max-w-lg mx-auto w-full max-h-[75vh] flex flex-col space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-primary" />
                <h3 className="text-sm font-black">Table of Contents</h3>
              </div>
              <button onClick={() => setActiveSheet(null)} className="p-1 rounded-full text-subtext hover:text-text">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5 space-y-1 pr-1">
              {book.chapters.map((chap) => {
                const isActive = chap.chapter_number === currentChapterNum;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setSearchParams({ chapter: String(chap.chapter_number) });
                      setActiveSheet(null);
                    }}
                    className={`w-full py-3 px-3 rounded-2xl text-left transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-primary text-white font-black shadow-md'
                        : 'hover:bg-white/5 text-text'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-xs w-6 text-center font-bold ${isActive ? 'text-white' : 'text-primary'}`}>
                        {chap.chapter_number}
                      </span>
                      <span className="text-xs truncate">{chap.title}</span>
                    </div>
                    {isActive && <Check size={16} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 🔢 BOTTOM SHEET 2: GO TO CHAPTER / PAGE ── */}
      {activeSheet === 'goto' && book && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className={`p-5 rounded-t-3xl border-t ${themeStyle.card} max-w-lg mx-auto w-full space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Hash size={18} className="text-amber-400" />
                <h3 className="text-sm font-black">Jump to Chapter</h3>
              </div>
              <button onClick={() => setActiveSheet(null)} className="p-1 rounded-full text-subtext hover:text-text">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGotoChapter} className="space-y-3">
              <p className="text-xs text-subtext">
                Enter chapter number (1 to {book.total_chapters}):
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={book.total_chapters}
                  value={gotoInput}
                  onChange={(e) => setGotoInput(e.target.value)}
                  placeholder={`e.g. ${currentChapterNum}`}
                  className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-text font-bold outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-2xl shadow-md active:scale-95 transition-all"
                >
                  Go
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 🎨 BOTTOM SHEET 3: THEME & TYPOGRAPHY ── */}
      {activeSheet === 'theme' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className={`p-5 rounded-t-3xl border-t ${themeStyle.card} max-w-lg mx-auto w-full space-y-5 animate-in slide-in-from-bottom duration-200 shadow-2xl`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-emerald-400" />
                <h3 className="text-sm font-black">Reader Settings</h3>
              </div>
              <button onClick={() => setActiveSheet(null)} className="p-1 rounded-full text-subtext hover:text-text">
                <X size={18} />
              </button>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-subtext uppercase tracking-wider block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'sepia', 'light'] as ReaderTheme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold capitalize transition-all border ${
                      theme === t
                        ? 'border-primary bg-primary/20 text-primary font-black shadow-md'
                        : 'border-white/10 bg-surface text-subtext'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-subtext uppercase tracking-wider">Font Size</span>
                <span className="text-primary">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={14}
                max={28}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Language Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-subtext uppercase tracking-wider block">Language View</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['all', 'ar', 'en', 'ur'] as LanguageView[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLangView(l)}
                    className={`py-2 px-1 rounded-xl font-bold uppercase transition-all border ${
                      langView === l
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface border-white/10 text-subtext'
                    }`}
                  >
                    {l === 'all' ? 'All' : l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 🔖 BOTTOM SHEET 4: BOOKMARK & NOTES ── */}
      {activeSheet === 'bookmark' && book && chapter && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className={`p-5 rounded-t-3xl border-t ${themeStyle.card} max-w-lg mx-auto w-full space-y-4 animate-in slide-in-from-bottom duration-200 shadow-2xl`}>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-rose-400" />
                <h3 className="text-sm font-black">Bookmark Chapter {chapter.chapter_number}</h3>
              </div>
              <button onClick={() => setActiveSheet(null)} className="p-1 rounded-full text-subtext hover:text-text">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-subtext">
              Save your place and add an optional study note:
            </p>

            <textarea
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="Add reflection or note for this chapter..."
              rows={3}
              className="w-full bg-surface border border-border rounded-2xl p-3 text-xs text-text outline-none focus:border-primary resize-none"
            />

            <button
              onClick={handleSaveBookmark}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {bookmarkSaved ? (
                <>
                  <Check size={16} />
                  <span>Bookmark Saved!</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  <span>Save Bookmark to My Shelf</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookReader;
