"use client";
/* eslint-disable jsx-a11y/anchor-has-content */
/*
 * V3Hero — the v3 recruiter landing (stop 00). Far-left info column against the
 * whole-system view. Radical-minimal: a huge Fraunces name with one italic accent,
 * a grotesk role line, mono telemetry, and a single primary "begin the tour" CTA.
 * Cinematic entrance: masked line-reveal on the name, staggered fade-up on the rest
 * (motion/react; reduced-motion → instant). Reads ONLY from /src/content.
 */
import { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { personalInfo, heroContent, contactLinks } from "../../content";
import { DESTINATIONS } from "../config/destinations";
import { magnetic } from "./motion";

const SECONDARY = ["Resume", "GitHub", "LinkedIn"];
const ease = [0.22, 1, 0.36, 1];

const beginTour = () => {
  const max =
    (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight;
  const targetY = (1 / (DESTINATIONS.length - 1)) * max;
  if (window.__lenis) window.__lenis.scrollTo(targetY, { duration: 1.1 });
  else window.scrollTo({ top: targetY, behavior: "smooth" });
};

export default function V3Hero() {
  const reduce = useReducedMotion();
  const ctaRef = useRef(null);
  useEffect(() => magnetic(ctaRef.current, { strength: 0.3 }), []);

  const [first, ...rest] = (personalInfo.fullName || "").split(" ");
  const last = rest.join(" ");
  const links = SECONDARY.map((l) => contactLinks.find((c) => c.label === l)).filter(
    (c) => c && c.href
  );

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.12 } },
  };
  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };
  /* masked line reveal — the glyphs slide up from behind an overflow-clip edge */
  const maskLine = { display: "block", overflow: "hidden", paddingBottom: "0.06em" };
  const lineRise = {
    hidden: { y: reduce ? 0 : "108%" },
    show: { y: 0, transition: { duration: 0.85, ease } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ pointerEvents: "auto", maxWidth: "min(52ch, 46vw)", display: "flex", flexDirection: "column" }}
    >
      {/* kicker */}
      <motion.div
        variants={rise}
        style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)", display: "flex", alignItems: "center", gap: 14 }}
      >
        <span style={{ width: 36, height: 1, background: "var(--v3-line-strong)" }} />
        {personalInfo.role} · {personalInfo.location}
      </motion.div>

      {/* name — masked line reveal, italic accent surname */}
      <h1 style={{ font: `340 var(--v3-type-s6) var(--v3-font-display)`, fontOpticalSizing: "auto", lineHeight: 0.9, letterSpacing: "-.025em", color: "var(--v3-fg)", margin: ".16em 0 .1em" }}>
        <span style={maskLine}><motion.span style={{ display: "block" }} variants={lineRise}>{first}</motion.span></span>
        <span style={maskLine}><motion.span style={{ display: "block" }} variants={lineRise}><em style={{ fontStyle: "italic", fontWeight: 380, color: "var(--v3-accent)" }}>{last}</em></motion.span></span>
      </h1>

      <motion.p variants={rise} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0, maxWidth: "42ch" }}>
        {heroContent.tagline}
      </motion.p>

      <motion.div variants={rise} style={{ marginTop: 26, display: "flex", gap: 28, flexWrap: "wrap", font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-mute)" }}>
        <span><b style={{ color: "var(--v3-fg-dim)", fontWeight: 400 }}>STATUS</b> <span style={{ color: "#7fe9cf" }}>Open to roles</span></span>
        {personalInfo.yearsExperience && (
          <span><b style={{ color: "var(--v3-fg-dim)", fontWeight: 400 }}>EXP</b> {personalInfo.yearsExperience} yrs in production</span>
        )}
      </motion.div>

      <motion.div variants={rise} style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button
          ref={ctaRef}
          onClick={beginTour}
          data-cursor
          style={{ font: `500 .9rem var(--v3-font-ui)`, letterSpacing: ".01em", color: "var(--v3-bg-void)", background: "var(--v3-accent)", border: "1px solid transparent", borderRadius: 7, padding: "13px 24px", cursor: "pointer", transition: "box-shadow .25s var(--v3-ease-smooth)" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 30px color-mix(in oklab, var(--v3-accent) 30%, transparent)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          Begin the tour ↓
        </button>
        {links.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            download={c.download || undefined}
            style={{ font: `400 .84rem var(--v3-font-ui)`, color: "var(--v3-fg-dim)", border: "1px solid var(--v3-line-strong)", borderRadius: 7, padding: "12px 18px", textDecoration: "none", transition: "color .2s, border-color .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--v3-fg)"; e.currentTarget.style.borderColor = "var(--v3-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--v3-fg-dim)"; e.currentTarget.style.borderColor = "var(--v3-line-strong)"; }}
          >
            {c.label}
          </a>
        ))}
      </motion.div>
    </motion.div>
  );
}
