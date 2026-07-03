"use client";
/*
 * About (Sun) — the recruiter landing dossier.
 *
 * The Sun is ~109× Earth's radius at true scale, so its 3D render eats a
 * huge chunk of the right side of the frame. All About content lives in
 * grid column 1 only (LEFT-LEFT-. → LEFT-.-.). The Sun + Body Telemetry
 * corner card own columns 2+3 uncontested. Previous "3-stat rail"
 * duplicated FunFacts numbers AND collided with the Sun's corona; deleted.
 *
 * LEFT column (top to bottom):
 *   - Portrait + Fraunces name-block (flush baseline)
 *   - "OVERVIEW" mono kicker + accent rule + editorial lede with drop-cap
 *   - Availability pill (Open to roles) + spec sheet (Role/Based/…)
 *
 * Signature moment: Fraunces drop-cap on the overview + scroll-linked
 * portrait parallax + hairline registration ticks at each portrait corner.
 */
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";
import { personalInfo } from "../../../content";
import { V3Frame, V3Scan, V3DepthLayer } from "../primitives";
import heroPhoto from "../../../assets/hero-photo-1024.webp";

/*
 * Corner registration ticks — hairline SVG arms in each corner of a
 * container. Reads as photographic-plate registration marks. Positioned
 * absolutely so the parent just needs `position: relative`.
 */
const RegistrationTicks = ({ arm = 10, inset = -1, color = "var(--v3-line-strong)" }) => (
  <>
    {[
      { top: inset, left: inset, d: `M0 ${arm} L0 0 L${arm} 0` },
      { top: inset, right: inset, d: `M${arm} ${arm} L${arm} 0 L0 0`, transform: `translateX(-${arm}px)` },
      { bottom: inset, left: inset, d: `M0 0 L0 ${arm} L${arm} ${arm}` },
      { bottom: inset, right: inset, d: `M${arm} 0 L${arm} ${arm} L0 ${arm}` },
    ].map((c, i) => (
      <svg key={i} aria-hidden width={arm + 1} height={arm + 1} viewBox={`0 0 ${arm + 1} ${arm + 1}`}
        style={{ position: "absolute", top: c.top, left: c.left, right: c.right, bottom: c.bottom, pointerEvents: "none" }}>
        <path d={c.d} stroke={color} strokeWidth="1" fill="none" />
      </svg>
    ))}
  </>
);

const [FIRST, ...REST] = (personalInfo.fullName || "").split(" ");
const LAST = REST.join(" ");

const Row = ({ label, children }) => (
  <div style={{ padding: "clamp(6px, 0.6vw, 10px) 0", borderTop: "1px solid var(--v3-line)", display: "grid", gridTemplateColumns: "minmax(4.5rem, 6rem) 1fr", alignItems: "baseline", gap: "clamp(8px, 1vw, 14px)", minWidth: 0 }}>
    <span style={{ fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.7vw + 0.15rem, 11px)", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>{label}</span>
    <span style={{ fontFamily: "var(--v3-font-display)", fontWeight: 340, fontSize: "clamp(0.85rem, 0.75vw + 0.35rem, .92rem)", letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto", overflowWrap: "anywhere", minWidth: 0 }}>{children}</span>
  </div>
);

export default function AboutSection({ index, bootNonce }) {
  /*
   * Signature moment — scroll-linked portrait parallax.
   *
   * useScroll targets the About section's outer DOM node with "start end"
   * → "end start" offset. In the GSAP-pinned tour the target remains
   * near-stationary while the user scrolls through the pin range, so
   * scrollYProgress advances gradually across the stop. useSpring smooths
   * the raw progress into a physical camera glide. Reduced-motion users
   * get a static portrait.
   */
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [-24, 24]);
  const y = useSpring(rawY, { stiffness: 120, damping: 22, restDelta: 0.001 });

  return (
    <V3Frame
      section="About"
      planet="SOL"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
      /* Content lives in the standard 60% LEFT band (cols 1+2, the 40+20%
         grid halves merged into one content area). Col 3 (40%) is reserved
         for the Sun's 3D render + Body Telemetry corner card. */
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div ref={sectionRef} style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(14px, 1.2vw, 24px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        paddingRight: "clamp(4px, 0.5vw, 8px)",
        maxWidth: "min(60vw, 1200px)", height: "100%",
      }}>
        {/* Portrait + name */}
        <V3DepthLayer depth={2} style={{ display: "flex", gap: "clamp(12px, 1.1vw, 18px)", alignItems: "flex-end", minWidth: 0, flexWrap: "wrap" }}>
          <V3Scan variant="horizontal" delay={0.05}>
            {/* Portrait plate — position:relative so registration ticks anchor
                to each corner. The plate itself is a motion.div driven by a
                scroll-linked, spring-smoothed y so the whole photograph
                translates as the user scrolls through the About stop. */}
            <div
              style={{
                position: "relative",
                width: "clamp(110px, 9vw, 160px)",
                height: "clamp(146px, 12vw, 212px)",
                flexShrink: 0,
              }}
            >
              <motion.div
                role="img"
                aria-label={`Portrait of ${personalInfo.fullName}`}
                style={{
                  y: reduce ? 0 : y,
                  width: "100%", height: "100%",
                  borderRadius: 14,
                  backgroundImage: `url(${heroPhoto})`,
                  backgroundSize: "180% auto",
                  backgroundPosition: "42% 8%",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--v3-accent)",
                  boxShadow: "0 0 36px color-mix(in oklab, var(--v3-accent) 24%, transparent)",
                  willChange: reduce ? "auto" : "transform",
                }}
              />
              <RegistrationTicks arm={10} inset={-2} color="var(--v3-line-strong)" />
            </div>
          </V3Scan>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 0, flex: "1 1 220px", height: "clamp(146px, 12vw, 212px)", paddingBottom: 2 }}>
            <V3Scan variant="horizontal" delay={0.12}>
              <div style={{
                fontFamily: "var(--v3-font-mono)",
                fontWeight: 400,
                fontSize: "clamp(10px, 0.5vw + 0.35rem, 13px)",
                letterSpacing: ".24em",
                textTransform: "uppercase",
                color: "var(--v3-fg-dim)",
                marginBottom: "clamp(4px, 0.5vw, 8px)",
                overflowWrap: "anywhere",
              }}>
                {personalInfo.role}
              </div>
            </V3Scan>
            <V3Scan variant="horizontal" delay={0.18}>
              <h1 style={{ fontFamily: "var(--v3-font-display)", fontWeight: 340, fontSize: "clamp(1.7rem, 1.2rem + 2vw, 3.2rem)", fontOpticalSizing: "auto", lineHeight: 0.95, letterSpacing: "-.03em", color: "var(--v3-fg)", margin: 0, overflowWrap: "break-word" }}>
                {FIRST}
                <span style={{ display: "block", fontStyle: "italic", fontWeight: 380, color: "var(--v3-accent)" }}>{LAST}</span>
              </h1>
            </V3Scan>
          </div>
        </V3DepthLayer>

        {/* Overview lede — Fraunces drop-cap on the opening paragraph.
            Editorial cue that this is the primary voice, not marketing copy.
            `::first-letter` targets grapheme 1 in every supported browser;
            falls back gracefully. Scoped via `.v3-about-lede` so no other
            paragraph inherits the drop-cap. */}
        <V3Scan variant="horizontal" delay={0.24}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 0.9vw, 14px)", marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ width: "clamp(16px, 1.6vw, 26px)", height: 1, background: "var(--v3-accent)" }} />
              <span style={{ fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.6vw + 0.2rem, 11px)", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>Overview</span>
            </div>
            <p className="v3-about-lede" style={{
              fontFamily: "var(--v3-font-ui)", fontWeight: 300,
              fontSize: "clamp(.9rem, 0.5vw + 0.55rem, 1rem)",
              color: "var(--v3-fg-dim)", lineHeight: 1.6, margin: 0,
              overflowWrap: "break-word", hyphens: "auto",
            }}>
              {personalInfo.about}
            </p>
            <style>{`
              .v3-about-lede::first-letter {
                font-family: var(--v3-font-display);
                font-weight: 340;
                font-size: 3.6em;
                line-height: 0.82;
                float: left;
                padding: 0.06em 0.14em 0 0;
                margin-right: 0.02em;
                color: var(--v3-fg);
                font-optical-sizing: auto;
                letter-spacing: -0.02em;
              }
            `}</style>
          </div>
        </V3Scan>

        {/* Availability + spec sheet, inline (side by side on desktop) */}
        <V3Scan variant="horizontal" delay={0.32}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: "clamp(14px, 1.6vw, 24px) clamp(18px, 2.2vw, 36px)", alignItems: "start", marginTop: 4, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.6vw + 0.2rem, 11px)", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginBottom: 8 }}>
                Availability
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "clamp(8px, 0.8vw, 12px) clamp(12px, 1.4vw, 18px)",
                border: "1px solid var(--v3-accent)",
                borderRadius: 999,
                background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)",
                fontFamily: "var(--v3-font-ui)",
                fontWeight: 400,
                fontSize: "clamp(.72rem, 0.5vw + 0.45rem, .78rem)",
                letterSpacing: ".01em",
                color: "var(--v3-fg)",
                maxWidth: "100%",
              }}>
                <span aria-hidden style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: "#7fe9cf",
                  boxShadow: "0 0 10px #7fe9cf, 0 0 0 3px color-mix(in oklab, #7fe9cf 24%, transparent)",
                }} />
                Open to roles
              </div>
              <div style={{ fontFamily: "var(--v3-font-ui)", fontWeight: 300, fontSize: "var(--v3-type-cap)", color: "var(--v3-fg-mute)", marginTop: 8, lineHeight: 1.45, maxWidth: "min(24ch, 100%)", overflowWrap: "break-word" }}>
                Responds within 24h · Remote or Pune
              </div>
            </div>

            <div style={{ borderBottom: "1px solid var(--v3-line)", minWidth: 0 }}>
              <Row label="Role">{personalInfo.role}</Row>
              <Row label="Based">{personalInfo.location}</Row>
              <Row label="Languages">{personalInfo.languages}</Row>
              <Row label="Tenure">{personalInfo.yearsExperience} yrs</Row>
            </div>
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
