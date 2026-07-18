/* eslint-disable react/no-unknown-property */
/*
 * PALE BLUE DOT annotation — pins a small caption to Earth's live position
 * that celebrates the 14 Feb 1990 Voyager 1 image. Voyager 1 turned back
 * from ~6.06 billion km (~40.5 AU) and photographed Earth as a 0.12-px
 * speck floating in a scattered-light band from the Sun. Sagan's request;
 * Sagan's "Pale Blue Dot" essay defines the image's meaning.
 *
 * Displayed near Earth as an ambient caption at the achievements stop.
 *
 * Sources: docs/research/07-space-probes.md §3.1 (Voyager 1).
 */
import { Html } from "@react-three/drei";

const PaleBlueDotAnnotation = ({ position = [0, 0, 0], radius = 0.182 }) => (
  <Html
    center
    position={[position[0] + radius * 3, position[1] + radius * 4, position[2]]}
    style={{
      pointerEvents: "none",
      fontFamily: "'Space Mono', monospace",
      fontSize: 9,
      letterSpacing: "0.20em",
      color: "rgba(184, 210, 236, 0.72)",
      textTransform: "uppercase",
      textShadow: "0 0 8px rgba(0,0,0,0.85)",
      whiteSpace: "nowrap",
      textAlign: "center",
    }}
  >
    <div>Pale Blue Dot</div>
    <div style={{ opacity: 0.55, fontSize: 8, marginTop: 2 }}>
      Voyager 1 · 14 Feb 1990 · 6.06 B km from Earth
    </div>
  </Html>
);

export default PaleBlueDotAnnotation;
