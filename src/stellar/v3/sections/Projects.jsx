"use client";
/*
 * Projects (Jupiter) — mission files, tab-picked.
 *
 * Same L-scaffold as Experience: LEFT area spans grid cols 1+2 (65vw cap) so
 * the ~9 projects have room to render as legible cards without crowding the
 * planet + top-right telemetry card.
 *
 * Layout:
 *   - Header: mono kicker + DM Serif Display heading + Manrope lede
 *   - Tab picker: Professional (6) / Personal (3) — switch active set
 *   - Cards grid: 2-col, hairline-outlined cards; each card carries a
 *     year/status kicker, name in DM Serif Display, description clamped to 3
 *     lines, top 3 tags as mono chips, one stat highlight, and an 'Open →' CTA
 *     when the project has a github link.
 */
import { useMemo, useState } from "react";
import { projects, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.projects;

const ProjectCard = ({ p, delay }) => {
  const tags = (p.tags || []).slice(0, 3).map(t => t.name || t);
  const stat = p.highlight || p.stats?.[0] || null;
  return (
    <V3Scan variant="plot" delay={delay}>
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", gap: 6,
        padding: "11px 13px 11px",
        border: "1px solid var(--v3-line)",
        borderRadius: 6,
        background: "color-mix(in oklab, var(--v3-bg-void) 55%, transparent)",
        minWidth: 0, height: "100%",
      }}>
        {/* accent corner tick */}
        <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 12, height: 1, background: "var(--v3-accent)" }} />
        <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 1, height: 12, background: "var(--v3-accent)" }} />

        {/* kicker: status · year */}
        <div style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
          letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
        }}>
          {[p.status, p.year, p.team].filter(Boolean).join(" · ")}
        </div>

        {/* name */}
        <div style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1rem, 1.35vw, 1.2rem)", lineHeight: 1.15,
          letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
        }}>{p.name}</div>

        {/* description clamped to 3 lines — enough to convey the pitch */}
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(.72rem, 0.78vw, .8rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.4, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{p.description}</p>

        {/* footer row: tags LEFT, stat + link RIGHT */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--v3-line)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minWidth: 0 }}>
            {tags.map((t, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                letterSpacing: ".08em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "2px 8px", whiteSpace: "nowrap",
              }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexShrink: 0 }}>
            {stat && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{
                  fontFamily: "var(--v3-font-display)", fontWeight: 340,
                  fontSize: "clamp(.95rem, 1.1vw, 1.1rem)", lineHeight: 1,
                  color: "var(--v3-fg)", fontOpticalSizing: "auto",
                }}>{stat.value}</span>
                <span style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 8,
                  letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                }}>{stat.label}</span>
              </div>
            )}
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer" style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".14em", textTransform: "uppercase",
                color: "var(--v3-accent)", textDecoration: "none",
                pointerEvents: "auto", cursor: "pointer",
              }}>Open →</a>
            )}
          </div>
        </div>
      </div>
    </V3Scan>
  );
};

export default function ProjectsSection({ index, bootNonce }) {
  const [tab, setTab] = useState("professional");

  const { professional, personal } = useMemo(() => ({
    professional: (projects || []).filter(p => p.type === "professional"),
    personal: (projects || []).filter(p => p.type === "personal"),
  }), []);

  const list = tab === "professional" ? professional : personal;

  return (
    <V3Frame
      section="Projects"
      planet="JUPITER"
      index={index}
      scanDir="plot"
      scanKey={bootNonce}
      /* Narrower than Experience: 'left' back to col 1 only. User wants portrait
         cards that read as taller than wide — narrower content section forces
         each card to compress horizontally and grow vertically. */
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 14, minWidth: 0, overflow: "hidden", maxWidth: "55vw" }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Tab picker: Professional / Personal — same treatment as Experience roles */}
        <V3Scan variant="horizontal" delay={0.12}>
          <div role="tablist" style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--v3-line)" }}>
            {[
              { key: "professional", label: "Professional", count: professional.length },
              { key: "personal", label: "Personal", count: personal.length },
            ].map(t => {
              const isActive = t.key === tab;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(t.key)}
                  style={{
                    all: "unset", cursor: "pointer",
                    padding: "10px 18px 12px",
                    borderBottom: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    marginBottom: -1,
                    display: "flex", alignItems: "baseline", gap: 8,
                    transition: "border-color .2s",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
                    color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                    letterSpacing: "-.005em", lineHeight: 1.15,
                    fontOpticalSizing: "auto",
                  }}>{t.label}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                    letterSpacing: ".2em",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{String(t.count).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>
        </V3Scan>

        {/* Cards grid — 2-col so projects breathe at 65vw */}
        <div key={`grid-${tab}`} style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          columnGap: 16, rowGap: 16,
          gridAutoRows: "1fr",
        }}>
          {list.map((p, i) => (
            <ProjectCard key={`${tab}-${i}`} p={p} delay={0.18 + i * 0.06} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
