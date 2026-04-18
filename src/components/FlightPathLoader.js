"use client";

import { useEffect, useRef } from "react";
import MapPatternBg from "@/components/MapPatternBg";

/**
 * FlightPathLoader — a 2D animated flight path that draws across the screen.
 * A small plane leads a curved dotted trail from left to right, looping.
 * Styled to match the TripCraft warm-stone palette.
 */
export default function FlightPathLoader({ text = "Preparing your trips..." }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Flight path — a smooth curve across the viewport
    function getPath(w, h) {
      const cy = h * 0.45;
      const points = [];
      const steps = 200;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = t * w;
        // Gentle sine wave path
        const y = cy + Math.sin(t * Math.PI * 2.5) * (h * 0.12)
                     + Math.cos(t * Math.PI * 1.3) * (h * 0.06);
        points.push({ x, y });
      }
      return points;
    }

    // Draw airplane silhouette (top-down, pointing right)
    function drawPlane(ctx, x, y, angle, size) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      // Nose
      ctx.moveTo(size, 0);
      // Upper fuselage to wing
      ctx.lineTo(size * 0.1, -size * 0.15);
      // Upper wing
      ctx.lineTo(-size * 0.2, -size * 0.7);
      ctx.lineTo(-size * 0.35, -size * 0.65);
      ctx.lineTo(-size * 0.15, -size * 0.15);
      // Tail upper
      ctx.lineTo(-size * 0.7, -size * 0.35);
      ctx.lineTo(-size * 0.85, -size * 0.3);
      ctx.lineTo(-size * 0.65, -size * 0.05);
      // Tail
      ctx.lineTo(-size * 0.75, 0);
      // Tail lower
      ctx.lineTo(-size * 0.65, size * 0.05);
      ctx.lineTo(-size * 0.85, size * 0.3);
      ctx.lineTo(-size * 0.7, size * 0.35);
      ctx.lineTo(-size * 0.15, size * 0.15);
      // Lower wing
      ctx.lineTo(-size * 0.35, size * 0.65);
      ctx.lineTo(-size * 0.2, size * 0.7);
      ctx.lineTo(size * 0.1, size * 0.15);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    let progress = 0;
    const SPEED = 0.002;

    function animate() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const path = getPath(w, h);
      progress += SPEED;
      if (progress > 1) progress = 0;

      const currentIdx = Math.floor(progress * (path.length - 1));

      // Draw trail (dotted line behind the plane)
      ctx.strokeStyle = "rgba(155, 94, 74, 0.6)"; // earthy red matching globe trails
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      for (let i = 0; i <= currentIdx; i++) {
        if (i === 0) ctx.moveTo(path[i].x, path[i].y);
        else ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw destination dots along the path
      const dotPositions = [0.15, 0.35, 0.55, 0.75, 0.92];
      dotPositions.forEach((dp) => {
        const di = Math.floor(dp * (path.length - 1));
        ctx.beginPath();
        ctx.arc(path[di].x, path[di].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = progress >= dp ? "rgba(74, 110, 68, 0.8)" : "rgba(74, 110, 68, 0.25)";
        ctx.fill();
      });

      // Draw plane at current position
      if (currentIdx < path.length - 1) {
        const p = path[currentIdx];
        const next = path[Math.min(currentIdx + 3, path.length - 1)];
        const angle = Math.atan2(next.y - p.y, next.x - p.x);
        drawPlane(ctx, p.x, p.y, angle, 14);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center relative"
      style={{
        background:
          "linear-gradient(to bottom, rgba(210,195,172,0.7) 0%, rgba(222,210,190,0.6) 50%, rgba(210,195,172,0.7) 100%)",
      }}
    >
      <MapPatternBg tileSize={280} opacity={1} />
      <canvas
        ref={canvasRef}
        className="w-full max-w-xl relative z-10"
        style={{ height: 160 }}
      />
      <p className="text-stone-600 text-sm mt-4 tracking-wide relative z-10">{text}</p>
    </div>
  );
}
