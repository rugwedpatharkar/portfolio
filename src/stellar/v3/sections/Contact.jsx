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
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.4vh, 22px)",
        minWidth: 0, overflow: "auto",
        maxWidth: "min(65vw, 1100px)", height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 0.8vw, 14px)", marginBottom: "clamp(6px, 0.8vh, 12px)" }}>
              <span style={{ width: "clamp(16px, 1.4vw, 24px)", height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11.5px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>Open a Channel</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.7rem, 2.6vw, 2.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              Let&rsquo;s talk
            </h2>
          </div>
        </V3Scan>

        {/* Two rails side-by-side: transmit form (LEFT) + links (RIGHT).
            auto-fit + minmax(min(400px, 100%), 1fr) so that at very narrow /
            high-zoom viewports (where a 400px track doesn't fit twice) the
            grid collapses gracefully to a single vertical stack. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
          gap: "clamp(16px, 1.5vw, 28px)",
          flex: 1, minHeight: 0, overflow: "visible",
        }}>
          {/* Form panel */}
          <V3Scan variant="horizontal" delay={0.15} style={{
            display: "flex", flexDirection: "column",
            border: "1px solid var(--v3-line)",
            borderRadius: 6,
            background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
            padding: "clamp(14px, 1.4vw, 22px) clamp(16px, 1.6vw, 26px)",
            minHeight: 0, minWidth: 0,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(8px, 0.8vw, 14px)", marginBottom: "clamp(10px, 1vh, 16px)" }}>
              <span aria-hidden style={{ width: "clamp(10px, 1vw, 16px)", height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11.5px)",
                letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>Transmit</span>
            </div>
            <V3ContactForm />
          </V3Scan>

          {/* Outbound link rail — hairline-outlined "index cards" that read
              as a discoverable channel list, not a floating menu. Each row is a
              tight tile with numeral · label · value · arrow, hover flips the
              left border + arrow to accent for a signal-lock feel. Grouped
              tightly (no justify-content: space-between) so the rail reads as
              one panel of options rather than 5 scattered links. */}
          <V3Scan variant="horizontal" delay={0.22} style={{
            display: "flex", flexDirection: "column",
            border: "1px solid var(--v3-line)",
            borderRadius: 6,
            background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
            padding: "clamp(10px, 1vw, 16px)",
            gap: "clamp(6px, 0.6vw, 10px)",
            minHeight: 0, minWidth: 0, overflow: "auto",
          }}>
            <div style={{
              display: "flex", alignItems: "baseline",
              gap: "clamp(8px, 0.8vw, 14px)",
              paddingBottom: "clamp(6px, 0.6vw, 10px)",
              borderBottom: "1px solid var(--v3-line)",
              marginBottom: "clamp(2px, 0.3vw, 6px)",
            }}>
              <span aria-hidden style={{ width: "clamp(10px, 1vw, 16px)", height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11.5px)",
                letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>Direct Channels</span>
            </div>

            {(contactLinks || []).map((c, i) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                download={c.download || undefined}
                className="v3-contact-link"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) auto",
                  alignItems: "center",
                  gap: "clamp(10px, 1vw, 16px)",
                  padding: "clamp(9px, 0.85vw, 14px) clamp(10px, 0.9vw, 14px)",
                  border: "1px solid var(--v3-line)",
                  borderLeftWidth: 3, borderLeftColor: "var(--v3-line)",
                  borderRadius: 6,
                  color: "var(--v3-fg)", textDecoration: "none",
                  transition: "border-color .22s var(--v3-ease-smooth), background .22s var(--v3-ease-smooth), transform .22s var(--v3-ease-smooth)",
                  minWidth: 0, position: "relative",
                }}
              >
                {/* Numeral marker */}
                <span aria-hidden style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                  fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                  letterSpacing: ".14em",
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--v3-fg-mute)",
                  minWidth: "1.6em",
                }}>{String(i + 1).padStart(2, "0")}</span>

                {/* Label + value */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(8.5px, 0.4vw + 5px, 10.5px)",
                    letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                  }}>{c.label}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(0.9rem, 0.6vw + 0.45rem, 1.15rem)", fontOpticalSizing: "auto",
                    lineHeight: 1.2, letterSpacing: "-.005em", color: "inherit",
                    overflowWrap: "anywhere", wordBreak: "break-word", minWidth: 0,
                  }}>{c.value}</span>
                </div>

                {/* Arrow that slides right on hover (CSS transition on transform) */}
                <span aria-hidden className="v3-contact-arrow" style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                  fontSize: "clamp(11px, 0.5vw + 6px, 14px)",
                  letterSpacing: ".14em", color: "var(--v3-accent)", flexShrink: 0,
                  transition: "transform .22s var(--v3-ease-smooth), opacity .22s",
                  opacity: 0.6,
                  display: "inline-flex", alignItems: "center",
                }}>→</span>
              </a>
            ))}
            {/* Hover effect: accent left border + tint + arrow slide. Global
                style so we don't need JS mouseenter/leave. */}
            <style>{`
              .v3-contact-link:hover {
                border-left-color: var(--v3-accent) !important;
                background: color-mix(in oklab, var(--v3-accent) 5%, transparent);
              }
              .v3-contact-link:hover .v3-contact-arrow {
                transform: translateX(3px);
                opacity: 1;
              }
              .v3-contact-link:focus-visible {
                outline: 1px solid var(--v3-accent);
                outline-offset: 2px;
              }
            `}</style>
          </V3Scan>
        </div>
      </div>
    </V3Frame>
  );
}
