// ─── Zero-dependency Web Audio API procedural sound synthesizer ─────────────
// Provides subtle, modern audio feedback for civic interactions.
// Persists mute preference in localStorage.

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = typeof window !== 'undefined' ? localStorage.getItem('kaiser_sound_enabled') !== 'false' : true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kaiser_sound_enabled', String(this.enabled));
    }
    if (this.enabled) {
      this.play('pop');
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  play(type = 'click') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (type) {
        case 'click': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'pop': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.07);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'scan': {
          // Futuristic AI chirp
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.linearRampToValueAtTime(950, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }

        case 'success': {
          // Dual chime
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
          gain2.gain.setValueAtTime(0.12, now + 0.08);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.35);
          break;
        }

        case 'fanfare': {
          // Tri-tone victory chord
          [523.25, 659.25, 783.99].forEach((freq, i) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.connect(g);
            g.connect(this.ctx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, now + i * 0.07);
            g.gain.setValueAtTime(0.1, now + i * 0.07);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
            o.start(now + i * 0.07);
            o.stop(now + i * 0.07 + 0.3);
          });
          break;
        }

        case 'alert': {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.linearRampToValueAtTime(400, now + 0.15);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        default:
          break;
      }
    } catch {
      // AudioContext not allowed or unsupported - silent fallback
    }
  }
}

export const sound = new SoundFX();
