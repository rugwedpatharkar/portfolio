/* eslint-disable jsx-a11y/anchor-has-content */
/*
 * V3Hero — the v3 recruiter landing (stop 00). Far-left info column against the
 * whole-system view (Sun far-right, planets sweeping the middle). Radical-minimal:
 * a huge Fraunces name with one italic accent, a grotesk role line, mono telemetry,
 * and a single primary "begin the tour" CTA beside quiet secondary links.
 *
 * Reads ONLY from /src/content (unchanged data). Styled from the v3 CSS vars that
 * V3Style injects. Content is untouched — this is a new *view* over it.
 */
import { useRef, useEffect } from "react";
import { personalInfo, heroContent, contactLinks } from "../../content";
import { DESTINATIONS } from "../config/destinations";
import { magnetic } from "./motion";

const SECONDARY = ["Resume", "GitHub", "LinkedIn"];

/* Advance the scroll tour to the first stop (Sun) — the Navigator snap lands it. */
const beginTour = () => {
  const max =
    (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight;
  const targetY = (1 / (DESTINATIONS.length - 1)) * max;
  if (window.__lenis) window.__lenis.scrollTo(targetY, { duration: 1.1 });
  else window.scrollTo({ top: targetY, behavior: "smooth" });
};

export default function V3Hero() {
  const ctaRef = useRef(null);
  useEffect(() => magnetic(ctaRef.current, { strength: 0.3 }), []);

  const [first, ...rest] = (personalInfo.fullName || "").split(" ");
  const last = rest.join(" ");
  const links = SECONDARY.map((l) => contactLinks.find((c) => c.label === l)).filter(
    (c) => c && c.href
  );

  return (
    <div
      style={{
        pointerEvents: "auto",
        maxWidth: "min(52ch, 46vw)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* kicker — role · location, mono, tracked */}
      <div
        style={{
          font: `400 var(--v3-type-cap) var(--v3-font-mono)`,
          letterSpacing: ".28em",
          textTransform: "uppercase",
          color: "var(--v3-fg-mute)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ width: 36, height: 1, background: "var(--v3-line-strong)" }} />
        {personalInfo.role} · {personalInfo.location}
      </div>

      {/* name — giant Fraunces, italic accent on the surname */}
      <h1
        style={{
          font: `340 var(--v3-type-s6) var(--v3-font-display)`,
          fontOpticalSizing: "auto",
          lineHeight: 0.9,
          letterSpacing: "-.025em",
          color: "var(--v3-fg)",
          margin: ".16em 0 .1em",
        }}
      >
        {first}
        <br />
        <em style={{ fontStyle: "italic", fontWeight: 380, color: "var(--v3-accent)" }}>{last}</em>
      </h1>

      {/* role / tagline — grotesk */}
      <p
        style={{
          font: `300 var(--v3-type-body) var(--v3-font-ui)`,
          color: "var(--v3-fg-dim)",
          lineHeight: 1.5,
          maxWidth: "42ch",
          margin: 0,
        }}
      >
        {heroContent.tagline}
      </p>

      {/* telemetry — status + location + years, mono */}
      <div
        style={{
          marginTop: 26,
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          font: `400 var(--v3-type-cap) var(--v3-font-mono)`,
          color: "var(--v3-fg-mute)",
        }}
      >
        <span>
          <b style={{ color: "var(--v3-fg-dim)", fontWeight: 400 }}>STATUS</b>{" "}
          <span style={{ color: "#7fe9cf" }}>Open to roles</span>
        </span>
        {personalInfo.yearsExperience && (
          <span>
            <b style={{ color: "var(--v3-fg-dim)", fontWeight: 400 }}>EXP</b>{" "}
            {personalInfo.yearsExperience} yrs in production
          </span>
        )}
      </div>

      {/* CTAs — one primary + quiet secondary links */}
      <div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button
          ref={ctaRef}
          onClick={beginTour}
          style={{
            font: `500 .9rem var(--v3-font-ui)`,
            letterSpacing: ".01em",
            color: "var(--v3-bg-void)",
            background: "var(--v3-accent)",
            border: "1px solid transparent",
            borderRadius: 7,
            padding: "13px 24px",
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
              font: `400 .84rem var(--v3-font-ui)`,
              color: "var(--v3-fg-dim)",
              border: "1px solid var(--v3-line-strong)",
              borderRadius: 7,
              padding: "12px 18px",
              textDecoration: "none",
              transition: "color .2s, border-color .2s",
            }}
          >
            {c.label}
          </a>
        ))}
      </div>
    </div>
  );
}
