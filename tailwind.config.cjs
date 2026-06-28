/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    // Override default screens to cover the full 2026 device range:
    // 390px (small phone) → 3440px (ultrawide). Each step ≥ ~280px so
    // breakpoint cascades stay readable rather than stacking too tight.
    screens: {
      xs: "390px",
      sm: "640px",
      md: "768px",
      ml: "896px",       // small tablet / foldable open
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",   // 1080p / FHD
      "4xl": "2560px",   // QHD / 4K-class
      "5xl": "3440px",   // ultrawide
    },
    extend: {
      fontFamily: {
        sans: ["Saira", "sans-serif"],
        heading: ["Chakra Petch", "sans-serif"],
        mono: ["Martian Mono", "monospace"],
      },
      fontSize: {
        // Fluid type scale — clamp(min, fluid, max). Single value carries every
        // viewport from 380px to ultrawide; no discrete breakpoint steps.
        "display-xl": ["clamp(2.25rem, 1rem + 5.5vw, 4.75rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }], // hero name
        "display":    ["clamp(2rem, 0.75rem + 4.5vw, 3.75rem)",  { lineHeight: "1.1",  letterSpacing: "-0.02em" }], // section head
        "display-sm": ["clamp(1.75rem, 0.5rem + 4vw, 3rem)",      { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "heading-xl": ["clamp(1.5rem, 0.5rem + 3vw, 2.5rem)",     { lineHeight: "1.2",  letterSpacing: "-0.01em" }],
        "heading":    ["clamp(1.25rem, 0.5rem + 2vw, 1.875rem)",  { lineHeight: "1.25" }],
        "heading-sm": ["clamp(1.125rem, 0.5rem + 1.5vw, 1.5rem)", { lineHeight: "1.3" }],
        "subheading": ["clamp(1.0625rem, 0.5rem + 1vw, 1.25rem)", { lineHeight: "1.4" }],
        "body-lg":    ["clamp(1rem, 0.5rem + 0.5vw, 1.125rem)",   { lineHeight: "1.6" }],
        "body":       ["1rem",    { lineHeight: "1.6" }],
        "body-sm":    ["0.875rem",{ lineHeight: "1.5" }],
        "caption":    ["0.75rem", { lineHeight: "1.5" }],
        "micro":      ["0.6875rem",{ lineHeight: "1.4" }],
      },
      colors: {
        primary: "#050816",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
      },
      maxWidth: {
        // Container caps grow with display class so ultrawide users aren't
        // staring at a postage stamp framed in black.
        "screen-3xl": "1920px",
        "screen-4xl": "2400px",
        "screen-5xl": "3000px",
      },
      spacing: {
        // Fluid spacers usable as `mt-fluid-lg`, etc.
        "fluid-sm": "clamp(1rem, 2vw, 1.5rem)",
        "fluid-md": "clamp(2rem, 4vw, 3rem)",
        "fluid-lg": "clamp(3rem, 6vw, 5rem)",
        "fluid-xl": "clamp(4rem, 8vw, 6rem)",
        "fluid-2xl": "clamp(5rem, 10vw, 8rem)",
      },
      backgroundImage: {
        // The hero background uses CSS image-set in index.css to pick AVIF/WebP.
        // This class just turns on size+repeat. Browsers without image-set
        // support fall back to the body bg color (--bg-color in :root).
        "hero-pattern": "none",
      },
    },
  },
  plugins: [],
};
