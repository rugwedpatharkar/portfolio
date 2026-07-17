/*
 * Contact — editorial send-channel (redesign 2026-07).
 * The Contact stop is Pluto; final tour stop. No cards, no scroll.
 *
 *   LEFT   — kicker · huge Pluto-tinted title · short lede · V3ContactForm.
 *   RIGHT  — outbound channel rail: hairline rows for Email / Call / GitHub /
 *            LinkedIn / Resume, each with tick-arrow CTA.
 *
 * All fields from contactLinks + sectionMeta.contact rendered verbatim.
 */
import { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { contactLinks, sectionMeta } from "../../../content";
import V3ContactForm from "../V3ContactForm";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    width: "min(100%, clamp(880px, 72vw, 1240px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: "clamp(40px, 5vw, 72px)",
    pointerEvents: "auto",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
    minHeight: 0,
    alignItems: "start",
  },

  /* ---- LEFT (masthead + form) ---- */
  left: { display: "flex", flexDirection: "column", gap: 18, minHeight: 0 },
  kicker: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".28em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  title: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(36px, 4vw, 60px)",
    lineHeight: 0.92,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  lede: {
    fontFamily: "var(--v3-font-ui)",
    fontSize: 14,
    lineHeight: 1.55,
    color: "var(--v3-fg-dim)",
    maxWidth: "48ch",
    margin: 0,
  },
  formWrap: {
    marginTop: 8,
    paddingTop: 18,
    borderTop: "1px solid var(--v3-line-strong)",
  },

  /* ---- RIGHT (channel rail) ---- */
  right: { display: "flex", flexDirection: "column", minHeight: 0, gap: 0 },
  railHead: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
    paddingBottom: 8,
    borderBottom: "1px solid var(--v3-line-strong)",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "28px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid var(--v3-line)",
    textDecoration: "none",
    color: "inherit",
    transition: "background .15s ease, color .18s ease",
    background: "transparent",
  },
  rowN: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "var(--v3-accent)",
  },
  rowMain: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  rowLbl: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  rowVal: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "-.005em",
    color: "var(--v3-fg)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  arrow: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 14,
    color: "var(--v3-accent)",
    marginLeft: 8,
  },
};

const ChannelRow = memo(function ChannelRow({ l, n }) {
  const external = l.href && (l.href.startsWith("http") || l.href.startsWith("mailto"));
  return (
    <a
      href={l.href || "#"}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={l.download ? true : undefined}
      data-cursor
      style={S.row}
      aria-label={`${l.label} — ${l.value}`}
    >
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowMain}>
        <span style={S.rowLbl}>{l.label}</span>
        <span style={S.rowVal}>{l.value}</span>
      </span>
      <span style={S.arrow} aria-hidden>↗</span>
    </a>
  );
});

export default function ContactSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.contact || {};
  const links = contactLinks || [];

  return (
    <div key={bootNonce} style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "Get in Touch"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Contact"}
        </motion.h1>
        {meta.description && <p style={S.lede}>{meta.description}</p>}
        <div style={S.formWrap}>
          <V3ContactForm />
        </div>
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <div style={S.railHead}>Channels · {String(links.length).padStart(2, "0")}</div>
        {links.map((l, i) => (
          <ChannelRow key={l.label} l={l} n={i + 1} />
        ))}
      </div>
    </div>
  );
}
