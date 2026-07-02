"use client";
/*
 * V3DepthLayer — semantic depth wrapper. depth ∈ {0 bg, 1 mid, 2 fg}.
 *
 * IMPORTANT: does NOT translate content on pointer-move. Content stays still.
 * Cursor parallax lives on the 3D PLANET (CameraRig applies a per-planet camera
 * offset from parallaxOffsetRef), not on the DOM overlay — moving the mouse
 * sways the sphere, not the reading column.
 *
 * The component is kept in the API surface so sections can express intent
 * ("this is foreground content") and so future depth cues (opacity/blur/
 * subtle scale) can be added centrally without touching every section.
 */
export default function V3DepthLayer({ depth = 1, children, style, as = "div" }) {
  const Tag = as;
  const opacity = depth === 0 ? 0.9 : 1;
  return <Tag style={{ opacity, ...style }}>{children}</Tag>;
}
