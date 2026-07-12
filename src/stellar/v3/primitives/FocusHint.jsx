/*
 * §3.7 — dossier-frame focus discovery caption.
 *
 * A subtle "Press ↑ ↓ to navigate" cue appears when a `[role="tab"]` inside
 * this frame first receives focus, and self-dismisses on the first arrow-key
 * press. Once dismissed, sessionStorage remembers the dismissal so the hint
 * doesn't re-appear on the next section's mount within the same session.
 *
 * Kept as pure DOM listeners (not React state) so a focus/blur churn doesn't
 * re-render the whole frame — the caption's opacity is CSS-driven off a data
 * attribute on the wrapper.
 */
import { useEffect, useRef } from "react";
import useViewport from "../../useViewport";

const DISMISS_KEY = "stellar.focusHintDismissed";

export default function FocusHint({ axis = "y" }) {
  const ref = useRef(null);
  const { isCompact } = useViewport();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    if (isCompact) return; // keyboard hint is desktop-only

    const el = ref.current;
    if (!el) return;

    const setVisible = (v) => {
      el.dataset.visible = v ? "1" : "0";
    };

    const onFocusIn = (e) => {
      if (e.target?.getAttribute?.("role") === "tab") setVisible(true);
    };
    const onFocusOut = () => {
      /* Delay hide so tabbing between siblings doesn't flash the hint out. */
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!active || active.getAttribute?.("role") !== "tab") setVisible(false);
      });
    };
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      const arrow = axis === "y"
        ? k === "arrowup" || k === "arrowdown" || k === "j" || k === "k"
        : k === "arrowleft" || k === "arrowright" || k === "h" || k === "l";
      if (arrow) {
        sessionStorage.setItem(DISMISS_KEY, "1");
        setVisible(false);
        window.removeEventListener("keydown", onKeyDown, true);
      }
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [axis, isCompact]);

  const arrows = axis === "y" ? "↑ ↓" : "← →";

  return (
    <div
      ref={ref}
      data-visible="0"
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: "clamp(16px, 2vh, 28px)",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "var(--v3-font-mono)",
        fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
        letterSpacing: ".24em",
        textTransform: "uppercase",
        color: "var(--v3-fg-mute)",
        opacity: 0,
        transition: "opacity .28s ease",
        pointerEvents: "none",
        zIndex: 60,
        userSelect: "none",
      }}
    >
      <style>{`[data-visible="1"] { opacity: 1 !important; }`}</style>
      Press {arrows} to navigate
    </div>
  );
}
