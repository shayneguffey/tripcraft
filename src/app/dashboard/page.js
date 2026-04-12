"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Format trip dates: "Jun 5 - 12, 2026" (same month) or "Jun 5 - Jul 3, 2026"
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

// Gradient fallbacks for when no cover image
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

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newTravelers, setNewTravelers] = useState(1);
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState(null);
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

    // Fetch user's own trips
    const { data: ownTrips } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: true });

    // Fetch trips where user is an accepted collaborator
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

    setTrips([...(ownTrips || []), ...collabTrips]);
    setLoading(false);

    // Fetch cover images for trips that don't have one
    const allTrips = [...(ownTrips || []), ...collabTrips];
    for (const trip of allTrips) {
      if (!trip.cover_image && trip.destination) {
        fetchCoverImage(trip.id, trip.destination);
      }
    }
  }

  async function fetchCoverImage(tripId, destination) {
    try {
      const res = await fetch(`/api/cover-image?destination=${encodeURIComponent(destination)}`);
      const data = await res.json();
      if (data.imageUrl) {
        // Save to DB
        await supabase
          .from("trips")
          .update({ cover_image: data.imageUrl })
          .eq("id", tripId);
        // Update local state
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, cover_image: data.imageUrl } : t))
        );
      }
    } catch (err) {
      // Silently fail — gradient fallback will show
    }
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
        description: newDesc.trim() || null,
      })
      .select()
      .single();

    if (error) {
      setCreateError(error.message);
      setSaving(false);
      return;
    }

    // Reset form
    setCreating(false);
    setNewTitle("");
    setNewDest("");
    setNewStart("");
    setNewEnd("");
    setNewTravelers(1);
    setNewDesc("");
    setSaving(false);

    // Navigate to the new trip
    router.push(`/trips/${data.id}`);
  }

  function cancelCreate() {
    setCreating(false);
    setNewTitle("");
    setNewDest("");
    setNewStart("");
    setNewEnd("");
    setNewTravelers(1);
    setNewDesc("");
    setCreateError(null);
  }

  // Split trips into planning (upcoming/no date) and past
  const today = new Date().toISOString().split("T")[0];
  const planningTrips = trips.filter(
    (t) => !t.end_date || t.end_date >= today
  );
  const pastTrips = trips.filter(
    (t) => t.end_date && t.end_date < today
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-sky-900 mb-8">My Trips</h1>

        {/* Planning Section */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-600 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            Planning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planningTrips.map((trip, i) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={i}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}

            {/* New Trip Card */}
            {!creating ? (
              <button
                onClick={() => {
                  setCreating(true);
                  setTimeout(() => titleRef.current?.focus(), 100);
                }}
                className="group relative rounded-2xl border-2 border-dashed border-sky-200 hover:border-sky-400 bg-white/50 hover:bg-sky-50/50 transition-all min-h-[220px] flex flex-col items-center justify-center gap-3 cursor-pointer"
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
                <form onSubmit={handleCreateTrip} className="p-5">
                  {createError && (
                    <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-600 text-xs">
                      {createError}
                    </div>
                  )}
                  <input
                    ref={titleRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Trip name *"
                    className="w-full text-lg font-semibold text-sky-900 placeholder-slate-300 border-none outline-none mb-3 bg-transparent"
                  />
                  <input
                    type="text"
                    value={newDest}
                    onChange={(e) => setNewDest(e.target.value)}
                    placeholder="Destination"
                    className="w-full text-sm text-slate-600 placeholder-slate-300 border-none outline-none mb-3 bg-transparent"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-xs text-slate-400">Start</label>
                      <input
                        type="date"
                        value={newStart}
                        onChange={(e) => setNewStart(e.target.value)}
                        className="w-full text-xs text-slate-600 border border-slate-200 rounded px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">End</label>
                      <input
                        type="date"
                        value={newEnd}
                        onChange={(e) => setNewEnd(e.target.value)}
                        className="w-full text-xs text-slate-600 border border-slate-200 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-slate-400">Travelers</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newTravelers}
                      onChange={(e) => setNewTravelers(parseInt(e.target.value) || 1)}
                      className="w-16 text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 ml-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-sky-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Creating..." : "Create Trip"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelCreate}
                      className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-sm hover:bg-slate-50 transition-colors"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTrips.map((trip, i) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={i + planningTrips.length}
                  onDelete={(id) => setDeleteId(id)}
                  isPast
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state — only if no trips AND not creating */}
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
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteId(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  Delete this trip?
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  This will permanently delete the trip and all its data. This
                  cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(deleteId)}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center text-xs text-slate-300 py-4">
        v3.1.0 — Apr 12 2026
      </footer>
    </div>
  );
}

// ─── Trip Card Component ─────────────────────────────────
function TripCard({ trip, index, onDelete, isPast }) {
  const hasImage = !!trip.cover_image;
  const gradient = getGradient(index);

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <div
        className={`relative rounded-2xl overflow-hidden min-h-[220px] flex flex-col justify-end shadow-sm hover:shadow-xl transition-all duration-300 ${isPast ? "opacity-75 hover:opacity-100" : ""}`}
      >
        {/* Background image or gradient */}
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

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Shared badge */}
        {trip._isCollaborator && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-violet-700 font-medium backdrop-blur-sm">
              Shared
            </span>
          </div>
        )}

        {/* Delete button (owner only) */}
        {!trip._isCollaborator && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip.id);
            }}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-black/20 hover:bg-red-500 text-white/70 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            title="Delete trip"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        )}

        {/* Content overlay at bottom */}
        <div className="relative z-10 p-5">
          {trip.destination && (
            <p className="text-white/80 text-sm mb-1">{trip.destination}</p>
          )}
          <h3 className="font-bold text-white text-xl mb-1 drop-shadow-sm">
            {trip.title}
          </h3>
          {trip.start_date && trip.end_date && (
            <p className="text-white/70 text-sm">
              {formatTripDates(trip.start_date, trip.end_date)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
