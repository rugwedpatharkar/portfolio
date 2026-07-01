 
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Camera shake controller. Listens to 'stellar:shake' window events
 * with detail = { amp = 0.18, duration = 0.4 }, applies a damped
 * random Vector3 offset to the camera each frame for the duration.
 *
 * The offset is added INSIDE CameraRig via the same parallax slot
 * (we ride along on parallaxOffsetRef). Decays exponentially.
 */

const CameraShake = ({ parallaxOffsetRef }) => {
  const state = useRef({ amp: 0, until: 0, dur: 0.4 });
  const tmp = useRef(new THREE.Vector3());
  const { clock } = useThree();

  useEffect(() => {
    const onShake = (e) => {
      const amp = e.detail?.amp ?? 0.18;
      const dur = e.detail?.duration ?? 0.4;
      state.current.amp = amp;
      state.current.dur = dur;
      state.current.until = clock.elapsedTime + dur;
    };
    window.addEventListener("stellar:shake", onShake);
    return () => window.removeEventListener("stellar:shake", onShake);
  }, [clock]);

  useFrame(({ clock: c }) => {
    if (!parallaxOffsetRef?.current) return;
    const s = state.current;
    if (s.amp <= 0) return;
    const remaining = s.until - c.elapsedTime;
    if (remaining <= 0) {
      s.amp = 0;
      return;
    }
    /* Decay amplitude over the shake's OWN duration (was hardcoded /0.4,
       which over- or under-shot whenever duration ≠ 0.4). */
    const a = s.amp * (remaining / s.dur);
    tmp.current.set(
      (Math.random() - 0.5) * a * 2,
      (Math.random() - 0.5) * a * 2,
      0
    );
    parallaxOffsetRef.current.add(tmp.current);
  });

  return null;
};

export default CameraShake;
