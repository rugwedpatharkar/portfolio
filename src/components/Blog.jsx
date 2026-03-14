/* eslint-disable react/prop-types */
import { memo } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { blogPosts } from "../constants";
import { textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const BlogCard = memo(({ post, index }) => (
  <motion.a
    href={post.link}
    target={post.link !== "#" ? "_blank" : undefined}
    rel={post.link !== "#" ? "noopener noreferrer" : undefined}
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
    whileHover={{ y: -5 }}
    className="block glass-card rounded-2xl p-5 sm:p-6 card-shine glow-hover group"
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[#915eff] text-caption sm:text-body-sm font-mono font-medium">{post.date}</span>
      <span className="w-1 h-1 rounded-full bg-secondary" />
      <span className="text-secondary text-caption">{post.tags[0]}</span>
    </div>
    <h3 className="text-white font-heading font-bold text-body sm:text-body-lg group-hover:text-[#915eff] transition-colors">
      {post.title}
    </h3>
    <p className="text-secondary text-caption sm:text-body-sm mt-2 leading-relaxed line-clamp-3">
      {post.description}
    </p>
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
  </motion.a>
));

const Blog = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Sharing Knowledge</p>
        <TextScramble text="Blog & Articles" as="h2" className={styles.sectionHeadText} />
      </motion.div>
      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-7">
        {blogPosts.map((post, index) => (
          <BlogCard key={index} post={post} index={index} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Blog, "");
