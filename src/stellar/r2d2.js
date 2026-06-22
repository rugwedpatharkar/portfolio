/*
 * R2-D2 voice synthesis — pure Web Audio, no samples.
 *
 * R2's voice is a small number of building blocks layered with random
 * variation: a square-wave oscillator with a frequency envelope
 * sweeping through 500 Hz – 2.5 kHz, optionally pulsing in and out of
 * silence, and run through a band-pass filter to give it that
 * tinny astromech timbre.
 *
 * Each helper returns the duration the sound takes so AmbientAudio
 * can sequence them.
 */

const playSegment = (ctx, dest, { freqs, durations, pulse = false, gain = 0.18, type = "square", filterFreq = 1800 }) => {
  const now = ctx.currentTime;
  let t = now;
  const totalDur = durations.reduce((a, b) => a + b, 0);

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freqs[0], t);
  for (let i = 1; i < freqs.length; i++) {
    t += durations[i - 1];
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqs[i]), t);
  }

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.012);
  if (pulse) {
    /* Pulse on/off through the segment for that "chattering" feel */
    const pulseCount = Math.max(2, Math.floor(totalDur * 18));
    for (let i = 0; i < pulseCount; i++) {
      const at = now + (i / pulseCount) * totalDur;
      g.gain.setValueAtTime(gain * (i % 2 === 0 ? 1 : 0.18), at);
    }
  }
  g.gain.linearRampToValueAtTime(0, now + totalDur);

  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = filterFreq;
  filt.Q.value = 2.5;

  osc.connect(filt).connect(g).connect(dest);
  osc.start(now);
  osc.stop(now + totalDur + 0.05);
  return totalDur;
};

/* Affirmative chirp — quick rising whistle */
export const r2Affirm = (ctx, dest) => playSegment(ctx, dest, {
  freqs: [500, 1200, 1600],
  durations: [0.08, 0.07],
  gain: 0.16,
});

/* Salute / hello — two-tone trill */
export const r2Hello = (ctx, dest) => playSegment(ctx, dest, {
  freqs: [800, 1400, 900, 1500, 1100],
  durations: [0.06, 0.05, 0.06, 0.07],
  gain: 0.18,
  pulse: true,
});

/* Whoosh / transition — descending sweep */
export const r2Whoosh = (ctx, dest) => playSegment(ctx, dest, {
  freqs: [1800, 600],
  durations: [0.22],
  gain: 0.14,
  type: "sawtooth",
  filterFreq: 1400,
});

/* Excited / surprised — short rising stutter */
export const r2Excited = (ctx, dest) => playSegment(ctx, dest, {
  freqs: [1200, 2000, 1700, 2200],
  durations: [0.05, 0.04, 0.05],
  gain: 0.18,
  pulse: true,
});

/* Sad / worried — slow descending tone */
export const r2Sad = (ctx, dest) => playSegment(ctx, dest, {
  freqs: [1500, 700, 500],
  durations: [0.2, 0.18],
  gain: 0.14,
});
