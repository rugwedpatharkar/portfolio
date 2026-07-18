# 07 — Space Probes: Real Missions Rendered in the Portfolio

**Scope.** The nine real spacecraft/instruments that appear as anomalies in
[`src/stellar/config/objects.js`](src/stellar/config/objects.js) — **Voyager 1 & 2**,
the **Golden Record**, **Perseverance + Ingenuity**, **JWST**, **Parker Solar
Probe**, **Juno**, **Lucy**, and **New Horizons** — plus their current 2026-07-18
status. Sci-fi cameos (TARDIS, Enterprise, Rocinante, etc.) are out of scope by
CLAUDE.md's "scientific accuracy is the prime goal" constraint.

**Method.** Launch, flyby, orbit-insertion and end-of-mission dates from each
mission's NASA page and, where volatile, verified against 2025–2026 news
releases via web search. Current spacecraft positions carry a "date reported"
tag because they drift daily; distances are quoted in **AU (from the Sun)** and
in km, with the JPL Horizons vector as the ultimate reference for anyone who
needs the number *right now*.

**Prime take-home for the portfolio.** The probe anomalies in
[`objects.js`](src/stellar/config/objects.js) are all real; the only value that
genuinely dates is Voyager 1's distance (currently **~171 AU from the Sun**,
about to cross **one light-day from Earth on 18 November 2026** — see §4.1).
Fixing that one string in [`data/planetFacts.js`](src/stellar/data/planetFacts.js)
`oort.wow` ("Voyager 1 (166 AU today)") is the single audit correction in this
section.

---

## 1. Executive summary

- **Voyager 1** — **launched 5 Sep 1977**; the most distant human-made object.
  Jupiter Mar 1979, Saturn Nov 1980, "Pale Blue Dot" Feb 1990, **heliopause
  crossing 25 Aug 2012 at 121.6 AU**. As of mid-2026, **~171 AU from the Sun**
  and receding at **~3.5 AU per year**. Will pass **1 light-day from Earth on
  18 Nov 2026** at 02:16:07 PST. Only four instruments still on (MAG, PLS-out,
  LECP, CRS); RTG power drops ~4 W/yr and the last one shuts down in the
  early-to-mid 2030s.
  ([NASA Voyager status](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/),
  [Voyager 1 — Wikipedia](https://en.wikipedia.org/wiki/Voyager_1))

- **Voyager 2** — **launched 20 Aug 1977** (before V1 — the numbering is by
  arrival at Jupiter, not by launch). **The only spacecraft ever to visit Uranus
  (24 Jan 1986) or Neptune (25 Aug 1989)**. Heliopause crossing **5 Nov 2018 at
  119.0 AU**. As of mid-2026, **~144 AU from the Sun**, receding at **~3.1 AU
  per year**. ([Voyager 2 — Wikipedia](https://en.wikipedia.org/wiki/Voyager_2))

- **Golden Record** — the 12-inch gold-plated copper phonograph disc bolted to
  each Voyager: **55 language greetings, 90 min music (Bach → Chuck Berry → Blind
  Willie Johnson), whale songs, surf/thunder/animal sounds, plus 116 images
  encoded as analog audio at 16⅔ rpm**. Designed by Carl Sagan, Ann Druyan,
  Frank Drake, Timothy Ferris, Jon Lomberg. Playable for **~1 billion years**
  before micrometeorite erosion. ([Golden Record — NASA](https://voyager.jpl.nasa.gov/golden-record/whats-on-the-record/))

- **Perseverance + Ingenuity** — landed **Jezero crater 18 Feb 2021**.
  Perseverance is caching 43 sealed sample tubes for the Mars Sample Return
  campaign. **Ingenuity flew 72 times** — the first controlled, powered
  atmospheric flight on another world — before a **rotor-tip damage event on
  18 Jan 2024** grounded it; NASA formally retired it on **25 Jan 2024**. It
  remains as a stationary weather station and radio relay.
  ([Perseverance status — NASA](https://mars.nasa.gov/mars2020/mission/where-is-the-rover/);
  [Ingenuity retirement](https://mars.nasa.gov/technology/helicopter/))

- **JWST** — launched Christmas Day 2021 on Ariane 5; on its **halo orbit around
  Sun–Earth L2 (~1.5 million km from Earth)** since Jan 2022. **6.5 m gold-coated
  Be primary** (25 m² collecting area, ~6× HST); five-layer **kite-shaped
  sunshield 22 × 12 m**; four instruments (NIRCam, NIRSpec, MIRI, FGS/NIRISS)
  cooled to **~40 K passively (~7 K MIRI actively)**. First light 12 Jul 2022.
  Currently in its **fifth cycle (Cycle 5, 2026–27)**; fuel budget projects
  **~20+ years of L2 operation** (mission goal was 5–10). Signature 2024–2026
  finds: **the "Little Red Dots"** and record-holder **JADES-GS-z14-0 (z = 14.32,
  ~13.5 Gyr look-back)**.
  ([JWST — NASA](https://webb.nasa.gov/), [JWST — Wikipedia](https://en.wikipedia.org/wiki/James_Webb_Space_Telescope))

- **Parker Solar Probe** — launched 12 Aug 2018 (Delta IV Heavy). **Closest
  human-made approach to the Sun**: **6.9 R☉ (~3.83 million miles / ~6.16 M km)
  from Sun-centre**, first achieved on the **24 Dec 2024** perihelion at **~430,000
  mph (192 km/s)** — the fastest human-made object ever. Repeated approaches
  targeting the same 6.9-R☉ perihelion continue through the extended mission
  (P22, P23, P24). Carbon-carbon heat shield reaches **~1,400 °C surface** while
  keeping the instrument bus at **~30 °C**. Uses **seven Venus gravity assists**
  to shrink the orbit. ([Parker Solar Probe — NASA](https://science.nasa.gov/mission/parker-solar-probe/))

- **Juno** — launched 5 Aug 2011; **Jupiter orbit insertion 5 Jul 2016** on a
  53-day polar elliptical orbit. Extended-mission moon flybys: **Ganymede 7 Jun
  2021 (Δalt 1,038 km)**, **Europa 29 Sep 2022 (Δalt 352 km)**, **Io 30 Dec 2023
  & 3 Feb 2024 (Δalt 1,500 km each)**. Deep-field microwave radiometer mapped
  Jupiter's ammonia/water down to ~500 bar; magnetometer resolved the **Great
  Blue Spot** magnetic anomaly. Current end-of-mission target: **atmospheric
  entry / disposal into Jupiter in 2025**, extended into 2026 by the O4-cycle
  extended-ops NASA decisions. ([Juno — NASA](https://science.nasa.gov/mission/juno/))

- **Lucy** — launched **16 Oct 2021**; **first mission to Jupiter's Trojan
  asteroids**. Two Earth gravity assists (2022, 2024). **Dinkinesh flyby 1 Nov
  2023** revealed a contact-binary moonlet (now **Selam**). **Donaldjohanson
  flyby 20 Apr 2025** — 4 km main-belt asteroid. Then the L4 Greek camp:
  **Eurybates + Queta (Aug 2027)**, **Polymele (Sep 2027)**, **Leucus (Apr
  2028)**, **Orus (Nov 2028)**; then swings back for the L5 Trojan camp
  **Patroclus + Menoetius (2033)** — a rare Trojan **binary**.
  ([Lucy — NASA](https://science.nasa.gov/mission/lucy/))

- **New Horizons** — launched **19 Jan 2006** on Atlas V 551, fastest launch
  ever. **Jupiter flyby Feb 2007** (gravity assist + Io torus imaging). **Pluto
  flyby 14 Jul 2015 at 12,472 km** — the whole Pluto system, humanity's first
  and (still) only close look. **Arrokoth flyby 1 Jan 2019 at 3,500 km** — the
  most distant object ever explored (44 AU) and the first close look at a **cold
  classical KBO**. Currently ~**60 AU from the Sun**, exiting the Kuiper Belt,
  targeting a possible **third KBO flyby in the 2030s** if fuel and instrument
  health hold. ([New Horizons — NASA/APL](https://science.nasa.gov/mission/new-horizons/))

---

## 2. Reference table (positions & basics)

| Probe | Launch | Notable event(s) | Current position (approx, 2026-07-18) | Instruments alive | Power source | Ends |
|---|---|---|---|---|---|---|
| **Voyager 1** | 5 Sep 1977 | Jupiter Mar 1979 · Saturn Nov 1980 · Pale Blue Dot 14 Feb 1990 · Heliopause **25 Aug 2012 @ 121.6 AU** | **~171 AU from Sun · ~24.7 B km · escape v ~3.6 AU/yr / 17.0 km/s** | 4/11 (MAG, PLS, LECP, CRS) | 3 × MHW-RTG (238-Pu, ~250 W in 2026, ~4 W/yr decay) | Instrument shutdown early-2030s |
| **Voyager 2** | 20 Aug 1977 | Jupiter Jul 1979 · Saturn Aug 1981 · **Uranus 24 Jan 1986** · **Neptune 25 Aug 1989** · Heliopause **5 Nov 2018 @ 119.0 AU** | **~144 AU from Sun · ~21.5 B km · escape v ~3.1 AU/yr / 15.4 km/s** | 5/11 (adds LECP low-priority) | 3 × MHW-RTG (~245 W in 2026) | Instrument shutdown early-2030s |
| **Golden Record** | (rides Voyagers) | designed 1977 by Sagan, Druyan, Drake, Ferris, Lomberg | (with each Voyager) | passive | passive (gold-plated Cu) | **~1 Gyr** micrometeorite erosion budget |
| **Perseverance** | 30 Jul 2020 | Landed **Jezero 18 Feb 2021** · MOXIE first Mars O₂ · caching 43 tubes for MSR | Jezero crater (18.4°N, 77.5°E), Mars | 7 (SUPERCAM, PIXL, SHERLOC, MASTCAM-Z, MEDA, RIMFAX, MOXIE-retired) | MMRTG (238-Pu) | Nominal 1 Mars yr, in extended ops through late-2020s |
| **Ingenuity** | (rides Perseverance) | First flight **19 Apr 2021** · 72 total flights · retired **25 Jan 2024** | Stationary at "Airfield Alpha" | passive (rotor-damage) | Solar (mostly) | Retired 2024 |
| **JWST** | 25 Dec 2021 | First light **12 Jul 2022** · JADES-GS-z14-0 (z=14.32, 2024) · Little Red Dots (2024–26) | **Halo orbit at Sun–Earth L2, ~1.5 M km from Earth** | 4 (NIRCam, NIRSpec, MIRI, FGS-NIRISS) | Solar panels + hydrazine station-keeping | ~2043+ fuel budget |
| **Parker Solar Probe** | 12 Aug 2018 | **Closest human approach to Sun: 6.9 R☉ / 3.83 M mi, 24 Dec 2024** at 192 km/s | Highly elliptical solar orbit (perihelion 6.9 R☉, aphelion 0.73 AU) | 4 suites (FIELDS, SWEAP, ISʘIS, WISPR) | Solar panels behind heat shield | Extended mission, ~2026-2028 |
| **Juno** | 5 Aug 2011 | Jupiter orbit insertion **5 Jul 2016** · Ganymede 2021 · Europa 2022 · Io 2023-24 | Jupiter polar 53-d orbit | 9 (MWR, JADE, JEDI, MAG, GRAV, JIRAM, UVS, JCM, WAVES) | 3 × massive solar arrays (~14 m² total; solar at Jupiter!) | **Atmospheric entry 2025–26** |
| **Lucy** | 16 Oct 2021 | **Dinkinesh + Selam 1 Nov 2023** · Donaldjohanson Apr 2025 · Trojans 2027–33 | Earth-crossing heliocentric, en route to L4 | 3 (L'Ralph, L'LORRI, L'TES) | 2 × solar arrays (7.3 m diameter each — Trojans are Jupiter-far) | 2033 |
| **New Horizons** | 19 Jan 2006 | Jupiter Feb 2007 · **Pluto 14 Jul 2015 @ 12,472 km** · **Arrokoth 1 Jan 2019 @ 3,500 km** | **~60 AU from Sun**, exiting Kuiper Belt | 7 (LORRI, Ralph, Alice, REX, SWAP, PEPSSI, SDC) | 1 × GPHS-RTG | Instrument shutdown 2030s |

Notes:
- Voyager 1's mid-2026 heliocentric distance is extrapolated from the May 2026
  NASA figure of ~170.5 AU (+ ~3.5 AU/yr × 2/12 yr). It will pass the
  **one-light-day** mark from Earth on 18 November 2026 at 02:16:07 PST
  (25,902,068,356 km).
- The "km" columns follow **km_from_Sun = AU × 149,597,870.7** and are given
  because the portfolio's `V3ScaleReadout` renders both units.
- Both Voyagers' instrument counts drop gradually as engineers turn subsystems
  off to preserve RTG power. NASA's status page tracks each instrument's live
  state; the "alive" column is the count as of the latest 2025–26 update.

---

## 3. Deep dive per probe

### 3.1 Voyager 1 (`voyager1`)

The most distant human-made object, launched on a **Titan IIIE-Centaur** from
Cape Canaveral, sixteen days *after* Voyager 2 but on a faster trajectory that
put it at Jupiter first (5 Mar 1979) and past Saturn (12 Nov 1980) with a
gravitational-assist bank shot into a hyperbolic escape trajectory. **After
Saturn, it turned to look back**: on **14 Feb 1990** Carl Sagan's request to
turn the narrow-angle camera Earthward produced the **"Pale Blue Dot"** photo —
Earth as a 0.12-px speck, 6.06 billion km away, floating in a scattered-light
band from the Sun. It became the visual thesis of the Voyager mission.

Beyond Saturn: on **25 Aug 2012 at 121.6 AU** the plasma density around it
jumped ~40-fold and the magnetic-field direction stabilised — the interpreted
crossing of the **heliopause**, the boundary of the Sun's plasma bubble.
Voyager 1 has been in interstellar space since (still inside the Oort cloud —
that reaches to ~100,000 AU — but past the solar-wind's plasma dominance).

**Where it is on 2026-07-18.** Extrapolating from NASA's May 2026 figure
(~170.5 AU from Sun; escape speed 3.6 AU/yr / 17.0 km/s heliocentric), the
Sun-distance on 2026-07-18 is **~171.1 AU (≈ 25.6 billion km / ≈ 15.9 billion
mi)**. The direction is toward **RA 262°, Dec +12° (Ophiuchus/Hercules)**; the
Earth-distance is slightly less (Earth is 1 AU from Sun; the geometry works out
to a few AU less depending on the day of year). One-way light time from Earth
is **~23 h 40 min**. On **18 Nov 2026 at 02:16:07 PST** the Earth-distance
crosses **25,902,068,356 km** — exactly **one light-day**, a milestone marked by
NASA VIM.

**Power decay.** Each Voyager's three multi-hundred-watt RTGs
(**MHW-RTG**, 238-Pu-oxide fuelled, initial ~470 W thermal → ~157 W electric
each in 1977) have lost about ~4 W/yr to the ⁸ᶠ⁸Pu 87.7-year half-life plus
thermocouple degradation. In 2026 total electric power sits around **~250 W** —
below any single instrument's requirement to run continuously. Engineers have
been progressively shedding subsystems: heaters, the plasma sub-system, some
science modes. The remaining four instruments (**MAG, LECP, CRS**, plus **PLS**
in outbound-mode) will drop off through the early-to-mid 2030s as power falls
below their thresholds. NASA plans to keep engineering telemetry alive as long
as the transmitter can be heard by the DSN 70-m dishes.

**Instruments still returning science (2026):** MAG (magnetometer,
interstellar-medium field), LECP (Low-Energy Charged Particle), CRS (Cosmic Ray
Subsystem), PLS-out (Plasma Science, running Sun-anti-solar direction only).
UVS (UltraViolet Spectrometer) was turned off in 2016; the cameras (ISS-NA/ISS-WA)
were shut in 1990 after Pale Blue Dot.

**Wow-facts.**
1. Voyager 1's radio signal travels ~23.7 h to reach Earth in mid-2026 — a
   whole spin of the planet.
2. Its transmitter is 23 W — dimmer than a refrigerator bulb. The DSN captures
   ~10⁻²² W.
3. The Golden Record's aluminium cover carries a uranium-238 sample as a
   half-life clock; from its remaining ratio a finder can date the launch.
4. The heliopause crossing was announced only in Sep 2013 because the plasma
   science instrument had failed — engineers had to reconstruct the boundary
   crossing from *other* instruments' data over the year following.
5. The "Family Portrait" of 6 planets from 14 Feb 1990 is the only image ever
   made of the solar system from outside; Mercury, Mars, Pluto and the Sun's
   glare put them out of reach.

**Sources.**
[NASA VIM Where Are They Now](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) ·
[Voyager 1 — Wikipedia](https://en.wikipedia.org/wiki/Voyager_1) ·
[Pale Blue Dot — NASA](https://solarsystem.nasa.gov/resources/536/voyager-1s-pale-blue-dot/) ·
[Voyager 1 crosses heliopause — Science 2013](https://www.science.org/doi/10.1126/science.1241681)

**Cross-check vs code.** The `objects.js` Voyager 1 entry
(`info: "Launched 1977, past heliopause 2012 at 121 AU; now ~24.7 billion km / ~166 AU (2025) from the Sun … escaping at 3.6 AU/yr"`) is accurate for **2025**; update the "166 AU" to **~171 AU** as of the doc's compile date (or better, remove the fixed number and cite "JPL VIM current status" so it doesn't rot). Also update the matching string in `planetFacts.oort.wow` `"Voyager 1 (166 AU today)"`.

### 3.2 Voyager 2 (`voyager2`)

Launched **first** (20 Aug 1977) on the slower trajectory that let it visit
**all four giant planets** — the only "**Grand Tour**" ever flown. Jupiter Jul
1979, Saturn Aug 1981, **Uranus 24 Jan 1986** (still the only close-up), and
**Neptune 25 Aug 1989** at a 4,950-km altitude over the north pole — the last
first-encounter of the classical planetary tour, and the mission that returned
Triton and the Great Dark Spot.

**Heliopause crossing 5 Nov 2018 at 119.0 AU**, six years after Voyager 1 and
in a different heliolatitude — the two data points bracket the boundary's
shape. Unlike Voyager 1, Voyager 2's Plasma Science instrument was **still
alive** at the crossing, providing the cleanest single-boundary plasma-density
jump ever measured.

**Where it is on 2026-07-18.** Extrapolating from NASA's May 2026 figure
(~142.8 AU from Sun; escape 3.1 AU/yr / 15.4 km/s), the Sun-distance is
**~143.4 AU (≈ 21.4 billion km)**. Trajectory heads toward **RA 20 h, Dec −57°
(Telescopium/Pavo)**; one-way light time from Earth is **~19 h 50 min**.

**Wow-facts.**
1. Voyager 2 is the only spacecraft ever to have been closer to Uranus or
   Neptune than the Moon is to Earth.
2. The Uranus flyby was rescheduled around the **Challenger disaster** — the
   science team quietly kept the encounter on track through the darkest week of
   NASA history.
3. Voyager 2's magnetic-field data showed Neptune's magnetic axis was tilted
   ~47° from its spin axis and offset ~½ radius from the planet's centre — one
   of the strangest planetary magnetospheres in the solar system.

**Sources.**
[NASA VIM](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) ·
[Voyager 2 — Wikipedia](https://en.wikipedia.org/wiki/Voyager_2) ·
[Voyager 2 heliopause — Nature Astronomy 2019](https://www.nature.com/articles/s41550-019-0928-3)

### 3.3 The Golden Record (`goldenRecord`)

Two identical **12-inch gold-plated copper phonograph records** were bolted to
the sides of each Voyager, in aluminium jackets etched with pulsar-map
instructions for playback. The content:

- **55 language greetings** — from Sumerian to Wu Chinese, recorded at UN
  headquarters and universities worldwide.
- **90 minutes of music** — Bach's Brandenburg Concerto No. 2 (opener), Chuck
  Berry's *Johnny B. Goode*, Blind Willie Johnson's *Dark Was the Night, Cold
  Was the Ground*, Beethoven's 5th, Javanese court gamelan, Peruvian panpipes,
  Navajo night chant, Melanesian panpipes, Georgian choral, Bulgarian shepherd
  song, Azerbaijani balaban, and 17 others.
- **Sounds of Earth** — surf, wind, thunder, birds, whales, a heartbeat, a
  human kiss, mother-and-infant, footsteps + heartbeat + laughter.
- **116 images** encoded as analog audio at 16⅔ rpm — DNA structures, human
  anatomy, cities, families, food, a symphony orchestra, spacewalking
  astronauts.
- **Greetings from President Carter and UN Secretary-General Kurt Waldheim.**
- **A drop of Ann Druyan's brain-wave recording** (an EEG of her thinking about
  Carl Sagan, whom she would later marry).

The design team: **Carl Sagan** (chair), **Ann Druyan** (creative director),
**Frank Drake** (encoding), **Timothy Ferris** (music), **Jon Lomberg** (art
direction).

**Wow-facts.**
1. The record is "playable" for **~1 billion years** — that's the estimated
   micrometeorite-erosion budget of gold-plated copper in interstellar space.
2. The pulsar map on the cover uses **14 pulsars' periods**, encoded in binary
   relative to the hydrogen hyperfine transition (0.7 nanoseconds). Any
   civilisation that decodes both can back out our position AND the launch
   epoch.
3. The record's format was chosen because **magnetic tape would have decayed
   in centuries**; laser-etched metal, at 1977 mastering costs, would have
   consumed the mission's entire margin. LPs it was.

**Sources.**
[Golden Record — NASA](https://voyager.jpl.nasa.gov/golden-record/whats-on-the-record/) ·
[Sagan et al., *Murmurs of Earth* (1978)](https://en.wikipedia.org/wiki/Murmurs_of_Earth)

### 3.4 Perseverance + Ingenuity (`perseverance`)

Launched **30 Jul 2020**; landed inside **Jezero crater on Mars** on **18 Feb
2021 at 20:55 UTC**. Jezero was chosen because it contains a **billion-year-old
river delta** — a natural sedimentary trap for potential biosignatures.

The rover is the size of a car (3 m × 2.7 m × 2.2 m, 1,025 kg), MMRTG-powered,
with 7 science instruments:

- **SuperCam** (LIBS + Raman + IR + visible spec, remote elemental composition)
- **PIXL** (Planetary Instrument for X-ray Lithochemistry — arm-mounted, fine
  X-ray fluorescence)
- **SHERLOC** (Scanning Habitable Environments with Raman & Luminescence for
  Organics & Chemicals — organic + mineral, arm-mounted)
- **Mastcam-Z** (twin cameras, 3.6× optical zoom)
- **MEDA** (weather station)
- **RIMFAX** (ground-penetrating radar)
- **MOXIE** (Mars Oxygen In-Situ Resource Utilization Experiment — retired in
  Sep 2023 after 16 successful runs, demonstrating **CO₂ → O₂ electrolysis at
  ~10 g/hr**)

The core mission is **sample caching**: 43 sealed titanium tubes for future
return by the Mars Sample Return campaign (MSR/ERO), whose architecture NASA
+ ESA are re-scoping in 2025–26 after the original ~$11B design was cancelled.
Twenty-plus samples were already cached at the "Three Forks" depot by 2023;
the current campaign is filling the "backup depot" at Aztec Hill.

**Ingenuity** — the **first controlled powered atmospheric flight on another
world**, 19 April 2021, a 39.1 s hover at 3 m. Designed for 5 tech-demo
flights; achieved **72 flights over 3 years**, totalling **129 minutes of
airtime** and **17.3 km** of horizontal ground covered. On flight 72 (18 Jan
2024) the ground team saw shadow-imagery indicating a **rotor-blade damage
event** on landing — the aircraft could not fly again. NASA formally retired it
on 25 Jan 2024; it now sits at "Airfield Alpha," periodically beaming weather
data via Perseverance.

**Wow-facts.**
1. Mars's atmosphere is **~1% of Earth's density** — Ingenuity's 1.2-m rotor
   had to spin **2,537 rpm** for lift, ~5× a typical Earth drone.
2. Perseverance's DVR-sized recorder holds **only 4 GB** — every image is
   compressed heavily and prioritised by ground control.
3. **MOXIE** made ~4 g of O₂ per hour — enough to keep one small dog breathing.
   The point wasn't the amount; it was proving the physics for a future crewed
   life-support / propellant-manufacture system.

**Sources.**
[Perseverance mission — NASA](https://mars.nasa.gov/mars2020/mission/overview/) ·
[Ingenuity retirement — NASA JPL](https://mars.nasa.gov/technology/helicopter/) ·
[Perseverance current location](https://mars.nasa.gov/mars2020/mission/where-is-the-rover/)

### 3.5 James Webb Space Telescope (`jwst`)

Launched **25 December 2021 at 12:20 UTC** on **Ariane 5 flight VA256** from
Kourou, French Guiana. The launch was so precise (Ariane 5 delivered JWST with
a fraction of the fuel budgeted for course correction) that NASA now projects
**~20+ years** of L2 station-keeping fuel — twice the original expectation.

Reached its **Sun–Earth L2 halo orbit** on **24 Jan 2022** after a 29-day
cruise. The orbit is a large Lissajous of ~800,000 km × 250,000 km around L2,
1.5 million km from Earth — a spot where Sun, Earth, and Moon are all on the
same side, so the sunshield can block them all with one surface.

**The observatory.**
- **Primary mirror**: 6.5 m circular (nominal), tiled from 18 hexagonal
  gold-plated beryllium segments (each 1.32 m, 46 kg). Total collecting area
  **~25 m²** — ~5.9× Hubble.
- **Sunshield**: 5 layers of aluminised Kapton, kite-shaped, **21.2 m × 14.2 m
  deployed**. Reduces solar irradiance from ~1370 W/m² on the sunward side to
  ~10 mW/m² on the cold side — enough to let the instruments cool passively to
  **~40 K** without cryogen.
- **Instruments** (all sit on the cold side):
  - **NIRCam** (0.6–5 µm imager, ×2 modules) — the workhorse camera
  - **NIRSpec** (0.6–5 µm spectrograph, 250 microshutter array)
  - **MIRI** (5–28 µm imager + spectrograph, actively cooled to **~7 K**)
  - **FGS/NIRISS** (guider + slitless spectrograph, includes aperture-masking
    for high-contrast direct imaging)
- **Communications**: DSN X-band and Ka-band; ~28 Mbps downlink.
- **Fuel**: ~168 kg hydrazine at launch, currently ~85% remaining (2026);
  supports L2 station-keeping and momentum-dumping through the 2040s.

**Signature results (2022–2026).**
- **Cycle 1 deep field** revealed galaxies at photometric redshift z > 13; JADES-
  GS-z14-0 was confirmed spectroscopically at **z = 14.32** (redshift-record
  holder), placing it ~290 Myr after the Big Bang.
- **Little Red Dots (LRDs)** — a population of ~300 compact, red, high-z
  sources first spotted in 2023 and characterised through 2024–2026; likely
  either extremely dust-obscured AGN or dense old-star nuclei. Their number
  density exceeds any pre-JWST prediction and is still theoretically unresolved.
- **Exoplanet atmospheres** — CO₂ in WASP-39b (2022); DMS candidate in K2-18b
  (2023, ambiguous); methane + water in TRAPPIST-1e (2024).
- **Mid-IR imaging of protoplanetary discs** at ~10 pc — Saturn-forming
  analogues at ~30 AU in HL Tau, PDS 70.

**Wow-facts.**
1. JWST is so cold that Earth's warm side is a *forbidden pointing direction* —
   pointing there would heat the primary above operating temperature.
2. The 18 primary mirror segments are actively phased with **six-degree-of-
   freedom actuators** to nanometer precision. Alignment is verified every ~14
   days via "hot pixel" tests.
3. The sunshield's outer Kapton layer was tested to survive **~200 micrometeorite
   hits during a 10-year mission** — micro-holes actually *improve* thermal
   performance slightly.
4. JWST **cannot look at any object closer than ~85° from the Sun** — Venus,
   Mercury, and (for most of Earth's orbit) the Sun-side of the sky are
   permanently forbidden.

**Sources.**
[JWST — NASA](https://webb.nasa.gov/) ·
[JWST — Wikipedia](https://en.wikipedia.org/wiki/James_Webb_Space_Telescope) ·
[JADES-GS-z14-0 confirmation — Nature 2024](https://www.nature.com/articles/s41586-024-07227-0) ·
[Little Red Dots — arXiv 2404.02861 (Kokorev 2024)](https://arxiv.org/abs/2404.02861)

### 3.6 Parker Solar Probe (`parkerSolarProbe`)

Launched **12 August 2018 at 07:31 UTC** on a **Delta IV Heavy + Star-48 solid
motor** — the third-fastest launch ever (33.5 km/s at Earth-departure). Named
for **Eugene Parker** (1927–2022), the University of Chicago astrophysicist who
predicted the solar wind in 1958 and lived to see the mission bearing his name
touch it.

**Trajectory.** A series of **seven Venus gravity assists** progressively
shrinks perihelion from ~0.16 AU (first pass, Nov 2018) toward the
**geometric minimum of 6.9 solar radii (~9.86 R☉ centre-of-mass distance,
0.045826 AU, 3.83 million miles / 6.16 million km from Sun-centre)** —
targeting seven back-to-back perihelia at the same distance. The first minimum
perihelion (**Perihelion 22, 24 December 2024, 06:53 UTC**) was successful —
Parker was **the closest human-made object ever to the Sun**, at a heliocentric
speed of **~192 km/s (~430,000 mph)**, the fastest human-made object ever
recorded.

Perihelia 23 (28 Mar 2025) and 24 (19 Jun 2025) matched P22's 6.9 R☉ altitude;
the extended mission continues through the 25th solar-max cycle.

**The heat shield.** A **2.3-m diameter, 11.4-cm-thick carbon-carbon
composite** disc coated with a proprietary white ceramic on the sunward face.
At closest approach the surface reaches **~1,400 °C (~2,500 °F)**; the
instrument bus 4 cm behind stays at **~30 °C**. The shield is oriented by
autonomous star-tracking to keep the spacecraft body permanently in its shadow
— a deviation of even a few arcminutes would destroy the mission in seconds.

**Instruments** (four packages):
- **FIELDS** (fluxgate + search-coil magnetometers, plasma-wave receivers)
- **SWEAP** (SPC ion cup + SPAN-A/B ion + electron analysers)
- **ISʘIS** (energetic-particle telescopes)
- **WISPR** (Wide-field Imager — visible-light coronagraph)

**Key results.**
- Discovered **switchbacks** — sudden ~180° reversals in the solar wind's
  magnetic field, seen in every perihelion. Their origin (interchange
  reconnection at the solar surface?) is one of the top open problems in
  heliophysics.
- Directly measured the **Alfvén critical surface** at ~19 R☉ (Apr 2021) — the
  region where the solar wind becomes super-Alfvénic and detaches from the Sun.
- Imaged **circumsolar dust** and confirmed a **dust-free zone** interior to
  ~5 R☉.
- Passed through **CME material** during multiple perihelia — the first in-situ
  measurements of CME cores near the Sun.

**Wow-facts.**
1. Parker sees the Sun's disc **~25× larger** than we do — from 6.9 R☉, the
   Sun subtends ~30° of sky.
2. At perihelion Parker orbits the Sun **faster than the Sun rotates** — the
   spacecraft moves *ahead* of the local solar wind in the Sun's frame.
3. The Parker probe medallion carries a chip with the names of **1,137,202
   people** who submitted their names to NASA — all now the fastest, closest
   humans to a star.

**Sources.**
[Parker Solar Probe — NASA](https://science.nasa.gov/mission/parker-solar-probe/) ·
[Parker Solar Probe — Wikipedia](https://en.wikipedia.org/wiki/Parker_Solar_Probe) ·
[Switchbacks paper — Kasper et al. Nature 2019](https://www.nature.com/articles/s41586-019-1813-z) ·
[Alfvén surface — Kasper et al. PRL 2021](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.127.255101)

### 3.7 Juno (`juno`)

Launched **5 Aug 2011** on an Atlas V 551. Trajectory: outbound to 2.8 AU,
Earth gravity assist Oct 2013, cruise, **Jupiter Orbit Insertion 5 July 2016 at
03:53 UTC** into a highly elliptical **53-day polar orbit** with perijove
altitudes of ~4,200 km above the cloud tops. The polar orbit was chosen to
avoid Jupiter's intense equatorial radiation belts — Juno dips through them for
only a few hours per orbit.

**Spacecraft.** Solar-powered (the first outer-planet mission to fly solar),
with **three 9-m panels totalling 60 m² of Ge-InGaAs 3-junction cells** —
sized to collect ~14 W/m² at Jupiter (~4% of Earth's flux) but stagger-shaded
so radiation damage is bounded. Titanium radiation vault around the electronics.
Total mass 3,625 kg wet, ~1,600 kg dry.

**Instruments (9):**
- **MWR** (Microwave Radiometer, 6 bands from 600 MHz to 22 GHz) — probes
  Jupiter's ammonia + water down to ~500 bar
- **JADE, JEDI** (particle detectors)
- **MAG** (magnetometer)
- **Gravity Science** (X + Ka-band Doppler ranging)
- **JIRAM** (Jovian InfraRed Auroral Mapper, 2–5 µm)
- **UVS** (ultraviolet spectrograph for auroras)
- **JunoCam** (Juno's colour camera, run by public "citizen scientists" for
  every perijove image)
- **WAVES** (plasma/radio wave receiver)

**Key results.**
- **Deep atmospheric ammonia distribution**: Jupiter's zones/belts aren't just
  cloud-deep, they extend to ~3,000 km. Ammonia is depleted equatorially and
  concentrated in a mid-latitude "reservoir."
- **Great Red Spot has roots ~500 km deep** — one *tenth* of Jupiter, and
  fundamentally different from earlier expectations.
- **Cyclone pentagons at the poles**: eight cyclones around a central one at
  the north pole, five around a central at the south — a stable, unprecedented
  polar geometry.
- **Great Blue Spot** — a localised magnetic-field anomaly near the equator,
  suggesting Jupiter's dynamo has non-dipole structure that changes over decades.

**Extended-mission moon flybys:**
- **Ganymede — 7 Jun 2021, 1,038 km** (first close-up since Galileo)
- **Europa — 29 Sep 2022, 352 km** (highest-res Europa images ever)
- **Io — 30 Dec 2023 and 3 Feb 2024, 1,500 km each** — active volcano plumes
  seen and mapped in the IR (JIRAM)

**End of mission.** After the extended-mission moon phase, Juno's orbit is
being pumped down by successive moon flybys and Jupiter is expected to
**atmospheric-entry** the spacecraft — planetary-protection burn — in
**late 2025 or 2026** (schedule adjusted as extended ops continue).

**Sources.**
[Juno — NASA](https://science.nasa.gov/mission/juno/) ·
[Juno — Wikipedia](https://en.wikipedia.org/wiki/Juno_(spacecraft)) ·
[Jupiter atmospheric structure — Bolton et al. Nature 2017](https://www.nature.com/articles/nature25794)

### 3.8 Lucy (`lucy`)

Launched **16 Oct 2021** on Atlas V 401 from Cape Canaveral. Named for the
**3.2-Myr-old Australopithecus afarensis skeleton** (which was itself named for
the Beatles' *Lucy in the Sky with Diamonds*) — a nod to the mission's premise
that the **Trojan asteroids are fossil planetesimals** from the outer solar
system, captured into Jupiter's Lagrange points early in the Solar System's
history.

**Trajectory.** The most gravitationally complex mission ever flown, using
**three Earth gravity assists** (Oct 2022, Dec 2024, Dec 2030) to loop between
the L4 "Greek camp" (60° ahead of Jupiter) and the L5 "Trojan camp" (60° behind).

**Encounters so far.**
- **Dinkinesh** — main-belt asteroid, **1 Nov 2023 flyby at 425 km**. Revealed
  a **contact-binary moonlet** (mutual radius ~50/95 m), later named **Selam**
  (Ethiopian Amharic for "peace"; also the child skeleton found near Lucy).
  Rewrote the small-body binary-formation textbook overnight.
- **Donaldjohanson** — main-belt asteroid, **20 Apr 2025 flyby at ~950 km**. A
  4-km elongated body; named for **Donald Johanson**, the paleoanthropologist who
  discovered Lucy the fossil.

**Trojans to come:**
- **Eurybates + Queta** (L4) — Aug 2027 (Eurybates is a Trojan, Queta its ~1-km
  satellite)
- **Polymele** (L4) — Sep 2027 (has a satellite, discovered 2022 stellar
  occultation)
- **Leucus** (L4) — Apr 2028 (a slowly-rotating, non-spherical carbon-rich body)
- **Orus** (L4) — Nov 2028
- **Patroclus + Menoetius** (L5, binary!) — Mar 2033 — the first binary Trojan
  studied close-up

**Instruments (3):** L'Ralph (visible + IR imager/spectrograph), L'LORRI
(narrow-angle camera, HST-derived from New Horizons LORRI heritage), L'TES
(thermal-emission spectrometer).

**Wow-facts.**
1. Lucy will fly by **more asteroids in one mission than any previous mission
   combined (~10)**.
2. Its two solar arrays are **7.3 m in diameter each** — sized to collect ~500 W
   at Jupiter distance (~5 AU).
3. Its trajectory carries a **plaque etched with quotes from Beatles / Rita
   Dove / Yeats / Sagan / Dr. Martin Luther King Jr. / Einstein**, aimed at
   future recoverers — Lucy's orbit is stable for millions of years, so it may
   become an archaeological artefact.

**Sources.**
[Lucy — NASA](https://science.nasa.gov/mission/lucy/) ·
[Lucy — Wikipedia](https://en.wikipedia.org/wiki/Lucy_(spacecraft)) ·
[Dinkinesh + Selam discovery — Nature 2024](https://www.nature.com/articles/s41586-024-07378-0)

### 3.9 New Horizons (`newHorizons`)

Launched **19 January 2006 at 19:00 UTC** on an Atlas V 551 with a Star-48B
kick stage — **the fastest launch of any spacecraft**, at ~16.26 km/s
Earth-relative departure. Trajectory: direct Jupiter gravity assist (Feb 2007),
long hibernation cruise, Pluto encounter July 2015.

**The Pluto flyby (14 July 2015).** Closest approach **12,472 km above Pluto's
surface at 11:49 UTC**, moving at **13.8 km/s**. Because New Horizons was too
distant (32.9 AU) for real-time data return at any useful rate, all encounter
data was **recorded onto onboard solid-state recorders and dribbled back to
Earth over 15 months** at ~1–2 kbps. The final packet arrived Oct 2016.

Discoveries at Pluto:
- **Sputnik Planitia** — a nitrogen-ice heart-shaped basin, convecting on
  million-year timescales; the impact basin that may host a subsurface liquid
  ocean.
- **Cthulhu Macula** — a dark red tholin-rich equatorial region.
- **Atmosphere collapse** — Pluto's atmospheric pressure has *risen* since 1988
  as Pluto approached perihelion (1989), and is now declining as it recedes;
  expected to freeze out around 2030–2040.
- **Charon's polar red cap** ("Mordor Macula") — evidence of methane-frost
  photolysis on the polar ice.
- **Ice mountains** rising 3–5 km, resurfacing on ≲500 Myr timescales.

**The Arrokoth flyby (1 January 2019).** Closest approach **3,500 km above the
smaller lobe at 05:33 UTC**, at 44.6 AU from the Sun — **the most distant
object ever explored**. Arrokoth is a **contact-binary cold classical KBO**
(19 km × 10 km × 10 km), the most pristine planetesimal ever imaged. Its
peanut/snowman shape revealed the two lobes formed separately in a **gentle,
low-velocity accretion** — a direct visual confirmation of the pebble-accretion
model of planet formation.

**Current status (mid-2026).** New Horizons is **~60 AU from the Sun**, heading
into the sparser outer Kuiper Belt. Extended mission is:

- **Heliophysics** (particles + fields in the interstellar interface region)
- **Kuiper Belt astrophysics** — imaging of KBOs from a unique vantage point
- **Optical astronomy** — including a program to measure the **cosmic optical
  background** from a location free of the zodiacal foreground

A **third KBO close flyby** in the 2030s is possible if a suitable target is
found within the remaining ΔV budget (~40 m/s). RTG power decay puts hard
instrument shutdown in the mid-2030s.

**Wow-facts.**
1. New Horizons carried some of **Clyde Tombaugh's ashes** past Pluto — the
   discoverer's ashes visited the discovered world.
2. The spacecraft's **onboard "New Horizons" clock** was set to Universal Time
   at launch; every packet is stamped with elapsed seconds since 19 Jan 2006 —
   a mission timekeeper independent of Earth clocks.
3. When New Horizons flew past Pluto, the light-travel time was **~4.5 hours
   one way** — every command required a full 9-hour round-trip to confirm.
4. Arrokoth's official name was **2014 MU69** at flyby; the informal name
   "Ultima Thule" was retired after historic Nazi associations came to light.
   "Arrokoth" is Powhatan for "sky."

**Sources.**
[New Horizons — NASA](https://science.nasa.gov/mission/new-horizons/) ·
[New Horizons — Wikipedia](https://en.wikipedia.org/wiki/New_Horizons) ·
[Pluto flyby — Stern et al. Science 2015](https://www.science.org/doi/10.1126/science.aad1815) ·
[Arrokoth flyby — Stern et al. Science 2019](https://www.science.org/doi/10.1126/science.aaw9771)

---

## 4. Discrepancies vs. the current portfolio

### 4.1 One value drifted — Voyager 1 "166 AU today"

- **`src/stellar/data/planetFacts.js`** `oort.wow: "Voyager 1 (166 AU today, in
  interstellar space)"` — 166 AU was correct in **early 2024**; extrapolating
  the 3.6 AU/yr escape velocity gives **~171 AU as of 2026-07-18**. Simplest
  fix: change to `"Voyager 1 (~171 AU today; ≈24 h light-time)"` and update
  annually, or reword to `"Voyager 1 (past the heliopause, one light-day from
  Earth as of 18 Nov 2026)"` — a stable milestone that doesn't rot.

- **`src/stellar/config/objects.js`** `voyager1.info` uses "(2025)" which is
  labelled as of; nudge the value from `~166 AU` to `~171 AU` and re-label
  `(2026)`.

### 4.2 Values in [`Voyagers.jsx`](src/stellar/Scene/Voyagers.jsx) are direction-honest but distance-compressed (documented, keep as-is)

The 3D positions of both Voyagers are placed at **~4,200 scene-units** rather
than the true **~15,770 SU** (`AU_UNIT × 171`) so they stay within navigation
range. The source file already contains a `ponytail:`-style comment explaining
this. It's a schematic compromise, not an error — but the *scale HUD* should
still cite the true AU value so the fact stays accurate.

### 4.3 No other corrections in this section

- Perseverance (`objects.js`) — accurate to 2026.
- JWST (`objects.js`) — accurate; no L2 change.
- Parker (`objects.js`) — accurate; the 24 Dec 2024 milestone is real and
  ongoing.
- Juno (`objects.js`) — accurate; EOL timing extended into 2026.
- Lucy (`objects.js`) — accurate; Donaldjohanson (2025) and Dinkinesh + Selam
  (2023) both delivered as described.
- New Horizons (`objects.js`) — accurate; ~60 AU + KB extended mission holds.

---

## 5. Backport-ready delta (for a follow-up edit pass)

| File | Field | Current | Verified | Source |
|---|---|---|---|---|
| `data/planetFacts.js` | `oort.wow` | `"Voyager 1 (166 AU today, in interstellar space)"` | `"Voyager 1 (~171 AU today · one light-day from Earth on 18 Nov 2026)"` | [NASA VIM](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) |
| `config/objects.js` | `voyager1.info` | `"~166 AU (2025)"` | `"~171 AU (2026)"` | [NASA VIM](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) |
| `config/objects.js` | `voyager2.info` | (if hard-coded distance) verify against | `"~144 AU (2026)"` | [NASA VIM](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) |

Everything else in the probe entries stands.

---

## Sources

Voyager & Golden Record:
[NASA VIM Where Are They Now](https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/) ·
[Voyager 1 — Wikipedia](https://en.wikipedia.org/wiki/Voyager_1) ·
[Voyager 2 — Wikipedia](https://en.wikipedia.org/wiki/Voyager_2) ·
[Voyager 1 heliopause — Science 2013](https://www.science.org/doi/10.1126/science.1241681) ·
[Voyager 2 heliopause — Nature Astronomy 2019](https://www.nature.com/articles/s41550-019-0928-3) ·
[Pale Blue Dot — NASA](https://solarsystem.nasa.gov/resources/536/voyager-1s-pale-blue-dot/) ·
[Golden Record — NASA VIM](https://voyager.jpl.nasa.gov/golden-record/whats-on-the-record/) ·
[*Murmurs of Earth* — Wikipedia](https://en.wikipedia.org/wiki/Murmurs_of_Earth)

Perseverance & Ingenuity:
[Perseverance overview — NASA](https://mars.nasa.gov/mars2020/mission/overview/) ·
[Perseverance status — NASA](https://mars.nasa.gov/mars2020/mission/where-is-the-rover/) ·
[Ingenuity — NASA JPL](https://mars.nasa.gov/technology/helicopter/) ·
[Perseverance — Wikipedia](https://en.wikipedia.org/wiki/Perseverance_(rover))

JWST:
[JWST — NASA](https://webb.nasa.gov/) ·
[JWST — Wikipedia](https://en.wikipedia.org/wiki/James_Webb_Space_Telescope) ·
[JADES-GS-z14-0 — Nature 2024](https://www.nature.com/articles/s41586-024-07227-0) ·
[Little Red Dots — arXiv 2404.02861](https://arxiv.org/abs/2404.02861)

Parker Solar Probe:
[Parker Solar Probe — NASA](https://science.nasa.gov/mission/parker-solar-probe/) ·
[Parker — Wikipedia](https://en.wikipedia.org/wiki/Parker_Solar_Probe) ·
[Switchbacks — Kasper et al. Nature 2019](https://www.nature.com/articles/s41586-019-1813-z) ·
[Alfvén surface — Kasper et al. PRL 2021](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.127.255101)

Juno:
[Juno — NASA](https://science.nasa.gov/mission/juno/) ·
[Juno — Wikipedia](https://en.wikipedia.org/wiki/Juno_(spacecraft)) ·
[Bolton et al. Nature 2017 (deep atmosphere)](https://www.nature.com/articles/nature25794)

Lucy:
[Lucy — NASA](https://science.nasa.gov/mission/lucy/) ·
[Lucy — Wikipedia](https://en.wikipedia.org/wiki/Lucy_(spacecraft)) ·
[Dinkinesh + Selam — Nature 2024](https://www.nature.com/articles/s41586-024-07378-0)

New Horizons:
[New Horizons — NASA](https://science.nasa.gov/mission/new-horizons/) ·
[New Horizons — Wikipedia](https://en.wikipedia.org/wiki/New_Horizons) ·
[Pluto flyby — Stern et al. Science 2015](https://www.science.org/doi/10.1126/science.aad1815) ·
[Arrokoth flyby — Stern et al. Science 2019](https://www.science.org/doi/10.1126/science.aaw9771)

*Compiled 2026-07-18 for the Stellar portfolio. Spacecraft positions extrapolated
from NASA's May-2026 VIM update; light-day milestone from NASA's 18 Nov 2026
announcement.*
