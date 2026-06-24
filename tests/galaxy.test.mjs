/*
 * Headless correctness test for the helical galaxy model (pure math, no canvas).
 * Run: node tests/galaxy.test.mjs
 *
 * Guards the single most error-prone detail: the ecliptic is 60° to the
 * direction of galactic travel (normal 30° from the apex axis), so planets
 * LEAD and TRAIL the Sun — they do NOT trail flat like a comet tail.
 */
import {
  tiltNormalDeg,
  planetLeadAt,
  NORMAL_TO_TRAVEL_DEG,
  APEX_SPEED,
  GALAXY_SPAN,
  GALAXY_PLANETS,
} from "../src/stellar/config/galaxy.js";
import { DESTINATION_BY_ID } from "../src/stellar/config/destinations.js";

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) failures++; };

// 1. Tilt convention: plane 60° to travel ⇒ normal 30° from the apex axis.
const nd = tiltNormalDeg();
ok(Math.abs(nd - NORMAL_TO_TRAVEL_DEG) < 1e-6, `tilt normal = ${nd.toFixed(4)}° (want ${NORMAL_TO_TRAVEL_DEG}°)`);

// 2. Lead/trail: Earth's forward offset along the apex axis must change sign
//    across one orbit (leads, then trails) — NOT a flat trailing tail.
const earth = DESTINATION_BY_ID.experience;
let minLead = Infinity, maxLead = -Infinity;
for (let i = 0; i <= 64; i++) {
  const v = planetLeadAt(earth, i / 64);
  minLead = Math.min(minLead, v);
  maxLead = Math.max(maxLead, v);
}
ok(minLead < -1e-3 && maxLead > 1e-3, `Earth lead spans [${minLead.toFixed(2)}, ${maxLead.toFixed(2)}] (must straddle 0 → leads & trails)`);

// 3. Every planet leads & trails (none is a degenerate flat tail).
let allStraddle = true;
for (const d of GALAXY_PLANETS) {
  let mn = Infinity, mx = -Infinity;
  for (let i = 0; i <= 48; i++) { const v = planetLeadAt(d, i / 48); mn = Math.min(mn, v); mx = Math.max(mx, v); }
  if (!(mn < 0 && mx > 0)) { allStraddle = false; console.log(`   ${d.id}: lead [${mn.toFixed(2)}, ${mx.toFixed(2)}]`); }
}
ok(allStraddle, `all ${GALAXY_PLANETS.length} planets lead & trail the Sun`);

// 4. Sanity: advance speed positive, span finite.
ok(APEX_SPEED > 0 && Number.isFinite(APEX_SPEED), `APEX_SPEED = ${APEX_SPEED.toExponential(3)} (>0)`);
ok(GALAXY_SPAN > 0 && Number.isFinite(GALAXY_SPAN), `GALAXY_SPAN = ${GALAXY_SPAN.toFixed(1)}u`);

console.log(failures === 0 ? "\n✅ galaxy model OK" : `\n❌ ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
