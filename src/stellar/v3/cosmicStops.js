/*
 * v3 finale — after Pluto the tour makes ONE last jump out to a black hole: the
 * dramatic closing stop. It's not a space-facts card — it carries "What sets me
 * apart", with the black hole as the metaphor (the hardest, densest problems are
 * where the pull is strongest). Real proof points from /src/content.
 *
 * Position authored in SCENE UNITS (beyond the planets, no AU remap). radius drives
 * the v3 framing; accent tints the HUD.
 */
export const COSMIC_STOPS = [
  {
    id: "blackhole",
    kind: "cosmic",
    render: "blackhole",
    label: "The Edge",
    section: "cosmic-blackhole",
    kicker: "What sets me apart",
    title: "Gravity",
    summary:
      "Some engineers ship features. I architect the systems everything else orbits — a 31-service platform, multi-agent AI, and the latency budgets that make it all feel instant. Hand me the densest, gnarliest part of the stack: that's where I pull hardest.",
    accent: "#ffb14a",
    radius: 4.2,
    position: [4300, 120, -420],
    facts: [
      ["SCALE", "31 services · Python/gRPC on GKE"],
      ["PERF", "96% p95 latency cut"],
      ["AI", "Multi-agent · MCP · 4 LLM providers"],
      ["DEPTH", "Hybrid RAG · Qdrant · event-driven"],
    ],
    wow: "Like a black hole, the hardest problems are where I have the most pull — the deeper and denser the system, the more I want in. If that's the gravity your team needs, let's talk.",
  },
];

export const COSMIC_BY_ID = Object.fromEntries(COSMIC_STOPS.map((c) => [c.id, c]));
