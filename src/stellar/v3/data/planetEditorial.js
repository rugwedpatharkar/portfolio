/*
 * Editorial content per body — the "essay" layer that sits alongside the résumé
 * dossier. Each entry has:
 *
 *   quote      — a real historical quote from the person who defined this body
 *   quoteBy    — attribution "Name, source, year"
 *   etymology  — one sentence on the name origin
 *   discovered — "1610 · Galileo, Sidereus Nuncius" or "Known since prehistory"
 *   facts      — 2-3 short, verified "notable" facts (rotates in the V3Editorial
 *                card, one at a time)
 *
 * Keyed by destination.id (matches PLANET_FACTS + destinations.js). Current
 * mapping (as of 2026):
 *   impact → Sun,          experience → Mercury,     projects → Venus,
 *   achievements → Earth,  skills → Mars,            writing → Ceres,
 *   education → Jupiter,   hobbies → Saturn,         testimonials → Uranus,
 *   whatsetsmeapart → Neptune,                       contact → Pluto,
 *   hero → Milky Way (homepage),
 *   kuiper / oort → retired tour stops (data kept for scenery + future re-mount).
 *
 * Content style: elegant, brief, verifiable. Quotes are best-known / most
 * on-brand for each body — the recruiter should walk away with one specific
 * historical moment per planet.
 */

export const PLANET_EDITORIAL = {
  impact: {
    quote: "In the middle of all sits the Sun enthroned.",
    quoteBy: "Copernicus · De Revolutionibus · 1543",
    etymology: "Latin sōl, the sun — the source of the word 'solar'.",
    discovered: "Known since prehistory.",
    facts: [
      "The Sun is 4.6 billion years old — halfway through its main-sequence life.",
      "Photons take ~170,000 years to random-walk from the core to the surface, then 8 minutes to reach Earth.",
      "Loses 4.3 million tonnes of mass per second to fusion + solar wind.",
    ],
  },

  experience: {
    quote: "For a few days I was beside myself with joyous excitement.",
    quoteBy: "Einstein, on solving Mercury's perihelion precession · 1915",
    etymology: "Roman god of commerce and messengers — named for the planet that moves fastest across the sky.",
    discovered: "Known since prehistory.",
    facts: [
      "Mercury's orbit precesses 43″ per century beyond Newtonian prediction — the first empirical test of general relativity.",
      "In 3:2 spin-orbit resonance: three rotations for every two orbits.",
      "Day-side 430 °C, night-side −180 °C — the largest surface temperature swing in the solar system.",
    ],
  },

  projects: {
    quote: "Cynthiae figuras aemulatur mater amorum.",
    quoteBy: "Galileo, anagram sent to Kepler on discovering the phases of Venus · 1610",
    etymology: "Roman goddess of love — for the brightest, most beautiful object in the sky after the Moon.",
    discovered: "Known since prehistory. Phases discovered by Galileo, 1610.",
    facts: [
      "Spins backwards. On Venus, the Sun rises in the west.",
      "One Venusian day (243 Earth days) is longer than one Venusian year (225 days).",
      "Surface pressure equals Earth's ocean at ~900 m depth. Rain is sulfuric acid that evaporates before it lands.",
    ],
  },

  achievements: {
    quote: "Look again at that dot. That's here. That's home. That's us.",
    quoteBy: "Carl Sagan · Pale Blue Dot · 1994",
    etymology: "Old English eorþe — 'the ground' — the only planet whose name is not from Greek or Roman mythology.",
    discovered: "Home.",
    facts: [
      "The only known body where water exists as solid, liquid, and gas at the surface simultaneously.",
      "The Moon is drifting away at 3.8 cm per year — the same rate fingernails grow.",
      "Earth's magnetic north pole is currently moving toward Siberia at ~55 km per year.",
    ],
  },

  skills: {
    quote: "Mars alone laid bare the secrets of astronomy.",
    quoteBy: "Kepler · Astronomia Nova · 1609",
    etymology: "Roman god of war — for its blood-red hue.",
    discovered: "Known since prehistory. Elliptical orbit derived by Kepler from Tycho's Mars observations, 1609.",
    facts: [
      "Home to Olympus Mons — 22 km tall, wider than the state of Arizona.",
      "Its polar caps shrink and grow with the seasons; some of that ice is CO₂, not water.",
      "A Martian day (sol) is 24h 37m — almost identical to Earth's day.",
    ],
  },

  writing: {
    quote: "It shone with a light like that of a star of the eighth magnitude.",
    quoteBy: "Giuseppe Piazzi, on discovering Ceres · 1 Jan 1801",
    etymology: "Roman goddess of agriculture — Piazzi chose the name for his native Sicily's patron goddess.",
    discovered: "1801 · Giuseppe Piazzi, Palermo Observatory.",
    facts: [
      "First object discovered in the asteroid belt, and the largest — holds ~1/3 the belt's total mass.",
      "Classified as a planet for 50 years, then an asteroid for 150, then a dwarf planet from 2006.",
      "Has a subsurface ocean; NASA's Dawn mission mapped bright salt deposits at Occator crater.",
    ],
  },

  education: {
    quote: "Four Medicean stars, never before seen from the beginning of the world until our own time.",
    quoteBy: "Galileo · Sidereus Nuncius · 1610",
    etymology: "King of the Roman gods — for the largest planet.",
    discovered: "Known since prehistory. The four Galilean moons discovered by Galileo, January 1610.",
    facts: [
      "More massive than every other planet combined — but still only 0.1% of the Sun's mass.",
      "The Great Red Spot has been raging for at least 350 years and is now shrinking.",
      "Io is the most volcanically active body in the solar system — driven by Jupiter's tidal squeeze.",
    ],
  },

  hobbies: {
    quote: "Annulo cingitur, tenui, plano, nusquam cohaerente, ad eclipticam inclinato.",
    quoteBy: "Huygens, on the ring: 'surrounded by a ring — thin, flat, nowhere touching, tilted to the ecliptic' · 1656",
    etymology: "Roman god of agriculture and time — Saturday is 'Saturn's day'.",
    discovered: "Known since prehistory. The rings first correctly described by Huygens in 1656.",
    facts: [
      "The rings are only ~10 metres thick and span 282,000 km — at scale, thinner than a sheet of paper.",
      "Saturn is less dense than water. Given a big enough bathtub, it would float.",
      "Titan is the only moon in the solar system with a substantial atmosphere and stable surface liquid — methane–ethane lakes.",
    ],
  },

  testimonials: {
    quote: "It appears visibly larger than the fixed stars.",
    quoteBy: "William Herschel · discovery night · 13 March 1781",
    etymology: "Greek Οὐρανός, primordial god of the sky — the only planet named from Greek, not Roman, mythology.",
    discovered: "1781 · William Herschel, Bath, England. First planet discovered by telescope.",
    facts: [
      "Rotates on its side — axial tilt 97.8°. One pole spends 42 Earth years in continuous sunlight, then 42 in darkness.",
      "Herschel's discovery doubled the known extent of the solar system in a single night.",
      "Voyager 2 remains the only spacecraft to have visited — closest approach, January 1986.",
    ],
  },

  whatsetsmeapart: {
    quote: "The planet whose position you have indicated actually exists.",
    quoteBy: "Johann Galle to Urbain Le Verrier · 25 September 1846",
    etymology: "Roman god of the sea — for its deep blue methane hue.",
    discovered: "1846 · predicted by Le Verrier / Adams from Uranus's orbital perturbations; observed by Galle within 1° of the predicted location on the first night.",
    facts: [
      "Predicted by mathematics before it was seen — the definitive victory of Newtonian gravity.",
      "Winds reach 2,100 km/h — the fastest in the solar system, in the coldest atmosphere of any major planet.",
      "One Neptunian year is 165 Earth years. It has completed exactly one orbit since its discovery.",
    ],
  },

  contact: {
    quote: "Suddenly I spied the image popping in and out.",
    quoteBy: "Clyde Tombaugh, discovering Pluto by blink-comparator · 18 Feb 1930",
    etymology: "Roman god of the underworld — proposed by Venetia Burney, aged 11, at breakfast in Oxford.",
    discovered: "1930 · Clyde Tombaugh, Lowell Observatory. Reclassified as a dwarf planet, 24 August 2006.",
    facts: [
      "Named by an 11-year-old — Venetia Burney of Oxford, over breakfast with her grandfather.",
      "New Horizons flew past Pluto on 14 July 2015; the return data took 16 months to arrive.",
      "Has a heart-shaped nitrogen-ice plain (Sputnik Planitia) that convects like lava lamps.",
    ],
  },

  /* The Milky Way — the HOMEPAGE grand intro, view from INSIDE. */
  hero: {
    quote: "We are made of star-stuff. We are a way for the cosmos to know itself.",
    quoteBy: "Carl Sagan · Cosmos, 1980",
    etymology: "Milky Way — a translation of the Latin via lactea (Ovid, ~8 CE) → itself from the Greek galaxías kýklos, \"circle of milk\".",
    discovered: "Galileo pointed the first telescope at the Milky Way in 1610 and resolved it into individual stars — proof our galaxy is made of suns.",
    facts: [
      "Four main spiral arms: Perseus, Sagittarius, Scutum-Centaurus, Norma. Sol rides on the Orion Spur — a minor arm segment between Sagittarius and Perseus.",
      "The bright band arching across your night sky IS the disc of the Milky Way seen edge-on. The Great Rift is a dark dust lane cutting along its spine.",
      "The galaxy is on a collision course with Andromeda — impact in ~4.5 billion years. The merged galaxy will be called Milkomeda.",
    ],
  },
  /* The Edge — the cinematic closer, hosts the Contact section. */
  /* The Edge intentionally has NO planetEditorial entry — user wants the
     black-hole finale to render WIDE without any info card overlay. */
  /* Kuiper Belt — retired as a stop; data kept for future re-mount. */
  kuiper: {
    quote: "Beyond Neptune lies not emptiness, but a second disc of worlds.",
    quoteBy: "Gerard Kuiper (paraphrased) · 1951",
    etymology: "Named for Gerard Kuiper, who predicted a debris belt beyond Neptune in 1951. First object 1992 QB1 discovered by David Jewitt and Jane Luu.",
    discovered: "1992 — Jewitt & Luu observed the first Kuiper Belt Object (KBO), 1992 QB1, at 41 AU. Over 3,000 KBOs are now catalogued.",
    facts: [
      "Pluto, Eris, Haumea, Makemake — all dwarf planets — orbit within the Kuiper Belt.",
      "The 3:2 resonance with Neptune parks the Plutinos at 39.4 AU. The 2:1 resonance parks the Twotinos at 47.7 AU.",
      "The Kuiper Cliff at ~48 AU: beyond it, objects abruptly become rare. No one knows why — a lost planet, or the disc's true edge?",
    ],
  },
  /* Oort Cloud — final ambient beat. Where the Solar System actually ends. */
  oort: {
    quote: "The Sun's family reaches almost to the next star.",
    quoteBy: "Jan Oort · 1950",
    etymology: "Proposed by Dutch astronomer Jan Oort in 1950 to explain the origin of long-period comets — vast spherical shell of icy comet nuclei surrounding the Solar System.",
    discovered: "1950 — Oort's paper Origin and Development of Comets inferred the cloud's existence from the orbital statistics of long-period comets.",
    facts: [
      "The Oort Cloud is spherical, not disc-shaped like the Kuiper Belt — comet orbits arrive from every direction.",
      "The outer edge is ~1 light-year from the Sun — 63,000 AU. Beyond that lies interstellar space.",
      "Voyager 1, our fastest spacecraft (17 km/s), is at 166 AU today. It needs 300 more years to reach the inner Oort Cloud, and 30,000 years to cross it.",
    ],
  },
};
