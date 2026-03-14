/* eslint-disable react/prop-types */
import { useState } from "react";

const ImageSkeleton = ({ src, alt, className = "", shape = "rect", ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const skeletonShape = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    card: "rounded-2xl",
  }[shape] || "rounded-2xl";

  return (
    <div className="relative overflow-hidden">
      {!loaded && (
        <div className={`absolute inset-0 bg-tertiary ${skeletonShape} ${className}`}>
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
          {/* Content-aware skeleton shapes */}
          {shape === "card" && (
            <div className="absolute inset-0 flex flex-col p-4 gap-3">
              <div className="w-full h-[60%] bg-white/5 rounded-xl" />
              <div className="w-3/4 h-3 bg-white/5 rounded-full" />
              <div className="w-1/2 h-3 bg-white/5 rounded-full" />
              <div className="flex gap-2 mt-auto">
                <div className="w-12 h-4 bg-white/5 rounded-full" />
                <div className="w-12 h-4 bg-white/5 rounded-full" />
              </div>
            </div>
          )}
          {shape === "circle" && (
            <div className="absolute inset-[15%] rounded-full bg-white/5" />
          )}
          {shape === "rect" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
          )}
        </div>
      )}
      {error ? (
        <div className={`${className} bg-tertiary flex items-center justify-center ${skeletonShape}`}>
          <svg className="w-10 h-10 text-white/20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z" />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default ImageSkeleton;
