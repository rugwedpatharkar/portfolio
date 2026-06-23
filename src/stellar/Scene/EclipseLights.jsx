/* eslint-disable react/no-unknown-property, react/prop-types */
import { useFrame } from "@react-three/fiber";

/*
 * Eclipse lighting. As totality rises, fade ALL scene lights toward dark — the
 * Sun's light is being blocked. This (a) turns the occluding planet into a true
 * black silhouette (the scene cheats a camera-side key light, so without this
 * the "eclipsing" planet would stay lit), and (b) sinks the whole scene to
 * near-night. The corona/chromosphere sprites are emissive (unlit), so they
 * stay bright — exactly like a real total eclipse.
 */

const DIM = 0.92; // fade lights to ~8% at totality

const EclipseLights = ({ eclipseRef }) => {
  useFrame(({ scene }) => {
    const f = 1 - Math.min(1, eclipseRef?.current || 0) * DIM;
    scene.traverse((o) => {
      if (!o.isLight) return;
      if (o.userData.__baseI === undefined) o.userData.__baseI = o.intensity;
      o.intensity = o.userData.__baseI * f;
    });
  });
  return null;
};

export default EclipseLights;
