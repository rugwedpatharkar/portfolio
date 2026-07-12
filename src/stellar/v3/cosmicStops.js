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
    id: "theedge",
    kind: "cosmic",
    render: "blackhole",
    label: "The Edge",
    /* No section — pure visual finale. V3Panel gets an unmapped key and
       returns null; the Planet Information card is also suppressed
       (planetFacts + planetEditorial have no `theedge` entry). Just the
       black hole filling the frame. */
    section: "theedge",
    docTitle: "",
    accent: "#ffb14a",
    /* Radius is what BlackHole.jsx uses to size the event horizon sphere,
       accretion disk, photon ring, and lensing halo. Big so the visual
       spreads across the entire frame — Interstellar-style Gargantua. */
    radius: 40,
    /* Well past Pluto but within scene bounds. Pluto is at ~(4180, 0.9, 1.4);
       The Edge at (5400, 200, -600) is ~1500u further out. Uses the default
       cosmic-stop cameraTarget math from destinations.js (`radius * 3.6`
       standoff sunward), which reliably places the camera at 144u away
       looking at the singularity — proven working on the original blackhole
       at the same distance regime. Index-gated to activeIdx === 13 so it
       stays invisible from earlier stops. */
    position: [5400, 200, -600],
  },
];

export const COSMIC_BY_ID = Object.fromEntries(COSMIC_STOPS.map((c) => [c.id, c]));
