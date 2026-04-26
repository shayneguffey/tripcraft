"use client";

/**
 * OptionPicker — inline picker that adds an existing itinerary option to a day.
 *
 * Rendered below the events list inside DayCardView when the user taps
 * "+ Itinerary Option". Two-step UI:
 *   1. Pick a category (Flights / Activities / Dining / Transport / Stays)
 *   2. Pick an option from that category.
 *
 * Two scheduling modes per category — see CATEGORIES below for details.
 *   • Activities / Dining are FLEXIBLE: picker shows every option for the trip
 *     and updates the option’s date when picked (re-schedule).
 *   • Transportation / Stays are FIXED: their dates live with the option
 *     itself. Picker only shows options whose date already matches THIS day,
 *     and picking just adds them to the itinerary (no date update).
 *     Transportation with a return date will appear automatically on the
 *     return day too — the calendar/day-card already renders both ends.
 *
 * Flights use the FIXED mode and are filtered by `first_leg_date`. Picking
 * a flight adds it to the itinerary; the existing day-card render logic
 * automatically surfaces every leg on its own departure_date.
 *
 * Props:
 *   tripId      number   — required to scope the option list
 *   dateKey     string   — "YYYY-MM-DD" target date
 *   itineraryId number   — active itinerary; used for itinerary_selections
 *   onPicked    fn       — called after a successful schedule (caller refetches)
 *   onCancel    fn       — close the picker without picking
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Two scheduling modes:
//   flexible: true  → activity / dining. Picker can re-schedule to any day,
//                     so we show all options for the trip (minus those already
//                     on this day) and update the date on pick.
//   flexible: false → transportation / accommodation. Dates are anchored to the
//                     option itself (a car rental knows its own start day, a
//                     stay knows its own check-in). The picker only shows
//                     options whose date already matches THIS day, and picking
//                     just adds them to the itinerary.
const CATEGORIES = [
  {
    key: "flight",
    label: "Flights",
    table: "flight_options",
    dateField: "first_leg_date",
    flexible: false,
    accentBg: "bg-emerald-100",
    accentText: "text-emerald-700",
  },
  {
    key: "activity",
    label: "Activities",
    table: "activity_options",
    dateField: "scheduled_date",
    flexible: true,
    accentBg: "bg-yellow-100",
    accentText: "text-yellow-700",
  },
  {
    key: "dining",
    label: "Dining",
    table: "dining_options",
    dateField: "scheduled_date",
    flexible: true,
    accentBg: "bg-rose-100",
    accentText: "text-rose-700",
  },
  {
    key: "transportation",
    label: "Transport",
    table: "transportation_options",
    dateField: "departure_date",
    flexible: false,
    accentBg: "bg-purple-100",
    accentText: "text-purple-700",
  },
  {
    key: "accommodation",
    label: "Stays",
    table: "accommodation_options",
    dateField: "check_in_date",
    flexible: false,
    accentBg: "bg-sky-100",
    accentText: "text-sky-700",
  },
];

function formatShort(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function OptionPicker({ tripId, dateKey, itineraryId, onPicked, onCancel }) {
  const [category, setCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Lazy-load options once a category is selected.
  useEffect(() => {
    if (!category) {
      setOptions([]);
      return;
    }
    const cat = CATEGORIES.find((c) => c.key === category);
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const { data: opts, error: optsErr } = await supabase
        .from(cat.table)
        .select("*")
        .eq("trip_id", tripId)
        .order("name", { ascending: true, nullsFirst: false });

      if (cancelled) return;
      if (optsErr) {
        setError(optsErr.message);
        setOptions([]);
        setLoading(false);
        return;
      }

      let filtered = opts || [];

      if (cat.flexible) {
        // Activities / dining: show all, except ones already on THIS day.
        filtered = filtered.filter((o) => o[cat.dateField] !== dateKey);
      } else {
        // Transportation / accommodation: only options whose date is already
        // pinned to this day (set in the option module's own UI).
        filtered = filtered.filter((o) => o[cat.dateField] === dateKey);

        // Hide options already in the active itinerary — they’re already
        // visible on the day card.
        if (itineraryId) {
          const { data: sels } = await supabase
            .from("itinerary_selections")
            .select("option_id")
            .eq("itinerary_id", itineraryId)
            .eq("option_type", category);
          if (cancelled) return;
          const selectedIds = new Set((sels || []).map((s) => s.option_id));
          filtered = filtered.filter((o) => !selectedIds.has(o.id));
        }
      }

      setOptions(filtered);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [category, tripId, dateKey, itineraryId]);

  async function pickOption(opt) {
    if (busyId) return;
    setBusyId(opt.id);
    try {
      const cat = CATEGORIES.find((c) => c.key === category);

      // 1. Flexible categories: set the date so the option moves to this day.
      //    Fixed categories (transportation/accommodation): the option already
      //    has its own date — do not overwrite it.
      if (cat.flexible) {
        const { error: updErr } = await supabase
          .from(cat.table)
          .update({ [cat.dateField]: dateKey })
          .eq("id", opt.id);
        if (updErr) {
          setError(updErr.message);
          return;
        }
      }

      // 2. Ensure the option is selected in the active itinerary.
      if (itineraryId) {
        const { data: existing } = await supabase
          .from("itinerary_selections")
          .select("id")
          .eq("itinerary_id", itineraryId)
          .eq("option_type", category)
          .eq("option_id", opt.id)
          .maybeSingle();
        if (!existing) {
          await supabase.from("itinerary_selections").insert({
            itinerary_id: itineraryId,
            option_type: category,
            option_id: opt.id,
          });
        }
      }

      onPicked?.();
    } finally {
      setBusyId(null);
    }
  }

  const cat = category ? CATEGORIES.find((c) => c.key === category) : null;

  return (
    <div className="border-2 border-dashed border-[#da7b4a]/40 rounded-lg p-3 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {cat && (
            <button
              onClick={() => setCategory(null)}
              className="text-stone-400 hover:text-[#da7b4a] text-xs transition-colors"
              title="Back to categories"
            >
              {"\u2190 Back"}
            </button>
          )}
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            {cat ? cat.label : "Add from itinerary"}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-600 text-xs"
        >
          Cancel
        </button>
      </div>

      {!cat ? (
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full ${c.accentBg} ${c.accentText} hover:brightness-95 transition-all`}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : loading ? (
        <p className="text-xs text-stone-400 italic py-2">Loading options\u2026</p>
      ) : error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : options.length === 0 ? (
        <p className="text-xs text-stone-400 italic py-2">
          {cat.flexible
            ? `No ${cat.label.toLowerCase()} options to schedule on this day. Add some in the ${cat.label} section first.`
            : `No ${cat.label.toLowerCase()} options are dated for this day. Set ${cat.key === "accommodation" ? "check-in" : "departure"} dates in the ${cat.label} section first.`}
        </p>
      ) : (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const existingDate = opt[cat.dateField];
            const isBusy = busyId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => pickOption(opt)}
                disabled={isBusy}
                className="w-full flex items-center justify-between gap-2 text-left px-2 py-1.5 rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-700 block truncate">
                    {opt.name || "Untitled"}
                  </span>
                  {cat.flexible && existingDate ? (
                    <span className="text-[10px] text-amber-600">
                      Currently on {formatShort(existingDate)} — picking moves it
                    </span>
                  ) : opt.location_name || opt.address || opt.pickup_location ? (
                    <span className="text-[10px] text-stone-400 truncate block">
                      {opt.location_name || opt.address || opt.pickup_location}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-[#da7b4a] flex-shrink-0">
                  {isBusy ? "\u2026" : "+ Schedule"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
