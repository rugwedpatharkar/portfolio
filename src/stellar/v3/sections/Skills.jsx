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
      gap: 14, alignItems: "center",
      padding: "9px 0",
    }}>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
          fontSize: "clamp(.95rem, 1.05vw, 1.08rem)",
          color: "var(--v3-fg)", letterSpacing: ".02em",
        }}>{name}</span>
        <div style={{ position: "relative", height: 4, background: "var(--v3-line)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            width: `${level}%`, background: "var(--v3-accent)",
            boxShadow: "0 0 10px color-mix(in oklab, var(--v3-accent) 60%, transparent)",
          }} />
        </div>
      </div>
      <span style={{
        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
        fontSize: 13, letterSpacing: ".08em",
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
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, overflow: "hidden", maxWidth: "52vw", height: "100%" }}>
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

        {/* Master-detail: index LEFT, active category's skills RIGHT */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 30%) 1fr",
          gap: 22,
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "16px 20px",
          flex: 1, minHeight: 0,
        }}>
          {/* Master: category index */}
          <div
            role="tablist"
            aria-label="Skill categories"
            style={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", minHeight: 0 }}
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
                    display: "grid", gridTemplateColumns: "auto 1fr auto",
                    alignItems: "baseline", gap: 8,
                    padding: "8px 10px",
                    borderLeft: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    background: isActive ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
                    borderRadius: "0 4px 4px 0",
                    transition: "background .2s, border-color .2s",
                  }}
                >
                  <span aria-hidden style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                    letterSpacing: ".14em",
                    fontVariantNumeric: "tabular-nums",
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1rem, 1.15vw, 1.2rem)", lineHeight: 1.2,
                    letterSpacing: "-.005em",
                    color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                    fontOpticalSizing: "auto",
                  }}>{cat}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                    letterSpacing: ".08em",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{String(list.length).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>

          {/* Detail: active category's skills with proficiency bars */}
          <div
            key={activeName}
            style={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", minHeight: 0, paddingRight: 4 }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span aria-hidden style={{ width: 14, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
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
