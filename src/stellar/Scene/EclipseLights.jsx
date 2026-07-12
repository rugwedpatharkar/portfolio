 
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
/* Cheap early-out: any totality below this is visually indistinguishable from
   noon, so we skip the whole-scene traverse (thousands of nodes at v3 scale).
   `wasActive` guards the one restore pass when totality drops back through the
   threshold — otherwise a partial eclipse would leave lights permanently dimmed. */
const EPS = 0.005;

const EclipseLights = ({ eclipseRef }) => {
  useFrame(({ scene }) => {
    const t = Math.min(1, eclipseRef?.current || 0);
    if (t < EPS && !scene.userData.__eclipseWasActive) return;
    scene.userData.__eclipseWasActive = t >= EPS;
    const f = 1 - t * DIM;
    scene.traverse((o) => {
      if (!o.isLight) return;
      if (o.userData.__baseI === undefined) o.userData.__baseI = o.intensity;
      o.intensity = o.userData.__baseI * f;
    });
  });
  return null;
};

export default EclipseLights;
