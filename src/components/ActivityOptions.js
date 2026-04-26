"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getCityName } from "@/lib/flightParser";
import InlineConfirm from "@/components/InlineConfirm";
import { formatTime12h } from "@/components/TimeSelectPopup";
import SourceThumbnails from "@/components/SourceThumbnails";
import MiniWeekCalendar from "@/components/MiniWeekCalendar";
import EditableNotes from "@/components/EditableNotes";
import { LABEL } from "@/lib/detailPaneStyles";
import BookedBadge from "@/components/BookedBadge";

// ── Category metadata ──
const CATEGORIES = {
  experience: { label: "Experience", color: "bg-purple-100 text-purple-700", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
  tour: { label: "Tour", color: "bg-blue-100 text-blue-700", icon: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" },
  attraction: { label: "Attraction", color: "bg-amber-100 text-amber-700", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  show: { label: "Show", color: "bg-pink-100 text-pink-700", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
  day_trip: { label: "Day Trip", color: "bg-green-100 text-green-700", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
  outdoor: { label: "Outdoor", color: "bg-teal-100 text-teal-700", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  class: { label: "Class", color: "bg-indigo-100 text-indigo-700", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  other: { label: "Other", color: "bg-slate-100 text-slate-700", icon: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" },
};

function getCategoryInfo(cat) {
  return CATEGORIES[cat] || CATEGORIES.other;
}

function formatDuration(mins) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatPrice(price, currency) {
  if (!price && price !== 0) return "";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${sym}${Number(price).toFixed(2)}`;
}

// ── Send image to Gemini for activity extraction ──
async function extractActivityFromImage(imageDataUrl) {
  const mimeMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
  const response = await fetch("/api/parse-activity", {
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

// ── Send URL to Gemini for activity extraction ──
async function extractActivityFromUrl(url) {
  const response = await fetch("/api/parse-activity", {
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
export default function ActivityOptions({ tripId, tripStart, tripEnd, onActivityOptionsChange, itinerarySelections, activeItineraryId, onToggleSelection }) {
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOptions = useCallback(async () => {
    const { data } = await supabase
      .from("activity_options")
      .select("*")
      .eq("trip_id", tripId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    const opts = data || [];
    setOptions(opts);
    if (onActivityOptionsChange) onActivityOptionsChange(opts);
    if (opts.length > 0 && !selectedId) setSelectedId(opts[0].id);
    setLoading(false);
  }, [tripId, selectedId, onActivityOptionsChange]);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const selected = options.find((o) => o.id === selectedId);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function handleDelete(id) {
    setConfirmDeleteId(null);
    await supabase.from("activity_options").delete().eq("id", id);
    if (selectedId === id) setSelectedId(options.find((o) => o.id !== id)?.id || null);
    loadOptions();
  }

  async function handleToggleBooked(id) {
    const opt = options.find((o) => o.id === id);
    if (!opt) return;
    const newBooked = !opt.booked;
    await supabase.from("activity_options").update({ booked: newBooked }).eq("id", id);
    // When booking is turned ON, ensure the option is in the itinerary too.
    if (newBooked && onToggleSelection && activeItineraryId) {
      const isInItinerary = (itinerarySelections || []).some(
        (s) => s.option_type === "activity" && s.option_id === id
      );
      if (!isInItinerary) onToggleSelection("activity", id);
    }
    loadOptions();
  }

  async function handleToggleSelected(id) {
    if (onToggleSelection && activeItineraryId) {
      onToggleSelection("activity", id);
    } else {
      const opt = options.find((o) => o.id === id);
      if (!opt) return;
      await supabase.from("activity_options").update({ is_selected: !opt.is_selected }).eq("id", id);
      loadOptions();
    }
  }

  async function handleSchedule(id, date) {
    await supabase.from("activity_options").update({ scheduled_date: date || null }).eq("id", id);
    // Auto-add to itinerary when a date is set, auto-remove when cleared
    if (onToggleSelection && activeItineraryId) {
      const isInItinerary = (itinerarySelections || []).some(s => s.option_type === "activity" && s.option_id === id);
      if (date && !isInItinerary) {
        onToggleSelection("activity", id);
      } else if (!date && isInItinerary) {
        onToggleSelection("activity", id);
      }
    }
    loadOptions();
  }

  async function handleTimeChange(id, time, endTime) {
    await supabase.from("activity_options").update({ start_time: time || null, end_time: endTime || null }).eq("id", id);
    loadOptions();
  }

  async function handleNotesChange(id, notes) {
    await supabase.from("activity_options").update({ notes: notes }).eq("id", id);
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
              <OptionTab key={opt.id} opt={{...opt, is_selected: (itinerarySelections || []).some(s => s.option_type === "activity" && s.option_id === opt.id)}} index={i} isSelected={selectedId === opt.id}
                onClick={() => setSelectedId(opt.id)} onDelete={() => setConfirmDeleteId(opt.id)}
                confirmDelete={confirmDeleteId === opt.id} onConfirmDelete={() => handleDelete(opt.id)} onCancelDelete={() => setConfirmDeleteId(null)} />
            ))}
            <button onClick={() => setShowModal(true)}
              className="w-full py-3 border-2 border-dashed border-yellow-300 rounded-xl text-yellow-600 text-sm font-medium hover:bg-yellow-50 transition-colors">
              + Add Option
            </button>
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 bg-white rounded-xl border border-sky-100 shadow-sm p-5 min-h-[200px]">
            {selected ? (
              <OptionDetail opt={{...selected, is_selected: (itinerarySelections || []).some(s => s.option_type === "activity" && s.option_id === selected.id)}} tripStart={tripStart} tripEnd={tripEnd}
                onToggleSelected={() => handleToggleSelected(selected.id)}
                onToggleBooked={() => handleToggleBooked(selected.id)}
                onSchedule={(date) => handleSchedule(selected.id, date)}
                onTimeChange={(time, endTime) => handleTimeChange(selected.id, time, endTime)}
                onNotesChange={(notes) => handleNotesChange(selected.id, notes)} />
            ) : (
              <p className="text-slate-400 text-sm italic">Select an activity to view details</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {options.length === 0 && !showModal && (
        <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-8 text-center">
          <svg className="w-10 h-10 text-yellow-300 mx-auto mb-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.147 0l4.084-1.69A1.5 1.5 0 0 0 18 14.75V3.873a1.5 1.5 0 0 0-2.074-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
          </svg>
          <p className="text-slate-500 text-sm mb-1">No activity options yet</p>
          <p className="text-slate-400 text-xs mb-4">Add tours, experiences, and attractions to compare</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700">
            + Add Activity Option
          </button>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <AddActivityModal tripId={tripId} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); loadOptions(); }} />
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
      className={`relative p-3 pr-8 rounded-xl cursor-pointer transition-all border-2 ${
        isSelected ? "border-yellow-500 bg-yellow-50 shadow-sm" : "border-slate-200 bg-white hover:border-yellow-300"
      }`}
    >
      {/* Booked indicator — takes precedence over plain itinerary check */}
      {opt.booked && (
        <div className="absolute top-2 right-2"><BookedBadge variant="icon" /></div>
      )}
      {/* Itinerary check icon — upper right (hidden when booked, since booked implies in-itinerary) */}
      {!opt.booked && opt.is_selected && (
        <svg className="absolute top-2 right-2 w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
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
      <InlineConfirm open={confirmDelete} message="Delete this activity?" onConfirm={onConfirmDelete} onCancel={onCancelDelete} />
      <div className="font-semibold text-sm text-slate-800 line-clamp-2">{opt.name || "Untitled"}</div>
      {opt.location_name && <div className="text-xs text-slate-500 truncate">{opt.location_name}</div>}
    </div>
  );
}

// ─── OPTION DETAIL ───
function OptionDetail({ opt, tripStart, tripEnd, onToggleSelected, onToggleBooked, onSchedule, onTimeChange, onNotesChange }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const isScheduled = !!opt.scheduled_date;
  return (
    <div className="flex gap-4">
      {/* Itinerary buttons — Add + Booked, stacked in fixed left column */}
      <div className="flex flex-col items-center flex-shrink-0 w-9 pt-0.5">
        <button
          type="button"
          onClick={() => { if (isScheduled) { onSchedule(null); setShowCalendar(false); } else { setShowCalendar(!showCalendar); } }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            isScheduled ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-slate-100 text-slate-400 hover:bg-yellow-50 hover:text-yellow-600"
          }`}
          title={isScheduled ? "Remove from itinerary" : "Add to itinerary"}
        >
          {isScheduled ? (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          )}
        </button>
        <span className={`text-[9px] font-semibold uppercase tracking-wide mt-0.5 ${isScheduled ? "text-yellow-600" : "text-slate-400"}`}>
          {isScheduled ? "Added" : "Add"}
        </span>
        <button
          type="button"
          onClick={onToggleBooked}
          className={`mt-3 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            opt.booked ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
          }`}
          title={opt.booked ? "Mark as not booked" : "Mark as booked"}
        >
          {opt.booked ? (
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          )}
        </button>
        <span className={`text-[9px] font-semibold uppercase tracking-wide mt-0.5 ${opt.booked ? "text-emerald-600" : "text-slate-400"}`}>
          {opt.booked ? "Booked" : "Book"}
        </span>
      </div>

      {/* Detail content — aligned with title */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{opt.name}</h3>
            {opt.provider && <span className="text-xs text-slate-400">via {opt.provider}</span>}
          </div>
          {opt.price != null && opt.price > 0 && (
            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-2xl font-bold text-slate-800">
                {formatPrice(opt.price, opt.currency)}
              </div>
              <div className="text-xs text-slate-400">{opt.price_per === "group" ? "per group" : "per person"}</div>
            </div>
          )}
        </div>

        {/* Mini week calendar — visible when scheduled or toggled open */}
        {(isScheduled || showCalendar) && (
          <MiniWeekCalendar
            tripStart={tripStart}
            tripEnd={tripEnd}
            scheduledDate={opt.scheduled_date}
            startTime={opt.start_time}
            endTime={opt.end_time}
            accentColor="yellow"
            onSchedule={(date) => { onSchedule(date); if (!date) setShowCalendar(false); }}
            onTimeChange={onTimeChange}
          />
        )}

        {/* Stats row */}
        <div className="flex gap-4 mb-4 text-sm text-slate-600 flex-wrap">
          {opt.category && (
            <div><span className={LABEL}>Category</span><div className="font-medium capitalize">{getCategoryInfo(opt.category).label}</div></div>
          )}
          {opt.duration_minutes > 0 && (
            <div><span className={LABEL}>Duration</span><div className="font-medium">{formatDuration(opt.duration_minutes)}</div></div>
          )}
          {opt.location_name && (
            <div><span className={LABEL}>Location</span><div className="font-medium">{opt.location_name}</div></div>
          )}
          {opt.address && (
            <div><span className={LABEL}>Address</span><div className="font-medium">{opt.address}</div></div>
          )}
        </div>

        {/* Description */}
        {opt.description && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 leading-relaxed">{opt.description}</p>
          </div>
        )}

        {/* Notes */}
        <EditableNotes notes={opt.notes} onSave={onNotesChange} />

        {/* Source thumbnails */}
        <SourceThumbnails
          screenshotUrl={opt.screenshot_url}
          sourceUrl={opt.source_url}
          manualData={[
            { label: "Category", value: opt.category ? getCategoryInfo(opt.category).label : "" },
            { label: "Duration", value: opt.duration_minutes ? formatDuration(opt.duration_minutes) : "" },
            { label: "Price", value: opt.price ? formatPrice(opt.price, opt.currency) : "" },
            { label: "Location", value: opt.location_name || "" },
          ]}
          accentColor="yellow"
        />
      </div>
    </div>
  );
}

// ─── ADD ACTIVITY MODAL ───
function AddActivityModal({ tripId, onClose, onSave }) {
  const [name, setName] = useState("");
  const [pasteInput, setPasteInput] = useState("");
  const [price, setPrice] = useState("");
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
        const result = await extractActivityFromUrl(trimmed);
        setAiResult(result);
        setUrlStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.price && !price) setPrice(String(result.price));
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
        const result = await extractActivityFromImage(dataUrl);
        setAiResult(result);
        setAiStatus("done");
        if (result.name && !name) setName(result.name);
        if (result.price && !price) setPrice(String(result.price));
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
    if (!name.trim()) { alert("Please enter an activity name"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Merge AI result with manual inputs
      const ai = aiResult || {};
      const { error } = await supabase.from("activity_options").insert({
        trip_id: tripId,
        user_id: user.id,
        name: name.trim(),
        description: ai.description || null,
        category: ai.category || "experience",
        price: price ? parseFloat(price) : ai.price || null,
        currency: ai.currency || "USD",
        price_per: ai.price_per || "person",
        duration_minutes: ai.duration_minutes || null,
        start_time: ai.start_time || null,
        location_name: ai.location_name || null,
        address: ai.address || null,
        provider: ai.provider || ai.source || null,
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
      console.error("Error saving activity:", err);
      alert("Error saving. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">Add Activity Option</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Activity Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Phi Phi Island Snorkeling Tour"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
          </div>

          {/* Unified paste / screenshot field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Paste URL or Screenshot</label>
            <p className="text-xs text-slate-400 mb-2">Paste a Viator, GetYourGuide, or any activity URL. Or paste / drop a screenshot.</p>
            {!screenshot ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg transition-colors ${
                  dragOver ? "border-yellow-400 bg-yellow-50" : "border-slate-300"
                }`}
              >
                <textarea
                  value={pasteInput}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  rows={2}
                  autoFocus
                  placeholder={`https://www.viator.com/tours/... — or paste an image`}
                  className="w-full px-3 py-2 bg-transparent border-0 rounded-t-lg outline-none focus:ring-0 text-sm font-mono resize-none"
                />
                <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200/60 bg-slate-50/50 rounded-b-lg">
                  <span className="text-[10px] text-slate-400">Drop image, paste (Ctrl+V), or upload →</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-semibold text-yellow-600 hover:text-yellow-700"
                  >
                    + Upload image
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files[0])} />
                </div>
              </div>
            ) : (
              <div className="relative">
                <img src={screenshot} alt="Screenshot" className="rounded-lg border border-slate-200 max-h-48 object-contain w-full" />
                <button onClick={() => { setScreenshot(null); setAiStatus(null); setAiResult(null); }}
                  className="absolute top-2 right-2 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-slate-500 hover:text-red-500 shadow">×</button>
              </div>
            )}
            {/* Combined status messages */}
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
              <div className="mt-2 px-3 py-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
                Found: {aiResult.name}
              </div>
            )}
            {urlStatus?.startsWith("error") && (
              <div className="mt-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700">
                {urlStatus.includes(":") ? urlStatus.split(":").slice(1).join(":") : "Couldn't analyze URL. You can still enter details manually."}
              </div>
            )}
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
              <div className="mt-2 px-3 py-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
                Found: {aiResult.name}
              </div>
            )}
            {aiStatus?.startsWith("error") && (
              <div className="mt-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-700">
                {aiStatus.includes(":") ? aiStatus.split(":").slice(1).join(":") : "Couldn't analyze screenshot. You can still save it and enter details manually."}
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Any notes about this option..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
          </div>

          {/* AI data preview */}
          {aiResult && (aiResult.description || aiResult.location_name || aiResult.duration_minutes) && (
            <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
              <span className="font-medium text-slate-500">AI extracted: </span>
              {aiResult.category && <span className="capitalize">{aiResult.category}</span>}
              {aiResult.duration_minutes && <span> · {formatDuration(aiResult.duration_minutes)}</span>}
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
              className="flex-1 py-2.5 bg-yellow-600 text-white rounded-xl text-sm font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Save Option"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
