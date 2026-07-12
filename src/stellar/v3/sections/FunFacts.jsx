/*
 * Fun facts (Mercury) — the numbers dossier.
 *
 * User feedback: 'redesign it — even if the screen size increases or
 * decreases the content should never cut or clamp.'
 *
 * Redesign approach:
 *   - LEFT area spans grid cols 1+2 (wider) so 4 stats can sit side-by-side.
 *   - Grid: 4 cols × 2 rows for the 8 stats. `min-content` rows so cells size
 *     to their natural content (no clamps, no line-clamp, full detail shown).
 *   - Header (kicker + heading + optional lede) sits on top spanning full
 *     width and does NOT compete for vertical space with the stats.
 *   - Description clamps + WebkitLineClamp REMOVED. If the viewport can't fit
 *     everything, the LEFT container's overflow: auto gives a v3 scrollbar,
 *     but nothing is truncated or clipped mid-word.
 *   - Card content: emoji + big serif number stacked, mono label, full detail
 *     paragraph. All fluid clamps for scalability without upper caps that
 *     force cut-off.
 */
import { funFacts, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Ticker, V3SectionHeader } from "../primitives";

const META = sectionMeta.funFacts;

const StatCard = ({ f, i, cols }) => {
  const row = Math.floor(i / cols);
  const col = i % cols;
  const isFloat = !Number.isInteger(f.value);
  return (
    <V3Scan variant="radial" delay={0.15 + (row + col) * 0.05}>
      <div style={{
        display: "flex", flexDirection: "column",
        gap: "clamp(6px, 0.55vw, 10px)",
        padding: "clamp(12px, 1.1vw, 18px) clamp(12px, 1.15vw, 20px)",
        border: "1px solid var(--v3-line)",
        borderRadius: 6,
        minWidth: 0, height: "100%", minHeight: 0,
      }}>
        {/* emoji + big number inline */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(6px, 0.6vw, 10px)", flexWrap: "wrap" }}>
          <span aria-hidden style={{
            fontSize: "clamp(1rem, 0.6vw + 0.5rem, 1.35rem)",
            opacity: 0.85, flexShrink: 0,
          }}>{f.icon}</span>
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(1.4rem, 0.6vw + 1rem, 2.2rem)",
            lineHeight: 1, letterSpacing: "-.02em",
            color: "var(--v3-fg)", fontOpticalSizing: "auto",
            overflowWrap: "anywhere",
          }}>
            <V3Ticker value={f.value} suffix={f.suffix || ""} decimals={isFloat ? 1 : 0} />
          </span>
        </div>
        {/* mono label */}
        <div style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
          fontSize: "clamp(9px, 0.35vw + 6px, 11px)",
          letterSpacing: ".18em", textTransform: "uppercase",
          color: "var(--v3-fg-mute)",
          overflowWrap: "anywhere",
        }}>{f.label}</div>
        {/* detail — no clamp, full text visible */}
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(.72rem, 0.3vw + 0.55rem, .82rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.45, margin: 0,
          overflowWrap: "break-word", hyphens: "auto",
        }}>{f.detail}</p>
      </div>
    </V3Scan>
  );
};

export default function FunFactsSection({ bootNonce }) {
  const cols = 4; // 4-col grid so 8 stats fit as 4×2
  return (
    <V3Frame
      section="Fun facts"
      planet="MERCURY"

      scanDir="radial"
      scanKey={bootNonce}
      /* LEFT area spans grid cols 1+2 (full frame height) so the 4-col grid
         + header have real horizontal room. Col 3 stays empty for Mercury +
         corner telemetry card. */
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(14px, 1.4vw, 22px)",
        minWidth: 0, minHeight: 0, overflow: "hidden auto",
        maxWidth: "min(60vw, 1200px)", height: "100%",
      }}>
        {/* Header — kicker + h2 via V3SectionHeader; lede paragraph rides along
            in a following block (V3SectionHeader doesn't own a lede slot). */}
        <V3SectionHeader
          sub={META.sub}
          heading={META.heading}
          kickerSize="clamp(9.5px, 0.2vw + 8px, 11px)"
          kickerMb={10}
        />
        <V3Scan variant="horizontal" delay={0.08}>
          <p style={{
            fontFamily: "var(--v3-font-ui)", fontWeight: 300,
            fontSize: "clamp(.8rem, 0.3vw + 0.65rem, .9rem)",
            color: "var(--v3-fg-dim)",
            lineHeight: 1.55, margin: 0,
            maxWidth: "min(72ch, 100%)",
            overflowWrap: "break-word",
          }}>
            {META.description}
          </p>
        </V3Scan>

        {/* 4×2 stats grid — hairline dividers between rows AND columns.
            gridAutoRows: 1fr + flex:1 stretches cells to fill remaining height.
            No line clamps anywhere — content is never cut. If the viewport is
            genuinely too short for 8 stats, LEFT container's overflow: auto
            catches it and the elegant v3 scrollbar appears. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridAutoRows: "1fr",
          gap: "clamp(8px, 0.7vw, 12px)",
          flex: 1, minHeight: 0,
        }}>
          {funFacts.map((f, i) => (
            <StatCard key={i} f={f} i={i} cols={cols} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
