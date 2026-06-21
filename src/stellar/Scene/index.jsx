/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useRef } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import Stars from "./Stars";
import Sun from "./Sun";
import Planet from "./Planet";
import CameraRig from "./CameraRig";
import AsteroidBelt from "./AsteroidBelt";
import Nebulae from "./Nebulae";
import AlienShips from "./AlienShips";
import Comets from "./Comets";
import VisibilityController from "./VisibilityController";
import PlanetLabels from "./PlanetLabels";
import useViewport from "../useViewport";
import { DESTINATIONS } from "../config/destinations";

/*
 * Persistent Three.js scene. ONE canvas, single Suspense boundary.
 *
 * Performance scaling per viewport:
 *   - Desktop: full counts, DPR up to 1.75, comets, alien ships, big belt
 *   - Mobile: ~half belt density, DPR cap 1.4, no comets, single ship
 *   - Reduced-motion: skip drifting ships + comets; still render planets
 *
 * The asteroid-belt counts are the biggest single performance lever; we
 * tune that based on viewport bucket.
 */

const Scene = ({ scrollT, activeIdx, onJump, onReady }) => {
  const readyRef = useRef(false);
  const { isMobile, reducedMotion } = useViewport();

  const setCursor = (val) => {
    if (typeof document !== "undefined") document.body.style.cursor = val;
  };
  const handleHoverIn = () => setCursor("pointer");
  const handleHoverOut = () => setCursor("");

  useEffect(() => {
    if (!readyRef.current && onReady) {
      readyRef.current = true;
      requestAnimationFrame(() => onReady());
    }
  }, [onReady]);

  const dprCap = isMobile ? 1.4 : 1.75;
  const beltCounts = {
    achievements: isMobile ? 320 : 700,
    testimonials: isMobile ? 180 : 350,
  };
  const showComets = !reducedMotion;
  const showAliens = !reducedMotion;

  return (
    <Canvas
      frameloop="always"
      dpr={[1, dprCap]}
      gl={{ antialias: !isMobile, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 2.5, 11], fov: 52, near: 0.1, far: 600 }}
      style={{ position: "fixed", inset: 0, background: "#050816" }}
      onCreated={() => invalidate()}
    >
      <VisibilityController />
      <ambientLight intensity={0.18} />

      <Suspense fallback={null}>
        <Stars />
        <Nebulae />
        {showAliens && <AlienShips />}
        {showComets && <Comets />}

        {DESTINATIONS.map((d, idx) => {
          const handleClick = (e) => {
            e.stopPropagation();
            onJump?.(idx);
          };
          if (d.kind === "star") {
            const handleSunClick = (e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent("stellar:salute"));
              onJump?.(idx);
            };
            return (
              <Sun
                key={d.id}
                position={d.position}
                radius={d.radius}
                onClick={handleSunClick}
                onPointerOver={handleHoverIn}
                onPointerOut={handleHoverOut}
              />
            );
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
                onClick={handleClick}
                onPointerOver={handleHoverIn}
                onPointerOut={handleHoverOut}
              />
            );
          }
          if (d.kind === "belt") {
            const count = beltCounts[d.id] ?? 200;
            const size = d.id === "achievements" ? 0.08 : 0.05;
            return (
              <AsteroidBelt
                key={d.id}
                count={count}
                innerRadius={d.innerRadius}
                outerRadius={d.outerRadius}
                color={d.color}
                size={size}
              />
            );
          }
          if (d.kind === "beacon") {
            return (
              <Planet
                key={d.id}
                position={d.position}
                radius={d.radius}
                type="rocky"
                color={d.color}
                rotationSpeed={0.3}
                onClick={handleClick}
                onPointerOver={handleHoverIn}
                onPointerOut={handleHoverOut}
              />
            );
          }
          return null;
        })}

        <PlanetLabels activeIdx={activeIdx} />
        <CameraRig scrollT={scrollT} controlsEnabled={false} />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
