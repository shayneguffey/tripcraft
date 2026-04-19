"use client";

import { useState } from "react";
import TimeSelectPopup, { to12h, formatTime12h } from "@/components/TimeSelectPopup";

// ─────────────────────────────────────────────────────────────
// MiniWeekCalendar — 7-day week grid for scheduling options
// ─────────────────────────────────────────────────────────────
// Displays itinerary dates in a Sun–Sat calendar grid.
// Clicking a trip date schedules the option to that day and
// opens a time picker. Non-trip dates are shown but disabled.
//
// Props:
//   tripStart     — "YYYY-MM-DD" itinerary start
//   tripEnd       — "YYYY-MM-DD" itinerary end
//   scheduledDate — "YYYY-MM-DD" or null
//   startTime     — "HH:MM:SS" or null
//   endTime       — "HH:MM:SS" or null
//   accentColor   — "orange" | "yellow" | etc.
//   onSchedule    — (dateStr | null) => void
//   onTimeChange  — (start24, end24) => void
// ─────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Accent color maps
const ACCENT = {
  orange: {
    scheduled: "bg-orange-600 text-white shadow-sm",
    hover: "hover:bg-orange-100 hover:text-orange-700",
    header: "text-orange-600",
  },
  yellow: {
    scheduled: "bg-yellow-600 text-white shadow-sm",
    hover: "hover:bg-yellow-100 hover:text-yellow-700",
    header: "text-yellow-600",
  },
  emerald: {
    scheduled: "bg-emerald-600 text-white shadow-sm",
    hover: "hover:bg-emerald-100 hover:text-emerald-700",
    header: "text-emerald-600",
  },
  violet: {
    scheduled: "bg-violet-600 text-white shadow-sm",
    hover: "hover:bg-violet-100 hover:text-violet-700",
    header: "text-violet-600",
  },
  sky: {
    scheduled: "bg-sky-600 text-white shadow-sm",
    hover: "hover:bg-sky-100 hover:text-sky-700",
    header: "text-sky-600",
  },
};

export default function MiniWeekCalendar({
  tripStart,
  tripEnd,
  scheduledDate,
  startTime,
  endTime,
  accentColor = "orange",
  onSchedule,
  onTimeChange,
}) {
  const [timePopupDate, setTimePopupDate] = useState(null);

  if (!tripStart || !tripEnd) return null;

  const accent = ACCENT[accentColor] || ACCENT.orange;

  // Build the set of trip dates (YYYY-MM-DD strings)
  const tripDateSet = new Set();
  const tripDatesArr = [];
  {
    const s = new Date(tripStart + "T00:00:00");
    const e = new Date(tripEnd + "T00:00:00");
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      tripDateSet.add(key);
      tripDatesArr.push(new Date(d));
    }
  }

  if (tripDatesArr.length === 0) return null;

  // Build calendar grid: start on the Sunday of the first trip week,
  // end on the Saturday of the last trip week
  const firstDate = tripDatesArr[0];
  const lastDate = tripDatesArr[tripDatesArr.length - 1];

  const gridStart = new Date(firstDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay()); // back to Sunday

  const gridEnd = new Date(lastDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay())); // forward to Saturday

  const gridDates = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    gridDates.push(new Date(d));
  }

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < gridDates.length; i += 7) {
    weeks.push(gridDates.slice(i, i + 7));
  }

  function handleDayClick(dateStr) {
    const isScheduled = scheduledDate === dateStr;
    if (isScheduled) {
      // Already scheduled — open time popup
      setTimePopupDate(dateStr);
    } else {
      // Schedule to this day, open popup
      onSchedule(dateStr);
      setTimePopupDate(dateStr);
    }
  }

  return (
    <div className="mb-4 relative">
      <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Add to itinerary</div>
      <div className="border border-slate-200 rounded-lg bg-white">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {DAY_LABELS.map((d, i) => (
            <div key={d} className={`text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wide py-1.5 ${i < 6 ? "border-r border-slate-200" : ""}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-slate-200 last:border-b-0">
            {week.map((d, di) => {
              const dateStr = d.toISOString().split("T")[0];
              const isTripDate = tripDateSet.has(dateStr);
              const isScheduled = scheduledDate === dateStr;
              const dayNum = d.getDate();
              const borderR = di < 6 ? "border-r border-slate-200" : "";

              if (!isTripDate) {
                return (
                  <div key={dateStr} className={`text-center py-1.5 text-[11px] text-slate-200 select-none ${borderR}`}>
                    {dayNum}
                  </div>
                );
              }

              return (
                <div key={dateStr} className={`text-center ${borderR}`}>
                  <button
                    onClick={() => handleDayClick(dateStr)}
                    className={`w-full py-1.5 text-[11px] font-medium transition-all rounded-none ${
                      isScheduled
                        ? accent.scheduled
                        : `text-slate-700 ${accent.hover}`
                    }`}
                    title={d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  >
                    {dayNum}
                    {isScheduled && startTime && (
                      <div className="text-[8px] opacity-80 leading-tight">{formatTime12h(startTime.slice(0, 5))}</div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Time popup — rendered outside the calendar grid so it's not clipped */}
      {timePopupDate && (
        <div className="relative z-50" style={{ height: 0 }}>
          <TimeSelectPopup
            startTime={to12h(startTime?.slice(0, 5))}
            endTime={to12h(endTime?.slice(0, 5))}
            showEndTime={true}
            onSave={(start24, end24) => {
              setTimePopupDate(null);
              if (onTimeChange) onTimeChange(start24, end24);
            }}
            onClear={() => {
              setTimePopupDate(null);
              if (onTimeChange) onTimeChange(null, null);
            }}
            onClose={() => setTimePopupDate(null)}
            onUnschedule={() => {
              setTimePopupDate(null);
              onSchedule(null);
              if (onTimeChange) onTimeChange(null, null);
            }}
          />
        </div>
      )}

      {/* Remove from itinerary — below calendar */}
      {scheduledDate && (
        <button
          onClick={() => {
            onSchedule(null);
            if (onTimeChange) onTimeChange(null, null);
          }}
          className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Remove from itinerary
        </button>
      )}
    </div>
  );
}
