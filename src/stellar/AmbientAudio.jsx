/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

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
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef(null);
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

    /* Whoosh on destination change */
    const onWhoosh = () => {
      const burst = ctx.createBufferSource();
      const bbuf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      const bd = bbuf.getChannelData(0);
      for (let i = 0; i < bd.length; i++) bd[i] = (Math.random() * 2 - 1) * (1 - i / bd.length);
      burst.buffer = bbuf;
      const bgain = ctx.createGain();
      bgain.gain.value = 0.12;
      const filt = ctx.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 600;
      filt.Q.value = 4;
      filt.frequency.linearRampToValueAtTime(2200, ctx.currentTime + 0.5);
      burst.connect(filt).connect(bgain).connect(masterGain);
      burst.start();
      burst.stop(ctx.currentTime + 0.6);
    };
    window.addEventListener("stellar:whoosh", onWhoosh);

    return () => {
      window.removeEventListener("stellar:whoosh", onWhoosh);
      try {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        setTimeout(() => ctx.close(), 500);
      } catch (e) { /* ignore */ }
    };
  }, [enabled]);

  return (
    <button
      onClick={() => setEnabled((v) => !v)}
      aria-label={enabled ? "Mute ambient" : "Enable ambient"}
      className="stellar-dock-btn"
      data-active={enabled}
      style={{
        background: enabled ? "rgba(0, 206, 168, 0.18)" : "rgba(6, 9, 22, 0.7)",
        border: enabled
          ? "1px solid rgba(0, 206, 168, 0.55)"
          : "1px solid rgba(255, 255, 255, 0.18)",
        color: enabled ? "#00cea8" : "rgba(255, 255, 255, 0.6)",
      }}
      title={enabled ? "Mute ambient drone" : "Play ambient drone"}
    >
      {enabled ? (
        /* speaker on */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        /* speaker off */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      )}
    </button>
  );
};

export default AmbientAudio;
