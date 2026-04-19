"use client";

import { useState } from "react";
import TimeSelectPopup, { to12h, formatTime12h } from "@/components/TimeSelectPopup";
import { LABEL } from "@/lib/detailPaneStyles";

// ─────────────────────────────────────────────────────────────
// MiniWeekCalendar — Compact bento-style day grid
// ─────────────────────────────────────────────────────────────
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

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Accent color maps
const ACCENT = {
  orange: {
    scheduled: "bg-orange-600 text-white shadow ring-1 ring-orange-700/20",
    hover: "hover:bg-orange-50 hover:border-orange-300",
    cell: "bg-white border-stone-200",
    bar: "bg-orange-50 border-orange-200 text-orange-600",
  },
  yellow: {
    scheduled: "bg-yellow-500 text-white shadow ring-1 ring-yellow-600/20",
    hover: "hover:bg-yellow-50 hover:border-yellow-300",
    cell: "bg-white border-stone-200",
    bar: "bg-yellow-50 border-yellow-200 text-yellow-600",
  },
  emerald: {
    scheduled: "bg-emerald-600 text-white shadow ring-1 ring-emerald-700/20",
    hover: "hover:bg-emerald-50 hover:border-emerald-300",
    cell: "bg-white border-stone-200",
    bar: "bg-emerald-50 border-emerald-200 text-emerald-600",
  },
  violet: {
    scheduled: "bg-violet-600 text-white shadow ring-1 ring-violet-700/20",
    hover: "hover:bg-violet-50 hover:border-violet-300",
    cell: "bg-white border-stone-200",
    bar: "bg-violet-50 border-violet-200 text-violet-600",
  },
  sky: {
    scheduled: "bg-sky-600 text-white shadow ring-1 ring-sky-700/20",
    hover: "hover:bg-sky-50 hover:border-sky-300",
    cell: "bg-white border-stone-200",
    bar: "bg-sky-50 border-sky-200 text-sky-600",
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

  // Build the set of trip dates
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

  // Build calendar grid
  const firstDate = tripDatesArr[0];
  const lastDate = tripDatesArr[tripDatesArr.length - 1];

  const gridStart = new Date(firstDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(lastDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

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
    if (scheduledDate === dateStr) {
      setTimePopupDate(dateStr);
    } else {
      onSchedule(dateStr);
      setTimePopupDate(dateStr);
    }
  }

  return (
    <div className="mb-4 relative max-w-[264px]">
      <div className={`${LABEL} mb-1.5`}>Add to itinerary</div>

      {/* Weekday labels — single pill-shaped bar */}
      <div className={`grid grid-cols-7 rounded-full border px-1.5 py-1 mb-1.5 ${accent.bar}`}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold uppercase leading-tight">
            {d}
          </div>
        ))}
      </div>

      {/* Bento grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1.5 mb-1.5">
          {week.map((d) => {
            const dateStr = d.toISOString().split("T")[0];
            const isTripDate = tripDateSet.has(dateStr);
            const isScheduled = scheduledDate === dateStr;
            const dayNum = d.getDate();

            if (!isTripDate) {
              return <div key={dateStr} className="w-[31px] h-[31px]" />;
            }

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={`w-[31px] h-[31px] rounded-md border shadow-sm flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  isScheduled
                    ? accent.scheduled
                    : `${accent.cell} text-stone-600 ${accent.hover}`
                }`}
                title={d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              >
                <span className="text-[11px] font-semibold leading-none">{dayNum}</span>
              </button>
            );
          })}
        </div>
      ))}

      {/* Time popup */}
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

      {/* Remove from itinerary */}
      {scheduledDate && (
        <button
          onClick={() => {
            onSchedule(null);
            if (onTimeChange) onTimeChange(null, null);
          }}
          className="mt-0.5 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Remove from itinerary
        </button>
      )}
    </div>
  );
}
