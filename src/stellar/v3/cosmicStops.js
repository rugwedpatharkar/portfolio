/*
 * Tour finale — after Pluto (What Sets Me Apart) the visitor makes ONE last
 * jump out to a dramatic black hole: The Edge. This is the closing stop,
 * carrying the Contact section (outbound form + link rail).
 *
 * Scientific-purism note: no real black hole sits just past Pluto — the
 * nearest known is Gaia BH1 at 1,560 ly. This is a cinematic closer, not a
 * geographic claim. Placed far past Neptune on the outbound tour path.
 *
 * Position authored in SCENE UNITS (beyond the planets, no AU remap). radius
 * drives the v3 framing camera standoff; accent tints the HUD.
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
