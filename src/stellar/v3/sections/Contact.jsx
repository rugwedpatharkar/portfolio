"use client";
/*
 * Contact (finale) — HUD send channel. Left: existing V3ContactForm inside a
 * large V3Schematic "TRANSMIT" panel. Right: 5 outbound links as V3Channel rows
 * (Email, Book a Call, GitHub, LinkedIn, Resume) with tick-arrow CTAs. Foreground:
 * V3Callout "Open a channel." — the giant serif invitation. Scan: horizontal.
 */
import { contactLinks } from "../../../content";
import { V3Frame, V3Callout, V3Schematic, V3Channel } from "../primitives";
import V3ContactForm from "../V3ContactForm";

export default function ContactSection({ index, bootNonce }) {
  return (
    <V3Frame section="Contact" planet="PLUTO" index={index} scanDir="horizontal" scanKey={bootNonce}>
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <V3Callout size="s5" emphasis="a channel.">Open</V3Callout>
        <V3Schematic label="TRANSMIT" scanDelay={0.2}>
          <V3ContactForm />
        </V3Schematic>
      </div>
      <div style={{ gridArea: "right-top / right-top / right-bottom / right-bottom", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        {(contactLinks || []).map((c, i) => (
          <V3Channel key={c.label} label={c.label} scanDelay={0.24 + i * 0.05}>
            <a
              href={c.href}
              target={c.href?.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              download={c.download || undefined}
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
                font: `340 1rem var(--v3-font-display)`,
                letterSpacing: "-.005em",
                color: "var(--v3-fg)",
                textDecoration: "none",
                borderBottom: "1px solid var(--v3-line)",
                paddingBottom: 8,
              }}
            >
              <span>{c.value}</span>
              <span aria-hidden style={{ font: `400 .82rem var(--v3-font-mono)`, letterSpacing: ".14em", color: "var(--v3-accent)" }}>→</span>
            </a>
          </V3Channel>
        ))}
      </div>
    </V3Frame>
  );
}
