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
    /* Not "hero" — that would mount the V3Hero landing (name copy, tour CTA)
       which belongs on the Milky Way homepage, not here. Using an unmapped
       key so V3Panel returns null → clean sky + Planet Information card. */
    section: "kuiper",
    docTitle: "Kuiper Belt",
    accent: "#c8d6a0",
    radius: 260,
    /* Beyond Pluto's 3,750u, on the outbound tour path, high above the
       ecliptic for a backlit shot down onto the belt disc. */
    position: [4200, 900, -200],
  },
  {
    /* Oort Cloud — 2,000 to 100,000 AU spherical shell. Camera pulls WAY
       back so the Sun becomes a distant pinprick with the OortCloud shell
       (radius ~5,200 scene units, mounted as background scenery) wrapping
       around it. Final ambient beat of the tour. */
    id: "oort",
    kind: "cosmic",
    render: "oort_reveal",
    label: "Oort Cloud",
    /* Unmapped section → V3Panel returns null → clean ambient shot with
       only the Planet Information card visible. */
    section: "oort",
    docTitle: "Oort Cloud",
    accent: "#a0c0e8",
    radius: 4600,
    position: [5800, 1400, 1800],
    /* Camera pulled back to 3,600u from Sun, looking AT the Sun (not at
       the destination point). Sits INSIDE the OortCloud shell so its
       icy points wrap the frame; Sun visible as a tiny distant orb. */
    cameraTarget: {
      position: [3200, 900, 1000],
      lookAt: [0, 0, 0],
      fov: 58,
    },
  },
];

export const COSMIC_BY_ID = Object.fromEntries(COSMIC_STOPS.map((c) => [c.id, c]));
