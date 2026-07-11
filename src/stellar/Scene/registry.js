/*
 * §6.2 — tier-2 SCENE_OBJECTS registry.
 *
 * The 22 mounts that used to be a 40-line block of `{showMid && ...}` JSX in
 * Scene/index.jsx (the anomaly suite + transient objects: BlackHole, comets,
 * pulsars, deep-field exotics, cosmic web markers, wormhole).
 *
 * Every row mounts only when `showMid` (extrasPhase >= 2 && !finale). Adding
 * one more anomaly = append one row.
 *
 * Row shape:
 *   id         URL-slug-ish; React key + easy grep target
 *   C          component
 *   motion     truthy → gate on `!reducedMotion`
 *   desktop    truthy → gate on `!isMobile`
 *   animate    truthy → pass `animate={!reducedMotion}` (some deep-field
 *              components take it; comets / meteors detect motion themselves)
 *   hoverable  truthy → attach onPointerOver / onPointerOut
 *   props      static prop bag spread onto the element
 *
 * NOT in this registry: the planet loop (already data-driven off DESTINATIONS),
 * belts + dust (bespoke per-instance props), per-planet extras
 * (SaturnHexagon, IoTorus, MoonGeysers, etc. — belong on the OrbitGroup where
 * they inherit the body's transform), and the edge mounts (DwarfPlanets,
 * OortCloud, TrojanAsteroids, SolarEclipse, etc. — different tier gates).
 */
import BlackHole from "./anomalies/BlackHole";
import CosmicMarker from "./anomalies/CosmicMarker";
import DeepFieldMysteries from "./anomalies/DeepFieldMysteries";
import EinsteinRing from "./anomalies/EinsteinRing";
import EtaCarinae from "./anomalies/EtaCarinae";
import ExoticObjects from "./anomalies/ExoticObjects";
import GlobularCluster from "./anomalies/GlobularCluster";
import GravWaveChirp from "./anomalies/GravWaveChirp";
import Hypergiant from "./anomalies/Hypergiant";
import Kilonova from "./anomalies/Kilonova";
import Pulsar from "./anomalies/Pulsar";
import RedDots from "./anomalies/RedDots";
import Wormhole from "./anomalies/Wormhole";
import AtlasComet from "./AtlasComet";
import Comet from "./Comet";
import DangerField from "./DangerField";
import InterstellarVisitor from "./InterstellarVisitor";
import Meteors from "./Meteors";
import ShootingStars from "./ShootingStars";
import { placeInFrontOfSun } from "../config/destinations";

export const SCENE_OBJECTS = [
  { id: "blackhole",       C: BlackHole,           animate: true, hoverable: true, props: { position: placeInFrontOfSun([49, -6, -15]), radius: 32 } },
  { id: "danger",          C: DangerField,         animate: true },
  { id: "comet",           C: Comet,               motion: true },
  { id: "interstellar",    C: InterstellarVisitor, motion: true, animate: true },
  { id: "atlas-green",     C: AtlasComet,          motion: true },
  { id: "atlas-red",       C: AtlasComet,          motion: true, props: { start: [-620, -150, 240], vel: [168, 4, -64], coma: "#e0a890", ion: "#cdbfa0", dust: "#e8d8b8", antiTail: false, comaR: 1.2, respawn: 780 } },
  { id: "shooting",        C: ShootingStars,       motion: true, animate: true },
  { id: "meteors",         C: Meteors,             motion: true, desktop: true },
  { id: "pulsar",          C: Pulsar,              motion: true, desktop: true },
  { id: "exotic",          C: ExoticObjects,       animate: true },
  { id: "deepfield",       C: DeepFieldMysteries,  animate: true },
  { id: "kilonova",        C: Kilonova,            animate: true },
  { id: "hypergiant",      C: Hypergiant,          animate: true },
  { id: "etacarinae",      C: EtaCarinae,          animate: true },
  { id: "einstein",        C: EinsteinRing,        animate: true },
  { id: "globular",        C: GlobularCluster,     animate: true },
  { id: "gwchirp",         C: GravWaveChirp,       animate: true },
  { id: "reddots",         C: RedDots,             animate: true },
  { id: "marker-void",     C: CosmicMarker,        animate: true, props: { raw: [-44,  38,  28], kind: "void",      count: 520, radius: 11, glow: "#8aa0d8" } },
  { id: "marker-attractor",C: CosmicMarker,        animate: true, props: { raw: [ 60,  20, -40], kind: "attractor", count: 680, radius: 10, glow: "#ffd0a0" } },
  { id: "marker-wall",     C: CosmicMarker,        animate: true, props: { raw: [-64, -10, -48], kind: "wall",      count: 760, radius: 13, glow: "#a0b6ff" } },
  { id: "wormhole",        C: Wormhole },
];
