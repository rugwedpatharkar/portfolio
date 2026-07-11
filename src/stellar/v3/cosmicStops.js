/*
 * v3 finale — after Pluto the tour makes ONE last jump out to a black hole: the
 * dramatic closing stop.
 *
 * Section role: per user swap, this final stop now renders the CONTACT section
 * (the outbound form + link rail). 'What sets me apart' moved back one stop to
 * Pluto — see destinations.js. Space object ordering is unchanged.
 *
 * Position authored in SCENE UNITS (beyond the planets, no AU remap). radius
 * drives the v3 framing; accent tints the HUD.
 */
export const COSMIC_STOPS = [
  {
    id: "blackhole",
    kind: "cosmic",
    render: "blackhole",
    label: "The Edge",
    section: "contact",
    docTitle: "Contact",
    accent: "#ffb14a",
    radius: 4.2,
    position: [4300, 120, -420],
  },
];

export const COSMIC_BY_ID = Object.fromEntries(COSMIC_STOPS.map((c) => [c.id, c]));
