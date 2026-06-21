/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useRef } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import Stars from "./Stars";
import Sun from "./Sun";
import Planet from "./Planet";
import CameraRig from "./CameraRig";
import { DESTINATIONS } from "../config/destinations";

/*
 * Persistent Three.js scene. ONE canvas, single Suspense boundary, renders
 * on demand only when something animates.
 *
 * Rendering policy:
 *   - frameloop="demand" — idle = 0 CPU
 *   - invalidate() called from scroll handler to request a render
 *   - useFrame consumers automatically request renders during their
 *     active animations
 *
 * The scene is intentionally simple — Stars + Sun + Planets only. Belts,
 * ships, comets come in Phase 3 + 6.
 */

const Scene = ({ scrollT, onReady }) => {
  const readyRef = useRef(false);

  useEffect(() => {
    // Tell the boot sequence the scene mounted
    if (!readyRef.current && onReady) {
      readyRef.current = true;
      // Wait one frame so first paint happens before we report ready
      requestAnimationFrame(() => onReady());
    }
  }, [onReady]);

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.5, 7], fov: 52, near: 0.1, far: 600 }}
      style={{ position: "fixed", inset: 0, background: "#050816" }}
      onCreated={() => invalidate()}
    >
      <ambientLight intensity={0.18} />

      <Suspense fallback={null}>
        <Stars />

        {DESTINATIONS.map((d) => {
          if (d.kind === "star") {
            return <Sun key={d.id} position={d.position} radius={d.radius} />;
          }
          if (d.kind === "planet") {
            return (
              <Planet
                key={d.id}
                position={d.position}
                radius={d.radius}
                type={d.type || "rocky"}
                color={d.color}
                colorB={d.colorB}
                rings={d.rings}
                ringColor={d.ringColor}
                axialTilt={d.axialTilt || 0}
                moons={d.moons || 0}
                moonColor={d.moonColor}
                moonScale={d.moonScale || 0.12}
                rotationSpeed={0.07 + (d.radius || 0) * 0.04}
              />
            );
          }
          if (d.kind === "beacon") {
            return (
              <Planet
                key={d.id}
                position={d.position}
                radius={d.radius}
                color={d.color}
                rotationSpeed={0.3}
              />
            );
          }
          return null;
        })}

        <CameraRig scrollT={scrollT} controlsEnabled={false} />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
