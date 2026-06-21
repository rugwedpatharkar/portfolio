import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
// Direct import from the per-section content module — bypasses the content
// barrel so this chunk doesn't pull in projects/experiences/skills data.
import { notes } from "../../content/sections/notes";
import { sectionMeta } from "../../content";
import { fadeIn } from "../../utils/motion";
import Section from "../../hoc/Section";

/*
 * Notes uses the compound <Section> API — first section migrated. Other
 * sections still use the SectionWrapper HOC; they can migrate piecemeal
 * without breaking anything.
 *
 * It is intentionally NOT a card grid — every other section already uses
 * the bordered-card pattern. A typographic reading list differentiates the
 * cadence and makes the section read as "writing", not "another gallery".
 */

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

/*
 * Signature scroll moment: as each row enters the viewport, its index marker
 * scrubs from caption-sized white/30 to a glowing accent-colored numeric.
 * Pure transform/opacity → 60fps even on low-end devices.
 */
const NoteRow = ({ note, index }) => {
  const rowRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 90%", "end 30%"],
  });
  const markerScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1.15, 1.15, 0.95]);
  const markerColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    ["rgba(255,255,255,0.3)", "rgba(145,94,255,0.95)", "rgba(145,94,255,0.95)", "rgba(255,255,255,0.4)"]
  );

  return (
  <motion.li
    ref={rowRef}
    variants={fadeIn("up", "spring", 0.05 * index, 0.6)}
    className="group relative grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-x-4 sm:gap-x-8 gap-y-2 items-baseline py-6 sm:py-8 border-t border-white/[0.08] first:border-t-0"
  >
    <motion.span
      className="font-mono text-caption pt-1 tabular-nums shrink-0 inline-block origin-left"
      style={{ scale: markerScale, color: markerColor }}
    >
      {String(index + 1).padStart(2, "0")}
    </motion.span>

    <div className="min-w-0">
      <a
        href={note.href}
        className="block group/link"
        onClick={(e) => {
          if (note.href.startsWith("#")) e.preventDefault();
        }}
      >
        <h3 className="font-heading font-bold text-white text-heading-sm sm:text-heading leading-snug text-balance group-hover/link:text-[#915eff] transition-colors">
          {note.title}
        </h3>
        <p className="mt-2 text-secondary text-body-sm sm:text-body leading-relaxed max-w-[65ch]">
          {note.blurb}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption font-mono text-white/40">
          {note.tags.map((t, i) => (
            <span key={t} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true" className="text-white/20">·</span>}
              <span>{t}</span>
            </span>
          ))}
        </div>
      </a>
    </div>

    <div className="hidden sm:flex flex-col items-end gap-1 text-right pt-1 shrink-0">
      <span className="font-mono text-caption text-white/40 tabular-nums">
        {formatDate(note.date)}
      </span>
      <span className="font-mono text-micro text-white/30">
        {note.readingTime} min read
      </span>
    </div>
  </motion.li>
  );
};

const Notes = () => (
  <Section id="notes" label="NOTES">
    <Section.Header>
      <Section.Eyebrow>{sectionMeta.notes.sub}</Section.Eyebrow>
      <Section.Title>{sectionMeta.notes.heading}</Section.Title>
      <Section.Lede>{sectionMeta.notes.description}</Section.Lede>
    </Section.Header>

    <Section.Body>
      <ul className="max-w-3xl">
        {notes.map((note, i) => (
          <NoteRow key={note.id} note={note} index={i} />
        ))}
      </ul>

      <motion.p
        variants={fadeIn("up", "spring", 0.2, 0.6)}
        className="mt-10 text-caption font-mono text-white/40 max-w-[60ch]"
      >
        — More notes land as I write them. Reach out via the contact section if any of these
        sparked a conversation you&apos;d like to have.
      </motion.p>
    </Section.Body>
  </Section>
);

export default Notes;
