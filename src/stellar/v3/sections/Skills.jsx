"use client";
/*
 * Skills (Ceres) — master-detail dossier.
 *
 * User picked the interaction pattern: 9 category headings pinned on the LEFT
 * as a clickable index; clicking a category opens its skills with proficiency
 * bars on the RIGHT. Each skill shows a mono name and a hairline progress bar
 * with the accent fill scaled to `level`.
 *
 * Follows the narrow-first / fill-vertical rule loosely — Skills is dense
 * enough that master-detail warrants some width. LEFT area spans grid cols
 * 1+2, maxWidth 60vw. Master column (skill index) ~28%; detail column ~72%.
 *
 * Category-cycle keyboard support: ArrowUp/Down or J/K move between rows.
 */
import { useState } from "react";
import { skills, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.skills || { sub: "What I Bring", heading: "Technical Skills" };

const SkillBar = ({ name, level, delay }) => (
  <V3Scan variant="orbit" delay={delay}>
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      gap: "clamp(8px, 0.8vw, 14px)", alignItems: "center",
      padding: "clamp(6px, 0.7vh, 10px) 0",
    }}>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "clamp(5px, 0.5vh, 8px)" }}>
        <span style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
          /* Scales with both viewport width (vw) AND root em (zoom-aware).
             Floor .9rem keeps mono legible at 75% zoom / 1280px. */
          fontSize: "clamp(0.9rem, 0.6vw + 0.5rem, 1.2rem)",
          color: "var(--v3-fg)", letterSpacing: ".02em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{name}</span>
        <div style={{
          position: "relative",
          /* Bar height scales gently with viewport height so it reads on both
             tall (1440p, zoomed-out) and short (zoomed-in, small laptop) viewports. */
          height: "clamp(3px, 0.3vh, 5px)",
          background: "var(--v3-line)", borderRadius: 999, overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            width: `${level}%`, background: "var(--v3-accent)",
            boxShadow: "0 0 10px color-mix(in oklab, var(--v3-accent) 60%, transparent)",
            /* Smooth width transition on category swap so bars re-fill fluidly. */
            transition: "width .6s ease",
          }} />
        </div>
      </div>
      <span style={{
        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
        fontSize: "clamp(11px, 0.35vw + 0.5rem, 15px)", letterSpacing: ".08em",
        fontVariantNumeric: "tabular-nums",
        color: "var(--v3-fg-mute)",
      }}>{level}%</span>
    </div>
  </V3Scan>
);

export default function SkillsSection({ index, bootNonce }) {
  const cats = Object.entries(skills);
  const [active, setActive] = useState(0);
  const [activeName, activeList] = cats[active] || cats[0];

  return (
    <V3Frame
      section="Skills"
      planet="CERES"
      index={index}
      scanDir="orbit"
      scanKey={bootNonce}
      /* Master-detail is a two-column layout; needs LEFT to span cols 1+2 so
         maxWidth actually caps section width (col 1 alone would be 585px,
         cramming both the category index and the detail). */
      gridAreas={`"top top top" "left left ." "left left ." "bottom bottom bottom"`}
    >
      {/* Cap absolute width at 850px so the master-detail doesn't get too wide on
          2560+ screens (bars would run under the corner card). min(52vw, 850px)
          keeps proportion on small viewports and locks a ceiling on large ones. */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: "clamp(12px, 1.2vh, 20px)", minWidth: 0, overflow: "hidden", maxWidth: "min(60vw, 1200px)", height: "100%" }}>
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
              /* Zoom-aware: rem floor keeps heading legible at high zoom,
                 vw scale keeps proportional to viewport at 1x. */
              fontSize: "clamp(1.7rem, 1.8vw + 0.6rem, 2.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Master-detail: index LEFT, active category's skills RIGHT.
            Master column uses minmax(min(220px, 40%), 30%) so on very narrow
            viewports (or high browser zoom) the master can shrink below 220px
            rather than force horizontal overflow. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(min(220px, 40%), 30%) 1fr",
          gap: "clamp(12px, 1.4vw, 24px)",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "clamp(10px, 1vw, 18px) clamp(12px, 1.3vw, 22px)",
          flex: 1, minHeight: 0,
        }}>
          {/* Master: category index. overflowY: 'scroll' keeps the rail visible
              always as a scroll affordance — user knows there's more even at rest. */}
          <div
            role="tablist"
            aria-label="Skill categories"
            style={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "scroll", minHeight: 0 }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "j") { setActive(a => Math.min(cats.length - 1, a + 1)); e.preventDefault(); }
              if (e.key === "ArrowUp"   || e.key === "k") { setActive(a => Math.max(0, a - 1)); e.preventDefault(); }
            }}
          >
            {cats.map(([cat, list], i) => {
              const isActive = i === active;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  style={{
                    all: "unset", cursor: "pointer",
                    display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto",
                    alignItems: "baseline", gap: "clamp(6px, 0.6vw, 10px)",
                    /* Button padding scales with viewport so touch targets stay
                       comfortable at wide/zoomed-out sizes without eating space at 1280px. */
                    padding: "clamp(6px, 0.6vw, 12px) clamp(8px, 0.8vw, 14px)",
                    borderLeft: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    background: isActive ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
                    borderRadius: "0 4px 4px 0",
                    transition: "background .2s, border-color .2s",
                    minWidth: 0,
                  }}
                >
                  <span aria-hidden style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(10px, 0.25vw + 0.5rem, 12px)",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                    letterSpacing: ".14em",
                    fontVariantNumeric: "tabular-nums",
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    /* Category name — rem-anchored so zoom scales it too. */
                    fontSize: "clamp(0.95rem, 0.6vw + 0.5rem, 1.3rem)", lineHeight: 1.2,
                    letterSpacing: "-.005em",
                    color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                    fontOpticalSizing: "auto",
                    minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{cat}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(10px, 0.25vw + 0.5rem, 12px)",
                    letterSpacing: ".08em",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{String(list.length).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>

          {/* Detail: active category's skills with proficiency bars. paddingRight
              leaves clearance for the 6px v3 scrollbar so the level% column
              doesn't sit underneath it. overflowY: 'scroll' keeps the rail
              permanently visible as a scroll affordance — user immediately sees
              they can scroll to reveal more skills. */}
          <div
            key={activeName}
            style={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "scroll", minHeight: 0, minWidth: 0, paddingRight: "clamp(10px, 1vw, 18px)" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span aria-hidden style={{ width: 14, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(10px, 0.25vw + 0.5rem, 12px)",
                letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{activeName} · {activeList.length}</span>
            </div>
            {activeList.map((s, k) => (
              <SkillBar key={`${activeName}-${s.name}`} name={s.name} level={s.level} delay={0.05 + k * 0.03} />
            ))}
          </div>
        </div>
      </div>
    </V3Frame>
  );
}
