"use client";

/* ══════════════════════════════════════════════════════════════════
   TripPlanMap — vintage-styled OpenStreetMap for the Trip Plan PDF.
   ──────────────────────────────────────────────────────────────────
   Uses CartoDB Voyager tiles (cream base, free, no API key) layered
   with a sepia/contrast CSS filter to give the map a 1930s WPA-poster
   feel while keeping real geography. Overlays a compass rose, accent
   border, and destination wordmark on top.

   Geocoding via Nominatim (OSM's free API). Caches results in-memory
   per session to avoid hammering the rate limiter.

   Props:
     - destination     string            required, used to center the map
     - days            [{ date, title, dayNumber }]   optional pin labels
     - height          string|number     default "5.4in"
   ══════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });

// Module-scoped geocode cache to avoid re-fetching across remounts.
const geocodeCache = {};

async function geocode(query) {
  if (!query || query.trim().length < 2) return null;
  const key = query.trim().toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        bbox: data[0].boundingbox ? data[0].boundingbox.map(parseFloat) : null,
        display: data[0].display_name,
      };
      geocodeCache[key] = result;
      return result;
    }
  } catch (err) {
    console.error("[TripPlanMap] geocode error:", err);
  }
  return null;
}

// Build a tear-drop pin icon for day markers
function dayPinIcon(label) {
  if (typeof window === "undefined") return null;
  const L = require("leaflet");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.7 23.3 0 15 0z"
          fill="#da7b4a" stroke="#f1e6d2" stroke-width="2"/>
    <circle cx="15" cy="15" r="9" fill="#f1e6d2"/>
    <text x="15" y="19" text-anchor="middle"
          font-family="Bebas Neue, Impact, sans-serif" font-size="13"
          fill="#2a1f14" font-weight="400">${label}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    className: "trip-plan-pin",
  });
}

export default function TripPlanMap({ destination, days = [], height = "5.4in" }) {
  const [center, setCenter] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [pins, setPins] = useState([]);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  // Inject Leaflet's CSS once (matches the pattern in TripMap.js).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Geocode the destination on mount
  useEffect(() => {
    cancelledRef.current = false;
    if (!destination) return;
    (async () => {
      const dest = await geocode(destination);
      if (cancelledRef.current) return;
      if (!dest) {
        setError("Could not locate destination on map");
        return;
      }
      setCenter([dest.lat, dest.lng]);
      if (dest.bbox && dest.bbox.length === 4) {
        // Nominatim bbox: [south, north, west, east]
        const [south, north, west, east] = dest.bbox;
        setBounds([[south, west], [north, east]]);
      }
    })();
    return () => { cancelledRef.current = true; };
  }, [destination]);

  // Optionally try to geocode day titles for pins (best-effort, throttled)
  useEffect(() => {
    cancelledRef.current = false;
    if (!destination || !days || days.length === 0) return;
    if (!center) return;
    let cancelled = false;
    (async () => {
      const results = [];
      for (const d of days) {
        if (cancelled) return;
        if (!d.title || d.title.trim().length < 3) continue;
        // Bias query with the destination so "Forks" resolves in WA, not UK
        const q = `${d.title}, ${destination}`;
        const coords = await geocode(q);
        if (coords) {
          results.push({
            dayNumber: d.dayNumber,
            date: d.date,
            title: d.title,
            lat: coords.lat,
            lng: coords.lng,
          });
        }
        await new Promise(r => setTimeout(r, 400)); // Nominatim rate limit
      }
      if (!cancelled) setPins(results);
    })();
    return () => { cancelled = true; };
  }, [destination, days, center]);

  return (
    <div style={{
      position: "relative",
      height,
      border: "2px solid rgba(42,31,20,0.5)",
      background: "#f1e6d2",
      overflow: "hidden",
    }} className="trip-plan-map-wrap">
      <style jsx global>{`
        /* Vintage CSS treatment on the live map tiles */
        .trip-plan-map-wrap .leaflet-tile-pane {
          filter: sepia(0.30) saturate(0.85) contrast(1.05) brightness(0.98) hue-rotate(-6deg);
        }
        /* Hide controls — this is a poster, not a tool */
        .trip-plan-map-wrap .leaflet-control-zoom,
        .trip-plan-map-wrap .leaflet-control-attribution {
          display: none !important;
        }
        /* Background of the map container itself */
        .trip-plan-map-wrap .leaflet-container {
          background: #f1e6d2;
          font-family: "Lora", Georgia, serif;
        }
        /* Paper-texture overlay sits above tiles, below pins */
        .trip-plan-map-wrap .map-paper-texture {
          position: absolute; inset: 0; pointer-events: none; z-index: 350;
          background:
            repeating-linear-gradient(45deg, rgba(42,31,20,0.025) 0 2px, transparent 2px 6px),
            radial-gradient(circle at 30% 20%, rgba(241,230,210,0) 0%, rgba(241,230,210,0.18) 70%, rgba(241,230,210,0.32) 100%);
          mix-blend-mode: multiply;
        }
        /* Vintage corner accents */
        .trip-plan-map-wrap .map-corner {
          position: absolute; width: 28px; height: 28px; border: 2px solid #2a1f14;
          z-index: 600; background: rgba(241,230,210,0.85);
        }
        .trip-plan-map-wrap .map-corner.tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
        .trip-plan-map-wrap .map-corner.tr { top: 6px; right: 6px; border-left: none; border-bottom: none; }
        .trip-plan-map-wrap .map-corner.bl { bottom: 6px; left: 6px; border-right: none; border-top: none; }
        .trip-plan-map-wrap .map-corner.br { bottom: 6px; right: 6px; border-left: none; border-top: none; }
        /* Make sure tiles render in print */
        @media print {
          .trip-plan-map-wrap .leaflet-tile-pane { filter: sepia(0.30) saturate(0.85) contrast(1.05); }
        }
      `}</style>

      {/* Live map (only render when we have a center) */}
      {center && (
        <MapContainer
          center={center}
          bounds={bounds || undefined}
          zoom={bounds ? undefined : 9}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          {/* CartoDB Voyager — cream-toned OSM, free for low-traffic use */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; OSM &copy; CARTO'
            subdomains={["a","b","c","d"]}
            maxZoom={19}
          />
          {/* Add the labels back as a separate layer so the filter doesn't crush them */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            subdomains={["a","b","c","d"]}
            maxZoom={19}
            opacity={0.85}
          />
          {/* Day pins, if we resolved them */}
          {pins.map((p) => (
            <Marker
              key={`${p.dayNumber}-${p.date}`}
              position={[p.lat, p.lng]}
              icon={dayPinIcon(String(p.dayNumber).padStart(2, "0"))}
            />
          ))}
          {/* Connect pins with a dashed route */}
          {pins.length > 1 && (
            <Polyline
              positions={pins.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#da7b4a", weight: 3, dashArray: "6 6", opacity: 0.85 }}
            />
          )}
        </MapContainer>
      )}

      {/* Loading state */}
      {!center && !error && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Oswald, sans-serif", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(42,31,20,0.55)", fontWeight: 600,
        }}>
          Plotting the route…
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 12, color: "rgba(42,31,20,0.6)",
        }}>
          {error}
        </div>
      )}

      {/* ─── Vintage decorative overlays ─── */}

      {/* Paper-texture / vignette */}
      <div className="map-paper-texture" />

      {/* Corner ornaments */}
      <div className="map-corner tl" />
      <div className="map-corner tr" />
      <div className="map-corner bl" />
      <div className="map-corner br" />

      {/* "— ROUTE" label, top-left */}
      <div style={{
        position: "absolute", top: 12, left: 44,
        background: "rgba(241,230,210,0.92)", padding: "3px 10px",
        fontFamily: "Oswald, sans-serif", fontSize: 10, fontWeight: 600,
        letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(42,31,20,0.7)",
        border: "1px solid rgba(42,31,20,0.4)", zIndex: 700,
      }}>
        — Route
      </div>

      {/* Compass rose, top-right */}
      <div style={{
        position: "absolute", top: 12, right: 44, width: 38, height: 38,
        zIndex: 700,
      }}>
        <svg viewBox="0 0 40 40" width="38" height="38">
          <defs>
            <radialGradient id="cr-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f1e6d2" stopOpacity="0.95"/>
              <stop offset="100%" stopColor="#f1e6d2" stopOpacity="0.7"/>
            </radialGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#cr-bg)" stroke="#2a1f14" strokeWidth="1.6"/>
          <circle cx="20" cy="20" r="11" fill="none" stroke="#2a1f14" strokeWidth="0.7" strokeDasharray="1 2"/>
          <polygon points="20,3 23,20 20,17 17,20" fill="#da7b4a" stroke="#2a1f14" strokeWidth="0.4"/>
          <polygon points="20,37 17,20 20,23 23,20" fill="#2a1f14" opacity="0.85"/>
          <text x="20" y="9" textAnchor="middle" fontFamily="Bebas Neue, Impact, sans-serif" fontSize="6.5" fill="#2a1f14">N</text>
          <text x="20" y="35" textAnchor="middle" fontFamily="Bebas Neue, Impact, sans-serif" fontSize="6.5" fill="#2a1f14">S</text>
          <text x="33" y="22" textAnchor="middle" fontFamily="Bebas Neue, Impact, sans-serif" fontSize="6.5" fill="#2a1f14">E</text>
          <text x="7"  y="22" textAnchor="middle" fontFamily="Bebas Neue, Impact, sans-serif" fontSize="6.5" fill="#2a1f14">W</text>
        </svg>
      </div>

      {/* Destination wordmark, faded, bottom */}
      {destination && (
        <div style={{
          position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center",
          fontFamily: "Bebas Neue, Impact, sans-serif", fontSize: 26, letterSpacing: "0.08em",
          color: "#2a1f14", textShadow: "0 1px 0 rgba(241,230,210,0.95), 0 0 8px rgba(241,230,210,0.7)",
          zIndex: 700, pointerEvents: "none",
        }}>
          {destination.toUpperCase()}
        </div>
      )}

      {/* Attribution, tiny, bottom-left, screen-only */}
      <div className="no-print" style={{
        position: "absolute", bottom: 4, left: 38, fontSize: 8, color: "rgba(42,31,20,0.55)",
        fontFamily: "Lora, serif", zIndex: 700,
      }}>
        © OpenStreetMap · CARTO
      </div>
    </div>
  );
}
