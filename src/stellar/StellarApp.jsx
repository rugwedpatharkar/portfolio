 
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { MotionConfig } from "motion/react";
import Scene from "./Scene";
import Navigator from "./Navigator";
import ContentPanel from "./ContentPanel";
import ItemDossier from "./ItemDossier";
import HoloBridge from "./holobridge/HoloBridge";
import Cursor from "./Cursor";
import { ScrollHint } from "./Wayfinding";
/* OverviewMap removed — system overview cut (minimal UI) */
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
import CoPilot from "./CoPilot";
import PhotoMode from "./PhotoMode";
import SpeedRun from "./SpeedRun";
import CockpitFrame from "./CockpitFrame";
import CockpitHUD from "./CockpitHUD";
import StellarGlare from "./StellarGlare";
import { itemsForSection } from "./data/sectionItems";
import FragmentToast from "./FragmentToast";
import HazardBanner from "./HazardBanner";
import EclipseDimmer from "./EclipseDimmer";
/* SoundToggle removed — minimal UI (bridge hum still arms on first gesture) */
import { markCharted, markVisited } from "./data/explorer";
import { getBodyContent } from "./data/bodies";
import V3Style from "./v3/V3Style";


/* Hash → destination utilities */
const findDestinationIndexByHash = (hash) => {
  const id = hash
    ?.replace(/^#v3\/?/, "")
    .replace(/^#\/?stellar\/?/, "")
    .replace(/^#/, "");
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
      <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.8)", textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}>drag to pan · scroll to zoom · right-drag to orbit · click a body to scan · Z or Esc to return</div>
    </div>
  ) : null;


const StellarApp = ({ v3 = false }) => {
  const scrollTRef = useRef(0);
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
  /* During the hyperspace fly-through the section info hides; it fades back in on
     arrival (settle). CameraRig edge-fires stellar:flight {flying}. Reduced-motion
     / mobile never fly, so the info stays visible there. */
  const [panelHidden, setPanelHidden] = useState(false);
  useEffect(() => {
    const onFlight = (e) => setPanelHidden(!!e.detail?.flying);
    window.addEventListener("stellar:flight", onFlight);
    return () => window.removeEventListener("stellar:flight", onFlight);
  }, []);
  const { reducedMotion, isMobile } = useViewport();
  /* The warp/countdown cinematic intro was removed entirely — every visitor loads
     straight into the hero (a clean cut). `introDone` is permanently true (kept as
     a constant so the many downstream `introDone &&` gates still read cleanly);
     `launchPhase` stays null so CameraRig's now-inert scripted-launch branch never
     runs. CameraRig itself is unchanged. */
  const introDone = true;
  const launchPhase = null;
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  /* Item index within the active section — ←→ moves along the planet's lane.
     itemIdx -1 = planet-view. itemIdxRef is a synchronous mirror so the key
     handler can read/advance it without a stale-closure race. */
  const [itemIdx, setItemIdx] = useState(-1);
  const itemIdxRef = useRef(-1);
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
  /* Hyperspace-tube intensity, pulsed on a ←→ hyperloop shift. */
  const warpVelRef = useRef(0);
  /* The body/object the camera is travelling FROM — for travel-direction framing
     (you approach each target from where you just were). */
  const prevTargetRef = useRef({ destId: DESTINATIONS[0].id, k: -1 });
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
    /* Also lock during the intro so a wheel-to-skip can't scrub the tour
       underneath the cinematic. */
    if (!introDone || mode === "pilot" || mode === "overview") window.__lenis?.stop();
    else window.__lenis?.start();
  }, [mode, introDone]);

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
    /* Hold the heavy build until the intro hands off — mounting ~140k belt
       particles + anomalies during the warp freezes the dive. */
    if (!introDone) return undefined;
    const t1 = setTimeout(() => setExtrasPhase(1), 200);
    const t2 = setTimeout(() => setExtrasPhase(2), 1000);
    const t3 = setTimeout(() => setExtrasPhase(3), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isMobile, introDone]);

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx !== -1) {
      setActiveIdx(idx);
      activeIdxRef.current = idx;
      itemIdxRef.current = -1;
      setItemIdx(-1); // arrive in planet-view; ←→ flies out to the lane objects
      /* Sync URL hash without re-scrolling — keep the active route prefix so a
         reload stays on #v3 (rewriting to #/stellar/… dropped v3 back to v2). */
      const next = `${v3 ? "#v3" : "#/stellar"}/${dest.id}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
      /* Visitor-log + achievements listen */
      window.dispatchEvent(new CustomEvent("stellar:destination", { detail: { id: dest.id, index: idx } }));
      /* Persist visited stops (powers "stops X/12" + the return greeting). */
      markVisited(dest.id);
    }
  }, [v3]);

  /* (Camera focus is set synchronously in navTo/navPlanet/navItem below — not in
     an effect — to avoid the frame-loop seeing a stale/null focus on the nav
     tick, which stranded the camera on the previous body. See applyFocus.) */

  /* Arm the bridge hum once (audible only after the user un-mutes via SoundToggle). */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("stellar:sound:hum"));
  }, []);

  /* PHASE 2C — reticle-lock beep when ←→ locks onto a lane object (the 3-beat
     arrival's middle beat; the dossier scan-reveal + in-world ping are the others). */
  useEffect(() => {
    if (introDone && itemIdx >= 0) {
      window.dispatchEvent(new CustomEvent("stellar:sound:beep"));
      window.dispatchEvent(new CustomEvent("stellar:scan", { detail: { idx: itemIdx } })); // co-pilot reacts
    }
  }, [itemIdx, introDone]);

  const handleJump = useCallback((idx) => {
    /* Map destination index → exact scroll position. Progress runs 0..1 over
       (scrollHeight − viewport), so targetY = frac × that range (scaling by the
       viewport-count instead overshoots by ~1 destination). */
    const max =
      (document.scrollingElement || document.documentElement).scrollHeight -
      window.innerHeight;
    const targetY = (idx / (DESTINATIONS.length - 1)) * max;
    if (window.__lenis) {
      /* Snap the scroll INSTANTLY — the camera travel is the warp-jump now
         (CameraRig), so the scroll only needs to keep scrollT (→ KeyLight + the
         active-planet lighting) in sync. An ANIMATED scroll fed intermediate
         positions back through the Navigator → handleDestinationChange, which
         reverted activeIdx and left the camera focus one planet behind (the
         "first hop stays on Sol" / black-planet desync). */
      window.__lenis.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo({ top: targetY, behavior: "auto" });
    }
  }, []);

  /* Set the camera focus target SYNCHRONOUSLY on nav (not via an effect): the
     frame loop must see the new target the same tick the user navigates, or the
     warp-jump's first-target guard strands the camera on the previous body (the
     black-planet desync). Travel framing — approach FROM the body we were last on. */
  const applyFocus = useCallback((planetIdx, k) => {
    const dest = DESTINATIONS[planetIdx];
    if (!dest) return;
    const target = { destId: dest.id, k };
    const from = prevTargetRef.current;
    const changed = from.destId !== target.destId || from.k !== target.k;
    focusRef.current = { live: true, target, from: changed ? from : null, fov: k >= 0 ? 42 : 50 };
    prevTargetRef.current = target;
    if (changed) {
      window.dispatchEvent(new CustomEvent("stellar:sound:jump"));
    }
  }, []);

  /* ↑↓ planet hops + ←→ object hops — all routed here so every entry point
     (keys, nav-pad, navicomputer) sets state + focus the same way, synchronously. */
  const navTo = useCallback((idx) => {
    setMode("tour");
    const n = Math.max(0, Math.min(DESTINATIONS.length - 1, idx));
    if (n === activeIdxRef.current && itemIdxRef.current < 0) return;
    activeIdxRef.current = n;
    itemIdxRef.current = -1;
    setActiveIdx(n);
    setItemIdx(-1);
    applyFocus(n, -1);
    handleJump(n); // instant scroll → keeps scrollT / KeyLight on the active planet
  }, [applyFocus, handleJump]);

  const navPlanet = useCallback((dir) => navTo(activeIdxRef.current + dir), [navTo]);

  const navItem = useCallback((dir) => {
    const p = activeIdxRef.current;
    const len = itemsForSection(DESTINATIONS[p]?.section).length || 1;
    const m = Math.max(-1, Math.min(len - 1, itemIdxRef.current + dir));
    if (m === itemIdxRef.current) return;
    itemIdxRef.current = m;
    setItemIdx(m);
    applyFocus(p, m);
  }, [applyFocus]);

  /* Keep the camera focused on the ACTIVE body for EVERY nav path. Keyboard /
     nav-pad / navicomputer set focus synchronously (navTo/navItem). But SCROLL
     (Lenis → handleDestinationChange), URL-hash nav, and map "stop" picks only
     move activeIdx — leaving focusRef null, which dropped the camera into the old
     backlit scroll-framing (planet silhouetted against the Sun → black) AND
     re-enabled pointer parallax (hover shoved the body off-frame). That was the
     "planet goes black, hover brings it back" bug. Re-running on activeIdx/itemIdx
     covers those paths; it's idempotent with the synchronous setters (applyFocus's
     `changed` guard skips the redundant warp + whoosh). Sol (idx 0) stays
     focus-free so the hero keeps its subtle pointer parallax. */
  useEffect(() => {
    if (mode !== "tour") { focusRef.current = null; return; }
    if (activeIdx > 0 || itemIdx >= 0) {
      /* Keyboard / nav-pad / navicomputer already set focus synchronously WITH the
         correct from→target travel direction. Re-applying here would rebuild `from`
         from the already-advanced prevTargetRef (→ null direction), flattening the
         inward/outward (Camera→body→Sun vs →deep space) framing. So only apply for
         the paths that DIDN'T set it synchronously — scroll, URL hash, map pick —
         i.e. when focus isn't already on this exact target. */
      const f = focusRef.current;
      const here = DESTINATIONS[activeIdx];
      const already = f && f.live && f.target && here && f.target.destId === here.id && f.target.k === itemIdx;
      if (!already) applyFocus(activeIdx, itemIdx);
    }
    /* Sol (idx 0, planet-view) → clear focus so the camera falls back to the
       authored hero framing (the same pose the intro warp lands on — no snap),
       and reset the travel origin so the next outward hop departs FROM Sol. */
    else { focusRef.current = null; prevTargetRef.current = { destId: DESTINATIONS[0].id, k: -1 }; }
  }, [mode, activeIdx, itemIdx, applyFocus]);

  /* Read URL hash once the countdown finishes (full intro complete),
     then jump there if it points to a non-Sol destination. */
  useEffect(() => {
    if (!introDone) return;
    const idx = findDestinationIndexByHash(window.location.hash);
    if (idx > 0) {
      const t = setTimeout(() => handleJump(idx), 350);
      return () => clearTimeout(t);
    }
  }, [introDone, handleJump]);

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
    if (!introDone || interacted) return undefined;
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
  }, [introDone, interacted]);

  /* Keyboard navigation. Arrows / PageUp-Down / Home / End jump between
     stops; Z (or ⌘/Ctrl+Z) toggles the system overview; Esc exits it. No
     text inputs exist in the app, so capturing plain keys is safe. */
  useEffect(() => {
    if (!introDone) return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const N = DESTINATIONS.length;
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
      if (k === "escape") {
        /* Step back: focused object → map; map → tour. */
        if (focusedObj) clearFocus();
        else setMode("tour");
      } else if (k === "arrowdown" || k === "pagedown" || k === "s") {
        e.preventDefault(); navPlanet(1); // ↓ next lane (planet)
      } else if (k === "arrowup" || k === "pageup" || k === "w") {
        e.preventDefault(); navPlanet(-1); // ↑ previous lane
      } else if (k === "arrowleft" || k === "a") {
        e.preventDefault(); navItem(-1); // ← previous object on this lane
      } else if (k === "arrowright" || k === "d") {
        e.preventDefault(); navItem(1); // → next object
      } else if (k === "home") {
        e.preventDefault(); navTo(0);
      } else if (k === "end") {
        e.preventDefault(); navTo(N - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [introDone, navTo, navPlanet, navItem, focusedObj, clearFocus, cycleFocus, logOpen, mode, togglePilot]);

  /* SIDEWAYS SCROLL → ←→ side-object nav. A trackpad two-finger horizontal swipe
     (deltaX) or Shift+wheel cycles the lane objects, debounced one-object-per
     gesture. Lenis drives only vertical scroll (the tour), so horizontal is free.
     Tour mode only; ignored in overview/pilot and while a scan card is open. */
  useEffect(() => {
    if (!introDone) return undefined;
    let accum = 0, cooldownUntil = 0, resetTimer = null;
    const onWheel = (e) => {
      if (mode !== "tour" || focusedObj) return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5;
      const dx = horizontal ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      const now = performance.now();
      if (now < cooldownUntil) return;
      accum += dx;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accum = 0; }, 180); // reset if the gesture pauses
      if (Math.abs(accum) > 60) {
        navItem(accum > 0 ? 1 : -1); // swipe left → next object →
        accum = 0;
        cooldownUntil = now + 420; // one object per ~0.4s
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => { window.removeEventListener("wheel", onWheel); clearTimeout(resetTimer); };
  }, [introDone, mode, focusedObj, navItem]);

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
      toggleMap: () => setPaletteOpen(false),
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

  /* Lane items for the active world + the one ←→ has focused (itemIdx ≥ 0). When
     an item is focused we show its per-item dossier instead of the section panel. */
  const laneItems = itemsForSection(DESTINATIONS[activeIdx]?.section);
  const focusedItem = itemIdx >= 0 ? laneItems[itemIdx] : null;

  return (
    <MotionConfig reducedMotion="user">
    <StellarUIContext.Provider value={ui}>
      {/* v3 skin — injects design tokens + tracks the per-body accent. Mounted
          only on the #v3 route; #stellar (v2) renders unchanged. */}
      {v3 && <V3Style accentKey={DESTINATIONS[activeIdx]?.id} />}
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
        itemIdx={itemIdx}
        onJump={handleJump}
        onReady={handleSceneReady}
        freeRoamEnabled={mode === "pilot"}
        speedRef={pilotSpeedRef}
        thrustRef={thrustRef}
        eclipseRef={eclipseRef}
        wideRef={wideRef}
        wideOrbitRef={wideOrbitRef}
        focusRef={focusRef}
        warpVelRef={warpVelRef}
        cameraRef={cameraRef}
        clock={sceneClockRef.current}
        extrasPhase={extrasPhase}
        launchPhase={launchPhase}
        v3={v3}
      />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
      />
      {introDone && (
        <>
          <Cursor />
          {/* Sky darkens toward totality during an eclipse (scene only; HUD stays lit). */}
          <EclipseDimmer eclipseRef={eclipseRef} />
          {/* D — the star's light floods the canopy on an inward approach (the 3D
              LensFlare only fires when the Sun is in front; this covers behind). */}
          <StellarGlare cameraRef={cameraRef} warpVelRef={warpVelRef} reducedMotion={reducedMotion} />
          {/* v2 chrome/gamification — CUT from v3 (Explorer log, ⌘K palette,
              achievements, co-pilot, photo mode, cockpit HUD, hazard banner,
              toasts). v3 gets its own minimal FUI HUD in a later phase. */}
          {!v3 && (
            <>
              <Achievements activeIdx={activeIdx} showStrip={false} />
              <EasterEgg />
              <AnswerListener />
              <CoPilot />
              <PhotoMode
                bodyLabel={focusedItem ? focusedItem.label : DESTINATIONS[activeIdx]?.label}
                setTimeScale={(s) => { sceneClockRef.current.scale = s; }}
              />
              <DiscoveriesView open={logOpen} onClose={() => setLogOpen(false)} animate={!reducedMotion} />
              <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} />
              <FragmentToast />
              <HazardBanner clock={sceneClockRef.current} />
            </>
          )}
          {/* Minimal canopy HUD for the read-mode pilot (P key). */}
          <CockpitFrame enabled={mode === "pilot"} speedRef={pilotSpeedRef} />
          {/* READ — v2 cockpit HUD (system ladder, item dial, nav pad, co-pilot).
              Cut from v3, which uses its own FUI HUD. */}
          {!v3 && mode === "tour" && (
            <CockpitHUD
              destination={DESTINATIONS[activeIdx]}
              activeIdx={activeIdx}
              itemIdx={itemIdx}
              items={laneItems}
              onItem={navItem}
            />
          )}
          {/* Holo-Bridge — the dual-hologram info surface (planet facts LEFT, résumé
              dossier RIGHT, planet centred between). Hides during fly-through, reveals
              on arrival (panelHidden ← stellar:flight). Replaces ContentPanel + the
              forced-←→ ItemDossier (ItemDossier is reused inside the dossier panel). */}
          {mode === "tour" && (
            <HoloBridge
              destination={DESTINATIONS[activeIdx]}
              section={DESTINATIONS[activeIdx]?.section}
              items={laneItems}
              bootNonce={activeIdx}
              panelHidden={panelHidden}
              v3={v3}
            />
          )}
          {mode === "tour" && <ScrollHint visible={activeIdx === 0 && !interacted} />}
          {!v3 && focusedObj && (
            <ScanReadout
              content={getBodyContent(focusedObj.id)}
              onBack={clearFocus}
              onPrev={() => cycleFocus(-1)}
              onNext={() => cycleFocus(1)}
            />
          )}
          {!v3 && <SpeedRun activeIdx={activeIdx} active={speedRunOn} onToggle={() => setSpeedRunOn((v) => !v)} />}
        </>
      )}
    </StellarUIContext.Provider>
    </MotionConfig>
  );
};

export default StellarApp;
