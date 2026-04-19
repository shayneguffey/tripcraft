"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Helpers (unchanged API) ──────────────────────────────
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

// ─── Clock Face Constants ─────────────────────────────────
const CLOCK_SIZE = 200;
const CLOCK_R = CLOCK_SIZE / 2;
const NUM_R = 72; // radius for number positions
const HAND_LEN = 68;
const DOT_R = 16; // selection dot radius

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function angleForHour(h) {
  return ((h % 12) / 12) * 360 - 90;
}
function angleForMinute(m) {
  return (m / 60) * 360 - 90;
}
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// ─── ClockFace Component ──────────────────────────────────
function ClockFace({ mode, value, onChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const items = mode === "hour" ? HOURS : MINUTES;
  const angleFn = mode === "hour" ? angleForHour : angleForMinute;

  // Current selection angle
  const selAngle =
    mode === "hour"
      ? angleForHour(parseInt(value) || 12)
      : angleForMinute(parseInt(value) || 0);

  const handX = CLOCK_R + Math.cos(toRad(selAngle)) * HAND_LEN;
  const handY = CLOCK_R + Math.sin(toRad(selAngle)) * HAND_LEN;

  const getValueFromEvent = useCallback(
    (e) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left - CLOCK_R;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top - CLOCK_R;
      let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      if (mode === "hour") {
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        return h;
      } else {
        let m = Math.round(angle / 6);
        if (m === 60) m = 0;
        // Snap to nearest 5
        m = Math.round(m / 5) * 5;
        if (m === 60) m = 0;
        return m;
      }
    },
    [mode]
  );

  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      dragging.current = true;
      const val = getValueFromEvent(e);
      if (val !== null) onChange(val);
    },
    [getValueFromEvent, onChange]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      const val = getValueFromEvent(e);
      if (val !== null) onChange(val);
    },
    [getValueFromEvent, onChange]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("touchend", handlePointerUp);
    return () => {
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerUp]);

  return (
    <svg
      ref={svgRef}
      width={CLOCK_SIZE}
      height={CLOCK_SIZE}
      className="select-none cursor-pointer"
      style={{ touchAction: "none" }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
    >
      {/* Background circle */}
      <circle cx={CLOCK_R} cy={CLOCK_R} r={CLOCK_R - 2} fill="#f5f0ea" stroke="none" />

      {/* Hand line */}
      <line
        x1={CLOCK_R}
        y1={CLOCK_R}
        x2={handX}
        y2={handY}
        stroke="#da7b4a"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx={CLOCK_R} cy={CLOCK_R} r={4} fill="#da7b4a" />

      {/* Selection dot */}
      <circle cx={handX} cy={handY} r={DOT_R} fill="#da7b4a" opacity={0.9} />

      {/* Numbers */}
      {items.map((item) => {
        const angle = angleFn(item);
        const x = CLOCK_R + Math.cos(toRad(angle)) * NUM_R;
        const y = CLOCK_R + Math.sin(toRad(angle)) * NUM_R;

        const isSelected =
          mode === "hour"
            ? parseInt(value) === item || (item === 12 && (!value || value === "0" || value === "12"))
            : parseInt(value) === item;

        return (
          <text
            key={item}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={isSelected ? 700 : 500}
            fill={isSelected ? "#fff" : "#57534e"}
            className="pointer-events-none"
          >
            {mode === "minute" ? String(item).padStart(2, "0") : item}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Single Clock Section (Start or End time) ─────────────
function ClockSection({ label, value, onChange, autoAdvance }) {
  const [clockMode, setClockMode] = useState("hour"); // "hour" | "minute"

  const h = value.h || "";
  const m = value.m || "00";
  const period = value.period || "AM";

  function handleHourChange(hr) {
    onChange({ ...value, h: String(hr), m: m, period });
    // Auto-advance to minute after picking hour
    if (autoAdvance) {
      setTimeout(() => setClockMode("minute"), 250);
    }
  }

  function handleMinuteChange(min) {
    onChange({ ...value, h: h || "12", m: String(min).padStart(2, "0"), period });
  }

  function togglePeriod(p) {
    onChange({ ...value, h: h || "12", m: m, period: p });
  }

  // Reset to hour mode when label changes (switching between start/end)
  useEffect(() => {
    setClockMode("hour");
  }, [label]);

  return (
    <div>
      {/* Label */}
      <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
        {label}
      </div>

      {/* Digital display */}
      <div className="flex items-center justify-center gap-1 mb-3">
        <button
          type="button"
          onClick={() => setClockMode("hour")}
          className={`text-2xl font-bold px-2 py-0.5 rounded-lg transition-colors ${
            clockMode === "hour"
              ? "bg-[#da7b4a]/15 text-[#da7b4a]"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          {h || "--"}
        </button>
        <span className="text-2xl font-bold text-stone-400">:</span>
        <button
          type="button"
          onClick={() => setClockMode("minute")}
          className={`text-2xl font-bold px-2 py-0.5 rounded-lg transition-colors ${
            clockMode === "minute"
              ? "bg-[#da7b4a]/15 text-[#da7b4a]"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          {m}
        </button>

        {/* AM/PM */}
        <div className="flex flex-col ml-2 rounded-lg overflow-hidden border border-stone-200">
          <button
            type="button"
            onClick={() => togglePeriod("AM")}
            className={`px-2 py-[2px] text-[10px] font-bold transition-colors ${
              period === "AM" && h
                ? "bg-[#da7b4a] text-white"
                : "bg-white text-stone-400 hover:text-stone-600"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => togglePeriod("PM")}
            className={`px-2 py-[2px] text-[10px] font-bold transition-colors border-t border-stone-200 ${
              period === "PM" && h
                ? "bg-[#da7b4a] text-white"
                : "bg-white text-stone-400 hover:text-stone-600"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock face */}
      <div className="flex justify-center">
        <ClockFace
          mode={clockMode}
          value={clockMode === "hour" ? h : m}
          onChange={clockMode === "hour" ? handleHourChange : handleMinuteChange}
        />
      </div>
    </div>
  );
}

// ─── TimeSelectPopup: the unified time picker ──────────────
// Props API is identical to the previous version.
// Pass `useFixed={true}` when rendered inside a scroll container (e.g. DayPopout)
// so the picker floats over the container instead of extending its scroll height.
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
  useFixed = false,
}) {
  const [startTime, setStartTime] = useState(initStart || { h: "", m: "00", period: "AM" });
  const [endTime, setEndTime] = useState(initEnd || { h: "", m: "00", period: "AM" });
  const [activeSection, setActiveSection] = useState("start"); // "start" | "end"
  const [fixedPos, setFixedPos] = useState(null);
  const ref = useRef(null);

  // For fixed mode: compute position from parent element's viewport rect
  useEffect(() => {
    if (!useFixed || !ref.current) return;
    const parent = ref.current.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const pickerW = 252;
    const pickerH = ref.current.offsetHeight || 400;
    // Position below the trigger, but flip up if it would go offscreen
    let top = rect.bottom + 4;
    let left = rect.left;
    if (top + pickerH > window.innerHeight - 8) {
      top = rect.top - pickerH - 4;
    }
    if (left + pickerW > window.innerWidth - 8) {
      left = window.innerWidth - pickerW - 8;
    }
    if (left < 8) left = 8;
    setFixedPos({ top, left });
  }, [useFixed]);

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

  const positionClass = useFixed ? "fixed" : "absolute left-0 top-full mt-1";
  const positionStyle = useFixed && fixedPos
    ? { width: 252, top: fixedPos.top, left: fixedPos.left }
    : { width: 252 };

  return (
    <div
      ref={ref}
      className={`${positionClass} z-50 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden`}
      style={positionStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Section tabs (when showing both start and end) */}
      {showEndTime && (
        <div className="flex border-b border-stone-100">
          <button
            type="button"
            onClick={() => setActiveSection("start")}
            className={`flex-1 py-2 text-xs font-semibold tracking-wide uppercase transition-colors ${
              activeSection === "start"
                ? "text-[#da7b4a] border-b-2 border-[#da7b4a]"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {startLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("end")}
            className={`flex-1 py-2 text-xs font-semibold tracking-wide uppercase transition-colors ${
              activeSection === "end"
                ? "text-[#da7b4a] border-b-2 border-[#da7b4a]"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {endLabel}
          </button>
        </div>
      )}

      {/* Clock section */}
      <div className="px-4 pt-3 pb-2">
        {(!showEndTime || activeSection === "start") && (
          <ClockSection
            label={showEndTime ? "" : startLabel}
            value={startTime}
            onChange={setStartTime}
            autoAdvance={true}
          />
        )}
        {showEndTime && activeSection === "end" && (
          <ClockSection
            label=""
            value={endTime}
            onChange={setEndTime}
            autoAdvance={true}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-stone-100">
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
