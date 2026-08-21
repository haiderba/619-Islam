// IndexedDB High-Speed Offline Audio Storage Engine for Quran Surahs & Airplane Travel Packs

const AUDIO_DB_NAME = '619_Islam_Audio_Offline_DB';
const AUDIO_DB_VERSION = 1;
const STORE_AUDIO = 'surah_audio_blobs';

export interface OfflineSurahAudioMeta {
  key: string; // `${surahNumber}_${qariKey}`
  surahNumber: number;
  surahName?: string;
  qariKey: string;
  qariName?: string;
  blob: Blob;
  sizeBytes: number;
  downloadedAt: number;
}

export interface OfflineStorageStats {
  totalSurahs: number;
  totalSizeBytes: number;
  downloadedKeys: string[];
}

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(AUDIO_DB_NAME, AUDIO_DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache of object URLs to avoid memory leaks and speed up lookups
const blobUrlCache = new Map<string, string>();

export const audioOfflineStorageService = {
  getAudioKey(surahNumber: number, qariKey: string): string {
    return `${surahNumber}_${qariKey}`;
  },

  async isSurahDownloaded(surahNumber: number, qariKey: string): Promise<boolean> {
    try {
      const db = await openAudioDB();
      const key = this.getAudioKey(surahNumber, qariKey);
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_AUDIO, 'readonly');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.get(key);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async getOfflineAudioUrl(surahNumber: number, qariKey: string): Promise<string | null> {
    const key = this.getAudioKey(surahNumber, qariKey);
    if (blobUrlCache.has(key)) {
      return blobUrlCache.get(key)!;
    }

    try {
      const db = await openAudioDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_AUDIO, 'readonly');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            const url = URL.createObjectURL(req.result.blob);
            blobUrlCache.set(key, url);
            resolve(url);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async downloadSurahAudio(
    surahNumber: number,
    surahName: string,
    qariKey: string,
    qariName: string,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    const pad3 = (n: number) => String(n).padStart(3, '0');
    const QARI_URL_MAP: Record<string, string> = {
      'ar.alafasy': `https://server8.mp3quran.net/afs/${pad3(surahNumber)}.mp3`,
      'ar.abdulbasitmurattal': `https://server7.mp3quran.net/basit/${pad3(surahNumber)}.mp3`,
      'ar.minshawi': `https://server10.mp3quran.net/minsh/${pad3(surahNumber)}.mp3`,
      'ar.saadalghamdi': `https://server7.mp3quran.net/s_gmd/${pad3(surahNumber)}.mp3`,
      'ar.dussary': `https://server11.mp3quran.net/yasser/${pad3(surahNumber)}.mp3`,
    };

    const primaryUrl = QARI_URL_MAP[qariKey] || `https://server8.mp3quran.net/afs/${pad3(surahNumber)}.mp3`;
    const fallbackUrl = `https://cdn.islamic.network/quran/audio-surah/128/${qariKey}/${surahNumber}.mp3`;
    const key = this.getAudioKey(surahNumber, qariKey);

    try {
      if (onProgress) onProgress(10);
      let response = await fetch(primaryUrl);
      if (!response.ok) {
        response = await fetch(fallbackUrl);
      }
      if (!response.ok) throw new Error('Failed to download audio stream');

      const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
      let loadedBytes = 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            loadedBytes += value.length;
            if (totalBytes > 0 && onProgress) {
              const p = Math.min(95, Math.round((loadedBytes / totalBytes) * 90) + 10);
              onProgress(p);
            }
          }
        }
      }

      const blob = new Blob(chunks as any[], { type: 'audio/mp3' });
      const db = await openAudioDB();

      const item: OfflineSurahAudioMeta = {
        key,
        surahNumber,
        surahName,
        qariKey,
        qariName,
        blob,
        sizeBytes: blob.size,
        downloadedAt: Date.now(),
      };

      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_AUDIO, 'readwrite');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.put(item);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });

      if (onProgress) onProgress(100);
      return true;
    } catch (e) {
      console.warn('Audio download failed', e);
      return false;
    }
  },

  async deleteSurahAudio(surahNumber: number, qariKey: string): Promise<boolean> {
    const key = this.getAudioKey(surahNumber, qariKey);
    if (blobUrlCache.has(key)) {
      URL.revokeObjectURL(blobUrlCache.get(key)!);
      blobUrlCache.delete(key);
    }

    try {
      const db = await openAudioDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_AUDIO, 'readwrite');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.delete(key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async getStorageStats(): Promise<OfflineStorageStats> {
    try {
      const db = await openAudioDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_AUDIO, 'readonly');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.getAll();
        req.onsuccess = () => {
          const items: OfflineSurahAudioMeta[] = req.result || [];
          const totalSizeBytes = items.reduce((acc, item) => acc + (item.sizeBytes || 0), 0);
          const downloadedKeys = items.map(item => item.key);
          resolve({
            totalSurahs: items.length,
            totalSizeBytes,
            downloadedKeys,
          });
        };
        req.onerror = () => resolve({ totalSurahs: 0, totalSizeBytes: 0, downloadedKeys: [] });
      });
    } catch {
      return { totalSurahs: 0, totalSizeBytes: 0, downloadedKeys: [] };
    }
  },

  async clearAllOfflineAudio(): Promise<boolean> {
    blobUrlCache.forEach(url => URL.revokeObjectURL(url));
    blobUrlCache.clear();

    try {
      const db = await openAudioDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_AUDIO, 'readwrite');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.clear();
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }
};
