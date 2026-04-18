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
import BudgetTracker from "@/components/BudgetTracker";
import PlanningChecklist from "@/components/PlanningChecklist";
import PackingList from "@/components/PackingList";
import TravelDocuments from "@/components/TravelDocuments";
import MapPatternBg from "@/components/MapPatternBg";
import TripMap from "@/components/TripMap";
import TripCollaborators from "@/components/TripCollaborators";

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
  const [activeItineraryTab, setActiveItineraryTab] = useState("flights");
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const [eventPopup, setEventPopup] = useState(null); // { type, data, dateKey, rect }
  const [hoveredDay, setHoveredDay] = useState(null);
  const [editingDayHeader, setEditingDayHeader] = useState(null);
  const [dayHeaderValue, setDayHeaderValue] = useState("");
  // Itinerary state
  const [itineraries, setItineraries] = useState([]);
  const [activeItineraryId, setActiveItineraryId] = useState(null);
  const [editingItineraryTitle, setEditingItineraryTitle] = useState(null);
  const [itineraryTitleValue, setItineraryTitleValue] = useState("");
  const [editingItineraryDesc, setEditingItineraryDesc] = useState(false);
  const [itineraryDescValue, setItineraryDescValue] = useState("");
  const [editingCalendarTitle, setEditingCalendarTitle] = useState(false);
  const [calendarTitleValue, setCalendarTitleValue] = useState("");
  const [itinerarySelections, setItinerarySelections] = useState([]);
  const [editingItineraryTravelers, setEditingItineraryTravelers] = useState(false);
  const [itineraryTravelersValue, setItineraryTravelersValue] = useState("");
  const router = useRouter();
  const params = useParams();

  const loadTrip = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUser(user);

    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", params.id)
      .single();

    if (tripError || !tripData) {
      router.push("/trips");
      return;
    }

    setTrip(tripData);

    // Fetch itineraries for this trip
    const { data: itinerariesData, error: itinError } = await supabase
      .from("itineraries")
      .select("*")
      .eq("trip_id", params.id)
      .order("sort_order", { ascending: true });

    let itins = itinerariesData || [];

    // Auto-create a default itinerary if table exists but is empty
    if (!itinError && itins.length === 0) {
      const { data: newItin } = await supabase
        .from("itineraries")
        .insert({
          trip_id: params.id,
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
          const { data: selected } = await supabase.from(table).select("id").eq("trip_id", params.id).eq("is_selected", true);
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

    // Fetch days keyed by date
    const { data: daysData } = await supabase
      .from("days")
      .select("*")
      .eq("trip_id", params.id);

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
      .eq("id", params.id);

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

    await supabase.from("trips").update(updates).eq("id", params.id);
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
        trip_id: params.id,
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
    }
  }

  async function switchItinerary(id) {
    setActiveItineraryId(id);
    const { data: selectionsData } = await supabase
      .from("itinerary_selections")
      .select("*")
      .eq("itinerary_id", id);
    setItinerarySelections(selectionsData || []);
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

  async function saveItineraryDescription() {
    if (!activeItineraryId) return;
    const val = itineraryDescValue.trim();
    await supabase.from("itineraries").update({ description: val || null }).eq("id", activeItineraryId);
    setItineraries((prev) => prev.map((i) => i.id === activeItineraryId ? { ...i, description: val || null } : i));
    setEditingItineraryDesc(false);
  }

  async function saveItineraryTravelers() {
    if (!activeItineraryId) return;
    const val = Math.max(1, parseInt(itineraryTravelersValue) || 1);
    await supabase.from("itineraries").update({ num_travelers: val }).eq("id", activeItineraryId);
    setItineraries((prev) => prev.map((i) => i.id === activeItineraryId ? { ...i, num_travelers: val } : i));
    setEditingItineraryTravelers(false);
  }

  async function deleteItinerary(id) {
    if (itineraries.length <= 1) return;
    if (!confirm("Delete this itinerary version?")) return;
    await supabase.from("itineraries").delete().eq("id", id);
    const remaining = itineraries.filter((i) => i.id !== id);
    setItineraries(remaining);
    if (activeItineraryId === id && remaining.length > 0) {
      switchItinerary(remaining[0].id);
    }
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
      // For flights: only one can be selected per itinerary — remove others first
      if (optionType === "flight") {
        const otherFlights = itinerarySelections.filter((s) => s.option_type === "flight");
        if (otherFlights.length > 0) {
          const idsToRemove = otherFlights.map((s) => s.id);
          await supabase.from("itinerary_selections").delete().in("id", idsToRemove);
          setItinerarySelections((prev) => prev.filter((s) => s.option_type !== "flight"));
        }
      }
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
      await supabase.from("days").update({ title: dayHeaderValue || null }).eq("id", existing.id);
    } else if (dayHeaderValue.trim()) {
      await supabase.from("days").insert({ trip_id: params.id, date: dateKey, title: dayHeaderValue || null });
    }
    setEditingDayHeader(null);
    setDayHeaderValue("");
    loadTrip();
  }

  // Get flights on a given date — filtered by itinerary selections
  function getFlightsOnDate(dateKey) {
    // Find the flight option selected in this itinerary
    const selectedFlightIds = itinerarySelections
      .filter((s) => s.option_type === "flight")
      .map((s) => s.option_id);
    const selectedOpt = flightOptions.find((o) => selectedFlightIds.includes(o.id));
    if (!selectedOpt) return [];
    return (selectedOpt.flight_legs || []).filter((leg) => leg.departure_date === dateKey);
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

  // Update itinerary date range in database
  async function updateItineraryDates(newStart, newEnd) {
    if (!activeItineraryId) return;
    await supabase
      .from("itineraries")
      .update({ start_date: newStart, end_date: newEnd })
      .eq("id", activeItineraryId);
    setItineraries((prev) => prev.map((i) =>
      i.id === activeItineraryId ? { ...i, start_date: newStart, end_date: newEnd } : i
    ));
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
    return (
      <div className="flex min-h-screen items-center justify-center relative" style={{ background: "linear-gradient(to bottom, rgba(210,195,172,0.7) 0%, rgba(222,210,190,0.6) 50%, rgba(210,195,172,0.7) 100%)" }}>
        <MapPatternBg tileSize={280} opacity={1} />
        <div className="text-center relative z-10">
          <div className="w-8 h-8 mx-auto mb-4 border-[3px] border-stone-400 border-t-[#da7b4a] rounded-full animate-spin" />
          <p className="text-stone-500 text-sm font-medium tracking-wide">Loading trip...</p>
        </div>
      </div>
    );
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
        {/* Logo + Back button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img src="/TRIPCRAFTLOGO.png" alt="TripCraft" style={{ height: 150, width: "auto" }} />
          </div>
          <Link
            href="/trips"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-stone-600 transition-all hover:ring-2 hover:ring-[#da7b4a]/40"
            style={{
              background: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(180, 165, 140, 0.4)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
            Back to Trips
          </Link>
        </div>

        {/* Trip Header with inline editing */}
        <div className="mb-8 space-y-2">
          {/* Title */}
          <div className="flex items-center gap-2 group">
            {editingField === "title" ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveField("title")}
                onKeyDown={(e) => handleFieldKeyDown(e, "title")}
                autoFocus
                className="text-3xl font-bold text-sky-900 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full max-w-xl"
              />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-sky-900">{trip.title}</h1>
                <button
                  onClick={() => startEditing("title")}
                  className="text-stone-400 hover:text-[#da7b4a] opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit title"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2 group">
            {editingField === "destination" ? (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveField("destination")}
                  onKeyDown={(e) => handleFieldKeyDown(e, "destination")}
                  autoFocus
                  placeholder="Enter destination"
                  className="text-slate-500 bg-white border border-sky-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-stone-500">
                  <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {trip.destination || <span className="italic text-stone-400">No destination set</span>}
                </div>
                <button
                  onClick={() => startEditing("destination")}
                  className="text-stone-400 hover:text-[#da7b4a] opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit destination"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                </button>
              </>
            )}
          </div>

        </div>

        {/* ═══ ITINERARY VERSION TABS ═══ */}
        {itineraries.length > 0 && (
          <div className="flex items-end gap-0.5 -mb-px relative z-10">
            {itineraries.map((itin) => {
              const isActive = itin.id === activeItineraryId;
              return (
                <div
                  key={itin.id}
                  className={`relative flex items-center gap-1.5 px-5 py-2.5 rounded-t-xl text-sm font-semibold cursor-pointer transition-all ${
                    isActive ? "text-white" : "text-stone-600 hover:text-stone-800"
                  }`}
                  style={{
                    background: isActive ? "#da7b4a" : "rgba(195,178,155,0.35)",
                    borderTop: isActive ? "2px solid #b5552a" : "1px solid rgba(180,165,140,0.3)",
                    borderLeft: isActive ? "1px solid #b5552a" : "1px solid rgba(180,165,140,0.3)",
                    borderRight: isActive ? "1px solid #b5552a" : "1px solid rgba(180,165,140,0.3)",
                    borderBottom: isActive ? "none" : "1px solid rgba(180,165,140,0.3)",
                  }}
                  onClick={() => switchItinerary(itin.id)}
                >
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
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingItineraryTitle(itin.id);
                        setItineraryTitleValue(itin.title);
                      }}
                      title="Double-click to rename"
                    >
                      {itin.title}
                    </span>
                  )}
                  {/* Delete button — only if more than 1 itinerary */}
                  {itineraries.length > 1 && isActive && editingItineraryTitle !== itin.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItinerary(itin.id); }}
                      className="ml-1 w-4 h-4 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                      title="Delete itinerary"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={createItinerary}
              className="flex items-center gap-1 px-3 py-2 mb-px rounded-t-lg text-xs font-semibold text-stone-400 hover:text-[#da7b4a] transition-all"
              style={{ border: "1px dashed rgba(180,165,140,0.4)", borderBottom: "none" }}
              title="Create new itinerary version"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>
              New
            </button>
          </div>
        )}

        {/* ═══ CALENDAR ═══ */}
        {calendarDates.length > 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden select-none uppercase">
            {/* Itinerary Info Row */}
            <div className="px-6 py-3 border-b border-stone-200/60 bg-white normal-case">
              <div className="flex items-start gap-6">
                {/* Left: Itinerary Name + Dates + Travelers */}
                <div className="flex-shrink-0 w-64">
                  {/* Itinerary Name — inline editable, fixed container */}
                  <div className="min-h-[32px]">
                    {editingCalendarTitle ? (
                      <input
                        type="text"
                        value={calendarTitleValue}
                        onChange={(e) => setCalendarTitleValue(e.target.value)}
                        onBlur={() => saveCalendarItineraryTitle()}
                        onKeyDown={(e) => { if (e.key === "Enter") saveCalendarItineraryTitle(); if (e.key === "Escape") setEditingCalendarTitle(false); }}
                        autoFocus
                        className="text-lg font-bold text-stone-800 bg-white border border-stone-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 w-64 min-h-[32px]"
                      />
                    ) : (
                      <div
                        onClick={() => { setEditingCalendarTitle(true); setCalendarTitleValue(activeItinerary?.title || "Itinerary 1"); }}
                        className="text-lg font-bold text-stone-800 cursor-text hover:text-[#da7b4a] transition-colors min-h-[32px] px-2 py-0.5"
                        title="Click to edit itinerary name"
                      >
                        {activeItinerary?.title || "Itinerary 1"}
                      </div>
                    )}
                  </div>
                  {/* Date range */}
                  {effectiveStart && effectiveEnd && (
                    <div className="text-xs text-stone-400 mt-0.5">
                      {new Date(effectiveStart + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      {" — "}
                      {new Date(effectiveEnd + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  )}
                  {/* Travelers */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {editingItineraryTravelers ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={itineraryTravelersValue}
                          onChange={(e) => setItineraryTravelersValue(e.target.value)}
                          onBlur={() => saveItineraryTravelers()}
                          onKeyDown={(e) => { if (e.key === "Enter") saveItineraryTravelers(); if (e.key === "Escape") setEditingItineraryTravelers(false); }}
                          autoFocus
                          className="w-12 text-xs text-stone-600 bg-white border border-stone-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50"
                        />
                        <span className="text-xs text-stone-400">travelers</span>
                      </div>
                    ) : (
                      <div
                        onClick={() => { setEditingItineraryTravelers(true); setItineraryTravelersValue(activeItinerary?.num_travelers || trip?.num_travelers || 1); }}
                        className="text-xs text-stone-400 cursor-text hover:text-[#da7b4a] transition-colors"
                        title="Click to edit travelers"
                      >
                        <svg className="w-3 h-3 inline mr-0.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {activeItinerary?.num_travelers || trip?.num_travelers || 1} traveler{(activeItinerary?.num_travelers || trip?.num_travelers || 1) > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Description — inline editable */}
                <div className="flex-1 min-w-0 min-h-[32px]">
                  {editingItineraryDesc ? (
                    <textarea
                      value={itineraryDescValue}
                      onChange={(e) => setItineraryDescValue(e.target.value)}
                      onBlur={() => saveItineraryDescription()}
                      onKeyDown={(e) => { if (e.key === "Escape") setEditingItineraryDesc(false); }}
                      autoFocus
                      rows={3}
                      placeholder="Add a description for this itinerary..."
                      className="w-full text-sm text-stone-600 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 resize-y min-h-[32px]"
                    />
                  ) : (
                    <div
                      onClick={() => { setEditingItineraryDesc(true); setItineraryDescValue(activeItinerary?.description || ""); }}
                      className={`text-sm px-2 py-1 rounded-lg cursor-text min-h-[32px] whitespace-pre-wrap transition-colors ${
                        activeItinerary?.description
                          ? "text-stone-600"
                          : "text-stone-300 italic hover:bg-stone-50"
                      }`}
                      title="Click to edit description"
                    >
                      {activeItinerary?.description || "Add itinerary description..."}
                    </div>
                  )}
                </div>

                {/* Far right: Calendar month range */}
                <div className="flex-shrink-0 text-sm font-medium text-stone-400 tracking-wide text-right self-center">
                  {getCalendarTitle()}
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
                        >
                          {/* Date number + hover add button */}
                          <div className="flex items-center justify-between mb-0.5">
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
                                <span className="text-stone-400 cursor-ew-resize text-[10px] font-bold" title={`Drag to adjust trip ${isStart ? "start" : "end"}`}>{"\u27F7"}</span>
                              )}
                              {inRange && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedDay(dateKey); }}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-stone-400 hover:text-[#da7b4a] hover:bg-[#da7b4a]/10 transition-all ${hoveredDay === dateKey ? "opacity-100" : "opacity-0"}`}
                                  title="Add event"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Day Header — inline editable */}
                          {inRange && (
                            <div className="mb-0.5">
                              {editingDayHeader === dateKey ? (
                                <input
                                  type="text"
                                  value={dayHeaderValue}
                                  onChange={(e) => setDayHeaderValue(e.target.value)}
                                  onBlur={() => saveDayHeader(dateKey)}
                                  onKeyDown={(e) => { if (e.key === "Enter") saveDayHeader(dateKey); if (e.key === "Escape") setEditingDayHeader(null); }}
                                  autoFocus
                                  placeholder="Day title..."
                                  className="w-full text-[10px] font-semibold px-1 py-0.5 border border-stone-300 rounded text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#da7b4a]"
                                />
                              ) : (
                                <div
                                  onClick={(e) => { e.stopPropagation(); setEditingDayHeader(dateKey); setDayHeaderValue(dayData?.title || ""); }}
                                  className={`text-[10px] font-semibold px-1 py-0.5 rounded cursor-text truncate min-h-[16px] bg-white/80 ${
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
                                return { ...t, _type: "transportation", _time: t.departure_time || null, _name: `${isReturnT ? "\u21A9 " : ""}${t.name}` };
                              });

                              const allEvents = [...flightsArr, ...acts, ...dining, ...transport];
                              const timed = allEvents.filter(e => e._time).sort((a, b) => a._time.localeCompare(b._time));
                              const untimed = allEvents.filter(e => !e._time);
                              const sorted = [...timed, ...untimed];

                              const colorMap = {
                                flight: "bg-emerald-100 text-emerald-700",
                                activity: "bg-yellow-100 text-yellow-700",
                                dining: "bg-orange-100 text-orange-700",
                                transportation: "bg-violet-100 text-violet-700",
                              };
                              const iconMap = {
                                flight: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" /></svg>,
                                activity: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path fillRule="evenodd" d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.147 0l4.084-1.69A1.5 1.5 0 0 0 18 14.75V3.873a1.5 1.5 0 0 0-2.074-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>,
                                dining: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z" /></svg>,
                                transportation: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
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
                                    {evt._time ? `${evt._time.slice(0,5)} ` : ""}{evt._name}
                                  </span>
                                </div>
                              ));
                            })()}

                          </div>

                          {/* Accommodation footer bar */}
                          {(() => {
                            const accoms = getScheduledAccommodations(dateKey);
                            if (accoms.length === 0) return null;
                            return (
                              <div className="mt-auto pt-0.5">
                                {accoms.map((a) => (
                                  <div
                                    key={a.id}
                                    className="flex items-center gap-0.5 bg-sky-100 text-sky-700 rounded px-1 py-0.5 cursor-pointer hover:brightness-95 transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setEventPopup({ type: "accommodation", data: a, dateKey, rect });
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 flex-shrink-0">
                                      <path d="M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z" />
                                    </svg>
                                    <span className="text-[10px] font-medium truncate">{a.name}</span>
                                  </div>
                                ))}
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
          <div className="text-center py-16 rounded-xl border border-stone-200" style={{ background: "rgba(255,255,255,0.4)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 text-stone-400/50">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-stone-600 mb-2">No dates set</h3>
            <p className="text-stone-400 text-sm">Edit your trip to add start and end dates.</p>
          </div>
        )}

        {/* ═══ ITINERARY TABS ═══ */}
        <div className="mt-8">
          <div className="flex gap-1 mb-0">
            {[
              { key: "flights", label: "Flights", color: "#059669", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" /></svg> },
              { key: "accommodations", label: "Accommodations", color: "#0284c7", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z" /></svg> },
              { key: "activities", label: "Activities", color: "#ca8a04", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.147 0l4.084-1.69A1.5 1.5 0 0 0 18 14.75V3.873a1.5 1.5 0 0 0-2.074-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg> },
              { key: "dining", label: "Dining", color: "#ea580c", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z" /></svg> },
              { key: "transportation", label: "Transportation", color: "#7c3aed", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveItineraryTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all ${
                  activeItineraryTab === tab.key
                    ? "text-stone-800"
                    : "text-stone-500 hover:text-stone-700"
                }`}
                style={{
                  background: activeItineraryTab === tab.key
                    ? "rgba(255,255,255,0.6)"
                    : "rgba(195,178,155,0.35)",
                  borderTop: activeItineraryTab === tab.key
                    ? `2px solid ${tab.color}`
                    : "2px solid transparent",
                  borderLeft: activeItineraryTab === tab.key
                    ? "1px solid rgba(180,165,140,0.3)"
                    : "1px solid rgba(180,165,140,0.15)",
                  borderRight: activeItineraryTab === tab.key
                    ? "1px solid rgba(180,165,140,0.3)"
                    : "1px solid rgba(180,165,140,0.15)",
                  borderBottom: activeItineraryTab === tab.key
                    ? "1px solid rgba(255,255,255,0.6)"
                    : "1px solid rgba(180,165,140,0.3)",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            {/* Budget tab — right-justified */}
            <button
              onClick={() => setActiveItineraryTab("budget")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all ml-auto ${
                activeItineraryTab === "budget"
                  ? "text-stone-800"
                  : "text-stone-500 hover:text-stone-700"
              }`}
              style={{
                background: activeItineraryTab === "budget"
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(195,178,155,0.35)",
                borderTop: activeItineraryTab === "budget"
                  ? "2px solid #b5552a"
                  : "2px solid transparent",
                borderLeft: activeItineraryTab === "budget"
                  ? "1px solid rgba(180,165,140,0.3)"
                  : "1px solid rgba(180,165,140,0.15)",
                borderRight: activeItineraryTab === "budget"
                  ? "1px solid rgba(180,165,140,0.3)"
                  : "1px solid rgba(180,165,140,0.15)",
                borderBottom: activeItineraryTab === "budget"
                  ? "1px solid rgba(255,255,255,0.6)"
                  : "1px solid rgba(180,165,140,0.3)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603c-.481.042-.89.19-1.15.412-.268.228-.348.486-.348.706 0 .345.181.636.578.899Z" /><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.517 1.517 0 0 0-.377-.482 2.28 2.28 0 0 0-.806-.372v2.264l.338.139c.49.202.95.44 1.305.774.373.352.628.806.628 1.399 0 .625-.323 1.15-.79 1.53a3.63 3.63 0 0 1-1.481.676v.316a.75.75 0 0 1-1.5 0v-.316a3.78 3.78 0 0 1-1.653-.713 3.166 3.166 0 0 1-.925-1.2.75.75 0 0 1 1.395-.55c.094.24.23.44.377.482.22.166.506.293.806.372V8.68l-.338-.14c-.49-.2-.95-.438-1.305-.773C6.345 7.415 6.1 6.961 6.1 6.368c0-.625.323-1.15.79-1.53a3.63 3.63 0 0 1 1.481-.676V3.846A.75.75 0 0 1 10 4.001Z" clipRule="evenodd" /></svg>
              Budget
            </button>
          </div>

          {/* Tab content */}
          <div
            className="rounded-b-xl rounded-tr-xl px-4 py-2"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(180,165,140,0.3)",
              borderTop: activeItineraryTab === "flights" ? "none" : "1px solid rgba(180,165,140,0.3)",
              minHeight: "200px",
            }}
          >
            <div style={{ display: activeItineraryTab === "flights" ? "block" : "none" }}>
              <FlightOptions
                tripId={params.id}
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
                tripId={params.id}
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
                tripId={params.id}
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
                tripId={params.id}
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
                tripId={params.id}
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
                tripId={params.id}
                numTravelers={activeItinerary?.num_travelers || trip?.num_travelers || 1}
                flightOptions={flightOptions}
                activityOptions={activityOptions}
                accommodationOptions={accommodationOptions}
                diningOptions={diningOptions}
                transportOptions={transportOptions}
                itinerarySelections={itinerarySelections}
              />
            </div>
          </div>
        </div>

        {/* ═══ LOWER MODULES — Collapsible Accordions ═══ */}
        <div className="mt-10 space-y-3">
          {[
            {
              key: "map",
              label: "Map",
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.145c.186-.1.429-.24.713-.42.567-.362 1.308-.892 2.052-1.586C14.786 15.396 16.5 13.134 16.5 10a6.5 6.5 0 1 0-13 0c0 3.134 1.714 5.396 3.12 6.771.744.694 1.485 1.224 2.052 1.586a13.73 13.73 0 0 0 .994.565l.018.008.006.003ZM10 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" /></svg>,
              content: (
                <TripMap
                  tripDestination={trip?.destination}
                  tripStart={trip?.start_date}
                  tripEnd={trip?.end_date}
                  flightOptions={flightOptions}
                  accommodationOptions={accommodationOptions}
                  activityOptions={activityOptions}
                  diningOptions={diningOptions}
                  transportOptions={transportOptions}
                />
              ),
            },
            {
              key: "checklist",
              label: "Planning Checklist",
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.99a.75.75 0 0 1 1.06 0l.97.97.97-.97a.75.75 0 1 1 1.06 1.06l-1.5 1.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 0-1.06Zm0 5.25a.75.75 0 0 1 1.06 0l.97.97.97-.97a.75.75 0 1 1 1.06 1.06l-1.5 1.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 0-1.06Zm0 5.25a.75.75 0 0 1 1.06 0l.97.97.97-.97a.75.75 0 1 1 1.06 1.06l-1.5 1.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>,
              content: <PlanningChecklist tripId={params.id} />,
            },
            {
              key: "packing",
              label: "Packing List",
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h5A1.5 1.5 0 0 1 14 4.5V5h1.5A1.5 1.5 0 0 1 17 6.5v10A1.5 1.5 0 0 1 15.5 18h-11A1.5 1.5 0 0 1 3 16.5v-10A1.5 1.5 0 0 1 4.5 5H6v-.5ZM7.5 4.5V5h5v-.5h-5Z" /></svg>,
              content: (
                <PackingList
                  tripId={params.id}
                  tripDestination={trip?.destination}
                  tripStartDate={trip?.start_date}
                  tripEndDate={trip?.end_date}
                  activityOptions={activityOptions}
                  accommodationOptions={accommodationOptions}
                />
              ),
            },
            {
              key: "documents",
              label: "Travel Documents",
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" /></svg>,
              content: <TravelDocuments tripId={params.id} />,
            },
            {
              key: "collaborators",
              label: "Collaborators",
              icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" /></svg>,
              content: (
                <TripCollaborators
                  tripId={params.id}
                  tripTitle={trip?.title}
                  userId={currentUser?.id}
                  userEmail={currentUser?.email}
                  tripOwnerId={trip?.user_id}
                />
              ),
            },
          ].map((section) => {
            const isOpen = !!expandedAccordions[section.key];
            return (
              <div key={section.key} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(180,165,140,0.3)" }}>
                <button
                  onClick={() => setExpandedAccordions((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:brightness-105 transition-all"
                >
                  <span className="text-stone-500">{section.icon}</span>
                  <span className="text-sm font-semibold text-stone-700 flex-1">{section.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="border-t" style={{ borderColor: "rgba(180,165,140,0.2)" }}>
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Day Detail Popout */}
        {selectedDay && (
          <DayPopout
            dateKey={selectedDay}
            tripId={params.id}
            dayData={days[selectedDay]}
            activities={days[selectedDay] ? (activities[days[selectedDay].id] || []) : []}
            inRange={effectiveStart && effectiveEnd && selectedDay >= effectiveStart && selectedDay <= effectiveEnd}
            onClose={() => setSelectedDay(null)}
            onUpdate={loadTrip}
          />
        )}
        {eventPopup && (
          <EventPopup
            type={eventPopup.type}
            data={eventPopup.data}
            dateKey={eventPopup.dateKey}
            rect={eventPopup.rect}
            onClose={() => setEventPopup(null)}
          />
        )}
      </main>
      <footer className="relative z-10 text-center text-xs text-stone-400 py-4">v3.1.0 — Apr 17 2026</footer>
    </div>
  );
}

function EventPopup({ type, data, dateKey, rect, onClose }) {
  const colors = {
    flight: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", label: "Flight" },
    activity: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", label: "Activity" },
    accommodation: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", label: "Accommodation" },
    dining: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", label: "Dining" },
    transportation: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", label: "Transportation" },
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
        <div className="text-sm font-semibold text-stone-800 mb-1">{data.name || data.title || `${data.departure_airport} \u2192 ${data.arrival_airport}`}</div>
        {data.departure_airport && data.arrival_airport && (
          <div className="text-xs text-stone-500 mb-1">{data.departure_airport} &rarr; {data.arrival_airport}</div>
        )}
        {data.departure_date && (
          <div className="text-xs text-stone-500">{new Date(data.departure_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
        )}
        {(data.start_time || data.scheduled_date) && (
          <div className="text-xs text-stone-500">
            {data.start_time && `${data.start_time.slice(0,5)}`}
            {data.end_time && ` \u2013 ${data.end_time.slice(0,5)}`}
          </div>
        )}
        {data.location && <div className="text-xs text-stone-500 mt-1">{"\uD83D\uDCCD"} {data.location}</div>}
        {data.location_name && <div className="text-xs text-stone-500 mt-1">{"\uD83D\uDCCD"} {data.location_name}</div>}
        {data.check_in_date && data.check_out_date && (
          <div className="text-xs text-stone-500 mt-1">
            {new Date(data.check_in_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash; {new Date(data.check_out_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}
        {data.price_per_night && <div className="text-xs text-stone-500 mt-1">${Number(data.price_per_night).toLocaleString()}/night</div>}
        {data.total_price && <div className="text-xs text-stone-500 mt-1">${Number(data.total_price).toLocaleString()}</div>}
        {data.notes && <div className="text-xs text-stone-400 mt-2 italic">{data.notes}</div>}
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

function DayPopout({ dateKey, tripId, dayData, activities, inRange, onClose, onUpdate }) {
  const [title, setTitle] = useState(dayData?.title || "");
  const [notes, setNotes] = useState(dayData?.notes || "");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("sightseeing");
  const [newNotes, setNewNotes] = useState("");
  const [editingActivity, setEditingActivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const dateFormatted = new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  async function handleSaveDay() {
    setSaving(true);
    if (dayData) {
      await supabase
        .from("days")
        .update({ title: title || null, notes: notes || null })
        .eq("id", dayData.id);
    } else {
      await supabase.from("days").insert({
        trip_id: tripId,
        date: dateKey,
        title: title || null,
        notes: notes || null,
      });
    }
    setSaving(false);
    onUpdate();
  }

  async function ensureDayExists() {
    if (dayData?.id) return dayData.id;
    const { data } = await supabase
      .from("days")
      .insert({
        trip_id: tripId,
        date: dateKey,
        title: title || null,
        notes: notes || null,
      })
      .select()
      .single();
    return data.id;
  }

  async function handleAddActivity(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dayId = await ensureDayExists();

    await supabase.from("activities").insert({
      day_id: dayId,
      title: newTitle.trim(),
      start_time: newStartTime || null,
      end_time: newEndTime || null,
      location: newLocation || null,
      category: newCategory,
      notes: newNotes || null,
      sort_order: activities.length,
    });

    setNewTitle("");
    setNewStartTime("");
    setNewEndTime("");
    setNewLocation("");
    setNewCategory("sightseeing");
    setNewNotes("");
    setShowAddForm(false);
    onUpdate();
  }

  async function handleUpdateActivity(activityId, updates) {
    await supabase.from("activities").update(updates).eq("id", activityId);
    setEditingActivity(null);
    onUpdate();
  }

  async function handleToggleActivity(activityId, currentChecked) {
    await supabase
      .from("activities")
      .update({ is_checked: !currentChecked })
      .eq("id", activityId);
    onUpdate();
  }

  async function handleDeleteActivity(activityId) {
    await supabase.from("activities").delete().eq("id", activityId);
    onUpdate();
  }

  // Sort activities by sort_order first (to respect manual reordering), then start_time
  const sortedActivities = [...activities].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
    if (a.start_time) return -1;
    if (b.start_time) return 1;
    return 0;
  });

  async function handleReorder(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const reordered = [...sortedActivities];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    // Update sort_order in DB for each activity
    const updates = reordered.map((act, i) =>
      supabase.from("activities").update({ sort_order: i }).eq("id", act.id)
    );
    await Promise.all(updates);
    onUpdate();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl border border-sky-100 w-full max-w-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-sky-50 rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-sky-900">{dateFormatted}</h2>
            {!inRange && (
              <span className="text-xs text-amber-600 font-medium">Outside trip dates</span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Day Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Day Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveDay}
              placeholder='e.g. "Beach Day" or "Rainforest Hike"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveDay}
              rows={2}
              placeholder="Any notes for this day..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Activities</label>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                >
                  + Add Activity
                </button>
              )}
            </div>

            {/* Activity List */}
            {sortedActivities.length > 0 && (
              <div className="space-y-2 mb-4">
                {sortedActivities.map((activity, idx) => {
                  const cat = getCategoryInfo(activity.category);
                  const isEditing = editingActivity === activity.id;

                  if (isEditing) {
                    return (
                      <ActivityEditForm
                        key={activity.id}
                        activity={activity}
                        onSave={(updates) => handleUpdateActivity(activity.id, updates)}
                        onCancel={() => setEditingActivity(null)}
                      />
                    );
                  }

                  return (
                    <div
                      key={activity.id}
                      draggable
                      onDragStart={() => setDragIndex(idx)}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={() => { handleReorder(dragIndex, idx); setDragIndex(null); }}
                      onDragEnd={() => setDragIndex(null)}
                      className={`flex items-start gap-3 group p-2 rounded-lg hover:bg-slate-50 transition-colors ${dragIndex === idx ? "opacity-40" : ""}`}
                    >
                      <span className="text-slate-300 cursor-grab active:cursor-grabbing mt-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Drag to reorder">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>
                      </span>
                      <input
                        type="checkbox"
                        checked={activity.is_checked}
                        onChange={() => handleToggleActivity(activity.id, activity.is_checked)}
                        className="w-4 h-4 mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm" title={cat.label}>{cat.icon}</span>
                          <span className={`text-sm font-medium ${activity.is_checked ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {activity.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          {activity.start_time && (
                            <span className="text-xs text-slate-400">
                              🕐 {activity.start_time.slice(0, 5)}
                              {activity.end_time && ` – ${activity.end_time.slice(0, 5)}`}
                            </span>
                          )}
                          {activity.location && (
                            <span className="text-xs text-slate-400">📍 {activity.location}</span>
                          )}
                        </div>
                        {activity.notes && (
                          <p className="text-xs text-slate-400 mt-1">{activity.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setEditingActivity(activity.id)}
                          className="text-slate-300 hover:text-sky-600 p-1"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-slate-300 hover:text-red-500 p-1"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Activity Form */}
            {showAddForm && (
              <form onSubmit={handleAddActivity} className="bg-sky-50 rounded-lg p-4 space-y-3 border border-sky-100">
                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Activity name *"
                    autoFocus
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-sky-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors"
                  >
                    Add Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTitle("");
                      setNewStartTime("");
                      setNewEndTime("");
                      setNewLocation("");
                      setNewCategory("sightseeing");
                      setNewNotes("");
                    }}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {sortedActivities.length === 0 && !showAddForm && (
              <p className="text-sm text-slate-400 italic">No activities yet — add something to this day!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityEditForm({ activity, onSave, onCancel }) {
  const [title, setTitle] = useState(activity.title || "");
  const [startTime, setStartTime] = useState(activity.start_time?.slice(0, 5) || "");
  const [endTime, setEndTime] = useState(activity.end_time?.slice(0, 5) || "");
  const [location, setLocation] = useState(activity.location || "");
  const [category, setCategory] = useState(activity.category || "sightseeing");
  const [notes, setNotes] = useState(activity.notes || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      title,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location || null,
      category,
      notes: notes || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-sky-50 rounded-lg p-3 space-y-2 border border-sky-100">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
        />
      </div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.icon} {cat.label}
          </option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        rows={2}
        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
      />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-sky-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-sky-700">Save</button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
      </div>
    </form>
  );
}
