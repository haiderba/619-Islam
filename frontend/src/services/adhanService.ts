// Adhan Audio Engine & Islamic Voice Notification Player for 619 Islam

export interface AdhanOption {
  id: string;
  name: string;
  location: string;
  url: string;
  fallbacks: string[];
  isFajrSpecial?: boolean;
}

export const ADHAN_STYLES: AdhanOption[] = [
  {
    id: 'makkah',
    name: 'Makkah Al-Mukarramah Adhan',
    location: 'Masjid Al-Haram (Sheikh Ali Ahmed Mulla)',
    url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    fallbacks: [
      'https://ia800204.us.archive.org/3/items/AzanMakkah_201601/Azan_Makkah.mp3',
      'https://media.sd.ma/assabile/adhan_3748/001.mp3',
    ],
  },
  {
    id: 'madinah',
    name: 'Madinah Al-Munawwarah Adhan',
    location: 'Al-Masjid an-Nabawi',
    url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
    fallbacks: [
      'https://ia800204.us.archive.org/3/items/AzanMakkah_201601/Azan_Makkah.mp3',
    ],
  },
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy Adhan',
    location: 'Kuwait',
    url: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
    fallbacks: [
      'https://www.islamcan.com/audio/adhan/azan1.mp3',
    ],
  },
  {
    id: 'fajr',
    name: 'Fajr Special Adhan',
    location: 'With "As-Salatu Khayrun Minan-Nawm"',
    url: 'https://www.islamcan.com/audio/adhan/azan13.mp3',
    fallbacks: [
      'https://www.islamcan.com/audio/adhan/azan1.mp3',
    ],
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
  private currentFallbackIndex: number = 0;
  private currentFallbacks: string[] = [];
  private listeners: Set<AdhanListener> = new Set();
  private audioContextUnlocked: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    // NOTE: Removed crossOrigin = 'anonymous' to prevent strict CORS rejection on audio CDNs

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
      console.warn('Adhan audio failed on current source, trying fallback...', e);
      this.tryNextFallback();
    });

    this.setupAudioUnlocker();
  }

  // Permanently unlocks browser media permissions on user interaction
  private setupAudioUnlocker() {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      if (this.audioContextUnlocked) return;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          if (!this.audioCtx) {
            this.audioCtx = new AudioContextClass();
          }
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
        }
        this.audioContextUnlocked = true;

        // Remove listeners once unlocked
        window.removeEventListener('click', unlockHandler);
        window.removeEventListener('touchstart', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
      } catch (err) {
        console.warn('Could not unlock AudioContext', err);
      }
    };

    window.addEventListener('click', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
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

  // Voice Speech Announcement Aloud
  public speakVoiceNotification(prayerName: string, arabicName: string = '') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Clear any queued speech

      const announcement = `Allahu Akbar, Allahu Akbar. It is now time for ${prayerName} prayer ${arabicName ? `(${arabicName})` : ''}. Come to prayer, come to success. Hayya alas-Salah.`;
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.volume = 1.0; // Maximum volume aloud
      utterance.rate = 0.92;  // Natural rhythmic pace
      utterance.pitch = 1.0;

      // Try picking an English or Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') || v.lang.startsWith('ar'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed', e);
    }
  }

  private tryNextFallback() {
    if (this.currentFallbackIndex < this.currentFallbacks.length) {
      const nextUrl = this.currentFallbacks[this.currentFallbackIndex];
      this.currentFallbackIndex += 1;
      this.audio.src = nextUrl;
      this.audio.currentTime = 0;
      this.audio.play().catch((err) => {
        console.warn('Fallback adhan audio play failed', err);
      });
    } else {
      this.isPlayingAdhan = false;
      this.notify();
    }
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
    this.currentFallbacks = adhan.fallbacks || [];
    this.currentFallbackIndex = 0;

    // 1. Trigger Voice Announcement Aloud
    this.speakVoiceNotification(prayerName, arabicName);

    // 2. Vibrate mobile device in rhythmic Adhan pulses
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([400, 200, 400, 200, 800]);
      } catch (e) {}
    }

    // 3. Configure and start HTML5 Audio
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
      console.warn('Adhan audio play blocked by browser autoplay policy, attempting fallback...', err);
      this.tryNextFallback();
    });

    this.notify();

    // 4. Trigger UI popup modal event
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

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
