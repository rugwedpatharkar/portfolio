import { useFrame } from "@react-three/fiber";

/*
 * EXPERIENCE LAYER (Tier 1) — pulses the existing Bloom pass's intensity with the
 * warp velocity, so the hyperspace fly-through gets a real "bloom punch" at its
 * peak (and a gentle lift on a fast scroll). Bloom is its OWN convolution pass, so
 * modulating its intensity is safe — it never merges with the single CinematicGrade
 * mainImage (no white-frame risk). Reduced-motion never raises warpVel, so this
 * holds flat there. No per-frame React state — a ref write only.
 */

export default function BloomPulse({ bloomRef, warpVelRef, base = 0.8, gain = 1.5 }) {
  useFrame(() => {
    const b = bloomRef?.current;
    if (!b) return;
    const wv = warpVelRef?.current || 0;
    b.intensity = base + Math.min(Math.max(wv, 0), 1.5) * gain;
  });
  return null;
}
