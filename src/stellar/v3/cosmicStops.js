/*
 * v3 cosmic epilogue — after Pluto (the last résumé stop) the tour journeys OUTWARD
 * past the edge of the solar system into deep space: real cosmic phenomena as pure
 * "wow" stops (no résumé content), ending on the Milky Way as the grand finale. Facts
 * are from the Tier-3 space research (NASA/ESA/EHT/LIGO). Each stop renders its object
 * in Scene and shows this content in V3Panel.
 *
 * Positions are authored directly in SCENE UNITS (no AU remap — these are beyond the
 * planetary system), continuing along +X so the scroll keeps travelling outward. radius
 * drives the v3 framing (body sized big on the right). accent tints the HUD per stop.
 */
export const COSMIC_STOPS = [
  {
    id: "blackhole",
    kind: "cosmic",
    render: "blackhole",
    label: "Gargantua",
    section: "cosmic-blackhole",
    kicker: "Black hole · deep field",
    title: "The point of no return",
    summary:
      "Past the last planet, gravity wins. A black hole so dense not even light escapes — the glowing ring is superheated gas orbiting the edge of forever.",
    accent: "#ffb14a",
    radius: 4.2,
    position: [4300, 120, -420],
    facts: [
      ["TYPE", "Stellar-mass → 4.3M☉ (Sgr A*)"],
      ["EDGE", "Event horizon · escape v > c"],
      ["RING", "Photon ring + Doppler-bright arc"],
      ["IMAGED", "EHT · M87* 2019 · Sgr A* 2022"],
    ],
    wow: "The first photo of a black hole (M87*, 2019) needed eight observatories linked into an Earth-sized telescope. Our galaxy's own — Sagittarius A* — is 4 million Suns, sitting quietly 27,000 light-years away.",
  },
  {
    id: "wormhole",
    kind: "cosmic",
    render: "wormhole",
    label: "Einstein–Rosen Bridge",
    section: "cosmic-wormhole",
    kicker: "Wormhole · theoretical",
    title: "A shortcut through spacetime",
    summary:
      "A tunnel that folds two distant points of the universe together. Never observed — but a real prediction of Einstein's relativity. Look in and you'd see light from somewhere else entirely.",
    accent: "#8ea2ff",
    radius: 3.4,
    position: [5200, -80, 260],
    facts: [
      ["SHAPE", "A sphere, not a funnel"],
      ["VIEW", "A warped window onto elsewhere"],
      ["NEEDS", "Exotic negative-energy matter"],
      ["STATUS", "Predicted · never seen"],
    ],
    wow: "A wormhole mouth would look like a crystal ball showing another part of the cosmos — not a dark hole. Interstellar's wormhole was rendered from real relativity equations and became a peer-reviewed physics paper.",
  },
  {
    id: "nebula",
    kind: "cosmic",
    render: "nebula",
    label: "Pillars of Creation",
    section: "cosmic-nebula",
    kicker: "Nebula · star nursery",
    title: "Where stars are born",
    summary:
      "Light-years-tall towers of gas and dust, lit and sculpted by newborn stars inside them. Emission nebulae glow red from hydrogen; reflection nebulae scatter blue — the same physics that blues our sky.",
    accent: "#ff5a8a",
    radius: 5.6,
    position: [6200, 220, -520],
    facts: [
      ["KIND", "Emission · reflection · dark · planetary"],
      ["SCALE", "Pillars ≈ 4–5 light-years tall"],
      ["COLOR", "Hα red · O-III teal · dust gold"],
      ["SEEN BY", "Hubble 1995 · JWST 2022"],
    ],
    wow: "The Pillars of Creation are towers actively birthing stars — while being slowly evaporated by the radiation of the very stars they create. A reflection nebula glows blue for the exact reason Earth's daytime sky does.",
  },
  {
    id: "pulsar",
    kind: "cosmic",
    render: "pulsar",
    label: "Pulsar",
    section: "cosmic-pulsar",
    kicker: "Neutron star · lighthouse",
    title: "A city that weighs a Sun",
    summary:
      "The collapsed heart of a dead star: 1.4 Suns crushed into a sphere the size of a city, spinning hundreds of times a second and sweeping twin beams of radiation across the void like a cosmic lighthouse.",
    accent: "#bcd4ff",
    radius: 3.0,
    position: [7000, -140, 380],
    facts: [
      ["SIZE", "≈ 20 km across · 1.4 Suns"],
      ["SPIN", "Up to ~700 turns / second"],
      ["FIELD", "Magnetar ≈ 100 billion tesla"],
      ["DENSITY", "1 teaspoon ≈ all humanity"],
    ],
    wow: "The first pulsar's clockwork signal was briefly nicknamed 'LGM' — little green men — before we knew it was a spinning neutron star. A sugar-cube of its matter would weigh about as much as the entire human race.",
  },
  {
    id: "milkyway",
    kind: "cosmic",
    render: "milkyway",
    label: "The Milky Way",
    section: "cosmic-milkyway",
    kicker: "Galaxy · you are here",
    title: "Home",
    summary:
      "Pull all the way back: our Sun is one of 100–400 billion stars in a barred spiral 100,000 light-years across. We ride the Orion Arm, two-thirds of the way out, orbiting the core once every ~230 million years.",
    accent: "#e8ddc4",
    radius: 10,
    position: [8600, 60, -300],
    facts: [
      ["STARS", "100–400 billion"],
      ["SPAN", "≈ 100,000 light-years"],
      ["WE ARE", "Orion Arm · ~26,000 ly out"],
      ["ORBIT", "~230 M yr per lap"],
    ],
    wow: "We can never photograph our own galaxy from outside — every 'face-on Milky Way' is an artist's reconstruction. That faint band across a dark night sky is the combined glow of billions of our sibling stars.",
    finale: true,
  },
];

export const COSMIC_BY_ID = Object.fromEntries(COSMIC_STOPS.map((c) => [c.id, c]));
