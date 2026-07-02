/* eslint-disable react/no-unknown-property */
import { Suspense, useEffect, useRef, cloneElement } from "react";
import { Canvas, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import CinematicGrade from "./CinematicGrade";
import ArrivalPulse from "./ArrivalPulse";
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
import ExoticObjects from "./ExoticObjects";
import ProjectProbes from "./ProjectProbes";
import DeepFieldMysteries from "./DeepFieldMysteries";
import Kilonova from "./Kilonova";
import Hypergiant from "./Hypergiant";
import EtaCarinae from "./EtaCarinae";
import EinsteinRing from "./EinsteinRing";
import Wormhole from "./Wormhole";
import LensFlare from "./LensFlare";
import OrbitRings from "./OrbitRings";
import Beacon from "./Beacon";
// LaneObjects retired — the Holo-Bridge dossier cluster replaces the forced-←→ convoy.
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
import Constellations from "./Constellations";
import ShootingStars from "./ShootingStars";
import RocketLaunch from "./RocketLaunch";
import DangerField from "./DangerField";
import DataFragments from "./DataFragments";
import DustParticles from "./DustParticles";
import AdaptiveQuality from "./AdaptiveQuality";
import Sonification from "./Sonification";
import SaturnHexagon from "./SaturnHexagon";
import IoTorus from "./IoTorus";
import NeptuneAurora from "./NeptuneAurora";
import MoonGeysers from "./MoonGeysers";
import GlobularCluster from "./GlobularCluster";
import GravWaveChirp from "./GravWaveChirp";
import CosmicMarker from "./CosmicMarker";
import RedDots from "./RedDots";
import MimasMoon from "./MimasMoon";
import TitanLakes from "./TitanLakes";
import EclipseShadow from "./EclipseShadow";
import AutoExposure from "./AutoExposure";
import KeyLight from "./KeyLight";
import MouseParallax from "./MouseParallax";
import FreeRoam from "./FreeRoam";
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
import Monolith from "./easter/Monolith";
import HaloRing from "./easter/HaloRing";
import DysonSwarm from "./easter/DysonSwarm";
import SolGate from "./easter/SolGate";
import Citadel from "./easter/Citadel";
import GenerationShip from "./easter/GenerationShip";
import Heighliner from "./easter/Heighliner";
import GoldenRecord from "./easter/GoldenRecord";
import Sandworm from "./easter/Sandworm";
import Rocinante from "./easter/Rocinante";
import Normandy from "./easter/Normandy";
import DiscoveryOne from "./easter/DiscoveryOne";
import Nostromo from "./easter/Nostromo";
import MarsRovers from "./easter/MarsRovers";
import useViewport from "../useViewport";
import { DESTINATIONS, remapPosition, frontOfSun, BACKGROUND_BELTS } from "../config/destinations";
import { rotationSpeedFor } from "../config/planetData";

/* Kirkwood gaps as fractions of the main belt (2.1–3.3 AU): the 3:1 (2.50 AU),
   5:2 (2.82) and 2:1 (3.27) Jupiter resonances. Stable identity so the belt
   isn't regenerated each render. */
const KIRKWOOD_GAPS = [0.333, 0.6, 0.975];

/* Kuiper-belt spectral mix — icy worlds: blue-grey ice, brighter white-ice, and
   reddish tholin-coated bodies (the real KBO colour bimodality). */
const ICY_FAMILIES = [
  { color: "#8a96a8", metal: 0.05, rough: 0.85 }, // blue-grey ice
  { color: "#aab6c6", metal: 0.04, rough: 0.9 },  // bright water ice
  { color: "#9a7565", metal: 0.05, rough: 0.9 },  // reddish tholin
];
const ICY_WEIGHTS = [0.45, 0.3, 0.25];

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

const Scene = ({ scrollT, activeIdx, itemIdx = 0, onJump, onReady, freeRoamEnabled, speedRef, thrustRef, wideRef, wideOrbitRef, focusRef, warpVelRef, cameraRef, eclipseRef, clock, extrasPhase = 3, launchPhase = null, onLaunchComplete, v3 = false }) => {
  const readyRef = useRef(false);
  const { isMobile, isCompact, reducedMotion } = useViewport();
  /* Progressive-mount tiers (StellarApp ramps extrasPhase 0→3 behind the
     countdown cover, so the whole suite no longer mounts in one frame-freezing
     commit). Tier 1 = structural extras + belts; tier 2 = anomalies/comets;
     tier 3 = easter-egg models (heaviest, last). */
  /* v3 = NATURAL OBJECTS ONLY — no spacecraft/probes/megastructures/pop-culture.
     `showEggs` (the whole fiction/cameo tier) is force-off, and the human-made
     objects that live in other tiers (probes, ISS, rovers, Voyager) are gated by
     `naturalOnly` at their mount sites. */
  const naturalOnly = v3;
  const showExtras = extrasPhase >= 1;
  const showMid = extrasPhase >= 2;
  const showEggs = extrasPhase >= 3 && !naturalOnly;
  /* v3 keeps the deep field MINIMAL — the noisy Tier-2 extras (kilonova, hypergiant,
     Eta Carinae, Einstein ring, globular cluster, grav-wave chirp, red dots, cosmic-web
     markers, spare comets, danger field) crowd the clean planet frames. The tour-worthy
     landmarks (black hole, pulsar, comet, wormhole, nebulae, Milky Way) stay. */
  const deepMid = showMid && !v3;
  /* Camera offsets — kept in refs so React state doesn't re-render
     the whole tree on every frame. Mouse parallax and free-roam each
     own their own offset; CameraRig sums them. */
  const parallaxOffsetRef = useRef(new THREE.Vector3());
  const freeRoamOffsetRef = useRef(new THREE.Vector3());
  /* Bloom effect handle (static intensity; warp pulse removed in v3). */
  const bloomRef = useRef();
  const arrivalRef = useRef(0); // decaying 0→1 pulse on stop arrival (bloom swell + grade crisp)
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
        /* Photo Mode (Phase 3C) reads the canvas via toDataURL — needs the buffer
           kept after compositing. Modest cost; fine for a portfolio. */
        preserveDrawingBuffer: true,
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

      {/* Lane objects — the active section's résumé items as a co-orbital convoy
          on the planet's orbital lane (←→ selects them; M2b adds the fly-to). */}
      {/* lane convoy retired — Holo-Bridge dossier cluster replaces forced ←→ */}

      <Suspense fallback={null}>
        <Skybox />
        <Stars />
        <Nebulae />
        {/* Grand faint galactic band — far backdrop for depth. */}
        <MilkyWay animate={!reducedMotion} />
        {/* Zodiacal light — faint sunlight scattered by ecliptic-plane dust. */}
        {showExtras && <ZodiacalLight />}
        {/* Named constellations (Orion, Big Dipper, Cassiopeia) that fade in
            when the camera holds still — built but previously unmounted. */}
        {showExtras && !isMobile && !v3 && <Constellations scrollTRef={scrollT} />}
        {/* The edge anomaly — Gargantua, out in front of the camera (behind the
            Sun, −X) so it's a visible deep-space landmark throughout the tour
            rather than hidden off to the +X side behind the viewer. */}
        {showMid && <BlackHole position={remapPosition(frontOfSun([49, -6, -15]))} radius={32} animate={!reducedMotion} onPointerOver={handleHoverIn} onPointerOut={handleHoverOut} />}
        {/* Spaghettification dread near Gargantua — writes clock.danger. */}
        {deepMid && <DangerField animate={!reducedMotion} />}
        {/* Flyable résumé collectibles — collected while piloting. */}
        {showEggs && <DataFragments active={freeRoamEnabled} animate={!reducedMotion} />}
        {/* Anomaly suite — the discoverable spectacle (tier 2). Motion-heavy ones
            respect reduced-motion + device. */}
        {showMid && !reducedMotion && <Comet />}
        {/* 'Oumuamua — the interstellar visitor cutting through on a hyperbolic
            path, tumbling end over end. */}
        {deepMid && !reducedMotion && <InterstellarVisitor animate={!reducedMotion} />}
        {/* The interstellar comets: 3I/ATLAS (green coma + sunward anti-tail) and
            2I/Borisov (reddish coma) — completing the trio with 'Oumuamua. */}
        {deepMid && !reducedMotion && <AtlasComet />}
        {deepMid && !reducedMotion && (
          <AtlasComet start={[-620, -150, 240]} vel={[168, 4, -64]} coma="#e0a890" ion="#cdbfa0" dust="#e8d8b8" antiTail={false} comaR={1.2} respawn={780} />
        )}
        {/* Sungrazer C/2026 A1 — a steep dive through ~the Sun (true-scale path). */}
        {deepMid && !reducedMotion && (
          <AtlasComet start={[560, 130, -380]} vel={[-150, -35, 102]} coma="#cfe8ff" ion="#bfe0ff" dust="#eae6ff" antiTail={false} comaR={1.1} respawn={720} />
        )}
        {/* Clickable wishing meteors. */}
        {deepMid && !reducedMotion && <ShootingStars animate={!reducedMotion} />}
        {showMid && !isMobile && !reducedMotion && <Meteors />}
        {showMid && !isMobile && !reducedMotion && <Pulsar />}
        {/* New deep-field exotics: Sgr A*, magnetar, brown dwarf, rogue planet. */}
        {deepMid && <ExoticObjects animate={!reducedMotion} />}
        {/* Human-made probes + speculative "mysteries" — removed in v3 (natural only). */}
        {showMid && !naturalOnly && <ProjectProbes animate={!reducedMotion} />}
        {showMid && !naturalOnly && <DeepFieldMysteries animate={!reducedMotion} />}
        {/* PHASE 4 (Wave 1) — deep-sky wonders: a kilonova event + a red supergiant. */}
        {deepMid && <Kilonova animate={!reducedMotion} />}
        {deepMid && <Hypergiant animate={!reducedMotion} />}
        {/* Eta Carinae's bipolar Homunculus + an Einstein-ring lens galaxy. */}
        {deepMid && <EtaCarinae animate={!reducedMotion} />}
        {deepMid && <EinsteinRing animate={!reducedMotion} />}
        {/* Wave 2 — scale & mystery: globular cluster, GW chirp, little red dots, cosmic web. */}
        {deepMid && <GlobularCluster animate={!reducedMotion} />}
        {deepMid && <GravWaveChirp animate={!reducedMotion} />}
        {deepMid && <RedDots animate={!reducedMotion} />}
        {deepMid && <CosmicMarker raw={[-44, 38, 28]} kind="void" count={520} radius={11} glow="#8aa0d8" animate={!reducedMotion} />}
        {deepMid && <CosmicMarker raw={[60, 20, -40]} kind="attractor" count={680} radius={10} glow="#ffd0a0" animate={!reducedMotion} />}
        {deepMid && <CosmicMarker raw={[-64, -10, -48]} kind="wall" count={760} radius={13} glow="#a0b6ff" animate={!reducedMotion} />}
        {/* Wormhole "Beam aboard" portal at the Contact edge — the booking CTA. */}
        {showMid && <Wormhole />}

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
                grade={d.grade}
                rings={d.rings}
                faintRings={d.faintRings}
                ringColor={d.ringColor}
                axialTilt={d.axialTilt || 0}
                oblateness={d.oblateness || 0}
                moons={d.moons || 0}
                moonColor={d.moonColor}
                moonScale={d.moonScale || 0.12}
                moonSet={d.moonSet}
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
                  {showExtras && !isMobile && !naturalOnly && (
                    <EarthStation planetRadius={d.radius} animate={!reducedMotion} />
                  )}
                  {showExtras && !isMobile && !naturalOnly && (
                    <RocketLaunch earthRadius={d.radius} animate={!reducedMotion} />
                  )}
                  {showExtras && <HomeCallout earthRadius={d.radius} />}
                  {/* 2026 eclipses — the Moon's umbra drifting across Earth's day side. */}
                  {showExtras && <EclipseShadow earthRadius={d.radius} animate={!reducedMotion} />}
                  {showExtras && !naturalOnly && (
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
                {/* PHASE 4 (Wave 1) — real planetary phenomena: Saturn's hexagon,
                    Io's plasma torus (Jupiter), Neptune's mid-latitude aurora. */}
                {d.id === "notes" && <SaturnHexagon radius={d.radius} axialTilt={d.axialTilt || 0} animate={!reducedMotion} />}
                {d.id === "skills" && <IoTorus radius={d.radius} axialTilt={d.axialTilt || 0} animate={!reducedMotion} />}
                {d.id === "hobbies" && <NeptuneAurora radius={d.radius} axialTilt={d.axialTilt || 0} animate={!reducedMotion} />}
                {/* Enceladus (Saturn) + Europa (Jupiter): south-pole water geysers from a
                    subsurface ocean — rides the parent's orbit at the moon's offset. */}
                {d.id === "notes" && <MoonGeysers offset={[-4.3, 1.1, 1.7]} radius={0.12} color="#eef3f1" plumeColor="#bfe6ff" jets={6} dir={[0, -1, 0.3]} animate={!reducedMotion} />}
                {d.id === "skills" && <MoonGeysers offset={[5.2, 1.0, 1.2]} radius={0.16} color="#dde6e3" plumeColor="#cfeaff" jets={4} dir={[0.4, -1, 0]} animate={!reducedMotion} />}
                {/* Wave 2 — Mimas (Saturn's Death-Star moon) + Triton's nitrogen geysers (Neptune). */}
                {d.id === "notes" && <MimasMoon offset={[4.6, 1.0, -2.1]} radius={0.13} animate={!reducedMotion} />}
                {d.id === "notes" && <TitanLakes offset={[4.4, 1.2, 0.9]} radius={0.18} animate={!reducedMotion} />}
                {d.id === "hobbies" && <MoonGeysers offset={[2.0, 0.8, 0.6]} radius={0.12} color="#d8cabd" plumeColor="#e6c6d6" jets={4} dir={[0.2, -1, 0.2]} animate={!reducedMotion} />}
                {/* Mangalyaan (Mars Orbiter Mission) rides Mars's group. */}
                {d.id === "projects" && showExtras && !naturalOnly && (
                  <IsroProbe
                    orbitRadius={d.radius * 2.4} speed={0.26} tilt={0.5} phase={0.4} scale={d.radius * 0.15}
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
          if (d.kind === "cosmic") {
            /* v3 deep-space epilogue stops — real cosmic objects placed along the
               outward tour path, framed big-on-the-right by the v3 rig (radius). */
            const p = d.position;
            if (d.render === "blackhole")
              return <BlackHole key={d.id} position={p} radius={d.radius} animate={!reducedMotion} onPointerOver={handleHoverIn} onPointerOut={handleHoverOut} />;
            if (d.render === "wormhole")
              return <Wormhole key={d.id} position={p} radius={d.radius} />;
            if (d.render === "pulsar")
              return <Pulsar key={d.id} position={p} radius={d.radius} />;
            if (d.render === "nebula")
              return <group key={d.id} position={p} scale={d.radius / 3}><EtaCarinae animate={!reducedMotion} /></group>;
            if (d.render === "milkyway")
              return <group key={d.id} position={p} scale={d.radius / 60}><MilkyWay animate={!reducedMotion} /></group>;
            return null;
          }
          return null;
        })}

        {/* Lens flare OFF in v3 — the sun-driven ghost circles/artifacts clutter the
            clean planet frames. */}
        {!isMobile && !v3 && <LensFlare position={[0, 0, 0]} />}
        {/* Orrery rings — the real orbital structure. Shown in overview mode AND on
            the v3 system-overview hero (stop 0). */}
        {showExtras && <OrbitRings wideRef={wideRef} show={v3 && activeIdx === 0} />}
        {/* Dwarf planets + named belt bodies (Vesta, Eris, Makemake, Haumea). */}
        {showExtras && <DwarfPlanets animate={!reducedMotion} />}
        {/* The asteroid + Kuiper belts as BACKGROUND scenery (no longer tour
            stops — Ceres + Pluto host those sections). Faint debris rings. */}
        {/* EXTREME-density belts, mount SPREAD across the progressive tiers so no
            single frame builds it all (eases the intro hitch): rocks first
            (tier 1), the heavy dust haze next (tier 2), the faint gas last
            (tier 3). Main belt = realistic C/S/M mix (~75% dark C-type); Kuiper =
            icy (blue/white ice + reddish tholins). Full dust→giant size range. */}
        {showExtras && (
          <AsteroidBelt count={isMobile ? 5000 : 12000} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} size={0.18} thickness={BACKGROUND_BELTS.asteroid.thickness} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showExtras && !isMobile && (
          <AsteroidBelt count={6500} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} size={0.55} thickness={BACKGROUND_BELTS.kuiper.thickness} families={ICY_FAMILIES} weights={ICY_WEIGHTS} cliff animate={!reducedMotion} />
        )}
        {/* Dust haze — tier 2 (the heaviest point build, deferred one tier). */}
        {showMid && (
          <BeltDust count={isMobile ? 34000 : 80000} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} thickness={BACKGROUND_BELTS.asteroid.thickness} color={BACKGROUND_BELTS.asteroid.color} size={2.6} opacity={0.3} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showMid && !isMobile && (
          <BeltDust count={55000} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} thickness={BACKGROUND_BELTS.kuiper.thickness} color={BACKGROUND_BELTS.kuiper.color} size={2.3} opacity={0.26} cliff animate={!reducedMotion} />
        )}
        {/* Tenuous gas/dust clouds — tier 3 (big, faint, soft; distance-faded by
            the same shader so they never bloom into a bar). Desktop only. */}
        {showEggs && !isMobile && (
          <BeltDust count={3200} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} thickness={BACKGROUND_BELTS.asteroid.thickness * 1.4} color="#8a7a64" size={16} opacity={0.09} drift={0.008} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showEggs && !isMobile && (
          <BeltDust count={2600} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} thickness={BACKGROUND_BELTS.kuiper.thickness * 1.3} color="#6a7e9e" size={20} opacity={0.08} drift={0.006} cliff animate={!reducedMotion} />
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
        {/* PHASE 3D — proximity sonification (silent until un-muted). */}
        {!reducedMotion && <Sonification />}
        {/* Non-essential extras defer-mount until the intro completes —
            keeps the warp/countdown window + LCP light, and trims the
            initial scene-graph build. */}
        {showExtras && !naturalOnly && <Voyager />}
        {/* Humanity's robot fleet at their real locations (JWST@L2, Parker,
            Juno, Lucy, New Horizons). Removed in v3 (natural only). */}
        {showExtras && !naturalOnly && <RobotFleet />}
        {showEggs && !isMobile && <CommitComets />}
        {/* Easter-egg models (tier 3) — the heaviest, least-essential mounts, so
            they come LAST in the progressive mount (kept out of the intro). */}
        {showEggs && <DeathStar />}
        {showEggs && <Tardis />}
        {showEggs && <HalEye />}
        {showEggs && <WallE />}
        {showEggs && <CooperStation />}
        {showEggs && <WatneyPotato />}
        {/* Phase 6 homages — Endurance (Interstellar), a deep-field Star
            Destroyer (Star Wars), the Enterprise (Star Trek). */}
        {showEggs && <Endurance />}
        {showEggs && !isMobile && <StarDestroyer />}
        {showEggs && <Enterprise />}
        {/* Wave 3 — diegetic megastructure cameos (deep field). */}
        {showEggs && <Monolith animate={!reducedMotion} />}
        {showEggs && <HaloRing animate={!reducedMotion} />}
        {showEggs && <DysonSwarm animate={!reducedMotion} />}
        {showEggs && <SolGate animate={!reducedMotion} />}
        {showEggs && !isMobile && <Citadel animate={!reducedMotion} />}
        {/* Wave 3 remainder — beside-planet cameos + deep-field structures. */}
        {showEggs && <Sandworm />}
        {showEggs && <MarsRovers />}
        {showEggs && <Rocinante />}
        {showEggs && <Normandy />}
        {showEggs && <DiscoveryOne />}
        {showEggs && <Nostromo />}
        {showEggs && <GoldenRecord />}
        {showEggs && !isMobile && <GenerationShip animate={!reducedMotion} />}
        {showEggs && !isMobile && <Heighliner animate={!reducedMotion} />}
        {!isMobile && !reducedMotion && <MouseParallax offsetRef={parallaxOffsetRef} />}
        <FreeRoam enabled={freeRoamEnabled} offsetRef={freeRoamOffsetRef} speedRef={speedRef} thrustRef={thrustRef} />
        <CameraShake parallaxOffsetRef={parallaxOffsetRef} />
        <CameraRig
          scrollT={scrollT}
          parallaxOffsetRef={parallaxOffsetRef}
          freeRoamOffsetRef={freeRoamOffsetRef}
          freeRoamEnabled={freeRoamEnabled}
          wideRef={wideRef}
          wideOrbitRef={wideOrbitRef}
          focusRef={focusRef}
          warpVelRef={warpVelRef}
          cameraRef={cameraRef}
          launchPhase={launchPhase}
          onLaunchComplete={onLaunchComplete}
          /* Reduced-motion + mobile → SNAP (no first-person fly-through; info
             stays visible). The rig reads these to gate the flight + flyingRef. */
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          v3={v3}
          /* v3 desktop = cinematic split: each planet framed LARGE on the RIGHT so
             the left info column has room. (v2 kept it centred; compact/mobile stack.) */
          frameShift={v3 && !isMobile ? 0.42 : 0}
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
      <ArrivalPulse bloomRef={bloomRef} arrivalRef={arrivalRef} base={isMobile ? 0.6 : 0.8} enabled={!reducedMotion} />
      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          ref={bloomRef}
          intensity={isMobile ? 0.6 : 0.8}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.45}
        />
        {/* Grade: bright base, saturation pulled slightly NEGATIVE so colours
            stay natural/realistic (real space sits ~0.3 sat, not cartoonish).
            Mild contrast, soft vignette. NO saturation/vibrance push — original
            realistic colours. */}
        <CinematicGrade
          brightness={0.025}
          contrast={0.04}
          saturation={-0.02}
          vigOffset={0.36}
          vigDarkness={0.38}
          vigBreathe={reducedMotion ? 0 : 0.05}
          arrivalRef={arrivalRef}
        />
      </EffectComposer>
      </SceneClock>
    </Canvas>
  );
};

export default Scene;
