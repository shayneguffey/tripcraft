"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ── Category metadata ──
const CATEGORIES = {
  car_rental: { label: "Car Rental", color: "bg-violet-100 text-violet-700", icon: "M5 3l1 4h12l1-4M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm3 10a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" },
  train: { label: "Train", color: "bg-blue-100 text-blue-700", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  bus: { label: "Bus", color: "bg-amber-100 text-amber-700", icon: "M8 6a3 3 0 110-6 3 3 0 010 6zM14 8a1 1 0 11-2 0 1 1 0 012 0zM8 8a1 1 0 11-2 0 1 1 0 012 0zm6-2a1 1 0 100-2 1 1 0 000 2zm-4 8h12a2 2 0 012 2v2h-2v-2H8v2H6v-2a2 2 0 012-2z" },
  ferry: { label: "Ferry", color: "bg-cyan-100 text-cyan-700", icon: "M5 8a3 3 0 116 0H5zm0 2h6v4h2V8H3v6h2V10zm0-8h6a3 3 0 013 3v8h2V3a5 5 0 00-5-5H5v5z" },
  transfer: { label: "Transfer", color: "bg-emerald-100 text-emerald-700", icon: "M12 5v.01M17.712 18.221A6.002 6.002 0 006.289 5.778A6 6 0 1017.712 18.22zM12 13a1 1 0 100-2 1 1 0 000 2z" },
  rideshare: { label: "Rideshare", color: "bg-pink-100 text-pink-700", icon: "M18.364 5.636l-3.536 3.536m9.172-9.172l-3.536 3.536M9 5a4 4 0 110-8 4 4 0 010 8zm0 0l4.879 4.879m-2.121 2.121l4.879-4.879" },
  other: { label: "Other", color: "bg-slate-100 text-slate-700", icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" },
};

function getCategoryInfo(cat) {
  return CATEGORIES[cat] || CATEGORIES.other;
}

function formatPrice(price, currency) {
  if (!price && price !== 0) return "";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${sym}${Number(price).toFixed(2)}`;
}

function formatDuration(mins) {
  if (!mins) return "";
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

function formatDateNice(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(timeStr) {
  return timeStr || "";
}

// ── Send image to Gemini for transportation extraction ──
async function extractTransportFromImage(imageDataUrl) {
  const mimeMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const response = await fetch("/api/parse-transportation", {
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

// ── Send URL to Gemini for transportation extraction ──
async function extractTransportFromUrl(url) {
  const response = await fetch("/api/parse-transportation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }
  return response.json();
}

// ─────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────
export default function TransportationOptions({ tripId, tripStart, tripEnd, onTransportationOptionsChange }) {
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOptions = useCallback(async () => {
    const { data } = await supabase
      .from("transportation_options")
      .select("*")
      .eq("trip_id", tripId)
      .order("sort_order", { ascending: true });
    const opts = data || [];
    setOptions(opts);
    if (onTransportationOptionsChange) onTransportationOptionsChange(opts);
    if (opts.length > 0 && !selectedId) setSelectedId(opts[0].id);
    setLoading(false);
  }, [tripId, selectedId, onTransportationOptionsChange]);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const selected = options.find((o) => o.id === selectedId);

  async function handleDelete(id) {
    if (!confirm("Delete this transportation option?")) return;
    await supabase.from("transportation_options").delete().eq("id", id);
    if (selectedId === id) setSelectedId(options.find((o) => o.id !== id)?.id || null);
    loadOptions();
  }

  async function handleToggleSelected(id) {
    const opt = options.find((o) => o.id === id);
    if (!opt) return;
    await supabase.from("transportation_options").update({ is_selected: !opt.is_selected }).eq("id", id);
    loadOptions();
  }

  if (loading) return null;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8a3 3 0 116 0H5zm0 2h6v4h2V8H3v6h2V10zm0-8h6a3 3 0 013 3v8h2V3a5 5 0 00-5-5H5v5z" />
          </svg>
          Transportation Options
          {options.length > 0 && <span className="text-sm font-normal text-slate-400">({options.length})</span>}
        </h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors">
          + Add Transportation Option
        </button>
      </div>

      {/* Options list + detail panel */}
      {options.length > 0 && (
        <div className="flex gap-4">
          {/* Left: option tabs */}
          <div className="w-56 flex-shrink-0 space-y-2">
            {options.map((opt, i) => (
              <OptionTab key={opt.id} opt={opt} index={i} isSelected={selectedId === opt.id}
                onClick={() => setSelectedId(opt.id)} onDelete={() => handleDelete(opt.id)} />
            ))}
            <button onClick={() => setShowModal(true)}
              className="w-full py-3 border-2 border-dashed border-violet-300 rounded-xl text-violet-600 text-sm font-medium hover:bg-violet-50 transition-colors">
              + Add Option
            </button>
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 bg-white rounded-xl border border-violet-100 shadow-sm p-5 min-h-[200px]">
            {selected ? (
              <OptionDetail opt={selected} tripStart={tripStart} tripEnd={tripEnd}
                onToggleSelected={() => handleToggleSelected(selected.id)} />
            ) : (
              <p className="text-slate-400 text-sm italic">Select a transportation option to view details</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {options.length === 0 && !showModal && (
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm p-8 text-center">
          <svg className="w-10 h-10 text-violet-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8a3 3 0 116 0H5zm0 2h6v4h2V8H3v6h2V10zm0-8h6a3 3 0 013 3v8h2V3a5 5 0 00-5-5H5v5z" />
          </svg>
          <p className="text-slate-500 text-sm mb-1">No transportation options yet</p>
          <p className="text-slate-400 text-xs mb-4">Add car rentals, trains, buses, ferries, and transfers to compare</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700">
            + Add Transportation Option
          </button>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <AddTransportationModal tripId={tripId} tripStart={tripStart} tripEnd={tripEnd} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); loadOptions(); }} />
      )}
    </div>
  );
}

// ─── OPTION TAB ───
function OptionTab({ opt, index, isSelected, onClick, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const cat = getCategoryInfo(opt.category);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-3 rounded-xl cursor-pointer transition-all border-2 ${
        isSelected ? "border-violet-500 bg-violet-50 shadow-sm" : "border-slate-200 bg-white hover:border-violet-300"
      }`}
    >
      {/* Delete button */}
      {hovered && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors" title="Delete">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${cat.color}`}>
          {cat.label.toUpperCase()}
        </span>
        {opt.is_selected && (
          <svg className="w-3.5 h-3.5 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="font-semibold text-sm text-slate-800 truncate">{opt.name || "Untitled"}</div>
      {opt.pickup_location && <div className="text-xs text-slate-500 truncate">{opt.pickup_location} → {opt.dropoff_location || "..."}</div>}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-400">
          {opt.departure_date ? formatDateNice(opt.departure_date) : ""}
        </span>
        {opt.price && <span className="text-sm font-bold text-violet-600">{formatPrice(opt.price, opt.currency)}</span>}
      </div>
    </div>
  );
}

// ─── OPTION DETAIL ───
function OptionDetail({ opt, tripStart, tripEnd, onToggleSelected }) {
  const cat = getCategoryInfo(opt.category);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${cat.color}`}>
              {cat.label}
            </span>
            {opt.provider && <span className="text-xs text-slate-400">via {opt.provider}</span>}
            {opt.is_private && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">Private</span>}
          </div>
          <h3 className="text-xl font-bold text-slate-800">{opt.name}</h3>
        </div>
        <div className="text-right">
          {opt.price && (
            <div className="text-2xl font-bold text-slate-800">{formatPrice(opt.price, opt.currency)}</div>
          )}
          {opt.price_per && (
            <div className="text-xs text-slate-400">per {opt.price_per}</div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4 text-sm text-slate-600 flex-wrap">
        {opt.vehicle_type && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Vehicle/Class</span><div className="font-medium">{opt.vehicle_type}{opt.class_type ? ` (${opt.class_type})` : ""}</div></div>
        )}
        {opt.class_type && !opt.vehicle_type && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Class</span><div className="font-medium">{opt.class_type}</div></div>
        )}
        {opt.duration_minutes && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Duration</span><div className="font-medium">{formatDuration(opt.duration_minutes)}</div></div>
        )}
        {opt.passengers && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Passengers</span><div className="font-medium">{opt.passengers}</div></div>
        )}
        {opt.rating && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide">Rating</span>
            <div className="font-medium flex items-center gap-1">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {opt.rating}{opt.review_count ? <span className="text-xs text-slate-400">({opt.review_count.toLocaleString()})</span> : ""}
            </div>
          </div>
        )}
        {opt.service_name && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Service</span><div className="font-medium">{opt.service_name}</div></div>
        )}
      </div>

      {/* Description */}
      {opt.description && (
        <div className="mb-4">
          <p className="text-sm text-slate-600 leading-relaxed">{opt.description}</p>
        </div>
      )}

      {/* Route info */}
      {(opt.pickup_location || opt.dropoff_location) && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Route</div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-slate-500">Pickup</div>
              <div className="font-medium text-slate-800">{opt.pickup_location || "—"}</div>
              {opt.departure_date && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatDateNice(opt.departure_date)}
                  {opt.departure_time && ` at ${formatTime(opt.departure_time)}`}
                </div>
              )}
            </div>
            <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <div>
              <div className="text-xs text-slate-500">Dropoff</div>
              <div className="font-medium text-slate-800">{opt.dropoff_location || "—"}</div>
              {opt.arrival_date && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatDateNice(opt.arrival_date)}
                  {opt.arrival_time && ` at ${formatTime(opt.arrival_time)}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Car rental specific */}
      {opt.category === "car_rental" && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Rental Details</div>
          <div className="flex flex-wrap gap-2">
            {opt.insurance_included && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                ✓ Insurance included
              </span>
            )}
            {opt.mileage_policy && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {opt.mileage_policy}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={onToggleSelected}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            opt.is_selected ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600 hover:bg-violet-50"
          }`}>
          {opt.is_selected ? "✓ Picked" : "Mark as pick"}
        </button>
        {opt.source_url && (
          <a href={opt.source_url} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            View original →
          </a>
        )}
      </div>

      {/* Screenshot */}
      {opt.screenshot_url && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Screenshot</div>
          <img src={opt.screenshot_url} alt="Transportation screenshot" className="rounded-lg border border-slate-200 max-h-64 object-contain" />
        </div>
      )}

      {/* Notes */}
      {opt.notes && (
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Notes</div>
          <p className="text-sm text-slate-600">{opt.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── ADD TRANSPORTATION MODAL ───
function AddTransportationModal({ tripId, tripStart, tripEnd, onClose, onSave }) {
  const [name, setName] = useState("");
  const [pasteInput, setPasteInput] = useState("");
  const [price, setPrice] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [aiStatus, setAiStatus] = useState(null); // null | "processing" | "done" | "error"
  const [aiResult, setAiResult] = useState(null);
  const [urlStatus, setUrlStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-parse URL input — matches the working FlightOptions pattern exactly
  async function handlePasteChange(val) {
    setPasteInput(val);
    setUrlStatus(null);

    if (!val.trim()) {
      setAiResult(null);
      return;
    }

    const trimmed = val.trim();
    const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://");

    if (isUrl) {
      setUrlStatus("analyzing");
      try {
        const result = await extractTransportFromUrl(trimmed);
        setAiResult(result);
        setUrlStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.price && !price) setPrice(String(result.price));
        if (result.departure_date && !departureDate) setDepartureDate(result.departure_date);
      } catch (err) {
        console.error("AI URL parse error:", err);
        setUrlStatus("error:" + (err.message || "Unknown error"));
      }
    }
  }

  // Screenshot handling
  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setScreenshot(dataUrl);
      setAiStatus("processing");
      setAiResult(null);

      try {
        const result = await extractTransportFromImage(dataUrl);
        setAiResult(result);
        setAiStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.price && !price) setPrice(String(result.price));
        if (result.departure_date && !departureDate) setDepartureDate(result.departure_date);
      } catch (err) {
        console.error("AI vision error:", err);
        setAiStatus("error:" + (err.message || "Unknown error"));
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
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

  async function handleSave() {
    if (!name.trim()) { alert("Please enter a transportation option name"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Merge AI result with manual inputs
      const ai = aiResult || {};
      const { error } = await supabase.from("transportation_options").insert({
        trip_id: tripId,
        user_id: user.id,
        name: name.trim(),
        description: ai.description || null,
        category: ai.category || "other",
        pickup_location: ai.pickup_location || null,
        dropoff_location: ai.dropoff_location || null,
        departure_date: departureDate || ai.departure_date || null,
        departure_time: ai.departure_time || null,
        arrival_date: ai.arrival_date || null,
        arrival_time: ai.arrival_time || null,
        duration_minutes: ai.duration_minutes || null,
        price: price ? parseFloat(price) : ai.price || null,
        currency: ai.currency || "USD",
        price_per: ai.price_per || "total",
        passengers: ai.passengers || null,
        vehicle_type: ai.vehicle_type || null,
        class_type: ai.class_type || null,
        service_name: ai.service_name || null,
        is_private: ai.is_private || false,
        insurance_included: ai.insurance_included || false,
        mileage_policy: ai.mileage_policy || null,
        provider: ai.provider || null,
        rating: ai.rating || null,
        review_count: ai.review_count || null,
        source_url: pasteInput.trim().startsWith("http") ? pasteInput.trim() : null,
        screenshot_url: screenshot || null,
        notes: notes.trim() || null,
        sort_order: 0,
      });

      if (error) throw error;
      onSave();
    } catch (err) {
      console.error("Error saving transportation:", err);
      alert("Error saving. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-violet-100 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">Add Transportation Option</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Transportation Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Hertz SUV Rental", "JR Shinkansen Tokyo→Kyoto"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          </div>

          {/* Paste URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Paste URL</label>
            <p className="text-xs text-slate-400 mb-1">Paste a car rental, train, bus, or transfer booking URL</p>
            <textarea value={pasteInput} onChange={(e) => handlePasteChange(e.target.value)} rows={2}
              placeholder="https://www.hertz.com/... or https://www.trainline.eu/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono" />
            {urlStatus === "analyzing" && (
              <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Analyzing URL with AI...
              </div>
            )}
            {urlStatus === "done" && aiResult?.name && (
              <div className="mt-2 px-3 py-2 bg-violet-50 rounded-lg text-xs text-violet-700">
                Found: {aiResult.name}{aiResult.price ? ` · ${formatPrice(aiResult.price, aiResult.currency)}` : ""}
              </div>
            )}
            {urlStatus?.startsWith("error") && (
              <div className="mt-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700">
                {urlStatus.includes(":") ? urlStatus.split(":").slice(1).join(":") : "Couldn't analyze URL. You can still enter details manually."}
              </div>
            )}
          </div>

          {/* Screenshot */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Screenshot</label>
            {!screenshot ? (
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragOver ? "border-violet-400 bg-violet-50" : "border-slate-300 hover:border-violet-400"
                }`}
                onClick={() => fileInputRef.current?.click()}>
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <p className="text-xs text-slate-400">Drop screenshot, paste (Ctrl+V), or click to upload</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="relative">
                <img src={screenshot} alt="Screenshot" className="rounded-lg border border-slate-200 max-h-48 object-contain w-full" />
                <button onClick={() => { setScreenshot(null); setAiStatus(null); setAiResult(null); }}
                  className="absolute top-2 right-2 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-500 shadow">×</button>
                {aiStatus === "processing" && (
                  <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Analyzing screenshot with AI...
                  </div>
                )}
                {aiStatus === "done" && aiResult?.name && (
                  <div className="mt-2 px-3 py-2 bg-violet-50 rounded-lg text-xs text-violet-700">
                    Found: {aiResult.name}{aiResult.price ? ` · ${formatPrice(aiResult.price, aiResult.currency)}` : ""}
                    {aiResult.rating ? ` · ★${aiResult.rating}` : ""}
                  </div>
                )}
                {aiStatus?.startsWith("error") && (
                  <div className="mt-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700">
                    {aiStatus.includes(":") ? aiStatus.split(":").slice(1).join(":") : "Couldn't analyze screenshot. You can still save it and enter details manually."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder={aiResult?.price ? String(aiResult.price) : "0.00"} step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
          </div>

          {/* Departure date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Departure Date</label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Any notes about this transportation option..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          </div>

          {/* AI data preview */}
          {aiResult && (aiResult.description || aiResult.vehicle_type || aiResult.category) && (
            <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
              <span className="font-medium text-slate-500">AI extracted: </span>
              {aiResult.category && <span className="capitalize">{aiResult.category.replace(/_/g, " ")}</span>}
              {aiResult.vehicle_type && <span> · {aiResult.vehicle_type}</span>}
              {aiResult.class_type && <span> · {aiResult.class_type}</span>}
              {aiResult.duration_minutes && <span> · {formatDuration(aiResult.duration_minutes)}</span>}
              {aiResult.rating && <span> · ★{aiResult.rating}</span>}
              {aiResult.review_count && <span> ({aiResult.review_count} reviews)</span>}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !name.trim()}
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Option"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
