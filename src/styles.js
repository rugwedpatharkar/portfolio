/*
 * Typography & spacing tokens.
 *
 * Text sizes (text-display-xl, text-heading, etc.) are themselves clamp()-based
 * in tailwind.config.js, so a single token like `text-display-xl` scales
 * fluidly from 380px to ultrawide without needing xs:/sm:/md:/lg: cascades.
 *
 * Padding tokens still use breakpoints because horizontal gutters look better
 * with discrete steps than with a continuous clamp.
 */
const styles = {
  paddingX: "px-4 xs:px-6 sm:px-10 md:px-16 4xl:px-24 5xl:px-32",
  paddingY: "py-fluid-md md:py-fluid-lg",
  padding: "px-4 xs:px-6 sm:px-10 md:px-16 4xl:px-24 5xl:px-32 py-fluid-md md:py-fluid-lg",

  heroHeadText:
    "font-heading font-bold text-white text-display-xl mt-2",
  heroSubText:
    "font-heading text-[#dfd9ff] font-medium text-subheading md:text-heading-sm lg:text-heading lg:leading-[40px]",

  sectionHeadText:
    "font-heading text-white font-black text-display drop-shadow-[0_0_25px_rgba(145,94,255,0.3)] text-balance",
  // Eyebrow: glyph-led prefix + reduced tracking — a deliberate brand mark, not the
  // saturated "ABOUT" "PROCESS" "PRICING" eyebrow stamped on every AI landing.
  sectionSubText:
    "font-mono text-caption xs:text-body-sm text-[#b8a0ff] tracking-wide font-semibold drop-shadow-[0_0_10px_rgba(145,94,255,0.4)] inline-flex items-center gap-2 before:content-['→'] before:text-[#915eff]/70 before:font-bold",
  heroHeadTextCustom:
    "font-heading font-bold text-[#915eff] text-display-xl mt-2",
};

export { styles };
