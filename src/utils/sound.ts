class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(value: boolean) {
    this.muted = value;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playPickup() {
    this.playTone(587.33, 0.12, 'triangle', 0.08, 0);
    this.playTone(880, 0.16, 'triangle', 0.07, 0.06);
  }

  playArrive() {
    this.playTone(523.25, 0.11, 'sine', 0.07, 0);
    this.playTone(659.25, 0.14, 'sine', 0.07, 0.07);
  }

  playCorrect() {
    this.playTone(523.25, 0.12, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.08, 0.08);
    this.playTone(783.99, 0.2, 'triangle', 0.09, 0.16);
  }

  playWrong() {
    this.playTone(260, 0.16, 'sine', 0.07, 0);
    this.playTone(220, 0.2, 'sine', 0.06, 0.1);
  }

  playStamp() {
    this.playTone(523.25, 0.1, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.1, 'triangle', 0.08, 0.08);
    this.playTone(783.99, 0.1, 'triangle', 0.08, 0.16);
    this.playTone(1046.5, 0.28, 'triangle', 0.1, 0.24);
  }
}

export const sound = new SoundEngine();
