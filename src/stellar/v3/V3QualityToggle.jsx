/*
 * V3QualityToggle — lets the viewer resolve the density-vs-smoothness tension
 * themselves. Three tiers, persisted in localStorage:
 *   ultra       — maximum density, full DPR, adaptive shedding OFF (for strong GPUs)
 *   balanced    — the default: near-4K still, adaptive guard holds the frame
 *   performance — lightest, DPR floored, aggressive shed → locked-smooth anywhere
 * A hairline FUI control in the bottom-right; pointer-only, hidden on the hero's
 * first paint so it never competes with the landing.
 */
import { memo } from "react";

export const QUALITY_TIERS = ["performance", "balanced", "ultra"];
export const QUALITY_LABEL = { performance: "Performance", balanced: "Balanced", ultra: "Ultra" };

export function loadQuality() {
  if (typeof window === "undefined") return "balanced";
  const q = window.localStorage?.getItem("stellar:quality");
  return QUALITY_TIERS.includes(q) ? q : "balanced";
}

function V3QualityToggle({ quality = "balanced", onChange }) {
  return (
    <div
      style={{
        position: "fixed",
        right: "clamp(20px, 3vw, 40px)",
        bottom: "clamp(18px, 3vh, 34px)",
        zIndex: 46,
        display: "flex",
        alignItems: "center",
        gap: 8,
        pointerEvents: "auto",
        fontFamily: "var(--v3-font-mono, monospace)",
      }}
    >
      <span style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-fg-mute, #7c8391)", marginRight: 2 }}>
        Quality
      </span>
      <div style={{ display: "flex", border: "1px solid var(--v3-line, rgba(255,255,255,0.14))", borderRadius: 7, overflow: "hidden" }}>
        {QUALITY_TIERS.map((tier) => {
          const on = tier === quality;
          return (
            <button
              key={tier}
              type="button"
              data-cursor
              onClick={() => onChange?.(tier)}
              title={`${QUALITY_LABEL[tier]} quality`}
              aria-pressed={on}
              style={{
                all: "unset",
                cursor: "pointer",
                padding: "5px 10px",
                fontSize: 10,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: on ? "#050609" : "var(--v3-fg-dim, #b3b9c7)",
                background: on ? "var(--v3-accent, #cdb891)" : "transparent",
                transition: "background .18s, color .18s",
              }}
            >
              {QUALITY_LABEL[tier][0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(V3QualityToggle);
