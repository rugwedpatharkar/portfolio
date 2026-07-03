"use client";
/*
 * Education (Saturn) — master-detail degree dossier.
 *
 * Same selector pattern used by Skills / Projects / Experience /
 * Achievements. LEFT is a clickable degree index — numeral + mono
 * shortName · year kicker + DM Serif degree name + accent-tinted
 * percentage badge; active row picks up the 2px accent left-border
 * and soft accent tint. RIGHT shows the active degree in full: big
 * animated progress ring, mono kicker with level, DM Serif degree,
 * school, duration, and every highlight chip. Nothing is truncated
 * or clamped. Keyboard nav (ArrowUp/Down + J/K) matches the other
 * master-detail sections.
 */
import { useState } from "react";
import { educations, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.education || {
  sub: "Formation",
  heading: "Academic Track",
};

const Ring = ({ pct = 0, size = "clamp(96px, 8vw + 40px, 160px)" }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      style={{ display: "block", flexShrink: 0, width: size, height: size }}
    >
      <circle cx="32" cy="32" r={r} stroke="var(--v3-line)" strokeWidth="2" fill="none" />
      <circle
        cx="32" cy="32" r={r}
        stroke="var(--v3-accent)" strokeWidth="2" fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeDashoffset={c / 4}
        strokeLinecap="round"
        style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dasharray .5s var(--v3-ease-smooth)" }}
      />
      <text
        x="32" y="36" textAnchor="middle"
        fontSize="11"
        style={{
          fill: "var(--v3-fg)",
          fontFamily: "var(--v3-font-mono)",
          fontWeight: 400,
          letterSpacing: ".02em",
        }}
      >{pct.toFixed(pct % 1 ? 2 : 0)}%</text>
    </svg>
  );
};

export default function EducationSection({ index, bootNonce }) {
  const list = educations || [];
  const [active, setActive] = useState(0);
  const edu = list[active] || list[0];

  return (
    <V3Frame
      section="Education"
      planet="SATURN"
      index={index}
      scanDir="circuit"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 22px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)", height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9.5px, 0.45vw + 6px, 12px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.75rem, 1.4vw + 1rem, 2.8rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
              overflowWrap: "anywhere",
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Master-detail */}
        {list.length > 0 && (
          <V3Scan variant="circuit" delay={0.15} style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(240px, 32%) 1fr",
              gap: "clamp(16px, 1.6vw, 26px)",
              border: "1px solid var(--v3-line)",
              borderRadius: 6,
              background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
              padding: "clamp(12px, 1.2vw, 20px) clamp(14px, 1.4vw, 22px)",
              minWidth: 0, minHeight: 0, height: "100%",
            }}>
              {/* Master: degree index */}
              <div
                role="tablist"
                aria-label="Degrees"
                style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, overflow: "hidden" }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "j") { setActive(a => Math.min(list.length - 1, a + 1)); e.preventDefault(); }
                  if (e.key === "ArrowUp"   || e.key === "k") { setActive(a => Math.max(0, a - 1)); e.preventDefault(); }
                }}
              >
                {list.map((e, i) => {
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
                        }}>{e.shortName || e.level}{e.year ? ` · ${e.year}` : ""}</span>
                        <span style={{
                          fontFamily: "var(--v3-font-display)", fontWeight: 340,
                          fontSize: "clamp(0.88rem, 0.4vw + 0.55rem, 1.05rem)", lineHeight: 1.2,
                          letterSpacing: "-.005em",
                          color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                          fontOpticalSizing: "auto",
                          overflowWrap: "anywhere",
                        }}>{e.degree}</span>
                      </div>
                      <span style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                        fontSize: "clamp(10px, 0.3vw + 7px, 12px)",
                        letterSpacing: ".08em",
                        color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                        fontVariantNumeric: "tabular-nums", flexShrink: 0,
                      }}>{Math.round(e.percentage || 0)}%</span>
                    </button>
                  );
                })}
              </div>

              {/* Detail: full active degree */}
              <div key={`edu-${active}`} style={{
                display: "flex", flexDirection: "column",
                gap: "clamp(14px, 1.2vw, 22px)",
                minWidth: 0, overflow: "hidden",
              }}>
                <div style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                  fontSize: "clamp(9.5px, 0.35vw + 6px, 11.5px)",
                  letterSpacing: ".22em", textTransform: "uppercase",
                  color: "var(--v3-fg-mute)",
                }}>
                  {edu?.level}
                  {edu?.year ? ` · ${edu.year}` : ""}
                  {edu?.duration ? ` · ${edu.duration}` : ""}
                </div>

                {/* Ring + degree/school */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(14px, 1.4vw, 26px)", minWidth: 0, flexWrap: "wrap" }}>
                  <Ring pct={edu?.percentage || 0} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.4vw, 8px)", minWidth: 0, flex: 1 }}>
                    <h3 style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(1.3rem, 0.9vw + 0.6rem, 2rem)", fontOpticalSizing: "auto",
                      lineHeight: 1.1, letterSpacing: "-.015em",
                      color: "var(--v3-fg)", margin: 0,
                      overflowWrap: "anywhere",
                    }}>{edu?.degree}</h3>
                    <div style={{
                      fontFamily: "var(--v3-font-display)", fontStyle: "italic", fontWeight: 340,
                      fontSize: "clamp(0.9rem, 0.4vw + 0.55rem, 1.1rem)",
                      color: "var(--v3-accent)", lineHeight: 1.3,
                      overflowWrap: "anywhere",
                    }}>{edu?.name}</div>
                  </div>
                </div>

                {edu?.highlights?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 0.7vw, 12px)", minWidth: 0 }}>
                    <div style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                      letterSpacing: ".24em", textTransform: "uppercase",
                      color: "var(--v3-fg-mute)",
                    }}>Focus Areas</div>
                    <div style={{
                      display: "flex", flexWrap: "wrap",
                      gap: "clamp(4px, 0.4vw, 8px)",
                      minWidth: 0,
                    }}>
                      {edu.highlights.map((h, k) => (
                        <span key={k} style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                          fontSize: "clamp(9.5px, 0.35vw + 6px, 11.5px)",
                          letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                          border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                          padding: "clamp(2px, 0.2vw, 4px) clamp(8px, 0.7vw, 12px)",
                          maxWidth: "100%", overflowWrap: "anywhere",
                        }}>{h}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </V3Scan>
        )}
      </div>
    </V3Frame>
  );
}
