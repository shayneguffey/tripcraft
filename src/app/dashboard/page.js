"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
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
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="bg-white rounded-xl p-6 shadow-sm border border-sky-100 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-sky-900 text-lg mb-1">
                  {trip.title}
                </h3>
                {trip.destination && (
                  <p className="text-slate-500 text-sm mb-3">
                    📍 {trip.destination}
                  </p>
                )}
                {trip.start_date && trip.end_date && (
                  <p className="text-slate-400 text-sm">
                    {new Date(trip.start_date).toLocaleDateString()} —{" "}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
