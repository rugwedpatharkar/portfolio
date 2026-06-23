import { useRef, useState, useCallback, useEffect } from "react";
import Scene from "./Scene";
import Navigator from "./Navigator";
import ContentPanel from "./ContentPanel";
import Cursor from "./Cursor";
import PlanetHUD from "./PlanetHUD";
import MissionCountdown from "./MissionCountdown";
import WarpField from "./WarpField";
import AmbientAudio from "./AmbientAudio";
import { easterEggs } from "../content";
import { DESTINATIONS } from "./config/destinations";

/* Hash → destination utilities */
const findDestinationIndexByHash = (hash) => {
  const id = hash?.replace(/^#\/?stellar\/?/, "").replace(/^#/, "");
  if (!id) return -1;
  return DESTINATIONS.findIndex((d) => d.id === id || d.section === id);
};

/*
 * Root component of the Stellar 3D portfolio.
 *
 * Visitor flow:
 *   0. MissionCountdown (T-5 → GO) — FIRST, building anticipation.
 *   1. Launch warp — a hyperspeed fly-in from the edge of the system into
 *      Sol (WarpField streaks + the camera flying in).
 *   2. Main UI reveals — the scene mounts + loads textures behind the
 *      overlays the whole time, so it's ready when the warp ends.
 */

const StellarApp = () => {
  const scrollTRef = useRef(0);
  const [countdownDone, setCountdownDone] = useState(false);
  /* Cinematic launch after the countdown: warp (hyperspeed fly-in to Sol)
     → done (hand over to the tour). */
  const [launchPhase, setLaunchPhase] = useState(null);
  const [shipWarpDone, setShipWarpDone] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  /* Hyperspeed warp intensity (0..1): scroll velocity during the tour + a
     kick on far nav-jumps. Read by WarpField, written by Navigator. */
  const warpVelRef = useRef(0);
  /* Wide pull-back ref kept permanently off — there's no toggle in the
     minimal UI, but CameraRig still reads it, so this keeps its wide branch
     a harmless no-op without touching the rig. */
  const wideRef = useRef(false);
  const consoleLoggedRef = useRef(false);

  /* Scene mounts/loads textures behind the warp + countdown overlays,
     so we no longer need an explicit sceneReady gate. */
  const handleSceneReady = useCallback(() => {}, []);
  /* Finish the countdown and START the warp in the SAME update, so there's no
     frame where the cover is gone but the warp hasn't begun (which would flash
     the Sol close-up). Reduced-motion drops straight into the tour. */
  const handleCountdownDone = useCallback(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCountdownDone(true);
    if (reduced) setShipWarpDone(true);
    else setLaunchPhase("warp");
  }, []);

  /* Console easter egg for devs who open DevTools — once per session */
  useEffect(() => {
    if (consoleLoggedRef.current) return;
    consoleLoggedRef.current = true;
    console.log("%c\n" + easterEggs.ascii + "\n", "color: #ffb86b; font-size: 10px; font-family: monospace;");
    console.log(`%c${easterEggs.greeting}`, "color: #00cea8; font-size: 16px; font-weight: bold;");
    console.log(`%c${easterEggs.repoLink}`, "color: #aaa6c3; font-size: 12px;");
    console.log("%c🛸  Try the Konami code. Click the sun. Drag to explore.", "color: #bf61ff; font-size: 12px;");
  }, []);

  /* End the warp after WARP_DUR (2.2s) and hand over to the tour. The warp
     itself is started in handleCountdownDone (same update as countdownDone)
     so the scene never flashes before it begins. */
  useEffect(() => {
    if (launchPhase !== "warp") return undefined;
    const t = setTimeout(() => {
      setLaunchPhase(null);
      setShipWarpDone(true);
    }, 2200);
    return () => clearTimeout(t);
  }, [launchPhase]);

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx !== -1) {
      setActiveIdx(idx);
      activeIdxRef.current = idx;
      /* Sync URL hash without re-scrolling */
      const next = `#/stellar/${dest.id}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
      /* Audio cue — AmbientAudio listens if enabled */
      window.dispatchEvent(new CustomEvent("stellar:whoosh"));
      /* Visitor-log + achievements listen */
      window.dispatchEvent(new CustomEvent("stellar:destination", { detail: { id: dest.id, idx } }));
    }
  }, []);

  const handleJump = useCallback((idx) => {
    /* Far nav-jumps (>2 stops away) fly through many bodies fast — kick the
       hyperspeed warp field so the jump immediately reads as a warp (the
       continuous camera + scroll velocity carry the rest). */
    if (Math.abs(idx - activeIdxRef.current) > 2) {
      warpVelRef.current = 1;
    }
    /* Map destination index → exact scroll position. Progress runs 0..1
       over (scrollHeight − viewport), so targetY = frac × that range. The
       old formula scaled by the viewport-count (12) instead of the real
       scroll range and overshot by ~1 destination — the cause of jumps /
       hash nav landing one planet past the target. */
    const max =
      (document.scrollingElement || document.documentElement).scrollHeight -
      window.innerHeight;
    const targetY = (idx / (DESTINATIONS.length - 1)) * max;
    if (window.__lenis) {
      /* Jump duration 1.6 → 1.0s — feels like a punchier hyperjump */
      window.__lenis.scrollTo(targetY, { duration: 1.0 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
    /* Camera shake on jump for tactile arrival */
    window.dispatchEvent(new CustomEvent("stellar:shake", { detail: { amp: 0.12, duration: 0.3 } }));
  }, []);

  /* Read URL hash once the countdown finishes (full intro complete),
     then jump there if it points to a non-Sol destination. */
  useEffect(() => {
    if (!shipWarpDone) return;
    const idx = findDestinationIndexByHash(window.location.hash);
    if (idx > 0) {
      const t = setTimeout(() => handleJump(idx), 350);
      return () => clearTimeout(t);
    }
  }, [shipWarpDone, handleJump]);

  /* Browser back/forward should also navigate */
  useEffect(() => {
    const onHash = () => {
      const idx = findDestinationIndexByHash(window.location.hash);
      if (idx !== -1) handleJump(idx);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [handleJump]);

  return (
    <>
      {/* Hide the page scrollbar — scroll still drives the camera, but the
          bar is visual clutter. (Scoped to while the stellar app is mounted.) */}
      <style>{`
        html { scrollbar-width: none !important; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
      `}</style>
      <Scene
        scrollT={scrollTRef}
        activeIdx={activeIdx}
        onJump={handleJump}
        onReady={handleSceneReady}
        freeRoamEnabled={false}
        wideRef={wideRef}
        showExtras={countdownDone}
        launchPhase={launchPhase}
      />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
        velocityRef={warpVelRef}
      />
      {/* Hyperspeed streaks — driven by travel speed (scroll velocity +
          launch warp). Sits under the content overlay. */}
      <WarpField velocityRef={warpVelRef} launchPhase={launchPhase} />
      {shipWarpDone && (
        <>
          {/* Minimal UI — only the solar system, its data, and my info.
              Ambient sound is on by default (no toggle; resumes on the first
              user gesture, per browser autoplay policy). */}
          <Cursor />
          <PlanetHUD destination={DESTINATIONS[activeIdx]} />
          <ContentPanel destination={DESTINATIONS[activeIdx]} />
          <AmbientAudio />
        </>
      )}
      {/* Countdown plays FIRST on mount; the warp fly-in (WarpField streaks
          + CameraRig) follows. Scene textures stream in behind both. */}
      {!countdownDone && <MissionCountdown onComplete={handleCountdownDone} />}
    </>
  );
};

export default StellarApp;
