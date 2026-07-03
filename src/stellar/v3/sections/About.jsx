"use client";
/*
 * About (Sun) — the recruiter landing dossier.
 *
 * ALL content lives in the LEFT column (~55vw). The RIGHT half of the frame is
 * reserved for the smaller 3D planet + its hover-to-reveal telemetry card. Nothing
 * in the DOM overlaps the sphere's render area.
 *
 * LEFT column (top to bottom):
 *   - Portrait + Fraunces name-block (flush baseline)
 *   - "OVERVIEW" mono kicker + accent rule + editorial lede
 *   - Availability pill (Open to roles) + short sub
 *   - Compact spec sheet (Role / Based / Languages / Tenure) with hairline dividers
 *
 * BOTTOM strip (full width):
 *   - Hero stat 96% p95 cut + descriptor
 *   - Two supporting stats (31 services, 7+ vendors) stacked to the right
 */
import { personalInfo, heroContent } from "../../../content";
import { V3Frame, V3Scan, V3Ticker, V3DepthLayer } from "../primitives";
import heroPhoto from "../../../assets/hero-photo-1024.webp";

const [FIRST, ...REST] = (personalInfo.fullName || "").split(" ");
const LAST = REST.join(" ");

const HERO_STAT = heroContent?.stats?.find((s) => String(s.value).includes("96")) || heroContent?.stats?.[2] || { value: 96, suffix: "%", label: "p95 latency cut" };
const SUPPORT_A = heroContent?.stats?.[0] || { value: 31, suffix: "", label: "Services architected" };
const SUPPORT_B = heroContent?.stats?.[1] || { value: 7, suffix: "+", label: "PMS / hardware vendors" };

const Row = ({ label, children }) => (
  <div style={{ padding: "clamp(6px, 0.6vw, 10px) 0", borderTop: "1px solid var(--v3-line)", display: "grid", gridTemplateColumns: "minmax(4.5rem, 6rem) 1fr", alignItems: "baseline", gap: "clamp(8px, 1vw, 14px)", minWidth: 0 }}>
    <span style={{ fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.7vw + 0.15rem, 11px)", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>{label}</span>
    <span style={{ fontFamily: "var(--v3-font-display)", fontWeight: 340, fontSize: "clamp(0.85rem, 0.75vw + 0.35rem, .92rem)", letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto", overflowWrap: "anywhere", minWidth: 0 }}>{children}</span>
  </div>
);

const Stat = ({ big, valueFontSize, value, suffix, label, sub, decimals }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 0.7vw, 12px)", alignItems: "flex-start", minWidth: 0 }}>
    <div style={{
      fontFamily: "var(--v3-font-display)",
      fontWeight: 340,
      fontSize: valueFontSize,
      lineHeight: 1,
      letterSpacing: "-.02em",
      color: "var(--v3-fg)",
      fontOpticalSizing: "auto",
      overflowWrap: "anywhere",
    }}>
      <V3Ticker value={value} suffix={suffix || ""} decimals={decimals} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <div style={{
        fontFamily: "var(--v3-font-mono)",
        fontWeight: 400,
        fontSize: "clamp(10px, 0.55vw + 0.4rem, 13px)",
        letterSpacing: ".18em",
        textTransform: "uppercase",
        color: "var(--v3-fg-mute)",
        overflowWrap: "anywhere",
      }}>{label}</div>
      {sub && (
        <div style={{
          fontFamily: "var(--v3-font-ui)",
          fontWeight: 300,
          fontSize: "clamp(.82rem, 0.55vw + 0.55rem, .9rem)",
          color: "var(--v3-fg-dim)",
          lineHeight: 1.5,
          maxWidth: big ? "min(34ch, 42vw)" : "min(26ch, 32vw)",
          overflowWrap: "break-word",
        }}>{sub}</div>
      )}
    </div>
  </div>
);

export default function AboutSection({ index, bootNonce }) {
  return (
    <V3Frame
      section="About"
      planet="SOL"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
      /* LEFT column takes ~55% of the frame, holds ALL section content. The
         right ~45% is empty in DOM — reserved for the 3D planet + hover card
         so the sphere never has content overlapping it. */
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      {/* LEFT — everything stacks here. maxWidth 50vw so the column ends BEFORE
          the sun's actual left edge (~54% x with V3_HALF_ANGLE=12° + frameShift
          0.42×1.0) — no horizontal overlap with the sphere. */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: "clamp(10px, 0.9vw, 16px)", minWidth: 0, overflow: "auto", maxWidth: "min(50vw, 780px)" }}>
        {/* Portrait + name */}
        <V3DepthLayer depth={2} style={{ display: "flex", gap: "clamp(12px, 1.1vw, 18px)", alignItems: "flex-end", minWidth: 0, flexWrap: "wrap" }}>
          <V3Scan variant="horizontal" delay={0.05}>
            <div
              role="img"
              aria-label={`Portrait of ${personalInfo.fullName}`}
              style={{
                width: "clamp(110px, 9vw, 160px)",
                height: "clamp(146px, 12vw, 212px)",
                flexShrink: 0, borderRadius: 14,
                backgroundImage: `url(${heroPhoto})`,
                backgroundSize: "180% auto",
                backgroundPosition: "42% 8%",
                backgroundRepeat: "no-repeat",
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid var(--v3-accent)",
                boxShadow: "0 0 36px color-mix(in oklab, var(--v3-accent) 24%, transparent)",
              }}
            />
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

        {/* Overview lede */}
        <V3Scan variant="horizontal" delay={0.24}>
          <div style={{ maxWidth: "min(70ch, 48vw)", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 0.9vw, 14px)", marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ width: "clamp(16px, 1.6vw, 26px)", height: 1, background: "var(--v3-accent)" }} />
              <span style={{ fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.6vw + 0.2rem, 11px)", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>Overview</span>
            </div>
            <p style={{
              fontFamily: "var(--v3-font-ui)", fontWeight: 300,
              fontSize: "clamp(.85rem, 0.5vw + 0.5rem, .88rem)",
              color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0,
              overflowWrap: "break-word", hyphens: "auto",
              display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {personalInfo.about}
            </p>
          </div>
        </V3Scan>

        {/* Availability + spec sheet, inline (side by side on desktop) */}
        <V3Scan variant="horizontal" delay={0.32}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: "clamp(14px, 1.6vw, 24px) clamp(18px, 2.2vw, 36px)", alignItems: "start", marginTop: 4, minWidth: 0 }}>
            {/* Availability pill */}
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

            {/* Spec sheet */}
            <div style={{ borderBottom: "1px solid var(--v3-line)", minWidth: 0 }}>
              <Row label="Role">{personalInfo.role}</Row>
              <Row label="Based">{personalInfo.location}</Row>
              <Row label="Languages">{personalInfo.languages}</Row>
              <Row label="Tenure">{personalInfo.yearsExperience} yrs</Row>
            </div>
          </div>
        </V3Scan>
      </div>

      {/* BOTTOM — three stats in a single row (1 | 2 | 3), equal treatment,
          hairline separators between. Value size unified so they read as a
          spec sheet strip, not a hero + supporting. */}
      <div style={{ gridArea: "bottom", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 0, alignItems: "stretch", minWidth: 0, paddingTop: "clamp(10px, 1.1vw, 16px)", borderTop: "1px solid var(--v3-line)" }}>
        <V3Scan variant="horizontal" delay={0.36}>
          <div style={{ paddingRight: "clamp(14px, 1.8vw, 28px)", minWidth: 0 }}>
            <Stat
              valueFontSize="clamp(1.8rem, 1.2rem + 2.4vw, 3rem)"
              value={HERO_STAT.value}
              suffix={HERO_STAT.suffix || "%"}
              label={HERO_STAT.label}
              sub="p95 API latency: 5s → 200ms via Redis caching, connection pooling, query optimisation."
            />
          </div>
        </V3Scan>
        <V3Scan variant="horizontal" delay={0.4}>
          <div style={{ borderLeft: "1px solid var(--v3-line)", paddingLeft: "clamp(14px, 1.8vw, 28px)", paddingRight: "clamp(14px, 1.8vw, 28px)", minWidth: 0 }}>
            <Stat
              valueFontSize="clamp(1.8rem, 1.2rem + 2.4vw, 3rem)"
              value={SUPPORT_A.value}
              suffix={SUPPORT_A.suffix || ""}
              label={SUPPORT_A.label}
              sub="Multi-tenant Python/FastAPI/gRPC platform on GKE."
            />
          </div>
        </V3Scan>
        <V3Scan variant="horizontal" delay={0.44}>
          <div style={{ borderLeft: "1px solid var(--v3-line)", paddingLeft: "clamp(14px, 1.8vw, 28px)", minWidth: 0 }}>
            <Stat
              valueFontSize="clamp(1.8rem, 1.2rem + 2.4vw, 3rem)"
              value={SUPPORT_B.value}
              suffix={SUPPORT_B.suffix || "+"}
              label={SUPPORT_B.label}
              sub="Apaleo · Opera · Cloudbeds · RMS · Clock · Maxxton · ASSA ABLOY."
            />
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
