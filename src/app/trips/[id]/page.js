"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import FlightOptions from "@/components/FlightOptions";
import ActivityOptions from "@/components/ActivityOptions";

// Helper: generate array of dates for calendar display
function getCalendarRange(startDate, endDate) {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  // Show at least 1 week before and after
  const calStart = new Date(start);
  calStart.setDate(calStart.getDate() - 7);
  // Go back to the previous Sunday
  while (calStart.getDay() !== 0) {
    calStart.setDate(calStart.getDate() - 1);
  }

  const calEnd = new Date(end);
  calEnd.setDate(calEnd.getDate() + 7);
  // Go forward to the next Saturday
  while (calEnd.getDay() !== 6) {
    calEnd.setDate(calEnd.getDate() + 1);
  }

  const dates = [];
  const current = new Date(calStart);
  while (current <= calEnd) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b);
}

function isInRange(date, start, end) {
  const d = formatDateKey(date);
  return d >= start && d <= end;
}

export default function TripDetailPage() {
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState({});
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dragType, setDragType] = useState(null); // "start" or "end"
  const [dragDate, setDragDate] = useState(null);
  const [editingField, setEditingField] = useState(null); // "title", "destination", "dates", "description"
  const [editValue, setEditValue] = useState("");
  const [editValue2, setEditValue2] = useState(""); // for end date when editing dates
  const [flightOptions, setFlightOptions] = useState([]);
  const [activityOptions, setActivityOptions] = useState([]);
  const router = useRouter();
  const params = useParams();

  const loadTrip = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", params.id)
      .single();

    if (tripError || !tripData) {
      router.push("/dashboard");
      return;
    }

    setTrip(tripData);

    // Fetch days keyed by date
    const { data: daysData } = await supabase
      .from("days")
      .select("*")
      .eq("trip_id", params.id);

    const daysMap = {};
    (daysData || []).forEach((d) => {
      daysMap[d.date] = d;
    });
    setDays(daysMap);

    // Fetch activities grouped by day_id
    if (daysData && daysData.length > 0) {
      const dayIds = daysData.map((d) => d.id);
      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .in("day_id", dayIds)
        .order("sort_order", { ascending: true });

      const grouped = {};
      (activitiesData || []).forEach((a) => {
        if (!grouped[a.day_id]) grouped[a.day_id] = [];
        grouped[a.day_id].push(a);
      });
      setActivities(grouped);
    }

    setLoading(false);
  }, [params.id, router]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  // Update trip date range in database
  async function updateTripDates(newStart, newEnd) {
    await supabase
      .from("trips")
      .update({ start_date: newStart, end_date: newEnd, updated_at: new Date().toISOString() })
      .eq("id", params.id);

    setTrip((prev) => ({ ...prev, start_date: newStart, end_date: newEnd }));
  }

  function startEditing(field) {
    if (field === "title") setEditValue(trip.title || "");
    else if (field === "destination") setEditValue(trip.destination || "");
    else if (field === "dates") {
      setEditValue(trip.start_date || "");
      setEditValue2(trip.end_date || "");
    }
    else if (field === "description") setEditValue(trip.description || "");
    setEditingField(field);
  }

  async function saveField(field) {
    const updates = { updated_at: new Date().toISOString() };

    if (field === "title") updates.title = editValue;
    else if (field === "destination") updates.destination = editValue || null;
    else if (field === "dates") {
      updates.start_date = editValue || null;
      updates.end_date = editValue2 || null;
    }
    else if (field === "description") updates.description = editValue || null;

    await supabase.from("trips").update(updates).eq("id", params.id);
    setEditingField(null);
    loadTrip();
  }

  function handleFieldKeyDown(e, field) {
    if (e.key === "Enter" && field !== "description") {
      e.preventDefault();
      saveField(field);
    } else if (e.key === "Escape") {
      setEditingField(null);
    }
  }

  // Get flights on a given date from the selected flight option
  function getFlightsOnDate(dateKey) {
    const selectedOpt = flightOptions.find((o) => o.is_selected) || flightOptions[0];
    if (!selectedOpt) return [];
    return (selectedOpt.flight_legs || []).filter((leg) => leg.departure_date === dateKey);
  }

  function getScheduledActivities(dateKey) {
    return activityOptions.filter((a) => a.scheduled_date === dateKey);
  }

  // Drag handlers for adjusting trip date range
  function handleMouseDown(dateKey, e) {
    e.preventDefault();
    if (!trip.start_date || !trip.end_date) return;

    if (dateKey === trip.start_date) {
      setDragType("start");
    } else if (dateKey === trip.end_date) {
      setDragType("end");
    }
  }

  function handleMouseEnter(dateKey) {
    if (!dragType) return;
    setDragDate(dateKey);
  }

  function handleMouseUp() {
    if (dragType && dragDate) {
      let newStart = trip.start_date;
      let newEnd = trip.end_date;

      if (dragType === "start" && dragDate < trip.end_date) {
        newStart = dragDate;
      } else if (dragType === "end" && dragDate > trip.start_date) {
        newEnd = dragDate;
      }

      if (newStart !== trip.start_date || newEnd !== trip.end_date) {
        updateTripDates(newStart, newEnd);
      }
    }
    setDragType(null);
    setDragDate(null);
  }

  useEffect(() => {
    if (dragType) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [dragType, dragDate]);

  // Get the effective start/end while dragging
  function getEffectiveRange() {
    let start = trip.start_date;
    let end = trip.end_date;

    if (dragType === "start" && dragDate && dragDate < end) {
      start = dragDate;
    } else if (dragType === "end" && dragDate && dragDate > start) {
      end = dragDate;
    }

    return { start, end };
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <p className="text-slate-500">Loading trip...</p>
      </div>
    );
  }

  const { start: effectiveStart, end: effectiveEnd } = trip.start_date
    ? getEffectiveRange()
    : { start: null, end: null };

  // Use effective range (accounts for dragging) so calendar updates live
  const calendarDates = effectiveStart && effectiveEnd
    ? getCalendarRange(effectiveStart, effectiveEnd)
    : [];

  // Group dates into weeks
  const weeks = [];
  for (let i = 0; i < calendarDates.length; i += 7) {
    weeks.push(calendarDates.slice(i, i + 7));
  }

  // Build the calendar title showing the range of months displayed
  function getCalendarTitle() {
    if (calendarDates.length === 0) return "";
    const first = calendarDates[0];
    const last = calendarDates[calendarDates.length - 1];

    const firstMonth = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const lastMonth = last.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (firstMonth === lastMonth) return firstMonth;

    // Same year — show "June — August 2026"
    if (first.getFullYear() === last.getFullYear()) {
      return `${first.toLocaleDateString("en-US", { month: "long" })} — ${last.toLocaleDateString("en-US", { month: "long" })} ${last.getFullYear()}`;
    }

    // Different years — show "December 2026 — January 2027"
    return `${firstMonth} — ${lastMonth}`;
  }

  const today = formatDateKey(new Date());

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-sky-50 to-white"
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <header className="w-full border-b border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold text-sky-900">TripCraft</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-sky-700 hover:text-sky-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Trip Header with inline editing */}
        <div className="mb-8 space-y-2">
          {/* Title */}
          <div className="flex items-center gap-2 group">
            {editingField === "title" ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveField("title")}
                onKeyDown={(e) => handleFieldKeyDown(e, "title")}
                autoFocus
                className="text-3xl font-bold text-sky-900 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full max-w-xl"
              />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-sky-900">{trip.title}</h1>
                <button
                  onClick={() => startEditing("title")}
                  className="text-slate-300 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit title"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2 group">
            {editingField === "destination" ? (
              <div className="flex items-center gap-1">
                <span className="text-slate-500">📍</span>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveField("destination")}
                  onKeyDown={(e) => handleFieldKeyDown(e, "destination")}
                  autoFocus
                  placeholder="Enter destination"
                  className="text-slate-500 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            ) : (
              <>
                <p className="text-slate-500">
                  📍 {trip.destination || <span className="italic text-slate-400">No destination set</span>}
                </p>
                <button
                  onClick={() => startEditing("destination")}
                  className="text-slate-300 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit destination"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 group">
            {editingField === "dates" ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, "dates")}
                  autoFocus
                  className="text-sm bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-slate-400">—</span>
                <input
                  type="date"
                  value={editValue2}
                  onChange={(e) => setEditValue2(e.target.value)}
                  onKeyDown={(e) => handleFieldKeyDown(e, "dates")}
                  className="text-sm bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={() => saveField("dates")}
                  className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : effectiveStart && effectiveEnd ? (
              <>
                <p className="text-slate-400 text-sm">
                  {new Date(effectiveStart + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "long", day: "numeric", year: "numeric",
                  })}{" "}—{" "}
                  {new Date(effectiveEnd + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "long", day: "numeric", year: "numeric",
                  })}
                  {dragType && (
                    <span className="ml-2 text-sky-600 font-medium">(drag to adjust)</span>
                  )}
                </p>
                <button
                  onClick={() => startEditing("dates")}
                  className="text-slate-300 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit dates"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                </button>
              </>
            ) : (
              <button
                onClick={() => startEditing("dates")}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                + Add dates
              </button>
            )}
          </div>

          {/* Description */}
          <div className="flex items-start gap-2 group mt-1">
            {editingField === "description" ? (
              <div className="flex-1 max-w-xl">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveField("description")}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditingField(null);
                  }}
                  autoFocus
                  rows={3}
                  placeholder="Add a description..."
                  className="w-full text-slate-600 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>
            ) : (
              <>
                <p className="text-slate-600">
                  {trip.description || <span className="italic text-slate-400 text-sm">No description</span>}
                </p>
                <button
                  onClick={() => startEditing("description")}
                  className="text-slate-300 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all mt-1"
                  title="Edit description"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Flight Options */}
        <FlightOptions
          tripId={params.id}
          tripStart={trip?.start_date}
          tripEnd={trip?.end_date}
          onFlightOptionsChange={setFlightOptions}
        />

        {/* Activity Options */}
        <ActivityOptions
          tripId={params.id}
          tripStart={trip?.start_date}
          tripEnd={trip?.end_date}
          onActivityOptionsChange={setActivityOptions}
        />

        {/* Calendar */}
        {calendarDates.length > 0 ? (
          <div className="bg-white rounded-xl border border-sky-100 shadow-sm overflow-hidden select-none">
            {/* Calendar Title */}
            <div className="px-6 py-4 border-b border-sky-100 bg-white">
              <h2 className="text-xl font-bold text-sky-900">{getCalendarTitle()}</h2>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 border-b border-sky-100">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {weeks.map((week, wi) => {
              // Check if this is the start of a new month
              const firstDay = week[0];
              const prevWeekLastDay = wi > 0 ? weeks[wi - 1][6] : null;
              const showMonthLabel =
                wi === 0 ||
                (prevWeekLastDay && firstDay.getMonth() !== prevWeekLastDay.getMonth());

              return (
                <div key={wi}>
                  {showMonthLabel && (
                    <div className="px-4 py-2 bg-slate-50 border-b border-sky-100 text-sm font-semibold text-slate-700">
                      {firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </div>
                  )}
                  <div className="grid grid-cols-7 border-b border-sky-50">
                    {week.map((date) => {
                      const dateKey = formatDateKey(date);
                      const inRange = effectiveStart && effectiveEnd && isInRange(date, effectiveStart, effectiveEnd);
                      const isStart = dateKey === effectiveStart;
                      const isEnd = dateKey === effectiveEnd;
                      const isToday = dateKey === today;
                      const dayData = days[dateKey];
                      const dayActivities = dayData ? (activities[dayData.id] || []) : [];
                      const isSelected = selectedDay === dateKey;

                      return (
                        <div
                          key={dateKey}
                          className={`
                            relative min-h-[90px] p-2 border-r border-sky-50 last:border-r-0
                            transition-colors cursor-pointer
                            ${inRange ? "bg-sky-100/60" : "hover:bg-slate-50"}
                            ${isStart ? "bg-sky-200/70 rounded-l-lg" : ""}
                            ${isEnd ? "bg-sky-200/70 rounded-r-lg" : ""}
                            ${isSelected ? "ring-2 ring-sky-500 ring-inset z-10" : ""}
                          `}
                          onClick={() => setSelectedDay(dateKey)}
                          onMouseDown={(e) => handleMouseDown(dateKey, e)}
                          onMouseEnter={() => handleMouseEnter(dateKey)}
                        >
                          {/* Date number */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`
                                text-sm font-medium
                                ${isToday ? "bg-sky-600 text-white w-7 h-7 rounded-full flex items-center justify-center" : ""}
                                ${inRange && !isToday ? "text-sky-900" : "text-slate-600"}
                                ${!inRange && !isToday ? "text-slate-400" : ""}
                              `}
                            >
                              {date.getDate()}
                            </span>
                            {/* Drag handle indicator for start/end */}
                            {(isStart || isEnd) && (
                              <span
                                className="text-sky-400 cursor-ew-resize text-xs font-bold"
                                title={`Drag to adjust trip ${isStart ? "start" : "end"}`}
                              >
                                ⟷
                              </span>
                            )}
                          </div>

                          {/* Flight indicators */}
                          {(() => {
                            const flights = getFlightsOnDate(dateKey);
                            if (flights.length === 0) return null;
                            return (
                              <div className="mt-1 space-y-0.5">
                                {flights.map((f, fi) => (
                                  <div key={fi} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded px-1 py-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0">
                                      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                    </svg>
                                    <span className="text-[10px] font-medium truncate">
                                      {f.departure_airport}→{f.arrival_airport}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* Scheduled activity indicators */}
                          {(() => {
                            const scheduled = getScheduledActivities(dateKey);
                            if (scheduled.length === 0) return null;
                            return (
                              <div className="mt-1 space-y-0.5">
                                {scheduled.slice(0, 2).map((a) => (
                                  <div key={a.id} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 rounded px-1 py-0.5">
                                    <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span className="text-[10px] font-medium truncate">{a.name}</span>
                                  </div>
                                ))}
                                {scheduled.length > 2 && (
                                  <div className="text-[10px] text-emerald-500">+{scheduled.length - 2} more</div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Day title if exists */}
                          {dayData?.title && (
                            <div className="mt-1 text-xs font-medium text-sky-700 truncate">
                              {dayData.title}
                            </div>
                          )}

                          {/* Activity previews */}
                          {dayActivities.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {dayActivities.slice(0, 2).map((act) => {
                                const cat = getCategoryInfo(act.category);
                                return (
                                  <div key={act.id} className="flex items-center gap-1 text-[11px] leading-tight">
                                    <span className="flex-shrink-0">{cat.icon}</span>
                                    <span className={`truncate ${inRange ? "text-sky-800" : "text-slate-500"}`}>
                                      {act.title}
                                    </span>
                                  </div>
                                );
                              })}
                              {dayActivities.length > 2 && (
                                <div className={`text-[10px] ${inRange ? "text-sky-500" : "text-slate-400"}`}>
                                  +{dayActivities.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-sky-100">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No dates set
            </h3>
            <p className="text-slate-500">
              Edit your trip to add start and end dates.
            </p>
          </div>
        )}

        {/* Day Detail Popout */}
        {selectedDay && (
          <DayPopout
            dateKey={selectedDay}
            tripId={params.id}
            dayData={days[selectedDay]}
            activities={days[selectedDay] ? (activities[days[selectedDay].id] || []) : []}
            inRange={effectiveStart && effectiveEnd && selectedDay >= effectiveStart && selectedDay <= effectiveEnd}
            onClose={() => setSelectedDay(null)}
            onUpdate={loadTrip}
          />
        )}
      </main>
    </div>
  );
}

const CATEGORIES = [
  { value: "sightseeing", label: "Sightseeing", icon: "🏛️" },
  { value: "food", label: "Food & Dining", icon: "🍽️" },
  { value: "outdoors", label: "Outdoors", icon: "🌲" },
  { value: "transport", label: "Transport", icon: "🚌" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "nightlife", label: "Nightlife", icon: "🌙" },
  { value: "wellness", label: "Wellness", icon: "🧘" },
  { value: "task", label: "Task / Errand", icon: "📋" },
  { value: "other", label: "Other", icon: "📌" },
];

function getCategoryInfo(value) {
  return CATEGORIES.find((c) => c.value === value) || { value: "other", label: "Other", icon: "📌" };
}

function DayPopout({ dateKey, tripId, dayData, activities, inRange, onClose, onUpdate }) {
  const [title, setTitle] = useState(dayData?.title || "");
  const [notes, setNotes] = useState(dayData?.notes || "");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("sightseeing");
  const [newNotes, setNewNotes] = useState("");
  const [editingActivity, setEditingActivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const dateFormatted = new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  async function handleSaveDay() {
    setSaving(true);
    if (dayData) {
      await supabase
        .from("days")
        .update({ title: title || null, notes: notes || null })
        .eq("id", dayData.id);
    } else {
      await supabase.from("days").insert({
        trip_id: tripId,
        date: dateKey,
        title: title || null,
        notes: notes || null,
      });
    }
    setSaving(false);
    onUpdate();
  }

  async function ensureDayExists() {
    if (dayData?.id) return dayData.id;
    const { data } = await supabase
      .from("days")
      .insert({
        trip_id: tripId,
        date: dateKey,
        title: title || null,
        notes: notes || null,
      })
      .select()
      .single();
    return data.id;
  }

  async function handleAddActivity(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dayId = await ensureDayExists();

    await supabase.from("activities").insert({
      day_id: dayId,
      title: newTitle.trim(),
      start_time: newStartTime || null,
      end_time: newEndTime || null,
      location: newLocation || null,
      category: newCategory,
      notes: newNotes || null,
      sort_order: activities.length,
    });

    setNewTitle("");
    setNewStartTime("");
    setNewEndTime("");
    setNewLocation("");
    setNewCategory("sightseeing");
    setNewNotes("");
    setShowAddForm(false);
    onUpdate();
  }

  async function handleUpdateActivity(activityId, updates) {
    await supabase.from("activities").update(updates).eq("id", activityId);
    setEditingActivity(null);
    onUpdate();
  }

  async function handleToggleActivity(activityId, currentChecked) {
    await supabase
      .from("activities")
      .update({ is_checked: !currentChecked })
      .eq("id", activityId);
    onUpdate();
  }

  async function handleDeleteActivity(activityId) {
    await supabase.from("activities").delete().eq("id", activityId);
    onUpdate();
  }

  // Sort activities by sort_order first (to respect manual reordering), then start_time
  const sortedActivities = [...activities].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
    if (a.start_time) return -1;
    if (b.start_time) return 1;
    return 0;
  });

  async function handleReorder(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const reordered = [...sortedActivities];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    // Update sort_order in DB for each activity
    const updates = reordered.map((act, i) =>
      supabase.from("activities").update({ sort_order: i }).eq("id", act.id)
    );
    await Promise.all(updates);
    onUpdate();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-sky-100 w-full max-w-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50 rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-sky-900">{dateFormatted}</h2>
            {!inRange && (
              <span className="text-xs text-amber-600 font-medium">Outside trip dates</span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Day Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Day Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveDay}
              placeholder='e.g. "Beach Day" or "Rainforest Hike"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveDay}
              rows={2}
              placeholder="Any notes for this day..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Activities</label>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                >
                  + Add Activity
                </button>
              )}
            </div>

            {/* Activity List */}
            {sortedActivities.length > 0 && (
              <div className="space-y-2 mb-4">
                {sortedActivities.map((activity, idx) => {
                  const cat = getCategoryInfo(activity.category);
                  const isEditing = editingActivity === activity.id;

                  if (isEditing) {
                    return (
                      <ActivityEditForm
                        key={activity.id}
                        activity={activity}
                        onSave={(updates) => handleUpdateActivity(activity.id, updates)}
                        onCancel={() => setEditingActivity(null)}
                      />
                    );
                  }

                  return (
                    <div
                      key={activity.id}
                      draggable
                      onDragStart={() => setDragIndex(idx)}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={() => { handleReorder(dragIndex, idx); setDragIndex(null); }}
                      onDragEnd={() => setDragIndex(null)}
                      className={`flex items-start gap-3 group p-2 rounded-lg hover:bg-slate-50 transition-colors ${dragIndex === idx ? "opacity-40" : ""}`}
                    >
                      <span className="text-slate-300 cursor-grab active:cursor-grabbing mt-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Drag to reorder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>
                      </span>
                      <input
                        type="checkbox"
                        checked={activity.is_checked}
                        onChange={() => handleToggleActivity(activity.id, activity.is_checked)}
                        className="w-4 h-4 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm" title={cat.label}>{cat.icon}</span>
                          <span className={`text-sm font-medium ${activity.is_checked ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {activity.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          {activity.start_time && (
                            <span className="text-xs text-slate-400">
                              🕐 {activity.start_time.slice(0, 5)}
                              {activity.end_time && ` – ${activity.end_time.slice(0, 5)}`}
                            </span>
                          )}
                          {activity.location && (
                            <span className="text-xs text-slate-400">📍 {activity.location}</span>
                          )}
                        </div>
                        {activity.notes && (
                          <p className="text-xs text-slate-400 mt-1">{activity.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setEditingActivity(activity.id)}
                          className="text-slate-300 hover:text-sky-600 p-1"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-slate-300 hover:text-red-500 p-1"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Activity Form */}
            {showAddForm && (
              <form onSubmit={handleAddActivity} className="bg-sky-50 rounded-lg p-4 space-y-3 border border-sky-100">
                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Activity name *"
                    autoFocus
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-sky-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
                  >
                    Add Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTitle("");
                      setNewStartTime("");
                      setNewEndTime("");
                      setNewLocation("");
                      setNewCategory("sightseeing");
                      setNewNotes("");
                    }}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {sortedActivities.length === 0 && !showAddForm && (
              <p className="text-sm text-slate-400 italic">No activities yet — add something to this day!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityEditForm({ activity, onSave, onCancel }) {
  const [title, setTitle] = useState(activity.title || "");
  const [startTime, setStartTime] = useState(activity.start_time?.slice(0, 5) || "");
  const [endTime, setEndTime] = useState(activity.end_time?.slice(0, 5) || "");
  const [location, setLocation] = useState(activity.location || "");
  const [category, setCategory] = useState(activity.category || "sightseeing");
  const [notes, setNotes] = useState(activity.notes || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      title,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location || null,
      category,
      notes: notes || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-sky-50 rounded-lg p-3 space-y-2 border border-sky-100">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
        />
      </div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.icon} {cat.label}
          </option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        rows={2}
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-sky-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
      </div>
    </form>
  );
}
