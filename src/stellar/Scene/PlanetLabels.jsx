 
 
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";

/*
 * One small HTML label per destination, anchored to its scene position.
 * The active destination's label is fully visible; nearby ones are dimmed;
 * far ones fade out completely. Lightweight CSS opacity transition does
 * the work. The anchor group rides the planet's live orbit so the label
 * stays pinned to the moving body.
 */

const Label = ({ d }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) orbitalPosition(d, clock.elapsedTime, ref.current.position);
  });
  return (
    <group ref={ref}>
    <Html
      position={[0, 0, 0]}
      center
      /* Lower distanceFactor so a close camera doesn't balloon the
         label to fill the screen. Offset well clear of the planet body
         (above its north pole) so name + planet never overlap. */
      distanceFactor={7}
      style={{
        pointerEvents: "none",
        opacity: 0.92,
        transform: `translateY(-${(d.radius || 0.5) * 26 + 26}px)`,
        transition: "opacity 320ms ease",
        whiteSpace: "nowrap",
        textAlign: "center",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color: "white",
          letterSpacing: "0.04em",
          textShadow: "0 1px 8px rgba(0,0,0,0.65)",
        }}
      >
        {d.label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5,
          color: d.color,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginTop: 2,
          textShadow: "0 1px 6px rgba(0,0,0,0.65)",
        }}
      >
        {d.section}
      </div>
    </Html>
    </group>
  );
};

const PlanetLabels = ({ activeIdx }) => {
  /* Only the active destination's label renders — adjacent labels used
     to overlap and balloon when the camera was close. The CinematicLayer
     title card + PlanetHUD cover orientation during transitions. */
  const d = DESTINATIONS[activeIdx];
  if (!d) return null;
  return <Label key={d.id} d={d} />;
};

export default PlanetLabels;
