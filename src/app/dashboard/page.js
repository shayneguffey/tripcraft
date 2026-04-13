"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Format trip dates: "Jun 5-12, 2026" (same month) or "Jun 5 - Jul 3, 2026"
function formatTripDates(startStr, endStr) {
  if (!startStr || !endStr) return "";
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const sMonth = monthNames[start.getMonth()];
  const eMonth = monthNames[end.getMonth()];
  const sDay = start.getDate();
  const eDay = end.getDate();
  const sYear = start.getFullYear();
  const eYear = end.getFullYear();

  if (sYear !== eYear) {
    return `${sMonth} ${sDay}, ${sYear} - ${eMonth} ${eDay}, ${eYear}`;
  } else if (start.getMonth() === end.getMonth()) {
    return `${sMonth} ${sDay}-${eDay}, ${sYear}`;
  } else {
    return `${sMonth} ${sDay} - ${eMonth} ${eDay}, ${sYear}`;
  }
}

// Gradient fallbacks
const GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-cyan-400 to-sky-600",
  "from-indigo-400 to-blue-700",
];

function getGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}

// ─── Date Range Calendar ──────────────────────────────────
function DateRangeCalendar({ startDate, endDate, onSelect }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(
    startDate ? new Date(startDate + "T00:00:00") : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selecting, setSelecting] = useState(startDate ? "end" : "start"); // which date to pick next

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function toDateStr(day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleDayClick(day) {
    const dateStr = toDateStr(day);
    if (selecting === "start") {
      onSelect(dateStr, endDate && dateStr <= endDate ? endDate : "");
      setSelecting("end");
    } else {
      if (startDate && dateStr < startDate) {
        // Clicked before start — reset start
        onSelect(dateStr, "");
        setSelecting("end");
      } else {
        onSelect(startDate, dateStr);
        setSelecting("start");
      }
    }
  }

  function isInRange(day) {
    if (!startDate || !endDate) return false;
    const d = toDateStr(day);
    return d > startDate && d < endDate;
  }

  function isStart(day) {
    return startDate && toDateStr(day) === startDate;
  }

  function isEnd(day) {
    return endDate && toDateStr(day) === endDate;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`h-7 text-xs rounded-full flex items-center justify-center transition-colors
                ${start || end ? "bg-sky-600 text-white font-bold" : ""}
                ${inRange ? "bg-sky-100 text-sky-800" : ""}
                ${!start && !end && !inRange ? "text-slate-600 hover:bg-slate-100" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selection hint */}
      <div className="mt-2 text-[10px] text-slate-400 text-center">
        {selecting === "start" ? "Select start date" : "Select end date"}
        {startDate && (
          <span className="ml-2 text-sky-600">
            {startDate}{endDate ? ` → ${endDate}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [archiveId, setArchiveId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newTravelers, setNewTravelers] = useState(1);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  // Image cycling: tripId -> { images: [], index: 0 }
  const [imageOptions, setImageOptions] = useState({});
  const titleRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, [router]);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);

    const { data: ownTrips } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: true });

    const { data: collabs } = await supabase
      .from("trip_collaborators")
      .select("trip_id")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    let collabTrips = [];
    if (collabs && collabs.length > 0) {
      const collabTripIds = collabs.map((c) => c.trip_id);
      const { data: sharedTrips } = await supabase
        .from("trips")
        .select("*")
        .in("id", collabTripIds)
        .order("start_date", { ascending: true });
      collabTrips = (sharedTrips || []).map((t) => ({ ...t, _isCollaborator: true }));
    }

    const allTrips = [...(ownTrips || []), ...collabTrips];
    setTrips(allTrips);
    setLoading(false);

    // Fetch cover images for trips missing one
    for (const trip of allTrips) {
      if (!trip.cover_image && trip.destination) {
        fetchCoverImages(trip.id, trip.destination);
      }
    }
  }

  async function fetchCoverImages(tripId, destination) {
    try {
      const res = await fetch(
        `/api/cover-image?destination=${encodeURIComponent(destination)}&count=5`
      );
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        // Save the first image to DB
        await supabase
          .from("trips")
          .update({ cover_image: data.images[0] })
          .eq("id", tripId);
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, cover_image: data.images[0] } : t))
        );
        // Store all options for cycling
        setImageOptions((prev) => ({
          ...prev,
          [tripId]: { images: data.images, index: 0 },
        }));
      } else if (data.imageUrl) {
        // Fallback single image
        await supabase
          .from("trips")
          .update({ cover_image: data.imageUrl })
          .eq("id", tripId);
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, cover_image: data.imageUrl } : t))
        );
      }
    } catch (err) {
      // gradient fallback
    }
  }

  async function cycleImage(tripId, direction) {
    const opts = imageOptions[tripId];
    if (!opts || opts.images.length <= 1) return;

    let newIndex = opts.index + direction;
    if (newIndex < 0) newIndex = opts.images.length - 1;
    if (newIndex >= opts.images.length) newIndex = 0;

    const newImage = opts.images[newIndex];
    setImageOptions((prev) => ({
      ...prev,
      [tripId]: { ...prev[tripId], index: newIndex },
    }));
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, cover_image: newImage } : t))
    );
    // Save selection
    await supabase.from("trips").update({ cover_image: newImage }).eq("id", tripId);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteTrip(tripId) {
    await supabase.from("trips").delete().eq("id", tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setDeleteId(null);
  }

  async function handleArchiveTrip(tripId) {
    // Set end_date to yesterday to move it to past
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    const trip = trips.find((t) => t.id === tripId);
    await supabase
      .from("trips")
      .update({
        end_date: trip?.end_date || dateStr,
        archived: true,
      })
      .eq("id", tripId);

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, archived: true } : t
      )
    );
    setArchiveId(null);
  }

  async function handleUnarchiveTrip(tripId) {
    await supabase
      .from("trips")
      .update({ archived: false })
      .eq("id", tripId);

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, archived: false } : t
      )
    );
  }

  async function handleCreateTrip(e) {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError("Trip name is required");
      return;
    }
    setSaving(true);
    setCreateError(null);

    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        destination: newDest.trim() || null,
        start_date: newStart || null,
        end_date: newEnd || null,
        num_travelers: newTravelers,
      })
      .select()
      .single();

    if (error) {
      setCreateError(error.message);
      setSaving(false);
      return;
    }

    setCreating(false);
    setNewTitle("");
    setNewDest("");
    setNewStart("");
    setNewEnd("");
    setNewTravelers(1);
    setShowCalendar(false);
    setSaving(false);
    router.push(`/trips/${data.id}`);
  }

  function cancelCreate() {
    setCreating(false);
    setNewTitle("");
    setNewDest("");
    setNewStart("");
    setNewEnd("");
    setNewTravelers(1);
    setCreateError(null);
    setShowCalendar(false);
  }

  // Split trips
  const today = new Date().toISOString().split("T")[0];
  const planningTrips = trips.filter(
    (t) => !t.archived && (!t.end_date || t.end_date >= today)
  );
  const pastTrips = trips.filter(
    (t) => t.archived || (t.end_date && t.end_date < today)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">✈️</div>
          <p className="text-slate-500">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="w-full border-b border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold text-sky-900">TripCraft</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-sky-700 hover:text-sky-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Planning Section */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-600 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Planning
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {planningTrips.map((trip, i) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={i}
                onDelete={(id) => setDeleteId(id)}
                onArchive={(id) => setArchiveId(id)}
                imageOptions={imageOptions[trip.id]}
                onCycleImage={(dir) => cycleImage(trip.id, dir)}
              />
            ))}

            {/* New Trip Card */}
            {!creating ? (
              <button
                onClick={() => {
                  setCreating(true);
                  setTimeout(() => titleRef.current?.focus(), 100);
                }}
                className="group relative rounded-2xl border-2 border-dashed border-sky-200 hover:border-sky-400 bg-white/50 hover:bg-sky-50/50 transition-all aspect-[3/4] flex flex-col items-center justify-center gap-3 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-sky-600">
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                </div>
                <span className="font-semibold text-sky-700 group-hover:text-sky-800">
                  New Trip
                </span>
              </button>
            ) : (
              <div className="relative rounded-2xl border-2 border-sky-300 bg-white shadow-lg overflow-hidden">
                <form onSubmit={handleCreateTrip} className="p-4">
                  {createError && (
                    <div className="mb-2 p-2 rounded-lg bg-red-50 text-red-600 text-xs">
                      {createError}
                    </div>
                  )}
                  <input
                    ref={titleRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Trip name *"
                    className="w-full text-base font-semibold text-sky-900 placeholder-slate-300 border-none outline-none mb-2 bg-transparent"
                  />
                  <input
                    type="text"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    placeholder="Destination"
                    className="w-full text-sm text-slate-600 placeholder-slate-300 border-none outline-none mb-3 bg-transparent"
                  />

                  {/* Date range picker */}
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full text-left text-xs border border-slate-200 rounded-lg px-3 py-2 mb-2 text-slate-500 hover:border-sky-300 transition-colors"
                  >
                    {newStart && newEnd
                      ? formatTripDates(newStart, newEnd)
                      : newStart
                        ? `${newStart} → select end`
                        : "Select travel dates"
                    }
                  </button>
                  {showCalendar && (
                    <DateRangeCalendar
                      startDate={newStart}
                      endDate={newEnd}
                      onSelect={(s, e) => {
                        setNewStart(s);
                        setNewEnd(e);
                        if (s && e) setShowCalendar(false);
                      }}
                    />
                  )}

                  <div className="flex items-center gap-2 mb-3 mt-2">
                    <label className="text-xs text-slate-400">Travelers</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newTravelers}
                      onChange={(e) => setNewTravelers(parseInt(e.target.value) || 1)}
                      className="w-14 text-xs text-slate-600 border border-slate-200 rounded px-2 py-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-sky-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Creating..." : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelCreate}
                      className="px-3 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* Past Trips Section */}
        {pastTrips.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              Past Trips
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {pastTrips.map((trip, i) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={i + planningTrips.length}
                  onDelete={(id) => setDeleteId(id)}
                  onUnarchive={(id) => handleUnarchiveTrip(id)}
                  imageOptions={imageOptions[trip.id]}
                  onCycleImage={(dir) => cycleImage(trip.id, dir)}
                  isPast
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {trips.length === 0 && !creating && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              Where to next?
            </h2>
            <p className="text-slate-500">
              Click the New Trip card above to start planning your adventure.
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Delete this trip?</h2>
                <p className="text-sm text-slate-500 mb-6">
                  This will permanently delete the trip and all its data.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium">
                    Cancel
                  </button>
                  <button onClick={() => handleDeleteTrip(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal */}
        {archiveId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setArchiveId(null)}>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 text-center">
                <div className="text-4xl mb-3">📦</div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Move to Past Trips?</h2>
                <p className="text-sm text-slate-500 mb-6">
                  This trip will be moved to your Past Trips section. You can bring it back anytime.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setArchiveId(null)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium">
                    Cancel
                  </button>
                  <button onClick={() => handleArchiveTrip(archiveId)} className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium">
                    Move to Past
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center text-xs text-slate-300 py-4">
        v3.2.0 — Apr 12 2026
      </footer>
    </div>
  );
}

// ─── Trip Card ────────────────────────────────────────────
function TripCard({ trip, index, onDelete, onArchive, onUnarchive, isPast, imageOptions, onCycleImage }) {
  const hasImage = !!trip.cover_image;
  const gradient = getGradient(index);
  const hasMultipleImages = imageOptions && imageOptions.images && imageOptions.images.length > 1;

  return (
    <div className="relative group">
      <Link href={`/trips/${trip.id}`} className="block">
        <div
          className={`relative rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-end shadow-sm hover:shadow-xl transition-all duration-300 ${isPast ? "opacity-70 hover:opacity-100" : ""}`}
        >
          {/* Background */}
          {hasImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${trip.cover_image})` }}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
            />
          )}

          {/* Strong gradient overlay — dark bottom half fading to clear */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.02) 100%)",
            }}
          />

          {/* Shared badge */}
          {trip._isCollaborator && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-violet-700 font-medium backdrop-blur-sm">
                Shared
              </span>
            </div>
          )}

          {/* Content at bottom */}
          <div className="relative z-10 p-4">
            {trip.destination && (
              <p className="text-white/70 text-xs mb-0.5">{trip.destination}</p>
            )}
            <h3 className="font-bold text-white text-lg leading-tight mb-0.5">
              {trip.title}
            </h3>
            {trip.start_date && trip.end_date && (
              <p className="text-white/60 text-xs">
                {formatTripDates(trip.start_date, trip.end_date)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Image cycling arrows — show on hover when multiple images available */}
      {hasMultipleImages && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCycleImage(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            title="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCycleImage(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            title="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          </button>
          {/* Image counter dots */}
          <div className="absolute bottom-[4.5rem] left-0 right-0 z-20 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            {imageOptions.images.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === imageOptions.index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Action buttons — top right, on hover */}
      <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
        {/* Archive/Unarchive button */}
        {!trip._isCollaborator && !isPast && onArchive && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onArchive(trip.id); }}
            className="w-7 h-7 rounded-full bg-black/30 hover:bg-slate-600 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm"
            title="Move to past"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z" /><path fillRule="evenodd" d="M13 6H3v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6Zm-5.5 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1Z" clipRule="evenodd" /></svg>
          </button>
        )}
        {isPast && onUnarchive && !trip._isCollaborator && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUnarchive(trip.id); }}
            className="w-7 h-7 rounded-full bg-black/30 hover:bg-sky-600 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm"
            title="Move back to planning"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 8 1ZM4.11 3.05a.75.75 0 0 1 0 1.06L2.56 5.66A.75.75 0 0 1 1.5 5.66l1.55-1.55a.75.75 0 0 1 1.06 0Zm7.78 0a.75.75 0 0 1 1.06 0l1.55 1.55a.75.75 0 0 1-1.06 1.06l-1.55-1.55a.75.75 0 0 1 0-1.06ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Zm-4-4a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H4a.75.75 0 0 1-.75-.75Zm8 0a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
          </button>
        )}
        {/* Delete button */}
        {!trip._isCollaborator && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(trip.id); }}
            className="w-7 h-7 rounded-full bg-black/30 hover:bg-red-500 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm"
            title="Delete trip"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
