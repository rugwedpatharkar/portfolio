// Web Audio API synthesized sounds — no external files needed
// Returns functions: playHover(), playClick(), playSuccess(), playToggle()
// All sounds are very subtle (volume 0.03-0.06) and short (50-200ms)
// Respects a global mute state stored in localStorage

import { useCallback, useRef } from "react";

const useSoundEffects = () => {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  }, []);

  const isMuted = useCallback(() => {
    return localStorage.getItem("portfolio-sounds-muted") === "true";
  }, []);

  // Soft tick sound for hover
  const playHover = useCallback(() => {
    if (isMuted()) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }, [getCtx, isMuted]);

  // Soft pop sound for click
  const playClick = useCallback(() => {
    if (isMuted()) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }, [getCtx, isMuted]);

  // Rising tone for success
  const playSuccess = useCallback(() => {
    if (isMuted()) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, [getCtx, isMuted]);

  // Toggle switch sound
  const playToggle = useCallback(() => {
    if (isMuted()) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 500;
    osc.type = "triangle";
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  }, [getCtx, isMuted]);

  return { playHover, playClick, playSuccess, playToggle };
};

export default useSoundEffects;
