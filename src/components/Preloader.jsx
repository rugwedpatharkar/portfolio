import { useState, useEffect } from "react";

const Preloader = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setLoaded(true), 800);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <div className={`preloader ${loaded ? "loaded" : ""}`}>
      <p className="text-white text-xl sm:text-2xl font-bold mb-6 tracking-wider">
        Rugwed Patharkar
      </p>
      <div className="flex">
        <span className="preloader-dot" />
        <span className="preloader-dot" />
        <span className="preloader-dot" />
      </div>
    </div>
  );
};

export default Preloader;
