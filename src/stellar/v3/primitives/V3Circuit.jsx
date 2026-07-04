"use client";
/*
 * V3Circuit — connected-node layout: nodes on a horizontal or vertical baseline
 * (or a 2D grid) with animated fill lines between them, each node with an optional
 * callout. Used for Experience (vertical), Education (horizontal), Achievements
 * (grid). Restrained: hairline wires with accent nodes.
 *
 * `mode`: "horizontal" | "vertical" | "grid"
 * `nodes`: [{ id, render, ring? }]
 * `cols`: for grid mode
 */
import { motion, useReducedMotion } from "motion/react";
import V3Scan from "./V3Scan";

const ease = [0.22, 1, 0.36, 1];

const Wire = ({ mode }) => {
  const reduce = useReducedMotion();
  const style = mode === "horizontal"
    ? { height: 1, flex: 1, background: "linear-gradient(90deg, var(--v3-accent), color-mix(in oklab, var(--v3-accent) 15%, transparent))", opacity: 0.6, transformOrigin: "left" }
    : { width: 1, height: "100%", minHeight: 28, background: "linear-gradient(180deg, var(--v3-accent), color-mix(in oklab, var(--v3-accent) 15%, transparent))", opacity: 0.6, transformOrigin: "top" };
  if (reduce) return <span aria-hidden style={style} />;
  return (
    <motion.span
      aria-hidden
      style={style}
      initial={{ scaleX: mode === "horizontal" ? 0 : 1, scaleY: mode === "vertical" ? 0 : 1 }}
      animate={{ scaleX: 1, scaleY: 1 }}
      transition={{ duration: 0.55, ease, delay: 0.15 }}
    />
  );
};

const Node = ({ children, delay = 0 }) => {
  const reduce = useReducedMotion();
  const dot = <span aria-hidden style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "var(--v3-accent)", boxShadow: "0 0 12px var(--v3-accent)" }} />;
  if (reduce) return <div style={{ position: "relative", paddingTop: 10 }}>{dot}{children}</div>;
  return (
    <motion.div style={{ position: "relative", paddingTop: 10 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease, delay }}>
      {dot}
      {children}
    </motion.div>
  );
};

export default function V3Circuit({ mode = "horizontal", nodes = [], cols = 4, scanDelay = 0.2, gap = 22 }) {
  if (mode === "grid") {
    return (
      <V3Scan delay={scanDelay}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
          {nodes.map((n, i) => (
            <Node key={n.id || i} delay={0.05 * i}>{n.render}</Node>
          ))}
        </div>
      </V3Scan>
    );
  }
  const dir = mode === "vertical" ? "column" : "row";
  return (
    <V3Scan delay={scanDelay}>
      <div style={{ display: "flex", flexDirection: dir, alignItems: mode === "vertical" ? "stretch" : "flex-start", gap }}>
        {nodes.map((n, i) => (
          <div key={n.id || i} style={{ display: "flex", flexDirection: dir, alignItems: mode === "vertical" ? "flex-start" : "center", flex: mode === "vertical" ? "0 0 auto" : 1, gap }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Node delay={0.05 * i}>{n.render}</Node>
            </div>
            {i < nodes.length - 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: mode === "vertical" ? 28 : "auto", width: mode === "horizontal" ? "auto" : "100%", flex: mode === "horizontal" ? 1 : "0 0 auto" }}>
                <Wire mode={mode} />
              </div>
            )}
          </div>
        ))}
      </div>
    </V3Scan>
  );
}
