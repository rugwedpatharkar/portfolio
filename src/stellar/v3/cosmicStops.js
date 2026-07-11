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
    radius: 80,
    position: [4300, 120, -420],
    /* Custom cameraTarget — the default cosmic-stop math (`radius * 3.6`
       standoff) would put the camera 288u away; at radius 80 that renders
       a ~30° disc. To FILL THE FRAME the camera sits ~120u away with
       fov 78° → the event horizon + accretion disk + lensed halo spread
       from edge to edge. Positioned dead-on the black hole's axis so the
       accretion disk shows face-on with the photon ring dominant. */
    cameraTarget: {
      position: [4300 - 120, 120 + 8, -420 + 4],
      lookAt: [4300, 120, -420],
      fov: 78,
    },
  },
];

export const COSMIC_BY_ID = Object.fromEntries(COSMIC_STOPS.map((c) => [c.id, c]));
