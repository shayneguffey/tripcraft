"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import InlineConfirm from "@/components/InlineConfirm";

// ── Category metadata ──
const CATEGORIES = {
  hotel: { label: "Hotel", color: "bg-blue-100 text-blue-700", icon: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM3 5h18M10 10v6M14 10v6" },
  airbnb: { label: "Airbnb", color: "bg-pink-100 text-pink-700", icon: "M3 12a9 9 0 110-18 9 9 0 010 18zm0 0a9.005 9.005 0 008.836-6.022A9.005 9.005 0 0012 3a9 9 0 00-9 9z" },
  hostel: { label: "Hostel", color: "bg-orange-100 text-orange-700", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" },
  resort: { label: "Resort", color: "bg-emerald-100 text-emerald-700", icon: "M12 3l10 6v2H2V9l10-6zm9 8v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9" },
  vacation_rental: { label: "Vacation Rental", color: "bg-purple-100 text-purple-700", icon: "M3 12l2.5-5L9 5l4.5 2 2.5 5v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7z" },
  boutique: { label: "Boutique", color: "bg-amber-100 text-amber-700", icon: "M12 8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v3h8v-3c0-2.21-1.79-4-4-4z" },
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

function formatDateNice(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ── Send image to Gemini for accommodation extraction ──
async function extractAccommodationFromImage(imageDataUrl) {
  const mimeMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const response = await fetch("/api/parse-accommodation", {
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

// ── Send URL to Gemini for accommodation extraction ──
async function extractAccommodationFromUrl(url) {
  const response = await fetch("/api/parse-accommodation", {
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
export default function AccommodationOptions({ tripId, tripStart, tripEnd, onAccommodationOptionsChange, itinerarySelections, activeItineraryId, onToggleSelection }) {
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOptions = useCallback(async () => {
    const { data } = await supabase
      .from("accommodation_options")
      .select("*")
      .eq("trip_id", tripId)
      .order("sort_order", { ascending: true });
    const opts = data || [];
    setOptions(opts);
    if (onAccommodationOptionsChange) onAccommodationOptionsChange(opts);
    if (opts.length > 0 && !selectedId) setSelectedId(opts[0].id);
    setLoading(false);
  }, [tripId, selectedId, onAccommodationOptionsChange]);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const selected = options.find((o) => o.id === selectedId);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function handleDelete(id) {
    setConfirmDeleteId(null);
    await supabase.from("accommodation_options").delete().eq("id", id);
    if (selectedId === id) setSelectedId(options.find((o) => o.id !== id)?.id || null);
    loadOptions();
  }

  async function handleToggleSelected(id) {
    if (onToggleSelection && activeItineraryId) {
      onToggleSelection("accommodation", id);
    } else {
      const opt = options.find((o) => o.id === id);
      if (!opt) return;
      await supabase.from("accommodation_options").update({ is_selected: !opt.is_selected }).eq("id", id);
      loadOptions();
    }
  }

  if (loading) return null;

  return (
    <div className="mb-4">
      {/* Options list + detail panel */}
      {options.length > 0 && (
        <div className="flex gap-4">
          {/* Left: option tabs */}
          <div className="w-56 flex-shrink-0 space-y-2">
            {options.map((opt, i) => (
              <OptionTab key={opt.id} opt={{...opt, is_selected: (itinerarySelections || []).some(s => s.option_type === "accommodation" && s.option_id === opt.id)}} index={i} isSelected={selectedId === opt.id}
                onClick={() => setSelectedId(opt.id)} onDelete={() => setConfirmDeleteId(opt.id)}
                confirmDelete={confirmDeleteId === opt.id} onConfirmDelete={() => handleDelete(opt.id)} onCancelDelete={() => setConfirmDeleteId(null)} />
            ))}
            <button onClick={() => setShowModal(true)}
              className="w-full py-3 border-2 border-dashed border-sky-300 rounded-xl text-sky-600 text-sm font-medium hover:bg-sky-50 transition-colors">
              + Add Option
            </button>
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 bg-white rounded-xl border border-sky-100 shadow-sm p-5 min-h-[200px]">
            {selected ? (
              <OptionDetail opt={{...selected, is_selected: (itinerarySelections || []).some(s => s.option_type === "accommodation" && s.option_id === selected.id)}} tripStart={tripStart} tripEnd={tripEnd}
                onToggleSelected={() => handleToggleSelected(selected.id)} />
            ) : (
              <p className="text-slate-400 text-sm italic">Select an accommodation to view details</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {options.length === 0 && !showModal && (
        <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-8 text-center">
          <svg className="w-10 h-10 text-sky-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 text-sm mb-1">No accommodation options yet</p>
          <p className="text-slate-400 text-xs mb-4">Add hotels, Airbnbs, and other accommodations to compare</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700">
            + Add Accommodation Option
          </button>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <AddAccommodationModal tripId={tripId} tripStart={tripStart} tripEnd={tripEnd} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); loadOptions(); }} />
      )}
    </div>
  );
}

// ─── OPTION TAB ───
function OptionTab({ opt, index, isSelected, onClick, onDelete, confirmDelete, onConfirmDelete, onCancelDelete }) {
  const [hovered, setHovered] = useState(false);
  const cat = getCategoryInfo(opt.category);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-3 rounded-xl cursor-pointer transition-all border-2 ${
        isSelected ? "border-sky-500 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:border-sky-300"
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
      <InlineConfirm open={confirmDelete} message="Delete this accommodation?" onConfirm={onConfirmDelete} onCancel={onCancelDelete} />

      <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${cat.color}`}>
          {cat.label.toUpperCase()}
        </span>
        {opt.is_selected && (
          <svg className="w-3.5 h-3.5 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="font-semibold text-sm text-slate-800 truncate">{opt.name || "Untitled"}</div>
      {opt.location_name && <div className="text-xs text-slate-500 truncate">{opt.location_name}</div>}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-400">
          {opt.check_in_date ? formatDateNice(opt.check_in_date) : ""}
          {opt.check_in_date && opt.check_out_date ? " – " : ""}
          {opt.check_out_date ? formatDateNice(opt.check_out_date) : ""}
        </span>
        {opt.price_per_night && <span className="text-sm font-bold text-sky-600">{formatPrice(opt.price_per_night, opt.currency)}/night</span>}
      </div>
    </div>
  );
}

// ─── OPTION DETAIL ───
function OptionDetail({ opt, tripStart, tripEnd, onToggleSelected }) {
  const cat = getCategoryInfo(opt.category);

  // Build trip date range for mini calendar
  const tripDates = [];
  if (tripStart && tripEnd) {
    const start = new Date(tripStart + "T00:00:00");
    const end = new Date(tripEnd + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      tripDates.push(new Date(d));
    }
  }

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
          </div>
          <h3 className="text-xl font-bold text-slate-800">{opt.name}</h3>
        </div>
        <div className="text-right">
          {opt.price_per_night && (
            <div className="text-2xl font-bold text-slate-800">{formatPrice(opt.price_per_night, opt.currency)}</div>
          )}
          {opt.price_per_night && (
            <div className="text-xs text-slate-400">per night</div>
          )}
          {opt.total_price && (
            <div className="text-sm text-slate-600 mt-1">{formatPrice(opt.total_price, opt.currency)} total</div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4 text-sm text-slate-600 flex-wrap">
        {opt.room_type && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Room Type</span><div className="font-medium">{opt.room_type}</div></div>
        )}
        {(opt.bedrooms || opt.bathrooms) && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wide">Beds & Bath</span>
            <div className="font-medium">
              {opt.bedrooms && <span>{opt.bedrooms} bed{opt.bedrooms > 1 ? 's' : ''}</span>}
              {opt.bedrooms && opt.bathrooms && <span> · </span>}
              {opt.bathrooms && <span>{opt.bathrooms} bath{opt.bathrooms > 1 ? 's' : ''}</span>}
            </div>
          </div>
        )}
        {opt.max_guests && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Guests</span><div className="font-medium">{opt.max_guests} max</div></div>
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
        {opt.location_name && (
          <div><span className="text-xs text-slate-400 uppercase tracking-wide">Location</span><div className="font-medium">{opt.location_name}</div></div>
        )}
      </div>

      {/* Description */}
      {opt.description && (
        <div className="mb-4">
          <p className="text-sm text-slate-600 leading-relaxed">{opt.description}</p>
        </div>
      )}

      {/* Amenities */}
      {opt.amenities && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Amenities</div>
          <div className="flex flex-wrap gap-1">
            {opt.amenities.split(",").map((amenity, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                {amenity.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cancellation policy */}
      {opt.cancellation_policy && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Cancellation Policy</div>
          <p className="text-sm text-slate-600">{opt.cancellation_policy}</p>
        </div>
      )}

      {/* Check-in/out dates */}
      {(opt.check_in_date || opt.check_out_date) && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Dates</div>
          <div className="flex gap-4 text-sm">
            {opt.check_in_date && (
              <div>
                <span className="text-xs text-slate-500">Check-in</span>
                <div className="font-medium text-slate-800">{formatDateNice(opt.check_in_date)}</div>
              </div>
            )}
            {opt.check_out_date && (
              <div>
                <span className="text-xs text-slate-500">Check-out</span>
                <div className="font-medium text-slate-800">{formatDateNice(opt.check_out_date)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={onToggleSelected}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            opt.is_selected ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600 hover:bg-sky-50"
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
          <img src={opt.screenshot_url} alt="Accommodation screenshot" className="rounded-lg border border-slate-200 max-h-64 object-contain" />
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

// ─── ADD ACCOMMODATION MODAL ───
function AddAccommodationModal({ tripId, tripStart, tripEnd, onClose, onSave }) {
  const [name, setName] = useState("");
  const [pasteInput, setPasteInput] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
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
        const result = await extractAccommodationFromUrl(trimmed);
        setAiResult(result);
        setUrlStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.price_per_night && !pricePerNight) setPricePerNight(String(result.price_per_night));
        if (result.total_price && !totalPrice) setTotalPrice(String(result.total_price));
        if (result.check_in_date && !checkInDate) setCheckInDate(result.check_in_date);
        if (result.check_out_date && !checkOutDate) setCheckOutDate(result.check_out_date);
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
        const result = await extractAccommodationFromImage(dataUrl);
        setAiResult(result);
        setAiStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.price_per_night && !pricePerNight) setPricePerNight(String(result.price_per_night));
        if (result.total_price && !totalPrice) setTotalPrice(String(result.total_price));
        if (result.check_in_date && !checkInDate) setCheckInDate(result.check_in_date);
        if (result.check_out_date && !checkOutDate) setCheckOutDate(result.check_out_date);
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
    if (!name.trim()) { alert("Please enter an accommodation name"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Merge AI result with manual inputs
      const ai = aiResult || {};
      const { error } = await supabase.from("accommodation_options").insert({
        trip_id: tripId,
        user_id: user.id,
        name: name.trim(),
        description: ai.description || null,
        category: ai.category || "hotel",
        price_per_night: pricePerNight ? parseFloat(pricePerNight) : ai.price_per_night || null,
        total_price: totalPrice ? parseFloat(totalPrice) : ai.total_price || null,
        currency: ai.currency || "USD",
        check_in_date: checkInDate || ai.check_in_date || null,
        check_out_date: checkOutDate || ai.check_out_date || null,
        room_type: ai.room_type || null,
        bedrooms: ai.bedrooms || null,
        bathrooms: ai.bathrooms || null,
        max_guests: ai.max_guests || null,
        rating: ai.rating || null,
        review_count: ai.review_count || null,
        amenities: ai.amenities || null,
        cancellation_policy: ai.cancellation_policy || null,
        location_name: ai.location_name || null,
        address: ai.address || null,
        distance_info: ai.distance_info || null,
        provider: ai.provider || null,
        source_url: pasteInput.trim().startsWith("http") ? pasteInput.trim() : null,
        screenshot_url: screenshot || null,
        notes: notes.trim() || null,
        sort_order: 0,
      });

      if (error) throw error;
      onSave();
    } catch (err) {
      console.error("Error saving accommodation:", err);
      alert("Error saving. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-sky-100 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">Add Accommodation Option</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Accommodation Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Angsana Laguna Phuket Resort"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
          </div>

          {/* Paste URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Paste URL</label>
            <p className="text-xs text-slate-400 mb-1">Paste a Booking.com, Airbnb, or any accommodation URL</p>
            <textarea value={pasteInput} onChange={(e) => handlePasteChange(e.target.value)} rows={2}
              placeholder="https://www.booking.com/hotel/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono" />
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
              <div className="mt-2 px-3 py-2 bg-sky-50 rounded-lg text-xs text-sky-700">
                Found: {aiResult.name}{aiResult.price_per_night ? ` · ${formatPrice(aiResult.price_per_night, aiResult.currency)}/night` : ""}
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
                  dragOver ? "border-sky-400 bg-sky-50" : "border-slate-300 hover:border-sky-400"
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
                  <div className="mt-2 px-3 py-2 bg-sky-50 rounded-lg text-xs text-sky-700">
                    Found: {aiResult.name}{aiResult.price_per_night ? ` · ${formatPrice(aiResult.price_per_night, aiResult.currency)}/night` : ""}
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

          {/* Price per night */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Price per Night</label>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">$</span>
              <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)}
                placeholder={aiResult?.price_per_night ? String(aiResult.price_per_night) : "0.00"} step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
            </div>
          </div>

          {/* Total price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Price (optional)</label>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">$</span>
              <input type="number" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)}
                placeholder={aiResult?.total_price ? String(aiResult.total_price) : "0.00"} step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
            </div>
          </div>

          {/* Check-in date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Date</label>
            <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
          </div>

          {/* Check-out date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Check-out Date</label>
            <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Any notes about this accommodation..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm" />
          </div>

          {/* AI data preview */}
          {aiResult && (aiResult.description || aiResult.location_name || aiResult.bedrooms) && (
            <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
              <span className="font-medium text-slate-500">AI extracted: </span>
              {aiResult.category && <span className="capitalize">{aiResult.category}</span>}
              {aiResult.bedrooms && <span> · {aiResult.bedrooms} bed{aiResult.bedrooms > 1 ? 's' : ''}</span>}
              {aiResult.location_name && <span> · {aiResult.location_name}</span>}
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
              className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Option"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
