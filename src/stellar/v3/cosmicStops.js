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
    /* v3 STOP N-2 — "You are here". The tour steps OUT of the solar system
       and looks back at the whole Milky Way from above/outside — a top-
       down 3/4 view of the four-arm spiral with Sol pinned on the Orion
       Spur. Rendered by SpiralGalaxy. Sits between Pluto and the black
       hole so the flow is: last planet → step out and see our galaxy →
       black hole at the edge → contact form. */
    id: "milkyway",
    kind: "cosmic",
    render: "milkyway_galaxy",
    label: "The Galaxy",
    section: "milkyway",
    docTitle: "The Galaxy",
    accent: "#ffd58a",
    /* radius drives the framing camera standoff — a big number here so the
       framing camera sits far enough back to fit the whole spiral disc. */
    radius: 260,
    position: [3900, 220, -180],
  },
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
