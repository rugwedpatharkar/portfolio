/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

/*
 * Surfaces a résumé "nugget" when the pilot flies through a data fragment
 * (DataFragments dispatches `stellar:fragment` with { id, text }). Shows a
 * brief toast + a running collected count.
 */

const TOTAL = 9;

const FragmentToast = () => {
  const [toast, setToast] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer;
    const onFrag = (e) => {
      setCount((c) => c + 1);
      setToast(e.detail?.text || "Data fragment recovered");
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 4200);
    };
    window.addEventListener("stellar:fragment", onFrag);
    return () => { window.removeEventListener("stellar:fragment", onFrag); clearTimeout(timer); };
  }, []);

  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)",
      zIndex: 60, pointerEvents: "none", textAlign: "center",
      padding: "10px 20px", borderRadius: 12,
      background: "rgba(8,11,24,0.92)", border: "1px solid rgba(47, 224, 176,0.5)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      boxShadow: "0 14px 44px rgba(0,0,0,0.5), 0 0 26px rgba(47, 224, 176,0.22)",
      animation: "fragPop 4.2s ease-in-out",
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, letterSpacing: "0.22em", color: "#2fe0b0" }}>◇ DATA FRAGMENT {count}/{TOTAL}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "white", marginTop: 4 }}>{toast}</div>
      <style>{`@keyframes fragPop { 0% { opacity:0; transform: translateX(-50%) translateY(8px);} 12%,84%{opacity:1;transform:translateX(-50%) translateY(0);} 100%{opacity:0;transform:translateX(-50%) translateY(8px);} }`}</style>
    </div>
  );
};

export default FragmentToast;
