import { useRef, useState, useCallback, useEffect } from "react";
import BootSequence from "./BootSequence";
import Scene from "./Scene";
import Navigator from "./Navigator";
import Minimap from "./Minimap";
import ContentPanel from "./ContentPanel";
import EasterEgg from "./EasterEgg";
import Cursor from "./Cursor";
import PlanetHUD from "./PlanetHUD";
import MissionCountdown from "./MissionCountdown";
import SideRail from "./SideRail";
import WarpOpening from "./WarpOpening";
import AmbientAudio from "./AmbientAudio";
import CockpitFrame from "./CockpitFrame";
import StardustTrail from "./StardustTrail";
import Breadcrumb from "./Breadcrumb";
import LiveStats from "./LiveStats";
import TimeScrubber from "./TimeScrubber";
import { easterEggs } from "../content";
import { DESTINATIONS, SCROLL_LENGTH_PER_DESTINATION } from "./config/destinations";

/* Hash → destination utilities */
const findDestinationIndexByHash = (hash) => {
  const id = hash?.replace(/^#\/?stellar\/?/, "").replace(/^#/, "");
  if (!id) return -1;
  return DESTINATIONS.findIndex((d) => d.id === id || d.section === id);
};

/*
 * Root component of the Stellar 3D portfolio.
 *
 * Layout layers (bottom → top):
 *   1. Three.js canvas (position: fixed inset)
 *   2. Navigator (invisible scroll sentinel, drives scroll progress)
 *   3. Minimap (top-right HUD)
 *   4. BootSequence (full-screen overlay, dismisses after scene mounts)
 *
 * Phase 5 adds the content overlay layer; for now we just have the scene
 * + navigation working.
 */

const StellarApp = () => {
  const scrollTRef = useRef(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [warpDone, setWarpDone] = useState(false);
  const [countdownDone, setCountdownDone] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [freeRoam, setFreeRoam] = useState(false);
  const [cockpit, setCockpit] = useState(false);
  const consoleLoggedRef = useRef(false);

  /* Esc to exit free-roam */
  useEffect(() => {
    if (!freeRoam) return;
    const onKey = (e) => { if (e.key === "Escape") setFreeRoam(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [freeRoam]);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleBootDone = useCallback(() => setBootDone(true), []);
  const handleWarpDone = useCallback(() => setWarpDone(true), []);
  const handleCountdownDone = useCallback(() => setCountdownDone(true), []);

  /* Console easter egg for devs who open DevTools — once per session */
  useEffect(() => {
    if (consoleLoggedRef.current) return;
    consoleLoggedRef.current = true;
    console.log("%c\n" + easterEggs.ascii + "\n", "color: #ffb86b; font-size: 10px; font-family: monospace;");
    console.log(`%c${easterEggs.greeting}`, "color: #00cea8; font-size: 16px; font-weight: bold;");
    console.log(`%c${easterEggs.repoLink}`, "color: #aaa6c3; font-size: 12px;");
    console.log("%c🛸  Try the Konami code. Click the sun. Drag to explore.", "color: #bf61ff; font-size: 12px;");
  }, []);

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx !== -1) {
      setActiveIdx(idx);
      /* Sync URL hash without re-scrolling */
      const next = `#/stellar/${dest.id}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
      /* Audio cue — AmbientAudio listens if enabled */
      window.dispatchEvent(new CustomEvent("stellar:whoosh"));
    }
  }, []);

  const handleJump = useCallback((idx) => {
    const totalScroll = (DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION) / 100;
    const targetY = (idx / (DESTINATIONS.length - 1)) * window.innerHeight * totalScroll;
    if (window.__lenis) {
      window.__lenis.scrollTo(targetY, { duration: 1.6 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  /* Read URL hash once boot is done, then jump there if matched */
  useEffect(() => {
    if (!bootDone) return;
    const idx = findDestinationIndexByHash(window.location.hash);
    if (idx > 0) {
      /* Small delay so the boot transition finishes before camera flies */
      const t = setTimeout(() => handleJump(idx), 350);
      return () => clearTimeout(t);
    }
  }, [bootDone, handleJump]);

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
      <Scene
        scrollT={scrollTRef}
        activeIdx={activeIdx}
        onJump={handleJump}
        onReady={handleSceneReady}
        freeRoamEnabled={freeRoam}
      />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
      />
      {bootDone && countdownDone && (
        <>
          <Cursor />
          <StardustTrail />
          <Minimap activeIdx={activeIdx} onJump={handleJump} />
          <SideRail activeIdx={activeIdx} onJump={handleJump} />
          <Breadcrumb activeIdx={activeIdx} />
          <LiveStats />
          <TimeScrubber />
          <PlanetHUD destination={DESTINATIONS[activeIdx]} />
          <ContentPanel destination={DESTINATIONS[activeIdx]} />
          <CockpitFrame enabled={cockpit} scrollTRef={scrollTRef} />
          <AmbientAudio />
          <EasterEgg />
          {/* Mode toggles bottom-right */}
          <div style={{ position: "fixed", bottom: 18, right: 66, display: "flex", gap: 8, zIndex: 50 }}>
            <button
              onClick={() => setCockpit((v) => !v)}
              aria-label={cockpit ? "Disable cockpit" : "Enable cockpit"}
              title={cockpit ? "Hide cockpit HUD" : "Show cockpit HUD"}
              style={{
                width: 38, height: 38, borderRadius: "50%", cursor: "pointer",
                background: cockpit ? "rgba(0, 206, 168, 0.18)" : "rgba(6, 9, 22, 0.7)",
                border: cockpit ? "1px solid rgba(0, 206, 168, 0.55)" : "1px solid rgba(255, 255, 255, 0.18)",
                color: cockpit ? "#00cea8" : "rgba(255, 255, 255, 0.6)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >⊕</button>
            <button
              onClick={() => setFreeRoam((v) => !v)}
              aria-label={freeRoam ? "Exit free roam" : "Enter free roam"}
              title={freeRoam ? "Exit free roam (WASD + arrows)" : "Free roam — WASD/arrows to fly"}
              style={{
                width: 38, height: 38, borderRadius: "50%", cursor: "pointer",
                background: freeRoam ? "rgba(255, 184, 107, 0.2)" : "rgba(6, 9, 22, 0.7)",
                border: freeRoam ? "1px solid rgba(255, 184, 107, 0.6)" : "1px solid rgba(255, 255, 255, 0.18)",
                color: freeRoam ? "#ffb86b" : "rgba(255, 255, 255, 0.6)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >⌖</button>
          </div>
        </>
      )}
      {bootDone && !warpDone && <WarpOpening onComplete={handleWarpDone} />}
      {bootDone && warpDone && !countdownDone && <MissionCountdown onComplete={handleCountdownDone} />}
      {!bootDone && (
        <BootSequence sceneReady={sceneReady} onComplete={handleBootDone} />
      )}
    </>
  );
};

export default StellarApp;
