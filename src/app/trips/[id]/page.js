"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import FlightOptions from "@/components/FlightOptions";
import ActivityOptions from "@/components/ActivityOptions";
import AccommodationOptions from "@/components/AccommodationOptions";
import DiningOptions from "@/components/DiningOptions";
import TransportationOptions from "@/components/TransportationOptions";
import TimeSelectPopup, { to12h, to24h, formatTime12h as formatTime12hShared } from "@/components/TimeSelectPopup";
import BudgetTracker from "@/components/BudgetTracker";
import PlanningChecklist from "@/components/PlanningChecklist";
import PackingList from "@/components/PackingList";
import TravelDocuments from "@/components/TravelDocuments";
import MapPatternBg from "@/components/MapPatternBg";
import TripMap from "@/components/TripMap";
import TripTravelers from "@/components/TripTravelers";
import {
  Plane, Bed, Star, UtensilsCrossed, ArrowLeftRight, MapPin,
  CircleDollarSign, ClipboardCheck, Briefcase, Folder, Users,
} from "lucide-react";
import InlineConfirm from "@/components/InlineConfirm";
import CATEGORY_COLORS from "@/lib/categoryColors";
import DateRangePicker from "@/components/DateRangePicker";
import DayCardView from "@/components/DayCardView";
import FlightPathLoader from "@/components/FlightPathLoader";
import AccountMenu from "@/components/AccountMenu";
import { tripPlanningUrl, guideUrl } from "@/lib/tripUrl";

// Helper: generate array of dates for calendar display
function getCalendarRange(startDate, endDate) {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  // Show at least 1 week before and after
  const calStart = new Date(start);
  calStart.setDate(calStart.getDate() - 7);
  // Go back to the previous Sunday
  while (calStart.getDay() !== 0) {
    calStart.setDate(calStart.getDate() - 1);
  }

  const calEnd = new Date(end);
  calEnd.setDate(calEnd.getDate() + 7);
  // Go forward to the next Saturday
  while (calEnd.getDay() !== 6) {
    calEnd.setDate(calEnd.getDate() + 1);
  }

  const dates = [];
  const current = new Date(calStart);
  while (current <= calEnd) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b);
}

function isInRange(date, start, end) {
  const d = formatDateKey(date);
  return d >= start && d <= end;
}


// Route-param → trip row lookup. Accepts bare UUIDs (legacy URLs) and the
// hybrid `{slug}--{shortId}` format used by new planning URLs. Returns
// { data, error } mirroring Supabase's own query shape.
//
// The prefix match uses a UUID range query instead of a text cast because
// PostgREST's `.filter("id::text", "like", ...)` isn't reliably wired up
// through the Supabase JS client — UUIDs compare byte-by-byte in Postgres,
// so any UUID starting with the 8-hex-char shortId falls between
// `{shortId}-0000-...` and `{shortId}-ffff-...`.
async function buildTripLookup(supabase, routeParam) {
  if (!routeParam) return { data: null, error: new Error("no route param") };
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // 1. Legacy URL: full UUID as the route param.
  if (UUID_RE.test(routeParam)) {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", routeParam)
      .maybeSingle();
    if (data) return { data, error: null };
    if (error) return { data: null, error };
  }

  // 2. Hybrid URL: parse the trailing short id (everything after the last "--").
  const shortId = (routeParam.includes("--") ? routeParam.split("--").pop() : routeParam).toLowerCase();
  if (!/^[0-9a-f]{1,8}$/.test(shortId)) {
    return { data: null, error: new Error("invalid route param") };
  }
  const pad = shortId.padEnd(8, "0");
  const low = `${pad}-0000-0000-0000-000000000000`;
  const high = `${pad}-ffff-ffff-ffff-ffffffffffff`;
  const { data: rows, error } = await supabase
    .from("trips")
    .select("*")
    .gte("id", low)
    .lte("id", high)
    .limit(2);
  if (error) return { data: null, error };
  const list = rows || [];
  if (list.length === 1) return { data: list[0], error: null };
  if (list.length === 0) return { data: null, error: new Error("trip not found") };
  return { data: null, error: new Error("ambiguous trip id") };
}

export default function TripDetailPage() {
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState({});
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dragType, setDragType] = useState(null); // "start" or "end"
  const [dragDate, setDragDate] = useState(null);
  const [editingField, setEditingField] = useState(null); // "title", "destination", "dates", "description"
  const [editValue, setEditValue] = useState("");
  const [editValue2, setEditValue2] = useState(""); // for end date when editing dates
  const [flightOptions, setFlightOptions] = useState([]);
  const [activityOptions, setActivityOptions] = useState([]);
  const [accommodationOptions, setAccommodationOptions] = useState([]);
  const [diningOptions, setDiningOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  // Single tab state — itinerary modules + tools all share one angled-tab strip.
  const [activeItineraryTab, setActiveItineraryTab] = useState("flights");
  const [eventPopup, setEventPopup] = useState(null); // { type, data, dateKey, rect }
  const [hoveredDay, setHoveredDay] = useState(null);
  const [editingDayHeader, setEditingDayHeader] = useState(null);
  const [dayHeaderValue, setDayHeaderValue] = useState("");
  // Itinerary state
  const [itineraries, setItineraries] = useState([]);
  const [activeItineraryId, setActiveItineraryId] = useState(null);
  const [editingItineraryTitle, setEditingItineraryTitle] = useState(null);
  const [itineraryTitleValue, setItineraryTitleValue] = useState("");
  const [editingItineraryNotes, setEditingItineraryNotes] = useState(false);
  const [itineraryNotesValue, setItineraryNotesValue] = useState("");
  const [editingCalendarTitle, setEditingCalendarTitle] = useState(false);
  const [calendarTitleValue, setCalendarTitleValue] = useState("");
  const [itinerarySelections, setItinerarySelections] = useState([]);
  const [editingItineraryTravelers, setEditingItineraryTravelers] = useState(false);
  const [itineraryTravelersValue, setItineraryTravelersValue] = useState("");
  const [confirmDeleteItinerary, setConfirmDeleteItinerary] = useState(null);
  const [editingItineraryDates, setEditingItineraryDates] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  // Set of traveler IDs included in the active itinerary (junction: itinerary_travelers)
  const [itineraryTravelerIds, setItineraryTravelerIds] = useState([]);
  const [travelersRefreshKey, setTravelersRefreshKey] = useState(0);
  const itineraryTravelerCount = Math.max(1, itineraryTravelerIds.length);
  const guideBtnRef = useRef(null);

  // Load the included travelers for the active itinerary
  useEffect(() => {
    if (!activeItineraryId) { setItineraryTravelerIds([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("itinerary_travelers")
        .select("traveler_id")
        .eq("itinerary_id", activeItineraryId);
      if (!cancelled) setItineraryTravelerIds((data || []).map((r) => r.traveler_id));
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItineraryId, travelersRefreshKey]);
  const router = useRouter();
  const params = useParams();

  const loadTrip = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/?auth=login");
      return;
    }

    setCurrentUser(user);

    const { data: tripData, error: tripError } = await buildTripLookup(supabase, params.id);

    if (tripError || !tripData) {
      router.push("/trips");
      return;
    }

    setTrip(tripData);

    // Generate banner image if missing (fire and forget — page loads immediately)
    if (tripData.destination && !tripData.banner_image) {
      fetch("/api/generate-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: tripData.destination, tripId: tripData.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.imageUrl) {
            supabase.from("trips").update({ banner_image: data.imageUrl }).eq("id", tripData.id);
            setTrip((prev) => ({ ...prev, banner_image: data.imageUrl }));
          }
        })
        .catch((err) => console.error("Banner generation error:", err));
    }

    // Fetch itineraries for this trip
    const { data: itinerariesData, error: itinError } = await supabase
      .from("itineraries")
      .select("*")
      .eq("trip_id", tripData.id)
      .order("sort_order", { ascending: true });

    let itins = itinerariesData || [];

    // Auto-create a default itinerary if table exists but is empty.
    // IMPORTANT: only do this for the trip owner. Otherwise a collaborator
    // or shared-link viewer who can't see any itineraries (RLS filters by
    // user_id + share_token) would auto-seed a phantom "Itinerary 1" row
    // owned by them — exactly how the Olympic Peninsula duplicates were
    // created. React's Strict-Mode double render made that worse by firing
    // the insert twice in parallel, so we also log + skip if we somehow get
    // here a second time before the first insert has resolved.
    const isOwner = tripData.user_id === user.id;
    if (!itinError && itins.length === 0 && isOwner) {
      const { data: newItin } = await supabase
        .from("itineraries")
        .insert({
          trip_id: tripData.id,
          user_id: user.id,
          title: "Itinerary 1",
          start_date: tripData.start_date || null,
          end_date: tripData.end_date || null,
          num_travelers: tripData.num_travelers || 1,
          sort_order: 0,
        })
        .select()
        .single();
      if (newItin) {
        itins = [newItin];
        // Migrate existing is_selected options to this itinerary
        const tables = [
          { table: "flight_options", type: "flight" },
          { table: "accommodation_options", type: "accommodation" },
          { table: "activity_options", type: "activity" },
          { table: "dining_options", type: "dining" },
          { table: "transportation_options", type: "transportation" },
        ];
        for (const { table, type } of tables) {
          const { data: selected } = await supabase.from(table).select("id").eq("trip_id", tripData.id).eq("is_selected", true);
          if (selected && selected.length > 0) {
            await supabase.from("itinerary_selections").insert(
              selected.map((s) => ({ itinerary_id: newItin.id, option_type: type, option_id: s.id }))
            );
          }
        }
      }
    }

    setItineraries(itins);
    if (itins.length > 0) {
      const firstId = itins[0].id;
      setActiveItineraryId((prev) => {
        const targetId = prev && itins.find((i) => i.id === prev) ? prev : firstId;
        // Load selections for the target itinerary
        supabase
          .from("itinerary_selections")
          .select("*")
          .eq("itinerary_id", targetId)
          .then(({ data: selectionsData }) => {
            setItinerarySelections(selectionsData || []);
          });
        return targetId;
      });
    } else {
      // Table doesn't exist yet — fall back to no-itinerary mode
      setActiveItineraryId(null);
      setItinerarySelections([]);
    }

    // Fetch days keyed by date — filtered by active itinerary if available
    const activeItinId = itins.length > 0
      ? (itins.find((i) => i.id === activeItineraryId)?.id || itins[0].id)
      : null;

    let daysQuery = supabase.from("days").select("*").eq("trip_id", tripData.id);
    if (activeItinId) {
      daysQuery = daysQuery.eq("itinerary_id", activeItinId);
    }
    const { data: daysData } = await daysQuery;

    const daysMap = {};
    (daysData || []).forEach((d) => {
      daysMap[d.date] = d;
    });
    setDays(daysMap);

    // Fetch activities grouped by day_id
    if (daysData && daysData.length > 0) {
      const dayIds = daysData.map((d) => d.id);
      const { data: activitiesData } = await supabase
        .from("activities")
        .select("*")
        .in("day_id", dayIds)
        .order("sort_order", { ascending: true });

      const grouped = {};
      (activitiesData || []).forEach((a) => {
        if (!grouped[a.day_id]) grouped[a.day_id] = [];
        grouped[a.day_id].push(a);
      });
      setActivities(grouped);
    }

    // Fetch option tables so parent state stays fresh (needed for DayPopout time edits)
    const [
      { data: flightData },
      { data: activityData },
      { data: accommodationData },
      { data: diningData },
      { data: transportData },
    ] = await Promise.all([
      supabase.from("flight_options").select("*, flight_legs(*)").eq("trip_id", tripData.id).order("sort_order", { ascending: true }),
      supabase.from("activity_options").select("*").eq("trip_id", tripData.id).order("sort_order", { ascending: true }),
      supabase.from("accommodation_options").select("*").eq("trip_id", tripData.id).order("sort_order", { ascending: true }),
      supabase.from("dining_options").select("*").eq("trip_id", tripData.id).order("sort_order", { ascending: true }),
      supabase.from("transportation_options").select("*").eq("trip_id", tripData.id).order("sort_order", { ascending: true }),
    ]);
    setFlightOptions(flightData || []);
    setActivityOptions(activityData || []);
    setAccommodationOptions(accommodationData || []);
    setDiningOptions(diningData || []);
    setTransportOptions(transportData || []);

    setLoading(false);
  }, [params.id, router]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  // Update trip date range in database
  async function updateTripDates(newStart, newEnd) {
    await supabase
      .from("trips")
      .update({ start_date: newStart, end_date: newEnd, updated_at: new Date().toISOString() })
      .eq("id", trip?.id);

    setTrip((prev) => ({ ...prev, start_date: newStart, end_date: newEnd }));
  }

  function startEditing(field) {
    if (field === "title") setEditValue(trip.title || "");
    else if (field === "destination") setEditValue(trip.destination || "");
    else if (field === "dates") {
      setEditValue(trip.start_date || "");
      setEditValue2(trip.end_date || "");
    }
    else if (field === "description") setEditValue(trip.description || "");
    else if (field === "num_travelers") setEditValue(trip.num_travelers || 1);
    setEditingField(field);
  }

  async function saveField(field) {
    const updates = { updated_at: new Date().toISOString() };

    if (field === "title") updates.title = editValue;
    else if (field === "destination") updates.destination = editValue || null;
    else if (field === "dates") {
      updates.start_date = editValue || null;
      updates.end_date = editValue2 || null;
    }
    else if (field === "description") updates.description = editValue || null;
    else if (field === "num_travelers") updates.num_travelers = Math.max(1, parseInt(editValue) || 1);

    await supabase.from("trips").update(updates).eq("id", trip?.id);
    setEditingField(null);
    loadTrip();
  }

  function handleFieldKeyDown(e, field) {
    if (e.key === "Enter" && field !== "description") {
      e.preventDefault();
      saveField(field);
    } else if (e.key === "Escape") {
      setEditingField(null);
    }
  }

  // ─── Itinerary management functions ───
  async function createItinerary() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const activeItin = itineraries.find((i) => i.id === activeItineraryId);
    const newSort = itineraries.length;
    const { data: newItin, error: insertError } = await supabase
      .from("itineraries")
      .insert({
        trip_id: trip?.id,
        user_id: user.id,
        title: `Itinerary ${newSort + 1}`,
        start_date: activeItin?.start_date || trip?.start_date || null,
        end_date: activeItin?.end_date || trip?.end_date || null,
        num_travelers: activeItin?.num_travelers || trip?.num_travelers || 1,
        sort_order: newSort,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create itinerary:", insertError);
      alert("Failed to create itinerary: " + insertError.message);
      return;
    }

    if (newItin) {
      setItineraries((prev) => [...prev, newItin]);
      setActiveItineraryId(newItin.id);
      setItinerarySelections([]);
      setDays({}); // Clear day headers — new itinerary starts fresh
    }
  }

  async function switchItinerary(id) {
    // Fetch both selections and days in parallel, then batch state updates
    const [selectionsRes, daysRes] = await Promise.all([
      supabase.from("itinerary_selections").select("*").eq("itinerary_id", id),
      supabase.from("days").select("*").eq("trip_id", trip?.id).eq("itinerary_id", id),
    ]);
    const daysMap = {};
    (daysRes.data || []).forEach((d) => { daysMap[d.date] = d; });

    // Batch all state updates together to trigger a single re-render
    setActiveItineraryId(id);
    setItinerarySelections(selectionsRes.data || []);
    setDays(daysMap);
  }

  async function saveItineraryTitle(id) {
    if (!itineraryTitleValue.trim()) {
      setEditingItineraryTitle(null);
      return;
    }
    await supabase.from("itineraries").update({ title: itineraryTitleValue.trim() }).eq("id", id);
    setItineraries((prev) => prev.map((i) => i.id === id ? { ...i, title: itineraryTitleValue.trim() } : i));
    setEditingItineraryTitle(null);
  }

  async function saveCalendarItineraryTitle() {
    if (!activeItineraryId) return;
    const val = calendarTitleValue.trim();
    if (!val) { setEditingCalendarTitle(false); return; }
    await supabase.from("itineraries").update({ title: val }).eq("id", activeItineraryId);
    setItineraries((prev) => prev.map((i) => i.id === activeItineraryId ? { ...i, title: val } : i));
    setEditingCalendarTitle(false);
  }

  async function saveItineraryNotes() {
    if (!activeItineraryId) return;
    const val = itineraryNotesValue.trim();
    await supabase.from("itineraries").update({ notes: val || null }).eq("id", activeItineraryId);
    setItineraries((prev) => prev.map((i) => i.id === activeItineraryId ? { ...i, notes: val || null } : i));
    setEditingItineraryNotes(false);
  }

  async function saveItineraryTravelers() {
    if (!activeItineraryId) return;
    const val = Math.max(1, parseInt(itineraryTravelersValue) || 1);
    await supabase.from("itineraries").update({ num_travelers: val }).eq("id", activeItineraryId);
    setItineraries((prev) => prev.map((i) => i.id === activeItineraryId ? { ...i, num_travelers: val } : i));
    setEditingItineraryTravelers(false);
  }

  async function deleteItineraryConfirmed(id) {
    if (itineraries.length <= 1) return;
    setConfirmDeleteItinerary(null);
    await supabase.from("itineraries").delete().eq("id", id);
    const remaining = itineraries.filter((i) => i.id !== id);
    setItineraries(remaining);
    if (activeItineraryId === id && remaining.length > 0) {
      switchItinerary(remaining[0].id);
    }
  }

  async function openPocketGuide() {
    if (!activeItineraryId) return;
    setGuideLoading(true);

    try {
      // Ensure the active itinerary has a share_token; the Pocket Guide URL depends on it.
      const activeItin = itineraries.find((i) => i.id === activeItineraryId);
      let token = activeItin?.share_token;

      if (!token) {
        token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
        const { data: updatedRow, error } = await supabase
          .from("itineraries")
          .update({ share_token: token })
          .eq("id", activeItineraryId)
          .select("id, share_token")
          .single();

        if (error || !updatedRow) {
          console.error("[pocket-guide] Failed to save share token:", error?.message || "no row returned");
          alert("Could not open Pocket Guide. Check the browser console for details.");
          setGuideLoading(false);
          return;
        }

        setItineraries((prev) =>
          prev.map((i) => (i.id === activeItineraryId ? { ...i, share_token: token } : i))
        );
      }

      router.push(guideUrl(trip, token, activeItin));
    } catch (err) {
      console.error("[pocket-guide] Unexpected error:", err);
    }
    setGuideLoading(false);
  }

  async function openTripPlan() {
    if (!activeItineraryId) return;
    setPlanLoading(true);
    try {
      const activeItin = itineraries.find((i) => i.id === activeItineraryId);
      let token = activeItin?.share_token;
      if (!token) {
        token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
        const { data: updatedRow, error } = await supabase
          .from("itineraries")
          .update({ share_token: token })
          .eq("id", activeItineraryId)
          .select("id, share_token")
          .single();
        if (error || !updatedRow) {
          console.error("[trip-plan] Failed to save share token:", error?.message);
          alert("Could not open Trip Plan. Check the browser console for details.");
          setPlanLoading(false);
          return;
        }
        setItineraries((prev) =>
          prev.map((i) => (i.id === activeItineraryId ? { ...i, share_token: token } : i))
        );
      }
      router.push(`/plan/${token}`);
    } catch (err) {
      console.error("[trip-plan] Unexpected error:", err);
    }
    setPlanLoading(false);
  }

  async function toggleSelection(optionType, optionId) {
    if (!activeItineraryId) return;

    const existing = itinerarySelections.find(
      (s) => s.option_type === optionType && s.option_id === optionId
    );

    if (existing) {
      // Remove selection
      await supabase.from("itinerary_selections").delete().eq("id", existing.id);
      setItinerarySelections((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      // Add selection
      const { data: newSel } = await supabase
        .from("itinerary_selections")
        .insert({
          itinerary_id: activeItineraryId,
          option_type: optionType,
          option_id: optionId,
        })
        .select()
        .single();

      if (newSel) {
        setItinerarySelections((prev) => [...prev, newSel]);
      }
    }
  }

  function isOptionSelected(optionType, optionId) {
    return itinerarySelections.some(
      (s) => s.option_type === optionType && s.option_id === optionId
    );
  }

  // Get the active itinerary object
  const activeItinerary = itineraries.find((i) => i.id === activeItineraryId);

  async function saveDayHeader(dateKey) {
    const existing = days[dateKey];
    if (existing) {
      // Update existing day — also ensure itinerary_id is set
      const updates = { title: dayHeaderValue || null };
      if (activeItineraryId && !existing.itinerary_id) {
        updates.itinerary_id = activeItineraryId;
      }
      await supabase.from("days").update(updates).eq("id", existing.id);
    } else if (dayHeaderValue.trim()) {
      await supabase.from("days").insert({
        trip_id: trip?.id,
        date: dateKey,
        title: dayHeaderValue || null,
        itinerary_id: activeItineraryId || null,
      });
    }
    setEditingDayHeader(null);
    setDayHeaderValue("");
    loadTrip();
  }

  // Get flights on a given date — filtered by itinerary selections (supports multiple flight options)
  function getFlightsOnDate(dateKey) {
    const selectedFlightIds = itinerarySelections
      .filter((s) => s.option_type === "flight")
      .map((s) => s.option_id);
    const selectedOpts = flightOptions.filter((o) => selectedFlightIds.includes(o.id));
    if (selectedOpts.length === 0) return [];
    return selectedOpts.flatMap((opt) =>
      (opt.flight_legs || []).filter((leg) => leg.departure_date === dateKey).map((leg) => ({ ...leg, _optionId: opt.id, notes: leg.notes || opt.notes, source_url: opt.source_url, screenshot_url: opt.screenshot_url, total_price: opt.total_price, currency: opt.currency }))
    );
  }

  function getScheduledActivities(dateKey) {
    const selectedIds = itinerarySelections
      .filter((s) => s.option_type === "activity")
      .map((s) => s.option_id);
    return activityOptions.filter((a) => a.scheduled_date === dateKey && selectedIds.includes(a.id));
  }

  function getScheduledAccommodations(dateKey) {
    const selectedIds = itinerarySelections
      .filter((s) => s.option_type === "accommodation")
      .map((s) => s.option_id);
    return accommodationOptions.filter((a) => {
      if (!selectedIds.includes(a.id) || !a.check_in_date) return false;
      const checkOut = a.check_out_date || a.check_in_date;
      return dateKey >= a.check_in_date && dateKey < checkOut;
    });
  }

  function getScheduledDining(dateKey) {
    const selectedIds = itinerarySelections
      .filter((s) => s.option_type === "dining")
      .map((s) => s.option_id);
    return diningOptions.filter((d) => d.scheduled_date === dateKey && selectedIds.includes(d.id));
  }

  function getScheduledTransport(dateKey) {
    const selectedIds = itinerarySelections
      .filter((s) => s.option_type === "transportation")
      .map((s) => s.option_id);
    return transportOptions.filter((t) => {
      if (!selectedIds.includes(t.id)) return false;
      if (t.departure_date === dateKey) return true;
      if (t.arrival_date && t.arrival_date !== t.departure_date && t.arrival_date === dateKey) return true;
      return false;
    });
  }

  // Save date range from the inline date picker
  async function handleDatePickerSave(newStart, newEnd) {
    setEditingItineraryDates(false);
    if (activeItineraryId) {
      updateItineraryDates(newStart, newEnd);
    } else {
      updateTripDates(newStart, newEnd);
    }
  }

  // Update itinerary date range in database. If the parent trip has no
  // dates of its own yet, mirror them onto the trip too — this is the
  // first time dates are being set, so the trip card on the list page
  // (which reads from trip.start_date / trip.end_date) needs them.
  async function updateItineraryDates(newStart, newEnd) {
    if (!activeItineraryId) return;
    await supabase
      .from("itineraries")
      .update({ start_date: newStart, end_date: newEnd })
      .eq("id", activeItineraryId);
    setItineraries((prev) => prev.map((i) =>
      i.id === activeItineraryId ? { ...i, start_date: newStart, end_date: newEnd } : i
    ));
    if (trip && (!trip.start_date || !trip.end_date)) {
      await supabase
        .from("trips")
        .update({ start_date: newStart, end_date: newEnd })
        .eq("id", trip.id);
      setTrip((prev) => prev ? { ...prev, start_date: newStart, end_date: newEnd } : prev);
    }
  }

  // Determine which dates to use for calendar: itinerary dates if available, else trip dates
  const calendarStartDate = activeItinerary?.start_date || trip?.start_date;
  const calendarEndDate = activeItinerary?.end_date || trip?.end_date;

  // Drag handlers for adjusting date range (updates itinerary dates, not trip dates)
  function handleMouseDown(dateKey, e) {
    e.preventDefault();
    if (!calendarStartDate || !calendarEndDate) return;

    if (dateKey === calendarStartDate) {
      setDragType("start");
    } else if (dateKey === calendarEndDate) {
      setDragType("end");
    }
  }

  function handleMouseEnter(dateKey) {
    if (!dragType) return;
    setDragDate(dateKey);
  }

  function handleMouseUp() {
    if (dragType && dragDate) {
      let newStart = calendarStartDate;
      let newEnd = calendarEndDate;

      if (dragType === "start" && dragDate < calendarEndDate) {
        newStart = dragDate;
      } else if (dragType === "end" && dragDate > calendarStartDate) {
        newEnd = dragDate;
      }

      if (newStart !== calendarStartDate || newEnd !== calendarEndDate) {
        if (activeItineraryId) {
          updateItineraryDates(newStart, newEnd);
        } else {
          updateTripDates(newStart, newEnd);
        }
      }
    }
    setDragType(null);
    setDragDate(null);
  }

  useEffect(() => {
    if (dragType) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [dragType, dragDate]);

  // Get the effective start/end while dragging — uses itinerary dates if available
  function getEffectiveRange() {
    let start = calendarStartDate;
    let end = calendarEndDate;

    if (dragType === "start" && dragDate && dragDate < end) {
      start = dragDate;
    } else if (dragType === "end" && dragDate && dragDate > start) {
      end = dragDate;
    }

    return { start, end };
  }

  if (loading) {
    return <FlightPathLoader text="Loading trip..." />;
  }

  const { start: effectiveStart, end: effectiveEnd } = calendarStartDate
    ? getEffectiveRange()
    : { start: null, end: null };

  // Use effective range (accounts for dragging) so calendar updates live
  const calendarDates = effectiveStart && effectiveEnd
    ? getCalendarRange(effectiveStart, effectiveEnd)
    : [];

  // Group dates into weeks
  const weeks = [];
  for (let i = 0; i < calendarDates.length; i += 7) {
    weeks.push(calendarDates.slice(i, i + 7));
  }

  // Build the calendar title showing the range of months displayed
  function getCalendarTitle() {
    if (calendarDates.length === 0) return "";
    const first = calendarDates[0];
    const last = calendarDates[calendarDates.length - 1];

    const firstMonth = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const lastMonth = last.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (firstMonth === lastMonth) return firstMonth;

    // Same year — show "June — August 2026"
    if (first.getFullYear() === last.getFullYear()) {
      return `${first.toLocaleDateString("en-US", { month: "long" })} — ${last.toLocaleDateString("en-US", { month: "long" })} ${last.getFullYear()}`;
    }

    // Different years — show "December 2026 — January 2027"
    return `${firstMonth} — ${lastMonth}`;
  }

  const today = formatDateKey(new Date());

  return (
    <div
      className="min-h-screen relative"
      onMouseUp={handleMouseUp}
    >
      {/* Parchment gradient base */}
      <div className="fixed inset-0" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.7) 0%, rgba(222,210,190,0.6) 50%, rgba(210,195,172,0.7) 100%)" }} />
      <MapPatternBg tileSize={280} opacity={1} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-4">
        {/* ═══ HEADER WITH BANNER IMAGE ═══ */}
        <div className="relative" style={{ marginBottom: "-20px", paddingBottom: "20px" }}>
          {/* Banner image layer — behind all header content. overflow-hidden lives here (not on the outer wrapper) so InlineConfirm popups on the itinerary tabs aren't clipped. */}
          {trip?.banner_image && (
            <div className="absolute inset-0 z-0 overflow-hidden rounded-t-2xl">
              <img
                src={trip.banner_image}
                alt=""
                className="w-full h-full object-cover"
                style={{ transform: "scale(1.08)", transformOrigin: "center" }}
              />
              {/* Bottom fade — subtle blend at the calendar edge */}
              <div
                className="absolute inset-x-0 bottom-0 h-[15%]"
                style={{
                  background: "linear-gradient(to top, rgba(210,195,172,0.7) 0%, transparent 100%)",
                }}
              />
              {/* Subtle overall darkening for text readability */}
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.1)" }} />
            </div>
          )}

          {/* Header content — on top of banner */}
          <div className={`relative z-10 ${trip?.banner_image ? "pb-2" : ""}`}>
            {/* Logo + Back button */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center pt-2 pl-2">
                <img
                  src="/TRIPCRAFTLOGO.png"
                  alt="TripCraft"
                  style={{
                    height: 160,
                    width: "auto",
                    ...(trip?.banner_image ? { filter: "brightness(0) invert(1)" } : {}),
                  }}
                />
              </div>
              <div className="flex items-center gap-2 mr-4 mt-4">
                <Link
                  href="/trips"
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:ring-2 hover:ring-[#da7b4a]/40 ${
                    trip?.banner_image ? "text-white/90" : "text-stone-600"
                  }`}
                  style={{
                    background: trip?.banner_image ? "rgba(30, 22, 12, 0.5)" : "rgba(255,255,255,0.45)",
                    border: trip?.banner_image ? "1px solid rgba(212, 165, 116, 0.3)" : "1px solid rgba(180, 165, 140, 0.4)",
                    backdropFilter: trip?.banner_image ? "blur(8px)" : "none",
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                  </svg>
                  Back to Trips
                </Link>
                <AccountMenu variant={trip?.banner_image ? "dark" : "light"} />
              </div>
            </div>

            {/* Trip Header with inline editing */}
            <div className="px-2 mt-4">
              {/* Title — click to edit */}
              <div>
                {editingField === "title" ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField("title")}
                    onKeyDown={(e) => handleFieldKeyDown(e, "title")}
                    autoFocus
                    className="text-3xl font-bold text-stone-800 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent w-full max-w-xl"
                  />
                ) : (
                  <h1
                    onClick={() => startEditing("title")}
                    className={`text-5xl font-normal cursor-text transition-colors px-2 pb-0.5 ${
                      trip?.banner_image
                        ? "text-white drop-shadow-md hover:text-white/90"
                        : "text-stone-800 hover:text-[#da7b4a]"
                    }`}
                    style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "2px" }}
                    title="Click to edit trip name"
                  >
                    {trip.title || "Untitled Trip"}
                  </h1>
                )}
              </div>

              {/* Destination — click to edit */}
              <div>
                {editingField === "destination" ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveField("destination")}
                      onKeyDown={(e) => handleFieldKeyDown(e, "destination")}
                      autoFocus
                      placeholder="Enter destination"
                      className="text-stone-500 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => startEditing("destination")}
                    className={`flex items-center gap-1.5 font-semibold italic cursor-text transition-colors px-2 pt-0 ${
                      trip?.banner_image
                        ? "text-white drop-shadow-md hover:text-white/90"
                        : "text-stone-500 hover:text-[#da7b4a]"
                    }`}
                    title="Click to edit destination"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {trip.destination || <span className="italic text-stone-400">No destination set</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ ITINERARY VERSION TABS ═══ */}
          {itineraries.length > 0 && (
            <div className="flex items-end gap-0.5 -mb-px relative z-10 px-2">
            {itineraries.map((itin) => {
              const isActive = itin.id === activeItineraryId;
              return (
                <div
                  key={itin.id}
                  className={`relative flex flex-col items-stretch px-4 pt-1.5 pb-1 rounded-t-xl text-base font-semibold cursor-pointer transition-all ${isActive ? "justify-start" : "justify-center"} ${
                    isActive ? "text-white" : trip?.banner_image ? "text-white/80 hover:text-white" : "text-stone-600 hover:text-stone-800"
                  }`}
                  style={{
                    background: isActive ? "#da7b4a" : trip?.banner_image ? "rgba(30, 22, 12, 0.4)" : "rgba(195,178,155,0.35)",
                    backdropFilter: !isActive && trip?.banner_image ? "blur(4px)" : "none",
                    borderTop: isActive ? "2px solid #b5552a" : "2px solid transparent",
                    borderLeft: isActive ? "1px solid #b5552a" : trip?.banner_image ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(180,165,140,0.3)",
                    borderRight: isActive ? "1px solid #b5552a" : trip?.banner_image ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(180,165,140,0.3)",
                    borderBottom: isActive ? "2px solid transparent" : "2px solid rgba(180,165,140,0.3)",
                    marginBottom: -3,
                    width: "240px",
                  }}
                  onClick={() => switchItinerary(itin.id)}
                >
                  {/* Row 1: itinerary title (+ delete X when active) */}
                  <div className="flex items-center gap-1.5 w-full">
                    {editingItineraryTitle === itin.id ? (
                      <input
                        type="text"
                        value={itineraryTitleValue}
                        onChange={(e) => setItineraryTitleValue(e.target.value)}
                        onBlur={() => saveItineraryTitle(itin.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveItineraryTitle(itin.id);
                          if (e.key === "Escape") setEditingItineraryTitle(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="bg-white/90 text-stone-800 border border-stone-300 rounded px-1.5 py-0.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 w-32"
                      />
                    ) : (
                      <span
                        onClick={(e) => {
                          if (isActive) {
                            e.stopPropagation();
                            setEditingItineraryTitle(itin.id);
                            setItineraryTitleValue(itin.title);
                          }
                        }}
                        className={`uppercase line-clamp-1 text-left flex-1 min-w-0 ${isActive ? "cursor-text" : ""}`}
                        title={isActive ? "Click to rename" : ""}
                      >
                        {itin.title}
                      </span>
                    )}
                    {/* Delete button — only if more than 1 itinerary */}
                    {itineraries.length > 1 && isActive && editingItineraryTitle !== itin.id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteItinerary(itin.id); }}
                        className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                        title="Delete itinerary"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <InlineConfirm
                      open={confirmDeleteItinerary === itin.id}
                      message="Delete this itinerary?"
                      onConfirm={() => deleteItineraryConfirmed(itin.id)}
                      onCancel={() => setConfirmDeleteItinerary(null)}
                    />
                  </div>

                </div>
              );
            })}
            <button
              onClick={createItinerary}
              className="flex items-center gap-1 px-3 py-2 mb-px rounded-t-lg text-xs font-semibold text-white/80 hover:text-white transition-all"
              style={{
                background: "#c4886a",
                border: "1px solid #b5774d",
                borderBottom: "none",
              }}
              title="Create new itinerary version"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>
              New
            </button>
            </div>
          )}

        </div>

        {/* ═══ CALENDAR ═══ */}
        {calendarDates.length > 0 ? (
          <div
            className="relative z-10 bg-white rounded-2xl shadow-sm overflow-hidden select-none uppercase"
            style={{ border: "3px solid #da7b4a" }}
          >
            {/* Itinerary Info Row */}
            <div className="px-5 py-3 border-b border-stone-200/60 bg-white normal-case">
              <div className="flex items-start gap-5">
                {/* Pocket Guide + Trip Plan — stacked vertically on the far left */}
                <div className="flex-shrink-0 flex flex-col gap-1.5">
                  <button
                    ref={guideBtnRef}
                    onClick={openPocketGuide}
                    disabled={guideLoading}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider text-stone-600 bg-stone-50 hover:bg-[#da7b4a]/10 hover:text-[#b5552a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-2 border-[#da7b4a] min-w-[120px]"
                    title="Open the Pocket Guide (traveler view)"
                  >
                    {guideLoading ? (
                      <div className="w-3 h-3 border border-stone-400 border-t-stone-700 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                    Pocket Guide
                  </button>
                  <button
                    type="button"
                    onClick={openTripPlan}
                    disabled={planLoading}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider text-stone-600 bg-stone-50 hover:bg-[#da7b4a]/10 hover:text-[#b5552a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed border-2 border-[#da7b4a] min-w-[120px]"
                    title="Open the Trip Plan (printable PDF)"
                  >
                    {planLoading ? (
                      <div className="w-3 h-3 border border-stone-400 border-t-stone-700 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    Trip Plan
                  </button>
                </div>

                {/* Dates + Travelers */}
                <div className="flex-shrink-0">
                  {/* Date range — clickable to open date picker */}
                  <div className="relative mt-0.5 min-h-[16px]">
                    <div
                      onClick={() => setEditingItineraryDates(true)}
                      className="text-xs text-[#da7b4a] cursor-pointer hover:text-[#b5552a] transition-colors inline-flex items-center gap-1"
                      title="Click to edit dates"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {effectiveStart && effectiveEnd ? (
                        <>
                          {new Date(effectiveStart + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          {" — "}
                          {new Date(effectiveEnd + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </>
                      ) : "Set dates"}
                    </div>
                    {editingItineraryDates && (
                      <DateRangePicker
                        startDate={effectiveStart || null}
                        endDate={effectiveEnd || null}
                        onSave={handleDatePickerSave}
                        onCancel={() => setEditingItineraryDates(false)}
                      />
                    )}
                  </div>
                  {/* Travelers — count derived from itinerary_travelers; managed in the Travelers tab */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <div
                      onClick={() => setActiveItineraryTab("collaborators")}
                      className="text-xs text-[#da7b4a] cursor-pointer hover:text-[#b5552a] transition-colors"
                      title="Manage travelers in the Travelers tab"
                    >
                      <svg className="w-3 h-3 inline mr-0.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {itineraryTravelerCount} traveler{itineraryTravelerCount === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>

                {/* Itinerary notes — inline, capped width */}
                <div className="w-80 max-w-sm flex-shrink-0">
                  <div className="text-[10px] font-semibold text-[#da7b4a] uppercase tracking-wide mb-1">Itinerary notes</div>
                  {editingItineraryNotes ? (
                    <textarea
                      value={itineraryNotesValue}
                      onChange={(e) => setItineraryNotesValue(e.target.value)}
                      onBlur={() => saveItineraryNotes()}
                      onKeyDown={(e) => { if (e.key === "Escape") setEditingItineraryNotes(false); }}
                      autoFocus
                      rows={2}
                      placeholder="Add notes for this itinerary..."
                      className="w-full text-sm text-stone-600 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#da7b4a]/50 resize-none min-h-[40px] max-h-[80px] overflow-y-auto"
                    />
                  ) : (
                    <div
                      onClick={() => { setEditingItineraryNotes(true); setItineraryNotesValue(activeItinerary?.notes || ""); }}
                      className={`text-sm px-2 py-1 rounded-lg cursor-text whitespace-pre-wrap transition-colors border border-stone-300 min-h-[40px] ${
                        activeItinerary?.notes
                          ? "text-stone-600"
                          : "text-stone-300 italic hover:bg-stone-50"
                      }`}
                      title="Click to edit itinerary notes (shown in the Pocket Guide)"
                    >
                      {activeItinerary?.notes || "Add notes for this itinerary..."}
                    </div>
                  )}
                </div>

                {/* Calendar View label + month range — bottom-right corner of the info area */}
                <div className="flex-shrink-0 text-right ml-auto self-end">
                  <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-0.5">Calendar View</div>
                  <div className="text-sm font-medium text-stone-400 tracking-wide">{getCalendarTitle()}</div>
                </div>
              </div>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 border-b border-stone-200/60" style={{ background: "rgba(245, 240, 232, 0.6)" }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-[10px] font-semibold text-stone-400 uppercase tracking-widest"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {weeks.map((week, wi) => {
              return (
                <div key={wi}>
                  <div className="grid grid-cols-7">
                    {week.map((date) => {
                      const dateKey = formatDateKey(date);
                      const inRange = effectiveStart && effectiveEnd && isInRange(date, effectiveStart, effectiveEnd);
                      const isStart = dateKey === effectiveStart;
                      const isEnd = dateKey === effectiveEnd;
                      const isToday = dateKey === today;
                      const dayData = days[dateKey];
                      const dayActivities = dayData ? (activities[dayData.id] || []) : [];
                      const isSelected = selectedDay === dateKey;

                      return (
                        <div
                          key={dateKey}
                          className={`
                            relative p-1.5 border-r-2 border-b-2 border-stone-300/70 last:border-r-0 rounded-lg
                            transition-colors duration-200 flex flex-col
                            ${inRange ? "min-h-[100px] bg-[#da7b4a]/[0.15]" : "min-h-[80px] bg-stone-50/30 hover:bg-stone-50/60"}
                            ${isStart ? "bg-[#da7b4a]/[0.32]" : ""}
                            ${isEnd ? "bg-[#da7b4a]/[0.32]" : ""}
                          `}
                          onMouseEnter={() => { setHoveredDay(dateKey); handleMouseEnter(dateKey); }}
                          onMouseLeave={() => setHoveredDay(null)}
                          onMouseDown={(e) => handleMouseDown(dateKey, e)}
                          onClick={() => { if (inRange) setSelectedDay(dateKey); }}
                          style={inRange ? { cursor: "pointer" } : undefined}
                        >
                          {/* Date number + hover add button — entire row clickable to open day detail */}
                          <div
                            className="flex items-center justify-between mb-0.5 cursor-pointer"
                            onClick={(e) => { if (inRange) { e.stopPropagation(); setSelectedDay(dateKey); } }}
                          >
                            <span
                              className={`
                                text-xs font-medium leading-none
                                ${isToday ? "bg-[#da7b4a] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px]" : ""}
                                ${inRange && !isToday ? "text-stone-800" : "text-stone-400"}
                              `}
                            >
                              {date.getDate()}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {(isStart || isEnd) && (
                                <span className="text-stone-400 cursor-ew-resize text-[10px] font-bold" title={`Drag to adjust trip ${isStart ? "start" : "end"}`} onClick={(e) => e.stopPropagation()}>{"\u27F7"}</span>
                              )}
                              {inRange && (
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-stone-400 hover:text-[#da7b4a] hover:bg-[#da7b4a]/10 transition-all ${hoveredDay === dateKey ? "opacity-100" : "opacity-0"}`}
                                  title="View day details"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Day Header — inline editable */}
                          {inRange && (
                            <div className="pb-1 mb-1 border-b border-stone-400/60 flex items-center min-h-[18px]">
                              {editingDayHeader === dateKey ? (
                                <input
                                  type="text"
                                  value={dayHeaderValue}
                                  onChange={(e) => setDayHeaderValue(e.target.value)}
                                  onBlur={() => saveDayHeader(dateKey)}
                                  onKeyDown={(e) => { if (e.key === "Enter") saveDayHeader(dateKey); if (e.key === "Escape") setEditingDayHeader(null); }}
                                  autoFocus
                                  placeholder="Day title..."
                                  className="w-full text-[10px] font-semibold px-1 py-0.5 border border-stone-300 rounded text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#da7b4a]"
                                />
                              ) : (
                                <div
                                  onClick={(e) => { e.stopPropagation(); setEditingDayHeader(dateKey); setDayHeaderValue(dayData?.title || ""); }}
                                  className={`w-full text-[10px] font-semibold px-1 py-0.5 cursor-text truncate min-h-[16px] ${
                                    dayData?.title ? "text-stone-700" : "text-transparent"
                                  }`}
                                  title={dayData?.title || "Click to add day title"}
                                >
                                  {dayData?.title || ""}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Events area — sorted: timed first chronologically, then untimed */}
                          <div className="flex-1 space-y-0.5 overflow-hidden">
                            {(() => {
                              const flightsArr = getFlightsOnDate(dateKey).map(f => ({ ...f, _type: "flight", _time: f.departure_time || null, _name: `${f.departure_airport}\u2192${f.arrival_airport}` }));
                              const acts = getScheduledActivities(dateKey).map(a => ({ ...a, _type: "activity", _time: a.start_time || null, _name: a.name }));
                              const dining = getScheduledDining(dateKey).map(d => ({ ...d, _type: "dining", _time: d.start_time || null, _name: d.name }));
                              const transport = getScheduledTransport(dateKey).map(t => {
                                const isReturnT = t.arrival_date === dateKey && t.departure_date !== dateKey;
                                return { ...t, _type: "transportation", _isReturn: isReturnT, _time: isReturnT ? (t.arrival_time || null) : (t.departure_time || null), _name: `${isReturnT ? "\u21A9 " : ""}${t.name}` };
                              });

                              // Day events (activities from the day detail card)
                              const dayEvts = dayActivities.map(a => ({ ...a, _type: "dayEvent", _time: a.start_time?.slice(0,5) || null, _name: a.title }));

                              const allEvents = [...flightsArr, ...acts, ...dining, ...transport, ...dayEvts];
                              const timed = allEvents.filter(e => e._time).sort((a, b) => a._time.localeCompare(b._time));
                              const untimed = allEvents.filter(e => !e._time);

                              // Apply saved untimed order from dayData
                              const savedOrder = dayData?.untimed_order;
                              if (savedOrder && Array.isArray(savedOrder)) {
                                untimed.sort((a, b) => {
                                  const aKey = a.id ? `${a._type === "dayEvent" ? "user" : a._type}-${a.id}` : null;
                                  const bKey = b.id ? `${b._type === "dayEvent" ? "user" : b._type}-${b.id}` : null;
                                  const aIdx = aKey ? savedOrder.indexOf(aKey) : -1;
                                  const bIdx = bKey ? savedOrder.indexOf(bKey) : -1;
                                  if (aIdx === -1 && bIdx === -1) return 0;
                                  if (aIdx === -1) return 1;
                                  if (bIdx === -1) return -1;
                                  return aIdx - bIdx;
                                });
                              }

                              const sorted = [...untimed, ...timed];

                              const colorMap = {
                                flight: `${CATEGORY_COLORS.flight.bgMedium} ${CATEGORY_COLORS.flight.text}`,
                                activity: `${CATEGORY_COLORS.activity.bgMedium} ${CATEGORY_COLORS.activity.text}`,
                                dayEvent: `${CATEGORY_COLORS.dayEvent.bgMedium} ${CATEGORY_COLORS.dayEvent.text}`,
                                dining: `${CATEGORY_COLORS.dining.bgMedium} ${CATEGORY_COLORS.dining.text}`,
                                transportation: `${CATEGORY_COLORS.transportation.bgMedium} ${CATEGORY_COLORS.transportation.text}`,
                              };
                              const iconMap = {
                                flight: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" /></svg>,
                                activity: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>,
                                dining: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z" /></svg>,
                                transportation: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
                                dayEvent: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path d="M5.127 3.502 5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502ZM1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5ZM3.25 6.5c-.04 0-.082 0-.123.002A2.25 2.25 0 0 1 5.25 5h9.5c.98 0 1.814.627 2.123 1.502a3.819 3.819 0 0 0-.123-.002H3.25Z" /></svg>,
                              };

                              return sorted.map((evt, i) => (
                                <div
                                  key={`${evt._type}-${i}`}
                                  className={`flex items-center gap-0.5 ${colorMap[evt._type]} rounded px-1 py-0.5 cursor-pointer hover:brightness-95 transition-all`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setEventPopup({ type: evt._type, data: evt, dateKey, rect });
                                  }}
                                >
                                  {iconMap[evt._type]}
                                  <span className="text-[10px] font-medium truncate">
                                    {evt._time ? `${formatTime12hShared(evt._time.slice(0,5))} ` : ""}{evt._name}
                                  </span>
                                </div>
                              ));
                            })()}

                          </div>

                          {/* Reserved stay row — always present for stable layout */}
                          {inRange && (() => {
                            const accoms = getScheduledAccommodations(dateKey);
                            return (
                              <div className="mt-auto pt-1.5">
                                <div className="border-t border-stone-400/60 pt-1 min-h-[20px]">
                                  {accoms.length > 0 ? accoms.map((a) => {
                                    const isCheckIn = a.check_in_date === dateKey;
                                    const isCheckOut = a.check_out_date && (() => {
                                      // check-out date is the day AFTER the last night
                                      const coDate = new Date(a.check_out_date + "T00:00:00");
                                      coDate.setDate(coDate.getDate());
                                      return formatDateKey(coDate) === dateKey || dateKey === a.check_out_date;
                                    })();
                                    return (
                                      <div
                                        key={a.id}
                                        className="flex items-center gap-0.5 bg-sky-100/80 text-sky-700 rounded px-1 py-0.5 cursor-pointer hover:brightness-95 transition-all"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setEventPopup({ type: "accommodation", data: a, dateKey, rect });
                                        }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0">
                                          <path d="M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z" />
                                        </svg>
                                        <span className="text-[10px] font-medium truncate">
                                          {isCheckIn ? "↓ " : ""}{a.name}
                                        </span>
                                      </div>
                                    );
                                  }) : (
                                    <div className="h-[14px]" />
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-[#da7b4a]/40 relative" style={{ background: "rgba(255,255,255,0.5)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 text-[#da7b4a]/60">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-stone-700 mb-1">No trip dates yet</h3>
            <p className="text-stone-500 text-sm mb-4">Set the start and end dates to see the calendar and start planning.</p>
            <div className="relative inline-block">
              <button
                onClick={() => setEditingItineraryDates(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#da7b4a] text-white font-semibold text-sm hover:bg-[#b5552a] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Set trip dates
              </button>
              {editingItineraryDates && (
                <DateRangePicker
                  startDate={effectiveStart || null}
                  endDate={effectiveEnd || null}
                  onSave={handleDatePickerSave}
                  onCancel={() => setEditingItineraryDates(false)}
                />
              )}
            </div>
          </div>
        )}

        {/* ═══ COMBINED ANGLED-TAB MODULES ═══
              File-folder-style tabs: right-leaning, vertical labels.
              Active tab straightens to vertical and lifts forward. */}
        {/* Tab strip overlaps the calendar's bottom edge so the tabs read
            as folders sticking up out of the calendar drawer. The calendar
            always shows a partial trailing week beyond the trip dates, so
            the overlap covers visual chrome rather than meaningful content. */}
        <div className="trip-tabs-wrap" style={{ marginTop: -28, position: "relative", zIndex: 20 }}>
          <style jsx>{`
            .trip-tabs-row { display: flex; align-items: flex-end; padding-left: 14px; height: 152px; position: relative; z-index: 2; }
            .trip-tab {
              width: 64px; height: 144px;
              background: #e2c8b0;
              border: 1px solid rgba(120,80,50,0.25);
              border-bottom: none;
              border-radius: 9px 9px 0 0;
              transform: rotate(8deg) translateY(0);
              transform-origin: bottom center;
              transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, border-width 0.18s ease;
              display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
              gap: 8px; padding: 10px 4px 14px; cursor: pointer;
              margin-right: -10px; box-sizing: border-box;
              position: relative; z-index: 1;
              flex-shrink: 0;
            }
            .trip-tab:hover { background: #ecd6bf; z-index: 3; }
            .trip-tab.active {
              background: #fefcf5;
              border-top: 4px solid #da7b4a;
              border-left: 2.5px solid #da7b4a;
              border-right: 2.5px solid #da7b4a;
              border-bottom: none;
              transform: rotate(0deg) translateY(-3px);
              z-index: 6;
              box-shadow: 0 -3px 10px rgba(218,123,74,0.22);
            }
            .trip-tab .tab-icon {
              width: 22px; height: 22px; flex-shrink: 0;
              color: rgba(42,31,20,0.75); stroke: currentColor;
            }
            .trip-tab.active .tab-icon { color: #2a1f14; }
            .trip-tab .tab-label {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
              font-family: "Oswald", sans-serif;
              font-size: 12.5px; letter-spacing: 0.06em;
              text-transform: uppercase; font-weight: 600;
              color: rgba(42,31,20,0.65);
              line-height: 1; white-space: nowrap;
              flex: 0 0 auto;
              align-self: center;
            }
            .trip-tab.active .tab-label { color: #2a1f14; }
            .trip-tab-content {
              background: #fefcf5;
              border: 1px solid rgba(180,165,140,0.55);
              border-radius: 0 8px 8px 8px;
              padding: 18px 14px 10px;
              height: 720px;
              overflow-y: auto;
              position: relative;
              z-index: 4;
              margin-top: -10px;
            }
          `}</style>
          <div className="trip-tabs-row">
            {[
              { key: "flights",        label: "Flights" },
              { key: "accommodations", label: "Stays" },
              { key: "activities",     label: "Activities" },
              { key: "dining",         label: "Dining" },
              { key: "transportation", label: "Transport" },
              { key: "map",            label: "Map" },
              { key: "budget",         label: "Budget" },
              { key: "checklist",      label: "Checklist" },
              { key: "packing",        label: "Packing" },
              { key: "documents",      label: "Resources" },
              { key: "collaborators",  label: "Travelers" },
            ].map((tab) => {
              const isActive = activeItineraryTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveItineraryTab(tab.key)}
                  className={`trip-tab ${isActive ? "active" : ""}`}
                  title={tab.label}
                >
                  <TabIcon kind={tab.key} />
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content — single panel container; only the active panel shows */}
          <div className="trip-tab-content">
            <div style={{ display: activeItineraryTab === "flights" ? "block" : "none" }}>
              <FlightOptions
                tripId={trip?.id}
                tripStart={trip?.start_date}
                tripEnd={trip?.end_date}
                onFlightOptionsChange={setFlightOptions}
                itinerarySelections={itinerarySelections}
                activeItineraryId={activeItineraryId}
                onToggleSelection={toggleSelection}
              />
            </div>
            <div style={{ display: activeItineraryTab === "accommodations" ? "block" : "none" }}>
              <AccommodationOptions
                tripId={trip?.id}
                tripStart={trip?.start_date}
                tripEnd={trip?.end_date}
                onAccommodationOptionsChange={setAccommodationOptions}
                itinerarySelections={itinerarySelections}
                activeItineraryId={activeItineraryId}
                onToggleSelection={toggleSelection}
              />
            </div>
            <div style={{ display: activeItineraryTab === "activities" ? "block" : "none" }}>
              <ActivityOptions
                tripId={trip?.id}
                tripStart={trip?.start_date}
                tripEnd={trip?.end_date}
                onActivityOptionsChange={setActivityOptions}
                itinerarySelections={itinerarySelections}
                activeItineraryId={activeItineraryId}
                onToggleSelection={toggleSelection}
              />
            </div>
            <div style={{ display: activeItineraryTab === "dining" ? "block" : "none" }}>
              <DiningOptions
                tripId={trip?.id}
                tripStart={trip?.start_date}
                tripEnd={trip?.end_date}
                onDiningOptionsChange={setDiningOptions}
                itinerarySelections={itinerarySelections}
                activeItineraryId={activeItineraryId}
                onToggleSelection={toggleSelection}
              />
            </div>
            <div style={{ display: activeItineraryTab === "transportation" ? "block" : "none" }}>
              <TransportationOptions
                tripId={trip?.id}
                tripStart={trip?.start_date}
                tripEnd={trip?.end_date}
                onTransportationOptionsChange={setTransportOptions}
                itinerarySelections={itinerarySelections}
                activeItineraryId={activeItineraryId}
                onToggleSelection={toggleSelection}
              />
            </div>
            <div style={{ display: activeItineraryTab === "budget" ? "block" : "none" }}>
              <BudgetTracker
                tripId={trip?.id}
                numTravelers={itineraryTravelerCount}
                flightOptions={flightOptions}
                activityOptions={activityOptions}
                accommodationOptions={accommodationOptions}
                diningOptions={diningOptions}
                transportOptions={transportOptions}
                itinerarySelections={itinerarySelections}
              />
            </div>
            <div style={{ display: activeItineraryTab === "map" ? "block" : "none" }}>
              {/* Mount TripMap only while its tab is active. Leaflet can't
                  measure its container when it's display:none on first mount,
                  which would leave it blank until a hard reload. */}
              {activeItineraryTab === "map" && (
                <TripMap
                  tripDestination={trip?.destination}
                  tripStart={trip?.start_date}
                  tripEnd={trip?.end_date}
                  flightOptions={flightOptions}
                  accommodationOptions={accommodationOptions}
                  activityOptions={activityOptions}
                  diningOptions={diningOptions}
                  transportOptions={transportOptions}
                  itinerarySelections={itinerarySelections}
                />
              )}
            </div>
            <div style={{ display: activeItineraryTab === "checklist" ? "block" : "none" }}>
              <PlanningChecklist tripId={trip?.id} />
            </div>
            <div style={{ display: activeItineraryTab === "packing" ? "block" : "none" }}>
              <PackingList
                tripId={trip?.id}
                tripDestination={trip?.destination}
                tripStartDate={trip?.start_date}
                tripEndDate={trip?.end_date}
                activityOptions={activityOptions}
                accommodationOptions={accommodationOptions}
              />
            </div>
            <div style={{ display: activeItineraryTab === "documents" ? "block" : "none" }}>
              <TravelDocuments tripId={trip?.id} />
            </div>
            <div style={{ display: activeItineraryTab === "collaborators" ? "block" : "none" }}>
              <TripTravelers
                tripId={trip?.id}
                tripTitle={trip?.title}
                userId={currentUser?.id}
                userEmail={currentUser?.email}
                tripOwnerId={trip?.user_id}
                itineraries={itineraries}
                activeItineraryId={activeItineraryId}
                onTravelersChange={() => setTravelersRefreshKey((k) => k + 1)}
              />
            </div>
          </div>
        </div>

        {/* Day Detail Popout */}
        {selectedDay && (
          <DayPopout
            dateKey={selectedDay}
            tripId={trip?.id}
            tripStart={effectiveStart}
            dayData={days[selectedDay]}
            activities={days[selectedDay] ? (activities[days[selectedDay].id] || []) : []}
            inRange={effectiveStart && effectiveEnd && selectedDay >= effectiveStart && selectedDay <= effectiveEnd}
            onClose={() => setSelectedDay(null)}
            onUpdate={loadTrip}
            calendarEvents={{
              flights: getFlightsOnDate(selectedDay),
              activities: getScheduledActivities(selectedDay),
              dining: getScheduledDining(selectedDay),
              transport: getScheduledTransport(selectedDay),
              accommodations: getScheduledAccommodations(selectedDay),
            }}
            activeItineraryId={activeItineraryId}
          />
        )}
        {eventPopup && (
          <EventPopup
            type={eventPopup.type}
            data={eventPopup.data}
            dateKey={eventPopup.dateKey}
            rect={eventPopup.rect}
            onClose={() => setEventPopup(null)}
            onUpdate={loadTrip}
          />
        )}
      </main>
      <footer className="relative z-10 text-center text-xs text-stone-400 py-4">v3.1.0 — Apr 17 2026</footer>
    </div>
  );
}

function EventPopup({ type, data, dateKey, rect, onClose, onUpdate }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(data.notes || "");

  const TABLE_MAP = {
    flight: "flight_options",
    activity: "activity_options",
    dining: "dining_options",
    transportation: "transportation_options",
    accommodation: "accommodation_options",
    dayEvent: "activities",
  };

  async function saveNotes() {
    setEditingNotes(false);
    const newNotes = notesValue.trim() || null;
    if (newNotes === (data.notes || null)) return;
    const table = TABLE_MAP[type];
    if (!table) return;
    // For flights, notes live on the parent option, not the leg
    const recordId = type === "flight" ? data._optionId : data.id;
    if (!recordId) return;
    await supabase.from(table).update({ notes: newNotes }).eq("id", recordId);
    if (onUpdate) onUpdate();
  }

  const colors = {
    flight: { bg: CATEGORY_COLORS.flight.bg, border: CATEGORY_COLORS.flight.border, text: CATEGORY_COLORS.flight.text, label: "Flight" },
    activity: { bg: CATEGORY_COLORS.activity.bg, border: CATEGORY_COLORS.activity.border, text: CATEGORY_COLORS.activity.text, label: "Activity" },
    accommodation: { bg: CATEGORY_COLORS.accommodation.bg, border: CATEGORY_COLORS.accommodation.border, text: CATEGORY_COLORS.accommodation.text, label: "Stay" },
    dining: { bg: CATEGORY_COLORS.dining.bg, border: CATEGORY_COLORS.dining.border, text: CATEGORY_COLORS.dining.text, label: "Dining" },
    transportation: { bg: CATEGORY_COLORS.transportation.bg, border: CATEGORY_COLORS.transportation.border, text: CATEGORY_COLORS.transportation.text, label: "Transportation" },
  };
  const c = colors[type] || colors.activity;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className={`absolute ${c.bg} ${c.border} border rounded-xl shadow-lg p-4 w-72 z-50`}
        style={{ top: Math.min(rect.bottom + 4, window.innerHeight - 250), left: Math.min(rect.left, window.innerWidth - 300) }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${c.text}`}>{c.label}</span>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm">&#x2715;</button>
        </div>
        {/* Title */}
        {type === "flight" ? (
          <div className="text-sm font-semibold text-stone-800 mb-1">
            {data.airline_name || data.airline_code || ""}{data.flight_number ? ` ${data.flight_number}` : ""}
            {!data.airline_name && !data.airline_code && !data.flight_number && `${data.departure_airport} \u2192 ${data.arrival_airport}`}
          </div>
        ) : (
          <div className="text-sm font-semibold text-stone-800 mb-1">{data.name || data.title || ""}</div>
        )}
        {/* Flight departure/arrival details */}
        {type === "flight" && data.departure_airport && (
          <div className="space-y-1 mb-1">
            <div className="flex items-center text-xs gap-3">
              <span className="font-medium text-stone-600 w-10">{data.departure_airport}</span>
              <span className="text-stone-400 w-12">Depart</span>
              <span className="text-stone-500">{data.departure_time ? formatTime12hShared(data.departure_time.slice(0,5)) : "—"}</span>
            </div>
            {data.arrival_airport && (
              <div className="flex items-center text-xs gap-3">
                <span className="font-medium text-stone-600 w-10">{data.arrival_airport}</span>
                <span className="text-stone-400 w-12">Arrive</span>
                <span className="text-stone-500">{data.arrival_time ? formatTime12hShared(data.arrival_time.slice(0,5)) : "—"}</span>
              </div>
            )}
          </div>
        )}
        {/* Non-flight: departure date */}
        {type !== "flight" && data.departure_date && (
          <div className="text-xs text-stone-500">{new Date(data.departure_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
        )}
        {/* Non-flight: departure/arrival time */}
        {type !== "flight" && data.departure_time && (() => {
          if (type === "transportation" && (data.pickup_location || data.dropoff_location)) {
            const t = data._isReturn ? data.arrival_time : data.departure_time;
            return t ? <div className="text-xs text-stone-500">{formatTime12hShared(t.slice(0,5))}</div> : null;
          }
          return (
            <div className="text-xs text-stone-500">
              {formatTime12hShared(data.departure_time.slice(0,5))}
              {data.arrival_time && ` \u2013 ${formatTime12hShared(data.arrival_time.slice(0,5))}`}
            </div>
          );
        })()}
        {(data.start_time || data.scheduled_date) && (
          <div className="text-xs text-stone-500">
            {data.start_time && formatTime12hShared(data.start_time.slice(0,5))}
            {data.end_time && ` \u2013 ${formatTime12hShared(data.end_time.slice(0,5))}`}
          </div>
        )}
        {/* Car rental: show pickup or dropoff location based on which day this is */}
        {type === "transportation" && (data.pickup_location || data.dropoff_location) && (() => {
          const loc = data._isReturn ? data.dropoff_location : data.pickup_location;
          const label = data._isReturn ? "Drop-off" : "Pick-up";
          if (!loc) return null;
          return (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1 flex items-center gap-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline-block w-3 h-3 mr-1 flex-shrink-0"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9.5A7 7 0 1 0 3 9.5c0 2.993 1.698 5.488 3.355 7.084a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" /></svg> {label}: {loc}
            </a>
          );
        })()}
        {/* Generic location — skip for transport with pickup/dropoff */}
        {!(type === "transportation" && (data.pickup_location || data.dropoff_location)) && (data.address || data.location) && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || data.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1 flex items-center gap-1 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline-block w-3 h-3 mr-1 flex-shrink-0"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9.5A7 7 0 1 0 3 9.5c0 2.993 1.698 5.488 3.355 7.084a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" /></svg> {data.address || data.location}
          </a>
        )}
        {!(type === "transportation" && (data.pickup_location || data.dropoff_location)) && data.location_name && !data.address && !data.location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location_name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1 flex items-center gap-1 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline-block w-3 h-3 mr-1 flex-shrink-0"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9.5A7 7 0 1 0 3 9.5c0 2.993 1.698 5.488 3.355 7.084a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" /></svg> {data.location_name}
          </a>
        )}
        {data.check_in_date && data.check_out_date && (
          <div className="text-xs text-stone-500 mt-1">
            {new Date(data.check_in_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash; {new Date(data.check_out_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
        {type !== "accommodation" && data.total_price && <div className="text-xs text-stone-500 mt-1">${Number(data.total_price).toLocaleString()}</div>}
        {/* Inline-editable notes */}
        <div className="mt-2">
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">Notes</div>
          {editingNotes ? (
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={saveNotes}
              onKeyDown={(e) => { if (e.key === "Escape") { setNotesValue(data.notes || ""); setEditingNotes(false); } }}
              autoFocus
              rows={3}
              placeholder="Add notes..."
              className="w-full text-xs text-stone-600 bg-white border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent resize-none"
            />
          ) : (
            <div
              onClick={(e) => { e.stopPropagation(); setEditingNotes(true); }}
              className={`text-xs rounded-lg px-2 py-1.5 cursor-text border border-stone-200/60 min-h-[32px] transition-colors hover:border-stone-300 ${
                notesValue ? "text-stone-500 italic" : "text-stone-300 italic"
              }`}
            >
              {notesValue || "Add notes..."}
            </div>
          )}
        </div>
        {/* Sources */}
        {(data.source_url || data.screenshot_url) && (
          <div className="mt-2 pt-2 border-t border-stone-200/60">
            <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1">Sources</div>
            <div className="flex items-center gap-2">
              {data.source_url && (
                <a
                  href={data.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0"><path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" /><path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" /></svg>
                  {(() => { try { return new URL(data.source_url).hostname.replace("www.", ""); } catch { return "Source"; } })()}
                </a>
              )}
              {data.screenshot_url && (
                <button
                  type="button"
                  className="text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const w = window.open();
                    if (w) {
                      w.document.write(`<html><head><title>Screenshot</title><style>body{margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head><body><img src="${data.screenshot_url}" style="max-width:100%;max-height:100vh;object-fit:contain;"></body></html>`);
                      w.document.close();
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0"><path fillRule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0l-1.5 1.5-2-2a.5.5 0 0 0-.707 0l-2 2A.5.5 0 0 0 5 10.707V12h8V9.707h-.5ZM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" /></svg>
                  Screenshot
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CATEGORIES = [
  { value: "sightseeing", label: "Sightseeing", icon: "🏛️" },
  { value: "food", label: "Food & Dining", icon: "🍽️" },
  { value: "outdoors", label: "Outdoors", icon: "🌲" },
  { value: "transport", label: "Transport", icon: "🚌" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "nightlife", label: "Nightlife", icon: "🌙" },
  { value: "wellness", label: "Wellness", icon: "🧘" },
  { value: "task", label: "Task / Errand", icon: "📋" },
  { value: "other", label: "Other", icon: "📌" },
];

function getCategoryInfo(value) {
  return CATEGORIES.find((c) => c.value === value) || { value: "other", label: "Other", icon: "📌" };
}

// Tab icons — lucide-react, hand-tuned by the lucide team for visual
// uniformity across the whole set. Each icon ships as an SVG component
// with consistent stroke weight, optical sizing, and viewBox usage.
function TabIcon({ kind }) {
  const props = { className: "tab-icon", size: 22, strokeWidth: 1.6, "aria-hidden": true };
  switch (kind) {
    case "flights":        return <Plane {...props} />;
    case "accommodations": return <Bed {...props} />;
    case "activities":     return <Star {...props} />;
    case "dining":         return <UtensilsCrossed {...props} />;
    case "transportation": return <ArrowLeftRight {...props} />;
    case "map":            return <MapPin {...props} />;
    case "budget":         return <CircleDollarSign {...props} />;
    case "checklist":      return <ClipboardCheck {...props} />;
    case "packing":        return <Briefcase {...props} />;
    case "documents":      return <Folder {...props} />;
    case "collaborators":  return <Users {...props} />;
    default:               return null;
  }
}

function DayPopout({ dateKey, tripId, tripStart, dayData, activities, inRange, onClose, onUpdate, calendarEvents, activeItineraryId }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "cardFadeIn 0.2s ease-out" }}
      >
        <DayCardView
          dateKey={dateKey}
          tripStart={tripStart}
          inRange={inRange}
          dayData={dayData}
          userActivities={activities}
          calendarEvents={calendarEvents}
          canEdit={true}
          tripId={tripId}
          itineraryId={activeItineraryId}
          onClose={onClose}
          onRefresh={onUpdate}
        />
      </div>
    </div>
  );
}
