/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import CinematicGrade from "./CinematicGrade";
import DepthFocus, { DOF_TARGET } from "./DepthFocus";
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
import OrbitGroup from "./OrbitGroup";
import BlackHole from "./BlackHole";
import Comet from "./Comet";
import Meteors from "./Meteors";
import Pulsar from "./Pulsar";
import Wormhole from "./Wormhole";
import LensFlare from "./LensFlare";
import SolarProminences from "./SolarProminences";
import EarthAurora from "./EarthAurora";
import EarthStation from "./EarthStation";
import DustParticles from "./DustParticles";
import AdaptiveQuality from "./AdaptiveQuality";
import AutoExposure from "./AutoExposure";
import KeyLight from "./KeyLight";
import MouseParallax from "./MouseParallax";
import FreeRoam from "./FreeRoam";
import CameraShake from "./CameraShake";
import Constellations from "./Constellations";
import Voyager from "./Voyager";
import CommitComets from "./CommitComets";
import DeathStar from "./easter/DeathStar";
import Tardis from "./easter/Tardis";
import HalEye from "./easter/HalEye";
import WallE from "./easter/WallE";
import CooperStation from "./easter/CooperStation";
import WatneyPotato from "./easter/WatneyPotato";
import Endurance from "./easter/Endurance";
import StarDestroyer from "./easter/StarDestroyer";
import Enterprise from "./easter/Enterprise";
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

const Scene = ({ scrollT, activeIdx, onJump, onReady, freeRoamEnabled, wideRef, showExtras = true, launchPhase = null }) => {
  const readyRef = useRef(false);
  const { isMobile, reducedMotion } = useViewport();
  /* Set true only when AdaptiveQuality drops to its potato tier on a weak
     GPU — used to shed the expensive Depth-of-Field pass. Toggles rarely
     (strong hysteresis), so the EffectComposer rebuild is a non-issue. */
  const [lowPerf, setLowPerf] = useState(false);
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
      /* Soft shadows on desktop only — the key light (KeyLight) follows
         the active planet so the map stays sharp + cheap. */
      shadows={isMobile ? false : "soft"}
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
      onCreated={({ gl, scene }) => {
        /* Hard guarantee a dark backdrop: explicit clear colour + a
           scene.background colour. If the skybox texture ever fails to
           load or render, we fall back to deep space — never white. */
        gl.setClearColor(0x03050d, 1);
        scene.background = new THREE.Color(0x03050d);
        invalidate();
      }}
    >
      {/* Declarative dark backdrop — renders behind the skybox sphere so
          there is always deep space, regardless of texture state. */}
      <color attach="background" args={["#03050d"]} />
      <VisibilityController />
      <AdaptiveQuality
        scrollTRef={scrollT}
        highDpr={dprCap}
        lowDpr={isMobile ? 1.0 : 1.2}
        onPerf={(t) => setLowPerf(t === "low")}
      />
      <AutoExposure />
      <DepthFocus scrollT={scrollT} />
      {/* Vacuum-lean three-point lighting. Every planet sits on +x with
          the camera on the FAR (anti-sun) side, so a literal sun-at-origin
          key would throw every hero shot into shadow. Instead:

          - Low ambient (0.55 → 0.28): real dimension, deep-but-readable
            shadow sides instead of the old flat fully-lit look.
          - KEY from the camera-side octant (+x +y +z): rakes the visible
            face so planets read as 3D spheres with a terminator, not flat
            discs. (The dead directional at [0,0,0] did literally nothing —
            zero-length direction → no diffuse.)
          - Cool RIM from the sun side (−x), back-left: silhouette pop
            against the dark starfield, the classic space-movie edge. */}
      <ambientLight intensity={0.34} color="#a9bce0" />
      {/* Sun-direction key + shadow caster, follows the active planet. */}
      <KeyLight scrollT={scrollT} castShadow={!isMobile} />
      <directionalLight position={[-30, 10, -25]} intensity={0.5} color="#6f8cff" />

      <Suspense fallback={null}>
        <Skybox />
        <Stars />
        <Nebulae />
        {/* Ambient motion — only after the intro to keep the warp +
            countdown window light and trim initial scene-graph build. */}
        {showExtras && showAliens && <AlienShips />}
        {showExtras && showComets && <Comets />}
        {/* The edge anomaly — a black hole beyond the contact beacon: you
            reach the edge of the system and there it is, pulling at the
            void. Framed behind the beacon on the contact stop. */}
        {showExtras && <BlackHole position={[49, -6, -15]} radius={1.9} />}
        {/* Anomaly suite — the discoverable spectacle. All deferred behind
            showExtras; motion-heavy ones respect reduced-motion + device. */}
        {showExtras && !reducedMotion && <Comet />}
        {showExtras && !isMobile && !reducedMotion && <Meteors />}
        {showExtras && !isMobile && !reducedMotion && <Pulsar />}
        {/* Wormhole "Beam aboard" portal at the Contact edge — the booking CTA. */}
        {showExtras && <Wormhole />}

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
            /* position is [0,0,0] — the OrbitGroup wrapper places the
               whole body on its live orbit around the sun. */
            const planetEl = (
              <Planet
                key={d.id}
                position={[0, 0, 0]}
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
                tint={d.tint}
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
                <OrbitGroup key={d.id} dest={d}>
                  {planetEl}
                  <EarthAurora position={[0, 0, 0]} radius={d.radius} />
                  {/* ISS on low Earth orbit — inherits Earth's live solar
                      position from the OrbitGroup, runs its own fast LEO. */}
                  {showExtras && !isMobile && (
                    <EarthStation planetRadius={d.radius} animate={!reducedMotion} />
                  )}
                </OrbitGroup>
              );
            }
            return (
              <OrbitGroup key={d.id} dest={d}>
                {planetEl}
              </OrbitGroup>
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

        {!isMobile && <LensFlare position={[0, 0, 0]} />}
        {!isMobile && !reducedMotion && <DustParticles />}
        <PlanetLabels activeIdx={activeIdx} />
        {/* Non-essential extras defer-mount until the intro completes —
            keeps the warp/countdown window + LCP light, and trims the
            initial scene-graph build. */}
        {showExtras && <Constellations scrollTRef={scrollT} />}
        {showExtras && <Voyager />}
        {showExtras && !isMobile && <CommitComets />}
        {/* Easter eggs — lightweight, but no reason to build them during
            the intro. */}
        {showExtras && <DeathStar />}
        {showExtras && <Tardis />}
        {showExtras && <HalEye />}
        {showExtras && <WallE />}
        {showExtras && <CooperStation />}
        {showExtras && <WatneyPotato />}
        {/* Phase 6 homages — Endurance (Interstellar), a deep-field Star
            Destroyer (Star Wars), the Enterprise (Star Trek). */}
        {showExtras && <Endurance />}
        {showExtras && !isMobile && <StarDestroyer />}
        {showExtras && <Enterprise />}
        {!isMobile && !reducedMotion && <MouseParallax offsetRef={parallaxOffsetRef} />}
        <FreeRoam enabled={freeRoamEnabled} offsetRef={freeRoamOffsetRef} />
        <CameraShake parallaxOffsetRef={parallaxOffsetRef} />
        <CameraRig
          scrollT={scrollT}
          controlsEnabled={false}
          parallaxOffsetRef={parallaxOffsetRef}
          freeRoamOffsetRef={freeRoamOffsetRef}
          freeRoamEnabled={freeRoamEnabled}
          wideRef={wideRef}
          launchPhase={launchPhase}
        />
      </Suspense>

      {/* Cinematic post-processing — the biggest visual upgrade.
          Bloom makes the sun + nebulae glow properly, ACES tone-maps
          highlights into a film-like curve, vignette adds depth, SMAA
          provides edge-aware AA without MSAA overhead. */}
      {/* Cinematic color pipeline:
          1. Bloom — HDR highlights bloom into halos (its own convolution
             pass; never merges with the grade below).
          2. CinematicGrade — ONE custom effect doing brightness/contrast
             + saturation + vignette in a single mainImage.

          Why one combined effect instead of the three stock effects:
          @react-three/postprocessing renders the whole frame WHITE when
          2+ mainImage effects merge into one EffectPass (proven by
          bisect — see CinematicGrade.jsx). Collapsing the three grades
          into one effect sidesteps the merge bug entirely and is a pass
          cheaper. ChromaticAberration was dropped earlier (full-screen
          pass for a near-invisible effect); Bloom radius trimmed to 0.6
          (the single most expensive pass). */}
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          intensity={isMobile ? 0.6 : 0.8}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.45}
        />
        {/* DOF: active planet sharp, everything else softly out of focus.
            Focus tracks the planet's live position (DepthFocus → DOF_TARGET);
            convolution effect (own passes) so it never merges with the
            single mainImage grade. Desktop only. */}
        {!isMobile && !lowPerf && (
          <DepthOfField target={DOF_TARGET} focalLength={0.035} bokehScale={1.6} height={360} />
        )}
        {/* Grade: bright base (the real fix for the earlier "too dark"),
            but saturation pulled NEGATIVE — pixel analysis showed planets
            at 0.6–0.9 HSV saturation (cartoonish; real space sits ~0.3).
            −0.12 brings colours back to natural without going grey because
            the base stays bright. Mild contrast, soft vignette so the
            background doesn't read as high-contrast. */}
        <CinematicGrade
          brightness={0.025}
          contrast={0.04}
          saturation={-0.02}
          vigOffset={0.36}
          vigDarkness={0.38}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;
