/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useRef } from "react";
import { Tilt } from "react-tilt";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { styles } from "../styles";
import { github, demo } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import ImageSkeleton from "./ImageSkeleton";
import TextScramble from "./TextScramble";

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  live_demo_link,
  stats,
}) => {
  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className="min-w-[280px] sm:min-w-[340px] xl:min-w-0"
    >
      <Tilt
        options={{ max: 45, scale: 1, speed: 450 }}
        className="bg-tertiary p-4 sm:p-5 rounded-2xl w-full card-shine"
      >
        <div className="relative w-full h-[180px] xs:h-[200px] sm:h-[230px] overflow-hidden rounded-2xl group/img">
          <ImageSkeleton
            src={image}
            alt={name}
            loading="lazy"
            className="object-cover w-full h-full rounded-2xl transition-transform duration-500 group-hover/img:scale-110"
          />

          <div className="absolute inset-0 flex justify-end m-2 sm:m-3 card-img_hover">
            {live_demo_link && (
              <a
                href={live_demo_link}
                target="_blank"
                rel="noopener noreferrer"
                className="black-gradient w-10 h-10 sm:w-12 sm:h-12 rounded-full flex justify-center items-center cursor-pointer mx-1 sm:mx-2 hover:scale-110 transition-transform"
                aria-label={`Live demo of ${name}`}
              >
                <img src={demo} alt="" className="w-1/2 h-1/2 object-contain" />
              </a>
            )}
            <a
              href={source_code_link}
              target="_blank"
              rel="noopener noreferrer"
              className="black-gradient w-10 h-10 sm:w-12 sm:h-12 rounded-full flex justify-center items-center cursor-pointer hover:scale-110 transition-transform"
              aria-label={`Source code for ${name}`}
            >
              <img src={github} alt="" className="w-1/2 h-1/2 object-contain" />
            </a>
          </div>
        </div>

        <div className="mt-3 sm:mt-5">
          <h3 className="text-white font-bold text-[18px] sm:text-[24px]">{name}</h3>
          <p className="mt-2 text-secondary text-[12px] sm:text-[13px] leading-[18px] sm:leading-[20px] line-clamp-6">
            {description}
          </p>
        </div>

        {stats && stats.length > 0 && (
          <div className="mt-3 flex gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[#915eff] font-bold text-sm sm:text-base">{stat.value}</span>
                <span className="text-secondary text-[10px] sm:text-xs">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {tags.map((tag, tagIndex) => (
            <p
              key={`tag-${tagIndex}`}
              className={`text-[12px] sm:text-[14px] ${tag.color}`}
            >
              #{tag.name}
            </p>
          ))}
        </div>
      </Tilt>
    </motion.div>
  );
};

const DraggableRow = ({ children }) => {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

  return (
    <div ref={containerRef} className="overflow-hidden cursor-grab active:cursor-grabbing xl:overflow-visible">
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        style={{ x: springX }}
        className="flex gap-5 sm:gap-7 xl:grid xl:grid-cols-3"
      >
        {children}
      </motion.div>
    </div>
  );
};

const Projects = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Explore My Work</p>
        <TextScramble text="Projects" as="h2" className={styles.sectionHeadText} />
      </motion.div>
      <div className="w-full flex">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary text-[14px] sm:text-[17px] max-w-4xl leading-[24px] sm:leading-[30px]"
        >
          The projects showcased in my portfolio exemplify my skills, problem
          solving prowess, and effective project management. Each project
          represents a distinct technological challenge and reflects my ability
          to navigate various frameworks and technologies seamlessly.
        </motion.p>
      </div>
      <p className="mt-4 text-secondary/50 text-xs italic xl:hidden">
        Drag to explore projects &rarr;
      </p>
      <div className="mt-8 sm:mt-16">
        <DraggableRow>
          {projects.map((project, index) => (
            <ProjectCard key={`project-${index}`} index={index} {...project} />
          ))}
        </DraggableRow>
      </div>
    </>
  );
};

export default SectionWrapper(Projects, "projects");
