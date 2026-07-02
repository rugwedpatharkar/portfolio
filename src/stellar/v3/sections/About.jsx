"use client";
/*
 * About (Sun) — Cinematic hero. Big Fraunces name (V3Callout) with italic accent
 * surname in the top-left. Portrait as a scanned foreground layer. Right column:
 * role/location/languages channels. Bottom strip: TENURE / PLATFORM / UPTIME as
 * three ticker channels. Scan direction: horizontal wipe.
 */
import { personalInfo, heroContent } from "../../../content";
import { V3Frame, V3Callout, V3Channel, V3Ticker, V3Schematic, V3DepthLayer } from "../primitives";
import heroPhoto from "../../../assets/hero-photo-1024.webp";

const [FIRST, ...REST] = (personalInfo.fullName || "").split(" ");
const LAST = REST.join(" ");

export default function AboutSection({ index, bootNonce }) {
  return (
    <V3Frame section="About" planet="SOL" index={index} scanDir="horizontal" scanKey={bootNonce}>
      {/* LEFT — headline + tagline */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <V3DepthLayer depth={2} style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
          <div
            role="img"
            aria-label={personalInfo.fullName}
            style={{
              width: 112, height: 112, flexShrink: 0, borderRadius: 14,
              backgroundImage: `url(${heroPhoto})`,
              backgroundSize: "150% auto",
              backgroundPosition: "39% 6%",
              backgroundRepeat: "no-repeat",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid var(--v3-accent)",
              boxShadow: "0 0 26px color-mix(in oklab, var(--v3-accent) 24%, transparent)",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <V3Callout size="s6" style={{ maxWidth: "10ch" }}>
              {FIRST}<br />
              <em style={{ fontStyle: "italic", fontWeight: 380, color: "var(--v3-accent)" }}>{LAST}</em>
            </V3Callout>
          </div>
        </V3DepthLayer>
        <V3DepthLayer depth={1}>
          <p style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.6, margin: 0, maxWidth: "58ch" }}>
            {personalInfo.about}
          </p>
        </V3DepthLayer>
      </div>

      {/* RIGHT-TOP — role / location / languages channels */}
      <div style={{ gridArea: "right-top", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <V3Channel label="Role" scanDelay={0.2}>{personalInfo.role}</V3Channel>
        <V3Channel label="Based" scanDelay={0.24}>{personalInfo.location}</V3Channel>
        <V3Channel label="Languages" scanDelay={0.28}>{personalInfo.languages}</V3Channel>
        <V3Channel label="Availability" scanDelay={0.32}>
          <span style={{ color: "#7fe9cf" }}>{heroContent?.tagline ? "Open to roles" : "—"}</span>
        </V3Channel>
      </div>

      {/* BOTTOM — three hero tickers */}
      <div style={{ gridArea: "bottom", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, minWidth: 0 }}>
        <V3Schematic label="Tenure" scanDelay={0.36}>
          <div style={{ font: `340 2rem var(--v3-font-display)`, letterSpacing: "-.01em", color: "var(--v3-fg)" }}>
            <V3Ticker value={2} suffix="+ yrs" decimals={0} />
          </div>
        </V3Schematic>
        <V3Schematic label="Platform" scanDelay={0.4}>
          <div style={{ font: `340 2rem var(--v3-font-display)`, letterSpacing: "-.01em", color: "var(--v3-fg)" }}>
            <V3Ticker value={31} suffix=" services" decimals={0} />
          </div>
        </V3Schematic>
        <V3Schematic label="Uptime" scanDelay={0.44}>
          <div style={{ font: `340 2rem var(--v3-font-display)`, letterSpacing: "-.01em", color: "var(--v3-fg)" }}>
            <V3Ticker value={99.9} suffix="%" decimals={1} />
          </div>
        </V3Schematic>
      </div>
    </V3Frame>
  );
}
