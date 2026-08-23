import { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../config/api';
import { useAuth } from '../context/AuthContext';
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
  translation?: string; // Primary translation
  primaryTranslationId?: string;
  secondaryTranslation?: string; // Secondary translation (optional)
  secondaryTranslationId?: string;
  words?: QuranWord[];
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
  primaryTranslationId?: string;
  secondaryTranslationId?: string;
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

export interface TranslationOption {
  id: string;
  name: string;
  lang: string;
  isRtl: boolean;
}

export const AVAILABLE_TRANSLATIONS: TranslationOption[] = [
  { id: "85", name: "English (M.A.S. Abdel Haleem)", lang: "en", isRtl: false },
  { id: "20", name: "English (Saheeh International)", lang: "en", isRtl: false },
  { id: "234", name: "Urdu (Fatah Muhammad Jalandhari)", lang: "ur", isRtl: true },
  { id: "158", name: "Urdu (Dr. Israr Ahmad - Bayan-ul-Quran)", lang: "ur", isRtl: true },
  { id: "54", name: "Urdu (Maulana Muhammad Junagarhi)", lang: "ur", isRtl: true },
  { id: "831", name: "Roman Urdu (Abul Ala Maududi)", lang: "ur-Latn", isRtl: false },
  { id: "118", name: "Pashto / پښتو (Zakaria Abulsalam)", lang: "ps", isRtl: true },
  { id: "238", name: "Sindhi / سنڌي (Taj Mehmood Amroti)", lang: "sd", isRtl: true },
  { id: "122", name: "Hindi / हिन्दी (Maulana Azizul Haque)", lang: "hi", isRtl: false },
  { id: "31", name: "French (Muhammad Hamidullah)", lang: "fr", isRtl: false },
  { id: "83", name: "Spanish (Sheikh Isa Garcia)", lang: "es", isRtl: false },
];

export interface QariOption {
  id: string;
  name: string;
  arabicName?: string;
  lang?: 'ar' | 'ur';
  isTranslation?: boolean;
  translator?: string;
}

export const QARI_OPTIONS: QariOption[] = [
  // 🎙️ Renowned Arabic Qaris
  { id: '7', name: 'Mishary Rashid Alafasy', lang: 'ar' },
  { id: '2', name: 'AbdulBaset AbdulSamad (Murattal)', lang: 'ar' },
  { id: '1', name: 'AbdulBaset AbdulSamad (Mujawwad)', lang: 'ar' },
  { id: '3', name: 'Abdur-Rahman as-Sudais', lang: 'ar' },
  { id: '9', name: 'Mohamed Siddiq al-Minshawi (Murattal)', lang: 'ar' },
  { id: '8', name: 'Mohamed Siddiq al-Minshawi (Mujawwad)', lang: 'ar' },
  { id: '6', name: 'Mahmoud Khalil Al-Husary', lang: 'ar' },
  { id: '4', name: 'Abu Bakr Al-Shatri', lang: 'ar' },
  { id: '12', name: 'Maher Al-Muaiqly', lang: 'ar' },
  { id: '5', name: 'Saad Al-Ghamdi', lang: 'ar' },
  { id: '11', name: 'Yasser Ad-Dussary', lang: 'ar' },

  // 🇵🇰 Urdu Voice Translations
  { 
    id: 'urdu_jalandhari', 
    name: 'Urdu Voice (Fateh Jalandhari - Shamshad Ali Khan)', 
    lang: 'ur',
    isTranslation: true,
    translator: 'Fateh Muhammad Jalandhari'
  },
  { 
    id: 'urdu_farhat', 
    name: 'Urdu Voice (Dr. Farhat Hashmi)', 
    lang: 'ur',
    isTranslation: true,
    translator: 'Dr. Farhat Hashmi'
  },
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
    fetchSurahs();
    checkDownloadStatus();
  }, []);

  const checkDownloadStatus = async () => {
    const info = await QuranOfflineService.getDownloadInfo();
    setDownloadInfo(info);
    setIsDownloaded(info.isDownloaded);
  };

  const fetchSurahs = async () => {
    setLoadingList(true);
    
    // Fetch fresh list from network if online
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
        console.warn("Failed to refresh surah list from network", err);
      } finally {
        setLoadingList(false);
      }
    } else {
      setLoadingList(false);
    }
  };

  const getSurahDetail = async (
    surahNumber: number, 
    includeWords: boolean = false,
    customPrimaryTrans?: string,
    customSecondaryTrans?: string
  ): Promise<SurahDetail | null> => {
    // If offline or words not requested and no custom translation override, check offline IndexedDB storage first
    if (!navigator.onLine && !includeWords && !customPrimaryTrans) {
      const offlineDetail = await QuranOfflineService.getOfflineSurah(surahNumber);
      if (offlineDetail) {
        return offlineDetail;
      }
    }

    try {
      let primaryId = customPrimaryTrans || user?.quran_translation || localStorage.getItem('quran_primary_translation') || '85';
      if (primaryId.includes('.')) primaryId = '85';

      let secondaryId = customSecondaryTrans !== undefined 
        ? customSecondaryTrans 
        : (localStorage.getItem('quran_secondary_translation') || '');
      
      if (secondaryId === 'none' || secondaryId === primaryId) {
        secondaryId = '';
      }

      // Build comma-separated translation query
      const activeTransIds = [primaryId, secondaryId].filter(Boolean).join(',');

      const [res, chapterRes] = await Promise.all([
        axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}`, {
          headers: QURAN_API_HEADERS,
          params: {
            language: 'en',
            words: includeWords,
            word_fields: includeWords ? 'text_uthmani,audio_url,translation' : undefined,
            translations: activeTransIds,
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
        let primaryText = '';
        let secondaryText = '';

        if (verse.translations && verse.translations.length > 0) {
          // Match primary translation by resource_id
          const pMatch = verse.translations.find((t: any) => String(t.resource_id) === String(primaryId));
          if (pMatch) {
            primaryText = pMatch.text;
          } else {
            primaryText = verse.translations[0]?.text || '';
          }

          // Match secondary translation by resource_id
          if (secondaryId) {
            const sMatch = verse.translations.find((t: any) => String(t.resource_id) === String(secondaryId));
            if (sMatch) {
              secondaryText = sMatch.text;
            }
          }
        }

        primaryText = primaryText.replace(/<[^>]*>?/gm, '').trim();
        secondaryText = secondaryText.replace(/<[^>]*>?/gm, '').trim();

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
          translation: primaryText,
          primaryTranslationId: primaryId,
          secondaryTranslation: secondaryText || undefined,
          secondaryTranslationId: secondaryId || undefined,
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
        ayahs,
        primaryTranslationId: primaryId,
        secondaryTranslationId: secondaryId
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
      console.error("Full Quran download failed", e);
      setDownloadProgress(null);
    }
  };

  // Delete downloaded offline Quran
  const deleteOfflineQuran = async () => {
    await QuranOfflineService.deleteOfflineQuran();
    setIsDownloaded(false);
    setDownloadInfo({ isDownloaded: false });
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

  const getChapterInfo = async (chapterId: number): Promise<ChapterInfo | null> => {
    try {
      const res = await axios.get(`https://api.quran.com/api/v4/chapters/${chapterId}/info`, {
        headers: QURAN_API_HEADERS,
        params: { language: 'en' }
      });
      const info = res.data.chapter_info;
      return {
        chapterId,
        shortText: (info.short_text || '').replace(/<[^>]*>?/gm, ''),
        text: (info.text || '').replace(/<[^>]*>?/gm, ''),
        source: info.source || 'Quran.com'
      };
    } catch (e) {
      console.warn("Failed to fetch chapter info", e);
      return null;
    }
  };

  const getTafsir = async (verseKey: string, tafsirId: number = 169): Promise<TafsirData | null> => {
    try {
      const res = await axios.get(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${verseKey}`, {
        headers: QURAN_API_HEADERS
      });
      const tafsir = res.data.tafsir;
      return {
        id: tafsir.id || tafsirId,
        name: tafsir.resource_name || 'Tafsir',
        authorName: tafsir.author_name || '',
        verseKey,
        text: (tafsir.text || '').replace(/<[^>]*>?/gm, '')
      };
    } catch (e) {
      console.warn("Failed to load tafsir", e);
      return null;
    }
  };

  const markSurahRead = async (surahNumber: number) => {
    try {
      await api.post(`/quran/complete/${surahNumber}`);
    } catch (e) {
      // Local fallback
      const saved = JSON.parse(localStorage.getItem('completed_surahs') || '[]');
      if (!saved.includes(surahNumber)) {
        saved.push(saved.length > 0 ? surahNumber : surahNumber);
        localStorage.setItem('completed_surahs', JSON.stringify(saved));
      }
    }
  };

  return {
    surahs,
    loadingList,
    getSurahDetail,
    searchQuranGlobal,
    getChapterInfo,
    getTafsir,
    selectedQari,
    setSelectedQari,
    downloadQuran,
    deleteOfflineQuran,
    isDownloaded,
    downloadInfo,
    downloadProgress,
    downloadingSurah,
    downloadingVoice,
    markSurahRead,
  };
}
