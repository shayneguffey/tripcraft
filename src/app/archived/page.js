"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MapPatternBg from "@/components/MapPatternBg";
import FlightPathLoader from "@/components/FlightPathLoader";
import { tripPlanningUrl } from "@/lib/tripUrl";

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

const STATUS_OPTIONS = [
  { key: "planning", label: "Planning", color: "#4a965a", activeBg: "rgba(74,150,90,0.45)", hoverBg: "rgba(74,150,90,0.25)" },
  { key: "traveled", label: "Traveled", color: "#3c78b4", activeBg: "rgba(60,120,180,0.45)", hoverBg: "rgba(60,120,180,0.25)" },
  { key: "wish", label: "Wish", color: "#d2aa32", activeBg: "rgba(210,170,50,0.45)", hoverBg: "rgba(210,170,50,0.25)" },
];

function StatusPill({ label, isActive, activeBg, hoverBg, onClick }) {
  const [pillHover, setPillHover] = useState(false);

  const bg = isActive ? activeBg : pillHover ? hoverBg : "rgba(255,255,255,0.6)";
  const color = isActive || pillHover ? "rgba(80,65,50,0.95)" : "rgba(80,65,50,0.55)";
  const ring = isActive ? "1px solid rgba(80,65,50,0.35)" : "1px solid rgba(80,65,50,0.18)";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setPillHover(true)}
      onMouseLeave={() => setPillHover(false)}
      className="w-[4.2rem] py-[2px] rounded-full text-[9px] font-semibold text-center backdrop-blur-sm"
      style={{
        background: bg,
        color: color,
        outline: ring,
        transition: "background 0.2s, color 0.2s, outline 0.2s",
      }}
    >
      {label}
    </button>
  );
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

  async function handleStatusChange(tripId, newStatus) {
    const trip = trips.find((t) => t.id === tripId);
    const status = trip?.status === newStatus ? "planning" : newStatus;
    await supabase.from("trips").update({ status }).eq("id", tripId);
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, status } : t));
  }

  async function handleDelete(tripId) {
    await supabase.from("trips").delete().eq("id", tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    setDeleteId(null);
  }

  if (loading) return <FlightPathLoader text="Loading archived trips..." />;

  return (
    <div className="min-h-screen relative">
      {/* Parchment gradient base */}
      <div className="fixed inset-0" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.7) 0%, rgba(222,210,190,0.6) 50%, rgba(210,195,172,0.7) 100%)" }} />
      {/* Map pattern overlay */}
      <MapPatternBg tileSize={280} opacity={1} />

      {/* Header */}
      <header className="relative z-10 w-full">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/trips"
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-stone-600 transition-all hover:ring-2 hover:ring-[#da7b4a]/40"
              style={{
                background: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(180, 165, 140, 0.4)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
                <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
              </svg>
              Back to My Trips
            </Link>
            <div className="flex items-center gap-2.5">
              {/* Archive box icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-stone-500">
                <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
                <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-bold text-stone-700">Archived Trips</span>
            </div>
            <div className="w-32"></div>
          </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {trips.length === 0 ? (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 mx-auto mb-4 text-stone-400/60">
              <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
              <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087ZM12 10.5a.75.75 0 0 1 .75.75v4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72v-4.94a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-semibold text-stone-600 mb-2">No archived trips</h2>
            <p className="text-stone-400 mb-6">Trips you archive will appear here.</p>
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#da7b4a] text-white text-sm font-semibold tracking-wide hover:ring-2 hover:ring-white transition-all"
            >
              Back to My Trips
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trips.map((trip) => {
              const hasImage = !!trip.cover_image;
              const statusColor = STATUS_OPTIONS.find((s) => s.key === (trip.status || "planning"))?.color || "#4a965a";
              return (
                <div key={trip.id} className="relative group">
                  <Link href={tripPlanningUrl(trip)} className="block">
                    <div
                      className="relative rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-end shadow-sm hover:shadow-xl transition-all duration-300"
                      style={{ borderBottom: `8px solid ${statusColor}`, transition: "border-color 0.4s ease-in-out, box-shadow 0.3s ease" }}
                    >
                      {/* Background image */}
                      {hasImage ? (
                        <div
                          className="absolute inset-0 bg-cover transition-all duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${trip.cover_image})`,
                            backgroundPosition: "center 20%",
                            filter: "sepia(0.25) saturate(0.7) contrast(0.95) brightness(0.9) hue-rotate(-3deg)",
                            transition: "transform 0.5s ease-in-out, filter 0.4s ease-in-out",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.filter = "sepia(0.08) saturate(1.18) contrast(1.05) brightness(1.12) hue-rotate(-2deg)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.filter = "sepia(0.25) saturate(0.7) contrast(0.95) brightness(0.9) hue-rotate(-3deg)"; }}
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(135deg, rgba(160,140,115,0.9) 0%, rgba(195,178,155,0.8) 100%)",
                            filter: "sepia(0.2) saturate(0.8) brightness(0.85)",
                          }}
                        />
                      )}

                      {/* Archived badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span
                          className="text-[9px] px-2.5 py-[3px] rounded-full font-semibold tracking-wide uppercase backdrop-blur-sm"
                          style={{
                            background: "rgba(30, 22, 12, 0.6)",
                            color: "rgba(255,255,255,0.8)",
                            border: "1px solid rgba(212, 165, 116, 0.25)",
                          }}
                        >
                          Archived
                        </span>
                      </div>

                      {/* Info bar */}
                      <div className="relative z-10">
                        <div className="h-8" style={{ background: "linear-gradient(to top, #EEEEEE 0%, transparent 100%)" }} />
                        <div className="bg-[#EEEEEE] px-4 py-3">
                          <h3 className="font-bold text-stone-800 text-base leading-tight truncate">
                            {trip.title}
                          </h3>
                          {trip.destination && (
                            <p className="text-xs text-stone-500 truncate mt-0.5">{trip.destination}</p>
                          )}
                          {trip.start_date && trip.end_date && (
                            <p className="text-xs text-stone-400 mt-0.5">
                              {formatTripDates(trip.start_date, trip.end_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Status pills */}
                  <div className="absolute bottom-14 right-3 z-20 flex flex-col gap-[3px]">
                    {STATUS_OPTIONS.map((opt) => (
                      <StatusPill
                        key={opt.key}
                        label={opt.label}
                        isActive={(trip.status || "planning") === opt.key}
                        activeBg={opt.activeBg}
                        hoverBg={opt.hoverBg}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange(trip.id, opt.key); }}
                      />
                    ))}
                  </div>

                  {/* Action buttons on hover */}
                  <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {/* Restore button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnarchive(trip.id); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                      style={{
                        background: "rgba(30, 22, 12, 0.5)",
                        border: "1px solid rgba(212, 165, 116, 0.25)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(74, 150, 90, 0.7)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(30, 22, 12, 0.5)"; }}
                      title="Restore to My Trips"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white/80">
                        <path fillRule="evenodd" d="M12.78 7.625a.75.75 0 0 1-1.06 0L8.75 4.656V11.5a.75.75 0 0 1-1.5 0V4.656L4.28 7.625a.75.75 0 0 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(trip.id); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
                      style={{
                        background: "rgba(30, 22, 12, 0.5)",
                        border: "1px solid rgba(212, 165, 116, 0.25)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(180, 60, 60, 0.7)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(30, 22, 12, 0.5)"; }}
                      title="Permanently delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white/80">
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
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl border border-stone-200 pointer-events-auto"
              style={{ animation: "cardFadeIn 0.3s ease-in-out" }}
            >
              <div className="text-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 mx-auto mb-3 text-stone-400">
                  <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold text-stone-800">Delete Trip Permanently?</h3>
                <p className="text-sm text-stone-500 mt-2">
                  This action cannot be undone. The trip and all its data will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 border border-stone-300 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 px-4 py-2.5 bg-[#b5552a] text-white rounded-lg text-sm font-bold hover:ring-2 hover:ring-white transition-all"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
