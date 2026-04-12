"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";

// ── Dynamically import map components (Leaflet requires window) ──
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });

// ── Pin category config ──
const PIN_CONFIG = {
  flight: { color: "#3b82f6", label: "Flight", emoji: "\u2708\ufe0f" },
  accommodation: { color: "#0ea5e9", label: "Stay", emoji: "\ud83c\udfe8" },
  activity: { color: "#10b981", label: "Activity", emoji: "\u2b50" },
  dining: { color: "#f97316", label: "Dining", emoji: "\ud83c\udf7d\ufe0f" },
  transport: { color: "#8b5cf6", label: "Transport", emoji: "\ud83d\ude8c" },
};

// ── Geocoding cache (persists across re-renders within session) ──
const geocodeCache = {};

async function geocode(query) {
  if (!query || query.trim().length < 2) return null;
  const key = query.trim().toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];
  // Special handling for airport codes (3 letters)
  const airportQuery = query.match(/^[A-Z]{3}$/) ? `${query} airport` : query;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(airportQuery)}`,
      { headers: { "User-Agent": "TripCraft/1.0" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
      geocodeCache[key] = result;
      return result;
    }
  } catch (err) {
    console.error("Geocode error:", err);
  }
  return null;
}

// ── Create colored SVG marker icon ──
function createIcon(color, emoji) {
  if (typeof window === "undefined") return null;
  const L = require("leaflet");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
    <text x="16" y="20" text-anchor="middle" font-size="12">${emoji}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: "",
  });
}

// ── Collect location queries from all trip data ──
function collectLocations(flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions) {
  const locations = [];

  // Flights — origin and destination airports
  const selectedFlight = (flightOptions || []).find(f => f.is_selected);
  if (selectedFlight?.flight_legs) {
    const legs = selectedFlight.flight_legs;
    const outbound = legs.filter(l => l.direction === "outbound");
    const returnLegs = legs.filter(l => l.direction === "return");

    if (outbound.length > 0) {
      const first = outbound[0];
      const last = outbound[outbound.length - 1];
      if (first.departure_airport) {
        locations.push({ type: "flight", query: first.departure_airport, name: `Depart: ${first.departure_airport}`, detail: first.airline_name || "" });
      }
      if (last.arrival_airport) {
        locations.push({ type: "flight", query: last.arrival_airport, name: `Arrive: ${last.arrival_airport}`, detail: last.airline_name || "" });
      }
    }
    if (returnLegs.length > 0) {
      const last = returnLegs[returnLegs.length - 1];
      if (last.arrival_airport && !locations.some(l => l.query === last.arrival_airport)) {
        locations.push({ type: "flight", query: last.arrival_airport, name: `Return: ${last.arrival_airport}`, detail: "" });
      }
    }
  }

  // Accommodation
  (accommodationOptions || []).filter(a => a.is_selected).forEach(a => {
    const query = a.address || a.location_name || a.name;
    if (query) locations.push({ type: "accommodation", query, name: a.name || "Accommodation", detail: a.location_name || "" });
  });

  // Activities
  (activityOptions || []).filter(a => a.is_selected).forEach(a => {
    const query = a.address || a.location_name || a.name;
    if (query) locations.push({ type: "activity", query, name: a.name || "Activity", detail: a.location_name || "" });
  });

  // Dining
  (diningOptions || []).filter(d => d.is_selected).forEach(d => {
    const query = d.address || d.location_name || d.name;
    if (query) locations.push({ type: "dining", query, name: d.name || "Restaurant", detail: d.location_name || "" });
  });

  // Transport — pickup and dropoff
  (transportOptions || []).filter(t => t.is_selected).forEach(t => {
    if (t.pickup_location) {
      locations.push({ type: "transport", query: t.pickup_location, name: `Pickup: ${t.name || "Transport"}`, detail: t.pickup_location });
    }
    if (t.dropoff_location && t.dropoff_location !== t.pickup_location) {
      locations.push({ type: "transport", query: t.dropoff_location, name: `Dropoff: ${t.name || "Transport"}`, detail: t.dropoff_location });
    }
  });

  return locations;
}

export default function TripMap({ tripDestination, flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState("all");
  const [mapReady, setMapReady] = useState(false);
  const geocodingRef = useRef(false);

  // Import leaflet CSS on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Inject Leaflet CSS if not already present
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    setMapReady(true);
  }, []);

  // Collect all locations
  const locations = useMemo(() =>
    collectLocations(flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions),
    [flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions]
  );

  // Geocode all locations
  useEffect(() => {
    if (locations.length === 0 || geocodingRef.current) {
      setLoading(false);
      return;
    }

    geocodingRef.current = true;
    let cancelled = false;

    async function geocodeAll() {
      const results = [];
      for (const loc of locations) {
        if (cancelled) return;
        const coords = await geocode(loc.query);
        if (coords) {
          results.push({ ...loc, lat: coords.lat, lng: coords.lng });
        }
        // Small delay to respect Nominatim rate limit (1 req/sec)
        await new Promise(r => setTimeout(r, 350));
      }
      if (!cancelled) {
        setPins(results);
        setLoading(false);
        geocodingRef.current = false;
      }
    }

    geocodeAll();
    return () => { cancelled = true; geocodingRef.current = false; };
  }, [locations]);

  // Re-geocode when locations change
  useEffect(() => {
    geocodingRef.current = false;
  }, [flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions]);

  // Calculate map bounds
  const filteredPins = filter === "all" ? pins : pins.filter(p => p.type === filter);
  const bounds = filteredPins.length > 0
    ? filteredPins.map(p => [p.lat, p.lng])
    : null;

  // Default center: trip destination or world center
  const defaultCenter = [13.7563, 100.5018]; // Bangkok fallback

  // Flight lines (connect departure → arrival)
  const flightPins = pins.filter(p => p.type === "flight");
  const flightLines = [];
  if (flightPins.length >= 2) {
    for (let i = 0; i < flightPins.length - 1; i++) {
      flightLines.push([[flightPins[i].lat, flightPins[i].lng], [flightPins[i + 1].lat, flightPins[i + 1].lng]]);
    }
  }

  // Count by type
  const typeCounts = {};
  pins.forEach(p => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });

  const hasData = pins.length > 0;
  const hasPicked = locations.length > 0;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Trip Map
          {hasData && <span className="text-xs font-medium text-slate-400 ml-1">({pins.length} locations)</span>}
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          {collapsed ? "Show" : "Hide"}
          <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          {/* Filter bar */}
          {hasData && (
            <div className="px-4 py-2.5 border-b border-slate-100 flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  filter === "all" ? "bg-teal-100 text-teal-700" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                All ({pins.length})
              </button>
              {Object.entries(PIN_CONFIG).map(([key, cfg]) => {
                const count = typeCounts[key];
                if (!count) return null;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      filter === key ? "bg-teal-100 text-teal-700" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {cfg.emoji} {cfg.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Map */}
          <div className="relative" style={{ height: 400 }}>
            {loading && (
              <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-sm text-teal-600">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Locating trip pins...
                </div>
              </div>
            )}

            {!hasPicked && !loading && (
              <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-10">
                <div className="text-center">
                  <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <p className="text-sm text-slate-400">No picked items with locations yet</p>
                  <p className="text-xs text-slate-300 mt-1">Pick flights, stays, activities, or dining to see them on the map</p>
                </div>
              </div>
            )}

            {mapReady && (
              <MapInner
                pins={filteredPins}
                bounds={bounds}
                defaultCenter={defaultCenter}
                flightLines={filter === "all" || filter === "flight" ? flightLines : []}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inner map component (only rendered client-side) ──
function MapInner({ pins, bounds, defaultCenter, flightLines }) {
  const mapRef = useRef(null);

  // Fit bounds when pins change
  useEffect(() => {
    if (mapRef.current && bounds && bounds.length > 0) {
      try {
        const L = require("leaflet");
        const leafletBounds = L.latLngBounds(bounds);
        mapRef.current.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 14 });
      } catch (_) {}
    }
  }, [bounds]);

  const icons = useMemo(() => {
    const result = {};
    Object.entries(PIN_CONFIG).forEach(([key, cfg]) => {
      result[key] = createIcon(cfg.color, cfg.emoji);
    });
    return result;
  }, []);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Flight route lines */}
      {flightLines.map((line, i) => (
        <Polyline
          key={`flight-line-${i}`}
          positions={line}
          color="#3b82f6"
          weight={2}
          opacity={0.6}
          dashArray="8 6"
        />
      ))}

      {/* Pins */}
      {pins.map((pin, i) => (
        icons[pin.type] ? (
          <Marker key={`${pin.type}-${i}`} position={[pin.lat, pin.lng]} icon={icons[pin.type]}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-slate-800">{pin.name}</div>
                {pin.detail && <div className="text-slate-500 text-xs">{pin.detail}</div>}
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}
