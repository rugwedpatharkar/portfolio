"use client";
/*
 * Projects (Earth) — master-detail dossier.
 *
 * User: 'set the points which user can select and see detailed information'
 * (like the Skills section). One project at a time, in full detail. The
 * master list on the LEFT is a numbered index; clicking a row swaps the
 * detail column on the RIGHT.
 *
 * Layout:
 *   - Header (kicker + heading).
 *   - Tab picker: Professional (N) / Personal (N) — filters the master list.
 *   - 2-col split below:
 *       LEFT (30%): scrollable project index. Each row: accent numeral,
 *         DM Serif Display name, mono status/year kicker below. Active row
 *         gets a 2px accent left-border + soft accent-tinted background.
 *       RIGHT (70%): active project's FULL detail — kicker line,
 *         DM Serif Display name, description paragraph (no clamp), every
 *         feature as a hairline-tick bullet, tech chip cloud, stat
 *         highlight, and the 'Open →' CTA if the project has a link.
 *   - Keyboard nav: ArrowUp/Down or J/K move between projects (same as Skills).
 *
 * Nothing is truncated or line-clamped anywhere. LEFT and RIGHT both use
 * overflow: auto so if the description is genuinely huge, the elegant v3
 * scrollbar picks it up.
 */
import { useMemo, useState, useEffect } from "react";
import { projects, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.projects;

export default function ProjectsSection({ index, bootNonce }) {
  const [tab, setTab] = useState("professional");
  const [active, setActive] = useState(0);

  const { professional, personal } = useMemo(() => ({
    professional: (projects || []).filter(p => p.type === "professional"),
    personal: (projects || []).filter(p => p.type === "personal"),
  }), []);

  const list = tab === "professional" ? professional : personal;
  const p = list[active] || list[0];

  // Reset active row when switching tabs
  useEffect(() => { setActive(0); }, [tab]);

  const tags = (p?.tags || []).map(t => t.name || t);
  const stat = p?.highlight || p?.stats?.[0] || null;

  return (
    <V3Frame
      section="Projects"
      planet="EARTH"
      index={index}
      scanDir="plot"
      scanKey={bootNonce}
      /* Master-detail wants width — LEFT area spans grid cols 1+2 for the
         2-col internal layout without cramping either side. */
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 20px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(68vw, 1200px)", height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.6rem, 1.1vw + 1rem, 2.4rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Tab picker: Professional / Personal */}
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
                    padding: "clamp(8px, 0.7vw, 12px) clamp(12px, 1.2vw, 22px) clamp(10px, 0.9vw, 14px)",
                    borderBottom: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    marginBottom: -1,
                    display: "flex", alignItems: "baseline", gap: 8,
                    transition: "border-color .2s",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(0.95rem, 0.6vw + 0.6rem, 1.2rem)",
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

        {/* Master-detail: index LEFT, active project's detail RIGHT */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 30%) 1fr",
          gap: "clamp(16px, 1.6vw, 26px)",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "clamp(12px, 1.2vw, 20px) clamp(14px, 1.4vw, 22px)",
          flex: 1, minHeight: 0,
        }}>
          {/* Master: project index */}
          <div
            role="tablist"
            aria-label="Projects"
            style={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "scroll", minHeight: 0 }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "j") { setActive(a => Math.min(list.length - 1, a + 1)); e.preventDefault(); }
              if (e.key === "ArrowUp"   || e.key === "k") { setActive(a => Math.max(0, a - 1)); e.preventDefault(); }
            }}
          >
            {list.map((proj, i) => {
              const isActive = i === active;
              return (
                <button
                  key={proj.name + i}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  style={{
                    all: "unset", cursor: "pointer",
                    display: "grid", gridTemplateColumns: "auto 1fr",
                    alignItems: "flex-start", gap: 10,
                    padding: "clamp(8px, 0.8vw, 12px) clamp(8px, 0.9vw, 12px)",
                    borderLeft: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    background: isActive ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
                    borderRadius: "0 4px 4px 0",
                    transition: "background .2s, border-color .2s",
                    minWidth: 0,
                  }}
                >
                  <span aria-hidden style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                    letterSpacing: ".14em",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1.4,
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.9rem, 0.4vw + 0.55rem, 1.1rem)", lineHeight: 1.15,
                      letterSpacing: "-.005em",
                      color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                      fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                    }}>{proj.name}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(8px, 0.3vw + 5px, 9.5px)",
                      letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    }}>{[proj.status, proj.year].filter(Boolean).join(" · ")}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail: active project's complete info — no clamps anywhere */}
          <div
            key={`${tab}-${active}`}
            style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 1vw, 16px)", overflowY: "scroll", minHeight: 0, paddingRight: "clamp(4px, 0.5vw, 10px)" }}
          >
            {/* kicker: status · year · team */}
            <div style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
              letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
            }}>
              {[p?.status, p?.year, p?.team].filter(Boolean).join(" · ")}
            </div>

            {/* name */}
            <h3 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.3rem, 1vw + 0.6rem, 2rem)",
              lineHeight: 1.15, letterSpacing: "-.005em",
              color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
              overflowWrap: "anywhere",
            }}>{p?.name}</h3>

            {/* description paragraph — full, no clamp */}
            {p?.description && (
              <p style={{
                fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                fontSize: "clamp(0.82rem, 0.35vw + 0.6rem, 0.98rem)",
                color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0,
                overflowWrap: "break-word", hyphens: "auto",
              }}>{p.description}</p>
            )}

            {/* features — ALL bullets */}
            {p?.features?.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "clamp(4px, 0.4vw, 8px) 0 0", display: "flex", flexDirection: "column", gap: "clamp(4px, 0.4vw, 8px)" }}>
                {p.features.map((f, k) => (
                  <li key={k} style={{
                    fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                    fontSize: "clamp(0.78rem, 0.3vw + 0.55rem, 0.92rem)",
                    color: "var(--v3-fg-dim)", lineHeight: 1.45,
                    paddingLeft: 16, position: "relative",
                    overflowWrap: "anywhere",
                  }}>
                    <span aria-hidden style={{
                      position: "absolute", left: 0, top: "0.6em",
                      width: 8, height: 1, background: "var(--v3-line-strong)",
                    }} />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {/* tags */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "clamp(4px, 0.4vw, 8px)" }}>
                {tags.map((t, k) => (
                  <span key={k} style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(8.5px, 0.3vw + 6px, 10.5px)",
                    letterSpacing: ".08em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
                    border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                    padding: "clamp(1px, 0.15vw, 2px) clamp(6px, 0.6vw, 10px)",
                    whiteSpace: "nowrap",
                  }}>{t}</span>
                ))}
              </div>
            )}

            {/* stat + open link */}
            {(stat || p?.github) && (
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                gap: 12, flexWrap: "wrap",
                marginTop: "auto", paddingTop: "clamp(8px, 0.8vw, 12px)",
                borderTop: "1px solid var(--v3-line)",
              }}>
                {stat && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(1rem, 0.6vw + 0.55rem, 1.35rem)", lineHeight: 1,
                      color: "var(--v3-fg)", fontOpticalSizing: "auto",
                    }}>{stat.value}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                      letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    }}>{stat.label}</span>
                  </div>
                )}
                {p?.github && (
                  <a href={p.github} target="_blank" rel="noreferrer" style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                    letterSpacing: ".14em", textTransform: "uppercase",
                    color: "var(--v3-accent)", textDecoration: "none",
                    pointerEvents: "auto", cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}>Open →</a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </V3Frame>
  );
}
