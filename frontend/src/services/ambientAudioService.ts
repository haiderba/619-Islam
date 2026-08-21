// Web Audio Synthesizer for Natural Ambient Soundscapes (Zero buffering, 100% offline, infinitely loopable)

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private breezeNode: AudioNode | null = null;
  private riverNode: AudioNode | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentVolume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  // Generate pink noise buffer for realistic rain & wind
  private createPinkNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public startSound(type: 'rain' | 'breeze' | 'river' | 'none', volume: number = 0.5) {
    this.stop();
    if (type === 'none') return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.setVolume(volume);
    const noiseBuffer = this.createPinkNoiseBuffer();
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    if (type === 'rain') {
      // Bandpass filtered pink noise for gentle rain drops
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(200, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(highpass);
      highpass.connect(this.masterGain);
      this.rainNode = noiseSource;
    } else if (type === 'breeze') {
      // Modulated gentle breeze / desert night wind
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Low frequency oscillator for wind gusts
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      noiseSource.connect(filter);
      filter.connect(this.masterGain);
      this.breezeNode = noiseSource;
    } else if (type === 'river') {
      // Soft flowing stream
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(this.masterGain);
      this.riverNode = noiseSource;
    }

    noiseSource.start();
    this.isRunning = true;
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stop() {
    try {
      if (this.rainNode) {
        (this.rainNode as any).stop();
        this.rainNode.disconnect();
        this.rainNode = null;
      }
      if (this.breezeNode) {
        (this.breezeNode as any).stop();
        this.breezeNode.disconnect();
        this.breezeNode = null;
      }
      if (this.riverNode) {
        (this.riverNode as any).stop();
        this.riverNode.disconnect();
        this.riverNode = null;
      }
    } catch (e) {}
    this.isRunning = false;
  }

  public isPlaying(): boolean {
    return this.isRunning;
  }
}

export const ambientAudioService = new AmbientAudioEngine();
