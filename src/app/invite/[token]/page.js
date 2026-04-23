"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import FlightPathLoader from "@/components/FlightPathLoader";
import { tripPlanningUrl } from "@/lib/tripUrl";

export default function InviteAcceptPage() {
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [invite, setInvite] = useState(null);
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null);
  const [inviterEmail, setInviterEmail] = useState(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    async function loadInvite() {
      // Check if user is logged in
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        // Save invite token and redirect to login
        localStorage.setItem("pending_invite_token", params.token);
        router.replace("/?auth=login");
        return;
      }

      setUser(currentUser);

      // Fetch invite details via API
      const res = await fetch(`/api/invite/accept?token=${params.token}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid invite");
        setLoading(false);
        return;
      }

      setInvite(data.invite);
      setTrip(data.trip);
      setInviterEmail(data.inviterEmail);
      setLoading(false);
    }

    loadInvite();
  }, [params.token, router]);

  async function handleAccept() {
    setAccepting(true);
    setError(null);

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: params.token,
        userId: user.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to accept invite");
      setAccepting(false);
      return;
    }

    // Prefer the fully-loaded trip (has title for slug); fall back to just the id.
    router.push(tripPlanningUrl(trip ?? { id: data.tripId }));
  }

  if (loading) return <FlightPathLoader text="Loading invite..." />;

  if (error && !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8">
            <div className="text-4xl mb-4">😕</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Invite</h1>
            <p className="text-slate-500 mb-6">{error}</p>
            <Link
              href="/trips"
              className="inline-block bg-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-sky-700 transition-colors"
            >
              Go to Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">✈️</span>
            <span className="text-2xl font-bold text-sky-900">TripCraft</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-8 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            You&apos;re invited!
          </h1>
          <p className="text-slate-500 mb-1">
            {inviterEmail} invited you to collaborate on:
          </p>
          <h2 className="text-lg font-semibold text-sky-700 mb-1">
            {trip?.title}
          </h2>
          {trip?.destination && (
            <p className="text-slate-400 text-sm mb-6">📍 {trip.destination}</p>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {accepting ? "Joining..." : "Join This Trip"}
          </button>

          <Link
            href="/trips"
            className="block text-sm text-slate-500 hover:text-slate-700"
          >
            No thanks, go to trips
          </Link>
        </div>
      </div>
    </div>
  );
}
