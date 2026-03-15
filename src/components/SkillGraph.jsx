import { useEffect, useRef } from "react";
import { skills as skillData } from "../constants";

/* ── Define skill connections (shared project/workflow relationships) ── */
const CONNECTIONS = [
  ["Python", "FastAPI"], ["Python", "Django"], ["Python", "LangChain"],
  ["FastAPI", "gRPC"], ["FastAPI", "Redis"], ["FastAPI", "Docker"],
  ["gRPC", "GCP"], ["gRPC", "Kubernetes"],
  ["LangChain", "OpenAI / LLMs"], ["LangChain", "RAG / Embeddings"],
  ["Docker", "Kubernetes"], ["Docker", "GitHub Actions"],
  ["Kubernetes", "Helm"], ["Kubernetes", "Terraform"], ["Kubernetes", "GCP"],
  ["GCP", "Terraform"], ["GCP", "Prometheus/Grafana"],
  ["React JS", "Next JS"], ["React JS", "Redux"], ["React JS", "Tailwind CSS"],
  ["JavaScript", "TypeScript"], ["JavaScript", "Node.js"], ["JavaScript", "React JS"],
  ["Node.js", "MongoDB"], ["Node.js", "Redis"],
  ["MongoDB", "Redis"], ["PostgreSQL", "MySQL"],
  ["Redis", "RabbitMQ"], ["RabbitMQ", "Celery"], ["Celery", "Python"],
  ["Git", "GitHub Actions"], ["Firebase Firestore", "GCP"],
];

const CATEGORY_COLORS = {
  Languages: "#915eff",
  "Backend Frameworks": "#00cea8",
  Frontend: "#61dafb",
  "AI & Emerging Tech": "#f8c555",
  Databases: "#ff6b6b",
  "Cloud & DevOps": "#326ce5",
  "Tools & Platforms": "#68a063",
};

/* Build flat skill list with category color */
const allSkills = [];
const skillColorMap = {};
Object.entries(skillData).forEach(([cat, items]) => {
  items.forEach((s) => {
    allSkills.push({ name: s.name, category: cat });
    skillColorMap[s.name] = CATEGORY_COLORS[cat] || "#915eff";
  });
});

const SkillGraph = () => {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width, height;
    const resize = () => {
      width = canvas.parentElement.offsetWidth;
      height = 400;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutNodes();
    };

    /* ── Initial force-directed-ish layout using circle + jitter ── */
    const layoutNodes = () => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.35;
      nodesRef.current = allSkills.map((s, i) => {
        const angle = (i / allSkills.length) * Math.PI * 2 - Math.PI / 2;
        const jitter = (Math.random() - 0.5) * 40;
        return {
          ...s,
          x: cx + Math.cos(angle) * (radius + jitter),
          y: cy + Math.sin(angle) * (radius + jitter),
          targetX: cx + Math.cos(angle) * (radius + jitter),
          targetY: cy + Math.sin(angle) * (radius + jitter),
          color: skillColorMap[s.name],
          radius: 5,
        };
      });
    };

    resize();

    const getNode = (name) => nodesRef.current.find((n) => n.name === name);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      const nodes = nodesRef.current;

      // Find hovered node
      let hoveredNode = null;
      for (const n of nodes) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        if (dx * dx + dy * dy < 400) { // within 20px
          hoveredNode = n;
          break;
        }
      }

      // Get connected skill names for hovered node
      const connectedNames = new Set();
      if (hoveredNode) {
        connectedNames.add(hoveredNode.name);
        for (const [a, b] of CONNECTIONS) {
          if (a === hoveredNode.name) connectedNames.add(b);
          if (b === hoveredNode.name) connectedNames.add(a);
        }
      }

      // Draw connections
      for (const [aName, bName] of CONNECTIONS) {
        const a = getNode(aName);
        const b = getNode(bName);
        if (!a || !b) continue;

        const isHighlighted = hoveredNode && (connectedNames.has(aName) && connectedNames.has(bName));
        const alpha = isHighlighted ? 0.5 : hoveredNode ? 0.04 : 0.12;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isHighlighted
          ? `rgba(145, 94, 255, ${alpha})`
          : `rgba(145, 94, 255, ${alpha})`;
        ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
        ctx.stroke();
      }

      // Draw nodes
      for (const n of nodes) {
        const isHovered = hoveredNode && n.name === hoveredNode.name;
        const isConnected = connectedNames.has(n.name);
        const dimmed = hoveredNode && !isConnected;

        const r = isHovered ? 8 : isConnected ? 6 : 5;
        const alpha = dimmed ? 0.15 : 1;

        // Glow
        if (isHovered || isConnected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r + 4);
          grad.addColorStop(0, n.color + "40");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? `${n.color}30` : n.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label
        if (isHovered || (isConnected && hoveredNode)) {
          ctx.font = `${isHovered ? "bold " : ""}11px 'Fira Code', monospace`;
          ctx.fillStyle = isHovered ? "#ffffff" : `${n.color}cc`;
          ctx.textAlign = "center";
          ctx.fillText(n.name, n.x, n.y - r - 6);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      } else if (!animRef.current) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", () => { resize(); });

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div className="mt-8 sm:mt-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#915eff] text-caption sm:text-body-sm font-mono font-medium">
          Skill Connections
        </span>
        <span className="text-white/30 text-micro font-mono">
          — hover to explore relationships
        </span>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden card-shine border-glow">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000 }; }}
          className="w-full cursor-crosshair"
          aria-label="Interactive skill connection graph"
          role="img"
        />
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-white/50 text-micro font-mono">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillGraph;
