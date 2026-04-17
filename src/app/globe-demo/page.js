"use client";

import HomeGlobeAnimated from "@/components/HomeGlobeAnimated";

export default function GlobeDemo() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Same background as homepage */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(222,210,190,0.95) 0%, rgba(195,178,155,0.98) 55%, rgba(160,140,115,1) 100%)",
        }}
      />

      {/* Animated globe with flight paths */}
      <HomeGlobeAnimated />

      {/* Minimal label */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <span className="text-xs uppercase tracking-[0.3em] text-white/70">
          Flight Path Animation — Experiment
        </span>
      </div>
    </div>
  );
}
