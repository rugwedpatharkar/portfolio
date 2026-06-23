/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { r2Affirm, r2Excited, r2Hello, r2Sad, r2Whoosh } from "./r2d2";

/*
 * Brian-Eno-style synthesized space drone — no external audio file,
 * just Web Audio API oscillators + filtered noise. Three sub-bass
 * oscillators detuned slightly (~3 cents) give a slow chorus, and a
 * filtered noise layer adds the cosmic hiss.
 *
 * Audio MUST be user-triggered (browser autoplay policy). The toggle
 * lives in the bottom-right; first click resumes the audio context.
 *
 * Also exposes window.dispatchEvent("stellar:whoosh") for destination-
 * change feedback — a short pitched whoosh.
 */

const FREQS = [55, 82.5, 110]; // A1, ~E2, A2 — a tonic-fifth-octave drone

const AmbientAudio = () => {
  /* On by default — no toggle. The context is created up front and resumed
     on the first user gesture (browser autoplay policy). */
  const [enabled, setEnabled] = useState(true);
  /* R2 mode is global — listens for window 'stellar:r2d2:*' events
     even when drone is off, so the toggle below can flip on R2 chirps
     independently of the drone. Defaults true (R2 is the fun bit). */
  const r2On = useRef(true);
  const ctxRef = useRef(null);
  const r2GainRef = useRef(null);
  const masterGainRef = useRef(null);
  const oscRefs = useRef([]);
  const noiseGainRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    let ctx;
    try {
      ctx = new AC();
    } catch (err) {
      /* AudioContext creation can fail on iOS Lockdown Mode + a few
         hardened browser configs. Toggle off silently. */
      console.warn("Stellar audio: AudioContext unavailable", err);
      setEnabled(false);
      return;
    }
    ctxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    /* Three detuned sub-bass oscillators */
    const oscs = FREQS.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = (i - 1) * 6; // ±6 cents

      const gain = ctx.createGain();
      gain.gain.value = 0.16;

      /* Slow LFO on gain — gentle breathing */
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08 + i * 0.03;
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();

      osc.connect(gain).connect(masterGain);
      osc.start();
      return osc;
    });
    oscRefs.current = oscs;

    /* Filtered noise for cosmic hiss */
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 380;
    lowpass.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;
    noiseGainRef.current = noiseGain;
    noise.connect(lowpass).connect(noiseGain).connect(masterGain);
    noise.start();

    /* Fade in over 2.4s */
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2.4);

    /* R2 sounds — route through their own gain bus so they're audible
       even if the drone gain is low. Always plays when ambient audio
       is on; bypass when off. */
    const r2Gain = ctx.createGain();
    r2Gain.gain.value = 0.9;
    r2Gain.connect(ctx.destination);
    r2GainRef.current = r2Gain;

    /* Build a STABLE map of handlers once so add/removeEventListener
       reference the exact same functions. The previous onR2(type)
       factory returned a fresh closure each call, so removeEventListener
       never matched what was registered → leak + stacking duplicates on
       every re-toggle. */
    const handlers = {
      "stellar:whoosh": () => { if (ctxRef.current) r2Whoosh(ctx, r2Gain); },
      "stellar:r2:affirm": () => { if (ctxRef.current) r2Affirm(ctx, r2Gain); },
      "stellar:r2:hello": () => { if (ctxRef.current) r2Hello(ctx, r2Gain); },
      "stellar:r2:excited": () => { if (ctxRef.current) r2Excited(ctx, r2Gain); },
      "stellar:r2:sad": () => { if (ctxRef.current) r2Sad(ctx, r2Gain); },
    };
    Object.entries(handlers).forEach(([evt, fn]) => window.addEventListener(evt, fn));

    /* Resume + greet on the first user gesture (the context starts suspended
       under the autoplay policy). Fires once, then unbinds. */
    let greeted = false;
    const gestureEvents = ["pointerdown", "keydown", "wheel", "touchstart"];
    const resumeOnce = () => {
      if (greeted) return;
      greeted = true;
      Promise.resolve(ctx.resume?.())
        .then(() => setTimeout(() => r2Hello(ctx, r2Gain), 400))
        .catch(() => {});
      gestureEvents.forEach((evt) => window.removeEventListener(evt, resumeOnce));
    };
    gestureEvents.forEach((evt) => window.addEventListener(evt, resumeOnce, { passive: true }));
    if (ctx.state === "running") resumeOnce();

    return () => {
      gestureEvents.forEach((evt) => window.removeEventListener(evt, resumeOnce));
      Object.entries(handlers).forEach(([evt, fn]) => window.removeEventListener(evt, fn));
      try {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        setTimeout(() => ctx.close(), 500);
      } catch (e) { /* ignore */ }
    };
  }, [enabled]);

  /* No visible control — sound is always on. */
  return null;
};

export default AmbientAudio;
