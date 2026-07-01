/* eslint-disable jsx-a11y/anchor-has-content */
/*
 * HeroHologram — the recruiter landing on Sol: portrait, name, tagline, three
 * stats, a live "available" status line, and the key CTAs. Restores the hero the
 * generic dossier dropped, in the Holo-Bridge register. Amber, like the dossier.
 */
import HoloFrame from "./HoloFrame";
import { HOLO, FONT } from "./holoTokens";
import useViewport from "../useViewport";
import { personalInfo, heroContent, contactLinks } from "../../content";
import heroPhoto from "../../assets/hero-photo-1024.webp";

const CTA_LABELS = ["GitHub", "LinkedIn", "Book a Call", "Email", "Resume"];

export default function HeroHologram({ booting }) {
  const { reducedMotion, isMobile } = useViewport();
  const depth = isMobile || reducedMotion ? 0 : 5;
  const ctas = CTA_LABELS.map((l) => contactLinks.find((c) => c.label === l)).filter((c) => c && c.href);

  return (
    <HoloFrame tint="amber" booting={booting} depth={depth} style={{ padding: 16, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ font: `400 11px ${FONT.mono}`, color: HOLO.amber }}>// crew manifest · SOL</span>
        <span style={{ flex: 1, height: 1, background: HOLO.amberLine }} />
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center", margin: "12px 0 10px" }}>
        <img src={heroPhoto} alt={personalInfo.fullName} style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: `1px solid ${HOLO.amberLine}`, boxShadow: `0 0 18px ${HOLO.amberLine}` }} />
        <div>
          <div style={{ font: `600 clamp(19px,2vw,26px) ${FONT.display}`, color: "#f6efe2", letterSpacing: ".04em", lineHeight: 1.15, textTransform: "uppercase" }}>{personalInfo.fullName}</div>
          <div style={{ font: `400 13px ${FONT.body}`, color: HOLO.amber, marginTop: 3 }}>{heroContent.tagline}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 26, flexWrap: "wrap", margin: "10px 0" }}>
        {(heroContent.stats || []).map((s) => (
          <div key={s.label}>
            <div style={{ font: `700 22px ${FONT.mono}`, color: "#fff", lineHeight: 1 }}>{s.value}{s.suffix}</div>
            <div style={{ font: `400 9.5px ${FONT.mono}`, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", font: `400 11px ${FONT.mono}`, color: "rgba(255,255,255,.62)", margin: "4px 0 12px" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2fe0b0", boxShadow: "0 0 9px #2fe0b0", flexShrink: 0 }} />
        <span style={{ color: "#7fe9cf" }}>Available for opportunities</span>
        <span style={{ opacity: .4 }}>·</span><span>{personalInfo.location}</span>
        {personalInfo.yearsExperience && (<><span style={{ opacity: .4 }}>·</span><span>{personalInfo.yearsExperience} yrs in production</span></>)}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ctas.map((c) => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" download={c.download || undefined}
            style={{ font: `400 11px ${FONT.body}`, color: "#f0e2c9", border: `1px solid ${HOLO.amberLine}`, background: "rgba(255,180,84,.1)", borderRadius: 6, padding: "5px 11px", textDecoration: "none" }}>
            {c.label} →
          </a>
        ))}
      </div>
    </HoloFrame>
  );
}
