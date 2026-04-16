"use client";

/**
 * TripCraftLogo — vector logo with overlapping compass roses and wordmark.
 *
 * Props:
 *   size        — overall height in px (default 40)
 *   showText    — render the "TripCraft" wordmark next to compass (default true)
 *   compassColor — hex for compass strokes (default "#3a6a8c" muted blue)
 *   textColor    — hex for wordmark      (default "#b5552a" terracotta)
 */
export default function TripCraftLogo({
  size = 40,
  showText = true,
  compassColor = "#3a6a8c",
  textColor = "#b5552a",
}) {
  // Viewbox is sized so that just-compass = ~120 wide, with-text = ~480 wide
  const width = showText ? size * 4.4 : size * 1.2;
  const viewW = showText ? 440 : 120;
  const viewH = 100;

  // Compass geometry — drawn around (cx, cy) with radius r
  const Compass = ({ cx, cy, r, opacity = 1 }) => {
    // 8 pointed star — long N/S/E/W spikes + shorter diagonals
    const longSpike = r * 0.55;
    const shortSpike = r * 0.32;
    const baseW = r * 0.13;

    return (
      <g opacity={opacity}>
        {/* outer ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={compassColor} strokeWidth="2.2" />
        {/* inner ring */}
        <circle cx={cx} cy={cy} r={r * 0.9} fill="none" stroke={compassColor} strokeWidth="1.4" />

        {/* N spike */}
        <polygon
          points={`${cx},${cy - r - longSpike} ${cx - baseW},${cy - r * 0.95} ${cx + baseW},${cy - r * 0.95}`}
          fill={compassColor}
        />
        {/* S spike */}
        <polygon
          points={`${cx},${cy + r + longSpike} ${cx - baseW},${cy + r * 0.95} ${cx + baseW},${cy + r * 0.95}`}
          fill={compassColor}
        />
        {/* E spike */}
        <polygon
          points={`${cx + r + longSpike},${cy} ${cx + r * 0.95},${cy - baseW} ${cx + r * 0.95},${cy + baseW}`}
          fill={compassColor}
        />
        {/* W spike */}
        <polygon
          points={`${cx - r - longSpike},${cy} ${cx - r * 0.95},${cy - baseW} ${cx - r * 0.95},${cy + baseW}`}
          fill={compassColor}
        />

        {/* NE diagonal */}
        <polygon
          points={`${cx + (r + shortSpike) * 0.707},${cy - (r + shortSpike) * 0.707} ${cx + r * 0.78},${cy - r * 0.55} ${cx + r * 0.55},${cy - r * 0.78}`}
          fill={compassColor}
        />
        {/* NW diagonal */}
        <polygon
          points={`${cx - (r + shortSpike) * 0.707},${cy - (r + shortSpike) * 0.707} ${cx - r * 0.78},${cy - r * 0.55} ${cx - r * 0.55},${cy - r * 0.78}`}
          fill={compassColor}
        />
        {/* SE diagonal */}
        <polygon
          points={`${cx + (r + shortSpike) * 0.707},${cy + (r + shortSpike) * 0.707} ${cx + r * 0.78},${cy + r * 0.55} ${cx + r * 0.55},${cy + r * 0.78}`}
          fill={compassColor}
        />
        {/* SW diagonal */}
        <polygon
          points={`${cx - (r + shortSpike) * 0.707},${cy + (r + shortSpike) * 0.707} ${cx - r * 0.78},${cy + r * 0.55} ${cx - r * 0.55},${cy + r * 0.78}`}
          fill={compassColor}
        />
      </g>
    );
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={size}
      viewBox={`0 0 ${viewW} ${viewH}`}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {/* two overlapping compasses — left one shifted, right one in front */}
      <Compass cx={42} cy={50} r={26} opacity={0.85} />
      <Compass cx={78} cy={50} r={26} opacity={1} />

      {showText && (
        <text
          x={130}
          y={62}
          fill={textColor}
          fontFamily='"Cinzel", "Trajan Pro", "Cormorant Garamond", Georgia, serif'
          fontSize="44"
          fontWeight="700"
          letterSpacing="2"
        >
          TripCraft
        </text>
      )}
    </svg>
  );
}
