"use client";

/* ══════════════════════════════════════════════════════════════════
   TripPlanMap — vintage-styled OpenStreetMap for the Trip Plan PDF.
   ──────────────────────────────────────────────────────────────────
   Uses CartoDB Voyager tiles (cream base, free, no API key) layered
   with a sepia/contrast CSS filter to give the map a 1930s WPA-poster
   feel while keeping real geography. Overlays a compass rose, accent
   border, and destination wordmark on top.

   Geocoding via Nominatim (OSM's free API). Caches results in-memory
   per session.

   Props:
     - destination     string             required, used to center the map
     - pinQueries      [{ dayNumber, label, queries:[string,...] }]
                       Each entry geocodes the first queries[] entry that
                       resolves. Use queries: best-known location first
                       (address > location_name > name).
     - height          string|number      default "5.4in"
   ══════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });

// Child component that re-fits the map view whenever the bounds change.
// react-leaflet's MapContainer bounds prop only applies on initial mount,
// so we use the imperative API to follow pin updates after geocoding.
function FitBoundsOnUpdate({ bounds, fallbackCenter }) {
  // useMap is only available on the client; lazy-loaded.
  const ReactLeaflet = require("react-leaflet");
  const map = ReactLeaflet.useMap();
  useEffect(() => {
    if (!map) return;
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11, animate: false });
    } else if (fallbackCenter) {
      map.setView(fallbackCenter, 9, { animate: false });
    }
  }, [JSON.stringify(bounds), JSON.stringify(fallbackCenter), map]);
  return null;
}

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

export default function TripPlanMap({ destination, pinQueries = [], height = "5.4in" }) {
  const [center, setCenter] = useState(null);
  const [destBounds, setDestBounds] = useState(null);
  const [pins, setPins] = useState([]);
  const [error, setError] = useState(null);

  // Stable serialization of pinQueries so identity churn in the parent
  // doesn't cancel the geocoding mid-batch.
  const pinKey = useMemo(
    () => JSON.stringify(pinQueries.map((p) => `${p.dayNumber}|${(p.queries || []).join("|")}`)),
    [pinQueries]
  );

  // Bounds shown on the map: pins (with a small pad) > destination bbox > null.
  const displayBounds = useMemo(() => {
    if (pins.length >= 2) {
      const lats = pins.map((p) => p.lat);
      const lngs = pins.map((p) => p.lng);
      const south = Math.min(...lats);
      const north = Math.max(...lats);
      const west = Math.min(...lngs);
      const east = Math.max(...lngs);
      // Pad by ~10% of span (with a sane minimum so single-cluster trips don't pin too tight)
      const padLat = Math.max(0.1, (north - south) * 0.15);
      const padLng = Math.max(0.1, (east - west) * 0.15);
      return [[south - padLat, west - padLng], [north + padLat, east + padLng]];
    }
    return destBounds;
  }, [pins, destBounds]);

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

  // Geocode the destination on mount.
  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    (async () => {
      const dest = await geocode(destination);
      if (cancelled) return;
      if (!dest) {
        setError("Could not locate destination on map");
        return;
      }
      setCenter([dest.lat, dest.lng]);
      if (dest.bbox && dest.bbox.length === 4) {
        // Nominatim bbox order: [south, north, west, east]
        const [south, north, west, east] = dest.bbox;
        setDestBounds([[south, west], [north, east]]);
      }
    })();
    return () => { cancelled = true; };
  }, [destination]);

  // Geocode pin queries — tries each candidate string per pin, falls
  // through to the next on miss. Throttled at 400ms (Nominatim policy).
  useEffect(() => {
    if (!destination || !center || pinQueries.length === 0) {
      setPins([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const results = [];
      for (const p of pinQueries) {
        if (cancelled) return;
        const candidates = (p.queries || []).filter(Boolean);
        let coords = null;
        for (const q of candidates) {
          coords = await geocode(q);
          if (coords) break;
          await new Promise(r => setTimeout(r, 400));
        }
        if (coords) {
          results.push({
            dayNumber: p.dayNumber,
            label: p.label || String(p.dayNumber),
            lat: coords.lat,
            lng: coords.lng,
          });
          if (!cancelled) setPins([...results]); // progressive update
        }
        await new Promise(r => setTimeout(r, 400));
      }
      if (!cancelled) {
        if (results.length === 0) {
          console.warn("[TripPlanMap] No pin queries resolved. queries=", pinQueries);
        } else {
          console.log(`[TripPlanMap] Pinned ${results.length}/${pinQueries.length} days`);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinKey, center, destination]);

  return (
    <div style={{
      position: "relative",
      height,
      border: "2px solid rgba(42,31,20,0.5)",
      background: "#f1e6d2",
      overflow: "hidden",
    }} className="trip-plan-map-wrap">
      <style jsx global>{`
        /* No filter on the tile pane — Voyager is already cream-toned and
           the vintage feel comes from the overlays (compass, corners,
           wordmark, accent border). Filtering hurts legibility more than
           it helps the aesthetic. */
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
        /* Subtle vignette only — corners darken slightly to frame the map
           without occluding any of the geography. No texture overlay so the
           map reads cleanly. */
        .trip-plan-map-wrap .map-paper-texture {
          position: absolute; inset: 0; pointer-events: none; z-index: 350;
          background: radial-gradient(ellipse at center, transparent 60%, rgba(42,31,20,0.10) 100%);
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
        /* Make sure background colors render in print */
        @media print {
          .trip-plan-map-wrap, .trip-plan-map-wrap * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Live map (only render when we have a center) */}
      {center && (
        <MapContainer
          center={center}
          bounds={destBounds || undefined}
          zoom={destBounds ? undefined : 9}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Re-fit map view as pins resolve so all locations are visible. */}
          <FitBoundsOnUpdate bounds={displayBounds} fallbackCenter={center} />

          {/* CartoDB Voyager — same source TripMap uses on the planning page.
              Labels baked into the tile so we don't need a separate overlay. */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OSM &copy; CARTO'
            subdomains={["a","b","c","d"]}
            maxZoom={19}
          />
          {/* Day pins, if we resolved them */}
          {pins.map((p) => (
            <Marker
              key={`${p.dayNumber}-${p.lat}-${p.lng}`}
              position={[p.lat, p.lng]}
              icon={dayPinIcon(p.label)}
            />
          ))}
          {/* Connect pins with a dashed route */}
          {pins.length > 1 && (
            <Polyline
              positions={pins.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#da7b4a", weight: 3.5, dashArray: "6 6", opacity: 0.95 }}
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
