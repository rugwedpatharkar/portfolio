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
  const tags = (p.tags || []).slice(0, 6).map(t => t.name || t);
  const stat = p.highlight || p.stats?.[0] || null;
  return (
    <V3Scan variant="plot" delay={delay}>
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column", gap: 10,
        padding: "16px 18px 16px",
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

        {/* features bullets — replaces the paragraph description. Short bullet
            claims are card-shaped; the paragraph pitch always got clamped
            mid-sentence at card width. Up to 4 features so cards read as
            spec-lists, not truncated essays. */}
        <ul style={{
          listStyle: "none", padding: 0, margin: 0, flex: 1,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {(p.features || []).slice(0, 4).map((f, k) => (
            <li key={k} style={{
              fontFamily: "var(--v3-font-ui)", fontWeight: 300,
              fontSize: "clamp(.7rem, 0.76vw, .76rem)",
              color: "var(--v3-fg-dim)", lineHeight: 1.35,
              paddingLeft: 14, position: "relative",
            }}>
              <span aria-hidden style={{
                position: "absolute", left: 0, top: "0.55em",
                width: 6, height: 1, background: "var(--v3-line-strong)",
              }} />
              {f}
            </li>
          ))}
        </ul>

        {/* footer row: tags LEFT, stat + link RIGHT */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--v3-line)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, minWidth: 0 }}>
            {tags.map((t, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 8.5,
                letterSpacing: ".06em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "1px 6px", whiteSpace: "nowrap",
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
      planet="EARTH"
      index={index}
      scanDir="plot"
      scanKey={bootNonce}
      /* Full-width span — 'left' spans all 3 grid cols. maxWidth: 68vw ends
         just before the top-right telemetry card (which sits at 78% viewport)
         and stays inside the visible frame. */
      gridAreas={`"top top top" "left left left" "left left left" "bottom bottom bottom"`}
    >
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 18, minWidth: 0, overflow: "hidden", maxWidth: "56vw", height: "100%" }}>
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

        {/* Cards grid — 3-col at wider section width so each card stays portrait.
            gridAutoRows: min-content + alignContent: start → rows size to their
            content, so Personal tab (single row of 3) doesn't stretch cards to
            fill the whole remaining vertical space. Professional tab (2 rows of
            3) stacks naturally with rowGap between. */}
        <div key={`grid-${tab}`} style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          columnGap: 14, rowGap: 14,
          gridAutoRows: "min-content",
          alignContent: "start",
        }}>
          {list.map((p, i) => (
            <ProjectCard key={`${tab}-${i}`} p={p} delay={0.18 + i * 0.06} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
