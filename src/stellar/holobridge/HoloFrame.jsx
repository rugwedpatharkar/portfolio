/* eslint-disable react/no-unknown-property */
/*
 * Shared holographic panel chrome: bracket corners, scanline overlay, tinted glass
 * fill + border, and a perspective wrapper that consumes the parallax CSS vars
 * (--hx,--hy) so inner content tilts with the cursor. `booting` toggles the
 * assemble-in class. tint = "cyan" (facts) | "amber" (dossier).
 *
 * Boot / scanline-drift / glitch keyframes live in index.css (.holo-boot etc.);
 * this component is purely structural so it stays uniform across both panels.
 */
import { tintOf } from "./holoTokens";

export default function HoloFrame({ tint = "cyan", booting = false, depth = 0, children, style }) {
  const t = tintOf(tint);
  return (
    <div
      className={`holo-frame${booting ? " holo-boot" : ""}`}
      style={{
        position: "relative",
        borderRadius: 10,
        border: `1px solid ${t.line}`,
        background: t.bg,
        overflow: "hidden",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        transform: depth
          ? `perspective(900px) rotateY(calc(var(--hx, 0) * ${depth}deg)) rotateX(calc(var(--hy, 0) * ${-depth}deg))`
          : undefined,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {/* bracket corners */}
      <span style={{ position: "absolute", left: -1, top: -1, width: 12, height: 12, borderLeft: `1px solid ${t.bracket}`, borderTop: `1px solid ${t.bracket}` }} />
      <span style={{ position: "absolute", right: -1, top: -1, width: 12, height: 12, borderRight: `1px solid ${t.bracket}`, borderTop: `1px solid ${t.bracket}` }} />
      <span style={{ position: "absolute", left: -1, bottom: -1, width: 12, height: 12, borderLeft: `1px solid ${t.bracket}`, borderBottom: `1px solid ${t.bracket}` }} />
      <span style={{ position: "absolute", right: -1, bottom: -1, width: 12, height: 12, borderRight: `1px solid ${t.bracket}`, borderBottom: `1px solid ${t.bracket}` }} />
      {/* scanline overlay */}
      <div className="holo-scan" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: t.scan }} />
      {/* content (above scanlines) */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
