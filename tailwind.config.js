/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        heading: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Type scale (Major Third — 1.25 ratio)
        "display-xl": ["4.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],  // 76px — hero name
        "display":    ["3.75rem", { lineHeight: "1.1",  letterSpacing: "-0.02em" }],   // 60px — section heads
        "display-sm": ["3rem",    { lineHeight: "1.15", letterSpacing: "-0.015em" }],  // 48px — section heads sm
        "heading-xl": ["2.5rem",  { lineHeight: "1.2",  letterSpacing: "-0.01em" }],   // 40px — sub-headings
        "heading":    ["1.875rem",{ lineHeight: "1.25" }],                              // 30px — card titles
        "heading-sm": ["1.5rem",  { lineHeight: "1.3" }],                               // 24px — card titles sm
        "subheading": ["1.25rem", { lineHeight: "1.4" }],                               // 20px — large body
        "body-lg":    ["1.125rem",{ lineHeight: "1.6" }],                               // 18px — body large
        "body":       ["1rem",    { lineHeight: "1.6" }],                                // 16px — body default
        "body-sm":    ["0.875rem",{ lineHeight: "1.5" }],                               // 14px — secondary text
        "caption":    ["0.75rem", { lineHeight: "1.5" }],                                // 12px — captions, tags
        "micro":      ["0.6875rem",{ lineHeight: "1.4" }],                               // 11px — tooltips
      },
      colors: {
        primary: "#050816",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
      },
      screens: {
        xs: "450px",
        "3xl": "1920px",
      },
      backgroundImage: {
        "hero-pattern": "url('/herobg.png')",
      },
    },
  },
  plugins: [],
};
