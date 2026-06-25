/* eslint-disable react/prop-types */
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { MotionConfig } from "motion/react";
import Scene from "./Scene";
import Navigator from "./Navigator";
import ContentPanel from "./ContentPanel";
import Cursor from "./Cursor";
import PlanetHUD from "./PlanetHUD";
import { ScrollHint } from "./Wayfinding";
import OverviewMap from "./OverviewMap";
import ScanReadout from "./ScanReadout";
import CommandPalette from "./CommandPalette";
import StellarUIContext from "./ui/StellarUIContext";
import { OBJECTS } from "./config/objects";
import { buildCommands } from "./config/commands";
import { easterEggs } from "../content";
import { DESTINATIONS } from "./config/destinations";
import Achievements from "./Achievements";
import DiscoveriesView from "./DiscoveriesView";
import EasterEgg from "./EasterEgg";
import AnswerListener from "./AnswerListener";
import useViewport from "./useViewport";
import SpeedRun from "./SpeedRun";
import CockpitFrame from "./CockpitFrame";
import FragmentToast from "./FragmentToast";
import HazardBanner from "./HazardBanner";
import EclipseDimmer from "./EclipseDimmer";
import SoundToggle from "./sound/SoundToggle";
import { markCharted, markVisited } from "./data/explorer";
import { getBodyContent } from "./data/bodies";


/* Hash → destination utilities */
const findDestinationIndexByHash = (hash) => {
  const id = hash?.replace(/^#\/?stellar\/?/, "").replace(/^#/, "");
  if (!id) return -1;
  return DESTINATIONS.findIndex((d) => d.id === id || d.section === id);
};

/*
 * Root component of the Stellar 3D portfolio. The scene loads straight in (no
 * countdown / warp intro) — textures stream in behind the UI, and the heavy
 * extras mount in tiers over the first ~2s.
 */

/* The only persistent on-screen control in the minimal UI: a subtle pill that
   toggles the system overview (and teaches the Z shortcut / supports click +
   touch). When overview is active it also shows a centred return hint. */
/* System-overview header text. The MAP toggle now lives in the Nav Console. */
const OverviewHud = ({ overview }) =>
  overview ? (
    <div style={{ position: "fixed", top: "7.5vh", left: 0, right: 0, zIndex: 50, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
      <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 17, letterSpacing: "0.16em", color: "white", textTransform: "uppercase", textShadow: "0 2px 20px rgba(0,0,0,0.85)" }}>System Overview</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}>drag to pan · scroll to zoom · right-drag to orbit · click a body to scan · Z or Esc to return</div>
    </div>
  ) : null;


const StellarApp = () => {
  const scrollTRef = useRef(0);
  /* No intro sequence — countdown timer + warp fly-in removed; the system loads
     straight in. shipWarpDone stays an always-true gate so the existing UI +
     effects mount immediately. */
  const shipWarpDone = true;
  /* Progressive-mount tier (0→3) for the heavy extras suite. Mounting the whole
     suite in ONE commit the instant the countdown ended froze a frame for ~3.5s
     and snapped the warp; we instead ramp it in tiers BEHIND the countdown cover
     so it's warm by the time the tour starts. */
  const [extrasPhase, setExtrasPhase] = useState(0);
  /* Interaction mode — the single source of truth for the camera/interaction
     state (tour | overview | pilot | warping). `overview` (the wide pull-back
     the Z key toggles) is derived so the render conditionals + the wideRef
     CameraRig reads stay unchanged. */
  const [mode, setMode] = useState("tour");
  const overview = mode === "overview";
  /* `flying` is true whenever the ship is under manual control (the read-mode
     pilot free-look). */
  const flying = mode === "pilot";
  /* First-interaction flag — fades the hero "scroll to explore" hint once the
     visitor scrolls / keys / touches (or after a timeout). */
  const [interacted, setInteracted] = useState(false);
  /* Object currently being visited from the overview map (the free fly-to). */
  const [focusedObj, setFocusedObj] = useState(null);
  /* Explorer Log (Discoveries) panel open state. */
  const [logOpen, setLogOpen] = useState(false);
  /* Speed-run challenge toggle. */
  const [speedRunOn, setSpeedRunOn] = useState(false);
  /* ⌘K command palette open state. */
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { reducedMotion, isMobile } = useViewport();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  /* Wide pull-back ref kept permanently off — there's no toggle in the
     minimal UI, but CameraRig still reads it, so this keeps its wide branch
     a harmless no-op without touching the rig. */
  const wideRef = useRef(false);
  /* Orrery view orbit (azimuth / elevation / radius) — the system-view drag
     updates it; CameraRig orbits the wide camera around the system from it. */
  const wideOrbitRef = useRef({ az: 1.8, el: 0.6, radius: 120, panX: 0, panZ: 0 });
  /* Free-camera focus target {position, lookAt, fov} for click-to-visit, and a
     live-camera handle the overview map projects object positions through. */
  const focusRef = useRef(null);
  const cameraRef = useRef(null);
  /* Flight: live speed (the gauge) + thruster input, read by the rigs. */
  const pilotSpeedRef = useRef(0);
  const thrustRef = useRef({});
  /* Live eclipse totality (0..1), written by SolarEclipse, read by the sky dimmer. */
  const eclipseRef = useRef(0);
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
    if (flying) thrustRef.current = {};
  }, [flying]);

  /* SINGLE owner of the scroll lock — freeze Lenis in pilot + overview, run it in
     the tour. Was three separate effects (pilot/overview/autoTour) racing
     stop()/start() across mode switches, which could leave scroll stuck stopped
     (bug-sweep H1). One effect keyed on `mode` = no race. */
  useEffect(() => {
    if (mode === "pilot" || mode === "overview") window.__lenis?.stop();
    else window.__lenis?.start();
  }, [mode]);

  /* Scene mounts/loads textures behind the warp + countdown overlays,
     so we no longer need an explicit sceneReady gate. */
  const handleSceneReady = useCallback(() => {}, []);
  /* Console easter egg for devs who open DevTools — once per session */
  useEffect(() => {
    if (consoleLoggedRef.current) return;
    consoleLoggedRef.current = true;
    console.log("%c\n" + easterEggs.ascii + "\n", "color: #ffb86b; font-size: 10px; font-family: monospace;");
    console.log(`%c${easterEggs.greeting}`, "color: #2fe0b0; font-size: 16px; font-weight: bold;");
    console.log(`%c${easterEggs.repoLink}`, "color: #aaa6c3; font-size: 12px;");
    console.log("%c🛸  Try the Konami code. Click the sun. Drag to explore.", "color: #ffb84d; font-size: 12px;");
  }, []);

  /* Stream the heavy extras suite IN in tiers over the first ~2s after load, so
     the core scene (sun + planets + stars) shows first and the ~140k belt
     particles + anomalies + models don't all build in one frame-freezing commit.
     Reduced-motion / mobile mount everything at once. */
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || isMobile) { setExtrasPhase(3); return undefined; }
    const t1 = setTimeout(() => setExtrasPhase(1), 200);
    const t2 = setTimeout(() => setExtrasPhase(2), 1000);
    const t3 = setTimeout(() => setExtrasPhase(3), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isMobile]);

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
      /* Visitor-log + achievements listen */
      window.dispatchEvent(new CustomEvent("stellar:destination", { detail: { id: dest.id, idx } }));
      /* Persist visited stops (powers "stops X/12" + the return greeting). */
      markVisited(dest.id);
    }
  }, []);

  const handleJump = useCallback((idx) => {
    /* Map destination index → exact scroll position. Progress runs 0..1 over
       (scrollHeight − viewport), so targetY = frac × that range (scaling by the
       viewport-count instead overshoots by ~1 destination). */
    const max =
      (document.scrollingElement || document.documentElement).scrollHeight -
      window.innerHeight;
    const targetY = (idx / (DESTINATIONS.length - 1)) * max;
    if (window.__lenis) {
      /* Snappy warp-jump: start moving IMMEDIATELY (easeOutCubic = instant
         lift-off, gentle arrival), short duration that scales a little with
         distance. The resulting travel speed drives the WarpField hyperspace
         streaks + camera shake (CameraRig). No more slow easeInOut lift-off. */
      const dist = Math.abs(idx - activeIdxRef.current) || 1;
      const duration = Math.min(1.7, 0.55 + dist * 0.13);
      window.__lenis.scrollTo(targetY, {
        duration,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
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

  /* Game-map overview controls: LEFT-drag PANS across the system, WHEEL ZOOMS
     in/out, RIGHT-drag ORBITS the angle. The tour scroll is frozen so the wheel
     drives zoom (not the camera tour); CameraRig smooths it (inertia-like).
     Resets to a clean framing each time the map opens. */
  useEffect(() => {
    if (mode !== "overview") return undefined;
    /* Scroll lock is owned by the consolidated mode effect above. */
    const o = wideOrbitRef.current;
    o.panX = 0; o.panZ = 0; o.radius = 130; o.el = 0.62;
    let drag = 0, lx = 0, ly = 0; // 0 none · 1 pan (left) · 2 orbit (right)
    const down = (e) => {
      if (e.target.closest && e.target.closest("button, a")) return;
      drag = e.button === 2 ? 2 : 1; lx = e.clientX; ly = e.clientY;
    };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      if (drag === 2) {
        o.az -= dx * 0.005;
        o.el = Math.max(0.12, Math.min(1.4, o.el + dy * 0.005));
      } else {
        const k = o.radius * 0.0016;
        o.panX -= dx * k; o.panZ -= dy * k;
      }
      lx = e.clientX; ly = e.clientY;
    };
    const up = () => { drag = 0; };
    const wheel = (e) => {
      e.preventDefault();
      o.radius = Math.max(26, Math.min(440, o.radius * (e.deltaY > 0 ? 1.12 : 0.89)));
    };
    const ctx = (e) => e.preventDefault();
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("contextmenu", ctx);
    return () => {
      window.__lenis?.start();
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("contextmenu", ctx);
    };
  }, [mode]);

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
        /* Visiting an anomaly (map) charts it toward Explorer Rank. */
        markCharted(o.id);
      }
    },
    [handleJump]
  );

  /* Prev/next within the focused body's category (falls back to all scannable
     objects when the category has only one) — powers the scan-readout arrows. */
  const cycleFocus = useCallback(
    (dir) => {
      if (!focusedObj) return;
      const focusables = OBJECTS.filter((o) => o.visit.kind === "focus");
      const sameCat = focusables.filter((o) => o.category === focusedObj.category);
      const list = sameCat.length > 1 ? sameCat : focusables;
      const i = list.findIndex((o) => o.id === focusedObj.id);
      const next = list[(i + dir + list.length) % list.length];
      if (next) handlePick(next);
    },
    [focusedObj, handlePick]
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
      /* Never hijack typing (the voice/answer fields). */
      const typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
      if (typing) return;
      /* The Explorer Log captures keys while open (Esc closes it). */
      if (logOpen) {
        if (k === "escape") setLogOpen(false);
        return;
      }
      /* P toggles free-flight. While piloting, FreeRoam owns WASD/arrows — the
         hub only listens for Esc / P to dock. Blocked while the overview map is
         open (entering pilot from overview raced the mode/scroll state — H3). */
      if (k === "p" && mode !== "overview") { e.preventDefault(); togglePilot(); return; }
      if (mode === "pilot") { if (k === "escape") setMode("tour"); return; }
      /* Scan card open: arrows cycle prev/next within the body's category. */
      if (focusedObj) {
        if (k === "arrowleft" || k === "arrowup") { e.preventDefault(); cycleFocus(-1); return; }
        if (k === "arrowright" || k === "arrowdown") { e.preventDefault(); cycleFocus(1); return; }
        if (k === "escape") { clearFocus(); return; }
      }
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
  }, [shipWarpDone, handleJump, focusedObj, clearFocus, cycleFocus, logOpen, mode, togglePilot]);

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
  /* ⌘K / Ctrl-K toggles the command palette (any mode). */
  useEffect(() => {
    const onK = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
    };
    window.addEventListener("keydown", onK);
    return () => window.removeEventListener("keydown", onK);
  }, []);

  /* Command registry bound to the app's handlers (commands whose handler isn't
     provided are filtered out by the palette). */
  const commands = useMemo(
    () => buildCommands({
      warpTo: (i) => { setPaletteOpen(false); handleJump(i); },
      pick: (o) => { setPaletteOpen(false); handlePick(o); },
      toggleMap: () => { setPaletteOpen(false); setMode((m) => (m === "overview" ? "tour" : "overview")); },
      toggleLog: () => { setPaletteOpen(false); setLogOpen((v) => !v); },
      startSpeedRun: () => { setPaletteOpen(false); setSpeedRunOn(true); },
      enterPilot: () => { setPaletteOpen(false); togglePilot(); },
      setTimeScale: (s) => { sceneClockRef.current.scale = s; },
    }),
    [handleJump, handlePick, togglePilot]
  );

  const ui = useMemo(
    () => ({ mode, setMode, activeIdx, jumpTo: handleJump }),
    [mode, activeIdx, handleJump]
  );

  return (
    <MotionConfig reducedMotion="user">
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
        @keyframes stellarGlow { 0%, 100% { box-shadow: 0 0 18px rgba(47, 224, 176,0.2); } 50% { box-shadow: 0 0 30px rgba(47, 224, 176,0.42); } }
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
        eclipseRef={eclipseRef}
        wideRef={wideRef}
        wideOrbitRef={wideOrbitRef}
        focusRef={focusRef}
        cameraRef={cameraRef}
        clock={sceneClockRef.current}
        extrasPhase={extrasPhase}
      />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
      />
      {shipWarpDone && (
        <>
          <Cursor />
          {/* Ship-audio toggle — opt-in, default muted (autoplay-safe). */}
          <SoundToggle />
          {/* Sky darkens toward totality during an eclipse (scene only; HUD stays lit). */}
          <EclipseDimmer eclipseRef={eclipseRef} />
          {/* Discovery + toasts — shared by both modes. */}
          <Achievements activeIdx={activeIdx} showStrip={false} />
          <EasterEgg />
          <AnswerListener />
          <DiscoveriesView open={logOpen} onClose={() => setLogOpen(false)} animate={!reducedMotion} />
          <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} />
          <FragmentToast />
          <HazardBanner clock={sceneClockRef.current} />
          {/* Minimal canopy HUD for the read-mode pilot (P key). */}
          <CockpitFrame enabled={mode === "pilot"} speedRef={pilotSpeedRef} />
          {/* READ — the scroll-tour résumé (the single experience). */}
          {mode === "tour" && <PlanetHUD destination={DESTINATIONS[activeIdx]} />}
          {mode === "tour" && <ContentPanel destination={DESTINATIONS[activeIdx]} />}
          <OverviewHud overview={overview} />
          {mode === "tour" && <ScrollHint visible={activeIdx === 0 && !interacted} />}
          <OverviewMap objects={OBJECTS} cameraRef={cameraRef} visible={overview && !focusedObj} onPick={handlePick} />
          {focusedObj && (
            <ScanReadout
              content={getBodyContent(focusedObj.id)}
              onBack={clearFocus}
              onPrev={() => cycleFocus(-1)}
              onNext={() => cycleFocus(1)}
            />
          )}
          {/* Minimal by design — just the résumé tour + the system overview (Z). */}
          <SpeedRun activeIdx={activeIdx} active={speedRunOn} onToggle={() => setSpeedRunOn((v) => !v)} />
        </>
      )}
    </StellarUIContext.Provider>
    </MotionConfig>
  );
};

export default StellarApp;
