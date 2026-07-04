"use client";
/*
 * Hobbies (Uranus) — cursor-tracked tilt bento per the taste-stack table.
 *
 *   "Cursor-tracked spring rotateX/rotateY on each cell (subtle, ±4°);
 *    hover reveals a long-form callout without disturbing the grid;
 *    one cell is a 'wildcard' that plays a lottie glyph."
 *
 * Layout:
 *   - 4-col × 2-row bento grid, 8 hobby cells. All cells the same
 *     footprint so the grid doesn't reflow on hover.
 *   - The Music cell is the "wildcard" — instead of a static emoji,
 *     it plays an animated waveform SVG (Lottie substitute — GPU
 *     cheap and matches the mono/hairline vocabulary of the rest of
 *     the tour).
 *
 * Motion:
 *   - Each cell has cursor-tracked tilt: rotateX/rotateY driven by
 *     useMotionValue + useSpring, clamped to ±4°. transformStyle
 *     preserve-3d + parent perspective so the tilt reads as
 *     physical. Cursor leaves → spring back to 0.
 *   - Hover reveals a detail overlay INSIDE the cell (crossfade over
 *     the tagline). Overlay contains long-form detail + stat + tag
 *     chips. Grid doesn't grow — the overlay sits within existing
 *     dimensions.
 *   - Reduced motion → tilt disabled, hover crossfade instant.
 */
import { useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { hobbies, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.hobbies || { sub: "Beyond the Code", heading: "Hobbies & Interests" };

const WILDCARD_NAME = "Music";

/* Waveform visualizer — 8 vertical bars, each independently animated
   with an oscillating height. Reads like a mini equalizer / audio
   visualizer. GPU-cheap since only `y` and `height` animate, no layout. */
const WAVEFORM_BARS = Array.from({ length: 8 }, (_, i) => i);
const barHeights = (i) => {
  const patterns = [
    [4, 14, 6, 12, 4, 10, 6, 12, 4],
    [6, 10, 14, 8, 4, 12, 6, 10, 6],
    [4, 12, 8, 14, 10, 6, 12, 4, 6],
    [8, 4, 12, 6, 14, 8, 4, 10, 8],
  ];
  return patterns[i % patterns.length];
};

const Waveform = ({ reduce }) => (
  <svg aria-hidden viewBox="0 0 80 20" style={{ width: "clamp(48px, 4vw, 68px)", height: "auto" }}>
    {WAVEFORM_BARS.map((i) => {
      const seq = barHeights(i);
      const ys = seq.map((h) => 10 - h / 2);
      return (
        <motion.rect
          key={i}
          x={i * 9 + 4}
          width={4}
          rx={1.5}
          fill="var(--v3-accent)"
          initial={reduce ? { y: 8, height: 4 } : { y: ys[0], height: seq[0] }}
          animate={reduce ? { y: 8, height: 4 } : { y: ys, height: seq }}
          transition={reduce ? undefined : {
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.09,
          }}
          style={{ filter: "drop-shadow(0 0 4px color-mix(in oklab, var(--v3-accent) 60%, transparent))" }}
        />
      );
    })}
  </svg>
);

/*
 * TiltCell — one bento cell with cursor-tracked spring tilt + hover
 * detail overlay.
 */
const TiltCell = ({ h, i, reduce }) => {
  /* Track pointer as normalized [-0.5, 0.5] within the cell's bounding
     box; then map to a rotation range. useSpring smooths the raw value
     so the tilt feels physical, not artificial. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-4, 4]), { stiffness: 220, damping: 22 });

  const onMove = (e) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => { px.set(0); py.set(0); };

  const isWildcard = h.name === WILDCARD_NAME;
  const revealDelay = 0.05 + i * 0.06;

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: revealDelay }}
      className="v3-hobby-cell"
      style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        gap: "clamp(6px, 0.6vw, 12px)",
        padding: "clamp(12px, 1.1vw, 20px) clamp(14px, 1.2vw, 22px)",
        border: "1px solid var(--v3-line)",
        borderRadius: 8,
        background: "color-mix(in oklab, var(--v3-bg-void) 60%, transparent)",
        minWidth: 0, minHeight: 0,
        cursor: "pointer",
        transformStyle: "preserve-3d",
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        willChange: reduce ? "auto" : "transform",
      }}
    >
      {/* Top row: emoji/waveform + tags */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, minWidth: 0 }}>
        {isWildcard ? (
          <Waveform reduce={reduce} />
        ) : (
          <span aria-hidden style={{
            fontSize: "clamp(1.7rem, 1.4vw + 0.7rem, 2.6rem)",
            lineHeight: 1,
            filter: "drop-shadow(0 0 8px color-mix(in oklab, var(--v3-accent) 24%, transparent))",
          }}>{h.icon}</span>
        )}
        {h.stat && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, minWidth: 0 }}>
            <span style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(0.95rem, 0.55vw + 0.5rem, 1.25rem)",
              lineHeight: 1, letterSpacing: "-.01em",
              color: "var(--v3-accent)", fontOpticalSizing: "auto",
              fontVariantNumeric: "tabular-nums",
            }}>{h.stat.value}</span>
            <span style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400,
              fontSize: "clamp(8px, 0.25vw + 5px, 9.5px)",
              letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              whiteSpace: "nowrap",
            }}>{h.stat.label}</span>
          </div>
        )}
      </div>

      {/* Name + tagline — visible by default, fades out on hover behind the overlay */}
      <div className="v3-hobby-default" style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1rem, 0.55vw + 0.55rem, 1.3rem)",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
          overflowWrap: "anywhere",
        }}>{h.name}</h3>
        <span style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(0.75rem, 0.28vw + 0.5rem, 0.85rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.45,
          overflowWrap: "break-word",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{h.tagline}</span>
      </div>

      {/* Hover-reveal detail overlay — sits over the "default" block,
          faded in on parent :hover. Same footprint, no grid disturbance. */}
      <div className="v3-hobby-detail" style={{
        position: "absolute",
        inset: "auto clamp(14px, 1.2vw, 22px) clamp(12px, 1.1vw, 20px) clamp(14px, 1.2vw, 22px)",
        display: "flex", flexDirection: "column", gap: "clamp(6px, 0.55vw, 10px)",
        opacity: 0,
        transform: "translateY(4px)",
        transition: "opacity .28s var(--v3-ease-smooth), transform .28s var(--v3-ease-smooth)",
        pointerEvents: "none",
        minWidth: 0,
      }}>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(0.95rem, 0.5vw + 0.5rem, 1.2rem)",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
        }}>{h.name}</h3>
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(0.72rem, 0.25vw + 0.5rem, 0.82rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{h.detail}</p>
        {(h.tags || []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {(h.tags || []).map((t, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(7.5px, 0.22vw + 5.5px, 9px)",
                letterSpacing: ".08em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "1px clamp(5px, 0.5vw, 8px)",
                whiteSpace: "nowrap",
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function HobbiesSection({ index, bootNonce }) {
  const list = useMemo(() => hobbies || [], []);
  const reduce = useReducedMotion();

  return (
    <V3Frame
      section="Hobbies"
      planet="URANUS"
      index={index}
      scanDir="radial"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 20px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)",
        height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.5rem, 1.1vw + 0.9rem, 2.3rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Bento grid — 4 × 2 uniform cells, perspective on the container
            so each child's rotateX/rotateY reads as 3D not skew. */}
        <V3Scan variant="radial" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{
            width: "100%", height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gridTemplateRows: "1fr 1fr",
            gap: "clamp(10px, 1vw, 16px)",
            perspective: 1200,
            minWidth: 0, minHeight: 0,
          }}>
            {list.map((h, i) => (
              <TiltCell key={h.name + i} h={h} i={i} reduce={reduce} />
            ))}
          </div>
        </V3Scan>

        {/* Hover CSS — crossfade default → detail on hover of the cell.
            Scoped via `.v3-hobby-cell` so no other card picks it up.
            `!important` beats the inline `opacity: 0` / `transform` on the
            overlay's style prop (inline styles otherwise win over class
            rules). `pointerEvents` toggle so tag chips inside the overlay
            aren't clickable when it's hidden. */}
        <style>{`
          .v3-hobby-cell:hover .v3-hobby-default { opacity: 0 !important; transition: opacity .22s var(--v3-ease-smooth); }
          .v3-hobby-cell:hover .v3-hobby-detail  { opacity: 1 !important; transform: translateY(0) !important; pointer-events: auto !important; }
          .v3-hobby-cell:focus-visible { outline: 1px solid var(--v3-accent); outline-offset: 3px; }
        `}</style>
      </div>
    </V3Frame>
  );
}
