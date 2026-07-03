"use client";
/*
 * Contact (Blackhole finale) — HUD send channel.
 *
 * Final stop of the tour. The black hole scene remains as the framed
 * "phenomenon" (cosmicStops.js drives the render); the content is the
 * outbound send-channel + link rail.
 *
 * Layout follows the narrow-first / fill-vertical rule for content-heavy
 * sections, but expands LEFT to span cols 1+2 because Contact has TWO
 * co-equal columns inside (form + link rail) and needs the horizontal room:
 *   - LEFT rail: mono kicker + DM Serif Display heading + V3ContactForm.
 *   - RIGHT rail: 5 outbound link rows (Email · Book a Call · GitHub ·
 *     LinkedIn · Resume) with tick-arrow CTAs.
 */
import { contactLinks } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";
import V3ContactForm from "../V3ContactForm";

export default function ContactSection({ index, bootNonce }) {
  return (
    <V3Frame
      section="Contact"
      planet="THE EDGE"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
      /* Wider than the other narrow sections because Contact has two
         co-equal columns (form + link rail). 65vw fits both without either
         side feeling cramped. */
      gridAreas={`"top top top" "left left ." "left left ." "bottom bottom bottom"`}
    >
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 20, minWidth: 0, overflow: "hidden", maxWidth: "65vw", height: "100%" }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>Open a Channel</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              Let&rsquo;s talk
            </h2>
          </div>
        </V3Scan>

        {/* Two rails side-by-side: transmit form (LEFT) + links (RIGHT). */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 24,
          flex: 1, minHeight: 0, overflow: "hidden",
        }}>
          {/* Form panel */}
          <V3Scan variant="horizontal" delay={0.15} style={{
            display: "flex", flexDirection: "column",
            border: "1px solid var(--v3-line)",
            borderRadius: 6,
            background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
            padding: "16px 20px 20px",
            minHeight: 0,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
              <span aria-hidden style={{ width: 14, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>Transmit</span>
            </div>
            <V3ContactForm />
          </V3Scan>

          {/* Outbound link rail */}
          <V3Scan variant="horizontal" delay={0.22} style={{
            display: "flex", flexDirection: "column",
            border: "1px solid var(--v3-line)",
            borderRadius: 6,
            background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
            padding: "6px 16px",
            minHeight: 0, justifyContent: "space-between",
          }}>
            {(contactLinks || []).map((c, i) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                download={c.download || undefined}
                style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  alignItems: "baseline", gap: 10,
                  padding: "10px 4px",
                  borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
                  color: "var(--v3-fg)", textDecoration: "none",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--v3-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v3-fg)")}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                    letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                  }}>{c.label}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(.95rem, 1.05vw, 1.1rem)", fontOpticalSizing: "auto",
                    lineHeight: 1.2, letterSpacing: "-.005em", color: "inherit",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{c.value}</span>
                </div>
                <span aria-hidden style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 12,
                  letterSpacing: ".14em", color: "var(--v3-accent)", flexShrink: 0,
                }}>→</span>
              </a>
            ))}
          </V3Scan>
        </div>
      </div>
    </V3Frame>
  );
}
