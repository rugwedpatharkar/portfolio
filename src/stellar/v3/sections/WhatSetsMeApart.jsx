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
      gap: 18, alignItems: "flex-start",
      padding: "14px 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      {/* Accent numeral */}
      <span aria-hidden style={{
        fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 12,
        color: "var(--v3-accent)", letterSpacing: ".14em",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1.4,
        flexShrink: 0,
      }}>{String(i + 1).padStart(2, "0")}</span>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1.05rem, 1.2vw, 1.25rem)", fontOpticalSizing: "auto",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0,
        }}>{p.title}</h3>
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(.82rem, 0.9vw, .92rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0,
        }}>{p.body}</p>
        {p.proof?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {p.proof.map((t, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9.5,
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "1px 8px", whiteSpace: "nowrap",
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
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, overflow: "hidden", maxWidth: "50vw", height: "100%" }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>The Case</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              What Sets Me Apart
            </h2>
          </div>
        </V3Scan>

        {/* 5 pillars */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "4px 18px",
          flex: 1, minHeight: 0, overflow: "hidden",
        }}>
          {PILLARS.map((p, i) => (
            <PillarRow key={i} i={i} p={p} delay={0.15 + i * 0.06} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
