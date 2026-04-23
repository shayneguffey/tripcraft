"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlobeCanvas from "@/components/GlobeCanvas";
import MapPatternBg from "@/components/MapPatternBg";
import FlightPathLoader from "@/components/FlightPathLoader";
import { tripPlanningUrl, guideUrl } from "@/lib/tripUrl";

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
const STATUS_EDGE_COLORS = {
  planning: "rgba(74,150,90,1)",
  traveled: "rgba(60,120,180,1)",
  wish: "rgba(210,170,50,1)",
};

function TripCard({ trip, index, onRegenerate, onStatusChange, onArchive, onFieldUpdate }) {
  const [hovered, setHovered] = useState(false);
  const hasImage = !!trip.cover_image;
  const gradient = getGradient(index);
  const canRegenerate = hasImage && trip.destination;
  const status = trip.status || "planning";
  const edgeColor = STATUS_EDGE_COLORS[status] || STATUS_EDGE_COLORS.planning;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card body — clickable link */}
      <Link href={tripPlanningUrl(trip)} className="block">
        <div
          className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-300"
          style={{
            borderBottom: `8px solid ${edgeColor}`,
            transition: "border-color 0.4s, box-shadow 0.3s",
          }}
        >
          {/* Full-bleed image layer — overscaled to crop AI-generated borders */}
          {hasImage ? (
            <div
              className="absolute bg-cover"
              style={{
                inset: "-5%",
                backgroundImage: `url(${trip.cover_image})`,
                backgroundPosition: "center 20%",
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

          {/* Generating poster overlay */}
          {trip._generating && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-200/80 backdrop-blur-sm">
              <div className="w-8 h-8 border-3 border-stone-400 border-t-[#da7b4a] rounded-full animate-spin mb-3" />
              <span className="text-xs font-medium text-stone-600 tracking-wide">Creating poster…</span>
            </div>
          )}

          {/* Shared badge */}
          {trip._isCollaborator && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-violet-700 font-medium backdrop-blur-sm">Shared</span>
            </div>
          )}

          {/* Info area — pinned to bottom, overlays the image */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            {/* Gradient fade from image to info */}
            <div className="h-10" style={{ background: "linear-gradient(to top, #EEEEEE 0%, transparent 100%)" }} />
            <div className="px-4 py-3 pr-[5.5rem]" style={{ backgroundColor: "#EEEEEE" }}>
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

      {/* Hover action buttons — right side */}
      {hovered && !trip._generating && (
        <div className="absolute right-2 top-[30%] -translate-y-1/2 z-20 flex flex-col gap-1.5">
          {/* Regenerate poster */}
          {canRegenerate && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRegenerate(trip.id, trip.destination); }}
              title="Regenerate poster image"
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.451a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 0 1.5 0v-2.127l.209.209a7 7 0 0 0 11.713-3.138.75.75 0 0 0-1.46-.349Zm-10.624-2.85a5.5 5.5 0 0 1 9.201-2.465l.312.31H12.75a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V3.42a.75.75 0 0 0-1.5 0v2.127l-.209-.209A7 7 0 0 0 3.828 8.476a.75.75 0 1 0 1.46.349l-.6.749Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {/* Share itinerary link */}
          {trip._shareToken && (
            <a
              href={guideUrl(trip, trip._shareToken)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open Pocket Guide"
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────


export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [allTripsForGlobe, setAllTripsForGlobe] = useState([]);
  const [flightLegsForGlobe, setFlightLegsForGlobe] = useState([]);
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

  // Rotating backgrounds for the new trip card — uses generated poster images
  const [newCardImages, setNewCardImages] = useState([]);

  useEffect(() => {
    // Build image bank URLs and verify which ones actually exist
    async function loadNewCardBg() {
      const bucketUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/trip-posters/shared`;
      const BANK_DESTINATIONS = [
        "Paris France","Rome Italy","Barcelona Spain","London England",
        "Amsterdam Netherlands","Santorini Greece","Athens Greece",
        "Prague Czech Republic","Vienna Austria","Dubrovnik Croatia",
        "Amalfi Coast Italy","Edinburgh Scotland","Lisbon Portugal",
        "Swiss Alps Switzerland","Bruges Belgium","Budapest Hungary",
        "Cinque Terre Italy","Istanbul Turkey","Reykjavik Iceland",
        "Copenhagen Denmark","Tokyo Japan","Kyoto Japan","Bali Indonesia",
        "Bangkok Thailand","Hanoi Vietnam","Ha Long Bay Vietnam",
        "Angkor Wat Cambodia","Singapore","Hong Kong","Seoul South Korea",
        "Kathmandu Nepal","Jaipur India","Maldives","Luang Prabang Laos",
        "Zhangjiajie China","Taipei Taiwan","Kuala Lumpur Malaysia",
        "Sri Lanka","Petra Jordan","Dubai UAE","New York City USA",
        "Machu Picchu Peru","Rio de Janeiro Brazil","Havana Cuba",
        "Buenos Aires Argentina","Cartagena Colombia","Costa Rica",
        "Patagonia Argentina","Banff National Park Canada","Mexico City Mexico",
        "Grand Canyon USA","Yellowstone USA","San Francisco USA",
        "Cusco Peru","Quebec City Canada","Sedona Arizona USA",
        "Charleston South Carolina USA","Oaxaca Mexico","Marrakech Morocco",
        "Cape Town South Africa","Serengeti Tanzania","Victoria Falls Zimbabwe",
        "Cairo Egypt","Zanzibar Tanzania","Namibia Desert","Fez Morocco",
        "Madagascar","Lake Bled Slovenia","Sydney Australia",
        "Great Barrier Reef Australia","Queenstown New Zealand",
        "Fiji Islands","Bora Bora French Polynesia","Tasmania Australia",
        "Milford Sound New Zealand","Uluru Australia",
        "Turks and Caicos","St Lucia Caribbean","Bermuda",
        "Barbados","Puerto Rico","US Virgin Islands","Aruba",
        "Antigua Caribbean","Iceland Northern Lights","Antarctica",
        "Galapagos Islands Ecuador","Northern Norway Fjords",
        "Great Wall of China","Cappadocia Turkey","Yosemite USA",
        "Scottish Highlands","Trans Siberian Railway Russia",
        "Amazon Rainforest Brazil","Mount Kilimanjaro Tanzania",
        "Svalbard Norway",
      ];

      function slugify(s) {
        return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      }

      const candidateUrls = BANK_DESTINATIONS.map(
        (d) => `${bucketUrl}/${slugify(d)}.png`
      );

      // Check which images actually exist with HEAD requests (fast, no download)
      const checks = await Promise.all(
        candidateUrls.map(async (url) => {
          try {
            const res = await fetch(url, { method: "HEAD" });
            return res.ok ? url : null;
          } catch {
            return null;
          }
        })
      );
      const posterUrls = checks.filter(Boolean);

      console.log("[NewCard] verified images:", posterUrls.length, "of", candidateUrls.length);

      // Shuffle for variety
      for (let i = posterUrls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [posterUrls[i], posterUrls[j]] = [posterUrls[j], posterUrls[i]];
      }

      if (posterUrls.length > 0) setNewCardImages(posterUrls);
    }
    if (!loading) loadNewCardBg();
  }, [loading]);

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

    // Parallel fetch: own trips (active + archived for globe) + collaborator IDs
    const [ownResult, ownAllResult, collabResult] = await Promise.all([
      supabase.from("trips").select("*").eq("user_id", user.id)
        .eq("archived", false).order("updated_at", { ascending: false }),
      supabase.from("trips").select("*").eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase.from("trip_collaborators").select("trip_id")
        .eq("user_id", user.id).eq("status", "accepted"),
    ]);

    const ownTrips = ownResult.data || [];
    const ownAllTrips = ownAllResult.data || [];
    const collabs = collabResult.data || [];

    let collabTrips = [];
    let collabAllTrips = [];
    if (collabs.length > 0) {
      const ids = collabs.map((c) => c.trip_id);
      const [sharedResult, sharedAllResult] = await Promise.all([
        supabase.from("trips").select("*").in("id", ids)
          .eq("archived", false).order("updated_at", { ascending: false }),
        supabase.from("trips").select("*").in("id", ids)
          .order("updated_at", { ascending: false }),
      ]);
      collabTrips = (sharedResult.data || []).map((t) => ({ ...t, _isCollaborator: true }));
      collabAllTrips = (sharedAllResult.data || []).map((t) => ({ ...t, _isCollaborator: true }));
    }

    // Active trips for card grid
    const all = [...ownTrips, ...collabTrips]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

    // Fetch share tokens for each trip's first itinerary
    const tripIds = all.map((t) => t.id);
    if (tripIds.length > 0) {
      const { data: itinTokens } = await supabase
        .from("itineraries")
        .select("trip_id, share_token")
        .in("trip_id", tripIds)
        .not("share_token", "is", null)
        .order("sort_order", { ascending: true });

      const tokenMap = {};
      (itinTokens || []).forEach((it) => {
        if (!tokenMap[it.trip_id]) tokenMap[it.trip_id] = it.share_token;
      });
      all.forEach((t) => { if (tokenMap[t.id]) t._shareToken = tokenMap[t.id]; });
    }

    setTrips(all);

    // All trips (including archived) for globe pins
    const allForGlobe = [...ownAllTrips, ...collabAllTrips]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
    setAllTripsForGlobe(allForGlobe);

    // Fetch flight legs for traveled trips (for globe flight arcs)
    await refreshFlightLegs(allForGlobe);

    setLoading(false);

    // Generate poster images for trips that don't have a cover image yet
    const tripsNeedingImages = all.filter((trip) => trip.destination && !trip.cover_image);
    if (tripsNeedingImages.length > 0) {
      const imagePromises = tripsNeedingImages
        .map((trip) => generatePosterImage(trip.id, trip.destination));
      Promise.all(imagePromises);
    }
  }

  // ─── AI poster image generation (primary) ─────────────────────
  async function generatePosterImage(tripId, destination) {
    try {
      // Show a generating state on the card
      setTrips((p) => p.map((t) => t.id === tripId ? { ...t, _generating: true } : t));

      const res = await fetch("/api/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, tripId }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        await supabase.from("trips").update({ cover_image: data.imageUrl }).eq("id", tripId);
        setTrips((p) => p.map((t) => t.id === tripId
          ? { ...t, cover_image: data.imageUrl, _generating: false }
          : t
        ));
        return data.imageUrl;
      } else {
        // Fallback to Unsplash if poster generation fails
        console.warn("Poster generation failed, falling back to Unsplash:", data.error);
        setTrips((p) => p.map((t) => t.id === tripId ? { ...t, _generating: false } : t));
        await fetchUnsplashImages(tripId, destination, true);
      }
    } catch (err) {
      console.error("Poster generation error:", err);
      setTrips((p) => p.map((t) => t.id === tripId ? { ...t, _generating: false } : t));
      // Fallback to Unsplash
      await fetchUnsplashImages(tripId, destination, true);
    }
  }

  // ─── Unsplash fallback (for image cycling / alternatives) ─────
  async function fetchUnsplashImages(tripId, destination, saveFirst = false) {
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

  async function loadImageOptions(tripId) {
    // Only fetch Unsplash options if we haven't already loaded them
    if (imageOptions[tripId]) return;
    const trip = trips.find((t) => t.id === tripId);
    if (!trip?.destination) return;
    await fetchUnsplashImages(tripId, trip.destination, false);
  }

  async function cycleImage(tripId, direction) {
    // Load Unsplash alternatives on first cycle attempt
    if (!imageOptions[tripId]) {
      await loadImageOptions(tripId);
    }
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

  // Regenerate poster for a specific trip — adds cache-buster so browser loads new image
  async function regeneratePoster(tripId, destination) {
    try {
      setTrips((p) => p.map((t) => t.id === tripId ? { ...t, _generating: true } : t));

      const res = await fetch("/api/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, tripId, regenerate: true }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        // Strip any existing query params and add a fresh cache-buster
        const baseUrl = data.imageUrl.split("?")[0];
        const freshUrl = `${baseUrl}?t=${Date.now()}`;
        await supabase.from("trips").update({ cover_image: freshUrl }).eq("id", tripId);
        setTrips((p) => p.map((t) => t.id === tripId
          ? { ...t, cover_image: freshUrl, _generating: false }
          : t
        ));
      } else {
        console.warn("Poster regeneration failed:", data.error);
        setTrips((p) => p.map((t) => t.id === tripId ? { ...t, _generating: false } : t));
      }
    } catch (err) {
      console.error("Poster regeneration error:", err);
      setTrips((p) => p.map((t) => t.id === tripId ? { ...t, _generating: false } : t));
    }
  }

  // Reusable: fetch flight legs for all traveled trips
  async function refreshFlightLegs(allTrips) {
    const traveledIds = allTrips.filter((t) => t.status === "traveled").map((t) => t.id);
    if (traveledIds.length === 0) { setFlightLegsForGlobe([]); return; }
    const { data: options } = await supabase
      .from("flight_options").select("id, trip_id, is_selected")
      .in("trip_id", traveledIds).eq("is_selected", true);
    if (options && options.length > 0) {
      const optionIds = options.map((o) => o.id);
      const { data: legs } = await supabase
        .from("flight_legs").select("option_id, departure_airport, arrival_airport, departure_date, leg_order")
        .in("option_id", optionIds).order("leg_order", { ascending: true });
      setFlightLegsForGlobe(legs || []);
    } else {
      setFlightLegsForGlobe([]);
    }
  }

  async function handleStatusChange(tripId, status) {
    await supabase.from("trips").update({ status, updated_at: new Date().toISOString() }).eq("id", tripId);
    const updatedTrips = allTripsForGlobe.map((t) => t.id === tripId ? { ...t, status } : t);
    setTrips((p) => p.map((t) => t.id === tripId ? { ...t, status } : t));
    setAllTripsForGlobe(updatedTrips);
    // Re-fetch flight legs since the set of traveled trips changed
    refreshFlightLegs(updatedTrips);
  }

  async function handleArchiveTrip(tripId) {
    await supabase.from("trips").update({ archived: true }).eq("id", tripId);
    setTrips((p) => p.filter((t) => t.id !== tripId));
  }

  async function handleFieldUpdate(tripId, field, value) {
    const update = { [field]: value, updated_at: new Date().toISOString() };
    await supabase.from("trips").update(update).eq("id", tripId);
    setTrips((p) => p.map((t) => t.id === tripId ? { ...t, ...update } : t));
    // If destination changed, generate a new poster image
    if (field === "destination" && value) {
      generatePosterImage(tripId, value);
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
    router.push(tripPlanningUrl(data));
  }

  function cancelCreate() {
    setCreating(false);
    setNewTitle(""); setNewDest(""); setNewStart(""); setNewEnd(""); setNewTravelers(1);
    setCreateError(null); setShowCalendar(false);
  }

  if (loading) {
    return <FlightPathLoader />;
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
        <GlobeCanvas trips={allTripsForGlobe} flightLegs={flightLegsForGlobe} interactive={view === "globe"} />
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
          <Link
            href="/archived"
            className="w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors bg-white/20 text-stone-500 hover:bg-[#da7b4a]/25 hover:text-[#b5552a]"
            title="Archived Trips"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
              <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
            </svg>
          </Link>
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
              onRegenerate={regeneratePoster}
              onStatusChange={handleStatusChange}
              onArchive={handleArchiveTrip}
              onFieldUpdate={handleFieldUpdate}
            />
          ))}

          {/* New Trip Card — smaller than trip cards */}
          <div className="relative group" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <form onSubmit={handleCreateTrip} className="block" style={{ width: "82%" }}>
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-end shadow-sm hover:shadow-xl transition-all duration-300" style={{ border: "2px solid rgba(0,0,0,0.3)" }}>
                {/* Rotating poster backgrounds — two-layer crossfade, lightened */}
                {newCardImages.length > 0 ? (
                  <>
                    {/* Layer A */}
                    <div
                      className="absolute bg-cover"
                      style={{
                        inset: "-5%",
                        backgroundImage: `url(${newCardImages[layerA] || newCardImages[0]})`,
                        backgroundPosition: "center 20%",
                        filter: showA ? "brightness(1.55) saturate(0.35) contrast(0.8)" : "brightness(1.55) saturate(0.35) contrast(0.8)",
                        opacity: showA ? 1 : 0,
                        transition: "opacity 1.5s ease-in-out",
                      }}
                    />
                    {/* Layer B */}
                    <div
                      className="absolute bg-cover"
                      style={{
                        inset: "-5%",
                        backgroundImage: `url(${newCardImages[layerB] || newCardImages[1] || newCardImages[0]})`,
                        backgroundPosition: "center 20%",
                        filter: "brightness(1.55) saturate(0.35) contrast(0.8)",
                        opacity: showA ? 0 : 1,
                        transition: "opacity 1.5s ease-in-out",
                      }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-500 opacity-50" />
                )}

                {/* Subtle dark overlay for text readability */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1) 100%)" }}
                />

                {/* Top area — click to start editing if not already */}
                {!creating && (
                  <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => { setCreating(true); setTimeout(() => titleRef.current?.focus(), 100); }}
                  >
                    <div
                      className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl backdrop-blur-sm"
                      style={{
                        background: "rgba(0,0,0,0.18)",
                        border: "1.5px solid rgba(255,255,255,0.4)",
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-white">
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                      </svg>
                      <span className="text-white text-lg font-semibold">New Trip</span>
                    </div>
                  </div>
                )}

                {/* Inline fields at bottom — same position as trip card info */}
                {creating && (
                  <div className="relative z-10 p-4 pr-[5.5rem] rounded-b-2xl" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
                    {createError && <div className="mb-2 px-2 py-1 rounded bg-red-500/60 text-white text-[10px]">{createError}</div>}
                    <input
                      type="text"
                      value={newDest}
                      onChange={(e) => setNewDest(e.target.value)}
                      placeholder="Destination"
                      className="w-full text-white text-xs bg-transparent border-none outline-none placeholder-white/60 mb-0.5 border-b border-transparent focus:border-white/50"
                    />
                    <input
                      ref={titleRef}
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Trip name"
                      className="w-full font-bold text-white text-base leading-tight bg-transparent border-none outline-none placeholder-white/60 mb-0.5 border-b border-transparent focus:border-white/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="text-white/80 text-xs hover:text-white transition-colors text-left"
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
        v4.1 Pocket Guide — Apr 20 2026
      </footer>
    </div>
  );
}
