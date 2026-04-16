"use client";

/**
 * MapPatternBg — a tileable SVG background that evokes vintage cartography.
 *
 * Props (all optional):
 *   tileSize     — px width/height of one tile (default 280)
 *   opacity      — overall pattern opacity 0-1  (default 0.38)
 *   lineColor    — stroke colour                (default "#b8a48a")
 *   accentColor  — compass/deco colour          (default "#c9a87c")
 *
 * The SVG is inlined as a data-URI `background-image` so it tiles natively
 * with CSS `background-repeat` — no extra network requests, fully responsive.
 */
export default function MapPatternBg({
  tileSize = 280,
  opacity = 0.38,
  lineColor = "#b8a48a",
  accentColor = "#c9a87c",
}) {
  // Build the SVG tile as a string so we can use it as a data-URI
  const half = tileSize / 2;
  const q = tileSize / 4;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 ${tileSize} ${tileSize}">
  <defs>
    <!-- subtle paper grain -->
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </defs>

  <!-- dotted travel route arcs -->
  <path d="M 0 ${q * 3} Q ${q} ${q * 2} ${half} ${q * 2.5} T ${tileSize} ${q}"
        fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="3 5" opacity="0.5"/>
  <path d="M ${q} 0 Q ${q * 2} ${q * 1.5} ${q * 2.5} ${half} T ${q * 3} ${tileSize}"
        fill="none" stroke="${lineColor}" stroke-width="1" stroke-dasharray="3 5" opacity="0.45"/>
  <path d="M 0 ${q} Q ${half} ${q * 1.8} ${tileSize} ${q * 2}"
        fill="none" stroke="${accentColor}" stroke-width="0.8" stroke-dasharray="2 4" opacity="0.35"/>
  <path d="M ${q * 2} 0 Q ${q * 2.5} ${half} ${q * 1.5} ${tileSize}"
        fill="none" stroke="${lineColor}" stroke-width="0.8" stroke-dasharray="2 4" opacity="0.3"/>
</svg>`;

  const encoded = `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;

  return (
    <div
      className="fixed inset-0"
      style={{
        backgroundImage: `url("${encoded}")`,
        backgroundRepeat: "repeat",
        backgroundSize: `${tileSize}px ${tileSize}px`,
        opacity,
      }}
    />
  );
}
