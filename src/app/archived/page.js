"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
];

function getGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}

export default function ArchivedPage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadArchived();
  }, [router]);

  async function loadArchived() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);

    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .eq("archived", true)
      .order("updated_at", { ascending: false });

    setTrips(data || []);
    setLoading(false);
  }

  async function handleUnarchive(tripId) {
    await supabase
      .from("trips")
      .update({ archived: false })
      .eq("id", tripId);

    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  }

  async function handleDelete(tripId) {
    await supabase.from("trips").delete().eq("id", tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setDeleteId(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">📦</div>
          <p className="text-slate-500">Loading archived trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Back to My Trips</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="text-lg font-bold text-slate-700">Archived Trips</span>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">No archived trips</h2>
            <p className="text-slate-400 mb-6">Trips you archive from your dashboard will appear here.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              Back to My Trips
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {trips.map((trip, i) => {
              const hasImage = !!trip.cover_image;
              const gradient = getGradient(i);
              return (
                <div key={trip.id} className="relative group">
                  <Link href={`/trips/${trip.id}`} className="block">
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-end shadow-sm hover:shadow-xl transition-all duration-300 opacity-70 hover:opacity-100">
                      {/* Background */}
                      {hasImage ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
                          style={{ backgroundImage: `url(${trip.cover_image})` }}
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0`}
                        />
                      )}

                      {/* Gradient overlay */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 75%, transparent 100%)",
                        }}
                      />

                      {/* Archived badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/80 text-white font-medium backdrop-blur-sm">
                          Archived
                        </span>
                      </div>

                      {/* Content */}
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

                  {/* Action buttons on hover */}
                  <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Restore button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnarchive(trip.id); }}
                      className="w-7 h-7 rounded-full bg-black/30 hover:bg-sky-600 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm"
                      title="Restore to My Trips"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75V6h4.5a.75.75 0 0 1 0 1.5h-4.5v4.25a.75.75 0 0 1-1.5 0V7.5h-4.5a.75.75 0 0 1 0-1.5h4.5V1.75A.75.75 0 0 1 8 1Z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(trip.id); }}
                      className="w-7 h-7 rounded-full bg-black/30 hover:bg-red-500 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm"
                      title="Permanently delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🗑️</div>
              <h3 className="text-lg font-bold text-slate-800">Delete Trip Permanently?</h3>
              <p className="text-sm text-slate-500 mt-2">
                This action cannot be undone. The trip and all its data will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
