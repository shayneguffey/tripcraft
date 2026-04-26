"use client";

/* ══════════════════════════════════════════════════════════════════
   Trip Plan — printable, shareable PDF view of an itinerary.
   ──────────────────────────────────────────────────────────────────
   Three-part document with a vintage WPA-poster aesthetic:
     1. Presentation — banner, title, pitch, hero stats, TripCraft logo
     2. Trip Summary — stats strip, day-by-day TOC, route map, budget banner
     3. Trip Details — per-day pages with full event detail and inline costs;
                       budget summary as the final page

   Data sources:
     • GET /api/itinerary/[token]   public trip + itinerary + days + options
     • supabase.from("travelers")   client-side, RLS-scoped

   Privacy: the trip plan PDF is meant to be shareable. Anonymous viewers
   see everything except the travelers list (which is only visible to the
   trip owner and accepted collaborators via RLS).
   ══════════════════════════════════════════════════════════════════ */

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function formatLong(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}
function formatShort(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}
function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
function formatMoney(amount, currency) {
  if (amount == null || amount === "") return "";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${sym}${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function getDaysBetween(start, end) {
  if (!start || !end) return [];
  const arr = [];
  const c = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (c <= last) {
    arr.push(c.toISOString().split("T")[0]);
    c.setDate(c.getDate() + 1);
  }
  return arr;
}

const CAT_COLORS = {
  flight: "#7e9b5b",
  stay: "#4a7787",
  activity: "#d4a574",
  dining: "#c8624c",
  transport: "#6b5a8e",
};
const CAT_ICONS = {
  flight: "FLY",
  stay: "BED",
  activity: "★",
  dining: "EAT",
  transport: "GO",
};

export default function TripPlanPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/itinerary/${token}`);
        if (!res.ok) throw new Error("Trip not found");
        const json = await res.json();
        if (cancelled) return;
        setData(json);

        // Travelers — RLS-scoped; anonymous viewers get [].
        const { data: trav } = await supabase
          .from("travelers")
          .select("*")
          .eq("trip_id", json.trip.id)
          .order("sort_order", { ascending: true });
        if (!cancelled) setTravelers(trav || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading trip plan…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!data) return null;

  const { trip, itinerary, flights, accommodation, activities, dining, transportation, days } = data;
  const startDate = itinerary.start_date || trip.start_date;
  const endDate = itinerary.end_date || trip.end_date;
  const allDates = getDaysBetween(startDate, endDate);
  const numTravelers = Math.max(1, itinerary.num_travelers || 1);

  // Build per-day events (mirror the pocket guide).
  const daySchedule = allDates.map((date, idx) => {
    const dayRow = days.find((d) => d.date === date);
    const flightLegs = flights.flatMap((f) =>
      (f.legs || []).filter((l) => l.departure_date === date)
        .map((leg) => ({ ...leg, _airline: leg.airline_name || leg.airline_code, _option: f }))
    );
    const stays = accommodation.filter((a) => a.check_in_date && date >= a.check_in_date && date < (a.check_out_date || a.check_in_date));
    const checkIns = accommodation.filter((a) => a.check_in_date === date);
    const checkOuts = accommodation.filter((a) => a.check_out_date === date);
    const dayActs = activities.filter((a) => a.scheduled_date === date);
    const dayDining = dining.filter((d) => d.scheduled_date === date);
    const dayTransport = transportation.filter((t) =>
      t.departure_date === date || t.arrival_date === date
    );

    const events = [];
    flightLegs.forEach((l) => events.push({
      kind: "flight", time: l.departure_time?.slice(0, 5),
      label: `${l.departure_airport || ""} → ${l.arrival_airport || ""}`,
      sub: [l._airline, l.flight_number].filter(Boolean).join(" "),
      cost: l._option?.total_price,
      currency: l._option?.currency,
    }));
    checkIns.forEach((a) => events.push({
      kind: "stay", time: null, label: `Check in: ${a.name}`, sub: a.location_name || a.address || "",
      cost: a.total_price, currency: a.currency,
    }));
    checkOuts.forEach((a) => events.push({
      kind: "stay", time: null, label: `Check out: ${a.name}`, sub: "",
    }));
    dayActs.forEach((a) => events.push({
      kind: "activity", time: a.start_time?.slice(0, 5), label: a.name,
      sub: a.location_name || a.address || "",
      cost: a.price, currency: a.currency,
    }));
    dayDining.forEach((d) => events.push({
      kind: "dining", time: d.start_time?.slice(0, 5), label: d.name,
      sub: [d.cuisine_type !== "Other" ? d.cuisine_type : null, d.location_name || d.address].filter(Boolean).join(" · "),
      cost: d.avg_meal_cost, currency: d.currency,
    }));
    dayTransport.forEach((t) => {
      const isReturn = t.arrival_date === date && t.departure_date !== date;
      events.push({
        kind: "transport", time: isReturn ? t.arrival_time?.slice(0, 5) : t.departure_time?.slice(0, 5),
        label: isReturn ? `↩ ${t.name}` : t.name,
        sub: [t.pickup_location, t.dropoff_location].filter(Boolean).join(" → "),
        cost: isReturn ? null : t.price,
        currency: t.currency,
      });
    });

    const timed = events.filter((e) => e.time).sort((a, b) => a.time.localeCompare(b.time));
    const untimed = events.filter((e) => !e.time);

    return {
      date,
      dayNumber: idx + 1,
      title: dayRow?.title || null,
      summary: dayRow?.summary || null,
      events: [...untimed, ...timed],
      stays,
    };
  });

  // Budget rollup — same logic as BudgetTracker, simplified.
  const flightTotal = flights.reduce((s, f) => s + (f.total_price ? Number(f.total_price) : 0), 0);
  const stayTotal = accommodation.reduce((s, a) => s + (a.total_price ? Number(a.total_price) : 0), 0);
  const actTotal = activities.reduce((s, a) => s + (a.price ? Number(a.price) : 0), 0) * numTravelers;
  const diningTotal = dining.reduce((s, d) => s + (d.avg_meal_cost ? Number(d.avg_meal_cost) : 0), 0) * numTravelers;
  const transTotal = transportation.reduce((s, t) => {
    const p = t.price ? Number(t.price) : 0;
    return s + (t.category === "car_rental" ? p : p * numTravelers);
  }, 0);
  const grandTotal = flightTotal + stayTotal + actTotal + diningTotal + transTotal;
  const budgetRows = [
    { name: "Flights", color: "#7e9b5b", amount: flightTotal },
    { name: "Stays", color: "#4a7787", amount: stayTotal },
    { name: "Transportation", color: "#6b5a8e", amount: transTotal },
    { name: "Dining", color: "#c8624c", amount: diningTotal },
    { name: "Activities", color: "#d4a574", amount: actTotal },
  ].filter((r) => r.amount > 0);
  const maxBudget = Math.max(1, ...budgetRows.map((r) => r.amount));

  return (
    <div className="trip-plan">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lora:ital,wght@0,400;0,600;1,400&family=Oswald:wght@400;600&display=swap');
        @page { margin: 0.6in 0.7in; }
        @media print {
          .no-print { display: none !important; }
          .page { page-break-after: always; box-shadow: none !important; margin: 0 !important; }
          body { background: white !important; }
        }
        .trip-plan { background: #b8a890; min-height: 100vh; padding: 24px 0; }
        .trip-plan .page {
          width: 8.5in; min-height: 11in;
          margin: 24px auto;
          background: #f1e6d2;
          padding: 0.6in 0.7in;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
          position: relative;
          color: #2a1f14;
          font-family: "Lora", Georgia, serif;
        }
        .trip-plan h1, .trip-plan h2, .trip-plan .display { font-family: "Bebas Neue", Impact, sans-serif; letter-spacing: 0.04em; font-weight: 400; }
        .trip-plan .label { font-family: "Oswald", sans-serif; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 600; font-size: 10px; color: rgba(42,31,20,0.6); }
        .trip-plan .accent-rule { height: 3px; background: #da7b4a; width: 80px; margin: 8px 0 16px; }
        .trip-plan .section-tag { position: absolute; top: 0.4in; right: 0.7in; font-family: "Oswald", sans-serif; font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(42,31,20,0.55); font-weight: 600; }
      `}</style>

      {/* Toolbar — screen only */}
      <div className="no-print" style={{ maxWidth: "8.5in", margin: "0 auto 12px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 12px" }}>
        <a href={`/guide/${token}`} style={{ color: "#2a1f14", fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>← Back to Pocket Guide</a>
        <button
          onClick={() => window.print()}
          style={{ background: "#da7b4a", color: "#f1e6d2", padding: "10px 18px", border: "none", fontFamily: "Oswald, sans-serif", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer" }}
        >
          Save as PDF
        </button>
      </div>

      {/* ─── PART 1 · PRESENTATION ─── */}
      <div className="page" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          height: "8.2in", position: "relative", color: "#f1e6d2", overflow: "hidden",
          background: trip.banner_image
            ? `linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%), url(${trip.banner_image}) center/cover`
            : "linear-gradient(180deg, rgba(218,123,74,0.22) 0%, rgba(74,119,135,0.55) 60%, rgba(42,31,20,0.85) 100%)",
        }}>
          <div style={{ position: "absolute", top: "0.4in", left: 0, right: 0, textAlign: "center" }}>
            <div style={{ height: 4, background: "#f1e6d2", margin: "6px auto", opacity: 0.75, width: "50%" }} />
            <div style={{ height: 4, background: "#f1e6d2", margin: "6px auto", opacity: 0.75, width: "60%" }} />
            <div style={{ height: 4, background: "#f1e6d2", margin: "6px auto", opacity: 0.75, width: "70%" }} />
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.6in 0.7in" }}>
            <div style={{ color: "#f4c177", fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.32em", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>— Trip Plan —</div>
            <div className="display" style={{ fontSize: 96, lineHeight: 0.92, color: "#f6efe0", letterSpacing: "0.06em", marginBottom: 6, textShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
              {(trip.title || "Untitled Trip").toUpperCase()}
            </div>
            {trip.destination && <div style={{ fontStyle: "italic", fontSize: 22, color: "#f4c177", marginBottom: 14 }}>{trip.destination}</div>}
            <div style={{ display: "flex", gap: 24, color: "rgba(241,230,210,0.92)", fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 12, fontWeight: 600 }}>
              <span style={{ borderRight: "1px solid rgba(241,230,210,0.4)", paddingRight: 24 }}>{allDates.length} Days</span>
              <span style={{ borderRight: "1px solid rgba(241,230,210,0.4)", paddingRight: 24 }}>{numTravelers} {numTravelers === 1 ? "Traveler" : "Travelers"}</span>
              <span>{formatShort(startDate)} – {formatShort(endDate)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0.4in 0.7in", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 28, alignItems: "end", background: "#f1e6d2", minHeight: "1.4in" }}>
          <div style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 14.5, lineHeight: 1.6, color: "rgba(42,31,20,0.85)" }}>
            <span className="label" style={{ display: "block", marginBottom: 6, fontStyle: "normal" }}>— The Pitch</span>
            {itinerary.pitch || (
              <span style={{ color: "rgba(42,31,20,0.45)" }}>
                Add a trip pitch in the planning page to surface it here. A few sentences capturing the
                spirit of the trip — what makes it worth taking.
              </span>
            )}
          </div>
          <img
            src="/TRIPCRAFTLOGO.png"
            alt="TripCraft"
            style={{ height: 110, width: "auto", margin: "0 auto", display: "block", filter: "brightness(0.85)" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            <StatCell num={allDates.length} label="Days" />
            <StatCell num={numTravelers} label="Travelers" />
            <StatCell num={accommodation.length} label="Stays" />
            <StatCell num={formatMoney(grandTotal, "USD")} label="All-In" />
          </div>
        </div>
      </div>

      {/* ─── PART 2 · TRIP SUMMARY ─── */}
      <div className="page">
        <div className="section-tag">— Trip Summary —</div>
        <div className="label">Part Two · The Trip At A Glance</div>
        <h1 style={{ fontSize: 64 }}>The Whole Picture</h1>
        <div className="accent-rule"></div>

        <div style={{ borderTop: "1px solid #2a1f14", borderBottom: "1px solid #2a1f14", padding: "14px 0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 16 }}>
          <SummaryStatCell num={allDates.length} label="Days" />
          <SummaryStatCell num={activities.length} label="Activities" />
          <SummaryStatCell num={dining.length} label="Meals" />
          <SummaryStatCell num={accommodation.length} label="Stays" />
        </div>

        {travelers.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="label">Travelers</div>
            <div className="accent-rule" style={{ width: 40, marginTop: 6 }}></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
              {travelers.map((t) => (
                <div key={t.id} style={{ border: "1px solid rgba(42,31,20,0.18)", padding: "6px 12px", fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11, fontWeight: 600 }}>
                  {t.name}{t.role && <span style={{ color: "rgba(42,31,20,0.55)" }}> · {t.role}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <div className="label" style={{ marginBottom: 10 }}>The Days</div>
          {daySchedule.map((d) => (
            <div key={d.date} style={{ display: "grid", gridTemplateColumns: "50px 100px 1fr", gap: 14, padding: "8px 0", borderBottom: "1px dashed rgba(42,31,20,0.18)", alignItems: "baseline" }}>
              <span className="display" style={{ fontSize: 22, color: "#da7b4a" }}>{String(d.dayNumber).padStart(2, "0")}</span>
              <span style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.16em", color: "rgba(42,31,20,0.6)", fontWeight: 600 }}>{formatShort(d.date)}</span>
              <span className="display" style={{ fontSize: 18 }}>{(d.title || "Open day").toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Posterized map placeholder */}
        <div style={{ marginTop: 22, height: "2.6in", position: "relative", border: "2px solid rgba(42,31,20,0.5)",
          background: "linear-gradient(135deg, rgba(74,119,135,0.18) 0%, rgba(126,155,91,0.18) 50%, rgba(212,165,116,0.18) 100%), repeating-linear-gradient(45deg, rgba(42,31,20,0.04) 0 8px, transparent 8px 16px), #f1e6d2",
          overflow: "hidden" }}>
          <span className="label" style={{ position: "absolute", top: 12, left: 14 }}>— The Route</span>
          <div style={{ position: "absolute", top: 14, right: 16, width: 36, height: 36, border: "2px solid #2a1f14", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bebas Neue, sans-serif", fontSize: 16 }}>N</div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%",
            background: "linear-gradient(180deg, rgba(74,119,135,0.06), rgba(74,119,135,0.18))",
            clipPath: "polygon(0 30%, 18% 22%, 32% 36%, 48% 18%, 64% 30%, 80% 22%, 100% 36%, 100% 100%, 0 100%)" }} />
          <div style={{ position: "absolute", left: "12%", right: "12%", top: "50%",
            height: 2, background: "repeating-linear-gradient(90deg, #da7b4a 0 8px, transparent 8px 14px)",
            transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", top: "50%", left: "12%", transform: "translate(-50%,-50%)" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#da7b4a", border: "3px solid #f1e6d2", boxShadow: "0 0 0 2px #da7b4a" }} />
          </div>
          <div style={{ position: "absolute", top: "50%", right: "12%", transform: "translate(50%,-50%)" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#da7b4a", border: "3px solid #f1e6d2", boxShadow: "0 0 0 2px #da7b4a" }} />
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 14, fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, fontWeight: 600 }}>
            Route map · stylized placeholder
          </div>
        </div>

        <div style={{ marginTop: 22, padding: "16px 18px",
          background: "linear-gradient(90deg, rgba(218,123,74,0.10), rgba(218,123,74,0.04))",
          borderLeft: "4px solid #da7b4a",
          display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 22, alignItems: "center" }}>
          <div className="display" style={{ fontSize: 44, color: "#da7b4a" }}>{formatMoney(grandTotal, "USD")}</div>
          <div style={{ fontSize: 13, color: "rgba(42,31,20,0.8)", lineHeight: 1.5 }}>
            <span className="label" style={{ display: "block", marginBottom: 4 }}>— All-In, Estimated</span>
            Detailed costs follow per-day in the trip details section. Final breakdown summarized
            on the last page.
          </div>
          <div style={{ textAlign: "right", fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.16em", color: "rgba(42,31,20,0.6)", fontWeight: 600 }}>
            Per Traveler<br/>
            <b className="display" style={{ fontSize: 24, color: "#2a1f14", marginTop: 2, display: "block" }}>{formatMoney(grandTotal / numTravelers, "USD")}</b>
          </div>
        </div>
      </div>

      {/* ─── PART 3 · TRIP DETAILS · day pages ─── */}
      {daySchedule.map((d) => (
        <div key={d.date} className="page">
          <div className="section-tag">— Trip Details —</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, borderBottom: "3px solid #2a1f14", paddingBottom: 8, marginBottom: 18 }}>
            <div className="display" style={{ fontSize: 78, color: "#da7b4a", lineHeight: 0.85 }}>{String(d.dayNumber).padStart(2, "0")}</div>
            <div>
              <span className="label">{new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })}</span>
              <div className="display" style={{ fontSize: 28, marginTop: 4 }}>{formatLong(d.date)}</div>
              {d.title && <div className="display" style={{ fontSize: 36, marginTop: 4 }}>{d.title.toUpperCase()}</div>}
            </div>
          </div>

          {d.summary && (
            <div style={{ marginBottom: 14, background: "rgba(218,123,74,0.08)", borderLeft: "4px solid #da7b4a",
              padding: "12px 16px", fontStyle: "italic", fontSize: 13.5, lineHeight: 1.5, color: "rgba(42,31,20,0.85)" }}>
              {d.summary}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2.4in", gap: 24 }}>
            <div>
              {d.events.length === 0 && d.stays.length === 0 ? (
                <div style={{ fontStyle: "italic", color: "rgba(42,31,20,0.5)", padding: "20px 0" }}>Free day</div>
              ) : (
                d.events.map((e, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "64px 28px 1fr auto", gap: 14, padding: "11px 0", borderBottom: "1px dashed rgba(42,31,20,0.18)", alignItems: "start" }}>
                    <div style={{ fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11, fontWeight: 600, paddingTop: 2 }}>
                      {e.time ? formatTime(e.time) : "—"}
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                      background: CAT_COLORS[e.kind], color: e.kind === "activity" ? "#2a1f14" : "white",
                      fontFamily: "Bebas Neue, sans-serif", fontSize: 13 }}>
                      {CAT_ICONS[e.kind]}
                    </div>
                    <div>
                      <div className="display" style={{ fontSize: 17 }}>{e.label}</div>
                      {e.sub && <div style={{ fontSize: 12, color: "rgba(42,31,20,0.7)", marginTop: 2, lineHeight: 1.4 }}>{e.sub}</div>}
                    </div>
                    <div className="display" style={{ fontSize: 16, color: "#da7b4a", whiteSpace: "nowrap" }}>
                      {e.cost ? formatMoney(e.cost, e.currency) : ""}
                    </div>
                  </div>
                ))
              )}
              {d.stays.map((a) => (
                <div key={`stay-${a.id}`} style={{ display: "grid", gridTemplateColumns: "64px 28px 1fr auto", gap: 14, padding: "11px 0", borderBottom: "1px dashed rgba(42,31,20,0.18)", alignItems: "start" }}>
                  <div style={{ fontFamily: "Oswald, sans-serif", fontSize: 11, color: "rgba(42,31,20,0.5)", paddingTop: 2 }}>STAY</div>
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: CAT_COLORS.stay, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Bebas Neue, sans-serif", fontSize: 13 }}>BED</div>
                  <div>
                    <div className="display" style={{ fontSize: 17 }}>{a.name}</div>
                    {a.location_name && <div style={{ fontSize: 12, color: "rgba(42,31,20,0.7)" }}>{a.location_name}</div>}
                  </div>
                  <div></div>
                </div>
              ))}
            </div>

            <aside>
              <div style={{
                height: "2.3in",
                background: "repeating-linear-gradient(45deg, rgba(42,31,20,0.04) 0 8px, transparent 8px 16px), rgba(42,31,20,0.04)",
                border: "1.5px dashed rgba(42,31,20,0.25)", color: "rgba(42,31,20,0.45)",
                fontFamily: "Oswald, sans-serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: 10, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 12,
              }}>
                Day Image<br/><span style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.18em" }}>placeholder</span>
              </div>
            </aside>
          </div>

          <div style={{ marginTop: 40, textAlign: "center", opacity: 0.5, fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.3em" }}>
            — Day {d.dayNumber} of {allDates.length} · {formatShort(d.date)} —
          </div>
        </div>
      ))}

      {/* ─── BUDGET SUMMARY (final page of details) ─── */}
      <div className="page">
        <div className="section-tag">— Trip Details —</div>
        <div className="label">Final Page</div>
        <h1 style={{ fontSize: 72 }}>Budget Summary</h1>
        <div className="accent-rule"></div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "20px 0", paddingBottom: 14, borderBottom: "3px solid #2a1f14" }}>
          <div>
            <div className="display" style={{ fontSize: 56, color: "#da7b4a" }}>{formatMoney(grandTotal, "USD")}</div>
            <div style={{ fontSize: 13, color: "rgba(42,31,20,0.7)" }}>
              All-in for {numTravelers} {numTravelers === 1 ? "traveler" : "travelers"} ·
              {` ~${formatMoney(grandTotal / numTravelers, "USD")} each`} ·
              {` ${formatMoney(grandTotal / Math.max(1, allDates.length), "USD")} / day`}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="label" style={{ fontSize: 11 }}>Status</div>
            <div className="display" style={{ fontSize: 24, color: "#da7b4a" }}>Estimated</div>
          </div>
        </div>

        {budgetRows.map((r) => (
          <div key={r.name} style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 60px", gap: 16, padding: "12px 0", borderBottom: "1px dashed rgba(42,31,20,0.18)", alignItems: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 3, background: r.color }} />
            <div className="display" style={{ fontSize: 22 }}>{r.name}</div>
            <div style={{ background: "rgba(42,31,20,0.08)", height: 14, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: r.color, width: `${(r.amount / maxBudget) * 100}%` }} />
            </div>
            <div className="display" style={{ fontSize: 22, textAlign: "right" }}>{formatMoney(r.amount, "USD")}</div>
          </div>
        ))}

        <div style={{ marginTop: 28, padding: 16, background: "rgba(74,119,135,0.08)", border: "1px solid rgba(74,119,135,0.3)" }}>
          <div className="label">Note</div>
          <div style={{ fontStyle: "italic", fontSize: 13, lineHeight: 1.55, marginTop: 6 }}>
            Detailed costs are shown per day in the previous pages. This page summarizes the trip totals.
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: "center", opacity: 0.5, fontFamily: "Oswald, sans-serif", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.3em" }}>
          — End of Plan —
        </div>
      </div>
    </div>
  );
}

function StatCell({ num, label }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div className="display" style={{ fontSize: 36, color: "#da7b4a", lineHeight: 1 }}>{num}</div>
      <div className="label" style={{ fontSize: 9, marginTop: 4 }}>{label}</div>
    </div>
  );
}
function SummaryStatCell({ num, label }) {
  return (
    <div style={{ textAlign: "center", borderRight: "1px solid rgba(42,31,20,0.18)", padding: "0 10px" }}>
      <div className="display" style={{ fontSize: 36, color: "#da7b4a", lineHeight: 1 }}>{num}</div>
      <div className="label" style={{ fontSize: 9, marginTop: 4 }}>{label}</div>
    </div>
  );
}
