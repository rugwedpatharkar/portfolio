# Design — Cosmic Zoom: dive into the Sun's dot on the Milky Way

Status: DRAFT for approval · Supersedes the current "fade-the-plate" homepage dive

## 1. The effect (what we're building)

A continuous **"Powers of Ten" cosmic zoom** on the homepage. The solar system is
not a landmark in the galaxy — it is **one anonymous speck of dust among billions.**
Scrolling picks out ONE such unremarkable dust mote (the Sun's real position on the
Orion Spur) and **dives straight into it.** That speck stays dead-center the whole
way and keeps growing; the bulge, arms, and nebulae expand around it and stream
outward past the screen edges (you're flying *into* the galaxy, not watching it
fade). The mote keeps swelling until — the reveal — that "dust particle" unfolds
into our **entire solar system**: the Sun and every planet.

Reference: Eames *Powers of Ten*; Sagan's "pale blue dot"; the three.js
"Milky Way → desk" zoom portfolio. The felt result: **"I zoomed into a single grain
of dust in the galaxy… and it was our whole world."** The humility of the scale IS
the point — so the target must read as insignificant at the start, not as a beacon.

### What this is NOT (the mistake last time)
- NOT the galaxy plate fading out uniformly.
- NOT a separate star-field appearing in its place.
- NOT zooming into the galaxy's CENTER (the bulge). We zoom into the Sun's dot,
  which is out on an arm, off-center.

## 2. Why it's a cross-fade cascade, not one literal zoom

Galaxy scale (100,000 ly) and solar scale (AU) are ~16 orders of magnitude apart —
a single float32 coordinate space cannot hold both (this is why the codebase
already uses discrete scale regimes). So the "continuous" zoom is really **two
self-contained scale layers — the galaxy and the solar system, each at its own
TRUE scale — cross-faded through one fixed center point** (the dust mote). Since
the viewer wants NO in-between stop, there is exactly ONE seam: the galaxy layer
zooms until the mote fills the frame, then hands to the solar layer opening out of
that same point. With the mote centered + the warp + its brightness peaking at the
seam, it reads as one unbroken plunge — and both layers stay scientifically
true-scale (the cross-fade is what preserves it; nothing is compressed).

## 3. The pinned point — a dust mote

The target is the **Sun on the Orion Spur** — `SpiralGalaxy.SOL`, ~53% out on the
disk (26,670 ly from centre). Scientifically exact: that is literally where we are.
But it must be **presented as an ordinary dust particle**, indistinguishable from
the millions of other specks in the disk — no glow, no ring, no label up front. A
hairline targeting reticle quietly *acquires* it as the dive begins (so you have
something to follow), but the speck itself stays humble until it grows. It is the
optical center of the zoom from first frame to last; its insignificance-then-reveal
is the whole emotional arc.

## 4. Structure — TWO scrolls, NO in-between stops

The whole intro is exactly **two scroll-driven micro-zooms**, each one continuous
gesture landing on one destination. There is NO resting stop in the middle of
either — no interstellar/local-stars stop (that was the earlier mistake). The
intermediate scale is passed *through* as part of the continuous zoom, never
dwelt on.

### DIVE 1 — Milky Way → Solar-System outer view  (one scroll)

| diveT | What you see | Mechanic |
|---|---|---|
| 0.00 | Top-down Milky Way, dense with specks. A hairline reticle quietly locks ONE ordinary dust mote on the Orion Spur — no glow, no label. | `SpiralGalaxy` + reticle acquiring `SOL`. |
| 0.0–0.7 | **Micro-zoom into the mote.** It stays centered and grows; the bulge, arms, nebulae scale up *about that mote* and stream outward past the edges. Warp streaks. Galaxy stays rendered — you fly INTO it. | Scale the galaxy group about the SOL pivot + camera dolly toward SOL; `Hyperspace`. |
| 0.7–1.0 | The mote fills the frame and **cross-fades straight into the true-scale solar system** — the whole system unfolding out of that one speck. Settle on the **outer view** (the system from outside). | ONE seam: cross-fade galaxy → solar regime, the Sun landing exactly where the mote was. |

**End of Dive 1 = the Solar-System outer view.** No stop before it.

### DIVE 2 — Solar-System outer view → the Sun / tour  (next scroll)

| diveT | What you see | Mechanic |
|---|---|---|
| 0.0 | The solar system from outside (where Dive 1 landed). | The overview pose. |
| 0.0–1.0 | **Micro-zoom into the Sun** — same continuous-zoom feel, diving from the outer view down onto the Sun. | Camera dolly from the overview to the Sun. |
| 1.0 | Arrive at the Sun; the **existing planet tour begins** (Sun → planets outward). | Hand to the tour, unchanged. |

Only ONE seam total (Dive 1's galaxy→solar cross-fade), masked by the warp + the
mote's brightness peak — never a hard cut, and the two incompatible scales never
co-render. Dropping the intermediate local-stars stage is what makes it "direct,
no in-between stops."

## 5. Technical approach

- **Reuse:** `SpiralGalaxy` (the model) + `SpiralGalaxy.SOL` (the mote's pivot) +
  the solar system + `Hyperspace` (warp) + the existing scroll (`scrollT` / the
  two opening segments hero→about→Sun, already "one continuous cinematic dive").
- **Replaces:** the current Dive-1 implementation — `InterstellarDive` (local-star
  stage), `DiveGate`, and the plate-fade in `HomepageGalaxy`. The local-stars
  interstellar stage is REMOVED (it was the "in-between stop" the viewer doesn't
  want).
- **New:** re-center Dive 1's zoom on the SOL pivot (galaxy group scales about the
  mote + camera dollies toward it); keep the galaxy rendered through the plunge; a
  hairline reticle on the mote; and the single galaxy→solar cross-fade at the seam,
  all driven by the hero→about scroll (`diveT`).
- **Coordinate handling:** galaxy and solar each live in their own space; only
  opacity + scale cross-fade between them at the one seam. Never both at once.
- **No hitches:** the solar system already pre-mounts during boot (tiered mount +
  PrewarmTour), so the cross-fade never stalls.
- **Reduced-motion / mobile:** snap the two scales (galaxy → solar), no continuous
  plunge — per the project's snap-tour policy.
- **Handoff:** Dive 2 (about→Sun) ends exactly where the existing planet tour
  begins (unchanged).

## 6. Decisions

RESOLVED (viewer):
- Two scrolls, NO in-between stops. Dive 1 = Milky Way → solar outer view;
  Dive 2 = solar outer view → Sun/tour.
- Target is an anonymous dust mote, not a beacon.
- One seam total (galaxy → solar); the local-stars interstellar stage is removed.

STILL OPEN (small — I'll default as noted unless you say otherwise):
1. **Galaxy through the plunge:** stay full-density-visible the whole way, or gently
   thin as you punch through the disk plane? *(Default: stay visible, thin only at
   the very edges — maximises the "inside it" feeling.)*
2. **The mote:** the real Sun position on the Orion Spur *(default — scientifically
   exact)* vs. literally any random speck.
3. **The reveal line:** at arrival, land a caption like *"…that dust particle was
   our entire world"*, hold silently on the full system, or never state it?
   *(Default: one quiet line at arrival, then it fades.)*
4. **Pacing:** keep ~2.6 screens of scroll for Dive 1? *(Default: yes.)*

## 8. Conveying the billions (100–400 B planetary systems)

Literal billions of points is physically impossible (~4.8 TB for 400 B positions;
browsers cap ~2–4 GB). The real galaxy already reads as a *glow* because billions
of unresolved stars blend — so we do the same:

- **Continuous surface-brightness glow** (shader/texture along the exp-disk + arms)
  = the uncountable billions; the space between points is never empty.
- **~0.3–1 M resolved points** (up from ~100 k) scattered on top = the individuals
  you can pick out. The adaptive guard scales this down on weak GPUs.
- **Zoom-LOD:** as the dive approaches the mote, more points resolve out of the glow
  near it — the "billions" literally emerge as you fly in.
- **HUD stat:** a line states the real number — "~100–400 billion planetary systems"
  (optionally a "~6,000 confirmed by NASA" counter) — the number is *told* while the
  visual conveys the vastness.

## 7. Success criteria

- The Sun's dot never leaves screen-center from first frame to arrival.
- You feel like you fly *into* the galaxy (arms sweep past the edges), not that it
  faded away.
- The dot visibly grows and becomes the Sun.
- No hard cut and no hitch at any seam.
- Every scale stays true (galaxy proportions, local ly-depth, solar AU) — nothing
  compressed to fake continuity.
