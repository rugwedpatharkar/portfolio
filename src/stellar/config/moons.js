/*
 * Named major moons as first-class, SCANNABLE bodies. The visual orbiting meshes
 * live on each planet (destinations.js `moonSet` → Planet.jsx); THIS file makes
 * the same moons appear on the overview map with labels + real facts. `parent`
 * is the planet's destination id; the map hotspot sits at the parent's position
 * + `offset`, and liveBodyPosition (data/bodies.js) orbits it around the live
 * parent so the radar/scanner track the real thing.
 */
export const MOONS = [
  {
    id: "moon-luna", parent: "experience", label: "Luna", color: "#cfcdc9", offset: [1.7, 0.7, 0.5],
    info: "Earth's Moon — tidally locked, so we always see the same face; its pull drives our tides and steadies our axis. Drifting ~3.8 cm farther every year.",
    facts: { diameter: "3,474 km", day: "27.3 d (tidally locked)", wow: "Born when a Mars-sized world struck the young Earth." },
  },
  {
    id: "moon-phobos", parent: "projects", label: "Phobos", color: "#7d7165", offset: [1.1, 0.5, -0.5],
    info: "Phobos — Mars's larger, doomed moon: a lumpy 22 km rock orbiting so low it laps Mars 3× a day and is spiralling in to crash (or shatter into a ring) in ~50 My.",
    facts: { diameter: "22.5 km", day: "7.6 h orbit", wow: "Rises in the west and sets in the east — twice a day." },
  },
  {
    id: "moon-deimos", parent: "projects", label: "Deimos", color: "#8a7e70", offset: [-1.0, -0.4, 0.7],
    info: "Deimos — Mars's tiny outer moon (~12 km), smooth with dust-filled craters. From Mars it looks barely more than a bright star.",
    facts: { diameter: "12.4 km", day: "30.3 h orbit", wow: "So small its gravity would let you jump nearly into orbit." },
  },
  {
    id: "moon-io", parent: "skills", label: "Io", color: "#e6c84e", offset: [2.6, 0.6, 0.4],
    info: "Io — the most volcanically active world in the solar system: hundreds of erupting volcanoes paint it sulfur-yellow and orange, squeezed and heated by Jupiter's tidal grip.",
    facts: { diameter: "3,643 km", day: "1.8 d", wow: "Plumes erupt 300 km high — visible from passing spacecraft." },
  },
  {
    id: "moon-europa", parent: "skills", label: "Europa", color: "#dde6e3", offset: [3.4, -0.5, 0.8],
    info: "Europa — a cracked shell of ice over a global salt-water ocean holding twice Earth's water. One of the best places to search for life beyond Earth.",
    facts: { diameter: "3,122 km", day: "3.5 d", wow: "Its hidden ocean may have more water than all of Earth's." },
  },
  {
    id: "moon-ganymede", parent: "skills", label: "Ganymede", color: "#9c8c74", offset: [-3.0, 0.7, -1.0],
    info: "Ganymede — the largest moon in the solar system (bigger than Mercury) and the only one with its own magnetic field, over a buried ocean.",
    facts: { diameter: "5,268 km", day: "7.2 d", wow: "Bigger than the planet Mercury." },
  },
  {
    id: "moon-callisto", parent: "skills", label: "Callisto", color: "#6f6253", offset: [-3.8, -0.6, 1.2],
    info: "Callisto — the most heavily cratered body known, an ancient ice-rock world whose surface has barely changed in 4 billion years.",
    facts: { diameter: "4,821 km", day: "16.7 d", wow: "Its battered face is one of the oldest surfaces in the solar system." },
  },
  {
    id: "moon-titan", parent: "notes", label: "Titan", color: "#d99a4a", offset: [2.4, 0.6, 0.5],
    info: "Titan — Saturn's giant moon, bigger than Mercury, wrapped in a thick orange haze. It rains liquid methane into seas and rivers — the only other world with stable surface liquid.",
    facts: { diameter: "5,150 km", day: "16 d", wow: "Has rivers, lakes and seas — of liquid methane." },
  },
  {
    id: "moon-enceladus", parent: "notes", label: "Enceladus", color: "#eef3f1", offset: [-2.0, -0.5, 0.8],
    info: "Enceladus — a brilliant-white ice moon firing geysers of salty water from a subsurface ocean through cracks at its south pole, feeding Saturn's E-ring.",
    facts: { diameter: "504 km", day: "1.4 d", wow: "Its geysers spray ocean water straight into space." },
  },
  {
    id: "moon-mimas", parent: "notes", label: "Mimas", color: "#c9cdd2", offset: [2.9, 0.4, -1.3],
    info: "Mimas — Saturn's 'Death Star' moon: one colossal crater (Herschel, ~⅓ its width) dominates a face. In 2024 it sprang a surprise — a young liquid-water ocean hidden under the ice.",
    facts: { diameter: "396 km", day: "0.9 d", wow: "Its giant crater makes it a dead ringer for the Death Star." },
  },
  {
    /* Surface features ride Mars as scannable pins (the NASA texture already shows them). */
    id: "mars-olympus", parent: "projects", label: "Olympus Mons", color: "#c98a5a", offset: [0.0, 0.92, 0.34],
    info: "Olympus Mons — the tallest volcano in the solar system, ~22 km high (about 2.5× Everest) and as wide as France. With no plate tectonics, the hotspot just kept building ONE colossal shield volcano.",
    facts: { diameter: "~600 km wide", day: "—", wow: "So wide that from its summit, the base curves away below the horizon." },
  },
  {
    id: "mars-valles", parent: "projects", label: "Valles Marineris", color: "#b06a3a", offset: [0.85, -0.2, -0.5],
    info: "Valles Marineris — a canyon system ~4,000 km long and up to 7 km deep, dwarfing the Grand Canyon. Likely a vast tectonic crack opened by the rise of the nearby Tharsis volcanic bulge.",
    facts: { diameter: "4,000 km long", day: "—", wow: "On Earth it would run from California to New York." },
  },
  {
    id: "moon-s2025u1", parent: "testimonials", label: "S/2025 U1", color: "#9aa8b0", offset: [-1.3, 0.4, 0.6],
    info: "S/2025 U1 — a tiny new moon of Uranus (~10 km across) found by JWST in 2025, nudging up Uranus's moon count. So small and dark it hid in plain sight for decades.",
    facts: { diameter: "~10 km", day: "—", wow: "Found by JWST in 2025 — Uranus keeps more secrets the closer we look." },
  },
  {
    /* Not a moon, but a real Earth EVENT — rides Earth as a scannable pin; the
       umbra visual on Earth's day side is Scene/EclipseShadow.jsx. */
    id: "eclipse-2026", parent: "experience", label: "2026 Eclipses", color: "#ffd9a0", offset: [0.0, 1.3, 0.2],
    info: "Two solar eclipses cross Earth in 2026: an annular 'ring of fire' on Feb 17 (over Antarctica), then a TOTAL eclipse on Aug 12 — the Moon's shadow racing across Greenland, Iceland and Spain. The umbra you see drifting on Earth's day side is that shadow.",
    facts: { diameter: "umbra ~100–200 km wide", day: "Feb 17 annular · Aug 12 total", wow: "The Moon is ~400× smaller than the Sun but ~400× closer — so they look the same size, and totality is possible." },
  },
  {
    id: "moon-titania", parent: "testimonials", label: "Titania", color: "#bcc8c8", offset: [1.5, 0.5, 0.4],
    info: "Titania — Uranus's largest moon, an icy world scarred by huge canyons from an ancient freeze-and-expand.",
    facts: { diameter: "1,578 km", day: "8.7 d", wow: "Canyons longer than Earth's Grand Canyon split its surface." },
  },
  {
    id: "moon-triton", parent: "hobbies", label: "Triton", color: "#d8cabd", offset: [1.6, 0.6, 0.5],
    info: "Triton — Neptune's big moon, the only large moon that orbits BACKWARD: a captured Kuiper-belt world, slowly spiralling in. It erupts nitrogen geysers from a −235 °C surface.",
    facts: { diameter: "2,707 km", day: "5.9 d (retrograde)", wow: "Orbits backward — it was captured, not born with Neptune." },
  },
  {
    id: "moon-charon", parent: "testimonials", label: "Charon", color: "#9a948a", offset: [1.1, 0.4, 0.4],
    info: "Charon — Pluto's giant moon, half Pluto's size. The two are tidally locked face-to-face and orbit a point in empty space between them — a true double world.",
    facts: { diameter: "1,212 km", day: "6.4 d (locked)", wow: "So big it and Pluto orbit a point in the space between them." },
  },
  {
    id: "moon-rhea", parent: "notes", label: "Rhea", color: "#cdd2d0", offset: [-2.6, 0.5, 0.9],
    info: "Rhea — Saturn's second-largest moon, a heavily cratered ball of ice and rock with a wisp of an oxygen–CO₂ exosphere and hints of its own faint ring.",
    facts: { diameter: "1,527 km", day: "4.5 d", wow: "May be the only moon with a ring system of its own." },
  },
  {
    id: "moon-iapetus", parent: "notes", label: "Iapetus", color: "#8a7f70", offset: [3.2, -0.6, -1.0],
    info: "Iapetus — the two-faced moon: one hemisphere is pitch-black, the other bright ice, and a bizarre 1,300 km ridge girdles its equator like the seam of a walnut.",
    facts: { diameter: "1,469 km", day: "79.3 d", wow: "One side is ~10× darker than the other — a cosmic yin-yang." },
  },
  {
    id: "moon-dione", parent: "notes", label: "Dione", color: "#d4dad8", offset: [2.2, 0.7, 1.1],
    info: "Dione — an icy moon laced with bright 'wispy' cliffs of fractured ice, wrapped in a tenuous oxygen exosphere.",
    facts: { diameter: "1,123 km", day: "2.7 d", wow: "Its ghostly wisps are ice cliffs hundreds of metres tall." },
  },
  {
    id: "moon-tethys", parent: "notes", label: "Tethys", color: "#dfe6e3", offset: [-2.4, -0.4, -1.2],
    info: "Tethys — a bright, low-density ice moon marked by the giant Odysseus impact crater and the vast Ithaca Chasma canyon.",
    facts: { diameter: "1,062 km", day: "1.9 d", wow: "Its Ithaca Chasma canyon runs ~2,000 km — three-quarters of the way around it." },
  },
  {
    id: "moon-umbriel", parent: "testimonials", label: "Umbriel", color: "#9aa4a4", offset: [-1.6, -0.5, 0.5],
    info: "Umbriel — the darkest of Uranus's major moons, an ancient cratered world with one mysterious bright ring, 'Wunda', sitting on its equator.",
    facts: { diameter: "1,169 km", day: "4.1 d", wow: "Reflects only ~1 in 6 photons — the moody one of Uranus's moons." },
  },
  /* Uranus's three remaining "Big Five" moons — Ariel, Oberon, Miranda — added
     2026 to close out the classical Uranus system. All at real diameters +
     orbital periods. Parents match the semantic Uranus destination id
     ("testimonials") along with the other Uranus moons (Titania, Umbriel,
     S/2025 U1) — all normalised together, so MOON_OBJECTS (config/objects.js)
     places them near Uranus on the overview map. */
  {
    id: "moon-ariel", parent: "testimonials", label: "Ariel", color: "#c4cfcf", offset: [1.0, -0.4, 0.6],
    info: "Ariel — the brightest and geologically youngest of Uranus's Big Five moons. Its surface shows evidence of recent tectonic and cryovolcanic activity: broad valleys resurfaced by upwelling water-ice slurries, unlike the ancient cratered faces of its siblings.",
    facts: { diameter: "1,158 km", day: "2.5 d", wow: "Reflectance ~40% — the brightest of Uranus's classical moons; surface may have been resurfaced within the last billion years." },
  },
  {
    id: "moon-oberon", parent: "testimonials", label: "Oberon", color: "#a2acac", offset: [-2.1, 0.6, -0.9],
    info: "Oberon — Uranus's outermost of the Big Five and the second-largest. An ancient, heavily-cratered ice-rock world with a striking ~6 km high mountain and a dark unidentified reddish material coating some crater floors — possibly captured Kuiper-belt debris.",
    facts: { diameter: "1,523 km", day: "13.5 d", wow: "Its highest peak stands 11 km above the surrounding plain — nearly 1½ Everests, on a moon smaller than the UK." },
  },
  {
    id: "moon-miranda", parent: "testimonials", label: "Miranda", color: "#c8d4d4", offset: [0.7, 0.5, -0.4],
    info: "Miranda — the smallest of Uranus's Big Five, with the most bizarre surface in the solar system: patchwork terrain of grooves, cliffs, ovoidal 'coronae' and giant chevron ridges suggesting the moon was catastrophically disrupted then reassembled. Hosts Verona Rupes, the tallest known cliff — a 20 km drop.",
    facts: { diameter: "471 km", day: "1.4 d", wow: "Its Verona Rupes cliff is 20 km high — an object dropped from the top would fall for about 12 minutes before hitting bottom (in Miranda's weak gravity)." },
  },
  {
    id: "moon-nereid", parent: "hobbies", label: "Nereid", color: "#c8c0b4", offset: [-2.2, 0.6, -0.7],
    info: "Nereid — one of the most eccentric orbits of any moon: it swings from ~1.4 to ~9.7 million km from Neptune, likely flung outward when Triton was captured.",
    facts: { diameter: "~340 km", day: "360 d orbit", wow: "Its distance from Neptune varies sevenfold over one lopsided orbit." },
  },
  {
    id: "moon-nix", parent: "testimonials", label: "Nix", color: "#cfc8bf", offset: [-1.3, 0.6, -0.5],
    info: "Nix — a small elongated moon of Pluto that tumbles CHAOTICALLY, its poles wandering unpredictably as Pluto and Charon tug on it.",
    facts: { diameter: "~50 km", day: "chaotic spin", wow: "You could never predict its sunrise — its rotation is genuinely chaotic." },
  },
  {
    id: "moon-hydra", parent: "testimonials", label: "Hydra", color: "#c4c0b8", offset: [1.4, -0.5, 0.6],
    info: "Hydra — Pluto's outermost moon, another chaotically tumbling chunk of water ice, discovered in 2005.",
    facts: { diameter: "~51 km", day: "chaotic spin", wow: "Found two years before New Horizons even launched toward it." },
  },
  {
    id: "moon-kerberos", parent: "testimonials", label: "Kerberos", color: "#a8a49c", offset: [-1.1, -0.6, 0.7],
    info: "Kerberos — a tiny, dark, double-lobed moon of Pluto, surprisingly dim, found in 2011.",
    facts: { diameter: "~19 km", day: "chaotic spin", wow: "Darker than its siblings — a soot-grey oddball." },
  },
  {
    id: "moon-styx", parent: "testimonials", label: "Styx", color: "#b0aca4", offset: [1.0, 0.5, -0.6],
    info: "Styx — the smallest and faintest of Pluto's five moons, a ~16 km sliver of ice found in 2012.",
    facts: { diameter: "~16 km", day: "chaotic spin", wow: "The last of Pluto's moons discovered — and the tiniest." },
  },
];

export const MOON_BY_ID = Object.fromEntries(MOONS.map((m) => [m.id, m]));
