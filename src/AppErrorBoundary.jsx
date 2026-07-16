import React from "react";

/*
 * Top-level error boundary for the whole portfolio. Catches any crash below
 * (bad shader / WebGL context loss / bundle-eval error / whatever) and shows
 * a branded fallback with two real recovery paths — "Reload" and "Try classic
 * site" (→ #legacy) — instead of a blank/black screen on the recruiter's first
 * visit. Uses hardcoded v3 colours (no CSS-var deps) so it renders even if the
 * token skin never mounted.
 */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[AppErrorBoundary]", error, info?.componentStack);
    /* Report to analytics if wired (Vercel / Plausible / etc. no-op if absent). */
    if (typeof window !== "undefined" && window.va) {
      try { window.va("event", { name: "app_crash", data: { message: String(error?.message || error) } }); } catch (_) { /* swallow */ }
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const onReload = () => window.location.reload();
    const btn = { font: "500 .82rem 'Space Grotesk', system-ui, sans-serif", letterSpacing: ".01em", borderRadius: 7, padding: "12px 22px", cursor: "pointer", border: "1px solid #2a2d38", background: "transparent", color: "#f5f7fc", transition: "border-color .2s, background .2s" };
    const primary = { ...btn, background: "#e9c675", color: "#050609", border: "1px solid transparent" };
    return (
      <div role="alert" style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#050609", color: "#f5f7fc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ font: "400 .72rem 'Space Mono', monospace", letterSpacing: ".28em", textTransform: "uppercase", color: "#8a8fa3", marginBottom: 18 }}>
            <span style={{ display: "inline-block", width: 30, height: 1, background: "#e9c675", verticalAlign: "middle", marginRight: 10 }} />Signal lost
          </div>
          <h1 style={{ font: "400 clamp(2rem, 5vw, 3rem) 'Fraunces', Georgia, serif", fontOpticalSizing: "auto", lineHeight: 1.05, letterSpacing: "-.02em", color: "#f5f7fc", margin: "0 0 .3em" }}>
            Something went <em style={{ fontStyle: "italic", color: "#e9c675" }}>sideways</em>.
          </h1>
          <p style={{ font: "300 1rem 'Space Grotesk', system-ui, sans-serif", color: "#c4c8d6", lineHeight: 1.55, margin: "0 0 26px" }}>
            The 3D tour hit an error. Reload to try again — or grab my résumé.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={primary} onClick={onReload}>Reload</button>
            <a style={{ ...btn, textDecoration: "none", display: "inline-flex", alignItems: "center" }} href="/Rugwed-Patharkar-Resume.pdf">Résumé (PDF)</a>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
