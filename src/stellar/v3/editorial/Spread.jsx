/*
 * Editorial-spread primitives — the SPINE format for every section (redesign 2026-07):
 * huge Syne masthead + mono meta column + hairline rules + generous whitespace.
 * Composable pieces; no cards, no boxes. See docs/superpowers/plans/
 * 2026-07-17-portfolio-redesign-02-editorial-spread-pilot.md and
 * scratchpad/section-compare.html (Direction B) for the visual target.
 */
import { memo } from "react";

const styles = {
  spread: {
    padding: "64px clamp(48px, 7vw, 120px) 24px",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
  },
  top: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 320px) 1fr",
    gap: 64,
    alignItems: "end",
    paddingBottom: 32,
    borderBottom: "1px solid var(--v3-line-strong)",
  },
  meta: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    lineHeight: 2,
  },
  metaK: { color: "var(--v3-fg)", fontWeight: 500 },
  title: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(56px, 8.5vw, 132px)",
    lineHeight: 0.88,
    letterSpacing: "-.03em",
    color: "var(--v3-fg)",
    margin: 0,
  },
  subhead: {
    padding: "28px 0 40px",
    display: "grid",
    gridTemplateColumns: "minmax(220px, 320px) 1fr",
    gap: 64,
    alignItems: "baseline",
  },
  kicker: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
  },
  lede: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 500,
    fontSize: "clamp(20px, 1.9vw, 26px)",
    lineHeight: 1.35,
    letterSpacing: "-.005em",
    color: "var(--v3-fg)",
    maxWidth: "36ch",
    margin: 0,
  },
  metricRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 0,
    borderTop: "1px solid var(--v3-line)",
    borderBottom: "1px solid var(--v3-line)",
    padding: "22px 0",
  },
  metric: { padding: "0 24px", borderRight: "1px solid var(--v3-line)" },
  metricLast: { borderRight: 0 },
  metricN: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(30px, 3.4vw, 44px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "var(--v3-fg)",
  },
  metricL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginTop: 8,
  },
  tracks: { marginTop: 48 },
  track: {
    display: "grid",
    gridTemplateColumns: "96px 1fr",
    gap: 24,
    padding: "26px 0",
    borderBottom: "1px solid var(--v3-line)",
  },
  trackLast: { borderBottom: 0 },
  trackN: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    color: "var(--v3-accent)",
    letterSpacing: ".16em",
    paddingTop: 6,
  },
  trackH: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 600,
    fontSize: "clamp(18px, 1.8vw, 24px)",
    letterSpacing: "-.01em",
    color: "var(--v3-fg)",
    marginBottom: 12,
    marginTop: 0,
  },
  trackP: {
    color: "var(--v3-fg-dim)",
    fontSize: 15,
    lineHeight: 1.62,
    maxWidth: "75ch",
    margin: 0,
  },
  trackPGap: { marginTop: 10 },
  stack: {
    marginTop: 36,
    paddingTop: 28,
    borderTop: "1px solid var(--v3-line)",
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 24,
    alignItems: "baseline",
  },
  stackL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  stackRow: {
    color: "var(--v3-fg-dim)",
    fontSize: 14,
    lineHeight: 1.9,
    letterSpacing: ".01em",
  },
  stackItem: { color: "var(--v3-fg)", fontWeight: 500 },
  stackSep: { color: "rgba(255,255,255,0.20)", margin: "0 8px" },
  rule: {
    borderTop: "1px solid var(--v3-line-strong)",
    padding: "18px 0 22px",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginTop: 32,
  },
};

export const Spread = memo(function Spread({ children }) {
  return <div style={styles.spread}>{children}</div>;
});

/* Emphasis span — paints in the accent colour; used inside Masthead titles + MetricRow numbers. */
export const Em = ({ children }) => (
  <em style={{ fontStyle: "normal", color: "var(--v3-accent)" }}>{children}</em>
);

/*
 * Masthead — the top block: mono meta column on the left, huge Syne title on the right.
 *   meta:  array of { k, v }  (k = label, v = value or JSX)
 *   title: string OR JSX (use <Em> inside to accent-tint a fragment)
 */
export const Masthead = memo(function Masthead({ meta = [], title }) {
  return (
    <div style={styles.top}>
      <div style={styles.meta}>
        {meta.map((row, i) => (
          <div key={i}>
            <span style={styles.metaK}>{row.k}</span> · {row.v}
          </div>
        ))}
      </div>
      <h1 style={styles.title}>{title}</h1>
    </div>
  );
});

export const Subhead = memo(function Subhead({ kicker, lede }) {
  return (
    <div style={styles.subhead}>
      <div style={styles.kicker}>{kicker}</div>
      <p style={styles.lede}>{lede}</p>
    </div>
  );
});

export const MetricRow = memo(function MetricRow({ metrics = [] }) {
  return (
    <div style={styles.metricRow}>
      {metrics.map((m, i) => (
        <div
          key={i}
          style={i === metrics.length - 1 ? { ...styles.metric, ...styles.metricLast } : styles.metric}
        >
          <div style={styles.metricN}>{m.n}</div>
          <div style={styles.metricL}>{m.l}</div>
        </div>
      ))}
    </div>
  );
});

/*
 * TrackList — hairline-separated rows. Each track has:
 *   n     — a short label like "01 / 05"
 *   title — the track heading
 *   body  — a string OR an array of paragraph strings/JSX
 */
export const TrackList = memo(function TrackList({ tracks = [] }) {
  return (
    <div style={styles.tracks}>
      {tracks.map((t, i) => {
        const rowStyle = i === tracks.length - 1 ? { ...styles.track, ...styles.trackLast } : styles.track;
        const paras = Array.isArray(t.body) ? t.body : [t.body];
        return (
          <div key={i} style={rowStyle}>
            <div style={styles.trackN}>{t.n}</div>
            <div>
              <h3 style={styles.trackH}>{t.title}</h3>
              {paras.map((p, j) => (
                <p key={j} style={j === 0 ? styles.trackP : { ...styles.trackP, ...styles.trackPGap }}>{p}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export const StackLine = memo(function StackLine({ label = "Stack", items = [] }) {
  return (
    <div style={styles.stack}>
      <div style={styles.stackL}>{label}</div>
      <div style={styles.stackRow}>
        {items.map((it, i) => (
          <span key={i}>
            {i > 0 && <span style={styles.stackSep}>·</span>}
            <span style={styles.stackItem}>{it}</span>
          </span>
        ))}
      </div>
    </div>
  );
});

export const EyebrowRule = memo(function EyebrowRule({ children }) {
  return <div style={styles.rule}>{children}</div>;
});
