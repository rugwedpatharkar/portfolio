/* eslint-disable react/no-unknown-property */
/*
 * A dense JWST-deep-field backdrop for the homepage — modelled on Webb's
 * SMACS 0723 / cluster fields: a huge population of tiny REDSHIFTED distant
 * galaxies (warm orange smudges), a scatter of blue-white spirals + edge-on
 * slivers, a few bright yellow-white cluster ellipticals, and thin curved
 * GRAVITATIONAL-LENS ARCS. Everything DRIFTS slowly ("galaxies moving in the
 * distant background") and is kept extra-faint over the Milky Way's bright
 * footprint + the hero text.
 *
 * Each object is screen-anchored: its world position is the unprojection of a
 * (slowly wandering) NDC coordinate through the live camera every frame, so the
 * field holds its screen distribution through the intro while each member
 * drifts on its own slow Lissajous path. Additive, depth-off → pure backdrop.
 */
import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { ktx2Url } from "./shared/textureUrl";

const DISC = makeSoftDot({
  size: 256,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.2, "rgba(255,246,222,0.9)"],
    [0.42, "rgba(224,214,242,0.5)"],
    [0.72, "rgba(158,170,218,0.18)"],
    [1, "rgba(100,120,180,0)"],
  ],
  mipmaps: true,
});
const NUCLEUS = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.2, "rgba(255,246,216,0.95)"],
    [0.5, "rgba(255,220,164,0.3)"],
    [1, "rgba(255,200,140,0)"],
  ],
  mipmaps: true,
});

/* Curved gravitational-lens arc — a thin bright sliver bowed into an arc,
   brightest at its middle and fading at the ends (the Webb "smile"). */
function makeArc(size = 128) {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(214, 228, 255, 1)";
  ctx.lineWidth = size * 0.028;
  const cx = size / 2;
  const cy = size * 1.05;   // centre below → the stroke bows across the upper half
  const R = size * 0.62;
  const a0 = Math.PI * 1.18;
  const a1 = Math.PI * 1.82;
  const N = 48;
  for (let i = 0; i < N - 1; i++) {
    const t0 = i / (N - 1);
    const t1 = (i + 1) / (N - 1);
    ctx.globalAlpha = Math.sin(Math.PI * ((t0 + t1) / 2)) * 0.95; // fade at the ends
    ctx.beginPath();
    ctx.arc(cx, cy, R, a0 + (a1 - a0) * t0, a0 + (a1 - a0) * t1);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
const ARC = makeArc(128);

/* A crisp JWST 6-point diffraction-spike star: a SMALL bright core + three long
   thin bright spikes 60° apart + a faint horizontal strut. Dedicated (bigger,
   sharper than the tiny catalogue stars) so the hero spike stars read clearly. */
function makeBigSpike(size = 256) {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const c = size / 2;
  const core = ctx.createRadialGradient(c, c, 0, c, c, size * 0.085);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(0.5, "rgba(255,255,255,0.6)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  const spike = (angle, len, width, alpha) => {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(0.35, `rgba(255,255,255,${alpha * 0.45})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    for (const dir of [1, -1]) {
      ctx.beginPath();
      ctx.moveTo(0, -width / 2);
      ctx.lineTo(dir * len, 0);
      ctx.lineTo(0, width / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
  const half = size / 2;
  spike(Math.PI / 2, half * 0.99, 2.4, 1);     // vertical
  spike(Math.PI / 6, half * 0.97, 2.2, 0.95);  // +30°
  spike(-Math.PI / 6, half * 0.97, 2.2, 0.95); // −30°
  spike(0, half * 0.5, 1.6, 0.22);             // faint strut
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
const BIG_SPIKE = makeBigSpike(256);

const DIST = 5000;
const COUNT = 240;   // galaxies
const ARCS = 16;     // lensing arcs
const TAU = Math.PI * 2;

const RED_DISTANT = ["#d98a6a", "#c97a5a", "#e0a284", "#cf8f72", "#d67a58", "#e6b090", "#c96f52"]; // redshifted
const SPIRAL_BLUE = ["#cfe0ff", "#dfe6ff", "#e6ecff", "#d4e4ff", "#e8ecff"];
const WARM_ELLIP = ["#ffcf9e", "#ffd8b0", "#f2c69a", "#ffd7a8", "#f7cfa0"];
const CLUSTER = ["#fff2d8", "#fff6e6", "#ffeccb", "#fff0d0"]; // bright foreground ellipticals
const NUC_TINT = ["#fff0d8", "#ffe6c0", "#ffe4b0", "#ffe8c8"];

const inMilkyWay = (x, y) => ((x - 0.22) / 0.72) ** 2 + (y / 0.85) ** 2 < 1;
const inText = (x, y) => x < -0.3 && y > 0.1;
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const rnd = (a, b) => a + Math.random() * (b - a);

const drift = () => ({
  ax: 0.05 + Math.random() * 0.13,
  ay: 0.05 + Math.random() * 0.13,
  sx: 0.03 + Math.random() * 0.06,
  sy: 0.03 + Math.random() * 0.06,
  px: Math.random() * TAU,
  py: Math.random() * TAU,
});

function makeField() {
  const out = [];
  for (let i = 0; i < COUNT; i++) {
    const bx = Math.random() * 2 - 1;
    const by = Math.random() * 2 - 1;
    const k = Math.random();
    let size, aspect, tint, nuc, op;
    if (k < 0.44) {
      /* tiny redshifted distant smudge — the JWST majority */
      size = rnd(20, 54); aspect = rnd(0.72, 1); tint = pick(RED_DISTANT);
      nuc = Math.random() < 0.25 ? pick(NUC_TINT) : null; op = rnd(0.2, 0.4);
    } else if (k < 0.62) {
      /* small blue-white spiral */
      size = rnd(40, 88); aspect = rnd(0.5, 0.9); tint = pick(SPIRAL_BLUE);
      nuc = pick(NUC_TINT); op = rnd(0.28, 0.5);
    } else if (k < 0.77) {
      /* edge-on sliver */
      size = rnd(60, 132); aspect = rnd(0.1, 0.22); tint = Math.random() < 0.5 ? pick(SPIRAL_BLUE) : pick(WARM_ELLIP);
      nuc = null; op = rnd(0.28, 0.48);
    } else if (k < 0.91) {
      /* warm elliptical */
      size = rnd(54, 112); aspect = rnd(0.72, 0.95); tint = pick(WARM_ELLIP);
      nuc = pick(NUC_TINT); op = rnd(0.3, 0.5);
    } else {
      /* bright yellow-white cluster elliptical (a prominent foreground one) */
      size = rnd(92, 178); aspect = rnd(0.82, 1); tint = pick(CLUSTER);
      nuc = pick(CLUSTER); op = rnd(0.42, 0.66);
    }
    let sizeMul = 1;
    if (inMilkyWay(bx, by)) { op *= 0.45; sizeMul = 0.75; } // recede behind the MW
    if (inText(bx, by)) op *= 0.5;                          // don't fight the type
    out.push({ bx, by, size: size * sizeMul, aspect, roll: Math.random() * Math.PI, tint, nuc, op, ...drift() });
  }
  return out;
}

function makeArcs() {
  const out = [];
  for (let i = 0; i < ARCS; i++) {
    /* bias arcs toward the mid/right where the Milky-Way "cluster" mass sits —
       lensing arcs bow around a cluster — but keep them faint. */
    const bx = rnd(-0.4, 0.9);
    const by = rnd(-0.9, 0.9);
    let op = rnd(0.16, 0.34);
    if (inMilkyWay(bx, by)) op *= 0.6;
    out.push({ bx, by, w: rnd(180, 420), h: rnd(120, 300), roll: Math.random() * TAU, op, ...drift() });
  }
  return out;
}

/* A few prominent JWST-signature spike stars, screen-pinned to the darker gaps
   (never over the hero text). Blue-white, twinkling — the eye-catching stars in
   any Webb deep field. Fixed spike orientation (the telescope's, not per-star). */
/* Placed in the DARK gaps (never over the Milky Way's glow or the hero text) so
   the spikes read crisply against black. */
const SPIKES = [
  { ndc: [-0.6, -0.32],  size: 720, tint: "#e6f0ff" }, // left-mid (the big one)
  { ndc: [-0.34, -0.66], size: 460, tint: "#cfe0ff" }, // lower centre-left
  { ndc: [-0.92, -0.08], size: 380, tint: "#dCEBFF" }, // far-left, below the type
  { ndc: [-0.24, 0.78],  size: 420, tint: "#fff4e6" }, // top centre-left gap
  { ndc: [-0.74, -0.84], size: 340, tint: "#d8e6ff" }, // bottom-left
  { ndc: [0.93, 0.5],    size: 480, tint: "#e6f0ff" }, // far-right edge, past the disc
];
const makeSpikes = () =>
  SPIKES.map((s) => ({ bx: s.ndc[0], by: s.ndc[1], size: s.size, tint: s.tint, amp: 0.13 + Math.random() * 0.13, speed: 0.6 + Math.random() * 0.9, phase: Math.random() * TAU }));

/* TRUE LOCAL-GROUP SCALE. The Milky Way's own SATELLITES read brightest: the
   LMC (~163,000 ly) and SMC (~200,000 ly) sit 3-4 galaxy-radii out, so they're
   small and hug the Milky Way's lower edge (below the galactic plane, toward the
   south galactic pole). Beyond them, the two big Local-Group spirals appear as
   the FAINT smudges they truly are to the naked eye: Andromeda (M31, 2.5 Mly ≈
   50 radii — the farthest thing visible unaided) and its neighbour Triangulum
   (M33, 2.7 Mly ≈ 55 radii, lower surface brightness → fainter still). They're a
   bound pair ~15° apart in the real sky, so they cluster together up-sky, far
   smaller + dimmer than the satellites — the honest look of 50× the distance.
   Everything past them (Sombrero/Whirlpool, 460-580 radii) stays in the faint
   deep-field scatter above, not here. Real photos. */
const HERO_GALAXIES = [
  { ndc: [-0.02, -0.62], size: 230, tex: "lmc", op: 0.85 },        // LMC — nearest satellite, small, below the disc
  { ndc: [0.16, -0.84],  size: 150, tex: "smc", op: 0.72 },        // SMC — smaller, further out toward the pole
  { ndc: [-0.06, 0.66],  size: 150, tex: "andromeda", op: 0.44 },  // M31 — faint distant smudge, ~50 radii out
  { ndc: [0.12, 0.79],   size: 104, tex: "triangulum", op: 0.24 }, // M33 — fainter, its bound neighbour, ~55 radii
];
const HERO_URLS = HERO_GALAXIES.map((h) => `/textures/galaxies/${h.tex}.webp`);
const makeHeroes = () =>
  HERO_GALAXIES.map((h) => ({ ...h, bx: h.ndc[0], by: h.ndc[1], ...drift() }));

const HomepageGalaxies = ({ reducedMotion = false }) => {
  const items = useMemo(() => makeField(), []);
  const arcs = useMemo(() => makeArcs(), []);
  const spikes = useMemo(() => makeSpikes(), []);
  const heroes = useMemo(() => makeHeroes(), []);
  const heroTex = useLoader(THREE.TextureLoader, HERO_URLS.map(ktx2Url));
  useMemo(() => { for (const t of heroTex) t.colorSpace = THREE.SRGBColorSpace; }, [heroTex]);
  const gRefs = useRef([]);
  const aRefs = useRef([]);
  const sRefs = useRef([]);
  const hRefs = useRef([]);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const cam = state.camera;
    cam.getWorldPosition(camPos);
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    const place = (arr, refs) => {
      for (let i = 0; i < arr.length; i++) {
        const grp = refs.current[i];
        if (!grp) continue;
        const g = arr[i];
        const nx = g.bx + g.ax * Math.sin(t * g.sx + g.px);
        const ny = g.by + g.ay * Math.sin(t * g.sy + g.py);
        tmp.set(nx, ny, 0.5).unproject(cam);
        tmp.sub(camPos).normalize().multiplyScalar(DIST).add(camPos);
        grp.position.copy(tmp);
      }
    };
    place(items, gRefs);
    place(arcs, aRefs);
    place(heroes, hRefs);
    /* Spike stars — screen-pinned (fixed sky), twinkling in size + brightness. */
    for (let i = 0; i < spikes.length; i++) {
      const sp = sRefs.current[i];
      if (!sp) continue;
      const s = spikes[i];
      tmp.set(s.bx, s.by, 0.5).unproject(cam);
      tmp.sub(camPos).normalize().multiplyScalar(DIST).add(camPos);
      sp.position.copy(tmp);
      const ph = t * s.speed + s.phase;
      const tw = 1 + s.amp * Math.sin(ph);
      sp.scale.set(s.size * tw, s.size * tw, 1);
      sp.material.opacity = 0.82 + 0.18 * Math.sin(ph);
    }
  });

  return (
    <group frustumCulled={false}>
      {items.map((g, i) => (
        <group key={`g${i}`} ref={(el) => { gRefs.current[i] = el; }}>
          <sprite scale={[g.size, g.size * g.aspect, 1]} material-rotation={g.roll}>
            <spriteMaterial map={DISC} color={g.tint} transparent opacity={g.op} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
          {g.nuc && (
            <sprite scale={[g.size * 0.26, g.size * 0.26, 1]}>
              <spriteMaterial map={NUCLEUS} color={g.nuc} transparent opacity={Math.min(1, g.op * 1.6)} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          )}
        </group>
      ))}
      {arcs.map((a, i) => (
        <sprite key={`a${i}`} ref={(el) => { aRefs.current[i] = el; }} scale={[a.w, a.h, 1]} material-rotation={a.roll}>
          <spriteMaterial map={ARC} color="#dCEBFF" transparent opacity={a.op} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
      {spikes.map((s, i) => (
        <sprite key={`s${i}`} ref={(el) => { sRefs.current[i] = el; }} scale={[s.size, s.size, 1]}>
          <spriteMaterial map={BIG_SPIKE} color={s.tint} transparent opacity={0.9} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
      {heroes.map((h, i) => (
        <sprite key={`h${i}`} ref={(el) => { hRefs.current[i] = el; }} scale={[h.size, h.size, 1]}>
          <spriteMaterial map={heroTex[i]} transparent opacity={h.op} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
    </group>
  );
};

export default HomepageGalaxies;
