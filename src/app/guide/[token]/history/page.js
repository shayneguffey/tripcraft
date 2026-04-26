"use client";

/* ══════════════════════════════════════════════════════════════════
   Travel History — printable PDF view of a trip
   ──────────────────────────────────────────────────────────────────
   A read-only, print-optimized rendering of the Pocket Guide that
   includes the user's private journal entries. Designed to be saved
   as a PDF via the browser's print dialog (Cmd/Ctrl+P → Save as PDF).

   Data sources:
     • GET /api/itinerary/[token]          — public trip data (service-role)
     • supabase.from("day_journals")       — current user's entries (RLS)

   Privacy: journal entries appear only when the viewer is signed in as
   the entry author. Anonymous viewers get a print-formatted itinerary
   without journals.
   ══════════════════════════════════════════════════════════════════ */

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const hh = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getDaysBetween(start, end) {
  if (!start || !end) return [];
  const days = [];
  const cur = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (cur <= last) {
    days.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export default function TravelHistoryPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [journals, setJournals] = useState({}); // date → content
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/itinerary/${token}`);
        if (!res.ok) throw new Error("Pocket Guide link is invalid or has expired.");
        const json = await res.json();
        if (cancelled) return;
        setData(json);

        // Pull the current user's journal entries for this trip (RLS-scoped).
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (user) {
          const { data: js } = await supabase
            .from("day_journals")
            .select("date, content")
            .eq("trip_id", json.trip.id)
            .eq("user_id", user.id);
          if (cancelled) return;
          const map = {};
          (js || []).forEach((j) => {
            if (j.content) map[j.date] = j.content;
          });
          setJournals(map);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading travel history…</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  if (!data) return null;

  const { trip, itinerary, flights, accommodation, activities, dining, transportation, days } = data;
  const startDate = itinerary.start_date || trip.start_date;
  const endDate = itinerary.end_date || trip.end_date;
  const allDates = getDaysBetween(startDate, endDate);

  // Build per-day event list (mirrors the pocket guide's logic).
  const daySchedule = allDates.map((date, idx) => {
    const dayRow = days.find((d) => d.date === date);

    const flightLegs = flights.flatMap((f) =>
      (f.legs || []).filter((l) => l.departure_date === date).map((leg) => ({ ...leg, _airline: f.legs?.[0]?.airline_name }))
    );
    const stays = accommodation.filter((a) => {
      if (!a.check_in_date) return false;
      const out = a.check_out_date || a.check_in_date;
      return date >= a.check_in_date && date < out;
    });
    const checkIns = accommodation.filter((a) => a.check_in_date === date);
    const checkOuts = accommodation.filter((a) => a.check_out_date === date);
    const dayActs = activities.filter((a) => a.scheduled_date === date);
    const dayDining = dining.filter((d) => d.scheduled_date === date);
    const dayTransport = transportation.filter((t) =>
      t.departure_date === date || t.arrival_date === date
    );

    // Combine + sort chronologically.
    const events = [];
    flightLegs.forEach((l) => events.push({
      kind: "flight",
      time: l.departure_time?.slice(0, 5),
      label: `${l.departure_airport || ""} → ${l.arrival_airport || ""}`,
      sub: [l.airline_name || l.airline_code, l.flight_number].filter(Boolean).join(" "),
    }));
    checkIns.forEach((a) => events.push({
      kind: "stay-in",
      time: null,
      label: `Check in: ${a.name}`,
      sub: a.location_name || a.address || "",
    }));
    checkOuts.forEach((a) => events.push({
      kind: "stay-out",
      time: null,
      label: `Check out: ${a.name}`,
      sub: "",
    }));
    dayActs.forEach((a) => events.push({
      kind: "activity",
      time: a.start_time?.slice(0, 5),
      endTime: a.end_time?.slice(0, 5),
      label: a.name,
      sub: a.location_name || a.address || "",
    }));
    dayDining.forEach((d) => events.push({
      kind: "dining",
      time: d.start_time?.slice(0, 5),
      label: d.name,
      sub: [d.cuisine_type !== "Other" ? d.cuisine_type : null, d.location_name || d.address].filter(Boolean).join(" · "),
    }));
    dayTransport.forEach((t) => {
      const isReturn = t.arrival_date === date && t.departure_date !== date;
      events.push({
        kind: "transportation",
        time: isReturn ? t.arrival_time?.slice(0, 5) : t.departure_time?.slice(0, 5),
        label: isReturn ? `↩ ${t.name}` : t.name,
        sub: [t.pickup_location, t.dropoff_location].filter(Boolean).join(" → "),
      });
    });

    const timed = events.filter((e) => e.time).sort((a, b) => a.time.localeCompare(b.time));
    const untimed = events.filter((e) => !e.time);

    return {
      date,
      dayNumber: idx + 1,
      title: dayRow?.title || null,
      notes: dayRow?.notes || null,
      events: [...untimed, ...timed],
      stays,
      journal: journals[date] || null,
    };
  });

  // Trip-level summary.
  const totals = {
    days: allDates.length,
    flights: flights.length,
    activities: activities.length,
    dining: dining.length,
    transport: transportation.length,
    accommodations: accommodation.length,
    journals: Object.keys(journals).length,
  };

  return (
    <div className="travel-history">
      <style jsx global>{`
        @page { margin: 0.75in; }
        @media print {
          .no-print { display: none !important; }
          .day-section { page-break-inside: avoid; break-inside: avoid; }
          .cover { page-break-after: always; break-after: page; }
          body { background: white !important; }
        }
        .travel-history h1 { font-family: var(--font-bebas), sans-serif; letter-spacing: 0.05em; }
        .travel-history h2 { font-family: var(--font-bebas), sans-serif; letter-spacing: 0.04em; }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 py-8 print:px-0 print:py-0 print:max-w-none">
        {/* Top toolbar — only on screen */}
        <div className="no-print flex items-center justify-between mb-6">
          <a href={`/guide/${token}`} className="text-sm text-stone-500 hover:text-[#da7b4a]">← Back to Pocket Guide</a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#da7b4a] text-white text-sm font-semibold hover:brightness-110 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Save as PDF
          </button>
        </div>

        {/* COVER */}
        <div className="cover mb-10">
          {trip.banner_image && (
            <img
              src={trip.banner_image}
              alt={trip.title}
              className="w-full h-72 object-cover rounded-2xl mb-6 print:rounded-none"
            />
          )}
          <div className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-1">Travel History</div>
          <h1 className="text-5xl font-normal text-stone-900 mb-2">{(trip.title || "Untitled Trip").toUpperCase()}</h1>
          {itinerary?.title && (
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-500 mb-2">
              Itinerary: {itinerary.title}
            </p>
          )}
          {trip.destination && <p className="text-lg italic text-stone-700 mb-1">{trip.destination}</p>}
          {startDate && endDate && (
            <p className="text-sm text-stone-600">
              {formatDate(startDate)} — {formatDate(endDate)}
              {itinerary.num_travelers > 1 && ` · ${itinerary.num_travelers} travelers`}
            </p>
          )}

          {itinerary.notes && (
            <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200 print:border-stone-400">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Itinerary notes</div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{itinerary.notes}</p>
            </div>
          )}

          {/* Summary chips */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <SummaryChip label="Days" value={totals.days} />
            <SummaryChip label="Flights" value={totals.flights} />
            <SummaryChip label="Stays" value={totals.accommodations} />
            <SummaryChip label="Activities" value={totals.activities} />
            <SummaryChip label="Meals" value={totals.dining} />
            <SummaryChip label="Journal entries" value={totals.journals} />
          </div>
        </div>

        {/* DAY BY DAY */}
        <h2 className="text-3xl font-normal text-stone-900 mb-6">Day by Day</h2>
        {daySchedule.map((day) => (
          <div key={day.date} className="day-section mb-8 pb-6 border-b border-stone-200 print:border-stone-300">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-[#da7b4a]">DAY {day.dayNumber}</span>
              <span className="text-sm text-stone-500">{formatDate(day.date)}</span>
            </div>
            {day.title && (
              <h3 className="text-xl font-bold uppercase text-stone-800 mb-2">{day.title}</h3>
            )}

            {day.events.length === 0 && day.stays.length === 0 ? (
              <p className="text-sm italic text-stone-400 mb-3">Free day</p>
            ) : (
              <ul className="space-y-1.5 mb-3">
                {day.events.map((e, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-stone-500 w-20 flex-shrink-0">{e.time ? formatTime(e.time) : "—"}</span>
                    <div className="flex-1">
                      <div className="font-medium text-stone-800 uppercase">{e.label}</div>
                      {e.sub && <div className="text-xs text-stone-500">{e.sub}</div>}
                    </div>
                  </li>
                ))}
                {day.stays.length > 0 && day.stays.map((a) => (
                  <li key={`stay-${a.id}`} className="flex gap-3 text-sm pt-1">
                    <span className="text-stone-500 w-20 flex-shrink-0">Staying</span>
                    <div className="flex-1">
                      <div className="font-medium text-stone-700">{a.name}</div>
                      {a.location_name && <div className="text-xs text-stone-500">{a.location_name}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {day.notes && (
              <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200 print:border-stone-300">
                <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Day notes</div>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{day.notes}</p>
              </div>
            )}

            {day.journal && (
              <div className="mt-3 p-4 bg-amber-50/40 rounded-lg border border-amber-200/60 print:border-amber-400/60">
                <div className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold mb-1">Travel Journal</div>
                <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">{day.journal}</p>
              </div>
            )}
          </div>
        ))}

        <div className="text-center text-xs text-stone-400 mt-10 mb-4">
          Generated by TripCraft · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="bg-stone-50 rounded-lg border border-stone-200 print:border-stone-300 px-3 py-2">
      <div className="text-2xl font-bold text-stone-800">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
    </div>
  );
}
