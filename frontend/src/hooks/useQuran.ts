import { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getTodayDateString } from '../utils/dateUtils';
import { QuranOfflineService } from '../services/quranOfflineService';

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranWord {
  id: number;
  position: number;
  textUthmani: string;
  translation: string;
  audioUrl?: string;
}

export interface Ayah {
  number: number; // Global verse number
  text: string;
  numberInSurah: number;
  verseKey: string; // e.g. "1:1"
  audio?: string;
  translation?: string;
  words?: QuranWord[];
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export interface ChapterInfo {
  chapterId: number;
  shortText: string;
  text: string;
  source: string;
}

export interface TafsirData {
  id: number;
  name: string;
  authorName: string;
  verseKey: string;
  text: string;
}

export interface QuranSearchResult {
  verseKey: string;
  text: string;
  translation: string;
  surahNumber: number;
  ayahNumber: number;
}

export const QARI_OPTIONS = [
  { id: '7', name: 'Mishary Rashid Alafasy' },
  { id: '2', name: 'AbdulBaset AbdulSamad (Murattal)' },
  { id: '1', name: 'AbdulBaset AbdulSamad (Mujawwad)' },
  { id: '6', name: 'Mahmoud Khalil Al-Husary' },
  { id: '9', name: 'Mohamed Siddiq al-Minshawi (Murattal)' },
  { id: '8', name: 'Mohamed Siddiq al-Minshawi (Mujawwad)' },
  { id: '3', name: 'Abdur-Rahman as-Sudais' },
  { id: '4', name: 'Abu Bakr Al-Shatri' },
  { id: '12', name: 'Maher Al-Muaiqly' },
  { id: '5', name: 'Saad Al-Ghamdi' },
  { id: '11', name: 'Yasser Ad-Dussary' },
];

export const TAFSIR_OPTIONS = [
  { id: 169, name: 'Tafsir Ibn Kathir (English)', lang: 'en' },
  { id: 16, name: 'Tafsir Muyassar (Arabic)', lang: 'ar' },
  { id: 171, name: 'Tafsir Al-Jalalayn (Arabic)', lang: 'ar' },
  { id: 170, name: 'Tafsir As-Saadi (Arabic)', lang: 'ar' },
  { id: 160, name: 'Tafsir Ahsanul Bayaan (Urdu)', lang: 'ur' },
];

const QURAN_API_HEADERS = {
  "Accept": "application/json"
};

export function useQuran() {
  const { user } = useAuth();
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Audio state
  const [selectedQari, setSelectedQari] = useState(QARI_OPTIONS[0].id);

  // Offline status
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{ isDownloaded: boolean; reciterName?: string; reciterId?: string }>({ isDownloaded: false });
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadingSurah, setDownloadingSurah] = useState<number>(0);
  const [downloadingVoice, setDownloadingVoice] = useState<string>('');

  useEffect(() => {
    fetchSurahList();
    checkOfflineStatus();
  }, []);

  const checkOfflineStatus = async () => {
    const info = await QuranOfflineService.getDownloadInfo();
    setIsDownloaded(info.isDownloaded);
    setDownloadInfo(info);
  };

  const fetchSurahList = async () => {
    // 1. Try loading offline cached list first for instant 0ms startup
    const offlineList = await QuranOfflineService.getOfflineSurahList();
    if (offlineList && offlineList.length > 0) {
      setSurahs(offlineList);
      setLoadingList(false);
    }

    // 2. Fetch fresh list from network if online
    if (navigator.onLine) {
      try {
        const res = await axios.get('https://api.quran.com/api/v4/chapters', { headers: QURAN_API_HEADERS });
        const mappedSurahs = res.data.chapters.map((c: any) => ({
          number: c.id,
          name: c.name_arabic,
          englishName: c.name_simple,
          englishNameTranslation: c.translated_name.name,
          numberOfAyahs: c.verses_count,
          revelationType: c.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'
        }));
        setSurahs(mappedSurahs);
      } catch (err) {
        console.warn("Failed to refresh surah list from network, using offline copy if available", err);
      } finally {
        setLoadingList(false);
      }
    } else {
      setLoadingList(false);
    }
  };

  const getSurahDetail = async (surahNumber: number, includeWords: boolean = false): Promise<SurahDetail | null> => {
    // If offline or words not requested, check offline IndexedDB storage first
    if (!navigator.onLine || !includeWords) {
      const offlineDetail = await QuranOfflineService.getOfflineSurah(surahNumber);
      if (offlineDetail) {
        return offlineDetail;
      }
    }

    try {
      let translationId = user?.quran_translation || localStorage.getItem('quran_translation_pref') || '85';
      if (translationId.includes('.')) translationId = '85';
      
      const [res, chapterRes] = await Promise.all([
        axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}`, {
          headers: QURAN_API_HEADERS,
          params: {
            language: 'en',
            words: includeWords,
            word_fields: includeWords ? 'text_uthmani,audio_url,translation' : undefined,
            translations: translationId,
            audio: selectedQari,
            fields: 'text_uthmani',
            per_page: 300
          }
        }),
        axios.get(`https://api.quran.com/api/v4/chapters/${surahNumber}`, { headers: QURAN_API_HEADERS })
      ]);
      
      const versesData = res.data.verses;
      const c = chapterRes.data.chapter;
      
      const ayahs: Ayah[] = versesData.map((verse: any) => {
        let translationText = verse.translations && verse.translations.length > 0 ? verse.translations[0].text : "";
        translationText = translationText.replace(/<[^>]*>?/gm, '');

        let words: QuranWord[] | undefined;
        if (verse.words && verse.words.length > 0) {
          words = verse.words
            .filter((w: any) => w.char_type_name !== 'end')
            .map((w: any) => ({
              id: w.id,
              position: w.position,
              textUthmani: (w.text_uthmani || '').replace(/<[^>]*>?/gm, ''),
              translation: (w.translation?.text || '').replace(/<[^>]*>?/gm, ''),
              audioUrl: w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : undefined
            }));
        }

        // Clean Uthmani Arabic text without broken XML/HTML tags
        let arabicText = verse.text_uthmani || verse.text_uthmani_simple || '';
        arabicText = arabicText.replace(/<[^>]*>?/gm, '').trim();

        return {
          number: verse.id,
          numberInSurah: verse.verse_number,
          verseKey: verse.verse_key || `${surahNumber}:${verse.verse_number}`,
          text: arabicText,
          translation: translationText,
          audio: verse.audio?.url ? `https://verses.quran.com/${verse.audio.url}` : undefined,
          words,
        };
      });

      return {
        number: surahNumber,
        name: c.name_arabic,
        englishName: c.name_simple,
        englishNameTranslation: c.translated_name?.name || "",
        numberOfAyahs: c.verses_count,
        revelationType: c.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
        ayahs
      };
    } catch (err) {
      console.warn("Network load failed, attempting fallback to offline store", err);
      const offlineDetail = await QuranOfflineService.getOfflineSurah(surahNumber);
      return offlineDetail;
    }
  };

  // Download entire Quran with selected Reciter Voice
  const downloadQuran = async (reciterId: string = selectedQari) => {
    try {
      setDownloadProgress(0);
      setDownloadingSurah(1);
      const qariObj = QARI_OPTIONS.find(q => q.id === reciterId) || QARI_OPTIONS[0];
      setDownloadingVoice(qariObj.name);

      await QuranOfflineService.downloadCompleteQuran(reciterId, (percent, current, _total, reciterName) => {
        setDownloadProgress(percent);
        setDownloadingSurah(current);
        setDownloadingVoice(reciterName);
      });

      const info = await QuranOfflineService.getDownloadInfo();
      setIsDownloaded(true);
      setDownloadInfo(info);
      setDownloadProgress(null);
    } catch (e) {
      console.error("Failed to download Quran", e);
      setDownloadProgress(null);
      throw e;
    }
  };

  // Delete downloaded offline Quran
  const deleteOfflineQuran = async () => {
    await QuranOfflineService.deleteOfflineQuran();
    setIsDownloaded(false);
    setDownloadInfo({ isDownloaded: false });
  };

  // Fetch Chapter Historical Background & Info
  const getChapterInfo = async (chapterId: number): Promise<ChapterInfo | null> => {
    try {
      const res = await axios.get(`https://api.quran.com/api/v4/chapters/${chapterId}/info?language=en`, {
        headers: QURAN_API_HEADERS
      });
      const data = res.data.chapter_info;
      return {
        chapterId,
        shortText: data.short_text || '',
        text: data.text || '',
        source: data.source || 'Quran.com'
      };
    } catch (e) {
      console.error(`Failed to fetch info for chapter ${chapterId}`, e);
      return null;
    }
  };

  // Fetch Tafsir for a specific Ayah
  const getTafsir = async (verseKey: string, tafsirId: number = 169): Promise<TafsirData | null> => {
    try {
      const res = await axios.get(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`, {
        headers: QURAN_API_HEADERS
      });
      const tafsir = res.data.tafsir;
      return {
        id: tafsirId,
        name: tafsir.resource_name || 'Tafsir',
        authorName: tafsir.author_name || 'Ibn Kathir',
        verseKey,
        text: tafsir.text || ''
      };
    } catch (e) {
      console.error(`Failed to fetch tafsir for ${verseKey}`, e);
      return null;
    }
  };

  // Global Full-Text Quran Search
  const searchQuranGlobal = async (query: string, page: number = 1): Promise<{ results: QuranSearchResult[]; total: number }> => {
    if (!query.trim()) return { results: [], total: 0 };
    try {
      const res = await axios.get('https://api.quran.com/api/v4/search', {
        headers: QURAN_API_HEADERS,
        params: {
          q: query.trim(),
          size: 15,
          page,
          language: 'en'
        }
      });
      const searchData = res.data.search;
      const rawResults = searchData.results || [];
      const results: QuranSearchResult[] = rawResults.map((r: any) => {
        const [s, a] = r.verse_key.split(':').map(Number);
        return {
          verseKey: r.verse_key,
          text: r.text,
          translation: (r.translations && r.translations.length > 0) ? r.translations[0].text.replace(/<[^>]*>?/gm, '') : '',
          surahNumber: s,
          ayahNumber: a
        };
      });

      return {
        results,
        total: searchData.total_results || 0
      };
    } catch (e) {
      console.error('Quran search failed', e);
      return { results: [], total: 0 };
    }
  };

  const markSurahRead = async (surahNumber: number) => {
    try {
      const today = getTodayDateString();
      await api.post('/progress', {
        goal_id: `quran_surah_${surahNumber}`,
        date: today,
        completed: true
      });
    } catch (err) {
      console.error("Failed to mark surah as read", err);
    }
  };

  return { 
    surahs, 
    loadingList, 
    getSurahDetail, 
    getChapterInfo,
    getTafsir,
    searchQuranGlobal,
    selectedQari, 
    setSelectedQari,
    markSurahRead,
    isDownloaded,
    downloadInfo,
    downloadProgress,
    downloadingSurah,
    downloadingVoice,
    downloadQuran,
    deleteOfflineQuran
  };
}
