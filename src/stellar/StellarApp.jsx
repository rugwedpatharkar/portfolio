/* eslint-disable react/prop-types */
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import Scene from "./Scene";
import Navigator from "./Navigator";
import ContentPanel from "./ContentPanel";
import Cursor from "./Cursor";
import PlanetHUD from "./PlanetHUD";
import MissionCountdown from "./MissionCountdown";
import WarpField from "./WarpField";
import AmbientAudio from "./AmbientAudio";
import { ProgressRail, ScrollHint } from "./Wayfinding";
import OverviewMap from "./OverviewMap";
import StellarUIContext from "./ui/StellarUIContext";
import { OBJECTS } from "./config/objects";
import { easterEggs } from "../content";
import { DESTINATIONS } from "./config/destinations";
import Achievements from "./Achievements";
import RankMeter from "./RankMeter";
import DiscoveriesView from "./DiscoveriesView";
import EasterEgg from "./EasterEgg";
import AnswerListener from "./AnswerListener";
import useViewport from "./useViewport";
import CommandPalette from "./ui/CommandPalette";
import NavConsole from "./NavConsole";
import VoiceNav from "./VoiceNav";
import SpeedRun from "./SpeedRun";
import CockpitFrame from "./CockpitFrame";
import { markCharted, markVisited } from "./data/explorer";
import { buildCommands } from "./config/commands";

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

/* The only persistent on-screen control in the minimal UI: a subtle pill that
   toggles the system overview (and teaches the Z shortcut / supports click +
   touch). When overview is active it also shows a centred return hint. */
/* System-overview header text. The MAP toggle now lives in the Nav Console. */
const OverviewHud = ({ overview }) =>
  overview ? (
    <div style={{ position: "fixed", top: "7.5vh", left: 0, right: 0, zIndex: 50, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
      <div style={{ fontFamily: "'Michroma', sans-serif", fontSize: 17, letterSpacing: "0.16em", color: "white", textTransform: "uppercase", textShadow: "0 2px 20px rgba(0,0,0,0.85)" }}>System Overview</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}>press Z or Esc to return</div>
    </div>
  ) : null;

/* Shown while visiting an object from the map (the free fly-to) — its detailed
   info + a way back to the map. */
const FocusCard = ({ obj, onBack }) => (
  <div
    style={{
      position: "fixed",
      bottom: 64,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 50,
      width: "min(440px, 86vw)",
      background: "rgba(8,11,24,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: `1px solid ${obj.color || "#cfd6ff"}55`,
      borderRadius: 12,
      padding: "14px 18px",
      boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
      textAlign: "left",
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontFamily: "'Michroma', sans-serif", fontSize: 15, color: "white", textTransform: "uppercase", letterSpacing: "0.04em" }}>{obj.label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: obj.color || "#cfd6ff", textTransform: "uppercase", letterSpacing: "0.08em" }}>{obj.category}</span>
    </div>
    <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, margin: "8px 0 12px" }}>{obj.info}</div>
    <button
      onClick={onBack}
      style={{ all: "unset", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "7px 14px" }}
    >
      ← Back to map · Esc
    </button>
  </div>
);

const StellarApp = () => {
  const scrollTRef = useRef(0);
  const [countdownDone, setCountdownDone] = useState(false);
  /* Cinematic launch after the countdown: warp (hyperspeed fly-in to Sol)
     → done (hand over to the tour). */
  const [launchPhase, setLaunchPhase] = useState(null);
  const [shipWarpDone, setShipWarpDone] = useState(false);
  /* Interaction mode — the single source of truth for the camera/interaction
     state (tour | overview | pilot | warping). `overview` (the wide pull-back
     the Z key toggles) is derived so the render conditionals + the wideRef
     CameraRig reads stay unchanged. */
  const [mode, setMode] = useState("tour");
  const overview = mode === "overview";
  /* First-interaction flag — fades the hero "scroll to explore" hint once the
     visitor scrolls / keys / touches (or after a timeout). */
  const [interacted, setInteracted] = useState(false);
  /* Object currently being visited from the overview map (the free fly-to). */
  const [focusedObj, setFocusedObj] = useState(null);
  /* Explorer Log (Discoveries) panel open state. */
  const [logOpen, setLogOpen] = useState(false);
  /* Command palette + cockpit controls. */
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [voiceNonce, setVoiceNonce] = useState(0);
  const [speedRunOn, setSpeedRunOn] = useState(false);
  const { reducedMotion, isMobile } = useViewport();

  /* Time control writes the shared virtual-clock scale (read by the scene) and
     mirrors it in state so the Nav Console can highlight the active pill. */
  const handleTimeScale = useCallback((s) => {
    setTimeScale(s);
    if (sceneClockRef.current) sceneClockRef.current.scale = s;
  }, []);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  /* Hyperspeed warp intensity (0..1): scroll velocity during the tour + a
     kick on far nav-jumps. Read by WarpField, written by Navigator. */
  const warpVelRef = useRef(0);
  /* Wide pull-back ref kept permanently off — there's no toggle in the
     minimal UI, but CameraRig still reads it, so this keeps its wide branch
     a harmless no-op without touching the rig. */
  const wideRef = useRef(false);
  /* Free-camera focus target {position, lookAt, fov} for click-to-visit, and a
     live-camera handle the overview map projects object positions through. */
  const focusRef = useRef(null);
  const cameraRef = useRef(null);
  /* Pilot free-flight: live speed (CockpitFrame gauge) + on-screen thruster
     input written by the Nav Console pad, both read by the FreeRoam rig. */
  const pilotSpeedRef = useRef(0);
  const thrustRef = useRef({});
  /* Shared virtual-clock handle { t, scale, danger }, created once and shared
     by identity across the canvas boundary: the scene writes `t` (scaled
     orbital world-time) + `danger` (black-hole proximity); the DOM time
     control writes `scale` (pause / ×0.5 / ×1 / ×2). */
  const sceneClockRef = useRef(null);
  if (!sceneClockRef.current) sceneClockRef.current = { t: 0, scale: 1, danger: 0 };
  const consoleLoggedRef = useRef(false);

  /* Toggle free-flight (pilot) — desktop only; reduced-motion stays docked. */
  const togglePilot = useCallback(() => {
    if (isMobile || reducedMotion) return;
    setMode((m) => (m === "pilot" ? "tour" : "pilot"));
  }, [isMobile, reducedMotion]);

  /* Pilot freezes the scroll tour (so scroll can't fight the flight) and clears
     any stale on-screen thruster input. */
  useEffect(() => {
    if (mode === "pilot") { window.__lenis?.stop(); thrustRef.current = {}; }
    else window.__lenis?.start();
  }, [mode]);

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
      /* Persist visited stops (powers "stops X/12" + the return greeting). */
      markVisited(dest.id);
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

  /* Keep the wide-pullback ref in sync with the overview toggle (CameraRig
     reads wideRef.current each frame). */
  useEffect(() => {
    wideRef.current = overview;
  }, [overview]);

  /* Focus (visiting an object) only lives inside the overview — clear it when
     the overview closes. */
  useEffect(() => {
    if (!overview && focusedObj) {
      setFocusedObj(null);
      focusRef.current = null;
    }
  }, [overview, focusedObj]);

  const clearFocus = useCallback(() => {
    setFocusedObj(null);
    focusRef.current = null;
  }, []);

  /* Map pick: a destination returns to its résumé stop; an anomaly flies the
     free camera to its authored framing. */
  const handlePick = useCallback(
    (o) => {
      if (o.visit.kind === "stop") {
        setFocusedObj(null);
        focusRef.current = null;
        setMode("tour");
        handleJump(o.visit.index);
      } else {
        setMode("overview");
        setFocusedObj(o);
        focusRef.current = o.visit.cameraTarget;
        /* Visiting an anomaly (map or palette) charts it toward Explorer Rank. */
        markCharted(o.id);
      }
    },
    [handleJump]
  );

  /* Command registry for the ⌘K palette, bound to the app's handlers. */
  const commands = useMemo(
    () => buildCommands({
      warpTo: (i) => { setMode("tour"); handleJump(i); },
      pick: handlePick,
      toggleLog: () => setLogOpen((v) => !v),
      toggleMap: () => setMode((m) => (m === "overview" ? "tour" : "overview")),
      startSpeedRun: () => setSpeedRunOn((v) => !v),
      startVoice: () => setVoiceNonce((n) => n + 1),
      setTimeScale: handleTimeScale,
      enterPilot: togglePilot,
    }),
    [handleJump, handlePick, handleTimeScale, togglePilot]
  );

  /* Fade the scroll hint on the first real interaction (or after 8s). */
  useEffect(() => {
    if (!shipWarpDone || interacted) return undefined;
    const mark = () => setInteracted(true);
    const t = setTimeout(mark, 8000);
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("keydown", mark);
    window.addEventListener("touchmove", mark, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("wheel", mark);
      window.removeEventListener("keydown", mark);
      window.removeEventListener("touchmove", mark);
    };
  }, [shipWarpDone, interacted]);

  /* Keyboard navigation. Arrows / PageUp-Down / Home / End jump between
     stops; Z (or ⌘/Ctrl+Z) toggles the system overview; Esc exits it. No
     text inputs exist in the app, so capturing plain keys is safe. */
  useEffect(() => {
    if (!shipWarpDone) return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const N = DESTINATIONS.length;
      const cur = activeIdxRef.current;
      /* ⌘K / Ctrl+K toggles the command palette (works even from its input). */
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      /* Never hijack typing — the palette input is the app's first text field;
         while it's open it owns its own keys (arrows / enter / esc). */
      const typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
      if (paletteOpen || typing) return;
      if (k === "/") { e.preventDefault(); setPaletteOpen(true); return; }
      /* The Explorer Log captures keys while open (Esc closes it). */
      if (logOpen) {
        if (k === "escape") setLogOpen(false);
        return;
      }
      /* P toggles free-flight. While piloting, FreeRoam owns WASD/arrows — the
         hub only listens for Esc / P to dock. */
      if (k === "p") { e.preventDefault(); togglePilot(); return; }
      if (mode === "pilot") { if (k === "escape") setMode("tour"); return; }
      if (k === "z") {
        e.preventDefault();
        setMode((m) => (m === "overview" ? "tour" : "overview"));
      } else if (k === "escape") {
        /* Step back: focused object → map; map → tour. */
        if (focusedObj) clearFocus();
        else setMode("tour");
      } else if (k === "arrowdown" || k === "arrowright" || k === "pagedown") {
        e.preventDefault();
        setMode("tour");
        if (cur < N - 1) handleJump(cur + 1);
      } else if (k === "arrowup" || k === "arrowleft" || k === "pageup") {
        e.preventDefault();
        setMode("tour");
        if (cur > 0) handleJump(cur - 1);
      } else if (k === "home") {
        e.preventDefault();
        setMode("tour");
        handleJump(0);
      } else if (k === "end") {
        e.preventDefault();
        setMode("tour");
        handleJump(N - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shipWarpDone, handleJump, focusedObj, clearFocus, logOpen, paletteOpen, mode, togglePilot]);

  /* Browser back/forward should also navigate */
  useEffect(() => {
    const onHash = () => {
      const idx = findDestinationIndexByHash(window.location.hash);
      if (idx !== -1) handleJump(idx);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [handleJump]);

  /* UI/interaction state shared with the cockpit shell (dock, palette, HUD,
     rank meter) via context — they consume it instead of prop-drilling. */
  const ui = useMemo(
    () => ({ mode, setMode, activeIdx, jumpTo: handleJump }),
    [mode, activeIdx, handleJump]
  );

  return (
    <StellarUIContext.Provider value={ui}>
      {/* Hide the page scrollbar — scroll still drives the camera, but the
          bar is visual clutter. (Scoped to while the stellar app is mounted.) */}
      <style>{`
        html { scrollbar-width: none !important; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
        /* Keyboard focus: a clear, on-theme ring (mouse clicks stay ring-free
           via :focus-visible). */
        .stellar-content-left a:focus-visible, .stellar-content-left button:focus-visible,
        button:focus-visible, a:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid rgba(150, 195, 255, 0.95) !important;
          outline-offset: 3px;
          border-radius: 5px;
        }
        @keyframes stellarChevron { 0%, 100% { transform: translateY(0); opacity: 0.55; } 50% { transform: translateY(4px); opacity: 1; } }
        @keyframes stellarCaret { 50% { opacity: 0; } }
        @keyframes stellarStatusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; } }
      `}</style>
      <Scene
        scrollT={scrollTRef}
        activeIdx={activeIdx}
        onJump={handleJump}
        onReady={handleSceneReady}
        freeRoamEnabled={mode === "pilot"}
        speedRef={pilotSpeedRef}
        thrustRef={thrustRef}
        wideRef={wideRef}
        focusRef={focusRef}
        cameraRef={cameraRef}
        clock={sceneClockRef.current}
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
          {mode === "tour" && <PlanetHUD destination={DESTINATIONS[activeIdx]} />}
          {mode === "tour" && <ContentPanel destination={DESTINATIONS[activeIdx]} />}
          <AmbientAudio />
          <OverviewHud overview={overview} />
          {mode === "tour" && <ProgressRail destinations={DESTINATIONS} activeIdx={activeIdx} onJump={handleJump} />}
          {mode === "tour" && <ScrollHint visible={activeIdx === 0 && !interacted} />}
          {/* Interactive overview map — hover any object for info, click to
              visit (planets → résumé stop, anomalies → free fly-to). */}
          <OverviewMap objects={OBJECTS} cameraRef={cameraRef} visible={overview && !focusedObj} onPick={handlePick} />
          {focusedObj && <FocusCard obj={focusedObj} onBack={clearFocus} />}
          {/* Explorer Layer — discovery rank + log, achievement toasts, and the
              konami / sun-salute / "42" easter eggs. */}
          <Achievements activeIdx={activeIdx} showStrip={false} />
          <EasterEgg />
          <AnswerListener />
          <RankMeter onOpen={() => setLogOpen((v) => !v)} animate={!reducedMotion} />
          <DiscoveriesView open={logOpen} onClose={() => setLogOpen(false)} animate={!reducedMotion} />
          {/* Mission Control — on-screen Nav Console + ⌘K command palette +
              voice nav + opt-in speed run. */}
          <NavConsole
            mode={mode}
            destinations={DESTINATIONS}
            activeIdx={activeIdx}
            onPrev={() => handleJump(Math.max(0, activeIdxRef.current - 1))}
            onNext={() => handleJump(Math.min(DESTINATIONS.length - 1, activeIdxRef.current + 1))}
            onMap={() => setMode((m) => (m === "overview" ? "tour" : "overview"))}
            overview={overview}
            timeScale={timeScale}
            onTimeScale={handleTimeScale}
            onTogglePilot={togglePilot}
            thrustRef={thrustRef}
            isMobile={isMobile}
            animate={!reducedMotion}
          />
          <CockpitFrame enabled={mode === "pilot"} speedRef={pilotSpeedRef} />
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
          <VoiceNav onJump={handleJump} startSignal={voiceNonce} hideButton />
          <SpeedRun activeIdx={activeIdx} active={speedRunOn} onToggle={() => setSpeedRunOn((v) => !v)} />
        </>
      )}
      {/* Countdown plays FIRST on mount; the warp fly-in (WarpField streaks
          + CameraRig) follows. Scene textures stream in behind both. */}
      {!countdownDone && <MissionCountdown onComplete={handleCountdownDone} />}
    </StellarUIContext.Provider>
  );
};

export default StellarApp;
