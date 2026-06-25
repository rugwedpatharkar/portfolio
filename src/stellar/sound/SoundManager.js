/*
 * Stellar Command — SoundManager (module singleton, Web Audio).
 * Diegetic ship audio: a low bridge hum + comm beeps, ticks, a hyperspace jump,
 * a whoosh, and an arrival chime. Default MUTED — nothing plays until the user
 * taps the toggle (browser autoplay policy + reduced-motion friendliness). Every
 * method is a no-op when muted, unavailable (SSR / no Web Audio), or pre-gesture.
 *
 * Event bus (window CustomEvents) it listens for:
 *   stellar:destination {detail:{index}} → beep(index)   (planet arrival note)
 *   stellar:whoosh                        → whoosh()       (planet switch)
 *   stellar:sound:hum                      → arms the hum   (audible once unmuted)
 *   stellar:sound:beep                     → tick()         (countdown tick)
 *   stellar:sound:jump                     → jump()         (hyperspace punch)
 *   stellar:sound:arrival                  → arrival()      (drop-out chime)
 */

const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16]; // comm-tone scale (semitone steps)
const BASE_HZ = 196; // G3

class SoundManagerImpl {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.humNodes = null;
    this.muted = true;
    this.humArmed = false;
    this.available =
      typeof window !== "undefined" &&
      !!(window.AudioContext || window.webkitAudioContext);
    if (this.available) this._bind();
  }

  _bind() {
    const on = (name, fn) => window.addEventListener(name, fn);
    on("stellar:destination", (e) => this.beep(e?.detail?.index ?? 0));
    on("stellar:whoosh", () => this.whoosh());
    on("stellar:sound:hum", () => {
      this.humArmed = true;
      this.playHum();
    });
    on("stellar:sound:beep", () => this.tick());
    on("stellar:sound:jump", () => this.jump());
    on("stellar:sound:arrival", () => this.arrival());
  }

  _ensure() {
    if (!this.available) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  resumeOnGesture() {
    const ctx = this._ensure();
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  isMuted() {
    return this.muted;
  }

  setMuted(m) {
    this.muted = m;
    const ctx = this._ensure();
    if (!ctx) return;
    if (!m && ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(m ? 0 : 1, t, 0.08);
    if (!m && this.humArmed) this.playHum();
    if (m) this.stopHum();
  }

  // ── bridge hum (room tone) ──────────────────────────────────
  playHum() {
    const ctx = this._ensure();
    if (!ctx || this.muted || this.humNodes) return;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(0.06, ctx.currentTime, 1.5);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 55;
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 55.4; // slight detune → slow beating
    const o3 = ctx.createOscillator();
    o3.type = "sine";
    o3.frequency.value = 110;
    const lfo = ctx.createOscillator(); // slow swell so the tone breathes
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.015;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    o1.connect(lp);
    o2.connect(lp);
    o3.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    [o1, o2, o3, lfo].forEach((o) => o.start());
    this.humNodes = { o1, o2, o3, lfo, g };
  }

  stopHum() {
    if (!this.humNodes || !this.ctx) return;
    const { o1, o2, o3, lfo, g } = this.humNodes;
    const t = this.ctx.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setTargetAtTime(0, t, 0.4);
    [o1, o2, o3, lfo].forEach((o) => {
      try {
        o.stop(t + 1.2);
      } catch {
        /* already stopped */
      }
    });
    this.humNodes = null;
  }

  // ── one-shot voices ─────────────────────────────────────────
  _blip(freq, { type = "triangle", dur = 0.12, gain = 0.12, glide = 0 } = {}) {
    const ctx = this._ensure();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  beep(idx = 0) {
    const i = ((idx % PENTATONIC.length) + PENTATONIC.length) % PENTATONIC.length;
    this._blip(BASE_HZ * Math.pow(2, PENTATONIC[i] / 12), { dur: 0.16, gain: 0.1 });
  }

  tick() {
    this._blip(1320, { type: "square", dur: 0.05, gain: 0.05 });
  }

  jump() {
    this._blip(120, { type: "sawtooth", dur: 0.9, gain: 0.12, glide: 6 });
    this._noise(0.7, 1200);
  }

  arrival() {
    this._blip(BASE_HZ * 2, { dur: 0.4, gain: 0.09 });
    setTimeout(() => this._blip(BASE_HZ * 3, { dur: 0.6, gain: 0.08 }), 140);
  }

  whoosh() {
    this._noise(0.5, 800, true);
  }

  _noise(dur = 0.5, cutoff = 1000, sweep = false) {
    const ctx = this._ensure();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const frames = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = cutoff;
    bp.Q.value = 0.8;
    if (sweep) bp.frequency.exponentialRampToValueAtTime(cutoff * 0.3, t + dur);
    const g = ctx.createGain();
    g.gain.value = 0.12;
    g.gain.setTargetAtTime(0, t + dur * 0.6, 0.15);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + dur);
  }
}

const noop = () => {};
export const SoundManager =
  typeof window !== "undefined"
    ? window.__scSound || (window.__scSound = new SoundManagerImpl())
    : {
        available: false,
        resumeOnGesture: noop,
        setMuted: noop,
        isMuted: () => true,
        playHum: noop,
        stopHum: noop,
        beep: noop,
        tick: noop,
        whoosh: noop,
        jump: noop,
        arrival: noop,
      };
