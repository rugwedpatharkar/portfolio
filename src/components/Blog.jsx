/* eslint-disable react/prop-types */
import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { blogPosts } from "../content";
import { fadeIn, textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

/* Estimate reading time: ~200 wpm */
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/* Clap button — localStorage-persisted count per post */
const ClapButton = memo(({ postKey }) => {
  const storageKey = `blog-claps-${postKey}`;
  const [claps, setClaps] = useState(() => {
    try { return parseInt(localStorage.getItem(storageKey) || "0", 10); }
    catch { return 0; }
  });
  const [burst, setBurst] = useState(false);

  const handleClap = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = claps + 1;
    setClaps(next);
    setBurst(true);
    setTimeout(() => setBurst(false), 600);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* noop */ }
  }, [claps, storageKey]);

  return (
    <button
      onClick={handleClap}
      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#915eff]/30 hover:bg-[#915eff]/[0.06] transition-all duration-200 group/clap"
      aria-label="Clap for this post"
      title="Clap for this post"
    >
      <motion.span
        animate={burst ? { scale: [1, 1.5, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="text-sm select-none"
      >
        👏
      </motion.span>
      <AnimatePresence mode="wait">
        {claps > 0 && (
          <motion.span
            key={claps}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="text-[11px] font-mono text-white/50 group-hover/clap:text-[#915eff] transition-colors"
          >
            {claps}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
});
ClapButton.displayName = "ClapButton";

const BlogCard = memo(({ post, index }) => {
  const isPlaceholder = post.link === "#";
  const Tag = isPlaceholder ? motion.div : motion.a;
  const linkProps = isPlaceholder
    ? {}
    : { href: post.link, target: "_blank", rel: "noopener noreferrer" };
  const mins = readingTime(post.description);

  return (
    <Tag
      {...linkProps}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
      whileHover={{ y: -5 }}
      className={`block glass-card rounded-2xl p-5 sm:p-6 card-shine glow-hover border-glow group ${isPlaceholder ? "cursor-default" : ""}`}
    >
      {/* Header row: date · tag · read time */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[#915eff] text-caption sm:text-body-sm font-mono font-medium">
          {post.date}
        </span>
        <span className="w-1 h-1 rounded-full bg-secondary" />
        <span className="text-secondary text-caption">{post.tags[0]}</span>
        <span className="w-1 h-1 rounded-full bg-secondary" />
        <span className="text-white/30 text-[11px] font-mono flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="9" strokeLinecap="round" />
          </svg>
          {mins} min read
        </span>
      </div>

      <h3 className="text-white font-heading font-bold text-body sm:text-body-lg group-hover:text-[#915eff] transition-colors">
        {post.title}
      </h3>
      <p className="text-secondary text-caption sm:text-body-sm mt-2 leading-relaxed line-clamp-3">
        {post.description}
      </p>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag, i) => (
          <span
            key={i}
            className="text-micro sm:text-caption font-mono px-2 py-1 rounded-full bg-[#915eff]/10 text-[#915eff] border border-[#915eff]/20 tag-hover"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer row: clap + coming-soon */}
      <div className="mt-4 flex items-center justify-between">
        <ClapButton postKey={post.title} />
        {isPlaceholder && (
          <span className="text-micro font-mono text-white/35">Coming soon</span>
        )}
      </div>
    </Tag>
  );
});
BlogCard.displayName = "BlogCard";

const Blog = () => (
  <div className="relative">
    {/* Ambient glow blobs */}
    <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#915eff]/5 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#00cea8]/5 rounded-full blur-[80px] pointer-events-none" />

    <motion.div variants={textVariant()}>
      <p className={styles.sectionSubText}>Sharing Knowledge</p>
      <TextScramble text="Blog & Articles" as="h2" className={styles.sectionHeadText} />
    </motion.div>

    <motion.p
      variants={fadeIn("", "", 0.1, 1)}
      className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
    >
      Writing about backend architecture, AI/ML engineering, and lessons
      learned from building real-world systems.
    </motion.p>

    <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-7">
      {blogPosts.map((post, index) => (
        <BlogCard key={post.title} post={post} index={index} />
      ))}
    </div>
  </div>
);

export default SectionWrapper(Blog, "blog", "Blog");
