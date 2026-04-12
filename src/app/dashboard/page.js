"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Fetch user's trips
      const { data: trips } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      setTrips(trips || []);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteTrip(tripId) {
    await supabase.from("trips").delete().eq("id", tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setDeleteId(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <p className="text-slate-500">Loading...</p>
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
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-sky-900">My Trips</h1>
          <Link
            href="/trips/new"
            className="bg-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-sky-700 transition-colors"
          >
            + New Trip
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-sky-100">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              No trips yet
            </h2>
            <p className="text-slate-500 mb-6">
              Create your first trip and start planning your adventure!
            </p>
            <Link
              href="/trips/new"
              className="inline-block bg-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-sky-700 transition-colors"
            >
              Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="relative bg-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-shadow group"
              >
                <Link href={`/trips/${trip.id}`} className="block">
                  <h3 className="font-semibold text-sky-900 text-lg mb-1 pr-8">
                    {trip.title}
                  </h3>
                  {trip.destination && (
                    <p className="text-slate-500 text-sm mb-3">
                      📍 {trip.destination}
                    </p>
                  )}
                  {trip.start_date && trip.end_date && (
                    <p className="text-slate-400 text-sm">
                      {new Date(trip.start_date + "T00:00:00").toLocaleDateString()} —{" "}
                      {new Date(trip.end_date + "T00:00:00").toLocaleDateString()}
                    </p>
                  )}
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(trip.id);
                  }}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete trip"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
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
                  This will permanently delete the trip and all its days and activities. This cannot be undone.
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
      <footer className="text-center text-xs text-slate-300 py-4">v2.2.0 — Apr 11 2026</footer>
    </div>
  );
}
