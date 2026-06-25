/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import useViewport from "./useViewport";
import SkillsConstellation from "./SkillsConstellation";
import { PLANET_FACTS } from "./data/planetFacts";
import heroPhoto from "../assets/hero-photo-1024.webp";
import aboutPhoto from "../assets/photo-800.webp";
import {
  personalInfo,
  experiences,
  skills,
  projects,
  funFacts,
  educations,
  achievements,
  hobbies,
  testimonials,
  contactLinks,
  blogPosts,
  sectionMeta,
  heroContent,
} from "../content";

/*
 * Renders the section content for the active destination as an overlay
 * panel pinned to the lower half of the viewport. The 3D scene remains
 * visible above + behind the panel.
 *
 * Layout: a wide max-width panel, glass background, scrollable inner
 * content. Recruiter reads the panel; engineer can also see the planet.
 *
 * Each section's content is hand-mapped to a focused layout that suits
 * the planet metaphor — not a copy-paste of the original section HTML.
 */

/* Stat value animates via the shared CountUp (defined below; reduced-motion
   aware) — parse "31" / "7+" / "96%" into number + suffix. */
const Stat = ({ label, value }) => {
  const m = String(value).match(/^(\d+)(.*)$/);
  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "white", fontWeight: 700, lineHeight: 1 }}>
        {m ? <CountUp to={parseInt(m[1], 10)} suffix={m[2]} /> : value}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
    </div>
  );
};

const SectionLabel = ({ children, color = "#b8a0ff" }) => (
  <div style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color,
    letterSpacing: "0.08em",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  }}>
    <span>→</span>
    <span>{children}</span>
  </div>
);

/* Section name heading removed per request — each section now reads as just its
   small eyebrow label + description + content (no big "NOTES & WRITING" title
   floating over the scene). Kept as a no-op so the per-section call sites stay
   simple + this is trivially reversible. */
const SectionTitle = () => null;

const SectionLede = ({ children }) => (
  <p style={{
    fontFamily: "'Exo 2', sans-serif",
    fontSize: 15.5,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.82)",
    margin: "0 0 16px 0",
    maxWidth: "60ch",
  }}>{children}</p>
);

/* Rugwed's portrait — a cut-out webp framed in a glowing ring. Shown only
   on Sol + About (the "who is this" stops). The ring tint matches the
   destination colour so it reads as part of the cockpit palette. */
const Portrait = ({ size = 120, color = "#ffb86b", src = heroPhoto, focus = "center 16%" }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      overflow: "hidden",
      border: `2px solid ${color}77`,
      boxShadow: `0 0 0 5px ${color}14, 0 0 42px ${color}40, 0 16px 48px rgba(0,0,0,0.6)`,
      background: `radial-gradient(circle at 50% 24%, ${color}2e, rgba(8,10,26,0.7))`,
    }}
  >
    <img
      src={src}
      alt="Rugwed Patharkar"
      loading="lazy"
      draggable={false}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus }}
    />
  </div>
);

/* Panel-less card: bare content over the scrim — no box, no border, just
   padding so the grid breathes. Grouping reads from the coloured heading +
   the accent bars/tags + spacing, matching the "no panels" direction. */
const bareCard = { padding: "1px 2px 8px" };

/* ── Per-destination renderers ─────────────────────────────────────── */

/* Scroll the tour to a stop index (Lenis if present). */
const scrollToStop = (idx, total = 12) => {
  if (typeof window === "undefined") return;
  const max = (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight;
  const y = (idx / (total - 1)) * max;
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.3 });
  else window.scrollTo({ top: y, behavior: "smooth" });
};

/* Typewriter that cycles the hero's specialties (frozen under reduced-motion). */
const RoleRotator = () => {
  const { reducedMotion } = useViewport();
  const roles = heroContent.typewriterRoles;
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(reducedMotion ? roles[0] : "");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const full = roles[i];
    let t;
    if (!deleting) {
      if (shown.length < full.length) t = setTimeout(() => setShown(full.slice(0, shown.length + 1)), 52);
      else t = setTimeout(() => setDeleting(true), 1900);
    } else if (shown.length > 0) {
      t = setTimeout(() => setShown(full.slice(0, shown.length - 1)), 26);
    } else {
      setDeleting(false);
      setI((p) => (p + 1) % roles.length);
    }
    return () => clearTimeout(t);
  }, [shown, deleting, i, reducedMotion, roles]);
  return (
    <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 17, color: "#ffd9a0", margin: "9px 0 0 0", fontWeight: 600, letterSpacing: "0.01em", minHeight: 24 }}>
      {shown}
      {!reducedMotion && <span style={{ opacity: 0.75, animation: "stellarCaret 1s step-end infinite" }}>▍</span>}
    </p>
  );
};

/* Count-up number for the hero stats (instant under reduced-motion). */
const CountUp = ({ to, suffix }) => {
  const { reducedMotion } = useViewport();
  const [n, setN] = useState(reducedMotion ? to : 0);
  useEffect(() => {
    if (reducedMotion) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1200);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reducedMotion]);
  return <>{n}{suffix}</>;
};

const HeroChip = ({ children, href, onClick, primary }) => {
  const style = {
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 15px",
    minHeight: 40,
    borderRadius: 999,
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11.5,
    letterSpacing: "0.04em",
    transition: "background 0.18s ease, border-color 0.18s ease",
    background: primary ? "rgba(255,184,107,0.16)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${primary ? "rgba(255,184,107,0.5)" : "rgba(255,255,255,0.16)"}`,
    color: primary ? "#ffd9a0" : "rgba(255,255,255,0.85)",
  };
  const hover = { y: -3, boxShadow: "0 10px 26px rgba(0,0,0,0.38)" };
  const tap = { scale: 0.97 };
  const motionProps = { whileHover: hover, whileTap: tap, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } };
  return href ? (
    <motion.a href={href} target="_blank" rel="noopener noreferrer" style={{ ...style, textDecoration: "none" }} {...motionProps}>{children}</motion.a>
  ) : (
    <motion.button onClick={onClick} style={style} {...motionProps}>{children}</motion.button>
  );
};

const HeroContent = () => {
  const link = (label) => contactLinks.find((c) => c.label === label)?.href;
  return (
    <>
      <SectionLabel color="#ffb86b">SOL · The center</SectionLabel>
      <div style={{ display: "flex", gap: 24, alignItems: "center", margin: "0 0 16px 0" }}>
        <Portrait size={170} color="#ffb86b" />
        <div>
          <h1 style={{ fontFamily: "'Michroma', sans-serif", fontSize: "clamp(22px, 2.1vw, 33px)", fontWeight: 400, color: "white", margin: 0, letterSpacing: "0.03em", lineHeight: 1.2, textTransform: "uppercase", textWrap: "balance" }}>{personalInfo.fullName}</h1>
          <RoleRotator />
        </div>
      </div>
      <SectionLede>{heroContent.tagline}</SectionLede>
      <div style={{ display: "flex", gap: 36, marginTop: 16, flexWrap: "wrap" }}>
        {heroContent.stats.map((s) => (
          <div key={s.label} style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "white", fontWeight: 700, lineHeight: 1 }}>
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Availability + location — a live, professional status line. */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 18, flexWrap: "wrap", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.62)" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00cea8", boxShadow: "0 0 9px #00cea8", animation: "stellarStatusPulse 1.8s ease-in-out infinite", flexShrink: 0 }} />
        <span style={{ color: "#7fe9cf" }}>Available for opportunities</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{personalInfo.location}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{personalInfo.yearsExperience} yrs in production</span>
      </div>
      {/* Quick actions — clear next steps for a recruiter. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 18 }}>
        <HeroChip primary onClick={() => scrollToStop(3)}>Explore my work ↓</HeroChip>
        {link("GitHub") && <HeroChip href={link("GitHub")}>→ GitHub</HeroChip>}
        {link("LinkedIn") && <HeroChip href={link("LinkedIn")}>→ LinkedIn</HeroChip>}
        {link("Book a Call") && <HeroChip href={link("Book a Call")}>Book a call</HeroChip>}
      </div>
    </>
  );
};

const AboutContent = () => (
  <>
    <SectionLabel>MERCURY · Introduction</SectionLabel>
    <div style={{ display: "flex", gap: 20, alignItems: "center", margin: "0 0 14px 0" }}>
      <Portrait size={142} color="#7c9bd6" src={aboutPhoto} focus="center 18%" />
      <SectionTitle>{sectionMeta.about.heading}</SectionTitle>
    </div>
    <SectionLede>{personalInfo.about}</SectionLede>
    <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 2 }}>
      {[
        ["Languages", personalInfo.languages],
        ["Experience", `${personalInfo.yearsExperience} years`],
        ["Based in", personalInfo.location],
      ].map(([k, v]) => (
        <div key={k}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{k}</div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{v}</div>
        </div>
      ))}
    </div>
  </>
);

const FunFactsContent = () => (
  <>
    <SectionLabel color="#f8c555">VENUS · Impact in production</SectionLabel>
    <SectionTitle>{sectionMeta.funFacts.heading}</SectionTitle>
    <SectionLede>{sectionMeta.funFacts.description}</SectionLede>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginTop: 6 }}>
      {funFacts.map((f) => (
        <div key={f.label} style={bareCard}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 14 }}>{f.icon}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: "white", fontWeight: 700, lineHeight: 1 }}>{f.value}{f.suffix}</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {f.label}
          </div>
          {/* The "receipt" — the specific initiative behind the number */}
          {f.detail && (
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 6, lineHeight: 1.45 }}>
              {f.detail}
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);

/* Both roles, fully expanded — every discipline + every bullet visible
   (max-informative; the left column scrolls). */
const ExperienceContent = () => (
  <>
    <SectionLabel color="#61dafb">EARTH · Where I work</SectionLabel>
    <SectionTitle>{sectionMeta.experience.heading}</SectionTitle>
    {experiences.map((e, ei) => (
      <div
        key={e.companyName}
        style={{ marginBottom: 18, paddingTop: ei ? 16 : 4, borderTop: ei ? "1px solid rgba(255,255,255,0.1)" : "none" }}
      >
        <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 19, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{e.title}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "#61dafb", marginTop: 3 }}>{e.companyName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "7px 0 12px 0" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{e.date}</span>
          {e.achievement && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: "rgba(248,197,85,0.12)", border: "1px solid rgba(248,197,85,0.35)", borderRadius: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#f8c555" }}>
              ⭐ {e.achievement}
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 14, margin: "0 0 14px 0" }}>
          {e.metrics.map((m) => (
            <Stat key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
        {/* Disciplines flow into responsive columns (≈2 on a wide desktop
            panel, 1 on a narrow/compact sheet) so both roles fit on one
            screen without scrolling. */}
        <div style={{ columns: "212px", columnGap: 22 }}>
          {e.categories.map((c) => (
            <div key={c.name} style={{ marginBottom: 9, breakInside: "avoid", WebkitColumnBreakInside: "avoid" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#61dafb", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{c.name}</div>
              {c.points.map((p, pi) => (
                <p key={pi} style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.8)", margin: "0 0 5px 0", lineHeight: 1.45 }}>• {p}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    ))}
  </>
);

const ProjectsContent = () => (
  <>
    <SectionLabel color="#ff6b6b">MARS · Things I&apos;ve shipped</SectionLabel>
    <SectionTitle>{sectionMeta.projects.heading}</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(158px, 1fr))", gap: "10px 14px" }}>
      {projects.map((p) => (
        <div key={p.name} style={{ ...bareCard, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "white", fontWeight: 600 }}>{p.name}</span>
            {p.status && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: p.status === "production" ? "#00cea8" : "#f8c555", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>● {p.status}</span>
            )}
          </div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.42, marginBottom: 6 }}>
            {p.description}
          </div>
          {p.tags && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto" }}>
              {p.tags.map((tag) => (
                <span key={tag.name} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, padding: "1px 6px", borderRadius: 8, background: "rgba(145,94,255,0.12)", border: "1px solid rgba(145,94,255,0.25)", color: "#b8a0ff" }}>{tag.name}</span>
              ))}
            </div>
          )}
          {(p.github || p.link) && p.link !== "#" && (
            <a href={p.github || p.link} target="_blank" rel="noopener noreferrer" style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#61dafb", textDecoration: "none" }}>→ view repo</a>
          )}
        </div>
      ))}
    </div>
  </>
);

const AchievementsContent = () => (
  <>
    <SectionLabel color="#b9b0a2">CERES · Milestones</SectionLabel>
    <SectionTitle>{sectionMeta.achievements.heading}</SectionTitle>
    <SectionLede>{sectionMeta.achievements.description}</SectionLede>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
      {achievements.map((a) => (
        <div key={a.title} style={bareCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "white", fontWeight: 600 }}>{a.title}</div>
            {a.year && <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{a.year}</span>}
          </div>
          {a.description && (
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.68)", lineHeight: 1.5 }}>{a.description}</div>
          )}
        </div>
      ))}
    </div>
  </>
);

const SkillsContent = () => {
  const categories = Object.entries(skills);
  return (
    <>
      <SectionLabel>JUPITER · The galaxy of skills</SectionLabel>
      <SectionTitle>{sectionMeta.skills.heading}</SectionTitle>
      <SectionLede>{sectionMeta.skills.description}</SectionLede>
      {/* The skills as an actual constellation — star size/brightness = proficiency. */}
      <SkillsConstellation skills={skills} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "9px 14px" }}>
        {categories.map(([cat, items]) => (
          <div key={cat} style={{ padding: "1px 2px 6px", breakInside: "avoid" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#b8a0ff", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{cat}</div>
            {/* Every skill in the category, each with a proficiency bar. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {items.map((s) => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Exo 2', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.82)", marginBottom: 2 }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "78%" }}>{s.name}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>{s.level}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${s.level}%`, height: "100%", background: "linear-gradient(90deg, #915eff, #bf61ff)", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const NotesContent = () => (
  <>
    <SectionLabel color="#00cea8">SATURN · Writing &amp; ideas</SectionLabel>
    <SectionTitle>{sectionMeta.notes.heading}</SectionTitle>
    <SectionLede>{sectionMeta.notes.description}</SectionLede>
    <div>
      {blogPosts.map((n, i) => (
        <div key={n.title} style={{ display: "flex", gap: 14, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "white", fontWeight: 600, marginBottom: 3 }}>{n.title}</div>
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.68)", lineHeight: 1.5 }}>{n.description}</div>
          </div>
        </div>
      ))}
    </div>
  </>
);

const EducationContent = () => (
  <>
    <SectionLabel color="#bf61ff">URANUS · Academic journey</SectionLabel>
    <SectionTitle>{sectionMeta.education.heading}</SectionTitle>
    <SectionLede>{sectionMeta.education.description}</SectionLede>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(248px, 1fr))", gap: 16 }}>
      {educations.map((edu) => (
        <div key={edu.degree} style={bareCard}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "white", fontWeight: 700, lineHeight: 1.2 }}>{edu.degree}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: "#bf61ff", fontWeight: 700, whiteSpace: "nowrap" }}>{edu.percentage}%</span>
          </div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 4 }}>{edu.name}</div>
          <div style={{ display: "flex", gap: 9, marginTop: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            <span>{edu.level}</span><span style={{ opacity: 0.5 }}>·</span><span>{edu.year}</span>
          </div>
          {edu.highlights && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
              {edu.highlights.map((h) => (
                <span key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, padding: "2px 7px", borderRadius: 8, background: "rgba(191,97,255,0.12)", border: "1px solid rgba(191,97,255,0.25)", color: "#d3b3ff" }}>{h}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);

const HobbiesContent = () => (
  <>
    <SectionLabel color="#61dafb">NEPTUNE · Beyond the code</SectionLabel>
    <SectionTitle>{sectionMeta.hobbies.heading}</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
      {hobbies.map((h) => (
        <div key={h.name} style={bareCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{h.icon}</span>
              <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "white", fontWeight: 600 }}>{h.name}</span>
            </div>
            {h.stat && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#61dafb", whiteSpace: "nowrap" }}>{h.stat.value}</span>
            )}
          </div>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.74)", marginBottom: h.detail ? 5 : 0 }}>{h.tagline}</div>
          {/* The engineering-analogy detail — connects hobby → how he thinks */}
          {h.detail && (
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.45, fontStyle: "italic" }}>{h.detail}</div>
          )}
        </div>
      ))}
    </div>
  </>
);

const TestimonialsContent = () => (
  <>
    <SectionLabel color="#d2c2ac">PLUTO · Voices from afar</SectionLabel>
    <SectionTitle>{sectionMeta.testimonials.heading}</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
      {testimonials.map((t) => (
        <div key={t.name} style={bareCard}>
          <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.55, fontStyle: "italic" }}>
            “{t.quote}”
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 10 }}>
            — {t.name}{t.role ? ` · ${t.role}` : ""}
          </div>
        </div>
      ))}
    </div>
  </>
);

const ContactContent = () => (
  <>
    <SectionLabel color="#ff6b6b">EDGE BEACON · Reach out</SectionLabel>
    <SectionTitle>{sectionMeta.contact.heading}</SectionTitle>
    <SectionLede>{sectionMeta.contact.description}</SectionLede>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {contactLinks.slice(0, 5).map((c) => (
        <a
          key={c.label}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          {...(c.download ? { download: "" } : {})}
          style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "13px 17px",
          minHeight: 44,
          boxSizing: "border-box",
          background: "rgba(255, 107, 107, 0.08)",
          border: "1px solid rgba(255, 107, 107, 0.3)",
          borderRadius: 10,
          color: "white",
          textDecoration: "none",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12.5,
        }}>
          <span style={{ color: "#ff6b6b" }}>→</span>
          <span>{c.label}: {c.value}</span>
        </a>
      ))}
    </div>
  </>
);

const RENDERERS = {
  hero: HeroContent,
  about: AboutContent,
  funfacts: FunFactsContent,
  experience: ExperienceContent,
  projects: ProjectsContent,
  achievements: AchievementsContent,
  skills: SkillsContent,
  notes: NotesContent,
  education: EducationContent,
  hobbies: HobbiesContent,
  testimonials: TestimonialsContent,
  contact: ContactContent,
};

const PlanetFactsAccordion = ({ destination }) => {
  const [open, setOpen] = useState(false);
  const facts = PLANET_FACTS[destination?.id];
  if (!facts) return null;
  const rows = [
    ["Body", facts.body],
    ["Distance", facts.distance],
    ["Diameter", facts.diameter],
    ["Year", facts.year],
    ["Day", facts.day],
    ["Gravity", facts.gravity],
    ["Atmosphere", facts.atmosphere],
    ["Moons", facts.moons],
  ];
  return (
    <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: 44,
          padding: "4px 2px",
          boxSizing: "border-box",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11.5,
          color: destination.color,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <span>{open ? "▼" : "▶"}</span>
        <span>Planet facts · real data</span>
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "5px 16px", fontSize: 11.5 }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <span style={{ color: "rgba(255,255,255,0.42)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", fontSize: 9.5, letterSpacing: "0.08em" }}>{k}</span>
                <span style={{ color: "rgba(255,255,255,0.82)" }}>{v}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: `${destination.color}10`,
              border: `1px solid ${destination.color}30`,
              borderRadius: 8,
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            <span style={{ color: destination.color, fontWeight: 600, fontStyle: "normal" }}>★ </span>
            {facts.wow}
          </div>
        </div>
      )}
    </div>
  );
};

const ContentPanel = ({ destination }) => {
  const Renderer = useMemo(() => RENDERERS[destination?.section] || null, [destination]);
  const { isMobile, isCompact } = useViewport();
  /* Cross-fade key — re-mounts the inner content on destination change
     for a clean slide-up transition. */
  const fadeKey = destination?.id || "none";

  /* Desktop left-column scroll affordance: reset to the top on every
     destination change, and surface a bottom fade + "scroll" cue while
     there's more content below. Lenis (allowNestedScroll) chains back to
     camera-navigation once the column hits its bottom. */
  const scrollRef = useRef(null);
  const [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    el.scrollTop = 0;
    const update = () => {
      const overflow = el.scrollHeight - el.clientHeight;
      /* Only signal "more" for a real overflow (>26px) — a few px of slack on
         a section that essentially fits shouldn't nag with a scroll cue. */
      setHasMore(overflow > 26 && el.scrollTop < overflow - 6);
    };
    update();
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [fadeKey, isCompact]);

  if (!Renderer) return null;

  /* Compact (<1024px): the original centred bottom-sheet — the side-by-side
     split needs desktop width, so small screens keep the working layout.
     Planet facts ride along here (the bottom-right readout is a chip then). */
  if (isCompact) {
    return (
      <div
        className="stellar-content-panel"
        style={{
          position: "fixed",
          left: isMobile ? "12px" : "max(24px, calc((100vw - 1200px) / 2 + 24px))",
          right: isMobile ? "12px" : "max(24px, calc((100vw - 1200px) / 2 + 24px))",
          bottom: isMobile ? "12px" : "62px",
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "16px 18px" : "22px 28px",
          background: "rgba(8, 10, 26, 0.78)",
          backdropFilter: "blur(18px) saturate(1.2)",
          WebkitBackdropFilter: "blur(18px) saturate(1.2)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 14,
          color: "white",
          zIndex: 40,
          pointerEvents: "auto",
          maxHeight: isMobile ? "48vh" : "55vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
          WebkitOverflowScrolling: "touch",
          fontSize: isMobile ? "13.5px" : "14.5px",
        }}
      >
        <div key={fadeKey} style={{ animation: "stellarPanelIn 280ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <Renderer />
          <PlanetFactsAccordion destination={destination} />
        </div>
        <style>{`
          @keyframes stellarPanelIn {
            0% { opacity: 0; transform: translateY(6px); filter: blur(5px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .stellar-content-panel [style*="stellarPanelIn"] { animation: none !important; }
          }
        `}</style>
      </div>
    );
  }

  /* Desktop: my info as a LEFT column floating over a left-edge gradient
     scrim — no boxy panel, the planet stays clear on the right. Planet data
     lives in the bottom-right readout (PlanetHUD), not here. */
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "66%",
          pointerEvents: "none",
          zIndex: 38,
          /* Pure-horizontal (no tilt) and fully transparent well before the
             div edge, so there's no visible panel boundary — just a soft
             readability wash that dissolves into the scene. Darker + reaching
             a little further right now the info column is wider. */
          background:
            "linear-gradient(90deg, rgba(3,5,14,0.92) 0%, rgba(3,5,14,0.82) 34%, rgba(3,5,14,0.55) 53%, rgba(3,5,14,0.2) 72%, rgba(3,5,14,0) 100%)",
        }}
      />
      {/* Fixed frame — auto height (capped by the scroll area's max-height) so
          the bottom fade + scroll cue sit at the column's real bottom edge. */}
      <div
        style={{
          position: "fixed",
          left: "clamp(32px, 3vw, 60px)",
          top: "6vh",
          width: "clamp(480px, 44vw, 920px)",
          zIndex: 40,
          pointerEvents: "none",
        }}
      >
        <div
          ref={scrollRef}
          className="stellar-content-left"
          style={{
            maxHeight: "89vh",
            overflowY: "auto",
            overflowX: "hidden",
            paddingLeft: 4,
            paddingRight: 14,
            color: "white",
            pointerEvents: "auto",
            fontSize: "14.5px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div key={fadeKey} style={{ animation: "stellarContentIn 340ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <Renderer />
          </div>
        </div>
        {/* More-content affordance — only while the column can scroll further.
            Fixes "it's only showing half the information": the fade hints
            depth, the cue invites the scroll. */}
        {hasMore && (
          <>
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 96,
                pointerEvents: "none",
                /* Matches the scrim colour, and masked to dissolve toward the
                   right so there's no hard panel edge over the planet. */
                background:
                  "linear-gradient(to bottom, rgba(3,5,14,0) 0%, rgba(3,5,14,0.6) 60%, rgba(3,5,14,0.9) 100%)",
                maskImage: "linear-gradient(to right, #000 28%, transparent 88%)",
                WebkitMaskImage: "linear-gradient(to right, #000 28%, transparent 88%)",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 14,
                bottom: 6,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  animation: "stellarScrollCue 1.8s ease-in-out infinite",
                }}
              >
                scroll ↓
              </span>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes stellarContentIn {
          0% { opacity: 0; transform: translateY(10px); filter: blur(7px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes stellarScrollCue {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.85; transform: translateY(3px); }
        }
        /* Clean UI — hide the column scrollbar; the bottom fade + cue carry
           the "there's more" signal instead. */
        .stellar-content-left::-webkit-scrollbar { width: 0; height: 0; display: none; }
        .stellar-content-left { scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default ContentPanel;
