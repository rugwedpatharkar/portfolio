/*
 * Holo-Bridge design tokens — the two registers of the dual-hologram readout.
 * LEFT = cold cyan telemetry (planet facts) · RIGHT = warm amber dossier (résumé).
 * Mirrors the SC cockpit palette; kept here so every Holo-Bridge part stays uniform.
 */
import { rgba } from "../ui/tokens";
import { FONT } from "../ui/skin";

export { FONT };

export const HOLO = {
  cyan: "#6fd2ff",
  cyanLine: rgba("#6fd2ff", 0.4),
  cyanBracket: rgba("#6fd2ff", 0.7),
  panelBgCyan: "rgba(8, 22, 44, 0.66)",
  scanlineCyan: "repeating-linear-gradient(0deg, rgba(111,210,255,0.08) 0 1px, transparent 1px 5px)",

  amber: "#ffb454",
  amberLine: rgba("#ffb454", 0.4),
  amberBracket: rgba("#ffb454", 0.7),
  panelBgAmber: "rgba(34, 22, 8, 0.55)",
  scanlineAmber: "repeating-linear-gradient(0deg, rgba(255,180,84,0.07) 0 1px, transparent 1px 5px)",

  ink: "#dbe4f7",
  inkDim: "#8195b8",
  bootMs: 950, // boot-up reveal duration (desktop)
};

/* tint → the matching token set */
export const tintOf = (tint) =>
  tint === "amber"
    ? { c: HOLO.amber, line: HOLO.amberLine, bracket: HOLO.amberBracket, bg: HOLO.panelBgAmber, scan: HOLO.scanlineAmber }
    : { c: HOLO.cyan, line: HOLO.cyanLine, bracket: HOLO.cyanBracket, bg: HOLO.panelBgCyan, scan: HOLO.scanlineCyan };
