/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { motion } from "framer-motion";
import "react-vertical-timeline-component/style.min.css";
import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const generateHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, 7).padStart(7, "0");
};

const ExperienceCard = ({ experience }) => (
  <VerticalTimelineElement
    contentStyle={{ background: "rgba(29, 24, 54, 0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(145, 94, 255, 0.1)", color: "#fff" }}
    contentArrowStyle={{ borderRight: "7px solid rgba(29, 24, 54, 0.6)" }}
    date={experience.date}
    iconStyle={{ background: experience.iconBg }}
    icon={
      <div className="flex justify-center items-center w-full h-full">
        <img
          src={experience.icon}
          alt={experience.company_name}
          className="w-[100%] h-[100%] object-contain"
        />
      </div>
    }
  >
    {/* Git commit hash */}
    <div className="font-mono text-[10px] sm:text-xs text-[#915eff]/70 mb-2 flex items-center gap-2">
      <span className="text-[#00cea8]">●</span>
      <span>{generateHash(experience.company_name + experience.title)}</span>
      <span className="text-white/30">—</span>
      <span className="text-white/50">{experience.date}</span>
    </div>

    <div>
      <h3 className="text-white text-[18px] sm:text-[24px] font-bold">{experience.title}</h3>
      <p
        className="text-secondary text-[14px] sm:text-[16px] font-semibold"
        style={{ margin: 0 }}
      >
        {experience.company_name}
      </p>
    </div>

    <ul className="mt-3 sm:mt-5 space-y-2 list-none ml-0">
      {experience.points.map((point, index) => (
        <li
          key={`experience-point-${index}`}
          className="text-white-100 text-[12px] sm:text-[14px] pl-0 tracking-wider flex items-start gap-2"
        >
          <span className="font-mono text-[#00cea8] text-xs mt-0.5 shrink-0">feat:</span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
  </VerticalTimelineElement>
);

const Experience = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>git log --oneline</p>
        <TextScramble text="Work Experience" as="h2" className={styles.sectionHeadText} />
      </motion.div>
      <div className="mt-4 flex flex-col">
        <VerticalTimeline>
          {experiences.map((experience, index) => (
            <ExperienceCard key={index} experience={experience} />
          ))}
        </VerticalTimeline>
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "experience");
