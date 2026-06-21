import { motion } from "motion/react";
import tokens from "../../config/tokens.json";

/*
 * /design — internal design system page. Activates when the URL hash equals
 * '#design'. Lazy-loaded from App.jsx, so it adds zero bytes to the normal
 * portfolio load. Renders directly from tokens.json so the page and the
 * code share a single source of truth.
 */

const Swatch = ({ name, value }) => (
  <li className="flex items-center gap-3 py-2 border-b border-white/[0.04]">
    <span
      className="w-9 h-9 rounded-lg border border-white/[0.08] shrink-0"
      style={{ background: value }}
      aria-hidden="true"
    />
    <div className="flex-1 min-w-0">
      <p className="text-white text-body-sm font-medium truncate">{name}</p>
      <p className="text-white/40 text-caption font-mono tabular-nums truncate">{value}</p>
    </div>
  </li>
);

const TypeSample = ({ name, size }) => (
  <li className="py-3 border-b border-white/[0.04]">
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-white truncate" style={{ fontSize: size, fontFamily: tokens.type.family.heading, fontWeight: 700 }}>
        {name}
      </span>
      <span className="text-white/40 text-caption font-mono shrink-0">{size}</span>
    </div>
  </li>
);

const Spacer = ({ name, size }) => (
  <li className="flex items-center gap-3 py-2 border-b border-white/[0.04]">
    <div
      className="h-2 rounded-full bg-[#915eff]/40 border border-[#915eff]/40 shrink-0"
      style={{ width: `min(${size}, 280px)` }}
      aria-hidden="true"
    />
    <div className="flex-1 min-w-0">
      <p className="text-white text-body-sm font-medium truncate">{name}</p>
      <p className="text-white/40 text-caption font-mono tabular-nums truncate">{size}</p>
    </div>
  </li>
);

const Panel = ({ title, hint, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className="glass-card rounded-2xl border border-white/[0.06] p-6 sm:p-8"
  >
    <header className="mb-4">
      <h2 className="text-white font-heading font-bold text-heading-sm">{title}</h2>
      {hint && <p className="text-white/40 text-caption font-mono mt-1">{hint}</p>}
    </header>
    {children}
  </motion.section>
);

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) => {
    if (k.startsWith("$")) return [];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) return flatten(v, key);
    return [[key, String(v)]];
  });

const Design = () => {
  const colorEntries = flatten(tokens.color).filter(([, v]) => v.startsWith("#"));
  const typeEntries = Object.entries(tokens.type.scale);
  const spaceEntries = Object.entries(tokens.space.fluid);
  const screenEntries = Object.entries(tokens.screen);
  const motionTokens = tokens.motion;

  return (
    <main className="min-h-screen px-4 sm:px-8 lg:px-16 pt-24 pb-16 max-w-7xl mx-auto">
      <header className="mb-12">
        <p className="text-[#b8a0ff] font-mono text-caption sm:text-body-sm uppercase tracking-wide mb-3">
          → Design System
        </p>
        <h1 className="text-white font-heading font-black text-display-sm sm:text-display text-balance">
          Tokens, types, motion.
        </h1>
        <p className="mt-4 max-w-[60ch] text-secondary text-body-lg leading-relaxed">
          The single source of truth for color, typography, spacing, breakpoints,
          and motion across this portfolio. Generated from
          <code className="mx-1.5 font-mono text-caption text-[#a78bfa] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
            src/config/tokens.json
          </code>
          — change the token, both this page and the live app shift in lockstep.
        </p>
        <a
          href="#about"
          className="inline-flex items-center gap-2 mt-6 text-[#915eff] hover:text-white text-body-sm font-mono transition-colors"
        >
          ← Back to portfolio
        </a>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Panel title="Color" hint={`${colorEntries.length} swatches`}>
          <ul>
            {colorEntries.map(([name, value]) => (
              <Swatch key={name} name={name} value={value} />
            ))}
          </ul>
        </Panel>

        <Panel title="Typography" hint={`${tokens.type.family.heading} / ${tokens.type.family.sans} / ${tokens.type.family.mono}`}>
          <ul>
            {typeEntries.map(([name, size]) => (
              <TypeSample key={name} name={name} size={size} />
            ))}
          </ul>
        </Panel>

        <Panel title="Spacing — fluid" hint="clamp(min, fluid, max)">
          <ul>
            {spaceEntries.map(([name, size]) => (
              <Spacer key={name} name={`space.fluid.${name}`} size={size} />
            ))}
          </ul>
        </Panel>

        <Panel title="Breakpoints" hint="One value, every device class">
          <ul>
            {screenEntries.map(([name, size]) => (
              <li key={name} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="font-mono text-body-sm text-white">{name}:</span>
                <span className="font-mono text-body-sm text-white/60 tabular-nums">{size}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Motion" hint="Animation timing + easing tokens">
          <ul className="grid grid-cols-2 gap-x-6">
            {Object.entries(motionTokens.duration).map(([name, value]) => (
              <li key={name} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="font-mono text-body-sm text-white">duration.{name}</span>
                <span className="font-mono text-caption text-white/60 tabular-nums">{value}</span>
              </li>
            ))}
            {Object.entries(motionTokens.easing).map(([name, value]) => (
              <li key={name} className="col-span-2 flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="font-mono text-body-sm text-white shrink-0">easing.{name}</span>
                <span className="font-mono text-caption text-white/60 truncate ml-3">{value}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Z-index" hint="Semantic scale, never arbitrary">
          <ul>
            {Object.entries(tokens.z)
              .filter(([k]) => !k.startsWith("$"))
              .map(([name, value]) => (
                <li key={name} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="font-mono text-body-sm text-white">{name}</span>
                  <span className="font-mono text-body-sm text-white/60 tabular-nums">{value}</span>
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <footer className="mt-16 text-center font-mono text-caption text-white/30">
        Built from <code className="text-[#a78bfa]">tokens.json</code>. Change once, update everywhere.
      </footer>
    </main>
  );
};

export default Design;
