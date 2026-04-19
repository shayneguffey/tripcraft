"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import InlineConfirm from "@/components/InlineConfirm";
import SourceThumbnails from "@/components/SourceThumbnails";
import MiniWeekCalendar from "@/components/MiniWeekCalendar";
import EditableNotes from "@/components/EditableNotes";
import { LABEL, LABEL_MB1 } from "@/lib/detailPaneStyles";

// ── Cuisine type metadata ──
const CUISINES = {
  thai: { label: "Thai", color: "bg-orange-100 text-orange-700" },
  italian: { label: "Italian", color: "bg-red-100 text-red-700" },
  seafood: { label: "Seafood", color: "bg-blue-100 text-blue-700" },
  japanese: { label: "Japanese", color: "bg-pink-100 text-pink-700" },
  mexican: { label: "Mexican", color: "bg-amber-100 text-amber-700" },
  cafe: { label: "Cafe", color: "bg-amber-100 text-amber-700" },
  street_food: { label: "Street Food", color: "bg-green-100 text-green-700" },
  other: { label: "Other", color: "bg-slate-100 text-slate-700" },
};

// ── Meal type metadata ──
const MEAL_TYPES = {
  breakfast: { label: "Breakfast", emoji: "🌅", color: "bg-yellow-100 text-yellow-700" },
  lunch: { label: "Lunch", emoji: "🍽️", color: "bg-lime-100 text-lime-700" },
  dinner: { label: "Dinner", emoji: "🌙", color: "bg-indigo-100 text-indigo-700" },
  snack: { label: "Snack", emoji: "🍪", color: "bg-orange-100 text-orange-700" },
  dessert: { label: "Dessert", emoji: "🍰", color: "bg-pink-100 text-pink-700" },
  drinks: { label: "Drinks", emoji: "🍷", color: "bg-purple-100 text-purple-700" },
};

function getCuisineInfo(cuisine) {
  const normalized = cuisine?.toLowerCase().replace(/\s+/g, "_") || "other";
  return CUISINES[normalized] || CUISINES.other;
}

function getMealTypeInfo(mealType) {
  return MEAL_TYPES[mealType] || MEAL_TYPES.lunch;
}

function formatPriceRange(priceRange) {
  if (!priceRange) return "";
  return priceRange;
}

function formatPrice(price, currency) {
  if (!price && price !== 0) return "";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${sym}${Number(price).toFixed(2)}`;
}

// ── Send image to Gemini for dining extraction ──
async function extractDiningFromImage(imageDataUrl) {
  const mimeMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const response = await fetch("/api/parse-dining", {
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

// ── Send URL to Gemini for dining extraction ──
async function extractDiningFromUrl(url) {
  const response = await fetch("/api/parse-dining", {
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
export default function DiningOptions({ tripId, tripStart, tripEnd, onDiningOptionsChange, itinerarySelections, activeItineraryId, onToggleSelection }) {
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOptions = useCallback(async () => {
    const { data } = await supabase
      .from("dining_options")
      .select("*")
      .eq("trip_id", tripId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    const opts = data || [];
    setOptions(opts);
    if (onDiningOptionsChange) onDiningOptionsChange(opts);
    if (opts.length > 0 && !selectedId) setSelectedId(opts[0].id);
    setLoading(false);
  }, [tripId, selectedId, onDiningOptionsChange]);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const selected = options.find((o) => o.id === selectedId);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function handleDelete(id) {
    setConfirmDeleteId(null);
    await supabase.from("dining_options").delete().eq("id", id);
    if (selectedId === id) setSelectedId(options.find((o) => o.id !== id)?.id || null);
    loadOptions();
  }

  async function handleToggleSelected(id) {
    if (onToggleSelection && activeItineraryId) {
      onToggleSelection("dining", id);
    } else {
      const opt = options.find((o) => o.id === id);
      if (!opt) return;
      await supabase.from("dining_options").update({ is_selected: !opt.is_selected }).eq("id", id);
      loadOptions();
    }
  }

  async function handleSchedule(id, date) {
    await supabase.from("dining_options").update({ scheduled_date: date || null }).eq("id", id);
    // Auto-add to itinerary when a date is set, auto-remove when cleared
    if (onToggleSelection && activeItineraryId) {
      const isInItinerary = (itinerarySelections || []).some(s => s.option_type === "dining" && s.option_id === id);
      if (date && !isInItinerary) {
        onToggleSelection("dining", id);
      } else if (!date && isInItinerary) {
        onToggleSelection("dining", id);
      }
    }
    loadOptions();
  }

  async function handleTimeChange(id, time, endTime) {
    await supabase.from("dining_options").update({ start_time: time || null, end_time: endTime || null }).eq("id", id);
    loadOptions();
  }

  async function handleNotesChange(id, notes) {
    await supabase.from("dining_options").update({ notes: notes }).eq("id", id);
    loadOptions();
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
              <OptionTab key={opt.id} opt={{...opt, is_selected: (itinerarySelections || []).some(s => s.option_type === "dining" && s.option_id === opt.id)}} index={i} isSelected={selectedId === opt.id}
                onClick={() => setSelectedId(opt.id)} onDelete={() => setConfirmDeleteId(opt.id)}
                confirmDelete={confirmDeleteId === opt.id} onConfirmDelete={() => handleDelete(opt.id)} onCancelDelete={() => setConfirmDeleteId(null)} />
            ))}
            <button onClick={() => setShowModal(true)}
              className="w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors">
              + Add Option
            </button>
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 bg-white rounded-xl border border-orange-100 shadow-sm p-5 min-h-[200px]">
            {selected ? (
              <OptionDetail opt={{...selected, is_selected: (itinerarySelections || []).some(s => s.option_type === "dining" && s.option_id === selected.id)}} tripStart={tripStart} tripEnd={tripEnd}
                onToggleSelected={() => handleToggleSelected(selected.id)}
                onSchedule={(date) => handleSchedule(selected.id, date)}
                onTimeChange={(time, endTime) => handleTimeChange(selected.id, time, endTime)}
                onNotesChange={(notes) => handleNotesChange(selected.id, notes)} />
            ) : (
              <p className="text-slate-400 text-sm italic">Select a dining option to view details</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {options.length === 0 && !showModal && (
        <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-8 text-center">
          <svg className="w-10 h-10 text-orange-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <p className="text-slate-500 text-sm mb-1">No dining options yet</p>
          <p className="text-slate-400 text-xs mb-4">Add restaurants, cafes, and food recommendations to compare</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700">
            + Add Dining Option
          </button>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <AddDiningModal tripId={tripId} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); loadOptions(); }} />
      )}
    </div>
  );
}

// ─── OPTION TAB ───
function OptionTab({ opt, index, isSelected, onClick, onDelete, confirmDelete, onConfirmDelete, onCancelDelete }) {
  const [hovered, setHovered] = useState(false);
  const cuisine = getCuisineInfo(opt.cuisine_type);
  const mealType = getMealTypeInfo(opt.meal_type);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-3 pr-8 rounded-xl cursor-pointer transition-all border-2 ${
        isSelected ? "border-orange-500 bg-orange-50 shadow-sm" : "border-slate-200 bg-white hover:border-orange-300"
      }`}
    >
      {/* Itinerary check icon — upper right */}
      {opt.is_selected && (
        <svg className="absolute top-2 right-2 w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}

      {/* Delete button — bottom right */}
      {hovered && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute bottom-2 right-2 text-slate-300 hover:text-red-500 transition-colors" title="Delete">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      <InlineConfirm open={confirmDelete} message="Delete this dining option?" onConfirm={onConfirmDelete} onCancel={onCancelDelete} />
      <div className="font-semibold text-sm text-slate-800 line-clamp-2">{opt.name || "Untitled"}</div>
      {opt.address && <div className="text-xs text-slate-500 truncate">{opt.address}</div>}
    </div>
  );
}

// ─── OPTION DETAIL ───
function OptionDetail({ opt, tripStart, tripEnd, onToggleSelected, onSchedule, onTimeChange, onNotesChange }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">{opt.name}</h3>
        {(opt.avg_meal_cost || opt.price_range) && (
          <div className="text-right flex-shrink-0 ml-4">
            {opt.avg_meal_cost ? (
              <>
                <div className="text-2xl font-bold text-slate-800">
                  {formatPrice(opt.avg_meal_cost, opt.currency)}
                </div>
                <div className="text-xs text-slate-400">avg per meal</div>
              </>
            ) : (
              <div className="text-2xl font-bold text-slate-800">{opt.price_range}</div>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4 text-sm text-slate-600 flex-wrap">
        {opt.address && (
          <div><span className={LABEL}>Address</span><div className="font-medium">{opt.address}</div></div>
        )}
        {opt.hours && (
          <div><span className={LABEL}>Hours</span><div className="font-medium">{opt.hours}</div></div>
        )}
      </div>

      {/* Description */}
      {opt.description && (
        <div className="mb-4">
          <p className="text-sm text-slate-600 leading-relaxed">{opt.description}</p>
        </div>
      )}

      {/* Known for */}
      {opt.known_for && (
        <div className="mb-4">
          <div className={LABEL_MB1}>Known for</div>
          <p className="text-sm text-slate-700">{opt.known_for}</p>
        </div>
      )}

      {/* Dietary options */}
      {opt.dietary_options && (
        <div className="mb-4">
          <div className={LABEL_MB1}>Dietary options</div>
          <div className="flex flex-wrap gap-1">
            {opt.dietary_options.split(",").map((option, i) => (
              <span key={i} className="px-2 py-1 rounded text-xs bg-amber-50 text-amber-700 font-medium">
                {option.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reservation indicator */}
      {opt.reservation_required && (
        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
          ⚠️ Reservation required
        </div>
      )}

      {/* Add to itinerary — mini week calendar */}
      <MiniWeekCalendar
        tripStart={tripStart}
        tripEnd={tripEnd}
        scheduledDate={opt.scheduled_date}
        startTime={opt.start_time}
        endTime={opt.end_time}
        accentColor="orange"
        onSchedule={onSchedule}
        onTimeChange={onTimeChange}
      />

      {/* Notes */}
      <EditableNotes notes={opt.notes} onSave={onNotesChange} />

      {/* Source thumbnails */}
      <SourceThumbnails
        screenshotUrl={opt.screenshot_url}
        sourceUrl={opt.source_url}
        manualData={[
          { label: "Cuisine", value: opt.cuisine_type || "" },
          { label: "Meal Type", value: opt.meal_type || "" },
          { label: "Price Range", value: opt.price_range || "" },
          { label: "Hours", value: opt.hours || "" },
        ]}
        accentColor="orange"
      />
    </div>
  );
}

// ─── ADD DINING MODAL ───
function AddDiningModal({ tripId, onClose, onSave }) {
  const [name, setName] = useState("");
  const [pasteInput, setPasteInput] = useState("");
  const [cuisineType, setCuisineType] = useState("Other");
  const [priceRange, setPriceRange] = useState("");
  const [mealType, setMealType] = useState("lunch");
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
        const result = await extractDiningFromUrl(trimmed);
        setAiResult(result);
        setUrlStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.cuisine_type && !cuisineType) setCuisineType(result.cuisine_type);
        if (result.price_range && !priceRange) setPriceRange(result.price_range);
        if (result.meal_type && !mealType) setMealType(result.meal_type);
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
        const result = await extractDiningFromImage(dataUrl);
        setAiResult(result);
        setAiStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.cuisine_type && !cuisineType) setCuisineType(result.cuisine_type);
        if (result.price_range && !priceRange) setPriceRange(result.price_range);
        if (result.meal_type && !mealType) setMealType(result.meal_type);
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
    if (!name.trim()) { alert("Please enter a dining venue name"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Merge AI result with manual inputs
      const ai = aiResult || {};
      const { error } = await supabase.from("dining_options").insert({
        trip_id: tripId,
        user_id: user.id,
        name: name.trim(),
        description: ai.description || null,
        cuisine_type: cuisineType || ai.cuisine_type || "Other",
        price_range: priceRange || ai.price_range || null,
        avg_meal_cost: ai.avg_meal_cost || null,
        currency: ai.currency || "USD",
        location_name: ai.location_name || null,
        address: ai.address || null,
        hours: ai.hours || null,
        rating: ai.rating || null,
        review_count: ai.review_count || null,
        known_for: ai.known_for || null,
        reservation_required: ai.reservation_required || false,
        dietary_options: ai.dietary_options || null,
        provider: ai.provider || null,
        meal_type: mealType || ai.meal_type || "lunch",
        source_url: pasteInput.trim().startsWith("http") ? pasteInput.trim() : null,
        screenshot_url: screenshot || null,
        notes: notes.trim() || null,
        sort_order: 0,
      });

      if (error) throw error;
      onSave();
    } catch (err) {
      console.error("Error saving dining option:", err);
      alert("Error saving. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-orange-100 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">Add Dining Option</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Restaurant/Venue Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Blue Elephant Thai Restaurant"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
          </div>

          {/* Paste URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Paste URL</label>
            <p className="text-xs text-slate-400 mb-1">Paste a Google Maps, Yelp, TripAdvisor, or restaurant website URL</p>
            <textarea value={pasteInput} onChange={(e) => handlePasteChange(e.target.value)} rows={2}
              placeholder="https://www.google.com/maps/place/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono" />
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
              <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                Found: {aiResult.name}{aiResult.price_range ? ` · ${aiResult.price_range}` : ""}{aiResult.cuisine_type ? ` · ${aiResult.cuisine_type}` : ""}
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
                  dragOver ? "border-orange-400 bg-orange-50" : "border-slate-300 hover:border-orange-400"
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
                  <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                    Found: {aiResult.name}{aiResult.price_range ? ` · ${aiResult.price_range}` : ""}{aiResult.cuisine_type ? ` · ${aiResult.cuisine_type}` : ""}{aiResult.rating ? ` · ★${aiResult.rating}` : ""}
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

          {/* Cuisine Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Cuisine Type</label>
            <select value={cuisineType} onChange={(e) => setCuisineType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
              <option value="Thai">Thai</option>
              <option value="Italian">Italian</option>
              <option value="Seafood">Seafood</option>
              <option value="Japanese">Japanese</option>
              <option value="Mexican">Mexican</option>
              <option value="Cafe">Cafe</option>
              <option value="Street Food">Street Food</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Price Range</label>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
              <option value="">Not set</option>
              <option value="$">$ (Budget)</option>
              <option value="$$">$$ (Moderate)</option>
              <option value="$$$">$$$ (Upscale)</option>
              <option value="$$$$">$$$$ (Fine Dining)</option>
            </select>
          </div>

          {/* Meal Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Meal Type</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
              <option value="breakfast">🌅 Breakfast</option>
              <option value="lunch">🍽️ Lunch</option>
              <option value="dinner">🌙 Dinner</option>
              <option value="snack">🍪 Snack</option>
              <option value="dessert">🍰 Dessert</option>
              <option value="drinks">🍷 Drinks</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Any notes about this venue (specialties, must-try dishes, etc.)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
          </div>

          {/* AI data preview */}
          {aiResult && (aiResult.description || aiResult.location_name || aiResult.hours) && (
            <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
              <span className="font-medium text-slate-500">AI extracted: </span>
              {aiResult.cuisine_type && <span className="capitalize">{aiResult.cuisine_type}</span>}
              {aiResult.price_range && <span> · {aiResult.price_range}</span>}
              {aiResult.location_name && <span> · {aiResult.location_name}</span>}
              {aiResult.hours && <span> · {aiResult.hours}</span>}
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
              className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Option"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
