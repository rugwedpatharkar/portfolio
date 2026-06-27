import { useEffect } from "react";
import { DESTINATIONS } from "./config/destinations";

/*
 * PHASE 3A — the reactive co-pilot (scripted rules-engine).
 *
 * A small, sparse character that reacts to what the pilot does: arriving at a
 * world, scanning an object, catching a fragment, charting the map, idling, or
 * stumbling onto an easter egg. TARS/Jarvis restraint — a global cooldown + a
 * "said recently" filter keep it dry and occasional, never chatty. It only
 * DISPATCHES `stellar:copilot {line}`; CockpitHUD renders it over the static
 * section line, then reverts. Logic-only (returns null). Reduced-motion safe
 * (text only; no animation here). The optional LLM/voice layer is Phase 3B.
 */

const ARRIVE = {
  sol: ["Sol — centre of mass. Welcome aboard, pilot.", "Back at the star. Mind the glare."],
  about: ["Mercury — closest to the fire. Where the record starts.", "Origin world. Begin here."],
  funfacts: ["Receipts on this lane. The numbers check out.", "Telemetry signals — every one's grounded in something real."],
  experience: ["Service record ahead. Lock a station to read it.", "Career telemetry, pilot. The numbers hold up."],
  projects: ["Survey craft in orbit — each one's a mission file.", "Things built and shipped. Pick a probe."],
  achievements: ["Milestones charted. Crown of the belt.", "Commendations logged out here."],
  skills: ["Moons of skill around the giant. Scan one.", "Skill clusters in orbit — plenty to read."],
  notes: ["Flight logs on this lane. Worth a read.", "Writings filed out here."],
  education: ["The tilted world — knowledge accumulated.", "Academy records on the ice giant."],
  hobbies: ["Beyond the code — the blue abyss.", "Off-duty signals this far out."],
  testimonials: ["Incoming transmissions. Voices from afar.", "Others vouch for this one."],
  contact: ["Edge beacon. Open a channel when you're ready.", "End of the line — comms are live."],
};
const SCAN = ["Reading it now.", "Telemetry locked — streaming the dossier.", "Scan complete. See the readout.", "Logged."];
const FRAGMENT = ["Data fragment secured.", "Fragment aboard — nice catch.", "Another shard logged."];
const PROGRESS = ["Another body charted.", "The map fills in, pilot.", "Catalogue's growing."];
const IDLE = ["Holding station. Take your time.", "All quiet out here.", "The system turns. No rush.", "Standing by, pilot.", "Deep space is patient. So am I."];
const SALUTE = ["The star salutes you back.", "Careful — it bites at this range.", "A million-degree handshake."];
const EGG = {
  "stellar:konami": ["...did you just? Respect, pilot.", "Cheat codes engaged. I saw nothing."],
  "stellar:deathstar": ["That's no moon.", "I have a bad feeling about that one."],
  "stellar:tardis": ["Bigger on the inside, they say.", "That box shouldn't be here. Or when."],
  "stellar:hal": ["I'm afraid that's a reference, pilot.", "It's reading our lips. Probably."],
  "stellar:walle": ["Little one's still cleaning up.", "Directive: collect. Same as us."],
  "stellar:watney": ["Someone's been growing potatoes out here.", "He scienced his way home, you know."],
  "stellar:enterprise": ["Boldly going, and all that.", "Long-range sensors flagged a classic."],
  "stellar:endurance": ["Spinning for gravity. Smart.", "No time-dilation jokes — we'd be here years."],
  "stellar:cooperstation": ["Habitat ring on the scope.", "Home, if you squint."],
  "stellar:stardestroyer": ["That wedge is not friendly.", "Hold course. Don't make eye contact."],
};

const COOLDOWN_MS = 5500; // minimum gap between quips — keeps it sparse
const IDLE_MS = 24000; // quiet this long → an idle remark

export default function CoPilot({ enabled = true }) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;
    let lastAt = 0;
    const recent = [];
    let idleTimer = null;

    const pick = (pool) => {
      const fresh = pool.filter((l) => !recent.includes(l));
      const from = fresh.length ? fresh : pool;
      return from[Math.floor(Math.random() * from.length)];
    };
    const say = (pool, { force = false } = {}) => {
      if (!pool || !pool.length) return;
      const now = Date.now();
      if (!force && now - lastAt < COOLDOWN_MS) return;
      const line = pick(pool);
      lastAt = now;
      recent.push(line);
      if (recent.length > 7) recent.shift();
      window.dispatchEvent(new CustomEvent("stellar:copilot", { detail: { line } }));
      armIdle();
    };
    const armIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => say(IDLE, { force: true }), IDLE_MS);
    };

    const onArrive = (e) => {
      const d = DESTINATIONS[e?.detail?.index];
      say(ARRIVE[d?.section] || ARRIVE[d?.id] || ARRIVE.sol);
    };
    const onScan = () => say(SCAN);
    const onFragment = () => say(FRAGMENT, { force: true });
    const onProgress = () => say(PROGRESS);
    const onSalute = () => say(SALUTE, { force: true });
    const eggHandlers = Object.entries(EGG).map(([evt, pool]) => {
      const h = () => say(pool, { force: true });
      window.addEventListener(evt, h);
      return [evt, h];
    });

    window.addEventListener("stellar:destination", onArrive);
    window.addEventListener("stellar:scan", onScan);
    window.addEventListener("stellar:fragment", onFragment);
    window.addEventListener("stellar:progress", onProgress);
    window.addEventListener("stellar:salute", onSalute);
    armIdle();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener("stellar:destination", onArrive);
      window.removeEventListener("stellar:scan", onScan);
      window.removeEventListener("stellar:fragment", onFragment);
      window.removeEventListener("stellar:progress", onProgress);
      window.removeEventListener("stellar:salute", onSalute);
      eggHandlers.forEach(([evt, h]) => window.removeEventListener(evt, h));
    };
  }, [enabled]);

  return null;
}
