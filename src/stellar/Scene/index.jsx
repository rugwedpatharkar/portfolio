/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useRef, cloneElement } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import CinematicGrade from "./CinematicGrade";
import SceneClock from "./SceneClock";
import Stars from "./Stars";
import Sun from "./Sun";
import Planet from "./Planet";
import CameraRig from "./CameraRig";
import AsteroidBelt from "./AsteroidBelt";
import Nebulae from "./Nebulae";
import VisibilityController from "./VisibilityController";
import Skybox from "./Skybox";
import OrbitGroup from "./OrbitGroup";
import BlackHole from "./BlackHole";
import Comet from "./Comet";
import AtlasComet from "./AtlasComet";
import Meteors from "./Meteors";
import Pulsar from "./Pulsar";
import DeepFieldMysteries from "./DeepFieldMysteries";
import Wormhole from "./Wormhole";
import LensFlare from "./LensFlare";
import OrbitRings from "./OrbitRings";
import Beacon from "./Beacon";
import SolarProminences from "./SolarProminences";
import SolarEclipse from "./SolarEclipse";
import EclipseLights from "./EclipseLights";
import DwarfPlanets from "./DwarfPlanets";
import BeltDust from "./BeltDust";
import TrojanAsteroids from "./TrojanAsteroids";
import OortCloud from "./OortCloud";
import Heliosphere from "./Heliosphere";
import InterstellarVisitor from "./InterstellarVisitor";
import EarthStation from "./EarthStation";
import { HomePin, HomeCallout } from "./HomeMarker";
import IsroProbe from "./IsroProbe";
import MilkyWay from "./MilkyWay";
import ZodiacalLight from "./ZodiacalLight";
import ShootingStars from "./ShootingStars";
import RocketLaunch from "./RocketLaunch";
import DangerField from "./DangerField";
import DataFragments from "./DataFragments";
import FlyableNebula from "./FlyableNebula";
import DustParticles from "./DustParticles";
import AdaptiveQuality from "./AdaptiveQuality";
import AutoExposure from "./AutoExposure";
import KeyLight from "./KeyLight";
import MouseParallax from "./MouseParallax";
import FreeRoam from "./FreeRoam";
import GameFlight from "./GameFlight";
import CameraShake from "./CameraShake";
import Voyager from "./Voyager";
import RobotFleet from "./RobotFleet";
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
import { DESTINATIONS, remapPosition, frontOfSun, BACKGROUND_BELTS } from "../config/destinations";
import { rotationSpeedFor } from "../config/planetData";

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

const Scene = ({ scrollT, activeIdx, onJump, onReady, freeRoamEnabled, gameActive = false, speedRef, thrustRef, flyToRef, wideRef, wideOrbitRef, focusRef, cameraRef, eclipseRef, clock, showExtras = true, launchPhase = null }) => {
  const readyRef = useRef(false);
  const { isMobile, isCompact, reducedMotion } = useViewport();
  /* Camera offsets — kept in refs so React state doesn't re-render
     the whole tree on every frame. Mouse parallax and free-roam each
     own their own offset; CameraRig sums them. */
  const parallaxOffsetRef = useRef(new THREE.Vector3());
  const freeRoamOffsetRef = useRef(new THREE.Vector3());
  /* Earth's Moon world position, published by its Planet, read by SolarEclipse. */
  const moonWorldRef = useRef(new THREE.Vector3());

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

  /* Render at the display's native pixel ratio (up to 2× on retina/4K) for
     crisp HD. We removed Depth-of-Field, so nothing is intentionally blurred
     and the extra pixels actually read as sharpness. The adaptive guard still
     floors DPR only on a genuinely struggling GPU. */
  const dprCap = isMobile ? 1.5 : 2;

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
      camera={{ position: [0, 2.5, 11], fov: 52, near: 0.1, far: 14000 }}
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
      {/* Virtual scene clock — provides scaled "world time" to every in-canvas
          consumer (orbits, camera tracking, time-driven shaders) so the time
          control can pause / slow / speed the whole system coherently, while
          reduced-motion freezes it (scale → 0). Wraps the entire scene graph. */}
      <SceneClock clock={clock} reducedMotion={reducedMotion}>
      {/* Declarative dark backdrop — renders behind the skybox sphere so
          there is always deep space, regardless of texture state. */}
      <color attach="background" args={["#03050d"]} />
      <VisibilityController />
      <AdaptiveQuality
        scrollTRef={scrollT}
        highDpr={dprCap}
        lowDpr={isMobile ? 1.0 : 1.4}
      />
      <AutoExposure />
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
      {/* Low ambient so real phases show contrast (the Sun-direction key light
          does the lighting), but enough that night sides stay legible. */}
      {/* Lifted 0.22 → 0.30: the backlit default hero shot faces the planet's
          night side, so a touch more fill keeps the NASA surface readable while
          the Sun-direction key still sculpts the lit limb. */}
      <ambientLight intensity={0.30} color="#a9bce0" />
      {/* Sun-direction key + shadow caster, follows the active planet. */}
      <KeyLight scrollT={scrollT} castShadow={!isMobile} />
      <directionalLight position={[-30, 10, -25]} intensity={0.5} color="#6f8cff" />

      <Suspense fallback={null}>
        <Skybox />
        <Stars />
        <Nebulae />
        {/* Grand faint galactic band — far backdrop for depth. */}
        <MilkyWay animate={!reducedMotion} />
        {/* Zodiacal light — faint sunlight scattered by ecliptic-plane dust. */}
        {showExtras && <ZodiacalLight />}
        {/* A nebula you can drift INTO — a pilot-mode toy, not a real-nebula
            replica, so it lives only in the game. In the Read tour it would just
            be an out-of-place cloud floating in the asteroid belt (~2.4 AU); the
            real Hubble nebulae (Nebulae.jsx) are the deep-space backdrop instead. */}
        {gameActive && <FlyableNebula position={remapPosition([-14, 6, -10])} radius={7} animate={!reducedMotion} />}
        {/* The edge anomaly — Gargantua, out in front of the camera (behind the
            Sun, −X) so it's a visible deep-space landmark throughout the tour
            rather than hidden off to the +X side behind the viewer. */}
        {showExtras && <BlackHole position={remapPosition(frontOfSun([49, -6, -15]))} radius={32} animate={!reducedMotion} onPointerOver={handleHoverIn} onPointerOut={handleHoverOut} />}
        {/* Spaghettification dread near Gargantua — writes clock.danger. */}
        {showExtras && <DangerField animate={!reducedMotion} />}
        {/* Flyable résumé collectibles — collected while piloting or in the game. */}
        {showExtras && <DataFragments active={freeRoamEnabled || gameActive} animate={!reducedMotion} />}
        {/* Anomaly suite — the discoverable spectacle. All deferred behind
            showExtras; motion-heavy ones respect reduced-motion + device. */}
        {showExtras && !reducedMotion && <Comet />}
        {/* 'Oumuamua — the interstellar visitor cutting through on a hyperbolic
            path, tumbling end over end. */}
        {showExtras && !reducedMotion && <InterstellarVisitor animate={!reducedMotion} />}
        {/* The interstellar comets: 3I/ATLAS (green coma + sunward anti-tail) and
            2I/Borisov (reddish coma) — completing the trio with 'Oumuamua. */}
        {showExtras && !reducedMotion && <AtlasComet />}
        {showExtras && !reducedMotion && (
          <AtlasComet start={[-620, -150, 240]} vel={[168, 4, -64]} coma="#d8b890" ion="#cdbfa0" dust="#e8d8b8" antiTail={false} comaR={1.2} respawn={780} />
        )}
        {/* Clickable wishing meteors. */}
        {showExtras && !reducedMotion && <ShootingStars animate={!reducedMotion} />}
        {showExtras && !isMobile && !reducedMotion && <Meteors />}
        {showExtras && !isMobile && !reducedMotion && <Pulsar />}
        {/* Real unsolved mysteries as deep-field discoverables (Planet Nine,
            Tabby's Star, the Wow! signal, fast radio bursts). */}
        {showExtras && <DeepFieldMysteries animate={!reducedMotion} />}
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
                  animate={!reducedMotion}
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
                faintRings={d.faintRings}
                ringColor={d.ringColor}
                axialTilt={d.axialTilt || 0}
                oblateness={d.oblateness || 0}
                moons={d.moons || 0}
                moonColor={d.moonColor}
                moonScale={d.moonScale || 0.12}
                /* Real sidereal rotation: gas giants whirl, Venus/Mercury creep,
                   Venus + Uranus spin retrograde (negative). */
                rotationSpeed={rotationSpeedFor(d.id)}
                animate={!reducedMotion}
                onClick={handleClick}
                onPointerOver={handleHoverIn}
                onPointerOut={handleHoverOut}
              />
            );
            /* Earth gets aurora rings at the poles */
            if (d.type === "earth") {
              return (
                <OrbitGroup key={d.id} dest={d} animate={!reducedMotion}>
                  {/* The Pune "I'm here" pin rides Earth's rotating mesh; the
                      Moon publishes its world position for the eclipse system. */}
                  {cloneElement(planetEl, { satelliteRef: moonWorldRef }, <HomePin radius={d.radius} animate={!reducedMotion} />)}
                  {/* ISS on low Earth orbit — inherits Earth's live solar
                      position from the OrbitGroup, runs its own fast LEO. */}
                  {showExtras && !isMobile && (
                    <EarthStation planetRadius={d.radius} animate={!reducedMotion} />
                  )}
                  {showExtras && !isMobile && (
                    <RocketLaunch earthRadius={d.radius} animate={!reducedMotion} />
                  )}
                  {showExtras && <HomeCallout earthRadius={d.radius} />}
                  {showExtras && (
                    <IsroProbe
                      orbitRadius={d.radius * 2.2} speed={0.22} tilt={0.4} phase={1.2} scale={d.radius * 0.18}
                      event="stellar:chandrayaan" animate={!reducedMotion}
                      onPointerOver={handleHoverIn} onPointerOut={handleHoverOut}
                    />
                  )}
                </OrbitGroup>
              );
            }
            return (
              <OrbitGroup key={d.id} dest={d} animate={!reducedMotion}>
                {planetEl}
                {/* Mangalyaan (Mars Orbiter Mission) rides Mars's group. */}
                {d.id === "projects" && showExtras && (
                  <IsroProbe
                    orbitRadius={d.radius * 1.9} speed={0.26} tilt={0.5} phase={0.4} scale={d.radius * 0.15}
                    event="stellar:mangalyaan" animate={!reducedMotion}
                    onPointerOver={handleHoverIn} onPointerOut={handleHoverOut}
                  />
                )}
              </OrbitGroup>
            );
          }
          if (d.kind === "beacon") {
            return (
              <Beacon
                key={d.id}
                position={d.position}
                radius={d.radius}
                color={d.color}
                animate={!reducedMotion}
                onClick={handleClick}
                onPointerOver={handleHoverIn}
                onPointerOut={handleHoverOut}
              />
            );
          }
          return null;
        })}

        {!isMobile && <LensFlare position={[0, 0, 0]} />}
        {/* Orrery rings — the real orbital structure, shown in the system view. */}
        {showExtras && <OrbitRings wideRef={wideRef} />}
        {/* Dwarf planets + named belt bodies (Vesta, Eris, Makemake, Haumea). */}
        {showExtras && <DwarfPlanets animate={!reducedMotion} />}
        {/* The asteroid + Kuiper belts as BACKGROUND scenery (no longer tour
            stops — Ceres + Pluto host those sections). Faint debris rings. */}
        {showExtras && (
          <>
            <AsteroidBelt count={isMobile ? 1200 : 2600} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} size={0.18} thickness={BACKGROUND_BELTS.asteroid.thickness} animate={!reducedMotion} />
            <BeltDust count={isMobile ? 9000 : 26000} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} thickness={BACKGROUND_BELTS.asteroid.thickness} color={BACKGROUND_BELTS.asteroid.color} size={2.6} opacity={0.45} animate={!reducedMotion} />
          </>
        )}
        {showExtras && !isMobile && (
          <>
            <AsteroidBelt count={1500} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} size={0.9} thickness={BACKGROUND_BELTS.kuiper.thickness} animate={!reducedMotion} />
            <BeltDust count={20000} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} thickness={BACKGROUND_BELTS.kuiper.thickness} color={BACKGROUND_BELTS.kuiper.color} size={2.3} opacity={0.4} animate={!reducedMotion} />
          </>
        )}
        {/* Jupiter's Trojan asteroids — two swarms 60° ahead/behind Jupiter at
            the L4/L5 Lagrange points (true orbital radius). */}
        {showExtras && <TrojanAsteroids count={isMobile ? 70 : 160} />}
        {/* The Oort cloud wrapping the whole system + the heliosphere boundary
            bubble out at the edge (where Voyager crossed). */}
        {showExtras && <OortCloud count={isMobile ? 700 : 1400} />}
        {showExtras && !isMobile && <Heliosphere />}
        {/* Real solar eclipses — Earth's actual Moon + any planet you fly
            behind occlude the Sun (corona + chromosphere + diamond-ring). */}
        {showExtras && <SolarEclipse satelliteRef={moonWorldRef} eclipseRef={eclipseRef} reducedMotion={reducedMotion} />}
        {/* Fade the scene lights toward dark at totality (planet → silhouette). */}
        {showExtras && <EclipseLights eclipseRef={eclipseRef} />}
        {!isMobile && !reducedMotion && <DustParticles />}
        {/* Non-essential extras defer-mount until the intro completes —
            keeps the warp/countdown window + LCP light, and trims the
            initial scene-graph build. */}
        {showExtras && <Voyager />}
        {/* Humanity's robot fleet at their real locations (JWST@L2, Parker,
            Juno, Lucy, New Horizons). */}
        {showExtras && <RobotFleet />}
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
        <FreeRoam enabled={freeRoamEnabled} offsetRef={freeRoamOffsetRef} speedRef={speedRef} thrustRef={thrustRef} />
        {/* Game mode: a true free-look (mouse + WASD) flight that OWNS the
            camera; CameraRig yields (controlsEnabled). */}
        <GameFlight enabled={gameActive} speedRef={speedRef} cameraRef={cameraRef} thrustRef={thrustRef} flyToRef={flyToRef} />
        <CameraShake parallaxOffsetRef={parallaxOffsetRef} />
        <CameraRig
          scrollT={scrollT}
          controlsEnabled={gameActive}
          parallaxOffsetRef={parallaxOffsetRef}
          freeRoamOffsetRef={freeRoamOffsetRef}
          freeRoamEnabled={freeRoamEnabled}
          wideRef={wideRef}
          wideOrbitRef={wideOrbitRef}
          focusRef={focusRef}
          cameraRef={cameraRef}
          launchPhase={launchPhase}
          /* Desktop frames the planet right-of-centre to clear the left
             content column; compact/mobile keep it centred (stacked layout). */
          frameShift={isCompact ? 0 : 0.3}
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
      {/* multisampling MUST stay 0 — MSAA on the composer's render target
          breaks the additive sun/bloom compositing (black flicker). Edge AA
          comes from rendering at native 2× DPR instead. DOF removed, so the
          scene is fully in focus and crisp. */}
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          intensity={isMobile ? 0.62 : 0.85}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.48}
        />
        {/* Grade: bright base (the real fix for the earlier "too dark"),
            but saturation pulled NEGATIVE — pixel analysis showed planets
            at 0.6–0.9 HSV saturation (cartoonish; real space sits ~0.3).
            −0.12 brings colours back to natural without going grey because
            the base stays bright. Mild contrast, soft vignette so the
            background doesn't read as high-contrast. */}
        {/* VIBRANT grade — saturated, glossy, deep-black space. */}
        <CinematicGrade
          brightness={0.03}
          contrast={0.08}
          saturation={0.32}
          vigOffset={0.4}
          vigDarkness={0.28}
          aberration={0.004}
          gain={1.04}
          vigTint={[0.65, 0.74, 1.0]}
        />
      </EffectComposer>
      </SceneClock>
    </Canvas>
  );
};

export default Scene;
