# Knowledge Foundation

> How the astronomical claims that appear in the tour are sourced, verified,
> and kept current. Every visible number and every "wow"-line has a real
> reference behind it.

This document is the Phase 12 execution track from the audit plan
(`milky-way-portfolio-mellow-minsky.md` §13 → Phase 12).

## The verification bar

Every quantitative claim renders through one of these files:

- `src/stellar/data/planetFacts.js` — the body-fact card (diameter, distance,
  gravity, mass, temp, atmosphere, moons, missions, wow).
- `src/stellar/v3/data/planetEditorial.js` — the editorial layer (quote,
  quoteBy, etymology, discovered, facts[]).
- `src/stellar/config/galaxy.js` — the galactic-scale constants (arm
  positions, bulge radius, Sun's galactocentric radius, etc.).
- `src/stellar/data/brightStars.js` — the near-Earth star catalog (RA, Dec,
  magnitude, B-V index, distLy).

Every claim in the first three should carry provenance. brightStars is
NASA/Tycho-2 sourced at build time via `scripts/build-star-catalog.mjs` —
that pipeline is the reference of record.

## The provenance pattern

Fact cards get an optional `sources: [...]` array — a list of URLs or short
citation strings. Not every entry has one yet; the pattern below is what
gets added as the audit closes out.

```js
sol: {
  body: "Sol — G2V yellow dwarf star",
  diameter: "1,391,400 km · ~109 Earths",
  // ... the rest of the visible card ...
  sources: [
    "NASA/JPL Sun fact sheet — nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
    "GRAVITY 2019 (Sun R0, Sgr A* mass) — DOI:10.1051/0004-6361/201935656",
    "SDO/SOHO composite — sohowww.nascom.nasa.gov",
  ],
},
```

Sources are:

- **URLs** for open web references (NASA, IAU, ESA, MPC).
- **DOI strings** for journal papers where applicable.
- **Short-form citations** (e.g. `"Bland-Hawthorn & Gerhard 2016 (structure)"`)
  when the reference is a book / long-form report that doesn't fit a URL.

The card layer (`V3Editorial.jsx`) does NOT surface `sources` in the UI —
it's an audit trail, not a citation strip. If we ever want a
"View sources" affordance on the info panel, it lives behind a small `<details>`
disclosure so the FUI aesthetic stays clean.

## The 10% second-source spot check

Plan §13 milestone 1. For every quantitative claim in `docs/galaxy/*`, add
a second citation from an independent source. Not every claim — a 10% random
sample is the practical bar for verifying no systemic bias in the primary
sources.

Owner: the human maintaining the site. The bot can't decide which sources
are trusted.

## Currency check on moon counts

Plan §13 milestone 2. Moon counts drift as new moons are discovered
(Saturn's count jumped from 82 to 146 in 2023). The Minor Planet Center
publishes the current authoritative list at:

- https://minorplanetcenter.net/iau/Ephemerides/Distant/ — Saturnian irregulars
- https://ssd.jpl.nasa.gov/sats/elem/ — JPL Solar-System Dynamics moon elements

Verification cadence: annually, or whenever `planetFacts.moons` is edited.

## Deep-space anomaly provenance

Plan §13 milestone 3. The anomaly fact cards (kilonova / pulsar / black
hole / nebula / etc.) get `sources[]` entries the same way planet cards do.
Priority anomalies:

- **Sagittarius A\*** — Event Horizon Telescope 2022 first image
  (DOI:10.3847/2041-8213/ac6674)
- **M87\*** — EHT 2019 (DOI:10.3847/2041-8213/ab0ec7)
- **GW170817** — the kilonova reference event (Abbott et al. 2017,
  DOI:10.1103/PhysRevLett.119.161101)
- **GW250114** — most recent LIGO/O4 chirp (advance from LSC public release)
- **Wow! signal** — Ehman 1977 SETI observation log (Ohio State)
- **Tabby's Star (KIC 8462852)** — Boyajian et al. 2016
  (DOI:10.1093/mnras/stw218)
- **Planet Nine** — Batygin & Brown 2016
  (DOI:10.3847/0004-6256/151/2/22)
- **Betelgeuse companion Siwarħa** — MacLeod et al. 2025 (advance from
  the Nature Astronomy announcement)

Owner: the human, since selecting the "canonical" citation for a phenomenon
with multiple independent papers is an editorial choice.

## Ephemeris decision (closed)

Plan §13 milestone 4. The `astronomy-engine` dependency was removed; a
dormant J2000 ephemeris was shelved. Re-open only if a time-scale/date-picker
feature ships (Phase 11 milestone 1 — the current time-scale HUD is
scale-only, not date-picker, so this stays closed).
