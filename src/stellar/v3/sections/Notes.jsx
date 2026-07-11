/*
 * Notes (Jupiter) — editorial magazine (no scroll).
 *
 * The taste-stack table originally called for a sticky-scroll magazine
 * where chapter titles pin as the body scrolls, but the "no scrolling
 * in content sections" rule wins across the whole tour. Adapting to a
 * click-driven master-detail:
 *   - LEFT (~30%): 3 chapter buttons, each with numeral + short year
 *     kicker + Fraunces title. Active chip gets accent border + tinted
 *     background.
 *   - RIGHT (~70%): the active chapter as an editorial spread —
 *     kicker (LOGGED YEAR · N tags) + big shutter-revealed Fraunces
 *     title + prose paragraph with a drop-cap on the first letter +
 *     tag chip rail. Zero scrollbar anywhere.
 *
 * Signature moment: on chapter switch, the title runs its clip-path
 * shutter reveal (same technique as Projects + Achievements). The prose
 * paragraph fades in with a subtle y-slide underneath. Drop-cap on the
 * paragraph reads as editorial voice.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { blogPosts, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3SectionHeader, V3Chip, masterCardStyle, useMasterListKeys } from "../primitives";
import { EASE, shutterVariants } from "../anim";

const META = sectionMeta.notes || {
  sub: "Working Notes",
  heading: "Journal from Production",
};

const SHUTTER_VARIANTS = shutterVariants();

const BODY_VARIANTS = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE, delay: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.12 } },
};

export default function NotesSection({ bootNonce }) {
  const list = blogPosts || [];
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const post = list[active] || list[0];

  const goto = useCallback((i) => {
    if (i < 0 || i >= list.length || i === active) return;
    setActive(i);
  }, [active, list.length]);
  const onKeys = useMasterListKeys(active, goto, list.length);

  return (
    <V3Frame
      section="Notes"
      planet="JUPITER"

      scanDir="horizontal"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 20px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)", height: "100%",
      }}>
        {/* Header */}
        <V3SectionHeader sub={META.sub} heading={META.heading} kickerSize="clamp(9px, 0.3vw + 7px, 11px)" wrapMinWidth />

        {/* Master-detail card */}
        <V3Scan variant="horizontal" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div
            role="tablist"
            aria-label="Working notes"
            onKeyDown={onKeys}
            style={masterCardStyle({ cols: "minmax(240px, 32%) 1fr", gap: "clamp(14px, 1.5vw, 26px)", padding: "clamp(12px, 1.2vw, 20px) clamp(14px, 1.4vw, 22px)" })}
          >
            {/* Master — 3 chapter buttons */}
            <div style={{
              display: "flex", flexDirection: "column",
              justifyContent: "space-between", gap: "clamp(6px, 0.7vw, 12px)",
              minWidth: 0, alignSelf: "stretch", height: "100%",
            }}>
              {list.map((p, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goto(i)}
                    style={{
                      all: "unset", cursor: "pointer",
                      display: "flex", flexDirection: "column",
                      gap: "clamp(4px, 0.4vw, 8px)",
                      padding: "clamp(10px, 1vw, 16px) clamp(10px, 1vw, 14px)",
                      border: `1px solid ${isActive ? "var(--v3-accent)" : "var(--v3-line)"}`,
                      borderLeftWidth: 3,
                      borderLeftColor: isActive ? "var(--v3-accent)" : "var(--v3-line)",
                      borderRadius: 4,
                      background: isActive ? "color-mix(in oklab, var(--v3-accent) 10%, transparent)" : "transparent",
                      transition: "background .2s, border-color .2s",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <span aria-hidden style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                        fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                        color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                        letterSpacing: ".18em",
                        fontVariantNumeric: "tabular-nums",
                      }}>Chapter {String(i + 1).padStart(2, "0")}</span>
                      {p.date && (
                        <span style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                          fontSize: "clamp(8.5px, 0.25vw + 6px, 10px)",
                          letterSpacing: ".22em",
                          color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}>{p.date}</span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.92rem, 0.4vw + 0.55rem, 1.1rem)",
                      lineHeight: 1.2, letterSpacing: "-.005em",
                      color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                      fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>{p.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Detail — editorial spread */}
            <div style={{
              display: "flex", flexDirection: "column",
              gap: "clamp(10px, 1vw, 18px)",
              minWidth: 0, minHeight: 0, overflow: "hidden",
              position: "relative",
            }}>
              {/* Static kicker: LOGGED YEAR · TAGS */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minWidth: 0 }}>
                <span style={{ width: 14, height: 1, background: "var(--v3-accent)", alignSelf: "center" }} />
                {post?.date && (
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                    letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                  }}>Logged {post.date}</span>
                )}
                <span aria-hidden style={{ color: "var(--v3-fg-mute)", opacity: 0.4 }}>·</span>
                <span style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                  fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                  letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                  fontVariantNumeric: "tabular-nums",
                }}>{String((post?.tags || []).length).padStart(2, "0")} tags</span>
              </div>

              {/* Swappable body — title + prose + tags + CTA */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`body-${active}`}
                  variants={BODY_VARIANTS}
                  initial={reduce ? false : "hidden"}
                  animate="show"
                  exit="exit"
                  style={{
                    display: "flex", flexDirection: "column",
                    gap: "clamp(10px, 1vw, 18px)",
                    minWidth: 0, minHeight: 0, flex: 1,
                  }}
                >
                  {/* Shutter-revealed title */}
                  <motion.h3
                    variants={reduce ? undefined : SHUTTER_VARIANTS}
                    style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(1.4rem, 1.1vw + 0.7rem, 2.2rem)",
                      lineHeight: 1.2, letterSpacing: "-.015em",
                      color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                      paddingBottom: "0.05em",
                    }}>{post?.title}</motion.h3>

                  {/* Prose paragraph with drop-cap on the first letter.
                      Scoped via `.v3-notes-lede` so no other paragraph
                      inherits it. */}
                  {post?.description && (
                    <p className="v3-notes-lede" style={{
                      fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                      fontSize: "clamp(0.88rem, 0.35vw + 0.6rem, 1rem)",
                      color: "var(--v3-fg-dim)", lineHeight: 1.7, margin: 0,
                      maxWidth: "min(66ch, 100%)",
                      overflowWrap: "break-word", hyphens: "auto",
                    }}>
                      {post.description}
                    </p>
                  )}
                  <style>{`
                    .v3-notes-lede::first-letter {
                      font-family: var(--v3-font-display);
                      font-weight: 340;
                      font-size: 3.2em;
                      line-height: 0.85;
                      float: left;
                      padding: 0.06em 0.14em 0 0;
                      margin-right: 0.02em;
                      color: var(--v3-fg);
                      font-optical-sizing: auto;
                      letter-spacing: -0.02em;
                    }
                  `}</style>

                  {/* Tags + CTA footer */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                    gap: 12, flexWrap: "wrap",
                    marginTop: "auto", paddingTop: "clamp(8px, 0.8vw, 12px)",
                    borderTop: "1px solid var(--v3-line)",
                    minWidth: 0,
                  }}>
                    {(post?.tags || []).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minWidth: 0 }}>
                        {(post.tags || []).map((t, k) => (
                          <V3Chip key={k}>{t}</V3Chip>
                        ))}
                      </div>
                    )}
                    {post?.link && post.link !== "#" && (
                      <a href={post.link} target={post.link.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                        fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                        letterSpacing: ".14em", textTransform: "uppercase",
                        color: "var(--v3-accent)", textDecoration: "none",
                        pointerEvents: "auto", cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}>Read note →</a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
