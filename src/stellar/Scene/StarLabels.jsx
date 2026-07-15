/* eslint-disable react/no-unknown-property */
/*
 * Hover-labels on the sky's brightest named stars — the 15 or so stars every
 * amateur astronomer can name. Each label is a small drei <Html> anchored at
 * the star's real RA/Dec position on the 6800u sky shell.
 *
 * The label is invisible until you HOVER inside its capture sphere; then it
 * pops in with the star name + distance in light-years so the tour feels
 * like a curated planetarium instead of a scattered scene.
 *
 * NOT rendered under reduced-motion (Scene handles that with the caller
 * gate).
 */
import { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SKY_SCALE } from "../config/destinations";

const R = 6720 * SKY_SCALE;
const OBLIQUITY = 23.44 * Math.PI / 180;

function sceneVec(raHours, decDeg, out) {
  const ra = raHours * Math.PI / 12;
  const dec = decDeg * Math.PI / 180;
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return out.set(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE).normalize();
}

/* Named bright stars. Each entry: RA hours, Dec deg, name, distance in ly,
   spectral note. Positions IAU J2000, distances Gaia DR3 parallax. */
const NAMED = [
  { name: "Sirius",     raH:  6.7525, dec: -16.716, ly:  8.6, note: "α Canis Majoris — brightest in the sky" },
  { name: "Canopus",    raH:  6.3992, dec: -52.696, ly: 310,  note: "α Carinae — 2nd brightest" },
  { name: "Arcturus",   raH: 14.2610, dec:  19.182, ly:  37,  note: "α Boötis" },
  { name: "Vega",       raH: 18.6156, dec:  38.784, ly:  25,  note: "α Lyrae — future pole star" },
  { name: "Capella",    raH:  5.2782, dec:  45.998, ly:  43,  note: "α Aurigae" },
  { name: "Rigel",      raH:  5.2423, dec:  -8.202, ly: 860,  note: "β Orionis — blue supergiant" },
  { name: "Procyon",    raH:  7.6551, dec:   5.225, ly:  11,  note: "α Canis Minoris" },
  { name: "Betelgeuse", raH:  5.9195, dec:   7.407, ly: 550,  note: "α Orionis — red supergiant" },
  { name: "Altair",     raH: 19.8464, dec:   8.868, ly:  17,  note: "α Aquilae" },
  { name: "Aldebaran",  raH:  4.5987, dec:  16.509, ly:  65,  note: "α Tauri — the bull's eye" },
  { name: "Antares",    raH: 16.4901, dec: -26.432, ly: 550,  note: "α Scorpii — red supergiant" },
  { name: "Spica",      raH: 13.4199, dec: -11.161, ly: 250,  note: "α Virginis" },
  { name: "Pollux",     raH:  7.7553, dec:  28.026, ly:  34,  note: "β Geminorum" },
  { name: "Deneb",      raH: 20.6906, dec:  45.280, ly: 2600, note: "α Cygni — one of the most distant naked-eye stars" },
  { name: "Regulus",    raH: 10.1395, dec:  11.967, ly:  79,  note: "α Leonis" },
  { name: "Fomalhaut",  raH: 22.9608, dec: -29.622, ly:  25,  note: "α Piscis Austrini" },
];

const StarLabel = ({ star }) => {
  const [hover, setHover] = useState(false);
  const pos = useMemo(() => {
    const v = new THREE.Vector3();
    sceneVec(star.raH, star.dec, v);
    return v.multiplyScalar(R).toArray();
  }, [star.raH, star.dec]);

  return (
    <group position={pos}>
      {/* Invisible capture sphere so hovering near the star's screen position
          triggers the label. */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); if (typeof document !== "undefined") document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); if (typeof document !== "undefined") document.body.style.cursor = ""; }}
      >
        <sphereGeometry args={[110, 8, 8]} />
        <meshBasicMaterial visible={false} depthWrite={false} />
      </mesh>
      {hover && (
        <Html center distanceFactor={520} zIndexRange={[45, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            transform: "translate(24px, -50%)",
            padding: "6px 10px",
            borderRadius: 4,
            background: "rgba(8,11,24,0.82)",
            border: "1px solid rgba(201,180,138,0.4)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontFamily: "'Martian Mono', monospace",
            color: "#f5f7fc",
            fontSize: 11,
            lineHeight: 1.35,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
          }}>
            <div style={{ color: "#c9b48a", letterSpacing: ".16em", fontSize: 10 }}>
              {star.name.toUpperCase()} · {star.ly} LY
            </div>
            <div style={{ opacity: 0.75, fontSize: 10, marginTop: 2 }}>{star.note}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

const StarLabels = () => (
  <group>
    {NAMED.map((s) => <StarLabel key={s.name} star={s} />)}
  </group>
);

export default StarLabels;
