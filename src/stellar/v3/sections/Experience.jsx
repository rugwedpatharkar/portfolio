"use client";
/*
 * Experience (Earth) — role dossier, editorial voice.
 *
 * Same L-scaffold as About/FunFacts: all content stays LEFT (maxWidth 50vw),
 * planet + top-right corner Body Telemetry card own the right half.
 *
 * Layout (top→bottom in LEFT column):
 *   - Section header (mono kicker + DM Serif Display heading + Manrope lede)
 *   - Role tabs (2 buttons; active = accent border + fg text, inactive = muted)
 *   - Active role hero: title in DM Serif Display, company + date on a hairline row
 *   - Achievement pill (if present)
 *   - Metrics row: 4 stats, hairline-divided, same rhythm as About's bottom strip
 *   - Categories: single-column list — mono heading + up to 2 bullets each, muted
 *     "more" hint if the category has more points than we can show
 * BOTTOM strip: tech chip rail (mono, hairline chip borders)
 *
 * Density decision: showing ALL categories with 2 bullets each keeps the recruiter
 * scannable at a glance — the third+ bullet in each track lives in the résumé PDF,
 * not the dossier. This preserves the "one held page" cinematic principle from the
 * plan without cramming.
 */
import { useState } from "react";
import { experiences, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.experience;

export default function ExperienceSection({ index, bootNonce }) {
  const [active, setActive] = useState(0);
  const exp = experiences[active] || experiences[0];

  return (
    <V3Frame
      section="Experience"
      planet="VENUS"
      index={index}
      scanDir="drill"
      scanKey={bootNonce}
      /* Wider left region for Experience: 'left' spans cols 1+2 so the grid cell
         itself is 2.4fr of 3fr ≈ 80% of the frame. Content still capped at 65vw
         so it doesn't crowd the sun/planet + top-right telemetry card. */
      gridAreas={`"top top top" "left left ." "left left ." "bottom bottom bottom"`}
    >
      {/* LEFT — all content. Wider than About/FunFacts because Experience is the
          densest section; Earth is a small planet so the extra width still clears
          the sphere + top-right telemetry card. maxWidth uses min(65vw, 1100px)
          so ultra-wide (2560+) viewports cap gracefully instead of ballooning
          the reading measure, while sub-1280 zoomed viewports still flex down. */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: "clamp(12px, 1.2vw, 18px)", minWidth: 0, overflow: "hidden", maxWidth: "min(65vw, 1100px)" }}>
        {/* Section header — same voice as About + FunFacts */}
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
              fontSize: "clamp(1.7rem, 1.4vw + 1rem, 2.8rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Role tabs — 2 buttons, active gets accent underline + fg text.
            flexWrap allows tabs to stack on ultra-narrow / high-zoom viewports
            instead of overflowing the container. */}
        <V3Scan variant="horizontal" delay={0.12}>
          <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 0, borderBottom: "1px solid var(--v3-line)", minWidth: 0 }}>
            {experiences.map((e, i) => {
              const isActive = i === active;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  style={{
                    all: "unset", cursor: "pointer",
                    padding: "clamp(8px, 0.7vw, 12px) clamp(12px, 1.2vw, 22px) clamp(10px, 0.9vw, 14px)",
                    borderBottom: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    marginBottom: -1,
                    display: "flex", flexDirection: "column", gap: 4,
                    transition: "border-color .2s",
                    minWidth: 0,
                  }}
                >
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                    letterSpacing: ".2em", textTransform: "uppercase",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                  }}>{e.date}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(0.95rem, 0.6vw + 0.6rem, 1.3rem)",
                    color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                    letterSpacing: "-.005em", lineHeight: 1.15,
                    fontOpticalSizing: "auto",
                  }}>{e.companyName.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </V3Scan>

        {/* Active role hero — title + company on one line, achievement pill inline
            beside them to save vertical footprint (Experience is the densest section).
            flexWrap already handled; minWidth: 0 on children lets them shrink under
            zoom so the pill can rewrap to a new line before overflowing. */}
        <V3Scan variant="horizontal" delay={0.18} key={`role-${active}`}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(10px, 1vw, 18px)", flexWrap: "wrap", minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(10px, 0.4vw + 8px, 13px)",
                letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
                marginBottom: 4, overflowWrap: "anywhere",
              }}>
                {exp.title}
              </div>
              <div style={{
                fontFamily: "var(--v3-font-display)", fontWeight: 340,
                fontSize: "clamp(1.2rem, 1vw + 0.7rem, 2rem)", fontOpticalSizing: "auto",
                lineHeight: 1.05, letterSpacing: "-.015em", color: "var(--v3-fg)",
                overflowWrap: "anywhere",
              }}>
                at <span style={{ fontStyle: "italic", color: "var(--v3-accent)" }}>{exp.companyName}</span>
              </div>
            </div>
            {exp.achievement && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginBottom: 4,
                padding: "clamp(4px, 0.4vw, 6px) clamp(10px, 0.9vw, 14px)",
                border: "1px solid var(--v3-accent)",
                borderRadius: 999,
                background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)",
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 8px, 11px)",
                letterSpacing: ".14em", textTransform: "uppercase",
                color: "var(--v3-fg)",
                maxWidth: "100%",
              }}>
                <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--v3-accent)", boxShadow: "0 0 8px var(--v3-accent)", flexShrink: 0 }} />
                {exp.achievement.replace(/^Awarded\s+/i, "")}
              </div>
            )}
          </div>
        </V3Scan>

        {/* Metrics row — 4 stats, hairline dividers. auto-fit minmax lets metrics
            reflow to fewer columns under heavy zoom / narrower viewports instead
            of squishing all 4 into one row where numbers would overlap labels. */}
        {exp.metrics?.length > 0 && (
          <V3Scan variant="horizontal" delay={0.24} key={`metrics-${active}`}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(clamp(110px, 12vw, 150px), 1fr))`,
              gap: 0, borderTop: "1px solid var(--v3-line)", borderBottom: "1px solid var(--v3-line)",
              padding: "clamp(10px, 1vw, 16px) 0",
            }}>
              {exp.metrics.map((m, i) => (
                <div key={i} style={{
                  paddingLeft: i > 0 ? "clamp(10px, 1vw, 18px)" : 0,
                  paddingRight: "clamp(10px, 1vw, 18px)",
                  borderLeft: i > 0 ? "1px solid var(--v3-line)" : "none",
                  display: "flex", flexDirection: "column", gap: 6,
                  minWidth: 0,
                }}>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1rem, 0.9vw + 0.5rem, 1.7rem)", lineHeight: 1,
                    letterSpacing: "-.015em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
                    fontVariantNumeric: "tabular-nums",
                    overflowWrap: "anywhere",
                  }}>{m.value}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(8px, 0.3vw + 7px, 10px)",
                    letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                  }}>{m.label}</span>
                </div>
              ))}
            </div>
          </V3Scan>
        )}

        {/* Categories — mono heading + up to 2 bullets each. auto-fit grid so all
            of Upswing's 5 tracks flow naturally: 3 cols on wide viewports, 2 on
            medium, 1 on narrow / heavily-zoomed. Replaces the previous hard-coded
            1/2/3 col ternary which snapped to 3 cols even at 1280 zoomed 125%
            where each column was <180px. */}
        <V3Scan variant="horizontal" delay={0.3} key={`cats-${active}`}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(clamp(200px, 18vw, 260px), 1fr))",
            columnGap: "clamp(16px, 1.6vw, 28px)", rowGap: "clamp(14px, 1.2vw, 20px)",
          }}>
            {(exp.categories || []).map((c, i) => {
              /* Show 1 bullet per category — the lead claim. Extras count as
                 '+N more' hint (real numbers only, no misleading '+0 more'). */
              const shown = (c.points || []).slice(0, 1);
              const extra = (c.points || []).length - shown.length;
              return (
                <div key={i} style={{ minWidth: 0 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                    minWidth: 0,
                  }}>
                    <span aria-hidden style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                      color: "var(--v3-accent)", flexShrink: 0,
                    }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                      letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                      minWidth: 0, overflowWrap: "anywhere",
                    }}>{c.name}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                    {shown.map((p, k) => (
                      <li key={k} style={{
                        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                        fontSize: "clamp(0.72rem, 0.35vw + 0.55rem, 0.9rem)",
                        color: "var(--v3-fg-dim)", lineHeight: 1.4,
                        paddingLeft: 12, position: "relative",
                        minWidth: 0, overflowWrap: "anywhere",
                      }}>
                        <span aria-hidden style={{ position: "absolute", left: 0, top: "0.75em", width: 6, height: 1, background: "var(--v3-line-strong)" }} />
                        {p}
                      </li>
                    ))}
                    {extra > 0 && (
                      <li style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                        letterSpacing: ".18em", textTransform: "uppercase",
                        color: "var(--v3-fg-mute)", paddingLeft: 12, marginTop: 2,
                      }}>
                        + {extra} more
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </V3Scan>
      </div>

      {/* BOTTOM — tech chip rail; mono with tracked letter-spacing so it reads
          as a "stack manifest" rather than tags. gridArea goes on V3Scan itself
          (the direct grid child), not the inner div. min-width: 0 on the outer
          wrapper prevents the flex chip rail from pushing the full-width bottom
          strip beyond its grid cell under heavy zoom. */}
      {exp.tech?.length > 0 && (
        <V3Scan variant="horizontal" delay={0.36} key={`tech-${active}`} style={{ gridArea: "bottom", minWidth: 0 }}>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
            paddingTop: "clamp(10px, 1vw, 16px)", borderTop: "1px solid var(--v3-line)",
            minWidth: 0,
          }}>
            <span style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
              letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              marginRight: 10,
            }}>Stack</span>
            {exp.tech.map((t, i) => (
              <span key={i} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "clamp(2px, 0.2vw, 4px) clamp(8px, 0.7vw, 12px)",
                maxWidth: "100%", overflowWrap: "anywhere",
              }}>{t}</span>
            ))}
          </div>
        </V3Scan>
      )}
    </V3Frame>
  );
}
