// Ambient Haram & Peaceful Masjid Audio Soundscapes for 619 Islam

export interface AmbientTrack {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  url: string;
  icon: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'madinah_birds',
    name: 'Madinah Munawwarah Courtyard',
    arabicName: 'رحاب المسجد النبوي الشريف',
    description: 'Tranquil birds, gentle breeze, and serene atmosphere in the Prophet\'s Mosque.',
    url: 'https://cdn.freesound.org/previews/518/518882_6142149-lq.mp3',
    icon: '🕊️',
  },
  {
    id: 'makkah_rain',
    name: 'Rain on Haram Marble (Makkah)',
    arabicName: 'مطر وسكينة الحرم المكي',
    description: 'Gentle raindrops falling on the white marble around the Holy Ka\'bah.',
    url: 'https://cdn.freesound.org/previews/243/243628_3509815-lq.mp3',
    icon: '🌧️',
  },
  {
    id: 'alaqsa_garden',
    name: 'Al-Aqsa Peaceful Evening Breeze',
    arabicName: 'نسيم ساحات المسجد الأقصى',
    description: 'Deep contemplation and tranquil garden ambiance of Bayt al-Maqdis.',
    url: 'https://cdn.freesound.org/previews/568/568853_9497060-lq.mp3',
    icon: '🌿',
  },
];

type AmbientListener = (state: {
  isPlaying: boolean;
  activeTrackId: string | null;
  volume: number;
  remainingSeconds: number | null;
}) => void;

class AmbientAudioService {
  private audio: HTMLAudioElement;
  private isPlaying: boolean = false;
  private activeTrackId: string | null = null;
  private volume: number = 0.5;
  private timerInterval: any = null;
  private remainingSeconds: number | null = null;
  private listeners: Set<AmbientListener> = new Set();

  constructor() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = this.volume;

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });
  }

  public subscribe(listener: AmbientListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      activeTrackId: this.activeTrackId,
      volume: this.volume,
      remainingSeconds: this.remainingSeconds,
    };
  }

  public playTrack(trackId: string, durationMinutes: number | null = 15): void {
    const track = AMBIENT_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    if (this.activeTrackId === trackId && this.isPlaying) {
      this.pause();
      return;
    }

    this.activeTrackId = trackId;
    this.audio.src = track.url;
    this.audio.currentTime = 0;
    this.audio.volume = this.volume;

    this.audio.play().catch(err => {
      console.warn('Ambient audio play blocked', err);
    });

    // Setup timer if specified
    if (durationMinutes) {
      this.setTimer(durationMinutes);
    } else {
      this.clearTimer();
    }

    this.notify();
  }

  public startSound(soundKey: string, volume: number = 0.5): void {
    const soundMap: Record<string, string> = {
      rain: 'makkah_rain',
      birds: 'madinah_birds',
      wind: 'alaqsa_garden',
      makkah_rain: 'makkah_rain',
      madinah_birds: 'madinah_birds',
      alaqsa_garden: 'alaqsa_garden',
    };

    const targetId = soundMap[soundKey] || 'madinah_birds';
    this.setVolume(volume);
    this.playTrack(targetId, null);
  }

  public stop(): void {
    this.pause();
  }

  public pause(): void {
    this.audio.pause();
    this.isPlaying = false;
    this.clearTimer();
    this.notify();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audio.volume = this.volume;
    this.notify();
  }

  public setTimer(minutes: number): void {
    this.clearTimer();
    this.remainingSeconds = minutes * 60;

    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds !== null && this.remainingSeconds > 0) {
        this.remainingSeconds -= 1;
        this.notify();
      } else {
        this.pause();
      }
    }, 1000);

    this.notify();
  }

  public clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.remainingSeconds = null;
  }
}

export const ambientAudioService = new AmbientAudioService();
