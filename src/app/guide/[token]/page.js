"use client";

/* ══════════════════════════════════════════════════════════════════
   Pocket Guide — the traveler's mobile companion
   ──────────────────────────────────────────────────────────────────
   A read-only, mobile-first view of an itinerary meant to be opened
   on a phone while travelling. It mirrors the visual structure of
   the calendar's DayPopout so the app feels coherent between
   planning and travelling.

   Data source: GET /api/itinerary/[token]
   Auth: public (anyone with the link), but the Back-to-Planning
   button is only rendered for the trip owner or accepted
   collaborators (checked client-side against Supabase).
   ══════════════════════════════════════════════════════════════════ */

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CATEGORY_COLORS from "@/lib/categoryColors";
import FlightPathLoader from "@/components/FlightPathLoader";
import { tripPlanningUrl } from "@/lib/tripUrl";

/* ─── Date / time / money helpers ─── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDayOfWeek(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined || amount === "") return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/* ─── Google Maps URL helpers ─── */
function mapsSearchUrl(query) {
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapsDirectionsUrl(from, to) {
  if (!from && !to) return null;
  if (!from) return mapsSearchUrl(to);
  if (!to) return mapsSearchUrl(from);
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;
}

function getDaysBetween(start, end) {
  if (!start || !end) return [];
  const days = [];
  const current = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  while (current <= endDate) {
    days.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/* ══════════════════════════════════════════════════════════════════
   Main page
   ══════════════════════════════════════════════════════════════════ */
export default function GuidePage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  // ─── Day title inline edit (owners/collaborators only) ───
  const [editingDayId, setEditingDayId] = useState(null);
  const [dayTitleDraft, setDayTitleDraft] = useState("");

  // Save a day title. Creates the days row if one doesn't exist yet for this date+itinerary.
  async function saveDayTitle(dayRow, date, title) {
    const val = (title || "").trim() || null;
    if (dayRow?.id) {
      await supabase.from("days").update({ title: val }).eq("id", dayRow.id);
      setData((prev) => prev ? {
        ...prev,
        days: prev.days.map((d) => d.id === dayRow.id ? { ...d, title: val } : d),
      } : prev);
    } else if (val) {
      // No days row yet — insert one scoped to this trip + itinerary + date.
      const { data: inserted } = await supabase
        .from("days")
        .insert({ trip_id: data.trip.id, itinerary_id: data.itinerary.id, date, title: val })
        .select()
        .single();
      if (inserted) {
        setData((prev) => prev ? {
          ...prev,
          days: [...prev.days, { ...inserted, activities: [] }],
        } : prev);
      }
    }
    setEditingDayId(null);
  }

  // ─── Share: copy current URL (this page IS the share link) ───
  const [shareCopied, setShareCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareDropdownPos, setShareDropdownPos] = useState(null);
  const shareBtnRef = useRef(null);

  function handleShareClick() {
    if (shareOpen) { setShareOpen(false); setShareCopied(false); setShareDropdownPos(null); return; }
    const btnRect = shareBtnRef.current?.getBoundingClientRect();
    if (btnRect) {
      setShareDropdownPos({ top: btnRect.bottom + 6, right: window.innerWidth - btnRect.right });
    }
    setShareOpen(true);
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error("[pocket-guide] clipboard error:", err);
    }
  }

  // ─ Load itinerary ─
  useEffect(() => {
    fetch(`/api/itinerary/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("This Pocket Guide link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  // ─ Check viewer identity: owner or accepted collaborator → can edit ─
  useEffect(() => {
    if (!data?.trip?.id) return;
    let cancelled = false;
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user || cancelled) return;

      if (user.id === data.trip.user_id) {
        if (!cancelled) setCanEdit(true);
        return;
      }
      const { data: collab } = await supabase
        .from("trip_collaborators")
        .select("id")
        .eq("trip_id", data.trip.id)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .maybeSingle();
      if (!cancelled && collab) setCanEdit(true);
    })();
    return () => { cancelled = true; };
  }, [data?.trip?.id, data?.trip?.user_id]);

  // ─ Self-heal: if this trip has no banner yet, generate one.
  // Fire-and-forget — page renders immediately with the gradient fallback;
  // banner fades in when the API responds. The endpoint also persists the
  // URL to the trips row (via service-role key), so the next Pocket Guide
  // load will see it without regenerating.
  useEffect(() => {
    const trip = data?.trip;
    if (!trip || trip.banner_image || !trip.destination) return;
    let cancelled = false;
    fetch("/api/generate-banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: trip.destination, tripId: trip.id }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (cancelled || !result?.imageUrl) return;
        setData((prev) =>
          prev ? { ...prev, trip: { ...prev.trip, banner_image: result.imageUrl } } : prev
        );
      })
      .catch((err) => console.error("Pocket Guide banner generation error:", err));
    return () => { cancelled = true; };
  }, [data?.trip?.id, data?.trip?.banner_image, data?.trip?.destination]);

  if (loading) return <FlightPathLoader text="Loading your Pocket Guide..." />;
  if (error) return <ErrorScreen message={error} />;
  if (!data) return <ErrorScreen message="No data found." />;

  const { trip, itinerary, flights, accommodation, activities, dining, transportation, days, documents, checklist } = data;

  const startDate = itinerary.start_date || trip.start_date;
  const endDate = itinerary.end_date || trip.end_date;
  const allDates = getDaysBetween(startDate, endDate);

  // Build per-day payload
  const daySchedule = allDates.map((date, idx) => {
    const dayData = days.find((d) => d.date === date);

    // Flight legs departing this day
    const dayFlightLegs = flights.flatMap((f) =>
      (f.legs || [])
        .filter((l) => l.departure_date === date)
        .map((leg) => ({ ...leg, _flight: f }))
    );

    // Accommodations active this day (inclusive check-in, exclusive check-out)
    const dayStays = accommodation.filter((a) => {
      if (!a.check_in_date) return false;
      const checkOut = a.check_out_date || a.check_in_date;
      return date >= a.check_in_date && date < checkOut;
    });

    // Check-in / check-out events for this day
    const checkIns = accommodation.filter((a) => a.check_in_date === date);
    const checkOuts = accommodation.filter((a) => a.check_out_date === date);

    const dayActivities = activities.filter((a) => a.scheduled_date === date);
    const dayDining = dining.filter((d) => d.scheduled_date === date);
    const dayTransport = transportation.filter((t) => t.departure_date === date);

    return {
      date,
      dayNumber: idx + 1,
      title: dayData?.title || null,
      notes: dayData?.notes || null,
      userActivities: dayData?.activities || [],
      flightLegs: dayFlightLegs,
      stays: dayStays,
      checkIns,
      checkOuts,
      scheduledActivities: dayActivities,
      dining: dayDining,
      transportation: dayTransport,
    };
  });

  // Unscheduled items (no date assigned) — still worth showing so travellers don't lose them
  const unscheduledActivities = activities.filter((a) => !a.scheduled_date);
  const unscheduledDining = dining.filter((d) => !d.scheduled_date);
  const unscheduledTransport = transportation.filter((t) => !t.departure_date);

  const heroStyle = trip.banner_image
    ? { minHeight: "240px" }
    : { minHeight: "180px", background: "linear-gradient(135deg, rgba(218,123,74,0.55), rgba(80,65,50,0.65))" };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.9), rgba(195,178,155,0.95), rgba(175,158,135,1))" }}>
      {/* ─── Top bar: Planning (owner/collaborators only) + Share (everyone) ─── */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-3 flex justify-between items-start gap-2">
        {canEdit ? (
          <Link
            href={tripPlanningUrl(trip)}
            className="inline-flex items-center gap-1.5 text-white/95 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full backdrop-blur-sm hover:brightness-110 transition-all"
            style={{ background: "rgba(30,22,12,0.55)", border: "1px solid rgba(212,165,116,0.25)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Planning
          </Link>
        ) : (
          <span />
        )}
        <button
          ref={shareBtnRef}
          onClick={handleShareClick}
          className="inline-flex items-center gap-1.5 text-white/95 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full backdrop-blur-sm hover:brightness-110 transition-all"
          style={{ background: "rgba(30,22,12,0.55)", border: "1px solid rgba(212,165,116,0.25)" }}
          title="Share this Pocket Guide"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </button>
      </div>

      {/* ─── Share dropdown ─── */}
      {shareOpen && shareDropdownPos && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => { setShareOpen(false); setShareCopied(false); setShareDropdownPos(null); }} />
          <div
            className="fixed z-[101] bg-white rounded-xl shadow-xl border border-stone-200 px-4 py-3"
            style={{ top: shareDropdownPos.top, right: shareDropdownPos.right, width: 320 }}
          >
            <p className="text-xs font-medium text-stone-600 mb-2">Pocket Guide link</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex-1 text-xs text-stone-700 bg-stone-50 rounded-lg px-3 py-2 border border-stone-200 truncate"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={copyShareLink}
                className="text-xs px-3 py-2 rounded-lg font-semibold transition-colors flex-shrink-0"
                style={{ background: shareCopied ? "#4a965a" : "#da7b4a", color: "white" }}
              >
                {shareCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Anyone with the link can open this Pocket Guide — no login required.</p>
          </div>
        </>
      )}

      {/* ─── Hero banner ─── */}
      <header className="relative overflow-hidden" style={heroStyle}>
        {trip.banner_image && (
          <img
            src={trip.banner_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "sepia(0.1) saturate(1.05)" }}
          />
        )}
        {/* Bottom-weighted scrim so the hero text stays legible without dimming the whole image */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.55) 100%)" }} />
        <div className="relative z-10 px-5 pt-10 pb-8 flex flex-col justify-end" style={{ minHeight: heroStyle.minHeight }}>
          <div className="text-white/60 text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">Pocket Guide</div>
          <h1
            className="text-white text-4xl font-normal leading-tight mb-0.5"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "2px" }}
          >
            {trip.title || "Untitled Trip"}
          </h1>
          {itinerary?.title && (
            <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.15em] mb-1">
              {itinerary.title}
            </p>
          )}
          {trip.destination && (
            <p className="text-white/90 text-base font-semibold italic">{trip.destination}</p>
          )}
          {startDate && endDate && (
            <p className="text-white/70 text-sm mt-2">
              {formatDate(startDate)} — {formatDate(endDate)}
              {itinerary.num_travelers > 1 && ` · ${itinerary.num_travelers} travelers`}
            </p>
          )}
        </div>
      </header>

      <main className="px-4 pb-12 max-w-2xl mx-auto" style={{ marginTop: "-12px" }}>
        {/* ─── Itinerary notes (if any) — mt-6 so it clears the hero
            banner (the <main> has a -12px pull that we compensate for). ─── */}
        {itinerary.notes && (
          <div
            className="bg-white/80 rounded-xl px-5 py-4 mt-6 mb-4 shadow-sm"
            style={{ backdropFilter: "blur(4px)" }}
          >
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">Itinerary notes</div>
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{itinerary.notes}</p>
          </div>
        )}

        {/* ─── Day-by-day schedule ─── */}
        {daySchedule.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Day by Day</SectionHeader>
            <div className="space-y-4">
              {daySchedule.map((day) => (
                <DayCard
                  key={day.date}
                  day={day}
                  startDate={startDate}
                  canEdit={canEdit}
                  editingDayId={editingDayId}
                  setEditingDayId={setEditingDayId}
                  dayTitleDraft={dayTitleDraft}
                  setDayTitleDraft={setDayTitleDraft}
                  saveDayTitle={saveDayTitle}
                  allDays={data.days}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── Unscheduled items (not yet pinned to a date) ─── */}
        {(unscheduledActivities.length > 0 || unscheduledDining.length > 0 || unscheduledTransport.length > 0) && (
          <section className="mb-8">
            <SectionHeader>Not Yet Scheduled</SectionHeader>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-200 px-3 py-2 space-y-1.5">
              {unscheduledActivities.map((a) => (
                <PlainEventPill key={`u-a-${a.id}`} type="activity" name={a.name} detail="" address={a.location_name} />
              ))}
              {unscheduledDining.map((d) => (
                <PlainEventPill key={`u-d-${d.id}`} type="dining" name={d.name} detail={[d.cuisine_type, d.meal_type].filter(Boolean).join(" · ")} address={d.location_name} />
              ))}
              {unscheduledTransport.map((t) => (
                <PlainEventPill key={`u-t-${t.id}`} type="transportation" name={t.name} detail={`${t.pickup_location || ""} → ${t.dropoff_location || ""}`} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Travel documents ─── */}
        {documents.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Travel Documents</SectionHeader>
            <div
              className="bg-white/80 rounded-xl overflow-hidden shadow-sm"
              style={{ backdropFilter: "blur(4px)" }}
            >
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="px-5 py-3 border-b border-stone-100 last:border-b-0 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 text-[10px] font-bold uppercase">
                    {doc.doc_type?.slice(0, 3) || "DOC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{doc.name}</p>
                    {doc.reference_number && (
                      <p className="text-xs text-stone-400">Ref: {doc.reference_number}</p>
                    )}
                  </div>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#da7b4a] hover:text-[#b5552a] font-semibold flex-shrink-0"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Planning checklist (if any) ─── */}
        {checklist.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Planning Checklist</SectionHeader>
            <div
              className="bg-white/80 rounded-xl px-5 py-3 shadow-sm"
              style={{ backdropFilter: "blur(4px)" }}
            >
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 py-1.5">
                  <span
                    className={`text-sm ${
                      item.is_checked ? "line-through text-stone-400" : "text-stone-700"
                    }`}
                  >
                    {item.is_checked ? "☑" : "☐"} {item.text}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Footer ─── */}
        <footer className="text-center pt-4 pb-8">
          <p className="text-stone-500 text-xs">
            Crafted with{" "}
            <span className="font-semibold" style={{ color: "#da7b4a" }}>
              TripCraft
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════════════ */

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.9), rgba(195,178,155,0.95))" }}
    >
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-stone-400 border-t-[#da7b4a] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-600 text-sm tracking-wide">Loading your Pocket Guide…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.9), rgba(195,178,155,0.95))" }}
    >
      <div className="text-center px-8">
        <div className="text-4xl mb-3">🗺</div>
        <h2 className="text-stone-800 text-lg font-semibold mb-2">Guide Not Found</h2>
        <p className="text-stone-600 text-sm">{message}</p>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: "rgba(80, 65, 50, 0.65)" }}
    >
      {children}
    </h3>
  );
}

/* ── DayCard: replica of the calendar's DayPopout. Day title is
   inline-editable for the owner / accepted collaborators. ── */
function DayCard({ day, canEdit, editingDayId, setEditingDayId, dayTitleDraft, setDayTitleDraft, saveDayTitle, allDays }) {
  // Unified, sorted event list (flights + transport + activities + dining + check-ins + check-outs + user events)
  const events = buildDayEvents(day);

  const hasEvents = events.length > 0;
  const hasStays = day.stays.length > 0;
  const hasContent = hasEvents || hasStays || day.notes || day.title;

  const dateFormatted = formatDateLong(day.date);
  const dayOfWeek = formatDayOfWeek(day.date);

  // Days row for THIS date (may not exist yet — saveDayTitle will insert).
  const dayRow = (allDays || []).find((d) => d.date === day.date) || null;
  const isEditingTitle = editingDayId === day.date;

  function beginEditTitle(e) {
    if (!canEdit) return;
    e?.stopPropagation();
    setDayTitleDraft(day.title || "");
    setEditingDayId(day.date);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header — parchment bar with Day N + date */}
      <div
        className="px-5 pt-4 pb-3 border-b border-stone-200/60"
        style={{ background: "rgba(222,210,190,0.5)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="text-2xl font-bold text-[#da7b4a] whitespace-nowrap leading-none">
            DAY {day.dayNumber}
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide leading-tight">
              {dayOfWeek}
            </div>
            <div className="text-[11px] text-stone-400 leading-tight">{dateFormatted}</div>
          </div>
        </div>
        {isEditingTitle ? (
          <input
            type="text"
            value={dayTitleDraft}
            onChange={(e) => setDayTitleDraft(e.target.value)}
            onBlur={() => saveDayTitle(dayRow, day.date, dayTitleDraft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveDayTitle(dayRow, day.date, dayTitleDraft);
              if (e.key === "Escape") setEditingDayId(null);
            }}
            autoFocus
            placeholder="Day title"
            className="mt-1.5 w-full text-2xl font-bold text-stone-700 uppercase leading-tight bg-white border border-[#da7b4a]/60 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/40"
          />
        ) : day.title ? (
          <div
            className={`mt-1.5 text-2xl font-bold text-stone-700 uppercase leading-tight ${canEdit ? "cursor-text hover:text-[#da7b4a] transition-colors" : ""}`}
            onClick={beginEditTitle}
            title={canEdit ? "Click to edit day title" : ""}
          >
            {day.title}
          </div>
        ) : canEdit ? (
          <div
            className="mt-1.5 text-sm italic text-stone-400 hover:text-[#da7b4a] cursor-text transition-colors"
            onClick={beginEditTitle}
            title="Click to add a day title"
          >
            + Add day title
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Events */}
        {hasEvents ? (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <svg
                className="w-3.5 h-3.5 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                Day Itinerary
              </span>
            </div>
            <div className="space-y-1.5">
              {events.map((e) => (
                <EventPill key={e.key} event={e} />
              ))}
            </div>
          </div>
        ) : (
          !hasStays && !day.notes && (
            <p className="text-sm text-stone-400 italic">Free day</p>
          )
        )}

        {/* Current stay(s) — appears for every day covered by the stay */}
        {hasStays && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 text-stone-400"
              >
                <path d="M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z" />
              </svg>
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                Staying
              </span>
            </div>
            <div className="space-y-1.5">
              {day.stays.map((a) => {
                const c = CATEGORY_COLORS.accommodation;
                return (
                  <div
                    key={`stay-${a.id}`}
                    className={`flex items-center gap-2.5 ${c.bg} border ${c.border} rounded-lg px-3 py-2`}
                  >
                    <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${c.text}`}>{a.name}</span>
                      {a.location_name && (
                        <a
                          href={mapsSearchUrl(a.location_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="block text-xs text-stone-500 hover:text-[#da7b4a] hover:underline transition-colors mt-0.5"
                          title="Open in Google Maps"
                        >
                          <span className="inline-block mr-1">📍</span>{a.location_name}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {day.notes && (
          <div className="pt-2 border-t border-stone-100">
            <div className="text-sm text-stone-600 italic whitespace-pre-wrap">{day.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Build a unified, sorted list of events for one day ──
   Each event has:
     detail     — small non-address sublabel (airline, cuisine, etc.)
     address    — optional single location → maps search link
     directions — optional {from, to} → maps directions link        */
function buildDayEvents(day) {
  const events = [];

  // Flights (one entry per leg departing today)
  day.flightLegs.forEach((leg) => {
    events.push({
      key: `f-${leg.id}`,
      type: "flight",
      time: leg.departure_time?.slice(0, 5) || null,
      endTime: leg.arrival_time?.slice(0, 5) || null,
      name: `${leg.departure_airport || ""} → ${leg.arrival_airport || ""}`,
      detail: leg.airline_name || leg.airline_code || (leg.flight_number ? `Flight ${leg.flight_number}` : ""),
    });
  });

  // Check-ins (on check_in_date)
  day.checkIns.forEach((a) => {
    events.push({
      key: `ci-${a.id}`,
      type: "accommodation",
      time: null,
      name: `Check in: ${a.name}`,
      detail: "",
      address: a.location_name || null,
    });
  });

  // Check-outs (on check_out_date)
  day.checkOuts.forEach((a) => {
    events.push({
      key: `co-${a.id}`,
      type: "accommodation",
      time: null,
      name: `Check out: ${a.name}`,
      detail: "",
      address: a.location_name || null,
    });
  });

  // Transportation — two endpoints, render as maps directions link.
  day.transportation.forEach((t) => {
    events.push({
      key: `t-${t.id}`,
      type: "transportation",
      time: t.departure_time?.slice(0, 5) || null,
      endTime: t.arrival_time?.slice(0, 5) || null,
      name: t.name,
      detail: "",
      directions: (t.pickup_location || t.dropoff_location)
        ? { from: t.pickup_location || "", to: t.dropoff_location || "" }
        : null,
    });
  });

  // Scheduled activity options
  day.scheduledActivities.forEach((a) => {
    events.push({
      key: `a-${a.id}`,
      type: "activity",
      time: a.start_time?.slice(0, 5) || null,
      endTime: a.end_time?.slice(0, 5) || null,
      name: a.name,
      detail: "",
      address: a.location_name || null,
    });
  });

  // Dining options — cuisine/meal as non-address subtitle, location as map link.
  day.dining.forEach((d) => {
    const subtitle = [d.cuisine_type, d.meal_type].filter(Boolean).join(" · ");
    events.push({
      key: `d-${d.id}`,
      type: "dining",
      time: d.start_time?.slice(0, 5) || null,
      endTime: d.end_time?.slice(0, 5) || null,
      name: d.name,
      detail: subtitle,
      address: d.location_name || null,
    });
  });

  // User-created day events (calendar quick adds)
  day.userActivities.forEach((a) => {
    events.push({
      key: `ua-${a.id}`,
      type: a.category || "dayEvent",
      time: a.start_time?.slice(0, 5) || null,
      endTime: a.end_time?.slice(0, 5) || null,
      name: a.title,
      detail: "",
      address: a.location || null,
    });
  });

  // Sort: untimed first (preserves insertion order), then timed chronologically
  const untimed = events.filter((e) => !e.time);
  const timed = events.filter((e) => e.time).sort((a, b) => a.time.localeCompare(b.time));
  return [...untimed, ...timed];
}

/* ── EventPill: colored event row matching DayPopout's OptionEventCard look ──
   Renders the address (or pickup→dropoff for transportation) as a
   tappable Google Maps link so travelers can open directions in one tap. */
function EventPill({ event }) {
  const c = CATEGORY_COLORS[event.type] || CATEGORY_COLORS.dayEvent;

  const addressUrl = event.address ? mapsSearchUrl(event.address) : null;
  const directionsUrl = event.directions ? mapsDirectionsUrl(event.directions.from, event.directions.to) : null;
  const directionsLabel = event.directions
    ? [event.directions.from, event.directions.to].filter(Boolean).join(" → ")
    : "";

  return (
    <div className={`flex items-start gap-2.5 ${c.bg} border ${c.border} rounded-lg px-3 py-2`}>
      {/* Time column (matches OptionEventCard width) */}
      <div className="flex-shrink-0 w-16 mt-0.5">
        {event.time ? (
          <span className="text-xs text-stone-500 leading-tight block">
            {formatTime12h(event.time)}
            {event.endTime && (
              <>
                <br />
                <span className="text-stone-400">– {formatTime12h(event.endTime)}</span>
              </>
            )}
          </span>
        ) : (
          <span className="block" />
        )}
      </div>
      {/* Dot */}
      <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0 mt-[5px]`} />
      {/* Name + detail + address link */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${c.text} uppercase`}>{event.name}</span>
        {event.detail && (
          <span className="text-xs text-stone-400 ml-2 uppercase">{event.detail}</span>
        )}
        {addressUrl && (
          <a
            href={addressUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block text-xs text-stone-500 hover:text-[#da7b4a] hover:underline transition-colors mt-0.5"
            title="Open in Google Maps"
          >
            <span className="inline-block mr-1">📍</span>{event.address}
          </a>
        )}
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block text-xs text-stone-500 hover:text-[#da7b4a] hover:underline transition-colors mt-0.5"
            title="Open directions in Google Maps"
          >
            <span className="inline-block mr-1">📍</span>{directionsLabel}
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Compact pill for unscheduled items (no time column). If an
   address is provided, it renders as a tappable maps link. ── */
function PlainEventPill({ type, name, detail, address }) {
  const c = CATEGORY_COLORS[type] || CATEGORY_COLORS.dayEvent;
  const addressUrl = address ? mapsSearchUrl(address) : null;
  return (
    <div className={`flex items-center gap-2.5 ${c.bg} border ${c.border} rounded-lg px-3 py-2`}>
      <div className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${c.text}`}>{name}</span>
        {detail && <span className="text-xs text-stone-400 ml-2">{detail}</span>}
        {addressUrl && (
          <a
            href={addressUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-stone-500 hover:text-[#da7b4a] hover:underline transition-colors mt-0.5"
            title="Open in Google Maps"
          >
            <span className="inline-block mr-1">📍</span>{address}
          </a>
        )}
      </div>
    </div>
  );
}
