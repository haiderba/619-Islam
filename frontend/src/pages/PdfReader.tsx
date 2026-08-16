import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Check, 
  Hash, 
  BookOpen, 
  Maximize2, 
  Minimize2,
  ZoomIn,
  ZoomOut,
  X,
  FileText
} from 'lucide-react';
import { booksApi } from '../services/booksApi';
import { BookDetail } from '../types/books';

const PdfReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPage = Number(searchParams.get('page')) || 1;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(100);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGotoModal, setShowGotoModal] = useState<boolean>(false);
  const [gotoPageInput, setGotoPageInput] = useState<string>('');
  const [bookmarkSaved, setBookmarkSaved] = useState<boolean>(false);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // Load Book & PDF source
  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      setLoading(true);
      const data = await booksApi.getBookDetail(Number(id));
      setBook(data);

      if (data?.total_pages) {
        setTotalPages(data.total_pages);
      }

      // Check saved position in localStorage
      const savedPage = localStorage.getItem(`619_book_pdf_page_${id}`);
      if (savedPage && !searchParams.get('page')) {
        const pageNum = parseInt(savedPage);
        setCurrentPage(pageNum);
        setSearchParams({ page: String(pageNum) });
      }

      setLoading(false);
    };

    fetchBook();
  }, [id]);

  const pdfSource = book?.sources?.find(s => s.pdf_url) || null;
  const pdfUrl = pdfSource?.pdf_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSearchParams({ page: String(newPage) });
      localStorage.setItem(`619_book_pdf_page_${id}`, String(newPage));
      
      // Update progress %
      if (book) {
        const percent = Math.min(Math.round((newPage / totalPages) * 100), 100);
        booksApi.updateProgress(book.id, newPage, percent);
      }
    }
  };

  const handleGotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(gotoPageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setShowGotoModal(false);
      setGotoPageInput('');
    }
  };

  const handleSaveBookmark = async () => {
    if (!book) return;
    await booksApi.createBookmark({
      book_id: book.id,
      chapter_number: currentPage,
      title: `Page ${currentPage} (${book.title})`,
      note: `PDF Bookmark at page ${currentPage}`
    });
    setBookmarkSaved(true);
    setTimeout(() => setBookmarkSaved(false), 2000);
  };

  const handleCopyCitation = () => {
    if (!book) return;
    const citation = `${book.title} (Page ${currentPage}), by ${book.author?.name || 'Classical Scholar'}. Accessed via 619 Islam PDF Library.`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#081819] text-white flex flex-col justify-between select-none">
      {/* ── 📱 MINIMAL TOP HEADER ── */}
      <header className="h-14 bg-[#062426]/95 backdrop-blur-md border-b border-amber-500/30 px-4 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(`/books/${id}`)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all active:scale-95 shrink-0"
            aria-label="Back to Book Overview"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs font-black truncate text-white">
              {book?.title || 'Islamic Classical Book'}
            </h1>
            <p className="text-[10px] text-amber-400 font-bold truncate">
              Original Scanned Edition • Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Switch to Digital Text Reader if available */}
          {book && book.is_readable && (
            <button
              onClick={() => navigate(`/books/${id}/read?chapter=1`)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-black text-[11px] font-black flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <BookOpen size={12} />
              <span>Digital Text</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white active:scale-95 transition-all"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* ── 📄 PDF VIEWER CANVAS ── */}
      <main className="flex-1 relative bg-[#041415] overflow-hidden flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-pulse">
              <FileText size={24} />
            </div>
            <p className="text-xs font-bold text-amber-300">Loading Original Manuscript PDF...</p>
            <span className="text-[10px] text-white/60">Optimizing for high-resolution reading</span>
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0`}
            title={book?.title || 'PDF Reader'}
            className="w-full h-full border-none transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          />
        )}
      </main>

      {/* ── 📱 THUMB-ZONE BOTTOM CONTROLS ── */}
      <footer className="h-16 bg-[#062426]/95 backdrop-blur-md border-t border-amber-500/30 px-4 flex items-center justify-between gap-2 shrink-0 z-20 safe-area-pb">
        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Jump Modal Trigger */}
        <button
          onClick={() => setShowGotoModal(true)}
          className="px-3.5 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 active:scale-95 transition-all text-xs font-black flex items-center gap-1.5 shadow-sm"
        >
          <Hash size={14} className="text-amber-400" />
          <span>Page {currentPage} / {totalPages}</span>
        </button>

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>

        {/* Secondary Tool Actions */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 15, 160))}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white active:scale-95"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>

          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 15, 80))}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          {/* Bookmark Page */}
          <button
            onClick={handleSaveBookmark}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              bookmarkSaved ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 text-rose-400'
            }`}
            title="Bookmark Page"
          >
            {bookmarkSaved ? <Check size={16} /> : <Bookmark size={16} />}
          </button>

          {/* Citation Share */}
          <button
            onClick={handleCopyCitation}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-sky-400 hover:text-white active:scale-95"
            title="Copy Citation"
          >
            {copiedCitation ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
          </button>
        </div>
      </footer>

      {/* ── 🔢 GO TO PAGE MODAL ── */}
      {showGotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#093538] border border-amber-500/40 rounded-3xl p-6 max-w-xs w-full shadow-2xl text-white space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={18} className="text-amber-400" />
                <h3 className="text-sm font-black">Jump to Page</h3>
              </div>
              <button onClick={() => setShowGotoModal(false)} className="p-1 rounded-full text-white/60 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGotoSubmit} className="space-y-3">
              <p className="text-xs text-white/70">
                Enter page number (1 to {totalPages}):
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={gotoPageInput}
                  onChange={(e) => setGotoPageInput(e.target.value)}
                  placeholder={String(currentPage)}
                  className="flex-1 bg-black/40 border border-white/20 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-sm text-white font-bold outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 text-black font-black text-xs rounded-2xl shadow-md active:scale-95"
                >
                  Go
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfReader;
