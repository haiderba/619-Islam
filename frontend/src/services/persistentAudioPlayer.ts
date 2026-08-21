// Persistent Background Audio Player Singleton with Lock Screen & MediaSession support

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  artwork?: string;
  surahNumber?: number;
  ayahNumber?: number;
}

type AudioEventListener = (state: {
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  currentTime: number;
  duration: number;
  sleepTimerRemaining: number | null;
}) => void;

class PersistentAudioPlayer {
  private audio: HTMLAudioElement;
  private currentTrack: AudioTrack | null = null;
  private listeners: Set<AudioEventListener> = new Set();
  private sleepTimerId: any = null;
  private sleepTimerSeconds: number | null = null;
  private sleepIntervalId: any = null;
  private fadeIntervalId: any = null;
  private isFadingOut: boolean = false;
  private onTrackEndedCallback: (() => void) | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    // Event listeners on persistent audio element
    this.audio.addEventListener('play', () => this.handleStateChange());
    this.audio.addEventListener('pause', () => this.handleStateChange());
    this.audio.addEventListener('timeupdate', () => this.handleStateChange());
    this.audio.addEventListener('loadedmetadata', () => this.handleStateChange());
    this.audio.addEventListener('ended', () => {
      if (this.onTrackEndedCallback) {
        this.onTrackEndedCallback();
      }
      this.handleStateChange();
    });

    this.setupMediaSessionActionHandlers();
  }

  private setupMediaSessionActionHandlers() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(this.audio.currentTime - (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(this.audio.currentTime + (details.seekOffset || 10));
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          this.seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('Failed to bind mediaSession handlers', e);
    }
  }

  private updateMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !this.currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentTrack.title,
        artist: this.currentTrack.artist,
        album: this.currentTrack.album || '619 Islam',
        artwork: [
          { src: this.currentTrack.artwork || '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo.png', sizes: '192x192', type: 'image/png' },
        ],
      });
      navigator.mediaSession.playbackState = this.audio.paused ? 'paused' : 'playing';
    } catch (e) {}
  }

  public subscribe(listener: AudioEventListener): () => void {
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

  private handleStateChange() {
    this.updateMediaSession();
    this.notify();
  }

  public getState() {
    return {
      isPlaying: !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0,
      currentTrack: this.currentTrack,
      currentTime: this.audio.currentTime || 0,
      duration: this.audio.duration || 0,
      sleepTimerRemaining: this.sleepTimerSeconds,
    };
  }

  public async playTrack(track: AudioTrack, onEnded?: () => void): Promise<void> {
    this.currentTrack = track;
    this.onTrackEndedCallback = onEnded || null;

    if (this.audio.src !== track.src) {
      this.audio.src = track.src;
    }

    this.audio.volume = 1.0;
    this.isFadingOut = false;

    this.updateMediaSession();

    try {
      await this.audio.play();
    } catch (e) {
      console.warn('Playback error', e);
    }
    this.handleStateChange();
  }

  public play() {
    if (this.audio.src) {
      this.audio.play().catch(() => {});
    }
  }

  public pause() {
    this.audio.pause();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }

  public toggle() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public seek(seconds: number) {
    if (this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration));
    }
  }

  public setVolume(vol: number) {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  // 🌙 Sleep Timer with 60-second gentle fadeout
  public setSleepTimer(minutes: number | null) {
    if (this.sleepTimerId) clearTimeout(this.sleepTimerId);
    if (this.sleepIntervalId) clearInterval(this.sleepIntervalId);
    if (this.fadeIntervalId) clearInterval(this.fadeIntervalId);

    if (!minutes || minutes <= 0) {
      this.sleepTimerSeconds = null;
      this.notify();
      return;
    }

    this.sleepTimerSeconds = minutes * 60;
    this.notify();

    this.sleepIntervalId = setInterval(() => {
      if (this.sleepTimerSeconds !== null && this.sleepTimerSeconds > 0) {
        this.sleepTimerSeconds -= 1;

        // In the last 60 seconds, start gentle fade out
        if (this.sleepTimerSeconds <= 60 && !this.isFadingOut) {
          this.startFadeOut(this.sleepTimerSeconds);
        }

        if (this.sleepTimerSeconds === 0) {
          this.pause();
          this.setSleepTimer(null);
        } else {
          this.notify();
        }
      }
    }, 1000);
  }

  private startFadeOut(remainingSeconds: number) {
    this.isFadingOut = true;
    const startVolume = this.audio.volume;
    const stepTime = 1000;
    const steps = Math.max(1, remainingSeconds);
    const volumeStep = startVolume / steps;

    this.fadeIntervalId = setInterval(() => {
      const nextVol = Math.max(0, this.audio.volume - volumeStep);
      this.audio.volume = nextVol;
      if (nextVol <= 0.02) {
        clearInterval(this.fadeIntervalId);
        this.pause();
        this.audio.volume = 1.0;
        this.isFadingOut = false;
      }
    }, stepTime);
  }
}

export const persistentAudioPlayer = new PersistentAudioPlayer();
