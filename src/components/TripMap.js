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

// ── Pin category config — colors from centralized system, SVG icons match itinerary tabs ──
const PIN_CONFIG = {
  flight: {
    color: CATEGORY_COLORS.flight.hex, label: "Flights", emoji: "✈️",
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" /></svg>,
  },
  accommodation: {
    color: CATEGORY_COLORS.accommodation.hex, label: "Stays", emoji: "🏨",
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z" /></svg>,
  },
  activity: {
    color: CATEGORY_COLORS.activity.hex, label: "Activities", emoji: "⭐",
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.147 0l4.084-1.69A1.5 1.5 0 0 0 18 14.75V3.873a1.5 1.5 0 0 0-2.074-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>,
  },
  dining: {
    color: CATEGORY_COLORS.dining.hex, label: "Dining", emoji: "🍽️",
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z" /></svg>,
  },
  transport: {
    color: CATEGORY_COLORS.transport.hex, label: "Transport", emoji: "🚌",
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
  },
};

// ── Route view accent color — terracotta (matches style guide primary) ──
const ROUTE_ACCENT = "#da7b4a";
const ROUTE_ACCENT_DARK = "#b5552a";

// ── Map tile styles ──
const TILE_STYLES = {
  voyager: { label: "Voyager", url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>' },
  positron: { label: "Positron", url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>' },
  tonerLite: { label: "Toner Lite", url: "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png", attr: '&copy; <a href="https://stamen.com">Stamen</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' },
};

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
function collectLocations(flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions, itinerarySelections) {
  const locations = [];
  const selections = itinerarySelections || [];
  const isSelected = (type, id) => selections.some(s => s.option_type === type && s.option_id === id);

  // Flights (supports multiple selected flight options)
  const selectedFlights = (flightOptions || []).filter(f => isSelected("flight", f.id));
  for (const selectedFlight of selectedFlights) {
    if (!selectedFlight?.flight_legs) continue;
    const legs = selectedFlight.flight_legs;
    const outbound = legs.filter(l => l.direction === "outbound");
    const returnLegs = legs.filter(l => l.direction === "return");

    // Determine the home/origin airport so we can exclude it from pins
    const homeAirport = outbound.length > 0 ? outbound[0].departure_airport : null;

    if (outbound.length > 0) {
      const first = outbound[0];
      const last = outbound[outbound.length - 1];
      // Skip origin (home) airport — only show destination arrival
      if (last.arrival_airport && !locations.some(l => l.query === last.arrival_airport && l.date === (last.departure_date || first.departure_date))) {
        locations.push({ type: "flight", query: last.arrival_airport, name: `Arrive: ${last.arrival_airport}`, detail: last.airline_name || "", date: last.departure_date || first.departure_date || null });
      }
    }
    if (returnLegs.length > 0) {
      const first = returnLegs[0];
      const last = returnLegs[returnLegs.length - 1];
      // Show return departure (destination) but skip return arrival (home)
      if (first.departure_airport && first.departure_airport !== homeAirport && !locations.some(l => l.query === first.departure_airport && l.date === first.departure_date)) {
        locations.push({ type: "flight", query: first.departure_airport, name: `Return depart: ${first.departure_airport}`, detail: first.airline_name || "", date: first.departure_date || null });
      }
      // Skip home arrival airport
    }
  }

  // Accommodation — assign to check_in_date
  (accommodationOptions || []).filter(a => isSelected("accommodation", a.id)).forEach(a => {
    const query = a.address || a.location_name || a.name;
    if (query) locations.push({ type: "accommodation", query, name: a.name || "Stay", detail: a.location_name || "", date: a.check_in_date || null, endDate: a.check_out_date || null });
  });

  // Activities — scheduled_date
  (activityOptions || []).filter(a => isSelected("activity", a.id)).forEach(a => {
    const query = a.address || a.location_name || a.name;
    if (query) locations.push({ type: "activity", query, name: a.name || "Activity", detail: a.location_name || "", date: a.scheduled_date || null });
  });

  // Dining — scheduled_date
  (diningOptions || []).filter(d => isSelected("dining", d.id)).forEach(d => {
    const query = d.address || d.location_name || d.name;
    if (query) locations.push({ type: "dining", query, name: d.name || "Restaurant", detail: d.location_name || "", date: d.scheduled_date || null });
  });

  // Transport — departure_date
  (transportOptions || []).filter(t => isSelected("transportation", t.id)).forEach(t => {
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

export default function TripMap({ tripDestination, tripStart, tripEnd, flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions, itinerarySelections }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("pins"); // "pins" | "route"
  const [filter, setFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  const [mapReady, setMapReady] = useState(false);
  const [tileStyle, setTileStyle] = useState("voyager");
  const geocodingRef = useRef(false);

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

  // Collect all locations — filtered by itinerary selections
  const locations = useMemo(() =>
    collectLocations(flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions, itinerarySelections),
    [flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions, itinerarySelections]
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

  useEffect(() => { geocodingRef.current = false; }, [flightOptions, accommodationOptions, activityOptions, diningOptions, transportOptions, itinerarySelections]);

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

  // Route view: which pins to show — all use standard terracotta accent
  const routeViewData = useMemo(() => {
    if (selectedDay === "all") {
      const allDayPins = [];
      const routes = [];
      const sortedDates = Object.keys(dayGroups).sort();

      sortedDates.forEach((date, dayIdx) => {
        const dayPins = dayGroups[date];
        dayPins.forEach((pin, pinIdx) => {
          allDayPins.push({ ...pin, dayColor: ROUTE_ACCENT, dayIndex: dayIdx + 1, stepIndex: pinIdx + 1 });
        });
        if (dayPins.length >= 2) {
          const coords = dayPins.map(p => [p.lat, p.lng]);
          routes.push({ positions: coords, color: ROUTE_ACCENT, dayIndex: dayIdx + 1 });
        }
      });

      // Connect last pin of each day to first pin of next day
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const todayPins = dayGroups[sortedDates[i]];
        const tomorrowPins = dayGroups[sortedDates[i + 1]];
        if (todayPins.length > 0 && tomorrowPins.length > 0) {
          const lastToday = todayPins[todayPins.length - 1];
          const firstTomorrow = tomorrowPins[0];
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
      const dayIdx = tripDates.indexOf(selectedDay);
      const dayPins = (dayGroups[selectedDay] || []).map((pin, i) => ({
        ...pin, dayColor: ROUTE_ACCENT, dayIndex: dayIdx + 1, stepIndex: i + 1,
      }));
      const routes = [];
      if (dayPins.length >= 2) {
        routes.push({ positions: dayPins.map(p => [p.lat, p.lng]), color: ROUTE_ACCENT });
      }
      return { pins: dayPins, routes };
    }
  }, [dayGroups, selectedDay, tripDates]);

  // Bounds for current view
  const activePins = viewMode === "pins" ? pinViewPins : routeViewData.pins;
  const bounds = activePins.length > 0 ? activePins.map(p => [p.lat, p.lng]) : null;

  // Stable serialized key so useEffect can detect real changes (include viewMode + filter to re-center on toggle)
  const boundsKey = `${viewMode}:${filter}:${selectedDay}:` + (bounds ? bounds.map(b => `${b[0].toFixed(5)},${b[1].toFixed(5)}`).join("|") : "");

  // Default center: use pin centroid if available, otherwise world center
  const defaultCenter = useMemo(() => {
    if (pins.length > 0) {
      const avgLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
      const avgLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
      return [avgLat, avgLng];
    }
    return [20, 0]; // neutral world center
  }, [pins]);

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
    <div>
        <div className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          {/* Filter bar + view mode toggle — always visible when data exists */}
          {hasData && (
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
              {/* View mode toggle */}
              <div className="flex bg-slate-100 rounded-lg p-0.5 mr-2 flex-shrink-0">
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

              {/* PINS VIEW: category filters */}
              {viewMode === "pins" && (
                <>
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      filter === "all" ? "bg-stone-200 text-stone-800" : "text-stone-500 hover:bg-stone-100"
                    }`}
                  >
                    All ({pins.length})
                  </button>
                  {Object.entries(PIN_CONFIG).map(([key, cfg]) => {
                    const count = typeCounts[key];
                    if (!count) return null;
                    const isActive = filter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          isActive ? "text-stone-800" : "text-stone-500 hover:bg-stone-100"
                        }`}
                        style={isActive ? { backgroundColor: `${cfg.color}20`, color: cfg.color } : {}}
                      >
                        <span style={{ color: isActive ? cfg.color : undefined }}>{cfg.icon}</span>
                        {cfg.label} ({count})
                      </button>
                    );
                  })}
                </>
              )}

              {/* Tile style selector — right-justified */}
              <select
                value={tileStyle}
                onChange={(e) => setTileStyle(e.target.value)}
                className="ml-auto flex-shrink-0 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-100 transition-colors outline-none"
              >
                {Object.entries(TILE_STYLES).map(([key, style]) => (
                  <option key={key} value={key}>{style.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* ROUTE VIEW: mini-calendar day selector */}
          {viewMode === "route" && hasData && tripDates.length > 0 && (
            <RouteDayCalendar
              tripDates={tripDates}
              daysWithPins={daysWithPins}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              routeViewData={routeViewData}
            />
          )}

          {/* Map */}
          <div className="relative" style={{ height: 500 }}>
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
                viewMode={viewMode}
                pins={viewMode === "pins" ? pinViewPins : routeViewData.pins}
                routes={viewMode === "route" ? routeViewData.routes : []}
                bounds={bounds}
                boundsKey={boundsKey}
                defaultCenter={defaultCenter}
                flightLines={viewMode === "pins" && (filter === "all" || filter === "flight") ? flightLines : []}
                tileStyle={tileStyle}
              />
            )}
          </div>
        </div>
    </div>
  );
}

// ── Route day mini-calendar ──
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function RouteDayCalendar({ tripDates, daysWithPins, selectedDay, onSelectDay, routeViewData }) {
  if (tripDates.length === 0) return null;

  // Build grid from first trip date's week Sunday to last trip date's week Saturday
  const firstDate = new Date(tripDates[0] + "T00:00:00");
  const lastDate = new Date(tripDates[tripDates.length - 1] + "T00:00:00");

  const gridStart = new Date(firstDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(lastDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const tripDateSet = new Set(tripDates);

  const gridDates = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    gridDates.push(new Date(d));
  }

  const weeks = [];
  for (let i = 0; i < gridDates.length; i += 7) {
    weeks.push(gridDates.slice(i, i + 7));
  }

  return (
    <div className="border-b border-slate-100 px-4 py-2.5">
      <div className="flex items-start gap-4">
        {/* All Days button */}
        <button
          onClick={() => onSelectDay("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors mt-4 ${
            selectedDay === "all"
              ? "text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          style={selectedDay === "all" ? { backgroundColor: ROUTE_ACCENT } : {}}
        >
          All Days
        </button>

        {/* Mini calendar grid */}
        <div className="flex-1 max-w-[264px]">
          {/* Weekday header bar */}
          <div className="grid grid-cols-7 rounded-full border px-1.5 py-1 mb-1.5 bg-orange-50 border-orange-200">
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold uppercase leading-tight text-orange-600">
                {d}
              </div>
            ))}
          </div>

          {/* Week rows */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1.5 mb-1.5">
              {week.map((d) => {
                const dateStr = d.toISOString().split("T")[0];
                const isTripDate = tripDateSet.has(dateStr);
                const isSelected = selectedDay === dateStr;
                const hasPins = daysWithPins.includes(dateStr);
                const dayNum = d.getDate();

                if (!isTripDate) {
                  return <div key={dateStr} className="w-[31px] h-[31px]" />;
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => onSelectDay(dateStr)}
                    className={`w-[31px] h-[31px] rounded-md border shadow-sm flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "text-white shadow-md ring-1 ring-orange-700/20"
                        : hasPins
                          ? "bg-white border-stone-200 text-stone-700 hover:bg-orange-50 hover:border-orange-300"
                          : "bg-white border-stone-100 text-stone-300"
                    }`}
                    style={isSelected ? { backgroundColor: ROUTE_ACCENT } : {}}
                    title={d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  >
                    <span className="text-[11px] font-semibold leading-none">{dayNum}</span>
                    {hasPins && !isSelected && (
                      <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: ROUTE_ACCENT }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Route legend for selected day */}
      {selectedDay !== "all" && routeViewData.pins.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {routeViewData.pins.map((pin, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: ROUTE_ACCENT }}>
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
  );
}

// ── Inner map component ──
function MapInner({ viewMode, pins, routes, bounds, boundsKey, defaultCenter, flightLines, tileStyle }) {
  const mapRef = useRef(null);

  // Fit bounds whenever the active pins change (stable key prevents false positives)
  useEffect(() => {
    if (mapRef.current && bounds && bounds.length > 0) {
      try {
        const L = require("leaflet");
        const leafletBounds = L.latLngBounds(bounds);
        mapRef.current.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 14 });
      } catch (_) {}
    }
  }, [boundsKey]);

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
        key={tileStyle}
        attribution={TILE_STYLES[tileStyle].attr}
        url={TILE_STYLES[tileStyle].url}
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
