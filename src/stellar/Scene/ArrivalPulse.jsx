import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * Arrival choreography — a brief cinematic "gasp" as the camera settles on a stop.
 * CameraRig edge-fires `stellar:flight {flying:false}` on arrival; we spike a 0→1
 * pulse and ease it out over ~0.7s, using it to (1) swell Bloom intensity and
 * (2) publish the pulse into `arrivalRef` so CinematicGrade can crisp the contrast
 * in lock-step. The world flares + sharpens on landing, then relaxes for reading.
 * Off under reduced motion (bloom held at its base). No per-frame allocation.
 */
export default function ArrivalPulse({ bloomRef, arrivalRef, base = 0.8, enabled = true }) {
  const pulse = useRef(0);

  useEffect(() => {
    if (!enabled) return undefined;
    const onFlight = (e) => {
      if (e.detail && e.detail.flying === false) pulse.current = 1;
    };
    window.addEventListener("stellar:flight", onFlight);
    return () => window.removeEventListener("stellar:flight", onFlight);
  }, [enabled]);

  useFrame((_, dt) => {
    if (enabled && pulse.current > 0.001) pulse.current = Math.max(0, pulse.current - dt * 1.5);
    else pulse.current = 0;
    if (arrivalRef) arrivalRef.current = pulse.current;
    if (bloomRef?.current) bloomRef.current.intensity = base * (1 + pulse.current * 0.28);
  });

  return null;
}
