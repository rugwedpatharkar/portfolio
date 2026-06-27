import { useEffect, useRef, useState } from "react";
import { personalInfo } from "../content";

/*
 * PHASE 3C — Photo / cinematic mode. Press C (or the shutter button) to freeze the
 * system and frame a shot; CAPTURE composes a shareable POSTCARD — the rendered
 * frame (canvas-only, so the HUD never appears in it) + a cinematic vignette,
 * optional grain, and a stamp bar (name · current body · date · a deep-link that
 * reopens this view). Downloads a PNG and copies the link.
 *
 * Capture reads the WebGL canvas via toDataURL (preserveDrawingBuffer is on in
 * Scene). Freezing uses setTimeScale(0). Reduced-motion still allows stills.
 * (Free-camera focal-length controls + a QR image are deferred — the deep-link
 * URL on the postcard is the shareable hook for now.)
 */

const MONO = "'JetBrains Mono', monospace";
const DISP = "'Chakra Petch', sans-serif";
const C = "#8fcfff";

const fmtDate = () => {
  try {
    return new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

export default function PhotoMode({ bodyLabel = "Sol", setTimeScale }) {
  const [open, setOpen] = useState(false);
  const [grain, setGrain] = useState(false);
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState("");
  const wasScale = useRef(1);

  /* C toggles photo mode (ignored while typing). */
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
      if (typing) return;
      const k = e.key.toLowerCase();
      if (k === "c") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (k === "escape") {
        setOpen((v) => (v ? false : v));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Freeze the system while framing; restore on exit. */
  useEffect(() => {
    if (!setTimeScale) return undefined;
    if (open) {
      setTimeScale(0);
    } else {
      setTimeScale(wasScale.current || 1);
    }
    return undefined;
  }, [open, setTimeScale]);

  const capture = async () => {
    const cv = document.querySelector("canvas");
    if (!cv) return;
    const W = cv.width;
    const H = cv.height;
    const barH = Math.max(64, Math.round(H * 0.075));
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H + barH;
    const ctx = out.getContext("2d");

    ctx.drawImage(cv, 0, 0, W, H); // the rendered scene (no DOM HUD)

    /* cinematic vignette */
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    if (grain) {
      const tile = 140;
      const n = document.createElement("canvas");
      n.width = n.height = tile;
      const nc = n.getContext("2d");
      const img = nc.createImageData(tile, tile);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 90 + Math.floor(Math.random() * 120);
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 20;
      }
      nc.putImageData(img, 0, 0);
      const pat = ctx.createPattern(n, "repeat");
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W, H);
    }

    /* stamp bar */
    const pad = Math.round(W * 0.025);
    ctx.fillStyle = "#05070f";
    ctx.fillRect(0, H, W, barH);
    ctx.fillStyle = C;
    ctx.fillRect(0, H, W, 2);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "#eaf3ff";
    ctx.font = `700 ${Math.round(barH * 0.34)}px ${DISP}`;
    ctx.fillText(personalInfo.fullName.toUpperCase(), pad, H + barH * 0.37);
    ctx.fillStyle = "rgba(143,207,255,0.95)";
    ctx.font = `${Math.round(barH * 0.22)}px ${MONO}`;
    ctx.fillText(`STELLAR COMMAND · ${String(bodyLabel).toUpperCase()} · ${fmtDate()}`, pad, H + barH * 0.7);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(200,214,245,0.7)";
    ctx.font = `${Math.round(barH * 0.2)}px ${MONO}`;
    ctx.fillText(typeof location !== "undefined" ? location.href : "", W - pad, H + barH * 0.5);

    const url = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `stellar-${String(bodyLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    a.click();

    try {
      await navigator.clipboard?.writeText(location.href);
      setToast("Postcard saved · link copied");
    } catch {
      setToast("Postcard saved");
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    setTimeout(() => setToast(""), 2600);
  };

  if (!open) return null;

  return (
    <>
      {/* shutter flash */}
      {flash && <div style={{ position: "fixed", inset: 0, zIndex: 95, background: "#eaf4ff", opacity: 0.85, pointerEvents: "none", animation: "scShutter 220ms ease-out both" }} />}
      <style>{`@keyframes scShutter { 0% { opacity: 0.85 } 100% { opacity: 0 } }`}</style>

      {/* framing corners — cinematic guide */}
      {["tl", "tr", "bl", "br"].map((k) => {
        const pos = { tl: { top: 18, left: 18 }, tr: { top: 18, right: 18 }, bl: { bottom: 92, left: 18 }, br: { bottom: 92, right: 18 } }[k];
        const flip = { tl: "0,0", tr: "1,0", bl: "0,1", br: "1,1" }[k];
        const [fx, fy] = flip.split(",").map(Number);
        return (
          <svg key={k} width="34" height="34" style={{ position: "fixed", zIndex: 90, pointerEvents: "none", ...pos, transform: `scale(${fx ? -1 : 1}, ${fy ? -1 : 1})` }}>
            <path d="M2 16 L2 2 L16 2" fill="none" stroke={C} strokeWidth="2" opacity="0.8" />
          </svg>
        );
      })}

      {/* photo bar */}
      <div style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)", zIndex: 92, display: "flex", alignItems: "center", gap: 12, background: "rgba(8,12,24,0.7)", border: `1px solid ${C}40`, borderRadius: 999, padding: "8px 12px", backdropFilter: "blur(10px)" }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: C, paddingLeft: 6 }}>◉ PHOTO&nbsp;MODE</span>
        <button onClick={capture} style={{ all: "unset", cursor: "pointer", fontFamily: DISP, fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", color: "#05070f", background: C, borderRadius: 999, padding: "8px 18px" }}>◍ CAPTURE</button>
        <button onClick={() => setGrain((v) => !v)} style={{ all: "unset", cursor: "pointer", fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: grain ? C : "rgba(200,214,245,0.6)", border: `1px solid ${grain ? C : "rgba(200,214,245,0.25)"}`, borderRadius: 999, padding: "6px 12px" }}>GRAIN {grain ? "ON" : "OFF"}</button>
        <button onClick={() => setOpen(false)} aria-label="Close photo mode" style={{ all: "unset", cursor: "pointer", fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "rgba(200,214,245,0.7)", padding: "6px 10px" }}>ESC ✕</button>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 78, left: "50%", transform: "translateX(-50%)", zIndex: 92, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: C, background: "rgba(8,12,24,0.8)", border: `1px solid ${C}40`, borderRadius: 999, padding: "6px 14px" }}>{toast}</div>
      )}
    </>
  );
}
