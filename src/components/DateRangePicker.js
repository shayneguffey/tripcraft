"use client";

import { useState, useEffect, useRef } from "react";

/**
 * DateRangePicker — a compact inline calendar for selecting trip start & end dates.
 * One calendar, click first date to set start, click second to set end.
 */

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DateRangePicker({ startDate, endDate, onSave, onCancel }) {
  const ref = useRef(null);
  // Selection state: null → pick start, "start" → pick end, "done"
  const [phase, setPhase] = useState(null);
  const [pickedStart, setPickedStart] = useState(startDate || null);
  const [pickedEnd, setPickedEnd] = useState(endDate || null);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Determine which month to display, start from the start date or current month
  const initialMonth = startDate ? new Date(startDate + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  // Click outside to close
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onCancel?.();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onCancel]);

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  function handleDayClick(dateKey) {
    if (!pickedStart || (pickedStart && pickedEnd)) {
      // Start fresh selection
      setPickedStart(dateKey);
      setPickedEnd(null);
      setPhase("start");
    } else {
      // We have start, now picking end
      if (dateKey < pickedStart) {
        // Clicked before start — swap
        setPickedEnd(pickedStart);
        setPickedStart(dateKey);
      } else {
        setPickedEnd(dateKey);
      }
      setPhase("done");
    }
  }

  function handleSave() {
    if (pickedStart && pickedEnd) {
      onSave?.(pickedStart, pickedEnd);
    }
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const cells = [];

  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(dateKey);
  }

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Determine range for shading
  const rangeStart = pickedStart;
  const rangeEnd = pickedEnd || (phase === "start" && hoveredDate && hoveredDate >= pickedStart ? hoveredDate : null);

  function isInSelectedRange(dateKey) {
    if (!rangeStart || !rangeEnd) return false;
    const s = rangeStart < rangeEnd ? rangeStart : rangeEnd;
    const e = rangeStart < rangeEnd ? rangeEnd : rangeStart;
    return dateKey >= s && dateKey <= e;
  }

  function isEndpoint(dateKey) {
    return dateKey === pickedStart || dateKey === pickedEnd;
  }

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white rounded-xl shadow-xl border border-stone-200 p-3 animate-[cardFadeIn_0.15s_ease-out]"
      style={{ left: 0, top: "100%", marginTop: 4, width: 280 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm font-semibold text-stone-700">{monthName}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-stone-100 transition-colors text-stone-500 hover:text-stone-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-stone-400 py-0.5">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((dateKey, i) => {
          if (!dateKey) return <div key={`empty-${i}`} className="h-8" />;

          const day = parseInt(dateKey.split("-")[2], 10);
          const inRange = isInSelectedRange(dateKey);
          const endpoint = isEndpoint(dateKey);

          return (
            <button
              key={dateKey}
              onClick={() => handleDayClick(dateKey)}
              onMouseEnter={() => setHoveredDate(dateKey)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`h-8 text-xs font-medium rounded transition-colors ${
                endpoint
                  ? "bg-[#da7b4a] text-white"
                  : inRange
                    ? "bg-[#da7b4a]/15 text-stone-700"
                    : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Hint + Save */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
        <span className="text-[10px] text-stone-400">
          {!pickedStart ? "Click start date" : !pickedEnd ? "Click end date" : `${pickedStart} → ${pickedEnd}`}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onCancel?.()}
            className="px-2 py-0.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!pickedStart || !pickedEnd}
            className="px-2.5 py-0.5 text-xs font-semibold text-white bg-[#da7b4a] rounded hover:bg-[#b5552a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
