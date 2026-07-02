"use client";
/*
 * Testimonials (Pluto) — 3 editorial pull-quotes in a horizontal composition
 * with wide gutters. Middle quote gets `highlight` — subtly larger and brighter
 * as the held focus. Scan direction: horizontal wipe.
 */
import { testimonials } from "../../../content";
import { V3Frame, V3Callout, V3Quote } from "../primitives";

export default function TestimonialsSection({ index, bootNonce }) {
  const [a, b, c] = testimonials || [];
  return (
    <V3Frame section="Testimonials" planet="PLUTO" index={index} scanDir="horizontal" scanKey={bootNonce}>
      <div style={{ gridArea: "left / left / right-top / right-top", display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <V3Callout size="s4" emphasis="on record">Voices</V3Callout>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "stretch" }}>
          {[a, b, c].filter(Boolean).map((t, i) => (
            <V3Quote
              key={i}
              quote={t.quote}
              author={t.name}
              roleAt={[t.role, t.company].filter(Boolean).join(" · ")}
              tags={t.endorsements || []}
              highlight={i === 1}
              scanDelay={0.18 + i * 0.08}
            />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
