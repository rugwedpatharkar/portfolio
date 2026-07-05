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
import { personalInfo, contactLinks } from "../../content";
import { DESTINATIONS } from "../config/destinations";
import { magnetic } from "./motion";
import useViewport from "../useViewport";

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
  const { isCompact } = useViewport();
  const ctaRef = useRef(null);
  const linksRef = useRef(null);
  useEffect(() => magnetic(ctaRef.current, { strength: 0.3 }), []);
  /* Lighter magnetic pull on the secondary links (Resume/GitHub/LinkedIn) so the
     whole CTA row feels alive. No-op under reduced motion (magnetic() gates). */
  useEffect(() => {
    if (!linksRef.current) return undefined;
    const cleanups = [...linksRef.current.querySelectorAll("a")].map((a) => magnetic(a, { strength: 0.2 }));
    return () => cleanups.forEach((fn) => fn && fn());
  }, []);

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
  /* masked line reveal — the glyphs slide up from behind an overflow-clip edge.
     width:max-content so the clip never crops the wide name; horizontal padding
     gives the italic overhang (final "r") + the negative letter-spacing (first
     "R") room inside the clip box, and the matching negative margin cancels it so
     the visual left edge is unmoved. paddingBottom clears descenders (g, p). */
  /* Top padding must clear the full Fraunces ascender at display opsz
     (cap-height overshoots the em-box at line-height 0.9). Anything under
     ~0.3em still shaved the R at ≥10rem. Negative margin cancels the pad
     so surrounding baselines don't move. */
  const maskLine = { display: "block", width: "max-content", maxWidth: "none", overflow: "hidden", padding: "0.36em 0.18em 0.18em", margin: "-0.32em -0.18em -0.06em" };
  const lineRise = {
    hidden: { y: reduce ? 0 : "108%" },
    show: { y: 0, transition: { duration: 0.85, ease } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      /* Top-aligned + lifted so the (now bigger) name sits high in the frame,
         instead of being vertically centred by HoloBridge's alignItems:center. */
      style={{ pointerEvents: "auto", alignSelf: "flex-start", marginTop: "clamp(46px, 7vh, 104px)", maxWidth: isCompact ? "100%" : "min(58ch, 52vw)", display: "flex", flexDirection: "column" }}
    >
      {/* name — masked line reveal, italic accent surname. Bigger + lifted to the
          top; the role line now sits BELOW it (was a mono kicker above). */}
      <h1 style={{ fontFamily: "var(--v3-font-display)", fontWeight: 340, fontSize: isCompact ? "clamp(3rem, 14.5vw, 5rem)" : "clamp(6rem, 3.4rem + 11.5vw, 13rem)", fontOpticalSizing: "auto", lineHeight: 0.88, letterSpacing: "-.025em", color: "var(--v3-fg)", margin: "0 0 .06em" }}>
        <span style={maskLine}><motion.span style={{ display: "block" }} variants={lineRise}>{first}</motion.span></span>
        <span style={maskLine}><motion.span style={{ display: "block" }} variants={lineRise}><em style={{ fontStyle: "italic", fontWeight: 380, color: "var(--v3-accent)" }}>{last}</em></motion.span></span>
      </h1>

      {/* role · location — premium serif line BELOW the name. Fraunces bold for the
          role, italic accent-gold for the location. Replaces the old mono kicker. */}
      <motion.div variants={rise} style={{ marginTop: ".18em", display: "flex", alignItems: "baseline", gap: "0.5ch", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--v3-font-display)", fontWeight: 600, fontSize: "clamp(1.4rem, 0.85rem + 1.9vw, 2.4rem)", letterSpacing: "-.01em", color: "var(--v3-fg)", fontOpticalSizing: "auto" }}>
          {personalInfo.role}
        </span>
        <span aria-hidden="true" style={{ fontFamily: "var(--v3-font-display)", fontWeight: 400, fontSize: "clamp(1.2rem, 0.8rem + 1.5vw, 2rem)", color: "var(--v3-accent)", opacity: 0.7 }}>·</span>
        <span style={{ fontFamily: "var(--v3-font-display)", fontStyle: "italic", fontWeight: 420, fontSize: "clamp(1.25rem, 0.8rem + 1.6vw, 2.1rem)", letterSpacing: "-.005em", color: "var(--v3-accent)", fontOpticalSizing: "auto" }}>
          {personalInfo.location}
        </span>
      </motion.div>

      <motion.div ref={linksRef} variants={rise} style={{ marginTop: "clamp(30px, 4.5vh, 52px)", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
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
