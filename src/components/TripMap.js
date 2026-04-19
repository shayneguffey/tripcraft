"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";

// ── Dynamically import map components (Leaflet requires window) ──
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });
import CATEGORY_COLORS from "@/lib/categoryColors";

// ── Pin category config — colors from centralized system ──
const PIN_CONFIG = {
  flight: { color: CATEGORY_COLORS.flight.hex, label: "Flight", emoji: "\u2708\ufe0f" },
  accommodation: { color: CATEGORY_COLORS.accommodation.hex, label: "Stay", emoji: "\ud83c\udfe8" },
  activity: { color: CATEGORY_COLORS.activity.hex, label: "Activity", emoji: "\u2b50" },
  dining: { color: CATEGORY_COLORS.dining.hex, label: "Dining", emoji: "\ud83c\udf7d\ufe0f" },
  transport: { color: CATEGORY_COLORS.transport.hex, label: "Transport", emoji: "\ud83d\ude8c" },
};

// ── Day colors for route view (cycle through these) ──
const DAY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6",
  "#a855f7", "#6366f1", "#0ea5e9", "#84cc16", "#f59e0b",
];

// ── Geocoding cache ──
const geocodeCache = {};

async function geocode(query) {
  if (!query || query.trim().length < 2) return null;
  const key = query.trim().toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];
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

// ── Create numbered day marker ──
function createNumberedIcon(color, number) {
  if (typeof window === "undefined") return null;
  const L = require("leaflet");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="14" r="10" fill="white" opacity="0.9"/>
    <text x="16" y="18" text-anchor="middle" font-size="11" font-weight="bold" fill="${color}">${number}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: "",
  });
}

// ── Collect locations with date assignments for BOTH views ──
function collectLocations(flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions) {
  const locations = [];

  // Flights (supports multiple selected flight options)
  const selectedFlights = (flightOptions || []).filter(f => f.is_selected);
  for (const selectedFlight of selectedFlights) {
    if (!selectedFlight?.flight_legs) continue;
    const legs = selectedFlight.flight_legs;
    const outbound = legs.filter(l => l.direction === "outbound");
    const returnLegs = legs.filter(l => l.direction === "return");

    if (outbound.length > 0) {
      const first = outbound[0];
      const last = outbound[outbound.length - 1];
      if (first.departure_airport && !locations.some(l => l.query === first.departure_airport && l.date === first.departure_date)) {
        locations.push({ type: "flight", query: first.departure_airport, name: `Depart: ${first.departure_airport}`, detail: first.airline_name || "", date: first.departure_date || null });
      }
      if (last.arrival_airport && !locations.some(l => l.query === last.arrival_airport && l.date === (last.departure_date || first.departure_date))) {
        locations.push({ type: "flight", query: last.arrival_airport, name: `Arrive: ${last.arrival_airport}`, detail: last.airline_name || "", date: last.departure_date || first.departure_date || null });
      }
    }
    if (returnLegs.length > 0) {
      const first = returnLegs[0];
      const last = returnLegs[returnLegs.length - 1];
      if (first.departure_airport && !locations.some(l => l.query === first.departure_airport && l.date === first.departure_date)) {
        locations.push({ type: "flight", query: first.departure_airport, name: `Return depart: ${first.departure_airport}`, detail: first.airline_name || "", date: first.departure_date || null });
      }
      if (last.arrival_airport && !locations.some(l => l.query === last.arrival_airport && l.date === last.departure_date)) {
        locations.push({ type: "flight", query: last.arrival_airport, name: `Return arrive: ${last.arrival_airport}`, detail: "", date: last.departure_date || null });
      }
    }
  }

  // Accommodation — assign to check_in_date
  (accommodationOptions || []).filter(a => a.is_selected).forEach(a => {
    const query = a.address || a.location_name || a.name;
    if (query) locations.push({ type: "accommodation", query, name: a.name || "Accommodation", detail: a.location_name || "", date: a.check_in_date || null, endDate: a.check_out_date || null });
  });

  // Activities — scheduled_date
  (activityOptions || []).filter(a => a.is_selected).forEach(a => {
    const query = a.address || a.location_name || a.name;
    if (query) locations.push({ type: "activity", query, name: a.name || "Activity", detail: a.location_name || "", date: a.scheduled_date || null });
  });

  // Dining — scheduled_date
  (diningOptions || []).filter(d => d.is_selected).forEach(d => {
    const query = d.address || d.location_name || d.name;
    if (query) locations.push({ type: "dining", query, name: d.name || "Restaurant", detail: d.location_name || "", date: d.scheduled_date || null });
  });

  // Transport — departure_date
  (transportOptions || []).filter(t => t.is_selected).forEach(t => {
    if (t.pickup_location) {
      locations.push({ type: "transport", query: t.pickup_location, name: `Pickup: ${t.name || "Transport"}`, detail: t.pickup_location, date: t.departure_date || null });
    }
    if (t.dropoff_location && t.dropoff_location !== t.pickup_location) {
      locations.push({ type: "transport", query: t.dropoff_location, name: `Dropoff: ${t.name || "Transport"}`, detail: t.dropoff_location, date: t.arrival_date || t.departure_date || null });
    }
  });

  return locations;
}

// ── Generate list of trip dates ──
function getTripDates(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const dates = [];
  const current = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayOfWeek(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function TripMap({ tripDestination, tripStart, tripEnd, flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("pins"); // "pins" | "route"
  const [filter, setFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  const [mapReady, setMapReady] = useState(false);
  const geocodingRef = useRef(false);
  const dayStripRef = useRef(null);

  // Leaflet CSS
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    setMapReady(true);
  }, []);

  // Trip dates
  const tripDates = useMemo(() => getTripDates(tripStart, tripEnd), [tripStart, tripEnd]);

  // Collect all locations
  const locations = useMemo(() =>
    collectLocations(flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions),
    [flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions]
  );

  // Geocode
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

  useEffect(() => { geocodingRef.current = false; }, [flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions]);

  // ── PINS VIEW: filter by category ──
  const pinViewPins = filter === "all" ? pins : pins.filter(p => p.type === filter);

  // ── ROUTE VIEW: group pins by date, build day routes ──
  const dayGroups = useMemo(() => {
    const groups = {};
    pins.forEach(pin => {
      if (!pin.date) return;
      // For accommodation, add to every day it spans
      if (pin.type === "accommodation" && pin.endDate) {
        const start = new Date(pin.date + "T00:00:00");
        const end = new Date(pin.endDate + "T00:00:00");
        const cur = new Date(start);
        while (cur < end) {
          const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(pin);
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        if (!groups[pin.date]) groups[pin.date] = [];
        groups[pin.date].push(pin);
      }
    });
    return groups;
  }, [pins]);

  // Route view: which pins to show
  const routeViewData = useMemo(() => {
    if (selectedDay === "all") {
      // Show all days with color-coded routes
      const allDayPins = [];
      const routes = [];
      const sortedDates = Object.keys(dayGroups).sort();

      sortedDates.forEach((date, dayIdx) => {
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
        const dayPins = dayGroups[date];
        dayPins.forEach((pin, pinIdx) => {
          allDayPins.push({ ...pin, dayColor: color, dayIndex: dayIdx + 1, stepIndex: pinIdx + 1 });
        });
        // Connect pins within this day
        if (dayPins.length >= 2) {
          const coords = dayPins.map(p => [p.lat, p.lng]);
          routes.push({ positions: coords, color, dayIndex: dayIdx + 1 });
        }
      });

      // Also connect last pin of each day to first pin of next day (travel between days)
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const todayPins = dayGroups[sortedDates[i]];
        const tomorrowPins = dayGroups[sortedDates[i + 1]];
        if (todayPins.length > 0 && tomorrowPins.length > 0) {
          const lastToday = todayPins[todayPins.length - 1];
          const firstTomorrow = tomorrowPins[0];
          // Only draw inter-day line if locations are different
          if (Math.abs(lastToday.lat - firstTomorrow.lat) > 0.001 || Math.abs(lastToday.lng - firstTomorrow.lng) > 0.001) {
            routes.push({
              positions: [[lastToday.lat, lastToday.lng], [firstTomorrow.lat, firstTomorrow.lng]],
              color: "#94a3b8",
              dashed: true,
            });
          }
        }
      }

      return { pins: allDayPins, routes };
    } else {
      // Single day
      const dayIdx = tripDates.indexOf(selectedDay);
      const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
      const dayPins = (dayGroups[selectedDay] || []).map((pin, i) => ({
        ...pin, dayColor: color, dayIndex: dayIdx + 1, stepIndex: i + 1,
      }));
      const routes = [];
      if (dayPins.length >= 2) {
        routes.push({ positions: dayPins.map(p => [p.lat, p.lng]), color });
      }
      return { pins: dayPins, routes };
    }
  }, [dayGroups, selectedDay, tripDates]);

  // Bounds for current view
  const activePins = viewMode === "pins" ? pinViewPins : routeViewData.pins;
  const bounds = activePins.length > 0 ? activePins.map(p => [p.lat, p.lng]) : null;

  const defaultCenter = [13.7563, 100.5018];

  // Flight lines for pin view
  const flightPins = pins.filter(p => p.type === "flight");
  const flightLines = [];
  if (flightPins.length >= 2) {
    for (let i = 0; i < flightPins.length - 1; i++) {
      flightLines.push([[flightPins[i].lat, flightPins[i].lng], [flightPins[i + 1].lat, flightPins[i + 1].lng]]);
    }
  }

  // Counts
  const typeCounts = {};
  pins.forEach(p => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });

  const daysWithPins = Object.keys(dayGroups).filter(d => tripDates.includes(d));

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
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          {hasData && (
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("pins")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "pins" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Pins
              </button>
              <button
                onClick={() => setViewMode("route")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "route" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Route
              </button>
            </div>
          )}
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
      </div>

      {!collapsed && (
        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          {/* PINS VIEW: category filter bar */}
          {viewMode === "pins" && hasData && (
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

          {/* ROUTE VIEW: day selector strip */}
          {viewMode === "route" && hasData && tripDates.length > 0 && (
            <div className="border-b border-slate-100">
              <div ref={dayStripRef} className="flex gap-1 px-4 py-2.5 overflow-x-auto">
                <button
                  onClick={() => setSelectedDay("all")}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedDay === "all"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Days
                </button>
                {tripDates.map((date, i) => {
                  const hasPins = daysWithPins.includes(date);
                  const color = DAY_COLORS[i % DAY_COLORS.length];
                  const isSelected = selectedDay === date;
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDay(date)}
                      className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? "text-white shadow-sm"
                          : hasPins
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-slate-50 text-slate-300"
                      }`}
                      style={isSelected ? { backgroundColor: color } : {}}
                    >
                      <span className="font-bold">Day {i + 1}</span>
                      <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                        {getDayOfWeek(date)} {formatShortDate(date)}
                      </span>
                      {hasPins && !isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: color }} />
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Route legend for selected day */}
              {selectedDay !== "all" && routeViewData.pins.length > 0 && (
                <div className="px-4 pb-2.5 flex flex-wrap gap-2">
                  {routeViewData.pins.map((pin, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: pin.dayColor }}>
                        {pin.stepIndex}
                      </span>
                      <span>{PIN_CONFIG[pin.type]?.emoji} {pin.name}</span>
                      {i < routeViewData.pins.length - 1 && (
                        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map */}
          <div className="relative" style={{ height: 420 }}>
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
                key={viewMode} // force remount on view change for clean state
                viewMode={viewMode}
                pins={viewMode === "pins" ? pinViewPins : routeViewData.pins}
                routes={viewMode === "route" ? routeViewData.routes : []}
                bounds={bounds}
                defaultCenter={defaultCenter}
                flightLines={viewMode === "pins" && (filter === "all" || filter === "flight") ? flightLines : []}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inner map component ──
function MapInner({ viewMode, pins, routes, bounds, defaultCenter, flightLines }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && bounds && bounds.length > 0) {
      try {
        const L = require("leaflet");
        const leafletBounds = L.latLngBounds(bounds);
        mapRef.current.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 14 });
      } catch (_) {}
    }
  }, [bounds]);

  const categoryIcons = useMemo(() => {
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

      {/* PINS VIEW: flight route lines */}
      {flightLines.map((line, i) => (
        <Polyline key={`fl-${i}`} positions={line} color={CATEGORY_COLORS.flight.hex} weight={2} opacity={0.6} dashArray="8 6" />
      ))}

      {/* ROUTE VIEW: day route lines */}
      {routes.map((route, i) => (
        <Polyline
          key={`route-${i}`}
          positions={route.positions}
          color={route.color}
          weight={route.dashed ? 2 : 3}
          opacity={route.dashed ? 0.4 : 0.7}
          dashArray={route.dashed ? "6 8" : undefined}
        />
      ))}

      {/* Pins */}
      {pins.map((pin, i) => {
        // Route view: use numbered icons
        const icon = viewMode === "route" && pin.dayColor
          ? createNumberedIcon(pin.dayColor, pin.stepIndex)
          : categoryIcons[pin.type];

        if (!icon) return null;

        return (
          <Marker key={`pin-${viewMode}-${i}`} position={[pin.lat, pin.lng]} icon={icon}>
            <Popup>
              <div className="text-sm min-w-[140px]">
                {viewMode === "route" && (
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    Step {pin.stepIndex}{pin.date ? ` \u2022 ${formatShortDate(pin.date)}` : ""}
                  </div>
                )}
                <div className="font-bold text-slate-800">{pin.name}</div>
                {pin.detail && <div className="text-slate-500 text-xs">{pin.detail}</div>}
                <div className="text-[10px] text-slate-400 mt-0.5">{PIN_CONFIG[pin.type]?.emoji} {PIN_CONFIG[pin.type]?.label}</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
