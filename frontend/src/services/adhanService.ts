// Adhan Audio Engine & Islamic Prayer Notification Player for 619 Islam

export interface AdhanOption {
  id: string;
  name: string;
  location: string;
  url: string;
  isFajrSpecial?: boolean;
}

export const ADHAN_STYLES: AdhanOption[] = [
  {
    id: 'makkah',
    name: 'Makkah Al-Mukarramah Adhan',
    location: 'Masjid Al-Haram (Sheikh Ali Ahmed Mulla)',
    url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
  },
  {
    id: 'madinah',
    name: 'Madinah Al-Munawwarah Adhan',
    location: 'Al-Masjid an-Nabawi',
    url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
  },
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy Adhan',
    location: 'Kuwait',
    url: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
  },
  {
    id: 'fajr',
    name: 'Fajr Special Adhan',
    location: 'With "As-Salatu Khayrun Minan-Nawm"',
    url: 'https://www.islamcan.com/audio/adhan/azan13.mp3',
    isFajrSpecial: true,
  },
];

export const DUA_AFTER_ADHAN = {
  arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ',
  transliteration: 'Allahumma Rabba hadhihid-da\'watit-tammah, was-salatil-qa\'imah, ati Muhammadan al-wasilata wal-fadilah, wab\'ath-hu maqamam mahmudanilladhi wa\'adtah.',
  translation: 'O Allah, Lord of this perfect call and established prayer, grant Muhammad the status of intercession and nobility, and resurrect him to the praised position that You have promised him.',
  hadithRef: 'Sahih al-Bukhari 614',
};

type AdhanListener = (state: {
  isPlaying: boolean;
  prayerName: string;
  arabicName: string;
  styleName: string;
}) => void;

class AdhanService {
  private audio: HTMLAudioElement;
  private isPlayingAdhan: boolean = false;
  private currentPrayer: string = '';
  private currentArabic: string = '';
  private currentStyleName: string = '';
  private listeners: Set<AdhanListener> = new Set();

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('play', () => {
      this.isPlayingAdhan = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingAdhan = false;
      this.notify();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingAdhan = false;
      this.notify();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Adhan audio failed', e);
      this.isPlayingAdhan = false;
      this.notify();
    });
  }

  public subscribe(listener: AdhanListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState() {
    return {
      isPlaying: this.isPlayingAdhan,
      prayerName: this.currentPrayer,
      arabicName: this.currentArabic,
      styleName: this.currentStyleName,
    };
  }

  public playAdhan(prayerName: string = 'Salah', arabicName: string = 'الصلاة', styleId: string = 'makkah'): void {
    let adhan = ADHAN_STYLES.find((a) => a.id === styleId);
    
    // Auto-select Fajr Adhan if it's Fajr prayer and user has default
    if (prayerName.toLowerCase() === 'fajr' && styleId === 'makkah') {
      adhan = ADHAN_STYLES.find((a) => a.id === 'fajr') || adhan;
    }

    if (!adhan) adhan = ADHAN_STYLES[0];

    this.currentPrayer = prayerName;
    this.currentArabic = arabicName;
    this.currentStyleName = adhan.name;

    this.audio.src = adhan.url;
    this.audio.currentTime = 0;
    this.audio.volume = 1.0;

    // Lock screen media session for Adhan
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `🕌 Adhan: ${prayerName} Prayer (${arabicName})`,
          artist: adhan.name,
          album: '619 Islam — Prayer Times Adhan',
          artwork: [
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/logo.png', sizes: '192x192', type: 'image/png' },
          ],
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch (e) {}
    }

    this.audio.play().catch((err) => {
      console.warn('Adhan playback could not start automatically', err);
    });

    this.notify();

    // Also trigger UI popup event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('619_adhan_alert', {
          detail: {
            prayerName,
            arabicName,
            styleName: adhan.name,
          },
        })
      );
    }
  }

  public stopAdhan(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlayingAdhan = false;
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    this.notify();
  }
}

export const adhanService = new AdhanService();
