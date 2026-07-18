import { DESTINATIONS, DESTINATION_BY_ID, remapPosition, frontOfSun } from "./destinations";
import { DWARF_PLANETS } from "./dwarfPlanets";
import { MOONS } from "./moons";
import { projects } from "../../content";

/*
 * Registry of every notable object in the scene — the 12 résumé destinations
 * PLUS the anomalies / ships / easter-eggs that live off the planet line.
 * Powers the interactive system-overview map: hover for an info card, click to
 * visit. Planets route to their résumé stop (kind "stop"); anomalies fly the
 * free-focus camera to an authored framing (kind "focus").
 */

/* Authored framing for a static object: drop the camera between the object and
   the sun, lifted a touch, looking back at it. Absolute world coords (the
   focus camera uses them directly, no orbital offset). */
const frame = (pos, dist = 4, up = 1.1, fov = 42) => {
  const [x, y, z] = pos;
  const len = Math.hypot(x, y, z) || 1;
  return {
    position: [x - (x / len) * dist, y - (y / len) * dist + up, z - (z / len) * dist],
    lookAt: [x, y, z],
    fov,
  };
};

const CATEGORY_BY_KIND = { star: "Star", planet: "Planet", belt: "Belt", beacon: "Beacon" };

/* The 12 résumé destinations — clicking one returns to its scroll stop. */
const DESTINATION_OBJECTS = DESTINATIONS.map((d, index) => ({
  id: d.id,
  label: d.label,
  category: CATEGORY_BY_KIND[d.kind] || "Planet",
  color: d.color,
  position: d.position,
  info: d.factCard?.wow || d.factCard?.body || "",
  visit: { kind: "stop", index },
}));

/* Anomalies / ships / easter-eggs — clicking one flies the free camera there. */
const ANOMALY_RAW = [
  {
    /* id "blackhole" → "gargantua" to end an id collision with the v3 cosmic
       stop of the same id in cosmicStops.js. The v3 stop owns the URL hash +
       DEST_BY_ID lookup; this OBJECTS entry (via bodies.js) is the scanner /
       anomaly-registry target — semantically distinct. Label was already "Gargantua". */
    id: "gargantua", label: "Gargantua", category: "Black hole", color: "#ffb066", position: [49, -6, -15],
    info: "A stellar-mass black hole in the deep field behind the Sun. Light bends around the event horizon — the accretion disk wraps up and over in a glowing Einstein ring.",
    visit: { kind: "focus", cameraTarget: frame([49, -6, -15], 250, 60, 46) },
  },
  {
    id: "wormhole", label: "Wormhole", category: "Portal", color: "#9a7dff", position: [48.55, 0.58, 1.62],
    info: "A traversable wormhole — the 'beam aboard' portal. Click the portal itself to book a call.",
    visit: { kind: "focus", cameraTarget: frame([48.55, 0.58, 1.62], 2.3, 0.5, 40) },
  },
  {
    id: "pulsar", label: "Pulsar", category: "Neutron star", color: "#9fd0ff", position: [-26, 16, -34],
    info: "A rapidly spinning neutron star sweeping twin lighthouse beams across the void — a teaspoon of it would weigh billions of tonnes. Its sweep blinks Morse: ·-- ·- ···- · — click it to decode.",
    visit: { kind: "focus", cameraTarget: frame([-26, 16, -34], 7, 1.6, 44) },
  },
  {
    id: "deathstar", label: "Death Star", category: "Easter egg", color: "#c9ccd6", position: [20.2, 0.9, 1.2],
    info: "That's no moon. The Empire's planet-killer, lurking just above the asteroid belt.",
    visit: { kind: "focus", cameraTarget: frame([20.2, 0.9, 1.2], 3.3, 0.9, 40) },
  },
  {
    id: "enterprise", label: "USS Enterprise", category: "Easter egg", color: "#9fc8ff", position: [11.9, 0.5, -0.7],
    info: "NCC-1701 — boldly going, cruising past Earth with its twin warp nacelles aglow.",
    visit: { kind: "focus", cameraTarget: frame([11.9, 0.5, -0.7], 2.6, 0.7, 38) },
  },
  {
    id: "endurance", label: "Endurance", category: "Easter egg", color: "#cfd6e0", position: [30.7, 1.1, 2.1],
    info: "Interstellar's ring-shaped craft, rotating for artificial gravity on its long voyage outward.",
    visit: { kind: "focus", cameraTarget: frame([30.7, 1.1, 2.1], 3, 0.9, 40) },
  },
  {
    id: "stardestroyer", label: "Star Destroyer", category: "Easter egg", color: "#aeb6c4", position: [23.9, 0.5, -2.6],
    info: "An Imperial dagger looming near Jupiter — its wedge silhouette set against the dark.",
    visit: { kind: "focus", cameraTarget: frame([23.9, 0.5, -2.6], 9, 1.6, 44) },
  },
  {
    id: "cooperstation", label: "Cooper Station", category: "Easter egg", color: "#d0d6dd", position: [29.7, -0.2, 0.9],
    info: "The cylindrical O'Neill colony from Interstellar, slowly spinning near Saturn.",
    visit: { kind: "focus", cameraTarget: frame([29.7, -0.2, 0.9], 3, 0.9, 40) },
  },
  {
    id: "voyager", label: "Voyager Probes", category: "Probe", color: "#ffd9a0", position: [40, 3.5, -19],
    info: "Humanity's farthest emissaries — Voyager 1 & 2, each carrying the Golden Record into interstellar space.",
    visit: { kind: "focus", cameraTarget: frame([40, 3.5, -19], 4, 1, 42) },
  },
  {
    id: "sandworm", label: "Shai-Hulud", category: "Easter egg", color: "#d8a35a", position: [14.3, -0.6, 0.8],
    info: "A Dune sandworm breaching beside the red planet — the system's nearest thing to Arrakis. The spice must flow.",
    visit: { kind: "focus", cameraTarget: frame([14.3, -0.6, 0.8], 3, 0.9, 40) },
  },
  {
    id: "rocinante", label: "Rocinante", category: "Easter egg", color: "#9fb4c8", position: [20.0, -0.7, -1.4],
    info: "The Expanse's corvette-class Martian frigate, running patrol near the belt on its blue Epstein drive.",
    visit: { kind: "focus", cameraTarget: frame([20.0, -0.7, -1.4], 3, 0.9, 40) },
  },
  {
    id: "normandy", label: "SSV Normandy", category: "Easter egg", color: "#bcd0ff", position: [12.0, 0.9, 0.6],
    info: "Mass Effect's stealth frigate — swept wings and a glowing drive core, cruising over Earth.",
    visit: { kind: "focus", cameraTarget: frame([12.0, 0.9, 0.6], 2.6, 0.7, 38) },
  },
  {
    id: "discovery", label: "Discovery One", category: "Easter egg", color: "#dfe4ea", position: [24.4, -0.8, 0.6],
    info: "2001: A Space Odyssey's Jupiter-mission ship — a command sphere on a long engine spine. HAL is aboard.",
    visit: { kind: "focus", cameraTarget: frame([24.4, -0.8, 0.6], 9, 1.6, 44) },
  },
  {
    id: "nostromo", label: "USCSS Nostromo", category: "Easter egg", color: "#b7b1a4", position: [30.2, -0.6, -1.3],
    info: "Alien's industrial towing vessel hauling its refinery through the outer dark. In space, no one can hear you scream.",
    visit: { kind: "focus", cameraTarget: frame([30.2, -0.6, -1.3], 3, 0.9, 40) },
  },
  {
    id: "perseverance", label: "Perseverance & Ingenuity", category: "Probe", color: "#d98a5a", position: [14.6, -0.5, -0.9],
    info: "NASA's real Mars pair — the car-sized rover and the helicopter that made the first powered flight on another world.",
    visit: { kind: "focus", cameraTarget: frame([14.6, -0.5, -0.9], 2.4, 0.7, 38) },
  },
  {
    id: "goldenrecord", label: "Golden Record", category: "Probe", color: "#ffd56a", position: [40, 4, -20],
    info: "The gold phonograph disc on both Voyagers — greetings in 55 languages, whale song, Bach and Chuck Berry, a human heartbeat. Click it to play.",
    visit: { kind: "focus", cameraTarget: frame([40, 4, -20], 3.2, 0.9, 40) },
  },
  {
    id: "genship", label: "Generation Ship", category: "Megastructure", color: "#5a6070", position: [54, 4, -40],
    info: "A derelict O'Neill-cylinder ark built for a thousand-year crossing — dark, slowly tumbling, a single porthole still flickering.",
    visit: { kind: "focus", cameraTarget: frame([54, 4, -40], 9, 2, 44) },
  },
  {
    id: "heighliner", label: "Guild Heighliner", category: "Megastructure", color: "#c79a4a", position: [-44, 30, -38],
    info: "A Dune Spacing-Guild transport that folds space to 'travel without moving' — a mountain of a hull lit by spice-orange holds.",
    visit: { kind: "focus", cameraTarget: frame([-44, 30, -38], 9, 2, 44) },
  },
  {
    id: "jwst", label: "JWST", category: "Probe", color: "#e8b84a", position: [11.7, 0.5, -1.5],
    info: "James Webb Space Telescope — our largest space observatory, parked at Sun-Earth Lagrange point L2, 1.5 million km beyond Earth, its golden mirror permanently shaded from the Sun.",
    visit: { kind: "focus", cameraTarget: frame([11.7, 0.5, -1.5], 2, 0.6, 38) },
  },
  {
    id: "parker", label: "Parker Solar Probe", category: "Probe", color: "#ffcaa0", position: [2.9, 0.6, 1.6],
    info: "Parker Solar Probe — the fastest human-made object ever and the first to 'touch' the Sun, flying through the corona behind a glowing heat shield at ~700,000 km/h.",
    visit: { kind: "focus", cameraTarget: frame([2.9, 0.6, 1.6], 2.4, 0.6, 40) },
  },
  {
    id: "juno", label: "Juno", category: "Probe", color: "#caa86a", position: [25.5, 0.3, 1.5],
    info: "Juno — NASA's solar-powered orbiter studying Jupiter's deep interior and ferocious poles since 2016.",
    visit: { kind: "focus", cameraTarget: frame([25.5, 0.3, 1.5], 2.6, 0.7, 40) },
  },
  {
    id: "lucy", label: "Lucy", category: "Probe", color: "#cfd3d8", position: [13.8, 1.0, 20.5],
    info: "Lucy — on a 12-year tour of Jupiter's Trojan asteroids, the trapped fossils of planet formation at the L4/L5 points.",
    visit: { kind: "focus", cameraTarget: frame([13.8, 1.0, 20.5], 3, 0.8, 42) },
  },
  {
    id: "newhorizons", label: "New Horizons", category: "Probe", color: "#d8d2c4", position: [46, 1.0, 2.2],
    info: "New Horizons — flew past Pluto in 2015 (our first close look at the dwarf), then on to the Kuiper body Arrokoth; now ~60 AU out and still calling home.",
    visit: { kind: "focus", cameraTarget: frame([46, 1.0, 2.2], 3, 0.8, 42) },
  },
  {
    id: "halley", label: "Halley's Comet", category: "Comet", color: "#9fdcff", position: [8, 2, -2],
    info: "1P/Halley — the most famous comet, swinging back every ~76 years on a steep, stretched orbit. Two tails: a straight blue ion tail blown dead anti-sunward by the solar wind, and a curved dust tail lagging its path. Last seen 1986; returns 2061.",
    visit: { kind: "focus", cameraTarget: frame([8, 2, -2], 5, 1.2, 44) },
  },
  {
    id: "oumuamua", label: "'Oumuamua", category: "Interstellar object", color: "#b07a5a", position: [-12, 4, 9],
    info: "1I/'Oumuamua — the first confirmed interstellar visitor (2017). A dark, reddish, wildly elongated shard tumbling end-over-end on an unbound hyperbolic path: it fell in from another star and is already leaving, never to return.",
    visit: { kind: "focus", cameraTarget: frame([-12, 4, 9], 4, 1, 42) },
  },
  {
    id: "atlas", label: "3I/ATLAS", category: "Interstellar comet", color: "#7fffb0", position: [13, 1, -5],
    info: "3I/ATLAS (C/2025 N1) — the 3rd known interstellar object (found Jul 2025) and the largest yet: a blue-green C₂ coma, twin tails, and a rare sunward anti-tail. (2I/Borisov was the first interstellar comet, back in 2019.) It swung just inside Mars's orbit at perihelion and is leaving forever.",
    visit: { kind: "focus", cameraTarget: frame([13, 1, -5], 6, 1.4, 46) },
  },
  {
    id: "borisov", label: "2I/Borisov", category: "Interstellar comet", color: "#d8b890", position: [-14, -2, 7],
    info: "2I/Borisov — the 2nd interstellar object (2019), a ~1 km comet far richer in carbon monoxide than any local comet, discovered by amateur astronomer Gennady Borisov. The middle of the interstellar trio: 1I/'Oumuamua · 2I/Borisov · 3I/ATLAS.",
    visit: { kind: "focus", cameraTarget: frame([-14, -2, 7], 5, 1.2, 44) },
  },
  // ── Space mysteries (deep field; positions match Scene/DeepFieldMysteries) ──
  {
    id: "planetnine", label: "Planet Nine", category: "Mystery", color: "#3a5070", position: [42, -3, -26],
    info: "Planet Nine — a hypothesised 5–10 Earth-mass world orbiting hundreds of AU out. Its gravity would explain the clustered orbits of distant Kuiper bodies and the 'Kuiper Cliff', where the belt abruptly ends near 50 AU. Never yet seen.",
    visit: { kind: "focus", cameraTarget: frame([42, -3, -26], 12, 2.5, 46) },
  },
  {
    id: "tabby", label: "Tabby's Star", category: "Mystery", color: "#fff2d8", position: [-40, 9, -34],
    info: "Tabby's Star (KIC 8462852) — a Sun-like star ~1,470 ly away whose brightness drops irregularly by up to 22%, far more than a planet could cause. Comet swarms? A disintegrating world? An alien megastructure? Still unexplained.",
    visit: { kind: "focus", cameraTarget: frame([-40, 9, -34], 10, 2, 44) },
  },
  {
    id: "wow", label: "The Wow! Signal", category: "Mystery", color: "#7fe0ff", position: [33, 18, -38],
    info: "The Wow! Signal — on 15 Aug 1977 a 72-second narrowband radio burst arrived from the direction of Sagittarius, so strong the astronomer scrawled 'Wow!' on the printout (6EQUJ5). It never repeated. Origin: unknown.",
    visit: { kind: "focus", cameraTarget: frame([33, 18, -38], 10, 2, 44) },
  },
  {
    id: "frb", label: "Fast Radio Burst", category: "Mystery", color: "#d6c0ff", position: [-30, -16, 42],
    info: "Fast Radio Bursts — millisecond flashes of radio energy from across the universe, some releasing a Sun's-worth of energy in an instant. Most flash once and vanish; a few repeat. Their engines remain a mystery.",
    visit: { kind: "focus", cameraTarget: frame([-30, -16, 42], 10, 2, 44) },
  },
  {
    id: "kilonova", label: "Kilonova", category: "Cataclysm", color: "#ffd9a0", position: [-45, -12, -20],
    info: "A kilonova — two neutron stars merging. In seconds it forges the heavy elements the universe makes no other way: every gram of gold, platinum and uranium you've ever touched was born in a blast like this. GW170817 (2017) was the first seen in gravitational waves AND light.",
    visit: { kind: "focus", cameraTarget: frame([-45, -12, -20], 12, 2.5, 46) },
  },
  {
    id: "betelgeuse", label: "Betelgeuse", category: "Red supergiant", color: "#ff6a48", position: [40, 16, -28],
    info: "Betelgeuse — a red supergiant ~750× the Sun's radius (764 R☉ adopted, range 700–880 across studies). Put it where the Sun is and its surface (~3.55 AU) would engulf Mercury, Venus, Earth, Mars and the entire main asteroid belt, reaching about two-thirds of the way to Jupiter (Jupiter is at 5.20 AU). It's near the end of its life and will go supernova (astronomically soon). In 2025 the IAU formally named its long-suspected companion Siwarħa (α Ori B) — 0.6 M☉, orbiting every 5.78 years.",
    visit: { kind: "focus", cameraTarget: frame([40, 16, -28], 14, 3, 46) },
  },
  {
    id: "siwarha", label: "Siwarħa (α Ori B)", category: "Companion star", color: "#ffb47a", position: [40, 16.2, -28.1],
    info: "Siwarħa (α Ori B) — Betelgeuse's long-suspected close companion, formally named by the IAU in August 2025 (Howell et al.) and directly imaged in an expanding wake by HST in January 2026 (MacLeod et al., arXiv 2601.00470). A 0.6 M☉ star (about the size of a K-type dwarf) orbiting every 5.78 years at ~2.3 stellar radii from Betelgeuse's photosphere — well inside the supergiant's extended atmosphere. Drag against that atmosphere is spiralling it inward; complete engulfment expected in ~10,000 years.",
    visit: { kind: "focus", cameraTarget: frame([40, 16.2, -28.1], 8, 2, 42) },
  },
  {
    id: "etacarinae", label: "Eta Carinae", category: "Nebula", color: "#ff9a5a", position: [-70, 22, -38],
    info: "Eta Carinae — one of the most massive, luminous stars known (~100× the Sun), so unstable it nearly blew itself apart in the 1840s 'Great Eruption'. That blast flung out the two billowing lobes of the Homunculus Nebula, still expanding today. It's a supernova — maybe a hypernova — waiting to happen.",
    visit: { kind: "focus", cameraTarget: frame([-70, 22, -38], 14, 3, 46) },
  },
  {
    id: "einsteinring", label: "Einstein Ring", category: "Gravitational lens", color: "#cfe2ff", position: [-66, -26, 28],
    info: "An Einstein ring — a distant galaxy whose light is bent by a massive galaxy almost exactly in front of it into a near-perfect ring. Einstein predicted it in 1936; the first full ring was imaged in 1998, and Hubble + JWST now find them often. A direct, visible proof that mass curves spacetime.",
    visit: { kind: "focus", cameraTarget: frame([-66, -26, 28], 13, 2.6, 46) },
  },
  {
    id: "tardis", label: "TARDIS", category: "Easter egg", color: "#5b8dff", position: [30.4, 1.3, 1.0],
    info: "Bigger on the inside. It materialises near Saturn now and then — blink and you'll miss it.",
    visit: { kind: "focus", cameraTarget: frame([30.4, 1.3, 1.0], 2.4, 0.6, 38) },
  },
  {
    id: "hal", label: "HAL 9000", category: "Easter egg", color: "#ff5a4d", position: [25.2, 0.3, -1.1],
    info: "“I'm sorry, Dave. I'm afraid I can't do that.” The unblinking red eye drifting near Jupiter.",
    visit: { kind: "focus", cameraTarget: frame([25.2, 0.3, -1.1], 2.4, 0.6, 38) },
  },
  {
    id: "walle", label: "WALL·E", category: "Easter egg", color: "#e2a85a", position: [10.8, -0.5, -2.1],
    info: "A lonely little robot near Earth — his home — still dutifully doing his job.",
    visit: { kind: "focus", cameraTarget: frame([10.8, -0.5, -2.1], 2.6, 0.7, 38) },
  },
  // ── New deep-field exotics (rendered by Scene/ExoticObjects; positions match EXOTIC_RAW) ──
  {
    id: "sgra", label: "Sagittarius A*", category: "Black hole", color: "#ffd9a0", position: [70, 16, -52],
    info: "Sagittarius A* — the Milky Way's central SUPERMASSIVE black hole, ~4.3 million times the Sun's mass, 26,000 ly away in Sagittarius. The Event Horizon Telescope imaged its glowing accretion ring around the dark event-horizon shadow in 2022.",
    visit: { kind: "focus", cameraTarget: frame([70, 16, -52], 300, 80, 48) },
  },
  {
    id: "magnetar", label: "Magnetar", category: "Neutron star", color: "#bfe0ff", position: [-34, 22, -30],
    info: "A magnetar — a neutron star with the most intense magnetic field in the universe (a quadrillion gauss), strong enough to scramble matter itself. A single starquake can outshine the Sun's entire output in gamma rays for a tenth of a second.",
    visit: { kind: "focus", cameraTarget: frame([-34, 22, -30], 16, 3, 44) },
  },
  {
    id: "browndwarf", label: "Brown Dwarf", category: "Brown dwarf", color: "#b0432a", position: [54, -12, 26],
    info: "A brown dwarf — a 'failed star' (13–80 Jupiter masses): massive enough to fuse deuterium but never hydrogen, so it only smoulders a dim infrared red. The bridge between the biggest planets and the smallest stars.",
    visit: { kind: "focus", cameraTarget: frame([54, -12, 26], 22, 4, 44) },
  },
  {
    id: "rogue", label: "Rogue Planet", category: "Rogue planet", color: "#3a3640", position: [-22, -16, 33],
    info: "A rogue planet — a starless world flung from its system, drifting the galaxy in eternal dark and cold. Billions may wander the Milky Way; some could still hide warm liquid-water oceans under ice, heated from within.",
    visit: { kind: "focus", cameraTarget: frame([-22, -16, 33], 14, 3, 42) },
  },
  {
    id: "crab", label: "Crab Nebula", category: "Supernova remnant", color: "#6fe0d0", position: [82, 28, -44],
    info: "The Crab Nebula (M1) — the wreckage of a star that exploded in 1054 AD, recorded by astronomers worldwide. Glowing filaments of gas still expand at 1,500 km/s around the Crab Pulsar, a neutron star spinning 30 times a second at its heart.",
    visit: { kind: "focus", cameraTarget: frame([82, 28, -44], 110, 30, 48) },
  },
  {
    id: "trappist", label: "TRAPPIST-1", category: "Star system", color: "#ff8a4a", position: [-52, -22, -40],
    info: "TRAPPIST-1 — an ultracool red-dwarf star 40 ly away with SEVEN Earth-sized rocky planets, three in the habitable zone. The most planets ever found around one star — and one of the best places to hunt for life beyond the solar system.",
    visit: { kind: "focus", cameraTarget: frame([-52, -22, -40], 40, 9, 46) },
  },
  // ── Wave 2: scale & mystery (cosmological deep field) ──
  {
    id: "omegacen", label: "Omega Centauri", category: "Star cluster", color: "#ffe9c2", position: [-58, 30, -44],
    info: "Omega Centauri — the largest, brightest globular cluster orbiting the Milky Way: ~10 million ancient stars packed into a glittering ball. Hubble (2024-25) found signs of an intermediate-mass black hole hiding at its core — a missing link between stellar and supermassive black holes.",
    visit: { kind: "focus", cameraTarget: frame([-58, 30, -44], 16, 4, 46) },
  },
  {
    id: "ligo-gw", label: "Gravitational Wave", category: "Gravitational wave", color: "#9fd0ff", position: [52, -28, 36],
    info: "A gravitational-wave chirp (LIGO O4, e.g. GW250114) — two black holes spiralling together and merging, ringing spacetime itself. LIGO 'hears' the last orbits as a rising chirp; the merger can briefly outshine every star in the observable universe in gravitational energy.",
    visit: { kind: "focus", cameraTarget: frame([52, -28, 36], 12, 3, 46) },
  },
  {
    id: "reddots", label: "Little Red Dots", category: "Deep field", color: "#e0563f", position: [-50, -34, 30],
    info: "JWST's 'little red dots' — a surprise population of tiny, intensely red, compact objects from the universe's first billion years. Dust-shrouded baby galaxies, or overfed early black holes? Either way they're rewriting how fast cosmic structure grew.",
    visit: { kind: "focus", cameraTarget: frame([-50, -34, 30], 14, 3, 46) },
  },
  {
    id: "bootes-void", label: "Boötes Void", category: "Cosmic void", color: "#8aa0d8", position: [-44, 38, 28],
    info: "The Boötes Void — a near-empty bubble of space ~330 million light-years across, one of the largest known voids. So empty that if the Milky Way sat at its centre, we'd not have known other galaxies existed until the 1960s.",
    visit: { kind: "focus", cameraTarget: frame([-44, 38, 28], 24, 6, 48) },
  },
  {
    id: "great-attractor", label: "Great Attractor", category: "Cosmic structure", color: "#ffd0a0", position: [60, 20, -40],
    info: "The Great Attractor — a gravitational anomaly at the heart of Laniakea, our home supercluster. It is pulling the Milky Way and 100,000 other galaxies toward it at ~600 km/s, hidden behind our own galaxy's disk (the 'Zone of Avoidance').",
    visit: { kind: "focus", cameraTarget: frame([60, 20, -40], 22, 5, 48) },
  },
  {
    id: "hcb-wall", label: "Hercules–Corona Wall", category: "Cosmic structure", color: "#a0b6ff", position: [-64, -10, -48],
    info: "The Hercules–Corona Borealis Great Wall — the largest known structure in the universe: a filament of galaxies roughly 10 billion light-years across. It is so big it challenges the assumption that the universe looks the same everywhere.",
    visit: { kind: "focus", cameraTarget: frame([-64, -10, -48], 28, 7, 48) },
  },
  // ── Wave 3: diegetic megastructure cameos (deep field) ──
  {
    id: "monolith", label: "The Monolith", category: "Megastructure", color: "#3a4a6a", position: [-56, 8, -36],
    info: "A perfectly black slab in the exact ratio 1 : 4 : 9 (the squares of the first three integers), turning silently in the dark — 2001: A Space Odyssey. Wherever it appears, something is about to change.",
    visit: { kind: "focus", cameraTarget: frame([-56, 8, -36], 9, 2, 44) },
  },
  {
    id: "haloring", label: "Halo Installation", category: "Megastructure", color: "#7fb0a0", position: [58, -14, -30],
    info: "A Forerunner Halo — a ribbon-world curved into a ring you live on the INSIDE of, spun for gravity, the far side arcing overhead. Beautiful, and built as a weapon of last resort (Halo).",
    visit: { kind: "focus", cameraTarget: frame([58, -14, -30], 13, 3, 46) },
  },
  {
    id: "dyson", label: "Dyson Swarm", category: "Megastructure", color: "#ffd070", position: [-48, -28, -34],
    info: "A Dyson swarm under construction — a Kardashev Type-II project wrapping a star in collectors to harvest its entire energy output. Still half-built; one arc is bare.",
    visit: { kind: "focus", cameraTarget: frame([-48, -28, -34], 12, 3, 46) },
  },
  {
    id: "solgate", label: "The Ring", category: "Megastructure", color: "#3a6a8a", position: [46, 26, -32],
    info: "A protomolecule-built gate ring hanging silent in the dark — pass through its membrane into the 'slow zone' and the hub of a thousand gates (The Expanse).",
    visit: { kind: "focus", cameraTarget: frame([46, 26, -32], 11, 3, 46) },
  },
  {
    id: "citadel", label: "The Citadel", category: "Megastructure", color: "#9ab0c4", position: [-52, 18, -30],
    info: "A vast deep-space station — five Ward arms that can close like a flower around the central Presidium ring. Built, it turns out, by the Reapers as a trap (Mass Effect).",
    visit: { kind: "focus", cameraTarget: frame([-52, 18, -30], 11, 3, 46) },
  },
];

/* Free-floating cosmic objects (not tied to a planet) are pulled IN FRONT of the
   sunward-looking camera (−X, behind the Sun) so they match their render and are
   reachable as visible landmarks. Planet-tied easter-eggs + probes keep their +X
   themed neighbourhood (they must stay beside their planet to be seen at all). */
const FRONT_OF_SUN_CATEGORIES = new Set([
  "Black hole", "Portal", "Neutron star", "Mystery", "Interstellar object", "Interstellar comet", "Comet",
  "Brown dwarf", "Rogue planet", "Supernova remnant", "Star system", "Star cluster",
  "Nebula", "Gravitational lens", "Gravitational wave", "Deep field", "Cosmic void", "Cosmic structure", "Megastructure",
]);
const ANOMALY_OBJECTS = ANOMALY_RAW.map((o) => {
  const front = FRONT_OF_SUN_CATEGORIES.has(o.category);
  const raw = front ? frontOfSun(o.position) : o.position;
  const np = remapPosition(raw);
  const c = o.visit.cameraTarget;
  const off = [c.position[0] - o.position[0], c.position[1] - o.position[1], c.position[2] - o.position[2]];
  /* Re-aim the close-up framing offset along the NEW sunward direction when the
     object moved (so the visit camera still drops between it and the Sun). */
  const L = Math.hypot(np[0], np[1], np[2]) || 1;
  const offMag = Math.hypot(off[0], off[2]);
  const camPos = front
    ? [np[0] - (np[0] / L) * offMag, np[1] - (np[1] / L) * offMag + off[1], np[2] - (np[2] / L) * offMag]
    : [np[0] + off[0], np[1] + off[1], np[2] + off[2]];
  return {
    ...o,
    position: np,
    visit: { ...o.visit, cameraTarget: { position: camPos, lookAt: np, fov: c.fov } },
  };
});

/* Dwarf planets + named belt bodies — scannable, on the radar, with real
   facts; rendered by Scene/DwarfPlanets from the same data. */
const DWARF_OBJECTS = DWARF_PLANETS.map((d) => ({
  id: d.id,
  label: d.label,
  category: d.category || "Dwarf planet",
  color: d.color,
  position: d.position,
  info: d.info,
  visit: { kind: "focus", cameraTarget: frame(d.position, 1.4, 0.4, 36) },
}));

/* Named major moons — scannable hotspots near their parent planet (the live
   orbit is resolved in data/bodies.js). Static hotspot = parent t=0 pos +
   offset, matching how planet hotspots project (OverviewMap uses static pos). */
const MOON_OBJECTS = MOONS.map((m) => {
  const pp = DESTINATION_BY_ID[m.parent]?.position || [0, 0, 0];
  const position = [pp[0] + m.offset[0], pp[1] + m.offset[1], pp[2] + m.offset[2]];
  return {
    id: m.id,
    label: m.label,
    category: "Moon",
    color: m.color,
    position,
    info: m.info,
    visit: { kind: "focus", cameraTarget: frame(position, 1.2, 0.3, 34) },
  };
});

/* Projects as inspectable "probes" orbiting Mars (the Projects stop). Real
   projects → scannable craft you fly to; the scan card reads their stats as
   facts. Rendered by Scene/ProjectProbes from PROJECT_POSITIONS. */
const PROJECT_LIST = projects.slice(0, 8);
const MARS_POS = DESTINATION_BY_ID.projects?.position || [15.3, 0.3, 0.6];
const PROJECT_OBJECTS = PROJECT_LIST.map((p, i) => {
  const a = (i / PROJECT_LIST.length) * Math.PI * 2;
  const r = 2.6;
  const position = [MARS_POS[0] + Math.cos(a) * r, MARS_POS[1] + (i % 2 ? 0.7 : -0.7), MARS_POS[2] + Math.sin(a) * r];
  return {
    id: `project-${i}`, label: p.name, category: "Project", color: "#ff9a6a", position,
    info: p.description,
    visit: { kind: "focus", cameraTarget: frame(position, 1.6, 0.4, 36) },
  };
});

/* Render positions for the probe markers (kept in sync with the registry). */
export const PROJECT_POSITIONS = PROJECT_OBJECTS.map((o) => ({ id: o.id, position: o.position, color: o.color }));

export const OBJECTS = [...DESTINATION_OBJECTS, ...ANOMALY_OBJECTS, ...DWARF_OBJECTS, ...MOON_OBJECTS, ...PROJECT_OBJECTS];
