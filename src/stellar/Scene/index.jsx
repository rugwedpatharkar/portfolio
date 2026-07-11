/* eslint-disable react/no-unknown-property */
import { Suspense, useMemo, useRef, cloneElement } from "react";
import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import CinematicGrade from "./CinematicGrade";
import SceneClock from "./SceneClock";
import Stars from "./Stars";
import Sun from "./Sun";
import SunRays from "./SunRays";
import Planet from "./Planet";
import CameraRig from "./CameraRig";
import AsteroidBelt, { KUIPER_FAMILIES, kuiperWeightsFor } from "./AsteroidBelt";
import Nebulae from "./Nebulae";
import VisibilityController from "./VisibilityController";
import Skybox from "./Skybox";
import OrbitGroup from "./OrbitGroup";
/* BlackHole is also imported for the cosmic-stop planet-loop branch below
   (the destination-row-driven mount at Contact). The registry mounts a
   separate placement-only BlackHole from Scene/registry.js. */
import BlackHole from "./anomalies/BlackHole";
import OrbitRings from "./OrbitRings";
// LaneObjects retired — the Holo-Bridge dossier cluster replaces the forced-←→ convoy.
import SolarEclipse from "./SolarEclipse";
import EclipseLights from "./EclipseLights";
import DwarfPlanets from "./DwarfPlanets";
import BeltDust from "./BeltDust";
import LocalNeighborhood from "./LocalNeighborhood";
import TrojanAsteroids from "./TrojanAsteroids";
import OortCloud from "./OortCloud";
import Heliosphere from "./Heliosphere";
import MilkyWay from "./MilkyWay";
import DustParticles from "./DustParticles";
import AdaptiveQuality from "./AdaptiveQuality";
import Sonification from "./Sonification";
import SaturnHexagon from "./SaturnHexagon";
import IoTorus from "./IoTorus";
import NeptuneAurora from "./NeptuneAurora";
import MoonGeysers from "./MoonGeysers";
import MimasMoon from "./MimasMoon";
import TitanLakes from "./TitanLakes";
import EclipseShadow from "./EclipseShadow";
import AutoExposure from "./AutoExposure";
import KeyLight from "./KeyLight";
import MouseParallax from "./MouseParallax";
import SafeLoad from "./SafeLoad";
import useViewport from "../useViewport";
import { DESTINATIONS, BACKGROUND_BELTS } from "../config/destinations";
import { rotationSpeedFor } from "../config/planetData";
import { SCENE_OBJECTS } from "./registry";

/* Kirkwood gaps as fractions of the main belt (2.1-3.3 AU) — all four major
   Jupiter mean-motion resonances: 3:1 (2.50 AU, frac 0.333), 5:2 (2.82 AU,
   frac 0.600), 7:3 (2.958 AU, frac 0.715), 2:1 (3.27 AU, frac 0.975). Stable
   identity so the belt isn't regenerated each render. See belt-research.md. */
const KIRKWOOD_GAPS = [0.333, 0.600, 0.715, 0.975];

/* Kuiper resonance clumps — the mirror image of gaps: the belt PILES UP at
   the mean-motion resonances with Neptune that Neptune's outward migration
   captured planetesimals into. 3:2 Plutinos at 39.4 AU (frac 0.47),
   2:1 Twotinos at 47.7 AU (frac 0.885). */
const KUIPER_CLUMPS = [0.47, 0.885];
/* Solid-colour stand-in for a planet whose texture fails to load — rendered by
   SafeLoad in place of <Planet>. Sits at the OrbitGroup origin so it still rides
   the body's live orbit; the accent `color` keeps it recognisable. */
const planetFallback = (d) => (
  <mesh>
    <sphereGeometry args={[d.radius, 32, 32]} />
    <meshStandardMaterial color={d.color || "#8a8a8a"} roughness={0.9} metalness={0} />
  </mesh>
);

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

/* Drives the finale's cinematic through-black dip from the continuous scrub
   (finaleT). uFade is a V: 1 at the tour end (t=0) and full finale (t=1),
   dipping near black at t=0.5 where the solar↔neighbourhood content swap fires
   — so the cut is unseen. Runs every frame (cheap); no-op at t=0/1. */
function FinaleGradeDip({ gradeRef, finaleT }) {
  useFrame(() => {
    const g = gradeRef.current;
    if (!g) return;
    const t = finaleT?.current ?? 0;
    const m = Math.abs(2 * t - 1); // 1 at ends, 0 at mid
    const s = m * m * (3 - 2 * m); // smoothstep
    g.uniforms.get("uFade").value = 0.05 + 0.95 * s;
  });
  return null;
}

const Scene = ({ scrollT, finaleT, finale = false, activeIdx, onJump, focusRef, warpVelRef, cameraRef, eclipseRef, clock, extrasPhase = 3, v3 = false }) => {
  const { isMobile, reducedMotion } = useViewport();
  /* Pull-back finale — when active the AU-scale solar system is hidden and the
     LOCAL stellar neighbourhood (LocalNeighborhood) + the boosted Milky-Way arch
     take over, camera pulled back to the Sun among its neighbours. `finale` is
     the discrete content swap (StellarApp, fired by scroll at the reveal's black
     dip, or forced by `?finale=1`); `finaleT` is the continuous 0→1 scrub the
     camera + grade read each frame. */
  /* Progressive-mount tiers — StellarApp ramps extrasPhase 0→3 so the heavy suite
     doesn't build in one frame-freezing commit. Tier 1 = structural extras + belts;
     tier 2 = deep-field anomalies/comets; tier 3 = the heaviest models last. Every
     object is real (belts, dust, comets, visitors, spacecraft, deep-field); gating
     is by the tiers + device/motion budget + the finale flag. */
  const showExtras = extrasPhase >= 1 && !finale;
  const showMid = extrasPhase >= 2 && !finale;
  const showEggs = extrasPhase >= 3 && !finale;
  /* Tier 4 — the heaviest point build (belt dust ~68k points) mounts LAST and
     ALONE, so it never shares a React commit / GPU upload with the deep-field or
     anomalies (that collision was the boot black-frame). */
  const showDust = extrasPhase >= 4 && !finale;
  /* Camera offsets — kept in refs so React state doesn't re-render
     the whole tree on every frame. Mouse parallax and free-roam each
     own their own offset; CameraRig sums them. */
  const parallaxOffsetRef = useRef(new THREE.Vector3());
  /* Bloom effect handle (static intensity; warp pulse removed in v3). */
  const bloomRef = useRef();
  /* Grade effect handle — the finale scrub sets its uFade uniform each frame. */
  const gradeRef = useRef();
  /* Earth's Moon world position, published by its Planet, read by SolarEclipse. */
  const moonWorldRef = useRef(new THREE.Vector3());

  const setCursor = (val) => {
    if (typeof document !== "undefined") document.body.style.cursor = val;
  };
  const handleHoverIn = () => setCursor("pointer");
  const handleHoverOut = () => setCursor("");

  /* Render at the display's native pixel ratio (up to 2× on retina/4K) for
     crisp HD. We removed Depth-of-Field, so nothing is intentionally blurred
     and the extra pixels actually read as sharpness. The adaptive guard still
     floors DPR only on a genuinely struggling GPU. */
  const dprCap = isMobile ? 1.5 : 2;

  /* §7.4 — feature-flagged experiment with frameloop="demand". Off by default:
     the tour has continuous animation everywhere (planet orbits, Sun churn,
     anomaly pulses, camera scrub, bloom), and demand mode only renders on
     explicit invalidate() calls — useFrame subscribers stop firing between
     invalidates. Under reduced-motion the scene IS effectively static (
     SceneClock.scale=0 freezes orbits + shaders), so demand mode is safe.
     Under normal play it will visibly freeze the Sun; kept as an opt-in
     query flag (?frameloop=demand) for measurement / experimentation. */
  const frameloopMode = useMemo(() => {
    if (typeof window === "undefined") return "always";
    const q = new URLSearchParams(window.location.search).get("frameloop");
    if (q === "demand" || (q === "auto" && reducedMotion)) return "demand";
    if (reducedMotion && q === "auto") return "demand";
    return "always";
  }, [reducedMotion]);

  return (
    <Canvas
      frameloop={frameloopMode}
      dpr={[1, dprCap]}
      /* Soft shadows on desktop only — the key light (KeyLight) follows
         the active planet so the map stays sharp + cheap. */
      shadows={isMobile ? false : "soft"}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: "high-performance",
        /* Keep the drawing buffer so the canvas stays capturable (headless
           screenshots, and any future "share this frame" image) — without it a
           programmatic capture reads a cleared/black buffer. Negligible cost. */
        preserveDrawingBuffer: true,
        /* §7.7 — logarithmicDepthBuffer was enabled speculatively (no observed
           z-fighting; the audit flagged it "deferred, re-test empirically").
           REVERTED — enabling log depth requires every custom ShaderMaterial
           (Sun, Wormhole, BeltDust, Stars, PlanetMaterial, etc.) to include
           three's `logdepthbuf_pars_*` + `logdepthbuf_*` GLSL chunks in both
           vertex + fragment shaders. Without those, the shader writes wrong
           depth values → additive particles render THROUGH opaque solids (the
           user saw belt rocks showing on top of the Sun). Standard 24-bit
           depth handles the current scene fine; re-enable log depth only
           after every custom material carries the depth chunks. */
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
      <KeyLight scrollT={scrollT} focusRef={focusRef} castShadow={!isMobile} />
      <directionalLight position={[-30, 10, -25]} intensity={0.5} color="#6f8cff" />

      {/* Lane objects — the active section's résumé items as a co-orbital convoy
          on the planet's orbital lane (←→ selects them; M2b adds the fly-to). */}
      {/* lane convoy retired — Holo-Bridge dossier cluster replaces forced ←→ */}

      <Suspense fallback={null}>
        <SafeLoad><Skybox /></SafeLoad>
        {!finale && <Stars />}
        {!finale && <SafeLoad><Nebulae /></SafeLoad>}
        {/* Grand faint galactic band — far backdrop for depth; in the finale it's
            the galaxy wrapping around our local neighbourhood (boosted to a
            luminous arch). */}
        <MilkyWay finale={finale} />
        {/* Pull-back finale (?finale=1) — the local stellar neighbourhood at true depth. */}
        {finale && <LocalNeighborhood active />}
        {/* Zodiacal light removed — its 8,500 additive points bloomed into an
            inaccurate white bar flanking the Sun (per user). The real zodiacal
            glow is far too faint to read at this scale. */}
        {/* Named constellations (Orion, Big Dipper, Cassiopeia) that fade in
            when the camera holds still — built but previously unmounted. */}
        {/* Stylised constellations removed — they were drawn on a small radius-380
            sphere, so from the wide overview (camera ~2200u out) they sat in the
            FOREGROUND as glitchy blue zigzags across the Sun; and being "not
            astronomically precise" they clashed with the accurate real star field
            (Stars.jsx), which is the real sky. */}
        {/* The edge anomaly — Gargantua, out in front of the camera (behind the
            Sun, −X) so it's a visible deep-space landmark throughout the tour
            rather than hidden off to the +X side behind the viewer. */}
        {/* Tier-2 mounts (anomaly suite + transient objects) — declared once in
            Scene/registry.js. Individual gates (motion/desktop), animate prop,
            hover handlers, and static prop bags all live on the row. */}
        {showMid && SCENE_OBJECTS.map((o) => {
          if (o.motion && reducedMotion) return null;
          if (o.desktop && isMobile) return null;
          const C = o.C;
          return (
            <C
              key={o.id}
              {...(o.animate ? { animate: !reducedMotion } : {})}
              {...(o.hoverable ? { onPointerOver: handleHoverIn, onPointerOut: handleHoverOut } : {})}
              {...(o.props || {})}
            />
          );
        })}


        {!finale && DESTINATIONS.map((d, idx) => {
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
                <SafeLoad fallback={
                  <mesh position={d.position}>
                    <sphereGeometry args={[d.radius, 32, 32]} />
                    <meshBasicMaterial color={d.color} toneMapped={false} />
                  </mesh>
                }>
                  <Sun
                    position={d.position}
                    radius={d.radius}
                    texture={d.texture}
                    animate={!reducedMotion}
                    onClick={handleSunClick}
                    onPointerOver={handleHoverIn}
                    onPointerOut={handleHoverOut}
                  />
                </SafeLoad>
                {/* Anamorphic god-ray shafts. Radius scaled to the Sun's
                    visual extent so the streaks reach out ~4× the disc — a
                    cinematic lens-flare read without a second post pass. */}
                <SunRays
                  position={d.position}
                  radius={d.radius * 6}
                  intensity={reducedMotion ? 0 : 0.55}
                />
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
                  {/* Moon publishes its world position for the eclipse system. */}
                  <SafeLoad fallback={planetFallback(d)}>
                    {cloneElement(planetEl, { satelliteRef: moonWorldRef })}
                  </SafeLoad>
                  {/* Man-made craft removed (ISS, Pune rocket launch, Chandrayaan).
                      2026 eclipses stay — the Moon's umbra drifting across Earth's
                      day side is a real natural event. */}
                  {showExtras && <EclipseShadow earthRadius={d.radius} animate={!reducedMotion} />}
                </OrbitGroup>
              );
            }
            return (
              <OrbitGroup key={d.id} dest={d} animate={!reducedMotion}>
                <SafeLoad fallback={planetFallback(d)}>{planetEl}</SafeLoad>
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
                {/* Mangalyaan (Mars Orbiter Mission) removed — man-made, per user. */}
              </OrbitGroup>
            );
          }
          if (d.kind === "cosmic") {
            /* v3 deep-space epilogue stops — real cosmic objects placed along the
               outward tour path, framed big-on-the-right by the v3 rig (radius). */
            const p = d.position;
            if (d.render === "blackhole")
              return <BlackHole key={d.id} position={p} radius={d.radius} animate={!reducedMotion} onPointerOver={handleHoverIn} onPointerOut={handleHoverOut} />;
            return null;
          }
          return null;
        })}

        {/* Lens flare removed — the sun-driven ghost circles/artifacts (a concentric
            "portal" ring at the Sun's screen position) cluttered the overview + every
            planet transition. The comment claimed it was off in v3 but it still
            mounted; now it's actually gone. The Sun's own Bloom glows it cleanly. */}
        {/* Orrery rings — the real orbital structure. Shown in overview mode AND on
            the v3 system-overview hero (stop 0). */}
        {showExtras && <OrbitRings show={v3 && activeIdx === 0} />}
        {/* Dwarf planets + named belt bodies (Vesta, Eris, Makemake, Haumea). */}
        {showExtras && <DwarfPlanets animate={!reducedMotion} />}
        {/* The asteroid + Kuiper belts as BACKGROUND scenery (no longer tour
            stops — Ceres + Pluto host those sections). Faint debris rings. */}
        {/* EXTREME-density belts, mount SPREAD across the progressive tiers so no
            single frame builds it all (eases the intro hitch): rocks first
            (tier 1), the heavy dust haze next (tier 2), the faint gas last
            (tier 3). Main belt = realistic C/S/M mix (~75% dark C-type); Kuiper =
            icy (blue/white ice + reddish tholins). Full dust→giant size range. */}
        {/* Real rock instances — at the wide-overview distance each 0.18-unit
            rock renders as a bright anti-aliased pixel and 12k of them read as
            a white halo around the Sun. Suppressed alongside the additive dust
            in v3. */}
        {/* §9.5 sparse belts — the real main asteroid belt would be at most a
            few rocks per cubic AU. The AesReality read is a nearly-empty
            plane, not a shrapnel field. Cut the visible-rock density hard;
            keep the dust haze thinner but present so the belt still reads
            as SOMETHING when the tour scrubs past it. */}
        {showExtras && (
          /* Main belt — 5 spectral families with a radial weight profile:
             E/Hungaria at the inner edge → S-type (reddish silicate) →
             mixed S/M/C → C-type (dark carbonaceous) → D-type (dark red)
             at the outer edge. Kirkwood gaps at all four major resonances
             carve density notches. */
          <AsteroidBelt count={isMobile ? 1200 : 2600} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} size={0.18} thickness={BACKGROUND_BELTS.asteroid.thickness} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showExtras && !isMobile && (
          /* Kuiper belt — bimodal RR/BB colour split with cold-classical zone
             heavy on the rusty-red tholins. Resonance clumps overpopulate
             the 3:2 Plutinos at ~39.4 AU and 2:1 Twotinos at ~47.7 AU; the
             Kuiper Cliff drops density sharply near 48 AU. */
          <AsteroidBelt count={1800} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} size={0.55} thickness={BACKGROUND_BELTS.kuiper.thickness} families={KUIPER_FAMILIES} weights={kuiperWeightsFor} clumps={KUIPER_CLUMPS} cliff animate={!reducedMotion} />
        )}
        {/* Dust haze — tier 4 (mounts last + alone). Still substantial so the
            band reads as haze rather than empty space. */}
        {showDust && (
          <BeltDust count={isMobile ? 6000 : 14000} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} thickness={BACKGROUND_BELTS.asteroid.thickness} color={BACKGROUND_BELTS.asteroid.color} size={2.6} opacity={0.3} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showDust && !isMobile && (
          <BeltDust count={9000} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} thickness={BACKGROUND_BELTS.kuiper.thickness} color={BACKGROUND_BELTS.kuiper.color} size={2.3} opacity={0.26} cliff animate={!reducedMotion} />
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
            bubble out at the edge (where Voyager crossed). Oort points are
            additive sprites and the wide-overview camera sits INSIDE the shell,
            so they read as a bright hazy halo — suppressed in v3. */}
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
        {/* Man-made craft/probes (Voyager, robot fleet, Mars rovers, Golden
            Record, commit-comets) removed — this is an accurate NATURAL solar
            system only (per user). Résumé content lives in the side panels. */}
        {!isMobile && !reducedMotion && <MouseParallax offsetRef={parallaxOffsetRef} />}
        <CameraRig
          scrollT={scrollT}
          parallaxOffsetRef={parallaxOffsetRef}
          focusRef={focusRef}
          warpVelRef={warpVelRef}
          cameraRef={cameraRef}
          /* Reduced-motion + mobile → SNAP (no first-person fly-through; info
             stays visible). The rig reads these to gate the flight + flyingRef. */
          reducedMotion={reducedMotion}
          isMobile={isMobile}
          v3={v3}
          finale={finale}
          finaleT={finaleT}
          /* v3 desktop = cinematic split: each planet framed LARGE on the RIGHT so
             the left info column has room. (v2 kept it centred; compact/mobile stack.) */
          frameShift={v3 && !isMobile ? 0.42 : 0}
        />
      </Suspense>

      {/* Drives the finale's through-black dip from the scroll scrub. */}
      <FinaleGradeDip gradeRef={gradeRef} finaleT={finaleT} />

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
          ref={bloomRef}
          intensity={isMobile ? 0.8 : 1.05}
          luminanceThreshold={0.75}
          luminanceSmoothing={0.45}
          mipmapBlur
          /* §7 Phase 6: mipmapBlur is the single most expensive post-pass, and
             its cost scales with the render target size. Trim the radius on
             mobile (thermally + fillrate bound) — the smaller radius is barely
             noticeable at handheld sizes but drops the blur-chain cost meaningfully. */
          radius={isMobile ? 0.45 : 0.6}
        />
        {/* Grade: near-neutral — accurate colours (per user). Saturation ≈ 0 so
            planets/stars keep their true tints, contrast pulled right down so the
            frame no longer crushes to black, vignette lightened, brightness lifted
            a touch. The grade now mostly just tone-maps; the real colours show. */}
        <CinematicGrade
          ref={gradeRef}
          brightness={0.03}
          contrast={0.08}
          saturation={0.0}
          vigOffset={0.4}
          vigDarkness={0.28}
          vigBreathe={reducedMotion ? 0 : 0.03}
          grain={reducedMotion ? 0 : 0.02}
        />
      </EffectComposer>
      </SceneClock>
    </Canvas>
  );
};

export default Scene;
