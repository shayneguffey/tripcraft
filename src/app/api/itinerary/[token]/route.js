/**
 * Public Itinerary API — fetches full itinerary data by share token.
 * No authentication required. Read-only.
 *
 * GET /api/itinerary/[token]
 * Returns: { trip, itinerary, flights, accommodation, activities, dining, transportation, days, documents, checklist }
 */

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return Response.json({ error: "Missing share token" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // ─── Look up itinerary by share token ───
    const { data: itinerary, error: itinError } = await supabase
      .from("itineraries")
      .select("*")
      .eq("share_token", token)
      .maybeSingle();

    console.log("[itinerary API] token:", token, "found:", !!itinerary, "error:", itinError?.message || "none");

    if (itinError || !itinerary) {
      return Response.json({ error: "Itinerary not found", detail: itinError?.message || "No matching token" }, { status: 404 });
    }

    const tripId = itinerary.trip_id;
    const itineraryId = itinerary.id;

    // ─── Fetch trip info ───
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    console.log("[itinerary API] tripId:", tripId, "found:", !!trip, "error:", tripError?.message || "none");

    if (tripError || !trip) {
      return Response.json({ error: "Trip not found", detail: tripError?.message || "No matching trip" }, { status: 404 });
    }

    // ─── Fetch itinerary selections ───
    const { data: selections } = await supabase
      .from("itinerary_selections")
      .select("*")
      .eq("itinerary_id", itineraryId);

    const selectedIds = {};
    (selections || []).forEach((s) => {
      if (!selectedIds[s.option_type]) selectedIds[s.option_type] = new Set();
      selectedIds[s.option_type].add(s.option_id);
    });

    // ─── Fetch all option tables in parallel ───
    const [
      { data: allFlights },
      { data: allFlightLegs },
      { data: allAccommodation },
      { data: allActivities },
      { data: allDining },
      { data: allTransport },
      { data: daysData },
      { data: documents },
      { data: checklist },
    ] = await Promise.all([
      supabase.from("flight_options").select("*").eq("trip_id", tripId).order("sort_order"),
      supabase.from("flight_legs").select("*").order("leg_order"),
      supabase.from("accommodation_options").select("*").eq("trip_id", tripId).order("sort_order"),
      supabase.from("activity_options").select("*").eq("trip_id", tripId).order("sort_order"),
      supabase.from("dining_options").select("*").eq("trip_id", tripId).order("sort_order"),
      supabase.from("transportation_options").select("*").eq("trip_id", tripId).order("sort_order"),
      supabase.from("days").select("*").eq("trip_id", tripId).eq("itinerary_id", itineraryId),
      supabase.from("travel_documents").select("*").eq("trip_id", tripId).order("sort_order"),
      supabase.from("planning_checklist").select("*").eq("trip_id", tripId).order("sort_order"),
    ]);

    // ─── Filter to only selected options ───
    const flights = (allFlights || []).filter(
      (f) => selectedIds.flight?.has(f.id)
    );
    const flightIds = new Set(flights.map((f) => f.id));
    const flightLegs = (allFlightLegs || []).filter((l) => flightIds.has(l.option_id));

    // Attach legs to their flights
    const flightsWithLegs = flights.map((f) => ({
      ...f,
      legs: flightLegs.filter((l) => l.option_id === f.id).sort((a, b) => a.leg_order - b.leg_order),
    }));

    const accommodation = (allAccommodation || []).filter(
      (a) => selectedIds.accommodation?.has(a.id)
    );
    const activities = (allActivities || []).filter(
      (a) => selectedIds.activity?.has(a.id)
    );
    const dining = (allDining || []).filter(
      (d) => selectedIds.dining?.has(d.id)
    );
    const transportation = (allTransport || []).filter(
      (t) => selectedIds.transportation?.has(t.id)
    );

    // ─── Fetch activities for each day ───
    const dayIds = (daysData || []).map((d) => d.id);
    let dayActivities = [];
    if (dayIds.length > 0) {
      const { data: acts } = await supabase
        .from("activities")
        .select("*")
        .in("day_id", dayIds)
        .order("sort_order");
      dayActivities = acts || [];
    }

    // Group activities by day_id
    const activitiesByDay = {};
    dayActivities.forEach((a) => {
      if (!activitiesByDay[a.day_id]) activitiesByDay[a.day_id] = [];
      activitiesByDay[a.day_id].push(a);
    });

    // Build days with their activities
    const days = (daysData || []).map((d) => ({
      ...d,
      activities: activitiesByDay[d.id] || [],
    }));

    return Response.json({
      trip,
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        description: itinerary.description,
        num_travelers: itinerary.num_travelers,
        start_date: itinerary.start_date,
        end_date: itinerary.end_date,
      },
      flights: flightsWithLegs,
      accommodation,
      activities,
      dining,
      transportation,
      days,
      documents: documents || [],
      checklist: checklist || [],
    });
  } catch (err) {
    console.error("[itinerary] API error:", err);
    return Response.json({ error: "Failed to load itinerary" }, { status: 500 });
  }
}
