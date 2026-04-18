"use client";
import { useState, useEffect, useRef } from "react";

// ─── Helpers ───────────────────────────────────────────────
export function to12h(timeStr) {
  if (!timeStr) return { h: "", m: "00", period: "AM" };
  const [hh, mm] = timeStr.split(":");
  let h = parseInt(hh, 10);
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { h: String(h), m: mm || "00", period };
}

export function to24h(parts) {
  if (!parts || !parts.h) return null;
  let h = parseInt(parts.h, 10);
  if (parts.period === "PM" && h !== 12) h += 12;
  if (parts.period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${parts.m || "00"}`;
}

export function formatTime12h(time24) {
  if (!time24) return "";
  const [hh, mm] = time24.split(":");
  let h = parseInt(hh, 10);
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mm} ${period}`;
}

// ─── TimeGrid: single time section with pill buttons ───────
function TimeGrid({ label, value, onChange }) {
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = ["00", "15", "30", "45"];

  function preview() {
    if (!value || !value.h) return "—";
    return `${value.h}:${value.m || "00"} ${value.period || "AM"}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-stone-700">{preview()}</span>
      </div>
      {/* Hour pills — 2 rows of 6 */}
      <div className="grid grid-cols-6 gap-[3px] mb-1.5">
        {hours.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => onChange({ ...value, h: String(h), m: value.m || "00", period: value.period || "AM" })}
            className={`py-[5px] rounded-md text-xs font-medium transition-all ${
              value.h === String(h)
                ? "bg-[#da7b4a] text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {h}
          </button>
        ))}
      </div>
      {/* Minute pills + AM/PM toggle — single row */}
      <div className="flex items-center gap-[3px]">
        {minutes.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange({ ...value, m, h: value.h || "12", period: value.period || "AM" })}
            className={`px-[7px] py-[5px] rounded-md text-xs font-medium transition-all ${
              value.m === m && value.h
                ? "bg-[#da7b4a] text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            :{m}
          </button>
        ))}
        <div className="flex rounded-md overflow-hidden border border-stone-200 ml-auto">
          <button
            type="button"
            onClick={() => onChange({ ...value, period: "AM", h: value.h || "12", m: value.m || "00" })}
            className={`px-[7px] py-[5px] text-[10px] font-bold transition-colors ${
              value.period === "AM" && value.h
                ? "bg-[#da7b4a] text-white"
                : "bg-white text-stone-400 hover:text-stone-600"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...value, period: "PM", h: value.h || "12", m: value.m || "00" })}
            className={`px-[7px] py-[5px] text-[10px] font-bold transition-colors ${
              value.period === "PM" && value.h
                ? "bg-[#da7b4a] text-white"
                : "bg-white text-stone-400 hover:text-stone-600"
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TimeSelectPopup: the unified time picker ──────────────
// Props:
//   startTime, endTime         — {h, m, period} objects
//   onSave(start24h, end24h)   — called on Save or click-outside
//   onClear()                  — called when Clear pressed
//   onClose()                  — called to close without saving (Escape)
//   onUnschedule()             — optional: unschedule from calendar day
//   startLabel, endLabel       — "Start"/"End", "Departure"/"Arrival"
//   showEndTime                — default true; false for single-time mode
export default function TimeSelectPopup({
  startTime: initStart,
  endTime: initEnd,
  onSave,
  onClear,
  onClose,
  onUnschedule,
  startLabel = "Start",
  endLabel = "End",
  showEndTime = true,
}) {
  const [startTime, setStartTime] = useState(initStart || { h: "", m: "00", period: "AM" });
  const [endTime, setEndTime] = useState(initEnd || { h: "", m: "00", period: "AM" });
  const ref = useRef(null);

  // Click outside → save and close
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        doSave();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [startTime, endTime]);

  function doSave() {
    if (onSave) onSave(to24h(startTime), showEndTime ? to24h(endTime) : null);
  }

  function doClear() {
    if (onClear) onClear();
  }

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-stone-200 p-3 space-y-2.5"
      style={{ minWidth: 260, maxWidth: 280 }}
      onClick={(e) => e.stopPropagation()}
    >
      <TimeGrid label={startLabel} value={startTime} onChange={setStartTime} />

      {showEndTime && (
        <>
          <div className="border-t border-stone-100" />
          <TimeGrid label={endLabel} value={endTime} onChange={setEndTime} />
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={doClear}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Clear
          </button>
          {onUnschedule && (
            <button
              type="button"
              onClick={onUnschedule}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={doSave}
          className="px-3.5 py-1 rounded-md text-xs font-semibold bg-[#da7b4a] text-white hover:bg-[#b5552a] transition-colors shadow-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
}
