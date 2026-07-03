"use client";
/*
 * What Sets Me Apart (Pluto) — differentiators dossier.
 *
 * Second-to-last stop after the swap. Pluto is the framed planet, but the
 * content is deliberately NOT space-themed: 5 clear engineering
 * differentiators grounded in real production experience, not black-hole
 * metaphors. Recruiter-scannable.
 *
 * Layout follows the narrow-first / fill-vertical rule:
 *   - Header: mono kicker + DM Serif Display heading.
 *   - 5 differentiator rows in a hairline-bordered container, distributed
 *     with justify-content: space-between so they fill the LEFT column.
 *   - Each row: accent numeral · DM Serif Display title · short Manrope
 *     evidence line · optional mono proof-point chips.
 *
 * Responsive strategy:
 *   - maxWidth: min(50vw, 820px) — proportional at narrow, capped at wide
 *     (2560) so rows never grow past a comfortable measure and never sneak
 *     under the corner Body Telemetry card (78-96% x).
 *   - Type: clamp() with rem floors so browser zoom (75/125%) scales legibly.
 *   - Row gap + padding fluid via clamp() — proof chips wrap naturally.
 *   - overflow-wrap: anywhere on title/body defeats long-token overflow.
 *   - Chip cloud: flex-wrap + min-width 0 so tag clouds relayout under
 *     compression instead of blowing out the row width.
 */
import { V3Frame, V3Scan } from "../primitives";

const PILLARS = [
  {
    title: "Systems thinking, production-tested",
    body: "I own the 31-service Python/gRPC platform end-to-end — from p95 latency budgets and distributed race conditions in inventory-hold to on-call incident response.",
    proof: ["31 services", "96% p95 cut", "99.9% availability"],
  },
  {
    title: "Backend + Agentic AI, without a seam",
    body: "I architect the whole stack: FastAPI/gRPC on GKE below, a LangGraph multi-agent supervisor with MCP tool-calling and hybrid RAG on top. One head shipping both, not a hand-off.",
    proof: ["LangGraph · MCP", "4 LLM providers", "Qdrant hybrid RAG"],
  },
  {
    title: "Integration pragmatism at scale",
    body: "7+ PMS providers, door-lock vendors, GRMS platforms — unified under one polymorphic base-class contract with idempotent webhooks. Zero-downtime provider switching, 60% less duplicated code.",
    proof: ["7+ vendors", "Idempotent by design", "60% code reduction"],
  },
  {
    title: "Impact the P&L can see",
    body: "The latency work paid back in the cloud bill: compute cost dropped ~25% off the back of the p95 cut. Faster vendor onboarding, 50% less time-to-first-integration.",
    proof: ["~25% compute saved", "50% faster onboarding", "Star Performer of the Quarter"],
  },
  {
    title: "Ownership + legibility as a habit",
    body: "What I ship is legible: versioned prompts, 500+ line Makefiles for deploy/logs/pods, published production notes, ~65% test coverage on core paths. Handovers are boring in the best way.",
    proof: ["Versioned prompts", "500+ line Makefiles", "~65% core coverage"],
  },
];

const PillarRow = ({ i, p, delay }) => (
  <V3Scan variant="horizontal" delay={delay}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "clamp(12px, 1.2vw, 22px)",
      alignItems: "flex-start",
      padding: "clamp(10px, 1.2vw, 18px) 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      {/* Accent numeral — rem-anchored floor keeps it legible at high zoom;
          vw scale keeps proportional at 1x; ceiling holds at 2560. */}
      <span aria-hidden style={{
        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
        fontSize: "clamp(11px, 0.5vw + 6px, 15px)",
        color: "var(--v3-accent)", letterSpacing: ".14em",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1.4,
        flexShrink: 0,
      }}>{String(i + 1).padStart(2, "0")}</span>

      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.4vw, 8px)", minWidth: 0 }}>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1rem, 0.85vw + 0.5rem, 1.5rem)",
          fontOpticalSizing: "auto",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0,
          overflowWrap: "anywhere",
        }}>{p.title}</h3>
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(0.78rem, 0.55vw + 0.4rem, 1.05rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0,
          overflowWrap: "anywhere",
        }}>{p.body}</p>
        {p.proof?.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap",
            gap: "clamp(3px, 0.3vw, 5px)",
            marginTop: "clamp(2px, 0.3vw, 4px)",
            minWidth: 0,
          }}>
            {p.proof.map((t, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11.5px)",
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "clamp(1px, 0.15vw, 2px) clamp(5px, 0.5vw, 10px)",
                whiteSpace: "nowrap",
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </V3Scan>
);

export default function WhatSetsMeApartSection({ index, bootNonce }) {
  return (
    <V3Frame
      section="What Sets Me Apart"
      planet="PLUTO"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      {/* maxWidth: min(50vw, 820px) — proportional at narrow, absolute cap at
          2560 so the column never runs past a comfortable reading measure and
          never intrudes on the corner Body Telemetry card. */}
      <div style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 18px)",
        minWidth: 0, overflow: "auto",
        maxWidth: "min(50vw, 820px)",
        height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>The Case</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              /* Zoom-aware: rem floor holds heading at high zoom; vw scale
                 keeps it proportional at 1x; ceiling caps at 2560. */
              fontSize: "clamp(1.6rem, 1.8vw + 0.6rem, 2.6rem)",
              fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
              overflowWrap: "anywhere",
            }}>
              What Sets Me Apart
            </h2>
          </div>
        </V3Scan>

        {/* 5 pillars — flex: 1 + justifyContent: space-between so rows spread
            to consume all vertical space rather than clustering at the top. */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "4px clamp(12px, 1.2vw, 22px)",
          flex: 1, minHeight: 0, overflow: "visible", minWidth: 0,
        }}>
          {PILLARS.map((p, i) => (
            <PillarRow key={i} i={i} p={p} delay={0.15 + i * 0.06} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
