/* eslint-disable react/no-unknown-property */
import { Suspense, useMemo, useRef, useState, useEffect, cloneElement } from "react";
import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import CinematicGrade from "./CinematicGrade";
import SceneClock from "./SceneClock";
import Stars from "./Stars";
import DeepStars from "./DeepStars";
import Constellations from "./Constellations";
import DistantGalaxies from "./DistantGalaxies";
import ZodiacalLight from "./ZodiacalLight";
import HeroDust from "./HeroDust";
import StarLabels from "./StarLabels";
import Sun from "./Sun";
import SunRays from "./SunRays";
import Planet from "./Planet";
import CameraRig from "./CameraRig";
import AsteroidBelt, { KUIPER_FAMILIES, kuiperWeightsFor } from "./AsteroidBelt";
import Nebulae from "./Nebulae";
import VisibilityController from "./VisibilityController";
import Skybox from "./Skybox";
import OrbitGroup from "./OrbitGroup";
import OrbitRings from "./OrbitRings";
import BeltRings from "./BeltRings";
import PlanetBeacons from "./PlanetBeacons";
// LaneObjects retired — the Holo-Bridge dossier cluster replaces the forced-←→ convoy.
import SolarEclipse from "./SolarEclipse";
import EclipseLights from "./EclipseLights";
import DwarfPlanets from "./DwarfPlanets";
import Comet from "./Comet";
import Hyperspace from "./Hyperspace";
import SpiralGalaxy from "./SpiralGalaxy";
import GalaxyGlobulars from "./GalaxyGlobulars";
import GalaxyNebulae from "./GalaxyNebulae";
import Supernovae from "./Supernovae";
import MeteorShowers from "./MeteorShowers";
import AtlasComet from "./AtlasComet";
import DustLanes from "./DustLanes";
import HomepageGalaxies from "./HomepageGalaxies";
import BlackHole from "./anomalies/BlackHole";
import Voyagers from "./Voyagers";
/* BlackHole + SpiralGalaxy removed from the tour — nearest black hole is
   1,560 ly away (Gaia BH1), nothing sits "just past Pluto". Milky Way seen
   from outside is impossible from Sol. Files kept for potential reuse
   (Sgr A* homepage marker, distant Andromeda). */
import BeltDust from "./BeltDust";
import LocalNeighborhood from "./LocalNeighborhood";
import TrojanAsteroids from "./TrojanAsteroids";
import OortCloud from "./OortCloud";
import Heliosphere from "./Heliosphere";
import LocalInterstellarCloud from "./LocalInterstellarCloud";
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
import { DESTINATIONS, BACKGROUND_BELTS, SKY_SCALE } from "../config/destinations";
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
/* Homepage Milky Way — tilted spinning spiral galaxy filling the frame,
   floating in a JWST-deep-field-style backdrop of stars + distant galaxies +
   nebulae. Rotation is a slow spin around the disc's normal so the arms
   sweep visibly without becoming a merry-go-round. */
const GALAXY_SCALE = 12;

/* Cosmic-zoom scratch — the dive scales the galaxy ABOUT the Sun's dust mote
   (SpiralGalaxy.SOL) so that mote stays screen-centered and grows while the rest
   of the disk streams outward past the edges. `outerPos = T − R·(S·SOL)` keeps SOL
   pinned to the screen-center target T at any zoom S (see docs/design/cosmic-zoom). */
const _fwd = new THREE.Vector3();
const _T = new THREE.Vector3();
const _sol = new THREE.Vector3();
const _tiltQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(1.16, 0, 0.34));
const _heroPos = new THREE.Vector3(40, 20, -560);
const Y_UP = new THREE.Vector3(0, 1, 0);
const ZOOM_DEPTH = 1600;   // how far ahead of the camera the mote sits (screen center)
const ZOOM_MAX = 20;       // final zoom factor into the mote (S = GALAXY_SCALE × (1 + …×ZOOM_MAX)) — gentle so the disk fills the frame through the plunge, not black
const s01 = (a, b, x) => THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(x, 0, 1), a, b);

function HomepageGalaxy({ reducedMotion, scrollT, active = true }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const t0 = useRef(null);
  const diveFrozenY = useRef(null); // spin angle frozen at dive start, so SOL is a stable pivot
  /* Snapshot of each galaxy material's base opacity, so the dive can fade the
     whole thing out smoothly (a real crossfade into the solar system) without
     the hyperspace warp to mask a hard cut. Dynamic-opacity children (supernova
     flashes, which start at 0) are excluded so they aren't pinned dark. */
  const baseOps = useRef(null);
  const fadeRef = useRef(1); // current dive-fade (1 → 0), fed to Supernovae so flashes dim too
  /* Cursor parallax — pointer position in −1..1, smoothed. The galaxy group
     shifts opposite the cursor while the far deep-field shell barely moves, so
     they slide against each other (differential parallax). */
  const ptr = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    if (reducedMotion) return undefined;
    const onMove = (e) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  useFrame((state, dt) => {
    if (!active) return;
    /* diveT: 0 at the hero, 1 at the Solar-System overview (the hero→about
       segment). This IS the cosmic zoom into the Sun's dust mote. */
    const pos = !reducedMotion && scrollT?.current ? THREE.MathUtils.clamp(scrollT.current * 12, 0, 1) : 0;
    const diving = pos > 0.002;

    /* Load-in: grow from a point to full size (easeOutCubic). */
    if (t0.current == null) t0.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - t0.current;
    const eased = 1 - Math.pow(1 - (reducedMotion ? 1 : Math.min(1, age / 2.6)), 3);

    /* Snapshot each material's base opacity once (for the seam cross-fade). */
    if (baseOps.current == null && innerRef.current) {
      baseOps.current = [];
      innerRef.current.traverse((o) => {
        const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
        for (const m of mats) if (m && m.transparent && m.opacity > 0.02) baseOps.current.push([m, m.opacity]);
      });
    }

    if (diving) {
      /* ===== COSMIC ZOOM into the mote ===== */
      /* Freeze the spin the instant the dive begins so SOL is a stable pivot. */
      if (diveFrozenY.current == null && innerRef.current) diveFrozenY.current = innerRef.current.rotation.y;
      /* Zoom S grows deep into the disc; the mote (and its immediate neighbourhood)
         balloon while everything toward the galactic centre streams outward past
         the edges — you fly INTO one dust particle. */
      const S = GALAXY_SCALE * (1 + Math.pow(s01(0, 1, pos), 1.4) * ZOOM_MAX);
      if (innerRef.current) {
        innerRef.current.scale.setScalar(S);
        innerRef.current.rotation.y = diveFrozenY.current;
      }
      if (outerRef.current) {
        outerRef.current.rotation.set(1.16, 0, 0.34); // freeze tilt
        /* Screen-center target T: a point on the camera's forward ray. */
        _fwd.set(0, 0, -1).applyQuaternion(state.camera.quaternion);
        _T.copy(state.camera.position).addScaledVector(_fwd, ZOOM_DEPTH);
        /* Where SOL lands at this scale (rotated by the frozen spin, then the tilt). */
        _sol.copy(SpiralGalaxy.SOL).applyAxisAngle(Y_UP, diveFrozenY.current).multiplyScalar(S).applyQuaternion(_tiltQuat);
        /* outerPos = T − that pins SOL exactly to screen-center T; ramp the
           centering in over the first bit so entry from the hero is smooth. */
        const c = s01(0, 0.28, pos);
        outerRef.current.position.set(
          THREE.MathUtils.lerp(_heroPos.x, _T.x - _sol.x, c),
          THREE.MathUtils.lerp(_heroPos.y, _T.y - _sol.y, c),
          THREE.MathUtils.lerp(_heroPos.z, _T.z - _sol.z, c),
        );
      }
      /* Galaxy stays fully rendered through the plunge; cross-fades out only at
         the SEAM (pos 0.8→1) as the solar system opens out of the mote. */
      const fade = 1 - s01(0.8, 1.0, pos);
      fadeRef.current = fade;
      if (baseOps.current) for (const [m, base] of baseOps.current) m.opacity = base * fade;
      if (outerRef.current) outerRef.current.visible = fade > 0.01;
    } else {
      /* ===== Hero idle — grow-in + breathing + cursor parallax ===== */
      diveFrozenY.current = null; // re-arm the pivot
      fadeRef.current = 1;
      if (baseOps.current) for (const [m, base] of baseOps.current) m.opacity = base;
      if (innerRef.current) {
        innerRef.current.scale.setScalar(0.5 + eased * (GALAXY_SCALE - 0.5));
        if (!reducedMotion) innerRef.current.rotation.y += dt * 0.07;
      }
      if (outerRef.current) {
        outerRef.current.visible = true;
        if (!reducedMotion) {
          const t = state.clock.elapsedTime;
          const p = ptr.current;
          p.sx += (p.x - p.sx) * 0.04;
          p.sy += (p.y - p.sy) * 0.04;
          outerRef.current.rotation.set(1.16, 0, 0.34 + Math.sin(t * 0.05) * 0.015 - p.sx * 0.02);
          outerRef.current.position.set(40 + Math.sin(t * 0.045) * 18 - p.sx * 55, 20 + Math.cos(t * 0.06) * 12 + p.sy * 40, -560);
        }
      }
    }
  });
  return (
    /* Outer group: steep Andromeda-style 3/4 tilt (~66°). Inner group spins +
       zooms and holds every galaxy-local layer so they share tilt/scale/spin:
       star cloud, arm gas, dust lanes, globular halo, supernova flashes. */
    <group ref={outerRef} position={[40, 20, -560]} rotation={[1.16, 0, 0.34]}>
      <group ref={innerRef} scale={0.5}>
        <SpiralGalaxy animate={false} solPulse />
        <GalaxyNebulae />
        <DustLanes />
        <GalaxyGlobulars />
        {/* active gates the per-frame flash cycle + its sound event so a hidden
            (off-homepage) galaxy never fires supernova swells during the tour. */}
        <Supernovae reducedMotion={reducedMotion} fade={fadeRef} active={active} />
      </group>
    </group>
  );
}

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

/* Delays the AU-scale solar-system reveal until the interstellar leg of the dive
   has (mostly) faded, so LY-scale local stars and AU-scale planets never share a
   frame — their unit scales are 63,241× apart and cannot coexist (config/
   scaleRegimes.js). diveT: 0 at the hero → 1 at the Solar-System overview; the
   whole tour + finale sit at diveT ≥ 1. Ref-driven so it never re-renders. */
function DiveGate({ scrollT, finale, groupRef, reducedMotion, activeIdx }) {
  const flyingRef = useRef(false);
  useFrame(() => {
    /* Reduced motion: no interstellar fly-through (InterstellarDive is unmounted),
       so reveal the solar system on the plain activeIdx snap — no diveT delay, no
       flight-hide — matching the project's snap-tour policy. */
    if (reducedMotion) {
      if (groupRef.current) groupRef.current.visible = finale || activeIdx >= 1;
      return;
    }
    const diveT = THREE.MathUtils.clamp((scrollT?.current ?? 0) * 12, 0, 1);
    if (groupRef.current) groupRef.current.visible = finale || diveT > 0.88;
    /* Fade the hero/landing surface out during the interstellar leg — reuse the
       flight-hide channel (panelHidden) so "Rugwed Patharkar / Begin the tour"
       dissolves as we plunge off the home page, then the arrival content takes
       over at the overview. Edge-dispatched (only on state change), never every
       frame. During the dive no camera-jump fires, so this owns the flag. */
    const flying = !finale && diveT > 0.14 && diveT < 0.9;
    if (flying !== flyingRef.current) {
      flyingRef.current = flying;
      window.dispatchEvent(new CustomEvent("stellar:flight", { detail: { flying } }));
    }
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
  /* Milky Way homepage (destination index 0): the Solar System is hidden —
     visitor is floating in interstellar space, seeing only sky (Stars,
     MilkyWay band, Nebulae, Constellations, DistantGalaxies, Skybox). Sun,
     planets, belts, dwarf planets, comets — all off. Hyperspace jump on
     scroll carries them into the tour. */
  const isMilkyway = activeIdx === 0;
  /* Tour layers PRE-MOUNT during the homepage (kept hidden by the
     <group visible={tourVisible}> wrappers below) so the Milky-Way → Solar-
     System crossover never builds the whole system in one React commit — that
     one-commit build froze the main thread 1–7s (measured). The extrasPhase
     tiers still spread the build over ~1.7s, now during the intro window where
     it's masked, instead of at the scroll midpoint. */
  const showExtras = extrasPhase >= 1 && !finale;
  const showMid = extrasPhase >= 2 && !finale;
  const showEggs = extrasPhase >= 3 && !finale;
  /* Tier 4 — the heaviest point build (belt dust ~68k points) mounts LAST and
     ALONE, so it never shares a React commit / GPU upload with the deep-field or
     anomalies (that collision was the boot black-frame). */
  const showDust = extrasPhase >= 4 && !finale;
  /* Solar-system layers are built always (staged) but only VISIBLE once we've
     left the Milky-Way homepage. Flipping a group's `visible` is free — no
     mount/unmount hitch — so the crossover is instant. */
  const tourVisible = !isMilkyway;
  /* The AU-scale solar-system group is ref-gated (DiveGate) rather than
     activeIdx-gated, so its reveal can be held back through the interstellar leg
     of the dive — otherwise LY-scale local stars and AU-scale planets would
     briefly co-render (impossible scales). */
  const tourBodiesRef = useRef(null);
  /* Auto-adaptive quality: AdaptiveQuality flips this to true only when frames
     genuinely dip (<~43fps sustained) on a struggling GPU. Capable machines keep
     everything; strugglers shed the heaviest, least-perceptible layers (the faint
     big-particle drift dust, the procedural deep star haze) to hold smoothness.
     Toggles rarely (wide dead-zone), so the one-time remount when it flips is
     masked by the fact that the machine was already dropping frames. */
  const [perfLow, setPerfLow] = useState(false);
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

  /* DPR cap for the STILL frame — kept near-crisp (1.75) since a settled planet
     is what you actually study. The real smoothness win is the adaptive guard
     dropping DPR to 1.0 while the camera MOVES (the eye can't resolve fine pixels
     mid-motion), which is exactly when the journey needs the frame budget. On a
     retina display DPR is a quadratic fragment multiplier, so 2→1.75 already buys
     headroom at negligible visible cost. */
  const dprCap = isMobile ? 1.3 : 1.75;

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
      camera={{ position: [0, 2.5, 11], fov: 52, near: 0.1, far: 14000 * SKY_SCALE }}
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
        /* While the camera is moving the eye can't resolve fine pixels anyway, so
           render at 1× during scroll — maximises the frame budget exactly when
           the journey needs it, then restores to dprCap on settle. */
        lowDpr={1.0}
        onPerf={(tier) => setPerfLow(tier === "low")}
      />
      <AutoExposure />
      {/* Full GPU prewarm of the pre-mounted (hidden) tour during the intro:
          drei <Preload all/> un-hides every subtree, gl.compile()s shaders +
          textures, AND cube-camera-renders once to force geometry VBO uploads
          (which gl.compile alone does NOT do — that was a ~3s freeze on the
          first Milky-Way→Solar-System reveal). Runs once at extrasPhase 4,
          while still on the homepage, so the cost lands in the masked intro. */}
      {extrasPhase >= 4 && !finale && <Preload all />}
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
        <SafeLoad><Skybox homepage={isMilkyway} /></SafeLoad>
        {/* On the homepage the sky goes JWST-sparse — only the brightest stars,
            larger, with diffraction spikes, against near-black. During the tour
            the full 8,920-star field renders. */}
        {/* Two star fields, both built ONCE at mount and toggled by `visible`
            (PrewarmTour GPU-compiles the hidden one during the intro). Flipping
            visibility at the 0→1 crossover is free — the old single
            `sparse={isMilkyway}` rebuilt the whole 8,920-star buffer + re-uploaded
            it synchronously, which was a major transition frame dip. */}
        {!finale && <Stars sparse visible={isMilkyway} />}
        {!finale && <Stars visible={!isMilkyway} />}
        {/* Dense procedural twinkling star haze — thousands of faint field stars
            on the same celestial shell as the real catalogue, each twinkling on
            its own phase. Layers on top so BOTH the homepage sky and the tour read
            as extremely dense + alive. Sky-fixed (radius 6600), so unlike the
            foreground dust it never rides the cursor. */}
        {!finale && !perfLow && <DeepStars count={isMobile ? 6000 : 16000} reducedMotion={reducedMotion} />}
        {/* Nebulae live INSIDE the Milky Way — they belong to the solar-system
            tour backdrop, not the from-outside homepage. Hidden on the
            homepage (where the deep-field galaxies are the backdrop instead). */}
        {/* Tour sky layers — pre-mounted, hidden on the homepage via the group's
            `visible`. Own Suspense boundary so a tour texture loading (behind the
            scenes, during the intro) never suspends the homepage galaxy above. */}
        <Suspense fallback={null}>
        <group visible={tourVisible}>
          {!finale && <SafeLoad><Nebulae /></SafeLoad>}
          {/* Constellation line overlays — 12 named patterns drawn as hairline
              gold connectors. */}
          {!finale && <Constellations />}
          {/* Distant galaxies — ONLY the 4 named naked-eye ones on the tour.
              The JWST deep-field scatter is homepage-only now: on the solar-system
              view its ~640 soft coreless discs read as distracting floating white
              smudges over the planets (user complaint), so it's dropped here. */}
          {!finale && <DistantGalaxies />}
          {/* Zodiacal light — faint warm band along the ecliptic. */}
          {showExtras && <ZodiacalLight />}
          {/* HeroDust moved OFF the tour — its camera-riding motes read as "white
              specks that move with the cursor" on the solar-system view (user asked
              to remove those). It now lives on the Milky-Way homepage only. */}
          {/* Hover labels on the 16 brightest named stars — desktop-only. */}
          {showEggs && !isMobile && !reducedMotion && <StarLabels />}
          {/* Milky Way band — the from-INSIDE arch. */}
          {!finale && <MilkyWay finale={false} />}
        </group>
        </Suspense>
        {/* Hyperspace transition — cinematic radial star-streaks that fire
            during the scroll segment from Milky Way (index 0) to Solar
            System overview (index 1). Reads warpVelRef; invisible when
            velocity is 0 (i.e. everywhere except that one transition). */}
        {!reducedMotion && !isMobile && <Hyperspace warpVelRef={warpVelRef} />}
        {/* Sagittarius A* marker retired from the homepage — it's a
            from-inside sky marker (galactic-centre direction), meaningless
            against the from-outside galaxy view. The galaxy's own bright
            core bulge now carries the centre. */}
        {/* Homepage Milky Way — the visitor's first frame. A tilted spinning
            spiral galaxy dominates the middle of the screen with a JWST-style
            deep-field sky around it (real HYG stars + M31/M33/LMC/SMC sprites
            + nebulae + constellations, all still mounted). Scientific-purism
            note: from Sol we can't SEE our own galaxy face-on — this is the
            crowd-pleasing "you are looking at our home" reveal. */}
        {/* Mounted unconditionally (hidden via the group) so leaving the homepage
            never disposes the ~100k-point galaxy — that disposal was a 0→1
            transition frame dip. `active` idles its per-frame work while hidden. */}
        <group visible={isMilkyway}>
          <HomepageGalaxy reducedMotion={reducedMotion} scrollT={scrollT} active={isMilkyway} />
        </group>
        {/* The cosmic zoom into the Sun's dust mote lives in HomepageGalaxy (it
            scales the galaxy about the SOL pivot). The old InterstellarDive
            local-star stage is removed — the viewer wants the mote to zoom
            straight into the solar system, no in-between stop. */}
        {/* Holds the AU-scale solar system hidden until the mote fills the frame,
            then reveals it at the seam (the galaxy cross-fades out there). */}
        <DiveGate scrollT={scrollT} finale={finale} groupRef={tourBodiesRef} reducedMotion={reducedMotion} activeIdx={activeIdx} />
        {/* Ambient sky layers (sky-fixed, NOT inside any body transform):
            meteor streaks EVERYWHERE (homepage + tour) + interstellar comets.
            Desktop + motion only. Foreground dust is intentionally NOT here — it
            read as distracting floating white specks over the galaxy. */}
        {!isMobile && !reducedMotion && !finale && <MeteorShowers animate />}
        {/* Homepage — interstellar comets crossing the deep field. More of them,
            respawning faster, so a comet is almost always streaking somewhere. */}
        {isMilkyway && !isMobile && !reducedMotion && (
          <>
            <AtlasComet start={[-620, 180, -300]} vel={[150, -8, 60]} coma="#bfe0ff" ion="#cfe6ff" dust="#e8e0ff" respawn={560} />
            <AtlasComet start={[760, -240, -180]} vel={[-150, 18, 60]} coma="#e2dcff" ion="#dce6ff" dust="#fff0e0" respawn={680} />
            <AtlasComet start={[-380, -420, 260]} vel={[110, 70, -40]} coma="#cfe0ff" ion="#d6ecff" dust="#f0ead8" respawn={820} />
          </>
        )}
        {/* Tour — extra comets sweeping the outer system (alongside Halley),
            faster respawn so the tour sky stays alive. */}
        {!isMilkyway && !isMobile && !reducedMotion && !finale && (
          <>
            <AtlasComet start={[1500, 320, 980]} vel={[-270, -34, -170]} coma="#bfe0ff" ion="#cfe6ff" dust="#e8e0ff" respawn={720} />
            <AtlasComet start={[-1400, -260, 1100]} vel={[250, 40, -190]} coma="#e2dcff" ion="#dce6ff" dust="#fff0e0" respawn={900} />
          </>
        )}
        {/* Distant galaxies pinned to the frame's empty regions (left column +
            lower band) — Andromeda + 7 smaller ones, never behind the Milky
            Way. Screen-space anchored so they hold their gaps. */}
        {isMilkyway && <HomepageGalaxies reducedMotion={reducedMotion} />}
        {/* ── Solar-system tour body ── pre-mounted (staged by extrasPhase),
            hidden on the homepage by the group's `visible`. Everything the
            crossover used to build in one frozen commit lives here. Own Suspense
            so tour textures loading during the intro never blank the homepage. */}
        <Suspense fallback={null}>
        <group ref={tourBodiesRef} visible={false}>
        {/* Voyager 1 + 2 markers — humans' only interstellar spacecraft. */}
        {!finale && showExtras && <Voyagers />}
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


        {!finale && showExtras && DESTINATIONS.map((d, idx) => {
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
                {d.id === "hobbies" && <SaturnHexagon radius={d.radius} axialTilt={d.axialTilt || 0} animate={!reducedMotion} />}
                {d.id === "education" && <IoTorus radius={d.radius} axialTilt={d.axialTilt || 0} animate={!reducedMotion} />}
                {d.id === "whatsetsmeapart" && <NeptuneAurora radius={d.radius} axialTilt={d.axialTilt || 0} animate={!reducedMotion} />}
                {/* Enceladus (Saturn) + Europa (Jupiter): south-pole water geysers from a
                    subsurface ocean — rides the parent's orbit at the moon's offset. */}
                {d.id === "hobbies" && <MoonGeysers offset={[-4.3, 1.1, 1.7]} radius={0.12} color="#eef3f1" plumeColor="#bfe6ff" jets={6} dir={[0, -1, 0.3]} animate={!reducedMotion} />}
                {d.id === "education" && <MoonGeysers offset={[5.2, 1.0, 1.2]} radius={0.16} color="#dde6e3" plumeColor="#cfeaff" jets={4} dir={[0.4, -1, 0]} animate={!reducedMotion} />}
                {/* Wave 2 — Mimas (Saturn's Death-Star moon) + Triton's nitrogen geysers (Neptune). */}
                {d.id === "hobbies" && <MimasMoon offset={[4.6, 1.0, -2.1]} radius={0.13} animate={!reducedMotion} />}
                {d.id === "hobbies" && <TitanLakes offset={[4.4, 1.2, 0.9]} radius={0.18} animate={!reducedMotion} />}
                {d.id === "whatsetsmeapart" && <MoonGeysers offset={[2.0, 0.8, 0.6]} radius={0.12} color="#d8cabd" plumeColor="#e6c6d6" jets={4} dir={[0.2, -1, 0.2]} animate={!reducedMotion} />}
                {/* Mangalyaan (Mars Orbiter Mission) removed — man-made, per user. */}
              </OrbitGroup>
            );
          }
          if (d.kind === "cosmic") {
            /* v3 finale — cinematic "black hole in a nebular envelope with
               polar jets" for the closing Contact stop. Not scientifically
               placed (nearest BH is 1,560 ly), but the emotionally correct
               closer for the tour. At radius 80 the accretion disk + jets
               reach far enough that at Pluto's frame (only ~120u from The
               Edge's position) the black hole leaks into the upper sky.
               Gate to activeIdx === 13 exact — ONLY visible at The Edge
               itself, invisible at every other stop including Pluto. */
            const p = d.position;
            if (d.render === "blackhole" && activeIdx === 13)
              return <BlackHole key={d.id} position={p} radius={d.radius} nebula jets animate={!reducedMotion} onPointerOver={handleHoverIn} onPointerOut={handleHoverOut} />;
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
        {showExtras && <OrbitRings show={v3 && activeIdx === 1} />}
        {/* Overview-only belt band rings — make the asteroid + Kuiper belts
            read as belts from ~2200u out where the actual rock particles
            are sub-pixel. Invisible at any tour stop. */}
        {showExtras && v3 && activeIdx === 1 && <BeltRings />}
        {/* Overview-only planet beacons — each planet's real texture at a constant
            26px on-screen size at its orbital position. Essential at TRUE scale,
            where the real planets are sub-pixel dots on 128,000u orbits: the
            beacons make them findable little discs strung along the orrery rings. */}
        {showExtras && v3 && activeIdx === 1 && <PlanetBeacons />}
        {/* Dwarf planets + named belt bodies (Vesta, Eris, Makemake, Haumea). */}
        {showExtras && <DwarfPlanets animate={!reducedMotion} />}
        {/* Halley's Comet on its real 76-year elliptical orbit — a live
            moving body that visibly streaks through the overview + tour.
            Never mounts under reduced motion or in the finale. */}
        {showExtras && !reducedMotion && <Comet />}
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
          /* Main belt — seven families (E/S/M/C/D + ice + heavy-metal), radial
             weight profile shifting toward C-type outward, heavy metal
             concentration in the middle 2.4-2.8 AU zone, ice tail across the
             outer half. Kirkwood gaps at all four major Jupiter resonances
             (3:1, 5:2, 7:3, 2:1) carve density notches. Count bumped hard so
             the belt reads DENSE at every zoom. */
          <AsteroidBelt count={isMobile ? 7000 : 16000} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} size={0.18} thickness={BACKGROUND_BELTS.asteroid.thickness} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showExtras && !isMobile && (
          /* Kuiper belt — six families (BB / RR / intermediate / water-ice /
             methane-ice / metal fragments). Bimodal RR/BB colour split
             preserved with cold-classical zone heavy on the rusty-red
             tholins, bright methane-ice tail on the outer edge (Eris /
             Makemake style), metallic fragments dust the whole belt.
             Resonance clumps overpopulate the 3:2 Plutinos at ~39.4 AU and
             2:1 Twotinos at ~47.7 AU; the Kuiper Cliff drops density sharply
             near 48 AU. Count bumped for density. */
          <AsteroidBelt count={11000} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} size={0.55} thickness={BACKGROUND_BELTS.kuiper.thickness} families={KUIPER_FAMILIES} weights={kuiperWeightsFor} clumps={KUIPER_CLUMPS} cliff animate={!reducedMotion} />
        )}
        {/* Dust haze — tier 4 (mounts last + alone). Still substantial so the
            band reads as haze rather than empty space. */}
        {showDust && (
          <BeltDust count={isMobile ? 8000 : 18000} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} thickness={BACKGROUND_BELTS.asteroid.thickness} color={BACKGROUND_BELTS.asteroid.color} size={2.6} opacity={0.15} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showDust && !isMobile && (
          <BeltDust count={12000} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} thickness={BACKGROUND_BELTS.kuiper.thickness} color={BACKGROUND_BELTS.kuiper.color} size={2.3} opacity={0.14} cliff animate={!reducedMotion} />
        )}
        {/* Tenuous gas/dust clouds — tier 3 (big, faint, soft; distance-faded by
            the same shader so they never bloom into a bar). Desktop only. */}
        {showEggs && !isMobile && !perfLow && (
          <BeltDust count={3200} innerRadius={BACKGROUND_BELTS.asteroid.inner} outerRadius={BACKGROUND_BELTS.asteroid.outer} thickness={BACKGROUND_BELTS.asteroid.thickness * 1.4} color="#8a7a64" size={16} opacity={0.04} drift={0.008} gaps={KIRKWOOD_GAPS} animate={!reducedMotion} />
        )}
        {showEggs && !isMobile && !perfLow && (
          <BeltDust count={2600} innerRadius={BACKGROUND_BELTS.kuiper.inner} outerRadius={BACKGROUND_BELTS.kuiper.outer} thickness={BACKGROUND_BELTS.kuiper.thickness * 1.3} color="#6a7e9e" size={20} opacity={0.04} drift={0.006} cliff animate={!reducedMotion} />
        )}
        {/* Jupiter's Trojan asteroids — two swarms 60° ahead/behind Jupiter at
            the L4/L5 Lagrange points (true orbital radius). */}
        {showExtras && <TrojanAsteroids count={isMobile ? 200 : 500} />}
        {/* The Oort cloud wrapping the whole system + the heliosphere boundary
            bubble out at the edge (where Voyager crossed). Oort points are
            additive sprites and the wide-overview camera sits INSIDE the shell,
            so they read as a bright hazy halo — suppressed in v3. */}
        {showExtras && <OortCloud count={isMobile ? 1600 : 4200} />}
        {showExtras && !isMobile && <Heliosphere />}
        {showExtras && !isMobile && activeIdx >= 10 && <LocalInterstellarCloud />}
        {/* Real solar eclipses — Earth's actual Moon + any planet you fly
            behind occlude the Sun (corona + chromosphere + diamond-ring). */}
        {showExtras && <SolarEclipse satelliteRef={moonWorldRef} eclipseRef={eclipseRef} reducedMotion={reducedMotion} active={!isMilkyway} />}
        {/* Fade the scene lights toward dark at totality (planet → silhouette). */}
        {showExtras && <EclipseLights eclipseRef={eclipseRef} />}
        </group>
        </Suspense>
        {/* Foreground parallax dust — HOMEPAGE only. These motes ride the
            mouse-parallax camera, so on the SOLAR-SYSTEM view they read as "white
            specks that move with the cursor" (the user asked to remove those). On
            the Milky-Way homepage the same gentle drift is welcome depth over the
            deep field, so the two foreground layers live here now. */}
        {isMilkyway && !isMobile && !reducedMotion && <DustParticles />}
        {isMilkyway && !isMobile && !reducedMotion && <HeroDust />}
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
