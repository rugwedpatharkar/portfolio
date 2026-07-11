import { Component } from "react";

/*
 * Error boundary for a texture-loading subtree INSIDE the Canvas.
 *
 * Planets / skybox / nebulae load via useLoader(THREE.TextureLoader, …), which
 * THROWS on a 404 or decode failure. With only the scene's single
 * <Suspense fallback={null}> above them and no error boundary between, one bad
 * texture unmounts the ENTIRE scene subtree — the canvas goes to the bare
 * clear-colour (the "it's just black" failure). This boundary localizes the
 * failure: the one object that failed renders `fallback` (a solid-colour
 * stand-in, or nothing) while every other body, the belts and the starfield
 * keep rendering.
 *
 * Reset is by remount — components gated on `finale`/`extrasPhase` get a fresh
 * boundary when they re-mount, and a genuine 404 won't resolve on retry anyway,
 * so a latched failure on an always-mounted object is the correct end state.
 */
export default class SafeLoad extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err) {
    // Log once (fires per error, not per frame) so a degraded body is diagnosable.
    console.warn("[SafeLoad] a scene object failed to load — rendering fallback.", err?.message || err);
  }

  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}
