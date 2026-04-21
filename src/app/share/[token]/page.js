"use client";

import { use, useEffect, useState } from "react";

/* ─── Helpers ─── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatDuration(mins) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatCurrency(amount, currency = "USD") {
  if (!amount && amount !== 0) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
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

/* ─── Category colors ─── */
const CAT_COLORS = {
  flight: { bg: "#ecfdf5", border: "#10b981", text: "#065f46", icon: "✈" },
  accommodation: { bg: "#f0f9ff", border: "#0ea5e9", text: "#0c4a6e", icon: "🏨" },
  activity: { bg: "#fefce8", border: "#eab308", text: "#713f12", icon: "🗺" },
  dining: { bg: "#fff7ed", border: "#f97316", text: "#7c2d12", icon: "🍽" },
  transportation: { bg: "#f5f3ff", border: "#8b5cf6", text: "#3b0764", icon: "🚗" },
};

/* ═══════════════════════════════════════════════════ */
/*  Main Page Component                                */
/* ═══════════════════════════════════════════════════ */
export default function SharePage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/itinerary/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("This itinerary link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!data) return <ErrorScreen message="No data found." />;

  const { trip, itinerary, flights, accommodation, activities, dining, transportation, days, documents, checklist } = data;

  const startDate = itinerary.start_date || trip.start_date;
  const endDate = itinerary.end_date || trip.end_date;
  const allDates = getDaysBetween(startDate, endDate);

  // Build a day-by-day schedule
  const daySchedule = allDates.map((date, idx) => {
    const dayData = days.find((d) => d.date === date);

    // Find events on this date
    const dayFlights = flights.filter((f) =>
      f.legs?.some((l) => l.departure_date === date || l.arrival_date === date)
    );
    const dayAccommodation = accommodation.filter(
      (a) => a.check_in_date === date || a.check_out_date === date
    );
    const dayActivities = activities.filter((a) => a.scheduled_date === date);
    const dayDining = dining.filter((d) => d.scheduled_date === date);
    const dayTransport = transportation.filter((t) => t.departure_date === date);

    return {
      date,
      dayNumber: idx + 1,
      title: dayData?.title || null,
      notes: dayData?.notes || null,
      activities: dayData?.activities || [],
      flights: dayFlights,
      accommodation: dayAccommodation,
      scheduledActivities: dayActivities,
      dining: dayDining,
      transportation: dayTransport,
    };
  });

  // Unscheduled items (no date assigned)
  const unscheduledActivities = activities.filter((a) => !a.scheduled_date);
  const unscheduledDining = dining.filter((d) => !d.scheduled_date);
  const unscheduledTransport = transportation.filter((t) => !t.departure_date);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.9), rgba(195,178,155,0.95), rgba(175,158,135,1))" }}>
      {/* ─── Hero Banner ─── */}
      <header className="relative overflow-hidden" style={{ minHeight: "220px" }}>
        {trip.banner_image && (
          <img
            src={trip.banner_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "sepia(0.15) saturate(1.1) brightness(0.85)" }}
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55))" }} />
        <div className="relative z-10 px-5 pt-6 pb-8 flex flex-col justify-end h-full" style={{ minHeight: "220px" }}>
          <div className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">TripCraft Itinerary</div>
          <h1 className="text-white text-4xl font-normal leading-tight mb-0.5" style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "2px" }}>
            {trip.name || "My Trip"}
          </h1>
          {trip.destination && (
            <p className="text-white/90 text-base font-semibold italic">{trip.destination}</p>
          )}
          {startDate && endDate && (
            <p className="text-white/70 text-sm mt-2">
              {formatDate(startDate)} — {formatDate(endDate)}
              {itinerary.num_travelers > 1 && ` · ${itinerary.num_travelers} travelers`}
            </p>
          )}
          {itinerary.title && itinerary.title !== "Itinerary 1" && (
            <p className="text-white/60 text-xs mt-1 uppercase tracking-wide">{itinerary.title}</p>
          )}
        </div>
      </header>

      <main className="px-4 pb-12 max-w-2xl mx-auto" style={{ marginTop: "-12px" }}>
        {/* ─── Itinerary Description ─── */}
        {itinerary.description && (
          <div className="bg-white/80 rounded-xl px-5 py-4 mb-4 shadow-sm" style={{ backdropFilter: "blur(4px)" }}>
            <p className="text-stone-700 text-sm leading-relaxed">{itinerary.description}</p>
          </div>
        )}

        {/* ─── Quick Summary Cards ─── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {flights.length > 0 && (
            <SummaryCard icon="✈" label="Flights" count={flights.length} color="#10b981" />
          )}
          {accommodation.length > 0 && (
            <SummaryCard icon="🏨" label="Stays" count={accommodation.length} color="#0ea5e9" />
          )}
          {activities.length > 0 && (
            <SummaryCard icon="🗺" label="Activities" count={activities.length} color="#eab308" />
          )}
          {dining.length > 0 && (
            <SummaryCard icon="🍽" label="Dining" count={dining.length} color="#f97316" />
          )}
          {transportation.length > 0 && (
            <SummaryCard icon="🚗" label="Transport" count={transportation.length} color="#8b5cf6" />
          )}
          {documents.length > 0 && (
            <SummaryCard icon="📄" label="Documents" count={documents.length} color="#78716c" />
          )}
        </div>

        {/* ─── Day-by-Day Schedule ─── */}
        {daySchedule.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Day-by-Day</SectionHeader>
            <div className="space-y-4">
              {daySchedule.map((day) => (
                <DayCard key={day.date} day={day} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Unscheduled Items ─── */}
        {(unscheduledActivities.length > 0 || unscheduledDining.length > 0 || unscheduledTransport.length > 0) && (
          <section className="mb-8">
            <SectionHeader>Not Yet Scheduled</SectionHeader>
            <div className="bg-white/80 rounded-xl overflow-hidden shadow-sm" style={{ backdropFilter: "blur(4px)" }}>
              {unscheduledActivities.map((a) => (
                <EventRow key={a.id} type="activity" name={a.name} subtitle={a.location_name} price={a.price} currency={a.currency} />
              ))}
              {unscheduledDining.map((d) => (
                <EventRow key={d.id} type="dining" name={d.name} subtitle={d.cuisine_type || d.location_name} price={d.avg_meal_cost} currency={d.currency} />
              ))}
              {unscheduledTransport.map((t) => (
                <EventRow key={t.id} type="transportation" name={t.name} subtitle={`${t.pickup_location || ""} → ${t.dropoff_location || ""}`} price={t.price} currency={t.currency} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Accommodation Summary ─── */}
        {accommodation.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Accommodation</SectionHeader>
            <div className="space-y-3">
              {accommodation.map((a) => (
                <div key={a.id} className="bg-white/80 rounded-xl px-5 py-4 shadow-sm" style={{ backdropFilter: "blur(4px)" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-stone-800">{a.name}</h4>
                      {a.location_name && <p className="text-stone-500 text-sm">{a.location_name}</p>}
                    </div>
                    {a.total_price && (
                      <span className="text-sm font-semibold text-stone-700">{formatCurrency(a.total_price, a.currency)}</span>
                    )}
                  </div>
                  {(a.check_in_date || a.check_out_date) && (
                    <p className="text-stone-500 text-xs mt-2">
                      {a.check_in_date && `Check-in: ${formatDate(a.check_in_date)}`}
                      {a.check_in_date && a.check_out_date && " · "}
                      {a.check_out_date && `Check-out: ${formatDate(a.check_out_date)}`}
                    </p>
                  )}
                  {a.room_type && <p className="text-stone-400 text-xs mt-1">{a.room_type}</p>}
                  {a.address && <p className="text-stone-400 text-xs mt-1">{a.address}</p>}
                  {a.notes && <p className="text-stone-600 text-sm mt-2 italic">{a.notes}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Flight Details ─── */}
        {flights.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Flights</SectionHeader>
            <div className="space-y-3">
              {flights.map((f) => (
                <div key={f.id} className="bg-white/80 rounded-xl px-5 py-4 shadow-sm" style={{ backdropFilter: "blur(4px)" }}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-stone-800">{f.name || "Flight"}</h4>
                    {f.total_price && (
                      <span className="text-sm font-semibold text-stone-700">{formatCurrency(f.total_price, f.currency)}</span>
                    )}
                  </div>
                  {f.legs?.map((leg, i) => (
                    <div key={leg.id} className="flex items-center gap-3 py-2 border-t border-stone-100 first:border-t-0 first:pt-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">
                        {leg.airline_code || (i + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-stone-800">{leg.departure_airport}</span>
                          <span className="text-stone-300">→</span>
                          <span className="font-medium text-stone-800">{leg.arrival_airport}</span>
                          {leg.flight_number && <span className="text-stone-400 text-xs ml-auto">{leg.flight_number}</span>}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          {leg.departure_date && formatDate(leg.departure_date)}
                          {leg.departure_time && ` at ${formatTime(leg.departure_time)}`}
                          {leg.duration_minutes && ` · ${formatDuration(leg.duration_minutes)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                  {f.notes && <p className="text-stone-600 text-sm mt-2 italic border-t border-stone-100 pt-2">{f.notes}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Travel Documents ─── */}
        {documents.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Travel Documents</SectionHeader>
            <div className="bg-white/80 rounded-xl overflow-hidden shadow-sm" style={{ backdropFilter: "blur(4px)" }}>
              {documents.map((doc) => (
                <div key={doc.id} className="px-5 py-3 border-b border-stone-100 last:border-b-0 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 text-xs font-bold uppercase">
                    {doc.doc_type?.slice(0, 3) || "DOC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{doc.name}</p>
                    {doc.reference_number && <p className="text-xs text-stone-400">Ref: {doc.reference_number}</p>}
                  </div>
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline flex-shrink-0">
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Checklist ─── */}
        {checklist.length > 0 && (
          <section className="mb-8">
            <SectionHeader>Planning Checklist</SectionHeader>
            <div className="bg-white/80 rounded-xl px-5 py-3 shadow-sm" style={{ backdropFilter: "blur(4px)" }}>
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-1.5">
                  <span className={`text-sm ${item.is_checked ? "line-through text-stone-400" : "text-stone-700"}`}>
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
            Crafted with <span className="font-semibold" style={{ color: "#da7b4a" }}>TripCraft</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/*  Sub-components                                     */
/* ═══════════════════════════════════════════════════ */

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.9), rgba(195,178,155,0.95))" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-stone-400 border-t-[#da7b4a] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-600 text-sm tracking-wide">Loading itinerary...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.9), rgba(195,178,155,0.95))" }}>
      <div className="text-center px-8">
        <div className="text-4xl mb-3">🗺</div>
        <h2 className="text-stone-800 text-lg font-semibold mb-2">Itinerary Not Found</h2>
        <p className="text-stone-600 text-sm">{message}</p>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(80, 65, 50, 0.65)" }}>
      {children}
    </h3>
  );
}

function SummaryCard({ icon, label, count, color }) {
  return (
    <div className="bg-white/80 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3" style={{ backdropFilter: "blur(4px)" }}>
      <div className="text-xl">{icon}</div>
      <div>
        <p className="text-lg font-bold text-stone-800">{count}</p>
        <p className="text-xs text-stone-500">{label}</p>
      </div>
    </div>
  );
}

function DayCard({ day }) {
  const hasEvents = day.flights.length > 0 || day.accommodation.length > 0 || day.scheduledActivities.length > 0 || day.dining.length > 0 || day.transportation.length > 0 || day.activities.length > 0;

  return (
    <div className="bg-white/80 rounded-xl overflow-hidden shadow-sm" style={{ backdropFilter: "blur(4px)" }}>
      {/* Day header */}
      <div className="px-5 py-3 flex items-baseline justify-between" style={{ borderBottom: hasEvents || day.notes ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#da7b4a" }}>Day {day.dayNumber}</span>
          {day.title && <span className="text-stone-700 text-sm font-medium ml-2">{day.title}</span>}
        </div>
        <span className="text-stone-400 text-xs">{formatDate(day.date)}</span>
      </div>

      {/* Day notes */}
      {day.notes && (
        <div className="px-5 py-2 text-stone-600 text-sm italic" style={{ borderBottom: hasEvents ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
          {day.notes}
        </div>
      )}

      {/* Events */}
      {hasEvents && (
        <div>
          {/* Flights */}
          {day.flights.map((f) =>
            f.legs?.filter((l) => l.departure_date === day.date).map((leg) => (
              <EventRow key={leg.id} type="flight"
                name={`${leg.departure_airport} → ${leg.arrival_airport}`}
                subtitle={`${leg.airline_name || leg.airline_code || ""}${leg.flight_number ? " " + leg.flight_number : ""}`}
                time={leg.departure_time}
                duration={leg.duration_minutes}
              />
            ))
          )}

          {/* Check-ins */}
          {day.accommodation.filter((a) => a.check_in_date === day.date).map((a) => (
            <EventRow key={`in-${a.id}`} type="accommodation" name={`Check in: ${a.name}`} subtitle={a.location_name} />
          ))}

          {/* Transportation */}
          {day.transportation.map((t) => (
            <EventRow key={t.id} type="transportation"
              name={t.name}
              subtitle={`${t.pickup_location || ""} → ${t.dropoff_location || ""}`}
              time={t.departure_time}
              duration={t.duration_minutes}
            />
          ))}

          {/* Activities */}
          {day.scheduledActivities.map((a) => (
            <EventRow key={a.id} type="activity"
              name={a.name}
              subtitle={a.location_name}
              time={a.start_time}
              duration={a.duration_minutes}
              price={a.price}
              currency={a.currency}
            />
          ))}

          {/* Dining */}
          {day.dining.map((d) => (
            <EventRow key={d.id} type="dining"
              name={d.name}
              subtitle={d.cuisine_type || d.meal_type || d.location_name}
              price={d.avg_meal_cost}
              currency={d.currency}
            />
          ))}

          {/* Day activities (calendar events) */}
          {day.activities.map((a) => (
            <EventRow key={a.id} type={a.category || "activity"}
              name={a.title || a.name}
              subtitle={a.location}
              time={a.start_time}
            />
          ))}

          {/* Check-outs */}
          {day.accommodation.filter((a) => a.check_out_date === day.date).map((a) => (
            <EventRow key={`out-${a.id}`} type="accommodation" name={`Check out: ${a.name}`} subtitle={a.location_name} />
          ))}
        </div>
      )}

      {!hasEvents && !day.notes && (
        <div className="px-5 py-3 text-stone-400 text-sm italic">Free day</div>
      )}
    </div>
  );
}

function EventRow({ type, name, subtitle, time, duration, price, currency }) {
  const cat = CAT_COLORS[type] || CAT_COLORS.activity;
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-stone-50 last:border-b-0">
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: cat.border }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
        {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
      </div>
      <div className="flex-shrink-0 text-right">
        {time && <p className="text-xs font-medium text-stone-600">{formatTime(time)}</p>}
        {duration && <p className="text-xs text-stone-400">{formatDuration(duration)}</p>}
        {price && !time && <p className="text-xs font-medium text-stone-600">{formatCurrency(price, currency)}</p>}
      </div>
    </div>
  );
}
