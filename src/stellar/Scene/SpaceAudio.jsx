/* eslint-disable react/no-unknown-property */
/*
 * SPACE AUDIO — procedurally-generated sound design using the Web Audio API.
 * No sample files: every sound is synthesised from oscillators + filtered
 * noise so the tour ships lean.
 *
 *   Solar wind hiss (#31)   — low white-noise bed lightly band-pass filtered
 *                             around 300 Hz, ambient near the Sun stop.
 *   Jupiter Waves (#32)     — swept sine "whistlers" over pink noise,
 *                             simulating Juno's sonified magnetosphere audio.
 *   Pulsar click (#33)      — 33 ms period sharp clicks at the Pulsar stop
 *                             (Crab pulsar's rotation rate).
 *   Kilonova chirp (#34)    — rising sine sweep 40→2000 Hz over 400 ms,
 *                             emulating the LIGO GW170817 chirp.
 *   Golden Record cue (#35) — a soft two-note bell announcing Voyager's
 *                             Golden Record marker (as a stand-in for the
 *                             actual sample-based excerpt).
 *
 * Audio never starts automatically — a "Sound On" toggle mounts an
 * <SpaceAudio /> that keeps its own gain nodes muted until a user gesture
 * lifts them, satisfying browser autoplay policies.
 *
 * Sources: LIGO GW170817 audio processing (Abbott 2017); Juno Waves
 * sonification archive; Crab pulsar 33 ms timing (Comella 1969).
 */
import { useEffect, useRef } from "react";
import { useSceneClock } from "./SceneClock";
import { useFrame } from "@react-three/fiber";

/* Ensure a single audio context per page. Modern browsers require a user
   gesture to resume from "suspended" state — we resume on first user
   interaction inside the app. */
let _ctx = null;
let _wired = false;
function getContext() {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (!_wired) {
    const resume = () => {
      if (_ctx && _ctx.state === "suspended") _ctx.resume();
    };
    ["click", "keydown", "wheel", "touchstart"].forEach((e) =>
      window.addEventListener(e, resume, { once: false }),
    );
    _wired = true;
  }
  return _ctx;
}

/* --- Individual voice factories --- */

function solarWindHiss(ctx, volume = 0.02) {
  const bufferSize = 2 * ctx.sampleRate;
  const noise = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noise.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 320;
  filter.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  return { src, gain };
}

function pulsarClick(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 1400;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.08, t + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.02);
}

function kilonovaChirp(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(40, t);
  osc.frequency.exponentialRampToValueAtTime(2000, t + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0, t);
  gain.gain.linearRampToValueAtTime(0.13, t + 0.05);
  gain.gain.linearRampToValueAtTime(0.0, t + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.45);
}

function jupiterWhistler(ctx, volume = 0.03) {
  /* Pink-ish noise + slowly modulated sine — approximates the eerie
     "whistler" quality of Juno-Waves audio. */
  const bufferSize = 2 * ctx.sampleRate;
  const noise = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noise.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99 * b0 + 0.03 * w;
    b1 = 0.96 * b1 + 0.09 * w;
    b2 = 0.86 * b2 + 0.24 * w;
    output[i] = (b0 + b1 + b2) * 0.28;
  }
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 700;
  filter.Q.value = 4;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  return { src, gain, lfo };
}

function goldenRecordCue(ctx) {
  const t = ctx.currentTime;
  [523.25, 659.25].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const start = t + i * 0.42;
    gain.gain.setValueAtTime(0.0, start);
    gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 1);
  });
}

/* Component that manages ambient beds (solar wind + Jupiter) and dispatches
   discrete events (pulsar click, kilonova chirp, Golden Record cue) based on
   the active tour stop. Only mounts when `enabled` is set. */
const SpaceAudio = ({ enabled = false, activeIdx = -1 }) => {
  const ctxRef = useRef(null);
  const bedsRef = useRef({});
  const pulsarAcc = useRef(0);
  const clock = useSceneClock();

  useEffect(() => {
    if (!enabled) return;
    ctxRef.current = getContext();
    if (!ctxRef.current) return;
    /* Ambient beds are always on; per-stop gain tuning handled below. */
    bedsRef.current.wind = solarWindHiss(ctxRef.current, 0);
    bedsRef.current.wave = jupiterWhistler(ctxRef.current, 0);
    return () => {
      Object.values(bedsRef.current).forEach((b) => {
        if (b?.src) try { b.src.stop(); } catch (_) {}
        if (b?.lfo) try { b.lfo.stop(); } catch (_) {}
      });
      bedsRef.current = {};
    };
  }, [enabled]);

  /* Per-stop ambient gain — beds fade in/out based on activeIdx. */
  useEffect(() => {
    const beds = bedsRef.current;
    if (!beds.wind || !beds.wave) return;
    beds.wind.gain.gain.setTargetAtTime(activeIdx === 2 ? 0.03 : 0, ctxRef.current.currentTime, 0.6);
    beds.wave.gain.gain.setTargetAtTime(activeIdx === 8 ? 0.028 : 0, ctxRef.current.currentTime, 0.6);
  }, [activeIdx]);

  /* Per-frame pulsar clicks (only when the pulsar area matters). Fires a
     click every ~33 ms of scene time, matching Crab's rotation. */
  useFrame(() => {
    if (!enabled || !ctxRef.current) return;
    /* Only click while the tour is in the outer/exotic zone (idx >= 10)
       to keep the tick from playing throughout the tour. */
    if (activeIdx < 10 || activeIdx > 12) return;
    const step = 0.033; // 33 ms
    pulsarAcc.current += clock.dt || 0;
    while (pulsarAcc.current >= step) {
      pulsarAcc.current -= step;
      pulsarClick(ctxRef.current);
    }
  });

  return null;
};

/* Named exports for external triggers (Kilonova/Golden Record). */
export function triggerKilonova() {
  const ctx = getContext();
  if (ctx) kilonovaChirp(ctx);
}
export function triggerGoldenRecord() {
  const ctx = getContext();
  if (ctx) goldenRecordCue(ctx);
}

export default SpaceAudio;
