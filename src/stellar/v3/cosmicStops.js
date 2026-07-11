/*
 * Deep-space epilogue stops appended after Pluto — the Kuiper Belt and the
 * Oort Cloud, both scientifically real regions past the last planet. The
 * previous "black hole at the edge" was removed: no black hole exists
 * anywhere near the Solar System (nearest is Gaia BH1 at 1,560 ly, nearest
 * supermassive is Sgr A* at 26,670 ly).
 *
 * Contact section moved to Pluto (its `id` stays `testimonials` for URL
 * stability; only its `section` field changes) — see destinations.js.
 *
 * Position authored in SCENE UNITS (beyond the planets, no AU remap). radius
 * drives the v3 framing camera standoff; accent tints the HUD.
 */
export const COSMIC_STOPS = [
  {
    /* Kuiper Belt — 30–50 AU. Camera pulled BACK from Pluto's frame to a
       backlit angle showing the belt as a dusty golden disc. The belt
       geometry already renders via AsteroidBelt + BeltDust background
       scenery — this stop just parks the camera for the reveal. */
    id: "kuiper",
    kind: "cosmic",
    render: "kuiper_reveal",
    label: "Kuiper Belt",
    section: "hero", // no résumé section — decorative info card only
    docTitle: "Kuiper Belt",
    accent: "#c8d6a0",
    radius: 260,
    /* Beyond Pluto's 3,750u, on the outbound tour path, high above the
       ecliptic for a backlit shot down onto the belt disc. */
    position: [4200, 900, -200],
  },
  {
    /* Oort Cloud — 2,000 to 100,000 AU spherical shell. Camera pulls WAY
       back so the Sun becomes a distant pinprick + the OortCloud shell
       becomes a faint blue-white halo around it. Final ambient beat of
       the tour. */
    id: "oort",
    kind: "cosmic",
    render: "oort_reveal",
    label: "Oort Cloud",
    section: "hero", // no résumé section — decorative info card only
    docTitle: "Oort Cloud",
    accent: "#a0c0e8",
    radius: 4600,
    /* Even further out. The camera pose is a big pull-back so the whole
       Sun + planets + belt sit tiny in the Oort shell around them. */
    position: [5800, 1400, 1800],
  },
];

export const COSMIC_BY_ID = Object.fromEntries(COSMIC_STOPS.map((c) => [c.id, c]));
