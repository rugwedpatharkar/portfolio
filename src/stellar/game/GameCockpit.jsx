/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { personalInfo, heroContent } from "../../content";
import { BODIES, liveBodyPosition, getBodyContent, OBJECTIVE_TOTAL } from "../data/bodies";
import { markCharted, markVisited, rankFor, chartedCount } from "../data/explorer";

/*
 * THE COCKPIT — a real ship's canopy you fly from (free-look: mouse + WASD,
 * handled by Scene/GameFlight). This is the glass + dashboard over the view:
 *
 *   • a curved console dashboard (clip-path) glowing along its contour
 *   • a center boresight reticle (where you're aiming)
 *   • a TARGET bracket that PROJECTS onto the nearest body in 3-D and turns
 *     into an edge chevron when it's off-screen / behind you
 *   • a live PILOT console (you) + TARGET sensor MFD (what you're scanning)
 *   • a velocity gauge + control legend + ▤ READ escape
 *
 * Everything target-side is data-driven: the nearest body is found from the
 * BODIES registry every frame and rendered via getBodyContent(), so a NEW
 * anomaly added to the registry shows up here — scan, score, content — with
 * zero changes in this file.
 */

const MONO = "'JetBrains Mono', monospace";
const TITLE = "'Michroma', sans-serif";
const BODYF = "'Exo 2', sans-serif";
const TEAL = "#00cea8";
const STATUS_COLOR = { available: "#00cea8", busy: "#f8c555", unavailable: "#ff6b6b" };

/* Console dashboard silhouette: tall at the sides (where the consoles live),
   scooped low in the center so the forward view stays open. */
const DASH_CLIP =
  "polygon(0% 36%, 10% 26%, 22% 44%, 38% 62%, 50% 66%, 62% 62%, 78% 44%, 90% 26%, 100% 36%, 100% 100%, 0% 100%)";
/* Canopy brow — the framed top of the glass, mirroring the dashboard so the
   view reads as "inside the ship": frame at the corners, open ahead. */
const BROW_CLIP =
  "polygon(0 0, 100% 0, 100% 60%, 80% 50%, 50% 32%, 20% 50%, 0 60%)";

const GameCockpit = ({ cameraRef, clock, speedRef, onReadMode }) => {
  const [target, setTarget] = useState(null); // { id, dist, inRange, charted }
  const [locked, setLocked] = useState(false);
  const [, force] = useState(0);

  const velRef = useRef(null);
  const velBarRef = useRef(null);
  const brkRef = useRef(null);    // projected target container
  const lockRef = useRef(null);   // on-screen square bracket
  const edgeRef = useRef(null);   // off-screen chevron (rotates)
  const brkLabelRef = useRef(null);
  const scannedRef = useRef(new Set());

  /* Pointer-lock state drives the "click to look" hint. */
  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  /* Re-read score / rank when progress changes (a fresh chart). */
  useEffect(() => {
    const r = () => force((n) => n + 1);
    window.addEventListener("stellar:progress", r);
    return () => window.removeEventListener("stellar:progress", r);
  }, []);

  /* The live loop: nearest body, scan/chart, project the target bracket, drive
     the velocity gauge. Bracket + gauge update via refs (no React churn); the
     side panels re-render at ≤7 Hz (throttled) or when the target changes. */
  useEffect(() => {
    let raf = 0;
    let lastEmit = 0;
    let curId = null;
    const bp = new THREE.Vector3();
    const proj = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const cam = cameraRef?.current;
      if (!cam) return;
      const t = clock?.t || 0;

      if (velRef.current) {
        const v = Math.max(0, Math.round(speedRef?.current || 0));
        velRef.current.textContent = String(v).padStart(3, "0");
        if (velBarRef.current) velBarRef.current.style.width = `${Math.min(100, (v / 30) * 100)}%`;
      }

      let best = null;
      let bestD = Infinity;
      for (const b of BODIES) {
        liveBodyPosition(b.id, t, bp);
        const dd = cam.position.distanceTo(bp);
        if (dd < bestD) { bestD = dd; best = b; }
      }
      if (!best) return;
      liveBodyPosition(best.id, t, bp);

      const charted = bestD <= best.scanRadius;
      const inRange = bestD <= best.scanRadius * 2.6;
      if (charted && !scannedRef.current.has(best.id)) {
        scannedRef.current.add(best.id);
        markCharted(best.id);            // idempotent; announces stellar:progress
        if (best.section) markVisited(best.id);
      }

      /* Project the body to screen → square bracket; off-screen/behind → a
         chevron clamped to the edge, rotated toward it. */
      const c = brkRef.current;
      if (c) {
        proj.copy(bp).project(cam);
        const behind = proj.z > 1;
        let nx = proj.x, ny = proj.y;
        if (behind) { nx = -nx; ny = -ny; }
        const onScreen = !behind && Math.abs(proj.x) <= 1 && Math.abs(proj.y) <= 1;
        const w = window.innerWidth, h = window.innerHeight;
        let sx = (nx * 0.5 + 0.5) * w;
        let sy = (-ny * 0.5 + 0.5) * h;
        if (onScreen) {
          c.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
          if (lockRef.current) lockRef.current.style.display = "block";
          if (edgeRef.current) edgeRef.current.style.display = "none";
        } else {
          const m = 70;
          sx = Math.max(m, Math.min(w - m, sx));
          sy = Math.max(m, Math.min(h - m, sy));
          const ang = (Math.atan2(sy - h / 2, sx - w / 2) * 180) / Math.PI;
          c.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
          if (lockRef.current) lockRef.current.style.display = "none";
          if (edgeRef.current) { edgeRef.current.style.display = "block"; edgeRef.current.style.transform = `rotate(${ang}deg)`; }
        }
        const col = charted ? TEAL : inRange ? "#f8c555" : "#9fd2ff";
        c.style.color = col;
        if (brkLabelRef.current) brkLabelRef.current.textContent = `${best.label.toUpperCase()} · ${Math.round(bestD)}u`;
      }

      const now = performance.now();
      if (best.id !== curId || now - lastEmit > 150) {
        curId = best.id;
        lastEmit = now;
        setTarget({ id: best.id, dist: bestD, inRange, charted });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cameraRef, clock, speedRef]);

  const charted = chartedCount();
  const rank = rankFor();
  const score = charted * 100;
  const dot = STATUS_COLOR[personalInfo.availabilityStatus] || TEAL;
  const content = target ? getBodyContent(target.id) : null;
  const scanState = !target ? null : target.charted ? "charted" : target.inRange ? "scanning" : "approach";

  return (
    <>
      {/* Canopy glass — faint inner edge glow implying curved canopy. */}
      <div style={{ position: "fixed", inset: 0, zIndex: 41, pointerEvents: "none",
        boxShadow: "inset 0 0 120px rgba(2,5,14,0.85), inset 0 0 32px rgba(0,206,168,0.07)" }} />

      {/* Canopy brow — the top frame of the glass. */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "clamp(54px, 9vh, 96px)", zIndex: 42, pointerEvents: "none",
        clipPath: BROW_CLIP, WebkitClipPath: BROW_CLIP,
        background: "linear-gradient(to bottom, rgba(5,8,18,0.96) 30%, rgba(11,15,32,0.55))",
        filter: "drop-shadow(0 1px 0 rgba(0,206,168,0.45)) drop-shadow(0 2px 9px rgba(0,206,168,0.2))" }} />

      {/* Center boresight reticle — where you're aiming. */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 43, pointerEvents: "none" }}>
        <svg width="78" height="78" viewBox="0 0 78 78" fill="none" stroke={TEAL} opacity="0.8">
          <circle cx="39" cy="39" r="20" strokeWidth="0.8" strokeDasharray="2 5" opacity="0.55" />
          <circle cx="39" cy="39" r="2.4" strokeWidth="1" />
          <path d="M39 6v12M39 60v12M6 39h12M60 39h12" strokeWidth="1" />
          <path d="M24 24l5 5M54 24l-5 5M24 54l5-5M54 54l-5-5" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      {/* Projected TARGET bracket / off-screen chevron (ref-driven). */}
      <div ref={brkRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 43, pointerEvents: "none", color: "#9fd2ff", willChange: "transform" }}>
        <div ref={lockRef} style={{ position: "absolute", top: 0, left: 0, transform: "translate(-50%,-50%)" }}>
          <svg width="62" height="62" viewBox="0 0 62 62" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M8 20V8h12M42 8h12v12M54 42v12H42M20 54H8V42" />
          </svg>
        </div>
        <div ref={edgeRef} style={{ position: "absolute", top: 0, left: 0, transform: "translate(-50%,-50%)", display: "none" }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="currentColor"><path d="M9 5l13 10L9 25z" /></svg>
        </div>
        <div ref={brkLabelRef} style={{ position: "absolute", top: 34, left: 0, transform: "translateX(-50%)", whiteSpace: "nowrap",
          fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", color: "currentColor", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }} />
      </div>

      {/* Dashboard console silhouette. */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: "clamp(150px, 21vh, 208px)", zIndex: 42, pointerEvents: "none",
        clipPath: DASH_CLIP, WebkitClipPath: DASH_CLIP,
        background: "linear-gradient(to top, rgba(5,8,18,0.97) 40%, rgba(11,15,32,0.78))",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        filter: "drop-shadow(0 -1px 0 rgba(0,206,168,0.6)) drop-shadow(0 -2px 10px rgba(0,206,168,0.28))" }} />

      {/* PILOT console — bottom-left. */}
      <div style={{ position: "fixed", left: 0, bottom: 0, zIndex: 45, width: "min(330px, 26vw)", padding: "14px 20px 18px", pointerEvents: "none", color: "#fff" }}>
        <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.24em", color: TEAL }}>◢ PILOT</div>
        <div style={{ fontFamily: TITLE, fontSize: 16, letterSpacing: "0.04em", marginTop: 6 }}>{personalInfo.fullName}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#9fd2ff", marginTop: 3 }}>{heroContent.typewriterRoles[0]}</div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(223,217,255,0.65)", marginTop: 7, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, boxShadow: `0 0 7px ${dot}` }} />
          {personalInfo.location} · {personalInfo.availabilityStatus}
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "11px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Stat label="SCORE" value={score} accent="#f8c555" />
          <Stat label="CHARTED" value={`${charted}/${OBJECTIVE_TOTAL}`} accent={TEAL} />
          <Stat label="RANK" value={rank.label} accent="#c9b8ff" small />
        </div>
        <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 10 }}>
          <div style={{ height: "100%", width: `${Math.round((rank.count / rank.total) * 100)}%`, background: "linear-gradient(90deg,#915eff,#00cea8)" }} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 8, color: "rgba(223,217,255,0.5)", marginTop: 5 }}>
          {rank.next ? `${rank.remaining} to ${rank.next}` : "system fully charted"}
        </div>
      </div>

      {/* TARGET sensor MFD — top-right, tracks the nearest body live. */}
      <div style={{ position: "fixed", top: 14, right: 14, zIndex: 45, width: "min(300px, 25vw)", pointerEvents: "none",
        padding: "12px 14px 14px", borderRadius: 10,
        background: "linear-gradient(180deg, rgba(8,11,24,0.9), rgba(8,11,24,0.62))",
        border: "1px solid rgba(0,206,168,0.26)", borderTop: "1px solid rgba(0,206,168,0.5)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.22em", color: TEAL }}>◎ SENSORS · TARGET</span>
          {scanState && <ScanBadge state={scanState} />}
        </div>
        {content ? (
          <>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 7, gap: 8 }}>
              <span style={{ fontFamily: TITLE, fontSize: 15, letterSpacing: "0.03em" }}>{content.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#9fd2ff" }}>{Math.round(target.dist)}<span style={{ opacity: 0.6 }}>u</span></span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: content.color, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>{content.category}</div>
            <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", width: `${Math.round(THREE.MathUtils.clamp(1 - target.dist / 40, 0, 1) * 100)}%`,
                background: scanState === "charted" ? TEAL : scanState === "scanning" ? "#f8c555" : "#4a6fb0", transition: "width 0.12s linear" }} />
            </div>
            {content.facts && (
              <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 3 }}>
                {content.facts.distance && <Fact k="DISTANCE" v={content.facts.distance} />}
                {content.facts.diameter && <Fact k="DIAMETER" v={content.facts.diameter} />}
                {content.facts.gravity && <Fact k="GRAVITY" v={content.facts.gravity} />}
              </div>
            )}
            <div style={{ fontFamily: BODYF, fontSize: 11, color: "rgba(255,255,255,0.84)", lineHeight: 1.5, marginTop: 9 }}>
              {content.facts?.wow || content.info}
            </div>
            {content.section && (
              <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.1em", color: scanState === "charted" ? TEAL : "rgba(0,206,168,0.6)", marginTop: 9 }}>
                ▸ {content.section.toUpperCase()} {scanState === "charted" ? "LOGGED ✓" : "— FLY CLOSER"}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 12, lineHeight: 1.6 }}>ACQUIRING…</div>
        )}
      </div>

      {/* Center instrument cluster — velocity, throttle, control legend, READ. */}
      <div style={{ position: "fixed", left: "50%", bottom: 10, transform: "translateX(-50%)", zIndex: 46,
        display: "flex", alignItems: "flex-end", gap: 18, pointerEvents: "none" }}>
        {/* velocity gauge */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.2em", color: "rgba(223,217,255,0.6)" }}>VELOCITY</div>
          <div style={{ fontFamily: TITLE, fontSize: 22, color: "#fff", lineHeight: 1.1, marginTop: 2 }}><span ref={velRef}>000</span><span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(223,217,255,0.6)", marginLeft: 3 }}>m/s</span></div>
          <div style={{ width: 96, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginTop: 4 }}>
            <div ref={velBarRef} style={{ height: "100%", width: "0%", background: "linear-gradient(90deg,#00cea8,#f8c555)" }} />
          </div>
        </div>
        {/* control legend + escape */}
        <div style={{ textAlign: "center", paddingBottom: 2 }}>
          <div style={{ display: "flex", gap: 7, justifyContent: "center", fontFamily: MONO, fontSize: 8.5, color: "rgba(223,217,255,0.78)" }}>
            <Key>WASD</Key><span style={{ opacity: 0.5 }}>move</span>
            <Key>MOUSE</Key><span style={{ opacity: 0.5 }}>look</span>
            <Key>SHIFT</Key><span style={{ opacity: 0.5 }}>boost</span>
          </div>
          <button onClick={onReadMode} aria-label="Switch to read mode (résumé)"
            style={{ marginTop: 8, cursor: "pointer", pointerEvents: "auto", padding: "5px 14px", borderRadius: 7, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.82)", fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em" }}>▤ READ RÉSUMÉ</button>
        </div>
      </div>

      {/* Engage-look hint — shows until the canopy has the mouse. */}
      {!locked && (
        <div style={{ position: "fixed", top: "calc(50% + 58px)", left: "50%", transform: "translateX(-50%)", zIndex: 44, pointerEvents: "none",
          fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)", textShadow: "0 1px 8px rgba(0,0,0,0.9)",
          padding: "5px 12px", borderRadius: 999, border: "1px solid rgba(0,206,168,0.4)", background: "rgba(0,206,168,0.1)", animation: "stellarStatusPulse 2.4s ease-in-out infinite" }}>
          ◎ CLICK TO LOOK · ESC RELEASES
        </div>
      )}
    </>
  );
};

const Stat = ({ label, value, accent, small }) => (
  <div>
    <div style={{ fontFamily: MONO, fontSize: 7.5, letterSpacing: "0.14em", color: "rgba(223,217,255,0.6)" }}>{label}</div>
    <div style={{ fontFamily: small ? TITLE : MONO, fontSize: small ? 11 : 16, fontWeight: 600, color: accent, marginTop: 2, textTransform: small ? "uppercase" : "none", letterSpacing: small ? "0.03em" : 0 }}>{value}</div>
  </div>
);

const Fact = ({ k, v }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontFamily: MONO, fontSize: 9 }}>
    <span style={{ color: "rgba(223,217,255,0.5)" }}>{k}</span>
    <span style={{ color: "#fff" }}>{v}</span>
  </div>
);

const Key = ({ children }) => (
  <span style={{ padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", letterSpacing: "0.06em" }}>{children}</span>
);

const SCAN = {
  approach: { t: "○ APPROACH", c: "#9fd2ff" },
  scanning: { t: "◉ SCANNING", c: "#f8c555" },
  charted: { t: "● CHARTED", c: "#00cea8" },
};
const ScanBadge = ({ state }) => {
  const s = SCAN[state];
  return <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em", color: s.c, animation: state === "scanning" ? "stellarStatusPulse 1s ease-in-out infinite" : "none" }}>{s.t}</span>;
};

export default GameCockpit;
