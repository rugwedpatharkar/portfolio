 
import { createContext, useContext } from "react";

/*
 * Shared UI / interaction state for the cockpit shell.
 *
 * StellarApp owns the underlying React state and provides it here; the dock,
 * command palette, HUD, and rank meter consume it via useStellarUI() instead
 * of prop-drilling.
 *
 * `mode` is the single source of truth for the camera / interaction mode and
 * subsumes the old `overview` boolean:
 *   tour     — the scroll tour (default)
 *   overview — the pulled-back system map (Z)
 *   pilot    — manual free-flight (P)                 [Phase 3]
 *   warping  — a scripted hyperspace jump in flight   [Phase 4]
 */
const StellarUIContext = createContext(null);

export const useStellarUI = () => useContext(StellarUIContext);

export default StellarUIContext;
