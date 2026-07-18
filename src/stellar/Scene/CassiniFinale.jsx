/* eslint-disable react/no-unknown-property */
/*
 * CASSINI GRAND FINALE — commemorates Cassini's final 22 orbits (April-
 * September 2017) where the spacecraft threaded the ~2,000 km gap
 * between Saturn's cloud tops and the inner D-ring, then plunged into
 * the atmosphere on 15 Sep 2017 UTC.
 *
 * Rendered as an HTML annotation overlaid near Saturn when the URL flag
 * ?cassini=1 is set — captions the mission's final imagery moment
 * without requiring a scripted camera fly-through (which would need
 * coordination with the existing CameraRig).
 *
 * Sources: docs/research/07-space-probes.md §3.7 (Cassini and Grand
 * Finale mission).
 */
import { Html } from "@react-three/drei";

const CassiniFinale = ({ position = [0, 0, 0], radius = 1.666 }) => (
  <Html
    center
    position={[position[0], position[1] + radius * 2.4, position[2]]}
    style={{
      pointerEvents: "none",
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.18em",
      color: "rgba(255, 216, 168, 0.75)",
      textTransform: "uppercase",
      textShadow: "0 0 8px rgba(0,0,0,0.85)",
      whiteSpace: "nowrap",
      textAlign: "center",
    }}
  >
    <div>Cassini · Grand Finale</div>
    <div style={{ opacity: 0.6, fontSize: 9, marginTop: 3 }}>
      22 orbits between planet and rings · atmospheric entry 15 Sep 2017
    </div>
  </Html>
);

export default CassiniFinale;
