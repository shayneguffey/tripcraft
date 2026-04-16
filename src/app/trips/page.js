"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlobeCanvas from "@/components/GlobeCanvas";
import MapPatternBg from "@/components/MapPatternBg";

// Format trip dates: "Jun 5-12, 2026" or "Jun 5 - Jul 3, 2026"
function formatTripDates(startStr, endStr) {
  if (!startStr || !endStr) return "";
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sM = m[start.getMonth()], eM = m[end.getMonth()];
  const sD = start.getDate(), eD = end.getDate();
  const sY = start.getFullYear(), eY = end.getFullYear();
  if (sY !== eY) return `${sM} ${sD}, ${sY} - ${eM} ${eD}, ${eY}`;
  if (start.getMonth() === end.getMonth()) return `${sM} ${sD}-${eD}, ${sY}`;
  return `${sM} ${sD} - ${eM} ${eD}, ${sY}`;
}

const GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-cyan-400 to-sky-600",
  "from-indigo-400 to-blue-700",
];

function getGradient(i) {
  return GRADIENTS[i % GRADIENTS.length];
}

const STATUS_OPTIONS = [
  { key: "planning", label: "Planning", activeBg: "rgba(74,150,90,0.45)", hoverBg: "rgba(74,150,90,0.25)" },
  { key: "traveled", label: "Traveled", activeBg: "rgba(60,120,180,0.45)", hoverBg: "rgba(60,120,180,0.25)" },
  { key: "wish", label: "Wish", activeBg: "rgba(210,170,50,0.45)", hoverBg: "rgba(210,170,50,0.25)" },
];

// ─── Date Range Calendar ──────────────────────────────────
function DateRangeCalendar({ startDate, endDate, onSelect }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(
    startDate ? new Date(startDate + "T00:00:00") : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selecting, setSelecting] = useState(startDate ? "end" : "start");

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function toDateStr(day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleDayClick(day) {
    const dateStr = toDateStr(day);
    if (selecting === "start") {
      onSelect(dateStr, endDate && dateStr <= endDate ? endDate : "");
      setSelecting("end");
    } else {
      if (startDate && dateStr < startDate) {
        onSelect(dateStr, "");
        setSelecting("end");
      } else {
        onSelect(startDate, dateStr);
        setSelecting("start");
      }
    }
  }

  function isInRange(day) {
    if (!startDate || !endDate) return false;
    const d = toDateStr(day);
    return d > startDate && d < endDate;
  }
  function isStart(day) { return startDate && toDateStr(day) === startDate; }
  function isEnd(day) { return endDate && toDateStr(day) === endDate; }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
        </button>
        <span className="text-sm font-semibold text-slate-700">{monthNames[month]} {year}</span>
        <button type="button" onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const s = isStart(day), e = isEnd(day), r = isInRange(day);
          return (
            <button key={day} type="button" onClick={() => handleDayClick(day)}
              className={`h-7 text-xs rounded-full flex items-center justify-center transition-colors
                ${s || e ? "bg-sky-600 text-white font-bold" : ""}
                ${r ? "bg-sky-100 text-sky-800" : ""}
                ${!s && !e && !r ? "text-slate-600 hover:bg-slate-100" : ""}
              `}>{day}</button>
          );
        })}
      </div>
      <div className="mt-2 text-[10px] text-slate-400 text-center">
        {selecting === "start" ? "Select start date" : "Select end date"}
        {startDate && <span className="ml-2 text-sky-600">{startDate}{endDate ? ` → ${endDate}` : ""}</span>}
      </div>
    </div>
  );
}

// ─── Inline Editable Text ─────────────────────────────────
function InlineEdit({ value, onSave, className, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);

  function startEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function save() {
    setEditing(false);
    if (draft.trim() !== (value || "")) {
      onSave(draft.trim());
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") { setDraft(value || ""); setEditing(false); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKey}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        className={`${className} bg-transparent border-b border-white/40 outline-none cursor-text`}
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      title="Click to edit"
      className={`${className} cursor-pointer hover:border-b hover:border-white/30 transition-all`}
    >
      {value || <span className="italic opacity-50">{placeholder}</span>}
    </span>
  );
}

// ─── Status Pill ──────────────────────────────────────────
function StatusPill({ label, isActive, activeBg, hoverBg, onClick }) {
  const [pillHover, setPillHover] = useState(false);

  const bg = isActive ? activeBg : pillHover ? hoverBg : "rgba(255,255,255,0.6)";
  const color = isActive || pillHover ? "rgba(80,65,50,0.95)" : "rgba(80,65,50,0.55)";
  const ring = isActive ? "1px solid rgba(80,65,50,0.35)" : "1px solid rgba(80,65,50,0.18)";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setPillHover(true)}
      onMouseLeave={() => setPillHover(false)}
      className="w-[4.2rem] py-[2px] rounded-full text-[9px] font-semibold text-center backdrop-blur-sm"
      style={{
        background: bg,
        color: color,
        outline: ring,
        transition: "background 0.2s, color 0.2s, outline 0.2s",
      }}
    >
      {label}
    </button>
  );
}

// ─── Trip Card ────────────────────────────────────────────
function TripCard({ trip, index, imageOptions, onCycleImage, onStatusChange, onArchive, onFieldUpdate }) {
  const [hovered, setHovered] = useState(false);
  const hasImage = !!trip.cover_image;
  const gradient = getGradient(index);
  const hasMultipleImages = imageOptions && imageOptions.images && imageOptions.images.length > 1;
  const status = trip.status || "planning";

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card body — clickable link */}
      <Link href={`/trips/${trip.id}`} className="block">
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] flex flex-col shadow-sm hover:shadow-xl transition-all duration-300">
          {/* Image area — top ~72% of card */}
          <div className="relative flex-1 overflow-hidden">
            {hasImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${trip.cover_image})`,
                  filter: hovered
                    ? "sepia(0.08) saturate(1.18) contrast(1.05) brightness(1.12) hue-rotate(-2deg)"
                    : "sepia(0.15) saturate(1.1) contrast(1.02) brightness(1.08) hue-rotate(-3deg)",
                  transition: "filter 0.4s, transform 0.5s",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }}
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
                style={{
                  transition: "transform 0.5s",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }}
              />
            )}

            {/* Short gradient fade into the info area */}
            <div
              className="absolute bottom-0 left-0 right-0 h-12"
              style={{ background: "linear-gradient(to top, #EEEEEE 0%, transparent 100%)" }}
            />

            {/* Shared badge */}
            {trip._isCollaborator && (
              <div className="absolute top-3 left-3 z-10">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-violet-700 font-medium backdrop-blur-sm">Shared</span>
              </div>
            )}
          </div>

          {/* Info area — fixed height, solid light background */}
          <div className="relative z-10 px-4 py-3 pr-[5.5rem]" style={{ backgroundColor: "#EEEEEE", height: 80, flexShrink: 0 }}>
            <InlineEdit
              value={trip.destination}
              onSave={(v) => onFieldUpdate(trip.id, "destination", v)}
              className="text-stone-500 text-xs block mb-0.5"
              placeholder="Add destination"
            />
            <InlineEdit
              value={trip.title}
              onSave={(v) => onFieldUpdate(trip.id, "title", v)}
              className="font-bold text-stone-800 text-base leading-tight block mb-0.5"
              placeholder="Trip name"
            />
            {trip.start_date && trip.end_date && (
              <p className="text-stone-400 text-xs">
                {formatTripDates(trip.start_date, trip.end_date)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Status pills — positioned over card, outside Link */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-[3px]">
        {STATUS_OPTIONS.map((opt) => (
          <StatusPill
            key={opt.key}
            label={opt.label}
            isActive={status === opt.key}
            activeBg={opt.activeBg}
            hoverBg={opt.hoverBg}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStatusChange(trip.id, opt.key); }}
          />
        ))}
        {!trip._isCollaborator && (
          <StatusPill
            label="Archive"
            isActive={false}
            activeBg="rgba(156,163,175,0.5)"
            hoverBg="rgba(156,163,175,0.35)"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onArchive(trip.id); }}
          />
        )}
      </div>

      {/* Image cycling arrows — hover only, outside Link */}
      {hasMultipleImages && hovered && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCycleImage(-1); }}
            className="absolute left-2 top-[35%] -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCycleImage(1); }}
            className="absolute right-2 top-[35%] -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAccount, setShowAccount] = useState(false);
  const [view, setView] = useState("cards"); // "cards" or "globe"
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newTravelers, setNewTravelers] = useState(1);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [imageOptions, setImageOptions] = useState({});
  // Two-layer crossfade for new card background
  const [layerA, setLayerA] = useState(0);   // image index for layer A
  const [layerB, setLayerB] = useState(1);   // image index for layer B
  const [showA, setShowA] = useState(true);   // which layer is visible
  const titleRef = useRef(null);
  const router = useRouter();

  // Rotating backgrounds for the new trip card
  const NEW_CARD_DESTINATIONS = [
    "Santorini Greece", "Kyoto Japan", "Machu Picchu Peru", "Paris France",
    "Bali Indonesia", "Iceland Northern Lights", "Amalfi Coast Italy",
    "Maldives Beach", "Swiss Alps", "Morocco Marrakech", "New Zealand Mountains",
    "Havana Cuba", "Patagonia Argentina", "Dubrovnik Croatia",
  ];
  const [newCardImages, setNewCardImages] = useState([]);

  useEffect(() => {
    // Fetch a batch of destination images for the new card background
    async function loadNewCardBg() {
      const dest = NEW_CARD_DESTINATIONS[Math.floor(Math.random() * NEW_CARD_DESTINATIONS.length)];
      try {
        const res = await fetch(`/api/cover-image?destination=${encodeURIComponent(dest)}&count=10`);
        const data = await res.json();
        if (data.images && data.images.length > 0) setNewCardImages(data.images);
      } catch (err) {}
    }
    loadNewCardBg();
  }, []);

  useEffect(() => {
    if (newCardImages.length <= 2) return;
    let nextIndex = showA ? layerB : layerA;
    const timer = setInterval(() => {
      // Pre-load the next image into the hidden layer, then swap
      const hiddenIndex = showA ? layerB : layerA;
      nextIndex = (Math.max(layerA, layerB) + 1) % newCardImages.length;
      if (showA) {
        setLayerB(nextIndex);
      } else {
        setLayerA(nextIndex);
      }
      // Small delay to let the hidden layer update its image before fading
      requestAnimationFrame(() => {
        setShowA((prev) => !prev);
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [newCardImages, showA, layerA, layerB]);

  useEffect(() => { loadDashboard(); }, [router]);

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUser(user);

    // Parallel fetch: own trips + collaborator IDs at the same time
    const [ownResult, collabResult] = await Promise.all([
      supabase.from("trips").select("*").eq("user_id", user.id)
        .eq("archived", false).order("updated_at", { ascending: false }),
      supabase.from("trip_collaborators").select("trip_id")
        .eq("user_id", user.id).eq("status", "accepted"),
    ]);

    const ownTrips = ownResult.data || [];
    const collabs = collabResult.data || [];

    let collabTrips = [];
    if (collabs.length > 0) {
      const ids = collabs.map((c) => c.trip_id);
      const { data: shared } = await supabase
        .from("trips").select("*").in("id", ids)
        .eq("archived", false)
        .order("updated_at", { ascending: false });
      collabTrips = (shared || []).map((t) => ({ ...t, _isCollaborator: true }));
    }

    // Merge and sort by most recently updated
    const all = [...ownTrips, ...collabTrips]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    setTrips(all);
    setLoading(false);

    // Fetch cover images in parallel (not sequentially)
    const imagePromises = all
      .filter((trip) => trip.destination)
      .map((trip) => fetchCoverImages(trip.id, trip.destination, !trip.cover_image));
    Promise.all(imagePromises);
  }

  async function fetchCoverImages(tripId, destination, saveFirst = false) {
    try {
      const res = await fetch(`/api/cover-image?destination=${encodeURIComponent(destination)}&count=10`);
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        if (saveFirst) {
          await supabase.from("trips").update({ cover_image: data.images[0] }).eq("id", tripId);
          setTrips((p) => p.map((t) => t.id === tripId ? { ...t, cover_image: data.images[0] } : t));
        }
        setImageOptions((p) => ({ ...p, [tripId]: { images: data.images, index: 0 } }));
      } else if (data.imageUrl) {
        await supabase.from("trips").update({ cover_image: data.imageUrl }).eq("id", tripId);
        setTrips((p) => p.map((t) => t.id === tripId ? { ...t, cover_image: data.imageUrl } : t));
      }
    } catch (err) {}
  }

  async function cycleImage(tripId, direction) {
    const opts = imageOptions[tripId];
    if (!opts || opts.images.length <= 1) return;
    let idx = opts.index + direction;
    if (idx < 0) idx = opts.images.length - 1;
    if (idx >= opts.images.length) idx = 0;
    const img = opts.images[idx];
    setImageOptions((p) => ({ ...p, [tripId]: { ...p[tripId], index: idx } }));
    setTrips((p) => p.map((t) => t.id === tripId ? { ...t, cover_image: img } : t));
    await supabase.from("trips").update({ cover_image: img }).eq("id", tripId);
  }

  async function handleStatusChange(tripId, status) {
    await supabase.from("trips").update({ status, updated_at: new Date().toISOString() }).eq("id", tripId);
    setTrips((p) => p.map((t) => t.id === tripId ? { ...t, status } : t));
  }

  async function handleArchiveTrip(tripId) {
    await supabase.from("trips").update({ archived: true }).eq("id", tripId);
    setTrips((p) => p.filter((t) => t.id !== tripId));
  }

  async function handleFieldUpdate(tripId, field, value) {
    const update = { [field]: value, updated_at: new Date().toISOString() };
    await supabase.from("trips").update(update).eq("id", tripId);
    setTrips((p) => p.map((t) => t.id === tripId ? { ...t, ...update } : t));
    // If destination changed, refresh cover image
    if (field === "destination" && value) {
      fetchCoverImages(tripId, value);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleCreateTrip(e) {
    e.preventDefault();
    if (!newTitle.trim()) { setCreateError("Trip name is required"); return; }
    setSaving(true);
    setCreateError(null);
    const { data, error } = await supabase.from("trips")
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        destination: newDest.trim() || null,
        start_date: newStart || null,
        end_date: newEnd || null,
        num_travelers: newTravelers,
        status: "planning",
      })
      .select().single();
    if (error) { setCreateError(error.message); setSaving(false); return; }
    setCreating(false);
    setNewTitle(""); setNewDest(""); setNewStart(""); setNewEnd(""); setNewTravelers(1);
    setShowCalendar(false); setSaving(false);
    router.push(`/trips/${data.id}`);
  }

  function cancelCreate() {
    setCreating(false);
    setNewTitle(""); setNewDest(""); setNewStart(""); setNewEnd(""); setNewTravelers(1);
    setCreateError(null); setShowCalendar(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">✈️</div>
          <p className="text-slate-500">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Parchment gradient base */}
      <div className="fixed inset-0" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.7) 0%, rgba(222,210,190,0.6) 50%, rgba(210,195,172,0.7) 100%)" }} />
      {/* Vintage map pattern — on top of gradient so it's visible */}
      <MapPatternBg tileSize={280} opacity={1} />

      {/* Globe layer — sits below the header so they don't overlap */}
      <div
        className="fixed left-0 right-0 bottom-0 transition-all duration-700 ease-in-out"
        style={{
          top: 200,
          zIndex: view === "globe" ? 10 : 1,
          filter: view === "globe" ? "none" : "saturate(0.2) brightness(0.9)",
          opacity: view === "globe" ? 1 : 0.4,
          pointerEvents: view === "globe" ? "auto" : "none",
        }}
      >
        <GlobeCanvas trips={trips} interactive={view === "globe"} />
      </div>

      {/* Globe tooltip */}
      <div
        id="globe-tooltip"
        className="fixed z-50 hidden pointer-events-none rounded-xl px-4 py-3 text-sm max-w-[200px]"
        style={{
          background: "rgba(30, 22, 12, 0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(212, 165, 116, 0.3)",
        }}
      ></div>

      {/* Header layer — always on top, always clickable */}
      <div className="relative z-20">
      <div className="max-w-6xl mx-auto px-6 pt-2 pb-0 flex items-center justify-between">
        {/* View toggle: cards / globe */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("cards")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors ${view === "cards" ? "bg-[#da7b4a]/25 text-[#b5552a]" : "bg-white/20 text-stone-500 hover:bg-[#da7b4a]/25 hover:text-[#b5552a]"}`}
            title="Card view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
              <path d="M2 2h5v5H2V2Zm7 0h5v5H9V2ZM2 9h5v5H2V9Zm7 0h5v5H9V9Z" />
            </svg>
          </button>
          <button
            onClick={() => setView("globe")}
            className={`w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors ${view === "globe" ? "bg-[#da7b4a]/25 text-[#b5552a]" : "bg-white/20 text-stone-500 hover:bg-[#da7b4a]/25 hover:text-[#b5552a]"}`}
            title="Globe view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5.404 3.196a5.518 5.518 0 0 0-2.66 3.054H4.84c.1-1.14.345-2.175.715-3.032l-.15-.022Zm-2.66 4.554a5.518 5.518 0 0 0 2.66 3.054l.15-.022c-.37-.857-.615-1.892-.715-3.032H2.744ZM8 13.5c-.753 0-1.596-1.348-1.834-3.75h3.668C9.596 12.152 8.753 13.5 8 13.5Zm1.834-5.25H6.166C6.404 5.848 7.247 4.5 8 4.5s1.596 1.348 1.834 3.75Zm.762 5.054a5.518 5.518 0 0 0 2.66-3.054H11.16c-.1 1.14-.345 2.175-.715 3.032l.15.022Zm2.66-4.554a5.518 5.518 0 0 0-2.66-3.054l-.15.022c.37.857.615 1.892.715 3.032h2.096Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Centered logo */}
        <div className="flex items-center">
          <img src="/TRIPCRAFTLOGO.png" alt="TripCraft" style={{ height: 265, width: "auto" }} />
        </div>

        {/* Account dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAccount(!showAccount)}
            className="w-12 h-12 rounded-full bg-stone-800/20 text-stone-700 flex items-center justify-center backdrop-blur-sm hover:bg-[#da7b4a]/30 hover:text-[#b5552a] transition-colors"
            title="Account"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.255 1.139.872 1.139h9.47Z" />
            </svg>
          </button>
          {showAccount && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowAccount(false)} />
              <div className="absolute right-0 top-10 z-40 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 overflow-hidden">
                <div className="px-4 py-2 border-b border-stone-100">
                  <p className="text-xs text-stone-400">Signed in as</p>
                  <p className="text-sm text-stone-700 font-medium truncate">{user?.email}</p>
                </div>
                <Link
                  href="/archived"
                  className="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                  onClick={() => setShowAccount(false)}
                >
                  Archived Trips
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>{/* end header layer */}

      {/* Content layer — cards */}
      <div
        className="relative transition-all duration-700 ease-in-out"
        style={{
          zIndex: view === "cards" ? 10 : 1,
          filter: view === "cards" ? "none" : "saturate(0.2) brightness(0.9)",
          opacity: view === "cards" ? 1 : 0.4,
          pointerEvents: view === "cards" ? "auto" : "none",
        }}
      >

      <main className="max-w-6xl mx-auto px-6 pt-0 pb-10">
        {/* Trip grid — single unified list */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trips.map((trip, i) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={i}
              imageOptions={imageOptions[trip.id]}
              onCycleImage={(dir) => cycleImage(trip.id, dir)}
              onStatusChange={handleStatusChange}
              onArchive={handleArchiveTrip}
              onFieldUpdate={handleFieldUpdate}
            />
          ))}

          {/* New Trip Card — matches trip card layout */}
          <div className="relative group">
            <form onSubmit={handleCreateTrip} className="block">
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-end shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Rotating destination background — two-layer crossfade */}
                {newCardImages.length > 0 ? (
                  <>
                    {/* Layer A */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${newCardImages[layerA] || newCardImages[0]})`,
                        filter: "sepia(0.3) saturate(0.82) contrast(0.94) brightness(0.85) hue-rotate(-4deg)",
                        opacity: showA ? 0.5 : 0,
                        transition: "opacity 1.5s ease-in-out",
                      }}
                    />
                    {/* Layer B */}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${newCardImages[layerB] || newCardImages[1] || newCardImages[0]})`,
                        filter: "sepia(0.3) saturate(0.82) contrast(0.94) brightness(0.85) hue-rotate(-4deg)",
                        opacity: showA ? 0 : 0.5,
                        transition: "opacity 1.5s ease-in-out",
                      }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-500 opacity-50" />
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 75%, transparent 100%)" }}
                />

                {/* Top area — click to start editing if not already */}
                {!creating && (
                  <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 cursor-pointer"
                    onClick={() => { setCreating(true); setTimeout(() => titleRef.current?.focus(), 100); }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                      </svg>
                    </div>
                    <span className="text-white/80 text-sm font-medium">New Trip</span>
                  </div>
                )}

                {/* Inline fields at bottom — same position as trip card info */}
                {creating && (
                  <div className="relative z-10 p-4 pr-[5.5rem]">
                    {createError && <div className="mb-2 px-2 py-1 rounded bg-red-500/60 text-white text-[10px]">{createError}</div>}
                    <input
                      type="text"
                      value={newDest}
                      onChange={(e) => setNewDest(e.target.value)}
                      placeholder="Destination"
                      className="w-full text-white/70 text-xs bg-transparent border-none outline-none placeholder-white/30 mb-0.5 border-b border-transparent focus:border-white/30"
                    />
                    <input
                      ref={titleRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Trip name"
                      className="w-full font-bold text-white text-base leading-tight bg-transparent border-none outline-none placeholder-white/30 mb-0.5 border-b border-transparent focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="text-white/50 text-xs hover:text-white/70 transition-colors text-left"
                    >
                      {newStart && newEnd ? formatTripDates(newStart, newEnd) : "Select dates"}
                    </button>
                  </div>
                )}

                {/* Action buttons — bottom right, matching trip card pill position */}
                {creating && (
                  <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-[3px]">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-[4.2rem] py-[3px] rounded-full text-[9px] font-semibold text-center transition-all backdrop-blur-sm bg-sky-500/50 text-white ring-1 ring-sky-400/40 hover:bg-sky-500/70 disabled:opacity-50"
                    >
                      {saving ? "..." : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelCreate}
                      className="w-[4.2rem] py-[3px] rounded-full text-[9px] font-semibold text-center transition-all backdrop-blur-sm bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/70"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Calendar popup — positioned below the card */}
            {creating && showCalendar && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30">
                <DateRangeCalendar
                  startDate={newStart}
                  endDate={newEnd}
                  onSelect={(s, e) => { setNewStart(s); setNewEnd(e); if (s && e) setShowCalendar(false); }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {trips.length === 0 && !creating && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Where to next?</h2>
            <p className="text-slate-500">Click the New Trip card above to start planning your adventure.</p>
          </div>
        )}

      </main>

      </div>{/* end content layer */}

      <footer className="fixed bottom-0 left-0 right-0 z-20 text-center text-xs text-stone-400/60 py-2 pointer-events-none">
        v3.4.0 — Apr 12 2026
      </footer>
    </div>
  );
}
