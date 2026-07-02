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
          the sphere + top-right telemetry card. */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, overflow: "hidden", maxWidth: "65vw" }}>
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
              fontSize: "clamp(2rem, 3.4vw, 2.8rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Role tabs — 2 buttons, active gets accent underline + fg text */}
        <V3Scan variant="horizontal" delay={0.12}>
          <div role="tablist" style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--v3-line)" }}>
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
                    padding: "10px 18px 12px",
                    borderBottom: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    marginBottom: -1,
                    display: "flex", flexDirection: "column", gap: 4,
                    transition: "border-color .2s",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                    letterSpacing: ".2em", textTransform: "uppercase",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                  }}>{e.date}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
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
            beside them to save vertical footprint (Experience is the densest section). */}
        <V3Scan variant="horizontal" delay={0.18} key={`role-${active}`}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(10px, 0.85vw, 12px)",
                letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
                marginBottom: 4,
              }}>
                {exp.title}
              </div>
              <div style={{
                fontFamily: "var(--v3-font-display)", fontWeight: 340,
                fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)", fontOpticalSizing: "auto",
                lineHeight: 1.05, letterSpacing: "-.015em", color: "var(--v3-fg)",
              }}>
                at <span style={{ fontStyle: "italic", color: "var(--v3-accent)" }}>{exp.companyName}</span>
              </div>
            </div>
            {exp.achievement && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginBottom: 4,
                padding: "5px 12px",
                border: "1px solid var(--v3-accent)",
                borderRadius: 999,
                background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)",
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".14em", textTransform: "uppercase",
                color: "var(--v3-fg)",
              }}>
                <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--v3-accent)", boxShadow: "0 0 8px var(--v3-accent)" }} />
                {exp.achievement.replace(/^Awarded\s+/i, "")}
              </div>
            )}
          </div>
        </V3Scan>

        {/* Metrics row — 4 stats, hairline dividers */}
        {exp.metrics?.length > 0 && (
          <V3Scan variant="horizontal" delay={0.24} key={`metrics-${active}`}>
            <div style={{
              display: "grid", gridTemplateColumns: `repeat(${exp.metrics.length}, 1fr)`,
              gap: 0, borderTop: "1px solid var(--v3-line)", borderBottom: "1px solid var(--v3-line)",
              padding: "14px 0",
            }}>
              {exp.metrics.map((m, i) => (
                <div key={i} style={{
                  paddingLeft: i > 0 ? 16 : 0,
                  paddingRight: 16,
                  borderLeft: i > 0 ? "1px solid var(--v3-line)" : "none",
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1.2rem, 1.75vw, 1.6rem)", lineHeight: 1,
                    letterSpacing: "-.015em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
                    fontVariantNumeric: "tabular-nums",
                  }}>{m.value}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                    letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    lineHeight: 1.3,
                  }}>{m.label}</span>
                </div>
              ))}
            </div>
          </V3Scan>
        )}

        {/* Categories — mono heading + up to 2 bullets each. Compact grid so all
            of Upswing's 5 tracks stay on-screen without scrolling. */}
        <V3Scan variant="horizontal" delay={0.3} key={`cats-${active}`}>
          <div style={{
            display: "grid",
            gridTemplateColumns: exp.categories?.length > 3 ? "1fr 1fr 1fr" : exp.categories?.length > 1 ? "1fr 1fr" : "1fr",
            columnGap: 24, rowGap: 18,
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
                  }}>
                    <span aria-hidden style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                      color: "var(--v3-accent)", flexShrink: 0,
                    }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                      letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    }}>{c.name}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                    {shown.map((p, k) => (
                      <li key={k} style={{
                        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                        fontSize: "clamp(.74rem, 0.82vw, .82rem)",
                        color: "var(--v3-fg-dim)", lineHeight: 1.4,
                        paddingLeft: 12, position: "relative",
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
          (the direct grid child), not the inner div. */}
      {exp.tech?.length > 0 && (
        <V3Scan variant="horizontal" delay={0.36} key={`tech-${active}`} style={{ gridArea: "bottom" }}>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
            paddingTop: 14, borderTop: "1px solid var(--v3-line)",
          }}>
            <span style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
              letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              marginRight: 10,
            }}>Stack</span>
            {exp.tech.map((t, i) => (
              <span key={i} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "3px 10px",
              }}>{t}</span>
            ))}
          </div>
        </V3Scan>
      )}
    </V3Frame>
  );
}
