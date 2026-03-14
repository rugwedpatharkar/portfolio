/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const CODE_LINES = [
  "// Rugwed's approach to problem-solving",
  "async function buildSolution(problem) {",
  "  const analysis = await understand(problem);",
  "  const stack = selectTechStack(analysis);",
  "",
  "  const solution = {",
  '    frontend: stack.includes("React")',
  "      ? createReactApp(analysis)",
  "      : buildVanilla(analysis),",
  "    backend: designAPI(analysis.requirements),",
  "    database: optimizeSchema(analysis.data),",
  "  };",
  "",
  "  await runTests(solution);",
  "  await deploy(solution);",
  "",
  "  return {",
  '    status: "shipped",',
  "    impact: analysis.impact",
  "  };",
  "}",
];

const KEYWORDS = new Set(["async", "function", "await", "const", "return", "if", "else", "includes"]);
const FUNCTIONS = new Set(["buildSolution", "understand", "selectTechStack", "createReactApp", "buildVanilla", "designAPI", "optimizeSchema", "runTests", "deploy"]);

const tokenize = (line) => {
  if (line.trimStart().startsWith("//")) {
    return [{ text: line, type: "comment" }];
  }
  const tokens = [];
  const regex = /(".*?"|'.*?'|\b\w+\b|[^\w\s]|\s+)/g;
  let m;
  while ((m = regex.exec(line)) !== null) {
    const text = m[0];
    let type = "plain";
    if (/^["']/.test(text)) type = "string";
    else if (KEYWORDS.has(text)) type = "keyword";
    else if (FUNCTIONS.has(text)) type = "fn";
    else if (/^\d+$/.test(text)) type = "number";
    tokens.push({ text, type });
  }
  return tokens;
};

const COLORS = {
  keyword: "#bf61ff",
  string: "#00cea8",
  comment: "#6a737d",
  number: "#f8c555",
  fn: "#79c0ff",
  plain: "#e6e6e6",
};

const LiveCodeShowcase = () => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) setHasStarted(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= CODE_LINES.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [hasStarted]);

  return (
    <div ref={ref}>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>How I Think</p>
        <TextScramble text="Code Showcase" as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-8 sm:mt-12 max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a2e]/80 rounded-t-xl border border-b-0 border-[#915eff]/10">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-secondary text-[11px] sm:text-xs font-mono ml-2">
            solution.js — rugwed-patharkar
          </span>
        </div>

        <div className="glass-card-dark rounded-t-none rounded-b-xl p-4 sm:p-6 overflow-x-auto min-h-[280px] sm:min-h-[380px]">
          <div className="font-mono text-[11px] sm:text-sm leading-relaxed">
            {CODE_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="flex" style={{ animation: "fadeInLine 0.15s ease forwards" }}>
                <span className="w-8 sm:w-10 text-right pr-3 sm:pr-4 text-white/20 select-none text-[11px] sm:text-xs shrink-0">
                  {i + 1}
                </span>
                <span className="whitespace-pre">
                  {tokenize(line).map((t, j) => (
                    <span key={j} style={{ color: COLORS[t.type] || COLORS.plain }}>
                      {t.text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
            {visibleLines < CODE_LINES.length && (
              <span className="inline-block w-2 h-4 bg-[#915eff] animate-pulse ml-8 sm:ml-10 mt-0.5" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SectionWrapper(LiveCodeShowcase, "");
