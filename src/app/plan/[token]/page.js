"use client";

/* ══════════════════════════════════════════════════════════════════
   Trip Plan — printable, shareable PDF view of an itinerary.

   Three-part document with a vintage WPA-poster aesthetic:
     1. Presentation — banner, title, pitch, TripCraft logo (top-right, white)
     2. Trip-at-a-glance — vertical spine timeline + side route map
     3. Trip Details — per-day pages: events column + 2-image column
                       budget summary as the final page

   Inline editing: pitch and per-day summaries are editable for trip owners
   and accepted collaborators. Anonymous viewers get read-only.
   ══════════════════════════════════════════════════════════════════ */

import { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FlightPathLoader from "@/components/FlightPathLoader";

function formatLong(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}
function formatShort(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}
function formatWeekday(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
}
function formatWeekdayShort(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
}
function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
function formatTimeRange(s, e) {
  if (!s) return "";
  if (!e) return formatTime(s);
  return `${formatTime(s)} – ${formatTime(e)}`;
}
function formatMoney(amount, currency) {
  if (amount == null || amount === "") return "";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${sym}${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function formatDuration(mins) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
function getDaysBetween(start, end) {
  if (!start || !end) return [];
  const arr = [];
  const c = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (c <= last) {
    arr.push(c.toISOString().split("T")[0]);
    c.setDate(c.getDate() + 1);
  }
  return arr;
}
function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 1;
  const a = new Date(checkIn + "T00:00:00");
  const b = new Date(checkOut + "T00:00:00");
  return Math.max(1, Math.round((b - a) / 86400000));
}

const CAT_COLORS = {
  flight: "#7e9b5b",
  stay: "#4a7787",
  activity: "#d4a574",
  dining: "#c8624c",
  transport: "#6b5a8e",
};
const CAT_ICONS = {
  flight: "FLY",
  stay: "BED",
  activity: "★",
  dining: "EAT",
  transport: "GO",
};

export default function TripPlanPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  const [pitch, setPitch] = useState("");
  const [daySummaries, setDaySummaries] = useState({});
  const [mapImage, setMapImage] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/itinerary/${token}`);
        if (!res.ok) throw new Error("Trip not found");
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        setPitch(json.itinerary?.pitch || "");
        setMapImage(json.trip?.map_image || null);
        const sm = {};
        (json.days || []).forEach((d) => { if (d.summary) sm[d.date] = d.summary; });
        setDaySummaries(sm);

        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setCanEdit(false);
        } else if (user.id === json.trip.user_id) {
          setCanEdit(true);
        } else {
          const { data: collab } = await supabase
            .from("trip_collaborators")
            .select("id")
            .eq("trip_id", json.trip.id)
            .eq("user_id", user.id)
            .eq("status", "accepted")
            .maybeSingle();
          if (!cancelled) setCanEdit(!!collab);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function savePitch(next) {
    if (!data) return;
    setPitch(next);
    const { error: e } = await supabase
      .from("itineraries")
      .update({ pitch: next })
      .eq("id", data.itinerary.id);
    if (e) console.error("[plan] save pitch failed:", e.message);
  }
  async function saveDaySummary(date, next) {
    if (!data) return;
    setDaySummaries((prev) => ({ ...prev, [date]: next }));
    const existing = (data.days || []).find((d) => d.date === date);
    if (existing) {
      const { error: e } = await supabase.from("days").update({ summary: next }).eq("id", existing.id);
      if (e) console.error("[plan] update day summary failed:", e.message);
    } else {
      const { error: e } = await supabase.from("days").insert({ itinerary_id: data.itinerary.id, date, summary: next });
      if (e) console.error("[plan] insert day summary failed:", e.message);
    }
  }

  async function generateMap(force = false) {
    if (!data?.trip?.destination) return;
    setMapLoading(true);
    try {
      const res = await fetch("/api/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: data.trip.destination,
          tripId: data.trip.id,
          force,
        }),
      });
      if (!res.ok) throw new Error("Map generation failed");
      const json = await res.json();
      if (json.imageUrl) setMapImage(json.imageUrl);
    } catch (err) {
      console.error("[plan] generate map failed:", err);
    } finally {
      setMapLoading(false);
    }
  }

  if (loading) return <FlightPathLoader text="Loading your Trip Plan..." />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!data) return null;

  const { trip, itinerary, flights, accommodation, activities, dining, transportation, days, travelers = [] } = data;
  const startDate = itinerary.start_date || trip.start_date;
  const endDate = itinerary.end_date || trip.end_date;
  const allDates = getDaysBetween(startDate, endDate);
  // Number of travelers comes from the itinerary travelers list, fallback to itinerary.num_travelers, then 1.
  const numTravelers = Math.max(1, travelers.length || itinerary.num_travelers || 1);

  // Build per-day events with FULL detail.
  const daySchedule = allDates.map((date, idx) => {
    const dayRow = days.find((d) => d.date === date);
    const flightLegs = flights.flatMap((f) =>
      (f.legs || [])
        .filter((l) => l.departure_date === date)
        .map((leg) => ({ ...leg, _option: f }))
    );
    const stays = accommodation.filter((a) => a.check_in_date && date >= a.check_in_date && date < (a.check_out_date || a.check_in_date));
    const checkIns = accommodation.filter((a) => a.check_in_date === date);
    const checkOuts = accommodation.filter((a) => a.check_out_date === date);
    const dayActs = activities.filter((a) => a.scheduled_date === date);
    const dayDining = dining.filter((d) => d.scheduled_date === date);
    const dayTransport = transportation.filter((t) => t.departure_date === date || t.arrival_date === date);

    const events = [];

    // Flights — full leg detail with airline logo + dep/arr columns
    flightLegs.forEach((l) => {
      const opt = l._option || {};
      events.push({
        kind: "flight",
        time: l.departure_time?.slice(0, 5),
        timeEnd: l.arrival_time?.slice(0, 5),
        flightLeg: l,
        flightOption: opt,
        cost: opt.total_price,
        currency: opt.currency,
      });
    });

    // Accommodation - check-in
    checkIns.forEach((a) => {
      const nights = nightsBetween(a.check_in_date, a.check_out_date);
      const perNight = a.price_per_night || (a.total_price ? Number(a.total_price) / nights : null);
      const facts = [];
      if (a.room_type) facts.push({ k: "Room", v: a.room_type });
      if (a.bedrooms || a.bathrooms) {
        const parts = [];
        if (a.bedrooms) parts.push(`${a.bedrooms} bed`);
        if (a.bathrooms) parts.push(`${a.bathrooms} bath`);
        facts.push({ k: "Layout", v: parts.join(" · ") });
      }
      if (a.max_guests) facts.push({ k: "Sleeps", v: String(a.max_guests) });
      if (a.rating) facts.push({ k: "Rating", v: `${a.rating}★${a.review_count ? ` (${a.review_count})` : ""}` });
      if (perNight) facts.push({ k: "Per night", v: formatMoney(perNight, a.currency) });
      if (a.total_price) facts.push({ k: "Total", v: `${formatMoney(a.total_price, a.currency)} · ${nights} ${nights === 1 ? "night" : "nights"}` });
      if (a.cancellation_policy) facts.push({ k: "Cancellation", v: a.cancellation_policy });
      if (a.distance_info) facts.push({ k: "Distance", v: a.distance_info });
      if (a.provider) facts.push({ k: "Provider", v: a.provider });
      events.push({
        kind: "stay",
        time: null,
        label: `Check in: ${a.name}`,
        sub: a.location_name || null,
        address: a.address || null,
        amenities: a.amenities || null,
        description: a.description || null,
        facts,
        notes: a.notes || null,
        cost: perNight,
        costLabel: "/night",
        currency: a.currency,
      });
    });

    // Accommodation - midnights
    stays.forEach((a) => {
      if (a.check_in_date === date) return;
      const nights = nightsBetween(a.check_in_date, a.check_out_date);
      const perNight = a.price_per_night || (a.total_price ? Number(a.total_price) / nights : null);
      const dayIndex = Math.floor((new Date(date) - new Date(a.check_in_date)) / 86400000) + 1;
      events.push({
        kind: "stay",
        time: null,
        label: `Stay: ${a.name}`,
        sub: a.location_name ? `${a.location_name} · night ${dayIndex} of ${nights}` : `Night ${dayIndex} of ${nights}`,
        facts: [],
        notes: null,
        cost: perNight,
        costLabel: "/night",
        currency: a.currency,
      });
    });

    // Accommodation - check-out
    checkOuts.forEach((a) => {
      events.push({
        kind: "stay",
        time: null,
        label: `Check out: ${a.name}`,
        sub: a.location_name || null,
        facts: [],
        notes: null,
      });
    });

    // Activities
    dayActs.forEach((a) => {
      const facts = [];
      if (a.duration_minutes) facts.push({ k: "Duration", v: formatDuration(a.duration_minutes) });
      if (a.category) facts.push({ k: "Type", v: a.category });
      if (a.rating) facts.push({ k: "Rating", v: `${a.rating}★${a.review_count ? ` (${a.review_count})` : ""}` });
      if (a.provider) facts.push({ k: "Provider", v: a.provider });
      if (a.price) facts.push({ k: a.price_per === "per_group" ? "Group price" : "Per person", v: formatMoney(a.price, a.currency) });
      events.push({
        kind: "activity",
        time: a.start_time?.slice(0, 5),
        timeEnd: a.end_time?.slice(0, 5),
        label: a.name,
        sub: a.location_name || null,
        address: a.address || null,
        description: a.description || null,
        facts,
        notes: a.notes || null,
        cost: a.price,
        currency: a.currency,
      });
    });

    // Dining
    dayDining.forEach((d) => {
      const facts = [];
      if (d.cuisine_type && d.cuisine_type.toLowerCase() !== "other") facts.push({ k: "Cuisine", v: d.cuisine_type });
      if (d.meal_type) facts.push({ k: "Meal", v: d.meal_type });
      if (d.price_range) facts.push({ k: "Price", v: d.price_range });
      if (d.reservation_required) facts.push({ k: "Reservation", v: "Required" });
      if (d.dietary_options) facts.push({ k: "Dietary", v: d.dietary_options });
      if (d.known_for) facts.push({ k: "Known for", v: d.known_for });
      if (d.hours) facts.push({ k: "Hours", v: d.hours });
      if (d.rating) facts.push({ k: "Rating", v: `${d.rating}★${d.review_count ? ` (${d.review_count})` : ""}` });
      if (d.neighborhood) facts.push({ k: "Neighborhood", v: d.neighborhood });
      events.push({
        kind: "dining",
        time: d.start_time?.slice(0, 5),
        timeEnd: d.end_time?.slice(0, 5),
        label: d.name,
        sub: d.location_name || null,
        address: d.address || null,
        description: d.description || null,
        facts,
        notes: d.notes || null,
        cost: d.avg_meal_cost,
        currency: d.currency,
      });
    });

    // Transportation
    dayTransport.forEach((t) => {
      const isReturn = t.arrival_date === date && t.departure_date !== date;
      const facts = [];
      if (t.category) facts.push({ k: "Type", v: t.category.replace(/_/g, " ") });
      if (t.vehicle_type) facts.push({ k: "Vehicle", v: t.vehicle_type });
      if (t.class_type) facts.push({ k: "Class", v: t.class_type });
      if (t.duration_minutes) facts.push({ k: "Duration", v: formatDuration(t.duration_minutes) });
      if (t.passengers) facts.push({ k: "Passengers", v: String(t.passengers) });
      if (t.is_private != null && t.category !== "car_rental") facts.push({ k: "Mode", v: t.is_private ? "Private" : "Shared" });
      if (t.service_name) facts.push({ k: "Service", v: t.service_name });
      if (t.seat_number) facts.push({ k: "Seat", v: t.seat_number });
      if (t.platform_terminal) facts.push({ k: "Platform/Terminal", v: t.platform_terminal });
      if (t.driver_name) facts.push({ k: "Driver", v: t.driver_name });
      if (t.driver_phone) facts.push({ k: "Driver phone", v: t.driver_phone });
      if (t.boarding_deadline) facts.push({ k: "Boarding by", v: formatTime(t.boarding_deadline) });
      if (t.fuel_policy) facts.push({ k: "Fuel", v: t.fuel_policy });
      if (t.mileage_policy) facts.push({ k: "Mileage", v: t.mileage_policy });
      if (t.insurance_included) facts.push({ k: "Insurance", v: "Included" });
      if (t.additional_drivers) facts.push({ k: "Add’l drivers", v: t.additional_drivers });
      if (t.cancellation_policy) facts.push({ k: "Cancellation", v: t.cancellation_policy });
      if (t.booking_reference) facts.push({ k: "Confirmation", v: t.booking_reference });
      if (t.provider) facts.push({ k: "Provider", v: t.provider });
      if (t.vehicle_id) facts.push({ k: "Vehicle ID", v: t.vehicle_id });
      const pickupDropoff = [t.pickup_location, t.dropoff_location].filter(Boolean).join(" → ");
      events.push({
        kind: "transport",
        time: isReturn ? t.arrival_time?.slice(0, 5) : t.departure_time?.slice(0, 5),
        timeEnd: isReturn ? null : t.arrival_time?.slice(0, 5),
        label: isReturn ? `↩ Return: ${t.name}` : t.name,
        sub: pickupDropoff || null,
        meeting: t.meeting_instructions || null,
        description: t.description || null,
        facts,
        notes: t.notes || null,
        cost: isReturn ? null : t.price,
        currency: t.currency,
      });
    });

    const timed = events.filter((e) => e.time).sort((a, b) => a.time.localeCompare(b.time));
    const untimed = events.filter((e) => !e.time);

    return {
      date,
      dayNumber: idx + 1,
      title: dayRow?.title || null,
      summary: daySummaries[date] || dayRow?.summary || null,
      events: [...untimed, ...timed],
    };
  });

  // Budget rollup
  const flightTotal = flights.reduce((s, f) => s + (f.total_price ? Number(f.total_price) : 0), 0);
  const stayTotal = accommodation.reduce((s, a) => s + (a.total_price ? Number(a.total_price) : 0), 0);
  const actTotal = activities.reduce((s, a) => s + (a.price ? Number(a.price) : 0), 0) * numTravelers;
  const diningTotal = dining.reduce((s, d) => s + (d.avg_meal_cost ? Number(d.avg_meal_cost) : 0), 0) * numTravelers;
  const transTotal = transportation.reduce((s, t) => {
    const p = t.price ? Number(t.price) : 0;
    return s + (t.category === "car_rental" ? p : p * numTravelers);
  }, 0);
  const grandTotal = flightTotal + stayTotal + actTotal + diningTotal + transTotal;
  const budgetRows = [
    { name: "Flights", color: "#7e9b5b", amount: flightTotal },
    { name: "Stays", color: "#4a7787", amount: stayTotal },
    { name: "Transportation", color: "#6b5a8e", amount: transTotal },
    { name: "Dining", color: "#c8624c", amount: diningTotal },
    { name: "Activities", color: "#d4a574", amount: actTotal },
  ].filter((r) => r.amount > 0);
  const maxBudget = Math.max(1, ...budgetRows.map((r) => r.amount));

  const planningHref = `/trips/${trip.id}`;

  return (
    <div className="trip-plan">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lora:ital,wght@0,400;0,600;1,400&family=Oswald:wght@400;600&display=swap');
        @page { margin: 0.5in 0.55in; }
        @media print {
          .no-print { display: none !important; }
          .page {
            page-break-after: always;
            break-after: page;
            box-shadow: none !important;
            margin: 0 !important;
            min-height: auto !important;
          }
          .page:last-child { page-break-after: auto; break-after: auto; }
          body { background: white !important; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        }
        .trip-plan, .trip-plan * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .trip-plan { background: #b8a890; min-height: 100vh; padding: 24px 0; }
        .trip-plan .page {
          width: 8.5in; min-height: 11in;
          margin: 24px auto;
          background: #f1e6d2;
          padding: 0.55in 0.6in;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
          position: relative;
          color: #2a1f14;
          font-family: "Lora", Georgia, serif;
        }
        .trip-plan h1, .trip-plan h2, .trip-plan .display { font-family: "Bebas Neue", Impact, sans-serif; letter-spacing: 0.04em; font-weight: 400; }
        .trip-plan .label { font-family: "Oswald", sans-serif; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600; font-size: 10px; color: rgba(42,31,20,0.6); }
        .trip-plan .accent-rule { height: 3px; background: #da7b4a; width: 80px; margin: 8px 0 16px; }
        .trip-plan .editable-block { position: relative; }
        .trip-plan .editable-block textarea {
          width: 100%; background: rgba(255,255,255,0.6); border: 1px dashed #da7b4a;
          font: inherit; color: inherit; padding: 8px 10px; resize: vertical; min-height: 60px;
          border-radius: 2px;
        }
        .trip-plan .edit-hint {
          position: absolute; top: -14px; right: 0;
          font-family: "Oswald", sans-serif; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(218,123,74,0.85); font-weight: 600; opacity: 0; transition: opacity 0.15s;
        }
        .trip-plan .editable-block:hover .edit-hint { opacity: 1; }
        .trip-plan .fact { font-family: "Oswald", sans-serif; font-size: 10px; letter-spacing: 0.04em; }
        .trip-plan .fact-k { color: rgba(42,31,20,0.55); text-transform: uppercase; letter-spacing: 0.14em; font-weight: 600; }
        .trip-plan .fact-v { color: #2a1f14; font-weight: 500; }
        /* Variant B vertical spine */
        .spine { position:relative; padding-left:64px; }
        .spine::before { content:""; position:absolute; left:24px; top:6px; bottom:6px; width:3px; background:#da7b4a; }
        .day-row { position:relative; padding:10px 0 12px; border-bottom:1px dashed rgba(42,31,20,0.15); }
        .day-row:last-child { border-bottom:none; }
        .day-row::before {
          content:""; position:absolute; left:-40px; top:14px;
          width:14px; height:14px; border-radius:50%;
          background:#f1e6d2; border:3px solid #da7b4a;
        }
        .day-num-spine { position:absolute; left:-64px; top:8px; width:24px; text-align:right;
          font-family:"Bebas Neue",Impact,sans-serif; font-size:24px; color:#da7b4a; line-height:1; }
        /* Monochrome airline logo */
        .airline-logo { height:24px; width:auto; max-width:96px; filter:grayscale(100%) contrast(1.05); mix-blend-mode:multiply; opacity:0.95; }
      `}</style>

      <div className="no-print" style={{ maxWidth: "8.5in", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 12px" }}>
        <Link href={planningHref} style={{ color: "#2a1f14", fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>← Back to planning page</Link>
        <button
          onClick={() => window.print()}
          style={{ background: "#da7b4a", color: "#f1e6d2", padding: "10px 18px", border: "none", fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
        >
          Save as PDF
        </button>
      </div>

      {/* PART 1 - PRESENTATION */}
      <div className="page" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          height: "8.6in", position: "relative", color: "#f1e6d2", overflow: "hidden",
          background: trip.banner_image
            ? `linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.85) 100%), url(${trip.banner_image}) center/cover`
            : "linear-gradient(180deg, rgba(218,123,74,0.22) 0%, rgba(74,119,135,0.55) 60%, rgba(42,31,20,0.85) 100%)",
        }}>
          <img
            src="/TRIPCRAFTLOGO.png"
            alt="TripCraft"
            style={{ position: "absolute", top: "0.45in", right: "0.55in", height: 110, width: "auto",
              filter: "brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.45))" }}
          />
          <div style={{ position: "absolute", top: "0.5in", left: 0, width: "55%", textAlign: "left" }}>
            <div style={{ height: 4, background: "#f1e6d2", margin: "6px 0 6px 0.55in", opacity: 0.75, width: "55%" }} />
            <div style={{ height: 4, background: "#f1e6d2", margin: "6px 0 6px 0.55in", opacity: 0.75, width: "70%" }} />
            <div style={{ height: 4, background: "#f1e6d2", margin: "6px 0 6px 0.55in", opacity: 0.75, width: "85%" }} />
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.6in 0.6in" }}>
            <div style={{ color: "#f4c177", fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.32em", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>— Trip Plan —</div>
            <div className="display" style={{ fontSize: 96, lineHeight: 0.92, color: "#f6efe0", letterSpacing: "0.06em", marginBottom: 6, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>
              {(trip.title || "Untitled Trip").toUpperCase()}
            </div>
            {trip.destination && <div style={{ fontStyle: "italic", fontSize: 22, color: "#f4c177", marginBottom: 14 }}>{trip.destination}</div>}
            <div style={{ display: "flex", gap: 24, color: "rgba(241,230,210,0.92)", fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, fontWeight: 600 }}>
              <span style={{ borderRight: "1px solid rgba(241,230,210,0.4)", paddingRight: 24 }}>{allDates.length} Days</span>
              <span style={{ borderRight: "1px solid rgba(241,230,210,0.4)", paddingRight: 24 }}>{numTravelers} {numTravelers === 1 ? "Traveler" : "Travelers"}</span>
              <span>{formatShort(startDate)} – {formatShort(endDate)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0.45in 0.6in 0.55in", background: "#f1e6d2" }}>
          <EditableBlock
            value={pitch}
            placeholder="Add a trip pitch — a few sentences capturing the spirit of the trip."
            canEdit={canEdit}
            onSave={savePitch}
            displayStyle={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 16, lineHeight: 1.65, color: "rgba(42,31,20,0.88)" }}
            onGenerate={canEdit ? async () => {
              const res = await fetch("/api/ai/pitch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  destination: trip.destination,
                  title: trip.title,
                  startDate, endDate, numTravelers,
                  travelers,
                  days: daySchedule.slice(0, 14).map((d) => ({
                    date: d.date, title: d.title,
                    events: d.events.slice(0, 4).map((e) => e.label || ""),
                  })),
                }),
              });
              if (!res.ok) throw new Error("Failed");
              const json = await res.json();
              return json.pitch;
            } : null}
          />
          {travelers.length > 0 && (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(42,31,20,0.18)" }}>
              <span className="label">Travelers</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                {travelers.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px",
                    border: "1px solid rgba(42,31,20,0.22)",
                    background: t.is_primary ? "rgba(218,123,74,0.10)" : "rgba(255,255,255,0.4)" }}>
                    <span className="display" style={{ fontSize: 14, color: "#2a1f14" }}>{t.name.toUpperCase()}</span>
                    {t.role && <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(42,31,20,0.55)", fontWeight: 600 }}>· {t.role}</span>}
                    {t.is_primary && <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 8, padding: "1px 5px", background: "#da7b4a", color: "#f1e6d2", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Lead</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PART 2 - TRIP AT A GLANCE (Variant B) */}
      <div className="page">
        <h1 style={{ fontSize: 64, marginBottom: 0 }}>Trip at a glance</h1>
        <div className="accent-rule"></div>

        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 3.5in", gap: 22, alignItems: "start" }}>
          {/* Spine */}
          <div className="spine">
            {daySchedule.map((d) => {
              const eventLabels = d.events.slice(0, 8).map((e) => {
                if (e.kind === "flight") {
                  const l = e.flightLeg || {};
                  return `${l.airline_code || l.airline_name || "Flight"} ${l.departure_airport || ""}→${l.arrival_airport || ""}`;
                }
                return e.label;
              });
              return (
                <div key={d.date} className="day-row avoid-break">
                  <div className="day-num-spine">{String(d.dayNumber).padStart(2, "0")}</div>
                  {/* Stack: day+date on top, title below */}
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.18em", color: "rgba(42,31,20,0.6)", textTransform: "uppercase" }}>
                    {formatWeekdayShort(d.date)} · {formatShort(d.date)}
                  </div>
                  <div className="display" style={{ fontSize: 20, color: "#2a1f14", lineHeight: 1.05, marginTop: 2 }}>
                    {(d.title || "Open day").toUpperCase()}
                  </div>
                  {/* Events wrap as chips */}
                  {eventLabels.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                      {d.events.slice(0, 8).map((e, i) => {
                        const isFlight = e.kind === "flight";
                        const l = e.flightLeg || {};
                        const display = isFlight
                          ? `${l.airline_code || l.airline_name || ""} ${l.departure_airport || ""}→${l.arrival_airport || ""}`
                          : e.label;
                        return (
                          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "Lora, serif", fontSize: 11, color: "rgba(42,31,20,0.78)" }}>
                            <span style={{ width: 7, height: 7, borderRadius: 2, background: CAT_COLORS[e.kind], flexShrink: 0 }} />
                            {display}
                          </span>
                        );
                      })}
                      {d.events.length > 8 && (
                        <span style={{ fontFamily: "Oswald, sans-serif", fontSize: 10, color: "rgba(42,31,20,0.5)", fontWeight: 600 }}>
                          +{d.events.length - 8} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Side map — generated posterized destination map (or fallback) */}
          <div className="avoid-break" style={{
            height: "5.4in", position: "sticky", top: 12,
            border: "2px solid rgba(42,31,20,0.5)",
            background: mapImage
              ? `url(${mapImage}) center/cover`
              : "linear-gradient(135deg, rgba(74,119,135,0.18) 0%, rgba(126,155,91,0.18) 50%, rgba(212,165,116,0.18) 100%), repeating-linear-gradient(45deg, rgba(42,31,20,0.04) 0 8px, transparent 8px 16px), #f1e6d2",
            overflow: "hidden",
          }}>
            <span className="label" style={{ position: "absolute", top: 10, left: 12, background: "rgba(241,230,210,0.92)", padding: "3px 6px" }}>— Route</span>
            <div style={{ position: "absolute", top: 10, right: 12, width: 30, height: 30, border: "2px solid #2a1f14", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bebas Neue, sans-serif", fontSize: 14, background: "rgba(241,230,210,0.92)" }}>N</div>

            {/* Generate / regenerate control — owner only, screen-only */}
            {canEdit && (
              <div className="no-print" style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                <button
                  onClick={() => generateMap(!!mapImage)}
                  disabled={mapLoading}
                  style={{
                    fontFamily: "Oswald, sans-serif", fontSize: 9, letterSpacing: "0.18em",
                    textTransform: "uppercase", fontWeight: 600,
                    color: "#da7b4a", background: "rgba(241,230,210,0.95)",
                    border: "1px solid rgba(218,123,74,0.5)",
                    padding: "3px 9px", cursor: mapLoading ? "wait" : "pointer",
                  }}
                >
                  {mapLoading ? "Generating\u2026" : (mapImage ? "\u2728 Regenerate map" : "\u2728 Generate map")}
                </button>
              </div>
            )}

            {/* Fallback geography (only when no map image) */}
            {!mapImage && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "55%",
                background: "linear-gradient(180deg, rgba(74,119,135,0.06), rgba(74,119,135,0.20))",
                clipPath: "polygon(0 30%, 18% 22%, 32% 36%, 48% 18%, 64% 30%, 80% 22%, 100% 36%, 100% 100%, 0 100%)" }} />
            )}

            {/* Day pins overlay */}
            {daySchedule.map((d, i) => {
              const tt = daySchedule.length === 1 ? 0.5 : i / (daySchedule.length - 1);
              const x = 12 + tt * 76;
              const y = 50 + Math.sin(tt * Math.PI) * -18;
              return (
                <div key={d.date}>
                  <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 11, height: 11, borderRadius: "50%",
                    background: "#da7b4a", border: "2px solid #f1e6d2", boxShadow: "0 0 0 1.5px #da7b4a", transform: "translate(-50%,-50%)" }} />
                  {d.title && (
                    <div style={{
                      position: "absolute", left: `${x}%`, top: `calc(${y}% - 14px)`,
                      transform: "translate(-50%,-100%)",
                      fontFamily: "Oswald, sans-serif", fontSize: 8, fontWeight: 600, letterSpacing: "0.1em",
                      color: "#2a1f14", textTransform: "uppercase",
                      background: "rgba(241,230,210,0.92)", padding: "1px 4px",
                      border: "1px solid rgba(42,31,20,0.4)", whiteSpace: "nowrap",
                    }}>
                      {String(d.dayNumber).padStart(2, "0")} · {d.title.length > 16 ? d.title.slice(0,15) + "…" : d.title}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Dotted route through pins */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={daySchedule.length > 1
                  ? daySchedule.map((d, i) => {
                      const tt = i / (daySchedule.length - 1);
                      const x = 12 + tt * 76;
                      const y = 50 + Math.sin(tt * Math.PI) * -18;
                      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }).join(" ")
                  : ""
                }
                stroke="#da7b4a" strokeWidth="0.6" strokeDasharray="2 2" fill="none"
              />
            </svg>

            {trip.destination && (
              <div className="display" style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center",
                fontSize: 28, color: "#2a1f14", textShadow: "0 1px 0 rgba(241,230,210,0.85), 0 0 6px rgba(241,230,210,0.7)" }}>
                {trip.destination.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Budget banner */}
        <div className="avoid-break" style={{ marginTop: 18, padding: "12px 18px",
          background: "linear-gradient(90deg, rgba(218,123,74,0.10), rgba(218,123,74,0.04))",
          borderLeft: "4px solid #da7b4a",
          display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 22, alignItems: "center" }}>
          <div className="display" style={{ fontSize: 38, color: "#da7b4a" }}>{formatMoney(grandTotal, "USD")}</div>
          <div style={{ fontSize: 12.5, color: "rgba(42,31,20,0.8)", lineHeight: 1.5 }}>
            <span className="label" style={{ display: "block", marginBottom: 4 }}>— All-In, Estimated</span>
            Detailed costs follow per-day in trip details. Final breakdown summarized on the last page.
          </div>
          <div style={{ textAlign: "right", fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.16em", color: "rgba(42,31,20,0.6)", fontWeight: 600 }}>
            Per Traveler<br/>
            <b className="display" style={{ fontSize: 22, color: "#2a1f14", marginTop: 2, display: "block" }}>{formatMoney(grandTotal / numTravelers, "USD")}</b>
          </div>
        </div>
      </div>

      {/* PART 3 - TRIP DETAILS - day pages with 2-image column */}
      {daySchedule.map((d) => (
        <div key={d.date} className="page">
          <div style={{ display: "flex", alignItems: "stretch", gap: 16, borderBottom: "3px solid #2a1f14", paddingBottom: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 64,
              borderRight: "2px solid rgba(42,31,20,0.4)", paddingRight: 14 }}>
              <span style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.22em", color: "rgba(42,31,20,0.65)", fontWeight: 600 }}>Day</span>
              <span className="display" style={{ fontSize: 44, color: "#da7b4a", lineHeight: 0.95, marginTop: 2 }}>{String(d.dayNumber).padStart(2, "0")}</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="display" style={{ fontSize: 26, lineHeight: 1.0 }}>
                {formatWeekday(d.date).toUpperCase()}, {formatLong(d.date).toUpperCase()}
              </div>
              {d.title && <div className="display" style={{ fontSize: 32, marginTop: 6, color: "#2a1f14" }}>{d.title.toUpperCase()}</div>}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <EditableBlock
              value={daySummaries[d.date] || ""}
              placeholder={canEdit ? "Add a brief summary for this day." : ""}
              canEdit={canEdit}
              onSave={(v) => saveDaySummary(d.date, v)}
              displayStyle={{ background: "rgba(218,123,74,0.08)", borderLeft: "4px solid #da7b4a",
                padding: "11px 16px", fontStyle: "italic", fontSize: 13.5, lineHeight: 1.5, color: "rgba(42,31,20,0.85)" }}
              onGenerate={canEdit ? async () => {
                const res = await fetch("/api/ai/day-summary", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    destination: trip.destination,
                    date: d.date,
                    dayNumber: d.dayNumber,
                    title: d.title,
                    events: d.events.map((e) => ({
                      kind: e.kind, time: e.time, label: e.label, sub: e.sub,
                    })),
                  }),
                });
                if (!res.ok) throw new Error("Failed");
                const json = await res.json();
                return json.summary;
              } : null}
            />
          </div>

          {/* Two columns: events on left, two stacked image placeholders on right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2.4in", gap: 22, alignItems: "start" }}>
            <div>
              {d.events.length === 0 ? (
                <div style={{ fontStyle: "italic", color: "rgba(42,31,20,0.5)", padding: "20px 0" }}>Free day</div>
              ) : (
                d.events.map((e, i) => <EventBlock key={i} e={e} />)
              )}
            </div>
            <aside style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ImagePlaceholder label="Day image 1" />
              <ImagePlaceholder label="Day image 2" />
            </aside>
          </div>

          <div style={{ marginTop: 24, textAlign: "center", opacity: 0.5, fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.3em" }}>
            — Day {d.dayNumber} of {allDates.length} · {formatShort(d.date)} —
          </div>
        </div>
      ))}

      {/* BUDGET SUMMARY */}
      <div className="page">
        <div className="label">Final Page</div>
        <h1 style={{ fontSize: 72 }}>Budget Summary</h1>
        <div className="accent-rule"></div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "20px 0", paddingBottom: 14, borderBottom: "3px solid #2a1f14" }}>
          <div>
            <div className="display" style={{ fontSize: 56, color: "#da7b4a" }}>{formatMoney(grandTotal, "USD")}</div>
            <div style={{ fontSize: 13, color: "rgba(42,31,20,0.7)" }}>
              All-in for {numTravelers} {numTravelers === 1 ? "traveler" : "travelers"} ·
              {` ~${formatMoney(grandTotal / numTravelers, "USD")} each`} ·
              {` ${formatMoney(grandTotal / Math.max(1, allDates.length), "USD")} / day`}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="label" style={{ fontSize: 11 }}>Status</div>
            <div className="display" style={{ fontSize: 24, color: "#da7b4a" }}>Estimated</div>
          </div>
        </div>

        {budgetRows.map((r) => (
          <div key={r.name} style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 60px", gap: 16, padding: "12px 0", borderBottom: "1px dashed rgba(42,31,20,0.18)", alignItems: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 3, background: r.color }} />
            <div className="display" style={{ fontSize: 22 }}>{r.name}</div>
            <div style={{ background: "rgba(42,31,20,0.08)", height: 14, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: r.color, width: `${(r.amount / maxBudget) * 100}%` }} />
            </div>
            <div className="display" style={{ fontSize: 22, textAlign: "right" }}>{formatMoney(r.amount, "USD")}</div>
          </div>
        ))}

        <div style={{ marginTop: 28, padding: 16, background: "rgba(74,119,135,0.08)", border: "1px solid rgba(74,119,135,0.3)" }}>
          <div className="label">Note</div>
          <div style={{ fontStyle: "italic", fontSize: 13, lineHeight: 1.55, marginTop: 6 }}>
            Detailed costs are shown per day in the previous pages. This page summarizes the trip totals.
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: "center", opacity: 0.5, fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.3em" }}>
          — End of Plan —
        </div>
      </div>
    </div>
  );
}

function ImagePlaceholder({ label }) {
  return (
    <div style={{
      height: "2.4in",
      background: "repeating-linear-gradient(45deg, rgba(42,31,20,0.04) 0 8px, transparent 8px 16px), rgba(42,31,20,0.04)",
      border: "1.5px dashed rgba(42,31,20,0.25)",
      color: "rgba(42,31,20,0.45)",
      fontFamily: "Oswald, sans-serif",
      textTransform: "uppercase",
      letterSpacing: "0.22em",
      fontSize: 10,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: 12,
    }}>
      {label}<br/><span style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.18em" }}>placeholder</span>
    </div>
  );
}

/* Per-event block with full detail. Special-cased for flights to show
   the airline logo and DEP/ARR airport+time prominently. */
function EventBlock({ e }) {
  const isFlight = e.kind === "flight";
  return (
    <div className="avoid-break" style={{
      display: "grid",
      gridTemplateColumns: "84px 28px 1fr auto",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px dashed rgba(42,31,20,0.18)",
      alignItems: "start",
    }}>
      <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10.5, fontWeight: 600, paddingTop: 2, color: "rgba(42,31,20,0.85)", lineHeight: 1.35 }}>
        {e.time ? formatTimeRange(e.time, e.timeEnd) : "—"}
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
        background: CAT_COLORS[e.kind], color: e.kind === "activity" ? "#2a1f14" : "white",
        fontFamily: "Bebas Neue, sans-serif", fontSize: 13,
      }}>
        {CAT_ICONS[e.kind]}
      </div>
      <div>
        {isFlight ? <FlightDetail e={e} /> : (
          <>
            <div className="display" style={{ fontSize: 17, lineHeight: 1.15 }}>{e.label}</div>
            {e.sub && <div style={{ fontSize: 12, color: "rgba(42,31,20,0.7)", marginTop: 2, lineHeight: 1.4 }}>{e.sub}</div>}
            {e.address && <div style={{ fontSize: 11, color: "rgba(42,31,20,0.55)", marginTop: 2, lineHeight: 1.35 }}>{e.address}</div>}
            {e.description && <div style={{ fontSize: 11.5, color: "rgba(42,31,20,0.78)", marginTop: 5, lineHeight: 1.45 }}>{e.description}</div>}
            {e.facts && e.facts.length > 0 && <FactsGrid facts={e.facts} />}
            {e.amenities && (
              <div style={{ marginTop: 6, fontSize: 10.5, color: "rgba(42,31,20,0.65)", fontStyle: "italic" }}>
                <span className="fact-k" style={{ marginRight: 6 }}>Amenities</span>{e.amenities}
              </div>
            )}
            {e.meeting && (
              <div style={{ marginTop: 6, padding: "6px 9px", background: "rgba(107,90,142,0.10)", border: "1px dashed rgba(107,90,142,0.4)", fontSize: 11, lineHeight: 1.4 }}>
                <span className="fact-k" style={{ marginRight: 6 }}>Meeting</span>{e.meeting}
              </div>
            )}
            {e.notes && (
              <div style={{ marginTop: 6, fontSize: 11.5, color: "rgba(42,31,20,0.7)", fontStyle: "italic", lineHeight: 1.45 }}>
                {e.notes}
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ textAlign: "right" }}>
        {e.cost ? (
          <>
            <div className="display" style={{ fontSize: 16, color: "#da7b4a", whiteSpace: "nowrap" }}>
              {formatMoney(e.cost, e.currency)}
            </div>
            {e.costLabel && (
              <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 9, color: "rgba(42,31,20,0.55)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>
                {e.costLabel}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function FactsGrid({ facts }) {
  return (
    <div style={{
      marginTop: 8,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "4px 14px",
    }}>
      {facts.map((f, i) => (
        <div key={i} className="fact" style={{ display: "flex", gap: 6, lineHeight: 1.4 }}>
          <span className="fact-k">{f.k}</span>
          <span className="fact-v">{f.v}</span>
        </div>
      ))}
    </div>
  );
}

/* Flight-specific detail block: monochrome airline logo + DEP/ARR columns
   showing airport code and time stacked, plus the rest of the leg facts. */
function FlightDetail({ e }) {
  const l = e.flightLeg || {};
  const opt = e.flightOption || {};
  const code = (l.airline_code || "").toUpperCase();
  const facts = [];
  if (l.duration_minutes) facts.push({ k: "Duration", v: formatDuration(l.duration_minutes) });
  if (l.cabin_class) facts.push({ k: "Cabin", v: l.cabin_class });
  if (l.aircraft_type) facts.push({ k: "Aircraft", v: l.aircraft_type });
  if (l.terminal_departure) facts.push({ k: "Dep terminal", v: l.terminal_departure });
  if (l.gate_departure) facts.push({ k: "Dep gate", v: l.gate_departure });
  if (l.terminal_arrival) facts.push({ k: "Arr terminal", v: l.terminal_arrival });
  if (l.gate_arrival) facts.push({ k: "Arr gate", v: l.gate_arrival });
  if (l.seat) facts.push({ k: "Seat", v: l.seat });
  if (l.baggage_allowance) facts.push({ k: "Baggage", v: l.baggage_allowance });
  if (opt.confirmation_number) facts.push({ k: "Confirmation", v: opt.confirmation_number });
  if (opt.booking_site) facts.push({ k: "Booked via", v: opt.booking_site });
  if (l.operating_airline_name && l.operating_airline_name !== l.airline_name) {
    facts.push({ k: "Operated by", v: l.operating_airline_name });
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {code && (
          <img
            className="airline-logo"
            src={`https://images.kiwi.com/airlines/64/${code}.png`}
            alt={l.airline_name || code}
            onError={(ev) => { ev.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="display" style={{ fontSize: 17, lineHeight: 1.15 }}>
          {(l.airline_name || code || "Flight")}{l.flight_number ? ` ${l.flight_number}` : ""}
        </div>
      </div>

      {/* DEP → ARR column row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginTop: 8,
        padding: "8px 10px", background: "rgba(126,155,91,0.10)", border: "1px solid rgba(126,155,91,0.35)" }}>
        <div>
          <div className="fact-k" style={{ fontFamily: "Oswald, sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Depart</div>
          <div className="display" style={{ fontSize: 22, lineHeight: 1, marginTop: 3 }}>{l.departure_airport || "—"}</div>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(42,31,20,0.85)", marginTop: 2 }}>
            {l.departure_time ? formatTime(l.departure_time) : ""}
            {l.departure_date && <span style={{ color: "rgba(42,31,20,0.5)", marginLeft: 6, fontSize: 10 }}>{formatShort(l.departure_date)}</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "rgba(42,31,20,0.55)", fontFamily: "Oswald, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <div style={{ width: 32, height: 1, background: "rgba(42,31,20,0.4)", marginBottom: 3 }} />
          <span>{l.duration_minutes ? formatDuration(l.duration_minutes) : "→"}</span>
          <div style={{ width: 32, height: 1, background: "rgba(42,31,20,0.4)", marginTop: 3 }} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="fact-k" style={{ fontFamily: "Oswald, sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Arrive</div>
          <div className="display" style={{ fontSize: 22, lineHeight: 1, marginTop: 3 }}>{l.arrival_airport || "—"}</div>
          <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(42,31,20,0.85)", marginTop: 2 }}>
            {l.arrival_time ? formatTime(l.arrival_time) : ""}
            {l.arrival_date && <span style={{ color: "rgba(42,31,20,0.5)", marginLeft: 6, fontSize: 10 }}>{formatShort(l.arrival_date)}</span>}
          </div>
        </div>
      </div>

      {facts.length > 0 && <FactsGrid facts={facts} />}
      {opt.notes && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: "rgba(42,31,20,0.7)", fontStyle: "italic", lineHeight: 1.45 }}>
          {opt.notes}
        </div>
      )}
    </>
  );
}

/* Inline-editable text block.
   - canEdit + onSave : text editing
   - onGenerate (optional, async): adds a "✨ Generate" button next to the
     edit hint that calls the AI endpoint and replaces the value. */
function EditableBlock({ value, placeholder, canEdit, onSave, displayStyle, onGenerate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const taRef = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);
  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      taRef.current.setSelectionRange(taRef.current.value.length, taRef.current.value.length);
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if ((draft || "") !== (value || "")) onSave(draft);
  }
  function cancel() {
    setDraft(value || "");
    setEditing(false);
  }

  async function handleGenerate(e) {
    e.stopPropagation();
    if (!onGenerate || generating) return;
    setGenError(null);
    setGenerating(true);
    try {
      const next = await onGenerate();
      if (next && next.trim()) onSave(next.trim());
    } catch (err) {
      setGenError("Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (editing) {
    return (
      <div className="editable-block">
        <textarea
          ref={taRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); cancel(); }
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); commit(); }
          }}
        />
      </div>
    );
  }

  const hasValue = !!(value && value.trim());

  return (
    <div
      className="editable-block"
      style={{ cursor: canEdit ? "text" : "default" }}
      onClick={() => { if (canEdit) setEditing(true); }}
    >
      {canEdit && (
        <div className="no-print" style={{ position: "absolute", top: -16, right: 0, display: "flex", alignItems: "center", gap: 8 }}>
          {onGenerate && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              style={{
                fontFamily: "Oswald, sans-serif", fontSize: 9, letterSpacing: "0.18em",
                textTransform: "uppercase", fontWeight: 600,
                color: generating ? "rgba(218,123,74,0.5)" : "#da7b4a",
                background: "rgba(218,123,74,0.10)", border: "1px solid rgba(218,123,74,0.4)",
                padding: "2px 8px", cursor: generating ? "wait" : "pointer",
              }}
              title="Generate with AI"
            >
              {generating ? "Generating…" : (hasValue ? "✨ Regenerate" : "✨ Generate")}
            </button>
          )}
          <span className="edit-hint" style={{ position: "static", opacity: undefined }}>click to edit</span>
        </div>
      )}
      <div style={{ ...displayStyle, opacity: hasValue ? 1 : 0.5 }}>
        {hasValue ? value : (placeholder || "")}
      </div>
      {genError && (
        <div className="no-print" style={{ marginTop: 4, fontFamily: "Oswald, sans-serif", fontSize: 9, color: "#c8624c", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {genError}
        </div>
      )}
    </div>
  );
}
