"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
                            relative min-h-[80px] p-2 border-r border-sky-50 last:border-r-0
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

                          {/* Day title if exists */}
                          {dayData?.title && (
                            <div className="mt-1 text-xs font-medium text-sky-700 truncate">
                              {dayData.title}
                            </div>
                          )}

                          {/* Activity count */}
                          {dayActivities.length > 0 && (
                            <div className="mt-1 text-xs text-slate-400">
                              {dayActivities.length} {dayActivities.length === 1 ? "activity" : "activities"}
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

function DayPopout({ dateKey, tripId, dayData, activities, inRange, onClose, onUpdate }) {
  const [title, setTitle] = useState(dayData?.title || "");
  const [notes, setNotes] = useState(dayData?.notes || "");
  const [newActivity, setNewActivity] = useState("");
  const [saving, setSaving] = useState(false);

  const dateFormatted = new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Create or update the day record
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

  async function handleAddActivity(e) {
    e.preventDefault();
    if (!newActivity.trim()) return;

    // Make sure the day exists first
    let dayId = dayData?.id;
    if (!dayId) {
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
      dayId = data.id;
    }

    await supabase.from("activities").insert({
      day_id: dayId,
      title: newActivity.trim(),
      sort_order: activities.length,
    });

    setNewActivity("");
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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-sky-100 w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-sky-900">{dateFormatted}</h2>
            {!inRange && (
              <span className="text-xs text-amber-600 font-medium">Outside trip dates</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Day Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Day Title
            </label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveDay}
              rows={3}
              placeholder="Any notes for this day..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Activities */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Activities
            </label>

            {activities.length > 0 && (
              <ul className="space-y-2 mb-3">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={activity.is_checked}
                      onChange={() => handleToggleActivity(activity.id, activity.is_checked)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span
                      className={`flex-1 text-sm ${
                        activity.is_checked ? "line-through text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {activity.title}
                    </span>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-sm"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add Activity */}
            <form onSubmit={handleAddActivity} className="flex gap-2">
              <input
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Add an activity..."
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="bg-sky-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
