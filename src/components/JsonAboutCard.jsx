import { motion } from "framer-motion";

const jsonData = {
  name: "rugwed-patharkar",
  version: "2.0.0",
  description: "Full Stack Developer",
  location: "Pune, IN",
  skills: ["Java", "Python", "React", "Spring Boot", "Django"],
  interests: ["Open Source", "System Design", "Cloud"],
  devDependencies: { coffee: "∞", curiosity: "latest" },
  scripts: {
    build: "turn ideas into code",
    deploy: "ship it 🚀",
  },
};

const SyntaxLine = ({ lineNum, indent = 0, children }) => (
  <div className="flex">
    <span className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-white/20 select-none text-micro sm:text-caption">
      {lineNum}
    </span>
    <span style={{ paddingLeft: `${indent * 16}px` }}>{children}</span>
  </div>
);

const JsonKey = ({ k }) => <span className="text-[#bf61ff]">&quot;{k}&quot;</span>;
const JsonString = ({ v }) => <span className="text-[#00cea8]">&quot;{v}&quot;</span>;
const JsonPunct = ({ children }) => <span className="text-white/60">{children}</span>;

const JsonAboutCard = () => {
  let line = 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8 sm:mt-10 max-w-xl"
    >
      {/* VS Code-style title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e]/80 rounded-t-lg border border-b-0 border-[#915eff]/10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-secondary text-micro sm:text-caption font-mono ml-2">
          📦 package.json — rugwed-patharkar
        </span>
      </div>

      {/* Code content */}
      <div className="glass-card-dark rounded-t-none rounded-b-lg p-3 sm:p-4 font-mono text-micro sm:text-caption leading-relaxed overflow-x-auto">
        <SyntaxLine lineNum={line++}>
          <JsonPunct>{"{"}</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++} indent={1}>
          <JsonKey k="name" />
          <JsonPunct>: </JsonPunct>
          <JsonString v={jsonData.name} />
          <JsonPunct>,</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++} indent={1}>
          <JsonKey k="version" />
          <JsonPunct>: </JsonPunct>
          <JsonString v={jsonData.version} />
          <JsonPunct>,</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++} indent={1}>
          <JsonKey k="description" />
          <JsonPunct>: </JsonPunct>
          <JsonString v={jsonData.description} />
          <JsonPunct>,</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++} indent={1}>
          <JsonKey k="location" />
          <JsonPunct>: </JsonPunct>
          <JsonString v={jsonData.location} />
          <JsonPunct>,</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++} indent={1}>
          <JsonKey k="skills" />
          <JsonPunct>: [</JsonPunct>
        </SyntaxLine>
        {jsonData.skills.map((s, i) => (
          <SyntaxLine key={s} lineNum={line++} indent={2}>
            <JsonString v={s} />
            <JsonPunct>{i < jsonData.skills.length - 1 ? "," : ""}</JsonPunct>
          </SyntaxLine>
        ))}
        <SyntaxLine lineNum={line++} indent={1}>
          <JsonPunct>],</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++} indent={1}>
          <JsonKey k="devDependencies" />
          <JsonPunct>{": {"}</JsonPunct>
        </SyntaxLine>
        <SyntaxLine lineNum={line++} indent={2}>
          <JsonKey k="coffee" />
          <JsonPunct>: </JsonPunct>
          <JsonString v="∞" />
          <JsonPunct>,</JsonPunct>
        </SyntaxLine>
        <SyntaxLine lineNum={line++} indent={2}>
          <JsonKey k="curiosity" />
          <JsonPunct>: </JsonPunct>
          <JsonString v="latest" />
        </SyntaxLine>
        <SyntaxLine lineNum={line++} indent={1}>
          <JsonPunct>{"}"}</JsonPunct>
          <JsonPunct>,</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++} indent={1}>
          <JsonKey k="scripts" />
          <JsonPunct>{": {"}</JsonPunct>
        </SyntaxLine>
        <SyntaxLine lineNum={line++} indent={2}>
          <JsonKey k="build" />
          <JsonPunct>: </JsonPunct>
          <JsonString v="turn ideas into code" />
          <JsonPunct>,</JsonPunct>
        </SyntaxLine>
        <SyntaxLine lineNum={line++} indent={2}>
          <JsonKey k="deploy" />
          <JsonPunct>: </JsonPunct>
          <JsonString v="ship it 🚀" />
        </SyntaxLine>
        <SyntaxLine lineNum={line++} indent={1}>
          <JsonPunct>{"}"}</JsonPunct>
        </SyntaxLine>

        <SyntaxLine lineNum={line++}>
          <JsonPunct>{"}"}</JsonPunct>
        </SyntaxLine>
      </div>
    </motion.div>
  );
};

export default JsonAboutCard;
