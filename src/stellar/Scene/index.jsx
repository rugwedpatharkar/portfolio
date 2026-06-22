/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useRef } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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
import Skybox from "./Skybox";
import LensFlare from "./LensFlare";
import SolarProminences from "./SolarProminences";
import EarthAurora from "./EarthAurora";
import DustParticles from "./DustParticles";
import AdaptiveQuality from "./AdaptiveQuality";
import MouseParallax from "./MouseParallax";
import FreeRoam from "./FreeRoam";
import ScaleGhost from "./ScaleGhost";
import Constellations from "./Constellations";
import Voyager from "./Voyager";
import CommitComets from "./CommitComets";
import DeathStar from "./easter/DeathStar";
import Tardis from "./easter/Tardis";
import HalEye from "./easter/HalEye";
import WallE from "./easter/WallE";
import CooperStation from "./easter/CooperStation";
import WatneyPotato from "./easter/WatneyPotato";
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

const Scene = ({ scrollT, activeIdx, onJump, onReady, freeRoamEnabled }) => {
  const readyRef = useRef(false);
  const { isMobile, reducedMotion } = useViewport();
  /* Camera offsets — kept in refs so React state doesn't re-render
     the whole tree on every frame. Mouse parallax and free-roam each
     own their own offset; CameraRig sums them. */
  const parallaxOffsetRef = useRef(new THREE.Vector3());
  const freeRoamOffsetRef = useRef(new THREE.Vector3());

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
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: "high-performance",
        /* ACES Filmic tone mapping on the renderer side — single
           pipeline, no post-processing ToneMapping pass (that one
           had API issues in v3). */
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ position: [0, 2.5, 11], fov: 52, near: 0.1, far: 600 }}
      style={{ position: "fixed", inset: 0, background: "#03050d" }}
      onCreated={() => invalidate()}
    >
      <VisibilityController />
      <AdaptiveQuality scrollTRef={scrollT} highDpr={dprCap} lowDpr={isMobile ? 1.0 : 1.2} />
      {/* Ambient — slight blue tilt for cinema "shadows are cool" */}
      <ambientLight intensity={0.55} color="#9bb0d8" />
      {/* Sun-direction key light. ACES tone-maps the highlight roll-off
          so we can push intensity up without clipping. */}
      <directionalLight position={[0, 0, 0]} intensity={1.6} color="#fff0c8" />
      {/* Rim back-light — picks out planet silhouettes from the dark
          starfield, the classic "space movie" two-light setup. */}
      <directionalLight position={[-25, 8, -20]} intensity={0.5} color="#7090ff" />

      <Suspense fallback={null}>
        <Skybox />
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
              <group key={d.id}>
                <Sun
                  position={d.position}
                  radius={d.radius}
                  texture={d.texture}
                  onClick={handleSunClick}
                  onPointerOver={handleHoverIn}
                  onPointerOut={handleHoverOut}
                />
                <SolarProminences position={d.position} radius={d.radius} />
              </group>
            );
          }
          if (d.kind === "planet") {
            const planetEl = (
              <Planet
                key={d.id}
                position={d.position}
                radius={d.radius}
                type={d.type || "rocky"}
                color={d.color}
                colorB={d.colorB}
                texture={d.texture}
                nightTexture={d.nightTexture}
                cloudTexture={d.cloudTexture}
                ringTexture={d.ringTexture}
                normalTexture={d.normalTexture}
                specularTexture={d.specularTexture}
                bumpTexture={d.bumpTexture}
                moonTexture={d.moonTexture}
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
            /* Earth gets aurora rings at the poles */
            if (d.type === "earth") {
              return (
                <group key={d.id}>
                  {planetEl}
                  <EarthAurora position={d.position} radius={d.radius} />
                </group>
              );
            }
            return <group key={d.id}>{planetEl}</group>;
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

        {!isMobile && <LensFlare position={[0, 0, 0]} />}
        {!isMobile && !reducedMotion && <DustParticles />}
        <PlanetLabels activeIdx={activeIdx} />
        <Constellations scrollTRef={scrollT} />
        <ScaleGhost activeIdx={activeIdx} />
        <Voyager />
        {!isMobile && <CommitComets />}
        {/* Easter eggs — all lightweight, no per-frame raycast cost */}
        <DeathStar />
        <Tardis />
        <HalEye />
        <WallE />
        <CooperStation />
        <WatneyPotato />
        {!isMobile && !reducedMotion && <MouseParallax offsetRef={parallaxOffsetRef} />}
        <FreeRoam enabled={freeRoamEnabled} offsetRef={freeRoamOffsetRef} />
        <CameraRig
          scrollT={scrollT}
          controlsEnabled={false}
          parallaxOffsetRef={parallaxOffsetRef}
          freeRoamOffsetRef={freeRoamOffsetRef}
          freeRoamEnabled={freeRoamEnabled}
        />
      </Suspense>

      {/* Cinematic post-processing — the biggest visual upgrade.
          Bloom makes the sun + nebulae glow properly, ACES tone-maps
          highlights into a film-like curve, vignette adds depth, SMAA
          provides edge-aware AA without MSAA overhead. */}
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          intensity={isMobile ? 0.85 : 1.35}
          luminanceThreshold={0.42}
          luminanceSmoothing={0.65}
          mipmapBlur
          radius={0.85}
        />
        <Vignette offset={0.28} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;
