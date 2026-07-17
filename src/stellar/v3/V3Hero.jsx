/*
 * V3Hero — the recruiter landing (stop 00), Layered Cinematic redesign (2026-07).
 *
 * Composition (Direction A from the live mockup):
 *   - Giant ghost initial ("R") as a Sol-tinted backdrop overlay
 *   - Status pill on top (● Open to roles · Backend & Agentic AI · Available now)
 *   - MASSIVE two-line name: "Rugwed" (Syne, white) → "Patharkar" (Syne italic, gold)
 *   - Longer role sentence (Sora) with bold emphasis on impact clauses
 *   - Buttons row (Begin the tour ↓ / Résumé / GitHub / LinkedIn)
 *
 * Cinematic entrance: masked line-reveal on the name lines, staggered fade-up on
 * everything else (motion/react; reduced-motion → instant). Reads only from
 * /src/content.
 */
import { memo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { personalInfo, contactLinks } from "../../content";
import { DESTINATIONS } from "../config/destinations";
import { magnetic } from "./motion";
import useViewport from "../useViewport";
import { EASE as ease } from "./anim";

const SECONDARY = ["Resume", "GitHub", "LinkedIn"];

const beginTour = () => {
  const max =
    (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight;
  const targetY = (1 / (DESTINATIONS.length - 1)) * max;
  if (window.__lenis) window.__lenis.scrollTo(targetY, { duration: 1.1 });
  else window.scrollTo({ top: targetY, behavior: "smooth" });
};

function V3Hero() {
  const reduce = useReducedMotion();
  const { isCompact } = useViewport();
  const ctaRef = useRef(null);
  const linksRef = useRef(null);
  useEffect(() => magnetic(ctaRef.current, { strength: 0.3 }), []);
  useEffect(() => {
    if (!linksRef.current) return undefined;
    const cleanups = [...linksRef.current.querySelectorAll("a")].map((a) => magnetic(a, { strength: 0.2 }));
    return () => cleanups.forEach((fn) => fn && fn());
  }, []);

  const [first, ...rest] = (personalInfo.fullName || "").split(" ");
  const last = rest.join(" ");
  const initial = (first || "R").charAt(0);
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
  const initialRise = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.94 },
    show: { opacity: 1, scale: 1, transition: { duration: 1.4, ease } },
  };
  /* masked line reveal — the glyphs slide up from behind an overflow-clip edge.
     width:max-content so the clip never crops the wide name; horizontal padding
     gives the italic overhang + the negative letter-spacing room inside the clip
     box, and the matching negative margin cancels it so the visual left edge is
     unmoved. paddingBottom clears descenders (g, p). */
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
      style={{
        pointerEvents: "auto",
        alignSelf: "flex-start",
        marginTop: "clamp(30px, 5vh, 60px)",
        maxWidth: isCompact ? "100%" : "min(60ch, 52vw)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        paddingTop: 4,
      }}
    >
      {/* Ghost initial — huge Sol-tinted "R" as a typographic backdrop. Wrapped
          in its own overflow-clipped container so it can't bleed past the panel
          edge; the OUTER container stays unclipped so the wide Syne name is
          never truncated. Anchored at (0, 0) inside the wrapper. */}
      {!isCompact && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <motion.div
            variants={initialRise}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontFamily: "var(--v3-font-display)",
              fontWeight: 800,
              fontSize: "clamp(220px, 20vw, 360px)",
              lineHeight: 0.82,
              letterSpacing: "-.08em",
              color: "color-mix(in oklab, var(--v3-accent) 14%, transparent)",
              userSelect: "none",
            }}
          >
            {initial}
          </motion.div>
        </div>
      )}

      {/* status pill */}
      <motion.div
        variants={rise}
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--v3-font-mono)",
          fontSize: 11,
          letterSpacing: ".28em",
          textTransform: "uppercase",
          color: "var(--v3-fg-mute)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span aria-hidden style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#7fe9cf",
          boxShadow: "0 0 8px rgba(127, 233, 207, .7)",
          animation: "heroPulse 2.4s ease-in-out infinite",
        }} />
        <span style={{ color: "var(--v3-fg)", fontWeight: 500 }}>Open to roles</span>
        <span aria-hidden style={{ opacity: 0.4 }}>·</span>
        <span>Backend &amp; Agentic AI</span>
        <span aria-hidden style={{ opacity: 0.4 }}>·</span>
        <span>Available now</span>
      </motion.div>

      {/* MASSIVE name — Syne, two lines, italic gold surname.
          line-height 0.82 tightens the two lines (Syne descenders + italic
          overhang can otherwise sit 30-50px apart). */}
      <h1 style={{
        position: "relative",
        zIndex: 1,
        fontFamily: "var(--v3-font-display)",
        fontWeight: 800,
        fontSize: isCompact ? "clamp(3rem, 13vw, 4.4rem)" : "clamp(4rem, 2.6rem + 6vw, 7.6rem)",
        lineHeight: 0.82,
        letterSpacing: "-.035em",
        color: "var(--v3-fg)",
        margin: "clamp(14px, 2vh, 22px) 0 0",
      }}>
        <span style={maskLine}>
          <motion.span style={{ display: "block" }} variants={lineRise}>{first}</motion.span>
        </span>
        <span style={maskLine}>
          <motion.span
            style={{ display: "block" }}
            variants={lineRise}
          >
            <em style={{
              fontStyle: "italic",
              fontWeight: 600,
              color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
            }}>{last}</em>
          </motion.span>
        </span>
      </h1>

      {/* role sentence — Sora, larger + fuller, bold impact clauses */}
      <motion.p
        variants={rise}
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "clamp(16px, 2.4vh, 26px)",
          fontFamily: "var(--v3-font-ui)",
          fontSize: isCompact ? "clamp(0.98rem, 3.4vw, 1.05rem)" : "clamp(1rem, 0.8rem + 0.55vw, 1.3rem)",
          lineHeight: 1.5,
          letterSpacing: "-.005em",
          color: "var(--v3-fg-dim)",
          maxWidth: "42ch",
          margin: "clamp(16px, 2.4vh, 26px) 0 0",
        }}
      >
        {personalInfo.role} · {personalInfo.location} — I build the backend infrastructure hospitality SaaS runs on. <b style={{ color: "var(--v3-fg)", fontWeight: 600 }}>31-service Python/gRPC platform on GKE</b> and production agentic AI across <b style={{ color: "var(--v3-fg)", fontWeight: 600 }}>4 LLM providers</b>.
      </motion.p>

      <motion.div
        ref={linksRef}
        variants={rise}
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "clamp(24px, 3.4vh, 36px)",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          ref={ctaRef}
          onClick={beginTour}
          data-cursor
          style={{
            font: `600 .95rem var(--v3-font-ui)`,
            letterSpacing: ".01em",
            color: "var(--v3-bg-void)",
            background: "var(--v3-accent)",
            border: "1px solid transparent",
            borderRadius: 7,
            padding: "14px 26px",
            cursor: "pointer",
            transition: "box-shadow .25s var(--v3-ease-smooth)",
          }}
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
            style={{
              font: `500 .84rem var(--v3-font-ui)`,
              color: "var(--v3-fg-dim)",
              border: "1px solid var(--v3-line-strong)",
              borderRadius: 7,
              padding: "12px 20px",
              textDecoration: "none",
              transition: "color .2s, border-color .2s, background .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--v3-fg)";
              e.currentTarget.style.borderColor = "var(--v3-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--v3-fg-dim)";
              e.currentTarget.style.borderColor = "var(--v3-line-strong)";
            }}
          >
            {c.label}
          </a>
        ))}
      </motion.div>

      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(127, 233, 207, .7); }
          50%      { opacity: .55; box-shadow: 0 0 4px rgba(127, 233, 207, .3); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes heroPulse { 0%, 100% { opacity: 1; } }
        }
      `}</style>
    </motion.div>
  );
}

export default memo(V3Hero);
