import React, { useState, useEffect } from 'react';
import { useQuran, QuranSearchResult, QARI_OPTIONS } from '../hooks/useQuran';
import { Search, Book, PlayCircle, Trophy, Sparkles, MapPin, BookOpen, Layers, SearchCode, ArrowRight, Loader2, Download, CheckCircle, Trash2, HardDrive, WifiOff, Volume2, Mic, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { api } from '../config/api';
import axios from 'axios';

const QURAN_API_HEADERS = { 'Accept': 'application/json' };

type BrowseMode = 'surah' | 'juz' | 'revelation' | 'search';

interface JuzItem {
  juz_number: number;
  verse_mapping: Record<string, string>;
  verses_count: number;
  first_verse_id: number;
}

const ITEMS_PER_PAGE = 10;

const TOPIC_CHIPS = [
  { label: '🌿 Patience', query: 'patience' },
  { label: '🤲 Forgiveness', query: 'forgiveness' },
  { label: '👨‍👩‍👧 Parents', query: 'parents' },
  { label: '🌴 Paradise', query: 'paradise' },
  { label: '💧 Mercy', query: 'mercy' },
  { label: '💖 Gratitude', query: 'grateful' },
  { label: '🛡️ Trust in Allah', query: 'trust' },
  { label: '🌙 Fasting', query: 'fasting' },
];

const PaginationBar: React.FC<{ page: number; total: number; onPrev: () => void; onNext: () => void }> = ({ page, total, onPrev, onNext }) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <button onClick={onPrev} disabled={page === 1}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${page === 1 ? 'bg-surface text-muted cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
        Previous
      </button>
      <span className="text-sm font-medium text-subtext">Page {page} of {total}</span>
      <button onClick={onNext} disabled={page >= total}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${page >= total ? 'bg-surface text-muted cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
        Next
      </button>
    </div>
  );
};

const Quran: React.FC = () => {
  // ── ALL HOOKS FIRST (Rules of Hooks) ──────────────────────────────────────
  const { 
    surahs, 
    loadingList, 
    searchQuranGlobal,
    isDownloaded,
    downloadInfo,
    downloadProgress,
    downloadingSurah,
    downloadingVoice,
    downloadQuran,
    deleteOfflineQuran
  } = useQuran();
  const { isOnline } = useNetworkStatus();
  const navigate = useNavigate();

  const [selectedVoice, setSelectedVoice] = useState<string>(QARI_OPTIONS[0].id);
  const [showVoiceSelect, setShowVoiceSelect] = useState<boolean>(false);

  const [search, setSearch] = useState('');
  const [browseMode, setBrowseMode] = useState<BrowseMode>('surah');
  const [completedSurahs, setCompletedSurahs] = useState<Set<number>>(new Set());
  const [lastRead, setLastRead] = useState<{ surahNumber: number; surahName: string; ayahNumber: number } | null>(null);
  const [juzList, setJuzList] = useState<JuzItem[]>([]);
  const [loadingJuz, setLoadingJuz] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [juzPage, setJuzPage] = useState(1);
  const [revelationPage, setRevelationPage] = useState(1);

  // Global Quran Search State
  const [searchResults, setSearchResults] = useState<QuranSearchResult[]>([]);
  const [searchTotal, setSearchTotal] = useState<number>(0);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [activeTopic, setActiveTopic] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lastReadQuran');
      if (saved) setLastRead(JSON.parse(saved));
    } catch (_) {}

    const loadProgress = async () => {
      try {
        const res = await api.get('/progress');
        const ids = new Set<number>();
        res.data
          .filter((c: any) => c.goal_id?.startsWith('quran_surah_'))
          .forEach((c: any) => {
            const n = parseInt(c.goal_id.replace('quran_surah_', ''));
            if (!isNaN(n)) ids.add(n);
          });
        setCompletedSurahs(ids);
      } catch (_) {}
    };
    loadProgress();
  }, []);

  useEffect(() => {
    if (browseMode === 'juz' && juzList.length === 0) {
      setLoadingJuz(true);
      axios.get('https://api.quran.com/api/v4/juzs', { headers: QURAN_API_HEADERS })
        .then(res => {
          const seen = new Set<number>();
          const unique = (res.data.juzs as JuzItem[]).filter(j => {
            if (seen.has(j.juz_number)) return false;
            seen.add(j.juz_number);
            return true;
          });
          setJuzList(unique.sort((a, b) => a.juz_number - b.juz_number));
        })
        .catch(() => {})
        .finally(() => setLoadingJuz(false));
    }
  }, [browseMode, juzList.length]);

  // Reset pages when mode or search changes
  useEffect(() => {
    setCurrentPage(1);
    setJuzPage(1);
    setRevelationPage(1);
  }, [browseMode, search]);

  const handleExecuteGlobalSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setSearchLoading(true);
    const { results, total } = await searchQuranGlobal(queryToSearch);
    setSearchResults(results);
    setSearchTotal(total);
    setSearchLoading(false);
  };

  const handleTopicClick = (query: string, label: string) => {
    setActiveTopic(label);
    setSearch(query);
    handleExecuteGlobalSearch(query);
  };

  // ── DERIVED VARIABLES (after all hooks) ───────────────────────────────────
  const meccanSurahs = surahs.filter(s => s.revelationType?.toLowerCase() === 'meccan' || s.revelationType?.toLowerCase() === 'makkah');
  const medinanSurahs = surahs.filter(s => s.revelationType?.toLowerCase() === 'medinan' || s.revelationType?.toLowerCase() === 'madinah');

  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search) ||
    s.englishNameTranslation.toLowerCase().includes(search.toLowerCase())
  );

  const progressPercentage = Math.round((completedSurahs.size / 114) * 100);

  const totalPages = Math.ceil(filteredSurahs.length / ITEMS_PER_PAGE);
  const paginatedSurahs = filteredSurahs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const juzTotalPages = Math.ceil(juzList.length / ITEMS_PER_PAGE);
  const paginatedJuz = juzList.slice((juzPage - 1) * ITEMS_PER_PAGE, juzPage * ITEMS_PER_PAGE);

  const meccanTotal = Math.ceil(meccanSurahs.length / ITEMS_PER_PAGE);
  const medinanTotal = Math.ceil(medinanSurahs.length / ITEMS_PER_PAGE);
  const revTotal = Math.max(meccanTotal, medinanTotal);
  const paginatedMeccan = meccanSurahs.slice((revelationPage - 1) * ITEMS_PER_PAGE, revelationPage * ITEMS_PER_PAGE);
  const paginatedMedinan = medinanSurahs.slice((revelationPage - 1) * ITEMS_PER_PAGE, revelationPage * ITEMS_PER_PAGE);

  const BROWSE_TABS: { id: BrowseMode; label: string; icon: React.ReactNode }[] = [
    { id: 'surah', label: 'Surah', icon: <Book size={14} /> },
    { id: 'juz', label: 'Juz', icon: <Layers size={14} /> },
    { id: 'revelation', label: 'Revelation', icon: <MapPin size={14} /> },
    { id: 'search', label: 'Search', icon: <SearchCode size={14} /> },
  ];

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 pb-28 max-w-6xl mx-auto w-full">
      <header className="mb-4 pt-1">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-black text-text tracking-tight">The Holy Quran</h1>
          {!isOnline && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
              <WifiOff size={12} />
              <span>Offline</span>
            </span>
          )}
        </div>

        {/* Dashboard Cards */}
        <div className="space-y-4 mb-5">
          {/* Progress Card */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-accentGold" />
                <span className="font-bold text-text text-sm">Quran Progress</span>
              </div>
              <span className="font-bold text-primary text-sm">{progressPercentage}%</span>
            </div>
            <div className="relative z-10 w-full bg-surface rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-primary to-accentGold h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
            </div>
            <p className="text-xs text-subtext relative z-10">{completedSurahs.size} of 114 Surahs Completed</p>
            <Book size={90} className="absolute -right-3 -bottom-3 text-surface opacity-40 z-0 pointer-events-none" />
          </div>

          {/* Last Read / Motivational */}
          {lastRead ? (
            <div onClick={() => navigate(`/quran/${lastRead.surahNumber}`)}
              className="bg-gradient-to-br from-primary to-primary-dark p-5 rounded-2xl shadow-lg shadow-primary/20 text-white cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 text-white/80">
                  <BookOpen size={15} />
                  <span className="text-xs font-medium">Continue Reading</span>
                </div>
                <h3 className="text-lg font-bold">{lastRead.surahName}</h3>
                <p className="text-white/70 text-xs">Ayah {lastRead.ayahNumber}</p>
              </div>
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                <PlayCircle size={26} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border p-4 rounded-xl flex items-start gap-3">
              <Sparkles size={18} className="text-accentGold shrink-0 mt-0.5" />
              <p className="text-xs text-subtext italic leading-relaxed">
                "The best among you are those who learn the Quran and teach it."<br />— Sahih al-Bukhari
              </p>
            </div>
          )}

          {/* 📥 Offline Quran Download & Storage Status Card */}
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            {downloadProgress !== null ? (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-text mb-2">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Downloading Quran & Audio...</span>
                  </span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden mb-2">
                  <div 
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-subtext">
                  <span>Surah {downloadingSurah} of 114</span>
                  <span className="text-primary font-medium flex items-center gap-1">
                    <Mic size={11} />
                    <span>Voice: {downloadingVoice}</span>
                  </span>
                </div>
              </div>
            ) : isDownloaded && !showVoiceSelect ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text">Complete Quran Downloaded</h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                      <Mic size={11} />
                      <span>Voice: {downloadInfo.reciterName || 'Mishary Rashid Alafasy'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowVoiceSelect(true)}
                    className="px-2.5 py-1.5 bg-surface hover:bg-border/60 text-text rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                    title="Change recitation voice"
                  >
                    <RefreshCw size={11} />
                    <span>Change Voice</span>
                  </button>
                  <button
                    onClick={deleteOfflineQuran}
                    className="p-2 text-muted hover:text-danger rounded-xl hover:bg-danger/10 transition-colors text-xs"
                    title="Remove offline storage"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <HardDrive size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text">
                        {isDownloaded ? 'Change Recitation Voice' : 'Download Quran & Voice'}
                      </h4>
                      <p className="text-[10px] text-subtext">
                        Select one voice among 7 reciters to save offline
                      </p>
                    </div>
                  </div>
                  {showVoiceSelect && (
                    <button
                      onClick={() => setShowVoiceSelect(false)}
                      className="text-xs text-muted hover:text-text"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Voice Selection Dropdown */}
                <div className="bg-surface p-2.5 rounded-xl border border-border">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1">
                    <Volume2 size={12} className="text-primary" />
                    <span>Select Voice:</span>
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg py-2 px-3 text-xs font-semibold text-text outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {QARI_OPTIONS.map((qari) => (
                      <option key={qari.id} value={qari.id}>
                        🎙️ {qari.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Download Action Button */}
                <button
                  onClick={() => {
                    setShowVoiceSelect(false);
                    downloadQuran(selectedVoice);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-98"
                >
                  <Download size={14} />
                  <span>
                    Download 114 Surahs ({QARI_OPTIONS.find(q => q.id === selectedVoice)?.name})
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-muted" />
          </div>
          <input 
            type="text" 
            placeholder={browseMode === 'search' ? "Search 6,236 verses across whole Quran..." : "Search by English, Arabic name..."} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && browseMode === 'search') {
                handleExecuteGlobalSearch(search);
              }
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm" 
          />
          {browseMode === 'search' && (
            <button
              onClick={() => handleExecuteGlobalSearch(search)}
              className="absolute inset-y-1.5 right-1.5 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          )}
        </div>

        {/* Browse Mode 4-Tab Toggle */}
        <div className="grid grid-cols-4 gap-1 bg-surface border border-border rounded-2xl p-1">
          {BROWSE_TABS.map(tab => (
            <button key={tab.id} onClick={() => setBrowseMode(tab.id)}
              className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
                browseMode === tab.id ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-subtext hover:text-text'
              }`}>
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ─── SURAH MODE ─── */}
      {browseMode === 'surah' && (
        loadingList ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginatedSurahs.map(surah => {
                const done = completedSurahs.has(surah.number);
                return (
                  <div key={surah.number} onClick={() => navigate(`/quran/${surah.number}`)}
                    className="flex items-center justify-between p-3.5 bg-card border border-border rounded-2xl hover:border-primary/30 shadow-sm transition-all cursor-pointer relative overflow-hidden">
                    {done && <div className="absolute left-0 top-0 bottom-0 w-1 bg-success rounded-l-2xl" />}
                    <div className="flex items-center gap-3.5 pl-1">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {surah.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-text">{surah.englishName}</h3>
                        <p className="text-[11px] text-subtext">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs</p>
                      </div>
                    </div>
                    <span className="font-arabic text-lg text-primary font-bold">{surah.name}</span>
                  </div>
                );
              })}
            </div>
            {filteredSurahs.length === 0 && (
              <div className="text-center py-10">
                <Book size={40} className="mx-auto text-muted mb-3" />
                <p className="text-subtext text-sm">No Surahs found.</p>
              </div>
            )}
            <PaginationBar page={currentPage} total={totalPages}
              onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
              onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
          </div>
        )
      )}

      {/* ─── JUZ MODE ─── */}
      {browseMode === 'juz' && (
        loadingJuz ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {paginatedJuz.map(juz => {
                const surahNums = Object.keys(juz.verse_mapping).map(Number);
                const first = surahs.find(s => s.number === surahNums[0]);
                const last = surahs.find(s => s.number === surahNums[surahNums.length - 1]);
                return (
                  <div key={juz.juz_number} onClick={() => navigate(`/quran/${surahNums[0]}`)}
                    className="p-4 bg-card border border-border rounded-2xl hover:border-primary/40 shadow-sm transition-all cursor-pointer flex flex-col justify-between h-32 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-lg">
                        Juz {juz.juz_number}
                      </span>
                      <span className="text-xs text-subtext">{juz.verses_count} Verses</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text group-hover:text-primary transition-colors">
                        {first?.englishName || `Surah ${surahNums[0]}`}
                      </h4>
                      {last && last.number !== first?.number && (
                        <p className="text-[11px] text-subtext">to {last.englishName}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <PaginationBar page={juzPage} total={juzTotalPages}
              onPrev={() => setJuzPage(p => Math.max(1, p - 1))}
              onNext={() => setJuzPage(p => Math.min(juzTotalPages, p + 1))} />
          </div>
        )
      )}

      {/* ─── REVELATION MODE ─── */}
      {browseMode === 'revelation' && (
        <div className="space-y-4 mt-2">
          {/* Meccan */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold">
                Meccan Surahs ({meccanSurahs.length})
              </span>
            </div>
            <div className="space-y-2">
              {paginatedMeccan.map(surah => (
                <div key={surah.number} onClick={() => navigate(`/quran/${surah.number}`)}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:border-amber-500/30 cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-text">{surah.englishName}</h4>
                      <p className="text-[10px] text-subtext">{surah.numberOfAyahs} Ayahs</p>
                    </div>
                  </div>
                  <span className="font-arabic text-base text-amber-500 font-bold">{surah.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medinan */}
          <div>
            <div className="flex items-center gap-2 mb-2 pt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                Medinan Surahs ({medinanSurahs.length})
              </span>
            </div>
            <div className="space-y-2">
              {paginatedMedinan.map(surah => (
                <div key={surah.number} onClick={() => navigate(`/quran/${surah.number}`)}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:border-emerald-500/30 cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-text">{surah.englishName}</h4>
                      <p className="text-[10px] text-subtext">{surah.numberOfAyahs} Ayahs</p>
                    </div>
                  </div>
                  <span className="font-arabic text-base text-emerald-500 font-bold">{surah.name}</span>
                </div>
              ))}
            </div>
          </div>

          <PaginationBar page={revelationPage} total={revTotal}
            onPrev={() => setRevelationPage(p => Math.max(1, p - 1))}
            onNext={() => setRevelationPage(p => Math.min(revTotal, p + 1))} />
        </div>
      )}

      {/* ─── 🔍 GLOBAL FULL-TEXT QURAN SEARCH MODE ─── */}
      {browseMode === 'search' && (
        <div className="space-y-4 mt-2">
          {/* Topic Suggestion Chips */}
          <div>
            <p className="text-xs font-bold text-subtext uppercase tracking-wider mb-2">Explore Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTopicClick(chip.query, chip.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    activeTopic === chip.label
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-card hover:bg-surface border-border text-subtext hover:text-text'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search State / Results */}
          {searchLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 size={24} className="text-primary animate-spin mb-2" />
              <p className="text-xs text-subtext">Searching 6,236 verses across the Quran...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-subtext px-1">
                <span>Found {searchTotal} matching verses</span>
                <span>Keyword: <strong className="text-primary">"{search}"</strong></span>
              </div>

              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/quran/${res.surahNumber}`)}
                  className="p-4 bg-card border border-border hover:border-primary/40 rounded-2xl shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-primary/10 text-primary rounded-lg">
                      Surah {res.surahNumber} • Ayah {res.ayahNumber}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-subtext group-hover:text-primary transition-colors font-medium">
                      <span>Read Surah</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>

                  <p className="font-arabic text-xl text-right text-text leading-relaxed mb-2" dir="rtl">
                    {res.text}
                  </p>

                  {res.translation && (
                    <p className="text-xs text-subtext italic leading-relaxed">
                      "{res.translation}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : search ? (
            <div className="text-center py-10 bg-card border border-border rounded-2xl p-6">
              <Search size={32} className="mx-auto text-muted mb-2" />
              <p className="text-sm font-bold text-text">No verses found for "{search}"</p>
              <p className="text-xs text-subtext mt-1">Try searching for concepts like "mercy", "patience", or "paradise".</p>
            </div>
          ) : (
            <div className="text-center py-8 bg-card/60 border border-dashed border-border rounded-2xl p-6">
              <SearchCode size={32} className="mx-auto text-primary mb-2 opacity-80" />
              <p className="text-sm font-bold text-text">Quran Full-Text Search</p>
              <p className="text-xs text-subtext mt-1 max-w-xs mx-auto">
                Search any word, concept, prophet, or topic across the entire Holy Quran.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quran;
