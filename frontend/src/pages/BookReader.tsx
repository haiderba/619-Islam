import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Menu, 
  Settings2, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X
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

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(18);
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [langView, setLangView] = useState<LanguageView>('all');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState<boolean>(false);
  const [bookmarkNote, setBookmarkNote] = useState<string>('');
  const [bookmarkSaved, setBookmarkSaved] = useState<boolean>(false);

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

      // Auto update reading progress
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
      setShowBookmarkModal(false);
      setBookmarkNote('');
    }, 1200);
  };

  // Theme Styles
  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-[#fcfbf9] text-[#1a1a1a]';
      case 'sepia':
        return 'bg-[#f6eee3] text-[#433422]';
      case 'dark':
      default:
        return 'bg-[#0b0f19] text-[#e2e8f0]';
    }
  };

  const getCardClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-white border-[#e5e0d8] shadow-sm';
      case 'sepia':
        return 'bg-[#ede3d3] border-[#decbb7] shadow-sm';
      case 'dark':
      default:
        return 'bg-[#131b2e] border-slate-800 shadow-md';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${getThemeClasses()}`}>
      {/* 🌟 Top Navigation Bar */}
      <header className={`sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-md transition-colors flex items-center justify-between ${
        theme === 'dark' ? 'bg-[#0b0f19]/90 border-slate-800' : theme === 'sepia' ? 'bg-[#f6eee3]/90 border-[#e3d3bd]' : 'bg-[#fcfbf9]/90 border-neutral-200'
      }`}>
        <button
          onClick={() => navigate(`/books/${id}`)}
          className="p-2 rounded-xl border border-current/15 hover:bg-current/10 transition-colors"
          title="Back to Book"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center min-w-0 max-w-[200px] px-2">
          <h2 className="text-xs font-bold truncate">
            {book?.title || 'Islamic Reader'}
          </h2>
          <p className="text-[10px] opacity-70 truncate">
            Chapter {currentChapterNum} of {book?.total_chapters || 1}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowBookmarkModal(true)}
            className="p-2 rounded-xl border border-current/15 hover:bg-current/10 transition-colors"
            title="Bookmark"
          >
            <Bookmark size={18} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl border border-current/15 hover:bg-current/10 transition-colors"
            title="Reader Settings"
          >
            <Settings2 size={18} />
          </button>
          <button
            onClick={() => setShowDrawer(true)}
            className="p-2 rounded-xl border border-current/15 hover:bg-current/10 transition-colors"
            title="Table of Contents"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* ⚙️ Reader Customization Dropdown Panel */}
      {showSettings && (
        <div className={`p-4 border-b space-y-4 animate-in slide-in-from-top-2 duration-150 ${
          theme === 'dark' ? 'bg-[#101726] border-slate-800' : theme === 'sepia' ? 'bg-[#eee3d1] border-[#decbb7]' : 'bg-neutral-100 border-neutral-200'
        }`}>
          <div className="max-w-md mx-auto space-y-3">
            {/* Theme switcher */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Theme</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setTheme('dark'); booksApi.updateUserPreferences({ reader_theme: 'dark' }); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    theme === 'dark' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => { setTheme('sepia'); booksApi.updateUserPreferences({ reader_theme: 'sepia' }); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    theme === 'sepia' ? 'bg-[#8d6748] text-white border-[#8d6748] shadow-sm' : 'bg-[#e8dcce] text-[#433422] border-[#decbb7]'
                  }`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => { setTheme('light'); booksApi.updateUserPreferences({ reader_theme: 'light' }); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    theme === 'light' ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' : 'bg-white text-neutral-800 border-neutral-300'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* Font size slider */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Text Size</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const next = Math.max(14, fontSize - 2);
                    setFontSize(next);
                    booksApi.updateUserPreferences({ reader_font_size: next });
                  }}
                  className="px-2.5 py-1 rounded-lg border border-current/20 font-black text-xs hover:bg-current/10"
                >
                  A-
                </button>
                <span className="text-xs font-bold min-w-[28px] text-center">{fontSize}px</span>
                <button
                  onClick={() => {
                    const next = Math.min(28, fontSize + 2);
                    setFontSize(next);
                    booksApi.updateUserPreferences({ reader_font_size: next });
                  }}
                  className="px-2.5 py-1 rounded-lg border border-current/20 font-black text-xs hover:bg-current/10"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Language filter */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Language View</span>
              <div className="flex items-center gap-1.5">
                {(['all', 'ar', 'en', 'ur'] as LanguageView[]).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setLangView(lv)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      langView === lv 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-current/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📖 Reader Body */}
      <main className="max-w-lg mx-auto p-5 pb-32 space-y-6">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="h-8 bg-current/10 animate-pulse rounded-xl" />
            <div className="h-48 bg-current/10 animate-pulse rounded-2xl" />
            <div className="h-48 bg-current/10 animate-pulse rounded-2xl" />
          </div>
        ) : !chapter ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-bold opacity-80">Chapter not found</p>
            <button
              onClick={() => setSearchParams({ chapter: '1' })}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
            >
              Go to Chapter 1
            </button>
          </div>
        ) : (
          <article className="space-y-6">
            {/* Chapter Header */}
            <div className="text-center space-y-2 pb-4 border-b border-current/10">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                Chapter {chapter.chapter_number}
              </span>
              <h1 className="text-xl font-black leading-snug">
                {chapter.title}
              </h1>
              {chapter.title_ar && (
                <p className="text-base font-bold text-emerald-400 font-arabic pt-1" dir="rtl">
                  {chapter.title_ar}
                </p>
              )}
            </div>

            {/* 🌙 Arabic Original Text */}
            {(langView === 'all' || langView === 'ar') && chapter.content_ar && (
              <section className={`p-5 rounded-3xl border ${getCardClasses()} space-y-3`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    النص العربي الأصلي
                  </span>
                  <span className="text-xs">📜</span>
                </div>
                <div 
                  className="font-arabic leading-[2.4] text-right font-medium tracking-normal"
                  style={{ fontSize: `${fontSize + 3}px` }}
                  dir="rtl"
                >
                  {chapter.content_ar.split('\n').map((para, idx) => (
                    <p key={idx} className="mb-4 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* 🇬🇧 English Translation */}
            {(langView === 'all' || langView === 'en') && chapter.content_en && (
              <section className={`p-5 rounded-3xl border ${getCardClasses()} space-y-3`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-2">
                  <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                    English Translation & Commentary
                  </span>
                  <span className="text-xs">🇬🇧</span>
                </div>
                <div 
                  className="leading-relaxed font-sans"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {chapter.content_en.split('\n').map((para, idx) => (
                    <p key={idx} className="mb-3.5 last:mb-0 opacity-90">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* 🇵🇰 Urdu Translation */}
            {(langView === 'all' || langView === 'ur') && chapter.content_ur && (
              <section className={`p-5 rounded-3xl border ${getCardClasses()} space-y-3`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    اردو ترجمہ و تشریح
                  </span>
                  <span className="text-xs">🇵🇰</span>
                </div>
                <div 
                  className="font-arabic leading-[2.2] text-right font-medium"
                  style={{ fontSize: `${fontSize + 2}px` }}
                  dir="rtl"
                >
                  {chapter.content_ur.split('\n').map((para, idx) => (
                    <p key={idx} className="mb-3.5 last:mb-0 opacity-90">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </main>

      {/* 🧭 Bottom Chapter Navigation Bar */}
      <footer className={`fixed bottom-0 left-0 right-0 z-30 px-4 py-3 border-t backdrop-blur-md transition-colors ${
        theme === 'dark' ? 'bg-[#0b0f19]/90 border-slate-800' : theme === 'sepia' ? 'bg-[#f6eee3]/90 border-[#e3d3bd]' : 'bg-[#fcfbf9]/90 border-neutral-200'
      }`}>
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handlePrevChapter}
            disabled={currentChapterNum <= 1}
            className="flex-1 py-2.5 px-3 rounded-xl border border-current/15 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none hover:bg-current/10 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-[11px] font-bold opacity-70 shrink-0">
            {currentChapterNum} / {book?.total_chapters || 1}
          </span>

          <button
            onClick={handleNextChapter}
            disabled={!book || currentChapterNum >= (book.total_chapters || 1)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>

      {/* 📑 Table of Contents Side Drawer */}
      {showDrawer && book && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className={`w-4/5 max-w-sm h-full p-5 flex flex-col space-y-4 shadow-2xl animate-in slide-in-from-right duration-200 ${
            theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : theme === 'sepia' ? 'bg-[#ede3d3] text-[#433422]' : 'bg-white text-neutral-900'
          }`}>
            <div className="flex items-center justify-between border-b border-current/10 pb-3">
              <h3 className="text-sm font-black">Table of Contents</h3>
              <button 
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg hover:bg-current/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {book.chapters.map((chap) => {
                const isActive = chap.chapter_number === currentChapterNum;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setSearchParams({ chapter: String(chap.chapter_number) });
                      setShowDrawer(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-primary text-white border-primary font-bold shadow-sm'
                        : 'border-current/10 hover:bg-current/5'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[10px] uppercase font-bold opacity-75">
                        Chapter {chap.chapter_number}
                      </div>
                      <div className="text-xs truncate font-semibold">
                        {chap.title}
                      </div>
                    </div>
                    {isActive && <Check size={16} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🔖 Bookmark Dialog */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-sm w-full p-5 rounded-3xl border shadow-2xl space-y-4 ${
            theme === 'dark' ? 'bg-[#131b2e] border-slate-800 text-slate-100' : theme === 'sepia' ? 'bg-[#ede3d3] border-[#decbb7] text-[#433422]' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-primary" />
                <h3 className="text-sm font-black">Add Bookmark</h3>
              </div>
              <button 
                onClick={() => setShowBookmarkModal(false)}
                className="p-1 rounded-lg hover:bg-current/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold opacity-80 block">
                Chapter {currentChapterNum}: {chapter?.title}
              </label>
              <textarea
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="Optional reflection or note for this passage..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-current/20 bg-current/5 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={handleSaveBookmark}
              disabled={bookmarkSaved}
              className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
            >
              {bookmarkSaved ? (
                <>
                  <Check size={16} />
                  <span>Bookmark Saved!</span>
                </>
              ) : (
                <span>Save Bookmark</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookReader;
