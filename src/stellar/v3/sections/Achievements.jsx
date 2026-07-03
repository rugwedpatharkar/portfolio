"use client";
/*
 * Achievements (Mars) — master-detail milestone dossier.
 *
 * Matches the Skills / Projects / Experience selector pattern: LEFT is a
 * clickable milestone index (numeral + year + title), RIGHT is the active
 * milestone's full detail — big icon, DM Serif title, complete description
 * with no line-clamp. Nothing is truncated; every milestone in the data
 * source is listed (no .slice(0, 8)). Keyboard nav (ArrowUp/Down + J/K)
 * mirrors the rest of the master-detail sections.
 */
import { useState } from "react";
import { achievements, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.achievements || {
  sub: "Milestones",
  heading: "Signals from the Wire",
};

export default function AchievementsSection({ index, bootNonce }) {
  const list = achievements || [];
  const [active, setActive] = useState(0);
  const item = list[active] || list[0];

  return (
    <V3Frame
      section="Achievements"
      planet="MARS"
      index={index}
      scanDir="circuit"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 22px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)",
        height: "100%",
      }}>
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
              fontSize: "clamp(1.7rem, 2.8vw, 2.8rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
            {META.description && (
              <p style={{
                fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                fontSize: "clamp(.82rem, 0.7vw + 0.35rem, .88rem)", color: "var(--v3-fg-dim)",
                lineHeight: 1.55, margin: "12px 0 0", maxWidth: "62ch",
              }}>{META.description}</p>
            )}
          </div>
        </V3Scan>

        {/* Master-detail: index LEFT (30%), full detail RIGHT (70%). */}
        {list.length > 0 && (
          <V3Scan variant="circuit" delay={0.15} style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(240px, 30%) 1fr",
              gap: "clamp(16px, 1.6vw, 26px)",
              border: "1px solid var(--v3-line)",
              borderRadius: 6,
              background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
              padding: "clamp(12px, 1.2vw, 20px) clamp(14px, 1.4vw, 22px)",
              minWidth: 0, minHeight: 0, height: "100%",
            }}>
              {/* Master */}
              <div
                role="tablist"
                aria-label="Milestones"
                style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, overflow: "hidden" }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "j") { setActive(a => Math.min(list.length - 1, a + 1)); e.preventDefault(); }
                  if (e.key === "ArrowUp"   || e.key === "k") { setActive(a => Math.max(0, a - 1)); e.preventDefault(); }
                }}
              >
                {list.map((a, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(i)}
                      style={{
                        all: "unset", cursor: "pointer",
                        display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto",
                        alignItems: "center", gap: 10,
                        padding: "clamp(9px, 0.85vw, 13px) clamp(9px, 0.9vw, 12px)",
                        borderLeft: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                        background: isActive ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
                        borderRadius: "0 4px 4px 0",
                        transition: "background .2s, border-color .2s",
                        minWidth: 0,
                      }}
                    >
                      <span aria-hidden style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                        fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                        color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                        letterSpacing: ".14em",
                        fontVariantNumeric: "tabular-nums",
                      }}>{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                        <span style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                          fontSize: "clamp(8.5px, 0.3vw + 5px, 10px)",
                          letterSpacing: ".22em", textTransform: "uppercase",
                          color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                        }}>{a.year ? `Logged ${a.year}` : "Milestone"}</span>
                        <span style={{
                          fontFamily: "var(--v3-font-display)", fontWeight: 340,
                          fontSize: "clamp(0.88rem, 0.4vw + 0.55rem, 1.05rem)", lineHeight: 1.2,
                          letterSpacing: "-.005em",
                          color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                          fontOpticalSizing: "auto",
                          overflowWrap: "anywhere",
                        }}>{a.title}</span>
                      </div>
                      <span aria-hidden style={{
                        fontSize: "clamp(1rem, 0.5vw + 0.5rem, 1.3rem)",
                        opacity: isActive ? 1 : 0.65, flexShrink: 0, lineHeight: 1,
                      }}>{a.icon}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detail: full milestone view — no clamps */}
              <div key={`ach-${active}`} style={{
                display: "flex", flexDirection: "column",
                gap: "clamp(12px, 1vw, 18px)",
                minWidth: 0, overflow: "hidden",
                position: "relative",
              }}>
                {/* corner glow dot — circuit-junction cue */}
                <span aria-hidden style={{
                  position: "absolute", top: -4, left: -4, width: 6, height: 6,
                  borderRadius: "50%", background: "var(--v3-accent)",
                  boxShadow: "0 0 8px var(--v3-accent)",
                }} />

                <div style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                  fontSize: "clamp(9.5px, 0.35vw + 6px, 11.5px)",
                  letterSpacing: ".22em", textTransform: "uppercase",
                  color: "var(--v3-fg-mute)",
                }}>{item?.year ? `Logged ${item.year}` : "Milestone"} · {String(active + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(12px, 1vw, 20px)", minWidth: 0 }}>
                  <span aria-hidden style={{
                    fontSize: "clamp(2rem, 1.6vw + 1rem, 3.2rem)",
                    flexShrink: 0, lineHeight: 1,
                  }}>{item?.icon}</span>
                  <h3 style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1.4rem, 1vw + 0.7rem, 2.2rem)",
                    lineHeight: 1.1, letterSpacing: "-.015em",
                    color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                    overflowWrap: "anywhere", minWidth: 0,
                  }}>{item?.title}</h3>
                </div>

                <p style={{
                  fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                  fontSize: "clamp(0.85rem, 0.35vw + 0.6rem, 1rem)",
                  color: "var(--v3-fg-dim)", lineHeight: 1.6, margin: 0,
                  maxWidth: "min(70ch, 100%)",
                  overflowWrap: "break-word", hyphens: "auto",
                }}>{item?.description}</p>
              </div>
            </div>
          </V3Scan>
        )}
      </div>
    </V3Frame>
  );
}
