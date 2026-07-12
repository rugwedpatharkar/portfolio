/*
 * Stellar Command — SoundManager (module singleton, Web Audio).
 * Diegetic ship audio: a low bridge hum + comm beeps, ticks, a hyperspace jump,
 * a whoosh, and an arrival chime. Default MUTED — nothing plays until the user
 * taps the toggle (browser autoplay policy + reduced-motion friendliness). Every
 * method is a no-op when muted, unavailable (SSR / no Web Audio), or pre-gesture.
 *
 * Event bus (window CustomEvents) it listens for:
 *   stellar:destination {detail:{index}} → beep(index)   (planet arrival note)
 *   stellar:sound:hum                     → arms the hum   (audible once unmuted)
 *   stellar:sound:jump                    → jump()         (hyperspace punch)
 */

const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16]; // comm-tone scale (semitone steps)
const BASE_HZ = 196; // G3

class SoundManagerImpl {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.humNodes = null;
    this.muted = false; // sound ON by default — a first-gesture resume (see _bind) starts it
    this.humArmed = false;
    this.available =
      typeof window !== "undefined" &&
      !!(window.AudioContext || window.webkitAudioContext);
    if (this.available) this._bind();
  }

  _bind() {
    const on = (name, fn) => window.addEventListener(name, fn);
    on("stellar:destination", (e) => this.beep(e?.detail?.index ?? 0));
    on("stellar:sound:hum", () => {
      this.humArmed = true;
      this.playHum();
    });
    on("stellar:sound:jump", () => this.jump());
    on("stellar:sound:supernova", () => this.supernova());
    /* Sound is ON by default, but browsers require a user gesture to start audio.
       Resume the context on the FIRST interaction (any of these), once, so the
       armed hum + cues come alive automatically — no toggle tap needed. */
    const resume = () => {
      this.resumeOnGesture();
      if (!this.muted && this.humArmed) this.playHum();
      ["pointerdown", "keydown", "touchstart", "wheel"].forEach((n) => window.removeEventListener(n, resume));
    };
    ["pointerdown", "keydown", "touchstart", "wheel"].forEach((n) => window.addEventListener(n, resume, { passive: true }));
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

  jump() {
    this._blip(120, { type: "sawtooth", dur: 0.9, gain: 0.12, glide: 6 });
    this._noise(0.7, 1200);
  }

  /* Supernova swell — a deep sub-bass bloom + an airy wash that briefly lifts
     the room hum, so the ambient bed breathes each time a star dies in the
     homepage galaxy. Driven by Supernovae.jsx via stellar:sound:supernova. */
  supernova() {
    const ctx = this._ensure();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(40, t);
    o.frequency.exponentialRampToValueAtTime(27, t + 2.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.085, t + 0.6); // swell in
    g.gain.setTargetAtTime(0, t + 0.8, 0.9);        // long decay
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 3.4);
    this._noise(1.6, 320, true); // faint airy wash
    if (this.humNodes) {
      const hg = this.humNodes.g.gain;
      hg.setTargetAtTime(0.1, t, 0.4);
      hg.setTargetAtTime(0.06, t + 1.1, 1.3);
    }
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

  /* PHASE 3D — proximity sonification. A low black-hole rumble + a pulsar tone,
     each panned by direction, driven per-frame by Sonification.jsx. Connected to
     master so they're silent while muted; nodes are created lazily on the first
     un-muted update (after the autoplay gesture). */
  _initSonify() {
    const ctx = this.ctx;
    const mk = (type, freq) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0;
      const p = ctx.createStereoPanner();
      o.connect(g).connect(p).connect(this.master);
      o.start();
      return { g, p };
    };
    const hole = mk("sine", 44);
    const pulse = mk("triangle", 523);
    this.sonify = { holeGain: hole.g, holePan: hole.p, pulseGain: pulse.g, pulsePan: pulse.p };
  }

  updateSonification(d) {
    if (this.muted || !this.ctx) return; // gated on un-mute (silent by default)
    if (!this.sonify) this._initSonify();
    const s = this.sonify;
    const t = this.ctx.currentTime;
    s.holeGain.gain.setTargetAtTime((d.hole || 0) * 0.3, t, 0.12);
    s.holePan.pan.setTargetAtTime(d.holePan || 0, t, 0.12);
    s.pulseGain.gain.setTargetAtTime((d.pulse || 0) * (d.pulseBeat || 0) * 0.14, t, 0.04);
    s.pulsePan.pan.setTargetAtTime(d.pulsePan || 0, t, 0.12);
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
        jump: noop,
        updateSonification: noop,
      };
