/*
 * Stellar Command — ship-audio toggle. Bottom-right diegetic control. Default OFF
 * (matches SoundManager): first tap resumes the AudioContext and un-mutes, so the
 * bridge hum and comm cues come alive only on explicit opt-in.
 */
import { useState, useCallback } from "react";
import { SoundManager } from "./SoundManager";
import { SC, rgba } from "../ui/tokens";

export default function SoundToggle() {
  const [muted, setMuted] = useState(true);

  const toggle = useCallback(() => {
    const next = !muted;
    SoundManager.resumeOnGesture();
    SoundManager.setMuted(next);
    setMuted(next);
  }, [muted]);

  if (!SoundManager.available) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Enable ship audio" : "Mute ship audio"}
      aria-pressed={!muted}
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 70,
        width: 38,
        height: 38,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        background: rgba(SC.bg, 0.6),
        color: muted ? SC.muted : SC.blue,
        border: `1px solid ${muted ? rgba(SC.blueDim, 0.5) : rgba(SC.blue, 0.6)}`,
        borderRadius: 8,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 15,
        lineHeight: 1,
        letterSpacing: 1,
        boxShadow: muted ? "none" : SC.line && `0 0 14px ${rgba(SC.blue, 0.35)}`,
        transition: "color .2s, border-color .2s, box-shadow .2s",
      }}
    >
      {muted ? "◌" : "◉"}
    </button>
  );
}
