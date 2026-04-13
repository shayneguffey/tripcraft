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
  // Wish list
  const [wishList, setWishList] = useState([]);
  const [addingWish, setAddingWish] = useState(false);
  const [wishDest, setWishDest] = useState("");
  const [wishNotes, setWishNotes] = useState("");
  const [savingWish, setSavingWish] = useState(false);
  const titleRef = useRef(null);
  const wishRef = useRef(null);
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

    // Load wish list
    const { data: wishes } = await supabase
      .from("wish_list")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWishList(wishes || []);

    setLoading(false);

    // Fetch cover images for wish list items missing one
    for (const wish of (wishes || [])) {
      if (!wish.cover_image && wish.destination) {
        fetchWishCoverImage(wish.id, wish.destination);
      }
    }

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

  async function handleArchiveTrip(tripId) {
    await supabase
      .from("trips")
      .update({ archived: true })
      .eq("id", tripId);

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, archived: true } : t
      )
    );
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

  async function handleAddWish(e) {
    e.preventDefault();
    if (!wishDest.trim()) return;
    setSavingWish(true);

    const { data, error } = await supabase
      .from("wish_list")
      .insert({
        user_id: user.id,
        destination: wishDest.trim(),
        notes: wishNotes.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      setWishList((prev) => [data, ...prev]);
      // Fetch cover image
      fetchWishCoverImage(data.id, data.destination);
    }
    setWishDest("");
    setWishNotes("");
    setAddingWish(false);
    setSavingWish(false);
  }

  async function fetchWishCoverImage(wishId, destination) {
    try {
      const res = await fetch(
        `/api/cover-image?destination=${encodeURIComponent(destination)}&count=1`
      );
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        await supabase
          .from("wish_list")
          .update({ cover_image: data.images[0] })
          .eq("id", wishId);
        setWishList((prev) =>
          prev.map((w) => (w.id === wishId ? { ...w, cover_image: data.images[0] } : w))
        );
      }
    } catch (err) {
      // fallback gradient
    }
  }

  async function handleRemoveWish(wishId) {
    await supabase.from("wish_list").delete().eq("id", wishId);
    setWishList((prev) => prev.filter((w) => w.id !== wishId));
  }

  async function handleConvertWishToTrip(wish) {
    // Create a new trip from the wish list item
    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        title: wish.destination,
        destination: wish.destination,
        cover_image: wish.cover_image || null,
      })
      .select()
      .single();

    if (!error && data) {
      // Remove from wish list
      await supabase.from("wish_list").delete().eq("id", wish.id);
      setWishList((prev) => prev.filter((w) => w.id !== wish.id));
      router.push(`/trips/${data.id}`);
    }
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
                onArchive={(id) => handleArchiveTrip(id)}
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
                  onArchive={(id) => handleArchiveTrip(id)}
                  onUnarchive={trip.archived ? (id) => handleUnarchiveTrip(id) : undefined}
                  imageOptions={imageOptions[trip.id]}
                  onCycleImage={(dir) => cycleImage(trip.id, dir)}
                  isPast
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── Travel Wish List ─────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-600 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            Travel Wish List
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishList.map((wish, i) => (
              <div key={wish.id} className="relative group">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] flex flex-col justify-end shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* Background */}
                  {wish.cover_image ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${wish.cover_image})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(i)} transition-transform duration-500 group-hover:scale-105`} />
                  )}

                  {/* Gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 p-3">
                    <h3 className="font-bold text-white text-base leading-tight">
                      {wish.destination}
                    </h3>
                    {wish.notes && (
                      <p className="text-white/60 text-xs mt-0.5 line-clamp-2">{wish.notes}</p>
                    )}
                  </div>
                </div>

                {/* Hover actions */}
                <div className="absolute top-2 right-2 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleConvertWishToTrip(wish)}
                    className="w-7 h-7 rounded-full bg-black/30 hover:bg-sky-600 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm"
                    title="Start planning this trip"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveWish(wish.id)}
                    className="w-7 h-7 rounded-full bg-black/30 hover:bg-red-500 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm"
                    title="Remove from wish list"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Wish Card */}
            {!addingWish ? (
              <button
                onClick={() => {
                  setAddingWish(true);
                  setTimeout(() => wishRef.current?.focus(), 100);
                }}
                className="group rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-400 bg-white/50 hover:bg-pink-50/50 transition-all aspect-[4/3] flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 group-hover:bg-pink-200 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-pink-500">
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.723.723 0 01-.692 0h-.002z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-pink-600">Add Destination</span>
              </button>
            ) : (
              <div className="rounded-2xl border-2 border-pink-300 bg-white shadow-lg overflow-hidden">
                <form onSubmit={handleAddWish} className="p-4">
                  <input
                    ref={wishRef}
                    type="text"
                    value={wishDest}
                    onChange={(e) => setWishDest(e.target.value)}
                    placeholder="Where do you dream of going?"
                    className="w-full text-sm font-semibold text-pink-900 placeholder-slate-300 border-none outline-none mb-2 bg-transparent"
                    required
                  />
                  <textarea
                    value={wishNotes}
                    onChange={(e) => setWishNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full text-xs text-slate-600 placeholder-slate-300 border border-slate-200 rounded-lg px-2 py-1.5 mb-3 resize-none focus:outline-none focus:ring-1 focus:ring-pink-300"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingWish}
                      className="flex-1 bg-pink-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50"
                    >
                      {savingWish ? "Adding..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingWish(false); setWishDest(""); setWishNotes(""); }}
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

        {/* Link to Archived Trips */}
        <div className="text-center mt-4">
          <Link
            href="/archived"
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            View Archived Trips
          </Link>
        </div>
      </main>
      <footer className="text-center text-xs text-slate-300 py-4">
        v3.2.0 — Apr 12 2026
      </footer>
    </div>
  );
}

// ─── Trip Card ────────────────────────────────────────────
function TripCard({ trip, index, onArchive, onUnarchive, isPast, imageOptions, onCycleImage }) {
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

          {/* Strong gradient overlay — opaque at bottom, clear at top */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 75%, transparent 100%)",
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

      {/* Image cycling arrows — always visible when multiple images available */}
      {hasMultipleImages && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCycleImage(-1); }}
            className="absolute left-2 top-[40%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            title="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCycleImage(1); }}
            className="absolute right-2 top-[40%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            title="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          </button>
          {/* Image counter dots */}
          <div className="absolute bottom-[4.5rem] left-0 right-0 z-20 flex justify-center gap-1.5">
            {imageOptions.images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full border border-white/50 ${i === imageOptions.index ? "bg-white" : "bg-white/20"}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Action buttons — always visible at top right */}
      {!trip._isCollaborator && (
        <div className="absolute top-3 right-3 z-20 flex gap-1.5">
          {onArchive && !trip.archived && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onArchive(trip.id); }}
              className="px-2.5 py-1 rounded-full bg-black/50 hover:bg-slate-600 text-white/80 hover:text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z" /><path fillRule="evenodd" d="M13 6H3v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6Zm-5.5 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1Z" clipRule="evenodd" /></svg>
              Archive
            </button>
          )}
          {onUnarchive && trip.archived && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUnarchive(trip.id); }}
              className="px-2.5 py-1 rounded-full bg-black/50 hover:bg-sky-600 text-white/80 hover:text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm transition-colors"
            >
              Restore
            </button>
          )}
        </div>
      )}
    </div>
  );
}
