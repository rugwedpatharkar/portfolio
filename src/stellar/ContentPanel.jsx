/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import useViewport from "./useViewport";
import { PLANET_FACTS } from "./data/planetFacts";
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

const TYPED = ({ text, speed = 18 }) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i++;
      setShown(text.slice(0, i));
      if (i < text.length) setTimeout(tick, speed);
    };
    setTimeout(tick, speed);
    return () => { cancelled = true; };
  }, [text, speed]);
  return <span>{shown}</span>;
};

const Stat = ({ label, value }) => (
  <div style={{ textAlign: "left" }}>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "white", fontWeight: 700, lineHeight: 1 }}>{value}</div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
  </div>
);

const PILL = ({ children, color = "#915eff" }) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 9px",
    borderRadius: 12,
    background: `${color}1f`,
    border: `1px solid ${color}40`,
    color,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    margin: "0 4px 4px 0",
  }}>{children}</span>
);

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

const SectionTitle = ({ children }) => (
  <h2 style={{
    fontFamily: "'Sora', sans-serif",
    fontSize: 36,
    fontWeight: 800,
    color: "white",
    margin: "0 0 14px 0",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  }}>{children}</h2>
);

const SectionLede = ({ children }) => (
  <p style={{
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14.5,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.75)",
    margin: "0 0 18px 0",
    maxWidth: "62ch",
  }}>{children}</p>
);

/* ── Per-destination renderers ─────────────────────────────────────── */

const HeroContent = () => (
  <>
    <SectionLabel color="#ffb86b">SOL · The center</SectionLabel>
    <SectionTitle>{personalInfo.fullName}</SectionTitle>
    <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, color: "#00cea8", margin: "0 0 14px 0", fontWeight: 600 }}>
      Backend &amp; Agentic AI Engineer
    </p>
    <SectionLede>{heroContent.tagline}</SectionLede>
    <div style={{ display: "flex", gap: 36, marginTop: 18 }}>
      {heroContent.stats.map((s) => (
        <Stat key={s.label} label={s.label} value={`${s.value}${s.suffix}`} />
      ))}
    </div>
  </>
);

const AboutContent = () => (
  <>
    <SectionLabel>MERCURY · Introduction</SectionLabel>
    <SectionTitle>{sectionMeta.about.heading}</SectionTitle>
    <SectionLede>{personalInfo.about}</SectionLede>
  </>
);

const FunFactsContent = () => (
  <>
    <SectionLabel color="#f8c555">VENUS · Impact in production</SectionLabel>
    <SectionTitle>{sectionMeta.funFacts.heading}</SectionTitle>
    <SectionLede>{sectionMeta.funFacts.description}</SectionLede>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginTop: 6 }}>
      {funFacts.map((f) => (
        <div key={f.label} style={{ padding: "10px 12px", background: "rgba(248,197,85,0.04)", border: "1px solid rgba(248,197,85,0.14)", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 14 }}>{f.icon}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, color: "white", fontWeight: 700, lineHeight: 1 }}>{f.value}{f.suffix}</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {f.label}
          </div>
          {/* The "receipt" — the specific initiative behind the number */}
          {f.detail && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 6, lineHeight: 1.45 }}>
              {f.detail}
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);

const ExperienceContent = () => {
  const e = experiences[0];
  const prev = experiences[1];
  const [openCat, setOpenCat] = useState(0);
  return (
    <>
      <SectionLabel color="#61dafb">EARTH · Where I work</SectionLabel>
      <SectionTitle>{e.title} · {e.companyName}</SectionTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "0 0 12px 0" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{e.date}</span>
        {e.achievement && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: "rgba(248,197,85,0.12)", border: "1px solid rgba(248,197,85,0.35)", borderRadius: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#f8c555" }}>
            ⭐ {e.achievement}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14, margin: "0 0 16px 0" }}>
        {e.metrics.map((m) => (
          <Stat key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
      {/* All 5 engineering disciplines — click a tab to expand its work */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {e.categories.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setOpenCat(i)}
            style={{
              all: "unset", cursor: "pointer",
              padding: "4px 10px", borderRadius: 12,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: "0.04em",
              background: i === openCat ? "rgba(97,218,251,0.16)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${i === openCat ? "rgba(97,218,251,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: i === openCat ? "#61dafb" : "rgba(255,255,255,0.55)",
              transition: "all 180ms ease",
            }}
          >{c.name}</button>
        ))}
      </div>
      <div style={{ minHeight: 76 }}>
        {e.categories[openCat].points.map((p, i) => (
          <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.74)", margin: "0 0 7px 0", lineHeight: 1.5 }}>
            • {p}
          </p>
        ))}
      </div>
      {prev && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          <span style={{ color: "rgba(255,255,255,0.75)" }}>{prev.title}</span> · {prev.companyName} · {prev.date}
        </div>
      )}
    </>
  );
};

const ProjectsContent = () => (
  <>
    <SectionLabel color="#ff6b6b">MARS · Things I&apos;ve shipped</SectionLabel>
    <SectionTitle>{sectionMeta.projects.heading}</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
      {projects.slice(0, 6).map((p) => (
        <div key={p.name} style={{
          padding: "12px 14px",
          background: "rgba(145, 94, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, color: "white", fontWeight: 600 }}>{p.name}</span>
            {p.status && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: p.status === "production" ? "#00cea8" : "#f8c555", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>● {p.status}</span>
            )}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.4, marginBottom: 8 }}>
            {p.description?.slice(0, 100)}{p.description?.length > 100 ? "…" : ""}
          </div>
          {p.tags && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto" }}>
              {p.tags.slice(0, 4).map((tag) => (
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
    <SectionLabel color="#f8c555">ASTEROID BELT · Milestones</SectionLabel>
    <SectionTitle>{sectionMeta.achievements.heading}</SectionTitle>
    <SectionLede>{sectionMeta.achievements.description}</SectionLede>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
      {achievements.map((a) => (
        <div key={a.title} style={{
          padding: "12px 14px",
          background: "rgba(248, 197, 85, 0.06)",
          border: "1px solid rgba(248, 197, 85, 0.18)",
          borderRadius: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, color: "white", fontWeight: 600 }}>{a.title}</div>
            {a.year && <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{a.year}</span>}
          </div>
          {a.description && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{a.description}</div>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {categories.slice(0, 9).map(([cat, items]) => (
          <div key={cat} style={{
            padding: "10px 12px",
            background: "rgba(145, 94, 255, 0.05)",
            border: "1px solid rgba(145, 94, 255, 0.18)",
            borderRadius: 8,
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#b8a0ff", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>{cat}</div>
            {/* Top 4 skills with proficiency bars — the depth a backend
                engineer's skill set should actually show. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {items.slice(0, 4).map((s) => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.78)", marginBottom: 2 }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "78%" }}>{s.name}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>{s.level}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${s.level}%`, height: "100%", background: "linear-gradient(90deg, #915eff, #bf61ff)", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
              {items.length > 4 && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>+{items.length - 4} more</div>
              )}
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
      {blogPosts.slice(0, 4).map((n, i) => (
        <div key={n.title} style={{ display: "flex", gap: 14, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, color: "white", fontWeight: 600, marginBottom: 3 }}>{n.title}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{n.description}</div>
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
      {educations.map((edu) => (
        <div key={edu.degree} style={{
          padding: "10px 12px",
          background: "rgba(191, 97, 255, 0.06)",
          border: "1px solid rgba(191, 97, 255, 0.18)",
          borderRadius: 8,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "#bf61ff", fontWeight: 700 }}>{edu.percentage}%</div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, color: "white", fontWeight: 600, marginTop: 4 }}>{edu.shortName}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{edu.year}</div>
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
      {hobbies.slice(0, 6).map((h) => (
        <div key={h.name} style={{
          padding: "12px 14px",
          background: "rgba(26, 115, 216, 0.07)",
          border: "1px solid rgba(26, 115, 216, 0.22)",
          borderRadius: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{h.icon}</span>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, color: "white", fontWeight: 600 }}>{h.name}</span>
            </div>
            {h.stat && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "#61dafb", whiteSpace: "nowrap" }}>{h.stat.value}</span>
            )}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.68)", marginBottom: h.detail ? 5 : 0 }}>{h.tagline}</div>
          {/* The engineering-analogy detail — connects hobby → how he thinks */}
          {h.detail && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.45, fontStyle: "italic" }}>{h.detail}</div>
          )}
        </div>
      ))}
    </div>
  </>
);

const TestimonialsContent = () => (
  <>
    <SectionLabel color="rgba(180,180,255,0.8)">KUIPER BELT · Voices from afar</SectionLabel>
    <SectionTitle>{sectionMeta.testimonials.heading}</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
      {testimonials.slice(0, 2).map((t) => (
        <div key={t.name} style={{
          padding: "14px 16px",
          background: "rgba(180, 180, 255, 0.05)",
          border: "1px solid rgba(180, 180, 255, 0.15)",
          borderRadius: 10,
        }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.55, fontStyle: "italic" }}>
            “{(t.quote || "").slice(0, 180)}{(t.quote || "").length > 180 ? "…" : ""}”
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
      {contactLinks.slice(0, 4).map((c) => (
        <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "rgba(255, 107, 107, 0.08)",
          border: "1px solid rgba(255, 107, 107, 0.3)",
          borderRadius: 10,
          color: "white",
          textDecoration: "none",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11.5,
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
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10.5,
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
  if (!Renderer) return null;

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
        fontSize: isCompact ? "13.5px" : "14.5px",
      }}
    >
      <div key={fadeKey} style={{ animation: "stellarPanelIn 280ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <Renderer />
        <PlanetFactsAccordion destination={destination} />
      </div>
      <style>{`
        @keyframes stellarPanelIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ContentPanel;
