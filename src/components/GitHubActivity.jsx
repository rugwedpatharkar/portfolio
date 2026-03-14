import { motion } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { personalInfo } from "../constants";
import { textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";
import LanguageChart from "./LanguageChart";
import ImageSkeleton from "./ImageSkeleton";

const GitHubActivity = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Open Source</p>
        <TextScramble text="GitHub Activity" as="h2" className={styles.sectionHeadText} />
      </motion.div>
      <div className="mt-8 sm:mt-12 flex flex-col items-center gap-6 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl overflow-hidden rounded-2xl glass-card p-4 sm:p-6 card-shine glow-hover"
        >
          <ImageSkeleton
            src={`https://ghchart.rshah.org/915eff/${personalInfo.githubUsername}`}
            alt="GitHub Contribution Chart"
            loading="lazy"
            className="w-full rounded-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-4xl overflow-hidden rounded-2xl glass-card p-4 sm:p-6 card-shine glow-hover"
        >
          <ImageSkeleton
            src={`https://github-readme-stats.vercel.app/api?username=${personalInfo.githubUsername}&show_icons=true&theme=tokyonight&hide_border=true&bg_color=1d1836&title_color=915eff&icon_color=00cea8&text_color=aaa6c3`}
            alt="GitHub Stats"
            loading="lazy"
            className="w-full rounded-lg"
          />
        </motion.div>

        <LanguageChart />

        <motion.a
          href={personalInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-white font-medium py-3 px-6 rounded-full glass-card hover:border-[#915eff] transition-colors text-body-sm sm:text-body"
        >
          View Full Profile on GitHub
        </motion.a>
      </div>
    </>
  );
};

export default SectionWrapper(GitHubActivity, "github");
