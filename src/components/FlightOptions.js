"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { parseFlightInput, parseFlightText, parseOcrText, getCityName, getAirlineName } from "@/lib/flightParser";

// Send screenshot to Gemini Vision API via our server-side route
async function extractFlightsFromImage(imageDataUrl) {
  // Determine the mime type from the data URL
  const mimeMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

  const response = await fetch("/api/parse-flight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl, mimeType }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  return response.json();
}

// Airline logo URL from Google's CDN
function airlineLogoUrl(code) {
  if (!code) return null;
  return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDate(d) {
  if (!d) return "TBD";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── MAIN COMPONENT ───
export default function FlightOptions({ tripId, tripStart, tripEnd, onFlightOptionsChange }) {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOptions = useCallback(async () => {
    const { data: opts } = await supabase
      .from("flight_options")
      .select("*, flight_legs(*)")
      .eq("trip_id", tripId)
      .order("sort_order", { ascending: true });

    const sorted = (opts || []).map((o) => ({
      ...o,
      flight_legs: (o.flight_legs || []).sort((a, b) => a.leg_order - b.leg_order),
    }));
    setOptions(sorted);

    // Auto-select the selected option, or first one
    const sel = sorted.find((o) => o.is_selected) || sorted[0];
    if (sel) setSelectedOption(sel.id);

    // Notify parent about flight options for calendar display
    if (onFlightOptionsChange) onFlightOptionsChange(sorted);

    setLoading(false);
  }, [tripId, onFlightOptionsChange]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  async function handleDeleteOption(optionId) {
    if (!confirm("Delete this flight option?")) return;
    await supabase.from("flight_options").delete().eq("id", optionId);
    loadOptions();
  }

  async function handleSelectOption(optionId) {
    // Unselect all, then select this one
    await supabase.from("flight_options").update({ is_selected: false }).eq("trip_id", tripId);
    await supabase.from("flight_options").update({ is_selected: true }).eq("id", optionId);
    setSelectedOption(optionId);
    loadOptions();
  }

  const selectedOpt = options.find((o) => o.id === selectedOption);

  if (loading) return null;

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-600">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
          <h2 className="text-lg font-bold text-slate-800">Flight Options</h2>
          <span className="text-sm text-slate-400">({options.length})</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
        >
          + Add Flight Option
        </button>
      </div>

      {options.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-sky-200 p-8 text-center">
          <div className="text-4xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto text-sky-200">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </div>
          <p className="text-slate-500 mb-1">No flight options yet</p>
          <p className="text-sm text-slate-400">
            Paste a Google Flights link, Skyscanner URL, or screenshot to compare flight options.
          </p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Option tabs (left side - boarding pass style) */}
          <div className="flex flex-col gap-2 w-56 flex-shrink-0">
            {options.map((opt) => (
              <OptionTab
                key={opt.id}
                option={opt}
                isActive={opt.id === selectedOption}
                onSelect={() => { setSelectedOption(opt.id); handleSelectOption(opt.id); }}
                onDelete={() => handleDeleteOption(opt.id)}
              />
            ))}
            <button
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-sky-200 text-sky-500 text-sm font-medium rounded-lg py-3 hover:border-sky-400 hover:text-sky-600 transition-colors"
            >
              + Add Option
            </button>
          </div>

          {/* Detail panel (right side) */}
          {selectedOpt && (
            <OptionDetail option={selectedOpt} />
          )}
        </div>
      )}

      {/* Add Flight Modal */}
      {showAddModal && (
        <AddFlightModal
          tripId={tripId}
          onClose={() => setShowAddModal(false)}
          onSave={() => { setShowAddModal(false); loadOptions(); }}
        />
      )}
    </div>
  );
}

// ─── OPTION TAB (boarding pass style) ───
function OptionTab({ option, isActive, onSelect, onDelete }) {
  const legs = option.flight_legs || [];
  const outbound = legs.find((l) => l.direction === "outbound");
  const returnLeg = legs.find((l) => l.direction === "return");

  const routeSummary = outbound
    ? `${outbound.departure_airport} → ${outbound.arrival_airport}`
    : "No flights";

  const dateSummary = outbound?.departure_date
    ? formatDate(outbound.departure_date)
    : "Dates TBD";

  return (
    <div
      onClick={onSelect}
      className={`
        group relative cursor-pointer rounded-r-lg border overflow-hidden transition-all
        ${isActive
          ? "border-sky-500 bg-sky-50 shadow-md"
          : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm"
        }
      `}
    >
      {/* Perforated left edge */}
      <div
        className="absolute top-0 bottom-0 left-0 w-2"
        style={{
          background: isActive
            ? "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, #e0f2fe 3px, #e0f2fe 6px)"
            : "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, #f8fafc 3px, #f8fafc 6px)",
          borderRight: "1px dashed #cbd5e1",
        }}
      />

      {/* Delete button (appears on hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
        title="Delete option"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
          <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="pl-4 pr-3 py-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Option {option.sort_order + 1}
          </span>
          {isActive && (
            <span className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="w-2.5 h-2.5">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-slate-800 truncate">{option.name}</div>
        <div className="text-xs text-slate-500 truncate">{routeSummary}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-slate-400">{dateSummary}</span>
          {option.total_price && (
            <span className="text-sm font-bold text-emerald-600">
              ${Number(option.total_price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OPTION DETAIL PANEL ───
function OptionDetail({ option }) {
  const legs = option.flight_legs || [];
  const outbound = legs.filter((l) => l.direction === "outbound");
  const returnLegs = legs.filter((l) => l.direction === "return");

  return (
    <div className="flex-1 bg-white rounded-xl border border-sky-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{option.name}</h3>
          {option.source_url && (
            <a
              href={option.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-500 hover:text-sky-600 inline-flex items-center gap-1"
            >
              View on booking site
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
                <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
              </svg>
            </a>
          )}
        </div>
        {option.total_price && (
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">
              ${Number(option.total_price).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">{option.currency || "USD"}</div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-5 pb-4 border-b border-sky-50">
        <StatBadge label="Legs" value={legs.length} />
        <StatBadge label="Cabin" value={legs[0]?.cabin_class || "economy"} />
        {outbound[0]?.departure_date && returnLegs[returnLegs.length - 1]?.departure_date && (
          <StatBadge
            label="Duration"
            value={`${daysBetween(outbound[0].departure_date, returnLegs[returnLegs.length - 1].departure_date)} days`}
          />
        )}
        {legs[0]?.airline_name && <StatBadge label="Airline" value={legs[0].airline_name} />}
        {option.num_passengers && option.num_passengers > 0 && (
          <StatBadge label="Passengers" value={option.num_passengers} />
        )}
      </div>

      {/* Flight legs */}
      {outbound.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Outbound</div>
          {outbound.map((leg) => (
            <FlightLegCard key={leg.id} leg={leg} />
          ))}
        </div>
      )}

      {returnLegs.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Return</div>
          {returnLegs.map((leg) => (
            <FlightLegCard key={leg.id} leg={leg} />
          ))}
        </div>
      )}

      {legs.length === 0 && (
        <p className="text-sm text-slate-400 italic">No flight legs parsed. Try adding details manually.</p>
      )}

      {/* Screenshot */}
      {option.screenshot_url && (
        <div className="mt-4 pt-4 border-t border-sky-50">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Screenshot</div>
          <img
            src={option.screenshot_url}
            alt="Flight screenshot"
            className="w-full rounded-lg border border-slate-200 max-h-64 object-contain bg-slate-50 cursor-pointer"
            onClick={(e) => {
              // Open screenshot in full view on click
              const w = window.open();
              w.document.write(`<img src="${option.screenshot_url}" style="max-width:100%;margin:20px auto;display:block;">`);
            }}
          />
        </div>
      )}

      {/* Notes */}
      {option.notes && (
        <div className="mt-4 pt-4 border-t border-sky-50">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Notes</div>
          <p className="text-sm text-slate-600">{option.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── FLIGHT LEG CARD ───
function FlightLegCard({ leg }) {
  const logoUrl = airlineLogoUrl(leg.airline_code);

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-2">
      {/* Airline logo or code */}
      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={leg.airline_code}
            className="w-7 h-7 object-contain"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <span
          className={`text-xs font-bold text-slate-500 ${logoUrl ? "hidden" : "flex"}`}
          style={{ display: logoUrl ? "none" : "flex" }}
        >
          {leg.airline_code || "?"}
        </span>
      </div>

      {/* Route and times */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{leg.departure_airport}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-sky-400">
            <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-bold text-slate-800">{leg.arrival_airport}</span>
          {leg.flight_number && (
            <span className="text-xs text-slate-400 ml-1">{leg.flight_number}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-slate-500">
            {formatDate(leg.departure_date)}
          </span>
          {leg.departure_time && (
            <span className="text-xs text-slate-600 font-medium">
              {formatTime(leg.departure_time)}
              {leg.arrival_time && ` – ${formatTime(leg.arrival_time)}`}
            </span>
          )}
          {leg.duration_minutes && (
            <span className="text-xs text-sky-500 font-medium">
              {Math.floor(leg.duration_minutes / 60)}h {leg.duration_minutes % 60}m
            </span>
          )}
        </div>
      </div>

      {/* City names */}
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-slate-400">{getCityName(leg.departure_airport)}</div>
        <div className="text-xs text-slate-400">{getCityName(leg.arrival_airport)}</div>
      </div>
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold text-slate-700 capitalize">{value}</div>
    </div>
  );
}

function daysBetween(d1, d2) {
  const a = new Date(d1 + "T00:00:00");
  const b = new Date(d2 + "T00:00:00");
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

// ─── MANUAL LEG ENTRY ROW ───
function ManualLegRow({ leg, index, onChange, onRemove }) {
  function update(field, val) {
    onChange(index, { ...leg, [field]: val });
  }
  return (
    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase">Leg {index + 1}</span>
        <button onClick={() => onRemove(index)} className="text-slate-300 hover:text-red-500 text-sm">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">From</label>
          <input type="text" value={leg.departure_airport || ""} onChange={(e) => update("departure_airport", e.target.value.toUpperCase())}
            placeholder="LAX" maxLength={4} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm uppercase" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">To</label>
          <input type="text" value={leg.arrival_airport || ""} onChange={(e) => update("arrival_airport", e.target.value.toUpperCase())}
            placeholder="ICN" maxLength={4} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm uppercase" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Date</label>
          <input type="date" value={leg.departure_date || ""} onChange={(e) => update("departure_date", e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Direction</label>
          <select value={leg.direction || "outbound"} onChange={(e) => update("direction", e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white">
            <option value="outbound">Outbound</option>
            <option value="return">Return</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Depart Time</label>
          <input type="time" value={leg.departure_time || ""} onChange={(e) => update("departure_time", e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Arrive Time</label>
          <input type="time" value={leg.arrival_time || ""} onChange={(e) => update("arrival_time", e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Airline Code</label>
          <input type="text" value={leg.airline_code || ""} onChange={(e) => update("airline_code", e.target.value.toUpperCase())}
            placeholder="KE" maxLength={3} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm uppercase" />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Flight #</label>
          <input type="text" value={leg.flight_number || ""} onChange={(e) => update("flight_number", e.target.value)}
            placeholder="KE 12" className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
        </div>
      </div>
    </div>
  );
}

// ─── ADD FLIGHT MODAL ───
function AddFlightModal({ tripId, onClose, onSave }) {
  const [name, setName] = useState("");
  const [pasteInput, setPasteInput] = useState("");
  const [price, setPrice] = useState("");
  const [numPassengers, setNumPassengers] = useState("");
  const [notes, setNotes] = useState("");
  const [parsedResult, setParsedResult] = useState(null);
  const [urlParseStatus, setUrlParseStatus] = useState(null); // null | "analyzing" | "done" | "error"
  const [saving, setSaving] = useState(false);
  const [screenshot, setScreenshot] = useState(null); // base64 data URL
  const [ocrStatus, setOcrStatus] = useState(null); // null | "processing" | "done" | "error"
  const [ocrText, setOcrText] = useState("");
  const [ocrLegs, setOcrLegs] = useState([]);
  const [manualLegs, setManualLegs] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Auto-parse when paste input changes — tries local parsers first, then Gemini AI for URLs
  async function handlePasteChange(val) {
    setPasteInput(val);
    setUrlParseStatus(null);

    if (!val.trim()) {
      setParsedResult(null);
      return;
    }

    const trimmed = val.trim();
    const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://");

    // For URLs: send to Gemini AI for intelligent parsing
    if (isUrl) {
      setUrlParseStatus("analyzing");
      setParsedResult({ type: "url", url: trimmed, legs: [] });

      try {
        const response = await fetch("/api/parse-flight-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        const legs = (result.flights || []).map((f, i) => ({
          direction: f.direction || (i === 0 ? "outbound" : "return"),
          departure_airport: f.departure_airport || "",
          arrival_airport: f.arrival_airport || "",
          departure_date: f.departure_date || null,
          departure_time: f.departure_time || null,
          arrival_time: f.arrival_time || null,
          airline_code: f.airline_code || null,
          airline_name: f.airline_name || getAirlineName(f.airline_code),
          flight_number: f.flight_number || null,
          duration_minutes: f.duration_minutes || null,
          cabin_class: f.cabin_class || null,
          leg_order: i,
        }));

        setParsedResult({ type: result.source || "url", url: trimmed, legs });
        setUrlParseStatus("done");

        // Auto-fill price
        if (result.total_price && !price) {
          setPrice(String(result.total_price));
        }

        // Auto-fill passengers
        if (result.num_passengers && !numPassengers) {
          setNumPassengers(String(result.num_passengers));
        }

        // Auto-generate name
        if (!name && legs.length > 0) {
          const airline = result.airline_name || legs[0].airline_name || legs[0].airline_code || "";
          setName(`${airline} ${legs[0].departure_airport}→${legs[0].arrival_airport}`.trim());
        }
      } catch (err) {
        console.error("AI URL parse error:", err);
        setUrlParseStatus("error");
        // Fall back to local parsers
        const localResult = parseFlightInput(trimmed);
        setParsedResult(localResult);
        if (localResult?.legs?._price && !price) {
          setPrice(String(localResult.legs._price));
        }
        if (!name && localResult?.legs?.length > 0) {
          const first = localResult.legs[0];
          const airline = first.airline_name || first.airline_code || "";
          setName(`${airline} ${first.departure_airport}→${first.arrival_airport}`.trim());
        }
      }
    } else {
      // For plain text: use local parser (instant)
      const result = parseFlightInput(trimmed);
      setParsedResult(result);
      if (result?.legs?._price && !price) {
        setPrice(String(result.legs._price));
      }
      if (!name && result?.legs?.length > 0) {
        const first = result.legs[0];
        const airline = first.airline_name || first.airline_code || "";
        setName(`${airline} ${first.departure_airport}→${first.arrival_airport}`.trim());
      }
    }
  }

  // Screenshot handling — sends image to Gemini Vision API for extraction
  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setScreenshot(dataUrl);
      setOcrStatus("processing");
      setOcrText("");
      setOcrLegs([]);

      try {
        // Send to Gemini Vision API for intelligent extraction
        const result = await extractFlightsFromImage(dataUrl);

        if (result.flights && result.flights.length > 0) {
          // Map Gemini response to our leg format
          const legs = result.flights.map((f, i) => ({
            direction: f.direction || (i === 0 ? "outbound" : "return"),
            departure_airport: f.departure_airport || "",
            arrival_airport: f.arrival_airport || "",
            departure_date: f.departure_date || null,
            departure_time: f.departure_time || null,
            arrival_time: f.arrival_time || null,
            airline_code: f.airline_code || null,
            airline_name: f.airline_name || getAirlineName(f.airline_code),
            flight_number: f.flight_number || null,
            duration_minutes: f.duration_minutes || null,
            cabin_class: f.cabin_class || null,
            leg_order: i,
          }));

          setOcrLegs(legs);
          setOcrStatus("done");
          setOcrText("Extracted by AI vision");

          // Auto-fill price if extracted
          if (result.total_price && !price) {
            setPrice(String(result.total_price));
          }

          // Auto-fill passengers
          if (result.num_passengers && !numPassengers) {
            setNumPassengers(String(result.num_passengers));
          }

          // Auto-fill name if empty
          if (!name && legs[0]?.departure_airport) {
            const airline = result.airline_name || legs[0].airline_name || legs[0].airline_code || "";
            setName(`${airline} ${legs[0].departure_airport}→${legs[0].arrival_airport}`.trim());
          }
        } else {
          setOcrStatus("done");
          setOcrText("No flights found in image");
        }
      } catch (err) {
        console.error("AI vision error:", err);
        setOcrStatus("error");
        setOcrText(err.message || "Failed to analyze image");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        handleImageFile(item.getAsFile());
        return;
      }
    }
  }

  // Manual leg management
  function addManualLeg() {
    setManualLegs((prev) => [...prev, {
      direction: prev.length === 0 ? "outbound" : "return",
      departure_airport: "", arrival_airport: "",
      departure_date: "", departure_time: "", arrival_time: "",
      airline_code: "", flight_number: "",
      leg_order: prev.length,
    }]);
    setShowManualEntry(true);
  }

  function updateManualLeg(idx, leg) {
    setManualLegs((prev) => prev.map((l, i) => i === idx ? { ...leg, leg_order: i } : l));
  }

  function removeManualLeg(idx) {
    setManualLegs((prev) => prev.filter((_, i) => i !== idx).map((l, i) => ({ ...l, leg_order: i })));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);

    try {
      // Count existing options to set sort_order
      const { count } = await supabase
        .from("flight_options")
        .select("*", { count: "exact", head: true })
        .eq("trip_id", tripId);

      // Create the flight option
      const { data: option, error: optError } = await supabase
        .from("flight_options")
        .insert({
          trip_id: tripId,
          name: name.trim(),
          total_price: price ? parseFloat(price) : null,
          num_passengers: numPassengers ? parseInt(numPassengers) : 1,
          source_url: parsedResult?.url || null,
          screenshot_url: screenshot || null,
          notes: notes || null,
          sort_order: count || 0,
        })
        .select()
        .single();

      if (optError) throw optError;

      // Combine parsed legs + OCR legs + manual legs
      const parsedLegs = (parsedResult?.legs || []).filter((l) => l.departure_airport);
      const validOcrLegs = ocrLegs.filter((l) => l.departure_airport);
      const validManualLegs = manualLegs.filter((l) => l.departure_airport && l.arrival_airport);
      const allLegs = [...parsedLegs, ...validOcrLegs, ...validManualLegs];

      if (allLegs.length > 0) {
        const legRows = allLegs.map((l, i) => ({
          option_id: option.id,
          leg_order: l.leg_order ?? i,
          direction: l.direction || "outbound",
          airline_code: l.airline_code || null,
          airline_name: l.airline_name || getAirlineName(l.airline_code) || null,
          flight_number: l.flight_number || null,
          departure_airport: l.departure_airport,
          arrival_airport: l.arrival_airport,
          departure_date: l.departure_date || null,
          departure_time: l.departure_time || null,
          arrival_date: l.arrival_date || null,
          arrival_time: l.arrival_time || null,
          duration_minutes: l.duration_minutes || null,
          cabin_class: l.cabin_class || "economy",
          aircraft_type: l.aircraft_type || null,
        }));

        await supabase.from("flight_legs").insert(legRows);
      }

      onSave();
    } catch (err) {
      console.error("Error saving flight option:", err);
      alert("Error saving flight option. Please try again.");
    }
    setSaving(false);
  }

  const parsedLegCount = (parsedResult?.legs || []).filter((l) => l.departure_airport).length;
  const ocrLegCount = ocrLegs.filter((l) => l.departure_airport).length;
  const manualLegCount = manualLegs.filter((l) => l.departure_airport && l.arrival_airport).length;
  const totalLegs = parsedLegCount + ocrLegCount + manualLegCount;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-sky-100 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onPaste={handlePaste}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-800">Add Flight Option</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Option Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Korean Air Direct" or "Delta via Tokyo"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>

          {/* Smart paste box */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Paste Flight Info
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Paste a Delta, Skyscanner, or booking URL — or type flight details as text
            </p>
            <textarea
              value={pasteInput}
              onChange={(e) => handlePasteChange(e.target.value)}
              rows={3}
              placeholder={"Paste a booking URL here, e.g.:\nhttps://www.delta.com/completepurchase/...\nhttps://www.skyscanner.com/transport/flights/..."}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm font-mono"
            />

            {/* Parse status */}
            {urlParseStatus === "analyzing" && (
              <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Analyzing flight URL with AI... (this may take a few seconds)
              </div>
            )}
            {urlParseStatus !== "analyzing" && parsedResult && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${parsedLegCount > 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {parsedLegCount > 0 ? (
                  <span>
                    Found {parsedLegCount} flight leg(s){parsedResult.type ? ` from ${parsedResult.type.replace("_", " ")}` : ""}
                    <span className="ml-1 font-medium">
                      ({parsedResult.legs.filter((l) => l.departure_airport).map((l) => `${l.departure_airport}→${l.arrival_airport}`).join(", ")})
                    </span>
                  </span>
                ) : (
                  <span>
                    {urlParseStatus === "error"
                      ? "AI couldn't reach this URL. The URL is saved as a reference — add flight details manually below."
                      : "Couldn't extract flight details from this input. Use \"Add flight leg manually\" below."}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Screenshot drop zone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Screenshot
            </label>
            {!screenshot ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragOver ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-300"}`}
                onClick={() => document.getElementById("flight-screenshot-input").click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mx-auto text-slate-300 mb-2">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-slate-400">
                  Drag & drop a screenshot, paste from clipboard (Ctrl+V), or click to browse
                </p>
                <input
                  id="flight-screenshot-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div>
                <div className="relative">
                  <img src={screenshot} alt="Flight screenshot" className="w-full rounded-lg border border-slate-200 max-h-48 object-contain bg-slate-50" />
                  <button
                    onClick={() => { setScreenshot(null); setOcrStatus(null); setOcrText(""); setOcrLegs([]); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* OCR status */}
                {ocrStatus === "processing" && (
                  <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Analyzing screenshot with AI... (this may take a few seconds)
                  </div>
                )}
                {ocrStatus === "done" && ocrLegCount > 0 && (
                  <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                    Extracted {ocrLegCount} flight leg(s) from screenshot:
                    <span className="font-medium ml-1">
                      {ocrLegs.filter((l) => l.departure_airport).map((l) => `${l.departure_airport}→${l.arrival_airport}`).join(", ")}
                    </span>
                  </div>
                )}
                {ocrStatus === "done" && ocrLegCount === 0 && (
                  <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                    No flights found in the image. Try a clearer screenshot showing flight details, or add legs manually below.
                  </div>
                )}
                {ocrStatus === "error" && (
                  <div className="mt-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700">
                    {ocrText || "Couldn't analyze the screenshot. You can still save it as a visual reference and add legs manually."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual flight leg entry */}
          <div className="mb-4">
            {manualLegs.length > 0 && (
              <div className="space-y-2 mb-2">
                {manualLegs.map((leg, i) => (
                  <ManualLegRow key={i} leg={leg} index={i} onChange={updateManualLeg} onRemove={removeManualLeg} />
                ))}
              </div>
            )}
            <button
              onClick={addManualLeg}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              + Add flight leg manually
            </button>
          </div>

          {/* Price + Passengers */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1,437"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passengers</label>
              <input
                type="number"
                min="1"
                max="20"
                value={numPassengers}
                onChange={(e) => setNumPassengers(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">How many travelers this price covers</p>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes about this option..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Summary bar */}
          {totalLegs > 0 && (
            <div className="mb-4 px-3 py-2 bg-sky-50 rounded-lg text-xs text-sky-700">
              {totalLegs} flight leg(s) ready to save
              {parsedLegCount > 0 && manualLegCount > 0 && ` (${parsedLegCount} parsed + ${manualLegCount} manual)`}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 text-sm font-medium"
            >
              {saving ? "Saving..." : "Save Option"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
