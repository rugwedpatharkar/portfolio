 
import { useEffect, useState } from "react";

/*
 * Bottom-pinned ticker that cycles short statements about the work.
 * One quote every ~10 s. Subtle, fades in/out at the edges.
 */

const QUOTES = [
  "Cut p95 latency 96% — from 5s to 200 ms on availability and pricing.",
  "31 services on GKE · multi-region · multi-tenant · one API gateway.",
  "Hybrid RAG with Qdrant — dense embeddings + BM25, gated by reranker.",
  "Backend that recovers gracefully > backend that's fast on the happy path.",
  "APIs that surprise their consumers cost more than APIs that are slow.",
  "Observability is the difference between an outage and a war room.",
  "Multi-agent supervisors should compose tools — not duplicate them.",
  "Idempotency at every external boundary. Always.",
];

const QuoteFeed = () => {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((v) => (v + 1) % QUOTES.length);
        setVisible(true);
      }, 520);
    }, 11000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div
      style={{
        /* Anchored above the breadcrumb dots which sit at bottom:12 */
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "min(640px, 78vw)",
        padding: "4px 16px",
        fontFamily: "'Saira', sans-serif",
        fontSize: 11.5,
        color: "rgba(255, 255, 255, 0.55)",
        fontStyle: "italic",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 480ms ease",
        zIndex: 28,
        pointerEvents: "none",
        textShadow: "0 1px 8px rgba(0,0,0,0.9)",
      }}
    >
      <span style={{ color: "#2fe0b0", marginRight: 6, opacity: 0.7 }}>"</span>
      {QUOTES[i]}
      <span style={{ color: "#2fe0b0", marginLeft: 4, opacity: 0.7 }}>"</span>
    </div>
  );
};

export default QuoteFeed;
