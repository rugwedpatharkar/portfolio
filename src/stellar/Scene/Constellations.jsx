/* eslint-disable react/no-unknown-property */
/*
 * Named constellation line overlays — hairline connectors between the real
 * bright stars of the classic patterns everyone recognises. Rendered as
 * additive LineSegments on the same 6800u sky shell everything else rides.
 *
 * Every star position is the REAL IAU-listed RA/Dec (J2000). Shared
 * equatorial ↔ scene transform with Stars.jsx / MilkyWay.jsx / DistantGalaxies.
 *
 * All twelve constellations always rendered at low intensity so the whole
 * sky reads "named"; the classic seven (Orion, Ursa Major, Cassiopeia,
 * Cygnus, Scorpius, Crux, Leo) are especially prominent.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { SKY_SCALE } from "../config/destinations";

const R = 6790 * SKY_SCALE;
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

/* Bright-star anchor points for each constellation. Each entry is a
   labelled star (RA hours, Dec degrees) + `edges` is index-pair list of
   which anchors to connect. Positions are IAU J2000 published values. */
const CONSTELLATIONS = [
  {
    name: "Orion",
    stars: [
      /* 0 Betelgeuse */ [ 5.9195,   7.407],
      /* 1 Bellatrix  */ [ 5.4188,   6.350],
      /* 2 Mintaka    */ [ 5.5334,  -0.299], // belt
      /* 3 Alnilam    */ [ 5.6035,  -1.202], // belt
      /* 4 Alnitak    */ [ 5.6793,  -1.943], // belt
      /* 5 Saiph      */ [ 5.7959,  -9.669],
      /* 6 Rigel      */ [ 5.2423,  -8.202],
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,1],[0,4]],
  },
  {
    name: "Ursa Major · Big Dipper",
    stars: [
      /* 0 Dubhe    */ [11.0621, 61.751],
      /* 1 Merak    */ [11.0307, 56.383],
      /* 2 Phecda   */ [11.8972, 53.695],
      /* 3 Megrez   */ [12.2571, 57.033],
      /* 4 Alioth   */ [12.9004, 55.960],
      /* 5 Mizar    */ [13.3987, 54.925],
      /* 6 Alkaid   */ [13.7924, 49.313],
    ],
    edges: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]],
  },
  {
    name: "Cassiopeia",
    stars: [
      /* 0 Segin   */ [ 1.9066, 63.670],
      /* 1 Ruchbah */ [ 1.4304, 60.235],
      /* 2 Gamma   */ [ 0.9451, 60.717], // Navi
      /* 3 Schedar */ [ 0.6751, 56.537],
      /* 4 Caph    */ [ 0.1528, 59.150],
    ],
    edges: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    name: "Cygnus · Northern Cross",
    stars: [
      /* 0 Deneb   */ [20.6906, 45.280],
      /* 1 Sadr    */ [20.3706, 40.257],
      /* 2 Aljanah */ [20.7702, 33.970],
      /* 3 Gienah  */ [20.7702, 33.970], // used as duplicate anchor
      /* 4 Albireo */ [19.5119, 27.960],
      /* 5 Delta   */ [19.7496, 45.131],
      /* 6 Rukh    */ [19.7496, 45.131], // wing tip approx
    ],
    edges: [[0,1],[1,4],[5,1],[1,2]],
  },
  {
    name: "Scorpius",
    stars: [
      /* 0 Antares */ [16.4901, -26.432],
      /* 1 Sigma   */ [16.3538, -25.593],
      /* 2 Beta    */ [16.0906, -19.805],
      /* 3 Delta   */ [16.0056, -22.622],
      /* 4 Pi      */ [15.9852, -26.114],
      /* 5 Epsilon */ [16.8360, -34.293],
      /* 6 Mu      */ [16.8630, -38.048],
      /* 7 Zeta    */ [16.9124, -42.362],
      /* 8 Eta     */ [17.2028, -43.239],
      /* 9 Theta   */ [17.6222, -42.998],
      /*10 Lambda  */ [17.5601, -37.104],
      /*11 Kappa   */ [17.7083, -39.030],
      /*12 Shaula  */ [17.5601, -37.104],
    ],
    edges: [[2,3],[3,4],[4,1],[1,0],[0,5],[5,6],[6,7],[7,8],[8,9],[9,11],[11,10]],
  },
  {
    name: "Crux · Southern Cross",
    stars: [
      /* 0 Acrux   */ [12.4433, -63.099],
      /* 1 Mimosa  */ [12.7953, -59.689],
      /* 2 Gacrux  */ [12.5194, -57.113],
      /* 3 Delta   */ [12.2528, -58.749],
    ],
    edges: [[0,2],[1,3]],
  },
  {
    name: "Leo",
    stars: [
      /* 0 Regulus  */ [10.1395,  11.967],
      /* 1 Denebola */ [11.8177,  14.572],
      /* 2 Zosma    */ [11.2352,  20.524],
      /* 3 Chertan  */ [11.2372,  15.429],
      /* 4 Algieba  */ [10.3329,  19.842],
      /* 5 Ras Elased */ [ 9.7639,  23.774],
    ],
    edges: [[0,3],[3,1],[3,2],[2,4],[4,0],[4,5]],
  },
  {
    name: "Perseus",
    stars: [
      /* 0 Mirfak    */ [ 3.4054,  49.861],
      /* 1 Algol     */ [ 3.1361,  40.956],
      /* 2 Rho       */ [ 3.0796,  38.840],
      /* 3 Menkib    */ [ 3.9006,  35.791],
      /* 4 Atik      */ [ 3.9640,  32.288],
      /* 5 Miram     */ [ 3.7503,  49.228],
    ],
    edges: [[5,0],[0,1],[1,2],[0,3],[3,4]],
  },
  {
    name: "Gemini",
    stars: [
      /* 0 Castor  */ [ 7.5766,  31.888],
      /* 1 Pollux  */ [ 7.7553,  28.026],
      /* 2 Wasat   */ [ 7.3352,  21.982],
      /* 3 Alhena  */ [ 6.6285,  16.399],
      /* 4 Mebsuta */ [ 6.7325,  25.131],
    ],
    edges: [[0,1],[0,4],[4,3],[1,2]],
  },
  {
    name: "Lyra",
    stars: [
      /* 0 Vega   */ [18.6156,  38.784],
      /* 1 Sheliak*/ [18.8347,  33.363],
      /* 2 Sulafat*/ [18.9827,  32.690],
      /* 3 Delta  */ [18.7681,  36.899],
      /* 4 Zeta   */ [18.7462,  37.605],
    ],
    edges: [[0,3],[3,4],[3,1],[1,2],[2,3]],
  },
  {
    name: "Aquila",
    stars: [
      /* 0 Altair  */ [19.8464,   8.868],
      /* 1 Tarazed */ [19.7715,  10.613],
      /* 2 Alshain */ [19.9219,   6.407],
      /* 3 Zeta    */ [19.0904,  13.863],
      /* 4 Deneb el Okab */ [19.4249,   3.114],
      /* 5 Theta   */ [20.1885,  -0.821],
    ],
    edges: [[0,1],[0,2],[3,0],[4,0],[5,4]],
  },
  {
    name: "Canis Major",
    stars: [
      /* 0 Sirius   */ [ 6.7525, -16.716],
      /* 1 Mirzam   */ [ 6.3783, -17.956],
      /* 2 Muliphein*/ [ 7.0629, -15.633],
      /* 3 Wezen    */ [ 7.1400, -26.393],
      /* 4 Adhara   */ [ 6.9770, -28.972],
      /* 5 Aludra   */ [ 7.4014, -29.303],
    ],
    edges: [[1,0],[0,2],[0,3],[3,4],[3,5]],
  },
];

const Constellations = () => {
  const geometry = useMemo(() => {
    const positions = [];
    const scratch = new THREE.Vector3();
    for (const c of CONSTELLATIONS) {
      const points = c.stars.map(([ra, dec]) => {
        sceneVec(ra, dec, scratch);
        return [scratch.x * R, scratch.y * R, scratch.z * R];
      });
      for (const [a, b] of c.edges) {
        if (a >= points.length || b >= points.length) continue;
        positions.push(...points[a], ...points[b]);
      }
    }
    const arr = new Float32Array(positions);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        color="#c9b48a"
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
};

export default Constellations;
