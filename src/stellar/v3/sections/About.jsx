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
  <div style={{ padding: "8px 0", borderTop: "1px solid var(--v3-line)", display: "grid", gridTemplateColumns: "6rem 1fr", alignItems: "baseline", gap: 12 }}>
    <span style={{ font: "400 10px var(--v3-font-mono)", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>{label}</span>
    <span style={{ font: "340 .95rem var(--v3-font-display)", letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto" }}>{children}</span>
  </div>
);

const Stat = ({ big, valueFontSize, value, suffix, label, sub, decimals }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
    <div style={{ font: `340 ${valueFontSize} var(--v3-font-display)`, lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)", fontOpticalSizing: "auto" }}>
      <V3Ticker value={value} suffix={suffix || ""} decimals={decimals} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ font: `400 ${big ? "11px" : "10px"} var(--v3-font-mono)`, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>{label}</div>
      {sub && <div style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.4, maxWidth: big ? "34ch" : "26ch" }}>{sub}</div>}
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
      {/* LEFT — everything stacks here */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 22, minWidth: 0, overflow: "hidden", maxWidth: "58vw" }}>
        {/* Portrait + name */}
        <V3DepthLayer depth={2} style={{ display: "flex", gap: 20, alignItems: "flex-end", minWidth: 0 }}>
          <V3Scan variant="horizontal" delay={0.05}>
            <div
              role="img"
              aria-label={`Portrait of ${personalInfo.fullName}`}
              style={{
                width: 152, height: 200, flexShrink: 0, borderRadius: 12,
                backgroundImage: `url(${heroPhoto})`,
                backgroundSize: "180% auto",
                backgroundPosition: "42% 8%",
                backgroundRepeat: "no-repeat",
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid var(--v3-accent)",
                boxShadow: "0 0 32px color-mix(in oklab, var(--v3-accent) 22%, transparent)",
              }}
            />
          </V3Scan>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 0, height: 200, paddingBottom: 4 }}>
            <V3Scan variant="horizontal" delay={0.12}>
              <div style={{ font: "400 10px var(--v3-font-mono)", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginBottom: 10 }}>
                {personalInfo.role}
              </div>
            </V3Scan>
            <V3Scan variant="horizontal" delay={0.18}>
              <h1 style={{ fontFamily: "var(--v3-font-display)", fontWeight: 340, fontSize: "clamp(2.6rem, 5vw, 4.6rem)", fontOpticalSizing: "auto", lineHeight: 0.92, letterSpacing: "-.03em", color: "var(--v3-fg)", margin: 0 }}>
                {FIRST}
                <span style={{ display: "block", fontStyle: "italic", fontWeight: 380, color: "var(--v3-accent)" }}>{LAST}</span>
              </h1>
            </V3Scan>
          </div>
        </V3DepthLayer>

        {/* Overview lede */}
        <V3Scan variant="horizontal" delay={0.24}>
          <div style={{ maxWidth: "70ch" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{ font: "400 10px var(--v3-font-mono)", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>Overview</span>
            </div>
            <p style={{ font: "300 var(--v3-type-body) var(--v3-font-ui)", color: "var(--v3-fg-dim)", lineHeight: 1.6, margin: 0 }}>
              {personalInfo.about}
            </p>
          </div>
        </V3Scan>

        {/* Availability + spec sheet, inline (side by side on desktop) */}
        <V3Scan variant="horizontal" delay={0.32}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "18px 32px", alignItems: "start", marginTop: 4 }}>
            {/* Availability pill */}
            <div>
              <div style={{ font: "400 10px var(--v3-font-mono)", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginBottom: 8 }}>
                Availability
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "10px 16px",
                border: "1px solid var(--v3-accent)",
                borderRadius: 999,
                background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)",
                font: "400 .82rem var(--v3-font-ui)",
                letterSpacing: ".01em",
                color: "var(--v3-fg)",
              }}>
                <span aria-hidden style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#7fe9cf",
                  boxShadow: "0 0 10px #7fe9cf, 0 0 0 3px color-mix(in oklab, #7fe9cf 24%, transparent)",
                }} />
                Open to roles
              </div>
              <div style={{ font: "300 var(--v3-type-cap) var(--v3-font-ui)", color: "var(--v3-fg-mute)", marginTop: 8, lineHeight: 1.45, maxWidth: "24ch" }}>
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

      {/* BOTTOM — full-width hero stat + supporting stats */}
      <div style={{ gridArea: "bottom", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, alignItems: "stretch", minWidth: 0, paddingTop: 8, borderTop: "1px solid var(--v3-line)" }}>
        <V3Scan variant="horizontal" delay={0.36}>
          <Stat
            big
            valueFontSize="clamp(3rem, 6vw, 4.6rem)"
            value={HERO_STAT.value}
            suffix={HERO_STAT.suffix || "%"}
            label={HERO_STAT.label}
            sub="p95 API latency: 5s → 200ms via Redis caching, connection pooling, query optimisation."
          />
        </V3Scan>
        <V3Scan variant="horizontal" delay={0.44}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, justifyContent: "center", borderLeft: "1px solid var(--v3-line)", paddingLeft: 22 }}>
            <Stat
              valueFontSize="clamp(1.4rem, 2.2vw, 2rem)"
              value={SUPPORT_A.value}
              suffix={SUPPORT_A.suffix || ""}
              label={SUPPORT_A.label}
              sub="Multi-tenant Python/FastAPI/gRPC platform on GKE."
            />
            <Stat
              valueFontSize="clamp(1.4rem, 2.2vw, 2rem)"
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
