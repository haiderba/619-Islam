// IndexedDB Offline Storage Service for the Complete Holy Quran & Audio
import { SurahDetail, SurahMeta, QARI_OPTIONS } from '../hooks/useQuran';
import axios from 'axios';

const DB_NAME = '619_Islam_Offline_DB';
const DB_VERSION = 1;
const STORE_SURAHS = 'surahs';
const STORE_META = 'metadata';

const QURAN_API_HEADERS = {
  "Accept": "application/json"
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_SURAHS)) {
        db.createObjectStore(STORE_SURAHS, { keyPath: 'number' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface DownloadInfo {
  isDownloaded: boolean;
  downloadedAt?: string;
  totalSurahs?: number;
  reciterId?: string;
  reciterName?: string;
}

export class QuranOfflineService {
  /**
   * Check if Quran has been downloaded for offline reading
   */
  static async isDownloaded(): Promise<boolean> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_META, 'readonly');
        const store = tx.objectStore(STORE_META);
        const req = store.get('quran_download_info');
        req.onsuccess = () => {
          resolve(!!req.result?.isDownloaded);
        };
        req.onerror = () => resolve(false);
      });
    } catch (_) {
      return false;
    }
  }

  /**
   * Get metadata about downloaded Quran and selected reciter
   */
  static async getDownloadInfo(): Promise<DownloadInfo> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_META, 'readonly');
        const store = tx.objectStore(STORE_META);
        const req = store.get('quran_download_info');
        req.onsuccess = () => {
          resolve(req.result || { isDownloaded: false });
        };
        req.onerror = () => resolve({ isDownloaded: false });
      });
    } catch (_) {
      return { isDownloaded: false };
    }
  }

  /**
   * Get all Surahs list from local IndexedDB
   */
  static async getOfflineSurahList(): Promise<SurahMeta[] | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_META, 'readonly');
        const store = tx.objectStore(STORE_META);
        const req = store.get('surahs_list');
        req.onsuccess = () => {
          resolve(req.result?.list || null);
        };
        req.onerror = () => resolve(null);
      });
    } catch (_) {
      return null;
    }
  }

  /**
   * Get specific Surah from local IndexedDB
   */
  static async getOfflineSurah(surahNumber: number): Promise<SurahDetail | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SURAHS, 'readonly');
        const store = tx.objectStore(STORE_SURAHS);
        const req = store.get(surahNumber);
        req.onsuccess = () => {
          resolve(req.result || null);
        };
        req.onerror = () => resolve(null);
      });
    } catch (_) {
      return null;
    }
  }

  /**
   * Download the complete Holy Quran with chosen Reciter Voice into IndexedDB
   */
  static async downloadCompleteQuran(
    reciterId: string,
    onProgress: (progress: number, currentSurah: number, total: number, reciterName: string) => void
  ): Promise<void> {
    const db = await openDB();
    const reciter = QARI_OPTIONS.find(q => q.id === reciterId) || QARI_OPTIONS[0];

    // 1. Fetch Surah Chapters List
    const chaptersRes = await axios.get('https://api.quran.com/api/v4/chapters', { headers: QURAN_API_HEADERS });
    const surahsList: SurahMeta[] = chaptersRes.data.chapters.map((c: any) => ({
      number: c.id,
      name: c.name_arabic,
      englishName: c.name_simple,
      englishNameTranslation: c.translated_name.name,
      numberOfAyahs: c.verses_count,
      revelationType: c.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'
    }));

    // Save surah list in metadata store
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readwrite');
      const store = tx.objectStore(STORE_META);
      store.put({ key: 'surahs_list', list: surahsList });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    const total = surahsList.length; // 114 Surahs

    // 2. Fetch and store each Surah with audio in parallel batches of 4
    const BATCH_SIZE = 4;
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = surahsList.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (meta) => {
          try {
            // Fetch verses with text, english translation, and selected reciter audio
            const res = await axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${meta.number}`, {
              headers: QURAN_API_HEADERS,
              params: {
                language: 'en',
                translations: '85',
                audio: reciter.id,
                fields: 'text_uthmani',
                per_page: 300
              }
            });

            const versesData = res.data.verses || [];
            const ayahs = versesData.map((verse: any) => {
              let translationText = verse.translations && verse.translations.length > 0 ? verse.translations[0].text : "";
              translationText = translationText.replace(/<[^>]*>?/gm, '');

              return {
                number: verse.id,
                numberInSurah: verse.verse_number,
                verseKey: verse.verse_key || `${meta.number}:${verse.verse_number}`,
                text: verse.text_uthmani,
                translation: translationText,
                audio: verse.audio?.url ? `https://verses.quran.com/${verse.audio.url}` : undefined
              };
            });

            const detail: SurahDetail = {
              ...meta,
              ayahs
            };

            // Put into IndexedDB
            const tx = db.transaction(STORE_SURAHS, 'readwrite');
            const store = tx.objectStore(STORE_SURAHS);
            store.put(detail);
          } catch (e) {
            console.error(`Failed to cache Surah ${meta.number}`, e);
          }
        })
      );

      const completed = Math.min(i + BATCH_SIZE, total);
      const percent = Math.round((completed / total) * 100);
      onProgress(percent, completed, total, reciter.name);
    }

    // 3. Mark download complete with selected reciter metadata
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readwrite');
      const store = tx.objectStore(STORE_META);
      store.put({
        key: 'quran_download_info',
        isDownloaded: true,
        downloadedAt: new Date().toISOString(),
        totalSurahs: total,
        reciterId: reciter.id,
        reciterName: reciter.name
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Delete offline Quran database
   */
  static async deleteOfflineQuran(): Promise<void> {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_SURAHS, STORE_META], 'readwrite');
      tx.objectStore(STORE_SURAHS).clear();
      tx.objectStore(STORE_META).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
