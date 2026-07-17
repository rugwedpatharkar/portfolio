/*
 * About — intro dossier in the editorial-spread aesthetic (redesign 2026-07).
 * The Sun stop is `kind:"star"` and the camera parks close, so the Sun's disk
 * fills the right half of the viewport. All content lives on the LEFT of the
 * frame, constrained to the safe zone. No cards, no scroll.
 *
 *   TOP LEFT   — portrait + huge Fraunces name; role + location beside it.
 *   BODY LEFT  — mono kicker + drop-cap Sora bio prose (personalInfo.about).
 *   BOTTOM     — availability pill + spec sheet (Role / Based / Languages / Tenure).
 *
 * All fields from personalInfo rendered verbatim (src/content/index.js).
 */
import { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { personalInfo, sectionMeta } from "../../../content";
import heroPhoto from "../../../assets/hero-photo-1024.webp";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    /* Sun stop: keep everything on the LEFT so the Sun disk owns the right. */
    width: "min(100%, clamp(720px, 54vw, 940px))",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 22,
    pointerEvents: "auto",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
    minHeight: 0,
  },

  headRow: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 24,
    alignItems: "end",
    paddingBottom: 22,
    borderBottom: "1px solid var(--v3-line-strong)",
  },
  portraitWrap: {
    position: "relative",
    width: "clamp(110px, 10vw, 140px)",
    height: "clamp(140px, 13vw, 180px)",
    overflow: "hidden",
    borderRadius: 2,
    border: "1px solid var(--v3-line-strong)",
  },
  portrait: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  nameBlock: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  role: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".28em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  name: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(40px, 4.5vw, 68px)",
    lineHeight: 0.88,
    letterSpacing: "-.025em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
  },
  locationRow: {
    marginTop: 4,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  locationK: { color: "var(--v3-fg)", fontWeight: 500 },

  /* Body ---- */
  kicker: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".28em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
    marginBottom: -4,
  },
  bioWrap: { position: "relative" },
  bio: {
    fontFamily: "var(--v3-font-ui)",
    fontSize: "clamp(14px, 1.05vw, 16px)",
    lineHeight: 1.68,
    color: "var(--v3-fg-dim)",
    maxWidth: "70ch",
    margin: 0,
  },
  dropCap: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    float: "left",
    fontSize: "clamp(48px, 5vw, 68px)",
    lineHeight: 0.85,
    marginRight: 10,
    marginTop: 4,
  },

  /* Bottom strip ---- */
  bottom: {
    marginTop: "auto",
    paddingTop: 20,
    borderTop: "1px solid var(--v3-line-strong)",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "12px 32px",
    alignItems: "start",
  },
  availabilityWrap: { display: "flex", alignItems: "center", gap: 10 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--v3-status-ok, #7fe9cf)",
    boxShadow: "0 0 8px rgba(127, 233, 207, .7)",
  },
  availability: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    color: "var(--v3-fg)",
  },
  spec: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px 24px",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    alignItems: "baseline",
  },
  specK: { color: "var(--v3-fg)", fontWeight: 500 },
};

/* Split the bio into first char + rest so we can drop-cap it. */
const buildBio = (raw) => {
  const s = String(raw || "");
  if (!s) return { first: "", rest: "" };
  return { first: s.charAt(0), rest: s.slice(1) };
};

const About = memo(function About({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.about || {};
  const p = personalInfo || {};
  const { first, rest } = buildBio(p.about);

  return (
    <div key={bootNonce} style={S.root}>
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: CINE }}
        style={S.headRow}
      >
        <div style={S.portraitWrap}>
          <img src={heroPhoto} alt={`Portrait of ${p.fullName || p.name || "the author"}`} style={S.portrait} />
        </div>
        <div style={S.nameBlock}>
          <div style={S.role}>{p.role || "Software Engineer"}</div>
          <h1 style={S.name}>{p.fullName || p.name || "Rugwed Patharkar"}</h1>
          <div style={S.locationRow}>
            <span style={S.locationK}>{p.location || "Pune, India"}</span>
            {p.languages && <span> · {p.languages}</span>}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: CINE }}
        style={S.bioWrap}
      >
        <div style={S.kicker}>— {meta.sub || "Introduction"}</div>
        <p style={{ ...S.bio, marginTop: 12 }}>
          {first && <span style={S.dropCap}>{first}</span>}
          {rest}
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: CINE }}
        style={S.bottom}
      >
        <div style={S.availabilityWrap}>
          <span style={S.dot} aria-hidden />
          <span style={S.availability}>Open to roles</span>
        </div>
        <div style={S.spec}>
          <div><span style={S.specK}>Role</span> · {p.role || "Software Engineer"}</div>
          <div><span style={S.specK}>Based</span> · {p.location || "Pune, India"}</div>
          {p.languages && <div><span style={S.specK}>Languages</span> · {p.languages}</div>}
          {p.yearsExperience && <div><span style={S.specK}>Tenure</span> · {p.yearsExperience} yrs</div>}
        </div>
      </motion.div>
    </div>
  );
});

export default About;
