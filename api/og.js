/*
 * Dynamic OG image endpoint — deployed as a Vercel Edge Function.
 *
 * Usage:
 *   /api/og                                          → default brand card
 *   /api/og?title=Notes&subtitle=Working+notes       → custom title / subtitle
 *
 * The card itself is plain JSX rendered server-side by @vercel/og into a PNG
 * at 1200×630. No client-side JS, no fonts to ship — the runtime inlines them.
 */

import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

const ACCENT = "#915eff";
const ACCENT_2 = "#00cea8";
const BG = "#050816";

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Rugwed Patharkar").slice(0, 80);
  const subtitle = (
    searchParams.get("subtitle") ||
    "Software Engineer · Python · React · AI"
  ).slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: BG,
          position: "relative",
          padding: "72px 80px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top accent gradient mesh, fake glow via two radial spots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(60% 60% at 15% 20%, ${ACCENT}33 0%, transparent 60%), radial-gradient(50% 50% at 85% 85%, ${ACCENT_2}26 0%, transparent 60%)`,
          }}
        />

        {/* Top row: brand mark + meta tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
              }}
            />
            <span>Rugwed Patharkar · Portfolio</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              border: `1px solid ${ACCENT}66`,
              borderRadius: 999,
              fontSize: 18,
              color: "#dfd9ff",
              background: "rgba(145, 94, 255, 0.08)",
            }}
          >
            → rugwedpatharkar.vercel.app
          </div>
        </div>

        {/* Middle: heading */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 1,
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#b8a0ff",
              fontWeight: 600,
              letterSpacing: 1,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ color: ACCENT }}>→</span>
            <span>{subtitle}</span>
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 940,
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
            color: "#aaa6c3",
            fontSize: 22,
            fontFamily: "monospace",
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>Pune · India</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span>Backend & AI</span>
          </div>
          <div style={{ display: "flex", gap: 12, color: "rgba(255,255,255,0.5)" }}>
            <span>github.com/rugwedpatharkar</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
