/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  live_demo_link,
}) => {
  return (
    <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
      <Tilt
        options={{ max: 45, scale: 1, speed: 450 }}
        className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full"
      >
        <div className="relative w-full h-[230px]">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full rounded-2xl"
          />
        </div>
        
      </Tilt>
    </motion.div>
  );
};

const Projects = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Explore My Work</p>
        <h2 className={styles.sectionHeadText}>Projects</h2>
      </motion.div>
      <div className="w-full flex">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary  text-[17px] max-w-4xl leading-[30px]"
        >
          The projects showcased in my portfolio exemplify my skills,
          problem-solving prowess, and effective project management. Each
          project represents a distinct technological challenge and reflects my
          ability to navigate various frameworks and technologies seamlessly.
          From developing user-centric applications to managing complex
          projects, these endeavors underscore my capacity to solve intricate
          problems and work proficiently with different tools and platforms.
          Whether it's creating responsive web applications or developing robust
          desktop solutions, these projects demonstrate my versatility and
          proficiency in tackling diverse challenges. Together, they provide a
          comprehensive overview of my capabilities, highlighting my adeptness
          in delivering high-quality solutions and managing projects
          effectively.
        </motion.p>
        </div>
        <div className="mt-20 flex flex-wrap gap-7">
          {projects.map((project, index) => (
            <ProjectCard key={`project-${index}`} index={index} {...project} />
          ))}
        </div>
      
    </>
  );
};

export default SectionWrapper(Projects, "projects");
